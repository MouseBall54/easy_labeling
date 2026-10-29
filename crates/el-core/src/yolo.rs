//! Port of parseYoloRows (src/domain/yolo/yolo.ts) for code that needs box geometry from label text.
//! Keeps its lenient semantics: fields split on single spaces and JS-trimmed, numbers read with
//! `parseFloat` (missing fields are NaN), blank lines skipped.

use crate::js;

#[derive(Clone, Debug, PartialEq)]
pub struct YoloRow {
    pub label_class: String,
    pub left: f64,
    pub top: f64,
    pub width: f64,
    pub height: f64,
}

pub fn parse_rows(text: &str, image_width: f64, image_height: f64) -> Vec<YoloRow> {
    text.split('\n')
        .filter(|line| !js::trim(line).is_empty())
        .map(|line| {
            let mut fields = line.split(' ').map(js::trim);
            let label_class = fields.next().unwrap_or_default().to_string();
            // parseFloat(String(undefined)) for a missing field is NaN.
            let mut number = || fields.next().map_or(f64::NAN, js::parse_float);
            let (x, y, w, h) = (number(), number(), number(), number());
            let width = w * image_width;
            let height = h * image_height;
            YoloRow { label_class, left: x * image_width - width / 2.0, top: y * image_height - height / 2.0, width, height }
        })
        .collect()
}
