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
  await expect(page.locator('[data-ui="automation-controls"]')).toBeVisible();
  await expect(page.locator("#right-panel #layoutNameInput")).toHaveCount(0);
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
  await expect(page.locator(".toast-message").last()).toHaveText("Box layout saved.");
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

  await page.locator("#openTemplateMatchingBtn").click();
  const modal = page.locator("#templateMatchingModal");
  await expect(modal).toBeVisible();
  await expect(page.locator("#templateSourceImageSelect option")).toHaveCount(2);
  await expect(page.locator("#templateSourceImageSelect")).toHaveValue("scene-a.png");
  await page.locator("#templateNameInput").fill("Shifted station");
  await page.locator("#templateMinimumScoreInput").fill("0.50");
  await page.locator("#templateSearchRoiToggle").check();
  await page.locator("#templateSearchWidthInput").fill("68");
  await page.locator("#templateSearchHeightInput").fill("90");
  const canvas = page.locator("#templateMatchingCanvas");
  const bounds = await canvas.boundingBox();
  expect(bounds).not.toBeNull();
  if (!bounds) {
    throw new Error("Template canvas bounds are unavailable");
  }
  await page.mouse.move(bounds.x + 12, bounds.y + 12);
  await page.mouse.down();
  await page.mouse.move(bounds.x + 45, bounds.y + 48, { steps: 5 });
  await page.mouse.up();

  await page.locator("#saveAutomationPresetBtn").click();
  await expect(page.locator("#automationPresetSelect option")).toHaveCount(2);
  await page.locator("#testTemplateMatchBtn").click();
  await expect(page.locator("#templateMatchScore")).not.toHaveText("Not tested", { timeout: 30_000 });
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
  await expect(page.locator("#automationBatchCounts")).toHaveText("2 / 2", { timeout: 30_000 });
  await expect(page.locator("#automationBatchResultSummary")).toContainText("Success 1");
  await expect(page.locator("#automationBatchResultSummary")).toContainText("Skipped 1");
  await expect(page.locator("#automationBatchResultList .automation-batch-result-row")).toHaveCount(2);
  await expect(page.locator('#automationBatchResultList .automation-batch-result-row[data-state="success"]')).toContainText("scene-b.png");
  await expect.poll(async () => page.evaluate(() => {
    const fixture = Reflect.get(window, "__automationFixture") as { readLabel?: (name: string) => string | null } | undefined;
    return fixture?.readLabel?.("scene-b.txt") ?? null;
  })).not.toBeNull();
  await expect(page.locator("#current-image-name")).toContainText("scene-a.png");

  await page.locator("#openTemplateMatchingBtn").click();
  await expect(modal).toBeVisible();
  await page.locator("#newAutomationPresetBtn").click();
  await page.locator('label[for="templateOutputMultipleRadio"]').click();
  await expect(page.locator("#templateMultipleOutputSettings")).toBeVisible();
  await expect(page.locator("#templateLayoutOutputSettings")).toBeHidden();
  await page.locator("#templateNameInput").fill("Repeated targets");
  await page.locator("#templateMultipleClassIdInput").fill("8");
  await page.locator("#templateMinimumScoreInput").fill("0.40");
  await page.locator("#templateMaximumDetectionsInput").fill("10");
  await page.locator("#templateExistingPolicySelect").selectOption("append");
  const multiBounds = await canvas.boundingBox();
  if (!multiBounds) {
    throw new Error("Template canvas bounds are unavailable");
  }
  await page.mouse.move(multiBounds.x + 12, multiBounds.y + 12);
  await page.mouse.down();
  await page.mouse.move(multiBounds.x + 45, multiBounds.y + 48, { steps: 5 });
  await page.mouse.up();
  await page.locator("#testTemplateMatchBtn").click();
  await expect(page.locator("#templateMatchScore")).toContainText("matches", { timeout: 30_000 });
  await expect(page.locator("#templateMatchCandidates > div")).toHaveCount(2, { timeout: 30_000 });
  await expect(page.locator("#applyTemplateMatchBtn")).toBeEnabled();
  await page.locator("#applyTemplateMatchBtn").click();
  await expect.poll(async () => page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi") as { getRectCount?: () => number } | undefined;
    return api?.getRectCount?.() ?? -1;
  })).toBe(4);
  await page.locator("#saveAutomationPresetBtn").click();
  await modal.locator(".modal-footer").getByRole("button", { name: "Close" }).click();
  await expect(modal).toBeHidden();
  await page.locator('[data-ui="history-undo"]').click();
  await expect.poll(async () => page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi") as { getRectCount?: () => number } | undefined;
    return api?.getRectCount?.() ?? -1;
  })).toBe(2);
  await page.locator("#runAutomationBatchBtn").click();
  await expect(page.locator("#automationBatchCounts")).toHaveText("2 / 2", { timeout: 30_000 });
  await expect(page.locator("#automationBatchResultSummary")).toContainText("Success 2");
  await expect.poll(async () => page.evaluate(() => {
    const fixture = Reflect.get(window, "__automationFixture") as { readLabel?: (name: string) => string | null } | undefined;
    return fixture?.readLabel?.("scene-b.txt") ?? "";
  })).toContain("8 ");

  expect(runtimeErrors).toEqual([]);
});
