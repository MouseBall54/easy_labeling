import { expect, test, type Page } from "@playwright/test";
import { existsSync } from "node:fs";
import { copyFile, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import zlib from "node:zlib";
import path from "node:path";
import { inferenceModel } from "./fixtures/inference-model.js";
import { launchDesktop as launch } from "./fixtures/tauri-app.js";

// Drives the real Tauri executable (npm run tauri:dev, or EASY_LABELING_TAURI_EXE) through WebView2's CDP port.
const root = path.resolve(".");
const exe = process.env.EASY_LABELING_TAURI_EXE ?? path.join(root, "target/debug/Easy Labeling.exe");
test.skip(!existsSync(exe), `Tauri executable not built: ${exe}`);
const launchDesktop = (sandbox: string, pickDirectories: string[]) => launch(exe, sandbox, pickDirectories);

const rectCount = (page: Page) => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getRectCount() as number);

test("Tauri shell opens a folder, runs ONNX inference and writes results through Rust", async () => {
  test.setTimeout(120_000);
  const sandbox = await mkdtemp(path.join(os.tmpdir(), "easy-labeling-tauri-"));
  const dataset = path.join(sandbox, "데이터셋");
  await mkdir(path.join(dataset, "label"), { recursive: true });
  await copyFile(path.join(root, "assets/sample/sample_1.jpg"), path.join(dataset, "image.jpg"));
  const original = "0 0.25 0.25 0.1 0.1\n0 0.75 0.75 0.1 0.1";
  await writeFile(path.join(dataset, "label/image.txt"), original);
  const app = await launchDesktop(sandbox, [dataset]);
  try {
    const { page } = app;
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    expect(await page.evaluate(() => typeof Reflect.get(window, "easyLabelingDesktop")?.setHasUnsavedChanges)).toBe("function");
    expect(await page.evaluate(() => Reflect.get(window, "easyLabelingDesktop")?.readYoloeModel)).toBeUndefined();
    await page.locator("#selectImageFolderBtn").click();
    await expect.poll(() => rectCount(page)).toBe(2);
    await expect(page.locator("#activeOperationPanel")).toBeHidden();

    await page.locator("#taskInferenceBtn").click();
    await page.locator("#inferenceModelInput").setInputFiles({ name: "local.onnx", mimeType: "application/octet-stream", buffer: inferenceModel(1, "nchw") });
    await expect(page.locator("#runInferenceCurrentBtn")).toBeEnabled({ timeout: 30_000 });
    await expect(page.locator("#inferenceBackendBadge")).toHaveText(/^(GPU · WebGPU|CPU · WASM)$/);
    await page.locator("#autoSaveToggle").check();
    await page.locator("#runInferenceCurrentBtn").click();
    await expect(page.locator("#inferenceRunStatus")).toContainText("1 image(s) · 1 detection(s)", { timeout: 30_000 });
    expect((await readdir(dataset)).filter((name) => name.startsWith("inference-"))).toEqual(["inference-local"]);
    const label = await readFile(path.join(dataset, "inference-local/image.txt"), "utf8");
    expect(label.trim().split(/\s+/)).toHaveLength(5);
    expect(JSON.parse(await readFile(path.join(dataset, "inference-local/inference.json"), "utf8"))).toMatchObject({ model: "local.onnx", detections: 1 });
    expect(await readFile(path.join(dataset, "label/image.txt"), "utf8")).toBe(original);

    await page.locator("#taskReviewBtn").click();
    await page.locator("#markReviewedBtn").click();
    await expect(page.locator("#reviewStatusBadge")).toHaveText("Reviewed");
    await expect.poll(async () => {
      try {
        return JSON.parse(await readFile(path.join(dataset, "inference-local/.easy-labeling/review-state.json"), "utf8")).images["image.jpg"].status;
      } catch {
        return null;
      }
    }).toBe("reviewed");
    expect((await readdir(path.join(dataset, "inference-local"))).filter((name) => name.endsWith(".easy-labeling-tmp"))).toEqual([]);
    expect(errors).toEqual([]);
  } finally {
    await app.close();
    await rm(sandbox, { recursive: true, force: true, maxRetries: 40, retryDelay: 250 });
  }
});

test("Tauri shell loads the bundled sample and runs template matching", async () => {
  test.setTimeout(120_000);
  const sandbox = await mkdtemp(path.join(os.tmpdir(), "easy-labeling-tauri-"));
  const app = await launchDesktop(sandbox, []);
  try {
    const { page } = app;
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.locator("#emptyLoadSampleBtn").click();
    await expect.poll(() => page.evaluate(() => {
      const api = Reflect.get(window, "__easyLabelingTestApi");
      return { image: api.getCurrentImageName() as string, boxes: api.getRectCount() as number };
    }), { timeout: 30_000 }).toEqual({ image: "sample_1.jpg", boxes: 207 });
    await expect(page.locator("#image-list [data-file-name]")).toHaveCount(17);
    await expect(page.locator("#automationPresetSelect")).toHaveValue("sample-layout-preset");

    await page.locator("#taskAutomateBtn").click();
    await page.locator("#runAutomationBatchBtn").click();
    await expect(page.locator("#automationBatchPreflight")).toBeVisible();
    await page.locator("#batchDryRunToggle").check();
    await page.locator("#confirmAutomationBatchBtn").click();
    await expect(page.locator("#automationBatchResultSummary")).toContainText("Dry run", { timeout: 90_000 });
    await expect(page.locator("#automationBatchResultSummary")).toContainText("Matched");
    expect(errors).toEqual([]);
  } finally {
    await app.close();
    await rm(sandbox, { recursive: true, force: true, maxRetries: 40, retryDelay: 250 });
  }
});

test("Tauri native refine agrees with the JS refine worker in the app", async () => {
  test.setTimeout(120_000);
  const sandbox = await mkdtemp(path.join(os.tmpdir(), "easy-labeling-tauri-"));
  const app = await launchDesktop(sandbox, []);
  try {
    const { page } = app;
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const outcome = await page.evaluate(async () => {
      // Loaded from the app's own dist/ in the page, so TypeScript must not resolve these paths.
      const load = (file: string): Promise<any> => import(file);
      const [{ createRefineService }, { normalizeRefineParams }] = await Promise.all([
        load("./dist/features/refine/refine-service.js"),
        load("./dist/domain/refine/edge-refine.js")
      ]);
      // A noisy grid of bright cells: refine snaps to their edges.
      const width = 900;
      const height = 640;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d")!;
      const pixels = context.createImageData(width, height);
      let seed = 9;
      const random = () => ((seed = (Math.imul(seed, 1103515245) + 12345) >>> 0) / 4294967296);
      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          const cell = x % 90 > 14 && x % 90 < 70 && y % 80 > 12 && y % 80 < 64;
          const value = (cell ? 170 : 60) + (x % 90) * 0.4 + (random() - 0.5) * 40;
          const offset = (y * width + x) * 4;
          pixels.data[offset] = pixels.data[offset + 1] = pixels.data[offset + 2] = value;
          pixels.data[offset + 3] = 255;
        }
      }
      context.putImageData(pixels, 0, 0);
      const image = new Image();
      image.src = canvas.toDataURL("image/png");
      await image.decode();
      const boxes = Array.from({ length: 40 }, (_, index) => {
        const x0 = (index % 10) * 90 + 12 + (index % 3);
        const y0 = Math.floor(index / 10) * 80 + 15 - (index % 2);
        return { id: String(index), classId: "0", x0, y0, x1: x0 + 60, y1: y0 + 50 };
      });
      const paramsByClass = { 0: normalizeRefineParams({}) };
      const processed = { kind: "processed", config: { mode: "edge-blend", median: true, claheClip: 2 } };
      const run = async () => {
        const refine = createRefineService();
        const started = performance.now();
        const original = await refine.refine(image, boxes, paramsByClass, boxes, { kind: "original" });
        const onProcessed = await refine.refine(image, boxes, paramsByClass, boxes, processed);
        const crop = await refine.crop(image, { x0: 10.5, y0: 20, x1: 60, y1: 71.2 }, processed);
        const elapsed = performance.now() - started;
        return { original, onProcessed, crop: { ...crop, gray: Array.from(crop.gray) }, elapsed };
      };
      const native = await run();
      const bridge = Reflect.get(window, "easyLabelingNative");
      Reflect.set(window, "easyLabelingNative", undefined);
      try {
        return { native, js: await run(), bridge: Boolean(bridge) };
      } finally {
        Reflect.set(window, "easyLabelingNative", bridge);
      }
    });
    expect(outcome.bridge).toBe(true);
    expect(outcome.native.original).toHaveLength(40);
    for (const key of ["original", "onProcessed"] as const) {
      outcome.native[key].forEach((result: { id: string; weakSides: string[]; box: Record<string, number> }, index: number) => {
        const expected = outcome.js[key][index];
        expect(result.id).toBe(expected.id);
        expect(result.weakSides).toEqual(expected.weakSides);
        for (const side of ["x0", "y0", "x1", "y1"] as const) expect(result.box[side]).toBeCloseTo(expected.box[side], 9);
      });
    }
    expect(outcome.native.crop).toEqual(outcome.js.crop);
    console.log(`native ${outcome.native.elapsed.toFixed(0)} ms, js ${outcome.js.elapsed.toFixed(0)} ms`);
    expect(errors).toEqual([]);
  } finally {
    await app.close();
    await rm(sandbox, { recursive: true, force: true, maxRetries: 40, retryDelay: 250 });
  }
});


/** An 8-bit gray PNG (SEM-like bright blocks on a sloped, noisy background). */
function grayPng(width: number, height: number): Buffer {
  let seed = 3;
  const random = () => ((seed = (Math.imul(seed, 1103515245) + 12345) >>> 0) / 4294967296);
  const raw = Buffer.alloc((width + 1) * height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const block = x % 64 > 12 && x % 64 < 52 && y % 48 > 9 && y % 48 < 40 ? 110 : 0;
      raw[y * (width + 1) + 1 + x] = Math.max(0, Math.min(255, Math.round(50 + (x * 40) / width + block + (random() - 0.5) * 40)));
    }
  }
  const chunk = (type: string, data: Buffer) => {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, "latin1"), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(zlib.crc32(body));
    return Buffer.concat([length, body, crc]);
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8; // bit depth; colour type 0 (gray), default compression/filter/interlace
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", header), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}

test("Tauri Processed view is computed natively, matches the TS result and keeps the UI thread free", async () => {
  test.setTimeout(240_000);
  const sandbox = await mkdtemp(path.join(os.tmpdir(), "easy-labeling-tauri-"));
  const dataset = path.join(sandbox, "sem");
  await mkdir(path.join(dataset, "label"), { recursive: true });
  await writeFile(path.join(dataset, "sem.png"), grayPng(4096, 3072));
  const app = await launchDesktop(sandbox, [dataset]);
  try {
    const { page } = app;
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.locator("#selectImageFolderBtn").click();
    await expect.poll(() => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getCurrentImageName()), { timeout: 60_000 }).toBe("sem.png");
    await expect(page.locator("#activeOperationPanel")).toBeHidden();

    // Runs `trigger` and waits for `done`, recording main-thread long tasks meanwhile.
    const measure = (step: "view" | "heavy") => page.evaluate(async (which) => {
      const api = Reflect.get(window, "__easyLabelingTestApi");
      const longTasks: number[] = [];
      const observer = new PerformanceObserver((list) => list.getEntries().forEach((entry) => longTasks.push(entry.duration)));
      observer.observe({ type: "longtask" });
      const started = performance.now();
      if (which === "view") {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "q" }));
      } else {
        (document.getElementById("segmentationPreprocessFlattenInput") as HTMLInputElement).value = "200";
        const diffusion = document.getElementById("segmentationPreprocessDiffusionInput") as HTMLInputElement;
        diffusion.value = "20";
        diffusion.dispatchEvent(new Event("change"));
      }
      const done = () => which === "view"
        ? api.getSegmentationViewSource() === "processed"
        : api.getSegmentationPreprocessingConfig().flattenSigma === 200 && api.getSegmentationPreprocessingConfig().diffusionIterations === 20;
      while (!done()) await new Promise((resolve) => setTimeout(resolve, 5));
      const elapsed = performance.now() - started;
      await new Promise((resolve) => setTimeout(resolve, 100));
      observer.disconnect();
      return { elapsed, maxLongTask: Math.max(0, ...longTasks) };
    }, step);

    // Keep the original pixels to compute the TS reference and timing in the same page afterwards.
    await page.evaluate(() => {
      const element = Reflect.get(window, "__easyLabelingTestApi").getCanvasBackgroundElement() as HTMLImageElement;
      const canvas = document.createElement("canvas");
      canvas.width = element.naturalWidth || element.width;
      canvas.height = element.naturalHeight || element.height;
      const context = canvas.getContext("2d")!;
      context.drawImage(element, 0, 0);
      Reflect.set(window, "__originalRgba", context.getImageData(0, 0, canvas.width, canvas.height));
    });
    const view = await measure("view");
    const heavy = await measure("heavy");

    const check = await page.evaluate(async () => {
      const load = (file: string): Promise<any> => import(file);
      const { normalizeSegmentationPreprocessingConfig, preprocessSegmentationImage } = await load("./dist/features/segmentation/preprocessing.js");
      const api = Reflect.get(window, "__easyLabelingTestApi");
      const original = Reflect.get(window, "__originalRgba") as ImageData;
      const hash = async (bytes: Uint8ClampedArray) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new Uint8Array(bytes)))).map((b) => b.toString(16).padStart(2, "0")).join("");
      const element = api.getCanvasBackgroundElement() as HTMLCanvasElement;
      const shown = element.getContext("2d")!.getImageData(0, 0, element.width, element.height).data;
      const config = normalizeSegmentationPreprocessingConfig(api.getSegmentationPreprocessingConfig());
      const started = performance.now();
      const expected = preprocessSegmentationImage({ width: original.width, height: original.height, rgba: original.data }, config);
      const tsMs = performance.now() - started;
      const defaultStarted = performance.now();
      preprocessSegmentationImage({ width: original.width, height: original.height, rgba: original.data }, normalizeSegmentationPreprocessingConfig({}));
      const tsDefaultMs = performance.now() - defaultStarted;
      return { same: await hash(shown) === await hash(expected), size: [element.width, element.height], tsMs, tsDefaultMs };
    });
    console.log(`4096x3072 Processed view, default config: native ${view.elapsed.toFixed(0)} ms (longest UI task ${view.maxLongTask.toFixed(0)} ms), TS on the UI thread ${check.tsDefaultMs.toFixed(0)} ms`);
    console.log(`4096x3072 flatten 200 + diffusion 20: native ${heavy.elapsed.toFixed(0)} ms (longest UI task ${heavy.maxLongTask.toFixed(0)} ms), TS on the UI thread ${check.tsMs.toFixed(0)} ms`);
    expect(check.size).toEqual([4096, 3072]);
    expect(check.same).toBe(true);
    // The UI thread only converts and copies pixels; the filters run in Rust.
    expect(heavy.maxLongTask).toBeLessThan(check.tsMs / 2);
    expect(errors).toEqual([]);
  } finally {
    await app.close();
    await rm(sandbox, { recursive: true, force: true, maxRetries: 40, retryDelay: 250 });
  }
});
