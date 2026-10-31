//! Port of inspectDetectionLabels (src/features/review/quality.ts): the label checks behind the
//! Review task. Same issues, order, messages and arithmetic as the TS code.

use crate::js;
use crate::yolo::{parse_rows, YoloRow};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};

/// Normalized settings (normalizeSettings in review-state.ts has already run on the TS side).
#[derive(Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ReviewSettings {
    pub minimum_box_size_px: f64,
    pub duplicate_iou_threshold: f64,
    pub required_class_ids: Vec<String>,
}

#[derive(Serialize, Clone, Debug, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct ReviewIssue {
    #[serde(rename = "type")]
    pub kind: &'static str,
    pub severity: &'static str,
    pub message: String,
    pub rect_indexes: Vec<usize>,
}

#[derive(Serialize, Clone, Debug, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct ReviewFinding {
    pub issues: Vec<ReviewIssue>,
    pub highest_severity: Option<&'static str>,
}

fn intersection_over_union(left: &YoloRow, right: &YoloRow) -> f64 {
    let overlap_width = js::max(0.0, js::min(left.left + left.width, right.left + right.width) - js::max(left.left, right.left));
    let overlap_height = js::max(0.0, js::min(left.top + left.height, right.top + right.height) - js::max(left.top, right.top));
    let intersection = overlap_width * overlap_height;
    let union = left.width * left.height + right.width * right.height - intersection;
    if union > 0.0 {
        intersection / union
    } else {
        0.0
    }
}

/// Class labels as small integers, so the pair loops compare numbers instead of strings.
fn class_ids(rows: &[YoloRow]) -> Vec<u32> {
    let mut ids = HashMap::new();
    rows.iter()
        .map(|row| {
            let next = ids.len() as u32;
            *ids.entry(row.label_class.as_str()).or_insert(next)
        })
        .collect()
}

/// Same-class pairs with IoU >= threshold, as (left, right) with left < right in ascending order: the
/// TS double loop's order. Reference version: every pair.
fn duplicate_pairs_all(rows: &[YoloRow], classes: &[u32], threshold: f64) -> Vec<(usize, usize)> {
    let mut pairs = Vec::new();
    for left in 0..rows.len() {
        for right in left + 1..rows.len() {
            if classes[left] == classes[right] && intersection_over_union(&rows[left], &rows[right]) >= threshold {
                pairs.push((left, right));
            }
        }
    }
    pairs
}

/// Same result as `duplicate_pairs_all`. With threshold > 0 a pair needs IoU > 0, hence a positive x
/// overlap, hence `max(left) < min(left + width)`: after sorting by left edge, box j can only pair with an
/// earlier box i while `left_j < right_i`. Boxes with a NaN edge never pair (their IoU is 0). Candidates
/// get the exact IoU test, and the pairs are re-sorted into the reference order. All boxes in one spot
/// still cost O(n^2), like the reference.
pub fn duplicate_pairs(rows: &[YoloRow], threshold: f64) -> Vec<(usize, usize)> {
    let classes = class_ids(rows);
    if threshold.is_nan() || threshold <= 0.0 {
        return duplicate_pairs_all(rows, &classes, threshold);
    }
    let right_edge = |row: &YoloRow| row.left + row.width;
    let mut order: Vec<usize> = (0..rows.len()).filter(|&index| !rows[index].left.is_nan() && !right_edge(&rows[index]).is_nan()).collect();
    order.sort_by(|&a, &b| rows[a].left.total_cmp(&rows[b].left));
    let mut pairs = Vec::new();
    for (position, &i) in order.iter().enumerate() {
        let right_i = right_edge(&rows[i]);
        for &j in &order[position + 1..] {
            // Neither side is NaN here, so this is exactly "not left_j < right_i".
            if rows[j].left >= right_i {
                break;
            }
            let (left, right) = (i.min(j), i.max(j));
            if classes[i] == classes[j] && intersection_over_union(&rows[left], &rows[right]) >= threshold {
                pairs.push((left, right));
            }
        }
    }
    pairs.sort_unstable();
    pairs
}

fn issue(kind: &'static str, severity: &'static str, message: String, rect_indexes: Vec<usize>) -> ReviewIssue {
    ReviewIssue { kind, severity, message, rect_indexes }
}

/// `YOLO_EDGE_TOLERANCE` in src/domain/yolo/yolo.ts: floating-point error around an image edge is not "outside".
const EDGE_TOLERANCE: f64 = 1e-9;

pub fn inspect_detection_labels(text: &str, image_width: f64, image_height: f64, settings: &ReviewSettings) -> ReviewFinding {
    let rows = parse_rows(text, image_width, image_height);
    let mut issues = Vec::new();
    if rows.is_empty() {
        issues.push(issue("empty-label", "warning", "No detection labels".into(), vec![]));
    }
    let minimum = settings.minimum_box_size_px;
    let (tolerance_x, tolerance_y) = (EDGE_TOLERANCE * image_width, EDGE_TOLERANCE * image_height);
    for (index, row) in rows.iter().enumerate() {
        let outside = !(row.left.is_finite() && row.top.is_finite() && row.width.is_finite() && row.height.is_finite())
            || row.left < -tolerance_x
            || row.top < -tolerance_y
            || row.left + row.width > image_width + tolerance_x
            || row.top + row.height > image_height + tolerance_y;
        if outside {
            issues.push(issue("out-of-bounds", "error", format!("Box {} is outside the image", index + 1), vec![index]));
        }
        if row.width < minimum || row.height < minimum {
            issues.push(issue("small-box", "warning", format!("Box {} is smaller than {}px", index + 1, js::number_to_string(minimum)), vec![index]));
        }
    }
    for (left, right) in duplicate_pairs(&rows, settings.duplicate_iou_threshold) {
        issues.push(issue("duplicate-box", "warning", format!("Boxes {} and {} overlap", left + 1, right + 1), vec![left, right]));
    }
    let classes: HashSet<&str> = rows.iter().map(|row| row.label_class.as_str()).collect();
    for class_id in &settings.required_class_ids {
        if !classes.contains(class_id.as_str()) {
            issues.push(issue("missing-class", "warning", format!("Required class {class_id} is missing"), vec![]));
        }
    }
    let highest_severity = if issues.iter().any(|issue| issue.severity == "error") {
        Some("error")
    } else if issues.is_empty() {
        None
    } else {
        Some("warning")
    };
    ReviewFinding { issues, highest_severity }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Random boxes with clustered, equal, negative, infinite and NaN edges: the pruned search must
    /// return exactly the reference pairs.
    #[test]
    fn pruned_duplicate_search_matches_every_pair() {
        let mut state = 7u32;
        let mut random = move || {
            state = state.wrapping_mul(1_103_515_245).wrapping_add(12_345);
            f64::from(state) / 4_294_967_296.0
        };
        for round in 0..300 {
            let count = 1 + (random() * 60.0) as usize;
            let rows: Vec<YoloRow> = (0..count)
                .map(|_| {
                    let pick = random();
                    let mut edge = || match (random() * 40.0) as u32 {
                        0 => f64::NAN,
                        1 => f64::INFINITY,
                        2 => f64::NEG_INFINITY,
                        3 => -0.0,
                        _ => (random() * 20.0).floor() / 2.0,
                    };
                    let (left, top, width, height) = (edge(), edge(), edge() - 3.0, edge() - 3.0);
                    YoloRow { label_class: if pick < 0.5 { "0".into() } else { "1".into() }, left, top, width, height }
                })
                .collect();
            let classes = class_ids(&rows);
            for threshold in [1e-12, 0.1, 0.5, 0.9, 1.0] {
                assert_eq!(duplicate_pairs(&rows, threshold), duplicate_pairs_all(&rows, &classes, threshold), "round {round}, threshold {threshold}");
            }
        }
    }
}
