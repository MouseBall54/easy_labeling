import { describe, expect, it, vi } from "vitest";

import { openProfilePresetFolder, presetFileName, type ProfilePresetWindow } from "../../../../src/features/presets/profile-presets.js";
import { loadPreprocessingPresetLibrary, serializePreprocessingPresets } from "../../../../src/features/segmentation/preprocessing-presets.js";
import { loadSegmentationToolPresetLibrary, saveSegmentationToolPresetFile } from "../../../../src/features/segmentation/preset-service.js";
import { DEFAULT_SEGMENTATION_PREPROCESSING_CONFIG } from "../../../../src/features/segmentation/preprocessing.js";
import type { SegmentationToolPreset } from "../../../../src/features/segmentation/types.js";

const notFound = (name: string) => Object.assign(new Error(`${name} not found`), { name: "NotFoundError" });

/** In-memory folder with the File System Access subset the app uses. */
function memoryFolder(name: string, files: Record<string, string> = {}) {
  const fileHandle = (fileName: string) => ({
    kind: "file" as const,
    name: fileName,
    async getFile() { return { name: fileName, text: async () => files[fileName]! }; },
    async createWritable() {
      let text = "";
      return { async write(data: string) { text += data; }, async close() { files[fileName] = text; } };
    }
  });
  const folders: Record<string, ReturnType<typeof memoryFolder>> = {};
  const folder = {
    kind: "directory" as const,
    name,
    files,
    async *values() { for (const fileName of Object.keys(files)) yield fileHandle(fileName); },
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
      if (!(fileName in files)) throw notFound(fileName);
      delete files[fileName];
    }
  };
  return folder;
}

function desktop(folders: Record<string, ReturnType<typeof memoryFolder>>, confirm = vi.fn(() => true)) {
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
