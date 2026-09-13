import { describe, expect, it } from "vitest";

import {
  getWorkingImageScale,
  isOriginalPointInWorkingImage,
  originalPointToWorking,
  workingMaskToOriginal,
  workingPointToOriginal,
  workingRectToOriginal
} from "../../../../src/features/segmentation/working-image.js";

const srX2 = {
  source: "sr-roi" as const,
  width: 2048,
  height: 2048,
  originalWidth: 1024,
  originalHeight: 1024,
  cacheKey: "image-1:sr:x2"
};

const srX4 = {
  ...srX2,
  width: 4096,
  height: 4096,
  cacheKey: "image-1:sr:x4"
};

describe("segmentation working image coordinates", () => {
  it("maps SR x2 points to Original coordinates without inline scale factors", () => {
    expect(getWorkingImageScale(srX2)).toEqual({ x: 2, y: 2 });
    expect(workingPointToOriginal({ x: 1200, y: 600 }, srX2)).toEqual({ x: 600, y: 300 });
    expect(originalPointToWorking({ x: 600, y: 300 }, srX2)).toEqual({ x: 1200, y: 600 });
  });

  it("maps SR x4 points to Original coordinates through the same descriptor contract", () => {
    expect(getWorkingImageScale(srX4)).toEqual({ x: 4, y: 4 });
    expect(workingPointToOriginal({ x: 2400, y: 1200 }, srX4)).toEqual({ x: 600, y: 300 });
    expect(originalPointToWorking({ x: 600, y: 300 }, srX4)).toEqual({ x: 2400, y: 1200 });
  });

  it("restores working rectangles and masks at Original dimensions", () => {
    expect(workingRectToOriginal({ x: 200, y: 100, width: 400, height: 300 }, srX2))
      .toEqual({ x: 100, y: 50, width: 200, height: 150 });

    const descriptor = { ...srX2, width: 4, height: 4, originalWidth: 2, originalHeight: 2 };
    const mask = new Uint8Array([
      0, 0, 1, 1,
      0, 0, 1, 1,
      1, 1, 0, 0,
      1, 1, 0, 0
    ]);
    expect(workingMaskToOriginal({ descriptor, mask })).toEqual(new Uint8Array([0, 1, 1, 0]));
  });

  it("maps SR ROI points and masks into the ROI position on the Original image", () => {
    const descriptor = {
      source: "sr-roi" as const,
      width: 4,
      height: 4,
      originalWidth: 6,
      originalHeight: 5,
      originalRoi: { x: 2, y: 1, width: 2, height: 2 },
      cacheKey: "image-1:roi:2,1,2,2:sr:x2"
    };

    expect(getWorkingImageScale(descriptor)).toEqual({ x: 2, y: 2 });
    expect(originalPointToWorking({ x: 3, y: 1.5 }, descriptor)).toEqual({ x: 2, y: 1 });
    expect(workingPointToOriginal({ x: 2, y: 1 }, descriptor)).toEqual({ x: 3, y: 1.5 });
    expect(isOriginalPointInWorkingImage({ x: 3, y: 2 }, descriptor)).toBe(true);
    expect(isOriginalPointInWorkingImage({ x: 1, y: 2 }, descriptor)).toBe(false);

    const restored = workingMaskToOriginal({ descriptor, mask: new Uint8Array(16).fill(1) });
    expect(Array.from(restored)).toEqual([
      0, 0, 0, 0, 0, 0,
      0, 0, 1, 1, 0, 0,
      0, 0, 1, 1, 0, 0,
      0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0
    ]);
  });

  it("derives a 600x400 x2 working ROI from a 300x200 Original ROI", () => {
    const descriptor = {
      source: "sr-roi" as const,
      width: 600,
      height: 400,
      originalWidth: 1000,
      originalHeight: 800,
      originalRoi: { x: 100, y: 150, width: 300, height: 200 },
      cacheKey: "image-1:roi:100,150,300,200:sr:cfsr-x2"
    };

    expect(getWorkingImageScale(descriptor)).toEqual({ x: 2, y: 2 });
    expect(workingPointToOriginal({ x: 200, y: 100 }, descriptor)).toEqual({ x: 200, y: 200 });
  });

  it("keeps same-resolution restoration ROI coordinates and restores its mask to Original", () => {
    const descriptor = {
      source: "sr-roi" as const,
      width: 3,
      height: 2,
      originalWidth: 7,
      originalHeight: 5,
      originalRoi: { x: 2, y: 1, width: 3, height: 2 },
      cacheKey: "image-1:roi:2,1,3,2:sr:tk-r-em-hrsem"
    };

    expect(getWorkingImageScale(descriptor)).toEqual({ x: 1, y: 1 });
    expect(originalPointToWorking({ x: 4, y: 2 }, descriptor)).toEqual({ x: 2, y: 1 });
    expect(workingPointToOriginal({ x: 2, y: 1 }, descriptor)).toEqual({ x: 4, y: 2 });
    const restored = workingMaskToOriginal({ descriptor, mask: new Uint8Array(6).fill(1) });
    expect(restored).toHaveLength(35);
    expect(restored.reduce((sum, value) => sum + value, 0)).toBe(6);
  });
});
