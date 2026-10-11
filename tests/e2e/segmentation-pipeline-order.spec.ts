import { expect, test } from "@playwright/test";

test("Processed pipeline swaps AI and Processed order and re-runs AI only on request", async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto("/index.html");
  await page.locator("#emptyLoadSampleBtn").click();
  await expect.poll(() => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi")?.getCurrentImageName?.() ?? "")).not.toBe("");
  await page.locator('label[for="segmentationWorkflowTab"]').click();
  await page.locator("#taskPreprocessingBtn").click();

  const steps = page.locator("#segmentationPipelineSteps");
  const aiToggle = page.locator("#segmentationPipelineAiToggle");
  const swap = page.locator("#segmentationPipelineSwapBtn");
  const stale = page.locator("#segmentationPipelineStale");

  // Without an AI result the AI step cannot be switched on.
  await page.locator("#segmentationViewProcessedBtn").click();
  await expect(steps).toHaveAttribute("data-order", "ai-first");
  await expect(aiToggle).not.toBeChecked();
  await expect(aiToggle).toBeDisabled();

  await page.locator("#segmentationViewSrBtn").click();
  const box = (await page.locator(".upper-canvas").boundingBox())!;
  await page.mouse.move(box.x + box.width / 2 - 32, box.y + box.height / 2 - 24);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 32, box.y + box.height / 2 + 24, { steps: 4 });
  await page.mouse.up();
  await page.locator('[data-segmentation-sr-mode="cfsr-x2"]').click();
  await expect(page.locator("#segmentationSuperResolutionSelect")).toHaveValue("cfsr-x2", { timeout: 60_000 });

  await page.locator("#segmentationViewProcessedBtn").click();
  await expect(aiToggle).toBeEnabled();
  await aiToggle.check();
  await expect(aiToggle).toBeChecked();
  await expect(page.locator('#segmentationEdgeSamInputSelect option[value="sr-roi-processed"]')).toHaveText("Processed AI ROI");

  // Swapping runs AI once on the processed ROI; the chips show the new order.
  await swap.click();
  await expect(steps).toHaveAttribute("data-order", "processed-first", { timeout: 60_000 });
  await expect(swap).toBeEnabled({ timeout: 60_000 });
  await expect(page.locator('#segmentationEdgeSamInputSelect option[value="sr-roi-processed"]')).toHaveText("AI on processed ROI");
  const chipOrder = await steps.evaluate((element) => [...element.querySelectorAll<HTMLElement>("[data-step]")]
    .sort((left, right) => left.getBoundingClientRect().left - right.getBoundingClientRect().left)
    .map((step) => step.dataset.step));
  expect(chipOrder).toEqual(["processed", "ai"]);
  await expect(stale).toBeHidden();

  // A processing change keeps the old AI result and offers a re-run instead of running the model.
  await page.locator("#segmentationPreprocessGammaInput").fill("150");
  await page.locator("#segmentationPreprocessGammaInput").dispatchEvent("change");
  await expect(stale).toBeVisible();
  await expect(swap).toBeEnabled();
  await page.locator(".segmentation-pipeline").screenshot({ path: "test-results/pipeline-order/stale-light.png" });
  await page.evaluate(() => document.body.classList.add("dark-mode"));
  await page.locator(".segmentation-pipeline").screenshot({ path: "test-results/pipeline-order/stale-dark.png" });
  await page.evaluate(() => document.body.classList.remove("dark-mode"));
  await page.locator("#segmentationPipelineRerunBtn").click();
  await expect(stale).toBeHidden({ timeout: 60_000 });

  // Back to AI -> Processed: no model run is needed and nothing is stale.
  await swap.click();
  await expect(steps).toHaveAttribute("data-order", "ai-first");
  await expect(stale).toBeHidden();
  await expect(aiToggle).toBeChecked();
});
