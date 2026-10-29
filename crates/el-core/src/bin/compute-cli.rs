// Parity-test entry point: `compute-cli <op> <request.json> <input.bin> <output>`.
//   preprocess: request { width, height, config }, input f32 LE luma, output f32 LE
//   refine:     request { width, height, boxes, paramsByClass, neighbours }, input u8 gray, output JSON
//   view:       request { width, height, config }, input u8 RGBA, output u8 gray (the Processed view)
//   review:     request { settings }, input JSON [{ text, width, height }], output JSON findings
use el_core::{preprocess, refine, review};
use serde::Deserialize;
use std::collections::HashMap;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Request {
    #[serde(default)]
    width: usize,
    #[serde(default)]
    height: usize,
    settings: Option<review::ReviewSettings>,
    config: Option<preprocess::PreprocessConfig>,
    boxes: Option<Vec<refine::BoxInput>>,
    params_by_class: Option<HashMap<String, refine::RefineParams>>,
    neighbours: Option<Vec<refine::BoxInput>>,
}

#[derive(Deserialize)]
struct ReviewInput {
    text: String,
    width: f64,
    height: f64,
}

fn main() {
    let args: Vec<String> = std::env::args().collect();
    let request: Request = serde_json::from_slice(&std::fs::read(&args[2]).unwrap()).unwrap();
    let input = std::fs::read(&args[3]).unwrap();
    let started = std::time::Instant::now();
    let output = match args[1].as_str() {
        "preprocess" => {
            let values: Vec<f32> = input.as_chunks::<4>().0.iter().map(|b| f32::from_le_bytes(*b)).collect();
            let out = preprocess::preprocess_gray(values, request.width, request.height, request.config.as_ref().unwrap());
            out.iter().flat_map(|v| v.to_le_bytes()).collect::<Vec<u8>>()
        }
        "review" => {
            let cases: Vec<ReviewInput> = serde_json::from_slice(&input).unwrap();
            let settings = request.settings.as_ref().unwrap();
            let findings: Vec<_> = cases.iter().map(|case| review::inspect_detection_labels(&case.text, case.width, case.height, settings)).collect();
            serde_json::to_vec(&findings).unwrap()
        }
        "view" => {
            let luma = preprocess::rgba_luma(&input);
            preprocess::to_bytes(&preprocess::preprocess_gray(luma, request.width, request.height, request.config.as_ref().unwrap()))
        }
        "refine" => {
            let image = refine::GrayImage { gray: &input, width: request.width, height: request.height };
            let boxes = request.boxes.unwrap();
            let neighbours = request.neighbours.unwrap_or_else(|| boxes.clone());
            serde_json::to_vec(&refine::refine_boxes(&image, &boxes, &request.params_by_class.unwrap(), &neighbours)).unwrap()
        }
        other => panic!("unknown op {other}"),
    };
    eprintln!("{} ms", started.elapsed().as_millis());
    std::fs::write(&args[4], output).unwrap();
}
