import { annotationConflicts, annotationOutputPaths, annotationPathKey } from "../../domain/annotations/paths.js";
import { maskRegions } from "../../domain/annotations/mask-regions.js";
import { decodeSegmentationMaskPng } from "../../domain/annotations/segmentation-codec.js";
import { parseYoloRows } from "../../domain/yolo/yolo.js";
import { isNotFoundError, readBinaryFileByName, readTextFileByName } from "../../platform/file-system-access.js";
import { errorText } from "../../platform/native-bridge.js";
import type { DirectoryHandleLike, NamedFileEntry } from "../../types/files.js";
import type { WorkflowType } from "../../types/labels.js";
import type { SegmentationExternalFormat } from "../../domain/annotations/segmentation-format.js";

interface StorageSession {
  imageFolderHandle: { name: string } | null;
  labelFolderHandle: { name: string } | null;
  segmentationLabelFolderHandle?: { name: string } | null;
  segmentationExportFormat: SegmentationExternalFormat;
  imageFiles: readonly NamedFileEntry[];
}

export interface AnnotationOutput {
  image: string;
  workflow: WorkflowType;
  folder: DirectoryHandleLike | null;
  paths: string[];
  conflictingImages: string[];
}

export function annotationOutput(
  session: StorageSession,
  image: string,
  workflow: WorkflowType,
  conflicts = annotationConflicts(session.imageFiles, workflow)
): AnnotationOutput {
  const format = session.segmentationExportFormat;
  const paths = annotationOutputPaths(workflow, image, format === "auto" ? undefined : format);
  return {
    image,
    workflow,
    folder: (workflow === "detection" ? session.labelFolderHandle : session.segmentationLabelFolderHandle ?? session.imageFolderHandle) as DirectoryHandleLike | null,
    paths,
    conflictingImages: conflicts.get(annotationPathKey(paths[0]!)) ?? []
  };
}

export function outputInfo(output: AnnotationOutput, pathOf: (handle: unknown) => string | null) {
  const folder = output.folder;
  const labelFolder = folder ? pathOf(folder) ?? folder.name : null;
  const paths = folder ? output.paths.map((path) => outputPath(folder, path, pathOf)) : [];
  return { image: output.image, workflow: output.workflow, labelFolder, paths, conflictingImages: output.conflictingImages };
}

export function outputPath(folder: { name: string }, relativePath: string, pathOf: (handle: unknown) => string | null): string {
  const root = pathOf(folder) ?? folder.name;
  const separator = root.includes("\\") ? "\\" : "/";
  return root.replace(/[\\/]+$/, "") + separator + relativePath.replaceAll("/", separator);
}

export async function resolveOutputDirectory(root: DirectoryHandleLike, segments: readonly string[], create = false): Promise<DirectoryHandleLike> {
  let current = root;
  for (const segment of segments) current = await current.getDirectoryHandle(segment, { create });
  return current;
}

export function maskOutputCounts({ mask, width, height }: { mask: Uint16Array; width: number; height: number }) {
  const { pixelsByClass, regionsByClass } = maskRegions(mask, width, height);
  return { pixelsByClass, regionsByClass };
}

/** Inspect the actual saved files. For segmentation, the editable PNG supplies the pixel and region counts. */
export async function inspectAnnotationFiles(output: AnnotationOutput, pathOf: (handle: unknown) => string | null, details: boolean) {
  if (!output.folder) return [];
  const folder = output.folder;
  return Promise.all(output.paths.map(async (relativePath, index) => {
    const path = outputPath(folder, relativePath, pathOf);
    const parts = relativePath.split("/");
    const fileName = parts.pop()!;
    try {
      const directory = await resolveOutputDirectory(folder, parts);
      if (output.workflow === "segmentation" && index === 0) {
        const mask = await decodeSegmentationMaskPng(await readBinaryFileByName(directory, fileName));
        return { path, status: mask.mask.some((value) => value !== 0) ? "present" : "empty", ...(details ? maskOutputCounts(mask) : {}) };
      }
      const content = await readTextFileByName(directory, fileName);
      let hasContent = content.trim().length > 0;
      if (output.workflow === "segmentation" && fileName.endsWith(".json")) {
        const json = JSON.parse(content) as { annotations?: unknown; shapes?: unknown } | null;
        const annotations: unknown = relativePath.startsWith("segmentation/coco/") ? json?.annotations : json?.shapes;
        if (!Array.isArray(annotations)) throw new Error("Invalid segmentation export.");
        hasContent = annotations.length > 0;
      }
      return { path, status: hasContent ? "present" : "empty", ...(details && output.workflow === "detection" ? { boxCount: parseYoloRows(content, 1, 1).length } : {}) };
    } catch (error) {
      return isNotFoundError(error) ? { path, status: "missing" } : { path, status: "read_error", error: errorText(error) };
    }
  }));
}
