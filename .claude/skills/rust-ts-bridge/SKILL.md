---
name: rust-ts-bridge
description: Rules for the Rust<->TS boundary in easy_labeling (Tauri 2 commands reached from the WebView2 frontend). Use when writing or changing src-tauri commands, src/platform/tauri-desktop.ts, or TS code that calls native code.
---

# Rust <-> TS boundary (Tauri 2 over WebView2)

Goal: the boundary must not eat the Rust gain. Measured history: native template matching and ONNX were slower than the JS versions because of WebView2 IPC (commit `a95511dc`); Tauri's asset protocol ran at ~25 MB/s on the window thread (`bfa792b4`).

## Data
- **No JSON or base64 for pixels or large arrays.**
- **Megabytes go through WebView2 shared memory** (`src-tauri/src/shared_buffer.rs`). A raw invoke body crosses WebView2 at ~17 MB/s (50 MB in ~3 s) and a binary `Response` at ~30-55 MB/s. A shared buffer moves 50 MB in ~130 ms (DECISIONS D-006).
  - Upload: `window.easyLabelingNative.upload(bytes)` returns an id; send it as the `x-shared-buffer` header and read it in Rust with `upload_body` (native.rs).
  - Download: return `crate::shared_buffer::post(&window, bytes)` from a `*_shared` command and read it with `easyLabelingNative.download(command, args, use)`.
  - Always keep the raw path as the fallback (`upload`/`download` are absent outside WebView2 or may fail): raw invoke body with metadata in headers, binary reply via `tauri::ipc::Response::new(Vec<u8>)`. Use `tauri::ipc::Channel` for streaming/progress.
- Keep state resident in Rust (the loaded gray image, caches) and pass keys; do not re-send the image per call.
- For hundreds of boxes, JSON is acceptable for requests (refine does this); for thousands, prefer flat typed arrays.

## Calls
- Batch: one call per operation (`refine_run` takes all boxes), never a call per box in a loop.
- Anything that can exceed ~100 ms runs off the IPC thread (`tauri::async_runtime::spawn_blocking`, rayon inside) and reports progress through a `Channel`; support cancellation by key/generation where the user can supersede the request.
- Commands return `Result<T, String>`; never let a panic cross the boundary.

## Frontend side
- `src/platform/tauri-desktop.ts` is a classic script (no imports) that exposes window globals; feature code checks for those globals and falls back to the TS implementation, which must keep working for the web build.
- Hand-written TS types for command payloads live next to the caller; keep them in step with the serde structs (camelCase via `#[serde(rename_all = "camelCase")]`).
