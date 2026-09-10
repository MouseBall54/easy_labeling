import type { EdgeSamBox, EdgeSamImageInput, EdgeSamPoint } from "./types.js";

export const EDGE_SAM_INPUT_SIZE = 1024;
export const EDGE_SAM_MASK_SIZE = 256;

export interface EdgeSamResize {
  originalWidth: number;
  originalHeight: number;
  resizedWidth: number;
  resizedHeight: number;
  scale: number;
}

export function getEdgeSamResize(width: number, height: number): EdgeSamResize {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
    throw new RangeError("EdgeSAM needs a positive image size");
  }
  const scale = EDGE_SAM_INPUT_SIZE / Math.max(width, height);
  return {
    originalWidth: width,
    originalHeight: height,
    resizedWidth: Math.max(1, Math.round(width * scale)),
    resizedHeight: Math.max(1, Math.round(height * scale)),
    scale
  };
}

export function toEdgeSamPrompt(input: {
  points: readonly EdgeSamPoint[];
  box: EdgeSamBox | null;
  resize: EdgeSamResize;
  maximumPoints?: number;
}): { coordinates: Float32Array; labels: Float32Array; count: number } {
  const maximumPoints = input.maximumPoints ?? 5;
  if (!Number.isInteger(maximumPoints) || maximumPoints < 1) {
    throw new RangeError("EdgeSAM maximum prompt points must be positive");
  }
  const prompts = [
    ...input.points.map((point) => ({ x: point.x, y: point.y, label: point.label === "positive" ? 1 : 0 })),
    ...(input.box ? [
      { x: input.box.left, y: input.box.top, label: 2 },
      { x: input.box.right, y: input.box.bottom, label: 3 }
    ] : [])
  ].slice(-maximumPoints);
  const coordinates = new Float32Array(maximumPoints * 2);
  const labels = new Float32Array(maximumPoints).fill(-1);
  prompts.forEach((prompt, index) => {
    // The shipped ONNX decoder uses SAM's (x, y) coordinate order.
    coordinates[index * 2] = Math.max(0, Math.min(EDGE_SAM_INPUT_SIZE - 1, prompt.x * input.resize.scale));
    coordinates[index * 2 + 1] = Math.max(0, Math.min(EDGE_SAM_INPUT_SIZE - 1, prompt.y * input.resize.scale));
    labels[index] = prompt.label;
  });
  return { coordinates, labels, count: prompts.length };
}

export function preprocessEdgeSamImage(input: EdgeSamImageInput): { tensor: Float32Array; resize: EdgeSamResize } {
  const resize = getEdgeSamResize(input.width, input.height);
  if (input.rgba.length !== input.width * input.height * 4) {
    throw new RangeError("EdgeSAM image pixels do not match the image dimensions");
  }
  const planeSize = EDGE_SAM_INPUT_SIZE * EDGE_SAM_INPUT_SIZE;
  const tensor = new Float32Array(planeSize * 3);
  const mean = [123.675, 116.28, 103.53];
  const std = [58.395, 57.12, 57.375];
  for (let y = 0; y < resize.resizedHeight; y += 1) {
    const sourceY = Math.min(input.height - 1, Math.floor(y / resize.scale));
    for (let x = 0; x < resize.resizedWidth; x += 1) {
      const sourceX = Math.min(input.width - 1, Math.floor(x / resize.scale));
      const sourceIndex = (sourceY * input.width + sourceX) * 4;
      const targetIndex = y * EDGE_SAM_INPUT_SIZE + x;
      // A grayscale source already has equal RGB components. Copying them into
      // each channel preserves the source image while supplying EdgeSAM RGB.
      for (let channel = 0; channel < 3; channel += 1) {
        tensor[channel * planeSize + targetIndex] = (input.rgba[sourceIndex + channel] - mean[channel]!) / std[channel]!;
      }
    }
  }
  return { tensor, resize };
}

function bilinearSample(source: Float32Array, sourceWidth: number, sourceHeight: number, x: number, y: number): number {
  const clampedX = Math.max(0, Math.min(sourceWidth - 1, x));
  const clampedY = Math.max(0, Math.min(sourceHeight - 1, y));
  const x0 = Math.floor(clampedX);
  const y0 = Math.floor(clampedY);
  const x1 = Math.min(sourceWidth - 1, x0 + 1);
  const y1 = Math.min(sourceHeight - 1, y0 + 1);
  const dx = clampedX - x0;
  const dy = clampedY - y0;
  const top = source[y0 * sourceWidth + x0] * (1 - dx) + source[y0 * sourceWidth + x1] * dx;
  const bottom = source[y1 * sourceWidth + x0] * (1 - dx) + source[y1 * sourceWidth + x1] * dx;
  return top * (1 - dy) + bottom * dy;
}

export function restoreEdgeSamMask(input: {
  logits: Float32Array;
  resize: EdgeSamResize;
  threshold?: number;
}): Uint8Array {
  if (input.logits.length !== EDGE_SAM_MASK_SIZE * EDGE_SAM_MASK_SIZE) {
    throw new RangeError("EdgeSAM decoder mask must be 256 by 256");
  }
  const threshold = input.threshold ?? 0;
  const restored = new Uint8Array(input.resize.originalWidth * input.resize.originalHeight);
  for (let y = 0; y < input.resize.originalHeight; y += 1) {
    const paddedY = (y + 0.5) * input.resize.resizedHeight / input.resize.originalHeight - 0.5;
    const lowY = (paddedY + 0.5) * EDGE_SAM_MASK_SIZE / EDGE_SAM_INPUT_SIZE - 0.5;
    for (let x = 0; x < input.resize.originalWidth; x += 1) {
      const paddedX = (x + 0.5) * input.resize.resizedWidth / input.resize.originalWidth - 0.5;
      const lowX = (paddedX + 0.5) * EDGE_SAM_MASK_SIZE / EDGE_SAM_INPUT_SIZE - 0.5;
      restored[y * input.resize.originalWidth + x] = bilinearSample(input.logits, EDGE_SAM_MASK_SIZE, EDGE_SAM_MASK_SIZE, lowX, lowY) > threshold ? 1 : 0;
    }
  }
  return restored;
}
