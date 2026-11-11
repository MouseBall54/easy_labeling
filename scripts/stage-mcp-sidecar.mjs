// Builds easy-labeling-mcp.exe (crates/el-mcp, the MCP server AI agents start) and stages it where the
// installer build looks for its sidecar: src-tauri/binaries/easy-labeling-mcp-<target triple>.exe
// (bundle.externalBin in src-tauri/tauri.bundle.conf.json). The installer puts it next to Easy Labeling.exe.
import { execSync } from "node:child_process";
import { copyFile, mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const triple = execSync("rustc --print host-tuple", { cwd: root, encoding: "utf8" }).trim();
execSync("cargo build --release -p el-mcp", { cwd: root, stdio: "inherit" });
const target = join(root, "src-tauri", "binaries", `easy-labeling-mcp-${triple}.exe`);
await mkdir(dirname(target), { recursive: true });
await copyFile(join(root, "target", "release", "easy-labeling-mcp.exe"), target);
console.log(`Staged MCP sidecar ${target}`);
