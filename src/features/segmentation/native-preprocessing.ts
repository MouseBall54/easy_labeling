import { keepsColour, type SegmentationPreprocessingConfig, type SegmentationPreprocessingInput } from "./preprocessing.js";

/** R = G = B = the processed gray byte, alpha from the source: what preprocessSegmentationImage writes on its gray path. */
export function grayBytesToRgba(gray: Uint8Array, sourceRgba: Uint8ClampedArray): Uint8ClampedArray {
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

export interface NativeViewPreprocessor {
  /**
   * The Processed view computed in Rust (crates/el-core), byte-identical to preprocessSegmentationImage.
   * `key` names the image: the RGBA is uploaded once per key and later calls send only the config.
   * Resolves null for configs that keep colour (they stay on the cheap TS path).
   */
  preprocess(key: string, input: SegmentationPreprocessingInput, config: SegmentationPreprocessingConfig): Promise<Uint8ClampedArray | null>;
}

const isNotLoaded = (error: unknown): boolean => String((error as Error)?.message ?? error).includes("View image is not loaded");

/** Desktop (Tauri) builds only; null in the web and Electron builds. */
export function createNativeViewPreprocessor(): NativeViewPreprocessor | null {
  const native = globalThis.window?.easyLabelingNative;
  if (!native) return null;
  let upload: { key: string; done: Promise<void> } | null = null;

  const load = (key: string, input: SegmentationPreprocessingInput, force: boolean): Promise<void> => {
    if (!force && upload?.key === key) return upload.done;
    const bytes = new Uint8Array(input.rgba.buffer, input.rgba.byteOffset, input.rgba.byteLength);
    const headers = { "x-key": encodeURIComponent(key), "x-width": String(input.width), "x-height": String(input.height) };
    const sendRaw = () => native.invoke<void>("preprocess_view_load", bytes, { headers });
    // Shared memory when the runtime offers it; the raw body (slow for large images) otherwise.
    const done = native.upload
      ? native.upload(bytes).then(
        (id) => native.invoke<void>("preprocess_view_load", new Uint8Array(0), { headers: { ...headers, "x-shared-buffer": String(id) } }),
        sendRaw
      )
      : sendRaw();
    const current = { key, done };
    upload = current;
    // A failed upload must not satisfy the next call for this key.
    done.catch(() => { if (upload === current) upload = null; });
    return done;
  };

  return {
    async preprocess(key, input, config) {
      if (keepsColour(config)) return null;
      const runRaw = async () => grayBytesToRgba(new Uint8Array(await native.invoke<ArrayBuffer>("preprocess_view_run", { key, config })), input.rgba);
      // The result comes back in shared memory when possible (a binary response is ~30-55 MB/s).
      const run = () => native.download
        ? native.download("preprocess_view_run_shared", { key, config }, (gray) => grayBytesToRgba(gray, input.rgba))
          .catch((error: unknown) => (isNotLoaded(error) ? Promise.reject(error) : runRaw()))
        : runRaw();
      await load(key, input, false);
      try {
        return await run();
      } catch (error) {
        // Another image was uploaded in between (one image is resident): upload this one again.
        if (!isNotLoaded(error)) throw error;
        await load(key, input, true);
        return run();
      }
    }
  };
}
