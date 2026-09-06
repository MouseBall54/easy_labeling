import { describe, expect, it } from "vitest";
import { decodeCocoSegmentation, decodeLabelMeSegmentation, encodeCocoSegmentation } from "../../../../src/domain/annotations/segmentation-external-codecs.js";

describe("segmentation external codecs", () => {
  it("decodes COCO polygons for the selected image and retains category names", () => {
    const decoded = decodeCocoSegmentation({
      text: JSON.stringify({
        categories: [{ id: 3, name: "crack" }],
        images: [{ id: 4, file_name: "sample.png" }],
        annotations: [{ id: 8, image_id: 4, category_id: 3, segmentation: [[0, 0, 3, 0, 0, 3]] }]
      }),
      imageId: "sample",
      imageFileName: "sample.png",
      width: 4,
      height: 4
    });
    expect(decoded.annotations).toHaveLength(1);
    expect(decoded.annotations[0]?.classId).toBe("3");
    expect(decoded.annotations[0]?.mask[1]).toBe(1);
    expect(decoded.classNames.get("3")).toBe("crack");
  });

  it("exports masks as standard COCO uncompressed RLE when polygon data is absent", () => {
    const text = encodeCocoSegmentation({
      imageId: 1,
      fileName: "sample.png",
      width: 2,
      height: 2,
      annotations: [{ annotationId: "a", classId: "1", instanceId: "a", mask: Uint8Array.from([1, 0, 0, 0]), polygon: null, attributes: {} }]
    });
    const parsed = JSON.parse(text) as { annotations: Array<{ segmentation: { counts: number[] } }> };
    expect(parsed.annotations[0]?.segmentation.counts).toEqual([0, 1, 3]);
  });

  it("decodes LabelMe polygon shapes", () => {
    const annotations = decodeLabelMeSegmentation({
      text: JSON.stringify({ shapes: [{ label: "defect", shape_type: "polygon", points: [[0, 0], [3, 0], [0, 3]] }] }),
      width: 4,
      height: 4
    });
    expect(annotations).toHaveLength(1);
    expect(annotations[0]?.classId).toBe("defect");
    expect(annotations[0]?.mask[1]).toBe(1);
  });
});
