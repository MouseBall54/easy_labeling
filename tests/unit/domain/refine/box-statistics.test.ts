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
    expect(result.byClass["0"]).toEqual({ count: 20, medianWidth: 10, medianHeight: 10, rows: 4, columns: 5, rowPitch: 20, columnPitch: 20 });
    expect(result.findings).toEqual([]);
    expect(result.missing).toEqual([]);
  });

  it("finds a missing position once, at its estimated centre", () => {
    const result = analyzeBoxes(grid((boxes) => boxes.splice(boxes.findIndex((box) => box.id === "r1c2"), 1)));
    expect(result.missing).toEqual([{ classId: "0", between: ["r1c1", "r1c3"], along: "row", x: 55, y: 35 }]);
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
    expect(result.findings.find((finding) => finding.type === "size")!.detail).toBe("width 16 vs class median 10 (+60%)");
    expect(result.counts.size).toBe(1);
  });

  it("classes are checked apart, and too few boxes are not judged", () => {
    const boxes = grid();
    boxes.push({ id: "big", classId: "1", x0: 0, y0: 0, x1: 50, y1: 50 }, { id: "small", classId: "1", x0: 60, y0: 0, x1: 65, y1: 5 });
    const result = analyzeBoxes(boxes);
    expect(result.byClass["1"]).toMatchObject({ count: 2, rows: 0 });
    expect(result.findings).toEqual([]);
  });
});
