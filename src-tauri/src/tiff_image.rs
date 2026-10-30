// TIFF images for the viewer (crates/el-core/src/tiff_gray.rs): Rust reads and decodes the file itself
// and hands the page an 8-bit gray BMP for its <img>, skipping the file read over IPC and tiff.js's
// canvas-to-PNG round trip. Files outside the native scope return NOT_NATIVE; the page then uses tiff.js.
// The last decoded image stays resident, so the Processed view, refine and automation read it instead of an upload.

use el_core::tiff_gray::Gray8;
use std::io::BufReader;
use std::sync::{Arc, Mutex};
use tauri::ipc::Response;

type CommandResult<T> = Result<T, String>;

/// Matches the check in src/features/images/native-tiff.ts.
const NOT_NATIVE: &str = "Not a natively decoded TIFF";

/// The last TIFF decoded here, by path (one image is resident).
static RESIDENT: Mutex<Option<(String, Arc<Gray8>)>> = Mutex::new(None);

fn decode(path: &str) -> CommandResult<Arc<Gray8>> {
    let file = std::fs::File::open(path).map_err(|error| format!("{path}: {error}"))?;
    let image = Arc::new(el_core::tiff_gray::decode_gray8(BufReader::new(file)).ok_or(NOT_NATIVE)?);
    *RESIDENT.lock().map_err(|error| error.to_string())? = Some((path.to_owned(), image.clone()));
    Ok(image)
}

/// The gray pixels of the TIFF at path: the resident image when it is that file, else decoded again
/// (a dimension scan may have decoded other files since the page showed this one). Blocking.
pub fn resident_gray(path: &str) -> CommandResult<Arc<Gray8>> {
    let resident = RESIDENT.lock().map_err(|error| error.to_string())?.as_ref().filter(|(resident, _)| resident == path).map(|(_, image)| image.clone());
    resident.map_or_else(|| decode(path), Ok)
}

async fn tiff_bmp_bytes(path: String) -> CommandResult<Vec<u8>> {
    tauri::async_runtime::spawn_blocking(move || {
        let image = decode(&path)?;
        Ok(el_core::bmp::gray8_bmp(image.width, image.height, &image.pixels))
    })
    .await
    .map_err(|error| error.to_string())?
}

#[tauri::command]
pub async fn tiff_bmp(path: String) -> CommandResult<Response> {
    Ok(Response::new(tiff_bmp_bytes(path).await?))
}

/// Like tiff_bmp, but posts the bytes in a shared buffer and returns its id.
#[tauri::command]
pub async fn tiff_bmp_shared(window: tauri::WebviewWindow, path: String) -> CommandResult<u64> {
    crate::shared_buffer::post(&window, tiff_bmp_bytes(path).await?).await
}

/// The gray bytes (row-major) of the TIFF at path, for automation's Original input.
async fn tiff_gray_bytes(path: String) -> CommandResult<Vec<u8>> {
    tauri::async_runtime::spawn_blocking(move || Ok(resident_gray(&path)?.pixels.clone())).await.map_err(|error| error.to_string())?
}

#[tauri::command]
pub async fn tiff_gray(path: String) -> CommandResult<Response> {
    Ok(Response::new(tiff_gray_bytes(path).await?))
}

/// Like tiff_gray, but posts the bytes in a shared buffer and returns its id.
#[tauri::command]
pub async fn tiff_gray_shared(window: tauri::WebviewWindow, path: String) -> CommandResult<u64> {
    crate::shared_buffer::post(&window, tiff_gray_bytes(path).await?).await
}
