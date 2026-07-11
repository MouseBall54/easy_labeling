import { beforeEach, describe, expect, it, vi } from "vitest";

import { createInitialAppState } from "../../../src/app/state.js";
import { createUiManagerAdapter } from "../../../src/bootstrap/ui-manager-adapter.js";

const getDOMElementsMock = vi.fn();
const renderLabelFiltersMock = vi.fn((input: {
  labelFiltersElement: FakeElement;
  rects: Array<{ labelClass: string }>;
  activeFilterKeys?: ReadonlySet<string>;
  isAllActive?: boolean;
}) => {
  input.labelFiltersElement.innerHTML = "";
});
const renderSelectByClassDropdownMock = vi.fn();
const renderImageListMock = vi.fn((input: unknown) => { void input; return []; });
const renderPreviewListMock = vi.fn((input: unknown) => { void input; return []; });
const renderWorkflowPanelsMock = vi.fn((input: unknown) => { void input; });

vi.mock("../../../src/ui/dom-elements.js", () => ({
  getDOMElements: (...args: unknown[]) => getDOMElementsMock(...args)
}));

vi.mock("../../../src/ui/renderers.js", () => ({
  bindLabelFilterEvents: vi.fn(),
  renderClassFileSelect: vi.fn(),
  renderImageList: (input: unknown) => renderImageListMock(input),
  renderLabelFilters: (input: unknown) => {
    renderLabelFiltersMock(input as { labelFiltersElement: FakeElement; rects: Array<{ labelClass: string }> });
  },
  renderPreviewList: (input: unknown) => renderPreviewListMock(input),
  renderSelectByClassDropdown: (...args: unknown[]) => renderSelectByClassDropdownMock(...args),
  renderWorkflowPanels: (input: unknown) => renderWorkflowPanelsMock(input),
  showLoadingOverlay: vi.fn(),
  hideLoadingOverlay: vi.fn()
}));

vi.mock("../../../src/ui/modals.js", () => ({
  renderLabelClassModalContent: vi.fn()
}));

vi.mock("../../../src/ui/theme.js", () => ({
  applyDarkMode: vi.fn(),
  readStoredDarkMode: vi.fn(() => false)
}));

class FakeClassList {
  private readonly classes = new Set<string>();

  add(...tokens: string[]): void {
    tokens.forEach((token) => {
      this.classes.add(token);
    });
  }

  remove(...tokens: string[]): void {
    tokens.forEach((token) => {
      this.classes.delete(token);
    });
  }

  contains(token: string): boolean {
    return this.classes.has(token);
  }

  toggle(token: string, force?: boolean): boolean {
    if (force === true) {
      this.classes.add(token);
      return true;
    }
    if (force === false) {
      this.classes.delete(token);
      return false;
    }
    if (this.classes.has(token)) {
      this.classes.delete(token);
      return false;
    }
    this.classes.add(token);
    return true;
  }

  replaceAll(className: string): void {
    this.classes.clear();
    className
      .split(/\s+/)
      .filter(Boolean)
      .forEach((token) => {
        this.classes.add(token);
      });
  }
}

class FakeElement {
  readonly children: FakeElement[] = [];
  readonly classList = new FakeClassList();
  readonly dataset: Record<string, string> = {};
  readonly style: Record<string, string> = {};
  readonly listeners = new Map<string, Array<(event: { stopPropagation(): void }) => void>>();

  id = "";
  textContent = "";
  value = "";
  checked = false;
  selectedIndex = 0;
  disabled = false;
  hidden = false;
  tabIndex = 0;
  title = "";
  tagName: string;
  parentElement: FakeElement | null = null;

  private classNameValue = "";
  private innerHTMLValue = "";

  constructor(tagName: string) {
    this.tagName = tagName.toLowerCase();
  }

  get className(): string {
    return this.classNameValue;
  }

  set className(value: string) {
    this.classNameValue = value;
    this.classList.replaceAll(value);
  }

  get innerHTML(): string {
    return this.innerHTMLValue;
  }

  set innerHTML(value: string) {
    this.innerHTMLValue = value;
    if (value === "") {
      this.children.length = 0;
    }
  }

  appendChild(child: FakeElement): FakeElement {
    child.parentElement = this;
    this.children.push(child);
    return child;
  }

  append(...children: FakeElement[]): void {
    children.forEach((child) => {
      this.appendChild(child);
    });
  }

  replaceChildren(...children: FakeElement[]): void {
    this.children.length = 0;
    this.append(...children);
  }

  addEventListener(type: string, listener: (event: { stopPropagation(): void }) => void): void {
    const existing = this.listeners.get(type) ?? [];
    existing.push(listener);
    this.listeners.set(type, existing);
  }

  dispatch(type: string): void {
    (this.listeners.get(type) ?? []).forEach((listener) => {
      listener({
        stopPropagation: () => {
          return;
        }
      });
    });
  }

  querySelector(_selector: string): FakeElement | null {
    return null;
  }

  querySelectorAll(_selector: string): FakeElement[] {
    return [];
  }

  setAttribute(): void {}

  removeAttribute(): void {}

  toggleAttribute(_name: string, force?: boolean): boolean {
    return Boolean(force);
  }

  focus(): void {}
}

class FakeDocument {
  createElement(tagName: string): FakeElement {
    return new FakeElement(tagName);
  }

  getElementById(_id: string): null {
    return null;
  }

  querySelector(): null {
    return null;
  }
}

function createRect(labelClass: string): { type: string; labelClass: string } {
  return {
    type: "rect",
    labelClass
  };
}

function flattenRows(parent: FakeElement): FakeElement[] {
  return parent.children.flatMap((group) => {
    const itemsContainer = group.children[1];
    return itemsContainer?.children ?? [];
  });
}

function createElements() {
  const imageSearchInput = new FakeElement("input");
  imageSearchInput.value = "";
  const classSearchInput = new FakeElement("input");
  classSearchInput.value = "";
  const showLabeledCheckbox = new FakeElement("input");
  showLabeledCheckbox.checked = true;
  const showUnlabeledCheckbox = new FakeElement("input");
  showUnlabeledCheckbox.checked = true;
  const segmentationMaskVisibilityToggle = new FakeElement("input");
  segmentationMaskVisibilityToggle.checked = true;
  const segmentationMaskOpacitySlider = new FakeElement("input");
  segmentationMaskOpacitySlider.value = "60";
  const segmentationEdgeHighlightToggle = new FakeElement("input");
  segmentationEdgeHighlightToggle.checked = true;
  const segmentationEdgeGlowSlider = new FakeElement("input");
  segmentationEdgeGlowSlider.value = "70";
  const segmentationToolSizeSlider = new FakeElement("input");
  segmentationToolSizeSlider.value = "6";

  return {
    labelList: new FakeElement("div"),
    labelFilters: new FakeElement("div"),
    selectByClassDropdown: new FakeElement("select"),
    detectionWorkflowPanel: new FakeElement("div"),
    segmentationWorkflowPanel: new FakeElement("div"),
    imageList: new FakeElement("div"),
    imageSearchInput,
    classSearchInput,
    showLabeledCheckbox,
    showUnlabeledCheckbox,
    bottomPanel: new FakeElement("div"),
    previewList: new FakeElement("div"),
    previewListWrapper: new FakeElement("div"),
    segmentationActiveClassSummary: new FakeElement("div"),
    segmentationRelabelRegionBtn: new FakeElement("button"),
    segmentationBrushModeBtn: new FakeElement("button"),
    segmentationEraseModeBtn: new FakeElement("button"),
    segmentationToolSizeLabel: new FakeElement("label"),
    segmentationToolSizeSlider,
    segmentationToolSizeValue: new FakeElement("span"),
    segmentationToolSizePresets: new FakeElement("div"),
    segmentationMaskVisibilityToggle,
    segmentationMaskOpacitySlider,
    segmentationMaskOpacityValue: new FakeElement("span"),
    segmentationEdgeHighlightToggle,
    segmentationEdgeGlowSlider,
    segmentationEdgeGlowValue: new FakeElement("span"),
    segmentationClassSummary: new FakeElement("div"),
    segmentationAutoFillClosedRegionGroup: new FakeElement("div"),
    segmentationAutoFillClosedRegionToggle: new FakeElement("input"),
    canvasEmptyState: new FakeElement("div"),
    imageCountBadge: new FakeElement("span"),
    datasetConnectionStatus: new FakeElement("span"),
    refreshDatasetBtn: new FakeElement("button"),
    selectLabelFolderBtn: new FakeElement("button"),
    prevImageBtn: new FakeElement("button"),
    nextImageBtn: new FakeElement("button"),
    saveLabelsBtn: new FakeElement("button"),
    headerDocumentStatus: new FakeElement("div"),
    documentStatus: new FakeElement("div"),
    statusImageInfo: new FakeElement("div"),
    statusAnnotationInfo: new FakeElement("div"),
    statusMode: new FakeElement("div"),
    inspectorTitle: new FakeElement("h2"),
    inspectorSubtitle: new FakeElement("span"),
    inspectorAnnotationTabBtn: new FakeElement("button"),
    inspectorTransformTabBtn: new FakeElement("button"),
    inspectorAutomationTabBtn: new FakeElement("button"),
    inspectorAnnotationPane: new FakeElement("section"),
    inspectorTransformPane: new FakeElement("section"),
    inspectorAutomationPane: new FakeElement("section"),
    activeToolSummary: new FakeElement("span"),
    labelDisplayModeSelect: new FakeElement("select"),
    selectedAnnotationCount: new FakeElement("span"),
    selectionEmptyState: new FakeElement("div"),
    selectionDetails: new FakeElement("div"),
    selectionClassSelect: new FakeElement("select"),
    selectionGeometryX: new FakeElement("input"),
    selectionGeometryY: new FakeElement("input"),
    selectionGeometryWidth: new FakeElement("input"),
    selectionGeometryHeight: new FakeElement("input"),
    duplicateSelectionBtn: new FakeElement("button"),
    hideSelectionBtn: new FakeElement("button"),
    deleteSelectionBtn: new FakeElement("button"),
    taskFilesBtn: new FakeElement("button"),
    taskAnnotateBtn: new FakeElement("button"),
    taskAutomateBtn: new FakeElement("button"),
    leftPanel: new FakeElement("aside"),
    rightPanel: new FakeElement("aside"),
    leftSplitter: new FakeElement("div"),
    rightSplitter: new FakeElement("div"),
    expandLeftPanelBtn: new FakeElement("button"),
    expandRightPanelBtn: new FakeElement("button")
  };
}

function createManagerWithRects(input: {
  rects: Array<{ type: string; labelClass: string }>;
  hiddenLabelClasses?: Set<string>;
  collapsedLabelGroups?: Set<string>;
}) {
  const state = createInitialAppState();
  state.view.hiddenLabelClasses = input.hiddenLabelClasses ?? new Set<string>();
  state.view.collapsedLabelGroups = input.collapsedLabelGroups ?? new Set<string>();

  const elements = createElements();
  getDOMElementsMock.mockReturnValue(elements);

  const manager = createUiManagerAdapter({
    state,
    documentRef: new FakeDocument() as unknown as Document,
    bootstrapRef: {} as never,
    windowRef: { prompt: () => null },
    storage: {
      getItem: () => null,
      setItem: () => {
        return;
      }
    }
  });

  manager.connect({
    canvasController: {
      raw: {
        getObjects: () => input.rects,
        canvas: {
          getActiveObjects: () => [],
          getActiveObject: () => null,
          setActiveObject: () => {
            return;
          }
        },
        highlightSelection: () => {
          return;
        },
        editLabel: async () => {
          return;
        },
        removeObject: () => {
          return;
        },
        getSegmentationSummary: () => ({
          activeClassId: "1",
          activeTool: "brush",
          brushRadius: 6,
          overlayVisible: true,
          overlayOpacity: 0.6,
          edgeHighlightVisible: true,
          edgeHighlightIntensity: 0.7,
          visibleClassIds: [],
          allClassIds: [],
          hiddenClassIds: []
        }),
        getSegmentationAutoFillClosedRegionEnabled: () => false,
        renderAll: () => {
          return;
        },
        selectLabelsByClass: () => {
          return;
        },
        applyVisibilityFromHiddenClasses: () => {
          return;
        }
      }
    }
  } as never);

  return { manager, state, elements };
}

describe("bootstrap/ui-manager-adapter updateLabelList", () => {
  beforeEach(() => {
    getDOMElementsMock.mockReset();
    renderLabelFiltersMock.mockClear();
    renderSelectByClassDropdownMock.mockClear();
    renderImageListMock.mockClear();
    renderPreviewListMock.mockClear();
    renderWorkflowPanelsMock.mockClear();
  });

  it("renders only visible rows/groups while preserving hidden classes in filter controls", () => {
    const rects = [createRect("1"), createRect("1"), createRect("2")];
    const hiddenLabelClasses = new Set<string>(["2"]);
    const { manager, elements } = createManagerWithRects({ rects, hiddenLabelClasses });

    manager.updateLabelList();

    expect(elements.labelList.children).toHaveLength(1);
    expect(flattenRows(elements.labelList)).toHaveLength(2);
    expect(elements.labelList.children[0]?.dataset.ui).toBe("label-group");
    expect(elements.labelList.children[0]?.dataset.groupClass).toBe("1");
    expect(renderLabelFiltersMock).toHaveBeenCalledTimes(1);
    expect(renderLabelFiltersMock.mock.calls[0][0].rects).toEqual([
      { labelClass: "1" },
      { labelClass: "1" },
      { labelClass: "2" }
    ]);
    expect([...(renderLabelFiltersMock.mock.calls[0][0].activeFilterKeys ?? new Set<string>())]).toEqual(["1"]);
    expect(renderLabelFiltersMock.mock.calls[0][0].isAllActive).toBe(false);

    const summary = elements.labelFilters.children.find((child) => child.dataset.ui === "filter-summary");
    expect(summary?.textContent).toBe("Visible: 2 / Total: 3");
    expect(renderSelectByClassDropdownMock).toHaveBeenCalledTimes(1);
    expect(renderSelectByClassDropdownMock.mock.calls[0][1]).toEqual([
      { labelClass: "1" },
      { labelClass: "1" }
    ]);
  });

  it("renders stable empty state hooks when filters hide all rows", () => {
    const rects = [createRect("1"), createRect("2")];
    const hiddenLabelClasses = new Set<string>(["1", "2"]);
    const { manager, elements } = createManagerWithRects({ rects, hiddenLabelClasses });

    manager.updateLabelList();

    expect(elements.labelList.children).toHaveLength(1);
    const emptyState = elements.labelList.children[0];
    expect(emptyState.dataset.ui).toBe("label-list-empty");
    expect(emptyState.dataset.testid).toBe("label-list-empty");
    expect(emptyState.textContent).toBe("No labels match the current filter.");

    const summary = elements.labelFilters.children.find((child) => child.dataset.ui === "filter-summary");
    expect(summary?.textContent).toBe("Visible: 0 / Total: 2");
  });

  it("normalizes unlabeled classes before passing filter renderer inputs", () => {
    const rects = [createRect(""), createRect("2")];
    const { manager } = createManagerWithRects({ rects });

    manager.updateLabelList();

    expect(renderLabelFiltersMock.mock.calls[0][0].rects).toEqual([
      { labelClass: "__unlabeled__" },
      { labelClass: "2" }
    ]);
    expect(renderLabelFiltersMock.mock.calls[0][0].isAllActive).toBe(true);
  });

  it("restores collapsed state when a hidden group becomes visible again", () => {
    const rects = [createRect("1"), createRect("2")];
    const hiddenLabelClasses = new Set<string>(["1"]);
    const collapsedLabelGroups = new Set<string>(["1"]);
    const { manager, state, elements } = createManagerWithRects({
      rects,
      hiddenLabelClasses,
      collapsedLabelGroups
    });

    manager.updateLabelList();
    expect(elements.labelList.children).toHaveLength(1);

    state.view.hiddenLabelClasses = new Set<string>();
    manager.updateLabelList();

    const groupForClassOne = elements.labelList.children.find((group) => {
      const header = group.children[0];
      const items = group.children[1];
      return header?.classList.contains("collapsed") && items?.style.maxHeight === "0";
    });

    expect(groupForClassOne).toBeDefined();
    expect(state.view.collapsedLabelGroups.has("1")).toBe(true);
  });

  it("keeps active filter state across refresh and does not resurrect hidden rows in selection affordances", () => {
    const rects = [createRect("1"), createRect("2"), createRect("2")];
    const hiddenLabelClasses = new Set<string>(["2"]);
    const { manager, state, elements } = createManagerWithRects({ rects, hiddenLabelClasses });

    manager.updateLabelList();
    expect(flattenRows(elements.labelList)).toHaveLength(1);
    const firstDropdownCall = renderSelectByClassDropdownMock.mock.calls[renderSelectByClassDropdownMock.mock.calls.length - 1];
    expect(firstDropdownCall?.[1]).toEqual([{ labelClass: "1" }]);

    rects[0].labelClass = "2";
    manager.updateLabelList();

    expect(state.view.hiddenLabelClasses).toEqual(new Set<string>(["2"]));
    expect(elements.labelList.children).toHaveLength(1);
    expect(elements.labelList.children[0].dataset.ui).toBe("label-list-empty");
    const secondDropdownCall = renderSelectByClassDropdownMock.mock.calls[renderSelectByClassDropdownMock.mock.calls.length - 1];
    expect(secondDropdownCall?.[1]).toEqual([]);
    const summary = elements.labelFilters.children.find((child) => child.dataset.ui === "filter-summary");
    expect(summary?.textContent).toBe("Visible: 0 / Total: 3");
  });

  it("virtualizes dense annotation groups until the group is expanded", () => {
    const rects = Array.from({ length: 500 }, () => createRect("1"));
    const { manager, elements } = createManagerWithRects({ rects });

    manager.updateLabelList();

    const group = elements.labelList.children[0];
    const header = group.children[0];
    const items = group.children[1];
    expect(header.classList.contains("collapsed")).toBe(true);
    expect(items.children).toHaveLength(0);

    header.dispatch("click");
    expect(items.children).toHaveLength(81);
    expect(items.children[80]?.dataset.ui).toBe("label-list-load-more");
  });
});


describe("bootstrap/ui-manager-adapter workflow panels", () => {
  beforeEach(() => {
    getDOMElementsMock.mockReset();
    renderImageListMock.mockClear();
    renderPreviewListMock.mockClear();
    renderWorkflowPanelsMock.mockClear();
  });

  it("switches workflow-specific right-panel sections through renderer helpers", () => {
    const state = createInitialAppState();
    const elements = createElements();
    getDOMElementsMock.mockReturnValue(elements);

    const manager = createUiManagerAdapter({
      state,
      documentRef: new FakeDocument() as unknown as Document,
      bootstrapRef: {} as never,
      windowRef: { prompt: () => null },
      storage: {
        getItem: () => null,
        setItem: () => {
          return;
        }
      }
    });

    manager.setWorkflow("segmentation");

    expect(state.session.workflow).toBe("segmentation");
    expect(renderWorkflowPanelsMock).toHaveBeenCalledWith({
      detectionPanelElement: elements.detectionWorkflowPanel,
      segmentationPanelElement: elements.segmentationWorkflowPanel,
      activeWorkflow: "segmentation"
    });
    expect(renderImageListMock).toHaveBeenCalledTimes(1);
    expect(renderPreviewListMock).toHaveBeenCalledTimes(1);
  });

  it("syncs segmentation auto-fill toggle from controller getter", () => {
    const state = createInitialAppState();
    const elements = createElements();
    getDOMElementsMock.mockReturnValue(elements);

    const manager = createUiManagerAdapter({
      state,
      documentRef: new FakeDocument() as unknown as Document,
      bootstrapRef: {} as never,
      windowRef: { prompt: () => null },
      storage: {
        getItem: () => null,
        setItem: () => {
          return;
        }
      }
    });

    manager.connect({
      canvasController: {
        raw: {
          getObjects: () => [],
          canvas: {
            getActiveObjects: () => [],
            getActiveObject: () => null
          },
          getSegmentationSummary: () => ({
            activeClassId: "1",
            activeTool: "brush",
            brushRadius: 6,
            overlayVisible: true,
            overlayOpacity: 0.6,
            edgeHighlightVisible: false,
            edgeHighlightIntensity: 0.35,
            visibleClassIds: [],
            allClassIds: [],
            hiddenClassIds: []
          }),
          getSegmentationAutoFillClosedRegionEnabled: () => true
        }
      }
    } as never);

    manager.setWorkflow("segmentation");
    expect(elements.segmentationAutoFillClosedRegionToggle.checked).toBe(true);
    expect(elements.segmentationEdgeHighlightToggle.checked).toBe(false);
    expect(elements.segmentationEdgeGlowSlider.value).toBe("35");
    expect(elements.segmentationEdgeGlowValue.textContent).toBe("35");
  });
});
