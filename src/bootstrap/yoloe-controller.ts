import type { AppState } from "../app/state.js";
import type { RuntimeCanvasController } from "./canvas-controller-adapter.js";
import type { RuntimeFileSystem } from "./file-system-adapter.js";
import type { RuntimeUiManager } from "./ui-manager-adapter.js";
import { isRectObject } from "../features/canvas/fabric-types.js";
import { imagePng, selectedVisualExamples, maskRegionExample, requestYoloe, inferYoloe, type VisualExample, type YoloeProfile, type YoloeStatus, type YoloeResult } from "../features/inference/yoloe.js";
import type { Detection } from "../features/inference/yolo.js";
import { getColorForClass } from "../features/canvas/colors.js";

export function bindYoloeControls(input: { state: AppState; documentRef: Document; canvasController: RuntimeCanvasController; fileSystem: RuntimeFileSystem; uiManager: RuntimeUiManager }): () => void {
  const { state, documentRef, canvasController, fileSystem, uiManager } = input;
  if (!documentRef.getElementById("yoloeInferenceControls")) return () => {};
  const el = <T extends HTMLElement>(id: string): T => documentRef.getElementById(id) as T;
  const modelSelect = el<HTMLSelectElement>("yoloeModelSelect");
  const nameInput = el<HTMLInputElement>("yoloeProfileName");
  const badge = el<HTMLElement>("yoloeBackendBadge");
  const status = el<HTMLElement>("yoloeRunStatus");
  const overlay = el<HTMLCanvasElement>("yoloePreviewCanvas");
  let connected = false, busy = false;
  let profile: YoloeProfile | null = null;
  let sourceFolder: FileSystemDirectoryHandle | null = null;
  let referenceName = "";
  let preview: { image: HTMLImageElement; boxes: Detection[]; maskCanvas: HTMLCanvasElement | null } | null = null;
  let examples: VisualExample[] = [];
  let referenceImage: HTMLImageElement | null = null;
  let workflow = state.session.workflow;
  let drawing = false;
  let start: { x: number; y: number } | null = null;
  let end: { x: number; y: number } | null = null;
  let operationController: AbortController | null = null;
  const sync = (): void => {
    const hasImage = Boolean(state.session.currentImage && state.session.imageFolderHandle);
    el("yoloeInferenceControls").dataset.busy = String(busy);
    if (workflow !== state.session.workflow || sourceFolder && sourceFolder !== state.session.imageFolderHandle) {
      workflow = state.session.workflow;
      profile = null; sourceFolder = null;
      examples = []; referenceImage = null; drawing = false;
      el("yoloeExampleList").replaceChildren();
      clearPreview();
    }
    el("yoloeOutputBadge").textContent = workflow === "segmentation" ? "Segmentation · Masks" : "Detection · Boxes";
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
    el<HTMLButtonElement>("drawYoloeExampleBtn").disabled = busy || !hasImage || !classes.value;
    el<HTMLButtonElement>("addYoloeSelectedBtn").disabled = busy || drawing || !hasImage;
    el<HTMLButtonElement>("clearYoloeExamplesBtn").disabled = busy;
    el("clearYoloeExamplesBtn").hidden = !examples.length;
    el<HTMLButtonElement>("connectYoloeBtn").disabled = busy;
    modelSelect.disabled = busy || drawing || !connected;
    nameInput.disabled = busy;
    el<HTMLButtonElement>("registerYoloeExamplesBtn").disabled = busy || drawing || !connected || !modelSelect.value || !hasImage;
    for (const id of ["previewYoloeBtn", "saveYoloeCurrentBtn", "runYoloeAllBtn"]) el<HTMLButtonElement>(id).disabled = busy || drawing || !profile || !hasImage;
    for (const id of ["taskInferenceBtn", "taskYoloeBtn"]) el<HTMLButtonElement>(id).disabled = busy || el<HTMLInputElement>("inferenceModelInput").disabled;
    for (const id of ["detectionWorkflowTab", "segmentationWorkflowTab"]) el<HTMLInputElement>(id).disabled = busy;
  };
  const clearPreview = (): void => {
    preview = null;
    overlay.hidden = !drawing;
    el("clearYoloePreviewBtn").hidden = true;
  };
  const drawPreview = (): void => {
    if (preview && preview.image !== state.session.currentImage) clearPreview();
    if (drawing && referenceImage !== state.session.currentImage) stopDrawing();
    const canvas = canvasController.raw.canvas;
    const parent = canvas.upperCanvasEl?.getBoundingClientRect?.();
    const container = overlay.parentElement!.getBoundingClientRect();
    overlay.style.inset = "auto";
    overlay.style.left = `${(parent?.left ?? container.left) - container.left}px`;
    overlay.style.top = `${(parent?.top ?? container.top) - container.top}px`;
    overlay.style.width = `${canvas.width}px`;
    overlay.style.height = `${canvas.height}px`;
    overlay.width = canvas.width; overlay.height = canvas.height;
    const active = documentRef.querySelector(".app-workspace")?.getAttribute("data-active-task") === "yoloe";
    if (!active && drawing) stopDrawing();
    overlay.hidden = !active || !preview && !drawing;
    const context = overlay.getContext("2d")!;
    context.setTransform(...canvas.viewportTransform);
    const zoom = canvas.getZoom();
    context.strokeStyle = "#17a2b8"; context.fillStyle = "#17a2b8";
    context.lineWidth = 2 / zoom; context.setLineDash([6 / zoom, 3 / zoom]);
    context.font = `${12 / zoom}px sans-serif`;
    if (preview?.maskCanvas) {
      context.globalAlpha = 0.55; context.drawImage(preview.maskCanvas, 0, 0); context.globalAlpha = 1;
    }
    for (const box of preview?.maskCanvas ? [] : preview?.boxes ?? []) {
      context.strokeRect(box.left, box.top, box.right - box.left, box.bottom - box.top);
      context.fillText(`${profile?.classes[String(box.classId)] ?? box.classId} ${(box.confidence * 100).toFixed(0)}%`, box.left, Math.max(14 / zoom, box.top - 3 / zoom));
    }
    if (drawing && start && end) context.strokeRect(Math.min(start.x, end.x), Math.min(start.y, end.y), Math.abs(end.x - start.x), Math.abs(end.y - start.y));
  };
  const message = (target: HTMLElement, text: string): void => { target.hidden = false; target.textContent = text; };
  const work = async (title: string, action: (signal: AbortSignal) => Promise<void>): Promise<void> => {
    if (busy) return;
    busy = true; sync();
    const operation = uiManager.beginOperation({ title, detail: "YOLOE-26 · GPU / CUDA", cancellable: true });
    operationController = new AbortController();
    const controller = operationController;
    const cancel = (): void => controller.abort(new Error("YOLOE operation stopped."));
    operation.signal.addEventListener("abort", cancel, { once: true });
    try { await action(controller.signal); }
    catch (error) { message(status, error instanceof Error ? error.message : String(error)); }
    finally { operation.signal.removeEventListener("abort", cancel); operation.finish(); operationController = null; busy = false; sync(); }
  };
  const parameters = (): [number, number] => {
    const values: [number, number] = [el<HTMLInputElement>("yoloeConfidenceInput").valueAsNumber, el<HTMLInputElement>("yoloeIouInput").valueAsNumber];
    if (!values.every((x) => Number.isFinite(x) && x >= 0 && x <= 1)) throw new Error("Confidence and IoU must be between 0 and 1.");
    return values;
  };
  const renderExamples = (): void => {
    const list = el("yoloeExampleList"); list.replaceChildren();
    for (const example of examples) {
      const row = documentRef.createElement("div");
      const thumb = documentRef.createElement("canvas"); thumb.width = thumb.height = 44;
      const [x1, y1, x2, y2] = example.box;
      const scale = Math.min(44 / (x2 - x1), 44 / (y2 - y1));
      const w = (x2 - x1) * scale, h = (y2 - y1) * scale;
      thumb.getContext("2d")!.drawImage(referenceImage!, x1, y1, x2 - x1, y2 - y1, (44 - w) / 2, (44 - h) / 2, w, h);
      const label = documentRef.createElement("span"); label.textContent = `${example.classId}: ${example.name}`;
      row.append(thumb, label); list.append(row);
    }
    sync();
  };
  const useReference = (): void => {
    if (examples.length && referenceImage !== state.session.currentImage) throw new Error("Examples use one reference image. Clear examples before choosing another image.");
    referenceImage = state.session.currentImage;
    referenceName = state.session.currentImageFile!.name;
    sourceFolder = state.session.imageFolderHandle;
  };
  const addExamples = (added: VisualExample[]): void => {
    if (examples.length + added.length > 32) throw new Error("Use at most 32 example boxes.");
    if (workflow === "segmentation" && added.some((e) => !Number.isInteger(e.classId) || e.classId < 1 || e.classId > 65535)) throw new Error("Segmentation class IDs must be 1–65535; 0 is background.");
    useReference(); examples.push(...added); profile = null; clearPreview(); renderExamples();
    message(status, `${referenceName} · ${examples.length} example(s) · Register examples to continue`);
  };
  const selectedExamples = (): VisualExample[] => workflow === "segmentation"
    ? maskRegionExample(canvasController.raw.getSelectedSegmentationRegion?.() ?? null, state.session.classNames)
    : selectedVisualExamples([...new Set(canvasController.raw.canvas.getActiveObjects().filter(isRectObject))], state.session.currentImage!.naturalWidth, state.session.currentImage!.naturalHeight, state.session.classNames);
  const stopDrawing = (): void => {
    drawing = false; start = end = null; overlay.style.pointerEvents = "none"; overlay.style.cursor = "";
    el("drawYoloeExampleBtn").textContent = "Draw example box";
    el("drawYoloeExampleBtn").setAttribute("aria-pressed", "false");
    sync();
  };
  el("drawYoloeExampleBtn").addEventListener("click", () => {
    if (drawing) { stopDrawing(); drawPreview(); return; }
    try {
      useReference(); clearPreview(); drawing = true; start = end = null;
      overlay.style.pointerEvents = "auto"; overlay.style.cursor = "crosshair";
      el("drawYoloeExampleBtn").textContent = "Cancel example box";
      el("drawYoloeExampleBtn").setAttribute("aria-pressed", "true");
      message(status, "Drag a box around the example. Source labels stay unchanged.");
      sync(); drawPreview();
    } catch (error) { message(status, String(error instanceof Error ? error.message : error)); }
  });
  const pointer = (event: PointerEvent): { x: number; y: number } => {
    const bounds = overlay.getBoundingClientRect();
    const [a, b, c, d, tx, ty] = canvasController.raw.canvas.viewportTransform;
    const x = (event.clientX - bounds.left) * overlay.width / bounds.width - tx;
    const y = (event.clientY - bounds.top) * overlay.height / bounds.height - ty;
    const det = a * d - b * c;
    return { x: Math.max(0, Math.min(referenceImage!.naturalWidth, (d * x - c * y) / det)), y: Math.max(0, Math.min(referenceImage!.naturalHeight, (a * y - b * x) / det)) };
  };
  overlay.addEventListener("pointerdown", (event) => {
    if (!drawing || event.button !== 0) return;
    start = end = pointer(event); overlay.setPointerCapture(event.pointerId); event.preventDefault(); drawPreview();
  });
  overlay.addEventListener("pointermove", (event) => { if (drawing && start) { end = pointer(event); drawPreview(); } });
  overlay.addEventListener("pointerup", (event) => {
    if (!drawing || !start) return;
    end = pointer(event);
    const box: VisualExample["box"] = [Math.min(start.x, end.x), Math.min(start.y, end.y), Math.max(start.x, end.x), Math.max(start.y, end.y)];
    const id = el<HTMLSelectElement>("yoloeExampleClass").value;
    overlay.releasePointerCapture(event.pointerId); stopDrawing();
    try { if (box[2] - box[0] >= 1 && box[3] - box[1] >= 1) addExamples([{ classId: Number(id), name: state.session.classNames.get(id) ?? `class ${id}`, box }]); }
    catch (error) { message(status, error instanceof Error ? error.message : String(error)); }
    drawPreview();
  });
  overlay.addEventListener("pointercancel", () => { stopDrawing(); drawPreview(); });
  el("addYoloeSelectedBtn").addEventListener("click", () => { try { addExamples(selectedExamples()); } catch (error) { message(status, error instanceof Error ? error.message : String(error)); } });
  el("clearYoloeExamplesBtn").addEventListener("click", () => { stopDrawing(); examples = []; profile = null; referenceImage = null; clearPreview(); renderExamples(); status.hidden = true; });
  el("connectYoloeBtn").addEventListener("click", () => { void work("Connecting GPU", async (signal) => {
    connected = false; profile = null; clearPreview();
    badge.textContent = "Disconnected";
    el("yoloeConnectionStatus").hidden = true;
    modelSelect.replaceChildren(new Option("Connect GPU first", ""));
    const result = await requestYoloe<YoloeStatus>("status", undefined, AbortSignal.any([signal, AbortSignal.timeout(5000)]));
    signal.throwIfAborted();
    if (result.version !== 2) throw new Error("Restart npm run yoloe:start to match this application.");
    badge.textContent = result.cuda ? "GPU · CUDA" : "GPU unavailable";
    badge.title = result.gpu ?? "NVIDIA CUDA is required for YOLOE-26.";
    const info = el("yoloeConnectionStatus");
    message(info, result.cuda ? result.gpu! : "Run npm run yoloe:check and verify the NVIDIA driver.");
    modelSelect.replaceChildren(...result.models.map((name) => new Option(name, name)));
    connected = result.cuda;
    if (!result.models.length) { modelSelect.append(new Option("Prepare a model first", "")); message(status, "Run npm run yoloe:prepare, then Connect GPU."); }
    else status.hidden = true;
  }); });
  modelSelect.addEventListener("change", () => { profile = null; clearPreview(); sync(); });
  nameInput.addEventListener("input", clearPreview);
  for (const id of ["yoloeConfidenceInput", "yoloeIouInput"]) el(id).addEventListener("input", clearPreview);
  el("registerYoloeExamplesBtn").addEventListener("click", () => { void work("Registering visual examples", async (signal) => {
    if (!examples.length) addExamples(selectedExamples());
    const image = referenceImage!;
    const source = state.session.imageFolderHandle;
    profile = null; clearPreview();
    const result = await requestYoloe<YoloeProfile>("prepare", { model: modelSelect.value, workflow, image: imagePng(image, documentRef), examples }, signal);
    signal.throwIfAborted();
    if (source !== state.session.imageFolderHandle) throw new Error("Dataset changed. Register the examples again.");
    profile = result; sourceFolder = source;
    renderExamples();
    message(status, `${referenceName} · ${examples.length} example(s) · ${Object.keys(result.classes).length} class(es)`);
  }); });
  el("previewYoloeBtn").addEventListener("click", () => { void work("YOLOE preview", async (signal) => {
    const image = state.session.currentImage!;
    clearPreview();
    const [confidence, iou] = parameters();
    const prediction = await inferYoloe(image, documentRef, profile!, confidence, iou, signal);
    signal.throwIfAborted();
    if (image !== state.session.currentImage) throw new Error("Image changed. Preview the current image again.");
    let maskCanvas: HTMLCanvasElement | null = null;
    if (prediction.mask) {
      maskCanvas = documentRef.createElement("canvas"); maskCanvas.width = prediction.mask.width; maskCanvas.height = prediction.mask.height;
      const context = maskCanvas.getContext("2d")!, pixels = context.createImageData(maskCanvas.width, maskCanvas.height);
      const colors = new Map<number, number[]>();
      for (let i = 0; i < prediction.mask.mask.length; i++) {
        const id = prediction.mask.mask[i]!;
        if (!id) continue;
        if (!colors.has(id)) colors.set(id, getColorForClass(String(id)).slice(1).match(/../g)!.map((c) => Number.parseInt(c, 16)));
        pixels.data.set([...colors.get(id)!, 255], i * 4);
      }
      context.putImageData(pixels, 0, 0);
    }
    preview = { image, boxes: prediction.detections, maskCanvas }; drawPreview(); el("clearYoloePreviewBtn").hidden = false;
    message(status, `Preview · ${prediction.detections.length} ${prediction.mask ? "mask instance(s)" : "detection(s)"} · labels unchanged`);
  }); });
  const save = async (allImages: boolean): Promise<void> => {
    if (busy || !profile) return;
    const currentProfile = profile;
    try {
      const target = nameInput.value.trim();
      if (!/^[\p{L}\p{N}_-]{1,64}$/u.test(target)) throw new Error("Target set name: use 1–64 letters, numbers, underscores or hyphens.");
      const [confidence, iou] = parameters();
      busy = true; clearPreview(); sync();
      message(status, "Running YOLOE inference…");
      const options = { allImages, modelName: `${currentProfile.model}-${target}`,
        classNames: new Map(Object.entries(currentProfile.classes)),
        metadata: { engine: "yoloe26", workflow, checkpoint: `${currentProfile.model}.pt`, backend: "cuda", gpu: currentProfile.gpu, targetSet: target,
          referenceImage: referenceName, referenceSha256: currentProfile.referenceSha256, exampleCount: currentProfile.exampleCount, confidence, iou },
      };
      const infer = (image: HTMLImageElement, signal?: AbortSignal): Promise<YoloeResult> => inferYoloe(image, documentRef, currentProfile, confidence, iou, signal);
      const result = workflow === "segmentation"
        ? await fileSystem.runSegmentationInference({ ...options, infer })
        : await fileSystem.runDetectionInference({ ...options, infer: async (image, signal) => (await infer(image, signal)).detections });
      message(status, result ? `${result.imageCount} image(s) · ${result.detectionCount} detection(s). Active: ${result.folderName}` : "Stopped. Completed results remain on disk.");
    } catch (error) { message(status, error instanceof Error ? error.message : String(error)); }
    finally { busy = false; sync(); }
  };
  el("saveYoloeCurrentBtn").addEventListener("click", () => { void save(false); });
  el("runYoloeAllBtn").addEventListener("click", () => { void save(true); });
  el("clearYoloePreviewBtn").addEventListener("click", clearPreview);
  canvasController.raw.canvas.on?.("after:render", drawPreview);
  const refresh = (): void => { sync(); drawPreview(); };
  const events = ["easy-labeling:document-status-change", "easy-labeling:image-change", "easy-labeling:label-source-change", "easy-labeling:workflow-change"];
  for (const event of events) documentRef.defaultView?.addEventListener(event, refresh);
  const observer = new MutationObserver(refresh);
  const workspace = documentRef.querySelector(".app-workspace");
  if (workspace) observer.observe(workspace, { attributes: true, attributeFilter: ["data-active-task"] });
  sync();
  return () => { operationController?.abort(); observer.disconnect(); for (const event of events) documentRef.defaultView?.removeEventListener(event, refresh); clearPreview(); };
}
