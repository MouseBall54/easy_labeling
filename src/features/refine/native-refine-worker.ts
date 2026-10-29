import { getSegmentationPreprocessingKey, normalizeSegmentationPreprocessingConfig, type SegmentationPreprocessingConfig } from "../segmentation/preprocessing.js";

/** The slice of the Worker API refine-service.ts uses. */
export interface RefineWorkerLike {
  onmessage: ((event: MessageEvent<{ id: number; result?: unknown; error?: string }>) => void) | null;
  onerror: ((event: ErrorEvent) => void) | null;
  postMessage(message: Record<string, unknown>, transfer?: Transferable[]): void;
  terminate(): void;
}

type RefineSourceMessage = { kind: "original" } | { kind: "processed"; config?: Partial<SegmentationPreprocessingConfig> };

/**
 * Desktop builds: speaks the refine-worker protocol but refines in Rust. The real worker still decodes
 * the image off the main thread and hands over its gray pixels once; refine and crop then run natively.
 * Returns null outside the desktop app.
 */
export function createNativeRefineWorker(createDecoder: () => Worker): RefineWorkerLike | null {
  const native = globalThis.window?.easyLabelingNative;
  if (!native) return null;
  // Keys are per service; the session keeps two services from reading each other's image.
  const session = Math.random().toString(36).slice(2);
  let decoder: Worker | null = null;
  let terminated = false;
  let decodeId = 0;
  const decodePending = new Map<number, { resolve(value: unknown): void; reject(error: Error): void }>();
  let ready: Promise<unknown> = Promise.resolve();

  const decode = (message: Record<string, unknown>, transfer: Transferable[] = []): Promise<unknown> => {
    if (!decoder) {
      decoder = createDecoder();
      decoder.onmessage = ({ data }: MessageEvent<{ id: number; result?: unknown; error?: string }>) => {
        const request = decodePending.get(data.id);
        decodePending.delete(data.id);
        if (data.error) request?.reject(new Error(data.error));
        else request?.resolve(data.result);
      };
      decoder.onerror = (event) => {
        decodePending.forEach((request) => request.reject(new Error(event.message || "Refine worker failed")));
        decodePending.clear();
        decoder?.terminate();
        decoder = null;
      };
    }
    const id = ++decodeId;
    return new Promise((resolve, reject) => {
      decodePending.set(id, { resolve, reject });
      decoder?.postMessage({ ...message, id }, transfer);
    });
  };

  const toNativeSource = (source: RefineSourceMessage | undefined) => {
    if (source?.kind !== "processed") return { kind: "original" };
    const config = normalizeSegmentationPreprocessingConfig(source.config);
    return { kind: "processed", config, configKey: getSegmentationPreprocessingKey(config) };
  };

  const shim: RefineWorkerLike = {
    onmessage: null,
    onerror: null,
    postMessage(message, transfer = []) {
      const key = `${session}:${String(message.key)}`;
      let work: Promise<unknown>;
      if (message.type === "image") {
        work = ready = (async () => {
          await decode({ type: "image", key: message.key, bitmap: message.bitmap }, transfer);
          const { gray, width, height } = await decode({ type: "gray", key: message.key }) as { gray: Uint8Array; width: number; height: number };
          const headers = { "x-key": encodeURIComponent(key), "x-width": String(width), "x-height": String(height) };
          // Shared memory when available (a raw body crosses WebView2 at ~17 MB/s), else the raw body.
          const shared = native.upload ? await native.upload(gray).catch(() => null) : null;
          await (shared === null
            ? native.invoke("refine_load_image", gray, { headers })
            : native.invoke("refine_load_image", new Uint8Array(0), { headers: { ...headers, "x-shared-buffer": String(shared) } }));
          return null;
        })();
      } else if (message.type === "refine") {
        work = ready.then(() => native.invoke("refine_run", {
          request: {
            key,
            boxes: message.boxes,
            paramsByClass: message.paramsByClass,
            neighbours: message.neighbours,
            source: toNativeSource(message.source as RefineSourceMessage)
          }
        }));
      } else if (message.type === "crop") {
        const rect = message.rect as { x0: number; y0: number; x1: number; y1: number };
        work = ready.then(async () => {
          const bytes = await native.invoke<ArrayBuffer>("refine_crop", { key, rect, source: toNativeSource(message.source as RefineSourceMessage) });
          return { gray: new Uint8Array(bytes), width: rect.x1 - rect.x0, height: rect.y1 - rect.y0 };
        });
      } else {
        work = Promise.reject(new Error(`Unknown refine request: ${String(message.type)}`));
      }
      const id = message.id as number;
      work.then(
        (result) => { if (!terminated) shim.onmessage?.({ data: { id, result } } as MessageEvent<{ id: number; result?: unknown }>); },
        (error: unknown) => {
          if (!terminated) shim.onmessage?.({ data: { id, error: error instanceof Error ? error.message : String(error) } } as MessageEvent<{ id: number; error?: string }>);
        }
      );
    },
    terminate() {
      terminated = true;
      decoder?.terminate();
      decoder = null;
    }
  };
  return shim;
}
