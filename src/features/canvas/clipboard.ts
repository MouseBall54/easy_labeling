import type { CanvasPoint } from "../../types/labels.js";
import { assignFreshAnnotationId, isActiveSelectionObject, isRectObject, type FabricCanvasLike, type FabricObjectLike, type FabricRectLike, type FabricRuntimeLike } from "./fabric-types.js";
import type { CanvasBulkOperationOptions } from "./canvas-controller-types.js";

export interface ClipboardDeps {
  fabric: FabricRuntimeLike;
  canvas: FabricCanvasLike;
  getColorForClass(labelClass: string | undefined): string;
  drawLabelText(rect: FabricRectLike): void;
  updateLabelList(): void;
  getLastMousePosition(): CanvasPoint;
  getCurrentImageSize(): { width: number; height: number } | null;
}

export interface ClipboardManager {
  copy(options?: CanvasBulkOperationOptions): Promise<void>;
  paste(): Promise<FabricRectLike[]>;
  paste(options?: CanvasBulkOperationOptions): Promise<FabricRectLike[]>;
  getItemCount(): number;
  hasClipboardData(): boolean;
}

function resetPastedRectStyling(rect: FabricRectLike, getColorForClass: (labelClass: string | undefined) => string): void {
  assignFreshAnnotationId(rect);
  rect.originalYolo = null;
  const color = getColorForClass(rect.labelClass);
  rect.set({ fill: `${color}33`, stroke: color });
  rect.setCoords();
}

async function cloneFabricObject<T extends FabricObjectLike>(object: T, propertiesToInclude: string[]): Promise<T> {
  return (await object.clone(propertiesToInclude)) as T;
}

function throwIfAborted(signal: AbortSignal | undefined): void {
  if (signal?.aborted) {
    throw signal.reason instanceof Error ? signal.reason : new DOMException("Operation stopped", "AbortError");
  }
}

function yieldToUi(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof globalThis.requestAnimationFrame === "function") {
      globalThis.requestAnimationFrame(() => resolve());
      return;
    }
    globalThis.setTimeout(resolve, 0);
  });
}

export function createClipboardManager(deps: ClipboardDeps): ClipboardManager {
  let clipboard: FabricObjectLike | null = null;

  return {
    async copy(options: CanvasBulkOperationOptions = {}): Promise<void> {
      const activeObject = deps.canvas.getActiveObject();
      if (!activeObject) {
        return;
      }

      throwIfAborted(options.signal);
      const copiedObject = await cloneFabricObject(activeObject, ["labelClass", "originalYolo"]);
      throwIfAborted(options.signal);
      clipboard = copiedObject;
    },

    async paste(options: CanvasBulkOperationOptions = {}): Promise<FabricRectLike[]> {
      if (!clipboard) {
        return [];
      }

      const pastedRects: FabricRectLike[] = [];

      throwIfAborted(options.signal);
      const activeObjectBeforePaste = deps.canvas.getActiveObject();
      const cloned = await cloneFabricObject(clipboard, ["labelClass", "originalYolo"]);
      deps.canvas.discardActiveObject();

      const imageSize = deps.getCurrentImageSize();
      if (!imageSize) {
        return [];
      }

      const mouse = deps.getLastMousePosition();
      const targetX = Math.min(Math.max(mouse.x, 0), imageSize.width);
      const targetY = Math.min(Math.max(mouse.y, 0), imageSize.height);
      const newObjects: FabricRectLike[] = [];

      const addObjectsInBatches = async (objects: FabricRectLike[]): Promise<void> => {
        const chunkSize = Math.max(25, options.chunkSize ?? 100);
        const canvasWithBatchRendering = deps.canvas as FabricCanvasLike & { renderOnAddRemove?: boolean };
        const previousRenderOnAddRemove = canvasWithBatchRendering.renderOnAddRemove;
        canvasWithBatchRendering.renderOnAddRemove = false;
        try {
          for (let start = 0; start < objects.length; start += chunkSize) {
            throwIfAborted(options.signal);
            const chunk = objects.slice(start, start + chunkSize);
            deps.canvas.add(...chunk);
            if (!options.deferLabels) {
              chunk.forEach((object) => {
                deps.drawLabelText(object);
              });
            }
            const current = Math.min(objects.length, start + chunk.length);
            options.onProgress?.({ detail: "Creating boxes", current, total: objects.length });
            if (current < objects.length) {
              await yieldToUi();
            }
          }
        } catch (error) {
          objects.forEach((object) => {
            if (object._labelText) {
              deps.canvas.remove(object._labelText);
            }
            deps.canvas.remove(object);
          });
          if (activeObjectBeforePaste) {
            deps.canvas.setActiveObject(activeObjectBeforePaste);
          }
          deps.canvas.requestRenderAll();
          throw error;
        } finally {
          canvasWithBatchRendering.renderOnAddRemove = previousRenderOnAddRemove;
        }
      };

      if (isActiveSelectionObject(cloned)) {
        const copiedRects = cloned.getObjects().filter(isRectObject);
        if (copiedRects.length === 0) {
          return [];
        }
        const rectBounds = copiedRects.map((object) => object.getBoundingRect(true));
        const left = Math.min(...rectBounds.map((bounds) => bounds.left));
        const top = Math.min(...rectBounds.map((bounds) => bounds.top));
        const right = Math.max(...rectBounds.map((bounds) => bounds.left + bounds.width));
        const bottom = Math.max(...rectBounds.map((bounds) => bounds.top + bounds.height));
        const bounds = { left, top, width: right - left, height: bottom - top };
        const offsetX = targetX - (bounds.left + bounds.width / 2);
        const offsetY = targetY - (bounds.top + bounds.height / 2);

        copiedRects.forEach((obj) => {
          obj.left += offsetX;
          obj.top += offsetY;
          obj.group = null;
          resetPastedRectStyling(obj, deps.getColorForClass);
          newObjects.push(obj);
          pastedRects.push(obj);
        });
      } else if (isRectObject(cloned)) {
        const center = cloned.getCenterPoint();
        cloned.left += targetX - center.x;
        cloned.top += targetY - center.y;
        resetPastedRectStyling(cloned, deps.getColorForClass);
        newObjects.push(cloned);
        pastedRects.push(cloned);
      }

      if (newObjects.length === 0) {
        return [];
      }

      await addObjectsInBatches(newObjects);
      throwIfAborted(options.signal);

      // Fabric rebuilds every member's coordinates while constructing an
      // ActiveSelection. That is disproportionately expensive for thousands
      // of rectangles, so retain normal selection behavior only while it is
      // still practical to manipulate as one object.
      if (newObjects.length <= 250) {
        const selection = new deps.fabric.ActiveSelection(newObjects, { canvas: deps.canvas });
        deps.canvas.setActiveObject(selection);
      }
      options.onProgress?.({ detail: "Rendering pasted boxes", current: newObjects.length, total: newObjects.length });
      if (!options.deferRender) {
        deps.canvas.requestRenderAll();
      }
      deps.updateLabelList();

      return pastedRects;
    },

    hasClipboardData(): boolean {
      return clipboard !== null;
    },

    getItemCount(): number {
      if (!clipboard) {
        return 0;
      }
      return isActiveSelectionObject(clipboard)
        ? clipboard.getObjects().filter(isRectObject).length
        : isRectObject(clipboard) ? 1 : 0;
    }
  };
}
