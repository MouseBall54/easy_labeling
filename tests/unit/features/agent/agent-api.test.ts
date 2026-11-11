import { describe, expect, it } from "vitest";
import {
  AgentImageResult,
  AgentToolError,
  STALE_ID_HINT,
  createAgentDispatcher,
  optionalArg,
  type AgentHost,
  type AgentReply,
  type AgentTool
} from "../../../../src/features/agent/agent-api.js";

function fakeHost(overrides: Partial<AgentHost> = {}) {
  const sent: Array<{ id: string; reply: AgentReply }> = [];
  const activity: boolean[] = [];
  const host: AgentHost = {
    now: () => 1000,
    busyReason: () => null,
    send: (id, reply) => sent.push({ id, reply }),
    progress: () => undefined,
    activity: (active) => activity.push(active),
    ...overrides
  };
  return { host, sent, activity };
}

const call = (id: string, tool: string, args: Record<string, unknown> = {}) => ({ id, tool, args, startBy: 5000 });

describe("agent dispatcher", () => {
  it("runs calls one at a time in order and reports idle once", async () => {
    const order: string[] = [];
    let release!: () => void;
    const tools: Record<string, AgentTool> = {
      slow: { changesApp: false, run: () => new Promise((resolve) => { order.push("slow start"); release = () => { order.push("slow end"); resolve("a"); }; }) },
      fast: { changesApp: false, run: async () => { order.push("fast"); return "b"; } }
    };
    const { host, sent, activity } = fakeHost();
    const dispatcher = createAgentDispatcher(tools, host);
    const first = dispatcher.dispatch(call("1", "slow"));
    const second = dispatcher.dispatch(call("2", "fast"));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(order).toEqual(["slow start"]);
    release();
    await Promise.all([first, second]);
    expect(order).toEqual(["slow start", "slow end", "fast"]);
    expect(sent).toEqual([{ id: "1", reply: { ok: true, result: "a" } }, { id: "2", reply: { ok: true, result: "b" } }]);
    expect(activity.at(-1)).toBe(false);
    expect(activity.filter((active) => !active)).toHaveLength(1);
  });

  it("drops a call that starts after its startBy without running or answering it", async () => {
    let ran = false;
    const { host, sent } = fakeHost({ now: () => 6000 });
    await createAgentDispatcher({ edit: { changesApp: true, run: async () => { ran = true; } } }, host).dispatch(call("1", "edit"));
    expect(ran).toBe(false);
    expect(sent).toEqual([]);
  });

  it("refuses app changes while the person is busy or paused the agent, but still reads", async () => {
    const tools: Record<string, AgentTool> = {
      edit: { changesApp: true, run: async () => "edited" },
      read: { changesApp: false, run: async () => "state" }
    };
    const busy = fakeHost({ busyReason: () => "A dialog is open in the app." });
    const dispatcher = createAgentDispatcher(tools, busy.host);
    await dispatcher.dispatch(call("1", "edit"));
    await dispatcher.dispatch(call("2", "read"));
    expect(busy.sent).toEqual([
      { id: "1", reply: { ok: false, error: { code: "busy", message: "A dialog is open in the app." } } },
      { id: "2", reply: { ok: true, result: "state" } }
    ]);

    const idle = fakeHost();
    const paused = createAgentDispatcher(tools, idle.host);
    paused.setPaused(true);
    await paused.dispatch(call("3", "edit"));
    await paused.dispatch(call("4", "read"));
    paused.setPaused(false);
    await paused.dispatch(call("5", "edit"));
    expect(idle.sent.map(({ reply }) => (reply.ok ? "ok" : reply.error.code))).toEqual(["declined", "ok", "ok"]);
  });

  it("Stop and cancel abort the running call, which then answers cancelled", async () => {
    const tools: Record<string, AgentTool> = {
      wait: { changesApp: true, run: (_args, { signal }) => new Promise((resolve) => signal.addEventListener("abort", () => resolve("late"))) }
    };
    const { host, sent } = fakeHost();
    const dispatcher = createAgentDispatcher(tools, host);
    const paused = dispatcher.dispatch(call("1", "wait"));
    await new Promise((resolve) => setTimeout(resolve, 0));
    dispatcher.setPaused(true);
    await paused;
    dispatcher.setPaused(false);
    const cancelled = dispatcher.dispatch(call("2", "wait"));
    await new Promise((resolve) => setTimeout(resolve, 0));
    dispatcher.cancel("2");
    await cancelled;
    expect(sent.map(({ reply }) => (reply.ok ? "ok" : reply.error.code))).toEqual(["cancelled", "cancelled"]);
  });

  it("maps unknown tools, tool errors, other errors and images", async () => {
    const png = new Uint8Array([137, 80, 78, 71]);
    const tools: Record<string, AgentTool> = {
      missing: { changesApp: false, run: async () => { throw new AgentToolError("not_found", "No image named a.tif"); } },
      broken: { changesApp: false, run: async () => { throw new Error("boom"); } },
      picture: { changesApp: false, run: async () => new AgentImageResult({ width: 2 }, png) }
    };
    const { host, sent } = fakeHost();
    const dispatcher = createAgentDispatcher(tools, host);
    for (const tool of ["nope", "missing", "broken", "picture", "toString"]) await dispatcher.dispatch(call(tool, tool));
    expect(sent.map(({ reply }) => reply)).toEqual([
      { ok: false, error: { code: "invalid_args", message: "Unknown tool: nope" } },
      { ok: false, error: { code: "not_found", message: "No image named a.tif" } },
      { ok: false, error: { code: "failed", message: "boom" } },
      { ok: true, result: { width: 2 }, png },
      { ok: false, error: { code: "invalid_args", message: "Unknown tool: toString" } }
    ]);
  });

  it("an unknown box id says that ids change when an image loads", () => {
    expect(new AgentToolError("not_found", "No box with annotationId x on the current image.").message).toBe(`No box with annotationId x on the current image. ${STALE_ID_HINT}`);
    expect(new AgentToolError("invalid_args", "No box with annotationId x").message).toBe("No box with annotationId x");
  });

  it("follows the person's access settings and records every finished call", async () => {
    const tools: Record<string, AgentTool> = {
      edit: { changesApp: true, run: async () => "edited" },
      read: { changesApp: false, run: async () => "state" }
    };
    let access = { enabled: true, allowChanges: false };
    const recorded: unknown[] = [];
    const { host, sent } = fakeHost({ access: () => access, record: (activity) => recorded.push(activity) });
    const dispatcher = createAgentDispatcher(tools, host);
    await dispatcher.dispatch(call("1", "edit"));
    await dispatcher.dispatch(call("2", "read"));
    access = { enabled: false, allowChanges: true };
    await dispatcher.dispatch(call("3", "read"));
    expect(sent.map(({ reply }) => (reply.ok ? "ok" : reply.error.code))).toEqual(["declined", "ok", "declined"]);
    expect(recorded).toEqual([
      expect.objectContaining({ tool: "edit", ok: false, code: "declined", ms: 0 }),
      expect.objectContaining({ tool: "read", ok: true, result: "state" }),
      expect.objectContaining({ tool: "read", ok: false, code: "declined" })
    ]);
  });

  it("optionalArg checks types", () => {
    expect(optionalArg({ limit: 5 }, "limit", "number")).toBe(5);
    expect(optionalArg({ limit: null }, "limit", "number")).toBeUndefined();
    expect(() => optionalArg({ limit: "5" }, "limit", "number")).toThrow("limit must be a number");
    expect(() => optionalArg({ limit: Number.NaN }, "limit", "number")).toThrow(AgentToolError);
  });
});
