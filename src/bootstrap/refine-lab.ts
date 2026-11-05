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
import {
  applyReclassPreset,
  applyRefinePreset,
  mergeRefinePresets,
  resolveRefineParams,
  saveReclassPreset,
  saveRefinePreset,
  type ReclassPreset,
  type RefineImageSource,
  type RefineMode,
  type RefinePreset,
  type RefineProcessing,
  type RefineSettingsDocument
} from "../domain/refine/settings.js";
import { centreCrop, describeReclassRule, judgeReclass, measureReclass, reclassRuleOf, ruleChecks, type ReclassRule, type ReclassStats } from "../domain/refine/reclass.js";
import { getColorForClass } from "../features/canvas/colors.js";
import { createRefineEditor, REFINE_CRITERION_LABELS } from "./refine-editor.js";
import { layoutMarks, drawMarks, RECLASS_COLOR } from "./refine-marks.js";

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
  /** The whole image in crop coordinates (the crop is clipped to it). */
  imageBounds: RefineRect;
  neighbours: RefineRect[];
  img: GrayImage;
  pixels: HTMLCanvasElement;
  /** Same crop from the image the reclass checks read (the edge crop itself when both read the same image). */
  reclassSource: string;
  reclassImg: GrayImage;
  reclassPixels: HTMLCanvasElement;
}

interface LabResult {
  params: RefineParams;
  result: Omit<RefineResult, "id" | "classId"> | null;
  sides: Partial<Record<RefineSide, RefineSideDiagnostics>>;
  /** Null when the rule does not check this case's class. same: the box is already of the rule's class (Apply leaves it). */
  reclass: { stats: ReclassStats; rule: ReclassRule; match: boolean; same: boolean } | null;
}

const MAX_CASES = 24;
// Initial crop margin around a case; neededMargin() grows it on demand for wider outward searches,
// background rings and scan-span extensions, so a case always holds every pixel refinement reads.
const CROP_MARGIN = 128;
const WARN = "#f0ad4e";
/** One colour per scanned part in "Strongest part" mode, by where it lies: the start end, the box, the end end. */
const PART_COLORS = { start: "#e8890c", box: "#2e9e6b", end: "#b44bc4" } as const;
const partColor = (d: RefineSideDiagnostics, index: number): string => PART_COLORS[d.runKinds[index] ?? "box"];

/** Names the scanned runs of a side by where they lie along it: the start end, the box, the end end. */
const partNames = (d: RefineSideDiagnostics): string[] => {
  const vertical = d.side === "L" || d.side === "R";
  return d.runKinds.map((kind) => (kind === "start" ? (vertical ? "Top end" : "Left end") : kind === "end" ? (vertical ? "Bottom end" : "Right end") : "Box"));
};
const BAND_OPACITY_KEY = "easy-labeling:refine-lab-band-opacity";
const SIDE_NAMES: Record<RefineSide, string> = { L: "Left", R: "Right", T: "Top", B: "Bottom" };
const POLARITY_TEXT = { 1: "bright → dark", [-1]: "dark → bright", 0: "unclear" } as const;
const SIDE_KEY = { L: "x0", R: "x1", T: "y0", B: "y1" } as const;

/** Search range actually used on a side, naming what cut it short of the setting. */
const searchText = (d: RefineSideDiagnostics, set: RefineParams, room: number): string => {
  const inward = `${d.rangeIn} px in${d.rangeIn < set.rangeIn ? " (box limit)" : ""}`;
  const limits = [
    ...(d.rangeOut < set.rangeOut ? [`set ${set.rangeOut}, stops halfway to a neighbour`] : []),
    ...(d.rangeOut > room ? [`image edge after ${Math.max(0, Math.floor(room))} px`] : [])
  ];
  return `Search ${inward} · ${d.rangeOut} px out${limits.length ? ` (${limits.join("; ")})` : ""}`;
};
/** Outward distance (px) from the original edge to a coordinate on that side's axis (0 for the edge itself). */
const imageToOutward = (d: RefineSideDiagnostics, original: number, value = original): number => (value - original) * d.out;

const COMBINE_TEXT = { outer: "Outermost (10% toward outside)", median: "Median" } as const;
/** Plain-language account of how the side's edge was chosen, with the numbers the plots show. */
const pickText = (d: RefineSideDiagnostics, set: RefineParams, iterations: number, firstShift: number | null, finalShift: number | null): string => {
  const near = set.nearWeight ? "weighted toward the current edge" : "anywhere in the range";
  const how = d.criterion === "grad"
    ? `Max gradient: largest ${d.polarity === 0 ? "change" : d.polarity > 0 ? "bright → dark change" : "dark → bright change"} ${near}`
    : d.criterion === "thr" ? "50% level: crossing nearest the current edge"
      : `${d.criterion === "peak" ? "Band centre" : "Band outer 50%"}: brightest band ${near}`;
  const found = d.segments.filter((segment) => segment.value !== null).length;
  const kept = d.segments.filter((segment) => segment.kept).length;
  const shift = (value: number | null): string => (value === null ? "no edge" : `${value >= 0 ? "out" : "in"} ${Math.abs(value).toFixed(1)} px`);
  return `${how} · ${d.segments.length} segment${d.segments.length === 1 ? "" : "s"}: ${found} found, ${kept} kept (≥ ½ best confidence) → ${COMBINE_TEXT[set.comb]} = ${shift(firstShift)}`
    + (finalShift === null ? "" : ` · after ${iterations} pass${iterations === 1 ? "" : "es"}: ${shift(finalShift)}`);
};

const PAIR_AXIS_NAMES = { TB: "Top + bottom", LR: "Left + right" } as const;
/** How a paired side was chosen: the preferred kind, what it fell back to, and the pick among the pairs. */
const pairText = (pair: NonNullable<RefineSideDiagnostics["pair"]>): string => {
  const kind = (group: "grow" | "shrink") => (group === "grow" ? "growing" : "shrinking");
  const rule = pair.pick === "strongest" ? "clearest" : "nearest";
  const change = `${pair.spanChange >= 0 ? "+" : "−"}${Math.abs(pair.spanChange).toFixed(1)} px`;
  const candidates = `this side: ${pair.candidates.length} candidate${pair.candidates.length === 1 ? "" : "s"}`;
  const pairs = `${pair.pool} pair${pair.pool === 1 ? "" : "s"}`;
  const how = pair.group === null
    ? (pair.chosen === null ? "no edge found" : `one side found no edge, ${rule} edge of the other used`)
    : pair.fallback ? `no ${kind(pair.prefer)} pair, used the ${rule} of ${pairs} ${kind(pair.group)}`
      : `${rule} of ${pairs} ${kind(pair.group)}`;
  return `${PAIR_AXIS_NAMES[pair.axis]} pair: prefer ${kind(pair.prefer)} · ${how} (${change}) · ${candidates}`;
};

/** Pixels between a side of the box and the image border, outward. */
const roomOutside = (c: { local: RefineRect; imageBounds: RefineRect }, side: RefineSide): number => ({
  L: c.local.x0 - c.imageBounds.x0, R: c.imageBounds.x1 - c.local.x1, T: c.local.y0 - c.imageBounds.y0, B: c.imageBounds.y1 - c.local.y1
})[side];

export function createRefineLab(input: {
  documentRef: Document;
  windowRef: Window;
  getImage(): HTMLImageElement | null;
  getSettings(): RefineSettingsDocument;
  saveSettings(doc: RefineSettingsDocument): void;
  refineOnCanvas(ids: string[]): void;
  /** Reclasses these canvas boxes with the saved reclass settings (as the pane's Apply does). */
  reclassOnCanvas(ids: string[]): void;
  collectCases(source: RefineLabCaseSource, classIds: readonly string[]): RefineBoxInput[];
  /** Gray pixels refinement reads for rect (clamped), from the original or the processed image. */
  cropImage(image: HTMLImageElement, rect: RefineRect, source: RefineImageSource, processing: RefineProcessing | null): Promise<GrayImage & { x0: number; y0: number }>;
  loadPreprocessingPresets(): Promise<{ name: string; config: Record<string, unknown> }[]>;
  imageFolder(): FileSystemDirectoryHandle | null;
  profilePresets(): RefinePreset[];
  /** Desktop: deletes a preset's profile folder file. */
  deleteProfilePreset?(name: string): Promise<void>;
  profileReclassPresets(): ReclassPreset[];
  deleteProfileReclassPreset?(name: string): Promise<void>;
  allBoxes(): RefineBoxInput[];
  /** Box bounds as loaded from the label file (the base for reclass shrink checks), or null. */
  loadedBox(id: string): RefineRect | null;
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
  let preprocessingPresets: { name: string; config: Record<string, unknown> }[] = [];
  /** Identifies the pixels a crop shows: the image source plus the processing pinned for it. */
  const sourceKey = (imageSource: RefineImageSource, processing: RefineProcessing | null): string =>
    imageSource === "processed" ? `processed:${JSON.stringify(processing?.config ?? "live")}` : "original";
  const imageKey = (doc: RefineSettingsDocument): string => sourceKey(doc.imageSource, doc.processing);
  const reclassKey = (doc: RefineSettingsDocument): string => sourceKey(doc.reclassImageSource, doc.reclassProcessing);
  const reclassMode = (): boolean => draft.mode === "reclass";
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
      setDoc: (next) => { draft = next; editor.render(); renderPresetEdit(); schedule(); },
      classIds: input.classIds,
      className: input.className,
      notify: (message) => { status.textContent = message; },
      preprocessingPresets: () => preprocessingPresets,
      imageFolder: input.imageFolder,
      profilePresets: input.profilePresets,
      deleteProfilePreset: input.deleteProfilePreset,
      profileReclassPresets: input.profileReclassPresets,
      deleteProfileReclassPreset: input.deleteProfileReclassPreset
    }
  });
  /**
   * Preset the edited values stand for, per mode; the preset name field shows it. `runWith`: the pane's
   * Run-with preset, opened for editing; class settings stay as they were and Save writes only the preset.
   * Otherwise a preset applied or saved here. Save writes the values into the preset the name field names.
   */
  type PresetEdit = { name: string; target: "default" | string[]; runWith: boolean; sync: boolean };
  let presetEdits: Record<RefineMode, PresetEdit | null> = { edge: null, reclass: null };
  const presetBanner = byId<HTMLElement>("refineLabPresetBanner");
  /** The mode whose preset the name field shows; switching modes shows the other mode's preset. */
  let nameMode: RefineMode | null = null;
  /** Banner and name field for the preset the current mode edits. */
  const renderPresetEdit = (): void => {
    const edit = presetEdits[draft.mode];
    if (nameMode !== draft.mode) {
      nameMode = draft.mode;
      editor.setPresetName(edit?.name ?? "");
    }
    presetBanner.hidden = !edit?.runWith;
    presetBanner.textContent = !edit?.runWith ? ""
      : draft.mode === "reclass"
        ? `Reclass with "${edit.name}": edits here update this preset. To edit the Lab rule, choose Lab rule under Reclass with in the Refine pane.`
        : `Run with "${edit.name}": edits here update this preset, which refines every class. To edit class settings, choose Class settings under Run with in the Refine pane.`;
    const apply = byId("refineLabApplyBtn");
    apply.textContent = draft.mode === "reclass" ? "Save & reclass these boxes" : "Save & refine these boxes";
  };
  editor.onPresetChange((name, target, mode) => {
    if (presetEdits[mode]?.runWith) return; // values loaded from another preset still save into the Run-with preset
    presetEdits = { ...presetEdits, [mode]: { name, target, runWith: false, sync: true } };
    renderPresetEdit();
  });
  /**
   * Links the current mode to the preset the name field names: the preset loaded or saved here, or a new one
   * under a typed name. An emptied field keeps the values out of any preset (a Run-with preset still saves).
   */
  const linkPresetName = (): void => {
    const name = editor.presetName();
    const mode = draft.mode;
    const edit = presetEdits[mode];
    if (!name) {
      if (edit && !edit.runWith) edit.sync = false;
      return;
    }
    if (edit?.name === name) { edit.sync = true; return; }
    const target = mode === "edge" ? edit?.target ?? editor.targets() : "default";
    presetEdits = { ...presetEdits, [mode]: { name, target, runWith: edit?.runWith ?? false, sync: true } };
  };
  /** Saves the draft, writing the edited values into the presets being edited (see presetEdits). */
  const commit = (): void => {
    let next = draft;
    const edge = presetEdits.edge;
    if (edge && (edge.runWith || edge.sync)) {
      const { name, target } = edge;
      const datasetOwned = next.presets.some((preset) => preset.name === name);
      const updated = saveRefinePreset(next, name, target === "default" ? next.default : resolveRefineParams(next, target[0]!), { imageSource: next.imageSource, processing: next.processing });
      // Only an edited preset is written (an untouched profile preset stays out of the dataset).
      const before = mergeRefinePresets(next.presets, input.profilePresets()).find((preset) => preset.name === name);
      const after = updated.presets.find((preset) => preset.name === name);
      // Presets saved before image sources existed compare on their params alone.
      const key = (preset: RefinePreset | undefined, image: boolean): string => JSON.stringify(preset && [preset.params, image ? [preset.imageSource, preset.processing ?? null] : null]);
      if (key(before, Boolean(before?.imageSource)) !== key(after, Boolean(before?.imageSource))) {
        next = updated;
        if (!datasetOwned && !input.deleteProfilePreset) input.notify(`Saved "${name}" to this dataset's presets; the profile folder file is unchanged.`);
      }
    }
    const reclass = presetEdits.reclass;
    if (reclass && (reclass.runWith || reclass.sync)) {
      const { name } = reclass;
      const datasetOwned = next.reclassPresets.some((preset) => preset.name === name);
      const updated = saveReclassPreset(next, name);
      const key = (preset: ReclassPreset | undefined): string => JSON.stringify(preset && [preset.reclass, preset.imageSource, preset.processing]);
      if (key(mergeRefinePresets(next.reclassPresets, input.profileReclassPresets()).find((preset) => preset.name === name)) !== key(updated.reclassPresets.find((preset) => preset.name === name))) {
        next = updated;
        if (!datasetOwned && !input.deleteProfileReclassPreset) input.notify(`Saved "${name}" to this dataset's presets; the profile folder file is unchanged.`);
      }
    }
    // A Run-with preset was edited in place of the saved settings of its mode: those stay as they were.
    const saved = input.getSettings();
    if (edge?.runWith) next = { ...next, imageSource: saved.imageSource, processing: saved.processing, default: saved.default, classes: saved.classes };
    if (reclass?.runWith) next = { ...next, reclass: saved.reclass, reclassImageSource: saved.reclassImageSource, reclassProcessing: saved.reclassProcessing };
    input.saveSettings(next);
  };
  editor.onTargetsChange(() => {
    if (source.value === "classes") loadCases();
  });
  // Editing one side shows that side's profile.
  editor.onScopeChange((scope) => {
    if (scope !== "all") { activeSide = scope; schedule(); }
  });

  // ---------------------------------------------------------------- cases
  // Crops come from the refine worker, so the lab shows exactly the gray pixels refinement reads.
  const toCanvas = (crop: GrayImage): HTMLCanvasElement => {
    const pixels = doc.createElement("canvas");
    pixels.width = crop.width;
    pixels.height = crop.height;
    const imageData = pixels.getContext("2d")!.createImageData(crop.width, crop.height);
    for (let i = 0, o = 0; i < crop.gray.length; i += 1, o += 4) {
      const v = crop.gray[i];
      imageData.data[o] = v; imageData.data[o + 1] = v; imageData.data[o + 2] = v; imageData.data[o + 3] = 255;
    }
    pixels.getContext("2d")!.putImageData(imageData, 0, 0);
    return pixels;
  };
  const prepare = async (image: HTMLImageElement, box: RefineBoxInput, everyBox: readonly RefineBoxInput[], margin = CROP_MARGIN): Promise<LabCase> => {
    const source = imageKey(draft);
    const rect = { x0: box.x0 - margin, y0: box.y0 - margin, x1: box.x1 + margin, y1: box.y1 + margin };
    const crop = await input.cropImage(image, rect, draft.imageSource, draft.processing);
    // Reclass reads its own image; it is cropped only while Reclass mode shows it.
    const reclassSource = reclassMode() ? reclassKey(draft) : source;
    const reclassCrop = reclassSource === source ? crop : await input.cropImage(image, rect, draft.reclassImageSource, draft.reclassProcessing);
    const { x0, y0, width, height } = crop;
    const pixels = toCanvas(crop);
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
      imageBounds: shift({ x0: 0, y0: 0, x1: image.naturalWidth, y1: image.naturalHeight }),
      neighbours: everyBox.filter((n) => n.id !== box.id && n.x1 > x0 && n.x0 < x1 && n.y1 > y0 && n.y0 < y1).map(shift),
      img: { gray: crop.gray, width, height },
      pixels,
      reclassSource,
      reclassImg: { gray: reclassCrop.gray, width: reclassCrop.width, height: reclassCrop.height },
      reclassPixels: reclassCrop === crop ? pixels : toCanvas(reclassCrop)
    };
  };

  let caseToken = 0;
  let recropping = false;
  const fail = (error: unknown): void => { status.textContent = `Cannot load cases: ${error instanceof Error ? error.message : String(error)}`; };

  function loadCases(): void {
    const image = input.getImage();
    const boxes = image ? input.collectCases(source.value as RefineLabCaseSource, editor.caseClasses()).slice(0, MAX_CASES) : [];
    const everyBox = input.allBoxes();
    const token = ++caseToken;
    byId("refineLabSummary").textContent = boxes.length
      ? `${boxes.length} case${boxes.length === 1 ? "" : "s"} · edits stay in this window until you save`
      : "No boxes for this source. Select boxes on the canvas, or switch the case source.";
    if (!image || !boxes.length) { cases = []; schedule(); return; }
    status.textContent = "Loading cases…";
    Promise.all(boxes.map((box) => prepare(image, box, everyBox, neededMargin(box.classId)))).then((loaded) => {
      if (token !== caseToken) return;
      cases = loaded;
      active = Math.min(active, Math.max(0, cases.length - 1));
      schedule();
    }).catch(fail);
  }

  /**
   * Crop margin a case needs: the outward search plus the background ring beyond it (perpendicular),
   * and the scan-span extensions (along the side). Pixels past the crop would read as clamped copies.
   */
  const neededMargin = (classId: string): number => {
    const params = resolveRefineParams(draft, classId);
    const perSide = REFINE_SIDES.map((side) => sideParams(params, side));
    const outward = Math.max(...perSide.map((p) => p.rangeOut)) + params.contextRing + 1;
    const extension = Math.max(...perSide.map((p) => (p.scanSpan === "box" ? 0 : Math.max(p.extendStart, p.extendEnd))));
    return Math.max(CROP_MARGIN, outward + extension + 16);
  };
  /** Re-crops cases whose image source changed or whose extensions outgrew the crop; renders again when done. */
  const recropStale = (): void => {
    const image = input.getImage();
    const stale = (c: LabCase): boolean => c.source !== imageKey(draft) || (reclassMode() && c.reclassSource !== reclassKey(draft)) || neededMargin(c.classId) > c.margin;
    if (recropping || !image || !cases.some(stale)) return;
    recropping = true;
    const token = caseToken;
    const everyBox = input.allBoxes();
    Promise.all(cases.map((c) => (stale(c) ? prepare(image, c.box, everyBox, Math.max(c.margin, Math.ceil(neededMargin(c.classId) / 64) * 64)) : c)))
      .then((next) => { if (token === caseToken) cases = next; })
      .catch(fail)
      .finally(() => { recropping = false; schedule(); });
  };

  /** Edge mode: the refinement and its per-side diagnostics. Reclass mode: the judgment, refining only for shrink checks. */
  const compute = (c: LabCase): LabResult => {
    const params = resolveRefineParams(draft, c.classId);
    const sides: LabResult["sides"] = {};
    if (!reclassMode()) {
      for (const side of REFINE_SIDES) sides[side] = describeRefineSide(c.img, c.local, side, params, c.neighbours);
      return { params, result: params.enabled ? refineBox(c.img, c.local, params, c.neighbours) : null, sides, reclass: null };
    }
    const rule = reclassRuleOf(draft.reclass);
    const shrinks = rule.shrink.enabled && ruleChecks(rule, c.classId);
    const result = params.enabled && shrinks ? refineBox(c.img, c.local, params, c.neighbours) : null;
    return { params, result, sides, reclass: judgeCase(c, result) };
  };
  /**
   * Same judgment as the canvas: centre pixels of the reclass crop, refined area against the box as loaded. Boxes
   * already of the rule's class are judged too, so the settings show on them; Apply leaves them as they are.
   */
  const judgeCase = (c: LabCase, result: LabResult["result"]): LabResult["reclass"] => {
    const rule = reclassRuleOf(draft.reclass);
    if (!ruleChecks(rule, c.classId)) return null;
    const area = (r: RefineRect): number => Math.max(0, r.x1 - r.x0) * Math.max(0, r.y1 - r.y0);
    const base = area(input.loadedBox(c.id) ?? c.box);
    const areaChange = result && base > 0 ? area(result.box) / base - 1 : null;
    const stats = { ...measureReclass(c.reclassImg, c.local, rule), areaChange };
    return { stats, rule, match: judgeReclass(rule, stats), same: c.classId === rule.toClass };
  };
  const reclassText = (r: NonNullable<LabResult["reclass"]>): string => {
    const { stats, rule } = r;
    const parts = [`mean ${Math.round(stats.mean)}`, `bright ${Math.round(stats.brightRatio * 100)}%`];
    if (rule.shrink.enabled) parts.push(stats.areaChange === null ? "area: refine off" : `area ${stats.areaChange >= 0 ? "+" : "−"}${Math.abs(stats.areaChange * 100).toFixed(0)}%`);
    return parts.join(" · ");
  };
  /** Centre crop (dashed), its bright pixels when that check is on (detail view), and a pin on a match. */
  const drawReclass = (context: CanvasRenderingContext2D, c: LabCase, r: LabResult, X: (x: number) => number, Y: (y: number) => number, detail: boolean): void => {
    if (!r.reclass) return;
    const { rule } = r.reclass;
    const crop = centreCrop(c.local, rule, c.reclassImg);
    context.save();
    if (detail && rule.bright.enabled) {
      context.fillStyle = "rgba(230, 73, 128, 0.35)";
      const cell = Math.max(1, X(1) - X(0));
      for (let y = crop.y0; y < crop.y1; y += 1) {
        for (let x = crop.x0; x < crop.x1; x += 1) if (c.reclassImg.gray[y * c.reclassImg.width + x] >= rule.bright.level) context.fillRect(X(x), Y(y), cell, cell);
      }
    }
    context.setLineDash([4, 3]);
    context.strokeStyle = RECLASS_COLOR;
    context.lineWidth = 1.5;
    context.strokeRect(X(crop.x0), Y(crop.y0), X(crop.x1) - X(crop.x0), Y(crop.y1) - Y(crop.y0));
    context.restore();
    if (r.reclass.match) {
      drawMarks(context, layoutMarks({
        id: c.id,
        screen: { x0: X(c.local.x0), y0: Y(c.local.y0), x1: X(c.local.x1), y1: Y(c.local.y1) },
        reclass: { toClass: rule.toClass, label: "" },
        focused: false
      }, () => Number.POSITIVE_INFINITY));
    }
  };

  // ---------------------------------------------------------------- surroundings
  /**
   * Where Surroundings reads (Edge mode): the box core (inner 50%) and the background ring that starts past the
   * widest outward search, as measureContext in edge-refine.ts samples them. Null in Reclass mode or with the ring off.
   */
  const surroundings = (c: LabCase, r: LabResult): { core: RefineRect; inner: RefineRect; outer: RefineRect; from: number; to: number } | null => {
    if (reclassMode() || r.params.contextRing <= 0) return null;
    const { x0, y0, x1, y1 } = c.local;
    const [w, h] = [x1 - x0, y1 - y0];
    const from = Math.max(...REFINE_SIDES.map((side) => sideParams(r.params, side).rangeOut)) + 1;
    const to = from + r.params.contextRing;
    const around = (d: number): RefineRect => ({ x0: Math.round(x0) - d, y0: Math.round(y0) - d, x1: Math.round(x1) + d, y1: Math.round(y1) + d });
    return { core: { x0: x0 + w * 0.25, y0: y0 + h * 0.25, x1: x1 - w * 0.25, y1: y1 - h * 0.25 }, inner: around(from), outer: around(to), from, to };
  };
  const SURROUND_COLOR = "rgba(240, 173, 78, 0.95)";
  /** Zoom view: the background ring (amber band), the box core (dotted) and the neighbour boxes the search avoids. */
  const drawSurroundings = (context: CanvasRenderingContext2D, c: LabCase, r: LabResult, X: (x: number) => number, Y: (y: number) => number): void => {
    if (reclassMode()) return;
    const rect = (b: RefineRect): [number, number, number, number] => [X(b.x0), Y(b.y0), X(b.x1) - X(b.x0), Y(b.y1) - Y(b.y0)];
    const tag = (text: string, x: number, y: number, color: string): void => {
      context.font = "600 11px system-ui, sans-serif";
      context.fillStyle = "rgba(0, 0, 0, 0.6)";
      context.fillRect(x, y - 12, context.measureText(text).width + 6, 15);
      context.fillStyle = color;
      context.fillText(text, x + 3, y);
    };
    context.save();
    for (const n of c.neighbours) {
      context.setLineDash(r.params.avoidNeighbors ? [6, 3] : [2, 4]);
      context.strokeStyle = r.params.avoidNeighbors ? "rgba(200, 200, 200, 0.9)" : "rgba(200, 200, 200, 0.45)";
      context.lineWidth = 1.5;
      context.strokeRect(...rect(n));
      tag(r.params.avoidNeighbors ? "neighbour" : "neighbour (ignored)", X(n.x0) + 2, Y(n.y0) + 14, "#e6e6e6");
    }
    const ring = surroundings(c, r);
    if (ring) {
      const d = r.sides.T ?? r.sides.L;
      context.beginPath();
      context.rect(...rect(ring.outer));
      context.rect(...rect(ring.inner));
      context.fillStyle = "rgba(240, 173, 78, 0.18)";
      context.fill("evenodd");
      context.setLineDash([5, 3]);
      context.strokeStyle = SURROUND_COLOR;
      context.lineWidth = 1;
      context.strokeRect(...rect(ring.outer));
      context.strokeRect(...rect(ring.inner));
      context.setLineDash([2, 2]);
      context.lineWidth = 1.5;
      context.strokeRect(...rect(ring.core));
      tag(`background ring${d?.outside != null ? ` ${Math.round(d.outside)}` : ""}`, X(ring.outer.x0) + 2, Y(ring.outer.y0) + 14, SURROUND_COLOR);
      tag(`core${d?.inside != null ? ` ${Math.round(d.inside)}` : ""}`, X(ring.core.x0) + 2, Y(ring.core.y0) + 14, SURROUND_COLOR);
    }
    context.restore();
  };
  /** Readout lines saying what each Surroundings setting does on this case. */
  const surroundingsText = (c: LabCase, r: LabResult, d: RefineSideDiagnostics): string[] => {
    const ring = surroundings(c, r);
    const n = c.neighbours.length;
    return [
      ring && d.inside !== null && d.outside !== null
        ? `Surroundings: box core (dotted) ${Math.round(d.inside)} → background ring (amber, ${ring.from}–${ring.to} px out) ${Math.round(d.outside)}: ${POLARITY_TEXT[d.detectedPolarity]}`
        : "Surroundings: background ring off, polarity is not measured",
      n ? `${n} neighbour box${n === 1 ? "" : "es"} nearby (grey dashed): ${r.params.avoidNeighbors ? "the outward search stops halfway to them" : "ignored, the search may reach into them"}` : "No neighbour boxes near this one",
      r.params.peerTolerance > 0
        ? `Row/column tolerance ${r.params.peerTolerance} px: checked across all boxes when refining on the canvas (not per case here)`
        : "Row/column alignment flags off"
    ];
  };

  // ---------------------------------------------------------------- drawing
  /** Diagonal hatch for the area outside the image. */
  let hatchPattern: CanvasPattern | null = null;
  const hatch = (context: CanvasRenderingContext2D): CanvasPattern | string => {
    if (!hatchPattern) {
      const tile = doc.createElement("canvas");
      tile.width = tile.height = 8;
      const t = tile.getContext("2d")!;
      t.fillStyle = "#1b1f24";
      t.fillRect(0, 0, 8, 8);
      t.strokeStyle = "rgba(255, 255, 255, 0.16)";
      t.beginPath();
      t.moveTo(0, 8);
      t.lineTo(8, 0);
      t.stroke();
      hatchPattern = context.createPattern(tile, "repeat");
    }
    return hatchPattern ?? "#1b1f24";
  };
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
  /** Zoom view scale (CSS px per crop pixel) and centre in crop coordinates; null fits the case. */
  type View = { s: number; cx: number; cy: number };
  let view: View | null = null;
  let fit: View = { s: 1, cx: 0, cy: 0 };

  /** Draws the crop around the case and returns the crop->screen mapping. */
  const drawCase = (context: CanvasRenderingContext2D, c: LabCase, r: LabResult, width: number, height: number, detail: boolean) => {
    // Search bands in crop coordinates: the perpendicular search range over every scanned run along the side.
    // `requested` reaches as far outward as the setting asks; the band itself stops where the search does
    // (halfway to a neighbour). Past the image border the profile only repeats the border pixels.
    const bands: { side: RefineSide; rect: RefineRect; requested: RefineRect; part: number }[] = [];
    for (const side of REFINE_SIDES) {
      const d = r.sides[side];
      if (!d || r.params.sides[side] === "off") continue;
      const a = d.start;
      const b = d.start + d.raw.length;
      const extra = Math.max(0, sideParams(r.params, side).rangeOut - d.rangeOut);
      const [ra, rb] = d.out > 0 ? [a, b + extra] : [a - extra, b];
      const vertical = side === "L" || side === "R";
      for (const [part, [from, to]] of d.runs.entries()) {
        bands.push({
          part,
          side,
          rect: vertical ? { x0: a, y0: from, x1: b, y1: to + 1 } : { x0: from, y0: a, x1: to + 1, y1: b },
          requested: vertical ? { x0: ra, y0: from, x1: rb, y1: to + 1 } : { x0: from, y0: ra, x1: to + 1, y1: rb }
        });
      }
    }
    // Thumbnails show the box plus the widest outward search actually used (side rules, neighbour limits).
    const reach = Math.max(0, ...REFINE_SIDES.map((side) => r.sides[side]?.rangeOut ?? 0)) + 10;
    let [vx0, vy0, vx1, vy1] = [c.local.x0 - reach, c.local.y0 - reach, c.local.x1 + reach, c.local.y1 + reach];
    if (detail) {
      for (const { requested } of bands) {
        vx0 = Math.min(vx0, requested.x0 - 6); vy0 = Math.min(vy0, requested.y0 - 6);
        vx1 = Math.max(vx1, requested.x1 + 6); vy1 = Math.max(vy1, requested.y1 + 6);
      }
      // The fitted view also holds the background ring Surroundings sample.
      const ring = surroundings(c, r)?.outer;
      if (ring) { vx0 = Math.min(vx0, ring.x0 - 4); vy0 = Math.min(vy0, ring.y0 - 4); vx1 = Math.max(vx1, ring.x1 + 4); vy1 = Math.max(vy1, ring.y1 + 4); }
    }
    // The view is not clipped to the image: ranges reaching past the border stay visible over a hatched area.
    const [vw, vh] = [vx1 - vx0, vy1 - vy0];
    const fitScale = Math.min(width / vw, height / vh);
    // The zoom view follows the user's zoom/pan, kept in image pixels so edits and re-crops hold the same spot.
    const [dx, dy] = [c.box.x0 - c.local.x0, c.box.y0 - c.local.y0];
    if (detail) fit = { s: fitScale, cx: vx0 + vw / 2 + dx, cy: vy0 + vh / 2 + dy };
    const { s, cx, cy } = detail && view ? { ...view, cx: view.cx - dx, cy: view.cy - dy } : { s: fitScale, cx: vx0 + vw / 2, cy: vy0 + vh / 2 };
    const X = (x: number): number => width / 2 + (x - cx) * s;
    const Y = (y: number): number => height / 2 + (y - cy) * s;
    if (detail && view) {
      context.fillStyle = hatch(context);
      context.fillRect(0, 0, width, height);
    } else if (vx0 < c.imageBounds.x0 || vy0 < c.imageBounds.y0 || vx1 > c.imageBounds.x1 || vy1 > c.imageBounds.y1) {
      context.fillStyle = hatch(context);
      context.fillRect(X(vx0), Y(vy0), vw * s, vh * s);
    }
    context.imageSmoothingEnabled = false;
    context.drawImage(reclassMode() ? c.reclassPixels : c.pixels, X(0), Y(0), c.img.width * s, c.img.height * s);

    if (detail) {
      // Search ranges: user-set fill opacity plus an outline, so the range stays findable even at low opacity.
      const alpha = Number(bandOpacity.value) / 100;
      zoomBands = [];
      for (const { side, rect, requested, part } of bands) {
        const parts = r.sides[side]?.parts;
        const unused = parts !== undefined && part !== r.sides[side]?.chosenPart;
        const band: [number, number, number, number] = [X(rect.x0), Y(rect.y0), (rect.x1 - rect.x0) * s, (rect.y1 - rect.y0) * s];
        zoomBands.push({ side, x: band[0], y: band[1], w: band[2], h: band[3] });
        const emphasis = side === activeSide ? 1.6 : 1;
        if (requested.x0 !== rect.x0 || requested.x1 !== rect.x1 || requested.y0 !== rect.y0 || requested.y1 !== rect.y1) {
          // The part of the setting the search does not use: faint fill, dashed outline.
          const asked: [number, number, number, number] = [X(requested.x0), Y(requested.y0), (requested.x1 - requested.x0) * s, (requested.y1 - requested.y0) * s];
          context.fillStyle = `rgba(23, 105, 224, ${Math.min(1, alpha * emphasis) * 0.3})`;
          context.fillRect(...asked);
          context.setLineDash([5, 4]);
          context.strokeStyle = "rgba(120, 180, 255, 0.7)";
          context.lineWidth = 1;
          context.strokeRect(...asked);
          context.setLineDash([]);
        }
        context.fillStyle = `rgba(23, 105, 224, ${Math.min(1, alpha * emphasis) * (unused ? 0.35 : 1)})`;
        context.fillRect(...band);
        context.strokeStyle = parts ? partColor(r.sides[side]!, part) : side === activeSide ? "rgba(120, 180, 255, 0.95)" : "rgba(120, 180, 255, 0.6)";
        context.lineWidth = parts && !unused ? 2 : side === activeSide ? 1.5 : 1;
        context.strokeRect(...band);
      }
    }
    if (detail) drawSurroundings(context, c, r, X, Y);
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
      const color = r.result.areaFlagged ? "#dc3545" : getColorForClass(c.classId);
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
    // Each segment's own edge on the active side, over the result (gold: used, grey dashes: dropped).
    const traced = detail ? r.sides[activeSide] : undefined;
    if (traced && r.params.sides[activeSide] !== "off") {
      const vertical = activeSide === "L" || activeSide === "R";
      for (const segment of traced.segments) {
        if (segment.value === null) continue;
        context.setLineDash(segment.kept ? [] : [3, 3]);
        context.strokeStyle = segment.kept ? "rgba(255, 214, 102, 0.95)" : "rgba(200, 200, 200, 0.7)";
        context.lineWidth = segment.kept ? 2 : 1;
        context.beginPath();
        if (vertical) { context.moveTo(X(segment.value), Y(segment.span[0])); context.lineTo(X(segment.value), Y(segment.span[1])); }
        else { context.moveTo(X(segment.span[0]), Y(segment.value)); context.lineTo(X(segment.span[1]), Y(segment.value)); }
        context.stroke();
      }
      context.setLineDash([]);
    }
    return { X, Y, s };
  };

  /**
   * Two stacked plots sharing an inside -> outside axis: the mean brightness across the side (raw and
   * smoothed) and its change over the side's gradient step k, Δ(x) = P(x + k/2) - P(x - k/2). A positive change
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
    const k = Math.max(1, Math.min(n - 1, sideParams(r.params, activeSide).gradStep));
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

    type Overlay = (X: (u: number) => number, Y: (v: number) => number, lo: number, hi: number, top: number, plotH: number) => void;
    const panel = (top: number, plotH: number, title: string, series: { values: Float32Array; offset: number; color: string; lineWidth: number }[], levels: number[], zero: boolean, marks: { axis: number; color: string }[] = [], overlay?: Overlay): void => {
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
      // Where each unused part would have put the edge.
      for (const { axis, color } of marks) vertical(axis, color, true, 1.2);
      overlay?.(X, Y, lo, hi, top, plotH);
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
    // "Strongest part": each scanned part is its own curve (chosen one bold) instead of one average.
    const parts = d.parts;
    const names = parts ? partNames(d) : [];
    const partSeries = (transform: (values: Float32Array) => Float32Array, offset: number) => (parts ?? []).map((part, index) => ({
      values: transform(oriented(part.smoothed)),
      offset,
      color: partColor(d, index),
      lineWidth: index === d.chosenPart ? 2.5 : 1.2
    }));
    const partEdges = (parts ?? []).flatMap((part, index) => (part.value === null || index === d.chosenPart ? [] : [{ axis: imageToAxis(part.value), color: partColor(d, index) }]));
    // Each segment's own edge as a tick along the top (filled: used in the combine step, hollow: dropped),
    // and the combined first-pass edge as a triangle; the solid line is the final edge after iterations.
    const segmentTicks: Overlay = (_X, _Y, _lo, _hi, top) => {
      for (const segment of off ? [] : d.segments) {
        if (segment.value === null) continue;
        const x = X(imageToAxis(segment.value));
        context.beginPath();
        context.arc(x, top + 5, 3, 0, Math.PI * 2);
        if (segment.kept) { context.fillStyle = "#e0a800"; context.fill(); }
        else { context.strokeStyle = muted; context.lineWidth = 1; context.stroke(); }
      }
      // Paired side: every candidate edge as a short tick (the chosen one solid).
      for (const value of off ? [] : d.pair?.candidates ?? []) {
        const x = X(imageToAxis(value));
        const chosen = value === d.pair!.chosen;
        context.strokeStyle = chosen ? resultColor : muted;
        context.lineWidth = chosen ? 2 : 1;
        context.beginPath();
        context.moveTo(x, top + 20); context.lineTo(x, top + 30);
        context.stroke();
      }
      if (!off && d.firstPass !== null) {
        const x = X(imageToAxis(d.firstPass));
        context.fillStyle = resultColor;
        context.beginPath();
        context.moveTo(x - 5, top + 12); context.lineTo(x + 5, top + 12); context.lineTo(x, top + 18);
        context.fill();
      }
    };
    panel(gap, plotH, `${SIDE_NAMES[activeSide]} edge · mean brightness${parts ? " per scanned part" : ""}`, parts ? partSeries((v) => v, 0.5) : [
      { values: raw, offset: 0.5, color: muted, lineWidth: 1 },
      { values: smoothed, offset: 0.5, color: primary, lineWidth: 2 }
    ], levels, false, partEdges, segmentTicks);
    // Max gradient picks the peak of the score: the change in the expected direction times the distance
    // weight. It is drawn on the side of zero where the expected change lies (bright inside: darker outward).
    const expected = d.polarity === 0 ? 1 : -d.polarity;
    const selection: Overlay = (_X, Y, lo, hi) => {
      if (off) return;
      const axisOf = (i: number): number => (flip ? n - (i + d.scoreShift + 0.5) : i + d.scoreShift + 0.5);
      if (d.score && !parts) {
        let peak = -1;
        d.score.forEach((value, i) => { if (value > 0 && (peak < 0 || value > d.score![peak]!)) peak = i; });
        context.fillStyle = "rgba(224, 168, 0, 0.28)";
        context.beginPath();
        context.moveTo(X(axisOf(0)), Y(0));
        d.score.forEach((value, i) => context.lineTo(X(axisOf(i)), Y(expected * value)));
        context.lineTo(X(axisOf(d.score.length - 1)), Y(0));
        context.closePath();
        context.fill();
        if (peak >= 0) {
          context.fillStyle = "#e0a800";
          context.beginPath();
          context.arc(X(axisOf(peak)), Y(expected * d.score[peak]!), 3.5, 0, Math.PI * 2);
          context.fill();
        }
      }
      if (sideParams(r.params, activeSide).nearWeight && d.criterion !== "thr") {
        // Weight 0..1 scaled to the half of the panel where the expected change lies.
        const reach = expected > 0 ? hi : lo;
        context.setLineDash([2, 3]);
        context.strokeStyle = muted;
        context.lineWidth = 1;
        context.beginPath();
        d.weight.forEach((value, i) => { const x = X(flip ? n - (i + 0.5) : i + 0.5); const y = Y(value * reach); if (i) context.lineTo(x, y); else context.moveTo(x, y); });
        context.stroke();
        context.setLineDash([]);
      }
    };
    panel(gap * 2 + plotH, plotH, `Change over ${k} px · gradient step (outward, + = brighter)`, parts ? partSeries(delta, 0.5 + k / 2) : [
      { values: rawDelta, offset: 0.5 + k / 2, color: muted, lineWidth: 1 },
      { values: smoothDelta, offset: 0.5 + k / 2, color: primary, lineWidth: 2 }
    ], [], true, partEdges, selection);
    if (parts) {
      // Legend, right-aligned above the first panel: part name, strength, and which part sets the edge.
      context.font = "600 11px system-ui, sans-serif";
      let right = pad.l + plotW;
      for (let index = parts.length - 1; index >= 0; index -= 1) {
        const label = `${names[index]} ${parts[index]!.value === null ? "–" : parts[index]!.strength.toFixed(1)}${index === d.chosenPart ? " ✓" : ""}`;
        const labelWidth = context.measureText(label).width;
        context.fillStyle = text;
        context.fillText(label, right - labelWidth, gap - 5);
        context.fillStyle = partColor(d, index);
        context.fillRect(right - labelWidth - 12, gap - 13, 8, 8);
        right -= labelWidth + 22;
      }
    }
    context.fillStyle = muted;
    context.font = "11px system-ui, sans-serif";
    context.fillText("◀ inside", pad.l, height - 4);
    const outsideLabel = "outside ▶";
    context.fillText(outsideLabel, pad.l + plotW - context.measureText(outsideLabel).width, height - 4);
    const originalCoordinate = c.local[SIDE_KEY[activeSide]];

    const moved = r.result && !off ? r.result.box[SIDE_KEY[activeSide]] - originalCoordinate : 0;
    const outward = (d.out > 0 ? moved : -moved);
    const usedPolarity = r.params.polarity === "auto"
      ? `Auto → ${POLARITY_TEXT[d.polarity]}`
      : `${POLARITY_TEXT[d.polarity]} (fixed)${d.detectedPolarity !== 0 && d.detectedPolarity !== d.polarity ? " · differs from the image" : ""}`;
    readout.replaceChildren(...[
      off ? `${SIDE_NAMES[activeSide]}: off` : `${SIDE_NAMES[activeSide]}: ${REFINE_CRITERION_LABELS[d.criterion]} · confidence ${(r.result?.sideConf[activeSide] ?? 0).toFixed(2)} · ${outward >= 0 ? "out" : "in"} ${Math.abs(outward).toFixed(1)} px`,
      off ? "" : searchText(d, sideParams(r.params, activeSide), roomOutside(c, activeSide)),
      off ? "" : pickText(d, sideParams(r.params, activeSide), r.params.iterations,
        d.firstPass === null ? null : imageToOutward(d, c.local[SIDE_KEY[activeSide]], d.firstPass),
        r.result ? imageToOutward(d, c.local[SIDE_KEY[activeSide]], r.result.box[SIDE_KEY[activeSide]]) : null),
      off || !d.pair ? "" : pairText(d.pair),
      off || !d.parts ? "" : `Parts (strength): ${partNames(d).map((name, index) => `${name} ${d.parts![index]!.value === null ? "no edge" : d.parts![index]!.strength.toFixed(1)}${index === d.chosenPart ? " — used" : ""}`).join(" · ")}`,
      ...surroundingsText(c, r, d),
      `Polarity used: ${usedPolarity}`,
      r.result ? `Box area ${r.result.areaChange >= 0 ? "+" : "−"}${Math.abs(r.result.areaChange * 100).toFixed(0)}%${r.result.areaFlagged ? " · beyond the area limit, flagged for review" : ""}` : ""
    ].filter(Boolean).map((line, index) => {
      const row = doc.createElement("div");
      row.textContent = line;
      if (line.startsWith("Polarity used") && line.includes("differs")) row.className = "text-warning";
      if (line.includes("area limit")) row.className = "text-danger";
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
      button.classList.toggle("is-flagged", reclassMode() ? Boolean(r.reclass?.match) : Boolean(r.result?.flagged));
      button.classList.toggle("is-off", reclassMode() ? !r.reclass : !r.result);
      const thumb = doc.createElement("canvas");
      thumb.width = 88;
      thumb.height = 88;
      const context = thumb.getContext("2d")!;
      context.fillStyle = "#111";
      context.fillRect(0, 0, 88, 88);
      const { X, Y } = drawCase(context, c, r, 88, 88, false);
      drawReclass(context, c, r, X, Y, false);
      if (r.reclass) button.dataset.reclass = r.reclass.match ? "match" : "miss";
      const name = `${c.classId}${input.className(c.classId) ? ` ${input.className(c.classId)}` : ""}`;
      const label = doc.createElement("span");
      label.textContent = reclassMode()
        ? `${name} · ${r.reclass ? reclassText(r.reclass) : "no rule"}`
        : `${name} · ${r.result ? r.result.conf.toFixed(2) : "off"}`;
      button.title = label.textContent;
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
    // Reclass mode has no edge profile: the side tabs, search-range controls and the plot step aside.
    const reclass = reclassMode();
    for (const element of [sideTabs, profile, bandOpacity.closest("label"), modalElement.querySelector(".refine-lab-legend")]) if (element instanceof HTMLElement) element.hidden = reclass;
    sideTabs.querySelectorAll<HTMLButtonElement>("[data-side]").forEach((tab) => tab.setAttribute("aria-pressed", String(tab.dataset.side === activeSide)));
    const c = cases[active];
    if (!c) { fitCanvas(zoom); readout.textContent = ""; fitCanvas(profile); return; }
    drawZoom();
    if (reclass) drawReclassReadout(c, results[active]);
    else drawProfile(c, results[active]);
    const checked = results.filter((r) => r.reclass);
    status.textContent = reclass
      ? `${cases.length} cases · reclass ${checked.filter((r) => r.reclass!.match).length} of ${checked.length} match · ${elapsed.toFixed(1)} ms`
      : `${cases.length} cases · ${results.filter((r) => r.result?.flagged).length} to review · ${elapsed.toFixed(1)} ms`;
  }

  /** Reclass mode readout: the rule that judged the case, its numbers and the outcome. */
  const drawReclassReadout = (c: LabCase, r: LabResult): void => {
    const name = (classId: string): string | undefined => input.className(classId);
    const pct = (share: number): string => `${Math.round(share * 100)}%`;
    const rule = reclassRuleOf(draft.reclass);
    const className = `class ${c.classId}${name(c.classId) ? ` ${name(c.classId)}` : ""}`;
    const lines = !r.reclass
      ? [rule.mean.enabled || rule.bright.enabled || rule.shrink.enabled ? `The rule does not check ${className} (choose it in Classes).` : "The rule has no check on."]
      : [
        `${r.reclass.match ? "Match" : "No match"}${r.reclass.same ? ` (already ${className}: Apply leaves it as it is)` : ""}: ${describeReclassRule(r.reclass.rule, name)}`,
        `Centre inset top ${pct(r.reclass.rule.insetTop)} · bottom ${pct(r.reclass.rule.insetBottom)} · left ${pct(r.reclass.rule.insetLeft)} · right ${pct(r.reclass.rule.insetRight)}: ${reclassText(r.reclass)}`,
        ...(r.reclass.rule.shrink.enabled ? ["Area is the refined box (Edge settings) against the box as loaded from the label file."] : [])
      ];
    readout.replaceChildren(...lines.map((line, index) => {
      const row = doc.createElement("div");
      row.textContent = line;
      if (index === 0 && r.reclass?.match) row.className = "text-danger";
      return row;
    }));
  };

  /** Redraws only the zoom view from the last results (zoom and pan need no new refinement). */
  function drawZoom(): void {
    viewFrame = 0;
    const context = fitCanvas(zoom);
    const c = cases[active];
    if (c && results[active]) {
      const { X, Y } = drawCase(context, c, results[active], zoom.clientWidth, zoom.clientHeight, true);
      drawReclass(context, c, results[active], X, Y, true);
    }
    fitButton.disabled = !view;
    fitButton.textContent = view ? `${Math.round((view.s / fit.s) * 100)}% · Fit` : "Fit";
  }

  function schedule(): void {
    if (!frame) frame = input.windowRef.requestAnimationFrame(render);
  }
  let viewFrame = 0;
  const scheduleView = (): void => {
    if (!frame && !viewFrame) viewFrame = input.windowRef.requestAnimationFrame(drawZoom);
  };

  casesList.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest<HTMLElement>(".refine-lab-case");
    if (!button) return;
    active = Number(button.dataset.index);
    view = null;
    schedule();
  });

  // Zoom view: wheel zooms around the pointer, dragging pans, double-click or Fit returns to the whole case.
  const fitButton = byId<HTMLButtonElement>("refineLabFitBtn");
  fitButton.addEventListener("click", () => { view = null; scheduleView(); });
  zoom.addEventListener("wheel", (event) => {
    if (!cases[active]) return;
    event.preventDefault();
    const rect = zoom.getBoundingClientRect();
    const current = view ?? fit;
    const s = Math.min(fit.s * 64, Math.max(fit.s * 0.5, current.s * Math.exp(-event.deltaY * 0.0015)));
    // Keep the image pixel under the pointer in place.
    const px = event.clientX - rect.left - rect.width / 2;
    const py = event.clientY - rect.top - rect.height / 2;
    view = { s, cx: current.cx + px / current.s - px / s, cy: current.cy + py / current.s - py / s };
    scheduleView();
  }, { passive: false });
  let drag: { x: number; y: number; moved: boolean } | null = null;
  let dragged = false;
  zoom.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 && event.button !== 1) return;
    drag = { x: event.clientX, y: event.clientY, moved: false };
    dragged = false;
    zoom.setPointerCapture(event.pointerId);
    if (event.button === 1) event.preventDefault();
  });
  zoom.addEventListener("pointermove", (event) => {
    if (!drag) return;
    const [mx, my] = [event.clientX - drag.x, event.clientY - drag.y];
    if (!drag.moved && Math.hypot(mx, my) < 4) return;
    drag.moved = true;
    const current = view ?? fit;
    view = { ...current, cx: current.cx - mx / current.s, cy: current.cy - my / current.s };
    drag.x = event.clientX;
    drag.y = event.clientY;
    zoom.style.cursor = "grabbing";
    scheduleView();
  });
  const endDrag = (): void => { dragged = Boolean(drag?.moved); drag = null; };
  zoom.addEventListener("pointerup", endDrag);
  zoom.addEventListener("pointercancel", endDrag);
  zoom.addEventListener("dblclick", () => { view = null; scheduleView(); });
  sideTabs.addEventListener("click", (event) => {
    const side = (event.target as HTMLElement).closest<HTMLElement>("[data-side]")?.dataset.side as RefineSide | undefined;
    if (side) { activeSide = side; schedule(); }
  });
  // Clicking the zoom view picks the nearest side for the profile.
  // Clicking a search band opens that side's Edge rule; elsewhere it only switches the profile to the nearest side.
  zoom.addEventListener("click", (event) => {
    if (dragged) { dragged = false; return; }
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
    if (drag?.moved) return;
    const rect = zoom.getBoundingClientRect();
    const px = event.clientX - rect.left;
    const py = event.clientY - rect.top;
    zoom.style.cursor = zoomBands.some((b) => px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) ? "pointer" : "crosshair";
  });
  source.addEventListener("change", loadCases);
  bandOpacity.addEventListener("input", () => {
    try { input.windowRef.localStorage.setItem(BAND_OPACITY_KEY, bandOpacity.value); } catch { /* per-viewer convenience only */ }
    schedule();
  });
  modalElement.addEventListener("shown.bs.modal", schedule);
  new ResizeObserver(schedule).observe(zoom);
  // Save settings saves into a named preset: without a name the Lab stays open and asks for one.
  byId("refineLabSaveBtn").addEventListener("click", () => {
    if (!editor.presetName()) {
      editor.requirePresetName("Type a preset name: Save settings also saves the values into this preset. Choosing a preset (Apply) fills it in.");
      status.textContent = "Type a preset name to save settings.";
      return;
    }
    linkPresetName();
    commit();
    modal.hide();
  });
  byId("refineLabApplyBtn").addEventListener("click", () => {
    const reclass = reclassMode();
    linkPresetName();
    commit();
    modal.hide();
    const ids = cases.map((c) => c.id);
    if (reclass) input.reclassOnCanvas(ids);
    else input.refineOnCanvas(ids);
  });

  // The guide opens on the tutorial of the mode shown; it is loaded on first use.
  byId<HTMLButtonElement>("refineLabHelpBtn").addEventListener("click", () => {
    void import("./refine-help.js").then(({ openRefineHelp }) => openRefineHelp(doc, { mode: draft.mode }));
  });

  return {
    open(): void {
      if (!input.getImage()) { input.notify("Open an image in the Detection workflow first."); return; }
      const saved = input.getSettings();
      const presets = mergeRefinePresets(saved.presets, input.profilePresets());
      const run = saved.activePreset ? presets.find((preset) => preset.name === saved.activePreset) : undefined;
      const reclassPresets = mergeRefinePresets(saved.reclassPresets, input.profileReclassPresets());
      const reclassRun = saved.activeReclassPreset ? reclassPresets.find((preset) => preset.name === saved.activeReclassPreset) : undefined;
      // With a Run-with preset the Lab edits that preset: every class previews with it, as runs do.
      draft = run ? applyRefinePreset({ ...saved, classes: {} }, run.name, "default", presets) : saved;
      if (reclassRun) draft = applyReclassPreset(draft, reclassRun.name, reclassPresets);
      presetEdits = {
        edge: run ? { name: run.name, target: "default", runWith: true, sync: true } : null,
        reclass: reclassRun ? { name: reclassRun.name, target: "default", runWith: true, sync: true } : null
      };
      editor.setClassesLocked(Boolean(run));
      nameMode = null; // show the opened mode's preset name
      renderPresetEdit();
      void input.loadPreprocessingPresets().then((presets) => { preprocessingPresets = presets; editor.render(); }).catch(() => undefined);
      const selection = input.collectCases("selection", []);
      source.value = selection.length ? "selection" : "classes";
      active = 0;
      view = null;
      // Edits start on the Default; a class chip then specialises one class on top of it.
      editor.setTargets([]);
      loadCases();
      modal.show();
    }
  };
}
