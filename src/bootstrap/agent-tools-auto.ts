/**
 * Agent tools for template matching presets and YOLO inference (stage 4 of docs/AGENT_MCP_PLAN_KO.md, section 4.4).
 * They run what the Automation and Inference panels run (AutomationAgentApi, InferenceAgentApi).
 */
import type { AppState } from "../app/state.js";
import { hasDirtyDocuments } from "../app/document-status.js";
import { AgentToolError, listPage, optionalArg, type AgentTool } from "../features/agent/agent-api.js";
import { getRectBounds } from "../features/canvas/arrange.js";
import { ensureAnnotationId, isRectObject } from "../features/canvas/fabric-types.js";
import { checkBox, checkClassId, rectsWhere, whereArg, whereBox, type PixelBox } from "./agent-tools-edit.js";
import type { AutomationAgentApi, SimilarSearch } from "./automation-controller.js";
import { bestMargin, summarizeScores } from "../domain/automation/match-scores.js";
import type { RuntimeCanvasController } from "./canvas-controller-adapter.js";
import type { InferenceAgentApi } from "./inference-controller.js";
import type { LabelFilePlan, RuntimeFileSystem } from "./file-system-adapter.js";
import { evenSample } from "../domain/refine/folder-summary.js";
import { parseYoloRows } from "../domain/yolo/yolo.js";
import { mergeDetectionLabels, serializeAutomationBoxes, type GeneratedDetectionBox } from "../features/automation/batch-labels.js";
import { intersectionOverUnion } from "../features/automation/matching-candidates.js";

export interface AgentAutoToolDeps {
  state: AppState;
  canvasController: RuntimeCanvasController;
  automation(): AutomationAgentApi | null;
  inference(): InferenceAgentApi | null;
  /** The file a load_model entry names (Rust checked it is an existing .onnx file). */
  file(entry: { path: string; name: string; directory: boolean }): { getFile(): Promise<File> };
  /** The person's answer in a native dialog. */
  confirm(message: string): Promise<boolean>;
  afterEdit(): void;
  /** Folder runs: previewed label texts become a plan that is written with a backup (optional in unit tests). */
  fileSystem?: Pick<RuntimeFileSystem, "planDetectionLabelWrites" | "commitLabelFilePlan" | "readDetectionLabels" | "decodeImageForAutomation" | "saveLabels">;
}

/** A model detection offered as a box: classId after classMap, the model's own class kept beside it. */
interface DetectionCandidate { index: number; classId: string; modelClassId: string; confidence: number; x0: number; y0: number; x1: number; y1: number }

/** copy_boxes (and detect_boxes) leave out a box overlapping one already on the image at this IoU or more. */
const COPY_OVERLAP_IOU = 0.5;
/** Folder template runs kept for applying by resultId. */
const FOLDER_RUNS_KEPT = 5;
let folderRunCount = 0;

/** Template sides find_similar accepts: below this OpenCV finds noise, above it a match is the whole image. */
const SIMILAR_SIDE = { min: 4, max: 1024 };
const LISTED_CANDIDATES = 100;

/** Panel errors as agent errors: a missing preset is not_found, a busy panel busy, the rest failed. */
async function panelErrors<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work();
  } catch (error) {
    if (error instanceof AgentToolError) throw error;
    const message = error instanceof Error ? error.message : String(error);
    if (/^No (automation preset|layout) named|^No box with/.test(message)) throw new AgentToolError("not_found", message);
    if (/already exists$|^Select at least one box|has no boxes to save$|agents may not change it|^anchorOffset is required|needs boxes\.classId|needs a layout|lies outside|^minScore must|^Maximum detections|^NMS IoU|^Detection padding|^Blur kernel/.test(message)) {
      throw new AgentToolError("invalid_args", message);
    }
    if (/is busy\.$/.test(message)) throw new AgentToolError("busy", message);
    throw new AgentToolError("failed", message);
  }
}

function unitArg(args: Record<string, unknown>, name: string): number | undefined {
  const value = optionalArg(args, name, "number");
  if (value !== undefined && (value < 0 || value > 1)) throw new AgentToolError("invalid_args", `${name} must be between 0 and 1.`);
  return value;
}

/** find_similar's matching settings beyond Template Matching Setup's defaults (absent ones keep the defaults). */
export function similarSettings(args: Record<string, unknown>, size: { width: number; height: number }): Pick<SimilarSearch, "blurKernelSize" | "mode" | "searchRoi" | "nmsIou" | "paddingX" | "paddingY"> {
  const settings: Pick<SimilarSearch, "blurKernelSize" | "mode" | "searchRoi" | "nmsIou" | "paddingX" | "paddingY"> = {};
  const blur = optionalArg(args, "blur", "number");
  if (blur !== undefined) {
    if (!Number.isInteger(blur) || blur < 0 || blur > 99 || (blur > 0 && blur % 2 === 0)) throw new AgentToolError("invalid_args", "blur must be 0 (off) or an odd kernel size from 1 to 99.");
    settings.blurKernelSize = blur;
  }
  const mode = optionalArg(args, "mode", "string");
  if (mode !== undefined) {
    if (mode !== "accurate" && mode !== "fast") throw new AgentToolError("invalid_args", "mode must be accurate or fast.");
    settings.mode = mode;
  }
  const nmsIou = unitArg(args, "nmsIou");
  if (nmsIou !== undefined) settings.nmsIou = nmsIou;
  for (const key of ["paddingX", "paddingY"] as const) {
    const value = optionalArg(args, key, "number");
    if (value === undefined) continue;
    if (value < 0 || value > 256) throw new AgentToolError("invalid_args", `${key} must be 0 to 256 pixels.`);
    settings[key] = value;
  }
  const searchRegion = optionalArg(args, "searchRegion", "object") as PixelBox | undefined;
  if (searchRegion !== undefined) {
    const box = checkBox(searchRegion, size, "searchRegion");
    settings.searchRoi = { x: Math.round(box.x0), y: Math.round(box.y0), width: Math.round(box.x1 - box.x0), height: Math.round(box.y1 - box.y0) };
  }
  return settings;
}

export function createAgentAutoTools(deps: AgentAutoToolDeps): Record<string, AgentTool> {
  const { state } = deps;
  const folderRuns = new Map<string, { plan: LabelFilePlan; preset: string; boxes: number }>();
  const copyRuns = new Map<string, { plan: LabelFilePlan; boxes: number }>();
  const detectionPreviews = new Map<string, { image: string; candidates: DetectionCandidate[] }>();
  /** Folder dry runs read saved label files: the current image's edits are saved first (as refine_folder's dry run does). */
  const saveCurrentFirst = async (): Promise<void> => {
    if (hasDirtyDocuments(state)) await deps.fileSystem!.saveLabels(true);
  };
  /** Writes a previewed plan after the person allows it (backup first, refused if a file changed since). */
  const commitPlan = async (plan: LabelFilePlan, what: string, signal: AbortSignal): Promise<string> => {
    if (!(await deps.confirm(`${what} in ${plan.edits.length} label files in "${plan.folder.name}", exactly as the dry run showed?\n\nCurrent edits will be saved first. Original label files will be backed up.`))) {
      throw new AgentToolError("declined", "The person declined the folder run.");
    }
    const backupPath = await deps.fileSystem!.commitLabelFilePlan(plan, signal);
    if (!backupPath) throw new AgentToolError("cancelled", "Stopped. No files changed.");
    deps.afterEdit();
    return backupPath;
  };
  const requireDetectionImage = (): void => {
    if (state.session.workflow !== "detection") throw new AgentToolError("failed", "The app is in Segmentation; switch it to Detection.");
    if (!state.session.imageFolderHandle) throw new AgentToolError("no_folder", "No folder is open. Use open_folder first.");
    if (!state.session.currentImageFile) throw new AgentToolError("no_image", "No image is shown. Use go_to_image first.");
  };
  const automation = (): AutomationAgentApi => {
    const api = deps.automation();
    if (!api) throw new AgentToolError("failed", "Template automation is not available in this window.");
    return api;
  };
  const inference = (): InferenceAgentApi => {
    const api = deps.inference();
    if (!api) throw new AgentToolError("failed", "Inference is not available in this window.");
    return api;
  };

  const imageSize = (): { width: number; height: number } => {
    requireDetectionImage();
    const image = state.session.currentImage;
    if (!image) throw new AgentToolError("no_image", "No image is shown. Use go_to_image first.");
    return { width: image.width, height: image.height };
  };
  const boxById = (id: string): { classId: string; box: PixelBox } => {
    const rect = deps.canvasController.raw.getObjects("rect").filter(isRectObject).find((candidate) => ensureAnnotationId(candidate) === id);
    if (!rect) throw new AgentToolError("not_found", `No box with annotationId ${id} on the current image.`);
    rect.setCoords();
    const bounds = getRectBounds(rect);
    return { classId: String(rect.labelClass ?? "0"), box: { x0: bounds.left, y0: bounds.top, x1: bounds.right, y1: bounds.bottom } };
  };

  return {
    find_similar: {
      changesApp: true,
      async run(args) {
        const size = imageSize();
        const id = optionalArg(args, "annotationId", "string");
        const region = optionalArg(args, "region", "object") as PixelBox | undefined;
        const templateImage = optionalArg(args, "templateImage", "string");
        if ((id === undefined) === (region === undefined)) throw new AgentToolError("invalid_args", "Give annotationId or region (one of them).");
        if (templateImage !== undefined && id !== undefined) throw new AgentToolError("invalid_args", "templateImage takes a region (in that image's pixels), not an annotationId.");
        if (templateImage !== undefined && !state.session.imageFiles.some((file) => file.name === templateImage)) throw new AgentToolError("not_found", `No image named ${templateImage} in the open folder.`);
        // A region on another image is checked against that image when it is decoded.
        const source = id !== undefined ? boxById(id)
          : { classId: undefined, box: templateImage !== undefined ? checkBox(region!, { width: Number.MAX_SAFE_INTEGER, height: Number.MAX_SAFE_INTEGER }, "region") : checkBox(region!, size, "region") };
        const roi = {
          x: Math.round(source.box.x0), y: Math.round(source.box.y0),
          width: Math.round(source.box.x1 - source.box.x0), height: Math.round(source.box.y1 - source.box.y0)
        };
        if (Math.min(roi.width, roi.height) < SIMILAR_SIDE.min || Math.max(roi.width, roi.height) > SIMILAR_SIDE.max) {
          throw new AgentToolError("invalid_args", `The template must be ${SIMILAR_SIDE.min} to ${SIMILAR_SIDE.max} px on each side.`);
        }
        const classArg = args.classId ?? source.classId;
        if (classArg === undefined || classArg === null) throw new AgentToolError("invalid_args", "classId is required with region.");
        const minimumScore = unitArg(args, "minScore") ?? 0.8;
        const maximumDetections = Math.min(5000, Math.max(1, Math.floor(optionalArg(args, "maxMatches", "number") ?? 2000)));
        const apply = optionalArg(args, "apply", "boolean") ?? false;
        const settings = similarSettings(args, size);
        const expected = optionalArg(args, "expected", "number");
        const api = automation();
        const outcome = await panelErrors(() => api.findSimilar({
          roi, classId: checkClassId(classArg, "find_similar"), minimumScore, maximumDetections,
          skipOverlapping: optionalArg(args, "skipOverlapping", "boolean") ?? true, apply,
          ...(templateImage !== undefined ? { templateImage } : {}), ...settings
        }));
        if (outcome.applied) deps.afterEdit();
        const page = listPage(outcome.candidates, args, LISTED_CANDIDATES);
        return {
          ...outcome, template: { ...roi, image: templateImage ?? state.session.currentImageFile?.name ?? null },
          settings: { minScore: minimumScore, blur: settings.blurKernelSize ?? 13, mode: settings.mode ?? "accurate", nmsIou: settings.nmsIou ?? 0.3,
            paddingX: settings.paddingX ?? 0, paddingY: settings.paddingY ?? 0, searchRegion: args.searchRegion ?? null },
          scores: summarizeScores(outcome.candidates.map((candidate) => candidate.score), expected !== undefined ? { expected } : {}),
          found: page.total, candidates: page.items, offset: page.offset, truncated: page.truncated
        };
      }
    },
    apply_layout: {
      changesApp: true,
      async run(args) {
        imageSize();
        const name = optionalArg(args, "layout", "string");
        if (!name) throw new AgentToolError("invalid_args", "layout is required (see list_templates).");
        const x = optionalArg(args, "x", "number");
        const y = optionalArg(args, "y", "number");
        if ((x === undefined) !== (y === undefined)) throw new AgentToolError("invalid_args", "Give both x and y, or neither.");
        const api = automation();
        const result = await panelErrors(async () => api.applyLayout(name, {
          anchor: x === undefined ? undefined : { x, y: y! },
          replaceExisting: optionalArg(args, "replaceExisting", "boolean") ?? false
        }));
        deps.afterEdit();
        const page = listPage(result.annotationIds, args, 500);
        return { ...result, applied: page.total, annotationIds: page.items, truncated: page.truncated };
      }
    },
    save_layout: {
      changesApp: true,
      async run(args) {
        imageSize();
        const name = optionalArg(args, "name", "string");
        if (!name?.trim()) throw new AgentToolError("invalid_args", "name is required.");
        const scope = optionalArg(args, "scope", "string") ?? "selected";
        if (scope !== "selected" && scope !== "all") throw new AgentToolError("invalid_args", "scope must be selected or all.");
        const boxes = Array.isArray(args.annotationIds) ? args.annotationIds.map(String) : scope;
        const api = automation();
        return panelErrors(() => api.saveLayout(name, { boxes, overwrite: optionalArg(args, "overwrite", "boolean") ?? false }));
      }
    },
    list_templates: {
      changesApp: false,
      async run(args) {
        const preset = optionalArg(args, "preset", "string");
        const layout = optionalArg(args, "layout", "string");
        if (preset === undefined && layout === undefined) return automation().library();
        const api = automation();
        return panelErrors(async () => ({
          ...(preset !== undefined ? { preset: api.presetDetails(preset) } : {}),
          ...(layout !== undefined ? (() => {
            const details = api.layoutDetails(layout);
            const page = listPage(details.boxes, args, 500);
            return { layout: { ...details, boxes: page.items, boxCount: page.total, truncated: page.truncated } };
          })() : {})
        }));
      }
    },
    save_template_preset: {
      changesApp: true,
      async run(args) {
        const size = imageSize();
        const name = optionalArg(args, "name", "string");
        if (!name?.trim()) throw new AgentToolError("invalid_args", "name is required.");
        const outputMode = optionalArg(args, "outputMode", "string");
        if (outputMode !== "layout" && outputMode !== "boxes") throw new AgentToolError("invalid_args", "outputMode must be \"layout\" (place a saved layout on the best match) or \"boxes\" (a box per match).");
        const templateImage = optionalArg(args, "templateImage", "string");
        if (templateImage !== undefined && !state.session.imageFiles.some((file) => file.name === templateImage)) throw new AgentToolError("not_found", `No image named ${templateImage} in the open folder.`);
        const id = optionalArg(args, "annotationId", "string");
        const region = optionalArg(args, "region", "object") as PixelBox | undefined;
        if ((id === undefined) === (region === undefined)) throw new AgentToolError("invalid_args", "Give the template as annotationId or region (one of them).");
        if (templateImage !== undefined && id !== undefined) throw new AgentToolError("invalid_args", "templateImage takes a region (in that image's pixels), not an annotationId.");
        const box = id !== undefined ? boxById(id).box
          : templateImage !== undefined ? checkBox(region!, { width: Number.MAX_SAFE_INTEGER, height: Number.MAX_SAFE_INTEGER }, "region") : checkBox(region!, size, "region");
        const roi = { x: Math.round(box.x0), y: Math.round(box.y0), width: Math.round(box.x1 - box.x0), height: Math.round(box.y1 - box.y0) };
        if (Math.min(roi.width, roi.height) < SIMILAR_SIDE.min || Math.max(roi.width, roi.height) > SIMILAR_SIDE.max) {
          throw new AgentToolError("invalid_args", `The template must be ${SIMILAR_SIDE.min} to ${SIMILAR_SIDE.max} px on each side.`);
        }
        const point = (value: unknown, label: string) => {
          if (value == null) return undefined;
          const { x, y } = value as { x?: unknown; y?: unknown };
          if (typeof x !== "number" || typeof y !== "number" || !Number.isFinite(x) || !Number.isFinite(y)) throw new AgentToolError("invalid_args", `${label} must be {x, y} in pixels.`);
          return { x, y };
        };
        const matchingArgs = (args.matching ?? {}) as Record<string, unknown>;
        const settings = similarSettings({ ...matchingArgs, ...(args.preprocessing as object ?? {}), ...(args.boxes as object ?? {}) }, size);
        const minScore = unitArg(matchingArgs, "minScore");
        const boxesArgs = (args.boxes ?? {}) as Record<string, unknown>;
        const maxMatches = optionalArg(boxesArgs, "maxMatches", "number");
        const existingLabels = optionalArg(args, "existingLabels", "string");
        if (existingLabels !== undefined && !["skip", "append", "replace"].includes(existingLabels)) throw new AgentToolError("invalid_args", "existingLabels must be skip, append or replace.");
        const preprocessingArgs = (args.preprocessing ?? {}) as Record<string, unknown>;
        const grayscale = optionalArg(preprocessingArgs, "grayscale", "boolean");
        const api = automation();
        return panelErrors(() => api.savePreset({
          name, roi, outputMode: outputMode === "layout" ? "layout-best-match" : "multiple-detection-boxes",
          ...(templateImage !== undefined ? { templateImage } : {}),
          layout: optionalArg(args, "layout", "string") ?? null,
          anchorOffset: point(args.anchorOffset, "anchorOffset") ?? null,
          ...(point(args.finalAdjustment, "finalAdjustment") ? { finalAdjustment: point(args.finalAdjustment, "finalAdjustment")! } : {}),
          matching: {
            ...(minScore !== undefined ? { minimumScore: minScore } : {}),
            ...(settings.mode ? { mode: settings.mode } : {}),
            ...(settings.searchRoi ? { searchRoi: settings.searchRoi } : {})
          },
          boxes: {
            ...(boxesArgs.classId != null ? { classId: checkClassId(boxesArgs.classId, "boxes") } : {}),
            ...(maxMatches !== undefined ? { maximumDetections: Math.floor(maxMatches) } : {}),
            ...(settings.nmsIou !== undefined ? { nmsIouThreshold: settings.nmsIou } : {}),
            ...(settings.paddingX !== undefined ? { paddingX: settings.paddingX } : {}),
            ...(settings.paddingY !== undefined ? { paddingY: settings.paddingY } : {}),
            ...(typeof boxesArgs.strictNonOverlap === "boolean" ? { strictNonOverlap: boxesArgs.strictNonOverlap } : {})
          },
          preprocessing: {
            ...(settings.blurKernelSize !== undefined ? settings.blurKernelSize > 0 ? { gaussianBlurEnabled: true, blurKernelSize: settings.blurKernelSize } : { gaussianBlurEnabled: false } : {}),
            ...(grayscale !== undefined ? { grayscale } : {})
          },
          ...(existingLabels !== undefined ? { existingLabels: existingLabels as "skip" | "append" | "replace" } : {}),
          overwrite: optionalArg(args, "overwrite", "boolean") ?? false
        }));
      }
    },
    run_template_matching: {
      changesApp: true,
      async run(args) {
        requireDetectionImage();
        const preset = optionalArg(args, "preset", "string");
        if (!preset) throw new AgentToolError("invalid_args", "preset is required (see list_templates).");
        const apply = optionalArg(args, "apply", "boolean") ?? false;
        const api = automation();
        const outcome = await panelErrors(() => api.runPreset(preset, { apply }));
        if (outcome.applied) deps.afterEdit();
        // Numbers to judge a preview by: how far the match stands out (layout), or the score spread (boxes).
        if (outcome.match) return { ...outcome, distinctiveness: bestMargin(outcome.match.score, outcome.match.secondScore) };
        if (outcome.candidates) {
          const expected = optionalArg(args, "expected", "number");
          const page = listPage(outcome.candidates, args, LISTED_CANDIDATES);
          return {
            ...outcome, scores: summarizeScores(outcome.candidates.map((candidate) => candidate.score), expected !== undefined ? { expected } : {}),
            found: page.total, candidates: page.items, offset: page.offset, truncated: page.truncated
          };
        }
        return outcome;
      }
    },
    run_template_matching_folder: {
      changesApp: true,
      async run(args, context) {
        requireDetectionImage();
        const files = deps.fileSystem;
        if (!files) throw new AgentToolError("failed", "Folder runs are not available in this window.");
        const write = async (entry: { plan: LabelFilePlan; preset: string; boxes: number }, resultId: string | null) => {
          if (!entry.plan.edits.length) return { applied: false, files: 0, message: "No label file would change; nothing to write." };
          const backupPath = await commitPlan(entry.plan, `Write the "${entry.preset}" template matches`, context.signal);
          if (resultId) folderRuns.delete(resultId);
          return { applied: true, preset: entry.preset, files: entry.plan.edits.length, boxes: entry.boxes, backupPath };
        };
        const resultId = optionalArg(args, "resultId", "string");
        if (resultId !== undefined) {
          const entry = folderRuns.get(resultId);
          if (!entry) throw new AgentToolError("not_found", `No run_template_matching_folder dry run ${resultId} (the last ${FOLDER_RUNS_KEPT} are kept). Run the dry run again.`);
          return write(entry, resultId);
        }
        const preset = optionalArg(args, "preset", "string");
        if (!preset) throw new AgentToolError("invalid_args", "preset is required (see list_templates).");
        const dryRun = optionalArg(args, "dryRun", "boolean") ?? true;
        const all = state.session.imageFiles;
        let chosen = all;
        if (Array.isArray(args.images)) {
          const names = args.images.map(String);
          const missing = names.filter((name) => !all.some((file) => file.name === name));
          if (missing.length) throw new AgentToolError("not_found", `No image named ${missing.slice(0, 5).join(", ")} in the open folder.`);
          chosen = names.map((name) => all.find((file) => file.name === name)!);
        } else {
          const sample = optionalArg(args, "sample", "number");
          if (sample !== undefined) {
            if (!Number.isInteger(sample) || sample < 1) throw new AgentToolError("invalid_args", "sample must be a whole number of images, 1 or more.");
            chosen = evenSample(all.length, sample).map((index) => all[index]!);
          }
        }
        if (!dryRun && chosen !== all) throw new AgentToolError("invalid_args", "images and sample are for dry runs; apply one with its resultId.");
        await saveCurrentFirst();
        const signal = context.signal;
        signal.addEventListener("abort", () => (globalThis.document?.getElementById("cancelActiveOperationBtn") as HTMLButtonElement | null)?.click(), { once: true });
        const outcome = await panelErrors(() => automation().presetFolderDryRun(preset, chosen as never));
        const plan = await panelErrors(() => files.planDetectionLabelWrites(outcome.texts, "template-batch"));
        const items = outcome.summary.items;
        const boxes = items.reduce((sum, item) => sum + (item.state === "success" ? item.matchCount ?? 0 : 0), 0);
        const entry = { plan, preset, boxes };
        if (!dryRun) return write(entry, null);
        const id = `template-folder-${++folderRunCount}`;
        folderRuns.set(id, entry);
        if (folderRuns.size > FOLDER_RUNS_KEPT) folderRuns.delete(folderRuns.keys().next().value!);
        // Images that need a look first: failures, then no match, then the weakest matches.
        const rank = { failed: 0, "no-match": 1, skipped: 3, success: 2 } as const;
        const ordered = [...items].sort((a, b) => rank[a.state] - rank[b.state] || (a.score ?? 1) - (b.score ?? 1));
        const page = listPage(ordered.map((item) => ({
          image: item.fileName, state: item.state, score: item.score === null ? null : Math.round(item.score * 10000) / 10000,
          boxes: item.matchCount ?? 0, ...(item.reason ? { reason: item.reason } : {})
        })), args, 50);
        return {
          dryRun: true, resultId: id, preset,
          images: outcome.summary.total, matched: outcome.summary.success, noMatch: outcome.summary.noMatch, failed: outcome.summary.failed, skipped: outcome.summary.skipped,
          boxes, filesToWrite: plan.edits.length,
          scores: summarizeScores(items.filter((item) => item.state === "success" && item.score !== null).map((item) => item.score!)),
          perImage: page.items, perImageTotal: page.total, truncated: page.truncated
        };
      }
    },
    copy_boxes: {
      changesApp: true,
      async run(args, context) {
        imageSize();
        const files = deps.fileSystem;
        if (!files) throw new AgentToolError("failed", "Folder runs are not available in this window.");
        const resultId = optionalArg(args, "resultId", "string");
        if (resultId !== undefined) {
          const entry = copyRuns.get(resultId);
          if (!entry) throw new AgentToolError("not_found", `No copy_boxes dry run ${resultId} (the last ${FOLDER_RUNS_KEPT} are kept). Run the dry run again.`);
          if (!entry.plan.edits.length) return { applied: false, files: 0, message: "No label file would change; nothing to write." };
          const backupPath = await commitPlan(entry.plan, `Copy ${entry.boxes} boxes`, context.signal);
          copyRuns.delete(resultId);
          return { applied: true, files: entry.plan.edits.length, boxes: entry.boxes, backupPath };
        }
        if (!Array.isArray(args.images) || !args.images.length) throw new AgentToolError("invalid_args", "images: the image file names to copy the boxes to.");
        const current = state.session.currentImageFile!.name;
        const names = [...new Set(args.images.map(String))].filter((name) => name !== current);
        const missing = names.filter((name) => !state.session.imageFiles.some((file) => file.name === name));
        if (missing.length) throw new AgentToolError("not_found", `No image named ${missing.slice(0, 5).join(", ")} in the open folder.`);
        const all = deps.canvasController.raw.getObjects("rect").filter(isRectObject);
        const where = whereArg(args);
        const source = (where ? rectsWhere(all, where) : all).map(whereBox);
        if (!source.length) throw new AgentToolError("invalid_args", "No boxes to copy on the current image.");
        const offset = (args.offset ?? {}) as { dx?: unknown; dy?: unknown };
        const dx = typeof offset.dx === "number" && Number.isFinite(offset.dx) ? offset.dx : 0;
        const dy = typeof offset.dy === "number" && Number.isFinite(offset.dy) ? offset.dy : 0;
        const existing = optionalArg(args, "existing", "string") ?? "append";
        if (existing !== "append" && existing !== "replace") throw new AgentToolError("invalid_args", "existing must be append or replace.");
        const skipOverlapping = optionalArg(args, "skipOverlapping", "boolean") ?? true;
        await saveCurrentFirst();
        const texts: Array<{ image: string; text: string }> = [];
        const perImage: Array<{ image: string; copied: number; skippedOverlapping: number; outsideImage: number }> = [];
        for (const [done, name] of names.entries()) {
          if (context.signal.aborted) throw new AgentToolError("cancelled", "Cancelled. No files changed.");
          context.progress(done, names.length, name);
          const file = state.session.imageFiles.find((candidate) => candidate.name === name)!;
          // ponytail: decodes each target only for its size; read sizes from file headers if large TIFF folders make this slow.
          const image = await files.decodeImageForAutomation(file as never);
          const decoded = { width: image.naturalWidth || image.width, height: image.naturalHeight || image.height };
          const existingText = await files.readDetectionLabels(name);
          const existingBoxes = existing === "append" ? parseYoloRows(existingText, decoded.width, decoded.height)
            .map((row) => ({ score: 1, x: row.rectLeft, y: row.rectTop, width: row.rectWidth, height: row.rectHeight })) : [];
          let skipped = 0;
          let outside = 0;
          const generated: GeneratedDetectionBox[] = [];
          for (const box of source) {
            const x0 = Math.max(0, box.x0 + dx);
            const y0 = Math.max(0, box.y0 + dy);
            const x1 = Math.min(decoded.width, box.x1 + dx);
            const y1 = Math.min(decoded.height, box.y1 + dy);
            if (x1 - x0 < 1 || y1 - y0 < 1) { outside += 1; continue; }
            const candidate = { classId: box.classId, score: 1, x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
            if (skipOverlapping && existingBoxes.some((other) => intersectionOverUnion(candidate, other) >= COPY_OVERLAP_IOU)) { skipped += 1; continue; }
            generated.push(candidate);
          }
          texts.push({ image: name, text: mergeDetectionLabels(existingText, serializeAutomationBoxes(generated, decoded), existing) });
          perImage.push({ image: name, copied: generated.length, skippedOverlapping: skipped, outsideImage: outside });
        }
        const plan = await panelErrors(() => files.planDetectionLabelWrites(texts, "copy-boxes"));
        const boxes = perImage.reduce((sum, image) => sum + image.copied, 0);
        if (optionalArg(args, "dryRun", "boolean") === false) {
          if (!plan.edits.length) return { applied: false, files: 0, message: "No label file would change; nothing to write." };
          return { applied: true, files: plan.edits.length, boxes, backupPath: await commitPlan(plan, `Copy ${boxes} boxes`, context.signal) };
        }
        const id = `copy-${++folderRunCount}`;
        copyRuns.set(id, { plan, boxes });
        if (copyRuns.size > FOLDER_RUNS_KEPT) copyRuns.delete(copyRuns.keys().next().value!);
        // offset is the shift of the boxes here, so the image list pages with offsetImages.
        const page = listPage(perImage, { limit: args.limit, offset: args.offsetImages }, 100);
        return { dryRun: true, resultId: id, sourceBoxes: source.length, images: names.length, boxes, filesToWrite: plan.edits.length, perImage: page.items, truncated: page.truncated };
      }
    },
    detect_boxes: {
      changesApp: true,
      async run(args) {
        imageSize();
        const image = state.session.currentImageFile!.name;
        const existingBoxes = () => deps.canvasController.raw.getObjects("rect").filter(isRectObject).map((rect) => {
          const box = whereBox(rect);
          return { score: 1, x: box.x0, y: box.y0, width: box.x1 - box.x0, height: box.y1 - box.y0 };
        });
        const applyCandidates = (chosen: DetectionCandidate[]) => {
          if (!chosen.length) return { applied: true, annotationIds: [], added: 0 };
          const application = deps.canvasController.raw.applyDetectionBoxes(chosen.map((candidate) => ({
            classId: candidate.classId, x: candidate.x0, y: candidate.y0, width: candidate.x1 - candidate.x0, height: candidate.y1 - candidate.y0
          })), { replaceExisting: false });
          deps.afterEdit();
          return { applied: true, annotationIds: application.annotationIds, added: application.annotationIds.length, discardedOutOfBounds: application.discardedOutOfBoundsCount };
        };
        const resultId = optionalArg(args, "resultId", "string");
        if (resultId !== undefined) {
          const preview = detectionPreviews.get(resultId);
          if (!preview) throw new AgentToolError("not_found", `No detect_boxes preview ${resultId} (the last ${FOLDER_RUNS_KEPT} are kept).`);
          if (preview.image !== image) throw new AgentToolError("invalid_args", `Preview ${resultId} was for ${preview.image}; run it again on this image.`);
          const accept = Array.isArray(args.accept) ? new Set(args.accept.map(Number)) : null;
          const chosen = preview.candidates.filter((candidate) => !accept || accept.has(candidate.index));
          detectionPreviews.delete(resultId);
          return applyCandidates(chosen);
        }
        const classMap = new Map<string, string>();
        if (args.classMap != null) {
          if (typeof args.classMap !== "object" || Array.isArray(args.classMap)) throw new AgentToolError("invalid_args", "classMap must be an object such as {\"0\": \"2\"} (model class -> class of the current class file).");
          for (const [from, to] of Object.entries(args.classMap as Record<string, unknown>)) classMap.set(checkClassId(from, "classMap"), checkClassId(to, "classMap"));
        }
        const onlyClasses = Array.isArray(args.modelClasses) ? new Set(args.modelClasses.map((value) => checkClassId(value, "modelClasses"))) : null;
        const detected = await panelErrors(() => inference().detect({
          confidence: unitArg(args, "confidence"), iou: unitArg(args, "iou"), maxDetections: optionalArg(args, "maxDetections", "number")
        }));
        const skipOverlapping = optionalArg(args, "skipOverlapping", "boolean") ?? true;
        const existing = skipOverlapping ? existingBoxes() : [];
        let overlapping = 0;
        const candidates: DetectionCandidate[] = [];
        for (const detection of [...detected.detections].sort((a, b) => b.confidence - a.confidence)) {
          const modelClassId = String(detection.classId);
          if (onlyClasses && !onlyClasses.has(modelClassId)) continue;
          const box = { score: detection.confidence, x: detection.left, y: detection.top, width: detection.right - detection.left, height: detection.bottom - detection.top };
          if (existing.some((other) => intersectionOverUnion(box, other) >= COPY_OVERLAP_IOU)) { overlapping += 1; continue; }
          candidates.push({
            index: candidates.length, classId: classMap.get(modelClassId) ?? modelClassId, modelClassId, confidence: Math.round(detection.confidence * 10000) / 10000,
            x0: detection.left, y0: detection.top, x1: detection.right, y1: detection.bottom
          });
        }
        if (optionalArg(args, "apply", "boolean") === true) {
          const minConfidence = unitArg(args, "minConfidence") ?? 0;
          return { model: detected.model, overlappingExisting: overlapping, ...applyCandidates(candidates.filter((candidate) => candidate.confidence >= minConfidence)) };
        }
        const id = `detect-${++folderRunCount}`;
        detectionPreviews.set(id, { image, candidates });
        if (detectionPreviews.size > FOLDER_RUNS_KEPT) detectionPreviews.delete(detectionPreviews.keys().next().value!);
        const expected = optionalArg(args, "expected", "number");
        const page = listPage(candidates, args, LISTED_CANDIDATES);
        const byClass: Record<string, number> = {};
        for (const candidate of candidates) byClass[candidate.classId] = (byClass[candidate.classId] ?? 0) + 1;
        return {
          applied: false, resultId: id, model: detected.model, found: candidates.length, overlappingExisting: overlapping, byClass,
          scores: summarizeScores(candidates.map((candidate) => candidate.confidence), expected !== undefined ? { expected } : {}),
          candidates: page.items, offset: page.offset, truncated: page.truncated
        };
      }
    },
    inference_status: {
      changesApp: false,
      run: async () => inference().status()
    },
    load_model: {
      changesApp: true,
      async run(args) {
        const entry = args.entry as { path: string; name: string; directory: boolean } | undefined;
        if (!entry?.path) throw new AgentToolError("invalid_args", "path is required");
        const api = inference();
        const file = await deps.file(entry).getFile();
        return panelErrors(() => api.loadModel(file));
      }
    },
    run_inference: {
      changesApp: true,
      async run(args) {
        requireDetectionImage();
        const api = inference();
        const allImages = optionalArg(args, "allImages", "boolean") ?? false;
        const confidence = unitArg(args, "confidence");
        const iou = unitArg(args, "iou");
        const maxDetections = optionalArg(args, "maxDetections", "number");
        const model = api.status().model;
        if (!model) throw new AgentToolError("failed", "Load an ONNX model first (load_model).");
        if (allImages) {
          const count = state.session.imageFiles.length;
          const allowed = await deps.confirm(`Run ${model} on all ${count} images? Results go into the model's own label folder (inference-…), which becomes the active label set; the current labels stay as they are.`);
          if (!allowed) throw new AgentToolError("declined", "The person declined the inference run.");
        }
        const result = await panelErrors(() => api.run({ allImages, confidence, iou, maxDetections }));
        deps.afterEdit();
        return result;
      }
    }
  };
}
