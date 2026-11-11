/**
 * Scores segmentation class masks against reference (ground truth) masks, the way compare_labels scores boxes: per
 * class pixel IoU / Dice, boundary F1 within a pixel tolerance (SEM measurements hang on a few boundary pixels), the
 * mean outward offset of the boundary, pixel confusions, and region-level misses, extras and wrong classes. DOM-free.
 */
import { maskRegions, type MaskRegion } from "./mask-regions.js";

interface ClassCounts {
  /** Pixels: both masks have the class / only the labels / only the reference. */
  tp: number;
  fp: number;
  fn: number;
  /** Boundary pixels of the reference and of the labels, and how many lie within the tolerance of the other's. */
  referenceBoundary: number;
  referenceBoundaryHit: number;
  labelBoundary: number;
  labelBoundaryHit: number;
}

export interface RegionIssue extends MaskRegion {
  /** Share of the region's pixels the other mask gives the same class (0..1). */
  covered: number;
  /** For a wrong-class region: the class the labels mostly give it. */
  labelClassId?: string;
}

export interface ImageMaskMatch {
  image: string;
  width: number;
  height: number;
  classes: Record<string, ClassCounts>;
  /** "referenceClass->labelClass": pixels both masks label, with different classes. */
  confusions: Record<string, number>;
  referenceRegions: number;
  labelRegions: number;
  /** Reference regions the labels barely cover with their class (under MISSED_SHARE) and do not mostly give another class. */
  misses: RegionIssue[];
  /** Label regions the reference barely covers with their class (under MISSED_SHARE). */
  extras: RegionIssue[];
  /** Reference regions the labels mostly cover with another class. */
  wrongClass: RegionIssue[];
}

export interface ClassScore {
  referencePixels: number;
  labelPixels: number;
  iou: number;
  dice: number;
  precision: number;
  recall: number;
  boundaryPrecision: number;
  boundaryRecall: number;
  boundaryF1: number;
  /** (label pixels - reference pixels) / reference boundary length: + = labels reach this many px further out on average. */
  outwardPx: number;
}

export interface MaskComparison {
  images: number;
  tolerancePx: number;
  /** Mean IoU over the classes in the reference. */
  meanIou: number;
  /** Boundary F1 over every class's boundary pixels together. */
  boundaryF1: number;
  classes: Record<string, ClassScore>;
  confusions: Record<string, number>;
  regions: { reference: number; labels: number; misses: number; extras: number; wrongClass: number };
  /** Lowest mean IoU first. */
  perImage: Array<{ image: string; meanIou: number; boundaryF1: number; misses: number; extras: number; wrongClass: number }>;
  worst: { misses: Array<RegionIssue & { image: string }>; extras: Array<RegionIssue & { image: string }>; wrongClass: Array<RegionIssue & { image: string }> };
}

/** A region covered under this share is missing (or extra); a larger but partial cover is a size or boundary error, which IoU and boundary F1 measure. */
const MISSED_SHARE = 0.2;
const round3 = (value: number): number => Math.round(value * 1000) / 1000;
const ratio = (a: number, b: number): number => (b > 0 ? a / b : 1);

/** Pixels of `classId` with a 4-neighbour of another value (image edges do not count as boundary). */
function boundary(mask: ArrayLike<number>, width: number, height: number, classId: number): Uint8Array {
  const out = new Uint8Array(width * height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      if (mask[index] !== classId) continue;
      if ((x > 0 && mask[index - 1] !== classId) || (x < width - 1 && mask[index + 1] !== classId) || (y > 0 && mask[index - width] !== classId) || (y < height - 1 && mask[index + width] !== classId)) out[index] = 1;
    }
  }
  return out;
}

/** Square dilation by `radius` (separable running counts); O(pixels). */
export function dilate(bits: Uint8Array, width: number, height: number, radius: number): Uint8Array {
  if (radius <= 0) return bits;
  const rows = new Uint8Array(bits.length);
  for (let y = 0; y < height; y += 1) {
    let count = 0;
    const row = y * width;
    for (let x = 0; x < Math.min(radius, width); x += 1) count += bits[row + x]!;
    for (let x = 0; x < width; x += 1) {
      if (x + radius < width) count += bits[row + x + radius]!;
      if (x - radius - 1 >= 0) count -= bits[row + x - radius - 1]!;
      rows[row + x] = count > 0 ? 1 : 0;
    }
  }
  const out = new Uint8Array(bits.length);
  for (let x = 0; x < width; x += 1) {
    let count = 0;
    for (let y = 0; y < Math.min(radius, height); y += 1) count += rows[y * width + x]!;
    for (let y = 0; y < height; y += 1) {
      if (y + radius < height) count += rows[(y + radius) * width + x]!;
      if (y - radius - 1 >= 0) count -= rows[(y - radius - 1) * width + x]!;
      out[y * width + x] = count > 0 ? 1 : 0;
    }
  }
  return out;
}

export function matchMasks(image: string, labels: ArrayLike<number>, reference: ArrayLike<number>, width: number, height: number, tolerancePx = 2): ImageMaskMatch {
  const classes: Record<string, ClassCounts> = {};
  const counts = (classId: number): ClassCounts => (classes[String(classId)] ??= { tp: 0, fp: 0, fn: 0, referenceBoundary: 0, referenceBoundaryHit: 0, labelBoundary: 0, labelBoundaryHit: 0 });
  const confusions: Record<string, number> = {};
  for (let index = 0; index < width * height; index += 1) {
    const label = labels[index]!;
    const truth = reference[index]!;
    if (label === truth) { if (truth > 0) counts(truth).tp += 1; continue; }
    if (label > 0) counts(label).fp += 1;
    if (truth > 0) counts(truth).fn += 1;
    if (label > 0 && truth > 0) confusions[`${truth}->${label}`] = (confusions[`${truth}->${label}`] ?? 0) + 1;
  }
  for (const key of Object.keys(classes)) {
    const classId = Number(key);
    const truthEdge = boundary(reference, width, height, classId);
    const labelEdge = boundary(labels, width, height, classId);
    const truthNear = dilate(truthEdge, width, height, tolerancePx);
    const labelNear = dilate(labelEdge, width, height, tolerancePx);
    const entry = classes[key]!;
    for (let index = 0; index < truthEdge.length; index += 1) {
      if (truthEdge[index]) { entry.referenceBoundary += 1; if (labelNear[index]) entry.referenceBoundaryHit += 1; }
      if (labelEdge[index]) { entry.labelBoundary += 1; if (truthNear[index]) entry.labelBoundaryHit += 1; }
    }
  }
  // Regions: how much of each region the other mask gives the same class (or which other class it mostly gets).
  const truthRegions = maskRegions(reference, width, height, { withPixels: true });
  const labelRegions = maskRegions(labels, width, height, { withPixels: true });
  const truthSame = new Float64Array(truthRegions.regions.length);
  const truthOther = new Map<number, Map<number, number>>();
  const labelSame = new Float64Array(labelRegions.regions.length);
  for (let index = 0; index < width * height; index += 1) {
    const truthRegion = truthRegions.pixels![index]!;
    const labelRegion = labelRegions.pixels![index]!;
    if (truthRegion) {
      if (labels[index] === reference[index]) truthSame[truthRegion - 1] += 1;
      else if (labels[index]! > 0) {
        const other = truthOther.get(truthRegion - 1) ?? new Map<number, number>();
        other.set(labels[index]!, (other.get(labels[index]!) ?? 0) + 1);
        truthOther.set(truthRegion - 1, other);
      }
    }
    if (labelRegion && labels[index] === reference[index]) labelSame[labelRegion - 1] += 1;
  }
  const misses: RegionIssue[] = [];
  const wrongClass: RegionIssue[] = [];
  truthRegions.regions.forEach((region, index) => {
    const covered = truthSame[index]! / region.area;
    if (covered >= MISSED_SHARE) return;
    const [otherClass, otherPixels] = [...(truthOther.get(index) ?? new Map<number, number>())].sort((a, b) => b[1] - a[1])[0] ?? [0, 0];
    if (otherPixels / region.area >= 0.5) wrongClass.push({ ...region, covered: round3(covered), labelClassId: String(otherClass) });
    else misses.push({ ...region, covered: round3(covered) });
  });
  const extras: RegionIssue[] = [];
  labelRegions.regions.forEach((region, index) => {
    const covered = labelSame[index]! / region.area;
    // A label region on a wrong-class reference region is already counted there.
    if (covered < MISSED_SHARE && !wrongClass.some((issue) => issue.labelClassId === region.classId && region.x0 < issue.x1 && issue.x0 < region.x1 && region.y0 < issue.y1 && issue.y0 < region.y1)) {
      extras.push({ ...region, covered: round3(covered) });
    }
  });
  return { image, width, height, classes, confusions, referenceRegions: truthRegions.regions.length, labelRegions: labelRegions.regions.length, misses, extras, wrongClass };
}

function score(counts: ClassCounts): ClassScore {
  const boundaryPrecision = ratio(counts.labelBoundaryHit, counts.labelBoundary);
  const boundaryRecall = ratio(counts.referenceBoundaryHit, counts.referenceBoundary);
  return {
    referencePixels: counts.tp + counts.fn,
    labelPixels: counts.tp + counts.fp,
    iou: round3(ratio(counts.tp, counts.tp + counts.fp + counts.fn)),
    dice: round3(ratio(2 * counts.tp, 2 * counts.tp + counts.fp + counts.fn)),
    precision: round3(ratio(counts.tp, counts.tp + counts.fp)),
    recall: round3(ratio(counts.tp, counts.tp + counts.fn)),
    boundaryPrecision: round3(boundaryPrecision),
    boundaryRecall: round3(boundaryRecall),
    boundaryF1: round3(boundaryPrecision + boundaryRecall > 0 ? (2 * boundaryPrecision * boundaryRecall) / (boundaryPrecision + boundaryRecall) : 0),
    outwardPx: Math.round(ratio(counts.fp - counts.fn, counts.referenceBoundary) * 100) / 100
  };
}

function totals(entries: Iterable<ClassCounts>): ClassCounts {
  const sum: ClassCounts = { tp: 0, fp: 0, fn: 0, referenceBoundary: 0, referenceBoundaryHit: 0, labelBoundary: 0, labelBoundaryHit: 0 };
  for (const entry of entries) for (const key of Object.keys(sum) as Array<keyof ClassCounts>) sum[key] += entry[key];
  return sum;
}

const meanIouOf = (classes: Record<string, ClassScore>): number => {
  const present = Object.values(classes).filter((entry) => entry.referencePixels > 0);
  return present.length ? round3(present.reduce((sum, entry) => sum + entry.iou, 0) / present.length) : 1;
};

export function summarizeMaskComparison(images: readonly ImageMaskMatch[], options: { tolerancePx?: number; outliers?: number } = {}): MaskComparison {
  const outliers = options.outliers ?? 20;
  const byClass = new Map<string, ClassCounts[]>();
  const confusions: Record<string, number> = {};
  for (const image of images) {
    for (const [classId, counts] of Object.entries(image.classes)) byClass.set(classId, [...(byClass.get(classId) ?? []), counts]);
    for (const [pair, pixels] of Object.entries(image.confusions)) confusions[pair] = (confusions[pair] ?? 0) + pixels;
  }
  const classes = Object.fromEntries([...byClass].sort(([a], [b]) => Number(a) - Number(b)).map(([classId, list]) => [classId, score(totals(list))]));
  const all = score(totals([...byClass.values()].flat()));
  const flatten = (pick: (image: ImageMaskMatch) => RegionIssue[]) => images.flatMap((image) => pick(image).map((issue) => ({ image: image.image, ...issue }))).sort((a, b) => b.area - a.area).slice(0, outliers);
  return {
    images: images.length,
    tolerancePx: options.tolerancePx ?? 2,
    meanIou: meanIouOf(classes),
    boundaryF1: all.boundaryF1,
    classes,
    confusions,
    regions: {
      reference: images.reduce((sum, image) => sum + image.referenceRegions, 0),
      labels: images.reduce((sum, image) => sum + image.labelRegions, 0),
      misses: images.reduce((sum, image) => sum + image.misses.length, 0),
      extras: images.reduce((sum, image) => sum + image.extras.length, 0),
      wrongClass: images.reduce((sum, image) => sum + image.wrongClass.length, 0)
    },
    perImage: images.map((image) => {
      const imageClasses = Object.fromEntries(Object.entries(image.classes).map(([classId, counts]) => [classId, score(counts)]));
      return { image: image.image, meanIou: meanIouOf(imageClasses), boundaryF1: score(totals(Object.values(image.classes))).boundaryF1, misses: image.misses.length, extras: image.extras.length, wrongClass: image.wrongClass.length };
    }).sort((a, b) => a.meanIou - b.meanIou),
    worst: { misses: flatten((image) => image.misses), extras: flatten((image) => image.extras), wrongClass: flatten((image) => image.wrongClass) }
  };
}
