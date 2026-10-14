// Builds the signed Tauri installers (standard + YOLOE-26) and publishes them as a GitHub release
// with the update feeds the installed apps poll (plugins.updater.endpoints in src-tauri/*.conf.json):
// latest.json for the standard app, latest-yoloe.json for the YOLOE-26 app.
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
const yoloeVersion = JSON.parse(await readFile(join(root, "src-tauri/tauri.yoloe.conf.json"), "utf8")).version;
const tag = `v${version}`;
const repo = read("gh repo view --json nameWithOwner -q .nameWithOwner");
const commit = read("git rev-parse HEAD");

if (read("git status --porcelain --untracked-files=no -- src src-tauri workers index.html css package.json")) {
  throw new Error("Commit the app changes first: the release must match a pushed commit.");
}
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
  run("npx tauri build --config src-tauri/tauri.release.conf.json", { env });
  run("npm run yoloe:models:record", { env });
  run("npx tauri build --config src-tauri/tauri.yoloe.conf.json --config src-tauri/tauri.release.conf.json", { env });
}

// GitHub turns spaces in asset names into dots; upload names without them so the feed URLs hold.
const bundle = join(root, "src-tauri/target/release/bundle/nsis");
const staging = join(root, "src-tauri/target/release/github-release");
await rm(staging, { recursive: true, force: true });
await mkdir(staging, { recursive: true });
const pubDate = new Date().toISOString();
const assets = [];
for (const { product, asset, feedVersion, feed } of [
  { product: "Easy Labeling", asset: "EasyLabeling", feedVersion: version, feed: "latest.json" },
  { product: "Easy Labeling YOLOE-26", asset: "EasyLabeling-YOLOE-26", feedVersion: yoloeVersion, feed: "latest-yoloe.json" }
]) {
  const installer = join(bundle, `${product}_${feedVersion}_x64-setup.exe`);
  if (!existsSync(installer) || !existsSync(`${installer}.sig`)) {
    throw new Error(`Missing signed installer ${installer}(.sig); build without --skip-build.`);
  }
  const name = `${asset}_${feedVersion}_x64-setup.exe`;
  await copyFile(installer, join(staging, name));
  await writeFile(join(staging, feed), JSON.stringify({
    version: feedVersion,
    notes,
    pub_date: pubDate,
    platforms: {
      "windows-x86_64": {
        signature: (await readFile(`${installer}.sig`, "utf8")).trim(),
        url: `https://github.com/${repo}/releases/download/${tag}/${name}`
      }
    }
  }, null, 2) + "\n");
  assets.push(name, feed);
}

const files = assets.map((name) => `"${join(staging, name)}"`).join(" ");
const notesFile = join(staging, "notes.md");
await writeFile(notesFile, notes || `Easy Labeling ${version} / YOLOE-26 ${yoloeVersion}`);
run(`gh release create ${tag} ${files} --target ${commit} --title "Easy Labeling ${version}" --notes-file "${notesFile}"${flag("--draft") ? " --draft" : ""}`);
console.log(`Released ${tag}: https://github.com/${repo}/releases/tag/${tag}`);
