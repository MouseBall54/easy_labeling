/**
 * How to register easy-labeling-mcp.exe in each MCP client (the MCP panel's "Connect an agent" section and
 * docs/AGENT_MCP_GUIDE_KO.md). The server is the same for every client: stdio, no arguments. DOM-free.
 */

export type McpClientId = "claude-code" | "claude-desktop" | "cursor" | "vscode" | "windsurf" | "codex" | "gemini" | "opencode" | "lmstudio" | "other";

export interface McpClientSetup {
  id: McpClientId;
  name: string;
  /** Where the text goes: a terminal, or a settings file and how to open it. */
  where: string;
  /** What to paste (a command, JSON or TOML). */
  text: string;
  language: "shell" | "json" | "toml" | "text";
  note?: string;
}

const SERVER_NAME = "easy-labeling";
/** Folder runs and inference over a folder take minutes; clients with a tool time limit get an hour. */
const LONG_TOOL_SECONDS = 3600;

const json = (value: unknown): string => JSON.stringify(value, null, 2);
/** A TOML literal string: no escapes, so Windows backslashes stay as they are ('' cannot hold a quote). */
const tomlLiteral = (text: string): string => (text.includes("'") ? JSON.stringify(text) : `'${text}'`);

export const MCP_CLIENT_IDS: readonly McpClientId[] = ["claude-code", "claude-desktop", "cursor", "vscode", "windsurf", "codex", "gemini", "opencode", "lmstudio", "other"];

export function mcpClientSetup(client: McpClientId, serverPath: string): McpClientSetup {
  const mcpServers = { mcpServers: { [SERVER_NAME]: { command: serverPath } } };
  switch (client) {
    case "claude-code":
      return {
        id: client, name: "Claude Code", where: "Terminal (any folder)", language: "shell",
        text: `claude mcp add --scope user ${SERVER_NAME} -- "${serverPath}"`,
        note: "--scope user makes it available in every project. Check it with /mcp inside Claude Code."
      };
    case "claude-desktop":
      return {
        id: client, name: "Claude Desktop", where: "%APPDATA%\\Claude\\claude_desktop_config.json (Settings > Developer > Edit Config)",
        language: "json", text: json(mcpServers), note: "Merge into an existing mcpServers block, then restart Claude Desktop."
      };
    case "cursor":
      return { id: client, name: "Cursor", where: "%USERPROFILE%\\.cursor\\mcp.json (Settings > MCP > Add new global MCP server)", language: "json", text: json(mcpServers) };
    case "vscode":
      return {
        id: client, name: "VS Code (GitHub Copilot)", where: "Command Palette > MCP: Open User Configuration (or .vscode\\mcp.json in a workspace)",
        language: "json", text: json({ servers: { [SERVER_NAME]: { type: "stdio", command: serverPath } } }),
        note: "Use Copilot Chat in Agent mode to call the tools."
      };
    case "windsurf":
      return { id: client, name: "Windsurf", where: "%USERPROFILE%\\.codeium\\windsurf\\mcp_config.json (Cascade > MCP servers > Configure)", language: "json", text: json(mcpServers) };
    case "codex":
      return {
        id: client, name: "Codex CLI", where: "%USERPROFILE%\\.codex\\config.toml", language: "toml",
        text: `[mcp_servers.${SERVER_NAME}]\ncommand = ${tomlLiteral(serverPath)}\ntool_timeout_sec = ${LONG_TOOL_SECONDS}`,
        note: "tool_timeout_sec lets folder runs finish (the default is 60 seconds)."
      };
    case "gemini":
      return {
        id: client, name: "Gemini CLI", where: "%USERPROFILE%\\.gemini\\settings.json", language: "json",
        text: json({ mcpServers: { [SERVER_NAME]: { command: serverPath, timeout: LONG_TOOL_SECONDS * 1000 } } }),
        note: "timeout is in milliseconds."
      };
    case "opencode":
      return {
        id: client, name: "OpenCode", where: "%USERPROFILE%\\.config\\opencode\\opencode.json (global) or opencode.json in a project",
        language: "json", text: json({ $schema: "https://opencode.ai/config.json", mcp: { [SERVER_NAME]: { type: "local", command: [serverPath], enabled: true } } }),
        note: "Merge into an existing mcp block. Any model OpenCode runs that supports tool calling can use the tools."
      };
    case "lmstudio":
      return {
        id: client, name: "LM Studio (local models)", where: "LM Studio > Program tab > Install > Edit mcp.json", language: "json",
        text: json(mcpServers), note: "Pick a model that supports tool calling."
      };
    case "other":
      return {
        id: client, name: "Other MCP clients", where: "The client's MCP server settings", language: "text",
        text: `Name: ${SERVER_NAME}\nType: stdio (local command)\nCommand: ${serverPath}\nArguments: none\nEnvironment: none`,
        note: "Any MCP client works, with any model that supports tool calling. Easy Labeling must be running."
      };
  }
}
