import { expect, test, type Locator } from "@playwright/test";

async function changeColor(input: Locator, color: string): Promise<void> {
  await expect(input).toHaveAttribute("type", "color");
  await input.focus();
  await input.evaluate((element, value) => {
    (element as HTMLInputElement).value = value;
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }, color);
}

test("class colors persist per file and repaint both workflows without changing labels", async ({ page }) => {
  test.setTimeout(120_000);
  await page.addInitScript(() => {
    class FileHandle {
      kind = "file";
      constructor(public name: string) {}
      async getFile() { return new File([localStorage.getItem(this.name) ?? ""], this.name); }
      async createWritable() {
        if (localStorage.getItem("fail-color-save")) throw new Error("Color write denied");
        let pending = "";
        return {
          write: async (data: string) => { pending = data; },
          close: async () => { localStorage.setItem(this.name, pending); }
        };
      }
    }
    const files = ["colors.yaml", "other.yaml"].map((name) => {
      if (!localStorage.getItem(name)) {
        localStorage.setItem(name, Array.from({ length: 13 }, (_, id) => `${id}: class ${id}`).join("\n"));
      }
      return new FileHandle(name);
    });
    Object.defineProperty(window, "getEasyLabelingProfileDirectory", {
      configurable: true,
      value: async () => ({
        kind: "directory", name: "Class Info",
        async *values() { yield* files; },
        async getFileHandle(name: string) { return files.find((file) => file.name === name); }
      })
    });
  });
  await page.goto("/index.html", { waitUntil: "domcontentloaded" });
  await expect.poll(() => page.evaluate(() => Boolean(Reflect.get(window, "__easyLabelingTestApi")))).toBe(true);
  await expect(page.locator("#class-file-select")).toHaveValue("colors.yaml");
  await page.locator("#emptyLoadSampleBtn").click();
  await expect(page.locator("#loading-overlay")).toBeHidden({ timeout: 45_000 });
  await expect.poll(() => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getRectCount())).toBe(207);
  const geometry = await page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getRectGeometries());
  const detectionColor = page.locator('#label-filters [data-ui="class-color"]').first();
  const classId = (await detectionColor.getAttribute("data-class-id"))!;
  const originalColor = await detectionColor.inputValue();
  await changeColor(detectionColor, "#123456");
  await expect(detectionColor).toHaveValue("#123456");
  await expect.poll(() => page.evaluate((id) => localStorage.getItem("colors.yaml"), classId)).toContain(`# easy-labeling-color ${classId}: #123456`);
  await expect(detectionColor).toBeFocused();
  expect(await page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getRectGeometries())).toEqual(geometry);
  expect(await page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getVisibleRectCount())).toBe(207);
  await page.locator("#classSearchInput").fill(`${classId}:`);
  await expect(page.locator("#label-filters .class-filter-entry:visible .class-color-input")).toHaveCount(1);
  await page.locator("#classSearchInput").fill("");
  await page.locator("#addClassShortcutBtn").click();
  const editorColor = page.locator(`#classFileEditorBody .class-color-input[data-class-id="${classId}"]`);
  await expect(editorColor).toHaveValue("#123456");
  await changeColor(editorColor, "#abcdef");
  await page.locator("#classFileViewerModal .modal-header .btn-close").click();
  await expect(detectionColor).toHaveValue("#123456");
  await page.locator("#addClassShortcutBtn").click();
  await expect(editorColor).toHaveValue("#123456");
  await changeColor(editorColor, "#abcdef");
  await page.locator("#saveClassFileBtn").click();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("colors.yaml"))).toContain(`# easy-labeling-color ${classId}: #abcdef`);
  await expect(page.locator(".toast-message")).toHaveCount(0);
  await page.screenshot({ path: "output/class-colors-editor-light.png" });
  await page.locator("#classFileViewerModal .modal-header .btn-close").click();
  await expect(detectionColor).toHaveValue("#abcdef");
  await page.locator("#class-file-select").selectOption("other.yaml");
  await expect(detectionColor).toHaveValue(originalColor);
  await page.locator("#class-file-select").selectOption("colors.yaml");
  await expect(detectionColor).toHaveValue("#abcdef");

  await page.evaluate(() => localStorage.setItem("fail-color-save", "1"));
  await changeColor(detectionColor, "#ffffff");
  await expect(page.locator(".toast-message").last()).toContainText("Color write denied");
  await expect(detectionColor).toHaveValue("#abcdef");
  await page.evaluate(() => localStorage.removeItem("fail-color-save"));
  await page.locator('label[for="darkModeToggle"]').click();
  await expect(page.locator(".toast-message")).toHaveCount(0);
  await page.screenshot({ path: "output/class-colors-detection-dark.png" });
  await page.locator('label[for="segmentationWorkflowTab"]').click();
  // The edge glow intentionally whitens boundary pixels; check the class fill.
  await page.locator("#segmentationEdgeHighlightToggle").evaluate((element) => {
    (element as HTMLInputElement).checked = false;
    element.dispatchEvent(new Event("change", { bubbles: true }));
  });
  const mask = await page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi");
    const bounds = api.getSegmentationMaskBounds();
    for (let y = bounds.top; y < bounds.top + bounds.height; y++) {
      for (let x = bounds.left; x < bounds.left + bounds.width; x++) {
        const id = api.getSegmentationClassAtPoint(x, y);
        if (id && id !== "0") return { x, y, id: String(id), bounds, summary: api.getSegmentationSummary() };
      }
    }
    throw new Error("No labeled mask pixel");
  });
  const maskColor = page.locator(`#segmentationPaintClassList [data-ui="class-color"][data-class-id="${mask.id}"]`);
  await changeColor(maskColor, "#fedcba");
  await expect.poll(() => page.evaluate(({ x, y }) => {
    const rgb = Reflect.get(window, "__easyLabelingTestApi").getSegmentationOverlayPixel(x, y)?.slice(0, 3);
    return rgb && rgb.every((value: number, index: number) => Math.abs(value - [254, 220, 186][index]!) <= 1);
  }, mask)).toBe(true);
  await expect(maskColor).toBeFocused();
  expect(await page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getSegmentationMaskBounds())).toEqual(mask.bounds);
  expect(await page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getSegmentationSummary())).toEqual(mask.summary);
  expect(await page.evaluate(({ x, y }) => String(Reflect.get(window, "__easyLabelingTestApi").getSegmentationClassAtPoint(x, y)), mask)).toBe(mask.id);
  await expect(page.locator(".toast-message")).toHaveCount(0);
  await page.screenshot({ path: "output/class-colors-segmentation-dark.png" });
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("#class-file-select")).toHaveValue("colors.yaml");
  await page.locator("#addClassShortcutBtn").click();
  await expect(page.locator(`#classFileEditorBody .class-color-input[data-class-id="${mask.id}"]`)).toHaveValue("#fedcba");
});
