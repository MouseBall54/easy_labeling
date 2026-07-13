import { describe, expect, it } from "vitest";

import {
  createEmptyAutomationLibrary,
  createPresetFileDocument,
  mergePresetFileDocument
} from "../../../../src/features/automation/automation-library-service.js";
import { DEFAULT_MULTIPLE_DETECTION_SETTINGS } from "../../../../src/features/automation/preset-codec.js";
import {
  AUTOMATION_SCHEMA_VERSION,
  LAYOUT_SCHEMA_VERSION,
  TEMPLATE_SCHEMA_VERSION,
  type AutomationLibraryDocument,
  type BoxLayout,
  type TemplateAsset
} from "../../../../src/features/automation/types.js";

function createLayout(id: string): BoxLayout {
  return {
    schemaVersion: LAYOUT_SCHEMA_VERSION,
    id,
    name: id,
    sourceImageName: "reference.png",
    sourceImageSize: { width: 100, height: 100 },
    sourceAnchor: { x: 10, y: 10 },
    boxes: [{ id: `${id}-box`, classId: "0", relativeX: 0, relativeY: 0, width: 10, height: 10, order: 0 }],
    createdAt: "now",
    updatedAt: "now"
  };
}

function createTemplate(id: string): TemplateAsset {
  return {
    schemaVersion: TEMPLATE_SCHEMA_VERSION,
    id,
    name: id,
    sourceImageName: "reference.png",
    sourceImageSize: { width: 100, height: 100 },
    roi: { x: 5, y: 5, width: 20, height: 20 },
    pngDataUrl: "data:image/png;base64,AA==",
    preprocessing: {
      grayscale: true,
      gaussianBlurEnabled: true,
      blurKernelSize: 13,
      blurSigma: 0,
      gaussianNoiseEnabled: false,
      gaussianNoiseSigma: 0,
      gaussianNoiseSeed: 1
    },
    createdAt: "now",
    updatedAt: "now"
  };
}

function createLibrary(): AutomationLibraryDocument {
  return {
    schemaVersion: AUTOMATION_SCHEMA_VERSION,
    layouts: [createLayout("layout-used"), createLayout("layout-unused")],
    templates: [createTemplate("template-used"), createTemplate("template-unused")],
    presets: [{
      schemaVersion: AUTOMATION_SCHEMA_VERSION,
      id: "preset-1",
      name: "Portable preset",
      templateId: "template-used",
      layoutId: "layout-used",
      outputMode: "layout-best-match",
      relationOffset: { x: 2, y: 3 },
      manualOffset: { x: 4, y: 5 },
      matching: { minimumScore: 0.8, searchRoi: null, mode: "accurate" },
      multipleDetection: { ...DEFAULT_MULTIPLE_DETECTION_SETTINGS },
      existingLabelsPolicy: "append",
      createdAt: "now",
      updatedAt: "now"
    }]
  };
}

describe("automation preset files", () => {
  it("exports one preset with only its template and referenced layout", () => {
    const presetFile = createPresetFileDocument(createLibrary(), "preset-1");

    expect(presetFile.presets.map((preset) => preset.id)).toEqual(["preset-1"]);
    expect(presetFile.templates.map((template) => template.id)).toEqual(["template-used"]);
    expect(presetFile.layouts.map((layout) => layout.id)).toEqual(["layout-used"]);
  });

  it("merges a preset file into another dataset library", () => {
    const presetFile = createPresetFileDocument(createLibrary(), "preset-1");
    const merged = mergePresetFileDocument(createEmptyAutomationLibrary(), presetFile);

    expect(merged.presets[0]?.name).toBe("Portable preset");
    expect(merged.templates[0]?.id).toBe("template-used");
    expect(merged.layouts[0]?.id).toBe("layout-used");
  });

  it("rejects files that do not contain exactly one preset", () => {
    expect(() => mergePresetFileDocument(createEmptyAutomationLibrary(), createEmptyAutomationLibrary()))
      .toThrow(/exactly one preset/);
  });
});
