import { expect, test } from "@playwright/test";

type MockFileInit = string | ArrayBuffer;

test("review segmentation: brush/erase fixes and needs-fix status persist through reload", async ({ page }) => {
  await page.addInitScript(() => {
    const writes: Array<{ fileName: string; kind: string }> = [];
    Object.defineProperty(window, "__mockWrites", { value: writes, configurable: true });

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
            writes.push({ fileName: this.name, kind: typeof data === "string" ? "text" : "binary" });
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
    imageFolder.setEntry("mask", new MockDirectoryHandle("mask"));
    const reviewFolder = new MockDirectoryHandle("review");
    reviewFolder.setEntry("detection", new MockDirectoryHandle("detection"));
    reviewFolder.setEntry("segmentation", new MockDirectoryHandle("segmentation"));
    imageFolder.setEntry("review", reviewFolder);

    Object.defineProperty(window, "showDirectoryPicker", {
      configurable: true,
      writable: true,
      value: async () => imageFolder
    });
  });

  await page.goto("/index.html");
  await page.locator("#selectImageFolderBtn").click();
  await expect.poll(async () => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi")?.getCurrentImageName?.() ?? "")).toBe("scene-a.png");
  await page.waitForTimeout(1000);

  await page.locator('label[for="reviewWorkflowTab"]').click();
  await page.selectOption('#reviewTargetSelect', 'segmentation');
  await expect(page.locator('#segmentationWorkflowPanel')).toBeVisible();
  await expect(page.locator('#reviewWorkflowPanel')).toBeVisible();
  await expect.poll(async () => page.evaluate(() => {
    const api = Reflect.get(window, '__easyLabelingTestApi');
    return {
      activeClassId: api?.getSegmentationSummary?.()?.activeClassId ?? null,
      imageCount: api?.getCanvasObjectCounts?.().image ?? 0
    };
  })).toEqual({ activeClassId: '1', imageCount: 1 });
  await page.waitForTimeout(1000);

  const canvas = page.locator('.upper-canvas');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) {
    return;
  }

  await page.locator('#segmentationMaskOpacitySlider').evaluate((element) => {
    if (!(element instanceof HTMLInputElement)) return;
    element.value = '35';
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await expect(page.locator('#segmentationMaskOpacityValue')).toContainText('35');
  await expect.poll(async () => page.evaluate(() => Reflect.get(window, '__easyLabelingTestApi')?.getSegmentationSummary?.()?.overlayOpacity ?? null)).toBe(0.35);

  await page.mouse.move(box.x + 40, box.y + 40);
  await page.mouse.down();
  await page.mouse.move(box.x + 75, box.y + 55, { steps: 5 });
  await page.mouse.up();

  await expect.poll(async () => page.evaluate(() => Reflect.get(window, '__easyLabelingTestApi')?.getSegmentationSummary?.()?.visibleClassIds ?? [])).toEqual(['1']);
  await expect.poll(async () => page.evaluate(() => Reflect.get(window, '__easyLabelingTestApi')?.canUndo?.() ?? false)).toBe(true);

  await page.locator('#segmentationEraseModeBtn').click();
  const classToggle = page.locator('[data-ui="segmentation-class-visibility-toggle"][data-class-id="1"]');
  await expect(classToggle).toBeVisible();
  await classToggle.uncheck();
  await expect.poll(async () => page.evaluate(() => Reflect.get(window, '__easyLabelingTestApi')?.getSegmentationSummary?.()?.visibleClassIds ?? [])).toEqual([]);
  await classToggle.check();
  await expect.poll(async () => page.evaluate(() => Reflect.get(window, '__easyLabelingTestApi')?.getSegmentationSummary?.()?.visibleClassIds ?? [])).toEqual(['1']);

  await page.mouse.move(box.x + 42, box.y + 42);
  await page.mouse.down();
  await page.mouse.move(box.x + 50, box.y + 45, { steps: 2 });
  await page.mouse.up();
  await expect.poll(async () => page.evaluate(() => Reflect.get(window, '__easyLabelingTestApi')?.canUndo?.() ?? false)).toBe(true);

  await page.locator('#segmentationBrushModeBtn').click();
  await page.mouse.move(box.x + 60, box.y + 48);
  await page.mouse.down();
  await page.mouse.move(box.x + 68, box.y + 52, { steps: 2 });
  await page.mouse.up();
  await expect.poll(async () => page.evaluate(() => Reflect.get(window, '__easyLabelingTestApi')?.getSegmentationSummary?.()?.visibleClassIds ?? [])).toEqual(['1']);

  await page.locator('#reviewNeedsFixBtn').click();
  await expect(page.locator('#reviewStatusNeedsFix')).toBeChecked();

  await expect.poll(async () => {
    return page.evaluate(() => {
      const writes = Reflect.get(window, '__mockWrites');
      return Array.isArray(writes) ? writes.map((entry) => entry.fileName).sort() : [];
    });
  }).toEqual(expect.arrayContaining(['scene-a.png', 'scene-a.seg.json', 'scene-a.review.json']));

  await page.locator('#selectImageFolderBtn').click();
  await expect.poll(async () => page.evaluate(() => Reflect.get(window, '__easyLabelingTestApi')?.getCurrentImageName?.() ?? '')).toBe('scene-a.png');
  await page.waitForTimeout(1000);

  await page.locator('label[for="reviewWorkflowTab"]').click();
  await page.selectOption('#reviewTargetSelect', 'segmentation');
  await expect.poll(async () => page.evaluate(() => {
    const api = Reflect.get(window, '__easyLabelingTestApi');
    return {
      activeClassId: api?.getSegmentationSummary?.()?.activeClassId ?? null,
      imageCount: api?.getCanvasObjectCounts?.().image ?? 0
    };
  })).toEqual({ activeClassId: '1', imageCount: 1 });
  await page.waitForTimeout(1000);
  await expect(page.locator('#reviewStatusNeedsFix')).toBeChecked();
  await expect.poll(async () => page.evaluate(() => Reflect.get(window, '__easyLabelingTestApi')?.getSegmentationSummary?.()?.visibleClassIds ?? [])).toEqual(['1']);
});
