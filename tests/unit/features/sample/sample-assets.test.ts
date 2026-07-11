import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { parseAutomationLibrary } from "../../../../src/features/automation/preset-codec.js";

const sampleRoot = path.resolve("assets", "sample");

describe("bundled sample assets", () => {
  it("contains the complete manifest, 203 valid YOLO boxes, and five color classes", async () => {
    const manifest = JSON.parse(await readFile(path.join(sampleRoot, "manifest.json"), "utf8")) as {
      name: string;
      files: string[];
    };
    expect(manifest.name).toBe("Easy Labeling Sample Test");
    expect(manifest.files).toContain(".easy-labeling/automation-library.json");
    await Promise.all(manifest.files.map((relativePath) => expect(readFile(path.join(sampleRoot, relativePath))).resolves.toBeInstanceOf(Buffer)));

    const expectedCounts = new Map([
      ["sample_1.txt", 52],
      ["sample_2.txt", 92],
      ["sample_3.txt", 59]
    ]);
    const seenClasses = new Set<string>();
    let total = 0;
    for (const [fileName, expectedCount] of expectedCounts) {
      const rows = (await readFile(path.join(sampleRoot, "label", fileName), "utf8")).trim().split("\n");
      expect(rows).toHaveLength(expectedCount);
      total += rows.length;
      rows.forEach((row) => {
        const [classId, ...values] = row.trim().split(/\s+/);
        expect(["0", "1", "2", "3", "4"]).toContain(classId);
        expect(values).toHaveLength(4);
        expect(values.map(Number).every((value) => Number.isFinite(value) && value > 0 && value <= 1)).toBe(true);
        seenClasses.add(classId ?? "");
      });
    }
    expect(total).toBe(203);
    expect([...seenClasses].sort()).toEqual(["0", "1", "2", "3", "4"]);

    const classes = await readFile(path.join(sampleRoot, "label", "classes.yaml"), "utf8");
    expect(classes).toContain("0: Light / White");
    expect(classes).toContain("4: Green / Yellow");
  });

  it("contains a valid layout, template assets, and both automation output modes", async () => {
    const json = await readFile(path.join(sampleRoot, ".easy-labeling", "automation-library.json"), "utf8");
    const library = parseAutomationLibrary(json);

    expect(library.layouts).toHaveLength(1);
    expect(library.layouts[0]?.boxes).toHaveLength(4);
    expect(library.templates).toHaveLength(2);
    expect(library.presets.map((preset) => preset.outputMode).sort()).toEqual([
      "layout-best-match",
      "multiple-detection-boxes"
    ]);
    expect(library.presets.every((preset) => preset.matching.searchRoi === null)).toBe(true);

    const templateFiles = new Map([
      ["sample-pink-anchor-template", "pink-anchor.png"],
      ["sample-pink-vehicle-template", "pink-vehicle.png"]
    ]);
    for (const template of library.templates) {
      const fileName = templateFiles.get(template.id);
      expect(fileName).toBeTruthy();
      const png = await readFile(path.join(sampleRoot, "templates", fileName ?? ""));
      expect(template.pngDataUrl).toBe(`data:image/png;base64,${png.toString("base64")}`);
    }
  });
});
