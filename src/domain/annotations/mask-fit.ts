/**
 * Numbers for one proposed region (an AI Select or Smart result) so an agent can accept or reject it without a capture:
 * its size and box, how many pieces it falls into, and edgeFit, how strongly the image changes along its boundary
 * compared with the area around it (a boundary on real edges scores well above 1; one cutting through flat texture
 * scores near 1). Works on a crop: `Crop` keeps a proposal in its bounding box instead of a whole-image mask. DOM-free.
 */
import { maskRegions } from "./mask-regions.js";

/** A 0/1 mask cropped to x0..x0+width, y0..y0+height of the image. */
export interface Crop {
  x0: number;
  y0: number;
  width: number;
  height: number;
  bits: Uint8Array;
}

export interface CropStats {
  pixels: number;
  /** Bounding box in image pixel edges. */
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  /** 4-connected pieces, and the largest piece's share of the pixels. */
  pieces: number;
  largestShare: number;
  /** Mean gradient on the boundary / mean gradient in the box grown by 8 px (null without the image). */
  edgeFit: number | null;
}

/** Crops a whole-image 0/1 mask to its bounding box, optionally clipped to a box (pixel edges); null when empty. */
export function cropMask(mask: ArrayLike<number>, width: number, height: number, clip?: { x0: number; y0: number; x1: number; y1: number }): Crop | null {
  const cx0 = clip ? Math.max(0, Math.floor(clip.x0)) : 0;
  const cy0 = clip ? Math.max(0, Math.floor(clip.y0)) : 0;
  const cx1 = clip ? Math.min(width, Math.ceil(clip.x1)) : width;
  const cy1 = clip ? Math.min(height, Math.ceil(clip.y1)) : height;
  let x0 = cx1, y0 = cy1, x1 = cx0, y1 = cy0;
  for (let y = cy0; y < cy1; y += 1) {
    for (let x = cx0; x < cx1; x += 1) {
      if (!mask[y * width + x]) continue;
      if (x < x0) x0 = x;
      if (x >= x1) x1 = x + 1;
      if (y < y0) y0 = y;
      y1 = y + 1;
    }
  }
  if (x1 <= x0) return null;
  const crop = { x0, y0, width: x1 - x0, height: y1 - y0, bits: new Uint8Array((x1 - x0) * (y1 - y0)) };
  for (let y = y0; y < y1; y += 1) for (let x = x0; x < x1; x += 1) crop.bits[(y - y0) * crop.width + (x - x0)] = mask[y * width + x] ? 1 : 0;
  return crop;
}

/** The crop with only its largest 4-connected piece, cropped to that piece's box. */
export function largestPiece(crop: Crop): Crop {
  const { regions, pixels } = maskRegions(crop.bits, crop.width, crop.height, { withPixels: true });
  if (!regions.length) return crop;
  if (regions.length === 1 && regions[0]!.x0 === 0 && regions[0]!.y0 === 0 && regions[0]!.x1 === crop.width && regions[0]!.y1 === crop.height) return crop;
  const bits = new Uint8Array(crop.bits.length);
  for (let index = 0; index < bits.length; index += 1) bits[index] = pixels![index] === 1 ? 1 : 0;
  const top = regions[0]!;
  // Re-crop to the piece's box.
  const width = top.x1 - top.x0;
  const out = { x0: crop.x0 + top.x0, y0: crop.y0 + top.y0, width, height: top.y1 - top.y0, bits: new Uint8Array(width * (top.y1 - top.y0)) };
  for (let y = top.y0; y < top.y1; y += 1) for (let x = top.x0; x < top.x1; x += 1) out.bits[(y - top.y0) * width + (x - top.x0)] = bits[y * crop.width + x]!;
  return out;
}

/**
 * Moves a proposal's boundary onto the image's intensity step: the threshold is midway between the mean gray inside the
 * proposal and the mean gray of the rest of its box, and only pixels within `band` px of the proposal (grown or shrunk
 * by up to `band`) are decided again, so the result cannot leak far. For structures brighter or darker than their
 * surroundings (SEM lines, pads, particles); the proposal keeps its largest piece. `clip` bounds the growth (pixel edges).
 */
export function snapToIntensity(crop: Crop, image: { width: number; height: number; gray: ArrayLike<number> }, band: number, clip?: { x0: number; y0: number; x1: number; y1: number }): Crop {
  const x0 = Math.max(0, crop.x0 - band, clip ? Math.floor(clip.x0) : 0);
  const y0 = Math.max(0, crop.y0 - band, clip ? Math.floor(clip.y0) : 0);
  const x1 = Math.min(image.width, crop.x0 + crop.width + band, clip ? Math.ceil(clip.x1) : image.width);
  const y1 = Math.min(image.height, crop.y0 + crop.height + band, clip ? Math.ceil(clip.y1) : image.height);
  const width = x1 - x0, height = y1 - y0;
  const inside = (x: number, y: number) => x >= crop.x0 && y >= crop.y0 && x < crop.x0 + crop.width && y < crop.y0 + crop.height && crop.bits[(y - crop.y0) * crop.width + (x - crop.x0)] === 1;
  let sumIn = 0, countIn = 0, sumOut = 0, countOut = 0;
  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      const g = image.gray[y * image.width + x]!;
      if (inside(x, y)) { sumIn += g; countIn += 1; } else { sumOut += g; countOut += 1; }
    }
  }
  if (!countIn || !countOut) return crop;
  const meanIn = sumIn / countIn, meanOut = sumOut / countOut;
  if (Math.abs(meanIn - meanOut) < 8) return crop; // no intensity step to snap to
  const threshold = (meanIn + meanOut) / 2;
  const bright = meanIn > meanOut;
  // Distance (in px, square) to the proposal's boundary decides which pixels may change: a band around it.
  const near = (x: number, y: number) => {
    const state = inside(x, y);
    for (let dy = -band; dy <= band; dy += 1) for (let dx = -band; dx <= band; dx += 1) if (inside(x + dx, y + dy) !== state) return true;
    return false;
  };
  const bits = new Uint8Array(width * height);
  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      const g = image.gray[y * image.width + x]!;
      bits[(y - y0) * width + (x - x0)] = near(x, y) ? ((bright ? g > threshold : g < threshold) ? 1 : 0) : (inside(x, y) ? 1 : 0);
    }
  }
  return largestPiece({ x0, y0, width, height, bits });
}

export function cropStats(crop: Crop, image?: { width: number; height: number; gray: ArrayLike<number> } | null): CropStats {
  const { regions } = maskRegions(crop.bits, crop.width, crop.height);
  const pixels = regions.reduce((sum, region) => sum + region.area, 0);
  const stats: CropStats = {
    pixels, x0: crop.x0, y0: crop.y0, x1: crop.x0 + crop.width, y1: crop.y0 + crop.height,
    pieces: regions.length, largestShare: pixels ? Math.round((regions[0]!.area / pixels) * 1000) / 1000 : 0, edgeFit: null
  };
  if (!image || !pixels) return stats;
  // Central-difference gradient magnitude over the box grown by 8 px.
  const gx0 = Math.max(1, crop.x0 - 8), gy0 = Math.max(1, crop.y0 - 8);
  const gx1 = Math.min(image.width - 1, crop.x0 + crop.width + 8), gy1 = Math.min(image.height - 1, crop.y0 + crop.height + 8);
  const gradient = (x: number, y: number) => {
    const at = (xx: number, yy: number) => image.gray[yy * image.width + xx]!;
    return Math.hypot(at(x + 1, y) - at(x - 1, y), at(x, y + 1) - at(x, y - 1));
  };
  const inside = (x: number, y: number) => x >= crop.x0 && y >= crop.y0 && x < crop.x0 + crop.width && y < crop.y0 + crop.height && crop.bits[(y - crop.y0) * crop.width + (x - crop.x0)] === 1;
  let all = 0, allCount = 0, edge = 0, edgeCount = 0;
  for (let y = gy0; y < gy1; y += 1) {
    for (let x = gx0; x < gx1; x += 1) {
      const g = gradient(x, y);
      all += g;
      allCount += 1;
      if (inside(x, y) && (!inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1))) { edge += g; edgeCount += 1; }
    }
  }
  if (edgeCount && allCount) stats.edgeFit = Math.round(((edge / edgeCount) / Math.max(1, all / allCount)) * 100) / 100;
  return stats;
}
