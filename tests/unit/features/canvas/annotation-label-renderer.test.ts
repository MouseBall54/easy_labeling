import { describe, expect, it } from "vitest";

import {
  layoutAnnotationLabels,
  type AnnotationLabelPlacement
} from "../../../../src/features/canvas/annotation-label-renderer.js";

function overlaps(left: AnnotationLabelPlacement, right: AnnotationLabelPlacement): boolean {
  return left.left < right.left + right.width &&
    left.left + left.width > right.left &&
    left.top < right.top + right.height &&
    left.top + left.height > right.top;
}

function denseItems(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    annotationId: `box-${index}`,
    classId: String(index % 5),
    displayName: `${index % 5}: Vehicle color class ${index % 5}`,
    bounds: {
      left: 12 + ((index % 20) * 42),
      top: 18 + (Math.floor(index / 20) * 72),
      width: 34,
      height: 58
    }
  }));
}

describe("features/canvas/annotation-label-renderer", () => {
  it("keeps auto labels inside the image and collision-free for the dense sample shape", () => {
    const placements = layoutAnnotationLabels({
      items: denseItems(59),
      mode: "auto",
      zoom: 0.91,
      imageBounds: { left: 0, top: 0, width: 900, height: 600 },
      visibleSceneBounds: { left: 0, top: 0, width: 900, height: 600 }
    });
    const visible = placements.filter((placement) => placement.visible);

    expect(visible.length).toBeGreaterThan(0);
    visible.forEach((placement) => {
      expect(placement.left).toBeGreaterThanOrEqual(0);
      expect(placement.top).toBeGreaterThanOrEqual(0);
      expect(placement.left + placement.width).toBeLessThanOrEqual(900);
      expect(placement.top + placement.height).toBeLessThanOrEqual(600);
    });
    visible.forEach((placement, index) => {
      visible.slice(index + 1).forEach((candidate) => {
        expect(overlaps(placement, candidate)).toBe(false);
      });
    });
  });

  it("always prioritizes the selected full label and truncates it to image bounds", () => {
    const items = denseItems(20);
    items[3] = {
      ...items[3],
      displayName: "3: A very long multilingual annotation class name that must remain bounded"
    };
    const placements = layoutAnnotationLabels({
      items,
      mode: "selected",
      zoom: 0.5,
      imageBounds: { left: 0, top: 0, width: 260, height: 180 },
      selectedAnnotationIds: new Set(["box-3"])
    });
    const selected = placements.find((placement) => placement.annotationId === "box-3");

    expect(selected).toMatchObject({ visible: true, representation: "full" });
    expect(selected?.text.endsWith("...")).toBe(true);
    expect((selected?.left ?? 0) + (selected?.width ?? 0)).toBeLessThanOrEqual(260);
    expect(placements.filter((placement) => placement.visible)).toHaveLength(1);
  });

  it("supports explicit compact and off modes without changing item data", () => {
    const items = denseItems(4);
    const compact = layoutAnnotationLabels({
      items,
      mode: "compact",
      zoom: 1,
      imageBounds: { left: 0, top: 0, width: 900, height: 600 }
    });
    const off = layoutAnnotationLabels({
      items,
      mode: "off",
      zoom: 1,
      imageBounds: { left: 0, top: 0, width: 900, height: 600 }
    });

    expect(compact.filter((placement) => placement.visible).every((placement) => /^\d$/.test(placement.text))).toBe(true);
    expect(off.every((placement) => !placement.visible)).toBe(true);
    expect(items.map((item) => item.annotationId)).toEqual(["box-0", "box-1", "box-2", "box-3"]);
  });

  it("lays out 500 boxes within a bounded time and only renders viewport items", () => {
    const items = denseItems(500);
    const startedAt = performance.now();
    const placements = layoutAnnotationLabels({
      items,
      mode: "auto",
      zoom: 1,
      imageBounds: { left: 0, top: 0, width: 4000, height: 3000 },
      visibleSceneBounds: { left: 0, top: 0, width: 900, height: 600 }
    });
    const duration = performance.now() - startedAt;

    expect(placements).toHaveLength(500);
    expect(duration).toBeLessThan(100);
    expect(placements.filter((placement) => placement.visible).length).toBeLessThan(200);
  });
});
