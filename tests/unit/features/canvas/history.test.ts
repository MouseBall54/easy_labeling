import { describe, expect, it } from "vitest";

import {
  areRectSnapshotsEqual,
  createCanvasHistoryService,
  createRectSnapshot,
  createRectSnapshotsByAnnotationId,
  createSelectionPayload,
  createSelectionPayloadFromActiveObject,
  type CanvasHistoryEntry
} from "../../../../src/features/canvas/history.js";
import { createFakeFabricRuntime, createRect } from "./test-fakes.js";

function createEntry(id: string): CanvasHistoryEntry {
  return {
    before: [],
    after: [
      {
        annotationId: id,
        left: 1,
        top: 2,
        boundsLeft: 1,
        boundsTop: 2,
        width: 3,
        height: 4,
        scaleX: 1,
        scaleY: 1,
        labelClass: "0",
        originalYolo: null
      }
    ],
    selectionBefore: {
      annotationIds: [],
      primaryAnnotationId: null
    },
    selectionAfter: {
      annotationIds: [id],
      primaryAnnotationId: id
    }
  };
}

describe("features/canvas/history", () => {
  it("tracks past/future stacks, clears redo after new push, and resets all history", () => {
    const history = createCanvasHistoryService();
    const first = createEntry("a-1");
    const second = createEntry("a-2");

    history.push(first);
    history.push(second);

    expect(history.canUndo()).toBe(true);
    expect(history.canRedo()).toBe(false);
    expect(history.getPastEntries()).toHaveLength(2);

    expect(history.undo()).toBe(second);
    expect(history.getPastEntries()).toHaveLength(1);
    expect(history.getFutureEntries()).toHaveLength(1);
    expect(history.canRedo()).toBe(true);

    history.push(createEntry("a-3"));
    expect(history.getPastEntries()).toHaveLength(2);
    expect(history.getFutureEntries()).toHaveLength(0);
    expect(history.canRedo()).toBe(false);

    history.reset();
    expect(history.getPastEntries()).toHaveLength(0);
    expect(history.getFutureEntries()).toHaveLength(0);
    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(false);
  });

  it("mutes nested history pushes while replay is in progress", () => {
    const history = createCanvasHistoryService();

    history.withReplayMuted(() => {
      history.push(createEntry("muted-1"));
      history.withReplayMuted(() => {
        history.push(createEntry("muted-2"));
        expect(history.isReplayMuted()).toBe(true);
      });
      expect(history.isReplayMuted()).toBe(true);
    });

    expect(history.isReplayMuted()).toBe(false);
    expect(history.getPastEntries()).toHaveLength(0);

    history.push(createEntry("live-1"));
    expect(history.getPastEntries()).toHaveLength(1);
  });

  it("normalizes selection payload IDs and keeps primary only when included", () => {
    expect(
      createSelectionPayload({
        annotationIds: ["  id-1  ", "id-2", "id-1", "   "],
        primaryAnnotationId: "id-2"
      })
    ).toEqual({
      annotationIds: ["id-1", "id-2"],
      primaryAnnotationId: "id-2"
    });

    expect(
      createSelectionPayload({
        annotationIds: ["id-1"],
        primaryAnnotationId: "missing-id"
      })
    ).toEqual({
      annotationIds: ["id-1"],
      primaryAnnotationId: null
    });
  });

  it("creates stable annotation-keyed rect snapshots and clones originalYolo metadata", () => {
    const rectA = createRect({ left: 10, top: 20, width: 30, height: 40, labelClass: "5" });
    rectA.annotationId = "b-id";
    rectA.originalYolo = { x_center: "0.1", y_center: "0.2", width: "0.3", height: "0.4" };

    const rectB = createRect({ left: 1, top: 2, width: 3, height: 4, labelClass: "1" });
    rectB.annotationId = "a-id";

    const snapshots = createRectSnapshotsByAnnotationId([rectA, rectB]);
    expect(snapshots.map((snapshot) => snapshot.annotationId)).toEqual(["a-id", "b-id"]);

    const yoloSnapshot = snapshots[1]?.originalYolo;
    expect(yoloSnapshot).toEqual({ x_center: "0.1", y_center: "0.2", width: "0.3", height: "0.4" });
    if (yoloSnapshot) {
      yoloSnapshot.x_center = "changed";
    }
    expect(rectA.originalYolo?.x_center).toBe("0.1");
  });

  it("captures snapshot geometry from rect model fields including scale and compares ordered snapshots", () => {
    const rect = createRect({ left: 10, top: 20, width: 30, height: 40, labelClass: "9" });
    rect.annotationId = "bounds-id";
    (rect as { scaleX?: number; scaleY?: number }).scaleX = 2;
    (rect as { scaleX?: number; scaleY?: number }).scaleY = 3;
    rect.getBoundingRect = () => ({ left: 101, top: 202, width: 303, height: 404 });

    const [snapshot] = createRectSnapshotsByAnnotationId([rect]);
    expect(snapshot).toMatchObject({
      annotationId: "bounds-id",
      left: 10,
      top: 20,
      boundsLeft: 101,
      boundsTop: 202,
      width: 30,
      height: 40,
      scaleX: 2,
      scaleY: 3
    });

    expect(
      areRectSnapshotsEqual(
        [snapshot!],
        [{ ...snapshot!, left: 10 }]
      )
    ).toBe(true);
    expect(
      areRectSnapshotsEqual(
        [snapshot!],
        [{ ...snapshot!, width: 999 }]
      )
    ).toBe(false);
  });

  it("captures absolute left/top for rects that are inside an active selection group", () => {
    const rect = createRect({ left: 10, top: 20, width: 30, height: 40, labelClass: "9" });
    rect.annotationId = "grouped-id";
    rect.group = { left: 100, top: 200, width: 60, height: 80 };
    rect.getBoundingRect = () => ({ left: 110, top: 220, width: 30, height: 40 });

    const snapshot = createRectSnapshot(rect);

    expect(snapshot.left).toBe(10);
    expect(snapshot.top).toBe(20);
    expect(snapshot.boundsLeft).toBe(110);
    expect(snapshot.boundsTop).toBe(220);
    expect(snapshot.width).toBe(30);
    expect(snapshot.height).toBe(40);
  });

  it("derives selection payload from active rect and active selection", () => {
    const fabric = createFakeFabricRuntime();
    const canvas = new fabric.Canvas("canvas", { width: 100, height: 100, backgroundColor: "#eee" });
    const rectA = createRect({ left: 1, top: 2, width: 3, height: 4, labelClass: "1" });
    rectA.annotationId = "rect-a";
    const rectB = createRect({ left: 5, top: 6, width: 7, height: 8, labelClass: "2" });
    rectB.annotationId = "rect-b";
    canvas.add(rectA, rectB);

    canvas.setActiveObject(rectA);
    expect(createSelectionPayloadFromActiveObject(canvas.getActiveObject())).toEqual({
      annotationIds: ["rect-a"],
      primaryAnnotationId: "rect-a"
    });

    const selection = new fabric.ActiveSelection([rectB, rectA], { canvas });
    canvas.setActiveObject(selection);
    expect(createSelectionPayloadFromActiveObject(canvas.getActiveObject())).toEqual({
      annotationIds: ["rect-b", "rect-a"],
      primaryAnnotationId: "rect-b"
    });
  });
});
