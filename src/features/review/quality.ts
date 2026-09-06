import { parseYoloRows, type ParsedYoloRow } from "../../domain/yolo/yolo.js";
import type { ReviewFinding, ReviewIssue, ReviewSettings } from "./types.js";

function intersectionOverUnion(left: ParsedYoloRow, right: ParsedYoloRow): number {
  const overlapWidth = Math.max(0, Math.min(left.rectLeft + left.rectWidth, right.rectLeft + right.rectWidth) - Math.max(left.rectLeft, right.rectLeft));
  const overlapHeight = Math.max(0, Math.min(left.rectTop + left.rectHeight, right.rectTop + right.rectHeight) - Math.max(left.rectTop, right.rectTop));
  const intersection = overlapWidth * overlapHeight;
  const union = left.rectWidth * left.rectHeight + right.rectWidth * right.rectHeight - intersection;
  return union > 0 ? intersection / union : 0;
}

export function inspectDetectionLabels(input: {
  yoloText: string;
  imageWidth: number;
  imageHeight: number;
  settings: ReviewSettings;
}): ReviewFinding {
  const rows = parseYoloRows(input.yoloText, input.imageWidth, input.imageHeight);
  const issues: ReviewIssue[] = [];
  if (rows.length === 0) {
    issues.push({ type: "empty-label", severity: "warning", message: "No detection labels", rectIndexes: [] });
  }
  rows.forEach((row, index) => {
    const outside = !Number.isFinite(row.rectLeft) || !Number.isFinite(row.rectTop) || !Number.isFinite(row.rectWidth) || !Number.isFinite(row.rectHeight)
      || row.rectLeft < 0 || row.rectTop < 0 || row.rectLeft + row.rectWidth > input.imageWidth || row.rectTop + row.rectHeight > input.imageHeight;
    if (outside) {
      issues.push({ type: "out-of-bounds", severity: "error", message: `Box ${index + 1} is outside the image`, rectIndexes: [index] });
    }
    if (row.rectWidth < input.settings.minimumBoxSizePx || row.rectHeight < input.settings.minimumBoxSizePx) {
      issues.push({ type: "small-box", severity: "warning", message: `Box ${index + 1} is smaller than ${input.settings.minimumBoxSizePx}px`, rectIndexes: [index] });
    }
  });
  for (let left = 0; left < rows.length; left += 1) {
    for (let right = left + 1; right < rows.length; right += 1) {
      if (rows[left]?.labelClass === rows[right]?.labelClass && intersectionOverUnion(rows[left]!, rows[right]!) >= input.settings.duplicateIouThreshold) {
        issues.push({ type: "duplicate-box", severity: "warning", message: `Boxes ${left + 1} and ${right + 1} overlap`, rectIndexes: [left, right] });
      }
    }
  }
  const classes = new Set(rows.map((row) => row.labelClass));
  input.settings.requiredClassIds.forEach((classId) => {
    if (!classes.has(classId)) {
      issues.push({ type: "missing-class", severity: "warning", message: `Required class ${classId} is missing`, rectIndexes: [] });
    }
  });
  return { issues, highestSeverity: issues.some((issue) => issue.severity === "error") ? "error" : issues.length > 0 ? "warning" : null };
}
