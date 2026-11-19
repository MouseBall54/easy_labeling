import { describe, expect, it } from "vitest";
import { activitySummary, ago, channelRows, readAgentSettings } from "../../../src/bootstrap/agent-panel.js";

describe("agent panel helpers", () => {
  it("reads saved permissions, falling back to allow-all-and-ask", () => {
    const store = (value: string | null) => ({ getItem: () => value });
    expect(readAgentSettings(null)).toEqual({ enabled: true, allowChanges: true, folderChanges: "ask", liveView: false });
    expect(readAgentSettings(store(JSON.stringify({ enabled: false, allowChanges: false, folderChanges: "block", liveView: true })))).toEqual({ enabled: false, allowChanges: false, folderChanges: "block", liveView: true });
    expect(readAgentSettings(store("{broken"))).toEqual({ enabled: true, allowChanges: true, folderChanges: "ask", liveView: false });
    expect(readAgentSettings(store(JSON.stringify({ enabled: "no", folderChanges: "never", liveView: "yes" })))).toEqual({ enabled: true, allowChanges: true, folderChanges: "ask", liveView: false });
    expect(readAgentSettings({ getItem: () => { throw new Error("blocked"); } })).toEqual({ enabled: true, allowChanges: true, folderChanges: "ask", liveView: false });
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

  it("lists each window's channel, folder and agents, and warns when one window has several agents", () => {
    const now = 100_000;
    const view = channelRows([
      {
        channel: 1, self: false, folder: "D:\\data\\SEM_lot_A",
        agents: [{ client: { name: "claude-code", version: "2.1" }, since: now - 120_000 }, { client: { name: "codex", version: "" }, since: now - 5_000 }],
        lastCall: { tool: "refine_folder", client: { name: "codex" }, at: now - 3_000 }
      },
      { channel: 2, self: true, folder: null, agents: [], lastCall: null },
      { channel: 4, unknown: true }
    ], now);
    expect(view.rows.map(({ channel, folder, agents, agentCount }) => ({ channel, folder, agents, agentCount }))).toEqual([
      { channel: 1, folder: "SEM_lot_A", agents: "claude-code 2.1, codex", agentCount: 2 },
      { channel: 2, folder: "No folder open (this window)", agents: "No agent", agentCount: 0 },
      { channel: 4, folder: "Another version", agents: "", agentCount: 0 }
    ]);
    expect(view.rows[0].title.split("\n")).toEqual([
      "Channel 1", "D:\\data\\SEM_lot_A", "claude-code 2.1, attached 2 min ago", "codex, attached 5 s ago", "Last call: refine_folder by codex 3 s ago"
    ]);
    expect(view.warning).toBe("Channel 1 has 2 agents: their calls run one at a time on the same window. Give each agent its own window and channel.");
    expect(channelRows([{ channel: 1, self: true, folder: "C:/x", agents: [{ client: null }], lastCall: null }], now).warning).toBe("");
  });
});
