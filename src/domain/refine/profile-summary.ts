// One side's edge profile (what the Refine Lab plots) as a few numbers an agent can read: where Refine put the
// edge, which other edges it saw and how strong, and the brightness it judged polarity by. DOM-free.
import type { RefineSide, RefineSideDiagnostics } from "./edge-refine.js";

export interface SideProfileSummary {
  side: RefineSide;
  criterion: string;
  /** +1 bright inside, -1 dark inside, 0 either; detected = what the box core and background ring showed. */
  polarity: number;
  detectedPolarity: number;
  /** Median brightness of the box core and of the background ring (null when the ring is off). */
  inside: number | null;
  outside: number | null;
  /** The edge the first pass chose, in image pixels (null: no edge found, the side stays). */
  edge: number | null;
  /** The strongest edges along the scan, strongest first: position in image pixels and strength relative to the strongest (1). */
  candidates: Array<{ at: number; strength: number }>;
  /** The scanned range in image pixels, inside end first. */
  scanned: { from: number; to: number };
  /** Paired sides (T/B or L/R picked together): this side's candidate edges and the one chosen. */
  pair?: { axis: string; prefer: string; candidates: number[]; chosen: number | null };
}

const round = (value: number) => Math.round(value * 100) / 100;

/**
 * `origin`: where the crop the diagnostics were computed on starts in the image (x for L/R, y for T/B).
 * A score sample i sits at start + i + scoreShift + 0.5 (as the Lab plots it); profile positions are pixel edges.
 */
export function summarizeSideProfile(d: RefineSideDiagnostics, origin: number, peaks = 3): SideProfileSummary {
  const candidates: Array<{ at: number; value: number }> = [];
  const score = d.score;
  if (score) {
    for (let i = 0; i < score.length; i += 1) {
      const value = score[i]!;
      if (value <= 0) continue;
      if (i > 0 && score[i - 1]! >= value) continue;
      if (i + 1 < score.length && score[i + 1]! > value) continue;
      candidates.push({ at: origin + d.start + i + d.scoreShift + 0.5, value });
    }
    candidates.sort((a, b) => b.value - a.value);
  }
  const best = candidates[0]?.value ?? 1;
  const length = d.raw.length;
  const from = origin + d.start;
  const to = origin + d.start + length;
  return {
    side: d.side,
    criterion: d.criterion,
    polarity: d.polarity,
    detectedPolarity: d.detectedPolarity,
    inside: d.inside === null ? null : Math.round(d.inside),
    outside: d.outside === null ? null : Math.round(d.outside),
    edge: d.firstPass === null ? null : round(origin + d.firstPass),
    candidates: candidates.slice(0, peaks).map((candidate) => ({ at: round(candidate.at), strength: round(candidate.value / best) })),
    scanned: d.out > 0 ? { from, to } : { from: to, to: from },
    ...(d.pair ? { pair: { axis: d.pair.axis, prefer: d.pair.prefer, candidates: d.pair.candidates.map((edge) => round(origin + edge)), chosen: d.pair.chosen === null ? null : round(origin + d.pair.chosen) } } : {})
  };
}
