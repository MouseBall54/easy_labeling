import { expect, test } from "@playwright/test";

test("review workspace filters quality findings, selects an affected box, navigates the queue, and restores review status", async ({ page }) => {
  test.setTimeout(90_000);
  await page.addInitScript(() => {
    Object.defineProperty(window, "showDirectoryPicker", {
      configurable: true,
      value: async () => {
        throw new DOMException("Not used by bundled sample test", "AbortError");
      }
    });
  });
  await page.goto("/index.html");
  await page.locator("#emptyLoadSampleBtn").click();
  await expect.poll(async () => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi")?.getRectCount?.() ?? -1), { timeout: 30_000 }).toBe(52);

  await expect(page.locator('[data-ui="review-controls"]')).toBeHidden();
  await page.locator("#taskReviewBtn").click();
  await expect(page.locator(".app-workspace")).toHaveAttribute("data-active-task", "review");
  await expect(page.locator('[data-ui="review-controls"]')).toBeVisible();
  await expect(page.locator("#inspectorTitle")).toHaveText("Review Inspector");
  await expect(page.locator("#reviewFilterSelect")).toHaveValue("has-issues");
  await page.locator('[data-ui="review-controls"] summary').click();
  await page.locator("#reviewMinimumBoxSizeInput").fill("10000");
  await page.locator("#saveReviewRulesBtn").click();
  await expect.poll(async () => page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi") as { getReviewSummary?: () => { minimumBoxSizePx: number; findingCount: number } } | undefined;
    return api?.getReviewSummary?.() ?? null;
  })).toEqual(expect.objectContaining({ minimumBoxSizePx: 10000 }));
  await expect(page.locator('[data-ui="review-issue-count"]')).toHaveCount(3);

  await page.locator("#taskReviewBtn").click();
  await expect(page.locator("#reviewFilterSelect")).toHaveValue("has-issues");
  await expect(page.locator("#image-list [data-file-name]")).toHaveCount(3);
  await expect(page.locator("#reviewQueueSummary")).toHaveText("3");
  await page.locator("#nextReviewIssueBtn").click();
  await expect.poll(async () => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi")?.getCurrentImageName?.() ?? "")).toBe("sample_2.jpg");
  await page.locator("#previousReviewIssueBtn").click();
  await expect.poll(async () => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi")?.getCurrentImageName?.() ?? "")).toBe("sample_1.jpg");
  await expect(page.locator("#reviewIssueList [data-review-issue-index]").first()).toContainText("smaller than 10000px");
  await expect(page.locator("#reviewIssueList [data-review-issue-index]").first()).toContainText("Box #1");
  await expect(page.locator("#reviewIssueList [data-review-issue-index]").first().locator(".label-color-swatch")).toHaveCount(1);
  await page.locator("#reviewIssueList [data-review-issue-index]").first().click();
  await expect.poll(async () => page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi") as { getSelectedRectIds?: () => string[] } | undefined;
    return api?.getSelectedRectIds?.().length ?? 0;
  })).toBe(1);
  await expect(page.locator("#reviewIssueList [data-review-issue-index]").first()).toHaveClass(/active/);
  await page.locator("#reviewMinimumBoxSizeInput").fill("2");
  await page.locator("#saveReviewRulesBtn").click();
  await expect.poll(async () => page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi") as { getReviewSummary?: () => { minimumBoxSizePx: number } } | undefined;
    return api?.getReviewSummary?.().minimumBoxSizePx ?? -1;
  })).toBe(2);
  await page.locator("#reviewIssueList [data-review-issue-index]").first().click();
  await page.locator("#selectionGeometryWidth").fill("1");
  await page.locator("#selectionGeometryWidth").press("Tab");
  await page.locator("#selectionGeometryHeight").fill("1");
  await page.locator("#selectionGeometryHeight").press("Tab");
  await page.locator("#saveLabelsBtn").click();
  await expect(page.locator("#documentStatus")).toContainText("Saved");
  await expect(page.locator("#reviewIssueList")).toContainText("No quality issues found.");

  await page.locator("#markReviewedBtn").click();
  await expect(page.locator("#reviewStatusBadge")).toHaveText("Reviewed");
  await page.locator("#reviewFilterSelect").selectOption("reviewed");
  await expect(page.locator("#image-list [data-file-name]")).toHaveCount(1);

  await page.locator("#refreshDatasetBtn").click();
  await expect(page.locator("#reviewStatusBadge")).toHaveText("Reviewed");
  await expect(page.locator("#reviewMinimumBoxSizeInput")).toHaveValue("2");
});
