import type { GrayImage, RefineBoxInput, RefineRect } from "./edge-refine.js";

/**
 * Recenter: moves a box (its size kept) so its centre sits on the centroid of the target pixels around it. The
 * region is the box grown (positive margins) or shrunk (negative) on each side by a share of its size; target
 * pixels are >= level, or <= level when dark. Each target pixel counts the same. With `component: "nearest"`
 * only the 8-connected group of target pixels nearest the box centre counts. Too few pixels, or a shift past
 * maxShift, leave the box where it is. Ported to Rust in crates/el-core/src/recenter.rs; keep both in step.
 */
export interface RecenterRule {
  /** Classes this rule moves; empty = every class. */
  fromClasses: string[];
  /** Share of the box height (top, bottom) or width (left, right) added outside on each side; negative shrinks. */
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  target: { level: number; dark: boolean };
  /** Which axes move: x (horizontal), y (vertical) or both. */
  axis: "x" | "y" | "both";
  /** nearest: only the connected group nearest the box centre; all: every target pixel in the region. */
  component: "nearest" | "all";
  /** The counted pixels must be at least this share of the region (0-1) ... */
  minRatio: number;
  /** ... and at least this many. */
  minPixels: number;
  /** Largest shift as a share of the box width (x) or height (y); a larger one leaves the box. */
  maxShift: number;
}

export type RecenterStatus = "moved" | "centred" | "notFound" | "tooFew" | "tooFar";

export interface RecenterResult {
  id: string;
  classId: string;
  status: RecenterStatus;
  /** The box after the run (the input box unless status is "moved"). */
  box: RefineRect;
  /** Measured centre offset on the moving axes (0 on an axis that does not move), before any clamp. */
  shiftX: number;
  shiftY: number;
  /** Pixels the centroid counts, and their share of the region. */
  count: number;
  ratio: number;
}

export const MIN_MARGIN = -0.45;
export const MAX_MARGIN = 3;

export function createRecenterRule(): RecenterRule {
  return {
    fromClasses: [],
    marginTop: 0.25,
    marginBottom: 0.25,
    marginLeft: 0.25,
    marginRight: 0.25,
    target: { level: 128, dark: false },
    axis: "both",
    component: "nearest",
    minRatio: 0.05,
    minPixels: 4,
    maxShift: 0.5
  };
}

const bounded = (value: unknown, fallback: number, lo: number, hi: number): number => {
  const n = typeof value === "number" ? value : typeof value === "string" && value.trim() ? Number(value) : NaN;
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : fallback;
};
const record = (value: unknown): Record<string, unknown> => (typeof value === "object" && value !== null ? value as Record<string, unknown> : {});
const classId = (value: unknown): string => (typeof value === "string" || typeof value === "number" ? String(value).trim() : "");

export function normalizeRecenterRule(value: unknown): RecenterRule {
  const d = createRecenterRule();
  const v = record(value);
  const target = record(v.target);
  const margin = (key: "marginTop" | "marginBottom" | "marginLeft" | "marginRight"): number => bounded(v[key], d[key], MIN_MARGIN, MAX_MARGIN);
  return {
    fromClasses: Array.isArray(v.fromClasses) ? [...new Set(v.fromClasses.map(classId).filter(Boolean))] : [],
    marginTop: margin("marginTop"),
    marginBottom: margin("marginBottom"),
    marginLeft: margin("marginLeft"),
    marginRight: margin("marginRight"),
    target: { level: bounded(target.level, d.target.level, 0, 255), dark: target.dark === true },
    axis: v.axis === "x" || v.axis === "y" ? v.axis : "both",
    component: v.component === "all" ? "all" : "nearest",
    minRatio: bounded(v.minRatio, d.minRatio, 0, 1),
    minPixels: Math.round(bounded(v.minPixels, d.minPixels, 1, 1_000_000)),
    maxShift: bounded(v.maxShift, d.maxShift, 0, 5)
  };
}

export function recenterChecks(rule: RecenterRule, boxClass: string): boolean {
  return rule.fromClasses.length === 0 || rule.fromClasses.includes(boxClass);
}

/** JS Math.round for the non-negative and negative values alike, written so Rust can match it bit for bit. */
const roundHalfUp = (value: number): number => Math.floor(value + 0.5);

/** The region in whole pixels, clipped to the image, never smaller than 1 x 1. */
export function recenterRegion(box: RefineRect, rule: RecenterRule, bounds: { width: number; height: number }): RefineRect {
  const axis = (lo: number, hi: number, size: number, before: number, after: number): [number, number] => {
    const span = hi - lo;
    const start = Math.min(Math.max(0, roundHalfUp(lo - span * before)), size - 1);
    const end = Math.max(start + 1, Math.min(size, roundHalfUp(hi + span * after)));
    return [start, end];
  };
  const [x0, x1] = axis(box.x0, box.x1, bounds.width, rule.marginLeft, rule.marginRight);
  const [y0, y1] = axis(box.y0, box.y1, bounds.height, rule.marginTop, rule.marginBottom);
  return { x0, y0, x1, y1 };
}

export interface RecenterAnalysis {
  region: RefineRect;
  /** Region-sized, row-major: 0 = not a target, 1 = counted, 2 = a target left out (another group). */
  mask: Uint8Array;
  targets: number;
  count: number;
  /** Centroid of the counted pixels (pixel centres), or null when none counted. */
  centroid: { x: number; y: number } | null;
}

/** The pixels a recenter reads and counts; recenterBox judges from it, the Refine Lab draws it. */
export function analyzeRecenter(img: GrayImage, box: RefineRect, rule: RecenterRule): RecenterAnalysis {
  const region = recenterRegion(box, rule, img);
  const w = region.x1 - region.x0;
  const h = region.y1 - region.y0;
  const mask = new Uint8Array(w * h);
  const { level, dark } = rule.target;
  let targets = 0;
  for (let y = 0; y < h; y += 1) {
    const row = (region.y0 + y) * img.width + region.x0;
    for (let x = 0; x < w; x += 1) {
      const v = img.gray[row + x];
      if (dark ? v <= level : v >= level) { mask[y * w + x] = 1; targets += 1; }
    }
  }
  if (targets && rule.component === "nearest") keepNearestComponent(mask, w, h, (box.x0 + box.x1) / 2 - region.x0, (box.y0 + box.y1) / 2 - region.y0);
  let count = 0;
  let sumX = 0;
  let sumY = 0;
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      if (mask[y * w + x] !== 1) continue;
      count += 1;
      sumX += x;
      sumY += y;
    }
  }
  const centroid = count ? { x: region.x0 + sumX / count + 0.5, y: region.y0 + sumY / count + 0.5 } : null;
  return { region, mask, targets, count, centroid };
}

/**
 * Marks every target pixel outside the 8-connected group nearest (cx, cy) as 2. Distance runs from the point to
 * the nearest pixel centre of a group; ties go to the larger group, then the one found first (row-major scan).
 */
function keepNearestComponent(mask: Uint8Array, w: number, h: number, cx: number, cy: number): void {
  const labels = new Int32Array(w * h);
  const stack: number[] = [];
  let best = 0;
  let bestDistance = Infinity;
  let bestSize = 0;
  let next = 0;
  for (let start = 0; start < mask.length; start += 1) {
    if (mask[start] !== 1 || labels[start]) continue;
    next += 1;
    labels[start] = next;
    stack.push(start);
    let size = 0;
    let distance = Infinity;
    while (stack.length) {
      const index = stack.pop()!;
      size += 1;
      const x = index % w;
      const y = (index - x) / w;
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      const d = dx * dx + dy * dy;
      if (d < distance) distance = d;
      for (let ny = Math.max(0, y - 1); ny <= Math.min(h - 1, y + 1); ny += 1) {
        for (let nx = Math.max(0, x - 1); nx <= Math.min(w - 1, x + 1); nx += 1) {
          const n = ny * w + nx;
          if (mask[n] === 1 && !labels[n]) { labels[n] = next; stack.push(n); }
        }
      }
    }
    if (distance < bestDistance || (distance === bestDistance && size > bestSize)) {
      best = next;
      bestDistance = distance;
      bestSize = size;
    }
  }
  for (let i = 0; i < mask.length; i += 1) if (mask[i] === 1 && labels[i] !== best) mask[i] = 2;
}

/** Judges one box from an analysis; the box is in the coordinates of img. */
export function judgeRecenter(img: { width: number; height: number }, input: RefineBoxInput, rule: RecenterRule, analysis: RecenterAnalysis): RecenterResult {
  const box = { x0: input.x0, y0: input.y0, x1: input.x1, y1: input.y1 };
  const { region, count, centroid } = analysis;
  const area = (region.x1 - region.x0) * (region.y1 - region.y0);
  const ratio = area > 0 ? count / area : 0;
  const base = { id: input.id, classId: input.classId, box, count, ratio };
  if (!centroid) return { ...base, status: "notFound", shiftX: 0, shiftY: 0 };
  const width = box.x1 - box.x0;
  const height = box.y1 - box.y0;
  const shiftX = rule.axis === "y" ? 0 : centroid.x - (box.x0 + box.x1) / 2;
  const shiftY = rule.axis === "x" ? 0 : centroid.y - (box.y0 + box.y1) / 2;
  if (count < rule.minPixels || ratio < rule.minRatio) return { ...base, status: "tooFew", shiftX, shiftY };
  if (Math.abs(shiftX) > rule.maxShift * width || Math.abs(shiftY) > rule.maxShift * height) return { ...base, status: "tooFar", shiftX, shiftY };
  if (Math.abs(shiftX) < 0.5 && Math.abs(shiftY) < 0.5) return { ...base, status: "centred", shiftX, shiftY };
  // Kept inside the image (a box wider than the image keeps its x).
  const clamp = (lo: number, shift: number, size: number, limit: number): number => (size > limit ? lo : Math.min(Math.max(0, lo + shift), limit - size));
  const x0 = clamp(box.x0, shiftX, width, img.width);
  const y0 = clamp(box.y0, shiftY, height, img.height);
  return { ...base, status: "moved", shiftX, shiftY, box: { x0, y0, x1: x0 + width, y1: y0 + height } };
}

export function recenterBox(img: GrayImage, box: RefineBoxInput, rule: RecenterRule): RecenterResult {
  return judgeRecenter(img, box, rule, analyzeRecenter(img, box, rule));
}

/** One result per box, in order; callers pick the boxes (recenterChecks). */
export function recenterBoxes(img: GrayImage, boxes: readonly RefineBoxInput[], rule: RecenterRule): RecenterResult[] {
  const normalized = normalizeRecenterRule(rule);
  return boxes.map((box) => recenterBox(img, box, normalized));
}

const percent = (ratio: number): string => `${Math.round(ratio * 100)}%`;
const AXIS_TEXT = { x: "horizontal", y: "vertical", both: "both axes" } as const;

export function describeRecenterRule(rule: RecenterRule): string {
  const from = rule.fromClasses.length ? `class ${rule.fromClasses.join(", ")}` : "all classes";
  const margins = [rule.marginTop, rule.marginBottom, rule.marginLeft, rule.marginRight];
  const margin = margins.every((m) => m === margins[0]) ? percent(margins[0]) : margins.map(percent).join("/");
  return `${from} · ${rule.target.dark ? "≤" : "≥"} ${rule.target.level} · ${AXIS_TEXT[rule.axis]} · ${rule.component === "nearest" ? "nearest group" : "all pixels"}`
    + ` · margin ${margin} · max shift ${percent(rule.maxShift)}`;
}

export const RECENTER_STATUS_TEXT: Record<RecenterStatus, string> = {
  moved: "moved",
  centred: "already centred",
  notFound: "no target pixels",
  tooFew: "too few target pixels",
  tooFar: "shift beyond the limit"
};
