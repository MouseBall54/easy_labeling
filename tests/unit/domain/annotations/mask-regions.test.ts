import { describe, expect, it } from "vitest";
import { maskRegions } from "../../../../src/domain/annotations/mask-regions.js";

/** Rows of digits -> a mask (each digit a class id). */
const grid = (...rows: string[]) => ({ mask: Uint16Array.from(rows.join("").split("").map(Number)), width: rows[0]!.length, height: rows.length });

describe("mask regions", () => {
  it("labels 4-connected regions per class with area, box, centre and a seed inside", () => {
    const { mask, width, height } = grid(
      "1100022",
      "1100020",
      "0010000",
      "0111033"
    );
    const result = maskRegions(mask, width, height);
    expect(result.pixelsByClass).toEqual({ 1: 8, 2: 3, 3: 2 });
    // The diagonal touch at (1,1)-(2,2) does not join: the top-left block and the lower "T" are two regions of class 1.
    expect(result.regionsByClass).toEqual({ 1: 2, 2: 1, 3: 1 });
    expect(result.regions.map((region) => [region.classId, region.area, region.x0, region.y0, region.x1, region.y1])).toEqual([
      ["1", 4, 0, 0, 2, 2], ["1", 4, 1, 2, 4, 4], ["2", 3, 5, 0, 7, 2], ["3", 2, 5, 3, 7, 4]
    ]);
    const t = result.regions[1]!;
    expect(t.seed).toEqual({ x: 2, y: 2 });
    expect(mask[t.seed.y * width + t.seed.x]).toBe(1);
    expect([t.cx, t.cy]).toEqual([2.5, 3.3]);
  });

  it("joins a U shape whose arms meet only at the bottom (union of two labels)", () => {
    const { mask, width, height } = grid(
      "101",
      "101",
      "111"
    );
    const result = maskRegions(mask, width, height);
    expect(result.regions).toHaveLength(1);
    expect(result.regions[0]).toMatchObject({ area: 7, x0: 0, y0: 0, x1: 3, y1: 3, seed: { x: 0, y: 0 } });
  });

  it("an empty mask has no regions", () => {
    expect(maskRegions(new Uint16Array(6), 3, 2)).toEqual({ width: 3, height: 2, pixelsByClass: {}, regionsByClass: {}, regions: [] });
  });
});
