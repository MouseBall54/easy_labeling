/**
 * Canvas Type Definitions
 *
 * Types related to canvas manipulation, drawing, and Fabric.js integration.
 */
import { fabric } from 'fabric';
import { Point, Rectangle, Size } from './index';
export interface CanvasDimensions extends Size {
    aspectRatio: number;
}
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
export interface YOLOLabel {
    classId: number;
    centerX: number;
    centerY: number;
    width: number;
    height: number;
    confidence?: number;
}
export interface CanvasState {
    isDrawing: boolean;
    drawingMode: 'rectangle' | 'none';
    startPoint: Point | null;
    endPoint: Point | null;
    currentRect: fabric.Rect | null;
    activeLabelText: fabric.Text | null;
    crosshairX: fabric.Line | null;
    crosshairY: fabric.Line | null;
    zoom: number;
    panX: number;
    panY: number;
    selectedObjects: fabric.Object[];
    multipleSelection: boolean;
}
export interface DrawingOptions {
    strokeWidth: number;
    stroke: string;
    fill: string;
    opacity: number;
    selectable: boolean;
    evented: boolean;
}
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
export type CanvasEventType = 'object:added' | 'object:removed' | 'object:modified' | 'object:selected' | 'selection:cleared' | 'selection:created' | 'selection:updated' | 'mouse:down' | 'mouse:move' | 'mouse:up' | 'path:created' | 'before:render' | 'after:render';
export interface CanvasEvent<T = any> {
    type: CanvasEventType;
    target?: fabric.Object;
    pointer?: Point;
    selected?: fabric.Object[];
    deselected?: fabric.Object[];
    transform?: any;
    data?: T;
}
export type CanvasEventHandler<T = any> = (event: CanvasEvent<T>) => void;
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
export interface CanvasCoordinate extends Point {
    canvasX: number;
    canvasY: number;
}
export interface ImageCoordinate extends Point {
    imageX: number;
    imageY: number;
    normalized: Point;
}
export interface ViewportState {
    zoom: number;
    centerX: number;
    centerY: number;
    width: number;
    height: number;
}
export interface CanvasConfig {
    width: number;
    height: number;
    backgroundColor: string;
    selection: boolean;
    preserveObjectStacking: boolean;
    renderOnAddRemove: boolean;
    skipTargetFind: boolean;
}
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
export interface CanvasMethods {
    initializeCanvas(containerId: string, config: CanvasConfig): void;
    destroyCanvas(): void;
    loadImage(imageElement: HTMLImageElement): void;
    clearImage(): void;
    resizeToImage(image: HTMLImageElement): void;
    startDrawing(point: Point): void;
    updateDrawing(point: Point): void;
    finishDrawing(point: Point): BoundingBox | null;
    cancelDrawing(): void;
    addBoundingBox(bbox: BoundingBox): FabricRectangle;
    removeBoundingBox(id: string): boolean;
    updateBoundingBox(id: string, bbox: Partial<BoundingBox>): boolean;
    getBoundingBox(id: string): BoundingBox | null;
    getAllBoundingBoxes(): BoundingBox[];
    selectBoundingBox(id: string): void;
    deselectAll(): void;
    getSelectedBoundingBoxes(): BoundingBox[];
    deleteSelected(): BoundingBox[];
    showLabels(): void;
    hideLabels(): void;
    updateLabels(): void;
    setLabelFont(fontSize: number): void;
    zoomIn(): void;
    zoomOut(): void;
    zoomToFit(): void;
    resetZoom(): void;
    setZoom(zoom: number): void;
    panTo(x: number, y: number): void;
    resetPan(): void;
    showCrosshair(point: Point): void;
    hideCrosshair(): void;
    updateCrosshair(point: Point): void;
    canvasToImage(canvasPoint: Point): ImageCoordinate;
    imageToCanvas(imagePoint: Point): CanvasCoordinate;
    normalizeCoordinates(imagePoint: Point, imageSize: Size): Point;
    denormalizeCoordinates(normalizedPoint: Point, imageSize: Size): Point;
    boundingBoxToYOLO(bbox: BoundingBox, imageSize: Size): YOLOLabel;
    yoloToBoundingBox(yolo: YOLOLabel, imageSize: Size): BoundingBox;
    addEventListener(type: CanvasEventType, handler: CanvasEventHandler): void;
    removeEventListener(type: CanvasEventType, handler: CanvasEventHandler): void;
    render(): void;
    requestRender(): void;
}
export interface ICanvasController extends CanvasMethods {
    readonly canvas: fabric.Canvas;
    readonly state: CanvasState;
    readonly config: CanvasConfig;
    isDrawing(): boolean;
    hasSelection(): boolean;
    getZoom(): number;
    getPan(): Point;
    getDimensions(): CanvasDimensions;
}
export interface CanvasFactory {
    create(containerId: string, config?: Partial<CanvasConfig>): ICanvasController;
}
export interface SerializableCanvas {
    version: string;
    objects: any[];
    background: string;
    width: number;
    height: number;
}
export interface CanvasPerformance {
    renderTime: number;
    objectCount: number;
    memoryUsage: number;
    fps: number;
}
export interface CanvasValidation {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    performance: CanvasPerformance;
}
//# sourceMappingURL=canvas.d.ts.map