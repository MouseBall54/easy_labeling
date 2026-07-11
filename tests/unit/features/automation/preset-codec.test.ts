import { describe, expect, it } from "vitest";

import {
  DEFAULT_MULTIPLE_DETECTION_SETTINGS,
  parseAutomationLibrary,
  serializeAutomationLibrary,
  validatePreprocessingSettings
} from "../../../../src/features/automation/preset-codec.js";
import {
  AUTOMATION_SCHEMA_VERSION,
  LAYOUT_SCHEMA_VERSION,
  TEMPLATE_SCHEMA_VERSION,
  type AutomationLibraryDocument
} from "../../../../src/features/automation/types.js";

describe("automation preset codec", () => {
  it("requires odd blur kernels and deterministic noise seeds", () => {
    expect(() => validatePreprocessingSettings({
      grayscale: true,
      gaussianBlurEnabled: true,
      blurKernelSize: 20,
      blurSigma: 0,
      gaussianNoiseEnabled: false,
      gaussianNoiseSigma: 0,
      gaussianNoiseSeed: 1
    })).toThrow(/odd integer/);
  });

  it("round-trips a versioned automation library", () => {
    const document: AutomationLibraryDocument = {
      schemaVersion: AUTOMATION_SCHEMA_VERSION,
      layouts: [{
        schemaVersion: LAYOUT_SCHEMA_VERSION,
        id: "layout-1",
        name: "layout",
        sourceImageName: "ref.png",
        sourceImageSize: { width: 100, height: 100 },
        sourceAnchor: { x: 10, y: 10 },
        createdAt: "now",
        updatedAt: "now",
        boxes: [{ id: "box-1", classId: "0", relativeX: 0, relativeY: 0, width: 10, height: 10, order: 0 }]
      }],
      templates: [{
        schemaVersion: TEMPLATE_SCHEMA_VERSION,
        id: "template-1",
        name: "template",
        sourceImageName: "ref.png",
        sourceImageSize: { width: 100, height: 100 },
        roi: { x: 5, y: 5, width: 20, height: 20 },
        pngDataUrl: "data:image/png;base64,AA==",
        preprocessing: {
          grayscale: true,
          gaussianBlurEnabled: true,
          blurKernelSize: 21,
          blurSigma: 0,
          gaussianNoiseEnabled: false,
          gaussianNoiseSigma: 0,
          gaussianNoiseSeed: 1
        },
        createdAt: "now",
        updatedAt: "now"
      }],
      presets: [{
        schemaVersion: AUTOMATION_SCHEMA_VERSION,
        id: "preset-1",
        name: "preset",
        templateId: "template-1",
        layoutId: "layout-1",
        outputMode: "layout-best-match",
        relationOffset: { x: 0, y: 0 },
        manualOffset: { x: 0, y: 0 },
        matching: { minimumScore: 0.8, searchRoi: null, mode: "accurate" },
        multipleDetection: { ...DEFAULT_MULTIPLE_DETECTION_SETTINGS },
        existingLabelsPolicy: "skip",
        createdAt: "now",
        updatedAt: "now"
      }]
    };

    expect(parseAutomationLibrary(serializeAutomationLibrary(document))).toEqual(document);
  });

  it("migrates version 1 presets without losing layout, template, or offsets", () => {
    const legacy = {
      schemaVersion: 1,
      layouts: [{
        schemaVersion: 1,
        id: "layout-1",
        name: "legacy layout",
        sourceImageName: "ref.png",
        sourceImageSize: { width: 100, height: 100 },
        sourceAnchor: { x: 10, y: 10 },
        boxes: [{ id: "box-1", classId: "3", relativeX: 0, relativeY: 0, width: 10, height: 10, order: 0 }],
        createdAt: "now",
        updatedAt: "now"
      }],
      templates: [{
        schemaVersion: 1,
        id: "template-1",
        name: "legacy template",
        sourceImageName: "ref.png",
        sourceImageSize: { width: 100, height: 100 },
        roi: { x: 5, y: 6, width: 20, height: 20 },
        pngDataUrl: "data:image/png;base64,AA==",
        preprocessing: {
          grayscale: true,
          gaussianBlurEnabled: false,
          blurKernelSize: 1,
          blurSigma: 0,
          gaussianNoiseEnabled: false,
          gaussianNoiseSigma: 0,
          gaussianNoiseSeed: 1
        },
        createdAt: "now",
        updatedAt: "now"
      }],
      presets: [{
        schemaVersion: 1,
        id: "preset-1",
        name: "legacy",
        templateId: "template-1",
        layoutId: "layout-1",
        relationOffset: { x: 12, y: -4 },
        manualOffset: { x: 3, y: 7 },
        matching: { minimumScore: 0.82, searchRoi: null },
        existingLabelsPolicy: "append",
        createdAt: "now",
        updatedAt: "now"
      }]
    };

    const migrated = parseAutomationLibrary(JSON.stringify(legacy));

    expect(migrated.schemaVersion).toBe(2);
    expect(migrated.layouts).toEqual(legacy.layouts);
    expect(migrated.templates).toEqual(legacy.templates);
    expect(migrated.presets[0]).toMatchObject({
      outputMode: "layout-best-match",
      layoutId: "layout-1",
      relationOffset: { x: 12, y: -4 },
      manualOffset: { x: 3, y: 7 },
      matching: { minimumScore: 0.82, searchRoi: null, mode: "accurate" },
      multipleDetection: DEFAULT_MULTIPLE_DETECTION_SETTINGS
    });
  });
});
