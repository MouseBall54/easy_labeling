import { expect, test, type Locator } from "@playwright/test";

for (const workflow of ["detection", "segmentation"] as const) test(`image popup zoom reaches 3000% and preserves ${workflow} labels`, async ({ page }) => {
  test.setTimeout(90_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/index.html", { waitUntil: "domcontentloaded" });
  await page.locator("#emptyLoadSampleBtn").click();
  await expect(page.locator("#workspaceStandbyPanel")).toBeHidden({ timeout: 45_000 });
  await expect.poll(() => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getRectCount())).toBe(207);
  if (workflow === "segmentation") await page.locator('label[for="segmentationWorkflowTab"]').click();
  const labels = () => page.evaluate((workflow) => workflow === "detection"
    ? Reflect.get(window, "__easyLabelingTestApi").getRectGeometries()
    : Reflect.get(window, "__easyLabelingTestApi").getSegmentationMaskBounds(), workflow);
  const original = await labels();
  const wheel = async (locator: Locator, deltaY: number, control = true) => {
    const rect = (await locator.boundingBox())!;
    await page.mouse.move(rect.x + Math.min(rect.width / 2, 100), rect.y + Math.min(rect.height / 2, 100));
    if (control) await page.keyboard.down("Control");
    try { await page.mouse.wheel(0, deltaY); }
    finally { if (control) await page.keyboard.up("Control"); }
  };
  const zoomWithWheel = async (target: Locator, value: Locator, control = true) => {
    for (let step = 0; step < 60; step++) {
      const before = Number.parseInt((await value.textContent())!);
      if (before === 3000) return;
      await wheel(target, -120, control);
      await expect.poll(async () => Number.parseInt((await value.textContent())!)).toBeGreaterThan(before);
    }
    await expect(value).toHaveText("3000%");
  };
  if (workflow === "detection") {
    await page.locator("#taskAutomateBtn").click();
    await page.locator("#openLayoutSetupBtn").click();
    await expect(page.locator("#layoutPreviewCanvas")).toBeVisible();
    const layoutZoom = page.locator("#layoutPreviewZoomInput");
    await expect(layoutZoom).toHaveAttribute("max", "3000");
    await zoomWithWheel(page.locator("#layoutPreviewCanvas"), page.locator("#layoutPreviewZoomValue"));
    await expect(page.locator("#layoutPreviewZoomValue")).toHaveText("3000%");
    await wheel(page.locator("#layoutPreviewCanvas"), -100);
    await expect(layoutZoom).toHaveValue("3000");
    await wheel(page.locator("#layoutPreviewCanvas"), 100);
    await expect.poll(async () => Number(await layoutZoom.inputValue())).toBeLessThan(3000);
    await page.locator("#layoutSetupModal .modal-footer").getByRole("button", { name: "Close", exact: true }).click();
    await expect(page.locator("#layoutSetupModal")).toBeHidden();
    await page.locator("#openTemplateMatchingBtn").click();
    await expect(page.locator("#templateMatchingCanvas")).toBeVisible();
    const templateZoom = page.locator("#templateWorkspaceZoomInput");
    // The shown event applies Fit; wait for that initialization before changing zoom.
    await expect.poll(async () => Number(await templateZoom.inputValue())).toBeLessThan(100);
    await expect(templateZoom).toHaveAttribute("max", "3000");
    await zoomWithWheel(page.locator("#templateWorkspaceScroller"), page.locator("#templateWorkspaceZoomValue"), false);
    await expect(page.locator("#templateWorkspaceZoomValue")).toHaveText("3000%");
    const bitmap = await page.locator("#templateMatchingCanvas").evaluate((element) => {
      const canvas = element as HTMLCanvasElement;
      return { width: canvas.width, height: canvas.height, displayWidth: canvas.getBoundingClientRect().width,
        pixel: [...canvas.getContext("2d")!.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data] };
    });
    expect(Math.max(bitmap.width, bitmap.height)).toBeLessThanOrEqual(4096);
    expect(bitmap.displayWidth).toBeGreaterThan(30_000);
    expect(bitmap.pixel[3]).toBe(255);
    await wheel(page.locator("#templateWorkspaceScroller"), -100, false);
    await expect(templateZoom).toHaveValue("3000");
    await wheel(page.locator("#templateWorkspaceScroller"), 100, false);
    await expect.poll(async () => Number(await templateZoom.inputValue())).toBeLessThan(3000);
    await page.locator("#templateWorkspaceFitBtn").click();
    expect(Number(await templateZoom.inputValue())).toBeLessThan(100);
    await page.locator("#templateMatchingModal .modal-footer").getByRole("button", { name: "Close", exact: true }).click();
  }
  expect(await labels()).toEqual(original);
  expect(errors).toEqual([]);
});
