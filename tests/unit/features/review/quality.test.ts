import { describe, expect, it } from "vitest";

import { inspectDetectionLabels } from "../../../../src/features/review/quality.js";
import { DEFAULT_REVIEW_SETTINGS, createReviewStateDocument, parseReviewStateDocument } from "../../../../src/features/review/review-state.js";

describe("review quality inspection", () => {
  it("reports empty labels", () => {
    const finding = inspectDetectionLabels({
      yoloText: "",
      imageWidth: 100,
      imageHeight: 100,
      settings: DEFAULT_REVIEW_SETTINGS
    });
    expect(finding.issues.map((issue) => issue.type)).toEqual(["empty-label"]);
  });

  it("reports out-of-bounds and undersized boxes", () => {
    const finding = inspectDetectionLabels({
      yoloText: "0 1.1 0.5 0.01 0.01",
      imageWidth: 100,
      imageHeight: 100,
      settings: DEFAULT_REVIEW_SETTINGS
    });
    expect(finding.issues.map((issue) => issue.type)).toEqual(["out-of-bounds", "small-box"]);
  });

  it("reports same-class duplicates with their box indexes", () => {
    const finding = inspectDetectionLabels({
      yoloText: ["0 0.5 0.5 0.2 0.2", "0 0.5 0.5 0.2 0.2"].join("\n"),
      imageWidth: 100,
      imageHeight: 100,
      settings: DEFAULT_REVIEW_SETTINGS
    });
    expect(finding.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: "duplicate-box", rectIndexes: [0, 1] })
    ]));
  });

  it("reports each required class that is absent", () => {
    const finding = inspectDetectionLabels({
      yoloText: "0 0.5 0.5 0.2 0.2",
      imageWidth: 100,
      imageHeight: 100,
      settings: { ...DEFAULT_REVIEW_SETTINGS, requiredClassIds: ["0", "2"] }
    });
    expect(finding.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: "missing-class", message: "Required class 2 is missing" })
    ]));
  });

  it("uses safe defaults for malformed review settings and rejects an unsupported schema", () => {
    expect(createReviewStateDocument().settings).toEqual(DEFAULT_REVIEW_SETTINGS);
    expect(parseReviewStateDocument(JSON.stringify({
      schemaVersion: 1,
      settings: { minimumBoxSizePx: -2, duplicateIouThreshold: 3, requiredClassIds: ["1", "bad", "1"] },
      images: { "image.jpg": { status: "reviewed", reviewedAt: "2026-09-06T00:00:00.000Z" } }
    }))).toMatchObject({
      settings: { minimumBoxSizePx: 1, duplicateIouThreshold: 1, requiredClassIds: ["1"] },
      images: { "image.jpg": { status: "reviewed" } }
    });
    expect(() => parseReviewStateDocument('{"schemaVersion":2}')).toThrow("Unsupported review state file");
  });
});
