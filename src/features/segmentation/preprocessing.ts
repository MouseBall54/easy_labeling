export type SegmentationImageSourceMode = "original" | "original-processed" | "sr-roi" | "sr-roi-processed";
export type SegmentationViewSourceMode = "original" | "sr-roi" | "processed";

export type SegmentationPreprocessMode = "original" | "edge" | "edge-blend";

export interface SegmentationPreprocessingConfig {
  mode: SegmentationPreprocessMode;
  blurStrength: number;
  edgeWeight: number;
  /** Contrast factor around mid grey (1 = unchanged). Applied before edge processing. */
  contrast: number;
  /** Gamma (1 = unchanged, > 1 brightens mid-tones). Applied after contrast. */
  gamma: number;
}

export interface SegmentationPreprocessingInput {
  width: number;
  height: number;
  rgba: Uint8ClampedArray;
}

export const DEFAULT_SEGMENTATION_PREPROCESSING_CONFIG: SegmentationPreprocessingConfig = {
  mode: "edge-blend",
  blurStrength: 2,
  edgeWeight: 0.65,
  contrast: 1,
  gamma: 1
};

export function normalizeSegmentationPreprocessingConfig(
  config?: Partial<SegmentationPreprocessingConfig>
): SegmentationPreprocessingConfig {
  const mode = config?.mode === "edge" || config?.mode === "original" ? config.mode : "edge-blend";
  return {
    mode,
    blurStrength: Math.max(0, Math.min(4, Math.round(config?.blurStrength ?? DEFAULT_SEGMENTATION_PREPROCESSING_CONFIG.blurStrength))),
    edgeWeight: Math.max(0, Math.min(1, config?.edgeWeight ?? DEFAULT_SEGMENTATION_PREPROCESSING_CONFIG.edgeWeight)),
    contrast: finiteIn(config?.contrast, 0.2, 3, DEFAULT_SEGMENTATION_PREPROCESSING_CONFIG.contrast),
    gamma: finiteIn(config?.gamma, 0.2, 3, DEFAULT_SEGMENTATION_PREPROCESSING_CONFIG.gamma)
  };
}

function finiteIn(value: number | undefined, low: number, high: number, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(low, Math.min(high, value)) : fallback;
}

export function getSegmentationPreprocessingKey(config: SegmentationPreprocessingConfig): string {
  const base = `${config.mode}:${config.blurStrength}:${config.edgeWeight.toFixed(3)}`;
  // Neutral tone keeps the original key so existing caches stay valid.
  return config.contrast === 1 && config.gamma === 1 ? base : `${base}:c${config.contrast.toFixed(2)}:g${config.gamma.toFixed(2)}`;
}

/** 256-entry tone curve for contrast then gamma, or null when both are neutral. */
function toneCurve(config: SegmentationPreprocessingConfig): Float32Array | null {
  if (config.contrast === 1 && config.gamma === 1) return null;
  const curve = new Float32Array(256);
  for (let v = 0; v < 256; v += 1) {
    const contrasted = Math.max(0, Math.min(255, (v - 127.5) * config.contrast + 127.5));
    curve[v] = 255 * Math.pow(contrasted / 255, 1 / config.gamma);
  }
  return curve;
}

/** Applies the curve to fractional values by interpolating between entries. */
function applyTone(values: Float32Array, curve: Float32Array): Float32Array {
  const out = new Float32Array(values.length);
  for (let index = 0; index < values.length; index += 1) {
    const v = Math.max(0, Math.min(255, values[index] ?? 0));
    const lo = Math.floor(v);
    const hi = Math.min(255, lo + 1);
    out[index] = curve[lo] + (curve[hi] - curve[lo]) * (v - lo);
  }
  return out;
}

function clampByte(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function toGrayscale(input: SegmentationPreprocessingInput): Float32Array {
  const gray = new Float32Array(input.width * input.height);
  for (let index = 0; index < gray.length; index += 1) {
    const offset = index * 4;
    gray[index] = (input.rgba[offset] ?? 0) * 0.2126
      + (input.rgba[offset + 1] ?? 0) * 0.7152
      + (input.rgba[offset + 2] ?? 0) * 0.0722;
  }
  return gray;
}

function blurGaussian(gray: Float32Array, width: number, height: number, strength: number): Float32Array {
  let result = gray;
  for (let pass = 0; pass < strength; pass += 1) {
    const horizontal = new Float32Array(result.length);
    const vertical = new Float32Array(result.length);
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const left = result[y * width + Math.max(0, x - 1)] ?? 0;
        const center = result[y * width + x] ?? 0;
        const right = result[y * width + Math.min(width - 1, x + 1)] ?? 0;
        horizontal[y * width + x] = (left + (2 * center) + right) / 4;
      }
    }
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const top = horizontal[Math.max(0, y - 1) * width + x] ?? 0;
        const center = horizontal[y * width + x] ?? 0;
        const bottom = horizontal[Math.min(height - 1, y + 1) * width + x] ?? 0;
        vertical[y * width + x] = (top + (2 * center) + bottom) / 4;
      }
    }
    result = vertical;
  }
  return result;
}

function normalizedSobel(gray: Float32Array, width: number, height: number): Float32Array {
  const gradient = new Float32Array(gray.length);
  let maximum = 0;
  const sample = (x: number, y: number): number => gray[Math.max(0, Math.min(height - 1, y)) * width + Math.max(0, Math.min(width - 1, x))] ?? 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const gx = -sample(x - 1, y - 1) + sample(x + 1, y - 1)
        - (2 * sample(x - 1, y)) + (2 * sample(x + 1, y))
        - sample(x - 1, y + 1) + sample(x + 1, y + 1);
      const gy = -sample(x - 1, y - 1) - (2 * sample(x, y - 1)) - sample(x + 1, y - 1)
        + sample(x - 1, y + 1) + (2 * sample(x, y + 1)) + sample(x + 1, y + 1);
      const value = Math.hypot(gx, gy);
      gradient[y * width + x] = value;
      maximum = Math.max(maximum, value);
    }
  }
  if (maximum > 0) {
    for (let index = 0; index < gradient.length; index += 1) gradient[index] = (gradient[index] ?? 0) * 255 / maximum;
  }
  return gradient;
}

/** The "Processed" view on a luma image (0-255). DOM-free, so workers can use it. */
export function preprocessGray(source: Float32Array, width: number, height: number, requestedConfig?: Partial<SegmentationPreprocessingConfig>): Float32Array {
  const config = normalizeSegmentationPreprocessingConfig(requestedConfig);
  // Tone first, so edge detection sees the adjusted contrast.
  const curve = toneCurve(config);
  const gray = curve ? applyTone(source, curve) : source;
  if (config.mode === "original") return gray;
  const gradient = normalizedSobel(blurGaussian(gray, width, height, config.blurStrength), width, height);
  if (config.mode === "edge") return gradient;
  const out = new Float32Array(gray.length);
  for (let index = 0; index < gray.length; index += 1) {
    out[index] = ((gray[index] ?? 0) * (1 - config.edgeWeight)) + ((gradient[index] ?? 0) * config.edgeWeight);
  }
  return out;
}

export function preprocessSegmentationImage(
  input: SegmentationPreprocessingInput,
  requestedConfig?: Partial<SegmentationPreprocessingConfig>
): Uint8ClampedArray {
  if (input.width < 1 || input.height < 1 || input.rgba.length !== input.width * input.height * 4) {
    throw new Error("segmentation preprocessing image dimensions are invalid");
  }
  const config = normalizeSegmentationPreprocessingConfig(requestedConfig);
  if (config.mode === "original") {
    // Original mode keeps colour: the tone curve is applied per channel.
    const curve = toneCurve(config);
    const rgba = new Uint8ClampedArray(input.rgba);
    if (curve) for (let index = 0; index < rgba.length; index += 1) if (index % 4 !== 3) rgba[index] = clampByte(curve[rgba[index]]);
    return rgba;
  }

  const processed = preprocessGray(toGrayscale(input), input.width, input.height, config);
  const rgba = new Uint8ClampedArray(input.rgba.length);
  for (let index = 0; index < processed.length; index += 1) {
    const offset = index * 4;
    const byte = clampByte(processed[index] ?? 0);
    rgba[offset] = byte;
    rgba[offset + 1] = byte;
    rgba[offset + 2] = byte;
    rgba[offset + 3] = input.rgba[offset + 3] ?? 255;
  }
  return rgba;
}
