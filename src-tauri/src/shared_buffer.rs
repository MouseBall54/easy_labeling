// Large pixel transfers between the page and Rust through WebView2 shared memory. Measured on
// 2026-10-29 (debug app, 4096x3072): a raw invoke body crosses WebView2 at ~17 MB/s (50 MB RGBA in
// ~3 s, unchanged with wry's 1 KB body reads enlarged) and a binary response at ~30-55 MB/s, while a
// shared buffer moves the same 50 MB in ~130 ms.
//
// Upload: the page asks for a buffer (`shared_buffer_open`), Rust posts it (`sharedbufferreceived`,
// additionalData `{"easyLabelingUpload": id}`), the page writes into it, and the command that uses the
// bytes takes them out (`take`). Download: a command copies its result into a new buffer and posts it
// (`{"easyLabelingDownload": id}`), returning the id. The COM objects are touched only on the window
// thread (`with_webview` closures), so nothing non-Send crosses threads.

use tauri::WebviewWindow;

type CommandResult<T> = Result<T, String>;

#[cfg(windows)]
mod imp {
    use super::*;
    use std::cell::RefCell;
    use std::collections::HashMap;
    use std::sync::atomic::{AtomicU64, Ordering};
    use std::sync::mpsc;
    use webview2_com::Microsoft::Web::WebView2::Win32::{
        ICoreWebView2Environment12, ICoreWebView2SharedBuffer, ICoreWebView2_17, COREWEBVIEW2_SHARED_BUFFER_ACCESS,
        COREWEBVIEW2_SHARED_BUFFER_ACCESS_READ_ONLY, COREWEBVIEW2_SHARED_BUFFER_ACCESS_READ_WRITE,
    };
    use windows_core::{Interface, HSTRING};

    thread_local! {
        // Window thread only: upload buffers posted to the page and not yet taken.
        static UPLOADS: RefCell<HashMap<u64, ICoreWebView2SharedBuffer>> = RefCell::new(HashMap::new());
    }
    static NEXT_ID: AtomicU64 = AtomicU64::new(1);
    /// Concurrent uploads in flight: the view image and the refine image, with room for retries.
    const MAX_PENDING_UPLOADS: usize = 4;

    /// Runs `work` on the window thread with the platform webview and returns its result.
    async fn on_window_thread<T: Send + 'static>(
        window: &WebviewWindow,
        work: impl FnOnce(&tauri::webview::PlatformWebview) -> CommandResult<T> + Send + 'static,
    ) -> CommandResult<T> {
        let (sender, receiver) = mpsc::channel();
        window
            .with_webview(move |webview| {
                let _ = sender.send(work(&webview));
            })
            .map_err(|error| error.to_string())?;
        tauri::async_runtime::spawn_blocking(move || receiver.recv().unwrap_or_else(|_| Err("Window thread dropped the request".to_string())))
            .await
            .map_err(|error| error.to_string())?
    }

    /// Creates a buffer of `size` bytes; `fill` writes into it before it is posted with `tag` and `id`.
    ///
    /// # Safety
    /// Must run on the window thread (inside `on_window_thread`).
    unsafe fn create_and_post(
        webview: &tauri::webview::PlatformWebview,
        size: usize,
        access: COREWEBVIEW2_SHARED_BUFFER_ACCESS,
        tag: &str,
        id: u64,
        fill: impl FnOnce(*mut u8),
    ) -> CommandResult<ICoreWebView2SharedBuffer> {
        let error = |error: windows_core::Error| error.to_string();
        let buffer = webview.environment().cast::<ICoreWebView2Environment12>().and_then(|env| env.CreateSharedBuffer(size as u64)).map_err(error)?;
        let mut data = std::ptr::null_mut();
        buffer.Buffer(&mut data).map_err(error)?;
        if data.is_null() {
            return Err("Shared buffer has no memory".into());
        }
        fill(data);
        let core = webview.controller().CoreWebView2().and_then(|core| core.cast::<ICoreWebView2_17>()).map_err(error)?;
        core.PostSharedBufferToScript(&buffer, access, &HSTRING::from(format!("{{\"{tag}\":{id}}}"))).map_err(error)?;
        Ok(buffer)
    }

    pub async fn open(window: &WebviewWindow, size: u64) -> CommandResult<u64> {
        let id = NEXT_ID.fetch_add(1, Ordering::Relaxed);
        on_window_thread(window, move |webview| {
            // SAFETY: on the window thread; the page fills the buffer, so nothing is written here.
            let buffer = unsafe { create_and_post(webview, size as usize, COREWEBVIEW2_SHARED_BUFFER_ACCESS_READ_WRITE, "easyLabelingUpload", id, |_| {}) }?;
            UPLOADS.with(|uploads| {
                let mut uploads = uploads.borrow_mut();
                // Uploads the page abandoned (it gave up or failed before the taking command) would keep
                // their memory forever; only the newest few can still be taken.
                while uploads.len() >= MAX_PENDING_UPLOADS {
                    let Some(&oldest) = uploads.keys().min() else { break };
                    // SAFETY: closing a buffer on the window thread; nothing holds its memory on our side.
                    if let Some(stale) = uploads.remove(&oldest) {
                        let _ = unsafe { stale.Close() };
                    }
                }
                uploads.insert(id, buffer);
            });
            Ok(id)
        })
        .await
    }

    pub async fn take(window: &WebviewWindow, id: u64) -> CommandResult<Vec<u8>> {
        on_window_thread(window, move |_| {
            let buffer = UPLOADS.with(|uploads| uploads.borrow_mut().remove(&id)).ok_or("Unknown shared buffer")?;
            // SAFETY: Buffer() points at Size() bytes of the mapping, valid until Close(); the copy ends
            // before Close, and the page released its view after writing.
            unsafe {
                let mut size = 0u64;
                let mut data = std::ptr::null_mut();
                buffer.Size(&mut size).and_then(|_| buffer.Buffer(&mut data)).map_err(|error| error.to_string())?;
                let bytes = if data.is_null() { Vec::new() } else { std::slice::from_raw_parts(data, size as usize).to_vec() };
                let _ = buffer.Close();
                Ok(bytes)
            }
        })
        .await
    }

    pub async fn post(window: &WebviewWindow, bytes: Vec<u8>) -> CommandResult<u64> {
        let id = NEXT_ID.fetch_add(1, Ordering::Relaxed);
        on_window_thread(window, move |webview| {
            // SAFETY: on the window thread; `fill` copies exactly bytes.len() bytes into a buffer of that size.
            // Our reference is dropped after posting; the page keeps the memory alive until it releases it.
            unsafe {
                create_and_post(webview, bytes.len(), COREWEBVIEW2_SHARED_BUFFER_ACCESS_READ_ONLY, "easyLabelingDownload", id, |data| {
                    std::ptr::copy_nonoverlapping(bytes.as_ptr(), data, bytes.len())
                })
            }?;
            Ok(id)
        })
        .await
    }
}

/// Creates an upload buffer of `size` bytes and posts it to the page; returns its id.
#[tauri::command]
pub async fn shared_buffer_open(window: WebviewWindow, size: u64) -> CommandResult<u64> {
    #[cfg(windows)]
    return imp::open(&window, size).await;
    #[cfg(not(windows))]
    {
        let _ = (window, size);
        Err("Shared buffers need WebView2".into())
    }
}

/// The bytes the page wrote into upload buffer `id`; the buffer is closed afterwards.
pub async fn take(window: &WebviewWindow, id: u64) -> CommandResult<Vec<u8>> {
    #[cfg(windows)]
    return imp::take(window, id).await;
    #[cfg(not(windows))]
    {
        let _ = (window, id);
        Err("Shared buffers need WebView2".into())
    }
}

/// Posts `bytes` to the page in a new read-only buffer; returns its id.
pub async fn post(window: &WebviewWindow, bytes: Vec<u8>) -> CommandResult<u64> {
    #[cfg(windows)]
    return imp::post(window, bytes).await;
    #[cfg(not(windows))]
    {
        let _ = (window, bytes);
        Err("Shared buffers need WebView2".into())
    }
}
