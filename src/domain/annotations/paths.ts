import type { AnnotationAssetPathSet, AnnotationWorkflow } from "./contracts.js";
import { imageFileNameToBaseName, type NamedFileLike } from "../files/image-names.js";

interface AnnotationPathConvention {
  primaryDir: string;
  primaryExtension: string;
  sidecarSuffixes: string[];
}

export const ANNOTATION_PATH_CONVENTIONS: Record<AnnotationWorkflow, AnnotationPathConvention> = {
  detection: {
    primaryDir: "label",
    primaryExtension: ".txt",
    sidecarSuffixes: []
  },
  segmentation: {
    primaryDir: "mask",
    primaryExtension: ".png",
    sidecarSuffixes: []
  }
};

function normalizeImageBaseName(imageBaseName: string): string {
  const normalized = imageBaseName.trim();
  if (normalized.length === 0) {
    throw new Error("imageBaseName must not be empty");
  }
  return normalized;
}

export function resolveAnnotationAssetPaths(workflow: AnnotationWorkflow, imageBaseName: string): AnnotationAssetPathSet {
  const normalized = normalizeImageBaseName(imageBaseName);
  const convention = ANNOTATION_PATH_CONVENTIONS[workflow];
  return {
    primaryFilePath: `${convention.primaryDir}/${normalized}${convention.primaryExtension}`,
    sidecarFilePaths: convention.sidecarSuffixes.map((suffix) => `${convention.primaryDir}/${normalized}${suffix}`)
  };
}

export function resolveSegmentationExportPath(
  format: "yolo-segmentation" | "coco-segmentation" | "labelme",
  imageBaseName: string
): string {
  const normalized = normalizeImageBaseName(imageBaseName);
  if (format === "yolo-segmentation") return `segmentation/yolo/labels/${normalized}.txt`;
  if (format === "coco-segmentation") return `segmentation/coco/${normalized}.json`;
  return `segmentation/labelme/${normalized}.json`;
}

/** Detection's active handle already points inside the label directory. */
export function annotationOutputPaths(
  workflow: AnnotationWorkflow,
  image: string,
  segmentationExport?: Parameters<typeof resolveSegmentationExportPath>[0] | "png-semantic-mask"
): string[] {
  const base = imageFileNameToBaseName(image);
  const primary = resolveAnnotationAssetPaths(workflow, base).primaryFilePath;
  if (workflow === "detection") return [primary.slice("label/".length)];
  return segmentationExport && segmentationExport !== "png-semantic-mask"
    ? [primary, resolveSegmentationExportPath(segmentationExport, base)]
    : [primary];
}

export function annotationPathKey(path: string): string {
  // Windows normally resolves case variants to the same output file.
  return path.toLowerCase();
}

/** Index the entire dataset, even when only a page or a subset will be processed. */
export function annotationConflicts(files: readonly NamedFileLike[], workflow: AnnotationWorkflow): Map<string, string[]> {
  const byPath = new Map<string, string[]>();
  for (const { name } of files) {
    const key = annotationPathKey(annotationOutputPaths(workflow, name)[0]!);
    const images = byPath.get(key);
    if (images) images.push(name);
    else byPath.set(key, [name]);
  }
  return new Map([...byPath].filter(([, images]) => images.length > 1));
}

export function assertAnnotationOutputUnshared(path: string, conflictingImages: readonly string[]): void {
  if (conflictingImages.length) throw new Error(`Output collision at ${path}: ${conflictingImages.join(", ")} share this file.`);
}
