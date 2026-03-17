import { createApp } from "./app/createApp.js";
import type { AppServiceFactories } from "./app/contracts.js";
import {
  createCanvasControllerAdapter,
  type RuntimeCanvasController
} from "./bootstrap/canvas-controller-adapter.js";
import { createEventManagerAdapter } from "./bootstrap/event-manager-adapter.js";
import { createFileSystemAdapter, type RuntimeFileSystem } from "./bootstrap/file-system-adapter.js";
import {
  getBrowserRuntimeSnapshot,
  resolveCdnRuntimeGlobals,
  runLegacyUnsupportedGate,
  type CdnRuntimeGlobals
} from "./bootstrap/runtime.js";
import { createUiManagerAdapter, type RuntimeUiManager } from "./bootstrap/ui-manager-adapter.js";

export type { CdnRuntimeGlobals };

interface TestApi {
  getRectCount(): number;
  getCurrentImageName(): string;
}

export function getCdnRuntimeGlobals(
  scope: Pick<Window, "fabric" | "Tiff" | "bootstrap"> = window
): CdnRuntimeGlobals {
  return resolveCdnRuntimeGlobals(scope);
}

export function createBootstrapProbe(): "scaffold-ready" {
  return "scaffold-ready";
}

function bootstrapBrowserRuntime(): void {
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

  const factories: AppServiceFactories = {
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
        uiManager: uiManager as RuntimeUiManager,
        fileSystem: fileSystem as RuntimeFileSystem,
        canvasController: canvasController as RuntimeCanvasController,
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

  const runtimeUiManager = appResult.app.uiManager as RuntimeUiManager;
  const runtimeCanvasController = appResult.app.canvasController as RuntimeCanvasController;
  runtimeUiManager.restoreDarkModeFromStorage();
  runtimeUiManager.setupSplitters();

  Reflect.set(window, "__easyLabelingTestApi", {
    getRectCount: () => runtimeCanvasController.raw.getObjects("rect").length,
    getCurrentImageName: () => appResult.app.state.session.currentImageFile?.name ?? ""
  } satisfies TestApi);
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", bootstrapBrowserRuntime, { once: true });
}
