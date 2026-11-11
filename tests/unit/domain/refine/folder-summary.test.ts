import { describe, expect, it } from "vitest";
import type { RefineBoxInput, RefineResult } from "../../../../src/domain/refine/edge-refine.js";
import { evenSample, largestShift, quantile, summarizeEdgeFolder, summarizeReclassFolder } from "../../../../src/domain/refine/folder-summary.js";

const box = (id: string, classId: string, x0: number, y0 = 0, size = 10): RefineBoxInput => ({ id, classId, x0, y0, x1: x0 + size, y1: y0 + size });
const result = (input: RefineBoxInput, shift: number, extra: Partial<RefineResult> = {}): RefineResult => ({
  id: input.id, classId: input.classId, box: { x0: input.x0 + shift, y0: input.y0, x1: input.x1 - shift, y1: input.y1 },
  conf: 0.9, sideConf: { T: 0.9, B: 0.9, R: 0.9, L: 0.9 }, weakSides: [], areaChange: -shift * 2 / 10, areaFlagged: false, sizeLimited: false, flagged: false, ...extra
});

describe("folder dry run summary", () => {
  it("quantiles, shifts and samples", () => {
    expect(quantile([1, 2, 3, 4], 0.5)).toBe(2);
    expect(quantile([1, 2, 3, 4], 0.9)).toBe(4);
    expect(quantile([], 0.5)).toBe(0);
    expect(largestShift({ x0: 0, y0: 0, x1: 10, y1: 10 }, { x0: 1, y0: -3, x1: 10, y1: 12 })).toBe(3);
    expect(evenSample(10, 3)).toEqual([0, 5, 9]);
    expect(evenSample(3, 10)).toEqual([0, 1, 2]);
    expect(evenSample(5, 1)).toEqual([0]);
    expect(evenSample(5, 0)).toEqual([]);
  });

  it("counts moved and flagged boxes, reasons, classes and outliers over every box", () => {
    const a = [box("0", "0", 0), box("1", "0", 20), box("2", "1", 40), box("3", "1", 60)];
    const b = [box("0", "1", 0), box("1", "1", 20)];
    const summary = summarizeEdgeFolder([
      // a: two moved (1 px, 2 px), one flagged without moving (weak left side), one untouched (no result).
      { image: "a.png", boxes: a, results: new Map([
        ["0", result(a[0]!, 1)],
        ["1", result(a[1]!, 2)],
        ["2", result(a[2]!, 0, { flagged: true, weakSides: ["L"], conf: 0.2 })]
      ]) },
      // b: one moved 4 px and flagged for its area change.
      { image: "b.png", boxes: b, results: new Map([["0", result(b[0]!, 4, { flagged: true, areaFlagged: true, areaChange: -0.8 })]]) }
    ], { failed: 1, outliers: 3 });
    expect(summary.images).toEqual({ checked: 2, withChanges: 2, failed: 1 });
    expect(summary.boxes).toEqual({ total: 6, moved: 3, flagged: 2, flaggedPercent: 33.33 });
    expect(summary.flaggedBy).toEqual({ weakSide: 1, areaChange: 1, sizeLimit: 0 });
    expect(summary.weakSides).toEqual({ T: 0, B: 0, R: 0, L: 1 });
    expect(summary.shiftPx).toEqual({ median: 2, p90: 4, max: 4 });
    expect(summary.areaChangePercent.min).toBe(-80);
    expect(summary.confidence.p10).toBe(0.2);
    expect(summary.byClass).toEqual({
      0: { boxes: 2, moved: 2, flagged: 0, medianShiftPx: 1 },
      1: { boxes: 4, moved: 1, flagged: 2, medianShiftPx: 4 }
    });
    // Flagged boxes first (largest shift first among them), then the largest shifts; capped at 3.
    expect(summary.outliers.boxes.map((item) => [item.image, item.line, item.reasons])).toEqual([
      ["b.png", 0, ["area change"]], ["a.png", 2, ["weak L"]], ["a.png", 1, []]
    ]);
    expect(summary.outliers.images.map((item) => [item.image, item.flaggedPercent])).toEqual([["b.png", 50], ["a.png", 25]]);
    expect(summary.outliers.boxes[1]).toMatchObject({ confidence: 0.2, sideConfidence: { T: 0.9, B: 0.9, R: 0.9, L: 0.9 } });
  });

  it("an empty run is all zeros", () => {
    const summary = summarizeEdgeFolder([]);
    expect(summary.boxes).toEqual({ total: 0, moved: 0, flagged: 0, flaggedPercent: 0 });
    expect(summary.shiftPx).toEqual({ median: 0, p90: 0, max: 0 });
  });

  it("reclass: changes per class pair and the images with most changes", () => {
    const summary = summarizeReclassFolder([
      { image: "a.png", boxes: [box("0", "1", 0), box("1", "1", 20)], changes: [{ line: 0, from: "1", to: "0" }] },
      { image: "b.png", boxes: [box("0", "2", 0)], changes: [{ line: 0, from: "2", to: "0" }] },
      { image: "c.png", boxes: [box("0", "1", 0)], changes: [] }
    ]);
    expect(summary.boxes).toEqual({ total: 4, changed: 2, changedPercent: 50 });
    expect(summary.changesByClass).toEqual({ "1->0": 1, "2->0": 1 });
    expect(summary.images.withChanges).toBe(2);
    expect(summary.outliers.images.map((item) => item.image)).toEqual(["b.png", "a.png"]);
  });
});
