import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { normalizeRefineParams, refineBoxes, type RefineBoxInput } from "../../../src/domain/refine/edge-refine.js";
import { normalizeSegmentationPreprocessingConfig, preprocessGray, type SegmentationPreprocessingConfig } from "../../../src/features/segmentation/preprocessing.js";

// The desktop app runs Rust ports of these algorithms (src-tauri/compute). Build the CLI with
// `cargo build --release -p easy-labeling-compute` (in src-tauri) to run these checks.
const cli = [process.env.EASY_LABELING_COMPUTE_CLI ?? "", "src-tauri/target/release/compute-cli.exe", "src-tauri/target/release/compute-cli"].filter(Boolean)
  .map((file) => path.resolve(file))
  .find((file) => existsSync(file));
const scratch = mkdtempSync(path.join(os.tmpdir(), "compute-parity-"));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

function runCli(op: string, request: unknown, input: Uint8Array): Buffer {
  const files = ["request.json", "input.bin", "output.bin"].map((name) => path.join(scratch, name));
  writeFileSync(files[0], JSON.stringify(request));
  writeFileSync(files[1], input);
  execFileSync(cli!, [op, ...files], { stdio: ["ignore", "ignore", "ignore"] });
  return readFileSync(files[2]);
}

function seeded(seed: number): () => number {
  let state = seed;
  return () => {
    state = (Math.imul(state, 1103515245) + 12345) >>> 0;
    return state / 4294967296;
  };
}

/** Bright rounded blocks on a sloped, striped, noisy background with a few impulses. */
function syntheticImage(width: number, height: number, seed: number): Float32Array {
  const random = seeded(seed);
  const image = new Float32Array(width * height);
  for (let y = 0; y < height; y += 1) {
    const stripe = (random() - 0.5) * 12;
    for (let x = 0; x < width; x += 1) {
      const block = (x % 40) > 8 && (x % 40) < 32 && (y % 50) > 10 && (y % 50) < 42 ? 120 : 0;
      image[y * width + x] = 40 + x * 0.2 + y * 0.1 + stripe + block + (random() - 0.5) * 30 + (random() < 0.002 ? 200 : 0);
    }
  }
  return image;
}

describe.skipIf(!cli)("Rust compute parity with the JS algorithms", () => {
  const width = 203;
  const height = 151;
  const image = syntheticImage(width, height, 7);
  const configs: Partial<SegmentationPreprocessingConfig>[] = [
    { mode: "original", median: true },
    { mode: "original", destripe: "rows" },
    { mode: "original", destripe: "columns" },
    { mode: "original", flattenSigma: 40 },
    { mode: "original", flattenSigma: 7 },
    { mode: "original", diffusionIterations: 6, diffusionKappa: 15 },
    { mode: "original", claheClip: 2.5, claheTiles: 6 },
    { mode: "original", levelsClip: 1.5 },
    { mode: "original", contrast: 1.6, gamma: 0.7 },
    { mode: "edge", blurStrength: 3 },
    { mode: "edge-blend" },
    { mode: "edge-blend", edgeWeight: 0.3, median: true, destripe: "rows", flattenSigma: 60, diffusionIterations: 3, claheClip: 3, levelsClip: 0.5, contrast: 1.2, gamma: 1.3 }
  ];

  it.each(configs.map((config) => [JSON.stringify(config), config] as const))("preprocessGray %s", (_label, requested) => {
    const config = normalizeSegmentationPreprocessingConfig(requested);
    const expected = preprocessGray(Float32Array.from(image), width, height, config);
    const output = runCli("preprocess", { width, height, config }, new Uint8Array(image.buffer.slice(0)));
    const actual = new Float32Array(output.buffer, output.byteOffset, output.byteLength / 4);
    expect(actual.length).toBe(expected.length);
    let worst = 0;
    for (let i = 0; i < expected.length; i += 1) worst = Math.max(worst, Math.abs(actual[i] - expected[i]));
    expect(worst).toBeLessThanOrEqual(1e-3);
  });

  const gray = Uint8Array.from(image, (value) => Math.max(0, Math.min(255, Math.round(value))));
  const random = seeded(11);
  const boxes: RefineBoxInput[] = [];
  for (let row = 0; row < 3; row += 1) {
    for (let column = 0; column < 5; column += 1) {
      const jitter = () => (random() - 0.5) * 6;
      const x0 = column * 40 + 9 + jitter();
      const y0 = row * 50 + 11 + jitter();
      boxes.push({ id: `b${row}-${column}`, classId: column % 2 ? "1" : "0", x0, y0, x1: x0 + 22 + jitter(), y1: y0 + 30 + jitter() });
    }
  }
  const paramVariants: Record<string, unknown>[] = [
    {},
    { crit: "flank", polarity: "brightInside", comb: "median" },
    { crit: "peak", sigma: 0, segments: 3 },
    { crit: "thr", contextRing: 0, gradStep: 4 },
    { crit: "grad", scanSpan: "boxOutside", extendStart: 6, extendEnd: 9, avoidNeighbors: false, iterations: 4 },
    { scanSpan: "outside", extendEnd: 5, sides: { L: "off", R: "flank", T: "inherit", B: "thr" }, sideRules: { R: { rangeOut: 4, polarity: "darkInside" }, T: { sigma: 2.5, inset: 0.3 } } },
    { peerTolerance: 0.5, reviewBelow: 0.8, areaGrowLimit: 0.05, areaShrinkLimit: 0.05 },
    // Extremes: inward search through the centre, wide outward/ring/extensions, many segments and iterations.
    { rangeIn: 2000, rangeOut: 300, contextRing: 200, sigma: 12, gradStep: 40, segments: 100, iterations: 6, inset: 0.49 },
    { scanSpan: "boxOutside", extendStart: 4000, extendEnd: 4000, avoidNeighbors: false, sideRules: { L: { rangeIn: 2000, polarity: "darkInside" }, B: { rangeOut: 2000, segments: 1 } } },
    { scanSpan: "boxOutside", extendStart: 8, extendEnd: 12, partMode: "strongest" },
    { nearWeight: false, rangeIn: 14, rangeOut: 14 },
    { crit: "peak", sideRules: { L: { nearWeight: false, rangeOut: 20 }, B: { nearWeight: false } } },
    { crit: "thr", sideRules: { T: { partMode: "strongest", scanSpan: "outside", extendStart: 6, extendEnd: 9 }, R: { partMode: "strongest", scanSpan: "boxOutside", extendEnd: 5 } } }
  ];

  it.each(paramVariants.map((params) => [JSON.stringify(params), params] as const))("refineBoxes %s", (_label, raw) => {
    const paramsByClass = { 0: normalizeRefineParams(raw), 1: normalizeRefineParams({ ...raw, crit: "thr", rangeIn: 5 }) };
    const expected = refineBoxes({ gray, width, height }, boxes, paramsByClass);
    const actual = JSON.parse(runCli("refine", { width, height, boxes, paramsByClass, neighbours: boxes }, gray).toString("utf8"));
    expect(actual).toHaveLength(expected.length);
    expected.forEach((result, index) => {
      const other = actual[index];
      expect(other.id).toBe(result.id);
      expect(other.weakSides).toEqual(result.weakSides);
      expect(other.flagged).toBe(result.flagged);
      expect(other.areaFlagged).toBe(result.areaFlagged);
      expect(Object.keys(other.sideConf)).toEqual(Object.keys(result.sideConf));
      for (const key of ["x0", "y0", "x1", "y1"] as const) expect(other.box[key]).toBeCloseTo(result.box[key], 9);
      for (const side of Object.keys(result.sideConf) as (keyof typeof result.sideConf)[]) expect(other.sideConf[side]).toBeCloseTo(result.sideConf[side]!, 9);
      expect(other.conf).toBeCloseTo(result.conf, 9);
      expect(other.areaChange).toBeCloseTo(result.areaChange, 9);
    });
  });
});
