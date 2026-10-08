// PreToolUse guard: refuse edits to generated or vendored output. Fix the source instead.
import { readFileSync } from "node:fs";
import path from "node:path";

const GENERATED = {
  "dist/": "tsc output of src/ (npm run build regenerates it)",
  "vendor/": "copied from node_modules by scripts/copy-offline-assets.mjs",
  "node_modules/": "installed dependencies",
  "release/": "electron-builder output",
  "test-results/": "Playwright output",
  "output/": "local verification output (gitignored)"
};

let input = {};
try { input = JSON.parse(readFileSync(0, "utf8") || "{}"); } catch { process.exit(0); }
const file = input.tool_input?.file_path ?? input.tool_input?.notebook_path;
if (!file) process.exit(0);

const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
const relative = path.relative(root, path.resolve(root, file)).split(path.sep).join("/");
if (relative.startsWith("..")) process.exit(0);

const hit = Object.keys(GENERATED).find((prefix) => relative.startsWith(prefix));
if (hit) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: `${relative} is generated (${GENERATED[hit]}). Edit the source it comes from instead.`
    }
  }));
}
