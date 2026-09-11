import { describe, expect, it, vi } from "vitest";

import { createCanvasControllerForWorkflow, type CanvasControllerDeps, type CanvasControllerState } from "../../../../src/features/canvas/canvas-controller.js";
import type { FabricCircleLike } from "../../../../src/features/canvas/fabric-types.js";
import { createFakeFabricRuntime } from "../canvas/test-fakes.js";

function createState(overrides: Partial<CanvasControllerState> = {}): CanvasControllerState {
  return {
    currentMode: "edit",
    currentImage: { width: 32, height: 24 },
    labelFolderHandle: {},
    showLabelsOnCanvas: true,
    labelFontSize: 14,
    isCrosshairVisible: false,
    lastMousePosition: { x: 0, y: 0 },
    labelSortOrder: "asc",
    ...overrides
  };
}

function createDeps(overrides: Partial<CanvasControllerDeps> = {}): CanvasControllerDeps {
  return {
    fabric: createFakeFabricRuntime(),
    getCanvasContainerSize: () => ({ width: 640, height: 480 }),
    promptForLabelClass: vi.fn(async () => "1"),
    updateLabelList: vi.fn(),
    updateZoomDisplay: vi.fn(),
    getDisplayNameForClass: (labelClass) => `class-${labelClass ?? "0"}`,
    notify: vi.fn(),
    ...overrides
  };
}

async function drawStroke(
  controller: ReturnType<typeof createCanvasControllerForWorkflow>,
  points: Array<{ x: number; y: number }>
): Promise<void> {
  const firstPoint = points[0];
  if (!firstPoint) {
    return;
  }
  controller.startDrawing(firstPoint);
  points.slice(1).forEach((point) => {
    controller.continueDrawing(point);
  });
  await controller.finishDrawing();
}

function createClosedSquarePoints(): Array<{ x: number; y: number }> {
  return [
    { x: 5, y: 5 },
    { x: 14, y: 5 },
    { x: 14, y: 14 },
    { x: 5, y: 14 },
    { x: 5, y: 5 }
  ];
}

function createOpenSquarePoints(): Array<{ x: number; y: number }> {
  return [
    { x: 5, y: 5 },
    { x: 14, y: 5 },
    { x: 14, y: 14 },
    { x: 5, y: 14 }
  ];
}

describe("features/segmentation/workflow", () => {
  it("fills a polygon as one undoable mask operation", () => {
    const controller = createCanvasControllerForWorkflow("segmentation", createState({ currentMode: "draw" }), createDeps());
    controller.setBackgroundImage({ width: 16, height: 16 });
    controller.setSegmentationActiveClass?.("3");
    controller.setSegmentationTool?.("polygon");
    controller.startDrawing({ x: 2, y: 2 });
    controller.startDrawing({ x: 12, y: 2 });
    controller.startDrawing({ x: 2, y: 12 });

    expect(controller.isSegmentationPolygonDrawing?.()).toBe(true);
    expect(controller.finishSegmentationPolygon?.()).toBe(true);
    expect(controller.getSegmentationClassAtPoint?.({ x: 3, y: 3 })).toBe("3");
    expect(controller.canUndo()).toBe(true);

    controller.undo();
    expect(controller.getSegmentationClassAtPoint?.({ x: 3, y: 3 })).toBeNull();
    controller.redo();
    expect(controller.getSegmentationClassAtPoint?.({ x: 3, y: 3 })).toBe("3");
  });

  it("cancels an unfinished polygon without changing its mask or history", () => {
    const controller = createCanvasControllerForWorkflow("segmentation", createState({ currentMode: "draw" }), createDeps());
    controller.setBackgroundImage({ width: 16, height: 16 });
    controller.setSegmentationTool?.("polygon");
    controller.startDrawing({ x: 2, y: 2 });
    controller.startDrawing({ x: 12, y: 2 });

    expect(controller.getSegmentationPolygonVertexCount?.()).toBe(2);
    expect(controller.cancelSegmentationPolygon?.()).toBe(true);
    expect(controller.isSegmentationPolygonDrawing?.()).toBe(false);
    expect(controller.canUndo()).toBe(false);
  });

  it("keeps an AI Select mask as a preview until confirm and discards it without a document mutation", async () => {
    const mask = new Uint8Array(16 * 16);
    mask[5 * 16 + 5] = 1;
    mask[5 * 16 + 6] = 1;
    const onDocumentMutation = vi.fn();
    const edgeSamService = {
      prepareImage: vi.fn(),
      decode: vi.fn(async () => ({ width: 16, height: 16, mask, score: 0.9 })),
      clear: vi.fn(),
      dispose: vi.fn(),
      getStatus: () => ({ phase: "ready" as const, backend: "wasm" as const, imageCacheKey: "test", encoderRuns: 1, message: null })
    };
    const controller = createCanvasControllerForWorkflow(
      "segmentation",
      createState({ currentMode: "draw", currentImage: { width: 16, height: 16 } }),
      createDeps({ edgeSamService, onDocumentMutation })
    );
    controller.setBackgroundImage({ width: 16, height: 16 });
    controller.setSegmentationTool?.("ai-select");

    await controller.startSegmentationAiSelect?.({ x: 5, y: 5 }, "positive");
    expect(controller.getSegmentationClassAtPoint?.({ x: 5, y: 5 })).toBeNull();
    expect(onDocumentMutation).not.toHaveBeenCalled();
    expect(controller.getSegmentationAiPreview?.()).toMatchObject({
      classId: "1",
      pixelCount: 2,
      pointCount: 1,
      hasBox: false,
      score: 0.9
    });

    expect(controller.discardSegmentationAiPreview?.()).toBe(true);
    expect(controller.getSegmentationAiPreview?.()).toBeNull();
    expect(controller.getSegmentationClassAtPoint?.({ x: 5, y: 5 })).toBeNull();
    expect(onDocumentMutation).not.toHaveBeenCalled();

    await controller.setSegmentationAiRegionConstraint?.({
      enabled: true,
      source: "manual",
      rect: { x: 4, y: 4, width: 4, height: 4 }
    });
    await controller.startSegmentationAiSelect?.({ x: 5, y: 5 }, "positive");
    expect(controller.getSegmentationAiRegionConstraint?.()).toMatchObject({ enabled: true, source: "manual" });
    expect(controller.applySegmentationAiPreview?.()).toBe(true);
    expect(controller.getSegmentationClassAtPoint?.({ x: 5, y: 5 })).toBe("1");
    expect(controller.getSegmentationAiRegionConstraint?.()).toMatchObject({ enabled: false, source: null, rect: null });
    expect(onDocumentMutation).toHaveBeenCalledOnce();
  });

  it("keeps AI Select prompt markers at a pointer-sized screen scale when the view zoom changes", async () => {
    const mask = new Uint8Array(16 * 16);
    mask[5 * 16 + 5] = 1;
    const edgeSamService = {
      prepareImage: vi.fn(),
      decode: vi.fn(async () => ({ width: 16, height: 16, mask, score: 0.9 })),
      clear: vi.fn(),
      dispose: vi.fn(),
      getStatus: () => ({ phase: "ready" as const, backend: "wasm" as const, imageCacheKey: "test", encoderRuns: 1, message: null })
    };
    const controller = createCanvasControllerForWorkflow(
      "segmentation",
      createState({ currentMode: "draw", currentImage: { width: 16, height: 16 } }),
      createDeps({ edgeSamService })
    );
    controller.setBackgroundImage({ width: 16, height: 16 });
    controller.setSegmentationTool?.("ai-select");

    await controller.startSegmentationAiSelect?.({ x: 5, y: 5 }, "positive");
    const initialMarker = controller.canvas.getObjects("circle").at(-1) as FabricCircleLike | undefined;
    expect(initialMarker?.radius).toBeCloseTo(6 / controller.canvas.getZoom());

    controller.canvas.setZoom(0.25);
    controller.updateAllLabelTexts();
    const zoomedMarker = controller.canvas.getObjects("circle").at(-1) as FabricCircleLike | undefined;
    expect(zoomedMarker?.radius).toBeCloseTo(24);
    expect((zoomedMarker?.radius ?? 0) * controller.canvas.getZoom()).toBeCloseTo(6);
  });

  it("keeps Brush available when AI Select decoding fails", async () => {
    const edgeSamService = {
      prepareImage: vi.fn(),
      decode: vi.fn(async () => { throw new Error("decoder failed"); }),
      clear: vi.fn(),
      dispose: vi.fn(),
      getStatus: () => ({ phase: "ready" as const, backend: "wasm" as const, imageCacheKey: "test", encoderRuns: 1, message: null })
    };
    const controller = createCanvasControllerForWorkflow(
      "segmentation",
      createState({ currentMode: "draw" }),
      createDeps({ edgeSamService })
    );
    controller.setBackgroundImage({ width: 16, height: 16 });
    controller.setSegmentationTool?.("ai-select");

    await expect(controller.startSegmentationAiSelect?.({ x: 5, y: 5 }, "positive")).resolves.toBe(false);

    controller.setSegmentationTool?.("brush");
    controller.setSegmentationActiveClass?.("2");
    await drawStroke(controller, [{ x: 5, y: 5 }]);
    expect(controller.getSegmentationClassAtPoint?.({ x: 5, y: 5 })).toBe("2");
  });

  it("invalidates the active superpixel result only when settings change", () => {
    const controller = createCanvasControllerForWorkflow("segmentation", createState(), createDeps());
    controller.setBackgroundImage({ width: 16, height: 16 });
    expect(controller.setSegmentationSuperpixelSettings?.({ blur: "high" })).toBe(true);
    expect(controller.getSegmentationSuperpixelSettings?.()).toMatchObject({ blur: "high" });
    expect(controller.setSegmentationSuperpixelSettings?.({ blur: "high" })).toBe(false);
  });

  it("keeps display changes separate from EdgeSAM input and invalidates processed embeddings on preprocessing changes", async () => {
    const sourcePixels = new Uint8ClampedArray(16 * 16 * 4).fill(120);
    for (let index = 3; index < sourcePixels.length; index += 4) sourcePixels[index] = 255;
    const source = { width: 16, height: 16, rgba: sourcePixels };
    const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
    const fakeDocument = {
      createElement: () => {
        let pixels = new Uint8ClampedArray(sourcePixels);
        const context = {
          drawImage: (image: typeof source) => { pixels = new Uint8ClampedArray(image.rgba); },
          getImageData: () => ({ width: 16, height: 16, data: new Uint8ClampedArray(pixels) }),
          createImageData: () => ({ width: 16, height: 16, data: new Uint8ClampedArray(16 * 16 * 4) }),
          putImageData: (imageData: { data: Uint8ClampedArray }) => { pixels = new Uint8ClampedArray(imageData.data); }
        };
        return { width: 16, height: 16, dataset: {}, getContext: () => context };
      }
    };
    Object.defineProperty(globalThis, "document", { configurable: true, value: fakeDocument });
    const edgeSamService = {
      prepareImage: vi.fn(async () => ({ phase: "ready" as const, backend: "wasm" as const, imageCacheKey: null, encoderRuns: 1, message: null })),
      decode: vi.fn(), clear: vi.fn(), dispose: vi.fn(),
      getStatus: () => ({ phase: "ready" as const, backend: "wasm" as const, imageCacheKey: null, encoderRuns: 1, message: null })
    };
    try {
      const controller = createCanvasControllerForWorkflow(
        "segmentation",
        createState({ currentImage: { width: 16, height: 16 } }),
        createDeps({ edgeSamService })
      );
      controller.setBackgroundImage(source);
      await Promise.resolve();
      expect(edgeSamService.prepareImage).toHaveBeenLastCalledWith(expect.objectContaining({ cacheKey: "local-image:1:original" }));

      const callsBeforeSuperpixelSourceChange = edgeSamService.prepareImage.mock.calls.length;
      expect(controller.setSegmentationSuperpixelInputSource?.("processed")).toBe(true);
      expect(controller.recalculateSegmentationSuperpixels?.(8)).toBe(true);
      expect(edgeSamService.prepareImage).toHaveBeenCalledTimes(callsBeforeSuperpixelSourceChange);

      expect(controller.setSegmentationEdgeSamInputSource?.("processed")).toBe(true);
      await Promise.resolve();
      expect(edgeSamService.prepareImage).toHaveBeenLastCalledWith(expect.objectContaining({ cacheKey: "local-image:1:processed:edge-blend:2:0.650" }));
      const callsBeforeViewChange = edgeSamService.prepareImage.mock.calls.length;
      controller.setSegmentationViewSource?.("processed");
      await Promise.resolve();
      expect(edgeSamService.prepareImage).toHaveBeenCalledTimes(callsBeforeViewChange);

      controller.setSegmentationPreprocessingConfig?.({ blurStrength: 3 });
      await Promise.resolve();
      expect(edgeSamService.prepareImage).toHaveBeenLastCalledWith(expect.objectContaining({ cacheKey: "local-image:1:processed:edge-blend:3:0.650" }));
      expect(controller.setSegmentationEdgeSamInputSource?.("original")).toBe(true);
      await Promise.resolve();
      const callsBeforeOriginalConfigChange = edgeSamService.prepareImage.mock.calls.length;
      controller.setSegmentationPreprocessingConfig?.({ blurStrength: 4 });
      await Promise.resolve();
      expect(edgeSamService.prepareImage).toHaveBeenCalledTimes(callsBeforeOriginalConfigChange);
    } finally {
      if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
      else Reflect.deleteProperty(globalThis, "document");
    }
  });

  it("activates segmentation explicitly and paints/erases through the document-backed workflow", async () => {
    const controller = createCanvasControllerForWorkflow("segmentation", createState({ currentMode: "draw" }), createDeps());
    controller.setBackgroundImage({ width: 32, height: 24 });

    controller.setSegmentationActiveClass?.("4");
    controller.setSegmentationTool?.("brush");
    controller.startDrawing({ x: 5, y: 5 });
    controller.continueDrawing({ x: 6, y: 5 });
    await controller.finishDrawing();

    expect(controller.getSegmentationSummary?.()).toEqual({
      activeClassId: "4",
      activeTool: "brush",
      brushRadius: 6,
      overlayVisible: true,
      overlayOpacity: 0.6,
      edgeHighlightVisible: true,
      edgeHighlightIntensity: 0.7,
      visibleClassIds: ["4"],
      allClassIds: ["4"],
      hiddenClassIds: []
    });
    expect(controller.canUndo()).toBe(true);
    expect(controller.getObjects("image").filter((object) => {
      return (object as { _isSegmentationOverlay?: boolean })._isSegmentationOverlay;
    })).toHaveLength(1);

    controller.setSegmentationTool?.("erase");
    controller.startDrawing({ x: 5, y: 5 });
    controller.continueDrawing({ x: 6, y: 5 });
    await controller.finishDrawing();
    expect(controller.getSegmentationSummary?.()?.visibleClassIds).toEqual([]);
  });

  it("uses document-level undo/redo and overlay state controls", async () => {
    const controller = createCanvasControllerForWorkflow("segmentation", createState({ currentMode: "draw" }), createDeps());
    controller.setBackgroundImage({ width: 16, height: 16 });
    controller.startDrawing({ x: 2, y: 2 });
    await controller.finishDrawing();

    controller.setSegmentationOverlayVisibility?.(false);
    controller.setSegmentationOverlayOpacity?.(0.2);
    controller.setSegmentationEdgeHighlightVisible?.(false);
    controller.setSegmentationEdgeHighlightIntensity?.(0.3);
    expect(controller.getSegmentationSummary?.()?.overlayVisible).toBe(false);
    expect(controller.getSegmentationSummary?.()?.overlayOpacity).toBe(0.2);
    expect(controller.getSegmentationSummary?.()?.edgeHighlightVisible).toBe(false);
    expect(controller.getSegmentationSummary?.()?.edgeHighlightIntensity).toBe(0.3);

    controller.undo();
    expect(controller.getSegmentationSummary?.()?.visibleClassIds).toEqual([]);
    expect(controller.getSegmentationSummary?.()?.edgeHighlightVisible).toBe(false);
    expect(controller.canRedo()).toBe(true);

    controller.redo();
    expect(controller.getSegmentationSummary?.()?.visibleClassIds).toEqual(["1"]);
  });

  it("supports segmentation-only class filtering and relabeling an existing painted region", async () => {
    const controller = createCanvasControllerForWorkflow("segmentation", createState({ currentMode: "draw" }), createDeps());
    controller.setBackgroundImage({ width: 16, height: 16 });

    controller.setSegmentationActiveClass?.("2");
    controller.startDrawing({ x: 3, y: 3 });
    await controller.finishDrawing();

    controller.setSegmentationActiveClass?.("6");
    controller.startDrawing({ x: 12, y: 12 });
    await controller.finishDrawing();

    controller.setSegmentationOnlyVisibleClass?.("2");
    expect(controller.getSegmentationSummary?.()?.visibleClassIds).toEqual(["2"]);
    expect(controller.getSegmentationSummary?.()?.activeClassId).toBe("6");

    const sourceClass = controller.getSegmentationClassAtPoint?.({ x: 3, y: 3 });
    expect(sourceClass).toBe("2");
    const changed = controller.relabelSegmentationRegionAtPoint?.({ x: 3, y: 3 }, "9");
    expect(changed).toBe(true);
    expect(controller.getSegmentationClassAtPoint?.({ x: 3, y: 3 })).toBe("9");
  });

  it("uses edit mode click to select a connected segmentation region without painting", async () => {
    const state = createState({ currentMode: "draw" });
    const controller = createCanvasControllerForWorkflow("segmentation", state, createDeps());
    controller.setBackgroundImage({ width: 16, height: 16 });

    controller.setSegmentationBrushRadius?.(1);
    controller.setSegmentationActiveClass?.("4");
    controller.startDrawing({ x: 5, y: 5 });
    await controller.finishDrawing();

    state.currentMode = "edit";
    controller.startDrawing({ x: 10, y: 10 });
    await controller.finishDrawing();
    expect(controller.getSegmentationClassAtPoint?.({ x: 10, y: 10 })).toBeNull();

    const selected = controller.selectSegmentationRegionAtPoint?.({ x: 5, y: 5 });
    expect(selected).toBe(true);
    expect(controller.getSegmentationSummary?.()?.activeClassId).toBe("4");
  });

  it("moves the selected segmentation region in edit mode and supports undo", async () => {
    const state = createState({ currentMode: "draw" });
    const controller = createCanvasControllerForWorkflow("segmentation", state, createDeps());
    controller.setBackgroundImage({ width: 16, height: 16 });

    controller.setSegmentationActiveClass?.("4");
    controller.startDrawing({ x: 5, y: 5 });
    await controller.finishDrawing();

    state.currentMode = "edit";
    expect(controller.selectSegmentationRegionAtPoint?.({ x: 5, y: 5 })).toBe(true);
    expect(controller.startSegmentationRegionMove?.({ x: 5, y: 5 })).toBe(true);
    expect(controller.continueSegmentationRegionMove?.({ x: 11, y: 10 })).toBe(true);
    await controller.finishSegmentationRegionMove?.();

    expect(controller.getSegmentationClassAtPoint?.({ x: 5, y: 5 })).toBeNull();
    expect(controller.getSegmentationClassAtPoint?.({ x: 11, y: 10 })).toBe("4");
    controller.undo();
    expect(controller.getSegmentationClassAtPoint?.({ x: 5, y: 5 })).toBe("4");
  });

  it("relabels the currently selected segmentation region and supports undo", async () => {
    const state = createState({ currentMode: "draw" });
    const controller = createCanvasControllerForWorkflow("segmentation", state, createDeps());
    controller.setBackgroundImage({ width: 16, height: 16 });

    controller.setSegmentationBrushRadius?.(1);
    controller.setSegmentationActiveClass?.("4");
    controller.startDrawing({ x: 5, y: 5 });
    await controller.finishDrawing();

    state.currentMode = "edit";
    expect(controller.selectSegmentationRegionAtPoint?.({ x: 5, y: 5 })).toBe(true);
    expect(controller.getSelectedSegmentationClass?.()).toBe("4");
    expect(controller.relabelSelectedSegmentationRegion?.("9")).toBe(true);
    expect(controller.getSegmentationClassAtPoint?.({ x: 5, y: 5 })).toBe("9");
    expect(controller.getSelectedSegmentationClass?.()).toBe("9");

    controller.undo();
    expect(controller.getSegmentationClassAtPoint?.({ x: 5, y: 5 })).toBe("4");
    expect(controller.getSelectedSegmentationClass?.()).toBeNull();
  });

  it("deletes the selected segmentation region to background and supports undo", async () => {
    const state = createState({ currentMode: "draw" });
    const controller = createCanvasControllerForWorkflow("segmentation", state, createDeps());
    controller.setBackgroundImage({ width: 16, height: 16 });

    controller.setSegmentationBrushRadius?.(1);
    controller.setSegmentationActiveClass?.("4");
    controller.startDrawing({ x: 5, y: 5 });
    await controller.finishDrawing();

    state.currentMode = "edit";
    expect(controller.selectSegmentationRegionAtPoint?.({ x: 5, y: 5 })).toBe(true);
    expect(controller.deleteSelectedSegmentationRegion?.()).toBe(true);
    expect(controller.getSegmentationClassAtPoint?.({ x: 5, y: 5 })).toBeNull();
    expect(controller.getSelectedSegmentationClass?.()).toBeNull();

    controller.undo();
    expect(controller.getSegmentationClassAtPoint?.({ x: 5, y: 5 })).toBe("4");
  });

  it("updates segmentation brush radius from the tool-size control API", () => {
    const controller = createCanvasControllerForWorkflow("segmentation", createState(), createDeps());
    controller.setBackgroundImage({ width: 16, height: 16 });

    controller.setSegmentationBrushRadius?.(12);
    expect(controller.getSegmentationSummary?.()?.brushRadius).toBe(12);
  });

  it("defaults closed-region auto fill to off and keeps interiors unfilled", async () => {
    const controller = createCanvasControllerForWorkflow("segmentation", createState({ currentMode: "draw" }), createDeps());
    controller.setBackgroundImage({ width: 24, height: 24 });

    expect(controller.getSegmentationAutoFillClosedRegionEnabled?.()).toBe(false);
    controller.setSegmentationBrushRadius?.(1);
    controller.setSegmentationActiveClass?.("4");
    await drawStroke(controller, createClosedSquarePoints());

    expect(controller.getSegmentationClassAtPoint?.({ x: 10, y: 10 })).toBeNull();
  });

  it("fills a closed region on stroke end when auto fill is enabled", async () => {
    const controller = createCanvasControllerForWorkflow("segmentation", createState({ currentMode: "draw" }), createDeps());
    controller.setBackgroundImage({ width: 24, height: 24 });

    controller.setSegmentationAutoFillClosedRegionEnabled?.(true);
    expect(controller.getSegmentationAutoFillClosedRegionEnabled?.()).toBe(true);
    controller.setSegmentationBrushRadius?.(1);
    controller.setSegmentationActiveClass?.("4");
    await drawStroke(controller, createClosedSquarePoints());

    expect(controller.getSegmentationClassAtPoint?.({ x: 10, y: 10 })).toBe("4");
  });

  it("does not fill for open strokes even when auto fill is enabled", async () => {
    const controller = createCanvasControllerForWorkflow("segmentation", createState({ currentMode: "draw" }), createDeps());
    controller.setBackgroundImage({ width: 24, height: 24 });

    controller.setSegmentationAutoFillClosedRegionEnabled?.(true);
    controller.setSegmentationBrushRadius?.(1);
    controller.setSegmentationActiveClass?.("4");
    await drawStroke(controller, createOpenSquarePoints());

    expect(controller.getSegmentationClassAtPoint?.({ x: 10, y: 10 })).toBeNull();
  });

  it("fills closed interiors over existing classes when auto fill is enabled", async () => {
    const controller = createCanvasControllerForWorkflow("segmentation", createState({ currentMode: "draw" }), createDeps());
    controller.setBackgroundImage({ width: 24, height: 24 });

    controller.setSegmentationBrushRadius?.(1);
    controller.setSegmentationActiveClass?.("2");
    await drawStroke(controller, [{ x: 10, y: 10 }]);
    expect(controller.getSegmentationClassAtPoint?.({ x: 10, y: 10 })).toBe("2");

    controller.setSegmentationAutoFillClosedRegionEnabled?.(true);
    controller.setSegmentationActiveClass?.("4");
    await drawStroke(controller, createClosedSquarePoints());

    expect(controller.getSegmentationClassAtPoint?.({ x: 10, y: 10 })).toBe("4");
  });

  it("does not run closed-region auto fill while erase tool is active", async () => {
    const controller = createCanvasControllerForWorkflow("segmentation", createState({ currentMode: "draw" }), createDeps());
    controller.setBackgroundImage({ width: 24, height: 24 });

    controller.setSegmentationBrushRadius?.(1);
    controller.setSegmentationActiveClass?.("4");
    await drawStroke(controller, [{ x: 10, y: 10 }]);
    expect(controller.getSegmentationClassAtPoint?.({ x: 10, y: 10 })).toBe("4");

    controller.setSegmentationAutoFillClosedRegionEnabled?.(true);
    controller.setSegmentationTool?.("erase");
    await drawStroke(controller, createClosedSquarePoints());

    expect(controller.getSegmentationClassAtPoint?.({ x: 10, y: 10 })).toBe("4");
  });

  it("keeps completed erase results after a tool change and deferred rendering", async () => {
    const controller = createCanvasControllerForWorkflow("segmentation", createState({ currentMode: "draw" }), createDeps());
    controller.setBackgroundImage({ width: 24, height: 24 });

    controller.setSegmentationBrushRadius?.(2);
    controller.setSegmentationActiveClass?.("4");
    await drawStroke(controller, [{ x: 10, y: 10 }]);
    expect(controller.getSegmentationClassAtPoint?.({ x: 10, y: 10 })).toBe("4");

    controller.setSegmentationTool?.("erase");
    await drawStroke(controller, [{ x: 10, y: 10 }]);
    expect(controller.getSegmentationClassAtPoint?.({ x: 10, y: 10 })).toBeNull();

    controller.setSegmentationTool?.("brush");
    await Promise.resolve();
    controller.renderAll();
    expect(controller.getSegmentationClassAtPoint?.({ x: 10, y: 10 })).toBeNull();
  });

  it("cancels an in-progress stroke when switching tools so it cannot affect the next tool", async () => {
    const controller = createCanvasControllerForWorkflow("segmentation", createState({ currentMode: "draw" }), createDeps());
    controller.setBackgroundImage({ width: 24, height: 24 });

    controller.setSegmentationBrushRadius?.(2);
    controller.setSegmentationActiveClass?.("4");
    controller.startDrawing({ x: 8, y: 8 });
    expect(controller.getSegmentationClassAtPoint?.({ x: 8, y: 8 })).toBe("4");

    controller.setSegmentationTool?.("erase");
    expect(controller.getSegmentationClassAtPoint?.({ x: 8, y: 8 })).toBeNull();
    expect(controller.canUndo()).toBe(false);

    await controller.finishDrawing();
    expect(controller.getSegmentationSummary?.()?.activeTool).toBe("erase");
    expect(controller.getSegmentationClassAtPoint?.({ x: 8, y: 8 })).toBeNull();
  });

  it("stores stroke and auto fill as a single undo/redo history step", async () => {
    const controller = createCanvasControllerForWorkflow("segmentation", createState({ currentMode: "draw" }), createDeps());
    controller.setBackgroundImage({ width: 24, height: 24 });

    controller.setSegmentationAutoFillClosedRegionEnabled?.(true);
    controller.setSegmentationBrushRadius?.(1);
    controller.setSegmentationActiveClass?.("4");
    await drawStroke(controller, createClosedSquarePoints());

    expect(controller.getSegmentationClassAtPoint?.({ x: 10, y: 10 })).toBe("4");
    expect(controller.canUndo()).toBe(true);

    controller.undo();
    expect(controller.getSegmentationClassAtPoint?.({ x: 10, y: 10 })).toBeNull();
    expect(controller.canUndo()).toBe(false);
    expect(controller.canRedo()).toBe(true);

    controller.redo();
    expect(controller.getSegmentationClassAtPoint?.({ x: 10, y: 10 })).toBe("4");
  });
});
