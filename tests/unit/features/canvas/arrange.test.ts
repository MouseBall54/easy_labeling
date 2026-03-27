import { describe, expect, it } from "vitest";

import {
  calculateSelectionBounds,
  extractVisibleRectSelection,
  planEdgeAlignment,
  planEqualEdgeGapDistribution,
  sortRectGeometrically
} from "../../../../src/features/canvas/arrange.js";
import { createFakeFabricRuntime, createRect, FakeCanvas } from "./test-fakes.js";

describe("features/canvas/arrange", () => {
  it("extracts only visible rects from active selection", () => {
    const fabric = createFakeFabricRuntime();
    const canvas = new FakeCanvas("canvas", { width: 800, height: 600, backgroundColor: "#eee" });
    const rectVisible = createRect({ left: 10, top: 20, width: 30, height: 40, labelClass: "1" });
    const rectHidden = createRect({ left: 50, top: 60, width: 10, height: 20, labelClass: "2" });
    rectHidden.visible = false;
    const text = new fabric.Text("label", { left: 0, top: 0 });
    const selection = new fabric.ActiveSelection([rectVisible, rectHidden, text], { canvas });

    const rects = extractVisibleRectSelection(selection);

    expect(rects).toEqual([rectVisible]);
  });

  it("sorts rects geometrically by bounds instead of input order", () => {
    const rectA = createRect({ left: 120, top: 30, width: 20, height: 10, labelClass: "A" });
    const rectB = createRect({ left: 10, top: 50, width: 25, height: 10, labelClass: "B" });
    const rectC = createRect({ left: 10, top: 10, width: 15, height: 10, labelClass: "C" });

    const sortedHorizontal = sortRectGeometrically([rectA, rectB, rectC], "horizontal");
    const sortedVertical = sortRectGeometrically([rectA, rectB, rectC], "vertical");

    expect(sortedHorizontal.map((entry) => entry.rect.labelClass)).toEqual(["C", "B", "A"]);
    expect(sortedVertical.map((entry) => entry.rect.labelClass)).toEqual(["C", "A", "B"]);
  });

  it("calculates selection bounds from rect bounding boxes", () => {
    const rectA = createRect({ left: 30, top: 40, width: 10, height: 20, labelClass: "1" });
    const rectB = createRect({ left: 5, top: 25, width: 40, height: 10, labelClass: "2" });

    const bounds = calculateSelectionBounds([rectA, rectB]);

    expect(bounds).toEqual({
      left: 5,
      top: 25,
      right: 45,
      bottom: 60,
      width: 40,
      height: 35
    });
  });

  it("plans edge alignment against selection extremes", () => {
    const rectA = createRect({ left: 10, top: 20, width: 15, height: 10, labelClass: "A" });
    const rectB = createRect({ left: 40, top: 5, width: 30, height: 25, labelClass: "B" });

    expect(planEdgeAlignment([rectA, rectB], "left").map((entry) => ({ id: entry.rect.labelClass, left: entry.left, top: entry.top }))).toEqual([
      { id: "A", left: 10, top: 20 },
      { id: "B", left: 10, top: 5 }
    ]);

    expect(planEdgeAlignment([rectA, rectB], "right").map((entry) => ({ id: entry.rect.labelClass, left: entry.left, top: entry.top }))).toEqual([
      { id: "A", left: 55, top: 20 },
      { id: "B", left: 40, top: 5 }
    ]);

    expect(planEdgeAlignment([rectA, rectB], "top").map((entry) => ({ id: entry.rect.labelClass, left: entry.left, top: entry.top }))).toEqual([
      { id: "A", left: 10, top: 5 },
      { id: "B", left: 40, top: 5 }
    ]);

    expect(planEdgeAlignment([rectA, rectB], "bottom").map((entry) => ({ id: entry.rect.labelClass, left: entry.left, top: entry.top }))).toEqual([
      { id: "A", left: 10, top: 20 },
      { id: "B", left: 40, top: 5 }
    ]);
  });

  it("plans equal horizontal edge gaps with outer boxes fixed", () => {
    const left = createRect({ left: 0, top: 0, width: 10, height: 10, labelClass: "L" });
    const middle = createRect({ left: 50, top: 0, width: 20, height: 10, labelClass: "M" });
    const right = createRect({ left: 130, top: 0, width: 10, height: 10, labelClass: "R" });

    const plan = planEqualEdgeGapDistribution([right, middle, left], "horizontal");

    expect(plan.map((entry) => ({ id: entry.rect.labelClass, left: entry.left, top: entry.top }))).toEqual([
      { id: "M", left: 60, top: 0 }
    ]);
  });

  it("plans equal vertical edge gaps with outer boxes fixed", () => {
    const top = createRect({ left: 5, top: 0, width: 10, height: 10, labelClass: "T" });
    const upperMiddle = createRect({ left: 5, top: 20, width: 10, height: 20, labelClass: "U" });
    const lowerMiddle = createRect({ left: 5, top: 70, width: 10, height: 10, labelClass: "L" });
    const bottom = createRect({ left: 5, top: 110, width: 10, height: 10, labelClass: "B" });

    const plan = planEqualEdgeGapDistribution([lowerMiddle, bottom, top, upperMiddle], "vertical");
    const byId = new Map(plan.map((entry) => [entry.rect.labelClass, entry]));
    const plannedUpperMiddle = byId.get("U");
    const plannedLowerMiddle = byId.get("L");

    expect(plannedUpperMiddle).toBeDefined();
    expect(plannedLowerMiddle).toBeDefined();
    if (!plannedUpperMiddle || !plannedLowerMiddle) {
      return;
    }

    const firstBottom = top.top + top.height;
    const secondTop = plannedUpperMiddle.top;
    const secondBottom = plannedUpperMiddle.top + upperMiddle.height;
    const thirdTop = plannedLowerMiddle.top;
    const thirdBottom = plannedLowerMiddle.top + lowerMiddle.height;
    const lastTop = bottom.top;

    const gapOne = secondTop - firstBottom;
    const gapTwo = thirdTop - secondBottom;
    const gapThree = lastTop - thirdBottom;

    expect(plannedUpperMiddle.left).toBe(5);
    expect(plannedLowerMiddle.left).toBe(5);
    expect(gapOne).toBeCloseTo(gapTwo, 8);
    expect(gapTwo).toBeCloseTo(gapThree, 8);
  });

  it("returns no-op plans for insufficient selection sizes", () => {
    const rectA = createRect({ left: 0, top: 0, width: 10, height: 10, labelClass: "1" });
    const rectB = createRect({ left: 20, top: 20, width: 10, height: 10, labelClass: "2" });

    expect(planEdgeAlignment([], "left")).toEqual([]);
    expect(planEdgeAlignment([rectA], "left")).toEqual([]);
    expect(planEqualEdgeGapDistribution([], "horizontal")).toEqual([]);
    expect(planEqualEdgeGapDistribution([rectA, rectB], "horizontal")).toEqual([]);
    expect(planEqualEdgeGapDistribution([rectA, rectB], "vertical")).toEqual([]);
  });

  it("produces same horizontal distribution plan regardless of selection click order", () => {
    const rectA = createRect({ left: 0, top: 10, width: 10, height: 10, labelClass: "A" });
    const rectB = createRect({ left: 70, top: 10, width: 20, height: 10, labelClass: "B" });
    const rectC = createRect({ left: 140, top: 10, width: 10, height: 10, labelClass: "C" });

    const firstOrder = planEqualEdgeGapDistribution([rectA, rectB, rectC], "horizontal");
    const secondOrder = planEqualEdgeGapDistribution([rectC, rectA, rectB], "horizontal");

    const normalizedFirst = firstOrder.map((entry) => ({ id: entry.rect.labelClass, left: entry.left, top: entry.top }));
    const normalizedSecond = secondOrder.map((entry) => ({ id: entry.rect.labelClass, left: entry.left, top: entry.top }));

    expect(normalizedFirst).toEqual(normalizedSecond);
  });
});
