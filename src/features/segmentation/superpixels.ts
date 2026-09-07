import type { SegmentationStrength, SegmentationSuperpixelSettings } from "./types.js";

export interface SuperpixelImageData {
  cacheKey?: string;
  width: number;
  height: number;
  rgba: Uint8ClampedArray;
}

export const DEFAULT_SUPERPIXEL_SETTINGS: SegmentationSuperpixelSettings = {
  regionSize: 16,
  blur: "off",
  contrast: "off",
  edgeSensitivity: "medium"
};

function normalizeStrength(value: SegmentationStrength): SegmentationStrength {
  return value === "low" || value === "medium" || value === "high" ? value : "off";
}

export function normalizeSuperpixelSettings(settings?: Partial<SegmentationSuperpixelSettings>): SegmentationSuperpixelSettings {
  const edgeSensitivity = settings?.edgeSensitivity;
  return {
    regionSize: clamp(Math.round(settings?.regionSize ?? DEFAULT_SUPERPIXEL_SETTINGS.regionSize), 2, 4096),
    blur: normalizeStrength(settings?.blur ?? DEFAULT_SUPERPIXEL_SETTINGS.blur),
    contrast: normalizeStrength(settings?.contrast ?? DEFAULT_SUPERPIXEL_SETTINGS.contrast),
    edgeSensitivity: edgeSensitivity === "low" || edgeSensitivity === "high" ? edgeSensitivity : "medium"
  };
}

export interface SuperpixelRegion {
  id: number;
  pixelCount: number;
  meanIntensity: number;
  meanEdgeStrength: number;
  neighbors: number[];
}

export interface SuperpixelResult {
  width: number;
  height: number;
  regionSize: number;
  labels: Int32Array;
  boundaries: Uint8Array;
  regions: SuperpixelRegion[];
}

export function growSuperpixelRegion(input: {
  result: SuperpixelResult;
  seedId: number;
  similarity: number;
  edgeStop: number;
}): number[] {
  const seed = input.result.regions[input.seedId];
  if (!seed) return [];
  const similarity = clamp(input.similarity, 0, 1);
  const edgeStop = clamp(input.edgeStop, 0, 1);
  const selected = new Set<number>([seed.id]);
  const queue = [seed.id];
  while (queue.length > 0) {
    const currentId = queue.shift();
    const current = currentId === undefined ? null : input.result.regions[currentId];
    if (!current) continue;
    current.neighbors.forEach((neighborId) => {
      if (selected.has(neighborId)) return;
      const neighbor = input.result.regions[neighborId];
      if (!neighbor) return;
      const intensityDifference = Math.abs(seed.meanIntensity - neighbor.meanIntensity) / 255;
      const edgePenalty = ((current.meanEdgeStrength + neighbor.meanEdgeStrength) / 2) * edgeStop;
      if (intensityDifference + edgePenalty > similarity) return;
      selected.add(neighborId);
      queue.push(neighborId);
    });
  }
  return [...selected].sort((left, right) => left - right);
}

interface Center {
  x: number;
  y: number;
  intensity: number;
  maxColorDistance: number;
}

function intensityAt(rgba: Uint8ClampedArray, index: number): number {
  return (rgba[index] ?? 0) * 0.2126 + (rgba[index + 1] ?? 0) * 0.7152 + (rgba[index + 2] ?? 0) * 0.0722;
}

/** A small Gaussian-like smoothing pass used only for edge weighting. */
function createSmoothedIntensity(rgba: Uint8ClampedArray, width: number, height: number, blur: SegmentationStrength): Float32Array {
  const passes = blur === "high" ? 3 : blur === "medium" ? 2 : blur === "low" ? 1 : 0;
  const values = new Float32Array(width * height);
  for (let index = 0; index < values.length; index += 1) values[index] = intensityAt(rgba, index * 4);
  for (let pass = 0; pass < passes; pass += 1) {
    const source = new Float32Array(values);
  for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
    let total = 0;
    let weightTotal = 0;
    for (let offsetY = -1; offsetY <= 1; offsetY += 1) for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
      const sampleX = x + offsetX;
      const sampleY = y + offsetY;
      if (sampleX < 0 || sampleY < 0 || sampleX >= width || sampleY >= height) continue;
      const weight = offsetX === 0 && offsetY === 0 ? 4 : (offsetX === 0 || offsetY === 0 ? 2 : 1);
      total += source[(sampleY * width) + sampleX]! * weight;
      weightTotal += weight;
    }
    values[(y * width) + x] = total / weightTotal;
  }
  }
  return values;
}

function createPreprocessedIntensity(rgba: Uint8ClampedArray, width: number, height: number, settings: SegmentationSuperpixelSettings): Float32Array {
  const values = createSmoothedIntensity(rgba, width, height, settings.blur);
  const contrast = settings.contrast === "high" ? 1.45 : settings.contrast === "medium" ? 1.25 : settings.contrast === "low" ? 1.1 : 1;
  if (contrast !== 1) {
    for (let index = 0; index < values.length; index += 1) values[index] = clamp(128 + ((values[index]! - 128) * contrast), 0, 255);
  }
  return values;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * A compact SLICO implementation for grayscale and RGB images. It intentionally
 * exposes only region size; local color normalization removes a user-facing
 * compactness parameter as SLICO does.
 */
export function createSlicoSuperpixels(input: SuperpixelImageData, requestedRegionSize: number, iterations = 5, settings?: Partial<SegmentationSuperpixelSettings>): SuperpixelResult {
  if (input.width < 1 || input.height < 1 || input.rgba.length !== input.width * input.height * 4) {
    throw new Error("superpixel image dimensions are invalid");
  }
  const normalizedSettings = normalizeSuperpixelSettings({ ...settings, regionSize: requestedRegionSize });
  const regionSize = clamp(normalizedSettings.regionSize, 2, Math.max(input.width, input.height));
  const smoothedIntensity = createPreprocessedIntensity(input.rgba, input.width, input.height, normalizedSettings);
  const centers: Center[] = [];
  for (let y = Math.floor(regionSize / 2); y < input.height; y += regionSize) {
    for (let x = Math.floor(regionSize / 2); x < input.width; x += regionSize) {
      centers.push({ x, y, intensity: smoothedIntensity[(y * input.width) + x]!, maxColorDistance: 1 });
    }
  }
  if (centers.length === 0) {
    centers.push({ x: 0, y: 0, intensity: smoothedIntensity[0]!, maxColorDistance: 1 });
  }

  const labels = new Int32Array(input.width * input.height);
  const distances = new Float64Array(labels.length);
  for (let iteration = 0; iteration < Math.max(1, iterations); iteration += 1) {
    labels.fill(-1);
    distances.fill(Number.POSITIVE_INFINITY);
    centers.forEach((center, centerId) => {
      const minX = clamp(Math.floor(center.x - regionSize), 0, input.width - 1);
      const maxX = clamp(Math.ceil(center.x + regionSize), 0, input.width - 1);
      const minY = clamp(Math.floor(center.y - regionSize), 0, input.height - 1);
      const maxY = clamp(Math.ceil(center.y + regionSize), 0, input.height - 1);
      const colorScale = Math.max(1, center.maxColorDistance);
      for (let y = minY; y <= maxY; y += 1) {
        for (let x = minX; x <= maxX; x += 1) {
          const pixel = (y * input.width) + x;
          const colorDistance = smoothedIntensity[pixel]! - center.intensity;
          const spatialDistance = Math.hypot(x - center.x, y - center.y) / regionSize;
          const distance = (colorDistance / colorScale) ** 2 + spatialDistance ** 2;
          if (distance < distances[pixel]!) {
            distances[pixel] = distance;
            labels[pixel] = centerId;
          }
        }
      }
    });

    const counts = new Uint32Array(centers.length);
    const sumX = new Float64Array(centers.length);
    const sumY = new Float64Array(centers.length);
    const sumIntensity = new Float64Array(centers.length);
    const maxColorDistance = new Float64Array(centers.length);
    labels.forEach((label, pixel) => {
      if (label < 0) return;
      const x = pixel % input.width;
      const y = Math.floor(pixel / input.width);
      counts[label] += 1;
      sumX[label] += x;
      sumY[label] += y;
      const value = smoothedIntensity[pixel]!;
      sumIntensity[label] += value;
    });
    labels.forEach((label, pixel) => {
      if (label < 0 || counts[label] === 0) return;
      const mean = sumIntensity[label]! / counts[label]!;
      maxColorDistance[label] = Math.max(maxColorDistance[label]!, Math.abs(smoothedIntensity[pixel]! - mean));
    });
    centers.forEach((center, id) => {
      if (counts[id] === 0) return;
      center.x = sumX[id]! / counts[id]!;
      center.y = sumY[id]! / counts[id]!;
      center.intensity = sumIntensity[id]! / counts[id]!;
      center.maxColorDistance = Math.max(1, maxColorDistance[id]!);
    });
  }

  const boundarySet = new Uint8Array(labels.length);
  const neighborSets = Array.from({ length: centers.length }, () => new Set<number>());
  labels.forEach((label, pixel) => {
    const x = pixel % input.width;
    const right = x < input.width - 1 ? labels[pixel + 1] : label;
    const below = pixel < labels.length - input.width ? labels[pixel + input.width] : label;
    [right, below].forEach((neighbor) => {
      if (neighbor === label || neighbor < 0 || label < 0) return;
      boundarySet[pixel] = 1;
      if (neighbor === right) boundarySet[pixel + 1] = 1;
      if (neighbor === below) boundarySet[pixel + input.width] = 1;
      neighborSets[label]?.add(neighbor);
      neighborSets[neighbor]?.add(label);
    });
  });
  const pixelCounts = new Uint32Array(centers.length);
  const intensitySums = new Float64Array(centers.length);
  const edgeSums = new Float64Array(centers.length);
  labels.forEach((label, pixel) => {
    if (label < 0) return;
    pixelCounts[label] += 1;
    intensitySums[label] += smoothedIntensity[pixel]!;
    const x = pixel % input.width;
    const y = Math.floor(pixel / input.width);
    const current = smoothedIntensity[pixel] ?? 0;
    const right = x < input.width - 1 ? (smoothedIntensity[pixel + 1] ?? current) : current;
    const below = y < input.height - 1 ? (smoothedIntensity[pixel + input.width] ?? current) : current;
    const sensitivity = normalizedSettings.edgeSensitivity === "high" ? 1.3 : normalizedSettings.edgeSensitivity === "low" ? 0.7 : 1;
    edgeSums[label] += Math.min(1, ((Math.abs(right - current) + Math.abs(below - current)) / 255) * sensitivity);
  });
  return {
    width: input.width,
    height: input.height,
    regionSize,
    labels,
    boundaries: boundarySet,
    regions: centers.map((_, id) => ({
      id,
      pixelCount: pixelCounts[id] ?? 0,
      meanIntensity: (intensitySums[id] ?? 0) / Math.max(1, pixelCounts[id] ?? 0),
      meanEdgeStrength: (edgeSums[id] ?? 0) / Math.max(1, pixelCounts[id] ?? 0),
      neighbors: [...(neighborSets[id] ?? new Set())].sort((left, right) => left - right)
    }))
  };
}

export function createSuperpixelCache() {
  const cachedByKey = new Map<string, SuperpixelResult>();
  let cachedByPixels = new WeakMap<Uint8ClampedArray, Map<number, SuperpixelResult>>();
  return {
    getOrCreate(input: SuperpixelImageData, regionSize: number, settings?: Partial<SegmentationSuperpixelSettings>): SuperpixelResult {
      const normalizedSettings = normalizeSuperpixelSettings({ ...settings, regionSize });
      const normalizedSize = clamp(normalizedSettings.regionSize, 2, Math.max(input.width, input.height));
      const settingsKey = `${normalizedSettings.blur}:${normalizedSettings.contrast}:${normalizedSettings.edgeSensitivity}`;
      if (input.cacheKey) {
        const key = `${input.cacheKey}:${normalizedSize}:${settingsKey}`;
        const existing = cachedByKey.get(key);
        if (existing) return existing;
        const result = createSlicoSuperpixels(input, normalizedSize, 5, normalizedSettings);
        cachedByKey.set(key, result);
        return result;
      }
      const existingByPixels = cachedByPixels.get(input.rgba)?.get(normalizedSize);
      if (existingByPixels) return existingByPixels;
      const result = createSlicoSuperpixels(input, regionSize, 5, normalizedSettings);
      const bySize = cachedByPixels.get(input.rgba) ?? new Map<number, SuperpixelResult>();
      bySize.set(normalizedSize, result);
      cachedByPixels.set(input.rgba, bySize);
      return result;
    },
    clear(): void {
      cachedByKey.clear();
      cachedByPixels = new WeakMap<Uint8ClampedArray, Map<number, SuperpixelResult>>();
    }
  };
}
