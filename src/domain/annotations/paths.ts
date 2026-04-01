import type { AnnotationAssetPathSet, AnnotationWorkflow } from "./contracts.js";

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
    sidecarSuffixes: [".seg.json"]
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
