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
  copy(): void;
  paste(): FabricRectLike[];
  hasClipboardData(): boolean;
}

function resetPastedRectStyling(rect: FabricRectLike, getColorForClass: (labelClass: string | undefined) => string): void {
  assignFreshAnnotationId(rect);
  rect.originalYolo = null;
  const color = getColorForClass(rect.labelClass);
  rect.set({ fill: `${color}33`, stroke: color });
  rect.setCoords();
}

export function createClipboardManager(deps: ClipboardDeps): ClipboardManager {
  let clipboard: FabricObjectLike | null = null;

  return {
    copy(): void {
      const activeObject = deps.canvas.getActiveObject();
      if (!activeObject) {
        return;
      }

      activeObject.clone(
        (cloned) => {
          clipboard = cloned;
        },
        ["labelClass", "originalYolo"]
      );
    },

    paste(): FabricRectLike[] {
      if (!clipboard) {
        return [];
      }

      const pastedRects: FabricRectLike[] = [];

      clipboard.clone(
        (cloned) => {
          deps.canvas.discardActiveObject();

          const imageSize = deps.getCurrentImageSize();
          if (!imageSize) {
            return;
          }

          const mouse = deps.getLastMousePosition();
          const targetX = Math.min(Math.max(mouse.x, 0), imageSize.width);
          const targetY = Math.min(Math.max(mouse.y, 0), imageSize.height);
          const newObjects: FabricRectLike[] = [];

          if (isActiveSelectionObject(cloned)) {
            const tempGroup = new deps.fabric.ActiveSelection(
              cloned.getObjects().map((obj) => deps.fabric.util.object.clone(obj)),
              { canvas: deps.canvas }
            );
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
          } else {
            const clonedObject = deps.fabric.util.object.clone(cloned);
            if (!isRectObject(clonedObject)) {
              return;
            }

            const center = clonedObject.getCenterPoint();
            clonedObject.left += targetX - center.x;
            clonedObject.top += targetY - center.y;
            resetPastedRectStyling(clonedObject, deps.getColorForClass);
            deps.canvas.add(clonedObject);
            deps.drawLabelText(clonedObject);
            newObjects.push(clonedObject);
            pastedRects.push(clonedObject);
          }

          if (newObjects.length === 0) {
            return;
          }

          const selection = new deps.fabric.ActiveSelection(newObjects, { canvas: deps.canvas });
          deps.canvas.setActiveObject(selection);
          deps.canvas.requestRenderAll();
          deps.updateLabelList();
        },
        ["labelClass", "originalYolo"]
      );

      return pastedRects;
    },

    hasClipboardData(): boolean {
      return clipboard !== null;
    }
  };
}
