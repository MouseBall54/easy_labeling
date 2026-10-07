import { expect, it, vi, afterEach } from "vitest";
import type { FabricRectLike } from "../../../../src/features/canvas/fabric-types.js";
import { selectedVisualExamples, requestYoloe, decodeYoloeMask, maskRegionExample, sampleMaskGeometry, maskVisualExamples } from "../../../../src/features/inference/yoloe.js";

afterEach(() => vi.unstubAllGlobals());

it("lists separate mask regions with class IDs, preserving holes and preventing row wrap connections", () => {
  const mask = new Uint16Array([5, 5, 5, 0, 12, 5, 0, 5, 0, 0, 5, 5, 5, 0, 12]);
  const samples = maskVisualExamples(mask, 5, 3, new Map([["5", "ring"], ["12", "particle"]]));
  expect(samples.map((s) => [s.classId, s.name, s.box])).toEqual([[5, "ring", [0, 0, 3, 3]], [12, "particle", [4, 0, 5, 1]], [12, "particle", [4, 2, 5, 3]]]);
  expect(Array.from(decodeYoloeMask(samples[0]!.mask!).mask)).toEqual([1, 1, 1, 1, 0, 1, 1, 1, 1]);
  expect(maskVisualExamples(new Uint16Array([0, 1, 1, 0]), 2, 2, new Map())).toHaveLength(2);
});

it("crops painted samples while preserving erased holes and disconnected islands", () => {
  const pixels = new Uint16Array(7 * 5);
  for (let y = 1; y <= 3; y++) for (let x = 1; x <= 3; x++) pixels[y * 7 + x] = 1;
  pixels[2 * 7 + 2] = 0; pixels[2 * 7 + 5] = 1;
  const geometry = sampleMaskGeometry(pixels, 7, 5);
  expect(geometry.box).toEqual([1, 1, 6, 4]);
  expect(Array.from(decodeYoloeMask(geometry.mask!).mask)).toEqual([1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 0]);
  expect(() => sampleMaskGeometry(new Uint16Array(35), 7, 5)).toThrow(/Paint/);
});

it("captures scene bounds of grouped/scaled examples, clips the image edges and preserves non-contiguous class IDs", () => {
  const box = { labelClass: "5", getBoundingRect: () => ({ left: -5, top: 8, width: 35, height: 20 }) } as FabricRectLike;
  expect(selectedVisualExamples([box], 20, 40, new Map([["5", '"person"']]))).toEqual([{ classId: 5, name: "person", box: [0, 8, 20, 28] }]);
  expect(() => selectedVisualExamples([], 20, 40, new Map())).toThrow(/Select/);
  expect(() => selectedVisualExamples([{ ...box, labelClass: "person" }], 20, 40, new Map())).toThrow(/numeric/);
  expect(() => selectedVisualExamples([{ ...box, getBoundingRect: () => ({ left: 30, top: 0, width: 2, height: 2 }) }], 20, 40, new Map())).toThrow(/overlap/);
});

it("decodes full-resolution semantic mask runs without losing 16-bit IDs or accepting incomplete data", () => {
  expect(Array.from(decodeYoloeMask({ width: 3, height: 2, runs: [5, 2, 1200, 1, 0, 3] }).mask)).toEqual([5, 5, 1200, 0, 0, 0]);
  for (const runs of [[0, 5], [1, 7], [65536, 6], [1, 0], [1, 2, 0]]) expect(() => decodeYoloeMask({ width: 3, height: 2, runs })).toThrow();
  expect(() => maskRegionExample(null, new Map(), 10)).toThrow(/Select/);
  const example = maskRegionExample({ classId: "5", bounds: { left: 2, top: 3, right: 4, bottom: 4 }, pixelIndices: new Uint32Array([32, 34, 43]) } as Parameters<typeof maskRegionExample>[0], new Map([["5", "person"]]), 10)[0]!;
  expect(example.box).toEqual([2, 3, 5, 5]);
  expect(Array.from(decodeYoloeMask(example.mask!).mask)).toEqual([1, 0, 1, 0, 1, 0]);
});

it("reports disconnected services and backend validation failures without substituting fabricated results", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
  await expect(requestYoloe("status")).rejects.toThrow(/yoloe:start/);
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 409, json: async () => ({ error: "GPU is busy" }) }));
  await expect(requestYoloe("infer", {})).rejects.toThrow("GPU is busy");
});
