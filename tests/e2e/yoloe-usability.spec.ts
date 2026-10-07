import { expect, test } from "@playwright/test";

for (const workflow of ["detection", "segmentation"] as const) test(`YOLOE keeps drawing controls together and groups sample images with their names for ${workflow}`, async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.route("http://127.0.0.1:8766/status", (route) => route.fulfill({ json: { version: 5, cuda: false, gpu: null, models: ["yoloe-26n-seg"] } }));
  await page.goto("/index.html?yoloe=python", { waitUntil: "domcontentloaded" });
  await page.locator("#emptyLoadSampleBtn").click();
  await expect(page.locator("#loading-overlay")).toBeHidden({ timeout: 45_000 });
  await expect.poll(() => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getRectCount())).toBe(207);
  if (workflow === "segmentation") await page.locator('label[for="segmentationWorkflowTab"]').click();
  const source = await page.evaluate((workflow) => {
    const api = Reflect.get(window, "__easyLabelingTestApi");
    return workflow === "detection" ? api.getRectCount() : api.getSegmentationMaskBounds();
  }, workflow);
  await page.locator("#taskYoloeBtn").click();
  await page.locator("#openYoloeSetupBtn").click();
  const draw = async (name: string, image: string) => {
    await page.locator("#yoloeReferenceSelect").selectOption(image);
    await expect(page.locator("#yoloeReferenceSelect")).toBeEnabled();
    await page.locator("#yoloeSampleName").fill(name);
    await page.locator("#yoloePromptShape").selectOption("box");
    await page.locator("#drawYoloeExampleBtn").click();
    const canvas = (await page.locator("#yoloePreviewCanvas").boundingBox())!;
    await page.mouse.move(canvas.x + canvas.width * 0.45, canvas.y + canvas.height * 0.45);
    await page.mouse.down();
    await page.mouse.move(canvas.x + canvas.width * 0.55, canvas.y + canvas.height * 0.55, { steps: 5 });
    await page.mouse.up();
    await expect(page.locator("#drawYoloeExampleBtn")).toHaveAttribute("aria-pressed", "false");
  };
  await draw("sampleA", "sample_1.jpg");
  await draw("sampleA", "sample_2.jpg");
  await draw("sampleB", "sample_2.jpg");
  const groupA = page.getByRole("region", { name: "Samples for sampleA", exact: true });
  const groupB = page.getByRole("region", { name: "Samples for sampleB", exact: true });
  await expect(groupA.locator(":scope > strong")).toHaveText("sampleA");
  await expect(groupA.locator(":scope > small")).toHaveText("2 examples · 2 images");
  await expect(groupA.locator(".yoloe-example-row canvas")).toHaveCount(2);
  await expect(groupA.locator(".yoloe-example-row span")).toHaveText(["sample_1.jpg", "sample_2.jpg"]);
  await expect(groupB.locator(":scope > small")).toHaveText("1 example · 1 image");
  await expect(page.locator("#yoloeExampleList > p")).toHaveCount(0);
  for (const theme of ["light", "dark"]) {
    if (theme === "dark") {
      await page.locator("#closeYoloeSetupBtn").click();
      await expect(page.locator("#yoloeSetupModal")).toBeHidden();
      await page.locator('label[for="darkModeToggle"]').click();
      await page.locator("#openYoloeSetupBtn").click();
    }
    await page.locator("#yoloePromptShape").selectOption("brush");
    await page.locator("#drawYoloeExampleBtn").click();
    await expect(page.locator(".yoloe-sample-tools #yoloePromptShape")).toBeVisible();
    await expect(page.locator(".yoloe-sample-tools #finishYoloeSampleBtn")).toBeVisible();
    await expect(page.locator(".yoloe-sample-tools #undoYoloeStrokeBtn")).toBeVisible();
    for (const id of ["drawYoloeExampleBtn", "finishYoloeSampleBtn", "undoYoloeStrokeBtn", "previewYoloeSampleBtn", "closeYoloeSetupBtn"]) {
      const rect = (await page.locator(`#${id}`).boundingBox())!;
      expect(rect.y).toBeGreaterThanOrEqual(0); expect(rect.y + rect.height).toBeLessThanOrEqual(720);
    }
    const before = (await page.locator("#yoloeSampleStage").boundingBox())!;
    await page.getByLabel("Image navigation help").click();
    await expect(page.locator(".yoloe-view-help p")).toBeVisible();
    expect(await page.locator(".yoloe-view-help p").evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return Boolean(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)?.closest(".yoloe-view-help"));
    })).toBe(true);
    const after = (await page.locator("#yoloeSampleStage").boundingBox())!;
    expect(after).toEqual(before);
    await page.getByLabel("Image navigation help").click();
    await page.locator("#drawYoloeExampleBtn").click();
    await expect(page.locator("#yoloeSetupStatus")).toHaveText("Ready");
    await page.locator("#yoloePromptShape").selectOption("mask");
    await page.locator(".yoloe-settings-scroll").evaluate((element) => element.scrollTo(0, 0));
    await expect(groupA.locator(":scope > strong")).toBeVisible();
    await expect(groupB.locator("canvas")).toBeInViewport();
    await page.screenshot({ path: `output/yoloe-usability-${workflow}-${theme}.png` });
  }
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.locator(".yoloe-settings-scroll").evaluate((element) => element.scrollTo(0, 0));
  await page.screenshot({ path: `output/yoloe-usability-${workflow}-dark-1920.png` });
  await groupA.getByRole("button", { name: "Remove sample sampleA", exact: true }).first().click();
  await expect(groupA.locator(":scope > small")).toHaveText("1 example · 1 image");
  await groupA.getByRole("button", { name: "Remove sample sampleA", exact: true }).click();
  await expect(groupA).toHaveCount(0);
  await expect(groupB.locator(".yoloe-example-row")).toHaveCount(1);
  await page.locator("#clearYoloeExamplesBtn").click();
  await expect(page.locator("#yoloeExampleList")).toBeEmpty();
  expect(await page.evaluate((workflow) => {
    const api = Reflect.get(window, "__easyLabelingTestApi");
    return workflow === "detection" ? api.getRectCount() : api.getSegmentationMaskBounds();
  }, workflow)).toEqual(source);
});
