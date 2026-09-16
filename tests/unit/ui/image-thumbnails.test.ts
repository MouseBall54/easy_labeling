import { describe, expect, it, vi } from "vitest";

import { createImageThumbnailLoader, isThumbnailableFileName, THUMBNAIL_SIZE_PX } from "../../../src/ui/image-thumbnails.js";
import type { FileHandle } from "../../../src/types/files.js";

class FakeCanvasRenderingContext2D {
  public cleared = false;
  public drawnBitmap: unknown = null;
  clearRect(): void {
    this.cleared = true;
  }
  drawImage(bitmap: unknown): void {
    this.drawnBitmap = bitmap;
  }
}

class FakeCanvas {
  public isConnected = true;
  public dataset: Record<string, string> = {};
  public width = THUMBNAIL_SIZE_PX;
  public height = THUMBNAIL_SIZE_PX;
  private readonly ctx = new FakeCanvasRenderingContext2D();
  getContext(): FakeCanvasRenderingContext2D {
    return this.ctx;
  }
}

class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  public observed: unknown[] = [];
  public callback: (entries: Array<{ isIntersecting: boolean; target: unknown }>, observer: FakeIntersectionObserver) => void;

  constructor(callback: FakeIntersectionObserver["callback"]) {
    this.callback = callback;
    FakeIntersectionObserver.instances.push(this);
  }

  observe(target: unknown): void {
    this.observed.push(target);
  }

  unobserve(target: unknown): void {
    this.observed = this.observed.filter((item) => item !== target);
  }

  disconnect(): void {
    this.observed = [];
  }

  triggerIntersect(target: unknown): void {
    this.callback([{ isIntersecting: true, target }], this);
  }
}

function fileHandle(name: string): FileHandle {
  return { name, getFile: async () => ({ name }) } as unknown as FileHandle;
}

describe("isThumbnailableFileName", () => {
  it("accepts jpg/jpeg/png/gif and rejects tif/tiff", () => {
    expect(isThumbnailableFileName("a.jpg")).toBe(true);
    expect(isThumbnailableFileName("a.JPEG")).toBe(true);
    expect(isThumbnailableFileName("a.png")).toBe(true);
    expect(isThumbnailableFileName("a.gif")).toBe(true);
    expect(isThumbnailableFileName("a.tif")).toBe(false);
    expect(isThumbnailableFileName("a.tiff")).toBe(false);
  });
});

describe("createImageThumbnailLoader", () => {
  it("decodes a thumbnail only once observed, then reuses the cache on later renders", async () => {
    FakeIntersectionObserver.instances = [];
    const bitmap = { close: vi.fn() };
    const createImageBitmapFn = vi.fn(async () => bitmap);
    const canvas = new FakeCanvas();
    canvas.dataset.thumbFile = "sample.jpg";
    canvas.dataset.thumbState = "pending";

    const container = {
      querySelectorAll: () => [canvas]
    } as unknown as HTMLElement;

    const loader = createImageThumbnailLoader({
      resolveFileHandle: (name) => fileHandle(name),
      createImageBitmapFn: createImageBitmapFn as unknown as (blob: Blob, options?: unknown) => Promise<ImageBitmap>,
      IntersectionObserverCtor: FakeIntersectionObserver as unknown as typeof IntersectionObserver
    });

    loader.observe(container);
    expect(createImageBitmapFn).not.toHaveBeenCalled();

    const observerInstance = FakeIntersectionObserver.instances[0];
    observerInstance.triggerIntersect(canvas);
    await vi.waitFor(() => expect(canvas.dataset.thumbState).toBe("ready"));
    expect(createImageBitmapFn).toHaveBeenCalledTimes(1);

    // Second render with a fresh canvas for the same file should paint
    // straight from the cache, no second decode.
    const secondCanvas = new FakeCanvas();
    secondCanvas.dataset.thumbFile = "sample.jpg";
    secondCanvas.dataset.thumbState = "pending";
    const secondContainer = { querySelectorAll: () => [secondCanvas] } as unknown as HTMLElement;
    loader.observe(secondContainer);

    expect(secondCanvas.dataset.thumbState).toBe("ready");
    expect(createImageBitmapFn).toHaveBeenCalledTimes(1);
  });

  it("falls back to a plain decode when resize options are rejected", async () => {
    FakeIntersectionObserver.instances = [];
    const bitmap = { close: vi.fn() };
    const createImageBitmapFn = vi.fn(async (_blob: unknown, options?: unknown) => {
      if (options) {
        throw new Error("resize options unsupported");
      }
      return bitmap;
    });
    const canvas = new FakeCanvas();
    canvas.dataset.thumbFile = "fallback.png";
    canvas.dataset.thumbState = "pending";
    const container = { querySelectorAll: () => [canvas] } as unknown as HTMLElement;

    const loader = createImageThumbnailLoader({
      resolveFileHandle: (name) => fileHandle(name),
      createImageBitmapFn: createImageBitmapFn as unknown as (blob: Blob, options?: unknown) => Promise<ImageBitmap>,
      IntersectionObserverCtor: FakeIntersectionObserver as unknown as typeof IntersectionObserver
    });

    loader.observe(container);
    FakeIntersectionObserver.instances[0].triggerIntersect(canvas);
    await vi.waitFor(() => expect(canvas.dataset.thumbState).toBe("ready"));
    expect(createImageBitmapFn).toHaveBeenCalledTimes(2);
  });

  it("paints a replacement canvas for the same file when the list re-renders mid-decode", async () => {
    // renderImageList() tears down and rebuilds the whole list (several
    // times during app startup), so a decode that was still in flight for
    // the old (now-detached) canvas must still reach the new one.
    FakeIntersectionObserver.instances = [];
    let resolveDecode: (bitmap: unknown) => void = () => {};
    const bitmap = { close: vi.fn() };
    const createImageBitmapFn = vi.fn(() => new Promise((resolve) => {
      resolveDecode = resolve;
    }));

    const loader = createImageThumbnailLoader({
      resolveFileHandle: (name) => fileHandle(name),
      createImageBitmapFn: createImageBitmapFn as unknown as (blob: Blob, options?: unknown) => Promise<ImageBitmap>,
      IntersectionObserverCtor: FakeIntersectionObserver as unknown as typeof IntersectionObserver
    });

    const firstCanvas = new FakeCanvas();
    firstCanvas.dataset.thumbFile = "shared.jpg";
    firstCanvas.dataset.thumbState = "pending";
    loader.observe({ querySelectorAll: () => [firstCanvas] } as unknown as HTMLElement);
    FakeIntersectionObserver.instances[0].triggerIntersect(firstCanvas);
    // Decode is now in flight (unresolved) for firstCanvas.

    // Re-render replaces the list: firstCanvas is detached, a fresh
    // secondCanvas for the SAME file takes its place.
    firstCanvas.isConnected = false;
    const secondCanvas = new FakeCanvas();
    secondCanvas.dataset.thumbFile = "shared.jpg";
    secondCanvas.dataset.thumbState = "pending";
    loader.observe({ querySelectorAll: () => [secondCanvas] } as unknown as HTMLElement);
    FakeIntersectionObserver.instances[0].triggerIntersect(secondCanvas);

    // decodeThumbnail awaits fileHandle.getFile() before it calls
    // createImageBitmapFn, so resolveDecode isn't assigned yet on the same
    // microtask turn -- wait for the mock to actually be invoked first.
    await vi.waitFor(() => expect(createImageBitmapFn).toHaveBeenCalled());
    resolveDecode(bitmap);
    await vi.waitFor(() => expect(secondCanvas.dataset.thumbState).toBe("ready"));
    expect(createImageBitmapFn).toHaveBeenCalledTimes(1);
  });

  it("marks the canvas as failed without throwing when decoding errors", async () => {
    FakeIntersectionObserver.instances = [];
    const createImageBitmapFn = vi.fn(async () => {
      throw new Error("decode failed");
    });
    const canvas = new FakeCanvas();
    canvas.dataset.thumbFile = "broken.jpg";
    canvas.dataset.thumbState = "pending";
    const container = { querySelectorAll: () => [canvas] } as unknown as HTMLElement;

    const loader = createImageThumbnailLoader({
      resolveFileHandle: (name) => fileHandle(name),
      createImageBitmapFn: createImageBitmapFn as unknown as (blob: Blob, options?: unknown) => Promise<ImageBitmap>,
      IntersectionObserverCtor: FakeIntersectionObserver as unknown as typeof IntersectionObserver
    });

    loader.observe(container);
    FakeIntersectionObserver.instances[0].triggerIntersect(canvas);
    await vi.waitFor(() => expect(canvas.dataset.thumbState).toBe("failed"));
  });

  it("never observes a TIFF thumbnail canvas even if one is present in the DOM", () => {
    FakeIntersectionObserver.instances = [];
    const createImageBitmapFn = vi.fn();
    const canvas = new FakeCanvas();
    canvas.dataset.thumbFile = "scan.tiff";
    canvas.dataset.thumbState = "pending";
    const container = { querySelectorAll: () => [canvas] } as unknown as HTMLElement;

    const loader = createImageThumbnailLoader({
      resolveFileHandle: (name) => fileHandle(name),
      createImageBitmapFn: createImageBitmapFn as unknown as (blob: Blob, options?: unknown) => Promise<ImageBitmap>,
      IntersectionObserverCtor: FakeIntersectionObserver as unknown as typeof IntersectionObserver
    });

    loader.observe(container);
    const observerInstance = FakeIntersectionObserver.instances[0];
    observerInstance.triggerIntersect(canvas);

    expect(createImageBitmapFn).not.toHaveBeenCalled();
  });
});
