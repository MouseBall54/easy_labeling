import type { AppState } from "../app/state.js";
import { isOperationCancelledError, throwIfOperationCancelled } from "../app/operation.js";
import { runSequentialBatch, type BatchSummary } from "../features/automation/batch.js";
import {
  createAutomationDetectionBoxes,
  mergeDetectionLabels,
  serializeAutomationBoxes
} from "../features/automation/batch-labels.js";
import { imageElementToImageData, pngDataUrlToImageData } from "../features/automation/image-data.js";
import { requireAcceptedMatch, type TemplateMatchInput } from "../features/automation/template-matching-service.js";
import type {
  AutomationLibraryDocument,
  AutomationPreset,
  ExistingLabelsPolicy,
  TemplateMatchResult
} from "../features/automation/types.js";
import type { FileHandleLike } from "../types/files.js";
import type { UiDomElements } from "../ui/dom-elements.js";
import type { RuntimeFileSystem } from "./file-system-adapter.js";
import type { RuntimeOperationHandle, RuntimeUiManager } from "./ui-manager-adapter.js";

export interface AutomationBatchController {
  bind(): void;
  hidePreflight(): void;
}

export function createAutomationBatchController(input: {
  state: AppState;
  elements: UiDomElements;
  documentRef: Document;
  fileSystem: RuntimeFileSystem;
  uiManager: RuntimeUiManager;
  getSelectedPreset(): AutomationPreset | null;
  getLibrary(): AutomationLibraryDocument;
  match(matchInput: TemplateMatchInput): Promise<TemplateMatchResult>;
  cancelActiveMatch(): void;
  setRelatedControlsDisabled(running: boolean): void;
}): AutomationBatchController {
  let cancellationRequested = false;
  let running = false;
  let activeOperation: RuntimeOperationHandle | null = null;
  let lastFailedFileNames = new Set<string>();

  const setBatchStage = (
    fileName: string,
    message: string,
    state: "running" | "complete" | "error" = "running"
  ): void => {
    const elements = input.elements;
    elements.automationBatchCurrentFile.textContent = fileName;
    elements.automationBatchCurrentFile.title = fileName;
    elements.automationBatchProgressGroup.dataset.state = state;
    const messageElement = elements.automationBatchStage.querySelector<HTMLElement>("span:last-child");
    if (messageElement) {
      messageElement.textContent = message;
    } else {
      elements.automationBatchStage.textContent = message;
    }
    activeOperation?.update({ detail: `${fileName} · ${message}` });
  };

  const yieldToUi = (): Promise<void> => new Promise((resolve) => {
    globalThis.setTimeout(resolve, 0);
  });

  const updateUi = (summary: BatchSummary, currentFile = "Complete", dryRun = false): void => {
    const elements = input.elements;
    elements.automationBatchProgressGroup.hidden = false;
    setBatchStage(
      currentFile,
      currentFile === "Complete"
        ? summary.cancelled ? "Cancelled after current image" : "Batch complete"
        : "Image complete",
      currentFile === "Complete" ? "complete" : "running"
    );
    elements.automationBatchCounts.textContent = `${summary.processed} / ${summary.total}`;
    activeOperation?.update({
      detail: currentFile === "Complete"
        ? summary.cancelled ? "Batch stopped" : "Batch complete"
        : `${currentFile} · Image complete`,
      current: summary.processed,
      total: summary.total
    });
    const percent = summary.total === 0 ? 0 : Math.round((summary.processed / summary.total) * 100);
    elements.automationBatchProgressBar.style.width = `${percent}%`;
    elements.automationBatchProgressBar.textContent = percent >= 15 ? `${percent}%` : "";
    const failures = summary.items.filter((item) => item.state === "failed");
    const suffix = summary.cancelled ? " | Cancelled" : "";
    elements.automationBatchResultSummary.textContent = `${dryRun ? "Dry run | " : ""}Success ${summary.success} | Failed ${summary.failed} | Skipped ${summary.skipped}${suffix}`;
    elements.automationBatchResultSummary.title = failures.map((item) => `${item.fileName}: ${item.reason ?? "Failed"}`).join("\n");
    elements.automationBatchResultList.replaceChildren();
    summary.items.forEach((item) => {
      const row = input.documentRef.createElement("div");
      row.className = "automation-batch-result-row";
      row.dataset.state = item.state;
      const heading = input.documentRef.createElement("div");
      heading.className = "automation-result-heading";
      const file = input.documentRef.createElement("span");
      file.className = "automation-result-file";
      file.textContent = item.fileName;
      file.title = item.reason ?? "";
      const state = input.documentRef.createElement("span");
      state.className = "automation-result-state";
      state.textContent = item.state;
      state.title = item.durationMs == null
        ? item.reason ?? ""
        : `Decode ${(item.decodeMs ?? 0).toFixed(1)} ms | ImageData ${(item.imageDataMs ?? 0).toFixed(1)} ms | Worker ${(item.workerMs ?? 0).toFixed(1)} ms | Save ${(item.saveMs ?? 0).toFixed(1)} ms`;
      heading.append(file, state);
      const details = input.documentRef.createElement("div");
      details.className = "automation-result-details";
      const detailParts = [
        item.score == null ? null : `Best ${(item.score * 100).toFixed(1)}%`,
        item.minimumMatchedScore == null ? null : `Lowest ${(item.minimumMatchedScore * 100).toFixed(1)}%`,
        item.matchCount == null ? null : `${item.matchCount} match${item.matchCount === 1 ? "" : "es"}`,
        item.discardedOutOfBoundsCount ? `${item.discardedOutOfBoundsCount} outside removed` : null,
        item.durationMs == null ? null : `${item.durationMs.toFixed(0)} ms`,
        item.reason
      ].filter((part): part is string => Boolean(part));
      details.textContent = detailParts.join(" · ") || "No additional details";
      row.append(heading, details);
      elements.automationBatchResultList.appendChild(row);
    });
    if (currentFile === "Complete") {
      lastFailedFileNames = new Set(failures.map((item) => item.fileName));
      elements.retryFailedBatchBtn.hidden = failures.length === 0 || dryRun;
      elements.retryFailedBatchBtn.textContent = failures.length === 1
        ? "Retry 1 failed image"
        : `Retry ${failures.length} failed images`;
    }
  };

  const setRunning = (nextRunning: boolean): void => {
    running = nextRunning;
    input.elements.runAutomationBatchBtn.disabled = nextRunning;
    input.elements.cancelAutomationBatchBtn.disabled = !nextRunning;
    input.elements.confirmAutomationBatchBtn.disabled = nextRunning;
    input.elements.retryFailedBatchBtn.disabled = nextRunning;
    input.setRelatedControlsDisabled(nextRunning);
  };

  const run = async (options: { files?: FileHandleLike[]; dryRun?: boolean } = {}): Promise<void> => {
    if (running) {
      return;
    }
    const preset = input.getSelectedPreset();
    if (!preset) {
      throw new Error("Choose an automation preset first");
    }
    const library = input.getLibrary();
    const template = library.templates.find((candidate) => candidate.id === preset.templateId);
    const layout = preset.layoutId ? library.layouts.find((candidate) => candidate.id === preset.layoutId) ?? null : null;
    if (!template || (preset.outputMode === "layout-best-match" && !layout)) {
      throw new Error("The preset references a missing template or layout");
    }
    if (input.state.session.workflow !== "detection") {
      throw new Error("Batch automation is only available in Detection mode");
    }

    const dryRun = options.dryRun ?? false;
    const files = options.files ?? [...input.state.session.imageFiles];
    cancellationRequested = false;
    setRunning(true);
    activeOperation = input.uiManager.beginOperation({
      title: dryRun ? "Checking automation batch" : "Running automation batch",
      detail: "Decoding template image",
      current: 0,
      total: files.length,
      cancellable: true
    });
    const requestCancellation = (): void => {
      cancellationRequested = true;
      input.cancelActiveMatch();
      setBatchStage(
        input.elements.automationBatchCurrentFile.textContent || "Current image",
        "Stopping current operation..."
      );
    };
    activeOperation.signal.addEventListener("abort", requestCancellation, { once: true });
    input.elements.automationBatchProgressGroup.hidden = false;
    input.elements.automationBatchCounts.textContent = `0 / ${files.length}`;
    input.elements.automationBatchProgressBar.style.width = "0%";
    input.elements.automationBatchProgressBar.textContent = "";
    input.elements.automationBatchResultSummary.textContent = dryRun ? "Preparing dry run..." : "Preparing batch...";
    setBatchStage("Preparing batch", "Decoding template image");

    try {
      await yieldToUi();
      const templateImageData = await pngDataUrlToImageData(template.pngDataUrl, input.documentRef);
      throwIfOperationCancelled(activeOperation.signal);
      const summary = await runSequentialBatch({
        files,
        preset,
        deps: {
          getFileName: (file) => file.name,
          isAlreadyLabeled: (file) => input.state.session.imageWorkflowStatus.get(file.name)?.detection.hasAnnotation ?? false,
          isCancellationRequested: () => cancellationRequested,
          onProgress: ({ fileName, summary: progressSummary }) => updateUi(progressSummary, fileName, dryRun),
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
              setBatchStage(file.name, "Decoding image");
              await yieldToUi();
              const decodeStartedAt = globalThis.performance?.now() ?? Date.now();
              const targetImage = await input.fileSystem.decodeImageForAutomation(file);
              throwIfOperationCancelled(activeOperation?.signal);
              decodeMs = (globalThis.performance?.now() ?? Date.now()) - decodeStartedAt;
              setBatchStage(file.name, "Preparing image pixels");
              await yieldToUi();
              const imageDataStartedAt = globalThis.performance?.now() ?? Date.now();
              const targetImageData = imageElementToImageData(targetImage, input.documentRef);
              throwIfOperationCancelled(activeOperation?.signal);
              imageDataMs = (globalThis.performance?.now() ?? Date.now()) - imageDataStartedAt;
              setBatchStage(file.name, "Matching template");
              const match = await input.match({
                target: targetImageData,
                template: templateImageData,
                preprocessing: template.preprocessing,
                matching: activePreset.matching,
                outputMode: activePreset.outputMode,
                multipleDetection: activePreset.multipleDetection
              });
              throwIfOperationCancelled(activeOperation?.signal);
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

              setBatchStage(file.name, "Generating detection labels");
              await yieldToUi();
              const imageSize = {
                width: targetImage.naturalWidth || targetImage.width,
                height: targetImage.naturalHeight || targetImage.height
              };
              const boxes = createAutomationDetectionBoxes({ preset: activePreset, layout, match, imageSize });
              throwIfOperationCancelled(activeOperation?.signal);
              const sourceBoxCount = activePreset.outputMode === "layout-best-match"
                ? layout?.boxes.length ?? 0
                : match.matches.length;
              const discardedOutOfBoundsCount = sourceBoxCount - boxes.length;
              const generatedYolo = serializeAutomationBoxes(boxes, imageSize);
              const existingYolo = policy === "append" ? await input.fileSystem.readDetectionLabels(file.name) : "";
              const yolo = mergeDetectionLabels(existingYolo, generatedYolo, policy === "append" ? "append" : "replace");
              if (!dryRun) {
                setBatchStage(file.name, "Saving labels");
                const saveStartedAt = globalThis.performance?.now() ?? Date.now();
                await input.fileSystem.writeDetectionLabels(file.name, yolo);
                throwIfOperationCancelled(activeOperation?.signal);
                saveMs = (globalThis.performance?.now() ?? Date.now()) - saveStartedAt;
              } else {
                setBatchStage(file.name, "Checking dry-run result");
              }
              const scores = activePreset.outputMode === "multiple-detection-boxes"
                ? match.matches.map((candidate) => candidate.score)
                : [match.score];
              return {
                state: "success" as const,
                score: match.score,
                x: match.x,
                y: match.y,
                reason: discardedOutOfBoundsCount > 0
                  ? `${discardedOutOfBoundsCount} generated box${discardedOutOfBoundsCount === 1 ? " was" : "es were"} outside the image and removed before saving`
                  : null,
                matchCount: scores.length,
                minimumMatchedScore: Math.min(...scores),
                discardedOutOfBoundsCount,
                durationMs: (globalThis.performance?.now() ?? Date.now()) - startedAt,
                decodeMs,
                imageDataMs,
                workerMs,
                saveMs
              };
            } catch (error: unknown) {
              if (cancellationRequested || isOperationCancelledError(error)) {
                throw error;
              }
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
      updateUi(summary, "Complete", dryRun);
      input.uiManager.renderImageList();
      input.uiManager.renderPreviewList();
    } catch (error: unknown) {
      if (cancellationRequested || isOperationCancelledError(error)) {
        setBatchStage(
          input.elements.automationBatchCurrentFile.textContent || "Batch stopped",
          "Batch stopped",
          "complete"
        );
        input.elements.automationBatchResultSummary.textContent = "Cancelled by user";
        return;
      }
      setBatchStage(
        input.elements.automationBatchCurrentFile.textContent || "Batch stopped",
        error instanceof Error ? error.message : "Batch automation failed",
        "error"
      );
      throw error;
    } finally {
      activeOperation.signal.removeEventListener("abort", requestCancellation);
      activeOperation.finish();
      activeOperation = null;
      setRunning(false);
    }
  };

  const showPreflight = (): void => {
    const preset = input.getSelectedPreset();
    if (!preset) {
      throw new Error("Choose an automation preset first");
    }
    const total = input.state.session.imageFiles.length;
    const labeled = input.state.session.imageFiles.filter((file) => {
      return input.state.session.imageWorkflowStatus.get(file.name)?.detection.hasAnnotation ?? false;
    }).length;
    const policyLabels: Record<ExistingLabelsPolicy, string> = {
      skip: `Skip ${labeled} labeled image${labeled === 1 ? "" : "s"}`,
      append: "Append generated boxes",
      replace: "Replace existing Detection labels"
    };
    input.elements.batchPreflightTargets.textContent = `${total} image${total === 1 ? "" : "s"}`;
    input.elements.batchPreflightPolicy.textContent = policyLabels[preset.existingLabelsPolicy];
    input.elements.batchDryRunToggle.checked = false;
    input.elements.automationBatchPreflight.hidden = false;
    input.elements.confirmAutomationBatchBtn.focus();
  };

  return {
    bind(): void {
      input.elements.runAutomationBatchBtn.addEventListener("click", () => {
        try {
          showPreflight();
        } catch (error: unknown) {
          input.uiManager.notify(error instanceof Error ? error.message : "Unable to prepare batch", 5000);
        }
      });
      input.elements.closeAutomationPreflightBtn.addEventListener("click", () => {
        input.elements.automationBatchPreflight.hidden = true;
      });
      input.elements.confirmAutomationBatchBtn.addEventListener("click", () => {
        input.elements.automationBatchPreflight.hidden = true;
        void run({ dryRun: input.elements.batchDryRunToggle.checked }).catch((error: unknown) => {
          input.uiManager.notify(error instanceof Error ? error.message : "Batch automation failed", 7000);
        });
      });
      input.elements.retryFailedBatchBtn.addEventListener("click", () => {
        const files = input.state.session.imageFiles.filter((file) => lastFailedFileNames.has(file.name));
        if (files.length === 0) {
          return;
        }
        void run({ files }).catch((error: unknown) => {
          input.uiManager.notify(error instanceof Error ? error.message : "Retry failed", 7000);
        });
      });
      input.elements.cancelAutomationBatchBtn.addEventListener("click", () => {
        activeOperation?.cancel();
      });
    },

    hidePreflight(): void {
      input.elements.automationBatchPreflight.hidden = true;
    }
  };
}
