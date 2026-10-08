import { refineBoxes, toGray } from "../dist/domain/refine/edge-refine.js";

// The gray image stays resident here; refine requests only carry boxes and params.
let image = null;

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
      self.postMessage({ id: data.id, result: null });
    } else if (data.type === "refine") {
      if (!image || image.key !== data.key) throw new Error("Refine image is not loaded");
      self.postMessage({ id: data.id, result: refineBoxes(image, data.boxes, data.paramsByClass, data.neighbours) });
    }
  } catch (error) {
    self.postMessage({ id: data.id, error: error instanceof Error ? error.message : String(error) });
  }
};
