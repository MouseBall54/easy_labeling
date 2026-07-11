export const LAYOUT_SCHEMA_VERSION = 1 as const;
export const TEMPLATE_SCHEMA_VERSION = 1 as const;
export const AUTOMATION_SCHEMA_VERSION = 2 as const;

export interface PixelSize {
  width: number;
  height: number;
}

export interface PixelPoint {
  x: number;
  y: number;
}

export interface PixelRect extends PixelPoint, PixelSize {}

export interface BoxLayoutItem extends PixelSize {
  id: string;
  classId: string;
  relativeX: number;
  relativeY: number;
  order: number;
}

export interface BoxLayout {
  schemaVersion: typeof LAYOUT_SCHEMA_VERSION;
  id: string;
  name: string;
  sourceImageName: string;
  sourceImageSize: PixelSize;
  sourceAnchor: PixelPoint;
  createdAt: string;
  updatedAt: string;
  boxes: BoxLayoutItem[];
}

export interface TemplatePreprocessingSettings {
  grayscale: boolean;
  gaussianBlurEnabled: boolean;
  blurKernelSize: number;
  blurSigma: number;
  gaussianNoiseEnabled: boolean;
  gaussianNoiseSigma: number;
  gaussianNoiseSeed: number;
}

export interface TemplateAsset {
  schemaVersion: typeof TEMPLATE_SCHEMA_VERSION;
  id: string;
  name: string;
  sourceImageName: string;
  sourceImageSize: PixelSize;
  roi: PixelRect;
  pngDataUrl: string;
  preprocessing: TemplatePreprocessingSettings;
  createdAt: string;
  updatedAt: string;
}

export type ExistingLabelsPolicy = "skip" | "append" | "replace";
export type AutomationOutputMode = "layout-best-match" | "multiple-detection-boxes";
export type TemplateMatchingMode = "accurate" | "fast";

export interface TemplateMatchingSettings {
  minimumScore: number;
  searchRoi: PixelRect | null;
  mode: TemplateMatchingMode;
}

export interface MultipleDetectionSettings {
  classId: string;
  maximumDetections: number;
  strictNonOverlap: boolean;
  nmsIouThreshold: number;
  paddingX: number;
  paddingY: number;
}

export interface AutomationPreset {
  schemaVersion: typeof AUTOMATION_SCHEMA_VERSION;
  id: string;
  name: string;
  templateId: string;
  layoutId: string | null;
  outputMode: AutomationOutputMode;
  relationOffset: PixelPoint;
  manualOffset: PixelPoint;
  matching: TemplateMatchingSettings;
  multipleDetection: MultipleDetectionSettings;
  existingLabelsPolicy: ExistingLabelsPolicy;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationLibraryDocument {
  schemaVersion: typeof AUTOMATION_SCHEMA_VERSION;
  layouts: BoxLayout[];
  templates: TemplateAsset[];
  presets: AutomationPreset[];
}

export interface PlacedLayoutBox extends PixelRect {
  layoutBoxId: string;
  classId: string;
  order: number;
}

export interface TemplateMatchResult {
  score: number;
  x: number;
  y: number;
  width: number;
  height: number;
  matches: TemplateMatchCandidate[];
  timings: TemplateMatchTimings;
  templateCacheHit: boolean;
}

export interface TemplateMatchCandidate {
  score: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TemplateMatchTimings {
  engineInitializationMs: number;
  transferPreparationMs: number;
  targetPreprocessingMs: number;
  templatePreprocessingMs: number;
  matchingMs: number;
  candidateExtractionMs: number;
  workerTotalMs: number;
  roundTripMs: number;
}
