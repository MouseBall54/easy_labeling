import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

test("all bundled images load their own boxes and semantic masks in both workflows", async ({ page }) => {
  test.setTimeout(120_000);
  const source = JSON.parse(await readFile("assets/sample/annotations.json", "utf8")) as {
    images: { file: string; objects: { classId: number; box: [number, number, number, number]; runs: number[] }[] }[];
  };
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/index.html");
  await page.locator("#emptyLoadSampleBtn").click();
  await expect(page.locator("#workspaceStandbyPanel")).toBeHidden({ timeout: 30_000 });
  for (const image of source.images) {
    await page.locator(`#image-list [data-file-name="${image.file}"]`).click();
    await expect(page.locator("#current-image-name")).toHaveText(image.file);
    await expect.poll(() => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getRectCount())).toBe(image.objects.length);
  }
  await page.locator('label[for="segmentationWorkflowTab"]').click();
  for (const image of source.images) {
    await page.locator(`#image-list [data-file-name="${image.file}"]`).click();
    await expect(page.locator("#current-image-name")).toHaveText(image.file);
    const boxes = image.objects.map((object) => object.box);
    const left = Math.min(...boxes.map(([x]) => x)), top = Math.min(...boxes.map(([, y]) => y));
    const right = Math.max(...boxes.map(([x, , w]) => x + w - 1)), bottom = Math.max(...boxes.map(([, y, , h]) => y + h - 1));
    await expect.poll(() => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getSegmentationMaskBounds()))
      .toEqual({ left, top, right, bottom, width: right - left + 1, height: bottom - top + 1 });
    const object = image.objects[0]!, [x, y, width] = object.box;
    const offset = object.runs[0]!;
    const point = { x: x + offset % width, y: y + Math.floor(offset / width), classId: String(object.classId) };
    await expect.poll(() => page.evaluate((point) => Reflect.get(window, "__easyLabelingTestApi").getSegmentationClassAtPoint(point.x, point.y), point)).toBe(point.classId);
    const pixel = await page.evaluate((point) => Reflect.get(window, "__easyLabelingTestApi").getSegmentationOverlayPixel(point.x, point.y), point);
    expect(pixel?.[3]).toBeGreaterThan(0);
  }
  expect(errors).toEqual([]);
});
