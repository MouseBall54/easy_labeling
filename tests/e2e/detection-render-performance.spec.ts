import { expect, test } from "@playwright/test";

// Regression guard for a real, measured problem: rendering with 200+ detection
// boxes on screen was slow because every box previously carried a second,
// separate Fabric Text object as its label (see docs/PERFORMANCE_IMPROVEMENT_PLAN.md,
// item 1). tests/unit/performance/detection-bulk-performance.test.ts cannot
// catch this class of regression because it renders against a fake Fabric
// canvas whose renderAll() is a no-op call counter, not real per-object
// compositing cost. This spec patches the real fabric.Canvas.prototype.renderAll
// in a real browser and measures actual render wall-clock time.
//
// Thresholds are set to roughly 3x the measured baseline on 2026-09-16
// (200 boxes: ~150-200ms worst single render, ~450-500ms total for a Ctrl+A
// gesture; 1000 boxes: ~600-700ms worst single render, ~1750ms total) to
// leave headroom for slower CI machines while still catching a real
// regression (e.g. a 2-3x slowdown), not just noise.
test("keeps real Fabric render time bounded as detection box count grows", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/index.html");
  await page.locator("#emptyLoadSampleBtn").click();
  await expect.poll(async () => page.evaluate(() => {
    return Reflect.get(window, "__easyLabelingTestApi")?.getCurrentImageName?.() ?? "";
  }), { timeout: 30_000 }).toBe("sample_1.jpg");
  await page.locator('label[for="detectionWorkflowTab"]').click();

  await page.evaluate(() => {
    const fabricNs = (window as unknown as { fabric: { Canvas: { prototype: Record<string, unknown> } } }).fabric;
    const proto = fabricNs.Canvas.prototype;
    const log: number[] = [];
    (window as unknown as { __renderLog: number[] }).__renderLog = log;
    const originalRenderAll = proto.renderAll as (...args: unknown[]) => unknown;
    (window as unknown as { __originalRenderAll: unknown }).__originalRenderAll = originalRenderAll;
    proto.renderAll = function patchedRenderAll(this: unknown, ...args: unknown[]) {
      const start = performance.now();
      const result = originalRenderAll.apply(this, args);
      log.push(performance.now() - start);
      return result;
    };
  });

  const budgets: Record<number, { worstMs: number; totalMs: number }> = {
    200: { worstMs: 600, totalMs: 1000 },
    1000: { worstMs: 2000, totalMs: 3500 }
  };

  for (const count of [200, 1000]) {
    await page.evaluate((boxCount) => {
      const api = Reflect.get(window, "__easyLabelingTestApi") as { seedDetectionBoxesForTest: (n: number) => void };
      api.seedDetectionBoxesForTest(boxCount);
      (window as unknown as { __renderLog: number[] }).__renderLog.length = 0;
    }, count);
    await page.waitForTimeout(150);

    await page.keyboard.press("Control+A");
    await page.waitForTimeout(80);

    const log = await page.evaluate(() => (window as unknown as { __renderLog: number[] }).__renderLog.slice());
    const budget = budgets[count];

    expect(log.length, `expected at least one real render for ${count} boxes`).toBeGreaterThan(0);
    const worst = Math.max(...log);
    const total = log.reduce((sum, value) => sum + value, 0);
    expect(worst, `worst single render for ${count} boxes was ${worst.toFixed(1)}ms`).toBeLessThan(budget.worstMs);
    expect(total, `total render time for ${count} boxes was ${total.toFixed(1)}ms`).toBeLessThan(budget.totalMs);
  }

  await page.evaluate(() => {
    const fabricNs = (window as unknown as { fabric: { Canvas: { prototype: Record<string, unknown> } } }).fabric;
    fabricNs.Canvas.prototype.renderAll = (window as unknown as { __originalRenderAll: (...args: unknown[]) => unknown }).__originalRenderAll;
  });
});
