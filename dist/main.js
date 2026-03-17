import { createApp } from "./app/createApp.js";
import { createCanvasControllerAdapter } from "./bootstrap/canvas-controller-adapter.js";
import { createEventManagerAdapter } from "./bootstrap/event-manager-adapter.js";
import { createFileSystemAdapter } from "./bootstrap/file-system-adapter.js";
import { getBrowserRuntimeSnapshot, resolveCdnRuntimeGlobals, runLegacyUnsupportedGate } from "./bootstrap/runtime.js";
import { createUiManagerAdapter } from "./bootstrap/ui-manager-adapter.js";
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
    runtimeUiManager.restoreDarkModeFromStorage();
    runtimeUiManager.setupSplitters();
    Reflect.set(window, "__easyLabelingTestApi", {
        getRectCount: () => runtimeCanvasController.raw.getObjects("rect").length,
        getCurrentImageName: () => appResult.app.state.session.currentImageFile?.name ?? ""
    });
}
if (typeof window !== "undefined" && typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", bootstrapBrowserRuntime, { once: true });
}
