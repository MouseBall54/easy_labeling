import { describe, expect, it } from "vitest";
import { resolveModelInput, rgbaToTensor, getLetterbox, decodeYoloOutput, detectionsToYolo } from "../../../../src/features/inference/yolo.js";

describe("YOLO Detection inference", () => {
  it("detects fixed and dynamic NCHW/NHWC grayscale and RGB models and rejects unsupported inputs", () => {
    expect(resolveModelInput([1, 1, 32, 64], "float32")).toEqual({ layout: "nchw", channels: 1, width: 64, height: 32, dynamic: false });
    expect(resolveModelInput(["batch", "height", "width", 3], "float32", 320)).toEqual({ layout: "nhwc", channels: 3, width: 320, height: 320, dynamic: true });
    expect(() => resolveModelInput([2, 3, 640, 640], "float32")).toThrow(/batch/);
    expect(() => resolveModelInput([1, 3, 640, 640], "float16")).toThrow(/float32/);
    expect(() => resolveModelInput([1, "channels", 640, 640], "float32")).toThrow(/channel/);
  });

  it("preserves RGB order and grayscale brightness for 1ch/3ch in both layouts", () => {
    const rgba = new Uint8ClampedArray([255, 0, 0, 255, 128, 128, 128, 255]);
    const image = { width: 2, height: 1, dynamic: false };
    const rgb = rgbaToTensor(rgba, { ...image, layout: "nchw", channels: 3 });
    expect(Array.from(rgb).map((value) => Math.round(value * 255))).toEqual([255, 128, 0, 128, 0, 128]);
    expect(Array.from(rgbaToTensor(rgba, { ...image, layout: "nhwc", channels: 3 })).map((value) => Math.round(value * 255))).toEqual([255, 0, 0, 128, 128, 128]);
    for (const layout of ["nchw", "nhwc"] as const) {
      const gray = rgbaToTensor(rgba, { ...image, layout, channels: 1 });
      expect(gray[0]).toBeCloseTo(0.299);
      expect(gray[1]).toBeCloseTo(128 / 255);
    }
  });

  it("undoes letterbox padding, clips boxes, applies class-aware NMS, and writes normalized labels", () => {
    const letterbox = getLetterbox(200, 100, resolveModelInput([1, 3, 640, 640], "float32"));
    expect(letterbox).toMatchObject({ left: 0, top: 160, scale: 3.2 });
    const rows = [
      [320, 320, 320, 160, 0.9, 0.1],
      [320, 320, 320, 160, 0.8, 0.1],
      [320, 320, 320, 160, 0.1, 0.9],
      [0, 0, 100, 100, 0.1, 0.1],
      [NaN, 320, 20, 20, 1, 0],
      [10, 160, 80, 80, 0.7, 0.1],
      [0, 0, 0, 0, 0, 0]
    ];
    const data = new Float32Array(rows[0].flatMap((_, column) => rows.map((row) => row[column])));
    const boxes = decodeYoloOutput(data, [1, 6, rows.length], letterbox, { confidence: 0.25, iou: 0.45, format: "auto" });
    expect(boxes).toHaveLength(3);
    expect(boxes[0]).toMatchObject({ classId: 0, left: 50, top: 25, right: 150, bottom: 75 });
    expect(boxes[1].classId).toBe(1);
    expect(boxes[2].left).toBe(0);
    expect(boxes[2].top).toBe(0);
    expect(detectionsToYolo(boxes.slice(0, 1), 200, 100)).toBe("0 0.50000000 0.50000000 0.50000000 0.50000000");
  });

  it("handles YOLOv5 objectness and final xyxy outputs without guessing ambiguous six-column tensors", () => {
    const letterbox = getLetterbox(32, 32, resolveModelInput([1, 3, 32, 32], "float32"));
    const options = { confidence: 0.25, iou: 0.45 };
    const rows = [16, 16, 16, 16, 0.5, 0.8, 0.1];
    const v5 = decodeYoloOutput(rows, [1, 1, 7], letterbox, { ...options, format: "v5" });
    expect(v5[0].confidence).toBeCloseTo(0.4);
    const final = [8, 8, 24, 24, 0.9, 2];
    expect(() => decodeYoloOutput(final, [1, 1, 6], letterbox, { ...options, format: "auto" })).toThrow(/ambiguous/);
    expect(decodeYoloOutput(final, [1, 1, 6], letterbox, { ...options, format: "nms" })[0]).toMatchObject({ classId: 2, left: 8, top: 8, right: 24, bottom: 24 });
    expect(() => decodeYoloOutput(final, [2, 1, 6], letterbox, { ...options, format: "nms" })).toThrow(/Unsupported/);
    expect(() => decodeYoloOutput(final, [1, 1, 6], letterbox, { confidence: NaN, iou: 0.5, format: "nms" })).toThrow(/between/);
    expect(decodeYoloOutput([8, 8, 24, 24, 0, 0], [1, 1, 6], letterbox, { ...options, format: "nms" })).toEqual([]);
    expect(decodeYoloOutput([], [1, 0, 6], letterbox, { ...options, format: "nms" })).toEqual([]);
    expect(decodeYoloOutput([], [1, 5, 0], letterbox, { ...options, format: "auto" })).toEqual([]);
  });
});
