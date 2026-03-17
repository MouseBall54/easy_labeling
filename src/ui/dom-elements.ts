export interface BootstrapModalLike {
  show(): void;
  hide(): void;
  _element?: HTMLElement;
  _isShown?: boolean;
}

export interface BootstrapLike {
  Modal: new (element: HTMLElement, options?: Record<string, unknown>) => BootstrapModalLike;
}

export interface UiDomElements {
  selectImageFolderBtn: HTMLElement;
  selectLabelFolderBtn: HTMLElement;
  loadClassInfoFolderBtn: HTMLElement;
  classFileSelect: HTMLSelectElement;
  imageList: HTMLElement;
  imageSearchInput: HTMLInputElement;
  showLabeledCheckbox: HTMLInputElement;
  showUnlabeledCheckbox: HTMLInputElement;
  saveLabelsBtn: HTMLElement;
  autoSaveToggle: HTMLInputElement;
  showLabelsOnCanvasToggle: HTMLInputElement;
  labelFontSizeSlider: HTMLInputElement;
  labelFontSizeValue: HTMLElement;
  drawModeBtn: HTMLInputElement;
  editModeBtn: HTMLInputElement;
  labelList: HTMLElement;
  labelFilters: HTMLElement;
  selectByClassDropdown: HTMLSelectElement;
  selectByClassBtn: HTMLElement;
  zoomInBtn: HTMLElement;
  zoomOutBtn: HTMLElement;
  resetZoomBtn: HTMLElement;
  canvasContainer: HTMLElement;
  zoomInput: HTMLInputElement;
  mouseCoordsDisplay: HTMLElement;
  coordXInput: HTMLInputElement;
  coordYInput: HTMLInputElement;
  goToCoordsBtn: HTMLElement;
  currentImageNameSpan: HTMLElement;
  prevImageBtn: HTMLElement;
  nextImageBtn: HTMLElement;
  leftPanel: HTMLElement;
  rightPanel: HTMLElement;
  leftSplitter: HTMLElement;
  rightSplitter: HTMLElement;
  darkModeToggle: HTMLInputElement;
  downloadClassesBtn: HTMLElement;
  sortLabelsAscBtn: HTMLElement;
  sortLabelsDescBtn: HTMLElement;
  viewClassFileBtn: HTMLElement;
  classFileViewerModal: BootstrapModalLike;
  classFileEditorBody: HTMLElement;
  addClassRowBtn: HTMLElement;
  saveClassFileBtn: HTMLElement;
  previewBar: HTMLElement;
  previewPrevBtn: HTMLElement;
  previewNextBtn: HTMLElement;
  previewListWrapper: HTMLElement;
  previewList: HTMLElement;
  bottomPanel: HTMLElement;
  bottomSplitter: HTMLElement;
  previewBarHeader: HTMLElement;
  togglePreviewBtn: HTMLElement;
  collapseLeftPanelBtn: HTMLElement;
  expandLeftPanelBtn: HTMLElement;
  collapseRightPanelBtn: HTMLElement;
  expandRightPanelBtn: HTMLElement;
  labelClassModal: BootstrapModalLike;
  labelClassInput: HTMLInputElement;
  classSelectionContainer: HTMLElement;
  saveLabelClassBtn: HTMLElement;
  crosshairToggle: HTMLInputElement;
  contextMenu: HTMLElement;
  ctxEditLabel: HTMLElement;
  ctxDeleteLabel: HTMLElement;
  loadingOverlay: HTMLElement;
}

export interface UnsupportedEnvironmentDomElements {
  unsupportedDeviceModalElement: HTMLElement;
  unsupportedDeviceModal: BootstrapModalLike;
}

function requireById<T extends HTMLElement>(documentRef: Document, id: string): T {
  const element = documentRef.getElementById(id);
  if (!element) {
    throw new Error(`Missing required DOM element: #${id}`);
  }

  return element as T;
}

function requireBySelector<T extends HTMLElement>(documentRef: Document, selector: string): T {
  const element = documentRef.querySelector(selector);
  if (!element) {
    throw new Error(`Missing required DOM element: ${selector}`);
  }

  return element as T;
}

export function getDOMElements(documentRef: Document, bootstrapRef: BootstrapLike): UiDomElements {
  const classFileViewerModalElement = requireById<HTMLElement>(documentRef, "classFileViewerModal");
  const labelClassModalElement = requireById<HTMLElement>(documentRef, "labelClassModal");

  return {
    selectImageFolderBtn: requireById<HTMLElement>(documentRef, "selectImageFolderBtn"),
    selectLabelFolderBtn: requireById<HTMLElement>(documentRef, "selectLabelFolderBtn"),
    loadClassInfoFolderBtn: requireById<HTMLElement>(documentRef, "loadClassInfoFolderBtn"),
    classFileSelect: requireById<HTMLSelectElement>(documentRef, "class-file-select"),
    imageList: requireById<HTMLElement>(documentRef, "image-list"),
    imageSearchInput: requireById<HTMLInputElement>(documentRef, "imageSearchInput"),
    showLabeledCheckbox: requireById<HTMLInputElement>(documentRef, "showLabeled"),
    showUnlabeledCheckbox: requireById<HTMLInputElement>(documentRef, "showUnlabeled"),
    saveLabelsBtn: requireById<HTMLElement>(documentRef, "saveLabelsBtn"),
    autoSaveToggle: requireById<HTMLInputElement>(documentRef, "autoSaveToggle"),
    showLabelsOnCanvasToggle: requireById<HTMLInputElement>(documentRef, "showLabelsOnCanvasToggle"),
    labelFontSizeSlider: requireById<HTMLInputElement>(documentRef, "label-font-size"),
    labelFontSizeValue: requireById<HTMLElement>(documentRef, "label-font-size-value"),
    drawModeBtn: requireById<HTMLInputElement>(documentRef, "drawMode"),
    editModeBtn: requireById<HTMLInputElement>(documentRef, "editMode"),
    labelList: requireById<HTMLElement>(documentRef, "label-list"),
    labelFilters: requireById<HTMLElement>(documentRef, "label-filters"),
    selectByClassDropdown: requireById<HTMLSelectElement>(documentRef, "select-by-class-dropdown"),
    selectByClassBtn: requireById<HTMLElement>(documentRef, "select-by-class-btn"),
    zoomInBtn: requireById<HTMLElement>(documentRef, "zoomInBtn"),
    zoomOutBtn: requireById<HTMLElement>(documentRef, "zoomOutBtn"),
    resetZoomBtn: requireById<HTMLElement>(documentRef, "resetZoomBtn"),
    canvasContainer: requireBySelector<HTMLElement>(documentRef, ".canvas-container"),
    zoomInput: requireById<HTMLInputElement>(documentRef, "zoom-input"),
    mouseCoordsDisplay: requireById<HTMLElement>(documentRef, "mouse-coords"),
    coordXInput: requireById<HTMLInputElement>(documentRef, "coordX"),
    coordYInput: requireById<HTMLInputElement>(documentRef, "coordY"),
    goToCoordsBtn: requireById<HTMLElement>(documentRef, "goToCoordsBtn"),
    currentImageNameSpan: requireById<HTMLElement>(documentRef, "current-image-name"),
    prevImageBtn: requireById<HTMLElement>(documentRef, "prevImageBtn"),
    nextImageBtn: requireById<HTMLElement>(documentRef, "nextImageBtn"),
    leftPanel: requireById<HTMLElement>(documentRef, "left-panel"),
    rightPanel: requireById<HTMLElement>(documentRef, "right-panel"),
    leftSplitter: requireById<HTMLElement>(documentRef, "left-splitter"),
    rightSplitter: requireById<HTMLElement>(documentRef, "right-splitter"),
    darkModeToggle: requireById<HTMLInputElement>(documentRef, "darkModeToggle"),
    downloadClassesBtn: requireById<HTMLElement>(documentRef, "downloadClassesBtn"),
    sortLabelsAscBtn: requireById<HTMLElement>(documentRef, "sortLabelsAscBtn"),
    sortLabelsDescBtn: requireById<HTMLElement>(documentRef, "sortLabelsDescBtn"),
    viewClassFileBtn: requireById<HTMLElement>(documentRef, "viewClassFileBtn"),
    classFileViewerModal: new bootstrapRef.Modal(classFileViewerModalElement),
    classFileEditorBody: requireById<HTMLElement>(documentRef, "classFileEditorBody"),
    addClassRowBtn: requireById<HTMLElement>(documentRef, "addClassRowBtn"),
    saveClassFileBtn: requireById<HTMLElement>(documentRef, "saveClassFileBtn"),
    previewBar: requireById<HTMLElement>(documentRef, "preview-bar"),
    previewPrevBtn: requireById<HTMLElement>(documentRef, "preview-prev-btn"),
    previewNextBtn: requireById<HTMLElement>(documentRef, "preview-next-btn"),
    previewListWrapper: requireById<HTMLElement>(documentRef, "preview-list-wrapper"),
    previewList: requireById<HTMLElement>(documentRef, "preview-list"),
    bottomPanel: requireById<HTMLElement>(documentRef, "bottom-panel"),
    bottomSplitter: requireById<HTMLElement>(documentRef, "bottom-splitter"),
    previewBarHeader: requireById<HTMLElement>(documentRef, "preview-bar-header"),
    togglePreviewBtn: requireById<HTMLElement>(documentRef, "toggle-preview-btn"),
    collapseLeftPanelBtn: requireById<HTMLElement>(documentRef, "collapse-left-panel-btn"),
    expandLeftPanelBtn: requireById<HTMLElement>(documentRef, "expand-left-panel-btn"),
    collapseRightPanelBtn: requireById<HTMLElement>(documentRef, "collapse-right-panel-btn"),
    expandRightPanelBtn: requireById<HTMLElement>(documentRef, "expand-right-panel-btn"),
    labelClassModal: new bootstrapRef.Modal(labelClassModalElement),
    labelClassInput: requireById<HTMLInputElement>(documentRef, "labelClassInput"),
    classSelectionContainer: requireById<HTMLElement>(documentRef, "class-selection-container"),
    saveLabelClassBtn: requireById<HTMLElement>(documentRef, "saveLabelClassBtn"),
    crosshairToggle: requireById<HTMLInputElement>(documentRef, "crosshairToggle"),
    contextMenu: requireById<HTMLElement>(documentRef, "context-menu"),
    ctxEditLabel: requireById<HTMLElement>(documentRef, "ctx-edit-label"),
    ctxDeleteLabel: requireById<HTMLElement>(documentRef, "ctx-delete-label"),
    loadingOverlay: requireById<HTMLElement>(documentRef, "loading-overlay")
  };
}

export function getUnsupportedEnvironmentElements(
  documentRef: Document,
  bootstrapRef: BootstrapLike
): UnsupportedEnvironmentDomElements {
  const modalElement = requireById<HTMLElement>(documentRef, "unsupportedDeviceModal");
  return {
    unsupportedDeviceModalElement: modalElement,
    unsupportedDeviceModal: new bootstrapRef.Modal(modalElement, {
      backdrop: "static",
      keyboard: false
    })
  };
}
