import type { AppMode, CanvasPoint, LabelDisplayMode } from "../../types/labels.js";
import type { ClassRemapRule, ClassRemapSummary } from "../../domain/class-remap.js";
import type {
  CanvasImageLike,
  FabricActiveSelectionLike,
  FabricCanvasLike,
  FabricRuntimeLike,
  FabricObjectLike,
  FabricRectLike
} from "./fabric-types.js";
import type { CanvasHistoryGestureBaseline, CanvasHistoryService } from "./history.js";
import type { SegmentationAiPreviewSummary, SegmentationDocumentSnapshot, SegmentationRegionSelection, SegmentationSmartPreviewSummary, SegmentationSummary, SegmentationSuperpixelSettings, SegmentationTool } from "../segmentation/types.js";
import type { EdgeSamStatus } from "../edgesam/types.js";
import type { SegmentationImageSourceMode, SegmentationPreprocessingConfig, SegmentationViewSourceMode } from "../segmentation/preprocessing.js";
import type { WorkingImageRect } from "../segmentation/working-image.js";
import type { AiSelectRegionConstraint } from "../segmentation/ai-region-constraint.js";
import type { BoxLayout, PixelPoint } from "../automation/types.js";

export interface AppliedBoxLayout {
  instanceId: string;
  annotationIds: string[];
  discardedOutOfBoundsCount: number;
}

export interface BoxGeometryUpdate {
  annotationId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetectionBoxInput {
  classId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AppliedDetectionBoxes {
  annotationIds: string[];
  discardedOutOfBoundsCount: number;
}

export interface CanvasBulkOperationOptions {
  signal?: AbortSignal;
  chunkSize?: number;
  deferLabels?: boolean;
  deferRender?: boolean;
  onProgress?: (update: { detail: string; current: number; total: number }) => void;
}

export interface CanvasControllerState {
  currentMode: AppMode;
  currentImage: CanvasImageLike | null;
  labelFolderHandle: unknown | null;
  showLabelsOnCanvas: boolean;
  labelDisplayMode?: LabelDisplayMode;
  labelFontSize: number;
  isCrosshairVisible: boolean;
  lastMousePosition: CanvasPoint;
  labelSortOrder: "asc" | "desc";
}

export interface CanvasControllerDeps {
  fabric: FabricRuntimeLike;
  getCanvasContainerSize(): { width: number; height: number };
  promptForLabelClass(defaultValue: string): Promise<string>;
  updateLabelList(): void;
  updateZoomDisplay(): void;
  getDisplayNameForClass(labelClass: string | undefined): string;
  getSegmentationClassIds?(): readonly string[];
  notify(message: string, duration?: number): void;
  getColorForClass?: (labelClass: string | undefined) => string;
  historyService?: CanvasHistoryService;
  onDocumentMutation?(): void;
  edgeSamService?: import("../edgesam/types.js").EdgeSamService;
}

export interface CanvasShell {
  readonly canvas: FabricCanvasLike;
  readonly history: CanvasHistoryService;
  getObjects(type?: string): FabricObjectLike[];
  getActiveObject(): FabricObjectLike | null;
  getActiveObjects(): FabricObjectLike[];
  discardActiveObject(): void;
  setActiveSelection(objects: readonly FabricObjectLike[], primaryObject?: FabricObjectLike | null): void;
  renderAll(): void;
  clear(): void;
  setBackgroundImage(image: unknown): void;
  setLabelOnlyView(enabled: boolean, background: "black" | "white" | "gray"): void;
  setMode(mode: AppMode): void;
  setZoomPercentage(percentage: string): void;
  zoom(factor: number): void;
  resetZoom(): void;
  resizeCanvas(): void;
  goToCoords(x: number, y: number): void;
  highlightPoint(x: number, y: number): void;
  createCrosshairLines(): void;
  toggleCrosshair(visible: boolean): void;
  updateCrosshair(pointer: CanvasPoint): void;
  hideCrosshair(): void;
}

export interface CanvasController {
  readonly canvas: FabricCanvasLike;
  getObjects(type?: string): FabricObjectLike[];
  setActiveSelection(objects: readonly FabricObjectLike[], primaryObject?: FabricObjectLike | null): void;
  renderAll(): void;
  clear(): void;
  setBackgroundImage(image: unknown): void;
  setLabelOnlyView?(enabled: boolean, background: "black" | "white" | "gray"): void;
  setMode(mode: AppMode): void;
  addLabelsFromYolo(yoloData: string, replaceExisting?: boolean): void;
  getLabelsAsYolo(): string;
  removeBoxesOutsideImageBounds?(): number;
  captureBoxLayout(name: string, sourceImageName: string, scope: "selected" | "all"): BoxLayout;
  applyBoxLayout(layout: BoxLayout, anchor: PixelPoint, options?: { replaceExisting?: boolean; preserveOutOfBounds?: boolean }): AppliedBoxLayout;
  applyBoxLayoutInBatches?(layout: BoxLayout, anchor: PixelPoint, options?: { replaceExisting?: boolean; preserveOutOfBounds?: boolean } & CanvasBulkOperationOptions): Promise<AppliedBoxLayout>;
  applyDetectionBoxes(boxes: readonly DetectionBoxInput[], options?: { replaceExisting?: boolean }): AppliedDetectionBoxes;
  translateLayoutInstance(instanceId: string, delta: PixelPoint): void;
  translateSelectedBoxes(delta: PixelPoint): void;
  getSelectedBoxCount(): number;
  updateSelectedBoxGeometry?(geometry: { x: number; y: number; width: number; height: number }): boolean;
  /** Sets bounding-rect geometry (image px) for many boxes as one undo step; returns the count updated. */
  updateBoxGeometries?(updates: readonly BoxGeometryUpdate[]): number;
  subscribeHistory?(listener: (entry: import("./history.js").CanvasHistoryEntry) => void): () => void;
  setSelectedBoxesVisibility?(visible: boolean): boolean;
  highlightSelection(): void;
  refreshClassColors?(): void;
  startDrawing(pointer: CanvasPoint): void;
  continueDrawing(pointer: CanvasPoint): void;
  finishDrawing(): Promise<void>;
  removeObject(object: FabricRectLike): void;
  sortObjectsByLabel(order?: "asc" | "desc"): void;
  reorderObject(srcIndex: number, destIndex: number): void;
  editLabel(rect: FabricRectLike): Promise<void>;
  editMultipleLabels(selection: FabricActiveSelectionLike): Promise<void>;
  setZoomPercentage(percentage: string): void;
  zoom(factor: number): void;
  resetZoom(): void;
  resizeCanvas(): void;
  goToCoords(x: number, y: number): void;
  highlightPoint(x: number, y: number): void;
  drawLabelText(rect: FabricRectLike): void;
  updateLabelText(rect: FabricRectLike): void;
  updateAllLabelTexts(): void;
  /** Hides class tags during a gesture when many are shown; true while suspended. Layout is skipped until resumed. */
  suspendLabelTags?(): boolean;
  /** Ends a suspension; true if one was active (the caller then runs updateAllLabelTexts). */
  resumeLabelTags?(): boolean;
  toggleAllLabelTexts(visible: boolean): void;
  setLabelDisplayMode?(mode: LabelDisplayMode): void;
  setHoveredAnnotation?(rect: FabricRectLike | null): void;
  applyVisibilityFromHiddenClasses(hiddenLabelClasses: ReadonlySet<string>, clearSelectionWhenFilteredHidden?: boolean): void;
  selectAllLabels(): void;
  selectLabelsByClass(labelClass: string): void;
  createCrosshairLines(): void;
  toggleCrosshair(visible: boolean): void;
  updateCrosshair(pointer: CanvasPoint): void;
  hideCrosshair(): void;
  copy(options?: CanvasBulkOperationOptions): Promise<void>;
  paste(options?: CanvasBulkOperationOptions): Promise<void>;
  getClipboardItemCount(): number;
  deleteSelection(options?: CanvasBulkOperationOptions): void;
  setSelectedLabelClass?(classId: string): boolean;
  remapLabelClasses?(rule: ClassRemapRule): ClassRemapSummary;
  alignSelectionLeft(): void;
  alignSelectionRight(): void;
  alignSelectionTop(): void;
  alignSelectionBottom(): void;
  alignSelectionColumnCenters(): void;
  alignSelectionRowSetColumnCenters(): void;
  alignSelectionRowCenters(): void;
  /** Sets the center-grouping tolerance (fraction of the median box size) and redoes the last center alignment with it. */
  setCenterAlignmentTolerance(toleranceScale: number, commit: boolean): void;
  distributeSelectionHorizontally(): void;
  distributeSelectionVertically(): void;
  captureHistoryBaseline(): CanvasHistoryGestureBaseline;
  commitHistoryFromBaseline(baseline: CanvasHistoryGestureBaseline): void;
  clearHistory(): void;
  undo(): void;
  redo(): void;
  canUndo(): boolean;
  canRedo(): boolean;
  setWorkflowActive?(active: boolean): void;
  setSegmentationTool?(tool: SegmentationTool): void;
  finishSegmentationPolygon?(): boolean;
  cancelSegmentationPolygon?(): boolean;
  isSegmentationPolygonDrawing?(): boolean;
  getSegmentationPolygonVertexCount?(): number;
  recalculateSegmentationSuperpixels?(regionSize: number): boolean;
  /** recalculateSegmentationSuperpixels, computed natively first in the desktop app; null when a newer call superseded it. */
  computeSegmentationSuperpixels?(regionSize: number): Promise<boolean | null>;
  /** The superpixels the tool currently uses (tests compare native and TS results). */
  getSegmentationSuperpixelResult?(): import("../segmentation/superpixels.js").SuperpixelResult | null;
  setSegmentationSuperpixelBoundaryVisible?(visible: boolean): void;
  getSegmentationSuperpixelRegionSize?(): number | null;
  getSegmentationSuperpixelSettings?(): SegmentationSuperpixelSettings;
  setSegmentationSuperpixelSettings?(settings: Partial<SegmentationSuperpixelSettings>): boolean;
  startSegmentationSuperpixelPaint?(pointer: CanvasPoint, mode: "add" | "remove"): boolean;
  startSegmentationSmartGrow?(pointer: CanvasPoint, mode: "add" | "remove"): boolean;
  applySegmentationSmartGrow?(pointer: CanvasPoint, similarity: number, edgeStop: number, mode?: "add" | "remove"): boolean;
  getSegmentationSmartPreview?(): SegmentationSmartPreviewSummary | null;
  applySegmentationSmartPreview?(): boolean;
  discardSegmentationSmartPreview?(): boolean;
  setSegmentationSmartGrowSettings?(similarity: number, edgeStop: number): void;
  startSegmentationAiSelect?(pointer: CanvasPoint, label: "positive" | "negative"): Promise<boolean>;
  startSegmentationAiBox?(pointer: CanvasPoint): void;
  continueSegmentationAiBox?(pointer: CanvasPoint): void;
  finishSegmentationAiBox?(pointer: CanvasPoint): Promise<boolean>;
  getSegmentationAiRegionConstraint?(): AiSelectRegionConstraint;
  setSegmentationAiRegionConstraint?(config: Partial<AiSelectRegionConstraint>): Promise<boolean>;
  beginSegmentationAiRegionConstraint?(): boolean;
  cancelSegmentationAiRegionConstraint?(): boolean;
  isSegmentationAiRegionConstraintDrawing?(): boolean;
  startSegmentationAiRegionConstraint?(pointer: CanvasPoint): void;
  continueSegmentationAiRegionConstraint?(pointer: CanvasPoint): void;
  finishSegmentationAiRegionConstraint?(pointer: CanvasPoint): Promise<boolean>;
  getSegmentationAiPreview?(): SegmentationAiPreviewSummary | null;
  applySegmentationAiPreview?(): boolean;
  discardSegmentationAiPreview?(): boolean;
  getEdgeSamStatus?(): EdgeSamStatus;
  getSegmentationPreprocessingConfig?(): SegmentationPreprocessingConfig;
  setSegmentationPreprocessingConfig?(config: Partial<SegmentationPreprocessingConfig>): boolean;
  /**
   * Desktop app: computes the Processed view for the current config merged with `config` in Rust, off the UI
   * thread, so the following synchronous view/config call finds it ready. Null when there is nothing to wait
   * for (no native bridge, no image, already cached): callers then stay synchronous. Resolves false when native
   * work did not produce the image (colour-keeping config, native error): the synchronous call then uses TS.
   */
  prepareSegmentationProcessedImage?(config?: Partial<SegmentationPreprocessingConfig>): Promise<boolean> | null;
  setSegmentationViewSource?(source: SegmentationViewSourceMode): boolean;
  getSegmentationViewSource?(): SegmentationViewSourceMode;
  setSegmentationEdgeSamInputSource?(source: SegmentationImageSourceMode): boolean;
  getSegmentationEdgeSamInputSource?(): SegmentationImageSourceMode;
  setSegmentationSuperpixelInputSource?(source: SegmentationImageSourceMode): boolean;
  getSegmentationSuperpixelInputSource?(): SegmentationImageSourceMode;
  setSegmentationBrushRadius?(radius: number): void;
  setSegmentationActiveClass?(classId: string): void;
  setSegmentationAutoFillClosedRegionEnabled?(enabled: boolean): void;
  getSegmentationAutoFillClosedRegionEnabled?(): boolean;
  setSegmentationOverlayVisibility?(visible: boolean): void;
  setSegmentationOverlayOpacity?(opacity: number): void;
  setSegmentationEdgeHighlightVisible?(visible: boolean): void;
  setSegmentationEdgeHighlightIntensity?(intensity: number): void;
  setSegmentationClassVisibility?(classId: string, visible: boolean): void;
  setSegmentationOnlyVisibleClass?(classId: string | null): void;
  getSegmentationClassAtPoint?(pointer: CanvasPoint): string | null;
  getSelectedSegmentationClass?(): string | null;
  getSelectedSegmentationRegion?(): SegmentationRegionSelection | null;
  deleteSelectedSegmentationRegion?(): boolean;
  selectSegmentationRegionAtPoint?(pointer: CanvasPoint): boolean;
  clearSegmentationSelection?(): void;
  startSegmentationRegionMove?(pointer: CanvasPoint): boolean;
  continueSegmentationRegionMove?(pointer: CanvasPoint): boolean;
  finishSegmentationRegionMove?(): Promise<boolean>;
  relabelSelectedSegmentationRegion?(classId: string): boolean;
  relabelSegmentationRegionAtPoint?(pointer: CanvasPoint, classId: string): boolean;
  getSegmentationSummary?(): SegmentationSummary;
  getSegmentationDocumentSnapshot?(): SegmentationDocumentSnapshot | null;
  loadSegmentationDocumentSnapshot?(snapshot: SegmentationDocumentSnapshot | null): void;
}
