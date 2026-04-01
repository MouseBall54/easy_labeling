import type { UIManager, UIManagerDeps } from "../app/contracts.js";
import type { AppState } from "../app/state.js";
import type { FileHandle } from "../types/files.js";
import type { WorkflowType } from "../types/labels.js";
import { getDOMElements, type BootstrapLike, type UiDomElements } from "../ui/dom-elements.js";
import { getColorForClass } from "../features/canvas/colors.js";
import { isActiveSelectionObject, isRectObject } from "../features/canvas/fabric-types.js";
import { renderLabelClassModalContent } from "../ui/modals.js";
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

function validateLabelClass(input: string | null, notify: (message: string, duration?: number) => void): string | null {
  if (input === null) {
    return null;
  }

  const trimmedInput = input.trim();
  if (trimmedInput === "") {
    notify("Label class cannot be empty.");
    return null;
  }

  const value = Number(trimmedInput);
  if (!Number.isInteger(value) || value < 0 || value > 10000) {
    notify("Invalid Label: Please enter an integer between 0 and 10000.", 4000);
    return null;
  }

  return String(value);
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
  showLoading(): void;
  hideLoading(): void;
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
  let deps: UIManagerDeps | null = null;
  let loadingDepth = 0;

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
    const summary = getCanvasController()?.raw.getSegmentationSummary?.();
    const activeClassId = summary?.activeClassId ?? "1";
    const activeTool = summary?.activeTool ?? "brush";
    const brushRadius = summary?.brushRadius ?? Number.parseInt(elements.segmentationToolSizeSlider.value, 10);
    const overlayVisible = summary?.overlayVisible ?? elements.segmentationMaskVisibilityToggle.checked;
    const overlayOpacity = summary?.overlayOpacity ?? (Number.parseInt(elements.segmentationMaskOpacitySlider.value, 10) / 100);
    const visibleClassIds = summary?.visibleClassIds ?? [];

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
    elements.segmentationMaskVisibilityToggle.checked = overlayVisible;
    elements.segmentationMaskOpacitySlider.value = `${Math.round(overlayOpacity * 100)}`;
    elements.segmentationMaskOpacityValue.textContent = `${Math.round(overlayOpacity * 100)}`;
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
    renderWorkflowPanels({
      activeWorkflow: input.state.session.workflow,
      detectionPanelElement: elements.detectionWorkflowPanel,
      segmentationPanelElement: elements.segmentationWorkflowPanel
    });
  };

  const manager: RuntimeUiManager = {
    elements,

    connect(connectedDeps: UIManagerDeps): void {
      deps = connectedDeps;
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
        button.innerHTML = `<i class="bi bi-folder-check"></i> ${folderName}`;
        return;
      }

      button.classList.remove("btn-success");
      button.classList.add("btn-danger");
      button.innerHTML = '<i class="bi bi-folder-x"></i> Load Label Folder';
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
      if (workflow === "detection") {
        manager.updateLabelList();
      }
      manager.renderImageList();
      manager.renderPreviewList();
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

      elements.labelClassModal.show();
      elements.labelClassInput.focus();
      elements.labelClassInput.select();

      return new Promise<string>((resolve, reject) => {
        const cleanup = (): void => {
          elements.saveLabelClassBtn.removeEventListener("click", onSave);
          elements.labelClassModal._element?.removeEventListener("hidden.bs.modal", onHidden as EventListener);
          elements.labelClassInput.removeEventListener("keydown", onKeyDown);
        };

        const onSave = (): void => {
          const validated = validateLabelClass(elements.labelClassInput.value, manager.notify);
          if (validated === null) {
            return;
          }

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

        elements.saveLabelClassBtn.addEventListener("click", onSave);
        elements.labelClassModal._element?.addEventListener("hidden.bs.modal", onHidden as EventListener, { once: true });
        elements.labelClassInput.addEventListener("keydown", onKeyDown);
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

      const rects = canvasController.raw.getObjects("rect").filter((rect) => rect.type === "rect");
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
          <i class="bi bi-chevron-right me-2"></i>
          <span class="label-color-swatch me-2" style="background-color: ${getColorForClass(classId)};"></span>
          <span class="fw-bold">${manager.getDisplayNameForClass(classId)}</span>
          <i class="bi bi-check2-all select-group-btn ms-2" title="Select all in this group" data-ui="select-group" data-testid="select-group-${classId}"></i>
          <span class="badge bg-secondary ms-auto">${groupRects.length}</span>
        `;

        const itemsContainer = input.documentRef.createElement("div");
        itemsContainer.className = "label-group-items label-group-list";
        itemsContainer.dataset.ui = "label-group-items";
        itemsContainer.dataset.groupClass = classId;
        const isCollapsed = input.state.view.collapsedLabelGroups.has(classId);
        if (isCollapsed) {
          groupHeader.classList.add("collapsed");
          itemsContainer.style.maxHeight = "0";
        }

        groupHeader.addEventListener("click", () => {
          const collapsed = groupHeader.classList.toggle("collapsed");
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

        groupRects.forEach((rect) => {
          const originalIndex = rects.indexOf(rect);
          const item = input.documentRef.createElement("li");
          item.id = `label-item-${originalIndex}`;
          item.className = "list-group-item d-flex justify-content-between align-items-center label-list-item";
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

          item.innerHTML = `<span><span class="badge me-2" style="background-color: ${getColorForClass(rect.labelClass)};"> </span>${manager.getDisplayNameForClass(rect.labelClass)}</span><div><button class="btn btn-sm btn-outline-primary edit-btn py-0 px-1" data-ui="edit-label" data-testid="edit-label-${originalIndex}" data-index="${originalIndex}"><i class="bi bi-pencil"></i></button><button class="btn btn-sm btn-outline-danger delete-btn py-0 px-1" data-ui="delete-label" data-testid="delete-label-${originalIndex}" data-index="${originalIndex}"><i class="bi bi-trash"></i></button></div>`;
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
      filterSummary.className = "badge bg-dark me-2 mb-1 align-items-center d-inline-flex";
      filterSummary.dataset.ui = "filter-summary";
      filterSummary.textContent = `Visible: ${visibilitySummary.visibleCount} / Total: ${visibilitySummary.totalCount}`;
      elements.labelFilters.appendChild(filterSummary);

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
    },

    updateCurrentImageName(): void {
      elements.currentImageNameSpan.textContent = input.state.session.currentImageFile?.name ?? "";
    },

    updateMouseCoords(x: number, y: number): void {
      elements.mouseCoordsDisplay.textContent = `X: ${Math.round(x)}, Y: ${Math.round(y)}`;
      elements.mouseCoordsDisplay.style.visibility = "visible";
    },

    hideMouseCoords(): void {
      elements.mouseCoordsDisplay.style.visibility = "hidden";
    },

    showLoading(): void {
      loadingDepth += 1;
      showLoadingOverlay(elements.loadingOverlay);
    },

    hideLoading(): void {
      loadingDepth = Math.max(0, loadingDepth - 1);
      if (loadingDepth === 0) {
        hideLoadingOverlay(elements.loadingOverlay);
      }
    },

    togglePanel(panel: HTMLElement, splitter: HTMLElement, expandButton: HTMLElement, collapse: boolean): void {
      panel.style.display = collapse ? "none" : "";
      splitter.style.display = collapse ? "none" : "";
      expandButton.style.display = collapse ? "inline-flex" : "none";
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
