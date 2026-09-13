import type { CanvasPoint } from "../../types/labels.js";

export type WorkingImageSource = "original" | "original-processed" | "sr-roi" | "sr-roi-processed";

export interface WorkingImageDescriptor {
  source: WorkingImageSource;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  originalRoi?: WorkingImageRect;
  cacheKey: string;
}

export interface WorkingImageRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

function assertDimensions(descriptor: WorkingImageDescriptor): void {
  if (descriptor.width < 1 || descriptor.height < 1 || descriptor.originalWidth < 1 || descriptor.originalHeight < 1) {
    throw new Error("working image dimensions are invalid");
  }
}

export function getWorkingImageScale(descriptor: WorkingImageDescriptor): { x: number; y: number } {
  assertDimensions(descriptor);
  const originalWidth = descriptor.originalRoi?.width ?? descriptor.originalWidth;
  const originalHeight = descriptor.originalRoi?.height ?? descriptor.originalHeight;
  if (originalWidth < 1 || originalHeight < 1) throw new Error("working image ROI dimensions are invalid");
  return {
    x: descriptor.width / originalWidth,
    y: descriptor.height / originalHeight
  };
}

export function getWorkingImageOriginalRect(descriptor: WorkingImageDescriptor): WorkingImageRect {
  assertDimensions(descriptor);
  return descriptor.originalRoi
    ? { ...descriptor.originalRoi }
    : { x: 0, y: 0, width: descriptor.originalWidth, height: descriptor.originalHeight };
}

export function isOriginalPointInWorkingImage(point: CanvasPoint, descriptor: WorkingImageDescriptor): boolean {
  const rect = getWorkingImageOriginalRect(descriptor);
  return point.x >= rect.x && point.y >= rect.y && point.x < rect.x + rect.width && point.y < rect.y + rect.height;
}

export function workingPointToOriginal(point: CanvasPoint, descriptor: WorkingImageDescriptor): CanvasPoint {
  const scale = getWorkingImageScale(descriptor);
  const rect = getWorkingImageOriginalRect(descriptor);
  return {
    x: clamp(rect.x + (point.x / scale.x), rect.x, rect.x + rect.width),
    y: clamp(rect.y + (point.y / scale.y), rect.y, rect.y + rect.height)
  };
}

export function originalPointToWorking(point: CanvasPoint, descriptor: WorkingImageDescriptor): CanvasPoint {
  const scale = getWorkingImageScale(descriptor);
  const rect = getWorkingImageOriginalRect(descriptor);
  return {
    x: clamp((point.x - rect.x) * scale.x, 0, descriptor.width),
    y: clamp((point.y - rect.y) * scale.y, 0, descriptor.height)
  };
}

export function workingRectToOriginal(rect: WorkingImageRect, descriptor: WorkingImageDescriptor): WorkingImageRect {
  const topLeft = workingPointToOriginal(rect, descriptor);
  const bottomRight = workingPointToOriginal({ x: rect.x + rect.width, y: rect.y + rect.height }, descriptor);
  return {
    x: topLeft.x,
    y: topLeft.y,
    width: Math.max(0, bottomRight.x - topLeft.x),
    height: Math.max(0, bottomRight.y - topLeft.y)
  };
}

export function workingMaskToOriginal(input: {
  mask: Uint8Array;
  descriptor: WorkingImageDescriptor;
}): Uint8Array {
  const { descriptor, mask } = input;
  assertDimensions(descriptor);
  if (mask.length !== descriptor.width * descriptor.height) {
    throw new Error("working mask dimensions are invalid");
  }
  const restored = new Uint8Array(descriptor.originalWidth * descriptor.originalHeight);
  const scale = getWorkingImageScale(descriptor);
  const rect = getWorkingImageOriginalRect(descriptor);
  const startX = Math.max(0, Math.floor(rect.x));
  const startY = Math.max(0, Math.floor(rect.y));
  const endX = Math.min(descriptor.originalWidth, Math.ceil(rect.x + rect.width));
  const endY = Math.min(descriptor.originalHeight, Math.ceil(rect.y + rect.height));
  for (let y = startY; y < endY; y += 1) {
    const sourceY = Math.min(descriptor.height - 1, Math.floor((y + 0.5 - rect.y) * scale.y));
    for (let x = startX; x < endX; x += 1) {
      const sourceX = Math.min(descriptor.width - 1, Math.floor((x + 0.5 - rect.x) * scale.x));
      restored[y * descriptor.originalWidth + x] = mask[sourceY * descriptor.width + sourceX] ?? 0;
    }
  }
  return restored;
}
