import { getNativeBridge } from "../../platform/native-bridge.js";
import { normalizeSuperpixelSettings, type SuperpixelResult } from "./superpixels.js";
import type { SegmentationSuperpixelSettings } from "./types.js";

/** What the superpixels start from: the resident native TIFF, gray bytes drawn as R = G = B, or RGBA. */
export type NativeSuperpixelSource = { tiffPath: string } | { gray: Uint8Array } | { rgba: Uint8ClampedArray };

/** Desktop app only: whether computeSuperpixelsNatively can run (checked synchronously). */
export function canComputeSuperpixelsNatively(): boolean {
  return getNativeBridge("superpixels") !== null;
}

/** Reads src-tauri's packed result (layout in crates/el-core/src/superpixels.rs, Superpixels::pack). */
export function unpackSuperpixels(bytes: Uint8Array, width: number, height: number): SuperpixelResult {
  // A private, 8-byte aligned copy: shared-buffer bytes are released once the caller's callback returns.
  const buffer = bytes.slice().buffer;
  const header = new Uint32Array(buffer, 0, 4);
  const [count, regionSize, neighborTotal] = [header[0]!, header[1]!, header[2]!];
  const pixels = width * height;
  let offset = 16;
  const take = <T>(make: (at: number) => T, bytesPer: number, length: number): T => {
    const view = make(offset);
    offset += bytesPer * length;
    return view;
  };
  const meanIntensity = take((at) => new Float64Array(buffer, at, count), 8, count);
  const meanEdgeStrength = take((at) => new Float64Array(buffer, at, count), 8, count);
  const labels = take((at) => new Int32Array(buffer, at, pixels), 4, pixels);
  const pixelCounts = take((at) => new Uint32Array(buffer, at, count), 4, count);
  const neighborOffsets = take((at) => new Uint32Array(buffer, at, count + 1), 4, count + 1);
  const neighbors = take((at) => new Uint32Array(buffer, at, neighborTotal), 4, neighborTotal);
  const boundaries = new Uint8Array(buffer, offset, pixels);
  return {
    width,
    height,
    regionSize,
    labels,
    boundaries,
    regions: Array.from({ length: count }, (_, id) => ({
      id,
      pixelCount: pixelCounts[id]!,
      meanIntensity: meanIntensity[id]!,
      meanEdgeStrength: meanEdgeStrength[id]!,
      neighbors: Array.from(neighbors.subarray(neighborOffsets[id]!, neighborOffsets[id + 1]!))
    }))
  };
}

/**
 * createSlicoSuperpixels(input, regionSize, 5, settings) computed in Rust (crates/el-core/src/superpixels.rs),
 * equal to the TS result. Rejects when there is no native side or it fails; callers fall back to TS.
 */
export async function computeSuperpixelsNatively(
  source: NativeSuperpixelSource,
  width: number,
  height: number,
  regionSize: number,
  settings: Partial<SegmentationSuperpixelSettings>
): Promise<SuperpixelResult> {
  const native = getNativeBridge("superpixels");
  if (!native) throw new Error("Native superpixels are unavailable");
  const normalized = normalizeSuperpixelSettings({ ...settings, regionSize });
  const nativeSettings = { blur: normalized.blur, contrast: normalized.contrast, edgeSensitivity: normalized.edgeSensitivity };
  const run = "tiffPath" in source
    ? await native.invoke<number>("superpixels_run_tiff", { path: source.tiffPath, regionSize: normalized.regionSize, settings: nativeSettings })
    : await native.sendBytes<number>("superpixels_run", "gray" in source ? source.gray : new Uint8Array(source.rgba.buffer, source.rgba.byteOffset, source.rgba.byteLength), {
      "x-width": String(width),
      "x-height": String(height),
      "x-region-size": String(normalized.regionSize),
      "x-settings": encodeURIComponent(JSON.stringify(nativeSettings)),
      "x-format": "gray" in source ? "gray" : "rgba"
    });
  return native.receiveBytes("superpixels_take", "superpixels_take_shared", { id: run }, (bytes) => unpackSuperpixels(bytes, width, height));
}
