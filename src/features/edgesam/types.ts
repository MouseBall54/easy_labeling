import type { CanvasPoint } from "../../types/labels.js";

export interface EdgeSamPoint extends CanvasPoint {
  label: "positive" | "negative";
}

export interface EdgeSamBox {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface EdgeSamImageInput {
  cacheKey: string;
  width: number;
  height: number;
  rgba: Uint8ClampedArray;
}

export interface EdgeSamDecodeInput {
  points: readonly EdgeSamPoint[];
  box: EdgeSamBox | null;
}

export interface EdgeSamMaskResult {
  width: number;
  height: number;
  mask: Uint8Array;
  score: number;
}

export type EdgeSamBackend = "webgpu" | "wasm";

export interface EdgeSamStatus {
  phase: "idle" | "loading" | "encoding" | "ready" | "error";
  backend: EdgeSamBackend | null;
  imageCacheKey: string | null;
  encoderRuns: number;
  message: string | null;
}

export interface EdgeSamService {
  prepareImage(input: EdgeSamImageInput): Promise<EdgeSamStatus>;
  decode(input: EdgeSamDecodeInput): Promise<EdgeSamMaskResult>;
  clear(): void;
  dispose(): void;
  getStatus(): EdgeSamStatus;
}
