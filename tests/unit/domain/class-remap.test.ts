import { describe, expect, it } from "vitest";
import { remapYoloClassIds, summarizeClassRemap } from "../../../src/domain/class-remap.js";

describe("label class remapping", () => {
  const text = "  0\t-0.10 0.5 0.2 0.2\r\n2 1.1 0.5 0.1 0.1\r\n\r\n1 0.5 0.5 0.1 0.1";
  it("swaps original IDs simultaneously and preserves all coordinates, whitespace and line endings", () => {
    const result = remapYoloClassIds(text, { mode: "mapping", mapping: [{ from: "0", to: "2" }, { from: "2", to: "0" }] });
    expect(result.text).toBe("  2\t-0.10 0.5 0.2 0.2\r\n0 1.1 0.5 0.1 0.1\r\n\r\n1 0.5 0.5 0.1 0.1");
    expect(result.changes).toEqual([{ from: "0", to: "2", count: 1 }, { from: "2", to: "0", count: 1 }]);
    expect(result.changedCount).toBe(2);
  });
  it("shifts IDs in both directions, merges destinations and leaves no-op ID formatting alone", () => {
    const shifted = remapYoloClassIds(text, { mode: "offset", offset: 3 });
    expect(shifted.changedCount).toBe(3);
    expect(remapYoloClassIds(shifted.text, { mode: "offset", offset: -3 }).text).toBe(text);
    expect(remapYoloClassIds("001 0.5 0.5 0.1 0.1\n", { mode: "offset", offset: 0 }).text).toBe("001 0.5 0.5 0.1 0.1\n");
    expect(summarizeClassRemap(["0", "1", "2", "2"], { mode: "mapping", mapping: [{ from: "0", to: "5" }, { from: "2", to: "5" }] }))
      .toEqual({ changedCount: 3, changes: [{ from: "0", to: "5", count: 1 }, { from: "2", to: "5", count: 2 }] });
  });
  it.each([
    { mode: "offset" as const, offset: -1 }, { mode: "offset" as const, offset: .5 },
    { mode: "offset" as const, offset: Number.MAX_SAFE_INTEGER },
    { mode: "mapping" as const, mapping: [{ from: "01", to: "2" }, { from: "1", to: "3" }] },
    { mode: "mapping" as const, mapping: [{ from: "0", to: "-1" }] },
    { mode: "mapping" as const, mapping: [] }
  ])("rejects invalid mappings or resulting IDs before returning any changes: %j", (rule) => {
    expect(() => remapYoloClassIds(text, rule)).toThrow();
  });
  it.each(["x 0.5 0.5 0.1 0.1", "0 0.5 0.5 0.1", "0 NaN 0.5 0.1 0.1", "0 0.5 0.5 -0.1 0.1", "0 0.1 0.2 0.3 0.4 0.5 0.6"])("rejects invalid Detection rows: %s", (line) => {
    expect(() => remapYoloClassIds(`0 0.5 0.5 0.1 0.1\n${line}`, { mode: "offset", offset: 1 })).toThrow("Line 2:");
  });
});
