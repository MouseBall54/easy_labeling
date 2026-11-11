import { describe, expect, it } from "vitest";
import { createAgentRefineTools, pagedOutcome, remapRule, scopeArg } from "../../../src/bootstrap/agent-tools-refine.js";
import type { RefineAgentApi } from "../../../src/bootstrap/refine-controller.js";
import { AgentToolError } from "../../../src/features/agent/agent-api.js";

const context = { signal: new AbortController().signal, progress: () => undefined };

function tools(api: Partial<RefineAgentApi>) {
  const state = { session: { workflow: "detection", currentImageFile: { name: "a.tif" }, imageFiles: [{ name: "a.tif" }], reviewFindings: new Map() } };
  return createAgentRefineTools({
    state: state as never,
    fileSystem: {} as never,
    documentRef: {} as never,
    refine: () => api as RefineAgentApi,
    confirm: async () => true,
    afterEdit: () => undefined
  });
}

const codeOf = async (work: Promise<unknown>) => work.then(() => "ok", (error: unknown) => (error instanceof AgentToolError ? error.code : String(error)));

describe("agent refine tools", () => {
  it("reads the scope: ids, class, or all / selected", () => {
    expect(scopeArg({})).toBe("all");
    expect(scopeArg({ scope: "selected" })).toBe("selected");
    expect(scopeArg({ annotationIds: ["a", 2] })).toEqual({ annotationIds: ["a", "2"] });
    expect(scopeArg({ classId: 3 })).toEqual({ classId: "3" });
    expect(() => scopeArg({ scope: "some" })).toThrow(AgentToolError);
    expect(() => scopeArg({ classId: "x" })).toThrow(AgentToolError);
  });

  it("reads a remap rule: a mapping or a whole-number offset, not both", () => {
    expect(remapRule({ mapping: [{ from: 3, to: "1" }] })).toEqual({ mode: "mapping", mapping: [{ from: "3", to: "1" }] });
    expect(remapRule({ offset: -2 })).toEqual({ mode: "offset", offset: -2 });
    for (const bad of [{}, { offset: 1.5 }, { mapping: [] }, { mapping: [{ from: "1", to: "2" }, { from: "1", to: "3" }] }, { mapping: [{ from: "1", to: "2" }], offset: 1 }]) {
      expect(() => remapRule(bad)).toThrow(AgentToolError);
    }
  });

  it("passes the preset (omitted = pane, \"\" = class settings) and maps outcomes to agent errors", async () => {
    const seen: unknown[] = [];
    const api: Partial<RefineAgentApi> = {
      refine: async (scope, options) => {
        seen.push([scope, options.preset]);
        return options.preset === "busy" ? { ok: false, message: "Refine is already running.", code: "busy" } : { ok: true, message: "done", refined: 1 };
      },
      runFolder: async () => ({ ok: false, message: "The person declined the folder run.", code: "declined" }),
      reclass: async () => { throw new Error("No reclass preset named \"x\"."); }
    };
    const set = tools(api);
    expect(await set.run_refine.run({}, context)).toMatchObject({ ok: true, refined: 1 });
    await set.run_refine.run({ preset: "", classId: "2" }, context);
    await set.run_refine.run({ preset: "Tight", annotationIds: ["a"] }, context);
    expect(seen).toEqual([["all", undefined], [{ classId: "2" }, null], [{ annotationIds: ["a"] }, "Tight"]]);
    expect(await codeOf(set.run_refine.run({ preset: "busy" }, context))).toBe("busy");
    expect(await codeOf(set.refine_folder.run({}, context))).toBe("declined");
    expect(await codeOf(set.run_reclass.run({ preset: "x" }, context))).toBe("not_found");
  });

  it("keeps run results to a page: flagged boxes first, counts per class change, dry run without afterEdit", async () => {
    const changes = Array.from({ length: 150 }, (_, index) => ({ annotationId: `b${index}`, flagged: index >= 140 }));
    const paged = pagedOutcome({ ok: true, message: "", refined: 150, changes }, {});
    expect((paged.changes as unknown[]).length).toBe(100);
    expect((paged.changes as Array<{ annotationId: string }>)[0].annotationId).toBe("b140");
    expect(paged.listed).toEqual({ total: 150, offset: 0, truncated: true });
    expect(pagedOutcome({ ok: true, message: "", changes }, { limit: 0 }).changes).toEqual([]);
    const reclassed = pagedOutcome({ ok: true, message: "", changed: [{ from: "3", to: "1" }, { from: "3", to: "1" }, { from: "2", to: "1" }] }, {});
    expect(reclassed.changesByClass).toEqual({ "3->1": 2, "2->1": 1 });

    const options: unknown[] = [];
    const edits: string[] = [];
    const state = { session: { workflow: "detection", currentImageFile: { name: "a.tif" }, imageFiles: [{ name: "a.tif" }], reviewFindings: new Map() } };
    const set = createAgentRefineTools({
      state: state as never, fileSystem: {} as never, documentRef: {} as never, confirm: async () => true, afterEdit: () => { edits.push("edit"); },
      refine: () => ({ refine: async (_scope: unknown, given: unknown) => { options.push(given); return { ok: true, message: "", changes: [] }; } }) as never
    });
    await set.run_refine.run({ dryRun: true }, context);
    expect(options).toEqual([{ preset: undefined, keepHandEdited: undefined, dryRun: true }]);
    expect(edits).toEqual([]);
  });

  it("sets the review status of the current image or named images", async () => {
    const written: unknown[] = [];
    const images: Record<string, { status: string }> = {};
    const state = { session: { workflow: "detection", currentImageFile: { name: "a.tif" }, imageFiles: [{ name: "a.tif" }, { name: "b.tif" }], reviewFindings: new Map(), reviewState: { images } } };
    const fileSystem = { setReviewImageStatus: async (name: string, status: string) => { written.push([name, status]); images[name] = { status }; } };
    const set = createAgentRefineTools({ state: state as never, fileSystem: fileSystem as never, documentRef: {} as never, refine: () => null, confirm: async () => true, afterEdit: () => undefined });
    expect(await set.set_review_status.run({ status: "reviewed" }, context)).toMatchObject({ images: ["a.tif"], reviewedInFolder: 1, imageCount: 2 });
    await set.set_review_status.run({ status: "needs-review", images: ["b.tif"] }, context);
    expect(written).toEqual([["a.tif", "reviewed"], ["b.tif", "needs-review"]]);
    expect(await codeOf(set.set_review_status.run({ status: "done" }, context))).toBe("invalid_args");
    expect(await codeOf(set.set_review_status.run({ status: "reviewed", images: ["c.tif"] }, context))).toBe("not_found");
  });

  it("folder runs are dry runs by default, take a sample or names, and apply a dry run by its resultId", async () => {
    const runs: unknown[] = [];
    const applied: string[] = [];
    const edits: string[] = [];
    const files = Array.from({ length: 10 }, (_, index) => ({ name: `i${index}.tif` }));
    const state = { session: { workflow: "detection", currentImageFile: files[0], imageFiles: files, reviewFindings: new Map() } };
    const set = createAgentRefineTools({
      state: state as never, fileSystem: {} as never, documentRef: {} as never, confirm: async () => true, afterEdit: () => { edits.push("edit"); },
      refine: () => ({
        runFolder: async (mode: string, options: { dryRun?: boolean; only?: number[]; outliers?: number }) => { runs.push([mode, options.dryRun, options.only, options.outliers]); return { ok: true, message: "", resultId: `${mode}-1` }; },
        applyFolderPlan: async (resultId: string) => { applied.push(resultId); return { ok: true, message: "" }; }
      }) as never
    });
    await set.refine_folder.run({}, context);
    await set.refine_folder.run({ sample: 3, outliers: 5 }, context);
    await set.reclass_folder.run({ images: ["i9.tif", "i2.tif"] }, context);
    expect(runs).toEqual([["edge", true, undefined, 20], ["edge", true, [0, 5, 9], 5], ["reclass", true, [9, 2], 20]]);
    expect(edits).toEqual([]);
    await set.refine_folder.run({ resultId: "edge-1" }, context);
    expect(applied).toEqual(["edge-1"]);
    expect(edits).toEqual(["edit"]);
    expect(await codeOf(set.reclass_folder.run({ resultId: "edge-1" }, context))).toBe("invalid_args");
    expect(await codeOf(set.refine_folder.run({ images: ["nope.tif"] }, context))).toBe("not_found");
    expect(await codeOf(set.refine_folder.run({ sample: 0 }, context))).toBe("invalid_args");
    expect(await codeOf(set.refine_folder.run({ dryRun: false, sample: 3 }, context))).toBe("invalid_args");
  });
});
