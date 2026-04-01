import { expect, test } from "@playwright/test";

test("unsupported-env: missing File System Access API triggers legacy alert gating", async ({ page }) => {
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

  expect(alerts).toEqual([
    "Incompatible Browser: This application uses the File System Access API, which is not supported by your current browser. Please use a modern browser like Chrome or Edge."
  ]);

  const testApiPresent = await page.evaluate(() => Reflect.has(window, "__easyLabelingTestApi"));
  expect(testApiPresent).toBe(false);
});
