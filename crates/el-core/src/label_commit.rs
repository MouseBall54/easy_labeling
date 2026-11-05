//! Batch label-file edits for the desktop app (commitLabelFileEdits in src/bootstrap/file-system-adapter.ts):
//! backs up the originals, writes the new texts, and on a failure or a stop puts every written file back.
//! Files go through a temporary file and a rename, as fs_write does, several at a time (a NAS costs round
//! trips per file, not bandwidth).

use std::fmt;
use std::io::ErrorKind;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, AtomicUsize, Ordering};
use std::time::Instant;

/// One label file to rewrite.
pub struct LabelEdit {
    pub name: String,
    /// The file's text before, None when the edit creates it.
    pub original: Option<String>,
    pub text: String,
}

#[derive(Debug, PartialEq)]
pub enum CommitError {
    /// Stopped; nothing changed.
    Cancelled,
    /// Failed; nothing changed (written files were put back, the backup folder removed).
    Failed(String),
    /// Failed and some files could not be put back; the originals stay in the backup folder.
    NotRestored(String),
}

impl fmt::Display for CommitError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            CommitError::Cancelled => formatter.write_str("cancelled"),
            CommitError::Failed(message) | CommitError::NotRestored(message) => formatter.write_str(message),
        }
    }
}

/// Phase times in ms.
#[derive(Debug, Default, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CommitTimings {
    pub backup_ms: u64,
    pub write_ms: u64,
}

/// Writes `bytes` to `path` through `<path>.easy-labeling-tmp` and a rename, creating parent folders.
pub fn write_file(path: &Path, bytes: &[u8]) -> std::io::Result<()> {
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)?;
    }
    let mut temporary = path.as_os_str().to_owned();
    temporary.push(".easy-labeling-tmp");
    std::fs::write(&temporary, bytes)?;
    std::fs::rename(&temporary, path).inspect_err(|_| {
        let _ = std::fs::remove_file(&temporary);
    })
}

/// Runs `work` over `0..count` on `lanes` threads. After the first error no new item starts; the running
/// ones finish. Returns that error.
fn each(count: usize, lanes: usize, work: impl Fn(usize) -> Result<(), String> + Sync) -> Result<(), String> {
    let next = AtomicUsize::new(0);
    let failure = std::sync::Mutex::new(None);
    let failed = AtomicBool::new(false);
    std::thread::scope(|scope| {
        for _ in 0..lanes.clamp(1, count.max(1)) {
            scope.spawn(|| loop {
                let index = next.fetch_add(1, Ordering::Relaxed);
                if index >= count || failed.load(Ordering::Relaxed) {
                    break;
                }
                if let Err(error) = work(index) {
                    failed.store(true, Ordering::Relaxed);
                    failure.lock().unwrap_or_else(|poisoned| poisoned.into_inner()).get_or_insert(error);
                }
            });
        }
    });
    failure.into_inner().unwrap_or_else(|poisoned| poisoned.into_inner()).map_or(Ok(()), Err)
}

/// Backs up into `folder/backup_dir` (with `created_json` as created-labels.json when edits create files),
/// then writes every edit into `folder`, `lanes` files at a time. `advance` runs once per backup and once
/// per write; `cancelled` is checked before each file.
pub fn commit_label_edits(
    folder: &Path,
    backup_dir: &str,
    created_json: Option<&str>,
    edits: &[LabelEdit],
    lanes: usize,
    cancelled: impl Fn() -> bool + Sync,
    advance: impl Fn() + Sync,
) -> Result<CommitTimings, CommitError> {
    let backup = folder.join(backup_dir);
    let io = |path: &Path, error: std::io::Error| format!("{}: {error}", path.display());
    let stop = || if cancelled() { Err(String::from("cancelled")) } else { Ok(()) };
    // Nothing of the label files changed yet: drop the partial backup and report.
    let abandon = |message: String| {
        let _ = std::fs::remove_dir_all(&backup);
        if cancelled() {
            CommitError::Cancelled
        } else {
            CommitError::Failed(message)
        }
    };
    let mut timings = CommitTimings::default();
    let started = Instant::now();
    let originals: Vec<&LabelEdit> = edits.iter().filter(|edit| edit.original.is_some()).collect();
    let backed_up = (|| {
        std::fs::create_dir_all(&backup).map_err(|error| io(&backup, error))?;
        if let Some(json) = created_json {
            let path = backup.join("created-labels.json");
            write_file(&path, json.as_bytes()).map_err(|error| io(&path, error))?;
        }
        each(originals.len(), lanes, |index| {
            stop()?;
            let edit = originals[index];
            let path = backup.join(&edit.name);
            write_file(&path, edit.original.as_deref().unwrap_or_default().as_bytes()).map_err(|error| io(&path, error))?;
            advance();
            Ok(())
        })
    })();
    backed_up.map_err(abandon)?;
    timings.backup_ms = started.elapsed().as_millis() as u64;

    let started = Instant::now();
    // Only files whose write succeeded changed: a failed write leaves the target as it was (temporary file,
    // then one rename that either replaces it or fails).
    let written: Vec<AtomicBool> = edits.iter().map(|_| AtomicBool::new(false)).collect();
    let result = each(edits.len(), lanes, |index| {
        stop()?;
        let edit = &edits[index];
        let path = folder.join(&edit.name);
        write_file(&path, edit.text.as_bytes()).map_err(|error| io(&path, error))?;
        written[index].store(true, Ordering::Relaxed);
        advance();
        Ok(())
    });
    if let Err(message) = result {
        let restore = |edit: &LabelEdit| -> std::io::Result<()> {
            let path: PathBuf = folder.join(&edit.name);
            match &edit.original {
                Some(text) => write_file(&path, text.as_bytes()),
                None => std::fs::remove_file(&path).or_else(|error| if error.kind() == ErrorKind::NotFound { Ok(()) } else { Err(error) }),
            }
        };
        let unrestored: Vec<String> = edits
            .iter()
            .zip(&written)
            .filter(|(_, written)| written.load(Ordering::Relaxed))
            .filter_map(|(edit, _)| restore(edit).err().map(|error| format!("{}: {error}", edit.name)))
            .collect();
        if !unrestored.is_empty() {
            return Err(CommitError::NotRestored(format!("{message}; not restored: {}", unrestored.join("; "))));
        }
        return Err(abandon(message));
    }
    timings.write_ms = started.elapsed().as_millis() as u64;
    Ok(timings)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn scratch(name: &str) -> PathBuf {
        let folder = std::env::temp_dir().join(format!("el-label-commit-{name}-{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&folder);
        std::fs::create_dir_all(&folder).expect("scratch folder");
        folder
    }

    fn edits(folder: &Path, count: usize) -> Vec<LabelEdit> {
        (0..count)
            .map(|index| {
                let name = format!("{index}.txt");
                let original = format!("0 0.5 0.5 0.1 0.{index}\n");
                std::fs::write(folder.join(&name), &original).expect("original");
                LabelEdit { name, original: Some(original), text: format!("1 0.5 0.5 0.2 0.{index}\n") }
            })
            .collect()
    }

    #[test]
    fn backs_up_then_writes_every_file() {
        let folder = scratch("ok");
        let mut list = edits(&folder, 20);
        list.push(LabelEdit { name: "new.txt".into(), original: None, text: "2 0.5 0.5 0.1 0.1\n".into() });
        let steps = AtomicUsize::new(0);
        commit_label_edits(
            &folder,
            ".easy-labeling/test-1",
            Some("[\"new.txt\"]"),
            &list,
            8,
            || false,
            || {
                steps.fetch_add(1, Ordering::Relaxed);
            },
        )
        .expect("commit");
        assert_eq!(steps.into_inner(), 20 + 21);
        for edit in &list {
            assert_eq!(std::fs::read_to_string(folder.join(&edit.name)).expect("written"), edit.text);
            if let Some(original) = &edit.original {
                assert_eq!(&std::fs::read_to_string(folder.join(".easy-labeling/test-1").join(&edit.name)).expect("backup"), original);
            }
        }
        assert_eq!(std::fs::read_to_string(folder.join(".easy-labeling/test-1/created-labels.json")).expect("created"), "[\"new.txt\"]");
        assert!(!folder.join(".easy-labeling/test-1/new.txt").exists());
        let _ = std::fs::remove_dir_all(&folder);
    }

    #[test]
    fn a_failed_write_puts_every_file_back() {
        let folder = scratch("fail");
        let mut list = edits(&folder, 12);
        list.push(LabelEdit { name: "new.txt".into(), original: None, text: "2\n".into() });
        // A folder where a label file should go: its write fails.
        std::fs::create_dir_all(folder.join("blocked.txt")).expect("blocker");
        list.insert(6, LabelEdit { name: "blocked.txt".into(), original: None, text: "x".into() });
        let error = commit_label_edits(&folder, ".easy-labeling/test-2", None, &list, 4, || false, || {}).expect_err("must fail");
        assert!(matches!(error, CommitError::Failed(_)), "{error:?}");
        for edit in list.iter().filter(|edit| edit.name != "blocked.txt") {
            let path = folder.join(&edit.name);
            match &edit.original {
                Some(original) => assert_eq!(&std::fs::read_to_string(&path).expect("restored"), original),
                None => assert!(!path.exists(), "{} should be removed", edit.name),
            }
        }
        assert!(!folder.join(".easy-labeling/test-2").exists(), "the partial backup is removed");
        let _ = std::fs::remove_dir_all(&folder);
    }

    #[test]
    fn a_stop_changes_nothing() {
        let folder = scratch("stop");
        let list = edits(&folder, 30);
        let calls = AtomicUsize::new(0);
        // Stops during the writes (after the 30 backups and a few writes).
        let error =
            commit_label_edits(&folder, ".easy-labeling/test-3", None, &list, 4, || calls.fetch_add(1, Ordering::Relaxed) > 35, || {}).expect_err("stopped");
        assert_eq!(error, CommitError::Cancelled);
        for edit in &list {
            assert_eq!(std::fs::read_to_string(folder.join(&edit.name)).expect("kept"), edit.original.clone().unwrap_or_default());
        }
        let _ = std::fs::remove_dir_all(&folder);
    }
}
