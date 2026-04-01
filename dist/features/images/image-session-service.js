import { compareNamedFilesByImageName, imageFileNameToBaseName, isSupportedImageFileName } from "../../domain/files/image-names.js";
import { createEmptyImageWorkflowStatus } from "../../domain/annotations/contracts.js";
import { resolveAnnotationAssetPaths } from "../../domain/annotations/paths.js";
import { createSegmentationAnnotationCodec } from "../../domain/annotations/segmentation-codec.js";
import { getSubdirectoryHandle, isNotFoundError, listFileHandles, readFileArrayBuffer, readFileText, readTextFileByName, readBinaryFileByName, writeBinaryFileByName, writeTextFileByName } from "../../platform/file-system-access.js";
async function resolveLabelFolder(imageFolderHandle, shouldCreateMissingLabelFolder) {
    try {
        const labelFolderHandle = await getSubdirectoryHandle(imageFolderHandle, "label");
        return {
            labelFolderHandle,
            labelFolderStatus: "auto"
        };
    }
    catch (error) {
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
        return {
            labelFolderHandle,
            labelFolderStatus: "created"
        };
    }
}
async function getNestedDirectoryHandle(directoryHandle, pathSegments) {
    let current = directoryHandle;
    for (const segment of pathSegments) {
        try {
            current = await getSubdirectoryHandle(current, segment);
        }
        catch (error) {
            if (isNotFoundError(error)) {
                return null;
            }
            throw error;
        }
    }
    return current;
}
async function listFileNames(directoryHandle, predicate) {
    if (!directoryHandle) {
        return new Set();
    }
    const fileHandles = await listFileHandles(directoryHandle);
    return new Set(fileHandles
        .map((fileHandle) => fileHandle.name)
        .filter((fileName) => predicate ? predicate(fileName) : true));
}
async function listRelativeFilePaths(imageFolderHandle, pathSegments, predicate) {
    if (!imageFolderHandle) {
        return new Set();
    }
    const directoryHandle = await getNestedDirectoryHandle(imageFolderHandle, pathSegments);
    const fileNames = await listFileNames(directoryHandle, predicate);
    const prefix = pathSegments.join("/");
    return new Set([...fileNames].map((fileName) => `${prefix}/${fileName}`));
}
function clearPreviewCache(state, revokePreviewUrl) {
    state.previewImageCache.forEach((url) => {
        if (url.startsWith("blob:")) {
            revokePreviewUrl(url);
        }
    });
    state.previewImageCache.clear();
}
function deriveImageWorkflowStatus(imageFileName, detectionAnnotationFileNames, segmentationAnnotationPaths) {
    const imageBaseName = imageFileNameToBaseName(imageFileName);
    const status = createEmptyImageWorkflowStatus();
    const detectionPaths = resolveAnnotationAssetPaths("detection", imageBaseName);
    const segmentationPaths = resolveAnnotationAssetPaths("segmentation", imageBaseName);
    status.detection.hasAnnotation = detectionAnnotationFileNames.has(detectionPaths.primaryFilePath.split("/").pop() ?? `${imageBaseName}.txt`);
    status.segmentation.hasAnnotation = segmentationAnnotationPaths.has(segmentationPaths.primaryFilePath);
    return status;
}
function ensureImageWorkflowStatus(state, imageFileName) {
    const existing = state.imageWorkflowStatus.get(imageFileName);
    if (existing) {
        return existing;
    }
    const created = createEmptyImageWorkflowStatus();
    state.imageWorkflowStatus.set(imageFileName, created);
    return created;
}
export function createImageSessionService(state, deps) {
    return {
        async selectImageFolder(imageFolderHandle) {
            state.imageFolderHandle = imageFolderHandle;
            state.currentImageFile = null;
            state.currentImage = null;
            state.labelFolderHandle = null;
            state.classFiles = [];
            state.classNames.clear();
            const labelSelection = await resolveLabelFolder(imageFolderHandle, state.workflow === "detection" ? deps.shouldCreateMissingLabelFolder : undefined);
            state.labelFolderHandle = labelSelection.labelFolderHandle;
            clearPreviewCache(state, deps.revokePreviewUrl);
            await this.listImageFiles();
            return labelSelection;
        },
        async listImageFiles() {
            if (!state.imageFolderHandle) {
                return [];
            }
            const fileHandles = await listFileHandles(state.imageFolderHandle);
            const imageFileHandles = fileHandles.filter((fileHandle) => isSupportedImageFileName(fileHandle.name));
            imageFileHandles.sort(compareNamedFilesByImageName);
            state.imageFiles = imageFileHandles;
            await this.refreshImageWorkflowStatus();
            if (state.imageFiles.length > 0) {
                await this.loadImageAndLabels(state.imageFiles[0]);
            }
            return state.imageFiles;
        },
        async refreshImageWorkflowStatus() {
            const detectionAnnotationFileNames = await listFileNames(state.labelFolderHandle, (fileName) => fileName.endsWith(".txt"));
            const segmentationAnnotationPaths = await listRelativeFilePaths(state.imageFolderHandle, ["mask"], (fileName) => {
                return fileName.endsWith(".png") || fileName.endsWith(".seg.json");
            });
            state.imageWorkflowStatus.clear();
            state.imageFiles.forEach((fileHandle) => {
                state.imageWorkflowStatus.set(fileHandle.name, deriveImageWorkflowStatus(fileHandle.name, detectionAnnotationFileNames, segmentationAnnotationPaths));
            });
        },
        async loadImageAndLabels(imageFileHandle) {
            if (state.isAutoSaveEnabled && state.currentImageFile) {
                await this.saveLabels(true);
            }
            deps.clearPendingSaveTimeout(state.saveTimeout);
            state.saveTimeout = null;
            state.currentLoadToken += 1;
            const loadToken = state.currentLoadToken;
            state.currentImageFile = imageFileHandle;
            const isTiffImage = /\.(tif|tiff)$/i.test(imageFileHandle.name);
            const tiffBuffer = isTiffImage ? await readFileArrayBuffer(imageFileHandle) : null;
            const decodedImage = await deps.decodeImage({ fileHandle: imageFileHandle, tiffBuffer });
            if (loadToken !== state.currentLoadToken) {
                return;
            }
            state.currentImage = decodedImage;
            await this.loadLabels(imageFileHandle.name, loadToken);
        },
        async loadLabels(imageName, loadToken) {
            const imageBaseName = imageFileNameToBaseName(imageName);
            if (state.workflow === "detection") {
                if (!state.labelFolderHandle) {
                    return;
                }
                const labelFilePath = resolveAnnotationAssetPaths("detection", imageBaseName).primaryFilePath;
                const labelFileName = labelFilePath.split("/").pop() ?? `${imageBaseName}.txt`;
                try {
                    const yoloData = await readTextFileByName(state.labelFolderHandle, labelFileName);
                    if (loadToken !== state.currentLoadToken) {
                        return;
                    }
                    if (yoloData.trim()) {
                        await deps.applyLoadedYolo(yoloData);
                    }
                }
                catch (error) {
                    if (!isNotFoundError(error)) {
                        throw error;
                    }
                }
                return;
            }
            if (state.workflow !== "segmentation") {
                return;
            }
            if (!state.imageFolderHandle) {
                return;
            }
            const codec = createSegmentationAnnotationCodec();
            const paths = codec.resolvePaths(imageBaseName);
            const maskDirectory = await getNestedDirectoryHandle(state.imageFolderHandle, ["mask"]);
            if (!maskDirectory) {
                await deps.applyLoadedSegmentationSnapshot(null);
                return;
            }
            const pngFileName = paths.primaryFilePath.split("/").pop() ?? `${imageBaseName}.png`;
            const metadataFileName = paths.sidecarFilePaths[0]?.split("/").pop() ?? `${imageBaseName}.seg.json`;
            try {
                const pngBytes = await readBinaryFileByName(maskDirectory, pngFileName);
                let metadataText = null;
                try {
                    metadataText = await readTextFileByName(maskDirectory, metadataFileName);
                }
                catch (metadataError) {
                    if (!isNotFoundError(metadataError)) {
                        throw metadataError;
                    }
                }
                if (loadToken !== state.currentLoadToken) {
                    return;
                }
                const document = codec.decode({
                    imageBaseName,
                    pngBytes,
                    metadataText
                });
                await deps.applyLoadedSegmentationSnapshot(document.data.snapshot);
            }
            catch (error) {
                if (isNotFoundError(error)) {
                    await deps.applyLoadedSegmentationSnapshot(null);
                    return;
                }
                throw error;
            }
        },
        async saveLabels(isAuto = false) {
            void isAuto;
            if (!state.currentImageFile) {
                return {
                    saved: false,
                    primaryFilePath: null,
                    hasLabels: false
                };
            }
            if (state.workflow === "detection") {
                if (!state.labelFolderHandle) {
                    return {
                        saved: false,
                        primaryFilePath: null,
                        hasLabels: false
                    };
                }
                const yoloString = deps.readCurrentLabelsAsYolo();
                const trimmedYolo = yoloString.trim();
                const primaryFilePath = resolveAnnotationAssetPaths("detection", imageFileNameToBaseName(state.currentImageFile.name)).primaryFilePath;
                const labelFileName = primaryFilePath.split("/").pop() ?? `${imageFileNameToBaseName(state.currentImageFile.name)}.txt`;
                await writeTextFileByName(state.labelFolderHandle, labelFileName, trimmedYolo);
                const hasLabels = trimmedYolo.length > 0;
                const imageStatus = ensureImageWorkflowStatus(state, state.currentImageFile.name);
                imageStatus.detection.hasAnnotation = hasLabels;
                state.imageWorkflowStatus.set(state.currentImageFile.name, imageStatus);
                return {
                    saved: true,
                    primaryFilePath,
                    hasLabels
                };
            }
            if (state.workflow !== "segmentation" || !state.imageFolderHandle) {
                return {
                    saved: false,
                    primaryFilePath: null,
                    hasLabels: false
                };
            }
            const snapshot = deps.readCurrentSegmentationSnapshot();
            if (!snapshot) {
                return {
                    saved: false,
                    primaryFilePath: null,
                    hasLabels: false
                };
            }
            const codec = createSegmentationAnnotationCodec();
            const imageBaseName = imageFileNameToBaseName(state.currentImageFile.name);
            const assets = codec.encode({ imageBaseName, snapshot });
            const maskDirectory = await getSubdirectoryHandle(state.imageFolderHandle, "mask", { create: true });
            for (const asset of assets) {
                const fileName = asset.path.split("/").pop() ?? asset.path;
                if (typeof asset.content === "string") {
                    await writeTextFileByName(maskDirectory, fileName, asset.content);
                }
                else {
                    const binaryContent = asset.content instanceof Uint8Array
                        ? (() => { const copy = new Uint8Array(asset.content.byteLength); copy.set(asset.content); return copy.buffer; })()
                        : asset.content;
                    await writeBinaryFileByName(maskDirectory, fileName, binaryContent);
                }
            }
            const hasMask = snapshot.mask.some((value) => value !== 0);
            const imageStatus = ensureImageWorkflowStatus(state, state.currentImageFile.name);
            imageStatus.segmentation.hasAnnotation = hasMask;
            state.imageWorkflowStatus.set(state.currentImageFile.name, imageStatus);
            return {
                saved: true,
                primaryFilePath: assets[0]?.path ?? null,
                hasLabels: hasMask
            };
        }
    };
}
