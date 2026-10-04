import type { FabricRectLike } from "../canvas/fabric-types.js";
import type { Detection } from "./yolo.js";
import { normalizeClassName } from "../../domain/class-files.js";

export interface VisualExample { classId: number; name: string; box: [number, number, number, number]; }
export interface YoloeStatus { version: number; cuda: boolean; gpu: string | null; models: string[]; busy: boolean; }
export interface YoloeProfile {
  id: string; model: string; classes: Record<string, string>; exampleCount: number; referenceSha256: string;
  gpu: string;
}

export function selectedVisualExamples(rects: FabricRectLike[], width: number, height: number, names: ReadonlyMap<string, string>): VisualExample[] {
  if (!rects.length || rects.length > 32) throw new Error("Select 1–32 example boxes in Edit mode.");
  return rects.map((rect) => {
    const id = rect.labelClass ?? "0";
    if (!/^\d+$/.test(id) || !Number.isSafeInteger(Number(id))) throw new Error("Example boxes need numeric class IDs.");
    const bounds = rect.getBoundingRect(true);
    const box: VisualExample["box"] = [Math.max(0, bounds.left), Math.max(0, bounds.top), Math.min(width, bounds.left + bounds.width), Math.min(height, bounds.top + bounds.height)];
    if (!box.every(Number.isFinite) || box[2] <= box[0] || box[3] <= box[1]) throw new Error("Example boxes must overlap the reference image.");
    return { classId: Number(id), name: normalizeClassName(names.get(id) ?? `class ${id}`), box };
  });
}

export function imagePng(image: HTMLImageElement, documentRef: Document): string {
  const canvas = documentRef.createElement("canvas");
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;
  if (canvas.width * canvas.height > 32_000_000) throw new Error("YOLOE supports images up to 32 million pixels.");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Image pixels are unavailable.");
  context.drawImage(image, 0, 0);
  return canvas.toDataURL("image/png");
}

export async function requestYoloe<T>(path: string, payload?: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`http://127.0.0.1:8766/${path}`, {
      method: payload ? "POST" : "GET", signal,
      ...(payload ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) } : {})
    });
  } catch (error) {
    if (signal?.aborted) throw signal.reason;
    throw new Error("GPU service is unavailable. Run npm run yoloe:start, then Connect GPU.");
  }
  const value = await response.json() as { error?: string };
  if (!response.ok) throw new Error(value.error ?? `GPU service error (${response.status}).`);
  return value as T;
}

export async function inferYoloe(image: HTMLImageElement, documentRef: Document, profile: YoloeProfile, confidence: number, iou: number, signal?: AbortSignal): Promise<Detection[]> {
  const result = await requestYoloe<{ detections: Detection[] }>("infer", { profileId: profile.id, image: imagePng(image, documentRef), confidence, iou }, signal);
  return result.detections;
}
