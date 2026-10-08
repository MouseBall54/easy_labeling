// Named Preprocess panel configurations, stored with the dataset next to the other .easy-labeling files.
import { getSubdirectoryHandle, isNotFoundError, readTextFileByName, writeTextFileByName } from "../../platform/file-system-access.js";
import type { DirectoryHandleLike } from "../../types/files.js";
import { normalizeSegmentationPreprocessingConfig, type SegmentationPreprocessingConfig } from "./preprocessing.js";

export const PREPROCESSING_PRESET_FILE = "preprocessing-presets.json";

export interface PreprocessingPreset {
  name: string;
  config: SegmentationPreprocessingConfig;
}

export function parsePreprocessingPresets(text: string): PreprocessingPreset[] {
  const parsed = JSON.parse(text) as { presets?: unknown };
  const byName = new Map<string, PreprocessingPreset>();
  for (const item of Array.isArray(parsed?.presets) ? parsed.presets : []) {
    const name = typeof item?.name === "string" ? item.name.trim() : "";
    if (name) byName.set(name, { name, config: normalizeSegmentationPreprocessingConfig(item.config) });
  }
  return [...byName.values()];
}

export function serializePreprocessingPresets(presets: readonly PreprocessingPreset[]): string {
  return `${JSON.stringify({ schemaVersion: 1, presets }, null, 2)}\n`;
}

/** Adds the preset, replacing one with the same name. */
export function upsertPreprocessingPreset(presets: readonly PreprocessingPreset[], name: string, config: Partial<SegmentationPreprocessingConfig>): PreprocessingPreset[] {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Preset name is required");
  const preset = { name: trimmed, config: normalizeSegmentationPreprocessingConfig(config) };
  return presets.some((item) => item.name === trimmed)
    ? presets.map((item) => (item.name === trimmed ? preset : item))
    : [...presets, preset];
}

export async function loadPreprocessingPresets(folder: DirectoryHandleLike | null): Promise<PreprocessingPreset[]> {
  if (!folder) return [];
  try {
    const directory = await getSubdirectoryHandle(folder, ".easy-labeling");
    return parsePreprocessingPresets(await readTextFileByName(directory, PREPROCESSING_PRESET_FILE));
  } catch (error: unknown) {
    if (isNotFoundError(error)) return [];
    throw error;
  }
}

export async function savePreprocessingPresets(folder: DirectoryHandleLike, presets: readonly PreprocessingPreset[]): Promise<void> {
  const directory = await getSubdirectoryHandle(folder, ".easy-labeling", { create: true });
  await writeTextFileByName(directory, PREPROCESSING_PRESET_FILE, serializePreprocessingPresets(presets));
}
