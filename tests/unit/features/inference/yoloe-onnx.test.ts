import { expect, it } from "vitest";
import { decodeYoloePredictions, yoloeSemanticMask } from "../../../../src/features/inference/yoloe-onnx.js";
import { getLetterbox } from "../../../../src/features/inference/yolo.js";

it("maps multiple embeddings to one class, suppresses duplicate boxes and removes letterbox padding", () => {
  const data = new Float32Array(38 * 3);
  data.set([320, 320, 320, 320, 320, 320, 160, 160, 160, 160, 160, 160]);
  data.set([0.9, 0.1, 0.1, 0.1, 0.8, 0.1], 12);
  const letterbox = getLetterbox(320, 640, { width: 640, height: 640, channels: 3, layout: "nchw", dynamic: false });
  const results = decodeYoloePredictions(data, [1, 38, 3], [1200, 1200], letterbox, 0.25, 0.45);
  expect(results).toEqual([{ anchor: 0, classId: 1200, confidence: expect.closeTo(0.9), left: 80, top: 240, right: 240, bottom: 400 }]);
});

it("restores full-resolution masks, preserves background and resolves overlaps by confidence with 16-bit class IDs", () => {
  const data = new Float32Array(38 * 2);
  data[12] = 1; data[13] = -1;
  const proto = new Float32Array(32 * 4); proto.set([1, -1, 1, -1]);
  const boxes = [{ anchor: 0, classId: 1200, confidence: 0.7, left: 0, top: 0, right: 4, bottom: 4 },
    { anchor: 1, classId: 65535, confidence: 0.9, left: 0, top: 0, right: 4, bottom: 4 }];
  const mask = yoloeSemanticMask(data, [1, 38, 2], proto, [1, 32, 2, 2], boxes, 2, 4, 4);
  expect(Array.from(mask)).toEqual(Array.from({ length: 4 }, () => [1200, 1200, 65535, 65535]).flat());
  expect(Array.from(yoloeSemanticMask(data, [1, 38, 2], proto, [1, 32, 2, 2], [], 2, 4, 4))).toEqual(new Array(16).fill(0));
});
