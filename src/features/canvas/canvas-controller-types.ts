import type { AppMode, CanvasPoint } from "../../types/labels.js";
import type {
  CanvasImageLike,
  FabricActiveSelectionLike,
  FabricCanvasLike,
  FabricRuntimeLike,
  FabricObjectLike,
  FabricRectLike
} from "./fabric-types.js";
import type { CanvasHistoryGestureBaseline, CanvasHistoryService } from "./history.js";
import type { SegmentationDocumentSnapshot, SegmentationSummary, SegmentationTool } from "../segmentation/types.js";

export interface CanvasControllerState {
  currentMode: AppMode;
  currentImage: CanvasImageLike | null;
  labelFolderHandle: unknown | null;
  showLabelsOnCanvas: boolean;
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
  notify(message: string, duration?: number): void;
  getColorForClass?: (labelClass: string | undefined) => string;
  historyService?: CanvasHistoryService;
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
  renderAll(): void;
  clear(): void;
  setBackgroundImage(image: unknown): void;
  setMode(mode: AppMode): void;
  addLabelsFromYolo(yoloData: string): void;
  getLabelsAsYolo(): string;
  highlightSelection(): void;
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
  toggleAllLabelTexts(visible: boolean): void;
  applyVisibilityFromHiddenClasses(hiddenLabelClasses: ReadonlySet<string>, clearSelectionWhenFilteredHidden?: boolean): void;
  selectAllLabels(): void;
  selectLabelsByClass(labelClass: string): void;
  createCrosshairLines(): void;
  toggleCrosshair(visible: boolean): void;
  updateCrosshair(pointer: CanvasPoint): void;
  hideCrosshair(): void;
  copy(): Promise<void>;
  paste(): Promise<void>;
  deleteSelection(): void;
  setSelectedLabelClass?(classId: string): boolean;
  alignSelectionLeft(): void;
  alignSelectionRight(): void;
  alignSelectionTop(): void;
  alignSelectionBottom(): void;
  distributeSelectionHorizontally(): void;
  distributeSelectionVertically(): void;
  captureHistoryBaseline(): CanvasHistoryGestureBaseline;
  commitHistoryFromBaseline(baseline: CanvasHistoryGestureBaseline): void;
  clearHistory(): void;
  undo(): void;
  redo(): void;
  canUndo(): boolean;
  canRedo(): boolean;
  setSegmentationTool?(tool: SegmentationTool): void;
  setSegmentationBrushRadius?(radius: number): void;
  setSegmentationActiveClass?(classId: string): void;
  setSegmentationAutoFillClosedRegionEnabled?(enabled: boolean): void;
  getSegmentationAutoFillClosedRegionEnabled?(): boolean;
  setSegmentationOverlayVisibility?(visible: boolean): void;
  setSegmentationOverlayOpacity?(opacity: number): void;
  setSegmentationClassVisibility?(classId: string, visible: boolean): void;
  setSegmentationOnlyVisibleClass?(classId: string | null): void;
  getSegmentationClassAtPoint?(pointer: CanvasPoint): string | null;
  getSelectedSegmentationClass?(): string | null;
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
