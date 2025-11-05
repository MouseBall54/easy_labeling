/**
 * Canvas Controller Implementation
 *
 * Manages Fabric.js canvas operations for the Easy Labeling application.
 * Handles bounding box drawing, editing, zoom/pan controls, and label visualization.
 *
 * @version 1.0.0
 * @author Easy Labeling TypeScript Migration
 */
import { fabric } from 'fabric';
import { ICanvasController, CanvasState, CanvasConfig, CanvasDimensions, BoundingBox, YOLOLabel, FabricRectangle, CanvasEventHandler, CanvasEventType, CanvasCoordinate, ImageCoordinate, CanvasValidation } from '../types/canvas';
import { Point, Size } from '../types';
import { IAppState } from '../types/app-state';
export declare class CanvasController implements ICanvasController {
    private _canvas;
    private _state;
    private _config;
    private _eventListeners;
    private appState;
    private containerElement;
    private currentImage;
    private imageObject;
    private drawingOptions;
    private labelOptions;
    private performanceMetrics;
    constructor(appState: IAppState);
    get canvas(): fabric.Canvas;
    get state(): CanvasState;
    get config(): CanvasConfig;
    isDrawing(): boolean;
    hasSelection(): boolean;
    getZoom(): number;
    getPan(): Point;
    getDimensions(): CanvasDimensions;
    initializeCanvas(containerId: string, config?: Partial<CanvasConfig>): void;
    destroyCanvas(): void;
    loadImage(imageElement: HTMLImageElement): void;
    clearImage(): void;
    resizeToImage(image: HTMLImageElement): void;
    private resizeCanvasToContainer;
    startDrawing(point: Point): void;
    updateDrawing(point: Point): void;
    finishDrawing(point: Point): BoundingBox | null;
    cancelDrawing(): void;
    addBoundingBox(bbox: BoundingBox): FabricRectangle;
    removeBoundingBox(id: string): boolean;
    updateBoundingBox(id: string, updates: Partial<BoundingBox>): boolean;
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
    /**
     * Pan the viewport so that the given image coordinates appear centered
     */
    goToImageCoordinates(x: number, y: number): void;
    /**
     * Convenience method to set zoom by percentage (e.g., 100 => 1.0)
     */
    setZoomPercent(percent: number): void;
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
    private setupCanvasEvents;
    private applyModeSettings;
    private updateSelectedObjects;
    private handleObjectModified;
    private createLabelText;
    private updateLabelText;
    private canvasToImageCoordinates;
    private imageToCanvasCoordinates;
    private generateBoundingBoxId;
    private getClassColor;
    private syncWithAppState;
    private dispatchEvent;
    validate(): CanvasValidation;
}
export declare function createCanvasController(appState: IAppState): CanvasController;
export default CanvasController;
export type { ICanvasController };
//# sourceMappingURL=CanvasController.d.ts.map