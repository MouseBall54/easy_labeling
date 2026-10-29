// PostToolUse: format an edited Rust file with the workspace rustfmt.toml. Silent when rustfmt is missing.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

let input = {};
try { input = JSON.parse(readFileSync(0, "utf8") || "{}"); } catch { process.exit(0); }
const file = input.tool_input?.file_path;
if (!file || !file.endsWith(".rs")) process.exit(0);

const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
try {
  execFileSync("rustfmt", ["--edition", "2021", path.resolve(root, file)], { cwd: root, stdio: "ignore", timeout: 20000 });
} catch {
  // Syntax errors surface in cargo check/clippy; formatting is best effort here.
}
