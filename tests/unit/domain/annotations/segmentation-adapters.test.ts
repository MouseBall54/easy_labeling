import { describe, expect, it } from "vitest";
import { exportSegmentationAnnotations, importSegmentationAnnotations } from "../../../../src/domain/annotations/segmentation-adapters.js";

describe("segmentation format adapters", () => {
  it("round-trips a YOLO polygon through the internal instance model", () => {
    const model = importSegmentationAnnotations({ format: "yolo-segmentation", imageId: "sample", imagePath: "sample.jpg", width: 8, height: 8, text: "1 0 0 1 0 0 1" });
    const exported = exportSegmentationAnnotations({ format: "yolo-segmentation", model, fileName: "sample.jpg" });
    const restored = importSegmentationAnnotations({ format: "yolo-segmentation", imageId: "sample", imagePath: "sample.jpg", width: 8, height: 8, text: exported.text });
    expect(restored.annotationType).toBe("instance");
    expect(restored.annotations[0]?.classId).toBe("1");
    expect(restored.annotations[0]?.mask[9]).toBe(1);
  });

  it("round-trips a LabelMe polygon through the internal instance model", () => {
    const model = importSegmentationAnnotations({ format: "labelme", imageId: "sample", imagePath: "sample.jpg", width: 8, height: 8, text: JSON.stringify({ shapes: [{ label: "2", points: [[0, 0], [7, 0], [0, 7]] }] }) });
    const exported = exportSegmentationAnnotations({ format: "labelme", model, fileName: "sample.jpg" });
    const restored = importSegmentationAnnotations({ format: "labelme", imageId: "sample", imagePath: "sample.jpg", width: 8, height: 8, text: exported.text });
    expect(restored.annotations).toHaveLength(1);
    expect(restored.annotations[0]?.classId).toBe("2");
  });

  it("maps a LabelMe class name to the active numeric class ID", () => {
    const model = importSegmentationAnnotations({
      format: "labelme", imageId: "sample", imagePath: "sample.jpg", width: 8, height: 8,
      text: JSON.stringify({ shapes: [{ label: "crack", points: [[0, 0], [7, 0], [0, 7]] }] }),
      classIdByName: new Map([["crack", "3"]])
    });
    expect(model.annotations[0]?.classId).toBe("3");
  });
});
