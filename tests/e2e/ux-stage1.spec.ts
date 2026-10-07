import { expect, test, type Page } from "@playwright/test";

async function loadSample(page: Page): Promise<void> {
  await page.goto("/index.html?yoloe=python", { waitUntil: "domcontentloaded" });
  await expect.poll(() => page.evaluate(() => Boolean(Reflect.get(window, "__easyLabelingTestApi")))).toBe(true);
  await page.locator("#emptyLoadSampleBtn").click();
  await expect(page.locator("#loading-overlay")).toBeHidden({ timeout: 30_000 });
  await expect(page.locator("#workspaceStandbyPanel")).toBeHidden({ timeout: 30_000 });
  await expect.poll(() => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getRectCount())).toBe(207);
}

for (const workflow of ["detection", "segmentation"] as const) {
  test(`${workflow}: numeric/button zoom and ROI selection preserve source labels`, async ({ page }) => {
    test.setTimeout(90_000);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await loadSample(page);
    if (workflow === "segmentation") await page.locator('label[for="segmentationWorkflowTab"]').click();
    const original = await page.evaluate((workflow) => {
      const api = Reflect.get(window, "__easyLabelingTestApi");
      return workflow === "detection" ? api.getRectCount() : api.getSegmentationMaskBounds();
    }, workflow);
    const readZoom = () => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getCanvasViewportTransform()[0]);
    const numeric = page.locator("#zoom-input");
    await numeric.fill("125"); await numeric.press("Tab");
    await expect.poll(readZoom).toBeCloseTo(1.25);
    await page.locator("#zoomInBtn").click(); await expect.poll(readZoom).toBeCloseTo(1.5);
    await page.locator("#zoomOutBtn").click(); await expect.poll(readZoom).toBeCloseTo(1.2);
    await numeric.fill("10"); await numeric.press("Tab");
    await page.locator("#zoomOutBtn").click(); await expect.poll(readZoom).toBeCloseTo(0.1);
    await numeric.fill("2000"); await numeric.press("Tab");
    await page.locator("#zoomInBtn").click(); await expect.poll(readZoom).toBeCloseTo(20);
    await page.locator("#resetZoomBtn").click();
    await expect.poll(readZoom).toBeLessThan(1);
    await page.locator(workflow === "detection" ? 'label[for="drawMode"]' : "#segmentationBrushModeBtn").click();
    await page.locator(workflow === "detection" ? "#taskAutomateBtn" : "#taskSuperpixelBtn").click();
    await expect(page.locator("#activeToolSummary")).toHaveText(workflow === "detection" ? "Draw" : "Brush");
    await page.locator("#taskPreprocessingBtn").click();
    await page.locator("#segmentationSelectSrRoiBtn").click();
    await expect(page.locator("#segmentationSelectSrRoiBtn")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#segmentationSrResultStatus")).toContainText("Esc to cancel");
    const canvas = (await page.locator("canvas.upper-canvas").boundingBox())!;
    await page.mouse.move(canvas.x + canvas.width * 0.4, canvas.y + canvas.height * 0.4);
    await page.mouse.down();
    await page.mouse.move(canvas.x + canvas.width * 0.6, canvas.y + canvas.height * 0.6, { steps: 5 });
    await page.mouse.up();
    await expect.poll(() => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getSegmentationSrRoi())).not.toBeNull();
    await expect(page.locator("#labelClassModal")).toBeHidden();
    await expect(page.locator("#segmentationSelectSrRoiBtn")).toHaveAttribute("aria-pressed", "false");
    await page.keyboard.press("Escape");
    await page.locator("#segmentationSelectSrRoiBtn").click();
    await page.locator("#leftPanelTitle").click(); await page.keyboard.press("Escape");
    await expect(page.locator("#segmentationSelectSrRoiBtn")).toHaveAttribute("aria-pressed", "false");
    await expect.poll(() => page.evaluate((workflow) => {
      const api = Reflect.get(window, "__easyLabelingTestApi");
      return workflow === "detection" ? api.getRectCount() : api.getSegmentationMaskBounds();
    }, workflow)).toEqual(original);
    if (workflow === "detection") await expect(page.locator("#drawMode")).toBeChecked();
    else await expect(page.locator("#segmentationBrushModeBtn")).toHaveClass(/active/);
    expect(errors).toEqual([]);
  });
}

test("YOLOE popup keeps actions visible and shows preset/operation state", async ({ page }) => {
  test.setTimeout(90_000);
  await page.route("http://127.0.0.1:8766/**", async (route) => {
    if (route.request().url().endsWith("/status")) return route.fulfill({ json: { version: 5, cuda: false, models: ["yoloe-26n-seg"] } });
    await new Promise((resolve) => setTimeout(resolve, 1200));
    if (route.request().url().endsWith("/prepare")) return route.fulfill({ json: { id: "preview", model: "yoloe-26n-seg", workflow: "detection", backend: "cpu", classes: { "1": "car" } } });
    return route.fulfill({ json: { backend: "cpu", detections: [] } });
  });
  await loadSample(page);
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.locator("#taskYoloeBtn").click(); await page.locator("#openYoloeSetupBtn").click();
  await expect(page.locator("#yoloeModelSelect")).toBeEnabled();
  await expect(page.locator("#yoloeSetupStatus")).toHaveText("Ready");
  const inViewport = async (selector: string) => page.locator(selector).evaluate((el) => {
    const box = el.getBoundingClientRect();
    return box.top >= 0 && box.bottom <= window.innerHeight && box.left >= 0 && box.right <= window.innerWidth;
  });
  for (const selector of ["#drawYoloeExampleBtn", "#previewYoloeSampleBtn", "#closeYoloeSetupBtn", "#yoloePromptShape"]) expect(await inViewport(selector)).toBe(true);
  expect(await page.locator(".yoloe-settings-column").evaluate(el => el.scrollWidth > el.clientWidth)).toBe(false);
  await page.locator("#yoloeExistingBoxSelect").selectOption("0"); await page.locator("#addYoloeExistingBtn").click();
  await expect(page.locator("#yoloePresetState")).toHaveText("Unsaved changes");
  await page.locator("#saveYoloePresetBtn").click();
  await expect(page.locator("#yoloePresetState")).toHaveText("Saved");
  await page.locator("#yoloeConfidenceInput").fill("0.3");
  await expect(page.locator("#yoloePresetState")).toHaveText("Unsaved changes");
  await page.locator("#previewYoloeSampleBtn").click();
  await expect(page.locator("#yoloeSetupStatus")).toContainText("Encoding samples");
  await expect(page.locator("#stopYoloePreviewBtn")).toBeVisible();
  expect(await inViewport("#stopYoloePreviewBtn")).toBe(true);
  await page.locator("#stopYoloePreviewBtn").click();
  await expect(page.locator("#yoloeSetupStatus")).toContainText("stopped");
  await expect(page.locator("#stopYoloePreviewBtn")).toBeHidden();
  await expect(page.locator("#previewYoloeSampleBtn")).toBeEnabled();
  await page.locator("#previewYoloeSampleBtn").click();
  await expect(page.locator("#yoloeSetupStatus")).toContainText("Preview · 0 detection", { timeout: 20_000 });
  await page.locator("#closeYoloeSetupBtn").click();
  await expect(page.locator("#openYoloeSetupBtn")).toBeFocused();
});
