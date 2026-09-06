export const REVIEW_STATE_SCHEMA_VERSION = 1 as const;

export type ReviewImageStatus = "needs-review" | "reviewed";
export type ReviewIssueSeverity = "error" | "warning";
export type ReviewIssueType = "empty-label" | "out-of-bounds" | "small-box" | "duplicate-box" | "missing-class";

export interface ReviewSettings {
  minimumBoxSizePx: number;
  duplicateIouThreshold: number;
  requiredClassIds: string[];
}

export interface ReviewImageRecord {
  status: ReviewImageStatus;
  reviewedAt: string | null;
}

export interface ReviewStateDocument {
  schemaVersion: typeof REVIEW_STATE_SCHEMA_VERSION;
  settings: ReviewSettings;
  images: Record<string, ReviewImageRecord>;
}

export interface ReviewIssue {
  type: ReviewIssueType;
  severity: ReviewIssueSeverity;
  message: string;
  rectIndexes: number[];
}

export interface ReviewFinding {
  issues: ReviewIssue[];
  highestSeverity: ReviewIssueSeverity | null;
}
