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
  /** Restore the mask only inside this rectangle (pixel edges); the result's `roi` says where it lies. */
  roi?: { x0: number; y0: number; x1: number; y1: number };
}

export interface EdgeSamMaskResult {
  /** The encoded image's size. */
  width: number;
  height: number;
  /** 0/1 per pixel of the image, or of `roi` when the request asked for one. */
  mask: Uint8Array;
  score: number;
  roi?: { x0: number; y0: number; width: number; height: number };
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
