// TS timings of the algorithms el-core ports, on the same inputs as crates/el-bench/benches/core.rs.
// Needs `npm run build` and `node scripts/migration/gen-golden.mjs --bench`.
// Usage: node scripts/bench/core.mjs [--runs 30] [--filter refine|preprocess]
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";
import { preprocessGray } from "../../dist/features/segmentation/preprocessing.js";
import { refineBoxes } from "../../dist/domain/refine/edge-refine.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const generated = path.join(root, "crates/el-bench/fixtures/generated");
const read = (file) => readFileSync(path.join(generated, file));
const readJson = (file) => JSON.parse(read(file).toString("utf8"));
const option = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index > 0 ? process.argv[index + 1] : fallback;
};
const runs = Number(option("--runs", 30));
const filter = option("--filter", "");

function time(label, work) {
  for (let i = 0; i < 3; i += 1) work(); // warm-up (JIT)
  const samples = [];
  for (let i = 0; i < runs; i += 1) {
    const started = performance.now();
    work();
    samples.push(performance.now() - started);
  }
  samples.sort((a, b) => a - b);
  const median = samples[Math.floor(samples.length / 2)];
  const p95 = samples[Math.min(samples.length - 1, Math.ceil(samples.length * 0.95) - 1)];
  console.log(`${label.padEnd(36)} median ${median.toFixed(1).padStart(8)} ms   p95 ${p95.toFixed(1).padStart(8)} ms   (n=${runs})`);
}

const manifest = readJson("manifest.json");
const params = readJson("refine-params.json");
const configs = readJson("preprocess-configs.json");
const images = new Map();
const grayOf = (file) => {
  if (!images.has(file)) images.set(file, new Uint8Array(read(file)));
  return images.get(file);
};

if (filter !== "preprocess") {
  for (const input of manifest) {
    const gray = grayOf(input.image);
    const boxes = readJson(input.boxes);
    time(`refine/${input.width}x${input.height}-${input.count}`, () => refineBoxes({ gray, width: input.width, height: input.height }, boxes, params, boxes));
  }
}
if (filter !== "refine") {
  for (const input of new Map(manifest.map((entry) => [entry.image, entry])).values()) {
    const gray = grayOf(input.image);
    for (const name of Object.keys(configs).sort()) {
      time(`preprocess/${input.width}x${input.height}-${name}`, () => preprocessGray(Float32Array.from(gray), input.width, input.height, configs[name]));
    }
  }
}
