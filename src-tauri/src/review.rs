// Folder-wide label review in Rust (crates/el-core/src/review_folder.rs) for the Review task. The page
// sends the image paths and any unsaved label text; images whose size needs a full decode come back
// as null and are reviewed on the TS path. Progress and cancellation go through jobs.rs.

use crate::jobs::{Job, CANCELLED};
use el_core::review::{ReviewFinding, ReviewSettings};
use el_core::review_folder::{review_images, FileStamp, FolderImage, ReviewError};
use serde::Deserialize;
use std::path::PathBuf;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ReviewImage {
    name: String,
    path: String,
    edited_text: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ReviewFolderRequest {
    job_id: String,
    label_folder: Option<String>,
    images: Vec<ReviewImage>,
    settings: ReviewSettings,
}

#[tauri::command]
pub async fn review_folder(request: ReviewFolderRequest) -> Result<Vec<Option<ReviewFinding>>, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let job = Job::start(&request.job_id, request.images.len());
        let images: Vec<FolderImage> =
            request.images.into_iter().map(|image| FolderImage { name: image.name, path: PathBuf::from(image.path), edited_text: image.edited_text }).collect();
        let label_folder = request.label_folder.map(PathBuf::from);
        review_images(label_folder.as_deref(), &images, &request.settings, || job.cancelled(), || job.advance()).map_err(|error| match error {
            ReviewError::Cancelled => CANCELLED.to_string(),
            ReviewError::Io(message) => message,
        })
    })
    .await
    .map_err(|error| error.to_string())?
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ReviewStampsRequest {
    label_folder: Option<String>,
    images: Vec<ReviewImage>,
}

/// Label and image file stamps per image, so the Review task rechecks only images whose files changed.
#[tauri::command]
pub async fn review_stamps(request: ReviewStampsRequest) -> Result<Vec<(FileStamp, FileStamp)>, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let images: Vec<FolderImage> =
            request.images.into_iter().map(|image| FolderImage { name: image.name, path: PathBuf::from(image.path), edited_text: None }).collect();
        el_core::review_folder::review_stamps(request.label_folder.map(PathBuf::from).as_deref(), &images)
    })
    .await
    .map_err(|error| error.to_string())
}

/// Label rows per `.txt` file of a label folder, for the image list's status and filters.
#[tauri::command]
pub async fn label_row_counts(folder: String) -> Result<std::collections::HashMap<String, usize>, String> {
    tauri::async_runtime::spawn_blocking(move || {
        el_core::review_folder::label_row_counts(std::path::Path::new(&folder)).map(|counts| counts.into_iter().collect()).map_err(|error| error.to_string())
    })
    .await
    .map_err(|error| error.to_string())?
}
