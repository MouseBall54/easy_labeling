import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createInitialAppState } from "../../../src/app/state.js";
import { createEventManagerAdapter } from "../../../src/bootstrap/event-manager-adapter.js";
import { createRect } from "../features/canvas/test-fakes.js";

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
    downloadClassesBtn: new FakeHtmlElement(),
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
    highlightSelection: vi.fn(),
    hideCrosshair: vi.fn(),
    updateLabelText: vi.fn(),
    copy: vi.fn(),
    paste: vi.fn(),
    selectAllLabels: vi.fn(),
    editLabel: vi.fn(async () => {}),
    editMultipleLabels: vi.fn(async () => {}),
    removeObject: vi.fn(),
    renderAll: rawCanvas.renderAll
  };
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
        downloadClassTemplate: vi.fn(async () => {}),
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
        downloadClassTemplate: vi.fn(async () => {}),
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
        downloadClassTemplate: vi.fn(async () => {}),
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
  });
});
