let worker: Worker | null = null;
let nextId = 0;
const pending = new Map<number, { resolve(result: { rgba: Uint8ClampedArray; opaque: boolean }): void; reject(error: Error): void }>();

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL("../../../workers/image-pixels-worker.js", import.meta.url), { type: "module" });
    worker.onmessage = ({ data }: MessageEvent<{ id: number; rgba?: Uint8ClampedArray; opaque?: boolean; error?: string }>) => {
      const request = pending.get(data.id);
      pending.delete(data.id);
      if (data.rgba) request?.resolve({ rgba: data.rgba, opaque: data.opaque === true });
      else request?.reject(new Error(data.error ?? "Reading image pixels failed"));
    };
    worker.onerror = (event) => {
      pending.forEach((request) => request.reject(new Error(event.message || "Image pixel worker failed")));
      pending.clear();
      worker?.terminate();
      worker = null;
    };
  }
  return worker;
}

/**
 * The RGBA a canvas reads back from `image` drawn at its natural size (drawImage + getImageData), read in a
 * worker so the UI thread does not stall on large images. Only opaque results are returned: with transparency
 * the worker's alpha premultiplication may round differently from the page's canvas, so the caller reads those
 * on the page as before (null). Null too when workers or OffscreenCanvas are missing or the read fails.
 */
export async function readOpaquePixelsOffThread(image: ImageBitmapSource, width: number, height: number): Promise<Uint8ClampedArray | null> {
  if (typeof Worker === "undefined" || typeof OffscreenCanvas === "undefined" || typeof createImageBitmap === "undefined") return null;
  try {
    const bitmap = await createImageBitmap(image);
    if (bitmap.width !== width || bitmap.height !== height) {
      bitmap.close();
      return null;
    }
    const id = nextId++;
    const { rgba, opaque } = await new Promise<{ rgba: Uint8ClampedArray; opaque: boolean }>((resolve, reject) => {
      pending.set(id, { resolve, reject });
      getWorker().postMessage({ id, bitmap }, [bitmap]);
    });
    return opaque ? rgba : null;
  } catch (error) {
    console.warn("Reading image pixels off the UI thread failed; reading them on the page.", error);
    return null;
  }
}
