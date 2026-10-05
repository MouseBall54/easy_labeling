import { expect, test } from "@playwright/test";

test("all enhancement models prefer WebGPU when the adapter supports it", async ({ page }) => {
  await page.goto("/index.html");

  const webGpuAvailable = await page.evaluate(async () => {
    const gpu = (navigator as Navigator & {
      gpu?: { requestAdapter: () => Promise<unknown> };
    }).gpu;
    if (!gpu) return false;
    return (await gpu.requestAdapter()) !== null;
  });

  const results = await page.evaluate(async () => {
    const run = async (mode: "cfsr-x2" | "cfsr-x4", requestedBackend?: "wasm" | "webgpu") => {
      const width = 65;
      const height = 49;
      const rgba = new Uint8ClampedArray(width * height * 4);
      rgba.fill(127);
      const worker = new Worker(`/workers/super-resolution-worker.js${requestedBackend ? `?backend=${requestedBackend}` : ""}`, { type: "module" });

      return await new Promise<{ ok: boolean; backend: string | null; width?: number; height?: number; error?: string; phases: string[]; progress: number[]; fallbackOccurred: boolean; fallbackReason: string | null }>((resolve) => {
        const phases: string[] = [];
        const progress: number[] = [];
        let fallbackOccurred = false;
        let fallbackReason: string | null = null;
        worker.onmessage = (event) => {
          const response = event.data as {
            ok: boolean;
            error?: string;
            status?: { backend?: string | null; phase?: string; progressPercent?: number | null; fallbackOccurred?: boolean; fallbackReason?: string | null };
            result?: { width: number; height: number };
          };
          if (response.status?.phase) phases.push(response.status.phase);
          if (typeof response.status?.progressPercent === "number") progress.push(response.status.progressPercent);
          fallbackOccurred ||= response.status?.fallbackOccurred === true;
          fallbackReason = response.status?.fallbackReason ?? fallbackReason;
          if (response.ok && !response.result) return;
          worker.terminate();
          resolve({
            ok: response.ok,
            backend: response.status?.backend ?? null,
            width: response.result?.width,
            height: response.result?.height,
            error: response.error,
            phases,
            progress,
            fallbackOccurred,
            fallbackReason
          });
        };
        worker.onerror = (event) => {
          worker.terminate();
          resolve({ ok: false, backend: null, error: event.message, phases, progress, fallbackOccurred, fallbackReason });
        };
        worker.postMessage({
          id: 1,
          operation: "UPSCALE",
          image: { mode, width, height, rgba: rgba.buffer, cacheKey: `cpu-${mode}`, tileSize: 64, overlap: 8 }
        }, [rgba.buffer]);
      });
    };

    return [
      await run("cfsr-x2"),
      await run("cfsr-x4"),
      await run("cfsr-x2", "webgpu"),
      await run("cfsr-x2", "wasm")
    ];
  });

  const expectedSizes = [[130, 98], [260, 196]];
  results.slice(0, 2).forEach((result, index) => {
    expect(result).toMatchObject({ ok: true, width: expectedSizes[index]?.[0], height: expectedSizes[index]?.[1] });
    expect(["webgpu", "wasm"]).toContain(result.backend);
    expect(result.error).toBeUndefined();
    expect(result.phases).toEqual(expect.arrayContaining(["loading-model", "preparing", "upscaling", "merging", "ready"]));
    expect(result.progress).toContain(100);
  });
  results.slice(0, 2).forEach((result) => {
    if (result.backend === "webgpu") expect(result.fallbackOccurred).toBe(false);
    if (result.backend === "wasm") {
      expect(result.fallbackOccurred).toBe(true);
      expect(result.fallbackReason).toMatch(/WebGPU (initialization|inference) failed/);
    }
  });
  if (webGpuAvailable) {
    results.slice(0, 2).forEach((result) => {
      expect(result).toMatchObject({ backend: "webgpu", fallbackOccurred: false, fallbackReason: null });
    });
  }
  const forcedWebGpu = results[2];
  expect(forcedWebGpu).toMatchObject({ ok: true, width: 130, height: 98, error: undefined });
  if (forcedWebGpu?.backend === "webgpu") expect(forcedWebGpu.fallbackOccurred).toBe(false);
  if (forcedWebGpu?.backend === "wasm") expect(forcedWebGpu.fallbackOccurred).toBe(true);
  expect(results[3]).toMatchObject({ ok: true, backend: "wasm", width: 130, height: 98, error: undefined, fallbackOccurred: false, fallbackReason: null });
});
