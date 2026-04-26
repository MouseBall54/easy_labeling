import type { CanvasPoint } from "../../types/labels.js";
import { assignFreshAnnotationId, isActiveSelectionObject, isRectObject, type FabricCanvasLike, type FabricObjectLike, type FabricRectLike, type FabricRuntimeLike } from "./fabric-types.js";

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
  copy(): Promise<void>;
  paste(): Promise<FabricRectLike[]>;
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

export function createClipboardManager(deps: ClipboardDeps): ClipboardManager {
  let clipboard: FabricObjectLike | null = null;

  return {
    async copy(): Promise<void> {
      const activeObject = deps.canvas.getActiveObject();
      if (!activeObject) {
        return;
      }

      clipboard = await cloneFabricObject(activeObject, ["labelClass", "originalYolo"]);
    },

    async paste(): Promise<FabricRectLike[]> {
      if (!clipboard) {
        return [];
      }

      const pastedRects: FabricRectLike[] = [];

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

      if (isActiveSelectionObject(cloned)) {
        const tempGroup = new deps.fabric.ActiveSelection(cloned.getObjects(), { canvas: deps.canvas });
        const bounds = tempGroup.getBoundingRect(true);
        const offsetX = targetX - (bounds.left + bounds.width / 2);
        const offsetY = targetY - (bounds.top + bounds.height / 2);

        tempGroup.getObjects().forEach((obj) => {
          if (!isRectObject(obj)) {
            return;
          }

          obj.left += offsetX;
          obj.top += offsetY;
          resetPastedRectStyling(obj, deps.getColorForClass);
          deps.canvas.add(obj);
          deps.drawLabelText(obj);
          newObjects.push(obj);
          pastedRects.push(obj);
        });
      } else if (isRectObject(cloned)) {
        const center = cloned.getCenterPoint();
        cloned.left += targetX - center.x;
        cloned.top += targetY - center.y;
        resetPastedRectStyling(cloned, deps.getColorForClass);
        deps.canvas.add(cloned);
        deps.drawLabelText(cloned);
        newObjects.push(cloned);
        pastedRects.push(cloned);
      }

      if (newObjects.length === 0) {
        return [];
      }

      const selection = new deps.fabric.ActiveSelection(newObjects, { canvas: deps.canvas });
      deps.canvas.setActiveObject(selection);
      deps.canvas.requestRenderAll();
      deps.updateLabelList();

      return pastedRects;
    },

    hasClipboardData(): boolean {
      return clipboard !== null;
    }
  };
}
