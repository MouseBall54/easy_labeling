import { expect, test, type Page } from "@playwright/test";
import { existsSync } from "node:fs";
import { copyFile, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { inferenceModel } from "./fixtures/inference-model.js";
import { launchDesktop as launch } from "./fixtures/tauri-app.js";

// Drives the real Tauri executable (npm run tauri:dev, or EASY_LABELING_TAURI_EXE) through WebView2's CDP port.
const root = path.resolve(".");
const exe = process.env.EASY_LABELING_TAURI_EXE ?? path.join(root, "src-tauri/target/debug/Easy Labeling.exe");
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

