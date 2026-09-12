import { expect, test } from "@playwright/test";

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
