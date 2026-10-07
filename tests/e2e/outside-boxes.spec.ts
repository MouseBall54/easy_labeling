import { _electron, expect, test } from "@playwright/test";
import { copyFile, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

test("Save and Auto save preserve outside boxes; explicit cleanup covers all images in only the active folder with backups", async () => {
  test.setTimeout(120_000);
  const dataset = await mkdtemp(path.join(os.tmpdir(), "easy-labeling-outside-"));
  const root = path.resolve(".");
  const source = path.join(dataset, "label");
  const comparison = path.join(dataset, "comparison");
  const original = "0 0.5 0.5 0.2 0.2\n1 -0.1 0.5 0.1 0.1\n2 0.98 0.5 0.1 0.1\n";
  const allOutside = "3 0.5 1.1 0.1 0.1\n";
  await mkdir(source); await mkdir(comparison);
  for (const [index, name] of ["image.jpg", "second.jpg", "third.jpg"].entries()) {
    await copyFile(path.join(root, `assets/sample/sample_${index + 1}.jpg`), path.join(dataset, name));
    await writeFile(path.join(source, name.replace(".jpg", ".txt")), original);
  }
  await writeFile(path.join(comparison, "image.txt"), original);
  await writeFile(path.join(comparison, "second.txt"), allOutside);
  const electron = await _electron.launch({ args: [path.join(root, "tests/e2e/fixtures/inference-electron.cjs")],
    env: { ...process.env, INFERENCE_TEST_ROOT: root, INFERENCE_TEST_DATASET: dataset, INFERENCE_TEST_PICKER_FOLDERS: JSON.stringify([dataset, comparison]) } });
  try {
    const page = await electron.firstWindow();
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.locator("#selectImageFolderBtn").click();
    const count = () => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getRectCount());
    await expect.poll(count).toBe(3);
    await expect(page.locator("#activeOperationPanel")).toBeHidden();
    await page.locator("#saveLabelsBtn").click();
    await expect(page.locator("#headerDocumentStatus")).toHaveAttribute("data-state", "saved");
    expect(await count()).toBe(3);
    expect((await readFile(path.join(source, "image.txt"), "utf8")).trim().split("\n")).toHaveLength(3);
    const savedSource = await readFile(path.join(source, "image.txt"), "utf8");
    await page.locator("#selectLabelFolderBtn").click();
    await expect(page.locator("#labelSourceTabs")).toHaveAttribute("data-active-index", "1");
    await expect(page.locator("#activeOperationPanel")).toBeHidden();
    await page.locator("#autoSaveToggle").check();
    await page.locator('label[for="editMode"]').click();
    await page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").selectRectsByIndex([0]));
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#headerDocumentStatus")).toHaveAttribute("data-state", "dirty");
    // Auto save runs when moving to another image.
    await page.keyboard.press("d");
    await expect(page.locator("#current-image-name")).toHaveText("second.jpg");
    await expect.poll(count).toBe(1);
    await expect(page.locator("#activeOperationPanel")).toBeHidden();
    await page.keyboard.press("a");
    await expect(page.locator("#current-image-name")).toHaveText("image.jpg");
    await expect.poll(count).toBe(3);
    await expect(page.locator("#activeOperationPanel")).toBeHidden();
    const secondBeforeCleanup = await readFile(path.join(comparison, "second.txt"), "utf8");
    expect(secondBeforeCleanup.trim().split("\n")).toHaveLength(1);
    const beforeCleanup = await readFile(path.join(comparison, "image.txt"), "utf8");
    expect(beforeCleanup).not.toBe(original);
    expect(beforeCleanup.trim().split("\n")).toHaveLength(3);
    const cleanup = page.locator("#removeOutsideBoxesBtn");
    for (const theme of ["light", "dark"]) {
      if (await page.locator("#darkModeToggle").isChecked() !== (theme === "dark")) await page.locator('label[for="darkModeToggle"]').click();
      for (const width of [1280, 900]) {
        await page.setViewportSize({ width, height: 720 });
        const save = (await page.locator("#saveLabelsBtn").boundingBox())!;
        const clean = (await cleanup.boundingBox())!;
        const panel = (await page.locator(".dataset-save-bar").boundingBox())!;
        expect(clean.y).toBeGreaterThanOrEqual(save.y + save.height);
        expect(clean.x).toBeGreaterThanOrEqual(panel.x);
        expect(clean.x + clean.width).toBeLessThanOrEqual(panel.x + panel.width);
        expect(clean.y + clean.height).toBeLessThanOrEqual(720);
        await page.screenshot({ path: `output/outside-boxes-${theme}-${width}.png` });
      }
    }
    await page.setViewportSize({ width: 1280, height: 720 });
    page.once("dialog", async (dialog) => { expect(dialog.message()).toContain("all 3 images"); await dialog.dismiss(); });
    await cleanup.click();
    expect(await readFile(path.join(comparison, "image.txt"), "utf8")).toBe(beforeCleanup);
    expect(await readFile(path.join(comparison, "second.txt"), "utf8")).toBe(secondBeforeCleanup);
    const view = await page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getCanvasViewportTransform());
    page.once("dialog", (dialog) => dialog.accept());
    await cleanup.click();
    await expect.poll(count).toBe(1);
    await expect(page.locator("#activeOperationPanel")).toBeHidden();
    expect((await readFile(path.join(comparison, "image.txt"), "utf8")).trim().split("\n")).toHaveLength(1);
    expect(await readFile(path.join(comparison, "second.txt"), "utf8")).toBe("");
    expect(await readdir(comparison)).not.toContain("third.txt");
    const backupName = (await readdir(path.join(comparison, ".easy-labeling"))).find((name) => name.startsWith("outside-boxes-"))!;
    expect(await readFile(path.join(comparison, ".easy-labeling", backupName, "image.txt"), "utf8")).toBe(beforeCleanup);
    expect(await readFile(path.join(comparison, ".easy-labeling", backupName, "second.txt"), "utf8")).toBe(secondBeforeCleanup);
    expect(await readFile(path.join(source, "image.txt"), "utf8")).toBe(savedSource);
    expect(await readFile(path.join(source, "second.txt"), "utf8")).toBe(original);
    expect(await page.locator("#current-image-name").textContent()).toBe("image.jpg");
    expect(await page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getCanvasViewportTransform())).toEqual(view);
    await page.locator('label[for="segmentationWorkflowTab"]').click();
    await expect(page.locator("#outsideBoxesActions")).toBeHidden();
    expect(errors).toEqual([]);
  } finally {
    await electron.close();
    expect(path.dirname(dataset)).toBe(path.resolve(os.tmpdir()));
    expect(path.basename(dataset)).toMatch(/^easy-labeling-outside-/);
    await rm(dataset, { recursive: true, force: true });
  }
});
