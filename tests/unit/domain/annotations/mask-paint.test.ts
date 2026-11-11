import { describe, expect, it } from "vitest";
import { checkMaskShape, paintShapes } from "../../../../src/domain/annotations/mask-paint.js";

const W = 20;
const H = 12;
const count = (mask: Uint16Array, value: number) => mask.reduce((sum, entry) => sum + (entry === value ? 1 : 0), 0);

describe("mask painting", () => {
  it("a rect in pixel edges covers exactly its pixels, and is clipped to the image", () => {
    const mask = new Uint16Array(W * H);
    expect(paintShapes(mask, W, H, [{ type: "rect", x0: 2, y0: 3, x1: 6, y1: 5 }], 4)).toEqual({ changed: 8, bounds: { x0: 2, y0: 3, x1: 6, y1: 5 } });
    expect(mask[3 * W + 2]).toBe(4);
    expect(mask[3 * W + 6]).toBe(0);
    expect(paintShapes(mask, W, H, [{ type: "rect", x0: -5, y0: -5, x1: 1, y1: 1 }], 4).changed).toBe(1);
  });

  it("fills a polygon by pixel centres (a right triangle: half the square, the diagonal row-centred)", () => {
    const mask = new Uint16Array(W * H);
    paintShapes(mask, W, H, [{ type: "polygon", points: [[0, 0], [10, 0], [0, 10]] }], 1);
    // Row y's centre line meets the hypotenuse at x = 9.5 - y: pixels 0 .. 8 - y, so 9 + 8 + ... + 1 = 45; row 9 gets none.
    expect(count(mask, 1)).toBe(45);
    expect(mask[0]).toBe(1);
    expect(mask[8 * W + 0]).toBe(1);
    expect(mask[8 * W + 1]).toBe(0);
    expect(mask[9 * W + 0]).toBe(0);
  });

  it("circles and thick lines; erase sets 0; only paints over one value", () => {
    const mask = new Uint16Array(W * H);
    paintShapes(mask, W, H, [{ type: "circle", cx: 5, cy: 5, r: 2 }], 2);
    expect(count(mask, 2)).toBe(12);
    paintShapes(mask, W, H, [{ type: "line", points: [[0, 10.5], [20, 10.5]], width: 1 }], 3);
    expect(count(mask, 3)).toBe(20);
    // Painting class 5 over the background only leaves the circle alone.
    const result = paintShapes(mask, W, H, [{ type: "rect", x0: 0, y0: 0, x1: 20, y1: 10 }], 5, { only: 0 });
    expect(result.changed).toBe(200 - 12);
    expect(count(mask, 2)).toBe(12);
    expect(paintShapes(mask, W, H, [{ type: "circle", cx: 5, cy: 5, r: 2 }], 0).changed).toBe(12);
    expect(paintShapes(mask, W, H, [{ type: "circle", cx: 5, cy: 5, r: 2 }], 0)).toEqual({ changed: 0, bounds: null });
  });

  it("names what is wrong with a shape", () => {
    expect(() => checkMaskShape({ type: "rect", x0: 5, y0: 0, x1: 2, y1: 3 }, "shapes[0]")).toThrow(/shapes\[0\]: a rect needs numbers x0 < x1/);
    expect(() => checkMaskShape({ type: "polygon", points: [[0, 0], [1, 1]] }, "s")).toThrow(/3 to 10000/);
    expect(() => checkMaskShape({ type: "line", points: [[0, 0], [1, 1]] }, "s")).toThrow(/width > 0/);
    expect(() => checkMaskShape({ type: "blob" }, "s")).toThrow(/type must be/);
    expect(checkMaskShape({ type: "circle", cx: 1, cy: 2, r: 3, extra: true }, "s")).toEqual({ type: "circle", cx: 1, cy: 2, r: 3 });
  });
});
