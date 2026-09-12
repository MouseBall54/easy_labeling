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
  SegmentationAiPreviewSummary,
  SegmentationRegionBounds,
  SegmentationRegionSelection,
  SegmentationSmartPreviewSummary,
  SegmentationSummary,
  SegmentationSuperpixelSettings,
  SegmentationTool
} from "./types.js";
import type { CanvasController, CanvasControllerDeps, CanvasControllerState, CanvasShell } from "../canvas/canvas-controller-types.js";
import type { FabricActiveSelectionLike, FabricObjectLike, FabricRectLike } from "../canvas/fabric-types.js";
import { getColorForClass as defaultGetColorForClass } from "../canvas/colors.js";
import type { EdgeSamBox, EdgeSamPoint } from "../edgesam/types.js";
import {
  DEFAULT_AI_SELECT_REGION_CONSTRAINT,
  clipAiSelectMaskToRegion,
  getActiveAiSelectRegionRect,
  normalizeAiSelectRegionConstraint,
  type AiSelectRegionConstraint
} from "./ai-region-constraint.js";
import {
  DEFAULT_SEGMENTATION_PREPROCESSING_CONFIG,
  getSegmentationPreprocessingKey,
  normalizeSegmentationPreprocessingConfig,
  preprocessSegmentationImage,
  type SegmentationImageSourceMode,
  type SegmentationPreprocessingConfig
} from "./preprocessing.js";

function createEmptySummary(): SegmentationSummary {
  return {
    activeClassId: "1",
    requiresClassSelection: true,
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
  let hasExplicitPaintClassSelection = false;
  let maskOverlayLayer: SegmentationMaskOverlayLayer | null = null;
  let selectionOverlayLayer: SegmentationSelectionOverlayLayer | null = null;
  let smartPreviewOverlayLayer: SegmentationSelectionOverlayLayer | null = null;
  let superpixelOverlayLayer: SegmentationSuperpixelOverlayLayer | null = null;
  const superpixelCache = createSuperpixelCache();
  let superpixelResult: SuperpixelResult | null = null;
  let superpixelBoundaryVisible = true;
  let superpixelStrokeMode: "add" | "remove" = "add";
  let smartGrowSimilarity = 0.2;
  let smartGrowEdgeStop = 0.7;
  let superpixelSettings: SegmentationSuperpixelSettings = { ...DEFAULT_SUPERPIXEL_SETTINGS };
  let preprocessingConfig: SegmentationPreprocessingConfig = { ...DEFAULT_SEGMENTATION_PREPROCESSING_CONFIG };
  let viewSource: SegmentationImageSourceMode = "original";
  let edgeSamInputSource: SegmentationImageSourceMode = "original";
  let superpixelInputSource: SegmentationImageSourceMode = "original";
  let originalImageSource: CanvasImageSource | null = null;
  let originalImageData: ImageData | null = null;
  let processedImageSource: HTMLCanvasElement | null = null;
  let processedImageData: Uint8ClampedArray | null = null;
  let imageSourceKey = "";
  let imageSourceRevision = 0;
  let visitedSuperpixelIds = new Set<number>();
  let strokeBaseline = null as ReturnType<SegmentationDocument["cloneSnapshot"]> | null;
  let strokePoints: CanvasPoint[] = [];
  let polygonPoints: CanvasPoint[] = [];
  let polygonPreviewObjects: FabricObjectLike[] = [];
  let strokeDirtyBounds: SegmentationRegionBounds | null = null;
  let selectedRegion: SegmentationRegionSelection | null = null;
  let smartPreview: {
    seedPoint: CanvasPoint;
    mode: "add" | "remove";
    regionIds: number[];
    selection: SegmentationRegionSelection;
  } | null = null;
  let aiPreview: {
    selection: SegmentationRegionSelection;
    score: number;
  } | null = null;
  let aiPoints: EdgeSamPoint[] = [];
  let aiBox: EdgeSamBox | null = null;
  let aiBoxStart: CanvasPoint | null = null;
  let aiRegionConstraint: AiSelectRegionConstraint = { ...DEFAULT_AI_SELECT_REGION_CONSTRAINT, margin: { ...DEFAULT_AI_SELECT_REGION_CONSTRAINT.margin } };
  let aiRegionConstraintStart: CanvasPoint | null = null;
  let isDrawingAiRegionConstraint = false;
  let aiPromptObjects: FabricObjectLike[] = [];
  let aiRequestRevision = 0;
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

  const canPaintWithActiveClass = (notifyOnFailure = true): boolean => {
    if (hasExplicitPaintClassSelection) {
      return true;
    }
    if (notifyOnFailure) {
      deps.notify("Select a paint class before drawing.", 3000);
    }
    return false;
  };

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

  const removeSmartPreviewOverlayLayer = (): void => {
    if (!smartPreviewOverlayLayer) return;
    canvas.remove(smartPreviewOverlayLayer.object);
    smartPreviewOverlayLayer = null;
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

  const clearAiPromptOverlay = (): void => {
    aiPromptObjects.forEach((object) => canvas.remove(object));
    aiPromptObjects = [];
  };

  const renderAiPromptOverlay = (): void => {
    clearAiPromptOverlay();
    const doc = ensureDocument();
    if (!workflowActive || (!aiPoints.length && !aiBox && !aiRegionConstraint.rect)) return;
    const zoom = Math.max(0.01, canvas.getZoom());
    const pointRadius = 6 / zoom;
    const pointMarkLength = 3.5 / zoom;
    const pointStrokeWidth = 2 / zoom;
    const pointMarkStrokeWidth = 1.5 / zoom;
    aiPoints.forEach((point) => {
      const positive = point.label === "positive";
      const color = positive ? "#19c37d" : "#ef4444";
      aiPromptObjects.push(new deps.fabric.Circle({
        left: point.x - pointRadius, top: point.y - pointRadius, radius: pointRadius, fill: color, stroke: "#ffffff", strokeWidth: pointStrokeWidth,
        selectable: false, evented: false, originX: "left", originY: "top"
      }));
      aiPromptObjects.push(new deps.fabric.Line([point.x - pointMarkLength, point.y, point.x + pointMarkLength, point.y], {
        stroke: "#ffffff", strokeWidth: pointMarkStrokeWidth, selectable: false, evented: false
      }));
      if (positive) {
        aiPromptObjects.push(new deps.fabric.Line([point.x, point.y - pointMarkLength, point.x, point.y + pointMarkLength], {
          stroke: "#ffffff", strokeWidth: pointMarkStrokeWidth, selectable: false, evented: false
        }));
      }
    });
    if (aiBox) {
      aiPromptObjects.push(new deps.fabric.Rect({
        left: aiBox.left, top: aiBox.top, width: Math.max(1, aiBox.right - aiBox.left), height: Math.max(1, aiBox.bottom - aiBox.top),
        fill: "rgba(59, 130, 246, 0.08)", stroke: "#3b82f6", strokeWidth: 2, strokeDashArray: [6, 4], selectable: false, evented: false,
        originX: "left", originY: "top"
      }));
    }
    const activeRegion = doc ? getActiveAiSelectRegionRect(aiRegionConstraint, doc) : null;
    if (activeRegion) {
      aiPromptObjects.push(new deps.fabric.Rect({
        left: activeRegion.x, top: activeRegion.y, width: activeRegion.width, height: activeRegion.height,
        fill: "rgba(25, 195, 125, 0.04)", stroke: "#19c37d", strokeWidth: 2 / zoom, strokeDashArray: [8 / zoom, 5 / zoom], selectable: false, evented: false,
        originX: "left", originY: "top"
      }));
    }
    canvas.add(...aiPromptObjects);
  };

  const clearAiPreview = (): boolean => {
    const changed = aiPreview !== null || aiPoints.length > 0 || aiBox !== null;
    aiRequestRevision += 1;
    aiPreview = null;
    aiPoints = [];
    aiBox = null;
    aiBoxStart = null;
    renderAiPromptOverlay();
    requestOverlayRender({ forceSelectionFull: true, immediate: true });
    return changed;
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

  const ensureSmartPreviewOverlayLayer = (): SegmentationSelectionOverlayLayer => {
    if (!smartPreviewOverlayLayer) {
      smartPreviewOverlayLayer = createSegmentationSelectionOverlayLayer(deps.fabric);
      canvas.add(smartPreviewOverlayLayer.object);
    }
    return smartPreviewOverlayLayer;
  };

  const ensureSuperpixelOverlayLayer = (): SegmentationSuperpixelOverlayLayer => {
    if (!superpixelOverlayLayer) {
      superpixelOverlayLayer = createSegmentationSuperpixelOverlayLayer(deps.fabric);
      canvas.add(superpixelOverlayLayer.object);
    }
    return superpixelOverlayLayer;
  };

  const clearProcessedImageCache = (): void => {
    originalImageData = null;
    processedImageSource = null;
    processedImageData = null;
  };

  const getOriginalImageData = (): ImageData | null => {
    const doc = ensureDocument();
    if (!doc || !originalImageSource || typeof globalThis.document === "undefined") return null;
    if (originalImageData?.width === doc.width && originalImageData.height === doc.height) return originalImageData;
    const canvasElement = globalThis.document.createElement("canvas");
    canvasElement.width = doc.width;
    canvasElement.height = doc.height;
    const context = canvasElement.getContext("2d", { willReadFrequently: true });
    if (!context) return null;
    try {
      context.drawImage(originalImageSource, 0, 0, doc.width, doc.height);
      originalImageData = context.getImageData(0, 0, doc.width, doc.height);
      return originalImageData;
    } catch {
      return null;
    }
  };

  const ensureProcessedImage = (): { source: HTMLCanvasElement; rgba: Uint8ClampedArray; cacheKey: string } | null => {
    const doc = ensureDocument();
    const original = getOriginalImageData();
    if (!doc || !original || typeof globalThis.document === "undefined") return null;
    const preprocessingKey = getSegmentationPreprocessingKey(preprocessingConfig);
    const cacheKey = `${imageSourceKey}:processed:${preprocessingKey}`;
    if (!processedImageSource || !processedImageData || processedImageSource.width !== doc.width || processedImageSource.height !== doc.height || processedImageSource.dataset.preprocessingKey !== cacheKey) {
      const canvasElement = globalThis.document.createElement("canvas");
      canvasElement.width = doc.width;
      canvasElement.height = doc.height;
      const context = canvasElement.getContext("2d", { willReadFrequently: true });
      if (!context) return null;
      const rgba = preprocessSegmentationImage({ width: doc.width, height: doc.height, rgba: original.data }, preprocessingConfig);
      const imageData = context.createImageData(doc.width, doc.height);
      imageData.data.set(rgba);
      context.putImageData(imageData, 0, 0);
      canvasElement.dataset.preprocessingKey = cacheKey;
      processedImageSource = canvasElement;
      processedImageData = rgba;
    }
    return { source: processedImageSource, rgba: processedImageData, cacheKey };
  };

  const getImageInput = (sourceMode: SegmentationImageSourceMode): { source: CanvasImageSource; rgba: Uint8ClampedArray; cacheKey: string } | null => {
    const doc = ensureDocument();
    if (!doc) return null;
    if (sourceMode === "processed") {
      return ensureProcessedImage();
    }
    const original = getOriginalImageData();
    if (!original || !originalImageSource) return null;
    return { source: originalImageSource, rgba: original.data, cacheKey: `${imageSourceKey}:original` };
  };

  const refreshViewSource = (): boolean => {
    const input = getImageInput(viewSource);
    if (!input) return false;
    shell.setBackgroundImage(input.source);
    requestOverlayRender({ forceMaskFull: true, forceSelectionFull: true, immediate: true });
    return true;
  };

  const resetDocumentForCurrentImage = (): void => {
    cancelPendingOverlayRender();
    clearPendingOverlayRenderState();

    if (!state.currentImage) {
      document = null;
      hasExplicitPaintClassSelection = false;
      removeMaskOverlayLayer();
      removeSelectionOverlayLayer();
      removeSmartPreviewOverlayLayer();
      removeSuperpixelOverlayLayer();
      superpixelResult = null;
      superpixelCache.clear();
      selectedRegion = null;
      smartPreview = null;
      clearAiPreview();
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
    hasExplicitPaintClassSelection = false;
    removeMaskOverlayLayer();
    removeSelectionOverlayLayer();
    removeSmartPreviewOverlayLayer();
    removeSuperpixelOverlayLayer();
    superpixelResult = null;
    superpixelCache.clear();
    strokeBaseline = null;
    strokePoints = [];
    polygonPoints = [];
    clearPolygonPreview();
    strokeDirtyBounds = null;
    selectedRegion = null;
    smartPreview = null;
    clearAiPreview();
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

  const clearSmartPreview = (): boolean => {
    if (!smartPreview) return false;
    smartPreview = null;
    clearAiPreview();
    requestOverlayRender({ forceSelectionFull: true, immediate: true });
    return true;
  };

  const getSmartPreviewSummary = (): SegmentationSmartPreviewSummary | null => {
    if (!smartPreview) return null;
    return {
      mode: smartPreview.mode,
      classId: smartPreview.selection.classId,
      regionCount: smartPreview.regionIds.length,
      pixelCount: smartPreview.selection.pixelCount,
      similarity: smartGrowSimilarity,
      edgeStop: smartGrowEdgeStop
    };
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
    smartPreview = null;
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

    const previewSelection = smartPreview?.selection ?? aiPreview?.selection ?? null;
    if (previewSelection || smartPreviewOverlayLayer) {
      const previewLayer = ensureSmartPreviewOverlayLayer();
      previewLayer.sync(
        {
          width: doc.width,
          height: doc.height,
          selection: previewSelection,
          getColorForClass,
          variant: smartPreview?.mode === "remove" ? "smart-remove" : "smart-add"
        },
        forceSelectionFull ? { forceFull: true } : undefined
      );
      previewLayer.object.set("visible", workflowActive && previewSelection !== null);
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
    if (smartPreviewOverlayLayer && previewSelection) {
      canvas.remove(smartPreviewOverlayLayer.object);
      canvas.add(smartPreviewOverlayLayer.object);
    }
    if (aiPromptObjects.length > 0) {
      aiPromptObjects.forEach((object) => {
        canvas.remove(object);
        canvas.add(object);
      });
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

  const buildSmartPreview = (pointer: CanvasPoint, mode: "add" | "remove", notifyOnFailure = true, immediate = true): boolean => {
    const doc = ensureDocument();
    if (!doc) {
      if (notifyOnFailure) deps.notify("Smart Select needs a loaded image.", 3500);
      return false;
    }
    if (!superpixelResult) {
      if (notifyOnFailure) deps.notify("Smart Select needs calculated Superpixels.", 3500);
      return false;
    }
    const x = Math.round(pointer.x);
    const y = Math.round(pointer.y);
    if (x < 0 || y < 0 || x >= doc.width || y >= doc.height) {
      if (notifyOnFailure) deps.notify("Click inside the image to preview a region.", 3000);
      return false;
    }
    const seedId = superpixelResult.labels[(y * doc.width) + x] ?? -1;
    if (seedId < 0) {
      if (notifyOnFailure) deps.notify("No selectable Superpixel was found at this point.", 3000);
      return false;
    }
    const regionIds = growSuperpixelRegion({ result: superpixelResult, seedId, similarity: smartGrowSimilarity, edgeStop: smartGrowEdgeStop });
    const accepted = new Set(regionIds);
    const classId = Number.parseInt(doc.activeClassId, 10);
    const nextClassId = Number.isInteger(classId) && classId > 0 ? classId : 1;
    const changedIndices: number[] = [];
    superpixelResult.labels.forEach((regionId, index) => {
      if (!accepted.has(regionId)) return;
      if (mode === "remove" ? doc.mask[index] !== 0 : doc.mask[index] !== nextClassId) {
        changedIndices.push(index);
      }
    });
    const selection = createSelectionFromIndices(doc, `${nextClassId}`, changedIndices, { x, y });
    if (!selection) {
      if (notifyOnFailure) deps.notify(mode === "remove" ? "Selected regions are already empty." : "Selected regions already use the active class.", 3000);
      clearSmartPreview();
      return false;
    }
    smartPreview = { seedPoint: { x, y }, mode, regionIds, selection };
    clearSelection();
    requestOverlayRender({ forceSelectionFull: true, immediate });
    return true;
  };

  const getAiPreviewSummary = (): SegmentationAiPreviewSummary | null => {
    if (!aiPreview) return null;
    return {
      classId: aiPreview.selection.classId,
      pixelCount: aiPreview.selection.pixelCount,
      pointCount: aiPoints.length,
      hasBox: aiBox !== null,
      score: aiPreview.score
    };
  };

  const prepareEdgeSamImage = async (): Promise<void> => {
    const service = deps.edgeSamService;
    const doc = ensureDocument();
    const input = getImageInput(edgeSamInputSource);
    if (!service || !doc || !input) return;
    try {
      await service.prepareImage({
        cacheKey: input.cacheKey,
        width: doc.width,
        height: doc.height,
        rgba: input.rgba
      });
      if (workflowActive) deps.notify("AI Select is ready.", 1800);
    } catch (error) {
      deps.notify(`AI Select is unavailable: ${error instanceof Error ? error.message : "model initialization failed"}`, 5000);
    }
  };

  const buildAiPreview = async (): Promise<boolean> => {
    const doc = ensureDocument();
    const service = deps.edgeSamService;
    if (!doc || !service) {
      deps.notify("AI Select is unavailable in this environment.", 3500);
      return false;
    }
    if (aiPoints.length === 0 && !aiBox) {
      deps.notify("Add a positive or negative point, or draw a box prompt first.", 3000);
      return false;
    }
    const currentStatus = service.getStatus();
    if (currentStatus.phase !== "ready") {
      deps.notify(currentStatus.phase === "error"
        ? `AI Select is unavailable: ${currentStatus.message ?? "model error"}`
        : "AI Select is preparing the image. Try again in a moment.", 3500);
      return false;
    }
    const revision = ++aiRequestRevision;
    try {
      const result = await service.decode({ points: aiPoints, box: aiBox });
      if (revision !== aiRequestRevision || result.width !== doc.width || result.height !== doc.height) return false;
      const activeClass = Number.parseInt(doc.activeClassId, 10);
      const classId = Number.isInteger(activeClass) && activeClass > 0 ? activeClass : 1;
      const activeRegion = getActiveAiSelectRegionRect(aiRegionConstraint, doc);
      if (aiRegionConstraint.enabled && !activeRegion) {
        deps.notify("Draw an ROI before limiting the AI Select mask.", 3000);
        return false;
      }
      const clippedMask = clipAiSelectMaskToRegion(result.mask, doc, activeRegion);
      const indices: number[] = [];
      clippedMask.forEach((value, index) => {
        if (value && doc.mask[index] !== classId) indices.push(index);
      });
      const selection = createSelectionFromIndices(doc, `${classId}`, indices, aiPoints.at(-1) ?? { x: aiBox?.left ?? 0, y: aiBox?.top ?? 0 });
      aiPreview = selection ? { selection, score: result.score } : null;
      requestOverlayRender({ forceSelectionFull: true, immediate: true });
      if (!selection) deps.notify("AI Select preview does not add new pixels for the active class.", 2800);
      return selection !== null;
    } catch (error) {
      if (revision === aiRequestRevision) {
        deps.notify(`AI Select could not create a mask: ${error instanceof Error ? error.message : "decoder error"}`, 5000);
      }
      return false;
    }
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
      clearAiPreview();
      deps.edgeSamService?.clear();
    },

    setBackgroundImage(image: unknown): void {
      originalImageSource = image as CanvasImageSource;
      imageSourceRevision += 1;
      imageSourceKey = `${(image as { src?: string }).src ?? "local-image"}:${imageSourceRevision}`;
      clearProcessedImageCache();
      shell.setBackgroundImage(image);
      resetDocumentForCurrentImage();
      aiRegionConstraint = { ...DEFAULT_AI_SELECT_REGION_CONSTRAINT, margin: { ...DEFAULT_AI_SELECT_REGION_CONSTRAINT.margin } };
      aiRegionConstraintStart = null;
      isDrawingAiRegionConstraint = false;
      renderAiPromptOverlay();
      if (viewSource === "processed" && ensureProcessedImage()) {
        void refreshViewSource();
      }
      requestOverlayRender({
        forceMaskFull: true,
        forceSelectionFull: true,
        immediate: true
      });
      void prepareEdgeSamImage();
    },

    setMode(mode): void {
      shell.setMode(mode);
      if (mode !== "draw") {
        smartPreview = null;
      }
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
      if (doc.activeTool !== "erase" && !canPaintWithActiveClass()) {
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
        controller.startSegmentationSmartGrow?.(pointer, "add");
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
      renderAiPromptOverlay();
    },

    zoom(factor: number): void {
      shell.zoom(factor);
      renderAiPromptOverlay();
    },

    resetZoom(): void {
      shell.resetZoom();
      renderAiPromptOverlay();
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
      renderAiPromptOverlay();
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

    getClipboardItemCount(): number {
      return 0;
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
        smartPreview = null;
        if (tool !== "ai-select") {
          clearAiPreview();
          isDrawingAiRegionConstraint = false;
          aiRegionConstraintStart = null;
          aiRegionConstraint = normalizeAiSelectRegionConstraint({
            ...aiRegionConstraint,
            enabled: false,
            source: null,
            rect: null,
            detectionLabelId: undefined
          });
        }
      }
      doc.setActiveTool(tool);
      requestOverlayRender({
        forceMaskFull: true,
        forceSelectionFull: true,
        immediate: true
      });
    },

    setLabelOnlyView(enabled, background): void {
      shell.setLabelOnlyView(enabled, background);
    },

    recalculateSegmentationSuperpixels(regionSize: number): boolean {
      const doc = ensureDocument();
      const input = getImageInput(superpixelInputSource);
      if (!doc || !input) return false;
      superpixelSettings = normalizeSuperpixelSettings({ ...superpixelSettings, regionSize });
      smartPreview = null;
      superpixelResult = superpixelCache.getOrCreate(
        { cacheKey: input.cacheKey, width: doc.width, height: doc.height, rgba: input.rgba },
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
      smartPreview = null;
      superpixelResult = null;
      superpixelCache.clear();
      removeSuperpixelOverlayLayer();
      return true;
    },

    startSegmentationSuperpixelPaint(pointer: CanvasPoint, mode: "add" | "remove"): boolean {
      const doc = ensureDocument();
      if (!doc || !superpixelResult) return false;
      if (mode === "add" && !canPaintWithActiveClass()) return false;
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

    startSegmentationSmartGrow(pointer: CanvasPoint, mode: "add" | "remove"): boolean {
      if (mode === "add" && !canPaintWithActiveClass()) return false;
      return buildSmartPreview(pointer, mode);
    },

    applySegmentationSmartGrow(pointer: CanvasPoint, similarity: number, edgeStop: number, mode: "add" | "remove" = "add"): boolean {
      if (mode === "add" && !canPaintWithActiveClass()) return false;
      smartGrowSimilarity = Math.min(1, Math.max(0, similarity));
      smartGrowEdgeStop = Math.min(1, Math.max(0, edgeStop));
      return buildSmartPreview(pointer, mode);
    },

    getSegmentationSmartPreview(): SegmentationSmartPreviewSummary | null {
      return getSmartPreviewSummary();
    },

    applySegmentationSmartPreview(): boolean {
      const doc = ensureDocument();
      if (!doc || !smartPreview) return false;
      if (smartPreview.mode === "add" && !canPaintWithActiveClass()) return false;
      const before = doc.cloneSnapshot();
      const nextClassId = smartPreview.mode === "remove" ? 0 : Number.parseInt(smartPreview.selection.classId, 10);
      for (const index of smartPreview.selection.pixelIndices) doc.mask[index] = nextClassId;
      const preview = smartPreview;
      smartPreview = null;
      if (preview.mode === "add") selectedRegion = createSelectionFromIndices(doc, preview.selection.classId, [...preview.selection.pixelIndices], preview.seedPoint);
      else clearSelection();
      const changed = doc.pushHistoryFromSnapshot(before);
      requestOverlayRender({ forceMaskFull: true, forceSelectionFull: true, immediate: true });
      if (changed) deps.onDocumentMutation?.();
      if (changed) deps.notify(`Smart Select applied ${preview.regionIds.length} region${preview.regionIds.length === 1 ? "" : "s"} (${preview.selection.pixelCount.toLocaleString()} px).`, 2500);
      return changed;
    },

    discardSegmentationSmartPreview(): boolean {
      return clearSmartPreview();
    },

    setSegmentationSmartGrowSettings(similarity: number, edgeStop: number): void {
      smartGrowSimilarity = Math.min(1, Math.max(0, similarity));
      smartGrowEdgeStop = Math.min(1, Math.max(0, edgeStop));
      if (smartPreview) buildSmartPreview(smartPreview.seedPoint, smartPreview.mode, false, false);
    },

    async startSegmentationAiSelect(pointer: CanvasPoint, label: "positive" | "negative"): Promise<boolean> {
      const doc = ensureDocument();
      if (!doc || doc.activeTool !== "ai-select") return false;
      if (!canPaintWithActiveClass()) return false;
      const x = Math.round(pointer.x);
      const y = Math.round(pointer.y);
      if (x < 0 || y < 0 || x >= doc.width || y >= doc.height) {
        deps.notify("Click inside the image to add an AI prompt.", 3000);
        return false;
      }
      aiPoints.push({ x, y, label });
      renderAiPromptOverlay();
      return await buildAiPreview();
    },

    startSegmentationAiBox(pointer: CanvasPoint): void {
      const doc = ensureDocument();
      if (!doc || doc.activeTool !== "ai-select") return;
      if (!canPaintWithActiveClass()) return;
      aiBoxStart = { x: Math.max(0, Math.min(doc.width - 1, pointer.x)), y: Math.max(0, Math.min(doc.height - 1, pointer.y)) };
      aiBox = { left: aiBoxStart.x, top: aiBoxStart.y, right: aiBoxStart.x, bottom: aiBoxStart.y };
      renderAiPromptOverlay();
      canvas.requestRenderAll();
    },

    continueSegmentationAiBox(pointer: CanvasPoint): void {
      const doc = ensureDocument();
      if (!doc || !aiBoxStart) return;
      const endX = Math.max(0, Math.min(doc.width - 1, pointer.x));
      const endY = Math.max(0, Math.min(doc.height - 1, pointer.y));
      aiBox = {
        left: Math.min(aiBoxStart.x, endX), top: Math.min(aiBoxStart.y, endY),
        right: Math.max(aiBoxStart.x, endX), bottom: Math.max(aiBoxStart.y, endY)
      };
      renderAiPromptOverlay();
      canvas.requestRenderAll();
    },

    async finishSegmentationAiBox(pointer: CanvasPoint): Promise<boolean> {
      if (!aiBoxStart) return false;
      controller.continueSegmentationAiBox?.(pointer);
      aiBoxStart = null;
      if (!aiBox || aiBox.right - aiBox.left < 2 || aiBox.bottom - aiBox.top < 2) {
        aiBox = null;
        renderAiPromptOverlay();
        return false;
      }
      return await buildAiPreview();
    },

    getSegmentationAiPreview(): SegmentationAiPreviewSummary | null {
      return getAiPreviewSummary();
    },

    applySegmentationAiPreview(): boolean {
      const doc = ensureDocument();
      if (!doc || !aiPreview) return false;
      if (!canPaintWithActiveClass()) return false;
      const before = doc.cloneSnapshot();
      const classId = Number.parseInt(aiPreview.selection.classId, 10);
      for (const index of aiPreview.selection.pixelIndices) doc.mask[index] = classId;
      const selection = aiPreview.selection;
      aiRegionConstraint = normalizeAiSelectRegionConstraint({
        ...aiRegionConstraint,
        enabled: false,
        source: null,
        rect: null,
        detectionLabelId: undefined
      });
      aiRegionConstraintStart = null;
      isDrawingAiRegionConstraint = false;
      clearAiPreview();
      selectedRegion = selection;
      const changed = doc.pushHistoryFromSnapshot(before);
      requestOverlayRender({ forceMaskFull: true, forceSelectionFull: true, immediate: true });
      if (changed) {
        deps.onDocumentMutation?.();
        deps.notify(`AI Select applied ${selection.pixelCount.toLocaleString()} px.`, 2500);
      }
      return changed;
    },

    discardSegmentationAiPreview(): boolean {
      return clearAiPreview();
    },

    getEdgeSamStatus() {
      return deps.edgeSamService?.getStatus() ?? { phase: "error" as const, backend: null, imageCacheKey: null, encoderRuns: 0, message: "AI Select service is unavailable" };
    },

    getSegmentationAiRegionConstraint(): AiSelectRegionConstraint {
      return normalizeAiSelectRegionConstraint(aiRegionConstraint);
    },

    async setSegmentationAiRegionConstraint(config: Partial<AiSelectRegionConstraint>): Promise<boolean> {
      const next = normalizeAiSelectRegionConstraint({ ...aiRegionConstraint, ...config, margin: { ...aiRegionConstraint.margin, ...config.margin } });
      const changed = JSON.stringify(next) !== JSON.stringify(aiRegionConstraint);
      if (!changed) return false;
      aiRegionConstraint = next;
      aiPreview = null;
      aiRequestRevision += 1;
      renderAiPromptOverlay();
      requestOverlayRender({ forceSelectionFull: true, immediate: true });
      if (aiPoints.length || aiBox) await buildAiPreview();
      return true;
    },

    beginSegmentationAiRegionConstraint(): boolean {
      const doc = ensureDocument();
      if (!doc) return false;
      isDrawingAiRegionConstraint = true;
      aiRegionConstraintStart = null;
      deps.notify("Drag on the image to set the AI Select ROI.", 2500);
      return true;
    },

    cancelSegmentationAiRegionConstraint(): boolean {
      const changed = isDrawingAiRegionConstraint || aiRegionConstraintStart !== null;
      isDrawingAiRegionConstraint = false;
      aiRegionConstraintStart = null;
      renderAiPromptOverlay();
      canvas.requestRenderAll();
      return changed;
    },

    isSegmentationAiRegionConstraintDrawing(): boolean {
      return isDrawingAiRegionConstraint;
    },

    startSegmentationAiRegionConstraint(pointer: CanvasPoint): void {
      const doc = ensureDocument();
      if (!doc || !isDrawingAiRegionConstraint) return;
      aiRegionConstraintStart = { x: Math.max(0, Math.min(doc.width - 1, pointer.x)), y: Math.max(0, Math.min(doc.height - 1, pointer.y)) };
      aiRegionConstraint = normalizeAiSelectRegionConstraint({ ...aiRegionConstraint, enabled: true, source: "manual", rect: { x: aiRegionConstraintStart.x, y: aiRegionConstraintStart.y, width: 1, height: 1 } });
      renderAiPromptOverlay();
    },

    continueSegmentationAiRegionConstraint(pointer: CanvasPoint): void {
      const doc = ensureDocument();
      if (!doc || !aiRegionConstraintStart) return;
      const endX = Math.max(0, Math.min(doc.width, pointer.x));
      const endY = Math.max(0, Math.min(doc.height, pointer.y));
      aiRegionConstraint = normalizeAiSelectRegionConstraint({
        ...aiRegionConstraint,
        enabled: true,
        source: "manual",
        rect: { x: Math.min(aiRegionConstraintStart.x, endX), y: Math.min(aiRegionConstraintStart.y, endY), width: Math.abs(endX - aiRegionConstraintStart.x), height: Math.abs(endY - aiRegionConstraintStart.y) }
      });
      renderAiPromptOverlay();
      canvas.requestRenderAll();
    },

    async finishSegmentationAiRegionConstraint(pointer: CanvasPoint): Promise<boolean> {
      if (!aiRegionConstraintStart) return false;
      controller.continueSegmentationAiRegionConstraint?.(pointer);
      aiRegionConstraintStart = null;
      isDrawingAiRegionConstraint = false;
      const doc = ensureDocument();
      const rect = doc ? getActiveAiSelectRegionRect(aiRegionConstraint, doc) : null;
      if (!rect || rect.width < 2 || rect.height < 2) {
        aiRegionConstraint = { ...aiRegionConstraint, enabled: false, source: null, rect: null };
        renderAiPromptOverlay();
        deps.notify("AI Select ROI must be at least 2 px wide and high.", 2500);
        return false;
      }
      aiPreview = null;
      aiRequestRevision += 1;
      renderAiPromptOverlay();
      requestOverlayRender({ forceSelectionFull: true, immediate: true });
      if (aiPoints.length || aiBox) await buildAiPreview();
      return true;
    },

    getSegmentationPreprocessingConfig(): SegmentationPreprocessingConfig {
      return { ...preprocessingConfig };
    },

    setSegmentationPreprocessingConfig(config: Partial<SegmentationPreprocessingConfig>): boolean {
      const next = normalizeSegmentationPreprocessingConfig({ ...preprocessingConfig, ...config });
      if (next.mode === preprocessingConfig.mode && next.blurStrength === preprocessingConfig.blurStrength && next.edgeWeight === preprocessingConfig.edgeWeight) return false;
      preprocessingConfig = next;
      clearProcessedImageCache();
      if (viewSource === "processed") refreshViewSource();
      if (superpixelInputSource === "processed") {
        const regionSize = superpixelResult?.regionSize ?? null;
        smartPreview = null;
        superpixelResult = null;
        superpixelCache.clear();
        removeSuperpixelOverlayLayer();
        if (regionSize) controller.recalculateSegmentationSuperpixels?.(regionSize);
      }
      if (edgeSamInputSource === "processed") void prepareEdgeSamImage();
      return true;
    },

    setSegmentationViewSource(source: SegmentationImageSourceMode): boolean {
      if (viewSource === source) return false;
      viewSource = source;
      return refreshViewSource();
    },

    getSegmentationViewSource(): SegmentationImageSourceMode {
      return viewSource;
    },

    setSegmentationEdgeSamInputSource(source: SegmentationImageSourceMode): boolean {
      if (edgeSamInputSource === source) return false;
      edgeSamInputSource = source;
      void prepareEdgeSamImage();
      return true;
    },

    getSegmentationEdgeSamInputSource(): SegmentationImageSourceMode {
      return edgeSamInputSource;
    },

    setSegmentationSuperpixelInputSource(source: SegmentationImageSourceMode): boolean {
      if (superpixelInputSource === source) return false;
      const regionSize = superpixelResult?.regionSize ?? null;
      superpixelInputSource = source;
      smartPreview = null;
      superpixelResult = null;
      superpixelCache.clear();
      removeSuperpixelOverlayLayer();
      if (regionSize) controller.recalculateSegmentationSuperpixels?.(regionSize);
      return true;
    },

    getSegmentationSuperpixelInputSource(): SegmentationImageSourceMode {
      return superpixelInputSource;
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
      hasExplicitPaintClassSelection = true;
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
      const summary = ensureDocument()?.getSummary() ?? createEmptySummary();
      const smartPreview = getSmartPreviewSummary();
      const aiPreview = getAiPreviewSummary();
      return {
        ...summary,
        requiresClassSelection: !hasExplicitPaintClassSelection,
        ...(smartPreview ? { smartPreview } : {}),
        ...(aiPreview ? { aiPreview } : {})
      };
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
      hasExplicitPaintClassSelection = snapshot.mask.some((classId) => classId !== 0);
      doc.clearHistory();
      clearSelection();
      smartPreview = null;
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
      if (smartPreviewOverlayLayer) {
        smartPreviewOverlayLayer.object.set("visible", active && smartPreview !== null);
      }
      if (!active) {
        controller.cancelSegmentationPolygon?.();
        clearPolygonPreview();
        smartPreview = null;
        canvas.discardActiveObject();
      } else if (polygonPoints.length > 0) {
        renderPolygonPreview();
      }
      canvas.requestRenderAll();
    }
  };

  return controller;
}
