export function createInitialAppState() {
    return {
        session: {
            imageFolderHandle: null,
            labelFolderHandle: null,
            classInfoFolderHandle: null,
            imageFiles: [],
            classFiles: [],
            selectedClassFile: null,
            imageLabelStatus: new Map(),
            currentImageFile: null,
            currentImage: null,
            classNames: new Map()
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
            collapsedLabelGroups: new Set()
        },
        runtime: {
            saveTimeout: null,
            currentLoadToken: 0,
            clipboard: null,
            previewImageCache: new Map()
        }
    };
}
