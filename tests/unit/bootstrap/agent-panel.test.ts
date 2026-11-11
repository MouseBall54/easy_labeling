import { describe, expect, it } from "vitest";
import { activitySummary, ago, readAgentSettings } from "../../../src/bootstrap/agent-panel.js";

describe("agent panel helpers", () => {
  it("reads saved permissions, falling back to allow-all-and-ask", () => {
    const store = (value: string | null) => ({ getItem: () => value });
    expect(readAgentSettings(null)).toEqual({ enabled: true, allowChanges: true, folderChanges: "ask" });
    expect(readAgentSettings(store(JSON.stringify({ enabled: false, allowChanges: false, folderChanges: "block" })))).toEqual({ enabled: false, allowChanges: false, folderChanges: "block" });
    expect(readAgentSettings(store("{broken"))).toEqual({ enabled: true, allowChanges: true, folderChanges: "ask" });
    expect(readAgentSettings(store(JSON.stringify({ enabled: "no", folderChanges: "never" })))).toEqual({ enabled: true, allowChanges: true, folderChanges: "ask" });
    expect(readAgentSettings({ getItem: () => { throw new Error("blocked"); } })).toEqual({ enabled: true, allowChanges: true, folderChanges: "ask" });
  });

  it("summarises a call in one line", () => {
    const base = { tool: "x", startedAt: 0, ms: 3 };
    expect(activitySummary({ ...base, ok: false, code: "busy", message: "A dialog is open in the app." })).toBe("busy: A dialog is open in the app.");
    expect(activitySummary({ ...base, ok: true, result: { annotationIds: ["a", "b"], boxCount: 9, canUndo: true, canRedo: false, extra: 1 } }))
      .toBe("annotationIds 2 · boxCount 9 · canUndo true · canRedo false");
    expect(activitySummary({ ...base, ok: true, result: null })).toBe("");
    expect(activitySummary({ ...base, ok: true, result: { note: "x".repeat(80), width: 512 } })).toBe("width 512");
  });

  it("says how long ago", () => {
    expect(ago(4_400)).toBe("4 s ago");
    expect(ago(125_000)).toBe("2 min ago");
    expect(ago(3 * 3_600_000)).toBe("3 h ago");
    expect(ago(-5)).toBe("0 s ago");
  });
});
