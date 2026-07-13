import { describe, expect, it, vi } from "vitest";

import { createAutomationLayoutPreview } from "../../../src/bootstrap/automation-layout-preview.js";
import { LAYOUT_SCHEMA_VERSION, type BoxLayout } from "../../../src/features/automation/types.js";

function createCanvas(width: number, height: number) {
  const context = {
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    drawImage: vi.fn(),
    fillText: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    setLineDash: vi.fn(),
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 1,
    font: ""
  };
  const canvas = {
    width,
    height,
    style: {},
    getContext: () => context,
    addEventListener: vi.fn()
  };
  return { canvas, context };
}

describe("automation layout preview", () => {
  it("fits layouts that extend far beyond the source image", () => {
    const previewCanvas = createCanvas(960, 560);
    const ghostCanvas = createCanvas(960, 560);
    const layout: BoxLayout = {
      schemaVersion: LAYOUT_SCHEMA_VERSION,
      id: "large-layout",
      name: "Large layout",
      sourceImageName: "source.png",
      sourceImageSize: { width: 100, height: 100 },
      sourceAnchor: { x: 0, y: 0 },
      boxes: [{
        id: "far-box",
        classId: "7",
        relativeX: 10_000,
        relativeY: -500,
        width: 200,
        height: 1_000,
        order: 0
      }],
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z"
    };
    const elements = {
      layoutPreviewCanvas: previewCanvas.canvas,
      layoutGhostCanvas: ghostCanvas.canvas,
      layoutPreviewZoomInput: { value: "100", addEventListener: vi.fn() },
      layoutPreviewZoomValue: { textContent: "" },
      layoutDetails: { textContent: "" },
      layoutPlacementNotice: { textContent: "", dataset: {} },
      previewBoxLayoutBtn: { click: vi.fn(), addEventListener: vi.fn() }
    };
    const preview = createAutomationLayoutPreview({
      state: {
        session: {
          currentImage: { width: 100, height: 100, naturalWidth: 100, naturalHeight: 100 },
          workflow: "detection"
        }
      } as never,
      elements: elements as never,
      canvasController: {
        raw: {
          canvas: { getWidth: () => 960, getHeight: () => 560, viewportTransform: [1, 0, 0, 1, 0, 0] },
          getObjects: () => []
        }
      } as never,
      getSelectedLayout: () => layout,
      getSelectedSetupLayout: () => layout,
      getGhostVisible: () => false
    });

    preview.renderLibraryPreview();

    expect(elements.layoutPreviewZoomValue.textContent).toBe("100%");
    expect(previewCanvas.context.strokeRect).toHaveBeenCalledTimes(1);
    const [x, y, width, height] = previewCanvas.context.strokeRect.mock.calls[0] as number[];
    expect([x, y, width, height].every(Number.isFinite)).toBe(true);
    expect(x).toBeGreaterThanOrEqual(0);
    expect(y).toBeGreaterThanOrEqual(0);
    expect(x + width).toBeLessThanOrEqual(previewCanvas.canvas.width);
    expect(y + height).toBeLessThanOrEqual(previewCanvas.canvas.height);

    preview.renderGhost();
    expect(ghostCanvas.context.strokeRect).not.toHaveBeenCalled();
    expect(elements.layoutPlacementNotice.textContent).toContain("preview hidden");
  });
});
