import { describe, expect, it, vi } from "vitest";

import { createSuperResolutionService } from "../../../../src/features/super-resolution/service.js";

function createWorker() {
  const worker = {
    onmessage: null as ((event: { data: unknown }) => void) | null,
    onerror: null as ((event: ErrorEvent) => void) | null,
    postMessage: vi.fn((message: { id: number; operation: string; image?: { width: number; height: number; cacheKey: string; mode: "cfsr-x2" | "cfsr-x4" } }) => {
      if (message.operation !== "UPSCALE") return;
      const scale = message.image?.mode === "cfsr-x4" ? 4 : 2;
      const width = (message.image?.width ?? 0) * scale;
      const height = (message.image?.height ?? 0) * scale;
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
});
