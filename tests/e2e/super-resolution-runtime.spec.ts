import { expect, test } from "@playwright/test";

test("CFSR x2 and x4 run through the CPU/WASM fallback", async ({ page }) => {
  await page.goto("/index.html");

  const results = await page.evaluate(async () => {
    const run = async (mode: "cfsr-x2" | "cfsr-x4") => {
      const width = 65;
      const height = 49;
      const rgba = new Uint8ClampedArray(width * height * 4);
      rgba.fill(127);
      const worker = new Worker("/workers/super-resolution-worker.js", { type: "module" });

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

    return [await run("cfsr-x2"), await run("cfsr-x4")];
  });

  expect(results).toEqual([
    { ok: true, backend: "wasm", width: 130, height: 98, error: undefined },
    { ok: true, backend: "wasm", width: 260, height: 196, error: undefined }
  ]);
});
