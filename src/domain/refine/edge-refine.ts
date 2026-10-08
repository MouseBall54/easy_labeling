// Box edge refinement for SEM cross-section images (ported from the standalone refine module).
// Pure functions: no DOM, safe to import from the refine worker.

export type RefineCriterion = "grad" | "flank" | "peak" | "thr";
export type RefineSide = "L" | "R" | "T" | "B";
export type RefineSideMode = "off" | "inherit" | RefineCriterion;
/** Brightness change crossing the edge from inside the box to outside. */
export type RefinePolarity = "auto" | "brightInside" | "darkInside";

export interface RefineParams {
  enabled: boolean;
  crit: RefineCriterion;
  polarity: RefinePolarity;
  comb: "outer" | "median";
  rangeIn: number;
  rangeOut: number;
  segments: number;
  sigma: number;
  inset: number;
  sides: Record<RefineSide, RefineSideMode>;
  /** Per-side overrides of the edge rule; the side's criterion lives in `sides`. */
  sideRules: Record<RefineSide, RefineSideRule>;
  iterations: number;
  reviewBelow: number;
  autoOnDraw: boolean;
  /** Width (px) of the background ring sampled outside the search range; 0 disables context. */
  contextRing: number;
  avoidNeighbors: boolean;
  /** Row/column alignment tolerance (px) for flagging outlier sides; 0 disables. */
  peerTolerance: number;
}

/** Edge-rule keys a single side may override. */
export const REFINE_SIDE_RULE_KEYS = ["polarity", "comb", "rangeIn", "rangeOut", "sigma", "segments", "inset"] as const;
export type RefineSideRuleKey = typeof REFINE_SIDE_RULE_KEYS[number];
export type RefineSideRule = Partial<Pick<RefineParams, RefineSideRuleKey>>;

export interface GrayImage {
  gray: ArrayLike<number>;
  width: number;
  height: number;
}

export interface RefineRect { x0: number; y0: number; x1: number; y1: number }
export interface RefineBoxInput extends RefineRect { id: string; classId: string }

export interface RefineResult {
  id: string;
  classId: string;
  box: RefineRect;
  conf: number;
  sideConf: Partial<Record<RefineSide, number>>;
  weakSides: RefineSide[];
  flagged: boolean;
}

export const REFINE_SIDES: readonly RefineSide[] = ["L", "R", "T", "B"];
export const REFINE_CRITERIA: readonly RefineCriterion[] = ["grad", "flank", "peak", "thr"];
const SIDE_MODES: readonly RefineSideMode[] = ["off", "inherit", ...REFINE_CRITERIA];
const MIN_SIZE = 2;

export const DEFAULT_REFINE_PARAMS: Readonly<RefineParams> = Object.freeze({
  enabled: true,
  crit: "grad",
  polarity: "auto",
  comb: "outer",
  rangeIn: 10,
  rangeOut: 10,
  segments: 6,
  sigma: 1.2,
  inset: 0.12,
  sides: Object.freeze({ L: "inherit", R: "inherit", T: "inherit", B: "inherit" }) as Record<RefineSide, RefineSideMode>,
  sideRules: Object.freeze({ L: {}, R: {}, T: {}, B: {} }) as Record<RefineSide, RefineSideRule>,
  iterations: 2,
  reviewBelow: 0.35,
  autoOnDraw: false,
  contextRing: 8,
  avoidNeighbors: true,
  peerTolerance: 2
});

const clamp = (value: number, low: number, high: number): number => (value < low ? low : value > high ? high : value);
const num = (value: unknown, fallback: number): number => (typeof value === "number" && Number.isFinite(value) ? value : fallback);

/** Accepts legacy refine-module values: boolean sides, R (both ranges) and K (segments). */
export function normalizeSideMode(value: unknown, fallback: RefineSideMode): RefineSideMode {
  if (value === true) return "inherit";
  if (value === false) return "off";
  return SIDE_MODES.includes(value as RefineSideMode) ? value as RefineSideMode : fallback;
}

/** Keeps only side-rule keys, each clamped like the class-level value. */
export function normalizeSideRule(value: unknown): RefineSideRule {
  const source = (typeof value === "object" && value !== null ? value : {}) as Record<string, unknown>;
  const present = REFINE_SIDE_RULE_KEYS.filter((key) => source[key] !== undefined);
  if (!present.length) return {};
  const normalized = normalizeRefineParams(Object.fromEntries(present.map((key) => [key, source[key]])));
  return Object.fromEntries(present.map((key) => [key, normalized[key]])) as RefineSideRule;
}

/** Class-level params with one side's overrides applied. */
export function sideParams(params: RefineParams, side: RefineSide): RefineParams {
  const mode = params.sides[side];
  return { ...params, ...params.sideRules[side], crit: mode === "inherit" || mode === "off" ? params.crit : mode };
}

export function normalizeRefineParams(value: unknown): RefineParams {
  const p = (typeof value === "object" && value !== null ? value : {}) as Record<string, unknown>;
  const d = DEFAULT_REFINE_PARAMS;
  const sides = (typeof p.sides === "object" && p.sides !== null ? p.sides : {}) as Record<string, unknown>;
  const rules = (typeof p.sideRules === "object" && p.sideRules !== null ? p.sideRules : {}) as Record<string, unknown>;
  const legacyRange = num(p.R, NaN);
  return {
    enabled: p.enabled === undefined ? d.enabled : Boolean(p.enabled),
    crit: REFINE_CRITERIA.includes(p.crit as RefineCriterion) ? p.crit as RefineCriterion : d.crit,
    polarity: p.polarity === "brightInside" || p.polarity === "darkInside" || p.polarity === "auto" ? p.polarity : d.polarity,
    comb: p.comb === "median" || p.comb === "outer" ? p.comb : d.comb,
    rangeIn: clamp(Math.round(num(p.rangeIn, num(legacyRange, d.rangeIn))), 1, 80),
    rangeOut: clamp(Math.round(num(p.rangeOut, num(legacyRange, d.rangeOut))), 1, 80),
    segments: clamp(Math.round(num(p.segments, num(p.K, d.segments))), 1, 30),
    sigma: clamp(num(p.sigma, d.sigma), 0, 6),
    inset: clamp(num(p.inset, d.inset), 0, 0.4),
    sides: {
      L: normalizeSideMode(sides.L, d.sides.L),
      R: normalizeSideMode(sides.R, d.sides.R),
      T: normalizeSideMode(sides.T, d.sides.T),
      B: normalizeSideMode(sides.B, d.sides.B)
    },
    sideRules: { L: normalizeSideRule(rules.L), R: normalizeSideRule(rules.R), T: normalizeSideRule(rules.T), B: normalizeSideRule(rules.B) },
    iterations: clamp(Math.round(num(p.iterations, d.iterations)), 1, 4),
    reviewBelow: clamp(num(p.reviewBelow, d.reviewBelow), 0, 1),
    autoOnDraw: p.autoOnDraw === undefined ? d.autoOnDraw : Boolean(p.autoOnDraw),
    contextRing: clamp(Math.round(num(p.contextRing, d.contextRing)), 0, 40),
    avoidNeighbors: p.avoidNeighbors === undefined ? d.avoidNeighbors : Boolean(p.avoidNeighbors),
    peerTolerance: clamp(num(p.peerTolerance, d.peerTolerance), 0, 50)
  };
}

/** RGBA -> 8-bit luma (BT.601 integer weights). One byte per pixel keeps 8K images cheap. */
export function toGray(rgba: ArrayLike<number>, width: number, height: number): Uint8Array {
  const count = width * height;
  const gray = new Uint8Array(count);
  for (let i = 0, p = 0; i < count; i += 1, p += 4) {
    gray[i] = (77 * rgba[p] + 150 * rgba[p + 1] + 29 * rgba[p + 2]) >> 8;
  }
  return gray;
}

// ---------------------------------------------------------------------------
// 1D profile helpers
// ---------------------------------------------------------------------------
interface SideGeometry { vertical: boolean; out: 1 | -1; key: keyof RefineRect }
const SIDE_GEOMETRY: Record<RefineSide, SideGeometry> = {
  L: { vertical: true, out: -1, key: "x0" },
  R: { vertical: true, out: 1, key: "x1" },
  T: { vertical: false, out: -1, key: "y0" },
  B: { vertical: false, out: 1, key: "y1" }
};

const kernelCache = new Map<number, Float32Array>();
function gaussKernel(sigma: number): Float32Array {
  const key = Math.round(sigma * 100);
  const cached = kernelCache.get(key);
  if (cached) return cached;
  let kernel: Float32Array;
  if (!(sigma > 0)) {
    kernel = new Float32Array([1]);
  } else {
    const radius = Math.ceil(sigma * 3);
    kernel = new Float32Array(2 * radius + 1);
    let sum = 0;
    for (let i = -radius; i <= radius; i += 1) {
      const v = Math.exp(-i * i / (2 * sigma * sigma));
      kernel[i + radius] = v;
      sum += v;
    }
    for (let i = 0; i < kernel.length; i += 1) kernel[i] /= sum;
  }
  kernelCache.set(key, kernel);
  return kernel;
}

function smooth(profile: Float32Array, kernel: Float32Array): Float32Array {
  const radius = (kernel.length - 1) >> 1;
  const n = profile.length;
  const out = new Float32Array(n);
  for (let i = 0; i < n; i += 1) {
    let sum = 0;
    for (let j = -radius; j <= radius; j += 1) {
      const q = i + j < 0 ? 0 : i + j >= n ? n - 1 : i + j;
      sum += profile[q] * kernel[j + radius];
    }
    out[i] = sum;
  }
  return out;
}

function quantile(sorted: ArrayLike<number>, q: number): number {
  if (sorted.length === 1) return sorted[0];
  const i = q * (sorted.length - 1);
  const lo = Math.floor(i);
  const hi = Math.ceil(i);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo);
}

function parabola(f: (i: number) => number, i: number, n: number): number {
  if (i <= 0 || i >= n - 1) return 0;
  const a = f(i - 1);
  const b = f(i);
  const c = f(i + 1);
  const den = a - 2 * b + c;
  if (Math.abs(den) < 1e-9) return 0;
  return clamp(0.5 * (a - c) / den, -0.5, 0.5);
}

/** Context measured around the box: median brightness inside vs. a ring outside the search range. */
interface EdgeContext {
  inside: number;
  outside: number;
  /** +1 when the structure is brighter than its surroundings, -1 when darker, 0 when unclear. */
  polarity: -1 | 0 | 1;
}

/**
 * Finds the edge in one perpendicular profile.
 * raw: unsmoothed profile (noise estimate), P: smoothed, out: outward direction, c: start index,
 * sign: expected sign of dP/di at the edge (0 = either).
 */
function findEdge(
  raw: Float32Array,
  P: Float32Array,
  crit: RefineCriterion,
  out: 1 | -1,
  c: number,
  sign: -1 | 0 | 1,
  context: EdgeContext | null
): { pos: number; conf: number } | null {
  const n = P.length;
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i < n; i += 1) {
    if (P[i] < lo) lo = P[i];
    if (P[i] > hi) hi = P[i];
  }
  const range = hi - lo;
  if (range < 1e-6) return null;
  const dd = new Float32Array(Math.max(0, n - 2));
  for (let i = 1; i < n - 1; i += 1) dd[i - 1] = Math.abs(raw[i + 1] - 2 * raw[i] + raw[i - 1]);
  dd.sort();
  const noise = dd.length ? dd[dd.length >> 1] / (0.6745 * Math.sqrt(6)) : 0;
  const snr = range / (noise + 0.5);
  const ws = n * 0.35;
  const weight = (i: number): number => Math.exp(-((i - c) * (i - c)) / (2 * ws * ws));
  let pos: number | null = null;

  if (crit === "grad") {
    const gradient = (i: number): number => {
      const g = P[Math.min(n - 1, i + 1)] - P[Math.max(0, i - 1)];
      return sign === 0 ? Math.abs(g) : Math.max(0, sign * g);
    };
    let best = 0;
    let bestIndex = -1;
    for (let i = 1; i < n - 1; i += 1) {
      const g = gradient(i) * weight(i);
      if (g > best) { best = g; bestIndex = i; }
    }
    if (bestIndex < 0) return null;
    pos = bestIndex + parabola(gradient, bestIndex, n);
  } else if (crit === "thr") {
    const level = context && context.polarity !== 0 ? (context.inside + context.outside) / 2 : (lo + hi) / 2;
    let bestDistance = Infinity;
    for (let i = 0; i < n - 1; i += 1) {
      const a = P[i] - level;
      const b = P[i + 1] - level;
      if (a * b <= 0 && a !== b && (sign === 0 || Math.sign(b - a) === sign)) {
        const x = i + a / (a - b);
        const d = Math.abs(x - c);
        if (d < bestDistance) { bestDistance = d; pos = x; }
      }
    }
  } else {
    let best = -Infinity;
    let peak = -1;
    for (let i = 1; i < n - 1; i += 1) {
      if (P[i] >= P[i - 1] && P[i] >= P[i + 1]) {
        const s = (P[i] - lo) * weight(i);
        if (s > best) { best = s; peak = i; }
      }
    }
    if (peak < 0) return null;
    if (crit === "peak") {
      pos = peak + parabola((i) => P[i], peak, n);
    } else {
      let base = Infinity;
      for (let i = peak; i >= 0 && i < n; i += out) if (P[i] < base) base = P[i];
      if (context && context.polarity !== 0 && context.outside < P[peak]) base = context.outside;
      const level = (P[peak] + base) / 2;
      for (let i = peak; i + out >= 0 && i + out < n; i += out) {
        if (P[i + out] <= level) {
          const a = P[i] - level;
          const b = P[i + out] - level;
          pos = i + out * (a / (a - b));
          break;
        }
      }
    }
  }
  if (pos === null || !Number.isFinite(pos)) return null;
  let conf = clamp((snr - 3) / 12, 0, 1);
  if (pos < 1 || pos > n - 2) conf *= 0.3; // edge sits on the search limit: the real edge is probably beyond it
  return { pos, conf };
}

function median(values: Float32Array, count: number): number {
  const view = values.subarray(0, count).sort();
  return quantile(view, 0.5);
}

/**
 * Samples the box core (inner 50%) and a ring just outside the outward search range.
 * Medians keep neighbouring structures that fall into the ring from skewing the background.
 */
function measureContext(img: GrayImage, box: RefineRect, p: RefineParams): EdgeContext | null {
  if (p.contextRing <= 0) return null;
  const { gray, width, height } = img;
  const w = box.x1 - box.x0;
  const h = box.y1 - box.y0;
  const maxSamples = 1024;
  const inner = new Float32Array(maxSamples);
  let innerCount = 0;
  const ix0 = Math.max(0, Math.round(box.x0 + w * 0.25));
  const ix1 = Math.min(width - 1, Math.round(box.x1 - w * 0.25));
  const iy0 = Math.max(0, Math.round(box.y0 + h * 0.25));
  const iy1 = Math.min(height - 1, Math.round(box.y1 - h * 0.25));
  const innerStep = Math.max(1, Math.ceil(Math.sqrt(((ix1 - ix0 + 1) * (iy1 - iy0 + 1)) / maxSamples)));
  for (let y = iy0; y <= iy1 && innerCount < maxSamples; y += innerStep) {
    for (let x = ix0; x <= ix1 && innerCount < maxSamples; x += innerStep) inner[innerCount++] = gray[y * width + x];
  }

  const d0 = p.rangeOut + 1;
  const d1 = d0 + p.contextRing;
  const ox0 = Math.round(box.x0) - d1;
  const ox1 = Math.round(box.x1) + d1;
  const oy0 = Math.round(box.y0) - d1;
  const oy1 = Math.round(box.y1) + d1;
  const ringArea = (ox1 - ox0) * (oy1 - oy0) - (ox1 - ox0 - 2 * p.contextRing) * (oy1 - oy0 - 2 * p.contextRing);
  const ringStep = Math.max(1, Math.ceil(Math.sqrt(Math.max(1, ringArea) / maxSamples)));
  const outer = new Float32Array(maxSamples);
  let outerCount = 0;
  for (let y = Math.max(0, oy0); y <= Math.min(height - 1, oy1) && outerCount < maxSamples; y += ringStep) {
    const inBand = y < oy0 + p.contextRing || y > oy1 - p.contextRing;
    for (let x = Math.max(0, ox0); x <= Math.min(width - 1, ox1) && outerCount < maxSamples; x += ringStep) {
      if (inBand || x < ox0 + p.contextRing || x > ox1 - p.contextRing) outer[outerCount++] = gray[y * width + x];
    }
  }
  if (!innerCount || !outerCount) return null;
  const inside = median(inner, innerCount);
  const outside = median(outer, outerCount);
  const polarity = Math.abs(inside - outside) < 4 ? 0 : inside > outside ? 1 : -1;
  return { inside, outside, polarity };
}

/** Outward search limit (px) for one side: half the gap to the nearest facing neighbour. */
function neighbourLimit(box: RefineRect, side: RefineSide, neighbours: readonly RefineRect[]): number {
  let limit = Infinity;
  for (const n of neighbours) {
    if (side === "L" || side === "R") {
      if (Math.min(box.y1, n.y1) - Math.max(box.y0, n.y0) <= 0) continue;
      const gap = side === "R" ? n.x0 - box.x1 : box.x0 - n.x1;
      if (gap >= 0) limit = Math.min(limit, gap / 2);
    } else {
      if (Math.min(box.x1, n.x1) - Math.max(box.x0, n.x0) <= 0) continue;
      const gap = side === "B" ? n.y0 - box.y1 : box.y0 - n.y1;
      if (gap >= 0) limit = Math.min(limit, gap / 2);
    }
  }
  return limit;
}

interface SideWindow {
  geometry: SideGeometry;
  s0: number;
  s1: number;
  base: number;
  n: number;
  /** Profile index of the current edge. */
  c: number;
  rangeIn: number;
  rangeOut: number;
}

function sideWindow(img: GrayImage, box: RefineRect, side: RefineSide, p: RefineParams, neighbours: readonly RefineRect[]): SideWindow {
  const geometry = SIDE_GEOMETRY[side];
  const p0 = box[geometry.key];
  const a0 = geometry.vertical ? box.y0 : box.x0;
  const a1 = geometry.vertical ? box.y1 : box.x1;
  const length = a1 - a0;
  const thickness = geometry.vertical ? box.x1 - box.x0 : box.y1 - box.y0;
  const lim = geometry.vertical ? img.height - 1 : img.width - 1;
  let s0 = Math.round(a0 + length * p.inset);
  let s1 = Math.round(a1 - length * p.inset);
  if (s1 < s0) s0 = s1 = Math.round((a0 + a1) / 2);
  s0 = clamp(s0, 0, lim);
  s1 = clamp(s1, 0, lim);
  // Inward search never crosses the box centre; outward search stops halfway to a facing neighbour.
  const rangeIn = Math.max(1, Math.min(p.rangeIn, Math.floor(thickness / 2)));
  const rangeOut = p.avoidNeighbors
    ? Math.max(1, Math.min(p.rangeOut, Math.floor(neighbourLimit(box, side, neighbours))))
    : p.rangeOut;
  const base = Math.round(p0) - (geometry.out > 0 ? rangeIn : rangeOut);
  // Profile index i samples pixel base+i, whose centre sits at base+i+0.5 in box coordinates.
  return { geometry, s0, s1, base, n: rangeIn + rangeOut + 1, c: p0 - 0.5 - base, rangeIn, rangeOut };
}

/** Mean perpendicular profile over rows/columns [from, to] along the side. */
function sampleProfile(img: GrayImage, w: SideWindow, from: number, to: number): Float32Array {
  const { gray, width } = img;
  const plim = w.geometry.vertical ? img.width - 1 : img.height - 1;
  const profile = new Float32Array(w.n);
  for (let t = from; t <= to; t += 1) {
    for (let i = 0; i < w.n; i += 1) {
      const q = clamp(w.base + i, 0, plim);
      profile[i] += w.geometry.vertical ? gray[t * width + q] : gray[q * width + t];
    }
  }
  const count = to - from + 1;
  for (let i = 0; i < w.n; i += 1) profile[i] /= count;
  return profile;
}

/** Expected sign of dP/di at the edge (profile index grows with the image coordinate). */
const edgeSign = (polarity: -1 | 0 | 1, out: 1 | -1): -1 | 0 | 1 => (polarity === 0 ? 0 : (-polarity * out) as -1 | 1);

function resolvePolarity(p: RefineParams, context: EdgeContext | null): -1 | 0 | 1 {
  if (p.polarity === "brightInside") return 1;
  if (p.polarity === "darkInside") return -1;
  return context?.polarity ?? 0;
}

function refineSide(
  img: GrayImage,
  box: RefineRect,
  side: RefineSide,
  crit: RefineCriterion,
  p: RefineParams,
  context: EdgeContext | null,
  neighbours: readonly RefineRect[]
): { value: number; conf: number } | null {
  const w = sideWindow(img, box, side, p, neighbours);
  const sign = edgeSign(resolvePolarity(p, context), w.geometry.out);
  const kernel = gaussKernel(p.sigma);
  const total = w.s1 - w.s0 + 1;
  const segments = Math.max(1, Math.min(p.segments, total));
  const found: { pos: number; conf: number }[] = [];
  for (let k = 0; k < segments; k += 1) {
    const from = w.s0 + Math.floor(k * total / segments);
    const to = Math.max(from, w.s0 + Math.floor((k + 1) * total / segments) - 1);
    const profile = sampleProfile(img, w, from, to);
    const edge = findEdge(profile, smooth(profile, kernel), crit, w.geometry.out, w.c, sign, context);
    if (edge) found.push(edge);
  }
  if (!found.length) return null;
  const positions = Float32Array.from(found, (e) => e.pos).sort();
  const pos = p.comb === "outer" ? quantile(positions, w.geometry.out < 0 ? 0.1 : 0.9) : quantile(positions, 0.5);
  const confidences = Float32Array.from(found, (e) => e.conf).sort();
  return { value: w.base + pos + 0.5, conf: quantile(confidences, 0.5) * (found.length / segments) };
}

export interface RefineSideDiagnostics {
  side: RefineSide;
  criterion: RefineCriterion;
  /** Image coordinate of profile sample 0; sample i covers [start + i, start + i + 1). */
  start: number;
  /** +1 when the image coordinate grows outward (R, B), -1 otherwise (L, T). */
  out: 1 | -1;
  raw: Float32Array;
  smoothed: Float32Array;
  rangeIn: number;
  rangeOut: number;
  /** Median brightness inside the box and in the background ring (null when the ring is off). */
  inside: number | null;
  outside: number | null;
  /** Polarity used: +1 bright inside, -1 dark inside, 0 either. */
  polarity: -1 | 0 | 1;
  detectedPolarity: -1 | 0 | 1;
}

/** Whole-side averaged profile and context, for plotting while tuning (refinement itself works per segment). */
export function describeRefineSide(img: GrayImage, box: RefineRect, side: RefineSide, classParams: RefineParams, neighbours: readonly RefineRect[] = []): RefineSideDiagnostics {
  const params = sideParams(classParams, side);
  const widest = Math.max(...REFINE_SIDES.map((s) => sideParams(classParams, s).rangeOut));
  const context = measureContext(img, box, { ...classParams, rangeOut: widest });
  const w = sideWindow(img, box, side, params, neighbours);
  const raw = sampleProfile(img, w, w.s0, w.s1);
  return {
    side,
    criterion: params.crit,
    start: w.base,
    out: w.geometry.out,
    raw,
    smoothed: smooth(raw, gaussKernel(params.sigma)),
    rangeIn: w.rangeIn,
    rangeOut: w.rangeOut,
    inside: context?.inside ?? null,
    outside: context?.outside ?? null,
    polarity: resolvePolarity(params, context),
    detectedPolarity: context?.polarity ?? 0
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export function refineBox(
  img: GrayImage,
  box: RefineRect,
  params: RefineParams,
  neighbours: readonly RefineRect[] = []
): Omit<RefineResult, "id" | "classId"> {
  let current: RefineRect = { x0: box.x0, y0: box.y0, x1: box.x1, y1: box.y1 };
  const sideConf: Partial<Record<RefineSide, number>> = {};
  const perSide = Object.fromEntries(REFINE_SIDES.map((side) => [side, sideParams(params, side)])) as Record<RefineSide, RefineParams>;
  // The background ring starts beyond the widest outward search so no side's range overlaps it.
  const context = measureContext(img, current, { ...params, rangeOut: Math.max(...REFINE_SIDES.map((side) => perSide[side].rangeOut)) });
  for (let iteration = 0; iteration < params.iterations; iteration += 1) {
    const next = { ...current };
    for (const side of REFINE_SIDES) {
      const mode = params.sides[side];
      if (mode === "off") continue;
      const result = refineSide(img, current, side, perSide[side].crit, perSide[side], context, neighbours);
      if (result) {
        next[SIDE_GEOMETRY[side].key] = result.value;
        sideConf[side] = result.conf;
      } else {
        sideConf[side] = 0;
      }
    }
    next.x0 = Math.max(0, next.x0);
    next.y0 = Math.max(0, next.y0);
    next.x1 = Math.min(img.width, next.x1);
    next.y1 = Math.min(img.height, next.y1);
    if (next.x1 - next.x0 < MIN_SIZE || next.y1 - next.y0 < MIN_SIZE) break;
    current = next;
  }
  const weakSides = REFINE_SIDES.filter((side) => (sideConf[side] ?? 1) < params.reviewBelow);
  const values = Object.values(sideConf) as number[];
  return {
    box: current,
    conf: values.length ? Math.min(...values) : 1,
    sideConf,
    weakSides,
    flagged: weakSides.length > 0
  };
}

/**
 * Refines boxes with per-class params. Classes missing from paramsByClass or disabled are skipped.
 * neighbours: every box on the image (all classes) used for neighbour avoidance; defaults to `boxes`.
 */
export function refineBoxes(
  img: GrayImage,
  boxes: readonly RefineBoxInput[],
  paramsByClass: Readonly<Record<string, RefineParams>>,
  neighbours: readonly RefineBoxInput[] = boxes
): RefineResult[] {
  const results: RefineResult[] = [];
  for (const box of boxes) {
    const params = paramsByClass[box.classId];
    if (!params?.enabled) continue;
    // ponytail: O(n·m) neighbour prefilter; fine to a few thousand boxes, switch to a grid index beyond that.
    const reach = params.rangeOut * 2 + 1;
    const nearby = params.avoidNeighbors
      ? neighbours.filter((n) => n.id !== box.id
        && n.x1 >= box.x0 - reach && n.x0 <= box.x1 + reach
        && n.y1 >= box.y0 - reach && n.y0 <= box.y1 + reach)
      : [];
    results.push({ id: box.id, classId: box.classId, ...refineBox(img, box, params, nearby) });
  }
  flagPeerOutliers(results, paramsByClass);
  return results;
}

/**
 * Repeated structures share edges: same-class boxes in a row share top/bottom, in a column share left/right.
 * Sides deviating from their row/column median by more than peerTolerance are flagged (never moved).
 */
export function flagPeerOutliers(results: RefineResult[], paramsByClass: Readonly<Record<string, RefineParams>>): void {
  const byClass = new Map<string, RefineResult[]>();
  for (const r of results) {
    const list = byClass.get(r.classId);
    if (list) list.push(r);
    else byClass.set(r.classId, [r]);
  }
  for (const [classId, members] of byClass) {
    const tolerance = paramsByClass[classId]?.peerTolerance ?? 0;
    if (tolerance <= 0 || members.length < 3) continue;
    checkPeers(members, tolerance, "y", "T", "B");
    checkPeers(members, tolerance, "x", "L", "R");
  }
}

function checkPeers(members: RefineResult[], tolerance: number, axis: "x" | "y", lowSide: RefineSide, highSide: RefineSide): void {
  const lowKey = axis === "y" ? "y0" : "x0";
  const highKey = axis === "y" ? "y1" : "x1";
  const centre = (r: RefineResult): number => (r.box[lowKey] + r.box[highKey]) / 2;
  const sizes = Float32Array.from(members, (r) => r.box[highKey] - r.box[lowKey]).sort();
  const join = quantile(sizes, 0.5) * 0.25;
  const sorted = [...members].sort((a, b) => centre(a) - centre(b));
  let start = 0;
  for (let i = 1; i <= sorted.length; i += 1) {
    if (i < sorted.length && centre(sorted[i]) - centre(sorted[i - 1]) <= join) continue;
    const group = sorted.slice(start, i);
    start = i;
    if (group.length < 3) continue;
    for (const [side, key] of [[lowSide, lowKey], [highSide, highKey]] as const) {
      const refined = group.filter((r) => r.sideConf[side] !== undefined);
      if (refined.length < 3) continue;
      const mid = quantile(Float32Array.from(refined, (r) => r.box[key]).sort(), 0.5);
      for (const r of refined) {
        if (Math.abs(r.box[key] - mid) > tolerance && !r.weakSides.includes(side)) {
          r.weakSides.push(side);
          r.flagged = true;
        }
      }
    }
  }
}
