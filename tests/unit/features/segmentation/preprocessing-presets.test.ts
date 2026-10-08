import { describe, expect, it } from "vitest";

import { parsePreprocessingPresets, serializePreprocessingPresets, upsertPreprocessingPreset } from "../../../../src/features/segmentation/preprocessing-presets.js";

describe("preprocessing presets", () => {
  it("upserts by name, normalises configs and round-trips", () => {
    let presets = upsertPreprocessingPreset([], " SEM ", { mode: "original", claheClip: 2.5, flattenSigma: 999 });
    presets = upsertPreprocessingPreset(presets, "SEM", { mode: "edge", median: true });
    presets = upsertPreprocessingPreset(presets, "TEM", { gamma: 1.4 });
    expect(presets.map((preset) => preset.name)).toEqual(["SEM", "TEM"]);
    expect(presets[0].config).toMatchObject({ mode: "edge", median: true, claheClip: 0 });
    expect(upsertPreprocessingPreset([], "Big", { flattenSigma: 999 })[0].config.flattenSigma).toBe(300);
    expect(parsePreprocessingPresets(serializePreprocessingPresets(presets))).toEqual(presets);
    expect(() => upsertPreprocessingPreset(presets, "  ", {})).toThrow();
  });
});
