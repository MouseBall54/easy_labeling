// TIFF images for the viewer (crates/el-core/src/tiff_gray.rs): Rust reads and decodes the file itself
// and hands the page an 8-bit gray BMP for its <img>, skipping the file read over IPC and tiff.js's
// canvas-to-PNG round trip. Files outside the native scope return NOT_NATIVE; the page then uses tiff.js.

use std::io::BufReader;
use tauri::ipc::Response;

type CommandResult<T> = Result<T, String>;

/// Matches the check in src/features/images/native-tiff.ts.
const NOT_NATIVE: &str = "Not a natively decoded TIFF";

async fn tiff_bmp_bytes(path: String) -> CommandResult<Vec<u8>> {
    tauri::async_runtime::spawn_blocking(move || {
        let file = std::fs::File::open(&path).map_err(|error| format!("{path}: {error}"))?;
        let image = el_core::tiff_gray::decode_gray8(BufReader::new(file)).ok_or(NOT_NATIVE)?;
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
