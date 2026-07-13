import { describe, expect, it, vi } from "vitest";

import { createTemplateWorkspace } from "../../../../src/features/automation/template-workspace.js";

type PointerListener = (event: PointerEvent) => void;

class FakeScroller {
  readonly clientWidth = 100;
  readonly clientHeight = 70;
  scrollLeft = 40;
  scrollTop = 30;
  private readonly listeners = new Map<string, EventListener[]>();

  addEventListener(type: string, listener: EventListener): void {
    const listeners = this.listeners.get(type) ?? [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  getBoundingClientRect(): DOMRect {
    return { left: 0, top: 0, width: 100, height: 70 } as DOMRect;
  }

  dispatchWheel(deltaY: number, ctrlKey = true): { preventDefault: ReturnType<typeof vi.fn> } {
    const preventDefault = vi.fn();
    const event = { deltaY, ctrlKey, clientX: 50, clientY: 35, preventDefault } as unknown as WheelEvent;
    this.listeners.get("wheel")?.forEach((listener) => listener(event));
    return { preventDefault };
  }
}

class FakeStage {
  readonly style = {
    width: "",
    height: ""
  };
}

class FakeCanvas {
  width: number;
  height: number;
  readonly dataset: Record<string, string> = {};
  readonly style = {
    left: "",
    top: ""
  };
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

  getContextMock(): typeof this.context {
    return this.context;
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
    const scroller = new FakeScroller();
    const onMatchClicked = vi.fn();
    const onMatchContextRequested = vi.fn();
    const workspace = createTemplateWorkspace({
      canvas: canvas as unknown as HTMLCanvasElement,
      scroller: scroller as unknown as HTMLElement,
      stage: new FakeStage() as unknown as HTMLElement,
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
    canvas.dispatch("pointerup", 20, 20);
    expect(onMatchClicked).toHaveBeenCalledWith(0);
    canvas.dispatch("pointerdown", 20, 20, 2);
    expect(onMatchClicked).toHaveBeenCalledTimes(1);
    const scrollBeforePan = { left: scroller.scrollLeft, top: scroller.scrollTop };
    canvas.dispatch("pointerdown", 20, 20);
    canvas.dispatch("pointermove", 5, 5);
    canvas.dispatch("pointerup", 5, 5);
    expect(scroller.scrollLeft).toBe(scrollBeforePan.left + 15);
    expect(scroller.scrollTop).toBe(scrollBeforePan.top + 15);
    expect(onMatchClicked).toHaveBeenCalledTimes(1);

    const wheel = scroller.dispatchWheel(-100);
    expect(wheel.preventDefault).toHaveBeenCalled();
    expect(zoomInput.value).toBe("110");
    expect(zoomValue.textContent).toBe("110%");
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

    zoomInput.value = "100";
    workspace.setInteractionMode("template-roi");
    canvas.dispatch("pointerdown", 20, 20);
    canvas.dispatch("pointerup", 60, 65);
    expect(workspace.getRoi()).toEqual({ x: 20, y: 20, width: 40, height: 45 });
    expect(canvas.dataset.interactionMode).toBe("template-roi");
  });

  it("pans before matches exist and supports middle-button pan in ROI mode", () => {
    const canvas = new FakeCanvas(120, 90);
    const scroller = new FakeScroller();
    const workspace = createTemplateWorkspace({
      canvas: canvas as unknown as HTMLCanvasElement,
      scroller: scroller as unknown as HTMLElement,
      stage: new FakeStage() as unknown as HTMLElement,
      zoomInput: { value: "200", addEventListener: vi.fn() } as unknown as HTMLInputElement,
      zoomValue: { textContent: "" } as HTMLElement,
      originalPreviewCanvas: new FakeCanvas(240, 140) as unknown as HTMLCanvasElement,
      processedPreviewCanvas: new FakeCanvas(240, 140) as unknown as HTMLCanvasElement
    });

    workspace.bind();
    workspace.setImage({ naturalWidth: 120, naturalHeight: 90, width: 120, height: 90 } as HTMLImageElement);
    workspace.setInteractionMode("select-results");
    const selectPanStart = { left: scroller.scrollLeft, top: scroller.scrollTop };
    canvas.dispatch("pointerdown", 80, 60);
    canvas.dispatch("pointermove", 60, 45);
    canvas.dispatch("pointerup", 60, 45);
    expect(scroller.scrollLeft).toBe(selectPanStart.left + 20);
    expect(scroller.scrollTop).toBe(selectPanStart.top + 15);
    expect(workspace.getRoi()).toBeNull();

    workspace.setInteractionMode("template-roi");
    const middlePanStart = { left: scroller.scrollLeft, top: scroller.scrollTop };
    canvas.dispatch("pointerdown", 70, 50, 1);
    canvas.dispatch("pointermove", 50, 40);
    canvas.dispatch("pointerup", 50, 40);
    expect(scroller.scrollLeft).toBe(middlePanStart.left + 20);
    expect(scroller.scrollTop).toBe(middlePanStart.top + 10);
    expect(workspace.getRoi()).toBeNull();
  });

  it("adds pan margins and fits the image back to the centered viewport", () => {
    const canvas = new FakeCanvas(120, 90);
    const scroller = new FakeScroller();
    const stage = new FakeStage();
    const zoomInput = { value: "100", addEventListener: vi.fn() } as unknown as HTMLInputElement;
    const zoomValue = { textContent: "" } as HTMLElement;
    const workspace = createTemplateWorkspace({
      canvas: canvas as unknown as HTMLCanvasElement,
      scroller: scroller as unknown as HTMLElement,
      stage: stage as unknown as HTMLElement,
      zoomInput,
      zoomValue,
      originalPreviewCanvas: new FakeCanvas(240, 140) as unknown as HTMLCanvasElement,
      processedPreviewCanvas: new FakeCanvas(240, 140) as unknown as HTMLCanvasElement
    });

    workspace.setImage({ naturalWidth: 120, naturalHeight: 90, width: 120, height: 90 } as HTMLImageElement);
    expect(stage.style.width).toBe("320px");
    expect(stage.style.height).toBe("230px");
    expect(canvas.style.left).toBe("100px");
    expect(canvas.style.top).toBe("70px");

    workspace.fitToView();
    expect(zoomInput.value).toBe("42");
    expect(zoomValue.textContent).toBe("42%");
    expect(stage.style.width).toBe("250px");
    expect(stage.style.height).toBe("178px");
    expect(Number.parseFloat(canvas.style.left) - scroller.scrollLeft).toBeCloseTo((100 - canvas.width) / 2);
    expect(Number.parseFloat(canvas.style.top) - scroller.scrollTop).toBeCloseTo((70 - canvas.height) / 2);
  });

  it("keeps zoom while centering and highlighting a focused match", () => {
    const canvas = new FakeCanvas(1000, 800);
    const scroller = new FakeScroller();
    const zoomInput = { value: "250", addEventListener: vi.fn() } as unknown as HTMLInputElement;
    const zoomValue = { textContent: "" } as HTMLElement;
    const workspace = createTemplateWorkspace({
      canvas: canvas as unknown as HTMLCanvasElement,
      scroller: scroller as unknown as HTMLElement,
      stage: new FakeStage() as unknown as HTMLElement,
      zoomInput,
      zoomValue,
      originalPreviewCanvas: new FakeCanvas(240, 140) as unknown as HTMLCanvasElement,
      processedPreviewCanvas: new FakeCanvas(240, 140) as unknown as HTMLCanvasElement
    });

    workspace.bind();
    workspace.setImage({ naturalWidth: 1000, naturalHeight: 800, width: 1000, height: 800 } as HTMLImageElement);
    workspace.setMatchResults([{
      candidate: { score: 0.91, x: 600, y: 400, width: 20, height: 10 },
      selected: false,
      classId: "2"
    }]);
    workspace.focusMatch(0);

    expect(zoomInput.value).toBe("250");
    expect(zoomValue.textContent).toBe("250%");
    expect(canvas.dataset.focusedMatchIndex).toBe("0");
    expect(scroller.scrollLeft).toBeCloseTo(1575);
    expect(scroller.scrollTop).toBeCloseTo(1047.5);

    workspace.setMatchResults([{
      candidate: { score: 0.91, x: 600, y: 400, width: 20, height: 10 },
      selected: true,
      classId: "2"
    }]);
    expect(canvas.dataset.focusedMatchIndex).toBe("0");

    zoomInput.value = "999";
    scroller.dispatchWheel(-100);
    expect(zoomInput.value).toBe("1000");
    expect(zoomValue.textContent).toBe("1000%");
  });

  it("renders and clears a translucent layout preview at the calculated anchor", () => {
    const canvas = new FakeCanvas(120, 90);
    const workspace = createTemplateWorkspace({
      canvas: canvas as unknown as HTMLCanvasElement,
      scroller: new FakeScroller() as unknown as HTMLElement,
      stage: new FakeStage() as unknown as HTMLElement,
      zoomInput: { value: "100", addEventListener: vi.fn() } as unknown as HTMLInputElement,
      zoomValue: { textContent: "" } as HTMLElement,
      originalPreviewCanvas: new FakeCanvas(240, 140) as unknown as HTMLCanvasElement,
      processedPreviewCanvas: new FakeCanvas(240, 140) as unknown as HTMLCanvasElement
    });

    workspace.setImage({ naturalWidth: 120, naturalHeight: 90, width: 120, height: 90 } as HTMLImageElement);
    canvas.getContextMock().fillRect.mockClear();
    workspace.setLayoutPreview({
      matchPoint: { x: 10, y: 12 },
      anchor: { x: 15, y: 18 },
      boxes: [{ classId: "4", x: 15, y: 18, width: 20, height: 12 }]
    });

    expect(canvas.dataset.layoutPreview).toBe("true");
    expect(canvas.getContextMock().fillRect).toHaveBeenCalledWith(15, 18, 20, 12);

    workspace.setLayoutPreviewOpacity(0.35);
    expect(canvas.dataset.layoutPreviewOpacity).toBe("0.35");

    workspace.setLayoutPreview(null);
    expect(canvas.dataset.layoutPreview).toBe("false");
  });
});
