import type {
  AppRuntimeReaders,
  AppServiceFactories,
  CanvasController,
  EventManager,
  FileSystem,
  UIManager
} from "./contracts.js";
import { createInitialAppState, type AppState } from "./state.js";
import { evaluateBrowserSupport } from "../platform/browser-support.js";
import type { BrowserSupportReport, UnsupportedAppReason } from "../types/runtime.js";

export interface LegacyAppGraph {
  state: AppState;
  canvasController: CanvasController;
  uiManager: UIManager;
  fileSystem: FileSystem;
  eventManager: EventManager;
  init(): void;
}

export type CreateAppResult =
  | { ok: true; app: LegacyAppGraph }
  | { ok: false; reason: UnsupportedAppReason };

export interface CreateAppInput {
  runtime: AppRuntimeReaders;
  factories: AppServiceFactories;
  createState?: () => AppState;
  evaluateSupport?: (snapshot: ReturnType<AppRuntimeReaders["getBrowserRuntimeSnapshot"]>) => BrowserSupportReport;
}

export function createApp(input: CreateAppInput): CreateAppResult {
  const snapshot = input.runtime.getBrowserRuntimeSnapshot();
  const support = (input.evaluateSupport ?? evaluateBrowserSupport)(snapshot);

  if (!support.supported) {
    return {
      ok: false,
      reason: support.reason ?? "missing-show-directory-picker"
    };
  }

  const state = (input.createState ?? createInitialAppState)();

  const canvasController = input.factories.createCanvasController({ state });
  const uiManager = input.factories.createUIManager({ state });
  const fileSystem = input.factories.createFileSystem({ state });

  uiManager.connect({ canvasController, fileSystem });
  fileSystem.connect({ uiManager, canvasController });
  canvasController.connect({ uiManager, fileSystem });

  const eventManager = input.factories.createEventManager({
    state,
    uiManager,
    fileSystem,
    canvasController
  });

  return {
    ok: true,
    app: {
      state,
      canvasController,
      uiManager,
      fileSystem,
      eventManager,
      init(): void {
        eventManager.bindEventListeners();
      }
    }
  };
}
