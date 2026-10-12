import { refineBoxes, toGray } from "../dist/domain/refine/edge-refine.js";
import { getSegmentationPreprocessingKey, normalizeSegmentationPreprocessingConfig, preprocessGray } from "../dist/features/segmentation/preprocessing.js";

// The gray image stays resident here; refine requests only carry boxes and params.
let image = null;
// The "Processed" view of the same image, cached per preprocessing config.
let processed = null;

/** Gray image for a request's source: the original, or the Preprocess panel's processed output. */
function sourceImage(key, source) {
  if (!image || image.key !== key) throw new Error("Refine image is not loaded");
  if (source?.kind !== "processed") return image;
  const config = normalizeSegmentationPreprocessingConfig(source.config);
  const configKey = getSegmentationPreprocessingKey(config);
  if (!processed || processed.imageKey !== key || processed.configKey !== configKey) {
    // Processing normalises against the whole image, so it must run on the full frame, not on crops.
    const out = preprocessGray(Float32Array.from(image.gray), image.width, image.height, config);
    const gray = new Uint8Array(out.length);
    for (let i = 0; i < out.length; i += 1) gray[i] = Math.max(0, Math.min(255, Math.round(out[i])));
    processed = { imageKey: key, configKey, gray };
  }
  return { gray: processed.gray, width: image.width, height: image.height };
}

self.onmessage = ({ data }) => {
  try {
    if (data.type === "image") {
      const { bitmap } = data;
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.drawImage(bitmap, 0, 0);
      bitmap.close();
      const rgba = context.getImageData(0, 0, canvas.width, canvas.height).data;
      image = { key: data.key, gray: toGray(rgba, canvas.width, canvas.height), width: canvas.width, height: canvas.height };
      processed = null;
      self.postMessage({ id: data.id, result: null });
    } else if (data.type === "refine") {
      self.postMessage({ id: data.id, result: refineBoxes(sourceImage(data.key, data.source), data.boxes, data.paramsByClass, data.neighbours) });
    } else if (data.type === "crop") {
      const src = sourceImage(data.key, data.source);
      const { x0, y0, x1, y1 } = data.rect;
      const width = x1 - x0;
      const height = y1 - y0;
      const gray = new Uint8Array(width * height);
      for (let y = 0; y < height; y += 1) gray.set(src.gray.subarray((y0 + y) * src.width + x0, (y0 + y) * src.width + x1), y * width);
      self.postMessage({ id: data.id, result: { gray, width, height } }, [gray.buffer]);
    }
  } catch (error) {
    self.postMessage({ id: data.id, error: error instanceof Error ? error.message : String(error) });
  }
};
