import { describe, expect, it } from "vitest";

import type { GrayImage } from "../../../src/domain/refine/edge-refine.js";
import {
  analyzeRecenter,
  createRecenterRule,
  describeRecenterRule,
  normalizeRecenterRule,
  recenterBox,
  recenterRegion,
  type RecenterRule
} from "../../../src/domain/refine/recenter.js";

/** 40 x 40 dark image with bright rectangles [x0, y0, x1, y1). */
function image(...blobs: [number, number, number, number][]): GrayImage {
  const gray = new Uint8Array(1600).fill(20);
  for (const [x0, y0, x1, y1] of blobs) for (let y = y0; y < y1; y += 1) for (let x = x0; x < x1; x += 1) gray[y * 40 + x] = 220;
  return { gray, width: 40, height: 40 };
}
const rule = (patch: Partial<RecenterRule> = {}): RecenterRule => ({ ...createRecenterRule(), ...patch });
const box = (x0: number, y0: number, x1: number, y1: number) => ({ id: "a", classId: "0", x0, y0, x1, y1 });

describe("domain/refine/recenter", () => {
  it("moves the box onto the blob centroid and keeps its size", () => {
    // Blob 10..20 x 12..18: centre (15, 15). Box 10x10 centred on (12, 17).
    const result = recenterBox(image([10, 12, 20, 18]), box(7, 12, 17, 22), rule());
    expect(result.status).toBe("moved");
    expect(result.shiftX).toBeCloseTo(3, 9);
    expect(result.shiftY).toBeCloseTo(-2, 9);
    expect(result.box).toEqual({ x0: 10, y0: 10, x1: 20, y1: 20 });
    expect(result.count).toBe(60);
  });

  it("moves only the chosen axis", () => {
    const img = image([10, 12, 20, 18]);
    expect(recenterBox(img, box(7, 12, 17, 22), rule({ axis: "x" })).box).toEqual({ x0: 10, y0: 12, x1: 20, y1: 22 });
    const y = recenterBox(img, box(7, 12, 17, 22), rule({ axis: "y" }));
    expect(y.box).toEqual({ x0: 7, y0: 10, x1: 17, y1: 20 });
    expect(y.shiftX).toBe(0);
  });

  it("dark targets count pixels at or below the level", () => {
    const gray = new Uint8Array(1600).fill(200);
    for (let y = 10; y < 20; y += 1) for (let x = 20; x < 30; x += 1) gray[y * 40 + x] = 10;
    const result = recenterBox({ gray, width: 40, height: 40 }, box(17, 10, 27, 20), rule({ target: { level: 50, dark: true } }));
    expect(result.box).toEqual({ x0: 20, y0: 10, x1: 30, y1: 20 });
  });

  it("leaves the box when nothing or too little matches", () => {
    expect(recenterBox(image(), box(10, 10, 20, 20), rule()).status).toBe("notFound");
    const few = recenterBox(image([14, 14, 16, 16]), box(10, 10, 20, 20), rule({ minPixels: 5 }));
    expect(few.status).toBe("tooFew");
    expect(few.box).toEqual({ x0: 10, y0: 10, x1: 20, y1: 20 });
    expect(recenterBox(image([14, 14, 16, 16]), box(10, 10, 20, 20), rule({ minPixels: 1, minRatio: 0.5 })).status).toBe("tooFew");
  });

  it("leaves the box when the shift passes maxShift", () => {
    // Blob centre 6 px right of the box centre on a 10 px box: 60% > 50%.
    const img = image([18, 10, 24, 20]);
    expect(recenterBox(img, box(10, 10, 20, 20), rule({ marginRight: 1 })).status).toBe("tooFar");
    expect(recenterBox(img, box(10, 10, 20, 20), rule({ marginRight: 1, maxShift: 0.7 })).status).toBe("moved");
  });

  it("reports a centred box without moving it", () => {
    expect(recenterBox(image([12, 12, 18, 18]), box(10, 10, 20, 20), rule()).status).toBe("centred");
  });

  it("nearest group ignores a neighbour inside the region; all pixels do not", () => {
    // Own blob 10..16 (centre 13), box centre 11; the neighbour 22..28 reaches into the region (to x 26).
    const img = image([10, 10, 16, 20], [22, 10, 28, 20]);
    const near = recenterBox(img, box(6, 10, 16, 20), rule({ marginLeft: 1, marginRight: 1, axis: "x" }));
    expect(near.box.x0).toBeCloseTo(8, 9);
    expect(near.status).toBe("moved");
    const all = recenterBox(img, box(6, 10, 16, 20), rule({ marginLeft: 1, marginRight: 1, axis: "x", component: "all", maxShift: 2 }));
    expect(all.shiftX).toBeCloseTo(6.4, 9);
  });

  it("nearest group: the group holding the centre wins over a bigger one further away", () => {
    const img = image([12, 12, 16, 16], [24, 4, 36, 36]);
    const analysis = analyzeRecenter(img, box(10, 10, 20, 20), rule({ marginRight: 2 }));
    expect(analysis.count).toBe(16);
    expect(analysis.targets).toBeGreaterThan(16);
    expect(analysis.centroid).toEqual({ x: 14, y: 14 });
  });

  it("region grows by margins, shrinks with negative ones, and clips to the image", () => {
    const b = { x0: 10, y0: 10, x1: 20, y1: 30 };
    expect(recenterRegion(b, rule({ marginLeft: 0.5, marginRight: -0.2, marginTop: 0.1, marginBottom: 0 }), { width: 40, height: 40 })).toEqual({ x0: 5, y0: 8, x1: 18, y1: 30 });
    expect(recenterRegion(b, rule({ marginLeft: 3, marginBottom: 3 }), { width: 40, height: 40 })).toEqual({ x0: 0, y0: 5, x1: 23, y1: 40 });
  });

  it("keeps the moved box inside the image", () => {
    const result = recenterBox(image([0, 10, 4, 20]), box(1, 10, 11, 20), rule({ marginLeft: 0, maxShift: 1 }));
    expect(result.status).toBe("moved");
    expect(result.box.x0).toBe(0);
    expect(result.box.x1).toBe(10);
  });

  it("normalizes stored rules", () => {
    const r = normalizeRecenterRule({ marginTop: -5, marginLeft: "9", axis: "z", component: "all", minPixels: 0, target: { level: 300, dark: true }, fromClasses: [1, " 2 ", ""] });
    expect(r).toMatchObject({ marginTop: -0.45, marginLeft: 3, axis: "both", component: "all", minPixels: 1, target: { level: 255, dark: true }, fromClasses: ["1", "2"] });
    expect(normalizeRecenterRule(undefined)).toEqual(createRecenterRule());
    expect(describeRecenterRule(createRecenterRule())).toContain("both axes");
  });
});
