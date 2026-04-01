import { describe, expect, it } from "vitest";

import { createDetectionAnnotationCodec } from "../../../src/domain/annotations/detection.js";
import { parseYoloRows, serializeRectsToYolo, type YoloRectLike } from "../../../src/domain/yolo/yolo.js";

class FakeRect implements YoloRectLike {
  public setCoordsCalls = 0;

  constructor(
    public readonly labelClass: string | undefined,
    private readonly center: { x: number; y: number },
    private readonly width: number,
    private readonly height: number
  ) {}

  setCoords(): void {
    this.setCoordsCalls += 1;
  }

  getCenterPoint(): { x: number; y: number } {
    return this.center;
  }

  getScaledWidth(): number {
    return this.width;
  }

  getScaledHeight(): number {
    return this.height;
  }
}

describe("domain/yolo", () => {
  it("serializes YOLO lines with 15-decimal precision and trailing newline", () => {
    const rectA = new FakeRect("7", { x: 333.333333333, y: 111.111111111 }, 20, 10);
    const rectB = new FakeRect(undefined, { x: 1, y: 2 }, 3, 4);

    const serialized = serializeRectsToYolo([rectA, rectB], 640, 480);

    expect(serialized).toBe(
      "7 0.520833333332812 0.231481481481250 0.031250000000000 0.020833333333333\n" +
        "0 0.001562500000000 0.004166666666667 0.004687500000000 0.008333333333333\n"
    );
    expect(rectA.setCoordsCalls).toBe(1);
    expect(rectB.setCoordsCalls).toBe(1);
  });

  it("parses YOLO rows using the legacy addLabelsFromYolo geometry math", () => {
    const rows = parseYoloRows("3 0.25 0.4 0.2 0.5\n\n1 0.5 0.5 1 1\n", 200, 100);

    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({
      labelClass: "3",
      x_center: "0.25",
      y_center: "0.4",
      width: "0.2",
      height: "0.5",
      rectLeft: 30,
      rectTop: 15,
      rectWidth: 40,
      rectHeight: 50
    });
    expect(rows[1]).toEqual({
      labelClass: "1",
      x_center: "0.5",
      y_center: "0.5",
      width: "1",
      height: "1",
      rectLeft: 0,
      rectTop: 0,
      rectWidth: 200,
      rectHeight: 100
    });
  });

  it("keeps legacy no-validation behavior for malformed rows", () => {
    const rows = parseYoloRows("2 0.5\n", 100, 100);

    expect(rows).toHaveLength(1);
    expect(Number.isNaN(rows[0].rectLeft)).toBe(true);
    expect(Number.isNaN(rows[0].rectTop)).toBe(true);
    expect(Number.isNaN(rows[0].rectWidth)).toBe(true);
    expect(Number.isNaN(rows[0].rectHeight)).toBe(true);
  });

  it("wraps legacy YOLO parsing/serialization in the detection annotation codec without changing txt output", () => {
    const codec = createDetectionAnnotationCodec();
    const rect = new FakeRect("7", { x: 333.333333333, y: 111.111111111 }, 20, 10);

    const encoded = codec.encode({
      imageBaseName: "scene-a",
      rects: [rect],
      imageWidth: 640,
      imageHeight: 480
    });

    expect(encoded).toEqual([
      {
        path: "label/scene-a.txt",
        content: "7 0.520833333332812 0.231481481481250 0.031250000000000 0.020833333333333\n"
      }
    ]);

    const decoded = codec.decode({
      imageBaseName: "scene-a",
      yoloText: encoded[0]?.content as string,
      imageWidth: 640,
      imageHeight: 480
    });

    expect(decoded.workflow).toBe("detection");
    expect(decoded.format).toBe("yolo-txt-v1");
    expect(decoded.paths).toEqual({
      primaryFilePath: "label/scene-a.txt",
      sidecarFilePaths: []
    });
    expect(decoded.data.rows).toEqual(parseYoloRows("7 0.520833333332812 0.231481481481250 0.031250000000000 0.020833333333333\n", 640, 480));
  });

});
