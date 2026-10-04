import { _electron } from "@playwright/test";
import { mkdir, copyFile, writeFile, readFile, readdir, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { randomUUID } from "node:crypto";

const output = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(output, "../..");
const jobs = JSON.parse(await readFile(path.join(root, "output/ym-yolo-inference-20261003/models.json"), "utf8")).filter((job) => job.name.startsWith("cells_"));
const cpuWorker = path.join(root, "workers", `.yolo-inference-cpu-check-${randomUUID()}.js`);
await writeFile(cpuWorker, 'Object.defineProperty(self.navigator, "gpu", { value: undefined });\nawait import("./yolo-inference-worker.js");\n');
const results = [];
try {
  for (const job of jobs) {
    const workspace = path.join(output, "workspaces", job.name);
    await mkdir(path.join(workspace, "label"), { recursive: true });
    await writeFile(path.join(workspace, "label/classes.yaml"), `names:\n  0: ${job.className}\n`);
    const files = (await readdir(job.images)).filter((name) => /\.(png|jpe?g)$/i.test(name)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).slice(0, 3);
    const originals = {};
    for (const name of files) {
      await copyFile(path.join(job.images, name), path.join(workspace, name));
      const label = name.replace(/\.[^.]+$/, ".txt");
      originals[label] = await readFile(path.join(job.labels, label), "utf8");
      await writeFile(path.join(workspace, "label", label), originals[label]);
    }
    const electron = await _electron.launch({ args: [path.join(root, "tests/e2e/fixtures/inference-electron.cjs")], env: { ...process.env, INFERENCE_TEST_ROOT: root, INFERENCE_TEST_DATASET: workspace } });
    const record = { model: job.model, name: job.name, files, modes: {}, errors: [] };
    try {
      const page = await electron.firstWindow();
      page.on("pageerror", (error) => record.errors.push(error.message));
      await page.locator("#selectImageFolderBtn").click();
      await page.locator("#activeOperationPanel").waitFor({ state: "hidden", timeout: 120000 });
      record.adapter = await page.evaluate(async () => {
        const adapter = await navigator.gpu?.requestAdapter({ powerPreference: "high-performance" });
        return adapter ? { vendor: adapter.info.vendor, architecture: adapter.info.architecture } : null;
      });
      await page.evaluate((cpuUrl) => {
        const NativeWorker = window.Worker;
        window.__gpuMeasurements = [];
        window.__forceCpu = false;
        window.Worker = class extends NativeWorker {
          constructor(url, options) {
            const yolo = String(url).includes("yolo-inference-worker.js");
            super(yolo && window.__forceCpu ? cpuUrl : url, options);
            this.yolo = yolo;
            this.starts = new Map();
            if (yolo) this.addEventListener("message", ({ data }) => {
              const start = this.starts.get(data.id);
              window.__gpuMeasurements.push({ operation: start.operation, elapsedMs: performance.now() - start.time, ...data });
            });
          }
          postMessage(message, transfer) {
            if (this.yolo) this.starts.set(message.id, { operation: message.operation, time: performance.now() });
            super.postMessage(message, transfer);
          }
        };
      }, pathToFileURL(cpuWorker).href);
      await page.locator("#taskInferenceBtn").click();
      for (const mode of ["gpu", "cpu"]) {
        await page.evaluate((cpu) => { window.__forceCpu = cpu; window.__gpuMeasurements = []; }, mode === "cpu");
        await page.locator("#inferenceModelInput").setInputFiles([]);
        await page.locator("#inferenceModelInput").setInputFiles(job.model);
        await page.locator("#runInferenceAllBtn").waitFor({ state: "visible" });
        await page.waitForFunction(() => !document.getElementById("inferenceModelInput").disabled, null, { timeout: 240000 });
        const modelStatus = await page.locator("#inferenceModelStatus").innerText();
        if (!modelStatus.includes(mode === "gpu" ? "GPU / WebGPU" : "CPU / WASM")) throw new Error(`Unexpected backend: ${modelStatus}`);
        const started = performance.now();
        await page.locator("#runInferenceAllBtn").click();
        await page.waitForFunction(() => !document.getElementById("inferenceModelInput").disabled, null, { timeout: 240000 });
        const batchMs = performance.now() - started;
        const runStatus = await page.locator("#inferenceRunStatus").innerText();
        if (!runStatus.startsWith("3 image(s)")) throw new Error(runStatus);
        const measurements = await page.evaluate(() => window.__gpuMeasurements);
        const predictions = measurements.filter((entry) => entry.operation === "INFER");
        if (predictions.some((entry) => entry.status.backend !== (mode === "gpu" ? "webgpu" : "wasm"))) throw new Error("Backend changed unexpectedly");
        record.modes[mode] = { modelStatus, runStatus, batchMs, predictions, workerMs: predictions.map((entry) => entry.elapsedMs) };
        await page.locator("#inferenceModelInput").scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(output, `${job.name}-${mode}.png`) });
        await page.locator("#labelSourceSelect").selectOption("0");
        await page.locator("#activeOperationPanel").waitFor({ state: "hidden", timeout: 120000 });
      }
      const iou = (a, b) => {
        const intersection = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
        return intersection / ((a.right - a.left) * (a.bottom - a.top) + (b.right - b.left) * (b.bottom - b.top) - intersection);
      };
      const comparisons = files.map((file, index) => {
        const gpu = record.modes.gpu.predictions[index].result;
        const cpu = record.modes.cpu.predictions[index].result;
        const available = new Set(cpu.map((_, i) => i));
        let minIou = 1;
        let maxPixelDifference = 0;
        for (const box of gpu) {
          let match = -1, overlap = -1;
          for (const i of available) if (cpu[i].classId === box.classId && iou(box, cpu[i]) > overlap) { match = i; overlap = iou(box, cpu[i]); }
          if (match < 0) { minIou = 0; break; }
          available.delete(match);
          minIou = Math.min(minIou, overlap);
          for (const axis of ["left", "top", "right", "bottom"]) maxPixelDifference = Math.max(maxPixelDifference, Math.abs(box[axis] - cpu[match][axis]));
        }
        return { file, gpuDetections: gpu.length, cpuDetections: cpu.length, minIou, maxPixelDifference, pass: gpu.length === cpu.length && minIou >= 0.99 };
      });
      record.comparisons = comparisons;
      record.originalLabelsUnchanged = true;
      for (const [name, content] of Object.entries(originals)) if (await readFile(path.join(workspace, "label", name), "utf8") !== content) record.originalLabelsUnchanged = false;
      record.pass = comparisons.every((entry) => entry.pass) && record.originalLabelsUnchanged && record.errors.length === 0;
      console.log(JSON.stringify({ name: job.name, adapter: record.adapter, comparisons, gpuMs: record.modes.gpu.workerMs, cpuMs: record.modes.cpu.workerMs, pass: record.pass }));
    } catch (error) {
      record.pass = false;
      record.failure = String(error.stack ?? error);
      console.log(record.failure);
    } finally { await electron.close(); }
    results.push(record);
    await writeFile(path.join(output, "results.json"), JSON.stringify(results, null, 2));
  }
} finally { await unlink(cpuWorker); }
if (results.some((record) => !record.pass)) process.exitCode = 1;
