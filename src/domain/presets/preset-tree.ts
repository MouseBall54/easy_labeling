// Rows of the preset picker (src/ui/preset-picker.ts): presets grouped by their profile subfolder, with the
// picker's favourites and recent choices on top, or a flat filtered list while searching. DOM-free.

export interface PresetEntry {
  value: string;
  label: string;
  /** "/"-separated subfolder path; "" at the top. */
  folder: string;
  title?: string;
  /** An action or built-in choice kept first in every view, like value "". */
  pinned?: boolean;
}

export type PresetRow =
  | { kind: "heading"; label: string }
  | { kind: "folder"; path: string; label: string; depth: number; expanded: boolean }
  | { kind: "preset"; entry: PresetEntry; depth: number; favorite: boolean; showFolder: boolean };

export interface PresetTreeState {
  query: string;
  /** Folder paths shown open. */
  expanded: ReadonlySet<string>;
  favorites: readonly string[];
  recent: readonly string[];
}

const naturalCompare = (left: string, right: string): number =>
  left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" });

/**
 * `special` entries (value "" or pinned: the placeholder, the built-in choice or an action) stay first in every view. Presets
 * whose value repeats keep the first one.
 */
export function buildPresetRows(entries: readonly PresetEntry[], state: PresetTreeState): PresetRow[] {
  const isSpecial = (entry: PresetEntry): boolean => entry.value === "" || entry.pinned === true;
  const special = entries.filter(isSpecial);
  const presets = dedupe(entries.filter((entry) => !isSpecial(entry)));
  const favorites = new Set(state.favorites);
  const presetRow = (entry: PresetEntry, depth: number, showFolder: boolean): PresetRow =>
    ({ kind: "preset", entry, depth, favorite: !isSpecial(entry) && favorites.has(entry.value), showFolder });
  const rows: PresetRow[] = special.map((entry) => presetRow(entry, 0, false));

  const query = state.query.trim().toLowerCase();
  if (query) {
    return rows.concat(presets
      .filter((entry) => `${entry.folder}/${entry.label}`.toLowerCase().includes(query))
      .map((entry) => presetRow(entry, 0, true)));
  }

  const byValue = new Map(presets.map((entry) => [entry.value, entry]));
  const pinned = (values: readonly string[]) => values.flatMap((value) => byValue.get(value) ?? []);
  const favoriteEntries = pinned(state.favorites);
  if (favoriteEntries.length) rows.push({ kind: "heading", label: "Favorites" }, ...favoriteEntries.map((entry) => presetRow(entry, 0, true)));
  const recentEntries = pinned(state.recent).filter((entry) => !favorites.has(entry.value));
  if (recentEntries.length) rows.push({ kind: "heading", label: "Recent" }, ...recentEntries.map((entry) => presetRow(entry, 0, true)));
  if ((favoriteEntries.length || recentEntries.length) && presets.length) rows.push({ kind: "heading", label: "All" });

  appendFolder(rows, presets, "", 0, state.expanded, presetRow);
  return rows;
}

function appendFolder(
  rows: PresetRow[],
  presets: readonly PresetEntry[],
  path: string,
  depth: number,
  expanded: ReadonlySet<string>,
  presetRow: (entry: PresetEntry, depth: number, showFolder: boolean) => PresetRow
): void {
  const children = new Set<string>();
  for (const entry of presets) {
    if (path && entry.folder !== path && !entry.folder.startsWith(`${path}/`)) continue;
    const rest = path ? entry.folder.slice(path.length + 1) : entry.folder;
    if (rest) children.add(rest.split("/")[0]!);
  }
  for (const child of [...children].sort(naturalCompare)) {
    const childPath = path ? `${path}/${child}` : child;
    const open = expanded.has(childPath);
    rows.push({ kind: "folder", path: childPath, label: child, depth, expanded: open });
    if (open) appendFolder(rows, presets, childPath, depth + 1, expanded, presetRow);
  }
  presets.filter((entry) => entry.folder === path)
    .sort((left, right) => naturalCompare(left.label, right.label))
    .forEach((entry) => rows.push(presetRow(entry, depth, false)));
}

/** Every folder on the way to `folder` ("a/b" -> "a", "a/b"), so the chosen preset shows when the picker opens. */
export function folderAncestors(folder: string): string[] {
  if (!folder) return [];
  const parts = folder.split("/");
  return parts.map((_, index) => parts.slice(0, index + 1).join("/"));
}

/** Most recent first, without repeats, at most `limit`. */
export function pushRecent(recent: readonly string[], value: string, limit = 5): string[] {
  return [value, ...recent.filter((item) => item !== value)].slice(0, limit);
}

function dedupe(entries: readonly PresetEntry[]): PresetEntry[] {
  const seen = new Set<string>();
  return entries.filter((entry) => !seen.has(entry.value) && Boolean(seen.add(entry.value)));
}
