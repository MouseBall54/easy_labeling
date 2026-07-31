import { expect, test } from "@playwright/test";

test("bootstrap-smoke: modular dist/main.js entry boots with parity defaults", async ({ page }) => {
  const runtimeErrors: string[] = [];

  await page.addInitScript(() => {
    localStorage.setItem("darkMode", "enabled");
  });

  page.on("console", (message) => {
    const text = message.text();
    if (/ReferenceError|TypeError/.test(text)) {
      runtimeErrors.push(text);
    }
  });

  await page.goto("/index.html");

  await expect(page.locator("#workspaceStandbyPanel")).toBeVisible();
  await expect(page.locator('[data-standby-step="interface"]')).toHaveAttribute("data-state", "ready");
  await expect(page.locator('[data-standby-step="automation"]')).toHaveAttribute("data-state", "ready");
  await expect(page.locator('[data-standby-step="matching"]')).toHaveAttribute("data-state", "ready", { timeout: 25_000 });
  await expect(page.locator("#workspaceStandbyPanel")).toBeHidden({ timeout: 25_000 });
  await expect(page.locator("body")).not.toHaveClass(/\bworkspace-standby-active\b/);
  await expect(page.locator("#selectImageFolderBtn")).toBeVisible();
  await expect(page.locator("#selectLabelFolderBtn")).toBeVisible();
  await expect(page.locator("#canvas")).toBeVisible();
  await expect(page.locator("#current-image-name")).toHaveCount(1);
  await expect(page.locator('script[type="module"][src$="dist/main.js"]')).toHaveCount(1);
  await expect(page.locator("#undoBtn .history-icon")).toHaveClass(/bi-arrow-counterclockwise/);
  await expect(page.locator("#redoBtn .history-icon")).toHaveClass(/bi-arrow-clockwise/);
  await expect(page.locator("#resetZoomBtn")).toHaveAttribute("aria-label", "Fit to screen");
  await expect(page.locator("#label-font-size")).toHaveAttribute("min", "6");
  await expect(page.locator("#label-font-size")).toHaveAttribute("max", "20");

  const canvasToolbarOrder = await page.locator('[data-ui="canvas-toolbar"] > [data-ui]').evaluateAll((elements) => {
    return elements.map((element) => element.getAttribute("data-ui"));
  });
  expect(canvasToolbarOrder).toEqual([
    "coordinates-toolbar",
    "zoom-controls",
    "mouse-coordinates"
  ]);

  await expect(page.locator("#darkModeToggle")).toBeChecked();
  await expect(page.locator("body")).toHaveClass(/\bdark-mode\b/);
  await expect(page.locator("#selectLabelFolderBtn")).toHaveClass(/\bbtn-danger\b/);

  expect(runtimeErrors).toEqual([]);
});

test("bootstrap-smoke: 200 percent equivalent viewport keeps empty actions visible", async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 360 });
  await page.goto("/index.html");

  await expect(page.locator("#workspaceStandbyPanel")).toBeVisible();
  const standbyBounds = await page.locator("#workspaceStandbyPanel").boundingBox();
  expect(standbyBounds?.x).toBeGreaterThanOrEqual(0);
  expect((standbyBounds?.x ?? 0) + (standbyBounds?.width ?? Number.POSITIVE_INFINITY)).toBeLessThanOrEqual(640);
  expect(standbyBounds?.y).toBeGreaterThanOrEqual(0);
  expect((standbyBounds?.y ?? 0) + (standbyBounds?.height ?? Number.POSITIVE_INFINITY)).toBeLessThanOrEqual(360);
  await expect(page.locator("#workspaceStandbyPanel")).toBeHidden({ timeout: 25_000 });
  await expect(page.locator("#left-panel")).not.toHaveClass(/\bmobile-open\b/);
  await expect(page.locator("#right-panel")).not.toHaveClass(/\bmobile-open\b/);
  await expect(page.locator("#emptyOpenDatasetBtn")).toBeVisible();
  await expect(page.locator("#emptyLoadSampleBtn")).toBeVisible();

  const layout = await page.evaluate(() => {
    const actions = document.querySelector<HTMLElement>(".empty-state-actions")?.getBoundingClientRect();
    return {
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      actionsBottom: actions?.bottom ?? Number.POSITIVE_INFINITY,
      viewportHeight: window.innerHeight
    };
  });

  expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth);
  expect(layout.actionsBottom).toBeLessThanOrEqual(layout.viewportHeight);
});

test("bootstrap-smoke: matching startup failure stays actionable", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "Worker", {
      configurable: true,
      value: class BrokenWorker {
        constructor() {
          throw new Error("Worker unavailable for readiness test");
        }
      }
    });
  });

  await page.goto("/index.html");

  await expect(page.locator('[data-standby-step="matching"]')).toHaveAttribute("data-state", "error");
  await expect(page.locator('[data-standby-step="matching"] small')).toContainText("Worker unavailable");
  await expect(page.locator("#workspaceStandbyActions")).toBeVisible();
  await page.locator("#dismissWorkspaceStandbyBtn").click();
  await expect(page.locator("#workspaceStandbyPanel")).toBeHidden();
});
