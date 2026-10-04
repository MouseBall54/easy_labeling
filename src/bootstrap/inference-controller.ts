import type { AppState } from "../app/state.js";
import { createInferenceService, type InferenceBackendStatus } from "../features/inference/service.js";
import type { OutputFormat } from "../features/inference/yolo.js";
import type { RuntimeFileSystem } from "./file-system-adapter.js";
import type { RuntimeUiManager } from "./ui-manager-adapter.js";

export function bindInferenceControls(input: {
  state: AppState;
  documentRef: Document;
  fileSystem: RuntimeFileSystem;
  uiManager: RuntimeUiManager;
}): () => void {
  const { documentRef, uiManager, fileSystem, state } = input;
  if (!documentRef.getElementById("detectionInferenceWorkspace")) return () => {};
  const element = <T extends HTMLElement>(id: string): T => documentRef.getElementById(id) as T;
  const modelInput = element<HTMLInputElement>("inferenceModelInput");
  const modelButton = element<HTMLButtonElement>("selectInferenceModelBtn");
  const modelFilename = element<HTMLElement>("inferenceModelName");
  const modelStatus = element<HTMLElement>("inferenceModelStatus");
  const backendBadge = element<HTMLElement>("inferenceBackendBadge");
  const runStatus = element<HTMLElement>("inferenceRunStatus");
  const currentButton = element<HTMLButtonElement>("runInferenceCurrentBtn");
  const allButton = element<HTMLButtonElement>("runInferenceAllBtn");
  let service: ReturnType<typeof createInferenceService> | null = null;
  let ready = false;
  let busy = false;
  let modelName = "";
  let modelDescription = "";
  let backendStatus: InferenceBackendStatus = { backend: null, fallbackReason: null };
  const renderBackend = (): void => {
    const gpu = backendStatus.backend === "webgpu";
    backendBadge.textContent = backendStatus.backend ? gpu ? "GPU · WebGPU" : "CPU · WASM" : busy ? "Loading…" : "No model";
    backendBadge.title = backendStatus.fallbackReason ?? (backendStatus.backend ? `Inference device: ${gpu ? "GPU / WebGPU" : "CPU / WASM"}` : busy ? "Determining the inference device." : "Load an ONNX model to determine the inference device.");
    if (modelDescription && backendStatus.backend) modelStatus.textContent = `${modelDescription} · ${gpu ? "GPU / WebGPU" : "CPU / WASM"}${backendStatus.fallbackReason ? " · CPU fallback" : ""}`;
  };
  const sync = (): void => {
    const enabled = ready && !busy && state.session.workflow === "detection" && Boolean(state.session.currentImageFile && state.session.imageFolderHandle);
    currentButton.disabled = !enabled;
    allButton.disabled = !enabled;
    modelInput.disabled = busy;
    modelButton.disabled = busy;
    for (const id of ["taskInferenceBtn", "taskYoloeBtn"]) {
      const button = documentRef.getElementById(id) as HTMLButtonElement | null;
      if (button) button.disabled = busy || documentRef.getElementById("yoloeInferenceControls")?.dataset.busy === "true";
    }
    renderBackend();
  };
  const stop = (): void => {
    service?.dispose(); service = null; ready = false;
    modelDescription = "";
    backendStatus = { backend: null, fallbackReason: null };
    renderBackend();
  };
  const reportError = (target: HTMLElement, error: unknown): void => {
    const message = error instanceof Error ? error.message : String(error);
    target.hidden = false;
    target.textContent = message;
    uiManager.notify(message, 6000);
  };
  let selectedFile: File | null = null;
  modelButton.addEventListener("click", () => modelInput.click());
  modelInput.addEventListener("click", () => {
    selectedFile = modelInput.files?.[0] ?? null;
    modelInput.value = ""; // Allow choosing the same model again.
  });
  modelInput.addEventListener("cancel", () => {
    if (!selectedFile) return;
    const files = new DataTransfer();
    files.items.add(selectedFile);
    modelInput.files = files.files;
  });
  modelInput.addEventListener("change", () => {
    const file = modelInput.files?.[0];
    if (!file || busy) return;
    modelFilename.textContent = file.name;
    modelFilename.title = file.name;
    void (async () => {
      stop();
      busy = true;
      sync();
      const operation = uiManager.beginOperation({ title: "Loading YOLO model", detail: file.name, cancellable: true });
      operation.signal.addEventListener("abort", stop, { once: true });
      try {
        modelStatus.hidden = false;
        modelStatus.textContent = `Loading ${file.name}…`;
        if (!/\.onnx$/i.test(file.name)) throw new Error("Select a Detection .onnx file.");
        service = createInferenceService((status) => { backendStatus = status; renderBackend(); });
        const model = await service.load(await file.arrayBuffer(), element<HTMLInputElement>("inferenceSizeInput").valueAsNumber);
        if (operation.signal.aborted) throw new Error("Model loading stopped.");
        modelName = file.name;
        ready = true;
        modelDescription = `${file.name} · ${model.channels}ch · ${model.layout.toUpperCase()} · ${model.width} × ${model.height}${model.dynamic ? " · dynamic" : ""}`;
        renderBackend();
      } catch (error) {
        stop();
        reportError(modelStatus, error);
      } finally {
        operation.signal.removeEventListener("abort", stop);
        operation.finish();
        busy = false;
        sync();
      }
    })();
  });
  const run = async (allImages: boolean): Promise<void> => {
    if (!ready || !service || busy) return;
    const confidence = element<HTMLInputElement>("inferenceConfidenceInput").valueAsNumber;
    const iou = element<HTMLInputElement>("inferenceIouInput").valueAsNumber;
    if (![confidence, iou].every((value) => Number.isFinite(value) && value >= 0 && value <= 1)) {
      reportError(runStatus, new Error("Confidence and IoU must be between 0 and 1."));
      return;
    }
    const format = element<HTMLSelectElement>("inferenceOutputFormat").value as OutputFormat;
    busy = true;
    sync();
    runStatus.hidden = false;
    runStatus.textContent = "Running inference…";
    try {
      const result = await fileSystem.runDetectionInference({
        allImages, modelName,
        infer: async (image, signal) => {
          signal?.addEventListener("abort", stop, { once: true });
          try { return await service!.infer(image, { confidence, iou, format }); }
          finally { signal?.removeEventListener("abort", stop); }
        }
      });
      if (!result) stop();
      runStatus.textContent = result
        ? `${result.imageCount} image(s) · ${result.detectionCount} detection(s). Active: ${result.folderName}`
        : "Inference stopped. Partial results remain on disk. Reload the model to continue.";
      if (!ready) modelStatus.textContent = "Model stopped. Reload the ONNX model to continue.";
    } catch (error) {
      reportError(runStatus, error);
    } finally { busy = false; sync(); }
  };
  currentButton.addEventListener("click", () => { void run(false); });
  allButton.addEventListener("click", () => { void run(true); });
  element<HTMLSelectElement>("labelSourceSelect").addEventListener("change", (event) => {
    const index = Number((event.target as HTMLSelectElement).value);
    void fileSystem.switchLabelFolder(index).catch((error) => reportError(runStatus, error)).finally(() => uiManager.syncWorkspaceState());
  });
  documentRef.defaultView?.addEventListener("easy-labeling:document-status-change", sync);
  documentRef.defaultView?.addEventListener("easy-labeling:label-source-change", sync);
  sync();
  return stop;
}
