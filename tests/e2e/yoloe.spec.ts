import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";

async function openSetup(page: Page): Promise<void> {
  if (!await page.locator("#yoloeSetupModal").isVisible()) await page.locator("#openYoloeSetupBtn").click();
  await expect(page.locator("#yoloeSetupModal")).toBeVisible();
  await expect(page.locator("#yoloeSampleStage > #yoloePreviewCanvas")).toBeVisible();
}

async function closeSetup(page: Page): Promise<void> {
  await page.locator("#closeYoloeSetupBtn").click();
  await expect(page.locator("#yoloeSetupModal")).toBeHidden();
  await expect(page.locator("#openYoloeSetupBtn")).toBeFocused();
}

async function outline(page: Page, points = [[100, 200], [150, 200], [100, 250]]): Promise<void> {
  await expect(page.locator("#loading-overlay")).toBeHidden();
  await openSetup(page);
  await page.locator("#drawYoloeExampleBtn").click();
  await expect(page.locator("#yoloeDrawingToolbar")).toBeVisible();
  await expect(page.locator("#yoloeDrawingTitle")).toContainText("Sample outline");
  await expect(page.locator("#yoloeCanvasDrawingHint")).toContainText("0 points");
  await expect(page.locator("#yoloeSampleStage > #yoloePreviewCanvas")).toBeVisible();
  await expect(page.locator("#yoloePreviewCanvas")).toBeFocused();
  await expect(page.locator("#drawYoloeExampleBtn")).toHaveClass(/btn-primary/);
  const screen = await page.evaluate((points) => {
    const overlay = document.querySelector<HTMLCanvasElement>("#yoloePreviewCanvas")!, rect = overlay.getBoundingClientRect();
    const width = Number(overlay.dataset.referenceWidth), height = Number(overlay.dataset.referenceHeight);
    const a = Math.min(overlay.width / width, overlay.height / height), d = a, b = 0, c = 0;
    const tx = (overlay.width - width * a) / 2, ty = (overlay.height - height * a) / 2;
    return points.map(([x, y]) => ({ x: rect.left + (a * x! + c * y! + tx) * rect.width / overlay.width, y: rect.top + (b * x! + d * y! + ty) * rect.height / overlay.height }));
  }, points);
  expect(await page.evaluate((screen) => screen.map((p) => ({ ...p, target: document.elementFromPoint(p.x, p.y)?.id })), screen)).toEqual(screen.map((p) => ({ ...p, target: "yoloePreviewCanvas" })));
  for (const point of screen) await page.mouse.click(point.x, point.y);
  await expect(page.locator("#yoloeCanvasDrawingHint")).toContainText(`${points.length} points`);
  await expect(page.locator("#finishYoloeSampleBtn")).toBeEnabled();
  await page.keyboard.press("Enter");
  await expect(page.locator("#yoloeDrawingToolbar")).toBeHidden();
}

for (const workflow of ["detection", "segmentation"] as const) test(`multiple existing labels and persistent presets run all images with progress for ${workflow}`, async ({ page }) => {
  test.setTimeout(120_000);
  let prepared: { references: { examples: { mask?: { runs: number[] }; classId: number }[] }[]; imgsz: number } | null = null;
  let inferred = 0;
  await page.route("http://127.0.0.1:8766/**", async (route) => {
    if (route.request().url().endsWith("/status")) return route.fulfill({ json: { version: 5, cuda: true, gpu: "Test GPU", models: ["yoloe-26s-seg"] } });
    const data = route.request().postDataJSON();
    if (route.request().url().endsWith("/prepare")) {
      prepared = data;
      return route.fulfill({ json: { id: "saved", model: data.model, workflow, classes: { "1": "Light / White" }, imgsz: data.imgsz, exampleCount: 3, backend: "cuda", gpu: "Test GPU" } });
    }
    inferred++;
    await new Promise((resolve) => setTimeout(resolve, 200));
    const png = Buffer.from(data.image.split(",")[1], "base64"), width = png.readUInt32BE(16), height = png.readUInt32BE(20);
    return route.fulfill({ json: { backend: "cuda", detections: [{ classId: 1, confidence: 0.9, left: 0, top: 0, right: 10, bottom: 1 }],
      ...(workflow === "segmentation" ? { mask: { width, height, runs: [1, 10, 0, width * height - 10] } } : {}) } });
  });
  const start = async () => {
    await page.goto("/index.html?yoloe=python"); await page.locator("#emptyLoadSampleBtn").click();
    await expect(page.locator("#workspaceStandbyPanel")).toBeHidden({ timeout: 30_000 });
    if (workflow === "segmentation") await page.locator('label[for="segmentationWorkflowTab"]').click();
    await page.locator("#taskYoloeBtn").click(); await openSetup(page);
    await expect(page.locator("#yoloePresetSelect")).toBeEnabled();
  };
  await start();
  await expect(page.locator("#yoloeDeviceInfo")).toHaveText("Test GPU");
  const original = await page.evaluate((workflow) => workflow === "detection" ? Reflect.get(window, "__easyLabelingTestApi").getRectCount() : Reflect.get(window, "__easyLabelingTestApi").getSegmentationMaskBounds(), workflow);
  await page.locator("#yoloeExistingBoxSelect").selectOption(["0", "1"]); await page.locator("#addYoloeExistingBtn").click();
  await expect(page.locator("#yoloeExampleList > div")).toHaveCount(2);
  await page.locator("#yoloeReferenceSelect").selectOption("sample_2.jpg");
  await expect(page.locator("#yoloeReferenceSelect")).toBeEnabled();
  await page.locator("#yoloeExistingBoxSelect").selectOption("0"); await page.locator("#addYoloeExistingBtn").click();
  await expect(page.locator("#yoloeExampleList > div")).toHaveCount(3);
  await page.locator("#yoloeProfileName").fill("saved_parts"); await page.locator("#yoloeImageSize").selectOption("2048");
  await page.locator("#yoloeConfidenceInput").fill("0.35"); await page.locator("#yoloePromptShape").selectOption("brush");
  await page.locator("#yoloeAutoFillClosedRegionToggle").check();
  await page.locator("#saveYoloePresetBtn").click(); await expect(page.locator("#yoloeSetupStatus")).toContainText("Saved");
  await expect(page.locator("#yoloePresetSelect option")).toHaveCount(2);
  const downloadEvent = page.waitForEvent("download"); await page.locator("#saveYoloePresetAsBtn").click();
  const downloaded = await downloadEvent;
  const saved = JSON.parse(await readFile((await downloaded.path())!, "utf8"));
  expect(saved.references).toHaveLength(2);
  expect(saved.references.flatMap((r: { examples: unknown[] }) => r.examples)).toHaveLength(3);
  expect(saved.settings).toMatchObject({ imgsz: 2048, confidence: 0.35, shape: "brush", autoFill: true });
  if (workflow === "segmentation") for (const r of saved.references) for (const e of r.examples) expect(e.mask.runs.length).toBeGreaterThan(0);
  await start();
  await expect(page.locator("#yoloePresetSelect option")).toHaveCount(2);
  await page.locator("#yoloePresetSelect").selectOption(`saved_parts-${workflow}.yoloe.json`);
  await expect(page.locator("#yoloeSetupStatus")).toContainText("Loaded");
  await expect(page.locator("#yoloeExampleList > div")).toHaveCount(3);
  await expect(page.locator("#yoloeImageSize")).toHaveValue("2048");
  await expect(page.locator("#yoloeConfidenceInput")).toHaveValue("0.35");
  await expect(page.locator("#yoloeAutoFillClosedRegionToggle")).toBeChecked();
  await page.locator("#yoloePresetFileInput").setInputFiles({ name: "invalid.json", mimeType: "application/json", buffer: Buffer.from('{"version":9}') });
  await expect(page.locator("#yoloeSetupStatus")).toContainText("Invalid");
  await expect(page.locator("#yoloeExampleList > div")).toHaveCount(3);
  await closeSetup(page); await page.locator("#yoloeSaveScope").selectOption("all");
  await expect(page.locator("#saveYoloeCurrentBtn")).toHaveText("Run & save results");
  await page.locator("#saveYoloeCurrentBtn").click();
  await expect(page.locator("#yoloeRunStatus")).toContainText(/Running · [1-9]+\/17 · \d+%/);
  await expect(page.locator("#yoloeRunStatus")).toContainText("17 image(s)", { timeout: 60_000 });
  expect(inferred).toBe(17);
  expect(prepared).toMatchObject({ imgsz: 2048 });
  expect((prepared as unknown as { references: unknown[] }).references).toHaveLength(2);
  await page.locator("#labelSourceSelect").selectOption("0");
  await expect.poll(() => page.evaluate((workflow) => workflow === "detection" ? Reflect.get(window, "__easyLabelingTestApi").getRectCount() : Reflect.get(window, "__easyLabelingTestApi").getSegmentationMaskBounds(), workflow)).toEqual(original);
  if (workflow === "detection") {
    await page.locator('label[for="segmentationWorkflowTab"]').click(); await openSetup(page);
    await expect(page.locator("#yoloePresetLocation")).toHaveText("Default: browser storage");
    await page.locator("#yoloeExistingBoxSelect").selectOption("0"); await page.locator("#addYoloeExistingBtn").click();
    await page.locator("#saveYoloePresetBtn").click();
    await expect(page.locator("#yoloePresetLocation")).toContainText("saved_parts-segmentation.yoloe.json");
    await closeSetup(page); await page.locator('label[for="detectionWorkflowTab"]').click(); await openSetup(page);
    await expect(page.locator("#yoloePresetSelect")).toBeEnabled();
    await page.locator("#yoloePresetSelect").selectOption("saved_parts-detection.yoloe.json");
    await expect(page.locator("#yoloeExampleList > div")).toHaveCount(3);
  }
});

for (const workflow of ["detection", "segmentation"] as const) test(`brush and eraser samples preserve holes, islands and zoomed coordinates for ${workflow}`, async ({ page }) => {
  test.setTimeout(60_000);
  type Prepared = { references: { examples: { box: number[]; polygon?: number[][]; mask: { width: number; height: number; runs: number[] }; maskCanvas?: unknown }[] }[] };
  let prepared: Prepared | null = null;
  await page.route("http://127.0.0.1:8766/**", (route) => {
    if (route.request().url().endsWith("/status")) return route.fulfill({ json: { version: 5, cuda: true, gpu: "Test GPU", models: ["yoloe-26s-seg"] } });
    const data = route.request().postDataJSON();
    if (route.request().url().endsWith("/prepare")) {
      prepared = data;
      return route.fulfill({ json: { id: "painted", model: "yoloe-26s-seg", workflow, classes: { "5": "sampleA" }, backend: "cuda", imgsz: 640 } });
    }
    const png = Buffer.from(data.image.split(",")[1], "base64"), width = png.readUInt32BE(16), height = png.readUInt32BE(20);
    return route.fulfill({ json: { detections: [], ...(workflow === "segmentation" ? { mask: { width, height, runs: [0, width * height] } } : {}) } });
  });
  await page.goto("/index.html?yoloe=python"); await page.locator("#emptyLoadSampleBtn").click();
  await expect(page.locator("#workspaceStandbyPanel")).toBeHidden({ timeout: 30_000 });
  if (workflow === "segmentation") await page.locator('label[for="segmentationWorkflowTab"]').click();
  await page.locator("#taskYoloeBtn").click(); await openSetup(page);
  const original = await page.evaluate((workflow) => workflow === "detection" ? Reflect.get(window, "__easyLabelingTestApi").getRectCount() : Reflect.get(window, "__easyLabelingTestApi").getSegmentationMaskBounds(), workflow);
  await page.locator("#yoloePromptShape").selectOption("brush");
  await expect(page.locator("#yoloeAutoFillClosedRegionToggle")).not.toBeChecked();
  const radius = page.locator("#yoloeBrushRadius");
  const setRadius = async (value: number) => {
    await radius.focus(); await radius.press("Home");
    for (let i = 1; i < value; i++) await radius.press("ArrowRight");
    await expect(page.locator("#yoloeBrushRadiusValue")).toHaveText(`${value}px`);
  };
  await expect(page.locator("#yoloeBrushBtn")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#yoloeEraserBtn")).toHaveAttribute("aria-pressed", "false");
  await radius.scrollIntoViewIfNeeded();
  const slider = (await radius.boundingBox())!;
  await page.mouse.move(slider.x + 8 + (slider.width - 16) * 7 / 127, slider.y + slider.height / 2);
  await page.mouse.down(); await page.mouse.move(slider.x + slider.width * 0.75, slider.y + slider.height / 2, { steps: 8 }); await page.mouse.up();
  const draggedRadius = Number(await radius.inputValue());
  expect(draggedRadius).toBeGreaterThan(50);
  await expect(page.locator("#yoloeBrushRadiusValue")).toHaveText(`${draggedRadius}px`);
  await setRadius(20);
  await page.locator("#drawYoloeExampleBtn").click();
  await expect(page.locator("#finishYoloeSampleBtn")).toHaveText("Finish mask");
  await expect(page.locator("#finishYoloeSampleBtn")).toBeDisabled();
  const canvas = page.locator("#yoloePreviewCanvas");
  const view = await canvas.evaluate((element) => {
    const c = element as HTMLCanvasElement, rect = c.getBoundingClientRect();
    return { left: rect.left, top: rect.top, width: c.width, height: c.height, imageWidth: Number(c.dataset.referenceWidth), imageHeight: Number(c.dataset.referenceHeight) };
  });
  const center = { x: view.left + view.width / 2, y: view.top + view.height / 2 };
  await page.mouse.move(center.x, center.y); await page.keyboard.down("Control"); await page.mouse.wheel(0, -400); await page.keyboard.up("Control");
  await page.keyboard.down("Control"); await page.mouse.down();
  await expect(canvas).toHaveCSS("cursor", "grabbing");
  await page.mouse.move(center.x + 30, center.y + 20); await page.mouse.up(); await page.keyboard.up("Control");
  await expect(canvas).toHaveCSS("cursor", "crosshair");
  await expect(page.locator("#finishYoloeSampleBtn")).toBeDisabled();
  const scale = Math.min(view.width / view.imageWidth, view.height / view.imageHeight) * Math.exp(0.6);
  const screen = async (x: number, y: number) => {
    await canvas.scrollIntoViewIfNeeded();
    const rect = (await canvas.boundingBox())!;
    return { x: rect.x + (view.width - view.imageWidth * scale) / 2 + 30 + x * scale, y: rect.y + (view.height - view.imageHeight * scale) / 2 + 20 + y * scale };
  };
  const first = await screen(400, 250), last = await screen(440, 250);
  await page.mouse.move(first.x, first.y); await page.mouse.down(); await page.mouse.move(last.x, last.y, { steps: 8 }); await page.mouse.up();
  await expect(page.locator("#finishYoloeSampleBtn")).toBeEnabled();
  await page.locator("#yoloeEraserBtn").click(); await setRadius(6);
  await expect(page.locator("#yoloeEraserBtn")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#yoloeBrushBtn")).toHaveAttribute("aria-pressed", "false");
  let point = await screen(420, 250); await page.mouse.click(point.x, point.y);
  await expect(page.locator("#undoYoloeStrokeBtn")).toBeEnabled();
  await page.keyboard.press("Control+z");
  await expect(page.locator("#undoYoloeStrokeBtn")).toBeDisabled();
  point = await screen(420, 250); await page.mouse.click(point.x, point.y);
  await page.locator("#yoloeBrushBtn").click(); await setRadius(10);
  await expect(page.locator("#yoloeBrushBtn")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#yoloeEraserBtn")).toHaveAttribute("aria-pressed", "false");
  point = await screen(490, 250); await page.mouse.click(point.x, point.y);
  await page.locator("#undoYoloeStrokeBtn").click();
  point = await screen(490, 250); await page.mouse.click(point.x, point.y);
  await page.keyboard.press("Enter");
  await expect(page.locator("#yoloeDrawingToolbar")).toBeHidden();
  await expect(page.locator("#yoloeExampleList > div")).toHaveCount(1);
  await page.locator("#previewYoloeSampleBtn").click();
  await expect(page.locator("#yoloeSetupStatus")).toContainText("Preview");
  const example = (prepared as unknown as Prepared).references[0]!.examples[0]!;
  expect(example.polygon).toBeUndefined(); expect(example.maskCanvas).toBeUndefined();
  const decoded = example.mask.runs.flatMap((value, index, runs) => index % 2 ? [] : Array<number>(runs[index + 1]!).fill(value));
  expect(decoded).toHaveLength(example.mask.width * example.mask.height);
  const at = (x: number, y: number) => decoded[(y - example.box[1]!) * example.mask.width + x - example.box[0]!];
  expect(at(400, 250)).toBe(1); expect(at(420, 250)).toBe(0); expect(at(435, 250)).toBe(1);
  expect(at(470, 250)).toBe(0); expect(at(490, 250)).toBe(1);
  expect(Math.abs(example.box[0]! - 380)).toBeLessThanOrEqual(1);
  expect(Math.abs(example.box[2]! - 501)).toBeLessThanOrEqual(1);
  await setRadius(3);
  const ring = [[600, 250], [660, 250], [660, 310], [600, 310], [600, 250]];
  const stroke = async (points: number[][]) => {
    const first = await screen(points[0]![0]!, points[0]![1]!);
    await page.mouse.move(first.x, first.y); await page.mouse.down();
    for (const [x, y] of points.slice(1)) { const next = await screen(x!, y!); await page.mouse.move(next.x, next.y, { steps: 8 }); }
    await page.mouse.up();
  };
  const finishAndPreview = async () => {
    await page.keyboard.press("Enter");
    await Promise.all([page.waitForResponse((r) => r.url().endsWith("/infer")), page.locator("#previewYoloeSampleBtn").click()]);
    await expect(page.locator("#previewYoloeSampleBtn")).toBeEnabled();
  };
  const sampleAt = (sample: number, x: number, y: number) => {
    const e = (prepared as unknown as Prepared).references[0]!.examples[sample]!;
    const mask = e.mask.runs.flatMap((value, index, runs) => index % 2 ? [] : Array<number>(runs[index + 1]!).fill(value));
    return mask[(y - e.box[1]!) * e.mask.width + x - e.box[0]!];
  };
  await page.locator("#drawYoloeExampleBtn").click(); await stroke(ring); await finishAndPreview();
  expect(sampleAt(1, 630, 280)).toBe(0); // Closed outlines stay hollow with the option off.
  await page.locator("#yoloeAutoFillClosedRegionToggle").check();
  await page.locator("#drawYoloeExampleBtn").click(); await stroke(ring);
  await page.locator("#undoYoloeStrokeBtn").click();
  await expect(page.locator("#finishYoloeSampleBtn")).toBeDisabled(); // Stroke and fill undo together.
  await stroke(ring);
  await page.locator("#yoloeEraserBtn").click();
  point = await screen(630, 280); await page.mouse.click(point.x, point.y);
  await page.locator("#yoloeBrushBtn").click();
  point = await screen(680, 280); await page.mouse.click(point.x, point.y);
  await finishAndPreview();
  expect(sampleAt(2, 615, 270)).toBe(1);
  expect(sampleAt(2, 630, 280)).toBe(0); // Eraser holes survive automatic fill and unrelated strokes.
  expect(sampleAt(2, 680, 280)).toBe(1);
  await page.locator("#drawYoloeExampleBtn").click(); await stroke(ring.slice(0, 4)); await finishAndPreview();
  expect(sampleAt(3, 630, 280)).toBe(0); // Open strokes never fill the interior.
  await page.locator("#drawYoloeExampleBtn").click();
  await expect(page.locator("#finishYoloeSampleBtn")).toBeDisabled();
  point = await screen(400, 250); await page.mouse.click(point.x, point.y); await page.keyboard.press("Escape");
  await expect(page.locator("#yoloeExampleList > div")).toHaveCount(4);
  await closeSetup(page);
  expect(await page.evaluate((workflow) => workflow === "detection" ? Reflect.get(window, "__easyLabelingTestApi").getRectCount() : Reflect.get(window, "__easyLabelingTestApi").getSegmentationMaskBounds(), workflow)).toEqual(original);
});

for (const workflow of ["detection", "segmentation"] as const) for (const imgsz of [1024, 2048]) test(`named mask samples find and save ${workflow} results at ${imgsz} without changing source labels`, async ({ page }) => {
  test.setTimeout(90_000);
  let prepared: Record<string, unknown> | null = null;
  let classes: Record<string, string> = {};
  await page.route("http://127.0.0.1:8766/**", (route) => {
    if (route.request().url().endsWith("/status")) return route.fulfill({ json: { version: 5, cuda: true, gpu: "Test GPU", models: ["yoloe-26s-seg"] } });
    const data = route.request().postDataJSON();
    if (route.request().url().endsWith("/prepare")) {
      prepared = data;
      const examples = data.references.flatMap((r: { examples: unknown[] }) => r.examples);
      classes = Object.fromEntries(examples.map((e: { classId: number; name: string }) => [e.classId, e.name]));
      return route.fulfill({ json: { id: "profile", model: "yoloe-26s-seg", workflow, classes, exampleCount: examples.length, imgsz: data.imgsz, referenceSha256: "reference", backend: "cuda", gpu: "Test GPU" } });
    }
    const id = Number(Object.keys(classes)[0]);
    const image = Buffer.from(data.image.split(",")[1], "base64"), width = image.readUInt32BE(16), height = image.readUInt32BE(20);
    return route.fulfill({ json: { detections: [{ classId: id, confidence: 0.9, left: 1, top: 1, right: 11, bottom: 2 }], ...(workflow === "segmentation" ? { mask: { width, height, runs: [0, width + 1, id, 10, 0, width * height - width - 11] } } : {}) } });
  });
  await page.goto("/index.html?yoloe=python");
  await page.locator("#emptyLoadSampleBtn").click();
  await expect(page.locator("#workspaceStandbyPanel")).toBeHidden({ timeout: 30_000 });
  await page.locator("#taskYoloeBtn").click();
  await expect(page.locator("#yoloeBackendBadge")).toHaveText("GPU · CUDA");
  if (workflow === "segmentation") await page.locator('label[for="segmentationWorkflowTab"]').click();
  await expect(page.locator("#taskYoloeBtn")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#leftPanelTitle")).toHaveText("YOLOE-26");
  await expect(page.locator("#yoloeOutputBadge")).toHaveText(workflow === "segmentation" ? "Segmentation · Masks" : "Detection · Boxes");
  await expect(page.locator("#connectYoloeBtn")).toBeHidden();
  await expect(page.locator("#yoloeInferenceControls button:visible")).toHaveCount(3);
  const source = () => page.evaluate((workflow) => workflow === "segmentation" ? Reflect.get(window, "__easyLabelingTestApi").getSegmentationMaskBounds() : Reflect.get(window, "__easyLabelingTestApi").getRectCount(), workflow);
  const before = await source();
  await openSetup(page);
  for (const name of ["sampleA", "sampleB", "sampleC"]) {
    await expect(page.locator("#yoloeSampleName")).toHaveValue(name);
    await outline(page);
  }
  await expect(page.locator("#yoloeExampleList > div")).toHaveCount(3);
  const imageName = await page.locator("#current-image-name").textContent();
  await page.locator("#drawYoloeExampleBtn").click(); await page.keyboard.press("d");
  await expect(page.locator("#current-image-name")).toHaveText(imageName!);
  await closeSetup(page); await openSetup(page);
  await expect(page.locator("#drawYoloeExampleBtn")).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("#yoloeExampleList > div")).toHaveCount(3);
  // A second example for sampleA reuses its output class rather than creating another category.
  await page.locator("#yoloeExistingTarget").selectOption("sampleA"); await outline(page);
  await expect(page.locator("#yoloeExampleList > div")).toHaveCount(4);
  await expect(page.locator("#yoloeSampleName")).toHaveValue("sampleA");
  await page.locator("#yoloeReferenceSelect").selectOption("sample_2.jpg");
  await expect(page.locator("#yoloeReferenceSelect")).toBeEnabled();
  await expect(page.locator("#current-image-name")).toHaveText("sample_1.jpg");
  await page.locator("#yoloeExistingTarget").selectOption("sampleA"); await outline(page);
  await expect(page.locator("#yoloeExampleList > div")).toHaveCount(5);
  await expect(page.locator("#yoloeExistingTarget option[value='sampleA']")).toHaveText("sampleA · 3 example(s)");
  await page.locator("#yoloeReferenceSelect").selectOption("sample_1.jpg");
  await expect(page.locator("#yoloeReferenceSelect")).toBeEnabled();
  await expect(page.locator("#current-image-name")).toHaveText("sample_1.jpg");
  expect(await source()).toEqual(before);
  await expect(page.locator("#yoloeImageSize option")).toHaveText(["640 · Standard", "1024 · Small targets", "2048 · Fine details"]);
  await page.locator("#yoloeImageSize").selectOption(String(imgsz));
  await closeSetup(page);
  await page.locator("#previewYoloeBtn").click();
  await expect(page.locator("#yoloeRunStatus")).toContainText(workflow === "segmentation" ? "1 mask instance(s)" : "1 detection(s)");
  const references = (prepared as unknown as { references: { examples: { classId: number; name: string; polygon: number[][]; box: number[] }[] }[] }).references;
  expect(references).toHaveLength(2);
  expect(prepared).toMatchObject({ imgsz });
  const examples = references.flatMap((r) => r.examples);
  expect(examples.map((e) => e.name)).toEqual(["sampleA", "sampleB", "sampleC", "sampleA", "sampleA"]);
  expect(new Set(examples.map((e) => e.classId)).size).toBe(3);
  expect(examples[0]!.classId).toBe(examples[3]!.classId);
  expect(examples[0]!.classId).toBe(examples[4]!.classId);
  expect(examples.every((e) => e.polygon.length === 3)).toBe(true);
  expect(await source()).toEqual(before);
  await page.locator("#saveYoloeCurrentBtn").click();
  await expect(page.locator("#yoloeRunStatus")).toContainText(workflow === "segmentation" ? "-targets-masks" : "-targets");
  await page.locator("#labelSourceSelect").selectOption("0");
  await expect.poll(source).toEqual(before);
  await openSetup(page);
  await page.getByRole("button", { name: "Remove sample sampleB", exact: true }).click();
  await expect(page.locator("#yoloeExampleList > div")).toHaveCount(4);
  await expect(page.locator("#yoloeDrawingToolbar")).toBeHidden();
  await page.locator("#drawYoloeExampleBtn").click(); await page.keyboard.press("Escape");
  await expect(page.locator("#drawYoloeExampleBtn")).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("#yoloeDrawingToolbar")).toBeHidden();
  await closeSetup(page);
  await expect(page.locator(workflow === "detection" ? "#detectionCanvasToolbar" : "#segmentationCanvasToolbar")).toBeVisible();
  await page.locator(`label[for="${workflow === "detection" ? "segmentation" : "detection"}WorkflowTab"]`).click();
  await expect(page.locator("#yoloeExampleList > div")).toHaveCount(0);
  await expect(page.locator("#previewYoloeBtn")).toBeDisabled();
});

test("YOLOE setup fits a narrow viewport, follows the theme, and keeps settings after closing", async ({ page }) => {
  await page.route("http://127.0.0.1:8766/status", (route) => route.fulfill({ json: { version: 5, cuda: false, gpu: null, models: ["yoloe-26n-seg"] } }));
  await page.goto("/index.html?yoloe=python"); await page.locator("#taskYoloeBtn").click();
  await openSetup(page);
  await page.setViewportSize({ width: 740, height: 800 });
  await page.locator("#yoloeConfidenceInput").fill("0.10");
  await page.locator("#yoloeProfileName").fill("parts_v2");
  const layout = await page.locator("#yoloeSetupModal .modal-content").evaluate((element) => ({ width: element.getBoundingClientRect().width, overflow: element.scrollWidth > element.clientWidth }));
  expect(layout.width).toBeLessThanOrEqual(740); expect(layout.overflow).toBe(false);
  await closeSetup(page);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.locator('label[for="darkModeToggle"]').click();
  await openSetup(page);
  await page.setViewportSize({ width: 740, height: 800 });
  await expect(page.locator("#yoloeConfidenceInput")).toHaveValue("0.10");
  await expect(page.locator("#yoloeProfileName")).toHaveValue("parts_v2");
  await expect(page.locator("body")).toHaveClass(/dark-mode/);
  const background = await page.locator("#yoloeSetupModal .modal-content").evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(background).not.toBe("rgb(255, 255, 255)");
  await expect(page.locator("#yoloeSetupSummary")).toHaveCSS("color", "rgb(174, 183, 191)");
  expect(await page.locator("#yoloeSetupModal .btn-close").evaluate((element) => getComputedStyle(element).filter)).not.toBe("none");
  await page.keyboard.press("Escape"); await expect(page.locator("#yoloeSetupModal")).toBeHidden();
  await expect(page.locator("#openYoloeSetupBtn")).toBeFocused();
});

for (const workflow of ["detection", "segmentation"] as const) test(`popup zoom and pan preserve sample coordinates and preview ${workflow} on its selected image`, async ({ page }) => {
  test.setTimeout(60_000);
  let prepared: { references: { examples: { box: number[]; polygon: number[][] }[] }[] } | null = null;
  let inferredSize: number[] = [];
  await page.route("http://127.0.0.1:8766/**", (route) => {
    if (route.request().url().endsWith("/status")) return route.fulfill({ json: { version: 5, cuda: true, gpu: "Test GPU", models: ["yoloe-26s-seg"] } });
    const data = route.request().postDataJSON();
    if (route.request().url().endsWith("/prepare")) {
      prepared = data;
      return route.fulfill({ json: { id: "popup", model: "yoloe-26s-seg", workflow, classes: { "5": "sampleA" }, exampleCount: 1, imgsz: 640, backend: "cuda", gpu: "Test GPU", referenceSha256: "reference" } });
    }
    const png = Buffer.from(data.image.split(",")[1], "base64"), width = png.readUInt32BE(16), height = png.readUInt32BE(20);
    inferredSize = [width, height];
    return route.fulfill({ json: { detections: [{ classId: 5, confidence: 0.9, left: 200, top: 200, right: 350, bottom: 350 }], ...(workflow === "segmentation" ? { mask: { width, height, runs: [0, width * 200, 5, width * 100, 0, width * (height - 300)] } } : {}) } });
  });
  await page.goto("/index.html?yoloe=python"); await page.locator("#emptyLoadSampleBtn").click();
  await expect(page.locator("#workspaceStandbyPanel")).toBeHidden({ timeout: 30_000 });
  if (workflow === "segmentation") await page.locator('label[for="segmentationWorkflowTab"]').click();
  await page.locator("#taskYoloeBtn").click(); await openSetup(page);
  const original = await page.evaluate((workflow) => workflow === "detection" ? Reflect.get(window, "__easyLabelingTestApi").getRectCount() : Reflect.get(window, "__easyLabelingTestApi").getSegmentationMaskBounds(), workflow);
  await page.locator("#yoloeReferenceSelect").selectOption("sample_2.jpg");
  await expect(page.locator("#yoloeReferenceSelect")).toBeEnabled();
  await page.locator("#drawYoloeExampleBtn").click();
  const canvas = page.locator("#yoloePreviewCanvas");
  const initial = await canvas.evaluate((element) => {
    const c = element as HTMLCanvasElement, rect = c.getBoundingClientRect();
    return { left: rect.left, top: rect.top, width: c.width, height: c.height, imageWidth: Number(c.dataset.referenceWidth), imageHeight: Number(c.dataset.referenceHeight) };
  });
  const zoomBefore = await page.locator("#yoloeSampleZoom").textContent();
  const center = { x: initial.left + initial.width / 2, y: initial.top + initial.height / 2 };
  await page.mouse.move(center.x + 60, center.y - 25); await page.keyboard.down("Control"); await page.mouse.wheel(0, -400); await page.keyboard.up("Control");
  await expect(page.locator("#yoloeSampleZoom")).not.toHaveText(zoomBefore!);
  await page.mouse.move(center.x, center.y);
  await page.mouse.down({ button: "middle" }); await page.mouse.move(center.x + 30, center.y + 20); await page.mouse.up({ button: "middle" });
  await expect(page.locator("#yoloeCanvasDrawingHint")).toContainText("0 points");
  await page.keyboard.down("Space"); await page.mouse.down(); await page.mouse.move(center.x + 45, center.y + 30); await page.mouse.up(); await page.keyboard.up("Space");
  await expect(page.locator("#yoloeCanvasDrawingHint")).toContainText("0 points");
  await page.keyboard.down("Control"); await page.mouse.down(); await page.mouse.move(center.x + 65, center.y + 40); await page.mouse.up(); await page.keyboard.up("Control");
  await expect(page.locator("#yoloeCanvasDrawingHint")).toContainText("0 points");
  const zoom = Math.min(initial.width / initial.imageWidth, initial.height / initial.imageHeight) * Math.exp(0.6);
  const points = [[400, 250], [450, 250], [400, 300]];
  for (const [x, y] of points) await page.mouse.click(initial.left + (initial.width - initial.imageWidth * zoom) / 2 + 60 * (1 - Math.exp(0.6)) + 65 + x! * zoom, initial.top + (initial.height - initial.imageHeight * zoom) / 2 - 25 * (1 - Math.exp(0.6)) + 40 + y! * zoom);
  await expect(page.locator("#yoloeCanvasDrawingHint")).toContainText("3 points");
  await page.keyboard.down("Control"); await page.mouse.dblclick(center.x, center.y); await page.keyboard.up("Control");
  await expect(page.locator("#yoloeCanvasDrawingHint")).toContainText("3 points");
  await expect(page.locator("#yoloeDrawingToolbar")).toBeVisible();
  await page.keyboard.press("Enter");
  const zoomIn = await page.locator("#yoloeSampleZoom").textContent();
  await page.mouse.move(center.x, center.y); await page.keyboard.down("Control"); await page.mouse.wheel(0, 200); await page.keyboard.up("Control");
  await expect(page.locator("#yoloeSampleZoom")).not.toHaveText(zoomIn!);
  expect(Number.parseInt((await page.locator("#yoloeSampleZoom").textContent())!)).toBeLessThan(Number.parseInt(zoomIn!));
  await page.locator("#fitYoloeSampleBtn").click();
  await expect(page.locator("#yoloeSampleZoom")).toHaveText(zoomBefore!);
  const pixels = () => canvas.evaluate((element) => (element as HTMLCanvasElement).toDataURL());
  const before = await pixels();
  await page.locator("#previewYoloeSampleBtn").click();
  await expect(page.locator("#yoloeSetupStatus")).toContainText(`1 ${workflow === "segmentation" ? "mask instance(s)" : "detection(s)"} · sample_2.jpg`);
  expect(inferredSize).toEqual([initial.imageWidth, initial.imageHeight]);
  const example = (prepared as unknown as { references: { examples: { box: number[]; polygon: number[][] }[] }[] }).references[0]!.examples[0]!;
  // Browser pointer coordinates may round to a screen pixel; preserve sub-image-pixel accuracy.
  example.box.forEach((value, index) => expect(Math.abs(value - [400, 250, 450, 300][index]!)).toBeLessThan(1));
  example.polygon.forEach((point, i) => point.forEach((value, j) => expect(Math.abs(value - points[i]![j]!)).toBeLessThan(1)));
  expect(await pixels()).not.toBe(before);
  const badgePixels = await canvas.evaluate((element, workflow) => {
    const c = element as HTMLCanvasElement, ctx = c.getContext("2d")!;
    const scale = Math.min(c.width / Number(c.dataset.referenceWidth), c.height / Number(c.dataset.referenceHeight));
    const left = (c.width - Number(c.dataset.referenceWidth) * scale) / 2 + 200 * scale;
    const top = (c.height - Number(c.dataset.referenceHeight) * scale) / 2 + 200 * scale - 24;
    const background = [...ctx.getImageData(Math.round(left + 6), Math.round(top + 2), 1, 1).data];
    const text = ctx.getImageData(Math.round(left + 9), Math.round(top + 4), 70, 16).data;
    return { background, whiteText: Array.from({ length: text.length / 4 }, (_, i) => text[i * 4]! >= 245 && text[i * 4 + 1]! >= 245 && text[i * 4 + 2]! >= 245).some(Boolean) };
  }, workflow);
  expect(badgePixels.background).toEqual(workflow === "detection" ? [145, 30, 180, 255] : [17, 24, 39, 255]);
  expect(badgePixels.whiteText).toBe(true);
  await page.locator("#yoloeShowSampleResults").uncheck(); expect(await pixels()).toBe(before);
  await page.locator("#yoloeShowSampleResults").check(); expect(await pixels()).not.toBe(before);
  await page.locator("#yoloeConfidenceInput").fill("0.1");
  await expect(page.locator("#yoloeSampleResultToggle")).toBeHidden(); expect(await pixels()).toBe(before);
  await page.locator("#yoloePromptShape").selectOption("box"); await page.locator("#drawYoloeExampleBtn").click();
  await canvas.scrollIntoViewIfNeeded();
  const bounds = (await canvas.boundingBox())!;
  const startPan = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  await page.mouse.move(startPan.x, startPan.y); await page.keyboard.down("Control");
  await page.mouse.down(); await page.mouse.move(startPan.x + 20, startPan.y + 10); await page.mouse.up(); await page.keyboard.up("Control");
  await expect(page.locator("#yoloeDrawingToolbar")).toBeVisible();
  await expect(page.locator("#yoloeExampleList > div")).toHaveCount(1);
  const fit = Math.min(initial.width / initial.imageWidth, initial.height / initial.imageHeight);
  const boxPoint = (x: number, y: number) => ({ x: bounds.x + (initial.width - initial.imageWidth * fit) / 2 + 20 + x * fit, y: bounds.y + (initial.height - initial.imageHeight * fit) / 2 + 10 + y * fit });
  const from = boxPoint(400, 250), to = boxPoint(450, 300);
  await page.mouse.move(from.x, from.y); await page.mouse.down(); await page.mouse.move(to.x, to.y); await page.mouse.up();
  await expect(page.locator("#yoloeExampleList > div")).toHaveCount(2);
  await Promise.all([page.waitForResponse((r) => r.url().endsWith("/infer")), page.locator("#previewYoloeSampleBtn").click()]);
  const box = (prepared as unknown as { references: { examples: { box: number[] }[] }[] }).references[0]!.examples[1]!.box;
  box.forEach((value, index) => expect(Math.abs(value - [400, 250, 450, 300][index]!)).toBeLessThan(1));
  await closeSetup(page);
  await expect(page.locator("#current-image-name")).toHaveText("sample_1.jpg");
  expect(await page.evaluate((workflow) => workflow === "detection" ? Reflect.get(window, "__easyLabelingTestApi").getRectCount() : Reflect.get(window, "__easyLabelingTestApi").getSegmentationMaskBounds(), workflow)).toEqual(original);
});

test("YOLOE reports unavailable service, missing models and stale API without repeated requests", async ({ page }) => {
  let attempts = 0;
  await page.route("http://127.0.0.1:8766/**", (route) => { attempts++; return route.abort(); });
  await page.goto("/index.html?yoloe=python"); await page.locator("#taskYoloeBtn").click();
  await expect(page.locator("#yoloeRunStatus")).toContainText("npm run yoloe:start");
  await openSetup(page);
  expect(attempts).toBe(1);
  await page.unroute("http://127.0.0.1:8766/**");
  await page.route("http://127.0.0.1:8766/**", (route) => route.fulfill({ json: { version: 5, cuda: false, gpu: null, models: [], busy: false } }));
  await page.locator("#connectYoloeBtn").click();
  await expect(page.locator("#yoloeBackendBadge")).toHaveText("CPU");
  await expect(page.locator("#yoloeModelSelect")).toHaveValue("yoloe-26n-seg");
  await expect(page.locator("#yoloeModelSelect")).toBeEnabled();
  await expect(page.locator("#yoloeRunStatus")).toContainText("--model yoloe-26n-seg");
  await page.unroute("http://127.0.0.1:8766/**");
  await page.route("http://127.0.0.1:8766/**", (route) => route.fulfill({ json: { version: 5, cuda: true, gpu: "Test GPU", models: [], busy: false } }));
  await page.locator("#connectYoloeBtn").click();
  await expect(page.locator("#yoloeRunStatus")).toContainText("yoloe:prepare");
  await page.unroute("http://127.0.0.1:8766/**");
  await page.route("http://127.0.0.1:8766/**", (route) => route.fulfill({ json: { version: 2 } }));
  await page.locator("#connectYoloeBtn").click();
  await expect(page.locator("#yoloeRunStatus")).toContainText("Restart npm run yoloe:start");
});

for (const workflow of ["detection", "segmentation"] as const) test(`CPU defaults to n and model changes re-encode samples for ${workflow}`, async ({ page }) => {
  test.setTimeout(90_000);
  const prepared: string[] = [];
  let classes: Record<string, string> = {};
  const models = ["n", "s", "m", "l"].map((size) => `yoloe-26${size}-seg`);
  await page.route("http://127.0.0.1:8766/**", (route) => {
    if (route.request().url().endsWith("/status")) return route.fulfill({ json: { version: 5, cuda: false, gpu: null, models } });
    const data = route.request().postDataJSON();
    if (route.request().url().endsWith("/prepare")) {
      prepared.push(data.model);
      const examples = data.references.flatMap((r: { examples: unknown[] }) => r.examples);
      classes = Object.fromEntries(examples.map((e: { classId: number; name: string }) => [e.classId, e.name]));
      return route.fulfill({ json: { id: data.model, model: data.model, workflow, classes, backend: "cpu", gpu: null, imgsz: data.imgsz, exampleCount: examples.length, referenceSha256: "reference" } });
    }
    expect(data.profileId).toBe(prepared.at(-1));
    const id = Number(Object.keys(classes)[0]);
    const png = Buffer.from(data.image.split(",")[1], "base64"), width = png.readUInt32BE(16), height = png.readUInt32BE(20);
    return route.fulfill({ json: { detections: [{ classId: id, confidence: 0.9, left: 1, top: 1, right: 11, bottom: 2 }], ...(workflow === "segmentation" ? { mask: { width, height, runs: [0, width + 1, id, 10, 0, width * height - width - 11] } } : {}) } });
  });
  await page.goto("/index.html?yoloe=python"); await page.locator("#emptyLoadSampleBtn").click();
  await expect(page.locator("#workspaceStandbyPanel")).toBeHidden({ timeout: 30_000 });
  if (workflow === "segmentation") await page.locator('label[for="segmentationWorkflowTab"]').click();
  await page.locator("#taskYoloeBtn").click();
  await expect(page.locator("#yoloeBackendBadge")).toHaveText("CPU");
  await expect(page.locator("#yoloeModelSelect")).toHaveValue(models[0]!);
  await outline(page);
  await openSetup(page);
  await expect(page.locator("#yoloeModelSelect option")).toHaveCount(4);
  for (const model of models) {
    await openSetup(page);
    await page.locator("#yoloeModelSelect").selectOption(model);
    await closeSetup(page);
    await expect(page.locator("#yoloePreviewCanvas")).toBeHidden();
    await page.locator("#previewYoloeBtn").click();
    await expect(page.locator("#yoloeRunStatus")).toContainText("Preview · 1");
    expect(prepared.at(-1)).toBe(model);
  }
  expect(prepared).toEqual(models);
  await page.locator("#saveYoloeCurrentBtn").click();
  await expect(page.locator("#yoloeRunStatus")).toContainText("inference-yoloe-26l-seg-targets");
});

test("existing mask labels become pixel-accurate samples without modifying the source", async ({ page }) => {
  test.setTimeout(60_000);
  type Prepared = { references: { examples: { classId: number; box: number[]; polygon?: number[][]; mask: { width: number; height: number; runs: number[] } }[] }[] };
  let prepared: Prepared | null = null;
  await page.route("http://127.0.0.1:8766/**", (route) => {
    if (route.request().url().endsWith("/status")) return route.fulfill({ json: { version: 5, cuda: true, gpu: "Test GPU", models: ["yoloe-26s-seg"] } });
    const data = route.request().postDataJSON();
    if (route.request().url().endsWith("/prepare")) {
      prepared = data;
      return route.fulfill({ json: { id: "existing-mask", workflow: "segmentation", model: data.model, classes: {}, backend: "cuda", gpu: "Test GPU", imgsz: data.imgsz, exampleCount: 1 } });
    }
    const png = Buffer.from(data.image.split(",")[1], "base64"), width = png.readUInt32BE(16), height = png.readUInt32BE(20);
    return route.fulfill({ json: { detections: [], mask: { width, height, runs: [0, width * height] } } });
  });
  await page.goto("/index.html?yoloe=python"); await page.locator("#emptyLoadSampleBtn").click();
  await expect(page.locator("#workspaceStandbyPanel")).toBeHidden({ timeout: 30_000 });
  await page.locator('label[for="segmentationWorkflowTab"]').click();
  await page.locator("#segmentationBrushModeBtn").click();
  const paintPoint = await page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi");
    const rect = [...document.querySelectorAll(".upper-canvas")].map((c) => c.getBoundingClientRect()).find((r) => r.width > 0 && r.height > 0)!;
    const [a, b, c, d, tx, ty] = api.getCanvasViewportTransform();
    return { x: rect.left + a * 400 + c * 200 + tx, y: rect.top + b * 400 + d * 200 + ty };
  });
  await page.mouse.click(paintPoint.x, paintPoint.y);
  await expect.poll(() => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getSegmentationMaskBounds())).not.toBeNull();
  await page.locator("#saveLabelsBtn").click();
  await page.locator("#taskYoloeBtn").click(); await openSetup(page);
  await expect(page.locator("#addYoloeSelectedBtn")).toBeDisabled();
  await closeSetup(page);
  const source = await page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi"), bounds = api.getSegmentationMaskBounds();
    // Border-clipped objects are valid sample labels, but select a point inside the canvas.
    for (let y = Math.max(bounds.top, 50); y <= bounds.bottom; y++) for (let x = Math.max(bounds.left, 20); x <= bounds.right; x++) {
      const classId = api.getSegmentationClassAtPoint(x, y);
      if (!classId || [[-1, 0], [1, 0], [0, -1], [0, 1]].some(([dx, dy]) => api.getSegmentationClassAtPoint(x + dx!, y + dy!) !== classId)) continue;
      const rect = [...document.querySelectorAll(".upper-canvas")].map((c) => c.getBoundingClientRect()).find((r) => r.width > 0 && r.height > 0)!;
      const [a, b, c, d, tx, ty] = api.getCanvasViewportTransform();
      return { bounds, classId, x, y, screenX: rect.left + a * (x + 0.5) + c * (y + 0.5) + tx, screenY: rect.top + b * (x + 0.5) + d * (y + 0.5) + ty };
    }
    throw new Error("Sample mask is missing");
  });
  await page.locator("#segmentationEditModeBtn").click();
  await page.mouse.click(source.screenX, source.screenY);
  await openSetup(page);
  await expect(page.locator("#addYoloeSelectedBtn")).toHaveText("Use selected mask (1)");
  await page.locator("#addYoloeSelectedBtn").click();
  await expect(page.locator("#yoloeExampleList > div")).toHaveCount(1);
  await page.locator("#previewYoloeSampleBtn").click();
  await expect(page.locator("#yoloeSetupStatus")).toContainText("Preview");
  const example = (prepared as unknown as Prepared).references[0]!.examples[0]!;
  expect(example.classId).toBe(Number(source.classId));
  expect(example.mask).toBeDefined();
  expect(example.polygon).toBeUndefined();
  expect(example.box[2] - example.box[0]).toBe(example.mask.width);
  const paintedPixels = example.mask.runs.reduce((sum: number, value: number, index: number) => sum + (index % 2 ? value : 0), 0);
  expect(paintedPixels).toBeGreaterThan(0);
  expect(paintedPixels).toBeLessThanOrEqual(example.mask.width * example.mask.height);
  const selectedPixel = (source.y - example.box[1]!) * example.mask.width + source.x - example.box[0]!;
  let offset = 0, selectedValue = 0;
  example.mask.runs.forEach((run, index) => { if (selectedPixel >= offset && selectedPixel < offset + run) selectedValue = index % 2; offset += run; });
  expect(selectedValue).toBe(1);
  await closeSetup(page);
  expect(await page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getSegmentationMaskBounds())).toEqual(source.bounds);
  expect(await page.evaluate(({ x, y }) => Reflect.get(window, "__easyLabelingTestApi").getSegmentationClassAtPoint(x, y), source)).toBe(source.classId);
});

test("existing box prompts and settings remain available, with cancellation preserving labels", async ({ page }) => {
  test.setTimeout(60_000);
  let prepared: Record<string, unknown> | null = null;
  await page.route("http://127.0.0.1:8766/**", (route) => {
    if (route.request().url().endsWith("/status")) return route.fulfill({ json: { version: 5, cuda: true, gpu: "Test GPU", models: ["yoloe-26s-seg"] } });
    const data = route.request().postDataJSON();
    if (route.request().url().endsWith("/prepare")) { prepared = data; return route.fulfill({ json: { id: "profile-1", model: "yoloe-26s-seg", classes: { "2": "Dark / Gray" }, exampleCount: 1, referenceSha256: "reference", backend: "cuda", gpu: "Test GPU", workflow: "detection" } }); }
    return route.fulfill({ json: { detections: [{ classId: 2, confidence: 0.9, left: 20, top: 20, right: 80, bottom: 80 }] } });
  });
  await page.goto("/index.html?yoloe=python"); await page.locator("#emptyLoadSampleBtn").click();
  await expect(page.locator("#workspaceStandbyPanel")).toBeHidden({ timeout: 30_000 });
  const count = () => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getRectCount());
  await page.locator("#taskYoloeBtn").click();
  await expect(page.locator("#yoloeBackendBadge")).toHaveText("GPU · CUDA");
  await page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").selectRectsByIndex([0]));
  await openSetup(page);
  await expect(page.locator("#addYoloeSelectedBtn")).toHaveText("Use selected boxes (1)");
  await page.locator("#addYoloeSelectedBtn").click();
  await closeSetup(page);
  await page.locator("#previewYoloeBtn").click();
  await expect(page.locator("#yoloeRunStatus")).toContainText("Preview · 1 detection(s)");
  expect(prepared).toMatchObject({ references: [{ examples: [{ classId: 2 }] }] });
  await expect.poll(count).toBe(207);
  await openSetup(page);
  await page.locator("#yoloeProfileName").fill("parts_v1");
  await closeSetup(page);
  await expect(page.locator("#yoloePreviewCanvas")).toBeHidden();
  await page.locator("#yoloeSaveScope").selectOption("current"); await page.locator("#saveYoloeCurrentBtn").click();
  await expect(page.locator("#yoloeRunStatus")).toContainText("inference-yoloe-26s-seg-parts_v1");
  await page.locator("#labelSourceSelect").selectOption("0"); await expect.poll(count).toBe(207);
  await openSetup(page); await page.locator("#yoloeConfidenceInput").fill("1.1"); await closeSetup(page); await page.locator("#previewYoloeBtn").click();
  await expect(page.locator("#yoloeRunStatus")).toContainText("between 0 and 1");
  await openSetup(page); await page.locator("#yoloeConfidenceInput").fill("0.25"); await closeSetup(page);
  await page.unroute("http://127.0.0.1:8766/**");
  await page.route("http://127.0.0.1:8766/infer", async (route) => { await new Promise((resolve) => setTimeout(resolve, 1500)); await route.abort(); });
  await page.locator("#previewYoloeBtn").click(); await page.locator("#cancelActiveOperationBtn").click();
  await expect(page.locator("#yoloeRunStatus")).toContainText("stopped");
  await expect.poll(count).toBe(207);
});

test("existing Detection boxes can be imported inside the popup from different images without main selection", async ({ page }) => {
  test.setTimeout(60_000);
  type Prepared = { references: { examples: { classId: number; name: string; box: number[] }[] }[] };
  let prepared: Prepared | null = null;
  await page.route("http://127.0.0.1:8766/**", (route) => {
    if (route.request().url().endsWith("/status")) return route.fulfill({ json: { version: 5, cuda: true, gpu: "Test GPU", models: ["yoloe-26s-seg"] } });
    if (route.request().url().endsWith("/prepare")) {
      prepared = route.request().postDataJSON();
      return route.fulfill({ json: { id: "existing", model: "yoloe-26s-seg", classes: { "1": "Light / White" }, exampleCount: 2, backend: "cuda", workflow: "detection", imgsz: 640 } });
    }
    return route.fulfill({ json: { detections: [] } });
  });
  await page.goto("/index.html?yoloe=python"); await page.locator("#emptyLoadSampleBtn").click();
  await expect(page.locator("#workspaceStandbyPanel")).toBeHidden({ timeout: 30_000 });
  await page.locator("#taskYoloeBtn").click();
  await expect(page.locator("#yoloeBackendBadge")).toHaveText("GPU · CUDA");
  await openSetup(page);
  await expect(page.locator("#addYoloeSelectedBtn")).toBeDisabled();
  await expect(page.locator("#yoloeExistingBoxSelect option")).toHaveCount(207);
  await expect(page.locator("#addYoloeExistingBtn")).toBeDisabled();
  const pixels = () => page.locator("#yoloePreviewCanvas").evaluate((element) => (element as HTMLCanvasElement).toDataURL());
  const before = await pixels();
  await page.locator("#yoloeExistingBoxSelect").selectOption("1");
  expect(await pixels()).not.toBe(before);
  await page.locator("#addYoloeExistingBtn").click();
  await expect(page.locator("#yoloeExampleList > div")).toHaveCount(1);
  await page.locator("#yoloeReferenceSelect").selectOption("sample_2.jpg");
  await expect(page.locator("#yoloeExistingBoxSelect option")).toHaveCount(100);
  await expect(page.locator("#addYoloeSelectedBtn")).toBeDisabled();
  await expect(page.locator("#addYoloeExistingBtn")).toBeDisabled();
  await page.locator("#yoloeExistingBoxSelect").selectOption("0");
  await page.locator("#addYoloeExistingBtn").click();
  await expect(page.locator("#yoloeExampleList > div")).toHaveCount(2);
  await page.locator("#previewYoloeSampleBtn").click();
  await expect(page.locator("#yoloeSetupStatus")).toContainText("sample_2.jpg");
  const references = (prepared as unknown as Prepared).references;
  expect(references).toHaveLength(2);
  for (const reference of references) expect(reference.examples[0]).toMatchObject({ classId: 1, name: "Light / White" });
  const dimensions = await page.locator("#yoloePreviewCanvas").evaluate((element) => ({ width: Number((element as HTMLElement).dataset.referenceWidth), height: Number((element as HTMLElement).dataset.referenceHeight) }));
  const [, cx, cy, width, height] = (await readFile("assets/sample/label/sample_2.txt", "utf8")).trim().split("\n")[0]!.split(/\s+/).map(Number);
  const expected = [(cx! - width! / 2) * dimensions.width, (cy! - height! / 2) * dimensions.height, (cx! + width! / 2) * dimensions.width, (cy! + height! / 2) * dimensions.height];
  references[1]!.examples[0]!.box.forEach((value, index) => expect(value).toBeCloseTo(expected[index]!, 5));
  await closeSetup(page);
  await expect(page.locator("#current-image-name")).toHaveText("sample_1.jpg");
  expect(await page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getRectCount())).toBe(207);
  await page.locator('#image-list [data-file-name="sample_2.jpg"]').click();
  await expect(page.locator("#current-image-name")).toHaveText("sample_2.jpg");
  await expect.poll(() => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getRectCount())).toBe(100);
});
