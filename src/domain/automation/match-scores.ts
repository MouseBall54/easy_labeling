// Reads template-match scores the way a person reads the score histogram: where the true matches end and the
// background starts. DOM-free; used by the agent tools (find_similar, run_template_matching, run_inference).

export interface ScoreGap {
  /** The drop between two neighbouring scores (sorted high to low). */
  gap: number;
  /** The lowest score above the drop and the highest below it. */
  above: number;
  below: number;
  /** How many candidates lie above the drop. */
  countAbove: number;
  /** Midway through the drop: a minimum score that keeps the group above. */
  suggestedMinScore: number;
}

export interface ScoreSummary {
  count: number;
  min: number | null;
  p10: number | null;
  median: number | null;
  p90: number | null;
  max: number | null;
  /** The widest drop between neighbouring scores; null under 3 candidates or when no drop stands out. */
  largestGap: ScoreGap | null;
  /** Candidates per expected object, when the caller knows how many to expect. */
  coverage?: number;
}

/** A drop counts only when it is this many times the median step between neighbouring scores (and at least 0.02). */
const GAP_FACTOR = 3;
const MIN_GAP = 0.02;

const round = (value: number) => Math.round(value * 10000) / 10000;

function quantile(sorted: readonly number[], q: number): number {
  const position = (sorted.length - 1) * q;
  const low = Math.floor(position);
  const high = Math.ceil(position);
  return sorted[low]! + (sorted[high]! - sorted[low]!) * (position - low);
}

export function summarizeScores(scores: readonly number[], options: { expected?: number } = {}): ScoreSummary {
  const finite = scores.filter((score) => Number.isFinite(score));
  const ascending = [...finite].sort((a, b) => a - b);
  const summary: ScoreSummary = {
    count: finite.length,
    min: ascending.length ? round(ascending[0]!) : null,
    p10: ascending.length ? round(quantile(ascending, 0.1)) : null,
    median: ascending.length ? round(quantile(ascending, 0.5)) : null,
    p90: ascending.length ? round(quantile(ascending, 0.9)) : null,
    max: ascending.length ? round(ascending[ascending.length - 1]!) : null,
    largestGap: largestGap(ascending)
  };
  if (options.expected !== undefined && options.expected > 0) summary.coverage = round(finite.length / options.expected);
  return summary;
}

function largestGap(ascending: readonly number[]): ScoreGap | null {
  if (ascending.length < 3) return null;
  const descending = [...ascending].reverse();
  const steps = descending.slice(1).map((score, index) => descending[index]! - score);
  const medianStep = quantile([...steps].sort((a, b) => a - b), 0.5);
  let best = -1;
  for (let index = 0; index < steps.length; index += 1) if (best < 0 || steps[index]! > steps[best]!) best = index;
  const gap = steps[best]!;
  if (gap < MIN_GAP || gap < GAP_FACTOR * medianStep) return null;
  const above = descending[best]!;
  const below = descending[best + 1]!;
  return { gap: round(gap), above: round(above), below: round(below), countAbove: best + 1, suggestedMinScore: round((above + below) / 2) };
}

/** Best against second best: a small margin means the template is not distinctive (another place looks as alike). */
export function bestMargin(best: number, second: number | null | undefined): { best: number; secondBest: number | null; margin: number | null } {
  if (second === null || second === undefined || !Number.isFinite(second)) return { best: round(best), secondBest: null, margin: null };
  return { best: round(best), secondBest: round(second), margin: round(best - second) };
}
