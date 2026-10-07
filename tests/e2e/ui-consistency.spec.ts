import { expect, test } from "@playwright/test";

test("merged editing workspaces retain dataset controls and compact status filters", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/index.html");
  await page.locator("#emptyLoadSampleBtn").click();
  await expect(page.locator("#workspaceStandbyPanel")).toBeHidden({ timeout: 30_000 });
  await expect(page.locator("#taskFilesBtn")).toHaveCount(0);
  await expect(page.locator(".task-rail-primary > button:last-child")).toHaveAttribute("id", "taskReviewBtn");
  for (const workflow of ["detection", "segmentation"]) {
    await page.locator(`label[for="${workflow}WorkflowTab"]`).click();
    const editTab = workflow === "detection" ? "#taskAnnotateBtn" : "#taskSegmentationBtn";
    await page.locator(editTab).click();
    await expect(page.locator("#selectImageFolderBtn")).toBeVisible();
    await expect(page.locator("#selectLabelFolderBtn")).toBeVisible();
    await expect(page.locator("#loadClassInfoFolderBtn")).toBeVisible();
    const gaps = await page.evaluate(() => {
      const bounds = (id: string) => document.getElementById(id)!.getBoundingClientRect();
      return {
        dataset: bounds("refreshDatasetBtn").left - bounds("selectImageFolderBtn").right,
        classes: bounds("addClassShortcutBtn").left - bounds("loadClassInfoFolderBtn").right,
        labels: bounds("selectLabelFolderBtn").left - bounds("labelSourceTabs").right
      };
    });
    expect(gaps.dataset).toBe(8);
    expect(gaps.classes).toBe(6);
    expect(gaps.labels).toBe(6);
    const before = await page.locator("#image-list [data-file-name]").count();
    expect(before).toBeGreaterThan(0);
    const filter = page.locator("#imageStatusFilterBtn");
    await expect(filter).toHaveText("All");
    await filter.click();
    await expect(filter).toHaveText("Labeled");
    await expect(page.locator("#activeOperationPanel")).toBeHidden();
    const labeled = await page.locator("#image-list [data-file-name]").count();
    await filter.click();
    await expect(filter).toHaveText("Unlabeled");
    await expect(page.locator("#activeOperationPanel")).toBeHidden();
    const unlabeled = await page.locator("#image-list [data-file-name]").count();
    expect(labeled + unlabeled).toBe(before);
    await filter.click();
    await expect(filter).toHaveText("All");
    await expect(page.locator("#image-list [data-file-name]")).toHaveCount(before);
    for (const tab of [editTab, ...(workflow === "detection" ? ["#taskInferenceBtn"] : []), "#taskYoloeBtn"]) {
      await page.locator(tab).click();
      const sizes = await page.locator("#image-filter-container .image-status-filter").evaluateAll((buttons) => buttons.map((button) => {
        const rect = button.getBoundingClientRect();
        return { height: rect.height, width: rect.width };
      }));
      expect(sizes).toHaveLength(1);
      for (const size of sizes) {
        expect(size.height).toBeGreaterThanOrEqual(30);
        expect(size.height).toBeLessThanOrEqual(38);
        expect(size.width).toBeLessThan(110);
      }
      await expect(filter).toHaveAttribute("data-filter", "all");
    }
    await page.locator('label[for="darkModeToggle"]').click();
  }
});

test("workbench controls keep a consistent rhythm across themes and compact viewports", async ({ page }) => {
  await page.goto("/index.html");
  await expect(page.locator('[data-standby-step="interface"]')).toHaveAttribute("data-state", "ready");
  await page.locator("#emptyLoadSampleBtn").click();
  await expect(page.locator("#workspaceStandbyPanel")).toBeHidden({ timeout: 30_000 });
  await expect(page.locator("#loadClassInfoFolderBtn")).toBeVisible();

  const lightMetrics = await page.evaluate(() => {
    const compactButton = document.querySelector<HTMLElement>("#loadClassInfoFolderBtn");
    const compactInput = document.querySelector<HTMLElement>("#classSearchInput");
    const toolbarButton = document.querySelector<HTMLElement>('label[for="drawMode"]');
    const subtitle = document.querySelector<HTMLElement>(".panel-subtitle");
    if (!compactButton || !compactInput || !toolbarButton || !subtitle) {
      throw new Error("Expected workbench controls were not rendered");
    }
    const buttonStyle = getComputedStyle(compactButton);
    const toolbarStyle = getComputedStyle(toolbarButton);
    return {
      buttonHeight: compactButton.getBoundingClientRect().height,
      inputHeight: compactInput.getBoundingClientRect().height,
      buttonFontSize: Number.parseFloat(buttonStyle.fontSize),
      buttonDisplay: buttonStyle.display,
      toolbarAlign: toolbarStyle.alignItems,
      subtitleFontSize: Number.parseFloat(getComputedStyle(subtitle).fontSize)
    };
  });

  expect(lightMetrics.buttonHeight).toBeGreaterThanOrEqual(34);
  expect(lightMetrics.inputHeight).toBeGreaterThanOrEqual(34);
  expect(lightMetrics.buttonFontSize).toBeGreaterThanOrEqual(12);
  expect(lightMetrics.subtitleFontSize).toBeGreaterThanOrEqual(11.5);
  expect(lightMetrics.buttonDisplay).toBe("flex");
  expect(lightMetrics.toolbarAlign).toBe("center");

  await page.setViewportSize({ width: 1332, height: 1244 });
  await page.locator("#classManagement").scrollIntoViewIfNeeded();
  const classSettings = (await page.locator("#classManagement").boundingBox())!;
  const classSearch = (await page.locator("#classSearchInput").boundingBox())!;
  expect(classSettings.y + classSettings.height).toBeLessThanOrEqual(classSearch.y);
  await expect(page.locator("#loadClassInfoFolderBtn")).toHaveText("Load Class");
  expect(await page.locator("#loadClassInfoFolderBtn").evaluate((button) => Boolean(button.closest(".sticky-section-heading")))).toBe(true);
  expect(await page.locator("#imageStatusFilterBtn").evaluate((button) => Boolean(button.closest(".section-heading-row")))).toBe(true);
  await expect(page.locator("#classManagementTitle")).toHaveCount(0);
  await expect(page.locator("#selectImageFolderBtn")).toHaveAttribute("data-connected", "true");
  await expect(page.locator("#selectImageFolderBtn")).toHaveClass(/btn-outline-success/);
  await page.screenshot({ path: "output/class-settings-light-1332.png" });

  await page.locator('label[for="darkModeToggle"]').click();
  await expect(page.locator("body")).toHaveClass(/\bdark-mode\b/);
  await page.screenshot({ path: "output/class-settings-dark-1332.png" });
  await page.setViewportSize({ width: 900, height: 900 });
  await page.locator("#classManagement").scrollIntoViewIfNeeded();
  await page.screenshot({ path: "output/class-settings-dark-900.png" });
  await page.locator('label[for="segmentationWorkflowTab"]').click();
  await page.locator("#openSegmentationFormatBtn").click();
  await expect(page.locator("#segmentationFormatModal")).toBeVisible();

  const darkMetrics = await page.evaluate(() => {
    const modal = document.querySelector<HTMLElement>("#segmentationFormatModal .modal-content");
    const select = document.querySelector<HTMLElement>("#segmentationFormatModal .form-select");
    if (!modal || !select) {
      throw new Error("Expected format modal controls were not rendered");
    }
    return {
      modalBackground: getComputedStyle(modal).backgroundColor,
      modalColor: getComputedStyle(modal).color,
      selectBackground: getComputedStyle(select).backgroundColor,
      selectColor: getComputedStyle(select).color
    };
  });

  expect(darkMetrics.modalBackground).not.toBe("rgb(255, 255, 255)");
  expect(darkMetrics.selectBackground).not.toBe("rgb(255, 255, 255)");
  expect(darkMetrics.modalColor).not.toBe(darkMetrics.modalBackground);
  expect(darkMetrics.selectColor).not.toBe(darkMetrics.selectBackground);

  await page.locator("#segmentationFormatModal .btn-close").click();
  await page.setViewportSize({ width: 640, height: 360 });

  const compactLayout = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
    toolbarBottom: document.querySelector<HTMLElement>("#segmentationCanvasToolbar")?.getBoundingClientRect().bottom ?? 0,
    viewportHeight: window.innerHeight
  }));

  expect(compactLayout.documentWidth).toBeLessThanOrEqual(compactLayout.viewportWidth);
  expect(compactLayout.toolbarBottom).toBeLessThan(compactLayout.viewportHeight);
});
