import { expect, test } from "@playwright/test";

test("Image Preprocessing shows only settings for the selected Canvas View", async ({ page }) => {
  await page.goto("/index.html");
  await page.locator("#emptyLoadSampleBtn").click();
  await expect.poll(() => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi")?.getCurrentImageName?.() ?? "")).not.toBe("");
  await page.locator('label[for="segmentationWorkflowTab"]').click();
  await page.locator("#taskPreprocessingBtn").click();

  const srSettings = page.locator("#segmentationSrSettingsGroup");
  const processedSettings = page.locator("#segmentationPreprocessSettingsGroup");
  const roiGroup = page.locator("#segmentationSrRoiGroup");
  const algorithmInputs = page.locator("#segmentationPreprocessingInputs");

  await expect(page.locator("#segmentationViewOriginalBtn")).toHaveClass(/active/);
  await expect(page.locator("#segmentationViewSrBtn")).toHaveText("AI");
  await expect(page.locator("#segmentationPreprocessSourceSelect option")).toHaveText(["Original", "AI"]);
  await expect(page.locator("#segmentationEdgeSamInputSelect option")).toHaveText(["Original", "Original Processed", "AI", "Processed AI"]);
  await expect(page.locator("#segmentationSuperpixelInputSelect option")).toHaveText(["Original", "Original Processed", "AI", "Processed AI"]);
  await expect(srSettings).toBeHidden();
  await expect(processedSettings).toBeHidden();
  await expect(roiGroup).toBeVisible();
  await expect(algorithmInputs).toBeVisible();
  await expect(page.locator("#segmentationFocusSrRoiBtn")).toBeDisabled();

  await page.locator("#leftPanelTitle").click();
  await page.keyboard.press("q");
  await expect(page.locator("#segmentationViewProcessedBtn")).toHaveClass(/active/);
  await expect(srSettings).toBeHidden();
  await expect(processedSettings).toBeVisible();
  await expect(roiGroup).toBeVisible();
  await expect(page.locator("#segmentationEdgeSamInputSelect")).toHaveValue("original-processed");
  await expect(page.locator("#segmentationSuperpixelInputSelect")).toHaveValue("original-processed");
  await page.locator("#segmentationPreprocessSourceSelect").selectOption("sr-roi");
  await expect(page.locator("#segmentationPreprocessSourceSelect")).toHaveValue("original");

  await page.locator("#segmentationPreprocessModeSelect").selectOption("edge");
  await page.locator("#segmentationPreprocessBlurInput").fill("3");
  await page.locator("#segmentationPreprocessBlurInput").dispatchEvent("change");
  await page.locator("#segmentationPreprocessEdgeWeightInput").fill("42");
  await page.locator("#segmentationPreprocessEdgeWeightInput").dispatchEvent("change");
  await page.locator("#segmentationEdgeSamInputSelect").selectOption("original");
  await expect(page.locator("#segmentationViewProcessedBtn")).toHaveClass(/active/);
  await expect(page.locator("#segmentationSuperpixelInputSelect")).toHaveValue("original-processed");

  await page.locator("#segmentationViewOriginalBtn").click();
  await expect(srSettings).toBeHidden();
  await expect(processedSettings).toBeHidden();
  await expect(roiGroup).toBeVisible();
  await expect(page.locator("#segmentationEdgeSamInputSelect")).toHaveValue("original");
  await expect(page.locator("#segmentationSuperpixelInputSelect")).toHaveValue("original");

  await page.locator("#segmentationViewSrBtn").click();
  await expect(page.locator("#segmentationViewSrBtn")).toHaveClass(/active/);
  await expect(srSettings).toBeVisible();
  await expect(processedSettings).toBeHidden();
  await expect(roiGroup).toBeVisible();
  await expect(page.locator("#segmentationSuperResolutionSelect option")).toHaveText([
    "Off", "CFSR x2", "CFSR x4", "tk_r_em hrsem", "tk_r_em hrtem", "tk_r_em lrsem", "tk_r_em lrtem"
  ]);
  await page.keyboard.press("Escape");

  await page.locator("#segmentationViewOriginalBtn").click();
  await page.locator("#segmentationViewProcessedBtn").click();
  await expect(page.locator("#segmentationPreprocessModeSelect")).toHaveValue("edge");
  await expect(page.locator("#segmentationPreprocessBlurInput")).toHaveValue("3");
  await expect(page.locator("#segmentationPreprocessEdgeWeightInput")).toHaveValue("42");
  await page.locator("#taskSegmentationBtn").click();
  await page.locator("#taskPreprocessingBtn").click();
  await expect(page.locator("#segmentationViewProcessedBtn")).toHaveClass(/active/);
  await expect(processedSettings).toBeVisible();
  await expect(roiGroup).toBeVisible();

  await page.setViewportSize({ width: 760, height: 720 });
  const dimensions = await page.locator("#segmentationPreprocessingSection").evaluate((section) => ({
    clientWidth: section.clientWidth,
    scrollWidth: section.scrollWidth
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);

  const light = await roiGroup.evaluate((element) => getComputedStyle(element.querySelector(".segmentation-sr-roi-summary")!).backgroundColor);
  await page.locator('label[for="darkModeToggle"]').click();
  const dark = await roiGroup.evaluate((element) => getComputedStyle(element.querySelector(".segmentation-sr-roi-summary")!).backgroundColor);
  expect(light).not.toBe("rgba(0, 0, 0, 0)");
  expect(dark).not.toBe("rgba(0, 0, 0, 0)");
  expect(dark).not.toBe(light);
});
