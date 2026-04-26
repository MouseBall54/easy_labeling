import type { CanvasPoint } from "../../types/labels.js";

export type SegmentationTool = "brush" | "erase";

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
