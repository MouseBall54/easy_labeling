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
import { imageFileNameToLabelFileName } from "../domain/files/image-names.js";
import { isNotFoundError, listFileHandles, readTextFileByName } from "../platform/file-system-access.js";
import type { ClassFileRow } from "../domain/class-files.js";
import type { DirectoryHandleLike, FileHandle, FileHandleLike } from "../types/files.js";
import type { RuntimeCanvasController } from "./canvas-controller-adapter.js";
import type { RuntimeUiManager } from "./ui-manager-adapter.js";

interface TiffDecodedCanvas {
  toDataURL(type?: string): string;
}

interface TiffInstanceLike {
  toCanvas(): TiffDecodedCanvas;
}

interface TiffConstructorLike {
  new (input: { buffer: ArrayBuffer }): TiffInstanceLike;
}

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

  get imageLabelStatus() {
    return this.appState.session.imageLabelStatus;
  }

  set imageLabelStatus(value) {
    this.appState.session.imageLabelStatus = value;
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

function isTiffConstructor(value: unknown): value is TiffConstructorLike {
  return typeof value === "function";
}

async function loadImageElementFromUrl(url: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = url;

  try {
    await image.decode();
    return image;
  } catch (decodeError) {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(decodeError instanceof Error ? decodeError : new Error("Failed to decode image"));
    });
  }

  return image;
}

export interface RuntimeFileSystem extends FileSystem {
  selectImageFolder(): Promise<void>;
  selectLabelFolder(): Promise<void>;
  selectClassInfoFolder(): Promise<void>;
  saveLabels(isAuto?: boolean): Promise<void>;
  navigateImage(direction: number): Promise<void>;
  loadImage(fileHandle: FileHandleLike): Promise<void>;
  loadClassNamesFromFile(fileHandle: FileHandleLike): Promise<void>;
  showClassFileContent(): Promise<void>;
  saveClassFileContent(): Promise<void>;
  addNewClassRow(): void;
  createNewClassFile(): Promise<void>;
  downloadClassTemplate(): Promise<void>;
  readonly imageSessionService: ImageSessionService;
}

interface FileSystemWindowRuntime {
  showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
  clearTimeout: typeof window.clearTimeout;
  confirm: (message?: string) => boolean;
  URL: Pick<typeof URL, "createObjectURL" | "revokeObjectURL">;
}

export function createFileSystemAdapter(input: {
  state: AppState;
  windowRef: FileSystemWindowRuntime;
  tiffRef: unknown;
}): RuntimeFileSystem {
  let connectedDeps: FileSystemDeps | null = null;
  let pendingLoadedYolo: string | null = null;
  let operationChain: Promise<void> = Promise.resolve();

  const enqueueOperation = async (operation: () => Promise<void>): Promise<void> => {
    operationChain = operationChain.then(operation, operation);
    await operationChain;
  };

  const loadDecodedImage = async (
    fileHandle: FileHandle,
    tiffBuffer: ArrayBuffer | null
  ): Promise<HTMLImageElement> => {
    if (tiffBuffer && isTiffConstructor(input.tiffRef)) {
      const decoded = new input.tiffRef({ buffer: tiffBuffer }).toCanvas();
      return loadImageElementFromUrl(decoded.toDataURL("image/png"));
    }

    const file = await fileHandle.getFile();
    const objectUrl = input.windowRef.URL.createObjectURL(file);
    try {
      return await loadImageElementFromUrl(objectUrl);
    } finally {
      input.windowRef.URL.revokeObjectURL(objectUrl);
    }
  };

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

    canvasController.raw.clear();
    canvasController.raw.setBackgroundImage(currentImage);
    if (pendingLoadedYolo && pendingLoadedYolo.trim()) {
      canvasController.raw.addLabelsFromYolo(pendingLoadedYolo);
    }
    pendingLoadedYolo = null;
    canvasController.raw.resetZoom();
    uiManager.updateCurrentImageName();
    uiManager.updateZoomDisplay(canvasController.raw.canvas.getZoom());
    uiManager.renderImageList();
    uiManager.renderPreviewList();
    uiManager.updateLabelList();
  };

  const syncAfterImageLoad = async (fileHandle: FileHandleLike): Promise<void> => {
    if (!connectedDeps) {
      return;
    }

    pendingLoadedYolo = null;
    await imageSessionService.loadImageAndLabels(fileHandle);
    applyCurrentImageToCanvas();
  };

  const imageSessionService = createImageSessionService(new LiveImageSessionState(input.state), {
    decodeImage: async ({ fileHandle, tiffBuffer }) => loadDecodedImage(fileHandle as FileHandle, tiffBuffer),
    readCurrentLabelsAsYolo: () => {
      if (!connectedDeps) {
        return "";
      }
      return (connectedDeps.canvasController as RuntimeCanvasController).raw.getLabelsAsYolo();
    },
    applyLoadedYolo: async (yoloData) => {
      if (!connectedDeps) {
        return;
      }
      pendingLoadedYolo = yoloData;
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

          if (input.state.view.isAutoSaveEnabled && input.state.session.currentImageFile && input.state.session.labelFolderHandle) {
            await imageSessionService.saveLabels(true);
          }

          const imageFolderHandle = await picker();
          await imageSessionService.selectImageFolder(imageFolderHandle as unknown as DirectoryHandleLike);
            if (input.state.session.currentImageFile) {
              if (input.state.session.labelFolderHandle) {
                try {
                  pendingLoadedYolo = await readTextFileByName(
                    input.state.session.labelFolderHandle as unknown as DirectoryHandleLike,
                    imageFileNameToLabelFileName(input.state.session.currentImageFile.name)
                  );
                } catch (error: unknown) {
                  if (!isNotFoundError(error)) {
                    throw error;
                  }
                  pendingLoadedYolo = null;
                }
              }
              applyCurrentImageToCanvas();
            } else {
              applyCurrentImageToCanvas();
            }

            if (!uiManager) {
              return;
            }

            uiManager.elements.selectLabelFolderBtn.removeAttribute("disabled");
            uiManager.updateLabelFolderButton(Boolean(input.state.session.labelFolderHandle));
            uiManager.renderImageList();
            uiManager.renderPreviewList();
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
          if (connectedDeps) {
            const uiManager = connectedDeps.uiManager as RuntimeUiManager;
            uiManager.updateLabelFolderButton(Boolean(input.state.session.labelFolderHandle));
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
          const files = await listFileHandles(folderHandle as unknown as DirectoryHandleLike);
          input.state.session.classFiles = files.filter((file) => /\.(yaml|yml)$/i.test(file.name)) as FileHandle[];
          if (connectedDeps) {
            (connectedDeps.uiManager as RuntimeUiManager).renderClassFileSelect();
          }
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

      async loadClassNamesFromFile(fileHandle: FileHandleLike): Promise<void> {
        await loadClassNamesIntoState(fileHandle as FileHandle, input.state);
        if (connectedDeps) {
          const uiManager = connectedDeps.uiManager as RuntimeUiManager;
          uiManager.renderClassFileSelect();
          uiManager.updateLabelList();
        }
      },

      async showClassFileContent(): Promise<void> {
        if (!input.state.session.selectedClassFile || !connectedDeps) {
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

      ,

      async downloadClassTemplate(): Promise<void> {
        const blob = new Blob(["# YAML Class file. Format: id: name\n0: class1\n1: class2"], { type: "text/plain" });
        const url = input.windowRef.URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "classes.yaml";
        anchor.click();
        input.windowRef.URL.revokeObjectURL(url);
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
