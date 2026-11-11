/**
 * Agent tools that edit the current image's boxes (stage 2 of docs/AGENT_MCP_PLAN_KO.md, section 4.2).
 * Every call is one undo step, through the same canvas methods the app's own tools use.
 */
import type { AppState } from "../app/state.js";
import { hasDirtyDocuments } from "../app/document-status.js";
import { parseNonNegativeClassId } from "../domain/class-id.js";
import { AgentToolError, optionalArg, type AgentTool } from "../features/agent/agent-api.js";
import { getRectBounds } from "../features/canvas/arrange.js";
import { ensureAnnotationId, isRectObject, type FabricRectLike } from "../features/canvas/fabric-types.js";
import type { RuntimeCanvasController } from "./canvas-controller-adapter.js";
import type { RuntimeFileSystem } from "./file-system-adapter.js";

export interface AgentEditToolDeps {
  state: AppState;
  canvasController: RuntimeCanvasController;
  fileSystem: RuntimeFileSystem;
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

  const updateBoxes: AgentTool = {
    changesApp: true,
    async run(args) {
      const size = imageSize();
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
      const rects = findRects(listArg(args, "annotationIds"));
      raw().setActiveSelection(rects, rects[0] ?? null);
      raw().deleteSelection();
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
      if (Array.isArray(ids)) {
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
        throw new AgentToolError("invalid_args", "Give annotationIds, classId, or select \"all\" / \"none\".");
      }
      controller.renderAll();
      const selectedIds = controller.canvas.getActiveObjects().filter(isRectObject).map(ensureAnnotationId);
      return edited({ selectedIds });
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

  const save: AgentTool = {
    changesApp: true,
    async run() {
      requireImage();
      await deps.fileSystem.saveLabels();
      deps.afterEdit();
      return { saved: state.session.currentImageFile?.name ?? null, unsavedChanges: hasDirtyDocuments(state) };
    }
  };

  return {
    add_boxes: addBoxes,
    update_boxes: updateBoxes,
    delete_boxes: deleteBoxes,
    select_boxes: selectBoxes,
    undo: history("undo"),
    redo: history("redo"),
    save
  };
}
