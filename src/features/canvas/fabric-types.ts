import type { CanvasPoint } from "../../types/labels.js";

export interface YoloMetadata {
  x_center: string | undefined;
  y_center: string | undefined;
  width: string | undefined;
  height: string | undefined;
}

export interface FabricAnimationOptions {
  onChange?: () => void;
  duration?: number;
  easing?: (value: number) => number;
  onComplete?: () => void;
}

export interface FabricSettable {
  set(key: string | Record<string, unknown>, value?: unknown): void;
}

export interface FabricObjectLike extends FabricSettable {
  type: string;
  annotationId?: string;
  left: number;
  top: number;
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeDashArray?: number[];
  shadow?: unknown;
  opacity?: number;
  selectable?: boolean;
  evented?: boolean;
  hoverCursor?: string;
  visible?: boolean;
  scaleX?: number;
  scaleY?: number;
  originX?: string;
  originY?: string;
  labelClass?: string;
  layoutInstanceId?: string;
  layoutBoxId?: string;
  originalYolo?: YoloMetadata | null;
  _labelText?: FabricTextLike | null;
  setCoords(): void;
  setControlVisible(controlName: string, visible: boolean): void;
  getCenterPoint(): CanvasPoint;
  getScaledWidth(): number;
  getScaledHeight(): number;
  getBoundingRect(absolute?: boolean): { left: number; top: number; width: number; height: number };
  clone(propertiesToInclude?: string[]): Promise<FabricObjectLike>;
  group?: {
    left: number;
    top: number;
    width: number;
    height: number;
  } | null;
}

export interface FabricRectLike extends FabricObjectLike {
  type: "rect";
}

let fallbackAnnotationIdCounter = 0;

export function createAnnotationId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  fallbackAnnotationIdCounter += 1;
  return `annotation-${fallbackAnnotationIdCounter}`;
}

export function ensureAnnotationId(rect: FabricRectLike): string {
  const existing = rect.annotationId;
  if (typeof existing === "string" && existing.trim().length > 0) {
    return existing;
  }

  const annotationId = createAnnotationId();
  rect.annotationId = annotationId;
  return annotationId;
}

export function assignFreshAnnotationId(rect: FabricRectLike): string {
  const annotationId = createAnnotationId();
  rect.annotationId = annotationId;
  return annotationId;
}

export interface FabricTextLike extends FabricObjectLike {
  type: "text";
  text: string;
  _isLabelText?: boolean;
  _rect?: FabricRectLike;
}

export interface FabricLineLike extends FabricObjectLike {
  type: "line";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface FabricCircleLike extends FabricObjectLike {
  type: "circle";
  radius: number;
  opacity?: number;
  animate(property: string, value: number, options: FabricAnimationOptions): void;
}

export interface FabricActiveSelectionLike extends FabricObjectLike {
  type: "activeSelection";
  getObjects(type?: string): FabricObjectLike[];
  forEachObject(callback: (obj: FabricObjectLike) => void): void;
}

export interface FabricCanvasLike {
  width: number;
  height: number;
  viewportTransform: [number, number, number, number, number, number];
  selection: boolean;
  defaultCursor: string;
  isDragging?: boolean;
  lastPosX?: number;
  lastPosY?: number;
  _currentTransform?: unknown;
  upperCanvasEl?: {
    addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
  };
  add(...objects: FabricObjectLike[]): void;
  insertAt?(index: number, ...objects: FabricObjectLike[]): void;
  remove(object: FabricObjectLike): void;
  clear(): void;
  getObjects(type?: string): FabricObjectLike[];
  getActiveObject(): FabricObjectLike | null;
  getActiveObjects(): FabricObjectLike[];
  setActiveObject(object: FabricObjectLike): void;
  discardActiveObject(): FabricCanvasLike;
  renderAll(): void;
  requestRenderAll(): void;
  calcOffset?(): void;
  setDimensions(dimensions: { width: number; height: number }): void;
  backgroundImage?: unknown;
  getCenter(): { left: number; top: number };
  zoomToPoint(point: { x: number; y: number }, zoom: number): void;
  getZoom(): number;
  setZoom(zoom: number): void;
  getWidth(): number;
  getHeight(): number;
  setViewportTransform(transform: [number, number, number, number, number, number]): void;
  on?(eventName: string, handler: (event: { e: MouseEvent | WheelEvent; target?: FabricObjectLike | null }) => void): void;
  getScenePoint?(event: MouseEvent | WheelEvent): { x: number; y: number };
  getViewportPoint?(event: MouseEvent | WheelEvent): { x: number; y: number };
  getPointer?(event: MouseEvent | WheelEvent): { x: number; y: number };
  findTarget?(event: Event, skipGroup?: boolean): FabricObjectLike | null;
}

export interface FabricImageLike extends FabricObjectLike {
  type: "image";
  element?: unknown;
  _isBaseImage?: boolean;
  _isSegmentationOverlay?: boolean;
  setElement?(element: unknown): void;
}

export interface FabricRuntimeLike {
  Canvas: new (
    elementId: string,
    options: { width: number; height: number; backgroundColor: string }
  ) => FabricCanvasLike;
  Rect: new (options: Record<string, unknown>) => FabricRectLike;
  Image: new (element: unknown, options?: Record<string, unknown>) => FabricImageLike;
  Text: new (text: string, options: Record<string, unknown>) => FabricTextLike;
  Circle: new (options: Record<string, unknown>) => FabricCircleLike;
  Line: new (points: [number, number, number, number], options: Record<string, unknown>) => FabricLineLike;
  ActiveSelection: {
    new (objects: FabricObjectLike[], options: { canvas: FabricCanvasLike }): FabricActiveSelectionLike;
    prototype: {
      set(options: Record<string, unknown>): void;
    };
  };
  Point: new (x: number, y: number) => { x: number; y: number };
  util: {
    ease: {
      easeOutQuad: (value: number) => number;
    };
  };
  Object: {
    prototype: {
      setControlVisible(controlName: string, visible: boolean): void;
    };
  };
}

export interface CanvasImageLike {
  width: number;
  height: number;
}

function normalizeFabricType(object: { type?: string }): string {
  return object.type?.toLowerCase() ?? "";
}

export function isRectObject(object: FabricObjectLike): object is FabricRectLike {
  return normalizeFabricType(object) === "rect";
}

export function isActiveSelectionObject(object: FabricObjectLike): object is FabricActiveSelectionLike {
  return normalizeFabricType(object) === "activeselection";
}
