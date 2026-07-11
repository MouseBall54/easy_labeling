import { ensureAnnotationId, isActiveSelectionObject, isRectObject, type FabricObjectLike, type FabricRectLike, type YoloMetadata } from "./fabric-types.js";

export interface CanvasHistoryRectSnapshot {
  annotationId: string;
  left: number;
  top: number;
  boundsLeft: number;
  boundsTop: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  labelClass: string | undefined;
  layoutInstanceId?: string;
  layoutBoxId?: string;
  originalYolo: YoloMetadata | null | undefined;
}

export interface CanvasHistorySelectionPayload {
  annotationIds: string[];
  primaryAnnotationId: string | null;
}

export interface CanvasHistoryEntry {
  before: CanvasHistoryRectSnapshot[];
  after: CanvasHistoryRectSnapshot[];
  selectionBefore: CanvasHistorySelectionPayload;
  selectionAfter: CanvasHistorySelectionPayload;
}

export interface CanvasHistoryGestureBaseline {
  before: CanvasHistoryRectSnapshot[];
  selectionBefore: CanvasHistorySelectionPayload;
}

export interface CanvasHistoryService {
  push(entry: CanvasHistoryEntry): void;
  undo(): CanvasHistoryEntry | null;
  redo(): CanvasHistoryEntry | null;
  canUndo(): boolean;
  canRedo(): boolean;
  reset(): void;
  withReplayMuted<T>(run: () => T): T;
  isReplayMuted(): boolean;
  getPastEntries(): readonly CanvasHistoryEntry[];
  getFutureEntries(): readonly CanvasHistoryEntry[];
}

export function createRectSnapshot(rect: FabricRectLike): CanvasHistoryRectSnapshot {
  const withScale = rect as FabricRectLike & { scaleX?: number; scaleY?: number };
  const bounds = rect.getBoundingRect(true);
  let boundsLeft = bounds.left;
  let boundsTop = bounds.top;

  if (rect.group) {
    const groupLeft = rect.group.left;
    const groupTop = rect.group.top;
    const groupWidth = rect.group.width;
    const groupHeight = rect.group.height;
    const eps = 1e-8;

    const sameXSpace = Math.abs(bounds.left - rect.left) <= eps;
    const sameYSpace = Math.abs(bounds.top - rect.top) <= eps;

    if (sameXSpace && Number.isFinite(groupLeft) && Number.isFinite(groupWidth)) {
      boundsLeft = rect.left + groupLeft + groupWidth / 2;
    }
    if (sameYSpace && Number.isFinite(groupTop) && Number.isFinite(groupHeight)) {
      boundsTop = rect.top + groupTop + groupHeight / 2;
    }
  }

  return {
    annotationId: ensureAnnotationId(rect),
    left: rect.left,
    top: rect.top,
    boundsLeft,
    boundsTop,
    width: rect.width,
    height: rect.height,
    scaleX: withScale.scaleX ?? 1,
    scaleY: withScale.scaleY ?? 1,
    labelClass: rect.labelClass,
    layoutInstanceId: rect.layoutInstanceId,
    layoutBoxId: rect.layoutBoxId,
    originalYolo: rect.originalYolo
      ? {
        x_center: rect.originalYolo.x_center,
        y_center: rect.originalYolo.y_center,
        width: rect.originalYolo.width,
        height: rect.originalYolo.height
      }
      : rect.originalYolo
  };
}

export function createRectSnapshotsByAnnotationId(rects: readonly FabricRectLike[]): CanvasHistoryRectSnapshot[] {
  return rects
    .map((rect) => createRectSnapshot(rect))
    .sort((left, right) => left.annotationId.localeCompare(right.annotationId));
}

export function areRectSnapshotsEqual(
  left: readonly CanvasHistoryRectSnapshot[],
  right: readonly CanvasHistoryRectSnapshot[]
): boolean {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((snapshot, index) => {
    const candidate = right[index];
    if (!candidate) {
      return false;
    }
    return JSON.stringify(snapshot) === JSON.stringify(candidate);
  });
}

function normalizeAnnotationIds(annotationIds: readonly string[]): string[] {
  const unique = new Set<string>();
  annotationIds.forEach((annotationId) => {
    const normalized = annotationId.trim();
    if (normalized.length > 0) {
      unique.add(normalized);
    }
  });
  return [...unique];
}

export function createSelectionPayload(input: {
  annotationIds: readonly string[];
  primaryAnnotationId?: string | null;
}): CanvasHistorySelectionPayload {
  const annotationIds = normalizeAnnotationIds(input.annotationIds);
  const requestedPrimary = input.primaryAnnotationId?.trim() ?? null;
  const primaryAnnotationId = requestedPrimary && annotationIds.includes(requestedPrimary) ? requestedPrimary : null;
  return {
    annotationIds,
    primaryAnnotationId
  };
}

export function createSelectionPayloadFromActiveObject(activeObject: FabricObjectLike | null): CanvasHistorySelectionPayload {
  if (!activeObject) {
    return createSelectionPayload({ annotationIds: [] });
  }

  if (isRectObject(activeObject)) {
    const annotationId = ensureAnnotationId(activeObject);
    return createSelectionPayload({
      annotationIds: [annotationId],
      primaryAnnotationId: annotationId
    });
  }

  if (isActiveSelectionObject(activeObject)) {
    const selectedRects = activeObject
      .getObjects()
      .filter(isRectObject);

    const annotationIds = selectedRects.map((rect) => ensureAnnotationId(rect));
    const primaryAnnotationId = annotationIds[0] ?? null;
    return createSelectionPayload({
      annotationIds,
      primaryAnnotationId
    });
  }

  return createSelectionPayload({ annotationIds: [] });
}

export function createCanvasHistoryService(): CanvasHistoryService {
  const past: CanvasHistoryEntry[] = [];
  const future: CanvasHistoryEntry[] = [];
  let replayMuteDepth = 0;

  return {
    push(entry: CanvasHistoryEntry): void {
      if (replayMuteDepth > 0) {
        return;
      }
      past.push(entry);
      future.length = 0;
    },

    undo(): CanvasHistoryEntry | null {
      const entry = past.pop() ?? null;
      if (!entry) {
        return null;
      }

      future.push(entry);
      return entry;
    },

    redo(): CanvasHistoryEntry | null {
      const entry = future.pop() ?? null;
      if (!entry) {
        return null;
      }

      past.push(entry);
      return entry;
    },

    canUndo(): boolean {
      return past.length > 0;
    },

    canRedo(): boolean {
      return future.length > 0;
    },

    reset(): void {
      past.length = 0;
      future.length = 0;
    },

    withReplayMuted<T>(run: () => T): T {
      replayMuteDepth += 1;
      try {
        return run();
      } finally {
        replayMuteDepth -= 1;
      }
    },

    isReplayMuted(): boolean {
      return replayMuteDepth > 0;
    },

    getPastEntries(): readonly CanvasHistoryEntry[] {
      return past;
    },

    getFutureEntries(): readonly CanvasHistoryEntry[] {
      return future;
    }
  };
}
