import type { SuperResolutionMode } from "./types.js";

export interface SuperResolutionModelDefinition {
  id: SuperResolutionMode;
  label: string;
  outputScale: 2 | 4;
}

export const SUPER_RESOLUTION_MODELS: readonly SuperResolutionModelDefinition[] = [
  { id: "cfsr-x2", label: "CFSR x2", outputScale: 2 },
  { id: "cfsr-x4", label: "CFSR x4", outputScale: 4 }
] as const;

const definitions = new Map(SUPER_RESOLUTION_MODELS.map((model) => [model.id, model]));

export function isSuperResolutionMode(value: string): value is SuperResolutionMode {
  return definitions.has(value as SuperResolutionMode);
}

export function getSuperResolutionModel(mode: SuperResolutionMode): SuperResolutionModelDefinition {
  const definition = definitions.get(mode);
  if (!definition) throw new Error(`Unsupported enhancement model: ${mode}`);
  return definition;
}

export function getSuperResolutionModelLabel(mode: SuperResolutionMode): string {
  return getSuperResolutionModel(mode).label;
}
