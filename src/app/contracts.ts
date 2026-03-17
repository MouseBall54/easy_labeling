import type { BrowserRuntimeSnapshot } from "../types/runtime.js";
import type { AppMode } from "../types/labels.js";
import type { AppState } from "./state.js";

export interface CanvasControllerDeps {
  uiManager: UIManager;
  fileSystem: FileSystem;
}

export interface UIManagerDeps {
  canvasController: CanvasController;
  fileSystem: FileSystem;
}

export interface FileSystemDeps {
  uiManager: UIManager;
  canvasController: CanvasController;
}

export interface CanvasController {
  connect(deps: CanvasControllerDeps): void;
  setMode?(mode: AppMode): void;
}

export interface UIManager {
  connect(deps: UIManagerDeps): void;
  updateLabelFolderButton?(hasLabelFolder: boolean): void;
  togglePreviewBarVisibility?(hidden: boolean): void;
}

export interface FileSystem {
  connect(deps: FileSystemDeps): void;
}

export interface EventManager {
  bindEventListeners(): void;
}

export interface ServiceFactoryInput {
  state: AppState;
}

export interface EventManagerFactoryInput extends ServiceFactoryInput {
  uiManager: UIManager;
  fileSystem: FileSystem;
  canvasController: CanvasController;
}

export interface AppServiceFactories {
  createCanvasController(input: ServiceFactoryInput): CanvasController;
  createUIManager(input: ServiceFactoryInput): UIManager;
  createFileSystem(input: ServiceFactoryInput): FileSystem;
  createEventManager(input: EventManagerFactoryInput): EventManager;
}

export interface AppRuntimeReaders {
  getBrowserRuntimeSnapshot(): BrowserRuntimeSnapshot;
}
