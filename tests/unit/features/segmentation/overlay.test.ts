import { describe, expect, it, vi } from "vitest";

import { createFakeFabricRuntime } from "../canvas/test-fakes.js";
import { createSegmentationDocument } from "../../../../src/features/segmentation/document.js";
import {
  createSegmentationOverlayObject,
  createSegmentationOverlaySnapshot,
  updateSegmentationOverlayObject
} from "../../../../src/features/segmentation/overlay.js";

describe("features/segmentation/overlay", () => {
  it("derives overlay pixels from raster mask and visibility state", () => {
    const document = createSegmentationDocument({ width: 3, height: 2, activeClassId: "2", overlayOpacity: 0.5 });
    document.applyStroke({ points: [{ x: 1, y: 0 }] });

    const overlay = createSegmentationOverlaySnapshot(document, () => "#112233");
    const pixelOffset = (0 * 3 + 1) * 4;

    expect(overlay.width).toBe(3);
    expect(overlay.height).toBe(2);
    expect(Array.from(overlay.pixels.slice(pixelOffset, pixelOffset + 4))).toEqual([17, 34, 51, 128]);

    document.setClassVisibility("2", false);
    const hiddenOverlay = createSegmentationOverlaySnapshot(document, () => "#112233");
    expect(Array.from(hiddenOverlay.pixels.slice(pixelOffset, pixelOffset + 4))).toEqual([0, 0, 0, 0]);
  });

  it("creates and updates a reusable overlay object", () => {
    const fabric = createFakeFabricRuntime();
    const document = createSegmentationDocument({ width: 2, height: 2, activeClassId: "5" });
    document.applyStroke({ points: [{ x: 0, y: 0 }] });

    const initial = createSegmentationOverlaySnapshot(document, () => "#abcdef");
    const overlayObject = createSegmentationOverlayObject(fabric, initial);
    expect(overlayObject.type).toBe("image");
    expect(overlayObject.visible).toBe(true);
    expect(overlayObject.opacity).toBe(0.6);

    document.setOverlayOpacity(0.3);
    document.setOverlayVisible(false);
    const updated = createSegmentationOverlaySnapshot(document, () => "#abcdef");
    updateSegmentationOverlayObject(overlayObject, updated);

    expect(overlayObject.visible).toBe(false);
    expect(overlayObject.opacity).toBe(0.3);
  });

  it("uses setElement when available to refresh fabric image source safely", () => {
    const fabric = createFakeFabricRuntime();
    const document = createSegmentationDocument({ width: 2, height: 2, activeClassId: "5" });
    document.applyStroke({ points: [{ x: 0, y: 0 }] });

    const initial = createSegmentationOverlaySnapshot(document, () => "#abcdef");
    const overlayObject = createSegmentationOverlayObject(fabric, initial);
    const setElementSpy = vi.fn();
    overlayObject.setElement = setElementSpy;

    document.setOverlayOpacity(0.4);
    const updated = createSegmentationOverlaySnapshot(document, () => "#abcdef");
    updateSegmentationOverlayObject(overlayObject, updated);

    expect(setElementSpy).toHaveBeenCalledTimes(1);
  });
});
