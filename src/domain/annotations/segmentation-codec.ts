import type { AnnotationCodec, AnnotationDocument } from "./contracts.js";
import { resolveAnnotationAssetPaths } from "./paths.js";
import type { SegmentationDocumentSnapshot, SegmentationTool } from "../../features/segmentation/types.js";

export interface SegmentationAnnotationMetadata {
  format: "segmentation-raster-v1";
  activeClassId: string;
  activeTool: SegmentationTool;
  overlayVisible: boolean;
  overlayOpacity: number;
  hiddenClassIds: string[];
  brushRadius: number;
}

export interface SegmentationAnnotationData {
  pngBytes: Uint8Array;
  metadata: SegmentationAnnotationMetadata;
  snapshot: SegmentationDocumentSnapshot;
}

export interface SegmentationAnnotationDocument extends AnnotationDocument<SegmentationAnnotationData> {
  workflow: "segmentation";
  format: "segmentation-raster-v1";
}

export interface SegmentationAnnotationReadInput {
  imageBaseName: string;
  pngBytes: Uint8Array | ArrayBuffer;
  metadataText?: string | null;
}

export interface SegmentationAnnotationWriteInput {
  imageBaseName: string;
  snapshot: SegmentationDocumentSnapshot;
}

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

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
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
    const header = new Uint8Array(5 + blockLength);
    header[0] = isFinal ? 0x01 : 0x00;
    header[1] = blockLength & 0xff;
    header[2] = (blockLength >>> 8) & 0xff;
    const nlen = (~blockLength) & 0xffff;
    header[3] = nlen & 0xff;
    header[4] = (nlen >>> 8) & 0xff;
    header.set(data.subarray(offset, offset + blockLength), 5);
    chunks.push(header);
    offset += blockLength;
  }
  chunks.push(writeUint32(computeAdler32(data)));
  return concatBytes(chunks);
}

function readUint32(data: Uint8Array, offset: number): number {
  return ((data[offset] ?? 0) << 24) |
    ((data[offset + 1] ?? 0) << 16) |
    ((data[offset + 2] ?? 0) << 8) |
    (data[offset + 3] ?? 0);
}

function inflateStoredZlib(data: Uint8Array): Uint8Array {
  if (data.length < 6) {
    throw new Error("invalid zlib payload");
  }
  let offset = 2;
  const chunks: Uint8Array[] = [];
  while (offset < data.length - 4) {
    const header = data[offset] ?? 0;
    const finalBlock = (header & 0x01) === 0x01;
    const blockType = (header >>> 1) & 0x03;
    if (blockType !== 0) {
      throw new Error("unsupported png compression block");
    }
    const len = (data[offset + 1] ?? 0) | ((data[offset + 2] ?? 0) << 8);
    const start = offset + 5;
    const end = start + len;
    chunks.push(data.subarray(start, end));
    offset = end;
    if (finalBlock) {
      break;
    }
  }
  return concatBytes(chunks);
}

function encodeMaskPixels(snapshot: SegmentationDocumentSnapshot): Uint8Array {
  const rowStride = (snapshot.width * 4) + 1;
  const bytes = new Uint8Array(rowStride * snapshot.height);
  let offset = 0;
  for (let y = 0; y < snapshot.height; y += 1) {
    bytes[offset] = 0;
    offset += 1;
    for (let x = 0; x < snapshot.width; x += 1) {
      const classId = snapshot.mask[(y * snapshot.width) + x] ?? 0;
      bytes[offset] = (classId >>> 8) & 0xff;
      bytes[offset + 1] = classId & 0xff;
      bytes[offset + 2] = 0;
      bytes[offset + 3] = classId === 0 ? 0 : 255;
      offset += 4;
    }
  }
  return bytes;
}

function decodeMaskPixels(width: number, height: number, bytes: Uint8Array): Uint16Array {
  const expectedLength = ((width * 4) + 1) * height;
  if (bytes.length !== expectedLength) {
    throw new Error("segmentation png dimensions do not match payload");
  }
  const mask = new Uint16Array(width * height);
  let offset = 0;
  for (let y = 0; y < height; y += 1) {
    const filterType = bytes[offset] ?? 0;
    if (filterType !== 0) {
      throw new Error("unsupported png filter type");
    }
    offset += 1;
    for (let x = 0; x < width; x += 1) {
      const high = bytes[offset] ?? 0;
      const low = bytes[offset + 1] ?? 0;
      const alpha = bytes[offset + 3] ?? 0;
      mask[(y * width) + x] = alpha === 0 ? 0 : ((high << 8) | low);
      offset += 4;
    }
  }
  return mask;
}

function createMetadata(snapshot: SegmentationDocumentSnapshot): SegmentationAnnotationMetadata {
  return {
    format: "segmentation-raster-v1",
    activeClassId: snapshot.activeClassId,
    activeTool: snapshot.activeTool,
    overlayVisible: snapshot.overlayVisible,
    overlayOpacity: snapshot.overlayOpacity,
    hiddenClassIds: [...snapshot.hiddenClassIds].sort((left, right) => left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" })),
    brushRadius: snapshot.brushRadius
  };
}

function normalizeMetadata(input: string | null | undefined): SegmentationAnnotationMetadata | null {
  if (!input) {
    return null;
  }
  try {
    const parsed = JSON.parse(input) as Partial<SegmentationAnnotationMetadata> | null;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    return {
      format: "segmentation-raster-v1",
      activeClassId: typeof parsed.activeClassId === "string" && parsed.activeClassId.trim().length > 0 ? parsed.activeClassId : "1",
      activeTool: parsed.activeTool === "erase" ? "erase" : "brush",
      overlayVisible: typeof parsed.overlayVisible === "boolean" ? parsed.overlayVisible : true,
      overlayOpacity: typeof parsed.overlayOpacity === "number" ? Math.min(1, Math.max(0, parsed.overlayOpacity)) : 0.6,
      hiddenClassIds: Array.isArray(parsed.hiddenClassIds)
        ? parsed.hiddenClassIds.filter((value): value is string => typeof value === "string")
        : [],
      brushRadius: typeof parsed.brushRadius === "number" && Number.isFinite(parsed.brushRadius)
        ? Math.max(1, Math.round(parsed.brushRadius))
        : 6
    };
  } catch {
    return null;
  }
}

export function encodeSegmentationMaskPng(snapshot: SegmentationDocumentSnapshot): Uint8Array {
  const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = new Uint8Array(13);
  ihdr.set(writeUint32(snapshot.width), 0);
  ihdr.set(writeUint32(snapshot.height), 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const pixelBytes = encodeMaskPixels(snapshot);
  const idat = createStoredZlib(pixelBytes);
  return concatBytes([
    signature,
    createChunk("IHDR", ihdr),
    createChunk("IDAT", idat),
    createChunk("IEND", new Uint8Array())
  ]);
}

export function decodeSegmentationMaskPng(input: Uint8Array | ArrayBuffer): { width: number; height: number; mask: Uint16Array } {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  signature.forEach((value, index) => {
    if (bytes[index] !== value) {
      throw new Error("invalid segmentation png signature");
    }
  });

  let width = 0;
  let height = 0;
  const idatChunks: Uint8Array[] = [];
  let offset = 8;
  while (offset < bytes.length) {
    const length = readUint32(bytes, offset) >>> 0;
    const type = new TextDecoder().decode(bytes.subarray(offset + 4, offset + 8));
    const data = bytes.subarray(offset + 8, offset + 8 + length);
    offset += 12 + length;
    if (type === "IHDR") {
      width = readUint32(data, 0) >>> 0;
      height = readUint32(data, 4) >>> 0;
    } else if (type === "IDAT") {
      idatChunks.push(data);
    } else if (type === "IEND") {
      break;
    }
  }
  if (width <= 0 || height <= 0) {
    throw new Error("invalid segmentation png dimensions");
  }
  const inflated = inflateStoredZlib(concatBytes(idatChunks));
  return {
    width,
    height,
    mask: decodeMaskPixels(width, height, inflated)
  };
}

export function createSegmentationAnnotationCodec(): AnnotationCodec<
  SegmentationAnnotationReadInput,
  SegmentationAnnotationWriteInput,
  SegmentationAnnotationDocument
> {
  return {
    workflow: "segmentation",

    resolvePaths(imageBaseName: string) {
      return resolveAnnotationAssetPaths("segmentation", imageBaseName);
    },

    decode(input: SegmentationAnnotationReadInput): SegmentationAnnotationDocument {
      const paths = resolveAnnotationAssetPaths("segmentation", input.imageBaseName);
      const decoded = decodeSegmentationMaskPng(input.pngBytes);
      const metadata = normalizeMetadata(input.metadataText) ?? {
        format: "segmentation-raster-v1",
        activeClassId: "1",
        activeTool: "brush",
        overlayVisible: true,
        overlayOpacity: 0.6,
        hiddenClassIds: [],
        brushRadius: 6
      };
      const snapshot: SegmentationDocumentSnapshot = {
        width: decoded.width,
        height: decoded.height,
        mask: decoded.mask,
        activeClassId: metadata.activeClassId,
        activeTool: metadata.activeTool,
        overlayVisible: metadata.overlayVisible,
        overlayOpacity: metadata.overlayOpacity,
        hiddenClassIds: new Set(metadata.hiddenClassIds),
        brushRadius: metadata.brushRadius
      };
      return {
        workflow: "segmentation",
        format: "segmentation-raster-v1",
        paths,
        data: {
          pngBytes: input.pngBytes instanceof Uint8Array ? new Uint8Array(input.pngBytes) : new Uint8Array(input.pngBytes),
          metadata,
          snapshot
        }
      };
    },

    encode(input: SegmentationAnnotationWriteInput) {
      const paths = resolveAnnotationAssetPaths("segmentation", input.imageBaseName);
      const metadata = createMetadata(input.snapshot);
      return [
        {
          path: paths.primaryFilePath,
          content: toArrayBuffer(encodeSegmentationMaskPng(input.snapshot))
        },
        {
          path: paths.sidecarFilePaths[0] ?? `${paths.primaryFilePath}.seg.json`,
          content: JSON.stringify(metadata, null, 2)
        }
      ];
    }
  };
}
