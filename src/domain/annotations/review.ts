import { REVIEW_STATUS_VALUES, type AnnotationWorkflow, type ReviewCodec, type ReviewDocument, type ReviewStatus } from "./contracts.js";
import { resolveReviewDocumentPath } from "./paths.js";

export interface WorkflowReviewDocument<TIssueKey extends string = string> extends ReviewDocument<TIssueKey> {}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isReviewStatus(value: unknown): value is ReviewStatus {
  return REVIEW_STATUS_VALUES.some((status) => status === value);
}


export const REVIEW_ISSUE_DEFINITIONS: Record<AnnotationWorkflow, Array<{ key: string; label: string }>> = {
  detection: [
    { key: "geometry", label: "Geometry / placement issue" },
    { key: "classification", label: "Classification issue" },
    { key: "missing-annotation", label: "Missing annotation issue" }
  ],
  segmentation: [
    { key: "coverage", label: "Coverage / completeness issue" },
    { key: "boundary", label: "Boundary / edge quality issue" },
    { key: "stray-mask", label: "Stray mask / spill issue" }
  ]
};

export function getReviewIssueDefinitions(workflow: AnnotationWorkflow): Array<{ key: string; label: string }> {
  return REVIEW_ISSUE_DEFINITIONS[workflow];
}

function normalizeIssueFlags(value: unknown): Partial<Record<string, boolean>> {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, boolean] => typeof entry[1] === "boolean"));
}

export function createReviewDocumentCodec(workflow: AnnotationWorkflow): ReviewCodec<WorkflowReviewDocument> {
  return {
    workflow,

    resolvePath(imageBaseName: string): string {
      return resolveReviewDocumentPath(workflow, imageBaseName);
    },

    decode(input: string): WorkflowReviewDocument {
      let parsed: unknown = {};
      try {
        parsed = JSON.parse(input);
      } catch {
        parsed = {};
      }
      const candidate = isRecord(parsed) ? parsed : {};
      return {
        workflow,
        format: "review-json-v1",
        status: isReviewStatus(candidate.status) ? candidate.status : "untouched",
        note: typeof candidate.note === "string" ? candidate.note : "",
        issueFlags: normalizeIssueFlags(candidate.issueFlags)
      };
    },

    encode(document: WorkflowReviewDocument): string {
      return JSON.stringify({
        workflow,
        format: "review-json-v1",
        status: document.status,
        note: document.note,
        issueFlags: document.issueFlags
      }, null, 2);
    }
  };
}


export function createEmptyReviewDocument(workflow: AnnotationWorkflow): WorkflowReviewDocument {
  return {
    workflow,
    format: "review-json-v1",
    status: "untouched",
    note: "",
    issueFlags: {}
  };
}
