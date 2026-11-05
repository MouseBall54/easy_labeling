import type { RefineParams } from "../../domain/refine/edge-refine.js";
import { applyLabelFileChanges, labelFileBoxes, type LabelFileChange } from "../../domain/refine/label-file.js";
import { getNativeBridge, NativeJobCancelledError } from "../../platform/native-bridge.js";
import { toNativeSource } from "./native-refine-worker.js";
import type { RefineImageInput } from "./refine-service.js";

/** What refine_folder (src-tauri/src/refine_folder.rs) returns per image; null where the page must decode it. */
interface NativeFolderImage {
  /** The label file's text, null when there is none. */
  original: string | null;
  /** Image size; 0 when the file had no box to refine (the image was not opened). */
  width: number;
  height: number;
  /** Boxes Rust read from the file, to check against labelFileBoxes. */
  boxCount: number;
  /** Boxes that moved, in file order. */
  changes: LabelFileChange[];
}

/** A label file rewritten natively: its text before and after (null = unchanged). */
export interface NativeFolderRewrite { original: string | null; text: string | null; changed: number }

/**
 * Desktop app: refines every image's label file in Rust, images in parallel (crates/el-core/src/refine_folder.rs).
 * Rust reads the label files and decodes the images it can decode exactly as the page does (8-bit gray TIFF,
 * PNG without colour management or alpha); other images come back as null for the TS path. The new text is
 * still written here (yoloRow), from the boxes Rust refined. Null when there is no native side, a path is
 * unknown, or the call failed.
 */
export async function refineFolderNatively(input: {
  images: readonly unknown[];
  labelNames: readonly string[];
  labelFolder: unknown;
  /** Params of classes whose settings differ from `defaultParams`. */
  paramsByClass: Record<string, RefineParams>;
  defaultParams: RefineParams;
  source: RefineImageInput;
  signal?: AbortSignal;
  onProgress?(done: number, total: number): void;
}): Promise<Array<NativeFolderRewrite | null> | null> {
  const native = getNativeBridge("refine-folder");
  if (!native || !input.images.length) return null;
  const labelFolder = native.pathOf(input.labelFolder);
  const paths = input.images.map((image) => native.pathOf(image));
  if (!labelFolder || paths.some((path) => path === null)) return null;
  let results: Array<NativeFolderImage | null>;
  try {
    results = await native.runJob<Array<NativeFolderImage | null>>("refine_folder", (jobId) => ({
      request: {
        jobId,
        labelFolder,
        images: paths.map((path, index) => ({ path, label: input.labelNames[index] })),
        paramsByClass: input.paramsByClass,
        defaultParams: input.defaultParams,
        source: toNativeSource(input.source)
      }
    }), { signal: input.signal, onProgress: input.onProgress });
  } catch (error) {
    if (input.signal?.aborted || error instanceof NativeJobCancelledError) throw error;
    console.warn("Native folder refine failed; refining on the TS path.", error);
    return null;
  }
  if (results.length !== input.images.length) return null;
  return results.map((result) => {
    if (!result) return null;
    if (result.original === null) return { original: null, text: null, changed: 0 };
    const { lines, boxes } = labelFileBoxes(result.original, result.width || 1, result.height || 1);
    // Rust read the rows by the same rules; anything else sends the image down the TS path.
    const rows = new Map(boxes.map((box) => [Number(box.id), box.classId]));
    if (boxes.length !== result.boxCount || result.changes.some((change) => rows.get(change.line) !== change.classId)) return null;
    return { original: result.original, text: applyLabelFileChanges(lines, result.changes, result.width, result.height), changed: result.changes.length };
  });
}
