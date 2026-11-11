---
name: agent-integration
description: >
  Use when working on easy_labeling's AI agent bridge (MCP): adding or changing an agent tool, the
  easy-labeling-mcp.exe server (crates/el-mcp), the named-pipe protocol (crates/el-agent-protocol), the
  app side (src-tauri/src/agent.rs, src/bootstrap/agent-*.ts, src/features/agent/agent-api.ts), the
  approval dialogs, busy/Stop rules, the MCP sidecar in the installer, or tests/e2e/agent-desktop.spec.ts.
---

# Agent bridge (MCP)

User guide: `docs/AGENT_MCP_GUIDE_KO.md`. Plan, decisions (D1-D9) and per-stage results: `docs/AGENT_MCP_PLAN_KO.md`.

## Path of one call

```
agent --stdio MCP--> easy-labeling-mcp.exe (crates/el-mcp: schema, forward, PNG -> image content)
      --named pipe frames--> src-tauri/src/agent.rs (prepare: approvals, path checks; eval; time limits)
      --eval window.__easyLabelingAgent.dispatch--> src/main.ts (lazy import) -> bootstrap/agent-runtime.ts
      -> features/agent/agent-api.ts (serial queue, startBy, busy, Stop) -> bootstrap/agent-tools-*.ts
      -> the controllers' own functions (the same ones the buttons call)
      --invoke agent_reply / agent_reply_bytes / agent_progress--> back the same way
```

- The page is the only place with app logic. `el-mcp` forwards; `agent.rs` only checks paths, asks the person, and times out.
- Tools call what the app's buttons call. When a button handler holds the logic, move it into a function the button and the agent both call and give it a return value (see `RefineAgentApi`, `AutomationAgentApi`, `InferenceAgentApi`, `EventManager.openImageFolder`); keep the button's behaviour byte-for-byte and prove it with that area's existing e2e.
- A page call never opens `confirm`/`alert`/`prompt`: WebView2 dialogs stall the page and the call times out. Ask the person through `agent_confirm` (`easyLabelingAgentBridge.confirm`, a native rfd dialog) and pass that function into the code that used `windowRef.confirm`.
- One tool call is one undo step. Several edits in one call go through `runAsOneHistoryStep`; after an edit call `afterEdit()` (`EventManager.syncAfterEdit`) so the label list and undo buttons follow.
- The person's controls live in the Agent panel (`src/bootstrap/agent-panel.ts`, `#agentPanel`, opened from the rail's `Agent` button or the status-bar indicator): permissions reach the dispatcher as `host.access()` (agents off / read-only) and the `confirm` wrapper (folder-wide changes blocked); every finished call reaches `host.record()` for the activity list. Connection status comes from `agent_status` (pipe state, last call and the MCP client's `clientInfo`, which `el-mcp` sends in `hello`).

## Every MCP client, not only Claude

- `portable_schema()` in `el-mcp` rewrites each tool's input schema to plain JSON Schema (no `$ref`/`$defs`/`$schema`/`format`, one `type` per field, untyped values as `string`) because Gemini and OpenAI-compatible clients refuse the rest; `schemas_are_plain_enough_for_every_client` checks all tools. A field the page reads as text or number (class ids) stays `serde_json::Value` in Rust and is described as a string.
- Long calls send a progress heartbeat every 15 s when the client gave a progress token (clients with a tool time limit extend it on progress).
- Registration snippets per client (Claude Code, Claude Desktop, Cursor, VS Code, Windsurf, Codex, Gemini CLI, OpenCode, LM Studio, other) come from `src/features/agent/client-configs.ts`; keep `docs/AGENT_MCP_GUIDE_KO.md`'s table in step with it.

- Keep results small: SEM images hold thousands of boxes. A tool that returns a box list pages it with `listPage(items, args, defaultLimit)` (`agent-api.ts`; `offset`/`limit`, max 5000, 0 = counts only) and always returns the totals; a tool that changes boxes offers `dryRun` when the app can compute the result without applying it.
- `portable_schema()` also flattens `anyOf: [{$ref}, {type: null}]` (an `Option<Struct>` argument such as `region`).

## Adding a tool

1. Page: add it to the matching `src/bootstrap/agent-tools-*.ts` (`state`, `edit`, `refine`, `auto`) as `{ changesApp, run(args, { signal, progress }) }`. `changesApp: true` for anything that changes what the app shows or holds (refused while the person is busy or paused). Read arguments with `optionalArg`, `checkBox`, `checkClassId`; throw `AgentToolError(code, message)` with a code from `AgentErrorCode` (`not_found`, `invalid_args`, `busy`, `declined`, ...). Return plain JSON, or `AgentImageResult` for a PNG.
2. Server: add an args struct (`#[serde(rename_all = "camelCase")]`, `schemars` descriptions written for the model) and a `#[tool]` method that calls `forward("<name>", ...)` to the matching router in `crates/el-mcp/src/main.rs`. Routers are combined in `EasyLabeling::new()`; `#[tool_handler(router = self.tool_router)]` must stay (the default reads only the first router). Add the name to the test list there. An `Option` that must stay "omitted" rather than `null` needs `skip_serializing_if`.
3. Rust side, only if needed: a path check or approval in `prepare()`, a time limit in `time_limit()` (the default is 30 s; long work there or progress).
4. Tests: a unit test next to the tool file (fake controller APIs), and a step in `tests/e2e/agent-desktop.spec.ts` that calls it through the real exe and checks the app with `__easyLabelingTestApi` or the files.

## Seams and checks

- `EASY_LABELING_AGENT_PIPE` picks the pipe for both the app and the server; the desktop e2e fixture gives every test app its own. `EASY_LABELING_TEST_AGENT_APPROVE=accept|decline` answers the approval dialogs.
- Build: `npm run tauri:dev` (app) and `cargo build -p el-mcp` (server, `target/debug/easy-labeling-mcp.exe`), then `npx playwright test tests/e2e/agent-desktop.spec.ts --project=chromium`. If `tauri:dev` cannot rename the exe (a running debug app holds it), run the specs with `EASY_LABELING_TAURI_EXE=target/debug/easy-labeling.exe`.
- `cargo clippy -p easy-labeling -p el-agent-protocol -p el-mcp --all-targets -- -D warnings` and `cargo test -p el-agent-protocol -p el-mcp` (Windows only: named pipes; CI runs them in the `desktop` job).
- Installer: `src-tauri/tauri.bundle.conf.json` adds the sidecar (`bundle.externalBin`) and stages it with `scripts/stage-mcp-sidecar.mjs`; `tauri:dist:win` and `release:tauri` pass it. The base `tauri.conf.json` has no sidecar, so `tauri:dev`, clippy and CI need no prebuilt server.
- A real agent check without touching the person's setup: start the app with the pipe and approve seams set, write an MCP config pointing at the server with the same `EASY_LABELING_AGENT_PIPE`, and run `claude -p --strict-mcp-config --mcp-config <file> --allowedTools ...`.
