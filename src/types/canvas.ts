/**
 * Canvas Type Definitions
 * 
 * Types related to canvas manipulation, drawing, and Fabric.js integration.
 */

import { fabric } from 'fabric';
import { Point, Rectangle, Size } from './index';

// Canvas dimensions
export interface CanvasDimensions extends Size {
  aspectRatio: number;
}

// Bounding box representation
export interface BoundingBox extends Rectangle {
  id: string;
  classId: number;
  className?: string;
  color: string;
  confidence?: number;
  isVisible: boolean;
  isSelected: boolean;
  isTempDraw?: boolean;
}

// YOLO format label (normalized coordinates 0-1)
export interface YOLOLabel {
  classId: number;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  confidence?: number;
}

// Canvas state tracking
export interface CanvasState {
  // Current drawing state
  isDrawing: boolean;
  drawingMode: 'rectangle' | 'none';
  
  // Drawing points
  startPoint: Point | null;
  endPoint: Point | null;
  
  // Current objects
  currentRect: fabric.Rect | null;
  activeLabelText: fabric.Text | null;
  
  // Crosshair lines
  crosshairX: fabric.Line | null;
  crosshairY: fabric.Line | null;
  
  // Viewport
  zoom: number;
  panX: number;
  panY: number;
  
  // Selection
  selectedObjects: fabric.Object[];
  multipleSelection: boolean;
}

// Drawing options
export interface DrawingOptions {
  strokeWidth: number;
  stroke: string;
  fill: string;
  opacity: number;
  selectable: boolean;
  evented: boolean;
}

// Label display options
export interface LabelDisplayOptions {
  showLabels: boolean;
  fontSize: number;
  fontFamily: string;
  fontColor: string;
  backgroundColor: string;
  showConfidence: boolean;
  showClassName: boolean;
  showClassId: boolean;
}

// Canvas event types
export type CanvasEventType = 
  | 'object:added'
  | 'object:removed'
  | 'object:modified'
  | 'object:selected'
  | 'selection:cleared'
  | 'selection:created'
  | 'selection:updated'
  | 'mouse:down'
  | 'mouse:move'
  | 'mouse:up'
  | 'path:created'
  | 'before:render'
  | 'after:render';

// Canvas event data
export interface CanvasEvent<T = any> {
  type: CanvasEventType;
  target?: fabric.Object;
  pointer?: Point;
  selected?: fabric.Object[];
  deselected?: fabric.Object[];
  transform?: any;
  data?: T;
}

// Canvas event handler
export type CanvasEventHandler<T = any> = (event: CanvasEvent<T>) => void;

// Fabric.js object extensions
export interface FabricRectangle extends fabric.Rect {
  boundingBox?: BoundingBox;
  labelText?: fabric.Text;
  isLabel?: boolean;
}

export interface FabricText extends fabric.Text {
  parentRect?: FabricRectangle;
  boundingBox?: BoundingBox;
  isLabel?: boolean;
}

export interface FabricLine extends fabric.Line {
  isCrosshair?: boolean;
  crosshairType?: 'horizontal' | 'vertical';
}

// Canvas utility types
export interface CanvasCoordinate extends Point {
  canvasX: number;
  canvasY: number;
}

export interface ImageCoordinate extends Point {
  imageX: number;
  imageY: number;
  normalized: Point; // 0-1 coordinates
}

// Viewport management
export interface ViewportState {
  zoom: number;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
}

// Canvas configuration
export interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor: string;
  selection: boolean;
  preserveObjectStacking: boolean;
  renderOnAddRemove: boolean;
  skipTargetFind: boolean;
}

// Active selection style
export interface ActiveSelectionStyle {
  hasBorders: boolean;
  borderColor: string;
  cornerColor: string;
  cornerStrokeColor: string;
  cornerStyle: 'rect' | 'circle';
  transparentCorners: boolean;
  borderDashArray: number[];
  hasRotatingPoint: boolean;
}

// Canvas methods interface
export interface CanvasMethods {
  // Initialization
  initializeCanvas(containerId: string, config: CanvasConfig): void;
  destroyCanvas(): void;
  
  // Image operations
  loadImage(imageElement: HTMLImageElement): void;
  clearImage(): void;
  resizeToImage(image: HTMLImageElement): void;
  
  // Drawing operations
  startDrawing(point: Point): void;
  updateDrawing(point: Point): void;
  finishDrawing(point: Point): BoundingBox | null;
  cancelDrawing(): void;
  
  // Bounding box operations
  addBoundingBox(bbox: BoundingBox): FabricRectangle;
  removeBoundingBox(id: string): boolean;
  updateBoundingBox(id: string, bbox: Partial<BoundingBox>): boolean;
  getBoundingBox(id: string): BoundingBox | null;
  getAllBoundingBoxes(): BoundingBox[];
  
  // Selection operations
  selectBoundingBox(id: string): void;
  deselectAll(): void;
  getSelectedBoundingBoxes(): BoundingBox[];
  deleteSelected(): BoundingBox[];
  
  // Label operations
  showLabels(): void;
  hideLabels(): void;
  updateLabels(): void;
  setLabelFont(fontSize: number): void;
  
  // Viewport operations
  zoomIn(): void;
  zoomOut(): void;
  zoomToFit(): void;
  resetZoom(): void;
  setZoom(zoom: number): void;
  panTo(x: number, y: number): void;
  resetPan(): void;
  
  // Crosshair operations
  showCrosshair(point: Point): void;
  hideCrosshair(): void;
  updateCrosshair(point: Point): void;
  
  // Coordinate conversion
  canvasToImage(canvasPoint: Point): ImageCoordinate;
  imageToCanvas(imagePoint: Point): CanvasCoordinate;
  normalizeCoordinates(imagePoint: Point, imageSize: Size): Point;
  denormalizeCoordinates(normalizedPoint: Point, imageSize: Size): Point;
  
  // YOLO format conversion
  boundingBoxToYOLO(bbox: BoundingBox, imageSize: Size): YOLOLabel;
  yoloToBoundingBox(yolo: YOLOLabel, imageSize: Size): BoundingBox;
  
  // Event handling
  addEventListener(type: CanvasEventType, handler: CanvasEventHandler): void;
  removeEventListener(type: CanvasEventType, handler: CanvasEventHandler): void;
  
  // Rendering
  render(): void;
  requestRender(): void;
}

// Canvas controller interface
export interface ICanvasController extends CanvasMethods {
  // Properties
  readonly canvas: fabric.Canvas;
  readonly state: CanvasState;
  readonly config: CanvasConfig;
  
  // State accessors
  isDrawing(): boolean;
  hasSelection(): boolean;
  getZoom(): number;
  getPan(): Point;
  getDimensions(): CanvasDimensions;
}

// Canvas factory
export interface CanvasFactory {
  create(containerId: string, config?: Partial<CanvasConfig>): ICanvasController;
}

// Canvas serialization
export interface SerializableCanvas {
  version: string;
  objects: any[];
  background: string;
  width: number;
  height: number;
}

// Performance monitoring
export interface CanvasPerformance {
  renderTime: number;
  objectCount: number;
  memoryUsage: number;
  fps: number;
}

// Canvas validation
export interface CanvasValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  performance: CanvasPerformance;
}