import { expect, test } from "@playwright/test";

test("Image Preprocessing shows only settings for the selected Canvas View", async ({ page }) => {
  await page.goto("/index.html");
  await page.locator("#emptyLoadSampleBtn").click();
  await expect.poll(() => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi")?.getCurrentImageName?.() ?? "")).not.toBe("");
  await page.locator('label[for="segmentationWorkflowTab"]').click();
  await page.locator("#taskPreprocessingBtn").click();

  const processedSettings = page.locator("#segmentationPreprocessSettingsGroup");
  const algorithmInputs = page.locator("#segmentationPreprocessingInputs");
  const toolbarToggle = page.locator("#canvasViewToggleBtn");

  await expect(page.locator("#segmentationViewOriginalBtn")).toHaveClass(/active/);
  await expect(page.locator(".segmentation-preprocessing-toggle .btn")).toHaveText(["Original", "Processed"]);
  await expect(page.locator("#segmentationEdgeSamInputSelect option")).toHaveText(["Original", "Processed"]);
  await expect(page.locator("#segmentationSuperpixelInputSelect option")).toHaveText(["Original", "Processed"]);
  await expect(processedSettings).toBeHidden();
  await expect(algorithmInputs).toBeVisible();
  await expect(toolbarToggle).toHaveAttribute("aria-pressed", "false");

  await page.locator("#leftPanelTitle").click();
  await page.keyboard.press("q");
  await expect(page.locator("#segmentationViewProcessedBtn")).toHaveClass(/active/);
  await expect(toolbarToggle).toHaveAttribute("aria-pressed", "true");
  await expect(processedSettings).toBeVisible();
  await expect(page.locator("#segmentationEdgeSamInputSelect")).toHaveValue("original-processed");
  await expect(page.locator("#segmentationSuperpixelInputSelect")).toHaveValue("original-processed");

  await page.locator("#segmentationPreprocessModeSelect").selectOption("edge");
  await page.locator("#segmentationPreprocessBlurInput").fill("3");
  await page.locator("#segmentationPreprocessBlurInput").dispatchEvent("change");
  await page.locator("#segmentationPreprocessEdgeWeightInput").fill("42");
  await page.locator("#segmentationPreprocessEdgeWeightInput").dispatchEvent("change");
  await page.locator("#segmentationEdgeSamInputSelect").selectOption("original");
  await expect(page.locator("#segmentationViewProcessedBtn")).toHaveClass(/active/);
  await expect(page.locator("#segmentationSuperpixelInputSelect")).toHaveValue("original-processed");

  // The toolbar toggle and the panel buttons show the same view.
  await toolbarToggle.click();
  await expect(page.locator("#segmentationViewOriginalBtn")).toHaveClass(/active/);
  await expect(toolbarToggle).toHaveAttribute("aria-pressed", "false");
  await expect(processedSettings).toBeHidden();
  await expect(page.locator("#segmentationEdgeSamInputSelect")).toHaveValue("original");
  await expect(page.locator("#segmentationSuperpixelInputSelect")).toHaveValue("original");

  await page.locator("#segmentationViewProcessedBtn").click();
  await expect(toolbarToggle).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#segmentationPreprocessModeSelect")).toHaveValue("edge");
  await expect(page.locator("#segmentationPreprocessBlurInput")).toHaveValue("3");
  await expect(page.locator("#segmentationPreprocessEdgeWeightInput")).toHaveValue("42");
  await page.locator("#taskSegmentationBtn").click();
  await page.locator("#taskPreprocessingBtn").click();
  await expect(page.locator("#segmentationViewProcessedBtn")).toHaveClass(/active/);
  await expect(processedSettings).toBeVisible();

  await page.setViewportSize({ width: 760, height: 720 });
  const dimensions = await page.locator("#segmentationPreprocessingSection").evaluate((section) => ({
    clientWidth: section.clientWidth,
    scrollWidth: section.scrollWidth
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  await expect(toolbarToggle).toBeVisible();
  await page.screenshot({ path: "test-results/preprocessing-panel-light.png" });
  await page.locator('label[for="darkModeToggle"]').click();
  await page.screenshot({ path: "test-results/preprocessing-panel-dark.png" });
});
