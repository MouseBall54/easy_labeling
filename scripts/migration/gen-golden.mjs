// Writes golden fixtures for the Rust core from the TS implementations (the reference).
// Run after `npm run build`: node scripts/migration/gen-golden.mjs
// Small fixtures go to crates/el-bench/fixtures/<module>/ (committed); --bench also writes the
// SEM-sized benchmark inputs to crates/el-bench/fixtures/generated/ (git-ignored).
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeSegmentationPreprocessingConfig, preprocessGray } from "../../dist/features/segmentation/preprocessing.js";
import { normalizeRefineParams, refineBoxes } from "../../dist/domain/refine/edge-refine.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const fixtures = path.join(root, "crates/el-bench/fixtures");

export function seeded(seed) {
  let state = seed;
  return () => {
    state = (Math.imul(state, 1103515245) + 12345) >>> 0;
    return state / 4294967296;
  };
}

/** Bright blocks (cellW x cellH grid) on a sloped, striped, noisy background with a few impulses. */
export function syntheticImage(width, height, seed, cellW = 40, cellH = 50) {
  const random = seeded(seed);
  const image = new Float32Array(width * height);
  const [bx0, bx1, by0, by1] = [cellW * 0.2, cellW * 0.8, cellH * 0.2, cellH * 0.84];
  for (let y = 0; y < height; y += 1) {
    const stripe = (random() - 0.5) * 12;
    for (let x = 0; x < width; x += 1) {
      const block = x % cellW > bx0 && x % cellW < bx1 && y % cellH > by0 && y % cellH < by1 ? 120 : 0;
      image[y * width + x] = 40 + (x * 0.2 * 200) / width + (y * 0.1 * 150) / height + stripe + block + (random() - 0.5) * 30 + (random() < 0.002 ? 200 : 0);
    }
  }
  return image;
}

export const toGray = (image) => Uint8Array.from(image, (value) => Math.max(0, Math.min(255, Math.round(value))));

/** One jittered box per grid cell, classes cycling through `classes`. */
export function gridBoxes(width, height, cellW, cellH, seed, classes) {
  const random = seeded(seed);
  const jitter = () => (random() - 0.5) * cellW * 0.12;
  const boxes = [];
  for (let row = 0; row < Math.floor(height / cellH); row += 1) {
    for (let column = 0; column < Math.floor(width / cellW); column += 1) {
      const x0 = column * cellW + cellW * 0.22 + jitter();
      const y0 = row * cellH + cellH * 0.22 + jitter();
      boxes.push({ id: `b${row}-${column}`, classId: classes[(row + column) % classes.length], x0, y0, x1: x0 + cellW * 0.55 + jitter(), y1: y0 + cellH * 0.6 + jitter() });
    }
  }
  return boxes;
}

const bytesOf = (typed) => Buffer.from(typed.buffer, typed.byteOffset, typed.byteLength);

function writePreprocess() {
  const dir = path.join(fixtures, "preprocess");
  mkdirSync(dir, { recursive: true });
  const configs = {
    "median": { mode: "original", median: true },
    "destripe-rows": { mode: "original", destripe: "rows" },
    "destripe-columns": { mode: "original", destripe: "columns" },
    "flatten-40": { mode: "original", flattenSigma: 40 },
    "flatten-7": { mode: "original", flattenSigma: 7 },
    "diffusion": { mode: "original", diffusionIterations: 6, diffusionKappa: 15 },
    "clahe": { mode: "original", claheClip: 2.5, claheTiles: 6 },
    "levels": { mode: "original", levelsClip: 1.5 },
    "contrast-gamma": { mode: "original", contrast: 1.6, gamma: 0.7 },
    "edge": { mode: "edge", blurStrength: 3 },
    "edge-blend": { mode: "edge-blend" },
    "everything": { mode: "edge-blend", edgeWeight: 0.3, median: true, destripe: "rows", flattenSigma: 60, diffusionIterations: 3, claheClip: 3, levelsClip: 0.5, contrast: 1.2, gamma: 1.3 },
    "neutral": {}
  };
  // Odd sizes plus single-row/column/pixel images reach the border clamps of every filter.
  const images = [[96, 72], [1, 23], [23, 1], [1, 1]];
  const cases = [];
  for (const [width, height] of images) {
    const input = syntheticImage(width, height, width * 1000 + height, 16, 12);
    const inputFile = `input-${width}x${height}.f32`;
    writeFileSync(path.join(dir, inputFile), bytesOf(input));
    for (const [name, requested] of Object.entries(configs)) {
      if (width * height < 100 && name !== "everything" && name !== "neutral") continue;
      const config = normalizeSegmentationPreprocessingConfig(requested);
      const output = preprocessGray(Float32Array.from(input), width, height, config);
      const outputFile = `${name}-${width}x${height}.f32`;
      writeFileSync(path.join(dir, outputFile), bytesOf(output));
      cases.push({ name: `${name}-${width}x${height}`, width, height, input: inputFile, config, output: outputFile });
    }
  }
  writeFileSync(path.join(dir, "cases.json"), JSON.stringify(cases, null, 1));
  return cases.length;
}

function writeRefine() {
  const dir = path.join(fixtures, "refine");
  mkdirSync(dir, { recursive: true });
  const variants = {
    "default": {},
    "flank-median": { crit: "flank", polarity: "brightInside", comb: "median" },
    "peak-segments": { crit: "peak", sigma: 0, segments: 3 },
    "thr-step": { crit: "thr", contextRing: 0, gradStep: 4 },
    "box-outside": { crit: "grad", scanSpan: "boxOutside", extendStart: 6, extendEnd: 9, avoidNeighbors: false, iterations: 4 },
    "side-rules": { scanSpan: "outside", extendEnd: 5, sides: { L: "off", R: "flank", T: "inherit", B: "thr" }, sideRules: { R: { rangeOut: 4, polarity: "darkInside" }, T: { sigma: 2.5, inset: 0.3 } } },
    "review-limits": { peerTolerance: 0.5, reviewBelow: 0.8, areaGrowLimit: 0.05, areaShrinkLimit: 0.05 },
    "extremes": { rangeIn: 2000, rangeOut: 300, contextRing: 200, sigma: 12, gradStep: 40, segments: 100, iterations: 6, inset: 0.49 },
    "huge-extend": { scanSpan: "boxOutside", extendStart: 4000, extendEnd: 4000, avoidNeighbors: false, sideRules: { L: { rangeIn: 2000, polarity: "darkInside" }, B: { rangeOut: 2000, segments: 1 } } },
    "strongest": { scanSpan: "boxOutside", extendStart: 8, extendEnd: 12, partMode: "strongest" },
    "no-near-weight": { nearWeight: false, rangeIn: 14, rangeOut: 14 },
    "peak-side-near": { crit: "peak", sideRules: { L: { nearWeight: false, rangeOut: 20 }, B: { nearWeight: false } } },
    "thr-strongest": { crit: "thr", sideRules: { T: { partMode: "strongest", scanSpan: "outside", extendStart: 6, extendEnd: 9 }, R: { partMode: "strongest", scanSpan: "boxOutside", extendEnd: 5 } } }
  };
  const paramsFor = (raw) => ({ 0: normalizeRefineParams(raw), 1: normalizeRefineParams({ ...raw, crit: "thr", rangeIn: 5 }) });
  const cases = [];
  const addCase = (name, image, boxes, raw, neighbours = boxes) => {
    const paramsByClass = paramsFor(raw);
    const expected = refineBoxes({ gray: image.gray, width: image.width, height: image.height }, boxes, paramsByClass, neighbours);
    // neighbours is omitted when it is the box list itself (the common case), to keep the fixture small.
    cases.push({ name, width: image.width, height: image.height, image: image.file, boxes, ...(neighbours === boxes ? {} : { neighbours }), paramsByClass, expected });
  };
  const makeImage = (width, height, seed, cellW, cellH) => {
    const gray = toGray(syntheticImage(width, height, seed, cellW, cellH));
    const file = `gray-${width}x${height}.u8`;
    writeFileSync(path.join(dir, file), bytesOf(gray));
    return { gray, width, height, file };
  };

  // Every parameter variant on 15 boxes (the existing parity-test layout).
  const small = makeImage(203, 151, 7, 40, 50);
  const smallBoxes = gridBoxes(203, 151, 40, 50, 11, ["0", "1"]);
  for (const [name, raw] of Object.entries(variants)) addCase(`small-${name}`, small, smallBoxes, raw);
  // Edge cases: no boxes, boxes outside / across the border / degenerate, a class without params.
  addCase("small-empty", small, [], {});
  addCase("small-edges", small, [
    { id: "across-left", classId: "0", x0: -6, y0: 20, x1: 14, y1: 44 },
    { id: "across-bottom-right", classId: "1", x0: 190, y0: 140, x1: 215, y1: 160 },
    { id: "outside", classId: "0", x0: 300, y0: 300, x1: 320, y1: 330 },
    { id: "zero-width", classId: "0", x0: 60, y0: 60, x1: 60, y1: 80 },
    { id: "one-pixel", classId: "1", x0: 100.4, y0: 70.6, x1: 101.4, y1: 71.6 },
    { id: "no-params-class", classId: "7", x0: 49, y0: 61, x1: 71, y1: 91 }
  ], {});
  // 500+ boxes on a dense grid (576 boxes, three classes; class 2 has no params).
  const dense = makeImage(384, 288, 21, 16, 12);
  const denseBoxes = gridBoxes(384, 288, 16, 12, 23, ["0", "1", "2"]);
  addCase("dense-576-default", dense, denseBoxes, {});
  addCase("dense-576-box-outside", dense, denseBoxes, variants["box-outside"]);
  writeFileSync(path.join(dir, "cases.json"), JSON.stringify(cases));
  return cases.length;
}

/** SEM-sized inputs for the benches; not committed (tens of MB). */
function writeBenchInputs() {
  const dir = path.join(fixtures, "generated");
  mkdirSync(dir, { recursive: true });
  const manifest = [];
  for (const [width, height] of [[2048, 1536], [4096, 3072]]) {
    const gray = toGray(syntheticImage(width, height, 5, 64, 48));
    const file = `sem-${width}x${height}.u8`;
    writeFileSync(path.join(dir, file), bytesOf(gray));
    for (const count of [500, 1000]) {
      // Cells sized so the grid holds at least `count` boxes; keep the first `count`.
      const columns = Math.ceil(Math.sqrt((count * width) / height));
      const cellW = Math.floor(width / columns);
      const cellH = Math.floor(height / Math.ceil(count / columns));
      const boxes = gridBoxes(width, height, cellW, cellH, 9, ["0", "1"]).slice(0, count);
      const boxesFile = `boxes-${width}x${height}-${count}.json`;
      writeFileSync(path.join(dir, boxesFile), JSON.stringify(boxes));
      manifest.push({ width, height, image: file, boxes: boxesFile, count: boxes.length });
    }
  }
  writeFileSync(path.join(dir, "manifest.json"), JSON.stringify(manifest, null, 1));
  // Normalized settings shared by the Rust and TS benches: default refine params for classes 0/1, and the
  // Processed-view configs (a typical one and the heavy one from the audit's preprocess-view scenario).
  writeFileSync(path.join(dir, "refine-params.json"), JSON.stringify({ 0: normalizeRefineParams({}), 1: normalizeRefineParams({ crit: "thr" }) }));
  writeFileSync(path.join(dir, "preprocess-configs.json"), JSON.stringify({
    typical: normalizeSegmentationPreprocessingConfig({ mode: "original", median: true, claheClip: 2 }),
    heavy: normalizeSegmentationPreprocessingConfig({ mode: "original", flattenSigma: 200, diffusionIterations: 20 })
  }));
  return manifest.length;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(`preprocess cases: ${writePreprocess()}`);
  console.log(`refine cases: ${writeRefine()}`);
  if (process.argv.includes("--bench")) console.log(`bench inputs: ${writeBenchInputs()}`);
}
