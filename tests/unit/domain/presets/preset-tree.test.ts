import { describe, expect, it } from "vitest";

import { buildPresetRows, folderAncestors, pushRecent, type PresetEntry, type PresetRow } from "../../../../src/domain/presets/preset-tree.js";

const entry = (value: string, folder = ""): PresetEntry => ({ value, label: value, folder });
const entries = [entry("", ""), entry("top"), entry("fine", "SEM/Metal"), entry("coarse", "SEM/Metal"), entry("cross", "SEM"), entry("p10", "TEM"), entry("p2", "TEM")];
const show = (rows: PresetRow[]) => rows.map((row) => row.kind === "heading" ? `# ${row.label}`
  : row.kind === "folder" ? `${"  ".repeat(row.depth)}${row.expanded ? "v" : ">"} ${row.label}`
    : `${"  ".repeat(row.depth)}${row.entry.label || "(none)"}${row.favorite ? " *" : ""}${row.showFolder && row.entry.folder ? ` [${row.entry.folder}]` : ""}`);

describe("preset picker rows", () => {
  it("nests presets under their folders, folders first, natural order, closed folders hiding their content", () => {
    const state = { query: "", expanded: new Set(["SEM", "SEM/Metal", "TEM"]), favorites: [], recent: [] };
    expect(show(buildPresetRows(entries, state))).toEqual([
      "(none)", "v SEM", "  v Metal", "    coarse", "    fine", "  cross", "v TEM", "  p2", "  p10", "top"
    ]);
    expect(show(buildPresetRows(entries, { ...state, expanded: new Set(["SEM/Metal"]) }))).toEqual(["(none)", "> SEM", "> TEM", "top"]);
  });

  it("puts favourites and recent choices first, and searches names and folders as a flat list", () => {
    const state = { query: "", expanded: new Set<string>(), favorites: ["fine", "gone"], recent: ["p2", "fine"] };
    expect(show(buildPresetRows(entries, state))).toEqual([
      "(none)", "# Favorites", "fine * [SEM/Metal]", "# Recent", "p2 [TEM]", "# All", "> SEM", "> TEM", "top"
    ]);
    expect(show(buildPresetRows(entries, { ...state, query: "metal" }))).toEqual(["(none)", "fine * [SEM/Metal]", "coarse [SEM/Metal]"]);
    expect(show(buildPresetRows(entries, { ...state, query: " P1 " }))).toEqual(["(none)", "p10 [TEM]"]);
  });

  it("keeps pinned actions first in every view, out of favourites and search filtering", () => {
    const withAction = [{ value: "new", label: "Create new", folder: "", pinned: true }, entry("top"), entry("fine", "SEM")];
    const state = { query: "", expanded: new Set<string>(), favorites: ["new", "top"], recent: ["new"] };
    expect(show(buildPresetRows(withAction, state))).toEqual(["Create new", "# Favorites", "top *", "# All", "> SEM", "top *"]);
    expect(show(buildPresetRows(withAction, { ...state, query: "fine" }))).toEqual(["Create new", "fine [SEM]"]);
  });

  it("opens the folders on the way to a preset and keeps recent choices short and unique", () => {
    expect(folderAncestors("a/b/c")).toEqual(["a", "a/b", "a/b/c"]);
    expect(folderAncestors("")).toEqual([]);
    expect(pushRecent(["a", "b", "c"], "b")).toEqual(["b", "a", "c"]);
    expect(pushRecent(["1", "2", "3", "4", "5"], "6")).toEqual(["6", "1", "2", "3", "4"]);
  });
});
