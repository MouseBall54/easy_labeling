import { describe, expect, it, vi } from "vitest";

import { createCanvasController, type CanvasControllerDeps, type CanvasControllerState } from "../../../../src/features/canvas/canvas-controller.js";
import { createFakeFabricRuntime, createRect, FakeCanvas } from "./test-fakes.js";

function createState(overrides: Partial<CanvasControllerState> = {}): CanvasControllerState {
  return {
    currentMode: "edit",
    currentImage: { width: 200, height: 100 },
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
    getCanvasContainerSize: () => ({ width: 800, height: 600 }),
    promptForLabelClass: vi.fn(async () => "0"),
    updateLabelList: vi.fn(),
    updateZoomDisplay: vi.fn(),
    getDisplayNameForClass: (labelClass) => `class-${labelClass ?? "0"}`,
    notify: vi.fn(),
    ...overrides
  };
}

describe("features/canvas/canvas-controller", () => {
  it("keeps labelClass, originalYolo, and linked _labelText when importing YOLO rows", () => {
    const deps = createDeps();
    const controller = createCanvasController(createState(), deps);

    controller.addLabelsFromYolo("3 0.250000000000000 0.400000000000000 0.200000000000000 0.500000000000000\n");

    const rect = controller.getObjects("rect")[0];
    expect(rect?.labelClass).toBe("3");
    expect(rect?.originalYolo).toEqual({
      x_center: "0.250000000000000",
      y_center: "0.400000000000000",
      width: "0.200000000000000",
      height: "0.500000000000000"
    });
    expect(rect?._labelText?.type).toBe("text");

    expect(controller.getLabelsAsYolo()).toBe("3 0.250000000000000 0.400000000000000 0.200000000000000 0.500000000000000\n");
  });

  it("applies legacy selected stroke highlighting and restores class color", () => {
    const deps = createDeps({ getColorForClass: (labelClass) => `color-${labelClass ?? "none"}` });
    const controller = createCanvasController(createState(), deps);
    const rect = createRect({ left: 10, top: 20, width: 30, height: 40, labelClass: "5" });
    controller.canvas.add(rect);

    controller.canvas.setActiveObject(rect);
    controller.highlightSelection();
    expect(rect.stroke).toBe("#ff0000");
    expect(rect.strokeDashArray).toEqual([10, 5]);

    controller.canvas.discardActiveObject();
    controller.highlightSelection();
    expect(rect.stroke).toBe("color-5");
    expect(rect.strokeDashArray).toEqual([]);
  });

  it("wraps DOM images in a Fabric image before setting the canvas background", () => {
    const fabric = createFakeFabricRuntime();
    const controller = createCanvasController(
      createState(),
      createDeps({ fabric, getCanvasContainerSize: () => ({ width: 640, height: 480 }) })
    );

    const domImage = { width: 200, height: 100 };
    controller.setBackgroundImage(domImage);

    const canvas = controller.canvas as FakeCanvas;
    expect(canvas.backgroundImage).toBeInstanceOf(fabric.Image);
    expect((canvas.backgroundImage as { element: unknown }).element).toBe(domImage);
    expect(canvas.width).toBe(640);
    expect(canvas.height).toBe(480);
  });

  it("discards tiny rectangles and accepts larger draw rectangles via prompt-injected label", async () => {
    const prompt = vi
      .fn<CanvasControllerDeps["promptForLabelClass"]>()
      .mockResolvedValueOnce("7");
    const updateLabelList = vi.fn();
    const controller = createCanvasController(
      createState({ currentMode: "draw" }),
      createDeps({ promptForLabelClass: prompt, updateLabelList, getColorForClass: (labelClass) => `c-${labelClass ?? "0"}` })
    );

    controller.startDrawing({ x: 10, y: 10 });
    controller.continueDrawing({ x: 12, y: 12 });
    await controller.finishDrawing();
    expect(controller.getObjects("rect")).toHaveLength(0);

    controller.startDrawing({ x: 10, y: 10 });
    controller.continueDrawing({ x: 40, y: 30 });
    await controller.finishDrawing();

    const rects = controller.getObjects("rect");
    expect(rects).toHaveLength(1);
    expect(rects[0].labelClass).toBe("7");
    expect(rects[0].originalYolo).toBeUndefined();
    expect(rects[0]._labelText?.type).toBe("text");
    expect(updateLabelList).toHaveBeenCalledTimes(1);
  });

  it("clears originalYolo on single and multi label edits", async () => {
    const fabric = createFakeFabricRuntime();
    const controller = createCanvasController(
      createState(),
      createDeps({
        fabric,
        promptForLabelClass: vi.fn<CanvasControllerDeps["promptForLabelClass"]>().mockResolvedValue("11"),
        getColorForClass: (labelClass) => `p-${labelClass ?? "0"}`
      })
    );

    const rectA = createRect({
      left: 5,
      top: 6,
      width: 10,
      height: 12,
      labelClass: "1",
      originalYolo: { x_center: "0.1", y_center: "0.2", width: "0.3", height: "0.4" }
    });
    const rectB = createRect({
      left: 7,
      top: 8,
      width: 9,
      height: 10,
      labelClass: "2",
      originalYolo: { x_center: "0.5", y_center: "0.6", width: "0.1", height: "0.2" }
    });
    controller.canvas.add(rectA, rectB);
    controller.drawLabelText(rectA);
    controller.drawLabelText(rectB);

    await controller.editLabel(rectA);
    expect(rectA.labelClass).toBe("11");
    expect(rectA.originalYolo).toBeNull();

    const selection = new fabric.ActiveSelection([rectA, rectB], { canvas: controller.canvas });
    await controller.editMultipleLabels(selection);

    expect(rectA.labelClass).toBe("11");
    expect(rectB.labelClass).toBe("11");
    expect(rectA.originalYolo).toBeNull();
    expect(rectB.originalYolo).toBeNull();
  });

  it("recalculates Fabric offsets after viewport and size changes", () => {
    const controller = createCanvasController(createState(), createDeps());
    const canvas = controller.canvas as FakeCanvas;

    controller.setBackgroundImage({ width: 200, height: 100 });
    controller.setZoomPercentage("150");
    controller.zoom(1.2);
    controller.resetZoom();
    controller.resizeCanvas();
    controller.goToCoords(25, 30);

    expect(canvas.calcOffsetCalls).toBe(6);
  });

  it("anchors label text to bounding rect coordinates even during active selection grouping", () => {
    const controller = createCanvasController(createState(), createDeps());
    const rect = createRect({ left: 10, top: 20, width: 30, height: 40, labelClass: "2" });
    rect.group = { left: 100, top: 200, width: 60, height: 60 };
    controller.canvas.add(rect);
    controller.drawLabelText(rect);

    controller.updateLabelText(rect);

    expect(rect._labelText?.left).toBe(10);
    expect(rect._labelText?.top).toBe(16);
  });

  it("resets previous active selection before selecting all labels", () => {
    const controller = createCanvasController(createState(), createDeps());
    const canvas = controller.canvas as FakeCanvas;
    const rectA = createRect({ left: 1, top: 2, width: 10, height: 12, labelClass: "1" });
    const rectB = createRect({ left: 20, top: 30, width: 8, height: 6, labelClass: "2" });
    controller.canvas.add(rectA, rectB);

    controller.selectAllLabels();
    const firstSelection = canvas.getActiveObject();
    controller.selectAllLabels();

    expect(firstSelection?.type).toBe("activeSelection");
    expect(canvas.getActiveObject()?.type).toBe("activeSelection");
    expect(rectA.left).toBe(1);
    expect(rectA.top).toBe(2);
    expect(rectB.left).toBe(20);
    expect(rectB.top).toBe(30);
  });
});
