import { parseYoloRows, serializeRectsToYolo } from "../../domain/yolo/yolo.js";
import { createClipboardManager } from "./clipboard.js";
import { getColorForClass as defaultGetColorForClass } from "./colors.js";
import { createCrosshairLines, hideCrosshair, toggleCrosshair, updateCrosshair } from "./crosshair.js";
import { createAnnotationId, ensureAnnotationId, isActiveSelectionObject, isRectObject } from "./fabric-types.js";
import { normalizeFilterClassKey } from "../../ui/filter-state.js";
import { extractVisibleRectSelection, getRectBounds, planEdgeAlignment, planEqualEdgeGapDistribution } from "./arrange.js";
import { areRectSnapshotsEqual, createCanvasHistoryService, createRectSnapshotsByAnnotationId, createSelectionPayloadFromActiveObject } from "./history.js";
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
function hasTinySize(rect) {
    return rect.width < 5 && rect.height < 5;
}
function buildOriginalYolo(metadata) {
    return {
        x_center: metadata.x_center,
        y_center: metadata.y_center,
        width: metadata.width,
        height: metadata.height
    };
}
function cloneOriginalYolo(metadata) {
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
export function createCanvasController(state, deps) {
    applyLegacyFabricDefaults(deps.fabric);
    const colorForClass = deps.getColorForClass ?? defaultGetColorForClass;
    const canvas = new deps.fabric.Canvas("canvas", {
        width: 800,
        height: 600,
        backgroundColor: "#eee"
    });
    let isDrawing = false;
    let startPoint = null;
    let currentRect = null;
    const crosshairState = {
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
    const history = deps.historyService ?? createCanvasHistoryService();
    const captureRectSnapshots = () => {
        const rects = canvas.getObjects("rect").filter(isRectObject);
        return createRectSnapshotsByAnnotationId(rects);
    };
    const captureSelectionSnapshot = () => {
        return createSelectionPayloadFromActiveObject(canvas.getActiveObject());
    };
    const pushHistoryIfRectsChanged = (input) => {
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
    const removeRectInternal = (object) => {
        if (object._labelText) {
            canvas.remove(object._labelText);
        }
        canvas.remove(object);
    };
    const deleteRects = (rects) => {
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
    const syncCanvasOffset = () => {
        canvas.calcOffset?.();
    };
    const isRectHiddenByFilter = (rect, hiddenLabelClasses) => {
        const normalizedClass = normalizeFilterClassKey(rect.labelClass);
        return hiddenLabelClasses.has(normalizedClass);
    };
    const shouldClearSelectionForVisibility = (hiddenLabelClasses) => {
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
    const getRectLabelAnchor = (rect) => {
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
    const applyEdgeAlignment = (edge) => {
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
    const restoreSelectionFromPayload = (payload) => {
        const rectByAnnotationId = new Map();
        canvas
            .getObjects("rect")
            .filter(isRectObject)
            .forEach((rect) => {
            rectByAnnotationId.set(ensureAnnotationId(rect), rect);
        });
        const selectedRects = payload.annotationIds
            .map((annotationId) => rectByAnnotationId.get(annotationId) ?? null)
            .filter((rect) => rect !== null);
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
    const applyRectSnapshots = (targetSnapshots) => {
        const targetById = new Map(targetSnapshots.map((snapshot) => [snapshot.annotationId, snapshot]));
        const existingRects = canvas.getObjects("rect").filter(isRectObject);
        const existingById = new Map();
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
                    }
                    else {
                        controller.updateLabelText(existingRect);
                    }
                }
                else if (existingRect._labelText) {
                    canvas.remove(existingRect._labelText);
                    existingRect._labelText = null;
                }
                return;
            }
            const isEditMode = state.currentMode === "edit";
            const rect = new deps.fabric.Rect({
                left: snapshot.left,
                top: snapshot.top,
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
    const replayHistoryEntry = (entry, direction) => {
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
    const controller = {
        canvas,
        getObjects(type) {
            return canvas.getObjects(type);
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
        addLabelsFromYolo(yoloData) {
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
                    annotationId: createAnnotationId(),
                    labelClass: String(row.labelClass),
                    originalYolo: buildOriginalYolo(row)
                });
                rect.setControlVisible("mtr", false);
                canvas.add(rect);
                this.drawLabelText(rect);
            });
        },
        getLabelsAsYolo() {
            const image = state.currentImage;
            if (!image) {
                return "";
            }
            const rects = this.getObjects("rect").filter(isRectObject);
            return serializeRectsToYolo(rects, image.width, image.height);
        },
        highlightSelection() {
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
                }
                else {
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
        startDrawing(pointer) {
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
        continueDrawing(pointer) {
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
        async finishDrawing() {
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
                const before = createRectSnapshotsByAnnotationId(canvas
                    .getObjects("rect")
                    .filter(isRectObject)
                    .filter((rect) => rect !== currentRect));
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
            }
            catch (error) {
                if (!(error instanceof Error) || error.message !== "Label prompt cancelled") {
                    deps.notify("Unable to create label. Please try again.", 4000);
                }
                canvas.remove(currentRect);
            }
            finally {
                currentRect = null;
            }
        },
        removeObject(object) {
            deleteRects([object]);
        },
        sortObjectsByLabel(order = "asc") {
            state.labelSortOrder = order;
            deps.updateLabelList();
        },
        reorderObject(srcIndex, destIndex) {
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
        async editLabel(rect) {
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
            }
            finally {
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
        async editMultipleLabels(selection) {
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
            }
            finally {
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
        drawLabelText(rect) {
            if (!state.showLabelsOnCanvas) {
                return;
            }
            const displayName = deps.getDisplayNameForClass(rect.labelClass);
            const anchor = getRectLabelAnchor(rect);
            const text = new deps.fabric.Text(displayName, {
                left: anchor.left,
                top: anchor.top - 4,
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
        updateLabelText(rect) {
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
        updateAllLabelTexts() {
            this.getObjects("rect")
                .filter(isRectObject)
                .forEach((rect) => {
                if (rect._labelText) {
                    this.updateLabelText(rect);
                }
            });
        },
        toggleAllLabelTexts(visible) {
            if (visible) {
                this.getObjects("rect")
                    .filter(isRectObject)
                    .forEach((rect) => {
                    this.drawLabelText(rect);
                });
            }
            else {
                canvas
                    .getObjects("text")
                    .filter((obj) => obj.type === "text")
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
        applyVisibilityFromHiddenClasses(hiddenLabelClasses, clearSelectionWhenFilteredHidden = true) {
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
        selectAllLabels() {
            canvas.discardActiveObject();
            const rects = this.getObjects("rect").filter(isRectObject);
            if (rects.length === 0) {
                return;
            }
            const selection = new deps.fabric.ActiveSelection(rects, { canvas });
            canvas.setActiveObject(selection);
            canvas.requestRenderAll();
        },
        selectLabelsByClass(labelClass) {
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
        },
        copy() {
            clipboard.copy();
        },
        paste() {
            const before = captureRectSnapshots();
            const selectionBefore = captureSelectionSnapshot();
            const pasted = clipboard.paste();
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
        deleteSelection() {
            const activeObjects = canvas.getActiveObjects();
            const rectsToDelete = [];
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
        alignSelectionLeft() {
            applyEdgeAlignment("left");
        },
        alignSelectionRight() {
            applyEdgeAlignment("right");
        },
        alignSelectionTop() {
            applyEdgeAlignment("top");
        },
        alignSelectionBottom() {
            applyEdgeAlignment("bottom");
        },
        distributeSelectionHorizontally() {
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
        distributeSelectionVertically() {
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
        captureHistoryBaseline() {
            return {
                before: captureRectSnapshots(),
                selectionBefore: captureSelectionSnapshot()
            };
        },
        commitHistoryFromBaseline(baseline) {
            pushHistoryIfRectsChanged({
                before: baseline.before,
                after: captureRectSnapshots(),
                selectionBefore: baseline.selectionBefore,
                selectionAfter: captureSelectionSnapshot()
            });
        },
        clearHistory() {
            history.reset();
        },
        undo() {
            const entry = history.undo();
            if (!entry) {
                return;
            }
            replayHistoryEntry(entry, "undo");
        },
        redo() {
            const entry = history.redo();
            if (!entry) {
                return;
            }
            replayHistoryEntry(entry, "redo");
        },
        canUndo() {
            return history.canUndo();
        },
        canRedo() {
            return history.canRedo();
        }
    };
    return controller;
}
