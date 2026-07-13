import type { AutomationPreset, ExistingLabelsPolicy } from "./types.js";

export type BatchItemState = "success" | "failed" | "skipped";

export interface BatchProcessOutcome {
  state: BatchItemState;
  score: number | null;
  x: number | null;
  y: number | null;
  reason: string | null;
  matchCount?: number;
  minimumMatchedScore?: number | null;
  discardedOutOfBoundsCount?: number;
  durationMs?: number;
  decodeMs?: number;
  imageDataMs?: number;
  workerMs?: number;
  saveMs?: number;
}

export interface BatchItemResult extends BatchProcessOutcome {
  fileName: string;
}

export interface BatchSummary {
  total: number;
  processed: number;
  success: number;
  failed: number;
  skipped: number;
  cancelled: boolean;
  items: BatchItemResult[];
}

export interface BatchProgress {
  currentIndex: number;
  total: number;
  fileName: string;
  summary: BatchSummary;
}

export interface SequentialBatchDeps<TFile> {
  getFileName(file: TFile): string;
  isAlreadyLabeled(file: TFile): boolean;
  processFile(file: TFile, preset: AutomationPreset, policy: ExistingLabelsPolicy): Promise<BatchProcessOutcome>;
  isCancellationRequested(): boolean;
  onProgress?(progress: BatchProgress): void;
}

function createSummary(total: number): BatchSummary {
  return {
    total,
    processed: 0,
    success: 0,
    failed: 0,
    skipped: 0,
    cancelled: false,
    items: []
  };
}

function appendResult(summary: BatchSummary, result: BatchItemResult): void {
  summary.items.push(result);
  summary.processed += 1;
  summary[result.state] += 1;
}

export async function runSequentialBatch<TFile>(input: {
  files: readonly TFile[];
  preset: AutomationPreset;
  deps: SequentialBatchDeps<TFile>;
}): Promise<BatchSummary> {
  const summary = createSummary(input.files.length);

  for (let index = 0; index < input.files.length; index += 1) {
    if (input.deps.isCancellationRequested()) {
      summary.cancelled = true;
      break;
    }

    const file = input.files[index];
    if (!file) {
      continue;
    }
    const fileName = input.deps.getFileName(file);
    let outcome: BatchProcessOutcome;

    if (input.preset.existingLabelsPolicy === "skip" && input.deps.isAlreadyLabeled(file)) {
      outcome = { state: "skipped", score: null, x: null, y: null, reason: "Already labeled", matchCount: 0 };
    } else {
      try {
        outcome = await input.deps.processFile(file, input.preset, input.preset.existingLabelsPolicy);
      } catch (error: unknown) {
        outcome = {
          state: "failed",
          score: null,
          x: null,
          y: null,
          reason: error instanceof Error ? error.message : "Unknown batch processing error"
        };
      }
    }

    appendResult(summary, { fileName, ...outcome });
    input.deps.onProgress?.({
      currentIndex: index,
      total: input.files.length,
      fileName,
      summary
    });
  }

  return summary;
}
