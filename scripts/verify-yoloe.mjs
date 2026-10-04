import { _electron, expect } from "@playwright/test";
import { mkdir, readFile, writeFile, readdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "output/yoloe-validation");
const dataset = path.join(output, "workspace");
await mkdir(path.join(dataset, "label"), { recursive: true });
const status = await (await fetch("http://127.0.0.1:8766/status")).json();
if (!status.cuda || !status.models.includes("yoloe-26s-seg")) throw new Error("Run yoloe:setup, yoloe:prepare and yoloe:start first.");
execFileSync(path.join(root, "runtime/yoloe/.venv/Scripts/python.exe"), ["-c", `from pathlib import Path
from PIL import Image
from ultralytics.utils import ASSETS
import sys
p=Path(sys.argv[1])
Image.open(ASSETS/'bus.jpg').convert('RGB').save(p/'0-reference.png')
Image.open(ASSETS/'bus.jpg').convert('L').save(p/'1-target-gray.png')
Image.open(ASSETS/'zidane.jpg').convert('RGB').save(p/'2-target-rgb.png')
`, dataset]);
const originals = {
  "0-reference.txt": "5 0.18209877 0.60185185 0.24074074 0.46296296\n12 0.49629630 0.45370370 0.94320988 0.46296296\n",
  "1-target-gray.txt": "5 0.18209877 0.60185185 0.24074074 0.46296296\n",
  "2-target-rgb.txt": "5 0.4 0.6 0.4 0.5\n"
};
for (const [name, labels] of Object.entries(originals)) await writeFile(path.join(dataset, "label", name), labels);
const classes = 'names:\n  5: "person"\n  12: "bus"\n';
await writeFile(path.join(dataset, "label/classes.yaml"), classes);
await mkdir(path.join(dataset, "profiles/class-info"), { recursive: true });
await writeFile(path.join(dataset, "profiles/class-info/classes.yaml"), classes);
const app = await _electron.launch({ args: [path.join(root, "tests/e2e/fixtures/inference-electron.cjs")],
  env: { ...process.env, INFERENCE_TEST_ROOT: root, INFERENCE_TEST_DATASET: dataset } });
const evidence = { runtime: status, model: "yoloe-26s-seg", checks: {}, images: [], errors: [] };
try {
  const page = await app.firstWindow();
  page.on("pageerror", (error) => evidence.errors.push(error.message));
  await page.locator("#selectImageFolderBtn").click();
  await expect(page.locator("#activeOperationPanel")).toBeHidden({ timeout: 60_000 });
  const count = () => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi")?.getRectCount?.());
  await expect.poll(count).toBe(2);
  await page.locator("#taskInferenceBtn").click();
  await page.locator("#inferenceYoloeModeBtn").click();
  await page.locator("#connectYoloeBtn").click();
  await expect(page.locator("#yoloeBackendBadge")).toHaveText("GPU · CUDA");
  await expect(page.locator("#yoloeModelSelect")).toBeEnabled();
  await page.locator("#yoloeProfileName").fill("acceptance_v1");
  await page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi")?.selectRectsByIndex?.([0, 1]));
  await page.locator("#registerYoloeExamplesBtn").click();
  await expect(page.locator("#yoloeExampleList > div")).toHaveCount(2, { timeout: 120_000 });
  await page.locator("#nextImageBtn").click();
  await expect.poll(count).toBe(1);
  const previewResponse = page.waitForResponse((response) => response.url().endsWith(":8766/infer"));
  await page.locator("#previewYoloeBtn").click();
  const preview = await (await previewResponse).json();
  expect(preview.detections.length).toBeGreaterThan(0);
  await expect(page.locator("#yoloePreviewCanvas")).toBeVisible();
  await expect.poll(count).toBe(1);
  evidence.checks.previewPreservedSource = true;
  evidence.preview = preview;
  await expect(page.locator("#activeOperationPanel")).toBeHidden();
  await expect(page.locator(".toast-message")).toHaveCount(0, { timeout: 10_000 });
  await page.screenshot({ path: path.join(output, "preview-light.png") });
  await page.locator('label[for="darkModeToggle"]').click();
  await page.screenshot({ path: path.join(output, "preview-dark.png") });
  await page.locator("#autoSaveToggle").check();
  await page.locator("#runYoloeAllBtn").click();
  await expect(page.locator("#yoloeRunStatus")).toContainText("3 image(s)", { timeout: 120_000 });
  const results = path.join(dataset, "inference-yoloe-26s-seg-acceptance_v1");
  const metadata = JSON.parse(await readFile(path.join(results, "inference.json"), "utf8"));
  expect(metadata).toMatchObject({ engine: "yoloe26", backend: "cuda", exampleCount: 2, checkpoint: "yoloe-26s-seg.pt" });
  evidence.metadata = metadata;
  for (const name of Object.keys(originals)) {
    const label = await readFile(path.join(results, name), "utf8");
    const rows = label.trim().split("\n").filter(Boolean);
    for (const row of rows) { const numbers = row.split(/\s+/).map(Number); expect([5, 12]).toContain(numbers[0]); expect(numbers.slice(1).every((x) => Number.isFinite(x) && x >= 0 && x <= 1)).toBe(true); }
    evidence.images.push({ name, detections: rows.length });
    expect(await readFile(path.join(dataset, "label", name), "utf8")).toBe(originals[name]);
  }
  await expect(page.locator("#yoloePreviewCanvas")).toBeHidden();
  await page.locator("#labelSourceSelect").selectOption("0");
  await expect.poll(count).toBe(1);
  await page.locator("#nextImageBtn").click();
  await expect.poll(count).toBe(1);
  await page.locator("#saveYoloeCurrentBtn").click();
  await expect(page.locator("#yoloeRunStatus")).toContainText("1 image(s)", { timeout: 60_000 });
  await expect(page.locator("#labelSourceSelect option")).toHaveCount(2);
  evidence.checks.stableFolderAndSourceRestoration = true;
  await page.locator("#taskReviewBtn").click();
  await expect(page.locator("#detectionReviewWorkspace")).toBeVisible();
  evidence.checks.review = true;
  expect(evidence.errors).toEqual([]);
  await writeFile(path.join(output, "results.json"), JSON.stringify(evidence, null, 2) + "\n");
  console.log(JSON.stringify({ checks: evidence.checks, images: evidence.images, gpu: status.gpu }, null, 2));
} finally { await app.close(); }
