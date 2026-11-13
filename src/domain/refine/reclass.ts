import type { GrayImage, RefineRect } from "./edge-refine.js";

/**
 * Reclass: flag boxes whose content looks defective (a bright, mottled centre where it should be dark, a dark one
 * where it should be bright, or a box
 * whose refined area shrank well below the size it was loaded with) as candidates for another class.
 * Boxes never move; the user confirms each change. The rule is always on (Reclass mode is the switch); an
 * `enabled` flag older files hold is ignored.
 */
export interface ReclassRule {
  /** Classes this rule checks; empty = every class. */
  fromClasses: string[];
  toClass: string;
  combine: "and" | "or";
  /**
   * Centre crop: the share of the box height (top, bottom) or width (left, right) left out on each side, 0-0.9,
   * so each edge of the crop moves on its own. Opposite sides add up to at most 0.9. Older files hold a centred
   * `cropX` / `cropY` share (or one `crop` for both); each becomes equal insets.
   */
  insetTop: number;
  insetBottom: number;
  insetLeft: number;
  insetRight: number;
  /** Passes when the crop mean is >= min, or <= min when dark (older files: bright). */
  mean: { enabled: boolean; min: number; dark: boolean };
  /**
   * Counted pixels are >= level, or <= level when dark (older files: bright); the check passes when their share
   * of the crop is >= minRatio. The key keeps its old name for the files.
   */
  bright: { enabled: boolean; level: number; minRatio: number; dark: boolean };
  /** Passes when the refined area is at least minRatio smaller than the loaded box. */
  shrink: { enabled: boolean; minRatio: number };
}

export interface ReclassBox { id: string; classId: string; box: RefineRect }
/** brightRatio: share of the pixels the bright check counts (dark ones when it is set to dark). */
export interface ReclassStats { mean: number; brightRatio: number; areaChange: number | null }
export interface ReclassMatch extends ReclassStats { id: string; ruleIndex: number; toClass: string }

export function createReclassRule(): ReclassRule {
  return {
    fromClasses: [],
    toClass: "0",
    combine: "or",
    insetTop: 0.25,
    insetBottom: 0.25,
    insetLeft: 0.25,
    insetRight: 0.25,
    mean: { enabled: true, min: 128, dark: false },
    bright: { enabled: false, level: 160, minRatio: 0.2, dark: false },
    shrink: { enabled: false, minRatio: 0.3 }
  };
}

/** Finite numbers, or numeric strings as older hand-edited files may hold, clamped to [lo, hi]. */
const bounded = (value: unknown, fallback: number, lo: number, hi: number): number => {
  const n = typeof value === "number" ? value : typeof value === "string" && value.trim() ? Number(value) : NaN;
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : fallback;
};
const record = (value: unknown): Record<string, unknown> => (typeof value === "object" && value !== null ? value as Record<string, unknown> : {});
const flag = (value: unknown, fallback: boolean): boolean => (typeof value === "boolean" ? value : fallback);
const classId = (value: unknown, fallback: string): string => (typeof value === "string" || typeof value === "number" ? String(value).trim() || fallback : fallback);

const MAX_INSET = 0.9;
const round4 = (n: number): number => Math.round(n * 10_000) / 10_000;
/** Insets of one axis: explicit ones first, else a centred share from older files; together at most MAX_INSET. */
function axisInsets(lo: unknown, hi: unknown, share: unknown, fallback: number): [number, number] {
  const legacy = share === undefined ? fallback : round4((1 - bounded(share, 1 - 2 * fallback, 0.1, 1)) / 2);
  const a = bounded(lo, legacy, 0, MAX_INSET);
  const b = bounded(hi, legacy, 0, MAX_INSET);
  const scale = a + b > MAX_INSET ? MAX_INSET / (a + b) : 1;
  return [round4(a * scale), round4(b * scale)];
}

export function normalizeReclassRule(value: unknown): ReclassRule {
  const d = createReclassRule();
  const v = record(value);
  const [insetTop, insetBottom] = axisInsets(v.insetTop, v.insetBottom, v.cropY ?? v.crop, d.insetTop);
  const [insetLeft, insetRight] = axisInsets(v.insetLeft, v.insetRight, v.cropX ?? v.crop, d.insetLeft);
  const mean = record(v.mean);
  const bright = record(v.bright);
  const shrink = record(v.shrink);
  return {
    fromClasses: Array.isArray(v.fromClasses) ? [...new Set(v.fromClasses.map((id) => classId(id, "")).filter(Boolean))] : [],
    toClass: classId(v.toClass, d.toClass),
    combine: v.combine === "and" ? "and" : "or",
    insetTop,
    insetBottom,
    insetLeft,
    insetRight,
    mean: { enabled: flag(mean.enabled, d.mean.enabled), min: bounded(mean.min, d.mean.min, 0, 255), dark: flag(mean.dark, false) },
    bright: {
      enabled: flag(bright.enabled, d.bright.enabled),
      level: bounded(bright.level, d.bright.level, 0, 255),
      minRatio: bounded(bright.minRatio, d.bright.minRatio, 0, 1),
      dark: flag(bright.dark, false)
    },
    shrink: { enabled: flag(shrink.enabled, d.shrink.enabled), minRatio: bounded(shrink.minRatio, d.shrink.minRatio, 0, 0.99) }
  };
}

/** Reclass runs one rule: the first one of the list (files from versions with several keep only it). */
export function normalizeReclassRules(value: unknown): ReclassRule[] {
  return Array.isArray(value) ? value.filter((item) => typeof item === "object" && item !== null).slice(0, 1).map(normalizeReclassRule) : [];
}

/** The rule Reclass runs and the editor shows: the saved one, else the default. */
export function reclassRuleOf(rules: readonly ReclassRule[]): ReclassRule {
  return rules[0] ?? createReclassRule();
}

export type ReclassInsets = Pick<ReclassRule, "insetTop" | "insetBottom" | "insetLeft" | "insetRight">;

/** Centre crop (the box less its insets) in whole pixels, clipped to the image, never smaller than 1 x 1. */
export function centreCrop(box: RefineRect, crop: ReclassInsets, bounds: { width: number; height: number }): RefineRect {
  const axis = (lo: number, hi: number, size: number, insetLo: number, insetHi: number): [number, number] => {
    const start = Math.round(lo + (hi - lo) * insetLo);
    const end = Math.max(start + 1, Math.round(hi - (hi - lo) * insetHi));
    const a = Math.min(Math.max(0, start), size - 1);
    return [a, Math.max(a + 1, Math.min(size, end))];
  };
  const [x0, x1] = axis(box.x0, box.x1, bounds.width, crop.insetLeft, crop.insetRight);
  const [y0, y1] = axis(box.y0, box.y1, bounds.height, crop.insetTop, crop.insetBottom);
  return { x0, y0, x1, y1 };
}

export function measureReclass(img: GrayImage, box: RefineRect, rule: ReclassInsets & Pick<ReclassRule, "bright">): { mean: number; brightRatio: number } {
  const { x0, y0, x1, y1 } = centreCrop(box, rule, img);
  let sum = 0;
  let counted = 0;
  const { level, dark } = rule.bright;
  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      const v = img.gray[y * img.width + x];
      sum += v;
      if (dark ? v <= level : v >= level) counted += 1;
    }
  }
  const count = (x1 - x0) * (y1 - y0);
  return { mean: sum / count, brightRatio: counted / count };
}

/** Checks this class (from classes, empty = all) and has at least one check on; the box may already be of toClass. */
export function ruleChecks(rule: ReclassRule, boxClass: string): boolean {
  return (rule.fromClasses.length === 0 || rule.fromClasses.includes(boxClass))
    && (rule.mean.enabled || rule.bright.enabled || rule.shrink.enabled);
}

/** Checks this class, would change it, and has at least one check on. */
export function ruleApplies(rule: ReclassRule, boxClass: string): boolean {
  return rule.toClass !== boxClass && ruleChecks(rule, boxClass);
}

export function judgeReclass(rule: ReclassRule, stats: ReclassStats): boolean {
  const checks: boolean[] = [];
  if (rule.mean.enabled) checks.push(rule.mean.dark ? stats.mean <= rule.mean.min : stats.mean >= rule.mean.min);
  if (rule.bright.enabled) checks.push(stats.brightRatio >= rule.bright.minRatio);
  if (rule.shrink.enabled) checks.push(stats.areaChange !== null && -stats.areaChange >= rule.shrink.minRatio);
  if (!checks.length) return false;
  return rule.combine === "and" ? checks.every(Boolean) : checks.some(Boolean);
}

/** First matching rule per box; boxes are in the coordinates of img. areaChange: refined vs loaded area, by box id. */
export function evaluateReclass(
  img: GrayImage,
  boxes: readonly ReclassBox[],
  rules: readonly ReclassRule[],
  areaChange: ReadonlyMap<string, number | null>
): ReclassMatch[] {
  const matches: ReclassMatch[] = [];
  for (const { id, classId: boxClass, box } of boxes) {
    for (let ruleIndex = 0; ruleIndex < rules.length; ruleIndex += 1) {
      const rule = rules[ruleIndex];
      if (!ruleApplies(rule, boxClass)) continue;
      const stats = { ...measureReclass(img, box, rule), areaChange: areaChange.get(id) ?? null };
      if (judgeReclass(rule, stats)) {
        matches.push({ id, ruleIndex, toClass: rule.toClass, ...stats });
        break;
      }
    }
  }
  return matches;
}

const percent = (ratio: number): string => `${Math.round(ratio * 100)}%`;

export function describeReclassRule(rule: ReclassRule, className: (id: string) => string | undefined): string {
  const from = rule.fromClasses.length ? `class ${rule.fromClasses.join(", ")}` : "all classes";
  const name = className(rule.toClass);
  const checks = [
    rule.mean.enabled ? `mean ${rule.mean.dark ? "≤" : "≥"} ${rule.mean.min}` : "",
    rule.bright.enabled ? `${rule.bright.dark ? "dark" : "bright"} ≥ ${percent(rule.bright.minRatio)}` : "",
    rule.shrink.enabled ? `area −${percent(rule.shrink.minRatio)}` : ""
  ].filter(Boolean);
  return `${from} → ${rule.toClass}${name ? ` ${name}` : ""} · ${checks.length ? checks.join(` ${rule.combine.toUpperCase()} `) : "no checks"}`;
}
