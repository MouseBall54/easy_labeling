import { afterEach, describe, expect, it, vi } from "vitest";

import { createNativeImageData } from "../../../src/bootstrap/automation-controller.js";

class TestImageData {
  constructor(
    readonly data: Uint8ClampedArray,
    readonly width: number,
    readonly height: number
  ) {}
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("automation controller processed input", () => {
  it("creates a native ImageData-shaped copy for a processed template image", () => {
    vi.stubGlobal("ImageData", TestImageData);
    const source = new Uint8ClampedArray([1, 2, 3, 4, 5, 6, 7, 8]);

    const imageData = createNativeImageData(source, 2, 1);

    expect(imageData).toBeInstanceOf(TestImageData);
    expect(imageData.data).toEqual(source);
    expect(imageData.data).not.toBe(source);
    expect(imageData.width).toBe(2);
    expect(imageData.height).toBe(1);
  });
});
