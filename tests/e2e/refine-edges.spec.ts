import { expect, test, type Page } from "@playwright/test";

interface Geometry { left: number; top: number; right: number; bottom: number; annotationId?: string }

// Two bright structures on a dark background; labels are off by several pixels.
const TRUTH: Geometry[] = [
  { left: 20, top: 30, right: 60, bottom: 90 },
  { left: 100, top: 30, right: 140, bottom: 90 }
];

async function geometries(page: Page): Promise<Geometry[]> {
  return page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi") as { getRectGeometries(): Geometry[] };
    return api.getRectGeometries().sort((a, b) => a.left - b.left);
  });
}

const maxError = (actual: Geometry[]): number => Math.max(...actual.flatMap((g, i) => [
  Math.abs(g.left - TRUTH[i].left), Math.abs(g.top - TRUTH[i].top), Math.abs(g.right - TRUTH[i].right), Math.abs(g.bottom - TRUTH[i].bottom)
]));

async function openSemDataset(page: Page): Promise<void> {
  await page.addInitScript((truth) => {
    const W = 200;
    const H = 120;
    const renderPng = async (): Promise<Blob> => {
      const canvas = new OffscreenCanvas(W, H);
      const context = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;
      context.fillStyle = "rgb(40,40,40)";
      context.fillRect(0, 0, W, H);
      context.fillStyle = "rgb(180,180,180)";
      for (const r of truth) context.fillRect(r.left, r.top, r.right - r.left, r.bottom - r.top);
      return canvas.convertToBlob({ type: "image/png" });
    };
    const yolo = (r: { left: number; top: number; right: number; bottom: number }) =>
      `0 ${(r.left + r.right) / 2 / W} ${(r.top + r.bottom) / 2 / H} ${(r.right - r.left) / W} ${(r.bottom - r.top) / H}`;
    const labels = [
      yolo({ left: 24, top: 27, right: 56, bottom: 94 }),
      yolo({ left: 96, top: 34, right: 145, bottom: 86 })
    ].join("\n");

    class MockFileHandle {
      kind = "file";
      constructor(public name: string, public content: string | null) {}
      async getFile() {
        if (this.content === null) return new File([await renderPng()], this.name, { type: "image/png" });
        return new File([this.content], this.name, { type: "text/plain" });
      }
      async createWritable() {
        return { write: async (data: string) => { this.content = data; }, close: async () => undefined };
      }
    }
    class MockDirectoryHandle {
      kind = "directory";
      entries = new Map<string, MockDirectoryHandle | MockFileHandle>();
      constructor(public name: string) {}
      async *values() { yield* this.entries.values(); }
      async getDirectoryHandle(name: string, options?: { create?: boolean }) {
        const existing = this.entries.get(name);
        if (existing instanceof MockDirectoryHandle) return existing;
        if (!options?.create) throw new DOMException("Directory not found", "NotFoundError");
        const created = new MockDirectoryHandle(name);
        this.entries.set(name, created);
        return created;
      }
      async getFileHandle(name: string, options?: { create?: boolean }) {
        const existing = this.entries.get(name);
        if (existing instanceof MockFileHandle) return existing;
        if (!options?.create) throw new DOMException("File not found", "NotFoundError");
        const created = new MockFileHandle(name, "");
        this.entries.set(name, created);
        return created;
      }
    }
    const images = new MockDirectoryHandle("images");
    images.entries.set("sem.png", new MockFileHandle("sem.png", null));
    const label = new MockDirectoryHandle("label");
    label.entries.set("sem.txt", new MockFileHandle("sem.txt", labels));
    images.entries.set("label", label);
    Reflect.set(window, "__refineTestFolder", images);
    Object.defineProperty(window, "showDirectoryPicker", { configurable: true, writable: true, value: async () => images });
  }, TRUTH);

  await page.goto("/index.html", { waitUntil: "domcontentloaded" });
  await expect.poll(() => page.evaluate(() => Boolean(Reflect.get(window, "__easyLabelingTestApi")))).toBe(true);
  await expect(page.locator("#loading-overlay")).toBeHidden({ timeout: 45_000 });
  await page.locator("#emptyOpenDatasetBtn").click();
  await expect.poll(async () => (await geometries(page)).length).toBe(2);
}

async function settingsFile(page: Page): Promise<{ classes: Record<string, { sides?: Record<string, string> }>; presets: { name: string }[] } | null> {
  return page.evaluate(async () => {
    const folder = Reflect.get(window, "__refineTestFolder") as { getDirectoryHandle(n: string): Promise<{ getFileHandle(n: string): Promise<{ content: string }> }> };
    try {
      const file = await (await folder.getDirectoryHandle(".easy-labeling")).getFileHandle("refine-settings.json");
      return JSON.parse(file.content);
    } catch {
      return null;
    }
  });
}

test("refine: global shortcuts snap boxes to edges in one undo step and persist class settings", async ({ page }) => {
  test.setTimeout(90_000);
  await openSemDataset(page);
  const before = await geometries(page);
  expect(maxError(before)).toBeGreaterThan(3);

  // Shift+E refines every box from the default Annotation inspector: the keys are global.
  await page.locator("#canvas-container").click({ position: { x: 5, y: 5 } });
  await page.keyboard.press("Shift+E");
  await expect.poll(async () => maxError(await geometries(page)), { timeout: 15_000 }).toBeLessThan(0.6);
  await expect(page.locator("#inspectorRefinePane")).toBeHidden();

  // One undo step restores the original labels.
  await page.keyboard.press("Control+Z");
  await expect.poll(async () => maxError(await geometries(page))).toBeCloseTo(maxError(before), 3);

  // R opens the Refine workspace on the right; per-side rule for class 0 is stored in the dataset.
  await page.keyboard.press("r");
  await expect(page.locator("#inspectorRefinePane")).toBeVisible();
  await expect(page.locator("#taskRefineBtn")).toHaveAttribute("aria-pressed", "true");
  await page.locator('#inspectorRefinePane .refine-class-chip[data-class-id="0"]').click();
  await page.locator("#refineSideB").selectOption("off");
  await expect.poll(async () => (await settingsFile(page))?.classes["0"]?.sides?.B).toBe("off");

  await page.locator("#refineAllBtn").click();
  await expect.poll(async () => (await geometries(page))[0].left, { timeout: 15_000 }).toBeCloseTo(20, 0);
  const after = await geometries(page);
  expect(after[0].bottom).toBeCloseTo(before[0].bottom, 3); // bottom edge is off for class 0
  await page.keyboard.press("r");
  await expect(page.locator("#inspectorRefinePane")).toBeHidden();

  // Opt-in auto refine: a box drawn loosely around the first structure snaps (bottom stays off for class 0).
  await page.keyboard.press("r");
  await page.locator("#inspectorRefinePane .refine-details summary", { hasText: "Advanced" }).click();
  await page.locator("#refineField-autoOnDraw").check();
  const existingIds = new Set((await geometries(page)).map((g) => g.annotationId));
  await page.locator('label[for="drawMode"]').click();
  const vt = await page.evaluate(() => (Reflect.get(window, "__easyLabelingTestApi") as { getCanvasViewportTransform(): number[] }).getCanvasViewportTransform());
  const canvasBox = (await page.locator("canvas.upper-canvas").boundingBox())!;
  const screen = (x: number, y: number) => [canvasBox.x + vt[0] * x + vt[4], canvasBox.y + vt[3] * y + vt[5]] as const;
  await page.mouse.move(...screen(16, 25));
  await page.mouse.down();
  await page.mouse.move(...screen(64, 93), { steps: 6 });
  await page.mouse.up();
  await expect(page.locator("#labelClassInput")).toBeVisible();
  await page.locator("#labelClassInput").fill("0");
  await page.locator("#saveLabelClassBtn").click();
  await expect.poll(async () => (await geometries(page)).length).toBe(3);
  await expect.poll(async () => {
    const drawn = (await geometries(page)).find((g) => !existingIds.has(g.annotationId));
    return drawn ? Math.max(Math.abs(drawn.left - 20), Math.abs(drawn.top - 30), Math.abs(drawn.right - 60)) : 99;
  }, { timeout: 15_000 }).toBeLessThan(0.6);
});

test("refine lab: tunes a draft with live results, shows polarity, and saves presets only on demand", async ({ page }) => {
  test.setTimeout(90_000);
  await openSemDataset(page);
  await page.evaluate(() => (Reflect.get(window, "__easyLabelingTestApi") as { selectRectsByIndex(i: number[]): void }).selectRectsByIndex([0, 1]));
  await page.keyboard.press("r");
  await page.locator('#inspectorRefinePane .refine-class-chip[data-class-id="0"]').click();
  await page.locator("#openRefineLabBtn").click();
  const lab = page.locator("#refineLabModal");
  await expect(lab).toBeVisible();
  await expect(lab.locator(".refine-lab-case")).toHaveCount(2);
  await expect(page.locator("#refineLabReadout")).toContainText("bright → dark");
  await expect(page.locator("#refineLabStatus")).toContainText("0 to review");

  // The structures are bright inside: forcing the opposite polarity must fail visibly in the draft.
  await page.locator("#refineLabField-polarity").selectOption("darkInside");
  await expect(page.locator("#refineLabStatus")).toContainText("2 to review");
  await expect(page.locator("#refineLabReadout")).toContainText("differs from the image");
  await page.locator("#refineLabField-polarity").selectOption("brightInside");
  await expect(page.locator("#refineLabStatus")).toContainText("0 to review");

  // Cancel discards the draft.
  await lab.locator(".btn-close").click();
  await expect(lab).toBeHidden();
  await expect(page.locator("#refineField-polarity")).toHaveValue("auto");

  // Reopen, keep the fixed polarity, save it as a preset and refine the cases on the canvas.
  await page.locator("#openRefineLabBtn").click();
  await expect(lab).toBeVisible();
  await page.locator("#refineLabField-polarity").selectOption("brightInside");
  await lab.locator('[data-ref="presetName"]').fill("Bright fins");
  await lab.locator('[data-act="savePreset"]').click();
  await page.locator("#refineLabApplyBtn").click();
  await expect(lab).toBeHidden();
  await expect.poll(async () => maxError(await geometries(page)), { timeout: 15_000 }).toBeLessThan(0.6);
  await expect.poll(async () => (await settingsFile(page))?.presets.map((preset) => preset.name)).toEqual(["Bright fins"]);
  await expect(page.locator("#refineField-polarity")).toHaveValue("brightInside");
  await expect(page.locator('#inspectorRefinePane [data-ref="presetSelect"] option', { hasText: "Bright fins" })).toHaveCount(1);
});

test("refine: per-side edge rules, use-for-all-sides, and remembered search range opacity", async ({ page }) => {
  test.setTimeout(90_000);
  await openSemDataset(page);
  await page.keyboard.press("r");
  const pane = page.locator("#inspectorRefinePane");
  await pane.locator('.refine-class-chip[data-class-id="0"]').click();

  // Right edge only: wider inward search and fixed polarity; other sides keep the shared rule.
  await pane.locator('.refine-scope [data-scope="R"]').click();
  await expect(pane.locator("#refineField-contextRing")).toBeHidden();
  await pane.locator("#refineField-rangeIn").fill("18");
  await pane.locator("#refineField-polarity").selectOption("brightInside");
  await expect(pane.locator('.refine-scope [data-scope="R"]')).toHaveClass(/has-override/);
  await expect.poll(async () => (await settingsFile(page))?.classes["0"]).toEqual({ sideRules: { R: { rangeIn: 18, polarity: "brightInside" } } });
  await pane.locator('.refine-scope [data-scope="all"]').click();
  await expect(pane.locator("#refineField-rangeIn")).toHaveValue("10");

  // Left edge only: scan past the box ends (outside-only) to use an edge visible above/below the box.
  await pane.locator('.refine-scope [data-scope="L"]').click();
  await expect(pane.locator('label[for="refineField-extendStart"]')).toHaveText("Extend above (px)");
  await expect(pane.locator("#refineField-extendStart")).toBeDisabled();
  await pane.locator("#refineField-scanSpan").selectOption("outside");
  await pane.locator("#refineField-extendStart").fill("20");
  await expect.poll(async () => (await settingsFile(page))?.classes["0"]).toEqual({
    sideRules: { R: { rangeIn: 18, polarity: "brightInside" }, L: { scanSpan: "outside", extendStart: 20 } }
  });
  await pane.locator('.refine-scope [data-scope="T"]').click();
  await expect(pane.locator('label[for="refineField-extendStart"]')).toHaveText("Extend left (px)");
  await pane.locator('.refine-scope [data-scope="L"]').click();
  await pane.locator("#refineField-scanSpan").locator("..").locator(".refine-field-reset").click();
  await pane.locator("#refineField-extendStart").locator("..").locator(".refine-field-reset").click();

  // Promote the right edge's rule to every side.
  await pane.locator('.refine-scope [data-scope="R"]').click();
  await pane.locator('[data-act="sideToAll"]').click();
  await expect(pane.locator('.refine-scope [data-scope="all"]')).toHaveAttribute("aria-pressed", "true");
  await expect(pane.locator("#refineField-rangeIn")).toHaveValue("18");
  await expect(pane.locator('.refine-scope .has-override')).toHaveCount(0);

  // Search range opacity is adjustable in the lab and remembered.
  await page.evaluate(() => (Reflect.get(window, "__easyLabelingTestApi") as { selectRectsByIndex(i: number[]): void }).selectRectsByIndex([0]));
  await page.locator("#openRefineLabBtn").click();
  const opacity = page.locator("#refineLabBandOpacity");
  await expect(opacity).toBeVisible();
  await opacity.fill("80");
  await page.locator("#refineLabModal .btn-close").click();
  await page.locator("#openRefineLabBtn").click();
  await expect(page.locator("#refineLabBandOpacity")).toHaveValue("80");
});
