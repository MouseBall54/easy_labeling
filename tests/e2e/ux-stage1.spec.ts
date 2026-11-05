import { expect, test, type Page } from "@playwright/test";

async function loadSample(page: Page): Promise<void> {
  await page.goto("/index.html", { waitUntil: "domcontentloaded" });
  await expect.poll(() => page.evaluate(() => Boolean(Reflect.get(window, "__easyLabelingTestApi")))).toBe(true);
  await page.locator("#emptyLoadSampleBtn").click();
  await expect(page.locator("#loading-overlay")).toBeHidden({ timeout: 30_000 });
  await expect(page.locator("#workspaceStandbyPanel")).toBeHidden({ timeout: 30_000 });
  await expect.poll(() => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getRectCount())).toBe(207);
}

for (const workflow of ["detection", "segmentation"] as const) {
  test(`${workflow}: numeric/button zoom and the Original/Processed toggle preserve source labels`, async ({ page }) => {
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
    // The toolbar toggle left of the coordinates switches the canvas image both ways without touching the labels.
    const toggle = page.locator("#canvasViewToggleBtn");
    const viewSource = () => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getSegmentationViewSource());
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await expect(toggle).toHaveAttribute("title", /Showing Processed/);
    await expect.poll(viewSource).toBe("processed");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await expect.poll(viewSource).toBe("original");
    await expect.poll(() => page.evaluate((workflow) => {
      const api = Reflect.get(window, "__easyLabelingTestApi");
      return workflow === "detection" ? api.getRectCount() : api.getSegmentationMaskBounds();
    }, workflow)).toEqual(original);
    if (workflow === "detection") await expect(page.locator("#drawMode")).toBeChecked();
    else await expect(page.locator("#segmentationBrushModeBtn")).toHaveClass(/active/);
    expect(errors).toEqual([]);
  });
}
