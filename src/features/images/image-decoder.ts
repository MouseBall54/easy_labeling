import { readFileArrayBuffer } from "../../platform/file-system-access.js";
import type { FileHandleLike } from "../../types/files.js";

interface TiffDecodedCanvas {
  toBlob(callback: (blob: Blob | null) => void, type?: string): void;
}

interface TiffInstanceLike {
  toCanvas(): TiffDecodedCanvas;
}

interface TiffConstructorLike {
  new (input: { buffer: ArrayBuffer }): TiffInstanceLike;
  initialize?(options: { TOTAL_MEMORY: number }): void;
}

// tiff.js (Emscripten) defaults to a 16MB heap, which the decoded RGBA raster
// alone exceeds for anything around 2000x2000+ (width*height*4 bytes),
// crashing with "offset is out of bounds" regardless of file compression.
// Raise it once, before the first decode, to a size that comfortably covers
// large scan/microscopy images.
// ponytail: fixed 256MB ceiling, not dynamic per-file-size; revisit if TIFFs
// bigger than roughly 8000x8000 need support.
const TIFF_DECODER_HEAP_BYTES = 256 * 1024 * 1024;

export interface ImageDecoderUrlRuntime {
  createObjectURL(object: Blob | MediaSource): string;
  revokeObjectURL(url: string): void;
}

function isTiffConstructor(value: unknown): value is TiffConstructorLike {
  return typeof value === "function";
}

async function loadImageElementFromUrl(url: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = url;
  try {
    await image.decode();
  } catch (decodeError) {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(decodeError instanceof Error ? decodeError : new Error("Failed to decode image"));
    });
  }
  return image;
}

async function loadImageElementFromBlobSource(
  toBlob: (callback: (blob: Blob | null) => void, type?: string) => void,
  urlRuntime: ImageDecoderUrlRuntime
): Promise<HTMLImageElement> {
  const blob = await new Promise<Blob | null>((resolve) => toBlob(resolve, "image/png"));
  if (!blob) {
    throw new Error("Failed to encode decoded TIFF as a blob");
  }
  const objectUrl = urlRuntime.createObjectURL(blob);
  try {
    return await loadImageElementFromUrl(objectUrl);
  } finally {
    urlRuntime.revokeObjectURL(objectUrl);
  }
}

export function createImageDecoder(input: {
  tiffRef: unknown;
  urlRuntime: ImageDecoderUrlRuntime;
}): (fileHandle: FileHandleLike) => Promise<HTMLImageElement> {
  let tiffHeapInitialized = false;

  return async (fileHandle) => {
    if (/\.(tif|tiff)$/i.test(fileHandle.name)) {
      if (!isTiffConstructor(input.tiffRef)) {
        throw new Error("TIFF decoder is unavailable");
      }
      if (!tiffHeapInitialized) {
        input.tiffRef.initialize?.({ TOTAL_MEMORY: TIFF_DECODER_HEAP_BYTES });
        tiffHeapInitialized = true;
      }
      const buffer = await readFileArrayBuffer(fileHandle);
      const decoded = new input.tiffRef({ buffer }).toCanvas();
      return loadImageElementFromBlobSource((callback, type) => decoded.toBlob(callback, type), input.urlRuntime);
    }

    const file = await fileHandle.getFile();
    const objectUrl = input.urlRuntime.createObjectURL(file as unknown as Blob);
    try {
      return await loadImageElementFromUrl(objectUrl);
    } finally {
      input.urlRuntime.revokeObjectURL(objectUrl);
    }
  };
}
