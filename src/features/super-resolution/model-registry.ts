import type { SuperResolutionMode } from "./types.js";

export interface SuperResolutionModelDefinition {
  id: SuperResolutionMode;
  label: string;
  family: "cfsr" | "tk-r-em";
  outputScale: 1 | 2 | 4;
}

export const SUPER_RESOLUTION_MODELS: readonly SuperResolutionModelDefinition[] = [
  { id: "cfsr-x2", label: "CFSR x2", family: "cfsr", outputScale: 2 },
  { id: "cfsr-x4", label: "CFSR x4", family: "cfsr", outputScale: 4 },
  { id: "tk-r-em-hrsem", label: "tk_r_em hrsem", family: "tk-r-em", outputScale: 1 },
  { id: "tk-r-em-hrtem", label: "tk_r_em hrtem", family: "tk-r-em", outputScale: 1 },
  { id: "tk-r-em-lrsem", label: "tk_r_em lrsem", family: "tk-r-em", outputScale: 1 },
  { id: "tk-r-em-lrtem", label: "tk_r_em lrtem", family: "tk-r-em", outputScale: 1 }
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
