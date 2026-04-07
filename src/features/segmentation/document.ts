import type { CanvasPoint } from "../../types/labels.js";
import { applyBrushStroke, applyEraseStroke } from "./tools.js";
import type {
  SegmentationDocumentSnapshot,
  SegmentationMutationResult,
  SegmentationRegionBounds,
  SegmentationRegionMoveResult,
  SegmentationRegionSelection,
  SegmentationStrokeInput,
  SegmentationSummary,
  SegmentationTool
} from "./types.js";

interface SegmentationHistoryEntry {
  before: SegmentationDocumentSnapshot;
  after: SegmentationDocumentSnapshot;
}

export interface SegmentationDocument {
  readonly width: number;
  readonly height: number;
  readonly mask: Uint16Array;
  readonly brushRadius: number;
  readonly activeClassId: string;
  readonly activeTool: SegmentationTool;
  readonly overlayVisible: boolean;
  readonly overlayOpacity: number;
  cloneSnapshot(): SegmentationDocumentSnapshot;
  restoreSnapshot(snapshot: SegmentationDocumentSnapshot): void;
  applyStroke(input: SegmentationStrokeInput, options?: { recordHistory?: boolean }): SegmentationMutationResult;
  pushHistoryFromSnapshot(before: SegmentationDocumentSnapshot): boolean;
  setActiveClass(classId: string): void;
  setActiveTool(tool: SegmentationTool): void;
  setBrushRadius(radius: number): void;
  setOverlayVisible(visible: boolean): void;
  setOverlayOpacity(opacity: number): void;
  setClassVisibility(classId: string, visible: boolean): void;
  setOnlyVisibleClass(classId: string | null): void;
  getVisibleClassIds(): string[];
  getAllClassIds(): string[];
  getHiddenClassIds(): string[];
  getPixel(x: number, y: number): number;
  getClassAtPoint(point: CanvasPoint): string | null;
  getConnectedRegionAtPoint(point: CanvasPoint): SegmentationRegionSelection | null;
  moveRegion(region: SegmentationRegionSelection, deltaX: number, deltaY: number, options?: { recordHistory?: boolean }): SegmentationRegionMoveResult | null;
  relabelConnectedRegionAtPoint(point: CanvasPoint, nextClassId: string, options?: { recordHistory?: boolean }): SegmentationMutationResult;
  clearHistory(): void;
  canUndo(): boolean;
  canRedo(): boolean;
  undo(): boolean;
  redo(): boolean;
  getSummary(): SegmentationSummary;
}

function clampOpacity(opacity: number): number {
  return Math.min(1, Math.max(0, opacity));
}

function normalizeClassId(classId: string): string {
  const trimmed = classId.trim();
  if (trimmed.length === 0) {
    return "1";
  }
  return trimmed;
}

function normalizeBrushRadius(radius: number): number {
  if (!Number.isFinite(radius)) {
    return 4;
  }
  return Math.max(1, Math.round(radius));
}

function normalizePaintClassNumber(classId: string): number {
  const parsed = Number.parseInt(classId, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function cloneBounds(bounds: SegmentationRegionBounds): SegmentationRegionBounds {
  return {
    left: bounds.left,
    top: bounds.top,
    right: bounds.right,
    bottom: bounds.bottom
  };
}

function mergeBounds(
  left: SegmentationRegionBounds | null,
  right: SegmentationRegionBounds | null
): SegmentationRegionBounds | null {
  if (!left) {
    return right ? cloneBounds(right) : null;
  }
  if (!right) {
    return cloneBounds(left);
  }
  return {
    left: Math.min(left.left, right.left),
    top: Math.min(left.top, right.top),
    right: Math.max(left.right, right.right),
    bottom: Math.max(left.bottom, right.bottom)
  };
}

function cloneSnapshot(snapshot: SegmentationDocumentSnapshot): SegmentationDocumentSnapshot {
  return {
    width: snapshot.width,
    height: snapshot.height,
    mask: new Uint16Array(snapshot.mask),
    activeClassId: snapshot.activeClassId,
    activeTool: snapshot.activeTool,
    overlayVisible: snapshot.overlayVisible,
    overlayOpacity: snapshot.overlayOpacity,
    hiddenClassIds: new Set(snapshot.hiddenClassIds),
    brushRadius: snapshot.brushRadius
  };
}

function snapshotsEqual(left: SegmentationDocumentSnapshot, right: SegmentationDocumentSnapshot): boolean {
  if (
    left.width !== right.width ||
    left.height !== right.height ||
    left.activeClassId !== right.activeClassId ||
    left.activeTool !== right.activeTool ||
    left.overlayVisible !== right.overlayVisible ||
    left.overlayOpacity !== right.overlayOpacity ||
    left.brushRadius !== right.brushRadius ||
    left.hiddenClassIds.size !== right.hiddenClassIds.size ||
    left.mask.length !== right.mask.length
  ) {
    return false;
  }

  for (let index = 0; index < left.mask.length; index += 1) {
    if (left.mask[index] !== right.mask[index]) {
      return false;
    }
  }

  for (const value of left.hiddenClassIds) {
    if (!right.hiddenClassIds.has(value)) {
      return false;
    }
  }

  return true;
}

export function createSegmentationDocument(input: {
  width: number;
  height: number;
  activeClassId?: string;
  activeTool?: SegmentationTool;
  overlayVisible?: boolean;
  overlayOpacity?: number;
  brushRadius?: number;
  hiddenClassIds?: Iterable<string>;
}): SegmentationDocument {
  let width = Math.max(1, Math.round(input.width));
  let height = Math.max(1, Math.round(input.height));
  let mask = new Uint16Array(width * height);
  let activeClassId = normalizeClassId(input.activeClassId ?? "1");
  let activeTool: SegmentationTool = input.activeTool ?? "brush";
  let overlayVisible = input.overlayVisible ?? true;
  let overlayOpacity = clampOpacity(input.overlayOpacity ?? 0.6);
  let brushRadius = normalizeBrushRadius(input.brushRadius ?? 6);
  let hiddenClassIds = new Set<string>(input.hiddenClassIds ?? []);
  const past: SegmentationHistoryEntry[] = [];
  const future: SegmentationHistoryEntry[] = [];

  const doc: SegmentationDocument = {
    get width() {
      return width;
    },

    get height() {
      return height;
    },

    get mask() {
      return mask;
    },

    get brushRadius() {
      return brushRadius;
    },

    get activeClassId() {
      return activeClassId;
    },

    get activeTool() {
      return activeTool;
    },

    get overlayVisible() {
      return overlayVisible;
    },

    get overlayOpacity() {
      return overlayOpacity;
    },

    cloneSnapshot(): SegmentationDocumentSnapshot {
      return {
        width,
        height,
        mask: new Uint16Array(mask),
        activeClassId,
        activeTool,
        overlayVisible,
        overlayOpacity,
        hiddenClassIds: new Set(hiddenClassIds),
        brushRadius
      };
    },

    restoreSnapshot(snapshot: SegmentationDocumentSnapshot): void {
      width = snapshot.width;
      height = snapshot.height;
      mask = new Uint16Array(snapshot.mask);
      activeClassId = snapshot.activeClassId;
      activeTool = snapshot.activeTool;
      overlayVisible = snapshot.overlayVisible;
      overlayOpacity = snapshot.overlayOpacity;
      hiddenClassIds = new Set(snapshot.hiddenClassIds);
      brushRadius = snapshot.brushRadius;
    },

    applyStroke(inputStroke: SegmentationStrokeInput, options?: { recordHistory?: boolean }): SegmentationMutationResult {
      const points = inputStroke.points;
      if (points.length === 0) {
        return {
          mutated: false,
          dirtyBounds: null
        };
      }

      const radius = normalizeBrushRadius(inputStroke.radius ?? brushRadius);
      const before = options?.recordHistory === false ? null : doc.cloneSnapshot();
      const normalizedClassId = normalizePaintClassNumber(activeClassId);
      const mutation = activeTool === "erase"
        ? applyEraseStroke(mask, width, height, points, radius)
        : applyBrushStroke(mask, width, height, points, radius, normalizedClassId);

      if (!mutation.mutated || !before) {
        return mutation;
      }

      doc.pushHistoryFromSnapshot(before);
      return mutation;
    },

    pushHistoryFromSnapshot(before: SegmentationDocumentSnapshot): boolean {
      const after = doc.cloneSnapshot();
      if (snapshotsEqual(before, after)) {
        return false;
      }

      past.push({
        before: cloneSnapshot(before),
        after: cloneSnapshot(after)
      });
      future.length = 0;
      return true;
    },

    setActiveClass(classId: string): void {
      activeClassId = normalizeClassId(classId);
    },

    setActiveTool(tool: SegmentationTool): void {
      activeTool = tool;
    },

    setBrushRadius(radius: number): void {
      brushRadius = normalizeBrushRadius(radius);
    },

    setOverlayVisible(visible: boolean): void {
      overlayVisible = visible;
    },

    setOverlayOpacity(opacity: number): void {
      overlayOpacity = clampOpacity(opacity);
    },

    setClassVisibility(classId: string, visible: boolean): void {
      const normalized = normalizeClassId(classId);
      if (visible) {
        hiddenClassIds.delete(normalized);
        return;
      }
      hiddenClassIds.add(normalized);
    },

    setOnlyVisibleClass(classId: string | null): void {
      if (classId === null) {
        hiddenClassIds.clear();
        return;
      }

      const normalized = normalizeClassId(classId);
      const allClassIds = doc.getAllClassIds();
      hiddenClassIds = new Set(allClassIds.filter((value) => value !== normalized));
    },

    getVisibleClassIds(): string[] {
      return doc.getAllClassIds().filter((classId) => !hiddenClassIds.has(classId));
    },

    getAllClassIds(): string[] {
      const classes = new Set<string>();
      for (let index = 0; index < mask.length; index += 1) {
        const classId = mask[index];
        if (classId === 0) {
          continue;
        }
        classes.add(String(classId));
      }
      return [...classes].sort((left, right) => Number.parseInt(left, 10) - Number.parseInt(right, 10));
    },

    getHiddenClassIds(): string[] {
      return [...hiddenClassIds].sort((left, right) => Number.parseInt(left, 10) - Number.parseInt(right, 10));
    },

    getPixel(x: number, y: number): number {
      const pixelX = Math.max(0, Math.min(width - 1, Math.round(x)));
      const pixelY = Math.max(0, Math.min(height - 1, Math.round(y)));
      return mask[(pixelY * width) + pixelX] ?? 0;
    },

    getClassAtPoint(point: CanvasPoint): string | null {
      const classId = doc.getPixel(point.x, point.y);
      return classId > 0 ? String(classId) : null;
    },

    getConnectedRegionAtPoint(point: CanvasPoint): SegmentationRegionSelection | null {
      const startX = Math.max(0, Math.min(width - 1, Math.round(point.x)));
      const startY = Math.max(0, Math.min(height - 1, Math.round(point.y)));
      const startIndex = (startY * width) + startX;
      const sourceClass = mask[startIndex] ?? 0;
      if (sourceClass <= 0) {
        return null;
      }

      const stack = [startIndex];
      const visited = new Uint8Array(mask.length);
      visited[startIndex] = 1;
      const regionIndices: number[] = [];

      let minX = startX;
      let minY = startY;
      let maxX = startX;
      let maxY = startY;

      while (stack.length > 0) {
        const current = stack.pop();
        if (typeof current !== "number") {
          continue;
        }

        regionIndices.push(current);
        const x = current % width;
        const y = Math.floor(current / width);
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);

        const up = y > 0 ? current - width : -1;
        const down = y < (height - 1) ? current + width : -1;
        const left = x > 0 ? current - 1 : -1;
        const right = x < (width - 1) ? current + 1 : -1;

        if (up >= 0 && visited[up] === 0 && mask[up] === sourceClass) {
          visited[up] = 1;
          stack.push(up);
        }
        if (down >= 0 && visited[down] === 0 && mask[down] === sourceClass) {
          visited[down] = 1;
          stack.push(down);
        }
        if (left >= 0 && visited[left] === 0 && mask[left] === sourceClass) {
          visited[left] = 1;
          stack.push(left);
        }
        if (right >= 0 && visited[right] === 0 && mask[right] === sourceClass) {
          visited[right] = 1;
          stack.push(right);
        }
      }

      return {
        classId: String(sourceClass),
        pixelCount: regionIndices.length,
        pixelIndices: Uint32Array.from(regionIndices),
        bounds: {
          left: minX,
          top: minY,
          right: maxX,
          bottom: maxY
        },
        seedPoint: {
          x: startX,
          y: startY
        }
      };
    },

    moveRegion(region: SegmentationRegionSelection, deltaX: number, deltaY: number, options?: { recordHistory?: boolean }): SegmentationRegionMoveResult | null {
      const sourceClass = normalizePaintClassNumber(region.classId);
      const normalizedDeltaX = Math.round(deltaX);
      const normalizedDeltaY = Math.round(deltaY);
      const clampedDeltaX = Math.max(-region.bounds.left, Math.min((width - 1) - region.bounds.right, normalizedDeltaX));
      const clampedDeltaY = Math.max(-region.bounds.top, Math.min((height - 1) - region.bounds.bottom, normalizedDeltaY));
      const before = options?.recordHistory === false ? null : doc.cloneSnapshot();

      if (clampedDeltaX === 0 && clampedDeltaY === 0) {
        return {
          mutated: false,
          dirtyBounds: null,
          region
        };
      }

      for (const index of region.pixelIndices) {
        mask[index] = 0;
      }

      const movedIndices = new Uint32Array(region.pixelIndices.length);
      let minX = width - 1;
      let minY = height - 1;
      let maxX = 0;
      let maxY = 0;

      region.pixelIndices.forEach((index, offset) => {
        const x = (index % width) + clampedDeltaX;
        const y = Math.floor(index / width) + clampedDeltaY;
        const movedIndex = (y * width) + x;
        movedIndices[offset] = movedIndex;
        mask[movedIndex] = sourceClass;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      });

      const movedRegion: SegmentationRegionSelection = {
        classId: region.classId,
        pixelCount: movedIndices.length,
        pixelIndices: movedIndices,
        bounds: {
          left: minX,
          top: minY,
          right: maxX,
          bottom: maxY
        },
        seedPoint: {
          x: region.seedPoint.x + clampedDeltaX,
          y: region.seedPoint.y + clampedDeltaY
        }
      };
      const dirtyBounds = mergeBounds(region.bounds, movedRegion.bounds);

      if (before) {
        doc.pushHistoryFromSnapshot(before);
      }

      return {
        mutated: true,
        dirtyBounds,
        region: movedRegion
      };
    },

    relabelConnectedRegionAtPoint(point: CanvasPoint, nextClassId: string, options?: { recordHistory?: boolean }): SegmentationMutationResult {
      const nextClass = normalizePaintClassNumber(nextClassId);
      const connectedRegion = doc.getConnectedRegionAtPoint(point);
      const sourceClass = connectedRegion ? Number.parseInt(connectedRegion.classId, 10) : 0;
      if (sourceClass <= 0 || sourceClass === nextClass) {
        return {
          mutated: false,
          dirtyBounds: null
        };
      }

      const before = options?.recordHistory === false ? null : doc.cloneSnapshot();
      const indices = connectedRegion?.pixelIndices ?? new Uint32Array();
      let mutated = 0;
      for (const index of indices) {
        if (mask[index] !== sourceClass) {
          continue;
        }
        mask[index] = nextClass;
        mutated += 1;
      }

      if (mutated === 0 || !before) {
        return {
          mutated: mutated > 0,
          dirtyBounds: mutated > 0 && connectedRegion ? cloneBounds(connectedRegion.bounds) : null
        };
      }

      doc.pushHistoryFromSnapshot(before);
      return {
        mutated: true,
        dirtyBounds: connectedRegion ? cloneBounds(connectedRegion.bounds) : null
      };
    },

    clearHistory(): void {
      past.length = 0;
      future.length = 0;
    },

    canUndo(): boolean {
      return past.length > 0;
    },

    canRedo(): boolean {
      return future.length > 0;
    },

    undo(): boolean {
      const entry = past.pop();
      if (!entry) {
        return false;
      }
      future.push({
        before: cloneSnapshot(entry.before),
        after: cloneSnapshot(entry.after)
      });
      doc.restoreSnapshot(entry.before);
      return true;
    },

    redo(): boolean {
      const entry = future.pop();
      if (!entry) {
        return false;
      }
      past.push({
        before: cloneSnapshot(entry.before),
        after: cloneSnapshot(entry.after)
      });
      doc.restoreSnapshot(entry.after);
      return true;
    },

    getSummary(): SegmentationSummary {
      return {
        activeClassId,
        activeTool,
        brushRadius,
        overlayVisible,
        overlayOpacity,
        visibleClassIds: doc.getVisibleClassIds(),
        allClassIds: doc.getAllClassIds(),
        hiddenClassIds: doc.getHiddenClassIds()
      };
    }
  };

  return doc;
}
