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
  appBrand: HTMLAnchorElement;
  selectImageFolderBtn: HTMLElement;
  selectLabelFolderBtn: HTMLElement;
  loadClassInfoFolderBtn: HTMLElement;
  classFileSelect: HTMLSelectElement;
  imageList: HTMLElement;
  imageSearchInput: HTMLInputElement;
  showLabeledCheckbox: HTMLInputElement;
  showUnlabeledCheckbox: HTMLInputElement;
  saveLabelsBtn: HTMLElement;
  detectionWorkflowTab: HTMLInputElement;
  segmentationWorkflowTab: HTMLInputElement;
  detectionWorkflowPanel: HTMLElement;
  segmentationWorkflowPanel: HTMLElement;
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
  undoBtn: HTMLElement;
  redoBtn: HTMLElement;
  alignLeftBtn: HTMLElement;
  alignRightBtn: HTMLElement;
  alignTopBtn: HTMLElement;
  alignBottomBtn: HTMLElement;
  distributeHorizontalBtn: HTMLElement;
  distributeVerticalBtn: HTMLElement;
  selectionMoveXInput: HTMLInputElement;
  selectionMoveYInput: HTMLInputElement;
  moveSelectedBoxesBtn: HTMLButtonElement;
  openLayoutSetupBtn: HTMLButtonElement;
  newBoxLayoutBtn: HTMLButtonElement;
  layoutEditorTitle: HTMLElement;
  layoutEditorModeBadge: HTMLElement;
  layoutNameInput: HTMLInputElement;
  layoutCaptureScopeSelect: HTMLSelectElement;
  layoutCaptureSummary: HTMLElement;
  saveBoxLayoutBtn: HTMLButtonElement;
  updateBoxLayoutBtn: HTMLButtonElement;
  boxLayoutSelect: HTMLSelectElement;
  layoutSetupModal: BootstrapModalLike;
  layoutSetupSourceName: HTMLElement;
  layoutSetupSelect: HTMLSelectElement;
  layoutDetails: HTMLElement;
  layoutPreviewCanvas: HTMLCanvasElement;
  layoutPreviewZoomInput: HTMLInputElement;
  layoutPreviewZoomValue: HTMLElement;
  previewBoxLayoutBtn: HTMLButtonElement;
  duplicateBoxLayoutBtn: HTMLButtonElement;
  renameBoxLayoutBtn: HTMLButtonElement;
  deleteBoxLayoutBtn: HTMLButtonElement;
  applyBoxLayoutBtn: HTMLButtonElement;
  applyBoxLayoutFromSetupBtn: HTMLButtonElement;
  layoutOperationStatus: HTMLElement;
  layoutSetupError: HTMLElement;
  openTemplateMatchingBtn: HTMLButtonElement;
  exportAutomationLibraryBtn: HTMLButtonElement;
  importAutomationLibraryBtn: HTMLButtonElement;
  importAutomationLibraryInput: HTMLInputElement;
  automationPresetSelect: HTMLSelectElement;
  runAutomationCurrentBtn: HTMLButtonElement;
  runAutomationBatchBtn: HTMLButtonElement;
  cancelAutomationBatchBtn: HTMLButtonElement;
  automationBatchProgressGroup: HTMLElement;
  automationBatchPreflight: HTMLElement;
  batchPreflightTargets: HTMLElement;
  batchPreflightPolicy: HTMLElement;
  batchDryRunToggle: HTMLInputElement;
  confirmAutomationBatchBtn: HTMLButtonElement;
  closeAutomationPreflightBtn: HTMLButtonElement;
  automationBatchCurrentFile: HTMLElement;
  automationBatchStage: HTMLElement;
  automationBatchCounts: HTMLElement;
  automationBatchProgressBar: HTMLElement;
  automationBatchResultSummary: HTMLElement;
  automationBatchResultList: HTMLElement;
  retryFailedBatchBtn: HTMLButtonElement;
  templateMatchingModal: BootstrapModalLike;
  templateMatchingSourceName: HTMLElement;
  templateSourceImageSelect: HTMLSelectElement;
  templatePointerRoiRadio: HTMLInputElement;
  templatePointerSelectRadio: HTMLInputElement;
  templateWorkspaceZoomInput: HTMLInputElement;
  templateWorkspaceZoomValue: HTMLElement;
  templateWorkspaceFitBtn: HTMLButtonElement;
  templateWorkspaceScroller: HTMLElement;
  templateWorkspaceStage: HTMLElement;
  templatePresetSelect: HTMLSelectElement;
  templateMatchingCanvas: HTMLCanvasElement;
  templateOriginalPreviewCanvas: HTMLCanvasElement;
  templateProcessedPreviewCanvas: HTMLCanvasElement;
  templateMatchScore: HTMLElement;
  templateMatchCoordinates: HTMLElement;
  templateMatchTimings: HTMLElement;
  templateMatchCandidates: HTMLElement;
  templateMatchContextMenu: HTMLElement;
  templateMatchContextSummary: HTMLElement;
  templateMatchContextClassInput: HTMLInputElement;
  templateMatchContextClassError: HTMLElement;
  templateMatchContextAssignBtn: HTMLButtonElement;
  templateMatchContextDeleteBtn: HTMLButtonElement;
  newAutomationPresetBtn: HTMLButtonElement;
  deleteAutomationPresetBtn: HTMLButtonElement;
  exportAutomationPresetBtn: HTMLButtonElement;
  importAutomationPresetBtn: HTMLButtonElement;
  importAutomationPresetInput: HTMLInputElement;
  templateNameInput: HTMLInputElement;
  templateOutputLayoutRadio: HTMLInputElement;
  templateOutputMultipleRadio: HTMLInputElement;
  templateLayoutOutputSettings: HTMLElement;
  templateMultipleOutputSettings: HTMLElement;
  templateLayoutSelect: HTMLSelectElement;
  templateLayoutOpacityInput: HTMLInputElement;
  templateLayoutOpacityValue: HTMLElement;
  templateApplyAllMatchesRadio: HTMLInputElement;
  templateApplySelectedMatchesRadio: HTMLInputElement;
  templateMultipleClassIdInput: HTMLInputElement;
  templateMaximumDetectionsInput: HTMLInputElement;
  templateMatchSelectionControls: HTMLElement;
  templateMatchSelectionSummary: HTMLElement;
  selectAllTemplateMatchesBtn: HTMLButtonElement;
  clearTemplateMatchSelectionBtn: HTMLButtonElement;
  assignTemplateMatchClassBtn: HTMLButtonElement;
  templateStrictNonOverlapToggle: HTMLInputElement;
  templateNmsIouInput: HTMLInputElement;
  templatePaddingXInput: HTMLInputElement;
  templatePaddingYInput: HTMLInputElement;
  templateGrayscaleToggle: HTMLInputElement;
  templateBlurToggle: HTMLInputElement;
  templateBlurKernelInput: HTMLInputElement;
  templateBlurSigmaInput: HTMLInputElement;
  templateNoiseToggle: HTMLInputElement;
  templateNoiseSigmaInput: HTMLInputElement;
  templateNoiseSeedInput: HTMLInputElement;
  templateMatchingAccurateRadio: HTMLInputElement;
  templateMatchingFastRadio: HTMLInputElement;
  templateMinimumScoreInput: HTMLInputElement;
  templateSearchRoiToggle: HTMLInputElement;
  templateSearchRoiInputs: HTMLElement;
  templateSearchXInput: HTMLInputElement;
  templateSearchYInput: HTMLInputElement;
  templateSearchWidthInput: HTMLInputElement;
  templateSearchHeightInput: HTMLInputElement;
  templateRelationXInput: HTMLInputElement;
  templateRelationYInput: HTMLInputElement;
  templateManualXInput: HTMLInputElement;
  templateManualYInput: HTMLInputElement;
  templateExistingPolicySelect: HTMLSelectElement;
  templateSettingsError: HTMLElement;
  testTemplateMatchBtn: HTMLButtonElement;
  applyTemplateMatchBtn: HTMLButtonElement;
  saveAutomationPresetBtn: HTMLButtonElement;
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
  sortLabelsAscBtn: HTMLElement;
  sortLabelsDescBtn: HTMLElement;
  viewClassFileBtn: HTMLElement;
  classFileViewerModal: BootstrapModalLike;
  classFileEditorBody: HTMLElement;
  addClassRowBtn: HTMLElement;
  saveClassFileBtn: HTMLElement;
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
  labelClassError: HTMLElement;
  classSelectionContainer: HTMLElement;
  segmentationBrushModeBtn: HTMLElement;
  segmentationEraseModeBtn: HTMLElement;
  segmentationToolSizeLabel: HTMLElement;
  segmentationToolSizeSlider: HTMLInputElement;
  segmentationToolSizeValue: HTMLElement;
  segmentationToolSizePresets: HTMLElement;
  segmentationActiveClassSummary: HTMLElement;
  segmentationRelabelRegionBtn: HTMLElement;
  segmentationAutoFillClosedRegionGroup: HTMLElement;
  segmentationAutoFillClosedRegionToggle: HTMLInputElement;
  segmentationMaskVisibilityToggle: HTMLInputElement;
  segmentationMaskOpacitySlider: HTMLInputElement;
  segmentationMaskOpacityValue: HTMLElement;
  segmentationEdgeHighlightToggle: HTMLInputElement;
  segmentationEdgeGlowSlider: HTMLInputElement;
  segmentationEdgeGlowValue: HTMLElement;
  segmentationClassSummary: HTMLElement;
  saveLabelClassBtn: HTMLElement;
  crosshairToggle: HTMLInputElement;
  contextMenu: HTMLElement;
  ctxEditLabel: HTMLElement;
  ctxDeleteLabel: HTMLElement;
  loadingOverlay: HTMLElement;
  loadingStatusText: HTMLElement;
  activeOperationPanel: HTMLElement;
  activeOperationTitle: HTMLElement;
  activeOperationDetail: HTMLElement;
  activeOperationElapsed: HTMLElement;
  activeOperationProgressText: HTMLElement;
  activeOperationProgress: HTMLElement;
  activeOperationProgressBar: HTMLElement;
  cancelActiveOperationBtn: HTMLButtonElement;
  taskFilesBtn: HTMLButtonElement;
  taskAnnotateBtn: HTMLButtonElement;
  taskAutomateBtn: HTMLButtonElement;
  refreshDatasetBtn: HTMLButtonElement;
  datasetConnectionStatus: HTMLElement;
  fileSystemCompatibilityNotice: HTMLElement;
  imageCountBadge: HTMLElement;
  classSearchInput: HTMLInputElement;
  addClassShortcutBtn: HTMLButtonElement;
  canvasEmptyState: HTMLElement;
  layoutGhostCanvas: HTMLCanvasElement;
  emptyOpenDatasetBtn: HTMLButtonElement;
  emptyLoadSampleBtn: HTMLButtonElement;
  emptyStateCompatibilityText: HTMLElement;
  inspectorTitle: HTMLElement;
  inspectorSubtitle: HTMLElement;
  inspectorAnnotationTabBtn: HTMLButtonElement;
  inspectorTransformTabBtn: HTMLButtonElement;
  inspectorAutomationTabBtn: HTMLButtonElement;
  inspectorAnnotationPane: HTMLElement;
  inspectorTransformPane: HTMLElement;
  inspectorAutomationPane: HTMLElement;
  activeToolSummary: HTMLElement;
  selectedAnnotationCount: HTMLElement;
  selectionEmptyState: HTMLElement;
  selectionDetails: HTMLElement;
  selectionClassSelect: HTMLSelectElement;
  selectionGeometryX: HTMLInputElement;
  selectionGeometryY: HTMLInputElement;
  selectionGeometryWidth: HTMLInputElement;
  selectionGeometryHeight: HTMLInputElement;
  duplicateSelectionBtn: HTMLButtonElement;
  hideSelectionBtn: HTMLButtonElement;
  deleteSelectionBtn: HTMLButtonElement;
  labelDisplayModeSelect: HTMLSelectElement;
  layoutPlacementNotice: HTMLElement;
  headerDocumentStatus: HTMLElement;
  statusImageInfo: HTMLElement;
  statusAnnotationInfo: HTMLElement;
  documentStatus: HTMLElement;
  statusMode: HTMLElement;
  matchingEngineStatus: HTMLElement;
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

export function getDOMElements(documentRef: Document, bootstrapRef: BootstrapLike): UiDomElements {
  const classFileViewerModalElement = requireById<HTMLElement>(documentRef, "classFileViewerModal");
  const labelClassModalElement = requireById<HTMLElement>(documentRef, "labelClassModal");
  const layoutSetupModalElement = requireById<HTMLElement>(documentRef, "layoutSetupModal");
  const templateMatchingModalElement = requireById<HTMLElement>(documentRef, "templateMatchingModal");

  return {
    appBrand: requireById<HTMLAnchorElement>(documentRef, "appBrand"),
    selectImageFolderBtn: requireById<HTMLElement>(documentRef, "selectImageFolderBtn"),
    selectLabelFolderBtn: requireById<HTMLElement>(documentRef, "selectLabelFolderBtn"),
    loadClassInfoFolderBtn: requireById<HTMLElement>(documentRef, "loadClassInfoFolderBtn"),
    classFileSelect: requireById<HTMLSelectElement>(documentRef, "class-file-select"),
    imageList: requireById<HTMLElement>(documentRef, "image-list"),
    imageSearchInput: requireById<HTMLInputElement>(documentRef, "imageSearchInput"),
    showLabeledCheckbox: requireById<HTMLInputElement>(documentRef, "showLabeled"),
    showUnlabeledCheckbox: requireById<HTMLInputElement>(documentRef, "showUnlabeled"),
    saveLabelsBtn: requireById<HTMLElement>(documentRef, "saveLabelsBtn"),
    detectionWorkflowTab: requireById<HTMLInputElement>(documentRef, "detectionWorkflowTab"),
    segmentationWorkflowTab: requireById<HTMLInputElement>(documentRef, "segmentationWorkflowTab"),
    detectionWorkflowPanel: requireById<HTMLElement>(documentRef, "detectionWorkflowPanel"),
    segmentationWorkflowPanel: requireById<HTMLElement>(documentRef, "segmentationWorkflowPanel"),
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
    undoBtn: requireById<HTMLElement>(documentRef, "undoBtn"),
    redoBtn: requireById<HTMLElement>(documentRef, "redoBtn"),
    alignLeftBtn: requireById<HTMLElement>(documentRef, "alignLeftBtn"),
    alignRightBtn: requireById<HTMLElement>(documentRef, "alignRightBtn"),
    alignTopBtn: requireById<HTMLElement>(documentRef, "alignTopBtn"),
    alignBottomBtn: requireById<HTMLElement>(documentRef, "alignBottomBtn"),
    distributeHorizontalBtn: requireById<HTMLElement>(documentRef, "distributeHorizontalBtn"),
    distributeVerticalBtn: requireById<HTMLElement>(documentRef, "distributeVerticalBtn"),
    selectionMoveXInput: requireById<HTMLInputElement>(documentRef, "selectionMoveXInput"),
    selectionMoveYInput: requireById<HTMLInputElement>(documentRef, "selectionMoveYInput"),
    moveSelectedBoxesBtn: requireById<HTMLButtonElement>(documentRef, "moveSelectedBoxesBtn"),
    openLayoutSetupBtn: requireById<HTMLButtonElement>(documentRef, "openLayoutSetupBtn"),
    newBoxLayoutBtn: requireById<HTMLButtonElement>(documentRef, "newBoxLayoutBtn"),
    layoutEditorTitle: requireById<HTMLElement>(documentRef, "layoutEditorTitle"),
    layoutEditorModeBadge: requireById<HTMLElement>(documentRef, "layoutEditorModeBadge"),
    layoutNameInput: requireById<HTMLInputElement>(documentRef, "layoutNameInput"),
    layoutCaptureScopeSelect: requireById<HTMLSelectElement>(documentRef, "layoutCaptureScopeSelect"),
    layoutCaptureSummary: requireById<HTMLElement>(documentRef, "layoutCaptureSummary"),
    saveBoxLayoutBtn: requireById<HTMLButtonElement>(documentRef, "saveBoxLayoutBtn"),
    updateBoxLayoutBtn: requireById<HTMLButtonElement>(documentRef, "updateBoxLayoutBtn"),
    boxLayoutSelect: requireById<HTMLSelectElement>(documentRef, "boxLayoutSelect"),
    layoutSetupModal: new bootstrapRef.Modal(layoutSetupModalElement),
    layoutSetupSourceName: requireById<HTMLElement>(documentRef, "layoutSetupSourceName"),
    layoutSetupSelect: requireById<HTMLSelectElement>(documentRef, "layoutSetupSelect"),
    layoutDetails: requireById<HTMLElement>(documentRef, "layoutDetails"),
    layoutPreviewCanvas: requireById<HTMLCanvasElement>(documentRef, "layoutPreviewCanvas"),
    layoutPreviewZoomInput: requireById<HTMLInputElement>(documentRef, "layoutPreviewZoomInput"),
    layoutPreviewZoomValue: requireById<HTMLElement>(documentRef, "layoutPreviewZoomValue"),
    previewBoxLayoutBtn: requireById<HTMLButtonElement>(documentRef, "previewBoxLayoutBtn"),
    duplicateBoxLayoutBtn: requireById<HTMLButtonElement>(documentRef, "duplicateBoxLayoutBtn"),
    renameBoxLayoutBtn: requireById<HTMLButtonElement>(documentRef, "renameBoxLayoutBtn"),
    deleteBoxLayoutBtn: requireById<HTMLButtonElement>(documentRef, "deleteBoxLayoutBtn"),
    applyBoxLayoutBtn: requireById<HTMLButtonElement>(documentRef, "applyBoxLayoutBtn"),
    applyBoxLayoutFromSetupBtn: requireById<HTMLButtonElement>(documentRef, "applyBoxLayoutFromSetupBtn"),
    layoutOperationStatus: requireById<HTMLElement>(documentRef, "layoutOperationStatus"),
    layoutSetupError: requireById<HTMLElement>(documentRef, "layoutSetupError"),
    openTemplateMatchingBtn: requireById<HTMLButtonElement>(documentRef, "openTemplateMatchingBtn"),
    exportAutomationLibraryBtn: requireById<HTMLButtonElement>(documentRef, "exportAutomationLibraryBtn"),
    importAutomationLibraryBtn: requireById<HTMLButtonElement>(documentRef, "importAutomationLibraryBtn"),
    importAutomationLibraryInput: requireById<HTMLInputElement>(documentRef, "importAutomationLibraryInput"),
    automationPresetSelect: requireById<HTMLSelectElement>(documentRef, "automationPresetSelect"),
    runAutomationCurrentBtn: requireById<HTMLButtonElement>(documentRef, "runAutomationCurrentBtn"),
    runAutomationBatchBtn: requireById<HTMLButtonElement>(documentRef, "runAutomationBatchBtn"),
    cancelAutomationBatchBtn: requireById<HTMLButtonElement>(documentRef, "cancelAutomationBatchBtn"),
    automationBatchProgressGroup: requireById<HTMLElement>(documentRef, "automationBatchProgressGroup"),
    automationBatchPreflight: requireById<HTMLElement>(documentRef, "automationBatchPreflight"),
    batchPreflightTargets: requireById<HTMLElement>(documentRef, "batchPreflightTargets"),
    batchPreflightPolicy: requireById<HTMLElement>(documentRef, "batchPreflightPolicy"),
    batchDryRunToggle: requireById<HTMLInputElement>(documentRef, "batchDryRunToggle"),
    confirmAutomationBatchBtn: requireById<HTMLButtonElement>(documentRef, "confirmAutomationBatchBtn"),
    closeAutomationPreflightBtn: requireById<HTMLButtonElement>(documentRef, "closeAutomationPreflightBtn"),
    automationBatchCurrentFile: requireById<HTMLElement>(documentRef, "automationBatchCurrentFile"),
    automationBatchStage: requireById<HTMLElement>(documentRef, "automationBatchStage"),
    automationBatchCounts: requireById<HTMLElement>(documentRef, "automationBatchCounts"),
    automationBatchProgressBar: requireById<HTMLElement>(documentRef, "automationBatchProgressBar"),
    automationBatchResultSummary: requireById<HTMLElement>(documentRef, "automationBatchResultSummary"),
    automationBatchResultList: requireById<HTMLElement>(documentRef, "automationBatchResultList"),
    retryFailedBatchBtn: requireById<HTMLButtonElement>(documentRef, "retryFailedBatchBtn"),
    templateMatchingModal: new bootstrapRef.Modal(templateMatchingModalElement),
    templateMatchingSourceName: requireById<HTMLElement>(documentRef, "templateMatchingSourceName"),
    templateSourceImageSelect: requireById<HTMLSelectElement>(documentRef, "templateSourceImageSelect"),
    templatePointerRoiRadio: requireById<HTMLInputElement>(documentRef, "templatePointerRoiRadio"),
    templatePointerSelectRadio: requireById<HTMLInputElement>(documentRef, "templatePointerSelectRadio"),
    templateWorkspaceZoomInput: requireById<HTMLInputElement>(documentRef, "templateWorkspaceZoomInput"),
    templateWorkspaceZoomValue: requireById<HTMLElement>(documentRef, "templateWorkspaceZoomValue"),
    templateWorkspaceFitBtn: requireById<HTMLButtonElement>(documentRef, "templateWorkspaceFitBtn"),
    templateWorkspaceScroller: requireById<HTMLElement>(documentRef, "templateWorkspaceScroller"),
    templateWorkspaceStage: requireById<HTMLElement>(documentRef, "templateWorkspaceStage"),
    templatePresetSelect: requireById<HTMLSelectElement>(documentRef, "templatePresetSelect"),
    templateMatchingCanvas: requireById<HTMLCanvasElement>(documentRef, "templateMatchingCanvas"),
    templateOriginalPreviewCanvas: requireById<HTMLCanvasElement>(documentRef, "templateOriginalPreviewCanvas"),
    templateProcessedPreviewCanvas: requireById<HTMLCanvasElement>(documentRef, "templateProcessedPreviewCanvas"),
    templateMatchScore: requireById<HTMLElement>(documentRef, "templateMatchScore"),
    templateMatchCoordinates: requireById<HTMLElement>(documentRef, "templateMatchCoordinates"),
    templateMatchTimings: requireById<HTMLElement>(documentRef, "templateMatchTimings"),
    templateMatchCandidates: requireById<HTMLElement>(documentRef, "templateMatchCandidates"),
    templateMatchContextMenu: requireById<HTMLElement>(documentRef, "templateMatchContextMenu"),
    templateMatchContextSummary: requireById<HTMLElement>(documentRef, "templateMatchContextSummary"),
    templateMatchContextClassInput: requireById<HTMLInputElement>(documentRef, "templateMatchContextClassInput"),
    templateMatchContextClassError: requireById<HTMLElement>(documentRef, "templateMatchContextClassError"),
    templateMatchContextAssignBtn: requireById<HTMLButtonElement>(documentRef, "templateMatchContextAssignBtn"),
    templateMatchContextDeleteBtn: requireById<HTMLButtonElement>(documentRef, "templateMatchContextDeleteBtn"),
    newAutomationPresetBtn: requireById<HTMLButtonElement>(documentRef, "newAutomationPresetBtn"),
    deleteAutomationPresetBtn: requireById<HTMLButtonElement>(documentRef, "deleteAutomationPresetBtn"),
    exportAutomationPresetBtn: requireById<HTMLButtonElement>(documentRef, "exportAutomationPresetBtn"),
    importAutomationPresetBtn: requireById<HTMLButtonElement>(documentRef, "importAutomationPresetBtn"),
    importAutomationPresetInput: requireById<HTMLInputElement>(documentRef, "importAutomationPresetInput"),
    templateNameInput: requireById<HTMLInputElement>(documentRef, "templateNameInput"),
    templateOutputLayoutRadio: requireById<HTMLInputElement>(documentRef, "templateOutputLayoutRadio"),
    templateOutputMultipleRadio: requireById<HTMLInputElement>(documentRef, "templateOutputMultipleRadio"),
    templateLayoutOutputSettings: requireById<HTMLElement>(documentRef, "templateLayoutOutputSettings"),
    templateMultipleOutputSettings: requireById<HTMLElement>(documentRef, "templateMultipleOutputSettings"),
    templateLayoutSelect: requireById<HTMLSelectElement>(documentRef, "templateLayoutSelect"),
    templateLayoutOpacityInput: requireById<HTMLInputElement>(documentRef, "templateLayoutOpacityInput"),
    templateLayoutOpacityValue: requireById<HTMLElement>(documentRef, "templateLayoutOpacityValue"),
    templateApplyAllMatchesRadio: requireById<HTMLInputElement>(documentRef, "templateApplyAllMatchesRadio"),
    templateApplySelectedMatchesRadio: requireById<HTMLInputElement>(documentRef, "templateApplySelectedMatchesRadio"),
    templateMultipleClassIdInput: requireById<HTMLInputElement>(documentRef, "templateMultipleClassIdInput"),
    templateMaximumDetectionsInput: requireById<HTMLInputElement>(documentRef, "templateMaximumDetectionsInput"),
    templateMatchSelectionControls: requireById<HTMLElement>(documentRef, "templateMatchSelectionControls"),
    templateMatchSelectionSummary: requireById<HTMLElement>(documentRef, "templateMatchSelectionSummary"),
    selectAllTemplateMatchesBtn: requireById<HTMLButtonElement>(documentRef, "selectAllTemplateMatchesBtn"),
    clearTemplateMatchSelectionBtn: requireById<HTMLButtonElement>(documentRef, "clearTemplateMatchSelectionBtn"),
    assignTemplateMatchClassBtn: requireById<HTMLButtonElement>(documentRef, "assignTemplateMatchClassBtn"),
    templateStrictNonOverlapToggle: requireById<HTMLInputElement>(documentRef, "templateStrictNonOverlapToggle"),
    templateNmsIouInput: requireById<HTMLInputElement>(documentRef, "templateNmsIouInput"),
    templatePaddingXInput: requireById<HTMLInputElement>(documentRef, "templatePaddingXInput"),
    templatePaddingYInput: requireById<HTMLInputElement>(documentRef, "templatePaddingYInput"),
    templateGrayscaleToggle: requireById<HTMLInputElement>(documentRef, "templateGrayscaleToggle"),
    templateBlurToggle: requireById<HTMLInputElement>(documentRef, "templateBlurToggle"),
    templateBlurKernelInput: requireById<HTMLInputElement>(documentRef, "templateBlurKernelInput"),
    templateBlurSigmaInput: requireById<HTMLInputElement>(documentRef, "templateBlurSigmaInput"),
    templateNoiseToggle: requireById<HTMLInputElement>(documentRef, "templateNoiseToggle"),
    templateNoiseSigmaInput: requireById<HTMLInputElement>(documentRef, "templateNoiseSigmaInput"),
    templateNoiseSeedInput: requireById<HTMLInputElement>(documentRef, "templateNoiseSeedInput"),
    templateMatchingAccurateRadio: requireById<HTMLInputElement>(documentRef, "templateMatchingAccurateRadio"),
    templateMatchingFastRadio: requireById<HTMLInputElement>(documentRef, "templateMatchingFastRadio"),
    templateMinimumScoreInput: requireById<HTMLInputElement>(documentRef, "templateMinimumScoreInput"),
    templateSearchRoiToggle: requireById<HTMLInputElement>(documentRef, "templateSearchRoiToggle"),
    templateSearchRoiInputs: requireById<HTMLElement>(documentRef, "templateSearchRoiInputs"),
    templateSearchXInput: requireById<HTMLInputElement>(documentRef, "templateSearchXInput"),
    templateSearchYInput: requireById<HTMLInputElement>(documentRef, "templateSearchYInput"),
    templateSearchWidthInput: requireById<HTMLInputElement>(documentRef, "templateSearchWidthInput"),
    templateSearchHeightInput: requireById<HTMLInputElement>(documentRef, "templateSearchHeightInput"),
    templateRelationXInput: requireById<HTMLInputElement>(documentRef, "templateRelationXInput"),
    templateRelationYInput: requireById<HTMLInputElement>(documentRef, "templateRelationYInput"),
    templateManualXInput: requireById<HTMLInputElement>(documentRef, "templateManualXInput"),
    templateManualYInput: requireById<HTMLInputElement>(documentRef, "templateManualYInput"),
    templateExistingPolicySelect: requireById<HTMLSelectElement>(documentRef, "templateExistingPolicySelect"),
    templateSettingsError: requireById<HTMLElement>(documentRef, "templateSettingsError"),
    testTemplateMatchBtn: requireById<HTMLButtonElement>(documentRef, "testTemplateMatchBtn"),
    applyTemplateMatchBtn: requireById<HTMLButtonElement>(documentRef, "applyTemplateMatchBtn"),
    saveAutomationPresetBtn: requireById<HTMLButtonElement>(documentRef, "saveAutomationPresetBtn"),
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
    sortLabelsAscBtn: requireById<HTMLElement>(documentRef, "sortLabelsAscBtn"),
    sortLabelsDescBtn: requireById<HTMLElement>(documentRef, "sortLabelsDescBtn"),
    viewClassFileBtn: requireById<HTMLElement>(documentRef, "viewClassFileBtn"),
    classFileViewerModal: new bootstrapRef.Modal(classFileViewerModalElement),
    classFileEditorBody: requireById<HTMLElement>(documentRef, "classFileEditorBody"),
    addClassRowBtn: requireById<HTMLElement>(documentRef, "addClassRowBtn"),
    saveClassFileBtn: requireById<HTMLElement>(documentRef, "saveClassFileBtn"),
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
    labelClassError: requireById<HTMLElement>(documentRef, "labelClassError"),
    classSelectionContainer: requireById<HTMLElement>(documentRef, "class-selection-container"),
    segmentationBrushModeBtn: requireById<HTMLElement>(documentRef, "segmentationBrushModeBtn"),
    segmentationEraseModeBtn: requireById<HTMLElement>(documentRef, "segmentationEraseModeBtn"),
    segmentationToolSizeLabel: requireById<HTMLElement>(documentRef, "segmentationToolSizeLabel"),
    segmentationToolSizeSlider: requireById<HTMLInputElement>(documentRef, "segmentationToolSizeSlider"),
    segmentationToolSizeValue: requireById<HTMLElement>(documentRef, "segmentationToolSizeValue"),
    segmentationToolSizePresets: requireById<HTMLElement>(documentRef, "segmentationToolSizePresets"),
    segmentationActiveClassSummary: requireById<HTMLElement>(documentRef, "segmentationActiveClassSummary"),
    segmentationRelabelRegionBtn: requireById<HTMLElement>(documentRef, "segmentationRelabelRegionBtn"),
    segmentationAutoFillClosedRegionGroup: requireById<HTMLElement>(documentRef, "segmentationAutoFillClosedRegionGroup"),
    segmentationAutoFillClosedRegionToggle: requireById<HTMLInputElement>(documentRef, "segmentationAutoFillClosedRegionToggle"),
    segmentationMaskVisibilityToggle: requireById<HTMLInputElement>(documentRef, "segmentationMaskVisibilityToggle"),
    segmentationMaskOpacitySlider: requireById<HTMLInputElement>(documentRef, "segmentationMaskOpacitySlider"),
    segmentationMaskOpacityValue: requireById<HTMLElement>(documentRef, "segmentationMaskOpacityValue"),
    segmentationEdgeHighlightToggle: requireById<HTMLInputElement>(documentRef, "segmentationEdgeHighlightToggle"),
    segmentationEdgeGlowSlider: requireById<HTMLInputElement>(documentRef, "segmentationEdgeGlowSlider"),
    segmentationEdgeGlowValue: requireById<HTMLElement>(documentRef, "segmentationEdgeGlowValue"),
    segmentationClassSummary: requireById<HTMLElement>(documentRef, "segmentationClassSummary"),
    saveLabelClassBtn: requireById<HTMLElement>(documentRef, "saveLabelClassBtn"),
    crosshairToggle: requireById<HTMLInputElement>(documentRef, "crosshairToggle"),
    contextMenu: requireById<HTMLElement>(documentRef, "context-menu"),
    ctxEditLabel: requireById<HTMLElement>(documentRef, "ctx-edit-label"),
    ctxDeleteLabel: requireById<HTMLElement>(documentRef, "ctx-delete-label"),
    loadingOverlay: requireById<HTMLElement>(documentRef, "loading-overlay"),
    loadingStatusText: requireById<HTMLElement>(documentRef, "loadingStatusText"),
    activeOperationPanel: requireById<HTMLElement>(documentRef, "activeOperationPanel"),
    activeOperationTitle: requireById<HTMLElement>(documentRef, "activeOperationTitle"),
    activeOperationDetail: requireById<HTMLElement>(documentRef, "activeOperationDetail"),
    activeOperationElapsed: requireById<HTMLElement>(documentRef, "activeOperationElapsed"),
    activeOperationProgressText: requireById<HTMLElement>(documentRef, "activeOperationProgressText"),
    activeOperationProgress: requireById<HTMLElement>(documentRef, "activeOperationProgress"),
    activeOperationProgressBar: requireById<HTMLElement>(documentRef, "activeOperationProgressBar"),
    cancelActiveOperationBtn: requireById<HTMLButtonElement>(documentRef, "cancelActiveOperationBtn"),
    taskFilesBtn: requireById<HTMLButtonElement>(documentRef, "taskFilesBtn"),
    taskAnnotateBtn: requireById<HTMLButtonElement>(documentRef, "taskAnnotateBtn"),
    taskAutomateBtn: requireById<HTMLButtonElement>(documentRef, "taskAutomateBtn"),
    refreshDatasetBtn: requireById<HTMLButtonElement>(documentRef, "refreshDatasetBtn"),
    datasetConnectionStatus: requireById<HTMLElement>(documentRef, "datasetConnectionStatus"),
    fileSystemCompatibilityNotice: requireById<HTMLElement>(documentRef, "fileSystemCompatibilityNotice"),
    imageCountBadge: requireById<HTMLElement>(documentRef, "imageCountBadge"),
    classSearchInput: requireById<HTMLInputElement>(documentRef, "classSearchInput"),
    addClassShortcutBtn: requireById<HTMLButtonElement>(documentRef, "addClassShortcutBtn"),
    canvasEmptyState: requireById<HTMLElement>(documentRef, "canvasEmptyState"),
    layoutGhostCanvas: requireById<HTMLCanvasElement>(documentRef, "layoutGhostCanvas"),
    emptyOpenDatasetBtn: requireById<HTMLButtonElement>(documentRef, "emptyOpenDatasetBtn"),
    emptyLoadSampleBtn: requireById<HTMLButtonElement>(documentRef, "emptyLoadSampleBtn"),
    emptyStateCompatibilityText: requireById<HTMLElement>(documentRef, "emptyStateCompatibilityText"),
    inspectorTitle: requireById<HTMLElement>(documentRef, "inspectorTitle"),
    inspectorSubtitle: requireById<HTMLElement>(documentRef, "inspectorSubtitle"),
    inspectorAnnotationTabBtn: requireById<HTMLButtonElement>(documentRef, "inspectorAnnotationTabBtn"),
    inspectorTransformTabBtn: requireById<HTMLButtonElement>(documentRef, "inspectorTransformTabBtn"),
    inspectorAutomationTabBtn: requireById<HTMLButtonElement>(documentRef, "inspectorAutomationTabBtn"),
    inspectorAnnotationPane: requireById<HTMLElement>(documentRef, "inspectorAnnotationPane"),
    inspectorTransformPane: requireById<HTMLElement>(documentRef, "inspectorTransformPane"),
    inspectorAutomationPane: requireById<HTMLElement>(documentRef, "inspectorAutomationPane"),
    activeToolSummary: requireById<HTMLElement>(documentRef, "activeToolSummary"),
    selectedAnnotationCount: requireById<HTMLElement>(documentRef, "selectedAnnotationCount"),
    selectionEmptyState: requireById<HTMLElement>(documentRef, "selectionEmptyState"),
    selectionDetails: requireById<HTMLElement>(documentRef, "selectionDetails"),
    selectionClassSelect: requireById<HTMLSelectElement>(documentRef, "selectionClassSelect"),
    selectionGeometryX: requireById<HTMLInputElement>(documentRef, "selectionGeometryX"),
    selectionGeometryY: requireById<HTMLInputElement>(documentRef, "selectionGeometryY"),
    selectionGeometryWidth: requireById<HTMLInputElement>(documentRef, "selectionGeometryWidth"),
    selectionGeometryHeight: requireById<HTMLInputElement>(documentRef, "selectionGeometryHeight"),
    duplicateSelectionBtn: requireById<HTMLButtonElement>(documentRef, "duplicateSelectionBtn"),
    hideSelectionBtn: requireById<HTMLButtonElement>(documentRef, "hideSelectionBtn"),
    deleteSelectionBtn: requireById<HTMLButtonElement>(documentRef, "deleteSelectionBtn"),
    labelDisplayModeSelect: requireById<HTMLSelectElement>(documentRef, "labelDisplayModeSelect"),
    layoutPlacementNotice: requireById<HTMLElement>(documentRef, "layoutPlacementNotice"),
    headerDocumentStatus: requireById<HTMLElement>(documentRef, "headerDocumentStatus"),
    statusImageInfo: requireById<HTMLElement>(documentRef, "statusImageInfo"),
    statusAnnotationInfo: requireById<HTMLElement>(documentRef, "statusAnnotationInfo"),
    documentStatus: requireById<HTMLElement>(documentRef, "documentStatus"),
    statusMode: requireById<HTMLElement>(documentRef, "statusMode"),
    matchingEngineStatus: requireById<HTMLElement>(documentRef, "matchingEngineStatus")
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
