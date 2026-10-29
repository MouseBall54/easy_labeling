//! Golden equivalence: el-core must reproduce the TS outputs stored under fixtures/. The TS code
//! is the reference; on a mismatch fix the Rust side (see docs/migration/DECISIONS.md for TS bugs).

use el_bench::{read_bytes, read_f32, read_json, PreprocessCase, RefineCase};
use el_core::{preprocess, refine};
use serde_json::Value;

/// Same bound as tests/unit/native/compute-parity.test.ts (filters run in f32 with f64 sums).
const PREPROCESS_TOLERANCE: f32 = 1e-3;
/// `toBeCloseTo(x, 9)` in the parity test: |difference| < 0.5e-9.
const REFINE_TOLERANCE: f64 = 0.5e-9;

#[test]
fn golden_preprocess() {
    let cases: Vec<PreprocessCase> = read_json("preprocess/cases.json");
    assert!(!cases.is_empty());
    let mut failures = Vec::new();
    for case in &cases {
        let input = read_f32(&format!("preprocess/{}", case.input));
        let expected = read_f32(&format!("preprocess/{}", case.output));
        let actual = preprocess::preprocess_gray(input, case.width, case.height, &case.config);
        if actual.len() != expected.len() {
            failures.push(format!("{}: length {} != {}", case.name, actual.len(), expected.len()));
            continue;
        }
        let worst = actual
            .iter()
            .zip(&expected)
            .enumerate()
            .map(|(index, (a, e))| (index, if a.is_nan() && e.is_nan() { 0.0 } else { (a - e).abs() }))
            .fold((0, 0f32), |best, item| if item.1 > best.1 || item.1.is_nan() { item } else { best });
        if worst.1 > PREPROCESS_TOLERANCE || worst.1.is_nan() {
            failures.push(format!("{}: worst |diff| {} at pixel {}", case.name, worst.1, worst.0));
        }
    }
    assert!(failures.is_empty(), "{} of {} preprocess cases differ:\n{}", failures.len(), cases.len(), failures.join("\n"));
}

/// Compares JSON trees: same keys and lengths, numbers within `REFINE_TOLERANCE`, everything else equal.
fn compare(path: &str, expected: &Value, actual: &Value, out: &mut Vec<String>) {
    match (expected, actual) {
        (Value::Number(e), Value::Number(a)) => {
            let (e, a) = (e.as_f64().unwrap_or(f64::NAN), a.as_f64().unwrap_or(f64::NAN));
            if (e - a).abs() >= REFINE_TOLERANCE {
                out.push(format!("{path}: {a} != {e}"));
            }
        }
        (Value::Object(e), Value::Object(a)) => {
            let mut keys: Vec<&String> = e.keys().chain(a.keys()).collect();
            keys.sort();
            keys.dedup();
            for key in keys {
                match (e.get(key), a.get(key)) {
                    (Some(ev), Some(av)) => compare(&format!("{path}.{key}"), ev, av, out),
                    (Some(_), None) => out.push(format!("{path}.{key}: missing in Rust output")),
                    (None, Some(_)) => out.push(format!("{path}.{key}: extra in Rust output")),
                    (None, None) => {}
                }
            }
        }
        (Value::Array(e), Value::Array(a)) if e.len() == a.len() => {
            for (index, (ev, av)) in e.iter().zip(a).enumerate() {
                compare(&format!("{path}[{index}]"), ev, av, out);
            }
        }
        (Value::Array(e), Value::Array(a)) => out.push(format!("{path}: {} items != {}", a.len(), e.len())),
        _ if expected == actual => {}
        _ => out.push(format!("{path}: {actual} != {expected}")),
    }
}

#[test]
fn golden_refine() {
    let cases: Vec<RefineCase> = read_json("refine/cases.json");
    assert!(cases.iter().any(|case| case.boxes.len() >= 500), "fixtures need a 500+ box case");
    let mut failures = Vec::new();
    for case in &cases {
        let gray = read_bytes(&format!("refine/{}", case.image));
        assert_eq!(gray.len(), case.width * case.height, "{}: image size", case.name);
        let image = refine::GrayImage { gray: &gray, width: case.width, height: case.height };
        let neighbours = case.neighbours.as_deref().unwrap_or(&case.boxes);
        let actual = serde_json::to_value(refine::refine_boxes(&image, &case.boxes, &case.params_by_class, neighbours)).expect("results serialize");
        let mut differences = Vec::new();
        compare("", &case.expected, &actual, &mut differences);
        if !differences.is_empty() {
            failures.push(format!("{} ({} differences, first 5):\n  {}", case.name, differences.len(), differences[..differences.len().min(5)].join("\n  ")));
        }
    }
    assert!(failures.is_empty(), "{} of {} refine cases differ:\n{}", failures.len(), cases.len(), failures.join("\n"));
}

/// The Processed view: RGBA -> luma -> preprocess -> bytes must equal the gray channel that
/// preprocessSegmentationImage writes, byte for byte (the desktop app shows these bytes).
#[test]
fn golden_view() {
    let cases: Vec<PreprocessCase> = read_json("view/cases.json");
    assert!(!cases.is_empty());
    let mut failures = Vec::new();
    for case in &cases {
        let rgba = read_bytes(&format!("view/{}", case.input));
        let expected = read_bytes(&format!("view/{}", case.output));
        let luma = preprocess::rgba_luma(&rgba);
        let actual = preprocess::to_bytes(&preprocess::preprocess_gray(luma, case.width, case.height, &case.config));
        assert_eq!(expected.len(), actual.len() * 4, "{}: size", case.name);
        let differing: Vec<usize> = actual.iter().enumerate().filter(|(i, v)| expected[i * 4] != **v).map(|(i, _)| i).collect();
        if let Some(&first) = differing.first() {
            failures.push(format!("{}: {} pixels differ, first at {first} ({} != {})", case.name, differing.len(), actual[first], expected[first * 4]));
        }
    }
    assert!(failures.is_empty(), "{} of {} view cases differ:\n{}", failures.len(), cases.len(), failures.join("\n"));
}

/// Review findings must equal the TS output exactly (strings, order, numbers).
#[test]
fn golden_review() {
    let cases: Vec<el_bench::ReviewCase> = read_json("review/cases.json");
    assert!(cases.iter().any(|case| case.text.lines().count() >= 500), "fixtures need a 500+ box case");
    let failures: Vec<String> = cases
        .iter()
        .filter_map(|case| {
            let actual = serde_json::to_value(el_core::review::inspect_detection_labels(&case.text, case.width, case.height, &case.settings))
                .expect("finding serializes");
            let rows = el_core::review_folder::count_label_rows(&case.text);
            (actual != case.expected || rows != case.rows)
                .then(|| format!("{}: rows {rows} (ts {})\n  rust {actual}\n  ts   {}", case.name, case.rows, case.expected))
        })
        .collect();
    assert!(failures.is_empty(), "{} of {} review cases differ:\n{}", failures.len(), cases.len(), failures.join("\n"));
}

/// parseFloat and Number#toString, bit for bit, against values JS produced.
#[test]
fn golden_js_semantics() {
    let cases: el_bench::JsCases = read_json("review/js.json");
    let mut failures = Vec::new();
    for case in &cases.parse_float {
        let (expected, actual) = (el_bench::f64_from_hex(&case.bits), el_core::js::parse_float(&case.input));
        if !(expected.to_bits() == actual.to_bits() || (expected.is_nan() && actual.is_nan())) {
            failures.push(format!("parseFloat({:?}) = {actual:e}, JS {expected:e}", case.input));
        }
    }
    for case in &cases.number_to_string {
        let actual = el_core::js::number_to_string(el_bench::f64_from_hex(&case.bits));
        if actual != case.text {
            failures.push(format!("String({}) = {actual:?}, JS {:?}", case.bits, case.text));
        }
    }
    assert!(failures.is_empty(), "{}", failures.join("\n"));
}
