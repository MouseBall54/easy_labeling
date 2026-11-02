import { expect, test, type Page } from "@playwright/test";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { grayPng, grayTiff } from "./fixtures/review-dataset.js";
import { launchDesktop } from "./fixtures/tauri-app.js";

// Image switching (next/prev) in the Tauri app on SEM-sized TIFF, PNG and JPEG folders. Timings are logged,
// not asserted; point EASY_LABELING_TAURI_EXE at another build (an older commit's exe) to compare the two, or set
// EASY_LABELING_NATIVE_OFF (e.g. "prefetch") to switch native features off in this one.
const root = path.resolve(".");
const exe = process.env.EASY_LABELING_TAURI_EXE ?? path.join(root, "target/debug/Easy Labeling.exe");
test.skip(!existsSync(exe), `Tauri executable not built: ${exe}`);

const off = (process.env.EASY_LABELING_NATIVE_OFF ?? "").split(",").filter(Boolean);
const IMAGES = 4;
// Time on each image before switching, as a user looks at it (the app decodes the next image meanwhile).
const DWELL_MS = 500;
// Image i carries 20 + i boxes: the count shows its labels were applied, which happens after its decode.
const boxCount = (index: number) => 20 + index;
const labels = (count: number) => Array.from({ length: count }, (_, index) => `0 ${(0.05 + index * 0.02).toFixed(6)} 0.5 0.01 0.01`).join("\n") + "\n";

async function settled(page: Page, name: string, count: number): Promise<void> {
  await page.waitForFunction(([expectedName, expectedCount]) => {
    const api = Reflect.get(window, "__easyLabelingTestApi");
    return api.getCurrentImageName() === expectedName && api.getRectCount() === expectedCount
      && !document.querySelector("#activeOperationPanel")?.checkVisibility({ visibilityProperty: true })
      && !document.querySelector("#loading-overlay")?.checkVisibility({ visibilityProperty: true });
  }, [name, count] as const, { polling: 5, timeout: 120_000 });
}

/** Clicks `button` and returns the time until image `index` is shown with its labels and two frames painted. */
async function timedSwitch(page: Page, button: string, name: string, index: number): Promise<{ ms: number; longestTask: number }> {
  await page.waitForTimeout(DWELL_MS);
  await page.evaluate(() => {
    const tasks: number[] = [];
    const observer = new PerformanceObserver((list) => list.getEntries().forEach((entry) => tasks.push(entry.duration)));
    observer.observe({ type: "longtask" });
    Reflect.set(window, "__switch", { startedAt: performance.now(), tasks, observer });
  });
  await page.locator(button).click();
  await settled(page, name, boxCount(index));
  return page.evaluate(async () => {
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    const state = Reflect.get(window, "__switch") as { startedAt: number; tasks: number[]; observer: PerformanceObserver };
    const ms = performance.now() - state.startedAt;
    state.observer.disconnect();
    return { ms, longestTask: Math.max(0, ...state.tasks) };
  });
}

const median = (values: number[]) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]!;

for (const format of ["tif", "png", "jpg"] as const) {
  test(`Tauri image switching on 4096x3072 ${format.toUpperCase()} images`, async ({ page: browserPage }) => {
    test.setTimeout(300_000);
    const sandbox = await mkdtemp(path.join(os.tmpdir(), "easy-labeling-switch-"));
    const dataset = path.join(sandbox, format);
    await mkdir(path.join(dataset, "label"), { recursive: true });
    const names = Array.from({ length: IMAGES }, (_, index) => `img_${index}.${format}`);
    for (const [index, name] of names.entries()) {
      let bytes: Buffer;
      if (format === "tif") bytes = grayTiff(4096, 3072, index + 1);
      else if (format === "png") bytes = grayPng(4096, 3072, index + 1);
      else {
        // Chromium's JPEG encoder (quality 0.92) on the same kind of gray content.
        const base64 = await browserPage.evaluate(async (seed) => {
          const canvas = new OffscreenCanvas(4096, 3072);
          const context = canvas.getContext("2d")!;
          const pixels = context.createImageData(4096, 3072);
          let state = seed;
          for (let offset = 0; offset < pixels.data.length; offset += 4) {
            state = (Math.imul(state, 1103515245) + 12345) >>> 0;
            const x = (offset / 4) % 4096;
            const y = Math.floor(offset / 4 / 4096);
            const value = 50 + x / 100 + (x % 64 > 12 && x % 64 < 52 && y % 48 > 9 && y % 48 < 40 ? 110 : 0) + (state / 4294967296 - 0.5) * 40;
            pixels.data[offset] = pixels.data[offset + 1] = pixels.data[offset + 2] = value;
            pixels.data[offset + 3] = 255;
          }
          context.putImageData(pixels, 0, 0);
          const blob = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.92 });
          const bytes = new Uint8Array(await blob.arrayBuffer());
          let binary = "";
          for (let index = 0; index < bytes.length; index += 0x8000) binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
          return btoa(binary);
        }, index + 1);
        bytes = Buffer.from(base64, "base64");
      }
      await writeFile(path.join(dataset, name), bytes);
      await writeFile(path.join(dataset, "label", name.replace(/\.[^.]+$/, ".txt")), labels(boxCount(index)));
    }
    const app = await launchDesktop(exe, sandbox, [dataset]);
    try {
      const { page } = app;
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.evaluate((list) => { window.easyLabelingNativeOff = list; }, off);
      await page.locator("#selectImageFolderBtn").click();
      await settled(page, names[0]!, boxCount(0));
      // Let the folder scan and first-image work finish before timing.
      await page.waitForTimeout(1_000);
      const runs: Array<{ step: string; ms: number; longestTask: number }> = [];
      for (let index = 1; index < IMAGES; index += 1) runs.push({ step: `next${index}`, ...await timedSwitch(page, "#nextImageBtn", names[index]!, index) });
      for (let index = IMAGES - 2; index >= 0; index -= 1) runs.push({ step: `prev${index}`, ...await timedSwitch(page, "#prevImageBtn", names[index]!, index) });
      console.log(JSON.stringify({
        exe: path.basename(path.dirname(path.dirname(exe))),
        format,
        off,
        medianMs: Math.round(median(runs.map((run) => run.ms))),
        medianLongestTaskMs: Math.round(median(runs.map((run) => run.longestTask))),
        runs: runs.map((run) => `${run.step}:${Math.round(run.ms)}/${Math.round(run.longestTask)}`).join(" ")
      }));
      expect(errors).toEqual([]);
    } finally {
      await app.close();
      await rm(sandbox, { recursive: true, force: true, maxRetries: 40, retryDelay: 250 });
    }
  });
}
