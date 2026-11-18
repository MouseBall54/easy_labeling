import { describe, expect, it } from "vitest";
import { bestMargin, summarizeScores } from "../../../../src/domain/automation/match-scores.js";

describe("template match score summary", () => {
  it("finds the drop between true matches and background in a two-group distribution", () => {
    const matches = [0.97, 0.96, 0.955, 0.95, 0.94, 0.935, 0.93];
    const background = [0.71, 0.7, 0.69, 0.68, 0.675, 0.66, 0.65, 0.64];
    const summary = summarizeScores([...background, ...matches], { expected: 7 });
    expect(summary.count).toBe(15);
    expect(summary.max).toBe(0.97);
    expect(summary.min).toBe(0.64);
    expect(summary.largestGap).toEqual({ gap: 0.22, above: 0.93, below: 0.71, countAbove: 7, suggestedMinScore: 0.82 });
    expect(summary.coverage).toBe(2.1429);
  });

  it("reports no gap for one even group or too few scores", () => {
    expect(summarizeScores([0.9, 0.89, 0.88, 0.87, 0.86, 0.85]).largestGap).toBeNull();
    expect(summarizeScores([0.9, 0.5]).largestGap).toBeNull();
    expect(summarizeScores([])).toMatchObject({ count: 0, min: null, median: null, largestGap: null });
  });

  it("measures how far the best match stands above the next place", () => {
    expect(bestMargin(0.95, 0.62)).toEqual({ best: 0.95, secondBest: 0.62, margin: 0.33 });
    expect(bestMargin(0.95, null)).toEqual({ best: 0.95, secondBest: null, margin: null });
  });
});
