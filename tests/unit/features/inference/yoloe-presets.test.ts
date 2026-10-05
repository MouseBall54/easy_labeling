import { expect, it } from "vitest";
import { parseYoloePreset, type YoloePreset } from "../../../../src/features/inference/yoloe-presets.js";

const preset: YoloePreset = { version: 1, engine: "yoloe26", workflow: "segmentation",
  settings: { model: "yoloe-26s-seg", imgsz: 2048, confidence: 0.25, iou: 0.45, name: "parts", sampleName: "sampleA", shape: "brush", radius: 8, autoFill: true, paintTool: "erase" },
  references: [{ name: "source.png", image: "data:image/png;base64,AA==", examples: [{ classId: 12, name: "ring", box: [1, 2, 4, 5], mask: { width: 3, height: 3, runs: [1, 4, 0, 1, 1, 4] } }] }] };

it("round trips embedded images, named pixel masks with holes, and inference/tool settings", () => {
  expect(parseYoloePreset(JSON.stringify(preset))).toEqual(preset);
});

it("rejects incompatible settings, background samples and invalid RLE without accepting partial data", () => {
  for (const patch of [{ version: 2 }, { settings: { ...preset.settings, imgsz: 960 } }, { settings: { ...preset.settings, confidence: 1.1 } },
    { references: [{ ...preset.references[0], examples: [{ ...preset.references[0]!.examples[0], classId: 0 }] }] },
    { references: [{ ...preset.references[0], examples: [{ ...preset.references[0]!.examples[0], mask: { width: 3, height: 3, runs: [1, 8] } }] }] }]) {
    expect(() => parseYoloePreset(JSON.stringify({ ...preset, ...patch }))).toThrow();
  }
});
