// Refine Lab: a sandbox modal that re-runs edge refinement live on crops of real boxes while a draft of the
// settings is edited. Nothing touches the canvas or the saved settings until the user saves.
import {
  describeRefineSide,
  refineBox,
  REFINE_SIDES,
  toGray,
  type GrayImage,
  type RefineBoxInput,
  type RefineParams,
  type RefineRect,
  type RefineResult,
  type RefineSide,
  type RefineSideDiagnostics
} from "../domain/refine/edge-refine.js";
import { resolveRefineParams, type RefineSettingsDocument } from "../domain/refine/settings.js";
import { getColorForClass } from "../features/canvas/colors.js";
import { createRefineEditor, REFINE_CRITERION_LABELS } from "./refine-editor.js";

export type RefineLabCaseSource = "selection" | "classes" | "all";

export interface RefineLab {
  open(): void;
}

interface LabCase {
  id: string;
  classId: string;
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
// Covers the largest outward range (80) plus the largest background ring (40) and the ring gap.
const CROP_MARGIN = 128;
const WARN = "#f0ad4e";
const BAND_OPACITY_KEY = "easy-labeling:refine-lab-band-opacity";
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
  try {
    const stored = input.windowRef.localStorage.getItem(BAND_OPACITY_KEY);
    if (stored !== null && Number.isFinite(Number(stored))) bandOpacity.value = stored;
  } catch { /* storage unavailable: keep the default */ }

  let draft: RefineSettingsDocument = input.getSettings();
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
      notify: (message) => { status.textContent = message; }
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
  const prepare = (image: HTMLImageElement, box: RefineBoxInput, everyBox: readonly RefineBoxInput[]): LabCase => {
    const x0 = Math.max(0, Math.floor(box.x0 - CROP_MARGIN));
    const y0 = Math.max(0, Math.floor(box.y0 - CROP_MARGIN));
    const x1 = Math.min(image.naturalWidth || image.width, Math.ceil(box.x1 + CROP_MARGIN));
    const y1 = Math.min(image.naturalHeight || image.height, Math.ceil(box.y1 + CROP_MARGIN));
    const pixels = doc.createElement("canvas");
    pixels.width = Math.max(1, x1 - x0);
    pixels.height = Math.max(1, y1 - y0);
    const context = pixels.getContext("2d", { willReadFrequently: true })!;
    context.drawImage(image, x0, y0, pixels.width, pixels.height, 0, 0, pixels.width, pixels.height);
    const rgba = context.getImageData(0, 0, pixels.width, pixels.height).data;
    const shift = (r: RefineRect): RefineRect => ({ x0: r.x0 - x0, y0: r.y0 - y0, x1: r.x1 - x0, y1: r.y1 - y0 });
    return {
      id: box.id,
      classId: box.classId,
      local: shift(box),
      neighbours: everyBox.filter((n) => n.id !== box.id && n.x1 > x0 && n.x0 < x1 && n.y1 > y0 && n.y0 < y1).map(shift),
      img: { gray: toGray(rgba, pixels.width, pixels.height), width: pixels.width, height: pixels.height },
      pixels
    };
  };

  function loadCases(): void {
    const image = input.getImage();
    const targets = editor.targets();
    const boxes = image ? input.collectCases(source.value as RefineLabCaseSource, targets === "default" ? [] : targets).slice(0, MAX_CASES) : [];
    const everyBox = input.allBoxes();
    cases = image ? boxes.map((box) => prepare(image, box, everyBox)) : [];
    active = Math.min(active, Math.max(0, cases.length - 1));
    byId("refineLabSummary").textContent = cases.length
      ? `${cases.length} case${cases.length === 1 ? "" : "s"} · edits stay in this window until you save`
      : "No boxes for this source. Select boxes on the canvas, or switch the case source.";
    schedule();
  }

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

  /** Draws the crop around the case and returns the crop->screen mapping. */
  const drawCase = (context: CanvasRenderingContext2D, c: LabCase, r: LabResult, width: number, height: number, detail: boolean) => {
    const reach = Math.max(r.params.rangeOut, r.params.rangeIn) + 10;
    const vx = Math.max(0, c.local.x0 - reach);
    const vy = Math.max(0, c.local.y0 - reach);
    const vw = Math.min(c.img.width, c.local.x1 + reach) - vx;
    const vh = Math.min(c.img.height, c.local.y1 + reach) - vy;
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
      for (const side of REFINE_SIDES) {
        const d = r.sides[side];
        if (!d || r.params.sides[side] === "off") continue;
        const a = d.start;
        const b = d.start + d.raw.length;
        const band: [number, number, number, number] = side === "L" || side === "R"
          ? [X(a), Y(c.local.y0), (b - a) * s, (c.local.y1 - c.local.y0) * s]
          : [X(c.local.x0), Y(a), (c.local.x1 - c.local.x0) * s, (b - a) * s];
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

  const drawProfile = (c: LabCase, r: LabResult): void => {
    const context = fitCanvas(profile);
    const width = profile.clientWidth;
    const height = profile.clientHeight;
    const d = r.sides[activeSide];
    const off = r.params.sides[activeSide] === "off";
    if (!d) return;
    const n = d.raw.length;
    const pad = { l: 34, r: 10, t: 18, b: 20 };
    const plotW = width - pad.l - pad.r;
    const plotH = height - pad.t - pad.b;
    let lo = Infinity;
    let hi = -Infinity;
    d.raw.forEach((v) => { lo = Math.min(lo, v); hi = Math.max(hi, v); });
    if (hi - lo < 1) { hi += 1; lo -= 1; }
    // Inside is always on the left, outside on the right, whatever the side.
    const flip = d.out < 0;
    const PX = (u: number): number => pad.l + ((flip ? n - u : u) / n) * plotW;
    const PY = (v: number): number => pad.t + (1 - (v - lo) / (hi - lo)) * plotH;
    const styles = getComputedStyle(profile);
    const text = styles.getPropertyValue("--workbench-text").trim() || "#1f2933";
    const muted = styles.getPropertyValue("--workbench-text-muted").trim() || "#64707d";
    const border = styles.getPropertyValue("--workbench-border").trim() || "#d7dde3";

    context.strokeStyle = border;
    context.lineWidth = 1;
    context.strokeRect(pad.l, pad.t, plotW, plotH);
    context.fillStyle = muted;
    context.font = "11px system-ui, sans-serif";
    context.fillText(String(Math.round(hi)), 4, pad.t + 8);
    context.fillText(String(Math.round(lo)), 4, pad.t + plotH);
    context.fillText("◀ inside", pad.l, height - 5);
    const outsideLabel = "outside ▶";
    context.fillText(outsideLabel, pad.l + plotW - context.measureText(outsideLabel).width, height - 5);

    const edgeAt = (coordinate: number): number => PX(coordinate - d.start);
    const originalCoordinate = c.local[SIDE_KEY[activeSide]];
    context.setLineDash([4, 3]);
    context.strokeStyle = muted;
    context.beginPath();
    context.moveTo(edgeAt(originalCoordinate), pad.t);
    context.lineTo(edgeAt(originalCoordinate), pad.t + plotH);
    context.stroke();
    context.setLineDash([]);
    if (d.inside !== null && d.outside !== null) {
      context.strokeStyle = border;
      for (const level of [d.inside, d.outside]) {
        if (level < lo || level > hi) continue;
        context.beginPath();
        context.moveTo(pad.l, PY(level));
        context.lineTo(pad.l + plotW, PY(level));
        context.stroke();
      }
    }
    const series = (values: Float32Array, color: string, lineWidth: number): void => {
      context.strokeStyle = color;
      context.lineWidth = lineWidth;
      context.beginPath();
      values.forEach((v, i) => { const x = PX(i + 0.5); const y = PY(v); if (i) context.lineTo(x, y); else context.moveTo(x, y); });
      context.stroke();
    };
    series(d.raw, muted, 1);
    series(d.smoothed, styles.getPropertyValue("--workbench-primary").trim() || "#1769e0", 2);
    if (r.result && !off) {
      const x = edgeAt(r.result.box[SIDE_KEY[activeSide]]);
      context.strokeStyle = r.result.weakSides.includes(activeSide) ? WARN : getColorForClass(c.classId);
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(x, pad.t);
      context.lineTo(x, pad.t + plotH);
      context.stroke();
    }
    context.fillStyle = text;
    context.font = "600 11px system-ui, sans-serif";
    context.fillText(`${SIDE_NAMES[activeSide]} edge profile`, pad.l, 12);

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
  zoom.addEventListener("click", (event) => {
    const rect = zoom.getBoundingClientRect();
    const fx = (event.clientX - rect.left) / rect.width - 0.5;
    const fy = (event.clientY - rect.top) / rect.height - 0.5;
    activeSide = Math.abs(fx) > Math.abs(fy) ? (fx < 0 ? "L" : "R") : (fy < 0 ? "T" : "B");
    schedule();
  });
  source.addEventListener("change", loadCases);
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
