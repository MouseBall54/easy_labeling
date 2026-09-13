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
    imageFolder.setEntry("scene-b.png", new MockFileHandle("scene-b.png", imageMarkup, "image/svg+xml"));
    const labelFolder = new MockDirectoryHandle("label");
    labelFolder.setEntry("classes.yaml", new MockFileHandle("classes.yaml", "0: Background\n1: Foreground\n3: Detail\n"));
    imageFolder.setEntry("label", labelFolder);

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
      requiresClassSelection: api?.getSegmentationSummary?.()?.requiresClassSelection ?? null,
      baseImages: api?.getCanvasLayerCounts?.().baseImages ?? 0,
      canUndo: api?.canUndo?.() ?? false
    };
  })).toEqual({ activeClassId: '1', requiresClassSelection: false, baseImages: 1, canUndo: false });
  await expect(page.locator("#segmentationActiveClassSummary")).toContainText("Painting: 1");
  await expect(page.locator("#segmentationBrushModeBtn")).toBeEnabled();
  await page.locator("#segmentationBrushModeBtn").click();
  await expect(page.locator("#segmentationToolSizeValue")).toHaveText("6px");
  await page.keyboard.press("NumpadAdd");
  await expect(page.locator("#segmentationToolSizeValue")).toHaveText("7px");
  await expect(page.locator("#segmentationBrushModeBtn")).toHaveClass(/active/);
  await page.locator("#segmentationEraseModeBtn").click();
  await page.keyboard.press("NumpadSubtract");
  await expect(page.locator("#segmentationToolSizeValue")).toHaveText("6px");
  await expect(page.locator("#segmentationEraseModeBtn")).toHaveClass(/active/);
  await page.locator("#segmentationBrushModeBtn").click();
  await page.locator("#taskPreprocessingBtn").click();
  await expect(page.locator("#segmentationPreprocessingSection")).toBeVisible();
  await expect(page.locator("#segmentationViewOriginalBtn")).toHaveClass(/active/);
  await expect(page.locator("#segmentationSrSettingsGroup")).toBeHidden();
  await expect(page.locator("#segmentationPreprocessSettingsGroup")).toBeHidden();
  await expect(page.locator("#segmentationSrRoiGroup")).toBeVisible();
  await expect(page.locator("#segmentationPreprocessingInputs")).toBeVisible();
  await page.locator("#segmentationViewProcessedBtn").click();
  await expect(page.locator("#segmentationViewProcessedBtn")).toHaveClass(/active/);
  await expect(page.locator("#segmentationViewProcessedBtn")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#segmentationSrSettingsGroup")).toBeHidden();
  await expect(page.locator("#segmentationPreprocessSettingsGroup")).toBeVisible();
  await page.locator("#segmentationViewOriginalBtn").click();
  await expect(page.locator("#segmentationViewOriginalBtn")).toHaveClass(/active/);
  await expect(page.locator("#segmentationSrSettingsGroup")).toBeHidden();
  await expect(page.locator("#segmentationPreprocessSettingsGroup")).toBeHidden();
  await expect(page.locator("#segmentationSuperResolutionSelect option")).toHaveText(["Off", "CFSR x2", "CFSR x4", "tk_r_em hrsem", "tk_r_em hrtem", "tk_r_em lrsem", "tk_r_em lrtem"]);
  await expect(page.locator("#segmentationEdgeSamInputSelect option")).toHaveText(["Original", "Original Processed", "AI", "Processed AI"]);
  await expect(page.locator("#segmentationSuperpixelInputSelect option")).toHaveText(["Original", "Original Processed", "AI", "Processed AI"]);
  const viewButtonTopOffsets = await page.locator(".segmentation-preprocessing-toggle .btn").evaluateAll((buttons) =>
    buttons.map((button) => button.getBoundingClientRect().top)
  );
  expect(new Set(viewButtonTopOffsets).size).toBe(1);
  await expect(page.locator("#segmentationResetSrRoiBtn")).toBeDisabled();
  await expect(page.locator("#segmentationResetSrViewBtn")).toHaveCount(0);
  await expect(page.locator(".segmentation-sr-preview-actions .btn")).toHaveCount(2);
  const previewActionTopOffsets = await page.locator(".segmentation-sr-preview-actions .btn").evaluateAll((buttons) =>
    buttons.map((button) => button.getBoundingClientRect().top)
  );
  expect(new Set(previewActionTopOffsets).size).toBe(1);
  await page.setViewportSize({ width: 900, height: 720 });
  const compactSrLayout = await page.evaluate(() => {
    const blocks = [
      document.querySelector<HTMLElement>(".segmentation-sr-roi-controls"),
      document.querySelector<HTMLElement>(".segmentation-sr-roi-summary"),
      document.querySelector<HTMLElement>(".segmentation-sr-preview-actions")
    ].filter((element): element is HTMLElement => element !== null);
    return blocks.map((element) => ({ clientWidth: element.clientWidth, scrollWidth: element.scrollWidth }));
  });
  expect(compactSrLayout).toHaveLength(3);
  compactSrLayout.forEach(({ clientWidth, scrollWidth }) => expect(scrollWidth).toBeLessThanOrEqual(clientWidth));
  const compactPanel = await page.locator("#segmentationPreprocessingSection").evaluate((section) => ({
    clientWidth: section.clientWidth,
    scrollWidth: section.scrollWidth
  }));
  expect(compactPanel.scrollWidth).toBeLessThanOrEqual(compactPanel.clientWidth);
  const lightSurface = await page.locator(".segmentation-sr-roi-summary").evaluate((element) => {
    const style = getComputedStyle(element);
    return { background: style.backgroundColor, border: style.borderColor };
  });
  expect(lightSurface.background).not.toBe("rgba(0, 0, 0, 0)");
  expect(lightSurface.border).not.toBe("rgba(0, 0, 0, 0)");
  await page.locator('label[for="darkModeToggle"]').click();
  const darkSurface = await page.locator(".segmentation-sr-roi-summary").evaluate((element) => {
    const style = getComputedStyle(element);
    return { background: style.backgroundColor, border: style.borderColor };
  });
  expect(darkSurface.background).not.toBe("rgba(0, 0, 0, 0)");
  expect(darkSurface.border).not.toBe("rgba(0, 0, 0, 0)");
  expect(darkSurface.background).not.toBe(lightSurface.background);
  await page.locator('label[for="darkModeToggle"]').click();
  const srControlOrder = await page.evaluate(() => {
    const model = document.querySelector<HTMLElement>(".segmentation-sr-model-control")?.getBoundingClientRect();
    const roi = document.querySelector<HTMLElement>(".segmentation-sr-roi-controls")?.getBoundingClientRect();
    return model && roi ? { modelBottom: model.bottom, roiTop: roi.top } : null;
  });
  expect(srControlOrder).not.toBeNull();
  expect(srControlOrder?.modelBottom ?? 1).toBeLessThanOrEqual(srControlOrder?.roiTop ?? 0);
  await page.setViewportSize({ width: 1280, height: 720 });
  await expect.poll(() => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi")?.getSegmentationSrRoi?.() ?? null)).toBeNull();
  await page.locator("#segmentationViewSrBtn").click();
  await expect(page.locator("#segmentationSrSettingsGroup")).toBeVisible();
  await expect(page.locator("#segmentationPreprocessSettingsGroup")).toBeHidden();
  await expect(page.locator("#segmentationSrRoiGroup")).toBeVisible();
  await expect.poll(() => page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi");
    return {
      roi: api?.getSegmentationSrRoi?.() ?? null,
      selecting: api?.isSegmentationSrRoiSelecting?.() ?? false,
      pickerOpen: document.getElementById("segmentationSrModePicker")?.classList.contains("is-open") ?? false
    };
  })).toEqual({ roi: null, selecting: true, pickerOpen: false });
  await expect(page.locator("#segmentationSelectSrRoiBtn")).toHaveClass(/is-selecting/);
  await expect(page.locator("#segmentationSelectSrRoiBtn")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#segmentationSrModePicker")).toBeHidden();
  const canvas = page.locator('.upper-canvas');
  let box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;
  await page.mouse.move(box.x + (box.width / 2) - 32, box.y + (box.height / 2) - 24);
  await page.mouse.down();
  await page.mouse.move(box.x + (box.width / 2) + 32, box.y + (box.height / 2) + 24, { steps: 4 });
  await page.mouse.up();
  await expect(page.locator("#segmentationSrRoiStatus")).not.toHaveText("No ROI selected");
  await expect(page.locator("#segmentationSelectSrRoiBtn")).not.toHaveClass(/is-selecting/);
  await expect(page.locator("#segmentationSelectSrRoiBtn")).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("#segmentationResetSrRoiBtn")).toBeEnabled();
  const roiRows = await page.evaluate(() => {
    const controls = document.querySelector<HTMLElement>(".segmentation-sr-roi-controls")?.getBoundingClientRect();
    const summary = document.querySelector<HTMLElement>(".segmentation-sr-roi-summary")?.getBoundingClientRect();
    const buttons = [...document.querySelectorAll<HTMLElement>(".segmentation-sr-roi-controls .btn")].map((button) => button.getBoundingClientRect());
    return {
      buttonTops: buttons.map((button) => button.top),
      controlsBottom: controls?.bottom ?? 0,
      summaryTop: summary?.top ?? 0,
      controlsOverflow: controls ? Math.max(0, ...buttons.map((button) => button.right - controls.right)) : 1
    };
  });
  expect(new Set(roiRows.buttonTops).size).toBe(1);
  expect(roiRows.summaryTop).toBeGreaterThanOrEqual(roiRows.controlsBottom);
  expect(roiRows.controlsOverflow).toBe(0);
  await expect(page.locator("#segmentationSrModePicker")).toBeVisible();
  await expect(page.locator("#segmentationSrModePicker [data-segmentation-sr-mode]")).toHaveText(["CFSR x2", "CFSR x4", "tk_r_em hrsem", "tk_r_em hrtem", "tk_r_em lrsem", "tk_r_em lrtem"]);
  await page.locator('[data-segmentation-sr-mode="cfsr-x2"]').click();
  await expect(page.locator("#segmentationSuperResolutionSelect")).toHaveValue("cfsr-x2", { timeout: 60_000 });
  await expect(page.locator("#segmentationViewSrBtn")).toHaveClass(/active/);
  await expect.poll(() => page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi") as {
      getCanvasBaseImageInfo?: () => { width: number; height: number; sourceWidth: number; sourceHeight: number } | null;
      getSegmentationViewSource?: () => string | null;
      getSegmentationSrPreviewInfo?: () => { mode: string; workingWidth: number; workingHeight: number; visible: boolean } | null;
      getCanvasViewportTransform?: () => [number, number, number, number, number, number];
    } | undefined;
    return {
      image: api?.getCanvasBaseImageInfo?.() ?? null,
      viewSource: api?.getSegmentationViewSource?.() ?? null,
      preview: api?.getSegmentationSrPreviewInfo?.() ?? null,
      zoom: api?.getCanvasViewportTransform?.()[0] ?? null
    };
  })).toMatchObject({
    image: { width: 800, height: 400, sourceWidth: 800, sourceHeight: 400 },
    viewSource: "sr-roi",
    preview: { mode: "cfsr-x2", visible: true },
    zoom: 2
  });
  await expect.poll(() => page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi");
    return {
      edgeSam: api?.getSegmentationEdgeSamInputSource?.() ?? null,
      superpixel: api?.getSegmentationSuperpixelInputSource?.() ?? null
    };
  })).toEqual({ edgeSam: "sr-roi", superpixel: "sr-roi" });
  await expect(page.locator("#segmentationEdgeSamInputSelect")).toHaveValue("sr-roi");
  await expect(page.locator("#segmentationSuperpixelInputSelect")).toHaveValue("sr-roi");
  await expect(page.locator("#segmentationSrResultStatus")).toContainText(/Original .* → CFSR x2 .* · coordinates: Original/);
  await page.locator("#segmentationViewOriginalBtn").click();
  await expect(page.locator("#segmentationViewOriginalBtn")).toHaveClass(/active/);
  await expect(page.locator("#segmentationSrSettingsGroup")).toBeHidden();
  await expect(page.locator("#segmentationPreprocessSettingsGroup")).toBeHidden();
  await expect(page.locator("#segmentationSuperResolutionSelect")).toHaveValue("cfsr-x2");
  await expect(page.locator("#segmentationPreprocessModeSelect")).toHaveValue("edge-blend");
  await expect(page.locator("#segmentationPreprocessSourceSelect")).toHaveValue("original");
  await page.locator("#segmentationViewSrBtn").click();
  await expect(page.locator("#segmentationSrSettingsGroup")).toBeVisible();
  await expect(page.locator("#segmentationPreprocessSettingsGroup")).toBeHidden();
  const compareButton = page.locator("#segmentationCompareOriginalBtn");
  await expect(compareButton).toBeEnabled();
  const compareBox = await compareButton.boundingBox();
  expect(compareBox).not.toBeNull();
  if (!compareBox) return;
  await page.mouse.move(compareBox.x + (compareBox.width / 2), compareBox.y + (compareBox.height / 2));
  await page.mouse.down();
  await expect.poll(() => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi")?.getSegmentationSrPreviewInfo?.()?.visible ?? true)).toBe(false);
  await page.mouse.up();
  await expect.poll(() => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi")?.getSegmentationSrPreviewInfo?.()?.visible ?? false)).toBe(true);
  await page.locator("#segmentationFocusSrRoiBtn").click();
  await expect.poll(() => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi")?.getCanvasViewportTransform?.()[0] ?? null)).toBe(2);
  await page.locator("#segmentationSuperResolutionSelect").selectOption("tk-r-em-hrsem");
  await expect(page.locator("#segmentationSuperResolutionSelect")).toHaveValue("tk-r-em-hrsem", { timeout: 60_000 });
  await expect.poll(() => page.evaluate(() => {
    const preview = Reflect.get(window, "__easyLabelingTestApi")?.getSegmentationSrPreviewInfo?.();
    return preview ? {
      mode: preview.mode,
      sameSize: preview.workingWidth === preview.originalRoi.width && preview.workingHeight === preview.originalRoi.height,
      zoom: Reflect.get(window, "__easyLabelingTestApi")?.getCanvasViewportTransform?.()[0] ?? null
    } : null;
  }), { timeout: 60_000 }).toEqual({ mode: "tk-r-em-hrsem", sameSize: true, zoom: 1 });
  await expect(page.locator("#segmentationSrResultStatus")).toContainText(/→ tk_r_em hrsem .* · coordinates: Original/);
  await page.locator("#segmentationResetSrRoiBtn").click();
  await expect(page.locator("#segmentationResetSrRoiBtn")).toBeDisabled();
  await expect(page.locator("#segmentationSuperResolutionSelect")).toHaveValue("off");
  await expect(page.locator("#segmentationPreprocessSourceSelect")).toHaveValue("original");
  await expect(page.locator("#segmentationEdgeSamInputSelect")).toHaveValue("original");
  await expect(page.locator("#segmentationSuperpixelInputSelect")).toHaveValue("original");
  await expect(page.locator("#segmentationViewOriginalBtn")).toHaveClass(/active/);
  await expect(page.locator("#segmentationSrRoiStatus")).toHaveText("No ROI selected");
  await expect(page.locator("#segmentationSrResultStatus")).toHaveText("Select an ROI to enable AI enhancement.");
  await expect.poll(() => page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi");
    return {
      roi: api?.getSegmentationSrRoi?.() ?? null,
      preview: api?.getSegmentationSrPreviewInfo?.() ?? null,
      viewSource: api?.getSegmentationViewSource?.() ?? null
    };
  })).toEqual({ roi: null, preview: null, viewSource: "original" });
  await page.locator("#nextImageBtn").click();
  await expect.poll(() => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi")?.getCurrentImageName?.() ?? "")).toBe("scene-b.png");
  await expect(page.locator("#segmentationSelectSrRoiBtn")).not.toHaveClass(/is-selecting/);
  await expect(page.locator("#segmentationSelectSrRoiBtn")).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("#segmentationResetSrRoiBtn")).toBeDisabled();
  await expect(page.locator("#segmentationSrRoiStatus")).toHaveText("No ROI selected");
  await expect.poll(() => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi")?.getSegmentationSrPreviewInfo?.() ?? null)).toBeNull();
  await page.locator("#resetZoomBtn").click();
  await expect.poll(() => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi")?.getCanvasViewportTransform?.()[0] ?? 2)).toBeLessThan(2);
  box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;
  await page.locator("#segmentationBrushModeBtn").click();
  await expect.poll(async () => page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi") as {
      getSegmentationSummary?: () => { activeTool?: string } | null;
    } | undefined;
    return api?.getSegmentationSummary?.()?.activeTool ?? null;
  })).toBe("brush");

  const imagePlacement = {
    scale: Math.min(box.width / 800, box.height / 400) * 0.95,
    left: (box.width - (800 * Math.min(box.width / 800, box.height / 400) * 0.95)) / 2,
    top: (box.height - (400 * Math.min(box.width / 800, box.height / 400) * 0.95)) / 2
  };
  const imageCenter = {
    x: box.x + imagePlacement.left + (400 * imagePlacement.scale),
    y: box.y + imagePlacement.top + (200 * imagePlacement.scale)
  };
  const getRenderedPixelAt = async (point: { x: number; y: number }): Promise<number[] | null> => page.evaluate(
    ({ x, y }) => {
      const lowerCanvas = document.getElementById("canvas") as HTMLCanvasElement | null;
      if (!lowerCanvas) {
        return null;
      }
      const pixel = lowerCanvas.getContext("2d")?.getImageData(Math.round(x), Math.round(y), 1, 1).data;
      return pixel ? Array.from(pixel) : null;
    },
    { x: point.x - box.x, y: point.y - box.y }
  );
  const outsideImage = imagePlacement.left >= imagePlacement.top
    ? {
        x: box.x + Math.max(2, imagePlacement.left / 2),
        y: imageCenter.y
      }
    : {
        x: imageCenter.x,
        y: box.y + box.height - Math.max(2, imagePlacement.top / 2)
      };
  const imageTopLeftSample = {
    x: box.x + imagePlacement.left + (16 * imagePlacement.scale),
    y: box.y + imagePlacement.top + (16 * imagePlacement.scale)
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
  await page.waitForTimeout(100);

  await page.locator("#segmentationEraseModeBtn").click();
  await expect.poll(() => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi")?.getSegmentationSummary?.()?.activeTool ?? null)).toBe("erase");
  await page.mouse.move(imageCenter.x, imageCenter.y - 10);
  await page.mouse.down();
  await page.mouse.move(imageCenter.x, imageCenter.y + 10, { steps: 4 });
  await page.mouse.up();
  await expect.poll(async () => page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi") as {
      getSegmentationClassAtPoint?: (x: number, y: number) => string | null;
    } | undefined;
    return api?.getSegmentationClassAtPoint?.(400, 200) ?? null;
  })).toBeNull();
  await page.locator("#segmentationBrushModeBtn").click();
  await page.waitForTimeout(100);
  await expect.poll(async () => page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi") as {
      getSegmentationClassAtPoint?: (x: number, y: number) => string | null;
    } | undefined;
    return api?.getSegmentationClassAtPoint?.(400, 200) ?? null;
  })).toBeNull();

  await page.keyboard.press("3");
  await page.locator("#segmentationSuperpixelModeBtn").click();
  await expect.poll(async () => page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi") as {
      getSegmentationSummary?: () => { activeTool?: string } | null;
    } | undefined;
    return api?.getSegmentationSummary?.()?.activeTool ?? null;
  })).toBe("superpixel");
  await page.mouse.click(imageCenter.x, imageCenter.y);
  await expect.poll(async () => page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi") as {
      getSegmentationClassAtPoint?: (x: number, y: number) => string | null;
    } | undefined;
    return api?.getSegmentationClassAtPoint?.(400, 200) ?? null;
  })).toBe("3");

  await page.locator("#segmentationEraseModeBtn").click();
  await page.mouse.move(imageCenter.x, imageCenter.y - 10);
  await page.mouse.down();
  await page.mouse.move(imageCenter.x, imageCenter.y + 10, { steps: 4 });
  await page.mouse.up();
  await expect.poll(async () => page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi") as {
      getSegmentationClassAtPoint?: (x: number, y: number) => string | null;
    } | undefined;
    return api?.getSegmentationClassAtPoint?.(400, 200) ?? null;
  })).toBeNull();
  await page.locator("#segmentationBrushModeBtn").click();
  await page.waitForTimeout(100);
  await expect.poll(async () => page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi") as {
      getSegmentationClassAtPoint?: (x: number, y: number) => string | null;
    } | undefined;
    return api?.getSegmentationClassAtPoint?.(400, 200) ?? null;
  })).toBeNull();
});
