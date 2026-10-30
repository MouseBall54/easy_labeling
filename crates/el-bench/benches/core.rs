//! Pure-Rust timings of el-core on SEM-sized inputs (no Tauri IPC). Inputs come from
//! `node scripts/migration/gen-golden.mjs --bench`; scripts/bench/core.mjs times the TS code on the
//! same files. Run: cargo bench -p el-bench --bench core

use criterion::{criterion_group, criterion_main, BenchmarkId, Criterion};
use el_bench::{read_bytes, read_json, BenchInput};
use el_core::{preprocess, refine};
use std::collections::{BTreeMap, HashMap};
use std::hint::black_box;
use std::time::Duration;

fn benches(c: &mut Criterion) {
    let inputs: Vec<BenchInput> = read_json("generated/manifest.json");
    let params: HashMap<String, refine::RefineParams> = read_json("generated/refine-params.json");
    let configs: HashMap<String, preprocess::PreprocessConfig> = read_json("generated/preprocess-configs.json");

    let mut group = c.benchmark_group("refine");
    group.sample_size(30).measurement_time(Duration::from_secs(10));
    for input in &inputs {
        let gray = read_bytes(&format!("generated/{}", input.image));
        let boxes: Vec<refine::BoxInput> = read_json(&format!("generated/{}", input.boxes));
        let image = refine::GrayImage { gray: &gray, width: input.width, height: input.height };
        let id = BenchmarkId::from_parameter(format!("{}x{}-{}", input.width, input.height, input.count));
        group.bench_with_input(id, &boxes, |b, boxes| b.iter(|| refine::refine_boxes(black_box(&image), boxes, &params, boxes)));
    }
    group.finish();

    let mut group = c.benchmark_group("preprocess");
    group.sample_size(30).measurement_time(Duration::from_secs(15));
    // One run per image (the manifest lists each image once per box count).
    let images: BTreeMap<&str, &BenchInput> = inputs.iter().map(|input| (input.image.as_str(), input)).collect();
    for input in images.values() {
        let gray = read_bytes(&format!("generated/{}", input.image));
        let values: Vec<f32> = gray.iter().map(|&v| v as f32).collect();
        let mut names: Vec<&String> = configs.keys().collect();
        names.sort();
        for name in names {
            let id = BenchmarkId::from_parameter(format!("{}x{}-{name}", input.width, input.height));
            group.bench_function(id, |b| b.iter(|| preprocess::preprocess_gray(values.clone(), input.width, input.height, &configs[name])));
        }
    }
    group.finish();
}

criterion_group!(core, benches);
criterion_main!(core, review_group, superpixel_group);

fn review(c: &mut Criterion) {
    let text = String::from_utf8(read_bytes("generated/review-5000.txt")).expect("utf-8");
    let settings = el_core::review::ReviewSettings { minimum_box_size_px: 4.0, duplicate_iou_threshold: 0.9, required_class_ids: vec![] };
    c.bench_function("review/5000-boxes", |b| b.iter(|| el_core::review::inspect_detection_labels(black_box(&text), 2048.0, 1536.0, &settings)));
}

criterion_group!(review_group, review);

/// Default settings, region size 16 (the panel's default); scripts/bench/core.mjs --filter superpixels times TS.
fn superpixels(c: &mut Criterion) {
    let inputs: Vec<BenchInput> = read_json("generated/manifest.json");
    let images: BTreeMap<&str, &BenchInput> = inputs.iter().map(|input| (input.image.as_str(), input)).collect();
    let settings = el_core::superpixels::Settings {
        blur: el_core::superpixels::Strength::Medium,
        contrast: el_core::superpixels::Strength::Medium,
        edge_sensitivity: el_core::superpixels::EdgeSensitivity::Medium,
    };
    let mut group = c.benchmark_group("superpixels");
    group.sample_size(10).measurement_time(Duration::from_secs(10));
    for input in images.values() {
        let luma = preprocess::gray_luma(&read_bytes(&format!("generated/{}", input.image)));
        let id = BenchmarkId::from_parameter(format!("{}x{}-r16", input.width, input.height));
        group.bench_function(id, |b| b.iter(|| el_core::superpixels::slico(black_box(&luma), input.width, input.height, 16, 5, &settings)));
    }
    group.finish();
}

criterion_group!(superpixel_group, superpixels);
