import type { CanvasPoint } from "../../types/labels.js";

export type SegmentationTool = "brush" | "erase" | "polygon" | "superpixel" | "smart" | "ai-select";

export type SegmentationStrength = "off" | "low" | "medium" | "high";

export interface SegmentationSuperpixelSettings {
  regionSize: number;
  blur: SegmentationStrength;
  contrast: SegmentationStrength;
  edgeSensitivity: Exclude<SegmentationStrength, "off">;
}

export interface SegmentationToolPreset {
  id: string;
  name: string;
  settings: SegmentationSuperpixelSettings;
  smartSimilarity: number;
  smartEdgeStop: number;
  boundaryVisible: boolean;
}

export interface SegmentationVisibilityState {
  overlayVisible: boolean;
  overlayOpacity: number;
  hiddenClassIds: Set<string>;
}

export interface SegmentationDocumentSnapshot {
  width: number;
  height: number;
  mask: Uint16Array;
  activeClassId: string;
  activeTool: SegmentationTool;
  overlayVisible: boolean;
  overlayOpacity: number;
  hiddenClassIds: Set<string>;
  brushRadius: number;
}

export interface SegmentationStrokeInput {
  points: readonly CanvasPoint[];
  radius?: number;
}

export interface SegmentationSummary {
  activeClassId: string;
  activeTool: SegmentationTool;
  brushRadius: number;
  overlayVisible: boolean;
  overlayOpacity: number;
  edgeHighlightVisible: boolean;
  edgeHighlightIntensity: number;
  visibleClassIds: string[];
  allClassIds: string[];
  hiddenClassIds: string[];
  smartPreview?: SegmentationSmartPreviewSummary | null;
  aiPreview?: SegmentationAiPreviewSummary | null;
}

export interface SegmentationSmartPreviewSummary {
  mode: "add" | "remove";
  classId: string;
  regionCount: number;
  pixelCount: number;
  similarity: number;
  edgeStop: number;
}

export interface SegmentationAiPreviewSummary {
  classId: string;
  pixelCount: number;
  pointCount: number;
  hasBox: boolean;
  score: number;
}

export interface SegmentationRegionBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface SegmentationMutationResult {
  mutated: boolean;
  dirtyBounds: SegmentationRegionBounds | null;
}

export interface SegmentationRegionSelection {
  classId: string;
  pixelCount: number;
  pixelIndices: Uint32Array;
  bounds: SegmentationRegionBounds;
  seedPoint: CanvasPoint;
}

export interface SegmentationRegionMoveResult extends SegmentationMutationResult {
  region: SegmentationRegionSelection;
}
