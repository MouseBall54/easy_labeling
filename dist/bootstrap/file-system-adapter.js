import { createImageSessionService } from "../features/images/image-session-service.js";
import { createNewClassFile, readClassNamesFromFileHandle, readClassFileRowsForEditor, validateAndSaveClassRowsToFileHandle } from "../features/classes/class-file-service.js";
import { imageFileNameToLabelFileName } from "../domain/files/image-names.js";
import { isNotFoundError, listFileHandles, readTextFileByName } from "../platform/file-system-access.js";
import { deriveHiddenLabelClassesForResetScope } from "../ui/filter-state.js";
class LiveImageSessionState {
    appState;
    constructor(appState) {
        this.appState = appState;
    }
    get imageFolderHandle() {
        return this.appState.session.imageFolderHandle;
    }
    set imageFolderHandle(value) {
        this.appState.session.imageFolderHandle = value;
    }
    get labelFolderHandle() {
        return this.appState.session.labelFolderHandle;
    }
    set labelFolderHandle(value) {
        this.appState.session.labelFolderHandle = value;
    }
    get imageFiles() {
        return this.appState.session.imageFiles;
    }
    set imageFiles(value) {
        this.appState.session.imageFiles = value;
    }
    get imageLabelStatus() {
        return this.appState.session.imageLabelStatus;
    }
    set imageLabelStatus(value) {
        this.appState.session.imageLabelStatus = value;
    }
    get currentImageFile() {
        return this.appState.session.currentImageFile;
    }
    set currentImageFile(value) {
        this.appState.session.currentImageFile = value;
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
        return this.appState.session.classFiles;
    }
    set classFiles(value) {
        this.appState.session.classFiles = value;
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
function isTiffConstructor(value) {
    return typeof value === "function";
}
async function loadImageElementFromUrl(url) {
    const image = new Image();
    image.src = url;
    try {
        await image.decode();
        return image;
    }
    catch (decodeError) {
        await new Promise((resolve, reject) => {
            image.onload = () => resolve();
            image.onerror = () => reject(decodeError instanceof Error ? decodeError : new Error("Failed to decode image"));
        });
    }
    return image;
}
export function createFileSystemAdapter(input) {
    let connectedDeps = null;
    let pendingLoadedYolo = null;
    let operationChain = Promise.resolve();
    const enqueueOperation = async (operation) => {
        operationChain = operationChain.then(operation, operation);
        await operationChain;
    };
    const loadDecodedImage = async (fileHandle, tiffBuffer) => {
        if (tiffBuffer && isTiffConstructor(input.tiffRef)) {
            const decoded = new input.tiffRef({ buffer: tiffBuffer }).toCanvas();
            return loadImageElementFromUrl(decoded.toDataURL("image/png"));
        }
        const file = await fileHandle.getFile();
        const objectUrl = input.windowRef.URL.createObjectURL(file);
        try {
            return await loadImageElementFromUrl(objectUrl);
        }
        finally {
            input.windowRef.URL.revokeObjectURL(objectUrl);
        }
    };
    const applyCurrentImageToCanvas = () => {
        if (!connectedDeps) {
            return;
        }
        const canvasController = connectedDeps.canvasController;
        const uiManager = connectedDeps.uiManager;
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
        pendingLoadedYolo = null;
        canvasController.raw.resetZoom();
        uiManager.updateCurrentImageName();
        uiManager.updateZoomDisplay(canvasController.raw.canvas.getZoom());
        uiManager.renderImageList();
        uiManager.renderPreviewList();
        uiManager.updateLabelList();
        input.windowRef.dispatchEvent?.(new CustomEvent("easy-labeling:history-reset"));
    };
    const syncAfterImageLoad = async (fileHandle) => {
        if (!connectedDeps) {
            return;
        }
        pendingLoadedYolo = null;
        await imageSessionService.loadImageAndLabels(fileHandle);
        applyCurrentImageToCanvas();
    };
    const imageSessionService = createImageSessionService(new LiveImageSessionState(input.state), {
        decodeImage: async ({ fileHandle, tiffBuffer }) => loadDecodedImage(fileHandle, tiffBuffer),
        readCurrentLabelsAsYolo: () => {
            if (!connectedDeps) {
                return "";
            }
            return connectedDeps.canvasController.raw.getLabelsAsYolo();
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
    const fileSystem = {
        imageSessionService,
        connect(deps) {
            connectedDeps = deps;
        },
        async selectImageFolder() {
            await enqueueOperation(async () => {
                const uiManager = connectedDeps ? connectedDeps.uiManager : null;
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
                    await imageSessionService.selectImageFolder(imageFolderHandle);
                    input.state.view.hiddenLabelClasses = deriveHiddenLabelClassesForResetScope({
                        scope: "session-replacement",
                        hiddenLabelClasses: input.state.view.hiddenLabelClasses,
                        persistFilterStateAcrossImageNavigation: input.state.view.persistFilterStateAcrossImageNavigation,
                        resetFilterStateOnSessionReplacement: input.state.view.resetFilterStateOnSessionReplacement
                    });
                    if (input.state.session.currentImageFile) {
                        if (input.state.session.labelFolderHandle) {
                            try {
                                pendingLoadedYolo = await readTextFileByName(input.state.session.labelFolderHandle, imageFileNameToLabelFileName(input.state.session.currentImageFile.name));
                            }
                            catch (error) {
                                if (!isNotFoundError(error)) {
                                    throw error;
                                }
                                pendingLoadedYolo = null;
                            }
                        }
                        applyCurrentImageToCanvas();
                    }
                    else {
                        applyCurrentImageToCanvas();
                    }
                    if (!uiManager) {
                        return;
                    }
                    uiManager.elements.selectLabelFolderBtn.removeAttribute("disabled");
                    uiManager.updateLabelFolderButton(Boolean(input.state.session.labelFolderHandle));
                    uiManager.renderImageList();
                    uiManager.renderPreviewList();
                }
                finally {
                    uiManager?.hideLoading();
                }
            });
        },
        async selectLabelFolder() {
            await enqueueOperation(async () => {
                const picker = input.windowRef.showDirectoryPicker;
                if (typeof picker !== "function") {
                    return;
                }
                input.state.session.labelFolderHandle = await picker();
                if (connectedDeps) {
                    const uiManager = connectedDeps.uiManager;
                    uiManager.updateLabelFolderButton(Boolean(input.state.session.labelFolderHandle));
                }
            });
        },
        async selectClassInfoFolder() {
            await enqueueOperation(async () => {
                const picker = input.windowRef.showDirectoryPicker;
                if (typeof picker !== "function") {
                    return;
                }
                const folderHandle = await picker();
                input.state.session.classInfoFolderHandle = folderHandle;
                const files = await listFileHandles(folderHandle);
                input.state.session.classFiles = files.filter((file) => /\.(yaml|yml)$/i.test(file.name));
                if (connectedDeps) {
                    connectedDeps.uiManager.renderClassFileSelect();
                }
            });
        },
        async saveLabels(isAuto = false) {
            await enqueueOperation(async () => {
                await imageSessionService.saveLabels(isAuto);
                if (connectedDeps) {
                    const uiManager = connectedDeps.uiManager;
                    uiManager.renderImageList();
                    uiManager.renderPreviewList();
                }
            });
        },
        async navigateImage(direction) {
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
        async loadImage(fileHandle) {
            await enqueueOperation(async () => {
                const uiManager = connectedDeps ? connectedDeps.uiManager : null;
                uiManager?.showLoading();
                try {
                    await syncAfterImageLoad(fileHandle);
                }
                finally {
                    uiManager?.hideLoading();
                }
            });
        },
        async loadClassNamesFromFile(fileHandle) {
            await loadClassNamesIntoState(fileHandle, input.state);
            if (connectedDeps) {
                const uiManager = connectedDeps.uiManager;
                uiManager.renderClassFileSelect();
                uiManager.updateLabelList();
            }
        },
        async showClassFileContent() {
            if (!input.state.session.selectedClassFile || !connectedDeps) {
                return;
            }
            const rows = await readClassFileRowsForEditor(input.state.session.selectedClassFile);
            const uiManager = connectedDeps.uiManager;
            uiManager.elements.classFileEditorBody.innerHTML = "";
            rows.forEach((row) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `<td><input class="form-control class-id-input" value="${row.id}"></td><td><input class="form-control class-name-input" value="${row.name}"></td><td><button type="button" class="btn btn-sm btn-danger delete-class-row-btn">Delete</button></td>`;
                uiManager.elements.classFileEditorBody.appendChild(tr);
            });
            uiManager.showClassFileContentModal();
        },
        async saveClassFileContent() {
            if (!input.state.session.selectedClassFile || !connectedDeps) {
                return;
            }
            const uiManager = connectedDeps.uiManager;
            const rows = Array.from(uiManager.elements.classFileEditorBody.querySelectorAll("tr")).map((row) => {
                const idInput = row.querySelector(".class-id-input");
                const nameInput = row.querySelector(".class-name-input");
                return {
                    id: idInput?.value ?? "",
                    name: nameInput?.value ?? ""
                };
            });
            const result = await validateAndSaveClassRowsToFileHandle(input.state.session.selectedClassFile, rows);
            if (!result.saved) {
                uiManager.notify("Unable to save class file. Please fix highlighted rows.");
                return;
            }
            await this.loadClassNamesFromFile(input.state.session.selectedClassFile);
            uiManager.notify("Class file saved.");
        },
        addNewClassRow() {
            if (!connectedDeps) {
                return;
            }
            const tbody = connectedDeps.uiManager.elements.classFileEditorBody;
            const tr = document.createElement("tr");
            tr.innerHTML = '<td><input class="form-control class-id-input" value=""></td><td><input class="form-control class-name-input" value=""></td><td><button type="button" class="btn btn-sm btn-danger delete-class-row-btn">Delete</button></td>';
            tbody.appendChild(tr);
        },
        async createNewClassFile() {
            const folderHandle = (input.state.session.classInfoFolderHandle ?? input.state.session.labelFolderHandle);
            if (!folderHandle || !connectedDeps) {
                return;
            }
            const fileName = window.prompt("Enter new class file name:", "classes.yaml");
            if (!fileName) {
                return;
            }
            const result = await createNewClassFile(folderHandle, fileName);
            if (!result.created || !result.fileHandle) {
                connectedDeps.uiManager.notify(`A file named ${result.fileName} already exists.`);
                return;
            }
            input.state.session.classFiles = [...input.state.session.classFiles, result.fileHandle];
            connectedDeps.uiManager.renderClassFileSelect();
            await this.loadClassNamesFromFile(result.fileHandle);
        },
        async downloadClassTemplate() {
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
export async function loadClassNamesIntoState(fileHandle, state) {
    const result = await readClassNamesFromFileHandle(fileHandle);
    state.session.classNames = result.classNames;
    state.session.selectedClassFile = fileHandle;
    return result;
}
export async function createClassFileInFolder(folderHandle, inputName) {
    await createNewClassFile(folderHandle, inputName);
}
