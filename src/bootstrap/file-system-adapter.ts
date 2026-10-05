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
import { normalizeClassName, type ClassFileRow } from "../domain/class-files.js";
import type { DirectoryHandleLike, FileHandle, FileHandleLike } from "../types/files.js";
import type { RuntimeCanvasController } from "./canvas-controller-adapter.js";
import type { RuntimeOperationHandle, RuntimeUiManager } from "./ui-manager-adapter.js";
import { CREATE_NEW_CLASS_FILE_VALUE } from "../ui/renderers.js";
import { deriveHiddenLabelClassesForResetScope } from "../ui/filter-state.js";
import { createImageDecoder } from "../features/images/image-decoder.js";
import { detectionsToYolo, type Detection } from "../features/inference/yolo.js";
import { getCurrentDocumentStatus } from "../app/document-status.js";
import { imageFileNameToBaseName } from "../domain/files/image-names.js";
import { createEmptyImageWorkflowStatus } from "../domain/annotations/contracts.js";
import { isNotFoundError, readTextFileByName, writeTextFileByName } from "../platform/file-system-access.js";
import { getSubdirectoryHandle } from "../platform/file-system-access.js";
import { inspectDetectionLabels } from "../features/review/quality.js";
import { createReviewStateDocument, parseReviewStateDocument } from "../features/review/review-state.js";
import type { ReviewImageStatus } from "../features/review/types.js";
import type { ReviewSettings } from "../features/review/types.js";
import { createBundledSampleDirectory } from "../features/sample/sample-test-directory.js";
import {
  markDocumentSaveError,
  markDocumentSaved,
  markDocumentSaving,
  markImageDocumentsClean
} from "../app/document-status.js";
import { loadSegmentationToolPresets } from "../features/segmentation/preset-service.js";
import { encodeSegmentationMaskPng } from "../domain/annotations/segmentation-codec.js";
import { writeBinaryFileByName } from "../platform/file-system-access.js";
import type { YoloeResult } from "../features/inference/yoloe.js";

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

  get segmentationLabelFolderHandle() {
    return this.appState.session.segmentationLabelFolderHandle as unknown as DirectoryHandleLike | null;
  }

  set segmentationLabelFolderHandle(value) {
    this.appState.session.segmentationLabelFolderHandle = value as unknown as FileSystemDirectoryHandle | null;
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

  get segmentationAnnotationType() {
    return this.appState.session.segmentationAnnotationType;
  }

  set segmentationAnnotationType(value) {
    this.appState.session.segmentationAnnotationType = value;
  }

  get segmentationSourceFormat() {
    return this.appState.session.segmentationSourceFormat;
  }

  set segmentationSourceFormat(value) {
    this.appState.session.segmentationSourceFormat = value;
  }

  get segmentationExportFormat() {
    return this.appState.session.segmentationExportFormat;
  }

  set segmentationExportFormat(value) {
    this.appState.session.segmentationExportFormat = value;
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
  selectImageFolder(reportProgress?: WorkspaceLoadProgressReporter, selectedFolder?: Promise<FileSystemDirectoryHandle>): Promise<void>;
  refreshDataset(reportProgress?: WorkspaceLoadProgressReporter): Promise<void>;
  loadSampleTestData(reportProgress?: WorkspaceLoadProgressReporter): Promise<void>;
  selectLabelFolder(selectedFolder?: Promise<FileSystemDirectoryHandle>): Promise<void>;
  switchLabelFolder(index: number): Promise<void>;
  runSegmentationInference(options: {
    allImages: boolean; modelName: string; classNames: ReadonlyMap<string, string>; metadata: Record<string, unknown>;
    infer(image: HTMLImageElement, signal?: AbortSignal): Promise<YoloeResult>;
    onProgress?(current: number, total: number, imageName: string): void;
  }): Promise<{ folderName: string; imageCount: number; detectionCount: number } | null>;
  runDetectionInference(options: {
    allImages: boolean;
    modelName: string;
    classNames?: ReadonlyMap<string, string>;
    metadata?: Record<string, unknown>;
    infer(image: HTMLImageElement, signal?: AbortSignal): Promise<Detection[]>;
    onProgress?(current: number, total: number, imageName: string): void;
  }): Promise<{ folderName: string; imageCount: number; detectionCount: number } | null>;
  selectClassInfoFolder(selectedFolder?: Promise<FileSystemDirectoryHandle>): Promise<void>;
  loadDefaultClassInfo(): Promise<void>;
  refreshReviewFindings(): Promise<void>;
  setReviewImageStatus(imagePath: string, status: ReviewImageStatus): Promise<void>;
  updateReviewSettings(settings: ReviewSettings): Promise<void>;
  saveLabels(isAuto?: boolean): Promise<void>;
  navigateImage(direction: number): Promise<void>;
  loadImage(fileHandle: FileHandleLike): Promise<void>;
  decodeImageForAutomation(fileHandle: FileHandleLike): Promise<HTMLImageElement>;
  readDetectionLabels(imageFileName: string): Promise<string>;
  readSegmentationLabels(imageFileName: string, width: number, height: number): Promise<import("../features/segmentation/types.js").SegmentationDocumentSnapshot | null>;
  writeDetectionLabels(imageFileName: string, yoloData: string): Promise<void>;
  loadClassNamesFromFile(fileHandle: FileHandleLike): Promise<void>;
  showClassFileContent(): Promise<void>;
  saveClassFileContent(): Promise<void>;
  addNewClassRow(): void;
  createNewClassFile(): Promise<boolean>;
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
  getEasyLabelingProfileDirectory?: (kind: EasyLabelingProfileDirectoryKind) => Promise<FileSystemDirectoryHandle>;
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
    labelFolders: [...input.state.session.labelFolders],
    segmentationLabelFolderHandle: input.state.session.segmentationLabelFolderHandle,
    segmentationLabelFolders: [...(input.state.session.segmentationLabelFolders ?? [])],
    segmentationSourceFormat: input.state.session.segmentationSourceFormat,
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
    reviewState: structuredClone(input.state.session.reviewState ?? createReviewStateDocument()),
    reviewFindings: new Map(input.state.session.reviewFindings ?? []),
    documentStatusByImage: new Map(input.state.session.documentStatusByImage ?? []),
    segmentationToolPresets: structuredClone(input.state.session.segmentationToolPresets),
    hiddenLabelClasses: new Set(input.state.view.hiddenLabelClasses)
  });

  const restoreSessionSnapshot = (snapshot: ReturnType<typeof captureSessionSnapshot>): void => {
    input.state.runtime.currentLoadToken += 1;
    input.state.session.imageFolderHandle = snapshot.imageFolderHandle;
    input.state.session.labelFolderHandle = snapshot.labelFolderHandle;
    input.state.session.labelFolders = snapshot.labelFolders;
    input.state.session.segmentationLabelFolderHandle = snapshot.segmentationLabelFolderHandle;
    input.state.session.segmentationLabelFolders = snapshot.segmentationLabelFolders;
    input.state.session.segmentationSourceFormat = snapshot.segmentationSourceFormat;
    input.state.session.classInfoFolderHandle = snapshot.classInfoFolderHandle;
    input.state.session.imageFiles = snapshot.imageFiles;
    input.state.session.classFiles = snapshot.classFiles;
    input.state.session.selectedClassFile = snapshot.selectedClassFile;
    input.state.session.imageWorkflowStatus = snapshot.imageWorkflowStatus;
    input.state.session.currentImageFile = snapshot.currentImageFile;
    input.state.session.currentImage = snapshot.currentImage;
    input.state.session.classNames = snapshot.classNames;
    input.state.session.reviewState = snapshot.reviewState;
    input.state.session.reviewFindings = snapshot.reviewFindings;
    input.state.session.documentStatusByImage = snapshot.documentStatusByImage;
    input.state.session.segmentationToolPresets = snapshot.segmentationToolPresets;
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
    input.windowRef.dispatchEvent?.(new Event("easy-labeling:image-change"));
  };

  const refreshClassFileStateFromAvailableFolder = async (
    operation: RuntimeOperationHandle | null = null
  ): Promise<void> => {
    const session = input.state.session;
    const annotationFolder = session.workflow === "segmentation" && session.segmentationLabelFolderHandle !== session.imageFolderHandle
      ? session.segmentationLabelFolderHandle ?? session.labelFolderHandle : session.labelFolderHandle;
    const classFolder = (session.classInfoFolderHandle ?? annotationFolder) as DirectoryHandleLike | null;
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

  const getReviewFolder = (): DirectoryHandleLike | null => {
    // Keep existing review records for the default source; other label sets have their own records.
    const session = input.state.session;
    return (session.labelFolderHandle === session.labelFolders[0]
      ? session.imageFolderHandle : session.labelFolderHandle ?? session.imageFolderHandle) as unknown as DirectoryHandleLike | null;
  };

  const saveBeforeLabelSwitch = async (): Promise<void> => {
    if (input.state.runtime.saveTimeout) input.windowRef.clearTimeout(input.state.runtime.saveTimeout);
    input.state.runtime.saveTimeout = null;
    const status = getCurrentDocumentStatus(input.state);
    if (!input.state.session.currentImageFile || !status || !["dirty", "error"].includes(status.phase)) return;
    const saved = await imageSessionService.saveLabels(false);
    if (!saved.saved) throw new Error("Save the current labels to a label folder before switching sources.");
    markDocumentSaved(input.state, input.state.session.currentImageFile.name, input.state.session.workflow, { wasAutoSaved: false });
  };

  const activateLabelFolder = async (folder: FileSystemDirectoryHandle, operation: RuntimeOperationHandle | null): Promise<void> => {
    const snapshot = captureSessionSnapshot();
    try {
      if (input.state.session.workflow === "segmentation") {
        input.state.session.segmentationLabelFolderHandle = folder;
        input.state.session.segmentationSourceFormat = "auto";
      } else input.state.session.labelFolderHandle = folder;
      operation?.update({ detail: `Loading ${folder.name}` });
      await imageSessionService.refreshImageWorkflowStatus();
      await loadReviewState();
      await refreshReviewFindings();
      await refreshClassFileStateFromAvailableFolder(operation);
      throwIfOperationCancelled(operation?.signal);
      if (input.state.session.currentImageFile) {
        pendingLoadedYolo = null;
        pendingLoadedSegmentationSnapshot = null;
        // Reload labels without image navigation's autosave, which would write the old canvas into the new source.
        await imageSessionService.loadLabels(input.state.session.currentImageFile.name, input.state.runtime.currentLoadToken);
        throwIfOperationCancelled(operation?.signal);
        applyCurrentImageToCanvas();
      }
      (connectedDeps?.uiManager as RuntimeUiManager | undefined)?.updateLabelFolderButton(true);
      input.windowRef.dispatchEvent?.(new Event("easy-labeling:label-source-change"));
    } catch (error) {
      restoreSessionSnapshot(snapshot);
      throw error;
    }
  };

  const loadReviewState = async (): Promise<void> => {
    const imageFolder = getReviewFolder();
    input.state.session.reviewState = createReviewStateDocument();
    input.state.session.reviewFindings = new Map();
    if (!imageFolder) {
      return;
    }
    try {
      const reviewDirectory = await getSubdirectoryHandle(imageFolder, ".easy-labeling");
      input.state.session.reviewState = parseReviewStateDocument(await readTextFileByName(reviewDirectory, "review-state.json"));
    } catch (error: unknown) {
      if (!isNotFoundError(error) && connectedDeps) {
        (connectedDeps.uiManager as RuntimeUiManager).notify("Review state was invalid and has been reset.", 5000);
      }
    }
  };

  const persistReviewState = async (): Promise<void> => {
    const imageFolder = getReviewFolder();
    if (!imageFolder) {
      return;
    }
    const reviewDirectory = await getSubdirectoryHandle(imageFolder, ".easy-labeling", { create: true });
    await writeTextFileByName(reviewDirectory, "review-state.json", `${JSON.stringify(input.state.session.reviewState, null, 2)}\n`);
  };

  const refreshReviewFindings = async (): Promise<void> => {
    const findings = new Map();
    const labelFolder = input.state.session.labelFolderHandle as unknown as DirectoryHandleLike | null;
    for (const imageFile of input.state.session.imageFiles) {
      let yoloText = "";
      if (labelFolder) {
        try {
          yoloText = await readTextFileByName(labelFolder, `${imageFileNameToBaseName(imageFile.name)}.txt`);
        } catch (error: unknown) {
          if (!isNotFoundError(error)) {
            throw error;
          }
        }
      }
      const decodedImage = await decodeImage(imageFile as unknown as FileHandleLike);
      const width = decodedImage.naturalWidth || decodedImage.width;
      const height = decodedImage.naturalHeight || decodedImage.height;
      findings.set(imageFile.name, inspectDetectionLabels({
        yoloText,
        imageWidth: width,
        imageHeight: height,
        settings: input.state.session.reviewState.settings
      }));
    }
    input.state.session.reviewFindings = findings;
  };

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
    input.state.session.labelFolders = input.state.session.labelFolderHandle ? [input.state.session.labelFolderHandle] : [];
    input.state.session.segmentationLabelFolders = [imageFolderHandle as unknown as FileSystemDirectoryHandle];
    input.state.session.segmentationToolPresets = await loadSegmentationToolPresets(imageFolderHandle);
    throwIfOperationCancelled(operation?.signal);
    await loadReviewState();
    await refreshReviewFindings();
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

      async selectImageFolder(reportProgress?: WorkspaceLoadProgressReporter, selectedFolder?: Promise<FileSystemDirectoryHandle>): Promise<void> {
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
            const imageFolderHandle = await (selectedFolder ?? picker());
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
            const refreshLabelFolder = input.state.session.labelFolderHandle;
            const refreshSegmentationFolder = input.state.session.segmentationLabelFolderHandle;
            await saveBeforeLabelSwitch();
            const labelSelection = await imageSessionService.selectImageFolder(folder);
            input.state.session.segmentationLabelFolderHandle = refreshSegmentationFolder;
            // Dataset refresh preserves the selected label source, including inference results.
            if (input.state.session.labelFolders.length && refreshLabelFolder) {
              input.state.session.labelFolderHandle = refreshLabelFolder;
              await imageSessionService.refreshImageWorkflowStatus();
              if (input.state.session.currentImageFile) await imageSessionService.loadLabels(input.state.session.currentImageFile.name, input.state.runtime.currentLoadToken);
            }
            throwIfOperationCancelled(operation?.signal);
            await loadReviewState();
            await refreshReviewFindings();
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
            const demoStartImage = input.state.session.imageFiles.find((file) => file.name === "sample_1.jpg");
            if (demoStartImage && demoStartImage.name !== input.state.session.currentImageFile?.name) {
              await syncAfterImageLoad(demoStartImage as unknown as FileHandleLike, operation);
            }
            uiManager?.notify(`Sample test data loaded: ${input.state.session.imageFiles.length} images, boxes, segmentation masks, layouts, and template presets.`, 5000);
          });
        });
      },

      async selectLabelFolder(selectedFolder?: Promise<FileSystemDirectoryHandle>): Promise<void> {
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

            const folder = await (selectedFolder ?? picker({ mode: "readwrite" }));
            throwIfOperationCancelled(operation?.signal);
            await saveBeforeLabelSwitch();
            const sources = input.state.session.workflow === "segmentation" ? (input.state.session.segmentationLabelFolders ??= []) : input.state.session.labelFolders;
            if (!sources.includes(folder)) sources.push(folder);
            await activateLabelFolder(folder, operation);
          });
        });
      },

      async switchLabelFolder(index): Promise<void> {
        await enqueueOperation(async () => {
          const session = input.state.session;
          const folder = (session.workflow === "segmentation" ? session.segmentationLabelFolders : session.labelFolders)?.[index];
          if (!folder) throw new Error("Label folder is no longer available.");
          if (folder === (session.workflow === "segmentation" ? session.segmentationLabelFolderHandle ?? session.imageFolderHandle : session.labelFolderHandle)) return;
          await runTrackedOperation({ title: "Switching labels", detail: folder.name, stoppedMessage: "Label switch stopped." }, async (operation) => {
            await saveBeforeLabelSwitch();
            throwIfOperationCancelled(operation?.signal);
            await activateLabelFolder(folder, operation);
          });
        });
      },

      async runDetectionInference(options) {
        let result: { folderName: string; imageCount: number; detectionCount: number } | null = null;
        await enqueueOperation(async () => {
          const session = input.state.session;
          if (session.workflow !== "detection" || !session.imageFolderHandle || !session.currentImageFile) throw new Error("Open a Detection dataset first.");
          const files = options.allImages ? [...session.imageFiles] : [session.currentImageFile];
          const bases = files.map((file) => imageFileNameToBaseName(file.name).toLowerCase());
          if (new Set(bases).size !== bases.length) throw new Error("Images with the same base name would share a label file. Rename them before inference.");
          const folderName = `inference-${options.modelName.replace(/\.onnx$/i, "")}`;
          await runTrackedOperation({ title: "YOLO inference", detail: `Results: ${folderName}`, stoppedMessage: `Inference stopped. Partial results remain in ${folderName}; reload the model to retry.` }, async (operation) => {
            await saveBeforeLabelSwitch();
            throwIfOperationCancelled(operation?.signal);
            const folder = await session.imageFolderHandle!.getDirectoryHandle(folderName, { create: true });
            const classNames = new Map([...session.classNames].map(([id, name]) => [id, normalizeClassName(name)]));
            options.classNames?.forEach((name, id) => classNames.set(id, normalizeClassName(name)));
            let detectionCount = 0;
            const completed: string[] = [];
            for (const file of files) {
              throwIfOperationCancelled(operation?.signal);
              operation?.update({ detail: `${file.name} → ${folderName}`, current: completed.length, total: files.length });
              options.onProgress?.(completed.length, files.length, file.name);
              const image = await decodeImage(file);
              throwIfOperationCancelled(operation?.signal);
              const boxes = await options.infer(image, operation?.signal);
              throwIfOperationCancelled(operation?.signal);
              await writeTextFileByName(folder as unknown as DirectoryHandleLike, `${imageFileNameToBaseName(file.name)}.txt`, detectionsToYolo(boxes, image.naturalWidth || image.width, image.naturalHeight || image.height));
              for (const box of boxes) if (!classNames.has(String(box.classId))) classNames.set(String(box.classId), `class ${box.classId}`);
              detectionCount += boxes.length;
              completed.push(file.name);
              operation?.update({ current: completed.length, total: files.length });
              options.onProgress?.(completed.length, files.length, file.name);
            }
            await writeTextFileByName(folder as unknown as DirectoryHandleLike, "classes.yaml", `names:\n${[...classNames].map(([id, name]) => `  ${id}: ${JSON.stringify(name)}`).join("\n")}\n`);
            await writeTextFileByName(folder as unknown as DirectoryHandleLike, "inference.json", JSON.stringify({ ...options.metadata, model: options.modelName, images: completed, detections: detectionCount, createdAt: new Date().toISOString() }, null, 2));
            throwIfOperationCancelled(operation?.signal);
            const folderIndex = session.labelFolders.findIndex((source) => source.name === folder.name);
            if (folderIndex < 0) session.labelFolders.push(folder);
            else session.labelFolders[folderIndex] = folder;
            await activateLabelFolder(folder, operation);
            result = { folderName, imageCount: completed.length, detectionCount };
          });
        });
        return result;
      },

      async runSegmentationInference(options) {
        let result: { folderName: string; imageCount: number; detectionCount: number } | null = null;
        await enqueueOperation(async () => {
          const session = input.state.session;
          if (session.workflow !== "segmentation" || !session.imageFolderHandle || !session.currentImageFile) throw new Error("Open a Segmentation dataset first.");
          const files = options.allImages ? [...session.imageFiles] : [session.currentImageFile];
          const bases = files.map((file) => imageFileNameToBaseName(file.name).toLowerCase());
          if (new Set(bases).size !== bases.length) throw new Error("Images with the same base name would share a mask file. Rename them before inference.");
          const folderName = `inference-${options.modelName}-masks`;
          await runTrackedOperation({ title: "YOLOE mask inference", detail: `Results: ${folderName}`, stoppedMessage: `Inference stopped. Partial masks remain in ${folderName}.` }, async (operation) => {
            await saveBeforeLabelSwitch();
            throwIfOperationCancelled(operation?.signal);
            const folder = await session.imageFolderHandle!.getDirectoryHandle(folderName, { create: true });
            const maskFolder = await folder.getDirectoryHandle("mask", { create: true });
            let detectionCount = 0;
            const completed: string[] = [];
            for (const file of files) {
              throwIfOperationCancelled(operation?.signal);
              operation?.update({ detail: `${file.name} → ${folderName}`, current: completed.length, total: files.length });
              options.onProgress?.(completed.length, files.length, file.name);
              const image = await decodeImage(file);
              const prediction = await options.infer(image, operation?.signal);
              throwIfOperationCancelled(operation?.signal);
              if (!prediction.mask || prediction.mask.width !== (image.naturalWidth || image.width) || prediction.mask.height !== (image.naturalHeight || image.height)) throw new Error("YOLOE did not return a mask matching the image.");
              const bytes = await encodeSegmentationMaskPng({ ...prediction.mask, activeClassId: [...options.classNames.keys()][0] ?? "1", activeTool: "brush", overlayVisible: true, overlayOpacity: 0.6, hiddenClassIds: new Set(), brushRadius: 6 });
              throwIfOperationCancelled(operation?.signal);
              await writeBinaryFileByName(maskFolder as unknown as DirectoryHandleLike, `${imageFileNameToBaseName(file.name)}.png`, bytes.buffer as ArrayBuffer);
              detectionCount += prediction.detections.length;
              completed.push(file.name);
              operation?.update({ current: completed.length, total: files.length });
              options.onProgress?.(completed.length, files.length, file.name);
            }
            await writeTextFileByName(folder as unknown as DirectoryHandleLike, "classes.yaml", `names:\n${[...options.classNames].map(([id, name]) => `  ${id}: ${JSON.stringify(normalizeClassName(name))}`).join("\n")}\n`);
            await writeTextFileByName(folder as unknown as DirectoryHandleLike, "inference.json", JSON.stringify({ ...options.metadata, model: options.modelName, workflow: "segmentation", maskFormat: "png-semantic-mask", overlapPolicy: "highest-confidence", images: completed, detections: detectionCount, createdAt: new Date().toISOString() }, null, 2));
            throwIfOperationCancelled(operation?.signal);
            const sources = session.segmentationLabelFolders ??= [session.imageFolderHandle!];
            const index = sources.findIndex((source) => source.name === folder.name);
            if (index < 0) sources.push(folder); else sources[index] = folder;
            await activateLabelFolder(folder, operation);
            result = { folderName, imageCount: completed.length, detectionCount };
          });
        });
        return result;
      },

      async selectClassInfoFolder(selectedFolder?: Promise<FileSystemDirectoryHandle>): Promise<void> {
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

            const folderHandle = await (selectedFolder ?? picker({ id: "class-info", mode: "readwrite" }));
            throwIfOperationCancelled(operation?.signal);
            input.state.session.classInfoFolderHandle = folderHandle;
            await refreshClassFileStateFromAvailableFolder(operation);
          });
        });
      },

      async loadDefaultClassInfo(): Promise<void> {
        const getProfileDirectory = input.windowRef.getEasyLabelingProfileDirectory;
        if (typeof getProfileDirectory !== "function") {
          return;
        }
        input.state.session.classInfoFolderHandle = await getProfileDirectory("class-info");
        await refreshClassFileStateFromAvailableFolder();
      },

      async refreshReviewFindings(): Promise<void> {
        await refreshReviewFindings();
        if (connectedDeps) {
          (connectedDeps.uiManager as RuntimeUiManager).renderImageList();
        }
      },

      async setReviewImageStatus(imagePath: string, status: ReviewImageStatus): Promise<void> {
        input.state.session.reviewState.images[imagePath] = {
          status,
          reviewedAt: status === "reviewed" ? new Date().toISOString() : null
        };
        await persistReviewState();
        if (connectedDeps) {
          (connectedDeps.uiManager as RuntimeUiManager).renderImageList();
        }
      },

      async updateReviewSettings(settings: ReviewSettings): Promise<void> {
        input.state.session.reviewState.settings = settings;
        await persistReviewState();
        await refreshReviewFindings();
        if (connectedDeps) {
          (connectedDeps.uiManager as RuntimeUiManager).renderImageList();
        }
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
            if (workflow === "detection") {
              await refreshReviewFindings();
            }
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

      async readSegmentationLabels(imageFileName, width, height) {
        const session = input.state.session;
        let snapshot: import("../features/segmentation/types.js").SegmentationDocumentSnapshot | null = null;
        // Reuse the PNG/YOLO/COCO/LabelMe loader with isolated state; never navigate or overwrite current edits.
        const reader = createImageSessionService({
          imageFolderHandle: session.imageFolderHandle as unknown as DirectoryHandleLike | null,
          labelFolderHandle: null,
          segmentationLabelFolderHandle: session.segmentationLabelFolderHandle as unknown as DirectoryHandleLike | null,
          imageFiles: [], imageWorkflowStatus: new Map(), currentImageFile: null,
          currentImage: { width, height }, currentLoadToken: 0, isAutoSaveEnabled: false,
          workflow: "segmentation", segmentationAnnotationType: session.segmentationAnnotationType,
          segmentationSourceFormat: session.segmentationSourceFormat, segmentationExportFormat: session.segmentationExportFormat,
          classFiles: [], classNames: session.classNames, saveTimeout: null
        }, {
          decodeImage: async () => null, readCurrentLabelsAsYolo: () => "", readCurrentSegmentationSnapshot: () => null,
          applyLoadedYolo: () => {}, applyLoadedSegmentationSnapshot: (loaded) => { snapshot = loaded; }, clearPendingSaveTimeout: () => {}
        });
        await reader.loadLabels(imageFileName, 0);
        return snapshot;
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

        if ((connectedDeps.uiManager as RuntimeUiManager).elements.classFileSelect.value === CREATE_NEW_CLASS_FILE_VALUE) {
          const created = await this.createNewClassFile();
          if (!created) return;
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

      async createNewClassFile(): Promise<boolean> {
        if (!input.state.session.classInfoFolderHandle) {
          await this.loadDefaultClassInfo();
        }
        const folderHandle = (input.state.session.classInfoFolderHandle ?? input.state.session.labelFolderHandle) as DirectoryHandleLike | null;
        if (!folderHandle || !connectedDeps) {
          (connectedDeps?.uiManager as RuntimeUiManager | undefined)?.notify("Open a dataset or connect a Class Info folder first.");
          return false;
        }

        const uiManager = connectedDeps.uiManager as RuntimeUiManager;
        const fileName = await uiManager.promptForClassFileName("classes.yaml", input.state.session.classFiles.map((file) => file.name));
        if (!fileName) {
          uiManager.renderClassFileSelect();
          return false;
        }
        const result = await createNewClassFile(folderHandle, fileName);
        if (!result.created) {
          uiManager.notify("A class file with this name already exists.");
          uiManager.renderClassFileSelect();
          return false;
        }
        if (!result.fileHandle) {
          return false;
        }

        input.state.session.classFiles = [...input.state.session.classFiles, result.fileHandle as FileHandle];
        uiManager.renderClassFileSelect();
        await this.loadClassNamesFromFile(result.fileHandle);
        return true;
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
