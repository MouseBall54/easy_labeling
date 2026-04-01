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

  await expect(page.locator("#selectImageFolderBtn")).toBeVisible();
  await expect(page.locator("#selectLabelFolderBtn")).toBeVisible();
  await expect(page.locator("#canvas")).toBeVisible();
  await expect(page.locator("#current-image-name")).toHaveCount(1);
  await expect(page.locator('script[type="module"][src="dist/main.js"]')).toHaveCount(1);

  await expect(page.locator("#bottom-panel")).not.toHaveClass(/\bshow\b/);
  await expect(page.locator("#darkModeToggle")).toBeChecked();
  await expect(page.locator("body")).toHaveClass(/\bdark-mode\b/);
  await expect(page.locator("#selectLabelFolderBtn")).toHaveClass(/\bbtn-danger\b/);

  expect(runtimeErrors).toEqual([]);
});
