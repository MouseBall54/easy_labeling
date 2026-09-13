export type SuperResolutionBackend = "webgpu" | "wasm";
export type SuperResolutionPhase =
  | "idle"
  | "loading-model"
  | "preparing"
  | "upscaling"
  | "merging"
  | "ready"
  | "error";
export type SuperResolutionMode =
  | "cfsr-x2"
  | "cfsr-x4"
  | "tk-r-em-hrsem"
  | "tk-r-em-hrtem"
  | "tk-r-em-lrsem"
  | "tk-r-em-lrtem";

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
  phase: SuperResolutionPhase;
  backend: SuperResolutionBackend | null;
  mode: SuperResolutionMode | null;
  modelLabel: string | null;
  imageCacheKey: string | null;
  runs: number;
  startedAt: number | null;
  elapsedMs: number;
  completedUnits: number;
  totalUnits: number | null;
  progressPercent: number | null;
  fallbackOccurred: boolean;
  fallbackReason: string | null;
  cacheHit: boolean;
  message: string | null;
}

export type SuperResolutionStatusListener = (status: SuperResolutionStatus) => void;

export interface SuperResolutionService {
  upscale(input: SuperResolutionImageInput): Promise<SuperResolutionImageResult>;
  clear(): void;
  dispose(): void;
  getStatus(): SuperResolutionStatus;
  subscribeStatus(listener: SuperResolutionStatusListener): () => void;
}
