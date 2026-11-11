/**
 * Connected regions of a segmentation class mask (one Uint16 class id per pixel, 0 = background), for agents that read
 * masks as numbers instead of pixels. 4-connected, like the app's region selection (document.ts
 * getConnectedRegionAtPoint), so a region's seed selects exactly that region in the app. DOM-free.
 */

export interface MaskRegion {
  classId: string;
  /** Pixels in the region. */
  area: number;
  /** Bounding box in pixel edges: x1/y1 are one past the last pixel. */
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  /** Mean pixel centre. */
  cx: number;
  cy: number;
  /** A pixel inside the region (its first in raster order): pass it to tools that act on "the region at a point". */
  seed: { x: number; y: number };
}

export interface MaskRegionSummary {
  width: number;
  height: number;
  /** Pixels per class id (background excluded). */
  pixelsByClass: Record<string, number>;
  regionsByClass: Record<string, number>;
  /** Every region, largest first. */
  regions: MaskRegion[];
  /** With `withPixels`: per pixel, 1 + the index of its region in `regions` (0 = background). */
  pixels?: Int32Array;
}

/** Two-pass union-find labelling; O(pixels). */
export function maskRegions(mask: ArrayLike<number>, width: number, height: number, options: { withPixels?: boolean } = {}): MaskRegionSummary {
  const labels = new Int32Array(width * height);
  const parent: number[] = [0];
  const find = (label: number): number => {
    let root = label;
    while (parent[root] !== root) root = parent[root]!;
    while (parent[label] !== root) { const next = parent[label]!; parent[label] = root; label = next; }
    return root;
  };
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      const value = mask[index]!;
      if (value <= 0) continue;
      const left = x > 0 && mask[index - 1] === value ? labels[index - 1]! : 0;
      const up = y > 0 && mask[index - width] === value ? labels[index - width]! : 0;
      if (!left && !up) {
        parent.push(parent.length);
        labels[index] = parent.length - 1;
      } else if (left && up && left !== up) {
        const a = find(left);
        const b = find(up);
        if (a !== b) parent[Math.max(a, b)] = Math.min(a, b);
        labels[index] = Math.min(a, b);
      } else {
        labels[index] = left || up;
      }
    }
  }
  const byRoot = new Map<number, { root: number; classId: number; area: number; x0: number; y0: number; x1: number; y1: number; sx: number; sy: number; seed: number }>();
  for (let index = 0; index < labels.length; index += 1) {
    if (!labels[index]) continue;
    const root = find(labels[index]!);
    const x = index % width;
    const y = (index - x) / width;
    const entry = byRoot.get(root);
    if (!entry) {
      byRoot.set(root, { root, classId: mask[index]!, area: 1, x0: x, y0: y, x1: x, y1: y, sx: x, sy: y, seed: index });
      continue;
    }
    entry.area += 1;
    if (x < entry.x0) entry.x0 = x;
    if (x > entry.x1) entry.x1 = x;
    entry.y1 = y;
    entry.sx += x;
    entry.sy += y;
  }
  const pixelsByClass: Record<string, number> = {};
  const regionsByClass: Record<string, number> = {};
  const regions: Array<MaskRegion & { root: number }> = [];
  for (const entry of byRoot.values()) {
    const classId = String(entry.classId);
    pixelsByClass[classId] = (pixelsByClass[classId] ?? 0) + entry.area;
    regionsByClass[classId] = (regionsByClass[classId] ?? 0) + 1;
    const seedX = entry.seed % width;
    regions.push({
      root: entry.root, classId, area: entry.area, x0: entry.x0, y0: entry.y0, x1: entry.x1 + 1, y1: entry.y1 + 1,
      cx: Math.round((entry.sx / entry.area + 0.5) * 10) / 10, cy: Math.round((entry.sy / entry.area + 0.5) * 10) / 10,
      seed: { x: seedX, y: (entry.seed - seedX) / width }
    });
  }
  regions.sort((a, b) => b.area - a.area || a.seed.y - b.seed.y || a.seed.x - b.seed.x);
  let pixels: Int32Array | undefined;
  if (options.withPixels) {
    const order = new Map(regions.map((region, index) => [region.root, index + 1]));
    pixels = labels;
    for (let index = 0; index < pixels.length; index += 1) if (pixels[index]) pixels[index] = order.get(find(pixels[index]!))!;
  }
  const list: MaskRegion[] = regions.map(({ root: _root, ...region }) => region);
  return pixels ? { width, height, pixelsByClass, regionsByClass, regions: list, pixels } : { width, height, pixelsByClass, regionsByClass, regions: list };
}
