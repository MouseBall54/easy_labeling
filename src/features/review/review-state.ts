import {
  REVIEW_STATE_SCHEMA_VERSION,
  type ReviewImageRecord,
  type ReviewSettings,
  type ReviewStateDocument
} from "./types.js";

export const DEFAULT_REVIEW_SETTINGS: ReviewSettings = {
  minimumBoxSizePx: 4,
  duplicateIouThreshold: 0.9,
  requiredClassIds: []
};

function normalizeClassIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return [...new Set(value.filter((classId): classId is string => typeof classId === "string" && /^\d+$/.test(classId)))];
}

function normalizeSettings(value: unknown): ReviewSettings {
  const source = typeof value === "object" && value !== null ? value as Record<string, unknown> : {};
  const minimumBoxSizePx = typeof source.minimumBoxSizePx === "number" && Number.isFinite(source.minimumBoxSizePx)
    ? Math.max(1, source.minimumBoxSizePx)
    : DEFAULT_REVIEW_SETTINGS.minimumBoxSizePx;
  const duplicateIouThreshold = typeof source.duplicateIouThreshold === "number" && Number.isFinite(source.duplicateIouThreshold)
    ? Math.max(0, Math.min(1, source.duplicateIouThreshold))
    : DEFAULT_REVIEW_SETTINGS.duplicateIouThreshold;
  return { minimumBoxSizePx, duplicateIouThreshold, requiredClassIds: normalizeClassIds(source.requiredClassIds) };
}

function normalizeImages(value: unknown): Record<string, ReviewImageRecord> {
  if (typeof value !== "object" || value === null) {
    return {};
  }
  return Object.fromEntries(Object.entries(value).flatMap(([imagePath, record]) => {
    if (typeof record !== "object" || record === null) {
      return [];
    }
    const source = record as Record<string, unknown>;
    if (source.status !== "needs-review" && source.status !== "reviewed") {
      return [];
    }
    return [[imagePath, {
      status: source.status,
      reviewedAt: typeof source.reviewedAt === "string" ? source.reviewedAt : null
    } satisfies ReviewImageRecord]];
  }));
}

export function createReviewStateDocument(): ReviewStateDocument {
  return { schemaVersion: REVIEW_STATE_SCHEMA_VERSION, settings: { ...DEFAULT_REVIEW_SETTINGS }, images: {} };
}

export function parseReviewStateDocument(text: string): ReviewStateDocument {
  const parsed: unknown = JSON.parse(text);
  if (typeof parsed !== "object" || parsed === null || (parsed as { schemaVersion?: unknown }).schemaVersion !== REVIEW_STATE_SCHEMA_VERSION) {
    throw new Error("Unsupported review state file");
  }
  const source = parsed as Record<string, unknown>;
  return {
    schemaVersion: REVIEW_STATE_SCHEMA_VERSION,
    settings: normalizeSettings(source.settings),
    images: normalizeImages(source.images)
  };
}
