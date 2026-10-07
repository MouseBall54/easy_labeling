import { _electron, expect, test } from "@playwright/test";
import { copyFile, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

for (const count of [6, 5000]) test(`class ID offset and remapping preserve ${count} boxes, Undo, file data and inactive folders`, async () => {
  test.setTimeout(180_000);
  const root = path.resolve(".");
  const dataset = await mkdtemp(path.join(os.tmpdir(), "easy-labeling-class-remap-"));
  const labels = path.join(dataset, "label");
  const comparison = path.join(dataset, "comparison");
  await mkdir(labels); await mkdir(comparison);
  for (const name of ["a", "b", "c", "d"]) await copyFile(path.join(root, "assets/sample/sample_1.jpg"), path.join(dataset, `${name}.jpg`));
  const original = Array.from({ length: count }, (_, i) => `${i % 3} ${i === 0 ? -.1 : i === 1 ? 1.1 : (i % 100 + .5) / 100} ${(Math.floor(i / 100) + .5) / 50} 0.005 0.01`).join("\n") + "\n";
  const second = "1\t0.50 0.50 0.10 0.10\r\n2 1.1 0.5 0.1 0.1\r\n";
  const classes = 'names:\n  0: Zero\n  1: One\n  2: Two\n# easy-labeling-color 0: #ff1122\n# easy-labeling-color 1: #22aa44\n# easy-labeling-color 2: #3344ff\n';
  await writeFile(path.join(labels, "a.txt"), original);
  await writeFile(path.join(comparison, "a.txt"), original);
  await writeFile(path.join(labels, "b.txt"), second);
  await writeFile(path.join(labels, "d.txt"), "");
  await writeFile(path.join(labels, "orphan.txt"), original);
  await writeFile(path.join(labels, "classes.yaml"), classes);
  const classProfile = path.join(dataset, "profiles", "class-info");
  await mkdir(classProfile, { recursive: true });
  await writeFile(path.join(classProfile, "classes.yaml"), classes);
  const electron = await _electron.launch({ args: [path.join(root, "tests/e2e/fixtures/inference-electron.cjs")],
    env: { ...process.env, INFERENCE_TEST_ROOT: root, INFERENCE_TEST_DATASET: dataset, INFERENCE_TEST_PICKER_FOLDERS: JSON.stringify([dataset, comparison]), INFERENCE_TEST_OFFSCREEN: "1" } });
  try {
    const page = await electron.firstWindow();
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.waitForFunction(() => Boolean(Reflect.get(window, "__easyLabelingTestApi")));
    await page.locator("#selectImageFolderBtn").click();
    const boxCount = () => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getRectCount());
    const keys = () => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getVisibleClassKeys());
    const geometry = () => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getRectGeometries().sort((a: { annotationId: string }, b: { annotationId: string }) => a.annotationId.localeCompare(b.annotationId)));
    await expect.poll(boxCount).toBe(count);
    await expect(page.locator("#activeOperationPanel")).toBeHidden();
    // A real Layout instance checks selection/group preservation alongside the 5,000-box path.
    let expectedCount = count;
    if (count === 6) {
      await page.locator("#taskAutomateBtn").click();
      await page.locator("#openLayoutSetupBtn").click();
      await page.locator("#newBoxLayoutBtn").click();
      await page.locator("#layoutCaptureScopeSelect").selectOption("all");
      await page.locator("#layoutNameInput").fill("Class remap Layout");
      await page.locator("#saveBoxLayoutBtn").click();
      await page.locator("#applyBoxLayoutFromSetupBtn").click();
      await expect.poll(boxCount).toBe(count * 2);
      expectedCount *= 2;
      await page.locator("#layoutSetupModal .modal-footer").getByRole("button", { name: "Close", exact: true }).click();
    }
    await page.locator("#saveLabelsBtn").click();
    await expect(page.locator("#headerDocumentStatus")).toHaveAttribute("data-state", "saved");
    const savedBefore = await readFile(path.join(labels, "a.txt"), "utf8");
    const geometryBefore = await geometry();
    const selected = await page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getSelectedRectIds());
    if (count === 6) await expect(page.locator("#toast-container .toast-message")).toHaveCount(0, { timeout: 15_000 });
    const open = page.locator(".classes-panel-section #openClassRemapBtn");
    const modal = page.locator("#classRemapModal");
    const preview = page.locator("#previewClassRemapBtn");
    const apply = page.locator("#applyClassRemapBtn");
    const mappingRows = page.locator("#classRemapRows tr");
    const setRow = async (index: number, from: string, to: string) => {
      await mappingRows.nth(index).locator('[data-remap="from"]').fill(from);
      await mappingRows.nth(index).locator('[data-remap="to"]').fill(to);
    };
    await open.click();
    await expect(page.locator("#classRemapMappingMode")).toBeChecked();
    await expect(page.locator("#classRemapMappingFields")).toBeVisible();
    await expect(modal.locator('.btn-group label').first()).toHaveText("Remap IDs");
    await expect(modal.locator('#classRemapMappingFields th')).toHaveText(["Original class", "New class", "Boxes", "Actions"]);
    await expect(mappingRows).toHaveCount(3);
    const classCounts = [0, 1, 2].map((id) => Array.from({ length: count }, (_, index) => index % 3).filter((value) => value === id).length * (count === 6 ? 2 : 1));
    for (const [index, id] of ["0", "1", "2"].entries()) {
      await expect(mappingRows.nth(index).locator('[data-remap="from"]')).toHaveValue(id);
      await expect(mappingRows.nth(index).locator('[data-remap="to"]')).toHaveValue(id);
      await expect(mappingRows.nth(index).locator('[data-remap="count"]')).toHaveText(classCounts[index]!.toLocaleString());
      await expect(mappingRows.nth(index).locator('.class-remap-name')).toHaveText([['Zero', 'One', 'Two'][index]!, ['Zero', 'One', 'Two'][index]!]);
      for (const swatch of await mappingRows.nth(index).locator('.class-remap-swatch').all()) {
        await expect(swatch).toHaveCSS('background-color', ['rgb(255, 17, 34)', 'rgb(34, 170, 68)', 'rgb(51, 68, 255)'][index]!);
      }
      await expect(mappingRows.nth(index).getByRole('button', { name: 'Remove mapping' })).toHaveText('Remove');
    }
    await preview.click();
    await expect(page.locator("#classRemapSummary")).toContainText("0 boxes will change");
    await expect(apply).toBeDisabled();
    await page.locator("#addClassRemapRowBtn").click();
    await expect(mappingRows.nth(3).locator('[data-remap="count"]')).toHaveText("0");
    await expect(mappingRows.nth(3).locator('.class-remap-name')).toHaveText(['Enter an ID', 'Enter an ID']);
    await mappingRows.nth(3).locator('[data-remap="from"]').fill("2");
    await expect(mappingRows.nth(3).locator('[data-remap="count"]')).toHaveText(classCounts[2]!.toLocaleString());
    await mappingRows.nth(3).getByRole("button", { name: "Remove mapping" }).click();
    await setRow(0, "0", "2");
    await expect(mappingRows.nth(0).locator('.class-remap-name')).toHaveText(['Zero', 'Two']);
    await expect(mappingRows.nth(0).locator('.class-remap-swatch').nth(1)).toHaveCSS('background-color', 'rgb(51, 68, 255)');
    await preview.click();
    await expect(page.locator('#classRemapPreviewRows tr').first().locator('.class-remap-name')).toHaveText(['Zero', 'Two']);
    if (count === 6) {
      for (const theme of ['light', 'dark']) {
        await page.evaluate((dark) => { const toggle = document.getElementById('darkModeToggle') as HTMLInputElement; toggle.checked = dark; toggle.dispatchEvent(new Event('change', { bubbles: true })); }, theme === 'dark');
        for (const width of [1280, 900, 480]) {
          await page.setViewportSize({ width, height: 900 });
          const body = modal.locator('.modal-body');
          expect(await body.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
          for (const control of [mappingRows.first().locator('[data-remap="to"]'), mappingRows.first().getByRole('button', { name: 'Remove mapping' })]) {
            const bounds = (await control.boundingBox())!;
            expect(bounds.x).toBeGreaterThanOrEqual(0);
            expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
          }
          await page.screenshot({ path: `output/class-remap-identity-${theme}-${width}.png` });
        }
      }
      await page.setViewportSize({ width: 1480, height: 940 });
    }
    await setRow(0, "0", "9");
    await expect(mappingRows.nth(0).locator('.class-remap-name')).toHaveText(['Zero', 'Unnamed class']);
    await preview.click(); await expect(apply).toBeEnabled(); await apply.click();
    await expect(modal).toBeHidden(); await expect.poll(keys).toEqual(["1", "2", "9"]);
    await page.locator('[data-ui="history-undo"]').click(); await expect.poll(keys).toEqual(["0", "1", "2"]);
    await open.click();
    await expect(mappingRows.nth(0).locator('[data-remap="to"]')).toHaveValue("0");
    await page.locator('label[for="classRemapOffsetMode"]').click();
    await page.locator("#classRemapOffset").fill("-1");
    await preview.click();
    await expect(page.locator("#classRemapError")).toBeVisible();
    await expect(apply).toBeDisabled();
    expect(await readFile(path.join(labels, "a.txt"), "utf8")).toBe(savedBefore);
    await page.locator("#classRemapOffset").fill("0.5");
    await preview.click();
    await expect(page.locator("#classRemapError")).toContainText("whole-number");
    await page.locator("#classRemapOffset").fill("3");
    await preview.click();
    await expect(page.locator("#classRemapSummary")).toContainText(`${expectedCount.toLocaleString()} boxes will change`);
    if (count === 6) {
      for (const theme of ["light", "dark"]) {
        await page.evaluate((dark) => { const toggle = document.getElementById("darkModeToggle") as HTMLInputElement; toggle.checked = dark; toggle.dispatchEvent(new Event("change", { bubbles: true })); }, theme === "dark");
        await expect(apply, `preview survives ${theme} theme`).toBeEnabled();
        for (const width of [1280, 900]) {
          await page.setViewportSize({ width, height: 720 });
          await expect(apply, `preview survives ${width}px resize`).toBeEnabled();
          const bounds = (await modal.locator(".modal-content").boundingBox())!;
          const action = (await apply.boundingBox())!;
          expect(bounds.x).toBeGreaterThanOrEqual(0);
          expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
          expect(action.y + action.height).toBeLessThanOrEqual(720);
          await page.screenshot({ path: `output/class-remap-${theme}-${width}.png` });
        }
      }
      const header = (await modal.locator(".modal-header").boundingBox())!;
      const before = (await modal.locator(".modal-content").boundingBox())!;
      await page.mouse.move(header.x + 80, header.y + 20); await page.mouse.down();
      await page.mouse.move(header.x + 104, header.y + 20); await page.mouse.up();
      expect((await modal.locator(".modal-content").boundingBox())!.x).toBeCloseTo(before.x + 24, 0);
      await expect(apply, "preview survives modal dragging").toBeEnabled();
      await modal.evaluate((element) => { element.focus(); });
      for (const key of ["Control+q", "Control+z", "Delete"]) {
        await page.keyboard.press(key);
        expect(await boxCount()).toBe(expectedCount);
        expect(await geometry()).toEqual(geometryBefore);
        expect(await keys()).toEqual(["0", "1", "2"]);
      }
      await expect(page.locator("#editMode")).toBeChecked();
      // Chromium can undo the last input edit even from modal chrome; re-preview the edited rule.
      await page.locator("#classRemapOffset").fill("3");
      await preview.click();
      await expect(apply).toBeEnabled();
    }
    await apply.click();
    await expect(modal).toBeHidden();
    expect(await geometry()).toEqual(geometryBefore);
    expect(await page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getSelectedRectIds())).toEqual(selected);
    await expect.poll(keys).toEqual(["3", "4", "5"]);
    await page.locator('[data-ui="history-undo"]').click();
    await expect.poll(keys).toEqual(["0", "1", "2"]);
    await page.locator('[data-ui="history-redo"]').click();
    await expect.poll(keys).toEqual(["3", "4", "5"]);
    await page.locator("#saveLabelsBtn").click();
    await expect(page.locator("#headerDocumentStatus")).toHaveAttribute("data-state", "saved");
    expect(await readFile(path.join(labels, "a.txt"), "utf8")).toBe(savedBefore.replace(/^\d+/gm, (id) => String(Number(id) + 3)));
    await page.locator("#selectLabelFolderBtn").click();
    await expect(page.locator("#labelSourceTabs")).toHaveAttribute("data-active-index", "1");
    await page.keyboard.press("Control+1");
    await expect(page.locator("#labelSourceTabs")).toHaveAttribute("data-active-index", "0");
    await expect(page.locator("#activeOperationPanel")).toBeHidden();
    const beforeFolder = await readFile(path.join(labels, "a.txt"), "utf8");
    const viewport = await page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getCanvasViewportTransform());
    await open.click();
    await page.locator("#classRemapScope").selectOption("folder");
    await page.locator('label[for="classRemapMappingMode"]').click();
    await expect(mappingRows).toHaveCount(3);
    await expect(mappingRows.locator('[data-remap="from"]')).toHaveCount(3);
    for (const [index, id] of ["3", "4", "5"].entries()) {
      await expect(mappingRows.nth(index).locator('[data-remap="from"]')).toHaveValue(id);
      await expect(mappingRows.nth(index).locator('[data-remap="to"]')).toHaveValue(id);
    }
    await setRow(0, "3", "5");
    await setRow(1, "3", "0");
    await setRow(2, "1", "0");
    await preview.click();
    await expect(page.locator("#classRemapError")).toContainText("more than one mapping");
    await setRow(1, "5", "3");
    await preview.click(); await expect(apply).toBeEnabled();
    page.once("dialog", (dialog) => dialog.dismiss()); await apply.click();
    expect(await readFile(path.join(labels, "a.txt"), "utf8")).toBe(beforeFolder);
    await writeFile(path.join(labels, "b.txt"), second + "\r\n");
    page.once("dialog", (dialog) => dialog.accept()); await apply.click();
    await expect(page.locator("#classRemapError")).toContainText("changed on disk since preview");
    expect(await readFile(path.join(labels, "a.txt"), "utf8")).toBe(beforeFolder);
    await writeFile(path.join(labels, "b.txt"), second);
    await preview.click(); await expect(apply).toBeEnabled();
    page.once("dialog", (dialog) => dialog.accept()); await apply.click();
    await expect(modal).toBeHidden();
    await expect.poll(boxCount).toBe(expectedCount);
    // Independent simultaneous mapping: avoid cascading replacements in the expected result.
    const expectedText = beforeFolder.replace(/^\d+/gm, (id) => id === "3" ? "5" : id === "5" ? "3" : id);
    expect(await readFile(path.join(labels, "a.txt"), "utf8")).toBe(expectedText);
    expect(await readFile(path.join(labels, "b.txt"), "utf8")).toBe(second.replace(/^1(?=\s)/gm, "0"));
    expect(await readFile(path.join(labels, "d.txt"), "utf8")).toBe("");
    expect(await readFile(path.join(labels, "orphan.txt"), "utf8")).toBe(original);
    expect(await readFile(path.join(comparison, "a.txt"), "utf8")).toBe(original);
    expect(await readFile(path.join(labels, "classes.yaml"), "utf8")).toBe(classes);
    await expect(page.locator('[data-ui="history-undo"]')).toBeDisabled();
    expect(await page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getCanvasViewportTransform())).toEqual(viewport);
    const backups = (await readdir(path.join(labels, ".easy-labeling"))).filter((name) => name.startsWith("class-remap-"));
    expect(backups).toHaveLength(1);
    expect(await readFile(path.join(labels, ".easy-labeling", backups[0]!, "a.txt"), "utf8")).toBe(beforeFolder);
    expect(await readFile(path.join(labels, ".easy-labeling", backups[0]!, "b.txt"), "utf8")).toBe(second);
    await page.locator("#image-list").getByText("c.jpg", { exact: true }).click();
    await expect(page.locator("#current-image-name")).toHaveText("c.jpg");
    await expect.poll(boxCount).toBe(0);
    await open.click();
    await expect(page.locator("#classRemapMappingMode")).toBeChecked();
    await expect(mappingRows).toHaveCount(0);
    await modal.getByRole("button", { name: "Close", exact: true }).last().click();
    await expect(modal).toBeHidden();
    await page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").seedDetectionBoxesForTest(6));
    await open.click();
    await page.locator('label[for="classRemapOffsetMode"]').click();
    await page.locator("#classRemapOffset").fill("1");
    await preview.click(); await expect(apply).toBeEnabled();
    page.once("dialog", (dialog) => dialog.accept()); await apply.click();
    await expect(modal).toBeHidden(); await expect.poll(boxCount).toBe(6);
    expect((await readFile(path.join(labels, "c.txt"), "utf8")).trim().split("\n")).toHaveLength(6);
    const newBackup = (await readdir(path.join(labels, ".easy-labeling"))).find((name) => name.startsWith("class-remap-") && name !== backups[0])!;
    expect(JSON.parse(await readFile(path.join(labels, ".easy-labeling", newBackup, "created-labels.json"), "utf8"))).toEqual(["c.txt"]);
    const increased = await keys();
    await open.click();
    await page.locator("#classRemapScope").selectOption("current");
    await page.locator('label[for="classRemapOffsetMode"]').click();
    await page.locator("#classRemapOffset").fill("-1");
    await preview.click(); await expect(apply).toBeEnabled(); await apply.click();
    await expect(modal).toBeHidden();
    await expect.poll(keys).toEqual(increased.map((id: string) => String(Number(id) - 1)));
    await page.locator('[data-ui="history-undo"]').click(); await expect.poll(keys).toEqual(increased);
    await page.locator('label[for="segmentationWorkflowTab"]').click(); await expect(open).toBeHidden();
    expect(errors).toEqual([]);
  } finally {
    await electron.close();
    expect(path.dirname(dataset)).toBe(path.resolve(os.tmpdir()));
    expect(path.basename(dataset)).toMatch(/^easy-labeling-class-remap-/);
    await rm(dataset, { recursive: true, force: true });
  }
});
