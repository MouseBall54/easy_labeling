import { describe, expect, it } from "vitest";
import { boxIou, matchBoxes, summarizeComparison } from "../../../../src/domain/annotations/label-compare.js";

const box = (id: string, classId: string, x0: number, y0: number, x1: number, y1: number) => ({ id, classId, x0, y0, x1, y1 });

describe("label comparison against reference labels", () => {
  it("IoU", () => {
    expect(boxIou(box("a", "0", 0, 0, 10, 10), box("b", "0", 5, 0, 15, 10))).toBeCloseTo(1 / 3, 6);
    expect(boxIou(box("a", "0", 0, 0, 10, 10), box("b", "0", 10, 0, 20, 10))).toBe(0);
  });

  it("pairs one-to-one by IoU, largest first", () => {
    const reference = [box("0", "1", 0, 0, 10, 10)];
    // Both overlap the reference; the closer one wins and the other is an extra.
    const match = matchBoxes("a.png", [box("far", "1", 2, 0, 12, 10), box("near", "1", 1, 0, 11, 10)], reference);
    expect(match.matched.map((pair) => pair.label.id)).toEqual(["near"]);
    expect(match.extras.map((item) => item.id)).toEqual(["far"]);
    expect(match.misses).toEqual([]);
    expect(matchBoxes("a.png", [box("x", "1", 6, 0, 16, 10)], reference).misses.map((item) => item.id)).toEqual(["0"]);
  });

  it("scores precision, recall, edge errors, bias and class confusions", () => {
    const reference = [box("0", "1", 0, 0, 20, 20), box("1", "1", 40, 0, 60, 20), box("2", "2", 80, 0, 100, 20), box("3", "1", 120, 0, 140, 20)];
    const labels = [
      box("a", "1", -2, 0, 22, 20), // 2 px wider on both sides
      box("b", "1", 40, 0, 60, 20), // exact
      box("c", "1", 80, 0, 100, 20), // right place, wrong class (2 -> 1)
      box("d", "1", 300, 0, 320, 20) // extra; reference 3 is missed
    ];
    const summary = summarizeComparison([matchBoxes("a.png", labels, reference)]);
    expect(summary.boxes).toEqual({ reference: 4, labels: 4, matched: 3, correct: 2, wrongClass: 1, extras: 1, misses: 1 });
    expect(summary.precision).toBe(0.5);
    expect(summary.recall).toBe(0.5);
    expect(summary.f1).toBe(0.5);
    expect(summary.confusions).toEqual({ "2->1": 1 });
    expect(summary.edgeErrorPx.max).toBe(2);
    expect(summary.edgeBiasPx).toEqual({ T: 0, B: 0, L: 0, R: 0 });
    expect(summary.worst.edges[0]).toMatchObject({ maxEdgeErrorPx: 2, outwardPx: { L: 2, R: 2, T: 0, B: 0 } });
    expect(summary.worst.misses.map((item) => item.reference.id)).toEqual(["3"]);
    expect(summary.worst.extras.map((item) => item.label.id)).toEqual(["d"]);
    expect(summary.byClass["2"]).toMatchObject({ reference: 1, correct: 0, recall: 0 });
    // Ignoring classes, the wrong-class pair counts.
    expect(summarizeComparison([matchBoxes("a.png", labels, reference)], { classAware: false }).precision).toBe(0.75);
  });

  it("bias shows labels drawn consistently too large; perImage lists the worst image first", () => {
    const reference = [box("0", "0", 0, 0, 10, 10), box("1", "0", 20, 0, 30, 10)];
    const grown = reference.map((item) => ({ ...item, x0: item.x0 - 1, x1: item.x1 + 1, y1: item.y1 + 1 }));
    const summary = summarizeComparison([matchBoxes("good.png", grown, reference), matchBoxes("bad.png", [], reference)]);
    expect(summary.edgeBiasPx).toEqual({ T: 0, B: 1, L: 1, R: 1 });
    expect(summary.perImage.map((image) => [image.image, image.f1])).toEqual([["bad.png", 0], ["good.png", 1]]);
    expect(summarizeComparison([]).f1).toBe(0);
  });
});
