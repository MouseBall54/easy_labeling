// Named Preprocess panel configurations: one file each in the profile folder on the desktop app
// (features/presets/profile-presets.ts), else in the dataset's .easy-labeling folder.
import { getSubdirectoryHandle, isNotFoundError, readTextFileByName, writeTextFileByName } from "../../platform/file-system-access.js";
import type { DirectoryHandleLike } from "../../types/files.js";
import type { ProfilePresetFolder } from "../presets/profile-presets.js";
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

export interface StoredPreprocessingPreset extends PreprocessingPreset {
  /** Profile folder file it came from; null for one read from the dataset (web build, or saved by older versions). */
  fileName: string | null;
}

/**
 * Profile folder presets (desktop), then the dataset's own whose names the profile does not use. Without a
 * profile folder, only the dataset's. Unreadable profile files are reported, not fatal.
 */
export async function loadPreprocessingPresetLibrary(
  profile: ProfilePresetFolder | null,
  folder: DirectoryHandleLike | null
): Promise<{ presets: StoredPreprocessingPreset[]; errors: string[] }> {
  const dataset = (await loadPreprocessingPresets(folder)).map((preset) => ({ ...preset, fileName: null }));
  if (!profile) return { presets: dataset, errors: [] };
  const byName = new Map<string, StoredPreprocessingPreset>();
  const errors: string[] = [];
  for (const file of await profile.list()) {
    try {
      parsePreprocessingPresets(file.contents).forEach((preset) => byName.set(preset.name, { ...preset, fileName: file.fileName }));
    } catch (error: unknown) {
      errors.push(`${file.fileName}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  dataset.forEach((preset) => { if (!byName.has(preset.name)) byName.set(preset.name, preset); });
  return { presets: [...byName.values()], errors };
}
