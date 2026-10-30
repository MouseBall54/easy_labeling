import { _electron, expect, test, type Page } from "@playwright/test";
import { existsSync } from "node:fs";
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { launchDesktop } from "./fixtures/tauri-app.js";

// Compares the Electron shell with the Tauri build on the same dist/: label loading, image
// navigation, Layout Apply/undo and saving at bulk box counts. Timings are logged, not asserted.
const root = path.resolve(".");
const tauriExe = process.env.EASY_LABELING_TAURI_EXE ?? path.join(root, "target/debug/Easy Labeling.exe");
const counts = (process.env.DESKTOP_PERF_COUNTS ?? "4000,5000,10000").split(",").map(Number);
// The test windows sit behind other windows; keep Chromium from throttling them like the foreground app it measures.
const throttleFlags = ["--disable-renderer-backgrounding", "--disable-background-timer-throttling", "--disable-backgrounding-occluded-windows"];
process.env.EASY_LABELING_TEST_WEBVIEW_ARGS = throttleFlags.join(" ");

async function openShell(shell: "electron" | "tauri", sandbox: string, dataset: string) {
  // Electron keeps its user data (and V8 code cache) between runs; give WebView2 the same warm profile.
  if (shell === "tauri") return launchDesktop(tauriExe, path.join(os.tmpdir(), "easy-labeling-perf-tauri-profile"), [dataset]);
  const electron = await _electron.launch({
    args: [...throttleFlags, path.join(root, "tests/e2e/fixtures/inference-electron.cjs")],
    env: { ...process.env, INFERENCE_TEST_ROOT: root, INFERENCE_TEST_DATASET: dataset, INFERENCE_TEST_PICKER_FOLDERS: JSON.stringify([dataset]) }
  });
  const page = await electron.firstWindow();
  // The fixture window starts hidden; a hidden window paints at 1 fps and would skew every timing.
  await electron.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows().forEach((window) => { window.webContents.setBackgroundThrottling(false); window.showInactive(); }));
  await page.waitForFunction(() => Boolean(Reflect.get(window, "__easyLabelingTestApi")));
  return { page, close: () => electron.close() };
}

// Polls inside the page every 10 ms so the measured time is not rounded up to Playwright's poll steps.
const until = (page: Page, condition: string) => page.waitForFunction(condition, undefined, { polling: 10, timeout: 300_000 });
const rects = (count: number) => `window.__easyLabelingTestApi.getRectCount() === ${count}`;
const settled = (page: Page, count: number) => until(page,
  `!document.querySelector("#activeOperationPanel")?.checkVisibility({ visibilityProperty: true }) && !document.querySelector("#loading-overlay")?.checkVisibility({ visibilityProperty: true }) && ${rects(count)}`);

async function timed(page: Page, run: () => Promise<unknown>, done: () => Promise<unknown>): Promise<number> {
  await page.evaluate(() => Reflect.set(window, "perfStartedAt", performance.now()));
  await run();
  await done();
  return page.evaluate(async () => {
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    return Math.round(performance.now() - Reflect.get(window, "perfStartedAt"));
  });
}

for (const shell of ["electron", "tauri"] as const) for (const count of counts) {
  test(`${shell} bulk performance with ${count} boxes`, async ({}, testInfo) => {
    test.skip(shell === "tauri" && !existsSync(tauriExe), `Tauri executable not built: ${tauriExe}`);
    test.setTimeout(900_000);
    const sandbox = await mkdtemp(path.join(os.tmpdir(), "easy-labeling-perf-"));
    const dataset = path.join(sandbox, "dataset");
    await mkdir(path.join(dataset, "label"), { recursive: true });
    const text = Array.from({ length: count }, (_, index) =>
      `${index % 5} ${0.02 + (index % 100) * 0.009} ${0.01 + Math.floor(index / 100) * (0.98 / Math.ceil(count / 100))} 0.005 0.005`
    ).join("\n") + "\n";
    for (let index = 0; index < 6; index += 1) {
      await copyFile(path.join(root, "assets/sample/sample_1.jpg"), path.join(dataset, `image-${index}.jpg`));
      await writeFile(path.join(dataset, `label/image-${index}.txt`), text);
    }
    const app = await openShell(shell, sandbox, dataset);
    const result: Record<string, number> = {};
    try {
      const { page } = app;
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      // Median frame interval: proves the window paints at full rate while being measured.
      result.frameMs = await page.evaluate(async () => {
        const gaps: number[] = [];
        for (let index = 0; index < 11; index += 1) {
          const start = performance.now();
          await new Promise((resolve) => requestAnimationFrame(resolve));
          gaps.push(performance.now() - start);
        }
        return Math.round(gaps.sort((a, b) => a - b)[5]!);
      });
      // DESKTOP_PERF_SETTLE_MS waits out startup work first, so "open" measures only the folder load.
      await page.waitForTimeout(Number(process.env.DESKTOP_PERF_SETTLE_MS ?? 0));
      result.open = await timed(page, () => page.locator("#selectImageFolderBtn").click(), () => settled(page, count));
      for (const step of [1, 2, 3]) {
        result[`next${step}`] = await timed(page, () => page.locator("#nextImageBtn").click(), () => settled(page, count));
      }
      result.prev = await timed(page, () => page.locator("#prevImageBtn").click(), () => settled(page, count));

      await page.locator("#taskAutomateBtn").click();
      await page.locator("#openLayoutSetupBtn").click();
      await page.locator("#newBoxLayoutBtn").click();
      await page.locator("#layoutCaptureScopeSelect").selectOption("all");
      await page.locator("#layoutNameInput").fill(`Bulk ${count}`);
      result.layoutSave = await timed(page, () => page.locator("#saveBoxLayoutBtn").click(),
        () => until(page, `document.querySelector("#layoutDetails")?.textContent.includes("${count} boxes")`));
      result.layoutApply = await timed(page, () => page.locator("#applyBoxLayoutFromSetupBtn").click(), () => until(page, `${rects(count * 2)} && document.querySelector("#layoutPlacementNotice")?.dataset.state === "applied"`));
      await page.locator("#layoutSetupModal .modal-footer").getByRole("button", { name: "Close", exact: true }).click();
      result.undo = await timed(page, () => page.locator('[data-ui="history-undo"]').click(), () => until(page, rects(count)));
      result.redo = await timed(page, () => page.locator('[data-ui="history-redo"]').click(), () => until(page, rects(count * 2)));
      const current = await page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getCurrentImageName() as string);
      const labelFile = path.join(dataset, "label", current.replace(/\.[^.]+$/, ".txt"));
      result.saveLabels = await timed(page, () => page.locator("#saveLabelsBtn").click(), () => expect.poll(async () =>
        (await readFile(labelFile, "utf8")).trim().split("\n").length, { timeout: 300_000, intervals: [20] }).toBe(count * 2));
      expect(errors).toEqual([]);
      await testInfo.attach("desktop-performance", { body: JSON.stringify({ shell, count, ...result }), contentType: "application/json" });
    } finally {
      console.log(JSON.stringify({ shell, count, ...result }));
      await app.close();
      await rm(sandbox, { recursive: true, force: true, maxRetries: 40, retryDelay: 250 });
    }
  });
}
