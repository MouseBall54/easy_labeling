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
