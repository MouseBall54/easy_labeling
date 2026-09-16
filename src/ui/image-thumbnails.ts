import type { FileHandle } from "../types/files.js";

export const THUMBNAIL_SIZE_PX = 28;
const THUMBNAIL_DECODE_SIZE_PX = 56; // 2x for HiDPI; canvas is still drawn at THUMBNAIL_SIZE_PX.

// TIFF decoding goes through a slow WASM decoder (tiff.js) rather than the
// browser's native image codecs, so eagerly thumbnailing every visible TIFF
// row during a scroll would reintroduce the exact class of main-thread
// slowdown fixed elsewhere in this app for large TIFF files. Skip them; the
// status icon still shows whether the image is labeled.
// ponytail: no TIFF thumbnail at all, revisit with an explicit low-res
// TIFF-only decode path if this becomes a frequently requested format.
export function isThumbnailableFileName(fileName: string): boolean {
  return /\.(jpg|jpeg|png|gif)$/i.test(fileName);
}

type CreateImageBitmapFn = (
  blob: Blob,
  options?: { resizeWidth?: number; resizeHeight?: number; resizeQuality?: "low" | "medium" | "high" | "pixelated" }
) => Promise<ImageBitmap>;

export interface ImageThumbnailLoaderDeps {
  resolveFileHandle(fileName: string): FileHandle | undefined;
  createImageBitmapFn?: CreateImageBitmapFn;
  IntersectionObserverCtor?: typeof IntersectionObserver;
}

export interface ImageThumbnailLoader {
  /** Call after every image-list render to (re)attach observers to the current DOM. */
  observe(containerElement: HTMLElement): void;
  dispose(): void;
}

async function decodeThumbnail(
  fileHandle: FileHandle,
  createImageBitmapFn: CreateImageBitmapFn
): Promise<ImageBitmap> {
  const file = await fileHandle.getFile();
  try {
    return await createImageBitmapFn(file, {
      resizeWidth: THUMBNAIL_DECODE_SIZE_PX,
      resizeHeight: THUMBNAIL_DECODE_SIZE_PX,
      resizeQuality: "medium"
    });
  } catch {
    // Some browsers reject unsupported resize option combinations instead
    // of ignoring them -- fall back to a full decode; drawImage below still
    // downscales it into the small canvas.
    return createImageBitmapFn(file);
  }
}

export function createImageThumbnailLoader(deps: ImageThumbnailLoaderDeps): ImageThumbnailLoader {
  const createImageBitmapFn = deps.createImageBitmapFn ?? globalThis.createImageBitmap?.bind(globalThis);
  const ObserverCtor = deps.IntersectionObserverCtor ?? globalThis.IntersectionObserver;

  const cache = new Map<string, ImageBitmap | "failed">();
  // The image list gets fully torn down and rebuilt (innerHTML = "") on every
  // renderImageList() call -- and that happens several times during initial
  // app load. A decode started against a canvas from an earlier render can
  // still be in flight when a newer canvas for the same file appears, so
  // every canvas currently waiting on a given file's decode is tracked here
  // and painted once it resolves, not just the one that started it.
  const waiters = new Map<string, Set<HTMLCanvasElement>>();

  function paint(canvas: HTMLCanvasElement, bitmap: ImageBitmap): void {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  }

  function settle(fileName: string, canvas: HTMLCanvasElement, result: ImageBitmap | "failed"): void {
    if (!canvas.isConnected) {
      return;
    }
    if (result === "failed") {
      canvas.dataset.thumbState = "failed";
      return;
    }
    paint(canvas, result);
    canvas.dataset.thumbState = "ready";
  }

  async function loadOne(fileName: string, canvas: HTMLCanvasElement): Promise<void> {
    const cached = cache.get(fileName);
    if (cached) {
      settle(fileName, canvas, cached);
      return;
    }

    const existingWaiters = waiters.get(fileName);
    if (existingWaiters) {
      existingWaiters.add(canvas);
      return;
    }
    if (!createImageBitmapFn) {
      return;
    }
    const fileHandle = deps.resolveFileHandle(fileName);
    if (!fileHandle) {
      return;
    }

    waiters.set(fileName, new Set([canvas]));
    let result: ImageBitmap | "failed";
    try {
      result = await decodeThumbnail(fileHandle, createImageBitmapFn);
      cache.set(fileName, result);
    } catch {
      result = "failed";
      cache.set(fileName, result);
    }
    const targets = waiters.get(fileName);
    waiters.delete(fileName);
    targets?.forEach((target) => settle(fileName, target, result));
  }

  // The image list is torn down and rebuilt wholesale on every render, so
  // canvases observed but never intersected before their render was
  // replaced would otherwise stay pinned in the observer's target list
  // forever (IntersectionObserver does not auto-drop detached targets).
  const observedCanvases = new Set<HTMLCanvasElement>();

  const observer = ObserverCtor
    ? new ObserverCtor((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        const canvas = entry.target as HTMLCanvasElement;
        if (typeof canvas.getContext !== "function" || !canvas.dataset) {
          return;
        }
        obs.unobserve(canvas);
        observedCanvases.delete(canvas);
        const fileName = canvas.dataset.thumbFile;
        if (fileName && isThumbnailableFileName(fileName)) {
          void loadOne(fileName, canvas);
        }
      });
    }, { rootMargin: "200px 0px" })
    : null;

  return {
    observe(containerElement: HTMLElement): void {
      if (observer) {
        observedCanvases.forEach((canvas) => {
          if (!canvas.isConnected) {
            observer.unobserve(canvas);
            observedCanvases.delete(canvas);
          }
        });
      }
      const canvases = containerElement.querySelectorAll<HTMLCanvasElement>('canvas[data-thumb-file][data-thumb-state="pending"]');
      canvases.forEach((canvas) => {
        const fileName = canvas.dataset.thumbFile;
        if (!fileName) {
          return;
        }
        const cached = cache.get(fileName);
        if (cached && cached !== "failed") {
          paint(canvas, cached);
          canvas.dataset.thumbState = "ready";
          return;
        }
        if (cached === "failed") {
          canvas.dataset.thumbState = "failed";
          return;
        }
        if (observer) {
          observer.observe(canvas);
          observedCanvases.add(canvas);
        } else {
          void loadOne(fileName, canvas);
        }
      });
    },
    dispose(): void {
      observer?.disconnect();
      observedCanvases.clear();
      cache.forEach((value) => {
        if (value !== "failed") {
          value.close();
        }
      });
      cache.clear();
    }
  };
}
