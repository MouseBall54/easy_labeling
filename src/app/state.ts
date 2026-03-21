import type { DirectoryHandle, FileHandle } from "../types/files.js";
import type { AppMode, CanvasPoint, LabelSortOrder } from "../types/labels.js";

export interface AppSessionState {
  imageFolderHandle: DirectoryHandle | null;
  labelFolderHandle: DirectoryHandle | null;
  classInfoFolderHandle: DirectoryHandle | null;
  imageFiles: FileHandle[];
  classFiles: FileHandle[];
  selectedClassFile: FileHandle | null;
  imageLabelStatus: Map<string, boolean>;
  currentImageFile: FileHandle | null;
  currentImage: HTMLImageElement | null;
  classNames: Map<string, string>;
}

export interface AppViewState {
  currentMode: AppMode;
  isAutoSaveEnabled: boolean;
  showLabelsOnCanvas: boolean;
  labelFontSize: number;
  lastMousePosition: CanvasPoint;
  labelSortOrder: LabelSortOrder;
  isPreviewBarHidden: boolean;
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
  previewImageCache: Map<string, string>;
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
      imageLabelStatus: new Map<string, boolean>(),
      currentImageFile: null,
      currentImage: null,
      classNames: new Map<string, string>()
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
  };
}
