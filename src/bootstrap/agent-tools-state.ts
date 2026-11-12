/**
 * Agent tools for the app's state and navigation (stage 1 of docs/AGENT_MCP_PLAN_KO.md, section 4.1).
 * Each tool calls what the app's own buttons and lists call.
 */
import type { AppState } from "../app/state.js";
import { hasDirtyDocuments } from "../app/document-status.js";
import { matchBoxes, summarizeComparison, type ImageMatch } from "../domain/annotations/label-compare.js";
import { maskRegions } from "../domain/annotations/mask-regions.js";
import { imageFileNameToBaseName } from "../domain/files/image-names.js";
import { analyzeBoxes, type StatBox } from "../domain/refine/box-statistics.js";
import { evenSample } from "../domain/refine/folder-summary.js";
import { parseYoloRows } from "../domain/yolo/yolo.js";
import { AgentImageResult, AgentToolError, LIST_PAGE_MAX, listPage, optionalArg, type AgentTool } from "../features/agent/agent-api.js";
import { getRectBounds } from "../features/canvas/arrange.js";
import { getColorForClass } from "../features/canvas/colors.js";
import { classFilePath } from "../features/classes/class-file-service.js";
import { isNotFoundError, readTextFileByName } from "../platform/file-system-access.js";
import type { DirectoryHandleLike } from "../types/files.js";
import { ensureAnnotationId, isRectObject, type FabricRectLike } from "../features/canvas/fabric-types.js";
import type { RuntimeCanvasController } from "./canvas-controller-adapter.js";
import type { RuntimeFileSystem } from "./file-system-adapter.js";

export interface AgentStateToolDeps {
  state: AppState;
  canvasController: RuntimeCanvasController;
  fileSystem: RuntimeFileSystem;
  documentRef: Document;
  openImageFolder?(folder: Promise<FileSystemDirectoryHandle>): Promise<void>;
  directory(entry: { path: string; name: string; directory: boolean }): FileSystemDirectoryHandle;
  pathOf(handle: unknown): string | null;
  busyReason(): string | null;
  paused(): boolean;
}

const LIST_LIMIT = 1000;
/** get_boxes without ids: boxes per page by default (SEM images often hold thousands). */
const BOX_PAGE = 200;
const CAPTURE_SIDE = { min: 256, max: 4096, default: 1280 };
/** Most boxes one capture_view sheet holds. */
const SHEET_MAX = 36;
/** Captures remembered per window to answer "unchanged" (see captureView). */
const CAPTURE_MEMORY = 50;
const round2 = (value: number): number => Math.round(value * 100) / 100;

/** The current image's size in pixels (the canvas base image), or null when none is shown. */
function imageSize(canvasController: RuntimeCanvasController): { width: number; height: number } | null {
  const base = (canvasController.raw.getObjects("image") as Array<{ _isBaseImage?: boolean; width?: number; height?: number }>)
    .find((object) => object._isBaseImage);
  return base?.width && base.height ? { width: base.width, height: base.height } : null;
}

function rects(canvasController: RuntimeCanvasController): FabricRectLike[] {
  return canvasController.raw.getObjects("rect").filter(isRectObject);
}

function selectedIds(canvasController: RuntimeCanvasController): string[] {
  return canvasController.raw.canvas.getActiveObjects().filter(isRectObject).map(ensureAnnotationId);
}

export function createAgentStateTools(deps: AgentStateToolDeps): Record<string, AgentTool> {
  const { state, canvasController, fileSystem } = deps;
  const session = state.session;
  const pathOrName = (handle: { name?: string } | null): string | null => handle ? deps.pathOf(handle) ?? handle.name ?? null : null;
  const requireFolder = (): void => {
    if (!session.imageFolderHandle) throw new AgentToolError("no_folder", "No folder is open. Use open_folder first.");
  };
  const requireImage = (): { width: number; height: number } => {
    requireFolder();
    const size = imageSize(canvasController);
    if (!session.currentImageFile || !size) throw new AgentToolError("no_image", "No image is shown. Use go_to_image first.");
    return size;
  };
  const currentSummary = () => ({
    currentImage: session.currentImageFile?.name ?? null,
    imageSize: imageSize(canvasController),
    boxCount: rects(canvasController).length
  });

  const maskSummary = () => {
    const snapshot = canvasController.raw.getSegmentationDocumentSnapshot?.();
    if (!snapshot) return {};
    const { pixelsByClass, regionsByClass } = maskRegions(snapshot.mask, snapshot.width, snapshot.height);
    return { mask: { pixelsByClass, regionsByClass } };
  };

  const appState: AgentTool = {
    changesApp: false,
    run: async () => ({
      folder: pathOrName(session.imageFolderHandle),
      labelFolder: pathOrName(session.labelFolderHandle),
      imageCount: session.imageFiles.length,
      ...currentSummary(),
      workflow: session.workflow,
      ...(session.workflow === "segmentation" && session.currentImageFile ? maskSummary() : {}),
      selectedIds: selectedIds(canvasController),
      unsavedChanges: hasDirtyDocuments(state),
      autoSave: state.view.isAutoSaveEnabled,
      busy: deps.busyReason(),
      agentPaused: deps.paused()
    })
  };

  const openFolder: AgentTool = {
    changesApp: true,
    async run(args) {
      const entry = args.entry as { path: string; name: string; directory: boolean } | undefined;
      if (!entry?.path) throw new AgentToolError("invalid_args", "path is required");
      if (!deps.openImageFolder) throw new AgentToolError("failed", "The app cannot open folders for the agent yet.");
      await deps.openImageFolder(Promise.resolve(deps.directory(entry)));
      const opened = session.imageFolderHandle ? deps.pathOf(session.imageFolderHandle) : null;
      if (opened?.toLowerCase() !== entry.path.toLowerCase()) {
        throw new AgentToolError("failed", "The folder did not open; the app shows why.");
      }
      return { folder: opened, labelFolder: pathOrName(session.labelFolderHandle), imageCount: session.imageFiles.length, ...currentSummary() };
    }
  };

  const listImages: AgentTool = {
    changesApp: false,
    async run(args) {
      requireFolder();
      const offset = Math.max(0, Math.floor(optionalArg(args, "offset", "number") ?? 0));
      const limit = Math.min(LIST_LIMIT, Math.max(1, Math.floor(optionalArg(args, "limit", "number") ?? 100)));
      const filter = optionalArg(args, "filter", "string") ?? "all";
      if (!["all", "labeled", "unlabeled", "issues"].includes(filter)) throw new AgentToolError("invalid_args", "filter must be all, labeled, unlabeled or issues");
      const images = session.imageFiles.map((file) => {
        const detection = session.imageWorkflowStatus.get(file.name)?.detection;
        const issues = session.reviewFindings.get(file.name)?.issues ?? [];
        return {
          name: file.name,
          labeled: detection ? detection.hasAnnotation : null,
          boxCount: detection ? detection.boxCount : null,
          reviewIssues: issues.map((issue) => ({ type: issue.type, severity: issue.severity, message: issue.message }))
        };
      }).filter((image) => filter === "all"
        || (filter === "labeled" && image.labeled === true)
        || (filter === "unlabeled" && image.labeled === false)
        || (filter === "issues" && image.reviewIssues.length > 0));
      return { total: images.length, offset, images: images.slice(offset, offset + limit), currentImage: session.currentImageFile?.name ?? null };
    }
  };

  const goToImage: AgentTool = {
    changesApp: true,
    async run(args) {
      requireFolder();
      const name = optionalArg(args, "image", "string");
      const step = optionalArg(args, "step", "number");
      let target;
      if (name !== undefined) {
        target = session.imageFiles.find((file) => file.name === name);
        if (!target) throw new AgentToolError("not_found", `No image named ${name} in the open folder.`);
      } else if (step !== undefined) {
        const index = session.imageFiles.findIndex((file) => file.name === session.currentImageFile?.name);
        target = session.imageFiles[Math.min(session.imageFiles.length - 1, Math.max(0, index + Math.trunc(step)))];
      } else {
        throw new AgentToolError("invalid_args", "Give image or step.");
      }
      if (target && target.name !== session.currentImageFile?.name) await fileSystem.loadImage(target);
      if (session.currentImageFile?.name !== target?.name) throw new AgentToolError("failed", "The image did not open; the app shows why.");
      return currentSummary();
    }
  };

  const getClasses: AgentTool = {
    changesApp: false,
    run: async () => ({
      classFile: session.selectedClassFile ? classFilePath(session.selectedClassFile) : null,
      classes: [...session.classNames].map(([id, name]) => ({ id, name, color: getColorForClass(id) }))
    })
  };

  const getBoxes: AgentTool = {
    changesApp: false,
    async run(args) {
      const size = requireImage();
      const ids = optionalArg(args, "ids", "object");
      const wanted = Array.isArray(ids) ? new Set(ids.map(String)) : null;
      const classFilter = args.classId === undefined || args.classId === null ? null : String(args.classId);
      const selected = new Set(selectedIds(canvasController));
      const all = rects(canvasController);
      const countsByClass: Record<string, number> = {};
      for (const rect of all) countsByClass[String(rect.labelClass ?? "0")] = (countsByClass[String(rect.labelClass ?? "0")] ?? 0) + 1;
      const matching = all.filter((rect) => (!wanted || wanted.has(ensureAnnotationId(rect))) && (classFilter === null || String(rect.labelClass ?? "0") === classFilter));
      const page = listPage(matching, args, wanted ? LIST_PAGE_MAX : BOX_PAGE);
      const boxes = page.items.map((rect) => {
        rect.setCoords(); // bounds lag right after a draw
        const bounds = getRectBounds(rect);
        const annotationId = ensureAnnotationId(rect);
        const classId = String(rect.labelClass ?? "0");
        return {
          annotationId,
          classId,
          className: session.classNames.get(classId) ?? null,
          x0: bounds.left,
          y0: bounds.top,
          x1: bounds.right,
          y1: bounds.bottom,
          hidden: rect.visible === false,
          selected: selected.has(annotationId)
        };
      });
      return { image: session.currentImageFile?.name, ...size, units: "pixels", countsByClass, total: page.total, offset: page.offset, truncated: page.truncated, boxes };
    }
  };

  /** Boxes of the current image as the canvas has them (pixels, unsaved edits included). */
  const canvasStatBoxes = (): StatBox[] => rects(canvasController).map((rect) => {
    rect.setCoords();
    const bounds = getRectBounds(rect);
    return { id: ensureAnnotationId(rect), classId: String(rect.labelClass ?? "0"), x0: bounds.left, y0: bounds.top, x1: bounds.right, y1: bounds.bottom };
  });

  const analyzeBoxesTool: AgentTool = {
    changesApp: false,
    async run(args) {
      requireFolder();
      const classFilter = args.classId === undefined || args.classId === null ? null : String(args.classId);
      const keep = (boxes: StatBox[]) => classFilter === null ? boxes : boxes.filter((box) => box.classId === classFilter);
      const files = session.imageFiles;
      let indexes: number[] | null = null;
      if (Array.isArray(args.images)) {
        const names = args.images.map(String);
        const missingNames = names.filter((name) => !files.some((file) => file.name === name));
        if (missingNames.length) throw new AgentToolError("not_found", `No image named ${missingNames.slice(0, 5).join(", ")} in the open folder.`);
        indexes = names.map((name) => files.findIndex((file) => file.name === name));
      } else {
        const sample = optionalArg(args, "sample", "number");
        if (sample !== undefined) {
          if (!Number.isInteger(sample) || sample < 1) throw new AgentToolError("invalid_args", "sample must be a whole number of images, 1 or more.");
          indexes = evenSample(files.length, sample);
        }
      }
      if (!indexes) {
        // The current image: pixels, findings by annotationId.
        requireImage();
        const result = analyzeBoxes(keep(canvasStatBoxes()));
        const findings = listPage(result.findings, args, 50);
        return {
          image: session.currentImageFile?.name, units: "pixels", byClass: result.byClass, counts: result.counts,
          findings: findings.items, findingsTotal: findings.total, truncated: findings.truncated, missing: result.missing.slice(0, LIST_PAGE_MAX)
        };
      }
      // Saved label files of several images: normalized units, findings by row index (as read_labels numbers them).
      if (!session.labelFolderHandle) throw new AgentToolError("no_folder", "The open folder has no label folder.");
      const totals = { size: 0, "off-row": 0, "off-column": 0, crowded: 0, overlap: 0, missing: 0 };
      const images: Array<{ image: string; boxes: number; counts: typeof totals; findings: unknown[]; missing: unknown[] }> = [];
      for (const index of indexes) {
        const name = files[index]!.name;
        const rows = parseYoloRows(await fileSystem.readDetectionLabels(name), 1, 1);
        const boxes = keep(rows.map((row, line) => ({ id: String(line), classId: row.labelClass, x0: row.rectLeft, y0: row.rectTop, x1: row.rectLeft + row.rectWidth, y1: row.rectTop + row.rectHeight })));
        const result = analyzeBoxes(boxes);
        for (const key of Object.keys(totals) as Array<keyof typeof totals>) totals[key] += result.counts[key];
        images.push({ image: name, boxes: boxes.length, counts: result.counts, findings: result.findings.slice(0, 5).map(({ id, ...finding }) => ({ index: Number(id), ...finding })), missing: result.missing.slice(0, 5) });
      }
      const issues = (image: (typeof images)[number]) => Object.values(image.counts).reduce((sum, count) => sum + count, 0);
      images.sort((a, b) => issues(b) - issues(a));
      const page = listPage(images.filter((image) => issues(image) > 0), args, 20);
      return { units: "normalized", imagesChecked: indexes.length, counts: totals, imagesWithFindings: page.total, images: page.items, truncated: page.truncated };
    }
  };

  /** A label folder inside the image folder, by name. */
  const subfolder = async (name: string): Promise<DirectoryHandleLike> => {
    if (!name || /[\\/]/.test(name) || name === "." || name === "..") throw new AgentToolError("invalid_args", `${name || "(empty)"}: give the name of a folder inside the image folder, e.g. "label_gt".`);
    try {
      return await (session.imageFolderHandle as unknown as DirectoryHandleLike).getDirectoryHandle(name);
    } catch (error) {
      if (isNotFoundError(error)) throw new AgentToolError("not_found", `No folder named ${name} in the image folder.`);
      throw error;
    }
  };
  const readRows = async (folder: DirectoryHandleLike, image: string, width: number, height: number): Promise<StatBox[]> => {
    let text = "";
    try { text = await readTextFileByName(folder, `${imageFileNameToBaseName(image)}.txt`); } catch (error) { if (!isNotFoundError(error)) throw error; }
    return parseYoloRows(text, width, height).map((row, index) => ({ id: String(index), classId: row.labelClass, x0: row.rectLeft, y0: row.rectTop, x1: row.rectLeft + row.rectWidth, y1: row.rectTop + row.rectHeight }));
  };

  const compareLabels: AgentTool = {
    changesApp: false,
    async run(args, context) {
      requireFolder();
      const referenceName = optionalArg(args, "reference", "string");
      if (!referenceName) throw new AgentToolError("invalid_args", "reference is required: the name of the folder inside the image folder that holds the reference (ground truth) label files.");
      const reference = await subfolder(referenceName);
      const labelsName = optionalArg(args, "labels", "string");
      const labels = labelsName ? await subfolder(labelsName) : session.labelFolderHandle as unknown as DirectoryHandleLike | null;
      if (!labels) throw new AgentToolError("no_folder", "The open folder has no label folder; pass labels.");
      const minIou = optionalArg(args, "iou", "number") ?? 0.5;
      if (!(minIou > 0 && minIou <= 1)) throw new AgentToolError("invalid_args", "iou must be above 0 and at most 1.");
      const classFilter = args.classId === undefined || args.classId === null ? null : String(args.classId);
      const keep = (boxes: StatBox[]) => classFilter === null ? boxes : boxes.filter((box) => box.classId === classFilter);
      const files = session.imageFiles;
      let indexes = files.map((_, index) => index);
      if (Array.isArray(args.images)) {
        const names = args.images.map(String);
        const missingNames = names.filter((name) => !files.some((file) => file.name === name));
        if (missingNames.length) throw new AgentToolError("not_found", `No image named ${missingNames.slice(0, 5).join(", ")} in the open folder.`);
        indexes = names.map((name) => files.findIndex((file) => file.name === name));
      } else {
        const sample = optionalArg(args, "sample", "number");
        if (sample !== undefined) {
          if (!Number.isInteger(sample) || sample < 1) throw new AgentToolError("invalid_args", "sample must be a whole number of images, 1 or more.");
          indexes = evenSample(files.length, sample);
        }
      }
      const matches: ImageMatch[] = [];
      // The current image compares the canvas (unsaved edits, annotationIds) unless another label folder was named.
      const canvasImage = !labelsName && session.labelFolderHandle ? session.currentImageFile?.name ?? null : null;
      for (const [done, index] of indexes.entries()) {
        if (context.signal.aborted) throw new AgentToolError("cancelled", "Cancelled.");
        context.progress(done, indexes.length, files[index]!.name);
        const file = files[index]!;
        const shown = file.name === canvasImage ? imageSize(canvasController) : null;
        // ponytail: decodes each other image only for its size; read sizes from the file headers if folders of large TIFFs make this slow.
        let size = shown;
        if (!size) {
          const image = await fileSystem.decodeImageForAutomation(file);
          size = { width: image.naturalWidth || image.width, height: image.naturalHeight || image.height };
        }
        const labelBoxes = shown ? canvasStatBoxes() : await readRows(labels, file.name, size.width, size.height);
        matches.push(matchBoxes(file.name, keep(labelBoxes), keep(await readRows(reference, file.name, size.width, size.height)), minIou));
      }
      const outliers = Math.min(LIST_PAGE_MAX, Math.max(0, Math.floor(optionalArg(args, "outliers", "number") ?? 20)));
      const summary = summarizeComparison(matches, { classAware: args.classAware !== false, limit: outliers });
      const pixels = (box: StatBox) => ({ id: box.id, classId: box.classId, x0: round2(box.x0), y0: round2(box.y0), x1: round2(box.x1), y1: round2(box.y1) });
      const page = listPage(summary.perImage, args, 20);
      return {
        reference: referenceName, labels: labelsName ?? pathOrName(session.labelFolderHandle as { name?: string } | null), iou: minIou, classAware: args.classAware !== false,
        units: "pixels", ids: canvasImage ? `label ids on ${canvasImage} are annotationIds (the canvas, unsaved edits included); elsewhere ids are label-file row indexes` : "ids are label-file row indexes",
        ...summary,
        perImage: page.items, perImageTotal: page.total, truncated: page.truncated,
        worst: {
          misses: summary.worst.misses.map((item) => ({ image: item.image, reference: pixels(item.reference) })),
          extras: summary.worst.extras.map((item) => ({ image: item.image, label: pixels(item.label) })),
          wrongClass: summary.worst.wrongClass.map((item) => ({ ...item, label: pixels(item.label), reference: pixels(item.reference) })),
          edges: summary.worst.edges.map((item) => ({ ...item, label: pixels(item.label), reference: pixels(item.reference) }))
        }
      };
    }
  };

  const readLabels: AgentTool = {
    changesApp: false,
    async run(args) {
      requireFolder();
      const name = optionalArg(args, "image", "string");
      if (!name) throw new AgentToolError("invalid_args", "image is required");
      if (!session.imageFiles.some((file) => file.name === name)) throw new AgentToolError("not_found", `No image named ${name} in the open folder.`);
      if (!session.labelFolderHandle) return { image: name, units: "normalized", hasLabelFolder: false, boxes: [] };
      const rows = parseYoloRows(await fileSystem.readDetectionLabels(name), 1, 1);
      return {
        image: name,
        units: "normalized",
        boxes: rows.map((row, index) => ({
          index,
          classId: row.labelClass,
          x0: row.rectLeft,
          y0: row.rectTop,
          x1: row.rectLeft + row.rectWidth,
          y1: row.rectTop + row.rectHeight
        }))
      };
    }
  };

  // The PNG last returned for each request; the same request rendering the same pixels answers "unchanged" instead
  // of sending the image again (agents re-capturing to check fill their context with identical images).
  const lastCaptures = new Map<string, { hash: string; at: number; result: unknown }>();
  const captureView: AgentTool = {
    changesApp: false,
    async run(args) {
      const size = requireImage();
      const maxSide = Math.min(CAPTURE_SIDE.max, Math.max(CAPTURE_SIDE.min, Math.floor(optionalArg(args, "maxSide", "number") ?? CAPTURE_SIDE.default)));
      const ids = Array.isArray(args.annotationIds) ? args.annotationIds.map(String) : null;
      const region = ids ? null : captureRegionArg(args, size, canvasController);
      const capture = ids
        ? await captureSheet(deps.documentRef, canvasController, ids, size, maxSide)
        : region ? await captureRegion(deps.documentRef, canvasController, region, maxSide) : await captureCanvas(deps.documentRef, canvasController, maxSide);
      const key = JSON.stringify([session.currentImageFile?.name, session.workflow, maxSide, ids, args.annotationId ?? null, region]);
      const hash = await digest(capture.png);
      const previous = lastCaptures.get(key);
      if (previous && previous.hash === hash && optionalArg(args, "force", "boolean") !== true) {
        return {
          unchanged: true,
          capturedAt: new Date(previous.at).toISOString(),
          note: "Same pixels as your earlier capture with these arguments: nothing in it changed since. Use that image (pass force: true to get it again).",
          ...(previous.result as object)
        };
      }
      lastCaptures.delete(key);
      lastCaptures.set(key, { hash, at: Date.now(), result: capture.result });
      if (lastCaptures.size > CAPTURE_MEMORY) lastCaptures.delete(lastCaptures.keys().next().value!);
      return capture;
    }
  };

  return {
    app_state: appState,
    open_folder: openFolder,
    list_images: listImages,
    go_to_image: goToImage,
    get_classes: getClasses,
    get_boxes: getBoxes,
    read_labels: readLabels,
    analyze_boxes: analyzeBoxesTool,
    compare_labels: compareLabels,
    capture_view: captureView
  };
}

/**
 * The canvas viewport as drawn: every visible canvas layer over the main canvas (image, boxes, tags,
 * Refine marks), scaled so the longer side is at most `maxSide`. imageX = captureX * scale + offsetX.
 */
async function captureCanvas(documentRef: Document, canvasController: RuntimeCanvasController, maxSide: number): Promise<AgentImageResult> {
  const main = documentRef.getElementById("canvas");
  const container = documentRef.getElementById("canvas-container");
  if (!main || !container) throw new AgentToolError("failed", "The canvas is not on the page.");
  const area = main.getBoundingClientRect();
  const ratio = documentRef.defaultView?.devicePixelRatio ?? 1;
  const scale = Math.min(ratio, maxSide / Math.max(area.width, area.height));
  const out = documentRef.createElement("canvas");
  out.width = Math.max(1, Math.round(area.width * scale));
  out.height = Math.max(1, Math.round(area.height * scale));
  const context = out.getContext("2d");
  if (!context) throw new AgentToolError("failed", "Could not draw the capture.");
  for (const layer of container.querySelectorAll("canvas")) {
    const box = layer.getBoundingClientRect();
    if (!box.width || !box.height || layer.hidden || getComputedStyle(layer).visibility === "hidden" || getComputedStyle(layer).display === "none") continue;
    context.drawImage(layer, (box.left - area.left) * scale, (box.top - area.top) * scale, box.width * scale, box.height * scale);
  }
  const blob = await new Promise<Blob | null>((resolve) => out.toBlob(resolve, "image/png"));
  if (!blob) throw new AgentToolError("failed", "Could not encode the capture.");
  const [zoomX, , , zoomY, panX, panY] = canvasController.raw.canvas.viewportTransform;
  return new AgentImageResult({
    width: out.width,
    height: out.height,
    imageFromCapture: { scaleX: 1 / (scale * zoomX), scaleY: 1 / (scale * zoomY), offsetX: -panX / zoomX, offsetY: -panY / zoomY },
    note: "imageX = captureX * scaleX + offsetX; imageY = captureY * scaleY + offsetY"
  }, new Uint8Array(await blob.arrayBuffer()));
}

/** Most a region capture enlarges the image (beyond that it shows only blur). */
const CAPTURE_ZOOM_MAX = 8;

/** capture_view's region: an annotationId (the box plus a margin of half its size, at least 16 px) or {x0, y0, x1, y1}. */
export function captureRegionArg(
  args: Record<string, unknown>,
  size: { width: number; height: number },
  canvasController: RuntimeCanvasController
): { x0: number; y0: number; x1: number; y1: number } | null {
  const id = optionalArg(args, "annotationId", "string");
  let region: { x0: number; y0: number; x1: number; y1: number };
  if (id !== undefined) {
    const rect = rects(canvasController).find((candidate) => ensureAnnotationId(candidate) === id);
    if (!rect) throw new AgentToolError("not_found", `No box with annotationId ${id} on the current image.`);
    region = boxCaptureRegion(rect);
  } else {
    const value = optionalArg(args, "region", "object") as Record<string, unknown> | undefined;
    if (!value) return null;
    const numbers = [value.x0, value.y0, value.x1, value.y1];
    if (!numbers.every((n) => typeof n === "number" && Number.isFinite(n))) throw new AgentToolError("invalid_args", "region needs numbers x0, y0, x1, y1.");
    region = value as unknown as typeof region;
  }
  const clipped = { x0: Math.max(0, region.x0), y0: Math.max(0, region.y0), x1: Math.min(size.width, region.x1), y1: Math.min(size.height, region.y1) };
  if (!(clipped.x1 - clipped.x0 >= 1 && clipped.y1 - clipped.y0 >= 1)) throw new AgentToolError("invalid_args", "region lies outside the image or is under 1 px.");
  return clipped;
}

type FabricRenderCanvas = {
  viewportTransform: number[];
  getZoom(): number;
  toCanvasElement(multiplier: number, crop: { left: number; top: number; width: number; height: number }): HTMLCanvasElement;
  requestRenderAll(): void;
};

/** `region` rendered at `scale` (canvas objects and the Refine marks drawn for that render). The caller redraws the view. */
function renderRegion(
  documentRef: Document,
  canvasController: RuntimeCanvasController,
  region: { x0: number; y0: number; x1: number; y1: number },
  scale: number
): HTMLCanvasElement {
  const canvas = canvasController.raw.canvas as unknown as FabricRenderCanvas;
  const [, , , , panX, panY] = canvas.viewportTransform;
  const zoom = canvas.getZoom();
  // Crop is in view pixels at the current zoom; the multiplier turns that zoom into `scale`.
  const out = canvas.toCanvasElement(scale / zoom, {
    left: region.x0 * zoom + panX, top: region.y0 * zoom + panY, width: (region.x1 - region.x0) * zoom, height: (region.y1 - region.y0) * zoom
  });
  const overlay = documentRef.getElementById("refineOverlayCanvas") as HTMLCanvasElement | null;
  if (overlay && overlay.width === out.width && overlay.height === out.height) out.getContext("2d")?.drawImage(overlay, 0, 0);
  return out;
}

/** The region capture_view zooms to for a box: the box plus a margin of half its size, at least 16 px. */
function boxCaptureRegion(rect: FabricRectLike): { x0: number; y0: number; x1: number; y1: number } {
  rect.setCoords();
  const bounds = getRectBounds(rect);
  const marginX = Math.max(16, (bounds.right - bounds.left) / 2);
  const marginY = Math.max(16, (bounds.bottom - bounds.top) / 2);
  return { x0: bounds.left - marginX, y0: bounds.top - marginY, x1: bounds.right + marginX, y1: bounds.bottom + marginY };
}

const SHEET_LABEL = 18;

/**
 * Many boxes in one PNG: a grid of zoomed cells, one per box in the order given, each labelled with its number
 * and class. Saves a call (and an image) per box when an agent reviews flagged boxes.
 */
async function captureSheet(
  documentRef: Document,
  canvasController: RuntimeCanvasController,
  ids: readonly string[],
  size: { width: number; height: number },
  maxSide: number
): Promise<AgentImageResult> {
  if (ids.length === 0) throw new AgentToolError("invalid_args", "annotationIds is empty.");
  if (ids.length > SHEET_MAX) throw new AgentToolError("invalid_args", `At most ${SHEET_MAX} boxes per sheet; capture the rest in another call.`);
  const byId = new Map(rects(canvasController).map((rect) => [ensureAnnotationId(rect), rect]));
  const missing = ids.filter((id) => !byId.has(id));
  if (missing.length) throw new AgentToolError("not_found", `No box with annotationId ${missing.slice(0, 5).join(", ")} on the current image.`);
  const columns = Math.ceil(Math.sqrt(ids.length));
  const rows = Math.ceil(ids.length / columns);
  const cell = Math.max(48, Math.floor(maxSide / Math.max(columns, rows)) - SHEET_LABEL);
  const sheet = documentRef.createElement("canvas");
  sheet.width = columns * cell;
  sheet.height = rows * (cell + SHEET_LABEL);
  const context = sheet.getContext("2d");
  if (!context) throw new AgentToolError("failed", "Could not draw the capture.");
  context.fillStyle = "#101418";
  context.fillRect(0, 0, sheet.width, sheet.height);
  context.font = "12px sans-serif";
  context.textBaseline = "middle";
  const cells = ids.map((id, index) => {
    const rect = byId.get(id)!;
    const wanted = boxCaptureRegion(rect);
    const region = { x0: Math.max(0, wanted.x0), y0: Math.max(0, wanted.y0), x1: Math.min(size.width, wanted.x1), y1: Math.min(size.height, wanted.y1) };
    const scale = Math.min(CAPTURE_ZOOM_MAX, cell / Math.max(region.x1 - region.x0, region.y1 - region.y0));
    const tile = renderRegion(documentRef, canvasController, region, scale);
    const left = (index % columns) * cell;
    const top = Math.floor(index / columns) * (cell + SHEET_LABEL);
    const x = left + Math.floor((cell - tile.width) / 2);
    const y = top + SHEET_LABEL + Math.floor((cell - tile.height) / 2);
    context.drawImage(tile, x, y);
    const classId = String(rect.labelClass ?? "0");
    context.fillStyle = "#f3f5f7";
    context.fillText(`${index + 1} · class ${classId}`, left + 4, top + SHEET_LABEL / 2);
    context.strokeStyle = "#3a434c";
    context.strokeRect(left + 0.5, top + 0.5, cell - 1, cell + SHEET_LABEL - 1);
    const bounds = getRectBounds(rect);
    return {
      n: index + 1,
      annotationId: id,
      classId,
      box: { x0: round2(bounds.left), y0: round2(bounds.top), x1: round2(bounds.right), y1: round2(bounds.bottom) },
      cell: { x, y, width: tile.width, height: tile.height },
      imageFromCell: { scale: 1 / scale, offsetX: region.x0, offsetY: region.y0 }
    };
  });
  (canvasController.raw.canvas as unknown as FabricRenderCanvas).requestRenderAll();
  const blob = await new Promise<Blob | null>((resolve) => sheet.toBlob(resolve, "image/png"));
  if (!blob) throw new AgentToolError("failed", "Could not encode the capture.");
  return new AgentImageResult({
    width: sheet.width,
    height: sheet.height,
    cells,
    note: "Cells in reading order, numbered as in the image; inside a cell imageX = (captureX - cell.x) * scale + offsetX"
  }, new Uint8Array(await blob.arrayBuffer()));
}

async function digest(png: Uint8Array): Promise<string> {
  const bytes = new Uint8Array(await crypto.subtle.digest("SHA-256", png as Uint8Array<ArrayBuffer>));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * One image region at its own zoom, whatever the person's view shows: the canvas objects re-rendered off screen
 * (Fabric toCanvasElement), plus the Refine marks the overlay draws for that render. The person's view is redrawn after.
 */
async function captureRegion(
  documentRef: Document,
  canvasController: RuntimeCanvasController,
  region: { x0: number; y0: number; x1: number; y1: number },
  maxSide: number
): Promise<AgentImageResult> {
  const canvas = canvasController.raw.canvas as unknown as {
    viewportTransform: number[];
    getZoom(): number;
    toCanvasElement(multiplier: number, crop: { left: number; top: number; width: number; height: number }): HTMLCanvasElement;
    requestRenderAll(): void;
  };
  const width = region.x1 - region.x0;
  const height = region.y1 - region.y0;
  const scale = Math.min(CAPTURE_ZOOM_MAX, maxSide / Math.max(width, height));
  const out = renderRegion(documentRef, canvasController, region, scale);
  canvas.requestRenderAll();
  const blob = await new Promise<Blob | null>((resolve) => out.toBlob(resolve, "image/png"));
  if (!blob) throw new AgentToolError("failed", "Could not encode the capture.");
  return new AgentImageResult({
    width: out.width,
    height: out.height,
    region,
    imageFromCapture: { scaleX: 1 / scale, scaleY: 1 / scale, offsetX: region.x0, offsetY: region.y0 },
    note: "imageX = captureX * scaleX + offsetX; imageY = captureY * scaleY + offsetY"
  }, new Uint8Array(await blob.arrayBuffer()));
}
