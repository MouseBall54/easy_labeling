import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import zlib from "node:zlib";

/** SEM-like 8-bit gray pixels: bright blocks on a sloped, noisy background. */
function grayPixels(width: number, height: number, seed: number): Uint8Array {
  let state = seed;
  const random = () => ((state = (Math.imul(state, 1103515245) + 12345) >>> 0) / 4294967296);
  const pixels = new Uint8Array(width * height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const block = x % 64 > 12 && x % 64 < 52 && y % 48 > 9 && y % 48 < 40 ? 110 : 0;
      pixels[y * width + x] = Math.max(0, Math.min(255, Math.round(50 + (x * 40) / width + block + (random() - 0.5) * 40)));
    }
  }
  return pixels;
}

export function grayPng(width: number, height: number, seed = 3): Buffer {
  const pixels = grayPixels(width, height, seed);
  const raw = Buffer.alloc((width + 1) * height);
  for (let y = 0; y < height; y += 1) raw.set(pixels.subarray(y * width, (y + 1) * width), y * (width + 1) + 1);
  const chunk = (type: string, data: Buffer) => {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, "latin1"), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(zlib.crc32(body));
    return Buffer.concat([length, body, crc]);
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8; // bit depth; colour type 0 (gray)
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", header), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}

/** Uncompressed little-endian 8-bit gray TIFF, one strip (the common SEM export). */
export function grayTiff(width: number, height: number, seed = 3): Buffer {
  const entries: Array<[tag: number, type: number, value: number]> = [
    [256, 4, width], [257, 4, height], [258, 3, 8], [259, 3, 1], [262, 3, 1],
    [273, 4, 0], [277, 3, 1], [278, 4, height], [279, 4, width * height]
  ];
  const ifdSize = 2 + entries.length * 12 + 4;
  const dataOffset = 8 + ifdSize;
  entries[5]![2] = dataOffset;
  const header = Buffer.alloc(dataOffset);
  header.write("II", 0, "latin1");
  header.writeUInt16LE(42, 2);
  header.writeUInt32LE(8, 4);
  header.writeUInt16LE(entries.length, 8);
  entries.forEach(([tag, type, value], index) => {
    const at = 10 + index * 12;
    header.writeUInt16LE(tag, at);
    header.writeUInt16LE(type, at + 2);
    header.writeUInt32LE(1, at + 4);
    if (type === 3) header.writeUInt16LE(value, at + 8);
    else header.writeUInt32LE(value, at + 8);
  });
  return Buffer.concat([header, Buffer.from(grayPixels(width, height, seed))]);
}

/**
 * YOLO text with `count` boxes in the app's 15-decimal format, plus what the review must flag:
 * near-duplicate pairs, small boxes and a box outside the image.
 */
export function yoloLabels(count: number, seed: number): string {
  let state = seed;
  const random = () => ((state = (Math.imul(state, 1103515245) + 12345) >>> 0) / 4294967296);
  const columns = Math.ceil(Math.sqrt(count));
  const lines: string[] = [];
  for (let index = 0; index < count; index += 1) {
    const cx = ((index % columns) + 0.5 + (random() - 0.5) * 0.2) / columns;
    const cy = (Math.floor(index / columns) + 0.5 + (random() - 0.5) * 0.2) / columns;
    const size = index % 97 === 0 ? 0.0004 : 0.5 / columns;
    lines.push(`${index % 3} ${cx.toFixed(15)} ${cy.toFixed(15)} ${size.toFixed(15)} ${size.toFixed(15)}`);
    if (index % 53 === 0) lines.push(`${index % 3} ${(cx + 0.00001).toFixed(15)} ${cy.toFixed(15)} ${size.toFixed(15)} ${size.toFixed(15)}`);
  }
  lines.push("1 0.999000000000000 0.500000000000000 0.010000000000000 0.010000000000000");
  return `${lines.join("\n")}\n`;
}

/** A folder of `images` SEM-sized images (`format`) with `boxes`-box labels in label/. */
export async function writeReviewDataset(folder: string, options: { images: number; boxes: number; format: "png" | "tif"; width?: number; height?: number }): Promise<void> {
  const { width = 2048, height = 1536 } = options;
  await mkdir(path.join(folder, "label"), { recursive: true });
  const image = options.format === "png" ? grayPng(width, height) : grayTiff(width, height);
  for (let index = 0; index < options.images; index += 1) {
    const name = `img_${String(index).padStart(3, "0")}`;
    await writeFile(path.join(folder, `${name}.${options.format}`), image);
    await writeFile(path.join(folder, "label", `${name}.txt`), yoloLabels(options.boxes, index + 1));
  }
}

/** `jpeg` with an EXIF APP1 segment carrying `orientation` (6 and 8 make browsers swap width and height). */
export function withExifOrientation(jpeg: Buffer, orientation: number): Buffer {
  const tiff = Buffer.alloc(8 + 2 + 12 + 4);
  tiff.write("MM", 0, "latin1");
  tiff.writeUInt16BE(42, 2);
  tiff.writeUInt32BE(8, 4);
  tiff.writeUInt16BE(1, 8);
  tiff.writeUInt16BE(0x0112, 10);
  tiff.writeUInt16BE(3, 12);
  tiff.writeUInt32BE(1, 14);
  tiff.writeUInt16BE(orientation, 18);
  const body = Buffer.concat([Buffer.from("Exif\0\0", "latin1"), tiff]);
  const segment = Buffer.alloc(4);
  segment.writeUInt16BE(0xffe1, 0);
  segment.writeUInt16BE(body.length + 2, 2);
  return Buffer.concat([jpeg.subarray(0, 2), segment, body, jpeg.subarray(2)]);
}

/** A PNG with an eXIf chunk (orientation 1) before its image data: Rust leaves such sizes to the browser decoder. */
export function withPngExif(png: Buffer): Buffer {
  const exif = Buffer.from([0x4d, 0x4d, 0, 42, 0, 0, 0, 8, 0, 1, 0x01, 0x12, 0, 3, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0]);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(exif.length);
  const body = Buffer.concat([Buffer.from("eXIf", "latin1"), exif]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(zlib.crc32(body));
  const idat = png.indexOf(Buffer.from("IDAT", "latin1")) - 4;
  return Buffer.concat([png.subarray(0, idat), length, body, crc, png.subarray(idat)]);
}
