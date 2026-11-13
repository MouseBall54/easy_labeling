import { describe, expect, it } from "vitest";

import type { GrayImage } from "../../../src/domain/refine/edge-refine.js";
import {
  centreCrop,
  createReclassRule,
  describeReclassRule,
  evaluateReclass,
  judgeReclass,
  measureReclass,
  normalizeReclassRule,
  normalizeReclassRules,
  reclassRuleOf,
  ruleApplies,
  ruleChecks,
  type ReclassRule
} from "../../../src/domain/refine/reclass.js";

/** 10 x 10 image of `outside` with a centred square of `inside` (side `size`). */
function square(size: number, inside: number, outside: number): GrayImage {
  const gray = new Uint8Array(100).fill(outside);
  const start = (10 - size) / 2;
  for (let y = start; y < start + size; y += 1) for (let x = start; x < start + size; x += 1) gray[y * 10 + x] = inside;
  return { gray, width: 10, height: 10 };
}

const rule = (patch: Partial<ReclassRule> = {}): ReclassRule => ({ ...createReclassRule(), ...patch });
const FULL = { x0: 0, y0: 0, x1: 10, y1: 10 };

describe("domain/refine/reclass", () => {
  it("creates a rule that checks the centre mean of every class", () => {
    expect(createReclassRule()).toEqual({
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
    });
  });

  it("clamps and repairs rule values read from a file", () => {
    const parsed = normalizeReclassRule({ crop: 5, mean: { enabled: true, min: "300" }, bright: { minRatio: -1 }, combine: "x", toClass: 3 });
    // An older centred share becomes equal insets: crop 5 clamps to the whole box, cropY 0.8 leaves 10% top and bottom.
    expect(parsed).toMatchObject({ insetTop: 0, insetBottom: 0, insetLeft: 0, insetRight: 0 });
    expect(normalizeReclassRule({ crop: 0.3, cropY: 0.8 })).toMatchObject({ insetTop: 0.1, insetBottom: 0.1, insetLeft: 0.35, insetRight: 0.35 });
    expect(normalizeReclassRule({ cropX: 0.3 })).not.toHaveProperty("cropX");
    // Each side reads on its own, clamped to 0-90%, and opposite sides together keep at least 10% of the box.
    expect(normalizeReclassRule({ insetTop: 0.1, insetBottom: "0.4", insetLeft: -1, insetRight: 2 })).toMatchObject({ insetTop: 0.1, insetBottom: 0.4, insetLeft: 0, insetRight: 0.9 });
    expect(normalizeReclassRule({ insetTop: 0.9, insetBottom: 0.9 })).toMatchObject({ insetTop: 0.45, insetBottom: 0.45 });
    expect(parsed.mean).toEqual({ enabled: true, min: 255, dark: false });
    expect(parsed.bright.minRatio).toBe(0);
    expect(parsed.combine).toBe("or");
    expect(parsed.toClass).toBe("3");
    expect(normalizeReclassRules("nope")).toEqual([]);
    expect(normalizeReclassRules([{ toClass: "1" }, "bad", null])).toHaveLength(1);
    // One rule: files from versions with several keep the first.
    expect(normalizeReclassRules([{ toClass: "1" }, { toClass: "2" }]).map((r) => r.toClass)).toEqual(["1"]);
    // The rule is always on: with nothing saved the default runs, and an older "enabled": false is dropped.
    expect(reclassRuleOf([])).toEqual(createReclassRule());
    expect(normalizeReclassRule({ enabled: false, toClass: "1" })).not.toHaveProperty("enabled");
  });

  it("crops the centre in whole pixels, at least one pixel, inside the image", () => {
    expect(centreCrop(FULL, { insetTop: 0.25, insetBottom: 0.25, insetLeft: 0.25, insetRight: 0.25 }, { width: 10, height: 10 })).toEqual({ x0: 3, y0: 3, x1: 8, y1: 8 });
    // Each side moves on its own: a wide, flat strip, then a crop pushed to the top-left corner.
    expect(centreCrop(FULL, { insetTop: 0.4, insetBottom: 0.4, insetLeft: 0.1, insetRight: 0.1 }, { width: 10, height: 10 })).toEqual({ x0: 1, y0: 4, x1: 9, y1: 6 });
    expect(centreCrop(FULL, { insetTop: 0, insetBottom: 0.6, insetLeft: 0.1, insetRight: 0.5 }, { width: 10, height: 10 })).toEqual({ x0: 1, y0: 0, x1: 5, y1: 4 });
    const edge = centreCrop({ x0: -4, y0: -4, x1: 2, y1: 2 }, { insetTop: 0, insetBottom: 0, insetLeft: 0, insetRight: 0 }, { width: 10, height: 10 });
    expect(edge.x0).toBeGreaterThanOrEqual(0);
    expect(edge.x1 - edge.x0).toBeGreaterThanOrEqual(1);
    expect(edge.y1 - edge.y0).toBeGreaterThanOrEqual(1);
    const tiny = centreCrop({ x0: 4, y0: 4, x1: 6, y1: 6 }, { insetTop: 0.45, insetBottom: 0.45, insetLeft: 0.45, insetRight: 0.45 }, { width: 10, height: 10 });
    expect([tiny.x1 - tiny.x0, tiny.y1 - tiny.y0]).toEqual([1, 1]);
  });

  it("measures the mean and the share of bright pixels in the crop", () => {
    const img = square(4, 200, 50);
    expect(measureReclass(img, FULL, { ...{ insetTop: 0.3, insetBottom: 0.3, insetLeft: 0.3, insetRight: 0.3 }, bright: { enabled: true, level: 160, minRatio: 0, dark: false } })).toEqual({ mean: 200, brightRatio: 1 });
    const whole = measureReclass(img, FULL, { ...{ insetTop: 0, insetBottom: 0, insetLeft: 0, insetRight: 0 }, bright: { enabled: true, level: 160, minRatio: 0, dark: false } });
    expect(whole.mean).toBeCloseTo(74);
    expect(whole.brightRatio).toBeCloseTo(0.16);
    const outside = measureReclass(img, { x0: -20, y0: -20, x1: -10, y1: -10 }, { ...{ insetTop: 0.25, insetBottom: 0.25, insetLeft: 0.25, insetRight: 0.25 }, bright: { enabled: true, level: 160, minRatio: 0, dark: false } });
    expect(Number.isFinite(outside.mean)).toBe(true);
  });

  it("judges each check and combines them with AND or OR", () => {
    const stats = { mean: 140, brightRatio: 0.1, areaChange: -0.31 };
    expect(judgeReclass(rule({ mean: { enabled: true, min: 140, dark: false } }), stats)).toBe(true);
    expect(judgeReclass(rule({ mean: { enabled: true, min: 141, dark: false } }), stats)).toBe(false);
    const both = { mean: { enabled: true, min: 100, dark: false }, bright: { enabled: true, level: 160, minRatio: 0.5, dark: false } };
    expect(judgeReclass(rule({ ...both, combine: "and" }), stats)).toBe(false);
    expect(judgeReclass(rule({ ...both, combine: "or" }), stats)).toBe(true);
    expect(judgeReclass(rule({ mean: { enabled: false, min: 0, dark: false } }), stats)).toBe(false);
    const shrink = rule({ mean: { enabled: false, min: 0, dark: false }, shrink: { enabled: true, minRatio: 0.3 } });
    expect(judgeReclass(shrink, stats)).toBe(true);
    expect(judgeReclass(shrink, { ...stats, areaChange: null })).toBe(false);
  });

  it("matches each box with the first rule that applies to its class and changes it", () => {
    const img = square(10, 200, 200);
    const boxes = [{ id: "a", classId: "0", box: FULL }, { id: "b", classId: "1", box: FULL }];
    const rules = [rule({ toClass: "2", fromClasses: ["1"] }), rule({ toClass: "3" }), rule({ toClass: "4" })];
    const matches = evaluateReclass(img, boxes, rules, new Map());
    expect(matches.map((m) => [m.id, m.ruleIndex, m.toClass])).toEqual([["a", 1, "3"], ["b", 0, "2"]]);
    expect(matches[0]).toMatchObject({ mean: 200, areaChange: null });
    expect(evaluateReclass(img, [{ id: "c", classId: "0", box: FULL }], [rule({ toClass: "0" })], new Map())).toEqual([]);
    expect(evaluateReclass(img, boxes, [rule({ mean: { enabled: false, min: 0, dark: false } })], new Map())).toEqual([]);
  });

  it("checks boxes already of the target class but only changes the others", () => {
    const r = rule({ fromClasses: ["0", "1"], toClass: "1" });
    expect(ruleChecks(r, "1")).toBe(true);
    expect(ruleApplies(r, "1")).toBe(false);
    expect(ruleApplies(r, "0")).toBe(true);
    expect(ruleChecks(r, "2")).toBe(false);
    expect(ruleChecks(rule({ mean: { enabled: false, min: 128, dark: false } }), "0")).toBe(false);
  });

  it("summarises a rule in one line", () => {
    const name = (id: string): string | undefined => (id === "0" ? "unfilled" : undefined);
    expect(describeReclassRule(rule(), name)).toBe("all classes → 0 unfilled · mean ≥ 128");
    expect(describeReclassRule(rule({
      combine: "and",
      fromClasses: ["1", "2"],
      bright: { enabled: true, level: 160, minRatio: 0.2, dark: false },
      shrink: { enabled: true, minRatio: 0.3 }
    }), name)).toBe("class 1, 2 → 0 unfilled · mean ≥ 128 AND bright ≥ 20% AND area −30%");
  });

  it("checks the dark side when a check is set to dark; older files read as bright", () => {
    expect(normalizeReclassRule({ mean: { enabled: true, min: 100 }, bright: { enabled: true } })).toMatchObject({ mean: { dark: false }, bright: { dark: false } });
    expect(normalizeReclassRule({ mean: { dark: true }, bright: { dark: true } })).toMatchObject({ mean: { dark: true }, bright: { dark: true } });
    // 16 of 100 pixels are 200, the rest 50: the dark side counts the pixels at or below the level.
    const img = square(4, 200, 50);
    const insets = { insetTop: 0, insetBottom: 0, insetLeft: 0, insetRight: 0 };
    expect(measureReclass(img, FULL, { ...insets, bright: { enabled: true, level: 50, minRatio: 0, dark: true } }).brightRatio).toBeCloseTo(0.84);
    expect(measureReclass(img, FULL, { ...insets, bright: { enabled: true, level: 49, minRatio: 0, dark: true } }).brightRatio).toBe(0);
    const stats = { mean: 60, brightRatio: 0.84, areaChange: null };
    expect(judgeReclass(rule({ mean: { enabled: true, min: 60, dark: true } }), stats)).toBe(true);
    expect(judgeReclass(rule({ mean: { enabled: true, min: 59, dark: true } }), stats)).toBe(false);
    expect(judgeReclass(rule({ mean: { enabled: true, min: 60, dark: false } }), stats)).toBe(true);
    expect(judgeReclass(rule({ mean: { enabled: true, min: 61, dark: false } }), stats)).toBe(false);
    const name = (): undefined => undefined;
    expect(describeReclassRule(rule({ mean: { enabled: true, min: 90, dark: true }, bright: { enabled: true, level: 40, minRatio: 0.5, dark: true } }), name))
      .toBe("all classes → 0 · mean ≤ 90 OR dark ≥ 50%");
  });
});
