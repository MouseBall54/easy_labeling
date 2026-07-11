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

  await page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi")?.selectRectsByIndex?.([0, 1]));
  await page.keyboard.press("3");
  await expect(page.locator("#undoBtn")).toBeEnabled();

  await page.locator('label[for="segmentationWorkflowTab"]').click();
  await expect(page.locator('#detectionWorkflowPanel')).toBeHidden();
  await expect(page.locator('#segmentationWorkflowPanel')).toBeVisible();
  await expect(page.locator('#segmentationActiveClassSummary')).toContainText('Active Class');

  await page.locator('label[for="detectionWorkflowTab"]').click();
  await expect(page.locator('#detectionWorkflowPanel')).toBeVisible();
  await expect(page.locator('#segmentationWorkflowPanel')).toBeHidden();
  await expect(page.locator("#undoBtn")).toBeEnabled();
  await page.locator("#undoBtn").click();
  await expect.poll(async () => {
    return page.evaluate(() => Reflect.get(window, '__easyLabelingTestApi')?.getRectCount?.() ?? 0);
  }).toBe(2);
});
