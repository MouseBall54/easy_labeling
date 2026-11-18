import { describe, expect, it } from "vitest";
import { DEFAULT_REFINE_PARAMS, REFINE_SIDES, describeRefineSide, normalizeRefineParams } from "../../../../src/domain/refine/edge-refine.js";
import { summarizeSideProfile } from "../../../../src/domain/refine/profile-summary.js";

/** A bright block x 20..60, y 15..45 on a dark 80 x 60 image. */
function blockImage() {
  const width = 80;
  const height = 60;
  const gray = new Uint8Array(width * height);
  for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) gray[y * width + x] = x >= 20 && x < 60 && y >= 15 && y < 45 ? 200 : 40;
  return { gray, width, height };
}

describe("edge profile summary", () => {
  it("reports the edge on the block boundary, its candidates and the polarity, in image pixels", () => {
    const img = blockImage();
    const box = { x0: 17, y0: 12, x1: 63, y1: 48 }; // 3 px loose on every side
    const params = normalizeRefineParams({ ...DEFAULT_REFINE_PARAMS });
    const expected = { T: 15, B: 45, L: 20, R: 60 } as const;
    for (const side of REFINE_SIDES) {
      // As if the crop started at (100, 200) in a larger image.
      const origin = side === "L" || side === "R" ? 100 : 200;
      const summary = summarizeSideProfile(describeRefineSide(img, box, side, params), origin);
      expect(summary.side).toBe(side);
      expect(summary.edge).not.toBeNull();
      expect(Math.abs(summary.edge! - (origin + expected[side]))).toBeLessThanOrEqual(1);
      expect(summary.candidates.length).toBeGreaterThan(0);
      expect(summary.candidates[0]!.strength).toBe(1);
      if (summary.criterion === "grad") expect(Math.abs(summary.candidates[0]!.at - (origin + expected[side]))).toBeLessThanOrEqual(1);
      expect(summary.scanned.from).not.toBe(summary.scanned.to);
    }
  });
});
