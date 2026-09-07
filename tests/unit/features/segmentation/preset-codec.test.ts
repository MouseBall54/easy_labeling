import { describe, expect, it } from "vitest";
import { parseSegmentationToolPresetDocument, serializeSegmentationToolPresetDocument } from "../../../../src/features/segmentation/preset-codec.js";

describe("segmentation preset codec", () => {
  it("round-trips independent segmentation tooling presets", () => {
    const text = serializeSegmentationToolPresetDocument({
      schemaVersion: 1,
      presets: [{
        id: "preset-1", name: "Fine edges",
        settings: { regionSize: 8, blur: "low", contrast: "medium", edgeSensitivity: "high" },
        smartSimilarity: 0.2, smartEdgeStop: 0.7, boundaryVisible: true
      }]
    });
    expect(parseSegmentationToolPresetDocument(text).presets[0]?.settings).toEqual({
      regionSize: 8, blur: "low", contrast: "medium", edgeSensitivity: "high"
    });
  });
});
