/**
 * Agent tools for the Segmentation workflow (stage 9 of docs/AGENT_MCP_PLAN_KO.md): switching workflows, reading the
 * class mask as numbers (connected regions), and scoring masks against reference masks; never pixels over MCP.
 */
import type { AppState } from "../app/state.js";
import { hasDirtyDocuments } from "../app/document-status.js";
import { analyzeMask, cleanMask } from "../domain/annotations/mask-analysis.js";
import { matchMasks, summarizeMaskComparison, type ImageMaskMatch } from "../domain/annotations/mask-compare.js";
import { maskRegions, type MaskRegionSummary } from "../domain/annotations/mask-regions.js";
import { cropMask, cropStats, largestPiece, snapToIntensity, type Crop, type CropStats } from "../domain/annotations/mask-fit.js";
import { checkMaskShape, paintShapes, type MaskShape } from "../domain/annotations/mask-paint.js";
import { decodeSegmentationMaskPng, encodeSegmentationMaskPng } from "../domain/annotations/segmentation-codec.js";
import { parseNonNegativeClassId } from "../domain/class-id.js";
import { imageFileNameToBaseName } from "../domain/files/image-names.js";
import { evenSample } from "../domain/refine/folder-summary.js";
import { AgentToolError, LIST_PAGE_MAX, listPage, optionalArg, type AgentTool } from "../features/agent/agent-api.js";
import { isNotFoundError, readBinaryFileByName, writeBinaryFileByName } from "../platform/file-system-access.js";
import type { DirectoryHandleLike } from "../types/files.js";
import { getRectBounds } from "../features/canvas/arrange.js";
import { ensureAnnotationId, isRectObject } from "../features/canvas/fabric-types.js";
import type { RuntimeCanvasController } from "./canvas-controller-adapter.js";
import type { RuntimeFileSystem } from "./file-system-adapter.js";

export interface AgentSegmentationToolDeps {
  state: AppState;
  canvasController: RuntimeCanvasController;
  documentRef: Document;
  /** Refreshes the class list, toolbar and status after an edit (EventManager.syncAfterEdit). */
  afterEdit?(): void;
  /** The MCP panel's Live view: draw each AI result on the mask as it is found. */
  liveView?(): boolean;
  /** Saving, reading and decoding other images, for folder runs. */
  fileSystem?: RuntimeFileSystem;
  /** Folder-wide writes: the person's native dialog (or the panel's Block). */
  confirm?(message: string): Promise<boolean>;
}

/** Most shapes or regions one call may paint or change. */
const MASK_EDIT_LIMIT = 5000;

function classArg(value: unknown, label: string): number {
  let id: string;
  try {
    id = parseNonNegativeClassId(String(value ?? ""), label);
  } catch (error) {
    throw new AgentToolError("invalid_args", error instanceof Error ? error.message : String(error));
  }
  const number = Number(id);
  if (number < 1 || number > 65535) throw new AgentToolError("invalid_args", `${label} must be 1..65535 (0 is the background; erase instead).`);
  return number;
}

/** The current image's mask as regions, or a no_image / failed error. Throws when the app is in Detection. */
export function currentMaskRegions(state: AppState, canvasController: RuntimeCanvasController): MaskRegionSummary {
  if (state.session.workflow !== "segmentation") throw new AgentToolError("failed", "The app is in Detection; call set_workflow with \"segmentation\" first.");
  if (!state.session.currentImageFile) throw new AgentToolError("no_image", "No image is shown. Use go_to_image first.");
  const snapshot = canvasController.raw.getSegmentationDocumentSnapshot?.();
  if (!snapshot) throw new AgentToolError("failed", "The segmentation mask is not ready.");
  return maskRegions(snapshot.mask, snapshot.width, snapshot.height);
}

export function createAgentSegmentationTools(deps: AgentSegmentationToolDeps): Record<string, AgentTool> {
  const { state, canvasController, documentRef } = deps;

  const setWorkflow: AgentTool = {
    changesApp: true,
    async run(args) {
      const workflow = args.workflow;
      if (workflow !== "detection" && workflow !== "segmentation") throw new AgentToolError("invalid_args", "workflow must be \"detection\" or \"segmentation\".");
      const previous = state.session.workflow;
      if (previous !== workflow) {
        // The same radio the person clicks in the toolbar, so the app switches exactly as for them.
        const tab = documentRef.getElementById(workflow === "detection" ? "detectionWorkflowTab" : "segmentationWorkflowTab") as HTMLInputElement | null;
        if (!tab) throw new AgentToolError("failed", "The workflow tabs are not on the page.");
        tab.click();
        if (state.session.workflow !== workflow) throw new AgentToolError("failed", `The app stayed in ${state.session.workflow}.`);
      }
      return { workflow, previous };
    }
  };

  const getRegions: AgentTool = {
    changesApp: false,
    async run(args) {
      const summary = currentMaskRegions(state, canvasController);
      const classFilter = args.classId === undefined || args.classId === null ? null : String(args.classId);
      const minArea = Math.max(0, optionalArg(args, "minArea", "number") ?? 0);
      const regions = summary.regions.filter((region) => (classFilter === null || region.classId === classFilter) && region.area >= minArea);
      const page = listPage(regions, args, 100);
      return {
        image: state.session.currentImageFile?.name ?? null,
        width: summary.width,
        height: summary.height,
        units: "pixels",
        pixelsByClass: summary.pixelsByClass,
        regionsByClass: summary.regionsByClass,
        regions: page.items,
        total: page.total,
        offset: page.offset,
        truncated: page.truncated,
        note: "Regions are recomputed on every call; refer to one by its seed point, which stays inside it until the mask changes there."
      };
    }
  };

  const folder = async (parent: DirectoryHandleLike, name: string, label: string): Promise<DirectoryHandleLike> => {
    try {
      return await parent.getDirectoryHandle(name);
    } catch (error) {
      if (isNotFoundError(error)) throw new AgentToolError("not_found", `No folder named ${name} ${label}.`);
      throw error;
    }
  };
  const readMask = async (directory: DirectoryHandleLike, image: string): Promise<{ width: number; height: number; mask: Uint16Array } | null> => {
    try {
      return await decodeSegmentationMaskPng(await readBinaryFileByName(directory, `${imageFileNameToBaseName(image)}.png`));
    } catch (error) {
      if (isNotFoundError(error)) return null;
      throw error;
    }
  };

  const compareMasks: AgentTool = {
    changesApp: false,
    async run(args, context) {
      const session = state.session;
      if (!session.imageFolderHandle) throw new AgentToolError("no_folder", "No folder is open. Use open_folder first.");
      const imageFolder = session.imageFolderHandle as unknown as DirectoryHandleLike;
      const name = (value: unknown, label: string): string => {
        if (typeof value !== "string" || !value || /[\\/]/.test(value) || value === "." || value === "..") throw new AgentToolError("invalid_args", `${label}: give the name of a folder inside the image folder, e.g. "mask_gt".`);
        return value;
      };
      const referenceName = name(args.reference, "reference");
      const reference = await folder(imageFolder, referenceName, "in the image folder");
      const labelsName = args.labels === undefined || args.labels === null ? null : name(args.labels, "labels");
      // Default: the mask folder the app saves to (inside the segmentation folder, or the image folder).
      const labels = labelsName
        ? await folder(imageFolder, labelsName, "in the image folder")
        : await folder((session.segmentationLabelFolderHandle ?? session.imageFolderHandle) as unknown as DirectoryHandleLike, "mask", "next to the images (the app saves masks there)");
      const tolerancePx = optionalArg(args, "tolerance", "number") ?? 2;
      if (!(Number.isInteger(tolerancePx) && tolerancePx >= 0 && tolerancePx <= 20)) throw new AgentToolError("invalid_args", "tolerance must be a whole number of pixels, 0..20.");
      const files = session.imageFiles;
      let indexes = files.map((_, index) => index);
      if (Array.isArray(args.images)) {
        const names = args.images.map(String);
        const missing = names.filter((entry) => !files.some((file) => file.name === entry));
        if (missing.length) throw new AgentToolError("not_found", `No image named ${missing.slice(0, 5).join(", ")} in the open folder.`);
        indexes = names.map((entry) => files.findIndex((file) => file.name === entry));
      } else {
        const sample = optionalArg(args, "sample", "number");
        if (sample !== undefined) {
          if (!Number.isInteger(sample) || sample < 1) throw new AgentToolError("invalid_args", "sample must be a whole number of images, 1 or more.");
          indexes = evenSample(files.length, sample);
        }
      }
      // The current image is scored from the canvas (unsaved edits) when the app shows its mask and no other folder was named.
      const canvasImage = !labelsName && session.workflow === "segmentation" ? session.currentImageFile?.name ?? null : null;
      const matches: ImageMaskMatch[] = [];
      const skipped: string[] = [];
      for (const [done, index] of indexes.entries()) {
        if (context.signal.aborted) throw new AgentToolError("cancelled", "Cancelled.");
        const image = files[index]!.name;
        context.progress(done, indexes.length, image);
        const truth = await readMask(reference, image);
        if (!truth) { skipped.push(image); continue; }
        const shown = image === canvasImage ? canvasController.raw.getSegmentationDocumentSnapshot?.() ?? null : null;
        const mask = shown ?? await readMask(labels, image) ?? { width: truth.width, height: truth.height, mask: new Uint16Array(truth.width * truth.height) };
        if (mask.width !== truth.width || mask.height !== truth.height) throw new AgentToolError("failed", `${image}: the mask is ${mask.width}x${mask.height} but the reference is ${truth.width}x${truth.height}.`);
        matches.push(matchMasks(image, mask.mask, truth.mask, truth.width, truth.height, tolerancePx));
      }
      if (!matches.length) throw new AgentToolError("not_found", `No reference masks (<image name>.png) in ${referenceName} for the images asked.`);
      const outliers = Math.min(LIST_PAGE_MAX, Math.max(0, Math.floor(optionalArg(args, "outliers", "number") ?? 20)));
      const summary = summarizeMaskComparison(matches, { tolerancePx, outliers });
      const page = listPage(summary.perImage, args, 20);
      return {
        reference: referenceName, labels: labelsName ?? "mask", units: "pixels",
        canvas: canvasImage ? `${canvasImage} is scored from the canvas (unsaved edits included); other images from saved masks` : "saved masks",
        ...summary,
        perImage: page.items, perImageTotal: page.total, truncated: page.truncated,
        ...(skipped.length ? { skipped: { count: skipped.length, images: skipped.slice(0, 20), reason: "no reference mask" } } : {})
      };
    }
  };

  /** Runs one mask edit as one undo step and reports what changed. */
  const editMask = (mutate: (mask: Uint16Array, width: number, height: number) => number): { changed: number; pixelsByClass: Record<string, number>; regionsByClass: Record<string, number> } => {
    currentMaskRegions(state, canvasController); // workflow and image checks
    const edit = canvasController.raw.editSegmentationMask;
    if (!edit) throw new AgentToolError("failed", "The canvas cannot edit masks.");
    let changed = 0;
    edit((mask, width, height) => (changed = mutate(mask, width, height)) > 0);
    deps.afterEdit?.();
    const { pixelsByClass, regionsByClass } = currentMaskRegions(state, canvasController);
    return { changed, pixelsByClass, regionsByClass };
  };

  const paintMask: AgentTool = {
    changesApp: true,
    async run(args) {
      const erase = args.erase === true;
      const value = erase ? 0 : classArg(args.classId, "classId");
      if (!Array.isArray(args.shapes) || !args.shapes.length) throw new AgentToolError("invalid_args", "shapes must be a non-empty list.");
      if (args.shapes.length > MASK_EDIT_LIMIT) throw new AgentToolError("invalid_args", `At most ${MASK_EDIT_LIMIT} shapes per call.`);
      let shapes: MaskShape[];
      try {
        shapes = args.shapes.map((shape, index) => checkMaskShape(shape, `shapes[${index}]`));
      } catch (error) {
        throw new AgentToolError("invalid_args", error instanceof Error ? error.message : String(error));
      }
      const backgroundOnly = args.backgroundOnly === true && !erase;
      let bounds: { x0: number; y0: number; x1: number; y1: number } | null = null;
      const result = editMask((mask, width, height) => {
        const painted = paintShapes(mask, width, height, shapes, value, backgroundOnly ? { only: 0 } : {});
        bounds = painted.bounds;
        return painted.changed;
      });
      return { ...result, bounds, value, erase, backgroundOnly };
    }
  };

  const editRegions: AgentTool = {
    changesApp: true,
    async run(args) {
      const action = args.action;
      if (action !== "delete" && action !== "relabel") throw new AgentToolError("invalid_args", "action must be \"delete\" or \"relabel\".");
      const toClass = action === "relabel" ? classArg(args.toClassId, "toClassId") : 0;
      const seeds = args.seeds ?? undefined; // the MCP server sends absent arguments as null
      const byClass = args.classId === undefined || args.classId === null ? null : String(classArg(args.classId, "classId"));
      if ((seeds === undefined) === (byClass === null)) throw new AgentToolError("invalid_args", "Give seeds (points inside the regions) or classId (its regions, optionally within minArea..maxArea), one of them.");
      if (seeds !== undefined && (!Array.isArray(seeds) || !seeds.length || seeds.length > MASK_EDIT_LIMIT)) throw new AgentToolError("invalid_args", `seeds must be a list of 1 to ${MASK_EDIT_LIMIT} {x, y} points.`);
      const minArea = optionalArg(args, "minArea", "number") ?? 0;
      const maxArea = optionalArg(args, "maxArea", "number") ?? Number.POSITIVE_INFINITY;
      let regionsChanged = 0;
      const result = editMask((mask, width, height) => {
        const { regions, pixels } = maskRegions(mask, width, height, { withPixels: true });
        const chosen = new Set<number>();
        if (byClass !== null) {
          regions.forEach((region, index) => { if (region.classId === byClass && region.area >= minArea && region.area <= maxArea) chosen.add(index + 1); });
        } else {
          (seeds as unknown[]).forEach((seed, index) => {
            const point = seed as { x?: unknown; y?: unknown } | null;
            const x = Math.floor(Number(point?.x));
            const y = Math.floor(Number(point?.y));
            if (!(x >= 0 && y >= 0 && x < width && y < height)) throw new AgentToolError("invalid_args", `seeds[${index}] must be {x, y} inside the image (0..${width} x 0..${height}).`);
            const region = pixels![y * width + x]!;
            if (!region) throw new AgentToolError("not_found", `seeds[${index}] (${x}, ${y}) is background, not inside a region. Regions change when the mask changes: read them again with get_regions.`);
            chosen.add(region);
          });
        }
        regionsChanged = chosen.size;
        let changed = 0;
        for (let index = 0; index < pixels!.length; index += 1) {
          if (chosen.has(pixels![index]!) && mask[index] !== toClass) { mask[index] = toClass; changed += 1; }
        }
        return changed;
      });
      return { action, regions: regionsChanged, ...(action === "relabel" ? { toClassId: String(toClass) } : {}), ...result };
    }
  };

  // The last AI preview (segment_ai or boxes_to_masks), for applying chosen results by resultId: one at a time, for the
  // image it was made on. `values` holds each result's class when the tool chose it (boxes_to_masks: the box's class).
  let lastAi: { resultId: string; tool: string; image: string; crops: Array<Crop | null>; values: Array<number | null> } | null = null;
  let aiRuns = 0;
  const applyCrops = (chosen: ReadonlyArray<{ crop: Crop; value: number }>, backgroundOnly: boolean) => editMask((mask, width) => {
    let changed = 0;
    for (const { crop, value } of chosen) {
      for (let y = 0; y < crop.height; y += 1) {
        for (let x = 0; x < crop.width; x += 1) {
          if (!crop.bits[y * crop.width + x]) continue;
          const index = (crop.y0 + y) * width + crop.x0 + x;
          if (mask[index] === value || (backgroundOnly && mask[index] !== 0)) continue;
          mask[index] = value;
          changed += 1;
        }
      }
    }
    return changed;
  });

  type AiPrompt = { points: Array<{ x: number; y: number; label: "positive" | "negative" }>; box: { x0: number; y0: number; x1: number; y1: number } | null };
  const parsePrompt = (entry: unknown, label: string): AiPrompt => {
    const prompt = entry as { points?: unknown; box?: unknown } | null;
    const finite = (...values: unknown[]) => values.every((item) => typeof item === "number" && Number.isFinite(item));
    const points = prompt?.points ?? [];
    if (!Array.isArray(points) || points.length > 32) throw new AgentToolError("invalid_args", `${label}.points must be a list of at most 32 {x, y, label} points.`);
    const parsed = points.map((point, index) => {
      const p = point as { x?: unknown; y?: unknown; label?: unknown } | null;
      if (!finite(p?.x, p?.y) || (p?.label !== undefined && p?.label !== null && p?.label !== "positive" && p?.label !== "negative")) {
        throw new AgentToolError("invalid_args", `${label}.points[${index}] must be {x, y} with label "positive" (default) or "negative".`);
      }
      return { x: p!.x as number, y: p!.y as number, label: (p!.label ?? "positive") as "positive" | "negative" };
    });
    const box = (prompt?.box ?? null) as { x0?: unknown; y0?: unknown; x1?: unknown; y1?: unknown } | null;
    if (box && (!finite(box.x0, box.y0, box.x1, box.y1) || !((box.x0 as number) < (box.x1 as number) && (box.y0 as number) < (box.y1 as number)))) {
      throw new AgentToolError("invalid_args", `${label}.box must be {x0, y0, x1, y1} with x0 < x1 and y0 < y1.`);
    }
    if (!parsed.length && !box) throw new AgentToolError("invalid_args", `${label} needs points, a box, or both.`);
    return { points: parsed, box: box ? { x0: box.x0 as number, y0: box.y0 as number, x1: box.x1 as number, y1: box.y1 as number } : null };
  };

  type AiResult = { index: number; score: number; passes: boolean; empty?: true } & Partial<CropStats>;
  /** Reads the post-processing options both AI tools share. */
  const aiOptions = (args: Record<string, unknown>) => {
    const snapPx = optionalArg(args, "snapPx", "number") ?? 0;
    if (!(Number.isInteger(snapPx) && snapPx >= 0 && snapPx <= 10)) throw new AgentToolError("invalid_args", "snapPx must be a whole number of pixels, 0..10.");
    return {
      clipToBox: args.clipToBox !== false,
      keepLargest: args.keepLargest !== false,
      snapPx,
      minScore: optionalArg(args, "minScore", "number") ?? 0,
      minEdgeFit: optionalArg(args, "minEdgeFit", "number") ?? 0
    };
  };
  /** Encodes the image once, then decodes every prompt and turns each result into a crop with its numbers. */
  /**
   * Encodes the image once, then decodes every prompt and turns each result into a crop with its numbers. With Live
   * view each result is drawn on the mask as it arrives (class `liveValue(index)`), and the mask is put back at the end:
   * the tool then applies its final choice as usual.
   */
  const runPrompts = async (prompts: readonly AiPrompt[], options: ReturnType<typeof aiOptions> & { backgroundOnly?: boolean }, context: Parameters<AgentTool["run"]>[1], liveValue: (index: number) => number | null) => {
    const raw = canvasController.raw;
    if (!raw.prepareSegmentationAi || !raw.decodeSegmentationAi) throw new AgentToolError("failed", "AI Select is not available in this app.");
    let started = performance.now();
    const status = await raw.prepareSegmentationAi();
    const encodeMs = Math.round(performance.now() - started);
    if (!status || status.phase !== "ready") throw new AgentToolError("failed", `AI Select is not ready: ${status?.message ?? status?.phase ?? "no model"}.`);
    const gray = raw.getSegmentationImageGray?.() ?? null;
    const crops: Array<Crop | null> = [];
    const results: AiResult[] = [];
    started = performance.now();
    let modelMs = 0;
    const live = deps.liveView?.() === true && raw.beginSegmentationLiveEdit?.() === true;
    try {
      for (const [index, prompt] of prompts.entries()) {
        if (context.signal.aborted) throw new AgentToolError("cancelled", "Cancelled.");
        context.progress(index, prompts.length, `prompt ${index + 1}`);
        // A clipped box prompt needs only its box restored, not the whole image.
        const roi = options.clipToBox && prompt.box ? prompt.box : undefined;
        const decodeStarted = performance.now();
        const decoded = await raw.decodeSegmentationAi({ points: prompt.points, box: prompt.box ? { left: prompt.box.x0, top: prompt.box.y0, right: prompt.box.x1, bottom: prompt.box.y1 } : null, ...(roi ? { roi } : {}) });
        if (!decoded) throw new AgentToolError("failed", "AI Select stopped being ready (did the image change?).");
        modelMs += performance.now() - decodeStarted;
        let crop = cropMask(decoded.mask, decoded.width, decoded.height, roi ? { x0: roi.x0 - decoded.x0, y0: roi.y0 - decoded.y0, x1: roi.x1 - decoded.x0, y1: roi.y1 - decoded.y0 } : undefined);
        if (crop) crop = { ...crop, x0: crop.x0 + decoded.x0, y0: crop.y0 + decoded.y0 };
        if (crop && options.keepLargest) crop = largestPiece(crop);
        if (crop && options.snapPx > 0 && gray) crop = snapToIntensity(crop, gray, options.snapPx, roi);
        if (crop && !crop.bits.some(Boolean)) crop = null;
        crops.push(crop);
        const value = liveValue(index);
        if (live && crop && value) {
          const shown = crop;
          raw.liveSegmentationEdit?.((mask, width) => {
            for (let y = 0; y < shown.height; y += 1) {
              for (let x = 0; x < shown.width; x += 1) {
                const at = (shown.y0 + y) * width + shown.x0 + x;
                if (shown.bits[y * shown.width + x] && !(options.backgroundOnly && mask[at] !== 0)) mask[at] = value;
              }
            }
            return { left: shown.x0, top: shown.y0, right: shown.x0 + shown.width - 1, bottom: shown.y0 + shown.height - 1 };
          });
        }
        const score = Math.round(decoded.score * 1000) / 1000;
        if (!crop) { results.push({ index, score, passes: false, empty: true }); continue; }
        const stats = cropStats(crop, gray);
        results.push({ index, score, ...stats, passes: score >= options.minScore && (stats.edgeFit ?? 0) >= options.minEdgeFit });
      }
    } finally {
      if (live) raw.endSegmentationLiveEdit?.();
    }
    const decodeMs = Math.round(performance.now() - started);
    const timing = { backend: status.backend, encodeMs, decodeMs, perPromptMs: Math.round(decodeMs / Math.max(1, prompts.length)), modelPerPromptMs: Math.round(modelMs / Math.max(1, prompts.length)) };
    return { crops, results, timing };
  };
  /** Applies results of the last preview by resultId (and accept indexes); `value` overrides the stored classes. */
  const applyLast = (tool: string, args: Record<string, unknown>, value: number | null, backgroundOnly: boolean) => {
    const image = state.session.currentImageFile!.name;
    const last = lastAi;
    if (!last || last.resultId !== args.resultId || last.image !== image || last.tool !== tool) throw new AgentToolError("not_found", `That resultId is not the last ${tool} preview on this image; run it again.`);
    const accept: number[] = Array.isArray(args.accept) ? args.accept.map(Number) : last.crops.map((_, index) => index);
    const chosen = accept.flatMap((index) => {
      if (!Number.isInteger(index) || index < 0 || index >= last.crops.length) throw new AgentToolError("invalid_args", `accept: ${index} is not a result index (0..${last.crops.length - 1}).`);
      const crop = last.crops[index];
      const classValue = value ?? last.values[index];
      return crop && classValue ? [{ crop, value: classValue }] : [];
    });
    return { applied: chosen.length, ...applyCrops(chosen, backgroundOnly) };
  };

  const segmentAi: AgentTool = {
    changesApp: true,
    async run(args, context) {
      currentMaskRegions(state, canvasController);
      const value = classArg(args.classId, "classId");
      const backgroundOnly = args.backgroundOnly === true;
      if (args.resultId !== undefined && args.resultId !== null) return applyLast("segment_ai", args, value, backgroundOnly);
      if (!Array.isArray(args.prompts) || !args.prompts.length || args.prompts.length > 500) {
        throw new AgentToolError("invalid_args", "prompts must be a list of 1 to 500 prompts: {points: [{x, y, label}], box: {x0, y0, x1, y1}} (points, a box, or both).");
      }
      const prompts = args.prompts.map((entry, index) => parsePrompt(entry, `prompts[${index}]`));
      const { crops, results, timing } = await runPrompts(prompts, { ...aiOptions(args), backgroundOnly }, context, () => value);
      aiRuns += 1;
      lastAi = { resultId: `ai-${aiRuns}`, tool: "segment_ai", image: state.session.currentImageFile!.name, crops, values: crops.map(() => value) };
      const listed = results.slice(0, LIST_PAGE_MAX);
      if (args.apply === true) {
        const chosen = results.filter((result) => result.passes).map((result) => ({ crop: crops[result.index]!, value }));
        return { resultId: lastAi.resultId, applied: chosen.length, ...applyCrops(chosen, backgroundOnly), results: listed, timing };
      }
      return {
        resultId: lastAi.resultId, applied: 0, passing: results.filter((result) => result.passes).length, results: listed, timing,
        note: "Nothing changed yet. Apply with resultId (and accept: [indexes]), or rerun with apply: true and minScore / minEdgeFit."
      };
    }
  };

  const boxesToMasks: AgentTool = {
    changesApp: true,
    async run(args, context) {
      currentMaskRegions(state, canvasController);
      const override = args.classId === undefined || args.classId === null ? null : classArg(args.classId, "classId");
      const backgroundOnly = args.backgroundOnly === true;
      if (args.resultId !== undefined && args.resultId !== null) return applyLast("boxes_to_masks", args, override, backgroundOnly);
      const pad = optionalArg(args, "pad", "number") ?? 2;
      if (!(pad >= 0 && pad <= 50)) throw new AgentToolError("invalid_args", "pad must be 0..50 pixels.");
      const onlyClasses = Array.isArray(args.boxClassIds) ? new Set(args.boxClassIds.map(String)) : null;
      const onlyIds = Array.isArray(args.annotationIds) ? new Set(args.annotationIds.map(String)) : null;
      const snapshot = canvasController.raw.getSegmentationDocumentSnapshot?.();
      const width = snapshot?.width ?? 0;
      const height = snapshot?.height ?? 0;
      // The image's Detection boxes as the app holds them (unsaved edits included), even while Segmentation is shown.
      const detection = canvasController.detection;
      if (!detection) throw new AgentToolError("failed", "The Detection boxes are not reachable from here.");
      const boxes = detection.getObjects("rect").filter(isRectObject).map((rect) => {
        rect.setCoords();
        const bounds = getRectBounds(rect);
        return { id: ensureAnnotationId(rect), classId: String(rect.labelClass ?? "0"), x0: bounds.left, y0: bounds.top, x1: bounds.right, y1: bounds.bottom };
      }).filter((box) => (onlyClasses === null || onlyClasses.has(box.classId)) && (onlyIds === null || onlyIds.has(box.id)) && box.x1 - box.x0 >= 2 && box.y1 - box.y0 >= 2);
      if (!boxes.length) throw new AgentToolError("not_found", "The current image has no Detection boxes to convert (check boxClassIds / annotationIds).");
      if (boxes.length > 5000) throw new AgentToolError("invalid_args", "At most 5000 boxes per call; pass boxClassIds to convert some classes at a time.");
      // Box class 0 is the background in masks: those boxes need classId.
      const values = boxes.map((box) => override ?? (Number(box.classId) > 0 && Number(box.classId) <= 65535 ? Number(box.classId) : null));
      const prompts: AiPrompt[] = boxes.map((box) => ({
        points: [],
        box: { x0: Math.max(0, box.x0 - pad), y0: Math.max(0, box.y0 - pad), x1: Math.min(width, box.x1 + pad), y1: Math.min(height, box.y1 + pad) }
      }));
      const options = aiOptions(args);
      const { crops, results, timing } = await runPrompts(prompts, { ...options, backgroundOnly }, context, (index) => values[index] ?? null);
      aiRuns += 1;
      lastAi = { resultId: `ai-${aiRuns}`, tool: "boxes_to_masks", image: state.session.currentImageFile!.name, crops, values };
      // Per box: its id and class, how much of the box the region fills, and whether it passes.
      const rows = results.map((result) => {
        const box = boxes[result.index]!;
        const area = (box.x1 - box.x0) * (box.y1 - box.y0);
        return { ...result, annotationId: box.id, boxClassId: box.classId, maskClassId: values[result.index] === null ? null : String(values[result.index]), fill: result.pixels ? Math.round((result.pixels / area) * 1000) / 1000 : 0, passes: result.passes && values[result.index] !== null };
      });
      const summary = {
        boxes: boxes.length,
        passing: rows.filter((row) => row.passes).length,
        empty: rows.filter((row) => row.empty).length,
        noClass: values.filter((value) => value === null).length,
        lowestScores: [...rows].filter((row) => !row.empty).sort((a, b) => a.score - b.score).slice(0, 10).map((row) => ({ index: row.index, annotationId: row.annotationId, score: row.score, edgeFit: row.edgeFit ?? null }))
      };
      const page = listPage(rows, args, 100);
      if (args.apply === true) {
        const chosen = rows.filter((row) => row.passes).map((row) => ({ crop: crops[row.index]!, value: values[row.index]! }));
        return { resultId: lastAi.resultId, applied: chosen.length, ...applyCrops(chosen, backgroundOnly), ...summary, results: page.items, resultsTotal: page.total, truncated: page.truncated, timing };
      }
      return {
        resultId: lastAi.resultId, applied: 0, ...summary, results: page.items, resultsTotal: page.total, truncated: page.truncated, timing,
        note: "Nothing changed yet. Apply with resultId (and accept: [indexes]), or rerun with apply: true and minScore / minEdgeFit."
      };
    }
  };

  /** sample / images / scope "folder" -> the image indexes a folder run covers, or null for the current image only. */
  const folderImages = (args: Record<string, unknown>): number[] | null => {
    const files = state.session.imageFiles;
    if (Array.isArray(args.images)) {
      const names = args.images.map(String);
      const missing = names.filter((entry) => !files.some((file) => file.name === entry));
      if (missing.length) throw new AgentToolError("not_found", `No image named ${missing.slice(0, 5).join(", ")} in the open folder.`);
      return names.map((entry) => files.findIndex((file) => file.name === entry));
    }
    const sample = optionalArg(args, "sample", "number");
    if (sample !== undefined) {
      if (!Number.isInteger(sample) || sample < 1) throw new AgentToolError("invalid_args", "sample must be a whole number of images, 1 or more.");
      return evenSample(files.length, sample);
    }
    if (args.scope === "folder") return files.map((_, index) => index);
    if (args.scope !== undefined && args.scope !== null && args.scope !== "image") throw new AgentToolError("invalid_args", "scope must be \"image\" (default) or \"folder\".");
    return null;
  };
  /** The folder the app saves masks to (inside the segmentation folder, or the image folder). */
  const maskFolder = async (create: boolean): Promise<DirectoryHandleLike | null> => {
    const root = (state.session.segmentationLabelFolderHandle ?? state.session.imageFolderHandle) as unknown as DirectoryHandleLike | null;
    if (!root) throw new AgentToolError("no_folder", "No folder is open. Use open_folder first.");
    try {
      return await root.getDirectoryHandle("mask", create ? { create: true } : undefined);
    } catch (error) {
      if (isNotFoundError(error)) return null;
      throw error;
    }
  };
  /** An image's pixels as gray (luma), decoded the way automation reads other images. */
  const grayOf = async (index: number): Promise<{ width: number; height: number; gray: Uint8Array } | null> => {
    const file = state.session.imageFiles[index];
    if (!file || !deps.fileSystem) return null;
    const image = await deps.fileSystem.decodeImageForAutomation(file);
    const width = image.naturalWidth || image.width, height = image.naturalHeight || image.height;
    const canvas = documentRef.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return null;
    context.drawImage(image, 0, 0);
    const rgba = context.getImageData(0, 0, width, height).data;
    const gray = new Uint8Array(width * height);
    for (let at = 0; at < gray.length; at += 1) gray[at] = (rgba[at * 4]! * 77 + rgba[at * 4 + 1]! * 150 + rgba[at * 4 + 2]! * 29) >> 8;
    return { width, height, gray };
  };
  const analysisOptions = (args: Record<string, unknown>) => {
    const classId = args.classId === undefined || args.classId === null ? undefined : String(classArg(args.classId, "classId"));
    const speckArea = optionalArg(args, "speckArea", "number");
    const neckPx = optionalArg(args, "neckPx", "number") ?? 1;
    if (!(Number.isInteger(neckPx) && neckPx >= 1 && neckPx <= 5)) throw new AgentToolError("invalid_args", "neckPx must be 1..5.");
    const minEdgeFit = optionalArg(args, "minEdgeFit", "number");
    return { ...(classId !== undefined ? { classId } : {}), ...(speckArea !== undefined ? { speckArea } : {}), neckPx, ...(minEdgeFit !== undefined ? { minEdgeFit } : {}) };
  };

  const analyzeMasks: AgentTool = {
    changesApp: false,
    async run(args, context) {
      const outliers = Math.min(LIST_PAGE_MAX, Math.max(0, Math.floor(optionalArg(args, "outliers", "number") ?? 20)));
      const options = analysisOptions(args);
      const indexes = folderImages(args);
      if (indexes) {
        // Saved masks of several images: counts per image, worst first (no edgeFit: that needs each image's pixels).
        const directory = await maskFolder(false);
        const totals = { specks: 0, holes: 0, necked: 0, offEdges: 0, size: 0, offLine: 0, missing: 0 };
        const images: Array<{ image: string; regions: number; counts: typeof totals }> = [];
        let withoutMask = 0;
        for (const [done, index] of indexes.entries()) {
          if (context.signal.aborted) throw new AgentToolError("cancelled", "Cancelled.");
          const name = state.session.imageFiles[index]!.name;
          context.progress(done, indexes.length, name);
          const saved = directory ? await readMask(directory, name) : null;
          if (!saved) { withoutMask += 1; continue; }
          const result = analyzeMask(saved.mask, saved.width, saved.height, null, options);
          for (const key of Object.keys(totals) as Array<keyof typeof totals>) totals[key] += result.counts[key];
          images.push({ image: name, regions: result.regions, counts: result.counts });
        }
        const issues = (entry: (typeof images)[number]) => entry.counts.specks + entry.counts.holes + entry.counts.necked + entry.counts.size + entry.counts.offLine + entry.counts.missing;
        images.sort((a, b) => issues(b) - issues(a));
        const page = listPage(images, args, 20);
        return { units: "pixels", imagesChecked: indexes.length, withoutMask, counts: totals, images: page.items, imagesTotal: page.total, truncated: page.truncated };
      }
      currentMaskRegions(state, canvasController);
      const snapshot = canvasController.raw.getSegmentationDocumentSnapshot!()!;
      const result = analyzeMask(snapshot.mask, snapshot.width, snapshot.height, canvasController.raw.getSegmentationImageGray?.() ?? null, options);
      return {
        image: state.session.currentImageFile?.name ?? null, units: "pixels",
        regions: result.regions, byClass: result.byClass, counts: result.counts,
        specks: result.specks.slice(0, outliers), holes: result.holes.slice(0, outliers), necked: result.necked.slice(0, outliers), offEdges: result.offEdges.slice(0, outliers),
        layout: { findings: result.layout.findings.slice(0, outliers), missing: result.layout.missing.slice(0, outliers) },
        note: "Seeds point inside each region (edit_regions); layout runs analyze_boxes on the regions' bounding boxes (findings use region list order as ids)."
      };
    }
  };

  const cleanMasks: AgentTool = {
    changesApp: true,
    async run(args, context) {
      const classId = args.classId === undefined || args.classId === null ? undefined : String(classArg(args.classId, "classId"));
      const number = (name: string, max: number) => {
        const value = optionalArg(args, name, "number") ?? 0;
        if (!(Number.isInteger(value) && value >= 0 && value <= max)) throw new AgentToolError("invalid_args", `${name} must be a whole number 0..${max}.`);
        return value;
      };
      const options = {
        ...(classId !== undefined ? { classId } : {}),
        removeSpecks: number("removeSpecks", 1_000_000), fillHoles: number("fillHoles", 1_000_000), splitNecks: number("splitNecks", 5), snapPx: number("snapPx", 10)
      };
      if (!options.removeSpecks && !options.fillHoles && !options.splitNecks && !options.snapPx) throw new AgentToolError("invalid_args", "Give at least one of removeSpecks, fillHoles (pixel areas), splitNecks, snapPx (pixels).");
      const indexes = folderImages(args);
      if (indexes) return cleanFolder(indexes, options, args, context);
      currentMaskRegions(state, canvasController);
      const gray = options.snapPx ? canvasController.raw.getSegmentationImageGray?.() ?? null : null;
      if (options.snapPx && !gray) throw new AgentToolError("failed", "snapPx needs the image pixels, which are not ready.");
      if (args.apply !== true) {
        // Preview on a copy: what would change, nothing changes.
        const snapshot = canvasController.raw.getSegmentationDocumentSnapshot!()!;
        const copy = snapshot.mask.slice();
        const preview = cleanMask(copy, snapshot.width, snapshot.height, gray, options);
        const after = maskRegions(copy, snapshot.width, snapshot.height);
        return { applied: false, ...preview, pixelsByClass: after.pixelsByClass, regionsByClass: after.regionsByClass, note: "Nothing changed yet; rerun with apply: true." };
      }
      let outcome: ReturnType<typeof cleanMask> | null = null;
      const result = editMask((mask, width, height) => (outcome = cleanMask(mask, width, height, gray, options)).changed);
      return { applied: true, ...outcome!, ...result };
    }
  };

  /**
   * clean_masks over saved masks: current edits are saved first, every mask is cleaned in memory (stopping there writes
   * nothing), then, after the person allows it, the changed mask PNGs are backed up under mask/.easy-labeling/clean-masks-<time>
   * and written. The current image's mask is read again afterwards (its undo history starts over).
   */
  const cleanFolder = async (indexes: number[], options: Parameters<typeof cleanMask>[4], args: Record<string, unknown>, context: Parameters<AgentTool["run"]>[1]) => {
    if (!deps.fileSystem) throw new AgentToolError("failed", "Folder clean-up is not available here.");
    if (hasDirtyDocuments(state)) await deps.fileSystem.saveLabels();
    const directory = await maskFolder(false);
    const files = state.session.imageFiles;
    const changed: Array<{ image: string; file: string; original: ArrayBuffer; mask: Uint16Array; width: number; height: number; result: ReturnType<typeof cleanMask> }> = [];
    const totals = { specksRemoved: 0, holesFilled: 0, necksCut: 0, regionsSnapped: 0, changed: 0 };
    let withoutMask = 0;
    for (const [done, index] of indexes.entries()) {
      if (context.signal.aborted) throw new AgentToolError("cancelled", "Stopped; no mask file was changed.");
      const image = files[index]!.name;
      context.progress(done, indexes.length, image);
      const file = `${imageFileNameToBaseName(image)}.png`;
      let original: ArrayBuffer | null = null;
      try {
        original = directory ? await readBinaryFileByName(directory, file) : null;
      } catch (error) {
        if (!isNotFoundError(error)) throw error;
      }
      if (!original) { withoutMask += 1; continue; }
      const saved = await decodeSegmentationMaskPng(original);
      const gray = options.snapPx ? await grayOf(index) : null;
      if (gray && (gray.width !== saved.width || gray.height !== saved.height)) throw new AgentToolError("failed", `${image}: the mask is ${saved.width}x${saved.height} but the image is ${gray.width}x${gray.height}.`);
      const mask = saved.mask.slice();
      const result = cleanMask(mask, saved.width, saved.height, gray, options);
      for (const key of Object.keys(totals) as Array<keyof typeof totals>) totals[key] += result[key];
      if (result.changed) changed.push({ image, file, original, mask, width: saved.width, height: saved.height, result });
    }
    const perImage = changed.map((entry) => ({ image: entry.image, ...entry.result })).sort((a, b) => b.changed - a.changed);
    const page = listPage(perImage, args, 20);
    const summary = { imagesChecked: indexes.length, imagesChanged: changed.length, withoutMask, ...totals, images: page.items, imagesTotal: page.total, truncated: page.truncated };
    if (args.apply !== true || !changed.length) return { applied: false, ...summary, ...(changed.length ? { note: "Nothing changed yet; rerun with apply: true (the person is asked first, originals are backed up)." } : {}) };
    const allowed = await deps.confirm?.(`Clean ${changed.length.toLocaleString()} mask files (${totals.changed.toLocaleString()} pixels change)?\n\nThe original mask PNGs will be backed up.`);
    if (!allowed) throw new AgentToolError("declined", "The person declined the folder clean-up; nothing was changed.");
    const target = (await maskFolder(true))!;
    const metadata = await target.getDirectoryHandle(".easy-labeling", { create: true });
    const backupName = `clean-masks-${new Date().toISOString().replace(/[:.]/g, "-")}`;
    const backup = await metadata.getDirectoryHandle(backupName, { create: true });
    for (const entry of changed) await writeBinaryFileByName(backup, entry.file, entry.original);
    for (const entry of changed) {
      const png = await encodeSegmentationMaskPng({ width: entry.width, height: entry.height, mask: entry.mask } as Parameters<typeof encodeSegmentationMaskPng>[0]);
      await writeBinaryFileByName(target, entry.file, png.slice().buffer as ArrayBuffer);
    }
    // The current image shows the new mask.
    const current = state.session.currentImageFile?.name;
    const shown = changed.find((entry) => entry.image === current);
    if (shown && deps.fileSystem.readSegmentationLabels) {
      const snapshot = await deps.fileSystem.readSegmentationLabels(shown.image, shown.width, shown.height);
      canvasController.raw.loadSegmentationDocumentSnapshot?.(snapshot);
      deps.afterEdit?.();
    }
    return { applied: true, backup: `mask/.easy-labeling/${backupName}`, ...summary };
  };

  return {
    set_workflow: setWorkflow, get_regions: getRegions, compare_masks: compareMasks, paint_mask: paintMask, edit_regions: editRegions,
    segment_ai: segmentAi, boxes_to_masks: boxesToMasks, analyze_masks: analyzeMasks, clean_masks: cleanMasks
  };
}
