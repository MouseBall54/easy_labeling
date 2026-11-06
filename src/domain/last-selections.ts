/**
 * The last item chosen in each selector (class file, presets), per dataset folder and overall.
 * A folder opened before gets its own last choice back; a folder opened for the first time gets the latest
 * choice made in any folder. Items are matched by their shown name, so a preset with the same name in another
 * folder (or in the profile folder) counts as the same choice.
 */
export interface LastSelections {
  last: Record<string, string>;
  folders: Record<string, Record<string, string>>;
}

/** Folders remembered; the least recently used drop out beyond this. */
export const LAST_SELECTIONS_FOLDER_LIMIT = 100;

export const emptyLastSelections = (): LastSelections => ({ last: {}, folders: {} });

const isNameMap = (value: unknown): value is Record<string, string> =>
  typeof value === "object" && value !== null && Object.values(value).every((item) => typeof item === "string");

export function parseLastSelections(text: string | null): LastSelections {
  try {
    const parsed = JSON.parse(text ?? "") as { last?: unknown; folders?: unknown } | null;
    const folders = typeof parsed?.folders === "object" && parsed.folders !== null ? parsed.folders as Record<string, unknown> : {};
    return {
      last: isNameMap(parsed?.last) ? { ...parsed.last } : {},
      folders: Object.fromEntries(Object.entries(folders).filter((entry): entry is [string, Record<string, string>] => isNameMap(entry[1])))
    };
  } catch {
    return emptyLastSelections();
  }
}

/** The folder's own last choice for this selector, else the latest choice in any folder. */
export function recallSelection(store: LastSelections, folder: string, kind: string): string | undefined {
  return store.folders[folder]?.[kind] ?? store.last[kind];
}

export function rememberSelection(store: LastSelections, folder: string, kind: string, name: string): LastSelections {
  const { [folder]: own, ...others } = store.folders;
  // Re-inserted last, so object order is least to most recently used.
  const folders = { ...others, [folder]: { ...own, [kind]: name } };
  const keys = Object.keys(folders);
  for (const key of keys.slice(0, Math.max(0, keys.length - LAST_SELECTIONS_FOLDER_LIMIT))) delete folders[key];
  return { last: { ...store.last, [kind]: name }, folders };
}
