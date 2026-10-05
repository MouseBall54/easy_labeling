import { _electron, expect } from "@playwright/test";
import { mkdir, copyFile, writeFile, readFile, readdir } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const output = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(output, "../..");
const executable = path.join(process.env.LOCALAPPDATA, "Programs/Easy Labeling YOLOE-26/Easy Labeling YOLOE-26.exe");
const jobs = JSON.parse(await readFile(path.join(root, "output/ym-yolo-inference-20261003/models.json"), "utf8"));
const reference = JSON.parse(await readFile(path.join(root, "output/ym-yolo-inference-20261003/reference-results.json"), "utf8"));
const hash = async (file) => createHash("sha256").update(await readFile(file)).digest("hex");
const iou = (a, b) => {
  const intersection = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  return intersection / ((a.right - a.left) * (a.bottom - a.top) + (b.right - b.left) * (b.bottom - b.top) - intersection);
};
const results = [];
for (const mode of ["gpu", "cpu"]) for (const job of jobs) {
  const workspace = path.join(root, "output/gpu-inference-20261004/workspaces", `installed-20261005-${job.name}-${mode}-${randomUUID()}`);
  await mkdir(path.join(workspace, "label"), { recursive: true });
  await mkdir(path.join(workspace, "documents"), { recursive: true });
  const classes = `names:\n  0: ${job.className}\n`;
  await writeFile(path.join(workspace, "label/classes.yaml"), classes);
  const files = (await readdir(job.images)).filter((name) => /\.(png|jpe?g|tiff?)$/i.test(name)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const originalHashes = {};
  for (const name of files) {
    const label = name.replace(/\.[^.]+$/, ".txt");
    await copyFile(path.join(job.images, name), path.join(workspace, name));
    await copyFile(path.join(job.labels, label), path.join(workspace, "label", label));
    originalHashes[label] = await hash(path.join(workspace, "label", label));
  }
  const record = { mode, name: job.name, model: job.model, modelSha256: await hash(job.model), files, workspace, errors: [], checks: {} };
  expect(record.modelSha256).toBe(job.modelSha256);
  const app = await _electron.launch({ executablePath: executable,
    args: [`--user-data-dir=${path.join(workspace, "app-profile")}`, ...(mode === "cpu" ? ["--disable-gpu", "--disable-software-rasterizer"] : [])],
    env: { ...process.env, PATH: path.join(process.env.SystemRoot, "System32"), PYTHONHOME: "C:\\missing-python", PYTHONPATH: "C:\\missing-python" } });
  try {
    const page = await app.firstWindow();
    page.setDefaultTimeout(60_000);
    page.on("pageerror", (error) => record.errors.push(error.message));
    await page.route(/^https?:/, (route) => { record.errors.push(`Unexpected request ${route.request().url()}`); return route.abort(); });
    record.installation = await app.evaluate(({ app, ipcMain }, { workspace, documents }) => {
      app.setPath("documents", documents);
      ipcMain.removeHandler("easy-labeling:pick-directory");
      ipcMain.handle("easy-labeling:pick-directory", () => workspace);
      return { version: app.getVersion(), executable: app.getPath("exe"), appPath: app.getAppPath() };
    }, { workspace, documents: path.join(workspace, "documents") });
    expect(record.installation.version).toBe("2.1.0");
    expect(record.installation.appPath).toMatch(/app\.asar$/);
    await page.evaluate(() => {
      const OriginalWorker = window.Worker;
      window.__measurements = [];
      window.Worker = class extends OriginalWorker {
        constructor(url, options) {
          super(url, options);
          this.yolo = String(url).includes("yolo-inference-worker.js");
          this.starts = new Map();
          if (this.yolo) this.addEventListener("message", ({ data }) => {
            const start = this.starts.get(data.id);
            window.__measurements.push({ ...data, operation: start.operation, elapsedMs: performance.now() - start.time });
          });
        }
        postMessage(message, transfer) {
          if (this.yolo) this.starts.set(message.id, { operation: message.operation, time: performance.now() });
          super.postMessage(message, transfer);
        }
      };
    });
    const count = () => page.evaluate(() => window.__easyLabelingTestApi.getRectCount());
    const originalCount = (await readFile(path.join(workspace, "label", files[0].replace(/\.[^.]+$/, ".txt")), "utf8")).trim().split(/\r?\n/).filter(Boolean).length;
    await page.locator("#selectImageFolderBtn").click();
    await expect.poll(count).toBe(originalCount);
    await expect(page.locator("#activeOperationPanel")).toBeHidden();
    await page.locator("#taskInferenceBtn").click();
    const loadStart = performance.now();
    await page.locator("#inferenceModelInput").setInputFiles(job.model);
    await expect(page.locator("#runInferenceAllBtn")).toBeEnabled({ timeout: 240_000 });
    record.modelLoadMs = performance.now() - loadStart;
    await expect(page.locator("#inferenceBackendBadge")).toHaveText(mode === "gpu" ? "GPU · WebGPU" : "CPU · WASM");
    record.modelStatus = await page.locator("#inferenceModelStatus").innerText();
    await expect(page.locator("#inferenceModelName")).toHaveText("best.onnx");
    expect(record.modelStatus).toContain(`${job.inputs[0].shape[1]}ch`);
    await page.locator("#autoSaveToggle").check();
    const started = performance.now();
    await page.locator("#runInferenceAllBtn").click();
    await expect(page.locator("#runInferenceAllBtn")).toBeEnabled({ timeout: 600_000 });
    record.batchMs = performance.now() - started;
    record.runStatus = await page.locator("#inferenceRunStatus").innerText();
    expect(record.runStatus).toMatch(new RegExp(`^${files.length} image\\(s\\)`));
    record.predictions = (await page.evaluate(() => window.__measurements)).filter((measurement) => measurement.operation === "INFER");
    expect(record.predictions).toHaveLength(files.length);
    expect(record.predictions.every((prediction) => prediction.status.backend === (mode === "gpu" ? "webgpu" : "wasm"))).toBe(true);
    const folder = path.join(workspace, "inference-best");
    record.manifest = JSON.parse(await readFile(path.join(folder, "inference.json"), "utf8"));
    record.comparisons = [];
    for (let index = 0; index < files.length; index++) {
      const actual = record.predictions[index].result;
      const expected = reference.find((item) => item.name === job.name).predictions.find((item) => item.image === files[index]).result;
      const available = new Set(expected.map((_, i) => i));
      let minIou = 1;
      for (const box of actual) {
        let match = -1, overlap = -1;
        for (const i of available) if (expected[i].classId === box.classId && iou(box, expected[i]) > overlap) { match = i; overlap = iou(box, expected[i]); }
        expect(match).toBeGreaterThanOrEqual(0);
        available.delete(match);
        minIou = Math.min(minIou, overlap);
      }
      expect(actual).toHaveLength(expected.length);
      expect(minIou).toBeGreaterThanOrEqual(0.99);
      const labels = (await readFile(path.join(folder, files[index].replace(/\.[^.]+$/, ".txt")), "utf8")).trim().split(/\r?\n/).filter(Boolean);
      expect(labels).toHaveLength(actual.length);
      for (const label of labels) expect(label.trim().split(/\s+/).map(Number).every(Number.isFinite)).toBe(true);
      record.comparisons.push({ image: files[index], detections: actual.length, referenceDetections: expected.length, minIou });
    }
    await expect.poll(count).toBe(record.predictions[0].result.length);
    await page.screenshot({ path: path.join(output, `${job.name}-${mode}.png`) });
    if (job.name.startsWith("cells_")) {
      await page.locator("#runInferenceCurrentBtn").click();
      await expect(page.locator("#runInferenceCurrentBtn")).toBeEnabled();
      expect((await readdir(workspace)).filter((name) => name.startsWith("inference-"))).toEqual(["inference-best"]);
      record.checks.currentImageAndFolderReuse = true;
    }
    await page.locator("#labelSourceSelect").selectOption("0");
    await expect.poll(count).toBe(originalCount);
    for (const [name, before] of Object.entries(originalHashes)) expect(await hash(path.join(workspace, "label", name))).toBe(before);
    record.checks.originalLabelsPreservedAndRestored = true;
    expect(record.errors).toEqual([]);
    record.pass = true;
    console.log(JSON.stringify({ name: job.name, mode, images: files.length, detections: record.comparisons.reduce((sum, item) => sum + item.detections, 0), batchMs: record.batchMs, minIou: Math.min(...record.comparisons.map((item) => item.minIou)), pass: true }));
  } catch (error) {
    record.pass = false;
    record.failure = String(error.stack ?? error);
    console.log(record.failure);
  } finally { await app.close(); }
  results.push(record);
  await writeFile(path.join(output, "results.json"), JSON.stringify(results, null, 2));
}
if (results.some((record) => !record.pass)) process.exitCode = 1;
