import { describe, expect, it } from "vitest";

import {
  createAutomationDetectionBoxes,
  mergeDetectionLabels,
  serializeAutomationBoxes
} from "../../../../src/features/automation/batch-labels.js";
import { createBoxLayout } from "../../../../src/features/automation/layout.js";
import { DEFAULT_MULTIPLE_DETECTION_SETTINGS } from "../../../../src/features/automation/preset-codec.js";
import { AUTOMATION_SCHEMA_VERSION, type AutomationPreset, type TemplateMatchResult } from "../../../../src/features/automation/types.js";

const timings = {
  engineInitializationMs: 0,
  transferPreparationMs: 0,
  targetPreprocessingMs: 0,
  templatePreprocessingMs: 0,
  matchingMs: 0,
  candidateExtractionMs: 0,
  workerTotalMs: 0,
  roundTripMs: 0
};

function createPreset(overrides: Partial<AutomationPreset> = {}): AutomationPreset {
  return {
    schemaVersion: AUTOMATION_SCHEMA_VERSION,
    id: "preset-1",
    name: "fixture",
    templateId: "template-1",
    layoutId: "layout-1",
    outputMode: "layout-best-match",
    relationOffset: { x: 3, y: 4 },
    manualOffset: { x: 1, y: -2 },
    matching: { minimumScore: 0.8, searchRoi: null, mode: "accurate" },
    multipleDetection: { ...DEFAULT_MULTIPLE_DETECTION_SETTINGS },
    existingLabelsPolicy: "skip",
    createdAt: "now",
    updatedAt: "now",
    ...overrides
  };
}

function createMatch(overrides: Partial<TemplateMatchResult> = {}): TemplateMatchResult {
  return {
    score: 0.94,
    x: 20,
    y: 30,
    width: 10,
    height: 8,
    matches: [{ score: 0.94, x: 20, y: 30, width: 10, height: 8 }],
    timings,
    templateCacheHit: false,
    ...overrides
  };
}

describe("automation batch label generation", () => {
  it("preserves Best Match + Layout placement behavior", () => {
    const layout = createBoxLayout({
      id: "layout-1",
      name: "fixture",
      sourceImageName: "ref.png",
      sourceImageSize: { width: 200, height: 100 },
      boxes: [
        { classId: "2", left: 40, top: 10, width: 20, height: 12 },
        { classId: "7", left: 70, top: 20, width: 15, height: 10 }
      ]
    });

    const boxes = createAutomationDetectionBoxes({
      preset: createPreset(),
      layout,
      match: createMatch(),
      imageSize: { width: 200, height: 100 }
    });

    expect(boxes).toEqual([
      { classId: "2", x: 24, y: 32, width: 20, height: 12, score: 0.94 },
      { classId: "7", x: 54, y: 42, width: 15, height: 10, score: 0.94 }
    ]);
  });

  it("creates all padded multiple-match boxes with the configured class", () => {
    const preset = createPreset({
      layoutId: null,
      outputMode: "multiple-detection-boxes",
      multipleDetection: { ...DEFAULT_MULTIPLE_DETECTION_SETTINGS, classId: "11", paddingX: 2, paddingY: 3 }
    });
    const match = createMatch({
      matches: [
        { score: 0.96, x: 8, y: 9, width: 14, height: 16 },
        { score: 0.88, x: 50, y: 40, width: 14, height: 16 }
      ]
    });

    const boxes = createAutomationDetectionBoxes({
      preset,
      layout: null,
      match,
      imageSize: { width: 100, height: 100 }
    });

    expect(boxes.map((box) => ({ classId: box.classId, x: box.x, y: box.y, width: box.width, height: box.height }))).toEqual([
      { classId: "11", x: 8, y: 9, width: 14, height: 16 },
      { classId: "11", x: 50, y: 40, width: 14, height: 16 }
    ]);
    expect(serializeAutomationBoxes(boxes, { width: 100, height: 100 }).split("\n").filter(Boolean)).toHaveLength(2);
  });

  it("removes layout and multiple-match boxes that cross target image bounds", () => {
    const layout = createBoxLayout({
      id: "layout-1",
      name: "edge fixture",
      sourceImageName: "ref.png",
      sourceImageSize: { width: 100, height: 100 },
      boxes: [
        { classId: "2", left: 10, top: 10, width: 20, height: 20 },
        { classId: "7", left: 40, top: 10, width: 20, height: 20 }
      ]
    });
    const layoutBoxes = createAutomationDetectionBoxes({
      preset: createPreset({ relationOffset: { x: 0, y: 0 }, manualOffset: { x: 0, y: 0 } }),
      layout,
      match: createMatch({ x: 60, y: 60 }),
      imageSize: { width: 100, height: 100 }
    });
    expect(layoutBoxes.map((box) => box.classId)).toEqual(["2"]);

    const multipleBoxes = createAutomationDetectionBoxes({
      preset: createPreset({ outputMode: "multiple-detection-boxes", layoutId: null }),
      layout: null,
      match: createMatch({
        matches: [
          { score: 0.95, x: 10, y: 10, width: 20, height: 20 },
          { score: 0.90, x: 90, y: 10, width: 20, height: 20 }
        ]
      }),
      imageSize: { width: 100, height: 100 }
    });
    expect(multipleBoxes).toHaveLength(1);
    expect(multipleBoxes[0]).toMatchObject({ x: 10, y: 10 });
  });

  it("supports Append and Replace without rewriting an existing label on failed processing", () => {
    const existing = "9 0.500000000000000 0.500000000000000 0.100000000000000 0.100000000000000";
    const generated = "2 0.200000000000000 0.300000000000000 0.100000000000000 0.100000000000000\n";

    expect(mergeDetectionLabels(existing, generated, "append")).toBe(`${existing}\n${generated.trim()}`);
    expect(mergeDetectionLabels(existing, generated, "replace")).toBe(generated.trim());
    expect(existing).toContain("9 0.500000000000000");
  });
});
