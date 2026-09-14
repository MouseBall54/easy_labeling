import { describe, expect, it, vi } from "vitest";

import { createSuperResolutionService } from "../../../../src/features/super-resolution/service.js";
import type { SuperResolutionMode } from "../../../../src/features/super-resolution/types.js";

function createWorker() {
  const worker = {
    onmessage: null as ((event: { data: unknown }) => void) | null,
    onerror: null as ((event: ErrorEvent) => void) | null,
    postMessage: vi.fn((message: { id: number; operation: string; image?: { width: number; height: number; cacheKey: string; mode: SuperResolutionMode } }) => {
      if (message.operation !== "UPSCALE") return;
      const scale = message.image?.mode === "cfsr-x4" ? 4 : message.image?.mode === "cfsr-x2" ? 2 : 1;
      const width = (message.image?.width ?? 0) * scale;
      const height = (message.image?.height ?? 0) * scale;
      queueMicrotask(() => worker.onmessage?.({
        data: {
          id: message.id,
          ok: true,
          status: { phase: "upscaling", backend: "wasm", completedUnits: 1, totalUnits: 2, progressPercent: 50, message: "Processing tile 1 of 2" }
        }
      }));
      queueMicrotask(() => worker.onmessage?.({
        data: {
          id: message.id,
          ok: true,
          status: { phase: "ready", backend: "wasm", imageCacheKey: message.image?.cacheKey, runs: 1 },
          result: { mode: message.image?.mode, width, height, cacheKey: message.image?.cacheKey, rgba: new Uint8ClampedArray(width * height * 4).buffer }
        }
      }));
    }),
    terminate: vi.fn()
  };
  return worker;
}

describe("super resolution service", () => {
  it("caches x2 results by image/config key without rerunning the worker", async () => {
    const worker = createWorker();
    const service = createSuperResolutionService(() => worker);
    const input = { cacheKey: "image-1:sr:cfsr-x2", mode: "cfsr-x2" as const, width: 2, height: 3, rgba: new Uint8ClampedArray(2 * 3 * 4) };

    const first = await service.upscale(input);
    const second = await service.upscale(input);

    expect(first).toMatchObject({ width: 4, height: 6, cacheKey: input.cacheKey });
    expect(second.rgba).not.toBe(first.rgba);
    expect(worker.postMessage).toHaveBeenCalledTimes(1);
    expect(service.getStatus()).toMatchObject({ phase: "ready", backend: "wasm", imageCacheKey: input.cacheKey });
  });

  it("validates and returns CFSR x4 results", async () => {
    const service = createSuperResolutionService(createWorker);
    const input = { cacheKey: "image-1:sr:cfsr-x4", mode: "cfsr-x4" as const, width: 2, height: 3, rgba: new Uint8ClampedArray(2 * 3 * 4) };

    await expect(service.upscale(input)).resolves.toMatchObject({ mode: "cfsr-x4", width: 8, height: 12 });
  });

  it("publishes intermediate progress, completion, cache hits, and clear state", async () => {
    const worker = createWorker();
    const service = createSuperResolutionService(() => worker);
    const statuses: ReturnType<typeof service.getStatus>[] = [];
    const unsubscribe = service.subscribeStatus((status) => statuses.push(status));
    const input = { cacheKey: "image-progress:sr:cfsr-x2", mode: "cfsr-x2" as const, width: 2, height: 2, rgba: new Uint8ClampedArray(16) };

    await service.upscale(input);
    expect(statuses).toEqual(expect.arrayContaining([
      expect.objectContaining({ phase: "preparing", mode: "cfsr-x2", modelLabel: "CFSR x2", progressPercent: null }),
      expect.objectContaining({ phase: "upscaling", completedUnits: 1, totalUnits: 2, progressPercent: 50 }),
      expect.objectContaining({ phase: "ready", progressPercent: 100, cacheHit: false })
    ]));

    await service.upscale(input);
    expect(service.getStatus()).toMatchObject({ phase: "ready", cacheHit: true, message: "Loaded cached AI result" });
    expect(statuses.at(-1)).toMatchObject({ phase: "ready", cacheHit: true });
    expect(worker.postMessage).toHaveBeenCalledTimes(1);
    service.clear();
    expect(service.getStatus()).toMatchObject({ phase: "idle", imageCacheKey: null, progressPercent: null });
    unsubscribe();
  });

  it("publishes worker errors and an idle final state on dispose", async () => {
    const worker = createWorker();
    worker.postMessage.mockImplementation((message: { id: number; operation: string }) => {
      if (message.operation !== "UPSCALE") return;
      queueMicrotask(() => worker.onmessage?.({
        data: { id: message.id, ok: false, error: "inference stopped", status: { phase: "error", message: "inference stopped" } }
      }));
    });
    const service = createSuperResolutionService(() => worker);
    const statuses: ReturnType<typeof service.getStatus>[] = [];
    service.subscribeStatus((status) => statuses.push(status));

    await expect(service.upscale({
      cacheKey: "image-error:sr:cfsr-x2",
      mode: "cfsr-x2",
      width: 1,
      height: 1,
      rgba: new Uint8ClampedArray(4)
    })).rejects.toThrow("inference stopped");
    expect(service.getStatus()).toMatchObject({ phase: "error", message: "inference stopped" });

    service.dispose();
    expect(statuses.at(-1)).toMatchObject({ phase: "idle", imageCacheKey: null });
    expect(worker.terminate).toHaveBeenCalledOnce();
  });

  it("preserves a WebGPU fallback reason from the worker", async () => {
    const worker = createWorker();
    worker.postMessage.mockImplementation((message: { id: number; operation: string; image?: { cacheKey: string; mode: SuperResolutionMode; width: number; height: number } }) => {
      if (message.operation !== "UPSCALE" || !message.image) return;
      const { image } = message;
      queueMicrotask(() => worker.onmessage?.({
        data: {
          id: message.id,
          ok: true,
          status: {
            phase: "ready",
            backend: "wasm",
            imageCacheKey: image.cacheKey,
            fallbackOccurred: true,
            fallbackReason: "WebGPU initialization failed: GPU limit unsupported"
          },
          result: { mode: image.mode, width: image.width, height: image.height, cacheKey: image.cacheKey, rgba: new Uint8ClampedArray(image.width * image.height * 4).buffer }
        }
      }));
    });
    const service = createSuperResolutionService(() => worker);

    await service.upscale({
      cacheKey: "image-fallback:sr:tk-r-em-hrsem",
      mode: "tk-r-em-hrsem",
      width: 4,
      height: 3,
      rgba: new Uint8ClampedArray(4 * 3 * 4)
    });

    expect(service.getStatus()).toMatchObject({
      backend: "wasm",
      fallbackOccurred: true,
      fallbackReason: "WebGPU initialization failed: GPU limit unsupported"
    });
  });

  it.each(["tk-r-em-hrsem", "tk-r-em-hrtem", "tk-r-em-lrsem", "tk-r-em-lrtem"] as const)(
    "validates same-size %s restoration results",
    async (mode) => {
      const service = createSuperResolutionService(createWorker);
      const input = { cacheKey: `image-1:sr:${mode}`, mode, width: 5, height: 7, rgba: new Uint8ClampedArray(5 * 7 * 4) };

      await expect(service.upscale(input)).resolves.toMatchObject({ mode, width: 5, height: 7 });
    }
  );
});
