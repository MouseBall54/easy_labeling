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

vi.mock("../../../src/ui/dom-elements.js", () => ({
  getDOMElements: (...args: unknown[]) => getDOMElementsMock(...args)
}));

vi.mock("../../../src/ui/renderers.js", () => ({
  bindLabelFilterEvents: vi.fn(),
  renderClassFileSelect: vi.fn(),
  renderImageList: vi.fn(),
  renderLabelFilters: (input: unknown) => {
    renderLabelFiltersMock(input as { labelFiltersElement: FakeElement; rects: Array<{ labelClass: string }> });
  },
  renderPreviewList: vi.fn(),
  renderSelectByClassDropdown: (...args: unknown[]) => renderSelectByClassDropdownMock(...args),
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

  toggle(token: string): boolean {
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
}

class FakeDocument {
  createElement(tagName: string): FakeElement {
    return new FakeElement(tagName);
  }

  getElementById(_id: string): null {
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

function createElements(): { labelList: FakeElement; labelFilters: FakeElement; selectByClassDropdown: FakeElement } {
  return {
    labelList: new FakeElement("div"),
    labelFilters: new FakeElement("div"),
    selectByClassDropdown: new FakeElement("select")
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
});
