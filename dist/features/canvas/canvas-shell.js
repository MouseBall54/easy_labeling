import { createCanvasHistoryService } from "./history.js";
import { createCrosshairLines, hideCrosshair, toggleCrosshair, updateCrosshair } from "./crosshair.js";
function applyLegacyFabricDefaults(fabric) {
    const activeSelectionStyle = {
        hasBorders: true,
        borderColor: "#0d6efd",
        cornerColor: "#ffffff",
        cornerStrokeColor: "#0d6efd",
        cornerStyle: "circle",
        transparentCorners: false,
        borderDashArray: [5, 5],
        hasRotatingPoint: false
    };
    fabric.ActiveSelection.prototype.set(activeSelectionStyle);
    fabric.Object.prototype.setControlVisible("mtr", false);
}
export function createCanvasShell(state, deps) {
    applyLegacyFabricDefaults(deps.fabric);
    const canvas = new deps.fabric.Canvas("canvas", {
        width: 800,
        height: 600,
        backgroundColor: "#eee"
    });
    const crosshairState = {
        isCrosshairVisible: state.isCrosshairVisible,
        crosshairX: null,
        crosshairY: null
    };
    const history = deps.historyService ?? createCanvasHistoryService();
    const syncCanvasOffset = () => {
        canvas.calcOffset?.();
    };
    const shell = {
        canvas,
        history,
        getObjects(type) {
            return canvas.getObjects(type);
        },
        getActiveObject() {
            return canvas.getActiveObject();
        },
        getActiveObjects() {
            return canvas.getActiveObjects();
        },
        discardActiveObject() {
            canvas.discardActiveObject();
        },
        setActiveSelection(objects, primaryObject = null) {
            if (objects.length === 0) {
                canvas.discardActiveObject();
                return;
            }
            const orderedObjects = [...objects];
            if (primaryObject) {
                const primaryIndex = orderedObjects.indexOf(primaryObject);
                if (primaryIndex > 0) {
                    const [resolvedPrimary] = orderedObjects.splice(primaryIndex, 1);
                    if (resolvedPrimary) {
                        orderedObjects.unshift(resolvedPrimary);
                    }
                }
            }
            if (orderedObjects.length === 1) {
                const [single] = orderedObjects;
                if (single) {
                    canvas.setActiveObject(single);
                }
                return;
            }
            orderedObjects.forEach((object) => {
                object.setCoords();
            });
            const selection = new deps.fabric.ActiveSelection(orderedObjects, { canvas });
            canvas.setActiveObject(selection);
        },
        renderAll() {
            canvas.renderAll();
        },
        clear() {
            canvas.clear();
            crosshairState.crosshairX = null;
            crosshairState.crosshairY = null;
        },
        setBackgroundImage(image) {
            const containerSize = deps.getCanvasContainerSize();
            canvas.setWidth(containerSize.width);
            canvas.setHeight(containerSize.height);
            const backgroundImage = new deps.fabric.Image(image, {
                originX: "left",
                originY: "top"
            });
            canvas.setBackgroundImage(backgroundImage, this.renderAll.bind(this));
            syncCanvasOffset();
        },
        setMode(mode) {
            state.currentMode = mode;
            canvas.selection = mode === "edit";
            canvas.defaultCursor = mode === "draw" ? "crosshair" : "default";
            this.renderAll();
        },
        setZoomPercentage(percentage) {
            const newZoom = Number.parseFloat(percentage) / 100;
            if (Number.isNaN(newZoom) || newZoom < 0.1 || newZoom > 20) {
                deps.notify("Invalid zoom level. Please enter a value between 10% and 2000%.");
                deps.updateZoomDisplay();
                return;
            }
            const center = canvas.getCenter();
            canvas.zoomToPoint(new deps.fabric.Point(center.left, center.top), newZoom);
            syncCanvasOffset();
            deps.updateZoomDisplay();
        },
        zoom(factor) {
            const center = canvas.getCenter();
            canvas.zoomToPoint(new deps.fabric.Point(center.left, center.top), canvas.getZoom() * factor);
            syncCanvasOffset();
            deps.updateZoomDisplay();
        },
        resetZoom() {
            if (!state.currentImage) {
                return;
            }
            const container = deps.getCanvasContainerSize();
            const scale = Math.min(container.width / state.currentImage.width, container.height / state.currentImage.height) * 0.95;
            canvas.setViewportTransform([
                scale,
                0,
                0,
                scale,
                (container.width - state.currentImage.width * scale) / 2,
                (container.height - state.currentImage.height * scale) / 2
            ]);
            syncCanvasOffset();
            this.renderAll();
            deps.updateZoomDisplay();
        },
        resizeCanvas() {
            const container = deps.getCanvasContainerSize();
            canvas.setWidth(container.width);
            canvas.setHeight(container.height);
            syncCanvasOffset();
        },
        goToCoords(x, y) {
            if (!state.currentImage) {
                deps.notify("Please load an image first.");
                return;
            }
            if (Number.isNaN(x) || Number.isNaN(y)) {
                deps.notify("Please enter valid X and Y coordinates.");
                return;
            }
            const zoomLevel = canvas.getZoom();
            const newX = -x * zoomLevel + canvas.getWidth() / 2;
            const newY = -y * zoomLevel + canvas.getHeight() / 2;
            canvas.setViewportTransform([zoomLevel, 0, 0, zoomLevel, newX, newY]);
            syncCanvasOffset();
            this.renderAll();
            this.highlightPoint(x, y);
        },
        highlightPoint(x, y) {
            const zoomLevel = canvas.getZoom();
            const highlightCircle = new deps.fabric.Circle({
                left: x,
                top: y,
                radius: 0,
                fill: "transparent",
                stroke: "yellow",
                strokeWidth: 3 / zoomLevel,
                originX: "center",
                originY: "center",
                selectable: false,
                evented: false
            });
            canvas.add(highlightCircle);
            highlightCircle.animate("radius", 50 / zoomLevel, {
                onChange: this.renderAll.bind(this),
                duration: 500,
                easing: deps.fabric.util.ease.easeOutQuad,
                onComplete: () => {
                    highlightCircle.animate("opacity", 0, {
                        onChange: this.renderAll.bind(this),
                        duration: 300,
                        onComplete: () => canvas.remove(highlightCircle)
                    });
                }
            });
        },
        createCrosshairLines() {
            createCrosshairLines(deps.fabric, canvas, crosshairState);
        },
        toggleCrosshair(visible) {
            state.isCrosshairVisible = visible;
            toggleCrosshair(deps.fabric, canvas, crosshairState, visible);
        },
        updateCrosshair(pointer) {
            updateCrosshair(canvas, crosshairState, pointer);
        },
        hideCrosshair() {
            hideCrosshair(canvas, crosshairState);
        }
    };
    return shell;
}
