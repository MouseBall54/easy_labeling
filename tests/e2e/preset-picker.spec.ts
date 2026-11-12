import { expect, test } from "@playwright/test";

// The layout select gets the tree picker: presets grouped by their profile subfolder (an option's data-folder),
// search, favourites, and the select still carries the value and fires change.
for (const theme of ["light", "dark"] as const) {
  test(`${theme}: preset picker groups presets by folder, searches, keeps favourites and drives the select`, async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/index.html", { waitUntil: "domcontentloaded" });
    await page.locator("#emptyLoadSampleBtn").click();
    await expect(page.locator("#loading-overlay")).toBeHidden({ timeout: 45_000 });
    if (theme === "dark") await page.locator('label[for="darkModeToggle"]').click();
    await page.locator("#taskAutomateBtn").click();
    const select = page.locator("#boxLayoutSelect");
    const button = page.locator("#boxLayoutSelect + .preset-picker-button");
    await expect(button).toBeVisible();

    // Put the sample layout in a nested folder and add two more; the picker follows the select's options.
    await page.evaluate(() => {
      const element = document.getElementById("boxLayoutSelect") as HTMLSelectElement;
      element.options[1]!.dataset.folder = "SEM/Grid";
      const extra = (value: string, text: string, folder: string) => {
        const option = new Option(text, value);
        if (folder) option.dataset.folder = folder;
        element.add(option);
      };
      extra("tem-a", "TEM particles", "TEM");
      extra("top-a", "Top level", "");
      element.value = "";
      (window as unknown as { changes: string[] }).changes = [];
      element.addEventListener("change", () => (window as unknown as { changes: string[] }).changes.push(element.value));
    });
    await expect(button).toContainText("Choose layout...");

    await button.click();
    const menu = page.locator(".preset-picker-menu");
    await expect(menu).toBeVisible();
    await expect(page.locator(".preset-picker-search")).toBeFocused();
    const rows = menu.locator(".preset-picker-row");
    await expect(rows).toHaveText(["Choose layout...", " SEM", " TEM", "Top level"]);
    await rows.filter({ hasText: "SEM" }).click();
    await rows.filter({ hasText: "Grid" }).click();
    await expect(rows).toHaveText(["Choose layout...", " SEM", " Grid", "Sample Color Grid (4 Cars)", " TEM", "Top level"]);
    await page.screenshot({ path: `test-results/preset-picker-tree-${theme}.png` });

    await rows.filter({ hasText: "Sample Color Grid" }).click();
    await expect(menu).toBeHidden();
    await expect(select).toHaveValue("sample-color-grid-layout");
    await expect(button).toContainText("Sample Color Grid (4 Cars)");
    await expect(button.locator(".preset-picker-folder")).toHaveText("SEM / Grid");
    expect(await page.evaluate(() => (window as unknown as { changes: string[] }).changes)).toEqual(["sample-color-grid-layout"]);

    // Search is flat with the folder shown; keyboard picks.
    await button.click();
    await page.keyboard.type("tem");
    await expect(rows).toHaveText(["Choose layout...", "TEM particlesTEM"]);
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(select).toHaveValue("tem-a");

    // A favourite and the recent choices sit on top; the app setting the value updates the button.
    await button.click();
    await rows.filter({ hasText: "Top level" }).locator(".preset-picker-star").click();
    await expect(menu.locator(".preset-picker-heading")).toHaveText(["Favorites", "Recent", "All"]);
    await page.screenshot({ path: `test-results/preset-picker-favorites-${theme}.png` });
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(button).toBeFocused();
    await page.evaluate(() => { (document.getElementById("boxLayoutSelect") as HTMLSelectElement).value = "top-a"; });
    await expect(button).toContainText("Top level");
  });
}
