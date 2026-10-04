import type { AppState } from "../app/state.js";
import type { RuntimeCanvasController } from "./canvas-controller-adapter.js";
import type { RuntimeFileSystem } from "./file-system-adapter.js";
import type { RuntimeUiManager } from "./ui-manager-adapter.js";
import { isRectObject } from "../features/canvas/fabric-types.js";
import { imagePng, selectedVisualExamples, maskRegionExample, decodeYoloeMask, requestYoloe, inferYoloe, type VisualExample, type YoloeProfile, type YoloeStatus, type YoloeResult } from "../features/inference/yoloe.js";
import type { Detection } from "../features/inference/yolo.js";
import { getColorForClass } from "../features/canvas/colors.js";

export function bindYoloeControls(input: { state: AppState; documentRef: Document; canvasController: RuntimeCanvasController; fileSystem: RuntimeFileSystem; uiManager: RuntimeUiManager }): () => void {
  const { state, documentRef, canvasController, fileSystem, uiManager } = input;
  if (!documentRef.getElementById("yoloeInferenceControls")) return () => {};
  const el = <T extends HTMLElement>(id: string): T => documentRef.getElementById(id) as T;
  const modelSelect = el<HTMLSelectElement>("yoloeModelSelect");
  const nameInput = el<HTMLInputElement>("yoloeProfileName");
  const sampleName = el<HTMLInputElement>("yoloeSampleName");
  const shape = el<HTMLSelectElement>("yoloePromptShape");
  const badge = el<HTMLElement>("yoloeBackendBadge");
  const status = el<HTMLElement>("yoloeRunStatus");
  const overlay = el<HTMLCanvasElement>("yoloePreviewCanvas");
  let connected = false, busy = false;
  let connectionAttempted = false;
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
  let outline: [number, number][] = [];
  let operationController: AbortController | null = null;
  const sync = (): void => {
    const hasImage = Boolean(state.session.currentImage && state.session.imageFolderHandle);
    el("yoloeInferenceControls").dataset.busy = String(busy);
    if (workflow !== state.session.workflow || sourceFolder && sourceFolder !== state.session.imageFolderHandle) {
      workflow = state.session.workflow;
      profile = null; sourceFolder = null;
      examples = []; referenceImage = null; drawing = false; outline = []; start = end = null;
      overlay.style.pointerEvents = "none"; overlay.style.cursor = "";
      el("drawYoloeExampleBtn").textContent = shape.value === "box" ? "Draw sample box" : "Outline sample";
      el("drawYoloeExampleBtn").setAttribute("aria-pressed", "false");
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
    sampleName.disabled = busy || drawing;
    shape.disabled = busy || drawing;
    el<HTMLButtonElement>("drawYoloeExampleBtn").disabled = busy || !hasImage;
    el<HTMLButtonElement>("finishYoloeSampleBtn").disabled = !drawing || outline.length < 3;
    el("finishYoloeSampleBtn").hidden = !drawing || shape.value === "box";
    el("yoloeDrawingHint").hidden = !drawing || shape.value === "box";
    el<HTMLButtonElement>("addYoloeSelectedBtn").disabled = busy || drawing || !hasImage;
    el<HTMLButtonElement>("clearYoloeExamplesBtn").disabled = busy;
    el("clearYoloeExamplesBtn").hidden = !examples.length;
    el<HTMLButtonElement>("connectYoloeBtn").disabled = busy;
    modelSelect.disabled = busy || drawing || !connected;
    nameInput.disabled = busy;
    el<HTMLSelectElement>("yoloeSaveScope").disabled = busy || drawing;
    for (const id of ["previewYoloeBtn", "saveYoloeCurrentBtn"]) el<HTMLButtonElement>(id).disabled = busy || drawing || !examples.length || !hasImage;
    for (const button of el("yoloeExampleList").querySelectorAll<HTMLButtonElement>("button")) button.disabled = busy || drawing;
    for (const id of ["taskInferenceBtn", "taskYoloeBtn"]) el<HTMLButtonElement>(id).disabled = busy || el<HTMLInputElement>("inferenceModelInput").disabled;
    for (const id of ["detectionWorkflowTab", "segmentationWorkflowTab"]) el<HTMLInputElement>(id).disabled = busy;
  };
  const clearPreview = (): void => {
    preview = null;
    overlay.hidden = !drawing;
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
    if (drawing && shape.value === "mask" && outline.length) {
      context.beginPath(); context.moveTo(...outline[0]!);
      for (const point of outline.slice(1)) context.lineTo(...point);
      if (end) context.lineTo(end.x, end.y);
      context.closePath(); context.globalAlpha = 0.3; context.fill(); context.globalAlpha = 1; context.stroke();
      for (const point of outline) { context.beginPath(); context.arc(...point, 3 / zoom, 0, Math.PI * 2); context.fill(); }
    } else if (drawing && start && end) context.strokeRect(Math.min(start.x, end.x), Math.min(start.y, end.y), Math.abs(end.x - start.x), Math.abs(end.y - start.y));
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
      row.style.borderLeft = `3px solid ${getColorForClass(String(example.classId))}`;
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
      context.drawImage(referenceImage!, x1, y1, x2 - x1, y2 - y1, (44 - w) / 2, (44 - h) / 2, w, h); context.restore();
      if (example.mask) {
        const cutout = documentRef.createElement("canvas"); cutout.width = example.mask.width; cutout.height = example.mask.height;
        const ctx = cutout.getContext("2d")!, pixels = ctx.createImageData(cutout.width, cutout.height);
        const mask = decodeYoloeMask(example.mask).mask;
        for (let i = 0; i < mask.length; i++) pixels.data.set([0, 0, 0, mask[i] ? 255 : 0], i * 4);
        ctx.putImageData(pixels, 0, 0); context.globalCompositeOperation = "destination-in";
        context.drawImage(cutout, (44 - w) / 2, (44 - h) / 2, w, h); context.globalCompositeOperation = "source-over";
      }
      const label = documentRef.createElement("span"); label.textContent = example.name; label.title = `Class ${example.classId}`;
      const remove = documentRef.createElement("button"); remove.type = "button"; remove.className = "btn btn-sm btn-outline-secondary";
      remove.innerHTML = '<i class="bi bi-x" aria-hidden="true"></i>'; remove.setAttribute("aria-label", `Remove sample ${example.name}`);
      remove.addEventListener("click", () => { examples.splice(examples.indexOf(example), 1); profile = null; clearPreview(); if (!examples.length) referenceImage = null; renderExamples(); });
      row.append(thumb, label, remove); list.append(row);
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
    if (examples.length + added.length > 32) throw new Error("Use at most 32 samples.");
    if (workflow === "segmentation" && added.some((e) => !Number.isInteger(e.classId) || e.classId < 1 || e.classId > 65535)) throw new Error("Segmentation class IDs must be 1–65535; 0 is background.");
    useReference(); examples.push(...added); profile = null; clearPreview(); renderExamples();
    message(status, `${referenceName} · ${examples.length} sample(s) · Ready to find`);
  };
  const selectedExamples = (): VisualExample[] => workflow === "segmentation"
    ? maskRegionExample(canvasController.raw.getSelectedSegmentationRegion?.() ?? null, state.session.classNames, state.session.currentImage!.naturalWidth)
    : selectedVisualExamples([...new Set(canvasController.raw.canvas.getActiveObjects().filter(isRectObject))], state.session.currentImage!.naturalWidth, state.session.currentImage!.naturalHeight, state.session.classNames);
  const stopDrawing = (): void => {
    drawing = false; start = end = null; outline = []; overlay.style.pointerEvents = "none"; overlay.style.cursor = "";
    el("drawYoloeExampleBtn").textContent = shape.value === "box" ? "Draw sample box" : "Outline sample";
    el("drawYoloeExampleBtn").setAttribute("aria-pressed", "false");
    sync();
  };
  el("drawYoloeExampleBtn").addEventListener("click", () => {
    if (drawing) { stopDrawing(); drawPreview(); return; }
    try {
      if (!sampleName.value.trim()) throw new Error("Name the sample first.");
      useReference(); clearPreview(); drawing = true; start = end = null; outline = [];
      overlay.style.pointerEvents = "auto"; overlay.style.cursor = "crosshair";
      el("drawYoloeExampleBtn").textContent = "Cancel sample";
      el("drawYoloeExampleBtn").setAttribute("aria-pressed", "true");
      message(status, shape.value === "box" ? "Drag around the sample." : "Click the target outline, then Enter to finish.");
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
    if (shape.value === "mask") {
      if (outline.length >= 512) { message(status, "Use at most 512 outline points."); return; }
      const point = pointer(event), last = outline.at(-1);
      if (!last || Math.hypot(point.x - last[0], point.y - last[1]) > 0.5) outline.push([point.x, point.y]);
      end = point; event.preventDefault(); sync(); drawPreview(); return;
    }
    start = end = pointer(event); overlay.setPointerCapture(event.pointerId); event.preventDefault(); drawPreview();
  });
  overlay.addEventListener("pointermove", (event) => { if (drawing && (start || outline.length)) { end = pointer(event); drawPreview(); } });
  const finishSample = (box: VisualExample["box"], polygon?: VisualExample["polygon"]): void => {
    try {
      const name = sampleName.value.trim();
      const existing = examples.find((e) => e.name === name)?.classId ?? [...state.session.classNames].find(([id, label]) => label === name && (workflow === "detection" || Number(id) > 0))?.[0];
      const used = new Set([...state.session.classNames.keys(), ...examples.map((e) => String(e.classId))]);
      let next = 1; while (used.has(String(next))) next++;
      if (next > 65535) throw new Error("No sample class ID is available.");
      const classId = existing === undefined ? next : Number(existing);
      addExamples([{ classId, name, box, ...(polygon ? { polygon } : {}) }]);
      let index = 0;
      while (examples.some((e) => e.name === `sample${index < 26 ? String.fromCharCode(65 + index) : index + 1}`)) index++;
      sampleName.value = `sample${index < 26 ? String.fromCharCode(65 + index) : index + 1}`;
    } catch (error) { message(status, error instanceof Error ? error.message : String(error)); }
    stopDrawing(); drawPreview();
  };
  const finishOutline = (): void => {
    if (!drawing || shape.value !== "mask" || outline.length < 3) return;
    const area = outline.reduce((sum, a, i) => { const b = outline[(i + 1) % outline.length]!; return sum + a[0] * b[1] - b[0] * a[1]; }, 0);
    if (Math.abs(area) < 2) { message(status, "Outline an area of the target before finishing."); return; }
    const xs = outline.map(([x]) => x), ys = outline.map(([, y]) => y);
    finishSample([Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)], [...outline]);
  };
  overlay.addEventListener("dblclick", finishOutline);
  el("finishYoloeSampleBtn").addEventListener("click", finishOutline);
  const keys = (event: KeyboardEvent): void => {
    if (!drawing || event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement) return;
    if (!["Enter", "Escape", "Backspace"].includes(event.key)) return;
    event.preventDefault(); event.stopImmediatePropagation();
    if (event.key === "Enter") finishOutline();
    else if (event.key === "Escape") { stopDrawing(); drawPreview(); }
    else { outline.pop(); sync(); drawPreview(); }
  };
  documentRef.addEventListener("keydown", keys, true);
  overlay.addEventListener("pointerup", (event) => {
    if (!drawing || shape.value === "mask" || !start) return;
    end = pointer(event);
    const box: VisualExample["box"] = [Math.min(start.x, end.x), Math.min(start.y, end.y), Math.max(start.x, end.x), Math.max(start.y, end.y)];
    overlay.releasePointerCapture(event.pointerId);
    if (box[2] - box[0] >= 1 && box[3] - box[1] >= 1) finishSample(box); else stopDrawing();
    drawPreview();
  });
  overlay.addEventListener("pointercancel", () => { stopDrawing(); drawPreview(); });
  el("addYoloeSelectedBtn").addEventListener("click", () => { try { addExamples(selectedExamples()); } catch (error) { message(status, error instanceof Error ? error.message : String(error)); } });
  el("clearYoloeExamplesBtn").addEventListener("click", () => { stopDrawing(); examples = []; profile = null; referenceImage = null; clearPreview(); renderExamples(); status.hidden = true; });
  const connect = async (signal: AbortSignal): Promise<void> => {
    connected = false; profile = null; clearPreview();
    badge.textContent = "Disconnected";
    el("yoloeConnectionStatus").hidden = true;
    modelSelect.replaceChildren(new Option("Connect GPU first", ""));
    const result = await requestYoloe<YoloeStatus>("status", undefined, AbortSignal.any([signal, AbortSignal.timeout(5000)]));
    signal.throwIfAborted();
    if (result.version !== 3) throw new Error("Restart npm run yoloe:start to enable sample masks.");
    badge.textContent = result.cuda ? "GPU · CUDA" : "GPU unavailable";
    badge.title = result.gpu ?? "NVIDIA CUDA is required for YOLOE-26.";
    const info = el("yoloeConnectionStatus");
    message(info, result.cuda ? result.gpu! : "Run npm run yoloe:check and verify the NVIDIA driver.");
    modelSelect.replaceChildren(...result.models.map((name) => new Option(name, name)));
    connected = result.cuda;
    if (!result.models.length) { modelSelect.append(new Option("Prepare a model first", "")); message(status, "Run npm run yoloe:prepare, then reconnect GPU."); }
    else status.hidden = true;
  };
  el("connectYoloeBtn").addEventListener("click", () => { connectionAttempted = true; void work("Connecting GPU", connect); });
  shape.addEventListener("change", stopDrawing);
  el<HTMLSelectElement>("yoloeExampleClass").addEventListener("change", () => {
    sampleName.value = state.session.classNames.get(el<HTMLSelectElement>("yoloeExampleClass").value) ?? "sampleA";
  });
  modelSelect.addEventListener("change", () => { profile = null; clearPreview(); sync(); });
  nameInput.addEventListener("input", clearPreview);
  for (const id of ["yoloeConfidenceInput", "yoloeIouInput"]) el(id).addEventListener("input", clearPreview);
  const prepare = async (signal: AbortSignal): Promise<YoloeProfile> => {
    if (!connected) await connect(signal);
    if (!connected) throw new Error("NVIDIA CUDA GPU is unavailable.");
    if (!modelSelect.value) throw new Error("Run npm run yoloe:prepare, then reconnect GPU.");
    if (profile) return profile;
    if (!examples.length) throw new Error("Outline a sample first.");
    const image = referenceImage!;
    const source = state.session.imageFolderHandle;
    profile = null; clearPreview();
    const result = await requestYoloe<YoloeProfile>("prepare", { model: modelSelect.value, workflow, image: imagePng(image, documentRef), examples }, signal);
    signal.throwIfAborted();
    if (source !== state.session.imageFolderHandle) throw new Error("Dataset changed. Register the examples again.");
    profile = result; sourceFolder = source;
    renderExamples();
    return result;
  };
  el("previewYoloeBtn").addEventListener("click", () => { void work("YOLOE preview", async (signal) => {
    const currentProfile = await prepare(signal);
    const image = state.session.currentImage!;
    clearPreview();
    const [confidence, iou] = parameters();
    const prediction = await inferYoloe(image, documentRef, currentProfile, confidence, iou, signal);
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
    preview = { image, boxes: prediction.detections, maskCanvas }; drawPreview();
    message(status, `Preview · ${prediction.detections.length} ${prediction.mask ? "mask instance(s)" : "detection(s)"} · labels unchanged`);
  }); });
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
        classNames: new Map(Object.entries(preparedProfile.classes)),
        metadata: { engine: "yoloe26", workflow, checkpoint: `${preparedProfile.model}.pt`, backend: "cuda", gpu: preparedProfile.gpu, targetSet: target,
          referenceImage: referenceName, referenceSha256: preparedProfile.referenceSha256, exampleCount: preparedProfile.exampleCount,
          samples: examples, confidence, iou },
      };
      const infer = (image: HTMLImageElement, signal?: AbortSignal): Promise<YoloeResult> => inferYoloe(image, documentRef, preparedProfile, confidence, iou, signal);
      const result = workflow === "segmentation"
        ? await fileSystem.runSegmentationInference({ ...options, infer })
        : await fileSystem.runDetectionInference({ ...options, infer: async (image, signal) => (await infer(image, signal)).detections });
      message(status, result ? `${result.imageCount} image(s) · ${result.detectionCount} detection(s). Active: ${result.folderName}` : "Stopped. Completed results remain on disk.");
    } catch (error) { message(status, error instanceof Error ? error.message : String(error)); }
    finally { busy = false; sync(); }
  };
  el("saveYoloeCurrentBtn").addEventListener("click", () => { void save(el<HTMLSelectElement>("yoloeSaveScope").value === "all"); });
  canvasController.raw.canvas.on?.("after:render", drawPreview);
  const refresh = (): void => {
    sync(); drawPreview();
    if (!busy && !connectionAttempted && documentRef.querySelector(".app-workspace")?.getAttribute("data-active-task") === "yoloe") {
      connectionAttempted = true; void work("Connecting GPU", connect);
    }
  };
  const events = ["easy-labeling:document-status-change", "easy-labeling:image-change", "easy-labeling:label-source-change", "easy-labeling:workflow-change"];
  for (const event of events) documentRef.defaultView?.addEventListener(event, refresh);
  const observer = new MutationObserver(refresh);
  const workspace = documentRef.querySelector(".app-workspace");
  if (workspace) observer.observe(workspace, { attributes: true, attributeFilter: ["data-active-task"] });
  sync();
  return () => { operationController?.abort(); observer.disconnect(); documentRef.removeEventListener("keydown", keys, true); for (const event of events) documentRef.defaultView?.removeEventListener(event, refresh); clearPreview(); };
}
