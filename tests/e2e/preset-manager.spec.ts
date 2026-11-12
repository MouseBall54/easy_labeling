import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

// The preset folder manager (desktop): a profile folder held in memory stands in for Documents/Easy Labeling, through
// the same window functions the desktop app defines (getEasyLabelingProfileDirectory, listEasyLabelingLibraryFiles).
const sample = JSON.parse(readFileSync("assets/sample/.easy-labeling/automation-library.json", "utf8")) as { layouts: Array<Record<string, unknown>> };
const layout = { ...sample.layouts[0], id: "profile-grid", name: "Profile grid" };

async function installMemoryProfile(page: Page): Promise<void> {
  await page.addInitScript((layoutJson: string) => {
    interface MemoryDir { kind: "directory"; name: string; files: Map<string, string>; dirs: Map<string, MemoryDir> }
    const notFound = (name: string) => Object.assign(new Error(`${name} not found`), { name: "NotFoundError" });
    const fileHandle = (dir: MemoryDir, name: string) => ({
      kind: "file" as const,
      name,
      async getFile() { return { name, text: async () => dir.files.get(name) ?? "" }; },
      async createWritable() {
        let text = "";
        return { async write(data: string) { text += data; }, async close() { dir.files.set(name, text); } };
      }
    });
    const makeDir = (name: string): MemoryDir & Record<string, unknown> => {
      const dir = { kind: "directory" as const, name, files: new Map<string, string>(), dirs: new Map<string, MemoryDir>() };
      return Object.assign(dir, {
        async *values() {
          for (const file of dir.files.keys()) yield fileHandle(dir, file);
          for (const child of dir.dirs.values()) yield child;
        },
        async getDirectoryHandle(child: string, options?: { create?: boolean }) {
          if (!dir.dirs.has(child)) {
            if (!options?.create) throw notFound(child);
            dir.dirs.set(child, makeDir(child));
          }
          return dir.dirs.get(child);
        },
        async getFileHandle(file: string, options?: { create?: boolean }) {
          if (!dir.files.has(file)) {
            if (!options?.create) throw notFound(file);
            dir.files.set(file, "");
          }
          return fileHandle(dir, file);
        },
        async removeEntry(file: string) {
          if (!dir.files.delete(file)) throw notFound(file);
        }
      });
    };
    const roots = new Map<string, MemoryDir>();
    const root = (kind: string) => {
      if (!roots.has(kind)) roots.set(kind, makeDir(kind));
      return roots.get(kind)!;
    };
    const grid = makeDir("Grid");
    grid.files.set("grid copy.json", layoutJson);
    root("layout").dirs.set("Grid", grid);
    const walk = (dir: MemoryDir, prefix: string): Array<{ name: string; filePath: string; contents: string }> => [
      ...[...dir.files].filter(([name]) => name.endsWith(".json")).map(([name, contents]) => ({ name: prefix + name, filePath: prefix + name, contents })),
      ...[...dir.dirs.values()].flatMap((child) => walk(child, `${prefix}${child.name}/`))
    ];
    Object.assign(window, {
      getEasyLabelingProfileDirectory: async (kind: string) => root(kind),
      listEasyLabelingLibraryFiles: async (kind: string) => walk(root(kind), ""),
      profilePaths: (kind: string) => walk(root(kind), "").map((file) => file.name)
    });
  }, JSON.stringify(layout));
}

test("preset manager moves presets between folders, creates folders and picks where new presets are saved", async ({ page }) => {
  test.setTimeout(90_000);
  await installMemoryProfile(page);
  await page.goto("/index.html", { waitUntil: "domcontentloaded" });
  await page.locator("#emptyLoadSampleBtn").click();
  await expect(page.locator("#loading-overlay")).toBeHidden({ timeout: 45_000 });
  await page.locator("#taskAutomateBtn").click();
  const profilePaths = () => page.evaluate(() => (window as unknown as { profilePaths(kind: string): string[] }).profilePaths("layout"));
  const option = page.locator('#boxLayoutSelect option[value="profile-grid"]');
  await expect(option).toHaveAttribute("data-folder", "Grid");

  // The picker opens the manager.
  await page.locator("#boxLayoutSelect + .preset-picker-button").click();
  await page.locator(".preset-picker-manage").click();
  const manager = page.locator(".preset-manager");
  await expect(manager).toBeVisible();
  await expect(manager.locator(".modal-title")).toHaveText("Layouts");
  const rows = manager.locator(".preset-manager-row");
  await expect(rows).toHaveText([" Top folder", " Grid", " grid copy"]);

  page.once("dialog", (dialog) => void dialog.accept("SEM / Metal"));
  await manager.locator("[data-action='new-folder']").click();
  await expect(rows).toHaveText([" Top folder", " Grid", " grid copy", " SEM", " Metal"]);

  // Move by the Move-to bar.
  await rows.filter({ hasText: "grid copy" }).click();
  await manager.locator("[data-role='move-target']").selectOption("SEM/Metal");
  await manager.locator("[data-action='move']").click();
  await expect(manager.locator(".preset-manager-status")).toHaveText("Moved grid copy.json to SEM/Metal.");
  expect(await profilePaths()).toEqual(["SEM/Metal/grid copy.json"]);
  // The panel reread its layouts: the option now carries the new folder.
  await expect(option).toHaveAttribute("data-folder", "SEM/Metal");

  // Move by dragging onto a folder.
  await rows.filter({ hasText: "grid copy" }).dragTo(rows.filter({ hasText: "Top folder" }));
  await expect.poll(profilePaths).toEqual(["grid copy.json"]);
  await expect(option).not.toHaveAttribute("data-folder", /.+/);

  // Where new presets go.
  await manager.locator("#presetManagerSaveFolder").selectOption("SEM");
  expect(await page.evaluate(() => localStorage.getItem("easyLabeling.presetSaveFolder.layout"))).toBe("SEM");
  await rows.filter({ hasText: "Metal" }).click();
  await page.screenshot({ path: "test-results/preset-manager-light.png" });
  await page.keyboard.press("Escape");
  await expect(manager).toBeHidden();

  await page.locator('label[for="darkModeToggle"]').click();
  await page.locator("#boxLayoutSelect + .preset-picker-button").click();
  await page.locator(".preset-picker-manage").click();
  await expect(manager).toBeVisible();
  await expect(manager.locator("#presetManagerSaveFolder")).toHaveValue("SEM");
  await page.screenshot({ path: "test-results/preset-manager-dark.png" });
  await manager.locator(".modal-footer [data-action='close']").click();
  await expect(manager).toBeHidden();
});
