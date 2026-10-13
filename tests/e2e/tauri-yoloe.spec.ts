import { expect, test } from "@playwright/test";
import { existsSync } from "node:fs";
import { copyFile, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { launchDesktop } from "./fixtures/tauri-app.js";

// The Tauri YOLOE-26 build (npx tauri build --debug --no-bundle --config src-tauri/tauri.yoloe.conf.json,
// or EASY_LABELING_TAURI_YOLOE_EXE for an installed copy) reads the bundled ONNX models through Rust.
const root = path.resolve(".");
const exe = process.env.EASY_LABELING_TAURI_YOLOE_EXE ?? path.join(root, "src-tauri/target/debug/Easy Labeling YOLOE-26.exe");
test.skip(!existsSync(exe), `Tauri YOLOE executable not built: ${exe}`);

test("Tauri YOLOE-26 build loads bundled models and predicts from visual examples", async () => {
  test.setTimeout(600_000);
  const sandbox = await mkdtemp(path.join(os.tmpdir(), "easy-labeling-tauri-yoloe-"));
  const dataset = path.join(sandbox, "dataset");
  await mkdir(path.join(dataset, "label"), { recursive: true });
  for (const file of ["0-reference.png", "1-target-gray.png", "2-target-rgb.png"]) {
    await copyFile(path.join(root, "tests/e2e/fixtures/yoloe-visual", file), path.join(dataset, file));
  }
  await writeFile(path.join(dataset, "label/0-reference.txt"), "5 0.18209877 0.60185185 0.24074074 0.46296296\n12 0.49629630 0.45370370 0.94320988 0.46296296\n");
  await writeFile(path.join(dataset, "label/1-target-gray.txt"), "5 0.18209877 0.60185185 0.24074074 0.46296296\n");
  await writeFile(path.join(dataset, "label/classes.yaml"), 'names:\n  5: "person"\n  12: "bus"\n');
  const app = await launchDesktop(exe, sandbox, [dataset]);
  try {
    const { page } = app;
    page.setDefaultTimeout(60_000);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    expect(await page.evaluate(() => typeof Reflect.get(window, "easyLabelingDesktop")?.readYoloeModel)).toBe("function");
    await page.evaluate(() => {
      const OriginalWorker = window.Worker;
      window.Worker = class extends OriginalWorker {
        constructor(...args: ConstructorParameters<typeof Worker>) {
          super(...args);
          if (String(args[0]).includes("yoloe-inference-worker")) this.addEventListener("message", ({ data }) => {
            if (data.result?.detections) {
              Reflect.set(window, "__yoloeLastResult", data.result);
              Reflect.set(window, "__yoloeSequence", (Reflect.get(window, "__yoloeSequence") ?? 0) + 1);
            }
          });
        }
      };
    });
    await page.locator("#taskYoloeBtn").click();
    await expect(page.locator("#yoloeBackendBadge")).toHaveText(/^(GPU · WebGPU|CPU)$/, { timeout: 180_000 });
    const status = await page.evaluate(async () => {
      const load = (file: string): Promise<{ requestYoloe(path: string): Promise<{ models: string[] }> }> => import(file);
      return (await load("./dist/features/inference/yoloe.js")).requestYoloe("status");
    });
    expect(status.models).toEqual(["yoloe-26n-seg", "yoloe-26s-seg", "yoloe-26m-seg", "yoloe-26l-seg"]);

    await page.locator("#selectImageFolderBtn").click();
    await expect(page.locator("#imageCountBadge")).toHaveText("3");
    const count = () => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getRectCount() as number);
    await expect.poll(count).toBe(2);
    await page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi")?.selectRectsByIndex?.([0, 1]));
    await page.locator("#openYoloeSetupBtn").click();
    await expect(page.locator("#yoloeSetupStatus")).toHaveText("Ready", { timeout: 180_000 });
    await page.locator("#yoloeProfileName").fill("desktop_check");
    await page.locator("#addYoloeSelectedBtn").click();
    await expect(page.locator("#yoloeSetupStatus")).toContainText("2 sample(s) · Ready to find", { timeout: 300_000 });
    await page.locator("#closeYoloeSetupBtn").click();
    await page.locator("#nextImageBtn").click();
    await expect.poll(count).toBe(1);
    const sequence = await page.evaluate(() => Reflect.get(window, "__yoloeSequence") ?? 0);
    await page.locator("#previewYoloeBtn").click();
    await expect.poll(() => page.evaluate(() => Reflect.get(window, "__yoloeSequence") ?? 0), { timeout: 300_000 }).toBeGreaterThan(sequence);
    const preview = await page.evaluate(() => Reflect.get(window, "__yoloeLastResult") as { detections: unknown[] });
    expect(preview.detections.length).toBeGreaterThan(0);
    await expect.poll(count).toBe(1);
    expect((await readdir(dataset)).filter((name) => name.startsWith("inference-"))).toEqual([]);
    expect(await readFile(path.join(dataset, "label/1-target-gray.txt"), "utf8")).toBe("5 0.18209877 0.60185185 0.24074074 0.46296296\n");
    expect(errors).toEqual([]);
  } finally {
    await app.close();
    await rm(sandbox, { recursive: true, force: true, maxRetries: 40, retryDelay: 250 });
  }
});
