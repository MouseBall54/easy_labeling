import { validatePreprocessingSettings } from "./preset-codec.js";
import { createOperationCancelledError } from "../../app/operation.js";
import type {
  AutomationOutputMode,
  MultipleDetectionSettings,
  PixelRect,
  TemplateMatchResult,
  TemplateMatchingSettings,
  TemplatePreprocessingSettings
} from "./types.js";

interface WorkerImagePayload {
  width: number;
  height: number;
  data: ArrayBuffer;
}

interface MatchWorkerResponse {
  id: number;
  ok: boolean;
  result?: TemplateMatchResult;
  warmup?: { engineInitializationMs: number };
  error?: string;
}

interface WorkerLike {
  onmessage: ((event: MessageEvent<MatchWorkerResponse>) => void) | null;
  onerror: ((event: ErrorEvent) => void) | null;
  postMessage(message: unknown, transfer: Transferable[]): void;
  terminate(): void;
}

export interface TemplateMatchInput {
  target: ImageData;
  template: ImageData;
  preprocessing: TemplatePreprocessingSettings;
  matching: TemplateMatchingSettings;
  outputMode?: AutomationOutputMode;
  multipleDetection?: MultipleDetectionSettings;
}

export interface TemplateMatchingService {
  warmUp(): Promise<{ engineInitializationMs: number }>;
  match(input: TemplateMatchInput): Promise<TemplateMatchResult>;
  cancelPending(): void;
  terminate(): void;
}

type PendingRequest = {
  kind: "match";
  startedAt: number;
  templateKey: string;
  resolve(result: TemplateMatchResult): void;
  reject(error: Error): void;
} | {
  kind: "warmup";
  startedAt: number;
  resolve(result: { engineInitializationMs: number }): void;
  reject(error: Error): void;
};

function now(): number {
  return globalThis.performance?.now() ?? Date.now();
}

function validateSearchRoi(searchRoi: PixelRect | null, target: ImageData, template: ImageData): void {
  if (!searchRoi) {
    return;
  }
  const values = [searchRoi.x, searchRoi.y, searchRoi.width, searchRoi.height];
  if (!values.every(Number.isFinite) || searchRoi.x < 0 || searchRoi.y < 0 || searchRoi.width < template.width || searchRoi.height < template.height) {
    throw new Error("Search ROI must be a positive rectangle at least as large as the template");
  }
  if (searchRoi.x + searchRoi.width > target.width || searchRoi.y + searchRoi.height > target.height) {
    throw new Error("Search ROI falls outside the target image");
  }
}

export function requireAcceptedMatch(result: TemplateMatchResult, minimumScore: number): TemplateMatchResult {
  if (result.score < minimumScore) {
    throw new Error(`Best match score ${result.score.toFixed(4)} is below the minimum ${minimumScore.toFixed(4)}`);
  }
  return result;
}

function toTransferPayload(imageData: ImageData): WorkerImagePayload {
  const data = imageData.data;
  const buffer = data.buffer instanceof ArrayBuffer
    && data.byteOffset === 0
    && data.byteLength === data.buffer.byteLength
    ? data.buffer
    : data.slice().buffer;
  return { width: imageData.width, height: imageData.height, data: buffer };
}

function hashBytes(data: Uint8ClampedArray): string {
  let hash = 2166136261;
  for (let index = 0; index < data.length; index += 1) {
    hash ^= data[index] ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function preprocessingKey(settings: TemplatePreprocessingSettings): string {
  return [
    settings.grayscale ? 1 : 0,
    settings.gaussianBlurEnabled ? 1 : 0,
    settings.blurKernelSize,
    settings.blurSigma,
    settings.gaussianNoiseEnabled ? 1 : 0,
    settings.gaussianNoiseSigma,
    settings.gaussianNoiseSeed
  ].join(":");
}

export function createTemplateMatchingService(workerFactory?: () => WorkerLike): TemplateMatchingService {
  const createWorker = workerFactory ?? (() => new Worker(
    new URL("../../../workers/template-matching-worker.js", import.meta.url),
    { name: "easy-labeling-template-matching" }
  ));
  let worker = createWorker();
  let terminated = false;
  let requestId = 0;
  let activeTemplateKey: string | null = null;
  let warmupPromise: Promise<{ engineInitializationMs: number }> | null = null;
  const pending = new Map<number, PendingRequest>();
  const templateHashes = new WeakMap<ImageData, string>();

  const getTemplateKey = (template: ImageData): string => {
    const existing = templateHashes.get(template);
    if (existing) {
      return existing;
    }
    const key = `${template.width}x${template.height}:${hashBytes(template.data)}`;
    templateHashes.set(template, key);
    return key;
  };

  const bindWorker = (target: WorkerLike): void => {
    target.onmessage = (event) => {
      const request = pending.get(event.data.id);
      if (!request) {
        return;
      }
      pending.delete(event.data.id);
      if (!event.data.ok) {
        request.reject(new Error(event.data.error ?? "Template matching failed"));
        return;
      }
      if (request.kind === "warmup" && event.data.warmup) {
        request.resolve(event.data.warmup);
        return;
      }
      if (request.kind === "match" && event.data.result) {
        activeTemplateKey = request.templateKey;
        request.resolve({
          ...event.data.result,
          timings: {
            ...event.data.result.timings,
            roundTripMs: now() - request.startedAt
          }
        });
        return;
      }
      request.reject(new Error("Template matching worker returned an invalid response"));
    };
    target.onerror = (event) => {
      const error = new Error(event.message || "Template matching worker failed");
      pending.forEach((request) => request.reject(error));
      pending.clear();
      warmupPromise = null;
    };
  };
  bindWorker(worker);

  const rejectPending = (error: Error): void => {
    pending.forEach((request) => request.reject(error));
    pending.clear();
    warmupPromise = null;
    activeTemplateKey = null;
  };

  const requireRunning = (): void => {
    if (terminated) {
      throw new Error("Template matching service terminated");
    }
  };

  const warmUp = (): Promise<{ engineInitializationMs: number }> => {
    requireRunning();
    warmupPromise ??= new Promise((resolve, reject) => {
      requestId += 1;
      const id = requestId;
      pending.set(id, { kind: "warmup", startedAt: now(), resolve, reject });
      worker.postMessage({ id, operation: "warmup" }, []);
    });
    return warmupPromise;
  };

  return {
    warmUp,

    async match(input): Promise<TemplateMatchResult> {
      requireRunning();
      validatePreprocessingSettings(input.preprocessing);
      if (input.template.width > input.target.width || input.template.height > input.target.height) {
        throw new Error("Template is larger than the target image");
      }
      validateSearchRoi(input.matching.searchRoi, input.target, input.template);

      const startedAt = now();
      const templateKey = getTemplateKey(input.template);
      const target = toTransferPayload(input.target);
      const includeTemplate = activeTemplateKey !== templateKey;
      const template = includeTemplate ? toTransferPayload(input.template) : null;
      const transferPreparationMs = now() - startedAt;
      requestId += 1;
      const id = requestId;
      const result = new Promise<TemplateMatchResult>((resolve, reject) => {
        pending.set(id, { kind: "match", startedAt, templateKey, resolve, reject });
      });
      const transfer: Transferable[] = [target.data];
      if (template) {
        transfer.push(template.data);
      }
      worker.postMessage({
        id,
        operation: "match",
        target,
        template,
        templateKey,
        preprocessingKey: `${templateKey}:${preprocessingKey(input.preprocessing)}`,
        preprocessing: input.preprocessing,
        matching: input.matching,
        outputMode: input.outputMode ?? "layout-best-match",
        multipleDetection: input.multipleDetection ?? null,
        transferPreparationMs
      }, transfer);

      return await result;
    },

    cancelPending(): void {
      if (terminated || pending.size === 0) {
        return;
      }
      const error = createOperationCancelledError("Template matching stopped");
      const previousWorker = worker;
      previousWorker.onmessage = null;
      previousWorker.onerror = null;
      previousWorker.terminate();
      rejectPending(error);
      worker = createWorker();
      bindWorker(worker);
    },

    terminate(): void {
      if (terminated) {
        return;
      }
      terminated = true;
      rejectPending(new Error("Template matching service terminated"));
      worker.terminate();
    }
  };
}
