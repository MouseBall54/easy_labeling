import type { FabricImageLike, FabricRuntimeLike } from "../canvas/fabric-types.js";
import type { SegmentationDocument } from "./document.js";

export interface SegmentationOverlaySnapshot {
  width: number;
  height: number;
  pixels: Uint8ClampedArray;
  opacity: number;
  visible: boolean;
}

function parseHexChannel(value: string): number {
  return Number.parseInt(value, 16);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.replace("#", "");
  const source = normalized.length === 3
    ? normalized.split("").map((char) => `${char}${char}`).join("")
    : normalized.padEnd(6, "0").slice(0, 6);
  return {
    r: parseHexChannel(source.slice(0, 2)),
    g: parseHexChannel(source.slice(2, 4)),
    b: parseHexChannel(source.slice(4, 6))
  };
}

export function createSegmentationOverlaySnapshot(
  document: SegmentationDocument,
  getColorForClass: (classId: string) => string
): SegmentationOverlaySnapshot {
  const pixels = new Uint8ClampedArray(document.width * document.height * 4);
  const alpha = Math.round(document.overlayOpacity * 255);
  const visibleClassIds = new Set(document.getVisibleClassIds());

  for (let index = 0; index < document.mask.length; index += 1) {
    const classId = document.mask[index] ?? 0;
    const channelOffset = index * 4;
    if (!document.overlayVisible || classId === 0) {
      continue;
    }

    const classKey = String(classId);
    if (!visibleClassIds.has(classKey)) {
      continue;
    }

    const { r, g, b } = hexToRgb(getColorForClass(classKey));
    pixels[channelOffset] = r;
    pixels[channelOffset + 1] = g;
    pixels[channelOffset + 2] = b;
    pixels[channelOffset + 3] = alpha;
  }

  return {
    width: document.width,
    height: document.height,
    pixels,
    opacity: document.overlayOpacity,
    visible: document.overlayVisible
  };
}

function createOverlayElement(overlay: SegmentationOverlaySnapshot): unknown {
  if (typeof document === "undefined") {
    return {
      width: overlay.width,
      height: overlay.height,
      overlayPixels: overlay.pixels,
      overlayVisible: overlay.visible,
      overlayOpacity: overlay.opacity
    };
  }

  const canvas = document.createElement("canvas");
  canvas.width = overlay.width;
  canvas.height = overlay.height;
  const context = canvas.getContext("2d");
  if (!context) {
    return canvas;
  }

  const imageData = new ImageData(new Uint8ClampedArray(overlay.pixels), overlay.width, overlay.height);
  context.putImageData(imageData, 0, 0);
  return canvas;
}

export function createSegmentationOverlayObject(
  fabric: FabricRuntimeLike,
  overlay: SegmentationOverlaySnapshot
): FabricImageLike {
  const object = new fabric.Image(createOverlayElement(overlay), {
    left: 0,
    top: 0,
    width: overlay.width,
    height: overlay.height,
    selectable: false,
    hoverCursor: "default"
  });

  object.set({
    visible: overlay.visible,
    opacity: overlay.opacity,
    selectable: false,
    hoverCursor: "default"
  });

  return object;
}

export function updateSegmentationOverlayObject(
  overlayObject: FabricImageLike,
  overlay: SegmentationOverlaySnapshot
): void {
  overlayObject.set({
    width: overlay.width,
    height: overlay.height,
    element: createOverlayElement(overlay),
    visible: overlay.visible,
    opacity: overlay.opacity,
    selectable: false,
    hoverCursor: "default"
  });
  overlayObject.setCoords();
}
