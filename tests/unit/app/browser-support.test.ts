import { describe, expect, it, vi } from "vitest";

import { createApp } from "../../../src/app/createApp.js";
import { evaluateBrowserSupport } from "../../../src/platform/browser-support.js";
import type {
  AppServiceFactories,
  CanvasController,
  EventManager,
  FileSystem,
  UIManager
} from "../../../src/app/contracts.js";
import type { AppState } from "../../../src/app/state.js";
import { createEmptyReviewDocument } from "../../../src/domain/annotations/review.js";

function createFactorySpies() {
  const createState = vi.fn((): AppState => ({
    session: {
      imageFolderHandle: null,
      labelFolderHandle: null,
      classInfoFolderHandle: null,
      imageFiles: [],
      classFiles: [],
      selectedClassFile: null,
      imageWorkflowStatus: new Map(),
      currentImageFile: null,
      currentImage: null,
      classNames: new Map<string, string>(),
      workflow: "detection",
      reviewTargetWorkflow: "detection",
      reviewDocuments: {
        detection: createEmptyReviewDocument("detection"),
        segmentation: createEmptyReviewDocument("segmentation")
      }
    },
    view: {
      currentMode: "edit",
      isAutoSaveEnabled: false,
      showLabelsOnCanvas: true,
      labelFontSize: 14,
      lastMousePosition: { x: 0, y: 0 },
      labelSortOrder: "asc",
      isPreviewBarHidden: false,
      isCrosshairVisible: false,
      contextTarget: null,
      collapsedLabelGroups: new Set<string>(),
      hiddenLabelClasses: new Set<string>(),
      clearSelectionWhenFilteredHidden: true,
      persistFilterStateAcrossImageNavigation: true,
      resetFilterStateOnSessionReplacement: true
    },
    runtime: {
      saveTimeout: null,
      currentLoadToken: 0,
      clipboard: null,
      previewImageCache: new Map<string, string>()
    }
  }));

  const canvasController: CanvasController = {
    connect: vi.fn()
  };
  const uiManager: UIManager = {
    connect: vi.fn()
  };
  const fileSystem: FileSystem = {
    connect: vi.fn()
  };
  const eventManager: EventManager = {
    bindEventListeners: vi.fn()
  };

  const factories: AppServiceFactories = {
    createCanvasController: vi.fn(() => canvasController),
    createUIManager: vi.fn(() => uiManager),
    createFileSystem: vi.fn(() => fileSystem),
    createEventManager: vi.fn(() => eventManager)
  };

  return {
    createState,
    factories,
    canvasController,
    uiManager,
    fileSystem,
    eventManager
  };
}

describe("browser support evaluation", () => {
  it("marks mobile user agents unsupported", () => {
    const support = evaluateBrowserSupport({
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
      hasShowDirectoryPicker: true
    });

    expect(support.supported).toBe(false);
    expect(support.reason).toBe("mobile-user-agent");
    expect(support.isMobile).toBe(true);
  });
});

describe("createApp browser support and composition", () => {
  it("returns unsupported when showDirectoryPicker is missing and skips factories", () => {
    const harness = createFactorySpies();

    const result = createApp({
      runtime: {
        getBrowserRuntimeSnapshot: () => ({
          userAgent: "Mozilla/5.0 (X11; Linux x86_64)",
          hasShowDirectoryPicker: false
        })
      },
      factories: harness.factories,
      createState: harness.createState
    });

    expect(result).toEqual({ ok: false, reason: "missing-show-directory-picker" });
    expect(harness.createState).not.toHaveBeenCalled();
    expect(harness.factories.createCanvasController).not.toHaveBeenCalled();
    expect(harness.factories.createUIManager).not.toHaveBeenCalled();
    expect(harness.factories.createFileSystem).not.toHaveBeenCalled();
    expect(harness.factories.createEventManager).not.toHaveBeenCalled();
  });

  it("returns unsupported for mobile user agent", () => {
    const harness = createFactorySpies();

    const result = createApp({
      runtime: {
        getBrowserRuntimeSnapshot: () => ({
          userAgent: "Mozilla/5.0 (Android 14; Mobile)",
          hasShowDirectoryPicker: true
        })
      },
      factories: harness.factories,
      createState: harness.createState
    });

    expect(result).toEqual({ ok: false, reason: "mobile-user-agent" });
    expect(harness.createState).not.toHaveBeenCalled();
    expect(harness.factories.createCanvasController).not.toHaveBeenCalled();
    expect(harness.factories.createUIManager).not.toHaveBeenCalled();
    expect(harness.factories.createFileSystem).not.toHaveBeenCalled();
    expect(harness.factories.createEventManager).not.toHaveBeenCalled();
  });

  it("creates, connects, and returns init without auto-calling it in supported env", () => {
    const harness = createFactorySpies();

    const result = createApp({
      runtime: {
        getBrowserRuntimeSnapshot: () => ({
          userAgent: "Mozilla/5.0 (X11; Linux x86_64)",
          hasShowDirectoryPicker: true
        })
      },
      factories: harness.factories,
      createState: harness.createState
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("expected supported app");
    }

    expect(harness.createState).toHaveBeenCalledTimes(1);
    expect(harness.factories.createCanvasController).toHaveBeenCalledTimes(1);
    expect(harness.factories.createUIManager).toHaveBeenCalledTimes(1);
    expect(harness.factories.createFileSystem).toHaveBeenCalledTimes(1);
    expect(harness.factories.createEventManager).toHaveBeenCalledTimes(1);

    expect(harness.uiManager.connect).toHaveBeenCalledWith({
      canvasController: harness.canvasController,
      fileSystem: harness.fileSystem
    });
    expect(harness.fileSystem.connect).toHaveBeenCalledWith({
      uiManager: harness.uiManager,
      canvasController: harness.canvasController
    });
    expect(harness.canvasController.connect).toHaveBeenCalledWith({
      uiManager: harness.uiManager,
      fileSystem: harness.fileSystem
    });

    expect(harness.eventManager.bindEventListeners).not.toHaveBeenCalled();
    result.app.init();
    expect(harness.eventManager.bindEventListeners).toHaveBeenCalledTimes(1);
  });
});
