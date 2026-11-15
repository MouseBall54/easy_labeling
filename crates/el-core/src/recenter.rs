//! Recenter: port of `src/domain/refine/recenter.ts`. Moves a box (its size kept) so its centre sits on the
//! centroid of the target pixels in a region around it; each target pixel counts the same, and with
//! `component: "nearest"` only the 8-connected group nearest the box centre counts. The TS code is the
//! reference (golden fixtures in `crates/el-bench/fixtures/recenter/`); keep both in step.

use crate::js;
use crate::refine::{BoxInput, GrayImage, Rect};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Clone, Copy, Debug)]
pub struct RecenterTarget {
    pub level: f64,
    pub dark: bool,
}

#[derive(Deserialize, Clone, Copy, Debug, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Axis {
    X,
    Y,
    Both,
}

#[derive(Deserialize, Clone, Copy, Debug, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Component {
    Nearest,
    All,
}

/// A normalized rule (normalizeRecenterRule in TS); the page sends it as saved.
#[derive(Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct RecenterRule {
    #[serde(default)]
    pub from_classes: Vec<String>,
    pub margin_top: f64,
    pub margin_bottom: f64,
    pub margin_left: f64,
    pub margin_right: f64,
    pub target: RecenterTarget,
    pub axis: Axis,
    pub component: Component,
    pub min_ratio: f64,
    pub min_pixels: f64,
    pub max_shift: f64,
}

#[derive(Serialize, Clone, Copy, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum RecenterStatus {
    Moved,
    Centred,
    NotFound,
    TooFew,
    TooFar,
}

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct RecenterResult {
    pub id: String,
    pub class_id: String,
    pub status: RecenterStatus,
    #[serde(rename = "box")]
    pub rect: Rect,
    pub shift_x: f64,
    pub shift_y: f64,
    pub count: usize,
    pub ratio: f64,
}

/// Region in whole pixels: [x0, x1) x [y0, y1), clipped to the image, never smaller than 1 x 1.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Region {
    pub x0: usize,
    pub y0: usize,
    pub x1: usize,
    pub y1: usize,
}

/// `Math.floor(value + 0.5)`, as recenter.ts rounds.
fn round_half_up(value: f64) -> f64 {
    (value + 0.5).floor()
}

fn axis_range(lo: f64, hi: f64, size: usize, before: f64, after: f64) -> (usize, usize) {
    let span = hi - lo;
    let size = size as f64;
    let start = js::min(js::max(0.0, round_half_up(lo - span * before)), size - 1.0);
    let end = js::max(start + 1.0, js::min(size, round_half_up(hi + span * after)));
    // NaN (a box with NaN corners) casts to 0: an empty region, as the TS loops run zero times.
    (start as usize, end as usize)
}

pub fn recenter_region(rect: &Rect, rule: &RecenterRule, width: usize, height: usize) -> Region {
    let (x0, x1) = axis_range(rect.x0, rect.x1, width, rule.margin_left, rule.margin_right);
    let (y0, y1) = axis_range(rect.y0, rect.y1, height, rule.margin_top, rule.margin_bottom);
    Region { x0, y0, x1: x1.max(x0), y1: y1.max(y0) }
}

/// What a recenter reads and counts (analyzeRecenter).
pub struct RecenterAnalysis {
    pub region: Region,
    /// Region-sized, row-major: 0 = not a target, 1 = counted, 2 = a target in another group.
    pub mask: Vec<u8>,
    pub targets: usize,
    pub count: usize,
    pub centroid: Option<(f64, f64)>,
}

pub fn analyze_recenter(image: &GrayImage, rect: &Rect, rule: &RecenterRule) -> RecenterAnalysis {
    let region = recenter_region(rect, rule, image.width, image.height);
    let w = region.x1 - region.x0;
    let h = region.y1 - region.y0;
    let mut mask = vec![0u8; w * h];
    let (level, dark) = (rule.target.level, rule.target.dark);
    let mut targets = 0;
    for y in 0..h {
        let row = &image.gray[(region.y0 + y) * image.width + region.x0..][..w];
        for (x, &v) in row.iter().enumerate() {
            let v = f64::from(v);
            if if dark { v <= level } else { v >= level } {
                mask[y * w + x] = 1;
                targets += 1;
            }
        }
    }
    if targets > 0 && rule.component == Component::Nearest {
        let cx = (rect.x0 + rect.x1) / 2.0 - region.x0 as f64;
        let cy = (rect.y0 + rect.y1) / 2.0 - region.y0 as f64;
        keep_nearest_component(&mut mask, w, h, cx, cy);
    }
    let (mut count, mut sum_x, mut sum_y) = (0usize, 0f64, 0f64);
    for y in 0..h {
        for x in 0..w {
            if mask[y * w + x] == 1 {
                count += 1;
                sum_x += x as f64;
                sum_y += y as f64;
            }
        }
    }
    let centroid = (count > 0).then(|| (region.x0 as f64 + sum_x / count as f64 + 0.5, region.y0 as f64 + sum_y / count as f64 + 0.5));
    RecenterAnalysis { region, mask, targets, count, centroid }
}

/// Marks every target outside the 8-connected group nearest (cx, cy) as 2: nearest pixel centre first, then the
/// larger group, then the first found in a row-major scan.
fn keep_nearest_component(mask: &mut [u8], w: usize, h: usize, cx: f64, cy: f64) {
    let mut labels = vec![0u32; w * h];
    let mut stack = Vec::new();
    let (mut best, mut best_distance, mut best_size) = (0u32, f64::INFINITY, 0usize);
    let mut next = 0u32;
    for start in 0..mask.len() {
        if mask[start] != 1 || labels[start] != 0 {
            continue;
        }
        next += 1;
        labels[start] = next;
        stack.push(start);
        let (mut size, mut distance) = (0usize, f64::INFINITY);
        while let Some(index) = stack.pop() {
            size += 1;
            let (x, y) = (index % w, index / w);
            let dx = x as f64 + 0.5 - cx;
            let dy = y as f64 + 0.5 - cy;
            let d = dx * dx + dy * dy;
            if d < distance {
                distance = d;
            }
            for ny in y.saturating_sub(1)..=(y + 1).min(h - 1) {
                for nx in x.saturating_sub(1)..=(x + 1).min(w - 1) {
                    let n = ny * w + nx;
                    if mask[n] == 1 && labels[n] == 0 {
                        labels[n] = next;
                        stack.push(n);
                    }
                }
            }
        }
        if distance < best_distance || (distance == best_distance && size > best_size) {
            best = next;
            best_distance = distance;
            best_size = size;
        }
    }
    for (value, &label) in mask.iter_mut().zip(&labels) {
        if *value == 1 && label != best {
            *value = 2;
        }
    }
}

/// judgeRecenter: the result for one box from its analysis.
pub fn judge_recenter(width: usize, height: usize, input: &BoxInput, rule: &RecenterRule, analysis: &RecenterAnalysis) -> RecenterResult {
    let rect = Rect { x0: input.x0, y0: input.y0, x1: input.x1, y1: input.y1 };
    let region = analysis.region;
    let area = ((region.x1 - region.x0) * (region.y1 - region.y0)) as f64;
    let ratio = if area > 0.0 { analysis.count as f64 / area } else { 0.0 };
    let result = |status, rect, shift_x, shift_y| RecenterResult {
        id: input.id.clone(),
        class_id: input.class_id.clone(),
        status,
        rect,
        shift_x,
        shift_y,
        count: analysis.count,
        ratio,
    };
    let Some((mx, my)) = analysis.centroid else {
        return result(RecenterStatus::NotFound, rect, 0.0, 0.0);
    };
    let box_width = rect.x1 - rect.x0;
    let box_height = rect.y1 - rect.y0;
    let shift_x = if rule.axis == Axis::Y { 0.0 } else { mx - (rect.x0 + rect.x1) / 2.0 };
    let shift_y = if rule.axis == Axis::X { 0.0 } else { my - (rect.y0 + rect.y1) / 2.0 };
    if (analysis.count as f64) < rule.min_pixels || ratio < rule.min_ratio {
        return result(RecenterStatus::TooFew, rect, shift_x, shift_y);
    }
    if shift_x.abs() > rule.max_shift * box_width || shift_y.abs() > rule.max_shift * box_height {
        return result(RecenterStatus::TooFar, rect, shift_x, shift_y);
    }
    if shift_x.abs() < 0.5 && shift_y.abs() < 0.5 {
        return result(RecenterStatus::Centred, rect, shift_x, shift_y);
    }
    let clamp = |lo: f64, shift: f64, size: f64, limit: f64| if size > limit { lo } else { js::min(js::max(0.0, lo + shift), limit - size) };
    let x0 = clamp(rect.x0, shift_x, box_width, width as f64);
    let y0 = clamp(rect.y0, shift_y, box_height, height as f64);
    result(RecenterStatus::Moved, Rect { x0, y0, x1: x0 + box_width, y1: y0 + box_height }, shift_x, shift_y)
}

pub fn recenter_box(image: &GrayImage, input: &BoxInput, rule: &RecenterRule) -> RecenterResult {
    let rect = Rect { x0: input.x0, y0: input.y0, x1: input.x1, y1: input.y1 };
    judge_recenter(image.width, image.height, input, rule, &analyze_recenter(image, &rect, rule))
}

/// One result per box, in order (recenterBoxes).
pub fn recenter_boxes(image: &GrayImage, boxes: &[BoxInput], rule: &RecenterRule) -> Vec<RecenterResult> {
    boxes.iter().map(|input| recenter_box(image, input, rule)).collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn rule() -> RecenterRule {
        serde_json::from_str(
            r#"{"fromClasses":[],"marginTop":0.25,"marginBottom":0.25,"marginLeft":0.25,"marginRight":0.25,
                "target":{"level":128,"dark":false},"axis":"both","component":"nearest","minRatio":0.05,"minPixels":4,"maxShift":0.5}"#,
        )
        .unwrap()
    }

    #[test]
    fn moves_onto_the_blob_centroid() {
        let mut gray = vec![20u8; 40 * 40];
        for y in 12..18 {
            for x in 10..20 {
                gray[y * 40 + x] = 220;
            }
        }
        let image = GrayImage { gray: &gray, width: 40, height: 40 };
        let input = BoxInput { id: "a".into(), class_id: "0".into(), x0: 7.0, y0: 12.0, x1: 17.0, y1: 22.0 };
        let result = recenter_box(&image, &input, &rule());
        assert_eq!(result.status, RecenterStatus::Moved);
        assert_eq!((result.rect.x0, result.rect.y0, result.rect.x1, result.rect.y1), (10.0, 10.0, 20.0, 20.0));
        assert_eq!(result.count, 60);
    }

    #[test]
    fn empty_image_finds_nothing() {
        let gray = vec![0u8; 16];
        let image = GrayImage { gray: &gray, width: 4, height: 4 };
        let input = BoxInput { id: "a".into(), class_id: "0".into(), x0: 1.0, y0: 1.0, x1: 3.0, y1: 3.0 };
        assert_eq!(recenter_box(&image, &input, &rule()).status, RecenterStatus::NotFound);
    }
}
