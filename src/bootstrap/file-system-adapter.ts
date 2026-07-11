import type { FileSystem, FileSystemDeps } from "../app/contracts.js";
import type { AppState } from "../app/state.js";
import {
  createImageSessionService,
  type ImageSessionService,
  type ImageSessionServiceState
} from "../features/images/image-session-service.js";
import {
  createNewClassFile,
  readClassNamesFromFileHandle,
  readClassFileRowsForEditor,
  validateAndSaveClassRowsToFileHandle,
  type ReadClassNamesResult
} from "../features/classes/class-file-service.js";
import { listFileHandles } from "../platform/file-system-access.js";
import type { ClassFileRow } from "../domain/class-files.js";
import type { DirectoryHandleLike, FileHandle, FileHandleLike } from "../types/files.js";
import type { RuntimeCanvasController } from "./canvas-controller-adapter.js";
import type { RuntimeUiManager } from "./ui-manager-adapter.js";
import { deriveHiddenLabelClassesForResetScope } from "../ui/filter-state.js";
import { createImageDecoder } from "../features/images/image-decoder.js";
import { imageFileNameToBaseName } from "../domain/files/image-names.js";
import { createEmptyImageWorkflowStatus } from "../domain/annotations/contracts.js";
import { isNotFoundError, readTextFileByName, writeTextFileByName } from "../platform/file-system-access.js";
import { createBundledSampleDirectory } from "../features/sample/sample-test-directory.js";

class LiveImageSessionState implements ImageSessionServiceState {
  constructor(private readonly appState: AppState) {}

  get imageFolderHandle() {
    return this.appState.session.imageFolderHandle as unknown as DirectoryHandleLike | null;
  }

  set imageFolderHandle(value) {
    this.appState.session.imageFolderHandle = value as unknown as FileSystemDirectoryHandle | null;
  }

  get labelFolderHandle() {
    return this.appState.session.labelFolderHandle as unknown as DirectoryHandleLike | null;
  }

  set labelFolderHandle(value) {
    this.appState.session.labelFolderHandle = value as unknown as FileSystemDirectoryHandle | null;
  }

  get imageFiles() {
    return this.appState.session.imageFiles as unknown as FileHandleLike[];
  }

  set imageFiles(value) {
    this.appState.session.imageFiles = value as unknown as FileSystemFileHandle[];
  }

  get imageWorkflowStatus() {
    return this.appState.session.imageWorkflowStatus;
  }

  set imageWorkflowStatus(value) {
    this.appState.session.imageWorkflowStatus = value;
  }

  get currentImageFile() {
    return this.appState.session.currentImageFile as unknown as FileHandleLike | null;
  }

  set currentImageFile(value) {
    this.appState.session.currentImageFile = value as unknown as FileSystemFileHandle | null;
  }

  get currentImage() {
    return this.appState.session.currentImage;
  }

  set currentImage(value) {
    this.appState.session.currentImage = value;
  }

  get currentLoadToken() {
    return this.appState.runtime.currentLoadToken;
  }

  set currentLoadToken(value) {
    this.appState.runtime.currentLoadToken = value;
  }

  get isAutoSaveEnabled() {
    return this.appState.view.isAutoSaveEnabled;
  }

  set isAutoSaveEnabled(value) {
    this.appState.view.isAutoSaveEnabled = value;
  }

  get workflow() {
    return this.appState.session.workflow;
  }

  set workflow(value) {
    this.appState.session.workflow = value;
  }

  get classFiles() {
    return this.appState.session.classFiles as unknown as FileHandleLike[];
  }

  set classFiles(value) {
    this.appState.session.classFiles = value as unknown as FileSystemFileHandle[];
  }

  get classNames() {
    return this.appState.session.classNames;
  }

  set classNames(value) {
    this.appState.session.classNames = value;
  }

  get previewImageCache() {
    return this.appState.runtime.previewImageCache;
  }

  set previewImageCache(value) {
    this.appState.runtime.previewImageCache = value;
  }

  get saveTimeout() {
    return this.appState.runtime.saveTimeout;
  }

  set saveTimeout(value) {
    this.appState.runtime.saveTimeout = value;
  }
}

export interface RuntimeFileSystem extends FileSystem {
  selectImageFolder(): Promise<void>;
  loadSampleTestData(): Promise<void>;
  selectLabelFolder(): Promise<void>;
  selectClassInfoFolder(): Promise<void>;
  saveLabels(isAuto?: boolean): Promise<void>;
  navigateImage(direction: number): Promise<void>;
  loadImage(fileHandle: FileHandleLike): Promise<void>;
  decodeImageForAutomation(fileHandle: FileHandleLike): Promise<HTMLImageElement>;
  readDetectionLabels(imageFileName: string): Promise<string>;
  writeDetectionLabels(imageFileName: string, yoloData: string): Promise<void>;
  loadClassNamesFromFile(fileHandle: FileHandleLike): Promise<void>;
  showClassFileContent(): Promise<void>;
  saveClassFileContent(): Promise<void>;
  addNewClassRow(): void;
  createNewClassFile(): Promise<void>;
  readonly imageSessionService: ImageSessionService;
}

interface FileSystemWindowRuntime {
  showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
  getEasyLabelingSampleDirectory?: () => Promise<FileSystemDirectoryHandle>;
  clearTimeout: typeof window.clearTimeout;
  confirm: (message?: string) => boolean;
  URL: Pick<typeof URL, "createObjectURL" | "revokeObjectURL">;
  dispatchEvent?: (event: Event) => boolean;
}

export function createFileSystemAdapter(input: {
  state: AppState;
  windowRef: FileSystemWindowRuntime;
  tiffRef: unknown;
}): RuntimeFileSystem {
  let connectedDeps: FileSystemDeps | null = null;
  let pendingLoadedYolo: string | null = null;
  let pendingLoadedSegmentationSnapshot: import("../features/segmentation/types.js").SegmentationDocumentSnapshot | null = null;
  let operationChain: Promise<void> = Promise.resolve();

  const enqueueOperation = async (operation: () => Promise<void>): Promise<void> => {
    operationChain = operationChain.then(operation, operation);
    await operationChain;
  };

  const decodeImage = createImageDecoder({
    tiffRef: input.tiffRef,
    urlRuntime: input.windowRef.URL
  });

  const applyCurrentImageToCanvas = (): void => {
    if (!connectedDeps) {
      return;
    }

    const canvasController = connectedDeps.canvasController as RuntimeCanvasController;
    const uiManager = connectedDeps.uiManager as RuntimeUiManager;
    const currentImage = input.state.session.currentImage;

    if (!(currentImage instanceof HTMLImageElement)) {
      return;
    }

    canvasController.raw.clearHistory();
    canvasController.raw.clear();
    canvasController.raw.setBackgroundImage(currentImage);
    if (pendingLoadedYolo && pendingLoadedYolo.trim()) {
      canvasController.raw.addLabelsFromYolo(pendingLoadedYolo);
    }
    canvasController.raw.loadSegmentationDocumentSnapshot?.(pendingLoadedSegmentationSnapshot);
    pendingLoadedYolo = null;
    pendingLoadedSegmentationSnapshot = null;
    canvasController.raw.resetZoom();
    uiManager.updateCurrentImageName();
    uiManager.updateZoomDisplay(canvasController.raw.canvas.getZoom());
    uiManager.renderImageList();
    uiManager.renderPreviewList();
    uiManager.updateLabelList();
    uiManager.setWorkflow?.(input.state.session.workflow);
    input.windowRef.dispatchEvent?.(new CustomEvent("easy-labeling:history-reset"));
  };

  const syncAfterImageLoad = async (fileHandle: FileHandleLike): Promise<void> => {
    if (!connectedDeps) {
      return;
    }

    pendingLoadedYolo = null;
    pendingLoadedSegmentationSnapshot = null;
    await imageSessionService.loadImageAndLabels(fileHandle);
    applyCurrentImageToCanvas();
  };

  const refreshClassFileStateFromAvailableFolder = async (): Promise<void> => {
    const classFolder = (input.state.session.classInfoFolderHandle ?? input.state.session.labelFolderHandle) as DirectoryHandleLike | null;
    const previousSelectionName = input.state.session.selectedClassFile?.name ?? null;

    if (!classFolder) {
      input.state.session.classFiles = [];
      input.state.session.selectedClassFile = null;
      input.state.session.classNames = new Map<string, string>();
      if (connectedDeps) {
        const uiManager = connectedDeps.uiManager as RuntimeUiManager;
        uiManager.renderClassFileSelect();
        uiManager.updateLabelList();
      }
      return;
    }

    const files = (await listFileHandles(classFolder)).filter((file) => /\.(yaml|yml)$/i.test(file.name)) as FileHandle[];
    input.state.session.classFiles = files;

    const selectedFile =
      files.find((file) => file.name === previousSelectionName) ??
      files[0] ??
      null;

    if (selectedFile) {
      await loadClassNamesIntoState(selectedFile, input.state);
    } else {
      input.state.session.selectedClassFile = null;
      input.state.session.classNames = new Map<string, string>();
    }

    if (connectedDeps) {
      const uiManager = connectedDeps.uiManager as RuntimeUiManager;
      uiManager.renderClassFileSelect();
      uiManager.updateLabelList();
    }
  };

  const imageSessionService = createImageSessionService(new LiveImageSessionState(input.state), {
    decodeImage: async ({ fileHandle }) => decodeImage(fileHandle),
    readCurrentLabelsAsYolo: () => {
      if (!connectedDeps) {
        return "";
      }
      return (connectedDeps.canvasController as RuntimeCanvasController).raw.getLabelsAsYolo();
    },
    readCurrentSegmentationSnapshot: () => {
      if (!connectedDeps) {
        return null;
      }
      return (connectedDeps.canvasController as RuntimeCanvasController).raw.getSegmentationDocumentSnapshot?.() ?? null;
    },
    applyLoadedYolo: async (yoloData) => {
      if (!connectedDeps) {
        return;
      }
      pendingLoadedYolo = yoloData;
    },
    applyLoadedSegmentationSnapshot: async (snapshot) => {
      if (!connectedDeps) {
        return;
      }
      pendingLoadedSegmentationSnapshot = snapshot;
    },
    clearPendingSaveTimeout: (timeout) => {
      if (timeout) {
        input.windowRef.clearTimeout(timeout);
      }
    },
    revokePreviewUrl: (url) => {
      input.windowRef.URL.revokeObjectURL(url);
    },
    shouldCreateMissingLabelFolder: () => {
      return input.windowRef.confirm('"label" subfolder not found. Do you want to create it?');
    }
  });

  const activateImageFolder = async (imageFolderHandle: DirectoryHandleLike): Promise<void> => {
    pendingLoadedYolo = null;
    await imageSessionService.selectImageFolder(imageFolderHandle);
    input.state.view.hiddenLabelClasses = deriveHiddenLabelClassesForResetScope({
      scope: "session-replacement",
      hiddenLabelClasses: input.state.view.hiddenLabelClasses,
      persistFilterStateAcrossImageNavigation: input.state.view.persistFilterStateAcrossImageNavigation,
      resetFilterStateOnSessionReplacement: input.state.view.resetFilterStateOnSessionReplacement
    });
    applyCurrentImageToCanvas();
    await refreshClassFileStateFromAvailableFolder();

    if (!connectedDeps) {
      return;
    }
    const uiManager = connectedDeps.uiManager as RuntimeUiManager;
    uiManager.elements.selectLabelFolderBtn.removeAttribute("disabled");
    uiManager.updateLabelFolderButton(Boolean(input.state.session.labelFolderHandle));
    uiManager.renderImageList();
    uiManager.renderPreviewList();
  };

  const fileSystem: RuntimeFileSystem = {
    imageSessionService,

      connect(deps: FileSystemDeps): void {
        connectedDeps = deps;
      },

      async selectImageFolder(): Promise<void> {
        await enqueueOperation(async () => {
          const uiManager = connectedDeps ? (connectedDeps.uiManager as RuntimeUiManager) : null;
          uiManager?.showLoading();
          try {
          const picker = input.windowRef.showDirectoryPicker;
          if (typeof picker !== "function") {
            return;
          }

          if (input.state.view.isAutoSaveEnabled && input.state.session.currentImageFile) {
            await imageSessionService.saveLabels(true);
          }

          const imageFolderHandle = await picker();
          await activateImageFolder(imageFolderHandle as unknown as DirectoryHandleLike);
          } finally {
            uiManager?.hideLoading();
          }
        });
      },

      async loadSampleTestData(): Promise<void> {
        await enqueueOperation(async () => {
          const uiManager = connectedDeps ? (connectedDeps.uiManager as RuntimeUiManager) : null;
          uiManager?.showLoading();
          try {
            if (input.state.view.isAutoSaveEnabled && input.state.session.currentImageFile) {
              await imageSessionService.saveLabels(true);
            }
            const imageFolderHandle = input.windowRef.getEasyLabelingSampleDirectory
              ? await input.windowRef.getEasyLabelingSampleDirectory()
              : await createBundledSampleDirectory();
            await activateImageFolder(imageFolderHandle as unknown as DirectoryHandleLike);
            uiManager?.notify("Sample test data loaded: 3 images, color labels, layouts, and template presets.", 5000);
          } finally {
            uiManager?.hideLoading();
          }
        });
      },

      async selectLabelFolder(): Promise<void> {
        await enqueueOperation(async () => {
          const picker = input.windowRef.showDirectoryPicker;
          if (typeof picker !== "function") {
            return;
          }

          input.state.session.labelFolderHandle = await picker();
          await imageSessionService.refreshImageWorkflowStatus();
          await refreshClassFileStateFromAvailableFolder();
          if (connectedDeps) {
            const uiManager = connectedDeps.uiManager as RuntimeUiManager;
            uiManager.updateLabelFolderButton(Boolean(input.state.session.labelFolderHandle));
            uiManager.renderImageList();
            uiManager.renderPreviewList();
          }
        });
      },

      async selectClassInfoFolder(): Promise<void> {
        await enqueueOperation(async () => {
          const picker = input.windowRef.showDirectoryPicker;
          if (typeof picker !== "function") {
            return;
          }

          const folderHandle = await picker();
          input.state.session.classInfoFolderHandle = folderHandle;
          await refreshClassFileStateFromAvailableFolder();
        });
      },

      async saveLabels(isAuto = false): Promise<void> {
        await enqueueOperation(async () => {
          await imageSessionService.saveLabels(isAuto);
          if (connectedDeps) {
            const uiManager = connectedDeps.uiManager as RuntimeUiManager;
            uiManager.renderImageList();
            uiManager.renderPreviewList();
          }
        });
      },

      async navigateImage(direction: number): Promise<void> {
        await enqueueOperation(async () => {
          const imageFiles = input.state.session.imageFiles;
          if (imageFiles.length === 0) {
            return;
          }

          const currentImageName = input.state.session.currentImageFile?.name ?? "";
          const currentIndex = imageFiles.findIndex((fileHandle) => fileHandle.name === currentImageName);
          const startIndex = currentIndex === -1 ? 0 : currentIndex;

          let nextIndex = startIndex + direction;
          if (nextIndex >= imageFiles.length) {
            nextIndex = 0;
          }
          if (nextIndex < 0) {
            nextIndex = imageFiles.length - 1;
          }

          await syncAfterImageLoad(imageFiles[nextIndex]);
        });
      },

      async loadImage(fileHandle: FileHandleLike): Promise<void> {
        await enqueueOperation(async () => {
          const uiManager = connectedDeps ? (connectedDeps.uiManager as RuntimeUiManager) : null;
          uiManager?.showLoading();
          try {
            await syncAfterImageLoad(fileHandle);
          } finally {
            uiManager?.hideLoading();
          }
        });
      },

      async decodeImageForAutomation(fileHandle: FileHandleLike): Promise<HTMLImageElement> {
        return decodeImage(fileHandle);
      },

      async readDetectionLabels(imageFileName: string): Promise<string> {
        const folder = input.state.session.labelFolderHandle as unknown as DirectoryHandleLike | null;
        if (!folder) {
          return "";
        }
        const fileName = `${imageFileNameToBaseName(imageFileName)}.txt`;
        try {
          return await readTextFileByName(folder, fileName);
        } catch (error: unknown) {
          if (isNotFoundError(error)) {
            return "";
          }
          throw error;
        }
      },

      async writeDetectionLabels(imageFileName: string, yoloData: string): Promise<void> {
        const folder = input.state.session.labelFolderHandle as unknown as DirectoryHandleLike | null;
        if (!folder) {
          throw new Error("Load a Detection label folder before running automation");
        }
        const trimmed = yoloData.trim();
        await writeTextFileByName(folder, `${imageFileNameToBaseName(imageFileName)}.txt`, trimmed);
        const status = input.state.session.imageWorkflowStatus.get(imageFileName) ?? createEmptyImageWorkflowStatus();
        status.detection.hasAnnotation = trimmed.length > 0;
        input.state.session.imageWorkflowStatus.set(imageFileName, status);
      },

      async loadClassNamesFromFile(fileHandle: FileHandleLike): Promise<void> {
        await loadClassNamesIntoState(fileHandle as FileHandle, input.state);
        if (connectedDeps) {
          const uiManager = connectedDeps.uiManager as RuntimeUiManager;
          uiManager.renderClassFileSelect();
          uiManager.updateLabelList();
        }
      },

      async showClassFileContent(): Promise<void> {
        if (!connectedDeps) {
          return;
        }

        if (!input.state.session.selectedClassFile) {
          const firstClassFile = input.state.session.classFiles[0] ?? null;
          if (!firstClassFile) {
            (connectedDeps.uiManager as RuntimeUiManager).notify("Please select a class file first.");
            return;
          }
          await this.loadClassNamesFromFile(firstClassFile);
        }

        if (!input.state.session.selectedClassFile) {
          return;
        }

        const rows = await readClassFileRowsForEditor(input.state.session.selectedClassFile as FileHandleLike);
        const uiManager = connectedDeps.uiManager as RuntimeUiManager;
        uiManager.elements.classFileEditorBody.innerHTML = "";
        rows.forEach((row) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `<td><input class="form-control class-id-input" value="${row.id}"></td><td><input class="form-control class-name-input" value="${row.name}"></td><td><button type="button" class="btn btn-sm btn-danger delete-class-row-btn">Delete</button></td>`;
          uiManager.elements.classFileEditorBody.appendChild(tr);
        });
        uiManager.showClassFileContentModal();
      },

      async saveClassFileContent(): Promise<void> {
        if (!input.state.session.selectedClassFile || !connectedDeps) {
          return;
        }

        const uiManager = connectedDeps.uiManager as RuntimeUiManager;
        const rows: ClassFileRow[] = Array.from(uiManager.elements.classFileEditorBody.querySelectorAll("tr")).map((row) => {
          const idInput = row.querySelector<HTMLInputElement>(".class-id-input");
          const nameInput = row.querySelector<HTMLInputElement>(".class-name-input");
          return {
            id: idInput?.value ?? "",
            name: nameInput?.value ?? ""
          };
        });

        const result = await validateAndSaveClassRowsToFileHandle(input.state.session.selectedClassFile as FileHandleLike, rows);
        if (!result.saved) {
          uiManager.notify("Unable to save class file. Please fix highlighted rows.");
          return;
        }

        await this.loadClassNamesFromFile(input.state.session.selectedClassFile);
        uiManager.notify("Class file saved.");
      },

      addNewClassRow(): void {
        if (!connectedDeps) {
          return;
        }
        const tbody = (connectedDeps.uiManager as RuntimeUiManager).elements.classFileEditorBody;
        const tr = document.createElement("tr");
        tr.innerHTML = '<td><input class="form-control class-id-input" value=""></td><td><input class="form-control class-name-input" value=""></td><td><button type="button" class="btn btn-sm btn-danger delete-class-row-btn">Delete</button></td>';
        tbody.appendChild(tr);
      },

      async createNewClassFile(): Promise<void> {
        const folderHandle = (input.state.session.classInfoFolderHandle ?? input.state.session.labelFolderHandle) as DirectoryHandleLike | null;
        if (!folderHandle || !connectedDeps) {
          return;
        }

        const fileName = window.prompt("Enter new class file name:", "classes.yaml");
        if (!fileName) {
          return;
        }

        const result = await createNewClassFile(folderHandle, fileName);
        if (!result.created || !result.fileHandle) {
          (connectedDeps.uiManager as RuntimeUiManager).notify(`A file named ${result.fileName} already exists.`);
          return;
        }

        input.state.session.classFiles = [...input.state.session.classFiles, result.fileHandle as FileHandle];
        (connectedDeps.uiManager as RuntimeUiManager).renderClassFileSelect();
        await this.loadClassNamesFromFile(result.fileHandle);
      }
    };

  return fileSystem;
}

export async function loadClassNamesIntoState(fileHandle: FileHandle, state: AppState): Promise<ReadClassNamesResult> {
  const result = await readClassNamesFromFileHandle(fileHandle);
  state.session.classNames = result.classNames;
  state.session.selectedClassFile = fileHandle;
  return result;
}

export async function createClassFileInFolder(
  folderHandle: DirectoryHandleLike,
  inputName: string
): Promise<void> {
  await createNewClassFile(folderHandle, inputName);
}
