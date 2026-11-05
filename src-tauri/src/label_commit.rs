// Batch label-file edits in Rust (crates/el-core/src/label_commit.rs): backup, writes and the restore on a
// failure or a stop in one call, instead of two IPC calls per file. Progress and cancellation go through jobs.rs.

use crate::jobs::{Job, CANCELLED};
use el_core::label_commit::{commit_label_edits, CommitError, CommitTimings, LabelEdit};
use serde::Deserialize;
use std::path::Path;

/// Label files written at once (LABEL_WRITE_LANES in file-system-adapter.ts).
const WRITE_LANES: usize = 8;

/// Error prefix the page reads as "some files were not restored" (the originals stay in the backup).
const NOT_RESTORED: &str = "Label files not restored: ";

#[derive(Deserialize)]
pub struct LabelFileEdit {
    name: String,
    original: Option<String>,
    text: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LabelCommitRequest {
    job_id: String,
    folder: String,
    /// Relative to `folder`, e.g. ".easy-labeling/refine-all-<time>".
    backup_dir: String,
    created_json: Option<String>,
    edits: Vec<LabelFileEdit>,
}

#[tauri::command]
pub async fn label_files_commit(request: LabelCommitRequest) -> Result<CommitTimings, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let edits: Vec<LabelEdit> = request.edits.into_iter().map(|edit| LabelEdit { name: edit.name, original: edit.original, text: edit.text }).collect();
        let backups = edits.iter().filter(|edit| edit.original.is_some()).count();
        let job = Job::start(&request.job_id, backups + edits.len());
        commit_label_edits(
            Path::new(&request.folder),
            &request.backup_dir,
            request.created_json.as_deref(),
            &edits,
            WRITE_LANES,
            || job.cancelled(),
            || job.advance(),
        )
        .map_err(|error| match error {
            CommitError::Cancelled => CANCELLED.to_string(),
            CommitError::Failed(message) => message,
            CommitError::NotRestored(message) => format!("{NOT_RESTORED}{message}"),
        })
    })
    .await
    .map_err(|error| error.to_string())?
}
