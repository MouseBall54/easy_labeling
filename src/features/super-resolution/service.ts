import type {
  SuperResolutionImageInput,
  SuperResolutionImageResult,
  SuperResolutionService,
  SuperResolutionStatus,
  SuperResolutionStatusListener
} from "./types.js";
import { getSuperResolutionModel } from "./model-registry.js";

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
  mode: null,
  modelLabel: null,
  imageCacheKey: null,
  runs: 0,
  startedAt: null,
  elapsedMs: 0,
  completedUnits: 0,
  totalUnits: null,
  progressPercent: null,
  fallbackOccurred: false,
  fallbackReason: null,
  cacheHit: false,
  message: null
});

export function createSuperResolutionService(workerFactory?: () => WorkerLike): SuperResolutionService {
  const createWorker = workerFactory ?? (() => new Worker(
    new URL("../../../workers/super-resolution-worker.js", import.meta.url),
    { type: "module" }
  ) as unknown as WorkerLike);
  const worker = createWorker();
  const pending = new Map<number, PendingRequest<unknown>>();
  const cache = new Map<string, {
    result: SuperResolutionImageResult;
    backend: SuperResolutionStatus["backend"];
    fallbackOccurred: boolean;
    fallbackReason: string | null;
  }>();
  const listeners = new Set<SuperResolutionStatusListener>();
  let nextId = 0;
  let terminated = false;
  let status = initialStatus();

  const publishStatus = (next: Partial<SuperResolutionStatus>): void => {
    status = { ...status, ...next };
    listeners.forEach((listener) => {
      try {
        listener({ ...status });
      } catch {
        // A presentation listener must not interrupt inference or other subscribers.
      }
    });
  };

  const rejectPending = (reason: unknown): void => {
    pending.forEach(({ reject }) => reject(reason));
    pending.clear();
  };

  worker.onmessage = (event) => {
    const response = event.data;
    if (response.status) publishStatus(response.status);
    const request = pending.get(response.id);
    if (!request) return;
    if (response.ok && !response.result) return;
    pending.delete(response.id);
    if (!response.ok || !response.result) {
      const error = new Error(response.error ?? "Super Resolution worker failed");
      publishStatus({
        phase: "error",
        elapsedMs: status.startedAt ? Date.now() - status.startedAt : status.elapsedMs,
        message: error.message
      });
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
    publishStatus({
      phase: "error",
      elapsedMs: status.startedAt ? Date.now() - status.startedAt : status.elapsedMs,
      message: error.message
    });
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
      const model = getSuperResolutionModel(input.mode);
      if (cached) {
        publishStatus({
          phase: "ready",
          backend: cached.backend,
          mode: input.mode,
          modelLabel: model.label,
          imageCacheKey: input.cacheKey,
          startedAt: null,
          elapsedMs: 0,
          completedUnits: 1,
          totalUnits: 1,
          progressPercent: 100,
          fallbackOccurred: cached.fallbackOccurred,
          fallbackReason: cached.fallbackReason,
          cacheHit: true,
          message: "Loaded cached AI result"
        });
        return { ...cached.result, rgba: new Uint8ClampedArray(cached.result.rgba) };
      }
      publishStatus({
        phase: "preparing",
        backend: null,
        mode: input.mode,
        modelLabel: model.label,
        imageCacheKey: input.cacheKey,
        startedAt: Date.now(),
        elapsedMs: 0,
        completedUnits: 0,
        totalUnits: null,
        progressPercent: null,
        fallbackOccurred: false,
        fallbackReason: null,
        cacheHit: false,
        message: "Preparing image"
      });
      const rgba = new Uint8ClampedArray(input.rgba);
      let result: SuperResolutionImageResult;
      try {
        result = await request<SuperResolutionImageResult>("UPSCALE", {
          image: { ...input, rgba: rgba.buffer }
        }, [rgba.buffer]);
      } catch (error) {
        publishStatus({
          phase: "error",
          elapsedMs: status.startedAt ? Date.now() - status.startedAt : status.elapsedMs,
          message: error instanceof Error ? error.message : "AI enhancement failed"
        });
        throw error;
      }
      const expectedWidth = input.width * model.outputScale;
      const expectedHeight = input.height * model.outputScale;
      if (result.mode !== input.mode || result.width !== expectedWidth || result.height !== expectedHeight || result.rgba.length !== result.width * result.height * 4) {
        const error = new Error(`Enhancement model ${model.label} produced an unexpected RGBA output`);
        publishStatus({
          phase: "error",
          elapsedMs: status.startedAt ? Date.now() - status.startedAt : status.elapsedMs,
          message: error.message
        });
        throw error;
      }
      const cachedResult = { ...result, rgba: new Uint8ClampedArray(result.rgba) };
      cache.set(input.cacheKey, {
        result: cachedResult,
        backend: status.backend,
        fallbackOccurred: status.fallbackOccurred,
        fallbackReason: status.fallbackReason
      });
      publishStatus({
        phase: "ready",
        imageCacheKey: input.cacheKey,
        elapsedMs: status.startedAt ? Date.now() - status.startedAt : status.elapsedMs,
        completedUnits: status.totalUnits ?? status.completedUnits,
        progressPercent: 100,
        cacheHit: false,
        message: "AI enhancement complete"
      });
      return { ...cachedResult, rgba: new Uint8ClampedArray(cachedResult.rgba) };
    },

    clear(): void {
      cache.clear();
      publishStatus({ ...initialStatus(), runs: status.runs });
    },

    dispose(): void {
      if (terminated) return;
      terminated = true;
      rejectPending(new Error("Super Resolution service disposed"));
      worker.postMessage({ id: 0, operation: "DISPOSE" });
      worker.terminate();
      publishStatus({ ...initialStatus(), runs: status.runs });
      listeners.clear();
    },

    getStatus(): SuperResolutionStatus {
      return { ...status };
    },

    subscribeStatus(listener: SuperResolutionStatusListener): () => void {
      listeners.add(listener);
      try {
        listener({ ...status });
      } catch {
        // Keep the subscription active so a later status can still be rendered.
      }
      return () => listeners.delete(listener);
    }
  };
}
