import type { FileSystem, FileSystemDeps } from "../app/contracts.js";
import { throwIfOperationCancelled } from "../app/operation.js";
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
import type { RuntimeOperationHandle, RuntimeUiManager } from "./ui-manager-adapter.js";
import { deriveHiddenLabelClassesForResetScope } from "../ui/filter-state.js";
import { createImageDecoder } from "../features/images/image-decoder.js";
import { imageFileNameToBaseName } from "../domain/files/image-names.js";
import { createEmptyImageWorkflowStatus } from "../domain/annotations/contracts.js";
import { isNotFoundError, readTextFileByName, writeTextFileByName } from "../platform/file-system-access.js";
import { createBundledSampleDirectory } from "../features/sample/sample-test-directory.js";
import {
  markDocumentSaveError,
  markDocumentSaved,
  markDocumentSaving,
  markImageDocumentsClean
} from "../app/document-status.js";

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

  get saveTimeout() {
    return this.appState.runtime.saveTimeout;
  }

  set saveTimeout(value) {
    this.appState.runtime.saveTimeout = value;
  }
}

export interface RuntimeFileSystem extends FileSystem {
  selectImageFolder(reportProgress?: WorkspaceLoadProgressReporter): Promise<void>;
  refreshDataset(reportProgress?: WorkspaceLoadProgressReporter): Promise<void>;
  loadSampleTestData(reportProgress?: WorkspaceLoadProgressReporter): Promise<void>;
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

export type WorkspaceLoadStep = "dataset" | "labels" | "images" | "classes";
export type WorkspaceLoadStepState = "loading" | "ready" | "warning";
export type WorkspaceLoadProgressReporter = (
  step: WorkspaceLoadStep,
  state: WorkspaceLoadStepState,
  detail: string
) => void;

interface FileSystemWindowRuntime {
  showDirectoryPicker?: (options?: DirectoryPickerOptions) => Promise<FileSystemDirectoryHandle>;
  getEasyLabelingSampleDirectory?: (signal?: AbortSignal) => Promise<FileSystemDirectoryHandle>;
  clearTimeout: typeof window.clearTimeout;
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

  const captureSessionSnapshot = () => ({
    imageFolderHandle: input.state.session.imageFolderHandle,
    labelFolderHandle: input.state.session.labelFolderHandle,
    classInfoFolderHandle: input.state.session.classInfoFolderHandle,
    imageFiles: [...input.state.session.imageFiles],
    classFiles: [...input.state.session.classFiles],
    selectedClassFile: input.state.session.selectedClassFile,
    imageWorkflowStatus: new Map([...input.state.session.imageWorkflowStatus].map(([name, status]) => [name, {
      detection: { ...status.detection },
      segmentation: { ...status.segmentation }
    }])),
    currentImageFile: input.state.session.currentImageFile,
    currentImage: input.state.session.currentImage,
    classNames: new Map(input.state.session.classNames),
    documentStatusByImage: new Map(input.state.session.documentStatusByImage ?? []),
    hiddenLabelClasses: new Set(input.state.view.hiddenLabelClasses)
  });

  const restoreSessionSnapshot = (snapshot: ReturnType<typeof captureSessionSnapshot>): void => {
    input.state.runtime.currentLoadToken += 1;
    input.state.session.imageFolderHandle = snapshot.imageFolderHandle;
    input.state.session.labelFolderHandle = snapshot.labelFolderHandle;
    input.state.session.classInfoFolderHandle = snapshot.classInfoFolderHandle;
    input.state.session.imageFiles = snapshot.imageFiles;
    input.state.session.classFiles = snapshot.classFiles;
    input.state.session.selectedClassFile = snapshot.selectedClassFile;
    input.state.session.imageWorkflowStatus = snapshot.imageWorkflowStatus;
    input.state.session.currentImageFile = snapshot.currentImageFile;
    input.state.session.currentImage = snapshot.currentImage;
    input.state.session.classNames = snapshot.classNames;
    input.state.session.documentStatusByImage = snapshot.documentStatusByImage;
    input.state.view.hiddenLabelClasses = snapshot.hiddenLabelClasses;
    pendingLoadedYolo = null;
    pendingLoadedSegmentationSnapshot = null;

    if (connectedDeps) {
      const uiManager = connectedDeps.uiManager as RuntimeUiManager;
      uiManager.updateCurrentImageName();
      uiManager.updateLabelFolderButton(Boolean(input.state.session.labelFolderHandle));
      uiManager.renderClassFileSelect();
      uiManager.renderImageList();
      uiManager.updateLabelList();
    }
  };

  const enqueueOperation = async (operation: () => Promise<void>): Promise<void> => {
    operationChain = operationChain.then(operation, operation);
    await operationChain;
  };

  const runTrackedOperation = async (
    options: { title: string; detail: string; stoppedMessage: string },
    task: (operation: RuntimeOperationHandle | null) => Promise<void>
  ): Promise<void> => {
    const uiManager = connectedDeps ? (connectedDeps.uiManager as RuntimeUiManager) : null;
    const snapshot = captureSessionSnapshot();
    const operation = uiManager?.beginOperation({
      title: options.title,
      detail: options.detail,
      cancellable: true,
      blockCanvas: true
    }) ?? null;
    const invalidatePendingLoad = (): void => {
      input.state.runtime.currentLoadToken += 1;
    };
    operation?.signal.addEventListener("abort", invalidatePendingLoad, { once: true });

    try {
      await task(operation);
      throwIfOperationCancelled(operation?.signal);
    } catch (error: unknown) {
      if (!operation?.signal.aborted) {
        throw error;
      }
      restoreSessionSnapshot(snapshot);
      uiManager?.notify(options.stoppedMessage);
    } finally {
      operation?.signal.removeEventListener("abort", invalidatePendingLoad);
      operation?.finish();
    }
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

    canvasController.loadImageSession({
      image: currentImage,
      detectionYolo: pendingLoadedYolo ?? "",
      segmentationSnapshot: pendingLoadedSegmentationSnapshot
    });
    pendingLoadedYolo = null;
    pendingLoadedSegmentationSnapshot = null;
    const currentImageName = input.state.session.currentImageFile?.name;
    if (currentImageName) {
      markImageDocumentsClean(input.state, currentImageName);
    }
    uiManager.updateCurrentImageName();
    uiManager.updateZoomDisplay(canvasController.raw.canvas.getZoom());
    uiManager.renderImageList();
    uiManager.updateLabelList();
    uiManager.setWorkflow?.(input.state.session.workflow);
    input.windowRef.dispatchEvent?.(new CustomEvent("easy-labeling:history-reset"));
    input.windowRef.dispatchEvent?.(new CustomEvent("easy-labeling:document-status-change"));
  };

  const syncAfterImageLoad = async (
    fileHandle: FileHandleLike,
    operation: RuntimeOperationHandle | null = null
  ): Promise<void> => {
    if (!connectedDeps) {
      return;
    }

    pendingLoadedYolo = null;
    pendingLoadedSegmentationSnapshot = null;
    operation?.update({ detail: `Decoding ${fileHandle.name} and loading labels` });
    await imageSessionService.loadImageAndLabels(fileHandle);
    throwIfOperationCancelled(operation?.signal);
    applyCurrentImageToCanvas();
  };

  const refreshClassFileStateFromAvailableFolder = async (
    operation: RuntimeOperationHandle | null = null
  ): Promise<void> => {
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

    operation?.update({ detail: "Reading class information" });
    const files = (await listFileHandles(classFolder)).filter((file) => /\.(yaml|yml)$/i.test(file.name)) as FileHandle[];
    throwIfOperationCancelled(operation?.signal);
    input.state.session.classFiles = files;

    const selectedFile =
      files.find((file) => file.name === previousSelectionName) ??
      files[0] ??
      null;

    if (selectedFile) {
      await loadClassNamesIntoState(selectedFile, input.state);
      throwIfOperationCancelled(operation?.signal);
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
    removeCurrentLabelsOutsideImageBounds: () => {
      if (!connectedDeps) {
        return 0;
      }
      const count = (connectedDeps.canvasController as RuntimeCanvasController).raw.removeBoxesOutsideImageBounds?.() ?? 0;
      if (count > 0) {
        (connectedDeps.uiManager as RuntimeUiManager).notify(
          `${count} box${count === 1 ? "" : "es"} outside the image ${count === 1 ? "was" : "were"} removed before saving.`,
          5000
        );
      }
      return count;
    },
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
    shouldCreateMissingLabelFolder: async () => {
      if (!connectedDeps) {
        throw new Error("The UI is not ready to confirm label folder creation.");
      }
      return (connectedDeps.uiManager as RuntimeUiManager).confirmMissingLabelFolderCreation();
    }
  });

  const activateImageFolder = async (
    imageFolderHandle: DirectoryHandleLike,
    operation: RuntimeOperationHandle | null = null,
    reportProgress?: WorkspaceLoadProgressReporter
  ): Promise<void> => {
    pendingLoadedYolo = null;
    operation?.update({ detail: "Scanning images and annotation files" });
    reportProgress?.("labels", "loading", "Checking the label workspace");
    reportProgress?.("images", "loading", "Scanning images and annotations");
    const labelSelection = await imageSessionService.selectImageFolder(imageFolderHandle);
    throwIfOperationCancelled(operation?.signal);
    reportProgress?.(
      "labels",
      labelSelection.labelFolderStatus === "missing" ? "warning" : "ready",
      labelSelection.labelFolderStatus === "created"
        ? "Created the label folder"
        : labelSelection.labelFolderStatus === "auto"
          ? "Connected the label folder"
          : "No label folder; saving is limited"
    );
    reportProgress?.(
      "images",
      input.state.session.imageFiles.length > 0 ? "ready" : "warning",
      input.state.session.imageFiles.length > 0
        ? `${input.state.session.imageFiles.length} image${input.state.session.imageFiles.length === 1 ? "" : "s"} ready`
        : "No supported images found"
    );
    input.state.view.hiddenLabelClasses = deriveHiddenLabelClassesForResetScope({
      scope: "session-replacement",
      hiddenLabelClasses: input.state.view.hiddenLabelClasses,
      persistFilterStateAcrossImageNavigation: input.state.view.persistFilterStateAcrossImageNavigation,
      resetFilterStateOnSessionReplacement: input.state.view.resetFilterStateOnSessionReplacement
    });
    reportProgress?.("classes", "loading", "Loading class information");
    await refreshClassFileStateFromAvailableFolder(operation);
    throwIfOperationCancelled(operation?.signal);
    reportProgress?.(
      "classes",
      "ready",
      input.state.session.classFiles.length > 0
        ? `${input.state.session.classFiles.length} class file${input.state.session.classFiles.length === 1 ? "" : "s"} ready`
        : "Empty class set ready"
    );
    applyCurrentImageToCanvas();

    if (!connectedDeps) {
      return;
    }
    const uiManager = connectedDeps.uiManager as RuntimeUiManager;
    uiManager.elements.selectLabelFolderBtn.removeAttribute("disabled");
    uiManager.updateLabelFolderButton(Boolean(input.state.session.labelFolderHandle));
    uiManager.renderImageList();
  };

  const fileSystem: RuntimeFileSystem = {
    imageSessionService,

      connect(deps: FileSystemDeps): void {
        connectedDeps = deps;
      },

      async selectImageFolder(reportProgress?: WorkspaceLoadProgressReporter): Promise<void> {
        await enqueueOperation(async () => {
          await runTrackedOperation({
            title: "Opening dataset",
            detail: "Waiting for folder selection",
            stoppedMessage: "Opening dataset stopped."
          }, async (operation) => {
            const picker = input.windowRef.showDirectoryPicker;
            if (typeof picker !== "function") {
              throw new Error("Folder access is unavailable in this browser. Load the bundled sample instead.");
            }

            if (input.state.view.isAutoSaveEnabled && input.state.session.currentImageFile) {
              operation?.update({ detail: "Saving the current labels" });
              await imageSessionService.saveLabels(true);
              throwIfOperationCancelled(operation?.signal);
            }

            reportProgress?.("dataset", "loading", "Waiting for folder selection");
            operation?.update({ detail: "Waiting for folder selection" });
            const imageFolderHandle = await picker();
            throwIfOperationCancelled(operation?.signal);
            reportProgress?.("dataset", "ready", imageFolderHandle.name || "Dataset connected");
            await activateImageFolder(imageFolderHandle as unknown as DirectoryHandleLike, operation, reportProgress);
          });
        });
      },

      async refreshDataset(reportProgress?: WorkspaceLoadProgressReporter): Promise<void> {
        await enqueueOperation(async () => {
          const folder = input.state.session.imageFolderHandle as unknown as DirectoryHandleLike | null;
          if (!folder) {
            throw new Error("Open a dataset before refreshing it");
          }
          const uiManager = connectedDeps ? (connectedDeps.uiManager as RuntimeUiManager) : null;
          const currentImageName = input.state.session.currentImageFile?.name ?? null;
          await runTrackedOperation({
            title: "Refreshing dataset",
            detail: "Scanning images and annotation files",
            stoppedMessage: "Dataset refresh stopped."
          }, async (operation) => {
            reportProgress?.("dataset", "ready", folder.name || "Dataset connected");
            reportProgress?.("labels", "loading", "Checking the label workspace");
            reportProgress?.("images", "loading", "Scanning images and annotations");
            const labelSelection = await imageSessionService.selectImageFolder(folder);
            throwIfOperationCancelled(operation?.signal);
            reportProgress?.(
              "labels",
              labelSelection.labelFolderStatus === "missing" ? "warning" : "ready",
              labelSelection.labelFolderStatus === "created"
                ? "Created the label folder"
                : labelSelection.labelFolderStatus === "auto"
                  ? "Connected the label folder"
                  : "No label folder; saving is limited"
            );
            reportProgress?.(
              "images",
              input.state.session.imageFiles.length > 0 ? "ready" : "warning",
              input.state.session.imageFiles.length > 0
                ? `${input.state.session.imageFiles.length} image${input.state.session.imageFiles.length === 1 ? "" : "s"} ready`
                : "No supported images found"
            );
            const target = currentImageName
              ? input.state.session.imageFiles.find((file) => file.name === currentImageName)
              : null;
            if (target && target.name !== input.state.session.currentImageFile?.name) {
              pendingLoadedYolo = null;
              pendingLoadedSegmentationSnapshot = null;
              operation?.update({ detail: `Restoring ${target.name}` });
              await imageSessionService.loadImageAndLabels(target as unknown as FileHandleLike);
              throwIfOperationCancelled(operation?.signal);
            }
            reportProgress?.("classes", "loading", "Loading class information");
            await refreshClassFileStateFromAvailableFolder(operation);
            throwIfOperationCancelled(operation?.signal);
            reportProgress?.(
              "classes",
              "ready",
              input.state.session.classFiles.length > 0
                ? `${input.state.session.classFiles.length} class file${input.state.session.classFiles.length === 1 ? "" : "s"} ready`
                : "Empty class set ready"
            );
            applyCurrentImageToCanvas();
            uiManager?.notify("Dataset refreshed.");
          });
        });
      },

      async loadSampleTestData(reportProgress?: WorkspaceLoadProgressReporter): Promise<void> {
        await enqueueOperation(async () => {
          const uiManager = connectedDeps ? (connectedDeps.uiManager as RuntimeUiManager) : null;
          await runTrackedOperation({
            title: "Loading sample workspace",
            detail: "Preparing bundled sample files",
            stoppedMessage: "Loading sample workspace stopped."
          }, async (operation) => {
            if (input.state.view.isAutoSaveEnabled && input.state.session.currentImageFile) {
              operation?.update({ detail: "Saving the current labels" });
              await imageSessionService.saveLabels(true);
              throwIfOperationCancelled(operation?.signal);
            }
            operation?.update({ detail: "Preparing bundled sample files" });
            const imageFolderHandle = input.windowRef.getEasyLabelingSampleDirectory
              ? await input.windowRef.getEasyLabelingSampleDirectory(operation?.signal)
              : await createBundledSampleDirectory({ signal: operation?.signal });
            throwIfOperationCancelled(operation?.signal);
            reportProgress?.("dataset", "ready", imageFolderHandle.name || "Sample workspace connected");
            await activateImageFolder(imageFolderHandle as unknown as DirectoryHandleLike, operation, reportProgress);
            uiManager?.notify("Sample test data loaded: 3 images, color labels, layouts, and template presets.", 5000);
          });
        });
      },

      async selectLabelFolder(): Promise<void> {
        await enqueueOperation(async () => {
          await runTrackedOperation({
            title: "Connecting label folder",
            detail: "Waiting for folder selection",
            stoppedMessage: "Connecting label folder stopped."
          }, async (operation) => {
            const picker = input.windowRef.showDirectoryPicker;
            if (typeof picker !== "function") {
              throw new Error("Folder access is unavailable in this browser.");
            }

            input.state.session.labelFolderHandle = await picker();
            throwIfOperationCancelled(operation?.signal);
            operation?.update({ detail: "Reading label and class files" });
            await imageSessionService.refreshImageWorkflowStatus();
            throwIfOperationCancelled(operation?.signal);
            await refreshClassFileStateFromAvailableFolder(operation);
            throwIfOperationCancelled(operation?.signal);
            if (connectedDeps) {
              const uiManager = connectedDeps.uiManager as RuntimeUiManager;
              uiManager.updateLabelFolderButton(Boolean(input.state.session.labelFolderHandle));
              uiManager.renderImageList();
            }
          });
        });
      },

      async selectClassInfoFolder(): Promise<void> {
        await enqueueOperation(async () => {
          await runTrackedOperation({
            title: "Loading class information",
            detail: "Waiting for folder selection",
            stoppedMessage: "Loading class information stopped."
          }, async (operation) => {
            const picker = input.windowRef.showDirectoryPicker;
            if (typeof picker !== "function") {
              throw new Error("Folder access is unavailable in this browser.");
            }

            const folderHandle = await picker({ id: "class-info", mode: "readwrite" });
            throwIfOperationCancelled(operation?.signal);
            input.state.session.classInfoFolderHandle = folderHandle;
            await refreshClassFileStateFromAvailableFolder(operation);
          });
        });
      },

      async saveLabels(isAuto = false): Promise<void> {
        await enqueueOperation(async () => {
          const imageName = input.state.session.currentImageFile?.name;
          const workflow = input.state.session.workflow;
          if (!imageName) {
            return;
          }
          markDocumentSaving(input.state, imageName, workflow, isAuto);
          input.windowRef.dispatchEvent?.(new Event("easy-labeling:document-status-change"));
          try {
            const result = await imageSessionService.saveLabels(isAuto);
            if (!result.saved) {
              throw new Error(workflow === "detection"
                ? "Connect a label folder before saving Detection labels."
                : "Load an image before saving a Segmentation mask.");
            }
            markDocumentSaved(input.state, imageName, workflow, { wasAutoSaved: isAuto });
            if (connectedDeps) {
              const uiManager = connectedDeps.uiManager as RuntimeUiManager;
              uiManager.renderImageList();
            }
          } catch (error: unknown) {
            markDocumentSaveError(input.state, imageName, workflow, error);
            throw error;
          } finally {
            input.windowRef.dispatchEvent?.(new Event("easy-labeling:document-status-change"));
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

          const nextFile = imageFiles[nextIndex];
          await runTrackedOperation({
            title: "Loading image",
            detail: `Preparing ${nextFile.name}`,
            stoppedMessage: "Loading image stopped."
          }, async (operation) => {
            await syncAfterImageLoad(nextFile, operation);
          });
        });
      },

      async loadImage(fileHandle: FileHandleLike): Promise<void> {
        await enqueueOperation(async () => {
          await runTrackedOperation({
            title: "Loading image",
            detail: `Preparing ${fileHandle.name}`,
            stoppedMessage: "Loading image stopped."
          }, async (operation) => {
            await syncAfterImageLoad(fileHandle, operation);
          });
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
