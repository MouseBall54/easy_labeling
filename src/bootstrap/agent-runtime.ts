/**
 * Desktop app: answers easy-labeling-mcp.exe calls (docs/AGENT_MCP_PLAN_KO.md). Loaded by main.ts on the
 * first call or when the MCP panel opens. Shows "Agent working" with a Stop button while calls run; Stop
 * pauses the agent until resumed. The MCP panel (agent-panel.ts) holds the person's permissions and the log.
 */
import type { AppState } from "../app/state.js";
import { AgentToolError, createAgentDispatcher, type AgentHost, type AgentRequest, type AgentTool } from "../features/agent/agent-api.js";
import { ensureAnnotationId, isRectObject, type FabricRectLike } from "../features/canvas/fabric-types.js";
import { createAgentPanel } from "./agent-panel.js";
import { createAgentAutoTools } from "./agent-tools-auto.js";
import { createAgentEditTools } from "./agent-tools-edit.js";
import { createAgentRefineTools } from "./agent-tools-refine.js";
import { createAgentSegmentationTools } from "./agent-tools-segmentation.js";
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
  // The MCP panel's own controls are not the person working in the app.
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
  /** Folder-wide changes: the person's dialog, unless the MCP panel blocks them. */
  const confirm = async (message: string): Promise<boolean> => {
    if (panel.settings().folderChanges === "block") throw new AgentToolError("declined", "Folder-wide changes are blocked in the MCP panel.");
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
  const liveView = () => panel.settings().liveView;
  const segmentationTools = createAgentSegmentationTools({ state: deps.state, canvasController: deps.canvasController, documentRef, afterEdit: () => deps.syncAfterEdit?.(), liveView, fileSystem: deps.fileSystem, confirm });
  const dispatcher = createAgentDispatcher(withBoxReveal({ ...stateTools, ...editTools, ...refineTools, ...autoTools, ...segmentationTools }, {
    enabled: () => liveView() && deps.state.session.workflow === "detection",
    rects: () => deps.canvasController.raw.getObjects("rect").filter(isRectObject),
    render: () => deps.canvasController.raw.canvas.requestRenderAll(),
    frame: () => new Promise<void>((resolve) => (windowRef.requestAnimationFrame ? windowRef.requestAnimationFrame(() => resolve()) : setTimeout(resolve, 16)))
  }), host);
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

/**
 * Live view for Detection: boxes a tool added (found by comparing box ids before and after the call) are hidden and
 * then shown again one by one in the order they were made, 30 ms each and at most 2 s in all, before the call answers.
 * Only the drawing changes: the boxes, their undo step and the result are the same as without it.
 */
export function withBoxReveal(tools: Record<string, AgentTool>, view: {
  enabled(): boolean;
  rects(): FabricRectLike[];
  render(): void;
  frame(): Promise<void>;
}): Record<string, AgentTool> {
  return Object.fromEntries(Object.entries(tools).map(([name, tool]) => [name, !tool.changesApp ? tool : {
    ...tool,
    async run(args, context) {
      const before = view.enabled() ? new Set(view.rects().map(ensureAnnotationId)) : null;
      const result = await tool.run(args, context);
      if (!before || !view.enabled()) return result;
      const added = view.rects().filter((rect) => !before.has(ensureAnnotationId(rect)));
      if (!added.length) return result;
      const shown = added.map((rect) => rect.visible !== false);
      // The way the app hides a box: the box and its tag.
      const setVisible = (rect: FabricRectLike, visible: boolean) => { rect.visible = visible; if (rect._labelText) rect._labelText.visible = visible; };
      added.forEach((rect) => setVisible(rect, false));
      view.render();
      const frames = Math.max(1, Math.round(Math.min(2000, added.length * 30) / 16));
      const perFrame = Math.ceil(added.length / frames);
      try {
        for (let index = 0; index < added.length; index += perFrame) {
          await view.frame();
          for (let next = index; next < Math.min(added.length, index + perFrame); next += 1) setVisible(added[next]!, shown[next]!);
          view.render();
        }
      } finally {
        added.forEach((rect, index) => setVisible(rect, shown[index]!));
        view.render();
      }
      return result;
    }
  } satisfies AgentTool]));
}
