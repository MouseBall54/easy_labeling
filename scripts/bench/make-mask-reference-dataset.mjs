// A scored segmentation benchmark from the bundled sample: the two SEM images whose masks follow the structures
// (sample_metal_pattern, sample_metal_cross_section; class 10) with
//   mask_gt/  the sample masks, as the reference (ground truth) compare_masks scores against;
//   mask/     the same masks damaged repeatably: each region grown or shrunk by up to maxShift px, some regions deleted,
//             some given the wrong class (10 -> 11), some stray blobs added;
//   label/    the sample's Detection boxes of the same structures (for boxes_to_masks) and classes.yaml.
// An agent repairs mask/ with the app's tools; compare_masks { reference: "mask_gt" } is the score.
// Reads the compiled codec, so run `npm run build` first.
//
//   node scripts/bench/make-mask-reference-dataset.mjs <out folder> [--seed 1] [--max-shift 3] [--drop 0.05] [--wrong-class 0.03] [--extra 0.02]
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const { decodeSegmentationMaskPng, encodeSegmentationMaskPng } = await import(pathToFileURL(path.join(root, "dist/domain/annotations/segmentation-codec.js")).href);
const { maskRegions } = await import(pathToFileURL(path.join(root, "dist/domain/annotations/mask-regions.js")).href);
const sample = path.join(root, "assets/sample");
const images = ["sample_metal_pattern.png", "sample_metal_cross_section.png"];
const args = process.argv.slice(2);
const out = args.find((arg, index) => !arg.startsWith("--") && !args[index - 1]?.startsWith("--"));
if (!out) throw new Error("Usage: node scripts/bench/make-mask-reference-dataset.mjs <out folder> [--seed 1] [--max-shift 3] [--drop 0.05] [--wrong-class 0.03] [--extra 0.02]");
const option = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? Number(args[index + 1]) : fallback;
};
const settings = { seed: option("seed", 1), maxShift: option("max-shift", 3), drop: option("drop", 0.05), wrongClass: option("wrong-class", 0.03), extra: option("extra", 0.02) };

// mulberry32: the same seed gives the same damage.
let state = settings.seed >>> 0;
const random = () => {
  state = (state + 0x6d2b79f5) >>> 0;
  let t = state;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

await mkdir(path.join(out, "mask_gt"), { recursive: true });
await mkdir(path.join(out, "mask"), { recursive: true });
await mkdir(path.join(out, "label"), { recursive: true });
const totals = { regions: 0, dropped: 0, wrongClass: 0, grown: 0, shrunk: 0, extra: 0 };
for (const image of images) {
  const base = image.replace(/\.png$/, "");
  await copyFile(path.join(sample, image), path.join(out, image));
  await copyFile(path.join(sample, "label", `${base}.txt`), path.join(out, "label", `${base}.txt`));
  const bytes = await readFile(path.join(sample, "mask", `${base}.png`));
  await writeFile(path.join(out, "mask_gt", `${base}.png`), bytes);
  const { width, height, mask: truth } = await decodeSegmentationMaskPng(bytes);
  const { regions, pixels } = maskRegions(truth, width, height, { withPixels: true });
  const damaged = new Uint16Array(width * height);
  // Each region on its own, in a fixed order, so a seed always gives the same mask.
  regions.forEach((region, index) => {
    const id = index + 1;
    totals.regions += 1;
    if (random() < settings.drop) { totals.dropped += 1; return; }
    const classId = random() < settings.wrongClass ? (totals.wrongClass += 1, Number(region.classId) + 1) : Number(region.classId);
    const shift = Math.round((random() * 2 - 1) * settings.maxShift);
    if (shift > 0) totals.grown += 1;
    if (shift < 0) totals.shrunk += 1;
    const r = Math.abs(shift);
    const x0 = Math.max(0, region.x0 - r), y0 = Math.max(0, region.y0 - r), x1 = Math.min(width, region.x1 + r), y1 = Math.min(height, region.y1 + r);
    for (let y = y0; y < y1; y += 1) {
      for (let x = x0; x < x1; x += 1) {
        // Grow: any region pixel within r (square). Shrink: every pixel within r is the region's.
        let near = false;
        let all = true;
        for (let dy = -r; dy <= r && (shift >= 0 ? !near : all); dy += 1) {
          for (let dx = -r; dx <= r; dx += 1) {
            const xx = x + dx, yy = y + dy;
            const inside = xx >= 0 && yy >= 0 && xx < width && yy < height && pixels[yy * width + xx] === id;
            if (inside) near = true; else all = false;
          }
        }
        if (shift >= 0 ? near : all) damaged[y * width + x] = classId;
      }
    }
  });
  // Stray blobs (discs of radius 2..5) on the background.
  const blobs = Math.round(regions.length * settings.extra);
  for (let blob = 0; blob < blobs; blob += 1) {
    const cx = Math.floor(random() * width), cy = Math.floor(random() * height), r = 2 + Math.floor(random() * 4);
    totals.extra += 1;
    for (let y = Math.max(0, cy - r); y < Math.min(height, cy + r + 1); y += 1) {
      for (let x = Math.max(0, cx - r); x < Math.min(width, cx + r + 1); x += 1) {
        if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r && !damaged[y * width + x]) damaged[y * width + x] = 10;
      }
    }
  }
  await writeFile(path.join(out, "mask", `${base}.png`), await encodeSegmentationMaskPng({ width, height, mask: damaged }));
}
await copyFile(path.join(sample, "label", "classes.yaml"), path.join(out, "label", "classes.yaml"));
console.log(JSON.stringify({ out: path.resolve(out), settings, ...totals }));
