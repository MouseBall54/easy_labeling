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
import { ensureAnnotationId } from "./features/canvas/fabric-types.js";
import { normalizeFilterClassKey } from "./ui/filter-state.js";

export type { CdnRuntimeGlobals };

interface TestApi {
  getRectCount(): number;
  getCurrentImageName(): string;
  getVisibleRectCount(): number;
  getVisibleClassKeys(): string[];
  getVisibleLabelRowCount(): number;
  getRectGeometries(): Array<{
    annotationId: string;
    left: number;
    right: number;
    top: number;
    bottom: number;
    width: number;
    height: number;
  }>;
  getSelectedRectIds(): string[];
  getActiveSelectionBounds(): {
    left: number;
    top: number;
    width: number;
    height: number;
  } | null;
  getSegmentationSummary(): {
    activeClassId: string;
    activeTool: string;
    overlayVisible: boolean;
    overlayOpacity: number;
    visibleClassIds: string[];
  } | null;
  getCanvasObjectCounts(): Record<string, number>;
  canUndo(): boolean;
  canRedo(): boolean;
  selectRectsByIndex(indices: number[]): void;
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
  let testSelectionIds: string[] = [];
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
          annotationId: ensureAnnotationId(rect as Parameters<typeof ensureAnnotationId>[0]),
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
      const activeObject = runtimeCanvasController.raw.canvas.getActiveObject() as {
        getObjects?: () => Array<{ annotationId?: unknown }>;
        _objects?: Array<{ annotationId?: unknown }>;
        type?: string;
        annotationId?: unknown;
      } | null;
      if (!activeObject) {
        return [...testSelectionIds];
      }
      if (typeof activeObject.getObjects === "function") {
        return activeObject.getObjects().map((rect) => ensureAnnotationId(rect as Parameters<typeof ensureAnnotationId>[0]));
      }
      if (Array.isArray(activeObject._objects) && activeObject._objects.length > 0) {
        return activeObject._objects.map((rect) => ensureAnnotationId(rect as Parameters<typeof ensureAnnotationId>[0]));
      }
      if (activeObject.type === "rect") {
        return [ensureAnnotationId(activeObject as Parameters<typeof ensureAnnotationId>[0])];
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
      const counts = new Map<string, number>();
      runtimeCanvasController.raw.getObjects().forEach((object) => {
        counts.set(object.type, (counts.get(object.type) ?? 0) + 1);
      });
      return Object.fromEntries(counts.entries());
    },
    canUndo: () => runtimeCanvasController.raw.canUndo(),
    canRedo: () => runtimeCanvasController.raw.canRedo(),
    selectRectsByIndex: (indices: number[]) => {
      const rects = runtimeCanvasController.raw.getObjects("rect");
      const normalizedIndices = [...new Set(indices.filter((index) => Number.isInteger(index) && index >= 0))].sort(
        (left, right) => left - right
      );
      if (normalizedIndices.length === rects.length && normalizedIndices.every((index, position) => index === position)) {
        runtimeCanvasController.raw.selectAllLabels();
        testSelectionIds = runtimeCanvasController.raw
          .getObjects("rect")
          .map((rect) => ensureAnnotationId(rect as Parameters<typeof ensureAnnotationId>[0]));
        return;
      }
      const selectedRects = indices
        .map((index) => (Number.isInteger(index) ? rects[index] : undefined))
        .filter((rect): rect is (typeof rects)[number] => rect != null);
      runtimeCanvasController.raw.canvas.discardActiveObject();
      if (selectedRects.length === 0) {
        testSelectionIds = [];
      } else if (selectedRects.length === 1) {
        runtimeCanvasController.raw.canvas.setActiveObject(selectedRects[0]);
        testSelectionIds = [ensureAnnotationId(selectedRects[0] as Parameters<typeof ensureAnnotationId>[0])];
      } else {
        runtimeCanvasController.raw.canvas.setActiveObject(
          new runtimeGlobals.fabric.ActiveSelection(selectedRects, { canvas: runtimeCanvasController.raw.canvas })
        );
        testSelectionIds = selectedRects.map((rect) => ensureAnnotationId(rect as Parameters<typeof ensureAnnotationId>[0]));
      }
      runtimeCanvasController.raw.renderAll();
    }
  } satisfies TestApi);
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", bootstrapBrowserRuntime, { once: true });
}
