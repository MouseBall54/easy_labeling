import { expect, test } from "@playwright/test";

type MockFileInit = string | ArrayBuffer;
type MockWrite = { fileName: string; content: string };

test("folder-switch: autosave persists current labels before switching folders", async ({ page }) => {
  await page.addInitScript(() => {
    const writes: MockWrite[] = [];
    let pickerCalls = 0;
    Object.defineProperty(window, "__mockWrites", { value: writes, configurable: true });

    const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8AARQMBgN6f3QAAAABJRU5ErkJggg==";
    const pngBinary = atob(pngBase64);
    const pngBuffer = new ArrayBuffer(pngBinary.length);
    const pngBytes = new Uint8Array(pngBuffer);
    for (let index = 0; index < pngBinary.length; index += 1) {
      pngBytes[index] = pngBinary.charCodeAt(index);
    }

    class MockFileHandle {
      kind = "file";
      name: string;
      content: MockFileInit;
      constructor(name: string, content: MockFileInit) {
        this.name = name;
        this.content = content;
      }
      async getFile() {
        const type = this.name.endsWith(".png") ? "image/png" : "text/plain";
        return new File([this.content], this.name, { type });
      }
      async createWritable() {
        return {
          write: async (data: string) => {
            this.content = data;
            writes.push({ fileName: this.name, content: data });
          },
          close: async () => {}
        };
      }
    }

    class MockDirectoryHandle {
      kind = "directory";
      name: string;
      entries: Map<string, MockDirectoryHandle | MockFileHandle> = new Map();
      constructor(name: string) {
        this.name = name;
      }
      setEntry(name: string, entry: MockDirectoryHandle | MockFileHandle) {
        this.entries.set(name, entry);
      }
      async *values() {
        for (const entry of this.entries.values()) {
          yield entry;
        }
      }
      async getDirectoryHandle(name: string, options?: { create?: boolean }) {
        const existing = this.entries.get(name);
        if (existing instanceof MockDirectoryHandle) {
          return existing;
        }
        if (options?.create) {
          const created = new MockDirectoryHandle(name);
          this.entries.set(name, created);
          return created;
        }
        throw new DOMException("Directory not found", "NotFoundError");
      }
      async getFileHandle(name: string, options?: { create?: boolean }) {
        const existing = this.entries.get(name);
        if (existing instanceof MockFileHandle) {
          return existing;
        }
        if (options?.create) {
          const created = new MockFileHandle(name, "");
          this.entries.set(name, created);
          return created;
        }
        throw new DOMException("File not found", "NotFoundError");
      }
    }

    const firstFolder = new MockDirectoryHandle("images-a");
    firstFolder.setEntry("img1.png", new MockFileHandle("img1.png", pngBuffer));
    const firstLabelFolder = new MockDirectoryHandle("label");
    firstLabelFolder.setEntry("img1.txt", new MockFileHandle("img1.txt", "0 0.5 0.5 1 1\n"));
    firstFolder.setEntry("label", firstLabelFolder);

    const secondFolder = new MockDirectoryHandle("images-b");
    secondFolder.setEntry("img2.png", new MockFileHandle("img2.png", pngBuffer));
    const secondLabelFolder = new MockDirectoryHandle("label");
    secondFolder.setEntry("label", secondLabelFolder);

    Object.defineProperty(window, "showDirectoryPicker", {
      configurable: true,
      writable: true,
      value: async () => {
        pickerCalls += 1;
        return pickerCalls === 1 ? firstFolder : secondFolder;
      }
    });
  });

  await page.goto("/index.html");
  await page.locator("#autoSaveToggle").check();
  await page.locator("#selectImageFolderBtn").click();
  await page.locator("#selectImageFolderBtn").click();

  await expect
    .poll(async () => {
      return page.evaluate(() => {
        const captured = Reflect.get(window, "__mockWrites");
        return Array.isArray(captured) ? captured.length : 0;
      });
    })
    .toBeGreaterThan(0);

  const writes = await page.evaluate(() => {
    const captured = Reflect.get(window, "__mockWrites");
    return Array.isArray(captured) ? [...captured] : [];
  });

  expect(writes[0]).toMatchObject({ fileName: "img1.txt" });
});
