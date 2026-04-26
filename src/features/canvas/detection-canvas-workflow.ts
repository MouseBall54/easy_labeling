import { parseYoloRows, serializeRectsToYolo } from "../../domain/yolo/yolo.js";
import type { AppMode, CanvasPoint } from "../../types/labels.js";
import { createClipboardManager } from "./clipboard.js";
import { getColorForClass as defaultGetColorForClass } from "./colors.js";
import type { CanvasController, CanvasControllerDeps, CanvasControllerState, CanvasShell } from "./canvas-controller-types.js";
import {
  createAnnotationId,
  ensureAnnotationId,
  isActiveSelectionObject,
  isRectObject,
  type FabricActiveSelectionLike,
  type FabricObjectLike,
  type FabricCircleLike,
  type FabricRectLike,
  type FabricTextLike,
  type YoloMetadata
} from "./fabric-types.js";
import { normalizeFilterClassKey } from "../../ui/filter-state.js";
import {
  extractVisibleRectSelection,
  getRectBounds,
  planEdgeAlignment,
  planEqualEdgeGapDistribution,
  type ArrangeEdge
} from "./arrange.js";
import {
  areRectSnapshotsEqual,
  createRectSnapshotsByAnnotationId,
  createSelectionPayloadFromActiveObject,
  type CanvasHistoryEntry,
  type CanvasHistoryGestureBaseline,
  type CanvasHistoryRectSnapshot,
  type CanvasHistorySelectionPayload
} from "./history.js";

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

function cloneOriginalYolo(metadata: YoloMetadata | null | undefined): YoloMetadata | null | undefined {
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

export function createDetectionCanvasWorkflow(state: CanvasControllerState, deps: CanvasControllerDeps, shell: CanvasShell): CanvasController {
  const colorForClass = deps.getColorForClass ?? defaultGetColorForClass;

  const canvas = shell.canvas;

  let isDrawing = false;
  let startPoint: CanvasPoint | null = null;
  let currentRect: FabricRectLike | null = null;

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

  const history = shell.history;

  const captureRectSnapshots = (): CanvasHistoryRectSnapshot[] => {
    const rects = canvas.getObjects("rect").filter(isRectObject);
    return createRectSnapshotsByAnnotationId(rects);
  };

  const captureSelectionSnapshot = (): CanvasHistorySelectionPayload => {
    return createSelectionPayloadFromActiveObject(canvas.getActiveObject());
  };

  const pushHistoryIfRectsChanged = (input: {
    before: CanvasHistoryRectSnapshot[];
    after: CanvasHistoryRectSnapshot[];
    selectionBefore: CanvasHistorySelectionPayload;
    selectionAfter: CanvasHistorySelectionPayload;
  }): void => {
    if (history.isReplayMuted()) {
      return;
    }

    if (areRectSnapshotsEqual(input.before, input.after)) {
      return;
    }

    history.push({
      before: input.before,
      after: input.after,
      selectionBefore: input.selectionBefore,
      selectionAfter: input.selectionAfter
    });
  };

  const removeRectInternal = (object: FabricRectLike): void => {
    if (object._labelText) {
      canvas.remove(object._labelText);
    }
    canvas.remove(object);
  };

  const deleteRects = (rects: readonly FabricRectLike[]): void => {
    const uniqueRects = [...new Set(rects)];
    if (uniqueRects.length === 0) {
      return;
    }

    const before = captureRectSnapshots();
    const selectionBefore = captureSelectionSnapshot();

    uniqueRects.forEach((rect) => {
      removeRectInternal(rect);
    });

    canvas.discardActiveObject();
    canvas.requestRenderAll();
    deps.updateLabelList();

    pushHistoryIfRectsChanged({
      before,
      after: captureRectSnapshots(),
      selectionBefore,
      selectionAfter: captureSelectionSnapshot()
    });
  };

  const isRectHiddenByFilter = (rect: FabricRectLike, hiddenLabelClasses: ReadonlySet<string>): boolean => {
    const normalizedClass = normalizeFilterClassKey(rect.labelClass);
    return hiddenLabelClasses.has(normalizedClass);
  };

  const shouldClearSelectionForVisibility = (hiddenLabelClasses: ReadonlySet<string>): boolean => {
    const activeObject = canvas.getActiveObject();
    if (!activeObject) {
      return false;
    }

    if (isRectObject(activeObject)) {
      return isRectHiddenByFilter(activeObject, hiddenLabelClasses);
    }

    if (isActiveSelectionObject(activeObject)) {
      return activeObject.getObjects().some((obj) => isRectObject(obj) && isRectHiddenByFilter(obj, hiddenLabelClasses));
    }

    return canvas.getActiveObjects().some((obj) => isRectObject(obj) && isRectHiddenByFilter(obj, hiddenLabelClasses));
  };

  const getRectLabelAnchor = (rect: FabricRectLike): { left: number; top: number } => {
    const bounds = rect.getBoundingRect(true);
    let left = bounds.left;
    let top = bounds.top;

    if (rect.group) {
      const groupLeft = rect.group.left;
      const groupTop = rect.group.top;
      const groupWidth = rect.group.width;
      const groupHeight = rect.group.height;
      const eps = 1e-8;

      const sameXSpace = Math.abs(bounds.left - rect.left) <= eps;
      const sameYSpace = Math.abs(bounds.top - rect.top) <= eps;

      if (sameXSpace && Number.isFinite(groupLeft) && Number.isFinite(groupWidth)) {
        left = rect.left + groupLeft + groupWidth / 2;
      }
      if (sameYSpace && Number.isFinite(groupTop) && Number.isFinite(groupHeight)) {
        top = rect.top + groupTop + groupHeight / 2;
      }
    }

    return { left, top };
  };

  const applyEdgeAlignment = (edge: ArrangeEdge): void => {
    const activeObject = canvas.getActiveObject();
    const selectedRects = extractVisibleRectSelection(activeObject);
    if (selectedRects.length < 2) {
      return;
    }

    const selectionBefore = captureSelectionSnapshot();
    const before = captureRectSnapshots();

    const plan = planEdgeAlignment(selectedRects, edge);
    if (plan.length === 0) {
      return;
    }

    let movedCount = 0;
    plan.forEach(({ rect, left, top }) => {
      const bounds = getRectBounds(rect);
      const deltaX = left - bounds.left;
      const deltaY = top - bounds.top;
      if (deltaX === 0 && deltaY === 0) {
        return;
      }

      rect.set({
        left: rect.left + deltaX,
        top: rect.top + deltaY
      });
      rect.setCoords();
      rect.originalYolo = null;
      controller.updateLabelText(rect);
      movedCount += 1;
    });

    if (movedCount === 0) {
      return;
    }

    canvas.requestRenderAll();
    deps.updateLabelList();

    const selectionAfter = captureSelectionSnapshot();
    const after = captureRectSnapshots();

    pushHistoryIfRectsChanged({
      before,
      after,
      selectionBefore,
      selectionAfter
    });
  };

  const restoreSelectionFromPayload = (payload: CanvasHistorySelectionPayload): void => {
    const rectByAnnotationId = new Map<string, FabricRectLike>();
    canvas
      .getObjects("rect")
      .filter(isRectObject)
      .forEach((rect) => {
        rectByAnnotationId.set(ensureAnnotationId(rect), rect);
      });

    const selectedRects = payload.annotationIds
      .map((annotationId) => rectByAnnotationId.get(annotationId) ?? null)
      .filter((rect): rect is FabricRectLike => rect !== null);

    if (selectedRects.length === 0) {
      canvas.discardActiveObject();
      return;
    }

    if (selectedRects.length === 1) {
      selectedRects[0].setCoords();
      canvas.setActiveObject(selectedRects[0]);
      return;
    }

    if (payload.primaryAnnotationId) {
      const primaryIndex = selectedRects.findIndex((rect) => ensureAnnotationId(rect) === payload.primaryAnnotationId);
      if (primaryIndex > 0) {
        const [primary] = selectedRects.splice(primaryIndex, 1);
        if (primary) {
          selectedRects.unshift(primary);
        }
      }
    }

    selectedRects.forEach((rect) => {
      rect.setCoords();
    });
    const selection = new deps.fabric.ActiveSelection(selectedRects, { canvas });
    canvas.setActiveObject(selection);
  };

  const applyRectSnapshots = (targetSnapshots: readonly CanvasHistoryRectSnapshot[]): void => {
    const targetById = new Map(targetSnapshots.map((snapshot) => [snapshot.annotationId, snapshot]));
    const existingRects = canvas.getObjects("rect").filter(isRectObject);
    const existingById = new Map<string, FabricRectLike>();
    existingRects.forEach((rect) => {
      existingById.set(ensureAnnotationId(rect), rect);
    });

    existingById.forEach((rect, annotationId) => {
      if (!targetById.has(annotationId)) {
        removeRectInternal(rect);
      }
    });

    targetSnapshots.forEach((snapshot) => {
      const existingRect = existingById.get(snapshot.annotationId);
      const color = colorForClass(snapshot.labelClass);
      const originalYolo = cloneOriginalYolo(snapshot.originalYolo);

      if (existingRect) {
        const currentBounds = existingRect.getBoundingRect(true);
        const deltaX = snapshot.boundsLeft - currentBounds.left;
        const deltaY = snapshot.boundsTop - currentBounds.top;
        existingRect.set({
          left: existingRect.left + deltaX,
          top: existingRect.top + deltaY,
          width: snapshot.width,
          height: snapshot.height,
          scaleX: snapshot.scaleX,
          scaleY: snapshot.scaleY,
          labelClass: snapshot.labelClass,
          fill: `${color}33`,
          stroke: color
        });
        existingRect.originalYolo = originalYolo;
        existingRect.setCoords();

        if (state.showLabelsOnCanvas) {
          if (!existingRect._labelText) {
            controller.drawLabelText(existingRect);
          } else {
            controller.updateLabelText(existingRect);
          }
        } else if (existingRect._labelText) {
          canvas.remove(existingRect._labelText);
          existingRect._labelText = null;
        }
        return;
      }

      const isEditMode = state.currentMode === "edit";
        const rect = new deps.fabric.Rect({
          left: snapshot.left,
          top: snapshot.top,
          originX: "left",
          originY: "top",
          width: snapshot.width,
          height: snapshot.height,
        scaleX: snapshot.scaleX,
        scaleY: snapshot.scaleY,
        fill: `${color}33`,
        stroke: color,
        strokeWidth: 2,
        strokeUniform: true,
        selectable: isEditMode,
        hoverCursor: isEditMode ? "move" : "crosshair",
        annotationId: snapshot.annotationId,
        labelClass: snapshot.labelClass,
        originalYolo
      });

      rect.setControlVisible("mtr", false);
      canvas.add(rect);

      if (state.showLabelsOnCanvas) {
        controller.drawLabelText(rect);
      }
    });
  };

  const replayHistoryEntry = (entry: CanvasHistoryEntry, direction: "undo" | "redo"): void => {
    const rectSnapshots = direction === "undo" ? entry.before : entry.after;
    const selectionSnapshot = direction === "undo" ? entry.selectionBefore : entry.selectionAfter;

    history.withReplayMuted(() => {
      canvas.discardActiveObject();
      applyRectSnapshots(rectSnapshots);
      restoreSelectionFromPayload(selectionSnapshot);
    });

    controller.updateAllLabelTexts();
    deps.updateLabelList();
    canvas.requestRenderAll();
  };

  const controller: CanvasController = {
    canvas,

    getObjects(type?: string): FabricObjectLike[] {
      return canvas.getObjects(type);
    },

    renderAll(): void {
      shell.renderAll();
    },

    clear(): void {
      shell.clear();
    },

    setBackgroundImage(image: unknown): void {
      shell.setBackgroundImage(image);
    },

    setMode(mode: AppMode): void {
      shell.setMode(mode);
      this.getObjects("rect").forEach((obj) => {
        if (!isRectObject(obj)) {
          return;
        }
        obj.set({
          selectable: mode === "edit",
          hoverCursor: mode === "draw" ? "crosshair" : "move"
        });
      });
      shell.renderAll();
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
          originX: "left",
          originY: "top",
          width: row.rectWidth,
          height: row.rectHeight,
          fill: `${color}33`,
          stroke: color,
          strokeWidth: 2,
          strokeUniform: true,
          selectable: state.currentMode === "edit",
          hoverCursor: state.currentMode === "draw" ? "crosshair" : "move",
          annotationId: createAnnotationId(),
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
        originX: "left",
        originY: "top",
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
        const before = createRectSnapshotsByAnnotationId(
          canvas
            .getObjects("rect")
            .filter(isRectObject)
            .filter((rect) => rect !== currentRect)
        );
        const selectionBefore = captureSelectionSnapshot();
        const finalLabel = await deps.promptForLabelClass("0");
        currentRect.set("labelClass", finalLabel);
        const color = colorForClass(finalLabel);
        currentRect.set({ fill: `${color}33`, stroke: color });
        currentRect.setControlVisible("mtr", false);
        ensureAnnotationId(currentRect);

        const isEditMode = state.currentMode === "edit";
        currentRect.set({
          selectable: isEditMode,
          hoverCursor: isEditMode ? "move" : "crosshair"
        });

        currentRect.setCoords();
        this.drawLabelText(currentRect);
        canvas.requestRenderAll();
        deps.updateLabelList();

        pushHistoryIfRectsChanged({
          before,
          after: captureRectSnapshots(),
          selectionBefore,
          selectionAfter: captureSelectionSnapshot()
        });
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
      deleteRects([object]);
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
      const before = captureRectSnapshots();
      const selectionBefore = captureSelectionSnapshot();
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

        pushHistoryIfRectsChanged({
          before,
          after: captureRectSnapshots(),
          selectionBefore,
          selectionAfter: captureSelectionSnapshot()
        });
      }
    },

    async editMultipleLabels(selection: FabricActiveSelectionLike): Promise<void> {
      const before = captureRectSnapshots();
      const selectionBefore = captureSelectionSnapshot();
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

        pushHistoryIfRectsChanged({
          before,
          after: captureRectSnapshots(),
          selectionBefore,
          selectionAfter: captureSelectionSnapshot()
        });
      }
    },

    setZoomPercentage(percentage: string): void {
      shell.setZoomPercentage(percentage);
    },

    zoom(factor: number): void {
      shell.zoom(factor);
    },

    resetZoom(): void {
      shell.resetZoom();
    },

    resizeCanvas(): void {
      shell.resizeCanvas();
    },

    goToCoords(x: number, y: number): void {
      shell.goToCoords(x, y);
    },

    highlightPoint(x: number, y: number): void {
      shell.highlightPoint(x, y);
    },

    drawLabelText(rect: FabricRectLike): void {
      if (!state.showLabelsOnCanvas) {
        return;
      }

      const displayName = deps.getDisplayNameForClass(rect.labelClass);
      const anchor = getRectLabelAnchor(rect);
      const text = new deps.fabric.Text(displayName, {
        left: anchor.left,
        top: anchor.top - 4,
        originX: "left",
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
      const anchor = getRectLabelAnchor(rect);

      rect._labelText.set({
        text: displayName,
        left: anchor.left,
        top: anchor.top - 4,
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

    applyVisibilityFromHiddenClasses(hiddenLabelClasses: ReadonlySet<string>, clearSelectionWhenFilteredHidden = true): void {
      if (clearSelectionWhenFilteredHidden && shouldClearSelectionForVisibility(hiddenLabelClasses)) {
        canvas.discardActiveObject();
      }

      this.getObjects("rect")
        .filter(isRectObject)
        .forEach((rect) => {
          const isHidden = isRectHiddenByFilter(rect, hiddenLabelClasses);
          rect.set("visible", !isHidden);
          if (rect._labelText) {
            rect._labelText.set("visible", !isHidden);
          }
        });

      canvas.requestRenderAll();
    },

    selectAllLabels(): void {
      canvas.discardActiveObject();
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
      shell.createCrosshairLines();
    },

    toggleCrosshair(visible: boolean): void {
      shell.toggleCrosshair(visible);
    },

    updateCrosshair(pointer: CanvasPoint): void {
      shell.updateCrosshair(pointer);
    },

    hideCrosshair(): void {
      shell.hideCrosshair();
    },

    async copy(): Promise<void> {
      await clipboard.copy();
    },

    async paste(): Promise<void> {
      const before = captureRectSnapshots();
      const selectionBefore = captureSelectionSnapshot();
      const pasted = await clipboard.paste();
      if (pasted.length === 0) {
        return;
      }

      pushHistoryIfRectsChanged({
        before,
        after: captureRectSnapshots(),
        selectionBefore,
        selectionAfter: captureSelectionSnapshot()
      });
    },

    deleteSelection(): void {
      const activeObjects = canvas.getActiveObjects();
      const rectsToDelete: FabricRectLike[] = [];

      activeObjects.forEach((object) => {
        if (isRectObject(object)) {
          rectsToDelete.push(object);
          return;
        }

        if (isActiveSelectionObject(object)) {
          object.getObjects().forEach((child) => {
            if (isRectObject(child)) {
              rectsToDelete.push(child);
            }
          });
        }
      });

      deleteRects(rectsToDelete);
    },

    setSelectedLabelClass(classId: string): boolean {
      const activeObjects = canvas.getActiveObjects();
      const selectedRects: FabricRectLike[] = [];

      activeObjects.forEach((object) => {
        if (isRectObject(object)) {
          selectedRects.push(object);
          return;
        }

        if (isActiveSelectionObject(object)) {
          object.getObjects().forEach((child) => {
            if (isRectObject(child)) {
              selectedRects.push(child);
            }
          });
        }
      });

      const uniqueRects = [...new Set(selectedRects)];
      if (uniqueRects.length === 0) {
        return false;
      }

      const before = captureRectSnapshots();
      const selectionBefore = captureSelectionSnapshot();
      let changed = false;

      uniqueRects.forEach((rect) => {
        if (rect.labelClass === classId) {
          return;
        }
        rect.set("labelClass", classId);
        const color = colorForClass(classId);
        rect.set({ fill: `${color}33`, stroke: color });
        rect.originalYolo = null;
        this.updateLabelText(rect);
        changed = true;
      });

      if (!changed) {
        return false;
      }

      deps.updateLabelList();
      canvas.requestRenderAll();
      pushHistoryIfRectsChanged({
        before,
        after: captureRectSnapshots(),
        selectionBefore,
        selectionAfter: captureSelectionSnapshot()
      });
      return true;
    },

    alignSelectionLeft(): void {
      applyEdgeAlignment("left");
    },

    alignSelectionRight(): void {
      applyEdgeAlignment("right");
    },

    alignSelectionTop(): void {
      applyEdgeAlignment("top");
    },

    alignSelectionBottom(): void {
      applyEdgeAlignment("bottom");
    },

    distributeSelectionHorizontally(): void {
      const activeObject = canvas.getActiveObject();
      const selectedRects = extractVisibleRectSelection(activeObject);
      if (selectedRects.length < 3) {
        return;
      }

      const selectionBefore = captureSelectionSnapshot();
      const before = captureRectSnapshots();

      const plan = planEqualEdgeGapDistribution(selectedRects, "horizontal");
      if (plan.length === 0) {
        return;
      }

      const epsilon = 1e-8;
      let movedCount = 0;

      plan.forEach(({ rect, left, top }) => {
        const bounds = getRectBounds(rect);
        const deltaX = left - bounds.left;
        const deltaY = top - bounds.top;
        const hasMoved = Math.abs(deltaX) > epsilon || Math.abs(deltaY) > epsilon;
        if (!hasMoved) {
          return;
        }

        rect.set({ left: rect.left + deltaX, top: rect.top + deltaY });
        rect.setCoords();
        rect.originalYolo = null;
        this.updateLabelText(rect);
        movedCount += 1;
      });

      if (movedCount === 0) {
        return;
      }

      deps.updateLabelList();
      canvas.requestRenderAll();

      const selectionAfter = captureSelectionSnapshot();
      const after = captureRectSnapshots();

      pushHistoryIfRectsChanged({
        before,
        after,
        selectionBefore,
        selectionAfter
      });
    },

    distributeSelectionVertically(): void {
      const activeObject = canvas.getActiveObject();
      const selectedRects = extractVisibleRectSelection(activeObject);
      if (selectedRects.length < 3) {
        return;
      }

      const selectionBefore = captureSelectionSnapshot();
      const before = captureRectSnapshots();

      const plan = planEqualEdgeGapDistribution(selectedRects, "vertical");
      if (plan.length === 0) {
        return;
      }

      const epsilon = 1e-8;
      let movedCount = 0;

      plan.forEach(({ rect, left, top }) => {
        const bounds = getRectBounds(rect);
        const deltaX = left - bounds.left;
        const deltaY = top - bounds.top;
        const hasMoved = Math.abs(deltaX) > epsilon || Math.abs(deltaY) > epsilon;
        if (!hasMoved) {
          return;
        }

        rect.set({ left: rect.left + deltaX, top: rect.top + deltaY });
        rect.setCoords();
        rect.originalYolo = null;
        this.updateLabelText(rect);
        movedCount += 1;
      });

      if (movedCount === 0) {
        return;
      }

      deps.updateLabelList();
      canvas.requestRenderAll();

      const selectionAfter = captureSelectionSnapshot();
      const after = captureRectSnapshots();

      pushHistoryIfRectsChanged({
        before,
        after,
        selectionBefore,
        selectionAfter
      });
    },

    captureHistoryBaseline(): CanvasHistoryGestureBaseline {
      return {
        before: captureRectSnapshots(),
        selectionBefore: captureSelectionSnapshot()
      };
    },

    commitHistoryFromBaseline(baseline: CanvasHistoryGestureBaseline): void {
      pushHistoryIfRectsChanged({
        before: baseline.before,
        after: captureRectSnapshots(),
        selectionBefore: baseline.selectionBefore,
        selectionAfter: captureSelectionSnapshot()
      });
    },

    clearHistory(): void {
      history.reset();
    },

    undo(): void {
      const entry = history.undo();
      if (!entry) {
        return;
      }

      replayHistoryEntry(entry, "undo");
    },

    redo(): void {
      const entry = history.redo();
      if (!entry) {
        return;
      }

      replayHistoryEntry(entry, "redo");
    },

    canUndo(): boolean {
      return history.canUndo();
    },

    canRedo(): boolean {
      return history.canRedo();
    }
  };

  return controller;
}
