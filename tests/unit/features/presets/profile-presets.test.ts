import { describe, expect, it, vi } from "vitest";

import { getPresetSaveFolder, openProfilePresetFolder, presetFileName, presetFolderOf, presetFolderPath, setPresetSaveFolder, type ProfilePresetWindow } from "../../../../src/features/presets/profile-presets.js";
import { loadPreprocessingPresetLibrary, serializePreprocessingPresets } from "../../../../src/features/segmentation/preprocessing-presets.js";
import { loadSegmentationToolPresetLibrary, saveSegmentationToolPresetFile } from "../../../../src/features/segmentation/preset-service.js";
import { DEFAULT_SEGMENTATION_PREPROCESSING_CONFIG } from "../../../../src/features/segmentation/preprocessing.js";
import type { SegmentationToolPreset } from "../../../../src/features/segmentation/types.js";

const notFound = (name: string) => Object.assign(new Error(`${name} not found`), { name: "NotFoundError" });

interface MemoryFolder {
  kind: "directory";
  name: string;
  files: Record<string, string>;
  folders: Record<string, MemoryFolder>;
  values(): AsyncGenerator<unknown>;
  getFileHandle(fileName: string, options?: { create?: boolean }): Promise<unknown>;
  getDirectoryHandle(child: string, options?: { create?: boolean }): Promise<MemoryFolder>;
  removeEntry(fileName: string): Promise<void>;
}

/** In-memory folder with the File System Access subset the app uses. */
function memoryFolder(name: string, files: Record<string, string> = {}): MemoryFolder {
  const fileHandle = (fileName: string) => ({
    kind: "file" as const,
    name: fileName,
    async getFile() { return { name: fileName, text: async () => files[fileName]! }; },
    async createWritable() {
      let text = "";
      return { async write(data: string) { text += data; }, async close() { files[fileName] = text; } };
    }
  });
  const folders: Record<string, MemoryFolder> = {};
  const folder = {
    kind: "directory" as const,
    name,
    files,
    folders,
    async *values() {
      for (const fileName of Object.keys(files)) yield fileHandle(fileName);
      for (const child of Object.values(folders)) yield child;
    },
    async getFileHandle(fileName: string, options?: { create?: boolean }) {
      if (!(fileName in files)) {
        if (!options?.create) throw notFound(fileName);
        files[fileName] = "";
      }
      return fileHandle(fileName);
    },
    async getDirectoryHandle(child: string, options?: { create?: boolean }) {
      if (!folders[child] && !options?.create) throw notFound(child);
      return (folders[child] ??= memoryFolder(child));
    },
    async removeEntry(fileName: string) {
      // Like the desktop fs_remove: files, and folders only when empty.
      const child = folders[fileName];
      if (child) {
        if (Object.keys(child.files).length || Object.keys(child.folders).length) throw new Error(`${fileName} is not empty`);
        delete folders[fileName];
        return;
      }
      if (!(fileName in files)) throw notFound(fileName);
      delete files[fileName];
    }
  };
  return folder;
}

function desktop(folders: Record<string, MemoryFolder>, confirm = vi.fn(() => true)) {
  const windowRef: ProfilePresetWindow = {
    getEasyLabelingProfileDirectory: async (kind) => folders[kind] as unknown as FileSystemDirectoryHandle,
    confirm
  };
  return { windowRef, confirm };
}

describe("profile preset folders", () => {
  it("names files after presets with the characters Windows rejects replaced", () => {
    expect(presetFileName("SEM fins")).toBe("SEM fins.json");
    expect(presetFileName(' a/b:c?"d* ')).toBe("a-b-c--d-.json");
    expect(presetFileName("ends with dots..")).toBe("ends with dots.json");
    expect(presetFileName("already.json")).toBe("already.json");
    expect(presetFileName("   ")).toBe("preset.json");
  });

  it("saves new presets in the chosen folder, creates folders, and moves files without replacing others", async () => {
    const folder = memoryFolder("Layouts", { "a.json": "A", "b.json": "B" });
    const store = new Map<string, string>();
    const { windowRef } = desktop({ layout: folder });
    windowRef.localStorage = { getItem: (key) => store.get(key) ?? null, setItem: (key, value) => void store.set(key, value) };
    const presets = (await openProfilePresetFolder(windowRef, "layout"))!;

    expect(presetFolderPath(' SEM\\ Metal: pattern / /..x. ')).toBe("SEM/Metal- pattern/x");
    await expect(presets.createFolder("SEM / Metal")).resolves.toBe("SEM/Metal");
    await expect(presets.createFolder(" / ")).rejects.toThrow("Enter a folder name");
    await presets.createFolder("TEM");
    expect(await presets.folders()).toEqual(["SEM", "SEM/Metal", "TEM"]);

    setPresetSaveFolder(windowRef, "layout", "SEM/Metal");
    expect(getPresetSaveFolder(windowRef, "layout")).toBe("SEM/Metal");
    await expect(presets.save("fine", "F")).resolves.toBe("SEM/Metal/fine.json");
    // A preset loaded from a file stays in it.
    await expect(presets.save("a", "A2", "a.json")).resolves.toBe("a.json");

    await expect(presets.move("a.json", "TEM")).resolves.toBe("TEM/a.json");
    expect(folder.files["a.json"]).toBeUndefined();
    expect(folder.folders.TEM!.files["a.json"]).toBe("A2");
    await expect(presets.move("TEM/a.json", "")).resolves.toBe("a.json");
    await presets.move("b.json", "TEM");
    folder.files["b.json"] = "other B";
    await expect(presets.move("TEM/b.json", "")).rejects.toThrow('"b.json" already exists in the top folder');
    expect(folder.folders.TEM!.files["b.json"]).toBe("B");
    await expect(presets.move("a.json", "")).resolves.toBe("a.json");
  });

  it("renames folders with their content and removes folders into .trash", async () => {
    const folder = memoryFolder("Refine Presets", { "top.json": "T" });
    const presets = (await openProfilePresetFolder(desktop({ refine: folder }).windowRef, "refine"))!;
    await presets.createFolder("SEM/Metal/Empty");
    await presets.save("fine", "F", "SEM/Metal/fine.json");
    await presets.save("cross", "C", "SEM/cross.json");
    await presets.createFolder("TEM");
    await presets.save("tem", "X", "TEM.json");

    await expect(presets.renameFolder("SEM", "TEM")).rejects.toThrow('"TEM" already exists there');
    await expect(presets.renameFolder("SEM", "tem")).rejects.toThrow("already exists");
    await expect(presets.renameFolder("SEM", "a/b")).rejects.toThrow('without "/"');
    await expect(presets.renameFolder("", "x")).rejects.toThrow("top folder cannot be renamed");
    await expect(presets.renameFolder("SEM", "Scanning")).resolves.toBe("Scanning");
    expect(await presets.folders()).toEqual(["Scanning", "Scanning/Metal", "Scanning/Metal/Empty", "TEM"]);
    expect((await presets.list()).map((file) => [file.fileName, file.contents])).toEqual([
      ["Scanning/cross.json", "C"], ["Scanning/Metal/fine.json", "F"], ["TEM.json", "X"], ["top.json", "T"]
    ]);
    await expect(presets.renameFolder("Scanning/Metal", "Metals")).resolves.toBe("Scanning/Metals");

    await expect(presets.removeFolder("")).rejects.toThrow("top folder cannot be removed");
    await expect(presets.removeFolder("Scanning")).resolves.toBe(2);
    expect(await presets.folders()).toEqual(["TEM"]);
    expect((await presets.list()).map((file) => file.fileName)).toEqual(["TEM.json", "top.json"]);
    const trash = folder.folders[".trash"]!;
    const stamp = Object.values(trash.folders)[0]!;
    expect(stamp.folders.Scanning!.files["cross.json"]).toBe("C");
    expect(stamp.folders.Scanning!.folders.Metals!.files["fine.json"]).toBe("F");
    await expect(presets.removeFolder("TEM")).resolves.toBe(0);
  });

  it("manages the Class Info folder's .yaml/.yml class files", async () => {
    const folder = memoryFolder("Class Info", { "classes.yaml": "0: a", "preset.json": "{}" });
    const classes = (await openProfilePresetFolder(desktop({ "class-info": folder }).windowRef, "class-info"))!;
    (await folder.getDirectoryHandle("SEM", { create: true })).files["fins.yml"] = "0: f";
    expect((await classes.list()).map((file) => file.fileName)).toEqual(["classes.yaml", "SEM/fins.yml"]);
    await expect(classes.move("classes.yaml", "SEM")).resolves.toBe("SEM/classes.yaml");
    await expect(classes.removeFolder("SEM")).resolves.toBe(2);
  });

  it("is absent in the web build", async () => {
    await expect(openProfilePresetFolder({}, "preprocessing")).resolves.toBeNull();
  });

  it("saves without a dialog, asks before replacing another file, and overwrites the file a preset came from", async () => {
    const folder = memoryFolder("Preprocessing Presets", { "Other.json": "old" });
    const { windowRef, confirm } = desktop({ preprocessing: folder }, vi.fn(() => false));
    const presets = (await openProfilePresetFolder(windowRef, "preprocessing"))!;

    await expect(presets.save("Fins 2", "fins")).resolves.toBe("Fins 2.json");
    expect(confirm).not.toHaveBeenCalled();
    // A new preset whose file name is taken: declined, nothing written.
    await expect(presets.save("Other", "new")).resolves.toBeNull();
    expect(confirm).toHaveBeenCalledOnce();
    expect(folder.files["Other.json"]).toBe("old");
    // The preset loaded from that file: overwritten without asking.
    await expect(presets.save("Other", "edited", "Other.json")).resolves.toBe("Other.json");
    expect(confirm).toHaveBeenCalledOnce();
    expect(folder.files["Other.json"]).toBe("edited");

    folder.files["notes.txt"] = "not a preset";
    folder.files["Fins 10.json"] = "ten";
    expect((await presets.list()).map((file) => file.fileName)).toEqual(["Fins 2.json", "Fins 10.json", "Other.json"]);
    await presets.remove("Fins 2.json");
    await presets.remove("Fins 2.json");
    expect(Object.keys(folder.files).sort()).toEqual(["Fins 10.json", "Other.json", "notes.txt"]);
  });

  it("lists, saves and removes presets in subfolders by their path, skipping the app's dot folders", async () => {
    const folder = memoryFolder("Refine Presets", { "top.json": "t" });
    const sem = await folder.getDirectoryHandle("SEM", { create: true });
    (await sem.getDirectoryHandle("Metal pattern", { create: true })).files["fine.json"] = "f";
    (await folder.getDirectoryHandle(".trash", { create: true })).files["old.json"] = "o";
    const presets = (await openProfilePresetFolder(desktop({ refine: folder }).windowRef, "refine"))!;

    expect((await presets.list()).map((file) => [file.fileName, file.contents])).toEqual([["SEM/Metal pattern/fine.json", "f"], ["top.json", "t"]]);
    expect(presetFolderOf("SEM/Metal pattern/fine.json")).toBe("SEM/Metal pattern");
    expect(presetFolderOf("top.json")).toBe("");
    await expect(presets.exists("SEM/Metal pattern/fine.json")).resolves.toBe(true);
    await expect(presets.exists("TEM/none.json")).resolves.toBe(false);
    await expect(presets.save("fine", "edited", "SEM/Metal pattern/fine.json")).resolves.toBe("SEM/Metal pattern/fine.json");
    expect(sem.folders["Metal pattern"]!.files["fine.json"]).toBe("edited");
    await presets.remove("SEM/Metal pattern/fine.json");
    expect(sem.folders["Metal pattern"]!.files).toEqual({});
    await expect(presets.save("x", "x", "../escape.json")).rejects.toThrow("Not a preset path");
    await expect(presets.save("x", "x", "SEM//x.json")).rejects.toThrow("Not a preset path");
  });

  it("lists profile preprocessing presets first, then the dataset's under other names", async () => {
    const config = (contrast: number) => ({ ...DEFAULT_SEGMENTATION_PREPROCESSING_CONFIG, contrast });
    const profileFolder = memoryFolder("Preprocessing Presets", {
      "a.json": serializePreprocessingPresets([{ name: "Shared", config: config(1.5) }]),
      "broken.json": "{"
    });
    const dataset = memoryFolder("images");
    const settings = await dataset.getDirectoryHandle(".easy-labeling", { create: true });
    settings.files["preprocessing-presets.json"] = serializePreprocessingPresets([{ name: "Shared", config: config(0.5) }, { name: "Old", config: config(2) }]);
    const profile = await openProfilePresetFolder(desktop({ preprocessing: profileFolder }).windowRef, "preprocessing");

    const { presets, errors } = await loadPreprocessingPresetLibrary(profile, dataset as never);
    expect(presets.map((preset) => [preset.name, preset.fileName, preset.config.contrast])).toEqual([["Shared", "a.json", 1.5], ["Old", null, 2]]);
    expect(errors).toEqual([expect.stringContaining("broken.json")]);
    // Web build: the dataset's presets only.
    expect((await loadPreprocessingPresetLibrary(null, dataset as never)).presets.map((preset) => preset.fileName)).toEqual([null, null]);
  });

  it("saves a Superpixel preset into the file holding its id, keeping the file's other presets", async () => {
    const preset = (id: string, name: string, regionSize = 16): SegmentationToolPreset => ({
      id, name, settings: { regionSize, blur: "medium", contrast: "medium", edgeSensitivity: "medium" }, smartSimilarity: 0.2, smartEdgeStop: 0.7, boundaryVisible: true
    });
    const document = (...presets: SegmentationToolPreset[]) => JSON.stringify({ schemaVersion: 1, presets });
    const folder = memoryFolder("Segmentation Presets", { "pair.json": document(preset("a", "A"), preset("b", "B")) });
    const profile = (await openProfilePresetFolder(desktop({ segmentation: folder }).windowRef, "segmentation"))!;

    await expect(saveSegmentationToolPresetFile(profile, preset("b", "B", 32))).resolves.toBe("pair.json");
    expect(JSON.parse(folder.files["pair.json"]!).presets.map((item: SegmentationToolPreset) => [item.id, item.settings.regionSize])).toEqual([["a", 16], ["b", 32]]);
    await expect(saveSegmentationToolPresetFile(profile, preset("c", "C"))).resolves.toBe("C.json");

    const dataset = memoryFolder("images");
    const settings = await dataset.getDirectoryHandle(".easy-labeling", { create: true });
    settings.files["segmentation-tool-presets.json"] = document(preset("a", "A old"), preset("d", "C"), preset("e", "E"));
    const { document: library } = await loadSegmentationToolPresetLibrary(profile, dataset as never);
    // Dataset presets whose id or name the profile already has are hidden.
    expect(library.presets.map((item) => item.id)).toEqual(["c", "a", "b", "e"]);
  });
});
