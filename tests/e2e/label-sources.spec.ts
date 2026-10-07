import { _electron, expect, test } from "@playwright/test";
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

for (const workflow of ["detection", "segmentation"] as const) test(`label folders: ${workflow} registration, shortcuts, safe comparison and native folder identity`, async () => {
  test.setTimeout(120_000);
  const dataset = await mkdtemp(path.join(os.tmpdir(), "easy-labeling-sources-"));
  const root = path.resolve(".");
  const label = path.join(dataset, "label");
  const folders = Array.from({ length: workflow === "detection" ? 9 : 2 }, (_, index) => path.join(dataset, `set-${index + 1}`, index % 2 ? "surface defects - confirmed labels with a long descriptive name" : "labels"));
  await mkdir(label);
  await copyFile(path.join(root, "assets/sample/sample_1.jpg"), path.join(dataset, "image.jpg"));
  const original = "0 0.25 0.25 0.1 0.1\n0 0.75 0.75 0.1 0.1";
  await writeFile(path.join(label, "image.txt"), original);
  for (const [index, folder] of folders.entries()) {
    await mkdir(folder, { recursive: true });
    await writeFile(path.join(folder, "image.txt"), Array.from({ length: index + 1 }, () => "0 0.5 0.5 0.1 0.1").join("\n"));
  }
  if (workflow === "segmentation") {
    await mkdir(path.join(dataset, "mask"));
    await copyFile(path.join(root, "assets/sample/mask/sample_1.png"), path.join(dataset, "mask/image.png"));
    await mkdir(path.join(folders[0], "mask"));
    await copyFile(path.join(root, "assets/sample/mask/sample_1.png"), path.join(folders[0], "mask/image.png"));
    await mkdir(path.join(folders[1], "mask"));
    await writeFile(path.join(folders[1], "mask/image.png"), "invalid PNG");
  }
  const electron = await _electron.launch({
    args: [path.join(root, "tests/e2e/fixtures/inference-electron.cjs")],
    env: { ...process.env, INFERENCE_TEST_ROOT: root, INFERENCE_TEST_DATASET: dataset,
      INFERENCE_TEST_PICKER_FOLDERS: JSON.stringify([dataset, ...folders, folders[0]]) }
  });
  try {
    const page = await electron.firstWindow();
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.locator("#selectImageFolderBtn").click();
    const count = () => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getRectCount());
    const viewport = () => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getCanvasViewportTransform());
    await expect.poll(count).toBe(2);
    await expect(page.locator("#activeOperationPanel")).toBeHidden();
    if (workflow === "segmentation") await page.locator('label[for="segmentationWorkflowTab"]').click();
    const sources = page.locator("#labelSourceTabs");
    await expect(sources).toHaveAttribute("data-active-index", "0");
    await expect(page.locator(".app-navbar #labelSourceTabs")).toBeVisible();
    await page.locator("#zoom-input").fill("130");
    await page.locator("#zoom-input").press("Enter");
    // A translated, enlarged view must survive every label switch.
    await page.locator("#coordX").fill("300");
    await page.locator("#coordY").fill("200");
    await page.locator("#goToCoordsBtn").click();
    const view = await viewport();
    const headerLayout = () => page.locator(".app-navbar").evaluate((bar) => [".app-navbar-workflow", ".image-navigation", "#info-display"].map((selector) => {
      const bounds = bar.querySelector(selector)!.getBoundingClientRect();
      return { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height };
    }));
    const initialHeaderLayout = await headerLayout();
    for (const [index] of folders.entries()) {
      await page.locator("#selectLabelFolderBtn").click();
      if (workflow === "segmentation" && index === 1) {
        await expect(page.locator(".toast-message").last()).toBeVisible();
        await expect(page.locator("#activeOperationPanel")).toBeHidden();
        await expect(sources.locator(".label-source-tab")).toHaveCount(2);
        await expect(sources).toHaveAttribute("data-active-index", "1");
      } else {
        await expect(sources).toHaveAttribute("data-active-index", String(index + 1));
        await expect(sources.locator(".label-source-tab")).toHaveCount(index + 2);
        if (workflow === "detection") await expect.poll(count).toBe(index + 1);
      }
      await expect(page.locator("#selectLabelFolderBtn")).toBeEnabled();
      expect(await viewport()).toEqual(view);
      await expect(page.locator("#current-image-name")).toHaveText("image.jpg");
    }
    await page.locator("#selectLabelFolderBtn").click();
    await expect(sources).toHaveAttribute("data-active-index", "1");
    await expect(page.locator("#activeOperationPanel")).toBeHidden();
    await expect(sources.locator(".label-source-tab")).toHaveCount(workflow === "detection" ? 10 : 2);
    expect(await headerLayout()).toEqual(initialHeaderLayout);
    await expect(sources.locator("input:checked")).toHaveCount(1);
    await expect(sources.locator('[data-source-index="1"]')).toHaveAttribute("title", /Ctrl\+2/);
    if (workflow === "detection") {
      await expect(sources.locator('[data-source-index="8"]')).toHaveAttribute("title", /Ctrl\+9/);
      await expect(sources.locator('[data-source-index="9"]')).not.toHaveAttribute("title", /Ctrl\+/);
      await page.locator("#autoSaveToggle").uncheck();
      await page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").seedDetectionBoxesForTest(3));
      await sources.locator("input:checked").focus();
      await page.keyboard.press("Control+1");
      await expect(sources).toHaveAttribute("data-active-index", "0");
      await expect.poll(count).toBe(2);
      expect((await readFile(path.join(folders[0], "image.txt"), "utf8")).trim().split("\n")).toHaveLength(3);
      expect(await readFile(path.join(label, "image.txt"), "utf8")).toBe(original);
      await page.keyboard.press("Control+2");
      await expect.poll(count).toBe(3);
      await expect(sources).toHaveAttribute("data-active-index", "1");
      await page.keyboard.press("Control+9");
      await expect(sources).toHaveAttribute("data-active-index", "8");
      await expect.poll(count).toBe(8);
      await sources.locator('[data-source-index="9"]').click();
      await expect.poll(count).toBe(9);
      // Rapid key presses serialize through the same filesystem queue.
      await page.keyboard.press("Control+1");
      await page.keyboard.press("Control+2");
      await expect(sources).toHaveAttribute("data-active-index", "1");
      await expect.poll(count).toBe(3);
      await sources.locator("input:checked").focus();
      await page.keyboard.press("ArrowRight");
      await expect(sources).toHaveAttribute("data-active-index", "2");
      await expect.poll(count).toBe(2);
      await page.keyboard.press("ArrowLeft");
      await expect(sources).toHaveAttribute("data-active-index", "1");
      await expect.poll(count).toBe(3);
      await page.locator("#imageSearchInput").focus();
      await page.keyboard.press("Control+1");
      await expect(sources).toHaveAttribute("data-active-index", "1");
      await page.locator("#taskAutomateBtn").click();
      await page.locator("#openLayoutSetupBtn").click();
      await expect(page.locator("#layoutSetupModal")).toBeVisible();
      await page.locator("#layoutSetupModal select").first().focus();
      await page.keyboard.press("Control+1");
      await expect(sources).toHaveAttribute("data-active-index", "1");
      await page.locator("#layoutSetupModal .btn-close").click();
    } else {
      const mask = () => page.evaluate(() => {
        const api = Reflect.get(window, "__easyLabelingTestApi");
        return { bounds: api.getSegmentationMaskBounds(), classes: api.getSegmentationSummary().allClassIds,
          pixels: [[100, 100], [300, 200], [500, 300], [700, 400]].map(([x, y]) => api.getSegmentationClassAtPoint(x, y)) };
      });
      const before = await mask();
      expect(before.bounds).not.toBeNull();
      await sources.locator("input:checked").focus();
      await page.keyboard.press("Control+1");
      await expect(sources).toHaveAttribute("data-active-index", "0");
      await expect(page.locator("#activeOperationPanel")).toBeHidden();
      expect(await mask()).toEqual(before);
      await page.keyboard.press("Control+2");
      await expect(sources).toHaveAttribute("data-active-index", "1");
      await expect(page.locator("#activeOperationPanel")).toBeHidden();
      expect(await mask()).toEqual(before);
      expect(await readFile(path.join(dataset, "mask/image.png"))).toEqual(await readFile(path.join(folders[0], "mask/image.png")));
      await page.locator("#autoSaveToggle").uncheck();
      const tool = before.pixels[1] === null ? "#segmentationBrushModeBtn" : "#segmentationEraseModeBtn";
      await page.locator(tool).click();
      await expect(page.locator("#activeOperationPanel")).toBeHidden();
      const canvas = (await page.locator(".upper-canvas").boundingBox())!;
      const drawView = await viewport();
      const point = { x: canvas.x + 300 * drawView[0] + drawView[4], y: canvas.y + 200 * drawView[3] + drawView[5] };
      await page.mouse.move(point.x, point.y);
      await page.mouse.down();
      await page.mouse.move(point.x + 3, point.y, { steps: 3 });
      await page.mouse.up();
      await expect(page.locator("#headerDocumentStatus")).toHaveAttribute("data-state", "dirty");
      const edited = await mask();
      expect(edited.pixels).not.toEqual(before.pixels);
      await sources.locator("input:checked").focus();
      await page.keyboard.press("Control+1");
      await expect(sources).toHaveAttribute("data-active-index", "0");
      await expect(page.locator("#activeOperationPanel")).toBeHidden();
      expect(await mask()).toEqual(before);
      expect(await readFile(path.join(dataset, "mask/image.png"))).not.toEqual(await readFile(path.join(folders[0], "mask/image.png")));
      await page.keyboard.press("Control+2");
      await expect(sources).toHaveAttribute("data-active-index", "1");
      await expect(page.locator("#activeOperationPanel")).toBeHidden();
      expect(await mask()).toEqual(edited);
    }
    expect(await viewport()).toEqual(view);
    for (const theme of ["light", "dark"]) {
      if (await page.locator("#darkModeToggle").isChecked() !== (theme === "dark")) {
        await page.locator('label[for="darkModeToggle"]').click();
      }
      await expect(page.locator("#darkModeToggle")).toBeChecked({ checked: theme === "dark" });
      await expect(page.locator("#selectLabelFolderBtn")).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      for (const size of [{ width: 1920, height: 1080 }, { width: 1280, height: 720 }, { width: 900, height: 720 }, { width: 640, height: 480 }]) {
        await page.setViewportSize(size);
        for (const selector of ["#labelSourceTabs", "#selectLabelFolderBtn", "#resetZoomBtn"]) {
          await expect(page.locator(selector)).toBeVisible();
          const bounds = (await page.locator(selector).boundingBox())!;
          expect(bounds.x).toBeGreaterThanOrEqual(0);
          expect(bounds.x + bounds.width).toBeLessThanOrEqual(size.width);
        }
        const activeTab = await sources.evaluate((tabs) => {
          const bounds = tabs.getBoundingClientRect();
          const active = tabs.querySelector("input:checked + label")!.getBoundingClientRect();
          return { left: active.left - bounds.left, right: bounds.right - active.right,
            scrollbar: tabs.scrollWidth > tabs.clientWidth };
        });
        expect(activeTab.left).toBeGreaterThanOrEqual(-1);
        expect(activeTab.right).toBeGreaterThanOrEqual(-1);
        await page.screenshot({ path: `output/label-tabs-${workflow}-${theme}-${size.width}.png` });
      }
    }
    expect(errors).toEqual([]);
  } finally {
    await electron.close();
    expect(path.dirname(dataset)).toBe(path.resolve(os.tmpdir()));
    expect(path.basename(dataset)).toMatch(/^easy-labeling-sources-/);
    await rm(dataset, { recursive: true, force: true });
  }
});
