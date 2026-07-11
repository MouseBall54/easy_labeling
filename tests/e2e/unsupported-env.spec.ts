import { expect, test } from "@playwright/test";

test("unsupported-env: missing File System Access API keeps the bundled sample available", async ({ page }) => {
  await page.addInitScript(() => {
    const alerts: string[] = [];
    Object.defineProperty(window, "__legacyAlerts", {
      value: alerts,
      configurable: true
    });
    window.alert = (message?: string) => {
      alerts.push(String(message ?? ""));
    };

    let scope: object | null = window;
    while (scope) {
      const descriptor = Object.getOwnPropertyDescriptor(scope, "showDirectoryPicker");
      if (descriptor?.configurable) {
        delete (scope as { showDirectoryPicker?: unknown }).showDirectoryPicker;
      }
      scope = Object.getPrototypeOf(scope);
    }
  });

  await page.goto("/index.html");

  const hasPicker = await page.evaluate(() => "showDirectoryPicker" in window);
  expect(hasPicker).toBe(false);

  const alerts = await page.evaluate(() => {
    const capturedAlerts = Reflect.get(window, "__legacyAlerts");
    return Array.isArray(capturedAlerts) ? [...capturedAlerts] : [];
  });

  expect(alerts).toEqual([]);

  const testApiPresent = await page.evaluate(() => Reflect.has(window, "__easyLabelingTestApi"));
  expect(testApiPresent).toBe(true);
  await expect(page.locator("#fileSystemCompatibilityNotice")).toBeVisible();
  await expect(page.locator("#selectImageFolderBtn")).toBeDisabled();
  await expect(page.locator("#emptyLoadSampleBtn")).toBeEnabled();

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
});
