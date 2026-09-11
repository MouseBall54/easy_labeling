import { describe, expect, it } from "vitest";

import {
  DEFAULT_SEGMENTATION_PREPROCESSING_CONFIG,
  getSegmentationPreprocessingKey,
  normalizeSegmentationPreprocessingConfig,
  preprocessSegmentationImage
} from "../../../../src/features/segmentation/preprocessing.js";

function createStepImage(): Uint8ClampedArray {
  const rgba = new Uint8ClampedArray(4 * 4 * 4);
  for (let y = 0; y < 4; y += 1) for (let x = 0; x < 4; x += 1) {
    const offset = (y * 4 + x) * 4;
    const value = x < 2 ? 0 : 255;
    rgba[offset] = value;
    rgba[offset + 1] = value;
    rgba[offset + 2] = value;
    rgba[offset + 3] = 255;
  }
  return rgba;
}

describe("segmentation preprocessing", () => {
  it("keeps the original pixels unchanged in Original mode", () => {
    const source = createStepImage();
    const result = preprocessSegmentationImage({ width: 4, height: 4, rgba: source }, { mode: "original" });

    expect(result).not.toBe(source);
    expect(result).toEqual(source);
    expect(source).toEqual(createStepImage());
  });

  it("creates normalized grayscale edge and blend outputs without changing dimensions", () => {
    const source = createStepImage();
    const edge = preprocessSegmentationImage({ width: 4, height: 4, rgba: source }, { mode: "edge", blurStrength: 0 });
    const blend = preprocessSegmentationImage({ width: 4, height: 4, rgba: source }, { mode: "edge-blend", blurStrength: 0, edgeWeight: 0.5 });

    expect(edge).toHaveLength(source.length);
    expect(blend).toHaveLength(source.length);
    expect(edge[4 * 4 + 3]).toBe(255);
    expect(edge[4 * (4 + 1)]).toBeGreaterThan(0);
    expect(blend[4 * (4 + 1)]).not.toBe(edge[4 * (4 + 1)]);
  });

  it("normalizes stable cache configuration values", () => {
    const config = normalizeSegmentationPreprocessingConfig({ mode: "edge-blend", blurStrength: 9, edgeWeight: 2 });
    expect(config).toEqual({ mode: "edge-blend", blurStrength: 4, edgeWeight: 1 });
    expect(getSegmentationPreprocessingKey(config)).toBe("edge-blend:4:1.000");
    expect(DEFAULT_SEGMENTATION_PREPROCESSING_CONFIG.edgeWeight).toBeGreaterThan(0);
  });
});
