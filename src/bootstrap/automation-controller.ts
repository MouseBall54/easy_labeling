import type { AppState } from "../app/state.js";
import {
  createEmptyAutomationLibrary,
  deleteLayoutFromLibrary,
  loadAutomationLibrary,
  saveAutomationLibrary,
  upsertById
} from "../features/automation/automation-library-service.js";
import { runSequentialBatch, type BatchSummary } from "../features/automation/batch.js";
import {
  createAutomationDetectionBoxes,
  mergeDetectionLabels,
  serializeAutomationBoxes
} from "../features/automation/batch-labels.js";
import { cropImageElementToPngDataUrl, imageElementToImageData, pngDataUrlToImageData } from "../features/automation/image-data.js";
import { calculateLayoutAnchor, validateBoxLayout } from "../features/automation/layout.js";
import {
  DEFAULT_MULTIPLE_DETECTION_SETTINGS,
  validatePreprocessingSettings
} from "../features/automation/preset-codec.js";
import { createTemplateMatchingService, requireAcceptedMatch, type TemplateMatchingService } from "../features/automation/template-matching-service.js";
import { createTemplateWorkspace } from "../features/automation/template-workspace.js";
import {
  AUTOMATION_SCHEMA_VERSION,
  TEMPLATE_SCHEMA_VERSION,
  type AutomationOutputMode,
  type AutomationLibraryDocument,
  type AutomationPreset,
  type BoxLayout,
  type ExistingLabelsPolicy,
  type MultipleDetectionSettings,
  type PixelRect,
  type TemplateAsset,
  type TemplateMatchResult,
  type TemplateMatchingSettings,
  type TemplatePreprocessingSettings
} from "../features/automation/types.js";
import type { DirectoryHandleLike, FileHandleLike } from "../types/files.js";
import type { RuntimeCanvasController } from "./canvas-controller-adapter.js";
import type { RuntimeFileSystem } from "./file-system-adapter.js";
import type { RuntimeUiManager } from "./ui-manager-adapter.js";

export interface AutomationController {
  bind(): void;
  refreshLibrary(options?: { selectFirst?: boolean }): Promise<void>;
}

export interface AutomationWindow {
  confirm(message?: string): boolean;
  prompt(message?: string, defaultValue?: string): string | null;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
  dispatchEvent(event: Event): boolean;
  URL: Pick<typeof URL, "createObjectURL" | "revokeObjectURL">;
}

function createId(prefix: string): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readFinite(input: HTMLInputElement, field: string): number {
  const value = Number(input.value);
  if (!Number.isFinite(value)) {
    throw new Error(`${field} must be a finite number`);
  }
  return value;
}

function setSelectOptions(
  documentRef: Document,
  select: HTMLSelectElement,
  items: readonly { id: string; name: string }[],
  placeholder: string,
  selectedId = ""
): void {
  select.replaceChildren();
  const placeholderOption = documentRef.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = placeholder;
  select.appendChild(placeholderOption);
  items.forEach((item) => {
    const option = documentRef.createElement("option");
    option.value = item.id;
    option.textContent = item.name;
    option.selected = item.id === selectedId;
    select.appendChild(option);
  });
}

async function decodeDataUrlImage(dataUrl: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = dataUrl;
  await image.decode();
  return image;
}

export function createAutomationController(input: {
  state: AppState;
  canvasController: RuntimeCanvasController;
  fileSystem: RuntimeFileSystem;
  uiManager: RuntimeUiManager;
  documentRef: Document;
  windowRef: AutomationWindow;
  createMatchingService?: () => TemplateMatchingService;
}): AutomationController {
  const elements = input.uiManager.elements;
  let library = createEmptyAutomationLibrary();
  let matchingService: TemplateMatchingService | null = null;
  let activePresetId: string | null = null;
  let activeTemplateDataUrl: string | null = null;
  let templateRoiDirty = false;
  let lastTemplateMatchResult: TemplateMatchResult | null = null;
  let batchCancellationRequested = false;
  let batchRunning = false;

  const getMatchingService = (): TemplateMatchingService => {
    matchingService ??= input.createMatchingService?.() ?? createTemplateMatchingService();
    return matchingService;
  };

  const warmUpMatchingEngineInBackground = (): void => {
    let service: TemplateMatchingService | null = null;
    void Promise.resolve()
      .then(() => {
        service = getMatchingService();
        return service.warmUp();
      })
      .catch(() => {
        service?.terminate();
        if (matchingService === service) {
          matchingService = null;
        }
      });
  };

  const selectedLayout = (): BoxLayout | null => {
    return library.layouts.find((layout) => layout.id === elements.boxLayoutSelect.value) ?? null;
  };

  const selectedSetupLayout = (): BoxLayout | null => {
    return library.layouts.find((layout) => layout.id === elements.layoutSetupSelect.value) ?? null;
  };

  const selectedPreset = (): AutomationPreset | null => {
    return library.presets.find((preset) => preset.id === elements.automationPresetSelect.value) ?? null;
  };

  const refreshSelects = (selection?: { layoutId?: string; presetId?: string }): void => {
    const layoutId = selection?.layoutId ?? elements.boxLayoutSelect.value;
    const presetId = selection?.presetId ?? elements.automationPresetSelect.value;
    setSelectOptions(input.documentRef, elements.boxLayoutSelect, library.layouts, "Choose layout...", layoutId);
    setSelectOptions(input.documentRef, elements.layoutSetupSelect, library.layouts, "Choose layout...", layoutId);
    setSelectOptions(input.documentRef, elements.templateLayoutSelect, library.layouts, "Choose layout...", layoutId);
    setSelectOptions(input.documentRef, elements.automationPresetSelect, library.presets, "Choose preset...", presetId);
    elements.applyBoxLayoutBtn.disabled = !library.layouts.some((layout) => layout.id === layoutId);
    elements.applyBoxLayoutFromSetupBtn.disabled = elements.applyBoxLayoutBtn.disabled;
  };

  const refreshSourceImageSelect = (): void => {
    const selectedName = input.state.session.currentImageFile?.name ?? "";
    elements.templateSourceImageSelect.replaceChildren();
    input.state.session.imageFiles.forEach((file) => {
      const option = input.documentRef.createElement("option");
      option.value = file.name;
      option.textContent = file.name;
      option.selected = file.name === selectedName;
      elements.templateSourceImageSelect.appendChild(option);
    });
  };

  const persistLibrary = async (): Promise<void> => {
    const folder = input.state.session.imageFolderHandle;
    if (!folder) {
      throw new Error("Load an image folder before saving automation settings");
    }
    await saveAutomationLibrary(folder as unknown as DirectoryHandleLike, library);
  };

  const setLayoutSetupError = (error: unknown | null): void => {
    elements.layoutSetupError.hidden = error === null;
    elements.layoutSetupError.textContent = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  };

  const renderLayoutPreview = (): void => {
    const canvas = elements.layoutPreviewCanvas;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Layout preview canvas is unavailable");
    }
    const layout = selectedSetupLayout();
    const image = input.state.session.currentImage;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#20252a";
    context.fillRect(0, 0, canvas.width, canvas.height);
    if (!layout) {
      elements.layoutDetails.textContent = "Choose a layout to inspect its geometry.";
      return;
    }

    const minX = Math.min(...layout.boxes.map((box) => box.relativeX));
    const minY = Math.min(...layout.boxes.map((box) => box.relativeY));
    const maxX = Math.max(...layout.boxes.map((box) => box.relativeX + box.width));
    const maxY = Math.max(...layout.boxes.map((box) => box.relativeY + box.height));
    const classCounts = new Map<string, number>();
    layout.boxes.forEach((box) => classCounts.set(box.classId, (classCounts.get(box.classId) ?? 0) + 1));
    const classes = [...classCounts.entries()].map(([classId, count]) => `${classId} (${count})`).join(", ");
    elements.layoutDetails.textContent = `${layout.name} | ${layout.boxes.length} boxes | Classes: ${classes} | Anchor ${Math.round(layout.sourceAnchor.x)}, ${Math.round(layout.sourceAnchor.y)} | Size ${Math.round(maxX - minX)} x ${Math.round(maxY - minY)} | Source ${layout.sourceImageSize.width} x ${layout.sourceImageSize.height}`;

    const sourceWidth = image?.naturalWidth || image?.width || layout.sourceImageSize.width;
    const sourceHeight = image?.naturalHeight || image?.height || layout.sourceImageSize.height;
    const scale = Math.min(canvas.width / sourceWidth, canvas.height / sourceHeight);
    const drawWidth = sourceWidth * scale;
    const drawHeight = sourceHeight * scale;
    const offsetX = (canvas.width - drawWidth) / 2;
    const offsetY = (canvas.height - drawHeight) / 2;
    if (image) {
      context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
    } else {
      context.fillStyle = "#e9ecef";
      context.fillRect(offsetX, offsetY, drawWidth, drawHeight);
    }
    context.lineWidth = 2;
    context.font = "12px sans-serif";
    layout.boxes.forEach((box) => {
      const x = offsetX + (layout.sourceAnchor.x + box.relativeX) * scale;
      const y = offsetY + (layout.sourceAnchor.y + box.relativeY) * scale;
      const width = box.width * scale;
      const height = box.height * scale;
      context.fillStyle = "rgba(13, 110, 253, 0.2)";
      context.strokeStyle = "#0d6efd";
      context.fillRect(x, y, width, height);
      context.strokeRect(x, y, width, height);
      context.fillStyle = "#ffffff";
      context.fillText(box.classId, x + 4, y + 14);
    });
  };

  const applyLayout = (layout: BoxLayout): void => {
    input.canvasController.raw.applyBoxLayout(layout, { ...layout.sourceAnchor });
    input.windowRef.dispatchEvent(new Event("easy-labeling:history-change"));
  };

  const showSettingsError = (error: unknown): void => {
    elements.templateSettingsError.hidden = false;
    elements.templateSettingsError.textContent = error instanceof Error ? error.message : "Unable to update template settings";
  };

  const clearSettingsError = (): void => {
    elements.templateSettingsError.hidden = true;
    elements.templateSettingsError.textContent = "";
  };

  const invalidateTemplateMatch = (): void => {
    lastTemplateMatchResult = null;
    elements.applyTemplateMatchBtn.disabled = true;
  };

  const readPreprocessing = (): TemplatePreprocessingSettings => {
    const settings: TemplatePreprocessingSettings = {
      grayscale: elements.templateGrayscaleToggle.checked,
      gaussianBlurEnabled: elements.templateBlurToggle.checked,
      blurKernelSize: readFinite(elements.templateBlurKernelInput, "Blur kernel"),
      blurSigma: readFinite(elements.templateBlurSigmaInput, "Blur sigma"),
      gaussianNoiseEnabled: elements.templateNoiseToggle.checked,
      gaussianNoiseSigma: readFinite(elements.templateNoiseSigmaInput, "Noise sigma"),
      gaussianNoiseSeed: readFinite(elements.templateNoiseSeedInput, "Noise seed")
    };
    validatePreprocessingSettings(settings);
    return settings;
  };

  const readSearchRoi = (): PixelRect | null => {
    if (!elements.templateSearchRoiToggle.checked) {
      return null;
    }
    return {
      x: readFinite(elements.templateSearchXInput, "Search X"),
      y: readFinite(elements.templateSearchYInput, "Search Y"),
      width: readFinite(elements.templateSearchWidthInput, "Search width"),
      height: readFinite(elements.templateSearchHeightInput, "Search height")
    };
  };

  const readMatching = (): TemplateMatchingSettings => {
    const minimumScore = readFinite(elements.templateMinimumScoreInput, "Minimum score");
    if (minimumScore < -1 || minimumScore > 1) {
      throw new Error("Minimum score must be between -1 and 1");
    }
    return {
      minimumScore,
      searchRoi: readSearchRoi(),
      mode: elements.templateMatchingFastRadio.checked ? "fast" : "accurate"
    };
  };

  const readOutputMode = (): AutomationOutputMode => {
    return elements.templateOutputMultipleRadio.checked ? "multiple-detection-boxes" : "layout-best-match";
  };

  const readMultipleDetection = (): MultipleDetectionSettings => {
    const settings: MultipleDetectionSettings = {
      classId: elements.templateMultipleClassIdInput.value.trim(),
      maximumDetections: readFinite(elements.templateMaximumDetectionsInput, "Maximum detections"),
      strictNonOverlap: elements.templateStrictNonOverlapToggle.checked,
      nmsIouThreshold: readFinite(elements.templateNmsIouInput, "NMS IoU threshold"),
      paddingX: readFinite(elements.templatePaddingXInput, "Padding X"),
      paddingY: readFinite(elements.templatePaddingYInput, "Padding Y")
    };
    if (!settings.classId) {
      throw new Error("Multiple Detection class ID is required");
    }
    if (!Number.isInteger(settings.maximumDetections) || settings.maximumDetections < 1 || settings.maximumDetections > 10000) {
      throw new Error("Maximum detections must be an integer between 1 and 10000");
    }
    if (settings.nmsIouThreshold < 0 || settings.nmsIouThreshold > 1) {
      throw new Error("NMS IoU threshold must be between 0 and 1");
    }
    if (settings.paddingX < 0 || settings.paddingY < 0) {
      throw new Error("Detection padding must be zero or greater");
    }
    return settings;
  };

  const syncOutputModeUi = (): void => {
    const multiple = readOutputMode() === "multiple-detection-boxes";
    elements.templateLayoutOutputSettings.hidden = multiple;
    elements.templateMultipleOutputSettings.hidden = !multiple;
  };

  const workspace = createTemplateWorkspace({
    canvas: elements.templateMatchingCanvas,
    zoomInput: elements.templateWorkspaceZoomInput,
    zoomValue: elements.templateWorkspaceZoomValue,
    originalPreviewCanvas: elements.templateOriginalPreviewCanvas,
    processedPreviewCanvas: elements.templateProcessedPreviewCanvas,
    onRoiChanged: (roi) => {
      templateRoiDirty = true;
      activeTemplateDataUrl = null;
      invalidateTemplateMatch();
      const layout = library.layouts.find((candidate) => candidate.id === elements.templateLayoutSelect.value);
      if (layout) {
        elements.templateRelationXInput.value = String(Math.round(layout.sourceAnchor.x - roi.x));
        elements.templateRelationYInput.value = String(Math.round(layout.sourceAnchor.y - roi.y));
      }
      try {
        workspace.renderPreviews(readPreprocessing());
        clearSettingsError();
      } catch (error: unknown) {
        showSettingsError(error);
      }
    }
  });

  const resetPresetForm = (): void => {
    activePresetId = null;
    activeTemplateDataUrl = null;
    templateRoiDirty = false;
    elements.templateNameInput.value = "";
    elements.templateLayoutSelect.value = elements.boxLayoutSelect.value;
    elements.templateOutputLayoutRadio.checked = true;
    elements.templateOutputMultipleRadio.checked = false;
    elements.templateMatchingAccurateRadio.checked = true;
    elements.templateMatchingFastRadio.checked = false;
    elements.templateGrayscaleToggle.checked = true;
    elements.templateBlurToggle.checked = true;
    elements.templateBlurKernelInput.value = "21";
    elements.templateBlurSigmaInput.value = "0";
    elements.templateNoiseToggle.checked = false;
    elements.templateNoiseSigmaInput.value = "0";
    elements.templateNoiseSeedInput.value = "1";
    elements.templateMinimumScoreInput.value = "0.80";
    elements.templateSearchRoiToggle.checked = false;
    elements.templateSearchRoiInputs.hidden = true;
    elements.templateRelationXInput.value = "0";
    elements.templateRelationYInput.value = "0";
    elements.templateManualXInput.value = "0";
    elements.templateManualYInput.value = "0";
    elements.templateMultipleClassIdInput.value = DEFAULT_MULTIPLE_DETECTION_SETTINGS.classId;
    elements.templateMaximumDetectionsInput.value = String(DEFAULT_MULTIPLE_DETECTION_SETTINGS.maximumDetections);
    elements.templateStrictNonOverlapToggle.checked = DEFAULT_MULTIPLE_DETECTION_SETTINGS.strictNonOverlap;
    elements.templateNmsIouInput.value = String(DEFAULT_MULTIPLE_DETECTION_SETTINGS.nmsIouThreshold);
    elements.templatePaddingXInput.value = String(DEFAULT_MULTIPLE_DETECTION_SETTINGS.paddingX);
    elements.templatePaddingYInput.value = String(DEFAULT_MULTIPLE_DETECTION_SETTINGS.paddingY);
    elements.templateExistingPolicySelect.value = "skip";
    elements.templateMatchScore.textContent = "Not tested";
    elements.templateMatchCoordinates.textContent = "";
    elements.templateMatchTimings.textContent = "";
    elements.templateMatchCandidates.replaceChildren();
    invalidateTemplateMatch();
    syncOutputModeUi();
    clearSettingsError();
    if (input.state.session.currentImage) {
      workspace.setImage(input.state.session.currentImage);
    }
  };

  const loadPresetForm = async (preset: AutomationPreset): Promise<void> => {
    const template = library.templates.find((candidate) => candidate.id === preset.templateId);
    if (!template) {
      throw new Error("The selected preset references a missing template");
    }
    activePresetId = preset.id;
    activeTemplateDataUrl = template.pngDataUrl;
    templateRoiDirty = false;
    elements.templateNameInput.value = preset.name;
    elements.templateLayoutSelect.value = preset.layoutId ?? "";
    elements.templateOutputLayoutRadio.checked = preset.outputMode === "layout-best-match";
    elements.templateOutputMultipleRadio.checked = preset.outputMode === "multiple-detection-boxes";
    elements.templateMatchingAccurateRadio.checked = preset.matching.mode === "accurate";
    elements.templateMatchingFastRadio.checked = preset.matching.mode === "fast";
    elements.templateGrayscaleToggle.checked = template.preprocessing.grayscale;
    elements.templateBlurToggle.checked = template.preprocessing.gaussianBlurEnabled;
    elements.templateBlurKernelInput.value = String(template.preprocessing.blurKernelSize);
    elements.templateBlurSigmaInput.value = String(template.preprocessing.blurSigma);
    elements.templateNoiseToggle.checked = template.preprocessing.gaussianNoiseEnabled;
    elements.templateNoiseSigmaInput.value = String(template.preprocessing.gaussianNoiseSigma);
    elements.templateNoiseSeedInput.value = String(template.preprocessing.gaussianNoiseSeed);
    elements.templateMinimumScoreInput.value = String(preset.matching.minimumScore);
    elements.templateSearchRoiToggle.checked = Boolean(preset.matching.searchRoi);
    elements.templateSearchRoiInputs.hidden = !preset.matching.searchRoi;
    const searchRoi = preset.matching.searchRoi;
    elements.templateSearchXInput.value = String(searchRoi?.x ?? 0);
    elements.templateSearchYInput.value = String(searchRoi?.y ?? 0);
    elements.templateSearchWidthInput.value = String(searchRoi?.width ?? template.sourceImageSize.width);
    elements.templateSearchHeightInput.value = String(searchRoi?.height ?? template.sourceImageSize.height);
    elements.templateRelationXInput.value = String(preset.relationOffset.x);
    elements.templateRelationYInput.value = String(preset.relationOffset.y);
    elements.templateManualXInput.value = String(preset.manualOffset.x);
    elements.templateManualYInput.value = String(preset.manualOffset.y);
    elements.templateMultipleClassIdInput.value = preset.multipleDetection.classId;
    elements.templateMaximumDetectionsInput.value = String(preset.multipleDetection.maximumDetections);
    elements.templateStrictNonOverlapToggle.checked = preset.multipleDetection.strictNonOverlap;
    elements.templateNmsIouInput.value = String(preset.multipleDetection.nmsIouThreshold);
    elements.templatePaddingXInput.value = String(preset.multipleDetection.paddingX);
    elements.templatePaddingYInput.value = String(preset.multipleDetection.paddingY);
    elements.templateExistingPolicySelect.value = preset.existingLabelsPolicy;
    if (input.state.session.currentImage) {
      workspace.setImage(input.state.session.currentImage, template.roi);
    }
    const storedImage = await decodeDataUrlImage(template.pngDataUrl);
    workspace.setStoredTemplateImage(storedImage);
    workspace.renderPreviews(template.preprocessing);
    elements.templateMatchScore.textContent = "Not tested";
    elements.templateMatchCoordinates.textContent = "";
    elements.templateMatchTimings.textContent = "";
    elements.templateMatchCandidates.replaceChildren();
    invalidateTemplateMatch();
    syncOutputModeUi();
    clearSettingsError();
  };

  const updateBatchUi = (summary: BatchSummary, currentFile = "Complete"): void => {
    elements.automationBatchProgressGroup.hidden = false;
    elements.automationBatchCurrentFile.textContent = currentFile;
    elements.automationBatchCounts.textContent = `${summary.processed} / ${summary.total}`;
    const percent = summary.total === 0 ? 0 : Math.round((summary.processed / summary.total) * 100);
    elements.automationBatchProgressBar.style.width = `${percent}%`;
    elements.automationBatchProgressBar.textContent = percent >= 15 ? `${percent}%` : "";
    const failures = summary.items.filter((item) => item.state === "failed");
    const suffix = summary.cancelled ? " | Cancelled" : "";
    elements.automationBatchResultSummary.textContent = `Success ${summary.success} | Failed ${summary.failed} | Skipped ${summary.skipped}${suffix}`;
    elements.automationBatchResultSummary.title = failures.map((item) => `${item.fileName}: ${item.reason ?? "Failed"}`).join("\n");
    elements.automationBatchResultList.replaceChildren();
    summary.items.forEach((item) => {
      const row = input.documentRef.createElement("div");
      row.className = "automation-batch-result-row";
      row.dataset.state = item.state;
      const file = input.documentRef.createElement("span");
      file.textContent = item.fileName;
      file.title = item.reason ?? "";
      const state = input.documentRef.createElement("span");
      state.className = "automation-result-state";
      const score = item.score == null ? "" : ` ${(item.score * 100).toFixed(1)}%`;
      const minimum = item.minimumMatchedScore == null ? "" : `-${(item.minimumMatchedScore * 100).toFixed(1)}%`;
      const matches = item.matchCount == null ? "" : ` | ${item.matchCount} match${item.matchCount === 1 ? "" : "es"}`;
      const duration = item.durationMs == null ? "" : ` | ${item.durationMs.toFixed(0)} ms`;
      state.textContent = `${item.state}${score}${minimum}${matches}${duration}`;
      state.title = item.durationMs == null
        ? item.reason ?? ""
        : `Decode ${(item.decodeMs ?? 0).toFixed(1)} ms | ImageData ${(item.imageDataMs ?? 0).toFixed(1)} ms | Worker ${(item.workerMs ?? 0).toFixed(1)} ms | Save ${(item.saveMs ?? 0).toFixed(1)} ms`;
      row.append(file, state);
      elements.automationBatchResultList.appendChild(row);
    });
  };

  const setBatchRunning = (running: boolean): void => {
    batchRunning = running;
    elements.runAutomationBatchBtn.disabled = running;
    elements.cancelAutomationBatchBtn.disabled = !running;
    elements.openTemplateMatchingBtn.disabled = running;
    elements.applyBoxLayoutBtn.disabled = running;
  };

  const runBatch = async (): Promise<void> => {
    if (batchRunning) {
      return;
    }
    const preset = selectedPreset();
    if (!preset) {
      throw new Error("Choose an automation preset first");
    }
    const template = library.templates.find((candidate) => candidate.id === preset.templateId);
    const layout = preset.layoutId ? library.layouts.find((candidate) => candidate.id === preset.layoutId) ?? null : null;
    if (!template || (preset.outputMode === "layout-best-match" && !layout)) {
      throw new Error("The preset references a missing template or layout");
    }
    if (preset.existingLabelsPolicy === "replace" && !input.windowRef.confirm("Replace existing Detection labels on matched images?")) {
      return;
    }
    if (input.state.session.workflow !== "detection") {
      throw new Error("Batch automation is only available in Detection mode");
    }

    const templateImageData = await pngDataUrlToImageData(template.pngDataUrl, input.documentRef);
    batchCancellationRequested = false;
    setBatchRunning(true);
    elements.automationBatchProgressGroup.hidden = false;

    try {
      const summary = await runSequentialBatch({
        files: [...input.state.session.imageFiles],
        preset,
        deps: {
          getFileName: (file) => file.name,
          isAlreadyLabeled: (file) => input.state.session.imageWorkflowStatus.get(file.name)?.detection.hasAnnotation ?? false,
          isCancellationRequested: () => batchCancellationRequested,
          onProgress: ({ fileName, summary: progressSummary }) => updateBatchUi(progressSummary, fileName),
          processFile: async (file: FileHandleLike, activePreset: AutomationPreset, policy: ExistingLabelsPolicy) => {
            const startedAt = globalThis.performance?.now() ?? Date.now();
            let decodeMs = 0;
            let imageDataMs = 0;
            let workerMs = 0;
            let saveMs = 0;
            let matchScore: number | null = null;
            let matchX: number | null = null;
            let matchY: number | null = null;
            try {
              const decodeStartedAt = globalThis.performance?.now() ?? Date.now();
              const targetImage = await input.fileSystem.decodeImageForAutomation(file);
              decodeMs = (globalThis.performance?.now() ?? Date.now()) - decodeStartedAt;
              const imageDataStartedAt = globalThis.performance?.now() ?? Date.now();
              const targetImageData = imageElementToImageData(targetImage, input.documentRef);
              imageDataMs = (globalThis.performance?.now() ?? Date.now()) - imageDataStartedAt;
              const match = await getMatchingService().match({
                target: targetImageData,
                template: templateImageData,
                preprocessing: template.preprocessing,
                matching: activePreset.matching,
                outputMode: activePreset.outputMode,
                multipleDetection: activePreset.multipleDetection
              });
              workerMs = match.timings.workerTotalMs;
              matchScore = match.score;
              matchX = match.x;
              matchY = match.y;
              if (activePreset.outputMode === "layout-best-match") {
                requireAcceptedMatch(match, activePreset.matching.minimumScore);
              } else if (match.matches.length === 0) {
                return {
                  state: "failed" as const,
                  score: match.score,
                  x: match.x,
                  y: match.y,
                  reason: `No non-overlapping matches met the minimum ${(activePreset.matching.minimumScore * 100).toFixed(1)}% (best ${(match.score * 100).toFixed(1)}%)`,
                  matchCount: 0,
                  minimumMatchedScore: null,
                  durationMs: (globalThis.performance?.now() ?? Date.now()) - startedAt,
                  decodeMs,
                  imageDataMs,
                  workerMs,
                  saveMs
                };
              }

              const imageSize = {
                width: targetImage.naturalWidth || targetImage.width,
                height: targetImage.naturalHeight || targetImage.height
              };
              const boxes = createAutomationDetectionBoxes({ preset: activePreset, layout, match, imageSize });
              if (boxes.length === 0) {
                throw new Error("Automation produced no Detection boxes");
              }
              const generatedYolo = serializeAutomationBoxes(boxes, imageSize);
              const existingYolo = policy === "append" ? await input.fileSystem.readDetectionLabels(file.name) : "";
              const yolo = mergeDetectionLabels(existingYolo, generatedYolo, policy === "append" ? "append" : "replace");
              const saveStartedAt = globalThis.performance?.now() ?? Date.now();
              await input.fileSystem.writeDetectionLabels(file.name, yolo);
              saveMs = (globalThis.performance?.now() ?? Date.now()) - saveStartedAt;
              const scores = activePreset.outputMode === "multiple-detection-boxes"
                ? match.matches.map((candidate) => candidate.score)
                : [match.score];
              return {
                state: "success" as const,
                score: match.score,
                x: match.x,
                y: match.y,
                reason: null,
                matchCount: scores.length,
                minimumMatchedScore: Math.min(...scores),
                durationMs: (globalThis.performance?.now() ?? Date.now()) - startedAt,
                decodeMs,
                imageDataMs,
                workerMs,
                saveMs
              };
            } catch (error: unknown) {
              return {
                state: "failed" as const,
                score: matchScore,
                x: matchX,
                y: matchY,
                reason: error instanceof Error ? error.message : "Automation failed",
                matchCount: 0,
                minimumMatchedScore: null,
                durationMs: (globalThis.performance?.now() ?? Date.now()) - startedAt,
                decodeMs,
                imageDataMs,
                workerMs,
                saveMs
              };
            }
          }
        }
      });
      updateBatchUi(summary);
      input.uiManager.renderImageList();
      input.uiManager.renderPreviewList();
    } finally {
      setBatchRunning(false);
    }
  };

  const testMatch = async (): Promise<void> => {
    const targetImage = input.state.session.currentImage;
    const roi = workspace.getRoi();
    if (!targetImage || !roi) {
      throw new Error("Load an image and draw a template ROI first");
    }
    const preprocessing = readPreprocessing();
    const matching = readMatching();
    const outputMode = readOutputMode();
    const multipleDetection = readMultipleDetection();
    const templateDataUrl = activeTemplateDataUrl ?? cropImageElementToPngDataUrl(targetImage, roi, input.documentRef);
    const result = await getMatchingService().match({
      target: imageElementToImageData(targetImage, input.documentRef),
      template: await pngDataUrlToImageData(templateDataUrl, input.documentRef),
      preprocessing,
      matching,
      outputMode,
      multipleDetection
    });
    lastTemplateMatchResult = result;
    elements.applyTemplateMatchBtn.disabled = outputMode === "multiple-detection-boxes"
      ? result.matches.length === 0
      : result.score < matching.minimumScore;
    workspace.setMatchResults(outputMode === "multiple-detection-boxes" ? result.matches : [result]);
    workspace.renderPreviews(preprocessing);
    const accepted = result.score >= matching.minimumScore;
    elements.templateMatchScore.textContent = outputMode === "multiple-detection-boxes"
      ? `${result.matches.length} match${result.matches.length === 1 ? "" : "es"}`
      : `${(result.score * 100).toFixed(2)}%`;
    elements.templateMatchCoordinates.textContent = result.matches.length === 0
      ? `Best ${(result.score * 100).toFixed(2)}% at X ${result.x}, Y ${result.y}`
      : `Best ${(result.score * 100).toFixed(2)}% at X ${result.x}, Y ${result.y}`;
    elements.templateMatchTimings.textContent = `OpenCV init ${result.timings.engineInitializationMs.toFixed(1)} ms | Match ${result.timings.matchingMs.toFixed(1)} ms | Worker ${result.timings.workerTotalMs.toFixed(1)} ms | Round trip ${result.timings.roundTripMs.toFixed(1)} ms${result.templateCacheHit ? " | Template cache hit" : ""}`;
    elements.templateMatchCandidates.replaceChildren();
    result.matches.slice(0, 50).forEach((candidate, index) => {
      const row = input.documentRef.createElement("div");
      row.textContent = `${index + 1}. ${(candidate.score * 100).toFixed(2)}% | X ${candidate.x}, Y ${candidate.y} | ${candidate.width} x ${candidate.height}`;
      elements.templateMatchCandidates.appendChild(row);
    });
    elements.templateMatchScore.classList.toggle("text-danger", !accepted || (outputMode === "multiple-detection-boxes" && result.matches.length === 0));
    elements.templateMatchScore.classList.toggle("text-success", accepted && (outputMode !== "multiple-detection-boxes" || result.matches.length > 0));
  };

  const applyTemplateResult = (): void => {
    const result = lastTemplateMatchResult;
    if (!result) {
      throw new Error("Test the template match before applying a result");
    }
    const outputMode = readOutputMode();
    const policy = elements.templateExistingPolicySelect.value as ExistingLabelsPolicy;
    const existingCount = input.canvasController.raw.getObjects("rect").length;
    if (policy === "skip" && existingCount > 0) {
      throw new Error("The current image already has Detection labels");
    }
    if (policy === "replace" && existingCount > 0 && !input.windowRef.confirm("Replace existing Detection labels on the current image?")) {
      return;
    }
    if (outputMode === "multiple-detection-boxes") {
      if (result.matches.length === 0) {
        throw new Error("No non-overlapping matches are available to apply");
      }
      const multiple = readMultipleDetection();
      input.canvasController.raw.applyDetectionBoxes(result.matches.map((candidate) => ({
        classId: multiple.classId,
        x: candidate.x,
        y: candidate.y,
        width: candidate.width,
        height: candidate.height
      })), { replaceExisting: policy === "replace" });
    } else {
      requireAcceptedMatch(result, readMatching().minimumScore);
      const layout = library.layouts.find((candidate) => candidate.id === elements.templateLayoutSelect.value);
      if (!layout) {
        throw new Error("Choose a box layout for this result");
      }
      const temporaryPreset: AutomationPreset = {
        schemaVersion: AUTOMATION_SCHEMA_VERSION,
        id: "preview",
        name: "preview",
        templateId: "preview",
        layoutId: layout.id,
        outputMode,
        relationOffset: {
          x: readFinite(elements.templateRelationXInput, "Relation X"),
          y: readFinite(elements.templateRelationYInput, "Relation Y")
        },
        manualOffset: {
          x: readFinite(elements.templateManualXInput, "Manual X"),
          y: readFinite(elements.templateManualYInput, "Manual Y")
        },
        matching: readMatching(),
        multipleDetection: readMultipleDetection(),
        existingLabelsPolicy: policy,
        createdAt: "",
        updatedAt: ""
      };
      input.canvasController.raw.applyBoxLayout(layout, calculateLayoutAnchor(result, temporaryPreset), {
        replaceExisting: policy === "replace"
      });
    }
    input.windowRef.dispatchEvent(new Event("easy-labeling:history-change"));
    input.uiManager.notify("Template match result applied.");
  };

  const savePreset = async (): Promise<void> => {
    const targetImage = input.state.session.currentImage;
    const currentFile = input.state.session.currentImageFile;
    const roi = workspace.getRoi();
    const layout = library.layouts.find((candidate) => candidate.id === elements.templateLayoutSelect.value);
    const outputMode = readOutputMode();
    const name = elements.templateNameInput.value.trim();
    if (!targetImage || !currentFile || !roi) {
      throw new Error("Load a representative image and draw a template ROI");
    }
    if (outputMode === "layout-best-match" && !layout) {
      throw new Error("Choose a box layout for this preset");
    }
    if (!name) {
      throw new Error("Preset name is required");
    }

    const preprocessing = readPreprocessing();
    const matching = readMatching();
    const multipleDetection = readMultipleDetection();
    const existingPreset = activePresetId ? library.presets.find((preset) => preset.id === activePresetId) : null;
    const existingTemplate = existingPreset
      ? library.templates.find((template) => template.id === existingPreset.templateId)
      : null;
    const now = new Date().toISOString();
    const templateId = existingTemplate?.id ?? createId("template");
    const template: TemplateAsset = {
      schemaVersion: TEMPLATE_SCHEMA_VERSION,
      id: templateId,
      name,
      sourceImageName: templateRoiDirty || !existingTemplate ? currentFile.name : existingTemplate.sourceImageName,
      sourceImageSize: templateRoiDirty || !existingTemplate
        ? { width: targetImage.naturalWidth || targetImage.width, height: targetImage.naturalHeight || targetImage.height }
        : existingTemplate.sourceImageSize,
      roi,
      pngDataUrl: activeTemplateDataUrl ?? cropImageElementToPngDataUrl(targetImage, roi, input.documentRef),
      preprocessing,
      createdAt: existingTemplate?.createdAt ?? now,
      updatedAt: now
    };
    const preset: AutomationPreset = {
      schemaVersion: AUTOMATION_SCHEMA_VERSION,
      id: existingPreset?.id ?? createId("preset"),
      name,
      templateId,
      layoutId: outputMode === "layout-best-match" ? layout?.id ?? null : null,
      outputMode,
      relationOffset: {
        x: readFinite(elements.templateRelationXInput, "Relation X"),
        y: readFinite(elements.templateRelationYInput, "Relation Y")
      },
      manualOffset: {
        x: readFinite(elements.templateManualXInput, "Manual X"),
        y: readFinite(elements.templateManualYInput, "Manual Y")
      },
      matching,
      multipleDetection,
      existingLabelsPolicy: elements.templateExistingPolicySelect.value as ExistingLabelsPolicy,
      createdAt: existingPreset?.createdAt ?? now,
      updatedAt: now
    };

    library = {
      ...library,
      templates: upsertById(library.templates, template),
      presets: upsertById(library.presets, preset)
    };
    await persistLibrary();
    activePresetId = preset.id;
    activeTemplateDataUrl = template.pngDataUrl;
    templateRoiDirty = false;
    refreshSelects({ layoutId: layout?.id ?? elements.boxLayoutSelect.value, presetId: preset.id });
    input.uiManager.notify("Automation preset saved.");
  };

  return {
    bind(): void {
      workspace.bind();
      refreshSelects();
      warmUpMatchingEngineInBackground();

      elements.saveBoxLayoutBtn.addEventListener("click", () => {
        void (async () => {
          try {
            const layout = input.canvasController.raw.captureBoxLayout(
              elements.layoutNameInput.value,
              input.state.session.currentImageFile?.name ?? "",
              elements.layoutCaptureScopeSelect.value === "all" ? "all" : "selected"
            );
            library = { ...library, layouts: upsertById(library.layouts, layout) };
            await persistLibrary();
            refreshSelects({ layoutId: layout.id });
            elements.layoutSetupSelect.value = layout.id;
            elements.boxLayoutSelect.value = layout.id;
            renderLayoutPreview();
            setLayoutSetupError(null);
            input.uiManager.notify("Box layout saved.");
          } catch (error: unknown) {
            setLayoutSetupError(error);
            input.uiManager.notify(error instanceof Error ? error.message : "Unable to save box layout", 5000);
          }
        })();
      });

      elements.renameBoxLayoutBtn.addEventListener("click", () => {
        void (async () => {
          const layout = selectedSetupLayout();
          if (!layout) {
            input.uiManager.notify("Choose a layout to rename.");
            return;
          }
          const name = (elements.layoutNameInput.value.trim() || input.windowRef.prompt("Layout name:", layout.name)?.trim()) ?? "";
          if (!name) {
            return;
          }
          library = {
            ...library,
            layouts: upsertById(library.layouts, { ...layout, name, updatedAt: new Date().toISOString() })
          };
          await persistLibrary();
          refreshSelects({ layoutId: layout.id });
          renderLayoutPreview();
        })().catch((error: unknown) => input.uiManager.notify(error instanceof Error ? error.message : "Unable to rename layout"));
      });

      elements.duplicateBoxLayoutBtn.addEventListener("click", () => {
        void (async () => {
          const layout = selectedSetupLayout();
          if (!layout) {
            throw new Error("Choose a layout to duplicate");
          }
          const now = new Date().toISOString();
          const duplicate: BoxLayout = {
            ...layout,
            id: createId("layout"),
            name: `${layout.name} Copy`,
            boxes: layout.boxes.map((box) => ({ ...box, id: createId("layout-box") })),
            createdAt: now,
            updatedAt: now
          };
          library = { ...library, layouts: [...library.layouts, duplicate] };
          await persistLibrary();
          refreshSelects({ layoutId: duplicate.id });
          elements.layoutSetupSelect.value = duplicate.id;
          elements.layoutNameInput.value = duplicate.name;
          renderLayoutPreview();
        })().catch((error: unknown) => {
          setLayoutSetupError(error);
          input.uiManager.notify(error instanceof Error ? error.message : "Unable to duplicate layout");
        });
      });

      elements.deleteBoxLayoutBtn.addEventListener("click", () => {
        void (async () => {
          const layout = selectedSetupLayout();
          if (!layout || !input.windowRef.confirm(`Delete layout "${layout.name}" and its presets?`)) {
            return;
          }
          library = deleteLayoutFromLibrary(library, layout.id);
          await persistLibrary();
          refreshSelects();
          elements.layoutNameInput.value = "";
          renderLayoutPreview();
        })().catch((error: unknown) => input.uiManager.notify(error instanceof Error ? error.message : "Unable to delete layout"));
      });

      elements.applyBoxLayoutBtn.addEventListener("click", () => {
        try {
          const layout = selectedLayout();
          if (!layout) {
            throw new Error("Choose a box layout first");
          }
          applyLayout(layout);
        } catch (error: unknown) {
          input.uiManager.notify(error instanceof Error ? error.message : "Unable to apply box layout", 5000);
        }
      });

      elements.applyBoxLayoutFromSetupBtn.addEventListener("click", () => {
        try {
          const layout = selectedSetupLayout();
          if (!layout) {
            throw new Error("Choose a box layout first");
          }
          applyLayout(layout);
        } catch (error: unknown) {
          setLayoutSetupError(error);
          input.uiManager.notify(error instanceof Error ? error.message : "Unable to apply box layout", 5000);
        }
      });

      elements.moveSelectedBoxesBtn.addEventListener("click", () => {
        try {
          input.canvasController.raw.translateSelectedBoxes({
            x: readFinite(elements.selectionMoveXInput, "Selection X"),
            y: readFinite(elements.selectionMoveYInput, "Selection Y")
          });
          input.windowRef.dispatchEvent(new Event("easy-labeling:history-change"));
        } catch (error: unknown) {
          input.uiManager.notify(error instanceof Error ? error.message : "Unable to move selection", 5000);
        }
      });

      elements.openLayoutSetupBtn.addEventListener("click", () => {
        try {
          if (!input.state.session.currentImage) {
            throw new Error("Load an image before opening Layout Setup");
          }
          const layoutId = elements.boxLayoutSelect.value || library.layouts[0]?.id || "";
          refreshSelects({ layoutId });
          elements.layoutSetupSelect.value = layoutId;
          elements.layoutSetupSourceName.textContent = input.state.session.currentImageFile?.name ?? "Current image";
          elements.layoutNameInput.value = selectedSetupLayout()?.name ?? "";
          setLayoutSetupError(null);
          renderLayoutPreview();
          elements.layoutSetupModal.show();
        } catch (error: unknown) {
          input.uiManager.notify(error instanceof Error ? error.message : "Unable to open layout setup", 5000);
        }
      });

      elements.layoutSetupSelect.addEventListener("change", () => {
        elements.boxLayoutSelect.value = elements.layoutSetupSelect.value;
        elements.templateLayoutSelect.value = elements.layoutSetupSelect.value;
        const layout = selectedSetupLayout();
        elements.layoutNameInput.value = layout?.name ?? "";
        setLayoutSetupError(null);
        renderLayoutPreview();
      });
      elements.boxLayoutSelect.addEventListener("change", () => {
        elements.layoutSetupSelect.value = elements.boxLayoutSelect.value;
        elements.applyBoxLayoutBtn.disabled = !selectedLayout();
      });
      elements.previewBoxLayoutBtn.addEventListener("click", () => {
        try {
          renderLayoutPreview();
          setLayoutSetupError(null);
        } catch (error: unknown) {
          setLayoutSetupError(error);
        }
      });

      elements.openTemplateMatchingBtn.addEventListener("click", () => {
        void (async () => {
          if (!input.state.session.currentImage) {
            throw new Error("Load an image before opening Template Matching Setup");
          }
          elements.templateMatchingSourceName.textContent = input.state.session.currentImageFile?.name ?? "Current image";
          refreshSelects();
          refreshSourceImageSelect();
          const preset = selectedPreset();
          if (preset) {
            await loadPresetForm(preset);
          } else {
            resetPresetForm();
          }
          elements.templateMatchingModal.show();
          elements.templateMatchTimings.textContent = "Loading OpenCV engine...";
          const warmup = await getMatchingService().warmUp();
          elements.templateMatchTimings.textContent = `OpenCV initialized in ${warmup.engineInitializationMs.toFixed(1)} ms`;
        })().catch((error: unknown) => input.uiManager.notify(error instanceof Error ? error.message : "Unable to open template setup", 5000));
      });

      elements.newAutomationPresetBtn.addEventListener("click", resetPresetForm);
      elements.templateSourceImageSelect.addEventListener("change", () => {
        void (async () => {
          const file = input.state.session.imageFiles.find((candidate) => candidate.name === elements.templateSourceImageSelect.value);
          if (!file) {
            throw new Error("The selected reference image is unavailable");
          }
          await input.fileSystem.loadImage(file);
          const image = input.state.session.currentImage;
          if (!image) {
            throw new Error("Unable to decode the selected reference image");
          }
          activePresetId = null;
          activeTemplateDataUrl = null;
          templateRoiDirty = false;
          elements.templateMatchingSourceName.textContent = file.name;
          elements.templateMatchScore.textContent = "Not tested";
          elements.templateMatchCoordinates.textContent = "";
          elements.templateMatchTimings.textContent = "";
          elements.templateMatchCandidates.replaceChildren();
          invalidateTemplateMatch();
          workspace.setImage(image);
          workspace.renderPreviews(readPreprocessing());
          clearSettingsError();
        })().catch(showSettingsError);
      });
      elements.deleteAutomationPresetBtn.addEventListener("click", () => {
        void (async () => {
          const preset = activePresetId ? library.presets.find((candidate) => candidate.id === activePresetId) : null;
          if (!preset || !input.windowRef.confirm(`Delete preset "${preset.name}"?`)) {
            return;
          }
          const templateStillUsed = library.presets.some((candidate) => candidate.id !== preset.id && candidate.templateId === preset.templateId);
          library = {
            ...library,
            presets: library.presets.filter((candidate) => candidate.id !== preset.id),
            templates: templateStillUsed ? library.templates : library.templates.filter((template) => template.id !== preset.templateId)
          };
          await persistLibrary();
          refreshSelects();
          resetPresetForm();
        })().catch(showSettingsError);
      });

      elements.templateSearchRoiToggle.addEventListener("change", () => {
        elements.templateSearchRoiInputs.hidden = !elements.templateSearchRoiToggle.checked;
      });
      elements.templateOutputLayoutRadio.addEventListener("change", () => {
        syncOutputModeUi();
        invalidateTemplateMatch();
      });
      elements.templateOutputMultipleRadio.addEventListener("change", () => {
        syncOutputModeUi();
        invalidateTemplateMatch();
      });
      const previewInputs: HTMLElement[] = [
        elements.templateGrayscaleToggle,
        elements.templateBlurToggle,
        elements.templateBlurKernelInput,
        elements.templateBlurSigmaInput,
        elements.templateNoiseToggle,
        elements.templateNoiseSigmaInput,
        elements.templateNoiseSeedInput
      ];
      previewInputs.forEach((element) => element.addEventListener("input", () => {
        try {
          invalidateTemplateMatch();
          workspace.renderPreviews(readPreprocessing());
          clearSettingsError();
        } catch (error: unknown) {
          showSettingsError(error);
        }
      }));

      elements.testTemplateMatchBtn.addEventListener("click", () => {
        clearSettingsError();
        elements.testTemplateMatchBtn.disabled = true;
        void testMatch().catch(showSettingsError).finally(() => {
          elements.testTemplateMatchBtn.disabled = false;
        });
      });
      const matchingInputs: HTMLElement[] = [
        elements.templateMatchingAccurateRadio,
        elements.templateMatchingFastRadio,
        elements.templateMinimumScoreInput,
        elements.templateSearchRoiToggle,
        elements.templateSearchXInput,
        elements.templateSearchYInput,
        elements.templateSearchWidthInput,
        elements.templateSearchHeightInput,
        elements.templateMultipleClassIdInput,
        elements.templateMaximumDetectionsInput,
        elements.templateStrictNonOverlapToggle,
        elements.templateNmsIouInput,
        elements.templatePaddingXInput,
        elements.templatePaddingYInput,
        elements.templateLayoutSelect,
        elements.templateRelationXInput,
        elements.templateRelationYInput,
        elements.templateManualXInput,
        elements.templateManualYInput
      ];
      matchingInputs.forEach((element) => {
        element.addEventListener("input", invalidateTemplateMatch);
        element.addEventListener("change", invalidateTemplateMatch);
      });
      elements.applyTemplateMatchBtn.addEventListener("click", () => {
        try {
          applyTemplateResult();
        } catch (error: unknown) {
          showSettingsError(error);
        }
      });
      elements.saveAutomationPresetBtn.addEventListener("click", () => {
        clearSettingsError();
        void savePreset().catch(showSettingsError);
      });

      elements.automationPresetSelect.addEventListener("change", () => {
        activePresetId = elements.automationPresetSelect.value || null;
      });
      elements.runAutomationBatchBtn.addEventListener("click", () => {
        void runBatch().catch((error: unknown) => input.uiManager.notify(error instanceof Error ? error.message : "Batch automation failed", 7000));
      });
      elements.cancelAutomationBatchBtn.addEventListener("click", () => {
        batchCancellationRequested = true;
        elements.automationBatchCurrentFile.textContent = "Cancelling after current image...";
      });

      elements.exportAutomationLibraryBtn.addEventListener("click", () => {
        try {
          const layout = selectedSetupLayout();
          if (!layout) {
            throw new Error("Choose a layout to export");
          }
          const blob = new Blob([`${JSON.stringify(layout, null, 2)}\n`], { type: "application/json" });
          const url = input.windowRef.URL.createObjectURL(blob);
          const anchor = input.documentRef.createElement("a");
          anchor.href = url;
          anchor.download = `${layout.name.replace(/[^a-z0-9_-]+/gi, "-") || "box-layout"}.json`;
          anchor.click();
          input.windowRef.URL.revokeObjectURL(url);
        } catch (error: unknown) {
          input.uiManager.notify(error instanceof Error ? error.message : "Unable to export box layout");
        }
      });
      elements.importAutomationLibraryBtn.addEventListener("click", () => elements.importAutomationLibraryInput.click());
      elements.importAutomationLibraryInput.addEventListener("change", () => {
        void (async () => {
          const file = elements.importAutomationLibraryInput.files?.[0];
          if (!file) {
            return;
          }
          const parsed: unknown = JSON.parse(await file.text());
          if (!parsed || typeof parsed !== "object") {
            throw new Error("Layout JSON must be an object");
          }
          const layout = parsed as BoxLayout;
          validateBoxLayout(layout);
          library = { ...library, layouts: upsertById(library.layouts, layout) };
          await persistLibrary();
          refreshSelects({ layoutId: layout.id });
          elements.layoutSetupSelect.value = layout.id;
          elements.layoutNameInput.value = layout.name;
          renderLayoutPreview();
          input.uiManager.notify("Box layout imported.");
          elements.importAutomationLibraryInput.value = "";
        })().catch((error: unknown) => {
          setLayoutSetupError(error);
          input.uiManager.notify(error instanceof Error ? error.message : "Unable to import box layout", 6000);
        });
      });
    },

    async refreshLibrary(options = {}): Promise<void> {
      const folder = input.state.session.imageFolderHandle;
      library = folder ? await loadAutomationLibrary(folder as unknown as DirectoryHandleLike) : createEmptyAutomationLibrary();
      if (options.selectFirst) {
        const layoutId = library.layouts[0]?.id ?? "";
        const presetId = library.presets[0]?.id ?? "";
        activePresetId = presetId || null;
        refreshSelects({ layoutId, presetId });
        return;
      }
      refreshSelects();
    }
  };
}
