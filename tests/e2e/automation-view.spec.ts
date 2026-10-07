import { expect, test } from "@playwright/test";

test("Ctrl+Q switches tools from automation selects without intercepting text or popup input", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/index.html", { waitUntil: "domcontentloaded" });
  await page.locator("#emptyLoadSampleBtn").click();
  await expect(page.locator("#loading-overlay")).toBeHidden({ timeout: 45_000 });
  await expect.poll(() => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getRectCount())).toBe(207);
  await page.locator("#taskAutomateBtn").click();
  await expect(page.locator("#automationPresetSelect")).toBeFocused();
  await expect(page.locator("#editMode")).toBeChecked();
  await page.keyboard.press("Control+q");
  await expect(page.locator("#drawMode")).toBeChecked();
  await expect(page.locator("#inspectorAnnotationPane")).toHaveClass(/active/);
  await page.locator("#taskAutomateBtn").click();
  await page.locator("#boxLayoutSelect").focus();
  await page.keyboard.press("Control+q");
  await expect(page.locator("#editMode")).toBeChecked();
  await page.locator("#taskAutomateBtn").click();
  await expect(page.locator("#openLayoutSetupBtn")).toHaveText("Layout setup");
  const buttons = await page.locator(".layout-panel-section button").allTextContents();
  expect(buttons.map((text) => text.trim())).toEqual(["Layout setup", "Apply layout"]);
  await page.screenshot({ path: "output/layout-setup-button.png" });
  await page.locator("#openLayoutSetupBtn").click();
  await expect(page.locator("#layoutSetupModal")).toBeVisible();
  await page.locator("#layoutNameInput").fill("layout");
  await page.keyboard.press("Control+q");
  await expect(page.locator("#editMode")).toBeChecked();
  await expect(page.locator("#layoutNameInput")).toHaveValue("layout");
  await page.locator("#layoutSetupModal select").first().focus();
  await page.keyboard.press("Control+q");
  await expect(page.locator("#editMode")).toBeChecked();
});

for (const workflow of ["detection", "segmentation"] as const) test(`YOLOE gives the image most of the popup in ${workflow} and both themes`, async ({ page }) => {
  test.setTimeout(90_000);
  await page.route("http://127.0.0.1:8766/status", (route) => route.fulfill({ json: { version: 5, cuda: false, gpu: null, models: ["yoloe-26n-seg"] } }));
  await page.goto("/index.html?yoloe=python", { waitUntil: "domcontentloaded" });
  await page.locator("#emptyLoadSampleBtn").click();
  await expect(page.locator("#loading-overlay")).toBeHidden({ timeout: 45_000 });
  await expect.poll(() => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getRectCount()), { timeout: 30_000 }).toBe(207);
  if (workflow === "segmentation") await page.locator('label[for="segmentationWorkflowTab"]').click();
  for (const theme of ["light", "dark"]) {
    if (theme === "dark") await page.locator('label[for="darkModeToggle"]').click();
    await page.locator("#taskYoloeBtn").click();
    await page.locator("#openYoloeSetupBtn").click();
    await expect(page.locator("#yoloePreviewCanvas")).toBeVisible();
    await page.locator("#closeYoloeSetupBtn").click({ trial: true });
    for (const size of [{ width: 1920, height: 1080 }, { width: 1280, height: 720 }]) {
      await page.setViewportSize(size);
      await page.locator("#yoloePromptShape").selectOption("brush");
      const dimensions = await page.locator("#yoloeSetupModal").evaluate((modal) => {
        const body = modal.querySelector(".yoloe-setup-body")!.getBoundingClientRect();
        const stage = modal.querySelector("#yoloeSampleStage")!.getBoundingClientRect();
        const popup = modal.querySelector(".modal-content")!.getBoundingClientRect();
        const canvas = modal.querySelector("#yoloePreviewCanvas")!.getBoundingClientRect();
        const footer = modal.querySelector(".modal-footer")!.getBoundingClientRect();
        return { width: stage.width, height: stage.height, ratio: stage.width * stage.height / (body.width * body.height), popupBottom: popup.bottom, footerBottom: footer.bottom, canvasWidth: canvas.width, canvasHeight: canvas.height, overflow: modal.querySelector(".modal-content")!.scrollWidth > popup.width };
      });
      expect(dimensions.width).toBeGreaterThan(size.width === 1920 ? 1350 : 880);
      expect(dimensions.height).toBeGreaterThan(size.height === 1080 ? 730 : 370);
      expect(dimensions.ratio).toBeGreaterThan(0.55);
      expect(Math.abs(dimensions.canvasWidth - dimensions.width)).toBeLessThan(2);
      expect(Math.abs(dimensions.canvasHeight - dimensions.height)).toBeLessThan(2);
      expect(dimensions.popupBottom).toBeLessThanOrEqual(size.height);
      expect(dimensions.footerBottom).toBeLessThanOrEqual(size.height);
      expect(dimensions.overflow).toBe(false);
      console.log(JSON.stringify({ workflow, theme, size, dimensions }));
      await page.screenshot({ path: `output/yoloe-view-${workflow}-${theme}-${size.width}.png` });
    }
    await page.locator("#closeYoloeSetupBtn").click();
    await expect(page.locator("#yoloeSetupModal")).toBeHidden();
  }
});
