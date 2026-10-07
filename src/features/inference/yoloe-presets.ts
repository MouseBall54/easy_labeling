import { decodeYoloeMask, type VisualExample } from "./yoloe.js";
import type { WorkflowType } from "../../types/labels.js";
import { listFileHandles } from "../../platform/file-system-access.js";
import type { DirectoryHandleLike } from "../../types/files.js";

export interface YoloePreset {
  version: 1;
  engine: "yoloe26";
  workflow: WorkflowType;
  settings: { model: string; imgsz: number; confidence: number; iou: number; name: string; sampleName: string;
    shape: string; radius: number; autoFill: boolean; paintTool: "brush" | "erase" };
  references: { name: string; image: string; examples: VisualExample[] }[];
}

export function parseYoloePreset(contents: string): YoloePreset {
  const preset = JSON.parse(contents) as YoloePreset;
  const s = preset?.settings;
  if (preset?.version !== 1 || preset.engine !== "yoloe26" || !["detection", "segmentation"].includes(preset.workflow)
    || !s || !/^yoloe-26[nsml]-seg$/.test(s.model) || ![640, 1024, 2048].includes(s.imgsz)
    || ![s.confidence, s.iou].every((v) => Number.isFinite(v) && v >= 0 && v <= 1)
    || typeof s.name !== "string" || !/^[\p{L}\p{N}_-]{1,64}$/u.test(s.name)
    || typeof s.sampleName !== "string" || s.sampleName.length > 64
    || !["box", "mask", "brush"].includes(s.shape) || !Number.isInteger(s.radius) || s.radius < 1 || s.radius > 128
    || typeof s.autoFill !== "boolean" || !["brush", "erase"].includes(s.paintTool)
    || !Array.isArray(preset.references) || !preset.references.length || preset.references.length > 32) throw new Error("Invalid YOLOE preset settings.");
  let count = 0;
  const names = new Set<string>();
  for (const reference of preset.references) {
    if (!reference || typeof reference.name !== "string" || !reference.name || names.has(reference.name)
      || typeof reference.image !== "string" || !reference.image.startsWith("data:image/png;base64,")
      || !Array.isArray(reference.examples) || !reference.examples.length) throw new Error("Invalid YOLOE reference image.");
    names.add(reference.name);
    for (const example of reference.examples) {
      count++;
      if (!example || !Number.isSafeInteger(example.classId) || example.classId < (preset.workflow === "segmentation" ? 1 : 0)
        || preset.workflow === "segmentation" && example.classId > 65535
        || typeof example.name !== "string" || !example.name.trim() || example.name.length > 64
        || !Array.isArray(example.box) || example.box.length !== 4 || !example.box.every(Number.isFinite)
        || example.box[0] < 0 || example.box[1] < 0 || example.box[2] <= example.box[0] || example.box[3] <= example.box[1]) throw new Error("Invalid YOLOE sample.");
      if (example.polygon && (!Array.isArray(example.polygon) || example.polygon.length < 3
        || !example.polygon.every((p) => Array.isArray(p) && p.length === 2 && p.every(Number.isFinite)))) throw new Error("Invalid YOLOE polygon.");
      if (example.mask) {
        decodeYoloeMask(example.mask);
        if (example.mask.runs.some((value, i) => i % 2 === 0 && value > 1)) throw new Error("Sample masks must be binary.");
      }
    }
  }
  if (count > 32) throw new Error("Use at most 32 samples.");
  return preset;
}

async function browserPresets(): Promise<FileSystemDirectoryHandle> {
  return (await navigator.storage.getDirectory()).getDirectoryHandle("yoloe-presets", { create: true });
}

export async function listYoloePresets(windowRef: Window): Promise<EasyLabelingLibraryFile[]> {
  if (windowRef.listEasyLabelingLibraryFiles) return windowRef.listEasyLabelingLibraryFiles("yoloe");
  const files: EasyLabelingLibraryFile[] = [];
  for (const handle of await listFileHandles(await browserPresets() as unknown as DirectoryHandleLike)) if (handle.name.endsWith(".json")) {
    files.push({ name: handle.name, filePath: handle.name, contents: await (await handle.getFile()).text() });
  }
  return files.sort((a, b) => a.name.localeCompare(b.name));
}

export async function saveYoloePreset(windowRef: Window, preset: YoloePreset, saveAs: boolean, filePath?: string): Promise<string | null> {
  const contents = JSON.stringify(preset, null, 2), suggestedName = `${preset.settings.name}-${preset.workflow}.yoloe.json`;
  parseYoloePreset(contents);
  if (windowRef.saveEasyLabelingLibraryFile) return (await windowRef.saveEasyLabelingLibraryFile({ kind: "yoloe", suggestedName, contents, saveAs, ...(filePath ? { filePath } : {}) }))?.filePath ?? null;
  if (saveAs) {
    const url = URL.createObjectURL(new Blob([contents], { type: "application/json" }));
    const link = windowRef.document.createElement("a"); link.href = url; link.download = suggestedName; link.click(); URL.revokeObjectURL(url);
    return suggestedName;
  }
  const handle = await (await browserPresets()).getFileHandle(filePath ?? suggestedName, { create: true });
  const writable = await handle.createWritable(); await writable.write(contents); await writable.close();
  return handle.name;
}
