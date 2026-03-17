import type { EventManager } from "../app/contracts.js";
import type { AppState } from "../app/state.js";
import { isActiveSelectionObject, isRectObject, type FabricObjectLike } from "../features/canvas/fabric-types.js";
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

      const syncViewControls = (): void => {
        elements.drawModeBtn.checked = input.state.view.currentMode === "draw";
        elements.editModeBtn.checked = input.state.view.currentMode === "edit";
        elements.autoSaveToggle.checked = input.state.view.isAutoSaveEnabled;
        elements.showLabelsOnCanvasToggle.checked = input.state.view.showLabelsOnCanvas;
        elements.crosshairToggle.checked = input.state.view.isCrosshairVisible;
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

      elements.selectImageFolderBtn.addEventListener("click", () => {
        runAsync(() => input.fileSystem.selectImageFolder());
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
        runAsync(() => input.fileSystem.navigateImage(-1));
      });
      elements.nextImageBtn.addEventListener("click", () => {
        runAsync(() => input.fileSystem.navigateImage(1));
      });

      elements.previewPrevBtn.addEventListener("click", () => {
        runAsync(() => input.fileSystem.navigateImage(-1));
      });
      elements.previewNextBtn.addEventListener("click", () => {
        runAsync(() => input.fileSystem.navigateImage(1));
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
        input.uiManager.updateLabelList();
      });
      rawCanvas.on?.("object:scaled", () => {
        input.uiManager.updateLabelList();
      });
      rawCanvas.on?.("selection:created", () => {
        input.canvasController.raw.highlightSelection();
        input.uiManager.updateLabelList();
      });
      rawCanvas.on?.("selection:updated", () => {
        input.canvasController.raw.highlightSelection();
        input.uiManager.updateLabelList();
      });
      rawCanvas.on?.("selection:cleared", () => {
        input.canvasController.raw.highlightSelection();
        input.uiManager.updateLabelList();
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
              runAsync(() => input.canvasController.raw.editLabel(rectTarget));
            }
            if (selectionTarget) {
              runAsync(() => input.canvasController.raw.editMultipleLabels(selectionTarget));
            }
            cleanup();
          };
          elements.ctxDeleteLabel.onclick = () => {
            if (rectTarget) {
              input.canvasController.raw.removeObject(rectTarget);
            }
            if (selectionTarget) {
              selectionTarget.getObjects().forEach((object: FabricObjectLike) => {
                if (isRectObject(object)) {
                  input.canvasController.raw.removeObject(object);
                }
              });
              rawCanvas.discardActiveObject();
            }
            input.uiManager.updateLabelList();
            input.canvasController.raw.renderAll();
            cleanup();
          };

          document.addEventListener("click", cleanup, { once: true });
          return;
        }

        setMode(input.state.view.currentMode === "edit" ? "draw" : "edit");
      });

      syncViewControls();

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
          return;
        }

        if (event.key === "a" || event.key === "A") {
          runAsync(() => input.fileSystem.navigateImage(-1));
          return;
        }
        if (event.key === "d" || event.key === "D") {
          runAsync(() => input.fileSystem.navigateImage(1));
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
          return;
        }
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "b") {
          event.preventDefault();
          const activeObject = rawCanvas.getActiveObject();
          if (activeObject && isRectObject(activeObject)) {
            runAsync(() => input.canvasController.raw.editLabel(activeObject));
            return;
          }
          if (activeObject && isActiveSelectionObject(activeObject)) {
            runAsync(() => input.canvasController.raw.editMultipleLabels(activeObject));
            return;
          }
        }

        const activeObject = rawCanvas.getActiveObject();
        if (activeObject && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
          event.preventDefault();
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
          return;
        }

        if (event.key === "Delete" || event.key === "Backspace") {
          event.preventDefault();
          const activeObjects = rawCanvas.getActiveObjects();
          activeObjects.forEach((object) => {
            if (isRectObject(object)) {
              input.canvasController.raw.removeObject(object);
            } else if (isActiveSelectionObject(object)) {
              object.getObjects().forEach((child) => {
                if (isRectObject(child)) {
                  input.canvasController.raw.removeObject(child);
                }
              });
            }
          });
          rawCanvas.discardActiveObject();
          input.canvasController.raw.renderAll();
          input.uiManager.updateLabelList();
          return;
        }

        if (event.key === "Escape") {
          rawCanvas.discardActiveObject();
          input.canvasController.raw.renderAll();
        }
      });
    }
  };
}
