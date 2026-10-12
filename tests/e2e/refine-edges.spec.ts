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

const lab = (page: Page) => page.locator("#refineLabModal");

async function openLab(page: Page): Promise<void> {
  await page.locator("#openRefineLabBtn").click();
  await expect(lab(page)).toBeVisible();
}

async function saveLab(page: Page): Promise<void> {
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
  await expect(page.locator("#refineSettingsSummary")).toContainText("1 class with own settings");
  await expect(page.locator("#refineRunPresetSelect option", { hasText: "Bright fins" })).toHaveCount(1);
  await openLab(page);
  await expect(page.locator("#refineLabField-polarity")).toHaveValue("brightInside");
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
  // The change plot step is remembered too.
  await page.locator("#refineLabDeltaStep").selectOption("3");
  await lab(page).locator(".btn-close").click();
  await openLab(page);
  await expect(page.locator("#refineLabDeltaStep")).toHaveValue("3");
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
  await expect(page.locator("#refineLabReadout")).toContainText("Inside 233 → outside 0");
  await saveLab(page);
  await expect(page.locator("#refineSettingsSummary")).toContainText("image Processed (live Preprocess panel)");
  await setPreprocess("segmentationPreprocessContrastInput", "100");
  await setPreprocess("segmentationPreprocessGammaInput", "200");
  await expect(page.locator("#segmentationPreprocessGammaValue")).toHaveText("2.00");
  await openLab(page);
  // 40 -> 255 * (40 / 255) ^ 0.5 = 101; 180 -> 214.
  await expect(page.locator("#refineLabReadout")).toContainText("Inside 214 → outside 101");
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
  await expect(page.locator("#refineLabReadout")).toContainText("Inside 180 → outside 40");
  await saveLab(page);

  await setPreprocess("segmentationPreprocessMedianToggle", true);
  await setPreprocess("segmentationPreprocessClaheInput", "40");
  await setPreprocess("segmentationPreprocessLevelsInput", "10");
  await expect(page.locator("#segmentationPreprocessClaheValue")).toHaveText("4.0");
  await expect(page.locator("#segmentationPreprocessLevelsValue")).toHaveText("1.0%");
  await openLab(page);
  await expect(page.locator("#refineLabReadout")).not.toContainText("Inside 180 → outside 40");
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
  await setControl("segmentationPreprocessPresetSelect", "High contrast");
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
  await expect(page.locator("#refineLabReadout")).toContainText("Inside 233 → outside 0");
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
  await expect.poll(async () => ((await settingsFile(page)) as unknown as { activePreset: string }).activePreset).toBe("Fins HC");
  await page.locator("#refineSelectedBtn").click();
  await expect.poll(async () => {
    const box = (await geometries(page))[0];
    return Math.max(Math.abs(box.left - 20), Math.abs(box.top - 30), Math.abs(box.right - 60), Math.abs(box.bottom - 90));
  }, { timeout: 15_000 }).toBeLessThan(0.6);
  await page.locator("#refineRunPresetSelect").selectOption("");
  await expect.poll(async () => ((await settingsFile(page)) as unknown as { activePreset: string | null }).activePreset).toBeNull();
});
