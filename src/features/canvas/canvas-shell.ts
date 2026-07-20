import type { AppMode, CanvasPoint } from "../../types/labels.js";
import { createCanvasHistoryService } from "./history.js";
import { createCrosshairLines, hideCrosshair, toggleCrosshair, updateCrosshair, type CrosshairState } from "./crosshair.js";
import type {
  FabricCanvasLike,
  FabricCircleLike,
  FabricObjectLike,
  FabricRuntimeLike
} from "./fabric-types.js";
import type { CanvasControllerDeps, CanvasControllerState, CanvasShell } from "./canvas-controller-types.js";

function applyLegacyFabricDefaults(fabric: FabricRuntimeLike): void {
  const activeSelectionStyle: Record<string, unknown> = {
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

export function createCanvasShell(state: CanvasControllerState, deps: Pick<CanvasControllerDeps, "fabric" | "getCanvasContainerSize" | "updateZoomDisplay" | "notify" | "historyService">): CanvasShell {
  applyLegacyFabricDefaults(deps.fabric);

  const canvas = new deps.fabric.Canvas("canvas", {
    width: 800,
    height: 600,
    backgroundColor: "#eee"
  });

  const crosshairState: CrosshairState = {
    isCrosshairVisible: state.isCrosshairVisible,
    crosshairX: null,
    crosshairY: null
  };

  const history = deps.historyService ?? createCanvasHistoryService();
  let baseImageObject: FabricObjectLike | null = null;
  let coordinateHighlightObjects: FabricObjectLike[] = [];
  let coordinateHighlightTimer: ReturnType<typeof globalThis.setTimeout> | null = null;

  const syncCanvasOffset = (): void => {
    canvas.calcOffset?.();
  };

  const addBaseImageObject = (imageObject: FabricObjectLike): void => {
    if (typeof canvas.insertAt === "function") {
      canvas.insertAt(0, imageObject);
      return;
    }

    canvas.add(imageObject);
  };

  const clearCoordinateHighlight = (objects = coordinateHighlightObjects): void => {
    const clearingCurrentHighlight = objects === coordinateHighlightObjects;
    if (clearingCurrentHighlight && coordinateHighlightTimer !== null) {
      globalThis.clearTimeout(coordinateHighlightTimer);
      coordinateHighlightTimer = null;
    }
    objects.forEach((object) => canvas.remove(object));
    if (clearingCurrentHighlight) {
      coordinateHighlightObjects = [];
    }
    canvas.requestRenderAll();
  };

  const shell: CanvasShell = {
    canvas,
    history,

    getObjects(type?: string): FabricObjectLike[] {
      return canvas.getObjects(type);
    },

    getActiveObject(): FabricObjectLike | null {
      return canvas.getActiveObject();
    },

    getActiveObjects(): FabricObjectLike[] {
      return canvas.getActiveObjects();
    },

    discardActiveObject(): void {
      canvas.discardActiveObject();
    },

    setActiveSelection(objects: FabricObjectLike[], primaryObject: FabricObjectLike | null = null): void {
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

    renderAll(): void {
      canvas.renderAll();
    },

    clear(): void {
      clearCoordinateHighlight();
      canvas.clear();
      baseImageObject = null;
      crosshairState.crosshairX = null;
      crosshairState.crosshairY = null;
    },

    setBackgroundImage(image: unknown): void {
      const containerSize = deps.getCanvasContainerSize();
      canvas.setDimensions({
        width: containerSize.width,
        height: containerSize.height
      });
      if (baseImageObject) {
        canvas.remove(baseImageObject);
        baseImageObject = null;
      }
      canvas.backgroundImage = undefined;
      const baseImage = new deps.fabric.Image(image, {
        left: 0,
        top: 0,
        width: state.currentImage?.width,
        height: state.currentImage?.height,
        originX: "left",
        originY: "top",
        selectable: false,
        evented: false,
        hoverCursor: "default"
      });
      baseImage._isBaseImage = true;
      baseImageObject = baseImage;
      addBaseImageObject(baseImage);
      this.renderAll();
      syncCanvasOffset();
    },

    setMode(mode: AppMode): void {
      state.currentMode = mode;
      canvas.selection = mode === "edit";
      canvas.defaultCursor = mode === "draw" ? "crosshair" : "default";
      this.renderAll();
    },

    setZoomPercentage(percentage: string): void {
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

    zoom(factor: number): void {
      const center = canvas.getCenter();
      canvas.zoomToPoint(new deps.fabric.Point(center.left, center.top), canvas.getZoom() * factor);
      syncCanvasOffset();
      deps.updateZoomDisplay();
    },

    resetZoom(): void {
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

    resizeCanvas(): void {
      const container = deps.getCanvasContainerSize();
      canvas.setDimensions({
        width: container.width,
        height: container.height
      });
      syncCanvasOffset();
    },

    goToCoords(x: number, y: number): void {
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

    highlightPoint(x: number, y: number): void {
      const zoomLevel = canvas.getZoom();
      const reducedMotion = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
      const startRadius = (reducedMotion ? 28 : 10) / zoomLevel;
      const targetRadius = 46 / zoomLevel;
      clearCoordinateHighlight();

      const contrastRing = new deps.fabric.Circle({
        left: x,
        top: y,
        radius: startRadius,
        fill: "transparent",
        stroke: "rgba(255, 255, 255, 0.96)",
        strokeWidth: 7 / zoomLevel,
        originX: "center",
        originY: "center",
        selectable: false,
        evented: false,
        opacity: 0.92
      });
      const pulseRing = new deps.fabric.Circle({
        left: x,
        top: y,
        radius: startRadius,
        fill: "transparent",
        stroke: "#ff4d32",
        strokeWidth: 3 / zoomLevel,
        shadow: "0 0 10px rgba(255, 77, 50, 0.85)",
        originX: "center",
        originY: "center",
        selectable: false,
        evented: false
      });
      const centerDot = new deps.fabric.Circle({
        left: x,
        top: y,
        radius: (reducedMotion ? 5 : 3) / zoomLevel,
        fill: "#ff4d32",
        stroke: "#ffffff",
        strokeWidth: 2 / zoomLevel,
        shadow: "0 0 7px rgba(0, 0, 0, 0.6)",
        originX: "center",
        originY: "center",
        selectable: false,
        evented: false
      });

      coordinateHighlightObjects = [contrastRing, pulseRing, centerDot];
      const highlightObjects = coordinateHighlightObjects;
      canvas.add(...coordinateHighlightObjects);
      this.renderAll();

      if (reducedMotion) {
        coordinateHighlightTimer = globalThis.setTimeout(() => clearCoordinateHighlight(highlightObjects), 900);
        return;
      }

      const render = this.renderAll.bind(this);
      contrastRing.animate({ radius: targetRadius }, {
        onChange: render,
        duration: 620,
        easing: deps.fabric.util.ease.easeOutQuad
      });
      centerDot.animate({ radius: 6 / zoomLevel }, {
        onChange: render,
        duration: 220,
        easing: deps.fabric.util.ease.easeOutQuad
      });
      pulseRing.animate({ radius: targetRadius }, {
        onChange: render,
        duration: 620,
        easing: deps.fabric.util.ease.easeOutQuad,
        onComplete: () => {
          let remaining = highlightObjects.length;
          highlightObjects.forEach((object) => {
            (object as FabricCircleLike).animate({ opacity: 0 }, {
              onChange: render,
              duration: 280,
              onComplete: () => {
                remaining -= 1;
                if (remaining === 0) {
                  clearCoordinateHighlight(highlightObjects);
                }
              }
            });
          });
        }
      });
    },

    createCrosshairLines(): void {
      createCrosshairLines(deps.fabric, canvas, crosshairState);
    },

    toggleCrosshair(visible: boolean): void {
      state.isCrosshairVisible = visible;
      toggleCrosshair(deps.fabric, canvas, crosshairState, visible);
    },

    updateCrosshair(pointer: CanvasPoint): void {
      updateCrosshair(canvas, crosshairState, pointer);
    },

    hideCrosshair(): void {
      hideCrosshair(canvas, crosshairState);
    }
  };

  return shell;
}
