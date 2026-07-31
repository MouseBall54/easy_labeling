import { expect, test } from "@playwright/test";

test("keeps text and numeric inputs editable immediately after creating a missing label folder", async ({ page }) => {
  await page.addInitScript(() => {
    const pngBytes = Uint8Array.from(atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8AARQMBgN6f3QAAAABJRU5ErkJggg=="), (character) => character.charCodeAt(0));
    const png = pngBytes.buffer;

    class MockFileHandle {
      kind = "file" as const;
      constructor(public name: string, private content: BlobPart) {}
      async getFile(): Promise<File> {
        return new File([this.content], this.name, { type: "image/png" });
      }
      async createWritable(): Promise<{ write(data: BlobPart): Promise<void>; close(): Promise<void> }> {
        return {
          write: async (data) => {
            this.content = data;
          },
          close: async () => undefined
        };
      }
    }

    class MockDirectoryHandle {
      kind = "directory" as const;
      private entries = new Map<string, MockDirectoryHandle | MockFileHandle>();
      constructor(public name: string) {}
      add(name: string, entry: MockDirectoryHandle | MockFileHandle): void {
        this.entries.set(name, entry);
      }
      async *values(): AsyncIterable<MockDirectoryHandle | MockFileHandle> {
        yield* this.entries.values();
      }
      async getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<MockDirectoryHandle> {
        const existing = this.entries.get(name);
        if (existing instanceof MockDirectoryHandle) {
          return existing;
        }
        if (options?.create) {
          const created = new MockDirectoryHandle(name);
          this.entries.set(name, created);
          Reflect.set(window, "__missingLabelFolderCreated", true);
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

    const dataset = new MockDirectoryHandle("dataset-without-settings");
    dataset.add("image.png", new MockFileHandle("image.png", png));
    Reflect.set(window, "__makeMissingLabelDataset", () => {
      const nextDataset = new MockDirectoryHandle("another-dataset-without-settings");
      nextDataset.add("next.png", new MockFileHandle("next.png", png));
      return nextDataset;
    });
    Object.defineProperty(window, "showDirectoryPicker", {
      configurable: true,
      value: async () => dataset
    });
  });

  await page.goto("/index.html");
  await page.locator("#selectImageFolderBtn").click();
  await expect(page.locator("#missingLabelFolderModal")).toBeVisible();
  await page.locator("#createMissingLabelFolderBtn").click();
  await expect(page.locator("#missingLabelFolderModal")).toBeHidden();
  await expect.poll(() => page.evaluate(() => Reflect.get(window, "__missingLabelFolderCreated"))).toBe(true);
  await expect(page.locator('[data-standby-step="labels"]')).toHaveAttribute("data-state", "ready");
  await expect(page.locator('[data-standby-step="images"]')).toHaveAttribute("data-state", "ready");
  await expect(page.locator('[data-standby-step="classes"]')).toHaveAttribute("data-state", "ready");
  await expect(page.locator('[data-standby-step="automation"]')).toHaveAttribute("data-state", "ready");
  await expect(page.locator('[data-standby-step="matching"]')).toHaveAttribute("data-state", "ready");
  await expect(page.locator("#workspaceStandbyPanel")).toBeHidden();

  const searchInput = page.locator("#imageSearchInput");
  await searchInput.click();
  await searchInput.pressSequentially("image");
  await expect(searchInput).toHaveValue("image");
  await expect(searchInput).toBeFocused();

  const zoomInput = page.locator("#zoom-input");
  await zoomInput.click();
  await zoomInput.press("ControlOrMeta+A");
  await zoomInput.pressSequentially("125");
  await expect(zoomInput).toHaveValue("125");
  await expect(zoomInput).toBeFocused();

  await page.evaluate(() => {
    const createDataset = Reflect.get(window, "__makeMissingLabelDataset") as () => FileSystemDirectoryHandle;
    window.showDirectoryPicker = async () => createDataset();
  });
  await page.locator("#selectImageFolderBtn").click();
  await expect(page.locator("#missingLabelFolderModal")).toBeVisible();
  await page.locator("#continueWithoutLabelFolderBtn").click();
  await expect(page.locator("#missingLabelFolderModal")).toBeHidden();
  await expect(page.locator('[data-standby-step="labels"]')).toHaveAttribute("data-state", "warning");
  await expect(page.locator("#workspaceStandbyActions")).toBeVisible();
  await page.locator("#dismissWorkspaceStandbyBtn").click();
  await expect(page.locator("#workspaceStandbyPanel")).toBeHidden();

  await searchInput.click();
  await searchInput.press("ControlOrMeta+A");
  await searchInput.pressSequentially("next");
  await expect(searchInput).toHaveValue("next");
  await expect(searchInput).toBeFocused();
});
