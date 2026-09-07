import { describe, expect, it } from "vitest";
import { createSlicoSuperpixels, createSuperpixelCache, growSuperpixelRegion } from "../../../../src/features/segmentation/superpixels.js";

function createGradient(width: number, height: number): Uint8ClampedArray {
  const rgba = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = ((y * width) + x) * 4;
      rgba[index] = x < width / 2 ? 30 : 220;
      rgba[index + 1] = rgba[index];
      rgba[index + 2] = rgba[index];
      rgba[index + 3] = 255;
    }
  }
  return rgba;
}

describe("SLICO superpixels", () => {
  it("uses smaller regions for a finer requested size", () => {
    const input = { width: 32, height: 32, rgba: createGradient(32, 32) };
    const fine = createSlicoSuperpixels(input, 8);
    const coarse = createSlicoSuperpixels(input, 16);
    expect(fine.regions.length).toBeGreaterThan(coarse.regions.length);
    expect(fine.boundaries.some((value) => value === 1)).toBe(true);
  });

  it("returns a cached result until the caller clears it", () => {
    const input = { width: 16, height: 16, rgba: createGradient(16, 16) };
    const cache = createSuperpixelCache();
    const first = cache.getOrCreate(input, 8);
    expect(first).toBe(cache.getOrCreate(input, 8));
    cache.clear();
    expect(cache.getOrCreate(input, 8)).not.toBe(first);
  });

  it("uses preprocessing settings as part of the cache key", () => {
    const input = { cacheKey: "scene-a", width: 16, height: 16, rgba: createGradient(16, 16) };
    const cache = createSuperpixelCache();
    const unblurred = cache.getOrCreate(input, 8, { blur: "off" });
    expect(cache.getOrCreate(input, 8, { blur: "off" })).toBe(unblurred);
    expect(cache.getOrCreate(input, 8, { blur: "high" })).not.toBe(unblurred);
  });

  it("uses edge strength as a region-grow penalty rather than an absolute boundary", () => {
    const result = {
      width: 2, height: 1, regionSize: 1, labels: Int32Array.from([0, 1]), boundaries: Uint8Array.from([1, 1]),
      regions: [
        { id: 0, pixelCount: 1, meanIntensity: 100, meanEdgeStrength: 0.2, neighbors: [1] },
        { id: 1, pixelCount: 1, meanIntensity: 105, meanEdgeStrength: 0.2, neighbors: [0] }
      ]
    };
    expect(growSuperpixelRegion({ result, seedId: 0, similarity: 0.1, edgeStop: 0.2 })).toEqual([0, 1]);
    expect(growSuperpixelRegion({ result, seedId: 0, similarity: 0.1, edgeStop: 1 })).toEqual([0]);
  });
});
