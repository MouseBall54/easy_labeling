import { expect, test } from "@playwright/test";

test("unsupported-env: mobile user agent triggers legacy mobile gate", async ({ page }) => {
  await page.addInitScript(() => {
    const alerts: string[] = [];
    Object.defineProperty(window, "__legacyAlerts", {
      value: alerts,
      configurable: true
    });
    window.alert = (message?: string) => {
      alerts.push(String(message ?? ""));
    };

    Object.defineProperty(navigator, "userAgent", {
      configurable: true,
      get: () => "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)"
    });
  });

  await page.goto("/index.html");

  const alerts = await page.evaluate(() => {
    const capturedAlerts = Reflect.get(window, "__legacyAlerts");
    return Array.isArray(capturedAlerts) ? [...capturedAlerts] : [];
  });

  expect(alerts).toEqual([
    "Mobile Access Notice: This application is optimized for a desktop environment and may not function correctly on mobile devices. For the best experience, please use a desktop browser."
  ]);
  await expect(page.locator("text=Mobile Access Notice")).toHaveCount(1);

  const testApiPresent = await page.evaluate(() => Reflect.has(window, "__easyLabelingTestApi"));
  expect(testApiPresent).toBe(false);
});
