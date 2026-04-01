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
