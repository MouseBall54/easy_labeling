import type { UIManager, UIManagerDeps } from "../app/contracts.js";
import { createOperationCancelledError } from "../app/operation.js";
import type { AppState } from "../app/state.js";
import { getCurrentDocumentStatus } from "../app/document-status.js";
import { parseNonNegativeClassId } from "../domain/class-id.js";
import { validateNewClassFileName } from "../domain/class-files.js";
import type { LabelDisplayMode, WorkflowType } from "../types/labels.js";
import {
  getDOMElements,
  type BootstrapLike,
  type BootstrapModalLike,
  type UiDomElements
} from "../ui/dom-elements.js";
import { getColorForClass } from "../features/canvas/colors.js";
import { isFormatSupportedForAnnotationType } from "../domain/annotations/segmentation-format.js";
import { isActiveSelectionObject, isRectObject, type FabricRectLike } from "../features/canvas/fabric-types.js";
import { renderLabelClassModalContent } from "../ui/modals.js";
import { installModalFocusManagement } from "../ui/modal-focus.js";
import {
  bindLabelFilterEvents,
  renderClassFileSelect,
  renderImageList,
  renderLabelFilters,
  renderSelectByClassDropdown,
  renderWorkflowPanels,
  showLoadingOverlay,
  hideLoadingOverlay
} from "../ui/renderers.js";
import { applyDarkMode, readStoredDarkMode } from "../ui/theme.js";
import {
  deriveVisibilitySummary,
  normalizeFilterClassKey,
  toggleAllLabelClasses,
  toggleHiddenLabelClass
} from "../ui/filter-state.js";
import type { RuntimeCanvasController } from "./canvas-controller-adapter.js";
import type { RuntimeFileSystem } from "./file-system-adapter.js";

function showToast(documentRef: Document, message: string, duration = 3000): void {
  const toastContainer = documentRef.getElementById("toast-container");
  if (!toastContainer) {
    return;
  }

  const toast = documentRef.createElement("div");
  toast.className = "toast-message";
  toast.textContent = message;
  toastContainer.appendChild(toast);

  window.setTimeout(() => toast.classList.add("show"), 10);
  window.setTimeout(() => {
    toast.classList.remove("show");
    window.setTimeout(() => toast.remove(), 300);
  }, duration);
}

function getReviewIssueTypeLabel(type: string): string {
  switch (type) {
    case "empty-label":
      return "No labels";
    case "out-of-bounds":
      return "Outside image";
    case "small-box":
      return "Small box";
    case "duplicate-box":
      return "Duplicate boxes";
    case "missing-class":
      return "Missing class";
    default:
      return "Quality issue";
  }
}

export interface RuntimeUiManager extends UIManager {
  readonly elements: UiDomElements;
  connect(deps: UIManagerDeps): void;
  getDisplayNameForClass(labelClass: string | undefined): string;
  updateLabelFolderButton(hasLabelFolder: boolean): void;
  setWorkflow(workflow: WorkflowType): void;
  promptForLabelClass(defaultValue: string): Promise<string>;
  promptForClassFileName(defaultValue: string, existingNames: string[]): Promise<string | null>;
  confirmMissingLabelFolderCreation(): Promise<boolean>;
  notify(message: string, duration?: number): void;
  updateZoomDisplay(zoomLevel?: number): void;
  applyDarkMode(enabled: boolean): void;
  restoreDarkModeFromStorage(): void;
  renderImageList(): void;
  renderReviewPanel(): void;
  renderClassFileSelect(): void;
  toggleAllLabelVisibility(): void;
  updateLabelList(): void;
  updateCurrentImageName(): void;
  updateMouseCoords(x: number, y: number): void;
  hideMouseCoords(): void;
  beginOperation(options: RuntimeOperationOptions): RuntimeOperationHandle;
  showLoading(message?: string): void;
  hideLoading(): void;
  startWorkspaceStandby(title: string, summary: string): void;
  updateWorkspaceStandbyStep(step: WorkspaceStandbyStep, state: WorkspaceStandbyStepState, detail: string): void;
  finishWorkspaceStandby(state: "ready" | "warning" | "error", summary: string): void;
  hideWorkspaceStandby(): void;
  setDirectoryPickerSupport(available: boolean): void;
  setActiveTask(task: "files" | "annotate" | "detection-display" | "segmentation" | "superpixel" | "segmentation-display" | "preprocessing" | "automate" | "review"): void;
  setInspectorTab(tab: "annotation" | "transform" | "automation"): void;
  syncWorkspaceState(): void;
  syncSelectionInspector(): void;
  setLabelDisplayMode(mode: LabelDisplayMode, persist?: boolean): void;
  togglePanel(panel: HTMLElement, splitter: HTMLElement, expandButton: HTMLElement, collapse: boolean): void;
  setupSplitters(): void;
  showClassFileContentModal(): void;
}

export type WorkspaceStandbyStep =
  | "interface"
  | "dataset"
  | "labels"
  | "images"
  | "classes"
  | "automation"
  | "matching";

export type WorkspaceStandbyStepState = "pending" | "loading" | "ready" | "warning" | "error";

export interface RuntimeOperationUpdate {
  title?: string;
  detail?: string;
  current?: number;
  total?: number;
}

export interface RuntimeOperationOptions extends RuntimeOperationUpdate {
  title: string;
  cancellable?: boolean;
  blockCanvas?: boolean;
}

export interface RuntimeOperationHandle {
  readonly signal: AbortSignal;
  update(update: RuntimeOperationUpdate): void;
  cancel(): void;
  finish(): void;
}

interface ActiveRuntimeOperation {
  id: number;
  title: string;
  detail: string;
  current: number | null;
  total: number | null;
  cancellable: boolean;
  blockCanvas: boolean;
  startedAt: number;
  controller: AbortController;
  timer: ReturnType<typeof setInterval>;
}

export function createUiManagerAdapter(input: {
  state: AppState;
  documentRef: Document;
  bootstrapRef: BootstrapLike;
  windowRef: Pick<Window, "prompt">;
  storage: Pick<Storage, "getItem" | "setItem">;
}): RuntimeUiManager {
  const elements = getDOMElements(input.documentRef, input.bootstrapRef);
  installModalFocusManagement(input.documentRef, [
    "layoutSetupModal",
    "templateMatchingModal",
    "segmentationFormatModal",
    "createClassFileModal",
    "classFileViewerModal",
    "labelClassModal",
    "missingLabelFolderModal"
  ]);
  let deps: UIManagerDeps | null = null;
  let loadingDepth = 0;
  let workspaceStandbyActive = false;
  let workspaceStandbyHideTimer: ReturnType<typeof setTimeout> | null = null;
  let nextOperationId = 0;
  const activeOperations = new Map<number, ActiveRuntimeOperation>();
  let directoryPickerAvailable = true;
  let activeTask: "files" | "annotate" | "detection-display" | "segmentation" | "superpixel" | "segmentation-display" | "preprocessing" | "automate" | "review" = "annotate";
  let activeInspectorTab: "annotation" | "transform" | "automation" = "annotation";
  let displayedWorkflow: WorkflowType = input.state.session.workflow;
  let missingLabelFolderModal: BootstrapModalLike | null = null;
  const initializedDenseLabelGroups = new Set<string>();

  const setStatusText = (element: HTMLElement, text: string): void => {
    const textElement = element.querySelector<HTMLElement>("span");
    if (textElement) {
      textElement.textContent = text;
      return;
    }
    element.textContent = text;
  };

  const latestOperation = (): ActiveRuntimeOperation | null => {
    const operations = [...activeOperations.values()];
    return operations[operations.length - 1] ?? null;
  };

  const syncLoadingOverlay = (): void => {
    const blockingOperation = [...activeOperations.values()].reverse().find((operation) => operation.blockCanvas);
    const visible = loadingDepth > 0 || Boolean(blockingOperation) || workspaceStandbyActive;
    if (blockingOperation) {
      elements.loadingStatusText.textContent = blockingOperation.title;
    }
    elements.loadingDefaultIndicator.hidden = workspaceStandbyActive;
    elements.workspaceStandbyPanel.hidden = !workspaceStandbyActive;
    input.documentRef.body.classList.toggle("workspace-standby-active", workspaceStandbyActive);
    if (visible) {
      showLoadingOverlay(elements.loadingOverlay);
      elements.loadingOverlay.setAttribute("aria-hidden", "false");
      return;
    }
    hideLoadingOverlay(elements.loadingOverlay);
    elements.loadingOverlay.setAttribute("aria-hidden", "true");
  };

  const renderActiveOperation = (): void => {
    const operation = latestOperation();
    if (!operation) {
      elements.activeOperationPanel.hidden = true;
      elements.activeOperationProgress.hidden = true;
      return;
    }

    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - operation.startedAt) / 1000));
    const hasProgress = operation.current !== null
      && operation.total !== null
      && operation.total > 0;
    const percent = hasProgress
      ? Math.max(0, Math.min(100, Math.round(((operation.current ?? 0) / (operation.total ?? 1)) * 100)))
      : 0;

    elements.activeOperationPanel.hidden = false;
    elements.activeOperationPanel.dataset.state = operation.controller.signal.aborted ? "stopping" : "running";
    elements.activeOperationTitle.textContent = operation.controller.signal.aborted ? "Stopping operation" : operation.title;
    elements.activeOperationDetail.textContent = operation.detail;
    elements.activeOperationElapsed.textContent = `Elapsed ${elapsedSeconds}s`;
    elements.cancelActiveOperationBtn.hidden = !operation.cancellable;
    elements.cancelActiveOperationBtn.disabled = operation.controller.signal.aborted;
    elements.activeOperationProgress.hidden = !hasProgress;
    elements.activeOperationProgressText.hidden = !hasProgress;
    elements.activeOperationProgressText.textContent = hasProgress
      ? `${operation.current} / ${operation.total}`
      : "";
    elements.activeOperationProgressBar.style.width = `${percent}%`;
    elements.activeOperationProgress.setAttribute("aria-valuenow", String(percent));
  };

  const cancelOperation = (operation: ActiveRuntimeOperation): void => {
    if (!operation.cancellable || operation.controller.signal.aborted) {
      return;
    }
    operation.detail = "Stopping at the next safe point...";
    operation.controller.abort(createOperationCancelledError(`${operation.title} stopped`));
    renderActiveOperation();
  };

  const selectedDetectionRects = (): ReturnType<RuntimeCanvasController["raw"]["getObjects"]> => {
    const canvasController = getCanvasController();
    if (!canvasController || input.state.session.workflow !== "detection") {
      return [];
    }

    const selected = canvasController.raw.canvas.getActiveObjects().filter(isRectObject);
    const activeObject = canvasController.raw.canvas.getActiveObject();
    if (activeObject && isActiveSelectionObject(activeObject)) {
      selected.push(...activeObject.getObjects().filter(isRectObject));
    } else if (activeObject && isRectObject(activeObject)) {
      selected.push(activeObject);
    }
    return [...new Set(selected)];
  };

  const getCanvasController = (): RuntimeCanvasController | null => {
    return deps?.canvasController as RuntimeCanvasController | null;
  };

  const getFileSystem = (): RuntimeFileSystem | null => {
    return deps?.fileSystem as RuntimeFileSystem | null;
  };

  const syncSegmentationPanelState = (): void => {
    const canvasController = getCanvasController();
    const summary = canvasController?.raw.getSegmentationSummary?.();
    const activeClassId = summary?.activeClassId ?? "1";
    const activeTool = summary?.activeTool ?? "brush";
    const brushRadius = summary?.brushRadius ?? Number.parseInt(elements.segmentationToolSizeSlider.value, 10);
    const overlayVisible = summary?.overlayVisible ?? elements.segmentationMaskVisibilityToggle.checked;
    const overlayOpacity = summary?.overlayOpacity ?? (Number.parseInt(elements.segmentationMaskOpacitySlider.value, 10) / 100);
    const edgeHighlightVisible = summary?.edgeHighlightVisible ?? elements.segmentationEdgeHighlightToggle.checked;
    const edgeHighlightIntensity = summary?.edgeHighlightIntensity ?? (Number.parseInt(elements.segmentationEdgeGlowSlider.value, 10) / 100);
    const visibleClassIds = summary?.visibleClassIds ?? [];
    const segmentationClassIds = summary
      ? [...new Set([...summary.allClassIds, ...input.state.session.classNames.keys()])]
          .filter((classId) => Number.parseInt(classId, 10) > 0)
          .sort((left, right) => Number(left) - Number(right))
      : [];
    const requiresClassSelection = Boolean(input.state.session.currentImage && summary?.requiresClassSelection);
    const autoFillClosedRegionEnabled = canvasController?.raw.getSegmentationAutoFillClosedRegionEnabled?.() ?? false;
    const annotationType = input.state.session.segmentationAnnotationType ?? "semantic";
    if (elements.segmentationAnnotationTypeSelect && elements.segmentationSourceFormatSelect && elements.segmentationExportFormatSelect && elements.segmentationFormatGuidance) {
      elements.segmentationAnnotationTypeSelect.value = annotationType;
      elements.segmentationSourceFormatSelect.value = input.state.session.segmentationSourceFormat ?? "auto";
      [...elements.segmentationExportFormatSelect.options].forEach((option) => {
        option.disabled = !isFormatSupportedForAnnotationType(option.value as import("../domain/annotations/segmentation-format.js").SegmentationExternalFormat, annotationType);
      });
      if (!isFormatSupportedForAnnotationType(input.state.session.segmentationExportFormat ?? "png-semantic-mask", annotationType)) {
        input.state.session.segmentationExportFormat = annotationType === "semantic" ? "png-semantic-mask" : "yolo-segmentation";
      }
      elements.segmentationExportFormatSelect.value = input.state.session.segmentationExportFormat ?? "png-semantic-mask";
      elements.segmentationFormatGuidance.textContent = annotationType === "semantic"
        ? "PNG Mask preserves full-resolution class masks."
        : "YOLO, COCO, and LabelMe export each disconnected mask region as an instance.";
    }

    elements.segmentationActiveClassSummary.textContent = requiresClassSelection
      ? segmentationClassIds.length > 0
        ? "Choose a paint class before drawing."
        : "Load or create a class file before drawing."
      : `Painting: ${manager.getDisplayNameForClass(activeClassId)}`;
    elements.segmentationActiveClassSummary.dataset.state = requiresClassSelection ? "selection-required" : "ready";
    elements.segmentationActiveClassSummary.hidden = !input.state.session.currentImage;
    (elements.segmentationActiveClassSummary as HTMLButtonElement).disabled = requiresClassSelection;
    const selectedRegion = canvasController?.raw.getSelectedSegmentationRegion?.() ?? null;
    const selectedRegionSummary = input.documentRef.getElementById("segmentationSelectedRegionSummary");
    const regionActions = input.documentRef.getElementById("segmentationRegionActions");
    const deleteRegionButton = input.documentRef.getElementById("segmentationDeleteRegionBtn") as HTMLButtonElement | null;
    const isDrawingMode = input.state.view.currentMode === "draw";
    if (selectedRegionSummary) {
      selectedRegionSummary.hidden = isDrawingMode;
      selectedRegionSummary.textContent = selectedRegion
        ? `${manager.getDisplayNameForClass(selectedRegion.classId)} · ${selectedRegion.pixelCount.toLocaleString()} px · ${selectedRegion.bounds.right - selectedRegion.bounds.left + 1} × ${selectedRegion.bounds.bottom - selectedRegion.bounds.top + 1}`
        : "Select a region to inspect.";
    }
    if (deleteRegionButton) deleteRegionButton.disabled = selectedRegion === null;
    if (regionActions) regionActions.hidden = input.state.session.workflow !== "segmentation" || isDrawingMode;
    (elements.segmentationRelabelRegionBtn as HTMLButtonElement).disabled = selectedRegion === null;
    elements.segmentationBrushModeBtn.classList.toggle("active", isDrawingMode && activeTool === "brush");
    elements.segmentationEraseModeBtn.classList.toggle("active", isDrawingMode && activeTool === "erase");
    elements.segmentationPolygonModeBtn?.classList.toggle("active", isDrawingMode && activeTool === "polygon");
    elements.segmentationSuperpixelModeBtn?.classList.toggle("active", isDrawingMode && activeTool === "superpixel");
    const aiSelectModeButton = input.documentRef.getElementById("segmentationAiSelectModeBtn") as HTMLButtonElement | null;
    aiSelectModeButton?.classList.toggle("active", isDrawingMode && activeTool === "ai-select");
    input.documentRef.getElementById("segmentationEditModeBtn")?.classList.toggle("active", !isDrawingMode);
    (elements.segmentationBrushModeBtn as HTMLButtonElement).disabled = requiresClassSelection;
    if (elements.segmentationPolygonModeBtn) (elements.segmentationPolygonModeBtn as HTMLButtonElement).disabled = requiresClassSelection;
    if (elements.segmentationSuperpixelModeBtn) (elements.segmentationSuperpixelModeBtn as HTMLButtonElement).disabled = requiresClassSelection;
    if (aiSelectModeButton) aiSelectModeButton.disabled = requiresClassSelection;
    const aiPreviewSection = input.documentRef.getElementById("segmentationAiPreviewSection");
    if (aiPreviewSection) aiPreviewSection.hidden = input.state.session.workflow !== "segmentation" || activeTool !== "ai-select";
    const polygonActionsSection = input.documentRef.getElementById("segmentationPolygonActionsSection");
    if (polygonActionsSection) polygonActionsSection.hidden = input.state.session.workflow !== "segmentation" || activeTool !== "polygon";
    const toolSizeSection = input.documentRef.getElementById("segmentationToolSizeSection");
    if (toolSizeSection) toolSizeSection.hidden = input.state.session.workflow !== "segmentation"
      || !isDrawingMode
      || (activeTool !== "brush" && activeTool !== "erase");
    const aiPreview = summary?.aiPreview ?? null;
    if (elements.segmentationApplyAiPreviewBtn) elements.segmentationApplyAiPreviewBtn.disabled = aiPreview === null;
    if (elements.segmentationDiscardAiPreviewBtn) elements.segmentationDiscardAiPreviewBtn.disabled = aiPreview === null;
    if (elements.segmentationAiPreviewSummary) {
      elements.segmentationAiPreviewSummary.textContent = aiPreview
        ? `Preview · ${manager.getDisplayNameForClass(aiPreview.classId)} · ${aiPreview.pixelCount.toLocaleString()} px · ${aiPreview.pointCount} point${aiPreview.pointCount === 1 ? "" : "s"}${aiPreview.hasBox ? " + box" : ""}`
        : "Click to create a preview. Add points or a box to refine it.";
    }
    if (elements.segmentationSuperpixelSizeSlider && elements.segmentationSuperpixelSizeValue && elements.segmentationSuperpixelBoundaryToggle) {
      const superpixelSize = canvasController?.raw.getSegmentationSuperpixelRegionSize?.() ?? Number.parseInt(elements.segmentationSuperpixelSizeSlider.value, 10);
      elements.segmentationSuperpixelSizeSlider.value = `${superpixelSize}`;
      elements.segmentationSuperpixelSizeValue.textContent = `${superpixelSize} px`;
      elements.segmentationSuperpixelPresetButtons?.forEach((button) => button.classList.toggle("active", Number(button.dataset.size) === superpixelSize));
      elements.segmentationSuperpixelBoundaryToggle.disabled = false;
    }
    const superpixelSettings = canvasController?.raw.getSegmentationSuperpixelSettings?.();
    const blurSelect = input.documentRef.getElementById("segmentationBlurSelect");
    const contrastSelect = input.documentRef.getElementById("segmentationContrastSelect");
    const edgeSensitivitySelect = input.documentRef.getElementById("segmentationEdgeSensitivitySelect");
    const isSelect = (element: Element | null): element is HTMLSelectElement => typeof HTMLSelectElement !== "undefined" && element instanceof HTMLSelectElement;
    if (isSelect(blurSelect) && superpixelSettings) blurSelect.value = superpixelSettings.blur;
    if (isSelect(contrastSelect) && superpixelSettings) contrastSelect.value = superpixelSettings.contrast;
    if (isSelect(edgeSensitivitySelect) && superpixelSettings) edgeSensitivitySelect.value = superpixelSettings.edgeSensitivity;
    const presetSelect = input.documentRef.getElementById("segmentationToolPresetSelect");
    if (isSelect(presetSelect)) {
      const selected = presetSelect.value;
      presetSelect.replaceChildren(new Option("Superpixel preset", ""));
      input.state.session.segmentationToolPresets.presets.forEach((preset) => presetSelect.add(new Option(preset.name, preset.id)));
      presetSelect.value = input.state.session.segmentationToolPresets.presets.some((preset) => preset.id === selected) ? selected : "";
    }
    elements.segmentationToolSizeLabel.textContent = activeTool === "erase" ? "Erase Size" : "Brush Size";
    elements.segmentationToolSizeSlider.value = `${brushRadius}`;
    elements.segmentationToolSizeValue.textContent = `${brushRadius}px`;
    elements.segmentationToolSizePresets.querySelectorAll<HTMLButtonElement>('[data-ui="segmentation-tool-size-preset"]').forEach((button) => {
      const isActive = Number.parseInt(button.dataset.size ?? "", 10) === brushRadius;
      button.classList.toggle("btn-secondary", isActive);
      button.classList.toggle("active", isActive);
      button.classList.toggle("btn-outline-secondary", !isActive);
    });
    elements.segmentationAutoFillClosedRegionToggle.checked = autoFillClosedRegionEnabled;
    elements.segmentationMaskVisibilityToggle.checked = overlayVisible;
    elements.segmentationMaskOpacitySlider.value = `${Math.round(overlayOpacity * 100)}`;
    elements.segmentationMaskOpacityValue.textContent = `${Math.round(overlayOpacity * 100)}`;
    elements.segmentationEdgeHighlightToggle.checked = edgeHighlightVisible;
    elements.segmentationEdgeGlowSlider.value = `${Math.round(edgeHighlightIntensity * 100)}`;
    elements.segmentationEdgeGlowValue.textContent = `${Math.round(edgeHighlightIntensity * 100)}`;
    const paintClassList = elements.segmentationPaintClassList;
    elements.segmentationClassSummary.innerHTML = "";
    if (paintClassList) paintClassList.innerHTML = "";
    if (summary && segmentationClassIds.length > 0) {
      segmentationClassIds.forEach((classId) => {
        const paintClassButton = input.documentRef.createElement("button");
        paintClassButton.type = "button";
        paintClassButton.className = `btn btn-sm segmentation-paint-class-button ${classId === activeClassId ? "btn-primary active" : "btn-outline-primary"}`;
        paintClassButton.dataset.ui = "segmentation-active-class";
        paintClassButton.dataset.classId = classId;
        const classDisplayName = manager.getDisplayNameForClass(classId);
        paintClassButton.title = classDisplayName;
        paintClassButton.setAttribute("aria-label", `Paint class ${classDisplayName}`);
        const color = input.documentRef.createElement("span");
        color.className = "segmentation-class-color-chip";
        color.style.background = getColorForClass(classId);
        paintClassButton.append(color, input.documentRef.createTextNode(classId));
        paintClassList?.appendChild(paintClassButton);
      });

      const filterControls = input.documentRef.createElement("div");
      filterControls.className = "mb-2";

      const filterTitle = input.documentRef.createElement("div");
      filterTitle.className = "mb-1 small text-muted";
      filterTitle.textContent = "Display filter";
      filterControls.appendChild(filterTitle);

      const allVisibleButton = input.documentRef.createElement("button");
      allVisibleButton.type = "button";
      allVisibleButton.className = `btn btn-sm me-1 mb-1 ${summary.hiddenClassIds.length === 0 ? "btn-primary" : "btn-outline-primary"}`;
      allVisibleButton.textContent = "All";
      allVisibleButton.dataset.ui = "segmentation-filter-all";
      filterControls.appendChild(allVisibleButton);

      segmentationClassIds.forEach((classId) => {
        const filterButton = input.documentRef.createElement("button");
        filterButton.type = "button";
        const isOnlyVisible = summary.visibleClassIds.length === 1 && summary.visibleClassIds[0] === classId;
        filterButton.className = `btn btn-sm me-1 mb-1 ${isOnlyVisible ? "btn-secondary active" : "btn-outline-secondary"}`;
        filterButton.textContent = manager.getDisplayNameForClass(classId);
        filterButton.dataset.ui = "segmentation-filter-class";
        filterButton.dataset.classId = classId;
        filterControls.appendChild(filterButton);
      });

      elements.segmentationClassSummary.appendChild(filterControls);

      const title = input.documentRef.createElement("div");
      title.className = "mb-2 small text-muted";
      title.textContent = "Visibility";
      elements.segmentationClassSummary.appendChild(title);

      segmentationClassIds.forEach((classId) => {
        const wrapper = input.documentRef.createElement("div");
        wrapper.className = "form-check d-flex align-items-center justify-content-between gap-2 mb-1";
        wrapper.dataset.classId = classId;
        wrapper.dataset.ui = "segmentation-class-visibility-item";

        const checkbox = input.documentRef.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "form-check-input";
        checkbox.checked = !summary.hiddenClassIds.includes(classId);
        checkbox.dataset.classId = classId;
        checkbox.dataset.ui = "segmentation-class-visibility-toggle";

        const label = input.documentRef.createElement("span");
        label.className = "small text-start";
        const color = input.documentRef.createElement("span");
        color.className = "segmentation-class-color-chip";
        color.style.background = getColorForClass(classId);
        label.append(color, input.documentRef.createTextNode(manager.getDisplayNameForClass(classId)));

        wrapper.append(checkbox, label);
        elements.segmentationClassSummary.appendChild(wrapper);
      });
    } else {
      if (paintClassList) paintClassList.textContent = "";
      elements.segmentationClassSummary.textContent = visibleClassIds.length > 0
        ? `Visible Classes: ${visibleClassIds.map((classId) => manager.getDisplayNameForClass(classId)).join(", ")}`
        : "Visible Classes: none";
    }
  };

  const syncWorkflowPanels = (): void => {
    const showSegmentationControls = input.state.session.workflow === "segmentation";
    elements.inspectorSubtitle.hidden = showSegmentationControls;
    renderWorkflowPanels({
      activeWorkflow: input.state.session.workflow,
      detectionPanelElement: elements.detectionWorkflowPanel,
      segmentationPanelElement: elements.segmentationWorkflowPanel
    });
    elements.segmentationAutoFillClosedRegionGroup.hidden = !showSegmentationControls;
    const segmentationWorkspace = input.documentRef.getElementById("segmentationLeftWorkspace");
    const segmentationDisplayWorkspace = input.documentRef.getElementById("segmentationDisplayWorkspace");
    const segmentationSuperpixelWorkspace = input.documentRef.getElementById("segmentationSuperpixelWorkspace");
    const detectionDisplayWorkspace = input.documentRef.getElementById("detectionDisplayWorkspace");
    const detectionWorkspace = input.documentRef.getElementById("detectionLeftWorkspace");
    const detectionDisplayTaskButton = input.documentRef.getElementById("taskDetectionDisplayBtn");
    const preprocessingTaskButton = input.documentRef.getElementById("taskPreprocessingBtn");
    const sectionIds = ["segmentationClassSection"];
    const isPreprocessingTask = activeTask === "preprocessing";
    const isSegmentationTask = activeTask === "segmentation" || activeTask === "superpixel" || activeTask === "segmentation-display";
    const visibleSectionIds = showSegmentationControls ? ["segmentationClassSection"] : [];
    [elements.taskSegmentationBtn, elements.taskSuperpixelBtn, elements.taskSegmentationDisplayBtn]
      .filter((button): button is HTMLButtonElement => Boolean(button))
      .forEach((button) => {
      button.hidden = !showSegmentationControls;
    });
    [elements.taskAnnotateBtn, detectionDisplayTaskButton, elements.taskAutomateBtn, elements.taskReviewBtn]
      .filter((button): button is HTMLButtonElement => Boolean(button))
      .forEach((button) => {
      button.hidden = showSegmentationControls;
    });
    if (preprocessingTaskButton) preprocessingTaskButton.hidden = false;
    input.documentRef.getElementById("reviewFilterControl")?.toggleAttribute("hidden", showSegmentationControls);
    input.documentRef.getElementById("segmentationFormatShortcut")?.toggleAttribute("hidden", !showSegmentationControls);
    const genericModeControls = input.documentRef.getElementById("genericModeControls");
    const sharedToolSection = input.documentRef.getElementById("sharedToolSection");
    const detectionCanvasToolbar = input.documentRef.getElementById("detectionCanvasToolbar");
    const segmentationCanvasToolbar = input.documentRef.getElementById("segmentationCanvasToolbar");
    const segmentationToolSizeSection = input.documentRef.getElementById("segmentationToolSizeSection");
    const segmentationAiPreviewSection = input.documentRef.getElementById("segmentationAiPreviewSection");
    const segmentationPolygonActionsSection = input.documentRef.getElementById("segmentationPolygonActionsSection");
    if (showSegmentationControls) {
      const isLeftSegmentationWorkspace = isPreprocessingTask || activeTask === "segmentation-display" || activeTask === "superpixel";
      segmentationWorkspace?.toggleAttribute("hidden", !isLeftSegmentationWorkspace);
      detectionDisplayWorkspace?.setAttribute("hidden", "");
      detectionWorkspace?.toggleAttribute("hidden", isLeftSegmentationWorkspace);
      segmentationDisplayWorkspace?.toggleAttribute("hidden", activeTask !== "segmentation-display");
      segmentationSuperpixelWorkspace?.toggleAttribute("hidden", activeTask !== "superpixel");
      genericModeControls?.setAttribute("hidden", "");
      detectionCanvasToolbar?.setAttribute("hidden", "");
      segmentationCanvasToolbar?.removeAttribute("hidden");
      [segmentationToolSizeSection, segmentationAiPreviewSection, segmentationPolygonActionsSection].forEach((section) => {
        if (section && sharedToolSection) {
          sharedToolSection.appendChild(section);
          if (section === segmentationAiPreviewSection) {
            const activeTool = getCanvasController()?.raw.getSegmentationSummary?.().activeTool;
            section.hidden = activeTool !== "ai-select";
          } else if (section === segmentationPolygonActionsSection) {
            const activeTool = getCanvasController()?.raw.getSegmentationSummary?.().activeTool;
            section.hidden = activeTool !== "polygon";
          } else {
            const activeTool = getCanvasController()?.raw.getSegmentationSummary?.().activeTool;
            section.hidden = activeTool !== "brush" && activeTool !== "erase";
          }
        }
      });
      sectionIds.forEach((sectionId) => {
        const section = input.documentRef.getElementById(sectionId);
        if (section) {
          elements.segmentationWorkflowPanel.appendChild(section);
          section.hidden = !visibleSectionIds.includes(sectionId);
        }
      });
      const preprocessingSection = input.documentRef.getElementById("segmentationPreprocessingSection");
      if (preprocessingSection && segmentationWorkspace) {
        preprocessingSection.hidden = !isPreprocessingTask;
      }
      elements.inspectorTitle.textContent = "Mask Inspector";
      elements.inspectorSubtitle.textContent = "Selected region details and immediate edits";
    } else {
      segmentationWorkspace?.toggleAttribute("hidden", !isPreprocessingTask);
      segmentationDisplayWorkspace?.setAttribute("hidden", "");
      segmentationSuperpixelWorkspace?.setAttribute("hidden", "");
      detectionDisplayWorkspace?.toggleAttribute("hidden", activeTask !== "detection-display");
      detectionWorkspace?.toggleAttribute("hidden", activeTask === "detection-display" || isPreprocessingTask);
      genericModeControls?.removeAttribute("hidden");
      detectionCanvasToolbar?.removeAttribute("hidden");
      segmentationCanvasToolbar?.setAttribute("hidden", "");
      const panel = elements.segmentationWorkflowPanel;
      [segmentationToolSizeSection, segmentationAiPreviewSection, segmentationPolygonActionsSection].forEach((section) => {
        if (section) {
          panel.appendChild(section);
          section.hidden = true;
        }
      });
      sectionIds.forEach((sectionId) => {
        const section = input.documentRef.getElementById(sectionId);
        if (section) {
          panel.appendChild(section);
          section.hidden = false;
        }
      });
      const preprocessingSection = input.documentRef.getElementById("segmentationPreprocessingSection");
      if (preprocessingSection) {
        preprocessingSection.hidden = !isPreprocessingTask;
      }
    }
    input.documentRef.getElementById("segmentationPreprocessingInputs")?.toggleAttribute("hidden", !showSegmentationControls);
    input.documentRef.getElementById("detectionPreprocessingInputs")?.toggleAttribute("hidden", showSegmentationControls);
  };

  const manager: RuntimeUiManager = {
    elements,

    connect(connectedDeps: UIManagerDeps): void {
      deps = connectedDeps;
      manager.syncWorkspaceState();
    },

    setDirectoryPickerSupport(available: boolean): void {
      directoryPickerAvailable = available;
      elements.fileSystemCompatibilityNotice.hidden = available;
      elements.emptyStateCompatibilityText.hidden = available;
      elements.selectImageFolderBtn.toggleAttribute("disabled", !available);
      elements.loadClassInfoFolderBtn.toggleAttribute("disabled", !available);
      manager.syncWorkspaceState();
    },

    setActiveTask(task: "files" | "annotate" | "detection-display" | "segmentation" | "superpixel" | "segmentation-display" | "preprocessing" | "automate" | "review"): void {
      activeTask = task;
      const isPreprocessingTask = task === "preprocessing";
      const isSegmentationTask = task === "segmentation" || task === "superpixel" || task === "segmentation-display";
      const isLeftWorkspaceTask = isSegmentationTask || isPreprocessingTask;
      const isCompactLeftPanelTask = task === "files" || task === "detection-display" || task === "superpixel" || task === "segmentation-display" || isPreprocessingTask;
      const preprocessingTaskButton = input.documentRef.getElementById("taskPreprocessingBtn");
      const detectionDisplayTaskButton = input.documentRef.getElementById("taskDetectionDisplayBtn");
      const buttons = [elements.taskFilesBtn, elements.taskAnnotateBtn, detectionDisplayTaskButton, elements.taskSegmentationBtn, elements.taskSuperpixelBtn, elements.taskSegmentationDisplayBtn, preprocessingTaskButton, elements.taskAutomateBtn, elements.taskReviewBtn]
        .filter((button): button is HTMLButtonElement => Boolean(button));
      buttons.forEach((button) => {
        const active = button.dataset.task === task;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
        if (active) {
          button.setAttribute("aria-current", "page");
        } else {
          button.removeAttribute("aria-current");
        }
      });
      if (task === "automate") {
        elements.drawModeBtn.checked = false;
        elements.editModeBtn.checked = false;
      } else if (!isSegmentationTask) {
        elements.drawModeBtn.checked = input.state.view.currentMode === "draw";
        elements.editModeBtn.checked = input.state.view.currentMode === "edit";
      }
      syncWorkflowPanels();
      input.documentRef.querySelector<HTMLElement>(".app-workspace")?.setAttribute("data-active-task", task);
      elements.leftPanel.classList.toggle("mobile-open", isCompactLeftPanelTask);
      elements.rightPanel.classList.toggle("mobile-open", !isCompactLeftPanelTask);
      elements.leftPanel.classList.toggle("task-focus", task === "files" || task === "detection-display" || isLeftWorkspaceTask);
      elements.rightPanel.classList.toggle("task-focus", task !== "files");
      elements.expandRightPanelBtn.toggleAttribute("hidden", isPreprocessingTask);
      if (elements.reviewQueueControls) {
        elements.reviewQueueControls.hidden = task !== "review";
      }
      const reviewControls = elements.reviewStatusBadge?.closest<HTMLElement>('[data-ui="review-controls"]');
      if (reviewControls) {
        reviewControls.hidden = task !== "review";
      }

      if (task === "files") {
        manager.togglePanel(elements.leftPanel, elements.leftSplitter, elements.expandLeftPanelBtn, false);
        manager.togglePanel(elements.rightPanel, elements.rightSplitter, elements.expandRightPanelBtn, true);
        elements.imageSearchInput.focus({ preventScroll: true });
        manager.syncWorkspaceState();
        return;
      }

      if (isPreprocessingTask) {
        manager.togglePanel(elements.leftPanel, elements.leftSplitter, elements.expandLeftPanelBtn, false);
        elements.rightPanel.dataset.userCollapsed = "true";
        manager.togglePanel(elements.rightPanel, elements.rightSplitter, elements.expandRightPanelBtn, true);
        elements.inspectorTitle.textContent = "Inspector";
        elements.inspectorSubtitle.textContent = "Closed while image preprocessing is active";
      } else if (isLeftWorkspaceTask) {
        manager.togglePanel(elements.leftPanel, elements.leftSplitter, elements.expandLeftPanelBtn, false);
        elements.rightPanel.dataset.userCollapsed = "false";
        manager.togglePanel(elements.rightPanel, elements.rightSplitter, elements.expandRightPanelBtn, false);
        elements.inspectorTitle.textContent = "Mask Inspector";
        elements.inspectorSubtitle.textContent = "Selected region details and immediate edits";
      } else if (task === "automate") {
        manager.togglePanel(elements.rightPanel, elements.rightSplitter, elements.expandRightPanelBtn, false);
        manager.setInspectorTab("automation");
        elements.automationPresetSelect.focus({ preventScroll: true });
      } else if (task === "review") {
        manager.togglePanel(elements.rightPanel, elements.rightSplitter, elements.expandRightPanelBtn, false);
        const hasIssues = [...input.state.session.reviewFindings.values()].some((finding) => finding.issues.length > 0);
        input.state.view.reviewFilter = hasIssues ? "has-issues" : "needs-review";
        elements.reviewFilterSelect.value = input.state.view.reviewFilter;
        manager.setInspectorTab("annotation");
        elements.inspectorTitle.textContent = "Review Inspector";
        elements.inspectorSubtitle.textContent = "Resolve quality issues and mark each image reviewed";
        manager.renderImageList();
        elements.reviewFilterSelect.focus({ preventScroll: true });
      } else {
        manager.togglePanel(elements.rightPanel, elements.rightSplitter, elements.expandRightPanelBtn, false);
        manager.togglePanel(elements.leftPanel, elements.leftSplitter, elements.expandLeftPanelBtn, false);
        elements.inspectorTitle.textContent = "Annotation Inspector";
        manager.setInspectorTab(activeInspectorTab === "transform" ? "transform" : "annotation");
      }
      manager.syncWorkspaceState();
    },

    setInspectorTab(tab: "annotation" | "transform" | "automation"): void {
      activeInspectorTab = tab;
      const controls = [
        { id: "annotation", button: elements.inspectorAnnotationTabBtn, pane: elements.inspectorAnnotationPane },
        { id: "transform", button: elements.inspectorTransformTabBtn, pane: elements.inspectorTransformPane },
        { id: "automation", button: elements.inspectorAutomationTabBtn, pane: elements.inspectorAutomationPane }
      ] as const;
      controls.forEach((control) => {
        const active = control.id === tab;
        control.button.classList.toggle("active", active);
        control.button.setAttribute("aria-selected", String(active));
        control.button.tabIndex = active ? 0 : -1;
        control.pane.classList.toggle("active", active);
        control.pane.hidden = !active;
      });
    },

    setLabelDisplayMode(mode: LabelDisplayMode, persist = true): void {
      input.state.view.labelDisplayMode = mode;
      input.state.view.showLabelsOnCanvas = mode !== "off";
      elements.labelDisplayModeSelect.value = mode;
      elements.showLabelsOnCanvasToggle.checked = mode !== "off";
      getCanvasController()?.raw.setLabelDisplayMode?.(mode);
      if (persist) {
        input.storage.setItem("easy-labeling:label-display-mode", mode);
      }
      manager.syncWorkspaceState();
    },

    syncSelectionInspector(): void {
      const rects = selectedDetectionRects();
      const selectionCount = rects.length;
      elements.selectedAnnotationCount.textContent = String(selectionCount);
      elements.selectionEmptyState.hidden = selectionCount > 0;
      elements.selectionDetails.hidden = selectionCount === 0;
      if (activeTask === "annotate") {
        elements.inspectorSubtitle.textContent = input.state.session.workflow === "segmentation"
          ? "Paint and inspect mask regions"
          : selectionCount === 0
            ? "No annotation selected"
            : `${selectionCount} annotation${selectionCount === 1 ? "" : "s"} selected`;
      }

      const availableClasses = [...new Set([
        ...input.state.session.classNames.keys(),
        ...rects.map((rect) => rect.labelClass ?? "").filter(Boolean)
      ])].sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));
      const selectedClasses = [...new Set(rects.map((rect) => rect.labelClass ?? ""))];
      const classValue = selectedClasses.length === 1 ? selectedClasses[0] : "";
      elements.selectionClassSelect.replaceChildren();
      const placeholder = input.documentRef.createElement("option");
      placeholder.value = "";
      placeholder.textContent = selectionCount > 1 && selectedClasses.length > 1 ? "Multiple classes" : "Choose class";
      elements.selectionClassSelect.appendChild(placeholder);
      availableClasses.forEach((classId) => {
        const option = input.documentRef.createElement("option");
        option.value = classId;
        option.textContent = manager.getDisplayNameForClass(classId);
        elements.selectionClassSelect.appendChild(option);
      });
      elements.selectionClassSelect.value = classValue;
      elements.selectionClassSelect.disabled = selectionCount === 0;

      const oneRect = selectionCount === 1 ? rects[0] : null;
      const bounds = oneRect?.getBoundingRect(true);
      const geometryInputs = [
        elements.selectionGeometryX,
        elements.selectionGeometryY,
        elements.selectionGeometryWidth,
        elements.selectionGeometryHeight
      ];
      const geometryValues = bounds
        ? [bounds.left, bounds.top, bounds.width, bounds.height]
        : [Number.NaN, Number.NaN, Number.NaN, Number.NaN];
      geometryInputs.forEach((field, index) => {
        field.value = Number.isFinite(geometryValues[index]) ? String(Math.round(geometryValues[index])) : "";
        field.disabled = !oneRect;
      });
      elements.duplicateSelectionBtn.disabled = selectionCount === 0;
      elements.hideSelectionBtn.disabled = selectionCount === 0;
      elements.deleteSelectionBtn.disabled = selectionCount === 0;
    },

    syncWorkspaceState(): void {
      const canvasController = getCanvasController();
      const currentFile = input.state.session.currentImageFile;
      const currentImage = input.state.session.currentImage;
      const hasImage = Boolean(currentFile && currentImage);
      const isCompactViewport = input.documentRef.defaultView?.matchMedia("(max-width: 800px)").matches ?? false;
      const imageCount = input.state.session.imageFiles.length;
      const rectCount = canvasController?.raw.getObjects("rect").filter(isRectObject).length ?? 0;
      const segmentationSummary = canvasController?.raw.getSegmentationSummary?.();
      const annotationCount = input.state.session.workflow === "detection"
        ? rectCount
        : segmentationSummary?.allClassIds.length ?? 0;
      const folderName = input.state.session.imageFolderHandle?.name;
      const documentStatus = getCurrentDocumentStatus(input.state);
      const phase = documentStatus?.phase ?? "clean";
      const baseStatusText = !hasImage
        ? "Ready"
        : phase === "dirty"
          ? "Unsaved changes"
          : phase === "saving"
            ? (documentStatus?.wasAutoSaved ? "Auto saving..." : "Saving...")
            : phase === "saved"
              ? (documentStatus?.wasAutoSaved ? "Auto saved" : "Saved")
              : phase === "error"
                ? "Save failed"
                : "Loaded";
      const statusText = hasImage && input.state.view.isAutoSaveEnabled && phase !== "saving" && phase !== "saved"
        ? `${baseStatusText} · Auto save on`
        : baseStatusText;

      elements.canvasEmptyState.hidden = hasImage;
      if (!hasImage && isCompactViewport) {
        elements.leftPanel.classList.remove("mobile-open");
        elements.rightPanel.classList.remove("mobile-open");
      }
      elements.imageCountBadge.textContent = String(imageCount);
      const leftPanelTitle = input.documentRef.getElementById("leftPanelTitle");
      if (activeTask === "preprocessing") {
        if (leftPanelTitle) leftPanelTitle.textContent = "Image Preprocessing";
        elements.datasetConnectionStatus.textContent = input.state.session.workflow === "segmentation"
          ? "Preview processing; AI Select and Superpixel use the sources selected below"
          : "Preview processing; Automation uses the source selected below";
        elements.datasetConnectionStatus.hidden = false;
      } else if (activeTask === "segmentation-display") {
        if (leftPanelTitle) leftPanelTitle.textContent = "Mask Display";
        elements.datasetConnectionStatus.textContent = "";
        elements.datasetConnectionStatus.hidden = true;
      } else if (activeTask === "superpixel") {
        if (leftPanelTitle) leftPanelTitle.textContent = "Superpixel Settings";
        elements.datasetConnectionStatus.textContent = "";
        elements.datasetConnectionStatus.hidden = true;
      } else if (activeTask === "detection-display") {
        if (leftPanelTitle) leftPanelTitle.textContent = "Display Settings";
        elements.datasetConnectionStatus.textContent = "";
        elements.datasetConnectionStatus.hidden = true;
      } else {
        if (leftPanelTitle) leftPanelTitle.textContent = "Files & Classes";
        elements.datasetConnectionStatus.hidden = false;
        elements.datasetConnectionStatus.textContent = folderName
          ? `${folderName} · ${imageCount} image${imageCount === 1 ? "" : "s"}`
          : "No dataset connected";
      }
      elements.refreshDatasetBtn.disabled = !folderName;
      elements.selectLabelFolderBtn.toggleAttribute("disabled", !directoryPickerAvailable || !folderName);
      (elements.prevImageBtn as HTMLButtonElement).disabled = imageCount < 2;
      (elements.nextImageBtn as HTMLButtonElement).disabled = imageCount < 2;
      (elements.saveLabelsBtn as HTMLButtonElement).disabled = !hasImage;
      elements.headerDocumentStatus.dataset.state = phase;
      elements.documentStatus.dataset.state = phase;
      elements.headerDocumentStatus.title = documentStatus?.errorMessage ?? statusText;
      elements.documentStatus.title = documentStatus?.errorMessage ?? statusText;
      setStatusText(elements.headerDocumentStatus, statusText);
      setStatusText(elements.documentStatus, `Status: ${statusText}`);
      setStatusText(elements.statusImageInfo, currentFile && currentImage
        ? `${currentFile.name} · ${currentImage.width} × ${currentImage.height}`
        : "No image loaded");
      setStatusText(elements.statusAnnotationInfo, input.state.session.workflow === "detection"
        ? `Annotations: ${annotationCount}`
        : `Mask classes: ${annotationCount}`);
      setStatusText(elements.statusMode, `${input.state.session.workflow === "detection" ? "Detection" : "Segmentation"} · ${input.state.view.currentMode === "draw" ? "Draw" : "Edit"} · ${input.state.session.workflow === "detection" ? "TXT" : "PNG/JSON"}`);
      if (input.state.session.workflow === "segmentation") {
        elements.inspectorTitle.textContent = "Mask Inspector";
        elements.inspectorSubtitle.textContent = "Selected region details and immediate edits";
      } else if (activeTask === "automate") {
        const engineState = elements.matchingEngineStatus.dataset.state;
        elements.inspectorTitle.textContent = "Automation Workspace";
        elements.inspectorSubtitle.textContent = engineState === "ready"
          ? "Matching engine ready"
          : engineState === "error"
            ? "Matching engine requires retry"
            : "Matching engine loading";
      } else if (activeTask === "review") {
        elements.inspectorTitle.textContent = "Review Inspector";
        elements.inspectorSubtitle.textContent = "Resolve quality issues and mark each image reviewed";
      } else {
        elements.inspectorTitle.textContent = "Annotation Inspector";
      }
      elements.inspectorSubtitle.hidden = input.state.session.workflow === "segmentation";
      const segmentationToolLabels: Record<string, string> = {
        brush: "Brush",
        erase: "Erase",
        polygon: "Polygon",
        superpixel: "Superpixel",
        "ai-select": "AI Select",
      };
      elements.activeToolSummary.textContent = input.state.view.currentMode === "draw"
        ? (input.state.session.workflow === "segmentation" ? segmentationToolLabels[segmentationSummary?.activeTool ?? "brush"] ?? "Brush" : "Draw")
        : "Edit";
      elements.labelDisplayModeSelect.value = input.state.view.labelDisplayMode ?? "auto";
      manager.syncSelectionInspector();
      if (input.state.session.workflow === "segmentation") {
        syncSegmentationPanelState();
      }
    },

    getDisplayNameForClass(labelClass: string | undefined): string {
      const normalized = labelClass ?? "";
      if (input.state.session.classNames.has(normalized)) {
        return `${normalized}: ${input.state.session.classNames.get(normalized)}`;
      }
      return normalized;
    },

    updateLabelFolderButton(hasLabelFolder: boolean): void {
      const button = elements.selectLabelFolderBtn;
      const folderName = input.state.session.labelFolderHandle?.name ?? "";

      if (hasLabelFolder && folderName) {
        button.classList.remove("btn-secondary", "btn-danger");
        button.classList.add("btn-success");
        button.setAttribute("aria-label", `Label folder: ${folderName}`);
        button.setAttribute("title", `Label folder: ${folderName}`);
        button.innerHTML = '<i class="bi bi-folder-check" aria-hidden="true"></i>';
        return;
      }

      button.classList.remove("btn-success");
      button.classList.add("btn-danger");
      button.setAttribute("aria-label", "Connect label folder");
      button.setAttribute("title", "Connect label folder");
      button.innerHTML = '<i class="bi bi-folder-x" aria-hidden="true"></i>';
    },

    setWorkflow(workflow: WorkflowType): void {
      const workflowChanged = displayedWorkflow !== workflow;
      input.state.session.workflow = workflow;
      syncSegmentationPanelState();
      syncWorkflowPanels();
      elements.taskAutomateBtn.disabled = workflow !== "detection";
      if (elements.taskReviewBtn) {
        elements.taskReviewBtn.disabled = workflow !== "detection";
      }
      if (workflow === "segmentation") {
        if (workflowChanged && activeTask !== "preprocessing") {
          manager.setActiveTask("segmentation");
        }
      } else if (activeTask === "segmentation" || activeTask === "superpixel" || activeTask === "segmentation-display") {
        manager.setActiveTask("annotate");
      }
      displayedWorkflow = workflow;
      manager.updateLabelList();
      manager.renderImageList();
      manager.syncWorkspaceState();
    },

    async promptForLabelClass(defaultValue: string): Promise<string> {
      const canvasController = getCanvasController();
      const rects = canvasController?.raw.getObjects("rect") ?? [];
      const classOptions = [...new Set([
        ...Array.from(input.state.session.classNames.keys()),
        ...rects.map((rect) => rect.labelClass ?? "").filter(Boolean)
      ])]
        .sort((left, right) => Number.parseInt(left, 10) - Number.parseInt(right, 10))
        .map((id) => ({ id, displayName: manager.getDisplayNameForClass(id) }));

      renderLabelClassModalContent({
        defaultValue,
        labelClassInputElement: elements.labelClassInput,
        classSelectionContainerElement: elements.classSelectionContainer,
        classOptions
      });

      const setLabelClassError = (error: unknown | null): void => {
        elements.labelClassInput.classList.toggle("is-invalid", error !== null);
        elements.labelClassError.hidden = error === null;
        elements.labelClassError.textContent = error instanceof Error ? error.message : "";
      };
      setLabelClassError(null);

      elements.labelClassModal.show();
      elements.labelClassInput.focus();
      elements.labelClassInput.select();

      return new Promise<string>((resolve, reject) => {
        const cleanup = (): void => {
          elements.saveLabelClassBtn.removeEventListener("click", onSave);
          elements.labelClassModal._element?.removeEventListener("hidden.bs.modal", onHidden as EventListener);
          elements.labelClassInput.removeEventListener("keydown", onKeyDown);
          elements.labelClassInput.removeEventListener("input", onInput);
        };

        const onSave = (): void => {
          let validated: string;
          try {
            validated = parseNonNegativeClassId(elements.labelClassInput.value);
          } catch (error: unknown) {
            setLabelClassError(error);
            elements.labelClassInput.focus();
            return;
          }

          setLabelClassError(null);
          elements.labelClassInput.value = validated;
          cleanup();
          elements.labelClassModal.hide();
          resolve(validated);
        };

        const onHidden = (): void => {
          cleanup();
          reject(new Error("Label prompt cancelled"));
        };

        const onKeyDown = (event: KeyboardEvent): void => {
          if (event.key === "Enter") {
            event.preventDefault();
            onSave();
            return;
          }
          if (event.key === "Escape") {
            event.preventDefault();
            elements.labelClassModal.hide();
          }
        };

        const onInput = (): void => setLabelClassError(null);

        elements.saveLabelClassBtn.addEventListener("click", onSave);
        elements.labelClassModal._element?.addEventListener("hidden.bs.modal", onHidden as EventListener, { once: true });
        elements.labelClassInput.addEventListener("keydown", onKeyDown);
        elements.labelClassInput.addEventListener("input", onInput);
      });
    },

    async promptForClassFileName(defaultValue: string, existingNames: string[]): Promise<string | null> {
      const inputElement = elements.newClassFileNameInput;
      const errorElement = elements.newClassFileNameError;
      const saveButton = elements.confirmCreateClassFileBtn;
      const modalElement = elements.createClassFileModal._element;

      const setError = (error: unknown | null): void => {
        inputElement.classList.toggle("is-invalid", error !== null);
        errorElement.hidden = error === null;
        errorElement.textContent = error instanceof Error ? error.message : "";
      };

      inputElement.value = defaultValue;
      setError(null);
      elements.createClassFileModal.show();
      inputElement.focus();
      inputElement.select();

      return new Promise<string | null>((resolve) => {
        const cleanup = (): void => {
          saveButton.removeEventListener("click", onSave);
          modalElement?.removeEventListener("hidden.bs.modal", onHidden as EventListener);
          inputElement.removeEventListener("keydown", onKeyDown);
          inputElement.removeEventListener("input", onInput);
        };
        const onSave = (): void => {
          try {
            const fileName = validateNewClassFileName(inputElement.value, existingNames);
            setError(null);
            cleanup();
            elements.createClassFileModal.hide();
            resolve(fileName);
          } catch (error: unknown) {
            setError(error);
            inputElement.focus();
          }
        };
        const onHidden = (): void => {
          cleanup();
          resolve(null);
        };
        const onKeyDown = (event: KeyboardEvent): void => {
          if (event.key === "Enter") {
            event.preventDefault();
            onSave();
          }
        };
        const onInput = (): void => setError(null);

        saveButton.addEventListener("click", onSave);
        modalElement?.addEventListener("hidden.bs.modal", onHidden as EventListener, { once: true });
        inputElement.addEventListener("keydown", onKeyDown);
        inputElement.addEventListener("input", onInput);
      });
    },

    confirmMissingLabelFolderCreation(): Promise<boolean> {
      const modalElement = input.documentRef.getElementById("missingLabelFolderModal");
      const createButton = input.documentRef.getElementById("createMissingLabelFolderBtn");
      if (!modalElement || !createButton) {
        throw new Error("The missing label folder confirmation dialog is unavailable.");
      }

      missingLabelFolderModal ??= new input.bootstrapRef.Modal(modalElement, { backdrop: "static", keyboard: true });
      const modal = missingLabelFolderModal;
      return new Promise<boolean>((resolve) => {
        let settled = false;
        const cleanup = (): void => {
          createButton.removeEventListener("click", onCreate);
          modalElement.removeEventListener("hidden.bs.modal", onHidden);
        };
        const settle = (value: boolean): void => {
          if (settled) {
            return;
          }
          settled = true;
          cleanup();
          resolve(value);
        };
        const onCreate = (): void => {
          modal.hide();
          settle(true);
        };
        const onHidden = (): void => settle(false);

        createButton.addEventListener("click", onCreate);
        modalElement.addEventListener("hidden.bs.modal", onHidden);
        modal.show();
      });
    },

    notify(message: string, duration = 3000): void {
      showToast(input.documentRef, message, duration);
    },

    updateZoomDisplay(zoomLevel?: number): void {
      const resolvedZoom = typeof zoomLevel === "number" ? zoomLevel : 1;
      elements.zoomInput.value = `${Math.round(resolvedZoom * 100)}`;
    },

    applyDarkMode(enabled: boolean): void {
      applyDarkMode({
        enabled,
        bodyElement: input.documentRef.body,
        documentRef: input.documentRef,
        storage: input.storage
      });
    },

    restoreDarkModeFromStorage(): void {
      const enabled = readStoredDarkMode(input.storage);
      elements.darkModeToggle.checked = enabled;
      if (enabled) {
        manager.applyDarkMode(true);
      }
      const storedLabelMode = input.storage.getItem("easy-labeling:label-display-mode");
      const allowedModes = new Set<LabelDisplayMode>(["auto", "full", "compact", "selected", "off"]);
      manager.setLabelDisplayMode(
        allowedModes.has(storedLabelMode as LabelDisplayMode) ? storedLabelMode as LabelDisplayMode : "auto",
        false
      );
    },

    renderImageList(): void {
      const fileSystem = getFileSystem();
      renderImageList({
        imageListElement: elements.imageList,
        imageFiles: input.state.session.imageFiles,
        imageWorkflowStatus: input.state.session.imageWorkflowStatus,
        activeWorkflow: input.state.session.workflow,
        currentImageFile: input.state.session.currentImageFile,
        searchTerm: elements.imageSearchInput.value,
        showLabeled: elements.showLabeledCheckbox.checked,
        showUnlabeled: elements.showUnlabeledCheckbox.checked,
        reviewFilter: input.state.view.reviewFilter,
        reviewState: input.state.session.reviewState,
        reviewFindings: input.state.session.reviewFindings,
        onImageClick: (file) => {
          fileSystem?.loadImage(file).catch((error: unknown) => {
            const message = error instanceof Error ? error.message : "Unexpected error";
            manager.notify(message, 4000);
          });
        }
      });
      manager.renderReviewPanel();
      manager.syncWorkspaceState();
    },

    renderReviewPanel(): void {
      if (input.state.session.workflow !== "detection") {
        elements.reviewIssueList.replaceChildren();
        return;
      }
      if (!elements.reviewStatusBadge || !input.state.session.reviewState || !input.state.session.reviewFindings) {
        return;
      }
      const imageName = input.state.session.currentImageFile?.name;
      const record = imageName ? input.state.session.reviewState.images[imageName] : undefined;
      const status = record?.status ?? "needs-review";
      const finding = imageName ? input.state.session.reviewFindings.get(imageName) : null;
      elements.reviewStatusBadge.textContent = status === "reviewed" ? "Reviewed" : "Needs review";
      elements.reviewStatusBadge.dataset.state = status;
      elements.markReviewedBtn.disabled = !imageName || status === "reviewed";
      elements.markNeedsReviewBtn.disabled = !imageName || status === "needs-review";
      elements.reviewMinimumBoxSizeInput.value = String(input.state.session.reviewState.settings.minimumBoxSizePx);
      elements.reviewDuplicateIouInput.value = String(input.state.session.reviewState.settings.duplicateIouThreshold);
      elements.reviewRequiredClassesInput.value = input.state.session.reviewState.settings.requiredClassIds.join(", ");
      elements.saveReviewRulesBtn.disabled = !input.state.session.imageFolderHandle;
      const queueItems = [...elements.imageList.querySelectorAll<HTMLElement>("[data-file-name]")];
      const currentImageName = input.state.session.currentImageFile?.name;
      const currentQueueIndex = queueItems.findIndex((item) => item.dataset.fileName === currentImageName);
      elements.reviewQueueSummary.textContent = queueItems.length === 0
        ? "0"
        : currentQueueIndex >= 0
          ? `${currentQueueIndex + 1} / ${queueItems.length}`
          : String(queueItems.length);
      elements.previousReviewIssueBtn.disabled = queueItems.length < 2 || currentQueueIndex <= 0;
      elements.nextReviewIssueBtn.disabled = queueItems.length < 2 || currentQueueIndex < 0 || currentQueueIndex >= queueItems.length - 1;
      elements.reviewIssueList.replaceChildren();
      const issues = finding?.issues ?? [];
      const empty = input.documentRef.createElement("div");
      empty.className = "list-group-item text-muted py-2";
      empty.textContent = imageName ? (issues.length ? "" : "No quality issues found.") : "Open an image to review it.";
      if (!issues.length) {
        elements.reviewIssueList.appendChild(empty);
        return;
      }
      const canvasController = getCanvasController();
      const rects = canvasController?.raw.getObjects("rect").filter(isRectObject) ?? [];
      issues.forEach((issue, index) => {
        const button = input.documentRef.createElement("button");
        button.type = "button";
        const targets = [...new Set(issue.rectIndexes)]
          .map((rectIndex) => ({ rectIndex, rect: rects[rectIndex] }))
          .filter((target): target is { rectIndex: number; rect: FabricRectLike } => Boolean(target.rect));
        button.className = `review-issue-item list-group-item list-group-item-action py-2 ${issue.severity === "error" ? "list-group-item-danger" : "list-group-item-warning"}`;
        button.dataset.reviewIssueIndex = String(index);
        button.setAttribute("aria-pressed", "false");

        const heading = input.documentRef.createElement("span");
        heading.className = "review-issue-heading";
        const severity = input.documentRef.createElement("span");
        severity.className = "review-issue-severity";
        severity.textContent = issue.severity === "error" ? "Error" : "Warning";
        const type = input.documentRef.createElement("span");
        type.className = "review-issue-type";
        type.textContent = getReviewIssueTypeLabel(issue.type);
        heading.append(severity, type);

        const message = input.documentRef.createElement("span");
        message.className = "review-issue-message";
        message.textContent = issue.message;

        const targetList = input.documentRef.createElement("span");
        targetList.className = "review-issue-targets";
        if (targets.length === 0) {
          const noTarget = input.documentRef.createElement("span");
          noTarget.className = "review-issue-no-target";
          noTarget.textContent = "No target label";
          targetList.appendChild(noTarget);
        } else {
          targets.forEach(({ rectIndex, rect }) => {
            const target = input.documentRef.createElement("span");
            target.className = "review-issue-target";
            const swatch = input.documentRef.createElement("span");
            swatch.className = "label-color-swatch";
            swatch.style.backgroundColor = getColorForClass(rect.labelClass);
            const targetText = input.documentRef.createElement("span");
            targetText.textContent = `Box #${rectIndex + 1} · ${manager.getDisplayNameForClass(rect.labelClass)}`;
            target.append(swatch, targetText);
            targetList.appendChild(target);
          });
        }
        button.append(heading, message, targetList);
        elements.reviewIssueList.appendChild(button);
      });
    },

    renderClassFileSelect(): void {
      renderClassFileSelect(
        elements.classFileSelect,
        input.state.session.classFiles,
        input.state.session.selectedClassFile?.name ?? null
      );
    },

    toggleAllLabelVisibility(): void {
      const canvasController = getCanvasController();
      if (!canvasController) {
        return;
      }

      if (input.state.session.workflow === "segmentation") {
        const visible = canvasController.raw.getSegmentationSummary?.()?.overlayVisible ?? true;
        canvasController.raw.setSegmentationOverlayVisibility?.(!visible);
        syncSegmentationPanelState();
        return;
      }

      const rects = canvasController.raw.getObjects("rect").filter(isRectObject);
      input.state.view.hiddenLabelClasses = toggleAllLabelClasses(
        rects.map((rect) => rect.labelClass),
        input.state.view.hiddenLabelClasses
      );
      canvasController.raw.applyVisibilityFromHiddenClasses(
        input.state.view.hiddenLabelClasses,
        input.state.view.clearSelectionWhenFilteredHidden
      );
      manager.updateLabelList();
    },

    updateLabelList(): void {
      const canvasController = getCanvasController();
      if (!canvasController) {
        return;
      }

      if (input.state.session.workflow === "segmentation") {
        elements.labelList.innerHTML = "";
        const emptyState = input.documentRef.createElement("div");
        emptyState.className = "label-list-empty list-group-item text-muted";
        emptyState.dataset.ui = "label-list-empty";
        emptyState.textContent = "Segmentation labels are shown in Mask workspace.";
        elements.labelList.appendChild(emptyState);
        elements.labelFilters.innerHTML = "";
        renderSelectByClassDropdown(elements.selectByClassDropdown, [], (labelClass) => manager.getDisplayNameForClass(labelClass));
        manager.syncWorkspaceState();
        return;
      }

      const rects = canvasController.raw.getObjects("rect").filter(isRectObject);
      const visibleRects = rects.filter((rect) => {
        const classKey = normalizeFilterClassKey(rect.labelClass);
        return !input.state.view.hiddenLabelClasses.has(classKey);
      });
      const visibilitySummary = deriveVisibilitySummary(
        rects.map((rect) => rect.labelClass),
        input.state.view.hiddenLabelClasses
      );

      elements.labelList.innerHTML = "";
      const groupedRects = visibleRects.reduce<Map<string, typeof visibleRects>>((groups, rect) => {
        const key = rect.labelClass ?? "";
        const existing = groups.get(key) ?? [];
        existing.push(rect);
        groups.set(key, existing);
        return groups;
      }, new Map());

      const sortedGroupKeys = [...groupedRects.keys()].sort((left, right) => {
        const leftNumber = Number.parseInt(left, 10);
        const rightNumber = Number.parseInt(right, 10);
        return input.state.view.labelSortOrder === "asc" ? leftNumber - rightNumber : rightNumber - leftNumber;
      });

      sortedGroupKeys.forEach((classId) => {
        const groupRects = groupedRects.get(classId) ?? [];
        const groupContainer = input.documentRef.createElement("div");
        groupContainer.className = "label-group label-group-container";
        groupContainer.dataset.ui = "label-group";
        groupContainer.dataset.groupClass = classId;

        const groupHeader = input.documentRef.createElement("div");
        groupHeader.className = "label-group-header list-group-item label-group-toggle";
        groupHeader.dataset.ui = "label-group-header";
        groupHeader.dataset.groupClass = classId;
        groupHeader.innerHTML = `
          <i class="bi bi-chevron-right label-group-chevron" aria-hidden="true"></i>
          <span class="label-color-swatch" style="background-color: ${getColorForClass(classId)};"></span>
          <span class="label-group-name">${manager.getDisplayNameForClass(classId)}</span>
          <button type="button" class="label-group-select-btn" title="Select all in this group" aria-label="Select all annotations in this class" data-ui="select-group" data-testid="select-group-${classId}"><i class="bi bi-check2-all" aria-hidden="true"></i></button>
          <span class="badge bg-secondary label-group-count">${groupRects.length}</span>
        `;

        const itemsContainer = input.documentRef.createElement("div");
        itemsContainer.className = "label-group-items label-group-list";
        itemsContainer.dataset.ui = "label-group-items";
        itemsContainer.dataset.groupClass = classId;
        const virtualizeGroup = visibleRects.length > 150;
        if (virtualizeGroup && !initializedDenseLabelGroups.has(classId)) {
          initializedDenseLabelGroups.add(classId);
          input.state.view.collapsedLabelGroups.add(classId);
        }
        const isCollapsed = input.state.view.collapsedLabelGroups.has(classId);
        if (isCollapsed) {
          groupHeader.classList.add("collapsed");
          itemsContainer.style.maxHeight = "0";
        }

        groupHeader.addEventListener("click", () => {
          const collapsed = groupHeader.classList.toggle("collapsed");
          if (!collapsed && itemsContainer.children.length === 0) {
            appendGroupItems();
          }
          itemsContainer.style.maxHeight = collapsed ? "0" : `${itemsContainer.scrollHeight}px`;
          if (collapsed) {
            input.state.view.collapsedLabelGroups.add(classId);
          } else {
            input.state.view.collapsedLabelGroups.delete(classId);
          }
        });

        groupHeader.querySelector<HTMLElement>('[data-ui="select-group"]')?.addEventListener("click", (event) => {
          event.stopPropagation();
          canvasController.raw.selectLabelsByClass(classId);
        });

        let renderedItemLimit = virtualizeGroup ? 80 : groupRects.length;
        const appendGroupItems = (): void => {
          itemsContainer.replaceChildren();
          groupRects.slice(0, renderedItemLimit).forEach((rect) => {
          const originalIndex = rects.indexOf(rect);
          const item = input.documentRef.createElement("li");
          item.id = `label-item-${originalIndex}`;
          item.className = "list-group-item label-list-item";
          item.dataset.index = String(originalIndex);
          item.dataset.ui = "label-list-item";
          item.dataset.labelClass = normalizeFilterClassKey(rect.labelClass);

          const activeCanvasObjects = canvasController.raw.canvas.getActiveObjects();
          const activeSelection = activeCanvasObjects.length === 1 && isActiveSelectionObject(activeCanvasObjects[0])
            ? activeCanvasObjects[0]
            : null;
          const isActive = activeCanvasObjects.includes(rect) || (
            activeCanvasObjects.length === 1 &&
            activeSelection !== null &&
            activeSelection.getObjects().includes(rect)
          );
          if (isActive) {
            item.classList.add("active");
          }

          const annotationWidth = Math.round(Math.abs(rect.width * (rect.scaleX ?? 1)));
          const annotationHeight = Math.round(Math.abs(rect.height * (rect.scaleY ?? 1)));
          const annotationSummary = `#${originalIndex + 1} · ${annotationWidth}×${annotationHeight}`;
          const annotationName = `${manager.getDisplayNameForClass(rect.labelClass)} · ${annotationSummary}`;
          item.tabIndex = 0;
          item.setAttribute("aria-label", annotationName);
          item.innerHTML = `<span class="label-list-item-main"><span class="label-color-swatch" style="background-color: ${getColorForClass(rect.labelClass)};"></span><span class="label-list-item-name">${annotationName}</span></span><span class="label-list-item-actions"><button class="btn btn-sm btn-outline-primary edit-btn" data-ui="edit-label" data-testid="edit-label-${originalIndex}" data-index="${originalIndex}" title="Edit annotation" aria-label="Edit annotation ${originalIndex + 1}"><i class="bi bi-pencil" aria-hidden="true"></i></button><button class="btn btn-sm btn-outline-danger delete-btn" data-ui="delete-label" data-testid="delete-label-${originalIndex}" data-index="${originalIndex}" title="Delete annotation" aria-label="Delete annotation ${originalIndex + 1}"><i class="bi bi-trash" aria-hidden="true"></i></button></span>`;
          const selectAnnotation = (): void => {
            canvasController.raw.canvas.setActiveObject(rect);
            canvasController.raw.highlightSelection();
          };
          item.addEventListener("click", (event) => {
            if ((event.target as HTMLElement | null)?.closest('[data-ui="edit-label"], [data-ui="delete-label"]')) {
              return;
            }
            selectAnnotation();
          });
          item.addEventListener("keydown", (event) => {
            if (event.target !== item || (event.key !== "Enter" && event.key !== " ")) {
              return;
            }
            event.preventDefault();
            selectAnnotation();
          });

          item.querySelector<HTMLElement>('[data-ui="edit-label"]')?.addEventListener("click", (event) => {
            event.stopPropagation();
            if (isRectObject(rect)) {
              void canvasController.raw.editLabel(rect).finally(() => {
                manager.updateLabelList();
                canvasController.raw.renderAll();
              });
            }
          });
          item.querySelector<HTMLElement>('[data-ui="delete-label"]')?.addEventListener("click", (event) => {
            event.stopPropagation();
            if (isRectObject(rect)) {
              canvasController.raw.removeObject(rect);
            }
            manager.updateLabelList();
            canvasController.raw.renderAll();
          });

            itemsContainer.appendChild(item);
          });

          if (renderedItemLimit < groupRects.length) {
            const remaining = groupRects.length - renderedItemLimit;
            const loadMore = input.documentRef.createElement("button");
            loadMore.type = "button";
            loadMore.className = "btn btn-sm btn-outline-secondary label-list-load-more";
            loadMore.dataset.ui = "label-list-load-more";
            loadMore.textContent = `Show ${Math.min(80, remaining)} more (${remaining} remaining)`;
            loadMore.addEventListener("click", (event) => {
              event.stopPropagation();
              renderedItemLimit = Math.min(groupRects.length, renderedItemLimit + 80);
              appendGroupItems();
              itemsContainer.style.maxHeight = `${itemsContainer.scrollHeight}px`;
            });
            itemsContainer.appendChild(loadMore);
          }
        };

        if (!isCollapsed) {
          appendGroupItems();
        }

        groupContainer.append(groupHeader, itemsContainer);
        elements.labelList.appendChild(groupContainer);
      });

      if (visibleRects.length === 0) {
        const emptyState = input.documentRef.createElement("div");
        emptyState.className = "label-list-empty list-group-item text-muted";
        emptyState.dataset.ui = "label-list-empty";
        emptyState.dataset.testid = "label-list-empty";
        emptyState.textContent = "No labels match the current filter.";
        elements.labelList.appendChild(emptyState);
      }

      renderLabelFilters({
        labelFiltersElement: elements.labelFilters,
        rects: rects.map((rect) => ({ labelClass: normalizeFilterClassKey(rect.labelClass) })),
        getDisplayNameForClass: (labelClass) => manager.getDisplayNameForClass(labelClass),
        activeFilterKeys: new Set(visibleRects.map((rect) => normalizeFilterClassKey(rect.labelClass))),
        isAllActive: rects.every((rect) => !input.state.view.hiddenLabelClasses.has(normalizeFilterClassKey(rect.labelClass)))
      });

      const filterSummary = input.documentRef.createElement("span");
      filterSummary.className = "class-filter-summary";
      filterSummary.dataset.ui = "filter-summary";
      filterSummary.textContent = `Visible: ${visibilitySummary.visibleCount} / Total: ${visibilitySummary.totalCount}`;
      elements.labelFilters.appendChild(filterSummary);
      const classSearchQuery = elements.classSearchInput.value.trim().toLocaleLowerCase();
      if (classSearchQuery) {
        elements.labelFilters.querySelectorAll<HTMLElement>(".class-filter-row").forEach((row) => {
          row.hidden = !(row.textContent ?? "").toLocaleLowerCase().includes(classSearchQuery);
        });
      }

      bindLabelFilterEvents({
        labelFiltersElement: elements.labelFilters,
        onSelectClass: (labelClass) => {
          input.state.view.hiddenLabelClasses = toggleHiddenLabelClass(input.state.view.hiddenLabelClasses, labelClass);
          canvasController.raw.applyVisibilityFromHiddenClasses(
            input.state.view.hiddenLabelClasses,
            input.state.view.clearSelectionWhenFilteredHidden
          );
          manager.updateLabelList();
        },
        onSelectAll: () => {
          manager.toggleAllLabelVisibility();
        }
      });
      canvasController.raw.applyVisibilityFromHiddenClasses(
        input.state.view.hiddenLabelClasses,
        input.state.view.clearSelectionWhenFilteredHidden
      );
      renderSelectByClassDropdown(
        elements.selectByClassDropdown,
        visibleRects.map((rect) => ({ labelClass: normalizeFilterClassKey(rect.labelClass) })),
        (labelClass) => manager.getDisplayNameForClass(labelClass)
      );
      manager.syncWorkspaceState();
    },

    updateCurrentImageName(): void {
      elements.currentImageNameSpan.textContent = input.state.session.currentImageFile?.name ?? "No image";
      manager.syncWorkspaceState();
    },

    updateMouseCoords(x: number, y: number): void {
      elements.mouseCoordsDisplay.textContent = `X: ${Math.round(x)}, Y: ${Math.round(y)}`;
      elements.mouseCoordsDisplay.style.visibility = "visible";
    },

    hideMouseCoords(): void {
      elements.mouseCoordsDisplay.style.visibility = "hidden";
    },

    beginOperation(options: RuntimeOperationOptions): RuntimeOperationHandle {
      nextOperationId += 1;
      const id = nextOperationId;
      const controller = new AbortController();
      const operation: ActiveRuntimeOperation = {
        id,
        title: options.title,
        detail: options.detail ?? "Preparing operation...",
        current: options.current ?? null,
        total: options.total ?? null,
        cancellable: options.cancellable ?? false,
        blockCanvas: options.blockCanvas ?? false,
        startedAt: Date.now(),
        controller,
        timer: globalThis.setInterval(renderActiveOperation, 1000)
      };
      activeOperations.set(id, operation);
      syncLoadingOverlay();
      renderActiveOperation();

      let finished = false;
      return {
        signal: controller.signal,
        update(update): void {
          if (finished) {
            return;
          }
          operation.title = update.title ?? operation.title;
          operation.detail = update.detail ?? operation.detail;
          operation.current = update.current ?? operation.current;
          operation.total = update.total ?? operation.total;
          renderActiveOperation();
          syncLoadingOverlay();
        },
        cancel(): void {
          cancelOperation(operation);
        },
        finish(): void {
          if (finished) {
            return;
          }
          finished = true;
          globalThis.clearInterval(operation.timer);
          activeOperations.delete(id);
          renderActiveOperation();
          syncLoadingOverlay();
        }
      };
    },

    showLoading(message = "Loading workspace..."): void {
      loadingDepth += 1;
      elements.loadingStatusText.textContent = message;
      syncLoadingOverlay();
    },

    hideLoading(): void {
      loadingDepth = Math.max(0, loadingDepth - 1);
      syncLoadingOverlay();
    },

    startWorkspaceStandby(title: string, summary: string): void {
      if (workspaceStandbyHideTimer) {
        globalThis.clearTimeout(workspaceStandbyHideTimer);
        workspaceStandbyHideTimer = null;
      }
      workspaceStandbyActive = true;
      elements.workspaceStandbyPanel.dataset.state = "loading";
      elements.workspaceStandbyTitle.textContent = title;
      elements.workspaceStandbySummary.textContent = summary;
      elements.workspaceStandbyActions.hidden = true;
      elements.workspaceStandbySteps.querySelectorAll<HTMLElement>("[data-standby-step]").forEach((step) => {
        step.dataset.state = "pending";
        const detailElement = step.querySelector<HTMLElement>("small");
        if (detailElement) {
          const stepId = step.dataset.standbyStep as WorkspaceStandbyStep | undefined;
          const waitingForDataset = stepId === "dataset" || stepId === "labels" || stepId === "images" || stepId === "classes";
          detailElement.textContent = waitingForDataset ? "Waiting for a dataset" : "Waiting";
          detailElement.title = detailElement.textContent;
        }
      });
      syncLoadingOverlay();
    },

    updateWorkspaceStandbyStep(step: WorkspaceStandbyStep, state: WorkspaceStandbyStepState, detail: string): void {
      const stepElement = elements.workspaceStandbySteps.querySelector<HTMLElement>(`[data-standby-step="${step}"]`);
      if (!stepElement) {
        return;
      }
      stepElement.dataset.state = state;
      const detailElement = stepElement.querySelector<HTMLElement>("small");
      if (detailElement) {
        detailElement.textContent = detail;
        detailElement.title = detail;
      }
    },

    finishWorkspaceStandby(state: "ready" | "warning" | "error", summary: string): void {
      elements.workspaceStandbyPanel.dataset.state = state;
      elements.workspaceStandbySummary.textContent = summary;
      elements.workspaceStandbyActions.hidden = state === "ready";
      if (state !== "ready") {
        syncLoadingOverlay();
        return;
      }
      workspaceStandbyHideTimer = globalThis.setTimeout(() => {
        workspaceStandbyHideTimer = null;
        manager.hideWorkspaceStandby();
      }, 650);
    },

    hideWorkspaceStandby(): void {
      if (workspaceStandbyHideTimer) {
        globalThis.clearTimeout(workspaceStandbyHideTimer);
        workspaceStandbyHideTimer = null;
      }
      workspaceStandbyActive = false;
      syncLoadingOverlay();
    },

    togglePanel(panel: HTMLElement, splitter: HTMLElement, expandButton: HTMLElement, collapse: boolean): void {
      panel.style.display = "";
      panel.classList.toggle("collapsed", collapse);
      panel.setAttribute("aria-hidden", String(collapse));
      splitter.style.display = collapse ? "none" : "";
      expandButton.style.display = collapse ? "inline-flex" : "none";
      const resizeCanvas = (): void => {
        const canvasController = getCanvasController();
        canvasController?.raw.resizeCanvas?.();
        canvasController?.raw.renderAll?.();
      };
      globalThis.setTimeout(resizeCanvas, 0);
      globalThis.setTimeout(resizeCanvas, 200);
    },

    setupSplitters(): void {
      const canvasController = getCanvasController();
      if (!canvasController) {
        return;
      }

      const setup = (splitter: HTMLElement, panel: HTMLElement, direction: "left" | "right") => {
        splitter.addEventListener("mousedown", (event) => {
          event.preventDefault();
          const onMouseMove = (moveEvent: MouseEvent) => {
            const containerRect = splitter.parentElement?.getBoundingClientRect();
            if (!containerRect) {
              return;
            }
            const newWidth = direction === "left"
              ? moveEvent.clientX - containerRect.left
              : containerRect.right - moveEvent.clientX;

            if (newWidth > 200 && newWidth < 600) {
              panel.style.width = `${newWidth}px`;
              canvasController.raw.resizeCanvas();
              canvasController.raw.resetZoom();
            }
          };

          const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
            canvasController.raw.resizeCanvas();
            canvasController.raw.resetZoom();
          };

          document.addEventListener("mousemove", onMouseMove);
          document.addEventListener("mouseup", onMouseUp);
        });
      };

      setup(elements.leftSplitter, elements.leftPanel, "left");
      setup(elements.rightSplitter, elements.rightPanel, "right");
    },

    showClassFileContentModal(): void {
      elements.classFileViewerModal.show();
    }
  };

  elements.cancelActiveOperationBtn.addEventListener("click", () => {
    const operation = latestOperation();
    if (operation) {
      cancelOperation(operation);
    }
  });

  return manager;
}
