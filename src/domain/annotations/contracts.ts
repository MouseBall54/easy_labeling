import type { WorkflowType } from "../../types/labels.js";

export type AnnotationWorkflow = Exclude<WorkflowType, "review">;

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

export const REVIEW_STATUS_VALUES = ["untouched", "approved", "needs-fix"] as const;

export type ReviewStatus = typeof REVIEW_STATUS_VALUES[number];

export interface ReviewDocument<TIssueKey extends string = string> {
  workflow: AnnotationWorkflow;
  format: "review-json-v1";
  status: ReviewStatus;
  note: string;
  issueFlags: Partial<Record<TIssueKey, boolean>>;
}

export interface ReviewCodec<TDocument extends ReviewDocument = ReviewDocument> {
  readonly workflow: AnnotationWorkflow;
  resolvePath(imageBaseName: string): string;
  decode(input: string): TDocument;
  encode(document: TDocument): string;
}


export interface WorkflowAnnotationStatus {
  hasAnnotation: boolean;
  reviewStatus: ReviewStatus;
}

export interface ImageWorkflowStatus {
  detection: WorkflowAnnotationStatus;
  segmentation: WorkflowAnnotationStatus;
}

export function createEmptyImageWorkflowStatus(): ImageWorkflowStatus {
  return {
    detection: {
      hasAnnotation: false,
      reviewStatus: "untouched"
    },
    segmentation: {
      hasAnnotation: false,
      reviewStatus: "untouched"
    }
  };
}
