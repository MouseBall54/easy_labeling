import type { CanvasPoint } from "../../types/labels.js";
import { createSegmentationDocument, type SegmentationDocument } from "./document.js";
import { applyClosedRegionAutoFillFromStroke } from "./tools.js";
import {
  createSegmentationMaskOverlayLayer,
  createSegmentationSelectionOverlayLayer,
  createSegmentationSuperpixelOverlayLayer,
  type SegmentationMaskOverlayLayer,
  type SegmentationSelectionOverlayLayer,
  type SegmentationSuperpixelOverlayLayer
} from "./overlay.js";
import { createSuperpixelCache, DEFAULT_SUPERPIXEL_SETTINGS, growSuperpixelRegion, normalizeSuperpixelSettings, type SuperpixelResult } from "./superpixels.js";
import type {
  SegmentationDocumentSnapshot,
  SegmentationRegionBounds,
  SegmentationRegionSelection,
  SegmentationSummary,
  SegmentationSuperpixelSettings,
  SegmentationTool
} from "./types.js";
import type { CanvasController, CanvasControllerDeps, CanvasControllerState, CanvasShell } from "../canvas/canvas-controller-types.js";
import type { FabricActiveSelectionLike, FabricObjectLike, FabricRectLike } from "../canvas/fabric-types.js";
import { getColorForClass as defaultGetColorForClass } from "../canvas/colors.js";

function createEmptySummary(): SegmentationSummary {
  return {
    activeClassId: "1",
    activeTool: "brush",
    brushRadius: 6,
    overlayVisible: true,
    overlayOpacity: 0.6,
    edgeHighlightVisible: true,
    edgeHighlightIntensity: 0.7,
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
  let superpixelOverlayLayer: SegmentationSuperpixelOverlayLayer | null = null;
  const superpixelCache = createSuperpixelCache();
  let superpixelResult: SuperpixelResult | null = null;
  let superpixelBoundaryVisible = true;
  let superpixelStrokeMode: "add" | "remove" = "add";
  let smartGrowSimilarity = 0.2;
  let smartGrowEdgeStop = 0.7;
  let superpixelSettings: SegmentationSuperpixelSettings = { ...DEFAULT_SUPERPIXEL_SETTINGS };
  let visitedSuperpixelIds = new Set<number>();
  let strokeBaseline = null as ReturnType<SegmentationDocument["cloneSnapshot"]> | null;
  let strokePoints: CanvasPoint[] = [];
  let polygonPoints: CanvasPoint[] = [];
  let polygonPreviewObjects: FabricObjectLike[] = [];
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
  let workflowActive = true;

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

  const removeSuperpixelOverlayLayer = (): void => {
    if (!superpixelOverlayLayer) return;
    canvas.remove(superpixelOverlayLayer.object);
    superpixelOverlayLayer = null;
  };

  const clearPolygonPreview = (): void => {
    polygonPreviewObjects.forEach((object) => canvas.remove(object));
    polygonPreviewObjects = [];
  };

  const renderPolygonPreview = (): void => {
    clearPolygonPreview();
    if (!workflowActive || polygonPoints.length === 0) return;
    const color = getColorForClass(document?.activeClassId ?? "1");
    polygonPoints.forEach((point, index) => {
      polygonPreviewObjects.push(new deps.fabric.Circle({
        left: point.x - 3, top: point.y - 3, radius: 3, fill: color, stroke: "#ffffff", strokeWidth: 1,
        selectable: false, evented: false, originX: "left", originY: "top"
      }));
      const previous = polygonPoints[index - 1];
      if (previous) {
        polygonPreviewObjects.push(new deps.fabric.Line([previous.x, previous.y, point.x, point.y], {
          stroke: color, strokeWidth: 2, strokeDashArray: [5, 4], selectable: false, evented: false
        }));
      }
    });
    canvas.add(...polygonPreviewObjects);
    canvas.requestRenderAll();
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

  const ensureSuperpixelOverlayLayer = (): SegmentationSuperpixelOverlayLayer => {
    if (!superpixelOverlayLayer) {
      superpixelOverlayLayer = createSegmentationSuperpixelOverlayLayer(deps.fabric);
      canvas.add(superpixelOverlayLayer.object);
    }
    return superpixelOverlayLayer;
  };

  const resetDocumentForCurrentImage = (): void => {
    cancelPendingOverlayRender();
    clearPendingOverlayRenderState();

    if (!state.currentImage) {
      document = null;
      removeMaskOverlayLayer();
      removeSelectionOverlayLayer();
      removeSuperpixelOverlayLayer();
      superpixelResult = null;
      superpixelCache.clear();
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
      overlayOpacity: document?.overlayOpacity ?? 0.6,
      edgeHighlightVisible: document?.edgeHighlightVisible ?? true,
      edgeHighlightIntensity: document?.edgeHighlightIntensity ?? 0.7
    });
    removeMaskOverlayLayer();
    removeSelectionOverlayLayer();
    removeSuperpixelOverlayLayer();
    superpixelResult = null;
    superpixelCache.clear();
    strokeBaseline = null;
    strokePoints = [];
    polygonPoints = [];
    clearPolygonPreview();
    strokeDirtyBounds = null;
    selectedRegion = null;
    moveBaseline = null;
    moveRegionBaseline = null;
    movePointerStart = null;
    moveLastDeltaX = null;
    moveLastDeltaY = null;
    visitedSuperpixelIds.clear();
  };

  const clearSelection = (): void => {
    selectedRegion = null;
    moveBaseline = null;
    moveRegionBaseline = null;
    movePointerStart = null;
    moveLastDeltaX = null;
    moveLastDeltaY = null;
  };

  const cancelActiveToolGesture = (): void => {
    const doc = ensureDocument();
    if (doc && strokeBaseline) {
      // A tool may be switched while Fabric still has an in-progress pointer gesture.
      // Restore its baseline so the next tool cannot commit or render that partial gesture.
      doc.restoreSnapshot(strokeBaseline);
    }
    strokeBaseline = null;
    strokePoints = [];
    strokeDirtyBounds = null;
    polygonPoints = [];
    clearPolygonPreview();
    visitedSuperpixelIds.clear();
    clearSelection();
    cancelPendingOverlayRender();
    clearPendingOverlayRenderState();
  };

  const createSelectionFromIndices = (
    doc: SegmentationDocument,
    classId: string,
    indices: readonly number[],
    seedPoint: CanvasPoint
  ): SegmentationRegionSelection | null => {
    if (indices.length === 0) {
      return null;
    }
    let left = doc.width - 1;
    let top = doc.height - 1;
    let right = 0;
    let bottom = 0;
    indices.forEach((index) => {
      const x = index % doc.width;
      const y = Math.floor(index / doc.width);
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    });
    return {
      classId,
      pixelCount: indices.length,
      pixelIndices: new Uint32Array(indices),
      bounds: { left, top, right, bottom },
      seedPoint
    };
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
    maskLayer.object.set("visible", workflowActive && doc.overlayVisible);

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
      selectionLayer.object.set("visible", workflowActive && selectedRegion !== null);
    }

    if (superpixelResult || superpixelOverlayLayer) {
      const layer = ensureSuperpixelOverlayLayer();
      layer.sync(
        superpixelResult,
        workflowActive
          && superpixelBoundaryVisible
          && (doc.activeTool === "superpixel" || doc.activeTool === "smart")
      );
    }

    // Keep the Smart Select / Edit selection above superpixel boundaries so the
    // changed mask is not mistaken for the boundary visualization.
    if (selectionOverlayLayer && selectedRegion) {
      canvas.remove(selectionOverlayLayer.object);
      canvas.add(selectionOverlayLayer.object);
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

    setActiveSelection(objects, primaryObject = null): void {
      shell.setActiveSelection(objects, primaryObject);
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
      polygonPoints = [];
      clearPolygonPreview();
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

    captureBoxLayout(): never {
      throw new Error("Box layouts are only available in Detection mode");
    },

    applyBoxLayout(): never {
      throw new Error("Box layouts are only available in Detection mode");
    },

    applyDetectionBoxes(): never {
      throw new Error("Detection boxes are only available in Detection mode");
    },

    translateLayoutInstance(): never {
      throw new Error("Box layouts are only available in Detection mode");
    },

    translateSelectedBoxes(): never {
      throw new Error("Detection boxes are only available in Detection mode");
    },

    getSelectedBoxCount(): number {
      return 0;
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
      if (doc.activeTool === "polygon") {
        if (!strokeBaseline) {
          strokeBaseline = doc.cloneSnapshot();
          polygonPoints = [pointer];
        } else {
          polygonPoints.push(pointer);
        }
        renderPolygonPreview();
        return;
      }
      if (doc.activeTool === "superpixel") {
        controller.startSegmentationSuperpixelPaint?.(pointer, "add");
        return;
      }
      if (doc.activeTool === "smart") {
        controller.applySegmentationSmartGrow?.(pointer, smartGrowSimilarity, smartGrowEdgeStop);
        return;
      }
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
      if (doc.activeTool === "polygon") {
        return;
      }
      if (doc.activeTool === "superpixel") {
        controller.startSegmentationSuperpixelPaint?.(pointer, superpixelStrokeMode);
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
      if (doc.activeTool === "polygon") {
        return;
      }
      if (doc.activeTool === "superpixel") {
        const changed = doc.pushHistoryFromSnapshot(strokeBaseline);
        strokeBaseline = null;
        visitedSuperpixelIds.clear();
        requestOverlayRender({ maskDirtyBounds: strokeDirtyBounds });
        if (changed) deps.onDocumentMutation?.();
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

      const changed = doc.pushHistoryFromSnapshot(strokeBaseline);
      const finalDirtyBounds = mergeBounds(strokeDirtyBounds, autoFillDirtyBounds);
      strokeBaseline = null;
      strokePoints = [];
      strokeDirtyBounds = null;
      requestOverlayRender({ maskDirtyBounds: finalDirtyBounds });
      if (changed) {
        deps.onDocumentMutation?.();
      }
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

    async copy(): Promise<void> {
      return;
    },

    async paste(): Promise<void> {
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
      deps.onDocumentMutation?.();
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
      deps.onDocumentMutation?.();
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
      if (doc.activeTool !== tool) {
        cancelActiveToolGesture();
      }
      doc.setActiveTool(tool);
      requestOverlayRender({
        forceMaskFull: true,
        forceSelectionFull: true,
        immediate: true
      });
    },

    recalculateSegmentationSuperpixels(regionSize: number): boolean {
      const doc = ensureDocument();
      const source = state.currentImage as unknown as CanvasImageSource | null;
      if (!doc || !source || typeof globalThis.document === "undefined") return false;
      const imageCanvas = globalThis.document.createElement("canvas");
      imageCanvas.width = doc.width;
      imageCanvas.height = doc.height;
      const context = imageCanvas.getContext("2d", { willReadFrequently: true });
      if (!context) return false;
      try {
        context.drawImage(source, 0, 0, doc.width, doc.height);
      } catch {
        return false;
      }
      const imageData = context.getImageData(0, 0, doc.width, doc.height);
      const cacheKey = `${(state.currentImage as { src?: string }).src ?? "image"}:${doc.width}x${doc.height}`;
      superpixelSettings = normalizeSuperpixelSettings({ ...superpixelSettings, regionSize });
      superpixelResult = superpixelCache.getOrCreate(
        { cacheKey, width: doc.width, height: doc.height, rgba: imageData.data },
        regionSize,
        superpixelSettings
      );
      requestOverlayRender({ immediate: true });
      return true;
    },

    setSegmentationSuperpixelBoundaryVisible(visible: boolean): void {
      superpixelBoundaryVisible = visible;
      requestOverlayRender({ immediate: true });
    },

    getSegmentationSuperpixelRegionSize(): number | null {
      return superpixelResult?.regionSize ?? null;
    },

    getSegmentationSuperpixelSettings(): SegmentationSuperpixelSettings {
      return { ...superpixelSettings };
    },

    setSegmentationSuperpixelSettings(settings: Partial<SegmentationSuperpixelSettings>): boolean {
      const next = normalizeSuperpixelSettings({ ...superpixelSettings, ...settings });
      if (next.regionSize === superpixelSettings.regionSize && next.blur === superpixelSettings.blur && next.contrast === superpixelSettings.contrast && next.edgeSensitivity === superpixelSettings.edgeSensitivity) {
        return false;
      }
      superpixelSettings = next;
      superpixelResult = null;
      superpixelCache.clear();
      removeSuperpixelOverlayLayer();
      return true;
    },

    startSegmentationSuperpixelPaint(pointer: CanvasPoint, mode: "add" | "remove"): boolean {
      const doc = ensureDocument();
      if (!doc || !superpixelResult) return false;
      const x = Math.round(pointer.x);
      const y = Math.round(pointer.y);
      if (x < 0 || y < 0 || x >= doc.width || y >= doc.height) return false;
      if (!strokeBaseline) {
        clearSelection();
        strokeBaseline = doc.cloneSnapshot();
        strokeDirtyBounds = null;
        visitedSuperpixelIds.clear();
      }
      superpixelStrokeMode = mode;
      const regionId = superpixelResult.labels[(y * doc.width) + x] ?? -1;
      if (regionId < 0 || visitedSuperpixelIds.has(regionId)) return false;
      visitedSuperpixelIds.add(regionId);
      const classId = Number.parseInt(doc.activeClassId, 10);
      const nextClassId = mode === "remove" ? 0 : (Number.isInteger(classId) && classId > 0 ? classId : 1);
      let changed = false;
      let minX = doc.width - 1;
      let minY = doc.height - 1;
      let maxX = 0;
      let maxY = 0;
      superpixelResult.labels.forEach((label, index) => {
        if (label !== regionId || doc.mask[index] === nextClassId) return;
        doc.mask[index] = nextClassId;
        changed = true;
        const pixelX = index % doc.width;
        const pixelY = Math.floor(index / doc.width);
        minX = Math.min(minX, pixelX);
        minY = Math.min(minY, pixelY);
        maxX = Math.max(maxX, pixelX);
        maxY = Math.max(maxY, pixelY);
      });
      if (changed) {
        const bounds = { left: minX, top: minY, right: maxX, bottom: maxY };
        strokeDirtyBounds = mergeBounds(strokeDirtyBounds, bounds);
        requestOverlayRender({ maskDirtyBounds: bounds });
      }
      return changed;
    },

    applySegmentationSmartGrow(pointer: CanvasPoint, similarity: number, edgeStop: number): boolean {
      const doc = ensureDocument();
      if (!doc) {
        deps.notify("Smart Select needs a loaded image.", 3500);
        return false;
      }
      if (!superpixelResult) {
        deps.notify("Smart Select needs calculated Superpixels.", 3500);
        return false;
      }
      const x = Math.round(pointer.x);
      const y = Math.round(pointer.y);
      if (x < 0 || y < 0 || x >= doc.width || y >= doc.height) {
        deps.notify("Click inside the image to select a region.", 3000);
        return false;
      }
      const seedId = superpixelResult.labels[(y * doc.width) + x] ?? -1;
      if (seedId < 0) {
        deps.notify("No selectable Superpixel was found at this point.", 3000);
        return false;
      }
      const regionIds = growSuperpixelRegion({ result: superpixelResult, seedId, similarity, edgeStop });
      if (regionIds.length === 0) {
        deps.notify("No similar region was found at this point.", 3000);
        return false;
      }
      const before = doc.cloneSnapshot();
      const accepted = new Set(regionIds);
      const classId = Number.parseInt(doc.activeClassId, 10);
      const nextClassId = Number.isInteger(classId) && classId > 0 ? classId : 1;
      let changed = false;
      const changedIndices: number[] = [];
      superpixelResult.labels.forEach((regionId, index) => {
        if (!accepted.has(regionId) || doc.mask[index] === nextClassId) return;
        doc.mask[index] = nextClassId;
        changed = true;
        changedIndices.push(index);
      });
      if (!changed) {
        deps.notify("Selected regions already use the active class.", 3000);
        return false;
      }
      doc.pushHistoryFromSnapshot(before);
      selectedRegion = createSelectionFromIndices(doc, `${nextClassId}`, changedIndices, { x, y });
      requestOverlayRender({
        forceMaskFull: true,
        forceSelectionFull: true,
        immediate: true
      });
      deps.onDocumentMutation?.();
      deps.notify(`Smart Select applied ${regionIds.length} region${regionIds.length === 1 ? "" : "s"} (${changedIndices.length.toLocaleString()} px).`, 2500);
      return true;
    },

    setSegmentationSmartGrowSettings(similarity: number, edgeStop: number): void {
      smartGrowSimilarity = Math.min(1, Math.max(0, similarity));
      smartGrowEdgeStop = Math.min(1, Math.max(0, edgeStop));
    },

    finishSegmentationPolygon(): boolean {
      const doc = ensureDocument();
      if (!doc || doc.activeTool !== "polygon" || !strokeBaseline || polygonPoints.length < 3) {
        return false;
      }
      const mutation = doc.applyPolygon(polygonPoints, { recordHistory: false });
      const changed = mutation.mutated && doc.pushHistoryFromSnapshot(strokeBaseline);
      strokeBaseline = null;
      polygonPoints = [];
      clearPolygonPreview();
      requestOverlayRender({ maskDirtyBounds: mutation.dirtyBounds });
      if (changed) {
        deps.onDocumentMutation?.();
      }
      return changed;
    },

    cancelSegmentationPolygon(): boolean {
      const doc = ensureDocument();
      if (!doc || !strokeBaseline || polygonPoints.length === 0) {
        return false;
      }
      strokeBaseline = null;
      polygonPoints = [];
      clearPolygonPreview();
      return true;
    },

    isSegmentationPolygonDrawing(): boolean {
      return polygonPoints.length > 0;
    },

    getSegmentationPolygonVertexCount(): number {
      return polygonPoints.length;
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

    setSegmentationEdgeHighlightVisible(visible: boolean): void {
      const doc = ensureDocument();
      if (!doc) {
        return;
      }
      doc.setEdgeHighlightVisible(visible);
      requestOverlayRender({ forceMaskFull: true });
    },

    setSegmentationEdgeHighlightIntensity(intensity: number): void {
      const doc = ensureDocument();
      if (!doc) {
        return;
      }
      doc.setEdgeHighlightIntensity(intensity);
      requestOverlayRender({ forceMaskFull: true });
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

    getSelectedSegmentationRegion(): SegmentationRegionSelection | null {
      return selectedRegion;
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
      deps.onDocumentMutation?.();
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
      if (changed) {
        deps.onDocumentMutation?.();
      }
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
        deps.onDocumentMutation?.();
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
    },

    setWorkflowActive(active: boolean): void {
      workflowActive = active;
      if (maskOverlayLayer) {
        maskOverlayLayer.object.set("visible", active && (document?.overlayVisible ?? true));
      }
      if (selectionOverlayLayer) {
        selectionOverlayLayer.object.set("visible", active && selectedRegion !== null);
      }
      if (!active) {
        controller.cancelSegmentationPolygon?.();
        clearPolygonPreview();
        canvas.discardActiveObject();
      } else if (polygonPoints.length > 0) {
        renderPolygonPreview();
      }
      canvas.requestRenderAll();
    }
  };

  return controller;
}
