import { expect, test } from "@playwright/test";

type MockFileInit = string | ArrayBuffer;

test("segmentation draw creates overlay state and enables undo", async ({ page }) => {
  await page.addInitScript(() => {
    const imageMarkup = `
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400">
        <rect width="800" height="400" fill="#d6e5f3"/>
        <rect x="0" y="0" width="800" height="200" fill="#f8d9b5"/>
        <circle cx="400" cy="200" r="70" fill="#5678a6"/>
      </svg>
    `;

    class MockFileHandle {
      kind = "file";
      name: string;
      content: MockFileInit;
      type: string;

      constructor(name: string, content: MockFileInit, type?: string) {
        this.name = name;
        this.content = content;
        this.type = type ?? (this.name.endsWith('.png') ? 'image/png' : 'text/plain');
      }

      async getFile() {
        return new File([this.content], this.name, { type: this.type });
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
    imageFolder.setEntry("scene-a.png", new MockFileHandle("scene-a.png", imageMarkup, "image/svg+xml"));
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
      baseImages: api?.getCanvasLayerCounts?.().baseImages ?? 0,
      canUndo: api?.canUndo?.() ?? false
    };
  })).toEqual({ activeClassId: '1', baseImages: 1, canUndo: false });
  await page.waitForTimeout(1000);
  await page.locator('label[for="drawMode"]').click();

  const canvas = page.locator('.upper-canvas');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) {
    return;
  }

  const imagePlacement = {
    scale: Math.min(box.width / 800, box.height / 400) * 0.95,
    left: (box.width - (800 * Math.min(box.width / 800, box.height / 400) * 0.95)) / 2,
    top: (box.height - (400 * Math.min(box.width / 800, box.height / 400) * 0.95)) / 2
  };
  const imageCenter = {
    x: box.x + imagePlacement.left + (400 * imagePlacement.scale),
    y: box.y + imagePlacement.top + (200 * imagePlacement.scale)
  };
  const outsideImage = imagePlacement.left >= imagePlacement.top
    ? {
        x: box.x + Math.max(2, imagePlacement.left / 2),
        y: imageCenter.y
      }
    : {
        x: imageCenter.x,
        y: box.y + Math.max(2, imagePlacement.top / 2)
      };
  const imageTopLeftSample = {
    x: box.x + imagePlacement.left + (16 * imagePlacement.scale),
    y: box.y + imagePlacement.top + (16 * imagePlacement.scale)
  };
  const sampleLowerCanvasPixel = async (point: { x: number; y: number }) => page.evaluate((input) => {
    const canvas = document.querySelector<HTMLCanvasElement>('.lower-canvas');
    if (!canvas) {
      return null;
    }
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.max(0, Math.min(canvas.width - 1, Math.round((input.x - rect.left) * scaleX)));
    const y = Math.max(0, Math.min(canvas.height - 1, Math.round((input.y - rect.top) * scaleY)));
    const pixel = canvas.getContext('2d')?.getImageData(x, y, 1, 1).data;
    return pixel ? Array.from(pixel) : null;
  }, point);
  const colorDistance = (leftPixel: number[] | null, rightPixel: number[] | null): number => {
    if (!leftPixel || !rightPixel) {
      return Number.POSITIVE_INFINITY;
    }
    return Math.abs(leftPixel[0] - rightPixel[0]) +
      Math.abs(leftPixel[1] - rightPixel[1]) +
      Math.abs(leftPixel[2] - rightPixel[2]);
  };

  await page.mouse.move(outsideImage.x, outsideImage.y);
  await page.mouse.down();
  await page.mouse.move(outsideImage.x + 5, outsideImage.y, { steps: 2 });
  await page.mouse.up();

  await expect.poll(async () => page.evaluate(() => {
    const api = Reflect.get(window, '__easyLabelingTestApi') as {
      getSegmentationMaskBounds?: () => unknown;
    } | undefined;
    return api?.getSegmentationMaskBounds?.() ?? null;
  })).toBeNull();

  const centerPixelBefore = await sampleLowerCanvasPixel(imageCenter);
  const topLeftPixelBefore = await sampleLowerCanvasPixel(imageTopLeftSample);

  await page.mouse.move(imageCenter.x - 15, imageCenter.y - 5);
  await page.mouse.down();
  await page.mouse.move(imageCenter.x + 15, imageCenter.y + 5, { steps: 5 });
  await page.mouse.up();

  await expect.poll(async () => page.evaluate(() => Reflect.get(window, '__easyLabelingTestApi')?.canUndo?.() ?? false)).toBe(true);
  await expect.poll(async () => page.evaluate(() => {
    const api = Reflect.get(window, '__easyLabelingTestApi') as {
      getSegmentationSummary?: () => { visibleClassIds?: string[] } | null;
      getCanvasLayerCounts?: () => { baseImages: number };
    } | undefined;
    return {
      visibleClassIds: api?.getSegmentationSummary?.()?.visibleClassIds ?? [],
      baseImages: api?.getCanvasLayerCounts?.().baseImages ?? 0
    };
  })).toEqual({ visibleClassIds: ['1'], baseImages: 1 });
  await expect.poll(async () => page.evaluate(() => {
    const api = Reflect.get(window, '__easyLabelingTestApi') as {
      getSegmentationMaskBounds?: () => {
        left: number;
        top: number;
        right: number;
        bottom: number;
      } | null;
    } | undefined;
    const bounds = api?.getSegmentationMaskBounds?.() ?? null;
    if (!bounds) {
      return false;
    }
    return bounds.left <= 400 && bounds.right >= 400 && bounds.top <= 200 && bounds.bottom >= 200;
  })).toBe(true);

  const edgeOnSample = await page.evaluate(() => {
    const api = Reflect.get(window, '__easyLabelingTestApi') as {
      getSegmentationMaskBounds?: () => {
        left: number;
        top: number;
        right: number;
        bottom: number;
      } | null;
      getSegmentationClassAtPoint?: (x: number, y: number) => string | null;
      getSegmentationOverlayPixel?: (x: number, y: number) => number[] | null;
    } | undefined;
    const bounds = api?.getSegmentationMaskBounds?.() ?? null;
    if (!bounds) {
      return null;
    }
    let sample = null as { x: number; y: number } | null;
    for (let y = bounds.top; y <= bounds.bottom && !sample; y += 1) {
      for (let x = bounds.left; x <= bounds.right; x += 1) {
        if (api?.getSegmentationClassAtPoint?.(x, y) && !api?.getSegmentationClassAtPoint?.(x - 1, y)) {
          sample = { x, y };
          break;
        }
      }
    }
    if (!sample) {
      return null;
    }
    return {
      edge: api?.getSegmentationOverlayPixel?.(sample.x, sample.y) ?? null,
      halo: api?.getSegmentationOverlayPixel?.(sample.x - 1, sample.y) ?? null
    };
  });
  expect(edgeOnSample?.edge?.[3]).toBe(255);
  expect(edgeOnSample?.halo?.[3] ?? 0).toBeGreaterThan(0);

  await page.locator('#segmentationEdgeHighlightToggle').uncheck();
  await expect.poll(async () => page.evaluate(() => {
    const api = Reflect.get(window, '__easyLabelingTestApi') as {
      getSegmentationSummary?: () => { edgeHighlightVisible?: boolean } | null;
    } | undefined;
    return api?.getSegmentationSummary?.()?.edgeHighlightVisible ?? true;
  })).toBe(false);

  const edgeOffSample = await page.evaluate(() => {
    const api = Reflect.get(window, '__easyLabelingTestApi') as {
      getSegmentationMaskBounds?: () => {
        left: number;
        top: number;
        right: number;
        bottom: number;
      } | null;
      getSegmentationClassAtPoint?: (x: number, y: number) => string | null;
      getSegmentationOverlayPixel?: (x: number, y: number) => number[] | null;
    } | undefined;
    const bounds = api?.getSegmentationMaskBounds?.() ?? null;
    if (!bounds) {
      return null;
    }
    let sample = null as { x: number; y: number } | null;
    for (let y = bounds.top; y <= bounds.bottom && !sample; y += 1) {
      for (let x = bounds.left; x <= bounds.right; x += 1) {
        if (api?.getSegmentationClassAtPoint?.(x, y) && !api?.getSegmentationClassAtPoint?.(x - 1, y)) {
          sample = { x, y };
          break;
        }
      }
    }
    if (!sample) {
      return null;
    }
    return {
      edge: api?.getSegmentationOverlayPixel?.(sample.x, sample.y) ?? null,
      halo: api?.getSegmentationOverlayPixel?.(sample.x - 1, sample.y) ?? null
    };
  });
  const colorTotal = (pixel: number[] | null | undefined): number => pixel ? (pixel[0] + pixel[1] + pixel[2]) : 0;
  expect(colorTotal(edgeOnSample?.edge)).toBeGreaterThan(colorTotal(edgeOffSample?.edge) + 20);
  expect(edgeOffSample?.halo?.[3] ?? 0).toBe(0);

  const centerPixelAfter = await sampleLowerCanvasPixel(imageCenter);
  const topLeftPixelAfter = await sampleLowerCanvasPixel(imageTopLeftSample);
  expect(colorDistance(centerPixelBefore, centerPixelAfter)).toBeGreaterThan(30);
  expect(colorDistance(topLeftPixelBefore, topLeftPixelAfter)).toBeLessThan(20);
});
