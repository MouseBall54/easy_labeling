// A scored agent benchmark from the bundled sample: the two SEM images whose labels are edge-tight
// (sample_metal_pattern 918 boxes, sample_metal_cross_section 285) with
//   label_gt/  the sample labels, as the reference (ground truth) compare_labels scores against;
//   label/     the same labels damaged repeatably: every edge moved up to ±maxShift px, some boxes deleted,
//              some given the wrong class, some duplicated half a box away.
// An agent repairs label/ with the app's tools; compare_labels { reference: "label_gt" } is the score.
//
//   node scripts/bench/make-reference-dataset.mjs <out folder> [--seed 1] [--max-shift 3] [--drop 0.05] [--wrong-class 0.03] [--extra 0.02]
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const sample = fileURLToPath(new URL("../../assets/sample/", import.meta.url));
const images = ["sample_metal_pattern.png", "sample_metal_cross_section.png"];
const args = process.argv.slice(2);
const out = args.find((arg, index) => !arg.startsWith("--") && !args[index - 1]?.startsWith("--"));
if (!out) throw new Error("Usage: node scripts/bench/make-reference-dataset.mjs <out folder> [--seed 1] [--max-shift 3] [--drop 0.05] [--wrong-class 0.03] [--extra 0.02]");
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
const shift = () => Math.round((random() * 2 - 1) * settings.maxShift);
const pngSize = (bytes) => ({ width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) });
const row = (classId, box, { width, height }) =>
  `${classId} ${((box.x0 + box.x1) / 2 / width).toFixed(6)} ${((box.y0 + box.y1) / 2 / height).toFixed(6)} ${((box.x1 - box.x0) / width).toFixed(6)} ${((box.y1 - box.y0) / height).toFixed(6)}`;

await mkdir(path.join(out, "label_gt"), { recursive: true });
await mkdir(path.join(out, "label"), { recursive: true });
const totals = { boxes: 0, dropped: 0, wrongClass: 0, extra: 0 };
for (const image of images) {
  const base = image.replace(/\.png$/, "");
  const bytes = await readFile(path.join(sample, image));
  const size = pngSize(bytes);
  await copyFile(path.join(sample, image), path.join(out, image));
  const text = await readFile(path.join(sample, "label", `${base}.txt`), "utf8");
  await writeFile(path.join(out, "label_gt", `${base}.txt`), text);
  const damaged = [];
  for (const line of text.split(/\r?\n/).filter((entry) => entry.trim())) {
    const [classId, cx, cy, w, h] = line.trim().split(/\s+/);
    const box = { x0: (cx - w / 2) * size.width, y0: (cy - h / 2) * size.height, x1: (+cx + w / 2) * size.width, y1: (+cy + h / 2) * size.height };
    totals.boxes += 1;
    if (random() < settings.drop) { totals.dropped += 1; continue; }
    const moved = { x0: box.x0 + shift(), y0: box.y0 + shift(), x1: box.x1 + shift(), y1: box.y1 + shift() };
    if (moved.x1 - moved.x0 < 2 || moved.y1 - moved.y0 < 2) Object.assign(moved, box);
    const wrong = random() < settings.wrongClass;
    if (wrong) totals.wrongClass += 1;
    damaged.push(row(wrong ? String(Number(classId) + 1) : classId, moved, size));
    if (random() < settings.extra) {
      totals.extra += 1;
      const dx = (box.x1 - box.x0) / 2;
      damaged.push(row(classId, { ...box, x0: box.x0 + dx, x1: box.x1 + dx }, size));
    }
  }
  await writeFile(path.join(out, "label", `${base}.txt`), `${damaged.join("\n")}\n`);
}
for (const folder of ["label", "label_gt"]) await copyFile(path.join(sample, "label", "classes.yaml"), path.join(out, folder, "classes.yaml"));
console.log(JSON.stringify({ out: path.resolve(out), settings, ...totals }));
