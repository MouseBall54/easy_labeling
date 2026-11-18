import { describe, expect, it } from "vitest";
import { changeBox, matchesBoxWhere, parseBoxWhere } from "../../../../src/domain/annotations/box-where.js";

const box = (id: string, classId: string, x0: number, y0: number, x1: number, y1: number) => ({ id, classId, x0, y0, x1, y1 });

describe("box where conditions", () => {
  const boxes = [
    box("speck", "0", 10, 10, 13, 12), // 3 x 2
    box("cell", "0", 20, 20, 60, 50), // 40 x 30
    box("other", "1", 100, 100, 140, 130),
    box("edge", "1", 190, 0, 210, 20)
  ];
  const ids = (where: unknown) => boxes.filter((entry) => matchesBoxWhere(entry, parseBoxWhere(where))).map((entry) => entry.id);

  it("ANDs class, size and region conditions", () => {
    expect(ids({ maxArea: 20 })).toEqual(["speck"]);
    expect(ids({ classIds: [1] })).toEqual(["other", "edge"]);
    expect(ids({ classIds: ["0"], minWidth: 10 })).toEqual(["cell"]);
    expect(ids({ inside: { x0: 0, y0: 0, x1: 200, y1: 200 } })).toEqual(["speck", "cell", "other"]);
    expect(ids({ outside: { x0: 0, y0: 0, x1: 200, y1: 200 } })).toEqual([]);
    expect(ids({ overlaps: { x0: 195, y0: 5, x1: 300, y1: 10 } })).toEqual(["edge"]);
    expect(ids({ annotationIds: ["cell", "other"], classIds: ["1"] })).toEqual(["other"]);
    // MCP sends absent fields as null.
    expect(ids({ maxArea: 20, minArea: null, inside: null })).toEqual(["speck"]);
  });

  it("refuses empty, unknown and malformed conditions", () => {
    expect(() => parseBoxWhere({})).toThrow(/at least one condition/);
    expect(() => parseBoxWhere({ classId: 1 })).toThrow(/unknown field classId/);
    expect(() => parseBoxWhere({ maxArea: -1 })).toThrow(/maxArea/);
    expect(() => parseBoxWhere({ inside: { x0: 5, y0: 0, x1: 5, y1: 10 } })).toThrow(/inside/);
    expect(() => parseBoxWhere({ classIds: [] })).toThrow(/non-empty/);
    expect(() => parseBoxWhere([])).toThrow(/object/);
  });

  it("moves and resizes boxes, clipped to the image", () => {
    const size = { width: 100, height: 80 };
    expect(changeBox({ x0: 10, y0: 10, x1: 20, y1: 20 }, { shift: { dx: 5, dy: -3 } }, size)).toEqual({ box: { x0: 15, y0: 7, x1: 25, y1: 17 }, clipped: false });
    expect(changeBox({ x0: 10, y0: 10, x1: 20, y1: 20 }, { resize: { dw: 4, dh: 2, anchor: "center" } }, size)).toEqual({ box: { x0: 8, y0: 9, x1: 22, y1: 21 }, clipped: false });
    expect(changeBox({ x0: 10, y0: 10, x1: 20, y1: 20 }, { resize: { dw: 4, dh: 2, anchor: "topLeft" } }, size)).toEqual({ box: { x0: 10, y0: 10, x1: 24, y1: 22 }, clipped: false });
    expect(changeBox({ x0: 90, y0: 10, x1: 98, y1: 20 }, { shift: { dx: 5, dy: 0 } }, size)).toEqual({ box: { x0: 95, y0: 10, x1: 100, y1: 20 }, clipped: true });
    // Pushed off the image: nothing left to keep.
    expect(changeBox({ x0: 90, y0: 10, x1: 98, y1: 20 }, { shift: { dx: 50, dy: 0 } }, size)).toBeNull();
  });
});
