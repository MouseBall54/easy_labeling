import { describe, expect, it } from "vitest";

import { AREA_COLOR, CARET_MIN_SIZE, layoutMarks, PIN_DIAMETER, RECLASS_COLOR, REVIEW_COLOR, type MarkTarget } from "../../../src/bootstrap/refine-marks.js";

const measure = (text: string): number => text.length * 6;
const box = (size: number, height = size) => ({ x0: 100, y0: 100, x1: 100 + size, y1: 100 + height });
const target = (patch: Partial<MarkTarget>): MarkTarget => ({ id: "a", screen: box(30), focused: false, ...patch });

describe("bootstrap/refine-marks", () => {
  it("pins a box to review and a reclass candidate side by side without tags when the box is small", () => {
    const layout = layoutMarks(target({
      review: { weakSides: ["R"], areaChange: null },
      reclass: { toClass: "0", label: "→ 0 unfilled" }
    }), measure);
    expect(layout.pins).toHaveLength(2);
    const [reclass, review] = layout.pins;
    expect(reclass).toMatchObject({ color: RECLASS_COLOR, text: "0" });
    expect(review).toMatchObject({ color: REVIEW_COLOR, text: "!", x: 130, y: 100 });
    expect(review.x - reclass.x).toBe(PIN_DIAMETER + 2);
    expect(layout.carets).toEqual([expect.objectContaining({ side: "R" })]);
    expect(layout.tags).toEqual([]);
  });

  it("shows the tag on the focused box", () => {
    const layout = layoutMarks(target({ reclass: { toClass: "0", label: "→ 0 unfilled" }, focused: true }), measure);
    expect(layout.tags.map((tag) => tag.text)).toEqual(["→ 0 unfilled"]);
  });

  it("drops weak-side carets on boxes under the minimum size and shows tags on wide boxes", () => {
    expect(layoutMarks(target({ screen: box(CARET_MIN_SIZE - 4), review: { weakSides: ["T"], areaChange: null } }), measure).carets).toEqual([]);
    const wide = layoutMarks(target({ screen: box(200, 100), reclass: { toClass: "0", label: "→ 0 unfilled" } }), measure);
    expect(wide.tags).toHaveLength(1);
  });

  it("marks a large area change with a red pin and its percentage", () => {
    const layout = layoutMarks(target({ review: { weakSides: [], areaChange: -0.42 }, focused: true }), measure);
    expect(layout.pins).toEqual([expect.objectContaining({ color: AREA_COLOR, text: "!" })]);
    expect(layout.tags).toEqual([expect.objectContaining({ color: AREA_COLOR, text: "−42% area" })]);
  });
});
