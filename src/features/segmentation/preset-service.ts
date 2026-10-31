import { getSubdirectoryHandle, isNotFoundError, readTextFileByName, writeTextFileByName } from "../../platform/file-system-access.js";
import type { DirectoryHandleLike } from "../../types/files.js";
import type { ProfilePresetFolder } from "../presets/profile-presets.js";
import type { SegmentationToolPreset } from "./types.js";
import { createEmptySegmentationToolPresetDocument, parseSegmentationToolPresetDocument, serializeSegmentationToolPresetDocument, type SegmentationToolPresetDocument } from "./preset-codec.js";

export const SEGMENTATION_TOOL_PRESET_DIRECTORY = ".easy-labeling";
export const SEGMENTATION_TOOL_PRESET_FILE = "segmentation-tool-presets.json";

export async function loadSegmentationToolPresets(folder: DirectoryHandleLike): Promise<SegmentationToolPresetDocument> {
  try {
    const directory = await getSubdirectoryHandle(folder, SEGMENTATION_TOOL_PRESET_DIRECTORY);
    return parseSegmentationToolPresetDocument(await readTextFileByName(directory, SEGMENTATION_TOOL_PRESET_FILE));
  } catch (error: unknown) {
    if (isNotFoundError(error) || (error instanceof Error && /not found/i.test(error.message))) return createEmptySegmentationToolPresetDocument();
    throw error;
  }
}

export async function saveSegmentationToolPresets(folder: DirectoryHandleLike, document: SegmentationToolPresetDocument): Promise<void> {
  const directory = await getSubdirectoryHandle(folder, SEGMENTATION_TOOL_PRESET_DIRECTORY, { create: true });
  await writeTextFileByName(directory, SEGMENTATION_TOOL_PRESET_FILE, serializeSegmentationToolPresetDocument(document));
}

/**
 * Profile folder presets (desktop, one document file each), then the dataset's own whose ids and names the
 * profile does not use. Without a profile folder, only the dataset's. Unreadable profile files are reported.
 */
export async function loadSegmentationToolPresetLibrary(
  profile: ProfilePresetFolder | null,
  folder: DirectoryHandleLike | null
): Promise<{ document: SegmentationToolPresetDocument; errors: string[] }> {
  const dataset = folder ? await loadSegmentationToolPresets(folder) : createEmptySegmentationToolPresetDocument();
  if (!profile) return { document: dataset, errors: [] };
  const document = createEmptySegmentationToolPresetDocument();
  const errors: string[] = [];
  for (const file of await profile.list()) {
    try {
      parseSegmentationToolPresetDocument(file.contents).presets.forEach((preset) => {
        if (!document.presets.some((existing) => existing.id === preset.id)) document.presets.push(preset);
      });
    } catch (error: unknown) {
      errors.push(`${file.fileName}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  dataset.presets.forEach((preset) => {
    if (!document.presets.some((existing) => existing.id === preset.id || existing.name === preset.name)) document.presets.push(preset);
  });
  return { document, errors };
}

/**
 * Desktop: writes the preset to its profile file (the one holding its id, keeping any other presets in it),
 * else to `<name>.json`.
 */
export async function saveSegmentationToolPresetFile(profile: ProfilePresetFolder, preset: SegmentationToolPreset): Promise<string | null> {
  for (const file of await profile.list()) {
    let presets: SegmentationToolPreset[];
    try { presets = parseSegmentationToolPresetDocument(file.contents).presets; }
    catch { continue; }
    if (!presets.some((item) => item.id === preset.id)) continue;
    const document = { ...createEmptySegmentationToolPresetDocument(), presets: presets.map((item) => (item.id === preset.id ? preset : item)) };
    return profile.save(preset.name, serializeSegmentationToolPresetDocument(document), file.fileName);
  }
  return profile.save(preset.name, serializeSegmentationToolPresetDocument({ ...createEmptySegmentationToolPresetDocument(), presets: [preset] }));
}
