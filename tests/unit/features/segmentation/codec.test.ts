import { describe, expect, it } from "vitest";

import { createSegmentationAnnotationCodec, decodeSegmentationMaskPng } from "../../../../src/domain/annotations/segmentation-codec.js";

function createCrc32Table(): Uint32Array {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let crc = index;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 1) === 1 ? (0xedb88320 ^ (crc >>> 1)) : (crc >>> 1);
    }
    table[index] = crc >>> 0;
  }
  return table;
}

const CRC32_TABLE = createCrc32Table();

function computeCrc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc = CRC32_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function computeAdler32(data: Uint8Array): number {
  let a = 1;
  let b = 0;
  for (const byte of data) {
    a = (a + byte) % 65521;
    b = (b + a) % 65521;
  }
  return ((b << 16) | a) >>> 0;
}

function writeUint32(value: number): Uint8Array {
  return new Uint8Array([
    (value >>> 24) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 8) & 0xff,
    value & 0xff
  ]);
}

function concatBytes(chunks: readonly Uint8Array[]): Uint8Array {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  chunks.forEach((chunk) => {
    result.set(chunk, offset);
    offset += chunk.length;
  });
  return result;
}

function createChunk(type: string, data: Uint8Array): Uint8Array {
  const typeBytes = new TextEncoder().encode(type);
  const crc = computeCrc32(concatBytes([typeBytes, data]));
  return concatBytes([writeUint32(data.length), typeBytes, data, writeUint32(crc)]);
}

function createStoredZlib(data: Uint8Array): Uint8Array {
  const chunks: Uint8Array[] = [new Uint8Array([0x78, 0x01])];
  let offset = 0;
  while (offset < data.length) {
    const remaining = data.length - offset;
    const blockLength = Math.min(65535, remaining);
    const isFinal = offset + blockLength >= data.length;
    const block = new Uint8Array(5 + blockLength);
    block[0] = isFinal ? 0x01 : 0x00;
    block[1] = blockLength & 0xff;
    block[2] = (blockLength >>> 8) & 0xff;
    const nlen = (~blockLength) & 0xffff;
    block[3] = nlen & 0xff;
    block[4] = (nlen >>> 8) & 0xff;
    block.set(data.subarray(offset, offset + blockLength), 5);
    chunks.push(block);
    offset += blockLength;
  }
  chunks.push(writeUint32(computeAdler32(data)));
  return concatBytes(chunks);
}

function encodeLegacyRgbaMaskPng(width: number, height: number, mask: Uint16Array): Uint8Array {
  const rowStride = (width * 4) + 1;
  const bytes = new Uint8Array(rowStride * height);
  let offset = 0;
  for (let y = 0; y < height; y += 1) {
    bytes[offset] = 0;
    offset += 1;
    for (let x = 0; x < width; x += 1) {
      const classId = mask[(y * width) + x] ?? 0;
      bytes[offset] = (classId >>> 8) & 0xff;
      bytes[offset + 1] = classId & 0xff;
      bytes[offset + 2] = 0;
      bytes[offset + 3] = classId === 0 ? 0 : 255;
      offset += 4;
    }
  }

  const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = new Uint8Array(13);
  ihdr.set(writeUint32(width), 0);
  ihdr.set(writeUint32(height), 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return concatBytes([
    signature,
    createChunk("IHDR", ihdr),
    createChunk("IDAT", createStoredZlib(bytes)),
    createChunk("IEND", new Uint8Array())
  ]);
}

describe("domain/annotations/segmentation-codec", () => {
  it("encodes semantic masks as a single png and defaults UI state without sidecar metadata", () => {
    const codec = createSegmentationAnnotationCodec();
    const snapshot = {
      width: 2,
      height: 2,
      mask: new Uint16Array([0, 12, 34, 0]),
      activeClassId: "34",
      activeTool: "erase" as const,
      overlayVisible: false,
      overlayOpacity: 0.25,
      hiddenClassIds: new Set<string>(["12"]),
      brushRadius: 3
    };

    const assets = codec.encode({ imageBaseName: "scene-a", snapshot });
    expect(assets[0]).toMatchObject({ path: "mask/scene-a.png" });
    expect(assets).toHaveLength(1);

    const decoded = codec.decode({
      imageBaseName: "scene-a",
      pngBytes: assets[0]?.content as ArrayBuffer
    });

    expect(decoded.data.snapshot.mask).toEqual(snapshot.mask);
    expect(decoded.data.snapshot.activeClassId).toBe("1");
    expect(decoded.data.snapshot.activeTool).toBe("brush");
    expect(decoded.data.snapshot.overlayVisible).toBe(true);
    expect(decoded.data.snapshot.overlayOpacity).toBe(0.6);
    expect(decoded.data.snapshot.hiddenClassIds).toEqual(new Set<string>());
    expect(decoded.data.snapshot.brushRadius).toBe(6);

    const encodedMask = decodeSegmentationMaskPng(assets[0]?.content as ArrayBuffer);
    expect(encodedMask.isLegacyRgba).toBe(false);
    expect(encodedMask.mask).toEqual(snapshot.mask);
  });

  it("loads legacy RGBA masks and applies optional legacy sidecar metadata", () => {
    const codec = createSegmentationAnnotationCodec();
    const mask = new Uint16Array([0, 7, 512, 0]);
    const legacyPng = encodeLegacyRgbaMaskPng(2, 2, mask);

    const decoded = codec.decode({
      imageBaseName: "scene-legacy",
      pngBytes: legacyPng,
      metadataText: JSON.stringify({
        activeClassId: "7",
        activeTool: "erase",
        overlayVisible: false,
        overlayOpacity: 0.3,
        hiddenClassIds: ["7"],
        brushRadius: 11
      })
    });

    expect(decoded.data.snapshot.mask).toEqual(mask);
    expect(decoded.data.snapshot.activeClassId).toBe("7");
    expect(decoded.data.snapshot.activeTool).toBe("erase");
    expect(decoded.data.snapshot.overlayVisible).toBe(false);
    expect(decoded.data.snapshot.overlayOpacity).toBe(0.3);
    expect(decoded.data.snapshot.hiddenClassIds).toEqual(new Set<string>(["7"]));
    expect(decoded.data.snapshot.brushRadius).toBe(11);
    expect(decoded.data.legacyMetadata?.activeClassId).toBe("7");
  });
});
