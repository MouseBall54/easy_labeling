import { expect, test } from "@playwright/test";

// "Show box size (W×H)" adds the selected box's rounded width × height to its canvas tag, live while it changes.
test("box size tag: selected boxes show W×H when the option is on, remembered across reloads", async ({ page }) => {
  await page.addInitScript(() => {
    class MockFile {
      kind = "file";
      constructor(public name: string, public content: string) {}
      async getFile() {
        if (!this.name.endsWith(".png")) return new File([this.content], this.name, { type: "text/plain" });
        const canvas = document.createElement("canvas");
        canvas.width = 200;
        canvas.height = 100;
        const blob = await new Promise<Blob>((resolve) => canvas.toBlob((value) => resolve(value!), "image/png"));
        return new File([blob], this.name, { type: "image/png" });
      }
      async createWritable() { return { write: async (data: string) => { this.content = data; }, close: async () => {} }; }
    }
    class MockDir {
      kind = "directory";
      entries = new Map<string, MockDir | MockFile>();
      constructor(public name: string) {}
      add(entry: MockDir | MockFile) { this.entries.set(entry.name, entry); return this; }
      async *values() { yield* this.entries.values(); }
      async getDirectoryHandle(name: string, options?: { create?: boolean }) {
        const found = this.entries.get(name);
        if (found instanceof MockDir) return found;
        if (options?.create) { const dir = new MockDir(name); this.add(dir); return dir; }
        throw new DOMException("Directory not found", "NotFoundError");
      }
      async getFileHandle(name: string, options?: { create?: boolean }) {
        const found = this.entries.get(name);
        if (found instanceof MockFile) return found;
        if (options?.create) { const file = new MockFile(name, ""); this.add(file); return file; }
        throw new DOMException("File not found", "NotFoundError");
      }
    }
    const root = new MockDir("sizes")
      .add(new MockFile("img.png", ""))
      .add(new MockDir("label").add(new MockFile("img.txt", "0 0.25 0.5 0.2 0.3\n1 0.75 0.5 0.1 0.4\n")));
    Object.defineProperty(window, "showDirectoryPicker", { configurable: true, value: async () => root });
  });

  type Api = { getLabelTagTexts(): { text: string }[]; selectRectsByIndex(indices: number[]): void; getRectCount(): number };
  const tags = () => page.evaluate(() => (Reflect.get(window, "__easyLabelingTestApi") as Api).getLabelTagTexts().map((tag) => tag.text));
  const open = async () => {
    await page.locator("#selectImageFolderBtn").click();
    await expect.poll(() => page.evaluate(() => (Reflect.get(window, "__easyLabelingTestApi") as Api | undefined)?.getRectCount?.() ?? 0)).toBe(2);
    await page.evaluate(() => (Reflect.get(window, "__easyLabelingTestApi") as Api).selectRectsByIndex([0]));
  };

  await page.goto("/index.html");
  await open();
  await expect.poll(async () => (await tags())[0]).not.toMatch(/×/);

  await page.locator("#taskDetectionDisplayBtn").click();
  await page.locator("#showSelectedBoxSizeToggle").check();
  await page.evaluate(() => (Reflect.get(window, "__easyLabelingTestApi") as Api).selectRectsByIndex([0])); // switching panels clears the selection
  await expect.poll(async () => (await tags())[0]).toMatch(/ 40×30$/);
  expect((await tags())[1]).not.toMatch(/×/); // not selected

  // Live: the tag follows a resize.
  await page.locator("#inspectorTransformTabBtn").click();
  await page.locator("#selectionResizeModeSelect").selectOption("to");
  await page.locator("#selectionResizeWidthInput").fill("25.4");
  await page.locator("#resizeSelectedBoxesBtn").click();
  await expect.poll(async () => (await tags())[0]).toMatch(/ 25×30$/);

  await page.reload();
  await open();
  await expect(page.locator("#showSelectedBoxSizeToggle")).toBeChecked();
  await expect.poll(async () => (await tags())[0]).toMatch(/ 40×30$/);

  await page.locator("#taskDetectionDisplayBtn").click();
  await page.locator("#showSelectedBoxSizeToggle").uncheck();
  await expect.poll(async () => (await tags())[0]).not.toMatch(/×/);
});
