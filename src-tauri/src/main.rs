// Tauri shell for Easy Labeling: the desktop app's window, file access, profile libraries and native commands.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod agent;
mod jobs;
mod label_commit;
mod native;
mod refine_folder;
mod review;
mod shared_buffer;
mod superpixels;
mod tiff_image;

use rfd::{FileDialog, MessageButtons, MessageDialog, MessageDialogResult, MessageLevel};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Component, Path, PathBuf};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Mutex;
use std::time::UNIX_EPOCH;
use tauri::ipc::{InvokeBody, Request, Response};
use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindow, WebviewWindowBuilder, WindowEvent};

static DOCUMENT_DIRTY: AtomicBool = AtomicBool::new(false);

type CommandResult<T> = Result<T, String>;

fn io_error(error: std::io::Error, what: &str) -> String {
    match error.kind() {
        std::io::ErrorKind::NotFound => format!("NotFoundError: {what} not found."),
        std::io::ErrorKind::PermissionDenied => format!("NotAllowedError: {what}: {error}"),
        _ => format!("{what}: {error}"),
    }
}

#[derive(Serialize)]
struct Entry {
    path: String,
    name: String,
    directory: bool,
}

fn entry(path: PathBuf, directory: bool) -> Entry {
    let name = path.file_name().map(|name| name.to_string_lossy().into_owned()).unwrap_or_default();
    Entry { path: path.to_string_lossy().into_owned(), name, directory }
}

fn profile_directory_name(kind: &str) -> CommandResult<&'static str> {
    Ok(match kind {
        "preset" => "Template Presets",
        "layout" => "Layouts",
        "refine" => "Refine Presets",
        "reclass" => "Reclass Presets",
        "preprocessing" => "Preprocessing Presets",
        "segmentation" => "Segmentation Presets",
        "class-info" => "Class Info",
        _ => return Err(format!("TypeError: Unsupported profile directory kind: {kind}")),
    })
}

fn ensure_profile_directory(app: &AppHandle, kind: &str) -> CommandResult<PathBuf> {
    let name = profile_directory_name(kind)?;
    let root = match std::env::var_os("EASY_LABELING_TEST_PROFILE_ROOT") {
        Some(root) => PathBuf::from(root),
        None => app.path().document_dir().map_err(|error| error.to_string())?.join("Easy Labeling"),
    };
    let directory = root.join(name);
    fs::create_dir_all(&directory).map_err(|error| io_error(error, "Profile folder"))?;
    Ok(directory)
}

/// The image folder's `.easy-labeling` settings folder, else the image folder; None when neither exists.
fn dataset_library_directory(folder: &str) -> Option<PathBuf> {
    if folder.is_empty() {
        return None;
    }
    let folder = PathBuf::from(folder);
    [folder.join(".easy-labeling"), folder].into_iter().find(|candidate| candidate.is_dir())
}

fn sanitize_suggested_file_name(file_name: &str) -> String {
    let base = Path::new(if file_name.is_empty() { "easy-labeling.json" } else { file_name })
        .file_name()
        .map(|name| name.to_string_lossy().into_owned())
        .unwrap_or_else(|| "easy-labeling.json".into());
    let safe: String = base.chars().map(|c| if "<>:\"/\\|?*".contains(c) || (c as u32) < 0x20 { '-' } else { c }).collect();
    if safe.to_lowercase().ends_with(".json") {
        safe
    } else {
        format!("{safe}.json")
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct LibraryFile {
    file_path: String,
    name: String,
    contents: String,
}

fn read_library_file(path: PathBuf) -> CommandResult<LibraryFile> {
    let contents = fs::read_to_string(&path).map_err(|error| io_error(error, "Library file"))?;
    let entry = entry(path, false);
    Ok(LibraryFile { file_path: entry.path, name: entry.name, contents })
}

/// E2E seam: ';'-separated folders answered in order instead of the dialog (the last one repeats).
fn test_picked_directory() -> Option<PathBuf> {
    static QUEUE: Mutex<Option<Vec<String>>> = Mutex::new(None);
    let mut queue = QUEUE.lock().ok()?;
    let folders = queue.get_or_insert_with(|| {
        let list = std::env::var("EASY_LABELING_TEST_PICK_DIRECTORIES").unwrap_or_default();
        list.split(';').filter(|folder| !folder.is_empty()).rev().map(String::from).collect()
    });
    let next = if folders.len() > 1 { folders.pop() } else { folders.first().cloned() };
    next.map(PathBuf::from)
}

/// E2E seam: the file answered instead of the open and save library file dialogs.
fn test_picked_file() -> Option<PathBuf> {
    std::env::var_os("EASY_LABELING_TEST_PICK_FILE").map(PathBuf::from)
}

#[tauri::command]
async fn pick_directory(app: AppHandle, window: WebviewWindow, id: Option<String>) -> CommandResult<Option<Entry>> {
    if let Some(path) = test_picked_directory() {
        return Ok(Some(entry(path, true)));
    }
    let mut dialog = FileDialog::new().set_parent(&window);
    if id.as_deref() == Some("class-info") {
        dialog = dialog.set_directory(ensure_profile_directory(&app, "class-info")?);
    }
    Ok(dialog.pick_folder().map(|path| entry(path, true)))
}

#[tauri::command]
async fn profile_directory(app: AppHandle, kind: String) -> CommandResult<Entry> {
    Ok(entry(ensure_profile_directory(&app, &kind)?, true))
}

fn copy_directory(source: &Path, target: &Path) -> std::io::Result<()> {
    fs::create_dir_all(target)?;
    for item in fs::read_dir(source)? {
        let item = item?;
        let destination = target.join(item.file_name());
        if item.file_type()?.is_dir() {
            copy_directory(&item.path(), &destination)?;
        } else {
            fs::copy(item.path(), destination)?;
        }
    }
    Ok(())
}

#[tauri::command]
async fn sample_directory(app: AppHandle) -> CommandResult<Entry> {
    let source = app.path().resource_dir().map_err(|error| error.to_string())?.join("sample");
    let target = app.path().app_data_dir().map_err(|error| error.to_string())?.join("sample-test");
    copy_directory(&source, &target).map_err(|error| io_error(error, "Sample folder"))?;
    Ok(entry(target, true))
}

#[tauri::command]
async fn open_library_file(app: AppHandle, window: WebviewWindow, kind: String, folder: Option<String>) -> CommandResult<Option<LibraryFile>> {
    let profile = ensure_profile_directory(&app, &kind)?;
    let directory = folder.as_deref().and_then(dataset_library_directory).unwrap_or(profile);
    if let Some(path) = test_picked_file() {
        return read_library_file(path).map(Some);
    }
    match FileDialog::new().set_parent(&window).set_directory(directory).add_filter("Easy Labeling JSON", &["json"]).pick_file() {
        Some(path) => read_library_file(path).map(Some),
        None => Ok(None),
    }
}

#[tauri::command]
async fn list_library_files(app: AppHandle, kind: String) -> CommandResult<Vec<LibraryFile>> {
    let directory = ensure_profile_directory(&app, &kind)?;
    let mut files = Vec::new();
    collect_preset_files(&directory, "", &mut files)?;
    files.sort_by_cached_key(|(name, _)| natural_key(name));
    // `name` is the path inside the kind's folder ("SEM/fine.json"): subfolders group presets.
    files.into_iter().map(|(name, path)| read_library_file(path).map(|file| LibraryFile { name, ..file })).collect()
}

/// .json files of `directory` and its subfolders (any depth), skipping folders whose name starts with ".".
fn collect_preset_files(directory: &Path, prefix: &str, files: &mut Vec<(String, PathBuf)>) -> CommandResult<()> {
    for item in fs::read_dir(directory).map_err(|error| io_error(error, "Profile folder"))?.filter_map(Result::ok) {
        let name = item.file_name().to_string_lossy().into_owned();
        let Ok(kind) = item.file_type() else { continue };
        if kind.is_dir() && !name.starts_with('.') {
            collect_preset_files(&item.path(), &format!("{prefix}{name}/"), files)?;
        } else if kind.is_file() && item.path().extension().is_some_and(|ext| ext.eq_ignore_ascii_case("json")) {
            files.push((format!("{prefix}{name}"), item.path()));
        }
    }
    Ok(())
}

/// Case-insensitive natural sort key, like localeCompare(..., { numeric: true, sensitivity: "base" }).
fn natural_key(name: &str) -> Vec<(u8, u128, String)> {
    let mut key = Vec::new();
    let mut chars = name.chars().peekable();
    while let Some(&c) = chars.peek() {
        if c.is_ascii_digit() {
            let mut digits = String::new();
            while let Some(&d) = chars.peek().filter(|d| d.is_ascii_digit()) {
                digits.push(d);
                chars.next();
            }
            key.push((0, digits.parse().unwrap_or(u128::MAX), String::new()));
        } else {
            let mut text = String::new();
            while let Some(&t) = chars.peek().filter(|t| !t.is_ascii_digit()) {
                text.extend(t.to_lowercase());
                chars.next();
            }
            key.push((1, 0, text));
        }
    }
    key
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct SaveLibraryOptions {
    kind: String,
    suggested_name: Option<String>,
    contents: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SavedFile {
    file_path: String,
}

#[tauri::command]
async fn save_library_file(app: AppHandle, window: WebviewWindow, options: SaveLibraryOptions) -> CommandResult<Option<SavedFile>> {
    let directory = ensure_profile_directory(&app, &options.kind)?;
    let start = directory.join(sanitize_suggested_file_name(options.suggested_name.as_deref().unwrap_or("")));
    let path = if let Some(path) = test_picked_file() {
        Some(path)
    } else {
        let mut dialog = FileDialog::new().set_parent(&window).add_filter("Easy Labeling JSON", &["json"]);
        if let Some(parent) = start.parent() {
            dialog = dialog.set_directory(parent);
        }
        if let Some(name) = start.file_name() {
            dialog = dialog.set_file_name(name.to_string_lossy());
        }
        dialog.save_file()
    };
    let Some(path) = path else { return Ok(None) };
    fs::write(&path, options.contents).map_err(|error| io_error(error, "Library file"))?;
    Ok(Some(SavedFile { file_path: path.to_string_lossy().into_owned() }))
}

#[tauri::command]
async fn set_document_dirty(dirty: bool) {
    DOCUMENT_DIRTY.store(dirty, Ordering::SeqCst);
}

// File System Access polyfill commands (see src/platform/tauri-desktop.ts).

#[tauri::command]
async fn fs_read_dir(path: String) -> CommandResult<Vec<Entry>> {
    let mut entries = Vec::new();
    for item in fs::read_dir(&path).map_err(|error| io_error(error, "Folder"))? {
        let item = item.map_err(|error| io_error(error, "Folder"))?;
        let Ok(kind) = item.file_type() else { continue };
        if kind.is_dir() || kind.is_file() {
            entries.push(entry(item.path(), kind.is_dir()));
        }
    }
    Ok(entries)
}

/// `base` joined with `name`, which must stay inside `base`.
fn child_path(base: &str, name: &str) -> CommandResult<PathBuf> {
    let relative = Path::new(name);
    if name.is_empty() || !relative.components().all(|part| matches!(part, Component::Normal(_) | Component::CurDir)) {
        return Err("SecurityError: Path traversal is not allowed.".into());
    }
    Ok(Path::new(base).join(relative))
}

#[tauri::command]
async fn fs_child(base: String, name: String, directory: bool, create: bool) -> CommandResult<Entry> {
    let target = child_path(&base, &name)?;
    let label = if directory { "Directory" } else { "File" };
    match fs::metadata(&target) {
        Ok(meta) if meta.is_dir() == directory => Ok(entry(target, directory)),
        Ok(_) => Err(format!("TypeMismatchError: Expected {}: {name}", label.to_lowercase())),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => {
            if !create {
                return Err(format!("NotFoundError: {label} not found: {name}"));
            }
            let created =
                if directory { fs::create_dir_all(&target) } else { target.parent().map_or(Ok(()), fs::create_dir_all).and_then(|_| fs::write(&target, [])) };
            created.map_err(|error| io_error(error, label))?;
            Ok(entry(target, directory))
        }
        Err(error) => Err(io_error(error, label)),
    }
}

/// FileSystemDirectoryHandle.removeEntry for files (the app never removes folders).
#[tauri::command]
async fn fs_remove(base: String, name: String) -> CommandResult<()> {
    let target = child_path(&base, &name)?;
    match fs::symlink_metadata(&target) {
        Ok(meta) if meta.is_file() => fs::remove_file(&target).map_err(|error| io_error(error, "File")),
        Ok(_) => Err(format!("TypeMismatchError: Expected file: {name}")),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Err(format!("NotFoundError: File not found: {name}")),
        Err(error) => Err(io_error(error, "File")),
    }
}

#[tauri::command]
async fn fs_read(path: String) -> CommandResult<Response> {
    fs::read(&path).map(Response::new).map_err(|error| io_error(error, "File"))
}

#[tauri::command]
async fn fs_mtime(path: String) -> CommandResult<f64> {
    let modified = fs::metadata(&path).and_then(|meta| meta.modified()).map_err(|error| io_error(error, "File"))?;
    Ok(modified.duration_since(UNIX_EPOCH).map(|elapsed| elapsed.as_secs_f64() * 1000.0).unwrap_or(0.0))
}

fn percent_decode(text: &str) -> CommandResult<String> {
    let bytes = text.as_bytes();
    let mut output = Vec::with_capacity(bytes.len());
    let mut index = 0;
    while index < bytes.len() {
        if bytes[index] == b'%' {
            let hex = text.get(index + 1..index + 3).ok_or("Invalid path header")?;
            output.push(u8::from_str_radix(hex, 16).map_err(|_| "Invalid path header")?);
            index += 3;
        } else {
            output.push(bytes[index]);
            index += 1;
        }
    }
    String::from_utf8(output).map_err(|_| "Invalid path header".into())
}

/// Writes through a temporary sibling and a rename, so a failed write never truncates the old file.
#[tauri::command]
async fn fs_write(request: Request<'_>) -> CommandResult<()> {
    let header = request.headers().get("x-path").and_then(|value| value.to_str().ok()).ok_or("Missing path header")?;
    let path = PathBuf::from(percent_decode(header)?);
    let InvokeBody::Raw(bytes) = request.body() else { return Err("Expected raw file contents".into()) };
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|error| io_error(error, "Folder"))?;
    }
    let mut temporary = path.clone().into_os_string();
    temporary.push(".easy-labeling-tmp");
    fs::write(&temporary, bytes).map_err(|error| io_error(error, "File"))?;
    fs::rename(&temporary, &path).map_err(|error| {
        let _ = fs::remove_file(&temporary);
        io_error(error, "File")
    })
}

#[tauri::command]
async fn fs_same_entry(left: String, right: String) -> bool {
    matches!((fs::canonicalize(left), fs::canonicalize(right)), (Ok(a), Ok(b)) if a == b)
}

fn confirm_close(window: &tauri::Window) {
    let window = window.clone();
    // Off the event loop thread, as the close request handler must return.
    std::thread::spawn(move || {
        let message = "There are unsaved annotation changes.\n\nClose Easy Labeling without saving them?";
        if ask(Some(&window), MessageLevel::Warning, "Unsaved changes", message, "Discard and close", "Cancel") {
            DOCUMENT_DIRTY.store(false, Ordering::SeqCst);
            let _ = window.destroy();
        }
    });
}

/// The window globals bridge (src/platform/tauri-desktop.ts, compiled into the frontend's dist/). tsc
/// marks it as an ES module with a trailing `export {};`, which an initialization script cannot have.
fn desktop_script(frontend: &Path) -> Result<String, String> {
    let source = fs::read_to_string(frontend.join("dist/platform/tauri-desktop.js"))
        .map_err(|error| format!("dist/platform/tauri-desktop.js is missing from the frontend folder: {error}"))?;
    Ok(classic_script(&source))
}

/// The frontend is served from the installed `frontend/` folder by WebView2 itself. Tauri's own
/// asset protocol hands every file through the window thread (~25 MB/s): loading OpenCV.js and the
/// ONNX runtime at startup then stalled the IPC calls of the first folder open by about a second.
/// The host is `<registered protocol>.localhost` over https, which Tauri counts as a local origin
/// (IPC allowed) while its own request filter only covers `http://app.localhost`.
const FRONTEND_HOST: &str = "app.localhost";

fn serve_frontend(window: &WebviewWindow, frontend: PathBuf) -> tauri::Result<()> {
    window.with_webview(move |webview| unsafe {
        use webview2_com::Microsoft::Web::WebView2::Win32::{ICoreWebView2_3, COREWEBVIEW2_HOST_RESOURCE_ACCESS_KIND_DENY_CORS};
        use windows_core::{Interface, HSTRING};
        let result = webview.controller().CoreWebView2().and_then(|core| {
            core.cast::<ICoreWebView2_3>()?.SetVirtualHostNameToFolderMapping(
                &HSTRING::from(FRONTEND_HOST),
                &HSTRING::from(frontend.as_path()),
                COREWEBVIEW2_HOST_RESOURCE_ACCESS_KIND_DENY_CORS,
            )?;
            core.Navigate(&HSTRING::from(format!("https://{FRONTEND_HOST}/index.html")))
        });
        if let Err(error) = result {
            eprintln!("Unable to serve the frontend folder: {error}");
        }
    })
}

fn classic_script(source: &str) -> String {
    let body: String = source.lines().filter(|line| line.trim() != "export {};").collect::<Vec<_>>().join(
        "
",
    );
    format!(
        "{{
{body}
}}
"
    )
}

/// A modal question with custom OK/Cancel labels; true when `accept` was chosen.
fn ask(parent: Option<&tauri::Window>, level: MessageLevel, title: &str, message: &str, accept: &str, decline: &str) -> bool {
    let mut dialog = MessageDialog::new()
        .set_level(level)
        .set_title(title)
        .set_description(message)
        .set_buttons(MessageButtons::OkCancelCustom(accept.into(), decline.into()));
    if let Some(parent) = parent {
        dialog = dialog.set_parent(parent);
    }
    dialog.show() == MessageDialogResult::Custom(accept.into())
}

/// Startup check against the GitHub release feed (plugins.updater.endpoints). Offline or failing
/// checks stay silent; the installer runs only after the user agreed, twice if work is unsaved.
async fn update_on_startup(app: AppHandle) -> tauri_plugin_updater::Result<()> {
    use tauri_plugin_updater::UpdaterExt;
    let Some(update) = app.updater_builder().timeout(std::time::Duration::from_secs(20)).build()?.check().await? else {
        return Ok(());
    };
    let name = app.config().product_name.clone().unwrap_or_else(|| "Easy Labeling".into());
    let offer = format!(
        "{name} {} is available (installed: {}).\n\nDownload and install it now? The app restarts after the installer finishes.",
        update.version, update.current_version
    );
    let window = app.get_webview_window("main");
    let main_window = window.as_ref().map(|window| window.as_ref().window());
    if !ask(main_window.as_ref(), MessageLevel::Info, "Update available", &offer, "Update", "Later") {
        return Ok(());
    }
    // The download takes a while (the installer bundles WebView2); show its progress in the title.
    let mut received = 0usize;
    let bytes = update
        .download(
            |chunk, total| {
                received += chunk;
                if let (Some(window), Some(total)) = (&window, total) {
                    let _ = window.set_title(&format!("{name} - downloading update {}%", received as u64 * 100 / total.max(1)));
                }
            },
            || {},
        )
        .await;
    if let Some(window) = &window {
        let _ = window.set_title(&name);
    }
    let bytes = bytes?;
    if DOCUMENT_DIRTY.load(Ordering::SeqCst) {
        let warning = "The update is ready, but there are unsaved annotation changes.\n\nInstall now and discard them?";
        if !ask(main_window.as_ref(), MessageLevel::Warning, "Unsaved changes", warning, "Install and close", "Cancel") {
            return Ok(());
        }
    }
    update.install(bytes)
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        // Never answers (WebView2 serves https://app.localhost); registering it makes that origin local.
        .register_uri_scheme_protocol("app", |_context, _request| tauri::http::Response::builder().status(404).body(Vec::new()).unwrap())
        .invoke_handler(tauri::generate_handler![
            pick_directory,
            profile_directory,
            sample_directory,
            open_library_file,
            list_library_files,
            save_library_file,
            set_document_dirty,
            fs_read_dir,
            fs_child,
            fs_read,
            fs_mtime,
            fs_write,
            fs_remove,
            fs_same_entry,
            native::refine_load_image,
            native::refine_load_tiff,
            native::refine_run,
            native::refine_crop,
            native::preprocess_view_load,
            native::preprocess_view_load_tiff,
            shared_buffer::shared_buffer_open,
            jobs::job_progress,
            jobs::job_cancel,
            refine_folder::refine_folder,
            label_commit::label_files_commit,
            review::review_folder,
            review::label_row_counts,
            review::review_stamps,
            tiff_image::tiff_bmp,
            tiff_image::tiff_bmp_shared,
            tiff_image::tiff_gray,
            tiff_image::tiff_gray_shared,
            superpixels::superpixels_run,
            superpixels::superpixels_run_tiff,
            superpixels::superpixels_take,
            superpixels::superpixels_take_shared,
            native::preprocess_view_run,
            native::preprocess_view_run_shared,
            agent::agent_reply,
            agent::agent_reply_bytes,
            agent::agent_progress,
            agent::agent_confirm,
            agent::agent_status
        ])
        .setup(|app| {
            // resource_dir() is a verbatim \?\ path, which breaks every subresource of a virtual host.
            let frontend = dunce::simplified(&app.path().resource_dir()?.join("frontend")).to_path_buf();
            let script = desktop_script(&frontend)?;
            let title = app.config().product_name.clone().unwrap_or_else(|| "Easy Labeling".into());
            let window = WebviewWindowBuilder::new(app, "main", WebviewUrl::External("about:blank".parse()?))
                .title(title)
                .inner_size(1480.0, 940.0)
                .min_inner_size(1080.0, 720.0)
                .initialization_script(&script)
                .disable_drag_drop_handler()
                .build()?;
            serve_frontend(&window, frontend)?;
            agent::start(window.clone());
            // Release builds only, and never under the e2e seams (they must not meet a dialog).
            if !cfg!(debug_assertions) && std::env::var_os("EASY_LABELING_TEST_PROFILE_ROOT").is_none() {
                let handle = app.handle().clone();
                tauri::async_runtime::spawn(async move {
                    if let Err(error) = update_on_startup(handle).await {
                        eprintln!("Update check skipped: {error}");
                    }
                });
            }
            Ok(())
        })
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                if DOCUMENT_DIRTY.load(Ordering::SeqCst) {
                    api.prevent_close();
                    confirm_close(window);
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("failed to run Easy Labeling");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn library_names_are_sanitized_and_sorted_naturally() {
        assert_eq!(sanitize_suggested_file_name("a*b?"), "a-b-.json");
        assert_eq!(sanitize_suggested_file_name("../x.JSON"), "x.JSON");
        assert_eq!(sanitize_suggested_file_name(""), "easy-labeling.json");
        let mut names = vec!["b10.json", "B2.json", "a.json"];
        names.sort_by_cached_key(|name| natural_key(name));
        assert_eq!(names, ["a.json", "B2.json", "b10.json"]);
    }

    #[test]
    fn preset_files_in_subfolders_are_listed_by_their_path() {
        let folder = std::env::temp_dir().join(format!("easy-labeling-presets-{}", std::process::id()));
        fs::create_dir_all(folder.join("SEM/Metal pattern")).unwrap();
        fs::create_dir_all(folder.join(".trash")).unwrap();
        for file in ["top.json", "SEM/Metal pattern/fine.json", "SEM/notes.txt", ".trash/old.json"] {
            fs::write(folder.join(file), "{}").unwrap();
        }
        let mut files = Vec::new();
        collect_preset_files(&folder, "", &mut files).unwrap();
        let mut names: Vec<String> = files.into_iter().map(|(name, _)| name).collect();
        names.sort();
        assert_eq!(names, ["SEM/Metal pattern/fine.json", "top.json"]);
        fs::remove_dir_all(&folder).unwrap();
    }

    #[test]
    fn library_dialog_starts_in_the_dataset_settings_folder() {
        let folder = std::env::temp_dir().join(format!("easy-labeling-library-{}", std::process::id()));
        fs::create_dir_all(&folder).unwrap();
        let text = folder.to_string_lossy().into_owned();
        assert_eq!(dataset_library_directory(&text), Some(folder.clone()));
        fs::create_dir_all(folder.join(".easy-labeling")).unwrap();
        assert_eq!(dataset_library_directory(&text), Some(folder.join(".easy-labeling")));
        fs::remove_dir_all(&folder).unwrap();
        assert_eq!(dataset_library_directory(&text), None);
        assert_eq!(dataset_library_directory(""), None);
    }

    #[test]
    fn desktop_script_becomes_a_classic_script() {
        let script = classic_script(
            "(() => {})();
export {};
",
        );
        assert!(!script.contains("export"));
    }

    #[test]
    fn percent_decoding_handles_utf8_paths() {
        assert_eq!(percent_decode("C%3A%5C%EC%9D%B4%EB%AF%B8%EC%A7%80").unwrap(), "C:\\이미지");
    }
}
