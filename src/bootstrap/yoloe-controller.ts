import type { AppState } from "../app/state.js";
import type { RuntimeCanvasController } from "./canvas-controller-adapter.js";
import type { RuntimeFileSystem } from "./file-system-adapter.js";
import type { RuntimeUiManager } from "./ui-manager-adapter.js";
import { isRectObject } from "../features/canvas/fabric-types.js";
import { imagePng, selectedVisualExamples, maskRegionExample, sampleMaskGeometry, decodeYoloeMask, requestYoloe, inferYoloe, usesYoloeOnnx, type VisualExample, type YoloeProfile, type YoloeStatus, type YoloeResult } from "../features/inference/yoloe.js";
import type { Detection } from "../features/inference/yolo.js";
import { getColorForClass, getContrastTextColor } from "../features/canvas/colors.js";
import { installModalFocusManagement } from "../ui/modal-focus.js";
import { parseYoloRows } from "../domain/yolo/yolo.js";
import { normalizeClassName } from "../domain/class-files.js";
import { applyBrushStroke, applyEraseStroke, applyClosedRegionAutoFillFromStroke } from "../features/segmentation/tools.js";
import type { SegmentationRegionBounds } from "../features/segmentation/types.js";
import { maskVisualExamples } from "../features/inference/yoloe.js";
import { parseYoloePreset, listYoloePresets, saveYoloePreset, type YoloePreset } from "../features/inference/yoloe-presets.js";

export function bindYoloeControls(input: { state: AppState; documentRef: Document; canvasController: RuntimeCanvasController; fileSystem: RuntimeFileSystem; uiManager: RuntimeUiManager }): () => void {
  const { state, documentRef, canvasController, fileSystem, uiManager } = input;
  if (!documentRef.getElementById("yoloeInferenceControls")) return () => {};
  const el = <T extends HTMLElement>(id: string): T => documentRef.getElementById(id) as T;
  const modelSelect = el<HTMLSelectElement>("yoloeModelSelect");
  const bundled = usesYoloeOnnx(documentRef.defaultView!);
  const prepareMessage = () => bundled ? "Bundled model is missing. Reinstall Easy Labeling YOLOE-26."
    : `Run npm.cmd run yoloe:prepare -- --model ${modelSelect.value}, then reconnect.`;
  if (bundled) {
    const commands = documentRef.querySelector<HTMLElement>(".yoloe-setup-commands");
    if (commands) commands.textContent = "ONNX · N/S/M/L included · No Python or separate setup";
  }
  const nameInput = el<HTMLInputElement>("yoloeProfileName");
  const sampleName = el<HTMLInputElement>("yoloeSampleName");
  const shape = el<HTMLSelectElement>("yoloePromptShape");
  const badge = el<HTMLElement>("yoloeBackendBadge");
  const status = el<HTMLElement>("yoloeRunStatus");
  const overlay = el<HTMLCanvasElement>("yoloePreviewCanvas");
  const mainCanvasParent = overlay.parentElement!;
  const setupElement = el("yoloeSetupModal");
  const setupModal = new documentRef.defaultView!.bootstrap.Modal(setupElement);
  installModalFocusManagement(documentRef, ["yoloeSetupModal"]);
  const referenceSelect = el<HTMLSelectElement>("yoloeReferenceSelect");
  const existingBoxSelect = el<HTMLSelectElement>("yoloeExistingBoxSelect");
  let existingBoxes: VisualExample[] = [];
  let presets: EasyLabelingLibraryFile[] = [];
  let presetPath: string | undefined;
  const markPresetDirty = (): void => { el("yoloePresetState").textContent = "Unsaved changes"; };
  const setPresetLocation = (path?: string): void => {
    el("yoloePresetLocation").textContent = path?.split(/[\\/]/).at(-1) ?? defaultPresetLocation;
    el("yoloePresetLocation").title = path ?? defaultPresetLocation;
    el("yoloePresetState").textContent = path ? "Saved" : "Not saved";
  };
  const defaultPresetLocation = documentRef.defaultView!.saveEasyLabelingLibraryFile ? "Default: Documents / Easy Labeling / YOLOE Presets" : "Default: browser storage";
  el("yoloePresetLocation").textContent = defaultPresetLocation;
  let gpuName: string | null = null;
  const setDevice = (device: typeof backend, gpu: string | null): void => {
    backend = device; gpuName = device === "cpu" ? null : gpu;
    badge.textContent = device === "webgpu" ? "GPU · WebGPU" : device === "cuda" ? "GPU · CUDA" : device === "cpu" ? "CPU" : "Disconnected";
    badge.title = gpuName ?? "GPU unavailable · Using CPU";
    el("yoloeDeviceInfo").textContent = device === "cpu" ? "GPU unavailable · Using CPU" : gpuName ?? "";
    el("yoloeConnectionStatus").textContent = el("yoloeDeviceInfo").textContent;
  };
  let setupOpen = false;
  let sampleImage: HTMLImageElement | null = null;
  let sampleImageName = "";
  let sampleTransform: [number, number, number, number, number, number] = [1, 0, 0, 1, 0, 0];
  let sampleZoom = 1, samplePanX = 0, samplePanY = 0;
  let spaceHeld = false;
  let pan: { pointerId: number; x: number; y: number } | null = null;
  let connected = false, busy = false;
  let backend: "cuda" | "cpu" | "webgpu" | null = null;
  let readyModels: string[] = [];
  let connectionAttempted = false;
  let profile: YoloeProfile | null = null;
  let sourceFolder: FileSystemDirectoryHandle | null = null;
  let referenceName = "";
  let preview: { image: HTMLImageElement; boxes: Detection[]; maskCanvas: HTMLCanvasElement | null } | null = null;
  let examples: (VisualExample & { sourceImage: HTMLImageElement; sourceName: string; maskCanvas?: HTMLCanvasElement })[] = [];
  let referenceImage: HTMLImageElement | null = null;
  let workflow = state.session.workflow;
  let drawing = false;
  let start: { x: number; y: number } | null = null;
  let end: { x: number; y: number } | null = null;
  let outline: [number, number][] = [];
  let paintMask: Uint16Array | null = null, paintCanvas: HTMLCanvasElement | null = null;
  let hasPaint = false;
  let paintTool: "brush" | "erase" = "brush";
  // ponytail: one stroke of undo; use pixel diffs if deeper history is needed for large images.
  let undoPaint: Uint16Array | null = null;
  let paintStroke: { pointerId: number; previous: { x: number; y: number }; points: { x: number; y: number }[]; before: Uint16Array; changed: boolean } | null = null;
  const drawButtonText = (): string => shape.value === "box" ? "Draw sample box" : shape.value === "brush" ? "Paint sample" : "Outline sample";
  let operationController: AbortController | null = null;
  const sync = (): void => {
    const hasImage = Boolean((setupOpen ? sampleImage : state.session.currentImage) && state.session.imageFolderHandle);
    el("yoloeInferenceControls").dataset.busy = String(busy);
    if (workflow !== state.session.workflow || sourceFolder && sourceFolder !== state.session.imageFolderHandle) {
      if (workflow !== state.session.workflow) { presetPath = undefined; setPresetLocation(); }
      else markPresetDirty();
      workflow = state.session.workflow;
      profile = null; sourceFolder = null;
      examples = []; referenceImage = null; drawing = false; outline = []; start = end = null;
      paintMask = null; paintCanvas = null; undoPaint = null; paintStroke = null; hasPaint = false;
      sampleImage = state.session.currentImage; sampleImageName = state.session.currentImageFile?.name ?? "";
      overlay.style.pointerEvents = "none"; overlay.style.cursor = "";
      el("drawYoloeExampleBtn").textContent = drawButtonText();
      el("drawYoloeExampleBtn").setAttribute("aria-pressed", "false");
      el("yoloeExampleList").replaceChildren();
      status.hidden = true;
      clearPreview();
    }
    el("yoloeOutputBadge").textContent = workflow === "segmentation" ? "Segmentation · Masks" : "Detection · Boxes";
    const modelSize = modelSelect.value.match(/yoloe-26([nsml])/i)?.[1]?.toUpperCase() ?? "YOLOE-26";
    const device = backend === "cpu" ? "CPU · GPU unavailable" : backend ? `GPU · ${gpuName ?? backend}` : "Disconnected";
    const summary = `${modelSize} · ${el<HTMLSelectElement>("yoloeImageSize").value} · ${device}`;
    el("yoloeSummary").textContent = summary;
    el("yoloeSetupSummary").textContent = `${summary} · ${examples.length} examples / ${new Set(examples.map((e) => e.sourceName)).size} images`;
    const folder = `inference-${modelSelect.value}-${nameInput.value.trim() || "targets"}${workflow === "segmentation" ? "-masks" : ""}`;
    el("yoloeResultFolder").textContent = `Results: ${folder}`;
    el("yoloeResultFolder").title = folder;
    el("yoloeSamplesEmpty").hidden = Boolean(examples.length);
    el<HTMLButtonElement>("openYoloeSetupBtn").disabled = busy;
    const referenceNames = [...new Set([...state.session.imageFiles.map((file) => file.name), ...examples.map((example) => example.sourceName)])];
    const imagesSignature = JSON.stringify(referenceNames);
    if (referenceSelect.dataset.images !== imagesSignature) {
      referenceSelect.replaceChildren(...referenceNames.map((name) => new Option(name, name)));
      if (!referenceNames.length) referenceSelect.append(new Option("Open a dataset first", ""));
      referenceSelect.dataset.images = imagesSignature;
    }
    referenceSelect.value = sampleImageName;
    referenceSelect.disabled = busy || drawing || !referenceNames.length;
    overlay.parentElement!.dataset.yoloeDrawing = String(drawing);
    overlay.setAttribute("aria-hidden", String(!setupOpen && !drawing));
    overlay.tabIndex = setupOpen ? 0 : -1;
    overlay.style.pointerEvents = setupOpen || drawing ? "auto" : "none";
    overlay.style.cursor = pan ? "grabbing" : spaceHeld || !drawing ? "grab" : "crosshair";
    el<HTMLButtonElement>("fitYoloeSampleBtn").disabled = !sampleImage;
    el("yoloeDrawingToolbar").hidden = !drawing;
    el("yoloeDrawingTitle").textContent = `${shape.value === "box" ? "Sample box" : shape.value === "brush" ? "Sample mask" : "Sample outline"} · ${sampleName.value}`;
    el("yoloeCanvasDrawingHint").textContent = shape.value === "box"
      ? "Drag around the target · Esc: cancel"
      : shape.value === "brush" ? "Paint / erase the target · Enter: finish · Ctrl+Z: undo last stroke · Esc: cancel"
      : `${outline.length} points · Click the outline · Enter: finish · Backspace: undo · Esc: cancel`;
    el("drawYoloeExampleBtn").classList.toggle("btn-primary", drawing);
    el("drawYoloeExampleBtn").classList.toggle("btn-outline-primary", !drawing);
    const classes = el<HTMLSelectElement>("yoloeExampleClass");
    const choices = [...state.session.classNames].filter(([id]) => /^\d+$/.test(id) && Number.isSafeInteger(Number(id)) && (workflow === "detection" || Number(id) > 0 && Number(id) <= 65535));
    const signature = JSON.stringify(choices);
    if (classes.dataset.choices !== signature) {
      const previous = classes.value;
      classes.replaceChildren(...choices.map(([id, name]) => new Option(`${id}: ${name}`, id)));
      if (choices.some(([id]) => id === previous)) classes.value = previous;
      classes.dataset.choices = signature;
    }
    classes.disabled = busy || drawing;
    sampleName.disabled = busy || drawing;
    const targets = el<HTMLSelectElement>("yoloeExistingTarget");
    const counts = new Map<string, number>();
    for (const example of examples) counts.set(example.name, (counts.get(example.name) ?? 0) + 1);
    const targetSignature = JSON.stringify([...counts]);
    if (targets.dataset.targets !== targetSignature) {
      targets.replaceChildren(new Option("New target", ""), ...[...counts].map(([name, count]) => new Option(`${name} · ${count} example(s)`, name)));
      targets.dataset.targets = targetSignature;
    }
    targets.value = counts.has(sampleName.value) ? sampleName.value : "";
    targets.disabled = busy || drawing;
    el("yoloeTargetChoice").hidden = !examples.length;
    el<HTMLSelectElement>("yoloeImageSize").disabled = busy || drawing;
    shape.disabled = busy || drawing;
    el<HTMLButtonElement>("drawYoloeExampleBtn").disabled = busy || !hasImage;
    el("yoloeMaskTools").hidden = shape.value !== "brush";
    for (const [id, tool] of [["yoloeBrushBtn", "brush"], ["yoloeEraserBtn", "erase"]] as const) {
      const button = el<HTMLButtonElement>(id);
      button.disabled = busy;
      button.classList.toggle("active", paintTool === tool);
      button.setAttribute("aria-pressed", String(paintTool === tool));
    }
    el<HTMLInputElement>("yoloeBrushRadius").disabled = busy;
    el<HTMLInputElement>("yoloeAutoFillClosedRegionToggle").disabled = busy || Boolean(paintStroke);
    el<HTMLButtonElement>("undoYoloeStrokeBtn").disabled = !undoPaint || Boolean(paintStroke);
    el("undoYoloeStrokeBtn").hidden = !drawing || shape.value !== "brush";
    el<HTMLButtonElement>("finishYoloeSampleBtn").disabled = !drawing || (shape.value === "brush" ? !hasPaint || Boolean(paintStroke) : outline.length < 3);
    el("finishYoloeSampleBtn").textContent = shape.value === "brush" ? "Finish mask" : "Finish outline";
    el("finishYoloeSampleBtn").hidden = !drawing || shape.value === "box";
    const selectedCount = workflow === "segmentation"
      ? canvasController.raw.getSelectedSegmentationRegion?.() ? 1 : 0
      : canvasController.raw.canvas.getActiveObjects().filter(isRectObject).length;
    const selectedButton = el<HTMLButtonElement>("addYoloeSelectedBtn");
    const sameImage = sampleImageName === state.session.currentImageFile?.name;
    selectedButton.textContent = `Use selected ${workflow === "segmentation" ? "mask" : "boxes"} (${selectedCount})`;
    selectedButton.disabled = busy || drawing || !hasImage || !sameImage || !selectedCount;
    selectedButton.title = !sameImage ? "Choose the current main image to use its selected labels."
      : !selectedCount ? "Select existing labels in Edit mode on the main canvas, then open Samples & settings."
      : "Add the selected labels as samples with their existing class names and IDs. Original labels stay unchanged.";
    el("yoloeExistingBoxes").hidden = false;
    el("yoloeExistingLabelTitle").textContent = `Existing ${workflow === "detection" ? "boxes" : "mask regions"} · Reference image`;
    existingBoxSelect.disabled = busy || drawing || !existingBoxes.length;
    const selectedLabelCount = [...existingBoxSelect.selectedOptions].filter((option) => option.value !== "").length;
    el("yoloeLabelSelectionSummary").textContent = `${selectedLabelCount} selected / ${existingBoxes.length}`;
    el<HTMLButtonElement>("focusYoloeLabelsBtn").disabled = !selectedLabelCount || busy || drawing;
    el<HTMLSelectElement>("yoloeLabelClassFilter").disabled = busy || drawing;
    el("yoloeLabelChoices").querySelectorAll<HTMLInputElement>("input").forEach((checkbox) => {
      checkbox.disabled = existingBoxSelect.disabled;
      checkbox.checked = existingBoxSelect.options[Number(checkbox.value)]?.selected ?? false;
    });
    el<HTMLButtonElement>("addYoloeExistingBtn").disabled = busy || drawing || ![...existingBoxSelect.selectedOptions].some((option) => option.value !== "" && existingBoxes[Number(option.value)]);
    el<HTMLButtonElement>("clearYoloeExamplesBtn").disabled = busy;
    el("clearYoloeExamplesBtn").hidden = !examples.length;
    el<HTMLButtonElement>("connectYoloeBtn").disabled = busy;
    el("connectYoloeBtn").hidden = connected && readyModels.includes(modelSelect.value);
    el<HTMLButtonElement>("stopYoloePreviewBtn").hidden = !busy || !operationController;
    el<HTMLButtonElement>("stopYoloePreviewBtn").disabled = operationController?.signal.aborted ?? false;
    modelSelect.disabled = busy || drawing || !connected;
    nameInput.disabled = busy;
    el<HTMLSelectElement>("yoloeSaveScope").disabled = busy || drawing;
    el("saveYoloeCurrentBtn").textContent = "Run & save results";
    el<HTMLSelectElement>("yoloeSaveScope").options[1]!.textContent = `All images (${state.session.imageFiles.length})`;
    for (const id of ["saveYoloePresetBtn", "saveYoloePresetAsBtn"]) el<HTMLButtonElement>(id).disabled = busy || drawing || !examples.length;
    el<HTMLButtonElement>("loadYoloePresetBtn").disabled = busy || drawing;
    el<HTMLSelectElement>("yoloePresetSelect").disabled = busy || drawing;
    for (const id of ["previewYoloeBtn", "previewYoloeSampleBtn", "saveYoloeCurrentBtn"]) el<HTMLButtonElement>(id).disabled = busy || drawing || !examples.length || !hasImage;
    for (const button of el("yoloeExampleList").querySelectorAll<HTMLButtonElement>("button")) button.disabled = busy || drawing;
    for (const id of ["taskInferenceBtn", "taskYoloeBtn"]) el<HTMLButtonElement>(id).disabled = busy || el<HTMLInputElement>("inferenceModelInput").disabled;
    for (const id of ["detectionWorkflowTab", "segmentationWorkflowTab"]) el<HTMLInputElement>(id).disabled = busy;
  };
  const clearPreview = (): void => {
    preview = null;
    el("yoloeSampleResultToggle").hidden = true;
    overlay.hidden = !setupOpen && !drawing;
  };
  const drawPreview = (): void => {
    if (!setupOpen && preview && preview.image !== state.session.currentImage) clearPreview();
    if (drawing && referenceImage !== (setupOpen ? sampleImage : state.session.currentImage)) stopDrawing();
    const canvas = canvasController.raw.canvas;
    const parent = canvas.upperCanvasEl?.getBoundingClientRect?.();
    const container = overlay.parentElement!.getBoundingClientRect();
    overlay.style.inset = "auto";
    overlay.style.left = setupOpen ? "0" : `${(parent?.left ?? container.left) - container.left}px`;
    overlay.style.top = setupOpen ? "0" : `${(parent?.top ?? container.top) - container.top}px`;
    overlay.width = Math.max(1, Math.round(setupOpen ? container.width : canvas.width));
    overlay.height = Math.max(1, Math.round(setupOpen ? container.height : canvas.height));
    overlay.style.width = `${overlay.width}px`; overlay.style.height = `${overlay.height}px`;
    const active = documentRef.querySelector(".app-workspace")?.getAttribute("data-active-task") === "yoloe";
    if (!active && drawing) stopDrawing();
    overlay.hidden = !active || !setupOpen && !preview && !drawing;
    const context = overlay.getContext("2d")!;
    let zoom = canvas.getZoom();
    if (setupOpen) {
      el("yoloeSampleEmpty").hidden = Boolean(sampleImage);
      if (!sampleImage) { el("yoloeSampleZoom").textContent = ""; return; }
      overlay.dataset.referenceWidth = String(sampleImage.naturalWidth);
      overlay.dataset.referenceHeight = String(sampleImage.naturalHeight);
      zoom = Math.min(overlay.width / sampleImage.naturalWidth, overlay.height / sampleImage.naturalHeight) * sampleZoom;
      sampleTransform = [zoom, 0, 0, zoom, (overlay.width - sampleImage.naturalWidth * zoom) / 2 + samplePanX, (overlay.height - sampleImage.naturalHeight * zoom) / 2 + samplePanY];
      el("yoloeSampleZoom").textContent = `${Math.round(zoom * 100)}%`;
      context.setTransform(...sampleTransform);
      context.drawImage(sampleImage, 0, 0);
      for (const option of existingBoxSelect.selectedOptions) {
        const chosen = option.value === "" ? null : existingBoxes[Number(option.value)];
        if (!chosen) continue;
        const [x1, y1, x2, y2] = chosen.box;
        const color = getColorForClass(String(chosen.classId));
        if (chosen.mask) {
          const pixels = decodeYoloeMask(chosen.mask).mask;
          const maskCanvas = documentRef.createElement("canvas"); maskCanvas.width = chosen.mask.width; maskCanvas.height = chosen.mask.height;
          const ctx = maskCanvas.getContext("2d")!, rgba = ctx.createImageData(maskCanvas.width, maskCanvas.height);
          const rgb = color.slice(1).match(/../g)!.map((value) => Number.parseInt(value, 16));
          for (let i = 0; i < pixels.length; i++) rgba.data.set([...rgb, pixels[i] ? 110 : 0], i * 4);
          ctx.putImageData(rgba, 0, 0); context.drawImage(maskCanvas, x1, y1, x2 - x1, y2 - y1);
        }
        context.fillStyle = `${color}33`; context.strokeStyle = "#ffffff"; context.lineWidth = 4 / zoom;
        if (!chosen.mask) context.fillRect(x1, y1, x2 - x1, y2 - y1);
        context.strokeRect(x1, y1, x2 - x1, y2 - y1);
        context.strokeStyle = color; context.lineWidth = 2 / zoom; context.strokeRect(x1, y1, x2 - x1, y2 - y1);
      }
      context.lineWidth = 2 / zoom;
      for (const example of examples.filter((e) => e.sourceName === sampleImageName)) {
        context.strokeStyle = getColorForClass(String(example.classId));
        const [x1, y1, x2, y2] = example.box;
        if (example.maskCanvas) {
          context.save(); context.globalAlpha = 0.4; context.imageSmoothingEnabled = false;
          context.drawImage(example.maskCanvas, x1, y1, x2 - x1, y2 - y1); context.restore();
        } else if (example.polygon) {
          context.beginPath(); context.moveTo(...example.polygon[0]!);
          for (const point of example.polygon.slice(1)) context.lineTo(...point);
          context.closePath(); context.stroke();
        } else context.strokeRect(x1, y1, x2 - x1, y2 - y1);
      }
    } else context.setTransform(...canvas.viewportTransform);
    const visiblePreview = setupOpen ? preview?.image === sampleImage && el<HTMLInputElement>("yoloeShowSampleResults").checked ? preview : null : preview;
    el("yoloeSampleResultToggle").hidden = preview?.image !== sampleImage;
    if (visiblePreview?.maskCanvas) {
      context.drawImage(visiblePreview.maskCanvas, 0, 0);
    }
    for (const box of visiblePreview?.maskCanvas ? [] : visiblePreview?.boxes ?? []) {
      const color = getColorForClass(String(box.classId));
      context.fillStyle = `${color}33`; context.strokeStyle = color; context.lineWidth = 2 / zoom;
      context.fillRect(box.left, box.top, box.right - box.left, box.bottom - box.top);
      context.strokeRect(box.left, box.top, box.right - box.left, box.bottom - box.top);
    }
    context.save(); context.resetTransform();
    const detection = workflow === "detection";
    const fontSize = detection ? state.view.labelFontSize : 13;
    const labelHeight = detection ? fontSize + 7 : 22;
    context.font = detection ? `600 ${fontSize}px 'Segoe UI', sans-serif` : "600 13px sans-serif";
    context.textBaseline = "top";
    const labels: { x: number; y: number; width: number }[] = [];
    const transform = setupOpen ? sampleTransform : canvas.viewportTransform;
    // At most 300 results: keep higher-confidence badges when screen-space labels overlap.
    for (const box of [...visiblePreview?.boxes ?? []].sort((a, b) => b.confidence - a.confidence)) {
      const left = box.left * transform[0] + transform[4], top = box.top * transform[3] + transform[5];
      if (left > overlay.width || top > overlay.height || box.right * transform[0] + transform[4] < 0 || box.bottom * transform[3] + transform[5] < 0) continue;
      const text = `${profile?.classes[String(box.classId)] ?? box.classId} ${(box.confidence * 100).toFixed(0)}%`;
      const width = Math.min(overlay.width, Math.ceil(context.measureText(text).width) + (detection ? 10 : 16));
      const x = Math.max(0, Math.min(overlay.width - width, left));
      const y = Math.max(0, Math.min(overlay.height - labelHeight, top - labelHeight - (detection ? 3 : 2)));
      if (labels.some((label) => x < label.x + label.width + 2 && x + width + 2 > label.x && y < label.y + labelHeight + 2 && y + labelHeight + 2 > label.y)) continue;
      labels.push({ x, y, width });
      context.fillStyle = detection ? getColorForClass(String(box.classId)) : "#111827";
      context.fillRect(x, y, width, labelHeight);
      if (!detection) { context.fillStyle = getColorForClass(String(box.classId)); context.fillRect(x, y, 4, labelHeight); }
      context.fillStyle = detection ? getContrastTextColor(getColorForClass(String(box.classId))) : "#ffffff";
      context.fillText(text, x + (detection ? 5 : 9), y + (detection ? 3 : 4), Math.max(1, width - (detection ? 10 : 14)));
    }
    context.restore();
    context.strokeStyle = "#17a2b8"; context.fillStyle = "#17a2b8";
    context.lineWidth = 2 / zoom; context.setLineDash([6 / zoom, 3 / zoom]);
    if (drawing && shape.value === "brush" && paintCanvas) {
      context.save(); context.imageSmoothingEnabled = false; context.drawImage(paintCanvas, 0, 0); context.restore();
      if (end && !pan && !spaceHeld) {
        context.setLineDash([]); context.strokeStyle = paintTool === "erase" ? "#ffffff" : "#17a2b8";
        context.beginPath(); context.arc(end.x, end.y, brushRadius(), 0, Math.PI * 2); context.stroke();
      }
    } else if (drawing && shape.value === "mask" && outline.length) {
      context.beginPath(); context.moveTo(...outline[0]!);
      for (const point of outline.slice(1)) context.lineTo(...point);
      if (end) context.lineTo(end.x, end.y);
      context.closePath(); context.globalAlpha = 0.3; context.fill(); context.globalAlpha = 1; context.stroke();
      for (const point of outline) { context.beginPath(); context.arc(...point, 3 / zoom, 0, Math.PI * 2); context.fill(); }
    } else if (drawing && start && end) context.strokeRect(Math.min(start.x, end.x), Math.min(start.y, end.y), Math.abs(end.x - start.x), Math.abs(end.y - start.y));
  };
  const message = (target: HTMLElement, text: string): void => {
    target.hidden = false; target.textContent = text;
    if (target === status) el("yoloeSetupStatus").textContent = text;
  };
  const work = async (title: string, action: (signal: AbortSignal) => Promise<void>): Promise<void> => {
    if (busy) return;
    operationController = new AbortController();
    message(status, `${title}…`);
    busy = true; sync();
    const operation = uiManager.beginOperation({ title, detail: `YOLOE-26 · ${backend === "webgpu" ? "GPU / WebGPU" : backend === "cuda" ? "GPU / CUDA" : backend === "cpu" ? "CPU" : "Connecting"}`, cancellable: true });
    const controller = operationController;
    const cancel = (): void => controller.abort(new Error("YOLOE operation stopped."));
    operation.signal.addEventListener("abort", cancel, { once: true });
    try { await action(controller.signal); if (status.textContent === `${title}…`) message(status, "Ready"); }
    catch (error) { message(status, error instanceof Error ? error.message : String(error)); }
    finally { operation.signal.removeEventListener("abort", cancel); operation.finish(); operationController = null; busy = false; sync(); }
  };
  el("stopYoloePreviewBtn").addEventListener("click", () => { operationController?.abort(new Error("YOLOE operation stopped.")); sync(); });
  setupElement.addEventListener("input", (event) => {
    if (["yoloeSampleName", "yoloeProfileName", "yoloeConfidenceInput", "yoloeIouInput", "yoloeBrushRadius"].includes((event.target as HTMLElement).id)) markPresetDirty();
  });
  setupElement.addEventListener("change", (event) => {
    if (["yoloeModelSelect", "yoloeImageSize", "yoloePromptShape", "yoloeExistingTarget", "yoloeExampleClass", "yoloeAutoFillClosedRegionToggle"].includes((event.target as HTMLElement).id)) markPresetDirty();
  });
  const parameters = (): [number, number] => {
    const values: [number, number] = [el<HTMLInputElement>("yoloeConfidenceInput").valueAsNumber, el<HTMLInputElement>("yoloeIouInput").valueAsNumber];
    if (!values.every((x) => Number.isFinite(x) && x >= 0 && x <= 1)) throw new Error("Confidence and IoU must be between 0 and 1.");
    return values;
  };
  el("openYoloeSetupBtn").addEventListener("click", () => setupModal.show());
  const fitSample = (): void => { sampleZoom = 1; samplePanX = samplePanY = 0; drawPreview(); };
  el("fitYoloeSampleBtn").addEventListener("click", fitSample);
  el("yoloeShowSampleResults").addEventListener("change", drawPreview);
  const renderLabelChoices = (): void => {
    const list = el("yoloeLabelChoices"); list.replaceChildren();
    const filter = el<HTMLSelectElement>("yoloeLabelClassFilter").value;
    existingBoxes.forEach((example, index) => {
      if (filter && String(example.classId) !== filter) return;
      const row = documentRef.createElement("label"); row.className = "yoloe-label-choice";
      const checkbox = documentRef.createElement("input"); checkbox.type = "checkbox"; checkbox.className = "form-check-input";
      checkbox.value = String(index); checkbox.dataset.ui = "yoloe-label-choice";
      checkbox.setAttribute("aria-label", `Use label #${index + 1} · ${example.name}`);
      checkbox.checked = existingBoxSelect.options[index]?.selected ?? false;
      checkbox.addEventListener("change", () => {
        existingBoxSelect.options[index]!.selected = checkbox.checked;
        existingBoxSelect.dispatchEvent(new Event("change"));
      });
      const thumb = documentRef.createElement("canvas"); thumb.width = thumb.height = 44; thumb.setAttribute("aria-hidden", "true");
      const [x, y, right, bottom] = example.box;
      const scale = Math.min(44 / (right - x), 44 / (bottom - y));
      const width = (right - x) * scale, height = (bottom - y) * scale;
      thumb.getContext("2d")!.drawImage(sampleImage!, x, y, right - x, bottom - y, (44 - width) / 2, (44 - height) / 2, width, height);
      const text = documentRef.createElement("span"); text.textContent = `#${index + 1} · ${example.name} · ${Math.round(right - x)}×${Math.round(bottom - y)}`;
      row.append(checkbox, thumb, text); list.appendChild(row);
    });
    if (!list.childElementCount) list.textContent = existingBoxes.length ? "No labels in this class" : "No labels in the active label folder";
    sync();
  };
  el("yoloeLabelClassFilter").addEventListener("change", renderLabelChoices);
  el("focusYoloeLabelsBtn").addEventListener("click", () => {
    const selected = [...existingBoxSelect.selectedOptions].filter((option) => option.value !== "").map((option) => existingBoxes[Number(option.value)]!);
    if (!selected.length || !sampleImage) return;
    const left = Math.min(...selected.map((e) => e.box[0])), top = Math.min(...selected.map((e) => e.box[1]));
    const right = Math.max(...selected.map((e) => e.box[2])), bottom = Math.max(...selected.map((e) => e.box[3]));
    const base = Math.min(overlay.width / sampleImage.naturalWidth, overlay.height / sampleImage.naturalHeight);
    const zoom = Math.min(overlay.width * 0.8 / (right - left), overlay.height * 0.8 / (bottom - top));
    sampleZoom = Math.max(1, Math.min(20, zoom / base));
    samplePanX = (sampleImage.naturalWidth / 2 - (left + right) / 2) * base * sampleZoom;
    samplePanY = (sampleImage.naturalHeight / 2 - (top + bottom) / 2) * base * sampleZoom;
    drawPreview();
  });
  const loadExistingBoxes = async (): Promise<void> => {
    existingBoxes = [];
    existingBoxSelect.replaceChildren(new Option("Loading labels…", "")); sync();
    if (!sampleImage) {
      existingBoxSelect.replaceChildren(new Option("Open an image first", ""));
      renderLabelChoices(); return;
    }
    const width = sampleImage.naturalWidth, height = sampleImage.naturalHeight;
    if (workflow === "segmentation") {
      const snapshot = sampleImageName === state.session.currentImageFile?.name
        ? canvasController.raw.getSegmentationDocumentSnapshot?.() ?? null
        : await fileSystem.readSegmentationLabels(sampleImageName, width, height);
      if (snapshot) {
        if (snapshot.width !== width || snapshot.height !== height) throw new Error("Mask size does not match the reference image.");
        existingBoxes = maskVisualExamples(snapshot.mask, width, height, state.session.classNames);
      }
    } else if (sampleImageName === state.session.currentImageFile?.name) {
      // Include unsaved edits on the current main image.
      existingBoxes = canvasController.raw.canvas.getObjects().filter(isRectObject).flatMap((rect) => selectedVisualExamples([rect], width, height, state.session.classNames));
    } else {
      const text = await fileSystem.readDetectionLabels(sampleImageName);
      existingBoxes = parseYoloRows(text.split("\n").map((line) => line.trim().split(/\s+/).join(" ")).join("\n"), width, height).map((row) => {
        const box: VisualExample["box"] = [Math.max(0, row.rectLeft), Math.max(0, row.rectTop), Math.min(width, row.rectLeft + row.rectWidth), Math.min(height, row.rectTop + row.rectHeight)];
        if (!/^\d+$/.test(row.labelClass) || !Number.isSafeInteger(Number(row.labelClass)) || !box.every(Number.isFinite) || box[2] <= box[0] || box[3] <= box[1]) throw new Error(`Invalid Detection label in ${sampleImageName}.`);
        return { classId: Number(row.labelClass), name: normalizeClassName(state.session.classNames.get(row.labelClass) ?? `class ${row.labelClass}`), box };
      });
    }
    existingBoxSelect.replaceChildren(...(existingBoxes.length ? existingBoxes.map((box, index) => new Option(`#${index + 1} · ${box.classId}: ${box.name} · ${Math.round(box.box[2] - box.box[0])}×${Math.round(box.box[3] - box.box[1])}`, String(index))) : [new Option("No labels in the active label folder", "")]));
    const classFilter = el<HTMLSelectElement>("yoloeLabelClassFilter");
    classFilter.replaceChildren(new Option("All classes", ""), ...[...new Map(existingBoxes.map((e) => [e.classId, e.name]))].map(([id, name]) => new Option(name, String(id))));
    renderLabelChoices();
    sync(); drawPreview();
  };
  setupElement.addEventListener("shown.bs.modal", () => {
    setupOpen = true;
    sampleImageName = state.session.currentImageFile?.name ?? "";
    sampleImage = examples.find((e) => e.sourceName === sampleImageName)?.sourceImage ?? state.session.currentImage;
    el("yoloeSampleStage").append(overlay);
    el("yoloeSetupStatus").textContent = status.hidden ? "Changes apply immediately." : status.textContent;
    sync(); fitSample();
    void work("Loading existing labels", loadExistingBoxes);
    void refreshPresets();
  });
  setupElement.addEventListener("hidden.bs.modal", () => {
    setupOpen = false; spaceHeld = false; pan = null; stopDrawing();
    mainCanvasParent.append(overlay);
    drawPreview();
  });
  referenceSelect.addEventListener("change", () => {
    const name = referenceSelect.value;
    const file = state.session.imageFiles.find((entry) => entry.name === name);
    const saved = examples.find((entry) => entry.sourceName === name);
    if (!file && !saved) return;
    const folder = state.session.imageFolderHandle;
    void work("Loading reference image", async (signal) => {
      const image = saved?.sourceImage
        ?? examples.find((e) => e.sourceName === name)?.sourceImage
        ?? (name === state.session.currentImageFile?.name ? state.session.currentImage : null)
        ?? await fileSystem.decodeImageForAutomation(file!);
      signal.throwIfAborted();
      if (!setupOpen || folder !== state.session.imageFolderHandle) return;
      sampleImage = image; sampleImageName = name; clearPreview();
      await loadExistingBoxes();
      sync(); fitSample();
    });
  });
  const sampleResize = new ResizeObserver(() => { if (setupOpen) drawPreview(); });
  sampleResize.observe(el("yoloeSampleStage"));
  const renderExamples = (): void => {
    const list = el("yoloeExampleList"); list.replaceChildren();
    const groups = new Map<string, typeof examples>();
    for (const example of examples) groups.set(example.name, [...groups.get(example.name) ?? [], example]);
    const groupLists = new Map<string, HTMLElement>();
    for (const [name, entries] of groups) {
      const group = documentRef.createElement("section"); group.className = "yoloe-sample-group";
      group.setAttribute("aria-label", `Samples for ${name}`);
      group.style.borderLeft = `3px solid ${getColorForClass(String(entries[0]!.classId))}`;
      const title = documentRef.createElement("strong"); title.textContent = name;
      const summary = documentRef.createElement("small"); summary.className = "text-muted";
      const imageCount = new Set(entries.map((e) => e.sourceName)).size;
      summary.textContent = `${entries.length} example${entries.length === 1 ? "" : "s"} · ${imageCount} image${imageCount === 1 ? "" : "s"}`;
      const rows = documentRef.createElement("div"); rows.className = "yoloe-sample-group-examples";
      group.append(title, summary, rows); list.appendChild(group); groupLists.set(name, rows);
    }
    for (const example of examples) {
      const row = documentRef.createElement("div");
      row.className = "yoloe-example-row";
      const thumb = documentRef.createElement("canvas"); thumb.width = thumb.height = 44;
      const [x1, y1, x2, y2] = example.box;
      const scale = Math.min(44 / (x2 - x1), 44 / (y2 - y1));
      const w = (x2 - x1) * scale, h = (y2 - y1) * scale;
      const context = thumb.getContext("2d")!;
      context.save();
      if (example.polygon) {
        context.beginPath();
        example.polygon.forEach(([x, y], index) => context[index ? "lineTo" : "moveTo"]((44 - w) / 2 + (x - x1) * scale, (44 - h) / 2 + (y - y1) * scale));
        context.closePath(); context.clip();
      }
      context.drawImage(example.sourceImage, x1, y1, x2 - x1, y2 - y1, (44 - w) / 2, (44 - h) / 2, w, h); context.restore();
      if (example.mask) {
        const cutout = documentRef.createElement("canvas"); cutout.width = example.mask.width; cutout.height = example.mask.height;
        const ctx = cutout.getContext("2d")!, pixels = ctx.createImageData(cutout.width, cutout.height);
        const mask = decodeYoloeMask(example.mask).mask;
        const color = getColorForClass(String(example.classId)).slice(1).match(/../g)!.map((c) => Number.parseInt(c, 16));
        for (let i = 0; i < mask.length; i++) pixels.data.set([...color, mask[i] ? 255 : 0], i * 4);
        ctx.putImageData(pixels, 0, 0); context.globalCompositeOperation = "destination-in";
        context.drawImage(cutout, (44 - w) / 2, (44 - h) / 2, w, h); context.globalCompositeOperation = "source-over";
        example.maskCanvas = cutout;
      }
      const label = documentRef.createElement("span"); label.textContent = example.sourceName; label.title = `${example.name} · Class ${example.classId} · ${example.sourceName}`;
      const remove = documentRef.createElement("button"); remove.type = "button"; remove.className = "btn btn-sm btn-outline-secondary";
      remove.innerHTML = '<i class="bi bi-x" aria-hidden="true"></i>'; remove.setAttribute("aria-label", `Remove sample ${example.name}`);
      remove.addEventListener("click", () => { examples.splice(examples.indexOf(example), 1); profile = null; clearPreview(); if (!examples.length) referenceImage = null; markPresetDirty(); renderExamples(); });
      row.append(thumb, label, remove); groupLists.get(example.name)!.append(row);
    }
    sync(); drawPreview();
  };
  const useReference = (): void => {
    referenceImage = setupOpen ? sampleImage : state.session.currentImage;
    referenceName = setupOpen ? sampleImageName : state.session.currentImageFile!.name;
    sourceFolder = state.session.imageFolderHandle;
  };
  const addExamples = (added: VisualExample[]): void => {
    if (examples.length + added.length > 32) throw new Error("Use at most 32 samples.");
    if (workflow === "segmentation" && added.some((e) => !Number.isInteger(e.classId) || e.classId < 1 || e.classId > 65535)) throw new Error("Segmentation class IDs must be 1–65535; 0 is background.");
    useReference(); examples.push(...added.map((example) => ({ ...example, sourceImage: referenceImage!, sourceName: referenceName }))); profile = null; clearPreview(); markPresetDirty(); renderExamples();
    message(status, `${referenceName} · ${examples.length} sample(s) · Ready to find`);
  };
  const selectedExamples = (): VisualExample[] => workflow === "segmentation"
    ? maskRegionExample(canvasController.raw.getSelectedSegmentationRegion?.() ?? null, state.session.classNames, state.session.currentImage!.naturalWidth)
    : selectedVisualExamples([...new Set(canvasController.raw.canvas.getActiveObjects().filter(isRectObject))], state.session.currentImage!.naturalWidth, state.session.currentImage!.naturalHeight, state.session.classNames);
  const stopDrawing = (): void => {
    if (status.textContent === "Drawing sample") message(status, "Ready");
    drawing = false; start = end = null; outline = []; overlay.style.pointerEvents = "none"; overlay.style.cursor = "";
    paintMask = null; paintCanvas = null; undoPaint = null; paintStroke = null; hasPaint = false;
    el("drawYoloeExampleBtn").textContent = drawButtonText();
    el("drawYoloeExampleBtn").setAttribute("aria-pressed", "false");
    sync();
  };
  el("drawYoloeExampleBtn").addEventListener("click", () => {
    if (drawing) { stopDrawing(); drawPreview(); return; }
    try {
      if (!sampleName.value.trim()) throw new Error("Name the sample first.");
      if (shape.value === "brush" && sampleImage!.naturalWidth * sampleImage!.naturalHeight > 32_000_000) throw new Error("YOLOE supports images up to 32 million pixels.");
      useReference(); clearPreview(); drawing = true; start = end = null; outline = [];
      if (shape.value === "brush") {
        paintCanvas = documentRef.createElement("canvas"); paintCanvas.width = referenceImage!.naturalWidth; paintCanvas.height = referenceImage!.naturalHeight;
        paintMask = new Uint16Array(paintCanvas.width * paintCanvas.height); undoPaint = null; hasPaint = false;
      }
      overlay.style.pointerEvents = "auto"; overlay.style.cursor = "crosshair";
      el("drawYoloeExampleBtn").textContent = "Cancel sample";
      el("drawYoloeExampleBtn").setAttribute("aria-pressed", "true");
      message(status, "Drawing sample");
      sync(); drawPreview();
      overlay.scrollIntoView({ block: "nearest", inline: "nearest" });
      overlay.focus({ preventScroll: true });
    } catch (error) { message(status, String(error instanceof Error ? error.message : error)); }
  });
  const pointer = (event: PointerEvent): { x: number; y: number } => {
    const bounds = overlay.getBoundingClientRect();
    const [a, b, c, d, tx, ty] = setupOpen ? sampleTransform : canvasController.raw.canvas.viewportTransform;
    const x = (event.clientX - bounds.left) * overlay.width / bounds.width - tx;
    const y = (event.clientY - bounds.top) * overlay.height / bounds.height - ty;
    const det = a * d - b * c;
    return { x: Math.max(0, Math.min(referenceImage!.naturalWidth, (d * x - c * y) / det)), y: Math.max(0, Math.min(referenceImage!.naturalHeight, (a * y - b * x) / det)) };
  };
  const brushRadius = (): number => Math.max(1, Math.min(128, Math.round(el<HTMLInputElement>("yoloeBrushRadius").valueAsNumber || 8)));
  const renderPaint = (bounds?: SegmentationRegionBounds | null): void => {
    if (!paintCanvas || !paintMask) return;
    const { left, top, right, bottom } = bounds ?? { left: 0, top: 0, right: paintCanvas.width - 1, bottom: paintCanvas.height - 1 };
    const context = paintCanvas.getContext("2d")!, pixels = context.createImageData(right - left + 1, bottom - top + 1);
    for (let y = top; y <= bottom; y++) for (let x = left; x <= right; x++) {
      if (paintMask[y * paintCanvas.width + x]) pixels.data.set([23, 162, 184, 130], ((y - top) * pixels.width + x - left) * 4);
    }
    context.putImageData(pixels, left, top);
  };
  const paint = (point: { x: number; y: number }): void => {
    const points = [paintStroke!.previous, point];
    const mutation = paintTool === "erase"
      ? applyEraseStroke(paintMask!, paintCanvas!.width, paintCanvas!.height, points, brushRadius())
      : applyBrushStroke(paintMask!, paintCanvas!.width, paintCanvas!.height, points, brushRadius(), 1);
    paintStroke!.previous = point; paintStroke!.points.push(point); paintStroke!.changed ||= mutation.mutated;
    if (mutation.mutated) renderPaint(mutation.dirtyBounds);
    end = point; drawPreview();
  };
  const undoStroke = (): void => {
    if (!drawing || !undoPaint || paintStroke) return;
    paintMask = undoPaint; undoPaint = null; hasPaint = paintMask.some((pixel) => pixel > 0); renderPaint(); sync(); drawPreview();
  };
  el("undoYoloeStrokeBtn").addEventListener("click", undoStroke);
  for (const [id, tool] of [["yoloeBrushBtn", "brush"], ["yoloeEraserBtn", "erase"]] as const) {
    el(id).addEventListener("click", () => { paintTool = tool; markPresetDirty(); sync(); drawPreview(); if (drawing) overlay.focus(); });
  }
  el("yoloeBrushRadius").addEventListener("input", () => { el("yoloeBrushRadiusValue").textContent = `${brushRadius()}px`; drawPreview(); });
  overlay.addEventListener("wheel", (event) => {
    if (!setupOpen || !sampleImage || !event.ctrlKey) return;
    event.preventDefault(); event.stopPropagation();
    const bounds = overlay.getBoundingClientRect();
    const x = (event.clientX - bounds.left) * overlay.width / bounds.width;
    const y = (event.clientY - bounds.top) * overlay.height / bounds.height;
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? overlay.height : 1);
    const next = Math.max(0.25, Math.min(16, sampleZoom * Math.exp(-delta * 0.0015)));
    const ratio = next / sampleZoom;
    samplePanX = (x - overlay.width / 2) * (1 - ratio) + samplePanX * ratio;
    samplePanY = (y - overlay.height / 2) * (1 - ratio) + samplePanY * ratio;
    sampleZoom = next; drawPreview();
  }, { passive: false });
  overlay.addEventListener("pointerdown", (event) => {
    if (setupOpen && sampleImage && (event.button === 1 || event.button === 0 && (event.ctrlKey || spaceHeld || !drawing))) {
      pan = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
      overlay.setPointerCapture(event.pointerId); overlay.focus({ preventScroll: true });
      event.preventDefault(); sync(); return;
    }
    if (!drawing || event.button !== 0) return;
    if (shape.value === "brush") {
      const point = pointer(event);
      paintStroke = { pointerId: event.pointerId, previous: point, points: [], before: paintMask!.slice(), changed: false };
      overlay.setPointerCapture(event.pointerId); overlay.focus({ preventScroll: true }); event.preventDefault(); paint(point); sync(); return;
    }
    if (shape.value === "mask") {
      if (outline.length >= 512) { message(status, "Use at most 512 outline points."); return; }
      const point = pointer(event), last = outline.at(-1);
      if (!last || Math.hypot(point.x - last[0], point.y - last[1]) > 0.5) outline.push([point.x, point.y]);
      end = point; event.preventDefault(); sync(); drawPreview(); return;
    }
    start = end = pointer(event); overlay.setPointerCapture(event.pointerId); event.preventDefault(); drawPreview();
  });
  overlay.addEventListener("pointermove", (event) => {
    if (pan?.pointerId === event.pointerId) {
      const bounds = overlay.getBoundingClientRect();
      samplePanX += (event.clientX - pan.x) * overlay.width / bounds.width;
      samplePanY += (event.clientY - pan.y) * overlay.height / bounds.height;
      pan.x = event.clientX; pan.y = event.clientY; drawPreview(); return;
    }
    if (drawing && shape.value === "brush") {
      end = pointer(event);
      if (paintStroke?.pointerId === event.pointerId && !spaceHeld) paint(end);
      else { if (paintStroke) paintStroke.previous = end; drawPreview(); }
      return;
    }
    if (drawing && !spaceHeld && (start || outline.length)) { end = pointer(event); drawPreview(); }
  });
  const finishSample = (box: VisualExample["box"], polygon?: VisualExample["polygon"], mask?: VisualExample["mask"]): void => {
    try {
      const name = sampleName.value.trim();
      const repeatTarget = examples.some((e) => e.name === name);
      const existing = examples.find((e) => e.name === name)?.classId ?? [...state.session.classNames].find(([id, label]) => label === name && (workflow === "detection" || Number(id) > 0))?.[0];
      const used = new Set([...state.session.classNames.keys(), ...examples.map((e) => String(e.classId))]);
      let next = 1; while (used.has(String(next))) next++;
      if (next > 65535) throw new Error("No sample class ID is available.");
      const classId = existing === undefined ? next : Number(existing);
      addExamples([{ classId, name, box, ...(polygon ? { polygon } : {}), ...(mask ? { mask } : {}) }]);
      let index = 0;
      while (examples.some((e) => e.name === `sample${index < 26 ? String.fromCharCode(65 + index) : index + 1}`)) index++;
      if (!repeatTarget) sampleName.value = `sample${index < 26 ? String.fromCharCode(65 + index) : index + 1}`;
    } catch (error) { message(status, error instanceof Error ? error.message : String(error)); }
    stopDrawing(); drawPreview();
  };
  const finishOutline = (): void => {
    if (drawing && shape.value === "brush" && !paintStroke && paintMask) {
      try { const { box, mask } = sampleMaskGeometry(paintMask, paintCanvas!.width, paintCanvas!.height); finishSample(box, undefined, mask); }
      catch (error) { message(status, error instanceof Error ? error.message : String(error)); }
      return;
    }
    if (!drawing || shape.value !== "mask" || outline.length < 3) return;
    const area = outline.reduce((sum, a, i) => { const b = outline[(i + 1) % outline.length]!; return sum + a[0] * b[1] - b[0] * a[1]; }, 0);
    if (Math.abs(area) < 2) { message(status, "Outline an area of the target before finishing."); return; }
    const xs = outline.map(([x]) => x), ys = outline.map(([, y]) => y);
    finishSample([Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)], [...outline]);
  };
  overlay.addEventListener("dblclick", (event) => { if (event.button === 0 && !event.ctrlKey && !spaceHeld) finishOutline(); });
  el("finishYoloeSampleBtn").addEventListener("click", finishOutline);
  const keys = (event: KeyboardEvent): void => {
    if (setupOpen && event.code === "Space" && event.target === overlay) {
      event.preventDefault(); event.stopImmediatePropagation(); spaceHeld = true; sync(); return;
    }
    if (!drawing || event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement) return;
    if (shape.value === "brush" && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
      event.preventDefault(); event.stopImmediatePropagation(); undoStroke(); return;
    }
    if (!["Enter", "Escape", "Backspace"].includes(event.key)) return;
    event.preventDefault(); event.stopImmediatePropagation();
    if (event.key === "Enter") finishOutline();
    else if (event.key === "Escape") { stopDrawing(); drawPreview(); }
    else if (shape.value === "brush") undoStroke();
    else { outline.pop(); sync(); drawPreview(); }
  };
  documentRef.addEventListener("keydown", keys, true);
  const releaseSpace = (): void => { spaceHeld = false; pan = null; sync(); };
  const keyup = (event: KeyboardEvent): void => { if (event.code === "Space" && spaceHeld) { spaceHeld = false; sync(); } };
  documentRef.addEventListener("keyup", keyup, true);
  documentRef.defaultView?.addEventListener("blur", releaseSpace);
  overlay.addEventListener("pointerup", (event) => {
    if (pan?.pointerId === event.pointerId) {
      overlay.releasePointerCapture(event.pointerId); pan = null; sync(); return;
    }
    if (paintStroke?.pointerId === event.pointerId) {
      if (!spaceHeld) paint(pointer(event));
      if (paintTool === "brush" && el<HTMLInputElement>("yoloeAutoFillClosedRegionToggle").checked) {
        const fill = applyClosedRegionAutoFillFromStroke({ beforeMask: paintStroke.before, afterMask: paintMask!, width: paintCanvas!.width, height: paintCanvas!.height, points: paintStroke.points, brushRadius: brushRadius(), classId: 1 });
        paintStroke.changed ||= fill.mutated;
        if (fill.mutated) renderPaint(fill.dirtyBounds);
      }
      if (paintStroke.changed) undoPaint = paintStroke.before;
      paintStroke = null; hasPaint = paintMask!.some((pixel) => pixel > 0);
      overlay.releasePointerCapture(event.pointerId); sync(); drawPreview(); return;
    }
    if (!drawing || shape.value === "mask" || !start) return;
    end = pointer(event);
    const box: VisualExample["box"] = [Math.min(start.x, end.x), Math.min(start.y, end.y), Math.max(start.x, end.x), Math.max(start.y, end.y)];
    overlay.releasePointerCapture(event.pointerId);
    if (box[2] - box[0] >= 1 && box[3] - box[1] >= 1) finishSample(box); else stopDrawing();
    drawPreview();
  });
  overlay.addEventListener("pointercancel", () => { if (pan) { pan = null; sync(); } else stopDrawing(); drawPreview(); });
  el("addYoloeSelectedBtn").addEventListener("click", () => { try { addExamples(selectedExamples()); } catch (error) { message(status, error instanceof Error ? error.message : String(error)); } });
  existingBoxSelect.addEventListener("change", () => { sync(); drawPreview(); });
  el("addYoloeExistingBtn").addEventListener("click", () => {
    const selected = [...existingBoxSelect.selectedOptions].filter((option) => option.value !== "").map((option) => existingBoxes[Number(option.value)]!);
    if (!selected.length) return;
    try { addExamples(selected); } catch (error) { message(status, error instanceof Error ? error.message : String(error)); }
  });
  el("clearYoloeExamplesBtn").addEventListener("click", () => { stopDrawing(); examples = []; profile = null; referenceImage = null; clearPreview(); markPresetDirty(); renderExamples(); status.hidden = true; });
  const connect = async (signal: AbortSignal): Promise<void> => {
    const previous = modelSelect.value;
    const previousBackend = backend;
    connected = false; profile = null; clearPreview();
    setDevice(null, null);
    el("yoloeConnectionStatus").hidden = true;
    modelSelect.replaceChildren(new Option("Connect first", ""));
    const result = await requestYoloe<YoloeStatus>("status", undefined, AbortSignal.any([signal, AbortSignal.timeout(5000)]));
    signal.throwIfAborted();
    if (result.version !== 5) throw new Error(bundled ? "Restart the app to update the bundled YOLOE service." : "Restart npm run yoloe:start to enable model selection and CPU inference.");
    setDevice(result.backend ?? (result.cuda ? "cuda" : "cpu"), result.gpu);
    const info = el("yoloeConnectionStatus");
    message(info, result.cuda ? gpuName ?? "GPU" : "GPU unavailable · Using CPU · N default");
    readyModels = result.models;
    modelSelect.replaceChildren(...["n", "s", "m", "l"].map((size) => {
      const name = `yoloe-26${size}-seg`;
      return new Option(`${size.toUpperCase()} · ${name}${readyModels.includes(name) ? "" : " · Not prepared"}`, name);
    }));
    modelSelect.value = result.cuda
      ? [previous, "yoloe-26s-seg", "yoloe-26n-seg", "yoloe-26m-seg", "yoloe-26l-seg"].find((name) => readyModels.includes(name)) ?? "yoloe-26s-seg"
      : previousBackend === "cpu" && readyModels.includes(previous) ? previous : "yoloe-26n-seg";
    connected = true;
    if (!readyModels.includes(modelSelect.value)) message(status, prepareMessage());
    else status.hidden = true;
  };
  el("connectYoloeBtn").addEventListener("click", () => { connectionAttempted = true; void work("Connecting YOLOE", connect); });
  const refreshPresets = async (): Promise<void> => {
    try {
      presets = (await listYoloePresets(documentRef.defaultView!)).filter((file) => {
        try { return parseYoloePreset(file.contents).workflow === workflow; } catch { return false; }
      });
      const select = el<HTMLSelectElement>("yoloePresetSelect");
      select.replaceChildren(new Option("Choose a preset…", ""), ...presets.map((file) => new Option(file.name, file.filePath)));
      select.value = presetPath ?? "";
    } catch (error) { el("yoloePresetLocation").textContent = error instanceof Error ? error.message : String(error); }
  };
  const loadPreset = (file: EasyLabelingLibraryFile, path?: string): void => { void work("Loading YOLOE preset", async (signal) => {
    const saved = parseYoloePreset(file.contents);
    if (saved.workflow !== workflow) throw new Error(`Switch to ${saved.workflow === "segmentation" ? "Segmentation" : "Detection"} to load this preset.`);
    const restored: typeof examples = [];
    for (const reference of saved.references) {
      const image = new Image(); image.src = reference.image; await image.decode(); signal.throwIfAborted();
      if (image.naturalWidth * image.naturalHeight > 32_000_000
        || reference.examples.some((e) => e.box[2] > image.naturalWidth || e.box[3] > image.naturalHeight
          || e.polygon?.some(([x, y]) => x < 0 || y < 0 || x > image.naturalWidth || y > image.naturalHeight))) throw new Error("Preset sample lies outside its reference image.");
      restored.push(...reference.examples.map((example) => ({ ...example, sourceImage: image, sourceName: reference.name })));
    }
    if (!connected) await connect(signal);
    const s = saved.settings;
    stopDrawing(); examples = restored; sourceFolder = state.session.imageFolderHandle; profile = null;
    presetPath = path; referenceImage = examples[0]!.sourceImage; referenceName = examples[0]!.sourceName;
    sampleImage = referenceImage; sampleImageName = referenceName;
    modelSelect.value = s.model; nameInput.value = s.name; sampleName.value = s.sampleName; shape.value = s.shape;
    el<HTMLSelectElement>("yoloeImageSize").value = String(s.imgsz);
    el<HTMLInputElement>("yoloeConfidenceInput").value = String(s.confidence);
    el<HTMLInputElement>("yoloeIouInput").value = String(s.iou);
    el<HTMLInputElement>("yoloeBrushRadius").value = String(s.radius);
    el("yoloeBrushRadiusValue").textContent = `${s.radius}px`;
    el<HTMLInputElement>("yoloeAutoFillClosedRegionToggle").checked = s.autoFill; paintTool = s.paintTool;
    clearPreview(); renderExamples(); fitSample(); await loadExistingBoxes();
    setPresetLocation(path ?? file.name);
    message(status, `Loaded ${file.name} · ${examples.length} sample(s)`);
  }); };
  const savePreset = (saveAs: boolean): void => { void work("Saving YOLOE preset", async () => {
    const [confidence, iou] = parameters();
    const saved: YoloePreset = { version: 1, engine: "yoloe26", workflow,
      settings: { model: modelSelect.value, imgsz: Number(el<HTMLSelectElement>("yoloeImageSize").value), confidence, iou,
        name: nameInput.value.trim(), sampleName: sampleName.value, shape: shape.value,
        radius: brushRadius(), autoFill: el<HTMLInputElement>("yoloeAutoFillClosedRegionToggle").checked, paintTool },
      references: [...new Set(examples.map((e) => e.sourceImage))].map((image) => ({ name: examples.find((e) => e.sourceImage === image)!.sourceName,
        image: imagePng(image, documentRef), examples: examples.filter((e) => e.sourceImage === image).map(({ sourceName, sourceImage, maskCanvas, ...example }) => example) })) };
    const path = await saveYoloePreset(documentRef.defaultView!, saved, saveAs, presetPath);
    if (!path) return;
    presetPath = path; setPresetLocation(path);
    await refreshPresets(); message(status, `Saved ${path}`);
  }); };
  el("saveYoloePresetBtn").addEventListener("click", () => savePreset(false));
  el("saveYoloePresetAsBtn").addEventListener("click", () => savePreset(true));
  el("yoloePresetSelect").addEventListener("change", () => {
    const file = presets.find((entry) => entry.filePath === el<HTMLSelectElement>("yoloePresetSelect").value);
    if (file) loadPreset(file, file.filePath);
  });
  el("loadYoloePresetBtn").addEventListener("click", () => {
    const opener = documentRef.defaultView!.openEasyLabelingLibraryFile;
    if (!opener) { el<HTMLInputElement>("yoloePresetFileInput").click(); return; }
    void opener("yoloe").then((file) => { if (file) loadPreset(file, file.filePath); }).catch((error: Error) => message(status, error.message));
  });
  el("yoloePresetFileInput").addEventListener("change", () => {
    const input = el<HTMLInputElement>("yoloePresetFileInput"), file = input.files?.[0]; input.value = "";
    if (file) void file.text().then((contents) => loadPreset({ name: file.name, filePath: file.name, contents }));
  });
  sampleName.addEventListener("input", sync);
  el<HTMLSelectElement>("yoloeExistingTarget").addEventListener("change", () => {
    sampleName.value = el<HTMLSelectElement>("yoloeExistingTarget").value;
    if (!sampleName.value) {
      let index = 0;
      while (examples.some((e) => e.name === `sample${index < 26 ? String.fromCharCode(65 + index) : index + 1}`)) index++;
      sampleName.value = `sample${index < 26 ? String.fromCharCode(65 + index) : index + 1}`;
    }
    sync();
  });
  el("yoloeImageSize").addEventListener("change", () => { profile = null; clearPreview(); drawPreview(); });
  shape.addEventListener("change", () => { stopDrawing(); drawPreview(); });
  el<HTMLSelectElement>("yoloeExampleClass").addEventListener("change", () => {
    sampleName.value = state.session.classNames.get(el<HTMLSelectElement>("yoloeExampleClass").value) ?? "sampleA";
  });
  modelSelect.addEventListener("change", () => {
    profile = null; clearPreview(); sync(); drawPreview();
    if (!readyModels.includes(modelSelect.value)) message(status, prepareMessage());
    else status.hidden = true;
  });
  nameInput.addEventListener("input", () => { clearPreview(); drawPreview(); });
  for (const id of ["yoloeConfidenceInput", "yoloeIouInput"]) el(id).addEventListener("input", () => { clearPreview(); drawPreview(); });
  const prepare = async (signal: AbortSignal): Promise<YoloeProfile> => {
    if (!connected) await connect(signal);
    if (!readyModels.includes(modelSelect.value)) throw new Error(prepareMessage());
    if (profile) return profile;
    if (!examples.length) throw new Error("Outline a sample first.");
    message(status, "Loading model · Encoding samples…");
    const source = state.session.imageFolderHandle;
    profile = null; clearPreview();
    const references = [...new Set(examples.map((e) => e.sourceImage))].map((image) => ({
      image: imagePng(image, documentRef),
      examples: examples.filter((e) => e.sourceImage === image).map(({ sourceImage, sourceName, maskCanvas, ...example }) => example)
    }));
    const result = await requestYoloe<YoloeProfile>("prepare", { model: modelSelect.value, workflow, references, imgsz: Number(el<HTMLSelectElement>("yoloeImageSize").value) }, signal);
    signal.throwIfAborted();
    if (source !== state.session.imageFolderHandle) throw new Error("Dataset changed. Register the examples again.");
    profile = result; sourceFolder = source;
    setDevice(result.backend, result.gpu);
    renderExamples();
    return result;
  };
  const runPreview = (inSetup: boolean): void => { void work("YOLOE preview", async (signal) => {
    const image = inSetup ? sampleImage! : state.session.currentImage!;
    const imageName = inSetup ? sampleImageName : state.session.currentImageFile!.name;
    const currentProfile = await prepare(signal);
    message(status, `Finding targets · ${imageName}…`);
    clearPreview(); drawPreview();
    const [confidence, iou] = parameters();
    const prediction = await inferYoloe(image, documentRef, currentProfile, confidence, iou, signal);
    setDevice(currentProfile.backend, currentProfile.gpu);
    signal.throwIfAborted();
    if (inSetup ? image !== sampleImage : image !== state.session.currentImage) throw new Error("Image changed. Preview the current image again.");
    let maskCanvas: HTMLCanvasElement | null = null;
    if (prediction.mask) {
      maskCanvas = documentRef.createElement("canvas"); maskCanvas.width = prediction.mask.width; maskCanvas.height = prediction.mask.height;
      const context = maskCanvas.getContext("2d")!, pixels = context.createImageData(maskCanvas.width, maskCanvas.height);
      const colors = new Map<number, number[]>();
      for (let i = 0; i < prediction.mask.mask.length; i++) {
        const id = prediction.mask.mask[i]!;
        if (!id) continue;
        if (!colors.has(id)) colors.set(id, getColorForClass(String(id)).slice(1).match(/../g)!.map((c) => Number.parseInt(c, 16)));
        const x = i % maskCanvas.width, mask = prediction.mask.mask;
        const boundary = x === 0 || x === maskCanvas.width - 1 || i < maskCanvas.width || i >= mask.length - maskCanvas.width
          || mask[i - 1] !== id || mask[i + 1] !== id || mask[i - maskCanvas.width] !== id || mask[i + maskCanvas.width] !== id;
        pixels.data.set(boundary ? [255, 255, 255, 255] : [...colors.get(id)!, 160], i * 4);
      }
      context.putImageData(pixels, 0, 0);
    }
    preview = { image, boxes: prediction.detections, maskCanvas };
    el<HTMLInputElement>("yoloeShowSampleResults").checked = true; drawPreview();
    message(status, `Preview · ${prediction.detections.length} ${prediction.mask ? "mask instance(s)" : "detection(s)"} · ${imageName} · labels unchanged`);
  }); };
  el("previewYoloeBtn").addEventListener("click", () => runPreview(false));
  el("previewYoloeSampleBtn").addEventListener("click", () => runPreview(true));
  const save = async (allImages: boolean): Promise<void> => {
    if (busy) return;
    let currentProfile: YoloeProfile | null = null;
    await work("Preparing samples", async (signal) => { currentProfile = await prepare(signal); });
    if (!currentProfile) return;
    const preparedProfile = currentProfile as YoloeProfile;
    try {
      const target = nameInput.value.trim();
      if (!/^[\p{L}\p{N}_-]{1,64}$/u.test(target)) throw new Error("Target set name: use 1–64 letters, numbers, underscores or hyphens.");
      const [confidence, iou] = parameters();
      busy = true; clearPreview(); sync();
      message(status, "Running YOLOE inference…");
      const options = { allImages, modelName: `${preparedProfile.model}-${target}`,
        onProgress: (current: number, total: number, imageName: string) => message(status, `Running · ${current}/${total} · ${Math.round(current / total * 100)}% · ${imageName}`),
        classNames: new Map(Object.entries(preparedProfile.classes)),
        metadata: { engine: "yoloe26", workflow, checkpoint: `${preparedProfile.model}.${bundled ? "onnx" : "pt"}`, backend: preparedProfile.backend, gpu: preparedProfile.gpu, targetSet: target,
          referenceImage: referenceName, referenceSha256: preparedProfile.referenceSha256, exampleCount: preparedProfile.exampleCount,
          referenceImages: [...new Set(examples.map((e) => e.sourceName))],
          samples: examples.map(({ sourceImage, sourceName, maskCanvas, ...example }) => ({ ...example, referenceImage: sourceName })),
          imgsz: preparedProfile.imgsz, confidence, iou },
      };
      const infer = async (image: HTMLImageElement, signal?: AbortSignal): Promise<YoloeResult> => {
        const result = await inferYoloe(image, documentRef, preparedProfile, confidence, iou, signal);
        setDevice(preparedProfile.backend, preparedProfile.gpu);
        options.metadata.backend = preparedProfile.backend;
        options.metadata.gpu = preparedProfile.gpu;
        return result;
      };
      const result = workflow === "segmentation"
        ? await fileSystem.runSegmentationInference({ ...options, infer })
        : await fileSystem.runDetectionInference({ ...options, infer: async (image, signal) => (await infer(image, signal)).detections });
      message(status, result ? `${result.imageCount} image(s) · ${result.detectionCount} detection(s). Active: ${result.folderName}` : "Stopped. Completed results remain on disk.");
    } catch (error) { message(status, error instanceof Error ? error.message : String(error)); }
    finally { busy = false; sync(); }
  };
  el("saveYoloeCurrentBtn").addEventListener("click", () => { void save(el<HTMLSelectElement>("yoloeSaveScope").value === "all"); });
  el("yoloeSaveScope").addEventListener("change", sync);
  canvasController.raw.canvas.on?.("after:render", drawPreview);
  const refresh = (): void => {
    sync(); drawPreview();
    if (!busy && !connectionAttempted && documentRef.querySelector(".app-workspace")?.getAttribute("data-active-task") === "yoloe") {
      connectionAttempted = true; void work("Connecting YOLOE", connect);
    }
  };
  const events = ["easy-labeling:document-status-change", "easy-labeling:image-change", "easy-labeling:label-source-change", "easy-labeling:workflow-change"];
  for (const event of events) documentRef.defaultView?.addEventListener(event, refresh);
  const observer = new MutationObserver(refresh);
  const workspace = documentRef.querySelector(".app-workspace");
  if (workspace) observer.observe(workspace, { attributes: true, attributeFilter: ["data-active-task"] });
  sync();
  return () => { operationController?.abort(); observer.disconnect(); sampleResize.disconnect(); setupModal.dispose?.(); documentRef.removeEventListener("keydown", keys, true); documentRef.removeEventListener("keyup", keyup, true); documentRef.defaultView?.removeEventListener("blur", releaseSpace); for (const event of events) documentRef.defaultView?.removeEventListener(event, refresh); clearPreview(); };
}
