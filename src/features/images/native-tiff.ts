import { errorText, getNativeBridge } from "../../platform/native-bridge.js";

/** Matches NOT_NATIVE in src-tauri/src/tiff_image.rs. */
const NOT_NATIVE = "Not a natively decoded TIFF";

/** Images shown from readNativeTiffAsBmp -> the file Rust decoded them from (its pixels stay resident there). */
const nativeTiffPaths = new WeakMap<object, string>();

export function rememberNativeTiffPath(image: object, path: string): void {
  nativeTiffPaths.set(image, path);
}

/**
 * The file path of an image decoded natively, whose gray pixels the Processed view and refine read in Rust
 * (preprocess_view_load_tiff, refine_load_tiff) instead of extracting and uploading them. Null otherwise.
 */
export function nativeTiffPathOf(image: unknown): string | null {
  return typeof image === "object" && image !== null ? nativeTiffPaths.get(image) ?? null : null;
}

/**
 * Desktop app: the TIFF's first page as an 8-bit gray BMP, decoded in Rust from the file itself
 * (crates/el-core/src/tiff_gray.rs) with the pixels tiff.js would show. Null when there is no native
 * side, the handle has no native path, the file is outside the native scope (colour, 16-bit, JPEG
 * compression, rotated, damaged, ...) or the native call fails: the caller decodes with tiff.js.
 */
export async function readNativeTiffAsBmp(fileHandle: unknown): Promise<{ bmp: Blob; path: string } | null> {
  const native = getNativeBridge("tiff");
  const path = native?.pathOf(fileHandle);
  if (!native || !path) return null;
  const notNative = (error: unknown): boolean => errorText(error).includes(NOT_NATIVE);
  try {
    // The Blob copies the bytes before the shared buffer is released.
    const bmp = await native.receiveBytes("tiff_bmp", "tiff_bmp_shared", { path }, (bytes) => new Blob([bytes as Uint8Array<ArrayBuffer>], { type: "image/bmp" }), notNative);
    return { bmp, path };
  } catch (error) {
    if (!notNative(error)) console.warn("Native TIFF decode failed; using tiff.js.", error);
    return null;
  }
}
