import type { CanvasPoint } from "../../types/labels.js";
import { createSegmentationDocument, type SegmentationDocument } from "./document.js";
import { applyClosedRegionAutoFillFromStroke } from "./tools.js";
import {
  createSegmentationMaskOverlayLayer,
  createSegmentationSelectionOverlayLayer,
  type SegmentationMaskOverlayLayer,
  type SegmentationSelectionOverlayLayer
} from "./overlay.js";
import type {
  SegmentationDocumentSnapshot,
  SegmentationRegionBounds,
  SegmentationRegionSelection,
  SegmentationSummary,
  SegmentationTool
} from "./types.js";
import type { CanvasController, CanvasControllerDeps, CanvasControllerState, CanvasShell } from "../canvas/canvas-controller-types.js";
import type { FabricActiveSelectionLike, FabricRectLike } from "../canvas/fabric-types.js";
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

function cloneBounds(bounds: SegmentationRegionBounds): SegmentationRegionBounds {
  return {
    left: bounds.left,
    top: bounds.top,
    right: bounds.right,
    bottom: bounds.bottom
  };
}

function mergeBounds(
  left: SegmentationRegionBounds | null,
  right: SegmentationRegionBounds | null
): SegmentationRegionBounds | null {
  if (!left) {
    return right ? cloneBounds(right) : null;
  }
  if (!right) {
    return cloneBounds(left);
  }
  return {
    left: Math.min(left.left, right.left),
    top: Math.min(left.top, right.top),
    right: Math.max(left.right, right.right),
    bottom: Math.max(left.bottom, right.bottom)
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
  let maskOverlayLayer: SegmentationMaskOverlayLayer | null = null;
  let selectionOverlayLayer: SegmentationSelectionOverlayLayer | null = null;
  let strokeBaseline = null as ReturnType<SegmentationDocument["cloneSnapshot"]> | null;
  let strokePoints: CanvasPoint[] = [];
  let strokeDirtyBounds: SegmentationRegionBounds | null = null;
  let selectedRegion: SegmentationRegionSelection | null = null;
  let autoFillClosedRegionEnabled = false;
  let moveBaseline = null as ReturnType<SegmentationDocument["cloneSnapshot"]> | null;
  let moveRegionBaseline: SegmentationRegionSelection | null = null;
  let movePointerStart: CanvasPoint | null = null;
  let moveLastDeltaX: number | null = null;
  let moveLastDeltaY: number | null = null;
  let pendingMaskDirtyBounds: SegmentationRegionBounds | null = null;
  let hasPendingMaskDirtyBounds = false;
  let pendingMaskForceFull = false;
  let pendingSelectionForceFull = false;
  let overlayRenderScheduled = false;
  let overlayRenderRequestId: number | null = null;

  const clearPendingOverlayRenderState = (): void => {
    pendingMaskDirtyBounds = null;
    hasPendingMaskDirtyBounds = false;
    pendingMaskForceFull = false;
    pendingSelectionForceFull = false;
  };

  const cancelPendingOverlayRender = (): void => {
    if (overlayRenderRequestId !== null && typeof globalThis.cancelAnimationFrame === "function") {
      globalThis.cancelAnimationFrame(overlayRenderRequestId);
    }
    overlayRenderRequestId = null;
    overlayRenderScheduled = false;
  };

  const removeMaskOverlayLayer = (): void => {
    if (!maskOverlayLayer) {
      return;
    }
    canvas.remove(maskOverlayLayer.object);
    maskOverlayLayer = null;
  };

  const removeSelectionOverlayLayer = (): void => {
    if (!selectionOverlayLayer) {
      return;
    }
    canvas.remove(selectionOverlayLayer.object);
    selectionOverlayLayer = null;
  };

  const ensureMaskOverlayLayer = (): SegmentationMaskOverlayLayer => {
    if (!maskOverlayLayer) {
      maskOverlayLayer = createSegmentationMaskOverlayLayer(deps.fabric);
      canvas.add(maskOverlayLayer.object);
    }
    return maskOverlayLayer;
  };

  const ensureSelectionOverlayLayer = (): SegmentationSelectionOverlayLayer => {
    if (!selectionOverlayLayer) {
      selectionOverlayLayer = createSegmentationSelectionOverlayLayer(deps.fabric);
      canvas.add(selectionOverlayLayer.object);
    }
    return selectionOverlayLayer;
  };

  const resetDocumentForCurrentImage = (): void => {
    cancelPendingOverlayRender();
    clearPendingOverlayRenderState();

    if (!state.currentImage) {
      document = null;
      removeMaskOverlayLayer();
      removeSelectionOverlayLayer();
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
    removeMaskOverlayLayer();
    removeSelectionOverlayLayer();
    strokeBaseline = null;
    strokePoints = [];
    strokeDirtyBounds = null;
    selectedRegion = null;
    moveBaseline = null;
    moveRegionBaseline = null;
    movePointerStart = null;
    moveLastDeltaX = null;
    moveLastDeltaY = null;
  };

  const clearSelection = (): void => {
    selectedRegion = null;
    moveBaseline = null;
    moveRegionBaseline = null;
    movePointerStart = null;
    moveLastDeltaX = null;
    moveLastDeltaY = null;
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

  const flushOverlayRender = (): void => {
    cancelPendingOverlayRender();

    const doc = ensureDocument();
    if (!doc) {
      clearPendingOverlayRenderState();
      removeMaskOverlayLayer();
      removeSelectionOverlayLayer();
      return;
    }

    const maskDirtyBounds = pendingMaskDirtyBounds ? cloneBounds(pendingMaskDirtyBounds) : null;
    const hasMaskDirtyBounds = hasPendingMaskDirtyBounds;
    const forceMaskFull = pendingMaskForceFull;
    const forceSelectionFull = pendingSelectionForceFull;
    clearPendingOverlayRenderState();

    const maskLayer = ensureMaskOverlayLayer();
    if (forceMaskFull) {
      maskLayer.sync(doc, getColorForClass, { forceFull: true });
    } else {
      maskLayer.sync(
        doc,
        getColorForClass,
        hasMaskDirtyBounds ? { dirtyBounds: maskDirtyBounds } : { dirtyBounds: null }
      );
    }

    if (selectedRegion || selectionOverlayLayer) {
      const selectionLayer = ensureSelectionOverlayLayer();
      selectionLayer.sync(
        {
          width: doc.width,
          height: doc.height,
          selection: selectedRegion,
          getColorForClass
        },
        forceSelectionFull ? { forceFull: true } : undefined
      );
    }

    canvas.requestRenderAll();
  };

  const requestOverlayRender = (options?: {
    maskDirtyBounds?: SegmentationRegionBounds | null;
    forceMaskFull?: boolean;
    forceSelectionFull?: boolean;
    immediate?: boolean;
  }): void => {
    if (options?.forceMaskFull) {
      pendingMaskForceFull = true;
      pendingMaskDirtyBounds = null;
      hasPendingMaskDirtyBounds = true;
    } else if (Object.prototype.hasOwnProperty.call(options ?? {}, "maskDirtyBounds")) {
      const nextBounds = options?.maskDirtyBounds ?? null;
      if (nextBounds) {
        pendingMaskDirtyBounds = mergeBounds(pendingMaskDirtyBounds, nextBounds);
      }
      if (!hasPendingMaskDirtyBounds || nextBounds) {
        hasPendingMaskDirtyBounds = true;
      }
    }

    if (options?.forceSelectionFull) {
      pendingSelectionForceFull = true;
    }

    if (options?.immediate || typeof globalThis.requestAnimationFrame !== "function") {
      flushOverlayRender();
      return;
    }

    if (overlayRenderScheduled) {
      return;
    }

    overlayRenderScheduled = true;
    overlayRenderRequestId = globalThis.requestAnimationFrame(() => {
      overlayRenderRequestId = null;
      overlayRenderScheduled = false;
      flushOverlayRender();
    });
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
      cancelPendingOverlayRender();
      clearPendingOverlayRenderState();
      shell.clear();
      document = null;
      removeMaskOverlayLayer();
      removeSelectionOverlayLayer();
      strokeBaseline = null;
      strokePoints = [];
      strokeDirtyBounds = null;
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
      requestOverlayRender({
        forceMaskFull: true,
        forceSelectionFull: true,
        immediate: true
      });
    },

    setMode(mode): void {
      shell.setMode(mode);
      if (mode === "draw") {
        clearSelection();
        requestOverlayRender({ maskDirtyBounds: null });
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
      const mutation = doc.applyStroke({ points: [pointer] }, { recordHistory: false });
      strokeDirtyBounds = mutation.dirtyBounds;
      requestOverlayRender({ maskDirtyBounds: mutation.dirtyBounds });
    },

    continueDrawing(pointer: CanvasPoint): void {
      const doc = ensureDocument();
      if (!doc || !strokeBaseline) {
        return;
      }
      const lastPoint = strokePoints.at(-1);
      const points = lastPoint ? [lastPoint, pointer] : [pointer];
      strokePoints.push(pointer);
      const mutation = doc.applyStroke({ points }, { recordHistory: false });
      if (mutation.mutated) {
        strokeDirtyBounds = mergeBounds(strokeDirtyBounds, mutation.dirtyBounds);
        requestOverlayRender({ maskDirtyBounds: mutation.dirtyBounds });
      }
    },

    async finishDrawing(): Promise<void> {
      const doc = ensureDocument();
      if (!doc || !strokeBaseline) {
        return;
      }

      let autoFillDirtyBounds: SegmentationRegionBounds | null = null;
      if (autoFillClosedRegionEnabled && doc.activeTool === "brush") {
        const currentClass = Number.parseInt(doc.activeClassId, 10);
        const autoFillMutation = applyClosedRegionAutoFillFromStroke({
          beforeMask: strokeBaseline.mask,
          afterMask: doc.mask,
          width: doc.width,
          height: doc.height,
          points: strokePoints,
          brushRadius: doc.brushRadius,
          classId: Number.isInteger(currentClass) && currentClass > 0 ? currentClass : 1
        });
        autoFillDirtyBounds = autoFillMutation.dirtyBounds;
      }

      doc.pushHistoryFromSnapshot(strokeBaseline);
      const finalDirtyBounds = mergeBounds(strokeDirtyBounds, autoFillDirtyBounds);
      strokeBaseline = null;
      strokePoints = [];
      strokeDirtyBounds = null;
      requestOverlayRender({ maskDirtyBounds: finalDirtyBounds });
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
      requestOverlayRender({
        forceMaskFull: true,
        forceSelectionFull: true,
        immediate: true
      });
    },

    redo(): void {
      const doc = ensureDocument();
      if (!doc || !doc.redo()) {
        return;
      }
      clearSelection();
      requestOverlayRender({
        forceMaskFull: true,
        forceSelectionFull: true,
        immediate: true
      });
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

    setSegmentationAutoFillClosedRegionEnabled(enabled: boolean): void {
      autoFillClosedRegionEnabled = enabled;
    },

    getSegmentationAutoFillClosedRegionEnabled(): boolean {
      return autoFillClosedRegionEnabled;
    },

    setSegmentationOverlayVisibility(visible: boolean): void {
      const doc = ensureDocument();
      if (!doc) {
        return;
      }
      doc.setOverlayVisible(visible);
      requestOverlayRender({ maskDirtyBounds: null });
    },

    setSegmentationOverlayOpacity(opacity: number): void {
      const doc = ensureDocument();
      if (!doc) {
        return;
      }
      doc.setOverlayOpacity(opacity);
      requestOverlayRender({ maskDirtyBounds: null });
    },

    setSegmentationClassVisibility(classId: string, visible: boolean): void {
      const doc = ensureDocument();
      if (!doc) {
        return;
      }
      doc.setClassVisibility(classId, visible);
      requestOverlayRender({ forceMaskFull: true });
    },

    setSegmentationOnlyVisibleClass(classId: string | null): void {
      const doc = ensureDocument();
      if (!doc) {
        return;
      }
      doc.setOnlyVisibleClass(classId);
      requestOverlayRender({ forceMaskFull: true });
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

    deleteSelectedSegmentationRegion(): boolean {
      const doc = ensureDocument();
      if (!doc || !selectedRegion) {
        return false;
      }

      const sourceClass = Number.parseInt(selectedRegion.classId, 10);
      if (!Number.isInteger(sourceClass) || sourceClass <= 0) {
        return false;
      }

      const before = doc.cloneSnapshot();
      let mutated = false;

      for (const index of selectedRegion.pixelIndices) {
        if (doc.mask[index] !== sourceClass) {
          continue;
        }
        doc.mask[index] = 0;
        mutated = true;
      }

      if (!mutated) {
        return false;
      }

      doc.pushHistoryFromSnapshot(before);
      const deletedBounds = cloneBounds(selectedRegion.bounds);
      clearSelection();
      requestOverlayRender({ maskDirtyBounds: deletedBounds });
      return true;
    },

    selectSegmentationRegionAtPoint(pointer: CanvasPoint): boolean {
      const doc = ensureDocument();
      if (!doc) {
        return false;
      }

      const region = doc.getConnectedRegionAtPoint(pointer);
      if (!region) {
        clearSelection();
        requestOverlayRender({ maskDirtyBounds: null });
        return false;
      }

      selectedRegion = region;
      doc.setActiveClass(region.classId);
      requestOverlayRender({ maskDirtyBounds: null });
      return true;
    },

    clearSegmentationSelection(): void {
      clearSelection();
      requestOverlayRender({ maskDirtyBounds: null });
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

      const previousRegionBounds = selectedRegion ? cloneBounds(selectedRegion.bounds) : null;
      doc.restoreSnapshot(moveBaseline);
      const moveResult = doc.moveRegion(
        moveRegionBaseline,
        roundedDeltaX,
        roundedDeltaY,
        { recordHistory: false }
      );
      if (!moveResult || !moveResult.mutated) {
        return false;
      }

      moveLastDeltaX = roundedDeltaX;
      moveLastDeltaY = roundedDeltaY;
      selectedRegion = moveResult.region;
      requestOverlayRender({
        maskDirtyBounds: mergeBounds(moveResult.dirtyBounds, previousRegionBounds)
      });
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
      requestOverlayRender({ maskDirtyBounds: null });
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
      const mutation = doc.relabelConnectedRegionAtPoint(pointer, classId);
      if (mutation.mutated) {
        selectedRegion = doc.getConnectedRegionAtPoint(pointer);
        requestOverlayRender({ maskDirtyBounds: mutation.dirtyBounds });
      }
      return mutation.mutated;
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
        requestOverlayRender({
          forceMaskFull: true,
          forceSelectionFull: true,
          immediate: true
        });
        return;
      }
      const doc = ensureDocument();
      if (!doc) {
        return;
      }
      doc.restoreSnapshot(snapshot);
      doc.clearHistory();
      clearSelection();
      requestOverlayRender({
        forceMaskFull: true,
        forceSelectionFull: true,
        immediate: true
      });
    }
  };

  return controller;
}
