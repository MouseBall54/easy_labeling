// Copies the files the desktop app serves into src-tauri/frontend, which ships as a bundle resource
// that WebView2 serves straight from disk (see serve_frontend in src-tauri/src/main.rs).
// Same file set as the Electron build, minus the Electron shell, the sample dataset and the
// YOLOE models: those ship as bundle resources on disk (see src-tauri/tauri.conf.json).
import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const target = join(root, "src-tauri", "frontend");
const entries = [
  "index.html", "privacy.html", "privacy_ko.html",
  "docs/YOLOE26_GPU_KO.md", "docs/YOLOE26_VALIDATION_20261004_KO.md",
  "assets", "css", "dist", "vendor", "workers", "resources"
];

await rm(target, { recursive: true, force: true });
for (const entry of entries) {
  const destination = join(target, entry);
  await mkdir(dirname(destination), { recursive: true });
  await cp(join(root, entry), destination, {
    recursive: true,
    filter: (source) => !/assets\/(models\/yoloe26|sample)(\/|$)/.test(source.replaceAll("\\", "/"))
  });
}
console.log(`Staged desktop frontend in ${target}`);
