// Refine Lab: a sandbox modal that re-runs edge refinement live on crops of real boxes while a draft of the
// settings is edited. Nothing touches the canvas or the saved settings until the user saves.
import {
  describeRefineSide,
  refineBox,
  REFINE_SIDES,
  sideParams,
  type GrayImage,
  type RefineBoxInput,
  type RefineParams,
  type RefineRect,
  type RefineResult,
  type RefineSide,
  type RefineSideDiagnostics
} from "../domain/refine/edge-refine.js";
import { resolveRefineParams, type RefineImageSource, type RefineProcessing, type RefineSettingsDocument } from "../domain/refine/settings.js";
import { getColorForClass } from "../features/canvas/colors.js";
import { createRefineEditor, REFINE_CRITERION_LABELS } from "./refine-editor.js";

export type RefineLabCaseSource = "selection" | "classes" | "all";

export interface RefineLab {
  open(): void;
}

interface LabCase {
  id: string;
  classId: string;
  /** The box in image coordinates and the crop margin around it. */
  box: RefineBoxInput;
  margin: number;
  /** Image source and processing the crop was taken from (see imageKey). */
  source: string;
  /** Box and neighbours in crop coordinates. */
  local: RefineRect;
  neighbours: RefineRect[];
  img: GrayImage;
  pixels: HTMLCanvasElement;
}

interface LabResult {
  params: RefineParams;
  result: Omit<RefineResult, "id" | "classId"> | null;
  sides: Partial<Record<RefineSide, RefineSideDiagnostics>>;
}

const MAX_CASES = 24;
// Covers the largest outward range (80) plus the largest background ring (40) and the ring gap;
// scan-span extensions past the box ends grow a case's crop on demand.
const CROP_MARGIN = 128;
const WARN = "#f0ad4e";
const BAND_OPACITY_KEY = "easy-labeling:refine-lab-band-opacity";
const DELTA_STEP_KEY = "easy-labeling:refine-lab-delta-step";
const SIDE_NAMES: Record<RefineSide, string> = { L: "Left", R: "Right", T: "Top", B: "Bottom" };
const POLARITY_TEXT = { 1: "bright → dark", [-1]: "dark → bright", 0: "unclear" } as const;
const SIDE_KEY = { L: "x0", R: "x1", T: "y0", B: "y1" } as const;

export function createRefineLab(input: {
  documentRef: Document;
  windowRef: Window;
  getImage(): HTMLImageElement | null;
  getSettings(): RefineSettingsDocument;
  saveSettings(doc: RefineSettingsDocument): void;
  refineOnCanvas(ids: string[]): void;
  collectCases(source: RefineLabCaseSource, classIds: readonly string[]): RefineBoxInput[];
  /** Gray pixels refinement reads for rect (clamped), from the original or the processed image. */
  cropImage(image: HTMLImageElement, rect: RefineRect, source: RefineImageSource, processing: RefineProcessing | null): Promise<GrayImage & { x0: number; y0: number }>;
  loadPreprocessingPresets(): Promise<{ name: string; config: Record<string, unknown> }[]>;
  allBoxes(): RefineBoxInput[];
  classIds(): string[];
  className(classId: string): string | undefined;
  notify(message: string): void;
}): RefineLab {
  const doc = input.documentRef;
  const byId = <T extends HTMLElement>(id: string): T => doc.getElementById(id) as T;
  const modalElement = byId<HTMLElement>("refineLabModal");
  const modal = new input.windowRef.bootstrap.Modal(modalElement);
  const zoom = byId<HTMLCanvasElement>("refineLabZoom");
  const profile = byId<HTMLCanvasElement>("refineLabProfile");
  const casesList = byId<HTMLElement>("refineLabCases");
  const readout = byId<HTMLElement>("refineLabReadout");
  const status = byId<HTMLElement>("refineLabStatus");
  const source = byId<HTMLSelectElement>("refineLabSource");
  const sideTabs = byId<HTMLElement>("refineLabSideTabs");
  const bandOpacity = byId<HTMLInputElement>("refineLabBandOpacity");
  const deltaStepSelect = byId<HTMLSelectElement>("refineLabDeltaStep");
  try {
    const stored = input.windowRef.localStorage.getItem(DELTA_STEP_KEY);
    if (stored && [...deltaStepSelect.options].some((option) => option.value === stored)) deltaStepSelect.value = stored;
  } catch { /* storage unavailable: keep the default */ }
  try {
    const stored = input.windowRef.localStorage.getItem(BAND_OPACITY_KEY);
    if (stored !== null && Number.isFinite(Number(stored))) bandOpacity.value = stored;
  } catch { /* storage unavailable: keep the default */ }

  let draft: RefineSettingsDocument = input.getSettings();
  let preprocessingPresets: { name: string; config: Record<string, unknown> }[] = [];
  /** Identifies the pixels a crop shows: the image source plus the processing pinned for it. */
  const imageKey = (doc: RefineSettingsDocument): string =>
    doc.imageSource === "processed" ? `processed:${JSON.stringify(doc.processing?.config ?? "live")}` : "original";
  let cases: LabCase[] = [];
  let results: LabResult[] = [];
  let active = 0;
  let activeSide: RefineSide = "T";
  let frame = 0;

  const editor = createRefineEditor({
    root: byId("refineLabEditor"),
    prefix: "refineLab",
    documentRef: doc,
    windowRef: input.windowRef,
    store: {
      getDoc: () => draft,
      setDoc: (next) => { draft = next; editor.render(); schedule(); },
      classIds: input.classIds,
      className: input.className,
      notify: (message) => { status.textContent = message; },
      preprocessingPresets: () => preprocessingPresets
    }
  });
  editor.onTargetsChange(() => {
    if (source.value === "classes") loadCases();
  });
  // Editing one side shows that side's profile.
  editor.onScopeChange((scope) => {
    if (scope !== "all") { activeSide = scope; schedule(); }
  });

  // ---------------------------------------------------------------- cases
  // Crops come from the refine worker, so the lab shows exactly the gray pixels refinement reads.
  const prepare = async (image: HTMLImageElement, box: RefineBoxInput, everyBox: readonly RefineBoxInput[], margin = CROP_MARGIN): Promise<LabCase> => {
    const source = imageKey(draft);
    const crop = await input.cropImage(image, { x0: box.x0 - margin, y0: box.y0 - margin, x1: box.x1 + margin, y1: box.y1 + margin }, draft.imageSource, draft.processing);
    const { x0, y0, width, height } = crop;
    const pixels = doc.createElement("canvas");
    pixels.width = width;
    pixels.height = height;
    const imageData = pixels.getContext("2d")!.createImageData(width, height);
    for (let i = 0, o = 0; i < crop.gray.length; i += 1, o += 4) {
      const v = crop.gray[i];
      imageData.data[o] = v; imageData.data[o + 1] = v; imageData.data[o + 2] = v; imageData.data[o + 3] = 255;
    }
    pixels.getContext("2d")!.putImageData(imageData, 0, 0);
    const shift = (r: RefineRect): RefineRect => ({ x0: r.x0 - x0, y0: r.y0 - y0, x1: r.x1 - x0, y1: r.y1 - y0 });
    const x1 = x0 + width;
    const y1 = y0 + height;
    return {
      id: box.id,
      classId: box.classId,
      box,
      margin,
      source,
      local: shift(box),
      neighbours: everyBox.filter((n) => n.id !== box.id && n.x1 > x0 && n.x0 < x1 && n.y1 > y0 && n.y0 < y1).map(shift),
      img: { gray: crop.gray, width, height },
      pixels
    };
  };

  let caseToken = 0;
  let recropping = false;
  const fail = (error: unknown): void => { status.textContent = `Cannot load cases: ${error instanceof Error ? error.message : String(error)}`; };

  function loadCases(): void {
    const image = input.getImage();
    const targets = editor.targets();
    const boxes = image ? input.collectCases(source.value as RefineLabCaseSource, targets === "default" ? [] : targets).slice(0, MAX_CASES) : [];
    const everyBox = input.allBoxes();
    const token = ++caseToken;
    byId("refineLabSummary").textContent = boxes.length
      ? `${boxes.length} case${boxes.length === 1 ? "" : "s"} · edits stay in this window until you save`
      : "No boxes for this source. Select boxes on the canvas, or switch the case source.";
    if (!image || !boxes.length) { cases = []; schedule(); return; }
    status.textContent = "Loading cases…";
    Promise.all(boxes.map((box) => prepare(image, box, everyBox))).then((loaded) => {
      if (token !== caseToken) return;
      cases = loaded;
      active = Math.min(active, Math.max(0, cases.length - 1));
      schedule();
    }).catch(fail);
  }

  /** Crop margin a case needs so the draft's scan-span extensions stay inside it. */
  const neededMargin = (c: LabCase): number => {
    const params = resolveRefineParams(draft, c.classId);
    const extension = Math.max(...REFINE_SIDES.map((side) => { const p = sideParams(params, side); return p.scanSpan === "box" ? 0 : Math.max(p.extendStart, p.extendEnd); }));
    return CROP_MARGIN + extension;
  };
  /** Re-crops cases whose image source changed or whose extensions outgrew the crop; renders again when done. */
  const recropStale = (): void => {
    const image = input.getImage();
    const stale = (c: LabCase): boolean => c.source !== imageKey(draft) || neededMargin(c) > c.margin;
    if (recropping || !image || !cases.some(stale)) return;
    recropping = true;
    const token = caseToken;
    const everyBox = input.allBoxes();
    Promise.all(cases.map((c) => (stale(c) ? prepare(image, c.box, everyBox, Math.max(c.margin, Math.ceil(neededMargin(c) / 64) * 64)) : c)))
      .then((next) => { if (token === caseToken) cases = next; })
      .catch(fail)
      .finally(() => { recropping = false; schedule(); });
  };

  const compute = (c: LabCase): LabResult => {
    const params = resolveRefineParams(draft, c.classId);
    const sides: LabResult["sides"] = {};
    for (const side of REFINE_SIDES) sides[side] = describeRefineSide(c.img, c.local, side, params, c.neighbours);
    return { params, result: params.enabled ? refineBox(c.img, c.local, params, c.neighbours) : null, sides };
  };

  // ---------------------------------------------------------------- drawing
  const fitCanvas = (canvas: HTMLCanvasElement): CanvasRenderingContext2D => {
    const ratio = input.windowRef.devicePixelRatio || 1;
    const width = Math.max(1, Math.round(canvas.clientWidth * ratio));
    const height = Math.max(1, Math.round(canvas.clientHeight * ratio));
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
    const context = canvas.getContext("2d")!;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    return context;
  };

  /** Search bands as drawn in the zoom view (CSS px), for click-to-edit. */
  let zoomBands: { side: RefineSide; x: number; y: number; w: number; h: number }[] = [];

  /** Draws the crop around the case and returns the crop->screen mapping. */
  const drawCase = (context: CanvasRenderingContext2D, c: LabCase, r: LabResult, width: number, height: number, detail: boolean) => {
    // Search bands in crop coordinates: the perpendicular search range over every scanned run along the side.
    const bands: { side: RefineSide; rect: RefineRect }[] = [];
    for (const side of REFINE_SIDES) {
      const d = r.sides[side];
      if (!d || r.params.sides[side] === "off") continue;
      const a = d.start;
      const b = d.start + d.raw.length;
      for (const [from, to] of d.runs) {
        bands.push({ side, rect: side === "L" || side === "R" ? { x0: a, y0: from, x1: b, y1: to + 1 } : { x0: from, y0: a, x1: to + 1, y1: b } });
      }
    }
    const reach = Math.max(r.params.rangeOut, r.params.rangeIn) + 10;
    let [vx0, vy0, vx1, vy1] = [c.local.x0 - reach, c.local.y0 - reach, c.local.x1 + reach, c.local.y1 + reach];
    if (detail) {
      for (const { rect } of bands) {
        vx0 = Math.min(vx0, rect.x0 - 6); vy0 = Math.min(vy0, rect.y0 - 6);
        vx1 = Math.max(vx1, rect.x1 + 6); vy1 = Math.max(vy1, rect.y1 + 6);
      }
    }
    const vx = Math.max(0, vx0);
    const vy = Math.max(0, vy0);
    const vw = Math.min(c.img.width, vx1) - vx;
    const vh = Math.min(c.img.height, vy1) - vy;
    const s = Math.min(width / vw, height / vh);
    const ox = (width - vw * s) / 2;
    const oy = (height - vh * s) / 2;
    const X = (x: number): number => ox + (x - vx) * s;
    const Y = (y: number): number => oy + (y - vy) * s;
    context.imageSmoothingEnabled = false;
    context.drawImage(c.pixels, vx, vy, vw, vh, ox, oy, vw * s, vh * s);

    if (detail) {
      // Search ranges: user-set fill opacity plus an outline, so the range stays findable even at low opacity.
      const alpha = Number(bandOpacity.value) / 100;
      zoomBands = [];
      for (const { side, rect } of bands) {
        const band: [number, number, number, number] = [X(rect.x0), Y(rect.y0), (rect.x1 - rect.x0) * s, (rect.y1 - rect.y0) * s];
        zoomBands.push({ side, x: band[0], y: band[1], w: band[2], h: band[3] });
        const emphasis = side === activeSide ? 1.6 : 1;
        context.fillStyle = `rgba(23, 105, 224, ${Math.min(1, alpha * emphasis)})`;
        context.fillRect(...band);
        context.strokeStyle = side === activeSide ? "rgba(120, 180, 255, 0.95)" : "rgba(120, 180, 255, 0.6)";
        context.lineWidth = side === activeSide ? 1.5 : 1;
        context.strokeRect(...band);
      }
    }
    // Original box: dashed white over a dark halo so it reads on any background.
    const original = [X(c.local.x0), Y(c.local.y0), (c.local.x1 - c.local.x0) * s, (c.local.y1 - c.local.y0) * s] as const;
    context.setLineDash([4, 3]);
    context.lineWidth = 3;
    context.strokeStyle = "rgba(0, 0, 0, 0.55)";
    context.strokeRect(...original);
    context.lineWidth = 1.2;
    context.strokeStyle = "#ffffff";
    context.strokeRect(...original);
    context.setLineDash([]);
    if (r.result) {
      const box = r.result.box;
      const color = getColorForClass(c.classId);
      const edges: Record<RefineSide, [number, number, number, number]> = {
        L: [X(box.x0), Y(box.y0), X(box.x0), Y(box.y1)],
        R: [X(box.x1), Y(box.y0), X(box.x1), Y(box.y1)],
        T: [X(box.x0), Y(box.y0), X(box.x1), Y(box.y0)],
        B: [X(box.x0), Y(box.y1), X(box.x1), Y(box.y1)]
      };
      for (const side of REFINE_SIDES) {
        const weak = r.result.weakSides.includes(side);
        context.strokeStyle = weak ? WARN : color;
        context.lineWidth = weak ? 3 : 2;
        context.beginPath();
        context.moveTo(edges[side][0], edges[side][1]);
        context.lineTo(edges[side][2], edges[side][3]);
        context.stroke();
      }
      if (detail) {
        context.font = "600 11px system-ui, sans-serif";
        for (const side of REFINE_SIDES) {
          const conf = r.result.sideConf[side];
          if (conf === undefined) continue;
          const [ax, ay, bx, by] = edges[side];
          const text = `${side} ${conf.toFixed(2)}`;
          const tx = side === "L" ? ax - 44 : side === "R" ? ax + 6 : (ax + bx) / 2 - 18;
          const ty = side === "T" ? ay - 6 : side === "B" ? by + 14 : (ay + by) / 2;
          context.fillStyle = "rgba(0, 0, 0, 0.6)";
          context.fillRect(tx - 3, ty - 11, context.measureText(text).width + 6, 15);
          context.fillStyle = r.result.weakSides.includes(side) ? WARN : "#ffffff";
          context.fillText(text, tx, ty);
        }
      }
    }
    return { X, Y, s };
  };

  /**
   * Two stacked plots sharing an inside -> outside axis: the mean brightness across the side (raw and
   * smoothed) and its change over `deltaStep` pixels, Δ(x) = P(x + k/2) - P(x - k/2). A positive change
   * means the image gets brighter going outward.
   */
  const drawProfile = (c: LabCase, r: LabResult): void => {
    const context = fitCanvas(profile);
    const width = profile.clientWidth;
    const height = profile.clientHeight;
    const d = r.sides[activeSide];
    const off = r.params.sides[activeSide] === "off";
    if (!d) return;
    const n = d.raw.length;
    const k = Math.max(1, Math.min(n - 1, Number(deltaStepSelect.value) || 1));
    const flip = d.out < 0;
    // Samples ordered inside -> outside; sample j covers [j, j + 1) on that axis.
    const oriented = (values: Float32Array): Float32Array => (flip ? Float32Array.from(values).reverse() : values);
    const raw = oriented(d.raw);
    const smoothed = oriented(d.smoothed);
    const delta = (values: Float32Array): Float32Array => Float32Array.from({ length: Math.max(0, n - k) }, (_, j) => values[j + k] - values[j]);
    const rawDelta = delta(raw);
    const smoothDelta = delta(smoothed);

    const styles = getComputedStyle(profile);
    const text = styles.getPropertyValue("--workbench-text").trim() || "#1f2933";
    const muted = styles.getPropertyValue("--workbench-text-muted").trim() || "#64707d";
    const border = styles.getPropertyValue("--workbench-border").trim() || "#d7dde3";
    const primary = styles.getPropertyValue("--workbench-primary").trim() || "#1769e0";
    const pad = { l: 38, r: 10 };
    const plotW = width - pad.l - pad.r;
    const X = (u: number): number => pad.l + (u / n) * plotW;
    const imageToAxis = (coordinate: number): number => { const u = coordinate - d.start; return flip ? n - u : u; };
    const originalAxis = imageToAxis(c.local[SIDE_KEY[activeSide]]);
    const resultAxis = r.result && !off ? imageToAxis(r.result.box[SIDE_KEY[activeSide]]) : null;
    const resultColor = r.result?.weakSides.includes(activeSide) ? WARN : getColorForClass(c.classId);

    const panel = (top: number, plotH: number, title: string, series: { values: Float32Array; offset: number; color: string; lineWidth: number }[], levels: number[], zero: boolean): void => {
      let lo = Infinity;
      let hi = -Infinity;
      for (const { values } of series) values.forEach((v) => { lo = Math.min(lo, v); hi = Math.max(hi, v); });
      if (zero) { const m = Math.max(Math.abs(lo), Math.abs(hi), 1); lo = -m; hi = m; }
      if (!Number.isFinite(lo) || hi - lo < 1) { lo = (Number.isFinite(lo) ? lo : 0) - 1; hi = lo + 2; }
      const Y = (v: number): number => top + (1 - (v - lo) / (hi - lo)) * plotH;
      context.strokeStyle = border;
      context.lineWidth = 1;
      context.strokeRect(pad.l, top, plotW, plotH);
      context.fillStyle = muted;
      context.font = "11px system-ui, sans-serif";
      context.fillText(String(Math.round(hi)), 4, top + 9);
      context.fillText(String(Math.round(lo)), 4, top + plotH);
      for (const level of zero ? [0] : levels) {
        if (level < lo || level > hi) continue;
        context.beginPath();
        context.moveTo(pad.l, Y(level));
        context.lineTo(pad.l + plotW, Y(level));
        context.stroke();
      }
      const vertical = (axis: number, color: string, dashed: boolean, lineWidth: number): void => {
        context.setLineDash(dashed ? [4, 3] : []);
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        context.beginPath();
        context.moveTo(X(axis), top);
        context.lineTo(X(axis), top + plotH);
        context.stroke();
        context.setLineDash([]);
      };
      vertical(originalAxis, muted, true, 1);
      for (const { values, offset, color, lineWidth } of series) {
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        context.beginPath();
        values.forEach((v, j) => { const x = X(j + offset); if (j) context.lineTo(x, Y(v)); else context.moveTo(x, Y(v)); });
        context.stroke();
      }
      if (resultAxis !== null) vertical(resultAxis, resultColor, false, 2);
      context.fillStyle = text;
      context.font = "600 11px system-ui, sans-serif";
      context.fillText(title, pad.l, top - 5);
    };

    const gap = 18;
    const bottom = 18;
    const plotH = Math.max(30, (height - gap * 2 - bottom) / 2);
    const levels = d.inside !== null && d.outside !== null ? [d.inside, d.outside] : [];
    panel(gap, plotH, `${SIDE_NAMES[activeSide]} edge · mean brightness`, [
      { values: raw, offset: 0.5, color: muted, lineWidth: 1 },
      { values: smoothed, offset: 0.5, color: primary, lineWidth: 2 }
    ], levels, false);
    panel(gap * 2 + plotH, plotH, `Change over ${k} px (outward, + = brighter)`, [
      { values: rawDelta, offset: 0.5 + k / 2, color: muted, lineWidth: 1 },
      { values: smoothDelta, offset: 0.5 + k / 2, color: primary, lineWidth: 2 }
    ], [], true);
    context.fillStyle = muted;
    context.font = "11px system-ui, sans-serif";
    context.fillText("◀ inside", pad.l, height - 4);
    const outsideLabel = "outside ▶";
    context.fillText(outsideLabel, pad.l + plotW - context.measureText(outsideLabel).width, height - 4);
    const originalCoordinate = c.local[SIDE_KEY[activeSide]];

    const moved = r.result && !off ? r.result.box[SIDE_KEY[activeSide]] - originalCoordinate : 0;
    const outward = (d.out > 0 ? moved : -moved);
    const detected = d.inside !== null && d.outside !== null
      ? `Inside ${Math.round(d.inside)} → outside ${Math.round(d.outside)}: ${POLARITY_TEXT[d.detectedPolarity]}`
      : "Background ring off: polarity is not measured";
    const usedPolarity = r.params.polarity === "auto"
      ? `Auto → ${POLARITY_TEXT[d.polarity]}`
      : `${POLARITY_TEXT[d.polarity]} (fixed)${d.detectedPolarity !== 0 && d.detectedPolarity !== d.polarity ? " · differs from the image" : ""}`;
    readout.replaceChildren(...[
      off ? `${SIDE_NAMES[activeSide]}: off` : `${SIDE_NAMES[activeSide]}: ${REFINE_CRITERION_LABELS[d.criterion]} · confidence ${(r.result?.sideConf[activeSide] ?? 0).toFixed(2)} · ${outward >= 0 ? "out" : "in"} ${Math.abs(outward).toFixed(1)} px`,
      detected,
      `Polarity used: ${usedPolarity}`
    ].map((line, index) => {
      const row = doc.createElement("div");
      row.textContent = line;
      if (index === 2 && line.includes("differs")) row.className = "text-warning";
      return row;
    }));
  };

  const renderCases = (): void => {
    const fragment = doc.createDocumentFragment();
    cases.forEach((c, index) => {
      const r = results[index];
      const button = doc.createElement("button");
      button.type = "button";
      button.className = "refine-lab-case";
      button.dataset.index = String(index);
      button.setAttribute("aria-pressed", String(index === active));
      button.classList.toggle("is-flagged", Boolean(r.result?.flagged));
      button.classList.toggle("is-off", !r.result);
      const thumb = doc.createElement("canvas");
      thumb.width = 88;
      thumb.height = 88;
      const context = thumb.getContext("2d")!;
      context.fillStyle = "#111";
      context.fillRect(0, 0, 88, 88);
      drawCase(context, c, r, 88, 88, false);
      const label = doc.createElement("span");
      label.textContent = `${c.classId}${input.className(c.classId) ? ` ${input.className(c.classId)}` : ""} · ${r.result ? r.result.conf.toFixed(2) : "off"}`;
      button.append(thumb, label);
      fragment.appendChild(button);
    });
    casesList.replaceChildren(fragment);
  };

  function render(): void {
    frame = 0;
    if (!modalElement.classList.contains("show")) return;
    const started = performance.now();
    recropStale();
    results = cases.map(compute);
    const elapsed = performance.now() - started;
    renderCases();
    sideTabs.querySelectorAll<HTMLButtonElement>("[data-side]").forEach((tab) => tab.setAttribute("aria-pressed", String(tab.dataset.side === activeSide)));
    const context = fitCanvas(zoom);
    const c = cases[active];
    if (!c) { readout.textContent = ""; fitCanvas(profile); return; }
    drawCase(context, c, results[active], zoom.clientWidth, zoom.clientHeight, true);
    drawProfile(c, results[active]);
    const flagged = results.filter((r) => r.result?.flagged).length;
    status.textContent = `${cases.length} cases · ${flagged} to review · ${elapsed.toFixed(1)} ms`;
  }

  function schedule(): void {
    if (!frame) frame = input.windowRef.requestAnimationFrame(render);
  }

  casesList.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest<HTMLElement>(".refine-lab-case");
    if (!button) return;
    active = Number(button.dataset.index);
    const c = cases[active];
    if (c && source.value !== "classes") editor.setTargets([c.classId]);
    schedule();
  });
  sideTabs.addEventListener("click", (event) => {
    const side = (event.target as HTMLElement).closest<HTMLElement>("[data-side]")?.dataset.side as RefineSide | undefined;
    if (side) { activeSide = side; schedule(); }
  });
  // Clicking the zoom view picks the nearest side for the profile.
  // Clicking a search band opens that side's Edge rule; elsewhere it only switches the profile to the nearest side.
  zoom.addEventListener("click", (event) => {
    const rect = zoom.getBoundingClientRect();
    const px = event.clientX - rect.left;
    const py = event.clientY - rect.top;
    // Bands overlap at corners; the active side's band wins, then the narrowest one.
    const hits = zoomBands.filter((b) => px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h)
      .sort((a, b) => Number(b.side === activeSide) - Number(a.side === activeSide) || (a.w * a.h) - (b.w * b.h));
    if (hits.length) {
      activeSide = hits[0].side;
      editor.setScope(activeSide);
      editor.focusRule();
    } else {
      const fx = px / rect.width - 0.5;
      const fy = py / rect.height - 0.5;
      activeSide = Math.abs(fx) > Math.abs(fy) ? (fx < 0 ? "L" : "R") : (fy < 0 ? "T" : "B");
    }
    schedule();
  });
  zoom.addEventListener("mousemove", (event) => {
    const rect = zoom.getBoundingClientRect();
    const px = event.clientX - rect.left;
    const py = event.clientY - rect.top;
    zoom.style.cursor = zoomBands.some((b) => px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) ? "pointer" : "crosshair";
  });
  source.addEventListener("change", loadCases);
  deltaStepSelect.addEventListener("change", () => {
    try { input.windowRef.localStorage.setItem(DELTA_STEP_KEY, deltaStepSelect.value); } catch { /* per-viewer convenience only */ }
    schedule();
  });
  bandOpacity.addEventListener("input", () => {
    try { input.windowRef.localStorage.setItem(BAND_OPACITY_KEY, bandOpacity.value); } catch { /* per-viewer convenience only */ }
    schedule();
  });
  modalElement.addEventListener("shown.bs.modal", schedule);
  new ResizeObserver(schedule).observe(zoom);
  byId("refineLabSaveBtn").addEventListener("click", () => {
    input.saveSettings(draft);
    modal.hide();
  });
  byId("refineLabApplyBtn").addEventListener("click", () => {
    input.saveSettings(draft);
    modal.hide();
    input.refineOnCanvas(cases.map((c) => c.id));
  });

  return {
    open(): void {
      if (!input.getImage()) { input.notify("Open an image in the Detection workflow first."); return; }
      draft = input.getSettings();
      void input.loadPreprocessingPresets().then((presets) => { preprocessingPresets = presets; editor.render(); }).catch(() => undefined);
      const selection = input.collectCases("selection", []);
      source.value = selection.length ? "selection" : "classes";
      active = 0;
      // Start on the class of the first selected box so edits apply where the user is looking.
      if (selection.length) editor.setTargets([selection[0].classId]);
      else editor.render();
      loadCases();
      modal.show();
    }
  };
}
