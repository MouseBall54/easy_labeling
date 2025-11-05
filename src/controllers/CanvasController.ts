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
import {
  ICanvasController,
  CanvasState,
  CanvasConfig,
  CanvasDimensions,
  BoundingBox,
  YOLOLabel,
  FabricRectangle,
  FabricText,
  FabricLine,
  CanvasEvent,
  CanvasEventHandler,
  CanvasEventType,
  DrawingOptions,
  LabelDisplayOptions,
  ViewportState,
  CanvasCoordinate,
  ImageCoordinate,
  CanvasValidation,
  CanvasPerformance
} from '../types/canvas';

import { Point, Rectangle, Size } from '../types';
// Runtime alias for global FabricJS when using CDN externals
const FabricJS: any = (typeof (window as any) !== 'undefined' && (window as any).fabric) ? (window as any).fabric : (fabric as unknown as any);
import { IAppState } from '../types/app-state';
import { colorPalette } from '../utils/color-palette';

// ===================================================================
// Canvas Controller Implementation
// ===================================================================

export class CanvasController implements ICanvasController {
  private _canvas: fabric.Canvas | null = null;
  private _state: CanvasState;
  private _config: CanvasConfig;
  private _eventListeners = new Map<CanvasEventType, CanvasEventHandler[]>();

  // Dependencies
  private appState: IAppState;

  // Canvas container and image
  private containerElement: HTMLElement | null = null;
  private currentImage: HTMLImageElement | null = null;
  private imageObject: fabric.Image | null = null;

  // Drawing state
  private drawingOptions: DrawingOptions = {
    strokeWidth: 2,
    stroke: '#ff0000',
    fill: 'transparent',
    opacity: 1,
    selectable: true,
    evented: true
  };

  private labelOptions: LabelDisplayOptions = {
    showLabels: true,
    fontSize: 14,
    fontFamily: 'Arial',
    fontColor: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    showConfidence: false,
    showClassName: true,
    showClassId: true
  };

  // Performance monitoring
  private performanceMetrics: CanvasPerformance = {
    renderTime: 0,
    objectCount: 0,
    memoryUsage: 0,
    fps: 60
  };

  constructor(appState: IAppState) {
    this.appState = appState;

    // Initialize default config
    this._config = {
      width: 800,
      height: 600,
      backgroundColor: '#f8f9fa',
      selection: true,
      preserveObjectStacking: true,
      renderOnAddRemove: true,
      skipTargetFind: false
    };

    // Initialize state
    this._state = {
      isDrawing: false,
      drawingMode: 'none',
      startPoint: null,
      endPoint: null,
      currentRect: null,
      activeLabelText: null,
      crosshairX: null,
      crosshairY: null,
      zoom: 1,
      panX: 0,
      panY: 0,
      selectedObjects: [],
      multipleSelection: false
    };

    // React to mode changes from AppState
    try {
      this.appState.addEventListener('mode:changed', (evt: any) => {
        const current = evt?.data?.current as ('draw' | 'edit') | undefined;
        this.applyModeSettings(current);
      });
    } catch {}
  }

  // ===================================================================
  // Properties (ICanvasController interface)
  // ===================================================================

  public get canvas(): fabric.Canvas {
    if (!this._canvas) {
      throw new Error('Canvas not initialized. Call initializeCanvas() first.');
    }
    return this._canvas;
  }

  public get state(): CanvasState {
    return { ...this._state };
  }

  public get config(): CanvasConfig {
    return { ...this._config };
  }

  // ===================================================================
  // State Accessors
  // ===================================================================

  public isDrawing(): boolean {
    return this._state.isDrawing;
  }

  public hasSelection(): boolean {
    return this._state.selectedObjects.length > 0;
  }

  public getZoom(): number {
    return this._state.zoom;
  }

  public getPan(): Point {
    return { x: this._state.panX, y: this._state.panY };
  }

  public getDimensions(): CanvasDimensions {
    return {
      width: this._config.width,
      height: this._config.height,
      aspectRatio: this._config.width / this._config.height
    };
  }

  // ===================================================================
  // Initialization
  // ===================================================================

  public initializeCanvas(containerId: string, config?: Partial<CanvasConfig>): void {
    // Apply config overrides
    if (config) {
      this._config = { ...this._config, ...config };
    }

    // Find container element
    this.containerElement = document.getElementById(containerId);
    if (!this.containerElement) {
      throw new Error(`Canvas container element with ID '${containerId}' not found`);
    }

    // Create canvas element
    const canvasElement = document.createElement('canvas');
    canvasElement.id = `${containerId}-canvas`;
    canvasElement.width = this._config.width;
    canvasElement.height = this._config.height;

    // Clear container and add canvas
    this.containerElement.innerHTML = '';
    this.containerElement.appendChild(canvasElement);

    // Initialize Fabric.js canvas
    this._canvas = new FabricJS.Canvas(canvasElement, {
      backgroundColor: this._config.backgroundColor,
      selection: this._config.selection,
      preserveObjectStacking: this._config.preserveObjectStacking,
      renderOnAddRemove: this._config.renderOnAddRemove,
      skipTargetFind: this._config.skipTargetFind,
      width: this._config.width,
      height: this._config.height,
      // Enable high DPI support
      enableRetinaScaling: true,
      // Performance settings
      stateful: false
    });

    // Make canvas fill container
    this.resizeCanvasToContainer();

    // Setup event handlers
    this.setupCanvasEvents();

    // Prevent default context menu and toggle mode on right-click within container
    try {
      this.containerElement.addEventListener('contextmenu', (e: MouseEvent) => {
        e.preventDefault();
      });
      this.containerElement.addEventListener('mousedown', (e: MouseEvent) => {
        if (e.button === 2) { // Right click
          this.appState.toggleMode();
          e.preventDefault();
        }
      });
    } catch {}

    // Apply label options from app state
    this.syncWithAppState();

    // Apply current mode settings to canvas
    this.applyModeSettings(this.appState.currentMode);

    // Resize canvas on window resize
    window.addEventListener('resize', () => {
      this.resizeCanvasToContainer();
      if (this.currentImage && this.imageObject) {
        const prevZoom = this._state.zoom;
        this.resetZoom();
        this.resizeToImage(this.currentImage);
        this.setZoom(prevZoom);
      }
      this.requestRender();
    });

    this.dispatchEvent({
      type: 'after:render',
      data: { initialized: true }
    });
  }

  public destroyCanvas(): void {
    if (this._canvas) {
      this._canvas.dispose();
      this._canvas = null;
    }

    if (this.containerElement) {
      this.containerElement.innerHTML = '';
      this.containerElement = null;
    }

    // Reset state
    this._state = {
      isDrawing: false,
      drawingMode: 'none',
      startPoint: null,
      endPoint: null,
      currentRect: null,
      activeLabelText: null,
      crosshairX: null,
      crosshairY: null,
      zoom: 1,
      panX: 0,
      panY: 0,
      selectedObjects: [],
      multipleSelection: false
    };

    this.currentImage = null;
    this.imageObject = null;
  }

  // ===================================================================
  // Image Operations
  // ===================================================================

  public loadImage(imageElement: HTMLImageElement): void {
    if (!this._canvas) return;

    // Remove existing image
    this.clearImage();

    this.currentImage = imageElement;

    // Create fabric image object
    this.imageObject = new FabricJS.Image(imageElement, {
      left: 0,
      top: 0,
      selectable: false,
      evented: false,
      lockMovementX: true,
      lockMovementY: true,
      lockRotation: true,
      lockScalingX: true,
      lockScalingY: true,
      lockUniScaling: true,
      hasControls: false,
      hasBorders: false
    });

    // Resize canvas to match image
    this.resizeToImage(imageElement);

    // Add image to canvas (send to back)
    this._canvas.add(this.imageObject! as unknown as fabric.Object);
    this.imageObject!.sendToBack();

    // Reset viewport
    this.resetZoom();
    this.resetPan();

    this._canvas.renderAll();

    this.dispatchEvent({
      type: 'after:render',
      data: { imageLoaded: true, imageDimensions: { width: imageElement.width, height: imageElement.height } }
    });
  }

  public clearImage(): void {
    if (!this._canvas) return;

    if (this.imageObject) {
      this._canvas.remove(this.imageObject);
      this.imageObject = null;
    }

    this.currentImage = null;
    this._canvas.renderAll();
  }

  public resizeToImage(image: HTMLImageElement): void {
    if (!this._canvas) return;
    // Ensure canvas matches container size
    this.resizeCanvasToContainer();

    const canvasWidth = this._canvas.getWidth();
    const canvasHeight = this._canvas.getHeight();

    // Scale image to fit inside canvas and center it
    if (this.imageObject) {
      const scale = Math.min(canvasWidth / image.width, canvasHeight / image.height);
      const scaledW = image.width * scale;
      const scaledH = image.height * scale;
      this.imageObject.set({
        scaleX: scale,
        scaleY: scale,
        left: (canvasWidth - scaledW) / 2,
        top: (canvasHeight - scaledH) / 2
      });
      this._canvas.centerObject(this.imageObject as any);
      (this.imageObject as any).setCoords();
    }
  }

  private resizeCanvasToContainer(): void {
    if (!this._canvas || !this.containerElement) return;
    const rect = this.containerElement.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    this._config = { ...this._config, width, height };
    this._canvas.setDimensions({ width, height });
  }

  // ===================================================================
  // Drawing Operations
  // ===================================================================

  public startDrawing(point: Point): void {
    if (!this._canvas || this.appState.currentMode !== 'draw') return;

    this._state.isDrawing = true;
    this._state.drawingMode = 'rectangle';
    this._state.startPoint = point;
    this._state.endPoint = point;

    // Create temporary rectangle for drawing feedback
    const rect = new FabricJS.Rect({
      left: point.x,
      top: point.y,
      width: 0,
      height: 0,
      ...this.drawingOptions,
      selectable: false,
      evented: false
    }) as FabricRectangle;

    rect.isLabel = true;
    this._state.currentRect = rect;
    this._canvas.add(rect);

    this.dispatchEvent({
      type: 'mouse:down',
      pointer: point,
      data: { drawing: true }
    });
  }

  public updateDrawing(point: Point): void {
    if (!this._canvas || !this._state.isDrawing || !this._state.currentRect || !this._state.startPoint) return;

    this._state.endPoint = point;

    // Calculate rectangle dimensions
    const left = Math.min(this._state.startPoint.x, point.x);
    const top = Math.min(this._state.startPoint.y, point.y);
    const width = Math.abs(point.x - this._state.startPoint.x);
    const height = Math.abs(point.y - this._state.startPoint.y);

    // Update temporary rectangle
    this._state.currentRect.set({
      left,
      top,
      width,
      height
    });

    this._canvas.renderAll();

    this.dispatchEvent({
      type: 'mouse:move',
      pointer: point,
      data: { drawing: true, dimensions: { width, height } }
    });
  }

  public finishDrawing(point: Point): BoundingBox | null {
    if (!this._canvas || !this._state.isDrawing || !this._state.currentRect || !this._state.startPoint) {
      this.cancelDrawing();
      return null;
    }

    this._state.endPoint = point;

    // Calculate final dimensions
    const left = Math.min(this._state.startPoint.x, point.x);
    const top = Math.min(this._state.startPoint.y, point.y);
    const width = Math.abs(point.x - this._state.startPoint.x);
    const height = Math.abs(point.y - this._state.startPoint.y);

    // Minimum size validation
    if (width < 5 || height < 5) {
      this.cancelDrawing();
      return null;
    }

    // Convert to image coordinates if image is loaded
    let normalizedBox: BoundingBox | null = null;

    if (this.currentImage && this.imageObject) {
      const imageCoords = this.canvasToImageCoordinates({ x: left, y: top });
      const imageWidth = Math.abs(width / (this.imageObject.scaleX || 1));
      const imageHeight = Math.abs(height / (this.imageObject.scaleY || 1));

      // Create bounding box
      normalizedBox = {
        id: this.generateBoundingBoxId(),
        x: imageCoords.x,
        y: imageCoords.y,
        width: imageWidth,
        height: imageHeight,
        classId: 0, // Default class
        color: this.getClassColor(0),
        isVisible: true,
        isSelected: true,
        isTempDraw: false
      };
    }

    // Remove temporary rectangle
    this._canvas.remove(this._state.currentRect);

    // Reset drawing state
    this._state.isDrawing = false;
    this._state.drawingMode = 'none';
    this._state.startPoint = null;
    this._state.endPoint = null;
    this._state.currentRect = null;

    // Add permanent bounding box if valid
    if (normalizedBox) {
      this.addBoundingBox(normalizedBox);
    }

    this._canvas.renderAll();

    this.dispatchEvent({
      type: 'mouse:up',
      pointer: point,
      data: { drawing: false, boundingBox: normalizedBox }
    });

    return normalizedBox;
  }

  public cancelDrawing(): void {
    if (!this._canvas) return;

    if (this._state.currentRect) {
      this._canvas.remove(this._state.currentRect);
    }

    this._state.isDrawing = false;
    this._state.drawingMode = 'none';
    this._state.startPoint = null;
    this._state.endPoint = null;
    this._state.currentRect = null;

    this._canvas.renderAll();
  }

  // ===================================================================
  // Bounding Box Operations
  // ===================================================================

  public addBoundingBox(bbox: BoundingBox): FabricRectangle {
    if (!this._canvas) {
      throw new Error('Canvas not initialized');
    }

    // Convert to canvas coordinates
    const canvasCoords = this.imageToCanvasCoordinates({ x: bbox.x, y: bbox.y });
    const canvasWidth = this.imageObject ? bbox.width * (this.imageObject.scaleX || 1) : bbox.width;
    const canvasHeight = this.imageObject ? bbox.height * (this.imageObject.scaleY || 1) : bbox.height;

    // Create rectangle
    const rect = new FabricJS.Rect({
      left: canvasCoords.x,
      top: canvasCoords.y,
      width: canvasWidth,
      height: canvasHeight,
      stroke: bbox.color,
      strokeWidth: this.drawingOptions.strokeWidth,
      fill: 'transparent',
      selectable: true,
      evented: true,
      hasControls: true,
      hasBorders: true,
      borderColor: bbox.color,
      cornerColor: bbox.color,
      transparentCorners: false
    }) as FabricRectangle;

    // Attach bounding box data
    rect.boundingBox = bbox;
    rect.isLabel = true;

    // Add to canvas
    this._canvas.add(rect);

    // Create label text if labels are enabled
    if (this.labelOptions.showLabels) {
      this.createLabelText(rect);
    }

    // Bring to front (but keep behind any current drawing)
    rect.bringToFront();

    this._canvas.renderAll();

    this.dispatchEvent({
      type: 'object:added',
      target: rect,
      data: { boundingBox: bbox }
    });

    return rect;
  }

  public removeBoundingBox(id: string): boolean {
    if (!this._canvas) return false;

    const objects = this._canvas.getObjects() as FabricRectangle[];
    const rectToRemove = objects.find(obj => obj.boundingBox?.id === id);

    if (rectToRemove) {
      // Remove associated label text
      if (rectToRemove.labelText) {
        this._canvas.remove(rectToRemove.labelText);
      }

      // Remove rectangle
      this._canvas.remove(rectToRemove);
      this._canvas.renderAll();

      this.dispatchEvent({
        type: 'object:removed',
        target: rectToRemove,
        data: { boundingBoxId: id }
      });

      return true;
    }

    return false;
  }

  public updateBoundingBox(id: string, updates: Partial<BoundingBox>): boolean {
    if (!this._canvas) return false;

    const objects = this._canvas.getObjects() as FabricRectangle[];
    const rect = objects.find(obj => obj.boundingBox?.id === id);

    if (rect && rect.boundingBox) {
      // Update bounding box data
      Object.assign(rect.boundingBox, updates);

      // Update visual properties
      if (updates.color) {
        rect.set({
          stroke: updates.color,
          borderColor: updates.color,
          cornerColor: updates.color
        });
      }

      if (updates.isVisible !== undefined) {
        rect.set({ visible: updates.isVisible });
      }

      // Update label text
      if (rect.labelText) {
        this.updateLabelText(rect);
      }

      this._canvas.renderAll();

      this.dispatchEvent({
        type: 'object:modified',
        target: rect,
        data: { boundingBox: rect.boundingBox, updates }
      });

      return true;
    }

    return false;
  }

  public getBoundingBox(id: string): BoundingBox | null {
    if (!this._canvas) return null;

    const objects = this._canvas.getObjects() as FabricRectangle[];
    const rect = objects.find(obj => obj.boundingBox?.id === id);

    return rect?.boundingBox || null;
  }

  public getAllBoundingBoxes(): BoundingBox[] {
    if (!this._canvas) return [];

    const objects = this._canvas.getObjects() as FabricRectangle[];
    return objects
      .filter(obj => obj.isLabel && obj.boundingBox)
      .map(obj => obj.boundingBox!)
      .filter(bbox => bbox !== undefined);
  }

  // ===================================================================
  // Selection Operations
  // ===================================================================

  public selectBoundingBox(id: string): void {
    if (!this._canvas) return;

    const objects = this._canvas.getObjects() as FabricRectangle[];
    const rect = objects.find(obj => obj.boundingBox?.id === id);

    if (rect) {
      this._canvas.setActiveObject(rect);
      this.updateSelectedObjects();
      this._canvas.renderAll();
    }
  }

  public deselectAll(): void {
    if (!this._canvas) return;

    this._canvas.discardActiveObject();
    this.updateSelectedObjects();
    this._canvas.renderAll();

    this.dispatchEvent({
      type: 'selection:cleared'
    });
  }

  public getSelectedBoundingBoxes(): BoundingBox[] {
    return this._state.selectedObjects
      .map(obj => (obj as FabricRectangle).boundingBox)
      .filter(bbox => bbox !== undefined) as BoundingBox[];
  }

  public deleteSelected(): BoundingBox[] {
    if (!this._canvas) return [];

    const selectedBoxes = this.getSelectedBoundingBoxes();
    const activeObject = this._canvas.getActiveObject();

    if (activeObject) {
      if (activeObject.type === 'activeSelection') {
        // Multiple selection
        const selection = activeObject as fabric.ActiveSelection;
        const objects = selection.getObjects() as FabricRectangle[];

        objects.forEach(obj => {
          if (obj.isLabel && obj.boundingBox) {
            this.removeBoundingBox(obj.boundingBox.id);
          }
        });
      } else {
        // Single selection
        const rect = activeObject as FabricRectangle;
        if (rect.isLabel && rect.boundingBox) {
          this.removeBoundingBox(rect.boundingBox.id);
        }
      }
    }

    this.deselectAll();
    return selectedBoxes;
  }

  // ===================================================================
  // Label Operations
  // ===================================================================

  public showLabels(): void {
    this.labelOptions.showLabels = true;
    this.updateLabels();
  }

  public hideLabels(): void {
    this.labelOptions.showLabels = false;
    this.updateLabels();
  }

  public updateLabels(): void {
    if (!this._canvas) return;

    const objects = this._canvas.getObjects() as FabricRectangle[];

    objects.forEach(obj => {
      if (obj.isLabel && obj.boundingBox) {
        if (this.labelOptions.showLabels && !obj.labelText) {
          this.createLabelText(obj);
        } else if (!this.labelOptions.showLabels && obj.labelText) {
          this._canvas!.remove(obj.labelText);
          obj.labelText = undefined;
        } else if (obj.labelText) {
          this.updateLabelText(obj);
        }
      }
    });

    this._canvas.renderAll();
  }

  public setLabelFont(fontSize: number): void {
    this.labelOptions.fontSize = fontSize;
    this.updateLabels();
  }

  // ===================================================================
  // Viewport Operations
  // ===================================================================

  public zoomIn(): void {
    const newZoom = Math.min(this._state.zoom * 1.2, 5);
    this.setZoom(newZoom);
  }

  public zoomOut(): void {
    const newZoom = Math.max(this._state.zoom / 1.2, 0.1);
    this.setZoom(newZoom);
  }

  public zoomToFit(): void {
    if (!this._canvas || !this.currentImage) return;

    const canvasWidth = this._canvas.getWidth();
    const canvasHeight = this._canvas.getHeight();
    const imageWidth = this.currentImage.width;
    const imageHeight = this.currentImage.height;

    const scaleX = canvasWidth / imageWidth;
    const scaleY = canvasHeight / imageHeight;
    const zoom = Math.min(scaleX, scaleY);

    this.setZoom(zoom);
    this.resetPan();
  }

  public resetZoom(): void {
    this.setZoom(1);
  }

  public setZoom(zoom: number): void {
    if (!this._canvas) return;

    this._state.zoom = Math.max(0.1, Math.min(5, zoom));
    this._canvas.setZoom(this._state.zoom);
    this._canvas.renderAll();

    this.dispatchEvent({
      type: 'after:render',
      data: { zoom: this._state.zoom }
    });
  }

  public panTo(x: number, y: number): void {
    if (!this._canvas) return;

    this._state.panX = x;
    this._state.panY = y;

    const vpt = this._canvas.viewportTransform;
    if (vpt && vpt.length >= 6) {
      vpt[4] = x;
      vpt[5] = y;
      this._canvas.setViewportTransform(vpt);
      this._canvas.renderAll();
    }
  }

  public resetPan(): void {
    this.panTo(0, 0);
  }

  /**
   * Pan the viewport so that the given image coordinates appear centered
   */
  public goToImageCoordinates(x: number, y: number): void {
    if (!this._canvas) return;

    const canvasWidth = this._canvas.getWidth();
    const canvasHeight = this._canvas.getHeight();
    const zoom = this._state.zoom;

    const canvasPoint = this.imageToCanvasCoordinates({ x, y });
    const vpt = this._canvas.viewportTransform;
    if (vpt && vpt.length >= 6) {
      vpt[4] = canvasWidth / 2 - zoom * canvasPoint.x;
      vpt[5] = canvasHeight / 2 - zoom * canvasPoint.y;
      this._canvas.setViewportTransform(vpt);
      this._canvas.renderAll();
    }
  }

  /**
   * Convenience method to set zoom by percentage (e.g., 100 => 1.0)
   */
  public setZoomPercent(percent: number): void {
    const clamped = Math.max(10, Math.min(500, percent));
    this.setZoom(clamped / 100);
  }

  // ===================================================================
  // Crosshair Operations
  // ===================================================================

  public showCrosshair(point: Point): void {
    if (!this._canvas) return;

    this.hideCrosshair();

    const canvasWidth = this._canvas.getWidth();
    const canvasHeight = this._canvas.getHeight();

    // Horizontal line
    this._state.crosshairX = new FabricJS.Line([0, point.y, canvasWidth, point.y], {
      stroke: '#ffffff',
      strokeWidth: 1,
      strokeDashArray: [5, 5],
      selectable: false,
      evented: false,
      excludeFromExport: true
    }) as FabricLine;
    (this._state.crosshairX as any).isCrosshair = true;
    (this._state.crosshairX as any).crosshairType = 'horizontal';

    // Vertical line
    this._state.crosshairY = new FabricJS.Line([point.x, 0, point.x, canvasHeight], {
      stroke: '#ffffff',
      strokeWidth: 1,
      strokeDashArray: [5, 5],
      selectable: false,
      evented: false,
      excludeFromExport: true
    }) as FabricLine;
    (this._state.crosshairY as any).isCrosshair = true;
    (this._state.crosshairY as any).crosshairType = 'vertical';

    this._canvas.add(this._state.crosshairX);
    this._canvas.add(this._state.crosshairY);

    // Bring crosshair to front
    this._state.crosshairX.bringToFront();
    this._state.crosshairY.bringToFront();

    this._canvas.renderAll();
  }

  public hideCrosshair(): void {
    if (!this._canvas) return;

    if (this._state.crosshairX) {
      this._canvas.remove(this._state.crosshairX);
      this._state.crosshairX = null;
    }

    if (this._state.crosshairY) {
      this._canvas.remove(this._state.crosshairY);
      this._state.crosshairY = null;
    }

    this._canvas.renderAll();
  }

  public updateCrosshair(point: Point): void {
    if (!this._canvas) return;

    if (!this.appState.isCrosshairVisible) {
      this.hideCrosshair();
      return;
    }

    // Only show crosshair when pointer is inside a label box area
    const imgPt = this.canvasToImageCoordinates(point);
    const objects = this._canvas.getObjects() as FabricRectangle[];
    const isInsideAnyBox = objects.some(obj => {
      const bbox = obj.boundingBox;
      if (!obj.isLabel || !bbox) return false;
      return (
        imgPt.x >= bbox.x && imgPt.x <= bbox.x + bbox.width &&
        imgPt.y >= bbox.y && imgPt.y <= bbox.y + bbox.height
      );
    });

    if (isInsideAnyBox) {
      this.showCrosshair(point);
    } else {
      this.hideCrosshair();
    }
  }

  // ===================================================================
  // Coordinate Conversion
  // ===================================================================

  public canvasToImage(canvasPoint: Point): ImageCoordinate {
    const imageCoords = this.canvasToImageCoordinates(canvasPoint);
    const normalized = this.normalizeCoordinates(imageCoords, {
      width: this.currentImage?.width || 1,
      height: this.currentImage?.height || 1
    });

    return {
      x: canvasPoint.x,
      y: canvasPoint.y,
      imageX: imageCoords.x,
      imageY: imageCoords.y,
      normalized
    };
  }

  public imageToCanvas(imagePoint: Point): CanvasCoordinate {
    const canvasCoords = this.imageToCanvasCoordinates(imagePoint);

    return {
      x: imagePoint.x,
      y: imagePoint.y,
      canvasX: canvasCoords.x,
      canvasY: canvasCoords.y
    };
  }

  public normalizeCoordinates(imagePoint: Point, imageSize: Size): Point {
    return {
      x: imagePoint.x / imageSize.width,
      y: imagePoint.y / imageSize.height
    };
  }

  public denormalizeCoordinates(normalizedPoint: Point, imageSize: Size): Point {
    return {
      x: normalizedPoint.x * imageSize.width,
      y: normalizedPoint.y * imageSize.height
    };
  }

  // ===================================================================
  // YOLO Format Conversion
  // ===================================================================

  public boundingBoxToYOLO(bbox: BoundingBox, imageSize: Size): YOLOLabel {
    const centerX = (bbox.x + bbox.width / 2) / imageSize.width;
    const centerY = (bbox.y + bbox.height / 2) / imageSize.height;
    const width = bbox.width / imageSize.width;
    const height = bbox.height / imageSize.height;

    return {
      classId: bbox.classId,
      centerX,
      centerY,
      width,
      height,
      confidence: bbox.confidence
    };
  }

  public yoloToBoundingBox(yolo: YOLOLabel, imageSize: Size): BoundingBox {
    const width = yolo.width * imageSize.width;
    const height = yolo.height * imageSize.height;
    const x = (yolo.centerX * imageSize.width) - (width / 2);
    const y = (yolo.centerY * imageSize.height) - (height / 2);

    return {
      id: this.generateBoundingBoxId(),
      x,
      y,
      width,
      height,
      classId: yolo.classId,
      color: this.getClassColor(yolo.classId),
      isVisible: true,
      isSelected: false,
      confidence: yolo.confidence
    };
  }

  // ===================================================================
  // Event Handling
  // ===================================================================

  public addEventListener(type: CanvasEventType, handler: CanvasEventHandler): void {
    if (!this._eventListeners.has(type)) {
      this._eventListeners.set(type, []);
    }
    this._eventListeners.get(type)!.push(handler);
  }

  public removeEventListener(type: CanvasEventType, handler: CanvasEventHandler): void {
    const handlers = this._eventListeners.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // ===================================================================
  // Rendering
  // ===================================================================

  public render(): void {
    if (this._canvas) {
      this._canvas.renderAll();
    }
  }

  public requestRender(): void {
    if (this._canvas) {
      this._canvas.requestRenderAll();
    }
  }

  // ===================================================================
  // Private Helper Methods
  // ===================================================================

  private setupCanvasEvents(): void {
    if (!this._canvas) return;

    // Mouse events
    let isPanning = false;
    let lastPos = { x: 0, y: 0 };

    this._canvas.on('mouse:down', (e) => {
      const pointer = this._canvas!.getPointer(e.e);
      this.updateCrosshair(pointer);

      // Start panning on middle click or when Alt pressed (right-click reserved for mode toggle)
      const ev = e.e as MouseEvent;
      const startPan = ev.button === 1 || ev.altKey || (ev as any).spaceKey;
      if (startPan) {
        isPanning = true;
        lastPos = { x: ev.clientX, y: ev.clientY };
        this._canvas!.setCursor('grabbing');
        this._canvas!.requestRenderAll();
        return;
      }

      if (this.appState.currentMode === 'draw' && !e.target) {
        this.startDrawing(pointer);
      }
    });

    this._canvas.on('mouse:move', (e) => {
      const pointer = this._canvas!.getPointer(e.e);
      this.updateCrosshair(pointer);

      // Dispatch mouse move with canvas/image coordinates
      try {
        const imagePt = this.canvasToImageCoordinates(pointer);
        this.dispatchEvent({
          type: 'mouse:move',
          pointer,
          data: { canvas: { x: pointer.x, y: pointer.y }, image: { x: imagePt.x, y: imagePt.y } }
        });
      } catch {}

      if (isPanning) {
        const ev = e.e as MouseEvent;
        const v: any = this._canvas!.viewportTransform as any;
        if (!v || v.length < 6) {
          return;
        }
        v[4] += ev.clientX - lastPos.x;
        v[5] += ev.clientY - lastPos.y;
        this._canvas!.setViewportTransform(v as number[]);
        lastPos = { x: ev.clientX, y: ev.clientY };
        this._canvas!.requestRenderAll();
        return;
      }

      if (this._state.isDrawing) {
        this.updateDrawing(pointer);
      }
    });

    this._canvas.on('mouse:up', (e) => {
      const pointer = this._canvas!.getPointer(e.e);

      if (isPanning) {
        isPanning = false;
        this._canvas!.setCursor('default');
        this._canvas!.requestRenderAll();
        return;
      }

      if (this._state.isDrawing) {
        this.finishDrawing(pointer);
      }
    });

    // Selection events
    this._canvas.on('selection:created', () => {
      this.updateSelectedObjects();
      this.dispatchEvent({ type: 'selection:created' });
    });

    this._canvas.on('selection:updated', () => {
      this.updateSelectedObjects();
      this.dispatchEvent({ type: 'selection:updated' });
    });

    this._canvas.on('selection:cleared', () => {
      this.updateSelectedObjects();
      this.dispatchEvent({ type: 'selection:cleared' });
    });

    // Object modification events
    this._canvas.on('object:modified', (e) => {
      if (e.target) {
        this.handleObjectModified(e.target as FabricRectangle);
      }
    });

    // Wheel zoom (zoom to pointer)
    this._canvas.on('mouse:wheel', (opt: any) => {
      const delta = opt.e.deltaY;
      let zoom = this._state.zoom;
      zoom *= delta > 0 ? 0.9 : 1.1;
      zoom = Math.max(0.1, Math.min(5, zoom));

      const point = new FabricJS.Point(opt.e.offsetX, opt.e.offsetY);
      this._canvas!.zoomToPoint(point, zoom);
      this._state.zoom = zoom;

      opt.e.preventDefault();
      opt.e.stopPropagation();
    });
  }

  private applyModeSettings(mode?: 'draw' | 'edit'): void {
    if (!this._canvas) return;
    const m = mode || this.appState.currentMode;

    // In draw mode, disable selection and target finding to make drawing easier
    const drawMode = m === 'draw';
    (this._canvas as any).selection = !drawMode;
    (this._canvas as any).skipTargetFind = drawMode;

    // Update object selectability based on mode
    const objects = this._canvas.getObjects();
    objects.forEach(obj => {
      obj.selectable = !drawMode;
      obj.evented = !drawMode;
    });

    this._canvas.requestRenderAll();
  }

  private updateSelectedObjects(): void {
    if (!this._canvas) return;

    const activeObject = this._canvas.getActiveObject();

    if (!activeObject) {
      this._state.selectedObjects = [];
      this._state.multipleSelection = false;
    } else if (activeObject.type === 'activeSelection') {
      this._state.selectedObjects = (activeObject as fabric.ActiveSelection).getObjects();
      this._state.multipleSelection = true;
    } else {
      this._state.selectedObjects = [activeObject];
      this._state.multipleSelection = false;
    }
  }

  private handleObjectModified(rect: FabricRectangle): void {
    if (!rect.isLabel || !rect.boundingBox || !this.imageObject) return;

    // Convert back to image coordinates
    const imageCoords = this.canvasToImageCoordinates({
      x: rect.left || 0,
      y: rect.top || 0
    });

    const imageWidth = (rect.width || 0) / (this.imageObject.scaleX || 1);
    const imageHeight = (rect.height || 0) / (this.imageObject.scaleY || 1);

    // Update bounding box
    rect.boundingBox.x = imageCoords.x;
    rect.boundingBox.y = imageCoords.y;
    rect.boundingBox.width = imageWidth;
    rect.boundingBox.height = imageHeight;

    // Update label text position
    if (rect.labelText) {
      this.updateLabelText(rect);
    }

    this.dispatchEvent({
      type: 'object:modified',
      target: rect,
      data: { boundingBox: rect.boundingBox }
    });
  }

  private createLabelText(rect: FabricRectangle): void {
    if (!this._canvas || !rect.boundingBox) return;

    const bbox = rect.boundingBox;
    const className = this.appState.classNames.get(bbox.classId.toString()) || `Class ${bbox.classId}`;

    let labelText = '';
    if (this.labelOptions.showClassId) {
      labelText += bbox.classId.toString();
    }
    if (this.labelOptions.showClassName) {
      if (labelText) labelText += ': ';
      labelText += className;
    }
    if (this.labelOptions.showConfidence && bbox.confidence !== undefined) {
      labelText += ` (${(bbox.confidence * 100).toFixed(1)}%)`;
    }

    const text = new FabricJS.Text(labelText, {
      left: (rect.left || 0) + 2,
      top: (rect.top || 0) - this.labelOptions.fontSize - 2,
      fontSize: this.labelOptions.fontSize,
      fontFamily: this.labelOptions.fontFamily,
      fill: this.labelOptions.fontColor,
      backgroundColor: this.labelOptions.backgroundColor,
      // Avoid invalid baseline value warnings; ensure canvas uses a valid baseline
      textBaseline: 'alphabetic',
      selectable: false,
      evented: false
    }) as FabricText;

    text.parentRect = rect;
    text.boundingBox = bbox;
    text.isLabel = true;

    rect.labelText = text;
    this._canvas.add(text);
    text.bringToFront();
  }

  private updateLabelText(rect: FabricRectangle): void {
    if (!rect.labelText || !rect.boundingBox) return;

    const bbox = rect.boundingBox;
    const className = this.appState.classNames.get(bbox.classId.toString()) || `Class ${bbox.classId}`;

    let labelText = '';
    if (this.labelOptions.showClassId) {
      labelText += bbox.classId.toString();
    }
    if (this.labelOptions.showClassName) {
      if (labelText) labelText += ': ';
      labelText += className;
    }
    if (this.labelOptions.showConfidence && bbox.confidence !== undefined) {
      labelText += ` (${(bbox.confidence * 100).toFixed(1)}%)`;
    }

    rect.labelText.set({
      text: labelText,
      left: (rect.left || 0) + 2,
      top: (rect.top || 0) - this.labelOptions.fontSize - 2,
      fontSize: this.labelOptions.fontSize,
      fill: this.labelOptions.fontColor,
      backgroundColor: this.labelOptions.backgroundColor
    });
  }

  private canvasToImageCoordinates(canvasPoint: Point): Point {
    if (!this.imageObject) return canvasPoint;

    const scaleX = this.imageObject.scaleX || 1;
    const scaleY = this.imageObject.scaleY || 1;

    return {
      x: canvasPoint.x / scaleX,
      y: canvasPoint.y / scaleY
    };
  }

  private imageToCanvasCoordinates(imagePoint: Point): Point {
    if (!this.imageObject) return imagePoint;

    const scaleX = this.imageObject.scaleX || 1;
    const scaleY = this.imageObject.scaleY || 1;

    return {
      x: imagePoint.x * scaleX,
      y: imagePoint.y * scaleY
    };
  }

  private generateBoundingBoxId(): string {
    return `bbox_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getClassColor(classId: number): string {
    return colorPalette[classId % colorPalette.length] || '#ff0000';
  }

  private syncWithAppState(): void {
    // Sync label display options with app state
    this.labelOptions.showLabels = this.appState.showLabelsOnCanvas;
    this.labelOptions.fontSize = this.appState.labelFontSize;
  }

  private dispatchEvent(event: CanvasEvent): void {
    const handlers = this._eventListeners.get(event.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`Error in canvas event handler for ${event.type}:`, error);
        }
      });
    }
  }

  // ===================================================================
  // Validation and Performance
  // ===================================================================

  public validate(): CanvasValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!this._canvas) {
      errors.push('Canvas not initialized');
    }

    if (!this.currentImage) {
      warnings.push('No image loaded');
    }

    const objectCount = this._canvas?.getObjects().length || 0;
    if (objectCount > 100) {
      warnings.push(`High object count: ${objectCount}`);
    }

    // Update performance metrics
    this.performanceMetrics.objectCount = objectCount;

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      performance: this.performanceMetrics
    };
  }
}

// ===================================================================
// Factory Function
// ===================================================================

export function createCanvasController(appState: IAppState): CanvasController {
  return new CanvasController(appState);
}

// ===================================================================
// Exports
// ===================================================================

export default CanvasController;
export type { ICanvasController };
