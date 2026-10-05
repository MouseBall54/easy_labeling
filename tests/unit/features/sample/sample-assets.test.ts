import { createHash } from "node:crypto";
import { decodeSegmentationMaskPng } from "../../../../src/domain/annotations/segmentation-codec.js";

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { parseAutomationLibrary } from "../../../../src/features/automation/preset-codec.js";

const sampleRoot = path.resolve("assets", "sample");

describe("bundled sample assets", () => {
  it("contains all 17 images with independent names, consistent boxes/masks, and unchanged source pixels", async () => {
    const manifest = JSON.parse(await readFile(path.join(sampleRoot, "manifest.json"), "utf8")) as { name: string; files: string[] };
    const annotations = JSON.parse(await readFile(path.join(sampleRoot, "annotations.json"), "utf8")) as {
      classes: Record<string, string>;
      images: { file: string; sha256: string; width: number; height: number;
        objects: { classId: number; box: number[]; runs: number[] }[] }[];
    };
    expect(manifest.name).toBe("Easy Labeling Sample Test");
    expect(manifest.files).toContain(".easy-labeling/automation-library.json");
    const imageFiles = (await readdir(sampleRoot)).filter((name) => /\.(jpe?g|png)$/i.test(name));
    expect(imageFiles).toHaveLength(17);
    expect(new Set(imageFiles.map((name) => path.parse(name).name)).size).toBe(17);
    expect(manifest.files).toEqual(expect.arrayContaining(imageFiles));
    await Promise.all(manifest.files.map((file) => expect(readFile(path.join(sampleRoot, file))).resolves.toBeInstanceOf(Buffer)));
    const expectedCounts = [207, 100, 157, 8, 4, 3, 285, 289, 918, 1, 1, 1, 24, 39, 105, 273, 9];
    expect(annotations.images.map((image) => image.objects.length)).toEqual(expectedCounts);
    expect(expectedCounts.reduce((sum, value) => sum + value, 0)).toBe(2424);
    const seenClasses = new Set<number>();
    for (const image of annotations.images) {
      expect(createHash("sha256").update(await readFile(path.join(sampleRoot, image.file))).digest("hex")).toBe(image.sha256);
      const stem = path.parse(image.file).name;
      const rows = (await readFile(path.join(sampleRoot, "label", `${stem}.txt`), "utf8")).trim().split("\n");
      expect(rows).toHaveLength(image.objects.length);
      const decoded = await decodeSegmentationMaskPng(await readFile(path.join(sampleRoot, "mask", `${stem}.png`)));
      expect(decoded.width).toBe(image.width); expect(decoded.height).toBe(image.height);
      expect(decoded.isLegacyRgba).toBe(false);
      const expectedMask = new Uint16Array(image.width * image.height);
      image.objects.forEach((object, index) => {
        const [classId, cx, cy, width, height] = rows[index]!.split(/\s+/).map(Number);
        const [x, y, w, h] = object.box as [number, number, number, number];
        expect(classId).toBe(object.classId);
        expect(classId).toBeGreaterThan(0); expect(annotations.classes[classId!]).toBeTruthy();
        expect(x).toBeGreaterThanOrEqual(0); expect(y).toBeGreaterThanOrEqual(0);
        expect(x + w).toBeLessThanOrEqual(image.width); expect(y + h).toBeLessThanOrEqual(image.height);
        expect(cx).toBeCloseTo((x + w / 2) / image.width, 12);
        expect(cy).toBeCloseTo((y + h / 2) / image.height, 12);
        expect(width).toBeCloseTo(w / image.width, 12); expect(height).toBeCloseTo(h / image.height, 12);
        expect(object.runs.reduce((sum, run) => sum + run, 0)).toBe(w * h);
        let offset = 0;
        object.runs.forEach((run, runIndex) => {
          if (runIndex % 2) for (let i = offset; i < offset + run; i++) {
            expectedMask[(y + Math.floor(i / w)) * image.width + x + i % w] = object.classId;
          }
          offset += run;
        });
        seenClasses.add(object.classId);
      });
      // Compare every pixel: dimensions/class presence alone miss corrupt or rectangular masks.
      expect(Buffer.from(decoded.mask.buffer).equals(Buffer.from(expectedMask.buffer))).toBe(true);
      expect(decoded.mask.some((id) => id === 0)).toBe(true);
    }
    expect([...seenClasses].sort((a, b) => a - b)).toEqual(Array.from({ length: 12 }, (_, index) => index + 1));
    const classes = await readFile(path.join(sampleRoot, "label", "classes.yaml"), "utf8");
    expect(classes).toContain("0: Background"); expect(classes).toContain("12: Grid cell");
  }, 30_000);

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
