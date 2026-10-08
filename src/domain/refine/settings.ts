// Per-class refine settings: one full default + per-class overrides holding only the keys the user changed.
import {
  DEFAULT_REFINE_PARAMS,
  normalizeRefineParams,
  normalizeSideMode,
  normalizeSideRule,
  REFINE_SIDES,
  type RefineParams,
  type RefineSide,
  type RefineSideMode,
  type RefineSideRule
} from "./edge-refine.js";

export const REFINE_SETTINGS_FILE = "refine-settings.json";

export type RefineParamsPatch = Partial<Omit<RefineParams, "sides" | "sideRules">> & {
  sides?: Partial<Record<RefineSide, RefineSideMode>>;
  sideRules?: Partial<Record<RefineSide, RefineSideRule>>;
};

/** Image refinement reads: the original, or the Preprocess panel's "Processed" output. */
export type RefineImageSource = "original" | "processed";

/**
 * Processing used when the image source is "processed": a named snapshot of Preprocess panel settings.
 * The config is opaque here (owned by the preprocessing feature). null follows the panel live.
 */
export interface RefineProcessing {
  name: string;
  config: Record<string, unknown>;
}

export interface RefineSettingsDocument {
  schemaVersion: 1;
  imageSource: RefineImageSource;
  processing: RefineProcessing | null;
  /** Preset the Refine pane runs with instead of the class settings; null = class settings. */
  activePreset: string | null;
  default: RefineParams;
  classes: Record<string, RefineParamsPatch>;
  /** Named full parameter sets that can be applied to the default, one class or a group of classes. */
  presets: RefinePreset[];
}

export interface RefinePreset {
  name: string;
  params: RefineParams;
  /** Image the preset was tuned on; absent in presets saved before image sources existed. */
  imageSource?: RefineImageSource;
  processing?: RefineProcessing | null;
}

type ScalarKey = Exclude<keyof RefineParams, "sides" | "sideRules">;
const SCALAR_KEYS = Object.keys(normalizeRefineParams({})).filter((key) => key !== "sides" && key !== "sideRules") as ScalarKey[];

export function createRefineSettings(): RefineSettingsDocument {
  return { schemaVersion: 1, imageSource: "original", processing: null, activePreset: null, default: normalizeRefineParams({}), classes: {}, presets: [] };
}

const mergeSideRules = (
  base: Partial<Record<RefineSide, RefineSideRule>> | undefined,
  patch: Partial<Record<RefineSide, RefineSideRule>> | undefined
): Partial<Record<RefineSide, RefineSideRule>> =>
  Object.fromEntries(REFINE_SIDES
    .map((side) => [side, { ...base?.[side], ...patch?.[side] }] as const)
    .filter(([, rule]) => Object.keys(rule).length > 0));

function merge(base: RefineParams, patch: RefineParamsPatch | undefined): RefineParams {
  return normalizeRefineParams({ ...base, ...patch, sides: { ...base.sides, ...patch?.sides }, sideRules: mergeSideRules(base.sideRules, patch?.sideRules) });
}

export function resolveRefineParams(doc: RefineSettingsDocument, classId: string): RefineParams {
  return merge(doc.default, doc.classes[classId]);
}

/** Keeps only known keys, normalised against the default so stored values are always in range. */
function cleanPatch(defaults: RefineParams, patch: unknown): RefineParamsPatch {
  const source = { ...(typeof patch === "object" && patch !== null ? patch : {}) } as Record<string, unknown>;
  // Legacy refine-module keys.
  if ("R" in source) { source.rangeIn ??= source.R; source.rangeOut ??= source.R; }
  if ("K" in source) source.segments ??= source.K;
  const normalized = normalizeRefineParams({ ...defaults, ...source, sides: defaults.sides });
  const out: RefineParamsPatch = {};
  for (const key of SCALAR_KEYS) {
    if (key in source) (out as Record<string, unknown>)[key] = normalized[key];
  }
  const sides = (typeof source.sides === "object" && source.sides !== null ? source.sides : {}) as Record<string, unknown>;
  for (const side of REFINE_SIDES) {
    if (side in sides) (out.sides ??= {})[side] = normalizeSideMode(sides[side], defaults.sides[side]);
  }
  const rules = (typeof source.sideRules === "object" && source.sideRules !== null ? source.sideRules : {}) as Record<string, unknown>;
  for (const side of REFINE_SIDES) {
    const rule = normalizeSideRule(rules[side]);
    if (Object.keys(rule).length) (out.sideRules ??= {})[side] = rule;
  }
  return out;
}

const isEmptyPatch = (patch: RefineParamsPatch): boolean => Object.keys(patch).every((key) =>
  (key === "sides" && Object.keys(patch.sides ?? {}).length === 0)
  || (key === "sideRules" && Object.values(patch.sideRules ?? {}).every((rule) => Object.keys(rule ?? {}).length === 0)));

export function updateRefineSettings(doc: RefineSettingsDocument, target: "default" | readonly string[], patch: RefineParamsPatch): RefineSettingsDocument {
  if (target === "default") return { ...doc, default: merge(doc.default, cleanPatch(doc.default, patch)) };
  const classes = { ...doc.classes };
  for (const classId of target) {
    const current = classes[classId] ?? {};
    const next = cleanPatch(doc.default, patch);
    classes[classId] = {
      ...current,
      ...next,
      ...(current.sides || next.sides ? { sides: { ...current.sides, ...next.sides } } : {}),
      ...(current.sideRules || next.sideRules ? { sideRules: mergeSideRules(current.sideRules, next.sideRules) } : {})
    };
  }
  return { ...doc, classes };
}

/**
 * Removes overrides. Classes fall back to the default; the default falls back to the built-in values.
 * keys: "crit", "sides.T", "sideRules.T.rangeOut", "sideRules.T" (whole side), "sideRules" (all sides); omitted = all.
 */
export function resetRefineSettings(doc: RefineSettingsDocument, target: "default" | readonly string[], keys?: readonly string[]): RefineSettingsDocument {
  if (target === "default") {
    if (!keys) return { ...doc, default: normalizeRefineParams({}) };
    const next: RefineParams = { ...doc.default, sides: { ...doc.default.sides }, sideRules: cloneRules(doc.default.sideRules) };
    for (const key of keys) {
      if (key.startsWith("sides.")) next.sides[key.slice(6) as RefineSide] = DEFAULT_REFINE_PARAMS.sides[key.slice(6) as RefineSide];
      else if (key.startsWith("sideRules")) removeSideRuleKey(next.sideRules, key);
      else (next as unknown as Record<string, unknown>)[key] = (DEFAULT_REFINE_PARAMS as unknown as Record<string, unknown>)[key];
    }
    return { ...doc, default: normalizeRefineParams(next) };
  }
  const classes = { ...doc.classes };
  for (const classId of target) {
    const current = classes[classId];
    if (!current) continue;
    if (!keys) { delete classes[classId]; continue; }
    const next: RefineParamsPatch = { ...current, sides: { ...current.sides }, sideRules: cloneRules(current.sideRules) };
    for (const key of keys) {
      if (key.startsWith("sides.")) delete next.sides?.[key.slice(6) as RefineSide];
      else if (key.startsWith("sideRules")) removeSideRuleKey(next.sideRules!, key);
      else delete (next as Record<string, unknown>)[key];
    }
    if (next.sides && Object.keys(next.sides).length === 0) delete next.sides;
    if (Object.values(next.sideRules ?? {}).every((rule) => !rule || Object.keys(rule).length === 0)) delete next.sideRules;
    if (isEmptyPatch(next)) delete classes[classId];
    else classes[classId] = next;
  }
  return { ...doc, classes };
}

const cloneRules = (rules: Partial<Record<RefineSide, RefineSideRule>> | undefined): Record<RefineSide, RefineSideRule> =>
  Object.fromEntries(REFINE_SIDES.map((side) => [side, { ...rules?.[side] }])) as Record<RefineSide, RefineSideRule>;

function removeSideRuleKey(rules: Partial<Record<RefineSide, RefineSideRule>>, key: string): void {
  const [, side, field] = key.split(".") as [string, RefineSide | undefined, string | undefined];
  for (const s of side ? [side] : REFINE_SIDES) {
    if (!rules[s]) continue;
    if (field) delete (rules[s] as Record<string, unknown>)[field];
    else rules[s] = {};
  }
}

/** True when the side has a criterion or side rule of its own in the edited target (default or any class). */
export function sideHasOwnRule(doc: RefineSettingsDocument, target: "default" | readonly string[], side: RefineSide): boolean {
  const patches: RefineParamsPatch[] = target === "default" ? [doc.default] : target.map((classId) => doc.classes[classId] ?? {});
  return patches.some((patch) => {
    const mode = patch.sides?.[side];
    return (mode !== undefined && mode !== "inherit" && mode !== "off") || Object.keys(patch.sideRules?.[side] ?? {}).length > 0;
  });
}

export function refineOverriddenKeys(doc: RefineSettingsDocument, classId: string): string[] {
  const patch = doc.classes[classId] ?? {};
  const keys = Object.keys(patch).filter((key) => key !== "sides" && key !== "sideRules");
  for (const side of Object.keys(patch.sides ?? {})) keys.push(`sides.${side}`);
  for (const [side, rule] of Object.entries(patch.sideRules ?? {})) for (const key of Object.keys(rule ?? {})) keys.push(`sideRules.${side}.${key}`);
  return keys;
}

export function parseRefineSettings(text: string): RefineSettingsDocument {
  const parsed: unknown = JSON.parse(text);
  if (typeof parsed !== "object" || parsed === null) throw new Error("Invalid refine settings");
  const source = parsed as Record<string, unknown>;
  const defaults = normalizeRefineParams(source.default);
  const classes: Record<string, RefineParamsPatch> = {};
  for (const [classId, patch] of Object.entries((source.classes ?? {}) as Record<string, unknown>)) {
    const clean = cleanPatch(defaults, patch);
    if (!isEmptyPatch(clean)) classes[classId] = clean;
  }
  return {
    schemaVersion: 1,
    imageSource: source.imageSource === "processed" ? "processed" : "original",
    processing: parseProcessing(source.processing),
    activePreset: typeof source.activePreset === "string" ? source.activePreset : null,
    default: defaults,
    classes,
    presets: parsePresetList(source.presets)
  };
}

export function serializeRefineSettings(doc: RefineSettingsDocument): string {
  return `${JSON.stringify(doc, null, 2)}\n`;
}

// ---------------------------------------------------------------------------
// Presets
// ---------------------------------------------------------------------------
function parseProcessing(value: unknown): RefineProcessing | null {
  const source = value as { name?: unknown; config?: unknown } | null;
  return source && typeof source.config === "object" && source.config !== null
    ? { name: typeof source.name === "string" ? source.name : "", config: { ...(source.config as Record<string, unknown>) } }
    : null;
}

function parsePresetList(value: unknown): RefinePreset[] {
  if (!Array.isArray(value)) return [];
  const byName = new Map<string, RefinePreset>();
  for (const item of value) {
    const name = typeof item?.name === "string" ? item.name.trim() : "";
    if (!name) continue;
    const preset: RefinePreset = { name, params: normalizeRefineParams(item.params) };
    if (item.imageSource === "processed" || item.imageSource === "original") {
      preset.imageSource = item.imageSource;
      preset.processing = parseProcessing(item.processing);
    }
    byName.set(name, preset);
  }
  return [...byName.values()];
}

/** Adds the preset (with the image it was tuned on), replacing one with the same name. */
export function saveRefinePreset(
  doc: RefineSettingsDocument,
  name: string,
  params: RefineParams,
  image?: { imageSource: RefineImageSource; processing: RefineProcessing | null }
): RefineSettingsDocument {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Preset name is required");
  const preset: RefinePreset = { name: trimmed, params: normalizeRefineParams(params) };
  if (image) {
    preset.imageSource = image.imageSource;
    preset.processing = image.processing ? { name: image.processing.name, config: { ...image.processing.config } } : null;
  }
  const index = doc.presets.findIndex((item) => item.name === trimmed);
  const presets = index < 0 ? [...doc.presets, preset] : doc.presets.map((item, i) => (i === index ? preset : item));
  return { ...doc, presets };
}

export function deleteRefinePreset(doc: RefineSettingsDocument, name: string): RefineSettingsDocument {
  return { ...doc, presets: doc.presets.filter((item) => item.name !== name), activePreset: doc.activePreset === name ? null : doc.activePreset };
}

/**
 * Pins the target to the preset: classes store every key, so later default edits do not drift them.
 * A preset that carries an image source also restores the image source and its processing.
 */
export function applyRefinePreset(doc: RefineSettingsDocument, name: string, target: "default" | readonly string[]): RefineSettingsDocument {
  const preset = doc.presets.find((item) => item.name === name);
  if (!preset) return doc;
  const image = preset.imageSource ? { imageSource: preset.imageSource, processing: preset.processing ?? null } : {};
  if (target === "default") return { ...doc, ...image, default: normalizeRefineParams(preset.params) };
  const classes = { ...doc.classes };
  for (const classId of target) classes[classId] = { ...preset.params, sides: { ...preset.params.sides }, sideRules: cloneRules(preset.params.sideRules) };
  return { ...doc, ...image, classes };
}

export function serializeRefinePresets(presets: readonly RefinePreset[]): string {
  return `${JSON.stringify({ schemaVersion: 1, kind: "easy-labeling-refine-presets", presets }, null, 2)}
`;
}

/** Accepts a presets file or a whole refine-settings.json; imported names replace existing ones. */
export function importRefinePresets(doc: RefineSettingsDocument, text: string): { doc: RefineSettingsDocument; count: number } {
  const parsed: unknown = JSON.parse(text);
  const presets = parsePresetList((parsed as { presets?: unknown } | null)?.presets);
  if (!presets.length) throw new Error("No refine presets found in the file");
  let next = doc;
  for (const preset of presets) {
    next = saveRefinePreset(next, preset.name, preset.params, preset.imageSource ? { imageSource: preset.imageSource, processing: preset.processing ?? null } : undefined);
  }
  return { doc: next, count: presets.length };
}

/** "Refine preset · Processed (SEM fins)" style label for preset lists. */
export function refinePresetLabel(preset: { name: string; imageSource?: string; processing?: { name: string } | null }): string {
  if (preset.imageSource !== "processed") return preset.name;
  return `${preset.name} · Processed${preset.processing?.name ? ` (${preset.processing.name})` : ""}`;
}
