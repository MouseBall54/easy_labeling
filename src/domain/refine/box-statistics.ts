/**
 * Population checks for boxes on one image, the way an expert scans a SEM/TEM label set: structures of one class
 * share a size and usually sit on rows and columns at a regular pitch, so a box that breaks the pattern is worth a
 * look. One class often holds several shapes (narrow and wide bars, pads, rails), so each class is first split into
 * size groups (similar width and height), and each group of four or more is checked on its own: size outliers (robust
 * median / MAD), boxes off their row or column, gaps where the pitch skips a position (a missed structure) and spacing
 * too tight for the pitch. Across all boxes, pairs of similar size that overlap are flagged as likely duplicates.
 * Units are whatever the boxes use (pixels or normalized); every rule is relative, so both work. DOM-free.
 */

export interface StatBox { id: string; classId: string; x0: number; y0: number; x1: number; y1: number }

export type BoxFindingType = "size" | "off-row" | "off-column" | "crowded" | "overlap";

export interface BoxFinding {
  id: string;
  classId: string;
  type: BoxFindingType;
  /** Plain-language reason with the numbers, e.g. "width 61 vs class median 48 (+27%)". */
  detail: string;
  /** How far from typical, as a share of the reference (0.27 = 27 %); for ranking. */
  deviation: number;
}

export interface MissingPosition {
  classId: string;
  /** Estimated centre of the missing box, and its size (the median of its size group). */
  x: number;
  y: number;
  width: number;
  height: number;
  /** The neighbours the gap lies between (ids) and the direction of the line. */
  between: [string, string];
  along: "row" | "column";
}

export interface SizeGroupStatistics {
  count: number;
  medianWidth: number;
  medianHeight: number;
  /** Rows / columns of three or more boxes, and their median centre pitch (0 without such lines). */
  rows: number;
  columns: number;
  rowPitch: number;
  columnPitch: number;
}

export interface ClassStatistics {
  count: number;
  medianWidth: number;
  medianHeight: number;
  /** Size groups of four or more boxes, largest first (at most 10 listed); each is checked on its own. */
  groups: SizeGroupStatistics[];
  /** Boxes in size groups under four: too few alike to judge, not checked for size, rows or gaps. */
  ungrouped: number;
}

export interface BoxStatistics {
  byClass: Record<string, ClassStatistics>;
  counts: Record<BoxFindingType | "missing", number>;
  findings: BoxFinding[];
  missing: MissingPosition[];
}

export interface BoxStatisticsOptions {
  /** A size this many robust deviations from the class median is an outlier (default 3.5). */
  sizeMad?: number;
  /** ...and it must also differ by at least this share of the median (default 0.15), so a near-uniform class does not flag 1 px. */
  sizeMinShare?: number;
  /** Centre offset from its row / column line, as a share of the class median height / width, that counts as off (default 0.2). */
  alignShare?: number;
  /** A gap this many pitches wide (±25 %) holds missing boxes (default from 1.75). */
  gapPitches?: number;
  /** Spacing under this share of the pitch is crowded (default 0.6). */
  crowdedShare?: number;
  /** Boxes whose width and height each lie within this ratio of their size group's are one shape (default 1.3). */
  sizeGroupRatio?: number;
  /** Gaps wider than this many pitches are open space, not missed boxes (default 4, so up to 3 missing in a row). */
  maxGapPitches?: number;
  /** Two boxes of similar size (each side within 0.7..1.43 of the other) overlapping by this IoU or more are likely duplicates (default 0.2). */
  overlapIou?: number;
}

const median = (values: readonly number[]): number => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = sorted.length >> 1;
  return sorted.length % 2 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2;
};

/** Values keep five significant digits (pixels or normalized 0..1 alike); shares keep `digits` decimals. */
const round = (value: number, digits?: number): number => Number(digits === undefined ? value.toPrecision(5) : value.toFixed(digits));
const signedPercent = (share: number): string => `${share >= 0 ? "+" : ""}${Math.round(share * 100)}%`;

interface Placed { box: StatBox; cx: number; cy: number; w: number; h: number }

/** Groups boxes whose `key` lies within `tolerance` of the running group (sorted sweep). */
function group(items: Placed[], key: (item: Placed) => number, tolerance: number): Placed[][] {
  const sorted = [...items].sort((a, b) => key(a) - key(b));
  const groups: Placed[][] = [];
  let current: Placed[] = [];
  let centre = 0;
  for (const item of sorted) {
    if (current.length && Math.abs(key(item) - centre) > tolerance) {
      groups.push(current);
      current = [];
    }
    current.push(item);
    centre = current.reduce((sum, entry) => sum + key(entry), 0) / current.length;
  }
  if (current.length) groups.push(current);
  return groups;
}

export function analyzeBoxes(boxes: readonly StatBox[], options: BoxStatisticsOptions = {}): BoxStatistics {
  const sizeMad = options.sizeMad ?? 3.5;
  const sizeMinShare = options.sizeMinShare ?? 0.15;
  const alignShare = options.alignShare ?? 0.2;
  const gapPitches = options.gapPitches ?? 1.75;
  const crowdedShare = options.crowdedShare ?? 0.6;
  const sizeTolerance = Math.log(options.sizeGroupRatio ?? 1.3);
  const maxGapPitches = options.maxGapPitches ?? 4;
  const overlapIou = options.overlapIou ?? 0.2;
  const byClass: Record<string, ClassStatistics> = {};
  const findings: BoxFinding[] = [];
  const missing: MissingPosition[] = [];
  const classes = new Map<string, Placed[]>();
  const placed: Placed[] = [];
  const gapCandidates: Array<{ pitch: number; spot: MissingPosition }> = [];
  for (const box of boxes) {
    const w = box.x1 - box.x0;
    const h = box.y1 - box.y0;
    if (!(w > 0 && h > 0)) continue;
    const item = { box, cx: (box.x0 + box.x1) / 2, cy: (box.y0 + box.y1) / 2, w, h };
    placed.push(item);
    const list = classes.get(box.classId) ?? [];
    list.push(item);
    classes.set(box.classId, list);
  }
  // A gap is a missed box only where nothing else is: rows of one shape often skip the places another shape fills.
  // ponytail: linear scan per candidate; candidates are few next to boxes.
  const occupied = (x: number, y: number, w: number, h: number) => placed.some(({ box }) => {
    const overlapW = Math.min(box.x1, x + w / 2) - Math.max(box.x0, x - w / 2);
    const overlapH = Math.min(box.y1, y + h / 2) - Math.max(box.y0, y - h / 2);
    // Either way round: a narrower box sitting mostly inside the spot fills it too.
    return overlapW > 0 && overlapH > 0 && overlapW * overlapH >= 0.25 * Math.min(w * h, (box.x1 - box.x0) * (box.y1 - box.y0));
  });
  for (const [classId, all] of classes) {
    // Size groups: similar width, then similar height within it (log scale, so the ratio is what counts).
    const sizeGroups = group(all, (item) => Math.log(item.w), sizeTolerance)
      .flatMap((byWidth) => group(byWidth, (item) => Math.log(item.h), sizeTolerance))
      .sort((a, b) => b.length - a.length);
    const checked = sizeGroups.filter((items) => items.length >= 4); // too few alike to call anything typical
    const stats: ClassStatistics = {
      count: all.length, medianWidth: round(median(all.map((item) => item.w))), medianHeight: round(median(all.map((item) => item.h))),
      groups: [], ungrouped: all.length - checked.reduce((sum, items) => sum + items.length, 0)
    };
    byClass[classId] = stats;
    for (const items of checked) {
      const medianWidth = median(items.map((item) => item.w));
      const medianHeight = median(items.map((item) => item.h));
      const groupStats: SizeGroupStatistics = { count: items.length, medianWidth: round(medianWidth), medianHeight: round(medianHeight), rows: 0, columns: 0, rowPitch: 0, columnPitch: 0 };
      if (stats.groups.length < 10) stats.groups.push(groupStats);

      // Size: robust deviation (MAD scaled to a standard deviation) and a minimum relative difference.
      for (const [dimension, values, reference] of [["width", items.map((item) => item.w), medianWidth], ["height", items.map((item) => item.h), medianHeight]] as const) {
        const spread = 1.4826 * median(values.map((value) => Math.abs(value - reference)));
        items.forEach((item, index) => {
          const value = values[index]!;
          const share = (value - reference) / reference;
          if (Math.abs(share) >= sizeMinShare && Math.abs(value - reference) > sizeMad * Math.max(spread, reference * 0.01)) {
            findings.push({ id: item.box.id, classId, type: "size", detail: `${dimension} ${round(value)} vs ${round(reference)}, the median of its ${round(medianWidth)}x${round(medianHeight)} size group (${signedPercent(share)})`, deviation: round(Math.abs(share), 3) });
          }
        });
      }

      // Rows (centres within half a median height) and columns (half a median width), three boxes or more.
      const lines = (along: "row" | "column") => {
        const across = along === "row" ? (item: Placed) => item.cy : (item: Placed) => item.cx;
        const position = along === "row" ? (item: Placed) => item.cx : (item: Placed) => item.cy;
        const size = along === "row" ? medianHeight : medianWidth;
        const extent = along === "row" ? medianWidth : medianHeight;
        const found = group(items, across, size / 2).filter((line) => line.length >= 3);
        const gaps: number[] = [];
        for (const line of found) {
          line.sort((a, b) => position(a) - position(b));
          for (let index = 1; index < line.length; index += 1) gaps.push(position(line[index]!) - position(line[index - 1]!));
        }
        // The pitch is the typical gap between neighbours; gaps that skip positions are longer, so take the lower half's median.
        const sortedGaps = [...gaps].sort((a, b) => a - b);
        const pitch = median(sortedGaps.slice(0, Math.max(1, Math.ceil(sortedGaps.length / 2))));
        for (const line of found) {
          const centre = median(line.map(across));
          for (const item of line) {
            const offset = across(item) - centre;
            if (Math.abs(offset) > alignShare * size) {
              findings.push({
                id: item.box.id, classId, type: along === "row" ? "off-row" : "off-column",
                detail: `centre ${round(Math.abs(offset))} ${along === "row" ? (offset > 0 ? "below" : "above") : (offset > 0 ? "right of" : "left of")} its ${along} (${signedPercent(Math.abs(offset) / size)} of the group ${along === "row" ? "height" : "width"})`,
                deviation: round(Math.abs(offset) / size, 3)
              });
            }
          }
          if (!(pitch > extent * 0.5)) continue; // touching or overlapping boxes have no pitch to check against
          for (let index = 1; index < line.length; index += 1) {
            const a = line[index - 1]!;
            const b = line[index]!;
            const gap = position(b) - position(a);
            const steps = Math.round(gap / pitch);
            if (gap / pitch >= gapPitches && gap / pitch <= maxGapPitches + 0.25 && Math.abs(gap / pitch - steps) <= 0.25 * steps) {
              for (let step = 1; step < steps; step += 1) {
                const t = step / steps;
                const x = along === "row" ? a.cx + (b.cx - a.cx) * t : (a.cx + b.cx) / 2;
                const y = along === "row" ? (a.cy + b.cy) / 2 : a.cy + (b.cy - a.cy) * t;
                if (!occupied(x, y, medianWidth, medianHeight)) gapCandidates.push({ pitch, spot: { classId, between: [a.box.id, b.box.id], along, x, y, width: medianWidth, height: medianHeight } });
              }
            } else if (gap < crowdedShare * pitch && !findings.some((finding) => finding.type === "crowded" && finding.id === b.box.id)) {
              findings.push({ id: b.box.id, classId, type: "crowded", detail: `${round(gap)} from its ${along} neighbour ${a.box.id}, pitch ${round(pitch)} (${signedPercent(gap / pitch - 1)})`, deviation: round(1 - gap / pitch, 3) });
            }
          }
        }
        return { count: found.length, pitch };
      };
      const rows = lines("row");
      const columns = lines("column");
      Object.assign(groupStats, { rows: rows.count, columns: columns.count, rowPitch: round(rows.pitch), columnPitch: round(columns.pitch) });
    }
    // A box too unlike the rest to share a group, but within 2x of the nearest group's size, is that shape drawn off size.
    // Larger differences (rails, pads) are other shapes and stay unjudged.
    const typical = checked.map((items) => ({ w: median(items.map((item) => item.w)), h: median(items.map((item) => item.h)) }));
    for (const item of sizeGroups.filter((items) => items.length < 4).flat()) {
      const distance = (size: { w: number; h: number }) => Math.abs(Math.log(item.w / size.w)) + Math.abs(Math.log(item.h / size.h));
      const nearest = typical.reduce<{ w: number; h: number } | null>((best, size) => (!best || distance(size) < distance(best) ? size : best), null);
      if (!nearest || Math.abs(Math.log(item.w / nearest.w)) > Math.LN2 || Math.abs(Math.log(item.h / nearest.h)) > Math.LN2) continue;
      for (const [dimension, value, reference] of [["width", item.w, nearest.w], ["height", item.h, nearest.h]] as const) {
        const share = (value - reference) / reference;
        if (Math.abs(share) >= sizeMinShare) {
          findings.push({ id: item.box.id, classId, type: "size", detail: `${dimension} ${round(value)} vs ${round(reference)}, the median of the nearest size group (${round(nearest.w)}x${round(nearest.h)}) (${signedPercent(share)})`, deviation: round(Math.abs(share), 3) });
        }
      }
    }
  }
  // Duplicates: similar-size boxes (any class) that overlap. Sweep by left edge; the right-hand box of a pair is flagged.
  const byLeft = [...placed].sort((a, b) => a.box.x0 - b.box.x0);
  for (let i = 0; i < byLeft.length; i += 1) {
    const a = byLeft[i]!;
    for (let j = i + 1; j < byLeft.length && byLeft[j]!.box.x0 < a.box.x1; j += 1) {
      const b = byLeft[j]!;
      if (Math.min(a.w, b.w) / Math.max(a.w, b.w) < 0.7 || Math.min(a.h, b.h) / Math.max(a.h, b.h) < 0.7) continue;
      const w = Math.min(a.box.x1, b.box.x1) - b.box.x0;
      const h = Math.min(a.box.y1, b.box.y1) - Math.max(a.box.y0, b.box.y0);
      if (!(w > 0 && h > 0)) continue;
      const iou = (w * h) / (a.w * a.h + b.w * b.h - w * h);
      if (iou < overlapIou) continue;
      const classNote = a.box.classId === b.box.classId ? "" : `, class ${a.box.classId} vs ${b.box.classId}`;
      findings.push({ id: b.box.id, classId: b.box.classId, type: "overlap", detail: `overlaps ${a.box.id} (IoU ${iou.toFixed(2)}, similar size${classNote}): likely a duplicate`, deviation: round(iou, 3) });
    }
  }
  // One box can break a row and a column at once; keep both, largest first.
  // One hole often shows in a row and a column, or in two size groups that disagree on its shape: keep one estimate per
  // spot, from the shortest pitch (the closest neighbours say most about what belongs there).
  gapCandidates.sort((a, b) => a.pitch - b.pitch);
  for (const { spot } of gapCandidates) {
    const clash = missing.some((entry) => {
      const overlapW = Math.min(entry.x + entry.width / 2, spot.x + spot.width / 2) - Math.max(entry.x - entry.width / 2, spot.x - spot.width / 2);
      const overlapH = Math.min(entry.y + entry.height / 2, spot.y + spot.height / 2) - Math.max(entry.y - entry.height / 2, spot.y - spot.height / 2);
      return overlapW > 0 && overlapH > 0 && overlapW * overlapH >= 0.25 * Math.min(entry.width * entry.height, spot.width * spot.height);
    });
    if (!clash) missing.push(spot);
  }
  for (const spot of missing) Object.assign(spot, { x: round(spot.x), y: round(spot.y), width: round(spot.width), height: round(spot.height) });
  findings.sort((a, b) => b.deviation - a.deviation);
  const counts = { size: 0, "off-row": 0, "off-column": 0, crowded: 0, overlap: 0, missing: missing.length };
  for (const finding of findings) counts[finding.type] += 1;
  return { byClass, counts, findings, missing };
}
