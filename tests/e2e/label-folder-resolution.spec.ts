import { expect, test } from "@playwright/test";

test("parity: label-folder selection hook and autosave navigation bindings stay active", async ({ page }) => {
  const runtimeErrors: string[] = [];

  await page.addInitScript(() => {
    const writes: Array<{ fileName: string; content: string }> = [];
    let pickerCalls = 0;
    Object.defineProperty(window, "__mockWrites", {
      value: writes,
      configurable: true
    });
    Object.defineProperty(window, "__mockPickerCalls", {
      get: () => pickerCalls,
      configurable: true
    });

    const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8AARQMBgN6f3QAAAABJRU5ErkJggg==";
    const pngBinary = atob(pngBase64);
    const pngBuffer = new ArrayBuffer(pngBinary.length);
    const pngBytes = new Uint8Array(pngBuffer);
    for (let index = 0; index < pngBinary.length; index += 1) {
      pngBytes[index] = pngBinary.charCodeAt(index);
    }

    class MockFileHandle {
      kind = "file" as const;
      name: string;
      private content: ArrayBuffer | string;

      constructor(name: string, content: ArrayBuffer | string) {
        this.name = name;
        this.content = content;
      }

      async getFile(): Promise<File> {
        const type = this.name.endsWith(".png") ? "image/png" : "text/plain";
        return new File([this.content], this.name, { type });
      }

      async createWritable(): Promise<{ write: (data: string) => Promise<void>; close: () => Promise<void> }> {
        return {
          write: async (data: string) => {
            this.content = data;
            writes.push({ fileName: this.name, content: data });
          },
          close: async () => {
            void this.content;
          }
        };
      }
    }

    class MockDirectoryHandle {
      kind = "directory" as const;
      name: string;
      private entries = new Map<string, MockFileHandle | MockDirectoryHandle>();

      constructor(name: string) {
        this.name = name;
      }

      setEntry(name: string, entry: MockFileHandle | MockDirectoryHandle): void {
        this.entries.set(name, entry);
      }

      async *values(): AsyncIterable<MockFileHandle | MockDirectoryHandle> {
        for (const entry of this.entries.values()) {
          yield entry;
        }
      }

      async getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<MockDirectoryHandle> {
        const existing = this.entries.get(name);
        if (existing instanceof MockDirectoryHandle) {
          return existing;
        }
        if (options?.create) {
          const created = new MockDirectoryHandle(name);
          this.entries.set(name, created);
          return created;
        }

        throw new DOMException(`Directory ${name} not found`, "NotFoundError");
      }

      async getFileHandle(name: string, options?: { create?: boolean }): Promise<MockFileHandle> {
        const existing = this.entries.get(name);
        if (existing instanceof MockFileHandle) {
          return existing;
        }
        if (options?.create) {
          const created = new MockFileHandle(name, "");
          this.entries.set(name, created);
          return created;
        }

        throw new DOMException(`File ${name} not found`, "NotFoundError");
      }
    }

    const imageFolder = new MockDirectoryHandle("images");
    imageFolder.setEntry("img1.png", new MockFileHandle("img1.png", pngBuffer));
    imageFolder.setEntry("img2.png", new MockFileHandle("img2.png", pngBuffer));

    const labelFolder = new MockDirectoryHandle("label");
    labelFolder.setEntry("img1.txt", new MockFileHandle("img1.txt", "0 0.5 0.5 1 1\n"));
    imageFolder.setEntry("label", labelFolder);

    let scope: object | null = window;
    while (scope) {
      const descriptor = Object.getOwnPropertyDescriptor(scope, "showDirectoryPicker");
      if (descriptor?.configurable) {
        delete (scope as { showDirectoryPicker?: unknown }).showDirectoryPicker;
      }
      scope = Object.getPrototypeOf(scope);
    }

    Object.defineProperty(window, "showDirectoryPicker", {
      configurable: true,
      writable: true,
      value: async () => {
        pickerCalls += 1;
        return imageFolder;
      }
    });
  });

  page.on("console", (message) => {
    const text = message.text();
    if (/ReferenceError|TypeError/.test(text)) {
      runtimeErrors.push(text);
    }
  });

  await page.goto("/index.html");

  await expect(page.locator("#selectLabelFolderBtn")).toHaveClass(/\bbtn-danger\b/);
  await page.locator("#selectImageFolderBtn").click();

  const pickerCalls = await page.evaluate(() => {
    const value = Reflect.get(window, "__mockPickerCalls");
    return typeof value === "number" ? value : 0;
  });
  expect(pickerCalls).toBeGreaterThan(0);

  await page.locator("#autoSaveToggle").check();
  await page.locator("#nextImageBtn").click();

  await expect(page.locator("#autoSaveToggle")).toBeChecked();

  await expect
    .poll(async () => {
      return page.evaluate(() => {
        const api = Reflect.get(window, "__easyLabelingTestApi") as { getCurrentImageName?: () => string } | undefined;
        return typeof api?.getCurrentImageName === "function" ? api.getCurrentImageName() : "";
      });
    })
    .toBe("img2.png");

  await expect
    .poll(async () => {
      return page.evaluate(() => {
        const api = Reflect.get(window, "__easyLabelingTestApi") as { getRectCount?: () => number } | undefined;
        return typeof api?.getRectCount === "function" ? api.getRectCount() : -1;
      });
    })
    .toBeGreaterThanOrEqual(0);

  const writes = await page.evaluate(() => {
    const captured = Reflect.get(window, "__mockWrites");
    return Array.isArray(captured) ? [...captured] : [];
  });

  await expect
    .poll(async () => {
      const capturedWrites = await page.evaluate(() => {
        const captured = Reflect.get(window, "__mockWrites");
        return Array.isArray(captured) ? [...captured] : [];
      });
      return capturedWrites.length;
    })
    .toBeGreaterThan(0);

  const latestWrites = await page.evaluate(() => {
    const captured = Reflect.get(window, "__mockWrites");
    return Array.isArray(captured) ? [...captured] : [];
  });
  expect(latestWrites[0]).toMatchObject({ fileName: "img1.txt" });
  expect(runtimeErrors).toEqual([]);
});
