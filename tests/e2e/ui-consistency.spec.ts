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
    const before = await page.locator("#image-list [data-file-name]").count();
    expect(before).toBeGreaterThan(0);
    await page.locator('label[for="showLabeled"]').click();
    await page.locator('label[for="showUnlabeled"]').click();
    await expect(page.locator("#image-list [data-file-name]")).toHaveCount(0);
    await expect(page.locator("#image-list")).toBeHidden();
    await page.locator('label[for="showLabeled"]').click();
    await page.locator('label[for="showUnlabeled"]').click();
    await expect(page.locator("#image-list [data-file-name]")).toHaveCount(before);
    for (const tab of [editTab, ...(workflow === "detection" ? ["#taskInferenceBtn"] : []), "#taskYoloeBtn"]) {
      await page.locator(tab).click();
      const sizes = await page.locator("#image-filter-container .image-status-filter").evaluateAll((buttons) => buttons.map((button) => {
        const rect = button.getBoundingClientRect();
        return { height: rect.height, width: rect.width };
      }));
      expect(sizes).toHaveLength(2);
      for (const size of sizes) {
        expect(size.height).toBeGreaterThanOrEqual(24);
        expect(size.height).toBeLessThanOrEqual(28);
        expect(size.width).toBeLessThan(110);
      }
      await expect(page.locator("#showLabeled")).toBeChecked();
      await expect(page.locator("#showUnlabeled")).toBeChecked();
    }
    await page.locator('label[for="darkModeToggle"]').click();
  }
});

test("workbench controls keep a consistent rhythm across themes and compact viewports", async ({ page }) => {
  await page.goto("/index.html");
  await expect(page.locator('[data-standby-step="interface"]')).toHaveAttribute("data-state", "ready");
  // This is a visual-system check; model-worker readiness is covered by the
  // bootstrap smoke tests and must not make typography assertions flaky.
  await page.evaluate(() => {
    document.querySelector<HTMLElement>("#workspaceStandbyPanel")?.setAttribute("hidden", "");
    document.body.classList.remove("workspace-standby-active");
  });

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
  expect(lightMetrics.buttonDisplay).toBe("inline-flex");
  expect(lightMetrics.toolbarAlign).toBe("center");

  await page.locator('label[for="darkModeToggle"]').click();
  await expect(page.locator("body")).toHaveClass(/\bdark-mode\b/);
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
