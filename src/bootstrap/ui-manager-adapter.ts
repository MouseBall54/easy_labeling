import type { UIManager, UIManagerDeps } from "../app/contracts.js";
import type { AppState } from "../app/state.js";
import { getCurrentDocumentStatus } from "../app/document-status.js";
import { parseNonNegativeClassId } from "../domain/class-id.js";
import type { FileHandle } from "../types/files.js";
import type { LabelDisplayMode, WorkflowType } from "../types/labels.js";
import { getDOMElements, type BootstrapLike, type UiDomElements } from "../ui/dom-elements.js";
import { getColorForClass } from "../features/canvas/colors.js";
import { isActiveSelectionObject, isRectObject } from "../features/canvas/fabric-types.js";
import { renderLabelClassModalContent } from "../ui/modals.js";
import { installModalFocusManagement } from "../ui/modal-focus.js";
import {
  bindLabelFilterEvents,
  renderClassFileSelect,
  renderImageList,
  renderLabelFilters,
  renderPreviewList,
  renderSelectByClassDropdown,
  renderWorkflowPanels,
  showLoadingOverlay,
  hideLoadingOverlay
} from "../ui/renderers.js";
import { applyDarkMode, readStoredDarkMode } from "../ui/theme.js";
import {
  deriveVisibilitySummary,
  normalizeFilterClassKey,
  resetHiddenLabelClasses,
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

const PREVIEW_PLACEHOLDER_SRC = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNlZWVlZWUiLz4KICA8YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJvcGFjaXR5IiB2YWx1ZXM9IjAuNTsxOzAuNSIgZHVyPSIxcyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiLz4KPC9zdmc+";

export interface RuntimeUiManager extends UIManager {
  readonly elements: UiDomElements;
  connect(deps: UIManagerDeps): void;
  getDisplayNameForClass(labelClass: string | undefined): string;
  updateLabelFolderButton(hasLabelFolder: boolean): void;
  togglePreviewBarVisibility(hidden: boolean): void;
  setWorkflow(workflow: WorkflowType): void;
  promptForLabelClass(defaultValue: string): Promise<string>;
  notify(message: string, duration?: number): void;
  updateZoomDisplay(zoomLevel?: number): void;
  applyDarkMode(enabled: boolean): void;
  restoreDarkModeFromStorage(): void;
  renderImageList(): void;
  renderPreviewList(): void;
  renderClassFileSelect(): void;
  updateLabelList(): void;
  updateCurrentImageName(): void;
  updateMouseCoords(x: number, y: number): void;
  hideMouseCoords(): void;
  showLoading(message?: string): void;
  hideLoading(): void;
  setDirectoryPickerSupport(available: boolean): void;
  setActiveTask(task: "files" | "annotate" | "automate"): void;
  setInspectorTab(tab: "annotation" | "transform" | "automation"): void;
  syncWorkspaceState(): void;
  syncSelectionInspector(): void;
  setLabelDisplayMode(mode: LabelDisplayMode, persist?: boolean): void;
  togglePanel(panel: HTMLElement, splitter: HTMLElement, expandButton: HTMLElement, collapse: boolean): void;
  setupSplitters(): void;
  showClassFileContentModal(): void;
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
    "classFileViewerModal",
    "labelClassModal"
  ]);
  let deps: UIManagerDeps | null = null;
  let loadingDepth = 0;
  let directoryPickerAvailable = true;
  let activeTask: "files" | "annotate" | "automate" = "annotate";
  let activeInspectorTab: "annotation" | "transform" | "automation" = "annotation";
  const initializedDenseLabelGroups = new Set<string>();

  const setStatusText = (element: HTMLElement, text: string): void => {
    const textElement = element.querySelector<HTMLElement>("span");
    if (textElement) {
      textElement.textContent = text;
      return;
    }
    element.textContent = text;
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

  const ensurePreviewImage = async (file: FileHandle, imageElement: HTMLImageElement): Promise<void> => {
    const cached = input.state.runtime.previewImageCache.get(file.name);
    if (cached) {
      imageElement.src = cached;
      return;
    }

    imageElement.src = PREVIEW_PLACEHOLDER_SRC;
    try {
      const blob = await file.getFile();
      const objectUrl = URL.createObjectURL(blob);
      input.state.runtime.previewImageCache.set(file.name, objectUrl);
      if (elements.previewList.contains(imageElement)) {
        imageElement.src = objectUrl;
      }
    } catch {
      imageElement.src = PREVIEW_PLACEHOLDER_SRC;
    }
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
    const autoFillClosedRegionEnabled = canvasController?.raw.getSegmentationAutoFillClosedRegionEnabled?.() ?? false;

    elements.segmentationActiveClassSummary.textContent = `Active Class: ${manager.getDisplayNameForClass(activeClassId)}`;
    elements.segmentationBrushModeBtn.classList.toggle("active", activeTool === "brush");
    elements.segmentationEraseModeBtn.classList.toggle("active", activeTool === "erase");
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
    elements.segmentationClassSummary.innerHTML = "";
    if (summary && summary.allClassIds.length > 0) {
      const filterControls = input.documentRef.createElement("div");
      filterControls.className = "mb-2";

      const filterTitle = input.documentRef.createElement("div");
      filterTitle.className = "mb-1 small text-muted";
      filterTitle.textContent = "Class Filter";
      filterControls.appendChild(filterTitle);

      const allVisibleButton = input.documentRef.createElement("button");
      allVisibleButton.type = "button";
      allVisibleButton.className = `btn btn-sm me-1 mb-1 ${summary.hiddenClassIds.length === 0 ? "btn-primary" : "btn-outline-primary"}`;
      allVisibleButton.textContent = "All";
      allVisibleButton.dataset.ui = "segmentation-filter-all";
      filterControls.appendChild(allVisibleButton);

      summary.allClassIds.forEach((classId) => {
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
      title.textContent = "Class Visibility";
      elements.segmentationClassSummary.appendChild(title);

      summary.allClassIds.forEach((classId) => {
        const wrapper = input.documentRef.createElement("label");
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
        label.className = `small ${classId === activeClassId ? "fw-bold" : ""}`;
        label.textContent = manager.getDisplayNameForClass(classId);

        wrapper.append(checkbox, label);
        elements.segmentationClassSummary.appendChild(wrapper);
      });
    } else {
      elements.segmentationClassSummary.textContent = visibleClassIds.length > 0
        ? `Visible Classes: ${visibleClassIds.map((classId) => manager.getDisplayNameForClass(classId)).join(", ")}`
        : "Visible Classes: none";
    }
  };

  const syncWorkflowPanels = (): void => {
    const showSegmentationControls = input.state.session.workflow === "segmentation";
    renderWorkflowPanels({
      activeWorkflow: input.state.session.workflow,
      detectionPanelElement: elements.detectionWorkflowPanel,
      segmentationPanelElement: elements.segmentationWorkflowPanel
    });
    elements.segmentationAutoFillClosedRegionGroup.hidden = !showSegmentationControls;
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

    setActiveTask(task: "files" | "annotate" | "automate"): void {
      activeTask = task;
      const buttons = [elements.taskFilesBtn, elements.taskAnnotateBtn, elements.taskAutomateBtn];
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
      input.documentRef.querySelector<HTMLElement>(".app-workspace")?.setAttribute("data-active-task", task);
      elements.leftPanel.classList.toggle("mobile-open", task === "files");
      elements.rightPanel.classList.toggle("mobile-open", task !== "files");
      elements.leftPanel.classList.toggle("task-focus", task === "files");
      elements.rightPanel.classList.toggle("task-focus", task !== "files");

      if (task === "files") {
        manager.togglePanel(elements.leftPanel, elements.leftSplitter, elements.expandLeftPanelBtn, false);
        manager.togglePanel(elements.rightPanel, elements.rightSplitter, elements.expandRightPanelBtn, true);
        elements.imageSearchInput.focus({ preventScroll: true });
        manager.syncWorkspaceState();
        return;
      }

      manager.togglePanel(elements.rightPanel, elements.rightSplitter, elements.expandRightPanelBtn, false);
      if (task === "automate") {
        manager.togglePanel(elements.leftPanel, elements.leftSplitter, elements.expandLeftPanelBtn, true);
        manager.setInspectorTab("automation");
        elements.automationPresetSelect.focus({ preventScroll: true });
      } else {
        manager.togglePanel(elements.leftPanel, elements.leftSplitter, elements.expandLeftPanelBtn, false);
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
      if (activeTask !== "automate") {
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
      elements.datasetConnectionStatus.textContent = folderName
        ? `${folderName} · ${imageCount} image${imageCount === 1 ? "" : "s"}`
        : "No dataset connected";
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
      if (activeTask === "automate") {
        const engineState = elements.matchingEngineStatus.dataset.state;
        elements.inspectorTitle.textContent = "Automation Workspace";
        elements.inspectorSubtitle.textContent = engineState === "ready"
          ? "Matching engine ready"
          : engineState === "error"
            ? "Matching engine requires retry"
            : "Matching engine loading";
      } else {
        elements.inspectorTitle.textContent = input.state.session.workflow === "detection" ? "Annotation Inspector" : "Mask Inspector";
      }
      elements.activeToolSummary.textContent = input.state.view.currentMode === "draw"
        ? (input.state.session.workflow === "segmentation" ? segmentationSummary?.activeTool ?? "Brush" : "Draw")
        : "Edit";
      elements.labelDisplayModeSelect.value = input.state.view.labelDisplayMode ?? "auto";
      manager.syncSelectionInspector();
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

    togglePreviewBarVisibility(hidden: boolean): void {
      input.state.view.isPreviewBarHidden = hidden;
      elements.bottomPanel.classList.toggle("show", !hidden);

      const icon = elements.togglePreviewBtn.querySelector("i");
      if (!icon) {
        return;
      }

      icon.classList.toggle("bi-chevron-down", !hidden);
      icon.classList.toggle("bi-chevron-up", hidden);
    },

    setWorkflow(workflow: WorkflowType): void {
      input.state.session.workflow = workflow;
      syncWorkflowPanels();
      syncSegmentationPanelState();
      elements.taskAutomateBtn.disabled = workflow !== "detection";
      if (workflow === "segmentation") {
        manager.setActiveTask("annotate");
      }
      if (workflow === "detection") {
        manager.updateLabelList();
      }
      manager.renderImageList();
      manager.renderPreviewList();
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
        onImageClick: (file) => {
          fileSystem?.loadImage(file).catch((error: unknown) => {
            const message = error instanceof Error ? error.message : "Unexpected error";
            manager.notify(message, 4000);
          });
        }
      });
      manager.syncWorkspaceState();
    },

    renderPreviewList(): void {
      const fileSystem = getFileSystem();
      const filesToPreview = renderPreviewList({
        bottomPanelElement: elements.bottomPanel,
        previewListElement: elements.previewList,
        previewListWrapperElement: elements.previewListWrapper,
        imageFiles: input.state.session.imageFiles,
        imageWorkflowStatus: input.state.session.imageWorkflowStatus,
        activeWorkflow: input.state.session.workflow,
        currentImageFile: input.state.session.currentImageFile,
        isPreviewBarHidden: input.state.view.isPreviewBarHidden,
        onPreviewClick: (file) => {
          fileSystem?.loadImage(file).catch((error: unknown) => {
            const message = error instanceof Error ? error.message : "Unexpected error";
            manager.notify(message, 4000);
          });
        }
      });

      filesToPreview.forEach((file) => {
        const previewItem = elements.previewList.querySelector<HTMLElement>(`.preview-item[data-file-name="${CSS.escape(file.name)}"]`);
        const imageElement = previewItem?.querySelector<HTMLImageElement>("img");
        if (imageElement) {
          void ensurePreviewImage(file, imageElement);
        }
      });
    },

    renderClassFileSelect(): void {
      renderClassFileSelect(
        elements.classFileSelect,
        input.state.session.classFiles,
        input.state.session.selectedClassFile?.name ?? null
      );
    },

    updateLabelList(): void {
      const canvasController = getCanvasController();
      if (!canvasController) {
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

          item.innerHTML = `<span class="label-list-item-main"><span class="label-color-swatch" style="background-color: ${getColorForClass(rect.labelClass)};"></span><span class="label-list-item-name">${manager.getDisplayNameForClass(rect.labelClass)}</span></span><span class="label-list-item-actions"><button class="btn btn-sm btn-outline-primary edit-btn" data-ui="edit-label" data-testid="edit-label-${originalIndex}" data-index="${originalIndex}" title="Edit annotation" aria-label="Edit annotation ${originalIndex + 1}"><i class="bi bi-pencil" aria-hidden="true"></i></button><button class="btn btn-sm btn-outline-danger delete-btn" data-ui="delete-label" data-testid="delete-label-${originalIndex}" data-index="${originalIndex}" title="Delete annotation" aria-label="Delete annotation ${originalIndex + 1}"><i class="bi bi-trash" aria-hidden="true"></i></button></span>`;
          item.addEventListener("click", (event) => {
            if ((event.target as HTMLElement | null)?.closest('[data-ui="edit-label"], [data-ui="delete-label"]')) {
              return;
            }
            canvasController.raw.canvas.setActiveObject(rect);
            canvasController.raw.highlightSelection();
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
        isAllActive: input.state.view.hiddenLabelClasses.size === 0
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
          input.state.view.hiddenLabelClasses = resetHiddenLabelClasses();
          canvasController.raw.applyVisibilityFromHiddenClasses(
            input.state.view.hiddenLabelClasses,
            input.state.view.clearSelectionWhenFilteredHidden
          );
          manager.updateLabelList();
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

    showLoading(message = "Loading workspace..."): void {
      loadingDepth += 1;
      elements.loadingStatusText.textContent = message;
      showLoadingOverlay(elements.loadingOverlay);
      elements.loadingOverlay.setAttribute("aria-hidden", "false");
    },

    hideLoading(): void {
      loadingDepth = Math.max(0, loadingDepth - 1);
      if (loadingDepth === 0) {
        hideLoadingOverlay(elements.loadingOverlay);
        elements.loadingOverlay.setAttribute("aria-hidden", "true");
      }
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

      const setupBottomSplitter = (): void => {
        elements.bottomSplitter.addEventListener("mousedown", (event) => {
          event.preventDefault();
          const bottomPanel = elements.bottomPanel;
          const initialHeight = bottomPanel.getBoundingClientRect().height;
          const startY = event.clientY;

          const onMouseMove = (moveEvent: MouseEvent) => {
            const delta = startY - moveEvent.clientY;
            const nextHeight = Math.max(80, Math.min(400, initialHeight + delta));
            bottomPanel.style.height = `${nextHeight}px`;
          };

          const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
          };

          document.addEventListener("mousemove", onMouseMove);
          document.addEventListener("mouseup", onMouseUp);
        });
      };

      setup(elements.leftSplitter, elements.leftPanel, "left");
      setup(elements.rightSplitter, elements.rightPanel, "right");
      setupBottomSplitter();
    },

    showClassFileContentModal(): void {
      elements.classFileViewerModal.show();
    }
  };

  return manager;
}
