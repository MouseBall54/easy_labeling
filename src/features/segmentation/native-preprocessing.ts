import { errorText, getNativeBridge } from "../../platform/native-bridge.js";
import { keepsColour, type SegmentationPreprocessingConfig, type SegmentationPreprocessingInput } from "./preprocessing.js";

/**
 * R = G = B = the processed gray byte, alpha from the source: what preprocessSegmentationImage writes on its gray path.
 * Without a source RGBA (a natively decoded gray TIFF, drawn opaque) alpha is 255.
 */
export function grayBytesToRgba(gray: Uint8Array, sourceRgba?: Uint8ClampedArray): Uint8ClampedArray {
  if (!sourceRgba) {
    const rgba = new Uint8ClampedArray(gray.length * 4);
    const target = new Uint32Array(rgba.buffer);
    for (let index = 0; index < gray.length; index += 1) target[index] = 0xff000000 | (gray[index]! * 0x010101);
    return rgba;
  }
  const rgba = new Uint8ClampedArray(sourceRgba.length);
  if (sourceRgba.byteOffset % 4 === 0 && sourceRgba.length === gray.length * 4) {
    // One 32-bit write per pixel (little-endian RGBA: alpha is the top byte); 4x fewer stores on 12 MP images.
    const source = new Uint32Array(sourceRgba.buffer, sourceRgba.byteOffset, gray.length);
    const target = new Uint32Array(rgba.buffer);
    for (let index = 0; index < gray.length; index += 1) target[index] = (source[index]! & 0xff000000) | (gray[index]! * 0x010101);
    return rgba;
  }
  for (let index = 0; index < gray.length; index += 1) {
    const offset = index * 4;
    const byte = gray[index] ?? 0;
    rgba[offset] = byte;
    rgba[offset + 1] = byte;
    rgba[offset + 2] = byte;
    rgba[offset + 3] = sourceRgba[offset + 3] ?? 255;
  }
  return rgba;
}

/** What the view starts from: the page's RGBA, or a natively decoded TIFF whose gray pixels Rust already holds. */
export type NativeViewSource = SegmentationPreprocessingInput | { width: number; height: number; tiffPath: string };

export interface NativeViewPreprocessor {
  /**
   * The Processed view computed in Rust (crates/el-core), byte-identical to preprocessSegmentationImage.
   * `key` names the image: the RGBA is uploaded (or the TIFF loaded) once per key and later calls send only the config.
   * Resolves null for configs that keep colour (they stay on the cheap TS path).
   */
  preprocess(key: string, source: NativeViewSource, config: SegmentationPreprocessingConfig): Promise<Uint8ClampedArray | null>;
}

const isNotLoaded = (error: unknown): boolean => errorText(error).includes("View image is not loaded");

/** Desktop (Tauri) builds only; null in the web and Electron builds. */
export function createNativeViewPreprocessor(): NativeViewPreprocessor | null {
  const native = getNativeBridge("preprocessing");
  if (!native) return null;
  let upload: { key: string; done: Promise<void> } | null = null;

  const load = (key: string, source: NativeViewSource, force: boolean): Promise<void> => {
    if (!force && upload?.key === key) return upload.done;
    const done = "tiffPath" in source
      ? native.invoke<void>("preprocess_view_load_tiff", { key, path: source.tiffPath })
      : native.sendBytes<void>("preprocess_view_load", new Uint8Array(source.rgba.buffer, source.rgba.byteOffset, source.rgba.byteLength), {
        "x-key": encodeURIComponent(key), "x-width": String(source.width), "x-height": String(source.height)
      });
    const current = { key, done };
    upload = current;
    // A failed upload must not satisfy the next call for this key.
    done.catch(() => { if (upload === current) upload = null; });
    return done;
  };

  return {
    async preprocess(key, source, config) {
      if (keepsColour(config)) return null;
      const sourceRgba = "rgba" in source ? source.rgba : undefined;
      const run = () => native.receiveBytes("preprocess_view_run", "preprocess_view_run_shared", { key, config }, (gray) => grayBytesToRgba(gray, sourceRgba), isNotLoaded);
      await load(key, source, false);
      try {
        return await run();
      } catch (error) {
        // Another image was uploaded in between (one image is resident): upload this one again.
        if (!isNotLoaded(error)) throw error;
        await load(key, source, true);
        return run();
      }
    }
  };
}
