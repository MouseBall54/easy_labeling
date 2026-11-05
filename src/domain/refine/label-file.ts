import type { RefineBoxInput, RefineRect } from "./edge-refine.js";

/**
 * Refine's folder run on one YOLO label file: the boxes it refines and the text it writes back.
 * crates/el-core/src/refine_folder.rs reads label files the same way (keep the two in step).
 */

/** Label rows as boxes in pixels (id = line index). Lines that are not 5 numbers with a positive size stay as they are. */
export function labelFileBoxes(yolo: string, width: number, height: number): { lines: string[]; boxes: RefineBoxInput[] } {
  const lines = yolo.split(/\r?\n/);
  const boxes: RefineBoxInput[] = [];
  lines.forEach((line, index) => {
    const fields = line.trim().split(/\s+/);
    const [cx, cy, w, h] = fields.slice(1).map(Number);
    if (fields.length !== 5 || ![cx, cy, w, h].every(Number.isFinite) || w <= 0 || h <= 0) return;
    boxes.push({ id: String(index), classId: fields[0], x0: (cx - w / 2) * width, y0: (cy - h / 2) * height, x1: (cx + w / 2) * width, y1: (cy + h / 2) * height });
  });
  return { lines, boxes };
}

/** A box counts as moved when any edge moved this far (px). */
export const LABEL_FILE_MOVE_EPSILON = 1e-6;

export const movedBy = (a: RefineRect, b: RefineRect, eps: number): boolean =>
  !(Math.abs(a.x0 - b.x0) < eps && Math.abs(a.y0 - b.y0) < eps && Math.abs(a.x1 - b.x1) < eps && Math.abs(a.y1 - b.y1) < eps);

/** Same row format as serializeRectsToYolo. */
export const yoloRow = (classId: string, b: RefineRect, width: number, height: number): string =>
  `${classId} ${[(b.x0 + b.x1) / 2 / width, (b.y0 + b.y1) / 2 / height, (b.x1 - b.x0) / width, (b.y1 - b.y0) / height].map((v) => v.toFixed(15)).join(" ")}`;

/** A refined box to write back: its line, class and new bounds. */
export interface LabelFileChange { line: number; classId: string; box: RefineRect }

/** The file with each change's line rewritten (lines joined with "\n"), or null when nothing changed. */
export function applyLabelFileChanges(lines: readonly string[], changes: readonly LabelFileChange[], width: number, height: number): string | null {
  if (!changes.length) return null;
  const out = [...lines];
  for (const change of changes) out[change.line] = yoloRow(change.classId, change.box, width, height);
  return out.join("\n");
}
