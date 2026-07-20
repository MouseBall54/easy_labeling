import type { FabricActiveSelectionLike, FabricAnimationOptions, FabricCanvasLike, FabricCircleLike, FabricImageLike, FabricLineLike, FabricObjectLike, FabricRectLike, FabricRuntimeLike, FabricTextLike, YoloMetadata } from "../../../../src/features/canvas/fabric-types.js";

type KnownFabricProperty = keyof FabricObjectLike | "text" | "x1" | "y1" | "x2" | "y2" | "radius" | "opacity" | "element" | "overlayPixels" | "overlayVisible" | "overlayOpacity" | "_isBaseImage" | "_isSegmentationOverlay";

function cloneMetadata(metadata: YoloMetadata | null | undefined): YoloMetadata | null | undefined {
  if (metadata === null || metadata === undefined) {
    return metadata;
  }

  return {
    x_center: metadata.x_center,
    y_center: metadata.y_center,
    width: metadata.width,
    height: metadata.height
  };
}

abstract class FakeFabricObject<TType extends string> implements FabricObjectLike {
  public selectable = true;
  public evented = true;
  public hoverCursor = "move";
  public visible = true;
  public originX = "left";
  public originY = "top";
  public fill: string | undefined;
  public stroke: string | undefined;
  public strokeWidth = 0;
  public strokeDashArray: number[] = [];
  public shadow: unknown = null;
  public opacity = 1;
  public scaleX = 1;
  public scaleY = 1;
  public labelClass: string | undefined;
  public annotationId: string | undefined;
  public layoutInstanceId: string | undefined;
  public layoutBoxId: string | undefined;
  public originalYolo: YoloMetadata | null | undefined;
  public _labelText: FabricTextLike | null | undefined;
  public group: { left: number; top: number; width: number; height: number } | null = null;
  public controls = new Map<string, boolean>();

  constructor(public readonly type: TType, public left: number, public top: number, public width: number, public height: number) {}

  set(key: string | Record<string, unknown>, value?: unknown): void {
    const mutable = this as unknown as Record<KnownFabricProperty, unknown>;
    if (typeof key === "string") {
      mutable[key as KnownFabricProperty] = value;
      return;
    }

    Object.entries(key).forEach(([entryKey, entryValue]) => {
      mutable[entryKey as KnownFabricProperty] = entryValue;
    });
  }

  setCoords(): void {
    return;
  }

  setControlVisible(controlName: string, visible: boolean): void {
    this.controls.set(controlName, visible);
  }

  getCenterPoint(): { x: number; y: number } {
    return {
      x: this.left + this.width / 2,
      y: this.top + this.height / 2
    };
  }

  getScaledWidth(): number {
    return this.width * this.scaleX;
  }

  getScaledHeight(): number {
    return this.height * this.scaleY;
  }

  getBoundingRect(): { left: number; top: number; width: number; height: number } {
    return {
      left: this.left,
      top: this.top,
      width: this.getScaledWidth(),
      height: this.getScaledHeight()
    };
  }

  async clone(): Promise<FabricObjectLike> {
    return this.cloneSelf();
  }

  cloneForTest(): FabricObjectLike {
    return this.cloneSelf();
  }

  protected copyCommonTo(target: FakeFabricObject<string>): void {
    target.selectable = this.selectable;
    target.evented = this.evented;
    target.hoverCursor = this.hoverCursor;
    target.visible = this.visible;
    target.originX = this.originX;
    target.originY = this.originY;
    target.fill = this.fill;
    target.stroke = this.stroke;
    target.strokeWidth = this.strokeWidth;
    target.strokeDashArray = [...this.strokeDashArray];
    target.shadow = this.shadow;
    target.opacity = this.opacity;
    target.scaleX = this.scaleX;
    target.scaleY = this.scaleY;
    target.labelClass = this.labelClass;
    target.annotationId = this.annotationId;
    target.layoutInstanceId = this.layoutInstanceId;
    target.layoutBoxId = this.layoutBoxId;
    target.originalYolo = cloneMetadata(this.originalYolo);
  }

  protected abstract cloneSelf(): FabricObjectLike;
}

export class FakeFabricRect extends FakeFabricObject<"rect"> implements FabricRectLike {
  constructor(options: Record<string, unknown>) {
    super(
      "rect",
      Number(options.left ?? 0),
      Number(options.top ?? 0),
      Number(options.width ?? 0),
      Number(options.height ?? 0)
    );
    this.fill = options.fill as string | undefined;
    this.stroke = options.stroke as string | undefined;
    this.strokeWidth = Number(options.strokeWidth ?? 0);
    this.selectable = Boolean(options.selectable ?? true);
    this.hoverCursor = String(options.hoverCursor ?? "move");
    this.labelClass = options.labelClass as string | undefined;
    this.annotationId = options.annotationId as string | undefined;
    this.layoutInstanceId = options.layoutInstanceId as string | undefined;
    this.layoutBoxId = options.layoutBoxId as string | undefined;
    this.originalYolo = Object.hasOwn(options, "originalYolo")
      ? options.originalYolo as YoloMetadata | null | undefined
      : undefined;
  }

  protected cloneSelf(): FabricObjectLike {
    const clone = new FakeFabricRect({
      left: this.left,
      top: this.top,
      width: this.width,
      height: this.height,
      fill: this.fill,
      stroke: this.stroke,
      strokeWidth: this.strokeWidth,
      selectable: this.selectable,
      hoverCursor: this.hoverCursor,
      annotationId: this.annotationId,
      labelClass: this.labelClass,
      originalYolo: cloneMetadata(this.originalYolo)
    });
    this.copyCommonTo(clone);
    return clone;
  }
}

class FakeFabricText extends FakeFabricObject<"text"> implements FabricTextLike {
  public _isLabelText = false;
  public _rect: FabricRectLike | undefined;
  public _labelLayoutVisible = false;
  public _labelRepresentation: "full" | "compact" | "hidden" = "hidden";

  constructor(public text: string, options: Record<string, unknown>) {
    super("text", Number(options.left ?? 0), Number(options.top ?? 0), 0, 0);
    this.fill = options.fill as string | undefined;
    this._isLabelText = Boolean(options._isLabelText ?? false);
    this._rect = options._rect as FabricRectLike | undefined;
    this._labelLayoutVisible = Boolean(options._labelLayoutVisible ?? false);
    this._labelRepresentation = (options._labelRepresentation as typeof this._labelRepresentation | undefined) ?? "hidden";
    this.visible = Boolean(options.visible ?? true);
    this.originX = String(options.originX ?? "left");
    this.originY = String(options.originY ?? "top");
  }

  protected cloneSelf(): FabricObjectLike {
    const clone = new FakeFabricText(this.text, {
      left: this.left,
      top: this.top,
      fill: this.fill,
      _isLabelText: this._isLabelText,
      _rect: this._rect
    });
    this.copyCommonTo(clone);
    return clone;
  }
}

class FakeFabricLine extends FakeFabricObject<"line"> implements FabricLineLike {
  public x1: number;
  public y1: number;
  public x2: number;
  public y2: number;

  constructor(points: [number, number, number, number], options: Record<string, unknown>) {
    super("line", 0, 0, 0, 0);
    this.x1 = points[0];
    this.y1 = points[1];
    this.x2 = points[2];
    this.y2 = points[3];
    this.stroke = options.stroke as string | undefined;
    this.strokeWidth = Number(options.strokeWidth ?? 0);
    this.selectable = Boolean(options.selectable ?? false);
    this.visible = true;
  }

  protected cloneSelf(): FabricObjectLike {
    const clone = new FakeFabricLine([this.x1, this.y1, this.x2, this.y2], {
      stroke: this.stroke,
      strokeWidth: this.strokeWidth,
      selectable: this.selectable
    });
    this.copyCommonTo(clone);
    return clone;
  }
}

class FakeFabricCircle extends FakeFabricObject<"circle"> implements FabricCircleLike {
  public radius: number;
  public opacity = 1;

  constructor(options: Record<string, unknown>) {
    super("circle", Number(options.left ?? 0), Number(options.top ?? 0), 0, 0);
    this.radius = Number(options.radius ?? 0);
    this.stroke = options.stroke as string | undefined;
    this.fill = options.fill as string | undefined;
    this.strokeWidth = Number(options.strokeWidth ?? 0);
    this.opacity = Number(options.opacity ?? 1);
    this.shadow = options.shadow;
    this.selectable = Boolean(options.selectable ?? false);
    this.evented = Boolean(options.evented ?? false);
  }

  animate(properties: Record<string, number>, options: FabricAnimationOptions): void {
    const mutable = this as unknown as Record<KnownFabricProperty, unknown>;
    Object.entries(properties).forEach(([property, value]) => {
      mutable[property as KnownFabricProperty] = value;
    });
    options.onChange?.();
    options.onComplete?.();
  }

  protected cloneSelf(): FabricObjectLike {
    const clone = new FakeFabricCircle({
      left: this.left,
      top: this.top,
      radius: this.radius,
      stroke: this.stroke,
      fill: this.fill
    });
    clone.opacity = this.opacity;
    this.copyCommonTo(clone);
    return clone;
  }
}

class FakeFabricImage extends FakeFabricObject<"image"> implements FabricImageLike {
  public element: unknown;
  public _isBaseImage = false;
  public _isSegmentationOverlay = false;

  constructor(element: unknown, options: Record<string, unknown> = {}) {
    super("image", Number(options.left ?? 0), Number(options.top ?? 0), Number(options.width ?? 0), Number(options.height ?? 0));
    this.element = element;
    this.selectable = Boolean(options.selectable ?? true);
    this.evented = Boolean(options.evented ?? true);
    this.hoverCursor = String(options.hoverCursor ?? "move");
    this.originX = String(options.originX ?? "left");
    this.originY = String(options.originY ?? "top");
  }

  protected cloneSelf(): FabricObjectLike {
    const clone = new FakeFabricImage(this.element, {
      left: this.left,
      top: this.top,
      width: this.width,
      height: this.height
    });
    this.copyCommonTo(clone);
    return clone;
  }

  setElement(element: unknown): void {
    this.element = element;
  }
}

class FakeActiveSelection extends FakeFabricObject<"activeSelection"> implements FabricActiveSelectionLike {
  constructor(private readonly objects: FabricObjectLike[], options: { canvas: FabricCanvasLike }) {
    super("activeSelection", 0, 0, 0, 0);
    void options;
  }

  getObjects(type?: string): FabricObjectLike[] {
    if (!type) {
      return [...this.objects];
    }
    return this.objects.filter((obj) => obj.type === type);
  }

  forEachObject(callback: (obj: FabricObjectLike) => void): void {
    this.objects.forEach((obj) => {
      callback(obj);
    });
  }

  override getBoundingRect(): { left: number; top: number; width: number; height: number } {
    if (this.objects.length === 0) {
      return { left: 0, top: 0, width: 0, height: 0 };
    }

    const left = Math.min(...this.objects.map((obj) => obj.left));
    const top = Math.min(...this.objects.map((obj) => obj.top));
    const right = Math.max(...this.objects.map((obj) => obj.left + obj.width));
    const bottom = Math.max(...this.objects.map((obj) => obj.top + obj.height));

    return {
      left,
      top,
      width: right - left,
      height: bottom - top
    };
  }

  protected cloneSelf(): FabricObjectLike {
    const clonedObjects = this.objects.map((obj) => cloneFabricObjectSync(obj));
    const clone = new FakeActiveSelection(clonedObjects, { canvas: new FakeCanvas("canvas", { width: 1, height: 1, backgroundColor: "#eee" }) });
    this.copyCommonTo(clone);
    return clone;
  }
}

export class FakeCanvas implements FabricCanvasLike {
  public viewportTransform: [number, number, number, number, number, number] = [1, 0, 0, 1, 0, 0];
  public selection = true;
  public defaultCursor = "default";
  public isDragging = false;
  public _currentTransform: unknown = null;
  public lastPosX = 0;
  public lastPosY = 0;
  public upperCanvasEl = {
    addEventListener: (_type: string, _listener: EventListenerOrEventListenerObject): void => {
      void _type;
      void _listener;
    }
  };
  public renderAllCalls = 0;
  public requestRenderAllCalls = 0;
  public calcOffsetCalls = 0;
  public objects: FabricObjectLike[] = [];
  public removedObjects: FabricObjectLike[] = [];
  public activeObject: FabricObjectLike | null = null;
  public backgroundImage: unknown = null;
  private zoom = 1;
  private readonly handlers = new Map<string, Array<(event: { e: MouseEvent | WheelEvent; target?: FabricObjectLike | null }) => void>>();

  constructor(elementId: string, options: { width: number; height: number; backgroundColor: string }) {
    void elementId;
    void options.backgroundColor;
    this.width = options.width;
    this.height = options.height;
  }

  public width: number;
  public height: number;

  add(...objects: FabricObjectLike[]): void {
    this.objects.push(...objects);
  }

  insertAt(index: number, ...objects: FabricObjectLike[]): void {
    this.objects.splice(index, 0, ...objects);
  }

  remove(object: FabricObjectLike): void {
    this.removedObjects.push(object);
    this.objects = this.objects.filter((candidate) => candidate !== object);
    if (this.activeObject === object) {
      this.activeObject = null;
    }
  }

  clear(): void {
    this.objects = [];
    this.activeObject = null;
  }

  getObjects(type?: string): FabricObjectLike[] {
    if (!type) {
      return [...this.objects];
    }
    return this.objects.filter((obj) => obj.type === type);
  }

  getActiveObject(): FabricObjectLike | null {
    return this.activeObject;
  }

  getActiveObjects(): FabricObjectLike[] {
    if (!this.activeObject) {
      return [];
    }
    return [this.activeObject];
  }

  setActiveObject(object: FabricObjectLike): void {
    this.activeObject = object;
  }

  discardActiveObject(): FabricCanvasLike {
    this.activeObject = null;
    return this;
  }

  renderAll(): void {
    this.renderAllCalls += 1;
  }

  requestRenderAll(): void {
    this.requestRenderAllCalls += 1;
    this.renderAll();
  }

  calcOffset(): void {
    this.calcOffsetCalls += 1;
  }

  setDimensions(dimensions: { width: number; height: number }): void {
    this.width = dimensions.width;
    this.height = dimensions.height;
  }

  getCenter(): { left: number; top: number } {
    return { left: this.width / 2, top: this.height / 2 };
  }

  zoomToPoint(point: { x: number; y: number }, zoom: number): void {
    void point;
    this.zoom = zoom;
  }

  getZoom(): number {
    return this.zoom;
  }

  setZoom(zoom: number): void {
    this.zoom = zoom;
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  setViewportTransform(transform: [number, number, number, number, number, number]): void {
    this.viewportTransform = transform;
  }

  on(eventName: string, handler: (event: { e: MouseEvent | WheelEvent; target?: FabricObjectLike | null }) => void): void {
    const existing = this.handlers.get(eventName) ?? [];
    existing.push(handler);
    this.handlers.set(eventName, existing);
  }

  getPointer(event: MouseEvent | WheelEvent): { x: number; y: number } {
    return {
      x: "offsetX" in event ? event.offsetX : 0,
      y: "offsetY" in event ? event.offsetY : 0
    };
  }

  findTarget(_event: Event): FabricObjectLike | null {
    return this.activeObject;
  }
}

function cloneFabricObjectSync<T extends FabricObjectLike>(object: T): T {
  if (!(object instanceof FakeFabricObject)) {
    throw new Error("fake fabric object expected");
  }

  return object.cloneForTest() as T;
}

export function createFakeFabricRuntime(): FabricRuntimeLike {
  return {
    Canvas: FakeCanvas,
    Rect: FakeFabricRect,
    Image: FakeFabricImage,
    Text: FakeFabricText,
    Circle: FakeFabricCircle,
    Line: FakeFabricLine,
    ActiveSelection: FakeActiveSelection as FabricRuntimeLike["ActiveSelection"],
    Point: class {
      constructor(public x: number, public y: number) {}
    },
    util: {
      ease: {
        easeOutQuad: (value: number): number => value
      }
    },
    Object: {
      prototype: {
        setControlVisible(controlName: string, visible: boolean): void {
          void controlName;
          void visible;
        }
      }
    }
  };
}

export function createRect(options: {
  left: number;
  top: number;
  width: number;
  height: number;
  labelClass?: string;
  originalYolo?: YoloMetadata | null;
}): FakeFabricRect {
  return new FakeFabricRect({
    left: options.left,
    top: options.top,
    width: options.width,
    height: options.height,
    labelClass: options.labelClass,
    originalYolo: options.originalYolo,
    stroke: "#123456",
    fill: "#12345633"
  });
}
