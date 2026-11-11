// Builds the signed Tauri installer and publishes it as a GitHub release with latest.json, the update
// feed installed apps poll (plugins.updater.endpoints in src-tauri/tauri.conf.json).
// Run on main only. The YOLOE-26 app (branch track/yoloe26) reads latest-yoloe.json from the same
// "latest" release, so the new release carries the current latest-yoloe.json over (AGENTS.md "Branches").
//
//   node scripts/release-tauri.mjs [--skip-build] [--draft] [--notes "text"]
//
// Signing key: TAURI_SIGNING_PRIVATE_KEY (key text or path), else ~/.tauri/easy-labeling-updater.key.
// A draft release does not serve the feeds; installed apps see it only once it is published.
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const notes = args.includes("--notes") ? args[args.indexOf("--notes") + 1] : "";
const run = (command, options = {}) => execSync(command, { cwd: root, stdio: "inherit", ...options });
const read = (command) => execSync(command, { cwd: root, encoding: "utf8" }).trim();

const version = JSON.parse(await readFile(join(root, "package.json"), "utf8")).version;
const tag = `v${version}`;
const repo = read("gh repo view --json nameWithOwner -q .nameWithOwner");
const commit = read("git rev-parse HEAD");

if (read("git status --porcelain --untracked-files=no -- src src-tauri workers index.html css package.json")) {
  throw new Error("Commit the app changes first: the release must match a pushed commit.");
}
if (read("git rev-parse --abbrev-ref HEAD") !== "main") throw new Error("Release Easy Labeling from main only (the YOLOE-26 app releases from track/yoloe26).");
if (!read(`git branch -r --contains ${commit}`)) throw new Error(`Push ${commit} before releasing it.`);
try {
  execSync(`gh release view ${tag}`, { cwd: root, stdio: "ignore" });
  throw new Error(`Release ${tag} already exists; bump the version first (see AGENTS.md "Versioning").`);
} catch (error) {
  if (error.message.startsWith("Release ")) throw error;
}

if (!flag("--skip-build")) {
  const key = process.env.TAURI_SIGNING_PRIVATE_KEY ?? join(os.homedir(), ".tauri", "easy-labeling-updater.key");
  if (!process.env.TAURI_SIGNING_PRIVATE_KEY && !existsSync(key)) throw new Error(`Updater signing key not found: ${key}`);
  const env = { ...process.env, TAURI_SIGNING_PRIVATE_KEY: key, TAURI_SIGNING_PRIVATE_KEY_PASSWORD: process.env.TAURI_SIGNING_PRIVATE_KEY_PASSWORD ?? "" };
  // tauri.bundle.conf.json adds the MCP server sidecar (easy-labeling-mcp.exe) to the installer.
  run("npx tauri build --config src-tauri/tauri.bundle.conf.json --config src-tauri/tauri.release.conf.json", { env });
}

// GitHub turns spaces in asset names into dots; upload a name without them so the feed URL holds.
const installer = join(root, `target/release/bundle/nsis/Easy Labeling_${version}_x64-setup.exe`);
if (!existsSync(installer) || !existsSync(`${installer}.sig`)) {
  throw new Error(`Missing signed installer ${installer}(.sig); build without --skip-build.`);
}
const staging = join(root, "target/release/github-release");
await rm(staging, { recursive: true, force: true });
await mkdir(staging, { recursive: true });
const name = `EasyLabeling_${version}_x64-setup.exe`;
await copyFile(installer, join(staging, name));
await writeFile(join(staging, "latest.json"), JSON.stringify({
  version,
  notes,
  pub_date: new Date().toISOString(),
  platforms: {
    "windows-x86_64": {
      signature: (await readFile(`${installer}.sig`, "utf8")).trim(),
      url: `https://github.com/${repo}/releases/download/${tag}/${name}`
    }
  }
}, null, 2) + "\n");

// Without this file in the new "latest" release, installed YOLOE-26 apps stop getting updates.
try {
  execSync(`gh release download --pattern latest-yoloe.json --dir "${staging}"`, { cwd: root, stdio: "ignore" });
} catch {
  throw new Error("Could not copy latest-yoloe.json from the current latest release; the YOLOE-26 app would lose its update feed.");
}

const files = [name, "latest.json", "latest-yoloe.json"].map((file) => `"${join(staging, file)}"`).join(" ");
const notesFile = join(staging, "notes.md");
await writeFile(notesFile, notes || `Easy Labeling ${version}`);
run(`gh release create ${tag} ${files} --target ${commit} --title "Easy Labeling ${version}" --notes-file "${notesFile}"${flag("--draft") ? " --draft" : ""}`);
console.log(`Released ${tag}: https://github.com/${repo}/releases/tag/${tag}`);
