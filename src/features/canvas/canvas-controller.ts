import { parseYoloRows, serializeRectsToYolo } from "../../domain/yolo/yolo.js";
import type { AppMode, CanvasPoint } from "../../types/labels.js";
import { createClipboardManager } from "./clipboard.js";
import { getColorForClass as defaultGetColorForClass } from "./colors.js";
import { createCrosshairLines, hideCrosshair, toggleCrosshair, updateCrosshair, type CrosshairState } from "./crosshair.js";
import {
  isRectObject,
  type CanvasImageLike,
  type FabricActiveSelectionLike,
  type FabricCanvasLike,
  type FabricCircleLike,
  type FabricObjectLike,
  type FabricRectLike,
  type FabricRuntimeLike,
  type FabricTextLike,
  type YoloMetadata
} from "./fabric-types.js";

export interface CanvasControllerState {
  currentMode: AppMode;
  currentImage: CanvasImageLike | null;
  labelFolderHandle: unknown | null;
  showLabelsOnCanvas: boolean;
  labelFontSize: number;
  isCrosshairVisible: boolean;
  lastMousePosition: CanvasPoint;
  labelSortOrder: "asc" | "desc";
}

export interface CanvasControllerDeps {
  fabric: FabricRuntimeLike;
  getCanvasContainerSize(): { width: number; height: number };
  promptForLabelClass(defaultValue: string): Promise<string>;
  updateLabelList(): void;
  updateZoomDisplay(): void;
  getDisplayNameForClass(labelClass: string | undefined): string;
  notify(message: string, duration?: number): void;
  getColorForClass?: (labelClass: string | undefined) => string;
}

export interface CanvasController {
  readonly canvas: FabricCanvasLike;
  getObjects(type?: string): FabricObjectLike[];
  renderAll(): void;
  clear(): void;
  setBackgroundImage(image: unknown): void;
  setMode(mode: AppMode): void;
  addLabelsFromYolo(yoloData: string): void;
  getLabelsAsYolo(): string;
  highlightSelection(): void;
  startDrawing(pointer: CanvasPoint): void;
  continueDrawing(pointer: CanvasPoint): void;
  finishDrawing(): Promise<void>;
  removeObject(object: FabricRectLike): void;
  sortObjectsByLabel(order?: "asc" | "desc"): void;
  reorderObject(srcIndex: number, destIndex: number): void;
  editLabel(rect: FabricRectLike): Promise<void>;
  editMultipleLabels(selection: FabricActiveSelectionLike): Promise<void>;
  setZoomPercentage(percentage: string): void;
  zoom(factor: number): void;
  resetZoom(): void;
  resizeCanvas(): void;
  goToCoords(x: number, y: number): void;
  highlightPoint(x: number, y: number): void;
  drawLabelText(rect: FabricRectLike): void;
  updateLabelText(rect: FabricRectLike): void;
  updateAllLabelTexts(): void;
  toggleAllLabelTexts(visible: boolean): void;
  selectAllLabels(): void;
  selectLabelsByClass(labelClass: string): void;
  createCrosshairLines(): void;
  toggleCrosshair(visible: boolean): void;
  updateCrosshair(pointer: CanvasPoint): void;
  hideCrosshair(): void;
  copy(): void;
  paste(): void;
}

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

function hasTinySize(rect: FabricRectLike): boolean {
  return rect.width < 5 && rect.height < 5;
}

function buildOriginalYolo(metadata: {
  x_center: string | undefined;
  y_center: string | undefined;
  width: string | undefined;
  height: string | undefined;
}): YoloMetadata {
  return {
    x_center: metadata.x_center,
    y_center: metadata.y_center,
    width: metadata.width,
    height: metadata.height
  };
}

export function createCanvasController(state: CanvasControllerState, deps: CanvasControllerDeps): CanvasController {
  applyLegacyFabricDefaults(deps.fabric);

  const colorForClass = deps.getColorForClass ?? defaultGetColorForClass;

  const canvas = new deps.fabric.Canvas("canvas", {
    width: 800,
    height: 600,
    backgroundColor: "#eee"
  });

  let isDrawing = false;
  let startPoint: CanvasPoint | null = null;
  let currentRect: FabricRectLike | null = null;

  const crosshairState: CrosshairState = {
    isCrosshairVisible: state.isCrosshairVisible,
    crosshairX: null,
    crosshairY: null
  };

  const clipboard = createClipboardManager({
    fabric: deps.fabric,
    canvas,
    getColorForClass: colorForClass,
    drawLabelText: (rect) => {
      controller.drawLabelText(rect);
    },
    updateLabelList: () => {
      deps.updateLabelList();
    },
    getLastMousePosition: () => state.lastMousePosition,
    getCurrentImageSize: () => state.currentImage
  });

  const syncCanvasOffset = (): void => {
    canvas.calcOffset?.();
  };

  const controller: CanvasController = {
    canvas,

    getObjects(type?: string): FabricObjectLike[] {
      return canvas.getObjects(type);
    },

    renderAll(): void {
      canvas.renderAll();
    },

    clear(): void {
      canvas.clear();
      crosshairState.crosshairX = null;
      crosshairState.crosshairY = null;
    },

    setBackgroundImage(image: unknown): void {
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

    setMode(mode: AppMode): void {
      state.currentMode = mode;
      canvas.selection = mode === "edit";
      canvas.defaultCursor = mode === "draw" ? "crosshair" : "default";
      this.getObjects("rect").forEach((obj) => {
        if (!isRectObject(obj)) {
          return;
        }
        obj.set({
          selectable: mode === "edit",
          hoverCursor: mode === "draw" ? "crosshair" : "move"
        });
      });
      this.renderAll();
    },

    addLabelsFromYolo(yoloData: string): void {
      const image = state.currentImage;
      if (!image) {
        return;
      }

      parseYoloRows(yoloData, image.width, image.height).forEach((row) => {
        const color = colorForClass(row.labelClass);
        const rect = new deps.fabric.Rect({
          left: row.rectLeft,
          top: row.rectTop,
          width: row.rectWidth,
          height: row.rectHeight,
          fill: `${color}33`,
          stroke: color,
          strokeWidth: 2,
          strokeUniform: true,
          selectable: state.currentMode === "edit",
          hoverCursor: state.currentMode === "draw" ? "crosshair" : "move",
          labelClass: String(row.labelClass),
          originalYolo: buildOriginalYolo(row)
        });

        rect.setControlVisible("mtr", false);
        canvas.add(rect);
        this.drawLabelText(rect);
      });
    },

    getLabelsAsYolo(): string {
      const image = state.currentImage;
      if (!image) {
        return "";
      }

      const rects = this.getObjects("rect").filter(isRectObject);
      return serializeRectsToYolo(rects, image.width, image.height);
    },

    highlightSelection(): void {
      const rects = this.getObjects("rect").filter(isRectObject);
      const activeObjects = canvas.getActiveObjects();

      rects.forEach((rect) => {
        const isSelected = activeObjects.includes(rect);
        const color = colorForClass(rect.labelClass);

        if (isSelected) {
          rect.set({
            stroke: "#ff0000",
            strokeWidth: 2,
            strokeDashArray: [10, 5],
            shadow: null
          });
        } else {
          rect.set({
            stroke: color,
            strokeWidth: 2,
            strokeDashArray: [],
            shadow: null
          });
        }

        this.updateLabelText(rect);
      });

      this.renderAll();
    },

    startDrawing(pointer: CanvasPoint): void {
      if (state.currentMode !== "draw" || !state.currentImage) {
        return;
      }

      isDrawing = true;
      startPoint = pointer;
      currentRect = new deps.fabric.Rect({
        left: startPoint.x,
        top: startPoint.y,
        width: 0,
        height: 0,
        fill: "rgba(255, 0, 0, 0.2)",
        stroke: "red",
        strokeWidth: 2,
        strokeUniform: true,
        selectable: false
      });
      canvas.add(currentRect);
    },

    continueDrawing(pointer: CanvasPoint): void {
      if (!isDrawing || !startPoint || !currentRect) {
        return;
      }

      const width = pointer.x - startPoint.x;
      const height = pointer.y - startPoint.y;
      currentRect.set({
        left: width > 0 ? startPoint.x : pointer.x,
        top: height > 0 ? startPoint.y : pointer.y,
        width: Math.abs(width),
        height: Math.abs(height)
      });
      this.renderAll();
    },

    async finishDrawing(): Promise<void> {
      if (!isDrawing || !currentRect) {
        return;
      }

      isDrawing = false;

      if (!state.labelFolderHandle) {
        deps.notify("Please select a label folder before creating labels.", 4000);
        canvas.remove(currentRect);
        currentRect = null;
        return;
      }

      if (hasTinySize(currentRect)) {
        canvas.remove(currentRect);
        currentRect = null;
        return;
      }

      try {
        const finalLabel = await deps.promptForLabelClass("0");
        currentRect.set("labelClass", finalLabel);
        const color = colorForClass(finalLabel);
        currentRect.set({ fill: `${color}33`, stroke: color });
        currentRect.setControlVisible("mtr", false);

        const isEditMode = state.currentMode === "edit";
        currentRect.set({
          selectable: isEditMode,
          hoverCursor: isEditMode ? "move" : "crosshair"
        });

        currentRect.setCoords();
        this.drawLabelText(currentRect);
        canvas.requestRenderAll();
        deps.updateLabelList();
      } catch (error: unknown) {
        if (!(error instanceof Error) || error.message !== "Label prompt cancelled") {
          deps.notify("Unable to create label. Please try again.", 4000);
        }
        canvas.remove(currentRect);
      } finally {
        currentRect = null;
      }
    },

    removeObject(object: FabricRectLike): void {
      if (object._labelText) {
        canvas.remove(object._labelText);
      }
      canvas.remove(object);
    },

    sortObjectsByLabel(order = "asc"): void {
      state.labelSortOrder = order;
      deps.updateLabelList();
    },

    reorderObject(srcIndex: number, destIndex: number): void {
      const rects = this.getObjects("rect").filter(isRectObject);
      const movedRect = rects.splice(srcIndex, 1)[0];
      if (!movedRect) {
        return;
      }

      rects.splice(destIndex, 0, movedRect);
      rects.forEach((rect) => {
        canvas.remove(rect);
      });
      rects.forEach((rect) => {
        canvas.add(rect);
      });
    },

    async editLabel(rect: FabricRectLike): Promise<void> {
      try {
        const finalLabel = await deps.promptForLabelClass(rect.labelClass ?? "0");
        rect.set("labelClass", finalLabel);
        const color = colorForClass(finalLabel);
        rect.set({ fill: `${color}33`, stroke: color });
        rect.originalYolo = null;
        this.updateLabelText(rect);
        deps.updateLabelList();
      } finally {
        canvas.discardActiveObject();
        canvas._currentTransform = null;
        isDrawing = false;
        canvas.isDragging = false;
        canvas.selection = true;
        canvas.defaultCursor = "default";
        canvas.renderAll();
      }
    },

    async editMultipleLabels(selection: FabricActiveSelectionLike): Promise<void> {
      try {
        const finalLabel = await deps.promptForLabelClass("0");

        selection.getObjects().forEach((obj) => {
          if (!isRectObject(obj)) {
            return;
          }
          obj.set("labelClass", finalLabel);
          const color = colorForClass(finalLabel);
          obj.set({ fill: `${color}33`, stroke: color });
          obj.originalYolo = null;
          this.updateLabelText(obj);
        });

        this.renderAll();
        deps.updateLabelList();
      } finally {
        canvas.discardActiveObject();
        this.renderAll();
      }
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
      canvas.setWidth(container.width);
      canvas.setHeight(container.height);
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
          (highlightCircle as FabricCircleLike).animate("opacity", 0, {
            onChange: this.renderAll.bind(this),
            duration: 300,
            onComplete: () => canvas.remove(highlightCircle)
          });
        }
      });
    },

    drawLabelText(rect: FabricRectLike): void {
      if (!state.showLabelsOnCanvas) {
        return;
      }

      const displayName = deps.getDisplayNameForClass(rect.labelClass);
      const text = new deps.fabric.Text(displayName, {
        left: rect.left,
        top: rect.top - 4,
        originY: "bottom",
        fontSize: state.labelFontSize,
        fontFamily: "'Consolas', monospace",
        fill: rect.stroke,
        backgroundColor: rect.fill,
        padding: 2,
        selectable: false,
        evented: false,
        _isLabelText: true,
        _rect: rect
      });

      rect._labelText = text;
      canvas.add(text);
    },

    updateLabelText(rect: FabricRectLike): void {
      if (!rect._labelText) {
        return;
      }

      const displayName = deps.getDisplayNameForClass(rect.labelClass);
      let newLeft: number;
      let newTop: number;

      if (rect.group) {
        const bounds = rect.getBoundingRect();
        newLeft = rect.group.left + rect.group.width / 2 + bounds.left;
        newTop = rect.group.top + rect.group.height / 2 + bounds.top;
      } else {
        newLeft = rect.left;
        newTop = rect.top;
      }

      rect._labelText.set({
        text: displayName,
        left: newLeft,
        top: newTop - 4,
        originY: "bottom",
        fontSize: state.labelFontSize,
        fontFamily: "'Consolas', monospace",
        padding: 2,
        fill: rect.stroke,
        backgroundColor: rect.fill
      });
    },

    updateAllLabelTexts(): void {
      this.getObjects("rect")
        .filter(isRectObject)
        .forEach((rect) => {
          if (rect._labelText) {
            this.updateLabelText(rect);
          }
        });
    },

    toggleAllLabelTexts(visible: boolean): void {
      if (visible) {
        this.getObjects("rect")
          .filter(isRectObject)
          .forEach((rect) => {
            this.drawLabelText(rect);
          });
      } else {
        canvas
          .getObjects("text")
          .filter((obj): obj is FabricTextLike => obj.type === "text")
          .forEach((text) => {
            if (text._isLabelText) {
              canvas.remove(text);
            }
          });

        this.getObjects("rect")
          .filter(isRectObject)
          .forEach((rect) => {
            rect._labelText = null;
          });
      }

      this.renderAll();
    },

    selectAllLabels(): void {
      const rects = this.getObjects("rect").filter(isRectObject);
      if (rects.length === 0) {
        return;
      }

      const selection = new deps.fabric.ActiveSelection(rects, { canvas });
      canvas.setActiveObject(selection);
      canvas.requestRenderAll();
    },

    selectLabelsByClass(labelClass: string): void {
      canvas.discardActiveObject();

      const rectsToSelect = this.getObjects("rect")
        .filter(isRectObject)
        .filter((rect) => rect.labelClass === labelClass);

      if (rectsToSelect.length > 0) {
        const selection = new deps.fabric.ActiveSelection(rectsToSelect, { canvas });
        canvas.setActiveObject(selection);
      }

      canvas.requestRenderAll();
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
    },

    copy(): void {
      clipboard.copy();
    },

    paste(): void {
      clipboard.paste();
    }
  };

  return controller;
}
