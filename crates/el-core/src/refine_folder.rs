//! Refine's folder run (All images in folder) for the desktop app: reads each image's YOLO file, decodes
//! the image and refines its boxes, images in parallel. Mirrors the edge branch of runFolder in
//! src/bootstrap/refine-controller.ts and src/domain/refine/label-file.ts; the page still writes the new
//! rows (yoloRow) from the moved boxes this returns.
//!
//! Only images whose pixels match what the page decodes are done here: 8-bit gray TIFFs (as
//! tiff_gray, the app's native TIFF path) and PNGs that Chromium draws unchanged (8-bit gray or RGB, or
//! palette, without transparency, colour management, Exif or animation). Every other image comes back
//! as None and is refined on the TS path: JPEG decoders differ in their pixels, and Chromium converts
//! colour-managed PNGs.

use crate::preprocess::{self, PreprocessConfig};
use crate::refine::{refine_boxes, BoxInput, GrayImage, Rect, RefineParams, RefineResult};
use crate::review_folder::read_text;
use crate::{js, tiff_gray};
use serde::Serialize;
use std::collections::HashMap;
use std::fs::File;
use std::io::{BufRead, BufReader, Seek};
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, AtomicUsize, Ordering};
use std::sync::Mutex;

/// A box counts as moved when any edge moved this far (px); LABEL_FILE_MOVE_EPSILON in label-file.ts.
const MOVE_EPSILON: f64 = 1e-6;

/// A refined box to write back: its line, class and new bounds (LabelFileChange).
#[derive(Serialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Change {
    pub line: usize,
    pub class_id: String,
    #[serde(rename = "box")]
    pub rect: Rect,
}

/// One image's outcome.
#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct FolderResult {
    /// The label file's text (`File.text()`), None when there is none.
    pub original: Option<String>,
    /// Image size; 0 when the file had no box, so the image was not opened.
    pub width: usize,
    pub height: usize,
    /// Boxes read from the file, which the page checks against its own reading.
    pub box_count: usize,
    pub changes: Vec<Change>,
    /// With `FolderSettings::details`: the full result of every box that moved or was flagged (a dry run's summary).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub details: Option<Vec<RefineResult>>,
}

pub struct FolderImage {
    pub path: PathBuf,
    /// The label file's name in the label folder.
    pub label: String,
}

#[derive(Debug, PartialEq)]
pub enum FolderError {
    Cancelled,
    Io(String),
}

/// labelFileBoxes: rows of exactly five fields whose four numbers (`Number()`) are finite with a positive
/// size, as boxes in pixels with the line index as id. None (left to the TS path) when a number is beyond
/// what `js::number` reproduces or a corner overflows to infinity, which the TS path keeps as it is.
pub fn label_file_boxes(text: &str, width: f64, height: f64) -> Option<Vec<BoxInput>> {
    let mut boxes = Vec::new();
    // `split(/\r?\n/)`: a "\r" is dropped only before a "\n", so the last line keeps a trailing one.
    let mut lines = text.split('\n').peekable();
    let mut index = 0;
    while let Some(raw) = lines.next() {
        let line = if lines.peek().is_some() { raw.strip_suffix('\r').unwrap_or(raw) } else { raw };
        // `line.trim().split(/\s+/)`: after the trim no run of whitespace is at either end.
        let fields: Vec<&str> = js::trim(line).split(js::is_whitespace).filter(|field| !field.is_empty()).collect();
        if fields.len() == 5 {
            let mut numbers = [0.0; 4];
            for (slot, field) in numbers.iter_mut().zip(&fields[1..]) {
                *slot = js::number(field)?;
            }
            let [cx, cy, w, h] = numbers;
            if numbers.iter().all(|value| value.is_finite()) && w > 0.0 && h > 0.0 {
                let item = BoxInput {
                    id: index.to_string(),
                    class_id: fields[0].to_string(),
                    x0: (cx - w / 2.0) * width,
                    y0: (cy - h / 2.0) * height,
                    x1: (cx + w / 2.0) * width,
                    y1: (cy + h / 2.0) * height,
                };
                if ![item.x0, item.y0, item.x1, item.y1].iter().all(|value| value.is_finite()) {
                    return None;
                }
                boxes.push(item);
            }
        }
        index += 1;
    }
    Some(boxes)
}

fn moved(a: &Rect, b: &BoxInput) -> bool {
    !((a.x0 - b.x0).abs() < MOVE_EPSILON && (a.y0 - b.y0).abs() < MOVE_EPSILON && (a.x1 - b.x1).abs() < MOVE_EPSILON && (a.y1 - b.y1).abs() < MOVE_EPSILON)
}

/// Refines `boxes` (their own neighbours, each class with its params or the default) in file order.
pub fn refined_boxes(
    image: &GrayImage,
    boxes: &[BoxInput],
    params_by_class: &HashMap<String, RefineParams>,
    default_params: &RefineParams,
) -> Vec<RefineResult> {
    let mut params = HashMap::new();
    for item in boxes {
        params.entry(item.class_id.clone()).or_insert_with(|| params_by_class.get(&item.class_id).unwrap_or(default_params).clone());
    }
    refine_boxes(image, boxes, &params, boxes)
}

/// The results whose box moved, as changes to write, in file order.
fn changes_of(results: &[RefineResult], boxes: &[BoxInput]) -> Vec<Change> {
    let sent: HashMap<&str, &BoxInput> = boxes.iter().map(|item| (item.id.as_str(), item)).collect();
    results
        .iter()
        .filter(|result| sent.get(result.id.as_str()).is_some_and(|before| moved(&result.rect, before)))
        .filter_map(|result| Some(Change { line: result.id.parse().ok()?, class_id: result.class_id.clone(), rect: result.rect }))
        .collect()
}

/// Refines `boxes` (their own neighbours) and returns the moved ones in file order. A non-finite result
/// would cross to the page as JSON null, so the caller leaves such an image to the TS path.
pub fn changed_boxes(image: &GrayImage, boxes: &[BoxInput], params_by_class: &HashMap<String, RefineParams>, default_params: &RefineParams) -> Vec<Change> {
    changes_of(&refined_boxes(image, boxes, params_by_class, default_params), boxes)
}

/// A PNG's pixels as the page's refine reads them (toGray of the RGBA Chromium draws), or None when
/// Chromium could draw it differently from the raw samples.
pub fn png_gray8<R: BufRead + Seek>(reader: R) -> Option<tiff_gray::Gray8> {
    let mut decoder = png::Decoder::new(reader);
    decoder.set_transformations(png::Transformations::EXPAND);
    let mut reader = decoder.read_info().ok()?;
    let drawn_as_stored = |info: &png::Info| {
        info.trns.is_none()
            && info.gama_chunk.is_none()
            && info.chrm_chunk.is_none()
            && info.srgb.is_none()
            && info.icc_profile.is_none()
            && info.coding_independent_code_points.is_none()
            && info.mastering_display_color_volume.is_none()
            && info.content_light_level.is_none()
            && info.exif_metadata.is_none()
            && info.animation_control.is_none()
    };
    let info = reader.info();
    let supported = match info.color_type {
        png::ColorType::Grayscale | png::ColorType::Rgb => info.bit_depth == png::BitDepth::Eight,
        // Palette images are not checked against Chromium yet (out-of-range indices, low bit depths).
        png::ColorType::Indexed | png::ColorType::GrayscaleAlpha | png::ColorType::Rgba => false,
    };
    if !supported || !drawn_as_stored(info) {
        return None;
    }
    let (width, height) = (info.width, info.height);
    let mut buffer = vec![0; reader.output_buffer_size()?];
    let frame = reader.next_frame(&mut buffer).ok()?;
    // Chunks after the image data (eXIf may come there) are read by finish().
    reader.finish().ok()?;
    if !drawn_as_stored(reader.info()) {
        return None;
    }
    let row = frame.line_size;
    let pixels: Vec<u8> = match frame.color_type {
        png::ColorType::Grayscale => (0..height as usize).flat_map(|y| buffer[y * row..y * row + width as usize].iter().copied()).collect(),
        png::ColorType::Rgb => (0..height as usize)
            .flat_map(|y| {
                buffer[y * row..y * row + width as usize * 3]
                    .as_chunks::<3>()
                    .0
                    .iter()
                    .map(|p| ((77 * p[0] as u32 + 150 * p[1] as u32 + 29 * p[2] as u32) >> 8) as u8)
            })
            .collect(),
        _ => return None,
    };
    (pixels.len() == width as usize * height as usize).then_some(tiff_gray::Gray8 { width, height, pixels })
}

/// The image's gray pixels when this module decodes it like the page (by extension, as the page picks
/// its decoder for TIFFs), else None.
pub fn decode_gray(path: &Path) -> Option<tiff_gray::Gray8> {
    let extension = path.extension()?.to_str()?.to_ascii_lowercase();
    let reader = BufReader::new(File::open(path).ok()?);
    match extension.as_str() {
        "tif" | "tiff" => tiff_gray::decode_gray8(reader),
        "png" => png_gray8(reader),
        _ => None,
    }
}

/// What every image of a run is refined with.
pub struct FolderSettings<'a> {
    /// Params of classes whose settings differ from `default_params`.
    pub params_by_class: &'a HashMap<String, RefineParams>,
    pub default_params: &'a RefineParams,
    /// The Processed view's preprocessing, None for the original pixels.
    pub processing: Option<&'a PreprocessConfig>,
    /// Also return `FolderResult::details` (moved or flagged boxes' full results).
    pub details: bool,
}

fn refine_image(label_folder: &Path, image: &FolderImage, settings: &FolderSettings) -> Option<FolderResult> {
    // A read error other than a missing file goes to the TS path, which reports it as the TS run does.
    let Ok(text) = read_text(&label_folder.join(&image.label)) else { return None };
    let Some(text) = text else { return Some(FolderResult { original: None, width: 0, height: 0, box_count: 0, changes: Vec::new(), details: None }) };
    // A blank file is unchanged without opening the image. The TS path opens it for any other text (and
    // lists an image it cannot decode as skipped), so such a file without boxes is left to it.
    if js::trim(&text).is_empty() {
        return Some(FolderResult { original: Some(text), width: 0, height: 0, box_count: 0, changes: Vec::new(), details: None });
    }
    let box_count = label_file_boxes(&text, 1.0, 1.0)?.len();
    if box_count == 0 {
        return None;
    }
    let gray = decode_gray(&image.path)?;
    let (width, height) = (gray.width as usize, gray.height as usize);
    let boxes = label_file_boxes(&text, width as f64, height as f64)?;
    let pixels = match settings.processing {
        Some(config) => preprocess::to_bytes(&preprocess::preprocess_gray(gray.pixels.iter().map(|&v| f32::from(v)).collect(), width, height, config)),
        None => gray.pixels,
    };
    let results = refined_boxes(&GrayImage { gray: &pixels, width, height }, &boxes, settings.params_by_class, settings.default_params);
    let changes = changes_of(&results, &boxes);
    if changes.iter().any(|change| ![change.rect.x0, change.rect.y0, change.rect.x1, change.rect.y1].iter().all(|value| value.is_finite())) {
        return None;
    }
    let details = settings.details.then(|| {
        let moved_lines: std::collections::HashSet<usize> = changes.iter().map(|change| change.line).collect();
        results.into_iter().filter(|result| result.flagged || result.id.parse().is_ok_and(|line| moved_lines.contains(&line))).collect::<Vec<_>>()
    });
    // A non-finite confidence or area change would also cross as JSON null; the TS path reports such an image.
    if details.as_ref().is_some_and(|list| list.iter().any(|result| !result.conf.is_finite() || !result.area_change.is_finite())) {
        return None;
    }
    Some(FolderResult { original: Some(text), width, height, box_count, changes, details })
}

/// Refines every image's label file, `threads` images at a time; None for an image the TS path must do.
/// `advance` runs once per image; `cancelled` is checked before each.
///
/// The images run on plain threads, not a rayon pool: a rayon worker waiting inside the preprocessing's or
/// refinement's own parallel work would steal and start further images, so more than `threads` would be in
/// memory at once. Those inner loops use the global pool (every core).
pub fn refine_folder(
    label_folder: &Path,
    images: &[FolderImage],
    settings: &FolderSettings,
    threads: usize,
    cancelled: impl Fn() -> bool + Sync,
    advance: impl Fn() + Sync,
) -> Result<Vec<Option<FolderResult>>, FolderError> {
    let next = AtomicUsize::new(0);
    let stopped = AtomicBool::new(false);
    let results: Vec<Mutex<Option<FolderResult>>> = images.iter().map(|_| Mutex::new(None)).collect();
    std::thread::scope(|scope| {
        for _ in 0..threads.clamp(1, images.len().max(1)) {
            scope.spawn(|| loop {
                let index = next.fetch_add(1, Ordering::Relaxed);
                if index >= images.len() || stopped.load(Ordering::Relaxed) {
                    break;
                }
                if cancelled() {
                    stopped.store(true, Ordering::Relaxed);
                    break;
                }
                let result = refine_image(label_folder, &images[index], settings);
                *results[index].lock().unwrap_or_else(|poisoned| poisoned.into_inner()) = result;
                advance();
            });
        }
    });
    if stopped.into_inner() {
        return Err(FolderError::Cancelled);
    }
    Ok(results.into_iter().map(|slot| slot.into_inner().unwrap_or_else(|poisoned| poisoned.into_inner())).collect())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn label_rows_are_read_like_label_file_boxes() {
        let text = "0 0.5 0.5 0.2 0.4\r\n\n1 0x1 0.5 0.1 0.1 extra\n2 .5 .5 1e-1 2E-1\r\n3 0.5 0.5 0 0.1\n 4\t0.25 0.75 0.5 0.5 \r";
        let boxes = label_file_boxes(text, 100.0, 50.0).expect("readable");
        let ids: Vec<&str> = boxes.iter().map(|item| item.id.as_str()).collect();
        assert_eq!(ids, ["0", "3", "5"]);
        assert_eq!((boxes[0].x0, boxes[0].y0, boxes[0].x1, boxes[0].y1), (40.0, 15.0, 60.0, 35.0));
        // "4\t0.25 0.75 0.5 0.5 \r" is the last line: its "\r" is trimmed whitespace, not a line break.
        assert_eq!(boxes[2].class_id, "4");
        assert!(label_file_boxes("", 1.0, 1.0).expect("empty").is_empty());
        assert!(label_file_boxes(&format!("0 0x{} 0.5 0.1 0.1", "F".repeat(40)), 1.0, 1.0).is_none());
    }

    #[test]
    fn png_gray8_reads_only_pngs_drawn_as_stored() {
        let encode = |color: png::ColorType, data: &[u8], gamma: bool| {
            let mut bytes = Vec::new();
            let mut encoder = png::Encoder::new(&mut bytes, 2, 1);
            encoder.set_color(color);
            encoder.set_depth(png::BitDepth::Eight);
            if gamma {
                encoder.set_source_gamma(png::ScaledFloat::new(1.0 / 2.2));
            }
            let mut writer = encoder.write_header().expect("header");
            writer.write_image_data(data).expect("data");
            writer.finish().expect("finish");
            bytes
        };
        let gray = png_gray8(std::io::Cursor::new(encode(png::ColorType::Grayscale, &[10, 200], false))).expect("gray");
        assert_eq!(gray.pixels, [10, 200]);
        let rgb = png_gray8(std::io::Cursor::new(encode(png::ColorType::Rgb, &[255, 0, 0, 10, 20, 30], false))).expect("rgb");
        assert_eq!(rgb.pixels, [((77 * 255u32) >> 8) as u8, ((77 * 10 + 150 * 20 + 29 * 30u32) >> 8) as u8]);
        assert!(png_gray8(std::io::Cursor::new(encode(png::ColorType::Grayscale, &[10, 200], true))).is_none());
        assert!(png_gray8(std::io::Cursor::new(encode(png::ColorType::GrayscaleAlpha, &[10, 255, 200, 255], false))).is_none());
    }
}
