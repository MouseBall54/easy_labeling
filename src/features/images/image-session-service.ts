import {
  compareNamedFilesByImageName,
  imageFileNameToBaseName,
  isSupportedImageFileName
} from "../../domain/files/image-names.js";
import {
  createEmptyImageWorkflowStatus,
  type AnnotationAssetPathSet,
  type ImageWorkflowStatus
} from "../../domain/annotations/contracts.js";
import { assertAnnotationOutputUnshared, resolveAnnotationAssetPaths } from "../../domain/annotations/paths.js";
import { createSegmentationAnnotationCodec } from "../../domain/annotations/segmentation-codec.js";
import { exportSegmentationAnnotations, importSegmentationAnnotations } from "../../domain/annotations/segmentation-adapters.js";
import { createEditableSnapshotFromAnnotationModel, createInstanceAnnotationModelFromSnapshot, createSemanticAnnotationModel } from "../../domain/annotations/segmentation-model.js";
import { annotationOutput, maskOutputCounts, resolveOutputDirectory, type AnnotationOutput } from "./annotation-storage.js";
import { detectSegmentationFormat, type SegmentationFormatDetectionResult } from "../../domain/annotations/segmentation-format.js";
import { parseYoloRows } from "../../domain/yolo/yolo.js";
import { throwIfOperationCancelled } from "../../app/operation.js";
import type { SegmentationDocumentSnapshot } from "../../features/segmentation/types.js";
import {
  getSubdirectoryHandle,
  isNotFoundError,
  listFileHandles,
  readFileText,
  readTextFileByName,
  readBinaryFileByName,
  writeBinaryFileByName,
  writeTextFileByName
} from "../../platform/file-system-access.js";
import type { DirectoryHandleLike, FileHandleLike } from "../../types/files.js";
import type { WorkflowType } from "../../types/labels.js";
import type { SegmentationExternalFormat } from "../../domain/annotations/segmentation-format.js";
import { getNativeBridge } from "../../platform/native-bridge.js";

const DEFAULT_CLASS_INFO_YAML = [0, 1, 2, 3, 4]
  .map((classId) => `${classId}: class ${classId}`)
  .join("\n") + "\n";

export interface ImageSessionServiceState {
  imageFolderHandle: DirectoryHandleLike | null;
  labelFolderHandle: DirectoryHandleLike | null;
  segmentationLabelFolderHandle?: DirectoryHandleLike | null;
  imageFiles: FileHandleLike[];
  imageWorkflowStatus: Map<string, ImageWorkflowStatus>;
  currentImageFile: FileHandleLike | null;
  currentImage: unknown;
  currentLoadToken: number;
  isAutoSaveEnabled: boolean;
  workflow: WorkflowType;
  segmentationAnnotationType: "semantic" | "instance";
  segmentationSourceFormat: SegmentationExternalFormat;
  segmentationExportFormat: SegmentationExternalFormat;
  classFiles: FileHandleLike[];
  classNames: Map<string, string>;
  saveTimeout: ReturnType<typeof setTimeout> | null;
}

export interface DecodeImageInput {
  fileHandle: FileHandleLike;
}

export interface ImageSessionServiceDeps {
  decodeImage(input: DecodeImageInput): Promise<unknown>;
  readCurrentLabelsAsYolo(): string;
  readCurrentSegmentationSnapshot(): SegmentationDocumentSnapshot | null;
  applyLoadedYolo(yoloData: string): Promise<void> | void;
  applyLoadedSegmentationSnapshot(snapshot: SegmentationDocumentSnapshot | null): Promise<void> | void;
  clearPendingSaveTimeout(timeout: ReturnType<typeof setTimeout> | null): void;
  hasUnsavedChanges?(): boolean;
  shouldCreateMissingLabelFolder?(): Promise<boolean> | boolean;
}

export interface SelectImageFolderResult {
  labelFolderHandle: DirectoryHandleLike | null;
  labelFolderStatus: "auto" | "created" | "missing";
}

export interface SaveLabelsResult {
  saved: boolean;
  primaryFilePath: string | null;
  hasLabels: boolean;
  removedOutOfBoundsCount: number;
  output?: AnnotationOutput;
  boxCount?: number;
  mask?: ReturnType<typeof maskOutputCounts>;
}

export class AnnotationSaveError extends Error {
  constructor(readonly output: AnnotationOutput, readonly writtenPaths: string[], message: string, cause?: unknown) {
    super(message, { cause });
  }
}

export interface ImageSessionService {
  selectImageFolder(imageFolderHandle: DirectoryHandleLike): Promise<SelectImageFolderResult>;
  listImageFiles(): Promise<FileHandleLike[]>;
  /** `knownCounts`: label rows per .txt file already counted (by the review check); only the rest are read. */
  refreshImageWorkflowStatus(signal?: AbortSignal, knownCounts?: ReadonlyMap<string, number>): Promise<void>;
  loadImageAndLabels(imageFileHandle: FileHandleLike): Promise<void>;
  loadLabels(imageName: string, loadToken: number): Promise<void>;
  saveLabels(isAuto?: boolean, details?: boolean): Promise<SaveLabelsResult>;
}

async function resolveLabelFolder(
  imageFolderHandle: DirectoryHandleLike,
  shouldCreateMissingLabelFolder?: () => Promise<boolean> | boolean
): Promise<SelectImageFolderResult> {
  try {
    const labelFolderHandle = await getSubdirectoryHandle(imageFolderHandle, "label");
    return {
      labelFolderHandle,
      labelFolderStatus: "auto"
    };
  } catch (error: unknown) {
    if (!isNotFoundError(error)) {
      throw error;
    }

    const shouldCreate = await shouldCreateMissingLabelFolder?.();
    if (!shouldCreate) {
      return {
        labelFolderHandle: null,
        labelFolderStatus: "missing"
      };
    }

    const labelFolderHandle = await getSubdirectoryHandle(imageFolderHandle, "label", { create: true });
    try {
      await labelFolderHandle.getFileHandle("classes.yaml");
    } catch (error: unknown) {
      if (!isNotFoundError(error)) {
        throw error;
      }
      await writeTextFileByName(labelFolderHandle, "classes.yaml", DEFAULT_CLASS_INFO_YAML);
    }
    return {
      labelFolderHandle,
      labelFolderStatus: "created"
    };
  }
}

async function getNestedDirectoryHandle(
  directoryHandle: DirectoryHandleLike,
  pathSegments: string[]
): Promise<DirectoryHandleLike | null> {
  let current: DirectoryHandleLike = directoryHandle;
  for (const segment of pathSegments) {
    try {
      current = await getSubdirectoryHandle(current, segment);
    } catch (error: unknown) {
      if (isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }
  return current;
}

/**
 * Desktop app: label rows per `.txt` file, counted in Rust (crates/el-core/src/review_folder.rs) instead of
 * reading every file over IPC. Null when there is no native side or it failed: the caller counts in TS.
 */
async function readDetectionBoxCountsNatively(labelFolder: DirectoryHandleLike | null): Promise<Map<string, number> | null> {
  const native = getNativeBridge("label-scan");
  const folder = native && labelFolder ? native.pathOf(labelFolder) : null;
  if (!native || !folder) return null;
  try {
    return new Map(Object.entries(await native.invoke<Record<string, number>>("label_row_counts", { folder })));
  } catch (error) {
    console.warn("Native label scan failed; reading the files in TS.", error);
    return null;
  }
}

async function listFileNames(directoryHandle: DirectoryHandleLike | null, predicate?: (fileName: string) => boolean): Promise<Set<string>> {
  if (!directoryHandle) {
    return new Set<string>();
  }

  const fileHandles = await listFileHandles(directoryHandle);
  return new Set(
    fileHandles
      .map((fileHandle) => fileHandle.name)
      .filter((fileName) => predicate ? predicate(fileName) : true)
  );
}

async function inspectSegmentationSource(directoryHandle: DirectoryHandleLike): Promise<SegmentationFormatDetectionResult> {
  const entries = [] as Array<{ kind: "file" | "directory"; name: string }>;
  for await (const entry of directoryHandle.values()) entries.push(entry);
  const jsonTextByFileName = new Map<string, string>();
  await Promise.all(entries.filter((entry) => entry.kind === "file" && entry.name.toLowerCase().endsWith(".json")).map(async (entry) => {
    try { jsonTextByFileName.set(entry.name, await readTextFileByName(directoryHandle, entry.name)); } catch { /* an unreadable JSON file is not a detection signal */ }
  }));
  return detectSegmentationFormat({
    fileNames: entries.filter((entry) => entry.kind === "file").map((entry) => entry.name),
    directoryNames: entries.filter((entry) => entry.kind === "directory").map((entry) => entry.name),
    jsonTextByFileName
  });
}

async function listRelativeFilePaths(
  imageFolderHandle: DirectoryHandleLike | null,
  pathSegments: string[],
  predicate?: (fileName: string) => boolean
): Promise<Set<string>> {
  if (!imageFolderHandle) {
    return new Set<string>();
  }

  const directoryHandle = await getNestedDirectoryHandle(imageFolderHandle, pathSegments);
  const fileNames = await listFileNames(directoryHandle, predicate);
  const prefix = pathSegments.join("/");
  return new Set([...fileNames].map((fileName) => `${prefix}/${fileName}`));
}

function deriveImageWorkflowStatus(
  imageFileName: string,
  detectionBoxCounts: ReadonlyMap<string, number>,
  segmentationAnnotationPaths: ReadonlySet<string>
): ImageWorkflowStatus {
  const imageBaseName = imageFileNameToBaseName(imageFileName);
  const status = createEmptyImageWorkflowStatus();
  const detectionPaths = resolveAnnotationAssetPaths("detection", imageBaseName);
  const segmentationPaths = resolveAnnotationAssetPaths("segmentation", imageBaseName);

  const detectionFileName = detectionPaths.primaryFilePath.split("/").pop() ?? `${imageBaseName}.txt`;
  status.detection.boxCount = detectionBoxCounts.get(detectionFileName) ?? 0;
  status.detection.hasAnnotation = status.detection.boxCount > 0;
  status.segmentation.hasAnnotation = segmentationAnnotationPaths.has(segmentationPaths.primaryFilePath);

  return status;
}

function ensureImageWorkflowStatus(state: ImageSessionServiceState, imageFileName: string): ImageWorkflowStatus {
  const existing = state.imageWorkflowStatus.get(imageFileName);
  if (existing) {
    return existing;
  }

  const created = createEmptyImageWorkflowStatus();
  state.imageWorkflowStatus.set(imageFileName, created);
  return created;
}

export function createImageSessionService(
  state: ImageSessionServiceState,
  deps: ImageSessionServiceDeps
): ImageSessionService {
  return {
    async selectImageFolder(imageFolderHandle: DirectoryHandleLike): Promise<SelectImageFolderResult> {
      state.imageFolderHandle = imageFolderHandle;
      state.currentImageFile = null;
      state.currentImage = null;
      state.labelFolderHandle = null;
      state.segmentationLabelFolderHandle = null;
      state.classFiles = [];
      state.classNames.clear();

      const labelSelection = await resolveLabelFolder(
        imageFolderHandle,
        deps.shouldCreateMissingLabelFolder
      );
      state.labelFolderHandle = labelSelection.labelFolderHandle;

      await this.listImageFiles();

      return labelSelection;
    },

    async listImageFiles(): Promise<FileHandleLike[]> {
      if (!state.imageFolderHandle) {
        return [];
      }

      const fileHandles = await listFileHandles(state.imageFolderHandle);
      const imageFileHandles = fileHandles.filter((fileHandle) => isSupportedImageFileName(fileHandle.name));
      imageFileHandles.sort(compareNamedFilesByImageName);
      state.imageFiles = imageFileHandles;
      state.imageWorkflowStatus.clear();

      if (state.imageFiles.length > 0) {
        await this.loadImageAndLabels(state.imageFiles[0]);
      }

      return state.imageFiles;
    },

    async refreshImageWorkflowStatus(signal?: AbortSignal, knownCounts?: ReadonlyMap<string, number>): Promise<void> {
      throwIfOperationCancelled(signal);
      const countInTs = async (): Promise<Map<string, number>> => {
        const counts = new Map<string, number>();
        const detectionAnnotationFileNames = await listFileNames(state.labelFolderHandle, (fileName) => fileName.endsWith(".txt"));
        const count = async (fileName: string): Promise<void> => {
          if (!state.labelFolderHandle) {
            return;
          }
          const known = knownCounts?.get(fileName);
          if (known !== undefined) {
            counts.set(fileName, known);
            return;
          }
          throwIfOperationCancelled(signal);
          const fileHandle = await state.labelFolderHandle.getFileHandle(fileName);
          throwIfOperationCancelled(signal); // the lookup is a round trip on the desktop app: check again before reading
          const yoloText = await readFileText(fileHandle);
          throwIfOperationCancelled(signal);
          counts.set(fileName, parseYoloRows(yoloText, 1, 1).length);
        };
        // A stoppable (background) count reads one file at a time, so stopping it leaves no reads in flight.
        if (signal) for (const fileName of detectionAnnotationFileNames) await count(fileName);
        else await Promise.all([...detectionAnnotationFileNames].map(count));
        return counts;
      };
      const detectionBoxCounts = await readDetectionBoxCountsNatively(state.labelFolderHandle) ?? await countInTs();
      throwIfOperationCancelled(signal);
      const segmentationAnnotationPaths = await listRelativeFilePaths(state.segmentationLabelFolderHandle ?? state.imageFolderHandle, ["mask"], (fileName) => {
        return fileName.endsWith(".png");
      });

      throwIfOperationCancelled(signal);
      const statuses = new Map<string, ImageWorkflowStatus>();
      state.imageFiles.forEach((fileHandle) => {
        statuses.set(
          fileHandle.name,
          deriveImageWorkflowStatus(
            fileHandle.name,
            detectionBoxCounts,
            segmentationAnnotationPaths
          )
        );
      });
      state.imageWorkflowStatus = statuses;
    },

    async loadImageAndLabels(imageFileHandle: FileHandleLike): Promise<void> {
      if (state.isAutoSaveEnabled && state.currentImageFile) {
        await this.saveLabels(true);
      }

      deps.clearPendingSaveTimeout(state.saveTimeout);
      state.saveTimeout = null;

      state.currentLoadToken += 1;
      const loadToken = state.currentLoadToken;
      state.currentImageFile = imageFileHandle;

      const decodedImage = await deps.decodeImage({ fileHandle: imageFileHandle });

      if (loadToken !== state.currentLoadToken) {
        return;
      }

      state.currentImage = decodedImage;
      await this.loadLabels(imageFileHandle.name, loadToken);
    },

    async loadLabels(imageName: string, loadToken: number): Promise<void> {
      const imageBaseName = imageFileNameToBaseName(imageName);
      const applySegmentationSnapshot = async (snapshot: SegmentationDocumentSnapshot | null): Promise<void> => {
        if (loadToken !== state.currentLoadToken) return;
        ensureImageWorkflowStatus(state, imageName).segmentation.hasAnnotation = snapshot !== null;
        await deps.applyLoadedSegmentationSnapshot(snapshot);
      };

      let detectionYolo = "";
      if (state.labelFolderHandle) {
        const labelFilePath = resolveAnnotationAssetPaths("detection", imageBaseName).primaryFilePath;
        const labelFileName = labelFilePath.split("/").pop() ?? `${imageBaseName}.txt`;
        try {
          detectionYolo = await readTextFileByName(state.labelFolderHandle, labelFileName);
          if (loadToken !== state.currentLoadToken) {
            return;
          }
        } catch (error: unknown) {
          if (!isNotFoundError(error)) {
            throw error;
          }
        }
      }
      if (loadToken !== state.currentLoadToken) return;
      const boxCount = parseYoloRows(detectionYolo, 1, 1).length;
      ensureImageWorkflowStatus(state, imageName).detection = { hasAnnotation: boxCount > 0, boxCount };
      await deps.applyLoadedYolo(detectionYolo);

      if (!state.imageFolderHandle) {
        await applySegmentationSnapshot(null);
        return;
      }

      const segmentationRoot = state.segmentationLabelFolderHandle ?? state.imageFolderHandle;
      const codec = createSegmentationAnnotationCodec();
      const detectedSource = state.segmentationSourceFormat === "auto" ? await inspectSegmentationSource(segmentationRoot) : null;
      if (state.segmentationSourceFormat === "auto" && detectedSource?.confidence !== "certain") {
        await applySegmentationSnapshot(null);
        return;
      }
      const selectedSourceFormat: Exclude<SegmentationExternalFormat, "auto"> = state.segmentationSourceFormat === "auto"
        ? detectedSource!.format!
        : state.segmentationSourceFormat;
      if (selectedSourceFormat !== "png-semantic-mask") {
        const sourcePath = selectedSourceFormat === "yolo-segmentation"
          ? `segmentation/yolo/labels/${imageBaseName}.txt`
          : selectedSourceFormat === "coco-segmentation"
            ? `segmentation/coco/${imageBaseName}.json`
            : `segmentation/labelme/${imageBaseName}.json`;
        const sourceSegments = sourcePath.split("/");
        const sourceFileName = sourceSegments.pop()!;
        const sourceDirectory = await getNestedDirectoryHandle(segmentationRoot, sourceSegments);
        const fallbackYoloDirectory = selectedSourceFormat === "yolo-segmentation"
          ? await getNestedDirectoryHandle(segmentationRoot, ["labels"])
          : null;
        const fallbackSourceDirectory = selectedSourceFormat === "coco-segmentation" || selectedSourceFormat === "labelme"
          ? segmentationRoot
          : null;
        const resolvedSourceDirectory = sourceDirectory ?? fallbackYoloDirectory ?? fallbackSourceDirectory;
        if (!resolvedSourceDirectory) {
          await applySegmentationSnapshot(null);
          return;
        }
        try {
          const model = await importSegmentationAnnotations({
            format: selectedSourceFormat,
            imageId: imageBaseName,
            imagePath: imageName,
            width: (state.currentImage as { width?: number } | null)?.width ?? 1,
            height: (state.currentImage as { height?: number } | null)?.height ?? 1,
            classIdByName: new Map([...state.classNames.entries()].map(([id, name]) => [name, id])),
            text: await readTextFileByName(
              resolvedSourceDirectory,
              sourceDirectory ? sourceFileName : selectedSourceFormat === "coco-segmentation" ? "annotations.json" : selectedSourceFormat === "labelme" ? `${imageBaseName}.json` : sourceFileName
            )
          });
          if (loadToken !== state.currentLoadToken) return;
          state.segmentationAnnotationType = model.annotationType;
          await applySegmentationSnapshot(createEditableSnapshotFromAnnotationModel(model));
          return;
        } catch (error: unknown) {
          if (isNotFoundError(error)) {
            await applySegmentationSnapshot(null);
            return;
          }
          throw error;
        }
      }
      const paths = codec.resolvePaths(imageBaseName);
      const maskDirectory = await getNestedDirectoryHandle(segmentationRoot, ["mask"]);
      if (!maskDirectory) {
        await applySegmentationSnapshot(null);
        return;
      }

      const pngFileName = paths.primaryFilePath.split("/").pop() ?? `${imageBaseName}.png`;
      const metadataFileName = paths.sidecarFilePaths[0]?.split("/").pop() ?? `${imageBaseName}.seg.json`;

      try {
        const pngBytes = await readBinaryFileByName(maskDirectory, pngFileName);
        let metadataText: string | null = null;
        try {
          metadataText = await readTextFileByName(maskDirectory, metadataFileName);
        } catch (metadataError: unknown) {
          if (!isNotFoundError(metadataError)) {
            throw metadataError;
          }
        }

        if (loadToken !== state.currentLoadToken) {
          return;
        }

        const document = await codec.decode({
          imageBaseName,
          pngBytes,
          metadataText
        });
        state.segmentationAnnotationType = "semantic";
        await applySegmentationSnapshot(document.data.snapshot);
      } catch (error: unknown) {
        if (isNotFoundError(error)) {
          await applySegmentationSnapshot(null);
          return;
        }
        throw error;
      }
    },

    async saveLabels(isAuto = false, details = false): Promise<SaveLabelsResult> {
      const image = state.currentImageFile?.name;
      const workflow = state.workflow;
      const unavailable = { saved: false, primaryFilePath: null, hasLabels: false, removedOutOfBoundsCount: 0 };
      if (!image) return unavailable;
      const output = annotationOutput(state, image, workflow);
      const { folder, paths, conflictingImages } = output;
      if (!folder) return { ...unavailable, output };
      const writtenPaths: string[] = [];
      try {
        if (isAuto && conflictingImages.length && deps.hasUnsavedChanges?.() === false) return { ...unavailable, output };
        assertAnnotationOutputUnshared(paths[0]!, conflictingImages);

        if (workflow === "detection") {
          const text = deps.readCurrentLabelsAsYolo().trim();
          const boxCount = parseYoloRows(text, 1, 1).length;
          await writeTextFileByName(folder, paths[0]!, text);
          const hasLabels = text.length > 0;
          ensureImageWorkflowStatus(state, image).detection = { hasAnnotation: hasLabels, boxCount };
          return { saved: true, primaryFilePath: `label/${paths[0]}`, hasLabels, removedOutOfBoundsCount: 0, output, boxCount };
        }

        const snapshot = deps.readCurrentSegmentationSnapshot();
        if (!snapshot || !state.imageFolderHandle) return { ...unavailable, output };
        const selectedFormat = state.segmentationExportFormat;
        if (selectedFormat === "auto") throw new Error("Choose a Segmentation export format before saving.");
        const imageBaseName = imageFileNameToBaseName(image);
        const assets = await createSegmentationAnnotationCodec().encode({ imageBaseName, snapshot });
        if (selectedFormat !== "png-semantic-mask") {
          const model = state.segmentationAnnotationType === "instance"
            ? createInstanceAnnotationModelFromSnapshot({ imageId: imageBaseName, imagePath: image, snapshot })
            : createSemanticAnnotationModel({ imageId: imageBaseName, imagePath: image, snapshot });
          const exported = await exportSegmentationAnnotations({ format: selectedFormat, model, fileName: image });
          if (exported.text === undefined) throw new Error(`${selectedFormat} did not produce a text annotation file.`);
          assets.push({ path: paths[1]!, content: exported.text });
        }
        const mask = details ? maskOutputCounts(snapshot) : undefined;
        for (const asset of assets) {
          const parts = asset.path.split("/");
          const fileName = parts.pop()!;
          const directory = await resolveOutputDirectory(folder, parts, true);
          if (typeof asset.content === "string") await writeTextFileByName(directory, fileName, asset.content);
          else await writeBinaryFileByName(directory, fileName, asset.content instanceof Uint8Array ? asset.content.slice().buffer as ArrayBuffer : asset.content);
          writtenPaths.push(asset.path);
        }
        const hasLabels = snapshot.mask.some((value) => value !== 0);
        ensureImageWorkflowStatus(state, image).segmentation.hasAnnotation = hasLabels;
        return {
          saved: true, primaryFilePath: paths.at(-1)!, hasLabels, removedOutOfBoundsCount: 0, output,
          ...(mask ? { mask } : {})
        };
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        throw new AnnotationSaveError(output, writtenPaths, `${image} (${workflow}, ${paths.join(", ")}): ${reason}`, error);
      }
    }
  };
}
