import { test } from "@playwright/test";
import { existsSync } from "node:fs";
import { cp, mkdir, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { desktopExe, launchDesktop } from "./fixtures/tauri-app.js";

// Times Refine's folder run (All images in folder) in the desktop app, phase by phase, from the
// timings the run reports (#refineStatus data-timings). Logged, not asserted. Needs a dataset from
// scripts/bench/make-folder-run-dataset.py; its label/ folder is restored from label-pristine/ before
// every run (made on the first run). A UNC path (\\localhost\D$\...) stands in for a NAS.
//
//   FOLDER_RUN_DATASETS="D:\el-bench\folder-run\tif;\\localhost\D$\el-bench\folder-run\tif"
//   FOLDER_RUN_LANES="8,1"   (label files written at once; 1 = one at a time, as before 2.39.1)
//   FOLDER_RUN_PATHS="native,ts"   (native = the Rust batch; ts = window.easyLabelingNativeOff = ["refine-folder"])
const datasets = (process.env.FOLDER_RUN_DATASETS ?? "").split(";").filter(Boolean);
const lanes = (process.env.FOLDER_RUN_LANES ?? "8").split(",").map(Number);
const paths = (process.env.FOLDER_RUN_PATHS ?? "native").split(",");
test.skip(!existsSync(desktopExe) || !datasets.length, "Needs the desktop executable and FOLDER_RUN_DATASETS");

async function restoreLabels(dataset: string): Promise<void> {
  const label = path.join(dataset, "label");
  const pristine = path.join(dataset, "label-pristine");
  if (!existsSync(pristine)) await cp(label, pristine, { recursive: true, filter: (source) => !source.includes(".easy-labeling") });
  await rm(label, { recursive: true, force: true });
  await cp(pristine, label, { recursive: true });
  await rm(path.join(dataset, ".easy-labeling"), { recursive: true, force: true });
}

const results: Array<Record<string, unknown>> = [];
test.afterAll(async () => {
  await mkdir("test-results", { recursive: true });
  await writeFile("test-results/folder-run-timings.json", `${JSON.stringify(results, null, 2)}\n`);
});

for (const dataset of datasets) for (const lane of lanes) for (const run of paths) {
  test(`folder run: ${dataset} with ${lane} write lane${lane === 1 ? "" : "s"}, ${run}`, async () => {
    test.setTimeout(3_600_000);
    await restoreLabels(dataset);
    const images = (await readdir(dataset)).filter((name) => /\.(tiff?|png|jpe?g)$/i.test(name)).length;
    const sandbox = await mkdtemp(path.join(os.tmpdir(), "easy-labeling-folder-run-"));
    const app = await launchDesktop(desktopExe, sandbox, [dataset]);
    try {
      const { page } = app;
      page.on("dialog", (dialog) => void dialog.accept());
      await page.locator("#selectImageFolderBtn").click();
      await page.waitForFunction("window.__easyLabelingTestApi.getRectCount() > 0", undefined, { timeout: 300_000 });
      // Let the folder's background review finish so it does not share the run's reads.
      await page.waitForTimeout(Number(process.env.FOLDER_RUN_SETTLE_MS ?? 15_000));
      await page.evaluate(([count, off]) => {
        Reflect.set(window, "easyLabelingWriteLanes", count);
        window.easyLabelingNativeOff = off;
      }, [lane, run === "ts" ? ["refine-folder"] : []] as const);
      await page.locator("#taskRefineBtn").click();
      const started = Date.now();
      await page.locator("#refineFolderBtn").click();
      await page.waitForFunction(() => Boolean(document.querySelector<HTMLElement>("#refineStatus")?.dataset.timings), undefined, { timeout: 3_500_000, polling: 100 });
      const wallMs = Date.now() - started;
      const timings = JSON.parse(await page.locator("#refineStatus").getAttribute("data-timings") ?? "{}") as Record<string, number>;
      const status = await page.locator("#refineStatus").textContent();
      const row = { dataset, lanes: lane, path: run, images, wallMs, ...timings };
      results.push(row);
      console.log(JSON.stringify(row));
      console.log(status);
    } finally {
      await app.close();
      await rm(sandbox, { recursive: true, force: true, maxRetries: 10, retryDelay: 500 }).catch(() => undefined);
      await restoreLabels(dataset);
    }
  });
}
