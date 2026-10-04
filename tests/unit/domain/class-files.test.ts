import { describe, expect, it } from "vitest";

import {
  NEW_CLASS_FILE_SEED_CONTENT,
  hasCaseInsensitiveNameCollision,
  normalizeNewClassFileName,
  parseClassContent,
  parseClassContentForEditor,
  validateNewClassFileName,
  validateAndSerializeClassRows
} from "../../../src/domain/class-files.js";

describe("domain/class-files", () => {
  it("decodes quoted class names for matching and editing without removing literal inner quotes", () => {
    const names = ["class 0", 'cell "A": target', "C:\\cells", "# target", "세포"];
    const content = `names:\n${names.map((name, index) => `  ${index}: ${JSON.stringify(name)}`).join("\n")}\n5: 'cell''s name'\n6: \"\"`;
    expect([...parseClassContent(content).values()]).toEqual([...names, "cell's name"]);
    expect(parseClassContentForEditor(content).map((row) => row.name)).toEqual([...names, "cell's name"]);
  });

  it("repairs names serialized repeatedly by older inference runs for display, editing and saving", () => {
    for (const depth of [2, 3, 5]) {
      let encoded = 'class 0';
      for (let layer = 0; layer < depth; layer += 1) encoded = JSON.stringify(encoded);
      const content = `names:\n  0: ${encoded}\n`;
      expect(parseClassContent(content).get("0")).toBe("class 0");
      expect(parseClassContentForEditor(content)).toEqual([{ id: "0", name: "class 0" }]);
      expect(validateAndSerializeClassRows([{ id: "0", name: encoded }]).newContent).toBe("0: class 0");
    }
  });

  it("parses load content by ignoring comments/blanks and preserving additional colons", () => {
    const parsed = parseClassContent([
      "# comment",
      "",
      "0: person",
      "1: road:lane:solid",
      "garbage",
      "two: not-an-int",
      "2:"
    ].join("\n"));

    expect([...parsed.entries()]).toEqual([
      ["0", "person"],
      ["1", "road:lane:solid"]
    ]);
  });

  it("uses parseInt non-NaN acceptance for load path", () => {
    const parsed = parseClassContent(["01: leading-zero-accepted", "1x: mixed-accepted"].join("\n"));
    expect([...parsed.entries()]).toEqual([
      ["01", "leading-zero-accepted"],
      ["1x", "mixed-accepted"]
    ]);
  });

  it("parses editor rows and sorts numerically for display", () => {
    const rows = parseClassContentForEditor(["10: ten", "2: two", "1: one"].join("\n"));
    expect(rows).toEqual([
      { id: "1", name: "one" },
      { id: "2", name: "two" },
      { id: "10", name: "ten" }
    ]);
  });

  it("rejects non-canonical integer IDs in save validation", () => {
    const result = validateAndSerializeClassRows([
      { id: "1", name: "ok" },
      { id: "01", name: "leading-zero-invalid" }
    ]);

    expect(result.isValid).toBe(false);
    expect(result.invalidIdRows).toEqual([1]);
  });

  it("rejects duplicate IDs", () => {
    const result = validateAndSerializeClassRows([
      { id: "5", name: "a" },
      { id: "5", name: "b" }
    ]);

    expect(result.isValid).toBe(false);
    expect(result.duplicateIdRows).toEqual([1]);
  });

  it("rejects empty class names", () => {
    const result = validateAndSerializeClassRows([{ id: "3", name: "" }]);

    expect(result.isValid).toBe(false);
    expect(result.emptyNameRows).toEqual([0]);
  });

  it("ignores fully empty rows during save validation", () => {
    const result = validateAndSerializeClassRows([
      { id: "", name: "" },
      { id: "2", name: "two" }
    ]);

    expect(result.isValid).toBe(true);
    expect(result.newContent).toBe("2: two");
  });

  it("keeps legacy global isValid accumulation behavior", () => {
    const result = validateAndSerializeClassRows([
      { id: "1", name: "one" },
      { id: "01", name: "invalid" },
      { id: "2", name: "two" }
    ]);

    expect(result.isValid).toBe(false);
    expect(result.classData).toEqual([{ id: "1", name: "one" }]);
  });

  it("sorts numerically before save serialization without trailing newline", () => {
    const result = validateAndSerializeClassRows([
      { id: "10", name: "ten" },
      { id: "2", name: "two" },
      { id: "1", name: "one" }
    ]);

    expect(result.isValid).toBe(true);
    expect(result.newContent).toBe("1: one\n2: two\n10: ten");
  });

  it("normalizes new class file name by appending .yaml unless already .yaml/.yml", () => {
    expect(normalizeNewClassFileName("custom-classes")).toBe("custom-classes.yaml");
    expect(normalizeNewClassFileName("name.yml")).toBe("name.yml");
    expect(normalizeNewClassFileName("name.YAML")).toBe("name.YAML");
  });

  it("detects case-insensitive file-name collisions", () => {
    const candidate = normalizeNewClassFileName("My-Classes");
    const hasCollision = hasCaseInsensitiveNameCollision(["my-classes.yaml", "other.yaml"], candidate);
    expect(hasCollision).toBe(true);
  });

  it("validates and normalizes user-provided class file names", () => {
    expect(validateNewClassFileName("  custom classes  ")).toBe("custom classes.yaml");
    expect(validateNewClassFileName("labels.yml")).toBe("labels.yml");
  });

  it("rejects empty, invalid, reserved, and duplicate class file names", () => {
    expect(() => validateNewClassFileName(" ")).toThrow("Enter a file name");
    expect(() => validateNewClassFileName("bad/name")).toThrow("unsupported characters");
    expect(() => validateNewClassFileName("CON")).toThrow("reserved");
    expect(() => validateNewClassFileName("Classes", ["classes.yaml"])).toThrow("already exists");
  });

  it("exports the exact legacy new-file seed content", () => {
    expect(NEW_CLASS_FILE_SEED_CONTENT).toBe("# YAML Class file. Format: id: name\n0: class1\n1: class2");
  });
});
