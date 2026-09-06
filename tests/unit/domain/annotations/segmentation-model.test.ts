import { describe, expect, it } from "vitest";

import { createInstanceAnnotationModel, createInstanceAnnotationModelFromSnapshot, createSemanticAnnotationModel } from "../../../../src/domain/annotations/segmentation-model.js";

describe("internal segmentation annotation model", () => {
  it("represents semantic masks as one binary mask per class", () => {
    const model = createSemanticAnnotationModel({
      imageId: "sample-1",
      imagePath: "mask/sample-1.png",
      snapshot: { width: 2, height: 2, mask: new Uint16Array([0, 2, 7, 2]) }
    });

    expect(model.annotationType).toBe("semantic");
    expect(model.annotations).toEqual([
      expect.objectContaining({ classId: "2", instanceId: null, mask: new Uint8Array([0, 1, 0, 1]) }),
      expect.objectContaining({ classId: "7", instanceId: null, mask: new Uint8Array([0, 0, 1, 0]) })
    ]);
  });

  it("keeps instance masks and instance identifiers independent from external formats", () => {
    const model = createInstanceAnnotationModel({
      imageId: "sample-2",
      imagePath: "images/sample-2.png",
      width: 2,
      height: 2,
      annotations: [{
        annotationId: "ann-1",
        classId: "3",
        instanceId: null,
        mask: new Uint8Array([1, 0, 1, 0]),
        polygon: null,
        attributes: { source: "manual" }
      }]
    });

    expect(model.annotationType).toBe("instance");
    expect(model.annotations[0]).toMatchObject({ annotationId: "ann-1", classId: "3", instanceId: "ann-1" });
  });

  it("separates disconnected class regions into exportable instances", () => {
    const model = createInstanceAnnotationModelFromSnapshot({
      imageId: "sample-3", imagePath: "images/sample-3.png",
      snapshot: { width: 4, height: 2, mask: new Uint16Array([2, 2, 0, 2, 0, 0, 0, 2]) }
    });

    expect(model.annotationType).toBe("instance");
    expect(model.annotations).toHaveLength(2);
    expect(model.annotations.every((annotation) => annotation.classId === "2" && (annotation.polygon?.length ?? 0) >= 3)).toBe(true);
  });
});
