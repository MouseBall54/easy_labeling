import type { WorkflowType } from "../../types/labels.js";

export type AnnotationWorkflow = WorkflowType;

export const ANNOTATION_WORKFLOWS = ["detection", "segmentation"] as const satisfies readonly AnnotationWorkflow[];

export type AnnotationFileContent = string | Uint8Array | ArrayBuffer;

export interface SerializedAnnotationAsset {
  path: string;
  content: AnnotationFileContent;
}

export interface AnnotationAssetPathSet {
  primaryFilePath: string;
  sidecarFilePaths: string[];
}

export interface AnnotationDocument<TData = unknown> {
  workflow: AnnotationWorkflow;
  format: string;
  paths: AnnotationAssetPathSet;
  data: TData;
}

export interface AnnotationCodec<
  TReadInput = unknown,
  TWriteInput = unknown,
  TDocument extends AnnotationDocument = AnnotationDocument
> {
  readonly workflow: AnnotationWorkflow;
  resolvePaths(imageBaseName: string): AnnotationAssetPathSet;
  decode(input: TReadInput): TDocument;
  encode(input: TWriteInput): SerializedAnnotationAsset[];
}

export interface WorkflowAnnotationStatus {
  hasAnnotation: boolean;
}

export interface ImageWorkflowStatus {
  detection: WorkflowAnnotationStatus;
  segmentation: WorkflowAnnotationStatus;
}

export function createEmptyImageWorkflowStatus(): ImageWorkflowStatus {
  return {
    detection: {
      hasAnnotation: false
    },
    segmentation: {
      hasAnnotation: false
    }
  };
}
