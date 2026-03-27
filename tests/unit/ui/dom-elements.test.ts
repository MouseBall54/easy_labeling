import { describe, expect, it } from "vitest";

import {
  getDOMElements,
  getUnsupportedEnvironmentElements,
  type BootstrapModalLike
} from "../../../src/ui/dom-elements.js";
import { createFakeDocumentFromHtmlFragment } from "./test-dom.js";

const REQUIRED_IDS = [
  "selectImageFolderBtn",
  "selectLabelFolderBtn",
  "loadClassInfoFolderBtn",
  "class-file-select",
  "image-list",
  "imageSearchInput",
  "showLabeled",
  "showUnlabeled",
  "saveLabelsBtn",
  "autoSaveToggle",
  "showLabelsOnCanvasToggle",
  "label-font-size",
  "label-font-size-value",
  "drawMode",
  "editMode",
  "label-list",
  "label-filters",
  "select-by-class-dropdown",
  "select-by-class-btn",
  "zoomInBtn",
  "zoomOutBtn",
  "resetZoomBtn",
  "undoBtn",
  "redoBtn",
  "alignLeftBtn",
  "alignRightBtn",
  "alignTopBtn",
  "alignBottomBtn",
  "distributeHorizontalBtn",
  "distributeVerticalBtn",
  "zoom-input",
  "mouse-coords",
  "coordX",
  "coordY",
  "goToCoordsBtn",
  "current-image-name",
  "prevImageBtn",
  "nextImageBtn",
  "left-panel",
  "right-panel",
  "left-splitter",
  "right-splitter",
  "darkModeToggle",
  "sortLabelsAscBtn",
  "sortLabelsDescBtn",
  "viewClassFileBtn",
  "classFileViewerModal",
  "classFileEditorBody",
  "addClassRowBtn",
  "saveClassFileBtn",
  "preview-bar",
  "preview-prev-btn",
  "preview-next-btn",
  "preview-list-wrapper",
  "preview-list",
  "bottom-panel",
  "bottom-splitter",
  "preview-bar-header",
  "toggle-preview-btn",
  "collapse-left-panel-btn",
  "expand-left-panel-btn",
  "collapse-right-panel-btn",
  "expand-right-panel-btn",
  "labelClassModal",
  "labelClassInput",
  "class-selection-container",
  "saveLabelClassBtn",
  "crosshairToggle",
  "context-menu",
  "ctx-edit-label",
  "ctx-delete-label",
  "loading-overlay",
  "unsupportedDeviceModal"
] as const;

class FakeModal implements BootstrapModalLike {
  static createdElements: string[] = [];
  readonly _element: HTMLElement;

  constructor(element: HTMLElement) {
    this._element = element;
    FakeModal.createdElements.push(element.id);
  }

  show(): void {
    return;
  }

  hide(): void {
    return;
  }
}

function createHtmlFragment(): string {
  const nodes = REQUIRED_IDS.map((id) => `<div id="${id}"></div>`);
  nodes.push('<div class="canvas-container"></div>');
  return nodes.join("\n");
}

describe("ui/dom-elements", () => {
  it("resolves required selector contract from html fragments", () => {
    FakeModal.createdElements = [];
    const fakeDocument = createFakeDocumentFromHtmlFragment(createHtmlFragment());

    const result = getDOMElements(fakeDocument as unknown as Document, {
      Modal: FakeModal as unknown as typeof bootstrap.Modal
    });

    expect(result.selectImageFolderBtn.id).toBe("selectImageFolderBtn");
    expect(result.classFileSelect.id).toBe("class-file-select");
    expect(result.canvasContainer.classList.contains("canvas-container")).toBe(true);
    expect(result.loadingOverlay.id).toBe("loading-overlay");
    expect(FakeModal.createdElements).toEqual(["classFileViewerModal", "labelClassModal"]);
  });

  it("fails fast with explicit error when critical node is missing", () => {
    const html = createHtmlFragment().replace('<div id="image-list"></div>', "");
    const fakeDocument = createFakeDocumentFromHtmlFragment(html);

    expect(() => {
      getDOMElements(fakeDocument as unknown as Document, {
        Modal: FakeModal as unknown as typeof bootstrap.Modal
      });
    }).toThrowError("Missing required DOM element: #image-list");
  });

  it("exposes unsupported environment modal elements without side effects", () => {
    FakeModal.createdElements = [];
    const fakeDocument = createFakeDocumentFromHtmlFragment(createHtmlFragment());

    const result = getUnsupportedEnvironmentElements(fakeDocument as unknown as Document, {
      Modal: FakeModal as unknown as typeof bootstrap.Modal
    });

    expect(result.unsupportedDeviceModalElement.id).toBe("unsupportedDeviceModal");
    expect(FakeModal.createdElements).toEqual(["unsupportedDeviceModal"]);
  });
});
