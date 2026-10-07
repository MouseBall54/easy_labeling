import { expect, test, type Page } from "@playwright/test";

async function loadSample(page: Page, query = ""): Promise<void> {
  await page.goto(`/index.html${query}`, { waitUntil: "domcontentloaded" });
  await expect.poll(() => page.evaluate(() => Boolean(Reflect.get(window, "__easyLabelingTestApi")))).toBe(true);
  await page.locator("#emptyLoadSampleBtn").click();
  await expect(page.locator("#loading-overlay")).toBeHidden({ timeout: 30_000 });
  await expect(page.locator("#workspaceStandbyPanel")).toBeHidden({ timeout: 30_000 });
  await expect.poll(() => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getRectCount())).toBe(207);
}

for (const workflow of ["detection", "segmentation"] as const) {
  test(`${workflow}: existing label thumbnails, class filter and focus preserve original labels`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.route("http://127.0.0.1:8766/status", (route) => route.fulfill({ json: { version: 5, cuda: false, gpu: null, models: ["yoloe-26n-seg"] } }));
    await loadSample(page, "?yoloe=python");
    if (workflow === "segmentation") await page.locator('label[for="segmentationWorkflowTab"]').click();
    const original = await page.evaluate((workflow) => {
      const api = Reflect.get(window, "__easyLabelingTestApi");
      return workflow === "detection" ? api.getRectCount() : api.getSegmentationMaskBounds();
    }, workflow);
    await page.locator("#taskYoloeBtn").click();
    await expect(page.locator("#yoloeSummary")).toContainText("N · 640 · CPU · GPU unavailable");
    await page.locator("#openYoloeSetupBtn").click();
    await expect(page.locator("#connectYoloeBtn")).toBeHidden();
    const choices = page.locator('[data-ui="yoloe-label-choice"]');
    await expect(choices.first()).toBeEnabled();
    await choices.nth(0).check(); await choices.nth(1).check();
    await expect(page.locator("#yoloeLabelSelectionSummary")).toContainText("2 selected");
    const originalZoom = await page.locator("#yoloeSampleZoom").textContent();
    await page.locator("#focusYoloeLabelsBtn").click();
    await expect(page.locator("#yoloeSampleZoom")).not.toHaveText(originalZoom!);
    const classId = await page.locator("#yoloeLabelClassFilter option").nth(1).getAttribute("value");
    await page.locator("#yoloeLabelClassFilter").selectOption(classId!);
    await expect(page.locator("#yoloeLabelSelectionSummary")).toContainText("2 selected");
    await page.locator("#addYoloeExistingBtn").click();
    await expect(page.locator("#yoloeExampleList .yoloe-example-row")).toHaveCount(2);
    await expect(page.locator("#focusYoloeLabelsBtn")).toBeEnabled();
    await expect(page.locator(".toast-message")).toHaveCount(0, { timeout: 10_000 });
    await page.screenshot({ path: `output/yoloe-usability-existing-${workflow}.png` });
    await page.locator("#closeYoloeSetupBtn").click();
    await page.locator("#yoloeSaveScope").selectOption("all");
    await expect(page.locator("#yoloeSaveScope option:checked")).toHaveText("All images (17)");
    const scope = (await page.locator("#yoloeSaveScope").boundingBox())!;
    const button = (await page.locator("#saveYoloeCurrentBtn").boundingBox())!;
    expect(button.y).toBeGreaterThanOrEqual(scope.y + scope.height);
    await expect(page.locator("#previewYoloeBtn")).toHaveText("Preview current image");
    await expect(page.locator("#yoloeInputSource")).toHaveText("Input: Original image");
    await expect(page.locator("#yoloeResultFolder")).toContainText("inference-yoloe-26n-seg-targets");
    expect(await page.evaluate((workflow) => {
      const api = Reflect.get(window, "__easyLabelingTestApi");
      return workflow === "detection" ? api.getRectCount() : api.getSegmentationMaskBounds();
    }, workflow)).toEqual(original);
  });
}

test("empty startup, compact dataset management and panel/tool navigation remain clear", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/index.html", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#loading-overlay")).toBeHidden({ timeout: 30_000 });
  await expect(page.locator("#emptyOpenDatasetBtn")).toBeVisible();
  await expect(page.locator(".image-library-section")).toBeHidden();
  await expect(page.locator("#classSearchInput")).toBeHidden();
  await expect(page.locator("#label-filters")).toBeHidden();
  await expect(page.locator(".label-list-section")).toBeHidden();
  await page.screenshot({ path: "docs/ux-improvements/20261006-stage2/empty.png" });
  await page.locator("#emptyLoadSampleBtn").click();
  await expect(page.locator("#workspaceStandbyPanel")).toBeHidden({ timeout: 30_000 });
  await expect(page.locator("#datasetActions")).toHaveClass(/dataset-connected/);
  await expect(page.locator("#loadClassInfoFolderBtn")).toBeHidden();
  await page.locator("#classManagement > summary").click();
  await expect(page.locator("#loadClassInfoFolderBtn")).toBeVisible();
  await page.locator("#collapse-left-panel-btn").click();
  await expect(page.locator("#left-panel")).toHaveAttribute("inert", "");
  await expect(page.locator("#expand-left-panel-btn")).toBeFocused();
  await page.locator("#expand-left-panel-btn").click();
  await expect(page.locator("#collapse-left-panel-btn")).toBeFocused();
  await page.locator("#collapse-right-panel-btn").click();
  await expect(page.locator("#right-panel")).toHaveAttribute("inert", "");
  await expect(page.locator("#expand-right-panel-btn")).toBeFocused();
  await page.locator("#expand-right-panel-btn").click();
  await expect(page.locator("#collapse-right-panel-btn")).toBeFocused();
  await page.locator("#left-panel .panel-content").evaluate((panel) => { panel.scrollTop = panel.scrollHeight; });
  await page.locator("#taskInferenceBtn").click();
  await expect.poll(() => page.locator("#left-panel .panel-content").evaluate((panel) => panel.scrollTop)).toBe(0);
  await expect(page.locator("#inferenceOutputFormat")).toBeHidden();
  await page.locator("#inferenceAdvancedSettings > summary").click();
  await expect(page.locator("#inferenceOutputFormat")).toBeVisible();
  await page.locator('label[for="segmentationWorkflowTab"]').click();
  for (const tool of ["Brush", "Erase", "Polygon", "AiSelect", "Superpixel"]) {
    await page.locator(`#segmentation${tool}ModeBtn`).click();
    if (tool === "Brush" || tool === "Erase") await expect(page.locator("#segmentationToolSizeSection")).toBeVisible();
    else await expect(page.locator("#segmentationToolSizeSection")).toBeHidden();
    if (tool === "Brush") await expect(page.locator("#segmentationAutoFillClosedRegionGroup")).toBeVisible();
    else await expect(page.locator("#segmentationAutoFillClosedRegionGroup")).toBeHidden();
  }
  await page.locator("#taskSuperpixelBtn").click();
  expect(await page.locator("#segmentationSuperpixelWorkspace").evaluate((panel) => panel.scrollWidth - panel.clientWidth)).toBeLessThanOrEqual(1);
});

test("Template results lead diagnostics and real dry runs distinguish no targets from errors", async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1280, height: 720 });
  await loadSample(page);
  await page.locator("#taskAutomateBtn").click();
  await page.locator("#openTemplateMatchingBtn").click();
  await page.locator("#testTemplateMatchBtn").click();
  await expect(page.locator("#templateMatchScore")).toContainText("1 match", { timeout: 30_000 });
  await expect(page.locator("#templateMatchCoordinates")).toContainText("X");
  await expect(page.locator("#templateMatchTimings")).toBeHidden();
  await page.locator("#templateMatchingModal").getByText("Execution details", { exact: true }).click();
  await expect(page.locator("#templateMatchTimings")).toContainText("OpenCV");
  await expect(page.locator(".toast-message")).toHaveCount(0, { timeout: 10_000 });
  await page.screenshot({ path: "docs/ux-improvements/20261006-stage2/template-light.png" });
  await page.locator("#templateMatchingModal .modal-footer").getByRole("button", { name: "Close", exact: true }).click();
  await expect(page.locator("#templateMatchingModal")).toBeHidden();
  await page.locator('label[for="darkModeToggle"]').click();
  await page.locator("#openTemplateMatchingBtn").click();
  await expect(page.locator("#templateMatchingModal")).toBeVisible();
  const contrast = await page.locator('label[for="templateOutputLayoutRadio"]').evaluate((element) => {
    const style = getComputedStyle(element);
    const luminance = (rgb: string) => {
      const channels = rgb.match(/[\d.]+/g)!.slice(0, 3).map((value) => {
        const channel = Number(value) / 255;
        return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
      });
      return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722;
    };
    const foreground = luminance(style.color), background = luminance(style.backgroundColor);
    return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
  });
  expect(contrast).toBeGreaterThanOrEqual(4.5);
  await page.screenshot({ path: "docs/ux-improvements/20261006-stage2/template-dark.png" });
  await page.locator("#templateMatchingModal .modal-footer").getByRole("button", { name: "Close", exact: true }).click();
  await expect(page.locator("#templateMatchingModal")).toBeHidden();
  await expect.poll(() => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getRectCount())).toBe(207);
  await page.setViewportSize({ width: 1332, height: 1000 });
  for (const preset of ["sample-layout-preset", "sample-multiple-preset"]) {
    await page.locator("#automationPresetSelect").selectOption(preset);
    await page.locator("#runAutomationBatchBtn").click();
    await page.locator("#batchDryRunToggle").check();
    await page.locator("#confirmAutomationBatchBtn").click();
    await expect(page.locator("#automationBatchCounts")).toHaveText("17 / 17", { timeout: 60_000 });
    await expect(page.locator("#automationBatchResultSummary")).toContainText("Errors 0");
    await expect(page.locator('#automationBatchResultList [data-state="no-match"]')).not.toHaveCount(0);
    await expect(page.locator("#retryFailedBatchBtn")).toBeHidden();
    await page.locator("#automationBatchResultSummary").scrollIntoViewIfNeeded();
    await page.screenshot({ path: `docs/ux-improvements/20261006-stage2/batch-${preset}.png` });
  }
});

for (const theme of ["light", "dark"] as const) {
  test(`${theme}: Review actions lead the panel and Mask classes have independent paint/visibility`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: 1280, height: 720 });
    await loadSample(page);
    if (theme === "dark") await page.locator('label[for="darkModeToggle"]').click();
    await page.locator("#taskReviewBtn").click();
    const review = (await page.locator("#detectionReviewWorkspace").boundingBox())!;
    const images = (await page.locator(".image-library-section").boundingBox())!;
    expect(review.y).toBeLessThan(images.y);
    const next = (await page.locator("#nextReviewIssueBtn").boundingBox())!;
    expect(next.y + next.height).toBeLessThan(720);
    await expect(page.locator(".toast-message")).toHaveCount(0, { timeout: 10_000 });
    await page.screenshot({ path: `docs/ux-improvements/20261006-stage2/review-${theme}.png` });
    await page.locator('label[for="segmentationWorkflowTab"]').click();
    await expect(page.locator("#segmentationPaintClassList .segmentation-class-row")).toHaveCount(12);
    const paint = page.locator('[data-ui="segmentation-active-class"][data-class-id="2"]');
    await paint.click();
    const eye = page.locator('[data-ui="segmentation-class-visibility-toggle"][data-class-id="2"]');
    await eye.uncheck();
    await expect(eye).toBeFocused();
    await expect(paint).toHaveAttribute("aria-pressed", "true");
    await expect.poll(() => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getSegmentationSummary().activeClassId)).toBe("2");
    await expect(eye).not.toBeChecked();
    await eye.check();
    await page.locator("#segmentationClassSearchInput").fill("flower");
    await expect(page.locator(".segmentation-class-row:visible")).toHaveCount(1);
    await page.locator("#segmentationClassSearchInput").fill("");
    await expect(page.locator(".toast-message")).toHaveCount(0, { timeout: 10_000 });
    await page.screenshot({ path: `docs/ux-improvements/20261006-stage2/mask-${theme}.png` });
    await page.locator("#taskSegmentationDisplayBtn").click();
    await expect(page.locator("#segmentationClassSummary")).toBeHidden();
    await page.getByText("Display class filter", { exact: true }).click();
    await page.locator('[data-ui="segmentation-filter-class"][data-class-id="2"]').click();
    await expect(page.locator('[data-ui="segmentation-class-visibility-toggle"][data-class-id="2"]')).toBeChecked();
    await page.locator('[data-ui="segmentation-filter-all"]').click();
  });
}
