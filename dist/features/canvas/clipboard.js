import { isActiveSelectionObject, isRectObject } from "./fabric-types.js";
function resetPastedRectStyling(rect, getColorForClass) {
    rect.originalYolo = null;
    const color = getColorForClass(rect.labelClass);
    rect.set({ fill: `${color}33`, stroke: color });
    rect.setCoords();
}
export function createClipboardManager(deps) {
    let clipboard = null;
    return {
        copy() {
            const activeObject = deps.canvas.getActiveObject();
            if (!activeObject) {
                return;
            }
            activeObject.clone((cloned) => {
                clipboard = cloned;
            }, ["labelClass", "originalYolo"]);
        },
        paste() {
            if (!clipboard) {
                return;
            }
            clipboard.clone((cloned) => {
                deps.canvas.discardActiveObject();
                const imageSize = deps.getCurrentImageSize();
                if (!imageSize) {
                    return;
                }
                const mouse = deps.getLastMousePosition();
                const targetX = Math.min(Math.max(mouse.x, 0), imageSize.width);
                const targetY = Math.min(Math.max(mouse.y, 0), imageSize.height);
                const newObjects = [];
                if (isActiveSelectionObject(cloned)) {
                    const tempGroup = new deps.fabric.ActiveSelection(cloned.getObjects().map((obj) => deps.fabric.util.object.clone(obj)), { canvas: deps.canvas });
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
                    });
                }
                else {
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
                }
                if (newObjects.length === 0) {
                    return;
                }
                const selection = new deps.fabric.ActiveSelection(newObjects, { canvas: deps.canvas });
                deps.canvas.setActiveObject(selection);
                deps.canvas.requestRenderAll();
                deps.updateLabelList();
            }, ["labelClass", "originalYolo"]);
        },
        hasClipboardData() {
            return clipboard !== null;
        }
    };
}
