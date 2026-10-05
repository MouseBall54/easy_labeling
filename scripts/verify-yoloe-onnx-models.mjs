import { _electron, expect } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const output = path.resolve("output/yoloe-onnx-validation");
await mkdir(output, { recursive: true });
const images = await Promise.all(["0-reference.png", "1-target-gray.png"].map(async (file) =>
  "data:image/png;base64," + (await readFile(`tests/e2e/fixtures/yoloe-visual/${file}`)).toString("base64")));
const executable = path.resolve(process.argv[2] ?? "release/yoloe26/win-unpacked/Easy Labeling YOLOE-26.exe");
const app = await _electron.launch({ executablePath: executable, args: [`--user-data-dir=${path.join(output, "models-profile")}`],
  env: { ...process.env, PATH: path.join(process.env.SystemRoot, "System32"), PYTHONHOME: "C:\\no-python", PYTHONPATH: "C:\\no-python" } });
try {
  const page = await app.firstWindow();
  const network = [];
  await page.route(/^https?:/, (route) => { network.push(route.request().url()); return route.abort(); });
  const checks = await page.evaluate(async (images) => {
    const { requestYoloe } = await import("./dist/features/inference/yoloe.js");
    const pixels = new Uint8Array(180 * 500).fill(1);
    // A painted mask with an erased hole, plus a polygon and a box on another image.
    for (let y = 200; y < 230; y++) pixels.fill(0, y * 180 + 60, y * 180 + 90);
    const runs = [];
    for (const value of pixels) { if (runs.length && runs[runs.length - 2] === value) runs[runs.length - 1]++; else runs.push(value, 1); }
    const references = [
      { image: images[0], examples: [
        { classId: 5, name: "person", box: [50, 400, 245, 900], polygon: [[90, 400], [185, 400], [245, 900], [50, 900]] },
        { classId: 12, name: "bus", box: [20, 240, 785, 740] }] },
      { image: images[1], examples: [{ classId: 5, name: "person", box: [50, 400, 230, 900], mask: { width: 180, height: 500, runs } }] }
    ];
    const checks = [];
    for (const size of "nsml") for (const workflow of ["detection", "segmentation"]) {
      const imgsz = "ml".includes(size) ? 1024 : 640;
      const started = performance.now();
      const profile = await requestYoloe("prepare", { model: `yoloe-26${size}-seg`, workflow, references, imgsz });
      const result = await requestYoloe("infer", { profileId: profile.id, image: images[1], confidence: 0.25, iou: 0.45 });
      checks.push({ size, workflow, imgsz, backend: result.backend, samples: profile.exampleCount, references: profile.referenceCount,
        classIds: profile.classIds, detections: result.detections.length, classes: [...new Set(result.detections.map((item) => item.classId))],
        mask: result.mask ? { width: result.mask.width, height: result.mask.height, positiveRuns: result.mask.runs.filter((_, i) => i % 2 === 0 && result.mask.runs[i] > 0).length } : null,
        elapsedMs: Math.round(performance.now() - started) });
    }
    return checks;
  }, images);
  for (const check of checks) {
    expect(check.backend).toBe("webgpu"); expect(check.samples).toBe(3); expect(check.references).toBe(2);
    expect(check.classIds).toEqual([5, 12, 5]); expect(check.classes).toContain(5); expect(check.classes).toContain(12);
    expect(check.detections).toBeGreaterThan(0);
    if (check.workflow === "segmentation") { expect(check.mask).toMatchObject({ width: 810, height: 1080 }); expect(check.mask.positiveRuns).toBeGreaterThan(0); }
    else expect(check.mask).toBeNull();
  }
  expect(network).toEqual([]);
  await writeFile(path.join(output, "models.json"), JSON.stringify({ checks, network }, null, 2) + "\n");
  console.log(JSON.stringify(checks, null, 2));
} finally { await app.close(); }
