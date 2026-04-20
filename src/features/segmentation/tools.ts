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

export function applyClosedRegionAutoFillFromStroke(input: {
  beforeMask: Uint16Array;
  afterMask: Uint16Array;
  width: number;
  height: number;
  points: readonly CanvasPoint[];
  brushRadius: number;
  classId: number;
  safetyMargin?: number;
}): SegmentationMutationResult {
  if (input.points.length === 0 || input.width <= 0 || input.height <= 0 || input.classId <= 0) {
    return {
      mutated: false,
      dirtyBounds: null
    };
  }

  let minPointX = Number.POSITIVE_INFINITY;
  let minPointY = Number.POSITIVE_INFINITY;
  let maxPointX = Number.NEGATIVE_INFINITY;
  let maxPointY = Number.NEGATIVE_INFINITY;
  input.points.forEach((point) => {
    minPointX = Math.min(minPointX, point.x);
    minPointY = Math.min(minPointY, point.y);
    maxPointX = Math.max(maxPointX, point.x);
    maxPointY = Math.max(maxPointY, point.y);
  });

  const margin = Math.max(1, Math.round(input.brushRadius)) + Math.max(0, Math.round(input.safetyMargin ?? 1));
  const roiMinX = clamp(Math.floor(minPointX) - margin, 0, input.width - 1);
  const roiMinY = clamp(Math.floor(minPointY) - margin, 0, input.height - 1);
  const roiMaxX = clamp(Math.ceil(maxPointX) + margin, 0, input.width - 1);
  const roiMaxY = clamp(Math.ceil(maxPointY) + margin, 0, input.height - 1);
  const roiWidth = (roiMaxX - roiMinX) + 1;
  const roiHeight = (roiMaxY - roiMinY) + 1;
  const roiSize = roiWidth * roiHeight;

  const changedSeedQueue: number[] = [];
  for (let y = roiMinY; y <= roiMaxY; y += 1) {
    for (let x = roiMinX; x <= roiMaxX; x += 1) {
      const index = (y * input.width) + x;
      const beforeClass = input.beforeMask[index] ?? 0;
      const afterClass = input.afterMask[index] ?? 0;
      if (beforeClass !== afterClass && afterClass === input.classId) {
        changedSeedQueue.push(index);
      }
    }
  }

  if (changedSeedQueue.length === 0) {
    return {
      mutated: false,
      dirtyBounds: null
    };
  }

  const boundaryMask = new Uint8Array(roiSize);
  const enqueueBoundaryIndex = (globalIndex: number): void => {
    const x = globalIndex % input.width;
    const y = Math.floor(globalIndex / input.width);
    const localX = x - roiMinX;
    const localY = y - roiMinY;
    if (localX < 0 || localX >= roiWidth || localY < 0 || localY >= roiHeight) {
      return;
    }
    const localIndex = (localY * roiWidth) + localX;
    if (boundaryMask[localIndex] !== 0) {
      return;
    }
    boundaryMask[localIndex] = 1;
    changedSeedQueue.push(globalIndex);
  };

  const initialSeedCount = changedSeedQueue.length;
  for (let index = 0; index < initialSeedCount; index += 1) {
    const seed = changedSeedQueue[index];
    if (typeof seed === "number") {
      enqueueBoundaryIndex(seed);
    }
  }

  let boundaryCursor = initialSeedCount;
  while (boundaryCursor < changedSeedQueue.length) {
    const current = changedSeedQueue[boundaryCursor];
    boundaryCursor += 1;
    if (typeof current !== "number") {
      continue;
    }
    const x = current % input.width;
    const y = Math.floor(current / input.width);

    if (y > roiMinY) {
      const upIndex = current - input.width;
      if ((input.afterMask[upIndex] ?? 0) === input.classId) {
        enqueueBoundaryIndex(upIndex);
      }
    }
    if (y < roiMaxY) {
      const downIndex = current + input.width;
      if ((input.afterMask[downIndex] ?? 0) === input.classId) {
        enqueueBoundaryIndex(downIndex);
      }
    }
    if (x > roiMinX) {
      const leftIndex = current - 1;
      if ((input.afterMask[leftIndex] ?? 0) === input.classId) {
        enqueueBoundaryIndex(leftIndex);
      }
    }
    if (x < roiMaxX) {
      const rightIndex = current + 1;
      if ((input.afterMask[rightIndex] ?? 0) === input.classId) {
        enqueueBoundaryIndex(rightIndex);
      }
    }
  }

  const visited = new Uint8Array(roiSize);
  const componentQueue: number[] = [];
  const componentPixels: number[] = [];
  let mutated = false;
  let minX = input.width - 1;
  let minY = input.height - 1;
  let maxX = 0;
  let maxY = 0;

  for (let localIndex = 0; localIndex < roiSize; localIndex += 1) {
    if (boundaryMask[localIndex] !== 0 || visited[localIndex] !== 0) {
      continue;
    }

    visited[localIndex] = 1;
    componentQueue.length = 0;
    componentPixels.length = 0;
    componentQueue.push(localIndex);
    componentPixels.push(localIndex);
    let cursor = 0;
    let touchesRoiBoundary = false;

    while (cursor < componentQueue.length) {
      const current = componentQueue[cursor];
      cursor += 1;
      if (typeof current !== "number") {
        continue;
      }
      const localX = current % roiWidth;
      const localY = Math.floor(current / roiWidth);
      if (localX === 0 || localX === roiWidth - 1 || localY === 0 || localY === roiHeight - 1) {
        touchesRoiBoundary = true;
      }

      const tryVisit = (next: number): void => {
        if (boundaryMask[next] !== 0 || visited[next] !== 0) {
          return;
        }
        visited[next] = 1;
        componentQueue.push(next);
        componentPixels.push(next);
      };

      if (localY > 0) {
        tryVisit(current - roiWidth);
      }
      if (localY < roiHeight - 1) {
        tryVisit(current + roiWidth);
      }
      if (localX > 0) {
        tryVisit(current - 1);
      }
      if (localX < roiWidth - 1) {
        tryVisit(current + 1);
      }
    }

    if (touchesRoiBoundary) {
      continue;
    }

    for (const componentPixel of componentPixels) {
      const localX = componentPixel % roiWidth;
      const localY = Math.floor(componentPixel / roiWidth);
      const x = roiMinX + localX;
      const y = roiMinY + localY;
      const globalIndex = (y * input.width) + x;
      if ((input.afterMask[globalIndex] ?? 0) === input.classId) {
        continue;
      }

      input.afterMask[globalIndex] = input.classId;
      mutated = true;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  return {
    mutated,
    dirtyBounds: mutated ? { left: minX, top: minY, right: maxX, bottom: maxY } : null
  };
}
