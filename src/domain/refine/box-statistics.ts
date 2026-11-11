/**
 * Population checks for boxes on one image, the way an expert scans a SEM/TEM label set: structures of one class
 * share a size and usually sit on rows and columns at a regular pitch, so a box that breaks the pattern is worth a
 * look. Per class: size outliers (robust median / MAD), boxes off their row or column, gaps where the pitch skips a
 * position (a missed structure) and spacing too tight for the pitch (a duplicate). Units are whatever the boxes use
 * (pixels or normalized); every rule is relative, so both work. DOM-free.
 */

export interface StatBox { id: string; classId: string; x0: number; y0: number; x1: number; y1: number }

export type BoxFindingType = "size" | "off-row" | "off-column" | "crowded";

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
  /** Estimated centre of the missing box. */
  x: number;
  y: number;
  /** The neighbours the gap lies between (ids) and the direction of the line. */
  between: [string, string];
  along: "row" | "column";
}

export interface ClassStatistics {
  count: number;
  medianWidth: number;
  medianHeight: number;
  /** Rows / columns of three or more boxes, and their median centre pitch (0 without such lines). */
  rows: number;
  columns: number;
  rowPitch: number;
  columnPitch: number;
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
  const byClass: Record<string, ClassStatistics> = {};
  const findings: BoxFinding[] = [];
  const missing: MissingPosition[] = [];
  const classes = new Map<string, Placed[]>();
  for (const box of boxes) {
    const w = box.x1 - box.x0;
    const h = box.y1 - box.y0;
    if (!(w > 0 && h > 0)) continue;
    const list = classes.get(box.classId) ?? [];
    list.push({ box, cx: (box.x0 + box.x1) / 2, cy: (box.y0 + box.y1) / 2, w, h });
    classes.set(box.classId, list);
  }
  for (const [classId, items] of classes) {
    const medianWidth = median(items.map((item) => item.w));
    const medianHeight = median(items.map((item) => item.h));
    const stats: ClassStatistics = { count: items.length, medianWidth: round(medianWidth), medianHeight: round(medianHeight), rows: 0, columns: 0, rowPitch: 0, columnPitch: 0 };
    byClass[classId] = stats;
    if (items.length < 4) continue; // too few to call anything typical

    // Size: robust deviation (MAD scaled to a standard deviation) and a minimum relative difference.
    for (const [dimension, values, reference] of [["width", items.map((item) => item.w), medianWidth], ["height", items.map((item) => item.h), medianHeight]] as const) {
      const spread = 1.4826 * median(values.map((value) => Math.abs(value - reference)));
      items.forEach((item, index) => {
        const value = values[index]!;
        const share = (value - reference) / reference;
        if (Math.abs(share) >= sizeMinShare && Math.abs(value - reference) > sizeMad * Math.max(spread, reference * 0.01)) {
          findings.push({ id: item.box.id, classId, type: "size", detail: `${dimension} ${round(value)} vs class median ${round(reference)} (${signedPercent(share)})`, deviation: round(Math.abs(share), 3) });
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
              detail: `centre ${round(Math.abs(offset))} ${along === "row" ? (offset > 0 ? "below" : "above") : (offset > 0 ? "right of" : "left of")} its ${along} (${signedPercent(Math.abs(offset) / size)} of the class ${along === "row" ? "height" : "width"})`,
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
          if (gap / pitch >= gapPitches && Math.abs(gap / pitch - steps) <= 0.25 * steps) {
            for (let step = 1; step < steps; step += 1) {
              const t = step / steps;
              const x = along === "row" ? a.cx + (b.cx - a.cx) * t : (a.cx + b.cx) / 2;
              const y = along === "row" ? (a.cy + b.cy) / 2 : a.cy + (b.cy - a.cy) * t;
              // On a grid the same hole shows in its row and its column: keep it once.
              const seen = missing.some((entry) => entry.classId === classId && Math.abs(entry.x - x) < medianWidth / 2 && Math.abs(entry.y - y) < medianHeight / 2);
              if (!seen) missing.push({ classId, between: [a.box.id, b.box.id], along, x: round(x), y: round(y) });
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
    Object.assign(stats, { rows: rows.count, columns: columns.count, rowPitch: round(rows.pitch), columnPitch: round(columns.pitch) });
  }
  // One box can break a row and a column at once; keep both, largest first.
  findings.sort((a, b) => b.deviation - a.deviation);
  const counts = { size: 0, "off-row": 0, "off-column": 0, crowded: 0, missing: missing.length };
  for (const finding of findings) counts[finding.type] += 1;
  return { byClass, counts, findings, missing };
}
