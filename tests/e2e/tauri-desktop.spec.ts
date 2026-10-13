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

