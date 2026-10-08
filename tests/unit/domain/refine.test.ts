import { describe, expect, it } from "vitest";

import {
  describeRefineSide,
  normalizeRefineParams,
  refineBoxes,
  toGray,
  type GrayImage,
  type RefineBoxInput,
  type RefineRect
} from "../../../src/domain/refine/edge-refine.js";
import {
  applyRefinePreset,
  createRefineSettings,
  deleteRefinePreset,
  importRefinePresets,
  saveRefinePreset,
  serializeRefinePresets,
  sideHasOwnRule,
  parseRefineSettings,
  refineOverriddenKeys,
  resetRefineSettings,
  resolveRefineParams,
  updateRefineSettings
} from "../../../src/domain/refine/settings.js";

function paint(width: number, height: number, rects: readonly RefineRect[], noise = 6): GrayImage {
  const gray = new Float32Array(width * height).fill(40);
  let seed = 7;
  for (const r of rects) {
    for (let y = r.y0; y < r.y1; y += 1) for (let x = r.x0; x < r.x1; x += 1) gray[y * width + x] = 180;
  }
  for (let i = 0; i < gray.length; i += 1) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    gray[i] += ((seed / 0x7fffffff) - 0.5) * 2 * noise;
  }
  return { gray, width, height };
}

const jitter = (r: RefineRect, d: number[]): RefineRect => ({ x0: r.x0 + d[0], y0: r.y0 + d[1], x1: r.x1 + d[2], y1: r.y1 + d[3] });
const maxError = (a: RefineRect, b: RefineRect): number =>
  Math.max(Math.abs(a.x0 - b.x0), Math.abs(a.y0 - b.y0), Math.abs(a.x1 - b.x1), Math.abs(a.y1 - b.y1));

describe("domain/refine/edge-refine", () => {
  it("snaps jittered boxes back to their structures within half a pixel", () => {
    const truth = Array.from({ length: 6 }, (_, i) => ({ x0: 20 + i * 50, y0: 30, x1: 50 + i * 50, y1: 90 }));
    const img = paint(340, 130, truth);
    const offsets = [[4, -3, -5, 2], [-3, 4, 3, -4], [5, 5, -2, -5], [-4, -2, 4, 3], [2, -5, -4, 4], [-5, 3, 5, -3]];
    const boxes: RefineBoxInput[] = truth.map((r, i) => ({ id: String(i), classId: "0", ...jitter(r, offsets[i]) }));
    const results = refineBoxes(img, boxes, { 0: normalizeRefineParams({ rangeIn: 8, rangeOut: 8 }) });
    results.forEach((r, i) => expect(maxError(r.box, truth[i])).toBeLessThan(0.5));
    expect(results.every((r) => !r.flagged)).toBe(true);
  });

  it("does not jump to a close neighbour's edge", () => {
    const a = { x0: 20, y0: 20, x1: 50, y1: 80 };
    const b = { x0: 58, y0: 20, x1: 88, y1: 80 };
    const img = paint(110, 100, [a, b]);
    const boxes = [{ id: "a", classId: "0", ...a, x1: 55 }, { id: "b", classId: "0", ...b }];
    const rightEdge = (params: object): number =>
      refineBoxes(img, boxes.slice(0, 1), { 0: normalizeRefineParams(params) }, boxes)[0].box.x1;
    expect(rightEdge({ avoidNeighbors: false, contextRing: 0 })).toBeCloseTo(58, 0); // profile-only search is fooled
    expect(rightEdge({ avoidNeighbors: true, contextRing: 0 })).toBeCloseTo(50, 0);
    expect(rightEdge({ avoidNeighbors: false, contextRing: 8 })).toBeCloseTo(50, 0);
  });

  it("honours per-side modes and flags a side that breaks its row", () => {
    const truth = Array.from({ length: 5 }, (_, i) => ({ x0: 20 + i * 40, y0: i === 2 ? 22 : 30, x1: 45 + i * 40, y1: 90 }));
    const img = paint(240, 120, truth);
    const boxes = truth.map((r, i) => ({ id: String(i), classId: "0", ...r, y0: 30, y1: 93 }));
    const params = normalizeRefineParams({ sides: { B: "off" }, peerTolerance: 2 });
    const results = refineBoxes(img, boxes, { 0: params });
    expect(results.every((r) => r.box.y1 === 93 && r.sideConf.B === undefined)).toBe(true);
    expect(results.filter((r) => r.flagged).map((r) => [r.id, r.weakSides])).toEqual([["2", ["T"]]]);
  });

  it("follows a forced edge polarity and reports it in the side diagnostics", () => {
    const truth = { x0: 30, y0: 20, x1: 70, y1: 80 };
    const img = paint(100, 100, []);
    for (let y = truth.y0; y < truth.y1; y += 1) for (let x = truth.x0; x < truth.x1; x += 1) (img.gray as Float32Array)[y * 100 + x] = 20; // dark structure
    for (let i = 0; i < img.gray.length; i += 1) if ((img.gray as Float32Array)[i] > 30) (img.gray as Float32Array)[i] = 200;
    const box = { id: "a", classId: "0", x0: 34, y0: 17, x1: 66, y1: 84 };
    const run = (polarity: string) => refineBoxes(img, [box], { 0: normalizeRefineParams({ polarity, contextRing: 0 }) })[0];
    expect(maxError(run("darkInside").box, truth)).toBeLessThan(0.5);
    expect(run("brightInside").flagged).toBe(true);
    const side = describeRefineSide(img, box, "R", normalizeRefineParams({}));
    expect(side.detectedPolarity).toBe(-1);
    expect(side.raw.length).toBe(side.rangeIn + side.rangeOut + 1);
    expect(side.inside).toBeLessThan(side.outside ?? 0);
  });

  it("applies a rule to one side only while the others keep the class rule", () => {
    const truth = { x0: 30, y0: 20, x1: 70, y1: 80 };
    const img = paint(110, 100, [truth]);
    const box = { id: "a", classId: "0", x0: 30, y0: 20, x1: 84, y1: 80 }; // right edge 14 px too far out
    const right = (params: object) => refineBoxes(img, [box], { 0: normalizeRefineParams(params) })[0].box.x1;
    expect(Math.abs(right({ rangeIn: 10 }) - 70)).toBeGreaterThan(3);
    expect(Math.abs(right({ rangeIn: 10, sideRules: { R: { rangeIn: 18 } } }) - 70)).toBeLessThan(0.5);
    expect(normalizeRefineParams({ sideRules: { R: { rangeIn: 500, bogus: 1 } } }).sideRules).toEqual({ L: {}, R: { rangeIn: 80 }, T: {}, B: {} });
  });

  it("scans past the box ends to use an edge that is only visible outside the box", () => {
    // The left boundary (x = 40) shows above and below the box; along the box itself everything is bright.
    const img = paint(120, 120, [{ x0: 40, y0: 0, x1: 100, y1: 120 }, { x0: 20, y0: 30, x1: 100, y1: 90 }], 2);
    const box = { id: "a", classId: "0", x0: 46, y0: 30, x1: 100, y1: 90 };
    const left = (params: object) => refineBoxes(img, [box], { 0: normalizeRefineParams({ sides: { R: "off", T: "off", B: "off" }, contextRing: 0, ...params }) })[0];
    expect(Math.abs(left({}).box.x0 - 40)).toBeGreaterThan(3);
    const sideOnly = { sideRules: { L: { scanSpan: "outside", extendStart: 25, extendEnd: 25 } } };
    expect(Math.abs(left(sideOnly).box.x0 - 40)).toBeLessThan(0.5);
    expect(Math.abs(left({ scanSpan: "boxOutside", extendStart: 25, extendEnd: 25, comb: "outer" }).box.x0 - 40)).toBeLessThan(0.5);
    const runs = describeRefineSide(img, box, "L", normalizeRefineParams(sideOnly)).runs;
    expect(runs).toEqual([[5, 29], [90, 114]]);
  });

  it("converts RGBA to one byte of luma per pixel", () => {
    expect([...toGray([255, 255, 255, 255, 0, 0, 0, 255], 2, 1)]).toEqual([255, 0]);
  });
});

describe("domain/refine/settings", () => {
  it("inherits defaults, stores only changed keys and resets per key", () => {
    let doc = updateRefineSettings(createRefineSettings(), ["2"], { rangeOut: 16, sides: { B: "off" } });
    doc = updateRefineSettings(doc, "default", { rangeOut: 12, crit: "flank" });
    expect(resolveRefineParams(doc, "2")).toMatchObject({ rangeOut: 16, crit: "flank", sides: { L: "inherit", B: "off" } });
    expect(resolveRefineParams(doc, "1")).toMatchObject({ rangeOut: 12, crit: "flank" });
    expect(refineOverriddenKeys(doc, "2")).toEqual(["rangeOut", "sides.B"]);
    doc = resetRefineSettings(doc, ["2"], ["rangeOut", "sides.B"]);
    expect(doc.classes["2"]).toBeUndefined();
  });

  it("saves, applies to a class group, exports and imports presets", () => {
    let doc = saveRefinePreset(createRefineSettings(), " Fin top ", normalizeRefineParams({ crit: "flank", sides: { B: "off" } }));
    doc = applyRefinePreset(doc, "Fin top", ["1", "3"]);
    doc = updateRefineSettings(doc, "default", { rangeOut: 20 });
    expect(resolveRefineParams(doc, "3")).toMatchObject({ crit: "flank", rangeOut: 10, sides: { B: "off" } }); // pinned
    expect(resolveRefineParams(doc, "2")).toMatchObject({ crit: "grad", rangeOut: 20 });
    const text = serializeRefinePresets(doc.presets);
    const imported = importRefinePresets(deleteRefinePreset(doc, "Fin top"), text);
    expect(imported.count).toBe(1);
    expect(parseRefineSettings(JSON.stringify(imported.doc)).presets.map((p) => p.name)).toEqual(["Fin top"]);
  });

  it("inherits, reports and resets per-side rules for classes and the default", () => {
    let doc = updateRefineSettings(createRefineSettings(), "default", { sideRules: { T: { polarity: "darkInside" } } });
    doc = updateRefineSettings(doc, ["1"], { sideRules: { T: { rangeOut: 20 } }, sides: { T: "flank" } });
    expect(resolveRefineParams(doc, "1").sideRules.T).toEqual({ polarity: "darkInside", rangeOut: 20 });
    expect(refineOverriddenKeys(doc, "1")).toEqual(["sides.T", "sideRules.T.rangeOut"]);
    expect(sideHasOwnRule(doc, ["1"], "T")).toBe(true);
    expect(sideHasOwnRule(doc, ["1"], "B")).toBe(false);
    doc = resetRefineSettings(doc, ["1"], ["sideRules.T.rangeOut", "sides.T"]);
    expect(doc.classes["1"]).toBeUndefined();
    doc = resetRefineSettings(doc, "default", ["sideRules.T"]);
    expect(doc.default.sideRules.T).toEqual({});
    expect(parseRefineSettings(JSON.stringify(updateRefineSettings(doc, ["2"], { sideRules: { L: { sigma: 3 } } }))).classes["2"]).toEqual({ sideRules: { L: { sigma: 3 } } });
  });

  it("keeps the image source with the settings and defaults to the original", () => {
    expect(createRefineSettings().imageSource).toBe("original");
    expect(parseRefineSettings(JSON.stringify({ imageSource: "processed" })).imageSource).toBe("processed");
    expect(parseRefineSettings(JSON.stringify({ imageSource: "bogus" })).imageSource).toBe("original");
  });

  it("reads legacy refine-module JSON", () => {
    const doc = parseRefineSettings(JSON.stringify({ version: 1, default: { R: 14, K: 8 }, classes: { 2: { R: 16, sides: { B: false } } } }));
    expect(doc.default).toMatchObject({ rangeIn: 14, rangeOut: 14, segments: 8 });
    expect(resolveRefineParams(doc, "2")).toMatchObject({ rangeIn: 16, rangeOut: 16, sides: { B: "off", T: "inherit" } });
  });
});
