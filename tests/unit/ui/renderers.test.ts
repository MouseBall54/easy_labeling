import { beforeEach, describe, expect, it } from "vitest";

import {
  CREATE_NEW_CLASS_FILE_VALUE,
  hideLoadingOverlay,
  renderClassFileSelect,
  renderImageList,
  renderPreviewList,
  showLoadingOverlay
} from "../../../src/ui/renderers.js";
import type { FileHandle } from "../../../src/types/files.js";
import { FakeDocument, FakeElement } from "./test-dom.js";

function fileHandle(name: string): FileHandle {
  return { name } as unknown as FileHandle;
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

  it("renders image list with legacy filtering and active item behavior", () => {
    const imageListElement = new FakeElement("div");
    const files = [fileHandle("img10.jpg"), fileHandle("img2.jpg"), fileHandle("zebra.jpg")];
    const status = new Map<string, boolean>([
      ["img10.jpg", true],
      ["img2.jpg", false],
      ["zebra.jpg", true]
    ]);

    const rendered = renderImageList({
      imageListElement: imageListElement as unknown as HTMLElement,
      imageFiles: files,
      imageLabelStatus: status,
      currentImageFile: fileHandle("img10.jpg"),
      searchTerm: "img",
      showLabeled: true,
      showUnlabeled: false
    });

    expect(rendered.map((file) => file.name)).toEqual(["img10.jpg"]);
    expect(imageListElement.children).toHaveLength(1);
    expect(imageListElement.children[0]?.classList.contains("active")).toBe(true);
    expect(imageListElement.children[0]?.innerHTML.includes("bi-check-circle-fill")).toBe(true);
  });

  it("renders preview list structure and respects hidden-state", () => {
    const bottomPanelElement = new FakeElement("div");
    const previewListElement = new FakeElement("div");
    const previewListWrapperElement = new FakeElement("div");
    previewListWrapperElement.offsetWidth = 800;

    const files = [
      fileHandle("1.jpg"),
      fileHandle("2.jpg"),
      fileHandle("3.jpg"),
      fileHandle("4.jpg"),
      fileHandle("5.jpg")
    ];

    const hiddenResult = renderPreviewList({
      bottomPanelElement: bottomPanelElement as unknown as HTMLElement,
      previewListElement: previewListElement as unknown as HTMLElement,
      previewListWrapperElement: previewListWrapperElement as unknown as HTMLElement,
      imageFiles: files,
      currentImageFile: fileHandle("3.jpg"),
      isPreviewBarHidden: true
    });
    expect(hiddenResult).toEqual([]);
    expect(previewListElement.children).toHaveLength(0);

    const shownResult = renderPreviewList({
      bottomPanelElement: bottomPanelElement as unknown as HTMLElement,
      previewListElement: previewListElement as unknown as HTMLElement,
      previewListWrapperElement: previewListWrapperElement as unknown as HTMLElement,
      imageFiles: files,
      currentImageFile: fileHandle("3.jpg"),
      isPreviewBarHidden: false
    });

    expect(bottomPanelElement.style.display).toBe("flex");
    expect(shownResult.map((file) => file.name)).toEqual(["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg"]);
    expect(previewListElement.children).toHaveLength(5);
    expect(previewListElement.children[2]?.classList.contains("active")).toBe(true);
    expect(previewListElement.children[2]?.children[0]?.tagName).toBe("img");
    expect(previewListElement.children[2]?.children[0]?.alt).toBe("3.jpg");
  });

  it("toggles loading overlay show class", () => {
    const loadingOverlayElement = new FakeElement("div");

    showLoadingOverlay(loadingOverlayElement as unknown as HTMLElement);
    expect(loadingOverlayElement.classList.contains("show")).toBe(true);

    hideLoadingOverlay(loadingOverlayElement as unknown as HTMLElement);
    expect(loadingOverlayElement.classList.contains("show")).toBe(false);
  });
});
