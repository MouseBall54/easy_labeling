import { describe, expect, it } from "vitest";

import {
  describeRefineSide,
  normalizeRefineParams,
  REFINE_CRITERIA,
  REFINE_PARAM_LIMITS,
  REFINE_SIDES,
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
  refinePresetLabel,
  serializeRefinePresets,
  sideHasOwnRule,
  parseRefineSettings,
  refineOverriddenKeys,
  resetRefineSettings,
  resolveRefineParams,
  updateRefineSettings,
  type RefineSettingsDocument
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

  it("keeps edges in place for every gradient step, odd steps included", () => {
    const truth = Array.from({ length: 6 }, (_, i) => ({ x0: 20 + i * 50, y0: 30, x1: 50 + i * 50, y1: 90 }));
    const img = paint(340, 130, truth);
    const offsets = [[4, -3, -5, 2], [-3, 4, 3, -4], [5, 5, -2, -5], [-4, -2, 4, 3], [2, -5, -4, 4], [-5, 3, 5, -3]];
    const boxes: RefineBoxInput[] = truth.map((r, i) => ({ id: String(i), classId: "0", ...jitter(r, offsets[i]) }));
    for (const gradStep of [1, 2, 3, 4, 6]) {
      const results = refineBoxes(img, boxes, { 0: normalizeRefineParams({ rangeIn: 8, rangeOut: 8, gradStep }) });
      results.forEach((r, i) => expect(maxError(r.box, truth[i]), `step ${gradStep}`).toBeLessThan(0.5));
    }
    expect(normalizeRefineParams({}).gradStep).toBe(2);
    expect(normalizeRefineParams({ gradStep: 99 }).gradStep).toBe(64);
    expect(normalizeRefineParams({ sideRules: { T: { gradStep: 0 } } }).sideRules.T).toEqual({ gradStep: 1 });
  });

  it("flags boxes whose area grows or shrinks past the limits", () => {
    const truth = { x0: 40, y0: 40, x1: 80, y1: 100 };
    const img = paint(140, 150, [truth]);
    const run = (box: RefineRect, params: object) =>
      refineBoxes(img, [{ id: "a", classId: "0", ...box }], { 0: normalizeRefineParams({ rangeIn: 12, rangeOut: 12, ...params }) })[0];
    // Drawn 8 px too small on every side: refining grows the area by about 140%.
    const grown = run({ x0: 48, y0: 48, x1: 72, y1: 92 }, {});
    expect(maxError(grown.box, truth)).toBeLessThan(0.5);
    expect(grown.areaChange).toBeCloseTo(40 * 60 / (24 * 44) - 1, 1);
    expect(grown.areaFlagged && grown.flagged).toBe(true);
    expect(run({ x0: 48, y0: 48, x1: 72, y1: 92 }, { areaGrowLimit: 2 }).areaFlagged).toBe(false);
    expect(run({ x0: 48, y0: 48, x1: 72, y1: 92 }, { areaGrowLimit: 0 }).flagged).toBe(false);
    // Drawn 8 px too large: the area shrinks by about 47%.
    const shrunk = run({ x0: 32, y0: 32, x1: 88, y1: 108 }, { areaShrinkLimit: 0.3 });
    expect(shrunk.areaChange).toBeCloseTo(40 * 60 / (56 * 76) - 1, 1);
    expect(shrunk.areaFlagged).toBe(true);
    expect(run({ x0: 32, y0: 32, x1: 88, y1: 108 }, {}).areaFlagged).toBe(false); // default shrink limit 50%
    expect(run(truth, {}).areaFlagged).toBe(false);
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

  it("prefers the edge near the current one unless nearWeight is off, and explains the choice", () => {
    // Right of the box: a weak step (210 -> 170) 2 px out, a strong one (170 -> 40) 14 px out.
    const width = 90;
    const height = 60;
    const gray = new Float32Array(width * height);
    for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) gray[y * width + x] = x < 52 ? 210 : x < 64 ? 170 : 40;
    const img = { gray, width, height };
    const box = { x0: 10, y0: 10, x1: 50, y1: 50 };
    const base = { sides: { L: "off", T: "off", B: "off" }, polarity: "brightInside", rangeIn: 6, rangeOut: 16, contextRing: 0, iterations: 1, sigma: 0, inset: 0 };
    const right = (raw: object) => refineBoxes(img, [{ id: "a", classId: "0", ...box }], { 0: normalizeRefineParams(raw) })[0]!.box.x1;
    expect(Math.abs(right(base) - 52)).toBeLessThan(0.5);
    expect(Math.abs(right({ ...base, nearWeight: false }) - 64)).toBeLessThan(0.5);
    expect(Math.abs(right({ ...base, sideRules: { R: { nearWeight: false } } }) - 64)).toBeLessThan(0.5);
    expect(normalizeRefineParams({}).nearWeight).toBe(true);

    // Diagnostics show the same choice: the score curve peaks where the first pass put the edge,
    // every segment is traced, and the weight is flat when nearWeight is off.
    for (const nearWeight of [true, false]) {
      const params = normalizeRefineParams({ ...base, nearWeight, segments: 4 });
      const d = describeRefineSide(img, box, "R", params);
      const peak = d.score!.indexOf(Math.max(...d.score!));
      // The edge is the score peak plus a sub-pixel (parabola) shift of at most half a sample.
      expect(Math.abs(d.start + peak + d.scoreShift + 0.5 - d.firstPass!)).toBeLessThanOrEqual(0.5);
      expect(Math.abs(d.firstPass! - (nearWeight ? 52 : 64))).toBeLessThan(0.5);
      expect(d.segments).toHaveLength(4);
      expect(d.segments.every((segment) => segment.kept && Math.abs(segment.value! - d.firstPass!) < 0.5)).toBe(true);
      expect(d.segments[0]!.span[0]).toBe(10);
      expect(d.segments[3]!.span[1]).toBe(51); // runs include the row at the box end
      expect(Math.min(...d.weight) === 1).toBe(!nearWeight);
    }
  });

  it("uses the strongest scanned part on its own, or every part together", () => {
    // Top edge seen only beyond the box ends: a strong edge at y = 40 left of the box, a weak one at
    // y = 34 right of it. Inside the box there is nothing to find (scan span "outside").
    const width = 200;
    const height = 100;
    const gray = new Float32Array(width * height).fill(40);
    let seed = 11;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (x < 80 && y >= 40) gray[y * width + x] = 200;
        if (x > 120 && y >= 34) gray[y * width + x] = 70;
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        gray[y * width + x] += ((seed / 0x7fffffff) - 0.5) * 8;
      }
    }
    const img = { gray, width, height };
    const box = { x0: 80, y0: 30, x1: 120, y1: 70 };
    const base = { sides: { L: "off", R: "off", B: "off" }, polarity: "brightInside", rangeIn: 14, rangeOut: 6, contextRing: 0, scanSpan: "outside", extendStart: 40, extendEnd: 40 };
    const top = (raw: object) => refineBoxes(img, [{ id: "a", classId: "0", ...box }], { 0: normalizeRefineParams(raw) })[0]!.box.y0;
    expect(Math.abs(top({ ...base, partMode: "strongest" }) - 40)).toBeLessThan(0.5);
    expect(Math.abs(top({ ...base, partMode: "together" }) - 40)).toBeGreaterThan(1);
    // A side rule can switch one side only; the class default stays "together".
    expect(Math.abs(top({ ...base, sideRules: { T: { partMode: "strongest" } } }) - 40)).toBeLessThan(0.5);
    expect(normalizeRefineParams({}).partMode).toBe("together");
    expect(normalizeRefineParams({ partMode: "bogus" }).partMode).toBe("together");

    // Diagnostics: one profile per part (left, right extension) and the chosen one.
    const d = describeRefineSide(img, box, "T", normalizeRefineParams({ ...base, partMode: "strongest" }));
    expect(d.parts).toHaveLength(2);
    expect(d.chosenPart).toBe(0);
    expect(d.parts![0]!.strength).toBeGreaterThan(d.parts![1]!.strength);
    expect(Math.abs(d.parts![0]!.value! - 40)).toBeLessThan(0.5);
    d.parts!.forEach((part) => expect(part.raw.length).toBe(d.raw.length));
    expect(describeRefineSide(img, box, "T", normalizeRefineParams(base)).parts).toBeUndefined();

    // Mirrored image: the strong edge now lies right of the box, so the choice does not depend on order.
    const mirrored = new Float32Array(gray.length);
    for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) mirrored[y * width + x] = gray[y * width + (width - 1 - x)]!;
    const flipped = { x0: width - 120, y0: 30, x1: width - 80, y1: 70 };
    const mirroredTop = refineBoxes({ gray: mirrored, width, height }, [{ id: "a", classId: "0", ...flipped }], { 0: normalizeRefineParams({ ...base, partMode: "strongest" }) })[0]!.box.y0;
    expect(Math.abs(mirroredTop - 40)).toBeLessThan(0.5);
    expect(describeRefineSide({ gray: mirrored, width, height }, flipped, "T", normalizeRefineParams({ ...base, partMode: "strongest" })).chosenPart).toBe(1);
  });

  it("searches inward through the box centre up to the opposite side", () => {
    // A bright structure fills only the left fifth of a box drawn far too wide: its right edge lies
    // 70 px inside the box, past the centre (45 px), which the old centre limit could never reach.
    const truth = { x0: 30, y0: 20, x1: 50, y1: 80 };
    const img = paint(140, 100, [truth]);
    const box = { id: "a", classId: "0", x0: 30, y0: 20, x1: 120, y1: 80 };
    const right = (rangeIn: number) => refineBoxes(img, [box], {
      0: normalizeRefineParams({ sides: { L: "off", T: "off", B: "off" }, sideRules: { R: { rangeIn, polarity: "brightInside" } } })
    })[0].box.x1;
    expect(Math.abs(right(80) - 50)).toBeLessThan(0.5);
    expect(Math.abs(right(2000) - 50)).toBeLessThan(0.5);
    expect(right(40)).toBeGreaterThan(75); // a short inward range still cannot reach it
  });

  it("clamps every numeric parameter to REFINE_PARAM_LIMITS", () => {
    for (const [key, [low, high]] of Object.entries(REFINE_PARAM_LIMITS)) {
      expect(normalizeRefineParams({ [key]: -1e9 })[key as keyof typeof REFINE_PARAM_LIMITS], key).toBe(low);
      expect(normalizeRefineParams({ [key]: 1e9 })[key as keyof typeof REFINE_PARAM_LIMITS], key).toBe(high);
    }
  });

  it("keeps a valid box inside the image for every extreme parameter on every side", () => {
    const truth = [{ x0: 20, y0: 20, x1: 60, y1: 70 }, { x0: 70, y0: 25, x1: 100, y1: 75 }];
    const img = paint(120, 100, truth);
    const boxes: RefineBoxInput[] = [{ id: "a", classId: "0", x0: 16, y0: 24, x1: 63, y1: 66 }, { id: "b", classId: "0", x0: 72, y0: 20, x1: 98, y1: 80 }];
    const variants: Record<string, unknown>[] = [];
    for (const [key, [low, high]] of Object.entries(REFINE_PARAM_LIMITS)) variants.push({ [key]: low }, { [key]: high });
    for (const crit of REFINE_CRITERIA) {
      // Every bound at once is the slowest case (about 0.5 s per box), so it runs once per criterion.
      variants.push({ crit, scanSpan: "boxOutside", rangeIn: 2000, rangeOut: 2000, extendStart: 4000, extendEnd: 4000, contextRing: 500, sigma: 12, gradStep: 64, segments: 100, iterations: 6, inset: 0.49, avoidNeighbors: false });
      for (const scanSpan of ["box", "boxOutside", "outside"]) {
        variants.push({ crit, scanSpan, rangeIn: 1, rangeOut: 1, sigma: 0, gradStep: 1, segments: 1, inset: 0, extendStart: 4000 });
        for (const side of REFINE_SIDES) variants.push({ crit, polarity: "darkInside", sideRules: { [side]: { scanSpan, rangeIn: 2000, rangeOut: 2000, extendStart: 4000, extendEnd: 4000, gradStep: 64 } } });
      }
    }
    for (const raw of variants) {
      for (const r of refineBoxes(img, boxes, { 0: normalizeRefineParams(raw) })) {
        const { x0, y0, x1, y1 } = r.box;
        const label = JSON.stringify(raw);
        expect([x0, y0, x1, y1, r.conf, r.areaChange].every(Number.isFinite), label).toBe(true);
        expect(x0 >= 0 && y0 >= 0 && x1 <= img.width && y1 <= img.height, label).toBe(true);
        expect(x1 - x0 >= 2 && y1 - y0 >= 2, label).toBe(true);
      }
      for (const side of REFINE_SIDES) {
        const d = describeRefineSide(img, boxes[0], side, normalizeRefineParams(raw), [boxes[1]]);
        expect(d.raw.length, JSON.stringify(raw)).toBe(d.rangeIn + d.rangeOut + 1);
        expect(d.rangeIn).toBeLessThanOrEqual(Math.max(1, (side === "L" || side === "R" ? 47 : 42) - 2));
      }
    }
  }, 60_000);

  it("applies a rule to one side only while the others keep the class rule", () => {
    const truth = { x0: 30, y0: 20, x1: 70, y1: 80 };
    const img = paint(110, 100, [truth]);
    const box = { id: "a", classId: "0", x0: 30, y0: 20, x1: 84, y1: 80 }; // right edge 14 px too far out
    const right = (params: object) => refineBoxes(img, [box], { 0: normalizeRefineParams(params) })[0].box.x1;
    expect(Math.abs(right({ rangeIn: 10 }) - 70)).toBeGreaterThan(3);
    expect(Math.abs(right({ rangeIn: 10, sideRules: { R: { rangeIn: 18 } } }) - 70)).toBeLessThan(0.5);
    expect(normalizeRefineParams({ sideRules: { R: { rangeIn: 5000, bogus: 1 } } }).sideRules).toEqual({ L: {}, R: { rangeIn: 2000 }, T: {}, B: {} });
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

  it("stores the image source and processing with presets and restores them when applied", () => {
    const processing = { name: "SEM fins", config: { mode: "original", claheClip: 2 } };
    let doc: RefineSettingsDocument = { ...createRefineSettings(), imageSource: "processed", processing };
    doc = saveRefinePreset(doc, "Fins", normalizeRefineParams({ crit: "flank" }), { imageSource: doc.imageSource, processing: doc.processing });
    doc = deleteRefinePreset(saveRefinePreset(doc, "Plain", normalizeRefineParams({})), "Plain");
    const reset = { ...doc, imageSource: "original" as const, processing: null, activePreset: "Fins" };
    const applied = applyRefinePreset(reset, "Fins", ["0"]);
    expect(applied).toMatchObject({ imageSource: "processed", processing, activePreset: "Fins" });
    expect(resolveRefineParams(applied, "0").crit).toBe("flank");
    const roundTrip = parseRefineSettings(JSON.stringify(applied));
    expect(roundTrip.presets[0]).toMatchObject({ name: "Fins", imageSource: "processed", processing });
    expect(roundTrip.activePreset).toBe("Fins");
    expect(deleteRefinePreset(roundTrip, "Fins").activePreset).toBeNull();
    expect(refinePresetLabel(roundTrip.presets[0])).toBe("Fins · Processed (SEM fins)");
    // Presets from before image sources existed leave the current image settings alone.
    const legacy = parseRefineSettings(JSON.stringify({ imageSource: "processed", presets: [{ name: "Old", params: {} }] }));
    expect(applyRefinePreset(legacy, "Old", "default").imageSource).toBe("processed");
  });

  it("reads legacy refine-module JSON", () => {
    const doc = parseRefineSettings(JSON.stringify({ version: 1, default: { R: 14, K: 8 }, classes: { 2: { R: 16, sides: { B: false } } } }));
    expect(doc.default).toMatchObject({ rangeIn: 14, rangeOut: 14, segments: 8 });
    expect(resolveRefineParams(doc, "2")).toMatchObject({ rangeIn: 16, rangeOut: 16, sides: { B: "off", T: "inherit" } });
  });
});
