import { serializeRectsToYolo, type YoloRectLike } from "../../domain/yolo/yolo.js";
import {
  calculateLayoutAnchor,
  filterPixelRectsInsideImageBounds,
  placeBoxLayout
} from "./layout.js";
import type {
  AutomationPreset,
  BoxLayout,
  PixelSize,
  TemplateMatchResult
} from "./types.js";

export interface GeneratedDetectionBox {
  classId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  score: number;
}

export function createAutomationDetectionBoxes(input: {
  preset: AutomationPreset;
  layout: BoxLayout | null;
  match: TemplateMatchResult;
  imageSize: PixelSize;
}): GeneratedDetectionBox[] {
  if (input.preset.outputMode === "multiple-detection-boxes") {
    return filterPixelRectsInsideImageBounds(input.match.matches.map((candidate) => ({
      classId: input.preset.multipleDetection.classId,
      x: candidate.x,
      y: candidate.y,
      width: candidate.width,
      height: candidate.height,
      score: candidate.score
    })), input.imageSize);
  }

  if (!input.layout) {
    throw new Error("Best Match + Layout preset references a missing layout");
  }
  if (input.match.score < input.preset.matching.minimumScore) {
    return [];
  }
  const anchor = calculateLayoutAnchor(input.match, input.preset);
  return placeBoxLayout(input.layout, anchor, input.imageSize).map((box) => ({
    classId: box.classId,
    x: box.x,
    y: box.y,
    width: box.width,
    height: box.height,
    score: input.match.score
  }));
}

function toYoloRect(box: GeneratedDetectionBox): YoloRectLike {
  return {
    labelClass: box.classId,
    setCoords(): void {
      return;
    },
    getCenterPoint: () => ({ x: box.x + box.width / 2, y: box.y + box.height / 2 }),
    getScaledWidth: () => box.width,
    getScaledHeight: () => box.height
  };
}

export function serializeAutomationBoxes(boxes: readonly GeneratedDetectionBox[], imageSize: PixelSize): string {
  return serializeRectsToYolo(boxes.map(toYoloRect), imageSize.width, imageSize.height);
}

export function mergeDetectionLabels(existingYolo: string, generatedYolo: string, policy: "append" | "replace"): string {
  if (policy === "replace") {
    return generatedYolo.trim();
  }
  return [existingYolo.trim(), generatedYolo.trim()].filter(Boolean).join("\n");
}
