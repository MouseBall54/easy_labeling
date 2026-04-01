import type { CanvasPoint } from "../../types/labels.js";
import { createSegmentationDocument, type SegmentationDocument } from "./document.js";
import {
  createSegmentationOverlayObject,
  createSegmentationOverlaySnapshot,
  updateSegmentationOverlayObject
} from "./overlay.js";
import type {
  SegmentationDocumentSnapshot,
  SegmentationRegionSelection,
  SegmentationSummary,
  SegmentationTool
} from "./types.js";
import type { CanvasController, CanvasControllerDeps, CanvasControllerState, CanvasShell } from "../canvas/canvas-controller-types.js";
import type { FabricActiveSelectionLike, FabricImageLike, FabricRectLike } from "../canvas/fabric-types.js";
import { getColorForClass as defaultGetColorForClass } from "../canvas/colors.js";

function createEmptySummary(): SegmentationSummary {
  return {
    activeClassId: "1",
    activeTool: "brush",
    brushRadius: 6,
    overlayVisible: true,
    overlayOpacity: 0.6,
    visibleClassIds: [],
    allClassIds: [],
    hiddenClassIds: []
  };
}

export function createSegmentationCanvasWorkflow(
  state: CanvasControllerState,
  deps: CanvasControllerDeps,
  shell: CanvasShell
): CanvasController {
  const canvas = shell.canvas;
  const getColorForClass = deps.getColorForClass ?? defaultGetColorForClass;

  let document: SegmentationDocument | null = null;
  let overlayObject: FabricImageLike | null = null;
  let selectionOverlayObject: FabricImageLike | null = null;
  let strokeBaseline = null as ReturnType<SegmentationDocument["cloneSnapshot"]> | null;
  let strokePoints: CanvasPoint[] = [];
  let selectedRegion: SegmentationRegionSelection | null = null;
  let moveBaseline = null as ReturnType<SegmentationDocument["cloneSnapshot"]> | null;
  let moveRegionBaseline: SegmentationRegionSelection | null = null;
  let movePointerStart: CanvasPoint | null = null;
  let moveLastDeltaX: number | null = null;
  let moveLastDeltaY: number | null = null;

  const resetDocumentForCurrentImage = (): void => {
    if (!state.currentImage) {
      document = null;
      if (overlayObject) {
        canvas.remove(overlayObject);
        overlayObject = null;
      }
      if (selectionOverlayObject) {
        canvas.remove(selectionOverlayObject);
        selectionOverlayObject = null;
      }
      selectedRegion = null;
      return;
    }

    document = createSegmentationDocument({
      width: state.currentImage.width,
      height: state.currentImage.height,
      activeClassId: document?.activeClassId ?? "1",
      activeTool: document?.activeTool ?? "brush",
      brushRadius: document?.brushRadius ?? 6,
      overlayVisible: document?.overlayVisible ?? true,
      overlayOpacity: document?.overlayOpacity ?? 0.6
    });
    if (overlayObject) {
      canvas.remove(overlayObject);
      overlayObject = null;
    }
    if (selectionOverlayObject) {
      canvas.remove(selectionOverlayObject);
      selectionOverlayObject = null;
    }
    selectedRegion = null;
  };

  const clearSelection = (): void => {
    selectedRegion = null;
    moveBaseline = null;
    moveRegionBaseline = null;
    movePointerStart = null;
    moveLastDeltaX = null;
    moveLastDeltaY = null;
    if (selectionOverlayObject) {
      canvas.remove(selectionOverlayObject);
      selectionOverlayObject = null;
    }
  };

  const redrawSelectionOverlay = (): void => {
    const doc = ensureDocument();
    if (!doc) {
      clearSelection();
      return;
    }

    if (!selectedRegion || selectedRegion.pixelCount === 0) {
      if (selectionOverlayObject) {
        canvas.remove(selectionOverlayObject);
        selectionOverlayObject = null;
      }
      return;
    }

    const pixels = new Uint8ClampedArray(doc.width * doc.height * 4);
    const { r, g, b } = (() => {
      const colorHex = getColorForClass(selectedRegion.classId);
      const normalized = colorHex.replace("#", "");
      const source = normalized.length === 3
        ? normalized.split("").map((char) => `${char}${char}`).join("")
        : normalized.padEnd(6, "0").slice(0, 6);
      return {
        r: Number.parseInt(source.slice(0, 2), 16),
        g: Number.parseInt(source.slice(2, 4), 16),
        b: Number.parseInt(source.slice(4, 6), 16)
      };
    })();

    for (const index of selectedRegion.pixelIndices) {
      const channelOffset = index * 4;
      pixels[channelOffset] = Math.min(255, r + 40);
      pixels[channelOffset + 1] = Math.min(255, g + 40);
      pixels[channelOffset + 2] = Math.min(255, b + 40);
      pixels[channelOffset + 3] = 220;
    }

    const selectionOverlay = {
      width: doc.width,
      height: doc.height,
      pixels,
      opacity: 1,
      visible: true
    };

    if (!selectionOverlayObject) {
      selectionOverlayObject = createSegmentationOverlayObject(deps.fabric, selectionOverlay);
      canvas.add(selectionOverlayObject);
      return;
    }
    updateSegmentationOverlayObject(selectionOverlayObject, selectionOverlay);
  };

  const ensureDocument = (): SegmentationDocument | null => {
    if (!state.currentImage) {
      return null;
    }
    if (!document || document.width !== state.currentImage.width || document.height !== state.currentImage.height) {
      resetDocumentForCurrentImage();
    }
    return document;
  };

  const redrawOverlay = (): void => {
    const doc = ensureDocument();
    if (!doc) {
      if (overlayObject) {
        canvas.remove(overlayObject);
        overlayObject = null;
      }
      return;
    }

    const overlay = createSegmentationOverlaySnapshot(doc, getColorForClass);
    if (!overlayObject) {
      overlayObject = createSegmentationOverlayObject(deps.fabric, overlay);
      canvas.add(overlayObject);
    } else {
      updateSegmentationOverlayObject(overlayObject, overlay);
    }
    redrawSelectionOverlay();
    canvas.requestRenderAll();
  };

  const controller: CanvasController = {
    canvas,

    getObjects(type?: string) {
      return shell.getObjects(type);
    },

    renderAll(): void {
      shell.renderAll();
    },

    clear(): void {
      shell.clear();
      document = null;
      overlayObject = null;
      selectionOverlayObject = null;
      strokeBaseline = null;
      strokePoints = [];
      selectedRegion = null;
      moveBaseline = null;
      moveRegionBaseline = null;
      movePointerStart = null;
      moveLastDeltaX = null;
      moveLastDeltaY = null;
    },

    setBackgroundImage(image: unknown): void {
      shell.setBackgroundImage(image);
      resetDocumentForCurrentImage();
      redrawOverlay();
    },

    setMode(mode): void {
      shell.setMode(mode);
      if (mode === "draw") {
        clearSelection();
        shell.renderAll();
      }
    },

    addLabelsFromYolo(): void {
      return;
    },

    getLabelsAsYolo(): string {
      return "";
    },

    highlightSelection(): void {
      return;
    },

    startDrawing(pointer: CanvasPoint): void {
      if (state.currentMode !== "draw") {
        return;
      }
      const doc = ensureDocument();
      if (!doc) {
        return;
      }
      clearSelection();
      strokeBaseline = doc.cloneSnapshot();
      strokePoints = [pointer];
      doc.applyStroke({ points: [pointer] }, { recordHistory: false });
      redrawOverlay();
    },

    continueDrawing(pointer: CanvasPoint): void {
      const doc = ensureDocument();
      if (!doc || !strokeBaseline) {
        return;
      }
      const lastPoint = strokePoints.at(-1);
      const points = lastPoint ? [lastPoint, pointer] : [pointer];
      strokePoints.push(pointer);
      doc.applyStroke({ points }, { recordHistory: false });
      redrawOverlay();
    },

    async finishDrawing(): Promise<void> {
      const doc = ensureDocument();
      if (!doc || !strokeBaseline) {
        return;
      }
      doc.pushHistoryFromSnapshot(strokeBaseline);
      strokeBaseline = null;
      strokePoints = [];
      redrawOverlay();
    },

    removeObject(_object: FabricRectLike): void {
      return;
    },

    sortObjectsByLabel(): void {
      return;
    },

    reorderObject(): void {
      return;
    },

    async editLabel(_rect: FabricRectLike): Promise<void> {
      return;
    },

    async editMultipleLabels(_selection: FabricActiveSelectionLike): Promise<void> {
      return;
    },

    setZoomPercentage(percentage: string): void {
      shell.setZoomPercentage(percentage);
    },

    zoom(factor: number): void {
      shell.zoom(factor);
    },

    resetZoom(): void {
      shell.resetZoom();
    },

    resizeCanvas(): void {
      shell.resizeCanvas();
    },

    goToCoords(x: number, y: number): void {
      shell.goToCoords(x, y);
    },

    highlightPoint(x: number, y: number): void {
      shell.highlightPoint(x, y);
    },

    drawLabelText(): void {
      return;
    },

    updateLabelText(): void {
      return;
    },

    updateAllLabelTexts(): void {
      return;
    },

    toggleAllLabelTexts(): void {
      return;
    },

    applyVisibilityFromHiddenClasses(): void {
      return;
    },

    selectAllLabels(): void {
      shell.discardActiveObject();
    },

    selectLabelsByClass(): void {
      shell.discardActiveObject();
    },

    createCrosshairLines(): void {
      shell.createCrosshairLines();
    },

    toggleCrosshair(visible: boolean): void {
      shell.toggleCrosshair(visible);
    },

    updateCrosshair(pointer: CanvasPoint): void {
      shell.updateCrosshair(pointer);
    },

    hideCrosshair(): void {
      shell.hideCrosshair();
    },

    copy(): void {
      return;
    },

    paste(): void {
      return;
    },

    deleteSelection(): void {
      return;
    },

    alignSelectionLeft(): void {
      return;
    },

    alignSelectionRight(): void {
      return;
    },

    alignSelectionTop(): void {
      return;
    },

    alignSelectionBottom(): void {
      return;
    },

    distributeSelectionHorizontally(): void {
      return;
    },

    distributeSelectionVertically(): void {
      return;
    },

    captureHistoryBaseline() {
      return {
        before: [],
        selectionBefore: { annotationIds: [], primaryAnnotationId: null }
      };
    },

    commitHistoryFromBaseline(): void {
      return;
    },

    clearHistory(): void {
      const doc = ensureDocument();
      doc?.clearHistory();
    },

    undo(): void {
      const doc = ensureDocument();
      if (!doc || !doc.undo()) {
        return;
      }
      clearSelection();
      redrawOverlay();
    },

    redo(): void {
      const doc = ensureDocument();
      if (!doc || !doc.redo()) {
        return;
      }
      clearSelection();
      redrawOverlay();
    },

    canUndo(): boolean {
      return ensureDocument()?.canUndo() ?? false;
    },

    canRedo(): boolean {
      return ensureDocument()?.canRedo() ?? false;
    },

    setSegmentationTool(tool: SegmentationTool): void {
      const doc = ensureDocument();
      if (!doc) {
        return;
      }
      doc.setActiveTool(tool);
    },

    setSegmentationBrushRadius(radius: number): void {
      const doc = ensureDocument();
      if (!doc) {
        return;
      }
      doc.setBrushRadius(radius);
    },

    setSegmentationActiveClass(classId: string): void {
      const doc = ensureDocument();
      if (!doc) {
        return;
      }
      doc.setActiveClass(classId);
      shell.renderAll();
    },

    setSegmentationOverlayVisibility(visible: boolean): void {
      const doc = ensureDocument();
      if (!doc) {
        return;
      }
      doc.setOverlayVisible(visible);
      redrawOverlay();
    },

    setSegmentationOverlayOpacity(opacity: number): void {
      const doc = ensureDocument();
      if (!doc) {
        return;
      }
      doc.setOverlayOpacity(opacity);
      redrawOverlay();
    },

    setSegmentationClassVisibility(classId: string, visible: boolean): void {
      const doc = ensureDocument();
      if (!doc) {
        return;
      }
      doc.setClassVisibility(classId, visible);
      redrawOverlay();
    },

    setSegmentationOnlyVisibleClass(classId: string | null): void {
      const doc = ensureDocument();
      if (!doc) {
        return;
      }
      doc.setOnlyVisibleClass(classId);
      redrawOverlay();
    },

    getSegmentationClassAtPoint(pointer: CanvasPoint): string | null {
      const doc = ensureDocument();
      if (!doc) {
        return null;
      }
      return doc.getClassAtPoint(pointer);
    },

    getSelectedSegmentationClass(): string | null {
      return selectedRegion?.classId ?? null;
    },

    selectSegmentationRegionAtPoint(pointer: CanvasPoint): boolean {
      const doc = ensureDocument();
      if (!doc) {
        return false;
      }

      const region = doc.getConnectedRegionAtPoint(pointer);
      if (!region) {
        clearSelection();
        shell.renderAll();
        return false;
      }

      selectedRegion = region;
      doc.setActiveClass(region.classId);
      redrawOverlay();
      return true;
    },

    clearSegmentationSelection(): void {
      clearSelection();
      shell.renderAll();
    },

    startSegmentationRegionMove(pointer: CanvasPoint): boolean {
      const doc = ensureDocument();
      if (!doc || state.currentMode !== "edit" || !selectedRegion) {
        return false;
      }

      const pixelX = Math.max(0, Math.min(doc.width - 1, Math.round(pointer.x)));
      const pixelY = Math.max(0, Math.min(doc.height - 1, Math.round(pointer.y)));
      const clickedIndex = (pixelY * doc.width) + pixelX;
      const isInsideSelection = selectedRegion.pixelIndices.some((index) => index === clickedIndex);
      if (!isInsideSelection) {
        return false;
      }

      moveBaseline = doc.cloneSnapshot();
      moveRegionBaseline = selectedRegion;
      movePointerStart = pointer;
      moveLastDeltaX = null;
      moveLastDeltaY = null;
      return true;
    },

    continueSegmentationRegionMove(pointer: CanvasPoint): boolean {
      const doc = ensureDocument();
      if (!doc || !moveBaseline || !moveRegionBaseline || !movePointerStart) {
        return false;
      }

      const roundedDeltaX = Math.round(pointer.x - movePointerStart.x);
      const roundedDeltaY = Math.round(pointer.y - movePointerStart.y);
      if (roundedDeltaX === moveLastDeltaX && roundedDeltaY === moveLastDeltaY) {
        return false;
      }

      doc.restoreSnapshot(moveBaseline);
      const movedRegion = doc.moveRegion(
        moveRegionBaseline,
        roundedDeltaX,
        roundedDeltaY,
        { recordHistory: false }
      );
      if (!movedRegion) {
        return false;
      }

      moveLastDeltaX = roundedDeltaX;
      moveLastDeltaY = roundedDeltaY;
      selectedRegion = movedRegion;
      redrawOverlay();
      return true;
    },

    async finishSegmentationRegionMove(): Promise<boolean> {
      const doc = ensureDocument();
      if (!doc || !moveBaseline || !moveRegionBaseline) {
        return false;
      }

      const changed = doc.pushHistoryFromSnapshot(moveBaseline);
      moveBaseline = null;
      moveRegionBaseline = null;
      movePointerStart = null;
      moveLastDeltaX = null;
      moveLastDeltaY = null;
      redrawOverlay();
      return changed;
    },

    relabelSelectedSegmentationRegion(classId: string): boolean {
      if (!selectedRegion) {
        return false;
      }
      return controller.relabelSegmentationRegionAtPoint?.(selectedRegion.seedPoint, classId) ?? false;
    },

    relabelSegmentationRegionAtPoint(pointer: CanvasPoint, classId: string): boolean {
      const doc = ensureDocument();
      if (!doc) {
        return false;
      }
      const changed = doc.relabelConnectedRegionAtPoint(pointer, classId);
      if (changed) {
        selectedRegion = doc.getConnectedRegionAtPoint(pointer);
        redrawOverlay();
      }
      return changed;
    },

    getSegmentationSummary(): SegmentationSummary {
      return ensureDocument()?.getSummary() ?? createEmptySummary();
    },

    getSegmentationDocumentSnapshot(): SegmentationDocumentSnapshot | null {
      return ensureDocument()?.cloneSnapshot() ?? null;
    },

    loadSegmentationDocumentSnapshot(snapshot: SegmentationDocumentSnapshot | null): void {
      if (!snapshot) {
        resetDocumentForCurrentImage();
        ensureDocument()?.clearHistory();
        redrawOverlay();
        return;
      }
      const doc = ensureDocument();
      if (!doc) {
        return;
      }
      doc.restoreSnapshot(snapshot);
      doc.clearHistory();
      clearSelection();
      redrawOverlay();
    }
  };

  return controller;
}
