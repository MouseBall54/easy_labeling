import { describe, expect, it, vi } from "vitest";

import { createTemplateWorkspace } from "../../../../src/features/automation/template-workspace.js";

type PointerListener = (event: PointerEvent) => void;

class FakeCanvas {
  width: number;
  height: number;
  readonly dataset: Record<string, string> = {};
  readonly attributes = new Map<string, string>();
  private readonly listeners = new Map<string, PointerListener[]>();
  private readonly context = {
    clearRect: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    setLineDash: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 40 })),
    filter: "none",
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 1,
    font: ""
  };

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  getContext(): CanvasRenderingContext2D {
    return this.context as unknown as CanvasRenderingContext2D;
  }

  getBoundingClientRect(): DOMRect {
    return { left: 0, top: 0, width: this.width, height: this.height } as DOMRect;
  }

  addEventListener(type: string, listener: EventListener): void {
    const listeners = this.listeners.get(type) ?? [];
    listeners.push(listener as PointerListener);
    this.listeners.set(type, listeners);
  }

  setPointerCapture(): void {}

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
  }

  dispatch(type: string, x: number, y: number, button = 0): void {
    const event = {
      clientX: x,
      clientY: y,
      button,
      pointerId: 1,
      preventDefault: vi.fn()
    } as unknown as PointerEvent;
    this.listeners.get(type)?.forEach((listener) => listener(event));
  }
}

describe("template workspace interaction modes", () => {
  it("keeps ROI drawing and result selection on separate pointer paths", () => {
    const canvas = new FakeCanvas(120, 90);
    const originalPreview = new FakeCanvas(240, 140);
    const processedPreview = new FakeCanvas(240, 140);
    const zoomInput = {
      value: "100",
      addEventListener: vi.fn()
    } as unknown as HTMLInputElement;
    const zoomValue = { textContent: "" } as HTMLElement;
    const onMatchClicked = vi.fn();
    const onMatchContextRequested = vi.fn();
    const workspace = createTemplateWorkspace({
      canvas: canvas as unknown as HTMLCanvasElement,
      zoomInput,
      zoomValue,
      originalPreviewCanvas: originalPreview as unknown as HTMLCanvasElement,
      processedPreviewCanvas: processedPreview as unknown as HTMLCanvasElement,
      onMatchClicked,
      onMatchContextRequested
    });

    workspace.bind();
    workspace.setImage({ naturalWidth: 120, naturalHeight: 90, width: 120, height: 90 } as HTMLImageElement);
    canvas.dispatch("pointerdown", 12, 14);
    workspace.setInteractionMode("template-roi");
    canvas.dispatch("pointerup", 45, 50);
    expect(workspace.getRoi()).toEqual({ x: 12, y: 14, width: 33, height: 36 });

    workspace.setMatchResults([{
      candidate: { score: 0.95, x: 10, y: 10, width: 30, height: 30 },
      selected: false,
      classId: "7"
    }]);
    workspace.setInteractionMode("select-results");
    canvas.dispatch("pointerdown", 20, 20);
    expect(onMatchClicked).toHaveBeenCalledWith(0);
    canvas.dispatch("pointerdown", 20, 20, 2);
    expect(onMatchClicked).toHaveBeenCalledTimes(1);
    canvas.dispatch("contextmenu", 20, 20);
    expect(onMatchContextRequested).toHaveBeenCalledWith({
      matchIndex: 0,
      clientX: 20,
      clientY: 20
    });
    canvas.dispatch("contextmenu", 100, 80);
    expect(onMatchContextRequested).toHaveBeenLastCalledWith({
      matchIndex: null,
      clientX: 100,
      clientY: 80
    });
    expect(workspace.getRoi()).toEqual({ x: 12, y: 14, width: 33, height: 36 });

    workspace.setInteractionMode("template-roi");
    canvas.dispatch("pointerdown", 20, 20);
    canvas.dispatch("pointerup", 60, 65);
    expect(workspace.getRoi()).toEqual({ x: 20, y: 20, width: 40, height: 45 });
    expect(canvas.dataset.interactionMode).toBe("template-roi");
  });
});
