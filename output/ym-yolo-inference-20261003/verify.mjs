import { _electron } from "@playwright/test";
import { mkdir, copyFile, writeFile, readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const output = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(output, "../..");
const jobs = JSON.parse(await readFile(path.join(output, "models.json"), "utf8"));
const results = [];
const hash = async (file) => createHash("sha256").update(await readFile(file)).digest("hex");
for (const job of jobs) {
  const workspace = path.join(output, "workspaces", job.name);
  const labelFolder = path.join(workspace, "label");
  await mkdir(labelFolder, { recursive: true });
  const profile = path.join(workspace, "profiles", "class-info");
  await mkdir(profile, { recursive: true });
  await writeFile(path.join(profile, "classes.yaml"), `names:\n  0: ${job.className}\n`);
  await writeFile(path.join(labelFolder, "classes.yaml"), `names:\n  0: ${job.className}\n`);
  const files = (await readdir(job.images)).filter((name) => /\.(png|jpe?g|tiff?)$/i.test(name)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const originalHashes = {};
  for (const name of files) {
    await copyFile(path.join(job.images, name), path.join(workspace, name));
    const label = name.replace(/\.[^.]+$/, ".txt");
    await copyFile(path.join(job.labels, label), path.join(labelFolder, label));
    originalHashes[label] = await hash(path.join(labelFolder, label));
  }
  const electron = await _electron.launch({ args: [path.join(root, "tests/e2e/fixtures/inference-electron.cjs")], env: { ...process.env, INFERENCE_TEST_DATASET: workspace, INFERENCE_TEST_ROOT: root } });
  const entry = { ...job, workspace, files, errors: [] };
  try {
    const page = await electron.firstWindow();
    page.on("pageerror", (error) => entry.errors.push(error.message));
    await page.locator("#selectImageFolderBtn").click();
    const expectedOriginalCount = (await readFile(path.join(labelFolder, files[0].replace(/\.[^.]+$/, ".txt")), "utf8")).split("\n").filter((line) => line.trim()).length;
    await page.waitForFunction((expected) => window.__easyLabelingTestApi?.getRectCount() === expected && document.getElementById("activeOperationPanel").hidden, expectedOriginalCount, { timeout: 120000 });
    await page.locator("#activeOperationPanel").waitFor({ state: "hidden", timeout: 120000 });
    entry.originalCount = await page.evaluate(() => window.__easyLabelingTestApi.getRectCount());
    await page.evaluate(() => {
      const NativeWorker = window.Worker;
      window.__inferenceMeasurements = [];
      window.Worker = class extends NativeWorker {
        constructor(url, options) {
          super(url, options);
          this.isYolo = String(url).includes("yolo-inference-worker");
          this.starts = new Map();
          if (this.isYolo) this.addEventListener("message", ({ data }) => {
            const start = this.starts.get(data.id);
            window.__inferenceMeasurements.push({ id: data.id, operation: start?.operation, elapsedMs: performance.now() - (start?.time ?? performance.now()), ...data });
          });
        }
        postMessage(message, transfer) {
          if (this.isYolo) this.starts.set(message.id, { operation: message.operation, time: performance.now() });
          super.postMessage(message, transfer);
        }
      };
    });
    await page.locator("#taskInferenceBtn").click();
    const loadStart = performance.now();
    await page.locator("#inferenceModelInput").setInputFiles(job.model);
    await page.waitForFunction(() => !document.getElementById("inferenceModelInput").disabled, null, { timeout: 240000 });
    entry.modelLoadMs = performance.now() - loadStart;
    entry.modelStatus = await page.locator("#inferenceModelStatus").innerText();
    if (!entry.modelStatus.includes("CPU / WASM")) throw new Error(entry.modelStatus);
    await page.locator("#autoSaveToggle").check();
    const inferStart = performance.now();
    await page.locator("#runInferenceAllBtn").click();
    await page.waitForFunction(() => !document.getElementById("inferenceModelInput").disabled, null, { timeout: 600000 });
    entry.batchMs = performance.now() - inferStart;
    entry.status = await page.locator("#inferenceRunStatus").innerText();
    const measurements = await page.evaluate(() => window.__inferenceMeasurements);
    await writeFile(path.join(output, `${job.name}-worker.json`), JSON.stringify(measurements, null, 2));
    if (!/^\d+ image\(s\)/.test(entry.status)) throw new Error(entry.status);
    const sources = await page.locator("#labelSourceSelect option").allTextContents();
    const activeIndex = await page.locator("#labelSourceSelect").inputValue();
    entry.resultsFolder = path.join(workspace, sources[Number(activeIndex)].replace(/^\d+\. /, ""));
    entry.inferenceManifest = JSON.parse(await readFile(path.join(entry.resultsFolder, "inference.json"), "utf8"));
    entry.predictions = entry.inferenceManifest.images.map((name, index) => ({ image: name, ...measurements.filter((record) => record.operation === "INFER")[index] }));
    entry.resultCanvasCount = await page.evaluate(() => window.__easyLabelingTestApi.getRectCount());
    await page.locator("#inferenceModelInput").scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(output, `${job.name}-app.png`) });
    await page.locator("#labelSourceSelect").selectOption("0");
    await page.locator("#activeOperationPanel").waitFor({ state: "hidden", timeout: 120000 });
    entry.restoredCount = await page.evaluate(() => window.__easyLabelingTestApi.getRectCount());
    entry.originalLabelsUnchanged = true;
    for (const [name, before] of Object.entries(originalHashes)) if (await hash(path.join(labelFolder, name)) !== before) entry.originalLabelsUnchanged = false;
    entry.pass = entry.errors.length === 0 && entry.restoredCount === entry.originalCount && entry.originalLabelsUnchanged && entry.predictions.length === files.length;
    console.log(`${job.name}: ${entry.status} (${Math.round(entry.batchMs)}ms), source restored ${entry.restoredCount}, PASS=${entry.pass}`);
  } catch (error) {
    entry.pass = false;
    entry.failure = error.stack ?? String(error);
    console.log(`${job.name}: FAIL ${entry.failure}`);
  } finally { await electron.close(); }
  results.push(entry);
  await writeFile(path.join(output, "app-results.json"), JSON.stringify(results, null, 2));
}
