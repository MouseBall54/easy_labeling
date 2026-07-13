import { describe, expect, it, vi } from "vitest";

import { createCanvasController, createCanvasControllerForWorkflow, createCanvasShell, type CanvasControllerDeps, type CanvasControllerState } from "../../../../src/features/canvas/canvas-controller.js";
import { createCanvasHistoryService } from "../../../../src/features/canvas/history.js";
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

function offsetRectBounds(rect: ReturnType<typeof createRect>, offsetX: number, offsetY: number): void {
  const originalGetBoundingRect = rect.getBoundingRect.bind(rect);
  rect.getBoundingRect = (() => {
    const bounds = originalGetBoundingRect();
    return {
      left: bounds.left + offsetX,
      top: bounds.top + offsetY,
      width: bounds.width,
      height: bounds.height
    };
  }) as typeof rect.getBoundingRect;
}

function getSelectionAnnotationIds(activeObject: unknown): string[] {
  if (!activeObject || typeof activeObject !== "object") {
    return [];
  }

  const candidate = activeObject as { getObjects?: () => Array<{ annotationId?: string }> };
  return (candidate.getObjects?.() ?? []).map((obj) => obj.annotationId ?? "").filter((id) => id.length > 0);
}

describe("features/canvas/canvas-controller", () => {

  it("activates the detection adapter explicitly through workflow selection", () => {
    const deps = createDeps();
    const controller = createCanvasControllerForWorkflow("detection", createState(), deps);

    controller.addLabelsFromYolo("3 0.250000000000000 0.400000000000000 0.200000000000000 0.500000000000000\n");

    const rect = controller.getObjects("rect")[0];
    expect(rect?.labelClass).toBe("3");
    expect(controller.getLabelsAsYolo()).toBe("3 0.250000000000000 0.400000000000000 0.200000000000000 0.500000000000000\n");
  });


  it("uses shared shell selection mechanics without rect-only assumptions", () => {
    const fabric = createFakeFabricRuntime();
    const shell = createCanvasShell(createState(), createDeps({ fabric }));
    const textA = new fabric.Text("A", { left: 10, top: 20 });
    const textB = new fabric.Text("B", { left: 30, top: 40 });
    shell.canvas.add(textA, textB);

    shell.setActiveSelection([textA, textB], textB);

    const activeObject = shell.getActiveObject();
    expect(activeObject?.type).toBe("activeSelection");
    if (activeObject && typeof activeObject === "object" && "getObjects" in activeObject && typeof activeObject.getObjects === "function") {
      expect(activeObject.getObjects()).toEqual([textB, textA]);
    }

    shell.setMode("draw");
    expect((shell.canvas as FakeCanvas).selection).toBe(false);
    expect((shell.canvas as FakeCanvas).defaultCursor).toBe("crosshair");

    shell.setMode("edit");
    expect((shell.canvas as FakeCanvas).selection).toBe(true);
    expect((shell.canvas as FakeCanvas).defaultCursor).toBe("default");
  });

  it("keeps labelClass, originalYolo, and linked _labelText when importing YOLO rows", () => {
    const deps = createDeps();
    const controller = createCanvasController(createState(), deps);

    controller.addLabelsFromYolo("3 0.250000000000000 0.400000000000000 0.200000000000000 0.500000000000000\n");

    const rect = controller.getObjects("rect")[0];
    expect(rect?.labelClass).toBe("3");
    expect(rect?.annotationId).toEqual(expect.any(String));
    expect(rect?.annotationId?.length).toBeGreaterThan(0);
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

  it("wraps DOM images in a non-evented base Fabric image layer", () => {
    const fabric = createFakeFabricRuntime();
    const controller = createCanvasController(
      createState(),
      createDeps({ fabric, getCanvasContainerSize: () => ({ width: 640, height: 480 }) })
    );

    const domImage = { width: 200, height: 100 };
    controller.setBackgroundImage(domImage);

    const canvas = controller.canvas as FakeCanvas;
    const imageObjects = canvas.getObjects("image");
    expect(canvas.backgroundImage).toBeUndefined();
    expect(imageObjects).toHaveLength(1);
    expect(imageObjects[0]).toBeInstanceOf(fabric.Image);
    expect((imageObjects[0] as unknown as { element: unknown }).element).toBe(domImage);
    expect((imageObjects[0] as unknown as { _isBaseImage?: boolean })._isBaseImage).toBe(true);
    expect(imageObjects[0]?.selectable).toBe(false);
    expect(imageObjects[0]?.evented).toBe(false);
    expect(canvas.width).toBe(640);
    expect(canvas.height).toBe(480);
  });

  it("replaces the previous base image layer when a new image is loaded", () => {
    const controller = createCanvasController(createState(), createDeps());
    const canvas = controller.canvas as FakeCanvas;

    controller.setBackgroundImage({ width: 200, height: 100 });
    const firstImage = canvas.getObjects("image")[0];
    controller.setBackgroundImage({ width: 300, height: 150 });

    const imageObjects = canvas.getObjects("image").filter((object) => {
      return (object as unknown as { _isBaseImage?: boolean })._isBaseImage;
    });
    expect(imageObjects).toHaveLength(1);
    expect(imageObjects[0]).not.toBe(firstImage);
    expect(canvas.getObjects()[0]).toBe(imageObjects[0]);
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
    expect(rects[0].annotationId).toEqual(expect.any(String));
    expect(rects[0].annotationId?.length).toBeGreaterThan(0);
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

  it("changes selected label classes through numeric shortcut API and supports undo/redo", () => {
    const history = createCanvasHistoryService();
    const fabric = createFakeFabricRuntime();
    const controller = createCanvasController(
      createState(),
      createDeps({
        fabric,
        historyService: history,
        getColorForClass: (labelClass) => `cls-${labelClass ?? "0"}`
      })
    );

    const rectA = createRect({ left: 5, top: 6, width: 10, height: 12, labelClass: "1" });
    const rectB = createRect({ left: 25, top: 16, width: 9, height: 10, labelClass: "2" });
    controller.canvas.add(rectA, rectB);
    controller.drawLabelText(rectA);
    controller.drawLabelText(rectB);
    controller.canvas.setActiveObject(new fabric.ActiveSelection([rectA, rectB], { canvas: controller.canvas }));

    expect(controller.setSelectedLabelClass?.("0")).toBe(true);
    expect(rectA.labelClass).toBe("0");
    expect(rectB.labelClass).toBe("0");
    expect(rectA.originalYolo).toBeNull();
    expect(rectB.originalYolo).toBeNull();
    expect(history.getPastEntries()).toHaveLength(1);

    controller.undo();
    expect(rectA.labelClass).toBe("1");
    expect(rectB.labelClass).toBe("2");

    controller.redo();
    expect(rectA.labelClass).toBe("0");
    expect(rectB.labelClass).toBe("0");

    controller.canvas.discardActiveObject();
    expect(controller.setSelectedLabelClass?.("7")).toBe(false);
    expect(history.getPastEntries()).toHaveLength(1);
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

    expect(rect._labelText?.left).toBe(140);
    expect(rect._labelText?.top).toBe(246);
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

  it("applies hidden-class visibility to rect and label text without coordinate drift", () => {
    const controller = createCanvasController(createState(), createDeps());
    const rectA = createRect({ left: 10, top: 20, width: 30, height: 40, labelClass: "1" });
    const rectB = createRect({ left: 50, top: 60, width: 15, height: 25, labelClass: "2" });
    controller.canvas.add(rectA, rectB);
    controller.drawLabelText(rectA);
    controller.drawLabelText(rectB);

    const beforeA = { left: rectA.left, top: rectA.top };
    const beforeB = { left: rectB.left, top: rectB.top };

    controller.applyVisibilityFromHiddenClasses(new Set(["1"]), true);
    expect(rectA.visible).toBe(false);
    expect(rectA._labelText?.visible).toBe(false);
    expect(rectB.visible).toBe(true);
    expect(rectB._labelText?.visible).toBe(true);
    expect(rectA.left).toBe(beforeA.left);
    expect(rectA.top).toBe(beforeA.top);
    expect(rectB.left).toBe(beforeB.left);
    expect(rectB.top).toBe(beforeB.top);

    controller.applyVisibilityFromHiddenClasses(new Set(), true);
    expect(rectA.visible).toBe(true);
    expect(rectA._labelText?.visible).toBe(true);
    expect(rectB.visible).toBe(true);
    expect(rectB._labelText?.visible).toBe(true);
    expect(rectA.left).toBe(beforeA.left);
    expect(rectA.top).toBe(beforeA.top);
    expect(rectB.left).toBe(beforeB.left);
    expect(rectB.top).toBe(beforeB.top);
  });

  it("clears active selection when selected object becomes hidden", () => {
    const fabric = createFakeFabricRuntime();
    const controller = createCanvasController(createState(), createDeps({ fabric }));
    const rectA = createRect({ left: 10, top: 20, width: 30, height: 40, labelClass: "1" });
    const rectB = createRect({ left: 50, top: 60, width: 15, height: 25, labelClass: "2" });
    controller.canvas.add(rectA, rectB);

    const selection = new fabric.ActiveSelection([rectA, rectB], { canvas: controller.canvas });
    controller.canvas.setActiveObject(selection);

    controller.applyVisibilityFromHiddenClasses(new Set(["1"]), true);

    expect(controller.canvas.getActiveObject()).toBeNull();
    expect(rectA.visible).toBe(false);
    expect(rectB.visible).toBe(true);
  });

  it.each([
    {
      name: "left",
      action: (controller: ReturnType<typeof createCanvasController>) => controller.alignSelectionLeft(),
      expected: {
        rectA: { left: 10, top: 20, moved: false },
        rectB: { left: 10, top: 5, moved: true },
        rectC: { left: 10, top: 30, moved: true }
      }
    },
    {
      name: "right",
      action: (controller: ReturnType<typeof createCanvasController>) => controller.alignSelectionRight(),
      expected: {
        rectA: { left: 55, top: 20, moved: true },
        rectB: { left: 40, top: 5, moved: false },
        rectC: { left: 65, top: 30, moved: true }
      }
    },
    {
      name: "top",
      action: (controller: ReturnType<typeof createCanvasController>) => controller.alignSelectionTop(),
      expected: {
        rectA: { left: 10, top: 5, moved: true },
        rectB: { left: 40, top: 5, moved: false },
        rectC: { left: 25, top: 5, moved: true }
      }
    },
    {
      name: "bottom",
      action: (controller: ReturnType<typeof createCanvasController>) => controller.alignSelectionBottom(),
      expected: {
        rectA: { left: 10, top: 28, moved: true },
        rectB: { left: 40, top: 13, moved: true },
        rectC: { left: 25, top: 30, moved: false }
      }
    }
  ])("alignSelection$[name] keeps selection and updates only moved visible rects", ({ action, expected }) => {
    const fabric = createFakeFabricRuntime();
    const updateLabelList = vi.fn();
    const controller = createCanvasController(createState(), createDeps({ fabric, updateLabelList }));
    const canvas = controller.canvas as FakeCanvas;
    const updateLabelTextSpy = vi.spyOn(controller, "updateLabelText");

    const rectA = createRect({
      left: 10,
      top: 20,
      width: 15,
      height: 10,
      labelClass: "A",
      originalYolo: { x_center: "0.1", y_center: "0.1", width: "0.1", height: "0.1" }
    });
    const rectB = createRect({
      left: 40,
      top: 5,
      width: 30,
      height: 25,
      labelClass: "B",
      originalYolo: { x_center: "0.2", y_center: "0.2", width: "0.2", height: "0.2" }
    });
    const rectC = createRect({
      left: 25,
      top: 30,
      width: 5,
      height: 8,
      labelClass: "C",
      originalYolo: { x_center: "0.3", y_center: "0.3", width: "0.3", height: "0.3" }
    });
    const hiddenRect = createRect({
      left: 100,
      top: 100,
      width: 20,
      height: 20,
      labelClass: "H",
      originalYolo: { x_center: "0.4", y_center: "0.4", width: "0.4", height: "0.4" }
    });
    hiddenRect.visible = false;

    controller.canvas.add(rectA, rectB, rectC, hiddenRect);
    controller.drawLabelText(rectA);
    controller.drawLabelText(rectB);
    controller.drawLabelText(rectC);
    controller.drawLabelText(hiddenRect);

    const originalA = rectA.originalYolo;
    const originalB = rectB.originalYolo;
    const originalC = rectC.originalYolo;
    const hiddenOriginal = hiddenRect.originalYolo;

    const selection = new fabric.ActiveSelection([rectA, rectB, rectC, hiddenRect], { canvas: controller.canvas });
    controller.canvas.setActiveObject(selection);
    const activeBefore = controller.canvas.getActiveObject();

    action(controller);

    const activeAfter = controller.canvas.getActiveObject();
    expect(activeAfter?.type).toBe("activeSelection");
    expect(getSelectionAnnotationIds(activeAfter)).toEqual(getSelectionAnnotationIds(activeBefore));
    expect(rectA.left).toBe(expected.rectA.left);
    expect(rectA.top).toBe(expected.rectA.top);
    expect(rectB.left).toBe(expected.rectB.left);
    expect(rectB.top).toBe(expected.rectB.top);
    expect(rectC.left).toBe(expected.rectC.left);
    expect(rectC.top).toBe(expected.rectC.top);

    expect(rectA.originalYolo).toBe(expected.rectA.moved ? null : originalA);
    expect(rectB.originalYolo).toBe(expected.rectB.moved ? null : originalB);
    expect(rectC.originalYolo).toBe(expected.rectC.moved ? null : originalC);
    expect(hiddenRect.left).toBe(100);
    expect(hiddenRect.top).toBe(100);
    expect(hiddenRect.originalYolo).toBe(hiddenOriginal);

    expect(updateLabelTextSpy).toHaveBeenCalledTimes(
      Number(expected.rectA.moved) + Number(expected.rectB.moved) + Number(expected.rectC.moved)
    );
    expect(canvas.requestRenderAllCalls).toBe(1);
    expect(updateLabelList).toHaveBeenCalledTimes(1);
  });

  it("no-ops edge alignment when active visible selection has fewer than two rects", () => {
    const fabric = createFakeFabricRuntime();
    const updateLabelList = vi.fn();
    const controller = createCanvasController(createState(), createDeps({ fabric, updateLabelList }));
    const canvas = controller.canvas as FakeCanvas;
    const updateLabelTextSpy = vi.spyOn(controller, "updateLabelText");

    const rect = createRect({
      left: 20,
      top: 30,
      width: 10,
      height: 12,
      labelClass: "1",
      originalYolo: { x_center: "0.1", y_center: "0.2", width: "0.3", height: "0.4" }
    });
    const hiddenRect = createRect({
      left: 200,
      top: 300,
      width: 15,
      height: 16,
      labelClass: "2",
      originalYolo: { x_center: "0.5", y_center: "0.6", width: "0.7", height: "0.8" }
    });
    hiddenRect.visible = false;
    controller.canvas.add(rect, hiddenRect);

    controller.alignSelectionLeft();
    controller.alignSelectionRight();
    controller.alignSelectionTop();
    controller.alignSelectionBottom();

    controller.canvas.setActiveObject(rect);
    controller.alignSelectionLeft();
    controller.alignSelectionRight();
    controller.alignSelectionTop();
    controller.alignSelectionBottom();

    const selection = new fabric.ActiveSelection([rect, hiddenRect], { canvas: controller.canvas });
    controller.canvas.setActiveObject(selection);
    controller.alignSelectionLeft();
    controller.alignSelectionRight();
    controller.alignSelectionTop();
    controller.alignSelectionBottom();

    expect(rect.left).toBe(20);
    expect(rect.top).toBe(30);
    expect(rect.originalYolo).toEqual({ x_center: "0.1", y_center: "0.2", width: "0.3", height: "0.4" });
    expect(hiddenRect.left).toBe(200);
    expect(hiddenRect.top).toBe(300);
    expect(hiddenRect.originalYolo).toEqual({ x_center: "0.5", y_center: "0.6", width: "0.7", height: "0.8" });
    expect(updateLabelTextSpy).not.toHaveBeenCalled();
    expect(canvas.requestRenderAllCalls).toBe(0);
    expect(updateLabelList).not.toHaveBeenCalled();
  });

  it("distributes selected rects horizontally by equal edge gaps while keeping outer rects fixed", () => {
    const fabric = createFakeFabricRuntime();
    const updateLabelList = vi.fn();
    const controller = createCanvasController(createState(), createDeps({ fabric, updateLabelList }));

    const left = createRect({
      left: 0,
      top: 10,
      width: 10,
      height: 10,
      labelClass: "L",
      originalYolo: { x_center: "0.1", y_center: "0.1", width: "0.1", height: "0.1" }
    });
    const middleA = createRect({
      left: 30,
      top: 10,
      width: 30,
      height: 10,
      labelClass: "A",
      originalYolo: { x_center: "0.2", y_center: "0.1", width: "0.2", height: "0.1" }
    });
    const middleB = createRect({
      left: 95,
      top: 10,
      width: 20,
      height: 10,
      labelClass: "B",
      originalYolo: { x_center: "0.3", y_center: "0.1", width: "0.1", height: "0.1" }
    });
    const right = createRect({
      left: 160,
      top: 10,
      width: 40,
      height: 10,
      labelClass: "R",
      originalYolo: { x_center: "0.4", y_center: "0.1", width: "0.2", height: "0.1" }
    });

    controller.canvas.add(left, middleA, middleB, right);
    controller.drawLabelText(left);
    controller.drawLabelText(middleA);
    controller.drawLabelText(middleB);
    controller.drawLabelText(right);

    const selection = new fabric.ActiveSelection([middleB, right, left, middleA], { canvas: controller.canvas });
    controller.canvas.setActiveObject(selection);

    controller.distributeSelectionHorizontally();

    const activeAfter = controller.canvas.getActiveObject();
    expect(activeAfter?.type).toBe("activeSelection");
    expect(getSelectionAnnotationIds(activeAfter)).toEqual(getSelectionAnnotationIds(selection));

    const ordered = [left, middleA, middleB, right].sort((a, b) => a.left - b.left);
    const [first, second, third, last] = ordered;

    expect(first.left).toBe(0);
    expect(last.left).toBe(160);

    const gapOne = second.left - (first.left + first.width);
    const gapTwo = third.left - (second.left + second.width);
    const gapThree = last.left - (third.left + third.width);
    expect(gapOne).toBeCloseTo(gapTwo, 8);
    expect(gapTwo).toBeCloseTo(gapThree, 8);

    const centerOne = first.left + first.width / 2;
    const centerTwo = second.left + second.width / 2;
    const centerThree = third.left + third.width / 2;
    const centerFour = last.left + last.width / 2;
    const centerGapOne = centerTwo - centerOne;
    const centerGapTwo = centerThree - centerTwo;
    const centerGapThree = centerFour - centerThree;
    expect(centerGapOne).not.toBeCloseTo(centerGapTwo, 8);
    expect(centerGapTwo).not.toBeCloseTo(centerGapThree, 8);

    expect(left.originalYolo).toEqual({ x_center: "0.1", y_center: "0.1", width: "0.1", height: "0.1" });
    expect(right.originalYolo).toEqual({ x_center: "0.4", y_center: "0.1", width: "0.2", height: "0.1" });
    expect(middleA.originalYolo).toBeNull();
    expect(middleB.originalYolo).toBeNull();

    expect(middleA._labelText?.left).toBeCloseTo(middleA.left, 8);
    expect(middleB._labelText?.left).toBeCloseTo(middleB.left, 8);
    expect(updateLabelList).toHaveBeenCalledTimes(1);
  });

  it("distributes selected rects vertically by equal edge gaps while keeping outer rects fixed", () => {
    const fabric = createFakeFabricRuntime();
    const updateLabelList = vi.fn();
    const controller = createCanvasController(createState(), createDeps({ fabric, updateLabelList }));

    const top = createRect({
      left: 20,
      top: 0,
      width: 15,
      height: 10,
      labelClass: "T",
      originalYolo: { x_center: "0.1", y_center: "0.1", width: "0.1", height: "0.1" }
    });
    const middleA = createRect({
      left: 20,
      top: 40,
      width: 15,
      height: 20,
      labelClass: "A",
      originalYolo: { x_center: "0.1", y_center: "0.2", width: "0.1", height: "0.2" }
    });
    const middleB = createRect({
      left: 20,
      top: 95,
      width: 15,
      height: 15,
      labelClass: "B",
      originalYolo: { x_center: "0.1", y_center: "0.3", width: "0.1", height: "0.1" }
    });
    const bottom = createRect({
      left: 20,
      top: 170,
      width: 15,
      height: 30,
      labelClass: "D",
      originalYolo: { x_center: "0.1", y_center: "0.4", width: "0.1", height: "0.2" }
    });

    controller.canvas.add(top, middleA, middleB, bottom);
    controller.drawLabelText(top);
    controller.drawLabelText(middleA);
    controller.drawLabelText(middleB);
    controller.drawLabelText(bottom);

    const selection = new fabric.ActiveSelection([middleB, bottom, top, middleA], { canvas: controller.canvas });
    controller.canvas.setActiveObject(selection);

    controller.distributeSelectionVertically();

    const activeAfter = controller.canvas.getActiveObject();
    expect(activeAfter?.type).toBe("activeSelection");
    expect(getSelectionAnnotationIds(activeAfter)).toEqual(getSelectionAnnotationIds(selection));

    const ordered = [top, middleA, middleB, bottom].sort((a, b) => a.top - b.top);
    const [first, second, third, last] = ordered;

    expect(first.top).toBe(0);
    expect(last.top).toBe(170);

    const gapOne = second.top - (first.top + first.height);
    const gapTwo = third.top - (second.top + second.height);
    const gapThree = last.top - (third.top + third.height);
    expect(gapOne).toBeCloseTo(gapTwo, 8);
    expect(gapTwo).toBeCloseTo(gapThree, 8);

    const centerOne = first.top + first.height / 2;
    const centerTwo = second.top + second.height / 2;
    const centerThree = third.top + third.height / 2;
    const centerFour = last.top + last.height / 2;
    const centerGapOne = centerTwo - centerOne;
    const centerGapTwo = centerThree - centerTwo;
    const centerGapThree = centerFour - centerThree;
    expect(centerGapOne).not.toBeCloseTo(centerGapTwo, 8);
    expect(centerGapTwo).not.toBeCloseTo(centerGapThree, 8);

    expect(top.originalYolo).toEqual({ x_center: "0.1", y_center: "0.1", width: "0.1", height: "0.1" });
    expect(bottom.originalYolo).toEqual({ x_center: "0.1", y_center: "0.4", width: "0.1", height: "0.2" });
    expect(middleA.originalYolo).toBeNull();
    expect(middleB.originalYolo).toBeNull();

    expect(middleA._labelText?.top).toBeCloseTo(middleA.top - 4, 8);
    expect(middleB._labelText?.top).toBeCloseTo(middleB.top - 4, 8);
    expect(updateLabelList).toHaveBeenCalledTimes(1);
  });

  it("keeps distribution as no-op when exactly two rects are selected on either axis", () => {
    const fabric = createFakeFabricRuntime();
    const updateLabelList = vi.fn();
    const controller = createCanvasController(createState(), createDeps({ fabric, updateLabelList }));

    const rectA = createRect({
      left: 10,
      top: 15,
      width: 20,
      height: 25,
      labelClass: "A",
      originalYolo: { x_center: "0.2", y_center: "0.2", width: "0.2", height: "0.2" }
    });
    const rectB = createRect({
      left: 90,
      top: 120,
      width: 30,
      height: 35,
      labelClass: "B",
      originalYolo: { x_center: "0.7", y_center: "0.7", width: "0.3", height: "0.3" }
    });

    controller.canvas.add(rectA, rectB);
    controller.drawLabelText(rectA);
    controller.drawLabelText(rectB);

    const selection = new fabric.ActiveSelection([rectA, rectB], { canvas: controller.canvas });
    controller.canvas.setActiveObject(selection);

    const before = {
      a: { left: rectA.left, top: rectA.top, yolo: rectA.originalYolo },
      b: { left: rectB.left, top: rectB.top, yolo: rectB.originalYolo }
    };

    controller.distributeSelectionHorizontally();
    controller.distributeSelectionVertically();

    expect(rectA.left).toBe(before.a.left);
    expect(rectA.top).toBe(before.a.top);
    expect(rectB.left).toBe(before.b.left);
    expect(rectB.top).toBe(before.b.top);
    expect(rectA.originalYolo).toBe(before.a.yolo);
    expect(rectB.originalYolo).toBe(before.b.yolo);
    expect(controller.canvas.getActiveObject()).toBe(selection);
    expect(updateLabelList).not.toHaveBeenCalled();
  });

  it("applies horizontal distribution using bounds deltas when bounding rect differs from object coordinates", () => {
    const fabric = createFakeFabricRuntime();
    const updateLabelList = vi.fn();
    const controller = createCanvasController(createState(), createDeps({ fabric, updateLabelList }));

    const left = createRect({ left: 0, top: 10, width: 10, height: 10, labelClass: "L" });
    const middleA = createRect({ left: 30, top: 10, width: 30, height: 10, labelClass: "A" });
    const middleB = createRect({ left: 95, top: 10, width: 20, height: 10, labelClass: "B" });
    const right = createRect({ left: 160, top: 10, width: 40, height: 10, labelClass: "R" });

    [left, middleA, middleB, right].forEach((rect) => {
      offsetRectBounds(rect, 100, 0);
    });

    controller.canvas.add(left, middleA, middleB, right);
    const selection = new fabric.ActiveSelection([middleB, right, left, middleA], { canvas: controller.canvas });
    controller.canvas.setActiveObject(selection);

    controller.distributeSelectionHorizontally();

    expect(left.left).toBe(0);
    expect(right.left).toBe(160);
    expect(middleA.left).toBeCloseTo(43.3333333333, 8);
    expect(middleB.left).toBeCloseTo(106.6666666667, 8);
    expect(updateLabelList).toHaveBeenCalledTimes(1);
  });

  it("applies vertical distribution using bounds deltas when bounding rect differs from object coordinates", () => {
    const fabric = createFakeFabricRuntime();
    const updateLabelList = vi.fn();
    const controller = createCanvasController(createState(), createDeps({ fabric, updateLabelList }));

    const top = createRect({ left: 20, top: 0, width: 15, height: 10, labelClass: "T" });
    const middleA = createRect({ left: 20, top: 40, width: 15, height: 20, labelClass: "A" });
    const middleB = createRect({ left: 20, top: 95, width: 15, height: 15, labelClass: "B" });
    const bottom = createRect({ left: 20, top: 170, width: 15, height: 30, labelClass: "D" });

    [top, middleA, middleB, bottom].forEach((rect) => {
      offsetRectBounds(rect, 0, 200);
    });

    controller.canvas.add(top, middleA, middleB, bottom);
    const selection = new fabric.ActiveSelection([middleB, bottom, top, middleA], { canvas: controller.canvas });
    controller.canvas.setActiveObject(selection);

    controller.distributeSelectionVertically();

    expect(top.top).toBe(0);
    expect(bottom.top).toBe(170);
    expect(middleA.top).toBeCloseTo(51.6666666667, 8);
    expect(middleB.top).toBeCloseTo(113.3333333333, 8);
    expect(updateLabelList).toHaveBeenCalledTimes(1);
  });

  it("records a single history entry for successful draw and none for cancelled draw prompt", async () => {
    const history = createCanvasHistoryService();
    const prompt = vi
      .fn<CanvasControllerDeps["promptForLabelClass"]>()
      .mockResolvedValueOnce("9")
      .mockRejectedValueOnce(new Error("Label prompt cancelled"));

    const controller = createCanvasController(
      createState({ currentMode: "draw" }),
      createDeps({ promptForLabelClass: prompt, historyService: history })
    );

    controller.startDrawing({ x: 10, y: 10 });
    controller.continueDrawing({ x: 40, y: 40 });
    await controller.finishDrawing();

    const createdRect = controller.getObjects("rect")[0];
    const createdAnnotationId = createdRect?.annotationId;

    expect(history.getPastEntries()).toHaveLength(1);
    expect(history.getPastEntries()[0]?.before).toHaveLength(0);
    expect(history.getPastEntries()[0]?.after).toHaveLength(1);
    expect(createdAnnotationId).toEqual(expect.any(String));
    expect(history.getPastEntries()[0]?.before.some((snapshot) => snapshot.annotationId === createdAnnotationId)).toBe(false);
    expect(history.getPastEntries()[0]?.after.some((snapshot) => snapshot.annotationId === createdAnnotationId)).toBe(true);
    expect(history.getPastEntries()[0]?.after[0]?.labelClass).toBe("9");

    controller.startDrawing({ x: 60, y: 20 });
    controller.continueDrawing({ x: 100, y: 40 });
    await controller.finishDrawing();

    expect(history.getPastEntries()).toHaveLength(1);
    expect(controller.getObjects("rect")).toHaveLength(1);
  });

  it("records one history entry each for single and multi label edits, but none for cancelled edit", async () => {
    const history = createCanvasHistoryService();
    const fabric = createFakeFabricRuntime();
    const prompt = vi
      .fn<CanvasControllerDeps["promptForLabelClass"]>()
      .mockResolvedValueOnce("11")
      .mockResolvedValueOnce("12")
      .mockRejectedValueOnce(new Error("Label prompt cancelled"));
    const controller = createCanvasController(
      createState(),
      createDeps({ fabric, promptForLabelClass: prompt, historyService: history })
    );

    const rectA = createRect({ left: 10, top: 10, width: 20, height: 20, labelClass: "1" });
    const rectB = createRect({ left: 50, top: 10, width: 20, height: 20, labelClass: "2" });
    controller.canvas.add(rectA, rectB);
    controller.drawLabelText(rectA);
    controller.drawLabelText(rectB);

    await controller.editLabel(rectA);
    expect(history.getPastEntries()).toHaveLength(1);

    const selection = new fabric.ActiveSelection([rectA, rectB], { canvas: controller.canvas });
    await controller.editMultipleLabels(selection);
    expect(history.getPastEntries()).toHaveLength(2);

    await expect(controller.editLabel(rectA)).rejects.toThrow("Label prompt cancelled");
    expect(history.getPastEntries()).toHaveLength(2);
  });

  it("records single history entries for paste and delete commands", async () => {
    const history = createCanvasHistoryService();
    const fabric = createFakeFabricRuntime();
    const controller = createCanvasController(createState(), createDeps({ fabric, historyService: history }));

    const source = createRect({ left: 10, top: 10, width: 20, height: 20, labelClass: "3" });
    source.annotationId = "source-id";
    controller.canvas.add(source);
    controller.canvas.setActiveObject(source);

    await controller.copy();
    await controller.paste();
    expect(history.getPastEntries()).toHaveLength(1);
    expect(controller.getObjects("rect")).toHaveLength(2);
    expect(history.getPastEntries()[0]?.before).toHaveLength(1);
    expect(history.getPastEntries()[0]?.after).toHaveLength(2);

    const rects = controller.getObjects("rect");
    const selection = new fabric.ActiveSelection([rects[0]!, rects[1]!], { canvas: controller.canvas });
    controller.canvas.setActiveObject(selection);
    controller.deleteSelection();

    expect(history.getPastEntries()).toHaveLength(2);
    expect(controller.getObjects("rect")).toHaveLength(0);
    expect(history.getPastEntries()[1]?.before).toHaveLength(2);
    expect(history.getPastEntries()[1]?.after).toHaveLength(0);
  });

  it("records one history entry for align/distribute mutations and none for no-op arrange calls", () => {
    const history = createCanvasHistoryService();
    const fabric = createFakeFabricRuntime();
    const controller = createCanvasController(createState(), createDeps({ fabric, historyService: history }));

    const a = createRect({ left: 10, top: 20, width: 10, height: 10, labelClass: "a" });
    const b = createRect({ left: 30, top: 25, width: 10, height: 10, labelClass: "b" });
    const c = createRect({ left: 50, top: 30, width: 10, height: 10, labelClass: "c" });
    controller.canvas.add(a, b, c);
    controller.canvas.setActiveObject(new fabric.ActiveSelection([a, b, c], { canvas: controller.canvas }));

    controller.alignSelectionLeft();
    expect(history.getPastEntries()).toHaveLength(1);

    controller.canvas.setActiveObject(new fabric.ActiveSelection([a, b, c], { canvas: controller.canvas }));
    controller.alignSelectionLeft();
    expect(history.getPastEntries()).toHaveLength(1);

    const d = createRect({ left: 120, top: 30, width: 20, height: 10, labelClass: "d" });
    controller.canvas.add(d);
    controller.canvas.setActiveObject(new fabric.ActiveSelection([a, b, c, d], { canvas: controller.canvas }));
    controller.distributeSelectionHorizontally();
    expect(history.getPastEntries()).toHaveLength(2);

    controller.canvas.setActiveObject(new fabric.ActiveSelection([a, d], { canvas: controller.canvas }));
    controller.distributeSelectionHorizontally();
    expect(history.getPastEntries()).toHaveLength(2);
  });

  it("replays undo/redo through controller history while restoring selection membership", () => {
    const history = createCanvasHistoryService();
    const fabric = createFakeFabricRuntime();
    const updateLabelList = vi.fn();
    const controller = createCanvasController(
      createState(),
      createDeps({ fabric, historyService: history, updateLabelList })
    );
    const canvas = controller.canvas as FakeCanvas;

    const rectA = createRect({ left: 10, top: 20, width: 10, height: 10, labelClass: "a" });
    rectA.annotationId = "rect-a";
    const rectB = createRect({ left: 40, top: 20, width: 10, height: 10, labelClass: "b" });
    rectB.annotationId = "rect-b";
    controller.canvas.add(rectA, rectB);
    controller.drawLabelText(rectA);
    controller.drawLabelText(rectB);

    const selection = new fabric.ActiveSelection([rectA, rectB], { canvas: controller.canvas });
    controller.canvas.setActiveObject(selection);

    controller.alignSelectionLeft();
    expect(rectB.left).toBe(10);
    expect(controller.canUndo()).toBe(true);
    expect(controller.canRedo()).toBe(false);

    controller.undo();

    expect(rectA.left).toBe(10);
    expect(rectB.left).toBe(40);
    const activeAfterUndo = controller.canvas.getActiveObject();
    expect(activeAfterUndo?.type).toBe("activeSelection");
    if (activeAfterUndo?.type === "activeSelection") {
      const selectedIds = getSelectionAnnotationIds(activeAfterUndo);
      expect(selectedIds).toEqual(["rect-a", "rect-b"]);
    }
    expect(controller.canUndo()).toBe(false);
    expect(controller.canRedo()).toBe(true);

    controller.redo();

    expect(rectA.left).toBe(10);
    expect(rectB.left).toBe(10);
    expect(controller.canUndo()).toBe(true);
    expect(controller.canRedo()).toBe(false);
    expect(updateLabelList).toHaveBeenCalled();
    expect(canvas.requestRenderAllCalls).toBeGreaterThan(0);
  });

  it("restores grouped-selection alignment undo without corrupting rect model coordinates", () => {
    const history = createCanvasHistoryService();
    const fabric = createFakeFabricRuntime();
    const controller = createCanvasController(
      createState(),
      createDeps({ fabric, historyService: history })
    );
    const canvas = controller.canvas as FakeCanvas;

    const rectA = createRect({ left: 10, top: 20, width: 10, height: 10, labelClass: "a" });
    rectA.annotationId = "rect-a";
    const rectB = createRect({ left: 40, top: 20, width: 10, height: 10, labelClass: "b" });
    rectB.annotationId = "rect-b";

    const groupState = { left: 100, top: 200, width: 50, height: 10 };
    rectA.group = groupState;
    rectB.group = groupState;
    rectA.getBoundingRect = () => ({ left: groupState.left + rectA.left, top: groupState.top + rectA.top, width: rectA.width, height: rectA.height });
    rectB.getBoundingRect = () => ({ left: groupState.left + rectB.left, top: groupState.top + rectB.top, width: rectB.width, height: rectB.height });

    const originalDiscardActiveObject = canvas.discardActiveObject.bind(canvas);
    canvas.discardActiveObject = () => {
      [rectA, rectB].forEach((rect) => {
        if (!rect.group) {
          return;
        }
        const bounds = rect.getBoundingRect();
        rect.left = bounds.left;
        rect.top = bounds.top;
        rect.group = null;
      });
      return originalDiscardActiveObject();
    };

    controller.canvas.add(rectA, rectB);
    const selection = new fabric.ActiveSelection([rectA, rectB], { canvas: controller.canvas });
    controller.canvas.setActiveObject(selection);

    controller.alignSelectionLeft();
    expect(rectA.left).toBe(10);
    expect(rectB.left).toBe(10);

    controller.undo();

    expect(rectA.left).toBe(10);
    expect(rectA.top).toBe(20);
    expect(rectB.left).toBe(40);
    expect(rectB.top).toBe(20);
    const activeAfterUndo = controller.canvas.getActiveObject();
    expect(activeAfterUndo?.type).toBe("activeSelection");
    const activeBounds = activeAfterUndo?.getBoundingRect(true);
    expect(activeBounds).toMatchObject({
      left: 10,
      top: 20,
      width: 40,
      height: 10
    });
  });

  it("replays resized rects using model width/height and scale fields, not bounding-box dimensions", () => {
    const history = createCanvasHistoryService();
    const controller = createCanvasController(
      createState(),
      createDeps({ historyService: history })
    );

    const rect = createRect({ left: 10, top: 20, width: 20, height: 10, labelClass: "r" });
    rect.annotationId = "resize-id";
    (rect as { scaleX?: number; scaleY?: number }).scaleX = 2;
    (rect as { scaleX?: number; scaleY?: number }).scaleY = 3;
    rect.getBoundingRect = () => ({
      left: rect.left + 100,
      top: rect.top + 200,
      width: rect.width * ((rect as { scaleX?: number }).scaleX ?? 1),
      height: rect.height * ((rect as { scaleY?: number }).scaleY ?? 1)
    });
    controller.canvas.add(rect);
    controller.drawLabelText(rect);

    const baseline = controller.captureHistoryBaseline();
    rect.set({ left: 30, top: 40, width: 25, height: 12, scaleX: 1.5, scaleY: 1.25 });
    rect.setCoords();
    controller.commitHistoryFromBaseline(baseline);

    controller.undo();
    expect(rect.left).toBe(10);
    expect(rect.top).toBe(20);
    expect(rect.width).toBe(20);
    expect(rect.height).toBe(10);
    expect((rect as { scaleX?: number }).scaleX).toBe(2);
    expect((rect as { scaleY?: number }).scaleY).toBe(3);

    controller.redo();
    expect(rect.left).toBe(30);
    expect(rect.top).toBe(40);
    expect(rect.width).toBe(25);
    expect(rect.height).toBe(12);
    expect((rect as { scaleX?: number }).scaleX).toBe(1.5);
    expect((rect as { scaleY?: number }).scaleY).toBe(1.25);
  });

  it("shared shell handles generic selection mechanics without rect-specific assumptions", () => {
    const fabric = createFakeFabricRuntime();
    const shell = createCanvasShell(createState(), createDeps({ fabric }));
    const textA = new fabric.Text("a", { left: 1, top: 2 });
    const textB = new fabric.Text("b", { left: 3, top: 4 });
    shell.canvas.add(textA, textB);

    shell.setActiveSelection([textA, textB], textB);
    const activeObject = shell.getActiveObject();

    expect(activeObject?.type).toBe("activeSelection");
    if (!activeObject || typeof activeObject !== "object" || typeof (activeObject as { getObjects?: unknown }).getObjects !== "function") {
      return;
    }

    const ordered = (activeObject as unknown as { getObjects: () => unknown[] }).getObjects();
    expect(ordered[0]).toBe(textB);
    expect(ordered[1]).toBe(textA);

    shell.setMode("draw");
    expect((shell.canvas as FakeCanvas).selection).toBe(false);
    shell.setMode("edit");
    expect((shell.canvas as FakeCanvas).selection).toBe(true);
  });

  it("captures selected boxes and applies a class-preserving layout as one history entry", () => {
    const fabric = createFakeFabricRuntime();
    const history = createCanvasHistoryService();
    const controller = createCanvasController(createState(), createDeps({ fabric, historyService: history }));
    const first = createRect({ left: 10, top: 20, width: 30, height: 15, labelClass: "2" });
    const second = createRect({ left: 50, top: 40, width: 20, height: 10, labelClass: "5" });
    controller.canvas.add(first, second);
    controller.canvas.setActiveObject(new fabric.ActiveSelection([first, second], { canvas: controller.canvas }));

    const layout = controller.captureBoxLayout("fixture", "reference.png", "selected");
    expect(layout.sourceAnchor).toEqual({ x: 10, y: 20 });
    expect(layout.boxes.map((box) => box.classId)).toEqual(["2", "5"]);

    const application = controller.applyBoxLayout(layout, { x: 100, y: 50 });
    const applied = controller.getObjects("rect").filter((rect) => rect.layoutInstanceId === application.instanceId);
    expect(applied).toHaveLength(2);
    expect(applied.map((rect) => ({ left: rect.left, top: rect.top, classId: rect.labelClass }))).toEqual([
      { left: 100, top: 50, classId: "2" },
      { left: 140, top: 70, classId: "5" }
    ]);

    controller.undo();
    expect(controller.getObjects("rect")).toHaveLength(2);
    controller.redo();
    expect(controller.getObjects("rect")).toHaveLength(4);
  });

  it("drops out-of-bounds layout boxes and removes existing outside boxes before save", () => {
    const history = createCanvasHistoryService();
    const controller = createCanvasController(createState(), createDeps({ historyService: history }));
    const sourceInside = createRect({ left: 10, top: 10, width: 20, height: 10, labelClass: "1" });
    const sourceOutside = createRect({ left: 50, top: 10, width: 20, height: 10, labelClass: "2" });
    controller.canvas.add(sourceInside, sourceOutside);
    const layout = controller.captureBoxLayout("edge", "reference.png", "all");

    const application = controller.applyBoxLayout(layout, { x: 150, y: 20 });
    expect(application.annotationIds).toHaveLength(1);
    expect(application.discardedOutOfBoundsCount).toBe(1);

    const manuallyOutside = createRect({ left: 195, top: 20, width: 10, height: 10, labelClass: "3" });
    controller.canvas.add(manuallyOutside);
    expect(controller.removeBoxesOutsideImageBounds?.()).toBe(1);
    expect(controller.getObjects("rect")).not.toContain(manuallyOutside);

    controller.undo();
    expect(controller.getObjects("rect")).toHaveLength(4);
  });

  it("moves an applied layout together and restores the move with one undo", () => {
    const history = createCanvasHistoryService();
    const controller = createCanvasController(createState(), createDeps({ historyService: history }));
    const layout = controller.captureBoxLayout.bind(controller);
    const source = createRect({ left: 10, top: 10, width: 20, height: 10, labelClass: "1" });
    controller.canvas.add(source);
    const captured = layout("single", "reference.png", "all");
    const application = controller.applyBoxLayout(captured, { x: 30, y: 30 });

    controller.translateLayoutInstance(application.instanceId, { x: 5, y: -3 });
    const moved = controller.getObjects("rect").find((rect) => rect.layoutInstanceId === application.instanceId);
    expect(moved).toMatchObject({ left: 35, top: 27, originalYolo: null });

    controller.undo();
    const restored = controller.getObjects("rect").find((rect) => rect.layoutInstanceId === application.instanceId);
    expect(restored).toMatchObject({ left: 30, top: 30 });
  });

  it("moves selected boxes regardless of layout membership and preserves relative geometry in one undo", () => {
    const fabric = createFakeFabricRuntime();
    const history = createCanvasHistoryService();
    const controller = createCanvasController(createState(), createDeps({ fabric, historyService: history }));
    const first = createRect({
      left: 10,
      top: 15,
      width: 20,
      height: 10,
      labelClass: "2",
      originalYolo: { x_center: "0.1", y_center: "0.2", width: "0.1", height: "0.1" }
    });
    const second = createRect({ left: 55, top: 40, width: 15, height: 12, labelClass: "7" });
    controller.canvas.add(first, second);
    controller.drawLabelText(first);
    controller.drawLabelText(second);
    controller.canvas.setActiveObject(new fabric.ActiveSelection([first, second], { canvas: controller.canvas }));

    expect(controller.getSelectedBoxCount()).toBe(2);
    controller.translateSelectedBoxes({ x: 9, y: -4 });

    expect(first).toMatchObject({ left: 19, top: 11, width: 20, height: 10, labelClass: "2", originalYolo: null });
    expect(second).toMatchObject({ left: 64, top: 36, width: 15, height: 12, labelClass: "7", originalYolo: null });
    expect(second.left - first.left).toBe(45);
    expect(second.top - first.top).toBe(25);

    controller.undo();
    const restored = controller.getObjects("rect");
    expect(restored.map((rect) => ({ left: rect.left, top: rect.top }))).toEqual([
      { left: 10, top: 15 },
      { left: 55, top: 40 }
    ]);
  });

  it("aborts the complete selection move when any selected box would leave the image", () => {
    const fabric = createFakeFabricRuntime();
    const controller = createCanvasController(createState(), createDeps({ fabric }));
    const first = createRect({ left: 10, top: 15, width: 20, height: 10, labelClass: "2" });
    const edge = createRect({ left: 180, top: 20, width: 20, height: 10, labelClass: "7" });
    controller.canvas.add(first, edge);
    controller.canvas.setActiveObject(new fabric.ActiveSelection([first, edge], { canvas: controller.canvas }));

    expect(() => controller.translateSelectedBoxes({ x: 1, y: 0 })).toThrow(/outside the image bounds/);
    expect(first).toMatchObject({ left: 10, top: 15 });
    expect(edge).toMatchObject({ left: 180, top: 20 });
  });

  it("edits a single selected box geometry in pixels with one-step undo", () => {
    const history = createCanvasHistoryService();
    const controller = createCanvasController(createState(), createDeps({ historyService: history }));
    const rect = createRect({
      left: 10,
      top: 15,
      width: 20,
      height: 10,
      labelClass: "2",
      originalYolo: { x_center: "0.1", y_center: "0.2", width: "0.1", height: "0.1" }
    });
    controller.canvas.add(rect);
    controller.canvas.setActiveObject(rect);

    expect(controller.updateSelectedBoxGeometry?.({ x: 30, y: 20, width: 40, height: 25 })).toBe(true);
    expect(rect.getBoundingRect()).toEqual({ left: 30, top: 20, width: 40, height: 25 });
    expect(rect.originalYolo).toBeNull();
    expect(history.getPastEntries()).toHaveLength(1);

    controller.undo();
    expect(controller.getObjects("rect")[0]?.getBoundingRect(true)).toEqual({ left: 10, top: 15, width: 20, height: 10 });
  });

  it("rejects inspector geometry that would leave the image", () => {
    const controller = createCanvasController(createState(), createDeps());
    const rect = createRect({ left: 10, top: 15, width: 20, height: 10, labelClass: "2" });
    controller.canvas.add(rect);
    controller.canvas.setActiveObject(rect);

    expect(() => controller.updateSelectedBoxGeometry?.({ x: 190, y: 20, width: 20, height: 10 })).toThrow(/image bounds/);
    expect(rect.getBoundingRect()).toEqual({ left: 10, top: 15, width: 20, height: 10 });
  });

  it("applies multiple detection boxes with class IDs, padded geometry, fresh IDs, and one-step undo", () => {
    const history = createCanvasHistoryService();
    const controller = createCanvasController(createState(), createDeps({ historyService: history }));

    const result = controller.applyDetectionBoxes([
      { classId: "4", x: 8, y: 9, width: 24, height: 18 },
      { classId: "4", x: 70, y: 35, width: 24, height: 18 }
    ]);
    const rects = controller.getObjects("rect");

    expect(rects).toHaveLength(2);
    expect(rects.map((rect) => ({ classId: rect.labelClass, left: rect.left, top: rect.top, width: rect.width, height: rect.height }))).toEqual([
      { classId: "4", left: 8, top: 9, width: 24, height: 18 },
      { classId: "4", left: 70, top: 35, width: 24, height: 18 }
    ]);
    expect(new Set(result.annotationIds).size).toBe(2);
    expect(rects.every((rect) => rect.originalYolo === null)).toBe(true);

    controller.undo();
    expect(controller.getObjects("rect")).toHaveLength(0);
    controller.redo();
    expect(controller.getObjects("rect")).toHaveLength(2);
  });

});
