import { describe, expect, it } from "vitest";
import { EDGE_SAM_INPUT_SIZE, getEdgeSamResize, preprocessEdgeSamImage, restoreEdgeSamMask, toEdgeSamPrompt } from "../../../../src/features/edgesam/preprocess.js";

describe("EdgeSAM preprocessing", () => {
  it("maps canvas points to EdgeSAM x-y coordinates after resize", () => {
    const resize = getEdgeSamResize(2048, 1024);
    const prompt = toEdgeSamPrompt({
      resize,
      points: [{ x: 1000, y: 500, label: "positive" }],
      box: { left: 0, top: 0, right: 2047, bottom: 1023 }
    });

    expect(resize.scale).toBe(0.5);
    expect(prompt.coordinates.slice(0, 6)).toEqual(new Float32Array([500, 250, 0, 0, 1023, 511.5]));
    expect(prompt.labels).toEqual(new Float32Array([1, 2, 3, -1, -1]));
  });

  it("restores a decoder mask to the original image dimensions", () => {
    const logits = new Float32Array(256 * 256).fill(-1);
    for (const y of [65, 66]) {
      for (const x of [129, 130]) logits[y * 256 + x] = 2;
    }
    const mask = restoreEdgeSamMask({ logits, resize: getEdgeSamResize(64, 32) });

    expect(mask).toHaveLength(64 * 32);
    expect(mask.some((value) => value === 1)).toBe(true);
    expect(mask[16 * 64 + 32]).toBe(1);
  });

  it("keeps EdgeSAM input coordinates inside the padded input", () => {
    const resize = getEdgeSamResize(4096, 1024);
    const prompt = toEdgeSamPrompt({
      resize,
      points: [{ x: 4096, y: 1024, label: "negative" }],
      box: null
    });

    expect(prompt.coordinates[0]).toBeLessThan(EDGE_SAM_INPUT_SIZE);
    expect(prompt.coordinates[1]).toBeLessThan(EDGE_SAM_INPUT_SIZE);
  });

  it("converts a grayscale source to three normalized channels without changing its source pixels", () => {
    const rgba = new Uint8ClampedArray([80, 80, 80, 255]);
    const before = new Uint8ClampedArray(rgba);
    const result = preprocessEdgeSamImage({ cacheKey: "gray", width: 1, height: 1, rgba });
    const plane = EDGE_SAM_INPUT_SIZE * EDGE_SAM_INPUT_SIZE;

    expect(rgba).toEqual(before);
    expect(result.tensor[0]).toBeCloseTo((80 - 123.675) / 58.395, 6);
    expect(result.tensor[plane]).toBeCloseTo((80 - 116.28) / 57.12, 6);
    expect(result.tensor[plane * 2]).toBeCloseTo((80 - 103.53) / 57.375, 6);
  });
});
