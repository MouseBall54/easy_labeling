import { describe, expect, it } from "vitest";

import {
  createEmptyAutomationLibrary,
  createDatasetAutomationLibrary,
  createPresetFileDocument,
  loadAutomationProfileFiles,
  mergeAutomationLibraries,
  mergePresetFileDocument,
  resolveAutomationSelectionId
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

  it("loads saved layouts and self-contained presets while skipping invalid files", () => {
    const presetFile = createPresetFileDocument(createLibrary(), "preset-1");
    const result = loadAutomationProfileFiles(
      [
        { name: "10-layout.json", contents: JSON.stringify(createLayout("layout-10")) },
        { name: "2-layout.json", contents: JSON.stringify(createLayout("layout-2")) },
        { name: "broken-layout.json", contents: "{" }
      ],
      [
        { name: "preset.json", contents: JSON.stringify(presetFile) },
        { name: "broken-preset.json", contents: JSON.stringify(createEmptyAutomationLibrary()) }
      ]
    );

    expect(result.document.layouts.map((layout) => layout.id)).toEqual([
      "layout-2",
      "layout-10",
      "layout-used"
    ]);
    expect(result.document.templates.map((template) => template.id)).toEqual(["template-used"]);
    expect(result.document.presets.map((preset) => preset.id)).toEqual(["preset-1"]);
    expect(result.errors).toHaveLength(2);
    expect(result.errors.join("\n")).toMatch(/broken-layout\.json/);
    expect(result.errors.join("\n")).toMatch(/broken-preset\.json/);
  });

  it("lets dataset entries override matching profile ids without collapsing different ids with the same name", () => {
    const profileLayout = createLayout("shared");
    profileLayout.name = "Same name";
    const otherProfileLayout = createLayout("profile-only");
    otherProfileLayout.name = "Same name";
    const localLayout = createLayout("shared");
    localLayout.name = "Dataset override";

    const profile = {
      ...createEmptyAutomationLibrary(),
      layouts: [profileLayout, otherProfileLayout]
    };
    const local = {
      ...createEmptyAutomationLibrary(),
      layouts: [localLayout]
    };
    const merged = mergeAutomationLibraries(profile, local);

    expect(merged.layouts.map((layout) => [layout.id, layout.name])).toEqual([
      ["shared", "Dataset override"],
      ["profile-only", "Same name"]
    ]);
  });

  it("preserves an existing selection and selects the first item only when requested", () => {
    const items = [{ id: "first" }, { id: "selected" }];

    expect(resolveAutomationSelectionId(items, "selected", true)).toBe("selected");
    expect(resolveAutomationSelectionId(items, "missing", false)).toBe("");
    expect(resolveAutomationSelectionId(items, "missing", true)).toBe("first");
  });

  it("persists only dataset overrides while keeping preset dependencies self-contained", () => {
    const profile = createLibrary();
    const editedPreset = {
      ...profile.presets[0]!,
      name: "Dataset preset override"
    };
    const localLayout = createLayout("dataset-layout");
    const runtime = {
      ...profile,
      layouts: [...profile.layouts, localLayout],
      presets: [editedPreset]
    };

    const dataset = createDatasetAutomationLibrary(runtime, profile);

    expect(dataset.layouts.map((layout) => layout.id)).toEqual(["dataset-layout", "layout-used"]);
    expect(dataset.templates.map((template) => template.id)).toEqual(["template-used"]);
    expect(dataset.presets.map((preset) => preset.name)).toEqual(["Dataset preset override"]);
    expect(dataset.layouts.some((layout) => layout.id === "layout-unused")).toBe(false);
    expect(dataset.templates.some((template) => template.id === "template-unused")).toBe(false);
  });
});
