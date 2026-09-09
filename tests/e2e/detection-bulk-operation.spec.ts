import { expect, test } from "@playwright/test";

test("shows progress while pasting 5,000 detection boxes and keeps the result undoable", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/index.html");
  await page.locator("#emptyLoadSampleBtn").click();
  await expect.poll(async () => page.evaluate(() => {
    return Reflect.get(window, "__easyLabelingTestApi")?.getCurrentImageName?.() ?? "";
  }), { timeout: 30_000 }).toBe("sample_1.jpg");
  await page.locator('label[for="detectionWorkflowTab"]').click();

  await page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi") as {
      seedDetectionBoxesForTest?: (count: number) => void;
    } | undefined;
    api?.seedDetectionBoxesForTest?.(5000);
  });
  await expect.poll(async () => page.evaluate(() => {
    return Reflect.get(window, "__easyLabelingTestApi")?.getRectCount?.() ?? 0;
  })).toBe(5000);

  await page.keyboard.press("Control+c");
  await page.waitForTimeout(500);

  await page.keyboard.press("Control+v");
  await expect(page.locator("#activeOperationPanel")).toBeVisible();
  await expect(page.locator("#activeOperationProgressText")).toHaveText(/\d+ \/ 5000/);
  await expect.poll(async () => page.evaluate(() => {
    return Reflect.get(window, "__easyLabelingTestApi")?.getRectCount?.() ?? 0;
  }), { timeout: 90_000 }).toBe(10000);
  await expect.poll(async () => page.evaluate(() => {
    return Reflect.get(window, "__easyLabelingTestApi")?.canUndo?.() ?? false;
  })).toBe(true);

  await page.keyboard.press("Control+z");
  await expect.poll(async () => page.evaluate(() => {
    return Reflect.get(window, "__easyLabelingTestApi")?.getRectCount?.() ?? 0;
  })).toBe(5000);
});
