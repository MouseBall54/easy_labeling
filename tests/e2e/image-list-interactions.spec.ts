import { expect, test } from "@playwright/test";

type MockFileInit = string | ArrayBuffer;

test("image-list: search, box counts, and image navigation work together", async ({ page }) => {
  await page.addInitScript(() => {
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
          },
          close: async () => {}
        };
      }
    }

    class MockDirectoryHandle {
      kind = "directory";
      name: string;
      entries: Map<string, MockDirectoryHandle | MockFileHandle>;

      constructor(name: string) {
        this.name = name;
        this.entries = new Map();
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

    const imageFolder = new MockDirectoryHandle("images");
    imageFolder.setEntry("alpha-1.png", new MockFileHandle("alpha-1.png", pngBuffer));
    imageFolder.setEntry("beta-2.png", new MockFileHandle("beta-2.png", pngBuffer));
    imageFolder.setEntry("gamma-3.png", new MockFileHandle("gamma-3.png", pngBuffer));
    const labelFolder = new MockDirectoryHandle("label");
    labelFolder.setEntry("beta-2.txt", new MockFileHandle(
      "beta-2.txt",
      "0 0.5 0.5 0.2 0.2\n2 0.25 0.25 0.1 0.1\n"
    ));
    imageFolder.setEntry("label", labelFolder);

    Object.defineProperty(window, "showDirectoryPicker", {
      configurable: true,
      writable: true,
      value: async () => imageFolder
    });
  });

  await page.goto("/index.html");
  await page.locator("#selectImageFolderBtn").click();

  await page.locator("#imageSearchInput").fill("beta");
  await expect(page.locator("#image-list .list-group-item")).toHaveCount(1);
  await expect(page.locator("#image-list .image-list-item-name")).toHaveText("beta-2.png");
  await expect(page.locator("#image-list [data-ui='image-box-count']")).toHaveText("2");

  await page.locator("#imageSearchInput").fill("");
  await page.locator('#image-list [data-file-name="gamma-3.png"]').click();
  await expect
    .poll(async () => {
      return page.evaluate(() => {
        const api = Reflect.get(window, "__easyLabelingTestApi");
        return api?.getCurrentImageName?.() ?? "";
      });
    })
    .toBe("gamma-3.png");
});
