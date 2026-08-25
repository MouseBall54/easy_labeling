import { expect, test, type Page } from "@playwright/test";

type MockFileInit = string | ArrayBuffer;

interface VisibilitySnapshot {
  imageName: string;
  visibleRectCount: number;
  visibleClassKeys: string[];
  visibleLabelRowCount: number;
}

async function readVisibilitySnapshot(page: Page): Promise<VisibilitySnapshot> {
  return page.evaluate(() => {
    const api = Reflect.get(window, "__easyLabelingTestApi") as
      | {
          getCurrentImageName?: () => string;
          getVisibleRectCount?: () => number;
          getVisibleClassKeys?: () => string[];
          getVisibleLabelRowCount?: () => number;
        }
      | undefined;

    return {
      imageName: api?.getCurrentImageName?.() ?? "",
      visibleRectCount: api?.getVisibleRectCount?.() ?? -1,
      visibleClassKeys: api?.getVisibleClassKeys?.() ?? [],
      visibleLabelRowCount: api?.getVisibleLabelRowCount?.() ?? -1
    };
  });
}

test("filter visibility: class toggles, reset, persistence, and stability", async ({ page }) => {
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
    imageFolder.setEntry("scene-a.png", new MockFileHandle("scene-a.png", pngBuffer));
    imageFolder.setEntry("scene-b.png", new MockFileHandle("scene-b.png", pngBuffer));

    const labelFolder = new MockDirectoryHandle("label");
    labelFolder.setEntry(
      "scene-a.txt",
      new MockFileHandle(
        "scene-a.txt",
        ["0 0.20 0.20 0.20 0.20", "1 0.60 0.60 0.20 0.20", "1 0.75 0.25 0.10 0.10"].join("\n")
      )
    );
    labelFolder.setEntry(
      "scene-b.txt",
      new MockFileHandle(
        "scene-b.txt",
        ["1 0.35 0.35 0.30 0.30", "1 0.65 0.65 0.20 0.20", "2 0.50 0.50 0.15 0.15"].join("\n")
      )
    );
    imageFolder.setEntry("label", labelFolder);

    Object.defineProperty(window, "showDirectoryPicker", {
      configurable: true,
      writable: true,
      value: async () => imageFolder
    });
  });

  await page.goto("/index.html");
  await page.locator("#selectImageFolderBtn").click();

  await expect.poll(async () => readVisibilitySnapshot(page)).toEqual({
    imageName: "scene-a.png",
    visibleRectCount: 3,
    visibleClassKeys: ["0", "1"],
    visibleLabelRowCount: 3
  });
  await expect(page.locator('[data-ui="filter-summary"]')).toHaveText("Visible: 3 / Total: 3");

  await page.locator('[data-ui="filter-class"][data-filter-key="1"]').click();
  await expect.poll(async () => readVisibilitySnapshot(page)).toEqual({
    imageName: "scene-a.png",
    visibleRectCount: 1,
    visibleClassKeys: ["0"],
    visibleLabelRowCount: 1
  });
  await expect(page.locator('[data-ui="filter-summary"]')).toHaveText("Visible: 1 / Total: 3");

  await page.locator('[data-ui="filter-class"][data-filter-key="0"]').click();
  await expect.poll(async () => readVisibilitySnapshot(page)).toEqual({
    imageName: "scene-a.png",
    visibleRectCount: 0,
    visibleClassKeys: [],
    visibleLabelRowCount: 0
  });
  await expect(page.locator('[data-ui="label-list-empty"]')).toBeVisible();
  await expect(page.locator('[data-ui="filter-summary"]')).toHaveText("Visible: 0 / Total: 3");

  await page.locator('[data-ui="filter-all"]').click();
  await expect.poll(async () => readVisibilitySnapshot(page)).toEqual({
    imageName: "scene-a.png",
    visibleRectCount: 3,
    visibleClassKeys: ["0", "1"],
    visibleLabelRowCount: 3
  });
  await expect(page.locator('[data-ui="label-list-empty"]')).toHaveCount(0);
  await expect(page.locator('[data-ui="filter-summary"]')).toHaveText("Visible: 3 / Total: 3");

  await page.locator('[data-ui="filter-class"][data-filter-key="1"]').click();
  await page.locator('#image-list .list-group-item:has-text("scene-b.png")').click();

  await expect.poll(async () => readVisibilitySnapshot(page)).toEqual({
    imageName: "scene-b.png",
    visibleRectCount: 1,
    visibleClassKeys: ["2"],
    visibleLabelRowCount: 1
  });
  await expect(page.locator('[data-ui="filter-summary"]')).toHaveText("Visible: 1 / Total: 3");

  await page.locator('[data-ui="filter-all"]').click();
  await expect.poll(async () => readVisibilitySnapshot(page)).toEqual({
    imageName: "scene-b.png",
    visibleRectCount: 3,
    visibleClassKeys: ["1", "2"],
    visibleLabelRowCount: 3
  });

  for (let count = 0; count < 4; count += 1) {
    await page.locator('[data-ui="filter-all"]').click();
    const shouldBeVisible = count % 2 === 1;
    await expect.poll(async () => readVisibilitySnapshot(page)).toEqual({
      imageName: "scene-b.png",
      visibleRectCount: shouldBeVisible ? 3 : 0,
      visibleClassKeys: shouldBeVisible ? ["1", "2"] : [],
      visibleLabelRowCount: shouldBeVisible ? 3 : 0
    });
    await expect(page.locator("#label-list li.list-group-item.active")).toHaveCount(0);
    await expect(page.locator('[data-ui="label-list-empty"]')).toHaveCount(shouldBeVisible ? 0 : 1);
    await expect(page.locator('[data-ui="filter-summary"]')).toHaveText(`Visible: ${shouldBeVisible ? 3 : 0} / Total: 3`);
  }
});
