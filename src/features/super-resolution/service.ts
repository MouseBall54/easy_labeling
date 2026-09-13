import type {
  SuperResolutionImageInput,
  SuperResolutionImageResult,
  SuperResolutionMode,
  SuperResolutionService,
  SuperResolutionStatus
} from "./types.js";

interface WorkerMessageEvent {
  data: {
    id: number;
    ok: boolean;
    result?: Omit<SuperResolutionImageResult, "rgba"> & { rgba: ArrayBuffer };
    status?: Partial<SuperResolutionStatus>;
    error?: string;
  };
}

interface WorkerLike {
  onmessage: ((event: WorkerMessageEvent) => void) | null;
  onerror: ((event: ErrorEvent) => void) | null;
  postMessage(message: unknown, transfer?: Transferable[]): void;
  terminate(): void;
}

interface PendingRequest<T> {
  resolve(value: T): void;
  reject(reason: unknown): void;
}

const initialStatus = (): SuperResolutionStatus => ({
  phase: "idle",
  backend: null,
  imageCacheKey: null,
  runs: 0,
  message: null
});

function getScale(mode: SuperResolutionMode): number {
  return mode === "cfsr-x4" ? 4 : 2;
}

export function createSuperResolutionService(workerFactory?: () => WorkerLike): SuperResolutionService {
  const createWorker = workerFactory ?? (() => new Worker(
    new URL("../../../workers/super-resolution-worker.js", import.meta.url),
    { type: "module" }
  ) as unknown as WorkerLike);
  const worker = createWorker();
  const pending = new Map<number, PendingRequest<unknown>>();
  const cache = new Map<string, SuperResolutionImageResult>();
  let nextId = 0;
  let terminated = false;
  let status = initialStatus();

  const rejectPending = (reason: unknown): void => {
    pending.forEach(({ reject }) => reject(reason));
    pending.clear();
  };

  worker.onmessage = (event) => {
    const response = event.data;
    if (response.status) status = { ...status, ...response.status };
    const request = pending.get(response.id);
    if (!request) return;
    if (response.ok && !response.result) return;
    pending.delete(response.id);
    if (!response.ok || !response.result) {
      const error = new Error(response.error ?? "Super Resolution worker failed");
      status = { ...status, phase: "error", message: error.message };
      request.reject(error);
      return;
    }
    request.resolve({
      ...response.result,
      rgba: new Uint8ClampedArray(response.result.rgba)
    });
  };
  worker.onerror = (event) => {
    const error = new Error(event.message || "Super Resolution worker crashed");
    status = { ...status, phase: "error", message: error.message };
    rejectPending(error);
  };

  const request = <T>(operation: string, payload: Record<string, unknown>, transfer: Transferable[]): Promise<T> => {
    if (terminated) return Promise.reject(new Error("Super Resolution service disposed"));
    const id = ++nextId;
    return new Promise<T>((resolve, reject) => {
      pending.set(id, { resolve, reject });
      worker.postMessage({ id, operation, ...payload }, transfer);
    });
  };

  return {
    async upscale(input): Promise<SuperResolutionImageResult> {
      if (input.width < 1 || input.height < 1 || input.rgba.length !== input.width * input.height * 4) {
        throw new Error("Super Resolution image dimensions are invalid");
      }
      const cached = cache.get(input.cacheKey);
      if (cached) return { ...cached, rgba: new Uint8ClampedArray(cached.rgba) };
      status = { ...status, phase: "upscaling", imageCacheKey: input.cacheKey, message: null };
      const rgba = new Uint8ClampedArray(input.rgba);
      const result = await request<SuperResolutionImageResult>("UPSCALE", {
        image: { ...input, rgba: rgba.buffer }
      }, [rgba.buffer]);
      const scale = getScale(input.mode);
      if (result.mode !== input.mode || result.width !== input.width * scale || result.height !== input.height * scale || result.rgba.length !== result.width * result.height * 4) {
        throw new Error(`Super Resolution model did not produce ${input.mode} RGBA output`);
      }
      const cachedResult = { ...result, rgba: new Uint8ClampedArray(result.rgba) };
      cache.set(input.cacheKey, cachedResult);
      status = { ...status, phase: "ready", imageCacheKey: input.cacheKey, message: null };
      return { ...cachedResult, rgba: new Uint8ClampedArray(cachedResult.rgba) };
    },

    clear(): void {
      cache.clear();
      status = { ...status, imageCacheKey: null, phase: status.phase === "error" ? "error" : "idle" };
    },

    dispose(): void {
      if (terminated) return;
      terminated = true;
      rejectPending(new Error("Super Resolution service disposed"));
      worker.postMessage({ id: 0, operation: "DISPOSE" });
      worker.terminate();
    },

    getStatus(): SuperResolutionStatus {
      return { ...status };
    }
  };
}
