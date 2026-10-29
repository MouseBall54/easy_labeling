// Port of preprocessGray in src/features/segmentation/preprocessing.ts. The config arrives already
// normalised by normalizeSegmentationPreprocessingConfig on the JS side.

use crate::gray::{anisotropic_diffusion, auto_levels, clahe, destripe, flatten_background, js_round, median3x3};
use rayon::prelude::*;
use serde::Deserialize;

#[derive(Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct PreprocessConfig {
    pub mode: String,
    pub blur_strength: usize,
    pub edge_weight: f64,
    pub contrast: f64,
    pub gamma: f64,
    pub median: bool,
    pub destripe: String,
    pub flatten_sigma: f64,
    pub diffusion_iterations: usize,
    pub diffusion_kappa: f64,
    pub clahe_clip: f64,
    pub clahe_tiles: usize,
    pub levels_clip: f64,
}

fn tone_curve(config: &PreprocessConfig) -> Option<[f32; 256]> {
    if config.contrast == 1.0 && config.gamma == 1.0 {
        return None;
    }
    let mut curve = [0f32; 256];
    for (v, value) in curve.iter_mut().enumerate() {
        let contrasted = ((v as f64 - 127.5) * config.contrast + 127.5).clamp(0.0, 255.0);
        *value = (255.0 * (contrasted / 255.0).powf(1.0 / config.gamma)) as f32;
    }
    Some(curve)
}

fn apply_tone(values: &[f32], curve: &[f32; 256]) -> Vec<f32> {
    values
        .par_iter()
        .map(|&value| {
            let v = (value as f64).clamp(0.0, 255.0);
            let lo = v.floor() as usize;
            let hi = (lo + 1).min(255);
            (curve[lo] as f64 + (curve[hi] as f64 - curve[lo] as f64) * (v - lo as f64)) as f32
        })
        .collect()
}

fn blur_gaussian(gray: Vec<f32>, width: usize, height: usize, strength: usize) -> Vec<f32> {
    let mut result = gray;
    for _ in 0..strength {
        let mut horizontal = vec![0f32; result.len()];
        horizontal.par_chunks_mut(width).enumerate().for_each(|(y, row)| {
            let line = &result[y * width..(y + 1) * width];
            for x in 0..width {
                let left = line[x.saturating_sub(1)] as f64;
                let right = line[(x + 1).min(width - 1)] as f64;
                row[x] = ((left + 2.0 * line[x] as f64 + right) / 4.0) as f32;
            }
        });
        let mut vertical = vec![0f32; result.len()];
        vertical.par_chunks_mut(width).enumerate().for_each(|(y, row)| {
            let top = &horizontal[y.saturating_sub(1) * width..];
            let center = &horizontal[y * width..];
            let bottom = &horizontal[(y + 1).min(height - 1) * width..];
            for x in 0..width {
                row[x] = ((top[x] as f64 + 2.0 * center[x] as f64 + bottom[x] as f64) / 4.0) as f32;
            }
        });
        result = vertical;
    }
    result
}

fn normalized_sobel(gray: &[f32], width: usize, height: usize) -> Vec<f32> {
    let mut gradient = vec![0f32; gray.len()];
    // JS tracks the maximum of the unrounded (f64) magnitudes.
    let maximum = gradient
        .par_chunks_mut(width)
        .enumerate()
        .map(|(y, row)| {
            let up = y.saturating_sub(1) * width;
            let mid = y * width;
            let down = (y + 1).min(height - 1) * width;
            let g = |i: usize| gray[i] as f64;
            let mut maximum = 0f64;
            for (x, out) in row.iter_mut().enumerate() {
                let l = x.saturating_sub(1);
                let r = (x + 1).min(width - 1);
                let gx = -g(up + l) + g(up + r) - 2.0 * g(mid + l) + 2.0 * g(mid + r) - g(down + l) + g(down + r);
                let gy = -g(up + l) - 2.0 * g(up + x) - g(up + r) + g(down + l) + 2.0 * g(down + x) + g(down + r);
                let value = (gx * gx + gy * gy).sqrt();
                *out = value as f32;
                maximum = maximum.max(value);
            }
            maximum
        })
        .reduce(|| 0.0, f64::max);
    if maximum > 0.0 {
        let scale = 255.0 / maximum;
        gradient.par_iter_mut().for_each(|v| *v = (*v as f64 * scale) as f32);
    }
    gradient
}

/// The "Processed" view on a luma image (0-255).
pub fn preprocess_gray(source: Vec<f32>, width: usize, height: usize, config: &PreprocessConfig) -> Vec<f32> {
    let mut gray = source;
    if config.median {
        gray = median3x3(&gray, width, height);
    }
    if config.destripe == "rows" || config.destripe == "columns" {
        gray = destripe(&gray, width, height, config.destripe == "rows", 15);
    }
    if config.flatten_sigma > 0.0 {
        gray = flatten_background(&gray, width, height, config.flatten_sigma);
    }
    if config.diffusion_iterations > 0 {
        gray = anisotropic_diffusion(&gray, width, height, config.diffusion_iterations, config.diffusion_kappa);
    }
    if config.clahe_clip > 0.0 {
        gray = clahe(&gray, width, height, config.clahe_clip, config.clahe_tiles);
    }
    if config.levels_clip > 0.0 {
        gray = auto_levels(gray, config.levels_clip);
    }
    if let Some(curve) = tone_curve(config) {
        gray = apply_tone(&gray, &curve);
    }
    if config.mode == "original" {
        return gray;
    }
    let gradient = normalized_sobel(&blur_gaussian(gray.clone(), width, height, config.blur_strength), width, height);
    if config.mode == "edge" {
        return gradient;
    }
    let w = config.edge_weight;
    gray.par_iter().zip(gradient.par_iter()).map(|(&g, &e)| (g as f64 * (1.0 - w) + e as f64 * w) as f32).collect()
}

/// Luma of RGBA pixels as `toGrayscale` in preprocessing.ts computes it: the same f64 sum, in the same
/// order, stored as f32 (a Float32Array element).
pub fn rgba_luma(rgba: &[u8]) -> Vec<f32> {
    rgba.as_chunks::<4>().0.par_iter().map(|p| (p[0] as f64 * 0.2126 + p[1] as f64 * 0.7152 + p[2] as f64 * 0.0722) as f32).collect()
}

/// Rounds and clamps a processed image to bytes, as the refine worker does.
pub fn to_bytes(values: &[f32]) -> Vec<u8> {
    values.par_iter().map(|&v| js_round(v as f64).clamp(0.0, 255.0) as u8).collect()
}
