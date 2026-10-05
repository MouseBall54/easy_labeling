import { _electron, expect } from "@playwright/test";
import { mkdir, readFile, writeFile, readdir, copyFile } from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { encodeSegmentationMaskPng, decodeSegmentationMaskPng } from "../dist/domain/annotations/segmentation-codec.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const installedExecutable = path.resolve(process.argv[2] ?? "release/yoloe26/win-unpacked/Easy Labeling YOLOE-26.exe");
const cpu = process.env.YOLOE_TEST_CPU === "1";
let status = null;
let model = cpu ? "yoloe-26n-seg" : "yoloe-26s-seg";
const output = path.join(root, `output/yoloe-onnx-validation${cpu ? "/cpu" : ""}`);
const dataset = path.join(output, "workspace");
await mkdir(path.join(dataset, "label"), { recursive: true });
for (const file of ["0-reference.png", "1-target-gray.png", "2-target-rgb.png"]) {
  await copyFile(path.join(root, "tests/e2e/fixtures/yoloe-visual", file), path.join(dataset, file));
}
const originals = {
  "0-reference.txt": "5 0.18209877 0.60185185 0.24074074 0.46296296\n12 0.49629630 0.45370370 0.94320988 0.46296296\n",
  "1-target-gray.txt": "5 0.18209877 0.60185185 0.24074074 0.46296296\n",
  "2-target-rgb.txt": "5 0.4 0.6 0.4 0.5\n"
};
for (const [name, labels] of Object.entries(originals)) await writeFile(path.join(dataset, "label", name), labels);
const classes = 'names:\n  5: "person"\n  12: "bus"\n';
await writeFile(path.join(dataset, "label/classes.yaml"), classes);
await mkdir(path.join(dataset, "profiles/class-info"), { recursive: true });
await writeFile(path.join(dataset, "profiles/class-info/classes.yaml"), classes);
await mkdir(path.join(dataset, "mask"), { recursive: true });
const originalMasks = new Map();
for (const name of Object.keys(originals)) {
  const image = await readFile(path.join(dataset, name.replace(".txt", ".png")));
  const width = image.readUInt32BE(16), height = image.readUInt32BE(20), mask = new Uint16Array(width * height);
  for (let y = 30; y < 40; y++) mask.fill(5, y * width + 30, y * width + 40);
  const bytes = await encodeSegmentationMaskPng({ width, height, mask });
  originalMasks.set(name.replace(".txt", ".png"), bytes);
  await writeFile(path.join(dataset, "mask", name.replace(".txt", ".png")), bytes);
}
const app = await _electron.launch({ ...(installedExecutable ? {
  executablePath: installedExecutable, args: [`--user-data-dir=${path.join(output, "app-profile")}`,
    ...(cpu ? ["--disable-gpu", "--disable-software-rasterizer"] : [])]
} : { args: [path.join(root, "tests/e2e/fixtures/inference-electron.cjs")] }),
  env: { ...process.env, INFERENCE_TEST_ROOT: root, INFERENCE_TEST_DATASET: dataset,
    ...(installedExecutable ? { PATH: path.join(process.env.SystemRoot, "System32"),
      PYTHONHOME: "C:\\missing-python-home", PYTHONPATH: "C:\\missing-python-packages" } : {}) } });
const evidence = { runtime: status, model, checks: {}, images: [], errors: [] };
try {
  const page = await app.firstWindow();
  page.setDefaultTimeout(30_000);
  page.on("pageerror", (error) => evidence.errors.push(error.message));
  if (installedExecutable) {
    evidence.installation = await app.evaluate(({ app, BrowserWindow, ipcMain }, options) => {
      app.setPath("documents", options.documents);
      for (const window of BrowserWindow.getAllWindows()) window.showInactive();
      // Replace only the native directory dialog; use the installed main, preload, IPC and resources.
      ipcMain.removeHandler("easy-labeling:pick-directory");
      ipcMain.handle("easy-labeling:pick-directory", () => options.dataset);
      return { name: app.getName(), version: app.getVersion(), appPath: app.getAppPath(),
        executable: app.getPath("exe"), userData: app.getPath("userData") };
    }, { dataset, documents: path.join(output, "documents") });
    expect(evidence.installation.executable).toBe(installedExecutable);
    expect(evidence.installation.appPath).toMatch(/app\.asar$/);
    expect(evidence.installation.version).toBe("2.1.0");
    const resources = await readdir(path.join(path.dirname(installedExecutable), "resources"), { recursive: true });
    expect(resources.some((file) => /(^|[/\\])python(\.exe)?$/i.test(file) || file.endsWith(".pt"))).toBe(false);
    evidence.checks.noPythonOrPtInInstallation = true;
    expect(page.url()).toContain("/resources/app.asar/index.html");
    await page.route(/^https?:/, (route) => { evidence.errors.push(`Network request: ${route.request().url()}`); return route.abort(); });
    await page.evaluate(() => {
      const OriginalWorker = window.Worker;
      window.Worker = class extends OriginalWorker {
        constructor(...args) {
          super(...args);
          if (String(args[0]).includes("yoloe-inference-worker")) this.addEventListener("message", ({ data }) => {
            if (data.result?.detections) { window.__yoloeLastResult = data.result; window.__yoloeSequence = (window.__yoloeSequence ?? 0) + 1; }
            if (data.result?.engine === "onnx" && data.result.id) window.__yoloeProfile = data.result;
          });
        }
      };
    });
    await page.locator("#taskYoloeBtn").click();
    await expect(page.locator("#yoloeBackendBadge")).toHaveText(cpu ? "CPU" : "GPU · WebGPU", { timeout: 60_000 });
    status = await page.evaluate(async () => (await import("./dist/features/inference/yoloe.js")).requestYoloe("status"));
    expect(status.models).toEqual(["yoloe-26n-seg", "yoloe-26s-seg", "yoloe-26m-seg", "yoloe-26l-seg"]);
    model = status.cuda ? "yoloe-26s-seg" : "yoloe-26n-seg";
    evidence.runtime = status;
    evidence.model = model;
    evidence.checks.onnxWithoutPythonOrService = true;
    await page.locator("#emptyLoadSampleBtn").click();
    await expect(page.locator("#imageCountBadge")).toHaveText("17", { timeout: 60_000 });
    const annotations = JSON.parse(await readFile(path.join(path.dirname(installedExecutable),
      "resources/app.asar.unpacked/assets/sample/annotations.json"), "utf8"));
    for (const image of annotations.images) {
      await page.locator(`#image-list [data-file-name="${image.file}"]`).click();
      await expect.poll(() => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getRectCount()))
        .toBe(image.objects.length);
    }
    await page.screenshot({ path: path.join(output, "installed-sample-boxes.png") });
    await page.locator('label[for="segmentationWorkflowTab"]').click();
    for (const image of annotations.images) {
      await page.locator(`#image-list [data-file-name="${image.file}"]`).click();
      const boxes = image.objects.map((object) => object.box);
      const left = Math.min(...boxes.map(([x]) => x)), top = Math.min(...boxes.map(([, y]) => y));
      const right = Math.max(...boxes.map(([x, , w]) => x + w - 1)), bottom = Math.max(...boxes.map(([, y, , h]) => y + h - 1));
      await expect.poll(() => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getSegmentationMaskBounds()))
        .toEqual({ left, top, right, bottom, width: right - left + 1, height: bottom - top + 1 });
    }
    await page.screenshot({ path: path.join(output, "installed-sample-masks.png") });
    evidence.checks.bundledSamplesBothModes = annotations.images.length;
    console.log("Installed sample boxes and masks: 17/17 PASS");
    await page.locator('label[for="detectionWorkflowTab"]').click();
    const classDirectory = path.join(output, "documents/Easy Labeling/Class Info");
    await mkdir(classDirectory, { recursive: true });
    await writeFile(path.join(classDirectory, "classes.yaml"), classes);
  }
  const theme = async (dark) => {
    if (await page.locator("#darkModeToggle").isChecked() !== dark) await page.locator('label[for="darkModeToggle"]').click();
    await expect.poll(() => page.evaluate(() => document.body.classList.contains("dark-mode"))).toBe(dark);
    await page.locator("#yoloeOutputBadge").scrollIntoViewIfNeeded();
  };
  await page.locator("#selectImageFolderBtn").click();
  await expect(page.locator("#activeOperationPanel")).toBeHidden({ timeout: 60_000 });
  await expect(page.locator("#imageCountBadge")).toHaveText("3");
  const count = () => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi")?.getRectCount?.());
  const predictionAfter = async (action) => {
    const sequence = await page.evaluate(() => window.__yoloeSequence ?? 0);
    await action();
    await expect.poll(() => page.evaluate(() => window.__yoloeSequence ?? 0), { timeout: 120_000 }).toBeGreaterThan(sequence);
    return page.evaluate(() => window.__yoloeLastResult);
  };
  const verifyPopup = async (workflow) => {
    await page.locator("#yoloeReferenceSelect").selectOption("1-target-gray.png");
    await expect(page.locator("#yoloeReferenceSelect")).toBeEnabled();
    const canvas = page.locator("#yoloePreviewCanvas");
    const rect = await canvas.boundingBox();
    const beforeZoom = await page.locator("#yoloeSampleZoom").textContent();
    await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
    await page.keyboard.down("Control"); await page.mouse.wheel(0, -300); await page.keyboard.up("Control");
    await expect(page.locator("#yoloeSampleZoom")).not.toHaveText(beforeZoom);
    await page.mouse.down({ button: "middle" }); await page.mouse.move(rect.x + rect.width / 2 + 30, rect.y + rect.height / 2 + 20); await page.mouse.up({ button: "middle" });
    const prediction = await predictionAfter(() => page.locator("#previewYoloeSampleBtn").click());
    expect(prediction.detections.length).toBeGreaterThan(0);
    if (workflow === "segmentation") { expect(prediction.mask.width).toBe(810); expect(prediction.mask.height).toBe(1080); }
    await expect(page.locator("#yoloeSetupStatus")).toContainText("1-target-gray.png · labels unchanged");
    await expect(page.locator("#current-image-name")).toHaveText("0-reference.png");
    const resultPixels = await canvas.evaluate((canvas) => canvas.toDataURL());
    await page.locator("#yoloeShowSampleResults").uncheck();
    expect(await canvas.evaluate((canvas) => canvas.toDataURL())).not.toBe(resultPixels);
    await page.locator("#yoloeShowSampleResults").check();
    expect(await canvas.evaluate((canvas) => canvas.toDataURL())).toBe(resultPixels);
    await page.screenshot({ path: path.join(output, `popup-${workflow}-preview.png`) });
    evidence.checks[`popup${workflow}ZoomPanPreview`] = true;
    await page.locator("#yoloeReferenceSelect").selectOption("0-reference.png");
    await expect(page.locator("#yoloeReferenceSelect")).toBeEnabled();
  };
  await expect.poll(count).toBe(2);
  await page.locator("#taskYoloeBtn").click();
  await page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi")?.selectRectsByIndex?.([0, 1]));
  await page.locator("#openYoloeSetupBtn").click();
  await expect(page.locator("#yoloeSampleStage > #yoloePreviewCanvas")).toBeVisible();
  await expect(page.locator("#yoloeBackendBadge")).toHaveText(status.cuda ? "GPU · WebGPU" : "CPU");
  await expect(page.locator("#yoloeModelSelect")).toBeEnabled();
  await expect(page.locator("#yoloeModelSelect")).toHaveValue(model);
  if (installedExecutable) {
    await expect(page.locator(".yoloe-setup-commands")).toContainText("No Python or separate setup");
    await page.locator("#yoloeModelSelect").selectOption("yoloe-26m-seg");
    await expect(page.locator("#yoloeRunStatus")).toBeHidden();
    await page.locator("#yoloeModelSelect").selectOption(model);
    evidence.checks.installedSetupCommands = true;
  }
  await page.locator("#yoloeProfileName").fill("acceptance_v1");
  await page.locator("#addYoloeSelectedBtn").click();
  await verifyPopup("detection");
  expect(await count()).toBe(2);
  await page.locator("#yoloeSetupModal").getByRole("button", { name: "Done", exact: true }).click();
  await expect(page.locator("#yoloeSetupModal")).toBeHidden();
  await expect(page.locator("#yoloeExampleList > div")).toHaveCount(2, { timeout: 120_000 });
  await page.locator("#nextImageBtn").click();
  await expect.poll(count).toBe(1);
  const preview = await predictionAfter(() => page.locator("#previewYoloeBtn").click());
  expect(preview.detections.length).toBeGreaterThan(0);
  await expect(page.locator("#yoloePreviewCanvas")).toBeVisible();
  await expect.poll(count).toBe(1);
  evidence.checks.previewPreservedSource = true;
  evidence.preview = preview;
  await expect(page.locator("#activeOperationPanel")).toBeHidden();
  await theme(false);
  await page.screenshot({ path: path.join(output, "preview-light.png") });
  await theme(true);
  await page.screenshot({ path: path.join(output, "preview-dark.png") });
  await page.locator("#autoSaveToggle").check();
  await page.locator("#yoloeSaveScope").selectOption("all");
  await page.locator("#saveYoloeCurrentBtn").click();
  await page.locator("#yoloeSaveScope").selectOption("current");
  await expect(page.locator("#yoloeRunStatus")).toContainText("3 image(s)", { timeout: 120_000 });
  const results = path.join(dataset, `inference-${model}-acceptance_v1`);
  const metadata = JSON.parse(await readFile(path.join(results, "inference.json"), "utf8"));
  expect(metadata).toMatchObject({ engine: "yoloe26", backend: status.cuda ? "webgpu" : "cpu", exampleCount: 2, checkpoint: `${model}.onnx` });
  evidence.metadata = metadata;
  for (const name of Object.keys(originals)) {
    const label = await readFile(path.join(results, name), "utf8");
    const rows = label.trim().split("\n").filter(Boolean);
    for (const row of rows) { const numbers = row.split(/\s+/).map(Number); expect([5, 12]).toContain(numbers[0]); expect(numbers.slice(1).every((x) => Number.isFinite(x) && x >= 0 && x <= 1)).toBe(true); }
    evidence.images.push({ name, detections: rows.length });
    expect(await readFile(path.join(dataset, "label", name), "utf8")).toBe(originals[name]);
  }
  await expect(page.locator("#yoloePreviewCanvas")).toBeHidden();
  await page.locator("#labelSourceSelect").selectOption("0");
  await expect.poll(count).toBe(1);
  await page.locator("#nextImageBtn").click();
  await expect.poll(count).toBe(1);
  await page.locator("#saveYoloeCurrentBtn").click();
  await expect(page.locator("#yoloeRunStatus")).toContainText("1 image(s)", { timeout: 60_000 });
  await expect(page.locator("#labelSourceSelect option")).toHaveCount(2);
  evidence.checks.stableFolderAndSourceRestoration = true;
  await page.locator("#taskReviewBtn").click();
  await expect(page.locator("#detectionReviewWorkspace")).toBeVisible();
  evidence.checks.review = true;
  // Repeat through the standalone tab in Segmentation, using temporary example boxes.
  await page.locator("#labelSourceSelect").selectOption("0");
  await page.locator("#prevImageBtn").click();
  await expect(page.locator("#current-image-name")).toHaveText("1-target-gray.png");
  await expect(page.locator("#activeOperationPanel")).toBeHidden();
  await page.locator("#prevImageBtn").click();
  await expect(page.locator("#current-image-name")).toHaveText("0-reference.png");
  await expect(page.locator("#activeOperationPanel")).toBeHidden();
  await expect.poll(count).toBe(2);
  await page.locator('label[for="segmentationWorkflowTab"]').click();
  await page.locator("#taskYoloeBtn").click();
  await expect(page.locator("#yoloeOutputBadge")).toHaveText("Segmentation · Masks");
  await expect(page.locator("#taskYoloeBtn")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#previewYoloeBtn")).toBeDisabled();
  await page.locator("#openYoloeSetupBtn").click();
  await expect(page.locator("#yoloeSampleStage > #yoloePreviewCanvas")).toBeVisible();
  await page.locator("#yoloeProfileName").fill("acceptance_v1");

  const maskBounds = () => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi")?.getSegmentationMaskBounds?.());
  const sourceBounds = await maskBounds();
  const drawExample = async (name, polygon) => {
    await page.locator("#yoloeSampleName").scrollIntoViewIfNeeded();
    await page.locator("#yoloeSampleName").fill(name);
    await page.locator("#drawYoloeExampleBtn").scrollIntoViewIfNeeded();
    await expect(page.locator("#drawYoloeExampleBtn")).toBeEnabled();
    await page.locator("#drawYoloeExampleBtn").click();
    const points = await page.evaluate((polygon) => {
      const overlay = document.querySelector("#yoloePreviewCanvas"), bounds = overlay.getBoundingClientRect();
      const width = Number(overlay.dataset.referenceWidth), height = Number(overlay.dataset.referenceHeight);
      const a = Math.min(overlay.width / width, overlay.height / height), d = a, b = 0, c = 0;
      const tx = (overlay.width - width * a) / 2, ty = (overlay.height - height * a) / 2;
      return polygon.map(([x, y]) => ({ x: bounds.left + (a * x + c * y + tx) * bounds.width / overlay.width, y: bounds.top + (b * x + d * y + ty) * bounds.height / overlay.height }));
    }, polygon);
    for (const point of points) await page.mouse.click(point.x, point.y);
    await page.keyboard.press("Enter");
  };
  await drawExample("person", [[90, 400], [185, 400], [245, 900], [50, 900]]);
  await drawExample("bus", [[30, 250], [775, 240], [785, 700], [30, 740]]);
  await expect(page.locator("#yoloeExampleList > div")).toHaveCount(2);
  expect(await maskBounds()).toEqual(sourceBounds);
  await verifyPopup("segmentation");
  expect(await maskBounds()).toEqual(sourceBounds);
  await page.locator("#yoloeSetupModal").getByRole("button", { name: "Done", exact: true }).click();
  await expect(page.locator("#yoloeSetupModal")).toBeHidden();
  await expect(page.locator("#previewYoloeBtn")).toBeEnabled({ timeout: 120_000 });
  await page.locator("#nextImageBtn").click();
  const targetSourceBounds = await maskBounds();
  const maskPreview = await predictionAfter(() => page.locator("#previewYoloeBtn").click());
  expect(maskPreview.mask.width).toBe(810); expect(maskPreview.mask.height).toBe(1080);
  await expect(page.locator("#yoloePreviewCanvas")).toBeVisible();
  expect(await maskBounds()).toEqual(targetSourceBounds);
  await expect(page.locator("#activeOperationPanel")).toBeHidden();
  await theme(true);
  await page.screenshot({ path: path.join(output, "mask-preview-dark.png") });
  await theme(false);
  await page.screenshot({ path: path.join(output, "mask-preview-light.png") });
  await page.locator("#yoloeSaveScope").selectOption("all");
  await page.locator("#saveYoloeCurrentBtn").click();
  await page.locator("#yoloeSaveScope").selectOption("current");
  await expect(page.locator("#yoloeRunStatus")).toContainText("3 image(s)", { timeout: 120_000 });
  const maskResults = path.join(dataset, `inference-${model}-acceptance_v1-masks`);
  const maskMetadata = JSON.parse(await readFile(path.join(maskResults, "inference.json"), "utf8"));
  expect(maskMetadata).toMatchObject({ workflow: "segmentation", maskFormat: "png-semantic-mask", overlapPolicy: "highest-confidence" });
  const masks = [];
  for (const [name, original] of originalMasks) {
    expect(Buffer.compare(await readFile(path.join(dataset, "mask", name)), Buffer.from(original))).toBe(0);
    const decoded = await decodeSegmentationMaskPng(await readFile(path.join(maskResults, "mask", name)));
    const counts = {};
    for (const id of decoded.mask) counts[id] = (counts[id] ?? 0) + 1;
    expect(Object.keys(counts).every((id) => [0, 5, 12].includes(Number(id)))).toBe(true);
    masks.push({ name, width: decoded.width, height: decoded.height, pixelsByClass: counts });
  }
  // A new target image can legitimately contain no matches, particularly with the smaller n model.
  expect(masks.some(({ pixelsByClass }) => Object.entries(pixelsByClass).some(([id, count]) => Number(id) > 0 && count > 0))).toBe(true);
  expect(await maskBounds()).not.toEqual(targetSourceBounds);
  await page.locator("#labelSourceSelect").selectOption("0");
  await expect.poll(maskBounds).toEqual(targetSourceBounds);
  await page.locator("#labelSourceSelect").selectOption("1");
  await expect.poll(maskBounds).not.toEqual(targetSourceBounds);
  await page.locator("#saveYoloeCurrentBtn").click();
  await expect(page.locator("#yoloeRunStatus")).toContainText("1 image(s)", { timeout: 60_000 });
  await expect(page.locator("#labelSourceSelect option")).toHaveCount(2);
  await page.locator("#refreshDatasetBtn").click();
  await expect(page.locator("#activeOperationPanel")).toBeHidden({ timeout: 60_000 });
  await expect(page.locator("#imageCountBadge")).toHaveText("3");
  await expect(page.locator("#labelSourceSelect")).toHaveValue("1");
  await expect.poll(maskBounds).not.toEqual(targetSourceBounds);
  const classAt = () => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getSegmentationClassAtPoint(10, 200));
  const previousClass = await classAt();
  await page.locator("#autoSaveToggle").uncheck();
  await page.locator('.segmentation-paint-class-button[data-class-id="5"]').click();
  await page.locator("#segmentationBrushModeBtn").click();
  const point = await page.evaluate(() => {
    const bounds = [...document.querySelectorAll(".upper-canvas")].map((canvas) => canvas.getBoundingClientRect()).find((bounds) => bounds.width > 0 && bounds.height > 0);
    const [a, b, c, d, tx, ty] = Reflect.get(window, "__easyLabelingTestApi").getCanvasViewportTransform();
    return { x: bounds.left + a * 10 + c * 200 + tx, y: bounds.top + b * 10 + d * 200 + ty };
  });
  await page.mouse.move(point.x, point.y); await page.mouse.down();
  await page.mouse.move(point.x + 4, point.y + 4, { steps: 3 }); await page.mouse.up();
  await expect.poll(classAt).toBe("5");
  await page.locator("#undoBtn").click();
  await expect.poll(classAt).toBe(previousClass);
  await page.locator("#redoBtn").click();
  await expect.poll(classAt).toBe("5");
  await page.locator("#saveLabelsBtn").click();
  await expect.poll(async () => {
    try {
      const edited = await decodeSegmentationMaskPng(await readFile(path.join(maskResults, "mask/1-target-gray.png")));
      return edited.mask[200 * edited.width + 10];
    } catch { return null; } // File handles truncate before the async PNG write finishes.
  }).toBe(5);
  for (const [name, original] of originalMasks) expect(Buffer.compare(await readFile(path.join(dataset, "mask", name)), Buffer.from(original))).toBe(0);
  evidence.segmentation = { checks: { standaloneTab: true, polygonMaskPrompts: true, drawnExamplesPreservedSource: true, previewPreservedSource: true, fullResolutionMasks: true, originalFilesPreserved: true, sourceSwitchAndRefresh: true, stableFolder: true, brushUndoRedoAndSave: true }, masks, metadata: maskMetadata, previewInstances: maskPreview.detections.length };
  expect(evidence.errors).toEqual([]);
  const childInfo = execFileSync(path.join(process.env.SystemRoot, "System32/WindowsPowerShell/v1.0/powershell.exe"), ["-NoProfile", "-Command",
    `$items=Get-CimInstance Win32_Process; $parents=@(${app.process().pid}); $found=@(); do { $next=@($items | Where-Object { $_.ParentProcessId -in $parents -and $_.ProcessId -notin $parents }); $found += $next; $parents=@($next | ForEach-Object { $_.ProcessId }) } while ($parents.Count); ConvertTo-Json -InputObject @($found | Select-Object Name,ProcessId,ParentProcessId) -Compress`], { encoding: "utf8", windowsHide: true, timeout: 10_000 });
  evidence.childProcesses = JSON.parse(childInfo);
  expect(evidence.childProcesses.some((process) => /python|^uv\.exe$/i.test(process.Name))).toBe(false);
  evidence.checks.noPythonChildProcess = true;
  await writeFile(path.join(output, "results.json"), JSON.stringify(evidence, null, 2) + "\n");
  console.log(JSON.stringify({ checks: evidence.checks, images: evidence.images, segmentation: evidence.segmentation, gpu: status.gpu }, null, 2));
} catch (error) {
  evidence.failure = String(error);
  const page = await app.firstWindow();
  evidence.failureUi = await page.evaluate(() => ({
    image: document.querySelector("#current-image-name")?.textContent,
    status: document.querySelector("#yoloeRunStatus")?.textContent,
    setup: document.querySelector("#yoloeSetupStatus")?.textContent
  }));
  await page.screenshot({ path: path.join(output, "failure.png") });
  await writeFile(path.join(output, "results.json"), JSON.stringify(evidence, null, 2) + "\n");
  throw error;
} finally {
  await app.close();
}
