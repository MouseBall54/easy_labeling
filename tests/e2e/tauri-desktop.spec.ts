import { expect, test, type Page } from "@playwright/test";
import { existsSync } from "node:fs";
import { copyFile, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { inferenceModel } from "./fixtures/inference-model.js";
import { grayPng, grayTiff, withExifOrientation, withPngExif, writeReviewDataset, yoloLabels } from "./fixtures/review-dataset.js";
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

/**
 * Runs the folder review on the native path, then with the native review and label scan switched off;
 * returns both runs' findings and image statuses (sorted JSON) and times.
 */
async function reviewBothWays(page: Page) {
  return page.evaluate(async () => {
    const api = Reflect.get(window, "__easyLabelingTestApi");
    const sorted = (record: Record<string, unknown>) => JSON.stringify(Object.keys(record).sort().map((name) => [name, record[name]]));
    const run = async () => {
      const started = performance.now();
      await api.refreshReviewFindings();
      const ms = performance.now() - started;
      return { ms, json: sorted(api.getReviewFindings()), statuses: sorted(api.getImageWorkflowStatuses()) };
    };
    const native = await run();
    window.easyLabelingNativeOff = ["review", "label-scan"];
    try {
      return { native, ts: await run() };
    } finally {
      window.easyLabelingNativeOff = [];
    }
  });
}

test("Tauri folder review in Rust gives the TS findings, with decoder fallbacks and unsaved edits", async () => {
  test.setTimeout(300_000);
  const sandbox = await mkdtemp(path.join(os.tmpdir(), "easy-labeling-tauri-"));
  const dataset = path.join(sandbox, "review");
  await mkdir(path.join(dataset, "label"), { recursive: true });
  const write = (name: string, data: Buffer | string) => writeFile(path.join(dataset, name), data);
  for (let index = 0; index < 3; index += 1) {
    await write(`a_png_${index}.png`, grayPng(2048, 1536, index + 1));
    await write(`label/a_png_${index}.txt`, yoloLabels(5000, index + 1));
    await write(`b_tif_${index}.tif`, grayTiff(2048, 1536, index + 7));
    await write(`label/b_tif_${index}.txt`, yoloLabels(5000, index + 7));
  }
  // EXIF orientation 6: the browser reports 650x1157, so a 0.004-wide box is 2.6 px (small), not 4.6 px.
  await write("c_rotated.jpg", withExifOrientation(await readFile(path.join(root, "assets/sample/sample_1.jpg")), 6));
  await write("label/c_rotated.txt", "0 0.5 0.5 0.004 0.5\n");
  // eXIf in a PNG: Rust leaves the size to the TS decoder for this image only.
  await write("d_exif.png", withPngExif(grayPng(300, 200)));
  await write("label/d_exif.txt", "0 0.5 0.5 0.01 0.5\n");
  await write("e_no_label.png", grayPng(64, 64));
  await write("f_messy.png", grayPng(640, 480));
  await write("label/f_messy.txt", "﻿0 0.5 0.5 0.1 0.1\r\n0  0.5 0.5 0.1 0.1\r\n1 0.5abc .5 1e-1 0.1\r\nx NaN 0.5\r\n  2 0.99 0.5 0.1 0.1\r\n");
  await write("g_empty.png", grayPng(64, 64));
  await write("label/g_empty.txt", "");
  const app = await launchDesktop(sandbox, [dataset]);
  try {
    const { page } = app;
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.locator("#selectImageFolderBtn").click();
    await expect.poll(() => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getCurrentImageName()), { timeout: 60_000 }).toBe("a_png_0.png");
    await expect(page.locator("#activeOperationPanel")).toBeHidden({ timeout: 60_000 });
    // Unsaved edits on the open image: both paths must review them instead of its 5,000-box file.
    await page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").seedDetectionBoxesForTest(3));
    await expect.poll(() => rectCount(page)).toBe(3);

    const { native, ts } = await reviewBothWays(page);
    const findings = Object.fromEntries(JSON.parse(native.json)) as Record<string, { issues: Array<{ type: string; rectIndexes: number[] }> }>;
    expect(Object.keys(findings)).toHaveLength(11);
    expect(native.json).toBe(ts.json);
      expect(native.statuses).toBe(ts.statuses);
    expect(findings["c_rotated.jpg"]!.issues.map((issue) => issue.type)).toEqual(["small-box"]);
    expect(findings["d_exif.png"]!.issues.map((issue) => issue.type)).toEqual(["small-box"]);
    expect(findings["a_png_0.png"]!.issues.every((issue) => issue.rectIndexes.every((index) => index < 3))).toBe(true);
    expect(findings["a_png_1.png"]!.issues.length).toBeGreaterThan(10);
    console.log(`11-image review: native ${native.ms.toFixed(0)} ms, TS ${ts.ms.toFixed(0)} ms`);
    expect(errors).toEqual([]);
  } finally {
    await app.close();
    await rm(sandbox, { recursive: true, force: true, maxRetries: 40, retryDelay: 250 });
  }
});

for (const format of ["tif", "png"] as const) {
  test(`Tauri folder review of 60 ${format.toUpperCase()} images with 5,000 boxes each: native vs TS`, async () => {
    test.setTimeout(600_000);
    const sandbox = await mkdtemp(path.join(os.tmpdir(), "easy-labeling-tauri-"));
    const dataset = path.join(sandbox, "review");
    await writeReviewDataset(dataset, { images: 60, boxes: 5000, format });
    const app = await launchDesktop(sandbox, [dataset]);
    try {
      const { page } = app;
      await page.locator("#selectImageFolderBtn").click();
      await expect.poll(() => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getCurrentImageName()), { timeout: 120_000 }).toBe(`img_000.${format}`);
      await expect(page.locator("#activeOperationPanel")).toBeHidden({ timeout: 120_000 });
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));

      // Cancelling the Rust job: the review of the folder is too quick to stop from the UI (~0.1 s), so ask
      // for the 60 images ten times over and cancel once the job reports progress. The job ends early,
      // unregisters itself, and a normal review still runs afterwards.
      const names = Array.from({ length: 60 }, (_, index) => `img_${String(index).padStart(3, "0")}.${format}`);
      const images = Array.from({ length: 10 }, () => names.map((name) => ({ name, path: path.join(dataset, name), editedText: null }))).flat();
      const stopped = await page.evaluate(async ({ images, labelFolder }) => {
        const native = window.easyLabelingNative!;
        const jobId = "e2e-cancel";
        const settings = { minimumBoxSizePx: 4, duplicateIouThreshold: 0.9, requiredClassIds: [] };
        const started = performance.now();
        let settled = false;
        const running = native.invoke("review_folder", { request: { jobId, labelFolder, images, settings } })
          .then(() => "finished", (error: unknown) => String((error as Error)?.message ?? error))
          .finally(() => { settled = true; });
        let progress: { done: number; total: number } | null = null;
        while (!settled && !(progress && progress.done > 0)) {
          progress = await native.invoke<{ done: number; total: number } | null>("job_progress", { id: jobId });
        }
        await native.invoke("job_cancel", { id: jobId });
        const outcome = await running;
        return { outcome, ms: performance.now() - started, progress, after: await native.invoke("job_progress", { id: jobId }) };
      }, { images, labelFolder: path.join(dataset, "label") });
      expect(stopped.outcome).toContain("Native job cancelled");
      expect(stopped.progress?.total).toBe(600);
      expect(stopped.progress!.done).toBeLessThan(600);
      expect(stopped.after).toBeNull();

      const { native, ts } = await reviewBothWays(page);
      expect(native.json).toBe(ts.json);
      expect(native.statuses).toBe(ts.statuses);
      expect(errors).toEqual([]);
      console.log(`60 ${format} x 5,000 boxes review: native ${native.ms.toFixed(0)} ms, TS ${ts.ms.toFixed(0)} ms; cancelled 600-image job after ${stopped.ms.toFixed(0)} ms (${stopped.progress?.done}/600 done at cancel)`);
    } finally {
      await app.close();
      await rm(sandbox, { recursive: true, force: true, maxRetries: 40, retryDelay: 250 });
    }
  });
}
