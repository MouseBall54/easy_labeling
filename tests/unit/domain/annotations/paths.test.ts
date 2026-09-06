import { describe, expect, it } from "vitest";
import { resolveAnnotationAssetPaths, resolveSegmentationExportPath } from "../../../../src/domain/annotations/paths.js";

describe("annotation paths", () => {
  it("keeps segmentation export paths separate from detection labels", () => {
    const detection = resolveAnnotationAssetPaths("detection", "sample").primaryFilePath;
    expect(resolveSegmentationExportPath("yolo-segmentation", "sample")).not.toBe(detection);
    expect(resolveSegmentationExportPath("yolo-segmentation", "sample")).toBe("segmentation/yolo/labels/sample.txt");
  });
});
