// Stop hook: when shipped files changed in the working tree but package.json's version did not,
// remind once (stop_hook_active stops a second block) to bump it per AGENTS.md "Versioning".
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

let input = {};
try { input = JSON.parse(readFileSync(0, "utf8") || "{}"); } catch { process.exit(0); }
if (input.stop_hook_active) process.exit(0);

const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });

try {
  const changed = git("status", "--porcelain", "--untracked-files=all")
    .split("\n").map((line) => line.slice(3).trim().replace(/^"|"$/g, "")).filter(Boolean)
    .map((file) => file.includes(" -> ") ? file.split(" -> ")[1] : file);
  const shipped = changed.filter((file) => /^(src|workers|css|crates\/el-core|src-tauri)\//.test(file) || /^(index|privacy|privacy_ko)\.html$/.test(file));
  if (!shipped.length) process.exit(0);
  const current = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")).version;
  const committed = JSON.parse(git("show", "HEAD:package.json")).version;
  if (current !== committed) process.exit(0);
  process.stdout.write(JSON.stringify({
    decision: "block",
    reason: `Shipped files changed (${shipped.slice(0, 5).join(", ")}${shipped.length > 5 ? ", ..." : ""}) but package.json is still ${current}. `
      + "Per AGENTS.md: bump with `npm version <x.y.z> --no-git-tag-version` (patch = fix, minor = feature) and move "
      + "src-tauri/tauri.yoloe.conf.json version in step (one minor ahead, same patch). "
      + "If this change should not ship a new version (refactor, tests only, or the user said not to), say so and stop."
  }));
} catch {
  process.exit(0); // not a git checkout, or HEAD has no package.json: nothing to compare
}
