import { describe, expect, it } from "vitest";

import { createSegmentationDocument } from "../../../../src/features/segmentation/document.js";

describe("features/segmentation/document", () => {
  it("paints the active class and supports document-level undo/redo", () => {
    const document = createSegmentationDocument({ width: 12, height: 12, activeClassId: "3", brushRadius: 1 });

    const mutation = document.applyStroke({ points: [{ x: 5, y: 5 }] });

    expect(mutation.mutated).toBe(true);
    expect(mutation.dirtyBounds).not.toBeNull();
    expect(document.getPixel(5, 5)).toBe(3);
    expect(document.canUndo()).toBe(true);
    expect(document.canRedo()).toBe(false);

    expect(document.undo()).toBe(true);
    expect(document.getPixel(5, 5)).toBe(0);
    expect(document.canRedo()).toBe(true);

    expect(document.redo()).toBe(true);
    expect(document.getPixel(5, 5)).toBe(3);
  });

  it("erases pixels back to background without using rect state", () => {
    const document = createSegmentationDocument({ width: 10, height: 10, activeClassId: "4", brushRadius: 1 });
    document.applyStroke({ points: [{ x: 2, y: 2 }] });

    document.setActiveTool("erase");
    document.applyStroke({ points: [{ x: 2, y: 2 }] });

    expect(document.getPixel(2, 2)).toBe(0);
    expect(document.getSummary().visibleClassIds).toEqual([]);
  });

  it("tracks overlay visibility, opacity, and per-class visibility in the document summary", () => {
    const document = createSegmentationDocument({ width: 8, height: 8, activeClassId: "7", overlayOpacity: 0.75 });
    document.applyStroke({ points: [{ x: 1, y: 1 }] });
    document.setOverlayVisible(false);
    document.setOverlayOpacity(0.25);
    document.setClassVisibility("7", false);

    expect(document.getSummary()).toEqual({
      activeClassId: "7",
      activeTool: "brush",
      brushRadius: 6,
      overlayVisible: false,
      overlayOpacity: 0.25,
      edgeHighlightVisible: true,
      edgeHighlightIntensity: 0.7,
      visibleClassIds: [],
      allClassIds: ["7"],
      hiddenClassIds: ["7"]
    });
  });

  it("normalizes edge highlight view settings without changing mask history snapshots", () => {
    const document = createSegmentationDocument({
      width: 8,
      height: 8,
      activeClassId: "4",
      edgeHighlightVisible: false,
      edgeHighlightIntensity: 2
    });

    expect(document.getSummary().edgeHighlightVisible).toBe(false);
    expect(document.getSummary().edgeHighlightIntensity).toBe(1);

    const before = document.cloneSnapshot();
    document.setEdgeHighlightVisible(true);
    document.setEdgeHighlightIntensity(-1);

    expect(document.getSummary().edgeHighlightVisible).toBe(true);
    expect(document.getSummary().edgeHighlightIntensity).toBe(0);
    expect(document.cloneSnapshot()).toEqual(before);
  });

  it("supports showing only one segmentation class or all classes", () => {
    const document = createSegmentationDocument({ width: 10, height: 10, activeClassId: "2", brushRadius: 1 });
    document.applyStroke({ points: [{ x: 2, y: 2 }] });
    document.setActiveClass("5");
    document.applyStroke({ points: [{ x: 6, y: 6 }] });

    document.setOnlyVisibleClass("2");
    expect(document.getSummary().visibleClassIds).toEqual(["2"]);
    expect(document.getSummary().hiddenClassIds).toEqual(["5"]);

    document.setOnlyVisibleClass(null);
    expect(document.getSummary().visibleClassIds).toEqual(["2", "5"]);
    expect(document.getSummary().hiddenClassIds).toEqual([]);
  });

  it("relabels a connected painted region and records undo/redo history", () => {
    const document = createSegmentationDocument({ width: 12, height: 12, activeClassId: "3", brushRadius: 1 });
    document.applyStroke({ points: [{ x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 }] });

    const mutation = document.relabelConnectedRegionAtPoint({ x: 4, y: 3 }, "8");
    expect(mutation.mutated).toBe(true);
    expect(mutation.dirtyBounds).not.toBeNull();
    expect(document.getClassAtPoint({ x: 4, y: 3 })).toBe("8");
    expect(document.canUndo()).toBe(true);

    document.undo();
    expect(document.getClassAtPoint({ x: 4, y: 3 })).toBe("3");
    document.redo();
    expect(document.getClassAtPoint({ x: 4, y: 3 })).toBe("8");
  });

  it("returns grouped connected-region information from a clicked segmentation point", () => {
    const document = createSegmentationDocument({ width: 10, height: 10, activeClassId: "6", brushRadius: 1 });
    document.applyStroke({ points: [{ x: 2, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 3 }] });

    const region = document.getConnectedRegionAtPoint({ x: 2, y: 2 });
    expect(region).not.toBeNull();
    expect(region?.classId).toBe("6");
    expect(region?.pixelCount).toBeGreaterThan(0);
    expect(region?.bounds.left).toBeLessThanOrEqual(2);
    expect(region?.bounds.top).toBeLessThanOrEqual(2);
    expect(document.getConnectedRegionAtPoint({ x: 9, y: 9 })).toBeNull();
  });

  it("moves a selected segmentation region and records undo/redo history", () => {
    const document = createSegmentationDocument({ width: 10, height: 10, activeClassId: "6", brushRadius: 1 });
    document.applyStroke({ points: [{ x: 2, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 3 }] });

    const region = document.getConnectedRegionAtPoint({ x: 2, y: 2 });
    expect(region).not.toBeNull();
    const moved = document.moveRegion(region!, 2, 1);

    expect(moved?.mutated).toBe(true);
    expect(moved?.dirtyBounds).not.toBeNull();
    expect(moved?.region.seedPoint).toEqual({ x: 4, y: 3 });
    expect(document.getClassAtPoint({ x: 2, y: 2 })).toBeNull();
    expect(document.getClassAtPoint({ x: 4, y: 3 })).toBe("6");

    document.undo();
    expect(document.getClassAtPoint({ x: 2, y: 2 })).toBe("6");
    document.redo();
    expect(document.getClassAtPoint({ x: 4, y: 3 })).toBe("6");
  });
});
