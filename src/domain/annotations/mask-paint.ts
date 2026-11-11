/**
 * Paints shapes into a segmentation class mask for agents (paint_mask). Coordinates are image pixel edges, like boxes:
 * a pixel belongs to a shape when its centre (x + 0.5, y + 0.5) lies inside. Each shape only visits its own bounding
 * box (the polygon by scanline), so many small shapes on a large image stay cheap. DOM-free.
 */

export type MaskShape =
  | { type: "rect"; x0: number; y0: number; x1: number; y1: number }
  | { type: "circle"; cx: number; cy: number; r: number }
  | { type: "polygon"; points: ReadonlyArray<readonly [number, number]> }
  | { type: "line"; points: ReadonlyArray<readonly [number, number]>; width: number };

export interface PaintResult {
  changed: number;
  /** Changed pixels' bounds in pixel edges (x1/y1 one past), or null. */
  bounds: { x0: number; y0: number; x1: number; y1: number } | null;
}

/** Throws a plain Error naming the first problem; the caller turns it into invalid_args. */
export function checkMaskShape(shape: unknown, label: string): MaskShape {
  const value = shape as Record<string, unknown> | null;
  const finite = (...numbers: unknown[]) => numbers.every((entry) => typeof entry === "number" && Number.isFinite(entry));
  const points = (list: unknown, min: number): Array<[number, number]> => {
    if (!Array.isArray(list) || list.length < min || list.length > 10_000) throw new Error(`${label}: points must be a list of ${min} to 10000 [x, y] pairs.`);
    return list.map((point, index) => {
      if (!Array.isArray(point) || point.length !== 2 || !finite(point[0], point[1])) throw new Error(`${label}: point ${index} must be [x, y].`);
      return [point[0] as number, point[1] as number];
    });
  };
  switch (value?.type) {
    case "rect":
      if (!finite(value.x0, value.y0, value.x1, value.y1) || !((value.x0 as number) < (value.x1 as number) && (value.y0 as number) < (value.y1 as number))) throw new Error(`${label}: a rect needs numbers x0 < x1 and y0 < y1.`);
      return { type: "rect", x0: value.x0 as number, y0: value.y0 as number, x1: value.x1 as number, y1: value.y1 as number };
    case "circle":
      if (!finite(value.cx, value.cy, value.r) || !((value.r as number) > 0)) throw new Error(`${label}: a circle needs numbers cx, cy and r > 0.`);
      return { type: "circle", cx: value.cx as number, cy: value.cy as number, r: value.r as number };
    case "polygon":
      return { type: "polygon", points: points(value.points, 3) };
    case "line":
      if (!finite(value.width) || !((value.width as number) > 0)) throw new Error(`${label}: a line needs width > 0 (pixels).`);
      return { type: "line", points: points(value.points, 2), width: value.width as number };
    default:
      throw new Error(`${label}: type must be "rect", "circle", "polygon" or "line".`);
  }
}

/**
 * Sets every pixel inside the shapes to `value` (0 erases). With `only`, changes just pixels that currently hold that
 * value (e.g. 0: paint the background only, never over other regions).
 */
export function paintShapes(mask: Uint16Array, width: number, height: number, shapes: readonly MaskShape[], value: number, options: { only?: number } = {}): PaintResult {
  let changed = 0;
  let x0 = width, y0 = height, x1 = 0, y1 = 0;
  const set = (x: number, y: number) => {
    const index = y * width + x;
    const current = mask[index]!;
    if (current === value || (options.only !== undefined && current !== options.only)) return;
    mask[index] = value;
    changed += 1;
    if (x < x0) x0 = x;
    if (y < y0) y0 = y;
    if (x >= x1) x1 = x + 1;
    if (y >= y1) y1 = y + 1;
  };
  // Pixels whose centres lie in [a, b): from ceil(a - 0.5) to ceil(b - 0.5) - 1, clipped to the image.
  const first = (a: number) => Math.max(0, Math.ceil(a - 0.5));
  const last = (b: number, size: number) => Math.min(size - 1, Math.ceil(b - 0.5) - 1);
  for (const shape of shapes) {
    if (shape.type === "rect") {
      for (let y = first(shape.y0); y <= last(shape.y1, height); y += 1) for (let x = first(shape.x0); x <= last(shape.x1, width); x += 1) set(x, y);
    } else if (shape.type === "circle") {
      const r2 = shape.r * shape.r;
      for (let y = first(shape.cy - shape.r); y <= last(shape.cy + shape.r + 1e-9, height); y += 1) {
        for (let x = first(shape.cx - shape.r); x <= last(shape.cx + shape.r + 1e-9, width); x += 1) {
          if ((x + 0.5 - shape.cx) ** 2 + (y + 0.5 - shape.cy) ** 2 <= r2) set(x, y);
        }
      }
    } else if (shape.type === "polygon") {
      // Even-odd scanline at each row's pixel centre.
      const ys = shape.points.map((point) => point[1]);
      const crossings: number[] = [];
      for (let y = first(Math.min(...ys)); y <= last(Math.max(...ys), height); y += 1) {
        const cy = y + 0.5;
        crossings.length = 0;
        for (let current = 0, previous = shape.points.length - 1; current < shape.points.length; previous = current++) {
          const [ax, ay] = shape.points[previous]!;
          const [bx, by] = shape.points[current]!;
          if ((ay > cy) !== (by > cy)) crossings.push(ax + ((cy - ay) * (bx - ax)) / (by - ay));
        }
        crossings.sort((a, b) => a - b);
        for (let pair = 0; pair + 1 < crossings.length; pair += 2) {
          for (let x = first(crossings[pair]!); x <= last(crossings[pair + 1]!, width); x += 1) set(x, y);
        }
      }
    } else {
      // A thick polyline: pixel centres within width / 2 of any segment (round caps and joins).
      const half = shape.width / 2;
      for (let index = 0; index < shape.points.length - 1; index += 1) {
        const [ax, ay] = shape.points[index]!;
        const [bx, by] = shape.points[index + 1]!;
        const dx = bx - ax, dy = by - ay;
        const length2 = dx * dx + dy * dy;
        for (let y = first(Math.min(ay, by) - half); y <= last(Math.max(ay, by) + half + 1e-9, height); y += 1) {
          for (let x = first(Math.min(ax, bx) - half); x <= last(Math.max(ax, bx) + half + 1e-9, width); x += 1) {
            const px = x + 0.5 - ax, py = y + 0.5 - ay;
            const t = length2 > 0 ? Math.max(0, Math.min(1, (px * dx + py * dy) / length2)) : 0;
            if ((px - t * dx) ** 2 + (py - t * dy) ** 2 <= half * half) set(x, y);
          }
        }
      }
    }
  }
  return { changed, bounds: changed ? { x0, y0, x1, y1 } : null };
}
