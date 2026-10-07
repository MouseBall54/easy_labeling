import { _electron, expect, test } from "@playwright/test";
import { copyFile, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createBoxLayout } from "../../src/features/automation/layout.js";

for (const count of [6, 5000]) test(`both Layout Apply buttons preserve ${count} boxes until explicit cleanup`, async () => {
  test.setTimeout(240_000);
  const root = path.resolve(".");
  const dataset = await mkdtemp(path.join(os.tmpdir(), "easy-labeling-layout-outside-"));
  const labels = path.join(dataset, "label");
  await mkdir(labels);
  for (const name of ["image", "second"]) {
    await copyFile(path.join(root, "assets/sample/sample_1.jpg"), path.join(dataset, `${name}.jpg`));
    await writeFile(path.join(labels, `${name}.txt`), "0 0.5 0.5 0.1 0.1\n");
  }
  const electron = await _electron.launch({ args: [path.join(root, "tests/e2e/fixtures/inference-electron.cjs")],
    env: { ...process.env, INFERENCE_TEST_ROOT: root, INFERENCE_TEST_DATASET: dataset, INFERENCE_TEST_OFFSCREEN: "1" } });
  try {
    const page = await electron.firstWindow();
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.waitForFunction(() => Boolean(Reflect.get(window, "__easyLabelingTestApi")));
    await page.locator("#selectImageFolderBtn").click();
    const rectCount = () => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getRectCount());
    await expect.poll(rectCount).toBe(1);
    await expect(page.locator("#activeOperationPanel")).toBeHidden();
    const size = await page.evaluate(async () => {
      const image = new Image();
      image.src = "./assets/sample/sample_1.jpg";
      await image.decode();
      return { width: image.naturalWidth, height: image.naturalHeight };
    });
    const positions = [
      { left: -5, top: 20 }, { left: 20, top: -5 },
      { left: size.width - 5, top: 20 }, { left: 20, top: size.height - 5 },
      { left: size.width + 20, top: 20 }, { left: 20, top: 20 }
    ];
    const columns = Math.floor((size.width - 60) / 10);
    const boxes = Array.from({ length: count }, (_, index) => ({
      ...(positions[index] ?? { left: 30 + index % columns * 10, top: 30 + Math.floor(index / columns) % Math.floor((size.height - 60) / 10) * 10 }),
      id: String(index), classId: String(index % 5), width: 10, height: 10
    }));
    const layout = createBoxLayout({ name: `Outside ${count}`, sourceImageName: "image.jpg", sourceImageSize: size, boxes });
    const layoutFile = path.join(dataset, "outside.layout.json");
    await writeFile(layoutFile, JSON.stringify(layout));
    const geometry = () => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getRectGeometries()
      .map(({ left, top, width, height }: { left: number; top: number; width: number; height: number }) => ({ left, top, width, height }))
      .sort((a: { left: number; top: number }, b: { left: number; top: number }) => a.left - b.left || a.top - b.top));
    const before = await geometry();
    const expected = [...before, ...boxes.map(({ left, top, width, height }) => ({ left, top, width, height }))]
      .sort((a, b) => a.left - b.left || a.top - b.top);
    const expectGeometry = async () => {
      const rounded = (box: { left: number; top: number; width: number; height: number }) =>
        [box.left, box.top, box.width, box.height].map((value) => Number(value.toFixed(6)));
      expect((await geometry()).map(rounded)).toEqual(expected.map(rounded));
    };
    const started = Date.now();
    await page.locator("#taskAutomateBtn").click();
    await page.locator("#openLayoutSetupBtn").click();
    await page.locator("#importAutomationLibraryInput").setInputFiles(layoutFile);
    await expect(page.locator("#layoutSetupSelect option:checked")).toHaveText(layout.name);
    for (const entry of ["popup", "main"]) {
      if (entry === "main") await page.locator("#taskAutomateBtn").click();
      await page.locator(entry === "popup" ? "#applyBoxLayoutFromSetupBtn" : "#applyBoxLayoutBtn").click();
      await expect.poll(rectCount, { timeout: 60_000 }).toBe(count + 1);
      await expect(page.locator("#layoutPlacementNotice")).toHaveAttribute("data-state", "applied");
      await expect(page.locator("#layoutPlacementNotice")).not.toContainText("removed");
      expect(await page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getSelectedRectIds().length)).toBe(count);
      await expectGeometry();
      console.log(JSON.stringify({ count, entry, step: "applied", elapsedMs: Date.now() - started }));
      if (entry === "popup") await page.locator("#layoutSetupModal .modal-footer").getByRole("button", { name: "Close", exact: true }).click();
      await page.locator('[data-ui="history-undo"]').click();
      await expect.poll(geometry).toEqual(before);
      await page.locator('[data-ui="history-redo"]').click();
      await expectGeometry();
      console.log(JSON.stringify({ count, entry, step: "redone", elapsedMs: Date.now() - started }));
      if (entry === "popup") {
        await page.locator('[data-ui="history-undo"]').click();
        await expect.poll(rectCount).toBe(1);
      }
    }
    await page.locator("#saveLabelsBtn").click();
    await expect(page.locator("#headerDocumentStatus")).toHaveAttribute("data-state", "saved");
    const saved = await readFile(path.join(labels, "image.txt"), "utf8");
    expect(saved.trim().split("\n")).toHaveLength(count + 1);
    // Check every layout class and geometry in the real saved TXT, including external coordinates.
    const savedRows = saved.trim().split("\n").map((line) => line.split(/\s+/).map(Number));
    const rowKey = (row: number[]) => row.map((value) => value.toFixed(10)).join(" ");
    const savedKeys = new Set(savedRows.map(rowKey));
    expect(boxes.filter((box) => !savedKeys.has(rowKey([Number(box.classId), (box.left + box.width / 2) / size.width,
      (box.top + box.height / 2) / size.height, box.width / size.width, box.height / size.height])))).toEqual([]);
    console.log(JSON.stringify({ count, step: "saved", elapsedMs: Date.now() - started }));
    await page.locator("#autoSaveToggle").check();
    await page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").selectRectsByIndex([0]));
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#headerDocumentStatus")).toHaveAttribute("data-state", "dirty");
    await page.keyboard.press("d");
    await expect(page.locator("#current-image-name")).toHaveText("second.jpg");
    await expect.poll(rectCount).toBe(1);
    await page.keyboard.press("a");
    await expect(page.locator("#current-image-name")).toHaveText("image.jpg");
    await expect.poll(rectCount).toBe(count + 1);
    await expect(page.locator("#activeOperationPanel")).toBeHidden();
    const beforeCleanup = await readFile(path.join(labels, "image.txt"), "utf8");
    const secondBeforeCleanup = await readFile(path.join(labels, "second.txt"), "utf8");
    expect(beforeCleanup.trim().split("\n")).toHaveLength(count + 1);
    page.once("dialog", (dialog) => dialog.accept());
    await page.locator("#removeOutsideBoxesBtn").click();
    await expect.poll(rectCount).toBe(count - 4);
    await expect(page.locator("#activeOperationPanel")).toBeHidden();
    expect((await readFile(path.join(labels, "image.txt"), "utf8")).trim().split("\n")).toHaveLength(count - 4);
    const backup = (await readdir(path.join(labels, ".easy-labeling"))).find((name) => name.startsWith("outside-boxes-"))!;
    expect(await readFile(path.join(labels, ".easy-labeling", backup, "image.txt"), "utf8")).toBe(beforeCleanup);
    expect(await readFile(path.join(labels, "second.txt"), "utf8")).toBe(secondBeforeCleanup);
    expect(errors).toEqual([]);
  } finally {
    await electron.close();
    expect(path.dirname(dataset)).toBe(path.resolve(os.tmpdir()));
    expect(path.basename(dataset)).toMatch(/^easy-labeling-layout-outside-/);
    await rm(dataset, { recursive: true, force: true });
  }
});
