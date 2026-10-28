import { isActiveSelectionObject, isRectObject, type FabricObjectLike, type FabricRectLike } from "./fabric-types.js";

export type ArrangeEdge = "left" | "right" | "top" | "bottom";
export type ArrangeAxis = "horizontal" | "vertical";

export interface RectBounds {
  left: number;
  top: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
}

export interface ArrangedRect {
  rect: FabricRectLike;
  bounds: RectBounds;
}

export interface SelectionBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export interface ArrangePositionPlan {
  rect: FabricRectLike;
  left: number;
  top: number;
}

export function extractVisibleRectSelection(activeObject: FabricObjectLike | null): FabricRectLike[] {
  if (!activeObject) {
    return [];
  }

  if (isActiveSelectionObject(activeObject)) {
    return activeObject
      .getObjects()
      .filter(isRectObject)
      .filter((rect) => rect.visible !== false);
  }

  if (isRectObject(activeObject) && activeObject.visible !== false) {
    return [activeObject];
  }

  return [];
}

export function getRectBounds(rect: FabricRectLike): RectBounds {
  const bounds = rect.getBoundingRect(true);
  return {
    left: bounds.left,
    top: bounds.top,
    width: bounds.width,
    height: bounds.height,
    right: bounds.left + bounds.width,
    bottom: bounds.top + bounds.height
  };
}

export function toArrangedRects(rects: readonly FabricRectLike[]): ArrangedRect[] {
  return rects.map((rect) => ({
    rect,
    bounds: getRectBounds(rect)
  }));
}

export function sortRectGeometrically(rects: readonly FabricRectLike[], axis: ArrangeAxis): ArrangedRect[] {
  const arranged = toArrangedRects(rects);
  const sorted = [...arranged];

  if (axis === "horizontal") {
    sorted.sort((a, b) => {
      return a.bounds.left - b.bounds.left || a.bounds.top - b.bounds.top || a.bounds.width - b.bounds.width || a.bounds.height - b.bounds.height;
    });
  } else {
    sorted.sort((a, b) => {
      return a.bounds.top - b.bounds.top || a.bounds.left - b.bounds.left || a.bounds.width - b.bounds.width || a.bounds.height - b.bounds.height;
    });
  }

  return sorted;
}

export function calculateSelectionBounds(rects: readonly FabricRectLike[]): SelectionBounds | null {
  if (rects.length === 0) {
    return null;
  }

  const arranged = toArrangedRects(rects);
  const left = Math.min(...arranged.map((item) => item.bounds.left));
  const top = Math.min(...arranged.map((item) => item.bounds.top));
  const right = Math.max(...arranged.map((item) => item.bounds.right));
  const bottom = Math.max(...arranged.map((item) => item.bounds.bottom));

  return {
    left,
    top,
    right,
    bottom,
    width: right - left,
    height: bottom - top
  };
}

export function planEdgeAlignment(rects: readonly FabricRectLike[], edge: ArrangeEdge): ArrangePositionPlan[] {
  if (rects.length < 2) {
    return [];
  }

  const bounds = calculateSelectionBounds(rects);
  if (!bounds) {
    return [];
  }

  return toArrangedRects(rects).map(({ rect, bounds: rectBounds }) => {
    if (edge === "left") {
      return { rect, left: bounds.left, top: rectBounds.top };
    }

    if (edge === "right") {
      return { rect, left: bounds.right - rectBounds.width, top: rectBounds.top };
    }

    if (edge === "top") {
      return { rect, left: rectBounds.left, top: bounds.top };
    }

    return { rect, left: rectBounds.left, top: bounds.bottom - rectBounds.height };
  });
}

interface CenteredRect extends ArrangedRect {
  cx: number;
  cy: number;
}

interface CenterGroup {
  mean: number;
  members: CenteredRect[];
}

function toCenteredRects(rects: readonly FabricRectLike[]): CenteredRect[] {
  return toArrangedRects(rects).map((item) => ({
    ...item,
    cx: item.bounds.left + item.bounds.width / 2,
    cy: item.bounds.top + item.bounds.height / 2
  }));
}

function median(values: readonly number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
}

// Walks centers in order; a box joins the current group while it lies within
// tolerance of the group's running mean center.
function clusterByCenter(items: readonly CenteredRect[], centerOf: (item: CenteredRect) => number, tolerance: number): CenterGroup[] {
  const groups: CenterGroup[] = [];
  [...items]
    .sort((a, b) => centerOf(a) - centerOf(b))
    .forEach((item) => {
      const center = centerOf(item);
      const group = groups[groups.length - 1];
      if (group && Math.abs(center - group.mean) <= tolerance) {
        group.members.push(item);
        group.mean += (center - group.mean) / group.members.length;
      } else {
        groups.push({ mean: center, members: [item] });
      }
    });
  return groups;
}

function planCentersOnGroupMeans(groups: readonly CenterGroup[], byColumn: boolean): ArrangePositionPlan[] {
  return groups.flatMap(({ mean, members }) =>
    members.map(({ rect, bounds }) =>
      byColumn ? { rect, left: mean - bounds.width / 2, top: bounds.top } : { rect, left: bounds.left, top: mean - bounds.height / 2 }
    )
  );
}

// Groups boxes into columns (or rows) whose centers lie within half the median
// box size, then moves each box onto its group's mean center.
export function planGroupedCenterAlignment(rects: readonly FabricRectLike[], groupBy: "column" | "row"): ArrangePositionPlan[] {
  if (rects.length < 2) {
    return [];
  }

  const byColumn = groupBy === "column";
  const items = toCenteredRects(rects);
  const tolerance = median(items.map(({ bounds }) => (byColumn ? bounds.width : bounds.height))) / 2;
  return planCentersOnGroupMeans(clusterByCenter(items, (item) => (byColumn ? item.cx : item.cy), tolerance), byColumn);
}

// Column centering for staggered layouts: rows are grouped into sets whose
// columns line up (rows 1-2 and 5-6 vs rows 3-4 and 7-8), and columns are
// centered within each set instead of across the whole selection.
export function planRowSetColumnCenterAlignment(rects: readonly FabricRectLike[]): ArrangePositionPlan[] {
  if (rects.length < 2) {
    return [];
  }

  const items = toCenteredRects(rects);
  const columnTolerance = median(items.map(({ bounds }) => bounds.width)) / 2;
  const rows = clusterByCenter(items, (item) => item.cy, median(items.map(({ bounds }) => bounds.height)) / 2);

  // ponytail: a row joins the set its boxes sit closest to on average (within a quarter
  // box width); sets offset by less than that plus the jitter still merge.
  const sets: CenteredRect[][] = [];
  rows.forEach(({ members }) => {
    let bestSet: CenteredRect[] | undefined;
    let bestResidual = columnTolerance / 2;
    sets.forEach((set) => {
      const columns = clusterByCenter(set, (item) => item.cx, columnTolerance).map((group) => group.mean);
      const distances = members
        .map((member) => Math.min(...columns.map((column) => Math.abs(member.cx - column))))
        .filter((distance) => distance <= columnTolerance);
      if (distances.length === 0) {
        return;
      }
      const residual = distances.reduce((sum, distance) => sum + distance, 0) / distances.length;
      if (residual <= bestResidual) {
        bestSet = set;
        bestResidual = residual;
      }
    });
    if (bestSet) {
      bestSet.push(...members);
    } else {
      sets.push([...members]);
    }
  });

  return sets.flatMap((set) => planCentersOnGroupMeans(clusterByCenter(set, (item) => item.cx, columnTolerance), true));
}

export function planEqualEdgeGapDistribution(rects: readonly FabricRectLike[], axis: ArrangeAxis): ArrangePositionPlan[] {
  if (rects.length < 3) {
    return [];
  }

  const ordered = sortRectGeometrically(rects, axis);
  const first = ordered[0];
  const last = ordered[ordered.length - 1];
  if (!first || !last) {
    return [];
  }

  const totalSize = ordered.reduce((sum, current) => {
    return sum + (axis === "horizontal" ? current.bounds.width : current.bounds.height);
  }, 0);

  const firstStart = axis === "horizontal" ? first.bounds.left : first.bounds.top;
  const lastEnd = axis === "horizontal" ? last.bounds.right : last.bounds.bottom;
  const equalGap = (lastEnd - firstStart - totalSize) / (ordered.length - 1);

  let cursor = firstStart + (axis === "horizontal" ? first.bounds.width : first.bounds.height) + equalGap;

  return ordered.slice(1, -1).map(({ rect, bounds }) => {
    if (axis === "horizontal") {
      const targetLeft = cursor;
      cursor += bounds.width + equalGap;
      return {
        rect,
        left: targetLeft,
        top: bounds.top
      };
    }

    const targetTop = cursor;
    cursor += bounds.height + equalGap;
    return {
      rect,
      left: bounds.left,
      top: targetTop
    };
  });
}
