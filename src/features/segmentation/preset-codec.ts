import type { SegmentationToolPreset } from "./types.js";
import { normalizeSuperpixelSettings } from "./superpixels.js";

export const SEGMENTATION_TOOL_PRESET_SCHEMA_VERSION = 1;

export interface SegmentationToolPresetDocument {
  schemaVersion: number;
  presets: SegmentationToolPreset[];
}

export function createEmptySegmentationToolPresetDocument(): SegmentationToolPresetDocument {
  return { schemaVersion: SEGMENTATION_TOOL_PRESET_SCHEMA_VERSION, presets: [] };
}

export function validateSegmentationToolPreset(preset: SegmentationToolPreset): void {
  if (!preset.id.trim() || !preset.name.trim()) throw new Error("Preset id and name are required");
  normalizeSuperpixelSettings(preset.settings);
  if (![preset.smartSimilarity, preset.smartEdgeStop].every((value) => Number.isFinite(value) && value >= 0 && value <= 1)) {
    throw new Error("Smart Select values must be between 0 and 1");
  }
}

export function parseSegmentationToolPresetDocument(json: string): SegmentationToolPresetDocument {
  const parsed: unknown = JSON.parse(json);
  if (!parsed || typeof parsed !== "object") throw new Error("Segmentation preset library must be an object");
  const document = parsed as SegmentationToolPresetDocument;
  if (document.schemaVersion !== SEGMENTATION_TOOL_PRESET_SCHEMA_VERSION || !Array.isArray(document.presets)) {
    throw new Error("Unsupported segmentation preset library");
  }
  document.presets.forEach(validateSegmentationToolPreset);
  return document;
}

export function serializeSegmentationToolPresetDocument(document: SegmentationToolPresetDocument): string {
  if (document.schemaVersion !== SEGMENTATION_TOOL_PRESET_SCHEMA_VERSION) throw new Error("Unsupported segmentation preset library");
  document.presets.forEach(validateSegmentationToolPreset);
  return `${JSON.stringify(document, null, 2)}\n`;
}
