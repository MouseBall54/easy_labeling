// Native refine: box refinement and its preprocessing run in Rust (crates/el-core) instead of the
// refine worker. src/features/refine/native-refine-worker.ts keeps the worker's message protocol.

use el_core::{preprocess, refine};
use serde::Deserialize;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tauri::ipc::{InvokeBody, Request, Response};

type CommandResult<T> = Result<T, String>;

struct RefineImage {
    key: String,
    gray: Arc<Vec<u8>>,
    width: usize,
    height: usize,
    /// The processed view of the image for one preprocessing config key.
    processed: Option<(String, Arc<Vec<u8>>)>,
}

static REFINE_IMAGE: Mutex<Option<RefineImage>> = Mutex::new(None);

fn header<'a>(request: &'a Request<'_>, name: &str) -> CommandResult<&'a str> {
    request.headers().get(name).and_then(|value| value.to_str().ok()).ok_or_else(|| format!("Missing {name} header"))
}

fn raw_body(request: &Request<'_>) -> CommandResult<Vec<u8>> {
    match request.body() {
        InvokeBody::Raw(bytes) => Ok(bytes.clone()),
        InvokeBody::Json(_) => Err("Expected raw pixel data".into()),
    }
}

async fn blocking<T: Send + 'static>(work: impl FnOnce() -> CommandResult<T> + Send + 'static) -> CommandResult<T> {
    tauri::async_runtime::spawn_blocking(work).await.map_err(|error| error.to_string())?
}

#[tauri::command]
pub async fn refine_load_image(request: Request<'_>) -> CommandResult<()> {
    let key = crate::percent_decode(header(&request, "x-key")?)?;
    let width: usize = header(&request, "x-width")?.parse().map_err(|_| "Invalid width")?;
    let height: usize = header(&request, "x-height")?.parse().map_err(|_| "Invalid height")?;
    let gray = raw_body(&request)?;
    if gray.len() != width * height {
        return Err("Refine image size does not match its dimensions".into());
    }
    *REFINE_IMAGE.lock().map_err(|error| error.to_string())? = Some(RefineImage { key, gray: Arc::new(gray), width, height, processed: None });
    Ok(())
}

/// Which pixels a request reads: { kind: "original" } or { kind: "processed", config, configKey }.
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RefineSource {
    kind: String,
    config: Option<preprocess::PreprocessConfig>,
    config_key: Option<String>,
}

/// The gray pixels for a source, computing (and caching) the processed view on the full frame.
fn source_pixels(key: &str, source: &RefineSource) -> CommandResult<(Arc<Vec<u8>>, usize, usize)> {
    let (gray, width, height, cached) = {
        let guard = REFINE_IMAGE.lock().map_err(|error| error.to_string())?;
        let image = guard.as_ref().filter(|image| image.key == key).ok_or("Refine image is not loaded")?;
        let cached = image.processed.clone();
        (image.gray.clone(), image.width, image.height, cached)
    };
    if source.kind != "processed" {
        return Ok((gray, width, height));
    }
    let config = source.config.as_ref().ok_or("Processed refine source needs a config")?;
    let config_key = source.config_key.clone().unwrap_or_default();
    if let Some((_, pixels)) = cached.filter(|(cached_key, _)| *cached_key == config_key) {
        return Ok((pixels, width, height));
    }
    let values: Vec<f32> = gray.iter().map(|&v| v as f32).collect();
    let pixels = Arc::new(preprocess::to_bytes(&preprocess::preprocess_gray(values, width, height, config)));
    let mut guard = REFINE_IMAGE.lock().map_err(|error| error.to_string())?;
    if let Some(image) = guard.as_mut().filter(|image| image.key == key) {
        image.processed = Some((config_key, pixels.clone()));
    }
    Ok((pixels, width, height))
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RefineRequest {
    key: String,
    boxes: Vec<refine::BoxInput>,
    params_by_class: HashMap<String, refine::RefineParams>,
    neighbours: Vec<refine::BoxInput>,
    source: RefineSource,
}

#[tauri::command]
pub async fn refine_run(request: RefineRequest) -> CommandResult<Vec<refine::RefineResult>> {
    blocking(move || {
        let (pixels, width, height) = source_pixels(&request.key, &request.source)?;
        let image = refine::GrayImage { gray: &pixels, width, height };
        Ok(refine::refine_boxes(&image, &request.boxes, &request.params_by_class, &request.neighbours))
    })
    .await
}

#[derive(Deserialize)]
pub struct CropRect {
    x0: usize,
    y0: usize,
    x1: usize,
    y1: usize,
}

/// Raw gray bytes of rect (already clamped by the caller), row-major.
#[tauri::command]
pub async fn refine_crop(key: String, rect: CropRect, source: RefineSource) -> CommandResult<Response> {
    blocking(move || {
        let (pixels, width, height) = source_pixels(&key, &source)?;
        if rect.x1 > width || rect.y1 > height || rect.x0 >= rect.x1 || rect.y0 >= rect.y1 {
            return Err("Crop rectangle is outside the image".into());
        }
        let mut out = Vec::with_capacity((rect.x1 - rect.x0) * (rect.y1 - rect.y0));
        for y in rect.y0..rect.y1 {
            out.extend_from_slice(&pixels[y * width + rect.x0..y * width + rect.x1]);
        }
        Ok(Response::new(out))
    })
    .await
}
