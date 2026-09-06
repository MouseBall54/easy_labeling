import { describe, expect, it } from "vitest";

import { detectSegmentationFormat, isFormatSupportedForAnnotationType } from "../../../../src/domain/annotations/segmentation-format.js";

describe("segmentation format detection", () => {
  it("detects a COCO dataset from its required JSON sections", () => {
    expect(detectSegmentationFormat({
      fileNames: ["annotations.json"],
      jsonTextByFileName: new Map([["annotations.json", JSON.stringify({ images: [], annotations: [], categories: [] })]])
    })).toMatchObject({ format: "coco-segmentation", confidence: "certain" });
  });

  it("detects standard YOLO, LabelMe, and PNG mask dataset signals", () => {
    expect(detectSegmentationFormat({ fileNames: ["data.yaml"], directoryNames: ["labels"] })).toMatchObject({ format: "yolo-segmentation", confidence: "certain" });
    expect(detectSegmentationFormat({
      fileNames: ["sample.json"],
      jsonTextByFileName: new Map([["sample.json", JSON.stringify({ imagePath: "sample.png", shapes: [] })]])
    })).toMatchObject({ format: "labelme", confidence: "certain" });
    expect(detectSegmentationFormat({ fileNames: [], directoryNames: ["mask"] })).toMatchObject({ format: "png-semantic-mask", confidence: "certain" });
  });

  it("does not guess when the dataset has multiple valid format signals", () => {
    expect(detectSegmentationFormat({
      fileNames: ["data.yaml"],
      directoryNames: ["labels", "mask"]
    })).toMatchObject({ format: null, confidence: "ambiguous" });
  });

  it("keeps semantic PNG and instance YOLO availability distinct", () => {
    expect(isFormatSupportedForAnnotationType("png-semantic-mask", "semantic")).toBe(true);
    expect(isFormatSupportedForAnnotationType("png-semantic-mask", "instance")).toBe(false);
    expect(isFormatSupportedForAnnotationType("yolo-segmentation", "instance")).toBe(true);
  });
});
