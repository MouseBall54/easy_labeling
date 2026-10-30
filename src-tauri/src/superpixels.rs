// Native superpixels (crates/el-core/src/superpixels.rs) for the Segmentation superpixel tool. The page sends the
// image (uploaded gray or RGBA bytes, or the path of the resident TIFF); the packed result (Superpixels::pack) goes
// to src/features/segmentation/native-superpixels.ts over a shared buffer.

use crate::native::{blocking, header, upload_body};
use el_core::{preprocess, superpixels};
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Mutex;
use tauri::ipc::{Request, Response};

type CommandResult<T> = Result<T, String>;

/// The latest packed results, by run id, newest first. Two, so a superseded run that finishes late does not
/// replace the result the latest run is about to take.
static RESULTS: Mutex<Vec<(u64, Vec<u8>)>> = Mutex::new(Vec::new());
const KEPT_RESULTS: usize = 2;
static NEXT_RUN: AtomicU64 = AtomicU64::new(1);

/// Computes and stores the packed result; returns the run id the page takes it with.
async fn run(
    luma: impl FnOnce() -> CommandResult<(Vec<f32>, usize, usize)> + Send + 'static,
    region_size: usize,
    settings: superpixels::Settings,
) -> CommandResult<u64> {
    let packed = blocking(move || {
        let (luma, width, height) = luma()?;
        if luma.len() != width * height || luma.is_empty() {
            return Err("Superpixel image size does not match its dimensions".into());
        }
        Ok(superpixels::slico(&luma, width, height, region_size, 5, &settings).pack())
    })
    .await?;
    let id = NEXT_RUN.fetch_add(1, Ordering::Relaxed);
    let mut results = RESULTS.lock().map_err(|error| error.to_string())?;
    results.insert(0, (id, packed));
    results.truncate(KEPT_RESULTS);
    Ok(id)
}

/// Uploaded pixels: `x-format` "gray" (one byte per pixel, drawn as R = G = B) or "rgba".
#[tauri::command]
pub async fn superpixels_run(window: tauri::WebviewWindow, request: Request<'_>) -> CommandResult<u64> {
    let width: usize = header(&request, "x-width")?.parse().map_err(|_| "Invalid width")?;
    let height: usize = header(&request, "x-height")?.parse().map_err(|_| "Invalid height")?;
    let region_size: usize = header(&request, "x-region-size")?.parse().map_err(|_| "Invalid region size")?;
    let settings: superpixels::Settings = serde_json::from_str(&crate::percent_decode(header(&request, "x-settings")?)?).map_err(|error| error.to_string())?;
    let gray = match header(&request, "x-format")? {
        "gray" => true,
        "rgba" => false,
        other => return Err(format!("Unknown pixel format {other}")),
    };
    let bytes = upload_body(&window, &request).await?;
    run(move || Ok((if gray { preprocess::gray_luma(&bytes) } else { preprocess::rgba_luma(&bytes) }, width, height)), region_size, settings).await
}

/// The resident natively decoded TIFF at `path` (tiff_image.rs).
#[tauri::command]
pub async fn superpixels_run_tiff(path: String, region_size: usize, settings: superpixels::Settings) -> CommandResult<u64> {
    run(
        move || {
            let image = crate::tiff_image::resident_gray(&path)?;
            Ok((preprocess::gray_luma(&image.pixels), image.width as usize, image.height as usize))
        },
        region_size,
        settings,
    )
    .await
}

/// A copy of the run's result: kept until newer runs replace it, so the raw path can still read it after a failed
/// shared transfer.
fn take(id: u64) -> CommandResult<Vec<u8>> {
    let results = RESULTS.lock().map_err(|error| error.to_string())?;
    results.iter().find(|(stored, _)| *stored == id).map(|(_, packed)| packed.clone()).ok_or_else(|| "Superpixel result is no longer available".into())
}

#[tauri::command]
pub async fn superpixels_take(id: u64) -> CommandResult<Response> {
    Ok(Response::new(take(id)?))
}

/// Like superpixels_take, but posts the bytes in a shared buffer and returns its id.
#[tauri::command]
pub async fn superpixels_take_shared(window: tauri::WebviewWindow, id: u64) -> CommandResult<u64> {
    crate::shared_buffer::post(&window, take(id)?).await
}
