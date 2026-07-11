import { describe, expect, it } from "vitest";

import {
  applyCandidatePadding,
  extractLocalMaxima,
  intersectionArea,
  suppressOverlappingCandidates
} from "../../../../src/features/automation/matching-candidates.js";

describe("template matching candidates", () => {
  it("extracts deterministic local maxima above the score threshold", () => {
    const candidates = extractLocalMaxima({
      scoreMap: {
        width: 5,
        height: 3,
        scores: [
          0.1, 0.2, 0.1, 0.3, 0.2,
          0.2, 0.91, 0.3, 0.85, 0.3,
          0.1, 0.2, 0.1, 0.2, 0.1
        ]
      },
      minimumScore: 0.8,
      boxWidth: 10,
      boxHeight: 8,
      offsetX: 4,
      offsetY: 5
    });

    expect(candidates).toEqual([
      { score: 0.91, x: 5, y: 6, width: 10, height: 8 },
      { score: 0.85, x: 7, y: 6, width: 10, height: 8 }
    ]);
  });

  it("strict non-overlap rejects every intersecting lower-score box", () => {
    const candidates = [
      { score: 0.95, x: 0, y: 0, width: 10, height: 10 },
      { score: 0.93, x: 9, y: 0, width: 10, height: 10 },
      { score: 0.9, x: 10, y: 0, width: 10, height: 10 }
    ];
    const selected = suppressOverlappingCandidates(candidates, {
      maximumDetections: 10,
      strictNonOverlap: true,
      nmsIouThreshold: 1
    });

    expect(selected).toEqual([candidates[0], candidates[2]]);
    expect(intersectionArea(selected[0], selected[1])).toBe(0);
  });

  it("supports configurable IoU NMS and output padding", () => {
    const padded = applyCandidatePadding({ score: 0.9, x: 10, y: 20, width: 8, height: 6 }, 2, 3);
    expect(padded).toEqual({ score: 0.9, x: 8, y: 17, width: 12, height: 12 });
    expect(suppressOverlappingCandidates([
      padded,
      { score: 0.8, x: 14, y: 17, width: 12, height: 12 }
    ], {
      maximumDetections: 10,
      strictNonOverlap: false,
      nmsIouThreshold: 0.2
    })).toEqual([padded]);
  });
});
