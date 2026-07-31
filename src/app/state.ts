import type { ImageWorkflowStatus } from "../domain/annotations/contracts.js";
import type { DirectoryHandle, FileHandle } from "../types/files.js";
import type { AppMode, CanvasPoint, LabelDisplayMode, LabelSortOrder, WorkflowType } from "../types/labels.js";

export type DocumentSavePhase = "clean" | "dirty" | "saving" | "saved" | "error";

export interface WorkflowDocumentStatus {
  phase: DocumentSavePhase;
  revision: number;
  savedRevision: number;
  lastSavedAt: string | null;
  errorMessage: string | null;
  wasAutoSaved: boolean;
}

export interface ImageDocumentStatus {
  detection: WorkflowDocumentStatus;
  segmentation: WorkflowDocumentStatus;
}

export interface AppSessionState {
  imageFolderHandle: DirectoryHandle | null;
  labelFolderHandle: DirectoryHandle | null;
  classInfoFolderHandle: DirectoryHandle | null;
  imageFiles: FileHandle[];
  classFiles: FileHandle[];
  selectedClassFile: FileHandle | null;
  imageWorkflowStatus: Map<string, ImageWorkflowStatus>;
  currentImageFile: FileHandle | null;
  currentImage: HTMLImageElement | null;
  classNames: Map<string, string>;
  workflow: WorkflowType;
  documentStatusByImage?: Map<string, ImageDocumentStatus>;
}

export interface AppViewState {
  currentMode: AppMode;
  isAutoSaveEnabled: boolean;
  showLabelsOnCanvas: boolean;
  labelDisplayMode?: LabelDisplayMode;
  labelFontSize: number;
  lastMousePosition: CanvasPoint;
  labelSortOrder: LabelSortOrder;
  isCrosshairVisible: boolean;
  contextTarget: EventTarget | null;
  collapsedLabelGroups: Set<string>;
  hiddenLabelClasses: Set<string>;
  clearSelectionWhenFilteredHidden: boolean;
  persistFilterStateAcrossImageNavigation: boolean;
  resetFilterStateOnSessionReplacement: boolean;
}

export interface AppRuntimeState {
  saveTimeout: ReturnType<typeof setTimeout> | null;
  currentLoadToken: number;
  clipboard: unknown;
}

export interface AppState {
  session: AppSessionState;
  view: AppViewState;
  runtime: AppRuntimeState;
}

export function createInitialAppState(): AppState {
  return {
    session: {
      imageFolderHandle: null,
      labelFolderHandle: null,
      classInfoFolderHandle: null,
      imageFiles: [],
      classFiles: [],
      selectedClassFile: null,
      imageWorkflowStatus: new Map<string, ImageWorkflowStatus>(),
      currentImageFile: null,
      currentImage: null,
      classNames: new Map<string, string>(),
      workflow: "detection",
      documentStatusByImage: new Map()
    },
    view: {
      currentMode: "edit",
      isAutoSaveEnabled: false,
      showLabelsOnCanvas: true,
      labelDisplayMode: "auto",
      labelFontSize: 14,
      lastMousePosition: { x: 0, y: 0 },
      labelSortOrder: "asc",
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
      clipboard: null
    }
  };
}
