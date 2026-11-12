import type { FabricImageLike, FabricRuntimeLike } from "../canvas/fabric-types.js";
import type { SegmentationDocument } from "./document.js";
import type { SuperpixelResult } from "./superpixels.js";
import type { SegmentationRegionBounds, SegmentationRegionSelection } from "./types.js";

interface OverlayFallbackElement {
  width: number;
  height: number;
  overlayPixels: Uint8ClampedArray;
  overlayVisible: boolean;
  overlayOpacity: number;
}

interface OverlayBufferState {
  width: number;
  height: number;
  pixels: Uint8ClampedArray;
  imageData: ImageData | null;
  context: CanvasRenderingContext2D | null;
  element: HTMLCanvasElement | OverlayFallbackElement;
}

interface CachedColor {
  hex: string;
  r: number;
  g: number;
  b: number;
}

interface RgbColor {
  r: number;
  g: number;
  b: number;
}

const MAX_EDGE_GLOW_RADIUS = 3;

export interface SegmentationOverlayUpdateOptions {
  dirtyBounds?: SegmentationRegionBounds | null;
  forceFull?: boolean;
}

export interface SegmentationMaskOverlayLayer {
  readonly object: FabricImageLike;
  sync(
    document: SegmentationDocument,
    getColorForClass: (classId: string) => string,
    options?: SegmentationOverlayUpdateOptions
  ): void;
}

export interface SegmentationSelectionOverlayLayer {
  readonly object: FabricImageLike;
  sync(input: {
    width: number;
    height: number;
    selection: SegmentationRegionSelection | null;
    getColorForClass: (classId: string) => string;
    variant?: "selection" | "smart-add" | "smart-remove";
  }, options?: SegmentationOverlayUpdateOptions): void;
}

export interface SegmentationSuperpixelOverlayLayer {
  readonly object: FabricImageLike;
  sync(result: SuperpixelResult | null, visible: boolean): void;
}

function createFullBounds(width: number, height: number): SegmentationRegionBounds | null {
  if (width <= 0 || height <= 0) {
    return null;
  }
  return {
    left: 0,
    top: 0,
    right: width - 1,
    bottom: height - 1
  };
}

function cloneBounds(bounds: SegmentationRegionBounds): SegmentationRegionBounds {
  return {
    left: bounds.left,
    top: bounds.top,
    right: bounds.right,
    bottom: bounds.bottom
  };
}

function mergeBounds(
  left: SegmentationRegionBounds | null,
  right: SegmentationRegionBounds | null
): SegmentationRegionBounds | null {
  if (!left) {
    return right ? cloneBounds(right) : null;
  }
  if (!right) {
    return cloneBounds(left);
  }
  return {
    left: Math.min(left.left, right.left),
    top: Math.min(left.top, right.top),
    right: Math.max(left.right, right.right),
    bottom: Math.max(left.bottom, right.bottom)
  };
}

function clampBounds(
  bounds: SegmentationRegionBounds,
  width: number,
  height: number
): SegmentationRegionBounds | null {
  if (width <= 0 || height <= 0) {
    return null;
  }
  const left = Math.max(0, Math.min(width - 1, Math.floor(bounds.left)));
  const top = Math.max(0, Math.min(height - 1, Math.floor(bounds.top)));
  const right = Math.max(0, Math.min(width - 1, Math.ceil(bounds.right)));
  const bottom = Math.max(0, Math.min(height - 1, Math.ceil(bounds.bottom)));
  if (right < left || bottom < top) {
    return null;
  }
  return { left, top, right, bottom };
}

function expandBounds(
  bounds: SegmentationRegionBounds,
  width: number,
  height: number,
  margin: number
): SegmentationRegionBounds | null {
  return clampBounds({
    left: bounds.left - margin,
    top: bounds.top - margin,
    right: bounds.right + margin,
    bottom: bounds.bottom + margin
  }, width, height);
}

function parseHexChannel(value: string): number {
  return Number.parseInt(value, 16);
}

function hexToRgb(hex: string): RgbColor {
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

function createFallbackElement(width: number, height: number): OverlayFallbackElement {
  return {
    width,
    height,
    overlayPixels: new Uint8ClampedArray(width * height * 4),
    overlayVisible: true,
    overlayOpacity: 1
  };
}

function createOverlayBufferState(width: number, height: number): OverlayBufferState {
  if (typeof document === "undefined") {
    const element = createFallbackElement(width, height);
    return {
      width,
      height,
      pixels: element.overlayPixels,
      imageData: null,
      context: null,
      element
    };
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    const fallback = createFallbackElement(width, height);
    return {
      width,
      height,
      pixels: fallback.overlayPixels,
      imageData: null,
      context: null,
      element: fallback
    };
  }

  const imageData = context.createImageData(width, height);
  return {
    width,
    height,
    pixels: imageData.data,
    imageData,
    context,
    element: canvas
  };
}

function resizeOverlayBufferState(state: OverlayBufferState, width: number, height: number): boolean {
  if (state.width === width && state.height === height) {
    return false;
  }

  state.width = width;
  state.height = height;

  if ("overlayPixels" in state.element) {
    state.element.width = width;
    state.element.height = height;
    state.element.overlayPixels = new Uint8ClampedArray(width * height * 4);
    state.pixels = state.element.overlayPixels;
    state.context = null;
    state.imageData = null;
    return true;
  }

  state.element.width = width;
  state.element.height = height;
  const context = state.element.getContext("2d");
  state.context = context;
  state.imageData = context ? context.createImageData(width, height) : null;
  state.pixels = state.imageData ? state.imageData.data : new Uint8ClampedArray(width * height * 4);
  return true;
}

function commitOverlayBuffer(state: OverlayBufferState, dirtyBounds: SegmentationRegionBounds | null): void {
  if (state.context && state.imageData) {
    if (!dirtyBounds) {
      state.context.putImageData(state.imageData, 0, 0);
      return;
    }
    const dirtyWidth = dirtyBounds.right - dirtyBounds.left + 1;
    const dirtyHeight = dirtyBounds.bottom - dirtyBounds.top + 1;
    state.context.putImageData(
      state.imageData,
      0,
      0,
      dirtyBounds.left,
      dirtyBounds.top,
      dirtyWidth,
      dirtyHeight
    );
    return;
  }

  if ("overlayPixels" in state.element) {
    state.element.overlayPixels = state.pixels;
  }
}

function refreshOverlayObjectSource(overlayObject: FabricImageLike, state: OverlayBufferState): void {
  // Fabric caches an Image object's source. Updating the pixels of the same
  // canvas element alone therefore does not guarantee that requestRenderAll()
  // reads the new mask immediately.
  overlayObject.setElement?.(state.element);
  overlayObject.set({ dirty: true });
}

function updateOverlayObjectState(
  overlayObject: FabricImageLike,
  width: number,
  height: number,
  visible: boolean,
  opacity: number
): void {
  overlayObject.set({
    width,
    height,
    visible,
    opacity,
    originX: "left",
    originY: "top",
    selectable: false,
    evented: false,
    hoverCursor: "default"
  });
  overlayObject.setCoords();
}

function createOverlayObject(
  fabric: FabricRuntimeLike,
  state: OverlayBufferState,
  visible: boolean,
  opacity: number
): FabricImageLike {
  const object = new fabric.Image(state.element, {
    left: 0,
    top: 0,
    width: state.width,
    height: state.height,
    originX: "left",
    originY: "top",
    selectable: false,
    evented: false,
    hoverCursor: "default"
  });
  Object.defineProperty(object, "element", {
    configurable: true,
    writable: true,
    value: state.element
  });
  object._isSegmentationOverlay = true;
  updateOverlayObjectState(object, state.width, state.height, visible, opacity);
  return object;
}

function resolveCachedColor(
  cache: Map<string, CachedColor>,
  classId: string,
  getColorForClass: (classId: string) => string
): { r: number; g: number; b: number } {
  const nextHex = getColorForClass(classId);
  const cached = cache.get(classId);
  if (cached && cached.hex === nextHex) {
    return cached;
  }

  const rgb = hexToRgb(nextHex);
  cache.set(classId, {
    hex: nextHex,
    ...rgb
  });
  return rgb;
}

function clearPixelAtIndex(pixels: Uint8ClampedArray, index: number): void {
  const offset = index * 4;
  pixels[offset] = 0;
  pixels[offset + 1] = 0;
  pixels[offset + 2] = 0;
  pixels[offset + 3] = 0;
}

function writePixelAtIndex(
  pixels: Uint8ClampedArray,
  index: number,
  color: RgbColor,
  alpha: number
): void {
  const offset = index * 4;
  pixels[offset] = color.r;
  pixels[offset + 1] = color.g;
  pixels[offset + 2] = color.b;
  pixels[offset + 3] = alpha;
}

function mixWithWhite(color: RgbColor, amount: number): RgbColor {
  const clampedAmount = Math.min(1, Math.max(0, amount));
  return {
    r: Math.round(color.r + ((255 - color.r) * clampedAmount)),
    g: Math.round(color.g + ((255 - color.g) * clampedAmount)),
    b: Math.round(color.b + ((255 - color.b) * clampedAmount))
  };
}

function getEdgeGlowRadius(intensity: number): number {
  if (intensity <= 0) {
    return 0;
  }
  return Math.max(1, Math.min(MAX_EDGE_GLOW_RADIUS, Math.round(1 + (intensity * 2))));
}

function isBoundaryPixel(
  mask: Uint16Array,
  width: number,
  height: number,
  x: number,
  y: number,
  classId: number
): boolean {
  if (x <= 0 || y <= 0 || x >= width - 1 || y >= height - 1) {
    return true;
  }

  const index = (y * width) + x;
  return (
    (mask[index - width] ?? 0) !== classId ||
    (mask[index + width] ?? 0) !== classId ||
    (mask[index - 1] ?? 0) !== classId ||
    (mask[index + 1] ?? 0) !== classId
  );
}

function clearPixelsInBounds(pixels: Uint8ClampedArray, width: number, bounds: SegmentationRegionBounds): void {
  for (let y = bounds.top; y <= bounds.bottom; y += 1) {
    const rowStart = (y * width) + bounds.left;
    pixels.fill(0, rowStart * 4, (rowStart + bounds.right - bounds.left + 1) * 4);
  }
}

function writeHaloPixel(
  pixels: Uint8ClampedArray,
  index: number,
  color: RgbColor,
  alpha: number
): void {
  const offset = index * 4;
  if ((pixels[offset + 3] ?? 0) >= alpha) {
    return;
  }
  pixels[offset] = color.r;
  pixels[offset + 1] = color.g;
  pixels[offset + 2] = color.b;
  pixels[offset + 3] = alpha;
}

// Glow offsets and alphas inside the radius, in the order the old per-pixel loop visited them.
function createHaloKernel(radius: number, alphaBase: number): Array<{ dx: number; dy: number; alpha: number }> {
  const taps: Array<{ dx: number; dy: number; alpha: number }> = [];
  for (let dy = -radius; dy <= radius; dy += 1) {
    for (let dx = -radius; dx <= radius; dx += 1) {
      const distance = Math.hypot(dx, dy);
      if ((dx === 0 && dy === 0) || distance > radius) {
        continue;
      }
      taps.push({ dx, dy, alpha: Math.round(alphaBase * (1 - (distance / (radius + 1)))) });
    }
  }
  return taps;
}

export function createSegmentationMaskOverlayLayer(fabric: FabricRuntimeLike): SegmentationMaskOverlayLayer {
  const state = createOverlayBufferState(1, 1);
  const overlayObject = createOverlayObject(fabric, state, false, 1);
  const colorCache = new Map<string, CachedColor>();

  return {
    object: overlayObject,

    sync(document, getColorForClass, options) {
      const resized = resizeOverlayBufferState(state, document.width, document.height);
      const fullBounds = createFullBounds(document.width, document.height);
      const hasDirtyBoundsOption = Object.prototype.hasOwnProperty.call(options ?? {}, "dirtyBounds");
      const forceFull = Boolean(options?.forceFull) || resized || !hasDirtyBoundsOption;
      const edgeIntensity = Math.min(1, Math.max(0, document.edgeHighlightIntensity));
      const glowRadius = document.edgeHighlightVisible ? getEdgeGlowRadius(edgeIntensity) : 0;
      const dirtyMargin = document.edgeHighlightVisible ? glowRadius + 1 : 0;
      const dirtyBounds = forceFull
        ? fullBounds
        : options?.dirtyBounds
          ? expandBounds(options.dirtyBounds, document.width, document.height, dirtyMargin)
          : null;

      if (dirtyBounds) {
        // Per-class lookup tables instead of a String() + Set + Map lookup per pixel,
        // and the hidden list instead of a whole-mask scan for visible classes.
        const hiddenClassIds = document.getHiddenClassIds();
        const classState = new Uint8Array(65536); // 0 unresolved, 1 visible, 2 hidden
        for (const classKey of hiddenClassIds) {
          const classNumber = Number(classKey);
          if (Number.isInteger(classNumber) && classNumber > 0 && classNumber < 65536) {
            classState[classNumber] = 2;
          }
        }
        const classColors: RgbColor[] = [];
        const edgeVisible = document.edgeHighlightVisible;
        const { mask, width, height } = document;
        const edgeIndices: number[] = [];
        clearPixelsInBounds(state.pixels, width, dirtyBounds);

        for (let y = dirtyBounds.top; y <= dirtyBounds.bottom; y += 1) {
          const rowStart = y * width;
          for (let x = dirtyBounds.left; x <= dirtyBounds.right; x += 1) {
            const index = rowStart + x;
            const classId = mask[index] as number;
            if (classId === 0) {
              continue;
            }
            let visibility = classState[classId];
            if (visibility === 0) {
              classColors[classId] = resolveCachedColor(colorCache, String(classId), getColorForClass);
              classState[classId] = 1;
              visibility = 1;
            }
            if (visibility === 2) {
              continue;
            }
            writePixelAtIndex(state.pixels, index, classColors[classId] as RgbColor, 255);
            if (edgeVisible && isBoundaryPixel(mask, width, height, x, y, classId)) {
              edgeIndices.push(index);
            }
          }
        }

        if (edgeVisible && edgeIndices.length > 0) {
          const edgeBlend = 0.58 + (edgeIntensity * 0.32);
          const haloAlphaBase = Math.round(48 + (edgeIntensity * 128));
          const halo = glowRadius > 0 && haloAlphaBase > 0 ? createHaloKernel(glowRadius, haloAlphaBase) : [];
          const edgeColors: RgbColor[] = [];
          const haloColors: RgbColor[] = [];
          for (const index of edgeIndices) {
            const classId = mask[index] as number;
            let edgeColor = edgeColors[classId];
            let haloColor = haloColors[classId];
            if (!edgeColor || !haloColor) {
              const color = classColors[classId] as RgbColor;
              edgeColor = edgeColors[classId] = mixWithWhite(color, edgeBlend);
              haloColor = haloColors[classId] = mixWithWhite(color, 0.72);
            }
            const x = index % width;
            const y = (index - x) / width;
            for (const tap of halo) {
              const haloX = x + tap.dx;
              const haloY = y + tap.dy;
              if (
                haloX < dirtyBounds.left ||
                haloX > dirtyBounds.right ||
                haloY < dirtyBounds.top ||
                haloY > dirtyBounds.bottom
              ) {
                continue;
              }
              const haloIndex = (haloY * width) + haloX;
              if (mask[haloIndex] !== 0) {
                continue;
              }
              writeHaloPixel(state.pixels, haloIndex, haloColor, tap.alpha);
            }
            writePixelAtIndex(state.pixels, index, edgeColor, 255);
          }
        }

        commitOverlayBuffer(state, forceFull ? null : dirtyBounds);
        refreshOverlayObjectSource(overlayObject, state);
      }

      if ("overlayVisible" in state.element) {
        state.element.overlayVisible = document.overlayVisible;
        state.element.overlayOpacity = document.overlayOpacity;
      }
      updateOverlayObjectState(
        overlayObject,
        document.width,
        document.height,
        document.overlayVisible,
        document.overlayOpacity
      );
    }
  };
}

export function createSegmentationSelectionOverlayLayer(fabric: FabricRuntimeLike): SegmentationSelectionOverlayLayer {
  const state = createOverlayBufferState(1, 1);
  const overlayObject = createOverlayObject(fabric, state, false, 1);
  let previousSelectionIndices: Uint32Array | null = null;
  let previousSelectionBounds: SegmentationRegionBounds | null = null;

  return {
    object: overlayObject,

    sync(input, options) {
      const resized = resizeOverlayBufferState(state, input.width, input.height);
      const fullBounds = createFullBounds(input.width, input.height);
      const forceFull = Boolean(options?.forceFull) || resized;

      let dirtyBounds = forceFull ? fullBounds : null;

      if (forceFull) {
        state.pixels.fill(0);
      } else if (previousSelectionIndices && previousSelectionBounds) {
        for (const index of previousSelectionIndices) {
          if (index >= input.width * input.height) {
            continue;
          }
          clearPixelAtIndex(state.pixels, index);
        }
        dirtyBounds = mergeBounds(dirtyBounds, previousSelectionBounds);
      }

      if (input.selection) {
        const baseColor = hexToRgb(input.getColorForClass(input.selection.classId));
        const color = input.variant === "smart-remove"
          ? { r: 230, g: 75, b: 75 }
          : {
            r: Math.min(255, baseColor.r + 40),
            g: Math.min(255, baseColor.g + 40),
            b: Math.min(255, baseColor.b + 40)
          };
        const alpha = input.variant === "selection" || !input.variant ? 220 : 155;
        for (const index of input.selection.pixelIndices) {
          if (index >= input.width * input.height) {
            continue;
          }
          writePixelAtIndex(state.pixels, index, color, alpha);
        }
        dirtyBounds = mergeBounds(dirtyBounds, input.selection.bounds);
        previousSelectionIndices = input.selection.pixelIndices;
        previousSelectionBounds = cloneBounds(input.selection.bounds);
      } else {
        previousSelectionIndices = null;
        previousSelectionBounds = null;
      }

      const clampedDirtyBounds = dirtyBounds
        ? clampBounds(dirtyBounds, input.width, input.height)
        : null;
      if (clampedDirtyBounds) {
        commitOverlayBuffer(state, forceFull ? null : clampedDirtyBounds);
        refreshOverlayObjectSource(overlayObject, state);
      }

      if ("overlayVisible" in state.element) {
        state.element.overlayVisible = Boolean(input.selection);
        state.element.overlayOpacity = 1;
      }
      updateOverlayObjectState(overlayObject, input.width, input.height, Boolean(input.selection), 1);
    }
  };
}

export function createSegmentationSuperpixelOverlayLayer(fabric: FabricRuntimeLike): SegmentationSuperpixelOverlayLayer {
  const state = createOverlayBufferState(1, 1);
  const overlayObject = createOverlayObject(fabric, state, false, 1);
  return {
    object: overlayObject,
    sync(result, visible) {
      if (!result) {
        updateOverlayObjectState(overlayObject, state.width, state.height, false, 1);
        return;
      }
      resizeOverlayBufferState(state, result.width, result.height);
      state.pixels.fill(0);
      result.boundaries.forEach((boundary, index) => {
        if (boundary === 0) return;
        writePixelAtIndex(state.pixels, index, { r: 255, g: 255, b: 255 }, 155);
      });
      commitOverlayBuffer(state, null);
      refreshOverlayObjectSource(overlayObject, state);
      updateOverlayObjectState(overlayObject, result.width, result.height, visible, 1);
    }
  };
}
