import type { EventManager } from "../app/contracts.js";
import { hasDirtyDocuments } from "../app/document-status.js";
import type { LabelDisplayMode, WorkflowType } from "../types/labels.js";
import type { AppState } from "../app/state.js";
import { isActiveSelectionObject, isRectObject, type FabricObjectLike, type FabricRectLike } from "../features/canvas/fabric-types.js";
import type { CanvasHistoryGestureBaseline } from "../features/canvas/history.js";
import type { RuntimeCanvasController } from "./canvas-controller-adapter.js";
import type { RuntimeFileSystem, WorkspaceLoadProgressReporter } from "./file-system-adapter.js";
import type { RuntimeUiManager, WorkspaceStandbyStep } from "./ui-manager-adapter.js";
import { createAutomationController, type AutomationWindow } from "./automation-controller.js";
import { saveSegmentationToolPresets } from "../features/segmentation/preset-service.js";
import type { SegmentationToolPreset } from "../features/segmentation/types.js";

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

function isEditableKeyboardTarget(target: EventTarget | null): boolean {
  if (!target || typeof target !== "object") {
    return false;
  }

  const element = target as {
    tagName?: unknown;
    type?: unknown;
    isContentEditable?: unknown;
    closest?: (selector: string) => unknown;
  };
  const tagName = typeof element.tagName === "string" ? element.tagName.toUpperCase() : "";
  if (tagName === "INPUT") {
    const inputType = typeof element.type === "string" ? element.type.toLowerCase() : "text";
    return !["button", "checkbox", "file", "hidden", "image", "radio", "reset", "submit"].includes(inputType);
  }
  if (tagName === "TEXTAREA" || tagName === "SELECT" || element.isContentEditable === true) {
    return true;
  }

  return typeof element.closest === "function"
    && element.closest("input:not([type='button']):not([type='checkbox']):not([type='file']):not([type='hidden']):not([type='image']):not([type='radio']):not([type='reset']):not([type='submit']), textarea, select, [contenteditable]:not([contenteditable='false'])") !== null;
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
    easyLabelingDesktop: Window["easyLabelingDesktop"];
    showDirectoryPicker: Window["showDirectoryPicker"];
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

      let lastWorkspaceStandbyRetry: (() => void) | null = null;
      const prepareWorkspace = async (options: {
        title: string;
        summary: string;
        loadDataset?: (reportProgress: WorkspaceLoadProgressReporter) => Promise<void>;
        selectFirstAutomation?: boolean;
      }): Promise<void> => {
        let activeStep: WorkspaceStandbyStep = "interface";
        let hasWarning = false;
        input.uiManager.startWorkspaceStandby(options.title, options.summary);
        input.uiManager.updateWorkspaceStandbyStep("interface", "ready", "Interface ready");

        const reportProgress: WorkspaceLoadProgressReporter = (step, state, detail) => {
          activeStep = step;
          hasWarning ||= state === "warning";
          input.uiManager.updateWorkspaceStandbyStep(step, state, detail);
        };

        if (!options.loadDataset) {
          input.uiManager.updateWorkspaceStandbyStep("dataset", "pending", "Waiting for a dataset");
          input.uiManager.updateWorkspaceStandbyStep("labels", "pending", "Waiting for a dataset");
          input.uiManager.updateWorkspaceStandbyStep("images", "pending", "Waiting for a dataset");
          input.uiManager.updateWorkspaceStandbyStep("classes", "pending", "Waiting for a dataset");
        } else {
          input.uiManager.updateWorkspaceStandbyStep("dataset", "loading", "Preparing dataset access");
        }

        lastWorkspaceStandbyRetry = () => {
          runExclusive("retry-workspace-standby", () => prepareWorkspace(options), elements.retryWorkspaceStandbyBtn);
        };

        try {
          await input.fileSystem.loadDefaultClassInfo();
          await options.loadDataset?.(reportProgress);

          if (automationController) {
            activeStep = "automation";
            input.uiManager.updateWorkspaceStandbyStep("automation", "loading", "Loading saved layouts and presets");
            await automationController.refreshLibrary({ selectFirst: options.selectFirstAutomation });
            const layoutCount = Math.max(0, elements.boxLayoutSelect.options.length - 1);
            const presetCount = Math.max(0, elements.automationPresetSelect.options.length - 1);
            input.uiManager.updateWorkspaceStandbyStep(
              "automation",
              "ready",
              layoutCount + presetCount > 0
                ? `${layoutCount} layout${layoutCount === 1 ? "" : "s"}, ${presetCount} preset${presetCount === 1 ? "" : "s"}`
                : "No saved items; empty library ready"
            );

            activeStep = "matching";
            input.uiManager.updateWorkspaceStandbyStep("matching", "loading", "Starting the matching engine");
            await automationController.prepareMatchingEngine();
            input.uiManager.updateWorkspaceStandbyStep("matching", "ready", "Matching engine ready");
          } else {
            input.uiManager.updateWorkspaceStandbyStep("automation", "warning", "Automation UI unavailable");
            input.uiManager.updateWorkspaceStandbyStep("matching", "warning", "Matching engine unavailable");
            hasWarning = true;
          }

          input.uiManager.finishWorkspaceStandby(
            hasWarning ? "warning" : "ready",
            hasWarning
              ? "Workspace loaded with limits. Review the highlighted item before continuing."
              : options.loadDataset
                ? "Workspace ready. All labeling features are available."
                : "Core tools ready. Open a dataset to begin labeling."
          );
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Initialization failed";
          input.uiManager.updateWorkspaceStandbyStep(activeStep, "error", message);
          input.uiManager.finishWorkspaceStandby("error", "Workspace preparation did not finish. Retry when ready.");
          throw error;
        }
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
        input.state.view.currentMode = mode;
        elements.drawModeBtn.checked = mode === "draw";
        elements.editModeBtn.checked = mode === "edit";
        input.canvasController.setMode?.(mode);
        input.uiManager.syncWorkspaceState?.();
      };

      const renderLists = (): void => {
        input.uiManager.renderImageList();
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

      const navigateReviewQueue = (direction: -1 | 1): void => {
        const queueImageNames = [...elements.imageList.querySelectorAll<HTMLElement>("[data-file-name]")]
          .map((item) => item.dataset.fileName)
          .filter((name): name is string => Boolean(name));
        const currentImageName = input.state.session.currentImageFile?.name;
        const currentIndex = currentImageName ? queueImageNames.indexOf(currentImageName) : -1;
        const targetImageName = queueImageNames[currentIndex + direction];
        const targetFile = input.state.session.imageFiles.find((file) => file.name === targetImageName);
        if (targetFile) {
          runExclusive("navigate-review", () => input.fileSystem.loadImage(targetFile));
        }
      };

      elements.taskFilesBtn.addEventListener("click", () => input.uiManager.setActiveTask?.("files"));
      elements.taskAnnotateBtn.addEventListener("click", () => setWorkflow("detection"));
      elements.taskSegmentationBtn.addEventListener("click", () => {
        setWorkflow("segmentation");
        input.uiManager.setActiveTask?.("segmentation");
      });
      elements.taskSuperpixelBtn.addEventListener("click", () => input.uiManager.setActiveTask?.("superpixel"));
      elements.taskSegmentationDisplayBtn.addEventListener("click", () => input.uiManager.setActiveTask?.("segmentation-display"));
      elements.taskAutomateBtn.addEventListener("click", () => input.uiManager.setActiveTask?.("automate"));
      elements.taskReviewBtn?.addEventListener("click", () => input.uiManager.setActiveTask?.("review"));
      elements.previousReviewIssueBtn?.addEventListener("click", () => navigateReviewQueue(-1));
      elements.nextReviewIssueBtn?.addEventListener("click", () => navigateReviewQueue(1));
      elements.retryWorkspaceStandbyBtn.addEventListener("click", () => lastWorkspaceStandbyRetry?.());
      elements.dismissWorkspaceStandbyBtn.addEventListener("click", () => input.uiManager.hideWorkspaceStandby());
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
      elements.emptyLoadSampleBtn.addEventListener("click", () => {
        runExclusive("load-sample", automationController
          ? () => prepareWorkspace({
            title: "Preparing sample workspace",
            summary: "Loading the sample dataset and checking each labeling feature.",
            loadDataset: (reportProgress) => input.fileSystem.loadSampleTestData(reportProgress),
            selectFirstAutomation: true
          })
          : () => input.fileSystem.loadSampleTestData(), elements.emptyLoadSampleBtn);
      });
      elements.refreshDatasetBtn.addEventListener("click", () => {
        runExclusive("refresh-dataset", automationController
          ? () => prepareWorkspace({
            title: "Refreshing workspace",
            summary: "Rechecking dataset files and labeling features.",
            loadDataset: (reportProgress) => input.fileSystem.refreshDataset(reportProgress)
          })
          : () => input.fileSystem.refreshDataset(), elements.refreshDatasetBtn);
      });
      elements.classSearchInput.addEventListener("input", filterClassControls);
      elements.addClassShortcutBtn.addEventListener("click", () => {
        runExclusive("open-class-editor", async () => {
          if (!input.state.session.selectedClassFile && input.state.session.classFiles.length === 0) {
            await input.fileSystem.createNewClassFile();
          }
          await input.fileSystem.showClassFileContent();
        }, elements.addClassShortcutBtn);
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
        const selectedFolder = input.windowRef.showDirectoryPicker?.();
        runExclusive("open-dataset", automationController
          ? () => prepareWorkspace({
            title: "Preparing dataset workspace",
            summary: "Connecting the dataset and checking each labeling feature.",
            loadDataset: (reportProgress) => input.fileSystem.selectImageFolder(reportProgress, selectedFolder)
          })
          : () => input.fileSystem.selectImageFolder(undefined, selectedFolder), elements.selectImageFolderBtn as HTMLButtonElement);
      });

      elements.selectLabelFolderBtn.addEventListener("click", () => {
        const selectedFolder = input.windowRef.showDirectoryPicker?.();
        runExclusive("select-label-folder", () => input.fileSystem.selectLabelFolder(selectedFolder), elements.selectLabelFolderBtn as HTMLButtonElement);
      });

      elements.loadClassInfoFolderBtn.addEventListener("click", () => {
        const selectedFolder = input.windowRef.showDirectoryPicker?.({ id: "class-info", mode: "readwrite" });
        runExclusive("select-class-folder", () => input.fileSystem.selectClassInfoFolder(selectedFolder), elements.loadClassInfoFolderBtn as HTMLButtonElement);
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

      elements.imageSearchInput.addEventListener("input", renderLists);
      elements.showLabeledCheckbox.addEventListener("change", renderLists);
      elements.showUnlabeledCheckbox.addEventListener("change", renderLists);
      if (elements.reviewFilterSelect) {
        elements.reviewFilterSelect.addEventListener("change", () => {
          input.state.view.reviewFilter = elements.reviewFilterSelect.value as typeof input.state.view.reviewFilter;
          input.uiManager.renderImageList();
        });
        elements.markReviewedBtn.addEventListener("click", () => {
          const imageName = input.state.session.currentImageFile?.name;
          if (imageName) {
            runAsync(async () => input.fileSystem.setReviewImageStatus(imageName, "reviewed"));
          }
        });
        elements.markNeedsReviewBtn.addEventListener("click", () => {
          const imageName = input.state.session.currentImageFile?.name;
          if (imageName) {
            runAsync(async () => input.fileSystem.setReviewImageStatus(imageName, "needs-review"));
          }
        });
        elements.saveReviewRulesBtn.addEventListener("click", () => {
          const minimumBoxSizePx = Number(elements.reviewMinimumBoxSizeInput.value);
          const duplicateIouThreshold = Number(elements.reviewDuplicateIouInput.value);
          const requiredClassIds = [...new Set(elements.reviewRequiredClassesInput.value.split(",").map((value) => value.trim()).filter((value) => /^\d+$/.test(value)))];
          if (!Number.isFinite(minimumBoxSizePx) || minimumBoxSizePx < 1 || !Number.isFinite(duplicateIouThreshold) || duplicateIouThreshold < 0 || duplicateIouThreshold > 1) {
            input.uiManager.notify("Set a minimum box size of 1px or more and a duplicate IoU from 0 to 1.");
            return;
          }
          runAsync(async () => input.fileSystem.updateReviewSettings({ minimumBoxSizePx, duplicateIouThreshold, requiredClassIds }));
        });
        elements.reviewIssueList.addEventListener("click", (event) => {
          if (input.state.session.workflow !== "detection") {
            return;
          }
          const button = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>("[data-review-issue-index]");
          const imageName = input.state.session.currentImageFile?.name;
          const issueIndex = Number(button?.dataset.reviewIssueIndex);
          const issue = imageName && Number.isInteger(issueIndex) ? input.state.session.reviewFindings.get(imageName)?.issues[issueIndex] : null;
          if (!issue) {
            return;
          }
          const rects = input.canvasController.raw.getObjects("rect").filter(isRectObject);
          const targets = [...new Set(issue.rectIndexes)]
            .map((rectIndex) => rects[rectIndex])
            .filter((rect): rect is FabricRectLike => Boolean(rect));
          if (targets.length === 0) {
            return;
          }
          elements.reviewIssueList.querySelectorAll<HTMLButtonElement>(".review-issue-item.active").forEach((item) => {
            item.classList.remove("active");
            item.setAttribute("aria-pressed", "false");
          });
          button?.classList.add("active");
          button?.setAttribute("aria-pressed", "true");
          input.canvasController.raw.setActiveSelection(targets, targets[0] ?? null);
          const targetBounds = targets.map((rect) => rect.getBoundingRect(true));
          const left = Math.min(...targetBounds.map((bounds) => bounds.left));
          const top = Math.min(...targetBounds.map((bounds) => bounds.top));
          const right = Math.max(...targetBounds.map((bounds) => bounds.left + bounds.width));
          const bottom = Math.max(...targetBounds.map((bounds) => bounds.top + bounds.height));
          const zoom = rawCanvas.getZoom();
          rawCanvas.setViewportTransform([zoom, 0, 0, zoom,
            rawCanvas.getWidth() / 2 - (left + (right - left) / 2) * zoom,
            rawCanvas.getHeight() / 2 - (top + (bottom - top) / 2) * zoom]);
          rawCanvas.requestRenderAll();
          input.uiManager.syncSelectionInspector();
        });
      }

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
        setMode("draw");
      });
      input.documentRef?.getElementById("segmentationEditModeBtn")?.addEventListener("click", () => {
        setMode("edit");
      });
      elements.segmentationAnnotationTypeSelect?.addEventListener("change", (event) => {
        const select = event.currentTarget;
        if (select instanceof HTMLSelectElement && (select.value === "semantic" || select.value === "instance")) {
          input.state.session.segmentationAnnotationType = select.value;
          input.uiManager.setWorkflow?.(input.state.session.workflow);
        }
      });
      elements.segmentationSourceFormatSelect?.addEventListener("change", (event) => {
        const select = event.currentTarget;
        if (select instanceof HTMLSelectElement) {
          input.state.session.segmentationSourceFormat = select.value as import("../domain/annotations/segmentation-format.js").SegmentationExternalFormat;
          const currentImage = input.state.session.currentImageFile;
          if (currentImage && !hasDirtyDocuments(input.state)) {
            runExclusive("reload-segmentation-source", () => input.fileSystem.loadImage(currentImage));
          } else if (currentImage) {
            input.uiManager.notify("Save or discard current edits before reloading the selected annotation source.", 4000);
          }
        }
      });
      elements.segmentationExportFormatSelect?.addEventListener("change", (event) => {
        const select = event.currentTarget;
        if (select instanceof HTMLSelectElement) {
          input.state.session.segmentationExportFormat = select.value as import("../domain/annotations/segmentation-format.js").SegmentationExternalFormat;
          input.uiManager.setWorkflow?.(input.state.session.workflow);
        }
      });
      elements.segmentationEraseModeBtn.addEventListener("click", () => {
        input.canvasController.raw.setSegmentationTool?.("erase");
        input.uiManager.setWorkflow?.(input.state.session.workflow);
        setMode("draw");
      });
      elements.segmentationPolygonModeBtn?.addEventListener("click", () => {
        input.canvasController.raw.setSegmentationTool?.("polygon");
        input.uiManager.setWorkflow?.(input.state.session.workflow);
        setMode("draw");
      });
      const segmentationDocument = input.documentRef;
      const completePolygonButton = segmentationDocument?.getElementById("segmentationCompletePolygonBtn");
      const cancelPolygonButton = segmentationDocument?.getElementById("segmentationCancelPolygonBtn");
      completePolygonButton?.addEventListener("click", () => {
        if (input.canvasController.raw.finishSegmentationPolygon?.()) {
          input.uiManager.setWorkflow?.("segmentation");
          input.uiManager.updateLabelList();
        }
      });
      cancelPolygonButton?.addEventListener("click", () => {
        if (input.canvasController.raw.cancelSegmentationPolygon?.()) input.uiManager.setWorkflow?.("segmentation");
      });
      elements.segmentationSuperpixelModeBtn?.addEventListener("click", () => {
        const size = Number.parseInt(elements.segmentationSuperpixelSizeSlider?.value ?? "16", 10);
        if (!input.canvasController.raw.recalculateSegmentationSuperpixels?.(size)) {
          input.uiManager.notify("Superpixels could not be calculated for this image.", 3500);
          return;
        }
        input.canvasController.raw.setSegmentationTool?.("superpixel");
        input.uiManager.setWorkflow?.(input.state.session.workflow);
        setMode("draw");
      });
      elements.segmentationSmartModeBtn?.addEventListener("click", () => {
        const size = Number.parseInt(elements.segmentationSuperpixelSizeSlider?.value ?? "16", 10);
        if (!input.canvasController.raw.recalculateSegmentationSuperpixels?.(size)) {
          input.uiManager.notify("Smart Select needs a loaded image.", 3500);
          return;
        }
        input.canvasController.raw.setSegmentationTool?.("smart");
        setMode("draw");
        input.uiManager.setWorkflow?.(input.state.session.workflow);
      });
      elements.segmentationRecalculateSuperpixelsBtn?.addEventListener("click", () => {
        const size = Number.parseInt(elements.segmentationSuperpixelSizeSlider?.value ?? "16", 10);
        input.canvasController.raw.recalculateSegmentationSuperpixels?.(size);
      });
      elements.segmentationSuperpixelSizeSlider?.addEventListener("input", (event) => {
        const slider = event.currentTarget;
        if (slider instanceof HTMLInputElement && elements.segmentationSuperpixelSizeValue) {
          elements.segmentationSuperpixelSizeValue.textContent = `${slider.value} px`;
          input.canvasController.raw.setSegmentationSuperpixelSettings?.({ regionSize: Number.parseInt(slider.value, 10) });
        }
      });
      elements.segmentationSuperpixelPresetButtons?.forEach((button) => {
        button.addEventListener("click", () => {
          const size = Number.parseInt(button.dataset.size ?? "", 10);
          if (!Number.isInteger(size)) return;
          elements.segmentationSuperpixelSizeSlider.value = `${size}`;
          elements.segmentationSuperpixelSizeValue.textContent = `${size} px`;
          input.canvasController.raw.setSegmentationSuperpixelSettings?.({ regionSize: size });
          elements.segmentationSuperpixelPresetButtons.forEach((candidate) => candidate.classList.toggle("active", candidate === button));
          input.canvasController.raw.recalculateSegmentationSuperpixels?.(size);
        });
      });
      elements.segmentationSuperpixelBoundaryToggle?.addEventListener("change", (event) => {
        const toggle = event.currentTarget;
        if (toggle instanceof HTMLInputElement) input.canvasController.raw.setSegmentationSuperpixelBoundaryVisible?.(toggle.checked);
      });
      const blurSelect = segmentationDocument?.getElementById("segmentationBlurSelect");
      const contrastSelect = segmentationDocument?.getElementById("segmentationContrastSelect");
      const edgeSensitivitySelect = segmentationDocument?.getElementById("segmentationEdgeSensitivitySelect");
      const presetSelect = segmentationDocument?.getElementById("segmentationToolPresetSelect");
      const readSuperpixelSettings = (): void => {
        if (!(blurSelect instanceof HTMLSelectElement) || !(contrastSelect instanceof HTMLSelectElement) || !(edgeSensitivitySelect instanceof HTMLSelectElement)) return;
        const changed = input.canvasController.raw.setSegmentationSuperpixelSettings?.({
          blur: blurSelect.value as import("../features/segmentation/types.js").SegmentationStrength,
          contrast: contrastSelect.value as import("../features/segmentation/types.js").SegmentationStrength,
          edgeSensitivity: edgeSensitivitySelect.value as "low" | "medium" | "high"
        });
        if (changed) input.uiManager.notify("Superpixel settings changed. Recalculate to update the regions.", 2500);
      };
      blurSelect?.addEventListener("change", readSuperpixelSettings);
      contrastSelect?.addEventListener("change", readSuperpixelSettings);
      edgeSensitivitySelect?.addEventListener("change", readSuperpixelSettings);
      const savePresetLibrary = async (): Promise<void> => {
        const folder = input.state.session.imageFolderHandle;
        if (!folder) throw new Error("Open a dataset before saving a Superpixel preset.");
        await saveSegmentationToolPresets(folder as unknown as import("../types/files.js").DirectoryHandleLike, input.state.session.segmentationToolPresets);
      };
      const createPresetFromControls = (id: string, name: string): SegmentationToolPreset => {
        const settings = input.canvasController.raw.getSegmentationSuperpixelSettings?.();
        return {
          id,
          name,
          settings: settings ?? { regionSize: 16, blur: "medium", contrast: "medium", edgeSensitivity: "medium" },
          smartSimilarity: Number.parseInt(elements.segmentationSmartSimilaritySlider?.value ?? "20", 10) / 100,
          smartEdgeStop: Number.parseInt(elements.segmentationSmartEdgeStopSlider?.value ?? "70", 10) / 100,
          boundaryVisible: elements.segmentationSuperpixelBoundaryToggle?.checked ?? true
        };
      };
      segmentationDocument?.getElementById("segmentationNewPresetBtn")?.addEventListener("click", () => {
        const name = input.windowRef.prompt?.("Superpixel preset name:", "New preset")?.trim();
        if (!name) return;
        const id = globalThis.crypto?.randomUUID?.() ?? `segmentation-preset-${Date.now()}`;
        input.state.session.segmentationToolPresets.presets.push(createPresetFromControls(id, name));
        runAsync(async () => { await savePresetLibrary(); input.uiManager.setWorkflow?.("segmentation"); });
      });
      segmentationDocument?.getElementById("segmentationSavePresetBtn")?.addEventListener("click", () => {
        if (!(presetSelect instanceof HTMLSelectElement) || !presetSelect.value) return;
        const index = input.state.session.segmentationToolPresets.presets.findIndex((preset) => preset.id === presetSelect.value);
        if (index < 0) return;
        const existing = input.state.session.segmentationToolPresets.presets[index]!;
        input.state.session.segmentationToolPresets.presets[index] = createPresetFromControls(existing.id, existing.name);
        runAsync(async () => { await savePresetLibrary(); input.uiManager.setWorkflow?.("segmentation"); });
      });
      segmentationDocument?.getElementById("segmentationRenamePresetBtn")?.addEventListener("click", () => {
        if (!(presetSelect instanceof HTMLSelectElement) || !presetSelect.value) return;
        const preset = input.state.session.segmentationToolPresets.presets.find((candidate) => candidate.id === presetSelect.value);
        const name = preset && input.windowRef.prompt?.("Superpixel preset name:", preset.name)?.trim();
        if (!preset || !name) return;
        preset.name = name;
        runAsync(async () => { await savePresetLibrary(); input.uiManager.setWorkflow?.("segmentation"); });
      });
      segmentationDocument?.getElementById("segmentationDeletePresetBtn")?.addEventListener("click", () => {
        if (!(presetSelect instanceof HTMLSelectElement) || !presetSelect.value) return;
        const preset = input.state.session.segmentationToolPresets.presets.find((candidate) => candidate.id === presetSelect.value);
        if (!preset || input.windowRef.confirm?.(`Delete Superpixel preset "${preset.name}"?`) === false) return;
        input.state.session.segmentationToolPresets.presets = input.state.session.segmentationToolPresets.presets.filter((candidate) => candidate.id !== preset.id);
        runAsync(async () => { await savePresetLibrary(); input.uiManager.setWorkflow?.("segmentation"); });
      });
      presetSelect?.addEventListener("change", () => {
        if (!(presetSelect instanceof HTMLSelectElement)) return;
        const preset = input.state.session.segmentationToolPresets.presets.find((candidate) => candidate.id === presetSelect.value);
        if (!preset || !(blurSelect instanceof HTMLSelectElement) || !(contrastSelect instanceof HTMLSelectElement) || !(edgeSensitivitySelect instanceof HTMLSelectElement)) return;
        elements.segmentationSuperpixelSizeSlider.value = `${preset.settings.regionSize}`;
        elements.segmentationSuperpixelSizeValue.textContent = `${preset.settings.regionSize} px`;
        blurSelect.value = preset.settings.blur;
        contrastSelect.value = preset.settings.contrast;
        edgeSensitivitySelect.value = preset.settings.edgeSensitivity;
        elements.segmentationSmartSimilaritySlider.value = `${Math.round(preset.smartSimilarity * 100)}`;
        elements.segmentationSmartEdgeStopSlider.value = `${Math.round(preset.smartEdgeStop * 100)}`;
        elements.segmentationSuperpixelBoundaryToggle.checked = preset.boundaryVisible;
        input.canvasController.raw.setSegmentationSuperpixelSettings?.(preset.settings);
        input.canvasController.raw.setSegmentationSmartGrowSettings?.(preset.smartSimilarity, preset.smartEdgeStop);
        input.canvasController.raw.setSegmentationSuperpixelBoundaryVisible?.(preset.boundaryVisible);
        input.canvasController.raw.recalculateSegmentationSuperpixels?.(preset.settings.regionSize);
        input.uiManager.setWorkflow?.("segmentation");
      });
      if (elements.segmentationSmartSimilaritySlider && elements.segmentationSmartSimilarityValue && elements.segmentationSmartEdgeStopSlider && elements.segmentationSmartEdgeStopValue) {
        const syncSmartGrowSettings = (): void => {
          const similarity = Number.parseInt(elements.segmentationSmartSimilaritySlider.value, 10) / 100;
          const edgeStop = Number.parseInt(elements.segmentationSmartEdgeStopSlider.value, 10) / 100;
          elements.segmentationSmartSimilarityValue.textContent = similarity <= 0.2 ? "Strict" : similarity >= 0.45 ? "Loose" : "Balanced";
          elements.segmentationSmartEdgeStopValue.textContent = edgeStop <= 0.35 ? "Weak" : edgeStop >= 0.65 ? "Strong" : "Balanced";
          input.canvasController.raw.setSegmentationSmartGrowSettings?.(similarity, edgeStop);
        };
        elements.segmentationSmartSimilaritySlider.addEventListener("input", syncSmartGrowSettings);
        elements.segmentationSmartEdgeStopSlider.addEventListener("input", syncSmartGrowSettings);
        syncSmartGrowSettings();
      }
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
      segmentationDocument?.getElementById("segmentationDeleteRegionBtn")?.addEventListener("click", () => {
        if (input.canvasController.raw.deleteSelectedSegmentationRegion?.()) {
          input.uiManager.setWorkflow?.("segmentation");
          input.uiManager.updateLabelList();
        }
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
          return;
        }
        const activeClassButton = target.closest('[data-ui="segmentation-active-class"]') as HTMLElement | null;
        const activeClassId = activeClassButton?.dataset.classId;
        if (activeClassButton && activeClassId) {
          input.canvasController.raw.setSegmentationActiveClass?.(activeClassId);
          input.uiManager.setWorkflow?.("segmentation");
        }
      });
      segmentationDocument?.getElementById("segmentationClassSearchInput")?.addEventListener("input", (event) => {
        const inputElement = event.currentTarget;
        if (!(inputElement instanceof HTMLInputElement)) return;
        const query = inputElement.value.trim().toLocaleLowerCase();
        elements.segmentationClassSummary.querySelectorAll<HTMLElement>('[data-ui="segmentation-class-visibility-item"]').forEach((item) => {
          item.hidden = query.length > 0 && !item.textContent?.toLocaleLowerCase().includes(query);
        });
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
        if (
          input.state.session.workflow === "segmentation"
          && input.state.view.currentMode === "draw"
          && input.canvasController.raw.getSegmentationSummary?.().activeTool === "superpixel"
          && mouseEvent.ctrlKey
        ) {
          suppressSelectionForSegmentationStroke = true;
          rawCanvas.selection = false;
          input.canvasController.raw.startSegmentationSuperpixelPaint?.(pointer, "remove");
          return;
        }
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
        if (input.state.session.workflow === "segmentation" && input.canvasController.raw.isSegmentationPolygonDrawing?.()) {
          clearTemporarySelectionSuppression();
          return;
        }
        clearTemporarySelectionSuppression();
        runAsync(() => input.canvasController.raw.finishDrawing().then(() => {
          input.uiManager.updateLabelList();
          syncToolbarActionState();
        }));
      });

      rawCanvas.on?.("mouse:dblclick", (event) => {
        if (input.state.session.workflow === "segmentation" && input.state.view.currentMode === "draw" && input.canvasController.raw.isSegmentationPolygonDrawing?.()) {
          input.canvasController.raw.finishSegmentationPolygon?.();
          input.uiManager.updateLabelList();
          syncToolbarActionState();
          return;
        }
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
        if (isEditableKeyboardTarget(event.target)) {
          return;
        }

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

        if (event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey && event.key.toLowerCase() === "h") {
          event.preventDefault();
          input.uiManager.toggleAllLabelVisibility();
          return;
        }

        if (input.state.session.workflow === "segmentation"
          && !event.ctrlKey
          && !event.metaKey
          && !event.altKey
          && !event.shiftKey
          && event.key.toLowerCase() === "b") {
          event.preventDefault();
          const visible = !elements.segmentationSuperpixelBoundaryToggle.checked;
          elements.segmentationSuperpixelBoundaryToggle.checked = visible;
          input.canvasController.raw.setSegmentationSuperpixelBoundaryVisible?.(visible);
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
          if (input.state.session.workflow === "segmentation" && input.canvasController.raw.cancelSegmentationPolygon?.()) {
            input.uiManager.setWorkflow?.(input.state.session.workflow);
          }
          rawCanvas.discardActiveObject();
          input.canvasController.raw.renderAll();
          syncToolbarActionState();
        }
      });

      const syncDesktopDirtyState = (): void => {
        input.windowRef.easyLabelingDesktop?.setHasUnsavedChanges(hasDirtyDocuments(input.state));
      };
      input.windowRef.addEventListener("easy-labeling:document-status-change", () => {
        input.uiManager.syncWorkspaceState?.();
        syncDesktopDirtyState();
      });
      input.windowRef.addEventListener("easy-labeling:history-reset", () => {
        syncToolbarActionState();
      });
      input.windowRef.addEventListener("beforeunload", (event) => {
        if (input.windowRef.easyLabelingDesktop || !hasDirtyDocuments(input.state)) {
          return;
        }
        event.preventDefault();
        (event as BeforeUnloadEvent).returnValue = "";
      });
      input.windowRef.addEventListener("unload", () => {
        automationController?.dispose();
      });

      syncViewControls();
      syncToolbarActionState();
      input.uiManager.setInspectorTab?.("annotation");
      input.uiManager.setActiveTask?.("annotate");
      input.uiManager.syncWorkspaceState?.();
      syncDesktopDirtyState();
      if (automationController) {
        runAsync(() => prepareWorkspace({
          title: "Starting Easy Labeling",
          summary: "Checking saved tools and the matching engine before use."
        }));
      }
    }
  };
}
