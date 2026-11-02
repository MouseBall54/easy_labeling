// Long-running native work the page can watch and stop. The page names a job (`jobId` in the
// request), polls `job_progress` while the command runs and may call `job_cancel`; the command
// checks `Job::cancelled` between work items and reports with `Job::advance`. Polling keeps the page
// side free of Tauri's channel internals (the frontend talks to Tauri without @tauri-apps/api).

use serde::Serialize;
use std::collections::HashMap;
use std::sync::atomic::{AtomicBool, AtomicUsize, Ordering};
use std::sync::{Arc, Mutex};

/// Error text a cancelled command returns; the page treats it as a cancellation, not a failure.
pub const CANCELLED: &str = "Native job cancelled";

#[derive(Default)]
struct JobState {
    cancelled: AtomicBool,
    done: AtomicUsize,
    total: AtomicUsize,
}

static JOBS: Mutex<Option<HashMap<String, Arc<JobState>>>> = Mutex::new(None);

fn with_jobs<T>(work: impl FnOnce(&mut HashMap<String, Arc<JobState>>) -> T) -> T {
    let mut guard = JOBS.lock().unwrap_or_else(|poisoned| poisoned.into_inner());
    work(guard.get_or_insert_with(HashMap::new))
}

/// A running job; unregisters itself when dropped.
pub struct Job {
    id: String,
    state: Arc<JobState>,
}

impl Job {
    /// Registers `id` with `total` work items. A cancel that arrived before the start still counts.
    pub fn start(id: &str, total: usize) -> Job {
        let state = with_jobs(|jobs| jobs.entry(id.to_string()).or_default().clone());
        state.total.store(total, Ordering::Relaxed);
        Job { id: id.to_string(), state }
    }

    pub fn cancelled(&self) -> bool {
        self.state.cancelled.load(Ordering::Relaxed)
    }

    /// Marks one more work item done.
    pub fn advance(&self) {
        self.state.done.fetch_add(1, Ordering::Relaxed);
    }
}

impl Drop for Job {
    fn drop(&mut self) {
        with_jobs(|jobs| jobs.remove(&self.id));
    }
}

#[derive(Serialize)]
pub struct JobProgress {
    done: usize,
    total: usize,
}

/// Progress of a running job, or null when it has not started or has finished.
#[tauri::command]
pub fn job_progress(id: String) -> Option<JobProgress> {
    with_jobs(|jobs| jobs.get(&id).map(|state| JobProgress { done: state.done.load(Ordering::Relaxed), total: state.total.load(Ordering::Relaxed) }))
}

/// Asks a job to stop. Unknown ids are remembered briefly, in case the cancel overtakes the start.
#[tauri::command]
pub fn job_cancel(id: String) {
    with_jobs(|jobs| {
        // ponytail: a cancel for a job that never starts leaves one small entry behind; drop the
        // oldest if this ever grows (it needs a page that cancels jobs it never ran).
        jobs.entry(id).or_default().cancelled.store(true, Ordering::Relaxed);
    });
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reports_progress_and_honours_early_cancels() {
        let job = Job::start("a", 3);
        job.advance();
        let progress = job_progress("a".into()).expect("running");
        assert_eq!((progress.done, progress.total), (1, 3));
        assert!(!job.cancelled());
        job_cancel("a".into());
        assert!(job.cancelled());
        drop(job);
        assert!(job_progress("a".into()).is_none());

        job_cancel("b".into());
        assert!(Job::start("b", 1).cancelled());
    }
}
