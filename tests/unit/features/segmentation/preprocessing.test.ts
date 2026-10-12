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
    expect(config).toEqual({ ...DEFAULT_SEGMENTATION_PREPROCESSING_CONFIG, mode: "edge-blend", blurStrength: 4, edgeWeight: 1 });
    expect(getSegmentationPreprocessingKey(config)).toBe("edge-blend:4:1.000");
    expect(getSegmentationPreprocessingKey({ ...config, contrast: 1.5, gamma: 0.8 })).toBe("edge-blend:4:1.000:c1.50:g0.80");
    expect(DEFAULT_SEGMENTATION_PREPROCESSING_CONFIG.edgeWeight).toBeGreaterThan(0);
  });

  it("applies contrast and gamma before edge processing and keeps colour in Original mode", () => {
    const grey = (value: number) => new Uint8ClampedArray([value, value, value, 255]);
    const one = (rgba: Uint8ClampedArray, config: object) => preprocessSegmentationImage({ width: 1, height: 1, rgba }, { mode: "original", ...config })[0];
    expect(one(grey(100), { contrast: 2 })).toBe(73); // (100 - 127.5) * 2 + 127.5
    expect(one(grey(64), { gamma: 2 })).toBe(128); // 255 * (64 / 255) ^ 0.5
    expect(one(grey(64), { gamma: 1, contrast: 1 })).toBe(64);
    const colour = preprocessSegmentationImage({ width: 1, height: 1, rgba: new Uint8ClampedArray([200, 50, 100, 255]) }, { mode: "original", contrast: 1.5 });
    expect([...colour]).toEqual([236, 11, 86, 255]);
    expect(normalizeSegmentationPreprocessingConfig({ contrast: 9, gamma: 0 })).toMatchObject({ contrast: 3, gamma: 0.2 });
    // Tone runs before edge processing: lower contrast lifts the dark side of the step in Edge Blend.
    const source = createStepImage();
    const flat = preprocessSegmentationImage({ width: 4, height: 4, rgba: source }, { mode: "edge-blend", blurStrength: 0, edgeWeight: 0.5, contrast: 0.5 });
    const plain = preprocessSegmentationImage({ width: 4, height: 4, rgba: source }, { mode: "edge-blend", blurStrength: 0, edgeWeight: 0.5 });
    expect(flat[0]).toBeGreaterThan(plain[0]);
  });
});
