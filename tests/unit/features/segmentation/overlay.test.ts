import { describe, expect, it } from "vitest";

import { createFakeFabricRuntime } from "../canvas/test-fakes.js";
import { createSegmentationDocument } from "../../../../src/features/segmentation/document.js";
import {
  createSegmentationMaskOverlayLayer,
  createSegmentationSelectionOverlayLayer
} from "../../../../src/features/segmentation/overlay.js";

describe("features/segmentation/overlay", () => {
  it("derives overlay pixels from raster mask and visibility state", () => {
    const fabric = createFakeFabricRuntime();
    const document = createSegmentationDocument({ width: 3, height: 2, activeClassId: "2", overlayOpacity: 0.5 });
    document.applyStroke({ points: [{ x: 1, y: 0 }] });
    const layer = createSegmentationMaskOverlayLayer(fabric);
    layer.sync(document, () => "#112233", { forceFull: true });

    const element = layer.object.element as {
      overlayPixels: Uint8ClampedArray;
      overlayVisible: boolean;
      overlayOpacity: number;
    };
    const pixelOffset = (0 * 3 + 1) * 4;

    expect(layer.object.width).toBe(3);
    expect(layer.object.height).toBe(2);
    expect(layer.object.visible).toBe(true);
    expect(layer.object.opacity).toBe(0.5);
    expect(Array.from(element.overlayPixels.slice(pixelOffset, pixelOffset + 4))).toEqual([17, 34, 51, 255]);

    document.setClassVisibility("2", false);
    layer.sync(document, () => "#112233", { forceFull: true });
    expect(Array.from(element.overlayPixels.slice(pixelOffset, pixelOffset + 4))).toEqual([0, 0, 0, 0]);
  });

  it("reuses a single mask overlay object and applies dirty-bound updates", () => {
    const fabric = createFakeFabricRuntime();
    const document = createSegmentationDocument({ width: 2, height: 2, activeClassId: "5" });
    const layer = createSegmentationMaskOverlayLayer(fabric);
    const firstMutation = document.applyStroke({ points: [{ x: 0, y: 0 }] });
    layer.sync(document, () => "#abcdef", { dirtyBounds: firstMutation.dirtyBounds });

    const overlayObject = layer.object;
    const initialElement = overlayObject.element;
    const initialPixels = (overlayObject.element as { overlayPixels: Uint8ClampedArray }).overlayPixels;
    expect(overlayObject.type).toBe("image");
    expect(overlayObject.visible).toBe(true);
    expect(overlayObject.opacity).toBe(0.6);
    expect(Array.from(initialPixels.slice(0, 4))).toEqual([171, 205, 239, 255]);

    const secondMutation = document.applyStroke({ points: [{ x: 1, y: 1 }] });
    layer.sync(document, () => "#abcdef", { dirtyBounds: secondMutation.dirtyBounds });

    const updatedPixels = (overlayObject.element as { overlayPixels: Uint8ClampedArray }).overlayPixels;
    const bottomRightOffset = (1 * 2 + 1) * 4;
    expect(layer.object).toBe(overlayObject);
    expect(layer.object.element).toBe(initialElement);
    expect(Array.from(updatedPixels.slice(bottomRightOffset, bottomRightOffset + 4))).toEqual([171, 205, 239, 255]);

    document.setOverlayOpacity(0.3);
    document.setOverlayVisible(false);
    layer.sync(document, () => "#abcdef", { dirtyBounds: null });
    expect(overlayObject.visible).toBe(false);
    expect(overlayObject.opacity).toBe(0.3);
  });

  it("reuses a single selection overlay object while toggling selection", () => {
    const fabric = createFakeFabricRuntime();
    const document = createSegmentationDocument({ width: 3, height: 3, activeClassId: "5", brushRadius: 1 });
    document.applyStroke({ points: [{ x: 1, y: 1 }] });
    const selection = document.getConnectedRegionAtPoint({ x: 1, y: 1 });
    expect(selection).not.toBeNull();

    const layer = createSegmentationSelectionOverlayLayer(fabric);
    layer.sync({
      width: 3,
      height: 3,
      selection: selection!,
      getColorForClass: () => "#445566"
    }, { forceFull: true });

    const overlayObject = layer.object;
    const initialElement = overlayObject.element;
    expect(overlayObject.visible).toBe(true);

    layer.sync({
      width: 3,
      height: 3,
      selection: null,
      getColorForClass: () => "#445566"
    });

    expect(layer.object).toBe(overlayObject);
    expect(layer.object.element).toBe(initialElement);
    expect(layer.object.visible).toBe(false);
  });
});
