import type { GrayImage, RefineBoxInput, RefineParams, RefineRect, RefineResult } from "../../domain/refine/edge-refine.js";
import type { SegmentationPreprocessingConfig } from "../segmentation/preprocessing.js";

/** Which pixels refinement reads; "processed" carries the Preprocess panel's config. */
export type RefineImageInput = { kind: "original" } | { kind: "processed"; config: SegmentationPreprocessingConfig | undefined };

export interface RefineService {
  /** Uploads the image once (gray conversion runs in the worker), then refines boxes against it. */
  refine(
    image: HTMLImageElement,
    boxes: readonly RefineBoxInput[],
    paramsByClass: Record<string, RefineParams>,
    neighbours: readonly RefineBoxInput[],
    source: RefineImageInput
  ): Promise<RefineResult[]>;
  /** The gray pixels refinement sees inside rect (clamped to the image), for the Refine Lab. */
  crop(image: HTMLImageElement, rect: RefineRect, source: RefineImageInput): Promise<GrayImage & { x0: number; y0: number }>;
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

  const ensureImage = async (image: HTMLImageElement): Promise<number> => {
    if (loadedImage !== image) {
      loadedImage = image;
      const key = ++imageKey;
      // The image message must be posted before any request for it; the worker handles messages in order.
      upload = createImageBitmap(image).then((bitmap) => {
        call({ type: "image", key, bitmap }, [bitmap]).catch(() => { if (imageKey === key) loadedImage = null; });
      });
      upload.catch(() => { if (imageKey === key) loadedImage = null; });
    }
    await upload;
    return imageKey;
  };

  return {
    async refine(image, boxes, paramsByClass, neighbours, source) {
      const key = await ensureImage(image);
      return call({ type: "refine", key, boxes, paramsByClass, neighbours, source }) as Promise<RefineResult[]>;
    },
    async crop(image, rect, source) {
      const key = await ensureImage(image);
      const width = image.naturalWidth || image.width;
      const height = image.naturalHeight || image.height;
      const x0 = Math.max(0, Math.floor(rect.x0));
      const y0 = Math.max(0, Math.floor(rect.y0));
      const x1 = Math.max(x0 + 1, Math.min(width, Math.ceil(rect.x1)));
      const y1 = Math.max(y0 + 1, Math.min(height, Math.ceil(rect.y1)));
      const result = await call({ type: "crop", key, rect: { x0, y0, x1, y1 }, source }) as GrayImage;
      return { ...result, x0, y0 };
    }
  };
}
