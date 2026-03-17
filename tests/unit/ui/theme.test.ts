import { describe, expect, it } from "vitest";

import { applyDarkMode, DARK_MODE_STORAGE_KEY, readStoredDarkMode } from "../../../src/ui/theme.js";
import { FakeDocument, FakeElement } from "./test-dom.js";

describe("ui/theme", () => {
  it("persists darkMode key and toggles body + label classes", () => {
    const fakeDocument = new FakeDocument();
    const showLabeled = fakeDocument.addElement(new FakeElement("label"));
    showLabeled.htmlFor = "showLabeled";
    showLabeled.className = "btn btn-outline-primary";
    const editMode = fakeDocument.addElement(new FakeElement("label"));
    editMode.htmlFor = "editMode";
    editMode.className = "btn btn-outline-primary";

    const writes: Array<[string, string]> = [];
    const storage = {
      setItem(key: string, value: string): void {
        writes.push([key, value]);
      },
      getItem(): string | null {
        return "enabled";
      }
    };

    applyDarkMode({
      enabled: true,
      bodyElement: fakeDocument.body as unknown as HTMLElement,
      documentRef: fakeDocument as unknown as Document,
      storage
    });

    expect(fakeDocument.body.classList.contains("dark-mode")).toBe(true);
    expect(showLabeled.classList.contains("btn-outline-secondary")).toBe(true);
    expect(editMode.classList.contains("btn-outline-secondary")).toBe(true);
    expect(writes).toEqual([[DARK_MODE_STORAGE_KEY, "enabled"]]);
    expect(readStoredDarkMode(storage)).toBe(true);
  });
});
