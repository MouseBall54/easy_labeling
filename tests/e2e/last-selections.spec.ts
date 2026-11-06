import { expect, test } from "@playwright/test";

// Opening a folder restores the class file and presets chosen last: a folder opened before gets its own choice
// back, a new folder the latest choice made anywhere. Folders: A, B, A, C, then (after a reload) B.
test("last selections: folders reopen with their own class file and preset, new folders with the latest", async ({ page }) => {
  await page.addInitScript(() => {
    const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAAAAACMmsGiAAAAEklEQVR4nGNgYGD4z8DAwMDAAAAODgEB0Jc0TwAAAABJRU5ErkJggg==";
    const png = Uint8Array.from(atob(pngBase64), (char) => char.charCodeAt(0)).buffer;
    class MockFile {
      kind = "file";
      constructor(public name: string, public content: string | ArrayBuffer) {}
      async getFile() { return new File([this.content], this.name, { type: this.name.endsWith(".png") ? "image/png" : "text/plain" }); }
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
    const presets = JSON.stringify({ schemaVersion: 1, presets: [{ name: "Soft", config: { contrast: 1.2 } }, { name: "Sharp", config: { contrast: 2 } }] });
    const folder = (name: string) => new MockDir(name)
      .add(new MockFile("img.png", png))
      .add(new MockDir("label").add(new MockFile("fins.yaml", "0: fin\n")).add(new MockFile("pads.yaml", "0: pad\n")))
      .add(new MockDir(".easy-labeling").add(new MockFile("preprocessing-presets.json", presets)));
    const folders = Object.fromEntries(["A", "B", "C"].map((name) => [name, folder(name)]));
    Object.defineProperty(window, "showDirectoryPicker", {
      configurable: true,
      value: async () => folders[sessionStorage.getItem("nextFolder") ?? "A"]
    });
  });

  const classFile = page.locator("#class-file-select");
  const preset = page.locator("#segmentationPreprocessPresetSelect");
  const open = async (name: string) => {
    await page.evaluate((next) => sessionStorage.setItem("nextFolder", next), name);
    // The standby summary is rewritten when the workspace (selections included) is ready.
    await page.locator("#workspaceStandbySummary").evaluate((element) => { element.textContent = ""; });
    await page.locator("#selectImageFolderBtn").click();
    await expect(page.locator("#workspaceStandbySummary")).toContainText(/^Workspace/);
  };
  const expectChoice = async (file: string, presetName: string) => {
    await expect(classFile).toHaveValue(file);
    await expect(preset).toHaveValue(presetName);
  };
  const choose = async (file: string, presetName: string) => {
    await classFile.selectOption(file);
    await preset.selectOption(presetName, { force: true }); // the Preprocess panel may be closed
  };

  await page.goto("/index.html");
  await open("A");
  await expect(classFile).toHaveValue("fins.yaml");
  await choose("pads.yaml", "Sharp");

  await open("B"); // first time: the latest choice
  await expectChoice("pads.yaml", "Sharp");
  await choose("fins.yaml", "Soft");

  await open("A"); // its own choice
  await expectChoice("pads.yaml", "Sharp");

  await open("C"); // first time: the latest choice (A's, just restored)
  await expectChoice("pads.yaml", "Sharp");

  await page.reload(); // remembered across sessions
  await open("B");
  await expectChoice("fins.yaml", "Soft");
});
