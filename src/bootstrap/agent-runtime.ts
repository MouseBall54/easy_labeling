/**
 * Desktop app: answers easy-labeling-mcp.exe calls (docs/AGENT_MCP_PLAN_KO.md). Loaded by main.ts on the
 * first call or when the Agent panel opens. Shows "Agent working" with a Stop button while calls run; Stop
 * pauses the agent until resumed. The Agent panel (agent-panel.ts) holds the person's permissions and the log.
 */
import type { AppState } from "../app/state.js";
import { AgentToolError, createAgentDispatcher, type AgentHost, type AgentRequest } from "../features/agent/agent-api.js";
import { createAgentPanel } from "./agent-panel.js";
import { createAgentAutoTools } from "./agent-tools-auto.js";
import { createAgentEditTools } from "./agent-tools-edit.js";
import { createAgentRefineTools } from "./agent-tools-refine.js";
import { createAgentStateTools } from "./agent-tools-state.js";
import type { RuntimeCanvasController } from "./canvas-controller-adapter.js";
import type { RuntimeFileSystem } from "./file-system-adapter.js";
import type { AutomationAgentApi } from "./automation-controller.js";
import type { InferenceAgentApi } from "./inference-controller.js";
import type { RefineAgentApi } from "./refine-controller.js";

type AgentBridge = NonNullable<Window["easyLabelingAgentBridge"]>;

export interface AgentRuntimeDeps {
  state: AppState;
  canvasController: RuntimeCanvasController;
  fileSystem: RuntimeFileSystem;
  documentRef: Document;
  bridge: AgentBridge;
  openImageFolder?(folder: Promise<FileSystemDirectoryHandle>): Promise<void>;
  /** Refreshes the label list, toolbar and inspector after an edit (EventManager.syncAfterEdit). */
  syncAfterEdit?(): void;
  /** Refine's pane actions (RuntimeEventManager.refineAgent). */
  refineAgent?(): RefineAgentApi | null;
  /** Automation presets and the Inference panel (RuntimeEventManager). */
  automationAgent?(): AutomationAgentApi | null;
  inferenceAgent?(): InferenceAgentApi | null;
}

export interface AgentRuntime {
  dispatch(request: AgentRequest): Promise<void>;
  cancel(id: string): void;
  togglePanel(open?: boolean): void;
}

/** How long "Agent working" stays after the last call, so quick calls do not flicker. */
const INDICATOR_LINGER_MS = 800;

/** Why the person is busy in the app, or null: calls that change the app wait until they are done. */
export function personBusyReason(documentRef: Document, canvasController: RuntimeCanvasController, pointerDown: boolean): string | null {
  if (documentRef.querySelector(".modal.show, dialog[open]")) return "A dialog is open in the app.";
  const active = documentRef.activeElement;
  // The Agent panel's own controls are not the person working in the app.
  if (active instanceof HTMLElement && !active.closest("#agentPanel") && (active.matches("input:not([type=checkbox]):not([type=radio]):not([type=range]), textarea, select") || active.isContentEditable)) {
    return "The person is typing in the app.";
  }
  const canvas = canvasController.raw.canvas;
  if (pointerDown || canvas._currentTransform || canvas.isDragging) return "The person is drawing or dragging on the canvas.";
  const operation = documentRef.getElementById("activeOperationPanel");
  if ((operation && !operation.hidden) || documentRef.querySelector("[aria-busy='true']")) return "The app is busy with another operation.";
  return null;
}

export function startAgentRuntime(deps: AgentRuntimeDeps): AgentRuntime {
  const { documentRef, bridge } = deps;
  const windowRef = documentRef.defaultView ?? window;
  let pointerDown = false;
  windowRef.addEventListener("pointerdown", () => { pointerDown = true; }, true);
  windowRef.addEventListener("pointerup", () => { pointerDown = false; }, true);
  windowRef.addEventListener("pointercancel", () => { pointerDown = false; }, true);
  const busyReason = (): string | null => personBusyReason(documentRef, deps.canvasController, pointerDown);

  const indicator = documentRef.getElementById("agentIndicator");
  const label = documentRef.getElementById("agentIndicatorText");
  const toggle = documentRef.getElementById("agentPauseBtn") as HTMLButtonElement | null;
  let hideTimer: ReturnType<typeof setTimeout> | undefined;
  let working = false;
  const render = (): void => {
    panel.renderPause();
    if (!indicator || !label || !toggle) return;
    const paused = dispatcher.paused;
    indicator.hidden = !working && !paused;
    indicator.dataset.state = paused ? "paused" : "working";
    label.textContent = paused ? "Agent paused" : "Agent working…";
    toggle.textContent = paused ? "Resume" : "Stop";
    toggle.title = paused ? "Let the AI agent change the app again" : "Stop the AI agent: cancel its current call and refuse changes until resumed";
  };

  const panel = createAgentPanel({
    documentRef,
    bridge,
    paused: () => dispatcher.paused,
    setPaused: (paused) => { dispatcher.setPaused(paused); render(); }
  });
  /** Folder-wide changes: the person's dialog, unless the Agent panel blocks them. */
  const confirm = async (message: string): Promise<boolean> => {
    if (panel.settings().folderChanges === "block") throw new AgentToolError("declined", "Folder-wide changes are blocked in the Agent panel.");
    return bridge.confirm(message);
  };

  const host: AgentHost = {
    now: () => Date.now(),
    busyReason,
    access: () => panel.settings(),
    record: (activity) => panel.record(activity),
    send(id, reply) {
      const sent = reply.ok && reply.png
        ? bridge.replyBytes(id, reply.result, reply.png)
        : bridge.reply(id, reply.ok, reply.ok ? reply.result : null, reply.ok ? null : reply.error);
      sent.catch((error: unknown) => console.warn("Agent reply failed", error));
    },
    progress(id, done, total, message) {
      bridge.progress(id, done, total, message).catch(() => undefined);
    },
    activity(active) {
      clearTimeout(hideTimer);
      if (active) {
        working = true;
        render();
      } else {
        hideTimer = setTimeout(() => {
          working = false;
          render();
        }, INDICATOR_LINGER_MS);
      }
    }
  };

  const stateTools = createAgentStateTools({
    state: deps.state,
    canvasController: deps.canvasController,
    fileSystem: deps.fileSystem,
    documentRef,
    openImageFolder: deps.openImageFolder,
    directory: (entry) => bridge.directory(entry),
    pathOf: (handle) => bridge.pathOf(handle),
    busyReason,
    paused: () => dispatcher.paused
  });
  const editTools = createAgentEditTools({
    state: deps.state,
    canvasController: deps.canvasController,
    fileSystem: deps.fileSystem,
    afterEdit: () => deps.syncAfterEdit?.()
  });
  const refineTools = createAgentRefineTools({
    state: deps.state,
    fileSystem: deps.fileSystem,
    documentRef,
    refine: () => deps.refineAgent?.() ?? null,
    confirm,
    afterEdit: () => deps.syncAfterEdit?.()
  });
  const autoTools = createAgentAutoTools({
    state: deps.state,
    canvasController: deps.canvasController,
    automation: () => deps.automationAgent?.() ?? null,
    inference: () => deps.inferenceAgent?.() ?? null,
    file: (entry) => bridge.file(entry),
    confirm,
    afterEdit: () => deps.syncAfterEdit?.()
  });
  const dispatcher = createAgentDispatcher({ ...stateTools, ...editTools, ...refineTools, ...autoTools }, host);
  toggle?.addEventListener("click", () => {
    dispatcher.setPaused(!dispatcher.paused);
    render();
  });
  label?.addEventListener("click", () => panel.toggle(true));
  return {
    dispatch: (request) => dispatcher.dispatch(request),
    cancel: (id) => dispatcher.cancel(id),
    togglePanel: (open) => panel.toggle(open)
  };
}
