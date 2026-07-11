import { validateBoxLayout } from "./layout.js";
import {
  AUTOMATION_SCHEMA_VERSION,
  TEMPLATE_SCHEMA_VERSION,
  type AutomationLibraryDocument,
  type AutomationPreset,
  type MultipleDetectionSettings,
  type PixelRect,
  type TemplateAsset,
  type TemplatePreprocessingSettings
} from "./types.js";

export const DEFAULT_MULTIPLE_DETECTION_SETTINGS: MultipleDetectionSettings = {
  classId: "0",
  maximumDetections: 100,
  strictNonOverlap: true,
  nmsIouThreshold: 0.3,
  paddingX: 0,
  paddingY: 0
};

export function validatePreprocessingSettings(settings: TemplatePreprocessingSettings): void {
  if (!Number.isInteger(settings.blurKernelSize) || settings.blurKernelSize < 1 || settings.blurKernelSize > 99 || settings.blurKernelSize % 2 === 0) {
    throw new Error("Blur kernel size must be an odd integer between 1 and 99");
  }
  if (!Number.isFinite(settings.blurSigma) || settings.blurSigma < 0) {
    throw new Error("Blur sigma must be zero or greater");
  }
  if (!Number.isFinite(settings.gaussianNoiseSigma) || settings.gaussianNoiseSigma < 0) {
    throw new Error("Gaussian noise sigma must be zero or greater");
  }
  if (!Number.isInteger(settings.gaussianNoiseSeed)) {
    throw new Error("Gaussian noise seed must be an integer");
  }
}

function validateRect(rect: PixelRect, field: string): void {
  if (![rect.x, rect.y, rect.width, rect.height].every(Number.isFinite) || rect.x < 0 || rect.y < 0 || rect.width <= 0 || rect.height <= 0) {
    throw new Error(`${field} must be a positive pixel rectangle`);
  }
}

export function validateTemplateAsset(template: TemplateAsset): void {
  if (template.schemaVersion !== TEMPLATE_SCHEMA_VERSION) {
    throw new Error(`Unsupported template schema version: ${String(template.schemaVersion)}`);
  }
  if (!template.id.trim() || !template.name.trim() || !template.pngDataUrl.startsWith("data:image/png;base64,")) {
    throw new Error("Template id, name, and PNG data are required");
  }
  validateRect(template.roi, "template.roi");
  if (template.roi.x + template.roi.width > template.sourceImageSize.width || template.roi.y + template.roi.height > template.sourceImageSize.height) {
    throw new Error("Template ROI falls outside its source image");
  }
  validatePreprocessingSettings(template.preprocessing);
}

export function validateAutomationPreset(preset: AutomationPreset): void {
  if (preset.schemaVersion !== AUTOMATION_SCHEMA_VERSION) {
    throw new Error(`Unsupported preset schema version: ${String(preset.schemaVersion)}`);
  }
  if (!preset.id.trim() || !preset.name.trim() || !preset.templateId.trim()) {
    throw new Error("Preset id, name, and templateId are required");
  }
  if (preset.outputMode === "layout-best-match" && !preset.layoutId?.trim()) {
    throw new Error("Best Match + Layout presets require a layoutId");
  }
  if (preset.outputMode !== "layout-best-match" && preset.outputMode !== "multiple-detection-boxes") {
    throw new Error(`Unsupported preset output mode: ${String(preset.outputMode)}`);
  }
  if (preset.matching.mode !== "accurate" && preset.matching.mode !== "fast") {
    throw new Error(`Unsupported template matching mode: ${String(preset.matching.mode)}`);
  }
  if (!Number.isFinite(preset.matching.minimumScore) || preset.matching.minimumScore < -1 || preset.matching.minimumScore > 1) {
    throw new Error("Minimum score must be between -1 and 1");
  }
  if (preset.matching.searchRoi) {
    validateRect(preset.matching.searchRoi, "preset.matching.searchRoi");
  }
  const offsets = [preset.relationOffset.x, preset.relationOffset.y, preset.manualOffset.x, preset.manualOffset.y];
  if (!offsets.every(Number.isFinite)) {
    throw new Error("Preset offsets must be finite numbers");
  }
  const multiple = preset.multipleDetection;
  if (!multiple.classId.trim()) {
    throw new Error("Multiple Detection class ID is required");
  }
  if (!Number.isInteger(multiple.maximumDetections) || multiple.maximumDetections < 1 || multiple.maximumDetections > 10000) {
    throw new Error("Maximum detections must be an integer between 1 and 10000");
  }
  if (!Number.isFinite(multiple.nmsIouThreshold) || multiple.nmsIouThreshold < 0 || multiple.nmsIouThreshold > 1) {
    throw new Error("NMS IoU threshold must be between 0 and 1");
  }
  if (![multiple.paddingX, multiple.paddingY].every((value) => Number.isFinite(value) && value >= 0)) {
    throw new Error("Detection padding must be zero or greater");
  }
}

export function validateAutomationLibrary(document: AutomationLibraryDocument): void {
  if (document.schemaVersion !== AUTOMATION_SCHEMA_VERSION) {
    throw new Error(`Unsupported automation library schema version: ${String(document.schemaVersion)}`);
  }
  document.layouts.forEach(validateBoxLayout);
  document.templates.forEach(validateTemplateAsset);
  document.presets.forEach(validateAutomationPreset);

  const layoutIds = new Set(document.layouts.map((layout) => layout.id));
  const templateIds = new Set(document.templates.map((template) => template.id));
  document.presets.forEach((preset) => {
    if (preset.layoutId && !layoutIds.has(preset.layoutId)) {
      throw new Error(`Preset ${preset.name} references a missing layout`);
    }
    if (!templateIds.has(preset.templateId)) {
      throw new Error(`Preset ${preset.name} references a missing template`);
    }
  });
}

function migrateVersionOne(document: Record<string, unknown>): AutomationLibraryDocument {
  const presets = Array.isArray(document.presets) ? document.presets : [];
  return {
    schemaVersion: AUTOMATION_SCHEMA_VERSION,
    layouts: Array.isArray(document.layouts) ? document.layouts as AutomationLibraryDocument["layouts"] : [],
    templates: Array.isArray(document.templates) ? document.templates as AutomationLibraryDocument["templates"] : [],
    presets: presets.map((entry) => {
      if (!entry || typeof entry !== "object") {
        throw new Error("Legacy preset entries must be objects");
      }
      const legacy = entry as Record<string, unknown>;
      const matching = legacy.matching && typeof legacy.matching === "object"
        ? legacy.matching as Record<string, unknown>
        : {};
      return {
        ...legacy,
        schemaVersion: AUTOMATION_SCHEMA_VERSION,
        layoutId: typeof legacy.layoutId === "string" ? legacy.layoutId : null,
        outputMode: "layout-best-match",
        matching: {
          ...matching,
          minimumScore: Number(matching.minimumScore ?? 0.8),
          searchRoi: matching.searchRoi ?? null,
          mode: "accurate"
        },
        multipleDetection: { ...DEFAULT_MULTIPLE_DETECTION_SETTINGS }
      } as AutomationPreset;
    })
  };
}

export function parseAutomationLibrary(json: string): AutomationLibraryDocument {
  const parsed: unknown = JSON.parse(json);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Automation library must be a JSON object");
  }
  const raw = parsed as Record<string, unknown>;
  const document = raw.schemaVersion === 1
    ? migrateVersionOne(raw)
    : raw as unknown as AutomationLibraryDocument;
  if (!Array.isArray(document.layouts) || !Array.isArray(document.templates) || !Array.isArray(document.presets)) {
    throw new Error("Automation library collections are invalid");
  }
  validateAutomationLibrary(document);
  return document;
}

export function serializeAutomationLibrary(document: AutomationLibraryDocument): string {
  validateAutomationLibrary(document);
  return `${JSON.stringify(document, null, 2)}\n`;
}
