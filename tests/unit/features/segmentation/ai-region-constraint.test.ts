import { describe, expect, it } from "vitest";

import {
  clipAiSelectMaskToRegion,
  createAiSelectConstraintFromDetectionBox,
  expandAiSelectRegionRect,
  getActiveAiSelectRegionRect
} from "../../../../src/features/segmentation/ai-region-constraint.js";

describe("AI Select region constraint", () => {
  it("clips a mask strictly to an active ROI", () => {
    const mask = new Uint8Array(16).fill(1);
    const clipped = clipAiSelectMaskToRegion(mask, { width: 4, height: 4 }, { x: 1, y: 1, width: 2, height: 2 });

    expect([...clipped]).toEqual([0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0]);
    expect(mask).toEqual(new Uint8Array(16).fill(1));
  });

  it("expands margins and clamps them to image bounds", () => {
    expect(expandAiSelectRegionRect({ x: 1, y: 1, width: 4, height: 4 }, { value: 3, unit: "px" }, { width: 6, height: 6 }))
      .toEqual({ x: 0, y: 0, width: 6, height: 6 });
    expect(getActiveAiSelectRegionRect({ enabled: true, source: "manual", rect: { x: 2, y: 2, width: 2, height: 2 }, margin: { value: 50, unit: "percent" } }, { width: 10, height: 10 }))
      .toEqual({ x: 1, y: 1, width: 4, height: 4 });
  });

  it("accepts negative margins to shrink the active ROI", () => {
    expect(expandAiSelectRegionRect({ x: 2, y: 2, width: 8, height: 6 }, { value: -1, unit: "px" }, { width: 20, height: 20 }))
      .toEqual({ x: 3, y: 3, width: 6, height: 4 });
    expect(getActiveAiSelectRegionRect({ enabled: true, source: "manual", rect: { x: 2, y: 2, width: 8, height: 8 }, margin: { value: -25, unit: "percent" } }, { width: 20, height: 20 }))
      .toEqual({ x: 4, y: 4, width: 4, height: 4 });
  });

  it("creates a reusable constraint, center prompt, and box prompt from a detection box", () => {
    const result = createAiSelectConstraintFromDetectionBox({ labelId: "etch-12", rect: { x: 10, y: 20, width: 8, height: 6 }, margin: { value: 4, unit: "px" } });

    expect(result.constraint).toMatchObject({ source: "detection", detectionLabelId: "etch-12", margin: { value: 4, unit: "px" } });
    expect(result.centerPoint).toEqual({ x: 14, y: 23 });
    expect(result.promptBox).toEqual({ left: 10, top: 20, right: 18, bottom: 26 });
  });
});
