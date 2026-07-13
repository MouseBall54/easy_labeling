import {
  getSubdirectoryHandle,
  isNotFoundError,
  readTextFileByName,
  writeTextFileByName
} from "../../platform/file-system-access.js";
import type { DirectoryHandleLike } from "../../types/files.js";
import { parseAutomationLibrary, serializeAutomationLibrary, validateAutomationLibrary } from "./preset-codec.js";
import { AUTOMATION_SCHEMA_VERSION, type AutomationLibraryDocument } from "./types.js";

export const AUTOMATION_DIRECTORY_NAME = ".easy-labeling";
export const AUTOMATION_LIBRARY_FILE_NAME = "automation-library.json";

export function createEmptyAutomationLibrary(): AutomationLibraryDocument {
  return {
    schemaVersion: AUTOMATION_SCHEMA_VERSION,
    layouts: [],
    templates: [],
    presets: []
  };
}

export function createPresetFileDocument(
  document: AutomationLibraryDocument,
  presetId: string
): AutomationLibraryDocument {
  validateAutomationLibrary(document);
  const preset = document.presets.find((candidate) => candidate.id === presetId);
  if (!preset) {
    throw new Error("Choose a preset to save");
  }
  const template = document.templates.find((candidate) => candidate.id === preset.templateId);
  const layout = preset.layoutId
    ? document.layouts.find((candidate) => candidate.id === preset.layoutId)
    : null;
  if (!template || (preset.layoutId && !layout)) {
    throw new Error("The preset references a missing template or layout");
  }

  const presetFile: AutomationLibraryDocument = {
    schemaVersion: AUTOMATION_SCHEMA_VERSION,
    layouts: layout ? [layout] : [],
    templates: [template],
    presets: [preset]
  };
  validateAutomationLibrary(presetFile);
  return presetFile;
}

export function mergePresetFileDocument(
  document: AutomationLibraryDocument,
  presetFile: AutomationLibraryDocument
): AutomationLibraryDocument {
  validateAutomationLibrary(document);
  validateAutomationLibrary(presetFile);
  if (presetFile.presets.length !== 1) {
    throw new Error("A preset file must contain exactly one preset");
  }

  const preset = presetFile.presets[0];
  const template = presetFile.templates.find((candidate) => candidate.id === preset.templateId);
  const layout = preset.layoutId
    ? presetFile.layouts.find((candidate) => candidate.id === preset.layoutId)
    : null;
  if (!template || (preset.layoutId && !layout)) {
    throw new Error("The preset file is missing its template or layout");
  }

  const merged: AutomationLibraryDocument = {
    ...document,
    layouts: layout ? upsertById(document.layouts, layout) : document.layouts,
    templates: upsertById(document.templates, template),
    presets: upsertById(document.presets, preset)
  };
  validateAutomationLibrary(merged);
  return merged;
}

export async function loadAutomationLibrary(imageFolderHandle: DirectoryHandleLike): Promise<AutomationLibraryDocument> {
  try {
    const directory = await getSubdirectoryHandle(imageFolderHandle, AUTOMATION_DIRECTORY_NAME);
    return parseAutomationLibrary(await readTextFileByName(directory, AUTOMATION_LIBRARY_FILE_NAME));
  } catch (error: unknown) {
    if (isNotFoundError(error)) {
      return createEmptyAutomationLibrary();
    }
    throw error;
  }
}

export async function saveAutomationLibrary(
  imageFolderHandle: DirectoryHandleLike,
  document: AutomationLibraryDocument
): Promise<void> {
  validateAutomationLibrary(document);
  const directory = await getSubdirectoryHandle(imageFolderHandle, AUTOMATION_DIRECTORY_NAME, { create: true });
  await writeTextFileByName(directory, AUTOMATION_LIBRARY_FILE_NAME, serializeAutomationLibrary(document));
}

export function upsertById<T extends { id: string }>(items: readonly T[], next: T): T[] {
  const existingIndex = items.findIndex((item) => item.id === next.id);
  if (existingIndex < 0) {
    return [...items, next];
  }
  return items.map((item, index) => index === existingIndex ? next : item);
}

export function deleteLayoutFromLibrary(document: AutomationLibraryDocument, layoutId: string): AutomationLibraryDocument {
  return {
    ...document,
    layouts: document.layouts.filter((layout) => layout.id !== layoutId),
    presets: document.presets.filter((preset) => preset.layoutId !== layoutId)
  };
}

export function deleteTemplateFromLibrary(document: AutomationLibraryDocument, templateId: string): AutomationLibraryDocument {
  return {
    ...document,
    templates: document.templates.filter((template) => template.id !== templateId),
    presets: document.presets.filter((preset) => preset.templateId !== templateId)
  };
}
