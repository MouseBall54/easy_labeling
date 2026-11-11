/**
 * A folder (or sample) Refine / Reclass dry run as numbers an agent can judge without looking at captures:
 * distributions, review reasons, per-class figures and the outliers to inspect first. Both the desktop app's
 * Rust batch and the TS path feed it the same per-box results, so the summary cannot differ between them.
 * DOM-free.
 */
import { analyzeBoxes, type BoxFindingType } from "./box-statistics.js";
import type { RefineBoxInput, RefineRect, RefineResult, RefineSide } from "./edge-refine.js";

/** One image of an edge dry run: every box read from its label file, and the refine result of each box that moved or was flagged. */
export interface EdgeImageRecord {
  image: string;
  boxes: readonly RefineBoxInput[];
  /** Results by box id (the label file line); boxes without one stayed where they were and were not flagged. */
  results: ReadonlyMap<string, RefineResult>;
}

/** One image of a reclass dry run: its boxes and the class changes the rule made. */
export interface ReclassImageRecord {
  image: string;
  boxes: readonly RefineBoxInput[];
  changes: ReadonlyArray<{ line: number; from: string; to: string }>;
}

export interface Spread { median: number; p90: number; max: number }

export interface EdgeFolderSummary {
  images: { checked: number; withChanges: number; failed: number };
  boxes: { total: number; moved: number; flagged: number; flaggedPercent: number };
  /** Flagged boxes by reason (one box can have several). */
  flaggedBy: { weakSide: number; areaChange: number; sizeLimit: number };
  weakSides: Record<RefineSide, number>;
  /** Moved boxes: the largest side shift of each box, in pixels. */
  shiftPx: Spread;
  /** Moved boxes: area change in percent (negative = shrank). */
  areaChangePercent: { median: number; p10: number; p90: number; min: number; max: number };
  /** Boxes with a result: refine confidence 0..1 (low = unsure). */
  confidence: { p10: number; median: number };
  byClass: Record<string, { boxes: number; moved: number; flagged: number; medianShiftPx: number }>;
  outliers: {
    /** Flagged boxes first, then the largest shifts. */
    boxes: Array<{ image: string; line: number; classId: string; shiftPx: number; areaChangePercent: number; confidence: number; sideConfidence: Partial<Record<RefineSide, number>>; reasons: string[]; before: RefineRect; after: RefineRect }>;
    /** Images with the most flagged boxes (share of their boxes). */
    images: Array<{ image: string; boxes: number; moved: number; flagged: number; flaggedPercent: number }>;
  };
  /** Population checks (box-statistics) on the boxes as Refine would leave them: size outliers, off-row/column, crowded, overlapping duplicates, missing positions. */
  afterRefine: {
    counts: Record<BoxFindingType | "missing", number>;
    images: Array<{ image: string; counts: Record<BoxFindingType | "missing", number> }>;
  };
}

export interface ReclassFolderSummary {
  images: { checked: number; withChanges: number; failed: number };
  boxes: { total: number; changed: number; changedPercent: number };
  /** "from->to": boxes. */
  changesByClass: Record<string, number>;
  outliers: { images: Array<{ image: string; boxes: number; changed: number; changedPercent: number }> };
}

const round = (value: number, digits = 2): number => Number.isFinite(value) ? Number(value.toFixed(digits)) : 0;
const percent = (part: number, whole: number): number => whole ? round(part / whole * 100) : 0;

/** Nearest-rank quantile of an ascending list (0 when empty). */
export function quantile(sorted: readonly number[], q: number): number {
  if (!sorted.length) return 0;
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil(q * sorted.length) - 1))]!;
}

const ascending = (values: number[]): number[] => values.sort((a, b) => a - b);

/** The largest distance any side moved. */
export function largestShift(before: RefineRect, after: RefineRect): number {
  return Math.max(Math.abs(after.x0 - before.x0), Math.abs(after.y0 - before.y0), Math.abs(after.x1 - before.x1), Math.abs(after.y1 - before.y1));
}

function reasonsOf(result: RefineResult): string[] {
  return [
    ...(result.weakSides.length ? [`weak ${result.weakSides.join("")}`] : []),
    ...(result.areaFlagged ? ["area change"] : []),
    ...(result.sizeLimited ? ["size limit"] : [])
  ];
}

export function summarizeEdgeFolder(images: readonly EdgeImageRecord[], options: { failed?: number; outliers?: number; moveEpsilon?: number } = {}): EdgeFolderSummary {
  const limit = options.outliers ?? 20;
  const epsilon = options.moveEpsilon ?? 1e-6;
  const shifts: number[] = [];
  const areas: number[] = [];
  const confidences: number[] = [];
  const weakSides: Record<RefineSide, number> = { T: 0, B: 0, R: 0, L: 0 };
  const flaggedBy = { weakSide: 0, areaChange: 0, sizeLimit: 0 };
  const classes = new Map<string, { boxes: number; moved: number; flagged: number; shifts: number[] }>();
  const outlierBoxes: EdgeFolderSummary["outliers"]["boxes"] = [];
  const perImage: EdgeFolderSummary["outliers"]["images"] = [];
  let total = 0;
  let moved = 0;
  let flagged = 0;
  let withChanges = 0;
  const afterCounts: Record<BoxFindingType | "missing", number> = { size: 0, "off-row": 0, "off-column": 0, crowded: 0, overlap: 0, missing: 0 };
  const afterImages: EdgeFolderSummary["afterRefine"]["images"] = [];
  for (const record of images) {
    const after = analyzeBoxes(record.boxes.map((box) => ({ ...box, ...(record.results.get(box.id)?.box ?? {}) })));
    const issues = Object.values(after.counts).reduce((sum, count) => sum + count, 0);
    for (const key of Object.keys(afterCounts) as Array<keyof typeof afterCounts>) afterCounts[key] += after.counts[key];
    if (issues) afterImages.push({ image: record.image, counts: after.counts });
    let imageMoved = 0;
    let imageFlagged = 0;
    for (const box of record.boxes) {
      total += 1;
      const entry = classes.get(box.classId) ?? { boxes: 0, moved: 0, flagged: 0, shifts: [] };
      classes.set(box.classId, entry);
      entry.boxes += 1;
      const result = record.results.get(box.id);
      if (!result) continue;
      confidences.push(result.conf);
      const shift = largestShift(box, result.box);
      const didMove = shift > epsilon;
      const areaPercent = result.areaChange * 100;
      if (didMove) {
        moved += 1;
        imageMoved += 1;
        entry.moved += 1;
        entry.shifts.push(shift);
        shifts.push(shift);
        areas.push(areaPercent);
      }
      if (result.flagged) {
        flagged += 1;
        imageFlagged += 1;
        entry.flagged += 1;
        if (result.weakSides.length) flaggedBy.weakSide += 1;
        if (result.areaFlagged) flaggedBy.areaChange += 1;
        if (result.sizeLimited) flaggedBy.sizeLimit += 1;
        for (const side of result.weakSides) weakSides[side] += 1;
      }
      if (didMove || result.flagged) {
        outlierBoxes.push({
          image: record.image, line: Number(box.id), classId: box.classId, shiftPx: round(shift), areaChangePercent: round(areaPercent),
          confidence: round(result.conf, 3), sideConfidence: Object.fromEntries(Object.entries(result.sideConf).map(([side, value]) => [side, round(value ?? 0, 3)])), reasons: reasonsOf(result), before: { x0: box.x0, y0: box.y0, x1: box.x1, y1: box.y1 }, after: result.box
        });
      }
    }
    if (imageMoved) withChanges += 1;
    perImage.push({ image: record.image, boxes: record.boxes.length, moved: imageMoved, flagged: imageFlagged, flaggedPercent: percent(imageFlagged, record.boxes.length) });
  }
  ascending(shifts);
  ascending(areas);
  ascending(confidences);
  // ponytail: full sorts of every moved box; a selection would do for the top N if folders reach millions of boxes.
  outlierBoxes.sort((a, b) => (b.reasons.length ? 1 : 0) - (a.reasons.length ? 1 : 0) || b.shiftPx - a.shiftPx);
  perImage.sort((a, b) => b.flaggedPercent - a.flaggedPercent || b.flagged - a.flagged);
  return {
    images: { checked: images.length, withChanges, failed: options.failed ?? 0 },
    boxes: { total, moved, flagged, flaggedPercent: percent(flagged, total) },
    flaggedBy,
    weakSides,
    shiftPx: { median: round(quantile(shifts, 0.5)), p90: round(quantile(shifts, 0.9)), max: round(shifts.at(-1) ?? 0) },
    areaChangePercent: {
      median: round(quantile(areas, 0.5)), p10: round(quantile(areas, 0.1)), p90: round(quantile(areas, 0.9)),
      min: round(areas[0] ?? 0), max: round(areas.at(-1) ?? 0)
    },
    confidence: { p10: round(quantile(confidences, 0.1), 3), median: round(quantile(confidences, 0.5), 3) },
    byClass: Object.fromEntries([...classes].sort(([a], [b]) => Number(a) - Number(b)).map(([classId, entry]) => [classId, {
      boxes: entry.boxes, moved: entry.moved, flagged: entry.flagged, medianShiftPx: round(quantile(ascending(entry.shifts), 0.5))
    }])),
    outliers: { boxes: outlierBoxes.slice(0, limit), images: perImage.filter((image) => image.flagged > 0).slice(0, limit) },
    afterRefine: {
      counts: afterCounts,
      images: afterImages.sort((a, b) => Object.values(b.counts).reduce((x, y) => x + y, 0) - Object.values(a.counts).reduce((x, y) => x + y, 0)).slice(0, limit)
    }
  };
}

export function summarizeReclassFolder(images: readonly ReclassImageRecord[], options: { failed?: number; outliers?: number } = {}): ReclassFolderSummary {
  const limit = options.outliers ?? 20;
  const changesByClass: Record<string, number> = {};
  const perImage: ReclassFolderSummary["outliers"]["images"] = [];
  let total = 0;
  let changed = 0;
  for (const record of images) {
    total += record.boxes.length;
    changed += record.changes.length;
    for (const change of record.changes) changesByClass[`${change.from}->${change.to}`] = (changesByClass[`${change.from}->${change.to}`] ?? 0) + 1;
    perImage.push({ image: record.image, boxes: record.boxes.length, changed: record.changes.length, changedPercent: percent(record.changes.length, record.boxes.length) });
  }
  perImage.sort((a, b) => b.changedPercent - a.changedPercent || b.changed - a.changed);
  return {
    images: { checked: images.length, withChanges: perImage.filter((image) => image.changed > 0).length, failed: options.failed ?? 0 },
    boxes: { total, changed, changedPercent: percent(changed, total) },
    changesByClass,
    outliers: { images: perImage.filter((image) => image.changed > 0).slice(0, limit) }
  };
}

/** `count` image indexes spread evenly over `total` (first and last included), for a repeatable sample. */
export function evenSample(total: number, count: number): number[] {
  if (count >= total) return Array.from({ length: total }, (_, index) => index);
  if (count <= 1) return count === 1 ? [0] : [];
  return Array.from({ length: count }, (_, index) => Math.round(index * (total - 1) / (count - 1)));
}
