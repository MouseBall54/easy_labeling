import { _electron, expect } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const output = path.resolve("output/yoloe-onnx-validation");
const cpu = process.env.YOLOE_TEST_CPU === "1";
await mkdir(output, { recursive: true });
const executable = path.resolve(process.argv[2] ?? "release/yoloe26/win-unpacked/Easy Labeling YOLOE-26.exe");
const image = "data:image/png;base64," + (await readFile("tests/e2e/fixtures/yoloe-visual/0-reference.png")).toString("base64");
const target = "data:image/png;base64," + (await readFile("tests/e2e/fixtures/yoloe-visual/1-target-gray.png")).toString("base64");
const app = await _electron.launch({ executablePath: executable, args: [`--user-data-dir=${path.join(output, cpu ? "probe-cpu-profile" : "probe-profile")}`,
  ...(cpu ? ["--disable-gpu", "--disable-software-rasterizer"] : [])],
  env: { ...process.env, PATH: path.join(process.env.SystemRoot, "System32"), PYTHONHOME: "C:\\no-python", PYTHONPATH: "C:\\no-python" } });
try {
  const page = await app.firstWindow();
  page.on("console", (message) => { if (message.type() === "error") console.log(message.text().slice(0, 600)); });
  const evidence = await page.evaluate(async ({ image, target }) => {
    const { requestYoloe } = await import("./dist/features/inference/yoloe.js");
    const status = await requestYoloe("status");
    let reservedBackgroundRejected = false;
    try {
      await requestYoloe("prepare", { model: status.cuda ? "yoloe-26s-seg" : "yoloe-26n-seg", workflow: "segmentation", imgsz: 640,
        references: [{ image, examples: [{ classId: 0, name: "invalid", box: [50, 400, 245, 900] }] }] });
    } catch (error) { if (!error.message.includes("0 is reserved for background")) throw error; reservedBackgroundRejected = true; }
    const profile = await requestYoloe("prepare", { model: status.cuda ? "yoloe-26s-seg" : "yoloe-26n-seg", workflow: "segmentation", imgsz: 640,
      references: [{ image, examples: [{ classId: 5, name: "person", box: [50, 400, 245, 900] }, { classId: 12, name: "bus", box: [20, 240, 785, 740] }] }] });
    const result = await requestYoloe("infer", { profileId: profile.id, image: target, confidence: 0.25, iou: 0.45 });
    return { status, profile, reservedBackgroundRejected, result: { ...result, mask: { width: result.mask.width, height: result.mask.height, runs: result.mask.runs.length,
      positive: result.mask.runs.filter((_, i) => i % 2 === 0 && result.mask.runs[i] !== 0).length } } };
  }, { image, target });
  expect(evidence.result.detections.length).toBeGreaterThan(0);
  expect(evidence.result.mask.positive).toBeGreaterThan(0);
  expect(evidence.reservedBackgroundRejected).toBe(true);
  expect(evidence.profile.backend).toBe(cpu ? "cpu" : "webgpu");
  await writeFile(path.join(output, cpu ? "probe-cpu.json" : "probe.json"), JSON.stringify(evidence, null, 2));
  console.log(JSON.stringify(evidence, null, 2));
} finally { await app.close(); }
