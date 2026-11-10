import { readFile, stat, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

const folder = path.resolve(import.meta.dirname, "../assets/models/yoloe26");
const models = [];
for (const size of "nsml") {
  const manifest = JSON.parse(await readFile(path.join(folder, size, "manifest.json"), "utf8"));
  for (const file of manifest.files) {
    const filename = path.join(folder, size, file.file);
    const hash = createHash("sha256").update(await readFile(filename)).digest("hex");
    if ((await stat(filename)).size !== file.bytes || hash !== file.sha256) throw new Error(`ONNX model changed without re-exporting: ${filename}`);
  }
  models.push({ model: manifest.model, size, bytes: manifest.files.reduce((sum, file) => sum + file.bytes, 0) });
}
// Keep the checked-out line endings (CRLF on Windows) so a build leaves the tracked file unchanged.
const target = path.join(folder, "manifest.json");
const previous = await readFile(target, "utf8").catch(() => "");
const text = JSON.stringify({ format: "onnx-visual-prompt-v1", models }, null, 2) + "\n";
await writeFile(target, previous.includes("\r\n") ? text.replace(/\n/g, "\r\n") : text);
console.log("Verified N/S/M/L ONNX files and recorded sizes for Git.");
