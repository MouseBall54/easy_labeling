/**
 * The MCP panel (desktop): connection status, how to register easy-labeling-mcp.exe in each MCP client,
 * the person's permissions, and the activity list. A drawer, not a modal, so the app stays usable while open.
 */
import type { AgentActivity } from "../features/agent/agent-api.js";
import { MCP_CLIENT_IDS, mcpClientSetup, type McpClientId } from "../features/agent/client-configs.js";

type AgentBridge = NonNullable<Window["easyLabelingAgentBridge"]>;

export interface AgentSettings {
  enabled: boolean;
  allowChanges: boolean;
  /** Folder runs, class remap and inference on every image: ask in a dialog, or refuse. */
  folderChanges: "ask" | "block";
  /** Live view: show each box or region as an agent tool makes it, instead of only the finished result. */
  liveView: boolean;
}

const SETTINGS_KEY = "easy-labeling:agent-access";
const CLIENT_KEY = "easy-labeling:agent-client";
const DEFAULT_SETTINGS: AgentSettings = { enabled: true, allowChanges: true, folderChanges: "ask", liveView: false };
const ACTIVITY_LIMIT = 200;
const STATUS_POLL_MS = 2000;

/** The person's saved permissions (this PC's storage); defaults when storage is missing or unreadable. */
export function readAgentSettings(storage: Pick<Storage, "getItem"> | null | undefined): AgentSettings {
  try {
    const saved = JSON.parse(storage?.getItem(SETTINGS_KEY) ?? "null") as Partial<AgentSettings> | null;
    return {
      enabled: typeof saved?.enabled === "boolean" ? saved.enabled : DEFAULT_SETTINGS.enabled,
      allowChanges: typeof saved?.allowChanges === "boolean" ? saved.allowChanges : DEFAULT_SETTINGS.allowChanges,
      folderChanges: saved?.folderChanges === "block" ? "block" : "ask",
      liveView: saved?.liveView === true
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/** One line for the activity list: the error, or the main numbers of the result. */
export function activitySummary(activity: AgentActivity): string {
  if (!activity.ok) return `${activity.code ?? "failed"}: ${activity.message ?? ""}`;
  const result = activity.result;
  if (result === null || typeof result !== "object") return result === null || result === undefined ? "" : String(result);
  const parts: string[] = [];
  for (const [key, value] of Object.entries(result as Record<string, unknown>)) {
    if (typeof value === "number" || typeof value === "boolean" || (typeof value === "string" && value.length <= 60)) parts.push(`${key} ${value}`);
    else if (Array.isArray(value)) parts.push(`${key} ${value.length}`);
    if (parts.length === 4) break;
  }
  return parts.join(" · ");
}

/** "5 s ago", "3 min ago", ... */
export function ago(ms: number): string {
  const seconds = Math.max(0, Math.round(ms / 1000));
  if (seconds < 60) return `${seconds} s ago`;
  const minutes = Math.round(seconds / 60);
  return minutes < 60 ? `${minutes} min ago` : `${Math.round(minutes / 60)} h ago`;
}

export interface AgentPanel {
  settings(): AgentSettings;
  record(activity: AgentActivity): void;
  toggle(open?: boolean): void;
  /** Re-reads the paused state (the status bar's Stop changed it). */
  renderPause(): void;
}

export function createAgentPanel(input: {
  documentRef: Document;
  bridge: AgentBridge;
  paused(): boolean;
  setPaused(paused: boolean): void;
}): AgentPanel {
  const { documentRef, bridge } = input;
  const windowRef = documentRef.defaultView ?? window;
  const storage = (() => { try { return windowRef.localStorage; } catch { return null; } })();
  const byId = <T extends HTMLElement>(id: string): T | null => documentRef.getElementById(id) as T | null;
  const panel = byId<HTMLElement>("agentPanel");
  const railButton = byId<HTMLButtonElement>("agentPanelBtn");
  const statusLine = byId<HTMLElement>("agentStatusLine");
  const serverWarning = byId<HTMLElement>("agentServerWarning");
  const clientSelect = byId<HTMLSelectElement>("agentClientSelect");
  const clientWhere = byId<HTMLElement>("agentClientWhere");
  const clientSnippet = byId<HTMLElement>("agentClientSnippet");
  const copyStatus = byId<HTMLElement>("agentCopyStatus");
  const copyButton = byId<HTMLButtonElement>("agentCopySnippetBtn");
  const enabledToggle = byId<HTMLInputElement>("agentEnabledToggle");
  const changesToggle = byId<HTMLInputElement>("agentChangesToggle");
  const folderSelect = byId<HTMLSelectElement>("agentFolderSelect");
  const liveToggle = byId<HTMLInputElement>("agentLiveToggle");
  const pauseButton = byId<HTMLButtonElement>("agentPanelPauseBtn");
  const activityList = byId<HTMLOListElement>("agentActivityList");
  const activityEmpty = byId<HTMLElement>("agentActivityEmpty");
  const activityCount = byId<HTMLElement>("agentActivityCount");

  let settings = readAgentSettings(storage);
  let server = "";
  let pollTimer: ReturnType<typeof setInterval> | undefined;
  const activities: AgentActivity[] = [];

  const saveSettings = (): void => {
    try { storage?.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch { /* the choice still applies until the app closes */ }
  };
  const renderSettings = (): void => {
    if (enabledToggle) enabledToggle.checked = settings.enabled;
    if (changesToggle) { changesToggle.checked = settings.allowChanges; changesToggle.disabled = !settings.enabled; }
    if (folderSelect) { folderSelect.value = settings.folderChanges; folderSelect.disabled = !settings.enabled || !settings.allowChanges; }
    if (liveToggle) liveToggle.checked = settings.liveView;
  };
  const renderPause = (): void => {
    if (!pauseButton) return;
    const paused = input.paused();
    pauseButton.textContent = paused ? "Resume" : "Stop";
    pauseButton.className = `btn btn-sm ${paused ? "btn-outline-success" : "btn-outline-danger"}`;
    pauseButton.title = paused ? "Let the agent change the app again" : "Cancel the agent's current call and refuse changes until resumed";
  };

  const renderClient = (): void => {
    const id = (clientSelect?.value as McpClientId | undefined) ?? "claude-code";
    const setup = mcpClientSetup(id, server || "<path to easy-labeling-mcp.exe>");
    if (clientWhere) { clientWhere.textContent = setup.where; clientWhere.title = setup.note ?? ""; }
    if (clientSnippet) { clientSnippet.textContent = setup.text; clientSnippet.dataset.language = setup.language; }
    showCopied(false);
  };
  if (clientSelect && !clientSelect.options.length) {
    for (const id of MCP_CLIENT_IDS) clientSelect.add(new Option(mcpClientSetup(id, "").name, id));
    let saved: string | null = null;
    try { saved = storage?.getItem(CLIENT_KEY) ?? null; } catch { /* default client */ }
    if (saved && (MCP_CLIENT_IDS as readonly string[]).includes(saved)) clientSelect.value = saved;
  }

  function showCopied(copied: boolean, message = ""): void {
    if (copyStatus) copyStatus.textContent = message;
    copyButton?.querySelector("i")?.setAttribute("class", `bi ${copied ? "bi-check2" : "bi-clipboard"}`);
  }
  const copy = async (text: string): Promise<void> => {
    try {
      await windowRef.navigator.clipboard.writeText(text);
      showCopied(true, "Copied.");
    } catch {
      showCopied(false, "Copy failed; select the text and copy it.");
    }
  };

  const refreshStatus = async (): Promise<void> => {
    let status: Record<string, unknown>;
    try {
      status = await bridge.status();
    } catch (error) {
      if (statusLine) { statusLine.dataset.state = "error"; statusLine.textContent = `Status unavailable: ${String(error)}`; }
      return;
    }
    const path = typeof status.serverPath === "string" ? status.serverPath : "";
    if (path !== server) { server = path; renderClient(); }
    if (serverWarning) serverWarning.hidden = status.serverFound === true;
    if (statusLine) {
      // One line: the state and the last call; the details sit in the tooltip.
      const error = typeof status.pipeError === "string" ? status.pipeError : "";
      const last = status.lastCall as { tool?: string; client?: { name?: string; version?: string } | null; at?: number } | null;
      const now = typeof status.now === "number" ? status.now : Date.now();
      const client = last?.client?.name ? `${last.client.name}${last.client.version ? ` ${last.client.version}` : ""}` : "";
      statusLine.dataset.state = error ? "error" : status.listening ? "listening" : "checking";
      statusLine.textContent = error || (!status.listening ? "Starting…" : last?.at ? `${client || "Connected"} · ${last.tool ?? "?"} ${ago(now - last.at)}` : "Waiting for an MCP client");
      statusLine.title = [`App ${String(status.appVersion)} · protocol ${String(status.protocol)}`, `${String(status.calls)} call${status.calls === 1 ? "" : "s"} since the app started`, path].filter(Boolean).join("\n");
    }
  };

  const renderActivity = (): void => {
    if (!activityList) return;
    activityList.replaceChildren(...activities.map((activity) => {
      const item = documentRef.createElement("li");
      item.dataset.ok = String(activity.ok);
      const time = documentRef.createElement("span");
      time.textContent = new Date(activity.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
      const tool = documentRef.createElement("span");
      tool.className = "agent-activity-tool";
      tool.textContent = activity.tool;
      const result = documentRef.createElement("span");
      result.className = "agent-activity-result";
      result.textContent = `${activity.ok ? "ok" : activity.code ?? "failed"} · ${activity.ms} ms`;
      item.title = activitySummary(activity);
      item.append(time, tool, result);
      return item;
    }));
    if (activityEmpty) activityEmpty.hidden = activities.length > 0;
    if (activityCount) activityCount.textContent = activities.length ? String(activities.length) : "";
  };

  const toggle = (open = Boolean(panel?.hidden)): void => {
    if (!panel) return;
    panel.hidden = !open;
    railButton?.setAttribute("aria-pressed", String(open));
    railButton?.classList.toggle("active", open);
    clearInterval(pollTimer);
    if (open) {
      renderSettings();
      renderPause();
      renderClient();
      renderActivity();
      void refreshStatus();
      pollTimer = setInterval(() => { void refreshStatus(); }, STATUS_POLL_MS);
    }
  };

  byId("agentPanelCloseBtn")?.addEventListener("click", () => toggle(false));
  clientSelect?.addEventListener("change", () => {
    try { storage?.setItem(CLIENT_KEY, clientSelect.value); } catch { /* not remembered */ }
    renderClient();
  });
  copyButton?.addEventListener("click", () => { void copy(clientSnippet?.textContent ?? ""); });
  enabledToggle?.addEventListener("change", () => { settings = { ...settings, enabled: enabledToggle.checked }; saveSettings(); renderSettings(); });
  changesToggle?.addEventListener("change", () => { settings = { ...settings, allowChanges: changesToggle.checked }; saveSettings(); renderSettings(); });
  liveToggle?.addEventListener("change", () => { settings = { ...settings, liveView: liveToggle.checked }; saveSettings(); });
  folderSelect?.addEventListener("change", () => { settings = { ...settings, folderChanges: folderSelect.value === "block" ? "block" : "ask" }; saveSettings(); });
  pauseButton?.addEventListener("click", () => { input.setPaused(!input.paused()); renderPause(); });
  byId("agentClearActivityBtn")?.addEventListener("click", () => { activities.length = 0; renderActivity(); });

  return {
    settings: () => settings,
    record(activity) {
      activities.unshift(activity);
      activities.length = Math.min(activities.length, ACTIVITY_LIMIT);
      if (panel && !panel.hidden) { renderActivity(); void refreshStatus(); }
    },
    toggle,
    renderPause
  };
}
