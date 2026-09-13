import { expect, test } from "@playwright/test";

test("all enhancement models run with the quality-safe backend policy", async ({ page }) => {
  await page.goto("/index.html");

  const results = await page.evaluate(async () => {
    const run = async (mode: "cfsr-x2" | "cfsr-x4" | "tk-r-em-hrsem" | "tk-r-em-hrtem" | "tk-r-em-lrsem" | "tk-r-em-lrtem", forceWasm = false) => {
      const width = 65;
      const height = 49;
      const rgba = new Uint8ClampedArray(width * height * 4);
      rgba.fill(127);
      const worker = new Worker(`/workers/super-resolution-worker.js${forceWasm ? "?backend=wasm" : ""}`, { type: "module" });

      return await new Promise<{ ok: boolean; backend: string | null; width?: number; height?: number; error?: string }>((resolve) => {
        worker.onmessage = (event) => {
          const response = event.data as {
            ok: boolean;
            error?: string;
            status?: { backend?: string | null };
            result?: { width: number; height: number };
          };
          if (response.ok && !response.result) return;
          worker.terminate();
          resolve({
            ok: response.ok,
            backend: response.status?.backend ?? null,
            width: response.result?.width,
            height: response.result?.height,
            error: response.error
          });
        };
        worker.onerror = (event) => {
          worker.terminate();
          resolve({ ok: false, backend: null, error: event.message });
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
      await run("tk-r-em-hrsem"),
      await run("tk-r-em-hrtem"),
      await run("tk-r-em-lrsem"),
      await run("tk-r-em-lrtem"),
      await run("tk-r-em-hrsem", true)
    ];
  });

  const expectedSizes = [[130, 98], [260, 196], [65, 49], [65, 49], [65, 49], [65, 49]];
  results.slice(0, 6).forEach((result, index) => {
    expect(result).toMatchObject({ ok: true, width: expectedSizes[index]?.[0], height: expectedSizes[index]?.[1] });
    expect(["webgpu", "wasm"]).toContain(result.backend);
    expect(result.error).toBeUndefined();
  });
  results.slice(2, 6).forEach((result) => expect(result.backend).toBe("wasm"));
  expect(results[6]).toEqual({ ok: true, backend: "wasm", width: 65, height: 49, error: undefined });
});

test("tk_r_em blended tiling stays close to whole-image WASM output without boundary stripes", async ({ page }) => {
  await page.goto("/index.html");

  const result = await page.evaluate(async () => {
    const width = 320;
    const height = 192;
    const rgba = new Uint8ClampedArray(width * height * 4);
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const offset = (y * width + x) * 4;
        const value = Math.max(0, Math.min(255, 40 + (x * 0.45) + (y * 0.25) + (30 * Math.sin(x / 13)) + (20 * Math.cos(y / 11))));
        rgba[offset] = value;
        rgba[offset + 1] = value;
        rgba[offset + 2] = value;
        rgba[offset + 3] = 255;
      }
    }
    const run = (tileSize: number) => new Promise<{ rgba: Uint8ClampedArray; backend: string | null }>((resolve, reject) => {
      const worker = new Worker("/workers/super-resolution-worker.js?backend=wasm", { type: "module" });
      worker.onmessage = (event) => {
        const response = event.data;
        if (response.ok && !response.result) return;
        worker.terminate();
        if (!response.ok) {
          reject(new Error(response.error));
          return;
        }
        resolve({ rgba: new Uint8ClampedArray(response.result.rgba), backend: response.status?.backend ?? null });
      };
      worker.onerror = (event) => {
        worker.terminate();
        reject(new Error(event.message));
      };
      const copy = new Uint8ClampedArray(rgba);
      worker.postMessage({
        id: 1,
        operation: "UPSCALE",
        image: { mode: "tk-r-em-hrsem", width, height, rgba: copy.buffer, cacheKey: `quality-${tileSize}`, tileSize }
      }, [copy.buffer]);
    });
    const [whole, tiled] = await Promise.all([run(512), run(128)]);
    let totalDifference = 0;
    for (let offset = 0; offset < whole.rgba.length; offset += 4) {
      totalDifference += Math.abs(whole.rgba[offset] - tiled.rgba[offset]);
    }
    const seamDifference = (x: number): number => {
      let total = 0;
      for (let y = 0; y < height; y += 1) {
        total += Math.abs(tiled.rgba[(y * width + x) * 4] - tiled.rgba[(y * width + x - 1) * 4]);
      }
      return total / height;
    };
    return {
      backend: tiled.backend,
      meanAbsoluteError: totalDifference / (width * height),
      maximumBoundaryDifference: Math.max(...[64, 128, 192, 256].map(seamDifference))
    };
  });

  expect(result.backend).toBe("wasm");
  expect(result.meanAbsoluteError).toBeLessThan(0.5);
  expect(result.maximumBoundaryDifference).toBeLessThan(3);
});
