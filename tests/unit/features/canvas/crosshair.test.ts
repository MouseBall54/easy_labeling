import { describe, expect, it } from "vitest";

import { createCrosshairLines, hideCrosshair, toggleCrosshair, updateCrosshair, type CrosshairState } from "../../../../src/features/canvas/crosshair.js";
import { createFakeFabricRuntime, FakeCanvas } from "./test-fakes.js";

function createState(overrides: Partial<CrosshairState> = {}): CrosshairState {
  return {
    isCrosshairVisible: false,
    crosshairX: null,
    crosshairY: null,
    ...overrides
  };
}

describe("features/canvas/crosshair", () => {
  it("creates lines and toggles visibility", () => {
    const fabric = createFakeFabricRuntime();
    const canvas = new FakeCanvas("canvas", { width: 800, height: 600, backgroundColor: "#eee" });
    const state = createState();

    createCrosshairLines(fabric, canvas, state);
    expect(state.crosshairX).not.toBeNull();
    expect(state.crosshairY).not.toBeNull();

    toggleCrosshair(fabric, canvas, state, true);
    expect(state.isCrosshairVisible).toBe(true);
    expect(state.crosshairX?.visible).toBe(true);
    expect(state.crosshairY?.visible).toBe(true);

    toggleCrosshair(fabric, canvas, state, false);
    expect(state.crosshairX?.visible).toBe(false);
    expect(state.crosshairY?.visible).toBe(false);
  });

  it("updates line geometry in viewport coordinates", () => {
    const fabric = createFakeFabricRuntime();
    const canvas = new FakeCanvas("canvas", { width: 400, height: 200, backgroundColor: "#eee" });
    canvas.setZoom(2);
    canvas.setViewportTransform([2, 0, 0, 2, -40, -20]);
    const state = createState();

    createCrosshairLines(fabric, canvas, state);
    toggleCrosshair(fabric, canvas, state, true);
    updateCrosshair(canvas, state, { x: 30, y: 40 });

    expect(state.crosshairX?.x1).toBe(20);
    expect(state.crosshairX?.x2).toBe(220);
    expect(state.crosshairX?.y1).toBe(40);
    expect(state.crosshairY?.y1).toBe(10);
    expect(state.crosshairY?.y2).toBe(110);
    expect(state.crosshairY?.x1).toBe(30);
  });

  it("is no-op safe when prerequisites are missing", () => {
    const fabric = createFakeFabricRuntime();
    const canvas = new FakeCanvas("canvas", { width: 400, height: 200, backgroundColor: "#eee" });
    const state = createState();
    const renderBefore = canvas.renderAllCalls;

    updateCrosshair(canvas, state, { x: 1, y: 2 });
    hideCrosshair(canvas, state);
    toggleCrosshair(fabric, canvas, state, false);

    expect(canvas.renderAllCalls).toBe(renderBefore);
    expect(state.crosshairX).toBeNull();
    expect(state.crosshairY).toBeNull();
  });
});
