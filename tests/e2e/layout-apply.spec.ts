import { expect, test } from "@playwright/test";

for (const count of [2, 600, 4000, 5000]) test(`both Layout Apply buttons restore ${count} saved boxes with exact geometry and undo`, async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/index.html", { waitUntil: "domcontentloaded" });
  await page.locator("#emptyLoadSampleBtn").click();
  await expect(page.locator("#loading-overlay")).toBeHidden({ timeout: 45_000 });
  await expect.poll(() => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getRectCount())).toBe(207);
  await page.evaluate((count) => Reflect.get(window, "__easyLabelingTestApi").seedDetectionBoxesForTest(count), count);
  const geometry = () => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getRectGeometries().map(({ left, top, width, height }: { left: number; top: number; width: number; height: number }) => ({ left, top, width, height })));
  const before = await geometry();
  await page.locator("#taskAutomateBtn").click();
  await page.locator("#openLayoutSetupBtn").click();
  await page.locator("#newBoxLayoutBtn").click();
  await page.locator("#layoutCaptureScopeSelect").selectOption("all");
  await page.locator("#layoutNameInput").fill(`Exact ${count}`);
  await page.locator("#saveBoxLayoutBtn").click();
  await expect(page.locator("#layoutDetails")).toContainText(`${count} boxes`);
  await expect(page.locator("#applyBoxLayoutFromSetupBtn")).toBeEnabled();
  if (count >= 4000) {
    const downloadPromise = page.waitForEvent("download");
    await page.locator("#exportAutomationLibraryBtn").click();
    const downloadedPath = await (await downloadPromise).path();
    if (!downloadedPath) throw new Error("Exported layout path is unavailable");
    page.once("dialog", (dialog) => dialog.accept());
    await page.locator("#deleteBoxLayoutBtn").click();
    await expect(page.locator("#layoutSetupSelect option", { hasText: `Exact ${count}` })).toHaveCount(0);
    await page.locator("#importAutomationLibraryInput").setInputFiles(downloadedPath);
    await expect(page.locator("#layoutSetupSelect option:checked")).toHaveText(`Exact ${count}`);
    await expect(page.locator("#layoutDetails")).toContainText(`${count} boxes`);
  }
  const timings: Array<{ entry: string; applyMs: number; undoMs: number }> = [];
  for (const entry of ["popup", "main"]) {
    if (entry === "main") {
      await page.locator("#taskAutomateBtn").click();
    }
    const button = entry === "popup" ? "#applyBoxLayoutFromSetupBtn" : "#applyBoxLayoutBtn";
    await page.locator(button).evaluate((element) => element.addEventListener("click", () => {
      Reflect.set(window, "layoutApplyStartedAt", performance.now());
    }, { once: true, capture: true }));
    await page.locator(button).click();
    await expect.poll(() => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getRectCount()), { timeout: 60_000 }).toBe(count * 2);
    await expect(page.locator("#layoutPlacementNotice")).toHaveAttribute("data-state", "applied", { timeout: 60_000 });
    await expect(page.locator(button)).toBeEnabled();
    const applyMs = await page.evaluate(async () => {
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      return performance.now() - Reflect.get(window, "layoutApplyStartedAt");
    });
    expect(await page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getSelectedRectIds().length)).toBe(count);
    const applied = (await geometry()).slice(count);
    for (const [index, box] of applied.entries()) {
      for (const key of ["left", "top", "width", "height"] as const) {
        expect(box[key], `${entry} box ${index} ${key}`).toBeCloseTo(before[index]![key], 6);
      }
    }
    if (entry === "popup") await page.locator("#layoutSetupModal .modal-footer").getByRole("button", { name: "Close", exact: true }).click();
    if (count === 5000 && entry === "main") {
      await page.screenshot({ path: "output/layout-bulk-5000-applied.png" });
    }
    await page.locator('[data-ui="history-undo"]').evaluate((element) => element.addEventListener("click", () => {
      Reflect.set(window, "layoutUndoStartedAt", performance.now());
    }, { once: true, capture: true }));
    await page.locator('[data-ui="history-undo"]').click();
    await expect.poll(geometry, { timeout: 60_000 }).toEqual(before);
    const undoMs = await page.evaluate(async () => {
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      return performance.now() - Reflect.get(window, "layoutUndoStartedAt");
    });
    timings.push({ entry, applyMs: Math.round(applyMs), undoMs: Math.round(undoMs) });
  }
  expect(errors).toEqual([]);
  console.log(JSON.stringify({ count, timings, pageErrors: errors }));
  await testInfo.attach("layout-timings", { body: JSON.stringify({ count, timings, pageErrors: errors }, null, 2), contentType: "application/json" });
});
