import { expect, it, vi, afterEach } from "vitest";
import type { FabricRectLike } from "../../../../src/features/canvas/fabric-types.js";
import { selectedVisualExamples, requestYoloe } from "../../../../src/features/inference/yoloe.js";

afterEach(() => vi.unstubAllGlobals());

it("captures scene bounds of grouped/scaled examples, clips the image edges and preserves non-contiguous class IDs", () => {
  const box = { labelClass: "5", getBoundingRect: () => ({ left: -5, top: 8, width: 35, height: 20 }) } as FabricRectLike;
  expect(selectedVisualExamples([box], 20, 40, new Map([["5", '"person"']]))).toEqual([{ classId: 5, name: "person", box: [0, 8, 20, 28] }]);
  expect(() => selectedVisualExamples([], 20, 40, new Map())).toThrow(/Select/);
  expect(() => selectedVisualExamples([{ ...box, labelClass: "person" }], 20, 40, new Map())).toThrow(/numeric/);
  expect(() => selectedVisualExamples([{ ...box, getBoundingRect: () => ({ left: 30, top: 0, width: 2, height: 2 }) }], 20, 40, new Map())).toThrow(/overlap/);
});

it("reports disconnected services and backend validation failures without substituting fabricated results", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
  await expect(requestYoloe("status")).rejects.toThrow(/yoloe:start/);
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 409, json: async () => ({ error: "GPU is busy" }) }));
  await expect(requestYoloe("infer", {})).rejects.toThrow("GPU is busy");
});
