import { describe, expect, it } from "vitest";
import { grayBmp, isOpaque } from "../../../../src/features/images/gray-image.js";

describe("gray image", () => {
  it("writes a top-down 8-bit gray-palette BMP like crates/el-core/src/bmp.rs, padding rows to 4 bytes", async () => {
    const bytes = new Uint8Array(await grayBmp(new Uint8Array([1, 2, 3, 4, 5, 6]), 3, 2).arrayBuffer());
    const view = new DataView(bytes.buffer);
    const headers = 14 + 40 + 1024;
    expect(String.fromCharCode(bytes[0]!, bytes[1]!)).toBe("BM");
    expect(view.getUint32(2, true)).toBe(headers + 8);
    expect(view.getUint32(10, true)).toBe(headers);
    expect(view.getInt32(18, true)).toBe(3);
    expect(view.getInt32(22, true)).toBe(-2);
    expect(view.getUint16(28, true)).toBe(8);
    expect(view.getUint32(30, true)).toBe(0);
    expect(view.getUint32(34, true)).toBe(8);
    expect(view.getUint32(46, true)).toBe(256);
    expect([...bytes.slice(54 + 200 * 4, 54 + 201 * 4)]).toEqual([200, 200, 200, 0]);
    expect([...bytes.slice(headers)]).toEqual([1, 2, 3, 0, 4, 5, 6, 0]);
  });

  it("keeps unpadded rows as they are", async () => {
    const bytes = new Uint8Array(await grayBmp(new Uint8Array([9, 8, 7, 6, 5, 4, 3, 2]), 4, 2).arrayBuffer());
    expect([...bytes.slice(14 + 40 + 1024)]).toEqual([9, 8, 7, 6, 5, 4, 3, 2]);
  });

  it("tells opaque RGBA from RGBA with any transparent pixel", () => {
    expect(isOpaque(new Uint8ClampedArray([1, 2, 3, 255, 4, 5, 6, 255]))).toBe(true);
    expect(isOpaque(new Uint8ClampedArray([1, 2, 3, 255, 4, 5, 6, 254]))).toBe(false);
    expect(isOpaque(new Uint8ClampedArray(new ArrayBuffer(13), 1, 8).fill(255))).toBe(true);
    expect(isOpaque(new Uint8ClampedArray([255, 255, 255, 0]))).toBe(false);
  });
});
