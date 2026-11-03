import type { AppState } from "../app/state.js";
import { REFINE_SIDES, type RefineBoxInput, type RefineParams, type RefineRect, type RefineResult } from "../domain/refine/edge-refine.js";
import {
  createRefineSettings,
  mergeRefinePresets,
  parseReclassPresetFiles,
  parseRefinePresetFiles,
  parseRefineSettings,
  resolveRefineParams,
  serializeReclassPresets,
  serializeRefinePresets,
  serializeRefineSettings,
  REFINE_SETTINGS_FILE,
  refinePresetLabel,
  type ReclassPreset,
  type RefineImageSource,
  type RefinePreset,
  type RefineProcessing,
  type RefineSettingsDocument
} from "../domain/refine/settings.js";
import { extractVisibleRectSelection, getRectBounds } from "../features/canvas/arrange.js";
import { getColorForClass } from "../features/canvas/colors.js";
import { ensureAnnotationId, isRectObject, type FabricRectLike, type YoloMetadata } from "../features/canvas/fabric-types.js";
import { describeReclassRule, evaluateReclass, ruleApplies, type ReclassMatch, type ReclassRule } from "../domain/refine/reclass.js";
import { createRefineService, type RefineImageInput, type RefineService } from "../features/refine/refine-service.js";
import { getSubdirectoryHandle, isNotFoundError, readTextFileByName, writeTextFileByName } from "../platform/file-system-access.js";
import type { DirectoryHandleLike } from "../types/files.js";
import type { RuntimeCanvasController } from "./canvas-controller-adapter.js";
import type { RefineLab, RefineLabCaseSource } from "./refine-lab.js";
import { AREA_COLOR, areaText, DIM_OPACITY, drawMarks, layoutMarks, REVIEW_COLOR as WARN_COLOR, type MarkTarget } from "./refine-marks.js";
import { loadPreprocessingPresetLibrary } from "../features/segmentation/preprocessing-presets.js";
import { openProfilePresetFolder } from "../features/presets/profile-presets.js";
import type { SegmentationPreprocessingConfig } from "../features/segmentation/preprocessing.js";
import type { RuntimeUiManager } from "./ui-manager-adapter.js";

const CRITERION_SHORT: Record<RefineParams["crit"], string> = { grad: "Gradient", flank: "Band 50%", peak: "Band peak", thr: "50% level" };

export type RefineShortcut = "toggle" | "refineSelected" | "refineAll" | "nextReview" | "previousReview" | "approve";

/**
 * Global refine keys (detection workflow, any inspector tab). Physical key codes so they also work with the
 * Korean IME active. Kept clear of: A/D (images), Q, B, 0-9, Ctrl+*, Alt+Shift+L/R/T/D/C/S/M/H/V (arrange), Shift+1-3.
 */
export function resolveRefineShortcut(event: Pick<KeyboardEvent, "code" | "ctrlKey" | "metaKey" | "altKey" | "shiftKey">): RefineShortcut | null {
  if (event.ctrlKey || event.metaKey || event.altKey) return null;
  switch (event.code) {
    case "KeyR": return event.shiftKey ? null : "toggle";
    case "KeyE": return event.shiftKey ? "refineAll" : "refineSelected";
    case "KeyN": return event.shiftKey ? "previousReview" : "nextReview";
    case "KeyF": return event.shiftKey ? null : "approve";
    default: return null;
  }
}

export interface RefineController {
  bind(): void;
  runShortcut(action: RefineShortcut): void;
}

const PREVIEW_LIMIT = 50;
const SIDE_KEY = { L: "x0", R: "x1", T: "y0", B: "y1" } as const;

interface RefineRecord { result: RefineResult; reviewed: boolean }

export function createRefineController(input: {
  state: AppState;
  canvasController: RuntimeCanvasController;
  uiManager: RuntimeUiManager;
  documentRef: Document;
}): RefineController {
  const doc = input.documentRef;
  const windowRef = doc.defaultView!;
  const byId = <T extends HTMLElement>(id: string): T => {
    const element = doc.getElementById(id);
    if (!element) throw new Error(`Missing refine element #${id}`);
    return element as T;
  };
  const raw = input.canvasController.raw;
  const pane = byId<HTMLElement>("inspectorRefinePane");
  const overlay = byId<HTMLCanvasElement>("refineOverlayCanvas");
  const status = byId<HTMLElement>("refineStatus");
  const reviewCounter = byId<HTMLElement>("refineReviewCounter");

  let service: RefineService | null = null;
  let settings: RefineSettingsDocument = createRefineSettings();
  let settingsFolder: unknown = undefined;
  /**
   * Desktop app: presets are files in the profile folder (Easy Labeling / Refine Presets, Reclass Presets). A
   * preset saved or edited here moves out of refine-settings.json into its own file; presets an older version
   * saved in the dataset stay there as they are (listed first, as before) until edited or deleted.
   */
  const hasProfileFolder = typeof windowRef.getEasyLabelingProfileDirectory === "function";
  interface PresetLibrary<T extends { name: string }> {
    /** Presets in the profile folder. */
    presets: T[];
    /** The dataset's presets as read, to tell untouched ones from edits. */
    dataset: T[];
    refresh(): Promise<void>;
    save(presets: readonly T[]): Promise<void>;
    remove(name: string): Promise<void>;
  }
  const presetLibrary = <T extends { name: string }>(
    kind: "refine" | "reclass",
    parse: (files: readonly { name: string; contents: string }[]) => { presets: T[]; errors: string[] },
    serialize: (presets: readonly T[]) => string
  ): PresetLibrary<T> => {
    /** Profile file holding each preset name, with every preset in that file (exported files hold several). */
    let files = new Map<string, { fileName: string; presets: T[] }>();
    const library: PresetLibrary<T> = {
      presets: [],
      dataset: [],
      async refresh() {
        if (!windowRef.listEasyLabelingLibraryFiles) return;
        try {
          const next = new Map<string, { fileName: string; presets: T[] }>();
          const errors: string[] = [];
          let presets: T[] = [];
          for (const file of await windowRef.listEasyLabelingLibraryFiles(kind)) {
            const parsed = parse([file]);
            errors.push(...parsed.errors);
            const entry = { fileName: file.name, presets: parsed.presets };
            parsed.presets.forEach((preset) => next.set(preset.name, entry));
            presets = [...presets.filter((item) => !parsed.presets.some((preset) => preset.name === item.name)), ...parsed.presets];
          }
          library.presets = presets;
          files = next;
          if (errors.length) input.uiManager.notify(`Some saved ${kind} preset files were skipped:\n${errors.join("\n")}`, 8000);
        } catch (error: unknown) {
          input.uiManager.notify(`Unable to scan saved ${kind} presets: ${error instanceof Error ? error.message : String(error)}`, 6000);
        }
      },
      /** Writes presets into their profile files (the file holding the name, else `<name>.json`). */
      async save(presets) {
        const folder = await openProfilePresetFolder(windowRef, kind);
        if (!folder) return;
        for (const preset of presets) {
          const file = files.get(preset.name);
          const contents = serialize(file ? file.presets.map((item) => (item.name === preset.name ? preset : item)) : [preset]);
          await folder.save(preset.name, contents, file?.fileName);
        }
        await library.refresh();
        renderPane();
      },
      async remove(name) {
        const file = files.get(name);
        const folder = await openProfilePresetFolder(windowRef, kind);
        if (!file || !folder) return;
        const rest = file.presets.filter((preset) => preset.name !== name);
        if (rest.length) await folder.save(name, serialize(rest), file.fileName);
        else await folder.remove(file.fileName);
        await library.refresh();
        renderPane();
      }
    };
    return library;
  };
  const edgeLibrary = presetLibrary<RefinePreset>("refine", parseRefinePresetFiles, serializeRefinePresets);
  const reclassLibrary = presetLibrary<ReclassPreset>("reclass", parseReclassPresetFiles, serializeReclassPresets);
  const allPresets = (): RefinePreset[] => mergeRefinePresets(settings.presets, edgeLibrary.presets);
  const allReclassPresets = (): ReclassPreset[] => mergeRefinePresets(settings.reclassPresets, reclassLibrary.presets);
  const refreshProfilePresets = (): Promise<void> => Promise.all([edgeLibrary.refresh(), reclassLibrary.refresh()]).then(() => undefined);
  /** Desktop: new and edited presets leave the dataset list for their profile files (listed at once; the files follow). */
  const moveToProfile = <T extends { name: string }>(presets: T[], library: PresetLibrary<T>): T[] => {
    if (!hasProfileFolder) return presets;
    const moved = presets.filter((preset) => !library.dataset.some((item) => JSON.stringify(item) === JSON.stringify(preset)));
    const rest = presets.filter((preset) => !moved.includes(preset));
    library.dataset = rest;
    if (moved.length) {
      library.presets = [...library.presets.filter((preset) => !moved.some((item) => item.name === preset.name)), ...moved];
      library.save(moved).catch((error: unknown) => input.uiManager.notify(`Preset could not be saved: ${error instanceof Error ? error.message : String(error)}`, 6000));
    }
    return rest;
  };
  let saveTimer: ReturnType<typeof setTimeout> | undefined;
  const records = new Map<string, RefineRecord>();
  const manual = new Set<string>();
  let recordsImage: HTMLImageElement | null = null;
  let preview: { result: RefineResult; before: RefineRect }[] = [];
  let previewTimer: ReturnType<typeof setTimeout> | undefined;
  let generation = 0;
  let previewGeneration = 0;
  let busy = false;
  let applying = false;
  /** Box bounds as loaded from the label file, by annotation id: the base for reclass shrink checks. */
  const loadedBoxes = new Map<string, RefineRect>();
  const candidates = new Map<string, ReclassMatch>();
  /** Candidates dismissed with F (id -> box signature); a later edit of the box forgets it. */
  const dismissed = new Map<string, string>();
  let reclassGeneration = 0;

  const isDetection = (): boolean => input.state.session.workflow === "detection";
  const paneOpen = (): boolean => !pane.hidden;
  const getService = (): RefineService => (service ??= createRefineService());
  /** "Processed" uses the pinned processing snapshot, or the Preprocess panel's live settings when none is pinned. */
  const imageInput = (source: RefineImageSource, processing: RefineProcessing | null): RefineImageInput => source === "processed"
    ? { kind: "processed", config: (processing?.config as SegmentationPreprocessingConfig | undefined) ?? (input.canvasController.preprocessing ?? raw).getSegmentationPreprocessingConfig?.() }
    : { kind: "original" };
  /**
   * What a run uses: the Run-with preset (same rule for every class, with its image and processing) or the
   * saved class settings. Presets saved before image sources existed keep the current image settings.
   */
  const runConfig = (): { params(classId: string): RefineParams; image: RefineImageInput; label: string } => {
    const preset = settings.activePreset ? allPresets().find((item) => item.name === settings.activePreset) : undefined;
    if (preset) {
      const source = preset.imageSource ?? settings.imageSource;
      const processing = preset.imageSource ? preset.processing ?? null : settings.processing;
      return { params: () => preset.params, image: imageInput(source, processing), label: refinePresetLabel(preset) };
    }
    return { params: (classId) => resolveRefineParams(settings, classId), image: imageInput(settings.imageSource, settings.processing), label: "class settings" };
  };
  /** What Find candidates uses: the Reclass-with preset (its rules and image) or the Lab rules. */
  const reclassConfig = (): { rules: ReclassRule[]; image: RefineImageInput; preset: ReclassPreset | undefined } => {
    const preset = settings.activeReclassPreset ? allReclassPresets().find((item) => item.name === settings.activeReclassPreset) : undefined;
    return preset
      ? { rules: preset.reclass, image: imageInput(preset.imageSource, preset.processing), preset }
      : { rules: settings.reclass, image: imageInput(settings.reclassImageSource, settings.reclassProcessing), preset };
  };
  const imageText = (source: RefineImageSource, processing: RefineProcessing | null): string =>
    source === "processed" ? `Processed (${processing?.name || "live Preprocess panel"})` : "Original";
  const setStatus = (text: string): void => { status.textContent = text; };
  /** One-line rule summary shown under each Run-with choice. */
  const describePreset = (preset: RefineSettingsDocument["presets"][number]): string => {
    const p = preset.params;
    const image = preset.imageSource === "processed" ? `Processed${preset.processing?.name ? ` (${preset.processing.name})` : ""}` : preset.imageSource ? "Original" : "current image";
    const step = p.crit === "grad" ? ` · step ${p.gradStep} px` : "";
    const off = REFINE_SIDES.filter((side) => p.sides[side] === "off").length;
    const pairs = ([["TB", "T+B"], ["LR", "L+R"]] as const)
      .filter(([axis]) => p[`pair${axis}`] !== "off")
      .map(([axis, name]) => ` · ${name} ${p[`pair${axis}`]}${p[`pair${axis}Pick`] === "nearest" ? " (near)" : ""}`).join("");
    return `${CRITERION_SHORT[p.crit]} · in ${p.rangeIn} / out ${p.rangeOut} px${step}${off ? ` · ${off} side${off === 1 ? "" : "s"} off` : ""}${pairs} · ${image}`;
  };

  const syncImage = (): HTMLImageElement | null => {
    const image = input.state.session.currentImage;
    if (image !== recordsImage) {
      recordsImage = image;
      records.clear();
      manual.clear();
      preview = [];
      loadedBoxes.clear();
      candidates.clear();
      dismissed.clear();
      reclassGeneration += 1;
    }
    rememberLoaded(rects().map((rect) => ({ annotationId: ensureAnnotationId(rect), originalYolo: rect.originalYolo })));
    return image;
  };
  /**
   * Records each box's loaded size the first time it is seen. originalYolo holds the label file's values until
   * the box is edited, and history snapshots carry it from before an edit, so even edited boxes keep their base.
   */
  const rememberLoaded = (boxes: readonly { annotationId: string; originalYolo?: YoloMetadata | null }[]): void => {
    const image = recordsImage;
    if (!image) return;
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;
    for (const { annotationId, originalYolo } of boxes) {
      if (!originalYolo || loadedBoxes.has(annotationId)) continue;
      const [cx, cy, w, h] = [originalYolo.x_center, originalYolo.y_center, originalYolo.width, originalYolo.height].map((value) => Number.parseFloat(value ?? ""));
      if (![cx, cy, w, h].every(Number.isFinite)) continue;
      loadedBoxes.set(annotationId, { x0: (cx - w / 2) * width, y0: (cy - h / 2) * height, x1: (cx + w / 2) * width, y1: (cy + h / 2) * height });
    }
  };
  const signature = (box: RefineBoxInput): string => [box.classId, box.x0, box.y0, box.x1, box.y1].map((v) => (typeof v === "number" ? v.toFixed(2) : v)).join("|");

  // ---------------------------------------------------------------- boxes
  const rects = (): FabricRectLike[] => raw.getObjects("rect").filter(isRectObject);
  const visibleRects = (): FabricRectLike[] => rects().filter((rect) => rect.visible !== false);
  const toBox = (rect: FabricRectLike): RefineBoxInput => {
    rect.setCoords(); // cached corners lag behind during/just after a draw gesture
    const b = getRectBounds(rect);
    return { id: ensureAnnotationId(rect), classId: rect.labelClass ?? "0", x0: b.left, y0: b.top, x1: b.right, y1: b.bottom };
  };
  const sameRect = (a: RefineRect, b: RefineRect, eps = 0.01): boolean =>
    Math.abs(a.x0 - b.x0) < eps && Math.abs(a.y0 - b.y0) < eps && Math.abs(a.x1 - b.x1) < eps && Math.abs(a.y1 - b.y1) < eps;
  const selectedRects = (): FabricRectLike[] => extractVisibleRectSelection(raw.canvas.getActiveObject?.() ?? null);
  const paramsFor = (boxes: readonly RefineBoxInput[]): Record<string, RefineParams> => {
    const config = runConfig();
    const out: Record<string, RefineParams> = {};
    for (const box of boxes) out[box.classId] ??= config.params(box.classId);
    return out;
  };
  const classIds = (): string[] => {
    const ids = new Set<string>([...input.state.session.classNames.keys(), ...Object.keys(settings.classes)]);
    rects().forEach((rect) => ids.add(rect.labelClass ?? "0"));
    return [...ids].sort((a, b) => Number(a) - Number(b) || a.localeCompare(b));
  };

  /** Refine flagged, not yet reviewed, and still at the refined geometry (a later hand edit counts as reviewed). */
  const refineFlagged = (box: RefineBoxInput): boolean => {
    const record = records.get(box.id);
    return Boolean(record?.result.flagged && !record.reviewed && sameRect(record.result.box, box));
  };
  const reclassMode = (): boolean => settings.mode === "reclass";
  /** Boxes to look at, top to bottom: Refine flags in Edge mode, reclass candidates in Reclass mode. */
  const reviewQueue = (): RefineBoxInput[] => {
    if (reclassMode() ? !candidates.size : !records.size) return [];
    return visibleRects()
      .filter((rect) => { const id = ensureAnnotationId(rect); const record = records.get(id); return reclassMode() ? candidates.has(id) : Boolean(record?.result.flagged && !record.reviewed); })
      .map(toBox)
      .filter((box) => reclassMode() || refineFlagged(box))
      .sort((a, b) => (a.y0 - b.y0) || (a.x0 - b.x0));
  };
  const className = (id: string): string | undefined => input.state.session.classNames.get(id);

  // ---------------------------------------------------------------- settings
  /** The pane only applies settings: summary line plus the class list for "Refine class". Editing lives in the Lab. */
  const renderPane = (): void => {
    const mode = settings.mode;
    byId("refineModeToggle").querySelectorAll<HTMLButtonElement>("[data-mode]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.mode === mode)));
    pane.querySelectorAll<HTMLElement>("[data-refine-mode]").forEach((section) => { section.hidden = section.dataset.refineMode !== mode; });
    byId("refineShowReviewToggle").closest("label")!.title = mode === "reclass" ? "Pins on reclass candidates" : "Pins and weak-side marks on boxes to review";
    const own = Object.keys(settings.classes).length;
    const lab = settings.reclass[0];
    byId("refineSettingsSummary").textContent = mode === "reclass"
      ? `Lab rule: ${!lab ? "not set" : lab.enabled ? "on" : "off"} · image ${imageText(settings.reclassImageSource, settings.reclassProcessing)}`
      : `Class settings: image ${imageText(settings.imageSource, settings.processing)} · `
        + (own ? `${own} class${own === 1 ? "" : "es"} with own settings` : "every class uses the default");
    // Reclass with: the Lab rules or one reclass preset, the chosen rules summarised below.
    const reclassPresets = allReclassPresets();
    const reclassDatasetNames = new Set(settings.reclassPresets.map((preset) => preset.name));
    const reclassSelect = byId<HTMLSelectElement>("refineReclassPresetSelect");
    reclassSelect.replaceChildren(new Option("Lab rule", ""), ...reclassPresets.map((preset) =>
      new Option(`${refinePresetLabel(preset)}${reclassDatasetNames.has(preset.name) ? "" : " (profile)"}`, preset.name)));
    const config = reclassConfig();
    reclassSelect.value = config.preset?.name ?? "";
    const [rule] = config.rules;
    byId("refineReclassSummary").textContent = (!rule ? "No rule · set it up in Refine Lab" : `${describeReclassRule(rule, className)}${rule.enabled ? "" : " (off)"}`)
      + (config.preset ? ` · ${imageText(config.preset.imageSource, config.preset.processing)}` : "");
    // Run with: a dropdown scales to many presets; the chosen one's rule summary sits below it.
    const presets = allPresets();
    const datasetNames = new Set(settings.presets.map((preset) => preset.name));
    const active = presets.find((preset) => preset.name === settings.activePreset);
    const runSelect = byId<HTMLSelectElement>("refineRunPresetSelect");
    runSelect.replaceChildren(new Option("Class settings", ""), ...presets.map((preset) => {
      const option = new Option(`${refinePresetLabel(preset)}${datasetNames.has(preset.name) ? "" : " (profile)"}`, preset.name);
      option.title = describePreset(preset);
      return option;
    }));
    runSelect.value = active?.name ?? "";
    runSelect.title = active ? "Every class is refined with this preset; class settings are left unchanged" : "Each class uses its own settings";
    byId("refineRunPresetDetail").textContent = active
      ? describePreset(active)
      : `${own ? `${own} class${own === 1 ? "" : "es"} with own rules` : "Default rule for every class"}${presets.length ? "" : " · save presets in Refine Lab to switch here"}`;
    const select = byId<HTMLSelectElement>("refineClassSelect");
    const previous = select.value;
    const ids = classIds();
    select.replaceChildren(...ids.map((classId) => {
      const name = input.state.session.classNames.get(classId);
      const option = new Option(name ? `${classId} ${name}` : classId, classId);
      option.disabled = !runConfig().params(classId).enabled;
      return option;
    }));
    if (!ids.length) select.add(new Option("No classes", ""));
    select.value = ids.includes(previous) ? previous : ids[0] ?? "";
  };
  const loadSettings = async (): Promise<void> => {
    const folder = input.state.session.imageFolderHandle;
    if (folder === settingsFolder) return;
    settingsFolder = folder;
    settings = createRefineSettings();
    edgeLibrary.dataset = [];
    reclassLibrary.dataset = [];
    if (folder) {
      try {
        const directory = await getSubdirectoryHandle(folder as unknown as DirectoryHandleLike, ".easy-labeling");
        settings = parseRefineSettings(await readTextFileByName(directory, REFINE_SETTINGS_FILE));
        edgeLibrary.dataset = settings.presets;
        reclassLibrary.dataset = settings.reclassPresets;
      } catch (error: unknown) {
        if (!isNotFoundError(error)) input.uiManager.notify("Refine settings were invalid; defaults are in use.", 5000);
      }
    }
    await refreshProfilePresets();
    renderPane();
  };
  const changeSettings = (next: RefineSettingsDocument): void => {
    // Desktop: new and edited presets go to the profile folder instead of the dataset file.
    next = { ...next, presets: moveToProfile(next.presets, edgeLibrary), reclassPresets: moveToProfile(next.reclassPresets, reclassLibrary) };
    const modeChanged = next.mode !== settings.mode;
    settings = next;
    if (modeChanged) { renderReviewCounter(); raw.canvas.requestRenderAll?.(); }
    renderPane();
    schedulePreview();
    clearTimeout(saveTimer);
    const folder = settingsFolder;
    if (!folder) return;
    saveTimer = setTimeout(() => {
      getSubdirectoryHandle(folder as DirectoryHandleLike, ".easy-labeling", { create: true })
        .then((directory) => writeTextFileByName(directory, REFINE_SETTINGS_FILE, serializeRefineSettings(settings)))
        .catch(() => input.uiManager.notify("Refine settings could not be saved.", 4000));
    }, 400);
  };

  // ---------------------------------------------------------------- run
  const setBusy = (value: boolean): void => {
    busy = value;
    pane.querySelectorAll<HTMLButtonElement>("[data-refine-run]").forEach((button) => { button.disabled = value; });
  };

  const run = async (targets: RefineBoxInput[], skipManual: boolean): Promise<void> => {
    const image = syncImage();
    if (!image || !isDetection()) return setStatus("Open an image in the Detection workflow first.");
    if (busy) return;
    await loadSettings();
    const candidates = skipManual ? targets.filter((box) => !manual.has(box.id)) : targets;
    const paramsByClass = paramsFor(candidates);
    const runnable = candidates.filter((box) => paramsByClass[box.classId].enabled);
    if (!runnable.length) return setStatus(targets.length ? "Nothing to refine: boxes are hand-edited or their class is off." : "No boxes to refine.");
    const started = performance.now();
    const token = ++generation;
    setBusy(true);
    setStatus(`Refining ${runnable.length} box${runnable.length === 1 ? "" : "es"}…`);
    try {
      const results = await getService().refine(image, runnable, paramsByClass, rects().map(toBox), runConfig().image);
      if (token !== generation || image !== input.state.session.currentImage) return;
      // Skip boxes the user moved while the worker was busy.
      const now = new Map(rects().map(toBox).map((box) => [box.id, box]));
      const sent = new Map(runnable.map((box) => [box.id, box]));
      const fresh = results.filter((r) => { const current = now.get(r.id); const before = sent.get(r.id); return current && before && sameRect(current, before, 1e-6); });
      applying = true;
      try {
        raw.updateBoxGeometries?.(fresh.map((r) => ({ annotationId: r.id, x: r.box.x0, y: r.box.y0, width: r.box.x1 - r.box.x0, height: r.box.y1 - r.box.y0 })));
      } finally {
        applying = false;
      }
      fresh.forEach((result) => { records.set(result.id, { result, reviewed: false }); manual.delete(result.id); });
      const skipped = targets.length - fresh.length;
      const flagged = fresh.filter((r) => r.flagged).length;
      const areaFlags = fresh.filter((r) => r.areaFlagged).length;
      setStatus(`${fresh.length} refined in ${Math.round(performance.now() - started)} ms`
        + (skipped ? ` · ${skipped} skipped` : "") + ` · ${flagged} to review` + (areaFlags ? ` (${areaFlags} with a large area change)` : ""));
      preview = [];
      renderReviewCounter();
      raw.canvas.requestRenderAll?.();
    } catch (error: unknown) {
      setStatus(`Refine failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setBusy(false);
    }
  };

  const skipManualToggle = (): HTMLInputElement => byId<HTMLInputElement>("refineSkipManualToggle");
  const editedClassBoxes = (classes: readonly string[]): RefineBoxInput[] => {
    const boxes = visibleRects().map(toBox);
    return classes.length ? boxes.filter((box) => classes.includes(box.classId)) : boxes;
  };
  const refineSelected = (): void => {
    const boxes = selectedRects().map(toBox);
    if (!boxes.length) { setStatus("Select boxes to refine first."); return; }
    void run(boxes, false);
  };
  const refineClasses = (): void => {
    const classId = byId<HTMLSelectElement>("refineClassSelect").value;
    if (!classId) { setStatus("Choose a class to refine."); return; }
    void run(editedClassBoxes([classId]), skipManualToggle().checked);
  };
  const refineAll = (): void => { void run(visibleRects().map(toBox), skipManualToggle().checked); };

  // ---------------------------------------------------------------- review
  const renderReviewCounter = (): void => {
    const queue = reviewQueue();
    const current = selectedRects()[0];
    const index = current && queue.length ? queue.findIndex((box) => box.id === ensureAnnotationId(current)) : -1;
    reviewCounter.textContent = queue.length ? `${index >= 0 ? `${index + 1} / ` : ""}${queue.length} to review` : "0 to review";
    byId("refineReclassCounter").textContent = `${candidates.size} candidate${candidates.size === 1 ? "" : "s"}`;
  };
  const navigateReview = (direction: 1 | -1): void => {
    syncImage();
    const queue = reviewQueue();
    if (!queue.length) { renderReviewCounter(); setStatus("Nothing to review."); return; }
    const current = selectedRects()[0];
    const index = current ? queue.findIndex((box) => box.id === ensureAnnotationId(current)) : -1;
    const next = queue[index < 0 ? (direction > 0 ? 0 : queue.length - 1) : (index + direction + queue.length) % queue.length];
    const rect = rects().find((candidate) => ensureAnnotationId(candidate) === next.id);
    if (!rect) return;
    raw.setActiveSelection([rect], rect);
    raw.goToCoords((next.x0 + next.x1) / 2, (next.y0 + next.y1) / 2);
    renderReviewCounter();
  };
  const approve = (): void => {
    const selected = selectedRects();
    if (!selected.length) { setStatus("Select a flagged box to approve."); return; }
    // Approve settles what the current mode reviews: a Refine flag, or a reclass candidate.
    selected.forEach((rect) => {
      const id = ensureAnnotationId(rect);
      const record = records.get(id);
      if (!reclassMode() && record) record.reviewed = true;
      if (reclassMode() && candidates.delete(id)) dismissed.set(id, signature(toBox(rect)));
    });
    raw.canvas.requestRenderAll?.();
    navigateReview(1);
  };

  // ---------------------------------------------------------------- reclass
  const area = (r: RefineRect): number => Math.max(0, r.x1 - r.x0) * Math.max(0, r.y1 - r.y0);
  /** Marks boxes the reclass rules flag on this image. Boxes never move; shrink checks refine without applying. */
  const findCandidates = async (): Promise<void> => {
    const image = syncImage();
    if (!image || !isDetection()) return setStatus("Open an image in the Detection workflow first.");
    await loadSettings();
    const config = reclassConfig();
    const rules = config.rules;
    if (!rules.some((rule) => rule.enabled && (rule.mean.enabled || rule.bright.enabled || rule.shrink.enabled))) {
      // Candidates from an earlier run no longer stand.
      reclassGeneration += 1;
      candidates.clear();
      renderReviewCounter();
      raw.canvas.requestRenderAll?.();
      return setStatus("No reclass rule is on.");
    }
    const token = ++reclassGeneration;
    const started = performance.now();
    const boxes = visibleRects().map(toBox);
    const targets = boxes.filter((box) => rules.some((rule) => ruleApplies(rule, box.classId)));
    setStatus(`Checking ${targets.length} box${targets.length === 1 ? "" : "es"} for reclass…`);
    try {
      // Shrink: refined area against the size the box was loaded with (its current size when drawn here).
      const areaChange = new Map<string, number | null>();
      const shrinking = targets.filter((box) => rules.some((rule) => rule.shrink.enabled && ruleApplies(rule, box.classId)));
      if (shrinking.length) {
        const params = paramsFor(shrinking);
        const runnable = shrinking.filter((box) => params[box.classId].enabled);
        const results = runnable.length ? await getService().refine(image, runnable, params, boxes, runConfig().image) : [];
        const sent = new Map(shrinking.map((box) => [box.id, box]));
        for (const result of results) {
          const base = area(loadedBoxes.get(result.id) ?? sent.get(result.id)!);
          areaChange.set(result.id, base > 0 ? area(result.box) / base - 1 : null);
        }
      }
      // Pixels: one crop around every target, from the image the reclass checks read.
      let matches: ReclassMatch[] = [];
      if (targets.length) {
        const union = targets.reduce<RefineRect>((u, b) => ({ x0: Math.min(u.x0, b.x0), y0: Math.min(u.y0, b.y0), x1: Math.max(u.x1, b.x1), y1: Math.max(u.y1, b.y1) }), targets[0]);
        const crop = await getService().crop(image, union, config.image);
        const local = targets.map((box) => ({ id: box.id, classId: box.classId, box: { x0: box.x0 - crop.x0, y0: box.y0 - crop.y0, x1: box.x1 - crop.x0, y1: box.y1 - crop.y0 } }));
        matches = evaluateReclass(crop, local, rules, areaChange);
      }
      if (token !== reclassGeneration || image !== input.state.session.currentImage) return;
      const now = new Map(boxes.map((box) => [box.id, box]));
      candidates.clear();
      for (const match of matches) {
        if (dismissed.get(match.id) === signature(now.get(match.id)!)) continue;
        candidates.set(match.id, match);
      }
      setStatus(`${candidates.size} reclass candidate${candidates.size === 1 ? "" : "s"} in ${Math.round(performance.now() - started)} ms`);
      renderReviewCounter();
      raw.canvas.requestRenderAll?.();
    } catch (error: unknown) {
      if (token === reclassGeneration) setStatus(`Reclass check failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  /** Changes candidates to their rule's class as one undo step. */
  const reclass = (scope: "selected" | "all"): void => {
    const ids = scope === "all" ? [...candidates.keys()] : selectedRects().map((rect) => ensureAnnotationId(rect)).filter((id) => candidates.has(id));
    if (!ids.length) { setStatus(scope === "all" ? "No reclass candidates." : "Select a candidate to reclass."); return; }
    const updates = ids.map((id) => ({ annotationId: id, classId: candidates.get(id)!.toClass }));
    let changed = 0;
    applying = true;
    try {
      changed = raw.updateBoxClasses?.(updates) ?? 0;
    } finally {
      applying = false;
    }
    ids.forEach((id) => { candidates.delete(id); dismissed.delete(id); });
    const classesSet = new Set(updates.map((update) => update.classId));
    setStatus(classesSet.size === 1 ? `${changed} box${changed === 1 ? "" : "es"} → class ${updates[0].classId}` : `${changed} boxes reclassed`);
    renderReviewCounter();
    raw.canvas.requestRenderAll?.();
  };

  // ---------------------------------------------------------------- canvas preview (selected boxes, not applied)
  const schedulePreview = (): void => {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(() => {
      const image = syncImage();
      // The would-be edges preview only in Edge mode.
      const selected = paneOpen() && isDetection() && !reclassMode() ? selectedRects().map(toBox) : [];
      if (!image || !selected.length || selected.length > PREVIEW_LIMIT) {
        if (preview.length) { preview = []; raw.canvas.requestRenderAll?.(); }
        if (selected.length > PREVIEW_LIMIT) setStatus(`Preview shows up to ${PREVIEW_LIMIT} selected boxes.`);
        return;
      }
      const token = ++previewGeneration;
      void loadSettings()
        .then(() => getService().refine(image, selected, paramsFor(selected), rects().map(toBox), runConfig().image))
        .then((results) => {
          if (token !== previewGeneration) return;
          const before = new Map(selected.map((box) => [box.id, box]));
          preview = results.map((result) => ({ result, before: before.get(result.id)! }));
          const moved = preview.filter((p) => !sameRect(p.result.box, p.before, 0.05)).length;
          setStatus(`Preview: ${moved} of ${selected.length} selected would move · E applies`);
          raw.canvas.requestRenderAll?.();
        })
        .catch(() => undefined);
    }, 120);
  };

  // ---------------------------------------------------------------- overlay
  /** Boxes to mark in screen pixels; none while "Show review marks" is off. */
  const markTargets = (sx: (x: number) => number, sy: (y: number) => number): MarkTarget[] => {
    if (!byId<HTMLInputElement>("refineShowReviewToggle").checked) return [];
    const selected = new Set(selectedRects().map((rect) => ensureAnnotationId(rect)));
    return reviewQueue().map((box) => {
      const result = !reclassMode() && refineFlagged(box) ? records.get(box.id)!.result : undefined;
      const match = reclassMode() ? candidates.get(box.id) : undefined;
      const name = match ? className(match.toClass) : undefined;
      return {
        id: box.id,
        screen: { x0: sx(box.x0), y0: sy(box.y0), x1: sx(box.x1), y1: sy(box.y1) },
        review: result ? { weakSides: result.weakSides, areaChange: result.areaFlagged ? result.areaChange : null } : undefined,
        reclass: match ? { toClass: match.toClass, label: `→ ${match.toClass}${name ? ` ${name}` : ""}` } : undefined,
        focused: selected.has(box.id)
      };
    });
  };
  /**
   * While marks show, every other box (and its label) fades to DIM_OPACITY so the marked ones stand out.
   * Opacity is display only: history snapshots and saved labels do not carry it.
   */
  const dimmed = new Set<FabricRectLike>();
  const dimExcept = (keep: ReadonlySet<string> | null): void => {
    let changed = false;
    const setOpacity = (rect: FabricRectLike, opacity: number): void => {
      if ((rect.opacity ?? 1) !== opacity) { rect.opacity = opacity; changed = true; }
      if (rect._labelText && (rect._labelText.opacity ?? 1) !== opacity) { rect._labelText.opacity = opacity; changed = true; }
    };
    if (keep) {
      for (const rect of rects()) {
        const dim = !keep.has(ensureAnnotationId(rect));
        if (dim) dimmed.add(rect); else dimmed.delete(rect);
        setOpacity(rect, dim ? DIM_OPACITY : 1);
      }
    } else {
      dimmed.forEach((rect) => setOpacity(rect, 1));
      dimmed.clear();
    }
    // Drawn from after:render: only ask for another frame when something changed, or it never settles.
    if (changed) raw.canvas.requestRenderAll?.();
  };
  const drawOverlay = (): void => {
    const fabricCanvas = raw.canvas;
    const width = Math.max(1, Math.round(fabricCanvas.getWidth()));
    const height = Math.max(1, Math.round(fabricCanvas.getHeight()));
    const context = overlay.getContext("2d");
    if (!context) return;
    const active = isDetection() && input.state.session.currentImage === recordsImage && (records.size > 0 || candidates.size > 0 || preview.length > 0);
    if (!active) {
      if (overlay.width > 1) context.clearRect(0, 0, overlay.width, overlay.height);
      dimExcept(null);
      overlay.dataset.pins = "0";
      overlay.dataset.tags = "0";
      return;
    }
    if (overlay.width !== width || overlay.height !== height) {
      overlay.width = width;
      overlay.height = height;
      overlay.style.width = `${width}px`;
      overlay.style.height = `${height}px`;
    }
    // Fabric's wrapper is centred inside <main>; pin the overlay onto the actual canvas element.
    const host = overlay.offsetParent?.getBoundingClientRect();
    const target = doc.getElementById("canvas")?.getBoundingClientRect();
    if (host && target) {
      overlay.style.inset = "auto";
      overlay.style.left = `${target.left - host.left}px`;
      overlay.style.top = `${target.top - host.top}px`;
    }
    context.clearRect(0, 0, width, height);
    const v = fabricCanvas.viewportTransform;
    const sx = (x: number): number => v[0] * x + v[4];
    const sy = (y: number): number => v[3] * y + v[5];
    context.save();
    context.font = "600 11px system-ui, sans-serif";
    const targets = markTargets(sx, sy);
    dimExcept(targets.length ? new Set(targets.map((target) => target.id)) : null);
    const measure = (text: string): number => context.measureText(text).width;
    let [pins, tags] = [0, 0];
    for (const target of targets) {
      const layout = layoutMarks(target, measure);
      drawMarks(context, layout);
      pins += layout.pins.length;
      tags += layout.tags.length;
    }
    // What was drawn, for checks that cannot read canvas pixels reliably.
    overlay.dataset.pins = String(pins);
    overlay.dataset.tags = String(tags);
    // Preview: the would-be result as a solid outline plus how far each side moves (outward positive).
    for (const { result, before } of preview) {
      const { x0, y0, x1, y1 } = result.box;
      context.lineWidth = 2;
      context.strokeStyle = result.areaFlagged ? AREA_COLOR : result.flagged ? WARN_COLOR : getColorForClass(result.classId);
      context.strokeRect(sx(x0), sy(y0), sx(x1) - sx(x0), sy(y1) - sy(y0));
      if (result.areaFlagged) {
        const text = areaText(result.areaChange);
        context.fillStyle = AREA_COLOR;
        context.fillRect(sx(x0), sy(y1) + 18, context.measureText(text).width + 8, 15);
        context.fillStyle = "#ffffff";
        context.fillText(text, sx(x0) + 4, sy(y1) + 29);
      }
      for (const side of REFINE_SIDES) {
        const key = SIDE_KEY[side];
        const delta = (result.box[key] - before[key]) * (side === "L" || side === "T" ? -1 : 1);
        if (Math.abs(delta) < 0.5) continue;
        const text = `${delta > 0 ? "+" : "−"}${Math.abs(delta).toFixed(1)}`;
        const tx = side === "L" ? sx(x0) - context.measureText(text).width - 6 : side === "R" ? sx(x1) + 6 : (sx(x0) + sx(x1)) / 2 - 12;
        const ty = side === "T" ? sy(y0) - 6 : side === "B" ? sy(y1) + 14 : (sy(y0) + sy(y1)) / 2 + 4;
        context.fillStyle = "rgba(0, 0, 0, 0.6)";
        context.fillRect(tx - 3, ty - 11, context.measureText(text).width + 6, 15);
        context.fillStyle = "#ffffff";
        context.fillText(text, tx, ty);
      }
    }
    context.restore();
  };

  // ---------------------------------------------------------------- lab
  let lab: RefineLab | null = null;
  const collectCases = (source: RefineLabCaseSource, classes: readonly string[]): RefineBoxInput[] => {
    if (source === "selection") return selectedRects().map(toBox);
    if (source === "classes") return editedClassBoxes(classes);
    return visibleRects().map(toBox);
  };
  const openLab = (): void => {
    if (!isDetection()) return;
    // The lab is loaded on first use to keep app start-up light.
    // Rescan the profile folder so preset files added since show up in the Lab.
    void Promise.all([loadSettings().then(refreshProfilePresets).then(renderPane), import("./refine-lab.js")]).then(([, { createRefineLab }]) => {
      lab ??= createRefineLab({
        documentRef: doc,
        windowRef,
        getImage: syncImage,
        getSettings: () => settings,
        saveSettings: changeSettings,
        refineOnCanvas: (ids) => {
          const wanted = new Set(ids);
          void run(rects().map(toBox).filter((box) => wanted.has(box.id)), false);
        },
        findCandidatesOnCanvas: () => { void findCandidates(); },
        collectCases,
        cropImage: (image, rect, source, processing) => getService().crop(image, rect, imageInput(source, processing)),
        loadPreprocessingPresets: async () => (await loadPreprocessingPresetLibrary(await openProfilePresetFolder(windowRef, "preprocessing"),
          input.state.session.imageFolderHandle as unknown as DirectoryHandleLike | null)).presets.map((preset) => ({ name: preset.name, config: { ...preset.config } })),
        imageFolder: () => input.state.session.imageFolderHandle as FileSystemDirectoryHandle | null,
        profilePresets: () => edgeLibrary.presets,
        deleteProfilePreset: hasProfileFolder ? edgeLibrary.remove : undefined,
        profileReclassPresets: () => reclassLibrary.presets,
        deleteProfileReclassPreset: hasProfileFolder ? reclassLibrary.remove : undefined,
        allBoxes: () => rects().map(toBox),
        loadedBox: (id) => { syncImage(); return loadedBoxes.get(id) ?? null; },
        classIds,
        className: (classId) => input.state.session.classNames.get(classId),
        notify: (message) => input.uiManager.notify(message, 4000)
      });
      lab.open();
    });
  };

  const runShortcut = (action: RefineShortcut): void => {
    if (!isDetection()) return;
    switch (action) {
      case "toggle": input.uiManager.setInspectorTab(paneOpen() ? "annotation" : "refine"); break;
      case "refineSelected": refineSelected(); break;
      case "refineAll": refineAll(); break;
      case "nextReview": navigateReview(1); break;
      case "previousReview": navigateReview(-1); break;
      case "approve": approve(); break;
    }
  };

  return {
    bind(): void {
      renderPane();
      byId("refineRunPresetSelect").addEventListener("change", (event) => {
        const name = (event.target as HTMLSelectElement).value;
        changeSettings({ ...settings, activePreset: name || null });
        setStatus(name ? `Refining with ${name} for every class.` : "Refining with class settings.");
      });
      byId("refineReclassPresetSelect").addEventListener("change", (event) => {
        const name = (event.target as HTMLSelectElement).value;
        changeSettings({ ...settings, activeReclassPreset: name || null });
        setStatus(name ? `Finding candidates with ${name}.` : "Finding candidates with the Lab rule.");
      });
      byId("refineModeToggle").addEventListener("click", (event) => {
        const mode = (event.target as HTMLElement).closest<HTMLElement>("[data-mode]")?.dataset.mode;
        if ((mode === "edge" || mode === "reclass") && mode !== settings.mode) changeSettings({ ...settings, mode });
      });
      byId("refineSelectedBtn").addEventListener("click", refineSelected);
      byId("refineClassesBtn").addEventListener("click", refineClasses);
      byId("refineAllBtn").addEventListener("click", refineAll);
      byId("refinePrevReviewBtn").addEventListener("click", () => navigateReview(-1));
      byId("refineNextReviewBtn").addEventListener("click", () => navigateReview(1));
      byId("refineApproveBtn").addEventListener("click", approve);
      byId("refineShowReviewToggle").addEventListener("change", drawOverlay);
      byId("refineFindReclassBtn").addEventListener("click", () => { void findCandidates(); });
      byId("refineReclassSelectedBtn").addEventListener("click", () => reclass("selected"));
      byId("refineReclassAllBtn").addEventListener("click", () => reclass("all"));
      byId("openRefineLabBtn").addEventListener("click", openLab);
      byId("taskRefineBtn").addEventListener("click", () => runShortcut("toggle"));
      byId("inspectorRefineTabBtn").addEventListener("click", () => input.uiManager.setInspectorTab("refine"));

      const canvas = raw.canvas;
      canvas.on?.("after:render", drawOverlay);
      const onSelection = (): void => {
        if (records.size || candidates.size) renderReviewCounter();
        if (paneOpen() || preview.length) schedulePreview();
      };
      ["selection:created", "selection:updated", "selection:cleared", "object:modified"].forEach((name) => canvas.on?.(name, onSelection));
      // Refresh whenever the pane becomes visible (class list or dataset may have changed).
      new MutationObserver(() => {
        schedulePreview();
        if (!paneOpen()) return;
        syncImage();
        void loadSettings().then(() => { renderPane(); renderReviewCounter(); });
      }).observe(pane, { attributes: true, attributeFilter: ["hidden"] });

      raw.subscribeHistory?.((entry) => {
        syncImage();
        // Before any edit (ours included) the snapshot still carries the label file's values.
        rememberLoaded(entry.before);
        if (applying) return;
        const before = new Map(entry.before.map((s) => [s.annotationId, s]));
        const created: string[] = [];
        for (const after of entry.after) {
          const prior = before.get(after.annotationId);
          before.delete(after.annotationId);
          if (!prior) created.push(after.annotationId);
          else {
            const moved = prior.boundsLeft !== after.boundsLeft || prior.boundsTop !== after.boundsTop
              || prior.width * prior.scaleX !== after.width * after.scaleX || prior.height * prior.scaleY !== after.height * after.scaleY;
            if (moved) manual.add(after.annotationId);
            // A hand edit settles a reclass candidate (and forgets a dismissal).
            if (moved || prior.labelClass !== after.labelClass) { candidates.delete(after.annotationId); dismissed.delete(after.annotationId); }
          }
        }
        before.forEach((_, id) => { records.delete(id); manual.delete(id); candidates.delete(id); dismissed.delete(id); });
        if (created.length === 1 && input.state.view.currentMode === "draw") {
          const rect = rects().find((candidate) => ensureAnnotationId(candidate) === created[0]);
          if (rect) {
            const box = toBox(rect);
            void loadSettings().then(() => {
              const params = runConfig().params(box.classId);
              if (params.enabled && params.autoOnDraw) return run([box], false);
            });
          }
        }
      });
    },
    runShortcut
  };
}
