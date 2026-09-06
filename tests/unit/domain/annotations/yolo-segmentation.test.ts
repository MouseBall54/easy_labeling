import { describe, expect, it } from "vitest";
import { decodeYoloSegmentation, encodeYoloSegmentation } from "../../../../src/domain/annotations/yolo-segmentation.js";

describe("YOLO segmentation adapter", () => {
  it("imports normalized polygons into instance masks and exports them", () => {
    const annotations = decodeYoloSegmentation({ text: "2 0 0 1 0 0 1", width: 4, height: 4 });
    expect(annotations).toHaveLength(1);
    expect(annotations[0]?.mask[1]).toBe(1);
    expect(encodeYoloSegmentation({ width: 4, height: 4, annotations })).toContain("2 0.000000 0.000000 1.000000");
  });
});
