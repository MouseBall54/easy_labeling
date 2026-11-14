import type { AppState } from "../app/state.js";
import { createInferenceService, type InferenceBackendStatus } from "../features/inference/service.js";
import type { OutputFormat } from "../features/inference/yolo.js";
import type { InferenceSaveResult, RuntimeFileSystem } from "./file-system-adapter.js";
import type { RuntimeUiManager } from "./ui-manager-adapter.js";

export interface InferenceRunSettings { confidence: number; iou: number; maxDetections: number; outputFormat: string; inputSize: number }

/** The Inference panel's model and runs (read by src/bootstrap/agent-tools-auto.ts). */
export interface InferenceAgentApi {
  status(): { model: string | null; ready: boolean; busy: boolean; backend: string | null; settings: InferenceRunSettings };
  loadModel(file: File): Promise<{ model: string; description: string; backend: string | null }>;
  /** The panel's settings unless given; results go to the model's own label folder, which becomes active. */
  run(options: { allImages: boolean; confidence?: number; iou?: number; maxDetections?: number }): Promise<InferenceSaveResult>;
}

export function bindInferenceControls(input: {
  state: AppState;
  documentRef: Document;
  fileSystem: RuntimeFileSystem;
  uiManager: RuntimeUiManager;
}): { dispose(): void; agent: InferenceAgentApi | null } {
  const { documentRef, uiManager, fileSystem, state } = input;
  if (!documentRef.getElementById("detectionInferenceWorkspace")) return { dispose: () => {}, agent: null };
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
    const taskButton = documentRef.getElementById("taskInferenceBtn") as HTMLButtonElement | null;
    if (taskButton) taskButton.disabled = busy;
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
  /** Loads a model as choosing it in the panel does; errors show in the panel and are thrown. */
  const loadModel = async (file: File): Promise<void> => {
    if (busy) throw new Error("The Inference panel is busy.");
    modelFilename.textContent = file.name;
    modelFilename.title = file.name;
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
      throw error;
    } finally {
      operation.signal.removeEventListener("abort", stop);
      operation.finish();
      busy = false;
      sync();
    }
  };
  modelInput.addEventListener("change", () => {
    const file = modelInput.files?.[0];
    if (!file || busy) return;
    loadModel(file).catch(() => undefined); // shown in the panel
  });
  const fail = (error: Error): never => {
    reportError(runStatus, error);
    throw error;
  };
  /** Runs as the panel's buttons do; `overrides` replace the panel's values for this run only. Null when stopped. */
  const run = async (allImages: boolean, overrides: { confidence?: number; iou?: number; maxDetections?: number } = {}) => {
    if (!ready || !service) throw new Error("Load an ONNX model first.");
    if (busy) throw new Error("The Inference panel is busy.");
    const confidence = overrides.confidence ?? element<HTMLInputElement>("inferenceConfidenceInput").valueAsNumber;
    const iou = overrides.iou ?? element<HTMLInputElement>("inferenceIouInput").valueAsNumber;
    const maxDet = overrides.maxDetections ?? element<HTMLInputElement>("inferenceMaxDetInput").valueAsNumber;
    if (![confidence, iou].every((value) => Number.isFinite(value) && value >= 0 && value <= 1)) {
      return fail(new Error("Confidence and IoU must be between 0 and 1."));
    }
    if (!Number.isInteger(maxDet) || maxDet < 1 || maxDet > 30000) {
      return fail(new Error("Max detections must be a whole number between 1 and 30,000."));
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
          try { return await service!.infer(image, { confidence, iou, format, maxDet }); }
          finally { signal?.removeEventListener("abort", stop); }
        }
      });
      if (!result) stop();
      runStatus.textContent = result
        ? `${result.imageCount} image(s) · ${result.detectionCount} detection(s).${result.imageCount ? ` Active: ${result.folderName}.` : ""}${result.skipped.length ? ` Skipped ${result.skipped.length} with output collisions.` : ""}`
        : "Inference stopped. Partial results remain on disk. Reload the model to continue.";
      if (!ready) modelStatus.textContent = "Model stopped. Reload the ONNX model to continue.";
      return result;
    } catch (error) {
      reportError(runStatus, error);
      throw error;
    } finally { busy = false; sync(); }
  };
  currentButton.addEventListener("click", () => { run(false).catch(() => undefined); });
  allButton.addEventListener("click", () => { run(true).catch(() => undefined); });
  documentRef.defaultView?.addEventListener("easy-labeling:document-status-change", sync);
  documentRef.defaultView?.addEventListener("easy-labeling:label-source-change", sync);
  sync();
  const agent: InferenceAgentApi = {
    status: () => ({
      model: ready ? modelName : null,
      ready,
      busy,
      backend: backendStatus.backend,
      settings: {
        confidence: element<HTMLInputElement>("inferenceConfidenceInput").valueAsNumber,
        iou: element<HTMLInputElement>("inferenceIouInput").valueAsNumber,
        maxDetections: element<HTMLInputElement>("inferenceMaxDetInput").valueAsNumber,
        outputFormat: element<HTMLSelectElement>("inferenceOutputFormat").value,
        inputSize: element<HTMLInputElement>("inferenceSizeInput").valueAsNumber
      }
    }),
    async loadModel(file) {
      await loadModel(file);
      return { model: modelName, description: modelDescription, backend: backendStatus.backend };
    },
    async run(options) {
      const result = await run(options.allImages, options);
      if (!result) throw new Error("Inference stopped. Partial results remain on disk.");
      return result;
    }
  };
  return { dispose: stop, agent };
}
