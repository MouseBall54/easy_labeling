import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createInitialAppState } from "../../../src/app/state.js";
import { createEventManagerAdapter } from "../../../src/bootstrap/event-manager-adapter.js";
import { createRect } from "../features/canvas/test-fakes.js";
import type { CanvasHistoryGestureBaseline } from "../../../src/features/canvas/history.js";

class FakeClassList {
  private readonly classes = new Set<string>();

  add(...tokens: string[]): void {
    tokens.forEach((token) => {
      this.classes.add(token);
    });
  }

  contains(token: string): boolean {
    return this.classes.has(token);
  }
}

class FakeHtmlElement {
  public readonly listeners = new Map<string, Array<(event: unknown) => void>>();
  public readonly classList = new FakeClassList();
  public checked = false;
  public disabled = false;
  public value = "";
  public textContent = "";
  public style = { display: "" };
  public tagName = "DIV";
  public isContentEditable = false;
  public onclick: (() => void) | null = null;

  addEventListener(type: string, listener: (event: unknown) => void): void {
    const existing = this.listeners.get(type) ?? [];
    existing.push(listener);
    this.listeners.set(type, existing);
  }

  removeEventListener(type: string, listener: (event: unknown) => void): void {
    const existing = this.listeners.get(type) ?? [];
    this.listeners.set(
      type,
      existing.filter((candidate) => candidate !== listener)
    );
  }

  dispatch(type: string, event: unknown): void {
    (this.listeners.get(type) ?? []).forEach((listener) => {
      listener(event);
    });
  }

  closest(): null {
    return null;
  }

  querySelector(): null {
    return null;
  }
}

class FakeInputElement extends FakeHtmlElement {
  override tagName = "INPUT";
}

class FakeWindow {
  public keydownListener: ((event: unknown) => void) | null = null;

  addEventListener(type: string, listener: (event: unknown) => void): void {
    if (type === "keydown") {
      this.keydownListener = listener;
    }
  }
}

function createElements() {
  return {
    selectImageFolderBtn: new FakeHtmlElement(),
    selectLabelFolderBtn: new FakeHtmlElement(),
    loadClassInfoFolderBtn: new FakeHtmlElement(),
    classFileSelect: new FakeInputElement(),
    imageList: new FakeHtmlElement(),
    imageSearchInput: new FakeInputElement(),
    showLabeledCheckbox: new FakeInputElement(),
    showUnlabeledCheckbox: new FakeInputElement(),
    saveLabelsBtn: new FakeHtmlElement(),
    detectionWorkflowTab: new FakeInputElement(),
    segmentationWorkflowTab: new FakeInputElement(),
    autoSaveToggle: new FakeInputElement(),
    showLabelsOnCanvasToggle: new FakeInputElement(),
    labelFontSizeSlider: new FakeInputElement(),
    labelFontSizeValue: new FakeHtmlElement(),
    drawModeBtn: new FakeInputElement(),
    editModeBtn: new FakeInputElement(),
    labelList: new FakeHtmlElement(),
    labelFilters: new FakeHtmlElement(),
    selectByClassDropdown: new FakeInputElement(),
    selectByClassBtn: new FakeHtmlElement(),
    zoomInBtn: new FakeHtmlElement(),
    zoomOutBtn: new FakeHtmlElement(),
    resetZoomBtn: new FakeHtmlElement(),
    undoBtn: new FakeHtmlElement(),
    redoBtn: new FakeHtmlElement(),
    alignLeftBtn: new FakeHtmlElement(),
    alignRightBtn: new FakeHtmlElement(),
    alignTopBtn: new FakeHtmlElement(),
    alignBottomBtn: new FakeHtmlElement(),
    distributeHorizontalBtn: new FakeHtmlElement(),
    distributeVerticalBtn: new FakeHtmlElement(),
    canvasContainer: new FakeHtmlElement(),
    zoomInput: new FakeInputElement(),
    mouseCoordsDisplay: new FakeHtmlElement(),
    coordXInput: new FakeInputElement(),
    coordYInput: new FakeInputElement(),
    goToCoordsBtn: new FakeHtmlElement(),
    currentImageNameSpan: new FakeHtmlElement(),
    prevImageBtn: new FakeHtmlElement(),
    nextImageBtn: new FakeHtmlElement(),
    leftPanel: new FakeHtmlElement(),
    rightPanel: new FakeHtmlElement(),
    leftSplitter: new FakeHtmlElement(),
    rightSplitter: new FakeHtmlElement(),
    darkModeToggle: new FakeInputElement(),
    sortLabelsAscBtn: new FakeHtmlElement(),
    sortLabelsDescBtn: new FakeHtmlElement(),
    viewClassFileBtn: new FakeHtmlElement(),
    classFileViewerModal: { _element: new FakeHtmlElement(), show: vi.fn(), hide: vi.fn() },
    classFileEditorBody: new FakeHtmlElement(),
    addClassRowBtn: new FakeHtmlElement(),
    saveClassFileBtn: new FakeHtmlElement(),
    previewBar: new FakeHtmlElement(),
    previewPrevBtn: new FakeHtmlElement(),
    previewNextBtn: new FakeHtmlElement(),
    previewListWrapper: new FakeHtmlElement(),
    previewList: new FakeHtmlElement(),
    bottomPanel: new FakeHtmlElement(),
    bottomSplitter: new FakeHtmlElement(),
    previewBarHeader: new FakeHtmlElement(),
    togglePreviewBtn: new FakeHtmlElement(),
    collapseLeftPanelBtn: new FakeHtmlElement(),
    expandLeftPanelBtn: new FakeHtmlElement(),
    collapseRightPanelBtn: new FakeHtmlElement(),
    expandRightPanelBtn: new FakeHtmlElement(),
    labelClassModal: { _element: new FakeHtmlElement(), show: vi.fn(), hide: vi.fn() },
    labelClassInput: new FakeInputElement(),
    classSelectionContainer: new FakeHtmlElement(),
    segmentationBrushModeBtn: new FakeHtmlElement(),
    segmentationEraseModeBtn: new FakeHtmlElement(),
    segmentationToolSizeLabel: new FakeHtmlElement(),
    segmentationToolSizeSlider: new FakeInputElement(),
    segmentationToolSizeValue: new FakeHtmlElement(),
    segmentationToolSizePresets: new FakeHtmlElement(),
    segmentationActiveClassSummary: new FakeHtmlElement(),
    segmentationRelabelRegionBtn: new FakeHtmlElement(),
    segmentationAutoFillClosedRegionToggle: new FakeInputElement(),
    segmentationMaskVisibilityToggle: new FakeInputElement(),
    segmentationMaskOpacitySlider: new FakeInputElement(),
    segmentationMaskOpacityValue: new FakeHtmlElement(),
    segmentationClassSummary: new FakeHtmlElement(),
    saveLabelClassBtn: new FakeHtmlElement(),
    crosshairToggle: new FakeInputElement(),
    contextMenu: new FakeHtmlElement(),
    ctxEditLabel: new FakeHtmlElement(),
    ctxDeleteLabel: new FakeHtmlElement(),
    loadingOverlay: new FakeHtmlElement()
  };
}

function createRawCanvas() {
  return {
    isDragging: false,
    selection: true,
    lastPosX: 0,
    lastPosY: 0,
    viewportTransform: [1, 0, 0, 1, 0, 0] as [number, number, number, number, number, number],
    backgroundImage: null as unknown,
    upperCanvasEl: new FakeHtmlElement(),
    on: vi.fn(),
    getPointer: vi.fn(),
    renderAll: vi.fn(),
    requestRenderAll: vi.fn(),
    calcOffset: vi.fn(),
    getZoom: vi.fn(() => 1),
    zoomToPoint: vi.fn(),
    setViewportTransform: vi.fn(function (this: { viewportTransform: [number, number, number, number, number, number] }, transform: [number, number, number, number, number, number]) {
      this.viewportTransform = transform;
    }),
    findTarget: vi.fn<() => unknown>(() => null),
    getActiveObject: vi.fn<() => unknown>(() => null),
    getActiveObjects: vi.fn<() => unknown[]>(() => []),
    discardActiveObject: vi.fn()
  };
}

function createRawController(rawCanvas: ReturnType<typeof createRawCanvas>) {
  const baseline: CanvasHistoryGestureBaseline = {
    before: [],
    selectionBefore: {
      annotationIds: [],
      primaryAnnotationId: null
    }
  };

  return {
    canvas: rawCanvas,
    sortObjectsByLabel: vi.fn(),
    zoom: vi.fn(),
    resetZoom: vi.fn(),
    setZoomPercentage: vi.fn(),
    selectLabelsByClass: vi.fn(),
    goToCoords: vi.fn(),
    toggleCrosshair: vi.fn(),
    startDrawing: vi.fn(),
    continueDrawing: vi.fn(),
    finishDrawing: vi.fn(async () => {}),
    setSegmentationTool: vi.fn(),
    setSegmentationActiveClass: vi.fn(),
    setSegmentationAutoFillClosedRegionEnabled: vi.fn(),
    getSegmentationAutoFillClosedRegionEnabled: vi.fn(() => false),
    setSegmentationBrushRadius: vi.fn(),
    getSelectedSegmentationClass: vi.fn(() => null),
    deleteSelectedSegmentationRegion: vi.fn(() => false),
    startSegmentationRegionMove: vi.fn(() => false),
    continueSegmentationRegionMove: vi.fn(() => false),
    finishSegmentationRegionMove: vi.fn(async () => false),
    relabelSelectedSegmentationRegion: vi.fn(() => false),
    highlightSelection: vi.fn(),
    hideCrosshair: vi.fn(),
    updateLabelText: vi.fn(),
    updateAllLabelTexts: vi.fn(),
    copy: vi.fn(),
    paste: vi.fn(),
    alignSelectionLeft: vi.fn(),
    alignSelectionRight: vi.fn(),
    alignSelectionTop: vi.fn(),
    alignSelectionBottom: vi.fn(),
    distributeSelectionHorizontally: vi.fn(),
    distributeSelectionVertically: vi.fn(),
    selectAllLabels: vi.fn(),
    editLabel: vi.fn(async () => {}),
    editMultipleLabels: vi.fn(async () => {}),
    removeObject: vi.fn(),
    deleteSelection: vi.fn(),
    setSelectedLabelClass: vi.fn(() => false),
    undo: vi.fn(),
    redo: vi.fn(),
    canUndo: vi.fn(() => false),
    canRedo: vi.fn(() => false),
    captureHistoryBaseline: vi.fn(() => baseline),
    commitHistoryFromBaseline: vi.fn(),
    clearHistory: vi.fn(),
    renderAll: rawCanvas.renderAll
  };
}

function createActiveSelection(objects: unknown[]) {
  return {
    type: "activeSelection",
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    set: vi.fn(),
    setCoords: vi.fn(),
    setControlVisible: vi.fn(),
    getCenterPoint: vi.fn(() => ({ x: 0, y: 0 })),
    getScaledWidth: vi.fn(() => 0),
    getScaledHeight: vi.fn(() => 0),
    getBoundingRect: vi.fn(() => ({ left: 0, top: 0, width: 0, height: 0 })),
    clone: vi.fn(),
    getObjects: vi.fn(() => objects),
    forEachObject: vi.fn()
  };
}

function createNoopUiManager(elements: ReturnType<typeof createElements>, overrides: Record<string, unknown> = {}) {
  return {
    elements,
    notify: vi.fn(),
    renderImageList: vi.fn(),
    renderPreviewList: vi.fn(),
    updateLabelList: vi.fn(),
    updateMouseCoords: vi.fn(),
    hideMouseCoords: vi.fn(),
    togglePreviewBarVisibility: vi.fn(),
    togglePanel: vi.fn(),
    applyDarkMode: vi.fn(),
    ...overrides
  } as unknown as Parameters<typeof createEventManagerAdapter>[0]["uiManager"];
}

function createNoopFileSystem() {
  return {
    selectImageFolder: vi.fn(async () => {}),
    selectLabelFolder: vi.fn(async () => {}),
    selectClassInfoFolder: vi.fn(async () => {}),
    saveLabels: vi.fn(async () => {}),
    showClassFileContent: vi.fn(async () => {}),
    saveClassFileContent: vi.fn(async () => {}),
    addNewClassRow: vi.fn(),
    createNewClassFile: vi.fn(async () => {}),
    loadClassNamesFromFile: vi.fn(async () => {}),
    navigateImage: vi.fn(async () => {})
  } as unknown as Parameters<typeof createEventManagerAdapter>[0]["fileSystem"];
}

describe("bootstrap/event-manager-adapter", () => {
  const originalHTMLElement = globalThis.HTMLElement;
  const originalHTMLInputElement = globalThis.HTMLInputElement;

  beforeEach(() => {
    Object.defineProperty(globalThis, "HTMLElement", {
      configurable: true,
      writable: true,
      value: FakeHtmlElement
    });
    Object.defineProperty(globalThis, "HTMLInputElement", {
      configurable: true,
      writable: true,
      value: FakeInputElement
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, "HTMLElement", {
      configurable: true,
      writable: true,
      value: originalHTMLElement
    });
    Object.defineProperty(globalThis, "HTMLInputElement", {
      configurable: true,
      writable: true,
      value: originalHTMLInputElement
    });
  });

  it("defaults workflow tabs to detection and switches the active workflow cleanly", () => {
    const state = createInitialAppState();
    const elements = createElements();
    const windowRef = new FakeWindow();
    const rawCanvas = createRawCanvas();
    rawCanvas.getPointer.mockReturnValue({ x: 0, y: 0 });
    const rawController = createRawController(rawCanvas);
    const setWorkflow = vi.fn((workflow: "detection" | "segmentation") => {
      state.session.workflow = workflow;
    });
    const setCanvasWorkflow = vi.fn();

    const eventManager = createEventManagerAdapter({
      state,
      uiManager: {
        elements,
        notify: vi.fn(),
        renderImageList: vi.fn(),
        renderPreviewList: vi.fn(),
        updateLabelList: vi.fn(),
        updateMouseCoords: vi.fn(),
        hideMouseCoords: vi.fn(),
        togglePreviewBarVisibility: vi.fn(),
        togglePanel: vi.fn(),
        applyDarkMode: vi.fn(),
        setWorkflow
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["uiManager"],
      fileSystem: {
        selectImageFolder: vi.fn(async () => {}),
        selectLabelFolder: vi.fn(async () => {}),
        selectClassInfoFolder: vi.fn(async () => {}),
        saveLabels: vi.fn(async () => {}),
        showClassFileContent: vi.fn(async () => {}),
        saveClassFileContent: vi.fn(async () => {}),
        addNewClassRow: vi.fn(),
        createNewClassFile: vi.fn(async () => {}),
        loadClassNamesFromFile: vi.fn(async () => {}),
        navigateImage: vi.fn(async () => {})
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["fileSystem"],
      canvasController: {
        setMode: vi.fn(),
        setWorkflow: setCanvasWorkflow,
        raw: rawController
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["canvasController"],
      windowRef
    });

    eventManager.bindEventListeners();

    expect(state.session.workflow).toBe("detection");
    expect(elements.detectionWorkflowTab.checked).toBe(true);
    expect(elements.segmentationWorkflowTab.checked).toBe(false);

    elements.segmentationWorkflowTab.dispatch("change", {});
    expect(setCanvasWorkflow).toHaveBeenCalledWith("segmentation");
    expect(setWorkflow).toHaveBeenCalledWith("segmentation");
    expect(state.session.workflow).toBe("segmentation");
    expect(elements.detectionWorkflowTab.checked).toBe(false);
    expect(elements.segmentationWorkflowTab.checked).toBe(true);
    expect(elements.editModeBtn.checked).toBe(true);
  });

  it("syncs the draw/edit radio UI when Ctrl+Q toggles the mode", () => {
    const state = createInitialAppState();
    const elements = createElements();
    const windowRef = new FakeWindow();
    const rawCanvas = createRawCanvas();
    rawCanvas.getPointer.mockReturnValue({ x: 0, y: 0 });
    const rawController = createRawController(rawCanvas);
    const setMode = vi.fn((mode: "draw" | "edit") => {
      state.view.currentMode = mode;
    });

    const eventManager = createEventManagerAdapter({
      state,
      uiManager: {
        elements,
        notify: vi.fn(),
        renderImageList: vi.fn(),
        renderPreviewList: vi.fn(),
        updateLabelList: vi.fn(),
        updateMouseCoords: vi.fn(),
        hideMouseCoords: vi.fn(),
        togglePreviewBarVisibility: vi.fn(),
        togglePanel: vi.fn(),
        applyDarkMode: vi.fn()
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["uiManager"],
      fileSystem: {
        selectImageFolder: vi.fn(async () => {}),
        selectLabelFolder: vi.fn(async () => {}),
        selectClassInfoFolder: vi.fn(async () => {}),
        saveLabels: vi.fn(async () => {}),
        showClassFileContent: vi.fn(async () => {}),
        saveClassFileContent: vi.fn(async () => {}),
        addNewClassRow: vi.fn(),
        createNewClassFile: vi.fn(async () => {}),
        loadClassNamesFromFile: vi.fn(async () => {}),
        navigateImage: vi.fn(async () => {})
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["fileSystem"],
      canvasController: {
        setMode,
        raw: rawController
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["canvasController"],
      windowRef
    });

    eventManager.bindEventListeners();

    expect(elements.editModeBtn.checked).toBe(true);
    expect(elements.drawModeBtn.checked).toBe(false);

    const preventDefault = vi.fn();
    windowRef.keydownListener?.({
      ctrlKey: true,
      metaKey: false,
      key: "q",
      target: new FakeHtmlElement(),
      preventDefault,
      shiftKey: false
    });

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(setMode).toHaveBeenCalledWith("draw");
    expect(elements.drawModeBtn.checked).toBe(true);
    expect(elements.editModeBtn.checked).toBe(false);
  });

  it("prevents the browser default for Ctrl+B and routes to label editing", () => {
    const state = createInitialAppState();
    const elements = createElements();
    const windowRef = new FakeWindow();
    const rawCanvas = createRawCanvas();
    const rawController = createRawController(rawCanvas);
    const activeRect = createRect({ left: 1, top: 2, width: 3, height: 4, labelClass: "1" });
    const editLabel = vi.fn(async () => {});
    rawCanvas.getActiveObject.mockReturnValue(activeRect);
    rawController.editLabel = editLabel;

    const eventManager = createEventManagerAdapter({
      state,
      uiManager: {
        elements,
        notify: vi.fn(),
        renderImageList: vi.fn(),
        renderPreviewList: vi.fn(),
        updateLabelList: vi.fn(),
        updateMouseCoords: vi.fn(),
        hideMouseCoords: vi.fn(),
        togglePreviewBarVisibility: vi.fn(),
        togglePanel: vi.fn(),
        applyDarkMode: vi.fn()
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["uiManager"],
      fileSystem: {
        selectImageFolder: vi.fn(async () => {}),
        selectLabelFolder: vi.fn(async () => {}),
        selectClassInfoFolder: vi.fn(async () => {}),
        saveLabels: vi.fn(async () => {}),
        showClassFileContent: vi.fn(async () => {}),
        saveClassFileContent: vi.fn(async () => {}),
        addNewClassRow: vi.fn(),
        createNewClassFile: vi.fn(async () => {}),
        loadClassNamesFromFile: vi.fn(async () => {}),
        navigateImage: vi.fn(async () => {})
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["fileSystem"],
      canvasController: {
        setMode: vi.fn(),
        raw: rawController
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["canvasController"],
      windowRef
    });

    eventManager.bindEventListeners();

    const preventDefault = vi.fn();
    windowRef.keydownListener?.({
      ctrlKey: true,
      metaKey: false,
      key: "b",
      target: new FakeHtmlElement(),
      preventDefault,
      shiftKey: false
    });

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(editLabel).toHaveBeenCalledWith(activeRect);
  });

  it("re-synchronizes Fabric hit-testing after Alt-drag panning", () => {
    const state = createInitialAppState();
    const elements = createElements();
    const windowRef = new FakeWindow();
    const rawCanvas = createRawCanvas();
    rawCanvas.getPointer.mockReturnValue({ x: 0, y: 0 });
    const rawController = createRawController(rawCanvas);

    const eventManager = createEventManagerAdapter({
      state,
      uiManager: {
        elements,
        notify: vi.fn(),
        renderImageList: vi.fn(),
        renderPreviewList: vi.fn(),
        updateLabelList: vi.fn(),
        updateMouseCoords: vi.fn(),
        hideMouseCoords: vi.fn(),
        togglePreviewBarVisibility: vi.fn(),
        togglePanel: vi.fn(),
        applyDarkMode: vi.fn(),
        updateZoomDisplay: vi.fn()
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["uiManager"],
      fileSystem: {
        selectImageFolder: vi.fn(async () => {}),
        selectLabelFolder: vi.fn(async () => {}),
        selectClassInfoFolder: vi.fn(async () => {}),
        saveLabels: vi.fn(async () => {}),
        showClassFileContent: vi.fn(async () => {}),
        saveClassFileContent: vi.fn(async () => {}),
        addNewClassRow: vi.fn(),
        createNewClassFile: vi.fn(async () => {}),
        loadClassNamesFromFile: vi.fn(async () => {}),
        navigateImage: vi.fn(async () => {})
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["fileSystem"],
      canvasController: {
        setMode: vi.fn(),
        raw: rawController
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["canvasController"],
      windowRef
    });

    eventManager.bindEventListeners();

    const mouseDownHandler = rawCanvas.on.mock.calls.find(([eventName]) => eventName === "mouse:down")?.[1];
    const mouseMoveHandler = rawCanvas.on.mock.calls.find(([eventName]) => eventName === "mouse:move")?.[1];
    const mouseUpHandler = rawCanvas.on.mock.calls.find(([eventName]) => eventName === "mouse:up")?.[1];

    expect(mouseDownHandler).toBeTypeOf("function");
    expect(mouseMoveHandler).toBeTypeOf("function");
    expect(mouseUpHandler).toBeTypeOf("function");

    mouseDownHandler?.({
      e: { altKey: true, ctrlKey: false, clientX: 20, clientY: 30 }
    });
    mouseMoveHandler?.({
      e: { clientX: 44, clientY: 55 }
    });
    mouseUpHandler?.({ e: {} });

    expect(rawCanvas.viewportTransform).toEqual([1, 0, 0, 1, 24, 25]);
    expect(rawCanvas.setViewportTransform).toHaveBeenCalledWith([1, 0, 0, 1, 24, 25]);
    expect(rawCanvas.calcOffset).toHaveBeenCalledTimes(1);
    expect(rawCanvas.requestRenderAll).toHaveBeenCalledTimes(1);
    expect(rawCanvas.selection).toBe(true);
    expect(rawCanvas.isDragging).toBe(false);
    expect(rawController.startDrawing).not.toHaveBeenCalled();
    expect(rawController.captureHistoryBaseline).not.toHaveBeenCalled();
    expect(rawController.commitHistoryFromBaseline).not.toHaveBeenCalled();
  });

  it("dispatches six arrange toolbar buttons to matching controller methods", () => {
    const state = createInitialAppState();
    const elements = createElements();
    const windowRef = new FakeWindow();
    const rawCanvas = createRawCanvas();
    const rawController = createRawController(rawCanvas);

    const eventManager = createEventManagerAdapter({
      state,
      uiManager: {
        elements,
        notify: vi.fn(),
        renderImageList: vi.fn(),
        renderPreviewList: vi.fn(),
        updateLabelList: vi.fn(),
        updateMouseCoords: vi.fn(),
        hideMouseCoords: vi.fn(),
        togglePreviewBarVisibility: vi.fn(),
        togglePanel: vi.fn(),
        applyDarkMode: vi.fn()
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["uiManager"],
      fileSystem: {
        selectImageFolder: vi.fn(async () => {}),
        selectLabelFolder: vi.fn(async () => {}),
        selectClassInfoFolder: vi.fn(async () => {}),
        saveLabels: vi.fn(async () => {}),
        showClassFileContent: vi.fn(async () => {}),
        saveClassFileContent: vi.fn(async () => {}),
        addNewClassRow: vi.fn(),
        createNewClassFile: vi.fn(async () => {}),
        loadClassNamesFromFile: vi.fn(async () => {}),
        navigateImage: vi.fn(async () => {})
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["fileSystem"],
      canvasController: {
        setMode: vi.fn(),
        raw: rawController
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["canvasController"],
      windowRef
    });

    eventManager.bindEventListeners();

    elements.alignLeftBtn.dispatch("click", {});
    elements.alignRightBtn.dispatch("click", {});
    elements.alignTopBtn.dispatch("click", {});
    elements.alignBottomBtn.dispatch("click", {});
    elements.distributeHorizontalBtn.dispatch("click", {});
    elements.distributeVerticalBtn.dispatch("click", {});

    expect(rawController.alignSelectionLeft).toHaveBeenCalledTimes(1);
    expect(rawController.alignSelectionRight).toHaveBeenCalledTimes(1);
    expect(rawController.alignSelectionTop).toHaveBeenCalledTimes(1);
    expect(rawController.alignSelectionBottom).toHaveBeenCalledTimes(1);
    expect(rawController.distributeSelectionHorizontally).toHaveBeenCalledTimes(1);
    expect(rawController.distributeSelectionVertically).toHaveBeenCalledTimes(1);
  });

  it("suppresses selection-box behavior while painting in segmentation workflow", () => {
    const state = createInitialAppState();
    state.session.workflow = "segmentation";
    state.view.currentMode = "draw";
    const elements = createElements();
    const windowRef = new FakeWindow();
    const rawCanvas = createRawCanvas();
    rawCanvas.getPointer.mockReturnValue({ x: 8, y: 9 });
    const rawController = createRawController(rawCanvas);

    const eventManager = createEventManagerAdapter({
      state,
      uiManager: {
        elements,
        notify: vi.fn(),
        renderImageList: vi.fn(),
        renderPreviewList: vi.fn(),
        updateLabelList: vi.fn(),
        updateMouseCoords: vi.fn(),
        hideMouseCoords: vi.fn(),
        togglePreviewBarVisibility: vi.fn(),
        togglePanel: vi.fn(),
        applyDarkMode: vi.fn()
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["uiManager"],
      fileSystem: {
        selectImageFolder: vi.fn(async () => {}),
        selectLabelFolder: vi.fn(async () => {}),
        selectClassInfoFolder: vi.fn(async () => {}),
        saveLabels: vi.fn(async () => {}),
        showClassFileContent: vi.fn(async () => {}),
        saveClassFileContent: vi.fn(async () => {}),
        addNewClassRow: vi.fn(),
        createNewClassFile: vi.fn(async () => {}),
        loadClassNamesFromFile: vi.fn(async () => {}),
        navigateImage: vi.fn(async () => {})
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["fileSystem"],
      canvasController: {
        setMode: vi.fn(),
        raw: rawController
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["canvasController"],
      windowRef
    });

    eventManager.bindEventListeners();

    const mouseDownHandler = rawCanvas.on.mock.calls.find(([eventName]) => eventName === "mouse:down")?.[1];
    const mouseUpHandler = rawCanvas.on.mock.calls.find(([eventName]) => eventName === "mouse:up")?.[1];
    expect(rawCanvas.selection).toBe(true);

    mouseDownHandler?.({
      e: { altKey: false, ctrlKey: false, clientX: 10, clientY: 20 }
    });
    expect(rawCanvas.selection).toBe(false);
    expect(rawController.startDrawing).toHaveBeenCalledWith({ x: 8, y: 9 });

    mouseUpHandler?.({ e: {} });
    expect(rawCanvas.selection).toBe(false);
  });

  it("uses edit mode click to select segmentation region instead of starting a brush stroke", () => {
    const state = createInitialAppState();
    state.session.workflow = "segmentation";
    state.view.currentMode = "edit";
    const elements = createElements();
    const windowRef = new FakeWindow();
    const rawCanvas = createRawCanvas();
    rawCanvas.getPointer.mockReturnValue({ x: 12, y: 7 });
    const rawController = {
      ...createRawController(rawCanvas),
      selectSegmentationRegionAtPoint: vi.fn(() => true),
      clearSegmentationSelection: vi.fn()
    };
    const setWorkflow = vi.fn();

    const eventManager = createEventManagerAdapter({
      state,
      uiManager: {
        elements,
        notify: vi.fn(),
        renderImageList: vi.fn(),
        renderPreviewList: vi.fn(),
        updateLabelList: vi.fn(),
        updateMouseCoords: vi.fn(),
        hideMouseCoords: vi.fn(),
        togglePreviewBarVisibility: vi.fn(),
        togglePanel: vi.fn(),
        applyDarkMode: vi.fn(),
        setWorkflow
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["uiManager"],
      fileSystem: {
        selectImageFolder: vi.fn(async () => {}),
        selectLabelFolder: vi.fn(async () => {}),
        selectClassInfoFolder: vi.fn(async () => {}),
        saveLabels: vi.fn(async () => {}),
        showClassFileContent: vi.fn(async () => {}),
        saveClassFileContent: vi.fn(async () => {}),
        addNewClassRow: vi.fn(),
        createNewClassFile: vi.fn(async () => {}),
        loadClassNamesFromFile: vi.fn(async () => {}),
        navigateImage: vi.fn(async () => {})
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["fileSystem"],
      canvasController: {
        setMode: vi.fn(),
        raw: rawController
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["canvasController"],
      windowRef
    });

    eventManager.bindEventListeners();

    const mouseDownHandler = rawCanvas.on.mock.calls.find(([eventName]) => eventName === "mouse:down")?.[1];
    mouseDownHandler?.({
      e: { altKey: false, ctrlKey: false, clientX: 10, clientY: 20 }
    });

    expect(rawController.selectSegmentationRegionAtPoint).toHaveBeenCalledWith({ x: 12, y: 7 });
    expect(rawController.startDrawing).not.toHaveBeenCalled();
    expect(rawCanvas.selection).toBe(true);
    expect(setWorkflow).toHaveBeenCalledWith("segmentation");
  });

  it("moves the selected segmentation region during edit-mode drag", async () => {
    const state = createInitialAppState();
    state.session.workflow = "segmentation";
    state.view.currentMode = "edit";
    const elements = createElements();
    const windowRef = new FakeWindow();
    const rawCanvas = createRawCanvas();
    const rawController = {
      ...createRawController(rawCanvas),
      startSegmentationRegionMove: vi.fn(() => true),
      continueSegmentationRegionMove: vi.fn(() => true),
      finishSegmentationRegionMove: vi.fn(async () => true)
    };
    const setWorkflow = vi.fn();

    rawCanvas.getPointer
      .mockReturnValueOnce({ x: 10, y: 10 })
      .mockReturnValueOnce({ x: 13, y: 12 });

    const eventManager = createEventManagerAdapter({
      state,
      uiManager: {
        elements,
        notify: vi.fn(),
        renderImageList: vi.fn(),
        renderPreviewList: vi.fn(),
        updateLabelList: vi.fn(),
        updateMouseCoords: vi.fn(),
        hideMouseCoords: vi.fn(),
        togglePreviewBarVisibility: vi.fn(),
        togglePanel: vi.fn(),
        applyDarkMode: vi.fn(),
        setWorkflow
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["uiManager"],
      fileSystem: {
        selectImageFolder: vi.fn(async () => {}),
        selectLabelFolder: vi.fn(async () => {}),
        selectClassInfoFolder: vi.fn(async () => {}),
        saveLabels: vi.fn(async () => {}),
        showClassFileContent: vi.fn(async () => {}),
        saveClassFileContent: vi.fn(async () => {}),
        addNewClassRow: vi.fn(),
        createNewClassFile: vi.fn(async () => {}),
        loadClassNamesFromFile: vi.fn(async () => {}),
        navigateImage: vi.fn(async () => {})
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["fileSystem"],
      canvasController: {
        setMode: vi.fn(),
        raw: rawController
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["canvasController"],
      windowRef
    });

    eventManager.bindEventListeners();

    const mouseDownHandler = rawCanvas.on.mock.calls.find(([eventName]) => eventName === "mouse:down")?.[1];
    const mouseMoveHandler = rawCanvas.on.mock.calls.find(([eventName]) => eventName === "mouse:move")?.[1];
    const mouseUpHandler = rawCanvas.on.mock.calls.find(([eventName]) => eventName === "mouse:up")?.[1];

    mouseDownHandler?.({ e: { altKey: false, ctrlKey: false, clientX: 0, clientY: 0 } });
    mouseMoveHandler?.({ e: { clientX: 0, clientY: 0 } });
    mouseUpHandler?.({ e: {} });
    await Promise.resolve();

    expect(rawController.startSegmentationRegionMove).toHaveBeenCalledWith({ x: 10, y: 10 });
    expect(rawController.continueSegmentationRegionMove).toHaveBeenCalledWith({ x: 13, y: 12 });
    expect(rawController.finishSegmentationRegionMove).toHaveBeenCalledTimes(1);
    expect(rawController.startDrawing).not.toHaveBeenCalled();
  });

  it("passes segmentation scene points through as image pixels", () => {
    const state = createInitialAppState();
    state.session.workflow = "segmentation";
    state.session.currentImage = { width: 800, height: 400 } as HTMLImageElement;
    state.view.currentMode = "draw";
    const elements = createElements();
    const windowRef = new FakeWindow();
    const rawCanvas = createRawCanvas();
    const rawController = createRawController(rawCanvas);
    (rawCanvas as unknown as { getScenePoint: ReturnType<typeof vi.fn> }).getScenePoint = vi.fn(() => ({ x: 400, y: 200 }));

    const eventManager = createEventManagerAdapter({
      state,
      uiManager: createNoopUiManager(elements),
      fileSystem: createNoopFileSystem(),
      canvasController: {
        setMode: vi.fn(),
        raw: rawController
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["canvasController"],
      windowRef
    });

    eventManager.bindEventListeners();

    const mouseDownHandler = rawCanvas.on.mock.calls.find(([eventName]) => eventName === "mouse:down")?.[1];
    mouseDownHandler?.({
      e: { altKey: false, ctrlKey: false, clientX: 0, clientY: 0 }
    });

    expect(rawController.startDrawing).toHaveBeenCalledWith({ x: 400, y: 200 });
    expect(state.view.lastMousePosition).toEqual({ x: 400, y: 200 });
  });

  it("ignores segmentation pointer events outside the displayed image", () => {
    const state = createInitialAppState();
    state.session.workflow = "segmentation";
    state.session.currentImage = { width: 800, height: 400 } as HTMLImageElement;
    state.view.currentMode = "draw";
    const elements = createElements();
    const windowRef = new FakeWindow();
    const rawCanvas = createRawCanvas();
    const rawController = createRawController(rawCanvas);
    (rawCanvas as unknown as { getScenePoint: ReturnType<typeof vi.fn> }).getScenePoint = vi.fn(() => ({ x: 800, y: 120 }));

    const eventManager = createEventManagerAdapter({
      state,
      uiManager: createNoopUiManager(elements),
      fileSystem: createNoopFileSystem(),
      canvasController: {
        setMode: vi.fn(),
        raw: rawController
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["canvasController"],
      windowRef
    });

    eventManager.bindEventListeners();

    const mouseDownHandler = rawCanvas.on.mock.calls.find(([eventName]) => eventName === "mouse:down")?.[1];
    mouseDownHandler?.({
      e: { altKey: false, ctrlKey: false, clientX: 0, clientY: 0 }
    });

    expect(rawController.startDrawing).not.toHaveBeenCalled();
    expect(rawCanvas.selection).toBe(true);
    expect(state.view.lastMousePosition).toEqual({ x: 0, y: 0 });
  });

  it("routes segmentation tool-size slider changes to brush radius updates", () => {
    const state = createInitialAppState();
    state.session.workflow = "segmentation";
    const elements = createElements();
    const windowRef = new FakeWindow();
    const rawCanvas = createRawCanvas();
    const rawController = createRawController(rawCanvas);

    const eventManager = createEventManagerAdapter({
      state,
      uiManager: {
        elements,
        notify: vi.fn(),
        renderImageList: vi.fn(),
        renderPreviewList: vi.fn(),
        updateLabelList: vi.fn(),
        updateMouseCoords: vi.fn(),
        hideMouseCoords: vi.fn(),
        togglePreviewBarVisibility: vi.fn(),
        togglePanel: vi.fn(),
        applyDarkMode: vi.fn(),
        setWorkflow: vi.fn()
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["uiManager"],
      fileSystem: {
        selectImageFolder: vi.fn(async () => {}),
        selectLabelFolder: vi.fn(async () => {}),
        selectClassInfoFolder: vi.fn(async () => {}),
        saveLabels: vi.fn(async () => {}),
        showClassFileContent: vi.fn(async () => {}),
        saveClassFileContent: vi.fn(async () => {}),
        addNewClassRow: vi.fn(),
        createNewClassFile: vi.fn(async () => {}),
        loadClassNamesFromFile: vi.fn(async () => {}),
        navigateImage: vi.fn(async () => {})
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["fileSystem"],
      canvasController: {
        setMode: vi.fn(),
        raw: rawController
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["canvasController"],
      windowRef
    });

    eventManager.bindEventListeners();
    elements.segmentationToolSizeSlider.value = "14";
    elements.segmentationToolSizeSlider.dispatch("input", { currentTarget: elements.segmentationToolSizeSlider });

    expect(rawController.setSegmentationBrushRadius).toHaveBeenCalledWith(14);
  });

  it("uses double-click in segmentation edit mode to open region relabeling", async () => {
    const state = createInitialAppState();
    state.session.workflow = "segmentation";
    state.view.currentMode = "edit";
    const elements = createElements();
    const windowRef = new FakeWindow();
    const rawCanvas = createRawCanvas();
    rawCanvas.getPointer.mockReturnValue({ x: 7, y: 8 });
    const rawController = createRawController(rawCanvas);
    const getSegmentationClassAtPoint = vi.fn(() => "3");
    const relabelSegmentationRegionAtPoint = vi.fn(() => true);
    const promptForLabelClass = vi.fn(async () => "5");

    const eventManager = createEventManagerAdapter({
      state,
      uiManager: {
        elements,
        notify: vi.fn(),
        renderImageList: vi.fn(),
        renderPreviewList: vi.fn(),
        updateLabelList: vi.fn(),
        updateMouseCoords: vi.fn(),
        hideMouseCoords: vi.fn(),
        togglePreviewBarVisibility: vi.fn(),
        togglePanel: vi.fn(),
        applyDarkMode: vi.fn(),
        promptForLabelClass,
        setWorkflow: vi.fn()
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["uiManager"],
      fileSystem: {
        selectImageFolder: vi.fn(async () => {}),
        selectLabelFolder: vi.fn(async () => {}),
        selectClassInfoFolder: vi.fn(async () => {}),
        saveLabels: vi.fn(async () => {}),
        showClassFileContent: vi.fn(async () => {}),
        saveClassFileContent: vi.fn(async () => {}),
        addNewClassRow: vi.fn(),
        createNewClassFile: vi.fn(async () => {}),
        loadClassNamesFromFile: vi.fn(async () => {}),
        navigateImage: vi.fn(async () => {})
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["fileSystem"],
      canvasController: {
        setMode: vi.fn(),
        raw: {
          ...rawController,
          getSegmentationClassAtPoint,
          relabelSegmentationRegionAtPoint
        }
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["canvasController"],
      windowRef
    });

    eventManager.bindEventListeners();

    const doubleClickHandler = rawCanvas.on.mock.calls.find(([eventName]) => eventName === "mouse:dblclick")?.[1];
    doubleClickHandler?.({ e: { clientX: 0, clientY: 0 } });
    await Promise.resolve();
    await Promise.resolve();

    expect(getSegmentationClassAtPoint).toHaveBeenCalledWith({ x: 7, y: 8 });
    expect(promptForLabelClass).toHaveBeenCalledWith("3");
    expect(relabelSegmentationRegionAtPoint).toHaveBeenCalledWith({ x: 7, y: 8 }, "5");
  });

  it("uses the selected segmentation region for the relabel button even when last mouse position is elsewhere", async () => {
    const state = createInitialAppState();
    state.session.workflow = "segmentation";
    state.view.lastMousePosition = { x: 50, y: 60 };
    const elements = createElements();
    const windowRef = new FakeWindow();
    const rawCanvas = createRawCanvas();
    const rawController = createRawController(rawCanvas);
    const promptForLabelClass = vi.fn(async () => "7");
    const getSelectedSegmentationClass = vi.fn(() => "4");
    const relabelSelectedSegmentationRegion = vi.fn(() => true);
    const getSegmentationClassAtPoint = vi.fn(() => "2");
    const relabelSegmentationRegionAtPoint = vi.fn(() => true);

    const eventManager = createEventManagerAdapter({
      state,
      uiManager: {
        elements,
        notify: vi.fn(),
        renderImageList: vi.fn(),
        renderPreviewList: vi.fn(),
        updateLabelList: vi.fn(),
        updateMouseCoords: vi.fn(),
        hideMouseCoords: vi.fn(),
        togglePreviewBarVisibility: vi.fn(),
        togglePanel: vi.fn(),
        applyDarkMode: vi.fn(),
        promptForLabelClass,
        setWorkflow: vi.fn()
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["uiManager"],
      fileSystem: {
        selectImageFolder: vi.fn(async () => {}),
        selectLabelFolder: vi.fn(async () => {}),
        selectClassInfoFolder: vi.fn(async () => {}),
        saveLabels: vi.fn(async () => {}),
        showClassFileContent: vi.fn(async () => {}),
        saveClassFileContent: vi.fn(async () => {}),
        addNewClassRow: vi.fn(),
        createNewClassFile: vi.fn(async () => {}),
        loadClassNamesFromFile: vi.fn(async () => {}),
        navigateImage: vi.fn(async () => {})
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["fileSystem"],
      canvasController: {
        setMode: vi.fn(),
        raw: {
          ...rawController,
          getSelectedSegmentationClass,
          relabelSelectedSegmentationRegion,
          getSegmentationClassAtPoint,
          relabelSegmentationRegionAtPoint
        }
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["canvasController"],
      windowRef
    });

    eventManager.bindEventListeners();
    elements.segmentationRelabelRegionBtn.dispatch("click", {});
    await Promise.resolve();
    await Promise.resolve();

    expect(promptForLabelClass).toHaveBeenCalledWith("4");
    expect(relabelSelectedSegmentationRegion).toHaveBeenCalledWith("7");
    expect(getSegmentationClassAtPoint).not.toHaveBeenCalled();
    expect(relabelSegmentationRegionAtPoint).not.toHaveBeenCalled();
  });

  it("enables align at 2+ visible selected rects and distribute at 3+", () => {
    const state = createInitialAppState();
    const elements = createElements();
    const windowRef = new FakeWindow();
    const rawCanvas = createRawCanvas();
    const rawController = createRawController(rawCanvas);

    const eventManager = createEventManagerAdapter({
      state,
      uiManager: {
        elements,
        notify: vi.fn(),
        renderImageList: vi.fn(),
        renderPreviewList: vi.fn(),
        updateLabelList: vi.fn(),
        updateMouseCoords: vi.fn(),
        hideMouseCoords: vi.fn(),
        togglePreviewBarVisibility: vi.fn(),
        togglePanel: vi.fn(),
        applyDarkMode: vi.fn()
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["uiManager"],
      fileSystem: {
        selectImageFolder: vi.fn(async () => {}),
        selectLabelFolder: vi.fn(async () => {}),
        selectClassInfoFolder: vi.fn(async () => {}),
        saveLabels: vi.fn(async () => {}),
        showClassFileContent: vi.fn(async () => {}),
        saveClassFileContent: vi.fn(async () => {}),
        addNewClassRow: vi.fn(),
        createNewClassFile: vi.fn(async () => {}),
        loadClassNamesFromFile: vi.fn(async () => {}),
        navigateImage: vi.fn(async () => {})
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["fileSystem"],
      canvasController: {
        setMode: vi.fn(),
        raw: rawController
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["canvasController"],
      windowRef
    });

    eventManager.bindEventListeners();

    const selectionCreatedHandler = rawCanvas.on.mock.calls.find(([eventName]) => eventName === "selection:created")?.[1];
    expect(selectionCreatedHandler).toBeTypeOf("function");

    expect(elements.alignLeftBtn.disabled).toBe(true);
    expect(elements.distributeHorizontalBtn.disabled).toBe(true);

    rawCanvas.getActiveObject.mockReturnValue(createRect({ left: 1, top: 1, width: 2, height: 2 }));
    selectionCreatedHandler?.({ e: {} });
    expect(elements.alignLeftBtn.disabled).toBe(true);
    expect(elements.distributeHorizontalBtn.disabled).toBe(true);

    const rectA = createRect({ left: 1, top: 1, width: 2, height: 2 });
    const rectB = createRect({ left: 3, top: 1, width: 2, height: 2 });
    rawCanvas.getActiveObject.mockReturnValue(createActiveSelection([rectA, rectB]));
    selectionCreatedHandler?.({ e: {} });
    expect(elements.alignLeftBtn.disabled).toBe(false);
    expect(elements.alignRightBtn.disabled).toBe(false);
    expect(elements.alignTopBtn.disabled).toBe(false);
    expect(elements.alignBottomBtn.disabled).toBe(false);
    expect(elements.distributeHorizontalBtn.disabled).toBe(true);
    expect(elements.distributeVerticalBtn.disabled).toBe(true);

    const rectC = createRect({ left: 5, top: 1, width: 2, height: 2 });
    rawCanvas.getActiveObject.mockReturnValue(createActiveSelection([rectA, rectB, rectC]));
    selectionCreatedHandler?.({ e: {} });
    expect(elements.distributeHorizontalBtn.disabled).toBe(false);
    expect(elements.distributeVerticalBtn.disabled).toBe(false);

    rectC.visible = false;
    rawCanvas.getActiveObject.mockReturnValue(createActiveSelection([rectA, rectB, rectC]));
    selectionCreatedHandler?.({ e: {} });
    expect(elements.alignLeftBtn.disabled).toBe(false);
    expect(elements.distributeHorizontalBtn.disabled).toBe(true);
  });

  it("routes Alt+Shift arrange shortcuts and suppresses them in editable targets", () => {
    const state = createInitialAppState();
    const elements = createElements();
    const windowRef = new FakeWindow();
    const rawCanvas = createRawCanvas();
    const rawController = createRawController(rawCanvas);

    const eventManager = createEventManagerAdapter({
      state,
      uiManager: {
        elements,
        notify: vi.fn(),
        renderImageList: vi.fn(),
        renderPreviewList: vi.fn(),
        updateLabelList: vi.fn(),
        updateMouseCoords: vi.fn(),
        hideMouseCoords: vi.fn(),
        togglePreviewBarVisibility: vi.fn(),
        togglePanel: vi.fn(),
        applyDarkMode: vi.fn()
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["uiManager"],
      fileSystem: {
        selectImageFolder: vi.fn(async () => {}),
        selectLabelFolder: vi.fn(async () => {}),
        selectClassInfoFolder: vi.fn(async () => {}),
        saveLabels: vi.fn(async () => {}),
        showClassFileContent: vi.fn(async () => {}),
        saveClassFileContent: vi.fn(async () => {}),
        addNewClassRow: vi.fn(),
        createNewClassFile: vi.fn(async () => {}),
        loadClassNamesFromFile: vi.fn(async () => {}),
        navigateImage: vi.fn(async () => {})
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["fileSystem"],
      canvasController: {
        setMode: vi.fn(),
        raw: rawController
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["canvasController"],
      windowRef
    });

    eventManager.bindEventListeners();

    const dispatchShortcut = (key: string): ReturnType<typeof vi.fn> => {
      const preventDefault = vi.fn();
      windowRef.keydownListener?.({
        altKey: true,
        shiftKey: true,
        ctrlKey: false,
        metaKey: false,
        key,
        target: new FakeHtmlElement(),
        preventDefault
      });
      return preventDefault;
    };

    expect(dispatchShortcut("L")).toHaveBeenCalledTimes(1);
    expect(dispatchShortcut("R")).toHaveBeenCalledTimes(1);
    expect(dispatchShortcut("T")).toHaveBeenCalledTimes(1);
    expect(dispatchShortcut("D")).toHaveBeenCalledTimes(1);
    expect(dispatchShortcut("H")).toHaveBeenCalledTimes(1);
    expect(dispatchShortcut("V")).toHaveBeenCalledTimes(1);

    expect(rawController.alignSelectionLeft).toHaveBeenCalledTimes(1);
    expect(rawController.alignSelectionRight).toHaveBeenCalledTimes(1);
    expect(rawController.alignSelectionTop).toHaveBeenCalledTimes(1);
    expect(rawController.alignSelectionBottom).toHaveBeenCalledTimes(1);
    expect(rawController.distributeSelectionHorizontally).toHaveBeenCalledTimes(1);
    expect(rawController.distributeSelectionVertically).toHaveBeenCalledTimes(1);

    const preventDefault = vi.fn();
    windowRef.keydownListener?.({
      altKey: true,
      shiftKey: true,
      ctrlKey: false,
      metaKey: false,
      key: "L",
      target: new FakeInputElement(),
      preventDefault
    });

    expect(preventDefault).not.toHaveBeenCalled();
    expect(rawController.alignSelectionLeft).toHaveBeenCalledTimes(1);
  });

  it("wires undo/redo buttons and keyboard shortcuts with editable-focus guard", () => {
    const state = createInitialAppState();
    const elements = createElements();
    const windowRef = new FakeWindow();
    const rawCanvas = createRawCanvas();
    const rawController = createRawController(rawCanvas);

    let canUndo = true;
    let canRedo = false;
    rawController.canUndo.mockImplementation(() => canUndo);
    rawController.canRedo.mockImplementation(() => canRedo);
    rawController.undo.mockImplementation(() => {
      canUndo = false;
      canRedo = true;
    });
    rawController.redo.mockImplementation(() => {
      canUndo = true;
      canRedo = false;
    });

    const eventManager = createEventManagerAdapter({
      state,
      uiManager: {
        elements,
        notify: vi.fn(),
        renderImageList: vi.fn(),
        renderPreviewList: vi.fn(),
        updateLabelList: vi.fn(),
        updateMouseCoords: vi.fn(),
        hideMouseCoords: vi.fn(),
        togglePreviewBarVisibility: vi.fn(),
        togglePanel: vi.fn(),
        applyDarkMode: vi.fn()
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["uiManager"],
      fileSystem: {
        selectImageFolder: vi.fn(async () => {}),
        selectLabelFolder: vi.fn(async () => {}),
        selectClassInfoFolder: vi.fn(async () => {}),
        saveLabels: vi.fn(async () => {}),
        showClassFileContent: vi.fn(async () => {}),
        saveClassFileContent: vi.fn(async () => {}),
        addNewClassRow: vi.fn(),
        createNewClassFile: vi.fn(async () => {}),
        loadClassNamesFromFile: vi.fn(async () => {}),
        navigateImage: vi.fn(async () => {})
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["fileSystem"],
      canvasController: {
        setMode: vi.fn(),
        raw: rawController
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["canvasController"],
      windowRef
    });

    eventManager.bindEventListeners();

    expect(elements.undoBtn.disabled).toBe(false);
    expect(elements.redoBtn.disabled).toBe(true);

    elements.undoBtn.dispatch("click", {});
    expect(rawController.undo).toHaveBeenCalledTimes(1);
    expect(elements.undoBtn.disabled).toBe(true);
    expect(elements.redoBtn.disabled).toBe(false);

    elements.redoBtn.dispatch("click", {});
    expect(rawController.redo).toHaveBeenCalledTimes(1);
    expect(elements.undoBtn.disabled).toBe(false);
    expect(elements.redoBtn.disabled).toBe(true);

    const ctrlZPrevent = vi.fn();
    windowRef.keydownListener?.({
      ctrlKey: true,
      metaKey: false,
      shiftKey: false,
      altKey: false,
      key: "z",
      target: new FakeHtmlElement(),
      preventDefault: ctrlZPrevent
    });
    expect(ctrlZPrevent).toHaveBeenCalledTimes(1);
    expect(rawController.undo).toHaveBeenCalledTimes(2);

    const ctrlShiftZPrevent = vi.fn();
    windowRef.keydownListener?.({
      ctrlKey: true,
      metaKey: false,
      shiftKey: true,
      altKey: false,
      key: "z",
      target: new FakeHtmlElement(),
      preventDefault: ctrlShiftZPrevent
    });
    expect(ctrlShiftZPrevent).toHaveBeenCalledTimes(1);
    expect(rawController.redo).toHaveBeenCalledTimes(2);

    const ctrlYPrevent = vi.fn();
    windowRef.keydownListener?.({
      ctrlKey: true,
      metaKey: false,
      shiftKey: false,
      altKey: false,
      key: "y",
      target: new FakeHtmlElement(),
      preventDefault: ctrlYPrevent
    });
    expect(ctrlYPrevent).toHaveBeenCalledTimes(1);
    expect(rawController.redo).toHaveBeenCalledTimes(3);

    const metaYPrevent = vi.fn();
    windowRef.keydownListener?.({
      ctrlKey: false,
      metaKey: true,
      shiftKey: false,
      altKey: false,
      key: "y",
      target: new FakeHtmlElement(),
      preventDefault: metaYPrevent
    });
    expect(metaYPrevent).not.toHaveBeenCalled();
    expect(rawController.redo).toHaveBeenCalledTimes(3);

    const editablePrevent = vi.fn();
    windowRef.keydownListener?.({
      ctrlKey: true,
      metaKey: false,
      shiftKey: false,
      altKey: false,
      key: "z",
      target: new FakeInputElement(),
      preventDefault: editablePrevent
    });
    expect(editablePrevent).not.toHaveBeenCalled();
    expect(rawController.undo).toHaveBeenCalledTimes(2);
  });

  it("re-syncs undo/redo disabled state after async image load/navigation operations", async () => {
    const state = createInitialAppState();
    const elements = createElements();
    const windowRef = new FakeWindow();
    const rawCanvas = createRawCanvas();
    const rawController = createRawController(rawCanvas);

    let canUndo = true;
    rawController.canUndo.mockImplementation(() => canUndo);
    rawController.canRedo.mockImplementation(() => false);

    const selectImageFolder = vi.fn(async () => {
      canUndo = false;
    });
    const navigateImage = vi.fn(async () => {
      canUndo = false;
    });

    const eventManager = createEventManagerAdapter({
      state,
      uiManager: {
        elements,
        notify: vi.fn(),
        renderImageList: vi.fn(),
        renderPreviewList: vi.fn(),
        updateLabelList: vi.fn(),
        updateMouseCoords: vi.fn(),
        hideMouseCoords: vi.fn(),
        togglePreviewBarVisibility: vi.fn(),
        togglePanel: vi.fn(),
        applyDarkMode: vi.fn()
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["uiManager"],
      fileSystem: {
        selectImageFolder,
        selectLabelFolder: vi.fn(async () => {}),
        selectClassInfoFolder: vi.fn(async () => {}),
        saveLabels: vi.fn(async () => {}),
        showClassFileContent: vi.fn(async () => {}),
        saveClassFileContent: vi.fn(async () => {}),
        addNewClassRow: vi.fn(),
        createNewClassFile: vi.fn(async () => {}),
        loadClassNamesFromFile: vi.fn(async () => {}),
        navigateImage
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["fileSystem"],
      canvasController: {
        setMode: vi.fn(),
        raw: rawController
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["canvasController"],
      windowRef
    });

    eventManager.bindEventListeners();
    expect(elements.undoBtn.disabled).toBe(false);

    elements.selectImageFolderBtn.dispatch("click", {});
    await Promise.resolve();
    await Promise.resolve();
    expect(selectImageFolder).toHaveBeenCalledTimes(1);
    expect(elements.undoBtn.disabled).toBe(true);

    canUndo = true;
    elements.nextImageBtn.dispatch("click", {});
    await Promise.resolve();
    await Promise.resolve();
    expect(navigateImage).toHaveBeenCalledTimes(1);
    expect(elements.undoBtn.disabled).toBe(true);
  });

  it("captures one edit-gesture baseline and finalizes exactly once across modified/scaled callbacks", () => {
    const state = createInitialAppState();
    const elements = createElements();
    const windowRef = new FakeWindow();
    const rawCanvas = createRawCanvas();
    rawCanvas.getPointer.mockReturnValue({ x: 100, y: 200 });
    const rawController = createRawController(rawCanvas);
    const targetRect = createRect({ left: 1, top: 2, width: 3, height: 4, labelClass: "7" });

    const eventManager = createEventManagerAdapter({
      state,
      uiManager: {
        elements,
        notify: vi.fn(),
        renderImageList: vi.fn(),
        renderPreviewList: vi.fn(),
        updateLabelList: vi.fn(),
        updateMouseCoords: vi.fn(),
        hideMouseCoords: vi.fn(),
        togglePreviewBarVisibility: vi.fn(),
        togglePanel: vi.fn(),
        applyDarkMode: vi.fn()
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["uiManager"],
      fileSystem: {
        selectImageFolder: vi.fn(async () => {}),
        selectLabelFolder: vi.fn(async () => {}),
        selectClassInfoFolder: vi.fn(async () => {}),
        saveLabels: vi.fn(async () => {}),
        showClassFileContent: vi.fn(async () => {}),
        saveClassFileContent: vi.fn(async () => {}),
        addNewClassRow: vi.fn(),
        createNewClassFile: vi.fn(async () => {}),
        loadClassNamesFromFile: vi.fn(async () => {}),
        navigateImage: vi.fn(async () => {})
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["fileSystem"],
      canvasController: {
        setMode: vi.fn(),
        raw: rawController
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["canvasController"],
      windowRef
    });

    eventManager.bindEventListeners();

    const mouseDownHandler = rawCanvas.on.mock.calls.find(([eventName]) => eventName === "mouse:down")?.[1];
    const objectModifiedHandler = rawCanvas.on.mock.calls.find(([eventName]) => eventName === "object:modified")?.[1];
    const objectScaledHandler = rawCanvas.on.mock.calls.find(([eventName]) => eventName === "object:scaled")?.[1];

    mouseDownHandler?.({
      e: { altKey: false, ctrlKey: false, clientX: 10, clientY: 20 },
      target: targetRect
    });
    objectModifiedHandler?.({ e: {} });
    objectScaledHandler?.({ e: {} });

    expect(rawController.captureHistoryBaseline).toHaveBeenCalledTimes(1);
    expect(rawController.commitHistoryFromBaseline).toHaveBeenCalledTimes(1);
    expect(rawController.startDrawing).toHaveBeenCalledTimes(1);
  });

  it("clamps mouse-wheel zoom change to at most 50% per event", () => {
    const state = createInitialAppState();
    const elements = createElements();
    const windowRef = new FakeWindow();
    const rawCanvas = createRawCanvas();
    const rawController = createRawController(rawCanvas);
    const updateZoomDisplay = vi.fn();

    const eventManager = createEventManagerAdapter({
      state,
      uiManager: {
        elements,
        notify: vi.fn(),
        renderImageList: vi.fn(),
        renderPreviewList: vi.fn(),
        updateLabelList: vi.fn(),
        updateMouseCoords: vi.fn(),
        hideMouseCoords: vi.fn(),
        togglePreviewBarVisibility: vi.fn(),
        togglePanel: vi.fn(),
        applyDarkMode: vi.fn(),
        updateZoomDisplay
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["uiManager"],
      fileSystem: {
        selectImageFolder: vi.fn(async () => {}),
        selectLabelFolder: vi.fn(async () => {}),
        selectClassInfoFolder: vi.fn(async () => {}),
        saveLabels: vi.fn(async () => {}),
        showClassFileContent: vi.fn(async () => {}),
        saveClassFileContent: vi.fn(async () => {}),
        addNewClassRow: vi.fn(),
        createNewClassFile: vi.fn(async () => {}),
        loadClassNamesFromFile: vi.fn(async () => {}),
        navigateImage: vi.fn(async () => {})
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["fileSystem"],
      canvasController: {
        setMode: vi.fn(),
        raw: rawController
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["canvasController"],
      windowRef
    });

    eventManager.bindEventListeners();

    const wheelHandler = rawCanvas.on.mock.calls.find(([eventName]) => eventName === "mouse:wheel")?.[1];
    expect(wheelHandler).toBeTypeOf("function");

    const preventDefault = vi.fn();
    const stopPropagation = vi.fn();

    rawCanvas.getZoom.mockReturnValue(1);
    wheelHandler?.({
      e: {
        deltaY: -5000,
        offsetX: 10,
        offsetY: 20,
        preventDefault,
        stopPropagation
      }
    });

    expect(rawCanvas.zoomToPoint).toHaveBeenCalledWith({ x: 10, y: 20 }, 1.5);

    rawCanvas.getZoom.mockReturnValue(1);
    wheelHandler?.({
      e: {
        deltaY: 5000,
        offsetX: 30,
        offsetY: 40,
        preventDefault,
        stopPropagation
      }
    });

    expect(rawCanvas.zoomToPoint).toHaveBeenLastCalledWith({ x: 30, y: 40 }, 0.5);
    expect(preventDefault).toHaveBeenCalledTimes(2);
    expect(stopPropagation).toHaveBeenCalledTimes(2);
    expect(updateZoomDisplay).toHaveBeenCalledTimes(2);
  });

  it("records one nudge history step per arrow-key keydown", () => {
    const state = createInitialAppState();
    const elements = createElements();
    const windowRef = new FakeWindow();
    const rawCanvas = createRawCanvas();
    const rawController = createRawController(rawCanvas);
    const rectA = createRect({ left: 10, top: 10, width: 10, height: 10, labelClass: "1" });
    const rectB = createRect({ left: 30, top: 30, width: 10, height: 10, labelClass: "2" });
    const activeSelection = createActiveSelection([rectA, rectB]);
    rawCanvas.getActiveObject.mockReturnValue(activeSelection);

    const eventManager = createEventManagerAdapter({
      state,
      uiManager: {
        elements,
        notify: vi.fn(),
        renderImageList: vi.fn(),
        renderPreviewList: vi.fn(),
        updateLabelList: vi.fn(),
        updateMouseCoords: vi.fn(),
        hideMouseCoords: vi.fn(),
        togglePreviewBarVisibility: vi.fn(),
        togglePanel: vi.fn(),
        applyDarkMode: vi.fn()
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["uiManager"],
      fileSystem: {
        selectImageFolder: vi.fn(async () => {}),
        selectLabelFolder: vi.fn(async () => {}),
        selectClassInfoFolder: vi.fn(async () => {}),
        saveLabels: vi.fn(async () => {}),
        showClassFileContent: vi.fn(async () => {}),
        saveClassFileContent: vi.fn(async () => {}),
        addNewClassRow: vi.fn(),
        createNewClassFile: vi.fn(async () => {}),
        loadClassNamesFromFile: vi.fn(async () => {}),
        navigateImage: vi.fn(async () => {})
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["fileSystem"],
      canvasController: {
        setMode: vi.fn(),
        raw: rawController
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["canvasController"],
      windowRef
    });

    eventManager.bindEventListeners();

    const preventDefault = vi.fn();
    windowRef.keydownListener?.({
      key: "ArrowRight",
      shiftKey: false,
      ctrlKey: false,
      metaKey: false,
      altKey: false,
      target: new FakeHtmlElement(),
      preventDefault
    });

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(rawController.captureHistoryBaseline).toHaveBeenCalledTimes(1);
    expect(rawController.commitHistoryFromBaseline).toHaveBeenCalledTimes(1);
  });

  it("routes Delete/Backspace to segmentation region deletion in segmentation edit mode", () => {
    const state = createInitialAppState();
    state.session.workflow = "segmentation";
    state.view.currentMode = "edit";
    const elements = createElements();
    const windowRef = new FakeWindow();
    const rawCanvas = createRawCanvas();
    const rawController = createRawController(rawCanvas);
    rawController.deleteSelectedSegmentationRegion
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    const setWorkflow = vi.fn();
    const updateLabelList = vi.fn();

    const eventManager = createEventManagerAdapter({
      state,
      uiManager: {
        elements,
        notify: vi.fn(),
        renderImageList: vi.fn(),
        renderPreviewList: vi.fn(),
        updateLabelList,
        updateMouseCoords: vi.fn(),
        hideMouseCoords: vi.fn(),
        togglePreviewBarVisibility: vi.fn(),
        togglePanel: vi.fn(),
        applyDarkMode: vi.fn(),
        setWorkflow
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["uiManager"],
      fileSystem: {
        selectImageFolder: vi.fn(async () => {}),
        selectLabelFolder: vi.fn(async () => {}),
        selectClassInfoFolder: vi.fn(async () => {}),
        saveLabels: vi.fn(async () => {}),
        showClassFileContent: vi.fn(async () => {}),
        saveClassFileContent: vi.fn(async () => {}),
        addNewClassRow: vi.fn(),
        createNewClassFile: vi.fn(async () => {}),
        loadClassNamesFromFile: vi.fn(async () => {}),
        navigateImage: vi.fn(async () => {})
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["fileSystem"],
      canvasController: {
        setMode: vi.fn(),
        raw: rawController
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["canvasController"],
      windowRef
    });

    eventManager.bindEventListeners();

    const deletePrevent = vi.fn();
    windowRef.keydownListener?.({
      key: "Delete",
      ctrlKey: false,
      metaKey: false,
      altKey: false,
      shiftKey: false,
      target: new FakeHtmlElement(),
      preventDefault: deletePrevent
    });

    const backspacePrevent = vi.fn();
    windowRef.keydownListener?.({
      key: "Backspace",
      ctrlKey: false,
      metaKey: false,
      altKey: false,
      shiftKey: false,
      target: new FakeHtmlElement(),
      preventDefault: backspacePrevent
    });

    expect(deletePrevent).toHaveBeenCalledTimes(1);
    expect(backspacePrevent).toHaveBeenCalledTimes(1);
    expect(rawController.deleteSelectedSegmentationRegion).toHaveBeenCalledTimes(2);
    expect(rawController.deleteSelection).not.toHaveBeenCalled();
    expect(setWorkflow).toHaveBeenCalledTimes(1);
    expect(setWorkflow).toHaveBeenCalledWith("segmentation");
    expect(updateLabelList).toHaveBeenCalledTimes(1);
  });

  it("routes numeric shortcuts to segmentation tool/class controls", () => {
    const state = createInitialAppState();
    state.session.workflow = "segmentation";
    const elements = createElements();
    const windowRef = new FakeWindow();
    const rawCanvas = createRawCanvas();
    const rawController = createRawController(rawCanvas);
    const setWorkflow = vi.fn();

    const eventManager = createEventManagerAdapter({
      state,
      uiManager: {
        elements,
        notify: vi.fn(),
        renderImageList: vi.fn(),
        renderPreviewList: vi.fn(),
        updateLabelList: vi.fn(),
        updateMouseCoords: vi.fn(),
        hideMouseCoords: vi.fn(),
        togglePreviewBarVisibility: vi.fn(),
        togglePanel: vi.fn(),
        applyDarkMode: vi.fn(),
        setWorkflow
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["uiManager"],
      fileSystem: {
        selectImageFolder: vi.fn(async () => {}),
        selectLabelFolder: vi.fn(async () => {}),
        selectClassInfoFolder: vi.fn(async () => {}),
        saveLabels: vi.fn(async () => {}),
        showClassFileContent: vi.fn(async () => {}),
        saveClassFileContent: vi.fn(async () => {}),
        addNewClassRow: vi.fn(),
        createNewClassFile: vi.fn(async () => {}),
        loadClassNamesFromFile: vi.fn(async () => {}),
        navigateImage: vi.fn(async () => {})
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["fileSystem"],
      canvasController: {
        setMode: vi.fn(),
        raw: rawController
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["canvasController"],
      windowRef
    });

    eventManager.bindEventListeners();

    const zeroPrevent = vi.fn();
    windowRef.keydownListener?.({
      key: "0",
      ctrlKey: false,
      metaKey: false,
      altKey: false,
      shiftKey: false,
      target: new FakeHtmlElement(),
      preventDefault: zeroPrevent
    });

    const fourPrevent = vi.fn();
    windowRef.keydownListener?.({
      key: "4",
      ctrlKey: false,
      metaKey: false,
      altKey: false,
      shiftKey: false,
      target: new FakeHtmlElement(),
      preventDefault: fourPrevent
    });

    const ctrlPrevent = vi.fn();
    windowRef.keydownListener?.({
      key: "5",
      ctrlKey: true,
      metaKey: false,
      altKey: false,
      shiftKey: false,
      target: new FakeHtmlElement(),
      preventDefault: ctrlPrevent
    });

    expect(zeroPrevent).toHaveBeenCalledTimes(1);
    expect(fourPrevent).toHaveBeenCalledTimes(1);
    expect(ctrlPrevent).not.toHaveBeenCalled();
    expect(rawController.setSegmentationTool).toHaveBeenNthCalledWith(1, "erase");
    expect(rawController.setSegmentationActiveClass).toHaveBeenCalledWith("4");
    expect(rawController.setSegmentationTool).toHaveBeenNthCalledWith(2, "brush");
    expect(rawController.setSelectedLabelClass).not.toHaveBeenCalled();
    expect(setWorkflow).toHaveBeenCalledTimes(2);
  });

  it("routes numeric shortcuts to detection selected-label class changes", () => {
    const state = createInitialAppState();
    state.session.workflow = "detection";
    const elements = createElements();
    const windowRef = new FakeWindow();
    const rawCanvas = createRawCanvas();
    const rawController = createRawController(rawCanvas);
    rawController.setSelectedLabelClass
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

    const eventManager = createEventManagerAdapter({
      state,
      uiManager: {
        elements,
        notify: vi.fn(),
        renderImageList: vi.fn(),
        renderPreviewList: vi.fn(),
        updateLabelList: vi.fn(),
        updateMouseCoords: vi.fn(),
        hideMouseCoords: vi.fn(),
        togglePreviewBarVisibility: vi.fn(),
        togglePanel: vi.fn(),
        applyDarkMode: vi.fn(),
        setWorkflow: vi.fn()
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["uiManager"],
      fileSystem: {
        selectImageFolder: vi.fn(async () => {}),
        selectLabelFolder: vi.fn(async () => {}),
        selectClassInfoFolder: vi.fn(async () => {}),
        saveLabels: vi.fn(async () => {}),
        showClassFileContent: vi.fn(async () => {}),
        saveClassFileContent: vi.fn(async () => {}),
        addNewClassRow: vi.fn(),
        createNewClassFile: vi.fn(async () => {}),
        loadClassNamesFromFile: vi.fn(async () => {}),
        navigateImage: vi.fn(async () => {})
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["fileSystem"],
      canvasController: {
        setMode: vi.fn(),
        raw: rawController
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["canvasController"],
      windowRef
    });

    eventManager.bindEventListeners();

    const sevenPrevent = vi.fn();
    windowRef.keydownListener?.({
      key: "7",
      ctrlKey: false,
      metaKey: false,
      altKey: false,
      shiftKey: false,
      target: new FakeHtmlElement(),
      preventDefault: sevenPrevent
    });

    const twoPrevent = vi.fn();
    windowRef.keydownListener?.({
      key: "2",
      ctrlKey: false,
      metaKey: false,
      altKey: false,
      shiftKey: false,
      target: new FakeHtmlElement(),
      preventDefault: twoPrevent
    });

    const altPrevent = vi.fn();
    windowRef.keydownListener?.({
      key: "3",
      ctrlKey: false,
      metaKey: false,
      altKey: true,
      shiftKey: false,
      target: new FakeHtmlElement(),
      preventDefault: altPrevent
    });

    expect(sevenPrevent).toHaveBeenCalledTimes(1);
    expect(twoPrevent).toHaveBeenCalledTimes(1);
    expect(altPrevent).not.toHaveBeenCalled();
    expect(rawController.setSelectedLabelClass).toHaveBeenNthCalledWith(1, "7");
    expect(rawController.setSelectedLabelClass).toHaveBeenNthCalledWith(2, "2");
    expect(rawController.setSegmentationTool).not.toHaveBeenCalled();
  });

  it("wires segmentation auto-fill toggle to controller state and workflow refresh", () => {
    const state = createInitialAppState();
    state.session.workflow = "segmentation";
    const elements = createElements();
    const windowRef = new FakeWindow();
    const rawCanvas = createRawCanvas();
    const rawController = createRawController(rawCanvas);
    const setWorkflow = vi.fn();

    const eventManager = createEventManagerAdapter({
      state,
      uiManager: {
        elements,
        notify: vi.fn(),
        renderImageList: vi.fn(),
        renderPreviewList: vi.fn(),
        updateLabelList: vi.fn(),
        updateMouseCoords: vi.fn(),
        hideMouseCoords: vi.fn(),
        togglePreviewBarVisibility: vi.fn(),
        togglePanel: vi.fn(),
        applyDarkMode: vi.fn(),
        setWorkflow
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["uiManager"],
      fileSystem: {
        selectImageFolder: vi.fn(async () => {}),
        selectLabelFolder: vi.fn(async () => {}),
        selectClassInfoFolder: vi.fn(async () => {}),
        saveLabels: vi.fn(async () => {}),
        showClassFileContent: vi.fn(async () => {}),
        saveClassFileContent: vi.fn(async () => {}),
        addNewClassRow: vi.fn(),
        createNewClassFile: vi.fn(async () => {}),
        loadClassNamesFromFile: vi.fn(async () => {}),
        navigateImage: vi.fn(async () => {})
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["fileSystem"],
      canvasController: {
        setMode: vi.fn(),
        raw: rawController
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["canvasController"],
      windowRef
    });

    eventManager.bindEventListeners();
    elements.segmentationAutoFillClosedRegionToggle.checked = true;
    elements.segmentationAutoFillClosedRegionToggle.dispatch("change", {
      currentTarget: elements.segmentationAutoFillClosedRegionToggle
    });

    elements.segmentationAutoFillClosedRegionToggle.checked = false;
    elements.segmentationAutoFillClosedRegionToggle.dispatch("change", {
      currentTarget: elements.segmentationAutoFillClosedRegionToggle
    });

    expect(rawController.setSegmentationAutoFillClosedRegionEnabled).toHaveBeenNthCalledWith(1, true);
    expect(rawController.setSegmentationAutoFillClosedRegionEnabled).toHaveBeenNthCalledWith(2, false);
    expect(setWorkflow).toHaveBeenCalledTimes(2);
    expect(setWorkflow).toHaveBeenCalledWith("segmentation");
  });

  it("routes Ctrl+B to pointer-based segmentation relabel when no region is selected", async () => {
    const state = createInitialAppState();
    state.session.workflow = "segmentation";
    state.view.lastMousePosition = { x: 11, y: 13 };
    const elements = createElements();
    const windowRef = new FakeWindow();
    const rawCanvas = createRawCanvas();
    const rawController = createRawController(rawCanvas);
    const getSegmentationClassAtPoint = vi.fn(() => "2");
    const relabelSegmentationRegionAtPoint = vi.fn(() => true);
    const promptForLabelClass = vi.fn(async () => "5");
    const notify = vi.fn();

    const eventManager = createEventManagerAdapter({
      state,
      uiManager: {
        elements,
        notify,
        renderImageList: vi.fn(),
        renderPreviewList: vi.fn(),
        updateLabelList: vi.fn(),
        updateMouseCoords: vi.fn(),
        hideMouseCoords: vi.fn(),
        togglePreviewBarVisibility: vi.fn(),
        togglePanel: vi.fn(),
        applyDarkMode: vi.fn(),
        promptForLabelClass,
        setWorkflow: vi.fn()
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["uiManager"],
      fileSystem: {
        selectImageFolder: vi.fn(async () => {}),
        selectLabelFolder: vi.fn(async () => {}),
        selectClassInfoFolder: vi.fn(async () => {}),
        saveLabels: vi.fn(async () => {}),
        showClassFileContent: vi.fn(async () => {}),
        saveClassFileContent: vi.fn(async () => {}),
        addNewClassRow: vi.fn(),
        createNewClassFile: vi.fn(async () => {}),
        loadClassNamesFromFile: vi.fn(async () => {}),
        navigateImage: vi.fn(async () => {})
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["fileSystem"],
      canvasController: {
        setMode: vi.fn(),
        raw: {
          ...rawController,
          getSegmentationClassAtPoint,
          relabelSegmentationRegionAtPoint
        }
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["canvasController"],
      windowRef
    });

    eventManager.bindEventListeners();

    const preventDefault = vi.fn();
    windowRef.keydownListener?.({
      ctrlKey: true,
      metaKey: false,
      key: "b",
      target: new FakeHtmlElement(),
      preventDefault
    });
    await Promise.resolve();
    await Promise.resolve();

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(getSegmentationClassAtPoint).toHaveBeenCalledWith({ x: 11, y: 13 });
    expect(promptForLabelClass).toHaveBeenCalledWith("2");
    expect(relabelSegmentationRegionAtPoint).toHaveBeenCalledWith({ x: 11, y: 13 }, "5");
    expect(notify).not.toHaveBeenCalled();
  });

  it("routes Ctrl+B to the selected segmentation region before falling back to pointer state", async () => {
    const state = createInitialAppState();
    state.session.workflow = "segmentation";
    state.view.lastMousePosition = { x: 11, y: 13 };
    const elements = createElements();
    const windowRef = new FakeWindow();
    const rawCanvas = createRawCanvas();
    const rawController = createRawController(rawCanvas);
    const getSelectedSegmentationClass = vi.fn(() => "6");
    const relabelSelectedSegmentationRegion = vi.fn(() => true);
    const getSegmentationClassAtPoint = vi.fn(() => "2");
    const relabelSegmentationRegionAtPoint = vi.fn(() => true);
    const promptForLabelClass = vi.fn(async () => "8");

    const eventManager = createEventManagerAdapter({
      state,
      uiManager: {
        elements,
        notify: vi.fn(),
        renderImageList: vi.fn(),
        renderPreviewList: vi.fn(),
        updateLabelList: vi.fn(),
        updateMouseCoords: vi.fn(),
        hideMouseCoords: vi.fn(),
        togglePreviewBarVisibility: vi.fn(),
        togglePanel: vi.fn(),
        applyDarkMode: vi.fn(),
        promptForLabelClass,
        setWorkflow: vi.fn()
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["uiManager"],
      fileSystem: {
        selectImageFolder: vi.fn(async () => {}),
        selectLabelFolder: vi.fn(async () => {}),
        selectClassInfoFolder: vi.fn(async () => {}),
        saveLabels: vi.fn(async () => {}),
        showClassFileContent: vi.fn(async () => {}),
        saveClassFileContent: vi.fn(async () => {}),
        addNewClassRow: vi.fn(),
        createNewClassFile: vi.fn(async () => {}),
        loadClassNamesFromFile: vi.fn(async () => {}),
        navigateImage: vi.fn(async () => {})
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["fileSystem"],
      canvasController: {
        setMode: vi.fn(),
        raw: {
          ...rawController,
          getSelectedSegmentationClass,
          relabelSelectedSegmentationRegion,
          getSegmentationClassAtPoint,
          relabelSegmentationRegionAtPoint
        }
      } as unknown as Parameters<typeof createEventManagerAdapter>[0]["canvasController"],
      windowRef
    });

    eventManager.bindEventListeners();

    const preventDefault = vi.fn();
    windowRef.keydownListener?.({
      ctrlKey: true,
      metaKey: false,
      key: "b",
      target: new FakeHtmlElement(),
      preventDefault
    });
    await Promise.resolve();
    await Promise.resolve();

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(promptForLabelClass).toHaveBeenCalledWith("6");
    expect(relabelSelectedSegmentationRegion).toHaveBeenCalledWith("8");
    expect(getSegmentationClassAtPoint).not.toHaveBeenCalled();
    expect(relabelSegmentationRegionAtPoint).not.toHaveBeenCalled();
  });

});
