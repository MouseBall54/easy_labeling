import type { AppState } from "../app/state.js";
import { isOperationCancelledError, throwIfOperationCancelled } from "../app/operation.js";
import { parseNonNegativeClassId } from "../domain/class-id.js";
import {
  createEmptyAutomationLibrary,
  createDatasetAutomationLibrary,
  createPresetFileDocument,
  deleteLayoutFromLibrary,
  loadAutomationProfileFiles,
  loadAutomationLibrary,
  mergeAutomationLibraries,
  mergePresetFileDocument,
  resolveAutomationSelectionId,
  saveAutomationLibrary,
  upsertById
} from "../features/automation/automation-library-service.js";
import { cropImageElementToPngDataUrl, imageElementToImageData, pngDataUrlToImageData } from "../features/automation/image-data.js";
import { calculateLayoutAnchor, validateBoxLayout } from "../features/automation/layout.js";
import { parseAutomationLibrary, serializeAutomationLibrary } from "../features/automation/preset-codec.js";
import {
  createTemplateMatchingService,
  requireAcceptedMatch,
  type TemplateMatchInput,
  type TemplateMatchingService
} from "../features/automation/template-matching-service.js";
import {
  createTemplateWorkspace,
  type TemplateMatchContextRequest,
  type TemplateWorkspaceInteractionMode
} from "../features/automation/template-workspace.js";
import {
  AUTOMATION_SCHEMA_VERSION,
  TEMPLATE_SCHEMA_VERSION,
  type AutomationLibraryDocument,
  type AutomationPreset,
  type BoxLayout,
  type ExistingLabelsPolicy,
  type TemplateAsset,
  type TemplateMatchCandidate,
  type TemplateMatchResult,
} from "../features/automation/types.js";
import type { DirectoryHandleLike } from "../types/files.js";
import { createAutomationBatchController } from "./automation-batch-controller.js";
import { createAutomationLayoutPreview } from "./automation-layout-preview.js";
import { createAutomationPresetForm } from "./automation-preset-form.js";
import type { RuntimeCanvasController } from "./canvas-controller-adapter.js";
import type { RuntimeFileSystem } from "./file-system-adapter.js";
import type { RuntimeOperationHandle, RuntimeUiManager } from "./ui-manager-adapter.js";

export interface AutomationController {
  bind(): void;
  refreshLibrary(options?: { selectFirst?: boolean }): Promise<void>;
  prepareMatchingEngine(): Promise<void>;
  dispose(): void;
}

export interface AutomationWindow {
  confirm(message?: string): boolean;
  prompt(message?: string, defaultValue?: string): string | null;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
  dispatchEvent(event: Event): boolean;
  URL: Pick<typeof URL, "createObjectURL" | "revokeObjectURL">;
  openEasyLabelingLibraryFile?: (kind: EasyLabelingLibraryFileKind) => Promise<EasyLabelingLibraryFile | null>;
  listEasyLabelingLibraryFiles?: (kind: EasyLabelingLibraryFileKind) => Promise<EasyLabelingLibraryFile[]>;
  saveEasyLabelingLibraryFile?: (options: EasyLabelingLibraryFileSaveOptions) => Promise<{ filePath: string } | null>;
}

function createId(prefix: string): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readFinite(input: HTMLInputElement, field: string): number {
  const value = Number(input.value);
  if (!Number.isFinite(value)) {
    throw new Error(`${field} must be a finite number`);
  }
  return value;
}

function portableJsonFileName(name: string, fallback: string, kind: "layout" | "preset"): string {
  const stem = name.replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "") || fallback;
  return `${stem}.${kind}.json`;
}

function setSelectOptions(
  documentRef: Document,
  select: HTMLSelectElement,
  items: readonly { id: string; name: string }[],
  placeholder: string,
  selectedId = ""
): void {
  select.replaceChildren();
  const placeholderOption = documentRef.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = placeholder;
  select.appendChild(placeholderOption);
  items.forEach((item) => {
    const option = documentRef.createElement("option");
    option.value = item.id;
    option.textContent = item.name;
    option.selected = item.id === selectedId;
    select.appendChild(option);
  });
}

async function decodeDataUrlImage(dataUrl: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = dataUrl;
  await image.decode();
  return image;
}

export function createAutomationController(input: {
  state: AppState;
  canvasController: RuntimeCanvasController;
  fileSystem: RuntimeFileSystem;
  uiManager: RuntimeUiManager;
  documentRef: Document;
  windowRef: AutomationWindow;
  createMatchingService?: () => TemplateMatchingService;
}): AutomationController {
  const elements = input.uiManager.elements;
  let library = createEmptyAutomationLibrary();
  let profileLibrary = createEmptyAutomationLibrary();
  let matchingService: TemplateMatchingService | null = null;
  let matchingWarmUpPromise: Promise<void> | null = null;
  let disposed = false;
  let activePresetId: string | null = null;
  let activeTemplateDataUrl: string | null = null;
  let templateRoiDirty = false;
  let layoutGhostVisible = false;
  let layoutSelectionArmed = false;
  let layoutOperationRunning = false;
  let lastTemplateMatchResult: TemplateMatchResult | null = null;
  let contextTemplateMatchIndex: number | null = null;
  const selectedTemplateMatchIndices = new Set<number>();
  const assignedTemplateMatchClasses = new Map<number, string>();
  const layoutOperationControls: Array<HTMLInputElement | HTMLSelectElement | HTMLButtonElement> = [
    elements.layoutSetupSelect,
    elements.layoutNameInput,
    elements.layoutCaptureScopeSelect,
    elements.newBoxLayoutBtn,
    elements.saveBoxLayoutBtn,
    elements.updateBoxLayoutBtn,
    elements.previewBoxLayoutBtn,
    elements.duplicateBoxLayoutBtn,
    elements.renameBoxLayoutBtn,
    elements.deleteBoxLayoutBtn,
    elements.applyBoxLayoutBtn,
    elements.applyBoxLayoutFromSetupBtn,
    elements.exportAutomationLibraryBtn,
    elements.importAutomationLibraryBtn
  ];

  const setTemplateMatchContextError = (error: unknown | null): void => {
    elements.templateMatchContextClassInput.classList.toggle("is-invalid", error !== null);
    elements.templateMatchContextClassError.hidden = error === null;
    elements.templateMatchContextClassError.textContent = error instanceof Error ? error.message : "";
  };

  const hideTemplateMatchContextMenu = (returnFocus = false): void => {
    contextTemplateMatchIndex = null;
    setTemplateMatchContextError(null);
    elements.templateMatchContextMenu.hidden = true;
    elements.templateMatchContextMenu.classList.remove("show");
    if (returnFocus) {
      elements.templateMatchingCanvas.focus();
    }
  };

  const setMatchingEngineStatus = (state: "loading" | "ready" | "error", text: string): void => {
    elements.matchingEngineStatus.dataset.state = state;
    const labels = elements.matchingEngineStatus.querySelectorAll<HTMLElement>("span");
    const label = labels[labels.length - 1];
    if (label) {
      label.textContent = text;
    } else {
      elements.matchingEngineStatus.textContent = text;
    }
  };

  const getMatchingService = (): TemplateMatchingService => {
    if (disposed) {
      throw new Error("Automation controller disposed");
    }
    matchingService ??= input.createMatchingService?.() ?? createTemplateMatchingService();
    return matchingService;
  };

  const prepareMatchingEngine = (): Promise<void> => {
    if (matchingWarmUpPromise) {
      return matchingWarmUpPromise;
    }
    let service: TemplateMatchingService | null = null;
    setMatchingEngineStatus("loading", "Matching engine: Loading");
    matchingWarmUpPromise = Promise.resolve()
      .then(() => {
        service = getMatchingService();
        return service.warmUp();
      })
      .then(() => {
        setMatchingEngineStatus("ready", "Matching engine: Ready");
      })
      .catch((error: unknown) => {
        service?.terminate();
        if (matchingService === service) {
          matchingService = null;
        }
        matchingWarmUpPromise = null;
        const message = error instanceof Error ? error.message : "Engine initialization failed";
        elements.matchingEngineStatus.title = message;
        setMatchingEngineStatus("error", "Matching engine: Retry on use");
        throw error;
      });
    return matchingWarmUpPromise;
  };

  const matchWithRecovery = async (matchInput: TemplateMatchInput): Promise<TemplateMatchResult> => {
    try {
      return await getMatchingService().match(matchInput);
    } catch (error: unknown) {
      if (isOperationCancelledError(error)) {
        throw error;
      }
      const message = error instanceof Error ? error.message : String(error);
      if (!/worker|opencv|initializ|terminated/i.test(message)) {
        throw error;
      }
      matchingService?.terminate();
      matchingService = null;
      setMatchingEngineStatus("loading", "Matching engine: Recovering");
      const replacement = getMatchingService();
      await replacement.warmUp();
      setMatchingEngineStatus("ready", "Matching engine: Ready");
      return await replacement.match(matchInput);
    }
  };

  const runCancellableMatchingOperation = async (
    options: { title: string; detail: string; stoppedMessage: string },
    task: (operation: RuntimeOperationHandle) => Promise<void>
  ): Promise<void> => {
    const operation = input.uiManager.beginOperation({
      title: options.title,
      detail: options.detail,
      cancellable: true
    });
    const cancelMatching = (): void => matchingService?.cancelPending();
    operation.signal.addEventListener("abort", cancelMatching, { once: true });
    try {
      await task(operation);
      throwIfOperationCancelled(operation.signal);
    } catch (error: unknown) {
      if (!operation.signal.aborted && !isOperationCancelledError(error)) {
        throw error;
      }
      setMatchingEngineStatus("ready", "Matching engine: Ready");
      input.uiManager.notify(options.stoppedMessage);
    } finally {
      operation.signal.removeEventListener("abort", cancelMatching);
      operation.finish();
    }
  };

  const selectedLayout = (): BoxLayout | null => {
    return library.layouts.find((layout) => layout.id === elements.boxLayoutSelect.value) ?? null;
  };

  const selectedSetupLayout = (): BoxLayout | null => {
    return library.layouts.find((layout) => layout.id === elements.layoutSetupSelect.value) ?? null;
  };

  const selectedPreset = (): AutomationPreset | null => {
    return library.presets.find((preset) => preset.id === elements.automationPresetSelect.value) ?? null;
  };

  const layoutCaptureScope = (): "selected" | "all" => {
    return elements.layoutCaptureScopeSelect.value === "all" ? "all" : "selected";
  };

  const getLayoutCaptureCounts = (): { selected: number; all: number } => ({
    selected: input.canvasController.raw.getSelectedBoxCount(),
    all: input.canvasController.raw.getObjects("rect").length
  });

  const getLayoutCaptureCount = (): number => {
    const counts = getLayoutCaptureCounts();
    return layoutCaptureScope() === "all" ? counts.all : counts.selected;
  };

  const requireUniqueLayoutName = (name: string, exceptLayoutId?: string): string => {
    const normalizedName = name.trim();
    if (!normalizedName) {
      throw new Error("Layout name is required");
    }
    const duplicate = library.layouts.find((layout) => (
      layout.id !== exceptLayoutId && layout.name.trim().toLocaleLowerCase() === normalizedName.toLocaleLowerCase()
    ));
    if (duplicate) {
      throw new Error(`A layout named "${normalizedName}" already exists`);
    }
    return normalizedName;
  };

  const captureCurrentLayout = (name: string): BoxLayout => {
    return input.canvasController.raw.captureBoxLayout(
      name,
      input.state.session.currentImageFile?.name ?? "",
      layoutCaptureScope()
    );
  };

  const syncLayoutEditorState = (): void => {
    const layout = selectedSetupLayout();
    const counts = getLayoutCaptureCounts();
    const selectedOption = elements.layoutCaptureScopeSelect.querySelector<HTMLOptionElement>('option[value="selected"]');
    const allOption = elements.layoutCaptureScopeSelect.querySelector<HTMLOptionElement>('option[value="all"]');
    if (selectedOption) {
      selectedOption.textContent = `Selected Boxes (${counts.selected})`;
    }
    if (allOption) {
      allOption.textContent = `All Boxes (${counts.all})`;
    }

    const captureCount = getLayoutCaptureCount();
    const hasName = elements.layoutNameInput.value.trim().length > 0;
    elements.layoutEditorTitle.textContent = layout ? "Edit layout" : "New layout";
    elements.layoutEditorModeBadge.textContent = layout ? "Editing" : "New";
    elements.layoutEditorModeBadge.dataset.state = layout ? "editing" : "new";
    elements.layoutCaptureSummary.textContent = `Selected: ${counts.selected} / Total: ${counts.all} · Capturing: ${captureCount}`;
    elements.saveBoxLayoutBtn.disabled = layout !== null || !hasName || captureCount === 0;
    elements.updateBoxLayoutBtn.disabled = layout === null || !hasName || captureCount === 0;
    elements.duplicateBoxLayoutBtn.disabled = layout === null;
    elements.renameBoxLayoutBtn.disabled = layout === null;
    elements.deleteBoxLayoutBtn.disabled = layout === null;
    elements.applyBoxLayoutFromSetupBtn.disabled = layout === null;
    if (layoutOperationRunning) {
      layoutOperationControls.forEach((control) => {
        control.disabled = true;
      });
    }
  };

  const enterNewLayoutMode = (): void => {
    const counts = getLayoutCaptureCounts();
    elements.layoutSetupSelect.value = "";
    elements.layoutNameInput.value = "";
    elements.layoutCaptureScopeSelect.value = counts.selected > 0 ? "selected" : "all";
    setLayoutSetupError(null);
    setLayoutOperationStatus("idle", "Ready to save a new layout");
    syncLayoutEditorState();
    renderLayoutPreview();
    elements.layoutNameInput.focus();
  };

  const layoutPreview = createAutomationLayoutPreview({
    state: input.state,
    elements,
    canvasController: input.canvasController,
    getSelectedLayout: selectedLayout,
    getSelectedSetupLayout: selectedSetupLayout,
    getGhostVisible: () => layoutGhostVisible
  });
  const renderLayoutGhostPreview = (): void => layoutPreview.renderGhost();
  const clearLayoutGhostPreview = (): void => layoutPreview.clearGhost();
  const renderLayoutPreview = (): void => layoutPreview.renderLibraryPreview();

  const refreshSelects = (selection?: { layoutId?: string; presetId?: string }): void => {
    const layoutId = selection?.layoutId ?? elements.boxLayoutSelect.value;
    const presetId = selection?.presetId ?? elements.automationPresetSelect.value;
    setSelectOptions(input.documentRef, elements.boxLayoutSelect, library.layouts, "Choose layout...", layoutId);
    setSelectOptions(input.documentRef, elements.layoutSetupSelect, library.layouts, "Choose layout...", layoutId);
    setSelectOptions(input.documentRef, elements.templateLayoutSelect, library.layouts, "Choose layout...", layoutId);
    setSelectOptions(input.documentRef, elements.automationPresetSelect, library.presets, "Choose preset...", presetId);
    setSelectOptions(input.documentRef, elements.templatePresetSelect, library.presets, "New preset...", presetId);
    elements.applyBoxLayoutBtn.disabled = !library.layouts.some((layout) => layout.id === layoutId);
    elements.applyBoxLayoutFromSetupBtn.disabled = elements.applyBoxLayoutBtn.disabled;
    elements.exportAutomationPresetBtn.disabled = !library.presets.some((preset) => preset.id === presetId);
    syncLayoutEditorState();
    renderLayoutGhostPreview();
  };

  const refreshSourceImageSelect = (): void => {
    const selectedName = input.state.session.currentImageFile?.name ?? "";
    elements.templateSourceImageSelect.replaceChildren();
    input.state.session.imageFiles.forEach((file) => {
      const option = input.documentRef.createElement("option");
      option.value = file.name;
      option.textContent = file.name;
      option.selected = file.name === selectedName;
      elements.templateSourceImageSelect.appendChild(option);
    });
  };

  const persistLibrary = async (): Promise<void> => {
    const folder = input.state.session.imageFolderHandle;
    if (!folder) {
      throw new Error("Load an image folder before saving automation settings");
    }
    await saveAutomationLibrary(
      folder as unknown as DirectoryHandleLike,
      createDatasetAutomationLibrary(library, profileLibrary)
    );
  };

  const downloadJsonFile = (contents: string, fileName: string): void => {
    const blob = new Blob([contents], { type: "application/json" });
    const url = input.windowRef.URL.createObjectURL(blob);
    const anchor = input.documentRef.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    input.windowRef.URL.revokeObjectURL(url);
  };

  const saveJsonFile = async (
    kind: EasyLabelingLibraryFileKind,
    contents: string,
    fileName: string
  ): Promise<void> => {
    if (input.windowRef.saveEasyLabelingLibraryFile) {
      const result = await input.windowRef.saveEasyLabelingLibraryFile({
        kind,
        suggestedName: fileName,
        contents
      });
      if (result) {
        input.uiManager.notify(`Saved to ${result.filePath}`, 5000);
      }
      return;
    }
    downloadJsonFile(contents, fileName);
  };

  const setLayoutSetupError = (error: unknown | null): void => {
    elements.layoutSetupError.hidden = error === null;
    elements.layoutSetupError.textContent = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  };

  const setLayoutOperationStatus = (
    state: "idle" | "busy" | "success" | "error",
    message: string
  ): void => {
    elements.layoutOperationStatus.dataset.state = state;
    const label = elements.layoutOperationStatus.querySelector<HTMLElement>("span:last-child");
    if (label) {
      label.textContent = message;
    } else {
      elements.layoutOperationStatus.textContent = message;
    }
  };

  const yieldToUi = (): Promise<void> => new Promise((resolve) => {
    globalThis.setTimeout(resolve, 0);
  });

  const runLayoutOperation = async (
    sourceButton: HTMLButtonElement,
    pendingMessage: string,
    fallbackErrorMessage: string,
    operation: () => Promise<string> | string
  ): Promise<void> => {
    if (layoutOperationRunning) {
      return;
    }
    layoutOperationRunning = true;
    const disabledStates = layoutOperationControls.map((control) => control.disabled);
    layoutOperationControls.forEach((control) => {
      control.disabled = true;
    });
    sourceButton.setAttribute("aria-busy", "true");
    setLayoutSetupError(null);
    setLayoutOperationStatus("busy", pendingMessage);
    try {
      await yieldToUi();
      const successMessage = await operation();
      setLayoutOperationStatus("success", successMessage);
    } catch (error: unknown) {
      setLayoutSetupError(error);
      setLayoutOperationStatus(
        "error",
        error instanceof Error ? error.message : fallbackErrorMessage
      );
      input.uiManager.notify(error instanceof Error ? error.message : fallbackErrorMessage, 5000);
    } finally {
      layoutOperationRunning = false;
      layoutOperationControls.forEach((control, index) => {
        control.disabled = disabledStates[index] ?? false;
      });
      sourceButton.removeAttribute("aria-busy");
      syncLayoutEditorState();
      elements.applyBoxLayoutBtn.disabled = selectedLayout() === null;
      elements.applyBoxLayoutFromSetupBtn.disabled = selectedSetupLayout() === null;
    }
  };

  const enterCanvasEditMode = (): void => {
    elements.drawModeBtn.checked = false;
    elements.editModeBtn.checked = true;
    input.canvasController.raw.setMode("edit");
  };

  const showAppliedAnnotationsInTransform = (): void => {
    input.uiManager.setActiveTask("annotate");
    input.uiManager.setInspectorTab("transform");
    input.uiManager.updateLabelList();
    input.uiManager.syncWorkspaceState();
  };

  const applyLayout = (layout: BoxLayout): string => {
    enterCanvasEditMode();
    const result = input.canvasController.raw.applyBoxLayout(layout, { ...layout.sourceAnchor });
    layoutGhostVisible = false;
    clearLayoutGhostPreview();
    const discarded = result.discardedOutOfBoundsCount > 0
      ? ` ${result.discardedOutOfBoundsCount} outside the image removed.`
      : "";
    const message = `${result.annotationIds.length} boxes applied.${discarded}`;
    elements.layoutPlacementNotice.textContent = `${message} Undo is available.`;
    elements.layoutPlacementNotice.dataset.state = "applied";
    input.windowRef.dispatchEvent(new Event("easy-labeling:history-change"));
    showAppliedAnnotationsInTransform();
    return message;
  };

  const showSettingsError = (error: unknown): void => {
    elements.templateSettingsError.hidden = false;
    elements.templateSettingsError.textContent = error instanceof Error ? error.message : "Unable to update template settings";
  };

  const clearSettingsError = (): void => {
    elements.templateSettingsError.hidden = true;
    elements.templateSettingsError.textContent = "";
  };

  const presetForm = createAutomationPresetForm(elements);
  const readPreprocessing = presetForm.readPreprocessing;
  const readMatching = presetForm.readMatching;
  const readOutputMode = presetForm.readOutputMode;
  const readMultipleDetection = presetForm.readMultipleDetection;
  const syncOutputModeUi = presetForm.syncOutputMode;

  const invalidateTemplateMatch = (): void => {
    hideTemplateMatchContextMenu();
    lastTemplateMatchResult = null;
    selectedTemplateMatchIndices.clear();
    assignedTemplateMatchClasses.clear();
    elements.applyTemplateMatchBtn.disabled = true;
    elements.assignTemplateMatchClassBtn.disabled = true;
    elements.templateMatchSelectionSummary.textContent = "0 selected";
    presetForm.clearResult();
    workspace.setMatchResults([]);
    workspace.setLayoutPreview(null);
  };

  const workspace = createTemplateWorkspace({
    canvas: elements.templateMatchingCanvas,
    scroller: elements.templateWorkspaceScroller,
    stage: elements.templateWorkspaceStage,
    zoomInput: elements.templateWorkspaceZoomInput,
    zoomValue: elements.templateWorkspaceZoomValue,
    originalPreviewCanvas: elements.templateOriginalPreviewCanvas,
    processedPreviewCanvas: elements.templateProcessedPreviewCanvas,
    onMatchClicked: (index) => toggleTemplateMatchSelection(index),
    onMatchContextRequested: (request) => showTemplateMatchContextMenu(request),
    onRoiChanged: (roi) => {
      templateRoiDirty = true;
      activeTemplateDataUrl = null;
      invalidateTemplateMatch();
      setTemplateInteractionMode("edit-roi");
      const layout = library.layouts.find((candidate) => candidate.id === elements.templateLayoutSelect.value);
      if (layout) {
        elements.templateRelationXInput.value = String(Math.round(layout.sourceAnchor.x - roi.x));
        elements.templateRelationYInput.value = String(Math.round(layout.sourceAnchor.y - roi.y));
      }
      try {
        workspace.renderPreviews(readPreprocessing());
        clearSettingsError();
      } catch (error: unknown) {
        showSettingsError(error);
      }
    }
  });

  function setTemplateInteractionMode(mode: TemplateWorkspaceInteractionMode): void {
    const hasRoi = workspace.getRoi() !== null;
    const resolvedMode = mode === "edit-roi" && !hasRoi ? "template-roi" : mode;
    elements.templatePointerEditRoiRadio.disabled = !hasRoi;
    elements.templatePointerRoiRadio.checked = resolvedMode === "template-roi";
    elements.templatePointerEditRoiRadio.checked = resolvedMode === "edit-roi";
    elements.templatePointerSelectRadio.checked = resolvedMode === "select-results";
    workspace.setInteractionMode(resolvedMode);
  }

  const syncTemplateLayoutOpacity = (): void => {
    const percent = Math.max(0, Math.min(60, Number(elements.templateLayoutOpacityInput.value) || 0));
    elements.templateLayoutOpacityInput.value = String(percent);
    elements.templateLayoutOpacityValue.textContent = `${Math.round(percent)}%`;
    workspace.setLayoutPreviewOpacity(percent / 100);
  };

  const formatOffset = (value: number): string => Number.isInteger(value) ? String(value) : value.toFixed(2);

  const renderTemplateLayoutPreview = (): void => {
    const result = lastTemplateMatchResult;
    if (!result || readOutputMode() !== "layout-best-match") {
      workspace.setLayoutPreview(null);
      return;
    }

    const baseCoordinates = `Best ${(result.score * 100).toFixed(2)}% at X ${result.x}, Y ${result.y}`;
    const layout = library.layouts.find((candidate) => candidate.id === elements.templateLayoutSelect.value);
    if (!layout) {
      workspace.setLayoutPreview(null);
      elements.templateMatchCoordinates.textContent = `${baseCoordinates} | Choose a layout to preview`;
      elements.applyTemplateMatchBtn.disabled = true;
      return;
    }

    let relationOffset: { x: number; y: number };
    let manualOffset: { x: number; y: number };
    try {
      relationOffset = {
        x: readFinite(elements.templateRelationXInput, "Anchor Offset X"),
        y: readFinite(elements.templateRelationYInput, "Anchor Offset Y")
      };
      manualOffset = {
        x: readFinite(elements.templateManualXInput, "Final Adjustment X"),
        y: readFinite(elements.templateManualYInput, "Final Adjustment Y")
      };
    } catch {
      workspace.setLayoutPreview(null);
      elements.templateMatchCoordinates.textContent = `${baseCoordinates} | Enter valid layout offsets to preview`;
      elements.applyTemplateMatchBtn.disabled = true;
      return;
    }

    const anchor = calculateLayoutAnchor(result, { relationOffset, manualOffset });
    workspace.setLayoutPreview({
      matchPoint: { x: result.x, y: result.y },
      anchor,
      boxes: layout.boxes.map((box) => ({
        classId: box.classId,
        x: anchor.x + box.relativeX,
        y: anchor.y + box.relativeY,
        width: box.width,
        height: box.height
      }))
    });
    elements.templateMatchCoordinates.textContent = [
      baseCoordinates,
      `Layout ${layout.name}`,
      `Anchor offset (${formatOffset(relationOffset.x)}, ${formatOffset(relationOffset.y)})`,
      `Final (${formatOffset(manualOffset.x)}, ${formatOffset(manualOffset.y)})`,
      `Anchor X ${formatOffset(anchor.x)}, Y ${formatOffset(anchor.y)}`
    ].join(" | ");
    elements.applyTemplateMatchBtn.disabled = result.score < Number(elements.templateMinimumScoreInput.value);
  };

  const selectedMatchScope = (): boolean => elements.templateApplySelectedMatchesRadio.checked;

  const effectiveCandidateClassId = (index: number): string | null => {
    const assignedClassId = assignedTemplateMatchClasses.get(index);
    if (assignedClassId) {
      return assignedClassId;
    }
    if (!selectedMatchScope()) {
      return elements.templateMultipleClassIdInput.value.trim() || null;
    }
    return assignedTemplateMatchClasses.get(index)
      ?? (selectedTemplateMatchIndices.has(index) ? elements.templateMultipleClassIdInput.value.trim() || null : null);
  };

  const renderMultipleMatchSelection = (): void => {
    const candidates = lastTemplateMatchResult?.matches ?? [];
    const selectedScope = selectedMatchScope();
    elements.templateMatchSelectionControls.hidden = !selectedScope;
    elements.templateMatchSelectionSummary.textContent = `${selectedTemplateMatchIndices.size} selected · ${assignedTemplateMatchClasses.size} assigned`;
    elements.selectAllTemplateMatchesBtn.disabled = candidates.length === 0 || selectedTemplateMatchIndices.size === candidates.length;
    elements.clearTemplateMatchSelectionBtn.disabled = selectedTemplateMatchIndices.size === 0;
    elements.assignTemplateMatchClassBtn.disabled = !selectedScope || selectedTemplateMatchIndices.size === 0;
    elements.applyTemplateMatchBtn.disabled = candidates.length === 0
      || (selectedScope && selectedTemplateMatchIndices.size === 0);

    elements.templateMatchCandidates.replaceChildren();
    candidates.forEach((candidate, index) => {
      const row = input.documentRef.createElement("label");
      row.className = "template-match-candidate-row";
      row.classList.toggle("selected", selectedScope && selectedTemplateMatchIndices.has(index));
      row.dataset.matchIndex = String(index);
      row.dataset.testid = `template-match-candidate-${index}`;
      row.dataset.matchX = String(candidate.x);
      row.dataset.matchY = String(candidate.y);
      row.dataset.matchWidth = String(candidate.width);
      row.dataset.matchHeight = String(candidate.height);

      const checkbox = input.documentRef.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "form-check-input";
      checkbox.checked = selectedScope && selectedTemplateMatchIndices.has(index);
      checkbox.dataset.testid = `template-match-select-${index}`;
      checkbox.setAttribute("aria-label", `Select match ${index + 1}`);
      checkbox.addEventListener("change", () => {
        if (!selectedMatchScope()) {
          elements.templateApplySelectedMatchesRadio.checked = true;
          elements.templateApplyAllMatchesRadio.checked = false;
          selectedTemplateMatchIndices.clear();
        }
        if (checkbox.checked) {
          selectedTemplateMatchIndices.add(index);
        } else {
          selectedTemplateMatchIndices.delete(index);
        }
        renderMultipleMatchSelection();
      });

      const details = input.documentRef.createElement("span");
      details.className = "template-match-candidate-details";
      details.textContent = `${index + 1}. ${(candidate.score * 100).toFixed(2)}% · X ${candidate.x}, Y ${candidate.y} · ${candidate.width} x ${candidate.height}`;
      row.append(checkbox, details);

      const classId = effectiveCandidateClassId(index);
      if (classId) {
        const badge = input.documentRef.createElement("span");
        badge.className = "template-match-class-badge";
        badge.dataset.assigned = String(assignedTemplateMatchClasses.has(index));
        badge.textContent = `Class ${classId}`;
        row.appendChild(badge);
      }
      row.addEventListener("click", () => workspace.focusMatch(index));
      row.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        showTemplateMatchContextMenu({
          matchIndex: index,
          clientX: event.clientX,
          clientY: event.clientY
        });
      });
      elements.templateMatchCandidates.appendChild(row);
    });

    workspace.setMatchResults(candidates.map((candidate, index) => ({
      candidate,
      selected: selectedScope && selectedTemplateMatchIndices.has(index),
      classId: effectiveCandidateClassId(index)
    })));
  };

  function toggleTemplateMatchSelection(index: number): void {
    const candidates = lastTemplateMatchResult?.matches ?? [];
    if (readOutputMode() !== "multiple-detection-boxes" || !candidates[index]) {
      return;
    }
    if (!selectedMatchScope()) {
      elements.templateApplySelectedMatchesRadio.checked = true;
      elements.templateApplyAllMatchesRadio.checked = false;
      selectedTemplateMatchIndices.clear();
      selectedTemplateMatchIndices.add(index);
    } else if (selectedTemplateMatchIndices.has(index)) {
      selectedTemplateMatchIndices.delete(index);
    } else {
      selectedTemplateMatchIndices.add(index);
    }
    renderMultipleMatchSelection();
  }

  function showTemplateMatchContextMenu(request: TemplateMatchContextRequest): void {
    hideTemplateMatchContextMenu();
    const candidate = request.matchIndex === null ? null : lastTemplateMatchResult?.matches[request.matchIndex];
    if (!candidate || request.matchIndex === null || workspace.getInteractionMode() !== "select-results") {
      return;
    }

    contextTemplateMatchIndex = request.matchIndex;
    elements.templateMatchContextSummary.textContent = `#${request.matchIndex + 1} · X ${candidate.x}, Y ${candidate.y}`;
    elements.templateMatchContextClassInput.value = assignedTemplateMatchClasses.get(request.matchIndex)
      ?? elements.templateMultipleClassIdInput.value.trim();
    setTemplateMatchContextError(null);
    elements.templateMatchContextMenu.hidden = false;
    elements.templateMatchContextMenu.classList.add("show");

    const menuBounds = elements.templateMatchContextMenu.getBoundingClientRect();
    const viewportWidth = input.documentRef.documentElement.clientWidth;
    const viewportHeight = input.documentRef.documentElement.clientHeight;
    const left = Math.max(8, Math.min(request.clientX, viewportWidth - menuBounds.width - 8));
    const top = Math.max(8, Math.min(request.clientY, viewportHeight - menuBounds.height - 8));
    elements.templateMatchContextMenu.style.left = `${left}px`;
    elements.templateMatchContextMenu.style.top = `${top}px`;
    elements.templateMatchContextClassInput.focus();
    elements.templateMatchContextClassInput.select();
  }

  const assignContextTemplateMatchClass = (): void => {
    const index = contextTemplateMatchIndex;
    if (index === null || !lastTemplateMatchResult?.matches[index]) {
      hideTemplateMatchContextMenu();
      return;
    }
    let classId: string;
    try {
      classId = parseNonNegativeClassId(elements.templateMatchContextClassInput.value);
    } catch (error: unknown) {
      setTemplateMatchContextError(error);
      elements.templateMatchContextClassInput.focus();
      return;
    }
    elements.templateMatchContextClassInput.value = classId;
    assignedTemplateMatchClasses.set(index, classId);
    setTemplateMatchContextError(null);
    clearSettingsError();
    renderMultipleMatchSelection();
    hideTemplateMatchContextMenu(true);
  };

  const deleteContextTemplateMatch = (): void => {
    const index = contextTemplateMatchIndex;
    const result = lastTemplateMatchResult;
    if (index === null || !result?.matches[index]) {
      hideTemplateMatchContextMenu();
      return;
    }

    const matches = result.matches.filter((_, candidateIndex) => candidateIndex !== index);
    const remappedSelected = [...selectedTemplateMatchIndices]
      .filter((candidateIndex) => candidateIndex !== index)
      .map((candidateIndex) => candidateIndex > index ? candidateIndex - 1 : candidateIndex);
    const remappedClasses = [...assignedTemplateMatchClasses.entries()]
      .filter(([candidateIndex]) => candidateIndex !== index)
      .map(([candidateIndex, classId]) => [candidateIndex > index ? candidateIndex - 1 : candidateIndex, classId] as const);
    selectedTemplateMatchIndices.clear();
    remappedSelected.forEach((candidateIndex) => selectedTemplateMatchIndices.add(candidateIndex));
    assignedTemplateMatchClasses.clear();
    remappedClasses.forEach(([candidateIndex, classId]) => assignedTemplateMatchClasses.set(candidateIndex, classId));

    const best = matches.reduce<TemplateMatchCandidate | null>((current, candidate) => (
      !current || candidate.score > current.score ? candidate : current
    ), null);
    lastTemplateMatchResult = best
      ? { ...result, score: best.score, x: best.x, y: best.y, width: best.width, height: best.height, matches }
      : { ...result, matches };
    elements.templateMatchScore.textContent = `${matches.length} match${matches.length === 1 ? "" : "es"}`;
    elements.templateMatchCoordinates.textContent = best
      ? `Best ${(best.score * 100).toFixed(2)}% at X ${best.x}, Y ${best.y}`
      : "No matches remain";
    elements.templateMatchScore.classList.toggle("text-danger", matches.length === 0);
    elements.templateMatchScore.classList.toggle("text-success", matches.length > 0);
    hideTemplateMatchContextMenu();
    renderMultipleMatchSelection();
    elements.templateMatchingCanvas.focus();
  };

  const toggleTemplateInteractionMode = (): void => {
    hideTemplateMatchContextMenu();
    if (workspace.getInteractionMode() === "select-results") {
      return;
    }
    if (workspace.getInteractionMode() === "edit-roi") {
      setTemplateInteractionMode("template-roi");
      return;
    }
    setTemplateInteractionMode("edit-roi");
  };

  const renderSingleMatchResult = (candidate: TemplateMatchCandidate): void => {
    elements.templateMatchSelectionControls.hidden = true;
    elements.templateMatchCandidates.replaceChildren();
    workspace.setMatchResults([{ candidate, selected: true, classId: null }]);
  };

  const resetPresetForm = (): void => {
    activePresetId = null;
    activeTemplateDataUrl = null;
    templateRoiDirty = false;
    elements.exportAutomationPresetBtn.disabled = true;
    elements.templatePresetSelect.value = "";
    presetForm.reset(elements.boxLayoutSelect.value);
    invalidateTemplateMatch();
    clearSettingsError();
    if (input.state.session.currentImage) {
      workspace.setImage(input.state.session.currentImage);
      setTemplateInteractionMode("template-roi");
    }
  };

  const loadPresetForm = async (preset: AutomationPreset): Promise<void> => {
    const template = library.templates.find((candidate) => candidate.id === preset.templateId);
    if (!template) {
      throw new Error("The selected preset references a missing template");
    }
    activePresetId = preset.id;
    elements.exportAutomationPresetBtn.disabled = false;
    elements.automationPresetSelect.value = preset.id;
    elements.templatePresetSelect.value = preset.id;
    activeTemplateDataUrl = template.pngDataUrl;
    templateRoiDirty = false;
    presetForm.load(preset, template);
    if (preset.layoutId && library.layouts.some((layout) => layout.id === preset.layoutId)) {
      elements.boxLayoutSelect.value = preset.layoutId;
      elements.layoutSetupSelect.value = preset.layoutId;
      elements.applyBoxLayoutBtn.disabled = false;
    }
    if (input.state.session.currentImage) {
      workspace.setImage(input.state.session.currentImage, template.roi);
      setTemplateInteractionMode("edit-roi");
    }
    const storedImage = await decodeDataUrlImage(template.pngDataUrl);
    workspace.setStoredTemplateImage(storedImage);
    workspace.renderPreviews(template.preprocessing);
    invalidateTemplateMatch();
    clearSettingsError();
  };

  const testMatch = async (operation: RuntimeOperationHandle): Promise<void> => {
    const targetImage = input.state.session.currentImage;
    const roi = workspace.getRoi();
    if (!targetImage || !roi) {
      throw new Error("Load an image and draw a template ROI first");
    }
    const preprocessing = readPreprocessing();
    const matching = readMatching();
    const outputMode = readOutputMode();
    const multipleDetection = readMultipleDetection();
    operation.update({ detail: "Preparing template and image pixels" });
    const templateDataUrl = activeTemplateDataUrl ?? cropImageElementToPngDataUrl(targetImage, roi, input.documentRef);
    const templateImageData = await pngDataUrlToImageData(templateDataUrl, input.documentRef);
    throwIfOperationCancelled(operation.signal);
    operation.update({ detail: "Running OpenCV template matching" });
    const result = await matchWithRecovery({
      target: imageElementToImageData(targetImage, input.documentRef),
      template: templateImageData,
      preprocessing,
      matching,
      outputMode,
      multipleDetection
    });
    throwIfOperationCancelled(operation.signal);
    operation.update({ detail: "Rendering match results" });
    lastTemplateMatchResult = result;
    selectedTemplateMatchIndices.clear();
    assignedTemplateMatchClasses.clear();
    workspace.renderPreviews(preprocessing);
    const accepted = result.score >= matching.minimumScore;
    if (outputMode === "multiple-detection-boxes") {
      renderMultipleMatchSelection();
      if (result.matches.length > 0) {
        setTemplateInteractionMode("select-results");
      }
    } else {
      elements.applyTemplateMatchBtn.disabled = !accepted;
      renderSingleMatchResult(result);
    }
    elements.templateMatchScore.textContent = outputMode === "multiple-detection-boxes"
      ? `${result.matches.length} match${result.matches.length === 1 ? "" : "es"}`
      : `${(result.score * 100).toFixed(2)}%`;
    elements.templateMatchCoordinates.textContent = `Best ${(result.score * 100).toFixed(2)}% at X ${result.x}, Y ${result.y}`;
    elements.templateMatchTimings.textContent = `OpenCV init ${result.timings.engineInitializationMs.toFixed(1)} ms | Match ${result.timings.matchingMs.toFixed(1)} ms | Worker ${result.timings.workerTotalMs.toFixed(1)} ms | Round trip ${result.timings.roundTripMs.toFixed(1)} ms${result.templateCacheHit ? " | Template cache hit" : ""}`;
    elements.templateMatchScore.classList.toggle("text-danger", !accepted || (outputMode === "multiple-detection-boxes" && result.matches.length === 0));
    elements.templateMatchScore.classList.toggle("text-success", accepted && (outputMode !== "multiple-detection-boxes" || result.matches.length > 0));
    renderTemplateLayoutPreview();
  };

  const applyTemplateResult = (): void => {
    const result = lastTemplateMatchResult;
    if (!result) {
      throw new Error("Test the template match before applying a result");
    }
    const outputMode = readOutputMode();
    const policy = elements.templateExistingPolicySelect.value as ExistingLabelsPolicy;
    const existingCount = input.canvasController.raw.getObjects("rect").length;
    if (policy === "skip" && existingCount > 0) {
      throw new Error("The current image already has Detection labels");
    }
    if (policy === "replace" && existingCount > 0 && !input.windowRef.confirm("Replace existing Detection labels on the current image?")) {
      return;
    }
    let discardedOutOfBoundsCount = 0;
    if (outputMode === "multiple-detection-boxes") {
      const multiple = readMultipleDetection();
      const matchesToApply = result.matches.flatMap((candidate, index) => {
        if (selectedMatchScope() && !selectedTemplateMatchIndices.has(index)) {
          return [];
        }
        return [{
          classId: assignedTemplateMatchClasses.get(index) ?? multiple.classId,
          x: candidate.x,
          y: candidate.y,
          width: candidate.width,
          height: candidate.height
        }];
      });
      if (matchesToApply.length === 0) {
        throw new Error(selectedMatchScope()
          ? "Select at least one match to apply"
          : "No non-overlapping matches are available to apply");
      }
      enterCanvasEditMode();
      const application = input.canvasController.raw.applyDetectionBoxes(matchesToApply, { replaceExisting: policy === "replace" });
      discardedOutOfBoundsCount = application.discardedOutOfBoundsCount;
    } else {
      requireAcceptedMatch(result, readMatching().minimumScore);
      const layout = library.layouts.find((candidate) => candidate.id === elements.templateLayoutSelect.value);
      if (!layout) {
        throw new Error("Choose a box layout for this result");
      }
      const temporaryPreset: AutomationPreset = {
        schemaVersion: AUTOMATION_SCHEMA_VERSION,
        id: "preview",
        name: "preview",
        templateId: "preview",
        layoutId: layout.id,
        outputMode,
        relationOffset: {
          x: readFinite(elements.templateRelationXInput, "Relation X"),
          y: readFinite(elements.templateRelationYInput, "Relation Y")
        },
        manualOffset: {
          x: readFinite(elements.templateManualXInput, "Manual X"),
          y: readFinite(elements.templateManualYInput, "Manual Y")
        },
        matching: readMatching(),
        multipleDetection: readMultipleDetection(),
        existingLabelsPolicy: policy,
        createdAt: "",
        updatedAt: ""
      };
      enterCanvasEditMode();
      const application = input.canvasController.raw.applyBoxLayout(layout, calculateLayoutAnchor(result, temporaryPreset), {
        replaceExisting: policy === "replace"
      });
      discardedOutOfBoundsCount = application.discardedOutOfBoundsCount;
    }
    layoutGhostVisible = false;
    clearLayoutGhostPreview();
    workspace.setLayoutPreview(null);
    input.windowRef.dispatchEvent(new Event("easy-labeling:history-change"));
    showAppliedAnnotationsInTransform();
    input.uiManager.notify(discardedOutOfBoundsCount > 0
      ? `Template match result applied. ${discardedOutOfBoundsCount} out-of-bounds box${discardedOutOfBoundsCount === 1 ? " was" : "es were"} removed.`
      : "Template match result applied.");
  };

  const savePreset = async (): Promise<void> => {
    const targetImage = input.state.session.currentImage;
    const currentFile = input.state.session.currentImageFile;
    const roi = workspace.getRoi();
    const layout = library.layouts.find((candidate) => candidate.id === elements.templateLayoutSelect.value);
    const outputMode = readOutputMode();
    const name = elements.templateNameInput.value.trim();
    if (!targetImage || !currentFile || !roi) {
      throw new Error("Load a representative image and draw a template ROI");
    }
    if (outputMode === "layout-best-match" && !layout) {
      throw new Error("Choose a box layout for this preset");
    }
    if (!name) {
      throw new Error("Preset name is required");
    }

    const preprocessing = readPreprocessing();
    const matching = readMatching();
    const multipleDetection = readMultipleDetection();
    const existingPreset = activePresetId ? library.presets.find((preset) => preset.id === activePresetId) : null;
    const existingTemplate = existingPreset
      ? library.templates.find((template) => template.id === existingPreset.templateId)
      : null;
    const now = new Date().toISOString();
    const templateId = existingTemplate?.id ?? createId("template");
    const template: TemplateAsset = {
      schemaVersion: TEMPLATE_SCHEMA_VERSION,
      id: templateId,
      name,
      sourceImageName: templateRoiDirty || !existingTemplate ? currentFile.name : existingTemplate.sourceImageName,
      sourceImageSize: templateRoiDirty || !existingTemplate
        ? { width: targetImage.naturalWidth || targetImage.width, height: targetImage.naturalHeight || targetImage.height }
        : existingTemplate.sourceImageSize,
      roi,
      pngDataUrl: activeTemplateDataUrl ?? cropImageElementToPngDataUrl(targetImage, roi, input.documentRef),
      preprocessing,
      createdAt: existingTemplate?.createdAt ?? now,
      updatedAt: now
    };
    const preset: AutomationPreset = {
      schemaVersion: AUTOMATION_SCHEMA_VERSION,
      id: existingPreset?.id ?? createId("preset"),
      name,
      templateId,
      layoutId: outputMode === "layout-best-match" ? layout?.id ?? null : null,
      outputMode,
      relationOffset: {
        x: readFinite(elements.templateRelationXInput, "Relation X"),
        y: readFinite(elements.templateRelationYInput, "Relation Y")
      },
      manualOffset: {
        x: readFinite(elements.templateManualXInput, "Manual X"),
        y: readFinite(elements.templateManualYInput, "Manual Y")
      },
      matching,
      multipleDetection,
      existingLabelsPolicy: elements.templateExistingPolicySelect.value as ExistingLabelsPolicy,
      createdAt: existingPreset?.createdAt ?? now,
      updatedAt: now
    };

    library = {
      ...library,
      templates: upsertById(library.templates, template),
      presets: upsertById(library.presets, preset)
    };
    await persistLibrary();
    activePresetId = preset.id;
    activeTemplateDataUrl = template.pngDataUrl;
    templateRoiDirty = false;
    refreshSelects({ layoutId: layout?.id ?? elements.boxLayoutSelect.value, presetId: preset.id });
    input.uiManager.notify("Automation preset saved.");
  };

  const runSelectedPresetOnCurrentImage = async (operation: RuntimeOperationHandle): Promise<void> => {
    const preset = selectedPreset();
    const targetImage = input.state.session.currentImage;
    if (!preset) {
      throw new Error("Choose an automation preset first");
    }
    if (!targetImage || !input.state.session.currentImageFile) {
      throw new Error("Load an image before running template automation");
    }
    if (input.state.session.workflow !== "detection") {
      throw new Error("Template automation is only available in Detection mode");
    }
    if (preset.existingLabelsPolicy === "skip" && input.canvasController.raw.getObjects("rect").length > 0) {
      input.uiManager.notify("Current image skipped because this preset keeps existing labels.");
      return;
    }

    const template = library.templates.find((candidate) => candidate.id === preset.templateId);
    const layout = preset.layoutId
      ? library.layouts.find((candidate) => candidate.id === preset.layoutId) ?? null
      : null;
    if (!template || (preset.outputMode === "layout-best-match" && !layout)) {
      throw new Error("The preset references a missing template or layout");
    }

    setMatchingEngineStatus("loading", "Matching engine: Running");
    let result: TemplateMatchResult;
    try {
      operation.update({ detail: `Preparing ${input.state.session.currentImageFile.name}` });
      const templateImageData = await pngDataUrlToImageData(template.pngDataUrl, input.documentRef);
      throwIfOperationCancelled(operation.signal);
      operation.update({ detail: "Running OpenCV template matching" });
      result = await matchWithRecovery({
        target: imageElementToImageData(targetImage, input.documentRef),
        template: templateImageData,
        preprocessing: template.preprocessing,
        matching: preset.matching,
        outputMode: preset.outputMode,
        multipleDetection: preset.multipleDetection
      });
      throwIfOperationCancelled(operation.signal);
    } finally {
      setMatchingEngineStatus("ready", "Matching engine: Ready");
    }

    operation.update({ detail: "Applying generated boxes" });
    const replaceExisting = preset.existingLabelsPolicy === "replace";
    let appliedCount = 0;
    let discardedOutOfBoundsCount = 0;
    if (preset.outputMode === "layout-best-match") {
      requireAcceptedMatch(result, preset.matching.minimumScore);
      if (!layout) {
        throw new Error("The preset references a missing layout");
      }
      const application = input.canvasController.raw.applyBoxLayout(
        layout,
        calculateLayoutAnchor(result, preset),
        { replaceExisting }
      );
      appliedCount = application.annotationIds.length;
      discardedOutOfBoundsCount = application.discardedOutOfBoundsCount;
    } else {
      if (result.matches.length === 0) {
        throw new Error(`No matches met the minimum ${(preset.matching.minimumScore * 100).toFixed(1)}% score`);
      }
      const application = input.canvasController.raw.applyDetectionBoxes(result.matches.map((candidate) => ({
        classId: preset.multipleDetection.classId,
        x: candidate.x,
        y: candidate.y,
        width: candidate.width,
        height: candidate.height
      })), { replaceExisting });
      appliedCount = application.annotationIds.length;
      discardedOutOfBoundsCount = application.discardedOutOfBoundsCount;
    }

    input.windowRef.dispatchEvent(new Event("easy-labeling:history-change"));
    input.uiManager.updateLabelList();
    const discarded = discardedOutOfBoundsCount > 0
      ? ` ${discardedOutOfBoundsCount} outside the image removed.`
      : "";
    input.uiManager.notify(`${preset.name}: ${appliedCount} boxes applied to the current image.${discarded}`);
  };

  const batchController = createAutomationBatchController({
    state: input.state,
    elements,
    documentRef: input.documentRef,
    fileSystem: input.fileSystem,
    uiManager: input.uiManager,
    getSelectedPreset: selectedPreset,
    getLibrary: () => library,
    match: matchWithRecovery,
    cancelActiveMatch: () => matchingService?.cancelPending(),
    setRelatedControlsDisabled: (running) => {
      elements.openTemplateMatchingBtn.disabled = running;
      elements.applyBoxLayoutBtn.disabled = running;
      elements.runAutomationCurrentBtn.disabled = running;
    }
  });

  const importPresetFileContents = async (contents: string): Promise<void> => {
    const presetFile = parseAutomationLibrary(contents);
    const mergedLibrary = mergePresetFileDocument(library, presetFile);
    const preset = presetFile.presets[0];
    if (!preset) {
      throw new Error("A preset file must contain exactly one preset");
    }
    library = mergedLibrary;
    await persistLibrary();
    activePresetId = preset.id;
    refreshSelects({
      layoutId: preset.layoutId ?? elements.boxLayoutSelect.value,
      presetId: preset.id
    });
    await loadPresetForm(preset);
    batchController.hidePreflight();
    input.uiManager.notify("Template preset file loaded.");
  };

  const importLayoutFileContents = async (contents: string): Promise<void> => {
    const parsed: unknown = JSON.parse(contents);
    if (!parsed || typeof parsed !== "object") {
      throw new Error("Layout JSON must be an object");
    }
    const layout = parsed as BoxLayout;
    validateBoxLayout(layout);
    library = { ...library, layouts: upsertById(library.layouts, layout) };
    await persistLibrary();
    refreshSelects({ layoutId: layout.id });
    elements.layoutSetupSelect.value = layout.id;
    elements.layoutNameInput.value = layout.name;
    renderLayoutPreview();
    input.uiManager.notify("Layout file loaded.");
  };

  return {
    dispose(): void {
      if (disposed) {
        return;
      }
      disposed = true;
      batchController.cancel();
      matchingService?.terminate();
      matchingService = null;
      matchingWarmUpPromise = null;
    },

    prepareMatchingEngine,

    bind(): void {
      workspace.bind();
      elements.templateWorkspaceFitBtn.addEventListener("click", () => workspace.fitToView());
      layoutPreview.bind();
      syncTemplateLayoutOpacity();
      refreshSelects();
      void prepareMatchingEngine().catch(() => {
        // The readiness panel and first use provide a visible retry path.
      });
      batchController.bind();

      elements.saveBoxLayoutBtn.addEventListener("click", () => {
        void runLayoutOperation(
          elements.saveBoxLayoutBtn,
          "Saving layout...",
          "Unable to save box layout",
          async () => {
            if (selectedSetupLayout()) {
              throw new Error("Click New Layout before saving a new layout");
            }
            const name = requireUniqueLayoutName(elements.layoutNameInput.value);
            const layout = captureCurrentLayout(name);
            library = { ...library, layouts: upsertById(library.layouts, layout) };
            await persistLibrary();
            refreshSelects({ layoutId: layout.id });
            elements.layoutSetupSelect.value = layout.id;
            elements.boxLayoutSelect.value = layout.id;
            elements.layoutNameInput.value = layout.name;
            renderLayoutPreview();
            setLayoutSetupError(null);
            syncLayoutEditorState();
            input.uiManager.notify(`Layout saved with ${layout.boxes.length} boxes.`);
            return `Saved ${layout.boxes.length} boxes`;
          }
        );
      });

      elements.updateBoxLayoutBtn.addEventListener("click", () => {
        void runLayoutOperation(
          elements.updateBoxLayoutBtn,
          "Updating layout...",
          "Unable to update box layout",
          async () => {
            const existing = selectedSetupLayout();
            if (!existing) {
              throw new Error("Choose a layout to update");
            }
            const name = requireUniqueLayoutName(elements.layoutNameInput.value, existing.id);
            const captured = captureCurrentLayout(name);
            const updated: BoxLayout = {
              ...captured,
              id: existing.id,
              createdAt: existing.createdAt,
              updatedAt: new Date().toISOString()
            };
            library = { ...library, layouts: upsertById(library.layouts, updated) };
            await persistLibrary();
            refreshSelects({ layoutId: updated.id });
            elements.layoutSetupSelect.value = updated.id;
            elements.boxLayoutSelect.value = updated.id;
            elements.layoutNameInput.value = updated.name;
            renderLayoutPreview();
            setLayoutSetupError(null);
            syncLayoutEditorState();
            input.uiManager.notify(`Layout updated with ${updated.boxes.length} boxes.`);
            return `Updated ${updated.boxes.length} boxes`;
          }
        );
      });

      elements.newBoxLayoutBtn.addEventListener("click", () => {
        enterNewLayoutMode();
      });

      elements.renameBoxLayoutBtn.addEventListener("click", () => {
        const layout = selectedSetupLayout();
        if (!layout) {
          setLayoutSetupError("Choose a layout to rename");
          input.uiManager.notify("Choose a layout to rename.");
          return;
        }
        const name = (elements.layoutNameInput.value.trim() || input.windowRef.prompt("Layout name:", layout.name)?.trim()) ?? "";
        if (!name) {
          return;
        }
        void runLayoutOperation(
          elements.renameBoxLayoutBtn,
          "Renaming layout...",
          "Unable to rename layout",
          async () => {
            requireUniqueLayoutName(name, layout.id);
            library = {
              ...library,
              layouts: upsertById(library.layouts, { ...layout, name, updatedAt: new Date().toISOString() })
            };
            await persistLibrary();
            refreshSelects({ layoutId: layout.id });
            renderLayoutPreview();
            syncLayoutEditorState();
            return `Renamed to ${name}`;
          }
        );
      });

      elements.duplicateBoxLayoutBtn.addEventListener("click", () => {
        void runLayoutOperation(
          elements.duplicateBoxLayoutBtn,
          "Duplicating layout...",
          "Unable to duplicate layout",
          async () => {
            const layout = selectedSetupLayout();
            if (!layout) {
              throw new Error("Choose a layout to duplicate");
            }
            const now = new Date().toISOString();
            const duplicate: BoxLayout = {
              ...layout,
              id: createId("layout"),
              name: `${layout.name} Copy`,
              boxes: layout.boxes.map((box) => ({ ...box, id: createId("layout-box") })),
              createdAt: now,
              updatedAt: now
            };
            library = { ...library, layouts: [...library.layouts, duplicate] };
            await persistLibrary();
            refreshSelects({ layoutId: duplicate.id });
            elements.layoutSetupSelect.value = duplicate.id;
            elements.layoutNameInput.value = duplicate.name;
            renderLayoutPreview();
            syncLayoutEditorState();
            return `Duplicated ${duplicate.boxes.length} boxes`;
          }
        );
      });

      elements.deleteBoxLayoutBtn.addEventListener("click", () => {
        const layout = selectedSetupLayout();
        if (!layout) {
          setLayoutSetupError("Choose a layout to delete");
          input.uiManager.notify("Choose a layout to delete.");
          return;
        }
        if (profileLibrary.layouts.some((candidate) => candidate.id === layout.id)) {
          setLayoutSetupError("Saved profile layouts are read-only. Delete the JSON file from the Layouts folder instead.");
          input.uiManager.notify("This layout comes from the saved Layouts folder and cannot be deleted here.", 6000);
          return;
        }
        if (!input.windowRef.confirm(`Delete layout "${layout.name}" and its presets?`)) {
          return;
        }
        void runLayoutOperation(
          elements.deleteBoxLayoutBtn,
          "Deleting layout...",
          "Unable to delete layout",
          async () => {
            library = deleteLayoutFromLibrary(library, layout.id);
            await persistLibrary();
            refreshSelects();
            elements.layoutNameInput.value = "";
            renderLayoutPreview();
            syncLayoutEditorState();
            return `Deleted ${layout.name}`;
          }
        );
      });

      elements.applyBoxLayoutBtn.addEventListener("click", () => {
        const layout = selectedLayout();
        if (!layout) {
          input.uiManager.notify("Choose a box layout first", 5000);
          return;
        }
        void runLayoutOperation(
          elements.applyBoxLayoutBtn,
          `Applying ${layout.boxes.length} boxes...`,
          "Unable to apply box layout",
          async () => {
            elements.layoutPlacementNotice.textContent = `Applying ${layout.boxes.length} boxes...`;
            elements.layoutPlacementNotice.dataset.state = "busy";
            await yieldToUi();
            const message = applyLayout(layout);
            input.uiManager.notify(message);
            return message;
          }
        );
      });

      elements.applyBoxLayoutFromSetupBtn.addEventListener("click", () => {
        const layout = selectedSetupLayout();
        if (!layout) {
          setLayoutSetupError("Choose a box layout first");
          input.uiManager.notify("Choose a box layout first", 5000);
          return;
        }
        void runLayoutOperation(
          elements.applyBoxLayoutFromSetupBtn,
          `Applying ${layout.boxes.length} boxes...`,
          "Unable to apply box layout",
          async () => {
            elements.layoutPlacementNotice.textContent = `Applying ${layout.boxes.length} boxes...`;
            elements.layoutPlacementNotice.dataset.state = "busy";
            await yieldToUi();
            const message = applyLayout(layout);
            input.uiManager.notify(message);
            return message;
          }
        );
      });

      elements.moveSelectedBoxesBtn.addEventListener("click", () => {
        try {
          input.canvasController.raw.translateSelectedBoxes({
            x: readFinite(elements.selectionMoveXInput, "Selection X"),
            y: readFinite(elements.selectionMoveYInput, "Selection Y")
          });
          input.windowRef.dispatchEvent(new Event("easy-labeling:history-change"));
        } catch (error: unknown) {
          input.uiManager.notify(error instanceof Error ? error.message : "Unable to move selection", 5000);
        }
      });

      elements.openLayoutSetupBtn.addEventListener("click", () => {
        try {
          if (!input.state.session.currentImage) {
            throw new Error("Load an image before opening Layout Setup");
          }
          const layoutId = elements.boxLayoutSelect.value || library.layouts[0]?.id || "";
          refreshSelects({ layoutId });
          elements.layoutSetupSourceName.textContent = input.state.session.currentImageFile?.name ?? "Current image";
          elements.layoutSetupSelect.value = layoutId;
          elements.layoutNameInput.value = selectedSetupLayout()?.name ?? "";
          elements.layoutCaptureScopeSelect.value = input.canvasController.raw.getSelectedBoxCount() > 0 ? "selected" : "all";
          setLayoutSetupError(null);
          setLayoutOperationStatus("idle", "Ready");
          syncLayoutEditorState();
          renderLayoutPreview();
          elements.layoutSetupModal.show();
          if (!selectedSetupLayout()) {
            elements.layoutNameInput.focus();
          }
        } catch (error: unknown) {
          input.uiManager.notify(error instanceof Error ? error.message : "Unable to open layout setup", 5000);
        }
      });

      elements.layoutSetupSelect.addEventListener("change", () => {
        if (elements.layoutSetupSelect.value) {
          elements.boxLayoutSelect.value = elements.layoutSetupSelect.value;
          elements.templateLayoutSelect.value = elements.layoutSetupSelect.value;
        }
        const layout = selectedSetupLayout();
        elements.layoutNameInput.value = layout?.name ?? "";
        if (!layout) {
          elements.layoutCaptureScopeSelect.value = input.canvasController.raw.getSelectedBoxCount() > 0 ? "selected" : "all";
        }
        setLayoutSetupError(null);
        syncLayoutEditorState();
        renderLayoutPreview();
        renderLayoutGhostPreview();
      });
      elements.layoutNameInput.addEventListener("input", () => {
        setLayoutSetupError(null);
        syncLayoutEditorState();
      });
      elements.layoutCaptureScopeSelect.addEventListener("change", () => {
        setLayoutSetupError(null);
        syncLayoutEditorState();
      });
      elements.boxLayoutSelect.addEventListener("pointerdown", () => {
        layoutSelectionArmed = true;
      });
      elements.boxLayoutSelect.addEventListener("keydown", () => {
        layoutSelectionArmed = true;
      });
      elements.boxLayoutSelect.addEventListener("blur", () => {
        layoutSelectionArmed = false;
      });
      elements.boxLayoutSelect.addEventListener("change", () => {
        elements.layoutSetupSelect.value = elements.boxLayoutSelect.value;
        elements.applyBoxLayoutBtn.disabled = !selectedLayout();
        layoutGhostVisible = layoutSelectionArmed && Boolean(selectedLayout());
        layoutSelectionArmed = false;
        renderLayoutGhostPreview();
      });
      elements.previewBoxLayoutBtn.addEventListener("click", () => {
        try {
          renderLayoutPreview();
          setLayoutSetupError(null);
        } catch (error: unknown) {
          setLayoutSetupError(error);
        }
      });

      elements.openTemplateMatchingBtn.addEventListener("click", () => {
        if (elements.openTemplateMatchingBtn.disabled) {
          return;
        }
        elements.openTemplateMatchingBtn.disabled = true;
        elements.openTemplateMatchingBtn.setAttribute("aria-busy", "true");
        void runCancellableMatchingOperation({
          title: "Opening template setup",
          detail: "Loading preset and reference image",
          stoppedMessage: "Opening template setup stopped."
        }, async (operation) => {
          if (!input.state.session.currentImage) {
            throw new Error("Load an image before opening Template Matching Setup");
          }
          elements.templateMatchingSourceName.textContent = input.state.session.currentImageFile?.name ?? "Current image";
          refreshSelects();
          refreshSourceImageSelect();
          const preset = selectedPreset();
          if (preset) {
            await loadPresetForm(preset);
          } else {
            resetPresetForm();
          }
          throwIfOperationCancelled(operation.signal);
          elements.templateMatchingModal.show();
          elements.templateMatchTimings.textContent = "Loading OpenCV engine...";
          setMatchingEngineStatus("loading", "Matching engine: Loading");
          operation.update({ detail: "Initializing OpenCV matching engine" });
          const warmup = await getMatchingService().warmUp();
          throwIfOperationCancelled(operation.signal);
          elements.templateMatchTimings.textContent = `OpenCV initialized in ${warmup.engineInitializationMs.toFixed(1)} ms`;
          setMatchingEngineStatus("ready", "Matching engine: Ready");
        }).catch((error: unknown) => {
          input.uiManager.notify(error instanceof Error ? error.message : "Unable to open template setup", 5000);
        }).finally(() => {
          elements.openTemplateMatchingBtn.disabled = false;
          elements.openTemplateMatchingBtn.removeAttribute("aria-busy");
          if (!elements.templateMatchingModal._isShown) {
            elements.openTemplateMatchingBtn.focus();
          }
        });
      });

      elements.newAutomationPresetBtn.addEventListener("click", resetPresetForm);
      elements.templatePresetSelect.addEventListener("change", () => {
        const presetId = elements.templatePresetSelect.value;
        elements.automationPresetSelect.value = presetId;
        activePresetId = presetId || null;
        elements.exportAutomationPresetBtn.disabled = !library.presets.some((preset) => preset.id === presetId);
        batchController.hidePreflight();
        elements.templatePresetSelect.disabled = true;
        void (async () => {
          const preset = library.presets.find((candidate) => candidate.id === presetId);
          if (preset) {
            await loadPresetForm(preset);
          } else {
            resetPresetForm();
          }
        })().catch(showSettingsError).finally(() => {
          elements.templatePresetSelect.disabled = false;
        });
      });
      elements.templateSourceImageSelect.addEventListener("change", () => {
        void (async () => {
          const file = input.state.session.imageFiles.find((candidate) => candidate.name === elements.templateSourceImageSelect.value);
          if (!file) {
            throw new Error("The selected reference image is unavailable");
          }
          await input.fileSystem.loadImage(file);
          const image = input.state.session.currentImage;
          if (!image) {
            throw new Error("Unable to decode the selected reference image");
          }
          activePresetId = null;
          activeTemplateDataUrl = null;
          templateRoiDirty = false;
          elements.exportAutomationPresetBtn.disabled = true;
          elements.templateMatchingSourceName.textContent = file.name;
          elements.templateMatchScore.textContent = "No preview yet";
          elements.templateMatchCoordinates.textContent = "";
          elements.templateMatchTimings.textContent = "";
          elements.templateMatchCandidates.replaceChildren();
          invalidateTemplateMatch();
          workspace.setImage(image);
          setTemplateInteractionMode("template-roi");
          workspace.renderPreviews(readPreprocessing());
          clearSettingsError();
        })().catch(showSettingsError);
      });
      elements.deleteAutomationPresetBtn.addEventListener("click", () => {
        void (async () => {
          const preset = activePresetId ? library.presets.find((candidate) => candidate.id === activePresetId) : null;
          if (preset && profileLibrary.presets.some((candidate) => candidate.id === preset.id)) {
            throw new Error("This preset comes from the saved Template Presets folder. Delete its JSON file there instead.");
          }
          if (!preset || !input.windowRef.confirm(`Delete preset "${preset.name}"?`)) {
            return;
          }
          const templateStillUsed = library.presets.some((candidate) => candidate.id !== preset.id && candidate.templateId === preset.templateId);
          library = {
            ...library,
            presets: library.presets.filter((candidate) => candidate.id !== preset.id),
            templates: templateStillUsed ? library.templates : library.templates.filter((template) => template.id !== preset.templateId)
          };
          await persistLibrary();
          refreshSelects();
          resetPresetForm();
        })().catch(showSettingsError);
      });
      elements.exportAutomationPresetBtn.addEventListener("click", () => {
        void (async () => {
          clearSettingsError();
          const presetFile = createPresetFileDocument(library, activePresetId ?? "");
          const preset = presetFile.presets[0];
          if (!preset) {
            throw new Error("Choose a preset to save");
          }
          await saveJsonFile(
            "preset",
            serializeAutomationLibrary(presetFile),
            portableJsonFileName(preset.name, "template-preset", "preset")
          );
        })().catch(showSettingsError);
      });
      elements.importAutomationPresetBtn.addEventListener("click", () => {
        if (!input.windowRef.openEasyLabelingLibraryFile) {
          elements.importAutomationPresetInput.click();
          return;
        }
        clearSettingsError();
        void (async () => {
          const file = await input.windowRef.openEasyLabelingLibraryFile?.("preset");
          if (file) {
            await importPresetFileContents(file.contents);
          }
        })().catch((error: unknown) => {
          showSettingsError(error);
          input.uiManager.notify(error instanceof Error ? error.message : "Unable to load template preset file", 6000);
        });
      });
      elements.importAutomationPresetInput.addEventListener("change", () => {
        clearSettingsError();
        void (async () => {
          const file = elements.importAutomationPresetInput.files?.[0];
          if (!file) {
            return;
          }
          await importPresetFileContents(await file.text());
        })().catch((error: unknown) => {
          showSettingsError(error);
          input.uiManager.notify(error instanceof Error ? error.message : "Unable to load template preset file", 6000);
        }).finally(() => {
          elements.importAutomationPresetInput.value = "";
        });
      });

      elements.templateSearchRoiToggle.addEventListener("change", () => {
        elements.templateSearchRoiInputs.hidden = !elements.templateSearchRoiToggle.checked;
      });
      elements.templatePointerRoiRadio.addEventListener("change", () => {
        if (elements.templatePointerRoiRadio.checked) {
          setTemplateInteractionMode("template-roi");
        }
      });
      elements.templatePointerEditRoiRadio.addEventListener("change", () => {
        if (elements.templatePointerEditRoiRadio.checked) {
          setTemplateInteractionMode("edit-roi");
        }
      });
      elements.templatePointerSelectRadio.addEventListener("change", () => {
        if (elements.templatePointerSelectRadio.checked) {
          setTemplateInteractionMode("select-results");
        }
      });
      elements.templateLayoutOpacityInput.addEventListener("input", syncTemplateLayoutOpacity);
      input.windowRef.addEventListener("easy-labeling:toggle-template-pointer-mode", toggleTemplateInteractionMode);
      input.documentRef.addEventListener("pointerdown", (event) => {
        if (!elements.templateMatchContextMenu.hidden
          && event.target instanceof Node
          && !elements.templateMatchContextMenu.contains(event.target)) {
          hideTemplateMatchContextMenu();
        }
      });
      input.documentRef.getElementById("templateMatchingModal")?.addEventListener("hidden.bs.modal", () => {
        hideTemplateMatchContextMenu();
      });
      input.documentRef.getElementById("templateMatchingModal")?.addEventListener("shown.bs.modal", () => {
        workspace.fitToView();
      });
      elements.templateMatchContextAssignBtn.addEventListener("click", assignContextTemplateMatchClass);
      elements.templateMatchContextMenu.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          hideTemplateMatchContextMenu(true);
        }
      });
      elements.templateMatchContextClassInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          assignContextTemplateMatchClass();
        }
      });
      elements.templateMatchContextDeleteBtn.addEventListener("click", deleteContextTemplateMatch);
      elements.templateOutputLayoutRadio.addEventListener("change", () => {
        syncOutputModeUi();
        invalidateTemplateMatch();
      });
      elements.templateOutputMultipleRadio.addEventListener("change", () => {
        syncOutputModeUi();
        invalidateTemplateMatch();
      });
      elements.templateApplyAllMatchesRadio.addEventListener("change", () => {
        if (elements.templateApplyAllMatchesRadio.checked) {
          renderMultipleMatchSelection();
        }
      });
      elements.templateApplySelectedMatchesRadio.addEventListener("change", () => {
        if (elements.templateApplySelectedMatchesRadio.checked) {
          renderMultipleMatchSelection();
        }
      });
      elements.selectAllTemplateMatchesBtn.addEventListener("click", () => {
        const candidates = lastTemplateMatchResult?.matches ?? [];
        elements.templateApplySelectedMatchesRadio.checked = true;
        elements.templateApplyAllMatchesRadio.checked = false;
        selectedTemplateMatchIndices.clear();
        candidates.forEach((_, index) => selectedTemplateMatchIndices.add(index));
        renderMultipleMatchSelection();
      });
      elements.clearTemplateMatchSelectionBtn.addEventListener("click", () => {
        selectedTemplateMatchIndices.clear();
        renderMultipleMatchSelection();
      });
      elements.assignTemplateMatchClassBtn.addEventListener("click", () => {
        let classId: string;
        try {
          classId = parseNonNegativeClassId(elements.templateMultipleClassIdInput.value);
        } catch (error: unknown) {
          elements.templateMultipleClassIdInput.classList.add("is-invalid");
          showSettingsError(error);
          elements.templateMultipleClassIdInput.focus();
          return;
        }
        elements.templateMultipleClassIdInput.value = classId;
        elements.templateMultipleClassIdInput.classList.remove("is-invalid");
        selectedTemplateMatchIndices.forEach((index) => assignedTemplateMatchClasses.set(index, classId));
        clearSettingsError();
        renderMultipleMatchSelection();
      });
      elements.templateMultipleClassIdInput.addEventListener("input", () => {
        elements.templateMultipleClassIdInput.classList.remove("is-invalid");
        if (lastTemplateMatchResult && readOutputMode() === "multiple-detection-boxes") {
          renderMultipleMatchSelection();
        }
      });
      const previewInputs: HTMLElement[] = [
        elements.templateGrayscaleToggle,
        elements.templateBlurToggle,
        elements.templateBlurKernelInput,
        elements.templateBlurSigmaInput,
        elements.templateNoiseToggle,
        elements.templateNoiseSigmaInput,
        elements.templateNoiseSeedInput
      ];
      previewInputs.forEach((element) => element.addEventListener("input", () => {
        try {
          invalidateTemplateMatch();
          workspace.renderPreviews(readPreprocessing());
          clearSettingsError();
        } catch (error: unknown) {
          showSettingsError(error);
        }
      }));

      elements.testTemplateMatchBtn.addEventListener("click", () => {
        clearSettingsError();
        elements.testTemplateMatchBtn.disabled = true;
        void runCancellableMatchingOperation({
          title: "Testing template match",
          detail: "Preparing template and image pixels",
          stoppedMessage: "Template matching stopped."
        }, testMatch).catch(showSettingsError).finally(() => {
          elements.testTemplateMatchBtn.disabled = false;
        });
      });
      const matchingInputs: HTMLElement[] = [
        elements.templateMatchingAccurateRadio,
        elements.templateMatchingFastRadio,
        elements.templateMinimumScoreInput,
        elements.templateSearchRoiToggle,
        elements.templateSearchXInput,
        elements.templateSearchYInput,
        elements.templateSearchWidthInput,
        elements.templateSearchHeightInput,
        elements.templateMaximumDetectionsInput,
        elements.templateStrictNonOverlapToggle,
        elements.templateNmsIouInput,
        elements.templatePaddingXInput,
        elements.templatePaddingYInput
      ];
      matchingInputs.forEach((element) => {
        element.addEventListener("input", invalidateTemplateMatch);
        element.addEventListener("change", invalidateTemplateMatch);
      });
      elements.templateLayoutSelect.addEventListener("change", () => {
        const layoutId = elements.templateLayoutSelect.value;
        elements.boxLayoutSelect.value = layoutId;
        elements.layoutSetupSelect.value = layoutId;
        elements.applyBoxLayoutBtn.disabled = !selectedLayout();
        elements.applyBoxLayoutFromSetupBtn.disabled = !selectedSetupLayout();
        elements.layoutNameInput.value = selectedSetupLayout()?.name ?? "";
        layoutGhostVisible = false;
        clearLayoutGhostPreview();
        syncLayoutEditorState();
        renderTemplateLayoutPreview();
      });
      const layoutPreviewInputs: HTMLElement[] = [
        elements.templateRelationXInput,
        elements.templateRelationYInput,
        elements.templateManualXInput,
        elements.templateManualYInput
      ];
      layoutPreviewInputs.forEach((element) => {
        element.addEventListener("input", renderTemplateLayoutPreview);
        element.addEventListener("change", renderTemplateLayoutPreview);
      });
      elements.applyTemplateMatchBtn.addEventListener("click", () => {
        try {
          applyTemplateResult();
        } catch (error: unknown) {
          showSettingsError(error);
        }
      });
      elements.saveAutomationPresetBtn.addEventListener("click", () => {
        if (elements.saveAutomationPresetBtn.disabled) {
          return;
        }
        clearSettingsError();
        elements.saveAutomationPresetBtn.disabled = true;
        elements.saveAutomationPresetBtn.setAttribute("aria-busy", "true");
        void savePreset().catch(showSettingsError).finally(() => {
          elements.saveAutomationPresetBtn.disabled = false;
          elements.saveAutomationPresetBtn.removeAttribute("aria-busy");
        });
      });

      elements.runAutomationCurrentBtn.addEventListener("click", () => {
        if (elements.runAutomationCurrentBtn.disabled) {
          return;
        }
        elements.runAutomationCurrentBtn.disabled = true;
        elements.runAutomationCurrentBtn.setAttribute("aria-busy", "true");
        elements.runAutomationBatchBtn.disabled = true;
        elements.openTemplateMatchingBtn.disabled = true;
        void runCancellableMatchingOperation({
          title: "Running template automation",
          detail: "Preparing current image",
          stoppedMessage: "Current image automation stopped."
        }, runSelectedPresetOnCurrentImage).catch((error: unknown) => {
          input.uiManager.notify(error instanceof Error ? error.message : "Current image automation failed", 7000);
        }).finally(() => {
          elements.runAutomationCurrentBtn.disabled = false;
          elements.runAutomationCurrentBtn.removeAttribute("aria-busy");
          elements.runAutomationBatchBtn.disabled = false;
          elements.openTemplateMatchingBtn.disabled = false;
        });
      });

      elements.automationPresetSelect.addEventListener("change", () => {
        const presetId = elements.automationPresetSelect.value;
        activePresetId = presetId || null;
        elements.templatePresetSelect.value = presetId;
        elements.exportAutomationPresetBtn.disabled = !library.presets.some((preset) => preset.id === presetId);
        batchController.hidePreflight();
        if (elements.templateMatchingModal._isShown) {
          const preset = selectedPreset();
          void (preset ? loadPresetForm(preset) : Promise.resolve(resetPresetForm())).catch(showSettingsError);
        }
      });

      input.windowRef.addEventListener("easy-labeling:canvas-view-change", () => {
        renderLayoutGhostPreview();
      });

      elements.exportAutomationLibraryBtn.addEventListener("click", () => {
        void (async () => {
          const layout = selectedSetupLayout();
          if (!layout) {
            throw new Error("Choose a layout to export");
          }
          await saveJsonFile(
            "layout",
            `${JSON.stringify(layout, null, 2)}\n`,
            portableJsonFileName(layout.name, "box-layout", "layout")
          );
        })().catch((error: unknown) => {
          input.uiManager.notify(error instanceof Error ? error.message : "Unable to export box layout");
        });
      });
      elements.importAutomationLibraryBtn.addEventListener("click", () => {
        if (!input.windowRef.openEasyLabelingLibraryFile) {
          elements.importAutomationLibraryInput.click();
          return;
        }
        setLayoutSetupError(null);
        void (async () => {
          const file = await input.windowRef.openEasyLabelingLibraryFile?.("layout");
          if (file) {
            await importLayoutFileContents(file.contents);
          }
        })().catch((error: unknown) => {
          setLayoutSetupError(error);
          input.uiManager.notify(error instanceof Error ? error.message : "Unable to import box layout", 6000);
        });
      });
      elements.importAutomationLibraryInput.addEventListener("change", () => {
        void (async () => {
          const file = elements.importAutomationLibraryInput.files?.[0];
          if (!file) {
            return;
          }
          await importLayoutFileContents(await file.text());
        })().catch((error: unknown) => {
          setLayoutSetupError(error);
          input.uiManager.notify(error instanceof Error ? error.message : "Unable to import box layout", 6000);
        }).finally(() => {
          elements.importAutomationLibraryInput.value = "";
        });
      });
    },

    async refreshLibrary(options = {}): Promise<void> {
      const folder = input.state.session.imageFolderHandle;
      const selectedLayoutId = elements.boxLayoutSelect.value;
      const selectedPresetId = elements.automationPresetSelect.value;
      const datasetLibrary = folder
        ? await loadAutomationLibrary(folder as unknown as DirectoryHandleLike)
        : createEmptyAutomationLibrary();
      profileLibrary = createEmptyAutomationLibrary();
      library = datasetLibrary;
      if (input.windowRef.listEasyLabelingLibraryFiles) {
        try {
          const [layoutFiles, presetFiles] = await Promise.all([
            input.windowRef.listEasyLabelingLibraryFiles("layout"),
            input.windowRef.listEasyLabelingLibraryFiles("preset")
          ]);
          const profile = loadAutomationProfileFiles(layoutFiles, presetFiles);
          profileLibrary = profile.document;
          library = mergeAutomationLibraries(profileLibrary, datasetLibrary);
          if (profile.errors.length > 0) {
            input.uiManager.notify(
              `Some saved automation files were skipped:\n${profile.errors.join("\n")}`,
              8000
            );
          }
        } catch (error: unknown) {
          input.uiManager.notify(
            `Unable to scan saved automation files: ${error instanceof Error ? error.message : String(error)}`,
            6000
          );
        }
      }
      layoutGhostVisible = false;
      const layoutId = resolveAutomationSelectionId(library.layouts, selectedLayoutId, options.selectFirst ?? false);
      const presetId = resolveAutomationSelectionId(library.presets, selectedPresetId, options.selectFirst ?? false);
      activePresetId = presetId || null;
      refreshSelects({ layoutId, presetId });
      layoutGhostVisible = false;
      renderLayoutGhostPreview();
    }
  };
}
