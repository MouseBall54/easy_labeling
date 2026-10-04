import { expect, test, type Page } from "@playwright/test";

async function outline(page: Page, points = [[100, 200], [150, 200], [100, 250]]): Promise<void> {
  await page.locator("#drawYoloeExampleBtn").click();
  const screen = await page.evaluate((points) => {
    const overlay = document.querySelector<HTMLCanvasElement>("#yoloePreviewCanvas")!, rect = overlay.getBoundingClientRect();
    const [a, b, c, d, tx, ty] = Reflect.get(window, "__easyLabelingTestApi").getCanvasViewportTransform();
    return points.map(([x, y]) => ({ x: rect.left + (a * x! + c * y! + tx) * rect.width / overlay.width, y: rect.top + (b * x! + d * y! + ty) * rect.height / overlay.height }));
  }, points);
  for (const point of screen) await page.mouse.click(point.x, point.y);
  await page.keyboard.press("Enter");
}

for (const workflow of ["detection", "segmentation"] as const) test(`named mask samples find and save ${workflow} results without changing source labels`, async ({ page }) => {
  test.setTimeout(90_000);
  let prepared: Record<string, unknown> | null = null;
  let classes: Record<string, string> = {};
  await page.route("http://127.0.0.1:8766/**", (route) => {
    if (route.request().url().endsWith("/status")) return route.fulfill({ json: { version: 3, cuda: true, gpu: "Test GPU", models: ["yoloe-26s-seg"] } });
    const data = route.request().postDataJSON();
    if (route.request().url().endsWith("/prepare")) {
      prepared = data;
      classes = Object.fromEntries(data.examples.map((e: { classId: number; name: string }) => [e.classId, e.name]));
      return route.fulfill({ json: { id: "profile", model: "yoloe-26s-seg", workflow, classes, exampleCount: data.examples.length, referenceSha256: "reference", gpu: "Test GPU" } });
    }
    const id = Number(Object.keys(classes)[0]);
    const image = Buffer.from(data.image.split(",")[1], "base64"), width = image.readUInt32BE(16), height = image.readUInt32BE(20);
    return route.fulfill({ json: { detections: [{ classId: id, confidence: 0.9, left: 1, top: 1, right: 11, bottom: 2 }], ...(workflow === "segmentation" ? { mask: { width, height, runs: [0, width + 1, id, 10, 0, width * height - width - 11] } } : {}) } });
  });
  await page.goto("/index.html");
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
  for (const name of ["sampleA", "sampleB", "sampleC"]) {
    await expect(page.locator("#yoloeSampleName")).toHaveValue(name);
    await outline(page);
  }
  await expect(page.locator("#yoloeExampleList > div")).toHaveCount(3);
  // A second example for sampleA reuses its output class rather than creating another category.
  await page.locator("#yoloeSampleName").fill("sampleA"); await outline(page);
  await expect(page.locator("#yoloeExampleList > div")).toHaveCount(4);
  expect(await source()).toEqual(before);
  await page.locator("#previewYoloeBtn").click();
  await expect(page.locator("#yoloeRunStatus")).toContainText(workflow === "segmentation" ? "1 mask instance(s)" : "1 detection(s)");
  const examples = (prepared as unknown as { examples: { classId: number; name: string; polygon: number[][]; box: number[] }[] }).examples;
  expect(examples.map((e) => e.name)).toEqual(["sampleA", "sampleB", "sampleC", "sampleA"]);
  expect(new Set(examples.map((e) => e.classId)).size).toBe(3);
  expect(examples[0]!.classId).toBe(examples[3]!.classId);
  expect(examples.every((e) => e.polygon.length === 3)).toBe(true);
  expect(await source()).toEqual(before);
  await page.locator("#saveYoloeCurrentBtn").click();
  await expect(page.locator("#yoloeRunStatus")).toContainText(workflow === "segmentation" ? "-targets-masks" : "-targets");
  await page.locator("#labelSourceSelect").selectOption("0");
  await expect.poll(source).toEqual(before);
  await page.getByRole("button", { name: "Remove sample sampleB", exact: true }).click();
  await expect(page.locator("#yoloeExampleList > div")).toHaveCount(3);
  await expect(page.locator("#yoloePreviewCanvas")).toBeHidden();
  await page.locator("#drawYoloeExampleBtn").click(); await page.keyboard.press("Escape");
  await expect(page.locator("#drawYoloeExampleBtn")).toHaveAttribute("aria-pressed", "false");
  await page.locator(`label[for="${workflow === "detection" ? "segmentation" : "detection"}WorkflowTab"]`).click();
  await expect(page.locator("#yoloeExampleList > div")).toHaveCount(0);
  await expect(page.locator("#previewYoloeBtn")).toBeDisabled();
});

test("YOLOE reports unavailable service, GPU, models and stale API without repeated requests", async ({ page }) => {
  let attempts = 0;
  await page.route("http://127.0.0.1:8766/**", (route) => { attempts++; return route.abort(); });
  await page.goto("/index.html"); await page.locator("#taskYoloeBtn").click();
  await expect(page.locator("#yoloeRunStatus")).toContainText("npm run yoloe:start");
  await page.locator("#yoloeAdvancedSettings summary").click();
  expect(attempts).toBe(1);
  await page.unroute("http://127.0.0.1:8766/**");
  await page.route("http://127.0.0.1:8766/**", (route) => route.fulfill({ json: { version: 3, cuda: false, gpu: null, models: [], busy: false } }));
  await page.locator("#connectYoloeBtn").click();
  await expect(page.locator("#yoloeBackendBadge")).toHaveText("GPU unavailable");
  await page.unroute("http://127.0.0.1:8766/**");
  await page.route("http://127.0.0.1:8766/**", (route) => route.fulfill({ json: { version: 3, cuda: true, gpu: "Test GPU", models: [], busy: false } }));
  await page.locator("#connectYoloeBtn").click();
  await expect(page.locator("#yoloeRunStatus")).toContainText("npm run yoloe:prepare");
  await page.unroute("http://127.0.0.1:8766/**");
  await page.route("http://127.0.0.1:8766/**", (route) => route.fulfill({ json: { version: 2 } }));
  await page.locator("#connectYoloeBtn").click();
  await expect(page.locator("#yoloeRunStatus")).toContainText("Restart npm run yoloe:start");
});

test("existing box prompts and settings remain available, with cancellation preserving labels", async ({ page }) => {
  test.setTimeout(60_000);
  let prepared: Record<string, unknown> | null = null;
  await page.route("http://127.0.0.1:8766/**", (route) => {
    if (route.request().url().endsWith("/status")) return route.fulfill({ json: { version: 3, cuda: true, gpu: "Test GPU", models: ["yoloe-26s-seg"] } });
    const data = route.request().postDataJSON();
    if (route.request().url().endsWith("/prepare")) { prepared = data; return route.fulfill({ json: { id: "profile-1", model: "yoloe-26s-seg", classes: { "0": "Light / White" }, exampleCount: 1, referenceSha256: "reference", gpu: "Test GPU", workflow: "detection" } }); }
    return route.fulfill({ json: { detections: [{ classId: 0, confidence: 0.9, left: 20, top: 20, right: 80, bottom: 80 }] } });
  });
  await page.goto("/index.html"); await page.locator("#emptyLoadSampleBtn").click();
  await expect(page.locator("#workspaceStandbyPanel")).toBeHidden({ timeout: 30_000 });
  const count = () => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getRectCount());
  await page.locator("#taskYoloeBtn").click();
  await expect(page.locator("#yoloeBackendBadge")).toHaveText("GPU · CUDA");
  await page.locator("#yoloeAdvancedSettings summary").click();
  await page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").selectRectsByIndex([0]));
  await page.locator("#addYoloeSelectedBtn").click();
  await page.locator("#previewYoloeBtn").click();
  await expect(page.locator("#yoloeRunStatus")).toContainText("Preview · 1 detection(s)");
  expect(prepared).toMatchObject({ examples: [{ classId: 0 }] });
  await expect.poll(count).toBe(52);
  await page.locator("#yoloeProfileName").fill("parts_v1");
  await expect(page.locator("#yoloePreviewCanvas")).toBeHidden();
  await page.locator("#yoloeSaveScope").selectOption("all"); await page.locator("#saveYoloeCurrentBtn").click();
  await expect(page.locator("#yoloeRunStatus")).toContainText("same base name");
  await page.locator("#yoloeSaveScope").selectOption("current"); await page.locator("#saveYoloeCurrentBtn").click();
  await expect(page.locator("#yoloeRunStatus")).toContainText("inference-yoloe-26s-seg-parts_v1");
  await page.locator("#labelSourceSelect").selectOption("0"); await expect.poll(count).toBe(52);
  await page.locator("#yoloeConfidenceInput").fill("1.1"); await page.locator("#previewYoloeBtn").click();
  await expect(page.locator("#yoloeRunStatus")).toContainText("between 0 and 1");
  await page.locator("#yoloeConfidenceInput").fill("0.25");
  await page.unroute("http://127.0.0.1:8766/**");
  await page.route("http://127.0.0.1:8766/infer", async (route) => { await new Promise((resolve) => setTimeout(resolve, 1500)); await route.abort(); });
  await page.locator("#previewYoloeBtn").click(); await page.locator("#cancelActiveOperationBtn").click();
  await expect(page.locator("#yoloeRunStatus")).toContainText("stopped");
  await expect.poll(count).toBe(52);
});
