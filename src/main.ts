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
import { ensureAnnotationId, isActiveSelectionObject, isRectObject } from "./features/canvas/fabric-types.js";
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
  getSegmentationMaskBounds(): {
    left: number;
    top: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
  } | null;
  getSegmentationClassAtPoint(x: number, y: number): string | null;
  getSegmentationOverlayPixel(x: number, y: number): number[] | null;
  getCanvasObjectCounts(): Record<string, number>;
  getCanvasLayerCounts(): {
    baseImages: number;
    segmentationOverlays: number;
    otherImages: number;
  };
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
      if (isRectObject(activeObject as Parameters<typeof isRectObject>[0])) {
        return [ensureAnnotationId(activeObject as Parameters<typeof ensureAnnotationId>[0])];
      }
      return [...testSelectionIds];
    },
    getActiveSelectionBounds: () => {
      const activeObject = runtimeCanvasController.raw.canvas.getActiveObject();
      if (!activeObject || !isActiveSelectionObject(activeObject)) {
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
    getSegmentationMaskBounds: () => {
      const snapshot = runtimeCanvasController.raw.getSegmentationDocumentSnapshot?.();
      if (!snapshot) {
        return null;
      }
      let left = snapshot.width;
      let top = snapshot.height;
      let right = -1;
      let bottom = -1;
      for (let index = 0; index < snapshot.mask.length; index += 1) {
        if (snapshot.mask[index] === 0) {
          continue;
        }
        const x = index % snapshot.width;
        const y = Math.floor(index / snapshot.width);
        left = Math.min(left, x);
        top = Math.min(top, y);
        right = Math.max(right, x);
        bottom = Math.max(bottom, y);
      }
      if (right < left || bottom < top) {
        return null;
      }
      return {
        left,
        top,
        right,
        bottom,
        width: right - left + 1,
        height: bottom - top + 1
      };
    },
    getSegmentationClassAtPoint: (x: number, y: number) => {
      return runtimeCanvasController.raw.getSegmentationClassAtPoint?.({ x, y }) ?? null;
    },
    getSegmentationOverlayPixel: (x: number, y: number) => {
      const imageObjects = runtimeCanvasController.raw.getObjects("image") as Array<{
        _isSegmentationOverlay?: boolean;
        element?: unknown;
        _element?: unknown;
        _originalElement?: unknown;
        getElement?: () => unknown;
      }>;
      const overlayObject = imageObjects.find((object) => object._isSegmentationOverlay);
      const overlayElement = overlayObject?.element ??
        overlayObject?.getElement?.() ??
        overlayObject?._element ??
        overlayObject?._originalElement;
      if (x < 0 || y < 0) {
        return null;
      }
      const pixelX = Math.round(x);
      const pixelY = Math.round(y);
      if (overlayElement instanceof HTMLCanvasElement) {
        if (pixelX >= overlayElement.width || pixelY >= overlayElement.height) {
          return null;
        }
        const pixel = overlayElement.getContext("2d")?.getImageData(pixelX, pixelY, 1, 1).data;
        return pixel ? Array.from(pixel) : null;
      }
      if (
        overlayElement &&
        typeof overlayElement === "object" &&
        "overlayPixels" in overlayElement &&
        "width" in overlayElement &&
        "height" in overlayElement
      ) {
        const fallback = overlayElement as { overlayPixels: Uint8ClampedArray; width: number; height: number };
        if (pixelX >= fallback.width || pixelY >= fallback.height) {
          return null;
        }
        const offset = ((pixelY * fallback.width) + pixelX) * 4;
        return Array.from(fallback.overlayPixels.slice(offset, offset + 4));
      }
      return null;
    },
    getCanvasObjectCounts: () => {
      const counts = new Map<string, number>();
      const incrementType = (type: string | undefined): void => {
        if (!type) {
          return;
        }
        const key = type.toLowerCase();
        counts.set(key, (counts.get(key) ?? 0) + 1);
      };
      runtimeCanvasController.raw.getObjects().forEach((object) => {
        incrementType(object.type);
      });
      const backgroundImage = runtimeCanvasController.raw.canvas.backgroundImage as { type?: string } | undefined;
      incrementType(backgroundImage?.type);
      return Object.fromEntries(counts.entries());
    },
    getCanvasLayerCounts: () => {
      const imageObjects = runtimeCanvasController.raw.getObjects("image") as Array<{
        _isBaseImage?: boolean;
        _isSegmentationOverlay?: boolean;
      }>;
      return {
        baseImages: imageObjects.filter((object) => object._isBaseImage).length,
        segmentationOverlays: imageObjects.filter((object) => object._isSegmentationOverlay).length,
        otherImages: imageObjects.filter((object) => !object._isBaseImage && !object._isSegmentationOverlay).length
      };
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
