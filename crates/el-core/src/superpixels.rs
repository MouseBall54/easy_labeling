//! SLICO superpixels: a port of `createSlicoSuperpixels` (src/features/segmentation/superpixels.ts) giving the
//! same labels, boundaries and region statistics bit for bit (`golden_superpixels`). The assignment step, the
//! expensive part, runs one image row per task: within a row, centres are visited in id order as in the TS
//! loop, so ties go to the same centre. Every floating-point sum keeps the TS pixel order.

use crate::js;
use rayon::prelude::*;
use serde::Deserialize;

#[derive(Clone, Copy, PartialEq, Eq, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Strength {
    Off,
    Low,
    Medium,
    High,
}

#[derive(Clone, Copy, PartialEq, Eq, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum EdgeSensitivity {
    Low,
    Medium,
    High,
}

/// Normalised settings (normalizeSuperpixelSettings), without the region size.
#[derive(Clone, Copy, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Settings {
    pub blur: Strength,
    pub contrast: Strength,
    pub edge_sensitivity: EdgeSensitivity,
}

pub struct Region {
    pub pixel_count: u32,
    pub mean_intensity: f64,
    pub mean_edge_strength: f64,
    /// Ascending ids of the regions this one touches.
    pub neighbors: Vec<u32>,
}

pub struct Superpixels {
    pub region_size: usize,
    /// Region id per pixel (row-major); -1 where no centre reached.
    pub labels: Vec<i32>,
    /// 1 on both sides of a region border.
    pub boundaries: Vec<u8>,
    pub regions: Vec<Region>,
}

struct Center {
    x: f64,
    y: f64,
    intensity: f64,
    max_color_distance: f64,
}

/// `Math.max(min, Math.min(max, value))` (no NaN reaches it here).
fn clamp(value: f64, min: f64, max: f64) -> f64 {
    min.max(max.min(value))
}

/// createSmoothedIntensity + createPreprocessedIntensity, from the luma (`rgba_luma` or `gray_luma`).
fn preprocessed_intensity(luma: &[f32], width: usize, height: usize, settings: &Settings) -> Vec<f32> {
    let passes = match settings.blur {
        Strength::High => 3,
        Strength::Medium => 2,
        Strength::Low => 1,
        Strength::Off => 0,
    };
    let mut values = luma.to_vec();
    for _ in 0..passes {
        let source = values.clone();
        values.par_chunks_mut(width).enumerate().for_each(|(y, row)| {
            for (x, value) in row.iter_mut().enumerate() {
                if y > 0 && y + 1 < height && x > 0 && x + 1 < width {
                    // Inside the image all nine taps exist: the same sums in the same order, without the checks.
                    let at = |sample_y: usize, sample_x: usize| source[sample_y * width + sample_x] as f64;
                    let (above, below) = (y - 1, y + 1);
                    let total = at(above, x - 1)
                        + at(above, x) * 2.0
                        + at(above, x + 1)
                        + at(y, x - 1) * 2.0
                        + at(y, x) * 4.0
                        + at(y, x + 1) * 2.0
                        + at(below, x - 1)
                        + at(below, x) * 2.0
                        + at(below, x + 1);
                    *value = (total / 16.0) as f32;
                    continue;
                }
                let (mut total, mut weight_total) = (0.0f64, 0.0f64);
                for offset_y in -1isize..=1 {
                    for offset_x in -1isize..=1 {
                        let (sample_x, sample_y) = (x as isize + offset_x, y as isize + offset_y);
                        if sample_x < 0 || sample_y < 0 || sample_x >= width as isize || sample_y >= height as isize {
                            continue;
                        }
                        let weight = if offset_x == 0 && offset_y == 0 {
                            4.0
                        } else if offset_x == 0 || offset_y == 0 {
                            2.0
                        } else {
                            1.0
                        };
                        total += source[sample_y as usize * width + sample_x as usize] as f64 * weight;
                        weight_total += weight;
                    }
                }
                *value = (total / weight_total) as f32;
            }
        });
    }
    let contrast = match settings.contrast {
        Strength::High => 1.45,
        Strength::Medium => 1.25,
        Strength::Low => 1.1,
        Strength::Off => 1.0,
    };
    if contrast != 1.0 {
        values.par_iter_mut().for_each(|value| *value = clamp(128.0 + (*value as f64 - 128.0) * contrast, 0.0, 255.0) as f32);
    }
    values
}

/// `createSlicoSuperpixels(input, regionSize, iterations, settings)` on the luma of `input`. `region_size` is
/// the normalised size (normalizeSuperpixelSettings); it is clamped to the image as the TS code does.
pub fn slico(luma: &[f32], width: usize, height: usize, region_size: usize, iterations: usize, settings: &Settings) -> Superpixels {
    assert_eq!(luma.len(), width * height, "superpixel image dimensions are invalid");
    let region_size = region_size.clamp(2, width.max(height).max(2));
    let size = region_size as f64;
    let smoothed = preprocessed_intensity(luma, width, height, settings);
    let mut centers = Vec::new();
    for y in (region_size / 2..height).step_by(region_size) {
        for x in (region_size / 2..width).step_by(region_size) {
            centers.push(Center { x: x as f64, y: y as f64, intensity: smoothed[y * width + x] as f64, max_color_distance: 1.0 });
        }
    }
    if centers.is_empty() {
        centers.push(Center { x: 0.0, y: 0.0, intensity: smoothed[0] as f64, max_color_distance: 1.0 });
    }

    let pixels = width * height;
    let mut labels = vec![-1i32; pixels];
    let mut distances = vec![f64::INFINITY; pixels];
    let (last_x, last_y) = ((width - 1) as f64, (height - 1) as f64);
    // Per-centre sums run over a few row bands (up to one per thread): each band allocates per-centre arrays, so
    // small regions (many centres per pixel) get fewer bands, down to one, to keep that below the label buffer.
    let bands = rayon::current_num_threads().min(pixels / (centers.len() * 16)).max(1);
    let band_len = height.div_ceil(bands) * width;
    for _ in 0..iterations.max(1) {
        // Each centre's window, and per row the centres whose window covers it, in id order.
        let windows: Vec<(usize, usize, usize, usize)> = centers
            .iter()
            .map(|center| {
                (
                    clamp((center.x - size).floor(), 0.0, last_x) as usize,
                    clamp((center.x + size).ceil(), 0.0, last_x) as usize,
                    clamp((center.y - size).floor(), 0.0, last_y) as usize,
                    clamp((center.y + size).ceil(), 0.0, last_y) as usize,
                )
            })
            .collect();
        let mut rows: Vec<Vec<u32>> = vec![Vec::new(); height];
        for (id, &(_, _, min_y, max_y)) in windows.iter().enumerate() {
            for row in &mut rows[min_y..=max_y] {
                row.push(id as u32);
            }
        }
        labels.par_chunks_mut(width).zip(distances.par_chunks_mut(width)).zip(rows.par_iter()).enumerate().for_each(|(y, ((label_row, distance_row), ids))| {
            label_row.fill(-1);
            distance_row.fill(f64::INFINITY);
            let intensity_row = &smoothed[y * width..(y + 1) * width];
            for &id in ids {
                let center = &centers[id as usize];
                let (min_x, max_x, _, _) = windows[id as usize];
                let color_scale = center.max_color_distance.max(1.0);
                let dy = y as f64 - center.y;
                for x in min_x..=max_x {
                    let scaled = (intensity_row[x] as f64 - center.intensity) / color_scale;
                    let color_term = scaled * scaled;
                    // Adding the (non-negative) spatial term cannot bring the distance below the colour term.
                    if color_term >= distance_row[x] {
                        continue;
                    }
                    let spatial_distance = js::hypot(x as f64 - center.x, dy) / size;
                    let distance = color_term + spatial_distance * spatial_distance;
                    if distance < distance_row[x] {
                        distance_row[x] = distance;
                        label_row[x] = id as i32;
                    }
                }
            }
        });

        // Counts and coordinate sums are integers, exact in any order (the TS f64 sums never round them);
        // the intensity sum is not, so it keeps the TS pixel order. A maximum is order-free too.
        let count = centers.len();
        let mut counts = vec![0u32; count];
        let (mut sum_x, mut sum_y) = (vec![0u64; count], vec![0u64; count]);
        for (band_counts, band_x, band_y) in labels
            .par_chunks(band_len)
            .enumerate()
            .map(|(band, chunk)| {
                let (mut counts, mut sum_x, mut sum_y) = (vec![0u32; count], vec![0u64; count], vec![0u64; count]);
                for (offset, &label) in chunk.iter().enumerate() {
                    if label >= 0 {
                        let pixel = band * band_len + offset;
                        counts[label as usize] += 1;
                        sum_x[label as usize] += (pixel % width) as u64;
                        sum_y[label as usize] += (pixel / width) as u64;
                    }
                }
                (counts, sum_x, sum_y)
            })
            .collect::<Vec<_>>()
        {
            for id in 0..count {
                counts[id] += band_counts[id];
                sum_x[id] += band_x[id];
                sum_y[id] += band_y[id];
            }
        }
        let mut sum_intensity = vec![0.0f64; count];
        for (pixel, &label) in labels.iter().enumerate() {
            if label >= 0 {
                sum_intensity[label as usize] += smoothed[pixel] as f64;
            }
        }
        let means: Vec<f64> = (0..count).map(|id| if counts[id] == 0 { 0.0 } else { sum_intensity[id] / counts[id] as f64 }).collect();
        let mut max_color_distance = vec![0.0f64; count];
        for band_maxima in labels
            .par_chunks(band_len)
            .zip(smoothed.par_chunks(band_len))
            .map(|(label_chunk, intensity_chunk)| {
                let mut maxima = vec![0.0f64; count];
                for (&label, &value) in label_chunk.iter().zip(intensity_chunk) {
                    if label >= 0 {
                        let id = label as usize;
                        maxima[id] = maxima[id].max((value as f64 - means[id]).abs());
                    }
                }
                maxima
            })
            .collect::<Vec<_>>()
        {
            max_color_distance.iter_mut().zip(band_maxima).for_each(|(value, band)| *value = value.max(band));
        }
        for (id, center) in centers.iter_mut().enumerate() {
            if counts[id] == 0 {
                continue;
            }
            let count = counts[id] as f64;
            center.x = sum_x[id] as f64 / count;
            center.y = sum_y[id] as f64 / count;
            center.intensity = sum_intensity[id] / count;
            center.max_color_distance = max_color_distance[id].max(1.0);
        }
    }

    // The TS loop marks both pixels of every right/below pair with different valid labels: a pixel is on a
    // boundary when any of its four neighbours has another valid label.
    let mut boundaries = vec![0u8; pixels];
    boundaries.par_chunks_mut(width).enumerate().for_each(|(y, row)| {
        for (x, flag) in row.iter_mut().enumerate() {
            let pixel = y * width + x;
            let label = labels[pixel];
            let differs = |other: usize| labels[other] >= 0 && labels[other] != label;
            let on_boundary = (x + 1 < width && differs(pixel + 1))
                || (x > 0 && differs(pixel - 1))
                || (y + 1 < height && differs(pixel + width))
                || (y > 0 && differs(pixel - width));
            if label >= 0 && on_boundary {
                *flag = 1;
            }
        }
    });
    // Touching label pairs (smaller id first), collected per band and deduplicated.
    let mut pairs: Vec<u64> = labels
        .par_chunks(band_len)
        .enumerate()
        .flat_map_iter(|(band, chunk)| {
            let mut found = Vec::new();
            let mut add = |a: i32, b: i32| {
                if a >= 0 && b >= 0 && a != b {
                    let pair = ((a.min(b) as u64) << 32) | a.max(b) as u64;
                    if found.last() != Some(&pair) {
                        found.push(pair);
                    }
                }
            };
            for offset in 0..chunk.len() {
                let pixel = band * band_len + offset;
                if pixel % width < width - 1 {
                    add(labels[pixel], labels[pixel + 1]);
                }
                if pixel < pixels - width {
                    add(labels[pixel], labels[pixel + width]);
                }
            }
            found.sort_unstable();
            found.dedup();
            found
        })
        .collect();
    pairs.par_sort_unstable();
    pairs.dedup();
    let mut neighbors: Vec<Vec<u32>> = vec![Vec::new(); centers.len()];
    for pair in pairs {
        let (a, b) = ((pair >> 32) as usize, (pair & 0xffff_ffff) as usize);
        neighbors[a].push(b as u32);
        neighbors[b].push(a as u32);
    }
    let sensitivity = match settings.edge_sensitivity {
        EdgeSensitivity::High => 1.3,
        EdgeSensitivity::Low => 0.7,
        EdgeSensitivity::Medium => 1.0,
    };
    let mut pixel_counts = vec![0u32; centers.len()];
    let mut intensity_sums = vec![0.0f64; centers.len()];
    let mut edge_sums = vec![0.0f64; centers.len()];
    for (pixel, &label) in labels.iter().enumerate() {
        if label < 0 {
            continue;
        }
        let label = label as usize;
        let (x, y) = (pixel % width, pixel / width);
        let current = smoothed[pixel] as f64;
        let right = if x < width - 1 { smoothed[pixel + 1] as f64 } else { current };
        let below = if y < height - 1 { smoothed[pixel + width] as f64 } else { current };
        pixel_counts[label] += 1;
        intensity_sums[label] += current;
        edge_sums[label] += (((right - current).abs() + (below - current).abs()) / 255.0 * sensitivity).min(1.0);
    }
    let regions = neighbors
        .into_iter()
        .enumerate()
        .map(|(id, mut ids)| {
            ids.sort_unstable();
            let count = (pixel_counts[id] as f64).max(1.0);
            Region { pixel_count: pixel_counts[id], mean_intensity: intensity_sums[id] / count, mean_edge_strength: edge_sums[id] / count, neighbors: ids }
        })
        .collect();
    Superpixels { region_size, labels, boundaries, regions }
}

impl Superpixels {
    /// One little-endian buffer for the page (src/features/segmentation/native-superpixels.ts):
    /// u32 regions n, u32 region size, u32 neighbour total m, u32 0, f64[n] mean intensity, f64[n] mean edge
    /// strength, i32[w*h] labels, u32[n] pixel counts, u32[n+1] neighbour offsets, u32[m] neighbours, u8[w*h] boundaries.
    pub fn pack(&self) -> Vec<u8> {
        let regions = &self.regions;
        let neighbor_total: usize = regions.iter().map(|region| region.neighbors.len()).sum();
        let mut packed = Vec::with_capacity(16 + regions.len() * 24 + self.labels.len() * 5 + (regions.len() + 1 + neighbor_total) * 4);
        for value in [regions.len(), self.region_size, neighbor_total, 0] {
            packed.extend_from_slice(&(value as u32).to_le_bytes());
        }
        regions.iter().for_each(|region| packed.extend_from_slice(&region.mean_intensity.to_le_bytes()));
        regions.iter().for_each(|region| packed.extend_from_slice(&region.mean_edge_strength.to_le_bytes()));
        self.labels.iter().for_each(|label| packed.extend_from_slice(&label.to_le_bytes()));
        regions.iter().for_each(|region| packed.extend_from_slice(&region.pixel_count.to_le_bytes()));
        let mut offset = 0u32;
        packed.extend_from_slice(&offset.to_le_bytes());
        for region in regions {
            offset += region.neighbors.len() as u32;
            packed.extend_from_slice(&offset.to_le_bytes());
        }
        regions.iter().flat_map(|region| &region.neighbors).for_each(|id| packed.extend_from_slice(&id.to_le_bytes()));
        packed.extend_from_slice(&self.boundaries);
        packed
    }
}
