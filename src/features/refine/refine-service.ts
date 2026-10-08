import type { RefineBoxInput, RefineParams, RefineResult } from "../../domain/refine/edge-refine.js";

export interface RefineService {
  /** Uploads the image once (gray conversion runs in the worker), then refines boxes against it. */
  refine(image: HTMLImageElement, boxes: readonly RefineBoxInput[], paramsByClass: Record<string, RefineParams>, neighbours: readonly RefineBoxInput[]): Promise<RefineResult[]>;
}

export function createRefineService(): RefineService {
  let worker: Worker | null = null;
  let nextId = 0;
  let loadedImage: HTMLImageElement | null = null;
  let imageKey = 0;
  let upload: Promise<void> = Promise.resolve();
  const pending = new Map<number, { resolve(value: unknown): void; reject(error: Error): void }>();

  const call = (message: Record<string, unknown>, transfer: Transferable[] = []): Promise<unknown> => {
    if (!worker) {
      worker = new Worker(new URL("../../../workers/refine-worker.js", import.meta.url), { type: "module" });
      worker.onmessage = ({ data }: MessageEvent<{ id: number; result?: unknown; error?: string }>) => {
        const request = pending.get(data.id);
        pending.delete(data.id);
        if (data.error) request?.reject(new Error(data.error));
        else request?.resolve(data.result);
      };
      worker.onerror = (event) => {
        pending.forEach((request) => request.reject(new Error(event.message || "Refine worker failed")));
        pending.clear();
        worker?.terminate();
        worker = null;
        loadedImage = null;
      };
    }
    const id = nextId++;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      worker?.postMessage({ ...message, id }, transfer);
    });
  };

  return {
    async refine(image, boxes, paramsByClass, neighbours) {
      if (loadedImage !== image) {
        loadedImage = image;
        const key = ++imageKey;
        // The image message must be posted before any refine message; the worker handles messages in order.
        upload = createImageBitmap(image).then((bitmap) => {
          call({ type: "image", key, bitmap }, [bitmap]).catch(() => { if (imageKey === key) loadedImage = null; });
        });
        upload.catch(() => { if (imageKey === key) loadedImage = null; });
      }
      await upload;
      return call({ type: "refine", key: imageKey, boxes, paramsByClass, neighbours }) as Promise<RefineResult[]>;
    }
  };
}
