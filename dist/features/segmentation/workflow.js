import { createSegmentationDocument } from "./document.js";
import { createSegmentationOverlayObject, createSegmentationOverlaySnapshot, updateSegmentationOverlayObject } from "./overlay.js";
import { getColorForClass as defaultGetColorForClass } from "../canvas/colors.js";
function createEmptySummary() {
    return {
        activeClassId: "1",
        activeTool: "brush",
        brushRadius: 6,
        overlayVisible: true,
        overlayOpacity: 0.6,
        visibleClassIds: [],
        allClassIds: [],
        hiddenClassIds: []
    };
}
export function createSegmentationCanvasWorkflow(state, deps, shell) {
    const canvas = shell.canvas;
    const getColorForClass = deps.getColorForClass ?? defaultGetColorForClass;
    let document = null;
    let overlayObject = null;
    let selectionOverlayObject = null;
    let strokeBaseline = null;
    let strokePoints = [];
    let selectedRegion = null;
    let moveBaseline = null;
    let moveRegionBaseline = null;
    let movePointerStart = null;
    let moveLastDeltaX = null;
    let moveLastDeltaY = null;
    const resetDocumentForCurrentImage = () => {
        if (!state.currentImage) {
            document = null;
            if (overlayObject) {
                canvas.remove(overlayObject);
                overlayObject = null;
            }
            if (selectionOverlayObject) {
                canvas.remove(selectionOverlayObject);
                selectionOverlayObject = null;
            }
            selectedRegion = null;
            return;
        }
        document = createSegmentationDocument({
            width: state.currentImage.width,
            height: state.currentImage.height,
            activeClassId: document?.activeClassId ?? "1",
            activeTool: document?.activeTool ?? "brush",
            brushRadius: document?.brushRadius ?? 6,
            overlayVisible: document?.overlayVisible ?? true,
            overlayOpacity: document?.overlayOpacity ?? 0.6
        });
        if (overlayObject) {
            canvas.remove(overlayObject);
            overlayObject = null;
        }
        if (selectionOverlayObject) {
            canvas.remove(selectionOverlayObject);
            selectionOverlayObject = null;
        }
        selectedRegion = null;
    };
    const clearSelection = () => {
        selectedRegion = null;
        moveBaseline = null;
        moveRegionBaseline = null;
        movePointerStart = null;
        moveLastDeltaX = null;
        moveLastDeltaY = null;
        if (selectionOverlayObject) {
            canvas.remove(selectionOverlayObject);
            selectionOverlayObject = null;
        }
    };
    const redrawSelectionOverlay = () => {
        const doc = ensureDocument();
        if (!doc) {
            clearSelection();
            return;
        }
        if (!selectedRegion || selectedRegion.pixelCount === 0) {
            if (selectionOverlayObject) {
                canvas.remove(selectionOverlayObject);
                selectionOverlayObject = null;
            }
            return;
        }
        const pixels = new Uint8ClampedArray(doc.width * doc.height * 4);
        const { r, g, b } = (() => {
            const colorHex = getColorForClass(selectedRegion.classId);
            const normalized = colorHex.replace("#", "");
            const source = normalized.length === 3
                ? normalized.split("").map((char) => `${char}${char}`).join("")
                : normalized.padEnd(6, "0").slice(0, 6);
            return {
                r: Number.parseInt(source.slice(0, 2), 16),
                g: Number.parseInt(source.slice(2, 4), 16),
                b: Number.parseInt(source.slice(4, 6), 16)
            };
        })();
        for (const index of selectedRegion.pixelIndices) {
            const channelOffset = index * 4;
            pixels[channelOffset] = Math.min(255, r + 40);
            pixels[channelOffset + 1] = Math.min(255, g + 40);
            pixels[channelOffset + 2] = Math.min(255, b + 40);
            pixels[channelOffset + 3] = 220;
        }
        const selectionOverlay = {
            width: doc.width,
            height: doc.height,
            pixels,
            opacity: 1,
            visible: true
        };
        if (!selectionOverlayObject) {
            selectionOverlayObject = createSegmentationOverlayObject(deps.fabric, selectionOverlay);
            canvas.add(selectionOverlayObject);
            return;
        }
        updateSegmentationOverlayObject(selectionOverlayObject, selectionOverlay);
    };
    const ensureDocument = () => {
        if (!state.currentImage) {
            return null;
        }
        if (!document || document.width !== state.currentImage.width || document.height !== state.currentImage.height) {
            resetDocumentForCurrentImage();
        }
        return document;
    };
    const redrawOverlay = () => {
        const doc = ensureDocument();
        if (!doc) {
            if (overlayObject) {
                canvas.remove(overlayObject);
                overlayObject = null;
            }
            return;
        }
        const overlay = createSegmentationOverlaySnapshot(doc, getColorForClass);
        if (!overlayObject) {
            overlayObject = createSegmentationOverlayObject(deps.fabric, overlay);
            canvas.add(overlayObject);
        }
        else {
            updateSegmentationOverlayObject(overlayObject, overlay);
        }
        redrawSelectionOverlay();
        canvas.requestRenderAll();
    };
    const controller = {
        canvas,
        getObjects(type) {
            return shell.getObjects(type);
        },
        renderAll() {
            shell.renderAll();
        },
        clear() {
            shell.clear();
            document = null;
            overlayObject = null;
            selectionOverlayObject = null;
            strokeBaseline = null;
            strokePoints = [];
            selectedRegion = null;
            moveBaseline = null;
            moveRegionBaseline = null;
            movePointerStart = null;
            moveLastDeltaX = null;
            moveLastDeltaY = null;
        },
        setBackgroundImage(image) {
            shell.setBackgroundImage(image);
            resetDocumentForCurrentImage();
            redrawOverlay();
        },
        setMode(mode) {
            shell.setMode(mode);
            if (mode === "draw") {
                clearSelection();
                shell.renderAll();
            }
        },
        addLabelsFromYolo() {
            return;
        },
        getLabelsAsYolo() {
            return "";
        },
        highlightSelection() {
            return;
        },
        startDrawing(pointer) {
            if (state.currentMode !== "draw") {
                return;
            }
            const doc = ensureDocument();
            if (!doc) {
                return;
            }
            clearSelection();
            strokeBaseline = doc.cloneSnapshot();
            strokePoints = [pointer];
            doc.applyStroke({ points: [pointer] }, { recordHistory: false });
            redrawOverlay();
        },
        continueDrawing(pointer) {
            const doc = ensureDocument();
            if (!doc || !strokeBaseline) {
                return;
            }
            const lastPoint = strokePoints.at(-1);
            const points = lastPoint ? [lastPoint, pointer] : [pointer];
            strokePoints.push(pointer);
            doc.applyStroke({ points }, { recordHistory: false });
            redrawOverlay();
        },
        async finishDrawing() {
            const doc = ensureDocument();
            if (!doc || !strokeBaseline) {
                return;
            }
            doc.pushHistoryFromSnapshot(strokeBaseline);
            strokeBaseline = null;
            strokePoints = [];
            redrawOverlay();
        },
        removeObject(_object) {
            return;
        },
        sortObjectsByLabel() {
            return;
        },
        reorderObject() {
            return;
        },
        async editLabel(_rect) {
            return;
        },
        async editMultipleLabels(_selection) {
            return;
        },
        setZoomPercentage(percentage) {
            shell.setZoomPercentage(percentage);
        },
        zoom(factor) {
            shell.zoom(factor);
        },
        resetZoom() {
            shell.resetZoom();
        },
        resizeCanvas() {
            shell.resizeCanvas();
        },
        goToCoords(x, y) {
            shell.goToCoords(x, y);
        },
        highlightPoint(x, y) {
            shell.highlightPoint(x, y);
        },
        drawLabelText() {
            return;
        },
        updateLabelText() {
            return;
        },
        updateAllLabelTexts() {
            return;
        },
        toggleAllLabelTexts() {
            return;
        },
        applyVisibilityFromHiddenClasses() {
            return;
        },
        selectAllLabels() {
            shell.discardActiveObject();
        },
        selectLabelsByClass() {
            shell.discardActiveObject();
        },
        createCrosshairLines() {
            shell.createCrosshairLines();
        },
        toggleCrosshair(visible) {
            shell.toggleCrosshair(visible);
        },
        updateCrosshair(pointer) {
            shell.updateCrosshair(pointer);
        },
        hideCrosshair() {
            shell.hideCrosshair();
        },
        copy() {
            return;
        },
        paste() {
            return;
        },
        deleteSelection() {
            return;
        },
        alignSelectionLeft() {
            return;
        },
        alignSelectionRight() {
            return;
        },
        alignSelectionTop() {
            return;
        },
        alignSelectionBottom() {
            return;
        },
        distributeSelectionHorizontally() {
            return;
        },
        distributeSelectionVertically() {
            return;
        },
        captureHistoryBaseline() {
            return {
                before: [],
                selectionBefore: { annotationIds: [], primaryAnnotationId: null }
            };
        },
        commitHistoryFromBaseline() {
            return;
        },
        clearHistory() {
            const doc = ensureDocument();
            doc?.clearHistory();
        },
        undo() {
            const doc = ensureDocument();
            if (!doc || !doc.undo()) {
                return;
            }
            clearSelection();
            redrawOverlay();
        },
        redo() {
            const doc = ensureDocument();
            if (!doc || !doc.redo()) {
                return;
            }
            clearSelection();
            redrawOverlay();
        },
        canUndo() {
            return ensureDocument()?.canUndo() ?? false;
        },
        canRedo() {
            return ensureDocument()?.canRedo() ?? false;
        },
        setSegmentationTool(tool) {
            const doc = ensureDocument();
            if (!doc) {
                return;
            }
            doc.setActiveTool(tool);
        },
        setSegmentationBrushRadius(radius) {
            const doc = ensureDocument();
            if (!doc) {
                return;
            }
            doc.setBrushRadius(radius);
        },
        setSegmentationActiveClass(classId) {
            const doc = ensureDocument();
            if (!doc) {
                return;
            }
            doc.setActiveClass(classId);
            shell.renderAll();
        },
        setSegmentationOverlayVisibility(visible) {
            const doc = ensureDocument();
            if (!doc) {
                return;
            }
            doc.setOverlayVisible(visible);
            redrawOverlay();
        },
        setSegmentationOverlayOpacity(opacity) {
            const doc = ensureDocument();
            if (!doc) {
                return;
            }
            doc.setOverlayOpacity(opacity);
            redrawOverlay();
        },
        setSegmentationClassVisibility(classId, visible) {
            const doc = ensureDocument();
            if (!doc) {
                return;
            }
            doc.setClassVisibility(classId, visible);
            redrawOverlay();
        },
        setSegmentationOnlyVisibleClass(classId) {
            const doc = ensureDocument();
            if (!doc) {
                return;
            }
            doc.setOnlyVisibleClass(classId);
            redrawOverlay();
        },
        getSegmentationClassAtPoint(pointer) {
            const doc = ensureDocument();
            if (!doc) {
                return null;
            }
            return doc.getClassAtPoint(pointer);
        },
        getSelectedSegmentationClass() {
            return selectedRegion?.classId ?? null;
        },
        selectSegmentationRegionAtPoint(pointer) {
            const doc = ensureDocument();
            if (!doc) {
                return false;
            }
            const region = doc.getConnectedRegionAtPoint(pointer);
            if (!region) {
                clearSelection();
                shell.renderAll();
                return false;
            }
            selectedRegion = region;
            doc.setActiveClass(region.classId);
            redrawOverlay();
            return true;
        },
        clearSegmentationSelection() {
            clearSelection();
            shell.renderAll();
        },
        startSegmentationRegionMove(pointer) {
            const doc = ensureDocument();
            if (!doc || state.currentMode !== "edit" || !selectedRegion) {
                return false;
            }
            const pixelX = Math.max(0, Math.min(doc.width - 1, Math.round(pointer.x)));
            const pixelY = Math.max(0, Math.min(doc.height - 1, Math.round(pointer.y)));
            const clickedIndex = (pixelY * doc.width) + pixelX;
            const isInsideSelection = selectedRegion.pixelIndices.some((index) => index === clickedIndex);
            if (!isInsideSelection) {
                return false;
            }
            moveBaseline = doc.cloneSnapshot();
            moveRegionBaseline = selectedRegion;
            movePointerStart = pointer;
            moveLastDeltaX = null;
            moveLastDeltaY = null;
            return true;
        },
        continueSegmentationRegionMove(pointer) {
            const doc = ensureDocument();
            if (!doc || !moveBaseline || !moveRegionBaseline || !movePointerStart) {
                return false;
            }
            const roundedDeltaX = Math.round(pointer.x - movePointerStart.x);
            const roundedDeltaY = Math.round(pointer.y - movePointerStart.y);
            if (roundedDeltaX === moveLastDeltaX && roundedDeltaY === moveLastDeltaY) {
                return false;
            }
            doc.restoreSnapshot(moveBaseline);
            const movedRegion = doc.moveRegion(moveRegionBaseline, roundedDeltaX, roundedDeltaY, { recordHistory: false });
            if (!movedRegion) {
                return false;
            }
            moveLastDeltaX = roundedDeltaX;
            moveLastDeltaY = roundedDeltaY;
            selectedRegion = movedRegion;
            redrawOverlay();
            return true;
        },
        async finishSegmentationRegionMove() {
            const doc = ensureDocument();
            if (!doc || !moveBaseline || !moveRegionBaseline) {
                return false;
            }
            const changed = doc.pushHistoryFromSnapshot(moveBaseline);
            moveBaseline = null;
            moveRegionBaseline = null;
            movePointerStart = null;
            moveLastDeltaX = null;
            moveLastDeltaY = null;
            redrawOverlay();
            return changed;
        },
        relabelSelectedSegmentationRegion(classId) {
            if (!selectedRegion) {
                return false;
            }
            return controller.relabelSegmentationRegionAtPoint?.(selectedRegion.seedPoint, classId) ?? false;
        },
        relabelSegmentationRegionAtPoint(pointer, classId) {
            const doc = ensureDocument();
            if (!doc) {
                return false;
            }
            const changed = doc.relabelConnectedRegionAtPoint(pointer, classId);
            if (changed) {
                selectedRegion = doc.getConnectedRegionAtPoint(pointer);
                redrawOverlay();
            }
            return changed;
        },
        getSegmentationSummary() {
            return ensureDocument()?.getSummary() ?? createEmptySummary();
        },
        getSegmentationDocumentSnapshot() {
            return ensureDocument()?.cloneSnapshot() ?? null;
        },
        loadSegmentationDocumentSnapshot(snapshot) {
            if (!snapshot) {
                resetDocumentForCurrentImage();
                ensureDocument()?.clearHistory();
                redrawOverlay();
                return;
            }
            const doc = ensureDocument();
            if (!doc) {
                return;
            }
            doc.restoreSnapshot(snapshot);
            doc.clearHistory();
            clearSelection();
            redrawOverlay();
        }
    };
    return controller;
}
