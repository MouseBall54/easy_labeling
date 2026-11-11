/**
 * Scores a label set against reference labels (ground truth): boxes are paired one-to-one by IoU (largest first,
 * class ignored, so a right box with the wrong class shows as a class confusion rather than a miss plus an extra),
 * then precision / recall, per-side edge errors and per-side bias in pixels. The score an agent tunes settings
 * against. DOM-free; boxes come in pixels.
 */
import type { StatBox } from "../refine/box-statistics.js";

export interface MatchedPair { label: StatBox; reference: StatBox; iou: number }

export interface ImageMatch {
  image: string;
  matched: MatchedPair[];
  /** Label boxes no reference box pairs with (false positives). */
  extras: StatBox[];
  /** Reference boxes no label box pairs with (missed objects). */
  misses: StatBox[];
}

type Side = "T" | "B" | "L" | "R";

export interface LabelComparison {
  images: number;
  boxes: { reference: number; labels: number; matched: number; correct: number; wrongClass: number; extras: number; misses: number };
  /** With classAware, a pair counts only when the classes agree. */
  precision: number;
  recall: number;
  f1: number;
  meanIou: number;
  /** Matched pairs: |label edge - reference edge| over all four sides, in pixels. */
  edgeErrorPx: { mean: number; median: number; p90: number; max: number };
  /** Matched pairs: median outward offset per side (label - reference); + = labels reach further out on that side. */
  edgeBiasPx: Record<Side, number>;
  /** By reference class (extras by their own class). */
  byClass: Record<string, { reference: number; labels: number; correct: number; misses: number; extras: number; precision: number; recall: number; medianEdgeErrorPx: number }>;
  /** "referenceClass->labelClass": matched pairs whose classes differ. */
  confusions: Record<string, number>;
  /** The images with the lowest F1 first. */
  perImage: Array<{ image: string; reference: number; labels: number; precision: number; recall: number; f1: number; meanEdgeErrorPx: number }>;
  worst: {
    misses: Array<{ image: string; reference: StatBox }>;
    extras: Array<{ image: string; label: StatBox }>;
    wrongClass: Array<{ image: string; label: StatBox; reference: StatBox; iou: number }>;
    /** Matched pairs with the largest single-side error. */
    edges: Array<{ image: string; label: StatBox; reference: StatBox; iou: number; maxEdgeErrorPx: number; outwardPx: Record<Side, number> }>;
  };
}

export function boxIou(a: StatBox, b: StatBox): number {
  const w = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
  const h = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
  if (w <= 0 || h <= 0) return 0;
  const inter = w * h;
  return inter / ((a.x1 - a.x0) * (a.y1 - a.y0) + (b.x1 - b.x0) * (b.y1 - b.y0) - inter);
}

/** Greedy one-to-one pairing by IoU, largest first; pairs under `minIou` stay unmatched. */
export function matchBoxes(image: string, labels: readonly StatBox[], reference: readonly StatBox[], minIou = 0.5): ImageMatch {
  // ponytail: every label x reference pair (about 1 M for 1000 x 1000 boxes); a sweep on x0 if images reach tens of thousands.
  const candidates: Array<{ l: number; r: number; iou: number }> = [];
  labels.forEach((label, l) => reference.forEach((ref, r) => {
    if (label.x1 <= ref.x0 || ref.x1 <= label.x0 || label.y1 <= ref.y0 || ref.y1 <= label.y0) return;
    const iou = boxIou(label, ref);
    if (iou >= minIou) candidates.push({ l, r, iou });
  }));
  candidates.sort((a, b) => b.iou - a.iou);
  const usedLabels = new Set<number>();
  const usedReference = new Set<number>();
  const matched: MatchedPair[] = [];
  for (const { l, r, iou } of candidates) {
    if (usedLabels.has(l) || usedReference.has(r)) continue;
    usedLabels.add(l);
    usedReference.add(r);
    matched.push({ label: labels[l]!, reference: reference[r]!, iou });
  }
  return {
    image, matched,
    extras: labels.filter((_, index) => !usedLabels.has(index)),
    misses: reference.filter((_, index) => !usedReference.has(index))
  };
}

const outward = (label: StatBox, reference: StatBox): Record<Side, number> => ({
  T: reference.y0 - label.y0, B: label.y1 - reference.y1, L: reference.x0 - label.x0, R: label.x1 - reference.x1
});

const round = (value: number, digits = 3): number => Number.isFinite(value) ? Number(value.toFixed(digits)) : 0;
const share = (part: number, whole: number): number => whole ? round(part / whole) : 0;
const f1Of = (precision: number, recall: number): number => precision + recall ? round(2 * precision * recall / (precision + recall)) : 0;
const sortedMedian = (sorted: readonly number[]): number => sorted.length ? sorted[(sorted.length - 1) >> 1]! : 0;
const ascending = (values: number[]): number[] => values.sort((a, b) => a - b);

export function summarizeComparison(images: readonly ImageMatch[], options: { classAware?: boolean; limit?: number } = {}): LabelComparison {
  const classAware = options.classAware ?? true;
  const limit = options.limit ?? 20;
  const counts = { reference: 0, labels: 0, matched: 0, correct: 0, wrongClass: 0, extras: 0, misses: 0 };
  const errors: number[] = [];
  const bias: Record<Side, number[]> = { T: [], B: [], L: [], R: [] };
  let iouSum = 0;
  const classes = new Map<string, { reference: number; labels: number; correct: number; misses: number; extras: number; errors: number[] }>();
  const classEntry = (id: string) => {
    const entry = classes.get(id) ?? { reference: 0, labels: 0, correct: 0, misses: 0, extras: 0, errors: [] };
    classes.set(id, entry);
    return entry;
  };
  const confusions: Record<string, number> = {};
  const worst: LabelComparison["worst"] = { misses: [], extras: [], wrongClass: [], edges: [] };
  const perImage: LabelComparison["perImage"] = [];
  for (const record of images) {
    let imageCorrect = 0;
    const imageErrors: number[] = [];
    for (const pair of record.matched) {
      const sameClass = pair.label.classId === pair.reference.classId;
      const counted = sameClass || !classAware;
      counts.matched += 1;
      iouSum += pair.iou;
      if (counted) {
        counts.correct += 1;
        imageCorrect += 1;
      }
      if (!sameClass) {
        counts.wrongClass += 1;
        confusions[`${pair.reference.classId}->${pair.label.classId}`] = (confusions[`${pair.reference.classId}->${pair.label.classId}`] ?? 0) + 1;
        worst.wrongClass.push({ image: record.image, label: pair.label, reference: pair.reference, iou: round(pair.iou) });
      }
      const refClass = classEntry(pair.reference.classId);
      refClass.reference += 1;
      if (counted) refClass.correct += 1;
      classEntry(pair.label.classId).labels += 1;
      const sides = outward(pair.label, pair.reference);
      let maxError = 0;
      for (const side of ["T", "B", "L", "R"] as const) {
        const error = Math.abs(sides[side]);
        errors.push(error);
        imageErrors.push(error);
        refClass.errors.push(error);
        bias[side].push(sides[side]);
        maxError = Math.max(maxError, error);
      }
      worst.edges.push({
        image: record.image, label: pair.label, reference: pair.reference, iou: round(pair.iou), maxEdgeErrorPx: round(maxError, 2),
        outwardPx: { T: round(sides.T, 2), B: round(sides.B, 2), L: round(sides.L, 2), R: round(sides.R, 2) }
      });
    }
    for (const box of record.misses) {
      const entry = classEntry(box.classId);
      entry.reference += 1;
      entry.misses += 1;
      worst.misses.push({ image: record.image, reference: box });
    }
    for (const box of record.extras) {
      const entry = classEntry(box.classId);
      entry.labels += 1;
      entry.extras += 1;
      worst.extras.push({ image: record.image, label: box });
    }
    const reference = record.matched.length + record.misses.length;
    const labels = record.matched.length + record.extras.length;
    counts.reference += reference;
    counts.labels += labels;
    counts.extras += record.extras.length;
    counts.misses += record.misses.length;
    const precision = share(imageCorrect, labels);
    const recall = share(imageCorrect, reference);
    perImage.push({
      image: record.image, reference, labels, precision, recall, f1: f1Of(precision, recall),
      meanEdgeErrorPx: imageErrors.length ? round(imageErrors.reduce((sum, value) => sum + value, 0) / imageErrors.length, 2) : 0
    });
  }
  ascending(errors);
  const precision = share(counts.correct, counts.labels);
  const recall = share(counts.correct, counts.reference);
  worst.edges.sort((a, b) => b.maxEdgeErrorPx - a.maxEdgeErrorPx);
  worst.wrongClass.sort((a, b) => b.iou - a.iou);
  perImage.sort((a, b) => a.f1 - b.f1 || b.meanEdgeErrorPx - a.meanEdgeErrorPx);
  return {
    images: images.length,
    boxes: counts,
    precision, recall, f1: f1Of(precision, recall),
    meanIou: share(iouSum, counts.matched),
    edgeErrorPx: {
      mean: errors.length ? round(errors.reduce((sum, value) => sum + value, 0) / errors.length, 2) : 0,
      median: round(sortedMedian(errors), 2), p90: round(errors[Math.max(0, Math.ceil(errors.length * 0.9) - 1)] ?? 0, 2), max: round(errors.at(-1) ?? 0, 2)
    },
    edgeBiasPx: { T: round(sortedMedian(ascending(bias.T)), 2), B: round(sortedMedian(ascending(bias.B)), 2), L: round(sortedMedian(ascending(bias.L)), 2), R: round(sortedMedian(ascending(bias.R)), 2) },
    byClass: Object.fromEntries([...classes].sort(([a], [b]) => Number(a) - Number(b)).map(([id, entry]) => [id, {
      reference: entry.reference, labels: entry.labels, correct: entry.correct, misses: entry.misses, extras: entry.extras,
      precision: share(entry.correct, entry.labels), recall: share(entry.correct, entry.reference), medianEdgeErrorPx: round(sortedMedian(ascending(entry.errors)), 2)
    }])),
    confusions,
    perImage,
    worst: {
      misses: worst.misses.slice(0, limit), extras: worst.extras.slice(0, limit),
      wrongClass: worst.wrongClass.slice(0, limit), edges: worst.edges.filter((edge) => edge.maxEdgeErrorPx > 0).slice(0, limit)
    }
  };
}
