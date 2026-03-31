import { expect, test } from "@playwright/test";

type MockFileInit = string | ArrayBuffer;

test("segmentation draw creates overlay state and enables undo", async ({ page }) => {
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
        return new File([this.content], this.name, { type: this.name.endsWith('.png') ? 'image/png' : 'text/plain' });
      }

      async createWritable() {
        return {
          write: async (data: string) => {
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
    imageFolder.setEntry("label", new MockDirectoryHandle("label"));

    Object.defineProperty(window, "showDirectoryPicker", {
      configurable: true,
      writable: true,
      value: async () => imageFolder
    });
  });

  await page.goto('/index.html');
  await page.locator('#selectImageFolderBtn').click();
  await expect.poll(async () => page.evaluate(() => Reflect.get(window, '__easyLabelingTestApi')?.getCurrentImageName?.() ?? '')).toBe('scene-a.png');
  await page.waitForTimeout(1000);

  await page.locator('label[for="segmentationWorkflowTab"]').click();
  await expect.poll(async () => page.evaluate(() => {
    const api = Reflect.get(window, '__easyLabelingTestApi');
    return {
      activeClassId: api?.getSegmentationSummary?.()?.activeClassId ?? null,
      imageCount: api?.getCanvasObjectCounts?.().image ?? 0,
      canUndo: api?.canUndo?.() ?? false
    };
  })).toEqual({ activeClassId: '1', imageCount: 1, canUndo: false });
  await page.waitForTimeout(1000);
  await page.locator('label[for="drawMode"]').click();

  const canvas = page.locator('.upper-canvas');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) {
    return;
  }

  await page.mouse.move(box.x + 40, box.y + 40);
  await page.mouse.down();
  await page.mouse.move(box.x + 70, box.y + 50, { steps: 5 });
  await page.mouse.up();

  await expect.poll(async () => page.evaluate(() => Reflect.get(window, '__easyLabelingTestApi')?.canUndo?.() ?? false)).toBe(true);
  await expect.poll(async () => page.evaluate(() => {
    const api = Reflect.get(window, '__easyLabelingTestApi') as {
      getSegmentationSummary?: () => { visibleClassIds?: string[] } | null;
      getCanvasObjectCounts?: () => Record<string, number>;
    } | undefined;
    return {
      visibleClassIds: api?.getSegmentationSummary?.()?.visibleClassIds ?? [],
      imageCount: api?.getCanvasObjectCounts?.().image ?? 0
    };
  })).toEqual({ visibleClassIds: ['1'], imageCount: 1 });
});
