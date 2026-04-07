import type { CanvasPoint } from "../../types/labels.js";
import type { SegmentationMutationResult, SegmentationRegionBounds } from "./types.js";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function visitBrushCircle(
  width: number,
  height: number,
  centerX: number,
  centerY: number,
  radius: number,
  visit: (index: number, x: number, y: number) => void
): void {
  const pixelCenterX = Math.round(centerX);
  const pixelCenterY = Math.round(centerY);
  const pixelRadius = Math.max(1, Math.round(radius));
  const minX = clamp(pixelCenterX - pixelRadius, 0, width - 1);
  const maxX = clamp(pixelCenterX + pixelRadius, 0, width - 1);
  const minY = clamp(pixelCenterY - pixelRadius, 0, height - 1);
  const maxY = clamp(pixelCenterY + pixelRadius, 0, height - 1);
  const radiusSquared = pixelRadius * pixelRadius;

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const deltaX = x - pixelCenterX;
      const deltaY = y - pixelCenterY;
      if ((deltaX * deltaX) + (deltaY * deltaY) <= radiusSquared) {
        visit((y * width) + x, x, y);
      }
    }
  }
}

function rasterizeStroke(
  width: number,
  height: number,
  points: readonly CanvasPoint[],
  radius: number,
  visit: (index: number, x: number, y: number) => void
): void {
  if (points.length === 0) {
    return;
  }

  const safeRadius = Math.max(1, radius);
  let previousPoint = points[0];
  if (previousPoint) {
    visitBrushCircle(width, height, previousPoint.x, previousPoint.y, safeRadius, visit);
  }

  for (let index = 1; index < points.length; index += 1) {
    const nextPoint = points[index];
    if (!previousPoint || !nextPoint) {
      previousPoint = nextPoint ?? previousPoint;
      continue;
    }

    const deltaX = nextPoint.x - previousPoint.x;
    const deltaY = nextPoint.y - previousPoint.y;
    const distance = Math.hypot(deltaX, deltaY);
    const steps = Math.max(1, Math.ceil(distance / Math.max(1, safeRadius / 2)));

    for (let step = 1; step <= steps; step += 1) {
      const progress = step / steps;
      const x = previousPoint.x + (deltaX * progress);
      const y = previousPoint.y + (deltaY * progress);
      visitBrushCircle(width, height, x, y, safeRadius, visit);
    }

    previousPoint = nextPoint;
  }
}

export function applyBrushStroke(
  mask: Uint16Array,
  width: number,
  height: number,
  points: readonly CanvasPoint[],
  radius: number,
  classId: number
): SegmentationMutationResult {
  let mutated = false;
  let minX = width - 1;
  let minY = height - 1;
  let maxX = 0;
  let maxY = 0;
  rasterizeStroke(width, height, points, radius, (index) => {
    if (mask[index] === classId) {
      return;
    }
    mask[index] = classId;
    mutated = true;
    const x = index % width;
    const y = Math.floor(index / width);
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  });
  const dirtyBounds: SegmentationRegionBounds | null = mutated
    ? { left: minX, top: minY, right: maxX, bottom: maxY }
    : null;
  return { mutated, dirtyBounds };
}

export function applyEraseStroke(
  mask: Uint16Array,
  width: number,
  height: number,
  points: readonly CanvasPoint[],
  radius: number
): SegmentationMutationResult {
  let mutated = false;
  let minX = width - 1;
  let minY = height - 1;
  let maxX = 0;
  let maxY = 0;
  rasterizeStroke(width, height, points, radius, (index) => {
    if (mask[index] === 0) {
      return;
    }
    mask[index] = 0;
    mutated = true;
    const x = index % width;
    const y = Math.floor(index / width);
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  });
  const dirtyBounds: SegmentationRegionBounds | null = mutated
    ? { left: minX, top: minY, right: maxX, bottom: maxY }
    : null;
  return { mutated, dirtyBounds };
}
