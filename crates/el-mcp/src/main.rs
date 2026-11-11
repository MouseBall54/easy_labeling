//! easy-labeling-mcp.exe: the MCP server (stdio) AI agents start. It holds no app logic: every tool is
//! forwarded to the running Easy Labeling app over a named pipe and answered by the page, which calls the
//! same code the app's own buttons use (docs/AGENT_MCP_PLAN_KO.md).

use base64::Engine;
use el_agent_protocol::{pipe_name, read_frame, write_frame, PROTOCOL};
use rmcp::{
    handler::server::{router::tool::ToolRouter, wrapper::Parameters},
    model::*,
    schemars, tool, tool_handler, tool_router, Peer, RoleServer, ServerHandler, ServiceExt,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::time::Duration;
use tokio::net::windows::named_pipe::ClientOptions;
use tokio_util::sync::CancellationToken;

const ERROR_PIPE_BUSY: i32 = 231;
/// How often a long call tells the client it is still running (see exchange).
const HEARTBEAT: Duration = Duration::from_secs(15);

const INSTRUCTIONS: &str = "Easy Labeling is a desktop image annotation app (YOLO detection boxes on grayscale SEM/TEM images). \
These tools drive the app window the person has open, so they see every change. Coordinates are image pixels {x0, y0, x1, y1} \
(x0 < x1, y0 < y1) unless a result says \"normalized\". Start with app_state. If a tool answers app_not_running, ask the person \
to start Easy Labeling; on busy, wait a moment and retry; on timeout, ask the person to check the window (a dialog may be open).\n\n\
Images often hold thousands of boxes, so long lists come in pages: get_boxes, run_refine, run_reclass, review_queue, find_similar \
and apply_layout take offset/limit and always return the totals (limit 0 returns counts only). Prefer counts and capture_view \
with annotationId or region (a zoomed crop) over listing every box.\n\n\
Typical flow: find_similar from one good box (or run_template_matching / apply_layout) to add boxes -> run_refine with dryRun \
to see what would move, then without dryRun (pass the returned annotationIds as the scope) -> review_queue and capture_view \
on flagged boxes -> approve or update_boxes -> save -> set_review_status. Before run_reclass, read reclassRule from \
get_refine_settings and try dryRun first. Every edit is one undo step; folder-wide tools ask the person first.";

#[derive(Debug, Deserialize, Serialize, schemars::JsonSchema)]
struct OpenFolderArgs {
    #[schemars(description = "Absolute path of the image folder (its labels live in its `label` subfolder)")]
    path: String,
}

#[derive(Debug, Deserialize, Serialize, schemars::JsonSchema)]
struct ListImagesArgs {
    #[schemars(description = "Index of the first image to return (default 0)")]
    offset: Option<u32>,
    #[schemars(description = "Images to return (default 100, at most 1000)")]
    limit: Option<u32>,
    #[schemars(description = "\"all\" (default), \"labeled\", \"unlabeled\" or \"issues\" (images with review findings)")]
    filter: Option<String>,
}

#[derive(Debug, Deserialize, Serialize, schemars::JsonSchema)]
struct GoToImageArgs {
    #[schemars(description = "Image file name to open, e.g. \"wafer_01.tif\"")]
    image: Option<String>,
    #[schemars(description = "Instead of a name: move this many images forward (1) or back (-1) in the list")]
    step: Option<i32>,
}

#[derive(Debug, Deserialize, Serialize, schemars::JsonSchema)]
#[serde(rename_all = "camelCase")]
struct GetBoxesArgs {
    #[schemars(description = "Only these annotationIds (default: every box on the current image)")]
    ids: Option<Vec<String>>,
    #[schemars(description = "Only the boxes of this class")]
    class_id: Option<Value>,
    #[schemars(description = "Index of the first box to return (default 0)")]
    offset: Option<u32>,
    #[schemars(description = "Boxes to return (default 200, or every id given; at most 5000; 0 returns only countsByClass and total)")]
    limit: Option<u32>,
}

#[derive(Debug, Deserialize, Serialize, schemars::JsonSchema)]
struct PixelRegion {
    x0: f64,
    y0: f64,
    x1: f64,
    y1: f64,
}

#[derive(Debug, Deserialize, Serialize, schemars::JsonSchema)]
struct ReadLabelsArgs {
    #[schemars(description = "Image file name whose saved label file to read")]
    image: String,
}

#[derive(Debug, Deserialize, Serialize, schemars::JsonSchema)]
#[serde(rename_all = "camelCase")]
struct CaptureViewArgs {
    #[schemars(description = "Longest side of the returned PNG in pixels (default 1280, 256 to 4096)")]
    max_side: Option<u32>,
    #[schemars(description = "Zoom in on this box (with a margin of half its size) instead of capturing the person's view")]
    annotation_id: Option<String>,
    #[schemars(description = "Or: zoom in on this image region in pixels (up to 8x enlargement)")]
    region: Option<PixelRegion>,
}

#[derive(Debug, Deserialize, Serialize, schemars::JsonSchema)]
#[serde(rename_all = "camelCase")]
struct NewBox {
    #[schemars(description = "Class id, a whole number such as \"0\" or 3 (see get_classes)")]
    class_id: Value,
    x0: f64,
    y0: f64,
    x1: f64,
    y1: f64,
}

#[derive(Debug, Deserialize, Serialize, schemars::JsonSchema)]
#[serde(rename_all = "camelCase")]
struct AddBoxesArgs {
    #[schemars(description = "Boxes in image pixels, inside the image (at most 5000)")]
    boxes: Vec<NewBox>,
    #[schemars(description = "Remove every existing box first (default false)")]
    replace_existing: Option<bool>,
}

#[derive(Debug, Deserialize, Serialize, schemars::JsonSchema)]
#[serde(rename_all = "camelCase")]
struct BoxUpdate {
    annotation_id: String,
    #[schemars(description = "New left edge in pixels; omit to keep")]
    x0: Option<f64>,
    #[schemars(description = "New top edge in pixels; omit to keep")]
    y0: Option<f64>,
    #[schemars(description = "New right edge in pixels; omit to keep")]
    x1: Option<f64>,
    #[schemars(description = "New bottom edge in pixels; omit to keep")]
    y1: Option<f64>,
    #[schemars(description = "New class id; omit to keep")]
    class_id: Option<Value>,
}

#[derive(Debug, Deserialize, Serialize, schemars::JsonSchema)]
#[serde(rename_all = "camelCase")]
struct UpdateBoxesArgs {
    #[schemars(description = "Changes by annotationId (at most 5000)")]
    updates: Vec<BoxUpdate>,
}

#[derive(Debug, Deserialize, Serialize, schemars::JsonSchema)]
#[serde(rename_all = "camelCase")]
struct DeleteBoxesArgs {
    annotation_ids: Vec<String>,
}

#[derive(Debug, Deserialize, Serialize, schemars::JsonSchema)]
#[serde(rename_all = "camelCase")]
struct SelectBoxesArgs {
    #[schemars(description = "Select exactly these boxes")]
    annotation_ids: Option<Vec<String>>,
    #[schemars(description = "Or: select every box of this class")]
    class_id: Option<Value>,
    #[schemars(description = "Or: \"all\" or \"none\"")]
    select: Option<String>,
}

#[derive(Debug, Deserialize, Serialize, schemars::JsonSchema)]
struct StepsArgs {
    #[schemars(description = "How many steps (default 1, at most 50)")]
    steps: Option<u32>,
}

#[derive(Debug, Deserialize, Serialize, schemars::JsonSchema)]
#[serde(rename_all = "camelCase")]
struct RefineRunArgs {
    #[schemars(description = "\"all\" (default: every visible box) or \"selected\"; or give annotationIds or classId instead")]
    scope: Option<String>,
    #[schemars(description = "Only these boxes")]
    annotation_ids: Option<Vec<String>>,
    #[schemars(description = "Only the boxes of this class")]
    class_id: Option<Value>,
    #[schemars(description = "Preset name for this run (see get_refine_settings); \"\" for the class settings / Lab rule; omit for the pane's current choice")]
    #[serde(skip_serializing_if = "Option::is_none")]
    preset: Option<String>,
    #[schemars(description = "Skip boxes the person edited by hand (default: the pane's toggle for all/class runs, false for chosen boxes)")]
    keep_hand_edited: Option<bool>,
    #[schemars(description = "Only compute and return what would change; nothing is applied (default false)")]
    dry_run: Option<bool>,
    #[schemars(description = "Index of the first changed box to list (default 0)")]
    offset: Option<u32>,
    #[schemars(description = "Changed boxes to list (default 100, at most 5000; 0 lists none). Counts always cover every box.")]
    limit: Option<u32>,
}

#[derive(Debug, Deserialize, Serialize, schemars::JsonSchema)]
struct ReviewModeArgs {
    #[schemars(description = "\"edge\" (Refine flags) or \"reclass\" (reclassed boxes); default: the mode the Refine pane shows")]
    mode: Option<String>,
    #[schemars(description = "Index of the first box to list (default 0)")]
    offset: Option<u32>,
    #[schemars(description = "Boxes to list (default 100, at most 5000)")]
    limit: Option<u32>,
}

#[derive(Debug, Deserialize, Serialize, schemars::JsonSchema)]
struct ReviewStatusArgs {
    #[schemars(description = "\"reviewed\" or \"needs-review\" (the image list's review status, saved in review-state.json)")]
    status: String,
    #[schemars(description = "Image file names (default: the current image)")]
    images: Option<Vec<String>>,
}

#[derive(Debug, Deserialize, Serialize, schemars::JsonSchema)]
#[serde(rename_all = "camelCase")]
struct ApproveArgs {
    #[schemars(description = "Boxes to approve (they leave the review queue)")]
    annotation_ids: Option<Vec<String>>,
    #[schemars(description = "Approve the whole queue")]
    all: Option<bool>,
    #[schemars(description = "\"edge\" or \"reclass\"; default: the pane's mode")]
    mode: Option<String>,
}

#[derive(Debug, Deserialize, Serialize, schemars::JsonSchema)]
struct FolderRunArgs {
    #[schemars(description = "Preset name for this run; \"\" for the class settings / Lab rule; omit for the pane's current choice")]
    #[serde(skip_serializing_if = "Option::is_none")]
    preset: Option<String>,
}

#[derive(Debug, Deserialize, Serialize, schemars::JsonSchema)]
struct RemapRow {
    #[schemars(description = "Class id to change")]
    from: Value,
    #[schemars(description = "Class id it becomes")]
    to: Value,
}

#[derive(Debug, Deserialize, Serialize, schemars::JsonSchema)]
#[serde(rename_all = "camelCase")]
struct RemapArgs {
    #[schemars(description = "Class id changes, e.g. [{\"from\": \"3\", \"to\": \"1\"}]; classes not listed stay")]
    mapping: Option<Vec<RemapRow>>,
    #[schemars(description = "Or: add this whole number to every class id")]
    offset: Option<i64>,
    #[schemars(description = "Only count what would change (default true); false applies it after the person allows it")]
    dry_run: Option<bool>,
}

#[derive(Debug, Deserialize, Serialize, schemars::JsonSchema)]
struct TemplateRunArgs {
    #[schemars(description = "Automation preset name (see list_templates)")]
    preset: String,
    #[schemars(description = "Apply the boxes to the current image (one undo step); default false returns the match or candidates only")]
    apply: Option<bool>,
}

#[derive(Debug, Deserialize, Serialize, schemars::JsonSchema)]
#[serde(rename_all = "camelCase")]
struct FindSimilarArgs {
    #[schemars(description = "Use this box as the template (its class is the default class of the new boxes)")]
    annotation_id: Option<String>,
    #[schemars(description = "Or: use this image region in pixels as the template (then classId is required)")]
    region: Option<PixelRegion>,
    #[schemars(description = "Class id of the boxes to add (default: the template box's class)")]
    class_id: Option<Value>,
    #[schemars(description = "Minimum match score 0..1 (default 0.8; lower finds more, with more false matches)")]
    min_score: Option<f64>,
    #[schemars(description = "Most matches to keep (default 300, at most 5000)")]
    max_matches: Option<u32>,
    #[schemars(description = "Drop matches that overlap an existing box, such as the template itself (default true)")]
    skip_overlapping: Option<bool>,
    #[schemars(description = "Add the matches as boxes (one undo step); default false only returns them")]
    apply: Option<bool>,
    #[schemars(description = "Index of the first candidate to list (default 0)")]
    offset: Option<u32>,
    #[schemars(description = "Candidates to list (default 100, at most 5000)")]
    limit: Option<u32>,
}

#[derive(Debug, Deserialize, Serialize, schemars::JsonSchema)]
#[serde(rename_all = "camelCase")]
struct ApplyLayoutArgs {
    #[schemars(description = "Layout name (see list_templates)")]
    layout: String,
    #[schemars(
        description = "Where the layout's anchor (the top-left of the box set as saved) goes, in image pixels; omit x and y to place it where it was saved"
    )]
    x: Option<f64>,
    #[schemars(description = "See x")]
    y: Option<f64>,
    #[schemars(description = "Remove every existing box first (default false)")]
    replace_existing: Option<bool>,
    #[schemars(description = "New annotationIds to list (default 500)")]
    limit: Option<u32>,
}

#[derive(Debug, Deserialize, Serialize, schemars::JsonSchema)]
#[serde(rename_all = "camelCase")]
struct SaveLayoutArgs {
    #[schemars(description = "Layout name")]
    name: String,
    #[schemars(description = "These boxes (default: the selected boxes, see scope)")]
    annotation_ids: Option<Vec<String>>,
    #[schemars(description = "Without annotationIds: \"selected\" (default) or \"all\" boxes of the current image")]
    scope: Option<String>,
    #[schemars(description = "Replace a layout with the same name (default false: that is an error)")]
    overwrite: Option<bool>,
}

#[derive(Debug, Deserialize, Serialize, schemars::JsonSchema)]
struct LoadModelArgs {
    #[schemars(description = "Absolute path of a YOLO Detection .onnx model")]
    path: String,
}

#[derive(Debug, Deserialize, Serialize, schemars::JsonSchema)]
#[serde(rename_all = "camelCase")]
struct InferenceArgs {
    #[schemars(description = "Every image of the folder instead of the current one (the person must allow it)")]
    all_images: Option<bool>,
    #[schemars(description = "Confidence threshold 0..1 (default: the panel's)")]
    confidence: Option<f64>,
    #[schemars(description = "NMS IoU threshold 0..1 (default: the panel's)")]
    iou: Option<f64>,
    #[schemars(description = "Most detections per image, 1..30000 (default: the panel's)")]
    max_detections: Option<u32>,
}

#[derive(Clone)]
struct EasyLabeling {
    tool_router: ToolRouter<Self>,
}

/// Per call: the progress token, the peer to send progress to, and the cancellation.
type Context = (RequestMetaObject, Peer<RoleServer>, CancellationToken);

#[tool_router]
impl EasyLabeling {
    #[tool(
        description = "Current state of the Easy Labeling window: open folder, image count, current image and its size, workflow, selected boxes, unsaved changes, and whether the app is busy or the person paused the agent.",
        annotations(read_only_hint = true)
    )]
    async fn app_state(&self, meta: RequestMetaObject, peer: Peer<RoleServer>, ct: CancellationToken) -> CallToolResult {
        forward("app_state", json!({}), (meta, peer, ct)).await
    }

    #[tool(
        description = "Open an image folder in the app, as the Open folder button does. The person approves it in a dialog first (declined if they refuse). The current image's labels are saved first when auto-save is on.",
        annotations(read_only_hint = false, destructive_hint = false)
    )]
    async fn open_folder(
        &self,
        Parameters(args): Parameters<OpenFolderArgs>,
        meta: RequestMetaObject,
        peer: Peer<RoleServer>,
        ct: CancellationToken,
    ) -> CallToolResult {
        forward("open_folder", to_value(&args), (meta, peer, ct)).await
    }

    #[tool(
        description = "Images of the open folder in list order: name, box count when known, whether it has labels, and review findings.",
        annotations(read_only_hint = true)
    )]
    async fn list_images(
        &self,
        Parameters(args): Parameters<ListImagesArgs>,
        meta: RequestMetaObject,
        peer: Peer<RoleServer>,
        ct: CancellationToken,
    ) -> CallToolResult {
        forward("list_images", to_value(&args), (meta, peer, ct)).await
    }

    #[tool(
        description = "Show another image, as clicking it in the image list does (the current labels are saved first when auto-save is on). Give `image` or `step`.",
        annotations(read_only_hint = false, destructive_hint = false)
    )]
    async fn go_to_image(
        &self,
        Parameters(args): Parameters<GoToImageArgs>,
        meta: RequestMetaObject,
        peer: Peer<RoleServer>,
        ct: CancellationToken,
    ) -> CallToolResult {
        forward("go_to_image", to_value(&args), (meta, peer, ct)).await
    }

    #[tool(description = "Class ids, names and colours of the loaded class file.", annotations(read_only_hint = true))]
    async fn get_classes(&self, meta: RequestMetaObject, peer: Peer<RoleServer>, ct: CancellationToken) -> CallToolResult {
        forward("get_classes", json!({}), (meta, peer, ct)).await
    }

    #[tool(
        description = "Boxes on the current image as the canvas has them, unsaved edits included: annotationId, classId, className, x0/y0/x1/y1 in image pixels, hidden, selected. Paged (default 200 per call) with countsByClass and total for the whole image.",
        annotations(read_only_hint = true)
    )]
    async fn get_boxes(
        &self,
        Parameters(args): Parameters<GetBoxesArgs>,
        meta: RequestMetaObject,
        peer: Peer<RoleServer>,
        ct: CancellationToken,
    ) -> CallToolResult {
        forward("get_boxes", to_value(&args), (meta, peer, ct)).await
    }

    #[tool(
        description = "Rows of an image's saved label file, as normalized boxes (0..1 of the image size). For the current image use get_boxes, which includes unsaved edits and pixel coordinates.",
        annotations(read_only_hint = true)
    )]
    async fn read_labels(
        &self,
        Parameters(args): Parameters<ReadLabelsArgs>,
        meta: RequestMetaObject,
        peer: Peer<RoleServer>,
        ct: CancellationToken,
    ) -> CallToolResult {
        forward("read_labels", to_value(&args), (meta, peer, ct)).await
    }

    #[tool(
        description = "A PNG of the canvas as the person sees it (image, boxes, tags and review marks at the current zoom), or a zoomed crop around one box (annotationId) or an image region, plus how its pixels map to image pixels. The crop does not change the person's view.",
        annotations(read_only_hint = true)
    )]
    async fn capture_view(
        &self,
        Parameters(args): Parameters<CaptureViewArgs>,
        meta: RequestMetaObject,
        peer: Peer<RoleServer>,
        ct: CancellationToken,
    ) -> CallToolResult {
        forward("capture_view", to_value(&args), (meta, peer, ct)).await
    }
}

#[tool_router(router = edit_router)]
impl EasyLabeling {
    #[tool(
        description = "Add boxes to the current image (one undo step). Returns their annotationIds; the new boxes become the selection.",
        annotations(read_only_hint = false, destructive_hint = false)
    )]
    async fn add_boxes(
        &self,
        Parameters(args): Parameters<AddBoxesArgs>,
        meta: RequestMetaObject,
        peer: Peer<RoleServer>,
        ct: CancellationToken,
    ) -> CallToolResult {
        forward("add_boxes", to_value(&args), (meta, peer, ct)).await
    }

    #[tool(
        description = "Move/resize boxes (any of x0, y0, x1, y1) and/or change their class, by annotationId. All updates of one call are one undo step.",
        annotations(read_only_hint = false, destructive_hint = false)
    )]
    async fn update_boxes(
        &self,
        Parameters(args): Parameters<UpdateBoxesArgs>,
        meta: RequestMetaObject,
        peer: Peer<RoleServer>,
        ct: CancellationToken,
    ) -> CallToolResult {
        forward("update_boxes", to_value(&args), (meta, peer, ct)).await
    }

    #[tool(description = "Delete boxes by annotationId (one undo step; undo brings them back).", annotations(read_only_hint = false, destructive_hint = false))]
    async fn delete_boxes(
        &self,
        Parameters(args): Parameters<DeleteBoxesArgs>,
        meta: RequestMetaObject,
        peer: Peer<RoleServer>,
        ct: CancellationToken,
    ) -> CallToolResult {
        forward("delete_boxes", to_value(&args), (meta, peer, ct)).await
    }

    #[tool(
        description = "Change which boxes are selected in the app (to show the person, or before an app action). Give annotationIds, classId, or select \"all\"/\"none\".",
        annotations(read_only_hint = false, destructive_hint = false)
    )]
    async fn select_boxes(
        &self,
        Parameters(args): Parameters<SelectBoxesArgs>,
        meta: RequestMetaObject,
        peer: Peer<RoleServer>,
        ct: CancellationToken,
    ) -> CallToolResult {
        forward("select_boxes", to_value(&args), (meta, peer, ct)).await
    }

    #[tool(
        description = "Undo the last edits on the current image (the person's edits too: they share one history).",
        annotations(read_only_hint = false, destructive_hint = false)
    )]
    async fn undo(&self, Parameters(args): Parameters<StepsArgs>, meta: RequestMetaObject, peer: Peer<RoleServer>, ct: CancellationToken) -> CallToolResult {
        forward("undo", to_value(&args), (meta, peer, ct)).await
    }

    #[tool(description = "Redo edits undone on the current image.", annotations(read_only_hint = false, destructive_hint = false))]
    async fn redo(&self, Parameters(args): Parameters<StepsArgs>, meta: RequestMetaObject, peer: Peer<RoleServer>, ct: CancellationToken) -> CallToolResult {
        forward("redo", to_value(&args), (meta, peer, ct)).await
    }

    #[tool(
        description = "Save the current image's labels to its label file, as the Save button does.",
        annotations(read_only_hint = false, destructive_hint = false)
    )]
    async fn save(&self, meta: RequestMetaObject, peer: Peer<RoleServer>, ct: CancellationToken) -> CallToolResult {
        forward("save", json!({}), (meta, peer, ct)).await
    }
}

#[tool_router(router = refine_router)]
impl EasyLabeling {
    #[tool(
        description = "Refine settings of the open folder: Edge/Reclass mode, the pane's Run with and Reclass with choices, preset names, the reclass rule.",
        annotations(read_only_hint = true)
    )]
    async fn get_refine_settings(&self, meta: RequestMetaObject, peer: Peer<RoleServer>, ct: CancellationToken) -> CallToolResult {
        forward("get_refine_settings", json!({}), (meta, peer, ct)).await
    }

    #[tool(
        description = "Snap boxes of the current image to the image edges (Refine, as the pane's Apply buttons). One undo step. Returns counts and moved boxes before/after, flagged ones first (paged). dryRun: true returns the same without moving anything.",
        annotations(read_only_hint = false, destructive_hint = false)
    )]
    async fn run_refine(
        &self,
        Parameters(args): Parameters<RefineRunArgs>,
        meta: RequestMetaObject,
        peer: Peer<RoleServer>,
        ct: CancellationToken,
    ) -> CallToolResult {
        forward("run_refine", to_value(&args), (meta, peer, ct)).await
    }

    #[tool(
        description = "Change the class of boxes on the current image that the reclass rule matches (Reclass Apply). One undo step; changed boxes join the reclass review queue. Read reclassRule from get_refine_settings first: the rule decides what changes. dryRun: true returns the matches without changing them; changesByClass counts every change.",
        annotations(read_only_hint = false, destructive_hint = false)
    )]
    async fn run_reclass(
        &self,
        Parameters(args): Parameters<RefineRunArgs>,
        meta: RequestMetaObject,
        peer: Peer<RoleServer>,
        ct: CancellationToken,
    ) -> CallToolResult {
        forward("run_reclass", to_value(&args), (meta, peer, ct)).await
    }

    #[tool(
        description = "Boxes on the current image waiting for review: Refine flags (weak sides, area or size limits) or reclassed boxes.",
        annotations(read_only_hint = true)
    )]
    async fn review_queue(
        &self,
        Parameters(args): Parameters<ReviewModeArgs>,
        meta: RequestMetaObject,
        peer: Peer<RoleServer>,
        ct: CancellationToken,
    ) -> CallToolResult {
        forward("review_queue", to_value(&args), (meta, peer, ct)).await
    }

    #[tool(
        description = "Approve reviewed boxes (as the pane's Approve / Approve all): they leave the review queue unchanged.",
        annotations(read_only_hint = false, destructive_hint = false)
    )]
    async fn approve(
        &self,
        Parameters(args): Parameters<ApproveArgs>,
        meta: RequestMetaObject,
        peer: Peer<RoleServer>,
        ct: CancellationToken,
    ) -> CallToolResult {
        forward("approve", to_value(&args), (meta, peer, ct)).await
    }

    #[tool(
        description = "Mark images as reviewed or as needing review (the image list's Reviewed / Needs review buttons). Default: the current image.",
        annotations(read_only_hint = false, destructive_hint = false)
    )]
    async fn set_review_status(
        &self,
        Parameters(args): Parameters<ReviewStatusArgs>,
        meta: RequestMetaObject,
        peer: Peer<RoleServer>,
        ct: CancellationToken,
    ) -> CallToolResult {
        forward("set_review_status", to_value(&args), (meta, peer, ct)).await
    }

    #[tool(
        description = "Check every image's label file (duplicates, boxes outside the image, tiny boxes, ...) and list the images with findings.",
        annotations(read_only_hint = true)
    )]
    async fn review_folder(&self, meta: RequestMetaObject, peer: Peer<RoleServer>, ct: CancellationToken) -> CallToolResult {
        forward("review_folder", json!({}), (meta, peer, ct)).await
    }

    #[tool(
        description = "Refine every box of every image in the folder and rewrite the label files. The person must allow it in a dialog; originals are backed up first. Can take minutes.",
        annotations(read_only_hint = false, destructive_hint = true)
    )]
    async fn refine_folder(
        &self,
        Parameters(args): Parameters<FolderRunArgs>,
        meta: RequestMetaObject,
        peer: Peer<RoleServer>,
        ct: CancellationToken,
    ) -> CallToolResult {
        forward("refine_folder", to_value(&args), (meta, peer, ct)).await
    }

    #[tool(
        description = "Reclass the boxes the reclass rule matches in every image of the folder (only class ids change). The person must allow it; originals are backed up first.",
        annotations(read_only_hint = false, destructive_hint = true)
    )]
    async fn reclass_folder(
        &self,
        Parameters(args): Parameters<FolderRunArgs>,
        meta: RequestMetaObject,
        peer: Peer<RoleServer>,
        ct: CancellationToken,
    ) -> CallToolResult {
        forward("reclass_folder", to_value(&args), (meta, peer, ct)).await
    }

    #[tool(
        description = "Change class ids in every label file of the folder (a mapping or an offset). Dry run by default: returns what would change; with dryRun false the person must allow it and originals are backed up.",
        annotations(read_only_hint = false, destructive_hint = true)
    )]
    async fn remap_classes(
        &self,
        Parameters(args): Parameters<RemapArgs>,
        meta: RequestMetaObject,
        peer: Peer<RoleServer>,
        ct: CancellationToken,
    ) -> CallToolResult {
        forward("remap_classes", to_value(&args), (meta, peer, ct)).await
    }
}

#[tool_router(router = auto_router)]
impl EasyLabeling {
    #[tool(
        description = "Saved template-matching automation presets (output mode, layout, class, minimum score) and box layouts.",
        annotations(read_only_hint = true)
    )]
    async fn list_templates(&self, meta: RequestMetaObject, peer: Peer<RoleServer>, ct: CancellationToken) -> CallToolResult {
        forward("list_templates", json!({}), (meta, peer, ct)).await
    }

    #[tool(
        description = "Run an automation preset's template match on the current image (OpenCV). By default only returns the best match (layout presets) or the candidates (multiple-boxes presets); apply: true adds the boxes as the Run on current image button does (one undo step).",
        annotations(read_only_hint = false, destructive_hint = false)
    )]
    async fn run_template_matching(
        &self,
        Parameters(args): Parameters<TemplateRunArgs>,
        meta: RequestMetaObject,
        peer: Peer<RoleServer>,
        ct: CancellationToken,
    ) -> CallToolResult {
        forward("run_template_matching", to_value(&args), (meta, peer, ct)).await
    }

    #[tool(
        description = "Find objects that look like one box (or an image region) on the current image with OpenCV template matching, as Template Matching Setup does with its default settings. Returns candidates best first; apply: true adds them as boxes (one undo step). Matches over existing boxes are skipped by default.",
        annotations(read_only_hint = false, destructive_hint = false)
    )]
    async fn find_similar(
        &self,
        Parameters(args): Parameters<FindSimilarArgs>,
        meta: RequestMetaObject,
        peer: Peer<RoleServer>,
        ct: CancellationToken,
    ) -> CallToolResult {
        forward("find_similar", to_value(&args), (meta, peer, ct)).await
    }

    #[tool(
        description = "Place a saved box layout on the current image (one undo step), at x/y or where it was saved. Boxes falling outside the image are dropped and counted. To place it on a template match, use run_template_matching with a layout preset.",
        annotations(read_only_hint = false, destructive_hint = false)
    )]
    async fn apply_layout(
        &self,
        Parameters(args): Parameters<ApplyLayoutArgs>,
        meta: RequestMetaObject,
        peer: Peer<RoleServer>,
        ct: CancellationToken,
    ) -> CallToolResult {
        forward("apply_layout", to_value(&args), (meta, peer, ct)).await
    }

    #[tool(
        description = "Save boxes of the current image (given ids, the selection, or all) as a named box layout in the layout library, as Save layout does. Returns its anchor (top-left of the box set).",
        annotations(read_only_hint = false, destructive_hint = false)
    )]
    async fn save_layout(
        &self,
        Parameters(args): Parameters<SaveLayoutArgs>,
        meta: RequestMetaObject,
        peer: Peer<RoleServer>,
        ct: CancellationToken,
    ) -> CallToolResult {
        forward("save_layout", to_value(&args), (meta, peer, ct)).await
    }

    #[tool(
        description = "The Inference panel: loaded model, device (WebGPU/WASM), and its confidence, IoU, max detections and input size.",
        annotations(read_only_hint = true)
    )]
    async fn inference_status(&self, meta: RequestMetaObject, peer: Peer<RoleServer>, ct: CancellationToken) -> CallToolResult {
        forward("inference_status", json!({}), (meta, peer, ct)).await
    }

    #[tool(
        description = "Load a YOLO Detection .onnx model into the Inference panel, as choosing it there does.",
        annotations(read_only_hint = false, destructive_hint = false)
    )]
    async fn load_model(
        &self,
        Parameters(args): Parameters<LoadModelArgs>,
        meta: RequestMetaObject,
        peer: Peer<RoleServer>,
        ct: CancellationToken,
    ) -> CallToolResult {
        forward("load_model", to_value(&args), (meta, peer, ct)).await
    }

    #[tool(
        description = "Run the loaded model on the current image (or every image). Results are written to the model's own label folder (inference-<model>), which becomes the active label set; the existing labels are not changed.",
        annotations(read_only_hint = false, destructive_hint = false)
    )]
    async fn run_inference(
        &self,
        Parameters(args): Parameters<InferenceArgs>,
        meta: RequestMetaObject,
        peer: Peer<RoleServer>,
        ct: CancellationToken,
    ) -> CallToolResult {
        forward("run_inference", to_value(&args), (meta, peer, ct)).await
    }
}

impl EasyLabeling {
    fn new() -> Self {
        let mut tool_router = Self::tool_router() + Self::edit_router() + Self::refine_router() + Self::auto_router();
        for route in tool_router.map.values_mut() {
            route.attr.input_schema = std::sync::Arc::new(portable_schema(&route.attr.input_schema));
        }
        EasyLabeling { tool_router }
    }
}

/// A tool's input schema in the plainest JSON Schema every MCP client accepts (Gemini and OpenAI-compatible
/// clients refuse `$ref`, type arrays and untyped values): `$defs` inlined, `$schema` and `format` dropped,
/// `["T", "null"]` reduced to `T` (the field stays optional by not being required), untyped values (class
/// ids, which the page reads as text or number) typed as strings.
fn portable_schema(schema: &JsonObject) -> JsonObject {
    let mut root = schema.clone();
    let defs = root.remove("$defs").unwrap_or(Value::Null);
    root.remove("$schema");
    let mut node = Value::Object(root);
    simplify(&mut node, &defs, false);
    match node {
        Value::Object(object) => object,
        _ => schema.clone(),
    }
}

fn simplify(node: &mut Value, defs: &Value, nested: bool) {
    let Some(object) = node.as_object_mut() else { return };
    // An optional struct is `anyOf: [{$ref}, {type: null}]`: keep the non-null branch.
    if let Some(Value::Array(branches)) = object.remove("anyOf") {
        if let Some(Value::Object(branch)) = branches.into_iter().find(|branch| branch.get("type").and_then(Value::as_str) != Some("null")) {
            for (key, value) in branch {
                object.entry(key).or_insert(value);
            }
        }
    }
    if let Some(Value::String(reference)) = object.remove("$ref") {
        if let Some(Value::Object(definition)) = defs.get(reference.trim_start_matches("#/$defs/")) {
            for (key, value) in definition {
                object.entry(key.clone()).or_insert_with(|| value.clone());
            }
        }
    }
    object.remove("format");
    if let Some(Value::Array(types)) = object.get("type") {
        let single = types.iter().find(|kind| kind.as_str() != Some("null")).cloned().unwrap_or_else(|| json!("string"));
        object.insert("type".into(), single);
    }
    if nested && !object.contains_key("type") {
        object.insert("type".into(), json!("string"));
    }
    if let Some(Value::Object(properties)) = object.get_mut("properties") {
        for property in properties.values_mut() {
            // A field without a description is the boolean schema `true` (any value).
            if !property.is_object() {
                *property = json!({});
            }
            simplify(property, defs, true);
        }
    }
    if let Some(items) = object.get_mut("items") {
        simplify(items, defs, true);
    }
}

#[tool_handler(router = self.tool_router)]
impl ServerHandler for EasyLabeling {
    fn get_info(&self) -> ServerConfig {
        ServerConfig::new(ServerCapabilities::builder().enable_tools().build())
            .with_server_info(Implementation::new("easy-labeling", env!("CARGO_PKG_VERSION")))
            .with_instructions(INSTRUCTIONS)
    }
}

fn to_value<T: Serialize>(args: &T) -> Value {
    serde_json::to_value(args).unwrap_or_else(|_| json!({}))
}

async fn forward(tool: &str, args: Value, context: Context) -> CallToolResult {
    match exchange(tool, args, context).await {
        Ok((result, body)) => {
            let mut content = vec![ContentBlock::text(serde_json::to_string_pretty(&result).unwrap_or_default())];
            if !body.is_empty() {
                content.push(ContentBlock::image(base64::engine::general_purpose::STANDARD.encode(body), "image/png"));
            }
            CallToolResult::success(content)
        }
        Err((code, message)) => CallToolResult::error(vec![ContentBlock::text(format!("{code}: {message}"))]),
    }
}

type Failure = (String, String);

fn failure(code: &str, message: impl Into<String>) -> Failure {
    (code.to_string(), message.into())
}

fn io_failure(error: std::io::Error) -> Failure {
    failure("failed", format!("Connection to the app failed: {error}"))
}

async fn open_pipe() -> Result<tokio::net::windows::named_pipe::NamedPipeClient, Failure> {
    let name = pipe_name();
    for _ in 0..50 {
        match ClientOptions::new().open(&name) {
            Ok(pipe) => return Ok(pipe),
            // Every instance taken for a moment: the app makes the next one right after each connect.
            Err(error) if error.raw_os_error() == Some(ERROR_PIPE_BUSY) => tokio::time::sleep(Duration::from_millis(20)).await,
            Err(_) => break,
        }
    }
    Err(failure("app_not_running", "Easy Labeling is not running, or is a version without agent support. Ask the person to start it."))
}

/// One call over its own pipe connection: hello, call, then progress frames until the result.
async fn exchange(tool: &str, args: Value, (meta, peer, ct): Context) -> Result<(Value, Vec<u8>), Failure> {
    let (mut read, mut write) = tokio::io::split(open_pipe().await?);
    // The agent's client (from MCP initialize), shown in the app's Agent panel.
    let client = peer.peer_info().map(|info| json!({ "name": info.client_info.name, "version": info.client_info.version }));
    write_frame(&mut write, &json!({ "type": "hello", "protocol": PROTOCOL, "client": client }), &[]).await.map_err(io_failure)?;
    let closed = || failure("failed", "The app closed the connection.");
    let (hello, _) = read_frame(&mut read).await.map_err(io_failure)?.ok_or_else(closed)?;
    if hello["protocol"].as_u64() != Some(PROTOCOL) {
        return Err(failure(
            "version_mismatch",
            format!("The app speaks agent protocol {}, this server {PROTOCOL}; install matching versions.", hello["protocol"]),
        ));
    }
    write_frame(&mut write, &json!({ "type": "call", "id": "1", "tool": tool, "args": args }), &[]).await.map_err(io_failure)?;
    let token = meta.get_progress_token();
    // Progress values must grow; heartbeats and the app's own progress share this counter.
    let mut sent = 0.0_f64;
    let mut heartbeat = tokio::time::interval(HEARTBEAT);
    heartbeat.tick().await;
    loop {
        let frame = tokio::select! {
            frame = read_frame(&mut read) => frame,
            _ = ct.cancelled() => {
                let _ = write_frame(&mut write, &json!({ "type": "cancel", "id": "1" }), &[]).await;
                return Err(failure("cancelled", "Cancelled."));
            }
            // Clients with a tool time limit (Codex: 60 s by default) extend it on progress; long folder runs need that.
            _ = heartbeat.tick(), if token.is_some() => {
                if let Some(token) = &token {
                    sent += 1.0;
                    let _ = peer.notify_progress(ProgressNotificationParam::new(token.clone(), sent).with_message("Still working in Easy Labeling")).await;
                }
                continue;
            }
        };
        let (header, body) = frame.map_err(io_failure)?.ok_or_else(closed)?;
        match header["type"].as_str() {
            Some("progress") => {
                if let Some(token) = &token {
                    let done = header["done"].as_f64().unwrap_or(0.0);
                    sent = if done > sent { done } else { sent + 1.0 };
                    let mut update = ProgressNotificationParam::new(token.clone(), sent);
                    if let Some(total) = header["total"].as_f64().filter(|total| *total >= sent) {
                        update = update.with_total(total);
                    }
                    if let Some(message) = header["message"].as_str() {
                        update = update.with_message(message);
                    }
                    let _ = peer.notify_progress(update).await;
                }
            }
            Some("result") if header["ok"] == true => return Ok((header["result"].clone(), body)),
            Some("result") => {
                let error = &header["error"];
                return Err(failure(error["code"].as_str().unwrap_or("failed"), error["message"].as_str().unwrap_or("The app reported an error.")));
            }
            _ => {}
        }
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let service = EasyLabeling::new().serve(rmcp::transport::stdio()).await?;
    service.waiting().await?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn schemas_are_plain_enough_for_every_client() {
        let tools = EasyLabeling::new().tool_router.list_all();
        for tool in &tools {
            let text = serde_json::to_string(&*tool.input_schema).expect("schema");
            for banned in ["$ref", "$defs", "$schema", "\"format\"", "\"type\":["] {
                assert!(!text.contains(banned), "{} schema has {banned}: {text}", tool.name);
            }
            fn typed(node: &Value, path: &str) {
                for (name, property) in node["properties"].as_object().into_iter().flatten() {
                    assert!(property["type"].is_string(), "{path}.{name} has no single type");
                    typed(property, &format!("{path}.{name}"));
                    if property["items"].is_object() {
                        assert!(property["items"]["type"].is_string(), "{path}.{name}[] has no single type");
                        typed(&property["items"], &format!("{path}.{name}[]"));
                    }
                }
            }
            typed(&Value::Object((*tool.input_schema).clone()), &tool.name);
        }
        let add = tools.iter().find(|tool| tool.name == "add_boxes").expect("add_boxes");
        let new_box = &add.input_schema["properties"]["boxes"]["items"];
        assert_eq!(new_box["properties"]["classId"]["type"], "string");
        assert_eq!(new_box["required"], json!(["classId", "x0", "y0", "x1", "y1"]));
        assert_eq!(add.input_schema["required"], json!(["boxes"]));
    }

    #[test]
    fn tools_match_the_plan_and_are_described() {
        let tools = EasyLabeling::new().tool_router.list_all();
        let mut names: Vec<&str> = tools.iter().map(|tool| tool.name.as_ref()).collect();
        names.sort_unstable();
        assert_eq!(
            names,
            [
                "add_boxes",
                "app_state",
                "apply_layout",
                "approve",
                "capture_view",
                "delete_boxes",
                "find_similar",
                "get_boxes",
                "get_classes",
                "get_refine_settings",
                "go_to_image",
                "inference_status",
                "list_images",
                "list_templates",
                "load_model",
                "open_folder",
                "read_labels",
                "reclass_folder",
                "redo",
                "refine_folder",
                "remap_classes",
                "review_folder",
                "review_queue",
                "run_inference",
                "run_reclass",
                "run_refine",
                "run_template_matching",
                "save",
                "save_layout",
                "select_boxes",
                "set_review_status",
                "undo",
                "update_boxes"
            ]
        );
        for tool in &tools {
            assert!(tool.description.as_deref().is_some_and(|text| text.len() > 30), "{} needs a description", tool.name);
            assert!(tool.annotations.as_ref().and_then(|notes| notes.read_only_hint).is_some(), "{} needs a read-only hint", tool.name);
        }
        let capture = tools.iter().find(|tool| tool.name == "capture_view").expect("capture_view");
        assert!(capture.input_schema.get("properties").and_then(|properties| properties.get("maxSide")).is_some());
    }
}
