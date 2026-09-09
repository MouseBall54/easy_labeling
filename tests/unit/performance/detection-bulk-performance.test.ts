import { describe, expect, it, vi } from "vitest";

import { createCanvasController, type CanvasControllerDeps, type CanvasControllerState } from "../../../src/features/canvas/canvas-controller.js";
import { createFakeFabricRuntime, createRect, FakeCanvas } from "../features/canvas/test-fakes.js";

function createState(): CanvasControllerState {
  return {
    currentMode: "edit",
    currentImage: { width: 800, height: 600 },
    labelFolderHandle: {},
    showLabelsOnCanvas: true,
    labelFontSize: 14,
    isCrosshairVisible: false,
    lastMousePosition: { x: 400, y: 300 },
    labelSortOrder: "asc"
  };
}

function createDeps(fabric: ReturnType<typeof createFakeFabricRuntime>): CanvasControllerDeps {
  return {
    fabric,
    getCanvasContainerSize: () => ({ width: 800, height: 600 }),
    promptForLabelClass: vi.fn(async () => "0"),
    updateLabelList: vi.fn(),
    updateZoomDisplay: vi.fn(),
    getDisplayNameForClass: (labelClass) => `class-${labelClass ?? "0"}`,
    notify: vi.fn()
  };
}

describe("detection bulk performance regression", () => {
  it("keeps batched paste rendering bounded from 100 through 5,000 boxes", async () => {
    const results: Array<{ count: number; elapsedMs: number; renderRequests: number; objectCount: number; heapDeltaBytes: number }> = [];

    for (const count of [100, 500, 1000, 5000]) {
      const fabric = createFakeFabricRuntime();
      const controller = createCanvasController(createState(), createDeps(fabric));
      const sourceRects = Array.from({ length: count }, (_value, index) => createRect({
        left: (index % 100) * 5,
        top: Math.floor(index / 100) * 5,
        width: 4,
        height: 4,
        labelClass: String(index % 5)
      }));
      controller.canvas.add(...sourceRects);
      controller.canvas.setActiveObject(new fabric.ActiveSelection(sourceRects, { canvas: controller.canvas }));
      await controller.copy();

      const fakeCanvas = controller.canvas as FakeCanvas;
      const renderRequestsBeforePaste = fakeCanvas.requestRenderAllCalls;
      const heapBeforePaste = process.memoryUsage().heapUsed;
      const startedAt = performance.now();
      await controller.paste({ chunkSize: 200 });
      const elapsedMs = performance.now() - startedAt;
      results.push({
        count,
        elapsedMs,
        renderRequests: fakeCanvas.requestRenderAllCalls - renderRequestsBeforePaste,
        objectCount: controller.getObjects().length,
        heapDeltaBytes: process.memoryUsage().heapUsed - heapBeforePaste
      });
    }

    results.forEach((result) => {
      expect(result.objectCount).toBeGreaterThanOrEqual(result.count * 2);
      expect(result.renderRequests).toBeLessThanOrEqual(1);
    });
    console.info("Detection bulk paste benchmark (fake Fabric):", JSON.stringify(results));
  });
});
