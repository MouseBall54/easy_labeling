export type SuperResolutionBackend = "webgpu" | "wasm";
export type SuperResolutionMode = "cfsr-x2" | "cfsr-x4";

export interface SuperResolutionImageInput {
  cacheKey: string;
  mode: SuperResolutionMode;
  width: number;
  height: number;
  rgba: Uint8ClampedArray;
  tileSize?: number;
  overlap?: number;
}

export interface SuperResolutionImageResult {
  mode: SuperResolutionMode;
  width: number;
  height: number;
  rgba: Uint8ClampedArray;
  cacheKey: string;
}

export interface SuperResolutionStatus {
  phase: "idle" | "loading" | "upscaling" | "ready" | "error";
  backend: SuperResolutionBackend | null;
  imageCacheKey: string | null;
  runs: number;
  message: string | null;
}

export interface SuperResolutionService {
  upscale(input: SuperResolutionImageInput): Promise<SuperResolutionImageResult>;
  clear(): void;
  dispose(): void;
  getStatus(): SuperResolutionStatus;
}
