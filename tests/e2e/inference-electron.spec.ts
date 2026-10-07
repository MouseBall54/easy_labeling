import { _electron, expect, test } from "@playwright/test";
import { mkdtemp, mkdir, copyFile, writeFile, readdir, readFile, rm } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { inferenceModel } from "./fixtures/inference-model.js";

test("Electron file:// ONNX runtime saves real result files and preserves the source labels", async () => {
  test.setTimeout(90_000);
  const dataset = await mkdtemp(path.join(os.tmpdir(), "easy-labeling-inference-"));
  const root = path.resolve(".");
  await mkdir(path.join(dataset, "label"));
  await copyFile(path.join(root, "assets/sample/sample_1.jpg"), path.join(dataset, "image.jpg"));
  const original = "0 0.25 0.25 0.1 0.1\n0 0.75 0.75 0.1 0.1";
  await writeFile(path.join(dataset, "label/image.txt"), original);
  let legacyName = "class 0";
  for (let layer = 0; layer < 4; layer += 1) legacyName = JSON.stringify(legacyName);
  await writeFile(path.join(dataset, "label/classes.yaml"), `names:\n  0: ${legacyName}\n`);
  const classProfile = path.join(dataset, "profiles/class-info/classes.yaml");
  await mkdir(path.dirname(classProfile), { recursive: true });
  await copyFile(path.join(dataset, "label/classes.yaml"), classProfile);
  const electron = await _electron.launch({
    args: [path.join(root, "tests/e2e/fixtures/inference-electron.cjs")],
    env: { ...process.env, INFERENCE_TEST_DATASET: dataset, INFERENCE_TEST_ROOT: root }
  });
  try {
    const page = await electron.firstWindow();
    await page.locator("#selectImageFolderBtn").click();
    const count = () => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi")?.getRectCount?.() ?? -1);
    await expect.poll(count).toBe(2);
    await expect(page.locator("#activeOperationPanel")).toBeHidden();
    await expect(page.locator('#select-by-class-dropdown option[value="0"]')).toHaveText("0: class 0");
    await expect(page.locator('#label-list .label-group-name')).toHaveText("0: class 0");
    await expect(page.locator('#label-list .label-list-item-name').first()).toContainText("0: class 0 · #1");
    await page.locator("#taskInferenceBtn").click();
    await page.locator("#inferenceModelInput").setInputFiles({ name: "local.onnx", mimeType: "application/octet-stream", buffer: inferenceModel(1, "nchw") });
    await expect(page.locator("#runInferenceCurrentBtn")).toBeEnabled({ timeout: 30_000 });
    await expect(page.locator("#inferenceBackendBadge")).toHaveText(/^(GPU · WebGPU|CPU · WASM)$/);
    await expect(page.locator("#inferenceModelInput")).toHaveValue(/local\.onnx$/);
    await page.locator("#autoSaveToggle").check();
    await page.locator("#runInferenceCurrentBtn").click();
    await expect(page.locator("#inferenceRunStatus")).toContainText("1 image(s) · 1 detection(s)", { timeout: 30_000 });
    await expect.poll(count).toBe(1);
    await expect(page.locator('#select-by-class-dropdown option[value="0"]')).toHaveText("0: class 0");
    await expect(page.locator('#label-list .label-group-name')).toHaveText("0: class 0");
    const output = (await readdir(dataset)).find((name) => name.startsWith("inference-"));
    expect(output).toBe("inference-local");
    const label = await readFile(path.join(dataset, output!, "image.txt"), "utf8");
    expect(label.trim().split(/\s+/)).toHaveLength(5);
    expect(label).toMatch(/^0 /);
    const resultClasses = await readFile(path.join(dataset, output!, "classes.yaml"), "utf8");
    expect(resultClasses).toContain('0: "class 0"');
    expect(JSON.parse(await readFile(path.join(dataset, output!, "inference.json"), "utf8"))).toMatchObject({ model: "local.onnx", images: ["image.jpg"], detections: 1 });
    expect(await readFile(path.join(dataset, "label/image.txt"), "utf8")).toBe(original);
    // Load the generated class file through the app's configured class profile.
    await copyFile(path.join(dataset, output!, "classes.yaml"), classProfile);
    await page.locator("#refreshDatasetBtn").click();
    await expect(page.locator("#activeOperationPanel")).toBeHidden();
    await expect(page.locator('#select-by-class-dropdown option[value="0"]')).toHaveText("0: class 0");
    await expect(page.locator('#label-list .label-group-name')).toHaveText("0: class 0");
    await writeFile(path.join(dataset, output!, "untouched.txt"), "keep this label\n");
    await page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi")?.seedDetectionBoxesForTest?.(3));
    await expect.poll(count).toBe(3);
    await page.locator("#runInferenceCurrentBtn").click();
    await expect(page.locator("#runInferenceCurrentBtn")).toBeEnabled();
    await expect.poll(count).toBe(1);
    await expect(page.locator("#labelSourceTabs .label-source-tab")).toHaveCount(2);
    await expect(page.locator('#select-by-class-dropdown option[value="0"]')).toHaveText("0: class 0");
    expect((await readdir(dataset)).filter((name) => name.startsWith("inference-"))).toEqual(["inference-local"]);
    expect(await readFile(path.join(dataset, output!, "image.txt"), "utf8")).toBe(label);
    expect(await readFile(path.join(dataset, output!, "classes.yaml"), "utf8")).toBe(resultClasses);
    expect(await readFile(path.join(dataset, output!, "untouched.txt"), "utf8")).toBe("keep this label\n");
    expect(await readFile(path.join(dataset, "label/image.txt"), "utf8")).toBe(original);
    await page.locator('#labelSourceTabs [data-source-index="0"]').click();
    await expect.poll(count).toBe(2);
    await page.locator('#labelSourceTabs [data-source-index="1"]').click();
    await expect.poll(count).toBe(1);
    await page.locator('#labelSourceTabs [data-source-index="0"]').click();
    await expect.poll(count).toBe(2);
    await page.locator("#taskReviewBtn").click();
    await page.locator("#markReviewedBtn").click();
    await expect(page.locator("#reviewStatusBadge")).toHaveText("Reviewed");
    await page.locator('#labelSourceTabs [data-source-index="1"]').click();
    await expect(page.locator("#reviewStatusBadge")).toHaveText("Needs review");
    await page.locator("#markReviewedBtn").click();
    await expect(page.locator("#reviewStatusBadge")).toHaveText("Reviewed");
    const resultReview = JSON.parse(await readFile(path.join(dataset, output!, ".easy-labeling/review-state.json"), "utf8"));
    expect(resultReview.images["image.jpg"].status).toBe("reviewed");
    await page.locator('#labelSourceTabs [data-source-index="0"]').click();
    await expect.poll(count).toBe(2);
    await expect(page.locator("#reviewStatusBadge")).toHaveText("Reviewed");
  } finally {
    await electron.close();
    expect(path.dirname(dataset)).toBe(path.resolve(os.tmpdir()));
    expect(path.basename(dataset)).toMatch(/^easy-labeling-inference-/);
    await rm(dataset, { recursive: true, force: true });
  }
});
