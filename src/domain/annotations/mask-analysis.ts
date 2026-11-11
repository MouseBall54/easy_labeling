/**
 * Mask checks and clean-up for agents (analyze_masks, clean_masks), the mask counterpart of analyze_boxes and Refine:
 * specks (tiny regions), holes (background enclosed by one region), necked regions (two objects joined by a thin
 * bridge: an erosion splits them into big parts), boundaries off the image edges (edgeFit), and the regions' boxes
 * through the box population checks (size groups, rows, missing spots). Clean-up removes specks, fills holes, cuts
 * necks with a square opening (axis-aligned corners survive it) and snaps boundaries to the intensity step. DOM-free.
 */
import { analyzeBoxes, type BoxFinding, type MissingPosition } from "../refine/box-statistics.js";
import { dilate } from "./mask-compare.js";
import { cropStats, snapToIntensity, type Crop } from "./mask-fit.js";
import { maskRegions, type MaskRegion } from "./mask-regions.js";

export interface GrayImage { width: number; height: number; gray: ArrayLike<number> }

export interface MaskIssue { classId: string; seed: { x: number; y: number }; area: number; x0: number; y0: number; x1: number; y1: number }
export interface HoleIssue extends MaskIssue { /** The enclosing region's seed. */ region: { x: number; y: number } }
export interface NeckIssue extends MaskIssue { /** Big parts the erosion leaves. */ parts: number }
export interface EdgeIssue extends MaskIssue { edgeFit: number }

export interface MaskAnalysis {
  regions: number;
  byClass: Record<string, { regions: number; pixels: number; medianArea: number }>;
  counts: { specks: number; holes: number; necked: number; offEdges: number; size: number; offLine: number; missing: number };
  specks: MaskIssue[];
  holes: HoleIssue[];
  necked: NeckIssue[];
  /** Lowest edgeFit first (only with the image). */
  offEdges: EdgeIssue[];
  /** analyze_boxes on the regions' bounding boxes. */
  layout: { findings: BoxFinding[]; missing: MissingPosition[] };
}

export interface MaskAnalysisOptions {
  /** Only this class. */
  classId?: string;
  /** Regions under this many pixels are specks (default: 5% of the class's median area, at least 4). */
  speckArea?: number;
  /** Erosion radius that reveals a neck (default 1: bridges under 3 px wide). */
  neckPx?: number;
  /** edgeFit under this is off the edges (default 1.3). */
  minEdgeFit?: number;
}

const median = (values: number[]): number => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = sorted.length >> 1;
  return sorted.length % 2 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2;
};

/** One region's pixels as a crop of its bounding box. */
function regionCrop(pixels: Int32Array, width: number, region: MaskRegion, id: number): Crop {
  const w = region.x1 - region.x0, h = region.y1 - region.y0;
  const bits = new Uint8Array(w * h);
  for (let y = 0; y < h; y += 1) for (let x = 0; x < w; x += 1) bits[y * w + x] = pixels[(region.y0 + y) * width + region.x0 + x] === id ? 1 : 0;
  return { x0: region.x0, y0: region.y0, width: w, height: h, bits };
}

/** Square erosion inside a crop (outside counts as background). */
function erode(crop: Crop, radius: number): Uint8Array {
  const inverse = crop.bits.map((bit) => (bit ? 0 : 1));
  // Pad so the crop border erodes like the image around it.
  const w = crop.width + 2 * radius, h = crop.height + 2 * radius;
  const padded = new Uint8Array(w * h).fill(1);
  for (let y = 0; y < crop.height; y += 1) for (let x = 0; x < crop.width; x += 1) padded[(y + radius) * w + x + radius] = inverse[y * crop.width + x]!;
  const grown = dilate(padded, w, h, radius);
  const out = new Uint8Array(crop.bits.length);
  for (let y = 0; y < crop.height; y += 1) for (let x = 0; x < crop.width; x += 1) out[y * crop.width + x] = grown[(y + radius) * w + x + radius] ? 0 : 1;
  return out;
}

/** Big parts left after eroding the region by `radius` (each at least 10% of the region and 4 px). */
function neckParts(crop: Crop, area: number, radius: number): number {
  const eroded = erode(crop, radius);
  const { regions } = maskRegions(eroded, crop.width, crop.height);
  return regions.filter((part) => part.area >= Math.max(4, area * 0.1)).length;
}

const issue = (region: MaskRegion): MaskIssue => ({ classId: region.classId, seed: region.seed, area: region.area, x0: region.x0, y0: region.y0, x1: region.x1, y1: region.y1 });

export function analyzeMask(mask: ArrayLike<number>, width: number, height: number, image: GrayImage | null, options: MaskAnalysisOptions = {}): MaskAnalysis {
  const neckPx = options.neckPx ?? 1;
  const minEdgeFit = options.minEdgeFit ?? 1.3;
  const { regions, pixels } = maskRegions(mask, width, height, { withPixels: true });
  const keep = (region: MaskRegion) => options.classId === undefined || region.classId === options.classId;
  const byClass: MaskAnalysis["byClass"] = {};
  for (const region of regions.filter(keep)) {
    const entry = byClass[region.classId] ??= { regions: 0, pixels: 0, medianArea: 0 };
    entry.regions += 1;
    entry.pixels += region.area;
  }
  for (const classId of Object.keys(byClass)) byClass[classId]!.medianArea = median(regions.filter((region) => region.classId === classId).map((region) => region.area));
  const speckArea = (classId: string) => options.speckArea ?? Math.max(4, Math.round(byClass[classId]!.medianArea * 0.05));

  const specks: MaskIssue[] = [];
  const necked: NeckIssue[] = [];
  const offEdges: EdgeIssue[] = [];
  regions.forEach((region, index) => {
    if (!keep(region)) return;
    if (region.area < speckArea(region.classId)) { specks.push(issue(region)); return; }
    const crop = regionCrop(pixels!, width, region, index + 1);
    if (region.area >= 4 * speckArea(region.classId)) {
      const parts = neckParts(crop, region.area, neckPx);
      if (parts >= 2) necked.push({ ...issue(region), parts });
    }
    if (image) {
      const fit = cropStats(crop, image).edgeFit;
      if (fit !== null && fit < minEdgeFit) offEdges.push({ ...issue(region), edgeFit: fit });
    }
  });
  offEdges.sort((a, b) => a.edgeFit - b.edgeFit);

  // Holes: background pieces off the image border whose every neighbour belongs to one region.
  const background = new Uint8Array(width * height);
  for (let index = 0; index < background.length; index += 1) background[index] = mask[index] ? 0 : 1;
  const gaps = maskRegions(background, width, height, { withPixels: true });
  const holes: HoleIssue[] = [];
  gaps.regions.forEach((gap, index) => {
    if (gap.x0 === 0 || gap.y0 === 0 || gap.x1 === width || gap.y1 === height) return;
    const id = index + 1;
    let around = 0;
    let single = true;
    for (let y = gap.y0; y < gap.y1 && single; y += 1) {
      for (let x = gap.x0; x < gap.x1 && single; x += 1) {
        const at = y * width + x;
        if (gaps.pixels![at] !== id) continue;
        for (const next of [at - 1, at + 1, at - width, at + width]) {
          const region = pixels![next]!;
          if (!region) continue;
          if (!around) around = region;
          else if (region !== around) single = false;
        }
      }
    }
    const owner = around ? regions[around - 1]! : null;
    if (single && owner && keep(owner)) holes.push({ ...issue(gap), classId: owner.classId, region: owner.seed });
  });

  const layout = analyzeBoxes(regions.filter(keep).filter((region) => region.area >= speckArea(region.classId)).map((region, index) => ({ id: String(index), classId: region.classId, x0: region.x0, y0: region.y0, x1: region.x1, y1: region.y1 })));
  const findings = layout.findings.filter((finding) => finding.type !== "overlap");
  return {
    regions: regions.filter(keep).length,
    byClass,
    counts: {
      specks: specks.length, holes: holes.length, necked: necked.length, offEdges: offEdges.length,
      size: layout.counts.size, offLine: layout.counts["off-row"] + layout.counts["off-column"], missing: layout.counts.missing
    },
    specks, holes, necked, offEdges,
    layout: { findings, missing: layout.missing }
  };
}

export interface CleanOptions {
  classId?: string;
  /** Delete regions under this many pixels (0 = off). */
  removeSpecks?: number;
  /** Fill holes under this many pixels with the enclosing class (0 = off). */
  fillHoles?: number;
  /** Cut bridges narrower than 2 * px + 1 with a square opening of radius px (0 = off). */
  splitNecks?: number;
  /** Snap every region's boundary up to this many pixels onto the intensity step (0 = off; needs the image). */
  snapPx?: number;
}

export interface CleanResult { specksRemoved: number; holesFilled: number; necksCut: number; regionsSnapped: number; changed: number }

/** Applies the clean-up in place: specks, holes, necks, then snapping. */
export function cleanMask(mask: Uint16Array, width: number, height: number, image: GrayImage | null, options: CleanOptions): CleanResult {
  const result: CleanResult = { specksRemoved: 0, holesFilled: 0, necksCut: 0, regionsSnapped: 0, changed: 0 };
  const before = mask.slice();
  const set = (index: number, value: number) => { mask[index] = value; };
  const keep = (classId: string) => options.classId === undefined || classId === options.classId;
  if (options.removeSpecks) {
    const { regions, pixels } = maskRegions(mask, width, height, { withPixels: true });
    const ids = new Set(regions.map((region, index) => (keep(region.classId) && region.area < options.removeSpecks! ? index + 1 : 0)).filter(Boolean));
    result.specksRemoved = ids.size;
    if (ids.size) for (let index = 0; index < mask.length; index += 1) if (ids.has(pixels![index]!)) set(index, 0);
  }
  if (options.fillHoles) {
    const analysis = analyzeMask(mask, width, height, null, { ...(options.classId !== undefined ? { classId: options.classId } : {}), speckArea: 1, neckPx: 0 });
    const background = new Uint8Array(width * height);
    for (let index = 0; index < background.length; index += 1) background[index] = mask[index] ? 0 : 1;
    const gaps = maskRegions(background, width, height, { withPixels: true });
    for (const hole of analysis.holes.filter((entry) => entry.area < options.fillHoles!)) {
      const id = gaps.pixels![hole.seed.y * width + hole.seed.x]!;
      const value = mask[hole.region.y * width + hole.region.x]!;
      for (let y = hole.y0; y < hole.y1; y += 1) for (let x = hole.x0; x < hole.x1; x += 1) if (gaps.pixels![y * width + x] === id) set(y * width + x, value);
      result.holesFilled += 1;
    }
  }
  if (options.splitNecks) {
    const radius = options.splitNecks;
    const { regions, pixels } = maskRegions(mask, width, height, { withPixels: true });
    regions.forEach((region, index) => {
      if (!keep(region.classId) || region.area < 16) return;
      const crop = regionCrop(pixels!, width, region, index + 1);
      if (neckParts(crop, region.area, radius) < 2) return;
      // Opening = erosion then dilation; pixels it drops are the bridge (and nothing on axis-aligned corners).
      const eroded = erode(crop, radius);
      const opened = dilate(eroded, crop.width, crop.height, radius);
      for (let y = 0; y < crop.height; y += 1) {
        for (let x = 0; x < crop.width; x += 1) if (crop.bits[y * crop.width + x] && !opened[y * crop.width + x]) set((crop.y0 + y) * width + crop.x0 + x, 0);
      }
      result.necksCut += 1;
    });
  }
  if (options.snapPx && image) {
    const { regions, pixels } = maskRegions(mask, width, height, { withPixels: true });
    regions.forEach((region, index) => {
      if (!keep(region.classId)) return;
      const id = index + 1;
      const value = Number(region.classId);
      const crop = regionCrop(pixels!, width, region, id);
      const snapped = snapToIntensity(crop, image, options.snapPx!);
      if (snapped === crop) return;
      // Clear the old region, then paint the snapped one onto background and the old region only (never a neighbour).
      for (let y = 0; y < crop.height; y += 1) for (let x = 0; x < crop.width; x += 1) if (crop.bits[y * crop.width + x]) set((crop.y0 + y) * width + crop.x0 + x, 0);
      for (let y = 0; y < snapped.height; y += 1) {
        for (let x = 0; x < snapped.width; x += 1) {
          if (!snapped.bits[y * snapped.width + x]) continue;
          const at = (snapped.y0 + y) * width + snapped.x0 + x;
          if (mask[at] === 0 && (pixels![at] === 0 || pixels![at] === id)) set(at, value);
        }
      }
      result.regionsSnapped += 1;
    });
  }
  for (let index = 0; index < mask.length; index += 1) if (mask[index] !== before[index]) result.changed += 1;
  return result;
}
