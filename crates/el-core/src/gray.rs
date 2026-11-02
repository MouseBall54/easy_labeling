// Port of src/features/segmentation/gray-filters.ts. JS stores into Float32Array and computes in doubles;
// this code does the same (f32 buffers, f64 arithmetic) so outputs match, and parallelises over rows.

use rayon::prelude::*;

/// JavaScript Math.round: halves round towards +infinity.
pub fn js_round(value: f64) -> f64 {
    let floor = value.floor();
    if value - floor >= 0.5 {
        floor + 1.0
    } else {
        floor
    }
}

fn clamp_byte(value: f64) -> f64 {
    // NaN stays NaN, like the JS comparisons this mirrors.
    value.clamp(0.0, 255.0)
}

fn bin(value: f32) -> usize {
    js_round(clamp_byte(value as f64)) as usize
}

fn bin_quantile(bins: &[u32; 256], total: usize, q: f64) -> f64 {
    let target = q * (total as f64 - 1.0);
    let mut seen = 0.0;
    for (value, &count) in bins.iter().enumerate() {
        seen += count as f64;
        if seen > target {
            return value as f64;
        }
    }
    255.0
}

pub fn median3x3(src: &[f32], width: usize, height: usize) -> Vec<f32> {
    let mut out = vec![0f32; src.len()];
    out.par_chunks_mut(width).enumerate().for_each(|(y, row)| {
        let ym = if y > 0 { y - 1 } else { 0 } * width;
        let y0 = y * width;
        let yp = if y + 1 < height { y + 1 } else { y } * width;
        for x in 0..width {
            let xm = if x > 0 { x - 1 } else { 0 };
            let xp = if x + 1 < width { x + 1 } else { x };
            let mut p = [src[ym + xm], src[ym + x], src[ym + xp], src[y0 + xm], src[y0 + x], src[y0 + xp], src[yp + xm], src[yp + x], src[yp + xp]];
            p.sort_unstable_by(|a, b| a.total_cmp(b));
            row[x] = p[4];
        }
    });
    out
}

pub fn destripe(src: &[f32], width: usize, height: usize, rows: bool, window: usize) -> Vec<f32> {
    let lines = if rows { height } else { width };
    let length = if rows { width } else { height };
    let medians: Vec<f64> = (0..lines)
        .into_par_iter()
        .map(|line| {
            let mut bins = [0u32; 256];
            if rows {
                for &v in &src[line * width..(line + 1) * width] {
                    bins[bin(v)] += 1;
                }
            } else {
                for y in 0..height {
                    bins[bin(src[y * width + line])] += 1;
                }
            }
            bin_quantile(&bins, length, 0.5)
        })
        .collect();
    let offsets: Vec<f64> = (0..lines)
        .map(|line| {
            let from = line.saturating_sub(window);
            let to = (line + window).min(lines - 1);
            let sum: f64 = medians[from..=to].iter().sum();
            medians[line] - sum / (to - from + 1) as f64
        })
        .collect();
    let mut out = vec![0f32; src.len()];
    out.par_chunks_mut(width).enumerate().for_each(|(y, row)| {
        for x in 0..width {
            let offset = if rows { offsets[y] } else { offsets[x] };
            row[x] = (src[y * width + x] as f64 - offset) as f32;
        }
    });
    out
}

/// Box blur of one line with point-symmetric reflection; see blurLine in gray-filters.ts.
fn blur_line(line: &[f32], r: usize, padded: &mut [f32], out: &mut [f32]) {
    let n = line.len();
    let first = line[0] as f64;
    let last = line[n - 1] as f64;
    for k in 0..=r {
        padded[r - k] = (2.0 * first - line[k.min(n - 1)] as f64) as f32;
        padded[r + n - 1 + k] = (2.0 * last - line[(n - 1).saturating_sub(k)] as f64) as f32;
    }
    padded[r..r + n].copy_from_slice(line);
    let norm = 1.0 / (2 * r + 1) as f64;
    let mut acc = 0.0f64;
    for &v in &padded[..=2 * r] {
        acc += v as f64;
    }
    for i in 0..n {
        out[i] = (acc * norm) as f32;
        acc += padded[i + 2 * r + 1] as f64 - padded[i] as f64;
    }
}

fn blur_rows(src: &[f32], width: usize, r: usize) -> Vec<f32> {
    let mut out = vec![0f32; src.len()];
    out.par_chunks_mut(width).zip(src.par_chunks(width)).for_each_init(|| vec![0f32; width + 2 * r + 2], |padded, (row, line)| blur_line(line, r, padded, row));
    out
}

fn transpose(src: &[f32], width: usize, height: usize) -> Vec<f32> {
    let mut out = vec![0f32; src.len()];
    out.par_chunks_mut(height).enumerate().for_each(|(x, column)| {
        for (y, value) in column.iter_mut().enumerate() {
            *value = src[y * width + x];
        }
    });
    out
}

fn box_blur(src: &[f32], width: usize, height: usize, r: usize) -> Vec<f32> {
    let rows = blur_rows(src, width, r);
    let columns = blur_rows(&transpose(&rows, width, height), height, r);
    transpose(&columns, height, width)
}

pub fn gaussian_approx(src: &[f32], width: usize, height: usize, sigma: f64) -> Vec<f32> {
    let r = js_round(((12.0 * sigma * sigma / 3.0 + 1.0).sqrt() - 1.0) / 2.0).max(1.0) as usize;
    box_blur(&box_blur(&box_blur(src, width, height, r), width, height, r), width, height, r)
}

pub fn flatten_background(src: &[f32], width: usize, height: usize, sigma: f64) -> Vec<f32> {
    let f = ((sigma / 8.0).floor() as usize).max(1);
    let sw = width.div_ceil(f);
    let sh = height.div_ceil(f);
    let mut small = vec![0f32; sw * sh];
    small.par_chunks_mut(sw).enumerate().for_each(|(sy, row)| {
        for (sx, value) in row.iter_mut().enumerate() {
            let mut sum = 0.0f64;
            let mut count = 0.0f64;
            for y in sy * f..((sy + 1) * f).min(height) {
                for x in sx * f..((sx + 1) * f).min(width) {
                    sum += src[y * width + x] as f64;
                    count += 1.0;
                }
            }
            *value = (sum / count) as f32;
        }
    });
    let background = gaussian_approx(&small, sw, sh, sigma / f as f64);
    let mean = background.iter().map(|&v| v as f64).sum::<f64>() / background.len() as f64;
    let ff = f as f64;
    let mut out = vec![0f32; src.len()];
    out.par_chunks_mut(width).enumerate().for_each(|(y, row)| {
        let fy = ((y as f64 + 0.5) / ff - 0.5).min(sh as f64 - 1.0).max(0.0);
        let y0 = fy.floor() as usize;
        let y1 = (y0 + 1).min(sh - 1);
        let wy = fy - y0 as f64;
        for (x, value) in row.iter_mut().enumerate() {
            let fx = ((x as f64 + 0.5) / ff - 0.5).min(sw as f64 - 1.0).max(0.0);
            let x0 = fx.floor() as usize;
            let x1 = (x0 + 1).min(sw - 1);
            let wx = fx - x0 as f64;
            let top = background[y0 * sw + x0] as f64 * (1.0 - wx) + background[y0 * sw + x1] as f64 * wx;
            let bottom = background[y1 * sw + x0] as f64 * (1.0 - wx) + background[y1 * sw + x1] as f64 * wx;
            *value = (src[y * width + x] as f64 - (top * (1.0 - wy) + bottom * wy) + mean) as f32;
        }
    });
    out
}

pub fn anisotropic_diffusion(src: &[f32], width: usize, height: usize, iterations: usize, kappa: f64) -> Vec<f32> {
    const STEPS: f64 = 4.0;
    const SIZE: usize = 512 * 4;
    let lambda = 0.2f64;
    let flux: Vec<f32> = (0..SIZE)
        .map(|i| {
            let d = i as f64 / STEPS;
            (d * (-(d * d) / (kappa * kappa)).exp()) as f32
        })
        .collect();
    let f = |d: f64| -> f64 {
        // `| 0` in JS truncates towards zero.
        let i = (d.abs() * STEPS) as usize;
        let v = if i < SIZE { flux[i] as f64 } else { 0.0 };
        if d < 0.0 {
            -v
        } else {
            v
        }
    };
    let mut current = src.to_vec();
    let mut next = vec![0f32; src.len()];
    for _ in 0..iterations {
        next.par_chunks_mut(width).enumerate().for_each(|(y, row)| {
            let base = y * width;
            let up = if y > 0 { y - 1 } else { 0 } * width;
            let down = if y + 1 < height { y + 1 } else { y } * width;
            for x in 0..width {
                let c = current[base + x] as f64;
                let west = if x > 0 { current[base + x - 1] as f64 } else { c };
                let east = if x + 1 < width { current[base + x + 1] as f64 } else { c };
                row[x] = (c + lambda * (f(current[up + x] as f64 - c) + f(current[down + x] as f64 - c) + f(west - c) + f(east - c))) as f32;
            }
        });
        std::mem::swap(&mut current, &mut next);
    }
    current
}

pub fn clahe(src: &[f32], width: usize, height: usize, clip_limit: f64, tiles: usize) -> Vec<f32> {
    let tx = tiles.min(width).max(1);
    let ty = tiles.min(height).max(1);
    let maps: Vec<[f32; 256]> = (0..tx * ty)
        .into_par_iter()
        .map(|tile| {
            let (i, j) = (tile % tx, tile / tx);
            let x0 = i * width / tx;
            let x1 = (i + 1) * width / tx;
            let y0 = j * height / ty;
            let y1 = (j + 1) * height / ty;
            let mut bins = [0f64; 256];
            for y in y0..y1 {
                for x in x0..x1 {
                    bins[bin(src[y * width + x])] += 1.0;
                }
            }
            let total = ((x1 - x0) * (y1 - y0)).max(1) as f64;
            let limit = (clip_limit * total / 256.0).max(1.0);
            let mut excess = 0.0;
            for value in bins.iter_mut() {
                if *value > limit {
                    excess += *value - limit;
                    *value = limit;
                }
            }
            let share = excess / 256.0;
            let mut map = [0f32; 256];
            let mut cdf = 0.0;
            for (v, &count) in bins.iter().enumerate() {
                cdf += count + share;
                map[v] = (cdf / total * 255.0) as f32;
            }
            map
        })
        .collect();
    let mut out = vec![0f32; src.len()];
    let (txf, tyf) = (tx as f64, ty as f64);
    out.par_chunks_mut(width).enumerate().for_each(|(y, row)| {
        let fy = (y as f64 + 0.5) * tyf / height as f64 - 0.5;
        let j0 = (fy.floor().max(0.0) as usize).min(ty - 1);
        let j1 = (j0 + 1).min(ty - 1);
        let wy = (fy - j0 as f64).clamp(0.0, 1.0);
        for (x, value) in row.iter_mut().enumerate() {
            let fx = (x as f64 + 0.5) * txf / width as f64 - 0.5;
            let i0 = (fx.floor().max(0.0) as usize).min(tx - 1);
            let i1 = (i0 + 1).min(tx - 1);
            let wx = (fx - i0 as f64).clamp(0.0, 1.0);
            let v = bin(src[y * width + x]);
            let top = maps[j0 * tx + i0][v] as f64 * (1.0 - wx) + maps[j0 * tx + i1][v] as f64 * wx;
            let bottom = maps[j1 * tx + i0][v] as f64 * (1.0 - wx) + maps[j1 * tx + i1][v] as f64 * wx;
            *value = (top * (1.0 - wy) + bottom * wy) as f32;
        }
    });
    out
}

pub fn auto_levels(src: Vec<f32>, clip_percent: f64) -> Vec<f32> {
    let step = (src.len() / 1_000_000).max(1);
    let mut bins = [0u32; 256];
    for &v in src.iter().step_by(step) {
        bins[bin(v)] += 1;
    }
    let total = src.len().div_ceil(step);
    let lo = bin_quantile(&bins, total, clip_percent / 100.0);
    let hi = bin_quantile(&bins, total, 1.0 - clip_percent / 100.0);
    if hi <= lo {
        return src;
    }
    let scale = 255.0 / (hi - lo);
    src.par_iter().map(|&v| clamp_byte((v as f64 - lo) * scale) as f32).collect()
}
