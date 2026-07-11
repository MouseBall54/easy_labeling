import { expect, test } from "@playwright/test";

test("bundled sample test loads labeled cars and applies the prepared template layout", async ({ page }) => {
  test.setTimeout(90_000);
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
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

  await expect(page.locator("#image-list [data-file-name]")).toHaveCount(3);
  await expect(page.locator("#class-file-select option")).toContainText(["classes.yaml"]);
  await expect(page.locator("#boxLayoutSelect option")).toHaveCount(2);
  await expect(page.locator("#automationPresetSelect option")).toHaveCount(3);
  await expect(page.locator("#boxLayoutSelect")).toHaveValue("sample-color-grid-layout");
  await expect(page.locator("#automationPresetSelect")).toHaveValue("sample-layout-preset");

  const labelListLayout = await page.locator('[data-ui="label-list-item"]').first().evaluate((item) => {
    const panel = document.querySelector<HTMLElement>("#label-list");
    const name = item.querySelector<HTMLElement>(".label-list-item-name");
    return {
      rowHeight: item.getBoundingClientRect().height,
      fontSize: Number.parseFloat(getComputedStyle(item).fontSize),
      nameWhiteSpace: name ? getComputedStyle(name).whiteSpace : "",
      hasHorizontalOverflow: panel ? panel.scrollWidth > panel.clientWidth : true
    };
  });
  expect(labelListLayout.rowHeight).toBeLessThanOrEqual(34);
  expect(labelListLayout.fontSize).toBeLessThanOrEqual(11);
  expect(labelListLayout.nameWhiteSpace).toBe("nowrap");
  expect(labelListLayout.hasHorizontalOverflow).toBe(false);

  const expectSampleImage = async (image: string, boxes: number): Promise<void> => {
    await expect.poll(async () => page.evaluate(() => {
      const api = Reflect.get(window, "__easyLabelingTestApi") as {
        getCurrentImageName?: () => string;
        getRectCount?: () => number;
      } | undefined;
      return {
        image: api?.getCurrentImageName?.() ?? "",
        boxes: api?.getRectCount?.() ?? -1
      };
    })).toEqual({ image, boxes });
  };

  await page.locator('#image-list [data-file-name="sample_2.jpg"]').click();
  await expectSampleImage("sample_2.jpg", 92);
  await page.locator('#image-list [data-file-name="sample_3.jpg"]').click();
  await expectSampleImage("sample_3.jpg", 59);
  await page.locator('#image-list [data-file-name="sample_1.jpg"]').click();
  await expectSampleImage("sample_1.jpg", 52);

  await page.locator("#inspectorAutomationTabBtn").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#inspectorAutomationPane")).toBeVisible();

  const templateSetupButton = page.locator("#openTemplateMatchingBtn");
  await templateSetupButton.focus();
  await page.keyboard.press("Enter");
  const keyboardTemplateModal = page.locator("#templateMatchingModal");
  await expect(keyboardTemplateModal).toBeVisible();
  await expect.poll(async () => page.evaluate(() => {
    return document.querySelector("#templateMatchingModal")?.contains(document.activeElement) ?? false;
  })).toBe(true);
  for (let index = 0; index < 8; index += 1) {
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => {
      return document.querySelector("#templateMatchingModal")?.contains(document.activeElement) ?? false;
    })).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(keyboardTemplateModal).toBeHidden();
  await expect(templateSetupButton).toBeFocused();

  await page.locator("#inspectorTransformTabBtn").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#inspectorTransformPane")).toBeVisible();

  await page.locator("#openLayoutSetupBtn").click();
  await expect(page.locator("#layoutSetupModal")).toBeVisible();
  await expect(page.locator("#layoutDetails")).toContainText("4 boxes");
  await expect(page.locator("#layoutDetails")).toContainText("Sample Color Grid");
  await page.locator('#layoutSetupModal .modal-footer [data-bs-dismiss="modal"]').click();
  await expect(page.locator("#layoutSetupModal")).toBeHidden();

  await page.locator("#applyBoxLayoutBtn").click();
  await expect.poll(async () => page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi") as { getRectCount?: () => number } | undefined;
    return api?.getRectCount?.() ?? -1;
  })).toBe(56);
  await page.locator('[data-ui="history-undo"]').click();
  await expectSampleImage("sample_1.jpg", 52);
  await page.locator('[data-ui="history-redo"]').click();
  await expectSampleImage("sample_1.jpg", 56);
  await page.locator('[data-ui="history-undo"]').click();
  await expectSampleImage("sample_1.jpg", 52);

  await page.locator("#inspectorAutomationTabBtn").click();
  await page.locator("#openTemplateMatchingBtn").click();
  await expect(page.locator("#templateMatchingModal")).toBeVisible();
  await expect(page.locator("#templateNameInput")).toHaveValue("Sample Pink Anchor + Layout");
  await expect(page.locator("#templateOutputLayoutRadio")).toBeChecked();
  await expect(page.locator("#templateLayoutSelect")).toHaveValue("sample-color-grid-layout");
  await expect(page.locator("#templateSearchRoiToggle")).not.toBeChecked();

  await page.locator("#testTemplateMatchBtn").click();
  await expect(page.locator("#templateMatchScore")).not.toHaveText("Not tested", { timeout: 30_000 });
  await expect(page.locator("#templateMatchScore")).toHaveClass(/text-success/);
  await expect(page.locator("#templateMatchCoordinates")).toContainText("X 620, Y 301");
  await expect(page.locator("#applyTemplateMatchBtn")).toBeEnabled();
  await page.locator("#applyTemplateMatchBtn").click();
  await expect.poll(async () => page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi") as { getRectCount?: () => number } | undefined;
    return api?.getRectCount?.() ?? -1;
  })).toBe(56);

  await page.locator('#templateMatchingModal .modal-footer [data-bs-dismiss="modal"]').click();
  await expect(page.locator("#templateMatchingModal")).toBeHidden();
  await expect(page.locator('[data-ui="history-undo"]')).toBeEnabled();
  await page.locator("#appBrand").click();
  await expect.poll(async () => page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi") as { getRectCount?: () => number } | undefined;
    return api?.getRectCount?.() ?? -1;
  })).toBe(56);
  await expect(page.locator('[data-ui="history-undo"]')).toBeEnabled();

  await page.locator('[data-ui="history-undo"]').click();
  await expect.poll(async () => page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi") as { getRectCount?: () => number } | undefined;
    return api?.getRectCount?.() ?? -1;
  })).toBe(52);
  await page.locator('[data-ui="history-redo"]').click();
  await expect.poll(async () => page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi") as { getRectCount?: () => number } | undefined;
    return api?.getRectCount?.() ?? -1;
  })).toBe(56);
  await page.locator('[data-ui="history-undo"]').click();
  await expect.poll(async () => page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi") as { getRectCount?: () => number } | undefined;
    return api?.getRectCount?.() ?? -1;
  })).toBe(52);
  await expect(page.locator("#documentStatus")).toContainText("Unsaved changes");
  await page.locator("#saveLabelsBtn").click();
  await expect(page.locator("#documentStatus")).toContainText("Saved");

  expect(runtimeErrors).toEqual([]);
});
