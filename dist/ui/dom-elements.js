function requireById(documentRef, id) {
    const element = documentRef.getElementById(id);
    if (!element) {
        throw new Error(`Missing required DOM element: #${id}`);
    }
    return element;
}
function requireBySelector(documentRef, selector) {
    const element = documentRef.querySelector(selector);
    if (!element) {
        throw new Error(`Missing required DOM element: ${selector}`);
    }
    return element;
}
export function getDOMElements(documentRef, bootstrapRef) {
    const classFileViewerModalElement = requireById(documentRef, "classFileViewerModal");
    const labelClassModalElement = requireById(documentRef, "labelClassModal");
    return {
        selectImageFolderBtn: requireById(documentRef, "selectImageFolderBtn"),
        selectLabelFolderBtn: requireById(documentRef, "selectLabelFolderBtn"),
        loadClassInfoFolderBtn: requireById(documentRef, "loadClassInfoFolderBtn"),
        classFileSelect: requireById(documentRef, "class-file-select"),
        imageList: requireById(documentRef, "image-list"),
        imageSearchInput: requireById(documentRef, "imageSearchInput"),
        showLabeledCheckbox: requireById(documentRef, "showLabeled"),
        showUnlabeledCheckbox: requireById(documentRef, "showUnlabeled"),
        saveLabelsBtn: requireById(documentRef, "saveLabelsBtn"),
        autoSaveToggle: requireById(documentRef, "autoSaveToggle"),
        showLabelsOnCanvasToggle: requireById(documentRef, "showLabelsOnCanvasToggle"),
        labelFontSizeSlider: requireById(documentRef, "label-font-size"),
        labelFontSizeValue: requireById(documentRef, "label-font-size-value"),
        drawModeBtn: requireById(documentRef, "drawMode"),
        editModeBtn: requireById(documentRef, "editMode"),
        labelList: requireById(documentRef, "label-list"),
        labelFilters: requireById(documentRef, "label-filters"),
        selectByClassDropdown: requireById(documentRef, "select-by-class-dropdown"),
        selectByClassBtn: requireById(documentRef, "select-by-class-btn"),
        zoomInBtn: requireById(documentRef, "zoomInBtn"),
        zoomOutBtn: requireById(documentRef, "zoomOutBtn"),
        resetZoomBtn: requireById(documentRef, "resetZoomBtn"),
        canvasContainer: requireBySelector(documentRef, ".canvas-container"),
        zoomInput: requireById(documentRef, "zoom-input"),
        mouseCoordsDisplay: requireById(documentRef, "mouse-coords"),
        coordXInput: requireById(documentRef, "coordX"),
        coordYInput: requireById(documentRef, "coordY"),
        goToCoordsBtn: requireById(documentRef, "goToCoordsBtn"),
        currentImageNameSpan: requireById(documentRef, "current-image-name"),
        prevImageBtn: requireById(documentRef, "prevImageBtn"),
        nextImageBtn: requireById(documentRef, "nextImageBtn"),
        leftPanel: requireById(documentRef, "left-panel"),
        rightPanel: requireById(documentRef, "right-panel"),
        leftSplitter: requireById(documentRef, "left-splitter"),
        rightSplitter: requireById(documentRef, "right-splitter"),
        darkModeToggle: requireById(documentRef, "darkModeToggle"),
        downloadClassesBtn: requireById(documentRef, "downloadClassesBtn"),
        sortLabelsAscBtn: requireById(documentRef, "sortLabelsAscBtn"),
        sortLabelsDescBtn: requireById(documentRef, "sortLabelsDescBtn"),
        viewClassFileBtn: requireById(documentRef, "viewClassFileBtn"),
        classFileViewerModal: new bootstrapRef.Modal(classFileViewerModalElement),
        classFileEditorBody: requireById(documentRef, "classFileEditorBody"),
        addClassRowBtn: requireById(documentRef, "addClassRowBtn"),
        saveClassFileBtn: requireById(documentRef, "saveClassFileBtn"),
        previewBar: requireById(documentRef, "preview-bar"),
        previewPrevBtn: requireById(documentRef, "preview-prev-btn"),
        previewNextBtn: requireById(documentRef, "preview-next-btn"),
        previewListWrapper: requireById(documentRef, "preview-list-wrapper"),
        previewList: requireById(documentRef, "preview-list"),
        bottomPanel: requireById(documentRef, "bottom-panel"),
        bottomSplitter: requireById(documentRef, "bottom-splitter"),
        previewBarHeader: requireById(documentRef, "preview-bar-header"),
        togglePreviewBtn: requireById(documentRef, "toggle-preview-btn"),
        collapseLeftPanelBtn: requireById(documentRef, "collapse-left-panel-btn"),
        expandLeftPanelBtn: requireById(documentRef, "expand-left-panel-btn"),
        collapseRightPanelBtn: requireById(documentRef, "collapse-right-panel-btn"),
        expandRightPanelBtn: requireById(documentRef, "expand-right-panel-btn"),
        labelClassModal: new bootstrapRef.Modal(labelClassModalElement),
        labelClassInput: requireById(documentRef, "labelClassInput"),
        classSelectionContainer: requireById(documentRef, "class-selection-container"),
        saveLabelClassBtn: requireById(documentRef, "saveLabelClassBtn"),
        crosshairToggle: requireById(documentRef, "crosshairToggle"),
        contextMenu: requireById(documentRef, "context-menu"),
        ctxEditLabel: requireById(documentRef, "ctx-edit-label"),
        ctxDeleteLabel: requireById(documentRef, "ctx-delete-label"),
        loadingOverlay: requireById(documentRef, "loading-overlay")
    };
}
export function getUnsupportedEnvironmentElements(documentRef, bootstrapRef) {
    const modalElement = requireById(documentRef, "unsupportedDeviceModal");
    return {
        unsupportedDeviceModalElement: modalElement,
        unsupportedDeviceModal: new bootstrapRef.Modal(modalElement, {
            backdrop: "static",
            keyboard: false
        })
    };
}
