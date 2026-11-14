// Agent bridge (docs/AGENT_MCP_PLAN_KO.md): easy-labeling-mcp.exe connects over a named pipe (frames in
// crates/el-agent-protocol); each call runs in the page through `eval` and comes back through agent_reply /
// agent_reply_bytes, with progress through agent_progress. A call the page has not started within
// START_WITHIN is dropped there (its `startBy`), so a page stalled by a dialog never applies it late.

use crate::native::{header, upload_body};
use el_agent_protocol::{pipe_name, read_frame, write_frame, PROTOCOL};
use serde_json::{json, Value};
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::{Mutex, OnceLock};
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tauri::ipc::Request;
use tauri::{Manager, WebviewWindow};
use tokio::net::windows::named_pipe::{NamedPipeServer, ServerOptions};
use tokio::sync::{mpsc, oneshot};

const START_WITHIN: Duration = Duration::from_secs(10);

type Frame = (Value, Vec<u8>);

struct Reply {
    ok: bool,
    result: Value,
    error: Value,
    body: Vec<u8>,
}

impl Reply {
    fn error(code: &str, message: impl Into<String>) -> Self {
        Reply { ok: false, result: Value::Null, error: json!({ "code": code, "message": message.into() }), body: Vec::new() }
    }
}

struct Pending {
    reply: oneshot::Sender<Reply>,
    progress: mpsc::UnboundedSender<Value>,
}

fn pending() -> &'static Mutex<HashMap<String, Pending>> {
    static PENDING: OnceLock<Mutex<HashMap<String, Pending>>> = OnceLock::new();
    PENDING.get_or_init(Default::default)
}

/// What the Agent panel shows (agent_status): the pipe, and the last call and the client that made it.
#[derive(Default)]
struct Status {
    pipe: String,
    listening: bool,
    pipe_error: Option<String>,
    calls: u64,
    last_call: Option<Value>,
}

fn status() -> std::sync::MutexGuard<'static, Status> {
    static STATUS: OnceLock<Mutex<Status>> = OnceLock::new();
    STATUS.get_or_init(Default::default).lock().unwrap_or_else(|poisoned| poisoned.into_inner())
}

fn now_ms() -> u64 {
    SystemTime::now().duration_since(UNIX_EPOCH).unwrap_or_default().as_millis() as u64
}

/// The bridge's state for the Agent panel, and where easy-labeling-mcp.exe is (next to the app, as the installer puts it).
#[tauri::command]
pub fn agent_status(app: tauri::AppHandle) -> Value {
    let server = std::env::current_exe().ok().and_then(|exe| exe.parent().map(|folder| folder.join("easy-labeling-mcp.exe")));
    let status = status();
    json!({
        "pipe": status.pipe,
        "listening": status.listening,
        "pipeError": status.pipe_error,
        "calls": status.calls,
        "lastCall": status.last_call,
        "protocol": PROTOCOL,
        "appVersion": app.package_info().version.to_string(),
        "serverPath": server.as_ref().map(|path| dunce::simplified(path).display().to_string()),
        "serverFound": server.is_some_and(|path| path.is_file()),
        "now": now_ms()
    })
}

fn take(id: &str) -> Option<Pending> {
    pending().lock().unwrap_or_else(|poisoned| poisoned.into_inner()).remove(id)
}

/// How long a started call may run without a reply or progress.
fn time_limit(tool: &str) -> Duration {
    Duration::from_secs(match tool {
        // Folder-wide runs wait for the person's approval and then go through every image.
        "refine_folder" | "reclass_folder" | "remap_classes" | "review_folder" | "run_inference" | "clean_masks" => 4 * 3600,
        // Several images' label files (and image sizes) read in the page.
        "analyze_boxes" | "compare_labels" | "compare_masks" | "analyze_masks" | "list_images" => 300,
        // The first AI Select loads the EdgeSAM model and encodes the image; then up to 500 prompts are decoded.
        "segment_ai" | "boxes_to_masks" => 600,
        // The first template match starts OpenCV.js; a model load compiles the ONNX graph.
        "open_folder" | "run_refine" | "run_reclass" | "run_template_matching" | "find_similar" | "load_model" => 300,
        "go_to_image" => 60,
        "app_state" | "get_classes" | "get_boxes" => 10,
        _ => 30,
    })
}

#[tauri::command]
pub fn agent_reply(id: String, ok: bool, result: Option<Value>, error: Option<Value>) {
    if let Some(call) = take(&id) {
        let _ = call.reply.send(Reply { ok, result: result.unwrap_or(Value::Null), error: error.unwrap_or(Value::Null), body: Vec::new() });
    }
}

/// A successful reply with bytes (a PNG): `x-agent-id`, `x-agent-result` (percent-encoded JSON), body as for uploads.
#[tauri::command]
pub async fn agent_reply_bytes(window: WebviewWindow, request: Request<'_>) -> Result<(), String> {
    let id = crate::percent_decode(header(&request, "x-agent-id")?)?;
    let result = serde_json::from_str(&crate::percent_decode(header(&request, "x-agent-result")?)?).map_err(|error| error.to_string())?;
    let body = upload_body(&window, &request).await?;
    if let Some(call) = take(&id) {
        let _ = call.reply.send(Reply { ok: true, result, error: Value::Null, body });
    }
    Ok(())
}

#[tauri::command]
pub fn agent_progress(id: String, done: f64, total: Option<f64>, message: Option<String>) {
    if let Some(call) = pending().lock().unwrap_or_else(|poisoned| poisoned.into_inner()).get(&id) {
        let _ = call.progress.send(json!({ "done": done, "total": total, "message": message }));
    }
}

/// Listens for easy-labeling-mcp.exe. A second app finds the pipe taken and runs without it.
pub fn start(window: WebviewWindow) {
    let name = pipe_name();
    status().pipe = name.clone();
    tauri::async_runtime::spawn(async move {
        let mut server = match ServerOptions::new().first_pipe_instance(true).create(&name) {
            Ok(server) => server,
            Err(error) => {
                eprintln!("Agent pipe {name} not opened: {error}");
                status().pipe_error = Some(format!("Another Easy Labeling window already takes agent connections ({error})."));
                return;
            }
        };
        status().listening = true;
        let connections = AtomicU64::new(0);
        loop {
            let connected = server.connect().await;
            let next = match ServerOptions::new().create(&name) {
                Ok(next) => next,
                Err(error) => {
                    eprintln!("Agent pipe {name} closed: {error}");
                    let mut status = status();
                    status.listening = false;
                    status.pipe_error = Some(format!("Agent connections stopped: {error}"));
                    return;
                }
            };
            let connection = std::mem::replace(&mut server, next);
            if connected.is_ok() {
                tauri::async_runtime::spawn(serve(connection, connections.fetch_add(1, Ordering::Relaxed), window.clone()));
            }
        }
    });
}

async fn serve(connection: NamedPipeServer, number: u64, window: WebviewWindow) {
    let (mut read, mut write) = tokio::io::split(connection);
    let (out, mut outgoing) = mpsc::unbounded_channel::<Frame>();
    let writer = tauri::async_runtime::spawn(async move {
        while let Some((header, body)) = outgoing.recv().await {
            if write_frame(&mut write, &header, &body).await.is_err() {
                break;
            }
        }
    });
    let mut client = Value::Null;
    while let Ok(Some((header, _))) = read_frame(&mut read).await {
        let page_id = format!("{number}:{}", header["id"]);
        match header["type"].as_str() {
            Some("hello") => {
                client = header["client"].clone();
                let version = window.app_handle().package_info().version.to_string();
                let _ = out.send((json!({ "type": "hello", "protocol": PROTOCOL, "app": "easy-labeling", "appVersion": version }), Vec::new()));
            }
            Some("call") => {
                let mut status = status();
                status.calls += 1;
                status.last_call = Some(json!({ "tool": header["tool"], "client": client, "at": now_ms() }));
                drop(status);
                tauri::async_runtime::spawn(call(window.clone(), page_id, header, out.clone()));
            }
            Some("cancel") => {
                let _ = window.eval(format!("window.__easyLabelingAgent?.cancel({})", Value::String(page_id)));
            }
            _ => {}
        }
    }
    drop(out);
    let _ = writer.await;
}

async fn call(window: WebviewWindow, page_id: String, header: Value, out: mpsc::UnboundedSender<Frame>) {
    let id = header["id"].clone();
    let tool = header["tool"].as_str().unwrap_or_default().to_string();
    let mut args = header.get("args").cloned().unwrap_or_else(|| json!({}));
    let reply = match prepare(&window, &tool, &mut args).await {
        Err(reply) => reply,
        Ok(()) => run_on_page(&window, &page_id, &tool, args, &id, &out).await,
    };
    let body_type = if reply.body.is_empty() { Value::Null } else { json!("image/png") };
    let frame = json!({ "type": "result", "id": id, "ok": reply.ok, "result": reply.result, "error": reply.error, "body": body_type });
    let _ = out.send((frame, reply.body));
}

/// Rust-side steps before the page runs a tool. open_folder: the person approves the folder in a native
/// dialog (never a page dialog, which would stall the page), and the page gets it as a picker entry.
/// load_model: an existing .onnx file, handed to the page as a file entry (read-only, no dialog).
async fn prepare(window: &WebviewWindow, tool: &str, args: &mut Value) -> Result<(), Reply> {
    if tool == "load_model" {
        let path = args["path"].as_str().unwrap_or_default();
        let file = dunce::canonicalize(path).map_err(|error| Reply::error("invalid_args", format!("{path}: {error}")))?;
        let onnx = file.extension().is_some_and(|extension| extension.eq_ignore_ascii_case("onnx"));
        if !file.is_file() || !onnx {
            return Err(Reply::error("invalid_args", format!("{} is not an .onnx file", file.display())));
        }
        args["entry"] = serde_json::to_value(crate::entry(file, false)).map_err(|error| Reply::error("failed", error.to_string()))?;
        return Ok(());
    }
    if tool != "open_folder" {
        return Ok(());
    }
    let path = args["path"].as_str().unwrap_or_default();
    let folder = dunce::canonicalize(path).map_err(|error| Reply::error("invalid_args", format!("{path}: {error}")))?;
    if !folder.is_dir() {
        return Err(Reply::error("invalid_args", format!("{} is not a folder", folder.display())));
    }
    if !approve_folder(window, folder.clone()).await {
        return Err(Reply::error("declined", "The person declined to open the folder."));
    }
    args["entry"] = serde_json::to_value(crate::entry(folder, true)).map_err(|error| Reply::error("failed", error.to_string()))?;
    Ok(())
}

async fn approve_folder(window: &WebviewWindow, folder: PathBuf) -> bool {
    let message = format!("An AI agent asks to open this folder in Easy Labeling:\n\n{}", folder.display());
    ask_person(window, rfd::MessageLevel::Info, "Open folder for the agent?", message, "Open").await
}

/// The person's answer in a native dialog (a page dialog would stall the page the agent drives).
async fn ask_person(window: &WebviewWindow, level: rfd::MessageLevel, title: &'static str, message: String, accept: &'static str) -> bool {
    // E2E seam: "accept" or "decline" answers instead of the dialog.
    if let Ok(answer) = std::env::var("EASY_LABELING_TEST_AGENT_APPROVE") {
        return answer == "accept";
    }
    let parent = window.as_ref().window();
    tauri::async_runtime::spawn_blocking(move || crate::ask(Some(&parent), level, title, &message, accept, "Cancel")).await.unwrap_or(false)
}

/// Asked by the page before an agent call changes label files across the folder (Refine/Reclass folder runs, class remap).
#[tauri::command]
pub async fn agent_confirm(window: WebviewWindow, message: String) -> bool {
    let message = format!("An AI agent asks to make this change:\n\n{message}");
    ask_person(&window, rfd::MessageLevel::Warning, "Allow the AI agent's change?", message, "Allow").await
}

async fn run_on_page(window: &WebviewWindow, page_id: &str, tool: &str, args: Value, id: &Value, out: &mpsc::UnboundedSender<Frame>) -> Reply {
    let (reply, mut replied) = oneshot::channel();
    let (progress, mut progressed) = mpsc::unbounded_channel();
    pending().lock().unwrap_or_else(|poisoned| poisoned.into_inner()).insert(page_id.to_string(), Pending { reply, progress });
    let request = json!({ "id": page_id, "tool": tool, "args": args, "startBy": now_ms() + START_WITHIN.as_millis() as u64 });
    // The request is a JSON literal (valid JS); nothing is pasted into the script as text.
    if let Err(error) = window.eval(format!("window.__easyLabelingAgent?.dispatch({request})")) {
        take(page_id);
        return Reply::error("failed", error.to_string());
    }
    loop {
        tokio::select! {
            reply = &mut replied => return reply.unwrap_or_else(|_| Reply::error("failed", "The page dropped the call.")),
            Some(update) = progressed.recv() => {
                let _ = out.send((json!({ "type": "progress", "id": id, "done": update["done"], "total": update["total"], "message": update["message"] }), Vec::new()));
            }
            _ = tokio::time::sleep(time_limit(tool)) => {
                take(page_id);
                return Reply::error("timeout", "The app did not answer in time. It may be showing a dialog or still be starting; ask the person to check the window.");
            }
        }
    }
}
