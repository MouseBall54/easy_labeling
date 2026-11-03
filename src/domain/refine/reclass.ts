import type { GrayImage, RefineRect } from "./edge-refine.js";

/**
 * Reclass: flag boxes whose content looks defective (a bright, mottled centre where it should be dark, or a box
 * whose refined area shrank well below the size it was loaded with) as candidates for another class.
 * Boxes never move; the user confirms each change.
 */
export interface ReclassRule {
  enabled: boolean;
  /** Classes this rule checks; empty = every class. */
  fromClasses: string[];
  toClass: string;
  combine: "and" | "or";
  /** Centre crop as a fraction of the box width (cropX) and height (cropY), 0.1-1. Older files hold one `crop` for both. */
  cropX: number;
  cropY: number;
  mean: { enabled: boolean; min: number };
  /** Bright pixels are >= level; the check passes when their share of the crop is >= minRatio. */
  bright: { enabled: boolean; level: number; minRatio: number };
  /** Passes when the refined area is at least minRatio smaller than the loaded box. */
  shrink: { enabled: boolean; minRatio: number };
}

export interface ReclassBox { id: string; classId: string; box: RefineRect }
export interface ReclassStats { mean: number; brightRatio: number; areaChange: number | null }
export interface ReclassMatch extends ReclassStats { id: string; ruleIndex: number; toClass: string }

export function createReclassRule(): ReclassRule {
  return {
    enabled: true,
    fromClasses: [],
    toClass: "0",
    combine: "or",
    cropX: 0.5,
    cropY: 0.5,
    mean: { enabled: true, min: 128 },
    bright: { enabled: false, level: 160, minRatio: 0.2 },
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

export function normalizeReclassRule(value: unknown): ReclassRule {
  const d = createReclassRule();
  const v = record(value);
  const mean = record(v.mean);
  const bright = record(v.bright);
  const shrink = record(v.shrink);
  return {
    enabled: flag(v.enabled, d.enabled),
    fromClasses: Array.isArray(v.fromClasses) ? [...new Set(v.fromClasses.map((id) => classId(id, "")).filter(Boolean))] : [],
    toClass: classId(v.toClass, d.toClass),
    combine: v.combine === "and" ? "and" : "or",
    cropX: bounded(v.cropX ?? v.crop, d.cropX, 0.1, 1),
    cropY: bounded(v.cropY ?? v.crop, d.cropY, 0.1, 1),
    mean: { enabled: flag(mean.enabled, d.mean.enabled), min: bounded(mean.min, d.mean.min, 0, 255) },
    bright: {
      enabled: flag(bright.enabled, d.bright.enabled),
      level: bounded(bright.level, d.bright.level, 0, 255),
      minRatio: bounded(bright.minRatio, d.bright.minRatio, 0, 1)
    },
    shrink: { enabled: flag(shrink.enabled, d.shrink.enabled), minRatio: bounded(shrink.minRatio, d.shrink.minRatio, 0, 0.99) }
  };
}

/** Reclass runs one rule: the first one of the list (files from versions with several keep only it). */
export function normalizeReclassRules(value: unknown): ReclassRule[] {
  return Array.isArray(value) ? value.filter((item) => typeof item === "object" && item !== null).slice(0, 1).map(normalizeReclassRule) : [];
}

/** The rule the editor shows: the saved one, else a default that stays off until it is turned on. */
export function reclassRuleOf(rules: readonly ReclassRule[]): ReclassRule {
  return rules[0] ?? { ...createReclassRule(), enabled: false };
}

/** Centre crop in whole pixels, clipped to the image, never smaller than 1 x 1. */
export function centreCrop(box: RefineRect, crop: Pick<ReclassRule, "cropX" | "cropY">, bounds: { width: number; height: number }): RefineRect {
  const axis = (lo: number, hi: number, size: number, share: number): [number, number] => {
    const span = Math.max(1, Math.round((hi - lo) * share));
    const start = Math.round((lo + hi) / 2 - span / 2);
    const a = Math.min(Math.max(0, start), size - 1);
    return [a, Math.max(a + 1, Math.min(size, start + span))];
  };
  const [x0, x1] = axis(box.x0, box.x1, bounds.width, crop.cropX);
  const [y0, y1] = axis(box.y0, box.y1, bounds.height, crop.cropY);
  return { x0, y0, x1, y1 };
}

export function measureReclass(img: GrayImage, box: RefineRect, rule: Pick<ReclassRule, "cropX" | "cropY" | "bright">): { mean: number; brightRatio: number } {
  const { x0, y0, x1, y1 } = centreCrop(box, rule, img);
  let sum = 0;
  let bright = 0;
  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      const v = img.gray[y * img.width + x];
      sum += v;
      if (v >= rule.bright.level) bright += 1;
    }
  }
  const count = (x1 - x0) * (y1 - y0);
  return { mean: sum / count, brightRatio: bright / count };
}

/** Enabled, checks this class, would change it, and has at least one check on. */
export function ruleApplies(rule: ReclassRule, boxClass: string): boolean {
  return rule.enabled
    && rule.toClass !== boxClass
    && (rule.fromClasses.length === 0 || rule.fromClasses.includes(boxClass))
    && (rule.mean.enabled || rule.bright.enabled || rule.shrink.enabled);
}

export function judgeReclass(rule: ReclassRule, stats: ReclassStats): boolean {
  const checks: boolean[] = [];
  if (rule.mean.enabled) checks.push(stats.mean >= rule.mean.min);
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
    rule.mean.enabled ? `mean ≥ ${rule.mean.min}` : "",
    rule.bright.enabled ? `bright ≥ ${percent(rule.bright.minRatio)}` : "",
    rule.shrink.enabled ? `area −${percent(rule.shrink.minRatio)}` : ""
  ].filter(Boolean);
  return `${from} → ${rule.toClass}${name ? ` ${name}` : ""} · ${checks.length ? checks.join(` ${rule.combine.toUpperCase()} `) : "no checks"}`;
}
