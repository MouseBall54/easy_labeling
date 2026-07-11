import { describe, expect, it } from "vitest";

import { calculateLayoutAnchor, createBoxLayout, placeBoxLayout } from "../../../../src/features/automation/layout.js";
import { DEFAULT_MULTIPLE_DETECTION_SETTINGS } from "../../../../src/features/automation/preset-codec.js";
import { AUTOMATION_SCHEMA_VERSION, type AutomationPreset } from "../../../../src/features/automation/types.js";

function createPreset(): AutomationPreset {
  return {
    schemaVersion: AUTOMATION_SCHEMA_VERSION,
    id: "preset-1",
    name: "station-a",
    templateId: "template-1",
    layoutId: "layout-1",
    outputMode: "layout-best-match",
    relationOffset: { x: 20, y: -5 },
    manualOffset: { x: 3, y: 7 },
    matching: { minimumScore: 0.8, searchRoi: null, mode: "accurate" },
    multipleDetection: { ...DEFAULT_MULTIPLE_DETECTION_SETTINGS },
    existingLabelsPolicy: "skip",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z"
  };
}

describe("automation layout", () => {
  it("captures class-preserving boxes relative to the top-left layout anchor", () => {
    const layout = createBoxLayout({
      id: "layout-1",
      name: "two boxes",
      sourceImageName: "reference.png",
      sourceImageSize: { width: 500, height: 300 },
      now: "2026-01-01T00:00:00.000Z",
      boxes: [
        { id: "a", classId: "2", left: 120, top: 80, width: 30, height: 20, order: 1 },
        { id: "b", classId: "5", left: 100, top: 100, width: 40, height: 25, order: 0 }
      ]
    });

    expect(layout.sourceAnchor).toEqual({ x: 100, y: 80 });
    expect(layout.boxes).toEqual([
      expect.objectContaining({ id: "b", classId: "5", relativeX: 0, relativeY: 20, order: 0 }),
      expect.objectContaining({ id: "a", classId: "2", relativeX: 20, relativeY: 0, order: 1 })
    ]);
  });

  it("applies the documented template-to-layout offset formula", () => {
    const anchor = calculateLayoutAnchor({
      score: 0.95,
      x: 50,
      y: 40,
      width: 10,
      height: 10,
      matches: [],
      templateCacheHit: false,
      timings: {
        engineInitializationMs: 0,
        transferPreparationMs: 0,
        targetPreprocessingMs: 0,
        templatePreprocessingMs: 0,
        matchingMs: 0,
        candidateExtractionMs: 0,
        workerTotalMs: 0,
        roundTripMs: 0
      }
    }, createPreset());
    expect(anchor).toEqual({ x: 73, y: 42 });
  });

  it("rejects a placement if any box leaves the image", () => {
    const layout = createBoxLayout({
      name: "edge",
      sourceImageName: "reference.png",
      sourceImageSize: { width: 100, height: 100 },
      boxes: [{ classId: "0", left: 10, top: 10, width: 20, height: 20 }]
    });

    expect(() => placeBoxLayout(layout, { x: 85, y: 85 }, { width: 100, height: 100 })).toThrow(/outside the image bounds/);
  });
});
