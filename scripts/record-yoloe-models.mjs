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
await writeFile(path.join(folder, "manifest.json"), JSON.stringify({ format: "onnx-visual-prompt-v1", models }, null, 2) + "\n");
console.log("Verified N/S/M/L ONNX files and recorded sizes for Git.");
