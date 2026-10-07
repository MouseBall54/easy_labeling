import { _electron, expect, test } from "@playwright/test";
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

for (const images of [6, 60]) test(`current labels load on demand with ${images} images and preserve full review results`, async ({}, testInfo) => {
  test.setTimeout(180_000);
  const root = path.resolve(".");
  const baseline = process.env.LABEL_FAST_BASELINE === "1";
  const dataset = await mkdtemp(path.join(os.tmpdir(), "easy-labeling-fast-"));
  const folders = [path.join(dataset, "label"), path.join(dataset, "comparison")];
  const count = 5000;
  const texts = [0, .003].map(offset => Array.from({length: count}, (_,index) =>
    `${index % 5} ${.02 + (index % 100) * .009 + offset} ${.02 + Math.floor(index / 100) * .017} .005 .008`).join("\n") + "\n");
  for (const folder of folders) await mkdir(folder);
  for (let index = 0; index < images; index++) {
    await copyFile(path.join(root, "assets/sample/sample_1.jpg"), path.join(dataset, `image-${index}.jpg`));
    for (const [source,folder] of folders.entries()) await writeFile(path.join(folder, `image-${index}.txt`), texts[source]!);
  }
  const electron = await _electron.launch({ args: [path.join(root, "tests/e2e/fixtures/inference-electron.cjs")], env: {
    ...process.env, INFERENCE_TEST_ROOT: root, INFERENCE_TEST_DATASET: dataset, INFERENCE_TEST_OFFSCREEN: "1",
    INFERENCE_TEST_PICKER_FOLDERS: JSON.stringify([dataset, folders[1]])
  }});
  try {
    const page = await electron.firstWindow();
    await page.waitForFunction(() => Boolean(Reflect.get(window, "__easyLabelingTestApi")));
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.addInitScript(() => {
      const reads: string[] = [];
      const workerResults: unknown[] = [];
      Reflect.set(window, "fastReads", reads);
      Reflect.set(window, "fastWorkerResults", workerResults);
      const seen = new WeakSet();
      const instrumentFile = (file: FileSystemFileHandle, prefix: string) => {
        if (seen.has(file)) return file;
        seen.add(file);
        const get = file.getFile.bind(file);
        file.getFile = async () => { reads.push(`${prefix}/${file.name}`); return get(); };
        return file;
      };
      type Directory = FileSystemDirectoryHandle & { values(): AsyncIterableIterator<FileSystemHandle> };
      const instrument = (directory: Directory, prefix: string): Directory => {
        if (seen.has(directory)) return directory;
        seen.add(directory);
        const getFile = directory.getFileHandle.bind(directory);
        const getDirectory = directory.getDirectoryHandle.bind(directory);
        const values = directory.values.bind(directory);
        directory.getFileHandle = async (...args) => instrumentFile(await getFile(...args), prefix);
        directory.getDirectoryHandle = async (...args) => instrument(await getDirectory(...args) as Directory, `${prefix}/${args[0]}`);
        directory.values = async function* () {
          for await (const handle of values()) yield handle.kind === "file"
            ? instrumentFile(handle as FileSystemFileHandle, prefix) : instrument(handle as Directory, `${prefix}/${handle.name}`);
        };
        return directory;
      };
      const picker = window.showDirectoryPicker!;
      window.showDirectoryPicker = async (...args) => { const directory = await picker(...args); return instrument(directory as Directory, directory.name); };
      const post = Worker.prototype.postMessage;
      Worker.prototype.postMessage = function (message: { input?: { yoloText?: string } }, ...options: unknown[]) {
        if (message?.input?.yoloText !== undefined) {
          if (Reflect.get(window, "fastPauseReview")) {
            Reflect.set(window, "fastPausedWorker", this);
            return;
          }
          const input = message.input;
          this.addEventListener("message", event => workerResults.push({ input, result: event.data.result }), { once: true });
        }
        Reflect.apply(post, this, [message, ...options]);
      };
      const strokes = new WeakMap<CanvasRenderingContext2D, number>();
      const clear = CanvasRenderingContext2D.prototype.clearRect;
      const stroke = CanvasRenderingContext2D.prototype.stroke;
      CanvasRenderingContext2D.prototype.clearRect = function (...args) {
        if (this.canvas.id === "canvas") strokes.set(this, 0);
        Reflect.apply(clear, this, args);
      };
      Reflect.set(CanvasRenderingContext2D.prototype, "stroke", function (this: CanvasRenderingContext2D, ...args: unknown[]) {
        Reflect.apply(stroke, this, args);
        if (this.canvas.id !== "canvas") return;
        const drawn = (strokes.get(this) ?? 0) + 1;
        strokes.set(this, drawn);
        if (drawn === 5000 && !Reflect.get(window, "fastPaintAt")) Reflect.set(window, "fastPaintAt", performance.now());
      });
    });
    await page.reload();
    await page.waitForFunction(() => Boolean(Reflect.get(window, "__easyLabelingTestApi")));
    const timings: Array<{action: string; readyMs: number; paintMs: number}> = [];
    const measure = async (action: string, source: number, selector?: string) => {
      await page.evaluate(({source,selector}) => {
        Reflect.get(window, "fastReads").length = 0;
        Reflect.set(window, "fastPaintAt", 0);
        Reflect.set(window, "fastReadyAt", 0);
        Reflect.set(window, "fastStartedAt", performance.now());
        const observer = new MutationObserver(() => {
          if (!(document.getElementById("activeOperationPanel") as HTMLElement).hidden || document.getElementById("loading-overlay")!.classList.contains("show")) return;
          if (document.getElementById("labelSourceTabs")?.getAttribute("data-active-index") !== String(source)) return;
          if (Reflect.get(window, "__easyLabelingTestApi").getRectCount() !== 5000) return;
          Reflect.set(window, "fastReadyAt", performance.now()); observer.disconnect();
        });
        observer.observe(document.body, { attributes: true, subtree: true });
        if (selector) (document.querySelector(selector) as HTMLElement).click();
        else document.dispatchEvent(new KeyboardEvent("keydown", { key: String(source+1), code: `Digit${source+1}`, ctrlKey: true, bubbles: true }));
      }, {source,selector});
      await page.waitForFunction(() => Reflect.get(window, "fastReadyAt") && Reflect.get(window, "fastPaintAt"), {timeout: 30_000});
      const values = await page.evaluate(() => ({ readyMs: Reflect.get(window, "fastReadyAt")-Reflect.get(window, "fastStartedAt"), paintMs: Reflect.get(window, "fastPaintAt")-Reflect.get(window, "fastStartedAt") }));
      timings.push({action,...values});
      const reads = await page.evaluate(() => Reflect.get(window, "fastReads") as string[]);
      const labels = reads.filter(name => /(?:^|\/)(label|comparison)\/image-\d+\.txt$/.test(name));
      expect(labels.length).toBeGreaterThan(0);
      if (!baseline) {
        expect(labels.every(name => name.endsWith("/image-0.txt"))).toBe(true);
        await expect(page.locator('[data-file-name="image-1.jpg"]')).toHaveAttribute("data-status", "detection-pending");
        await expect(page.locator('[data-file-name="image-1.jpg"] [data-ui="image-box-count"]')).toHaveText("…");
        await expect(page.locator("#reviewQueueSummary")).toHaveText(`Not checked · 1 / ${images}`);
      }
      console.log(JSON.stringify({baseline,images,action,...values,labelsRead:labels.length}));
    };
    const geometry = () => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getRectGeometries().map(
      ({left,top,width,height}:{left:number;top:number;width:number;height:number}) => ({left,top,width,height})));
    await measure("initial", 0, "#selectImageFolderBtn");
    const original = await geometry();
    const viewport = await page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getCanvasViewportTransform());
    await measure("register", 1, "#selectLabelFolderBtn");
    const comparison = await geometry();
    expect(comparison).not.toEqual(original);
    for (const source of [0,1,0,1]) {
      await measure(`switch-${source+1}`, source);
      expect(await geometry()).toEqual(source ? comparison : original);
      expect(await page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getCanvasViewportTransform())).toEqual(viewport);
    }
    if (baseline) {
      expect(errors).toEqual([]);
      await testInfo.attach("baseline-label-timings", { body: JSON.stringify({images,timings,errors},null,2), contentType: "application/json" });
      return;
    }
    if (images === 6) {
      const wasDark = await page.locator("#darkModeToggle").isChecked();
      if (wasDark) await page.locator('label[for="darkModeToggle"]').click();
      await expect(page.locator("body")).not.toHaveClass(/dark-mode/);
      await page.screenshot({ path: "output/label-fast-pending-light.png", animations: "disabled" });
      await page.locator('label[for="darkModeToggle"]').click();
      await expect(page.locator("body")).toHaveClass(/dark-mode/);
      await page.screenshot({ path: "output/label-fast-pending-dark.png", animations: "disabled" });
      if (!wasDark) await page.locator('label[for="darkModeToggle"]').click();
    }
    expect(await page.evaluate(() => Reflect.get(window, "fastWorkerResults").length)).toBe(0);
    await page.evaluate(() => { Reflect.set(window, "fastReviewStartedAt", performance.now()); document.getElementById("taskReviewBtn")!.click(); });
    await expect(page.locator("#activeOperationPanel")).toBeHidden({timeout:30_000});
    await expect(page.locator('[data-status="detection-pending"]')).toHaveCount(0);
    await expect(page.locator('[data-review-severity="pending"]')).toHaveCount(0);
    expect(await page.locator('[data-ui="image-box-count"]').allTextContents()).toEqual(Array(images).fill(String(count)));
    const reviewMs = await page.evaluate(() => performance.now() - Reflect.get(window, "fastReviewStartedAt"));
    console.log(JSON.stringify({images, action: "full-review", reviewMs}));
    expect(await page.evaluate(() => Reflect.get(window, "fastWorkerResults").length)).toBe(images);
    expect(await page.evaluate(async () => {
      const { inspectDetectionLabels } = await import(new URL("dist/features/review/quality.js", document.baseURI).href);
      return Reflect.get(window, "fastWorkerResults").every(({input,result}:{input: unknown; result:unknown}) => JSON.stringify(result) === JSON.stringify(inspectDetectionLabels(input)));
    })).toBe(true);
    if (images === 6) expect(await page.evaluate(async () => {
      const { inspectDetectionLabels } = await import(new URL("dist/features/review/quality.js", document.baseURI).href);
      const input = { yoloText: "1 .5 .5 .2 .2\n1 .5 .5 .2 .2\n2 -.1 .3 .1 .1\n3 .5 .5 .001 .001\n4 NaN .5 .2 .2\nmalformed",
        imageWidth: 100, imageHeight: 100, settings: { minimumBoxSizePx: 2, duplicateIouThreshold: .9, requiredClassIds: ["99"] } };
      const expected = inspectDetectionLabels(input);
      const worker = new Worker(new URL("workers/review-worker.js", document.baseURI), { type: "module" });
      try {
        const result = await new Promise((resolve, reject) => { worker.onmessage = event => resolve(event.data.result); worker.onerror = reject; worker.postMessage({ id: "parity", input }); });
        return JSON.stringify(result) === JSON.stringify(expected)
          && ["out-of-bounds", "small-box", "duplicate-box", "missing-class"].every(type => expected.issues.some((issue: {type: string}) => issue.type === type));
      } finally { worker.terminate(); }
    })).toBe(true);
    await page.evaluate(() => document.getElementById("taskAnnotateBtn")!.click());
    await measure("switch-after-review", 0);
    if (images === 6) {
      for (const action of ["stop", "source", "image"] as const) {
        await page.evaluate(() => {
          Reflect.set(window, "fastPauseReview", true);
          Reflect.set(window, "fastPausedWorker", null);
          document.getElementById("taskReviewBtn")!.click();
        });
        await page.waitForFunction(() => Boolean(Reflect.get(window, "fastPausedWorker")));
        await expect(page.locator("#loading-overlay")).toBeHidden();
        if (action === "stop") await page.locator("#cancelActiveOperationBtn").click();
        else if (action === "source") await page.keyboard.press("Control+2");
        else await page.locator('[data-file-name="image-1.jpg"]').click();
        await expect(page.locator("#activeOperationPanel")).toBeHidden();
        await page.evaluate(() => {
          Reflect.get(window, "fastPausedWorker").dispatchEvent(new MessageEvent("message", { data: { id: 0, result: { issues: [], highestSeverity: null } } }));
          Reflect.set(window, "fastPauseReview", false);
        });
        expect((await geometry()).length).toBe(count);
        await expect(page.locator("#reviewQueueSummary")).toContainText("Not checked");
        await page.evaluate(() => document.getElementById("taskAnnotateBtn")!.click());
      }
      await page.locator('[data-file-name="image-0.jpg"]').click();
      await expect(page.locator("#activeOperationPanel")).toBeHidden();
      await measure("restore-after-cancel", 0);
    }
    await writeFile(path.join(folders[1]!, "image-0.txt"), texts[1]!.trim().split("\n").slice(1).join("\n")+"\n");
    await page.keyboard.press("Control+2");
    await expect(page.locator("#activeOperationPanel")).toBeHidden();
    await expect.poll(async () => (await geometry()).length).toBe(count-1);
    expect(await geometry()).toEqual(comparison.slice(1));
    expect(await readFile(path.join(folders[0]!, "image-0.txt"), "utf8")).toBe(texts[0]);
    expect(errors).toEqual([]);
    await testInfo.attach("fast-label-timings", {body:JSON.stringify({images,timings,reviewMs,errors},null,2), contentType:"application/json"});
  } finally { await electron.close(); if (!path.basename(dataset).startsWith("easy-labeling-fast-")) throw new Error("Unexpected test path"); await rm(dataset,{recursive:true,force:true}); }
});
