import { expect, test, type Page } from "@playwright/test";

async function snapshot(page: Page) {
  return page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi");
    return {
      rects: api.getRectGeometries() as Array<{ annotationId: string; left: number; top: number; width: number; height: number }>,
      selectedIds: api.getSelectedRectIds() as string[],
      selection: api.getActiveSelectionBounds() as { left: number; top: number; width: number; height: number } | null,
      viewport: api.getCanvasViewportTransform() as number[]
    };
  });
}

function expectSameRects(actual: Awaited<ReturnType<typeof snapshot>>["rects"], expected: Awaited<ReturnType<typeof snapshot>>["rects"]) {
  expect(actual).toHaveLength(expected.length);
  const byId = new Map(actual.map((rect) => [rect.annotationId, rect]));
  expected.forEach((rect) => {
    const restored = byId.get(rect.annotationId)!;
    expect(restored).toBeDefined();
    for (const key of ["left", "top", "width", "height"] as const) {
      expect(restored[key]).toBeCloseTo(rect[key], 4);
    }
  });
}

for (const count of [1, 2, 601]) {
  test(`pastes ${count} detection boxes at the cursor and preserves the editable selection`, async ({ page }) => {
    test.setTimeout(90_000);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/index.html", { waitUntil: "domcontentloaded" });
    await expect.poll(() => page.evaluate(() => Boolean(Reflect.get(window, "__easyLabelingTestApi")))).toBe(true);
    await page.locator("#emptyLoadSampleBtn").click();
    await expect(page.locator("#loading-overlay")).toBeHidden({ timeout: 45_000 });
    await expect(page.locator("#workspaceStandbyPanel")).toBeHidden();
    await expect.poll(() => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getRectCount())).toBe(207);
    await page.locator('label[for="editMode"]').click();
    await page.evaluate((count) => {
      const api = Reflect.get(window, "__easyLabelingTestApi");
      api.seedDetectionBoxesForTest(601);
      api.selectRectsByIndex(count === 601 ? Array.from({ length: count }, (_, index) => index) : count === 2 ? [150, 152] : [150]);
    }, count);
    const original = await snapshot(page);
    const source = original.rects.filter((rect) => original.selectedIds.includes(rect.annotationId));
    expect(source).toHaveLength(count);
    await page.keyboard.press("Control+c");
    await expect(page.locator("#activeOperationPanel")).toBeHidden();
    // Copy is asynchronous even below the progress threshold.
    await page.waitForTimeout(300);

    for (const iteration of [0, 1]) {
      const canvas = (await page.locator("canvas.upper-canvas").boundingBox())!;
      if (iteration === 1) {
        await page.mouse.move(canvas.x + canvas.width / 2, canvas.y + canvas.height / 2);
        await page.mouse.wheel(0, -250);
        await page.keyboard.down("Alt");
        await page.mouse.down();
        await page.mouse.move(canvas.x + canvas.width / 2 + 35, canvas.y + canvas.height / 2 + 20, { steps: 4 });
        await page.mouse.up();
        await page.keyboard.up("Alt");
      }
      const before = await snapshot(page);
      const pointer = { x: canvas.width * (0.55 + iteration * 0.1), y: canvas.height * 0.6 };
      const target = {
        x: (pointer.x - before.viewport[4]!) / before.viewport[0]!,
        y: (pointer.y - before.viewport[5]!) / before.viewport[3]!
      };
      await page.mouse.move(canvas.x + pointer.x, canvas.y + pointer.y);
      await page.keyboard.press("Control+v");
      await expect(page.locator("#activeOperationPanel")).toBeHidden();
      await expect.poll(async () => (await snapshot(page)).rects.length).toBe(before.rects.length + count);
      const after = await snapshot(page);
      const pasted = after.rects.slice(before.rects.length);
      const left = Math.min(...pasted.map((rect) => rect.left));
      const top = Math.min(...pasted.map((rect) => rect.top));
      const right = Math.max(...pasted.map((rect) => rect.left + rect.width));
      const bottom = Math.max(...pasted.map((rect) => rect.top + rect.height));
      // Native mouse events round screen coordinates to whole pixels.
      expect.soft(Math.abs((left + right) / 2 - target.x) * before.viewport[0]!).toBeLessThan(1);
      expect.soft(Math.abs((top + bottom) / 2 - target.y) * before.viewport[3]!).toBeLessThan(1);
      expect(after.selectedIds.sort()).toEqual(pasted.map((rect) => rect.annotationId).sort());
      expect(after.selection).not.toBeNull();
      expectSameRects(after.rects.slice(0, before.rects.length), before.rects);
      pasted.forEach((rect, index) => {
        expect(rect.left - pasted[0]!.left).toBeCloseTo(source[index]!.left - source[0]!.left, 4);
        expect(rect.top - pasted[0]!.top).toBeCloseTo(source[index]!.top - source[0]!.top, 4);
        expect(rect.width).toBeCloseTo(source[index]!.width, 4);
        expect(rect.height).toBeCloseTo(source[index]!.height, 4);
      });

      await page.keyboard.press("Control+z");
      await expect.poll(async () => (await snapshot(page)).rects.length).toBe(before.rects.length);
      const undone = await snapshot(page);
      expectSameRects(undone.rects, before.rects);
      expect(undone.selectedIds.sort()).toEqual(before.selectedIds.sort());
      await page.keyboard.press("Control+Shift+z");
      await expect.poll(async () => (await snapshot(page)).rects.length).toBe(after.rects.length);
      const redone = await snapshot(page);
      expectSameRects(redone.rects, after.rects);
      expect(redone.selectedIds.sort()).toEqual(after.selectedIds.sort());
      if (count > 1) expect(redone.selection).not.toBeNull();
      if (iteration === 0) {
        let dx = 2;
        let dy = 1;
        if (count === 601) {
          const bounds = redone.selection!;
          const dragX = canvas.x + (bounds.left + bounds.width / 2) * redone.viewport[0]! + redone.viewport[4]!;
          const dragY = canvas.y + (bounds.top + bounds.height / 2) * redone.viewport[3]! + redone.viewport[5]!;
          await page.mouse.move(dragX, dragY);
          await page.mouse.down();
          await page.mouse.move(dragX + 12, dragY + 8, { steps: 4 });
          await page.mouse.up();
          dx = 12 / redone.viewport[0]!;
          dy = 8 / redone.viewport[3]!;
        } else {
          // Tiny test boxes are covered by resize handles; use keyboard move.
          await page.keyboard.press("ArrowRight");
          await page.keyboard.press("ArrowRight");
          await page.keyboard.press("ArrowDown");
        }
        const moved = await snapshot(page);
        expect(moved.selectedIds.sort()).toEqual(redone.selectedIds.sort());
        expectSameRects(moved.rects, redone.rects.map((rect) => redone.selectedIds.includes(rect.annotationId)
          ? { ...rect, left: rect.left + dx, top: rect.top + dy }
          : rect));
      }
    }
    expect(errors).toEqual([]);
  });
}
