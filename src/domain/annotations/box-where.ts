// Which boxes a bulk agent call (get_boxes, select_boxes, delete_boxes, update_boxes) acts on: one condition
// object instead of thousands of ids. DOM-free; every condition must hold (AND).

export interface WhereBox {
  id: string;
  classId: string;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface WhereRegion {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface BoxWhere {
  annotationIds?: ReadonlySet<string>;
  classIds?: ReadonlySet<string>;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  minArea?: number;
  maxArea?: number;
  /** The whole box lies in this region. */
  inside?: WhereRegion;
  /** The box does not touch this region at all. */
  outside?: WhereRegion;
  /** The box overlaps this region (shares some area). */
  overlaps?: WhereRegion;
}

const NUMBER_KEYS = ["minWidth", "maxWidth", "minHeight", "maxHeight", "minArea", "maxArea"] as const;
const REGION_KEYS = ["inside", "outside", "overlaps"] as const;
const KNOWN_KEYS = new Set<string>(["annotationIds", "classIds", ...NUMBER_KEYS, ...REGION_KEYS]);

/** Reads a where object from tool arguments (MCP sends absent fields as null); throws an Error naming the bad field. */
export function parseBoxWhere(value: unknown): BoxWhere {
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error("where must be an object.");
  const input = value as Record<string, unknown>;
  const unknown = Object.keys(input).filter((key) => !KNOWN_KEYS.has(key) && input[key] != null);
  if (unknown.length) throw new Error(`where has unknown field ${unknown.join(", ")}.`);
  const where: { -readonly [K in keyof BoxWhere]: BoxWhere[K] } = {};
  const list = (key: "annotationIds" | "classIds") => {
    const raw = input[key];
    if (raw == null) return undefined;
    if (!Array.isArray(raw) || raw.length === 0) throw new Error(`where.${key} must be a non-empty list.`);
    return new Set(raw.map((item) => String(item).trim()));
  };
  where.annotationIds = list("annotationIds");
  where.classIds = list("classIds");
  for (const key of NUMBER_KEYS) {
    const raw = input[key];
    if (raw == null) continue;
    if (typeof raw !== "number" || !Number.isFinite(raw) || raw < 0) throw new Error(`where.${key} must be a number, 0 or more.`);
    where[key] = raw;
  }
  for (const key of REGION_KEYS) {
    const raw = input[key];
    if (raw == null) continue;
    const region = raw as Record<string, unknown>;
    const numbers = [region.x0, region.y0, region.x1, region.y1];
    if (!numbers.every((n) => typeof n === "number" && Number.isFinite(n)) || !((region.x0 as number) < (region.x1 as number) && (region.y0 as number) < (region.y1 as number))) {
      throw new Error(`where.${key} must be {x0, y0, x1, y1} with x0 < x1 and y0 < y1.`);
    }
    where[key] = { x0: region.x0 as number, y0: region.y0 as number, x1: region.x1 as number, y1: region.y1 as number };
  }
  if (Object.values(where).every((condition) => condition === undefined)) throw new Error("where needs at least one condition.");
  return where;
}

export function matchesBoxWhere(box: WhereBox, where: BoxWhere): boolean {
  const width = box.x1 - box.x0;
  const height = box.y1 - box.y0;
  const area = width * height;
  if (where.annotationIds && !where.annotationIds.has(box.id)) return false;
  if (where.classIds && !where.classIds.has(box.classId)) return false;
  if (where.minWidth !== undefined && width < where.minWidth) return false;
  if (where.maxWidth !== undefined && width > where.maxWidth) return false;
  if (where.minHeight !== undefined && height < where.minHeight) return false;
  if (where.maxHeight !== undefined && height > where.maxHeight) return false;
  if (where.minArea !== undefined && area < where.minArea) return false;
  if (where.maxArea !== undefined && area > where.maxArea) return false;
  const inside = where.inside;
  if (inside && !(box.x0 >= inside.x0 && box.y0 >= inside.y0 && box.x1 <= inside.x1 && box.y1 <= inside.y1)) return false;
  const shares = (region: WhereRegion) => box.x0 < region.x1 && box.x1 > region.x0 && box.y0 < region.y1 && box.y1 > region.y0;
  if (where.outside && shares(where.outside)) return false;
  if (where.overlaps && !shares(where.overlaps)) return false;
  return true;
}

export interface BoxChange {
  shift?: { dx: number; dy: number };
  /** Grows (or shrinks, negative) the box by dw x dh, keeping `anchor` in place. */
  resize?: { dw: number; dh: number; anchor: "center" | "topLeft" };
}

/**
 * A box after a shift and/or resize, clipped to the image. Null when clipping leaves less than 1 px on a side
 * (the caller leaves such boxes unchanged and counts them).
 */
export function changeBox(box: WhereRegion, change: BoxChange, size: { width: number; height: number }): { box: WhereRegion; clipped: boolean } | null {
  let { x0, y0, x1, y1 } = box;
  if (change.resize) {
    const { dw, dh, anchor } = change.resize;
    if (anchor === "center") {
      x0 -= dw / 2; x1 += dw / 2; y0 -= dh / 2; y1 += dh / 2;
    } else {
      x1 += dw; y1 += dh;
    }
  }
  if (change.shift) {
    x0 += change.shift.dx; x1 += change.shift.dx; y0 += change.shift.dy; y1 += change.shift.dy;
  }
  const clippedBox = { x0: Math.max(0, x0), y0: Math.max(0, y0), x1: Math.min(size.width, x1), y1: Math.min(size.height, y1) };
  if (clippedBox.x1 - clippedBox.x0 < 1 || clippedBox.y1 - clippedBox.y0 < 1) return null;
  const clipped = clippedBox.x0 !== x0 || clippedBox.y0 !== y0 || clippedBox.x1 !== x1 || clippedBox.y1 !== y1;
  return { box: clippedBox, clipped };
}
