import type { LabelDisplayMode } from "../../types/labels.js";

export interface AnnotationLabelBounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface AnnotationLabelItem {
  annotationId: string;
  classId: string;
  displayName: string;
  bounds: AnnotationLabelBounds;
}

export interface AnnotationLabelPlacement {
  annotationId: string;
  visible: boolean;
  text: string;
  representation: "full" | "compact" | "hidden";
  left: number;
  top: number;
  width: number;
  height: number;
  fontSize: number;
  priority: number;
}

export interface AnnotationLabelLayoutInput {
  items: readonly AnnotationLabelItem[];
  mode: LabelDisplayMode;
  zoom: number;
  imageBounds: AnnotationLabelBounds;
  visibleSceneBounds?: AnnotationLabelBounds;
  selectedAnnotationIds?: ReadonlySet<string>;
  hoveredAnnotationId?: string | null;
  preferredFontSizePx?: number;
  measureText?: (text: string, fontSizePx: number) => number;
}

interface IndexedBounds extends AnnotationLabelBounds {
  right: number;
  bottom: number;
}

interface PlacementCandidate {
  left: number;
  top: number;
}

function toIndexedBounds(bounds: AnnotationLabelBounds): IndexedBounds {
  return {
    ...bounds,
    right: bounds.left + bounds.width,
    bottom: bounds.top + bounds.height
  };
}

function intersects(left: AnnotationLabelBounds, right: AnnotationLabelBounds): boolean {
  return left.left < right.left + right.width &&
    left.left + left.width > right.left &&
    left.top < right.top + right.height &&
    left.top + left.height > right.top;
}

function clamp(value: number, minimum: number, maximum: number): number {
  if (maximum < minimum) {
    return minimum;
  }
  return Math.min(maximum, Math.max(minimum, value));
}

function defaultMeasureText(text: string, fontSizePx: number): number {
  return Math.max(fontSizePx, text.length * fontSizePx * 0.62);
}

function fitText(
  text: string,
  maximumWidthPx: number,
  fontSizePx: number,
  measureText: (text: string, fontSizePx: number) => number
): string {
  if (measureText(text, fontSizePx) <= maximumWidthPx) {
    return text;
  }
  const ellipsis = "...";
  let low = 0;
  let high = text.length;
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    const candidate = `${text.slice(0, middle)}${ellipsis}`;
    if (measureText(candidate, fontSizePx) <= maximumWidthPx) {
      low = middle;
    } else {
      high = middle - 1;
    }
  }
  return low > 0 ? `${text.slice(0, low)}${ellipsis}` : ellipsis;
}

function isOutsideViewport(bounds: AnnotationLabelBounds, viewport: AnnotationLabelBounds): boolean {
  return !intersects(bounds, viewport);
}

function resolveRepresentation(input: {
  mode: LabelDisplayMode;
  selected: boolean;
  hovered: boolean;
  screenWidth: number;
  screenHeight: number;
  density: number;
  zoom: number;
}): "full" | "compact" | "hidden" {
  if (input.mode === "off") {
    return "hidden";
  }
  if (input.selected || input.hovered) {
    return "full";
  }
  if (input.mode === "selected") {
    return "hidden";
  }
  if (input.mode === "full") {
    return "full";
  }
  if (input.mode === "compact") {
    return input.screenWidth >= 18 && input.screenHeight >= 12 ? "compact" : "hidden";
  }
  if (input.screenWidth < 20 || input.screenHeight < 14) {
    return "hidden";
  }
  if (input.zoom >= 1.25 && input.screenWidth >= 96 && input.density < 0.7) {
    return "full";
  }
  return "compact";
}

class SpatialLabelIndex {
  private readonly cells = new Map<string, IndexedBounds[]>();

  constructor(private readonly cellSize: number) {}

  private keys(bounds: IndexedBounds): string[] {
    const left = Math.floor(bounds.left / this.cellSize);
    const right = Math.floor(Math.max(bounds.left, bounds.right - Number.EPSILON) / this.cellSize);
    const top = Math.floor(bounds.top / this.cellSize);
    const bottom = Math.floor(Math.max(bounds.top, bounds.bottom - Number.EPSILON) / this.cellSize);
    const keys: string[] = [];
    for (let y = top; y <= bottom; y += 1) {
      for (let x = left; x <= right; x += 1) {
        keys.push(`${x}:${y}`);
      }
    }
    return keys;
  }

  collides(bounds: IndexedBounds): boolean {
    const seen = new Set<IndexedBounds>();
    for (const key of this.keys(bounds)) {
      for (const candidate of this.cells.get(key) ?? []) {
        if (seen.has(candidate)) {
          continue;
        }
        seen.add(candidate);
        if (intersects(bounds, candidate)) {
          return true;
        }
      }
    }
    return false;
  }

  add(bounds: IndexedBounds): void {
    for (const key of this.keys(bounds)) {
      const cell = this.cells.get(key) ?? [];
      cell.push(bounds);
      this.cells.set(key, cell);
    }
  }
}

function hiddenPlacement(annotationId: string): AnnotationLabelPlacement {
  return {
    annotationId,
    visible: false,
    text: "",
    representation: "hidden",
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    fontSize: 0,
    priority: 0
  };
}

export function layoutAnnotationLabels(input: AnnotationLabelLayoutInput): AnnotationLabelPlacement[] {
  const zoom = Number.isFinite(input.zoom) && input.zoom > 0 ? input.zoom : 1;
  const selectedIds = input.selectedAnnotationIds ?? new Set<string>();
  const viewport = input.visibleSceneBounds ?? input.imageBounds;
  const image = toIndexedBounds(input.imageBounds);
  const viewportScreenArea = Math.max(1, viewport.width * zoom * viewport.height * zoom);
  const density = input.items.length / (viewportScreenArea / 10_000);
  const measureText = input.measureText ?? defaultMeasureText;
  const preferredFontSizePx = clamp(input.preferredFontSizePx ?? 12, 10, 16);
  const maximumTextWidthPx = Math.max(24, (input.imageBounds.width * zoom) - 12);
  const drafts = input.items.map((item, order) => {
    if (isOutsideViewport(item.bounds, viewport)) {
      return { item, order, representation: "hidden" as const, priority: 0 };
    }
    const selected = selectedIds.has(item.annotationId);
    const hovered = input.hoveredAnnotationId === item.annotationId;
    const representation = resolveRepresentation({
      mode: input.mode,
      selected,
      hovered,
      screenWidth: item.bounds.width * zoom,
      screenHeight: item.bounds.height * zoom,
      density,
      zoom
    });
    const priority = selected ? 1000 : hovered ? 900 : representation === "full" ? 100 : representation === "compact" ? 50 : 0;
    return { item, order, representation, priority };
  });

  const output = new Map<string, AnnotationLabelPlacement>();
  const index = new SpatialLabelIndex(64 / zoom);
  drafts
    .sort((left, right) => right.priority - left.priority || left.order - right.order)
    .forEach(({ item, representation, priority }) => {
      if (representation === "hidden") {
        output.set(item.annotationId, hiddenPlacement(item.annotationId));
        return;
      }

      const requestedText = representation === "full" ? item.displayName : item.classId;
      const text = fitText(requestedText, maximumTextWidthPx, preferredFontSizePx, measureText);
      const width = (measureText(text, preferredFontSizePx) + 10) / zoom;
      const height = (preferredFontSizePx + 7) / zoom;
      if (width > image.width || height > image.height) {
        output.set(item.annotationId, hiddenPlacement(item.annotationId));
        return;
      }

      const gap = 3 / zoom;
      const rect = toIndexedBounds(item.bounds);
      const candidates: PlacementCandidate[] = [
        { left: rect.left, top: rect.top - height - gap },
        { left: rect.left + (2 / zoom), top: rect.top + (2 / zoom) },
        { left: rect.right - width, top: rect.top - height - gap },
        { left: rect.left, top: rect.bottom + gap },
        { left: rect.right - width, top: rect.bottom + gap }
      ];

      let placed: IndexedBounds | null = null;
      for (const candidate of candidates) {
        const bounds = toIndexedBounds({
          left: clamp(candidate.left, image.left, image.right - width),
          top: clamp(candidate.top, image.top, image.bottom - height),
          width,
          height
        });
        if (!index.collides(bounds)) {
          placed = bounds;
          break;
        }
      }

      if (!placed) {
        output.set(item.annotationId, hiddenPlacement(item.annotationId));
        return;
      }

      index.add(placed);
      output.set(item.annotationId, {
        annotationId: item.annotationId,
        visible: true,
        text,
        representation,
        left: placed.left,
        top: placed.top,
        width: placed.width,
        height: placed.height,
        fontSize: preferredFontSizePx / zoom,
        priority
      });
    });

  return input.items.map((item) => output.get(item.annotationId) ?? hiddenPlacement(item.annotationId));
}
