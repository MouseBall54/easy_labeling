import { describe, expect, it } from "vitest";
import { analyzeMask, cleanMask } from "../../../../src/domain/annotations/mask-analysis.js";

const W = 60;
const H = 40;
function mask(...rects: Array<[number, number, number, number, number]>): Uint16Array {
  const out = new Uint16Array(W * H);
  for (const [classId, x0, y0, x1, y1] of rects) for (let y = y0; y < y1; y += 1) for (let x = x0; x < x1; x += 1) out[y * W + x] = classId;
  return out;
}
// Two 10 x 10 squares joined by a 1 px bridge, a 12 x 12 square with a 2 x 2 hole, and a 2 x 2 speck.
const sample = () => {
  const out = mask([1, 2, 2, 12, 12], [1, 12, 6, 16, 7], [1, 16, 2, 26, 12], [1, 30, 2, 42, 14], [1, 50, 30, 52, 32]);
  for (const [x, y] of [[35, 7], [36, 7], [35, 8], [36, 8]] as const) out[y * W + x] = 0;
  return out;
};

describe("mask checks", () => {
  it("finds the speck, the hole (with its enclosing region) and the necked pair", () => {
    const result = analyzeMask(sample(), W, H, null, { speckArea: 10 });
    expect(result.counts).toMatchObject({ specks: 1, holes: 1, necked: 1 });
    expect(result.specks[0]).toMatchObject({ classId: "1", area: 4, x0: 50, y0: 30 });
    expect(result.holes[0]).toMatchObject({ classId: "1", area: 4, x0: 35, y0: 7, x1: 37, y1: 9, region: { x: 30, y: 2 } });
    expect(result.necked[0]).toMatchObject({ parts: 2, x0: 2, x1: 26 });
    expect(result.byClass["1"]!.regions).toBe(3);
  });

  it("reports boundaries off the image edges when given the image", () => {
    // The image is bright exactly under the left pair, flat elsewhere: the 12 x 12 square fits no edge.
    const gray = Uint8Array.from({ length: W * H }, (_, index) => {
      const x = index % W, y = Math.floor(index / W);
      return x >= 2 && x < 26 && y >= 2 && y < 12 ? 200 : 40;
    });
    const result = analyzeMask(sample(), W, H, { width: W, height: H, gray }, { speckArea: 10 });
    expect(result.offEdges.map((entry) => entry.x0)).toEqual([30]);
  });
});

describe("mask clean-up", () => {
  it("removes specks, fills holes and cuts the neck, keeping the squares' corners", () => {
    const data = sample();
    const result = cleanMask(data, W, H, null, { removeSpecks: 10, fillHoles: 10, splitNecks: 1 });
    expect(result).toMatchObject({ specksRemoved: 1, holesFilled: 1, necksCut: 1 });
    // 4 speck + 4 hole + the 4-pixel bridge.
    expect(result.changed).toBe(12);
    const after = analyzeMask(data, W, H, null, { speckArea: 10 });
    expect(after.counts).toMatchObject({ specks: 0, holes: 0, necked: 0 });
    expect(after.byClass["1"]!.regions).toBe(3);
    expect(data[2 * W + 2]).toBe(1);
    expect(data[11 * W + 11]).toBe(1);
  });

  it("snaps every region onto the intensity step", () => {
    const gray = Uint8Array.from({ length: W * H }, (_, index) => {
      const x = index % W, y = Math.floor(index / W);
      return x >= 20 && x < 35 && y >= 10 && y < 25 ? 200 : 40;
    });
    const data = mask([1, 18, 8, 37, 27]);
    const result = cleanMask(data, W, H, { width: W, height: H, gray }, { snapPx: 3 });
    expect(result.regionsSnapped).toBe(1);
    expect(result.changed).toBe(19 * 19 - 15 * 15);
    expect(data[10 * W + 20]).toBe(1);
    expect(data[9 * W + 20]).toBe(0);
  });
});
