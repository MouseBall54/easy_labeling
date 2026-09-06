import { describe, expect, it } from "vitest";
import { decodeCocoUncompressedRle, encodeCocoUncompressedRle, rasterizePolygon, traceMaskOuterContour } from "../../../../src/domain/annotations/segmentation-raster.js";

describe("segmentation raster adapters", () => {
  it("round-trips COCO uncompressed RLE in column-major order", () => {
    const mask = new Uint8Array([0, 1, 0, 1, 1, 0]);
    expect(decodeCocoUncompressedRle(3, 2, encodeCocoUncompressedRle(3, 2, mask))).toEqual(mask);
  });

  it("rasterizes a polygon to the internal full-resolution mask", () => {
    const mask = rasterizePolygon(4, 4, [{ x: 0, y: 0 }, { x: 3, y: 0 }, { x: 0, y: 3 }]);
    expect(mask[1]).toBe(1);
    expect(mask[15]).toBe(0);
  });

  it("traces a pixel-edge contour for polygon-only exporters", () => {
    const contour = traceMaskOuterContour(3, 2, new Uint8Array([1, 1, 0, 1, 0, 0]));
    expect(contour).toEqual(expect.arrayContaining([{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 2 }]));
  });
});
