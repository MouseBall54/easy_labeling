/**
 * Runs agent calls (easy-labeling-mcp.exe -> src-tauri/src/agent.rs -> here) one at a time.
 * Plan: docs/AGENT_MCP_PLAN_KO.md (sections 3.2, 3.3). DOM-free; agent-runtime.ts supplies the host.
 */

export type AgentErrorCode = "busy" | "cancelled" | "declined" | "failed" | "invalid_args" | "no_folder" | "no_image" | "not_found" | "timeout";

export class AgentToolError extends Error {
  constructor(readonly code: AgentErrorCode, message: string) {
    super(message);
    this.name = "AgentToolError";
  }
}

/** A tool result with a PNG attached (capture_view). */
export class AgentImageResult {
  constructor(readonly result: unknown, readonly png: Uint8Array) {}
}

export interface AgentRequest {
  id: string;
  tool: string;
  args?: Record<string, unknown>;
  /** Epoch ms: a call not started by then is dropped (Rust has given up on it; see agent.rs). */
  startBy: number;
}

export interface AgentToolContext {
  signal: AbortSignal;
  progress(done: number, total?: number, message?: string): void;
}

export interface AgentTool {
  /** Changes what the app shows or holds (refused while the person is busy in the app or paused the agent). */
  changesApp: boolean;
  run(args: Record<string, unknown>, context: AgentToolContext): Promise<unknown>;
}

export type AgentReply =
  | { ok: true; result: unknown; png?: Uint8Array }
  | { ok: false; error: { code: AgentErrorCode; message: string } };

/** One finished call, for the Agent panel's activity list. */
export interface AgentActivity {
  tool: string;
  startedAt: number;
  ms: number;
  ok: boolean;
  code?: AgentErrorCode;
  message?: string;
  result?: unknown;
}

/** What the person allows in the Agent panel. */
export interface AgentAccess {
  /** Off: every call is refused. */
  enabled: boolean;
  /** Off: only tools that do not change the app run. */
  allowChanges: boolean;
}

export interface AgentHost {
  now(): number;
  access?(): AgentAccess;
  record?(activity: AgentActivity): void;
  /** Why the person is busy in the app (a dialog, typing, a drag, another operation), or null. */
  busyReason(): string | null;
  send(id: string, reply: AgentReply): void;
  progress(id: string, done: number, total?: number, message?: string): void;
  /** A call started (true) or the queue went idle (false). */
  activity(active: boolean): void;
}

export interface AgentDispatcher {
  dispatch(request: AgentRequest): Promise<void>;
  cancel(id: string): void;
  /** The person's Stop: cancels the running call and refuses calls that change the app until resumed. */
  setPaused(paused: boolean): void;
  readonly paused: boolean;
}

export function createAgentDispatcher(tools: Readonly<Record<string, AgentTool>>, host: AgentHost): AgentDispatcher {
  let queue = Promise.resolve();
  let waiting = 0;
  let paused = false;
  const running = new Map<string, AbortController>();

  const execute = async (request: AgentRequest, controller: AbortController): Promise<AgentReply> => {
    const tool = Object.hasOwn(tools, request.tool) ? tools[request.tool] : undefined;
    if (!tool) throw new AgentToolError("invalid_args", `Unknown tool: ${request.tool}`);
    const access = host.access?.() ?? { enabled: true, allowChanges: true };
    if (!access.enabled) throw new AgentToolError("declined", "The person turned agent access off in the app (Agent panel).");
    if (tool.changesApp) {
      if (!access.allowChanges) throw new AgentToolError("declined", "The person allows read-only agent access in the app (Agent panel); this tool changes the app.");
      if (paused) throw new AgentToolError("declined", "The person paused the agent in the app.");
      const busy = host.busyReason();
      if (busy) throw new AgentToolError("busy", busy);
    }
    const output = await tool.run(request.args ?? {}, {
      signal: controller.signal,
      progress: (done, total, message) => host.progress(request.id, done, total, message)
    });
    if (controller.signal.aborted) throw new AgentToolError("cancelled", "Cancelled.");
    return output instanceof AgentImageResult ? { ok: true, result: output.result, png: output.png } : { ok: true, result: output ?? null };
  };

  const run = async (request: AgentRequest): Promise<void> => {
    // Too late: Rust already answered timeout, so running it now would apply a change the agent saw fail.
    if (host.now() > request.startBy) return;
    const controller = new AbortController();
    running.set(request.id, controller);
    host.activity(true);
    const startedAt = host.now();
    let reply: AgentReply;
    try {
      reply = await execute(request, controller);
    } catch (error) {
      reply = error instanceof AgentToolError
        ? { ok: false, error: { code: error.code, message: error.message } }
        : { ok: false, error: { code: "failed", message: error instanceof Error ? error.message : String(error) } };
    } finally {
      running.delete(request.id);
    }
    host.send(request.id, reply);
    host.record?.(reply.ok
      ? { tool: request.tool, startedAt, ms: host.now() - startedAt, ok: true, result: reply.result }
      : { tool: request.tool, startedAt, ms: host.now() - startedAt, ok: false, code: reply.error.code, message: reply.error.message });
  };

  return {
    dispatch(request) {
      waiting += 1;
      queue = queue.then(() => run(request)).finally(() => {
        waiting -= 1;
        if (waiting === 0) host.activity(false);
      });
      return queue;
    },
    cancel(id) {
      running.get(id)?.abort();
    },
    setPaused(value) {
      paused = value;
      if (value) for (const controller of running.values()) controller.abort();
    },
    get paused() {
      return paused;
    }
  };
}

/** Reads an optional argument of a given type; a wrong type is invalid_args. */
/** Most list items one result may carry (a 5000-box image is ~400 KB of JSON). */
export const LIST_PAGE_MAX = 5000;

/** One page of a long result list from the `offset` / `limit` arguments; `limit` 0 returns only the counts. */
export function listPage<T>(items: readonly T[], args: Record<string, unknown>, defaultLimit: number): { items: T[]; total: number; offset: number; truncated: boolean } {
  const offset = Math.max(0, Math.floor(optionalArg(args, "offset", "number") ?? 0));
  const limit = Math.min(LIST_PAGE_MAX, Math.max(0, Math.floor(optionalArg(args, "limit", "number") ?? defaultLimit)));
  return { items: items.slice(offset, offset + limit), total: items.length, offset, truncated: offset + limit < items.length };
}

export function optionalArg<T extends "string" | "number" | "boolean" | "object">(
  args: Record<string, unknown>, name: string, type: T
): (T extends "string" ? string : T extends "number" ? number : T extends "boolean" ? boolean : object) | undefined {
  const value = args[name];
  if (value === undefined || value === null) return undefined;
  if (typeof value !== type || (type === "number" && !Number.isFinite(value))) {
    throw new AgentToolError("invalid_args", `${name} must be a ${type}`);
  }
  return value as never;
}
