import { describe, expect, it, vi } from "vitest";

import { createCanvasControllerForWorkflow, type CanvasControllerDeps, type CanvasControllerState } from "../../../../src/features/canvas/canvas-controller.js";
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
      visibleClassIds: ["4"],
      allClassIds: ["4"],
      hiddenClassIds: []
    });
    expect(controller.canUndo()).toBe(true);
    expect(controller.getObjects("image")).toHaveLength(1);

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
    expect(controller.getSegmentationSummary?.()?.overlayVisible).toBe(false);
    expect(controller.getSegmentationSummary?.()?.overlayOpacity).toBe(0.2);

    controller.undo();
    expect(controller.getSegmentationSummary?.()?.visibleClassIds).toEqual([]);
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
