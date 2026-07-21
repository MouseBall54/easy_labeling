import { expect, test } from "@playwright/test";

test("layout and automation: modal management, both matching modes, and offscreen batch labeling", async ({ page }) => {
  test.setTimeout(120_000);
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));

  await page.addInitScript(() => {
    type FileContent = string | ArrayBuffer;

    class MockFileHandle {
      kind = "file" as const;
      constructor(public name: string, public content: FileContent) {}

      async getFile() {
        const type = this.name.endsWith(".png") ? "image/png" : "text/plain";
        return new File([this.content], this.name, { type });
      }

      async createWritable() {
        return {
          write: async (data: FileContent) => {
            this.content = data;
          },
          close: async () => {}
        };
      }
    }

    class MockDirectoryHandle {
      kind = "directory" as const;
      entries = new Map<string, MockDirectoryHandle | MockFileHandle>();
      constructor(public name: string) {}

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

    const createScene = async (offsetX: number, offsetY: number): Promise<ArrayBuffer> => {
      const canvas = document.createElement("canvas");
      canvas.width = 120;
      canvas.height = 90;
      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Canvas unavailable");
      }
      context.fillStyle = "#f4f6f8";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "#1f2328";
      context.fillRect(22 + offsetX, 14 + offsetY, 7, 28);
      context.fillRect(12 + offsetX, 24 + offsetY, 28, 7);
      context.fillStyle = "#dc3545";
      context.fillRect(28 + offsetX, 30 + offsetY, 5, 5);
      context.fillStyle = "#1f2328";
      context.fillRect(80 + offsetX, 14 + offsetY, 7, 28);
      context.fillRect(70 + offsetX, 24 + offsetY, 28, 7);
      context.fillStyle = "#dc3545";
      context.fillRect(86 + offsetX, 30 + offsetY, 5, 5);
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((value) => value ? resolve(value) : reject(new Error("PNG encode failed")), "image/png");
      });
      return blob.arrayBuffer();
    };

    const imageFolder = new MockDirectoryHandle("images");
    const labelFolder = new MockDirectoryHandle("label");
    imageFolder.entries.set("label", labelFolder);
    labelFolder.entries.set("scene-a.txt", new MockFileHandle("scene-a.txt", [
      "0 0.541666666666667 0.611111111111111 0.083333333333333 0.111111111111111",
      "1 0.708333333333333 0.611111111111111 0.083333333333333 0.111111111111111"
    ].join("\n")));

    Object.defineProperty(window, "showDirectoryPicker", {
      configurable: true,
      value: async () => {
        if (!imageFolder.entries.has("scene-a.png")) {
          imageFolder.entries.set("scene-a.png", new MockFileHandle("scene-a.png", await createScene(0, 0)));
          imageFolder.entries.set("scene-b.png", new MockFileHandle("scene-b.png", await createScene(15, 10)));
        }
        return imageFolder;
      }
    });
    Reflect.set(window, "__automationFixture", {
      readLabel: (name: string) => {
        const file = labelFolder.entries.get(name);
        return file instanceof MockFileHandle ? String(file.content) : null;
      }
    });
  });

  await page.goto("/index.html");
  await expect(page.locator("#inspectorAnnotationPane")).toBeVisible();
  await expect(page.locator("#right-panel #layoutNameInput")).toHaveCount(0);
  await page.locator("#taskFilesBtn").click();
  await expect(page.locator("#left-panel")).not.toHaveClass(/collapsed/);
  await expect(page.locator("#right-panel")).toHaveClass(/collapsed/);
  await page.locator("#taskAutomateBtn").click();
  await expect(page.locator("#left-panel")).not.toHaveClass(/collapsed/);
  await expect(page.locator("#right-panel")).not.toHaveClass(/collapsed/);
  await expect(page.locator("#right-panel .shared-tool-section")).toBeVisible();
  await expect(page.locator("#drawMode + label")).toBeVisible();
  await expect(page.locator("#editMode + label")).toBeVisible();
  await expect(page.locator("#crosshairToggle")).toBeAttached();
  await expect(page.locator("#inspectorAutomationPane")).toBeVisible();
  await expect(page.locator("#inspectorTitle")).toHaveText("Automation Workspace");
  await page.locator("#taskAnnotateBtn").click();
  await expect(page.locator("#left-panel")).not.toHaveClass(/collapsed/);
  await expect(page.locator("#right-panel")).not.toHaveClass(/collapsed/);
  await expect(page.locator("#inspectorAnnotationPane")).toBeVisible();
  await page.locator("#inspectorTransformTabBtn").click();
  await expect(page.locator("#right-panel #openLayoutSetupBtn")).toBeVisible();

  await page.locator("#selectImageFolderBtn").click();
  await expect.poll(async () => page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi") as { getRectCount?: () => number } | undefined;
    return api?.getRectCount?.() ?? -1;
  })).toBe(2);

  await page.locator("#openLayoutSetupBtn").click();
  const layoutModal = page.locator("#layoutSetupModal");
  await expect(layoutModal).toBeVisible();
  await page.locator("#layoutNameInput").fill("Reference boxes");
  await page.locator("#layoutCaptureScopeSelect").selectOption("all");
  await page.locator("#saveBoxLayoutBtn").click();
  await expect(page.locator(".toast-message").last()).toHaveText("Layout saved with 2 boxes.");
  await expect(page.locator("#layoutOperationStatus")).toContainText("Saved 2 boxes");
  await expect(page.locator("#boxLayoutSelect option")).toHaveCount(2);
  await expect(page.locator("#boxLayoutSelect")).not.toHaveValue("");
  await expect(page.locator("#layoutDetails")).toContainText("2 boxes");

  const downloadPromise = page.waitForEvent("download");
  await page.locator("#exportAutomationLibraryBtn").click();
  const layoutDownload = await downloadPromise;
  const layoutJsonPath = await layoutDownload.path();
  expect(layoutJsonPath).not.toBeNull();

  await page.locator("#duplicateBoxLayoutBtn").click();
  await expect(page.locator("#layoutSetupSelect option")).toHaveCount(3);
  await page.locator("#layoutNameInput").fill("Renamed copy");
  await page.locator("#renameBoxLayoutBtn").click();
  await expect(page.locator("#layoutSetupSelect option:checked")).toHaveText("Renamed copy");
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("#deleteBoxLayoutBtn").click();
  await expect(page.locator("#layoutSetupSelect option")).toHaveCount(2);

  await page.locator("#layoutSetupSelect").selectOption({ index: 1 });
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("#deleteBoxLayoutBtn").click();
  await expect(page.locator("#layoutSetupSelect option")).toHaveCount(1);
  if (!layoutJsonPath) {
    throw new Error("Exported layout path is unavailable");
  }
  await page.locator("#importAutomationLibraryInput").setInputFiles(layoutJsonPath);
  await expect(page.locator("#layoutSetupSelect option")).toHaveCount(2);
  await expect(page.locator("#layoutSetupSelect option:checked")).toHaveText("Reference boxes");
  await layoutModal.locator(".modal-footer").getByRole("button", { name: "Close" }).click();
  await expect(layoutModal).toBeHidden();

  await page.locator("#applyBoxLayoutBtn").click();
  await expect.poll(async () => page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi") as { getRectCount?: () => number } | undefined;
    return api?.getRectCount?.() ?? -1;
  })).toBe(4);
  await page.locator('[data-ui="history-undo"]').click();
  await expect.poll(async () => page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi") as { getRectCount?: () => number } | undefined;
    return api?.getRectCount?.() ?? -1;
  })).toBe(2);

  await page.locator("#taskAutomateBtn").click();
  await page.locator("#openTemplateMatchingBtn").click();
  const modal = page.locator("#templateMatchingModal");
  await expect(modal).toBeVisible();
  await expect(page.locator("#templateExistingPolicySelect")).toHaveValue("append");
  await page.locator("#templateExistingPolicySelect").selectOption("skip");
  await expect(page.locator("#templatePointerRoiRadio")).toBeChecked();
  await expect(page.locator("#templatePointerSelectRadio")).toBeEnabled();
  await page.locator('label[for="templatePointerSelectRadio"]').click();
  await expect(page.locator("#templatePointerSelectRadio")).toBeChecked();
  await page.keyboard.press("Control+q");
  await expect(page.locator("#templatePointerRoiRadio")).toBeChecked();
  await page.keyboard.press("Control+q");
  await expect(page.locator("#templatePointerSelectRadio")).toBeChecked();
  await page.locator('label[for="templatePointerRoiRadio"]').click();
  await modal.locator(".template-advanced-settings > summary").click();
  await expect(page.locator("#templateBlurKernelInput")).toHaveValue("13");
  await page.locator("#templateBlurKernelInput").click();
  await page.keyboard.press("Control+A");
  await page.keyboard.type("21");
  await expect(page.locator("#templateBlurKernelInput")).toHaveValue("21");
  await page.keyboard.press("Tab");
  await expect(page.locator("#templateBlurSigmaInput")).toBeFocused();
  await page.keyboard.press("Control+A");
  await page.keyboard.type("1.5");
  await expect(page.locator("#templateBlurSigmaInput")).toHaveValue("1.5");
  await page.locator("#templateBlurKernelInput").fill("13");
  await page.locator("#templateBlurSigmaInput").fill("0");
  await expect(page.locator("#templateSourceImageSelect option")).toHaveCount(2);
  await expect(page.locator("#templateSourceImageSelect")).toHaveValue("scene-a.png");
  await expect(page.locator("#templateSearchRoiToggle")).not.toBeChecked();
  await page.locator("#templateNameInput").fill("Shifted station");
  await page.locator("#templateMinimumScoreInput").fill("0.50");
  await page.locator("#templateSearchRoiToggle").check();
  await page.locator("#templateSearchWidthInput").fill("68");
  await page.locator("#templateSearchHeightInput").fill("90");
  const canvas = page.locator("#templateMatchingCanvas");
  const sourceImageSize = { width: 120, height: 90 };
  const drawTemplateRoi = async (roi: { x: number; y: number; width: number; height: number }): Promise<void> => {
    const currentBounds = await canvas.boundingBox();
    if (!currentBounds) {
      throw new Error("Template canvas bounds are unavailable");
    }
    const scaleX = currentBounds.width / sourceImageSize.width;
    const scaleY = currentBounds.height / sourceImageSize.height;
    await page.mouse.move(currentBounds.x + roi.x * scaleX, currentBounds.y + roi.y * scaleY);
    await page.mouse.down();
    await page.mouse.move(
      currentBounds.x + (roi.x + roi.width) * scaleX,
      currentBounds.y + (roi.y + roi.height) * scaleY,
      { steps: 5 }
    );
    await page.mouse.up();
  };
  await canvas.scrollIntoViewIfNeeded();
  const bounds = await canvas.boundingBox();
  expect(bounds).not.toBeNull();
  if (!bounds) {
    throw new Error("Template canvas bounds are unavailable");
  }
  const canvasHit = await page.evaluate(({ x, y }) => ({
    hit: (() => {
      const element = document.elementFromPoint(x, y);
      return element ? { id: element.id, tag: element.tagName, className: element.className } : null;
    })(),
    viewport: { width: window.innerWidth, height: window.innerHeight }
  }), {
    x: bounds.x + 12,
    y: bounds.y + 12
  });
  if (canvasHit.hit?.id !== "templateMatchingCanvas") {
    throw new Error(`Template canvas is not hit-testable: ${JSON.stringify({ canvasHit, bounds })}`);
  }
  await drawTemplateRoi({ x: 10, y: 12, width: 32, height: 32 });
  await expect(canvas).toHaveAttribute("data-roi-ready", "true");

  await page.locator("#templateManualXInput").fill("200");
  await page.locator("#saveAutomationPresetBtn").click();
  await expect(page.locator("#automationPresetSelect option")).toHaveCount(2);
  await expect(page.locator("#exportAutomationPresetBtn")).toBeEnabled();
  const presetDownloadPromise = page.waitForEvent("download");
  await page.locator("#exportAutomationPresetBtn").click();
  const presetDownload = await presetDownloadPromise;
  expect(presetDownload.suggestedFilename()).toBe("Shifted-station.preset.json");
  const presetJsonPath = await presetDownload.path();
  expect(presetJsonPath).not.toBeNull();
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("#deleteAutomationPresetBtn").click();
  await expect(page.locator("#templatePresetSelect option")).toHaveCount(1);
  await expect(page.locator("#exportAutomationPresetBtn")).toBeDisabled();
  if (!presetJsonPath) {
    throw new Error("Exported template preset path is unavailable");
  }
  await page.locator("#importAutomationPresetInput").setInputFiles(presetJsonPath);
  await expect(page.locator("#templatePresetSelect option")).toHaveCount(2);
  await expect(page.locator("#templatePresetSelect option:checked")).toHaveText("Shifted station");
  await expect(page.locator("#templateNameInput")).toHaveValue("Shifted station");
  await expect(page.locator(".toast-message").last()).toHaveText("Template preset file loaded.");
  await page.locator("#testTemplateMatchBtn").click();
  await expect(page.locator("#templateMatchScore")).not.toHaveText("No preview yet", { timeout: 30_000 });
  await expect(page.locator("#templateMatchCoordinates")).toContainText("X");
  await expect(page.locator("#templateMatchTimings")).toContainText("Match");
  const accurateCoordinates = await page.locator("#templateMatchCoordinates").textContent();
  await page.locator('label[for="templateMatchingFastRadio"]').click();
  await page.locator("#templateMatchScore").evaluate((element) => {
    element.textContent = "Retesting";
  });
  await page.locator("#testTemplateMatchBtn").click();
  await expect(page.locator("#templateMatchScore")).not.toHaveText("Retesting", { timeout: 30_000 });
  const fastCoordinates = await page.locator("#templateMatchCoordinates").textContent();
  const parseCoordinates = (value: string | null): [number, number] => {
    const match = value?.match(/X\s+(-?\d+),\s+Y\s+(-?\d+)/);
    if (!match) {
      throw new Error(`Unable to parse match coordinates: ${value ?? ""}`);
    }
    return [Number(match[1]), Number(match[2])];
  };
  const accuratePoint = parseCoordinates(accurateCoordinates);
  const fastPoint = parseCoordinates(fastCoordinates);
  expect(Math.abs(accuratePoint[0] - fastPoint[0])).toBeLessThanOrEqual(1);
  expect(Math.abs(accuratePoint[1] - fastPoint[1])).toBeLessThanOrEqual(1);
  await modal.locator(".modal-footer").getByRole("button", { name: "Close" }).click();
  await expect(modal).toBeHidden();

  await page.locator("#runAutomationBatchBtn").click();
  await expect(page.locator("#automationBatchPreflight")).toBeVisible();
  await expect(page.locator("#batchPreflightTargets")).toHaveText("2 images");
  await page.locator("#batchDryRunToggle").check();
  await page.evaluate(() => {
    const panel = document.getElementById("activeOperationPanel");
    const title = document.getElementById("activeOperationTitle");
    const stop = document.getElementById("cancelActiveOperationBtn") as HTMLButtonElement | null;
    if (!panel) {
      throw new Error("Active operation panel is missing");
    }
    Reflect.set(window, "__operationPanelObservation", null);
    const observer = new MutationObserver(() => {
      if (!panel.hidden) {
        Reflect.set(window, "__operationPanelObservation", {
          title: title?.textContent ?? "",
          stopAvailable: Boolean(stop && !stop.hidden && !stop.disabled)
        });
        observer.disconnect();
      }
    });
    observer.observe(panel, { attributes: true, attributeFilter: ["hidden"] });
  });
  await page.locator("#confirmAutomationBatchBtn").click();
  await expect.poll(() => page.evaluate(() => Reflect.get(window, "__operationPanelObservation")))
    .toEqual({ title: "Checking automation batch", stopAvailable: true });
  await expect(page.locator("#automationBatchResultSummary")).toContainText("Dry run", { timeout: 30_000 });
  await expect(page.locator("#activeOperationPanel")).toBeHidden();
  await expect.poll(async () => page.evaluate(() => {
    const fixture = Reflect.get(window, "__automationFixture") as { readLabel?: (name: string) => string | null } | undefined;
    return fixture?.readLabel?.("scene-b.txt") ?? null;
  })).toBeNull();

  await page.locator("#runAutomationBatchBtn").click();
  await page.locator("#confirmAutomationBatchBtn").click();
  await expect(page.locator("#automationBatchCounts")).toHaveText("2 / 2", { timeout: 30_000 });
  await expect(page.locator("#automationBatchStage")).toContainText("Batch complete");
  await expect(page.locator("#automationBatchResultSummary")).toContainText("Success 1");
  await expect(page.locator("#automationBatchResultSummary")).toContainText("Skipped 1");
  await expect(page.locator("#automationBatchResultList .automation-batch-result-row")).toHaveCount(2);
  await expect(page.locator('#automationBatchResultList .automation-batch-result-row[data-state="success"]')).toContainText("scene-b.png");
  await expect(page.locator('#automationBatchResultList .automation-batch-result-row[data-state="success"] .automation-result-metrics')).toContainText("Matches");
  await expect(page.locator('#automationBatchResultList .automation-batch-result-row[data-state="success"] .automation-result-metrics')).toContainText("2 outside");
  const batchDimensions = await page.locator("#automationBatchProgressGroup").evaluate((group) => {
    const progress = group.querySelector<HTMLElement>(".progress")?.getBoundingClientRect();
    const list = group.querySelector<HTMLElement>(".automation-batch-result-list")?.getBoundingClientRect();
    return progress && list ? { progressHeight: progress.height, listHeight: list.height } : null;
  });
  expect(batchDimensions).not.toBeNull();
  expect(batchDimensions?.progressHeight ?? 0).toBeGreaterThanOrEqual(11);
  expect(batchDimensions?.listHeight ?? 0).toBeGreaterThanOrEqual(288);
  const resultLayout = await page.locator("#automationBatchResultList .automation-batch-result-row").first().evaluate((row) => {
    const heading = row.querySelector<HTMLElement>(".automation-result-heading")?.getBoundingClientRect();
    const file = row.querySelector<HTMLElement>(".automation-result-file")?.getBoundingClientRect();
    const state = row.querySelector<HTMLElement>(".automation-result-state")?.getBoundingClientRect();
    const details = row.querySelector<HTMLElement>(".automation-result-details")?.getBoundingClientRect();
    return heading && file && state && details
      ? { headingBottom: heading.bottom, fileRight: file.right, stateLeft: state.left, detailsTop: details.top }
      : null;
  });
  expect(resultLayout).not.toBeNull();
  expect(resultLayout?.fileRight ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual((resultLayout?.stateLeft ?? 0) + 1);
  expect(resultLayout?.headingBottom ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual((resultLayout?.detailsTop ?? 0) + 1);
  await expect.poll(async () => page.evaluate(() => {
    const fixture = Reflect.get(window, "__automationFixture") as { readLabel?: (name: string) => string | null } | undefined;
    return fixture?.readLabel?.("scene-b.txt") ?? null;
  })).toBe("");
  await expect(page.locator("#current-image-name")).toContainText("scene-a.png");

  await page.locator("#openTemplateMatchingBtn").click();
  await expect(modal).toBeVisible();
  await page.locator("#newAutomationPresetBtn").click();
  await expect(page.locator("#templateExistingPolicySelect")).toHaveValue("append");
  const footerControlLayout = await page.locator("#templateExistingPolicySelect").evaluate((select) => {
    const policy = select.closest<HTMLElement>(".template-existing-policy")?.getBoundingClientRect();
    const preview = document.querySelector<HTMLElement>("#testTemplateMatchBtn")?.getBoundingClientRect();
    const footer = document.querySelector<HTMLElement>("#templateMatchingModal .modal-footer")?.getBoundingClientRect();
    return policy && preview
      ? {
          policyRight: policy.right,
          previewLeft: preview.left,
          sameRow: policy.top < preview.bottom && policy.bottom > preview.top,
          footerBottom: footer?.bottom ?? Number.POSITIVE_INFINITY,
          viewportHeight: window.innerHeight
        }
      : null;
  });
  expect(footerControlLayout).not.toBeNull();
  expect(footerControlLayout?.policyRight ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual((footerControlLayout?.previewLeft ?? 0) + 1);
  expect(footerControlLayout?.sameRow).toBe(true);
  expect(footerControlLayout?.footerBottom ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(footerControlLayout?.viewportHeight ?? 0);
  await page.locator('label[for="templatePointerRoiRadio"]').click();
  await page.locator('label[for="templateOutputMultipleRadio"]').click();
  await expect(page.locator("#templateMultipleOutputSettings")).toBeVisible();
  await expect(page.locator("#templateLayoutOutputSettings")).toBeHidden();
  await page.locator("#templateNameInput").fill("Repeated targets");
  await page.locator("#templateMultipleClassIdInput").fill("8");
  await page.locator("#templateMinimumScoreInput").fill("0.40");
  await page.locator("#templateMaximumDetectionsInput").fill("10");
  await canvas.scrollIntoViewIfNeeded();
  const multiBounds = await canvas.boundingBox();
  if (!multiBounds) {
    throw new Error("Template canvas bounds are unavailable");
  }
  await drawTemplateRoi({ x: 10, y: 12, width: 32, height: 32 });
  await page.locator("#testTemplateMatchBtn").click();
  await expect(page.locator("#templateMatchScore")).toContainText("matches", { timeout: 30_000 });
  await expect(page.locator("#templateMatchCandidates > .template-match-candidate-row")).toHaveCount(2, { timeout: 30_000 });
  await expect(page.locator("#templatePointerSelectRadio")).toBeEnabled();
  await expect(page.locator("#templatePointerSelectRadio")).toBeChecked();
  const appEditModeBeforeTemplateShortcut = await page.locator("#editMode").isChecked();
  await page.keyboard.press("Control+q");
  await expect(page.locator("#templatePointerRoiRadio")).toBeChecked();
  expect(await page.locator("#editMode").isChecked()).toBe(appEditModeBeforeTemplateShortcut);
  await page.keyboard.press("Control+q");
  await expect(page.locator("#templatePointerSelectRadio")).toBeChecked();

  const rightClickTemplateMatch = async (index: number): Promise<void> => {
    const candidate = page.getByTestId(`template-match-candidate-${index}`);
    const geometry = await candidate.evaluate((element) => ({
      x: Number((element as HTMLElement).dataset.matchX),
      y: Number((element as HTMLElement).dataset.matchY),
      width: Number((element as HTMLElement).dataset.matchWidth),
      height: Number((element as HTMLElement).dataset.matchHeight)
    }));
    const currentBounds = await canvas.boundingBox();
    if (!currentBounds) {
      throw new Error("Template canvas bounds are unavailable for result context menu");
    }
    await page.mouse.click(
      currentBounds.x + ((geometry.x + geometry.width / 2) * currentBounds.width / sourceImageSize.width),
      currentBounds.y + ((geometry.y + geometry.height / 2) * currentBounds.height / sourceImageSize.height),
      { button: "right" }
    );
  };

  await rightClickTemplateMatch(0);
  await expect(page.locator("#templateMatchContextMenu")).toBeVisible();
  await page.locator("#templateMatchContextClassInput").fill("12");
  await page.locator("#templateMatchContextAssignBtn").click();
  await expect(page.getByTestId("template-match-candidate-0")).toContainText("Class 12");
  await rightClickTemplateMatch(0);
  await page.locator("#templateMatchContextDeleteBtn").click();
  await expect(page.locator("#templateMatchCandidates > .template-match-candidate-row")).toHaveCount(1);
  await expect(page.locator("#templateMatchScore")).toHaveText("1 match");

  await page.locator("#testTemplateMatchBtn").click();
  await expect(page.locator("#templateMatchCandidates > .template-match-candidate-row")).toHaveCount(2, { timeout: 30_000 });
  await expect(page.locator("#templatePointerSelectRadio")).toBeChecked();
  await expect(page.locator("#templateApplyAllMatchesRadio")).toBeChecked();
  await expect(page.locator("#templateMatchSelectionControls")).toBeHidden();
  await page.getByTestId("template-match-select-0").check();
  await expect(page.locator("#templateApplySelectedMatchesRadio")).toBeChecked();
  await expect(page.locator("#templateMatchSelectionSummary")).toContainText("1 selected");
  await page.locator("#assignTemplateMatchClassBtn").click();
  await expect(page.getByTestId("template-match-candidate-0")).toContainText("Class 8");
  await page.getByTestId("template-match-select-0").uncheck();
  await page.getByTestId("template-match-select-1").check();
  await page.locator("#templateMultipleClassIdInput").fill("9");
  await page.locator("#assignTemplateMatchClassBtn").click();
  await expect(page.getByTestId("template-match-candidate-1")).toContainText("Class 9");
  await page.getByTestId("template-match-select-0").check();
  await expect(page.locator("#templateMatchSelectionSummary")).toContainText("2 selected · 2 assigned");
  await expect(page.locator("#applyTemplateMatchBtn")).toBeEnabled();
  await page.locator("#applyTemplateMatchBtn").click();
  await expect.poll(async () => page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi") as { getRectCount?: () => number } | undefined;
    return api?.getRectCount?.() ?? -1;
  })).toBe(4);
  await expect.poll(async () => page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi") as { getVisibleClassKeys?: () => string[] } | undefined;
    return api?.getVisibleClassKeys?.() ?? [];
  })).toEqual(["0", "1", "8", "9"]);
  await page.locator("#templateMultipleClassIdInput").fill("8");
  await page.locator("#saveAutomationPresetBtn").click();
  await modal.locator(".modal-footer").getByRole("button", { name: "Close" }).click();
  await expect(modal).toBeHidden();
  await page.locator('[data-ui="history-undo"]').click();
  await expect.poll(async () => page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi") as { getRectCount?: () => number } | undefined;
    return api?.getRectCount?.() ?? -1;
  })).toBe(2);
  await page.locator("#taskAutomateBtn").click();
  await page.locator("#runAutomationBatchBtn").click();
  await page.locator("#confirmAutomationBatchBtn").click();
  await expect(page.locator("#automationBatchCounts")).toHaveText("2 / 2", { timeout: 30_000 });
  await expect(page.locator("#automationBatchResultSummary")).toContainText("Success 2");
  await expect.poll(async () => page.evaluate(() => {
    const fixture = Reflect.get(window, "__automationFixture") as { readLabel?: (name: string) => string | null } | undefined;
    return fixture?.readLabel?.("scene-b.txt") ?? "";
  })).toContain("8 ");

  expect(runtimeErrors).toEqual([]);
});
