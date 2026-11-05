// Port of src/domain/refine/edge-refine.ts (refineBoxes and flagPeerOutliers). Params arrive normalised
// (normalizeRefineParams on the JS side). Profiles are f32 like the JS Float32Arrays; maths is f64.

use crate::gray::js_round;
use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use std::cmp::Ordering;
use std::collections::{BTreeMap, HashMap};

#[derive(Deserialize, Clone, Debug, Default)]
#[serde(rename_all = "camelCase")]
pub struct SideRule {
    polarity: Option<String>,
    comb: Option<String>,
    range_in: Option<f64>,
    range_out: Option<f64>,
    sigma: Option<f64>,
    grad_step: Option<f64>,
    segments: Option<f64>,
    inset: Option<f64>,
    scan_span: Option<String>,
    part_mode: Option<String>,
    near_weight: Option<bool>,
    extend_start: Option<f64>,
    extend_end: Option<f64>,
    inward_start: Option<f64>,
    inward_end: Option<f64>,
}

#[derive(Deserialize, Clone, Debug)]
pub struct Sides<T> {
    #[serde(rename = "L")]
    l: T,
    #[serde(rename = "R")]
    r: T,
    #[serde(rename = "T")]
    t: T,
    #[serde(rename = "B")]
    b: T,
}

impl<T> Sides<T> {
    fn get(&self, side: Side) -> &T {
        match side {
            Side::L => &self.l,
            Side::R => &self.r,
            Side::T => &self.t,
            Side::B => &self.b,
        }
    }
}

#[derive(Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct RefineParams {
    pub enabled: bool,
    crit: String,
    polarity: String,
    comb: String,
    range_in: f64,
    range_out: f64,
    segments: f64,
    sigma: f64,
    grad_step: f64,
    inset: f64,
    scan_span: String,
    #[serde(default = "together")]
    part_mode: String,
    #[serde(default = "yes")]
    near_weight: bool,
    extend_start: f64,
    extend_end: f64,
    #[serde(default)]
    inward_start: f64,
    #[serde(default)]
    inward_end: f64,
    sides: Sides<String>,
    side_rules: Sides<SideRule>,
    #[serde(rename = "pairTB", default = "pair_off")]
    pair_tb: String,
    #[serde(rename = "pairTBPick", default = "pair_strongest")]
    pair_tb_pick: String,
    #[serde(rename = "pairLR", default = "pair_off")]
    pair_lr: String,
    #[serde(rename = "pairLRPick", default = "pair_strongest")]
    pair_lr_pick: String,
    iterations: f64,
    review_below: f64,
    area_grow_limit: f64,
    area_shrink_limit: f64,
    context_ring: f64,
    avoid_neighbors: bool,
    peer_tolerance: f64,
}

fn together() -> String {
    "together".into()
}

fn yes() -> bool {
    true
}

fn pair_off() -> String {
    "off".into()
}

fn pair_strongest() -> String {
    "strongest".into()
}

#[derive(Clone, Copy, PartialEq, Eq, Debug, Serialize, Hash, PartialOrd, Ord)]
/// Declared in REFINE_SIDES order (top, bottom, right, left): sideConf keys and weak sides follow it.
pub enum Side {
    T,
    B,
    R,
    L,
}

const SIDES: [Side; 4] = [Side::T, Side::B, Side::R, Side::L];
/// Smallest box side (px) a refinement may leave (MIN_SIZE in edge-refine.ts).
const MIN_SIZE: f64 = 2.0;

#[derive(Deserialize, Serialize, Clone, Copy, Debug)]
pub struct Rect {
    pub x0: f64,
    pub y0: f64,
    pub x1: f64,
    pub y1: f64,
}

impl Rect {
    fn get(&self, side: Side) -> f64 {
        match side {
            Side::L => self.x0,
            Side::R => self.x1,
            Side::T => self.y0,
            Side::B => self.y1,
        }
    }
    fn set(&mut self, side: Side, value: f64) {
        match side {
            Side::L => self.x0 = value,
            Side::R => self.x1 = value,
            Side::T => self.y0 = value,
            Side::B => self.y1 = value,
        }
    }
}

#[derive(Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct BoxInput {
    pub id: String,
    pub class_id: String,
    pub x0: f64,
    pub y0: f64,
    pub x1: f64,
    pub y1: f64,
}

impl BoxInput {
    fn rect(&self) -> Rect {
        Rect { x0: self.x0, y0: self.y0, x1: self.x1, y1: self.y1 }
    }
}

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct RefineResult {
    pub id: String,
    pub class_id: String,
    #[serde(rename = "box")]
    pub rect: Rect,
    pub conf: f64,
    pub side_conf: BTreeMap<Side, f64>,
    pub weak_sides: Vec<Side>,
    pub area_change: f64,
    pub area_flagged: bool,
    pub flagged: bool,
}

pub struct GrayImage<'a> {
    pub gray: &'a [u8],
    pub width: usize,
    pub height: usize,
}

/// The class-level params with one side's overrides; see sideParams.
#[derive(Clone, Debug)]
struct SideParams {
    crit: String,
    polarity: String,
    comb: String,
    range_in: f64,
    range_out: f64,
    segments: f64,
    sigma: f64,
    grad_step: f64,
    inset: f64,
    scan_span: String,
    part_mode: String,
    near_weight: bool,
    extend_start: f64,
    extend_end: f64,
    inward_start: f64,
    inward_end: f64,
    avoid_neighbors: bool,
}

fn side_params(p: &RefineParams, side: Side) -> SideParams {
    let rule = p.side_rules.get(side);
    let mode = p.sides.get(side);
    SideParams {
        crit: if mode == "inherit" || mode == "off" { p.crit.clone() } else { mode.clone() },
        polarity: rule.polarity.clone().unwrap_or_else(|| p.polarity.clone()),
        comb: rule.comb.clone().unwrap_or_else(|| p.comb.clone()),
        range_in: rule.range_in.unwrap_or(p.range_in),
        range_out: rule.range_out.unwrap_or(p.range_out),
        segments: rule.segments.unwrap_or(p.segments),
        sigma: rule.sigma.unwrap_or(p.sigma),
        grad_step: rule.grad_step.unwrap_or(p.grad_step),
        inset: rule.inset.unwrap_or(p.inset),
        scan_span: rule.scan_span.clone().unwrap_or_else(|| p.scan_span.clone()),
        part_mode: rule.part_mode.clone().unwrap_or_else(|| p.part_mode.clone()),
        near_weight: rule.near_weight.unwrap_or(p.near_weight),
        extend_start: rule.extend_start.unwrap_or(p.extend_start),
        extend_end: rule.extend_end.unwrap_or(p.extend_end),
        inward_start: rule.inward_start.unwrap_or(p.inward_start),
        inward_end: rule.inward_end.unwrap_or(p.inward_end),
        avoid_neighbors: p.avoid_neighbors,
    }
}

fn gauss_kernel(sigma: f64) -> Vec<f32> {
    // NaN sigma means no smoothing, like the JS `!(sigma > 0)`.
    if sigma.is_nan() || sigma <= 0.0 {
        return vec![1.0];
    }
    let radius = (sigma * 3.0).ceil() as i64;
    let mut kernel = Vec::with_capacity((2 * radius + 1) as usize);
    let mut sum = 0.0f64;
    for i in -radius..=radius {
        let v = (-((i * i) as f64) / (2.0 * sigma * sigma)).exp();
        kernel.push(v as f32);
        sum += v;
    }
    kernel.iter().map(|&k| (k as f64 / sum) as f32).collect()
}

fn smooth(profile: &[f32], kernel: &[f32]) -> Vec<f32> {
    let radius = ((kernel.len() - 1) >> 1) as i64;
    let n = profile.len() as i64;
    (0..n)
        .map(|i| {
            let mut sum = 0.0f64;
            for j in -radius..=radius {
                let q = (i + j).clamp(0, n - 1) as usize;
                sum += profile[q] as f64 * kernel[(j + radius) as usize] as f64;
            }
            sum as f32
        })
        .collect()
}

fn sort_f32(values: &mut [f32]) {
    values.sort_by(|a, b| a.total_cmp(b));
}

fn quantile(sorted: &[f32], q: f64) -> f64 {
    if sorted.len() == 1 {
        return sorted[0] as f64;
    }
    let i = q * (sorted.len() - 1) as f64;
    let lo = i.floor() as usize;
    let hi = i.ceil() as usize;
    sorted[lo] as f64 + (sorted[hi] as f64 - sorted[lo] as f64) * (i - lo as f64)
}

fn parabola(f: &dyn Fn(i64) -> f64, i: i64, n: i64) -> f64 {
    if i <= 0 || i >= n - 1 {
        return 0.0;
    }
    let (a, b, c) = (f(i - 1), f(i), f(i + 1));
    let den = a - 2.0 * b + c;
    if den.abs() < 1e-9 {
        return 0.0;
    }
    (0.5 * (a - c) / den).clamp(-0.5, 0.5)
}

#[derive(Clone, Copy, Debug)]
struct EdgeContext {
    inside: f64,
    outside: f64,
    polarity: i32,
}

struct Edge {
    pos: f64,
    conf: f64,
    /// Unclamped contrast-to-noise ratio (see findEdge): ranks competing parts of a side.
    strength: f64,
}

/// profileStats: range and contrast-to-noise ratio of a profile; None when it is flat.
fn profile_stats(raw: &[f32], p: &[f32]) -> Option<(f64, f64, f64)> {
    let mut lo = f64::INFINITY;
    let mut hi = f64::NEG_INFINITY;
    for &v in p {
        lo = lo.min(v as f64);
        hi = hi.max(v as f64);
    }
    let range = hi - lo;
    if range < 1e-6 {
        return None;
    }
    let mut dd: Vec<f32> = (1..raw.len().saturating_sub(1)).map(|i| (raw[i + 1] as f64 - 2.0 * raw[i] as f64 + raw[i - 1] as f64).abs() as f32).collect();
    sort_f32(&mut dd);
    let noise = if dd.is_empty() { 0.0 } else { dd[dd.len() >> 1] as f64 / (0.6745 * 6f64.sqrt()) };
    Some((lo, hi, range / (noise + 0.5)))
}

/// edgeWeight: distance to the current edge, or 1 everywhere when nearWeight is off.
fn edge_weight(n: i64, c: f64, near: bool) -> impl Fn(i64) -> f64 {
    let ws = n as f64 * 0.35;
    move |i: i64| {
        if near {
            (-((i as f64 - c) * (i as f64 - c)) / (2.0 * ws * ws)).exp()
        } else {
            1.0
        }
    }
}

/// gradientAt: brightness change over `step` samples in the expected direction (absolute when unsigned).
fn gradient_at(p: &[f32], step: i64, sign: i32) -> impl Fn(i64) -> f64 + '_ {
    let n = p.len() as i64;
    let before = step / 2;
    let after = step - before;
    move |i: i64| {
        let g = p[(i + after).min(n - 1) as usize] as f64 - p[(i - before).max(0) as usize] as f64;
        if sign == 0 {
            g.abs()
        } else {
            (sign as f64 * g).max(0.0)
        }
    }
}

/// bandEdge: the band centre (peak) or its outer 50% level (flank) for the band peaking at `peak`.
fn band_edge(p: &[f32], peak: i64, crit: &str, out: i64, context: Option<EdgeContext>) -> Option<f64> {
    let n = p.len() as i64;
    let at = |i: i64| p[i as usize] as f64;
    if crit == "peak" {
        return Some(peak as f64 + parabola(&at, peak, n));
    }
    let mut base = f64::INFINITY;
    let mut i = peak;
    while i >= 0 && i < n {
        base = base.min(at(i));
        i += out;
    }
    if let Some(ctx) = context.filter(|ctx| ctx.polarity != 0) {
        if ctx.outside < at(peak) {
            base = ctx.outside;
        }
    }
    let level = (at(peak) + base) / 2.0;
    let mut i = peak;
    while i + out >= 0 && i + out < n {
        if at(i + out) <= level {
            let a = at(i) - level;
            let b = at(i + out) - level;
            return Some(i as f64 + out as f64 * (a / (a - b)));
        }
        i += out;
    }
    None
}

fn scored_edge(pos: f64, snr: f64, n: i64) -> Edge {
    let mut conf = ((snr - 3.0) / 12.0).clamp(0.0, 1.0);
    let mut strength = snr;
    if pos < 1.0 || pos > n as f64 - 2.0 {
        conf *= 0.3;
        strength *= 0.3;
    }
    Edge { pos, conf, strength }
}

/// Sign of b - a as -1, 0 or 1 (Math.sign in the 50% level crossing test).
fn direction_sign(a: f64, b: f64) -> i32 {
    let direction = b - a;
    if direction > 0.0 {
        1
    } else if direction < 0.0 {
        -1
    } else {
        0
    }
}

#[allow(clippy::too_many_arguments)]
fn find_edge(raw: &[f32], p: &[f32], crit: &str, out: i64, c: f64, sign: i32, context: Option<EdgeContext>, step: i64, near: bool) -> Option<Edge> {
    let n = p.len() as i64;
    let at = |i: i64| p[i as usize] as f64;
    let (lo, hi, snr) = profile_stats(raw, p)?;
    let weight = edge_weight(n, c, near);
    let mut pos: Option<f64> = None;
    let polar = context.filter(|ctx| ctx.polarity != 0);

    if crit == "grad" {
        let before = step / 2;
        let after = step - before;
        let gradient = gradient_at(p, step, sign);
        let mut best = 0.0;
        let mut best_index = -1;
        for i in before.max(1)..n - after.max(1) {
            let g = gradient(i) * weight(i);
            if g > best {
                best = g;
                best_index = i;
            }
        }
        if best_index < 0 {
            return None;
        }
        pos = Some(best_index as f64 + (after - before) as f64 / 2.0 + parabola(&gradient, best_index, n));
    } else if crit == "thr" {
        let level = match polar {
            Some(ctx) => (ctx.inside + ctx.outside) / 2.0,
            None => (lo + hi) / 2.0,
        };
        let mut best_distance = f64::INFINITY;
        for i in 0..n - 1 {
            let a = at(i) - level;
            let b = at(i + 1) - level;
            if a * b <= 0.0 && a != b && (sign == 0 || direction_sign(a, b) == sign) {
                let x = i as f64 + a / (a - b);
                let d = (x - c).abs();
                if d < best_distance {
                    best_distance = d;
                    pos = Some(x);
                }
            }
        }
    } else {
        let mut best = f64::NEG_INFINITY;
        let mut peak = -1;
        for i in 1..n - 1 {
            if at(i) >= at(i - 1) && at(i) >= at(i + 1) {
                let s = (at(i) - lo) * weight(i);
                if s > best {
                    best = s;
                    peak = i;
                }
            }
        }
        if peak < 0 {
            return None;
        }
        pos = band_edge(p, peak, crit, out, context);
    }
    let pos = pos.filter(|p| p.is_finite())?;
    Some(scored_edge(pos, snr, n))
}

/// findEdgeCandidates: every edge find_edge weighs, best first (at most `max`), scaled by its share of the best score.
#[allow(clippy::too_many_arguments)]
fn find_edge_candidates(
    raw: &[f32],
    p: &[f32],
    crit: &str,
    out: i64,
    c: f64,
    sign: i32,
    context: Option<EdgeContext>,
    step: i64,
    near: bool,
    max: usize,
) -> Vec<Edge> {
    let n = p.len() as i64;
    let at = |i: i64| p[i as usize] as f64;
    let Some((lo, hi, snr)) = profile_stats(raw, p) else {
        return Vec::new();
    };
    let weight = edge_weight(n, c, near);
    let mut picks: Vec<(Option<f64>, f64)> = Vec::new();
    if crit == "grad" {
        let before = step / 2;
        let after = step - before;
        let gradient = gradient_at(p, step, sign);
        let from = before.max(1);
        let to = n - after.max(1);
        let score = |i: i64| gradient(i) * weight(i);
        for i in from..to {
            let g = score(i);
            if g > 0.0 && (i == from || g > score(i - 1)) && (i == to - 1 || g >= score(i + 1)) {
                picks.push((Some(i as f64 + (after - before) as f64 / 2.0 + parabola(&gradient, i, n)), g));
            }
        }
    } else if crit == "thr" {
        let level = match context.filter(|ctx| ctx.polarity != 0) {
            Some(ctx) => (ctx.inside + ctx.outside) / 2.0,
            None => (lo + hi) / 2.0,
        };
        for i in 0..n - 1 {
            let a = at(i) - level;
            let b = at(i + 1) - level;
            if a * b <= 0.0 && a != b && (sign == 0 || direction_sign(a, b) == sign) {
                let x = i as f64 + a / (a - b);
                picks.push((Some(x), -(x - c).abs()));
            }
        }
    } else {
        for i in 1..n - 1 {
            if at(i) >= at(i - 1) && at(i) >= at(i + 1) {
                picks.push((band_edge(p, i, crit, out, context), (at(i) - lo) * weight(i)));
            }
        }
    }
    picks.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(Ordering::Equal));
    let best = picks.first().map_or(0.0, |pick| pick.1);
    let mut found = Vec::new();
    for (pos, score) in picks {
        if found.len() >= max {
            break;
        }
        let Some(pos) = pos.filter(|pos| pos.is_finite()) else {
            continue;
        };
        found.push(scored_edge(pos, if crit == "thr" { snr } else { snr * score / best }, n));
    }
    found
}

fn median(values: &mut [f32]) -> f64 {
    sort_f32(values);
    quantile(values, 0.5)
}

fn measure_context(img: &GrayImage, rect: &Rect, range_out: f64, context_ring: f64) -> Option<EdgeContext> {
    if context_ring <= 0.0 {
        return None;
    }
    let (width, height) = (img.width as i64, img.height as i64);
    let pixel = |x: i64, y: i64| img.gray[(y * width + x) as usize] as f32;
    let w = rect.x1 - rect.x0;
    let h = rect.y1 - rect.y0;
    const MAX_SAMPLES: usize = 1024;
    let mut inner = Vec::with_capacity(MAX_SAMPLES);
    let ix0 = (js_round(rect.x0 + w * 0.25) as i64).max(0);
    let ix1 = (js_round(rect.x1 - w * 0.25) as i64).min(width - 1);
    let iy0 = (js_round(rect.y0 + h * 0.25) as i64).max(0);
    let iy1 = (js_round(rect.y1 - h * 0.25) as i64).min(height - 1);
    let inner_step = ((((ix1 - ix0 + 1) * (iy1 - iy0 + 1)) as f64 / MAX_SAMPLES as f64).sqrt().ceil() as i64).max(1);
    let mut y = iy0;
    while y <= iy1 && inner.len() < MAX_SAMPLES {
        let mut x = ix0;
        while x <= ix1 && inner.len() < MAX_SAMPLES {
            inner.push(pixel(x, y));
            x += inner_step;
        }
        y += inner_step;
    }
    let ring = context_ring as i64;
    let d1 = range_out as i64 + 1 + ring;
    let ox0 = js_round(rect.x0) as i64 - d1;
    let ox1 = js_round(rect.x1) as i64 + d1;
    let oy0 = js_round(rect.y0) as i64 - d1;
    let oy1 = js_round(rect.y1) as i64 + d1;
    let ring_area = (ox1 - ox0) * (oy1 - oy0) - (ox1 - ox0 - 2 * ring) * (oy1 - oy0 - 2 * ring);
    let ring_step = ((ring_area.max(1) as f64 / MAX_SAMPLES as f64).sqrt().ceil() as i64).max(1);
    let mut outer = Vec::with_capacity(MAX_SAMPLES);
    let mut y = oy0.max(0);
    while y <= oy1.min(height - 1) && outer.len() < MAX_SAMPLES {
        let in_band = y < oy0 + ring || y > oy1 - ring;
        let mut x = ox0.max(0);
        while x <= ox1.min(width - 1) && outer.len() < MAX_SAMPLES {
            if in_band || x < ox0 + ring || x > ox1 - ring {
                outer.push(pixel(x, y));
            }
            x += ring_step;
        }
        y += ring_step;
    }
    if inner.is_empty() || outer.is_empty() {
        return None;
    }
    let inside = median(&mut inner);
    let outside = median(&mut outer);
    let polarity = if (inside - outside).abs() < 4.0 {
        0
    } else if inside > outside {
        1
    } else {
        -1
    };
    Some(EdgeContext { inside, outside, polarity })
}

fn neighbour_limit(rect: &Rect, side: Side, neighbours: &[Rect]) -> f64 {
    let mut limit = f64::INFINITY;
    for n in neighbours {
        let gap = match side {
            Side::L | Side::R => {
                if rect.y1.min(n.y1) - rect.y0.max(n.y0) <= 0.0 {
                    continue;
                }
                if side == Side::R {
                    n.x0 - rect.x1
                } else {
                    rect.x0 - n.x1
                }
            }
            Side::T | Side::B => {
                if rect.x1.min(n.x1) - rect.x0.max(n.x0) <= 0.0 {
                    continue;
                }
                if side == Side::B {
                    n.y0 - rect.y1
                } else {
                    rect.y0 - n.y1
                }
            }
        };
        if gap >= 0.0 {
            limit = limit.min(gap / 2.0);
        }
    }
    limit
}

fn is_vertical(side: Side) -> bool {
    matches!(side, Side::L | Side::R)
}

fn outward(side: Side) -> i64 {
    if matches!(side, Side::R | Side::B) {
        1
    } else {
        -1
    }
}

struct SideWindow {
    positions: Vec<i64>,
    /// Number of positions in each scanned run, in order.
    run_lengths: Vec<usize>,
    base: i64,
    n: usize,
    c: f64,
}

/// Runs sorted by their first pixel with overlapping ones joined; adjacent runs stay apart (mergeOverlappingRuns).
fn merge_overlapping_runs(mut runs: Vec<(i64, i64)>) -> Vec<(i64, i64)> {
    runs.sort_by_key(|run| run.0);
    let mut merged: Vec<(i64, i64)> = Vec::with_capacity(runs.len());
    for (from, to) in runs {
        match merged.last_mut() {
            Some(last) if from <= last.1 => last.1 = last.1.max(to),
            _ => merged.push((from, to)),
        }
    }
    merged
}

fn side_window(img: &GrayImage, rect: &Rect, side: Side, p: &SideParams, neighbours: &[Rect]) -> SideWindow {
    let vertical = is_vertical(side);
    let p0 = rect.get(side);
    let (a0, a1) = if vertical { (rect.y0, rect.y1) } else { (rect.x0, rect.x1) };
    let length = a1 - a0;
    let thickness = if vertical { rect.x1 - rect.x0 } else { rect.y1 - rect.y0 };
    let lim = if vertical { img.height as i64 - 1 } else { img.width as i64 - 1 };
    let mut s0 = js_round(a0 + length * p.inset) as i64;
    let mut s1 = js_round(a1 - length * p.inset) as i64;
    if s1 < s0 {
        s0 = js_round((a0 + a1) / 2.0) as i64;
        s1 = s0;
    }
    let inside = (s0.clamp(0, lim), s1.clamp(0, lim));
    // Each end scans its extension past the box plus its inward part into the box (at most the box length).
    let (r0, r1) = (js_round(a0) as i64, js_round(a1) as i64);
    let in_start = (p.inward_start as i64).min((r1 - r0).max(0));
    let in_end = (p.inward_end as i64).min((r1 - r0).max(0));
    let before = ((r0 - p.extend_start as i64).max(0), (r0 + in_start - 1).min(lim));
    let after = ((r1 - in_end).max(0), (r1 + p.extend_end as i64 - 1).min(lim));
    let has_before = (p.extend_start > 0.0 || in_start > 0) && before.1 >= before.0;
    let has_after = (p.extend_end > 0.0 || in_end > 0) && after.1 >= after.0;
    let mut ends = Vec::new();
    if has_before {
        ends.push(before);
    }
    if has_after {
        ends.push(after);
    }
    let mut runs = if p.scan_span == "box" || ends.is_empty() {
        vec![inside]
    } else if p.scan_span == "outside" {
        ends
    } else {
        let mut runs = Vec::new();
        if has_before {
            runs.push(before);
        }
        runs.push(inside);
        if has_after {
            runs.push(after);
        }
        runs
    };
    // With inward parts, overlapping runs are read once, except Strongest part over box + outside (each part keeps
    // its pixels). Without them the runs stay as before, so older settings give the same results.
    if (in_start > 0 || in_end > 0) && !(p.part_mode == "strongest" && p.scan_span == "boxOutside") {
        runs = merge_overlapping_runs(runs);
    }
    let positions: Vec<i64> = runs.iter().flat_map(|&(from, to)| from..=to).collect();
    let run_lengths: Vec<usize> = runs.iter().map(|&(from, to)| (to - from + 1) as usize).collect();
    // Inward search may run through the centre up to MIN_SIZE short of the opposite side.
    let range_in = (p.range_in.min(thickness.floor() - MIN_SIZE)).max(1.0) as i64;
    let range_out = if p.avoid_neighbors { (p.range_out.min(neighbour_limit(rect, side, neighbours).floor())).max(1.0) as i64 } else { p.range_out as i64 };
    let base = js_round(p0) as i64 - if outward(side) > 0 { range_in } else { range_out };
    SideWindow { positions, run_lengths, base, n: (range_in + range_out + 1) as usize, c: p0 - 0.5 - base as f64 }
}

fn sample_profile(img: &GrayImage, w: &SideWindow, vertical: bool, from: usize, to: usize) -> Vec<f32> {
    let plim = if vertical { img.width as i64 - 1 } else { img.height as i64 - 1 };
    let mut profile = vec![0f32; w.n];
    for &t in &w.positions[from..to] {
        for (i, value) in profile.iter_mut().enumerate() {
            let q = (w.base + i as i64).clamp(0, plim);
            let index = if vertical { t * img.width as i64 + q } else { q * img.width as i64 + t };
            *value += img.gray[index as usize] as f32;
        }
    }
    let count = (to - from).max(1) as f64;
    profile.iter_mut().for_each(|v| *v = (*v as f64 / count) as f32);
    profile
}

fn resolve_polarity(p: &SideParams, context: Option<EdgeContext>) -> i32 {
    match p.polarity.as_str() {
        "brightInside" => 1,
        "darkInside" => -1,
        _ => context.map_or(0, |ctx| ctx.polarity),
    }
}

/// searchRange: edge search over positions [start, end) of the window, split into segments.
#[allow(clippy::too_many_arguments)]
/// Returns (edge position, confidence, strength).
fn search_range(
    img: &GrayImage,
    w: &SideWindow,
    side: Side,
    p: &SideParams,
    sign: i32,
    context: Option<EdgeContext>,
    start: usize,
    end: usize,
) -> Option<(f64, f64, f64)> {
    let out = outward(side);
    let kernel = gauss_kernel(p.sigma);
    let total = end - start;
    let segments = (p.segments as usize).min(total).max(1);
    let mut found = Vec::new();
    for k in 0..segments {
        let from = start + k * total / segments;
        let to = (from + 1).max(start + (k + 1) * total / segments);
        let profile = sample_profile(img, w, is_vertical(side), from, to);
        if let Some(edge) = find_edge(&profile, &smooth(&profile, &kernel), &p.crit, out, w.c, sign, context, p.grad_step as i64, p.near_weight) {
            found.push(edge);
        }
    }
    if found.is_empty() {
        return None;
    }
    let best = found.iter().map(|e| e.conf).fold(f64::NEG_INFINITY, f64::max);
    let mut positions: Vec<f32> = found.iter().filter(|e| e.conf >= best * 0.5).map(|e| e.pos as f32).collect();
    sort_f32(&mut positions);
    let pos = if p.comb == "outer" { quantile(&positions, if out < 0 { 0.1 } else { 0.9 }) } else { quantile(&positions, 0.5) };
    let mut confidences: Vec<f32> = found.iter().map(|e| e.conf as f32).collect();
    sort_f32(&mut confidences);
    let mut strengths: Vec<f32> = found.iter().map(|e| e.strength as f32).collect();
    sort_f32(&mut strengths);
    let coverage = found.len() as f64 / segments as f64;
    Some((w.base as f64 + pos + 0.5, quantile(&confidences, 0.5) * coverage, quantile(&strengths, 0.5) * coverage))
}

fn refine_side(img: &GrayImage, rect: &Rect, side: Side, p: &SideParams, context: Option<EdgeContext>, neighbours: &[Rect]) -> Option<(f64, f64)> {
    let w = side_window(img, rect, side, p, neighbours);
    let polarity = resolve_polarity(p, context);
    let sign = if polarity == 0 { 0 } else { -polarity * outward(side) as i32 };
    if p.part_mode == "strongest" && w.run_lengths.len() > 1 {
        // Each scanned part on its own; the strongest edge wins (the first one on a tie).
        let mut start = 0;
        let mut best: Option<(f64, f64, f64)> = None;
        for &length in &w.run_lengths {
            let part = search_range(img, &w, side, p, sign, context, start, start + length);
            start += length;
            if let Some(found) = part {
                if best.is_none_or(|current| found.2 > current.2) {
                    best = Some(found);
                }
            }
        }
        return best.map(|(value, conf, _)| (value, conf));
    }
    search_range(img, &w, side, p, sign, context, 0, w.positions.len()).map(|(value, conf, _)| (value, conf))
}

/// At most this many candidates per segment and per side when opposite sides are picked as a pair.
const PAIR_CANDIDATES: usize = 5;

#[derive(Clone, Copy, Debug)]
struct SideCandidate {
    value: f64,
    conf: f64,
    strength: f64,
}

/// sideCandidates: every segment's candidates clustered by position, strongest clusters first.
fn side_candidates(img: &GrayImage, w: &SideWindow, side: Side, p: &SideParams, sign: i32, context: Option<EdgeContext>) -> Vec<SideCandidate> {
    let out = outward(side);
    let kernel = gauss_kernel(p.sigma);
    let total = w.positions.len();
    let segments = (p.segments as usize).min(total).max(1);
    let mut found: Vec<(Edge, usize)> = Vec::new();
    for k in 0..segments {
        let from = k * total / segments;
        let to = (from + 1).max((k + 1) * total / segments);
        let profile = sample_profile(img, w, is_vertical(side), from, to);
        let edges =
            find_edge_candidates(&profile, &smooth(&profile, &kernel), &p.crit, out, w.c, sign, context, p.grad_step as i64, p.near_weight, PAIR_CANDIDATES);
        found.extend(edges.into_iter().map(|edge| (edge, k)));
    }
    found.sort_by(|a, b| a.0.pos.partial_cmp(&b.0.pos).unwrap_or(Ordering::Equal));
    let gap = p.grad_step.max(2.0);
    let mut clusters: Vec<Vec<&(Edge, usize)>> = Vec::new();
    for edge in &found {
        match clusters.last_mut() {
            Some(last) if last.last().is_some_and(|prev| edge.0.pos - prev.0.pos <= gap) => last.push(edge),
            _ => clusters.push(vec![edge]),
        }
    }
    let merged: Vec<SideCandidate> = clusters
        .iter()
        .map(|members| {
            let mut positions: Vec<f32> = members.iter().map(|e| e.0.pos as f32).collect();
            sort_f32(&mut positions);
            let pos = if p.comb == "outer" { quantile(&positions, if out < 0 { 0.1 } else { 0.9 }) } else { quantile(&positions, 0.5) };
            let mut segments_seen: Vec<usize> = members.iter().map(|e| e.1).collect();
            segments_seen.sort_unstable();
            segments_seen.dedup();
            let coverage = segments_seen.len() as f64 / segments as f64;
            let mut confidences: Vec<f32> = members.iter().map(|e| e.0.conf as f32).collect();
            sort_f32(&mut confidences);
            let mut strengths: Vec<f32> = members.iter().map(|e| e.0.strength as f32).collect();
            sort_f32(&mut strengths);
            SideCandidate { value: w.base as f64 + pos + 0.5, conf: quantile(&confidences, 0.5) * coverage, strength: quantile(&strengths, 0.5) * coverage }
        })
        .collect();
    let best = merged.iter().map(|e| e.conf).fold(0.0, f64::max);
    let mut kept: Vec<SideCandidate> = merged.into_iter().filter(|e| e.conf >= best * 0.5).collect();
    kept.sort_by(|a, b| b.strength.partial_cmp(&a.strength).unwrap_or(Ordering::Equal));
    kept.truncate(PAIR_CANDIDATES);
    kept
}

/// pickAxisPair: the chosen low (L/T) and high (R/B) edges; None keeps that side where it is.
fn pick_axis_pair(
    low: &[SideCandidate],
    high: &[SideCandidate],
    current: (f64, f64),
    prefer: Option<&str>,
    pick: &str,
) -> (Option<SideCandidate>, Option<SideCandidate>) {
    if low.is_empty() && high.is_empty() {
        return (None, None);
    }
    let before = current.1 - current.0;
    let lows: Vec<Option<SideCandidate>> = if low.is_empty() { vec![None] } else { low.iter().copied().map(Some).collect() };
    let highs: Vec<Option<SideCandidate>> = if high.is_empty() { vec![None] } else { high.iter().copied().map(Some).collect() };
    // (low, high, change, moved, strength)
    let mut pairs = Vec::new();
    for l in &lows {
        for h in &highs {
            let a = l.map_or(current.0, |e| e.value);
            let b = h.map_or(current.1, |e| e.value);
            if b - a < MIN_SIZE {
                continue;
            }
            let strength = l.map_or(f64::INFINITY, |e| e.strength).min(h.map_or(f64::INFINITY, |e| e.strength));
            pairs.push((*l, *h, b - a - before, (a - current.0).abs() + (b - current.1).abs(), strength));
        }
    }
    let grouped = prefer.is_some() && !low.is_empty() && !high.is_empty();
    let preferred: Vec<_> =
        if grouped { pairs.iter().copied().filter(|pair| if prefer == Some("grow") { pair.2 >= 0.0 } else { pair.2 <= 0.0 }).collect() } else { pairs.clone() };
    let pool = if preferred.is_empty() { &pairs } else { &preferred };
    let better = |a: &(Option<SideCandidate>, Option<SideCandidate>, f64, f64, f64), b: &(Option<SideCandidate>, Option<SideCandidate>, f64, f64, f64)| {
        if pick == "strongest" {
            a.4 > b.4 || (a.4 == b.4 && a.3 < b.3)
        } else {
            a.3 < b.3 || (a.3 == b.3 && a.4 > b.4)
        }
    };
    let Some(mut best) = pool.first().copied() else {
        return (None, None);
    };
    for pair in pool {
        if better(pair, &best) {
            best = *pair;
        }
    }
    (best.0, best.1)
}

/// Position of a side in SIDES.
fn side_index(side: Side) -> usize {
    match side {
        Side::T => 0,
        Side::B => 1,
        Side::R => 2,
        Side::L => 3,
    }
}

/// Opposite sides picked as a pair: (low side, high side, mode, pick) per axis.
fn pair_axes(params: &RefineParams) -> [(Side, Side, &str, &str); 2] {
    [(Side::T, Side::B, params.pair_tb.as_str(), params.pair_tb_pick.as_str()), (Side::L, Side::R, params.pair_lr.as_str(), params.pair_lr_pick.as_str())]
}

fn refine_box(img: &GrayImage, input: &BoxInput, params: &RefineParams, neighbours: &[Rect]) -> RefineResult {
    let start = input.rect();
    let mut current = start;
    let mut side_conf = BTreeMap::new();
    let per_side: Vec<SideParams> = SIDES.iter().map(|&side| side_params(params, side)).collect();
    let widest = per_side.iter().map(|p| p.range_out).fold(f64::NEG_INFINITY, f64::max);
    let context = measure_context(img, &current, widest, params.context_ring);
    let candidates = |rect: &Rect, side: Side| {
        let p = &per_side[side_index(side)];
        let w = side_window(img, rect, side, p, neighbours);
        let polarity = resolve_polarity(p, context);
        let sign = if polarity == 0 { 0 } else { -polarity * outward(side) as i32 };
        side_candidates(img, &w, side, p, sign, context)
    };
    for iteration in 0..params.iterations as usize {
        let mut next = current;
        let mut paired = [false; 4];
        for (low, high, mode, pick) in pair_axes(params) {
            if mode == "off" || params.sides.get(low) == "off" || params.sides.get(high) == "off" {
                continue;
            }
            // First pass: the preferred kind and pick rule; later passes keep the nearest pair.
            let first = iteration == 0;
            let chosen = pick_axis_pair(
                &candidates(&current, low),
                &candidates(&current, high),
                (current.get(low), current.get(high)),
                first.then_some(mode),
                if first { pick } else { "nearest" },
            );
            for (side, edge) in [(low, chosen.0), (high, chosen.1)] {
                if let Some(edge) = edge {
                    next.set(side, edge.value);
                }
                side_conf.insert(side, edge.map_or(0.0, |e| e.conf));
                paired[side_index(side)] = true;
            }
        }
        for (index, &side) in SIDES.iter().enumerate() {
            if params.sides.get(side) == "off" || paired[index] {
                continue;
            }
            match refine_side(img, &current, side, &per_side[index], context, neighbours) {
                Some((value, conf)) => {
                    next.set(side, value);
                    side_conf.insert(side, conf);
                }
                None => {
                    side_conf.insert(side, 0.0);
                }
            }
        }
        next.x0 = next.x0.max(0.0);
        next.y0 = next.y0.max(0.0);
        next.x1 = next.x1.min(img.width as f64);
        next.y1 = next.y1.min(img.height as f64);
        if next.x1 - next.x0 < MIN_SIZE || next.y1 - next.y0 < MIN_SIZE {
            break;
        }
        // Converged: another pass over the same box would repeat exactly this result.
        let settled = next.x0 == current.x0 && next.y0 == current.y0 && next.x1 == current.x1 && next.y1 == current.y1;
        current = next;
        if settled {
            break;
        }
    }
    let weak_sides: Vec<Side> = SIDES.iter().copied().filter(|side| side_conf.get(side).copied().unwrap_or(1.0) < params.review_below).collect();
    let before = (start.x1 - start.x0) * (start.y1 - start.y0);
    let area_change = if before > 0.0 { (current.x1 - current.x0) * (current.y1 - current.y0) / before - 1.0 } else { 0.0 };
    let area_flagged =
        (params.area_grow_limit > 0.0 && area_change > params.area_grow_limit) || (params.area_shrink_limit > 0.0 && -area_change > params.area_shrink_limit);
    // JS reports sideConf in insertion order (T, B, R, L), which BTreeMap's Side order reproduces.
    let conf = if side_conf.is_empty() { 1.0 } else { side_conf.values().copied().fold(f64::INFINITY, f64::min) };
    RefineResult {
        id: input.id.clone(),
        class_id: input.class_id.clone(),
        rect: current,
        conf,
        side_conf,
        flagged: !weak_sides.is_empty() || area_flagged,
        weak_sides,
        area_change,
        area_flagged,
    }
}

/// refineBoxes: boxes run in parallel; peer outlier flags are applied afterwards in input order.
pub fn refine_boxes(img: &GrayImage, boxes: &[BoxInput], params_by_class: &HashMap<String, RefineParams>, neighbours: &[BoxInput]) -> Vec<RefineResult> {
    let mut results: Vec<RefineResult> = boxes
        .par_iter()
        .filter_map(|input| {
            let params = params_by_class.get(&input.class_id).filter(|p| p.enabled)?;
            let reach = SIDES.iter().map(|&side| side_params(params, side).range_out).fold(0.0, f64::max) * 2.0 + 1.0;
            let nearby: Vec<Rect> = if params.avoid_neighbors {
                neighbours
                    .iter()
                    .filter(|n| {
                        n.id != input.id && n.x1 >= input.x0 - reach && n.x0 <= input.x1 + reach && n.y1 >= input.y0 - reach && n.y0 <= input.y1 + reach
                    })
                    .map(BoxInput::rect)
                    .collect()
            } else {
                Vec::new()
            };
            Some(refine_box(img, input, params, &nearby))
        })
        .collect();
    flag_peer_outliers(&mut results, params_by_class);
    results
}

fn flag_peer_outliers(results: &mut [RefineResult], params_by_class: &HashMap<String, RefineParams>) {
    let mut by_class: Vec<(String, Vec<usize>)> = Vec::new();
    for (index, result) in results.iter().enumerate() {
        match by_class.iter_mut().find(|(class_id, _)| *class_id == result.class_id) {
            Some((_, members)) => members.push(index),
            None => by_class.push((result.class_id.clone(), vec![index])),
        }
    }
    for (class_id, members) in by_class {
        let tolerance = params_by_class.get(&class_id).map_or(0.0, |p| p.peer_tolerance);
        if tolerance <= 0.0 || members.len() < 3 {
            continue;
        }
        check_peers(results, &members, tolerance, false);
        check_peers(results, &members, tolerance, true);
    }
}

fn check_peers(results: &mut [RefineResult], members: &[usize], tolerance: f64, horizontal_axis: bool) {
    // horizontal_axis = false groups rows (y) and checks T/B; true groups columns (x) and checks L/R.
    let (low_side, high_side) = if horizontal_axis { (Side::L, Side::R) } else { (Side::T, Side::B) };
    let centre = |r: &RefineResult| (r.rect.get(low_side) + r.rect.get(high_side)) / 2.0;
    let mut sizes: Vec<f32> = members.iter().map(|&i| (results[i].rect.get(high_side) - results[i].rect.get(low_side)) as f32).collect();
    sort_f32(&mut sizes);
    let join = quantile(&sizes, 0.5) * 0.25;
    let mut sorted = members.to_vec();
    sorted.sort_by(|&a, &b| {
        let difference = centre(&results[a]) - centre(&results[b]);
        difference.partial_cmp(&0.0).unwrap_or(std::cmp::Ordering::Equal)
    });
    let mut start = 0;
    for i in 1..=sorted.len() {
        if i < sorted.len() && centre(&results[sorted[i]]) - centre(&results[sorted[i - 1]]) <= join {
            continue;
        }
        let group: Vec<usize> = sorted[start..i].to_vec();
        start = i;
        if group.len() < 3 {
            continue;
        }
        for side in [low_side, high_side] {
            let refined: Vec<usize> = group.iter().copied().filter(|&r| results[r].side_conf.contains_key(&side)).collect();
            if refined.len() < 3 {
                continue;
            }
            let mut values: Vec<f32> = refined.iter().map(|&r| results[r].rect.get(side) as f32).collect();
            sort_f32(&mut values);
            let mid = quantile(&values, 0.5);
            for r in refined {
                let result = &mut results[r];
                if (result.rect.get(side) - mid).abs() > tolerance && !result.weak_sides.contains(&side) {
                    result.weak_sides.push(side);
                    result.flagged = true;
                }
            }
        }
    }
}

/// toGray in edge-refine.ts: BT.601 integer weights.
pub fn to_gray(rgba: &[u8]) -> Vec<u8> {
    rgba.par_chunks_exact(4).map(|p| ((77 * p[0] as u32 + 150 * p[1] as u32 + 29 * p[2] as u32) >> 8) as u8).collect()
}
