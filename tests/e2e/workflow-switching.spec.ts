import { expect, test } from "@playwright/test";

type MockFileInit = string | ArrayBuffer;

test("workflow switching keeps workflow-specific panels and state coherent", async ({ page }) => {
  await page.addInitScript(() => {
    const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8AARQMBgN6f3QAAAABJRU5ErkJggg==";
    const pngBinary = atob(pngBase64);
    const pngBuffer = new ArrayBuffer(pngBinary.length);
    const pngBytes = new Uint8Array(pngBuffer);
    for (let index = 0; index < pngBinary.length; index += 1) {
      pngBytes[index] = pngBinary.charCodeAt(index);
    }

    class MockFileHandle {
      kind = "file";
      name: string;
      content: MockFileInit;

      constructor(name: string, content: MockFileInit) {
        this.name = name;
        this.content = content;
      }

      async getFile() {
        const type = this.name.endsWith(".png") ? "image/png" : "text/plain";
        return new File([this.content], this.name, { type });
      }

      async createWritable() {
        return {
          write: async (data: string | ArrayBuffer) => {
            this.content = data;
          },
          close: async () => {}
        };
      }
    }

    class MockDirectoryHandle {
      kind = "directory";
      name: string;
      entries: Map<string, MockDirectoryHandle | MockFileHandle>;

      constructor(name: string) {
        this.name = name;
        this.entries = new Map();
      }

      setEntry(name: string, entry: MockDirectoryHandle | MockFileHandle) {
        this.entries.set(name, entry);
      }

      async *values() {
        for (const entry of this.entries.values()) {
          yield entry;
        }
      }

      async getDirectoryHandle(name: string, options?: { create?: boolean }) {
        const existing = this.entries.get(name);
        if (existing instanceof MockDirectoryHandle) {
          return existing;
        }
        if (options?.create) {
          const created = new MockDirectoryHandle(name);
          this.entries.set(name, created);
          return created;
        }
        throw new DOMException("Directory not found", "NotFoundError");
      }

      async getFileHandle(name: string, options?: { create?: boolean }) {
        const existing = this.entries.get(name);
        if (existing instanceof MockFileHandle) {
          return existing;
        }
        if (options?.create) {
          const created = new MockFileHandle(name, "");
          this.entries.set(name, created);
          return created;
        }
        throw new DOMException("File not found", "NotFoundError");
      }
    }

    const imageFolder = new MockDirectoryHandle("images");
    imageFolder.setEntry("scene-a.png", new MockFileHandle("scene-a.png", pngBuffer));

    const labelFolder = new MockDirectoryHandle("label");
    labelFolder.setEntry(
      "scene-a.txt",
      new MockFileHandle(
        "scene-a.txt",
        [
          "0 0.20 0.20 0.10 0.10",
          "1 0.60 0.55 0.15 0.15"
        ].join("\n")
      )
    );
    imageFolder.setEntry("label", labelFolder);

    imageFolder.setEntry("mask", new MockDirectoryHandle("mask"));

    Object.defineProperty(window, "showDirectoryPicker", {
      configurable: true,
      writable: true,
      value: async () => imageFolder
    });
  });

  await page.goto("/index.html");
  await page.locator("#selectImageFolderBtn").click();

  await expect.poll(async () => {
    return page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi")?.getRectCount?.() ?? 0);
  }).toBe(2);

  await expect(page.locator('#detectionWorkflowPanel')).toBeVisible();
  await expect(page.locator('#segmentationWorkflowPanel')).toBeHidden();
  await expect(page.locator("#detectionCanvasToolbar")).toBeVisible();
  await expect(page.locator("#detectionCanvasToolbar #genericModeControls")).toBeVisible();
  await expect(page.locator("#detectionCanvasToolbar #taskAutomateBtn")).toBeVisible();
  await expect(page.locator("#taskDetectionDisplayBtn")).toBeVisible();
  await page.locator("#taskDetectionDisplayBtn").click();
  await expect(page.locator("#detectionLeftWorkspace")).toBeHidden();
  await expect(page.locator("#detectionDisplayWorkspace")).toBeVisible();
  await expect(page.locator("#left-panel .label-display-section")).toBeVisible();
  await expect(page.locator("#right-panel .label-display-section")).toHaveCount(0);
  await expect(page.locator("#leftPanelTitle")).toHaveText("Display Settings");
  await page.locator("#taskAnnotateBtn").click();
  await expect(page.locator("#detectionLeftWorkspace")).toBeVisible();
  await expect(page.locator("#detectionDisplayWorkspace")).toBeHidden();
  await expect(page.locator("#taskSegmentationBtn")).toBeHidden();
  await expect(page.locator("#taskSuperpixelBtn")).toBeHidden();
  await expect(page.locator("#taskSegmentationDisplayBtn")).toBeHidden();
  await expect(page.locator("#taskDetectionDisplayBtn")).toBeVisible();

  await page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi")?.selectRectsByIndex?.([0, 1]));
  await page.keyboard.press("3");
  await expect(page.locator("#undoBtn")).toBeEnabled();

  await page.locator("#taskSegmentationBtn").click();
  await expect(page.locator('#detectionWorkflowPanel')).toBeHidden();
  await expect(page.locator('#segmentationWorkflowPanel')).toBeVisible();
  await expect(page.locator('#detectionLeftWorkspace')).toBeVisible();
  await expect(page.locator('#openSegmentationFormatBtn')).toBeVisible();
  await expect(page.locator('#left-panel #segmentationSuperpixelSection')).toBeHidden();
  await expect(page.locator("#genericModeControls")).toBeHidden();
  await expect(page.locator("#detectionCanvasToolbar")).toBeHidden();
  await expect(page.locator("#taskDetectionDisplayBtn")).toBeHidden();
  await expect(page.locator("#segmentationCanvasToolbar")).toBeVisible();
  await expect(page.locator("#segmentationCanvasToolbar #segmentationToolsSection")).toBeVisible();
  await expect(page.locator("#sharedToolSection #segmentationToolSizeSection")).toBeHidden();
  await expect(page.locator("#segmentationSelectedRegionSummary")).toBeVisible();
  await expect(page.locator("#segmentationSelectedRegionSummary")).toHaveText("Select a region to inspect.");
  await expect(page.locator("#segmentationRegionActions")).toBeVisible();
  await expect(page.locator("#sharedToolSection > #segmentationRegionActions")).toHaveCount(1);
  await expect(page.locator("#segmentationRelabelRegionBtn")).toBeDisabled();
  await expect(page.locator("#segmentationDeleteRegionBtn")).toBeDisabled();
  await expect(page.locator("#segmentationRegionActions #segmentationDeleteRegionBtn")).toHaveCount(1);
  await expect(page.locator('#segmentationActiveClassSummary')).toContainText('Painting:');
  await expect(page.locator("#segmentationPaintClassList [data-ui='segmentation-active-class']")).toHaveText(["0", "1", "2", "3", "4"]);
  await expect(page.locator("#taskAnnotateBtn")).toBeHidden();
  await expect(page.locator("#taskSuperpixelBtn")).toBeVisible();
  await expect(page.locator("#taskSegmentationDisplayBtn")).toBeVisible();

  await page.locator("#collapse-right-panel-btn").click();
  await expect(page.locator("#right-panel")).toHaveClass(/collapsed/);
  await page.locator("#segmentationBrushModeBtn").click();
  await expect(page.locator("#right-panel")).not.toHaveClass(/collapsed/);
  await expect(page.locator("#sharedToolSection #segmentationToolSizeSection")).toBeVisible();
  await expect(page.locator("#segmentationSelectedRegionSummary")).toBeHidden();
  await expect(page.locator("#segmentationRegionActions")).toBeHidden();
  await page.locator("#segmentationEditModeBtn").click();
  await expect(page.locator("#sharedToolSection #segmentationToolSizeSection")).toBeHidden();
  await expect(page.locator("#segmentationSelectedRegionSummary")).toBeVisible();
  await expect(page.locator("#segmentationRegionActions")).toBeVisible();

  await page.locator("#collapse-right-panel-btn").click();
  await expect(page.locator("#right-panel")).toHaveClass(/collapsed/);
  await page.locator("#taskSegmentationDisplayBtn").click();
  await expect(page.locator("#right-panel")).not.toHaveClass(/collapsed/);
  await expect(page.locator("#inspectorTitle")).toHaveText("Mask Inspector");
  await expect(page.locator("#segmentationClassSection")).toBeVisible();
  await expect(page.locator("#detectionLeftWorkspace")).toBeHidden();
  await expect(page.locator("#segmentationDisplayWorkspace")).toBeVisible();
  await expect(page.locator("#left-panel #segmentationDisplaySection")).toBeVisible();
  await expect(page.locator("#right-panel #segmentationDisplaySection")).toHaveCount(0);
  await expect(page.locator("#segmentationDisplaySection summary")).toHaveCount(0);
  await expect(page.locator("#segmentationMaskVisibilityToggle")).toBeVisible();
  await expect(page.locator("#leftPanelTitle")).toHaveText("Mask Display");

  await page.locator("#taskSegmentationPreprocessingBtn").click();
  await expect(page.locator("#right-panel")).not.toHaveClass(/collapsed/);
  await expect(page.locator("#left-panel #segmentationPreprocessingSection")).toBeVisible();
  await expect(page.locator("#datasetConnectionStatus")).toBeHidden();
  await expect(page.getByText("Enhance SEM structure without changing source data.")).toHaveCount(0);

  await page.locator("#taskSuperpixelBtn").click();
  await expect(page.locator('#detectionLeftWorkspace')).toBeHidden();
  await expect(page.locator('#segmentationSuperpixelWorkspace')).toBeVisible();
  await expect(page.locator('#left-panel #segmentationSuperpixelSection')).toBeVisible();
  await expect(page.locator('#right-panel #segmentationSuperpixelSection')).toHaveCount(0);
  await expect(page.locator('#leftPanelTitle')).toHaveText('Superpixel Settings');
  await expect(page.locator('#openSegmentationFormatBtn')).toBeVisible();
  await expect(page.locator("#inspectorTitle")).toHaveText("Mask Inspector");

  await page.locator("#taskAnnotateBtn").click();
  await expect(page.locator('#detectionWorkflowPanel')).toBeVisible();
  await expect(page.locator('#segmentationWorkflowPanel')).toBeHidden();
  await expect(page.locator('#detectionLeftWorkspace')).toBeVisible();
  await expect(page.locator("#segmentationCanvasToolbar")).toBeHidden();
  await expect(page.locator("#detectionCanvasToolbar")).toBeVisible();
  await expect(page.locator("#undoBtn")).toBeEnabled();
  await page.locator("#undoBtn").click();
  await expect.poll(async () => {
    return page.evaluate(() => Reflect.get(window, '__easyLabelingTestApi')?.getRectCount?.() ?? 0);
  }).toBe(2);
});
