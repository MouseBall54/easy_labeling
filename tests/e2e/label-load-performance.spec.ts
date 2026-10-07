import { _electron, expect, test } from "@playwright/test";
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

for (const count of [4000, 5000]) test(`native label loading and source switching preserves ${count} boxes`, async ({}, testInfo) => {
  test.setTimeout(180_000);
  const root = path.resolve(".");
  const dataset = await mkdtemp(path.join(os.tmpdir(), "easy-labeling-load-"));
  const folders = [path.join(dataset, "label"), path.join(dataset, "comparison")];
  const texts = [0, 0.003].map((offset) => Array.from({ length: count }, (_, index) =>
    `${index % 5} ${0.02 + (index % 100) * 0.009 + offset} ${0.02 + Math.floor(index / 100) * 0.017} 0.005 0.008`
  ).join("\n") + "\n");
  for (const folder of folders) await mkdir(folder);
  for (let index = 0; index < 6; index += 1) {
    await copyFile(path.join(root, "assets/sample/sample_1.jpg"), path.join(dataset, `image-${index}.jpg`));
    for (const [source, folder] of folders.entries()) await writeFile(path.join(folder, `image-${index}.txt`), texts[source]!);
  }
  const electron = await _electron.launch({
    args: [path.join(root, "tests/e2e/fixtures/inference-electron.cjs")],
    env: { ...process.env, INFERENCE_TEST_ROOT: root, INFERENCE_TEST_DATASET: dataset,
      INFERENCE_TEST_PICKER_FOLDERS: JSON.stringify([dataset, folders[1]]) }
  });
  try {
    await electron.evaluate(({ BrowserWindow }) => {
      BrowserWindow.getAllWindows().forEach((window) => window.webContents.setBackgroundThrottling(false));
    });
    const page = await electron.firstWindow();
    await page.waitForLoadState("domcontentloaded");
    await page.waitForFunction(() => Boolean(Reflect.get(window, "__easyLabelingTestApi")));
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.evaluate(() => {
      Reflect.set(window, "labelLoadWorkerClears", 0);
      const post = Worker.prototype.postMessage;
      Worker.prototype.postMessage = function (message: { operation?: string }, ...options: unknown[]) {
        if (message?.operation === "CLEAR") Reflect.set(window, "labelLoadWorkerClears", Reflect.get(window, "labelLoadWorkerClears") + 1);
        Reflect.apply(post, this, [message, ...options]);
      };
    });
    const geometry = () => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getRectGeometries().map(
      ({ left, top, width, height }: { left: number; top: number; width: number; height: number }) => ({ left, top, width, height })
    ));
    const timings: Array<{ action: string; ms: number }> = [];
    const measure = async (action: string, run: () => Promise<unknown>, source = 0) => {
      await page.evaluate(() => Reflect.set(window, "labelLoadStartedAt", performance.now()));
      await run();
      await expect(page.locator("#activeOperationPanel")).toBeHidden({ timeout: 60_000 });
      await expect(page.locator("#loading-overlay")).toBeHidden({ timeout: 60_000 });
      await expect.poll(() => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getRectCount()), { timeout: 60_000 }).toBe(count);
      await expect(page.locator("#labelSourceTabs")).toHaveAttribute("data-active-index", String(source));
      const ms = await page.evaluate(() => Math.round(performance.now() - Reflect.get(window, "labelLoadStartedAt")));
      timings.push({ action, ms });
      console.log(JSON.stringify({ count, action, ms }));
    };
    await measure("initial", () => page.locator("#selectImageFolderBtn").click());
    const original = await geometry();
    const workerClears = await page.evaluate(() => Reflect.get(window, "labelLoadWorkerClears"));
    expect(await page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getCanvasObjectCounts().text ?? 0)).toBe(0);
    await page.locator("#zoom-input").fill("130");
    await page.locator("#zoom-input").press("Enter");
    const viewport = await page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getCanvasViewportTransform());
    await measure("register", () => page.locator("#selectLabelFolderBtn").click(), 1);
    await expect(page.locator("#labelSourceTabs")).toHaveAttribute("data-active-index", "1");
    const comparison = await geometry();
    expect(comparison).not.toEqual(original);
    for (const source of [0, 1, 0, 1]) {
      await measure(`switch-${source + 1}`, () => page.keyboard.press(`Control+${source + 1}`), source);
      await expect(page.locator("#labelSourceTabs")).toHaveAttribute("data-active-index", String(source));
      expect(await geometry()).toEqual(source ? comparison : original);
      expect(await page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getCanvasViewportTransform())).toEqual(viewport);
      expect(await page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").canUndo())).toBe(false);
    }
    // External file edits must remain visible; accelerating loading must not cache stale labels.
    await page.keyboard.press("Control+1");
    await expect(page.locator("#activeOperationPanel")).toBeHidden();
    await writeFile(path.join(folders[1]!, "image-0.txt"), texts[1]!.trim().split("\n").slice(1).join("\n") + "\n");
    await page.keyboard.press("Control+2");
    await expect(page.locator("#activeOperationPanel")).toBeHidden();
    await expect.poll(async () => (await geometry()).length).toBe(count - 1);
    expect(await geometry()).toEqual(comparison.slice(1));
    expect(await readFile(path.join(folders[0]!, "image-0.txt"), "utf8")).toBe(texts[0]);
    expect(await page.evaluate(() => Reflect.get(window, "labelLoadWorkerClears"))).toBe(workerClears);
    console.log(JSON.stringify({ count, timings, pageErrors: errors }));
    expect(errors).toEqual([]);
    await testInfo.attach("label-load-timings", { body: JSON.stringify({ count, timings }, null, 2), contentType: "application/json" });
  } finally {
    await electron.close();
    if (!path.basename(dataset).startsWith("easy-labeling-load-")) throw new Error("Unexpected test dataset path");
    await rm(dataset, { recursive: true, force: true });
  }
});
