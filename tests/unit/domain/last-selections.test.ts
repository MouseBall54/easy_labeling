import { describe, expect, it } from "vitest";
import {
  emptyLastSelections,
  LAST_SELECTIONS_FOLDER_LIMIT,
  parseLastSelections,
  recallSelection,
  rememberSelection
} from "../../../src/domain/last-selections.js";

describe("domain/last-selections", () => {
  it("gives a new folder the latest choice and a known folder its own", () => {
    let store = rememberSelection(emptyLastSelections(), "A", "classFile", "fins.yaml");
    expect(recallSelection(store, "B", "classFile")).toBe("fins.yaml");
    store = rememberSelection(store, "B", "classFile", "pads.yaml");
    expect(recallSelection(store, "A", "classFile")).toBe("fins.yaml");
    expect(recallSelection(store, "B", "classFile")).toBe("pads.yaml");
    expect(recallSelection(store, "C", "classFile")).toBe("pads.yaml");
    // A selector the folder never set falls back to the latest choice.
    store = rememberSelection(store, "C", "preprocessPreset", "Denoise");
    expect(recallSelection(store, "A", "preprocessPreset")).toBe("Denoise");
    expect(recallSelection(store, "A", "boxLayout")).toBeUndefined();
  });

  it("round-trips through JSON, survives bad input and keeps the most recent folders", () => {
    const store = rememberSelection(emptyLastSelections(), "A", "classFile", "fins.yaml");
    expect(parseLastSelections(JSON.stringify(store))).toEqual(store);
    expect(parseLastSelections(null)).toEqual(emptyLastSelections());
    expect(parseLastSelections("{oops")).toEqual(emptyLastSelections());
    expect(parseLastSelections(JSON.stringify({ last: { a: 1 }, folders: { A: { x: "y" }, B: 3 } }))).toEqual({ last: {}, folders: { A: { x: "y" } } });

    let many = emptyLastSelections();
    for (let i = 0; i <= LAST_SELECTIONS_FOLDER_LIMIT; i += 1) many = rememberSelection(many, `F${i}`, "classFile", `${i}`);
    many = rememberSelection(many, "F1", "classFile", "again");
    expect(Object.keys(many.folders)).toHaveLength(LAST_SELECTIONS_FOLDER_LIMIT);
    expect(many.folders.F0).toBeUndefined();
    expect(Object.keys(many.folders).at(-1)).toBe("F1");
  });
});
