import { createApp } from "./app/createApp.js";
import { createCanvasControllerAdapter } from "./bootstrap/canvas-controller-adapter.js";
import { createEventManagerAdapter } from "./bootstrap/event-manager-adapter.js";
import { createFileSystemAdapter } from "./bootstrap/file-system-adapter.js";
import { getBrowserRuntimeSnapshot, resolveCdnRuntimeGlobals, runLegacyUnsupportedGate } from "./bootstrap/runtime.js";
import { createUiManagerAdapter } from "./bootstrap/ui-manager-adapter.js";
import { ensureAnnotationId } from "./features/canvas/fabric-types.js";
import { normalizeFilterClassKey } from "./ui/filter-state.js";
export function getCdnRuntimeGlobals(scope = window) {
    return resolveCdnRuntimeGlobals(scope);
}
export function createBootstrapProbe() {
    return "scaffold-ready";
}
function bootstrapBrowserRuntime() {
    const gateResult = runLegacyUnsupportedGate({
        windowRef: window,
        documentRef: document,
        navigatorRef: navigator,
        alertRef: window.alert.bind(window)
    });
    if (!gateResult.supported) {
        return;
    }
    const runtimeGlobals = resolveCdnRuntimeGlobals(window);
    const factories = {
        createCanvasController: ({ state }) => {
            return createCanvasControllerAdapter({
                state,
                fabricRef: runtimeGlobals.fabric,
                documentRef: document,
                windowRef: window
            });
        },
        createUIManager: ({ state }) => {
            return createUiManagerAdapter({
                state,
                documentRef: document,
                bootstrapRef: runtimeGlobals.bootstrap,
                windowRef: window,
                storage: localStorage
            });
        },
        createFileSystem: ({ state }) => {
            return createFileSystemAdapter({
                state,
                windowRef: window,
                tiffRef: runtimeGlobals.Tiff
            });
        },
        createEventManager: ({ state, uiManager, fileSystem, canvasController }) => {
            return createEventManagerAdapter({
                state,
                uiManager: uiManager,
                fileSystem: fileSystem,
                canvasController: canvasController,
                windowRef: window
            });
        }
    };
    const appResult = createApp({
        runtime: {
            getBrowserRuntimeSnapshot: () => getBrowserRuntimeSnapshot(window, navigator)
        },
        factories
    });
    if (!appResult.ok) {
        return;
    }
    appResult.app.init();
    appResult.app.canvasController.setMode?.(appResult.app.state.view.currentMode);
    appResult.app.uiManager.togglePreviewBarVisibility?.(true);
    appResult.app.uiManager.updateLabelFolderButton?.(false);
    const runtimeUiManager = appResult.app.uiManager;
    const runtimeCanvasController = appResult.app.canvasController;
    let testSelectionIds = [];
    runtimeUiManager.restoreDarkModeFromStorage();
    runtimeUiManager.setupSplitters();
    Reflect.set(window, "__easyLabelingTestApi", {
        getRectCount: () => runtimeCanvasController.raw.getObjects("rect").length,
        getCurrentImageName: () => appResult.app.state.session.currentImageFile?.name ?? "",
        getVisibleRectCount: () => {
            return runtimeCanvasController.raw
                .getObjects("rect")
                .filter((rect) => rect.visible !== false)
                .length;
        },
        getVisibleClassKeys: () => {
            const visibleClassKeys = runtimeCanvasController.raw
                .getObjects("rect")
                .filter((rect) => rect.visible !== false)
                .map((rect) => normalizeFilterClassKey(rect.labelClass));
            return [...new Set(visibleClassKeys)].sort((left, right) => {
                return left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" });
            });
        },
        getVisibleLabelRowCount: () => {
            return runtimeUiManager.elements.labelList.querySelectorAll("li[data-index]").length;
        },
        getRectGeometries: () => {
            return runtimeCanvasController.raw.getObjects("rect").map((rect) => {
                const bounds = rect.getBoundingRect(true);
                return {
                    annotationId: ensureAnnotationId(rect),
                    left: bounds.left,
                    right: bounds.left + bounds.width,
                    top: bounds.top,
                    bottom: bounds.top + bounds.height,
                    width: bounds.width,
                    height: bounds.height
                };
            });
        },
        getSelectedRectIds: () => {
            const activeObject = runtimeCanvasController.raw.canvas.getActiveObject();
            if (!activeObject) {
                return [...testSelectionIds];
            }
            if (typeof activeObject.getObjects === "function") {
                return activeObject.getObjects().map((rect) => ensureAnnotationId(rect));
            }
            if (Array.isArray(activeObject._objects) && activeObject._objects.length > 0) {
                return activeObject._objects.map((rect) => ensureAnnotationId(rect));
            }
            if (activeObject.type === "rect") {
                return [ensureAnnotationId(activeObject)];
            }
            return [...testSelectionIds];
        },
        getActiveSelectionBounds: () => {
            const activeObject = runtimeCanvasController.raw.canvas.getActiveObject();
            if (!activeObject || activeObject.type !== "activeSelection") {
                return null;
            }
            const bounds = activeObject.getBoundingRect(true);
            return {
                left: bounds.left,
                top: bounds.top,
                width: bounds.width,
                height: bounds.height
            };
        },
        getSegmentationSummary: () => runtimeCanvasController.raw.getSegmentationSummary?.() ?? null,
        getCanvasObjectCounts: () => {
            const counts = new Map();
            runtimeCanvasController.raw.getObjects().forEach((object) => {
                counts.set(object.type, (counts.get(object.type) ?? 0) + 1);
            });
            return Object.fromEntries(counts.entries());
        },
        canUndo: () => runtimeCanvasController.raw.canUndo(),
        canRedo: () => runtimeCanvasController.raw.canRedo(),
        selectRectsByIndex: (indices) => {
            const rects = runtimeCanvasController.raw.getObjects("rect");
            const normalizedIndices = [...new Set(indices.filter((index) => Number.isInteger(index) && index >= 0))].sort((left, right) => left - right);
            if (normalizedIndices.length === rects.length && normalizedIndices.every((index, position) => index === position)) {
                runtimeCanvasController.raw.selectAllLabels();
                testSelectionIds = runtimeCanvasController.raw
                    .getObjects("rect")
                    .map((rect) => ensureAnnotationId(rect));
                return;
            }
            const selectedRects = indices
                .map((index) => (Number.isInteger(index) ? rects[index] : undefined))
                .filter((rect) => rect != null);
            runtimeCanvasController.raw.canvas.discardActiveObject();
            if (selectedRects.length === 0) {
                testSelectionIds = [];
            }
            else if (selectedRects.length === 1) {
                runtimeCanvasController.raw.canvas.setActiveObject(selectedRects[0]);
                testSelectionIds = [ensureAnnotationId(selectedRects[0])];
            }
            else {
                runtimeCanvasController.raw.canvas.setActiveObject(new runtimeGlobals.fabric.ActiveSelection(selectedRects, { canvas: runtimeCanvasController.raw.canvas }));
                testSelectionIds = selectedRects.map((rect) => ensureAnnotationId(rect));
            }
            runtimeCanvasController.raw.renderAll();
        }
    });
}
if (typeof window !== "undefined" && typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", bootstrapBrowserRuntime, { once: true });
}
