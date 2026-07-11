import type { MultipleDetectionSettings, TemplateMatchCandidate } from "./types.js";

export interface ScoreMap {
  width: number;
  height: number;
  scores: ArrayLike<number>;
}

export function intersectionArea(left: TemplateMatchCandidate, right: TemplateMatchCandidate): number {
  const overlapWidth = Math.max(0, Math.min(left.x + left.width, right.x + right.width) - Math.max(left.x, right.x));
  const overlapHeight = Math.max(0, Math.min(left.y + left.height, right.y + right.height) - Math.max(left.y, right.y));
  return overlapWidth * overlapHeight;
}

export function intersectionOverUnion(left: TemplateMatchCandidate, right: TemplateMatchCandidate): number {
  const intersection = intersectionArea(left, right);
  if (intersection <= 0) {
    return 0;
  }
  const union = (left.width * left.height) + (right.width * right.height) - intersection;
  return union > 0 ? intersection / union : 0;
}

export function extractLocalMaxima(input: {
  scoreMap: ScoreMap;
  minimumScore: number;
  boxWidth: number;
  boxHeight: number;
  offsetX?: number;
  offsetY?: number;
}): TemplateMatchCandidate[] {
  const { scoreMap } = input;
  if (scoreMap.width <= 0 || scoreMap.height <= 0 || scoreMap.scores.length < scoreMap.width * scoreMap.height) {
    throw new Error("Score map dimensions are invalid");
  }

  const candidates: TemplateMatchCandidate[] = [];
  for (let y = 0; y < scoreMap.height; y += 1) {
    for (let x = 0; x < scoreMap.width; x += 1) {
      const index = y * scoreMap.width + x;
      const score = Number(scoreMap.scores[index]);
      if (!Number.isFinite(score) || score < input.minimumScore) {
        continue;
      }

      let isLocalMaximum = true;
      for (let neighborY = Math.max(0, y - 1); neighborY <= Math.min(scoreMap.height - 1, y + 1) && isLocalMaximum; neighborY += 1) {
        for (let neighborX = Math.max(0, x - 1); neighborX <= Math.min(scoreMap.width - 1, x + 1); neighborX += 1) {
          const neighborIndex = neighborY * scoreMap.width + neighborX;
          if (neighborIndex === index) {
            continue;
          }
          const neighborScore = Number(scoreMap.scores[neighborIndex]);
          if (neighborScore > score || (neighborScore === score && neighborIndex < index)) {
            isLocalMaximum = false;
            break;
          }
        }
      }

      if (isLocalMaximum) {
        candidates.push({
          score,
          x: x + (input.offsetX ?? 0),
          y: y + (input.offsetY ?? 0),
          width: input.boxWidth,
          height: input.boxHeight
        });
      }
    }
  }
  return candidates.sort((left, right) => right.score - left.score || left.y - right.y || left.x - right.x);
}

export function suppressOverlappingCandidates(
  candidates: readonly TemplateMatchCandidate[],
  settings: Pick<MultipleDetectionSettings, "maximumDetections" | "strictNonOverlap" | "nmsIouThreshold">
): TemplateMatchCandidate[] {
  const selected: TemplateMatchCandidate[] = [];
  const sorted = [...candidates].sort((left, right) => right.score - left.score || left.y - right.y || left.x - right.x);

  for (const candidate of sorted) {
    const overlaps = selected.some((accepted) => settings.strictNonOverlap
      ? intersectionArea(candidate, accepted) > 0
      : intersectionOverUnion(candidate, accepted) > settings.nmsIouThreshold);
    if (!overlaps) {
      selected.push(candidate);
      if (selected.length >= settings.maximumDetections) {
        break;
      }
    }
  }
  return selected;
}

export function applyCandidatePadding(
  candidate: TemplateMatchCandidate,
  paddingX: number,
  paddingY: number
): TemplateMatchCandidate {
  return {
    ...candidate,
    x: candidate.x - paddingX,
    y: candidate.y - paddingY,
    width: candidate.width + paddingX * 2,
    height: candidate.height + paddingY * 2
  };
}
