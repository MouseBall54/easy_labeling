// Grayscale filters for SEM/TEM preprocessing. Pure, DOM-free and O(pixels) so they can run on the main
// thread for the canvas view and inside the refine worker. All values are luma on a 0-255 scale.

const clampByte = (value: number): number => (value < 0 ? 0 : value > 255 ? 255 : value);

/** 256-bin histogram of rounded, clamped values. */
function histogram(values: Float32Array, from = 0, to = values.length, step = 1): Uint32Array {
  const bins = new Uint32Array(256);
  for (let i = from; i < to; i += step) bins[Math.round(clampByte(values[i]))] += 1;
  return bins;
}

function binQuantile(bins: Uint32Array, total: number, q: number): number {
  const target = q * (total - 1);
  let seen = 0;
  for (let v = 0; v < 256; v += 1) {
    seen += bins[v];
    if (seen > target) return v;
  }
  return 255;
}

/** 3x3 median (edge pixels use clamped neighbours): removes impulse noise and dropped pixels. */
export function median3x3(src: Float32Array, width: number, height: number): Float32Array {
  const out = new Float32Array(src.length);
  const p = new Float32Array(9);
  for (let y = 0; y < height; y += 1) {
    const ym = (y > 0 ? y - 1 : 0) * width;
    const y0 = y * width;
    const yp = (y < height - 1 ? y + 1 : y) * width;
    for (let x = 0; x < width; x += 1) {
      const xm = x > 0 ? x - 1 : 0;
      const xp = x < width - 1 ? x + 1 : x;
      p[0] = src[ym + xm]; p[1] = src[ym + x]; p[2] = src[ym + xp];
      p[3] = src[y0 + xm]; p[4] = src[y0 + x]; p[5] = src[y0 + xp];
      p[6] = src[yp + xm]; p[7] = src[yp + x]; p[8] = src[yp + xp];
      // Insertion sort of 9 values: cheaper than a generic sort and branch-predictable for smooth images.
      for (let i = 1; i < 9; i += 1) {
        const v = p[i];
        let j = i - 1;
        while (j >= 0 && p[j] > v) { p[j + 1] = p[j]; j -= 1; }
        p[j + 1] = v;
      }
      out[y0 + x] = p[4];
    }
  }
  return out;
}

/**
 * Removes raster-scan streaks: each row (or column) is shifted so its median follows the smooth trend of
 * its neighbours, which keeps real horizontal structures while dropping line-to-line offsets.
 */
export function destripe(src: Float32Array, width: number, height: number, direction: "rows" | "columns", window = 15): Float32Array {
  const lines = direction === "rows" ? height : width;
  const length = direction === "rows" ? width : height;
  const medians = new Float32Array(lines);
  for (let line = 0; line < lines; line += 1) {
    const bins = direction === "rows" ? histogram(src, line * width, (line + 1) * width) : histogram(src, line, src.length, width);
    medians[line] = binQuantile(bins, length, 0.5);
  }
  const out = new Float32Array(src.length);
  for (let line = 0; line < lines; line += 1) {
    let sum = 0;
    let count = 0;
    for (let k = Math.max(0, line - window); k <= Math.min(lines - 1, line + window); k += 1) { sum += medians[k]; count += 1; }
    const offset = medians[line] - sum / count;
    if (direction === "rows") for (let x = 0; x < width; x += 1) out[line * width + x] = src[line * width + x] - offset;
    else for (let y = 0; y < height; y += 1) out[y * width + line] = src[y * width + line] - offset;
  }
  return out;
}

/**
 * Box blur (radius r) of one line held in `line` (length n) into `out`. The line is extended with
 * point-symmetric (odd) reflection, f(-k) = 2 f(0) - f(k), so a linear gradient continues exactly and a
 * background estimate has no bias near the image border.
 */
function blurLine(line: Float32Array, n: number, r: number, padded: Float32Array, out: Float32Array): void {
  const first = line[0];
  const last = line[n - 1];
  for (let k = 0; k < r + 1; k += 1) {
    padded[r - k] = 2 * first - line[Math.min(n - 1, k)];
    padded[r + n - 1 + k] = 2 * last - line[Math.max(0, n - 1 - k)];
  }
  padded.set(line.subarray(0, n), r);
  const norm = 1 / (2 * r + 1);
  let acc = 0;
  for (let k = 0; k <= 2 * r; k += 1) acc += padded[k];
  for (let i = 0; i < n; i += 1) {
    out[i] = acc * norm;
    acc += padded[i + 2 * r + 1] - padded[i];
  }
}

/** One box blur pass along rows then columns; O(pixels) for any radius. */
function boxBlur(src: Float32Array, width: number, height: number, r: number): Float32Array {
  const out = new Float32Array(src.length);
  const padded = new Float32Array(Math.max(width, height) + 2 * r + 2);
  const line = new Float32Array(Math.max(width, height));
  const blurred = new Float32Array(Math.max(width, height));
  for (let y = 0; y < height; y += 1) {
    blurLine(src.subarray(y * width, (y + 1) * width), width, r, padded, blurred);
    out.set(blurred.subarray(0, width), y * width);
  }
  for (let x = 0; x < width; x += 1) {
    for (let y = 0; y < height; y += 1) line[y] = out[y * width + x];
    blurLine(line, height, r, padded, blurred);
    for (let y = 0; y < height; y += 1) out[y * width + x] = blurred[y];
  }
  return out;
}

/** Gaussian blur of standard deviation sigma approximated by three box blurs. */
export function gaussianApprox(src: Float32Array, width: number, height: number, sigma: number): Float32Array {
  const r = Math.max(1, Math.round((Math.sqrt(12 * sigma * sigma / 3 + 1) - 1) / 2));
  return boxBlur(boxBlur(boxBlur(src, width, height, r), width, height, r), width, height, r);
}

/**
 * Subtracts the large-scale background (charging, thickness or illumination gradients), keeping mean
 * brightness. The background is smooth, so it is estimated on a block-averaged copy (factor ~sigma/8)
 * and bilinearly upsampled: sigma 100 on a 4K image blurs ~1/150 of the pixels.
 */
export function flattenBackground(src: Float32Array, width: number, height: number, sigma: number): Float32Array {
  const f = Math.max(1, Math.floor(sigma / 8));
  const sw = Math.ceil(width / f);
  const sh = Math.ceil(height / f);
  const small = new Float32Array(sw * sh);
  for (let sy = 0; sy < sh; sy += 1) {
    for (let sx = 0; sx < sw; sx += 1) {
      let sum = 0;
      let count = 0;
      for (let y = sy * f; y < Math.min(height, (sy + 1) * f); y += 1) {
        for (let x = sx * f; x < Math.min(width, (sx + 1) * f); x += 1) { sum += src[y * width + x]; count += 1; }
      }
      small[sy * sw + sx] = sum / count;
    }
  }
  const background = gaussianApprox(small, sw, sh, sigma / f);
  let mean = 0;
  for (let i = 0; i < background.length; i += 1) mean += background[i];
  mean /= background.length;
  const out = new Float32Array(src.length);
  for (let y = 0; y < height; y += 1) {
    const fy = Math.max(0, Math.min(sh - 1, (y + 0.5) / f - 0.5));
    const y0 = Math.floor(fy);
    const y1 = Math.min(sh - 1, y0 + 1);
    const wy = fy - y0;
    for (let x = 0; x < width; x += 1) {
      const fx = Math.max(0, Math.min(sw - 1, (x + 0.5) / f - 0.5));
      const x0 = Math.floor(fx);
      const x1 = Math.min(sw - 1, x0 + 1);
      const wx = fx - x0;
      const top = background[y0 * sw + x0] * (1 - wx) + background[y0 * sw + x1] * wx;
      const bottom = background[y1 * sw + x0] * (1 - wx) + background[y1 * sw + x1] * wx;
      out[y * width + x] = src[y * width + x] - (top * (1 - wy) + bottom * wy) + mean;
    }
  }
  return out;
}

/**
 * Perona-Malik anisotropic diffusion: smooths noise inside regions while gradients larger than kappa
 * (grey levels) barely diffuse, so edges keep their position.
 */
export function anisotropicDiffusion(src: Float32Array, width: number, height: number, iterations: number, kappa: number): Float32Array {
  let current = Float32Array.from(src);
  let next = new Float32Array(src.length);
  const lambda = 0.2; // stable for 4 neighbours (< 0.25)
  // Flux d * g(d) with g(d) = exp(-(d/kappa)^2), tabulated in quarter grey levels (exp per pixel is the bottleneck).
  const steps = 4;
  const size = 512 * steps;
  const flux = new Float32Array(size);
  for (let i = 0; i < size; i += 1) { const d = i / steps; flux[i] = d * Math.exp(-(d * d) / (kappa * kappa)); }
  const f = (d: number): number => {
    const i = (d < 0 ? -d : d) * steps | 0;
    const v = i < size ? flux[i] : 0;
    return d < 0 ? -v : v;
  };
  // ponytail: ~0.24 s per iteration on 16 MP on the main thread (memory-bound); move the canvas Processed
  // view to a worker if large images with many iterations become common.
  for (let it = 0; it < iterations; it += 1) {
    for (let y = 0; y < height; y += 1) {
      const row = y * width;
      const up = (y > 0 ? y - 1 : 0) * width;
      const down = (y < height - 1 ? y + 1 : y) * width;
      for (let x = 0; x < width; x += 1) {
        const c = current[row + x];
        const west = x > 0 ? current[row + x - 1] : c;
        const east = x < width - 1 ? current[row + x + 1] : c;
        next[row + x] = c + lambda * (f(current[up + x] - c) + f(current[down + x] - c) + f(west - c) + f(east - c));
      }
    }
    [current, next] = [next, current];
  }
  return current;
}

/**
 * Contrast-limited adaptive histogram equalisation on a tiles x tiles grid with bilinear blending between
 * tile mappings. clipLimit is a multiple of the mean bin count (OpenCV's convention, e.g. 2-4).
 */
export function clahe(src: Float32Array, width: number, height: number, clipLimit: number, tiles: number): Float32Array {
  const tx = Math.max(1, Math.min(tiles, width));
  const ty = Math.max(1, Math.min(tiles, height));
  const maps: Float32Array[] = [];
  for (let j = 0; j < ty; j += 1) {
    for (let i = 0; i < tx; i += 1) {
      const x0 = Math.floor(i * width / tx);
      const x1 = Math.floor((i + 1) * width / tx);
      const y0 = Math.floor(j * height / ty);
      const y1 = Math.floor((j + 1) * height / ty);
      const bins = new Float64Array(256);
      for (let y = y0; y < y1; y += 1) for (let x = x0; x < x1; x += 1) bins[Math.round(clampByte(src[y * width + x]))] += 1;
      const total = Math.max(1, (x1 - x0) * (y1 - y0));
      const limit = Math.max(1, clipLimit * total / 256);
      let excess = 0;
      for (let v = 0; v < 256; v += 1) if (bins[v] > limit) { excess += bins[v] - limit; bins[v] = limit; }
      const share = excess / 256;
      const map = new Float32Array(256);
      let cdf = 0;
      for (let v = 0; v < 256; v += 1) { cdf += bins[v] + share; map[v] = (cdf / total) * 255; }
      maps.push(map);
    }
  }
  const out = new Float32Array(src.length);
  for (let y = 0; y < height; y += 1) {
    // Tile-centre coordinates: blend the four surrounding tile mappings.
    const fy = (y + 0.5) * ty / height - 0.5;
    const j0 = Math.max(0, Math.min(ty - 1, Math.floor(fy)));
    const j1 = Math.min(ty - 1, j0 + 1);
    const wy = Math.max(0, Math.min(1, fy - j0));
    for (let x = 0; x < width; x += 1) {
      const fx = (x + 0.5) * tx / width - 0.5;
      const i0 = Math.max(0, Math.min(tx - 1, Math.floor(fx)));
      const i1 = Math.min(tx - 1, i0 + 1);
      const wx = Math.max(0, Math.min(1, fx - i0));
      const v = Math.round(clampByte(src[y * width + x]));
      const top = maps[j0 * tx + i0][v] * (1 - wx) + maps[j0 * tx + i1][v] * wx;
      const bottom = maps[j1 * tx + i0][v] * (1 - wx) + maps[j1 * tx + i1][v] * wx;
      out[y * width + x] = top * (1 - wy) + bottom * wy;
    }
  }
  return out;
}

/** Stretches the [clip%, 100 - clip%] percentile range to 0-255 (sampled histogram on large images). */
export function autoLevels(src: Float32Array, clipPercent: number): Float32Array {
  const step = Math.max(1, Math.floor(src.length / 1_000_000));
  const bins = histogram(src, 0, src.length, step);
  const total = Math.ceil(src.length / step);
  const lo = binQuantile(bins, total, clipPercent / 100);
  const hi = binQuantile(bins, total, 1 - clipPercent / 100);
  if (hi <= lo) return src;
  const scale = 255 / (hi - lo);
  const out = new Float32Array(src.length);
  for (let i = 0; i < src.length; i += 1) out[i] = clampByte((src[i] - lo) * scale);
  return out;
}
