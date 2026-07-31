import { beforeEach, describe, expect, it } from "vitest";

import {
  CREATE_NEW_CLASS_FILE_VALUE,
  bindLabelFilterEvents,
  hideLoadingOverlay,
  renderClassFileSelect,
  renderImageList,
  renderLabelFilters,
  renderWorkflowPanels,
  showLoadingOverlay
} from "../../../src/ui/renderers.js";
import type { FileHandle } from "../../../src/types/files.js";
import { UNLABELED_FILTER_KEY } from "../../../src/ui/filter-state.js";
import { FakeDocument, FakeElement } from "./test-dom.js";

function fileHandle(name: string): FileHandle {
  return { name } as unknown as FileHandle;
}

function workflowStatus(input: Partial<{
  detectionAnnotation: boolean;
  detectionBoxCount: number;
  segmentationAnnotation: boolean;
}> = {}) {
  return {
    detection: {
      hasAnnotation: input.detectionAnnotation ?? false,
      boxCount: input.detectionBoxCount ?? 0
    },
    segmentation: {
      hasAnnotation: input.segmentationAnnotation ?? false
    }
  };
}

describe("ui/renderers", () => {
  beforeEach(() => {
    const fakeDocument = new FakeDocument();
    globalThis.document = fakeDocument as unknown as Document;
  });

  it("preserves class-file create sentinel option and separator", () => {
    const selectElement = new FakeElement("select");

    renderClassFileSelect(
      selectElement as unknown as HTMLSelectElement,
      [fileHandle("10.yaml"), fileHandle("2.yaml")],
      null
    );

    expect(selectElement.children[0]?.value).toBe(CREATE_NEW_CLASS_FILE_VALUE);
    expect(selectElement.children[0]?.textContent).toBe("＋ Create new class file...");
    expect(selectElement.children[1]?.disabled).toBe(true);
    expect(selectElement.children[1]?.textContent).toBe("──────────");
    expect(selectElement.children.slice(2).map((child) => child.value)).toEqual(["2.yaml", "10.yaml"]);
    expect(selectElement.selectedIndex).toBe(-1);
  });

  it("renders image list with workflow-aware filtering and active item behavior", () => {
    const imageListElement = new FakeElement("div");
    const files = [fileHandle("img10.jpg"), fileHandle("img2.jpg"), fileHandle("zebra.jpg")];
    const status = new Map([
      ["img10.jpg", workflowStatus({ detectionAnnotation: true, detectionBoxCount: 12 })],
      ["img2.jpg", workflowStatus({ detectionAnnotation: false })],
      ["zebra.jpg", workflowStatus({ detectionAnnotation: true })]
    ]);

    const rendered = renderImageList({
      imageListElement: imageListElement as unknown as HTMLElement,
      imageFiles: files,
      imageWorkflowStatus: status,
      activeWorkflow: "detection",
      currentImageFile: fileHandle("img10.jpg"),
      searchTerm: "img",
      showLabeled: true,
      showUnlabeled: false
    });

    expect(rendered.map((file) => file.name)).toEqual(["img10.jpg"]);
    expect(imageListElement.children).toHaveLength(1);
    expect(imageListElement.children[0]?.dataset.ui).toBe("image-list-item");
    expect(imageListElement.children[0]?.dataset.fileName).toBe("img10.jpg");
    expect(imageListElement.children[0]?.dataset.testid).toBe("image-list-item-img10.jpg");
    expect(imageListElement.children[0]?.classList.contains("active")).toBe(true);
    expect(imageListElement.children[0]?.innerHTML.includes("bi-check-circle-fill")).toBe(true);
    expect(imageListElement.children[0]?.dataset.status).toBe("detection-present");
    expect(imageListElement.children[0]?.children[0]?.textContent).toBe("img10.jpg");
    expect(imageListElement.children[0]?.children[1]?.dataset.ui).toBe("image-box-count");
    expect(imageListElement.children[0]?.children[1]?.textContent).toBe("12");
    expect(imageListElement.children[0]?.children[1]?.getAttribute("aria-label")).toBe("12 detection boxes");
  });

  it("derives segmentation badges from the active workflow", () => {
    const segmentationListElement = new FakeElement("div");
    const files = [fileHandle("img1.jpg"), fileHandle("img2.jpg")];
    const status = new Map([
      ["img1.jpg", workflowStatus({ detectionBoxCount: 7, segmentationAnnotation: true })],
      ["img2.jpg", workflowStatus({ detectionAnnotation: false })]
    ]);

    const segmentationRendered = renderImageList({
      imageListElement: segmentationListElement as unknown as HTMLElement,
      imageFiles: files,
      imageWorkflowStatus: status,
      activeWorkflow: "segmentation",
      currentImageFile: fileHandle("img1.jpg"),
      searchTerm: "img",
      showLabeled: true,
      showUnlabeled: false
    });
    expect(segmentationRendered.map((file) => file.name)).toEqual(["img1.jpg"]);
    expect(segmentationListElement.children[0]?.dataset.status).toBe("segmentation-present");
    expect(segmentationListElement.children[0]?.children[1]?.textContent).toBe("7");
  });
  it("toggles loading overlay show class", () => {
    const loadingOverlayElement = new FakeElement("div");

    showLoadingOverlay(loadingOverlayElement as unknown as HTMLElement);
    expect(loadingOverlayElement.classList.contains("show")).toBe(true);

    hideLoadingOverlay(loadingOverlayElement as unknown as HTMLElement);
    expect(loadingOverlayElement.classList.contains("show")).toBe(false);
  });

  it("renders filter buttons with stable data-ui/data-testid attributes", () => {
    const labelFiltersElement = new FakeElement("div");

    renderLabelFilters({
      labelFiltersElement: labelFiltersElement as unknown as HTMLElement,
      rects: [
        { labelClass: "1" },
        { labelClass: "2" },
        { labelClass: "2" }
      ],
      getDisplayNameForClass: (labelClass) => `Class ${labelClass}`,
      activeFilterKeys: new Set(["2"]),
      isAllActive: false
    });

    const allButton = labelFiltersElement.children.find((child) => child.dataset.ui === "filter-all");
    const classButtons = labelFiltersElement.children.filter((child) => child.dataset.ui === "filter-class");

    expect(allButton?.dataset.testid).toBe("filter-all");
    expect(classButtons).toHaveLength(2);
    expect(classButtons[0]?.dataset.filterKey).toBe("1");
    expect(classButtons[0]?.dataset.testid).toBe("filter-class-1");
    expect(classButtons[0]?.classList.contains("active")).toBe(false);
    expect(classButtons[1]?.dataset.filterKey).toBe("2");
    expect(classButtons[1]?.dataset.testid).toBe("filter-class-2");
    expect(classButtons[1]?.classList.contains("active")).toBe(true);
  });

  it("renders All whenever labels exist", () => {
    const labelFiltersElement = new FakeElement("div");

    renderLabelFilters({
      labelFiltersElement: labelFiltersElement as unknown as HTMLElement,
      rects: [{ labelClass: "1" }],
      getDisplayNameForClass: (labelClass) => `Class ${labelClass}`,
      isAllActive: true
    });

    const allButton = labelFiltersElement.children.find((child) => child.dataset.ui === "filter-all");
    expect(allButton).toBeDefined();
    expect(allButton?.classList.contains("btn-primary")).toBe(true);
  });

  it("binds filter click handlers using data-ui selectors", () => {
    const labelFiltersElement = new FakeElement("div");
    const selectAll = { calls: 0 };
    const selectedClasses: string[] = [];

    renderLabelFilters({
      labelFiltersElement: labelFiltersElement as unknown as HTMLElement,
      rects: [
        { labelClass: "1" },
        { labelClass: "2" }
      ],
      getDisplayNameForClass: (labelClass) => `Class ${labelClass}`
    });

    bindLabelFilterEvents({
      labelFiltersElement: labelFiltersElement as unknown as HTMLElement,
      onSelectAll: () => {
        selectAll.calls += 1;
      },
      onSelectClass: (labelClass) => {
        selectedClasses.push(labelClass);
      }
    });

    const allButton = labelFiltersElement.children.find((child) => child.dataset.ui === "filter-all");
    const classButton = labelFiltersElement.children.find((child) => child.dataset.ui === "filter-class" && child.dataset.labelClass === "2");

    allButton?.dispatch("click");
    classButton?.dispatch("click");

    expect(selectAll.calls).toBe(1);
    expect(selectedClasses).toEqual(["2"]);
  });

  it("renders unlabeled filter key with stable data-testid", () => {
    const labelFiltersElement = new FakeElement("div");

    renderLabelFilters({
      labelFiltersElement: labelFiltersElement as unknown as HTMLElement,
      rects: [
        { labelClass: UNLABELED_FILTER_KEY },
        { labelClass: "3" }
      ],
      getDisplayNameForClass: (labelClass) => `Class ${labelClass}`
    });

    const unlabeledButton = labelFiltersElement.children.find(
      (child) => child.dataset.ui === "filter-class" && child.dataset.filterKey === UNLABELED_FILTER_KEY
    );

    expect(unlabeledButton?.dataset.testid).toBe("filter-class-unlabeled");
  });

  it("toggles workflow-specific panel visibility from the active workflow", () => {
    const detectionPanel = new FakeElement("div");
    const segmentationPanel = new FakeElement("div");

    renderWorkflowPanels({
      detectionPanelElement: detectionPanel as unknown as HTMLElement,
      segmentationPanelElement: segmentationPanel as unknown as HTMLElement,
      activeWorkflow: "segmentation"
    });

    expect(detectionPanel.style.display).toBe("none");
    expect(detectionPanel.dataset.workflowActive).toBe("false");
    expect(segmentationPanel.style.display).toBe("");
    expect(segmentationPanel.dataset.workflowActive).toBe("true");
  });

});
