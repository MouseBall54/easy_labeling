import type { Detection, ModelInput, OutputFormat } from "./yolo.js";

export interface InferenceBackendStatus {
  backend: "webgpu" | "wasm" | null;
  fallbackReason: string | null;
}

export function createInferenceService(onStatus?: (status: InferenceBackendStatus) => void) {
  const worker = new Worker(new URL("../../../workers/yolo-inference-worker.js", import.meta.url), { type: "module" });
  let id = 0;
  let disposed = false;
  const pending = new Map<number, { resolve(value: unknown): void; reject(error: Error): void }>();
  worker.onmessage = ({ data }: MessageEvent<{ id: number; result?: unknown; error?: string; status?: InferenceBackendStatus }>) => {
    const request = pending.get(data.id);
    if (!request) return;
    if (data.status) onStatus?.(data.status);
    pending.delete(data.id);
    if (data.error) request.reject(new Error(data.error));
    else request.resolve(data.result);
  };
  const dispose = (): void => {
    disposed = true;
    worker.terminate();
    pending.forEach(({ reject }) => reject(new Error("Inference stopped. Reload the model to continue.")));
    pending.clear();
  };
  worker.onerror = (event) => {
    pending.forEach(({ reject }) => reject(new Error(event.message || "Inference worker failed.")));
    dispose();
  };
  const request = <T>(payload: Record<string, unknown>, transfer: Transferable[]): Promise<T> => {
    if (disposed) return Promise.reject(new Error("Reload the model to continue."));
    return new Promise<T>((resolve, reject) => {
      const requestId = ++id;
      pending.set(requestId, { resolve: (value) => resolve(value as T), reject });
      try { worker.postMessage({ id: requestId, ...payload }, transfer); }
      catch (error) { pending.delete(requestId); reject(error); }
    });
  };
  return {
    load(model: ArrayBuffer, size: number): Promise<ModelInput> {
      return request({ operation: "LOAD", model, size }, [model]);
    },
    infer(image: HTMLImageElement, options: { confidence: number; iou: number; format: OutputFormat; maxDet?: number }): Promise<Detection[]> {
      const width = image.naturalWidth || image.width;
      const height = image.naturalHeight || image.height;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) throw new Error("Image pixels are unavailable.");
      context.drawImage(image, 0, 0);
      const rgba = context.getImageData(0, 0, width, height).data;
      return request({ operation: "INFER", rgba: rgba.buffer, width, height, options }, [rgba.buffer]);
    },
    dispose
  };
}
