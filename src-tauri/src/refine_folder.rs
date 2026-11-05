// Refine's folder run in Rust (crates/el-core/src/refine_folder.rs): the page sends the image paths, the
// label folder and the settings; Rust reads, decodes and refines images in parallel and returns the
// moved boxes per image (null where the page must decode the image). Progress and cancellation go
// through jobs.rs.

use crate::jobs::{Job, CANCELLED};
use crate::native::RefineSource;
use el_core::refine::RefineParams;
use el_core::refine_folder::{refine_folder as run, FolderError, FolderImage, FolderResult, FolderSettings};
use serde::Deserialize;
use std::collections::HashMap;
use std::path::{Path, PathBuf};

/// Images refined at once. ponytail: fixed; each holds its gray image and, for a Processed run, float
/// buffers (about 60 MB at 4096x3072). Raise it when a measurement shows the reads (a NAS) waiting.
const PARALLEL_IMAGES: usize = 4;

#[derive(Deserialize)]
pub struct RefineFolderImage {
    path: String,
    label: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RefineFolderRequest {
    job_id: String,
    label_folder: String,
    images: Vec<RefineFolderImage>,
    params_by_class: HashMap<String, RefineParams>,
    default_params: RefineParams,
    source: RefineSource,
}

#[tauri::command]
pub async fn refine_folder(request: RefineFolderRequest) -> Result<Vec<Option<FolderResult>>, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let job = Job::start(&request.job_id, request.images.len());
        let images: Vec<FolderImage> = request.images.into_iter().map(|image| FolderImage { path: PathBuf::from(image.path), label: image.label }).collect();
        let settings =
            FolderSettings { params_by_class: &request.params_by_class, default_params: &request.default_params, processing: request.source.processing()? };
        run(Path::new(&request.label_folder), &images, &settings, PARALLEL_IMAGES, || job.cancelled(), || job.advance()).map_err(|error| match error {
            FolderError::Cancelled => CANCELLED.to_string(),
            FolderError::Io(message) => message,
        })
    })
    .await
    .map_err(|error| error.to_string())?
}
