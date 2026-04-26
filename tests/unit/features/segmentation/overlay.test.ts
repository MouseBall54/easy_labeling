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
    document.setEdgeHighlightVisible(false);
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
    document.setEdgeHighlightVisible(false);
    const layer = createSegmentationMaskOverlayLayer(fabric);
    const firstMutation = document.applyStroke({ points: [{ x: 0, y: 0 }] });
    layer.sync(document, () => "#abcdef", { dirtyBounds: firstMutation.dirtyBounds });

    const overlayObject = layer.object;
    const initialElement = overlayObject.element;
    const initialPixels = (overlayObject.element as { overlayPixels: Uint8ClampedArray }).overlayPixels;
    expect(overlayObject.type).toBe("image");
    expect(overlayObject.originX).toBe("left");
    expect(overlayObject.originY).toBe("top");
    expect(overlayObject.selectable).toBe(false);
    expect(overlayObject.evented).toBe(false);
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

  it("renders neon edge and background halo without changing hidden class pixels", () => {
    const fabric = createFakeFabricRuntime();
    const document = createSegmentationDocument({
      width: 5,
      height: 5,
      activeClassId: "2",
      edgeHighlightIntensity: 1
    });
    for (let y = 1; y <= 3; y += 1) {
      for (let x = 1; x <= 3; x += 1) {
        document.mask[(y * 5) + x] = 2;
      }
    }

    const layer = createSegmentationMaskOverlayLayer(fabric);
    layer.sync(document, () => "#102030", { forceFull: true });

    const pixels = (layer.object.element as { overlayPixels: Uint8ClampedArray }).overlayPixels;
    const interiorOffset = (2 * 5 + 2) * 4;
    const edgeOffset = (2 * 5 + 1) * 4;
    const haloOffset = (2 * 5 + 0) * 4;

    expect(Array.from(pixels.slice(interiorOffset, interiorOffset + 4))).toEqual([16, 32, 48, 255]);
    expect(pixels[edgeOffset]).toBeGreaterThan(16);
    expect(pixels[edgeOffset + 1]).toBeGreaterThan(32);
    expect(pixels[edgeOffset + 2]).toBeGreaterThan(48);
    expect(pixels[edgeOffset + 3]).toBe(255);
    expect(Array.from(pixels.slice(haloOffset, haloOffset + 3))).not.toEqual([0, 0, 0]);
    expect(pixels[haloOffset + 3]).toBeGreaterThan(0);
    expect(pixels[haloOffset + 3]).toBeLessThan(255);

    document.setClassVisibility("2", false);
    layer.sync(document, () => "#102030", { forceFull: true });
    expect(Array.from(pixels.slice(edgeOffset, edgeOffset + 4))).toEqual([0, 0, 0, 0]);
    expect(Array.from(pixels.slice(haloOffset, haloOffset + 4))).toEqual([0, 0, 0, 0]);
  });

  it("expands dirty updates enough to clear stale edge glow", () => {
    const fabric = createFakeFabricRuntime();
    const document = createSegmentationDocument({ width: 5, height: 5, activeClassId: "2", edgeHighlightIntensity: 1 });
    document.mask[(2 * 5) + 2] = 2;
    const layer = createSegmentationMaskOverlayLayer(fabric);
    layer.sync(document, () => "#102030", { forceFull: true });

    const pixels = (layer.object.element as { overlayPixels: Uint8ClampedArray }).overlayPixels;
    const haloOffset = (2 * 5 + 1) * 4;
    expect(pixels[haloOffset + 3]).toBeGreaterThan(0);

    document.mask[(2 * 5) + 2] = 0;
    layer.sync(document, () => "#102030", { dirtyBounds: { left: 2, top: 2, right: 2, bottom: 2 } });

    expect(Array.from(pixels.slice(haloOffset, haloOffset + 4))).toEqual([0, 0, 0, 0]);
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
