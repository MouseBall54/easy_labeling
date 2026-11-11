import type { AppState } from "../app/state.js";
import { REFINE_SIDES, type RefineBoxInput, type RefineParams, type RefineRect, type RefineResult } from "../domain/refine/edge-refine.js";
import {
  createRefineSettings,
  mergeRefinePresets,
  parseReclassPresetFiles,
  parseRefinePresetFiles,
  parseRefineSettings,
  resolvePresetParams,
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
import { describeReclassRule, evaluateReclass, reclassRuleOf, ruleApplies, ruleChecks, type ReclassMatch, type ReclassRule } from "../domain/refine/reclass.js";
import { createRefineService, type RefineImageInput, type RefineService } from "../features/refine/refine-service.js";
import { refineFolderNatively } from "../features/refine/native-refine-folder.js";
import { applyLabelFileChanges, LABEL_FILE_MOVE_EPSILON, labelFileBoxes, movedBy } from "../domain/refine/label-file.js";
import { getSubdirectoryHandle, isNotFoundError, readTextFileByName, writeTextFileByName } from "../platform/file-system-access.js";
import type { DirectoryHandleLike } from "../types/files.js";
import type { RuntimeCanvasController } from "./canvas-controller-adapter.js";
import type { RefineLab, RefineLabCaseSource } from "./refine-lab.js";
import { AREA_COLOR, areaText, DIM_OPACITY, drawMarks, layoutMarks, REVIEW_COLOR as WARN_COLOR, type MarkTarget } from "./refine-marks.js";
import { loadPreprocessingPresetLibrary } from "../features/segmentation/preprocessing-presets.js";
import { openProfilePresetFolder } from "../features/presets/profile-presets.js";
import type { SegmentationPreprocessingConfig } from "../features/segmentation/preprocessing.js";
import type { RuntimeUiManager } from "./ui-manager-adapter.js";
import type { DetectionLabelRewrite, RuntimeFileSystem } from "./file-system-adapter.js";

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

/** Which boxes of the current image a run takes (the pane's buttons are "selected", "all" and a class). */
export type RefineScope = "selected" | "all" | { classId: string } | { annotationIds: readonly string[] };

/** What a run did: the status line text plus its numbers (read by the agent tools). */
export interface RefineRunOutcome {
  ok: boolean;
  message: string;
  /** Why it did not run: busy (another run), declined (the person said no), failed. */
  code?: "busy" | "declined" | "failed";
  [detail: string]: unknown;
}

/** Runs the pane's actions with explicit targets and returns what happened (src/bootstrap/agent-tools-refine.ts). */
export interface RefineAgentApi {
  settingsSummary(): Promise<Record<string, unknown>>;
  /** `preset`: an edge preset for this call (null: class settings; omitted: the pane's Run with). */
  refine(scope: RefineScope, options: { preset?: string | null; keepHandEdited?: boolean; dryRun?: boolean }): Promise<RefineRunOutcome>;
  /** `preset`: a reclass preset for this call (null: the Lab rule; omitted: the pane's Reclass with). */
  reclass(scope: RefineScope, options: { preset?: string | null; keepHandEdited?: boolean; dryRun?: boolean }): Promise<RefineRunOutcome>;
  reviewQueue(mode?: "edge" | "reclass"): { mode: "edge" | "reclass"; boxes: Record<string, unknown>[] };
  approve(ids: readonly string[] | "all", mode?: "edge" | "reclass"): { approved: number; remaining: number };
  runFolder(mode: "edge" | "reclass", options: { preset?: string | null; confirm(message: string): Promise<boolean> }): Promise<RefineRunOutcome>;
}

export interface RefineController {
  bind(): void;
  runShortcut(action: RefineShortcut): void;
  readonly agent: RefineAgentApi;
}

const PREVIEW_LIMIT = 50;
const SIDE_KEY = { L: "x0", R: "x1", T: "y0", B: "y1" } as const;

interface RefineRecord { result: RefineResult; reviewed: boolean }

export function createRefineController(input: {
  state: AppState;
  canvasController: RuntimeCanvasController;
  uiManager: RuntimeUiManager;
  documentRef: Document;
  /** Folder runs (every image's label file); without it the folder buttons report that they are unavailable. */
  fileSystem?: Pick<RuntimeFileSystem, "rewriteDetectionLabels" | "decodeImageForAutomation">;
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
  let settingsLoad: Promise<void> = Promise.resolve();
  /** The agent's preset for one call: undefined uses the pane's Run with / Reclass with, null the class settings / Lab rule. */
  let edgePresetOverride: string | null | undefined;
  let reclassPresetOverride: string | null | undefined;
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
  /** Boxes Reclass Apply changed (id -> match, class before, review state): the Review queue in Reclass mode. */
  const reclassed = new Map<string, { match: ReclassMatch; from: string; reviewed: boolean }>();
  /** Boxes whose class was changed by hand: All boxes / Reclass class skip them while the keep toggle is on. */
  const manualClass = new Set<string>();

  const isDetection = (): boolean => input.state.session.workflow === "detection";
  const paneOpen = (): boolean => !pane.hidden;
  const getService = (): RefineService => (service ??= createRefineService());
  /** "Processed" uses the pinned processing snapshot, or the Preprocess panel's live settings when none is pinned. */
  const imageInput = (source: RefineImageSource, processing: RefineProcessing | null): RefineImageInput => source === "processed"
    ? { kind: "processed", config: (processing?.config as SegmentationPreprocessingConfig | undefined) ?? (input.canvasController.preprocessing ?? raw).getSegmentationPreprocessingConfig?.() }
    : { kind: "original" };
  /**
   * What a run uses: the Run-with preset (its default plus its per-class values, with its image and processing) or the
   * saved class settings. Presets saved before image sources existed keep the current image settings.
   */
  const runConfig = (): { params(classId: string): RefineParams; ownClasses: string[]; image: RefineImageInput; label: string } => {
    const name = edgePresetOverride === undefined ? settings.activePreset : edgePresetOverride;
    const preset = name ? allPresets().find((item) => item.name === name) : undefined;
    if (preset) {
      const source = preset.imageSource ?? settings.imageSource;
      const processing = preset.imageSource ? preset.processing ?? null : settings.processing;
      return { params: (classId) => resolvePresetParams(preset, classId), ownClasses: Object.keys(preset.classes ?? {}), image: imageInput(source, processing), label: refinePresetLabel(preset) };
    }
    return { params: (classId) => resolveRefineParams(settings, classId), ownClasses: Object.keys(settings.classes), image: imageInput(settings.imageSource, settings.processing), label: "class settings" };
  };
  /** What Reclass Apply uses: the Reclass-with preset (its rule and image) or the Lab rule; the default rule when none is saved. */
  const reclassConfig = (): { rule: ReclassRule; image: RefineImageInput; preset: ReclassPreset | undefined } => {
    const name = reclassPresetOverride === undefined ? settings.activeReclassPreset : reclassPresetOverride;
    const preset = name ? allReclassPresets().find((item) => item.name === name) : undefined;
    return preset
      ? { rule: reclassRuleOf(preset.reclass), image: imageInput(preset.imageSource, preset.processing), preset }
      : { rule: reclassRuleOf(settings.reclass), image: imageInput(settings.reclassImageSource, settings.reclassProcessing), preset };
  };
  const imageText = (source: RefineImageSource, processing: RefineProcessing | null): string =>
    source === "processed" ? `Processed (${processing?.name || "live Preprocess panel"})` : "Original";
  const setStatus = (text: string): void => { status.textContent = text; };
  /** A run that did not happen: the status line says why, and so does the outcome. */
  const fail = (text: string, code: RefineRunOutcome["code"] = "failed"): RefineRunOutcome => { setStatus(text); return { ok: false, message: text, code }; };
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
      reclassed.clear();
      manualClass.clear();
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
  /** Reclassed by Apply, not yet approved, and still of the class Apply gave it (an undo takes it out of the queue). */
  const reclassPending = (rect: FabricRectLike): boolean => {
    const entry = reclassed.get(ensureAnnotationId(rect));
    return Boolean(entry && !entry.reviewed && (rect.labelClass ?? "0") === entry.match.toClass);
  };
  /** Boxes to look at, top to bottom: Refine flags in Edge mode, reclassed boxes in Reclass mode. */
  const reviewQueue = (mode = settings.mode): RefineBoxInput[] => {
    const byPosition = (a: RefineBoxInput, b: RefineBoxInput): number => (a.y0 - b.y0) || (a.x0 - b.x0);
    if (mode === "reclass") return reclassed.size ? visibleRects().filter(reclassPending).map(toBox).sort(byPosition) : [];
    if (!records.size) return [];
    return visibleRects()
      .filter((rect) => { const record = records.get(ensureAnnotationId(rect)); return Boolean(record?.result.flagged && !record.reviewed); })
      .map(toBox)
      .filter(refineFlagged)
      .sort(byPosition);
  };
  const className = (id: string): string | undefined => input.state.session.classNames.get(id);

  // ---------------------------------------------------------------- settings
  /** The pane only applies settings: summary line plus the class list for "Refine class". Editing lives in the Lab. */
  const renderPane = (): void => {
    const mode = settings.mode;
    byId("refineModeToggle").querySelectorAll<HTMLButtonElement>("[data-mode]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.mode === mode)));
    pane.querySelectorAll<HTMLElement>("[data-refine-mode]").forEach((section) => { section.hidden = section.dataset.refineMode !== mode; });
    byId("refineShowReviewToggle").closest("label")!.title = mode === "reclass" ? "Pins on reclassed boxes to review" : "Pins and weak-side marks on boxes to review";
    const own = Object.keys(settings.classes).length;
    byId("refineSettingsSummary").textContent = mode === "reclass"
      ? `Lab rule${settings.reclass.length ? "" : " (default)"} · image ${imageText(settings.reclassImageSource, settings.reclassProcessing)}`
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
    byId("refineReclassSummary").textContent = describeReclassRule(config.rule, className)
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
    runSelect.title = active ? "Boxes are refined with this preset's default and class values; the saved class settings are left unchanged" : "Each class uses its own settings";
    byId("refineRunPresetDetail").textContent = active
      ? describePreset(active)
      : `${own ? `${own} class${own === 1 ? "" : "es"} with own rules` : "Default rule for every class"}${presets.length ? "" : " · save presets in Refine Lab to switch here"}`;
    const ids = classIds();
    const classOptions = (select: HTMLSelectElement, disabled: (classId: string) => boolean): void => {
      const previous = select.value;
      select.replaceChildren(...ids.map((classId) => {
        const name = input.state.session.classNames.get(classId);
        const option = new Option(name ? `${classId} ${name}` : classId, classId);
        option.disabled = disabled(classId);
        return option;
      }));
      if (!ids.length) select.add(new Option("No classes", ""));
      select.value = ids.includes(previous) ? previous : ids.find((classId) => !disabled(classId)) ?? ids[0] ?? "";
    };
    // Classes the rule does not check (or already turns boxes into) cannot be reclassed.
    classOptions(byId<HTMLSelectElement>("refineReclassClassSelect"), (classId) => !ruleApplies({ ...config.rule, mean: { ...config.rule.mean, enabled: true } }, classId));
    const select = byId<HTMLSelectElement>("refineClassSelect");
    const previous = select.value;
    select.replaceChildren(...ids.map((classId) => {
      const name = input.state.session.classNames.get(classId);
      const option = new Option(name ? `${classId} ${name}` : classId, classId);
      option.disabled = !runConfig().params(classId).enabled;
      return option;
    }));
    if (!ids.length) select.add(new Option("No classes", ""));
    select.value = ids.includes(previous) ? previous : ids[0] ?? "";
  };
  /**
   * Reads the open folder's settings once per folder. Callers that change settings wait for it (also while a read is
   * in flight), so a choice made in the pane is never replaced by the file read that follows a folder switch.
   */
  const loadSettings = (): Promise<void> => {
    const folder = input.state.session.imageFolderHandle;
    if (folder === settingsFolder) return settingsLoad;
    settingsFolder = folder;
    clearTimeout(saveTimer);
    settingsLoad = (async () => {
      let next = createRefineSettings();
      if (folder) {
        try {
          const directory = await getSubdirectoryHandle(folder as unknown as DirectoryHandleLike, ".easy-labeling");
          next = parseRefineSettings(await readTextFileByName(directory, REFINE_SETTINGS_FILE));
        } catch (error: unknown) {
          if (!isNotFoundError(error)) input.uiManager.notify("Refine settings were invalid; defaults are in use.", 5000);
        }
      }
      await refreshProfilePresets();
      if (folder !== settingsFolder) return; // another folder opened meanwhile; its own read wins
      settings = next;
      edgeLibrary.dataset = settings.presets;
      reclassLibrary.dataset = settings.reclassPresets;
      renderPane();
    })();
    return settingsLoad;
  };
  /** Applies a pane change on top of the open folder's settings. */
  const changeLoadedSettings = (patch: (current: RefineSettingsDocument) => RefineSettingsDocument): Promise<void> =>
    loadSettings().then(() => changeSettings(patch(settings)));
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

  /** `dryRun` (the agent's preview): computes the same results and returns them without moving a box. */
  const run = async (targets: RefineBoxInput[], skipManual: boolean, dryRun = false): Promise<RefineRunOutcome> => {
    const image = syncImage();
    if (!image || !isDetection()) return fail("Open an image in the Detection workflow first.");
    if (busy) return fail("Refine is already running.", "busy");
    await loadSettings();
    const candidates = skipManual ? targets.filter((box) => !manual.has(box.id)) : targets;
    const paramsByClass = paramsFor(candidates);
    const runnable = candidates.filter((box) => paramsByClass[box.classId].enabled);
    if (!runnable.length) return fail(targets.length ? "Nothing to refine: boxes are hand-edited or their class is off." : "No boxes to refine.");
    const started = performance.now();
    const token = ++generation;
    setBusy(true);
    setStatus(`Refining ${runnable.length} box${runnable.length === 1 ? "" : "es"}…`);
    try {
      const results = await getService().refine(image, runnable, paramsByClass, rects().map(toBox), runConfig().image);
      if (token !== generation || image !== input.state.session.currentImage) return fail("The image or the boxes changed while refining; nothing was applied.");
      // Skip boxes the user moved while the worker was busy.
      const now = new Map(rects().map(toBox).map((box) => [box.id, box]));
      const sent = new Map(runnable.map((box) => [box.id, box]));
      const fresh = results.filter((r) => { const current = now.get(r.id); const before = sent.get(r.id); return current && before && sameRect(current, before, 1e-6); });
      const changes = fresh.map((r) => {
        const before = sent.get(r.id)!;
        return { annotationId: r.id, classId: r.classId, before: { x0: before.x0, y0: before.y0, x1: before.x1, y1: before.y1 }, after: r.box,
          flagged: r.flagged, weakSides: r.weakSides, areaChange: r.areaChange, areaFlagged: r.areaFlagged, sizeLimited: r.sizeLimited };
      });
      const skipped = targets.length - fresh.length;
      const flagged = fresh.filter((r) => r.flagged).length;
      if (dryRun) {
        setStatus(`Preview: ${fresh.length} would be refined · ${flagged} to review (nothing applied)`);
        return { ok: true, dryRun: true, message: status.textContent ?? "", refined: fresh.length, skipped, flagged, changes };
      }
      applying = true;
      try {
        raw.updateBoxGeometries?.(fresh.map((r) => ({ annotationId: r.id, x: r.box.x0, y: r.box.y0, width: r.box.x1 - r.box.x0, height: r.box.y1 - r.box.y0 })));
      } finally {
        applying = false;
      }
      fresh.forEach((result) => { records.set(result.id, { result, reviewed: false }); manual.delete(result.id); });
      const areaFlags = fresh.filter((r) => r.areaFlagged).length;
      const sizeFlags = fresh.filter((r) => r.sizeLimited).length;
      const reasons = [areaFlags ? `${areaFlags} with a large area change` : "", sizeFlags ? `${sizeFlags} kept within the size limits` : ""].filter(Boolean).join(", ");
      setStatus(`${fresh.length} refined in ${Math.round(performance.now() - started)} ms`
        + (skipped ? ` · ${skipped} skipped` : "") + ` · ${flagged} to review` + (reasons ? ` (${reasons})` : ""));
      preview = [];
      renderReviewCounter();
      raw.canvas.requestRenderAll?.();
      return { ok: true, message: status.textContent ?? "", refined: fresh.length, skipped, flagged, changes };
    } catch (error: unknown) {
      return fail(`Refine failed: ${error instanceof Error ? error.message : String(error)}`);
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
  const renderReviewCounter = (queue = reviewQueue()): void => {
    const current = selectedRects()[0];
    const index = current && queue.length ? queue.findIndex((box) => box.id === ensureAnnotationId(current)) : -1;
    const text = queue.length ? `${index >= 0 ? `${index + 1} / ` : ""}${queue.length} to review` : "0 to review";
    if (reviewCounter.textContent !== text) reviewCounter.textContent = text;
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
    // Approve settles what the current mode reviews: a Refine flag, or a reclassed box (its new class stays).
    selected.forEach((rect) => {
      const id = ensureAnnotationId(rect);
      const entry = reclassMode() ? reclassed.get(id) : records.get(id);
      if (entry) entry.reviewed = true;
    });
    raw.canvas.requestRenderAll?.();
    navigateReview(1);
  };
  /** Approves every box the current mode still has to review. */
  const approveAll = (): void => {
    syncImage();
    const queue = reviewQueue();
    if (!queue.length) { renderReviewCounter(); setStatus("Nothing to review."); return; }
    for (const box of queue) {
      const entry = reclassMode() ? reclassed.get(box.id) : records.get(box.id);
      if (entry) entry.reviewed = true;
    }
    setStatus(`${queue.length} box${queue.length === 1 ? "" : "es"} approved`);
    renderReviewCounter();
    raw.canvas.requestRenderAll?.();
  };

  // ---------------------------------------------------------------- reclass
  const area = (r: RefineRect): number => Math.max(0, r.x1 - r.x0) * Math.max(0, r.y1 - r.y0);
  /**
   * Boxes the reclass rule flags on image. Shrink compares the refined area (computed, not applied) with the size
   * the box was loaded with: loadedBoxes for canvas boxes, the box itself for boxes read from a label file.
   */
  const matchReclass = async (
    image: HTMLImageElement,
    checked: readonly RefineBoxInput[],
    boxes: readonly RefineBoxInput[],
    config: ReturnType<typeof reclassConfig>,
    edge: ReturnType<typeof runConfig>
  ): Promise<ReclassMatch[]> => {
    const targets = checked.filter((box) => ruleApplies(config.rule, box.classId));
    if (!targets.length) return [];
    const areaChange = new Map<string, number | null>();
    if (config.rule.shrink.enabled) {
      const params: Record<string, RefineParams> = {};
      for (const box of targets) params[box.classId] ??= edge.params(box.classId);
      const sent = new Map(targets.map((box) => [box.id, box]));
      for (const result of await getService().refine(image, targets, params, boxes, edge.image)) {
        const base = area(loadedBoxes.get(result.id) ?? sent.get(result.id)!);
        areaChange.set(result.id, base > 0 ? area(result.box) / base - 1 : null);
      }
    }
    // Pixels: one crop around every target, from the image the reclass checks read.
    const union = targets.reduce<RefineRect>((u, b) => ({ x0: Math.min(u.x0, b.x0), y0: Math.min(u.y0, b.y0), x1: Math.max(u.x1, b.x1), y1: Math.max(u.y1, b.y1) }), targets[0]);
    const crop = await getService().crop(image, union, config.image);
    const local = targets.map((box) => ({ id: box.id, classId: box.classId, box: { x0: box.x0 - crop.x0, y0: box.y0 - crop.y0, x1: box.x1 - crop.x0, y1: box.y1 - crop.y0 } }));
    return evaluateReclass(crop, local, [config.rule], areaChange);
  };
  /**
   * Apply (Reclass mode), like Edge's: judges the target boxes with the Reclass-with rule now, changes every match to
   * the rule's class in one undo step and queues the changed boxes for review (N, F, Approve all).
   */
  const reclass = async (targets: RefineBoxInput[], skipManual: boolean, emptyText: string, dryRun = false): Promise<RefineRunOutcome> => {
    const image = syncImage();
    if (!image || !isDetection()) return fail("Open an image in the Detection workflow first.");
    if (busy) return fail("Refine is already running.", "busy");
    if (!targets.length) return fail(emptyText);
    // Busy from the first await on, so a second click cannot start another run.
    setBusy(true);
    try {
      await loadSettings();
      const config = reclassConfig();
      if (!config.rule.mean.enabled && !config.rule.bright.enabled && !config.rule.shrink.enabled) return fail("The reclass rule has no check on.");
      const checked = skipManual ? targets.filter((box) => !manualClass.has(box.id)) : targets;
      const kept = targets.length - checked.length;
      // Boxes the rule checks that already have its class: nothing to change.
      const already = checked.filter((box) => box.classId === config.rule.toClass && ruleChecks(config.rule, box.classId)).length;
      if (!checked.length) return fail("Nothing to reclass: every box had its class changed by hand.");
      const started = performance.now();
      setStatus(`Reclassing ${checked.length} box${checked.length === 1 ? "" : "es"}…`);
      const matches = await matchReclass(image, checked, rects().map(toBox), config, runConfig());
      if (image !== input.state.session.currentImage) return fail("The image changed while reclassing; nothing was applied.");
      // Skip boxes edited while the check ran.
      const now = new Map(rects().map(toBox).map((box) => [box.id, box]));
      const sent = new Map(checked.map((box) => [box.id, box]));
      const fresh = matches.filter((match) => { const box = now.get(match.id); return box && signature(box) === signature(sent.get(match.id)!); });
      const changes = fresh.map((match) => ({ annotationId: match.id, from: sent.get(match.id)!.classId, to: match.toClass }));
      if (dryRun) {
        setStatus(`Preview: ${fresh.length} of ${checked.length} box${checked.length === 1 ? "" : "es"} would become class ${config.rule.toClass} (nothing applied)`);
        return { ok: true, dryRun: true, message: status.textContent ?? "", checked: checked.length, alreadyTargetClass: already, keptHandEdited: kept, changed: changes };
      }
      let changed = 0;
      if (fresh.length) {
        applying = true;
        try {
          changed = raw.updateBoxClasses?.(fresh.map((match) => ({ annotationId: match.id, classId: match.toClass }))) ?? 0;
        } finally {
          applying = false;
        }
      }
      fresh.forEach((match) => { reclassed.set(match.id, { match, from: sent.get(match.id)!.classId, reviewed: false }); manualClass.delete(match.id); });
      const ms = Math.round(performance.now() - started);
      const keptText = (already ? ` · ${already} already class ${config.rule.toClass}` : "") + (kept ? ` · ${kept} hand-edited box${kept === 1 ? "" : "es"} kept` : "");
      setStatus((changed
        ? `${changed} of ${checked.length} box${checked.length === 1 ? "" : "es"} → class ${config.rule.toClass} in ${ms} ms · ${changed} to review`
        : `No box matches the rule (${checked.length} checked) in ${ms} ms`) + keptText);
      if (changed) renderPane(); // the class lists gain the new class
      renderReviewCounter();
      raw.canvas.requestRenderAll?.();
      return {
        ok: true, message: status.textContent ?? "", checked: checked.length, alreadyTargetClass: already, keptHandEdited: kept, changed: changes
      };
    } catch (error: unknown) {
      return fail(`Reclass failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setBusy(false);
    }
  };
  const reclassSkipManual = (): boolean => byId<HTMLInputElement>("refineReclassSkipManualToggle").checked;
  const reclassSelected = (): void => { void reclass(selectedRects().map(toBox), false, "Select boxes to reclass first."); };
  const reclassAll = (): void => { void reclass(visibleRects().map(toBox), reclassSkipManual(), "No boxes to reclass."); };
  const reclassClass = (): void => {
    const classId = byId<HTMLSelectElement>("refineReclassClassSelect").value;
    if (!classId) { setStatus("Choose a class to reclass."); return; }
    void reclass(visibleRects().map(toBox).filter((box) => box.classId === classId), reclassSkipManual(), `No class ${classId} boxes on this image.`);
  };

  // ---------------------------------------------------------------- folder runs (every image's label file)
  /** A class id no label uses: its params are the default every class without its own settings gets. */
  const UNPATCHED_CLASS = "\u0000";
  /**
   * Edge: refines every box of every image with the Run-with settings. Reclass: changes every box the
   * Reclass-with rule matches (shrink against the box as saved). Goes through the label files, one backup.
   */
  const runFolder = async (
    mode: "edge" | "reclass",
    confirm: (message: string) => boolean | Promise<boolean> = (message) => windowRef.confirm(message)
  ): Promise<RefineRunOutcome> => {
    if (busy) return fail("Refine is already running.", "busy");
    if (!isDetection() || !input.state.session.imageFiles.length) return fail("Open an image folder in the Detection workflow first.");
    const files = input.fileSystem;
    if (!files) return fail("Folder runs are not available here.");
    await loadSettings();
    const edge = runConfig();
    const config = reclassConfig();
    if (mode === "reclass" && !config.rule.mean.enabled && !config.rule.bright.enabled && !config.rule.shrink.enabled) return fail("The reclass rule has no check on.");
    const total = input.state.session.imageFiles.length;
    const folderName = input.state.session.labelFolderHandle?.name ?? "label";
    const what = mode === "edge"
      ? `Refine every box in all ${total} images of "${folderName}" with ${edge.label}?`
      : `Reclass boxes in all ${total} images of "${folderName}" with ${config.preset ? refinePresetLabel(config.preset) : "the Lab rule"} (${describeReclassRule(config.rule, className)})?`;
    if (!(await confirm(`${what}\n\nCurrent edits will be saved first. Original label files will be backed up.`))) {
      return { ok: false, message: "The person declined the folder run.", code: "declined" };
    }
    let boxesChanged = 0;
    // Inside transform: the image upload into refine, then the refine / reclass work itself (ms).
    const work = { loadMs: 0, runMs: 0 };
    const transform = async (_file: unknown, yolo: string, image: HTMLImageElement): Promise<string | null> => {
      const width = image.naturalWidth || image.width;
      const height = image.naturalHeight || image.height;
      const { lines, boxes } = labelFileBoxes(yolo, width, height);
      if (!boxes.length) return null;
      let mark = performance.now();
      await getService().load(image);
      work.loadMs += performance.now() - mark;
      mark = performance.now();
      let changed = 0;
      if (mode === "edge") {
        const params: Record<string, RefineParams> = {};
        for (const box of boxes) params[box.classId] ??= edge.params(box.classId);
        const sent = new Map(boxes.map((box) => [box.id, box]));
        const changes = (await getService().refine(image, boxes, params, boxes, edge.image))
          .filter((result) => movedBy(result.box, sent.get(result.id)!, LABEL_FILE_MOVE_EPSILON))
          .map((result) => ({ line: Number(result.id), classId: result.classId, box: result.box }));
        work.runMs += performance.now() - mark;
        boxesChanged += changes.length;
        return applyLabelFileChanges(lines, changes, width, height);
      } else {
        for (const match of await matchReclass(image, boxes, boxes, config, edge)) {
          // Only the class changes; the coordinates keep their text.
          lines[Number(match.id)] = [match.toClass, ...lines[Number(match.id)].trim().split(/\s+/).slice(1)].join(" ");
          changed += 1;
        }
      }
      work.runMs += performance.now() - mark;
      boxesChanged += changed;
      return changed ? lines.join("\n") : null;
    };
    // Desktop app: Rust refines every image it can decode like the page; the rest go through transform.
    const batch = async (images: readonly unknown[], labelNames: readonly string[], onProgress: (done: number) => void, signal: AbortSignal | undefined) => {
      // Classes without their own values (in the class settings or the Run-with preset) use the default.
      // fromEntries makes own keys even for an id like "__proto__", which plain assignment would not.
      const paramsByClass: Record<string, RefineParams> = Object.fromEntries(edge.ownClasses.map((classId) => [classId, edge.params(classId)]));
      const rewrites = await refineFolderNatively({
        images, labelNames, labelFolder: input.state.session.labelFolderHandle, paramsByClass,
        defaultParams: edge.params(UNPATCHED_CLASS), source: edge.image, signal, onProgress
      });
      rewrites?.forEach((rewrite) => { boxesChanged += rewrite?.changed ?? 0; });
      return rewrites;
    };
    setBusy(true);
    setStatus(mode === "edge" ? `Refining all ${total} images…` : `Reclassing all ${total} images…`);
    let outcome: DetectionLabelRewrite | null;
    try {
      outcome = await files.rewriteDetectionLabels({
        title: mode === "edge" ? "Refining every image" : "Reclassing every image",
        backupPrefix: mode === "edge" ? "refine-all" : "reclass-all",
        prepare: (file) => files.decodeImageForAutomation(file),
        transform,
        batch: mode === "edge" ? batch : undefined
      });
    } catch (error: unknown) {
      return fail(`Folder run failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setBusy(false);
    }
    if (!outcome) return fail("Folder run stopped. No files changed.");
    // The current image reloaded from its file: earlier flags and reclass reviews no longer apply.
    records.clear();
    reclassed.clear();
    renderReviewCounter();
    raw.canvas.requestRenderAll?.();
    const skipped = outcome.failures.length
      ? ` · ${outcome.failures.length} image${outcome.failures.length === 1 ? "" : "s"} skipped (${outcome.failures.map((f) => `${f.fileName}: ${f.reason}`).join("; ")})`
      : "";
    const timings = { ...outcome.timings, loadMs: Math.round(work.loadMs), runMs: Math.round(work.runMs) };
    status.dataset.timings = JSON.stringify(timings);
    const s = (ms: number): string => `${(ms / 1000).toFixed(1)} s`;
    // Read + decode overlap the previous image's work; "waited" is what the run still waited for.
    setStatus(`${boxesChanged} box${boxesChanged === 1 ? "" : "es"} ${mode === "edge" ? "refined" : "reclassed"} in ${outcome.changed} of ${outcome.total} images`
      + (outcome.backupPath ? ` · originals in ${outcome.backupPath}` : "") + skipped
      + ` · Time ${s(timings.totalMs)}: ${timings.batchImages ? `native ${timings.batchImages} images ${s(timings.batchMs)}, ` : ""}read+decode ${s(timings.prepareMs)} (waited ${s(timings.waitMs)}), load ${s(timings.loadMs)}, `
      + `${mode === "edge" ? "refine" : "reclass"} ${s(timings.runMs)}, backup ${s(timings.backupMs)}, write ${s(timings.writeMs)}, reload ${s(timings.reloadMs)}`);
    return {
      ok: true, message: status.textContent ?? "", boxesChanged, imagesChanged: outcome.changed, images: outcome.total,
      backupPath: outcome.backupPath, skipped: outcome.failures
    };
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
    const queue = reviewQueue();
    // Undo and redo do not reach the history hook; every render keeps the counter in step with the queue.
    renderReviewCounter(queue);
    if (!byId<HTMLInputElement>("refineShowReviewToggle").checked) return [];
    const selected = new Set(selectedRects().map((rect) => ensureAnnotationId(rect)));
    return queue.map((box) => {
      const result = !reclassMode() && refineFlagged(box) ? records.get(box.id)!.result : undefined;
      const entry = reclassMode() ? reclassed.get(box.id) : undefined;
      const name = entry ? className(entry.match.toClass) : undefined;
      return {
        id: box.id,
        screen: { x0: sx(box.x0), y0: sy(box.y0), x1: sx(box.x1), y1: sy(box.y1) },
        review: result ? { weakSides: result.weakSides, areaChange: result.areaFlagged ? result.areaChange : null } : undefined,
        reclass: entry ? { toClass: entry.match.toClass, label: `${entry.from} → ${entry.match.toClass}${name ? ` ${name}` : ""}` } : undefined,
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
    // A folder opened while the pane is open: show that folder's settings and presets.
    if (paneOpen() && input.state.session.imageFolderHandle !== settingsFolder) void loadSettings();
    const fabricCanvas = raw.canvas;
    const width = Math.max(1, Math.round(fabricCanvas.getWidth()));
    const height = Math.max(1, Math.round(fabricCanvas.getHeight()));
    const context = overlay.getContext("2d");
    if (!context) return;
    const active = isDetection() && input.state.session.currentImage === recordsImage && (records.size > 0 || reclassed.size > 0 || preview.length > 0);
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
        reclassOnCanvas: (ids) => {
          const wanted = new Set(ids);
          void reclass(rects().map(toBox).filter((box) => wanted.has(box.id)), false, "No boxes to reclass.");
        },
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

  // ---------------------------------------------------------------- agent (the pane's actions with explicit targets)
  const scopeBoxes = (scope: RefineScope): RefineBoxInput[] => {
    if (scope === "selected") return selectedRects().map(toBox);
    if (scope === "all") return visibleRects().map(toBox);
    if ("classId" in scope) return visibleRects().map(toBox).filter((box) => box.classId === scope.classId);
    const byId = new Map(rects().map((rect) => [ensureAnnotationId(rect), rect]));
    const missing = scope.annotationIds.filter((id) => !byId.has(id));
    if (missing.length) throw new Error(`No box with annotationId ${missing.slice(0, 5).join(", ")} on the current image.`);
    return scope.annotationIds.map((id) => toBox(byId.get(id)!));
  };
  /** Runs `work` with the agent's presets; a preset name that does not exist is an error. */
  const withPresets = async <T>(edge: string | null | undefined, reclassName: string | null | undefined, work: () => Promise<T>): Promise<T> => {
    await loadSettings();
    if (edge && !allPresets().some((preset) => preset.name === edge)) throw new Error(`No edge preset named "${edge}".`);
    if (reclassName && !allReclassPresets().some((preset) => preset.name === reclassName)) throw new Error(`No reclass preset named "${reclassName}".`);
    edgePresetOverride = edge;
    reclassPresetOverride = reclassName;
    try {
      return await work();
    } finally {
      edgePresetOverride = undefined;
      reclassPresetOverride = undefined;
    }
  };
  /** The pane's keep-hand-edited toggles apply to whole-image and class runs, never to a chosen set (as Selected). */
  const keepFor = (scope: RefineScope, explicit: boolean | undefined, toggle: () => boolean): boolean =>
    explicit ?? (scope === "all" || (typeof scope === "object" && "classId" in scope) ? toggle() : false);
  const agent: RefineAgentApi = {
    async settingsSummary() {
      await loadSettings();
      return {
        mode: settings.mode,
        runWith: settings.activePreset ?? null,
        reclassWith: settings.activeReclassPreset ?? null,
        edgePresets: allPresets().map((preset) => preset.name),
        reclassPresets: allReclassPresets().map((preset) => preset.name),
        classesWithOwnSettings: Object.keys(settings.classes),
        imageSource: settings.imageSource,
        reclassRule: describeReclassRule(reclassConfig().rule, className),
        keepHandEdited: skipManualToggle().checked,
        keepHandRelabelled: reclassSkipManual()
      };
    },
    refine: (scope, options) => withPresets(options.preset, undefined,
      () => run(scopeBoxes(scope), keepFor(scope, options.keepHandEdited, () => skipManualToggle().checked), options.dryRun)),
    reclass: (scope, options) => withPresets(undefined, options.preset,
      () => reclass(scopeBoxes(scope), keepFor(scope, options.keepHandEdited, reclassSkipManual), "No boxes to reclass.", options.dryRun)),
    reviewQueue(mode = settings.mode) {
      syncImage();
      return {
        mode,
        boxes: reviewQueue(mode).map((box) => {
          const position = { annotationId: box.id, classId: box.classId, x0: box.x0, y0: box.y0, x1: box.x1, y1: box.y1 };
          if (mode === "reclass") {
            const entry = reclassed.get(box.id);
            return { ...position, from: entry?.from ?? null, to: entry?.match.toClass ?? null };
          }
          const result = records.get(box.id)?.result;
          return { ...position, weakSides: result?.weakSides ?? [], areaChange: result?.areaChange ?? null, areaFlagged: result?.areaFlagged ?? false, sizeLimited: result?.sizeLimited ?? false };
        })
      };
    },
    approve(ids, mode = settings.mode) {
      syncImage();
      const queue = reviewQueue(mode);
      const targets = ids === "all" ? queue.map((box) => box.id) : ids.filter((id) => queue.some((box) => box.id === id));
      for (const id of targets) {
        const entry = mode === "reclass" ? reclassed.get(id) : records.get(id);
        if (entry) entry.reviewed = true;
      }
      renderReviewCounter();
      raw.canvas.requestRenderAll?.();
      return { approved: targets.length, remaining: reviewQueue(mode).length };
    },
    runFolder: (mode, options) => withPresets(mode === "edge" ? options.preset : undefined, mode === "reclass" ? options.preset : undefined,
      () => runFolder(mode, options.confirm))
  };

  const runShortcut = (action: RefineShortcut): void => {
    if (!isDetection()) return;
    switch (action) {
      case "toggle": input.uiManager.setInspectorTab(paneOpen() ? "annotation" : "refine"); break;
      // E / Shift+E press the Apply buttons of the mode shown: Refine in Edge mode, Reclass in Reclass mode.
      case "refineSelected": if (reclassMode()) reclassSelected(); else refineSelected(); break;
      case "refineAll": if (reclassMode()) reclassAll(); else refineAll(); break;
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
        void changeLoadedSettings((current) => ({ ...current, activePreset: name || null }));
        setStatus(name ? `Refining with ${name} for every class.` : "Refining with class settings.");
      });
      byId("refineReclassPresetSelect").addEventListener("change", (event) => {
        const name = (event.target as HTMLSelectElement).value;
        void changeLoadedSettings((current) => ({ ...current, activeReclassPreset: name || null }));
        setStatus(name ? `Reclassing with ${name}.` : "Reclassing with the Lab rule.");
      });
      byId("refineModeToggle").addEventListener("click", (event) => {
        const mode = (event.target as HTMLElement).closest<HTMLElement>("[data-mode]")?.dataset.mode;
        if (mode === "edge" || mode === "reclass") void changeLoadedSettings((current) => (mode === current.mode ? current : { ...current, mode }));
      });
      byId("refineSelectedBtn").addEventListener("click", refineSelected);
      byId("refineClassesBtn").addEventListener("click", refineClasses);
      byId("refineAllBtn").addEventListener("click", refineAll);
      byId("refinePrevReviewBtn").addEventListener("click", () => navigateReview(-1));
      byId("refineNextReviewBtn").addEventListener("click", () => navigateReview(1));
      byId("refineApproveBtn").addEventListener("click", approve);
      byId("refineApproveAllBtn").addEventListener("click", approveAll);
      byId("refineShowReviewToggle").addEventListener("change", drawOverlay);
      byId("refineReclassSelectedBtn").addEventListener("click", reclassSelected);
      byId("refineReclassAllBtn").addEventListener("click", reclassAll);
      byId("refineReclassClassBtn").addEventListener("click", reclassClass);
      byId("refineFolderBtn").addEventListener("click", () => { void runFolder("edge"); });
      byId("refineReclassFolderBtn").addEventListener("click", () => { void runFolder("reclass"); });
      byId("openRefineLabBtn").addEventListener("click", openLab);
      byId("taskRefineBtn").addEventListener("click", () => runShortcut("toggle"));
      byId("inspectorRefineTabBtn").addEventListener("click", () => input.uiManager.setInspectorTab("refine"));

      const canvas = raw.canvas;
      canvas.on?.("after:render", drawOverlay);
      const onSelection = (): void => {
        if (records.size || reclassed.size) renderReviewCounter();
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
            // A hand class change settles a reclassed box and keeps it out of later class / all-box reclass runs.
            if (prior.labelClass !== after.labelClass) { reclassed.delete(after.annotationId); manualClass.add(after.annotationId); }
          }
        }
        before.forEach((_, id) => { records.delete(id); manual.delete(id); reclassed.delete(id); manualClass.delete(id); });
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
    runShortcut,
    agent
  };
}
