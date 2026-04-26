import { describe, expect, it, vi } from "vitest";

import { createClipboardManager } from "../../../../src/features/canvas/clipboard.js";
import { createFakeFabricRuntime, createRect, FakeCanvas } from "./test-fakes.js";

describe("features/canvas/clipboard", () => {
  it("copy/paste keeps labelClass, clears originalYolo, and re-centers near last mouse", async () => {
    const fabric = createFakeFabricRuntime();
    const canvas = new FakeCanvas("canvas", { width: 800, height: 600, backgroundColor: "#eee" });
    const drawLabelText = vi.fn();
    const updateLabelList = vi.fn();
    let lastMouse = { x: 150, y: 70 };

    const clipboard = createClipboardManager({
      fabric,
      canvas,
      getColorForClass: (labelClass) => `color-${labelClass ?? "0"}`,
      drawLabelText,
      updateLabelList,
      getLastMousePosition: () => lastMouse,
      getCurrentImageSize: () => ({ width: 200, height: 100 })
    });

    const source = createRect({
      left: 20,
      top: 10,
      width: 30,
      height: 20,
      labelClass: "4",
      originalYolo: { x_center: "0.1", y_center: "0.2", width: "0.3", height: "0.4" }
    });
    source.annotationId = "source-annotation-id";
    canvas.add(source);
    canvas.setActiveObject(source);

    await clipboard.copy();
    await clipboard.paste();

    const pastedRects = canvas.getObjects("rect");
    expect(pastedRects).toHaveLength(2);

    const pasted = pastedRects[1];
    expect(pasted.labelClass).toBe("4");
    expect(pasted.annotationId).toEqual(expect.any(String));
    expect(pasted.annotationId).not.toBe(source.annotationId);
    expect(pasted.originalYolo).toBeNull();
    expect(pasted.stroke).toBe("color-4");
    expect(pasted.fill).toBe("color-433");
    expect(pasted.getCenterPoint()).toEqual({ x: 150, y: 70 });
    expect(drawLabelText).toHaveBeenCalledTimes(1);
    expect(updateLabelList).toHaveBeenCalledTimes(1);

    lastMouse = { x: -20, y: 1000 };
    await clipboard.paste();
    const clampedPaste = canvas.getObjects("rect")[2];
    expect(clampedPaste.getCenterPoint()).toEqual({ x: 0, y: 100 });
  });

  it("pastes active selection with relative offsets and resets originalYolo on each rect", async () => {
    const fabric = createFakeFabricRuntime();
    const canvas = new FakeCanvas("canvas", { width: 800, height: 600, backgroundColor: "#eee" });
    const drawLabelText = vi.fn();

    const clipboard = createClipboardManager({
      fabric,
      canvas,
      getColorForClass: (labelClass) => `c-${labelClass ?? "0"}`,
      drawLabelText,
      updateLabelList: vi.fn(),
      getLastMousePosition: () => ({ x: 100, y: 80 }),
      getCurrentImageSize: () => ({ width: 200, height: 100 })
    });

    const rectA = createRect({
      left: 0,
      top: 0,
      width: 10,
      height: 10,
      labelClass: "1",
      originalYolo: { x_center: "0.1", y_center: "0.1", width: "0.1", height: "0.1" }
    });
    const rectB = createRect({
      left: 20,
      top: 20,
      width: 10,
      height: 10,
      labelClass: "2",
      originalYolo: { x_center: "0.2", y_center: "0.2", width: "0.1", height: "0.1" }
    });
    canvas.add(rectA, rectB);
    const selection = new fabric.ActiveSelection([rectA, rectB], { canvas });
    canvas.setActiveObject(selection);

    await clipboard.copy();
    await clipboard.paste();

    const pasted = canvas.getObjects("rect").slice(2);
    expect(pasted).toHaveLength(2);
    expect(pasted[0].left).toBe(85);
    expect(pasted[0].top).toBe(65);
    expect(pasted[1].left).toBe(105);
    expect(pasted[1].top).toBe(85);
    expect(pasted[0].annotationId).toEqual(expect.any(String));
    expect(pasted[1].annotationId).toEqual(expect.any(String));
    expect(pasted[0].annotationId).not.toBe(rectA.annotationId);
    expect(pasted[1].annotationId).not.toBe(rectB.annotationId);
    expect(pasted[0].originalYolo).toBeNull();
    expect(pasted[1].originalYolo).toBeNull();
    expect(drawLabelText).toHaveBeenCalledTimes(2);
  });
});
