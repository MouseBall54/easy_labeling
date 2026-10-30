import { getNativeBridge } from "../../platform/native-bridge.js";
import { nativeTiffPathOf } from "../images/native-tiff.js";
import { createNativeViewPreprocessor } from "../segmentation/native-preprocessing.js";
import { keepsColour, type SegmentationPreprocessingConfig } from "../segmentation/preprocessing.js";
import { imageElementToImageData } from "./image-data.js";

/** Gray pixels automation matches against; `sourceRgba` carries the alpha when the source is not a native TIFF. */
export interface NativeAutomationPixels {
  gray: Uint8Array;
  sourceRgba?: Uint8ClampedArray;
  width: number;
  height: number;
}

let nextKey = 0;

/** Whether nativeAutomationPixels can run the Processed input `processing` in Rust (checked synchronously). */
export function canPreprocessNatively(processing: SegmentationPreprocessingConfig): boolean {
  return !keepsColour(processing) && getNativeBridge("preprocessing") !== null;
}

/**
 * Desktop app: automation's input pixels without the TS path's main-thread work. Original input of a natively
 * decoded TIFF comes from Rust's resident gray bytes instead of drawing and reading back the image; Processed
 * input (`processing`) is computed in Rust, from the resident TIFF or from the image's uploaded pixels.
 * grayBytesToRgba of the result equals imageElementToImageData (+ preprocessSegmentationImage). Null when
 * there is no native path or it fails: the caller uses the TS path.
 */
export async function nativeAutomationPixels(
  image: HTMLImageElement,
  processing: SegmentationPreprocessingConfig | null,
  documentRef: Document
): Promise<NativeAutomationPixels | null> {
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  const tiffPath = nativeTiffPathOf(image);
  try {
    if (!processing) {
      const native = getNativeBridge("tiff");
      if (!native || !tiffPath) return null;
      const gray = await native.receiveBytes("tiff_gray", "tiff_gray_shared", { path: tiffPath }, (bytes) => bytes.slice());
      return { gray, width, height };
    }
    const preprocessor = keepsColour(processing) ? null : createNativeViewPreprocessor();
    if (!preprocessor) return null;
    if (tiffPath) {
      const gray = await preprocessor.preprocess(`automation:${tiffPath}`, { width, height, tiffPath }, processing);
      return gray && { gray, width, height };
    }
    const sourceRgba = imageElementToImageData(image, documentRef).data;
    const gray = await preprocessor.preprocess(`automation:${++nextKey}`, { width, height, rgba: sourceRgba }, processing);
    return gray && { gray, sourceRgba, width, height };
  } catch (error) {
    console.warn("Native automation pixels failed; using the TS path.", error);
    return null;
  }
}
