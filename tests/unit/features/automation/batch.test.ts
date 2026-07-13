import { describe, expect, it, vi } from "vitest";

import { runSequentialBatch } from "../../../../src/features/automation/batch.js";
import { DEFAULT_MULTIPLE_DETECTION_SETTINGS } from "../../../../src/features/automation/preset-codec.js";
import { AUTOMATION_SCHEMA_VERSION, type AutomationPreset } from "../../../../src/features/automation/types.js";

function createPreset(): AutomationPreset {
  return {
    schemaVersion: AUTOMATION_SCHEMA_VERSION,
    id: "preset-1",
    name: "preset",
    templateId: "template-1",
    layoutId: "layout-1",
    outputMode: "layout-best-match",
    relationOffset: { x: 0, y: 0 },
    manualOffset: { x: 0, y: 0 },
    matching: { minimumScore: 0.8, searchRoi: null, mode: "accurate" },
    multipleDetection: { ...DEFAULT_MULTIPLE_DETECTION_SETTINGS },
    existingLabelsPolicy: "skip",
    createdAt: "now",
    updatedAt: "now"
  };
}

describe("sequential automation batch", () => {
  it("processes one file at a time and skips already labeled files by default", async () => {
    const active: string[] = [];
    let maxActive = 0;
    const processFile = vi.fn(async (file: string) => {
      active.push(file);
      maxActive = Math.max(maxActive, active.length);
      await Promise.resolve();
      active.pop();
      return { state: "success" as const, score: 0.9, x: 3, y: 4, reason: null };
    });

    const summary = await runSequentialBatch({
      files: ["a.png", "b.png", "c.png"],
      preset: createPreset(),
      deps: {
        getFileName: (file) => file,
        isAlreadyLabeled: (file) => file === "b.png",
        processFile,
        isCancellationRequested: () => false
      }
    });

    expect(maxActive).toBe(1);
    expect(processFile).toHaveBeenCalledTimes(2);
    expect(summary).toMatchObject({ total: 3, processed: 3, success: 2, skipped: 1, failed: 0, cancelled: false });
  });

  it("stops before the next file after cancellation is requested", async () => {
    let cancelled = false;
    const summary = await runSequentialBatch({
      files: ["a.png", "b.png"],
      preset: createPreset(),
      deps: {
        getFileName: (file) => file,
        isAlreadyLabeled: () => false,
        processFile: async () => {
          cancelled = true;
          return { state: "success", score: 0.9, x: 1, y: 2, reason: null };
        },
        isCancellationRequested: () => cancelled
      }
    });

    expect(summary).toMatchObject({ processed: 1, success: 1, cancelled: true });
  });

  it("does not record an actively cancelled file as a failure", async () => {
    let cancelled = false;
    const summary = await runSequentialBatch({
      files: ["active.png", "later.png"],
      preset: createPreset(),
      deps: {
        getFileName: (file) => file,
        isAlreadyLabeled: () => false,
        processFile: async () => {
          cancelled = true;
          const error = new Error("Template matching stopped");
          error.name = "AbortError";
          throw error;
        },
        isCancellationRequested: () => cancelled
      }
    });

    expect(summary).toMatchObject({ processed: 0, success: 0, failed: 0, cancelled: true });
    expect(summary.items).toEqual([]);
  });

  it("records low-score and save failures without stopping later files", async () => {
    const summary = await runSequentialBatch({
      files: ["low.png", "disk-error.png", "good.png"],
      preset: { ...createPreset(), existingLabelsPolicy: "append" },
      deps: {
        getFileName: (file) => file,
        isAlreadyLabeled: () => true,
        isCancellationRequested: () => false,
        processFile: async (file) => {
          if (file === "low.png") {
            return { state: "failed", score: 0.42, x: 7, y: 8, reason: "Score below minimum" };
          }
          if (file === "disk-error.png") {
            throw new Error("Unable to save label file");
          }
          return { state: "success", score: 0.91, x: 9, y: 10, reason: null };
        }
      }
    });

    expect(summary).toMatchObject({ processed: 3, success: 1, failed: 2, skipped: 0 });
    expect(summary.items[0]).toMatchObject({ state: "failed", score: 0.42, reason: "Score below minimum" });
    expect(summary.items[1]).toMatchObject({ state: "failed", reason: "Unable to save label file" });
  });

  it.each(["append", "replace"] as const)("processes labeled files under the %s policy", async (policy) => {
    const processFile = vi.fn(async () => ({ state: "success" as const, score: 0.9, x: 1, y: 2, reason: null }));
    const summary = await runSequentialBatch({
      files: ["labeled.png"],
      preset: { ...createPreset(), existingLabelsPolicy: policy },
      deps: {
        getFileName: (file) => file,
        isAlreadyLabeled: () => true,
        processFile,
        isCancellationRequested: () => false
      }
    });

    expect(processFile).toHaveBeenCalledWith("labeled.png", expect.objectContaining({ existingLabelsPolicy: policy }), policy);
    expect(summary).toMatchObject({ success: 1, skipped: 0 });
  });
});
