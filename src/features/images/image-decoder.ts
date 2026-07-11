import { readFileArrayBuffer } from "../../platform/file-system-access.js";
import type { FileHandleLike } from "../../types/files.js";

interface TiffDecodedCanvas {
  toDataURL(type?: string): string;
}

interface TiffInstanceLike {
  toCanvas(): TiffDecodedCanvas;
}

interface TiffConstructorLike {
  new (input: { buffer: ArrayBuffer }): TiffInstanceLike;
}

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

export function createImageDecoder(input: {
  tiffRef: unknown;
  urlRuntime: ImageDecoderUrlRuntime;
}): (fileHandle: FileHandleLike) => Promise<HTMLImageElement> {
  return async (fileHandle) => {
    if (/\.(tif|tiff)$/i.test(fileHandle.name)) {
      if (!isTiffConstructor(input.tiffRef)) {
        throw new Error("TIFF decoder is unavailable");
      }
      const buffer = await readFileArrayBuffer(fileHandle);
      const decoded = new input.tiffRef({ buffer }).toCanvas();
      return loadImageElementFromUrl(decoded.toDataURL("image/png"));
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
