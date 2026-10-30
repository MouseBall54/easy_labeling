/**
 * Gray pixels as an `<img>`: an uncompressed 8-bit BMP with a gray palette, the format src-tauri hands the
 * page for native TIFFs (crates/el-core/src/bmp.rs). The browser decodes it off the UI thread and shows the
 * bytes as stored (no colour space), so it replaces building RGBA and writing it into a canvas.
 */
export function grayBmp(gray: Uint8Array, width: number, height: number): Blob {
  const headers = 14 + 40 + 256 * 4;
  const stride = (width + 3) & ~3;
  const imageSize = stride * height;
  const header = new DataView(new ArrayBuffer(headers));
  header.setUint8(0, 0x42); // "BM"
  header.setUint8(1, 0x4d);
  header.setUint32(2, headers + imageSize, true);
  header.setUint32(10, headers, true);
  header.setUint32(14, 40, true);
  header.setInt32(18, width, true);
  header.setInt32(22, -height, true); // top-down rows
  header.setUint16(26, 1, true); // planes
  header.setUint16(28, 8, true); // bits per pixel
  header.setUint32(34, imageSize, true); // BI_RGB at 30 stays 0
  header.setUint32(38, 2835, true); // 72 dpi
  header.setUint32(42, 2835, true);
  header.setUint32(46, 256, true); // palette entries
  header.setUint32(50, 256, true);
  for (let level = 0; level < 256; level += 1) {
    header.setUint8(54 + level * 4, level);
    header.setUint8(55 + level * 4, level);
    header.setUint8(56 + level * 4, level);
  }
  let rows = gray.subarray(0, width * height);
  if (stride !== width) {
    rows = new Uint8Array(imageSize);
    for (let y = 0; y < height; y += 1) rows.set(gray.subarray(y * width, (y + 1) * width), y * stride);
  }
  return new Blob([header.buffer, rows as Uint8Array<ArrayBuffer>], { type: "image/bmp" });
}

/** The gray image decoded by an `<img>` (see grayBmp). */
export async function grayImageElement(gray: Uint8Array, width: number, height: number): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(grayBmp(gray, width, height));
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** True when every alpha byte is 255: only then can an opaque gray `<img>` stand in for the RGBA. */
export function isOpaque(rgba: Uint8ClampedArray): boolean {
  if (rgba.byteOffset % 4 === 0) {
    const pixels = new Uint32Array(rgba.buffer, rgba.byteOffset, rgba.length >> 2);
    for (let index = 0; index < pixels.length; index += 1) if (pixels[index]! < 0xff000000) return false;
    return true;
  }
  for (let index = 3; index < rgba.length; index += 4) if (rgba[index] !== 255) return false;
  return true;
}
