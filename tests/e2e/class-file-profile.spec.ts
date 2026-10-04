import { expect, test } from "@playwright/test";

for (const task of ["Annotate", "Inference"]) {
  test(`${task}: Class Info profile creates, edits and shares a class file across tabs`, async ({ page }) => {
    await page.addInitScript(() => {
      class MockFileHandle {
        kind = "file" as const;
        private content = "";

        constructor(public readonly name: string) {}

        async getFile(): Promise<File> {
          return new File([this.content], this.name, { type: "text/yaml" });
        }

        async createWritable(): Promise<{ write(data: string): Promise<void>; close(): Promise<void> }> {
          return {
            write: async (data: string) => {
              this.content = data;
            },
            close: async () => {}
          };
        }
      }

      class MockDirectoryHandle {
        kind = "directory" as const;
        readonly name = "Class Info";
        private readonly files = new Map<string, MockFileHandle>();

        async *values(): AsyncIterable<MockFileHandle> {
          yield* this.files.values();
        }

        async getFileHandle(name: string, options?: { create?: boolean }): Promise<MockFileHandle> {
          const existing = this.files.get(name);
          if (existing) {
            return existing;
          }
          if (options?.create) {
            const created = new MockFileHandle(name);
            this.files.set(name, created);
            return created;
          }
          throw new DOMException(`File ${name} not found`, "NotFoundError");
        }
      }

      const profileFolder = new MockDirectoryHandle();
      Object.defineProperty(window, "getEasyLabelingProfileDirectory", {
        configurable: true,
        value: async () => profileFolder
      });
      Object.defineProperty(window, "showDirectoryPicker", {
        configurable: true,
        value: async () => {
          throw new DOMException("Not used", "AbortError");
        }
      });
    });

    await page.goto("/index.html");
    await page.locator(`#task${task}Btn`).click();
    await expect(page.locator(".classes-panel-section")).toBeVisible();
    await expect(page.locator("#loadClassInfoFolderBtn")).toBeVisible();
    await expect(page.locator("#addClassShortcutBtn")).toBeVisible();
    await expect(page.locator('#class-file-select option[value="__CREATE_NEW__"]')).toHaveCount(1);

    await page.locator("#class-file-select").selectOption("__CREATE_NEW__");
    await expect(page.locator("#createClassFileModal")).toBeVisible();
    await page.locator("#newClassFileNameInput").fill("custom-labels");
    await page.locator("#confirmCreateClassFileBtn").click();

    await expect(page.locator("#classFileViewerModal")).toBeVisible();
    await expect(page.locator("#class-file-select")).toHaveValue("custom-labels.yaml");
    await expect(page.locator("#classFileEditorBody tr")).not.toHaveCount(0);
    await expect(page.locator("#classFileEditorBody .class-name-input").first()).toBeEditable();
    await page.locator("#classFileEditorBody .class-name-input").first().fill("cell");
    await page.locator("#saveClassFileBtn").click();
    await expect(page.locator(".toast-message")).toContainText("Class file saved.");
    await page.locator("#classFileViewerModal .modal-header .btn-close").click();
    await expect(page.locator("#classFileViewerModal")).toBeHidden();
    await page.locator(`#task${task === "Annotate" ? "Inference" : "Annotate"}Btn`).click();
    await expect(page.locator("#class-file-select")).toHaveValue("custom-labels.yaml");
    await page.locator("#viewClassFileBtn").click();
    await expect(page.locator("#classFileEditorBody .class-name-input").first()).toHaveValue("cell");
  });
}
