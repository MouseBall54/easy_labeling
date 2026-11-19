// Agent bridge (docs/AGENT_MCP_PLAN_KO.md): easy-labeling-mcp.exe connects over a named pipe (frames in
// crates/el-agent-protocol); each call runs in the page through `eval` and comes back through agent_reply /
// agent_reply_bytes, with progress through agent_progress. A call the page has not started within
// START_WITHIN is dropped there (its `startBy`), so a page stalled by a dialog never applies it late.

use crate::native::{header, upload_body};
use el_agent_protocol::{pipe_name, read_frame, write_frame, MAX_CHANNEL, PROTOCOL};
use serde_json::{json, Value};
use std::collections::{BTreeMap, HashMap};
use std::path::PathBuf;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::{Mutex, OnceLock};
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tauri::ipc::Request;
use tauri::{Manager, WebviewWindow};
use tokio::net::windows::named_pipe::{ClientOptions, NamedPipeServer, ServerOptions};
use tokio::sync::{mpsc, oneshot, watch};

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
    channel: u32,
    pipe: String,
    listening: bool,
    pipe_error: Option<String>,
    calls: u64,
    last_call: Option<Value>,
    /// Servers attached to this window (their idle connection said `attached`), by connection number.
    agents: BTreeMap<u64, Value>,
}

/// This window's row in the channel overview: what other windows' panels show for it (a `status` frame).
fn summary() -> Value {
    let status = status();
    json!({
        "channel": status.channel,
        "folder": crate::open_folder(),
        "agents": status.agents.values().collect::<Vec<_>>(),
        "calls": status.calls,
        "lastCall": status.last_call,
    })
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
    let mut answer = summary();
    let status = status();
    let fields = json!({
        "maxChannel": MAX_CHANNEL,
        "pipe": status.pipe,
        "listening": status.listening,
        "pipeError": status.pipe_error,
        "protocol": PROTOCOL,
        "appVersion": app.package_info().version.to_string(),
        "serverPath": server.as_ref().map(|path| dunce::simplified(path).display().to_string()),
        "serverFound": server.is_some_and(|path| path.is_file()),
        "now": now_ms()
    });
    if let (Some(answer), Value::Object(fields)) = (answer.as_object_mut(), fields) {
        answer.extend(fields);
    }
    answer
}

/// Every channel's window (MCP panel, Channels): this one from its own state, the others asked over their pipe
/// with a `status` frame. A window that does not answer in time (an older version) is listed as unknown.
#[tauri::command]
pub async fn agent_channels() -> Vec<Value> {
    let own = status().channel;
    let mut rows = Vec::new();
    for channel in 1..=MAX_CHANNEL {
        let row = if channel == own { Some(summary()) } else { probe(channel).await };
        if let Some(mut row) = row {
            row["self"] = json!(channel == own);
            rows.push(row);
        }
    }
    rows
}

async fn probe(channel: u32) -> Option<Value> {
    const ERROR_PIPE_BUSY: i32 = 231;
    let name = pipe_name(channel);
    let mut pipe = None;
    for _ in 0..10 {
        match ClientOptions::new().open(&name) {
            Ok(opened) => {
                pipe = Some(opened);
                break;
            }
            // Every instance taken for a moment: the window makes the next one right after each connect.
            Err(error) if error.raw_os_error() == Some(ERROR_PIPE_BUSY) => tokio::time::sleep(Duration::from_millis(20)).await,
            Err(_) => return None,
        }
    }
    let (mut read, mut write) = tokio::io::split(pipe?);
    let asked = async {
        write_frame(&mut write, &json!({ "type": "status" }), &[]).await.ok()?;
        let (header, _) = read_frame(&mut read).await.ok()??;
        (header["type"] == "status").then_some(header)
    };
    match tokio::time::timeout(Duration::from_secs(1), asked).await {
        Ok(Some(mut row)) => {
            if let Some(fields) = row.as_object_mut() {
                fields.remove("type");
            }
            Some(row)
        }
        _ => Some(json!({ "channel": channel, "unknown": true })),
    }
}

fn take(id: &str) -> Option<Pending> {
    pending().lock().unwrap_or_else(|poisoned| poisoned.into_inner()).remove(id)
}

/// How long a started call may run without a reply or progress.
fn time_limit(tool: &str) -> Duration {
    Duration::from_secs(match tool {
        // Folder-wide runs wait for the person's approval and then go through every image.
        "refine_folder"
        | "reclass_folder"
        | "remap_classes"
        | "review_folder"
        | "run_inference"
        | "clean_masks"
        | "clean_out_of_bounds"
        | "run_template_matching_folder"
        | "copy_boxes" => 4 * 3600,
        // Several images' label files (and image sizes) read in the page.
        "analyze_boxes" | "compare_labels" | "compare_masks" | "analyze_masks" | "list_images" => 300,
        // The first AI Select loads the EdgeSAM model and encodes the image; then up to 500 prompts are decoded.
        "segment_ai" | "boxes_to_masks" => 600,
        // The first template match starts OpenCV.js; a model load compiles the ONNX graph.
        "open_folder" | "run_refine" | "run_reclass" | "run_template_matching" | "find_similar" | "load_model" | "detect_boxes" | "refine_profile" => 300,
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

/// Bumped when the window moves to another channel: the old channel's listener and connections end.
fn generation() -> &'static watch::Sender<u64> {
    static GENERATION: OnceLock<watch::Sender<u64>> = OnceLock::new();
    GENERATION.get_or_init(|| watch::channel(0).0)
}

/// Takes `channel`'s pipe unless another window holds it.
fn claim(channel: u32) -> std::io::Result<NamedPipeServer> {
    ServerOptions::new().first_pipe_instance(true).create(pipe_name(channel))
}

/// Listens for easy-labeling-mcp.exe on the first free channel, so each Easy Labeling window gets its own.
pub fn start(window: WebviewWindow) {
    tauri::async_runtime::spawn(async move {
        for channel in 1..=MAX_CHANNEL {
            if let Ok(server) = claim(channel) {
                return listen(window, channel, server);
            }
        }
        eprintln!("Agent pipes not opened: every channel is taken");
        status().pipe_error = Some(format!("All {MAX_CHANNEL} agent channels are taken by other Easy Labeling windows."));
    });
}

/// The person's channel choice in the MCP panel: moves this window there if no other window holds it.
/// Agents on the old channel get a `bye` frame and lose this window.
#[tauri::command]
pub async fn agent_set_channel(window: WebviewWindow, channel: u32) -> Result<u32, String> {
    if !(1..=MAX_CHANNEL).contains(&channel) {
        return Err(format!("Channel must be 1 to {MAX_CHANNEL}."));
    }
    let current = status();
    if current.channel == channel && current.listening {
        return Ok(channel);
    }
    drop(current);
    let server = claim(channel).map_err(|_| format!("Channel {channel} is in use by another Easy Labeling window."))?;
    listen(window, channel, server);
    Ok(channel)
}

fn listen(window: WebviewWindow, channel: u32, server: NamedPipeServer) {
    generation().send_modify(|generation| *generation += 1);
    let stop = generation().subscribe();
    let mut status = status();
    status.channel = channel;
    status.pipe = pipe_name(channel);
    status.listening = true;
    status.pipe_error = None;
    drop(status);
    tauri::async_runtime::spawn(accept(window, channel, server, stop));
}

async fn accept(window: WebviewWindow, channel: u32, mut server: NamedPipeServer, mut stop: watch::Receiver<u64>) {
    // Numbers stay unique across channel moves: page ids are `<connection>:<call id>`.
    static CONNECTIONS: AtomicU64 = AtomicU64::new(0);
    let name = pipe_name(channel);
    loop {
        let connected = tokio::select! {
            connected = server.connect() => connected,
            _ = stop.changed() => return,
        };
        let next = match ServerOptions::new().create(&name) {
            Ok(next) => next,
            Err(error) => {
                eprintln!("Agent pipe {name} closed: {error}");
                if !stop.has_changed().unwrap_or(true) {
                    let mut status = status();
                    status.listening = false;
                    status.pipe_error = Some(format!("Agent connections stopped: {error}"));
                }
                return;
            }
        };
        let connection = std::mem::replace(&mut server, next);
        if connected.is_ok() {
            tauri::async_runtime::spawn(serve(connection, CONNECTIONS.fetch_add(1, Ordering::Relaxed), window.clone(), stop.clone()));
        }
    }
}

async fn serve(connection: NamedPipeServer, number: u64, window: WebviewWindow, mut stop: watch::Receiver<u64>) {
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
    loop {
        let frame = tokio::select! {
            frame = read_frame(&mut read) => frame,
            _ = stop.changed() => {
                // The window moved to another channel: the server stops treating this as the app closing.
                let _ = out.send((json!({ "type": "bye", "reason": "channel", "channel": status().channel }), Vec::new()));
                break;
            }
        };
        let Ok(Some((header, _))) = frame else { break };
        let page_id = format!("{number}:{}", header["id"]);
        match header["type"].as_str() {
            Some("hello") => {
                client = header["client"].clone();
                if header["attached"] == true && !client.is_null() {
                    status().agents.insert(number, json!({ "client": client, "since": now_ms() }));
                }
                let version = window.app_handle().package_info().version.to_string();
                let hello = json!({ "type": "hello", "protocol": PROTOCOL, "app": "easy-labeling", "appVersion": version, "channel": status().channel });
                let _ = out.send((hello, Vec::new()));
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
            Some("status") => {
                let mut row = summary();
                row["type"] = json!("status");
                let _ = out.send((row, Vec::new()));
            }
            _ => {}
        }
    }
    status().agents.remove(&number);
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
    // Two windows on one folder overwrite each other's saves; the page tells the agent.
    args["openElsewhere"] = json!(crate::folder_open_elsewhere(&folder));
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
