import { expect, test, type Page } from "@playwright/test";

const geometry = (page: Page) => page.evaluate(() => {
  const area = document.querySelector("main.canvas-container") as HTMLElement;
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const api = Reflect.get(window, "__easyLabelingTestApi") as { getCanvasViewportTransform(): number[] };
  const [zoom, , , , x, y] = api.getCanvasViewportTransform();
  return { areaWidth: area.clientWidth, areaHeight: area.clientHeight, width: canvas.width, height: canvas.height, zoom: zoom!, x: x!, y: y! };
});

async function followsArea(page: Page): Promise<void> {
  await expect.poll(async () => {
    const { areaWidth, areaHeight, width, height } = await geometry(page);
    return width === areaWidth && height === areaHeight;
  }, { timeout: 5_000 }).toBe(true);
}

test("canvas follows the window: a fitted image refits, a zoomed view keeps its zoom and position", async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/index.html");
  await page.locator("#emptyLoadSampleBtn").click();
  await expect.poll(() => page.evaluate(() => (Reflect.get(window, "__easyLabelingTestApi") as { getCurrentImageName?(): string } | undefined)?.getCurrentImageName?.() ?? ""), { timeout: 30_000 }).toBe("sample_1.jpg");
  await followsArea(page);
  const fitted = await geometry(page);

  await page.setViewportSize({ width: 1600, height: 900 });
  await followsArea(page);
  const larger = await geometry(page);
  expect(larger.width).toBeGreaterThan(fitted.width);
  expect(larger.zoom).toBeGreaterThan(fitted.zoom);

  await page.setViewportSize({ width: 1280, height: 720 });
  await followsArea(page);
  const smaller = await geometry(page);
  expect(smaller.zoom).toBeCloseTo(fitted.zoom, 6);
  expect(smaller.x).toBeCloseTo(fitted.x, 3);
  expect(smaller.y).toBeCloseTo(fitted.y, 3);

  await page.locator("#zoomInBtn").click();
  const zoomed = await geometry(page);
  expect(zoomed.zoom).toBeGreaterThan(fitted.zoom);
  await page.setViewportSize({ width: 1600, height: 900 });
  await followsArea(page);
  const kept = await geometry(page);
  expect(kept.zoom).toBeCloseTo(zoomed.zoom, 6);
  expect(kept.x).toBeCloseTo(zoomed.x, 3);
  expect(kept.y).toBeCloseTo(zoomed.y, 3);
});
