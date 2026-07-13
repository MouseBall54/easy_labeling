import type { EventManager } from "../app/contracts.js";
import { hasDirtyDocuments } from "../app/document-status.js";
import type { LabelDisplayMode, WorkflowType } from "../types/labels.js";
import type { AppState } from "../app/state.js";
import { isActiveSelectionObject, isRectObject, type FabricObjectLike } from "../features/canvas/fabric-types.js";
import type { CanvasHistoryGestureBaseline } from "../features/canvas/history.js";
import type { RuntimeCanvasController } from "./canvas-controller-adapter.js";
import type { RuntimeFileSystem } from "./file-system-adapter.js";
import type { RuntimeUiManager } from "./ui-manager-adapter.js";
import { createAutomationController, type AutomationWindow } from "./automation-controller.js";

type CanvasPointLike = { x: number; y: number };
type ViewportTransform = [number, number, number, number, number, number];

function isFinitePoint(point: CanvasPointLike | null | undefined): point is CanvasPointLike {
  return Number.isFinite(point?.x) && Number.isFinite(point?.y);
}

function hasEventOffset(event: MouseEvent | WheelEvent): event is MouseEvent | WheelEvent & {
  offsetX: number;
  offsetY: number;
} {
  return Number.isFinite((event as { offsetX?: unknown }).offsetX) &&
    Number.isFinite((event as { offsetY?: unknown }).offsetY);
}

function invertViewportPoint(point: CanvasPointLike, transform: ViewportTransform): CanvasPointLike | null {
  const [scaleX, skewY, skewX, scaleY, translateX, translateY] = transform;
  const determinant = (scaleX * scaleY) - (skewX * skewY);
  if (!Number.isFinite(determinant) || Math.abs(determinant) < Number.EPSILON) {
    return null;
  }

  const translatedX = point.x - translateX;
  const translatedY = point.y - translateY;
  return {
    x: ((scaleY * translatedX) - (skewX * translatedY)) / determinant,
    y: ((scaleX * translatedY) - (skewY * translatedX)) / determinant
  };
}

function resolveImagePixelPoint(input: {
  scenePoint: CanvasPointLike;
  currentImage: { width: number; height: number } | null;
}): CanvasPointLike | null {
  const { currentImage, scenePoint } = input;
  if (!currentImage) {
    return scenePoint;
  }

  const imageWidth = currentImage.width;
  const imageHeight = currentImage.height;
  if (imageWidth <= 0 || imageHeight <= 0) {
    return null;
  }

  if (scenePoint.x < 0 || scenePoint.y < 0 || scenePoint.x >= imageWidth || scenePoint.y >= imageHeight) {
    return null;
  }

  return scenePoint;
}

export function createEventManagerAdapter(input: {
  state: AppState;
  uiManager: RuntimeUiManager;
  fileSystem: RuntimeFileSystem;
  canvasController: RuntimeCanvasController;
  windowRef: Pick<Window, "addEventListener"> & Partial<{
    confirm: Window["confirm"];
    prompt: Window["prompt"];
    dispatchEvent: Window["dispatchEvent"];
    URL: Pick<typeof URL, "createObjectURL" | "revokeObjectURL">;
  }>;
  documentRef?: Document;
}): EventManager {
  return {
    bindEventListeners(): void {
      const { elements } = input.uiManager;
      const rawCanvas = input.canvasController.raw.canvas;
      const automationController = input.documentRef
        ? createAutomationController({
          state: input.state,
          uiManager: input.uiManager,
          fileSystem: input.fileSystem,
          canvasController: input.canvasController,
          documentRef: input.documentRef,
          windowRef: input.windowRef as AutomationWindow
        })
        : null;
      automationController?.bind();

      const runAsync = (action: () => Promise<void>): void => {
        action().catch((error: unknown) => {
          const message = error instanceof Error ? error.message : "Unexpected error";
          input.uiManager.notify(message, 4000);
        });
      };

      const pendingActions = new Set<string>();
      const runExclusive = (key: string, action: () => Promise<void>, button?: HTMLButtonElement): void => {
        if (pendingActions.has(key)) {
          input.uiManager.notify("That action is already running.");
          return;
        }
        pendingActions.add(key);
        if (button) {
          button.disabled = true;
          button.setAttribute("aria-busy", "true");
        }
        runAsync(async () => {
          try {
            await action();
          } finally {
            pendingActions.delete(key);
            if (button) {
              button.disabled = false;
              button.removeAttribute("aria-busy");
            }
            syncToolbarActionState();
            input.uiManager.syncWorkspaceState?.();
            input.windowRef.dispatchEvent?.(new Event("easy-labeling:canvas-view-change"));
          }
        });
      };

      const runAsyncAndSyncToolbar = (action: () => Promise<void>): void => {
        runAsync(() => action().then(() => {
          syncToolbarActionState();
          input.uiManager.syncWorkspaceState?.();
        }));
      };

      const syncViewControls = (): void => {
        elements.detectionWorkflowTab.checked = input.state.session.workflow === "detection";
        elements.segmentationWorkflowTab.checked = input.state.session.workflow === "segmentation";
        elements.drawModeBtn.checked = input.state.view.currentMode === "draw";
        elements.editModeBtn.checked = input.state.view.currentMode === "edit";
        elements.autoSaveToggle.checked = input.state.view.isAutoSaveEnabled;
        elements.showLabelsOnCanvasToggle.checked = input.state.view.showLabelsOnCanvas;
        elements.crosshairToggle.checked = input.state.view.isCrosshairVisible;
      };

      const setWorkflow = (workflow: WorkflowType): void => {
        input.canvasController.setWorkflow?.(workflow);
        if (typeof input.uiManager.setWorkflow === "function") {
          input.uiManager.setWorkflow(workflow);
        } else {
          input.state.session.workflow = workflow;
        }
        syncViewControls();
      };

      const getActiveVisibleRectSelectionCount = (): number => {
        const activeObject = rawCanvas.getActiveObject();
        if (!activeObject) {
          return 0;
        }

        if (isRectObject(activeObject)) {
          return activeObject.visible === false ? 0 : 1;
        }

        if (!isActiveSelectionObject(activeObject)) {
          return 0;
        }

        return activeObject
          .getObjects()
          .filter(isRectObject)
          .filter((object) => object.visible !== false).length;
      };

      const syncToolbarActionState = (): void => {
        const actionableCount = getActiveVisibleRectSelectionCount();
        const alignDisabled = actionableCount < 2;
        const distributeDisabled = actionableCount < 3;
        const undoDisabled = !input.canvasController.raw.canUndo();
        const redoDisabled = !input.canvasController.raw.canRedo();

        (elements.alignLeftBtn as HTMLButtonElement).disabled = alignDisabled;
        (elements.alignRightBtn as HTMLButtonElement).disabled = alignDisabled;
        (elements.alignTopBtn as HTMLButtonElement).disabled = alignDisabled;
        (elements.alignBottomBtn as HTMLButtonElement).disabled = alignDisabled;
        (elements.distributeHorizontalBtn as HTMLButtonElement).disabled = distributeDisabled;
        (elements.distributeVerticalBtn as HTMLButtonElement).disabled = distributeDisabled;
        elements.moveSelectedBoxesBtn.disabled = actionableCount < 1;
        (elements.undoBtn as HTMLButtonElement).disabled = undoDisabled;
        (elements.redoBtn as HTMLButtonElement).disabled = redoDisabled;
        input.uiManager.syncSelectionInspector?.();
      };

      const shouldEnableCanvasSelection = (): boolean => {
        if (input.state.session.workflow !== "detection") {
          return false;
        }
        return input.state.view.currentMode === "edit";
      };

      const getScenePointer = (event: MouseEvent | WheelEvent): CanvasPointLike | null => {
        const scenePoint = rawCanvas.getScenePoint?.(event);
        if (isFinitePoint(scenePoint)) {
          return scenePoint;
        }

        const viewportPoint = rawCanvas.getViewportPoint?.(event) ??
          (hasEventOffset(event) ? { x: event.offsetX, y: event.offsetY } : null);
        const invertedViewportPoint = isFinitePoint(viewportPoint)
          ? invertViewportPoint(viewportPoint, rawCanvas.viewportTransform)
          : null;
        if (isFinitePoint(invertedViewportPoint)) {
          return invertedViewportPoint;
        }

        const legacyPointer = rawCanvas.getPointer?.(event);
        return isFinitePoint(legacyPointer) ? legacyPointer : null;
      };

      const getCanvasPointer = (event: MouseEvent | WheelEvent): CanvasPointLike | null => {
        const scenePoint = getScenePointer(event);
        if (!scenePoint) {
          return null;
        }

        if (input.state.session.workflow !== "segmentation") {
          return scenePoint;
        }

        return resolveImagePixelPoint({
          scenePoint,
          currentImage: input.state.session.currentImage
        });
      };

      const containsCanvasPoint = (object: FabricObjectLike, point: CanvasPointLike): boolean => {
        const bounds = object.getBoundingRect(true);
        return point.x >= bounds.left &&
          point.x <= bounds.left + bounds.width &&
          point.y >= bounds.top &&
          point.y <= bounds.top + bounds.height;
      };

      const resolveDetectionTarget = (
        event: MouseEvent | WheelEvent,
        directTarget?: FabricObjectLike | null
      ): FabricObjectLike | null => {
        const fabricTarget = directTarget ?? rawCanvas.findTarget?.(event, false) ?? null;
        if (fabricTarget && (isRectObject(fabricTarget) || isActiveSelectionObject(fabricTarget))) {
          return fabricTarget;
        }

        const pointer = getCanvasPointer(event);
        if (!pointer) {
          return null;
        }

        const activeObject = rawCanvas.getActiveObject();
        if (activeObject && isActiveSelectionObject(activeObject) && containsCanvasPoint(activeObject, pointer)) {
          return activeObject;
        }

        const hitRects = input.canvasController.raw
          .getObjects("rect")
          .filter(isRectObject)
          .filter((rect) => rect.visible !== false && containsCanvasPoint(rect, pointer));
        return hitRects.at(-1) ?? null;
      };

      const triggerSegmentationRelabelAtPoint = (pointer: { x: number; y: number }): void => {
        runAsync(async () => {
          if (input.state.session.workflow !== "segmentation") {
            return;
          }

          const sourceClass = input.canvasController.raw.getSegmentationClassAtPoint?.(pointer);
          if (!sourceClass) {
            input.uiManager.notify("Click on a labeled segmentation region first.");
            return;
          }

          const nextClass = await input.uiManager.promptForLabelClass(sourceClass);
          if (nextClass === sourceClass) {
            return;
          }

          const changed = input.canvasController.raw.relabelSegmentationRegionAtPoint?.(pointer, nextClass) ?? false;
          if (!changed) {
            input.uiManager.notify("Could not change class for the selected segmentation region.");
            return;
          }

          input.uiManager.setWorkflow?.(input.state.session.workflow);
          input.uiManager.updateLabelList();
          syncToolbarActionState();
        });
      };

      const triggerSegmentationRelabel = (): void => {
        runAsync(async () => {
          if (input.state.session.workflow !== "segmentation") {
            return;
          }

          const selectedClass = input.canvasController.raw.getSelectedSegmentationClass?.();
          if (selectedClass) {
            const nextClass = await input.uiManager.promptForLabelClass(selectedClass);
            if (nextClass === selectedClass) {
              return;
            }

            const changed = input.canvasController.raw.relabelSelectedSegmentationRegion?.(nextClass) ?? false;
            if (!changed) {
              input.uiManager.notify("Could not change class for the selected segmentation region.");
              return;
            }

            input.uiManager.setWorkflow?.(input.state.session.workflow);
            input.uiManager.updateLabelList();
            syncToolbarActionState();
            return;
          }

          triggerSegmentationRelabelAtPoint(input.state.view.lastMousePosition);
        });
      };

      const runUndo = (): void => {
        input.canvasController.raw.undo();
        syncToolbarActionState();
        input.uiManager.syncWorkspaceState?.();
      };

      const runRedo = (): void => {
        input.canvasController.raw.redo();
        syncToolbarActionState();
        input.uiManager.syncWorkspaceState?.();
      };

      const setMode = (mode: "draw" | "edit"): void => {
        elements.drawModeBtn.checked = mode === "draw";
        elements.editModeBtn.checked = mode === "edit";
        input.canvasController.setMode?.(mode);
        input.uiManager.syncWorkspaceState?.();
      };

      const renderLists = (): void => {
        input.uiManager.renderImageList();
        input.uiManager.renderPreviewList();
        input.uiManager.updateLabelList();
      };

      elements.appBrand.addEventListener("click", (event) => {
        event.preventDefault();
        input.canvasController.raw.resizeCanvas();
        input.canvasController.raw.renderAll();
        renderLists();
        input.uiManager.updateCurrentImageName();
        input.uiManager.updateZoomDisplay(input.canvasController.raw.canvas.getZoom());
        input.uiManager.setWorkflow?.(input.state.session.workflow);
        syncToolbarActionState();
        input.windowRef.dispatchEvent?.(new Event("easy-labeling:canvas-view-change"));
        input.uiManager.notify("Workspace refreshed.");
      });

      let pendingGestureBaseline: CanvasHistoryGestureBaseline | null = null;
      let suppressSelectionForSegmentationStroke = false;
      let isMovingSegmentationRegion = false;

      const clearTemporarySelectionSuppression = (): void => {
        if (!suppressSelectionForSegmentationStroke) {
          return;
        }
        rawCanvas.selection = shouldEnableCanvasSelection();
        suppressSelectionForSegmentationStroke = false;
      };

      const finishSegmentationRegionMove = (): void => {
        if (!isMovingSegmentationRegion) {
          return;
        }
        isMovingSegmentationRegion = false;
        runAsync(() => input.canvasController.raw.finishSegmentationRegionMove?.().then(() => {
          input.uiManager.setWorkflow?.(input.state.session.workflow);
          syncToolbarActionState();
        }) ?? Promise.resolve());
      };

      const isRectOrSelectionTarget = (target: unknown): boolean => {
        if (!target || typeof target !== "object") {
          return false;
        }

        return isRectObject(target as Parameters<typeof isRectObject>[0]) ||
          isActiveSelectionObject(target as Parameters<typeof isActiveSelectionObject>[0]);
      };

      const maybeStartGestureBaseline = (target: unknown): void => {
        if (input.state.view.currentMode !== "edit") {
          pendingGestureBaseline = null;
          return;
        }

        if (!isRectOrSelectionTarget(target)) {
          pendingGestureBaseline = null;
          return;
        }

        pendingGestureBaseline = input.canvasController.raw.captureHistoryBaseline();
      };

      const finalizeGestureBaseline = (): void => {
        if (!pendingGestureBaseline) {
          return;
        }
        input.canvasController.raw.commitHistoryFromBaseline(pendingGestureBaseline);
        pendingGestureBaseline = null;
      };

      const applySelectionGeometry = (): void => {
        const geometry = {
          x: Number(elements.selectionGeometryX.value),
          y: Number(elements.selectionGeometryY.value),
          width: Number(elements.selectionGeometryWidth.value),
          height: Number(elements.selectionGeometryHeight.value)
        };
        try {
          input.canvasController.raw.updateSelectedBoxGeometry?.(geometry);
          input.uiManager.updateLabelList();
          syncToolbarActionState();
        } catch (error: unknown) {
          input.uiManager.notify(error instanceof Error ? error.message : "Unable to update box geometry", 5000);
          input.uiManager.syncSelectionInspector?.();
        }
      };

      const filterClassControls = (): void => {
        const query = elements.classSearchInput.value.trim().toLocaleLowerCase();
        elements.labelFilters.querySelectorAll<HTMLElement>(".class-filter-row").forEach((row) => {
          row.hidden = query.length > 0 && !(row.textContent ?? "").toLocaleLowerCase().includes(query);
        });
      };

      elements.taskFilesBtn.addEventListener("click", () => input.uiManager.setActiveTask?.("files"));
      elements.taskAnnotateBtn.addEventListener("click", () => input.uiManager.setActiveTask?.("annotate"));
      elements.taskAutomateBtn.addEventListener("click", () => input.uiManager.setActiveTask?.("automate"));
      elements.inspectorAnnotationTabBtn.addEventListener("click", () => {
        input.uiManager.setActiveTask?.("annotate");
        input.uiManager.setInspectorTab?.("annotation");
      });
      elements.inspectorTransformTabBtn.addEventListener("click", () => {
        input.uiManager.setActiveTask?.("annotate");
        input.uiManager.setInspectorTab?.("transform");
      });
      elements.inspectorAutomationTabBtn.addEventListener("click", () => input.uiManager.setActiveTask?.("automate"));
      elements.emptyOpenDatasetBtn.addEventListener("click", () => elements.selectImageFolderBtn.click());
      elements.emptyLoadSampleBtn.addEventListener("click", () => elements.loadSampleTestBtn.click());
      elements.refreshDatasetBtn.addEventListener("click", () => {
        runExclusive("refresh-dataset", () => input.fileSystem.refreshDataset(), elements.refreshDatasetBtn);
      });
      elements.classSearchInput.addEventListener("input", filterClassControls);
      elements.addClassShortcutBtn.addEventListener("click", () => {
        runExclusive("open-class-editor", () => input.fileSystem.showClassFileContent(), elements.addClassShortcutBtn);
      });
      elements.labelDisplayModeSelect.addEventListener("change", () => {
        input.uiManager.setLabelDisplayMode?.(elements.labelDisplayModeSelect.value as LabelDisplayMode);
      });
      elements.selectionClassSelect.addEventListener("change", () => {
        const classId = elements.selectionClassSelect.value;
        if (!classId) {
          return;
        }
        input.canvasController.raw.setSelectedLabelClass?.(classId);
        input.uiManager.updateLabelList();
        syncToolbarActionState();
      });
      [
        elements.selectionGeometryX,
        elements.selectionGeometryY,
        elements.selectionGeometryWidth,
        elements.selectionGeometryHeight
      ].forEach((field) => {
        field.addEventListener("change", applySelectionGeometry);
        field.addEventListener("keydown", (event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            applySelectionGeometry();
          }
        });
      });
      elements.duplicateSelectionBtn.addEventListener("click", () => {
        runExclusive("duplicate-selection", async () => {
          await input.canvasController.raw.copy();
          await input.canvasController.raw.paste();
          input.uiManager.updateLabelList();
          syncToolbarActionState();
        }, elements.duplicateSelectionBtn);
      });
      elements.hideSelectionBtn.addEventListener("click", () => {
        input.canvasController.raw.setSelectedBoxesVisibility?.(false);
        input.uiManager.updateLabelList();
        syncToolbarActionState();
      });
      elements.deleteSelectionBtn.addEventListener("click", () => {
        input.canvasController.raw.deleteSelection();
        input.uiManager.updateLabelList();
        syncToolbarActionState();
      });

      elements.selectImageFolderBtn.addEventListener("click", () => {
        runExclusive("open-dataset", automationController
          ? async () => {
            await input.fileSystem.selectImageFolder();
            await automationController.refreshLibrary();
          }
          : () => input.fileSystem.selectImageFolder(), elements.selectImageFolderBtn as HTMLButtonElement);
      });

      elements.loadSampleTestBtn.addEventListener("click", () => {
        runExclusive("load-sample", automationController
          ? async () => {
            await input.fileSystem.loadSampleTestData();
            await automationController.refreshLibrary({ selectFirst: true });
          }
          : () => input.fileSystem.loadSampleTestData(), elements.loadSampleTestBtn as HTMLButtonElement);
      });

      elements.selectLabelFolderBtn.addEventListener("click", () => {
        runExclusive("select-label-folder", () => input.fileSystem.selectLabelFolder(), elements.selectLabelFolderBtn as HTMLButtonElement);
      });

      elements.loadClassInfoFolderBtn.addEventListener("click", () => {
        runExclusive("select-class-folder", () => input.fileSystem.selectClassInfoFolder(), elements.loadClassInfoFolderBtn as HTMLButtonElement);
      });

      elements.saveLabelsBtn.addEventListener("click", () => {
        runExclusive("save-labels", () => input.fileSystem.saveLabels(false), elements.saveLabelsBtn as HTMLButtonElement);
      });

      elements.sortLabelsAscBtn.addEventListener("click", () => {
        input.canvasController.raw.sortObjectsByLabel("asc");
        input.uiManager.updateLabelList();
      });

      elements.sortLabelsDescBtn.addEventListener("click", () => {
        input.canvasController.raw.sortObjectsByLabel("desc");
        input.uiManager.updateLabelList();
      });

      elements.viewClassFileBtn.addEventListener("click", () => {
        runAsync(() => input.fileSystem.showClassFileContent());
      });

      elements.saveClassFileBtn.addEventListener("click", () => {
        runAsync(() => input.fileSystem.saveClassFileContent());
      });

      elements.addClassRowBtn.addEventListener("click", () => {
        input.fileSystem.addNewClassRow();
      });

      elements.classFileEditorBody.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) {
          return;
        }
        if (target.closest(".delete-class-row-btn")) {
          target.closest("tr")?.remove();
        }
      });

      elements.classFileSelect.addEventListener("change", () => {
        const selectedFileName = elements.classFileSelect.value;
        if (selectedFileName === "__CREATE_NEW__") {
          runAsync(() => input.fileSystem.createNewClassFile());
          return;
        }
        if (!selectedFileName) {
          return;
        }
        const selectedFile = input.state.session.classFiles.find((file) => file.name === selectedFileName);
        if (selectedFile) {
          runAsync(() => input.fileSystem.loadClassNamesFromFile(selectedFile));
        }
      });

      elements.prevImageBtn.addEventListener("click", () => {
        runExclusive("navigate-image", () => input.fileSystem.navigateImage(-1), elements.prevImageBtn as HTMLButtonElement);
      });
      elements.nextImageBtn.addEventListener("click", () => {
        runExclusive("navigate-image", () => input.fileSystem.navigateImage(1), elements.nextImageBtn as HTMLButtonElement);
      });

      elements.previewPrevBtn.addEventListener("click", () => {
        runExclusive("navigate-image", () => input.fileSystem.navigateImage(-1), elements.previewPrevBtn as HTMLButtonElement);
      });
      elements.previewNextBtn.addEventListener("click", () => {
        runExclusive("navigate-image", () => input.fileSystem.navigateImage(1), elements.previewNextBtn as HTMLButtonElement);
      });

      elements.imageSearchInput.addEventListener("input", renderLists);
      elements.showLabeledCheckbox.addEventListener("change", renderLists);
      elements.showUnlabeledCheckbox.addEventListener("change", renderLists);

      elements.showLabelsOnCanvasToggle.addEventListener("change", (event) => {
        const toggle = event.currentTarget;
        if (!(toggle instanceof HTMLInputElement)) {
          return;
        }
        input.uiManager.setLabelDisplayMode?.(toggle.checked ? "auto" : "off");
      });

      elements.labelFontSizeSlider.addEventListener("input", (event) => {
        const slider = event.currentTarget;
        if (!(slider instanceof HTMLInputElement)) {
          return;
        }
        input.state.view.labelFontSize = Number.parseInt(slider.value, 10);
        elements.labelFontSizeValue.textContent = slider.value;
        input.canvasController.raw.updateAllLabelTexts();
        input.canvasController.raw.renderAll();
      });

      elements.autoSaveToggle.addEventListener("change", (event) => {
        const toggle = event.currentTarget;
        if (!(toggle instanceof HTMLInputElement)) {
          return;
        }
        input.state.view.isAutoSaveEnabled = toggle.checked;
        input.uiManager.syncWorkspaceState?.();
      });

      elements.detectionWorkflowTab.addEventListener("change", () => {
        setWorkflow("detection");
        syncToolbarActionState();
        input.windowRef.dispatchEvent?.(new Event("easy-labeling:document-status-change"));
      });
      elements.segmentationWorkflowTab.addEventListener("change", () => {
        setWorkflow("segmentation");
        syncToolbarActionState();
        input.windowRef.dispatchEvent?.(new Event("easy-labeling:document-status-change"));
      });
      elements.segmentationBrushModeBtn.addEventListener("click", () => {
        input.canvasController.raw.setSegmentationTool?.("brush");
        input.uiManager.setWorkflow?.(input.state.session.workflow);
      });
      elements.segmentationEraseModeBtn.addEventListener("click", () => {
        input.canvasController.raw.setSegmentationTool?.("erase");
        input.uiManager.setWorkflow?.(input.state.session.workflow);
      });
      elements.segmentationToolSizeSlider.addEventListener("input", (event) => {
        const slider = event.currentTarget;
        if (!(slider instanceof HTMLInputElement)) {
          return;
        }
        input.canvasController.raw.setSegmentationBrushRadius?.(Number.parseInt(slider.value, 10));
        input.uiManager.setWorkflow?.(input.state.session.workflow);
      });
      elements.segmentationToolSizePresets.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) {
          return;
        }
        const button = target.closest<HTMLButtonElement>('[data-ui="segmentation-tool-size-preset"]');
        const nextSize = Number.parseInt(button?.dataset.size ?? "", 10);
        if (!button || Number.isNaN(nextSize)) {
          return;
        }
        input.canvasController.raw.setSegmentationBrushRadius?.(nextSize);
        input.uiManager.setWorkflow?.(input.state.session.workflow);
      });
      elements.segmentationActiveClassSummary.addEventListener("click", () => {
        runAsync(async () => {
          const summary = input.canvasController.raw.getSegmentationSummary?.();
          const currentClass = summary?.activeClassId ?? "1";
          const nextClass = await input.uiManager.promptForLabelClass(currentClass);
          input.canvasController.raw.setSegmentationActiveClass?.(nextClass);
          input.uiManager.setWorkflow?.(input.state.session.workflow);
        });
      });
      elements.segmentationRelabelRegionBtn.addEventListener("click", () => {
        triggerSegmentationRelabel();
      });
      elements.segmentationAutoFillClosedRegionToggle.addEventListener("change", (event) => {
        const toggle = event.currentTarget;
        if (!(toggle instanceof HTMLInputElement)) {
          return;
        }
        input.canvasController.raw.setSegmentationAutoFillClosedRegionEnabled?.(toggle.checked);
        input.uiManager.setWorkflow?.(input.state.session.workflow);
      });
      elements.segmentationMaskVisibilityToggle.addEventListener("change", (event) => {
        const toggle = event.currentTarget;
        if (!(toggle instanceof HTMLInputElement)) {
          return;
        }
        input.canvasController.raw.setSegmentationOverlayVisibility?.(toggle.checked);
        input.uiManager.setWorkflow?.(input.state.session.workflow);
      });
      elements.segmentationMaskOpacitySlider.addEventListener("input", (event) => {
        const slider = event.currentTarget;
        if (!(slider instanceof HTMLInputElement)) {
          return;
        }
        input.canvasController.raw.setSegmentationOverlayOpacity?.(Number.parseInt(slider.value, 10) / 100);
        input.uiManager.setWorkflow?.(input.state.session.workflow);
      });
      elements.segmentationEdgeHighlightToggle.addEventListener("change", (event) => {
        const toggle = event.currentTarget;
        if (!(toggle instanceof HTMLInputElement)) {
          return;
        }
        input.canvasController.raw.setSegmentationEdgeHighlightVisible?.(toggle.checked);
        input.uiManager.setWorkflow?.(input.state.session.workflow);
      });
      elements.segmentationEdgeGlowSlider.addEventListener("input", (event) => {
        const slider = event.currentTarget;
        if (!(slider instanceof HTMLInputElement)) {
          return;
        }
        input.canvasController.raw.setSegmentationEdgeHighlightIntensity?.(Number.parseInt(slider.value, 10) / 100);
        input.uiManager.setWorkflow?.(input.state.session.workflow);
      });

      elements.segmentationClassSummary.addEventListener("change", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLInputElement) || target.type !== "checkbox") {
          return;
        }
        const classId = target.dataset.classId;
        if (!classId) {
          return;
        }
        input.canvasController.raw.setSegmentationClassVisibility?.(classId, target.checked);
        input.uiManager.setWorkflow?.(input.state.session.workflow);
      });
      elements.segmentationClassSummary.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) {
          return;
        }

        const allFilterButton = target.closest('[data-ui="segmentation-filter-all"]') as HTMLElement | null;
        if (allFilterButton) {
          input.canvasController.raw.setSegmentationOnlyVisibleClass?.(null);
          input.uiManager.setWorkflow?.(input.state.session.workflow);
          return;
        }

        const classFilterButton = target.closest('[data-ui="segmentation-filter-class"]') as HTMLElement | null;
        const classId = classFilterButton?.dataset.classId;
        if (classFilterButton && classId) {
          input.canvasController.raw.setSegmentationOnlyVisibleClass?.(classId);
          input.uiManager.setWorkflow?.(input.state.session.workflow);
        }
      });

      elements.drawModeBtn.addEventListener("change", () => {
        setMode("draw");
      });
      elements.editModeBtn.addEventListener("change", () => {
        setMode("edit");
      });

      elements.zoomInBtn.addEventListener("click", () => {
        input.canvasController.raw.zoom(1.2);
        input.windowRef.dispatchEvent?.(new Event("easy-labeling:canvas-view-change"));
      });
      elements.zoomOutBtn.addEventListener("click", () => {
        input.canvasController.raw.zoom(0.8);
        input.windowRef.dispatchEvent?.(new Event("easy-labeling:canvas-view-change"));
      });
      elements.resetZoomBtn.addEventListener("click", () => {
        input.canvasController.raw.resetZoom();
        input.windowRef.dispatchEvent?.(new Event("easy-labeling:canvas-view-change"));
      });
      elements.zoomInput.addEventListener("change", () => {
        input.canvasController.raw.setZoomPercentage(elements.zoomInput.value);
        input.windowRef.dispatchEvent?.(new Event("easy-labeling:canvas-view-change"));
      });

      elements.alignLeftBtn.addEventListener("click", () => {
        input.canvasController.raw.alignSelectionLeft();
        syncToolbarActionState();
      });
      elements.alignRightBtn.addEventListener("click", () => {
        input.canvasController.raw.alignSelectionRight();
        syncToolbarActionState();
      });
      elements.alignTopBtn.addEventListener("click", () => {
        input.canvasController.raw.alignSelectionTop();
        syncToolbarActionState();
      });
      elements.alignBottomBtn.addEventListener("click", () => {
        input.canvasController.raw.alignSelectionBottom();
        syncToolbarActionState();
      });
      elements.distributeHorizontalBtn.addEventListener("click", () => {
        input.canvasController.raw.distributeSelectionHorizontally();
        syncToolbarActionState();
      });
      elements.distributeVerticalBtn.addEventListener("click", () => {
        input.canvasController.raw.distributeSelectionVertically();
        syncToolbarActionState();
      });
      elements.undoBtn.addEventListener("click", () => {
        runUndo();
      });
      elements.redoBtn.addEventListener("click", () => {
        runRedo();
      });

      elements.previewBarHeader.addEventListener("click", () => {
        input.uiManager.togglePreviewBarVisibility?.(!input.state.view.isPreviewBarHidden);
        input.uiManager.renderPreviewList();
      });

      elements.togglePreviewBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        input.uiManager.togglePreviewBarVisibility?.(!input.state.view.isPreviewBarHidden);
        input.uiManager.renderPreviewList();
      });

      elements.selectByClassBtn.addEventListener("click", () => {
        const selectedClass = elements.selectByClassDropdown.value;
        if (selectedClass) {
          input.canvasController.raw.selectLabelsByClass(selectedClass);
        }
      });

      elements.goToCoordsBtn.addEventListener("click", () => {
        const x = Number.parseInt(elements.coordXInput.value, 10);
        const y = Number.parseInt(elements.coordYInput.value, 10);
        input.canvasController.raw.goToCoords(x, y);
      });

      elements.collapseLeftPanelBtn.addEventListener("click", () => {
        input.uiManager.togglePanel(elements.leftPanel, elements.leftSplitter, elements.expandLeftPanelBtn, true);
      });
      elements.expandLeftPanelBtn.addEventListener("click", () => {
        input.uiManager.togglePanel(elements.leftPanel, elements.leftSplitter, elements.expandLeftPanelBtn, false);
      });
      elements.collapseRightPanelBtn.addEventListener("click", () => {
        input.uiManager.togglePanel(elements.rightPanel, elements.rightSplitter, elements.expandRightPanelBtn, true);
      });
      elements.expandRightPanelBtn.addEventListener("click", () => {
        input.uiManager.togglePanel(elements.rightPanel, elements.rightSplitter, elements.expandRightPanelBtn, false);
      });

      elements.darkModeToggle.addEventListener("change", (event) => {
        const toggle = event.currentTarget;
        if (!(toggle instanceof HTMLInputElement)) {
          return;
        }
        input.uiManager.applyDarkMode(toggle.checked);
      });

      elements.crosshairToggle.addEventListener("change", (event) => {
        const toggle = event.currentTarget;
        if (!(toggle instanceof HTMLInputElement)) {
          return;
        }
        input.canvasController.raw.toggleCrosshair(toggle.checked);
      });

      rawCanvas.on?.("mouse:down", (event) => {
        const pointer = getCanvasPointer(event.e);
        if (!pointer) {
          return;
        }
        input.state.view.lastMousePosition = pointer;

        const mouseEvent = event.e as MouseEvent;
        if (mouseEvent.altKey || mouseEvent.ctrlKey) {
          rawCanvas.isDragging = true;
          rawCanvas.selection = false;
          rawCanvas.lastPosX = mouseEvent.clientX;
          rawCanvas.lastPosY = mouseEvent.clientY;
          return;
        }

        maybeStartGestureBaseline(event.target ?? null);

        if (input.state.session.workflow === "segmentation") {
          if (input.state.view.currentMode === "edit") {
            const startedMove = input.canvasController.raw.startSegmentationRegionMove?.(pointer) ?? false;
            if (startedMove) {
              isMovingSegmentationRegion = true;
              rawCanvas.selection = false;
              return;
            }
            const selected = input.canvasController.raw.selectSegmentationRegionAtPoint?.(pointer) ?? false;
            if (!selected) {
              input.canvasController.raw.clearSegmentationSelection?.();
            }
            input.uiManager.setWorkflow?.(input.state.session.workflow);
            return;
          }
          suppressSelectionForSegmentationStroke = true;
          rawCanvas.selection = false;
        }

        input.canvasController.raw.startDrawing(pointer);
      });

      rawCanvas.on?.("mouse:move", (event) => {
        const pointer = getCanvasPointer(event.e);
        const mouseEvent = event.e as MouseEvent;
        if (rawCanvas.isDragging) {
          const vpt = rawCanvas.viewportTransform;
          vpt[4] += mouseEvent.clientX - (rawCanvas.lastPosX ?? mouseEvent.clientX);
          vpt[5] += mouseEvent.clientY - (rawCanvas.lastPosY ?? mouseEvent.clientY);
          rawCanvas.lastPosX = mouseEvent.clientX;
          rawCanvas.lastPosY = mouseEvent.clientY;
          rawCanvas.renderAll();
          return;
        }

        if (!pointer) {
          return;
        }
        input.state.view.lastMousePosition = pointer;
        if (isMovingSegmentationRegion) {
          const moved = input.canvasController.raw.continueSegmentationRegionMove?.(pointer) ?? false;
          if (input.state.view.isCrosshairVisible) {
            input.canvasController.raw.updateCrosshair(pointer);
          }
          if (input.state.session.currentImage && pointer.x >= 0 && pointer.y >= 0) {
            input.uiManager.updateMouseCoords(pointer.x, pointer.y);
          }
          void moved;
          return;
        }
        input.canvasController.raw.continueDrawing(pointer);
        if (input.state.view.isCrosshairVisible) {
          input.canvasController.raw.updateCrosshair(pointer);
        }
        if (input.state.session.currentImage && pointer.x >= 0 && pointer.y >= 0) {
          input.uiManager.updateMouseCoords(pointer.x, pointer.y);
        }
      });

      rawCanvas.on?.("mouse:up", () => {
        if (rawCanvas.isDragging) {
          rawCanvas.isDragging = false;
          rawCanvas.selection = shouldEnableCanvasSelection();
          rawCanvas.setViewportTransform([...rawCanvas.viewportTransform]);
          rawCanvas.calcOffset?.();
          input.canvasController.raw.updateAllLabelTexts();
          rawCanvas.requestRenderAll();
          input.windowRef.dispatchEvent?.(new Event("easy-labeling:canvas-view-change"));
          return;
        }
        if (isMovingSegmentationRegion) {
          finishSegmentationRegionMove();
          return;
        }
        clearTemporarySelectionSuppression();
        runAsync(() => input.canvasController.raw.finishDrawing().then(() => {
          input.uiManager.updateLabelList();
          syncToolbarActionState();
        }));
      });

      rawCanvas.on?.("mouse:dblclick", (event) => {
        if (input.state.view.currentMode !== "edit") {
          return;
        }

        if (input.state.session.workflow === "detection") {
          const target = resolveDetectionTarget(event.e, event.target);
          if (target && isRectObject(target)) {
            runAsyncAndSyncToolbar(() => input.canvasController.raw.editLabel(target));
            return;
          }
          if (target && isActiveSelectionObject(target)) {
            runAsyncAndSyncToolbar(() => input.canvasController.raw.editMultipleLabels(target));
          }
          return;
        }

        const pointer = getCanvasPointer(event.e);
        if (!pointer) {
          return;
        }
        input.state.view.lastMousePosition = pointer;
        triggerSegmentationRelabelAtPoint(pointer);
      });

      rawCanvas.on?.("mouse:wheel", (event) => {
        const wheelEvent = event.e as WheelEvent;
        let zoom = rawCanvas.getZoom();
        const wheelFactor = 0.999 ** wheelEvent.deltaY;
        const clampedWheelFactor = Math.min(1.5, Math.max(0.5, wheelFactor));
        zoom *= clampedWheelFactor;
        if (zoom > 20) {
          zoom = 20;
        }
        if (zoom < 0.1) {
          zoom = 0.1;
        }
        rawCanvas.zoomToPoint({ x: wheelEvent.offsetX, y: wheelEvent.offsetY }, zoom);
        rawCanvas.calcOffset?.();
        wheelEvent.preventDefault();
        wheelEvent.stopPropagation();
        input.uiManager.updateZoomDisplay(rawCanvas.getZoom());
        input.canvasController.raw.updateAllLabelTexts();
        input.windowRef.dispatchEvent?.(new Event("easy-labeling:canvas-view-change"));
      });

      rawCanvas.on?.("mouse:over", (event) => {
        if (input.state.session.workflow === "detection" && event.target && isRectObject(event.target)) {
          input.canvasController.raw.setHoveredAnnotation?.(event.target);
        }
      });

      rawCanvas.on?.("mouse:out", () => {
        clearTemporarySelectionSuppression();
        input.uiManager.hideMouseCoords();
        input.canvasController.raw.hideCrosshair();
        input.canvasController.raw.setHoveredAnnotation?.(null);
      });

      rawCanvas.on?.("object:modified", () => {
        finalizeGestureBaseline();
        input.canvasController.raw.updateAllLabelTexts();
        input.uiManager.updateLabelList();
        syncToolbarActionState();
      });
      rawCanvas.on?.("object:scaled", () => {
        finalizeGestureBaseline();
        input.canvasController.raw.updateAllLabelTexts();
        input.uiManager.updateLabelList();
        syncToolbarActionState();
      });
      rawCanvas.on?.("selection:created", () => {
        input.canvasController.raw.highlightSelection();
        input.canvasController.raw.updateAllLabelTexts();
        input.uiManager.updateLabelList();
        syncToolbarActionState();
      });
      rawCanvas.on?.("selection:updated", () => {
        input.canvasController.raw.highlightSelection();
        input.canvasController.raw.updateAllLabelTexts();
        input.uiManager.updateLabelList();
        syncToolbarActionState();
      });
      rawCanvas.on?.("selection:cleared", () => {
        input.canvasController.raw.highlightSelection();
        input.canvasController.raw.updateAllLabelTexts();
        input.uiManager.updateLabelList();
        syncToolbarActionState();
      });

      rawCanvas.upperCanvasEl?.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        elements.contextMenu.style.display = "none";
        if (input.state.session.workflow !== "detection" || input.state.view.currentMode !== "edit") {
          return;
        }

        const target = resolveDetectionTarget(event as MouseEvent);
        if (target && (isRectObject(target) || isActiveSelectionObject(target))) {
          const rectTarget = isRectObject(target) ? target : null;
          const selectionTarget = isActiveSelectionObject(target) ? target : null;
          elements.contextMenu.style.left = `${(event as MouseEvent).clientX}px`;
          elements.contextMenu.style.top = `${(event as MouseEvent).clientY}px`;
          elements.contextMenu.style.display = "block";

          const cleanup = (): void => {
            elements.contextMenu.style.display = "none";
            input.documentRef?.removeEventListener("click", cleanup);
          };

          elements.ctxEditLabel.onclick = () => {
            if (rectTarget) {
              runAsync(() => input.canvasController.raw.editLabel(rectTarget).then(() => {
                syncToolbarActionState();
              }));
            }
            if (selectionTarget) {
              runAsync(() => input.canvasController.raw.editMultipleLabels(selectionTarget).then(() => {
                syncToolbarActionState();
              }));
            }
            cleanup();
          };
          elements.ctxDeleteLabel.onclick = () => {
            if (rectTarget) {
              rawCanvas.setActiveObject(rectTarget);
              input.canvasController.raw.deleteSelection();
            }
            if (selectionTarget) {
              rawCanvas.setActiveObject(selectionTarget);
              input.canvasController.raw.deleteSelection();
            }
            syncToolbarActionState();
            cleanup();
          };

          input.documentRef?.addEventListener("click", cleanup, { once: true });
          return;
        }
      });

      syncViewControls();
      syncToolbarActionState();

      input.windowRef.addEventListener("easy-labeling:history-reset", () => {
        syncToolbarActionState();
      });
      input.windowRef.addEventListener("easy-labeling:history-change", () => {
        syncToolbarActionState();
      });

      input.windowRef.addEventListener("mouseup", () => {
        clearTemporarySelectionSuppression();
        finishSegmentationRegionMove();
      });
      input.windowRef.addEventListener("blur", () => {
        clearTemporarySelectionSuppression();
        finishSegmentationRegionMove();
      });

      input.windowRef.addEventListener("keydown", (event) => {
        const templateModalElement = input.documentRef?.getElementById("templateMatchingModal");
        const templateModalVisible = elements.templateMatchingModal?._isShown
          || templateModalElement?.classList.contains("show");
        if (templateModalVisible
          && (event.ctrlKey || event.metaKey)
          && !event.altKey
          && !event.shiftKey
          && event.key.toLowerCase() === "q") {
          event.preventDefault();
          input.windowRef.dispatchEvent?.(new Event("easy-labeling:toggle-template-pointer-mode"));
          return;
        }
        if (elements.classFileViewerModal._element?.classList.contains("show")) {
          return;
        }

        const target = event.target;
        if (target instanceof HTMLElement && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
          return;
        }

        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a") {
          event.preventDefault();
          input.canvasController.raw.selectAllLabels();
          syncToolbarActionState();
          return;
        }

        if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === "z") {
          event.preventDefault();
          if (event.shiftKey) {
            runRedo();
            return;
          }

          runUndo();
          return;
        }

        if (event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey && event.key.toLowerCase() === "y") {
          event.preventDefault();
          runRedo();
          return;
        }

        if (event.altKey && event.shiftKey && !event.ctrlKey && !event.metaKey) {
          const key = event.key.toLowerCase();
          switch (key) {
            case "l":
              event.preventDefault();
              input.canvasController.raw.alignSelectionLeft();
              syncToolbarActionState();
              return;
            case "r":
              event.preventDefault();
              input.canvasController.raw.alignSelectionRight();
              syncToolbarActionState();
              return;
            case "t":
              event.preventDefault();
              input.canvasController.raw.alignSelectionTop();
              syncToolbarActionState();
              return;
            case "d":
              event.preventDefault();
              input.canvasController.raw.alignSelectionBottom();
              syncToolbarActionState();
              return;
            case "h":
              event.preventDefault();
              input.canvasController.raw.distributeSelectionHorizontally();
              syncToolbarActionState();
              return;
            case "v":
              event.preventDefault();
              input.canvasController.raw.distributeSelectionVertically();
              syncToolbarActionState();
              return;
          }
        }

        if (event.key === "a" || event.key === "A") {
          runExclusive("navigate-image", () => input.fileSystem.navigateImage(-1));
          return;
        }
        if (event.key === "d" || event.key === "D") {
          runExclusive("navigate-image", () => input.fileSystem.navigateImage(1));
          return;
        }
        if ((event.ctrlKey || event.metaKey) && (event.key === "s" || event.key === "S")) {
          event.preventDefault();
          runExclusive("save-labels", () => input.fileSystem.saveLabels(false), elements.saveLabelsBtn as HTMLButtonElement);
          return;
        }
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "q") {
          event.preventDefault();
          setMode(input.state.view.currentMode === "edit" ? "draw" : "edit");
          return;
        }

        if ((event.ctrlKey || event.metaKey) && (event.key === "c" || event.key === "C")) {
          event.preventDefault();
          runAsync(() => input.canvasController.raw.copy());
          return;
        }
        if ((event.ctrlKey || event.metaKey) && (event.key === "v" || event.key === "V")) {
          event.preventDefault();
          runAsync(() => input.canvasController.raw.paste().then(() => {
            input.uiManager.updateLabelList();
            syncToolbarActionState();
          }));
          return;
        }
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "b") {
          event.preventDefault();
          const activeObject = rawCanvas.getActiveObject();
          if (activeObject && isRectObject(activeObject)) {
            runAsync(() => input.canvasController.raw.editLabel(activeObject).then(() => {
              syncToolbarActionState();
            }));
            return;
          }
          if (activeObject && isActiveSelectionObject(activeObject)) {
            runAsync(() => input.canvasController.raw.editMultipleLabels(activeObject).then(() => {
              syncToolbarActionState();
            }));
            return;
          }
          if (input.state.session.workflow === "segmentation") {
            triggerSegmentationRelabel();
            return;
          }
        }

        if (/^[0-9]$/.test(event.key) && !event.ctrlKey && !event.metaKey && !event.altKey) {
          event.preventDefault();
          if (input.state.session.workflow === "segmentation") {
            if (event.key === "0") {
              input.canvasController.raw.setSegmentationTool?.("erase");
            } else {
              input.canvasController.raw.setSegmentationActiveClass?.(event.key);
              input.canvasController.raw.setSegmentationTool?.("brush");
            }
            input.uiManager.setWorkflow?.(input.state.session.workflow);
            syncToolbarActionState();
            return;
          }

          if (input.state.session.workflow === "detection") {
            const changed = input.canvasController.raw.setSelectedLabelClass?.(event.key) ?? false;
            if (changed) {
              syncToolbarActionState();
            }
            return;
          }
        }

        const activeObject = rawCanvas.getActiveObject();
        if (activeObject && input.state.view.currentMode === "edit" && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
          event.preventDefault();
          const baseline = input.canvasController.raw.captureHistoryBaseline();
          const step = event.shiftKey ? 10 : 1;
          switch (event.key) {
            case "ArrowUp":
              activeObject.top -= step;
              break;
            case "ArrowDown":
              activeObject.top += step;
              break;
            case "ArrowLeft":
              activeObject.left -= step;
              break;
            case "ArrowRight":
              activeObject.left += step;
              break;
          }
          activeObject.setCoords();
          if (isActiveSelectionObject(activeObject)) {
            activeObject.getObjects().forEach((object) => {
              object.originalYolo = null;
              if (isRectObject(object)) {
                input.canvasController.raw.updateLabelText(object);
              }
            });
          } else if (isRectObject(activeObject)) {
            activeObject.originalYolo = null;
            input.canvasController.raw.updateLabelText(activeObject);
          }
          input.canvasController.raw.renderAll();
          input.uiManager.updateLabelList();
          input.canvasController.raw.commitHistoryFromBaseline(baseline);
          syncToolbarActionState();
          return;
        }

        if (event.key === "Delete" || event.key === "Backspace") {
          event.preventDefault();
          if (input.state.session.workflow === "segmentation" && input.state.view.currentMode === "edit") {
            const changed = input.canvasController.raw.deleteSelectedSegmentationRegion?.() ?? false;
            if (changed) {
              input.uiManager.setWorkflow?.(input.state.session.workflow);
              input.uiManager.updateLabelList();
            }
          } else {
            input.canvasController.raw.deleteSelection();
          }
          syncToolbarActionState();
          return;
        }

        if (event.key === "Escape") {
          rawCanvas.discardActiveObject();
          input.canvasController.raw.renderAll();
          syncToolbarActionState();
        }
      });

      input.windowRef.addEventListener("easy-labeling:document-status-change", () => {
        input.uiManager.syncWorkspaceState?.();
      });
      input.windowRef.addEventListener("easy-labeling:history-reset", () => {
        syncToolbarActionState();
      });
      input.windowRef.addEventListener("beforeunload", (event) => {
        if (!hasDirtyDocuments(input.state)) {
          return;
        }
        event.preventDefault();
        (event as BeforeUnloadEvent).returnValue = "";
      });

      syncViewControls();
      syncToolbarActionState();
      input.uiManager.setInspectorTab?.("annotation");
      input.uiManager.setActiveTask?.("annotate");
      input.uiManager.syncWorkspaceState?.();
    }
  };
}
