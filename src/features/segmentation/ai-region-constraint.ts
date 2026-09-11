import type { CanvasPoint } from "../../types/labels.js";
import type { EdgeSamBox } from "../edgesam/types.js";

export type AiSelectRegionConstraintSource = "manual" | "detection" | null;
export type AiSelectRegionConstraintMarginUnit = "px" | "percent";

export interface AiSelectRegionConstraintRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AiSelectRegionConstraint {
  enabled: boolean;
  source: AiSelectRegionConstraintSource;
  rect: AiSelectRegionConstraintRect | null;
  margin: { value: number; unit: AiSelectRegionConstraintMarginUnit };
  detectionLabelId?: string;
}

export interface AiSelectDetectionRoiInput {
  labelId: string;
  rect: AiSelectRegionConstraintRect;
  margin?: Partial<AiSelectRegionConstraint["margin"]>;
}

export const DEFAULT_AI_SELECT_REGION_CONSTRAINT: AiSelectRegionConstraint = {
  enabled: false,
  source: null,
  rect: null,
  margin: { value: 0, unit: "px" }
};

const clamp = (value: number, minimum: number, maximum: number): number => Math.max(minimum, Math.min(maximum, value));

export function normalizeAiSelectRegionConstraint(input?: Partial<AiSelectRegionConstraint>): AiSelectRegionConstraint {
  const margin = input?.margin;
  return {
    enabled: input?.enabled === true,
    source: input?.source === "manual" || input?.source === "detection" ? input.source : null,
    rect: input?.rect ? { ...input.rect } : null,
    margin: {
      value: Number.isFinite(margin?.value) ? (margin?.value ?? 0) : 0,
      unit: margin?.unit === "percent" ? "percent" : "px"
    },
    ...(input?.detectionLabelId ? { detectionLabelId: input.detectionLabelId } : {})
  };
}

export function clampAiSelectRegionRect(rect: AiSelectRegionConstraintRect, image: { width: number; height: number }): AiSelectRegionConstraintRect | null {
  if (image.width < 1 || image.height < 1 || rect.width <= 0 || rect.height <= 0) return null;
  const left = clamp(rect.x, 0, image.width);
  const top = clamp(rect.y, 0, image.height);
  const right = clamp(rect.x + rect.width, 0, image.width);
  const bottom = clamp(rect.y + rect.height, 0, image.height);
  if (right <= left || bottom <= top) return null;
  return { x: left, y: top, width: right - left, height: bottom - top };
}

export function expandAiSelectRegionRect(
  rect: AiSelectRegionConstraintRect,
  margin: AiSelectRegionConstraint["margin"],
  image: { width: number; height: number }
): AiSelectRegionConstraintRect | null {
  const base = clampAiSelectRegionRect(rect, image);
  if (!base) return null;
  const amount = margin.unit === "percent"
    ? Math.max(base.width, base.height) * margin.value / 100
    : margin.value;
  return clampAiSelectRegionRect({
    x: base.x - amount,
    y: base.y - amount,
    width: base.width + (2 * amount),
    height: base.height + (2 * amount)
  }, image);
}

export function getActiveAiSelectRegionRect(
  constraint: AiSelectRegionConstraint,
  image: { width: number; height: number }
): AiSelectRegionConstraintRect | null {
  if (!constraint.enabled || !constraint.rect) return null;
  return expandAiSelectRegionRect(constraint.rect, constraint.margin, image);
}

export function clipAiSelectMaskToRegion(mask: Uint8Array, image: { width: number; height: number }, rect: AiSelectRegionConstraintRect | null): Uint8Array {
  if (!rect) return mask;
  if (mask.length !== image.width * image.height) throw new RangeError("AI Select mask dimensions do not match the image");
  const clipped = new Uint8Array(mask);
  const right = rect.x + rect.width;
  const bottom = rect.y + rect.height;
  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      if (x < rect.x || x >= right || y < rect.y || y >= bottom) clipped[(y * image.width) + x] = 0;
    }
  }
  return clipped;
}

export function createAiSelectConstraintFromDetectionBox(input: AiSelectDetectionRoiInput): {
  constraint: AiSelectRegionConstraint;
  centerPoint: CanvasPoint;
  promptBox: EdgeSamBox;
} {
  const margin = { value: Number.isFinite(input.margin?.value) ? (input.margin?.value ?? 0) : 0, unit: input.margin?.unit === "percent" ? "percent" as const : "px" as const };
  return {
    constraint: {
      enabled: true,
      source: "detection",
      rect: { ...input.rect },
      margin,
      detectionLabelId: input.labelId
    },
    centerPoint: { x: input.rect.x + (input.rect.width / 2), y: input.rect.y + (input.rect.height / 2) },
    promptBox: {
      left: input.rect.x,
      top: input.rect.y,
      right: input.rect.x + input.rect.width,
      bottom: input.rect.y + input.rect.height
    }
  };
}
