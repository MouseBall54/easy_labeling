import { describe, expect, it } from "vitest";
import { MCP_CLIENT_IDS, mcpClientSetup } from "../../../../src/features/agent/client-configs.js";

const server = "C:\\Users\\kim\\AppData\\Local\\Easy Labeling\\easy-labeling-mcp.exe";

describe("MCP client setups", () => {
  it("covers every client with the server path, in a form each client parses", () => {
    for (const id of MCP_CLIENT_IDS) {
      const setup = mcpClientSetup(id, server);
      expect(setup.id).toBe(id);
      expect(setup.where.length).toBeGreaterThan(5);
      if (setup.language === "json") {
        const parsed = JSON.parse(setup.text) as Record<string, Record<string, { command: string | string[] }>>;
        const servers = parsed.mcpServers ?? parsed.servers ?? parsed.mcp;
        expect([servers["easy-labeling"].command].flat()).toEqual([server]);
      } else {
        expect(setup.text).toContain(server);
      }
    }
  });

  it("uses each client's own shape and long-run time limits", () => {
    expect(mcpClientSetup("claude-code", server).text).toBe(`claude mcp add --scope user easy-labeling -- "${server}"`);
    expect(JSON.parse(mcpClientSetup("vscode", server).text)).toEqual({ servers: { "easy-labeling": { type: "stdio", command: server } } });
    expect(JSON.parse(mcpClientSetup("gemini", server).text).mcpServers["easy-labeling"].timeout).toBe(3_600_000);
    expect(JSON.parse(mcpClientSetup("opencode", server).text).mcp["easy-labeling"]).toEqual({ type: "local", command: [server], enabled: true });
    expect(mcpClientSetup("opencode", server).where).toContain("%USERPROFILE%\\.config\\opencode\\opencode.json");
    expect(mcpClientSetup("codex", server).text).toBe(`[mcp_servers.easy-labeling]\ncommand = '${server}'\ntool_timeout_sec = 3600`);
    // A TOML literal string cannot hold a quote; fall back to an escaped basic string.
    expect(mcpClientSetup("codex", "C:\\it's\\mcp.exe").text).toContain('command = "C:\\\\it\'s\\\\mcp.exe"');
  });
});
