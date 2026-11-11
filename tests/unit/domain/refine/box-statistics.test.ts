import { describe, expect, it } from "vitest";
import { analyzeBoxes, type StatBox } from "../../../../src/domain/refine/box-statistics.js";

/** A 5 x 4 grid of 10 x 10 boxes at a 20 px pitch, ids "r<row>c<column>". */
function grid(edit: (boxes: StatBox[]) => void = () => undefined): StatBox[] {
  const boxes: StatBox[] = [];
  for (let row = 0; row < 4; row += 1) {
    for (let column = 0; column < 5; column += 1) {
      const x = 10 + column * 20;
      const y = 10 + row * 20;
      boxes.push({ id: `r${row}c${column}`, classId: "0", x0: x, y0: y, x1: x + 10, y1: y + 10 });
    }
  }
  edit(boxes);
  return boxes;
}
const byId = (boxes: StatBox[], id: string): StatBox => boxes.find((box) => box.id === id)!;

describe("box population checks", () => {
  it("a regular grid has rows, columns and a pitch, and nothing to flag", () => {
    const result = analyzeBoxes(grid());
    expect(result.byClass["0"]).toEqual({
      count: 20, medianWidth: 10, medianHeight: 10, ungrouped: 0,
      groups: [{ count: 20, medianWidth: 10, medianHeight: 10, rows: 4, columns: 5, rowPitch: 20, columnPitch: 20 }]
    });
    expect(result.findings).toEqual([]);
    expect(result.missing).toEqual([]);
  });

  it("finds a missing position once, at its estimated centre", () => {
    const result = analyzeBoxes(grid((boxes) => boxes.splice(boxes.findIndex((box) => box.id === "r1c2"), 1)));
    expect(result.missing).toEqual([{ classId: "0", between: ["r1c1", "r1c3"], along: "row", x: 55, y: 35, width: 10, height: 10 }]);
    expect(result.counts.missing).toBe(1);
  });

  it("flags an oversized box, a box off its row and a crowded extra box", () => {
    const boxes = grid((list) => {
      byId(list, "r0c0").x1 += 6; // width 16 vs 10
      const shifted = byId(list, "r2c3");
      shifted.y0 += 4;
      shifted.y1 += 4;
      list.push({ id: "extra", classId: "0", x0: 78, y0: 70, x1: 88, y1: 80 }); // 8 px right of r3c3 (x 70)
    });
    const result = analyzeBoxes(boxes);
    const found = result.findings.map((finding) => [finding.id, finding.type]);
    expect(found).toContainEqual(["r0c0", "size"]);
    expect(found).toContainEqual(["r2c3", "off-row"]);
    expect(found).toContainEqual(["extra", "crowded"]);
    expect(result.findings.find((finding) => finding.type === "size")!.detail).toBe("width 16 vs 10, the median of the nearest size group (10x10) (+60%)");
    expect(result.counts.size).toBe(1);
  });

  it("one class with two shapes: each size group has its own rows, and a spot the other shape fills is not missing", () => {
    // Every row alternates a 30 px bar and a 10 px pad: the bars' row pitch skips the pads, which are not holes.
    const boxes: StatBox[] = [];
    for (let row = 0; row < 4; row += 1) {
      for (let column = 0; column < 6; column += 1) {
        const x = 10 + column * 40;
        const y = 10 + row * 20;
        boxes.push({ id: `r${row}c${column}`, classId: "0", x0: x, y0: y, x1: x + (column % 2 ? 10 : 30), y1: y + 10 });
      }
    }
    const result = analyzeBoxes(boxes);
    expect(result.byClass["0"]!.groups.map((group) => [group.count, group.medianWidth])).toEqual([[12, 10], [12, 30]]);
    expect(result.findings).toEqual([]);
    expect(result.missing).toEqual([]);
    // Removing one bar leaves an empty spot: that one is missing.
    const result2 = analyzeBoxes(boxes.filter((box) => box.id !== "r1c2"));
    expect(result2.missing).toMatchObject([{ classId: "0", x: 105, y: 35 }]);
  });

  it("flags a similar-size box overlapping another as a likely duplicate, of any class", () => {
    const boxes = grid((list) => list.push({ id: "copy", classId: "1", x0: 15, y0: 10, x1: 25, y1: 20 })); // half a box right of r0c0
    const overlaps = analyzeBoxes(boxes).findings.filter((finding) => finding.type === "overlap");
    expect(overlaps).toEqual([{ id: "copy", classId: "1", type: "overlap", detail: "overlaps r0c0 (IoU 0.33, similar size, class 0 vs 1): likely a duplicate", deviation: 0.333 }]);
    // A small box inside a big one is not a duplicate.
    const nested = analyzeBoxes([...grid(), { id: "dot", classId: "0", x0: 12, y0: 12, x1: 16, y1: 16 }]);
    expect(nested.counts.overlap).toBe(0);
  });

  it("classes are checked apart, and too few boxes are not judged", () => {
    const boxes = grid();
    boxes.push({ id: "big", classId: "1", x0: 0, y0: 0, x1: 50, y1: 50 }, { id: "small", classId: "1", x0: 60, y0: 0, x1: 65, y1: 5 });
    const result = analyzeBoxes(boxes);
    expect(result.byClass["1"]).toMatchObject({ count: 2, groups: [], ungrouped: 2 });
    expect(result.findings).toEqual([]);
  });
});
