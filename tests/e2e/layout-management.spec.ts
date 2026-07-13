import { expect, test } from "@playwright/test";

test("layout setup creates from selected boxes and updates the saved layout", async ({ page }) => {
  test.setTimeout(90_000);
  await page.addInitScript(() => {
    Object.defineProperty(window, "showDirectoryPicker", {
      configurable: true,
      value: async () => {
        throw new DOMException("Not used by bundled sample test", "AbortError");
      }
    });
  });

  await page.goto("/index.html");
  await page.locator("#loadSampleTestBtn").click();
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

  await page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi") as {
      selectRectsByIndex?: (indices: number[]) => void;
    } | undefined;
    api?.selectRectsByIndex?.([0, 1, 2]);
  });
  await page.locator("#inspectorTransformTabBtn").click();
  await page.locator("#openLayoutSetupBtn").click();

  const modal = page.locator("#layoutSetupModal");
  await expect(modal).toBeVisible();
  await expect(page.locator("#layoutEditorTitle")).toHaveText("Edit layout");
  await page.locator("#newBoxLayoutBtn").click();
  await expect(page.locator("#layoutSetupSelect")).toHaveValue("");
  await expect(page.locator("#layoutEditorTitle")).toHaveText("New layout");
  await expect(page.locator("#layoutNameInput")).toHaveValue("");
  await expect(page.locator("#layoutCaptureScopeSelect")).toHaveValue("selected");
  await expect(page.locator('#layoutCaptureScopeSelect option[value="selected"]')).toHaveText("Selected Boxes (3)");
  await expect(page.locator("#layoutCaptureSummary")).toContainText("Capturing: 3");

  await page.locator("#layoutNameInput").fill("Selected trio");
  await expect(page.locator("#saveBoxLayoutBtn")).toBeEnabled();
  await expect(page.locator("#updateBoxLayoutBtn")).toBeDisabled();
  await page.locator("#saveBoxLayoutBtn").click();
  await expect(page.locator(".toast-message").last()).toHaveText("Layout saved with 3 boxes.");
  await expect(page.locator("#layoutSetupSelect option:checked")).toHaveText("Selected trio");
  await expect(page.locator("#layoutDetails")).toContainText("3 boxes");
  await expect(page.locator("#layoutEditorTitle")).toHaveText("Edit layout");
  await expect(page.locator("#updateBoxLayoutBtn")).toBeEnabled();

  await modal.locator(".modal-footer").getByRole("button", { name: "Close" }).click();
  await page.locator("#applyBoxLayoutBtn").click();
  await expect.poll(async () => page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi") as { getRectCount?: () => number } | undefined;
    return api?.getRectCount?.() ?? -1;
  })).toBe(55);
  await page.locator('[data-ui="history-undo"]').click();
  await expect.poll(async () => page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi") as { getRectCount?: () => number } | undefined;
    return api?.getRectCount?.() ?? -1;
  })).toBe(52);

  await page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi") as {
      selectRectsByIndex?: (indices: number[]) => void;
    } | undefined;
    api?.selectRectsByIndex?.([0, 1]);
  });
  await page.locator("#openLayoutSetupBtn").click();
  await expect(page.locator("#layoutEditorTitle")).toHaveText("Edit layout");
  await expect(page.locator("#layoutSetupSelect option:checked")).toHaveText("Selected trio");
  await expect(page.locator("#layoutNameInput")).toHaveValue("Selected trio");
  await expect(page.locator('#layoutCaptureScopeSelect option[value="selected"]')).toHaveText("Selected Boxes (2)");
  await page.locator("#layoutNameInput").fill("Updated pair");
  await page.locator("#updateBoxLayoutBtn").click();
  await expect(page.locator(".toast-message").last()).toHaveText("Layout updated with 2 boxes.");
  await expect(page.locator("#layoutSetupSelect option:checked")).toHaveText("Updated pair");
  await expect(page.locator("#layoutDetails")).toContainText("2 boxes");

  await modal.locator(".modal-footer").getByRole("button", { name: "Close" }).click();
  await page.locator("#applyBoxLayoutBtn").click();
  await expect.poll(async () => page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi") as { getRectCount?: () => number } | undefined;
    return api?.getRectCount?.() ?? -1;
  })).toBe(54);
});
