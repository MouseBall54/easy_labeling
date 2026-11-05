// Builds the signed YOLOE-26 installer on track/yoloe26 and publishes it without taking over the
// repo's "latest" release (that one belongs to Easy Labeling from main, see AGENTS.md "Branches"):
//   1. creates release yoloe-v<version> (not marked latest) with the installer and latest-yoloe.json;
//   2. replaces latest-yoloe.json on the current latest release, the feed installed YOLOE apps poll
//      (plugins.updater.endpoints in src-tauri/tauri.yoloe.conf.json).
//
//   node scripts/release-yoloe.mjs [--skip-build] [--notes "text"]
//
// Before a release: git merge main, npm version <main's version>, tauri.yoloe.conf.json one minor above
// (tests/unit/release/version-pairing.test.ts), checks, commit, push.
// Signing key: TAURI_SIGNING_PRIVATE_KEY (key text or path), else ~/.tauri/easy-labeling-updater.key.
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const notes = args.includes("--notes") ? args[args.indexOf("--notes") + 1] : "";
const run = (command, options = {}) => execSync(command, { cwd: root, stdio: "inherit", ...options });
const read = (command) => execSync(command, { cwd: root, encoding: "utf8" }).trim();

const version = JSON.parse(await readFile(join(root, "src-tauri/tauri.yoloe.conf.json"), "utf8")).version;
const tag = `yoloe-v${version}`;
const repo = read("gh repo view --json nameWithOwner -q .nameWithOwner");
const commit = read("git rev-parse HEAD");

if (read("git rev-parse --abbrev-ref HEAD") !== "track/yoloe26") throw new Error("Release the YOLOE-26 app from track/yoloe26 only.");
if (read("git status --porcelain --untracked-files=no -- src src-tauri workers index.html css package.json assets")) {
  throw new Error("Commit the app changes first: the release must match a pushed commit.");
}
if (!read(`git branch -r --contains ${commit}`)) throw new Error(`Push ${commit} before releasing it.`);
const exists = (name) => {
  try {
    execSync(`gh release view ${name}`, { cwd: root, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
};
if (exists(tag)) throw new Error(`Release ${tag} already exists; bump the version first.`);
const latest = read("gh release view --json tagName -q .tagName");

if (!args.includes("--skip-build")) {
  const key = process.env.TAURI_SIGNING_PRIVATE_KEY ?? join(os.homedir(), ".tauri", "easy-labeling-updater.key");
  if (!process.env.TAURI_SIGNING_PRIVATE_KEY && !existsSync(key)) throw new Error(`Updater signing key not found: ${key}`);
  const env = { ...process.env, TAURI_SIGNING_PRIVATE_KEY: key, TAURI_SIGNING_PRIVATE_KEY_PASSWORD: process.env.TAURI_SIGNING_PRIVATE_KEY_PASSWORD ?? "" };
  run("npm run yoloe:models:record", { env });
  run("npx tauri build --config src-tauri/tauri.yoloe.conf.json --config src-tauri/tauri.release.conf.json", { env });
}

// GitHub turns spaces in asset names into dots; upload a name without them so the feed URL holds.
const installer = join(root, `target/release/bundle/nsis/Easy Labeling YOLOE-26_${version}_x64-setup.exe`);
if (!existsSync(installer) || !existsSync(`${installer}.sig`)) {
  throw new Error(`Missing signed installer ${installer}(.sig); build without --skip-build.`);
}
const staging = join(root, "target/release/github-release-yoloe");
await rm(staging, { recursive: true, force: true });
await mkdir(staging, { recursive: true });
const name = `EasyLabeling-YOLOE-26_${version}_x64-setup.exe`;
await copyFile(installer, join(staging, name));
const feed = join(staging, "latest-yoloe.json");
await writeFile(feed, JSON.stringify({
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

const notesFile = join(staging, "notes.md");
await writeFile(notesFile, notes || `Easy Labeling YOLOE-26 ${version}`);
run(`gh release create ${tag} "${join(staging, name)}" "${feed}" --target ${commit} --latest=false --title "Easy Labeling YOLOE-26 ${version}" --notes-file "${notesFile}"`);
run(`gh release upload ${latest} "${feed}" --clobber`);
console.log(`Released ${tag}: https://github.com/${repo}/releases/tag/${tag} (feed updated on ${latest})`);
