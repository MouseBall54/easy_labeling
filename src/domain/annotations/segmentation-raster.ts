import type { CanvasPoint } from "../../types/labels.js";

export function rasterizePolygon(width: number, height: number, polygon: readonly CanvasPoint[]): Uint8Array {
  const mask = new Uint8Array(width * height);
  if (polygon.length < 3) return mask;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let inside = false;
      for (let current = 0, previous = polygon.length - 1; current < polygon.length; previous = current++) {
        const a = polygon[current]!;
        const b = polygon[previous]!;
        if ((a.y > y) !== (b.y > y) && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
      }
      if (inside) mask[(y * width) + x] = 1;
    }
  }
  return mask;
}

/**
 * Returns the largest clockwise boundary of a binary mask on pixel edges.
 * Holes intentionally remain part of the mask; polygon-only formats cannot
 * represent them without format-specific extensions.
 */
export function traceMaskOuterContour(width: number, height: number, mask: Uint8Array): CanvasPoint[] | null {
  if (mask.length !== width * height) throw new Error("mask dimensions do not match contour dimensions");
  const segments = new Map<string, CanvasPoint[]>();
  const key = (point: CanvasPoint) => `${point.x},${point.y}`;
  const has = (x: number, y: number) => x >= 0 && y >= 0 && x < width && y < height && mask[(y * width) + x] !== 0;
  const add = (from: CanvasPoint, to: CanvasPoint) => {
    const start = key(from);
    const entries = segments.get(start) ?? [];
    entries.push(to);
    segments.set(start, entries);
  };

  for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
    if (!has(x, y)) continue;
    if (!has(x, y - 1)) add({ x, y }, { x: x + 1, y });
    if (!has(x + 1, y)) add({ x: x + 1, y }, { x: x + 1, y: y + 1 });
    if (!has(x, y + 1)) add({ x: x + 1, y: y + 1 }, { x, y: y + 1 });
    if (!has(x - 1, y)) add({ x, y: y + 1 }, { x, y });
  }

  const loops: CanvasPoint[][] = [];
  while (segments.size > 0) {
    const startKey = segments.keys().next().value as string;
    const [startX, startY] = startKey.split(",").map(Number);
    const loop = [{ x: startX, y: startY }];
    let current = loop[0]!;
    while (true) {
      const currentKey = key(current);
      const nexts = segments.get(currentKey);
      const next = nexts?.pop();
      if (nexts?.length === 0) segments.delete(currentKey);
      if (!next) break;
      if (key(next) === startKey) break;
      loop.push(next);
      current = next;
    }
    if (loop.length >= 3) loops.push(loop);
  }
  const largest = loops.sort((left, right) => right.length - left.length)[0];
  if (!largest) return null;
  return largest.filter((point, index, points) => {
    const previous = points[(index + points.length - 1) % points.length]!;
    const next = points[(index + 1) % points.length]!;
    return (point.x - previous.x) * (next.y - point.y) !== (point.y - previous.y) * (next.x - point.x);
  });
}

export function decodeCocoUncompressedRle(width: number, height: number, counts: readonly number[]): Uint8Array {
  const mask = new Uint8Array(width * height);
  let value = 0;
  let offset = 0;
  counts.forEach((count) => {
    for (let index = 0; index < count && offset < mask.length; index += 1, offset += 1) {
      const x = Math.floor(offset / height);
      const y = offset % height;
      mask[(y * width) + x] = value;
    }
    value = value === 0 ? 1 : 0;
  });
  return mask;
}

export function encodeCocoUncompressedRle(width: number, height: number, mask: Uint8Array): number[] {
  if (mask.length !== width * height) throw new Error("mask dimensions do not match COCO RLE");
  const counts: number[] = [];
  let value = 0;
  let run = 0;
  for (let x = 0; x < width; x += 1) {
    for (let y = 0; y < height; y += 1) {
      const next = mask[(y * width) + x] === 0 ? 0 : 1;
      if (next === value) run += 1;
      else { counts.push(run); run = 1; value = next; }
    }
  }
  counts.push(run);
  return counts;
}
