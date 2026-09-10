import type { EdgeSamDecodeInput, EdgeSamImageInput, EdgeSamMaskResult, EdgeSamService, EdgeSamStatus } from "./types.js";

interface WorkerMessageEvent {
  data: {
    id: number;
    ok: boolean;
    type?: "initialized" | "encoded" | "decoded";
    status?: Partial<EdgeSamStatus>;
    result?: EdgeSamMaskResult;
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

const initialStatus = (): EdgeSamStatus => ({
  phase: "idle",
  backend: null,
  imageCacheKey: null,
  encoderRuns: 0,
  message: null
});

export function createEdgeSamService(workerFactory?: () => WorkerLike): EdgeSamService {
  const createWorker = workerFactory ?? (() => new Worker(
    new URL("../../../workers/edgesam-worker.js", import.meta.url),
    { type: "module" }
  ) as unknown as WorkerLike);
  let worker = createWorker();
  let nextId = 0;
  let terminated = false;
  let initialized: Promise<EdgeSamStatus> | null = null;
  let preparedImageKey: string | null = null;
  let preparingImage: { cacheKey: string; promise: Promise<EdgeSamStatus> } | null = null;
  let status = initialStatus();
  const pending = new Map<number, PendingRequest<unknown>>();

  const rejectPending = (reason: unknown): void => {
    pending.forEach(({ reject }) => reject(reason));
    pending.clear();
  };

  const bindWorker = (): void => {
    worker.onmessage = (event) => {
      const response = event.data;
      if (response.status) {
        status = { ...status, ...response.status };
      }
      const request = pending.get(response.id);
      if (!request) return;
      pending.delete(response.id);
      if (!response.ok) {
        status = { ...status, phase: "error", message: response.error ?? "EdgeSAM worker failed" };
        request.reject(new Error(status.message ?? "EdgeSAM worker failed"));
        return;
      }
      request.resolve(response.result ?? status);
    };
    worker.onerror = (event) => {
      const error = new Error(event.message || "EdgeSAM worker crashed");
      status = { ...status, phase: "error", message: error.message };
      rejectPending(error);
    };
  };
  bindWorker();

  const request = <T>(operation: string, payload: Record<string, unknown> = {}, transfer: Transferable[] = []): Promise<T> => {
    if (terminated) return Promise.reject(new Error("EdgeSAM service disposed"));
    nextId += 1;
    const id = nextId;
    return new Promise<T>((resolve, reject) => {
      pending.set(id, { resolve, reject });
      worker.postMessage({ id, operation, ...payload }, transfer);
    });
  };

  const ensureInitialized = (): Promise<EdgeSamStatus> => {
    initialized ??= request<EdgeSamStatus>("INIT_MODEL").then((nextStatus) => {
      status = { ...status, ...nextStatus };
      return status;
    });
    return initialized;
  };

  return {
    async prepareImage(input: EdgeSamImageInput): Promise<EdgeSamStatus> {
      await ensureInitialized();
      if (preparedImageKey === input.cacheKey) return status;
      if (preparingImage?.cacheKey === input.cacheKey) return preparingImage.promise;
      status = { ...status, phase: "encoding", imageCacheKey: input.cacheKey, message: null };
      const promise = (async (): Promise<EdgeSamStatus> => {
        const rgba = new Uint8ClampedArray(input.rgba);
        const nextStatus = await request<EdgeSamStatus>("ENCODE_IMAGE", {
          image: { ...input, rgba: rgba.buffer }
        }, [rgba.buffer]);
        preparedImageKey = input.cacheKey;
        status = { ...status, ...nextStatus, phase: "ready", imageCacheKey: input.cacheKey };
        return status;
      })();
      preparingImage = { cacheKey: input.cacheKey, promise };
      try {
        return await promise;
      } finally {
        if (preparingImage?.promise === promise) preparingImage = null;
      }
    },

    async decode(input: EdgeSamDecodeInput): Promise<EdgeSamMaskResult> {
      if (!preparedImageKey) throw new Error("EdgeSAM needs an encoded image");
      const result = await request<EdgeSamMaskResult>("DECODE", { prompt: input });
      status = { ...status, phase: "ready", message: null };
      return result;
    },

    clear(): void {
      preparedImageKey = null;
      preparingImage = null;
      status = { ...status, imageCacheKey: null, phase: status.phase === "error" ? "error" : "idle" };
      void request<void>("CLEAR").catch(() => undefined);
    },

    dispose(): void {
      if (terminated) return;
      terminated = true;
      rejectPending(new Error("EdgeSAM service disposed"));
      worker.postMessage({ id: 0, operation: "DISPOSE" });
      worker.terminate();
    },

    getStatus(): EdgeSamStatus {
      return { ...status };
    }
  };
}
