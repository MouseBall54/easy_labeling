import { intersectionOverUnion, type Detection, type getLetterbox } from "./yolo.js";

export interface YoloeCandidate extends Detection { anchor: number; }

export function decodeYoloePredictions(data: Float32Array, dims: readonly number[], classIds: readonly number[],
  letterbox: ReturnType<typeof getLetterbox>, confidence: number, iou: number): YoloeCandidate[] {
  if (dims.length !== 3 || dims[0] !== 1 || dims[1] !== 4 + classIds.length + 32 || data.length !== dims[1] * dims[2]!) {
    throw new Error("YOLOE ONNX prediction shape does not match the registered samples.");
  }
  const anchors = dims[2]!, candidates: YoloeCandidate[] = [];
  const x = (value: number): number => Math.max(0, Math.min(letterbox.width, (value - letterbox.left) / letterbox.scale));
  const y = (value: number): number => Math.max(0, Math.min(letterbox.height, (value - letterbox.top) / letterbox.scale));
  for (let anchor = 0; anchor < anchors; anchor++) {
    let score = -Infinity, index = 0;
    for (let c = 0; c < classIds.length; c++) {
      const value = data[(4 + c) * anchors + anchor]!;
      if (value > score) { score = value; index = c; }
    }
    if (!Number.isFinite(score) || score < confidence) continue;
    const cx = data[anchor]!, cy = data[anchors + anchor]!, w = data[2 * anchors + anchor]!, h = data[3 * anchors + anchor]!;
    const candidate = { anchor, classId: classIds[index]!, confidence: score,
      left: x(cx - w / 2), top: y(cy - h / 2), right: x(cx + w / 2), bottom: y(cy + h / 2) };
    if (candidate.right > candidate.left && candidate.bottom > candidate.top) candidates.push(candidate);
  }
  candidates.sort((a, b) => b.confidence - a.confidence);
  const selected: YoloeCandidate[] = [];
  for (const candidate of candidates.slice(0, 30000)) {
    if (!selected.some((other) => other.classId === candidate.classId && intersectionOverUnion(candidate, other) > iou)) selected.push(candidate);
    if (selected.length === 300) break;
  }
  return selected;
}

export function yoloeSemanticMask(predictions: Float32Array, dims: readonly number[], prototypes: Float32Array,
  protoDims: readonly number[], selected: readonly YoloeCandidate[], classCount: number, width: number, height: number): Uint16Array {
  const [, channels, ph, pw] = protoDims;
  if (channels !== 32 || !ph || !pw || prototypes.length !== channels * ph * pw) throw new Error("Invalid YOLOE mask prototypes.");
  const plane = ph * pw, anchors = dims[2]!, mask = new Uint16Array(width * height);
  const gain = Math.min(ph / height, pw / width);
  const cw = Math.round(width * gain), ch = Math.round(height * gain);
  const left = Math.round((pw - cw) / 2 - 0.1), top = Math.round((ph - ch) / 2 - 0.1);
  // Same crop + bilinear resize + logit>0 rule as Ultralytics process_mask_native.
  for (const detection of [...selected].sort((a, b) => a.confidence - b.confidence)) {
    const logits = new Float32Array(plane);
    for (let channel = 0; channel < 32; channel++) {
      const coefficient = predictions[(4 + classCount + channel) * anchors + detection.anchor]!;
      for (let p = 0; p < plane; p++) logits[p]! += coefficient * prototypes[channel * plane + p]!;
    }
    for (let y = Math.ceil(detection.top); y < Math.min(height, detection.bottom); y++) {
      const sy = Math.max(0, Math.min(ch - 1, (y + 0.5) * ch / height - 0.5));
      const y0 = Math.floor(sy), y1 = Math.min(ch - 1, y0 + 1), fy = sy - y0;
      for (let x = Math.ceil(detection.left); x < Math.min(width, detection.right); x++) {
        const sx = Math.max(0, Math.min(cw - 1, (x + 0.5) * cw / width - 0.5));
        const x0 = Math.floor(sx), x1 = Math.min(cw - 1, x0 + 1), fx = sx - x0;
        const row0 = (top + y0) * pw + left, row1 = (top + y1) * pw + left;
        const value = (logits[row0 + x0]! * (1 - fx) + logits[row0 + x1]! * fx) * (1 - fy)
          + (logits[row1 + x0]! * (1 - fx) + logits[row1 + x1]! * fx) * fy;
        if (value > 0) mask[y * width + x] = detection.classId;
      }
    }
  }
  return mask;
}

let worker: Worker | null = null;
let nextId = 0;
let loadedModel: unknown = null;
const pending = new Map<number, { resolve(value: unknown): void; reject(error: Error): void }>();

async function modelFile(file: string): Promise<ArrayBuffer> {
  const desktop = globalThis.window?.easyLabelingDesktop;
  const bytes = desktop?.readYoloeModel ? await desktop.readYoloeModel(file)
    : new Uint8Array(await (await fetch(new URL("../../../assets/models/yoloe26/" + file, import.meta.url))).arrayBuffer());
  return Uint8Array.from(bytes).buffer;
}

export async function requestYoloeOnnx<T>(operation: string, payload?: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
  signal?.throwIfAborted();
  if (!worker) {
    worker = new Worker(new URL("../../../workers/yoloe-inference-worker.js", import.meta.url), { type: "module" });
    worker.onmessage = ({ data }) => {
      const request = pending.get(data.id);
      if (!request) return;
      pending.delete(data.id);
      if (data.error) request.reject(new Error(data.error));
      else request.resolve(data.result);
    };
    worker.onerror = (event) => {
      pending.forEach(({ reject }) => reject(new Error(event.message || "YOLOE ONNX worker failed.")));
      pending.clear(); worker?.terminate(); worker = null; loadedModel = null;
    };
  }
  const transfer: ArrayBuffer[] = [];
  if (operation === "prepare" && loadedModel !== payload!.model) {
    const size = String(payload!.model).replace(/^yoloe-26([nsml])-seg$/, "$1");
    if (!/^[nsml]$/.test(size)) throw new Error("Choose an N/S/M/L YOLOE model.");
    const manifest = JSON.parse(new TextDecoder().decode(await modelFile(`${size}/manifest.json`))) as { files: { file: string }[] };
    const files: Record<string, ArrayBuffer> = {};
    for (const { file } of manifest.files) { files[file] = await modelFile(`${size}/${file}`); transfer.push(files[file]!); }
    payload = { ...payload, files };
  }
  signal?.throwIfAborted();
  return new Promise<T>((resolve, reject) => {
    const id = ++nextId;
    const abort = (): void => { pending.delete(id); loadedModel = null; reject(signal!.reason); };
    const cleanup = (): void => signal?.removeEventListener("abort", abort);
    pending.set(id, { resolve: (value) => { cleanup(); if (operation === "prepare") loadedModel = payload!.model; resolve(value as T); }, reject: (error) => { cleanup(); reject(error); } });
    signal?.addEventListener("abort", abort, { once: true });
    worker!.postMessage({ id, operation, ...payload }, transfer);
  });
}
