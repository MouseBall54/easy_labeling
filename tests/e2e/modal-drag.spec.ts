import { expect, test, type Page } from "@playwright/test";

async function showModal(page: Page, id: string): Promise<void> {
  await page.evaluate((modalId) => new Promise<void>((resolve) => {
    const modal = document.getElementById(modalId)!;
    modal.addEventListener("shown.bs.modal", () => resolve(), { once: true });
    const Modal = Reflect.get(window, "bootstrap").Modal;
    Reflect.get(Modal, "getOrCreateInstance").call(Modal, modal).show();
  }), id);
}

async function hideModal(page: Page, id: string): Promise<void> {
  await page.evaluate((modalId) => new Promise<void>((resolve) => {
    const modal = document.getElementById(modalId)!;
    modal.addEventListener("hidden.bs.modal", () => resolve(), { once: true });
    const Modal = Reflect.get(window, "bootstrap").Modal;
    Reflect.get(Modal, "getInstance").call(Modal, modal).hide();
  }), id);
}

for (const scenario of ["detection-light", "segmentation-dark"]) {
  test(`${scenario}: every popup drags by its header and resets after closing`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto("/index.html", { waitUntil: "domcontentloaded" });
    await expect.poll(() => page.evaluate(() => Boolean(Reflect.get(window, "__easyLabelingTestApi")))).toBe(true);
    await page.locator("#emptyLoadSampleBtn").click();
    await expect(page.locator("#loading-overlay")).toBeHidden({ timeout: 45_000 });
    await expect.poll(() => page.evaluate(() => Reflect.get(window, "__easyLabelingTestApi").getRectCount())).toBe(207);
    if (scenario === "segmentation-dark") {
      await page.locator('label[for="darkModeToggle"]').click();
      await page.locator('label[for="segmentationWorkflowTab"]').click();
    }
    const original = await page.evaluate(() => {
      const api = Reflect.get(window, "__easyLabelingTestApi");
      return { rects: api.getRectGeometries(), mask: api.getSegmentationMaskBounds() };
    });
    const ids = await page.locator(".modal").evaluateAll((modals) => modals.map((modal) => modal.id));
    expect(ids).toHaveLength(10);
    for (const id of ids) {
      await test.step(id, async () => {
        await showModal(page, id);
        const header = page.locator(`#${id} .modal-header`);
        const content = page.locator(`#${id} .modal-content`);
        await expect(header).toHaveAttribute("data-modal-drag", "installed");
        await expect(header).toHaveCSS("cursor", "grab");
        const initial = (await content.boundingBox())!;
        const title = (await header.locator(".modal-title").boundingBox())!;
        const start = { x: title.x + 15, y: title.y + title.height / 2 };
        await page.mouse.move(start.x, start.y);
        await page.mouse.down();
        await page.mouse.move(start.x + 35, start.y + 22, { steps: 5 });
        await expect(header).toHaveCSS("cursor", "grabbing");
        const moved = (await content.boundingBox())!;
        expect(moved.x - initial.x).toBeCloseTo(35, 0);
        expect(moved.y - initial.y).toBeCloseTo(22, 0);
        // Pointer capture keeps dragging when the cursor leaves the header.
        await page.mouse.move(start.x + 90, start.y + 120, { steps: 5 });
        await page.mouse.up();
        await expect(header).toHaveCSS("cursor", "grab");
        const released = (await content.boundingBox())!;
        expect(released.x - initial.x).toBeCloseTo(90, 0);
        expect(released.y - initial.y).toBeCloseTo(120, 0);
        await page.mouse.move(20, 20);
        expect(await content.boundingBox()).toEqual(released);
        expect(await page.evaluate(() => window.getSelection()?.toString())).toBe("");
        await hideModal(page, id);
        expect(await content.evaluate((element) => element.style.translate)).toBe("");
        await showModal(page, id);
        const reopened = (await content.boundingBox())!;
        expect(Math.abs(reopened.x - initial.x)).toBeLessThan(1);
        expect(Math.abs(reopened.y - initial.y)).toBeLessThan(1);
        await hideModal(page, id);
      });
    }
    expect(await page.evaluate(() => {
      const api = Reflect.get(window, "__easyLabelingTestApi");
      return { rects: api.getRectGeometries(), mask: api.getSegmentationMaskBounds() };
    })).toEqual(original);

    // Use the real class editor trigger for controls, scrolling and viewport bounds.
    if (scenario === "detection-light") {
      await page.locator("#addClassShortcutBtn").click();
      await expect(page.locator("#classFileViewerModal")).toBeVisible();
      const header = page.locator("#classFileViewerModal .modal-header");
      const content = page.locator("#classFileViewerModal .modal-content");
      const input = page.locator("#classFileEditorBody .class-name-input").first();
      await expect(input).toBeVisible();
      const originalName = await input.inputValue();
      const originalBox = (await content.boundingBox())!;
      await input.fill("dragged editor draft");
      let head = (await header.boundingBox())!;
      await page.mouse.move(head.x + 25, head.y + 25);
      await page.mouse.down();
      await page.mouse.move(head.x + 105, head.y + 37, { steps: 5 });
      await page.mouse.up();
      await expect(input).toHaveValue("dragged editor draft");
      await expect(page.locator(".toast-message")).toHaveCount(0);
      await page.screenshot({ path: "output/modal-drag-class-editor.png" });
      head = (await header.boundingBox())!;
      await page.mouse.move(head.x + 25, head.y + 25);
      await page.mouse.down();
      await page.mouse.move(4000, 4000, { steps: 8 });
      await page.mouse.up();
      let bounds = (await header.boundingBox())!;
      expect(bounds.x).toBeLessThanOrEqual(1280 - 96 - 8);
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(720 - 8);
      await page.setViewportSize({ width: 800, height: 600 });
      bounds = (await header.boundingBox())!;
      expect(bounds.x).toBeLessThanOrEqual(800 - 96 - 8);
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(600 - 8);
      await page.mouse.move(Math.min(750, bounds.x + 25), bounds.y + 25);
      await page.mouse.down();
      await page.mouse.move(-4000, -4000, { steps: 8 });
      await page.mouse.up();
      bounds = (await header.boundingBox())!;
      expect(bounds.x + bounds.width).toBeGreaterThanOrEqual(96 + 8);
      expect(bounds.y).toBeGreaterThanOrEqual(8);
      await page.keyboard.press("Escape");
      await expect(page.locator("#classFileViewerModal")).toBeHidden();
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.locator("#addClassShortcutBtn").click();
      await expect(input).toHaveValue(originalName);
      await expect(content).toBeVisible();
      const reopened = (await content.boundingBox())!;
      expect(reopened.x).toBeCloseTo(originalBox.x, 0);
      await page.locator("#classFileViewerModal .modal-body").evaluate((body) => { body.scrollTop = body.scrollHeight; });
      await expect.poll(() => page.locator("#classFileViewerModal .modal-body").evaluate((body) => body.scrollTop)).toBeGreaterThan(0);
      const close = page.locator("#classFileViewerModal .btn-close");
      await close.click({ trial: true });
      const closeBox = (await close.boundingBox())!;
      await page.mouse.move(closeBox.x + closeBox.width / 2, closeBox.y + closeBox.height / 2);
      await page.mouse.down();
      await expect(header).not.toHaveClass(/is-dragging/);
      await page.mouse.up();
      await expect(page.locator("#classFileViewerModal")).toBeHidden();
      await expect(page.locator("#addClassShortcutBtn")).toBeFocused();
    }
  });
}
