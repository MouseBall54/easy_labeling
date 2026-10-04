import type { AppState } from "../app/state.js";
import type { RuntimeCanvasController } from "./canvas-controller-adapter.js";
import type { RuntimeFileSystem } from "./file-system-adapter.js";
import type { RuntimeUiManager } from "./ui-manager-adapter.js";
import { isRectObject } from "../features/canvas/fabric-types.js";
import { imagePng, selectedVisualExamples, requestYoloe, inferYoloe, type YoloeProfile, type YoloeStatus } from "../features/inference/yoloe.js";
import type { Detection } from "../features/inference/yolo.js";

export function bindYoloeControls(input: { state: AppState; documentRef: Document; canvasController: RuntimeCanvasController; fileSystem: RuntimeFileSystem; uiManager: RuntimeUiManager }): () => void {
  const { state, documentRef, canvasController, fileSystem, uiManager } = input;
  if (!documentRef.getElementById("yoloeInferenceControls")) return () => {};
  const el = <T extends HTMLElement>(id: string): T => documentRef.getElementById(id) as T;
  const modelSelect = el<HTMLSelectElement>("yoloeModelSelect");
  const nameInput = el<HTMLInputElement>("yoloeProfileName");
  const badge = el<HTMLElement>("yoloeBackendBadge");
  const status = el<HTMLElement>("yoloeRunStatus");
  const overlay = el<HTMLCanvasElement>("yoloePreviewCanvas");
  let connected = false, busy = false, mode = false;
  let profile: YoloeProfile | null = null;
  let sourceFolder: FileSystemDirectoryHandle | null = null;
  let referenceName = "";
  let preview: { image: HTMLImageElement; boxes: Detection[] } | null = null;
  let operationController: AbortController | null = null;
  const sync = (): void => {
    const hasImage = Boolean(state.session.currentImage && state.session.imageFolderHandle && state.session.workflow === "detection");
    el("yoloeInferenceControls").dataset.busy = String(busy);
    if (sourceFolder && sourceFolder !== state.session.imageFolderHandle) {
      profile = null; sourceFolder = null;
      el("yoloeExampleList").replaceChildren();
      clearPreview();
    }
    el<HTMLButtonElement>("connectYoloeBtn").disabled = busy;
    modelSelect.disabled = busy || !connected;
    nameInput.disabled = busy;
    el<HTMLButtonElement>("registerYoloeExamplesBtn").disabled = busy || !connected || !modelSelect.value || !hasImage;
    for (const id of ["previewYoloeBtn", "saveYoloeCurrentBtn", "runYoloeAllBtn"]) el<HTMLButtonElement>(id).disabled = busy || !profile || !hasImage;
    for (const id of ["inferenceOnnxModeBtn", "inferenceYoloeModeBtn"]) el<HTMLButtonElement>(id).disabled = busy || el<HTMLInputElement>("inferenceModelInput").disabled;
  };
  const clearPreview = (): void => {
    preview = null;
    overlay.hidden = true;
    el("clearYoloePreviewBtn").hidden = true;
  };
  const drawPreview = (): void => {
    if (!preview || preview.image !== state.session.currentImage || state.session.workflow !== "detection") return clearPreview();
    const canvas = canvasController.raw.canvas;
    const parent = canvas.upperCanvasEl?.getBoundingClientRect?.();
    const container = overlay.parentElement!.getBoundingClientRect();
    overlay.style.inset = "auto";
    overlay.style.left = `${(parent?.left ?? container.left) - container.left}px`;
    overlay.style.top = `${(parent?.top ?? container.top) - container.top}px`;
    overlay.style.width = `${canvas.width}px`;
    overlay.style.height = `${canvas.height}px`;
    overlay.width = canvas.width; overlay.height = canvas.height;
    overlay.hidden = !mode || documentRef.querySelector(".app-workspace")?.getAttribute("data-active-task") !== "inference";
    const context = overlay.getContext("2d")!;
    context.setTransform(...canvas.viewportTransform);
    const zoom = canvas.getZoom();
    context.strokeStyle = "#17a2b8"; context.fillStyle = "#17a2b8";
    context.lineWidth = 2 / zoom; context.setLineDash([6 / zoom, 3 / zoom]);
    context.font = `${12 / zoom}px sans-serif`;
    for (const box of preview.boxes) {
      context.strokeRect(box.left, box.top, box.right - box.left, box.bottom - box.top);
      context.fillText(`${profile?.classes[String(box.classId)] ?? box.classId} ${(box.confidence * 100).toFixed(0)}%`, box.left, Math.max(14 / zoom, box.top - 3 / zoom));
    }
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
  for (const [id, selected] of [["inferenceOnnxModeBtn", false], ["inferenceYoloeModeBtn", true]] as const) {
    el(id).addEventListener("click", () => {
      mode = selected;
      el("onnxInferenceControls").hidden = selected;
      el("yoloeInferenceControls").hidden = !selected;
      el("inferenceBackendBadge").hidden = selected;
      for (const [buttonId, active] of [["inferenceOnnxModeBtn", !selected], ["inferenceYoloeModeBtn", selected]] as const) {
        el(buttonId).classList.toggle("active", active); el(buttonId).setAttribute("aria-pressed", String(active));
      }
      drawPreview(); sync();
    });
  }
  el("connectYoloeBtn").addEventListener("click", () => { void work("Connecting GPU", async (signal) => {
    connected = false; profile = null; clearPreview();
    el("yoloeExampleList").replaceChildren();
    badge.textContent = "Disconnected";
    el("yoloeConnectionStatus").hidden = true;
    modelSelect.replaceChildren(new Option("Connect GPU first", ""));
    const result = await requestYoloe<YoloeStatus>("status", undefined, AbortSignal.any([signal, AbortSignal.timeout(5000)]));
    signal.throwIfAborted();
    if (result.version !== 1) throw new Error("Update the YOLOE runtime to match this application.");
    badge.textContent = result.cuda ? "GPU · CUDA" : "GPU unavailable";
    badge.title = result.gpu ?? "NVIDIA CUDA is required for YOLOE-26.";
    const info = el("yoloeConnectionStatus");
    message(info, result.cuda ? result.gpu! : "Run npm run yoloe:check and verify the NVIDIA driver.");
    modelSelect.replaceChildren(...result.models.map((name) => new Option(name, name)));
    connected = result.cuda;
    if (!result.models.length) { modelSelect.append(new Option("Prepare a model first", "")); message(status, "Run npm run yoloe:prepare, then Connect GPU."); }
    else status.hidden = true;
  }); });
  modelSelect.addEventListener("change", () => { profile = null; clearPreview(); el("yoloeExampleList").replaceChildren(); sync(); });
  nameInput.addEventListener("input", clearPreview);
  for (const id of ["yoloeConfidenceInput", "yoloeIouInput"]) el(id).addEventListener("input", clearPreview);
  el("registerYoloeExamplesBtn").addEventListener("click", () => { void work("Registering visual examples", async (signal) => {
    const image = state.session.currentImage!;
    const source = state.session.imageFolderHandle;
    const referenceFileName = state.session.currentImageFile!.name;
    const examples = selectedVisualExamples([...new Set(canvasController.raw.canvas.getActiveObjects().filter(isRectObject))], image.naturalWidth || image.width, image.naturalHeight || image.height, state.session.classNames);
    profile = null; clearPreview();
    const result = await requestYoloe<YoloeProfile>("prepare", { model: modelSelect.value, image: imagePng(image, documentRef), examples }, signal);
    signal.throwIfAborted();
    if (source !== state.session.imageFolderHandle) throw new Error("Dataset changed. Register the examples again.");
    profile = result; sourceFolder = source; referenceName = referenceFileName;
    const list = el("yoloeExampleList"); list.replaceChildren();
    for (const example of examples) {
      const row = documentRef.createElement("div");
      const thumb = documentRef.createElement("canvas"); thumb.width = thumb.height = 44;
      const [x1, y1, x2, y2] = example.box;
      const scale = Math.min(44 / (x2 - x1), 44 / (y2 - y1));
      const w = (x2 - x1) * scale, h = (y2 - y1) * scale;
      thumb.getContext("2d")!.drawImage(image, x1, y1, x2 - x1, y2 - y1, (44 - w) / 2, (44 - h) / 2, w, h);
      const label = documentRef.createElement("span"); label.textContent = `${example.classId}: ${example.name}`;
      row.append(thumb, label); list.append(row);
    }
    message(status, `${referenceName} · ${examples.length} example(s) · ${Object.keys(result.classes).length} class(es)`);
  }); });
  el("previewYoloeBtn").addEventListener("click", () => { void work("YOLOE preview", async (signal) => {
    const image = state.session.currentImage!;
    clearPreview();
    const [confidence, iou] = parameters();
    const boxes = await inferYoloe(image, documentRef, profile!, confidence, iou, signal);
    signal.throwIfAborted();
    if (image !== state.session.currentImage) throw new Error("Image changed. Preview the current image again.");
    preview = { image, boxes }; drawPreview(); el("clearYoloePreviewBtn").hidden = false;
    message(status, `Preview · ${boxes.length} detection(s) · labels unchanged`);
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
      const result = await fileSystem.runDetectionInference({ allImages, modelName: `${currentProfile.model}-${target}`,
        classNames: new Map(Object.entries(currentProfile.classes)),
        metadata: { engine: "yoloe26", checkpoint: `${currentProfile.model}.pt`, backend: "cuda", gpu: currentProfile.gpu, targetSet: target,
          referenceImage: referenceName, referenceSha256: currentProfile.referenceSha256, exampleCount: currentProfile.exampleCount, confidence, iou },
        infer: (image, signal) => inferYoloe(image, documentRef, currentProfile, confidence, iou, signal)
      });
      message(status, result ? `${result.imageCount} image(s) · ${result.detectionCount} detection(s). Active: ${result.folderName}` : "Stopped. Completed results remain on disk.");
    } catch (error) { message(status, error instanceof Error ? error.message : String(error)); }
    finally { busy = false; sync(); }
  };
  el("saveYoloeCurrentBtn").addEventListener("click", () => { void save(false); });
  el("runYoloeAllBtn").addEventListener("click", () => { void save(true); });
  el("clearYoloePreviewBtn").addEventListener("click", clearPreview);
  canvasController.raw.canvas.on?.("after:render", drawPreview);
  documentRef.defaultView?.addEventListener("easy-labeling:document-status-change", () => { drawPreview(); sync(); });
  const observer = new MutationObserver(drawPreview);
  const workspace = documentRef.querySelector(".app-workspace");
  if (workspace) observer.observe(workspace, { attributes: true, attributeFilter: ["data-active-task"] });
  sync();
  return () => { operationController?.abort(); observer.disconnect(); clearPreview(); };
}
