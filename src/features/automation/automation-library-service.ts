import {
  getSubdirectoryHandle,
  isNotFoundError,
  readTextFileByName,
  writeTextFileByName
} from "../../platform/file-system-access.js";
import type { DirectoryHandleLike } from "../../types/files.js";
import { parseAutomationLibrary, serializeAutomationLibrary, validateAutomationLibrary } from "./preset-codec.js";
import { validateBoxLayout } from "./layout.js";
import { AUTOMATION_SCHEMA_VERSION, type AutomationLibraryDocument, type BoxLayout } from "./types.js";

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

export interface AutomationProfileFile {
  name: string;
  contents: string;
}

export interface AutomationProfileLoadResult {
  document: AutomationLibraryDocument;
  errors: string[];
}

export function loadAutomationProfileFiles(
  layoutFiles: readonly AutomationProfileFile[],
  presetFiles: readonly AutomationProfileFile[]
): AutomationProfileLoadResult {
  let document = createEmptyAutomationLibrary();
  const errors: string[] = [];
  const sorted = (files: readonly AutomationProfileFile[]) => [...files]
    .sort((left, right) => left.name.localeCompare(right.name, undefined, { numeric: true, sensitivity: "base" }));

  sorted(layoutFiles).forEach((file) => {
    try {
      const layout = JSON.parse(file.contents) as BoxLayout;
      validateBoxLayout(layout);
      document = {
        ...document,
        layouts: upsertById(document.layouts, layout)
      };
    } catch (error: unknown) {
      errors.push(`${file.name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  sorted(presetFiles).forEach((file) => {
    try {
      document = mergePresetFileDocument(document, parseAutomationLibrary(file.contents));
    } catch (error: unknown) {
      errors.push(`${file.name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  return { document, errors };
}

export function mergeAutomationLibraries(
  base: AutomationLibraryDocument,
  overrides: AutomationLibraryDocument
): AutomationLibraryDocument {
  validateAutomationLibrary(base);
  validateAutomationLibrary(overrides);
  const merged: AutomationLibraryDocument = {
    schemaVersion: AUTOMATION_SCHEMA_VERSION,
    layouts: overrides.layouts.reduce((items, item) => upsertById(items, item), [...base.layouts]),
    templates: overrides.templates.reduce((items, item) => upsertById(items, item), [...base.templates]),
    presets: overrides.presets.reduce((items, item) => upsertById(items, item), [...base.presets])
  };
  validateAutomationLibrary(merged);
  return merged;
}

export function createDatasetAutomationLibrary(
  runtime: AutomationLibraryDocument,
  profile: AutomationLibraryDocument
): AutomationLibraryDocument {
  validateAutomationLibrary(runtime);
  validateAutomationLibrary(profile);
  const differsFromProfile = <T extends { id: string }>(item: T, profileItems: readonly T[]): boolean => {
    const profileItem = profileItems.find((candidate) => candidate.id === item.id);
    return !profileItem || JSON.stringify(profileItem) !== JSON.stringify(item);
  };

  const presets = runtime.presets.filter((preset) => differsFromProfile(preset, profile.presets));
  let layouts = runtime.layouts.filter((layout) => differsFromProfile(layout, profile.layouts));
  let templates = runtime.templates.filter((template) => differsFromProfile(template, profile.templates));
  presets.forEach((preset) => {
    const template = runtime.templates.find((candidate) => candidate.id === preset.templateId);
    const layout = preset.layoutId
      ? runtime.layouts.find((candidate) => candidate.id === preset.layoutId)
      : null;
    if (template) {
      templates = upsertById(templates, template);
    }
    if (layout) {
      layouts = upsertById(layouts, layout);
    }
  });

  const dataset: AutomationLibraryDocument = {
    schemaVersion: AUTOMATION_SCHEMA_VERSION,
    layouts,
    templates,
    presets
  };
  validateAutomationLibrary(dataset);
  return dataset;
}

export function resolveAutomationSelectionId(
  items: readonly { id: string }[],
  selectedId: string,
  selectFirst: boolean
): string {
  if (items.some((item) => item.id === selectedId)) {
    return selectedId;
  }
  return selectFirst ? items[0]?.id ?? "" : "";
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
