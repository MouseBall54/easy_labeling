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

/**
 * Image size, bright structures (TRUTH by default), extra rectangles painted over them, the saved label boxes
 * (two boxes a few pixels off TRUTH by default), and a refine-settings.json to start with.
 */
interface SemScene {
  size?: { width: number; height: number };
  structures?: Geometry[];
  extra?: { rect: Geometry; gray: number }[];
  labels?: Geometry[];
  settings?: unknown;
  /** Images in the folder (same pixels and labels): sem.png, sem2.png, ... */
  images?: number;
}
const SEM_LABELS: Geometry[] = [{ left: 24, top: 27, right: 56, bottom: 94 }, { left: 96, top: 34, right: 145, bottom: 86 }];

async function openSemDataset(page: Page, scene: SemScene = {}): Promise<void> {
  const labelBoxes = scene.labels ?? SEM_LABELS;
  await page.addInitScript(({ truth, extra, settings, size, boxes, imageCount }) => {
    const W = size.width;
    const H = size.height;
    const renderPng = async (): Promise<Blob> => {
      const canvas = new OffscreenCanvas(W, H);
      const context = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;
      context.fillStyle = "rgb(40,40,40)";
      context.fillRect(0, 0, W, H);
      context.fillStyle = "rgb(180,180,180)";
      for (const r of truth) context.fillRect(r.left, r.top, r.right - r.left, r.bottom - r.top);
      for (const { rect: r, gray } of extra) {
        context.fillStyle = `rgb(${gray},${gray},${gray})`;
        context.fillRect(r.left, r.top, r.right - r.left, r.bottom - r.top);
      }
      return canvas.convertToBlob({ type: "image/png" });
    };
    const yolo = (r: { left: number; top: number; right: number; bottom: number }) =>
      `0 ${(r.left + r.right) / 2 / W} ${(r.top + r.bottom) / 2 / H} ${(r.right - r.left) / W} ${(r.bottom - r.top) / H}`;
    const labels = boxes.map(yolo).join("\n");

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
    const label = new MockDirectoryHandle("label");
    for (let index = 1; index <= imageCount; index += 1) {
      const base = index === 1 ? "sem" : `sem${index}`;
      images.entries.set(`${base}.png`, new MockFileHandle(`${base}.png`, null));
      label.entries.set(`${base}.txt`, new MockFileHandle(`${base}.txt`, labels));
    }
    images.entries.set("label", label);
    if (settings !== null) {
      const tools = new MockDirectoryHandle(".easy-labeling");
      tools.entries.set("refine-settings.json", new MockFileHandle("refine-settings.json", JSON.stringify(settings)));
      images.entries.set(".easy-labeling", tools);
    }
    Reflect.set(window, "__refineTestFolder", images);
    Object.defineProperty(window, "showDirectoryPicker", { configurable: true, writable: true, value: async () => images });
  }, { truth: scene.structures ?? TRUTH, extra: scene.extra ?? [], settings: scene.settings ?? null, size: scene.size ?? { width: 200, height: 120 }, boxes: labelBoxes, imageCount: scene.images ?? 1 });

  await page.goto("/index.html", { waitUntil: "domcontentloaded" });
  await expect.poll(() => page.evaluate(() => Boolean(Reflect.get(window, "__easyLabelingTestApi")))).toBe(true);
  await expect(page.locator("#loading-overlay")).toBeHidden({ timeout: 45_000 });
  await page.locator("#emptyOpenDatasetBtn").click();
  await expect.poll(async () => (await geometries(page)).length).toBe(labelBoxes.length);
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

const lab = (page: Page) => page.locator("#refineLabModal");
/** Readout line for the box core and background ring medians Surroundings measured. */
const surroundingsLine = (inside: number, outside: number): RegExp => new RegExp(`box core \\(dotted\\) ${inside} → background ring \\([^)]*\\) ${outside}:`);
/** Switches the Lab to Reclass mode (a no-op when it is already there). */
const openReclass = (page: Page) => page.locator("#refineLabEditor [data-ref='mode'] [data-mode='reclass']").click();

async function openLab(page: Page): Promise<void> {
  await page.locator("#openRefineLabBtn").click();
  await expect(lab(page)).toBeVisible();
}

/** Save settings needs a preset name: an empty field gets presetName. */
async function saveLab(page: Page, presetName = "Lab"): Promise<void> {
  const name = page.locator("#refineLabEditor [data-ref='presetName']");
  if (!(await name.inputValue())) await name.fill(presetName);
  await page.locator("#refineLabSaveBtn").click();
  await expect(lab(page)).toBeHidden();
}

/** Makes class `classId` the only edited target in the lab (chips toggle, so only click when needed). */
async function editClass(page: Page, classId: string): Promise<void> {
  const chips = page.locator("#refineLabEditor .refine-class-chip");
  for (const chip of await chips.all()) {
    const id = await chip.getAttribute("data-class-id");
    const pressed = await chip.getAttribute("aria-pressed") === "true";
    if (id && id !== classId && pressed) await chip.click();
  }
  const target = page.locator(`#refineLabEditor .refine-class-chip[data-class-id="${classId}"]`);
  if (await target.getAttribute("aria-pressed") !== "true") await target.click();
  await expect(target).toHaveAttribute("aria-pressed", "true");
}

const selectBoxes = (page: Page, indices: number[]) => page.evaluate((list) =>
  (Reflect.get(window, "__easyLabelingTestApi") as { selectRectsByIndex(i: number[]): void }).selectRectsByIndex(list), indices);

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

  // R opens the apply-only Refine workspace; settings are edited in the lab and stored in the dataset.
  await page.keyboard.press("r");
  const pane = page.locator("#inspectorRefinePane");
  await expect(pane).toBeVisible();
  await expect(page.locator("#taskRefineBtn")).toHaveAttribute("aria-pressed", "true");
  await expect(pane.locator(".refine-class-chip")).toHaveCount(0);
  await expect(page.locator("#refineSettingsSummary")).toContainText("every class uses the default");
  await openLab(page);
  await editClass(page, "0");
  await page.locator("#refineLabSideB").selectOption("off");
  await saveLab(page);
  await expect.poll(async () => (await settingsFile(page))?.classes["0"]?.sides?.B).toBe("off");
  await expect(page.locator("#refineSettingsSummary")).toContainText("1 class with own settings");

  await page.locator("#refineAllBtn").click();
  await expect.poll(async () => (await geometries(page))[0].left, { timeout: 15_000 }).toBeCloseTo(20, 0);
  const after = await geometries(page);
  expect(after[0].bottom).toBeCloseTo(before[0].bottom, 3); // bottom edge is off for class 0
  await page.keyboard.press("r");
  await expect(pane).toBeHidden();

  // Opt-in auto refine: a box drawn loosely around the first structure snaps (bottom stays off for class 0).
  await page.keyboard.press("r");
  await openLab(page);
  await editClass(page, "0");
  await page.locator("#refineLabEditor .refine-details summary", { hasText: "Advanced" }).click();
  // Refine is always on for every class: there is no switch for it.
  await expect(page.locator("#refineLabField-enabled")).toHaveCount(0);
  await page.locator("#refineLabField-autoOnDraw").check();
  await saveLab(page);
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
  await selectBoxes(page, [0, 1]);
  await page.keyboard.press("r");
  await openLab(page);
  await expect(lab(page).locator(".refine-lab-case")).toHaveCount(2);
  await expect(page.locator("#refineLabReadout")).toContainText("bright → dark");
  await expect(page.locator("#refineLabStatus")).toContainText("0 to review");

  // The structures are bright inside: forcing the opposite polarity must fail visibly in the draft.
  await page.locator("#refineLabField-polarity").selectOption("darkInside");
  await expect(page.locator("#refineLabStatus")).toContainText("2 to review");
  await expect(page.locator("#refineLabReadout")).toContainText("differs from the image");
  await page.locator("#refineLabField-polarity").selectOption("brightInside");
  await expect(page.locator("#refineLabStatus")).toContainText("0 to review");

  // Processed image: the lab re-crops from the Preprocess output, so the measured brightness changes.
  const originalReadout = await page.locator("#refineLabReadout").textContent();
  await lab(page).locator('[data-image-source="processed"]').click();
  await expect(lab(page).locator('[data-image-source="processed"]')).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => page.locator("#refineLabReadout").textContent()).not.toBe(originalReadout);
  await lab(page).locator('[data-image-source="original"]').click();
  await expect.poll(() => page.locator("#refineLabReadout").textContent()).toBe(originalReadout);

  // Clicking a search band opens that side's Edge rule.
  const zoom = page.locator("#refineLabZoom");
  const zoomBox = (await zoom.boundingBox())!;
  let bandX = -1;
  for (let x = zoomBox.x + 4; x < zoomBox.x + zoomBox.width / 2; x += 3) {
    await page.mouse.move(x, zoomBox.y + zoomBox.height / 2);
    if (await zoom.evaluate((element) => (element as HTMLElement).style.cursor) === "pointer") { bandX = x; break; }
  }
  expect(bandX).toBeGreaterThan(0);
  await page.mouse.click(bandX + 2, zoomBox.y + zoomBox.height / 2);
  await expect(lab(page).locator('#refineLabEditor .refine-scope [data-scope="L"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#refineLabSideTabs [data-side=L]")).toHaveAttribute("aria-pressed", "true");
  await lab(page).locator('#refineLabEditor .refine-scope [data-scope="all"]').click();

  // Cancel discards the draft.
  await lab(page).locator(".btn-close").click();
  await expect(lab(page)).toBeHidden();
  await openLab(page);
  await expect(page.locator("#refineLabField-polarity")).toHaveValue("auto");

  // Keep the fixed polarity, save it as a preset and refine the cases on the canvas.
  await page.locator("#refineLabField-polarity").selectOption("brightInside");
  await lab(page).locator('[data-ref="presetName"]').fill("Bright fins");
  await lab(page).locator('[data-act="savePreset"]').click();
  await page.locator("#refineLabApplyBtn").click();
  await expect(lab(page)).toBeHidden();
  await expect.poll(async () => maxError(await geometries(page)), { timeout: 15_000 }).toBeLessThan(0.6);
  await expect.poll(async () => (await settingsFile(page))?.presets.map((preset) => preset.name)).toEqual(["Bright fins"]);
  expect((await settingsFile(page) as unknown as { imageSource: string }).imageSource).toBe("original");
  await expect(page.locator("#refineSettingsSummary")).toContainText("every class uses the default");
  await expect(page.locator("#refineRunPresetSelect option", { hasText: "Bright fins" })).toHaveCount(1);
  await expect(page.locator("#refineRunPresetSelect")).toHaveValue("");
  await expect(page.locator("#refineRunPresetDetail")).toHaveText("Default rule for every class");
  await page.locator("#refineRunPresetSelect").selectOption("Bright fins");
  await expect(page.locator("#refineRunPresetDetail")).toHaveText("Gradient · in 10 / out 10 px · step 2 px · Original");
  await page.locator("#refineRunPresetSelect").selectOption("");
  await openLab(page);
  await expect(page.locator("#refineLabField-polarity")).toHaveValue("brightInside");

  // Choosing a preset applies it at once, without pressing Apply.
  await page.locator("#refineLabField-polarity").selectOption("auto");
  await lab(page).locator('[data-ref="presetSelect"]').selectOption("Bright fins");
  await expect(page.locator("#refineLabField-polarity")).toHaveValue("brightInside");

  // Zoom view: the wheel zooms around the pointer, dragging pans without picking a side, double-click fits.
  const fitButton = page.locator("#refineLabFitBtn");
  const viewBox = (await zoom.boundingBox())!;
  const [cx, cy] = [viewBox.x + viewBox.width / 2, viewBox.y + viewBox.height / 2];
  await expect(fitButton).toBeDisabled();
  const fitted = await zoom.screenshot();
  await page.mouse.move(cx, cy);
  await page.mouse.wheel(0, -500);
  await expect(fitButton).toBeEnabled();
  await expect(fitButton).toContainText(/\d+% · Fit/);
  for (const theme of ["light", "dark"]) {
    await page.evaluate((dark) => { const toggle = document.getElementById("darkModeToggle") as HTMLInputElement; toggle.checked = dark; toggle.dispatchEvent(new Event("change", { bubbles: true })); }, theme === "dark");
    await lab(page).locator(".refine-lab-view-column").screenshot({ path: `test-results/refine-lab-zoomed-${theme}.png` });
  }
  await page.evaluate(() => { const toggle = document.getElementById("darkModeToggle") as HTMLInputElement; toggle.checked = false; toggle.dispatchEvent(new Event("change", { bubbles: true })); });
  const zoomed = await zoom.screenshot();
  expect(Buffer.compare(zoomed, fitted)).not.toBe(0);
  const sideBefore = await page.locator("#refineLabSideTabs [aria-pressed=true]").getAttribute("data-side");
  await page.mouse.down();
  await page.mouse.move(cx + 60, cy + 10, { steps: 5 });
  await page.mouse.up();
  await expect.poll(async () => Buffer.compare(await zoom.screenshot(), zoomed) !== 0).toBe(true);
  await expect(page.locator("#refineLabSideTabs [aria-pressed=true]")).toHaveAttribute("data-side", sideBefore!);
  await zoom.dblclick({ position: { x: viewBox.width / 2, y: viewBox.height / 2 } });
  await expect(fitButton).toBeDisabled();
});

test("refine lab: picks top and bottom as a pair and explains the pick", async ({ page }) => {
  test.setTimeout(90_000);
  await openSemDataset(page);
  await selectBoxes(page, [0]);
  await page.keyboard.press("r");
  await openLab(page);
  const pick = page.locator("#refineLabField-pairTBPick");
  await expect(pick).toBeDisabled();
  await page.locator("#refineLabField-pairTB").selectOption("grow");
  await expect(pick).toBeEnabled();
  await page.locator("#refineLabSideTabs [data-side=T]").click();
  await expect(page.locator("#refineLabReadout")).toContainText("Top + bottom pair: prefer growing");
  for (const theme of ["light", "dark"]) {
    await page.evaluate((dark) => { const toggle = document.getElementById("darkModeToggle") as HTMLInputElement; toggle.checked = dark; toggle.dispatchEvent(new Event("change", { bubbles: true })); }, theme === "dark");
    await page.locator("#refineLabField-pairTB").evaluate((element) => element.scrollIntoView({ block: "center" }));
    await lab(page).screenshot({ path: `test-results/refine-lab-pair-${theme}.png` });
  }
  await page.evaluate(() => { const toggle = document.getElementById("darkModeToggle") as HTMLInputElement; toggle.checked = false; toggle.dispatchEvent(new Event("change", { bubbles: true })); });
  await lab(page).locator('[data-ref="presetName"]').fill("Pairs");
  await lab(page).locator('[data-act="savePreset"]').click();
  await page.locator("#refineLabApplyBtn").click();
  await expect(lab(page)).toBeHidden();
  await expect.poll(async () => ((await settingsFile(page)) as unknown as { default: { pairTB: string } } | null)?.default.pairTB).toBe("grow");
  await page.locator("#refineRunPresetSelect").selectOption("Pairs");
  await expect(page.locator("#refineRunPresetDetail")).toContainText("T+B grow");
});

test("refine: per-side edge rules, use-for-all-sides, and remembered search range opacity", async ({ page }) => {
  test.setTimeout(90_000);
  await openSemDataset(page);
  await selectBoxes(page, [0]);
  await page.keyboard.press("r");
  await openLab(page);
  const editor = page.locator("#refineLabEditor");
  await editClass(page, "0");

  // Right edge only: wider inward search and fixed polarity; other sides keep the shared rule.
  await editor.locator('.refine-scope [data-scope="R"]').click();
  await expect(editor.locator("#refineLabField-contextRing")).toBeHidden();
  await editor.locator("#refineLabField-rangeIn").fill("18");
  await editor.locator("#refineLabField-polarity").selectOption("brightInside");
  await expect(editor.locator('.refine-scope [data-scope="R"]')).toHaveClass(/has-override/);
  await editor.locator('.refine-scope [data-scope="all"]').click();
  await expect(editor.locator("#refineLabField-rangeIn")).toHaveValue("10");

  // Left edge only: scan past the box ends (outside-only) to use an edge visible above/below the box.
  await editor.locator('.refine-scope [data-scope="L"]').click();
  await expect(editor.locator('label[for="refineLabField-extendStart"]')).toHaveText("Extend above (px)");
  await expect(editor.locator("#refineLabField-extendStart")).toBeDisabled();
  await editor.locator("#refineLabField-scanSpan").selectOption("outside");
  await editor.locator("#refineLabField-extendStart").fill("20");
  await editor.locator('.refine-scope [data-scope="T"]').click();
  await expect(editor.locator('label[for="refineLabField-extendStart"]')).toHaveText("Extend left (px)");
  await saveLab(page);
  await expect.poll(async () => (await settingsFile(page))?.classes["0"]).toEqual({
    sideRules: { R: { rangeIn: 18, polarity: "brightInside" }, L: { scanSpan: "outside", extendStart: 20 } }
  });

  // Clear the left edge's own values, then promote the right edge's rule to every side.
  await openLab(page);
  await editClass(page, "0");
  await editor.locator('.refine-scope [data-scope="L"]').click();
  await editor.locator("#refineLabField-scanSpan").locator("..").locator(".refine-field-reset").click();
  await editor.locator("#refineLabField-extendStart").locator("..").locator(".refine-field-reset").click();
  await editor.locator('.refine-scope [data-scope="R"]').click();
  await editor.locator('[data-act="sideToAll"]').click();
  await expect(editor.locator('.refine-scope [data-scope="all"]')).toHaveAttribute("aria-pressed", "true");
  await expect(editor.locator("#refineLabField-rangeIn")).toHaveValue("18");
  await expect(editor.locator(".refine-scope .has-override")).toHaveCount(0);

  // Search range opacity is adjustable in the lab and remembered.
  const opacity = page.locator("#refineLabBandOpacity");
  await opacity.fill("80");
  await saveLab(page);
  await expect.poll(async () => (await settingsFile(page))?.classes["0"]).toMatchObject({ rangeIn: 18, polarity: "brightInside" });
  await openLab(page);
  await expect(page.locator("#refineLabBandOpacity")).toHaveValue("80");
  // The gradient step is a saved edge-rule setting (it also sets the change plot's step). The lab
  // reopens on the Default, so it lands there.
  await expect(page.locator("#refineLabField-gradStep")).toHaveValue("2");
  await page.locator("#refineLabField-gradStep").fill("3");
  await saveLab(page);
  await expect.poll(async () => (await settingsFile(page) as unknown as { default: object } | null)?.default).toMatchObject({ gradStep: 3 });
  await openLab(page);
  await expect(page.locator("#refineLabField-gradStep")).toHaveValue("3");
});

test("refine lab: extreme search settings reach through the box, widen the preview and still refine", async ({ page }) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openSemDataset(page);
  await selectBoxes(page, [0]);
  await page.keyboard.press("r");
  await openLab(page);
  const editor = page.locator("#refineLabEditor");
  const readout = page.locator("#refineLabReadout");
  const zoom = page.locator("#refineLabZoom");
  await editClass(page, "0");
  await page.locator("#refineLabField-avoidNeighbors").uncheck();
  await editor.locator('.refine-scope [data-scope="R"]').click();
  await expect(readout).toContainText("Search 10 px in · 10 px out");

  // Inward: past the old centre limit up to the opposite side, which the readout names.
  const box = (await geometries(page))[0]!;
  await editor.locator("#refineLabField-rangeIn").fill("2000");
  await expect(readout).toContainText(/Search \d+ px in \(box limit\)/);
  await lab(page).screenshot({ path: "test-results/refine-lab-search-light.png" });
  await page.evaluate(() => (document.querySelector("#darkModeToggle") as HTMLInputElement).click());
  await lab(page).screenshot({ path: "test-results/refine-lab-search-dark.png" });
  await zoom.screenshot({ path: "test-results/refine-lab-inward-2000.png" });
  const inward = Number(/Search (\d+) px in/.exec((await readout.textContent()) ?? "")![1]);
  expect(inward).toBeGreaterThan((box.right - box.left) / 2);

  // Outward: far past the old 80 px cap and the 128 px crop; the zoom view keeps widening with it.
  const shots: Buffer[] = [await zoom.screenshot()];
  for (const range of ["150", "600"]) {
    await editor.locator("#refineLabField-rangeOut").fill(range);
    await expect(readout).toContainText(`· ${range} px out`);
    await expect.poll(async () => Buffer.compare(await zoom.screenshot(), shots[shots.length - 1]!) !== 0).toBe(true);
    shots.push(await zoom.screenshot());
  }
  await expect(editor.locator("#refineLabField-rangeOut")).toHaveValue("600");
  await zoom.screenshot({ path: "test-results/refine-lab-outward-600.png" });

  // Every advanced value at its bound at once: the draft still refines every case without errors.
  await editor.locator('.refine-scope [data-scope="all"]').click();
  await editor.locator("details.refine-details", { has: page.locator("#refineLabField-segments") }).evaluate((details) => { (details as HTMLDetailsElement).open = true; });
  for (const [key, value] of [["rangeOut", "2000"], ["sigma", "12"], ["gradStep", "64"], ["segments", "100"], ["inset", "49"], ["iterations", "6"], ["contextRing", "500"]] as const) {
    await editor.locator(`#refineLabField-${key}`).fill(value);
  }
  await editor.locator("#refineLabField-scanSpan").selectOption("boxOutside");
  await editor.locator("#refineLabField-extendStart").fill("4000");
  await editor.locator("#refineLabField-extendEnd").fill("4000");
  await expect(page.locator("#refineLabStatus")).toContainText(/1 cases? · \d+ to review/, { timeout: 60_000 });
  await expect(editor.locator("#refineLabField-segments")).toHaveValue("100");
  await zoom.screenshot({ path: "test-results/refine-lab-extreme.png" });
  expect(errors).toEqual([]);
});

test("refine lab: opens on the Default, classes inherit it, and outward ranges stay visible on every side", async ({ page }) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openSemDataset(page);
  await selectBoxes(page, [0]);
  await page.keyboard.press("r");
  await openLab(page);
  const editor = page.locator("#refineLabEditor");
  const readout = page.locator("#refineLabReadout");
  const zoom = page.locator("#refineLabZoom");
  const chip = (classId: string) => editor.locator(`.refine-class-chip[data-class-id="${classId}"]`);
  await expect(chip("")).toHaveAttribute("aria-pressed", "true");
  await expect(chip("0")).toHaveAttribute("aria-pressed", "false");

  // Outward search on each side, neighbour stop on: the band keeps growing with the setting even where
  // the search itself stops (halfway to the neighbour, or at the image border), and the readout says why.
  for (const side of ["T", "L", "R", "B"] as const) {
    await editor.locator(`.refine-scope [data-scope="${side}"]`).click();
    const shots: Buffer[] = [];
    for (const range of ["40", "100", "200"]) {
      await editor.locator("#refineLabField-rangeOut").fill(range);
      await expect(readout).toContainText(new RegExp(`Search \\d+ px in(?: \\(box limit\\))? · \\d+ px out`));
      if (Number(range) > 40) await expect(readout).toContainText(/(set \d+, stops halfway to a neighbour|image edge after \d+ px)/);
      await expect.poll(async () => { const shot = await zoom.screenshot(); return shots.every((previous) => Buffer.compare(previous, shot) !== 0); }, { message: `${side} ${range}` }).toBe(true);
      shots.push(await zoom.screenshot());
    }
    await zoom.screenshot({ path: `test-results/refine-lab-outward-${side}-200.png` });
    await editor.locator("#refineLabField-rangeOut").locator("..").locator(".refine-field-reset").click();
  }
  await editor.locator('.refine-scope [data-scope="all"]').click();

  // A class starts from the Default's values and keeps only what is changed for it.
  await editor.locator("#refineLabField-rangeIn").fill("14");
  await chip("0").click();
  await expect(chip("")).toHaveAttribute("aria-pressed", "false");
  await expect(editor.locator("#refineLabField-rangeIn")).toHaveValue("14");
  await expect(editor.locator("#refineLabField-rangeIn").locator("xpath=ancestor::*[contains(@class,'refine-field')][1]")).not.toHaveClass(/is-overridden/);
  await editor.locator("#refineLabField-rangeOut").fill("30");
  await expect(editor.locator("#refineLabField-rangeOut").locator("xpath=ancestor::*[contains(@class,'refine-field')][1]")).toHaveClass(/is-overridden/);
  await saveLab(page);
  const saved = async () => await settingsFile(page) as unknown as { default: Record<string, unknown>; classes: Record<string, unknown> } | null;
  await expect.poll(async () => (await saved())?.default).toMatchObject({ rangeIn: 14 });
  expect((await saved())?.classes["0"]).toEqual({ rangeOut: 30 });

  // Later Default changes still reach the class for every value it did not specialise.
  await openLab(page);
  await expect(chip("")).toHaveAttribute("aria-pressed", "true");
  await editor.locator("#refineLabField-rangeIn").fill("16");
  await chip("0").click();
  await expect(editor.locator("#refineLabField-rangeIn")).toHaveValue("16");
  await expect(editor.locator("#refineLabField-rangeOut")).toHaveValue("30");
  await saveLab(page);
  await expect.poll(async () => (await saved())?.default).toMatchObject({ rangeIn: 16 });
  expect((await saved())?.classes["0"]).toEqual({ rangeOut: 30 });
  expect(errors).toEqual([]);
});

test("refine lab: scanned parts searched together or the strongest part alone, with one curve per part", async ({ page }) => {
  test.setTimeout(90_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openSemDataset(page);
  await selectBoxes(page, [0]);
  await page.keyboard.press("r");
  await openLab(page);
  const editor = page.locator("#refineLabEditor");
  const readout = page.locator("#refineLabReadout");
  const profile = page.locator("#refineLabProfile");
  await editClass(page, "0");
  await editor.locator('.refine-scope [data-scope="L"]').click();
  // The option only matters once parts beyond the box are scanned.
  await expect(editor.locator("#refineLabField-partMode")).toBeDisabled();
  await editor.locator("#refineLabField-scanSpan").selectOption("boxOutside");
  await editor.locator("#refineLabField-extendStart").fill("10");
  await editor.locator("#refineLabField-extendEnd").fill("10");
  await expect(editor.locator("#refineLabField-partMode")).toBeEnabled();
  await expect(editor.locator("#refineLabField-partMode")).toHaveValue("together");
  await expect(readout).not.toContainText("Parts (strength)");
  const together = await profile.screenshot();

  await editor.locator("#refineLabField-partMode").selectOption("strongest");
  // Left edge: parts above the box, the box, below it; one of them sets the edge.
  await expect(readout).toContainText(/Parts \(strength\): Top end (?:[\d.]+|no edge)(?: — used)? · Box (?:[\d.]+|no edge)(?: — used)? · Bottom end (?:[\d.]+|no edge)(?: — used)?/);
  await expect(readout).toContainText("— used");
  await expect.poll(async () => Buffer.compare(await profile.screenshot(), together) !== 0).toBe(true);
  await profile.screenshot({ path: "test-results/refine-lab-parts-profile.png" });
  await page.locator("#refineLabZoom").screenshot({ path: "test-results/refine-lab-parts-zoom.png" });
  await expect(page.locator("#refineLabStatus")).toContainText(/1 cases? · \d+ to review/);

  // Outside only with inward parts: each end reaches into the box; the middle is left out.
  await expect(editor.locator("#refineLabField-inwardStart")).toBeEnabled();
  await expect(editor.locator("label[for='refineLabField-inwardStart']")).toHaveText("Into box from top (px)");
  await editor.locator("#refineLabField-scanSpan").selectOption("outside");
  await expect(readout).toContainText(/Parts \(strength\): Top end (?:[\d.]+|no edge)(?: — used)? · Bottom end/);
  const strongestOutside = await profile.screenshot();
  await editor.locator("#refineLabField-inwardStart").fill("8");
  await editor.locator("#refineLabField-inwardEnd").fill("8");
  await expect(readout).toContainText(/Parts \(strength\): Top end (?:[\d.]+|no edge)(?: — used)? · Bottom end (?:[\d.]+|no edge)(?: — used)?/);
  await expect.poll(async () => Buffer.compare(await profile.screenshot(), strongestOutside) !== 0).toBe(true);
  await profile.screenshot({ path: "test-results/refine-lab-inward-profile.png" });
  await page.locator("#refineLabZoom").screenshot({ path: "test-results/refine-lab-inward-zoom.png" });
  // Ends that meet inside the box are read once, as one part (so one profile, no parts).
  await editor.locator("#refineLabField-inwardStart").fill("4000");
  await expect(readout).not.toContainText("Parts (strength)");
  await editor.locator("#refineLabField-inwardStart").fill("8");
  await expect(readout).toContainText("Parts (strength)");

  await saveLab(page);
  await expect.poll(async () => (await settingsFile(page))?.classes["0"]).toMatchObject({ sideRules: { L: { scanSpan: "outside", partMode: "strongest", inwardStart: 8, inwardEnd: 8 } } });
  expect(errors).toEqual([]);
});

test("refine lab: explains how each edge is picked and can drop the preference for nearby edges", async ({ page }) => {
  test.setTimeout(90_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openSemDataset(page);
  await selectBoxes(page, [0]);
  await page.keyboard.press("r");
  await openLab(page);
  const editor = page.locator("#refineLabEditor");
  const readout = page.locator("#refineLabReadout");
  const profile = page.locator("#refineLabProfile");
  const zoom = page.locator("#refineLabZoom");
  await editClass(page, "0");
  await editor.locator('.refine-scope [data-scope="R"]').click();
  const near = editor.locator("#refineLabField-nearWeight");
  await expect(near).toBeChecked();
  await expect(readout).toContainText(/Max gradient: largest bright → dark change weighted toward the current edge · 6 segments: \d found, \d kept \(≥ ½ best confidence\) → Outermost \(10% toward outside\) = (out|in) [\d.]+ px · after 2 passes: (out|in) [\d.]+ px/);
  await profile.screenshot({ path: "test-results/refine-lab-pick-near.png" });
  await zoom.screenshot({ path: "test-results/refine-lab-pick-zoom.png" });
  const weighted = await profile.screenshot();

  await near.uncheck();
  await expect(readout).toContainText("anywhere in the range");
  await expect.poll(async () => Buffer.compare(await profile.screenshot(), weighted) !== 0).toBe(true);
  await profile.screenshot({ path: "test-results/refine-lab-pick-anywhere.png" });
  await editor.locator("#refineLabField-comb").selectOption("median");
  await expect(readout).toContainText("→ Median =");

  // The 50% level always takes the nearest crossing, so the option does not apply to it.
  await editor.locator("#refineLabField-crit").selectOption("thr");
  await expect(near).toBeDisabled();
  await expect(readout).toContainText("50% level: crossing nearest the current edge");
  await editor.locator("#refineLabField-crit").selectOption("grad");
  await saveLab(page);
  await expect.poll(async () => (await settingsFile(page))?.classes["0"]).toMatchObject({ sideRules: { R: { nearWeight: false, comb: "median" } } });
  expect(errors).toEqual([]);
});

test("refine: processed image follows the Preprocess panel's contrast and gamma", async ({ page }) => {
  test.setTimeout(90_000);
  await openSemDataset(page);
  const setPreprocess = (id: string, value: string) => page.evaluate(([elementId, next]) => {
    const element = document.getElementById(elementId) as HTMLInputElement | HTMLSelectElement;
    element.value = next;
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }, [id, value] as const);
  await setPreprocess("segmentationPreprocessModeSelect", "original");
  await setPreprocess("segmentationPreprocessContrastInput", "200");
  await expect(page.locator("#segmentationPreprocessContrastValue")).toHaveText("200%");
  await selectBoxes(page, [0]);
  await page.keyboard.press("r");
  await openLab(page);
  await lab(page).locator('[data-image-source="processed"]').click();
  // 180 -> (180 - 127.5) * 2 + 127.5 = 232.5; 40 -> clipped to 0.
  await expect(page.locator("#refineLabReadout")).toContainText(surroundingsLine(233, 0));
  await saveLab(page);
  await expect(page.locator("#refineSettingsSummary")).toContainText("image Processed (live Preprocess panel)");
  await setPreprocess("segmentationPreprocessContrastInput", "100");
  await setPreprocess("segmentationPreprocessGammaInput", "200");
  await expect(page.locator("#segmentationPreprocessGammaValue")).toHaveText("2.00");
  await openLab(page);
  // 40 -> 255 * (40 / 255) ^ 0.5 = 101; 180 -> 214.
  await expect(page.locator("#refineLabReadout")).toContainText(surroundingsLine(214, 101));
});

test("preprocess: SEM filters reach the processed image and Reset restores the defaults", async ({ page }) => {
  test.setTimeout(90_000);
  await openSemDataset(page);
  const setPreprocess = (id: string, value: string | boolean) => page.evaluate(([elementId, next]) => {
    const element = document.getElementById(elementId) as HTMLInputElement | HTMLSelectElement;
    if (typeof next === "boolean") (element as HTMLInputElement).checked = next;
    else element.value = next;
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }, [id, value] as const);
  await setPreprocess("segmentationPreprocessModeSelect", "original");
  await selectBoxes(page, [0]);
  await page.keyboard.press("r");
  await openLab(page);
  await lab(page).locator('[data-image-source="processed"]').click();
  await expect(page.locator("#refineLabReadout")).toContainText(surroundingsLine(180, 40));
  await saveLab(page);

  await setPreprocess("segmentationPreprocessMedianToggle", true);
  await setPreprocess("segmentationPreprocessClaheInput", "40");
  await setPreprocess("segmentationPreprocessLevelsInput", "10");
  await expect(page.locator("#segmentationPreprocessClaheValue")).toHaveText("4.0");
  await expect(page.locator("#segmentationPreprocessLevelsValue")).toHaveText("1.0%");
  await openLab(page);
  await expect(page.locator("#refineLabReadout")).not.toContainText(surroundingsLine(180, 40));
  await expect(page.locator("#refineLabReadout")).toContainText("bright → dark");
  await lab(page).locator(".btn-close").click();

  await page.locator("#segmentationPreprocessResetBtn").evaluate((button) => (button as HTMLButtonElement).click());
  await expect(page.locator("#segmentationPreprocessClaheValue")).toHaveText("Off");
  await expect(page.locator("#segmentationPreprocessMedianToggle")).not.toBeChecked();
  await expect(page.locator("#segmentationPreprocessModeSelect")).toHaveValue("edge-blend");
});

test("presets: preprocessing presets feed Refine Lab, refine presets keep their processing, and the pane runs with a preset", async ({ page }) => {
  test.setTimeout(120_000);
  await openSemDataset(page);
  const setControl = (id: string, value: string) => page.evaluate(([elementId, next]) => {
    const element = document.getElementById(elementId) as HTMLInputElement | HTMLSelectElement;
    element.value = next;
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }, [id, value] as const);
  const click = (id: string) => page.evaluate((elementId) => (document.getElementById(elementId) as HTMLButtonElement).click(), id);
  const datasetFile = (name: string) => page.evaluate(async (fileName) => {
    const folder = Reflect.get(window, "__refineTestFolder") as { getDirectoryHandle(n: string): Promise<{ getFileHandle(n: string): Promise<{ content: string }> }> };
    try { return JSON.parse((await (await folder.getDirectoryHandle(".easy-labeling")).getFileHandle(fileName)).content); } catch { return null; }
  }, name);

  // Preprocess panel: save a preset, change the settings, then load the preset back.
  await setControl("segmentationPreprocessModeSelect", "original");
  await setControl("segmentationPreprocessContrastInput", "200");
  await setControl("segmentationPreprocessPresetName", "High contrast");
  await click("segmentationPreprocessPresetSaveBtn");
  await expect.poll(async () => (await datasetFile("preprocessing-presets.json"))?.presets?.[0]?.config?.contrast).toBe(2);
  await click("segmentationPreprocessResetBtn");
  await expect(page.locator("#segmentationPreprocessContrastValue")).toHaveText("100%");
  // Choosing a preset fills the name field, so Save overwrites it.
  await setControl("segmentationPreprocessPresetName", "");
  await setControl("segmentationPreprocessPresetSelect", "High contrast");
  await expect(page.locator("#segmentationPreprocessPresetName")).toHaveValue("High contrast");
  await expect(page.locator("#segmentationPreprocessContrastValue")).toHaveText("200%");
  await expect(page.locator("#segmentationPreprocessModeSelect")).toHaveValue("original");
  await click("segmentationPreprocessResetBtn");

  // Refine Lab: pin Processed to the saved preprocessing preset (the panel itself is back to neutral).
  await selectBoxes(page, [0]);
  await page.keyboard.press("r");
  await openLab(page);
  await lab(page).locator('[data-image-source="processed"]').click();
  await expect(page.locator("#refineLabProcessing option", { hasText: "High contrast" })).toHaveCount(1);
  await page.locator("#refineLabProcessing").selectOption("High contrast");
  await expect(page.locator("#refineLabReadout")).toContainText(surroundingsLine(233, 0));
  await lab(page).locator('[data-ref="presetName"]').fill("Fins HC");
  await lab(page).locator('[data-act="savePreset"]').click();
  await saveLab(page);
  await expect.poll(async () => ((await settingsFile(page)) as unknown as { imageSource?: string } | null)?.imageSource).toBe("processed");
  const settings = await settingsFile(page) as unknown as { imageSource: string; processing: { name: string }; presets: { name: string; imageSource: string; processing: { name: string } }[] };
  expect(settings.imageSource).toBe("processed");
  expect(settings.processing.name).toBe("High contrast");
  expect(settings.presets[0]).toMatchObject({ name: "Fins HC", imageSource: "processed", processing: { name: "High contrast" } });

  // Pane: run with the preset; shortcuts live in tooltips, not inside the buttons.
  const pane = page.locator("#inspectorRefinePane");
  await expect(page.locator("#refineSettingsSummary")).toContainText("Processed (High contrast)");
  await expect(pane.locator("kbd")).toHaveCount(0);
  await expect(page.locator("#refineSelectedBtn")).toHaveAttribute("title", /\(E\)/);
  await expect(page.locator("#refineAllBtn")).toHaveAttribute("title", /\(Shift\+E\)/);
  await expect(page.locator("#refineApproveBtn")).toHaveAttribute("title", /\(F\)/);
  await page.locator("#refineRunPresetSelect").selectOption("Fins HC");
  await expect(page.locator("#refineRunPresetSelect option:checked")).toHaveText("Fins HC · Processed (High contrast)");
  await expect(page.locator("#refineRunPresetDetail")).toContainText("step 2 px · Processed (High contrast)");
  for (const theme of ["light", "dark"]) {
    await page.evaluate((dark) => { const toggle = document.getElementById("darkModeToggle") as HTMLInputElement; toggle.checked = dark; toggle.dispatchEvent(new Event("change", { bubbles: true })); }, theme === "dark");
    await pane.screenshot({ path: `test-results/refine-run-presets-${theme}.png` });
  }
  await page.evaluate(() => { const toggle = document.getElementById("darkModeToggle") as HTMLInputElement; toggle.checked = false; toggle.dispatchEvent(new Event("change", { bubbles: true })); });
  await expect.poll(async () => ((await settingsFile(page)) as unknown as { activePreset: string }).activePreset).toBe("Fins HC");
  await page.locator("#refineSelectedBtn").click();
  await expect.poll(async () => {
    const box = (await geometries(page))[0];
    return Math.max(Math.abs(box.left - 20), Math.abs(box.top - 30), Math.abs(box.right - 60), Math.abs(box.bottom - 90));
  }, { timeout: 15_000 }).toBeLessThan(0.6);
  await page.locator("#refineRunPresetSelect").selectOption("");
  await expect.poll(async () => ((await settingsFile(page)) as unknown as { activePreset: string | null }).activePreset).toBeNull();
});

test("refine: boxes whose area changes past the limit get a red pin and are queued for review", async ({ page }) => {
  test.setTimeout(90_000);
  await openSemDataset(page);
  await page.locator("#canvas-container").click({ position: { x: 5, y: 5 } });
  await page.keyboard.press("r");
  // The second box (49 x 52 px as saved) shrinks by about 6% when refined to 40 x 60; lower the shrink limit to 3%.
  await openLab(page);
  await page.locator("#refineLabEditor .refine-details summary", { hasText: "Advanced" }).click();
  await expect(page.locator("#refineLabField-areaGrowLimit")).toHaveValue("100");
  await expect(page.locator("#refineLabField-areaShrinkLimit")).toHaveValue("50");
  await page.locator("#refineLabField-areaShrinkLimit").fill("3");
  await expect(page.locator("#refineLabReadout")).toContainText("Box area");
  await saveLab(page);
  await expect.poll(async () => JSON.stringify(await settingsFile(page))).toContain('"areaShrinkLimit":0.03');

  await page.locator("#refineAllBtn").click();
  await expect(page.locator("#refineStatus")).toContainText("1 with a large area change", { timeout: 15_000 });
  await expect(page.locator("#refineReviewCounter")).toContainText("1 to review");
  const redPixels = () => page.evaluate(() => {
    const overlay = document.getElementById("refineOverlayCanvas") as HTMLCanvasElement;
    const data = overlay.getContext("2d")!.getImageData(0, 0, overlay.width, overlay.height).data;
    let count = 0;
    for (let i = 0; i < data.length; i += 4) if (Math.abs(data[i] - 220) < 8 && Math.abs(data[i + 1] - 53) < 8 && Math.abs(data[i + 2] - 69) < 8 && data[i + 3] > 240) count += 1; // area flag red
    return count;
  });
  await expect.poll(redPixels).toBeGreaterThan(50);
  await page.locator("#inspectorRefinePane").screenshot({ path: "test-results/refine-area-flag-pane.png" });
  await page.locator("#canvas-container").screenshot({ path: "test-results/refine-area-flag-canvas.png" });
  // The unmarked box fades; fading is display only and never reaches the saved labels.
  const opacities = () => page.evaluate(() =>
    (Reflect.get(window, "__easyLabelingTestApi") as { getRectStates(): { opacity: number }[] }).getRectStates().map((s) => s.opacity).sort());
  const yolo = () => page.evaluate(() => (Reflect.get(window, "__easyLabelingTestApi") as { getLabelsAsYolo(): string }).getLabelsAsYolo());
  await expect.poll(opacities).toEqual([0.3, 1]);
  const dimmedYolo = await yolo();

  // Hiding review marks clears the overlay and the fading without leaving the queue.
  await page.locator("#refineShowReviewToggle").uncheck();
  await expect.poll(redPixels).toBe(0);
  await expect.poll(opacities).toEqual([1, 1]);
  expect(await yolo()).toBe(dimmedYolo);
  await expect(page.locator("#refineReviewCounter")).toContainText("1 to review");
  await page.locator("#refineShowReviewToggle").check();
  await expect.poll(redPixels).toBeGreaterThan(50);

  // N jumps to the flagged box; approving it clears the red pin.
  await page.keyboard.press("n");
  await page.keyboard.press("f");
  await expect(page.locator("#refineReviewCounter")).toContainText("0 to review");
  await expect.poll(redPixels).toBe(0);

  // Undo takes the box back (the counter follows); refining again flags it again, and Approve all settles every flag.
  await page.keyboard.press("Control+z");
  await page.keyboard.press("Shift+E");
  await expect(page.locator("#refineReviewCounter")).toContainText("1 to review", { timeout: 15_000 });
  await page.locator("#refineApproveAllBtn").click();
  await expect(page.locator("#refineStatus")).toHaveText("1 box approved");
  await expect(page.locator("#refineReviewCounter")).toContainText("0 to review");
  await expect.poll(redPixels).toBe(0);
  await page.locator("#refineApproveAllBtn").click();
  await expect(page.locator("#refineStatus")).toHaveText("Nothing to review.");
});

test("presets: profile-folder refine presets join the dataset's list without being saved into it", async ({ page }) => {
  test.setTimeout(90_000);
  // Desktop shell stand-in: one refine preset file in the profile folder, nothing for the other kinds.
  await page.addInitScript(() => {
    const file = { schemaVersion: 1, kind: "easy-labeling-refine-presets", presets: [{ name: "Profile wide", params: { rangeOut: 33 } }] };
    Reflect.set(window, "listEasyLabelingLibraryFiles", async (kind: string) => (kind === "refine"
      ? [{ name: "wide.json", filePath: "wide.json", contents: JSON.stringify(file) }]
      : []));
  });
  await openSemDataset(page);
  await selectBoxes(page, [0]);
  await page.keyboard.press("r");
  await expect(page.locator("#refineRunPresetSelect option", { hasText: "Profile wide (profile)" })).toHaveCount(1);
  await openLab(page);
  await lab(page).locator('[data-ref="presetSelect"]').selectOption("Profile wide");
  await expect(page.locator("#refineLabField-rangeOut")).toHaveValue("33");
  await saveLab(page);
  await expect.poll(async () => JSON.stringify(await settingsFile(page))).toContain('"rangeOut":33');
  expect((await settingsFile(page))?.presets).toEqual([]);
});

test("presets: Save settings saves into the named preset, asks for a name, and the Run-with preset opens in the Lab for editing", async ({ page }) => {
  test.setTimeout(120_000);
  await openSemDataset(page);
  await selectBoxes(page, [0]);
  await page.keyboard.press("r");
  type Saved = { activePreset: string | null; default: { rangeOut: number }; classes: Record<string, unknown>; presets: { name: string; params: { rangeOut: number }; classes?: Record<string, { rangeOut?: number }> }[] };
  const saved = async () => (await settingsFile(page)) as unknown as Saved;
  const presetRange = async (name: string) => (await saved())?.presets.find((preset) => preset.name === name)?.params.rangeOut;
  const presetName = lab(page).locator('[data-ref="presetName"]');
  const nameHint = lab(page).locator('[data-ref="presetNameHint"]');

  // Without a preset name Save settings asks for one and the Lab stays open.
  await openLab(page);
  await expect(presetName).toHaveValue("");
  await page.locator("#refineLabField-rangeOut").fill("21");
  await page.locator("#refineLabSaveBtn").click();
  await expect(nameHint).toBeVisible();
  await expect(nameHint).toContainText("Type a preset name");
  await expect(presetName).toHaveClass(/is-invalid/);
  await expect(presetName).toBeFocused();
  await expect(lab(page)).toBeVisible();
  await page.locator(".refine-lab-settings-column").screenshot({ path: "test-results/refine-lab-preset-name-required.png" });
  // Typing a name clears the hint; Save settings then saves the settings and that preset.
  await presetName.fill("Tuned");
  await expect(nameHint).toBeHidden();
  await saveLab(page);
  await expect.poll(() => presetRange("Tuned")).toBe(21);
  expect((await saved()).default.rangeOut).toBe(21);

  // Applying a preset fills in its name, so Save settings updates it; a typed name saves a new preset instead.
  await openLab(page);
  await lab(page).locator('[data-ref="presetSelect"]').selectOption("Tuned");
  await expect(presetName).toHaveValue("Tuned");
  await page.locator("#refineLabField-rangeOut").fill("23");
  await saveLab(page);
  await expect.poll(() => presetRange("Tuned")).toBe(23);
  await openLab(page);
  await lab(page).locator('[data-ref="presetSelect"]').selectOption("Tuned");
  await lab(page).locator('[data-act="applyPreset"]').click();
  await expect(presetName).toHaveValue("Tuned");
  await presetName.fill("Wide");
  await page.locator("#refineLabField-rangeOut").fill("25");
  await saveLab(page);
  await expect.poll(() => presetRange("Wide")).toBe(25);
  expect(await presetRange("Tuned")).toBe(23);
  expect((await saved()).default.rangeOut).toBe(25);

  // Run with a preset: the Lab edits that preset (Default selected, class chips shown) and leaves class settings alone.
  await page.locator("#refineRunPresetSelect").selectOption("Tuned");
  await openLab(page);
  await expect(page.locator("#refineLabPresetBanner")).toContainText('Run with "Tuned"');
  await expect(page.locator("#refineLabEditor [data-ref=chips]")).toBeVisible();
  await expect(page.locator("#refineLabEditor .refine-class-chip[data-class-id='']")).toHaveAttribute("aria-pressed", "true");
  await expect(presetName).toHaveValue("Tuned");
  await expect(page.locator("#refineLabField-rangeOut")).toHaveValue("23");
  for (const theme of ["light", "dark"]) {
    await page.evaluate((dark) => { const toggle = document.getElementById("darkModeToggle") as HTMLInputElement; toggle.checked = dark; toggle.dispatchEvent(new Event("change", { bubbles: true })); }, theme === "dark");
    await page.locator("#refineLabPresetBanner").evaluate((element) => element.scrollIntoView({ block: "start" }));
    await page.locator(".refine-lab-settings-column").screenshot({ path: `test-results/refine-lab-run-with-${theme}.png` });
  }
  await page.evaluate(() => { const toggle = document.getElementById("darkModeToggle") as HTMLInputElement; toggle.checked = false; toggle.dispatchEvent(new Event("change", { bubbles: true })); });
  await page.locator("#refineLabField-rangeOut").fill("30");
  // A class chip gives that class its own value inside the preset.
  await editClass(page, "0");
  await page.locator("#refineLabField-rangeOut").fill("12");
  await saveLab(page);
  await expect.poll(() => presetRange("Tuned")).toBe(30);
  const after = await saved();
  expect(after.presets.find((preset) => preset.name === "Tuned")?.classes?.["0"]?.rangeOut).toBe(12);
  expect(after.classes).toEqual({});
  expect(after.default.rangeOut).toBe(25);
  expect(after.activePreset).toBe("Tuned");
  await expect(page.locator("#refineRunPresetDetail")).toContainText("out 30 px");
  // Reopened, the Lab shows the preset's class value again.
  await openLab(page);
  await editClass(page, "0");
  await expect(page.locator("#refineLabField-rangeOut")).toHaveValue("12");
  await lab(page).locator(".modal-footer [data-bs-dismiss=modal]").click();
  await expect(lab(page)).toBeHidden();

  // Back on class settings, the Lab edits them again.
  await page.locator("#refineRunPresetSelect").selectOption("");
  await openLab(page);
  await expect(page.locator("#refineLabPresetBanner")).toBeHidden();
  await expect(page.locator("#refineLabEditor [data-ref=chips]")).toBeVisible();
  await expect(page.locator("#refineLabField-rangeOut")).toHaveValue("25");
  await expect(presetName).toHaveValue("");
});

// ---------------------------------------------------------------- reclass
const api = <T>(page: Page, fn: (api: {
  getRectStates(): { annotationId: string; classId: string; opacity: number }[];
  getRectGeometries(): Geometry[];
  getSelectedRectIds(): string[];
  getLabelsAsYolo(): string;
}) => T) => page.evaluate(`(${fn.toString()})(window.__easyLabelingTestApi)`) as Promise<T>;
/** Class of each box, left to right. */
const classesLeftToRight = async (page: Page): Promise<string[]> => {
  const states = await api(page, (a) => a.getRectStates());
  const order = (await geometries(page)).map((g) => g.annotationId);
  return order.map((id) => states.find((s) => s.annotationId === id)!.classId);
};
/** Box 0's centre is dark (a filled structure); box 1's stays bright. */
const DARK_CENTRE = [{ rect: { left: 30, top: 45, right: 50, bottom: 75 }, gray: 40 }];
const reclassRule = (patch: Record<string, unknown>) => ({ toClass: "1", crop: 0.5, ...patch });
/** Settings that open the Refine pane in Reclass mode with these rules. */
const reclassSettings = (...rules: Record<string, unknown>[]) => ({ default: {}, mode: "reclass", reclass: rules });

test("reclass: All boxes changes the matching box at once, queues it for review, and approving keeps the class", async ({ page }) => {
  test.setTimeout(90_000);
  await openSemDataset(page, { extra: DARK_CENTRE, settings: reclassSettings(reclassRule({ mean: { enabled: true, min: 120 } })) });
  await page.locator("#canvas-container").click({ position: { x: 5, y: 5 } });
  await page.keyboard.press("r");
  await expect(page.locator("#refineReclassSummary")).toContainText("all classes → 1 · mean ≥ 120");
  // Apply works like Edge's: there is no separate find step.
  await expect(page.locator("#refineFindReclassBtn")).toHaveCount(0);
  await expect(page.locator("#refineReclassAllBtn")).toBeEnabled();

  // The bright-centred box changes, in one undo step, and is queued for review.
  await page.locator("#refineReclassAllBtn").click();
  await expect.poll(() => classesLeftToRight(page)).toEqual(["0", "1"]);
  await expect(page.locator("#refineStatus")).toContainText("1 of 2 boxes → class 1");
  await expect(page.locator("#refineStatus")).toContainText("1 to review");
  await expect(page.locator("#refineReviewCounter")).toHaveText("1 to review");
  // Again: the box already has the rule's class, so nothing changes and no second undo step is added.
  await page.locator("#refineReclassAllBtn").click();
  await expect(page.locator("#refineStatus")).toContainText("No box matches the rule (2 checked)");
  await expect(page.locator("#refineStatus")).toContainText("1 already class 1");
  await expect(page.locator("#refineReviewCounter")).toHaveText("1 to review");
  const overlay = page.locator("#refineOverlayCanvas");
  await expect(overlay).toHaveAttribute("data-pins", "1");
  expect((await api(page, (a) => a.getLabelsAsYolo())).split("\n").filter((line) => line.startsWith("1 "))).toHaveLength(1);

  // N goes to it; F approves it: the new class stays and the pin goes.
  await page.keyboard.press("n");
  const right = (await geometries(page))[1].annotationId;
  expect(await api(page, (a) => a.getSelectedRectIds())).toEqual([right]);
  await page.keyboard.press("f");
  await expect(page.locator("#refineReviewCounter")).toHaveText("0 to review");
  await expect(overlay).toHaveAttribute("data-pins", "0");
  expect(await classesLeftToRight(page)).toEqual(["0", "1"]);

  // One undo step restores the class.
  await page.keyboard.press("Control+z");
  await expect.poll(() => classesLeftToRight(page)).toEqual(["0", "0"]);
});
test("reclass: compares refined area with the loaded box even after Refine all, and Apply works like Edge's", async ({ page }) => {
  test.setTimeout(120_000);
  // Box 1 is saved as 49 x 52 px; refined to 40 x 60 it loses about 6% of its area.
  await openSemDataset(page, { settings: reclassSettings(reclassRule({ mean: { enabled: false, min: 0 }, shrink: { enabled: true, minRatio: 0.03 } })) });
  await page.locator("#canvas-container").click({ position: { x: 5, y: 5 } });
  await page.keyboard.press("r");

  // Refine every box in Edge mode first; back in Reclass mode the shrink check still compares with the loaded size.
  await page.locator("#refineModeToggle [data-mode='edge']").click();
  await page.keyboard.press("Shift+E");
  await expect(page.locator("#refineStatus")).toContainText("refined", { timeout: 15_000 });
  await page.locator("#refineModeToggle [data-mode='reclass']").click();

  // Selected (E in Reclass mode): only the selected boxes are judged, and nothing moves.
  const before = await geometries(page);
  await selectBoxes(page, [0]);
  await page.keyboard.press("e");
  await expect(page.locator("#refineStatus")).toContainText("No box matches the rule (1 checked)");
  expect(await classesLeftToRight(page)).toEqual(["0", "0"]);
  expect(await geometries(page)).toEqual(before);
  await selectBoxes(page, [1]);
  await page.locator("#refineReclassSelectedBtn").click();
  await expect.poll(() => classesLeftToRight(page)).toEqual(["0", "1"]);
  await expect(page.locator("#refineStatus")).toContainText("1 of 1 box → class 1");
  await expect(page.locator("#refineReviewCounter")).toContainText("1 to review");
  // The class list now holds class 1, the rule's target: it cannot be chosen.
  await expect(page.locator("#refineReclassClassSelect option[value='1']")).toBeDisabled();
  // Undo takes the box out of the review queue.
  await page.keyboard.press("Control+z");
  await expect.poll(() => classesLeftToRight(page)).toEqual(["0", "0"]);
  await expect(page.locator("#refineReviewCounter")).toHaveText("0 to review");

  // Reclass class: the boxes of the chosen class.
  await page.locator("#refineReclassClassSelect").selectOption("0");
  await page.locator("#refineReclassClassBtn").click();
  await expect.poll(() => classesLeftToRight(page)).toEqual(["0", "1"]);
  await expect(page.locator("#refineStatus")).toContainText("1 of 2 boxes → class 1");

  // Shift+E in Reclass mode is All boxes.
  await page.keyboard.press("Control+z");
  await expect.poll(() => classesLeftToRight(page)).toEqual(["0", "0"]);
  await page.keyboard.press("Shift+E");
  await expect.poll(() => classesLeftToRight(page)).toEqual(["0", "1"]);
  await expect(page.locator("#refineStatus")).toContainText("1 of 2 boxes → class 1");
  expect((await geometries(page)).map((g) => [g.left, g.top, g.right, g.bottom])).toEqual(before.map((g) => [g.left, g.top, g.right, g.bottom]));

  // A class changed by hand is kept by All boxes (toggle on) and changed by Selected.
  await page.keyboard.press("Control+z");
  await expect.poll(() => classesLeftToRight(page)).toEqual(["0", "0"]);
  await selectBoxes(page, [1]);
  await page.keyboard.press("2");
  await expect.poll(() => classesLeftToRight(page)).toEqual(["0", "2"]);
  await page.keyboard.press("0");
  await expect.poll(() => classesLeftToRight(page)).toEqual(["0", "0"]);
  await page.locator("#refineReclassAllBtn").click();
  await expect(page.locator("#refineStatus")).toContainText("No box matches the rule (1 checked)");
  await expect(page.locator("#refineStatus")).toContainText("1 hand-edited box kept");
  expect(await classesLeftToRight(page)).toEqual(["0", "0"]);
  await page.locator("#refineReclassSkipManualToggle").uncheck();
  await page.locator("#refineReclassAllBtn").click();
  await expect.poll(() => classesLeftToRight(page)).toEqual(["0", "1"]);

  // Approve all settles the reclass review.
  await expect(page.locator("#refineReviewCounter")).toContainText("1 to review");
  await page.locator("#refineApproveAllBtn").click();
  await expect(page.locator("#refineReviewCounter")).toHaveText("0 to review");
  await expect(page.locator("#refineStatus")).toHaveText("1 box approved");
  await page.locator("#inspectorRefinePane").screenshot({ path: "test-results/refine-pane-reclass-apply.png" });
});
test("reclass: the mode toggle shows the reclass controls, and the default rule is on when none is saved", async ({ page }) => {
  await openSemDataset(page);
  await page.locator("#canvas-container").click({ position: { x: 5, y: 5 } });
  await page.keyboard.press("r");
  // Edge mode first: the reclass controls wait behind the mode toggle.
  await expect(page.locator("#refineReclassAllBtn")).toBeHidden();
  await expect(page.locator("#refineRunPresetSelect")).toBeVisible();
  await page.locator("#refineModeToggle [data-mode='reclass']").click();
  await expect(page.locator("#refineRunPresetSelect")).toBeHidden();
  // With nothing saved the default rule is on: every class → 0 by centre mean.
  await expect(page.locator("#refineReclassSummary")).toHaveText("all classes → 0 · mean ≥ 128");
  await expect(page.locator("#refineSettingsSummary")).toContainText("Lab rule (default)");
  await expect.poll(async () => (await settingsFile(page) as { mode?: string } | null)?.mode).toBe("reclass");
});

test("refine lab: Reclass mode has its own presets and image, one rule whose classes are the chips, and a centre crop set per side", async ({ page }) => {
  test.setTimeout(90_000);
  await openSemDataset(page, { extra: DARK_CENTRE, settings: { ...reclassSettings(reclassRule({ mean: { enabled: true, min: 120 } })), presets: [{ name: "Edge one", params: {} }] } });
  await page.locator("#canvas-container").click({ position: { x: 5, y: 5 } });
  await page.keyboard.press("r");
  await openLab(page);
  const editor = page.locator("#refineLabEditor");
  await expect(editor.locator("[data-ref='presetsTitle']")).toHaveText("Reclass presets");
  await expect(editor.locator("[data-ref='presetSelect'] option", { hasText: "Edge one" })).toHaveCount(0);
  await expect(editor.locator("[data-ref='sideBox']")).toBeHidden();
  await expect(page.locator("#refineLabProfile")).toBeHidden();
  await expect(page.locator("#refineLabApplyBtn")).toHaveText("Save & reclass these boxes");

  // One rule, no add/move/delete; its classes are the chips.
  await expect(editor.locator(".reclass-rule")).toHaveCount(1);
  await expect(editor.locator("[data-ref='contextDetails']")).toBeHidden();
  await expect(editor.locator("[data-act='addReclassRule'], [data-act='reclassDelete'], [data-act='reclassUp']")).toHaveCount(0);
  await expect(editor.locator("[data-mode-only='reclass'] p.refine-hint")).toHaveCount(0);
  await expect(editor.locator(".refine-class-chip[data-class-id='']")).toHaveAttribute("aria-pressed", "true");
  await editor.locator(".refine-class-chip[data-class-id='0']").click();
  await expect(editor.locator(".refine-class-chip[data-class-id='0']")).toHaveAttribute("aria-pressed", "true");
  await expect(editor.locator("[data-ref='hint']")).toHaveText("The rule checks class 0.");
  // Each side of the centre crop is set on its own.
  await page.locator("#refineLabReclass0-insetTop").fill("10");
  await page.locator("#refineLabReclass0-insetBottom").fill("40");
  await page.locator("#refineLabReclass0-insetLeft").fill("5");
  await page.locator("#refineLabReclass0-insetRight").fill("30");
  await expect(page.locator("#refineLabReadout")).toContainText("Centre inset top 10% · bottom 40% · left 5% · right 30%");

  // The reclass image is its own; the edge image stays Original.
  await editor.locator("[data-ref='imageSource'] [data-image-source='processed']").click();
  await editor.locator("[data-ref='presetName']").fill("Voids");
  await editor.locator("[data-act='savePreset']").click();
  await editor.locator("[data-ref='mode']").scrollIntoViewIfNeeded();
  await lab(page).screenshot({ path: "test-results/refine-lab-reclass-mode-light.png" });
  await page.evaluate(() => document.getElementById("darkModeToggle")?.click());
  await page.locator("#refineLabReclass0-shrinkRatio").scrollIntoViewIfNeeded();
  await lab(page).screenshot({ path: "test-results/refine-lab-reclass-mode-dark.png" });
  await page.evaluate(() => document.getElementById("darkModeToggle")?.click());
  await editor.locator("[data-ref='mode'] [data-mode='edge']").click();
  await expect(editor.locator("[data-ref='presetsTitle']")).toHaveText("Edge presets");
  await expect(editor.locator("[data-ref='presetSelect'] option", { hasText: "Voids" })).toHaveCount(0);
  await expect(editor.locator("[data-ref='imageSource'] [data-image-source='original']")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#refineLabProfile")).toBeVisible();
  // Surroundings say on the case what they read: the core, the background ring and the neighbours.
  await expect(page.locator("#refineLabReadout")).toContainText("Surroundings: box core (dotted)");
  await expect(page.locator("#refineLabReadout")).toContainText("background ring (amber");
  await expect(page.locator("#refineLabReadout")).toContainText("neighbour box");
  await lab(page).screenshot({ path: "test-results/refine-lab-surroundings-light.png" });
  await page.evaluate(() => document.getElementById("darkModeToggle")?.click());
  await lab(page).screenshot({ path: "test-results/refine-lab-surroundings-dark.png" });
  await page.evaluate(() => document.getElementById("darkModeToggle")?.click());
  await openReclass(page);
  await saveLab(page);

  await expect.poll(async () => JSON.stringify(await settingsFile(page))).toContain('"reclassImageSource":"processed"');
  const saved = await settingsFile(page) as unknown as Record<string, unknown> & { reclass: { fromClasses: string[] }[]; reclassPresets: { name: string; reclass: unknown[]; imageSource: string }[] };
  expect(saved).toMatchObject({ mode: "reclass", imageSource: "original", presets: [{ name: "Edge one" }] });
  expect(saved.reclass).toMatchObject([{ fromClasses: ["0"], insetTop: 0.1, insetBottom: 0.4, insetLeft: 0.05, insetRight: 0.3 }]);
  expect(saved.reclassPresets).toMatchObject([{ name: "Voids", imageSource: "processed" }]);
  expect(saved.reclassPresets[0].reclass).toMatchObject([{ fromClasses: ["0"], insetTop: 0.1, insetBottom: 0.4, insetLeft: 0.05, insetRight: 0.3 }]);

  // The pane reclasses with a chosen reclass preset: its Apply buttons are ready right away.
  await expect(page.locator("#refineReclassPresetSelect option", { hasText: "Voids" })).toHaveCount(1);
  await page.locator("#refineReclassPresetSelect").selectOption("Voids");
  await expect(page.locator("#refineReclassSummary")).toContainText("class 0 → 1");
  await expect(page.locator("#refineReclassSummary")).toContainText("Processed");
  await expect.poll(async () => (await settingsFile(page) as { activeReclassPreset?: string } | null)?.activeReclassPreset).toBe("Voids");
  for (const id of ["refineReclassSelectedBtn", "refineReclassAllBtn", "refineReclassClassBtn", "refineReclassFolderBtn"]) await expect(page.locator(`#${id}`)).toBeEnabled();
  await expect(page.locator("#refineReclassClassSelect")).toHaveValue("0");
  await page.locator("#refineReclassAllBtn").click();
  await expect(page.locator("#refineStatus")).toContainText(/→ class 1|No box matches/);
  await page.locator("#inspectorRefinePane").screenshot({ path: "test-results/refine-pane-reclass-mode.png" });
});

test("refine lab: tunes a reclass rule and shows which cases match", async ({ page }) => {
  test.setTimeout(90_000);
  await openSemDataset(page, { extra: DARK_CENTRE });
  await page.locator("#canvas-container").click({ position: { x: 5, y: 5 } });
  await page.keyboard.press("r");
  await openLab(page);
  await page.locator("#refineLabSource").selectOption("all");
  await openReclass(page);
  // The rule is always on: there is no switch for it.
  await expect(page.locator("#refineLabReclass0-enabled")).toHaveCount(0);
  await page.locator("#refineLabReclass0-to").fill("1");
  await page.locator("#refineLabReclass0-meanMin").fill("120");

  // Box 1 (bright centre) matches; box 0 (dark centre) does not.
  await expect(page.locator("#refineLabStatus")).toContainText("reclass 1 of 2 match");
  await expect(page.locator(".refine-lab-case[data-reclass='match']")).toHaveCount(1);
  await expect(page.locator(".refine-lab-case[data-reclass='match'] span")).toContainText("mean 180");
  await page.locator(".refine-lab-case[data-reclass='match']").click();
  await lab(page).screenshot({ path: "test-results/refine-lab-reclass.png" });
  await page.locator("#refineLabReclass0-meanMin").fill("200");
  await expect(page.locator("#refineLabStatus")).toContainText("reclass 0 of 2 match");

  // Change to the class the boxes already have: they are still judged with the settings, marked as already that class.
  await page.locator("#refineLabReclass0-to").fill("0");
  await page.locator("#refineLabReclass0-meanMin").fill("120");
  await expect(page.locator("#refineLabStatus")).toContainText("reclass 1 of 2 match");
  await page.locator(".refine-lab-case[data-reclass='match']").click();
  await expect(page.locator("#refineLabReadout")).toContainText("Match (already class 0: Apply leaves it as it is)");
  await page.locator("#refineLabReclass0-to").fill("1");
  await page.locator("#refineLabReclass0-meanMin").fill("200");
  await expect(page.locator("#refineLabStatus")).toContainText("reclass 0 of 2 match");

  await saveLab(page);
  await expect.poll(async () => JSON.stringify(await settingsFile(page))).toContain('"min":200');
  await expect(page.locator("#refineReclassSummary")).toContainText("all classes → 1 · mean ≥ 200");

  // Save & reclass these boxes applies the rule to the Lab's cases.
  await openLab(page);
  await openReclass(page);
  await page.locator("#refineLabReclass0-meanMin").fill("120");
  await page.locator("#refineLabApplyBtn").click();
  await expect.poll(() => classesLeftToRight(page)).toEqual(["0", "1"]);
  await expect(page.locator("#refineReviewCounter")).toContainText("1 to review");
  await page.keyboard.press("Control+z");
  await expect.poll(() => classesLeftToRight(page)).toEqual(["0", "0"]);

  // With every check off nothing changes.
  await openLab(page);
  await openReclass(page);
  await page.locator("#refineLabReclass0-meanOn").uncheck();
  await saveLab(page);
  await page.locator("#refineReclassAllBtn").click();
  await expect(page.locator("#refineStatus")).toHaveText("The reclass rule has no check on.");
  expect(await classesLeftToRight(page)).toEqual(["0", "0"]);
  await expect(page.locator("#refineOverlayCanvas")).toHaveAttribute("data-pins", "0");
});

test("refine lab: keeps rule classes that have no box on this image", async ({ page }) => {
  await openSemDataset(page, { settings: reclassSettings(reclassRule({ fromClasses: ["7"] })) });
  await page.locator("#canvas-container").click({ position: { x: 5, y: 5 } });
  await page.keyboard.press("r");
  await expect(page.locator("#refineReclassSummary")).toContainText("class 7 → 1");
  await openLab(page);
  await openReclass(page);
  await expect(page.locator("#refineLabEditor .refine-class-chip[data-class-id='7']")).toHaveAttribute("aria-pressed", "true");
  await page.locator("#refineLabReclass0-meanMin").fill("140");
  await saveLab(page);
  await expect(page.locator("#refineReclassSummary")).toContainText("class 7 → 1 · mean ≥ 140");
});

/** Label files of the mock folder by name, and the backup folders written beside them. */
const labelFiles = (page: Page) => page.evaluate(async () => {
  type Entry = { kind: string; name: string; content?: string; entries?: Map<string, Entry> };
  const folder = Reflect.get(window, "__refineTestFolder") as { entries: Map<string, Entry> };
  const label = folder.entries.get("label")!;
  const files: Record<string, string> = {};
  for (const entry of label.entries!.values()) if (entry.kind === "file") files[entry.name] = entry.content ?? "";
  const tools = label.entries!.get(".easy-labeling");
  return { files, backups: tools ? [...tools.entries!.keys()].sort() : [] };
});
/** Boxes of a YOLO text in pixels (200 x 120 image), left to right, with their class. */
const yoloBoxes = (text: string): (Geometry & { classId: string })[] => text.trim().split("\n").map((line) => {
  const [classId, cx, cy, w, h] = line.trim().split(/\s+/);
  const [x, y, bw, bh] = [Number(cx) * 200, Number(cy) * 120, Number(w) * 200, Number(h) * 120];
  return { classId, left: x - bw / 2, top: y - bh / 2, right: x + bw / 2, bottom: y + bh / 2 };
}).sort((a, b) => a.left - b.left);

test("folder: refines and reclasses every image with the chosen presets, backing up the originals", async ({ page }) => {
  test.setTimeout(120_000);
  // Class settings refine no side and the Lab rule matches nothing: only the Run-with / Reclass-with presets change boxes.
  const allOff = { T: "off", B: "off", L: "off", R: "off" };
  await openSemDataset(page, {
    images: 3,
    extra: DARK_CENTRE,
    settings: {
      default: { sides: allOff },
      presets: [{ name: "Snap", params: {} }],
      activePreset: "Snap",
      reclass: [reclassRule({ mean: { enabled: true, min: 255 } })],
      reclassPresets: [{ name: "Bright", reclass: [reclassRule({ mean: { enabled: true, min: 120 } })], imageSource: "original", processing: null }],
      activeReclassPreset: "Bright"
    }
  });
  const original = (await labelFiles(page)).files["sem2.txt"];
  await page.locator("#canvas-container").click({ position: { x: 5, y: 5 } });
  await page.keyboard.press("r");
  await expect(page.locator("#refineRunPresetSelect")).toHaveValue("Snap");

  // Cancelling the confirmation changes nothing.
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.locator("#refineFolderBtn").click();
  expect((await labelFiles(page)).files["sem2.txt"]).toBe(original);

  page.once("dialog", async (dialog) => { expect(dialog.message()).toContain("all 3 images"); expect(dialog.message()).toContain("Snap"); await dialog.accept(); });
  await page.locator("#refineFolderBtn").click();
  await expect(page.locator("#refineStatus")).toContainText("6 boxes refined in 3 of 3 images", { timeout: 30_000 });
  let saved = await labelFiles(page);
  expect(saved.backups).toEqual([expect.stringMatching(/^refine-all-/)]);
  for (const name of ["sem.txt", "sem2.txt", "sem3.txt"]) expect(maxError(yoloBoxes(saved.files[name]))).toBeLessThan(0.6);
  // The open image shows its rewritten file.
  await expect.poll(async () => maxError(await geometries(page))).toBeLessThan(0.6);
  await page.locator("#inspectorRefinePane").screenshot({ path: "test-results/refine-pane-folder-edge-light.png" });

  // Reclass: the preset's rule moves the bright-centred box of every image to class 1.
  await page.locator("#refineModeToggle [data-mode='reclass']").click();
  await expect(page.locator("#refineReclassPresetSelect")).toHaveValue("Bright");
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("#refineReclassFolderBtn").click();
  await expect(page.locator("#refineStatus")).toContainText("3 boxes reclassed in 3 of 3 images", { timeout: 30_000 });
  saved = await labelFiles(page);
  expect(saved.backups).toHaveLength(2);
  for (const name of ["sem.txt", "sem2.txt", "sem3.txt"]) expect(yoloBoxes(saved.files[name]).map((box) => box.classId)).toEqual(["0", "1"]);
  await expect.poll(() => classesLeftToRight(page)).toEqual(["0", "1"]);
  await page.evaluate(() => document.getElementById("darkModeToggle")?.click());
  await page.locator("#inspectorRefinePane").screenshot({ path: "test-results/refine-pane-folder-reclass-dark.png" });
});

test("refine lab: the guide opens on the mode's tutorial, switches between English and Korean, finds topics, and closes alone", async ({ page }) => {
  test.setTimeout(90_000);
  await openSemDataset(page);
  await page.locator("#canvas-container").click({ position: { x: 5, y: 5 } });
  await page.keyboard.press("r");
  await openLab(page);
  const guide = page.locator("#refineHelpDialog");
  const current = guide.locator(".rh-toc button.is-active");
  await page.locator("#refineLabHelpBtn").click();
  await expect(guide).toBeVisible();
  await expect(current).toHaveText("Tutorial: snap boxes to particle edges");
  await expect(guide.locator("#refineHelp-edge-quickstart svg.rh-fig")).toBeVisible();
  await guide.screenshot({ path: "test-results/refine-help-light.png" });

  // Search: every word must match; hits are marked in the text.
  const search = guide.locator("#refineHelpSearch");
  await search.fill("neighbour");
  await expect(guide.locator(".rh-content mark").first()).toBeVisible();
  await search.fill("극성");
  await expect(guide.locator(".rh-toc button[data-topic]")).toHaveText(["Edge polarity: bright inside or dark inside"]);
  await search.press("Enter");
  await expect(current).toHaveText("Edge polarity: bright inside or dark inside");
  await search.fill("zzzz");
  await expect(guide.locator(".rh-empty")).toContainText("No topic matches");
  // Esc in a filled search clears it; links jump between topics; the group tabs filter.
  await search.press("Escape");
  await expect(search).toHaveValue("");
  await guide.locator("#refineHelp-edge-quickstart a[data-topic='edge-range']").click();
  await expect(current).toHaveText("Search inward and outward");
  await guide.locator("[data-group='reclass']").click();
  await expect(guide.locator(".rh-toc button[data-topic]").first()).toHaveText("Centre crop: four insets");
  await guide.locator("[data-group='all']").click();

  // Esc closes the guide only; the Lab stays open.
  await guide.locator(".rh-content").click({ position: { x: 5, y: 5 } });
  await page.keyboard.press("Escape");
  await expect(guide).toBeHidden();
  await expect(lab(page)).toBeVisible();

  // In Reclass mode it opens on the reclass tutorial.
  await openReclass(page);
  await page.locator("#refineLabHelpBtn").click();
  await expect(current).toHaveText("Tutorial: find boxes of the wrong class");

  // Korean: the same topic in Korean, with UI names kept in English; the choice is remembered.
  await guide.locator("[data-lang='ko']").click();
  await expect(current).toHaveText("튜토리얼: 클래스가 잘못된 박스 찾기");
  await expect(guide.locator("#refineHelpTitle")).toContainText("Refine Lab 가이드");
  await expect(guide.locator("[data-group='hints']")).toHaveText("힌트");
  await expect(guide.locator("#refineHelp-reclass-quickstart")).toContainText("Save & reclass these boxes");
  await expect(guide.locator("#refineHelp-reclass-quickstart svg.rh-fig")).toContainText("정상");
  await guide.locator("[data-topic='reclass-crop']").first().click();
  await guide.screenshot({ path: "test-results/refine-help-ko-light.png" });
  await page.evaluate(() => document.getElementById("darkModeToggle")?.click());
  await guide.locator("#refineHelpSearch").fill("극성");
  await guide.locator("#refineHelpSearch").press("Enter");
  await expect(current).toHaveText("Edge polarity: 안쪽이 밝은지 어두운지");
  await guide.screenshot({ path: "test-results/refine-help-ko-dark.png" });
  await guide.locator("[data-lang='en']").click();
  await expect(current).toHaveText("Edge polarity: bright inside or dark inside");
  // The search stays across the switch; clear it to list every topic again.
  await guide.locator("#refineHelpSearch").fill("");
  await guide.locator("[data-topic='reclass-crop']").first().click();
  await guide.screenshot({ path: "test-results/refine-help-dark.png" });
  await page.evaluate(() => document.getElementById("darkModeToggle")?.click());
  await guide.locator("[data-lang='ko']").click();
  await guide.locator("[data-act='close']").click();
  await expect(guide).toBeHidden();
  await expect(lab(page)).toBeVisible();
  await page.locator("#refineLabHelpBtn").click();
  await expect(guide.locator("[data-lang='ko']")).toHaveAttribute("aria-pressed", "true");
  await guide.locator("[data-act='close']").click();
});

test("reclass: pins stay readable on a 3072 x 2048 image with 700 boxes", async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  // 28 x 25 cells; every structure has a dark (filled) core except 30 spread through the grid.
  const structures: Geometry[] = [];
  const cores: { rect: Geometry; gray: number }[] = [];
  for (let row = 0; row < 25; row += 1) {
    for (let col = 0; col < 28; col += 1) {
      const left = Math.round(col * 3072 / 28) + 20;
      const top = Math.round(row * 2048 / 25) + 13;
      structures.push({ left, top, right: left + 70, bottom: top + 56 });
      const index = row * 28 + col;
      if (index % 23 !== 7 || index >= 690) cores.push({ rect: { left: left + 15, top: top + 12, right: left + 55, bottom: top + 44 }, gray: 40 });
    }
  }
  const defects = structures.length - cores.length;
  expect(defects).toBe(30);
  await openSemDataset(page, {
    size: { width: 3072, height: 2048 },
    structures,
    extra: cores,
    labels: structures,
    settings: reclassSettings(reclassRule({ mean: { enabled: true, min: 120 } }))
  });
  await page.locator("#canvas-container").click({ position: { x: 5, y: 5 } });
  await page.keyboard.press("r");
  const applyMs = async (): Promise<number> => {
    await page.evaluate(() => { document.getElementById("refineStatus")!.textContent = ""; });
    await page.locator("#refineReclassAllBtn").click();
    await expect(page.locator("#refineStatus")).toContainText(`${defects} of ${structures.length} boxes → class 1 in`, { timeout: 30_000 });
    return Number((await page.locator("#refineStatus").textContent())?.match(/in (\d+) ms/)?.[1]);
  };
  // The first run also hands the image to the refine worker (as the first Refine does); later runs only judge.
  const first = await applyMs();
  await expect(page.locator("#refineReviewCounter")).toHaveText(`${defects} to review`);
  await page.keyboard.press("Control+z");
  await expect(page.locator("#refineReviewCounter")).toHaveText("0 to review");
  const warm = await applyMs();
  testInfo.annotations.push({ type: "reclass-apply-ms", description: `${structures.length} boxes: first ${first} ms, then ${warm} ms` });
  console.log(`reclass Apply, ${structures.length} boxes: first ${first} ms, then ${warm} ms`);
  expect(warm).toBeLessThan(1000);

  const overlay = page.locator("#refineOverlayCanvas");
  await expect(overlay).toHaveAttribute("data-pins", String(defects));
  // At the fitted zoom the boxes are narrower than a tag, so no tag is drawn until one has focus.
  await expect(overlay).toHaveAttribute("data-tags", "0");
  const opacities = await api(page, (a) => a.getRectStates().map((s) => s.opacity));
  expect(opacities.filter((o) => o === 0.3)).toHaveLength(structures.length - defects);
  await page.locator("#canvas-container").screenshot({ path: "test-results/reclass-dense-light.png" });

  await page.keyboard.press("n");
  await expect(overlay).toHaveAttribute("data-tags", "1");
  await page.locator('label[for="darkModeToggle"]').click();
  await page.locator("#canvas-container").screenshot({ path: "test-results/reclass-dense-dark.png" });
});

test("presets: the Run-with preset picked while another folder's settings show is the one E runs with", async ({ page }) => {
  // Class settings refine no side, so boxes move only when Snap runs. Folder B saved "Off" as its Run-with preset.
  const allOff = { T: "off", B: "off", L: "off", R: "off" };
  await openSemDataset(page, { settings: { default: { sides: allOff }, presets: [{ name: "Snap", params: {} }], activePreset: null } });
  await page.locator("#canvas-container").click({ position: { x: 5, y: 5 } });
  await page.keyboard.press("r");
  await expect(page.locator("#refineRunPresetSelect")).toHaveValue("");

  // Open folder B (same images, its own settings) with the Refine pane still open.
  await page.evaluate((offSides) => {
    const a = Reflect.get(window, "__refineTestFolder") as { entries: Map<string, unknown>; name: string };
    const tools = a.entries.get(".easy-labeling") as { entries: Map<string, { content: string }> };
    const clone = <T extends object>(source: T, patch: Partial<T>): T => Object.assign(Object.create(Object.getPrototypeOf(source)), source, patch);
    const settingsFile = clone(tools.entries.get("refine-settings.json")!, {
      content: JSON.stringify({ default: { sides: offSides }, presets: [{ name: "Snap", params: {} }, { name: "Off", params: { sides: offSides } }], activePreset: "Off" })
    });
    const bTools = clone(tools, { entries: new Map([["refine-settings.json", settingsFile]]) });
    const b = clone(a, { name: "images-b", entries: new Map([...a.entries, [".easy-labeling", bTools]]) });
    Reflect.set(window, "__refineFolderA", a);
    Reflect.set(window, "__refineTestFolder", b);
    Object.defineProperty(window, "showDirectoryPicker", { configurable: true, writable: true, value: async () => b });
  }, allOff);
  const before = await geometries(page);
  await page.locator("#selectImageFolderBtn").click();
  await expect.poll(async () => (await geometries(page)).length).toBe(2);

  await page.locator("#refineRunPresetSelect").selectOption("Snap");
  await selectBoxes(page, [0, 1]);
  await page.locator("#canvas-container").focus();
  await page.keyboard.press("e");
  await expect.poll(async () => maxError(await geometries(page))).toBeLessThan(0.6);
  expect(maxError(before)).toBeGreaterThan(2);
  await expect(page.locator("#refineRunPresetSelect")).toHaveValue("Snap");
  await expect.poll(async () => (await settingsFile(page) as { activePreset?: string } | null)?.activePreset).toBe("Snap");
  // Folder A's file keeps its own choice.
  const aPreset = await page.evaluate(async () => {
    const a = Reflect.get(window, "__refineFolderA") as { getDirectoryHandle(n: string): Promise<{ getFileHandle(n: string): Promise<{ content: string }> }> };
    return JSON.parse((await (await a.getDirectoryHandle(".easy-labeling")).getFileHandle("refine-settings.json")).content).activePreset ?? null;
  });
  expect(aPreset).toBeNull();
});
