import type { EventManager } from "../app/contracts.js";
import type { AppState } from "../app/state.js";
import { isActiveSelectionObject, isRectObject } from "../features/canvas/fabric-types.js";
import type { CanvasHistoryGestureBaseline } from "../features/canvas/history.js";
import type { RuntimeCanvasController } from "./canvas-controller-adapter.js";
import type { RuntimeFileSystem } from "./file-system-adapter.js";
import type { RuntimeUiManager } from "./ui-manager-adapter.js";

export function createEventManagerAdapter(input: {
  state: AppState;
  uiManager: RuntimeUiManager;
  fileSystem: RuntimeFileSystem;
  canvasController: RuntimeCanvasController;
  windowRef: Pick<Window, "addEventListener">;
}): EventManager {
  return {
    bindEventListeners(): void {
      const { elements } = input.uiManager;
      const rawCanvas = input.canvasController.raw.canvas;

      const runAsync = (action: () => Promise<void>): void => {
        action().catch((error: unknown) => {
          const message = error instanceof Error ? error.message : "Unexpected error";
          input.uiManager.notify(message, 4000);
        });
      };

      const runAsyncAndSyncToolbar = (action: () => Promise<void>): void => {
        runAsync(() => action().then(() => {
          syncToolbarActionState();
        }));
      };

      const syncViewControls = (): void => {
        elements.drawModeBtn.checked = input.state.view.currentMode === "draw";
        elements.editModeBtn.checked = input.state.view.currentMode === "edit";
        elements.autoSaveToggle.checked = input.state.view.isAutoSaveEnabled;
        elements.showLabelsOnCanvasToggle.checked = input.state.view.showLabelsOnCanvas;
        elements.crosshairToggle.checked = input.state.view.isCrosshairVisible;
      };

      const getActiveVisibleRectSelectionCount = (): number => {
        const activeObject = rawCanvas.getActiveObject();
        if (!activeObject || !isActiveSelectionObject(activeObject)) {
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
        (elements.undoBtn as HTMLButtonElement).disabled = undoDisabled;
        (elements.redoBtn as HTMLButtonElement).disabled = redoDisabled;
      };

      const runUndo = (): void => {
        input.canvasController.raw.undo();
        syncToolbarActionState();
      };

      const runRedo = (): void => {
        input.canvasController.raw.redo();
        syncToolbarActionState();
      };

      const setMode = (mode: "draw" | "edit"): void => {
        elements.drawModeBtn.checked = mode === "draw";
        elements.editModeBtn.checked = mode === "edit";
        input.canvasController.setMode?.(mode);
      };

      const renderLists = (): void => {
        input.uiManager.renderImageList();
        input.uiManager.renderPreviewList();
        input.uiManager.updateLabelList();
      };

      let pendingGestureBaseline: CanvasHistoryGestureBaseline | null = null;

      const isRectOrSelectionTarget = (target: unknown): boolean => {
        if (!target || typeof target !== "object") {
          return false;
        }

        const fabricLikeObject = target as { type?: string };
        return fabricLikeObject.type === "rect" || fabricLikeObject.type === "activeSelection";
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

      elements.selectImageFolderBtn.addEventListener("click", () => {
        runAsyncAndSyncToolbar(() => input.fileSystem.selectImageFolder());
      });

      elements.selectLabelFolderBtn.addEventListener("click", () => {
        runAsync(() => input.fileSystem.selectLabelFolder());
      });

      elements.loadClassInfoFolderBtn.addEventListener("click", () => {
        runAsync(() => input.fileSystem.selectClassInfoFolder());
      });

      elements.saveLabelsBtn.addEventListener("click", () => {
        runAsync(() => input.fileSystem.saveLabels(false));
      });

      elements.downloadClassesBtn.addEventListener("click", () => {
        runAsync(() => input.fileSystem.downloadClassTemplate());
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
        runAsyncAndSyncToolbar(() => input.fileSystem.navigateImage(-1));
      });
      elements.nextImageBtn.addEventListener("click", () => {
        runAsyncAndSyncToolbar(() => input.fileSystem.navigateImage(1));
      });

      elements.previewPrevBtn.addEventListener("click", () => {
        runAsyncAndSyncToolbar(() => input.fileSystem.navigateImage(-1));
      });
      elements.previewNextBtn.addEventListener("click", () => {
        runAsyncAndSyncToolbar(() => input.fileSystem.navigateImage(1));
      });

      elements.imageSearchInput.addEventListener("input", renderLists);
      elements.showLabeledCheckbox.addEventListener("change", renderLists);
      elements.showUnlabeledCheckbox.addEventListener("change", renderLists);

      elements.showLabelsOnCanvasToggle.addEventListener("change", (event) => {
        const toggle = event.currentTarget;
        if (!(toggle instanceof HTMLInputElement)) {
          return;
        }
        input.state.view.showLabelsOnCanvas = toggle.checked;
        input.canvasController.raw.toggleAllLabelTexts(toggle.checked);
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
      });

      elements.drawModeBtn.addEventListener("change", () => {
        setMode("draw");
      });
      elements.editModeBtn.addEventListener("change", () => {
        setMode("edit");
      });

      elements.zoomInBtn.addEventListener("click", () => {
        input.canvasController.raw.zoom(1.2);
      });
      elements.zoomOutBtn.addEventListener("click", () => {
        input.canvasController.raw.zoom(0.8);
      });
      elements.resetZoomBtn.addEventListener("click", () => {
        input.canvasController.raw.resetZoom();
      });
      elements.zoomInput.addEventListener("change", () => {
        input.canvasController.raw.setZoomPercentage(elements.zoomInput.value);
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
        const pointer = rawCanvas.getPointer?.(event.e);
        if (!pointer) {
          return;
        }

        const mouseEvent = event.e as MouseEvent;
        if (mouseEvent.altKey || mouseEvent.ctrlKey) {
          rawCanvas.isDragging = true;
          rawCanvas.selection = false;
          rawCanvas.lastPosX = mouseEvent.clientX;
          rawCanvas.lastPosY = mouseEvent.clientY;
          return;
        }

        maybeStartGestureBaseline(event.target ?? null);

        input.canvasController.raw.startDrawing(pointer);
      });

      rawCanvas.on?.("mouse:move", (event) => {
        const pointer = rawCanvas.getPointer?.(event.e);
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
          rawCanvas.selection = true;
          rawCanvas.setViewportTransform([...rawCanvas.viewportTransform]);
          rawCanvas.calcOffset?.();
          rawCanvas.requestRenderAll();
          return;
        }
        runAsync(() => input.canvasController.raw.finishDrawing().then(() => {
          input.uiManager.updateLabelList();
          syncToolbarActionState();
        }));
      });

      rawCanvas.on?.("mouse:wheel", (event) => {
        const wheelEvent = event.e as WheelEvent;
        let zoom = rawCanvas.getZoom();
        zoom *= 0.999 ** wheelEvent.deltaY;
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
      });

      rawCanvas.on?.("mouse:out", () => {
        input.uiManager.hideMouseCoords();
        input.canvasController.raw.hideCrosshair();
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
        input.uiManager.updateLabelList();
        syncToolbarActionState();
      });
      rawCanvas.on?.("selection:updated", () => {
        input.canvasController.raw.highlightSelection();
        input.uiManager.updateLabelList();
        syncToolbarActionState();
      });
      rawCanvas.on?.("selection:cleared", () => {
        input.canvasController.raw.highlightSelection();
        input.uiManager.updateLabelList();
        syncToolbarActionState();
      });

      rawCanvas.upperCanvasEl?.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        const target = rawCanvas.findTarget?.(event, false) ?? null;
        if (target && (target.type === "rect" || target.type === "activeSelection")) {
          const rectTarget = isRectObject(target) ? target : null;
          const selectionTarget = isActiveSelectionObject(target) ? target : null;
          elements.contextMenu.style.left = `${(event as MouseEvent).clientX}px`;
          elements.contextMenu.style.top = `${(event as MouseEvent).clientY}px`;
          elements.contextMenu.style.display = "block";

          const cleanup = (): void => {
            elements.contextMenu.style.display = "none";
            document.removeEventListener("click", cleanup);
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

          document.addEventListener("click", cleanup, { once: true });
          return;
        }

        setMode(input.state.view.currentMode === "edit" ? "draw" : "edit");
      });

      syncViewControls();
      syncToolbarActionState();

      input.windowRef.addEventListener("easy-labeling:history-reset", () => {
        syncToolbarActionState();
      });

      input.windowRef.addEventListener("keydown", (event) => {
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
          runAsyncAndSyncToolbar(() => input.fileSystem.navigateImage(-1));
          return;
        }
        if (event.key === "d" || event.key === "D") {
          runAsyncAndSyncToolbar(() => input.fileSystem.navigateImage(1));
          return;
        }
        if ((event.ctrlKey || event.metaKey) && (event.key === "s" || event.key === "S")) {
          event.preventDefault();
          runAsync(() => input.fileSystem.saveLabels(false));
          return;
        }
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "q") {
          event.preventDefault();
          setMode(input.state.view.currentMode === "edit" ? "draw" : "edit");
          return;
        }

        if ((event.ctrlKey || event.metaKey) && (event.key === "c" || event.key === "C")) {
          event.preventDefault();
          input.canvasController.raw.copy();
          return;
        }
        if ((event.ctrlKey || event.metaKey) && (event.key === "v" || event.key === "V")) {
          event.preventDefault();
          input.canvasController.raw.paste();
          input.uiManager.updateLabelList();
          syncToolbarActionState();
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
          input.canvasController.raw.deleteSelection();
          syncToolbarActionState();
          return;
        }

        if (event.key === "Escape") {
          rawCanvas.discardActiveObject();
          input.canvasController.raw.renderAll();
          syncToolbarActionState();
        }
      });
    }
  };
}
