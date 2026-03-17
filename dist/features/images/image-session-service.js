import { compareNamedFilesByImageName, imageFileNameToLabelFileName, isImageLabeledByLabelFileExistence, isSupportedImageFileName } from "../../domain/files/image-names.js";
import { getSubdirectoryHandle, isNotFoundError, listFileHandles, readFileArrayBuffer, readTextFileByName, writeTextFileByName } from "../../platform/file-system-access.js";
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
function clearPreviewCache(state, revokePreviewUrl) {
    state.previewImageCache.forEach((url) => {
        if (url.startsWith("blob:")) {
            revokePreviewUrl(url);
        }
    });
    state.previewImageCache.clear();
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
            const labelSelection = await resolveLabelFolder(imageFolderHandle, deps.shouldCreateMissingLabelFolder);
            state.labelFolderHandle = labelSelection.labelFolderHandle;
            clearPreviewCache(state, deps.revokePreviewUrl);
            await this.listImageFiles();
            return labelSelection;
        },
        async listImageFiles() {
            if (!state.imageFolderHandle) {
                return [];
            }
            state.imageFiles = [];
            state.imageLabelStatus.clear();
            const labelFileNames = new Set();
            if (state.labelFolderHandle) {
                const labelFiles = await listFileHandles(state.labelFolderHandle);
                labelFiles.forEach((fileHandle) => {
                    if (fileHandle.name.endsWith(".txt")) {
                        labelFileNames.add(fileHandle.name);
                    }
                });
            }
            const fileHandles = await listFileHandles(state.imageFolderHandle);
            const imageFileHandles = fileHandles.filter((fileHandle) => isSupportedImageFileName(fileHandle.name));
            imageFileHandles.forEach((fileHandle) => {
                const hasLabel = isImageLabeledByLabelFileExistence(fileHandle.name, labelFileNames);
                state.imageLabelStatus.set(fileHandle.name, hasLabel);
            });
            imageFileHandles.sort(compareNamedFilesByImageName);
            state.imageFiles = imageFileHandles;
            if (state.imageFiles.length > 0) {
                await this.loadImageAndLabels(state.imageFiles[0]);
            }
            return state.imageFiles;
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
            if (!state.labelFolderHandle) {
                return;
            }
            const labelFileName = imageFileNameToLabelFileName(imageName);
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
                if (isNotFoundError(error)) {
                    return;
                }
                throw error;
            }
        },
        async saveLabels(isAuto = false) {
            void isAuto;
            if (!state.currentImageFile || !state.labelFolderHandle) {
                return {
                    saved: false,
                    labelFileName: null,
                    hasLabels: false
                };
            }
            const yoloString = deps.readCurrentLabelsAsYolo();
            const trimmedYolo = yoloString.trim();
            const labelFileName = imageFileNameToLabelFileName(state.currentImageFile.name);
            await writeTextFileByName(state.labelFolderHandle, labelFileName, trimmedYolo);
            const hasLabels = trimmedYolo.length > 0;
            if (state.imageLabelStatus.get(state.currentImageFile.name) !== hasLabels) {
                state.imageLabelStatus.set(state.currentImageFile.name, hasLabels);
            }
            return {
                saved: true,
                labelFileName,
                hasLabels
            };
        }
    };
}
