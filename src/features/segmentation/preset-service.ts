import { getSubdirectoryHandle, isNotFoundError, readTextFileByName, writeTextFileByName } from "../../platform/file-system-access.js";
import type { DirectoryHandleLike } from "../../types/files.js";
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
