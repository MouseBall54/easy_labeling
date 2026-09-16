import type { AnnotationCodec, AnnotationDocument } from "./contracts.js";
import { resolveAnnotationAssetPaths } from "./paths.js";
import type { SegmentationDocumentSnapshot, SegmentationTool } from "../../features/segmentation/types.js";
import { createSemanticAnnotationModel, type InternalSegmentationAnnotationModel } from "./segmentation-model.js";

export interface SegmentationAnnotationMetadata {
  format?: string;
  activeClassId: string;
  activeTool: SegmentationTool;
  overlayVisible: boolean;
  overlayOpacity: number;
  hiddenClassIds: string[];
  brushRadius: number;
}

export interface SegmentationAnnotationData {
  pngBytes: Uint8Array;
  snapshot: SegmentationDocumentSnapshot;
  model: InternalSegmentationAnnotationModel;
  legacyMetadata: SegmentationAnnotationMetadata | null;
}

export interface SegmentationAnnotationDocument extends AnnotationDocument<SegmentationAnnotationData> {
  workflow: "segmentation";
  format: "segmentation-semantic-mask-v2";
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

function concatBytes(chunks: readonly Uint8Array[]): Uint8Array<ArrayBuffer> {
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

function readUint32(data: Uint8Array, offset: number): number {
  return ((data[offset] ?? 0) << 24) |
    ((data[offset + 1] ?? 0) << 16) |
    ((data[offset + 2] ?? 0) << 8) |
    (data[offset + 3] ?? 0);
}

// PNG's IDAT payload is a zlib stream (RFC 1950): a 2-byte header, DEFLATE
// blocks, then an Adler-32 trailer. The "deflate" compression-stream format
// is exactly that, so we can hand it our raw pixel bytes and get a
// spec-correct, natively-compressed IDAT body back with no hand-rolled
// DEFLATE/Adler-32 code. It replaces the old hand-rolled "stored" (i.e.
// uncompressed) zlib writer, which spent ~400ms per 3072x2048 mask almost
// entirely in per-byte Adler-32/CRC-32 loops over ~12MB of uncompressed data.
async function deflateCompress(data: Uint8Array<ArrayBuffer>): Promise<Uint8Array> {
  const stream = new Blob([data]).stream().pipeThrough(new CompressionStream("deflate"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

// Real DEFLATE decompression is a strict superset of the old hand-rolled
// "stored block only" reader, so this transparently reads both mask.png
// files written by the previous (uncompressed) encoder and ones written by
// deflateCompress above.
async function deflateDecompress(data: Uint8Array<ArrayBuffer>): Promise<Uint8Array> {
  const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function encodeSemanticMaskPixels16(snapshot: SegmentationDocumentSnapshot): Uint8Array<ArrayBuffer> {
  const rowStride = (snapshot.width * 2) + 1;
  const bytes = new Uint8Array(rowStride * snapshot.height);
  let offset = 0;
  for (let y = 0; y < snapshot.height; y += 1) {
    bytes[offset] = 0;
    offset += 1;
    for (let x = 0; x < snapshot.width; x += 1) {
      const classId = snapshot.mask[(y * snapshot.width) + x] ?? 0;
      bytes[offset] = (classId >>> 8) & 0xff;
      bytes[offset + 1] = classId & 0xff;
      offset += 2;
    }
  }
  return bytes;
}

function decodeSemanticMaskPixels16(width: number, height: number, bytes: Uint8Array): Uint16Array {
  const expectedLength = ((width * 2) + 1) * height;
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
      mask[(y * width) + x] = (high << 8) | low;
      offset += 2;
    }
  }
  return mask;
}

function decodeSemanticMaskPixels8(width: number, height: number, bytes: Uint8Array): Uint16Array {
  const expectedLength = (width + 1) * height;
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
      mask[(y * width) + x] = bytes[offset] ?? 0;
      offset += 1;
    }
  }
  return mask;
}

function decodeLegacyRgbaMaskPixels8(width: number, height: number, bytes: Uint8Array): Uint16Array {
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
      format: typeof parsed.format === "string" ? parsed.format : undefined,
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

export async function encodeSegmentationMaskPng(snapshot: SegmentationDocumentSnapshot): Promise<Uint8Array> {
  const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = new Uint8Array(13);
  ihdr.set(writeUint32(snapshot.width), 0);
  ihdr.set(writeUint32(snapshot.height), 4);
  ihdr[8] = 16;
  ihdr[9] = 0;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const pixelBytes = encodeSemanticMaskPixels16(snapshot);
  const idat = await deflateCompress(pixelBytes);
  return concatBytes([
    signature,
    createChunk("IHDR", ihdr),
    createChunk("IDAT", idat),
    createChunk("IEND", new Uint8Array())
  ]);
}

export async function decodeSegmentationMaskPng(input: Uint8Array | ArrayBuffer): Promise<{ width: number; height: number; mask: Uint16Array; isLegacyRgba: boolean }> {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  signature.forEach((value, index) => {
    if (bytes[index] !== value) {
      throw new Error("invalid segmentation png signature");
    }
  });

  let width = 0;
  let height = 0;
  let bitDepth = -1;
  let colorType = -1;
  let compressionMethod = -1;
  let filterMethod = -1;
  let interlaceMethod = -1;
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
      bitDepth = data[8] ?? -1;
      colorType = data[9] ?? -1;
      compressionMethod = data[10] ?? -1;
      filterMethod = data[11] ?? -1;
      interlaceMethod = data[12] ?? -1;
    } else if (type === "IDAT") {
      idatChunks.push(data);
    } else if (type === "IEND") {
      break;
    }
  }
  if (width <= 0 || height <= 0) {
    throw new Error("invalid segmentation png dimensions");
  }
  if (compressionMethod !== 0 || filterMethod !== 0 || interlaceMethod !== 0) {
    throw new Error("unsupported segmentation png encoding");
  }
  const inflated = await deflateDecompress(concatBytes(idatChunks));
  if (colorType === 0 && bitDepth === 16) {
    return {
      width,
      height,
      mask: decodeSemanticMaskPixels16(width, height, inflated),
      isLegacyRgba: false
    };
  }
  if (colorType === 0 && bitDepth === 8) {
    return {
      width,
      height,
      mask: decodeSemanticMaskPixels8(width, height, inflated),
      isLegacyRgba: false
    };
  }
  if (colorType === 6 && bitDepth === 8) {
    return {
      width,
      height,
      mask: decodeLegacyRgbaMaskPixels8(width, height, inflated),
      isLegacyRgba: true
    };
  }
  throw new Error("unsupported segmentation png color format");
}

function createDefaultViewState(): Pick<
  SegmentationDocumentSnapshot,
  "activeClassId" | "activeTool" | "overlayVisible" | "overlayOpacity" | "hiddenClassIds" | "brushRadius"
> {
  return {
    activeClassId: "1",
    activeTool: "brush",
    overlayVisible: true,
    overlayOpacity: 0.6,
    hiddenClassIds: new Set<string>(),
    brushRadius: 6
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

    async decode(input: SegmentationAnnotationReadInput): Promise<SegmentationAnnotationDocument> {
      const paths = resolveAnnotationAssetPaths("segmentation", input.imageBaseName);
      const decoded = await decodeSegmentationMaskPng(input.pngBytes);
      const metadata = decoded.isLegacyRgba
        ? normalizeMetadata(input.metadataText)
        : null;
      const defaults = createDefaultViewState();
      const snapshot: SegmentationDocumentSnapshot = {
        width: decoded.width,
        height: decoded.height,
        mask: decoded.mask,
        activeClassId: metadata?.activeClassId ?? defaults.activeClassId,
        activeTool: metadata?.activeTool ?? defaults.activeTool,
        overlayVisible: metadata?.overlayVisible ?? defaults.overlayVisible,
        overlayOpacity: metadata?.overlayOpacity ?? defaults.overlayOpacity,
        hiddenClassIds: new Set(metadata?.hiddenClassIds ?? defaults.hiddenClassIds),
        brushRadius: metadata?.brushRadius ?? defaults.brushRadius
      };
      return {
        workflow: "segmentation",
        format: "segmentation-semantic-mask-v2",
        paths,
        data: {
          pngBytes: input.pngBytes instanceof Uint8Array ? new Uint8Array(input.pngBytes) : new Uint8Array(input.pngBytes),
          snapshot,
          model: createSemanticAnnotationModel({
            imageId: input.imageBaseName,
            imagePath: paths.primaryFilePath,
            snapshot
          }),
          legacyMetadata: decoded.isLegacyRgba ? metadata : null
        }
      };
    },

    async encode(input: SegmentationAnnotationWriteInput) {
      const paths = resolveAnnotationAssetPaths("segmentation", input.imageBaseName);
      return [
        {
          path: paths.primaryFilePath,
          content: toArrayBuffer(await encodeSegmentationMaskPng(input.snapshot))
        }
      ];
    }
  };
}
