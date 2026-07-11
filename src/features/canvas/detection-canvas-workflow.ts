import { parseYoloRows, serializeRectsToYolo } from "../../domain/yolo/yolo.js";
import { createBoxLayout, placeBoxLayout } from "../automation/layout.js";
import type { PixelPoint } from "../automation/types.js";
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
import { layoutAnnotationLabels } from "./annotation-label-renderer.js";

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
  let workflowActive = true;
  let suspendedSelection: CanvasHistorySelectionPayload | null = null;
  let hoveredAnnotationId: string | null = null;
  let labelLayoutFrame: number | null = null;

  const scheduleLabelLayout = (): void => {
    if (labelLayoutFrame !== null) {
      return;
    }
    if (typeof globalThis.requestAnimationFrame !== "function") {
      return;
    }
    labelLayoutFrame = globalThis.requestAnimationFrame(() => {
      labelLayoutFrame = null;
      controller.updateAllLabelTexts();
    });
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
    deps.onDocumentMutation?.();
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
          layoutInstanceId: snapshot.layoutInstanceId,
          layoutBoxId: snapshot.layoutBoxId,
          fill: `${color}33`,
          stroke: color
        });
        existingRect.originalYolo = originalYolo;
        existingRect.layoutInstanceId = snapshot.layoutInstanceId;
        existingRect.layoutBoxId = snapshot.layoutBoxId;
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
        layoutInstanceId: snapshot.layoutInstanceId,
        layoutBoxId: snapshot.layoutBoxId,
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
      if (labelLayoutFrame !== null && typeof globalThis.cancelAnimationFrame === "function") {
        globalThis.cancelAnimationFrame(labelLayoutFrame);
      }
      labelLayoutFrame = null;
      hoveredAnnotationId = null;
      suspendedSelection = null;
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
      this.updateAllLabelTexts();
    },

    getLabelsAsYolo(): string {
      const image = state.currentImage;
      if (!image) {
        return "";
      }

      const rects = this.getObjects("rect").filter(isRectObject);
      return serializeRectsToYolo(rects, image.width, image.height);
    },

    captureBoxLayout(name: string, sourceImageName: string, scope: "selected" | "all"): ReturnType<typeof createBoxLayout> {
      const image = state.currentImage;
      if (!image) {
        throw new Error("Load an image before saving a layout");
      }

      const allRects = canvas.getObjects("rect").filter(isRectObject);
      const selectedRects = extractVisibleRectSelection(canvas.getActiveObject());
      const rects = scope === "selected" ? selectedRects : allRects;
      if (rects.length === 0) {
        throw new Error(scope === "selected" ? "Select at least one box" : "The image has no boxes to save");
      }

      return createBoxLayout({
        name,
        sourceImageName,
        sourceImageSize: { width: image.width, height: image.height },
        boxes: rects.map((rect, order) => {
          const bounds = rect.getBoundingRect(true);
          return {
            id: ensureAnnotationId(rect),
            classId: String(rect.labelClass ?? ""),
            left: bounds.left,
            top: bounds.top,
            width: bounds.width,
            height: bounds.height,
            order
          };
        })
      });
    },

    applyBoxLayout(layout, anchor, options = {}): { instanceId: string; annotationIds: string[] } {
      const image = state.currentImage;
      if (!image) {
        throw new Error("Load an image before applying a layout");
      }
      const placedBoxes = placeBoxLayout(layout, anchor, { width: image.width, height: image.height });
      const before = captureRectSnapshots();
      const selectionBefore = captureSelectionSnapshot();
      const instanceId = typeof globalThis.crypto?.randomUUID === "function"
        ? `layout-instance-${globalThis.crypto.randomUUID()}`
        : `layout-instance-${Date.now()}-${Math.random().toString(16).slice(2)}`;

      canvas.discardActiveObject();
      if (options.replaceExisting) {
        canvas.getObjects("rect").filter(isRectObject).forEach(removeRectInternal);
      }

      const createdRects = placedBoxes.map((box) => {
        const color = colorForClass(box.classId);
        const rect = new deps.fabric.Rect({
          left: box.x,
          top: box.y,
          originX: "left",
          originY: "top",
          width: box.width,
          height: box.height,
          fill: `${color}33`,
          stroke: color,
          strokeWidth: 2,
          strokeUniform: true,
          selectable: state.currentMode === "edit",
          hoverCursor: state.currentMode === "edit" ? "move" : "crosshair",
          annotationId: createAnnotationId(),
          labelClass: box.classId,
          layoutInstanceId: instanceId,
          layoutBoxId: box.layoutBoxId,
          originalYolo: null
        });
        rect.setControlVisible("mtr", false);
        canvas.add(rect);
        this.drawLabelText(rect);
        return rect;
      });

      if (createdRects.length === 1 && createdRects[0]) {
        canvas.setActiveObject(createdRects[0]);
      } else if (createdRects.length > 1) {
        canvas.setActiveObject(new deps.fabric.ActiveSelection(createdRects, { canvas }));
      }
      createdRects.forEach((rect) => rect.setCoords());
      deps.updateLabelList();
      canvas.requestRenderAll();

      pushHistoryIfRectsChanged({
        before,
        after: captureRectSnapshots(),
        selectionBefore,
        selectionAfter: captureSelectionSnapshot()
      });

      return {
        instanceId,
        annotationIds: createdRects.map((rect) => ensureAnnotationId(rect))
      };
    },

    applyDetectionBoxes(boxes, options = {}): { annotationIds: string[] } {
      const image = state.currentImage;
      if (!image) {
        throw new Error("Load an image before applying detection boxes");
      }
      if (boxes.length === 0) {
        throw new Error("At least one detection box is required");
      }
      boxes.forEach((box, index) => {
        const geometry = [box.x, box.y, box.width, box.height];
        if (!geometry.every(Number.isFinite) || box.width <= 0 || box.height <= 0) {
          throw new Error(`Detection box ${index + 1} has invalid geometry`);
        }
        if (!box.classId.trim()) {
          throw new Error(`Detection box ${index + 1} requires a class ID`);
        }
        if (box.x < 0 || box.y < 0 || box.x + box.width > image.width || box.y + box.height > image.height) {
          throw new Error(`Detection box ${index + 1} falls outside the image bounds`);
        }
      });

      const before = captureRectSnapshots();
      const selectionBefore = captureSelectionSnapshot();
      canvas.discardActiveObject();
      if (options.replaceExisting) {
        canvas.getObjects("rect").filter(isRectObject).forEach(removeRectInternal);
      }

      const createdRects = boxes.map((box) => {
        const classId = box.classId.trim();
        const color = colorForClass(classId);
        const rect = new deps.fabric.Rect({
          left: box.x,
          top: box.y,
          originX: "left",
          originY: "top",
          width: box.width,
          height: box.height,
          fill: `${color}33`,
          stroke: color,
          strokeWidth: 2,
          strokeUniform: true,
          selectable: state.currentMode === "edit",
          hoverCursor: state.currentMode === "edit" ? "move" : "crosshair",
          annotationId: createAnnotationId(),
          labelClass: classId,
          originalYolo: null
        });
        rect.setControlVisible("mtr", false);
        canvas.add(rect);
        this.drawLabelText(rect);
        rect.setCoords();
        return rect;
      });

      if (createdRects.length === 1 && createdRects[0]) {
        canvas.setActiveObject(createdRects[0]);
      } else {
        canvas.setActiveObject(new deps.fabric.ActiveSelection(createdRects, { canvas }));
      }
      deps.updateLabelList();
      canvas.requestRenderAll();
      pushHistoryIfRectsChanged({
        before,
        after: captureRectSnapshots(),
        selectionBefore,
        selectionAfter: captureSelectionSnapshot()
      });

      return { annotationIds: createdRects.map((rect) => ensureAnnotationId(rect)) };
    },

    translateLayoutInstance(instanceId: string, delta: PixelPoint): void {
      const image = state.currentImage;
      if (!image) {
        throw new Error("Load an image before moving a layout");
      }
      if (!Number.isFinite(delta.x) || !Number.isFinite(delta.y)) {
        throw new Error("Layout movement must use finite pixel values");
      }
      const rects = canvas.getObjects("rect").filter(isRectObject).filter((rect) => rect.layoutInstanceId === instanceId);
      if (rects.length === 0) {
        throw new Error("The applied layout is no longer available");
      }
      const wouldLeaveImage = rects.some((rect) => {
        const bounds = rect.getBoundingRect(true);
        const left = bounds.left + delta.x;
        const top = bounds.top + delta.y;
        return left < 0 || top < 0 || left + bounds.width > image.width || top + bounds.height > image.height;
      });
      if (wouldLeaveImage) {
        throw new Error("Moving the layout would place a box outside the image bounds");
      }

      const before = captureRectSnapshots();
      const selectionBefore = captureSelectionSnapshot();
      rects.forEach((rect) => {
        rect.set({ left: rect.left + delta.x, top: rect.top + delta.y });
        rect.originalYolo = null;
        rect.setCoords();
        this.updateLabelText(rect);
      });
      canvas.requestRenderAll();
      deps.updateLabelList();
      pushHistoryIfRectsChanged({
        before,
        after: captureRectSnapshots(),
        selectionBefore,
        selectionAfter: captureSelectionSnapshot()
      });
    },

    translateSelectedBoxes(delta: PixelPoint): void {
      const image = state.currentImage;
      if (!image) {
        throw new Error("Load an image before moving selected boxes");
      }
      if (!Number.isFinite(delta.x) || !Number.isFinite(delta.y)) {
        throw new Error("Selection movement must use finite pixel values");
      }
      const rects = extractVisibleRectSelection(canvas.getActiveObject());
      if (rects.length === 0) {
        throw new Error("Select at least one visible box to move");
      }
      const wouldLeaveImage = rects.some((rect) => {
        const bounds = rect.getBoundingRect(true);
        const left = bounds.left + delta.x;
        const top = bounds.top + delta.y;
        return left < 0 || top < 0 || left + bounds.width > image.width || top + bounds.height > image.height;
      });
      if (wouldLeaveImage) {
        throw new Error("Moving the selection would place a box outside the image bounds");
      }

      const before = captureRectSnapshots();
      const selectionBefore = captureSelectionSnapshot();
      rects.forEach((rect) => {
        rect.set({ left: rect.left + delta.x, top: rect.top + delta.y });
        rect.originalYolo = null;
        rect.setCoords();
        this.updateLabelText(rect);
      });
      canvas.requestRenderAll();
      deps.updateLabelList();
      pushHistoryIfRectsChanged({
        before,
        after: captureRectSnapshots(),
        selectionBefore,
        selectionAfter: captureSelectionSnapshot()
      });
    },

    getSelectedBoxCount(): number {
      return extractVisibleRectSelection(canvas.getActiveObject()).length;
    },

    updateSelectedBoxGeometry(geometry: { x: number; y: number; width: number; height: number }): boolean {
      const image = state.currentImage;
      const selectedRects = extractVisibleRectSelection(canvas.getActiveObject());
      if (!image || selectedRects.length !== 1) {
        return false;
      }
      if (
        !Number.isFinite(geometry.x) ||
        !Number.isFinite(geometry.y) ||
        !Number.isFinite(geometry.width) ||
        !Number.isFinite(geometry.height) ||
        geometry.width <= 0 ||
        geometry.height <= 0
      ) {
        throw new Error("Box geometry must use finite positive pixel values");
      }
      if (
        geometry.x < 0 ||
        geometry.y < 0 ||
        geometry.x + geometry.width > image.width ||
        geometry.y + geometry.height > image.height
      ) {
        throw new Error("Box geometry must stay inside the image bounds");
      }

      const rect = selectedRects[0];
      const bounds = rect.getBoundingRect(true);
      const epsilon = 1e-8;
      if (
        Math.abs(bounds.left - geometry.x) <= epsilon &&
        Math.abs(bounds.top - geometry.y) <= epsilon &&
        Math.abs(bounds.width - geometry.width) <= epsilon &&
        Math.abs(bounds.height - geometry.height) <= epsilon
      ) {
        return false;
      }

      const before = captureRectSnapshots();
      const selectionBefore = captureSelectionSnapshot();
      const baseWidth = Math.max(rect.width, epsilon);
      const baseHeight = Math.max(rect.height, epsilon);
      rect.set({
        left: rect.left + geometry.x - bounds.left,
        top: rect.top + geometry.y - bounds.top,
        scaleX: geometry.width / baseWidth,
        scaleY: geometry.height / baseHeight
      });
      rect.originalYolo = null;
      rect.setCoords();
      this.updateLabelText(rect);
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

    setSelectedBoxesVisibility(visible: boolean): boolean {
      const selectedRects = extractVisibleRectSelection(canvas.getActiveObject());
      if (selectedRects.length === 0) {
        return false;
      }
      selectedRects.forEach((rect) => {
        rect.visible = visible;
        if (rect._labelText) {
          rect._labelText.visible = visible;
        }
      });
      if (!visible) {
        canvas.discardActiveObject();
      }
      canvas.requestRenderAll();
      deps.updateLabelList();
      return true;
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
      this.updateAllLabelTexts();
    },

    zoom(factor: number): void {
      shell.zoom(factor);
      this.updateAllLabelTexts();
    },

    resetZoom(): void {
      shell.resetZoom();
      this.updateAllLabelTexts();
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
      if (rect._labelText) {
        scheduleLabelLayout();
        return;
      }

      const anchor = getRectLabelAnchor(rect);
      const text = new deps.fabric.Text(String(rect.labelClass ?? ""), {
        left: anchor.left,
        top: anchor.top,
        originX: "left",
        originY: "top",
        fontSize: state.labelFontSize,
        fontFamily: "'Segoe UI', sans-serif",
        fontWeight: "600",
        fill: "#ffffff",
        backgroundColor: rect.stroke,
        padding: 3,
        selectable: false,
        evented: false,
        visible: workflowActive && state.showLabelsOnCanvas && rect.visible !== false,
        _isLabelText: true,
        _rect: rect,
        _labelLayoutVisible: true,
        _labelRepresentation: "full"
      });

      rect._labelText = text;
      canvas.add(text);
      scheduleLabelLayout();
    },

    updateLabelText(rect: FabricRectLike): void {
      if (!rect._labelText) {
        this.drawLabelText(rect);
        return;
      }
      const anchor = getRectLabelAnchor(rect);
      rect._labelText.set({
        text: deps.getDisplayNameForClass(rect.labelClass),
        left: anchor.left,
        top: anchor.top - 4,
        originX: "left",
        originY: "bottom",
        fontSize: state.labelFontSize,
        backgroundColor: rect.stroke,
        fill: "#ffffff",
        visible: workflowActive && state.showLabelsOnCanvas && rect.visible !== false
      });
      rect._labelText._labelLayoutVisible = true;
      rect._labelText._labelRepresentation = "full";
      scheduleLabelLayout();
    },

    updateAllLabelTexts(): void {
      const image = state.currentImage;
      if (!image) {
        return;
      }
      const rects = this.getObjects("rect").filter(isRectObject);
      rects.forEach((rect) => {
        if (!rect._labelText) {
          const anchor = getRectLabelAnchor(rect);
          const text = new deps.fabric.Text(String(rect.labelClass ?? ""), {
            left: anchor.left,
            top: anchor.top,
            originX: "left",
            originY: "top",
            fontSize: state.labelFontSize,
            fontFamily: "'Segoe UI', sans-serif",
            fontWeight: "600",
            fill: "#ffffff",
            backgroundColor: rect.stroke,
            padding: 3,
            selectable: false,
            evented: false,
            visible: false,
            _isLabelText: true,
            _rect: rect,
            _labelLayoutVisible: false,
            _labelRepresentation: "hidden"
          });
          rect._labelText = text;
          canvas.add(text);
        }
      });

      const [scaleX, , , scaleY, translateX, translateY] = canvas.viewportTransform;
      const zoom = Math.max(0.01, canvas.getZoom());
      const visibleSceneBounds = {
        left: -translateX / (scaleX || zoom),
        top: -translateY / (scaleY || zoom),
        width: canvas.getWidth() / Math.abs(scaleX || zoom),
        height: canvas.getHeight() / Math.abs(scaleY || zoom)
      };
      const selection = captureSelectionSnapshot();
      const placements = layoutAnnotationLabels({
        items: rects.map((rect) => ({
          annotationId: ensureAnnotationId(rect),
          classId: String(rect.labelClass ?? ""),
          displayName: deps.getDisplayNameForClass(rect.labelClass),
          bounds: rect.getBoundingRect(true)
        })),
        mode: state.showLabelsOnCanvas ? (state.labelDisplayMode ?? "auto") : "off",
        zoom,
        imageBounds: { left: 0, top: 0, width: image.width, height: image.height },
        visibleSceneBounds,
        selectedAnnotationIds: new Set(selection.annotationIds),
        hoveredAnnotationId,
        preferredFontSizePx: state.labelFontSize
      });
      const placementById = new Map(placements.map((placement) => [placement.annotationId, placement]));
      rects.forEach((rect) => {
        const text = rect._labelText;
        if (!text) {
          return;
        }
        const placement = placementById.get(ensureAnnotationId(rect));
        const layoutVisible = Boolean(placement?.visible);
        text._labelLayoutVisible = layoutVisible;
        text._labelRepresentation = placement?.representation ?? "hidden";
        text.set({
          text: placement?.text ?? "",
          left: placement?.left ?? 0,
          top: placement?.top ?? 0,
          originX: "left",
          originY: "top",
          fontSize: placement?.fontSize ?? state.labelFontSize,
          fontFamily: "'Segoe UI', sans-serif",
          fontWeight: placement?.representation === "full" ? "600" : "700",
          padding: 3,
          fill: "#ffffff",
          backgroundColor: rect.stroke,
          visible: workflowActive && rect.visible !== false && layoutVisible
        });
      });
      canvas.requestRenderAll();
    },

    toggleAllLabelTexts(visible: boolean): void {
      state.showLabelsOnCanvas = visible;
      state.labelDisplayMode = visible ? (state.labelDisplayMode === "off" ? "auto" : state.labelDisplayMode ?? "auto") : "off";
      this.updateAllLabelTexts();
    },

    setLabelDisplayMode(mode): void {
      state.labelDisplayMode = mode;
      state.showLabelsOnCanvas = mode !== "off";
      this.updateAllLabelTexts();
    },

    setHoveredAnnotation(rect): void {
      hoveredAnnotationId = rect ? ensureAnnotationId(rect) : null;
      this.updateAllLabelTexts();
    },

    applyVisibilityFromHiddenClasses(hiddenLabelClasses: ReadonlySet<string>, clearSelectionWhenFilteredHidden = true): void {
      if (clearSelectionWhenFilteredHidden && shouldClearSelectionForVisibility(hiddenLabelClasses)) {
        canvas.discardActiveObject();
      }

      this.getObjects("rect")
        .filter(isRectObject)
        .forEach((rect) => {
          const isHidden = isRectHiddenByFilter(rect, hiddenLabelClasses);
          rect.set("visible", workflowActive && !isHidden);
          if (rect._labelText) {
            rect._labelText.set("visible", workflowActive && !isHidden && rect._labelText._labelLayoutVisible === true);
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
      deps.onDocumentMutation?.();
    },

    redo(): void {
      const entry = history.redo();
      if (!entry) {
        return;
      }

      replayHistoryEntry(entry, "redo");
      deps.onDocumentMutation?.();
    },

    canUndo(): boolean {
      return history.canUndo();
    },

    canRedo(): boolean {
      return history.canRedo();
    },

    setWorkflowActive(active: boolean): void {
      if (workflowActive === active) {
        return;
      }

      workflowActive = active;
      if (!active) {
        suspendedSelection = captureSelectionSnapshot();
        canvas.discardActiveObject();
      }

      this.getObjects("rect")
        .filter(isRectObject)
        .forEach((rect) => {
          rect.set({
            visible: active,
            selectable: active && state.currentMode === "edit",
            evented: active
          });
          rect._labelText?.set("visible", active && state.showLabelsOnCanvas && rect._labelText._labelLayoutVisible === true);
        });

      if (active && suspendedSelection) {
        restoreSelectionFromPayload(suspendedSelection);
        suspendedSelection = null;
      }
      canvas.requestRenderAll();
    }
  };

  return controller;
}
