import { describe, expect, it } from "vitest";
import { matchMasks, summarizeMaskComparison } from "../../../../src/domain/annotations/mask-compare.js";

const W = 40;
const H = 30;
/** A mask with filled rectangles [classId, x0, y0, x1, y1) (x1/y1 exclusive). */
function mask(...rects: Array<[number, number, number, number, number]>): Uint16Array {
  const out = new Uint16Array(W * H);
  for (const [classId, x0, y0, x1, y1] of rects) for (let y = y0; y < y1; y += 1) for (let x = x0; x < x1; x += 1) out[y * W + x] = classId;
  return out;
}

describe("mask comparison", () => {
  it("a mask against itself is perfect", () => {
    const truth = mask([1, 2, 2, 12, 12], [2, 20, 5, 30, 25]);
    const result = summarizeMaskComparison([matchMasks("a", truth, truth, W, H)]);
    expect(result).toMatchObject({ meanIou: 1, boundaryF1: 1, regions: { reference: 2, labels: 2, misses: 0, extras: 0, wrongClass: 0 }, confusions: {} });
    expect(result.classes["1"]).toMatchObject({ iou: 1, dice: 1, outwardPx: 0 });
  });

  it("a boundary 1 px out: IoU drops, boundary F1 stays 1 within 2 px but not within 0 px, outward +1", () => {
    const truth = mask([1, 10, 10, 20, 20]);
    const fat = mask([1, 9, 9, 21, 21]);
    const loose = summarizeMaskComparison([matchMasks("a", fat, truth, W, H, 2)], { tolerancePx: 2 });
    expect(loose.classes["1"]).toMatchObject({ referencePixels: 100, labelPixels: 144, iou: 0.694, precision: 0.694, recall: 1, boundaryF1: 1 });
    // 44 extra pixels over a 36-pixel reference boundary.
    expect(loose.classes["1"]!.outwardPx).toBe(1.22);
    const strict = summarizeMaskComparison([matchMasks("a", fat, truth, W, H, 0)], { tolerancePx: 0 });
    expect(strict.boundaryF1).toBe(0);
  });

  it("counts a dropped region as a miss, a stray blob as an extra, a relabelled region as a wrong class", () => {
    const truth = mask([1, 2, 2, 8, 8], [1, 12, 2, 18, 8], [1, 22, 2, 28, 8]);
    const labels = mask([1, 2, 2, 8, 8], [2, 12, 2, 18, 8], [1, 30, 20, 34, 24]);
    const match = matchMasks("img", labels, truth, W, H);
    expect(match.misses.map((region) => [region.x0, region.covered])).toEqual([[22, 0]]);
    expect(match.wrongClass.map((region) => [region.x0, region.labelClassId])).toEqual([[12, "2"]]);
    expect(match.extras.map((region) => [region.x0, region.classId])).toEqual([[30, "1"]]);
    const result = summarizeMaskComparison([match], { outliers: 1 });
    expect(result.confusions).toEqual({ "1->2": 36 });
    expect(result.regions).toEqual({ reference: 3, labels: 3, misses: 1, extras: 1, wrongClass: 1 });
    expect(result.worst.misses[0]).toMatchObject({ image: "img", area: 36 });
    // Class 2 is not in the reference: the mean IoU is over class 1 only (36 of 36+72+16 pixels).
    expect(result.meanIou).toBe(0.29);
  });

  it("lists the worst image first", () => {
    const truth = mask([1, 2, 2, 12, 12]);
    const result = summarizeMaskComparison([matchMasks("good", truth, truth, W, H), matchMasks("bad", mask(), truth, W, H)]);
    expect(result.perImage.map((image) => image.image)).toEqual(["bad", "good"]);
    expect(result.perImage[0]).toMatchObject({ meanIou: 0, misses: 1 });
  });
});
