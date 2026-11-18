/**
 * Agent tools that edit the current image's boxes (stage 2 of docs/AGENT_MCP_PLAN_KO.md, section 4.2).
 * Every call is one undo step, through the same canvas methods the app's own tools use.
 */
import type { AppState } from "../app/state.js";
import { hasDirtyDocuments } from "../app/document-status.js";
import { parseNonNegativeClassId } from "../domain/class-id.js";
import { changeBox, matchesBoxWhere, parseBoxWhere, type BoxChange, type BoxWhere, type WhereBox } from "../domain/annotations/box-where.js";
import { AgentToolError, optionalArg, type AgentTool } from "../features/agent/agent-api.js";
import { outputInfo, outputPath } from "../features/images/annotation-storage.js";
import { AnnotationSaveError } from "../features/images/image-session-service.js";
import { getRectBounds } from "../features/canvas/arrange.js";
import { ensureAnnotationId, isRectObject, type FabricRectLike } from "../features/canvas/fabric-types.js";
import type { RuntimeCanvasController } from "./canvas-controller-adapter.js";
import type { RuntimeFileSystem } from "./file-system-adapter.js";

export interface AgentEditToolDeps {
  state: AppState;
  canvasController: RuntimeCanvasController;
  fileSystem: RuntimeFileSystem;
  pathOf?(handle: unknown): string | null;
  /** Refreshes the label list, toolbar and inspector (EventManager.syncAfterEdit). */
  afterEdit(): void;
}

/** Most boxes one call may add or change (a layout apply's ceiling). */
export const AGENT_EDIT_LIMIT = 5000;
const UNDO_LIMIT = 50;

export interface PixelBox { x0: number; y0: number; x1: number; y1: number }

/** Checks one box against the image: finite, x0 < x1, y0 < y1, inside [0, width] x [0, height]. */
export function checkBox(box: PixelBox, size: { width: number; height: number }, label: string): PixelBox {
  const values = [box.x0, box.y0, box.x1, box.y1];
  if (!values.every((value) => typeof value === "number" && Number.isFinite(value))) {
    throw new AgentToolError("invalid_args", `${label}: x0, y0, x1 and y1 must be numbers.`);
  }
  if (!(box.x0 < box.x1 && box.y0 < box.y1)) throw new AgentToolError("invalid_args", `${label}: needs x0 < x1 and y0 < y1.`);
  if (box.x0 < 0 || box.y0 < 0 || box.x1 > size.width || box.y1 > size.height) {
    throw new AgentToolError("invalid_args", `${label}: lies outside the image (0..${size.width} x 0..${size.height}).`);
  }
  return box;
}

export function checkClassId(value: unknown, label: string): string {
  try {
    return parseNonNegativeClassId(String(value ?? ""), `${label}: classId`);
  } catch (error) {
    throw new AgentToolError("invalid_args", error instanceof Error ? error.message : String(error));
  }
}

/** The `where` argument (null when absent); a malformed one is invalid_args. */
export function whereArg(args: Record<string, unknown>): BoxWhere | null {
  if (args.where == null) return null;
  try {
    return parseBoxWhere(args.where);
  } catch (error) {
    throw new AgentToolError("invalid_args", error instanceof Error ? error.message : String(error));
  }
}

/** A canvas box as `where` sees it (image pixels). */
export function whereBox(rect: FabricRectLike): WhereBox {
  rect.setCoords(); // bounds lag right after a draw
  const bounds = getRectBounds(rect);
  return { id: ensureAnnotationId(rect), classId: String(rect.labelClass ?? "0"), x0: bounds.left, y0: bounds.top, x1: bounds.right, y1: bounds.bottom };
}

/** The boxes `where` picks, in canvas order. Ids it names that are not on the image are not_found, as with annotationIds. */
export function rectsWhere(all: readonly FabricRectLike[], where: BoxWhere): FabricRectLike[] {
  if (where.annotationIds) {
    const present = new Set(all.map(ensureAnnotationId));
    const missing = [...where.annotationIds].filter((id) => !present.has(id));
    if (missing.length) throw new AgentToolError("not_found", `No box with annotationId ${missing.slice(0, 5).join(", ")}${missing.length > 5 ? ` (+${missing.length - 5})` : ""} on the current image.`);
  }
  return all.filter((rect) => matchesBoxWhere(whereBox(rect), where));
}

const finiteNumber = (value: unknown, label: string): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) throw new AgentToolError("invalid_args", `${label} must be a number.`);
  return value;
};

/** update_boxes' `change`: classId, shift {dx, dy}, resize {dw, dh, anchor}. */
function changeArg(value: unknown): { classId?: string; geometry?: BoxChange } {
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new AgentToolError("invalid_args", "change must be an object with classId, shift and/or resize.");
  const change = value as Record<string, unknown>;
  const geometry: BoxChange = {};
  if (change.shift != null) {
    const shift = change.shift as Record<string, unknown>;
    geometry.shift = { dx: finiteNumber(shift.dx ?? 0, "change.shift.dx"), dy: finiteNumber(shift.dy ?? 0, "change.shift.dy") };
  }
  if (change.resize != null) {
    const resize = change.resize as Record<string, unknown>;
    const anchor = resize.anchor ?? "center";
    if (anchor !== "center" && anchor !== "topLeft") throw new AgentToolError("invalid_args", "change.resize.anchor must be \"center\" or \"topLeft\".");
    geometry.resize = { dw: finiteNumber(resize.dw ?? 0, "change.resize.dw"), dh: finiteNumber(resize.dh ?? 0, "change.resize.dh"), anchor };
  }
  const classId = change.classId == null ? undefined : checkClassId(change.classId, "change");
  if (!classId && !geometry.shift && !geometry.resize) throw new AgentToolError("invalid_args", "change needs classId, shift or resize.");
  return { ...(classId ? { classId } : {}), ...(geometry.shift || geometry.resize ? { geometry } : {}) };
}

type ArrangeController = RuntimeCanvasController["raw"];
const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2;
};
/** arrange_boxes actions: each calls the Arrange button's function on the selection. */
const ARRANGE_ACTIONS: Record<string, (controller: ArrangeController, boxes: WhereBox[], size: string) => void> = {
  alignLeft: (controller) => controller.alignSelectionLeft(),
  alignRight: (controller) => controller.alignSelectionRight(),
  alignTop: (controller) => controller.alignSelectionTop(),
  alignBottom: (controller) => controller.alignSelectionBottom(),
  alignColumnCenters: (controller) => controller.alignSelectionColumnCenters(),
  alignRowCenters: (controller) => controller.alignSelectionRowCenters(),
  alignRowSetColumnCenters: (controller) => controller.alignSelectionRowSetColumnCenters(),
  distributeHorizontally: (controller) => controller.distributeSelectionHorizontally(),
  distributeVertically: (controller) => controller.distributeSelectionVertically(),
  // Every box to one width and height (the median, largest or smallest of them), around each box's centre.
  sameSize: (controller, boxes, size) => {
    const pick = size === "largest" ? (values: number[]) => Math.max(...values) : size === "smallest" ? (values: number[]) => Math.min(...values)
      : size === "median" ? median : null;
    if (!pick) throw new Error("size must be median, largest or smallest.");
    controller.resizeSelectedBoxes({ mode: "to", width: pick(boxes.map((box) => box.x1 - box.x0)), height: pick(boxes.map((box) => box.y1 - box.y0)) });
  }
};

function listArg(args: Record<string, unknown>, name: string): unknown[] {
  const value = args[name];
  if (!Array.isArray(value) || value.length === 0) throw new AgentToolError("invalid_args", `${name} must be a non-empty list.`);
  if (value.length > AGENT_EDIT_LIMIT) throw new AgentToolError("invalid_args", `At most ${AGENT_EDIT_LIMIT} ${name} per call.`);
  return value;
}

export function createAgentEditTools(deps: AgentEditToolDeps): Record<string, AgentTool> {
  const { state, canvasController } = deps;
  const raw = () => canvasController.raw;
  const imageSize = (): { width: number; height: number } => {
    if (state.session.workflow !== "detection") throw new AgentToolError("failed", "The app is in Segmentation; switch it to Detection to edit boxes.");
    const image = state.session.currentImage;
    if (!state.session.currentImageFile || !image) throw new AgentToolError("no_image", "No image is shown. Use go_to_image first.");
    return { width: image.width, height: image.height };
  };
  // Undo, redo and save act on whichever workflow is shown (the controller routes them).
  const requireImage = (): void => {
    if (!state.session.currentImageFile || !state.session.currentImage) throw new AgentToolError("no_image", "No image is shown. Use go_to_image first.");
  };
  const rectsById = (): Map<string, FabricRectLike> => new Map(raw().getObjects("rect").filter(isRectObject).map((rect) => [ensureAnnotationId(rect), rect]));
  const findRects = (ids: unknown[]): FabricRectLike[] => {
    const byId = rectsById();
    const missing = ids.map(String).filter((id) => !byId.has(id));
    if (missing.length) throw new AgentToolError("not_found", `No box with annotationId ${missing.slice(0, 5).join(", ")}${missing.length > 5 ? ` (+${missing.length - 5})` : ""} on the current image.`);
    return ids.map((id) => byId.get(String(id))!);
  };
  const summary = () => ({ boxCount: raw().getObjects("rect").filter(isRectObject).length, canUndo: raw().canUndo(), canRedo: raw().canRedo() });
  const edited = <T>(result: T): T & ReturnType<typeof summary> => {
    deps.afterEdit();
    return { ...result, ...summary() };
  };

  const addBoxes: AgentTool = {
    changesApp: true,
    async run(args) {
      const size = imageSize();
      const boxes = listArg(args, "boxes").map((value, index) => {
        const box = (value ?? {}) as Record<string, unknown>;
        const label = `boxes[${index}]`;
        const bounds = checkBox(box as unknown as PixelBox, size, label);
        return { classId: checkClassId(box.classId, label), x: bounds.x0, y: bounds.y0, width: bounds.x1 - bounds.x0, height: bounds.y1 - bounds.y0 };
      });
      const replace = optionalArg(args, "replaceExisting", "boolean") ?? false;
      const applied = raw().applyDetectionBoxes(boxes, { replaceExisting: replace });
      return edited({ annotationIds: applied.annotationIds });
    }
  };

  /** Every box `where` picks gets the same change (one undo step); boxes clipping would shrink under 1 px stay as they were. */
  const updateWhere = (size: { width: number; height: number }, where: BoxWhere, args: Record<string, unknown>) => {
    if (args.change == null) throw new AgentToolError("invalid_args", "change is required with where: classId, shift and/or resize for every matching box.");
    const change = changeArg(args.change);
    const picked = rectsWhere(raw().getObjects("rect").filter(isRectObject), where);
    const geometry: Array<{ annotationId: string; x: number; y: number; width: number; height: number }> = [];
    let clipped = 0;
    let skipped = 0;
    if (change.geometry) {
      for (const rect of picked) {
        const box = whereBox(rect);
        const next = changeBox(box, change.geometry, size);
        if (!next) { skipped += 1; continue; }
        if (next.clipped) clipped += 1;
        geometry.push({ annotationId: box.id, x: next.box.x0, y: next.box.y0, width: next.box.x1 - next.box.x0, height: next.box.y1 - next.box.y0 });
      }
    }
    const classes = change.classId ? picked.map((rect) => ({ annotationId: ensureAnnotationId(rect), classId: change.classId! })) : [];
    if (geometry.length || classes.length) {
      const controller = raw();
      const apply = () => {
        if (geometry.length) controller.updateBoxGeometries?.(geometry);
        if (classes.length) controller.updateBoxClasses?.(classes);
      };
      if (controller.runAsOneHistoryStep) controller.runAsOneHistoryStep(apply);
      else apply();
    }
    return edited({ matched: picked.length, moved: geometry.length, relabelled: classes.length, clippedToImage: clipped, skippedTooSmall: skipped });
  };

  const updateBoxes: AgentTool = {
    changesApp: true,
    async run(args) {
      const size = imageSize();
      const where = whereArg(args);
      if (where) {
        if (args.updates != null) throw new AgentToolError("invalid_args", "Give updates, or where with change, not both.");
        return updateWhere(size, where, args);
      }
      if (args.change != null) throw new AgentToolError("invalid_args", "change needs where (which boxes to change).");
      const updates = listArg(args, "updates").map((value) => (value ?? {}) as Record<string, unknown>);
      const rects = findRects(updates.map((update) => update.annotationId));
      const geometry: Array<{ annotationId: string; x: number; y: number; width: number; height: number }> = [];
      const classes: Array<{ annotationId: string; classId: string }> = [];
      updates.forEach((update, index) => {
        const rect = rects[index];
        const annotationId = ensureAnnotationId(rect);
        const label = `updates[${index}]`;
        if (["x0", "y0", "x1", "y1"].some((key) => update[key] !== undefined && update[key] !== null)) {
          rect.setCoords();
          const current = getRectBounds(rect);
          const pick = (key: keyof PixelBox, fallback: number) => (update[key] === undefined || update[key] === null ? fallback : update[key]) as number;
          const box = checkBox({ x0: pick("x0", current.left), y0: pick("y0", current.top), x1: pick("x1", current.right), y1: pick("y1", current.bottom) }, size, label);
          geometry.push({ annotationId, x: box.x0, y: box.y0, width: box.x1 - box.x0, height: box.y1 - box.y0 });
        }
        if (update.classId !== undefined && update.classId !== null) classes.push({ annotationId, classId: checkClassId(update.classId, label) });
      });
      if (!geometry.length && !classes.length) throw new AgentToolError("invalid_args", "Each update needs x0/y0/x1/y1 or classId.");
      const controller = raw();
      const apply = () => {
        if (geometry.length) controller.updateBoxGeometries?.(geometry);
        if (classes.length) controller.updateBoxClasses?.(classes);
      };
      if (controller.runAsOneHistoryStep) controller.runAsOneHistoryStep(apply);
      else apply();
      return edited({ moved: geometry.length, relabelled: classes.length });
    }
  };

  const deleteBoxes: AgentTool = {
    changesApp: true,
    async run(args) {
      imageSize();
      const where = whereArg(args);
      if (where && args.annotationIds != null) throw new AgentToolError("invalid_args", "Give annotationIds or where, not both.");
      const rects = where ? rectsWhere(raw().getObjects("rect").filter(isRectObject), where) : findRects(listArg(args, "annotationIds"));
      if (rects.length) {
        const controller = raw();
        if (controller.deleteBoxes) controller.deleteBoxes(rects);
        else {
          controller.setActiveSelection(rects, rects[0] ?? null);
          controller.deleteSelection();
        }
      }
      return edited({ deleted: rects.length });
    }
  };

  const selectBoxes: AgentTool = {
    changesApp: true,
    async run(args) {
      imageSize();
      const which = optionalArg(args, "select", "string");
      const ids = args.annotationIds;
      const classId = args.classId;
      const controller = raw();
      const where = whereArg(args);
      if (where) {
        const rects = rectsWhere(controller.getObjects("rect").filter(isRectObject), where);
        if (rects.length) controller.setActiveSelection(rects, rects[0]);
        else controller.canvas.discardActiveObject();
      } else if (Array.isArray(ids)) {
        const rects = findRects(ids);
        if (rects.length) controller.setActiveSelection(rects, rects[0]);
        else controller.canvas.discardActiveObject();
      } else if (classId !== undefined && classId !== null) {
        controller.selectLabelsByClass(checkClassId(classId, "select_boxes"));
      } else if (which === "all") {
        controller.selectAllLabels();
      } else if (which === "none") {
        controller.canvas.discardActiveObject();
      } else {
        throw new AgentToolError("invalid_args", "Give annotationIds, where, classId, or select \"all\" / \"none\".");
      }
      controller.renderAll();
      const selectedIds = controller.canvas.getActiveObjects().filter(isRectObject).map(ensureAnnotationId);
      return edited({ selectedIds });
    }
  };

  /**
   * The Arrange buttons on a set of boxes: they become the selection, then the button's own function runs (one undo
   * step). Center alignments group by the person's tolerance slider, as the buttons do.
   */
  const arrangeBoxes: AgentTool = {
    changesApp: true,
    async run(args) {
      imageSize();
      const controller = raw();
      const action = optionalArg(args, "action", "string");
      const where = whereArg(args);
      const all = controller.getObjects("rect").filter(isRectObject);
      const targets = where ? rectsWhere(all, where)
        : Array.isArray(args.annotationIds) ? findRects(listArg(args, "annotationIds"))
          : optionalArg(args, "scope", "string") === "all" ? all
            : controller.canvas.getActiveObjects().filter(isRectObject);
      const run = ARRANGE_ACTIONS[action ?? ""];
      if (!run) throw new AgentToolError("invalid_args", `action must be one of ${Object.keys(ARRANGE_ACTIONS).join(", ")}.`);
      const needed = action === "distributeHorizontally" || action === "distributeVertically" ? 3 : action === "sameSize" ? 1 : 2;
      if (targets.length < needed) throw new AgentToolError("invalid_args", `${action} needs at least ${needed} boxes; ${targets.length} matched (give where, annotationIds or scope "all").`);
      const before = new Map(targets.map((rect) => [rect, whereBox(rect)]));
      controller.setActiveSelection(targets, targets[0] ?? null);
      try {
        run(controller, targets.map((rect) => before.get(rect)!), optionalArg(args, "size", "string") ?? "median");
      } catch (error) {
        throw new AgentToolError("invalid_args", error instanceof Error ? error.message : String(error));
      }
      let moved = 0;
      let maxShift = 0;
      for (const rect of targets) {
        const was = before.get(rect)!;
        const now = whereBox(rect);
        const shift = Math.max(Math.abs(now.x0 - was.x0), Math.abs(now.y0 - was.y0), Math.abs(now.x1 - was.x1), Math.abs(now.y1 - was.y1));
        if (shift > 1e-6) moved += 1;
        maxShift = Math.max(maxShift, shift);
      }
      return edited({ action, boxes: targets.length, moved, maxShiftPx: Math.round(maxShift * 100) / 100 });
    }
  };

  const history = (direction: "undo" | "redo"): AgentTool => ({
    changesApp: true,
    async run(args) {
      requireImage();
      const steps = Math.min(UNDO_LIMIT, Math.max(1, Math.floor(optionalArg(args, "steps", "number") ?? 1)));
      const controller = raw();
      let done = 0;
      while (done < steps && (direction === "undo" ? controller.canUndo() : controller.canRedo())) {
        if (direction === "undo") controller.undo();
        else controller.redo();
        done += 1;
      }
      return edited(direction === "undo" ? { undone: done } : { redone: done });
    }
  });

  const pathOf = deps.pathOf ?? (() => null);
  const save: AgentTool = {
    changesApp: true,
    async run() {
      requireImage();
      try {
        const result = await deps.fileSystem.saveLabelsWithResult();
        if (!result?.saved || !result.output) throw new AgentToolError("no_image", "No image was available when the save started.");
        const info = outputInfo(result.output, pathOf);
        deps.afterEdit();
        return {
          ...info, saved: info.image, success: true, writtenPaths: info.paths,
          action: result.hasLabels ? "written" : "written_empty",
          ...(result.boxCount !== undefined ? { boxCount: result.boxCount } : {}),
          ...(result.mask ?? {}),
          unsavedChanges: hasDirtyDocuments(state)
        };
      } catch (error) {
        if (!(error instanceof AnnotationSaveError)) throw error;
        const { output, writtenPaths } = error;
        throw new AgentToolError("failed", error.message, {
          ...outputInfo(output, pathOf), saved: null, success: false,
          action: writtenPaths.length ? "partially_written" : "not_written",
          writtenPaths: writtenPaths.map((path) => outputPath(output.folder!, path, pathOf)),
          error: error.message
        });
      }
    }
  };

  return {
    add_boxes: addBoxes,
    update_boxes: updateBoxes,
    delete_boxes: deleteBoxes,
    select_boxes: selectBoxes,
    arrange_boxes: arrangeBoxes,
    undo: history("undo"),
    redo: history("redo"),
    save
  };
}
