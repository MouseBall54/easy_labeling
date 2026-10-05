import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { inferenceModel } from "./fixtures/inference-model.js";

for (const failure of ["unavailable", "execution"] as const) {
  test(`YOLO ${failure} GPU falls back to real CPU inference and updates the device display`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.route("**/workers/yolo-inference-worker.js*", async (route) => {
      const response = await route.fetch();
      const script = await response.text();
      const injection = failure === "unavailable"
        ? 'Object.defineProperty(self.navigator, "gpu", { value: undefined });'
        : `Object.defineProperty(self.navigator, "gpu", { value: {} });
           const originalCreate = ort.InferenceSession.create;
           ort.InferenceSession.create = async (model, options) => {
             if (options.executionProviders[0]?.name === "webgpu") {
               const session = await originalCreate(model, { executionProviders: ["wasm"] });
               session.run = async () => { throw new Error("Test GPU device lost"); };
               return session;
             }
             return originalCreate(model, options);
           };`;
      await route.fulfill({ response, body: `${injection}\n${script}` });
    });
    await page.goto("/index.html");
    await page.locator("#emptyLoadSampleBtn").click();
    const count = () => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi")?.getRectCount?.() ?? -1);
    await expect.poll(count, { timeout: 30_000 }).toBe(207);
    await page.locator("#taskInferenceBtn").click();
    await page.locator("#inferenceModelInput").setInputFiles({ name: "fallback.onnx", mimeType: "application/octet-stream", buffer: inferenceModel(1, "nchw") });
    await expect(page.locator("#runInferenceCurrentBtn")).toBeEnabled({ timeout: 30_000 });
    await expect(page.locator("#inferenceBackendBadge")).toHaveText(failure === "execution" ? "GPU · WebGPU" : "CPU · WASM");
    await page.locator("#runInferenceCurrentBtn").click();
    await expect(page.locator("#inferenceRunStatus")).toContainText("1 image(s) · 1 detection(s)", { timeout: 30_000 });
    await expect.poll(count).toBe(1);
    await expect(page.locator("#inferenceBackendBadge")).toHaveText("CPU · WASM");
    await expect(page.locator("#inferenceBackendBadge")).toHaveAttribute("title", new RegExp(`GPU ${failure === "execution" ? "execution" : "initialization"} failed`));
    await expect(page.locator("#inferenceModelStatus")).toContainText("CPU / WASM · CPU fallback");
  });
}

test("selected ONNX filename survives loading and picker cancellation, with same-file reload", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/index.html");
  await page.locator("#taskInferenceBtn").click();
  await expect(page.locator("#inferenceBackendBadge")).toHaveText("No model");
  await expect(page.locator("#inferenceModelStatus")).toBeHidden();
  await expect(page.locator("#inferenceRunStatus")).toBeHidden();
  await expect(page.locator("#inferenceModelInput")).toBeHidden();
  await expect(page.locator("#selectInferenceModelBtn")).toBeVisible();
  await expect(page.locator("#inferenceModelName")).toHaveText("Choose .onnx model");
  await page.locator("#onnxInferenceControls summary").click();
  await page.locator("#inferenceSizeInput").fill("32");
  const input = page.locator("#inferenceModelInput");
  const status = page.locator("#inferenceModelStatus");
  const model = { name: "selected-model.onnx", mimeType: "application/octet-stream", buffer: inferenceModel(1, "nchw", true) };
  await input.setInputFiles(model);
  await expect(status).toContainText("1ch · NCHW · 32 × 32", { timeout: 30_000 });
  await expect(input).toBeEnabled();
  await expect(input).toHaveValue(/selected-model\.onnx$/);
  await expect(page.locator("#inferenceModelName")).toHaveText(model.name);

  // Dispatch picker lifecycle events without opening an OS dialog to verify cancellation.
  await input.dispatchEvent("click");
  await input.dispatchEvent("cancel");
  await expect(input).toHaveValue(/selected-model\.onnx$/);
  await expect(page.locator("#inferenceModelName")).toHaveText(model.name);
  expect(await input.evaluate((element: HTMLInputElement) => element.files?.[0]?.name)).toBe(model.name);

  await page.locator("#inferenceSizeInput").fill("64");
  const chooserPromise = page.waitForEvent("filechooser");
  await page.locator("#selectInferenceModelBtn").click();
  await (await chooserPromise).setFiles(model);
  await expect(status).toContainText("1ch · NCHW · 64 × 64", { timeout: 30_000 });
  await expect(input).toBeEnabled();
  await expect(input).toHaveValue(/selected-model\.onnx$/);
});

test("YOLO automatic GPU/CPU inference: 1ch/3ch NCHW/NHWC, batch results, safe source switching and themes", async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1480, height: 940 });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/assets/sample/manifest.json", async (route) => {
    const response = await route.fetch();
    const manifest = await response.json();
    manifest.files = manifest.files.filter((name: string) => name.includes("/") || !name.endsWith(".png"));
    await route.fulfill({ response, json: manifest });
  });
  await page.goto("/index.html");
  await page.locator("#emptyLoadSampleBtn").click();
  const rectCount = () => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi")?.getRectCount?.() ?? -1);
  await expect.poll(rectCount, { timeout: 30_000 }).toBe(207);
  await page.locator("#taskInferenceBtn").click();
  await expect(page.locator("#taskInferenceBtn")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#detectionInferenceWorkspace")).toBeVisible();
  await expect(page.locator("#runInferenceCurrentBtn")).toBeDisabled();
  await page.locator("#autoSaveToggle").check();
  const source = page.locator("#labelSourceSelect");

  for (const layout of ["nchw", "nhwc"] as const) {
    for (const channels of [1, 3] as const) {
      const dynamic = channels === 3 && layout === "nhwc";
      if (dynamic) {
        await page.locator("#onnxInferenceControls summary").click();
        await page.locator("#inferenceSizeInput").fill("32");
      }
      await page.locator("#inferenceModelInput").setInputFiles({ name: `fixture-${channels}ch-${layout}.onnx`, mimeType: "application/octet-stream", buffer: inferenceModel(channels, layout, dynamic) });
      await expect(page.locator("#inferenceModelStatus")).toContainText(`${channels}ch · ${layout.toUpperCase()} · 32 × 32`, { timeout: 30_000 });
      await expect(page.locator("#inferenceBackendBadge")).toHaveText(/^(GPU · WebGPU|CPU · WASM)$/);
      await expect(page.locator("#inferenceModelStatus")).toContainText(/GPU \/ WebGPU|CPU \/ WASM/);
      await page.locator("#runInferenceCurrentBtn").click();
      await expect(page.locator("#inferenceRunStatus")).toContainText("1 image(s) · 1 detection(s)", { timeout: 30_000 });
      await expect.poll(rectCount).toBe(1);
      expect(await source.inputValue()).not.toBe("0");
      const resultSource = await source.inputValue();
      await expect(source.locator(`option[value="${resultSource}"]`)).toContainText(`inference-fixture-${channels}ch-${layout}`);
      await source.selectOption("0");
      await expect.poll(rectCount).toBe(207);
      await source.selectOption(resultSource);
      await expect.poll(rectCount).toBe(1);
      await source.selectOption("0");
      await expect.poll(rectCount).toBe(207);
    }
  }
  await expect(source.locator("option")).toHaveCount(5);
  // Editing the source then switching must save into that source, never into an inference folder.
  await page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi")?.seedDetectionBoxesForTest?.(3));
  await expect.poll(rectCount).toBe(3);
  await source.selectOption("1");
  await expect.poll(rectCount).toBe(1);
  await source.selectOption("0");
  await expect.poll(rectCount).toBe(3);
  await page.locator("#inferenceConfidenceInput").fill("1.1");
  await page.locator("#runInferenceCurrentBtn").click();
  await expect(page.locator("#inferenceRunStatus")).toContainText("between 0 and 1");
  await expect(source.locator("option")).toHaveCount(5);
  await page.locator("#inferenceConfidenceInput").fill("0.25");
  await page.locator("#runInferenceAllBtn").click();
  await expect(page.locator("#inferenceRunStatus")).toContainText("inference-fixture-3ch-nhwc", { timeout: 60_000 });
  await expect(page.locator("#runInferenceAllBtn")).toBeEnabled();
  await expect(source.locator("option")).toHaveCount(5);
  await expect.poll(rectCount).toBe(1);
  // Rerun into the active model folder: replace edited results without adding a source.
  await page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi")?.seedDetectionBoxesForTest?.(3));
  await expect.poll(rectCount).toBe(3);
  await page.locator("#runInferenceCurrentBtn").click();
  await expect(page.locator("#runInferenceCurrentBtn")).toBeEnabled();
  await expect.poll(rectCount).toBe(1);
  await expect(source.locator("option")).toHaveCount(5);
  await source.selectOption("0");
  await expect.poll(rectCount).toBe(3);
  await source.selectOption("4");
  await expect.poll(rectCount).toBe(1);
  await page.locator("#nextImageBtn").click();
  await expect(page.locator("#activeOperationPanel")).toBeHidden();
  await expect.poll(rectCount).toBe(1);
  await page.locator("#refreshDatasetBtn").click();
  await expect(page.locator("#activeOperationPanel")).toBeHidden({ timeout: 30_000 });
  await expect(page.locator("#workspaceStandbyPanel")).toBeHidden();
  await expect.poll(rectCount).toBe(1);
  await expect(source).toHaveValue("4");
  await page.locator("#onnxInferenceControls summary").click();
  await page.locator("#selectInferenceModelBtn").scrollIntoViewIfNeeded();
  await expect(page.locator(".toast-message")).toHaveCount(0, { timeout: 10_000 });
  await page.screenshot({ path: "output/playwright/inference-light.png" });
  await page.locator('label[for="darkModeToggle"]').click();
  await page.screenshot({ path: "output/playwright/inference-dark.png" });
  await page.locator("#taskReviewBtn").click();
  await expect(page.locator("#detectionInferenceWorkspace")).toBeHidden();
  await expect(page.locator("#detectionReviewWorkspace")).toBeVisible();
  expect(errors).toEqual([]);
});

test("batch inference rejects duplicate label filenames and model loading recovers after an invalid file", async ({ page }) => {
  test.setTimeout(90_000);
  // This intentionally invalid fixture stays independent of the bundled samples' unique names.
  await page.route("**/assets/sample/manifest.json", async (route) => {
    const response = await route.fetch();
    const manifest = await response.json();
    manifest.files.push("sample_1.jpeg");
    await route.fulfill({ json: manifest });
  });
  await page.route("**/assets/sample/sample_1.jpeg", async (route) => {
    await route.fulfill({ contentType: "image/jpeg", body: await readFile("assets/sample/sample_1.jpg") });
  });
  await page.goto("/index.html");
  await page.locator("#emptyLoadSampleBtn").click();
  await expect(page.locator("#labelSourceSelect option")).toHaveCount(1, { timeout: 30_000 });
  await page.locator("#taskInferenceBtn").click();
  await page.locator("#inferenceModelInput").setInputFiles({ name: "invalid.onnx", mimeType: "application/octet-stream", buffer: Buffer.from("invalid") });
  await expect(page.locator("#inferenceModelStatus")).not.toContainText("Loading", { timeout: 30_000 });
  await expect(page.locator("#runInferenceCurrentBtn")).toBeDisabled();
  await page.locator("#inferenceModelInput").setInputFiles({ name: "valid.onnx", mimeType: "application/octet-stream", buffer: inferenceModel(3, "nchw") });
  await expect(page.locator("#runInferenceAllBtn")).toBeEnabled({ timeout: 30_000 });
  await page.locator("#runInferenceAllBtn").click();
  await expect(page.locator("#inferenceRunStatus")).toContainText("same base name");
  await expect(page.locator("#labelSourceSelect option")).toHaveCount(1);
  await page.locator('label[for="segmentationWorkflowTab"]').click();
  await expect(page.locator("#taskInferenceBtn")).toBeHidden();
  await page.locator('label[for="detectionWorkflowTab"]').click();
  await expect(page.locator("#taskInferenceBtn")).toBeVisible();
});
