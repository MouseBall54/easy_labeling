import { expect, test } from "@playwright/test";

test("bundled sample test loads labeled cars and applies the prepared template layout", async ({ page }) => {
  test.setTimeout(90_000);
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(window, "showDirectoryPicker", {
      configurable: true,
      value: async () => {
        throw new DOMException("Not used by bundled sample test", "AbortError");
      }
    });
  });

  await page.goto("/index.html");
  await expect(page.locator("#loadSampleTestBtn")).toHaveCount(0);
  await expect(page.locator("#emptyLoadSampleBtn")).toBeVisible();
  await page.locator("#emptyLoadSampleBtn").click();

  await expect.poll(async () => page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi") as {
      getCurrentImageName?: () => string;
      getRectCount?: () => number;
    } | undefined;
    return {
      image: api?.getCurrentImageName?.() ?? "",
      boxes: api?.getRectCount?.() ?? -1
    };
  }), { timeout: 30_000 }).toEqual({ image: "sample_1.jpg", boxes: 52 });

  await expect(page.locator("#image-list [data-file-name]")).toHaveCount(3);
  await expect(page.locator("#class-file-select option")).toContainText(["classes.yaml"]);
  await expect(page.locator("#boxLayoutSelect option")).toHaveCount(2);
  await expect(page.locator("#automationPresetSelect option")).toHaveCount(3);
  await expect(page.locator("#boxLayoutSelect")).toHaveValue("sample-color-grid-layout");
  await expect(page.locator("#automationPresetSelect")).toHaveValue("sample-layout-preset");
  await expect(page.locator("#layoutPlacementNotice")).toContainText("preview hidden");

  const labelListLayout = await page.locator('[data-ui="label-list-item"]').first().evaluate((item) => {
    const panel = document.querySelector<HTMLElement>("#label-list");
    const name = item.querySelector<HTMLElement>(".label-list-item-name");
    return {
      rowHeight: item.getBoundingClientRect().height,
      fontSize: Number.parseFloat(getComputedStyle(item).fontSize),
      nameWhiteSpace: name ? getComputedStyle(name).whiteSpace : "",
      hasHorizontalOverflow: panel ? panel.scrollWidth > panel.clientWidth : true
    };
  });
  expect(labelListLayout.rowHeight).toBeLessThanOrEqual(34);
  expect(labelListLayout.fontSize).toBeLessThanOrEqual(11);
  expect(labelListLayout.nameWhiteSpace).toBe("nowrap");
  expect(labelListLayout.hasHorizontalOverflow).toBe(false);

  const expectSampleImage = async (image: string, boxes: number): Promise<void> => {
    await expect.poll(async () => page.evaluate(() => {
      const api = Reflect.get(window, "__easyLabelingTestApi") as {
        getCurrentImageName?: () => string;
        getRectCount?: () => number;
      } | undefined;
      return {
        image: api?.getCurrentImageName?.() ?? "",
        boxes: api?.getRectCount?.() ?? -1
      };
    })).toEqual({ image, boxes });
  };

  await page.locator('#image-list [data-file-name="sample_2.jpg"]').click();
  await expectSampleImage("sample_2.jpg", 92);
  await page.locator('#image-list [data-file-name="sample_3.jpg"]').click();
  await expectSampleImage("sample_3.jpg", 59);
  await page.locator('#image-list [data-file-name="sample_1.jpg"]').click();
  await expectSampleImage("sample_1.jpg", 52);

  const inspectorTracks = await page.locator("#detectionWorkflowPanel .inspector-tabs").evaluate((element) => {
    return getComputedStyle(element).gridTemplateColumns.split(" ").map(Number.parseFloat);
  });
  expect(inspectorTracks).toHaveLength(2);
  expect(Math.abs((inspectorTracks[0] ?? 0) - (inspectorTracks[1] ?? 0))).toBeLessThanOrEqual(1);

  await page.locator("#taskAutomateBtn").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#inspectorAutomationPane")).toBeVisible();
  await expect(page.locator("#left-panel")).not.toHaveClass(/collapsed/);
  await expect(page.locator("#left-panel")).toBeVisible();

  const templateSetupButton = page.locator("#openTemplateMatchingBtn");
  await templateSetupButton.focus();
  await page.keyboard.press("Enter");
  const keyboardTemplateModal = page.locator("#templateMatchingModal");
  await expect(keyboardTemplateModal).toBeVisible();
  await expect(page.locator("#templatePresetSelect option")).toHaveCount(3);
  await expect(page.locator("#templatePresetSelect")).toHaveValue("sample-layout-preset");
  await page.locator("#templatePresetSelect").selectOption("sample-multiple-preset");
  await expect(page.locator("#templateNameInput")).toHaveValue("Sample Pink Vehicle Finder");
  await expect(page.locator("#templateOutputMultipleRadio")).toBeChecked();
  await page.locator("#templatePresetSelect").selectOption("sample-layout-preset");
  await expect(page.locator("#templateNameInput")).toHaveValue("Sample Pink Anchor + Layout");
  await expect(page.locator("#templateWorkspaceZoomInput")).toHaveAttribute("min", "1");
  await expect(page.locator("#templateWorkspaceZoomInput")).toHaveAttribute("max", "1000");
  await expect(page.locator("#templateWorkspaceFitBtn")).toBeVisible();
  await expect.poll(async () => Number(await page.locator("#templateWorkspaceZoomInput").inputValue()))
    .toBeLessThan(100);
  const templateZoomBeforeWheel = Number(await page.locator("#templateWorkspaceZoomInput").inputValue());
  await page.locator("#templateWorkspaceScroller").hover();
  await page.keyboard.down("Control");
  await page.mouse.wheel(0, -100);
  await page.keyboard.up("Control");
  await expect.poll(async () => Number(await page.locator("#templateWorkspaceZoomInput").inputValue()))
    .toBeGreaterThan(templateZoomBeforeWheel);
  await expect.poll(async () => page.evaluate(() => {
    return document.querySelector("#templateMatchingModal")?.contains(document.activeElement) ?? false;
  })).toBe(true);
  for (let index = 0; index < 8; index += 1) {
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => {
      return document.querySelector("#templateMatchingModal")?.contains(document.activeElement) ?? false;
    })).toBe(true);
  }
  await expect(templateSetupButton).toBeEnabled({ timeout: 30_000 });
  await page.keyboard.press("Escape");
  await expect(keyboardTemplateModal).toBeHidden();
  await expect(templateSetupButton).toBeFocused();

  await page.locator("#taskAnnotateBtn").focus();
  await page.keyboard.press("Enter");
  await page.locator("#inspectorTransformTabBtn").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#inspectorTransformPane")).toBeVisible();

  await page.locator("#openLayoutSetupBtn").click();
  await expect(page.locator("#layoutSetupModal")).toBeVisible();
  await expect(page.locator("#layoutDetails")).toContainText("4 boxes");
  await expect(page.locator("#layoutDetails")).toContainText("Sample Color Grid");
  await expect(page.locator("#layoutPreviewZoomInput")).toHaveAttribute("min", "1");
  await page.locator("#layoutPreviewCanvas").hover();
  await page.keyboard.down("Control");
  await page.mouse.wheel(0, -100);
  await page.keyboard.up("Control");
  await expect(page.locator("#layoutPreviewZoomInput")).toHaveValue("110");
  await page.locator('#layoutSetupModal .modal-footer [data-bs-dismiss="modal"]').click();
  await expect(page.locator("#layoutSetupModal")).toBeHidden();

  await page.locator("#applyBoxLayoutBtn").click();
  await expect.poll(async () => page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi") as { getRectCount?: () => number } | undefined;
    return api?.getRectCount?.() ?? -1;
  })).toBe(56);
  await page.locator('[data-ui="history-undo"]').click();
  await expectSampleImage("sample_1.jpg", 52);
  await page.locator('[data-ui="history-redo"]').click();
  await expectSampleImage("sample_1.jpg", 56);
  await page.locator('[data-ui="history-undo"]').click();
  await expectSampleImage("sample_1.jpg", 52);

  await page.locator("#taskAutomateBtn").click();
  await page.locator("#openTemplateMatchingBtn").click();
  await expect(page.locator("#templateMatchingModal")).toBeVisible();
  await expect(page.locator("#templateNameInput")).toHaveValue("Sample Pink Anchor + Layout");
  await expect(page.locator("#templateOutputLayoutRadio")).toBeChecked();
  await expect(page.locator("#templateLayoutSelect")).toHaveValue("sample-color-grid-layout");
  await expect(page.locator("#templateSearchRoiToggle")).not.toBeChecked();

  await page.locator("#testTemplateMatchBtn").click();
  await expect(page.locator("#templateMatchScore")).not.toHaveText("No preview yet", { timeout: 30_000 });
  await expect(page.locator("#templateMatchScore")).toHaveClass(/text-success/);
  await expect(page.locator("#templateMatchCoordinates")).toContainText("X 620, Y 301");
  await expect(page.locator("#templateMatchCoordinates")).toContainText("Anchor offset");
  await expect(page.locator("#templateMatchingCanvas")).toHaveAttribute("data-layout-preview", "true");
  await expect(page.locator("#applyTemplateMatchBtn")).toBeEnabled();
  await page.locator("#templateLayoutOpacityInput").evaluate((element) => {
    const input = element as HTMLInputElement;
    input.value = "35";
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await expect(page.locator("#templateLayoutOpacityValue")).toHaveText("35%");
  await expect(page.locator("#templateMatchingCanvas")).toHaveAttribute("data-layout-preview-opacity", "0.35");
  const matchScoreBeforeOffset = await page.locator("#templateMatchScore").textContent();
  await page.locator("#templateManualXInput").fill("7");
  await expect(page.locator("#templateMatchCoordinates")).toContainText("Final (7, 0)");
  await expect(page.locator("#templateMatchScore")).toHaveText(matchScoreBeforeOffset ?? "");
  await expect(page.locator("#applyTemplateMatchBtn")).toBeEnabled();
  await page.locator("#applyTemplateMatchBtn").click();
  await expect(page.locator("#templateMatchingCanvas")).toHaveAttribute("data-layout-preview", "false");
  await expect(page.locator("#editMode")).toBeChecked();
  await expect(page.locator("#inspectorTransformPane")).toBeVisible();
  await expect(page.locator("#selectedAnnotationCount")).toHaveText("4");
  await expect.poll(async () => page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi") as { getRectCount?: () => number } | undefined;
    return api?.getRectCount?.() ?? -1;
  })).toBe(56);

  await page.locator('label[for="templateOutputMultipleRadio"]').click();
  await page.locator("#testTemplateMatchBtn").click();
  await expect(page.locator("#templatePointerSelectRadio")).toBeEnabled({ timeout: 30_000 });
  await page.locator('label[for="templateApplySelectedMatchesRadio"]').click();
  await page.locator('[data-testid="template-match-select-0"]').check();
  await page.locator("#templateMultipleClassIdInput").fill("-1");
  await page.locator("#assignTemplateMatchClassBtn").click();
  await expect(page.locator("#templateSettingsError")).toContainText("0 or a positive whole number");
  await expect(page.locator("#templateMultipleClassIdInput")).toHaveClass(/is-invalid/);
  await page.locator("#templateMultipleClassIdInput").fill("7");
  await page.locator("#assignTemplateMatchClassBtn").click();
  await expect(page.locator('[data-testid="template-match-candidate-0"] .template-match-class-badge')).toHaveText("Class 7");
  await expect(page.locator("#templateSettingsError")).toBeHidden();
  await page.locator("#templateWorkspaceZoomInput").evaluate((element) => {
    const input = element as HTMLInputElement;
    input.value = "200";
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  const focusedCandidate = page.getByTestId("template-match-candidate-0");
  const focusedGeometry = await focusedCandidate.evaluate((element) => ({
    x: Number((element as HTMLElement).dataset.matchX),
    y: Number((element as HTMLElement).dataset.matchY),
    width: Number((element as HTMLElement).dataset.matchWidth),
    height: Number((element as HTMLElement).dataset.matchHeight)
  }));
  await focusedCandidate.click();
  await expect(page.locator("#templateMatchingCanvas")).toHaveAttribute("data-focused-match-index", "0");
  await expect(page.locator("#templateWorkspaceZoomInput")).toHaveValue("200");
  await expect.poll(async () => page.locator("#templateWorkspaceScroller").evaluate((element, geometry) => {
    const canvas = element.querySelector<HTMLCanvasElement>("#templateMatchingCanvas");
    if (!canvas) {
      return false;
    }
    const zoom = Number((document.querySelector("#templateWorkspaceZoomInput") as HTMLInputElement).value) / 100;
    const focusedCenterX = Number.parseFloat(canvas.style.left) + (geometry.x + geometry.width / 2) * zoom;
    const focusedCenterY = Number.parseFloat(canvas.style.top) + (geometry.y + geometry.height / 2) * zoom;
    return Math.abs(focusedCenterX - (element.scrollLeft + element.clientWidth / 2)) <= 1
      && Math.abs(focusedCenterY - (element.scrollTop + element.clientHeight / 2)) <= 1;
  }, focusedGeometry)).toBe(true);
  await page.locator('label[for="templatePointerSelectRadio"]').click();
  const templateScroller = page.locator("#templateWorkspaceScroller");
  const scrollBeforePan = await templateScroller.evaluate((element) => {
    const canvas = element.querySelector<HTMLCanvasElement>("#templateMatchingCanvas");
    if (!canvas) {
      throw new Error("Template canvas is unavailable");
    }
    element.scrollLeft = Number.parseFloat(canvas.style.left);
    element.scrollTop = Number.parseFloat(canvas.style.top);
    return { left: element.scrollLeft, top: element.scrollTop };
  });
  const scrollerBounds = await templateScroller.boundingBox();
  if (!scrollerBounds) {
    throw new Error("Template workspace scroller is unavailable");
  }
  await page.mouse.move(scrollerBounds.x + scrollerBounds.width * 0.4, scrollerBounds.y + scrollerBounds.height * 0.4);
  await page.mouse.down();
  await page.mouse.move(scrollerBounds.x + scrollerBounds.width * 0.6, scrollerBounds.y + scrollerBounds.height * 0.55, { steps: 5 });
  await page.mouse.up();
  await expect.poll(async () => templateScroller.evaluate((element) => element.scrollLeft))
    .toBeLessThan(scrollBeforePan.left);
  await expect.poll(async () => templateScroller.evaluate((element) => element.scrollTop))
    .toBeLessThan(scrollBeforePan.top);

  await page.locator("#templateWorkspaceFitBtn").click();
  await expect.poll(async () => templateScroller.evaluate((element) => {
    const canvas = element.querySelector<HTMLCanvasElement>("#templateMatchingCanvas");
    if (!canvas) {
      return false;
    }
    const viewport = element.getBoundingClientRect();
    const image = canvas.getBoundingClientRect();
    const contentLeft = viewport.left + element.clientLeft;
    const contentTop = viewport.top + element.clientTop;
    const contentRight = contentLeft + element.clientWidth;
    const contentBottom = contentTop + element.clientHeight;
    const horizontallyCentered = Math.abs((image.left + image.right) / 2 - (contentLeft + contentRight) / 2) <= 1;
    const verticallyCentered = Math.abs((image.top + image.bottom) / 2 - (contentTop + contentBottom) / 2) <= 1;
    return horizontallyCentered && verticallyCentered
      && image.left >= contentLeft
      && image.top >= contentTop
      && image.right <= contentRight + 1
      && image.bottom <= contentBottom + 1;
  })).toBe(true);

  await page.locator('#templateMatchingModal .modal-footer [data-bs-dismiss="modal"]').click();
  await expect(page.locator("#templateMatchingModal")).toBeHidden();
  await expect(page.locator("#inspectorTransformPane")).toBeVisible();
  await expect(page.locator("#selectedAnnotationCount")).toHaveText("4");
  await expect(page.locator('[data-ui="history-undo"]')).toBeEnabled();
  await page.locator('[data-ui="history-undo"]').click();
  await expectSampleImage("sample_1.jpg", 52);
  await page.locator("#taskAutomateBtn").click();
  await page.locator("#runAutomationCurrentBtn").click();
  await expectSampleImage("sample_1.jpg", 56);
  await page.locator("#appBrand").click();
  await expect.poll(async () => page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi") as { getRectCount?: () => number } | undefined;
    return api?.getRectCount?.() ?? -1;
  })).toBe(56);
  await expect(page.locator('[data-ui="history-undo"]')).toBeEnabled();

  await page.locator('[data-ui="history-undo"]').click();
  await expect.poll(async () => page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi") as { getRectCount?: () => number } | undefined;
    return api?.getRectCount?.() ?? -1;
  })).toBe(52);
  await page.locator('[data-ui="history-redo"]').click();
  await expect.poll(async () => page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi") as { getRectCount?: () => number } | undefined;
    return api?.getRectCount?.() ?? -1;
  })).toBe(56);
  await page.locator('[data-ui="history-undo"]').click();
  await expect.poll(async () => page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi") as { getRectCount?: () => number } | undefined;
    return api?.getRectCount?.() ?? -1;
  })).toBe(52);
  await expect(page.locator("#documentStatus")).toContainText("Unsaved changes");
  await page.locator("#taskFilesBtn").click();
  await page.locator("#saveLabelsBtn").click();
  await expect(page.locator("#documentStatus")).toContainText("Saved");

  expect(runtimeErrors).toEqual([]);
});
