import { describe, expect, it } from "vitest";
import { cropMask, cropStats, largestPiece, snapToIntensity } from "../../../../src/domain/annotations/mask-fit.js";

const W = 60;
const H = 40;
/** A dark image (gray 40) with a bright square (200) at x 20..35, y 10..25. */
const image = { width: W, height: H, gray: Uint8Array.from({ length: W * H }, (_, index) => {
  const x = index % W, y = Math.floor(index / W);
  return x >= 20 && x < 35 && y >= 10 && y < 25 ? 200 : 40;
}) };
const rectMask = (x0: number, y0: number, x1: number, y1: number) => Uint8Array.from({ length: W * H }, (_, index) => {
  const x = index % W, y = Math.floor(index / W);
  return x >= x0 && x < x1 && y >= y0 && y < y1 ? 1 : 0;
});

describe("proposal numbers", () => {
  it("crops to the bounding box, optionally clipped", () => {
    const crop = cropMask(rectMask(20, 10, 35, 25), W, H)!;
    expect([crop.x0, crop.y0, crop.width, crop.height]).toEqual([20, 10, 15, 15]);
    expect(cropMask(rectMask(20, 10, 35, 25), W, H, { x0: 30, y0: 0, x1: 60, y1: 40 })!.width).toBe(5);
    expect(cropMask(new Uint8Array(W * H), W, H)).toBeNull();
  });

  it("a mask on the square's edges fits well; the same mask moved onto flat background does not", () => {
    const onEdges = cropStats(cropMask(rectMask(20, 10, 35, 25), W, H)!, image);
    expect(onEdges).toMatchObject({ pixels: 225, x0: 20, y0: 10, x1: 35, y1: 25, pieces: 1, largestShare: 1 });
    expect(onEdges.edgeFit!).toBeGreaterThan(2);
    const offEdges = cropStats(cropMask(rectMask(40, 12, 55, 27), W, H)!, image);
    expect(offEdges.edgeFit!).toBeLessThan(0.5);
    expect(cropStats(cropMask(rectMask(20, 10, 35, 25), W, H)!).edgeFit).toBeNull();
  });

  it("keeps the largest piece and reports the pieces", () => {
    const mask = rectMask(20, 10, 35, 25);
    mask[2 * W + 2] = 1;
    const crop = cropMask(mask, W, H)!;
    expect(cropStats(crop)).toMatchObject({ pixels: 226, pieces: 2, largestShare: 0.996 });
    const top = largestPiece(crop);
    expect([top.x0, top.y0, top.width, top.height]).toEqual([20, 10, 15, 15]);
    expect(cropStats(top)).toMatchObject({ pixels: 225, pieces: 1 });
  });
});

describe("snapping a proposal to the intensity step", () => {
  it("a proposal 2 px too fat, or 2 px too thin, lands on the square within a 3 px band", () => {
    for (const [x0, y0, x1, y1] of [[18, 8, 37, 27], [22, 12, 33, 23]] as const) {
      const snapped = snapToIntensity(cropMask(rectMask(x0, y0, x1, y1), W, H)!, image, 3);
      expect(cropStats(snapped)).toMatchObject({ pixels: 225, x0: 20, y0: 10, x1: 35, y1: 25 });
    }
  });

  it("cannot move further than the band, and leaves flat areas alone", () => {
    // 4 px too fat with a 2 px band: the boundary moves 2 px in, still 2 px out.
    expect(cropStats(snapToIntensity(cropMask(rectMask(16, 6, 39, 29), W, H)!, image, 2))).toMatchObject({ x0: 18, y0: 8, x1: 37, y1: 27 });
    const flat = cropMask(rectMask(40, 12, 55, 27), W, H)!;
    expect(snapToIntensity(flat, image, 3)).toBe(flat);
  });
});
