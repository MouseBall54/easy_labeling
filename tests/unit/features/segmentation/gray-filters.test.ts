import { describe, expect, it } from "vitest";

import { anisotropicDiffusion, autoLevels, clahe, destripe, flattenBackground, median3x3 } from "../../../../src/features/segmentation/gray-filters.js";
import { getSegmentationPreprocessingKey, normalizeSegmentationPreprocessingConfig, preprocessGray, preprocessSegmentationImage } from "../../../../src/features/segmentation/preprocessing.js";

const W = 96;
const H = 64;

function image(fn: (x: number, y: number) => number): Float32Array {
  const out = new Float32Array(W * H);
  for (let y = 0; y < H; y += 1) for (let x = 0; x < W; x += 1) out[y * W + x] = fn(x, y);
  return out;
}

let seed = 11;
const noise = (amplitude: number): number => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return ((seed / 0x7fffffff) - 0.5) * 2 * amplitude;
};
const step = (x: number): number => (x < 48 ? 60 : 180);

/** Column of the strongest horizontal gradient on row y (sub-pixel edge between x-1 and x). */
function edgeColumn(img: Float32Array, y: number): number {
  let best = -1;
  let at = -1;
  for (let x = 1; x < W; x += 1) {
    const g = Math.abs(img[y * W + x] - img[y * W + x - 1]);
    if (g > best) { best = g; at = x; }
  }
  return at;
}

const std = (values: number[]): number => {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length);
};
const region = (img: Float32Array, x0: number, x1: number, y0: number, y1: number): number[] => {
  const out: number[] = [];
  for (let y = y0; y < y1; y += 1) for (let x = x0; x < x1; x += 1) out.push(img[y * W + x]);
  return out;
};

describe("segmentation gray filters", () => {
  it("median removes isolated impulses without moving a step edge", () => {
    const src = image((x) => step(x));
    src[10 * W + 20] = 255;
    const out = median3x3(src, W, H);
    expect(out[10 * W + 20]).toBe(60);
    expect(edgeColumn(out, 30)).toBe(48);
  });

  it("destripe removes line-to-line offsets but keeps vertical structure", () => {
    const src = image((x, y) => step(x) + (y % 2 ? 25 : 0));
    const out = destripe(src, W, H, "rows");
    const column = region(out, 10, 11, 5, 59);
    expect(std(column)).toBeLessThan(1);
    expect(edgeColumn(out, 30)).toBe(48);
  });

  it("flatten removes a smooth illumination gradient and keeps local contrast", () => {
    const src = image((x, y) => 40 + x * 1.2 + y * 0.5 + (x >= 40 && x < 56 && y >= 24 && y < 40 ? 60 : 0));
    const out = flattenBackground(src, W, H, 40);
    const background = [...region(out, 4, 30, 4, 20), ...region(out, 66, 92, 44, 60)];
    expect(std(background)).toBeLessThan(std([...region(src, 4, 30, 4, 20), ...region(src, 66, 92, 44, 60)]) / 3);
    expect(out[32 * W + 48] - out[32 * W + 30]).toBeGreaterThan(40);
  });

  it("anisotropic diffusion reduces noise in flat regions and keeps the edge where it was", () => {
    const src = image((x) => step(x) + noise(12));
    const out = anisotropicDiffusion(src, W, H, 15, 20);
    expect(std(region(out, 5, 40, 5, 59))).toBeLessThan(std(region(src, 5, 40, 5, 59)) / 2);
    for (const y of [10, 30, 50]) expect(edgeColumn(out, y)).toBe(48);
  });

  it("CLAHE amplifies faint local texture up to the clip limit and keeps brightness order", () => {
    const src = image(() => 100 + Math.round(noise(3)));
    const out = clahe(src, W, H, 4, 4);
    const ratio = std(region(out, 10, 86, 10, 54)) / std(region(src, 10, 86, 10, 54));
    expect(ratio).toBeGreaterThan(2.5);
    expect(ratio).toBeLessThan(6);
    // Same tile, same position class: a brighter input pixel never maps darker.
    const a = 20 * W + 20;
    const b = 20 * W + 21;
    expect(Math.sign(out[b] - out[a])).toBe(src[b] === src[a] ? 0 : Math.sign(src[b] - src[a]));
  });

  it("auto levels stretches the percentile range to 0-255", () => {
    const src = image((x) => 50 + x);
    const out = autoLevels(src, 0);
    expect(Math.min(...out)).toBe(0);
    expect(Math.max(...out)).toBe(255);
  });

  it("keeps every edge in place through the whole SEM pipeline", () => {
    const src = image((x, y) => step(x) + 0.4 * y + (y % 3 ? 0 : 15) + noise(10));
    const config = { mode: "original" as const, median: true, destripe: "rows" as const, flattenSigma: 60, diffusionIterations: 10, diffusionKappa: 25, claheClip: 2, claheTiles: 4, levelsClip: 1 };
    const out = preprocessGray(src, W, H, config);
    for (const y of [8, 24, 40, 56]) expect(edgeColumn(out, y)).toBe(48);
  });

  it("only changes the cache key and colour handling when a filter is on", () => {
    const neutral = normalizeSegmentationPreprocessingConfig({});
    expect(getSegmentationPreprocessingKey(neutral)).toBe("edge-blend:2:0.650");
    expect(getSegmentationPreprocessingKey({ ...neutral, claheClip: 2 })).toBe("edge-blend:2:0.650:f0,off,0,0x20,2/8,0");
    const colour = new Uint8ClampedArray([200, 50, 100, 255]);
    expect([...preprocessSegmentationImage({ width: 1, height: 1, rgba: colour }, { mode: "original" })]).toEqual([200, 50, 100, 255]);
    const filtered = preprocessSegmentationImage({ width: 1, height: 1, rgba: colour }, { mode: "original", median: true });
    expect(filtered[0]).toBe(filtered[1]);
  });
});
