import { describe, expect, it } from "vitest";
import { createAgentAutoTools } from "../../../src/bootstrap/agent-tools-auto.js";
import type { AutomationAgentApi } from "../../../src/bootstrap/automation-controller.js";
import type { InferenceAgentApi } from "../../../src/bootstrap/inference-controller.js";
import { AgentToolError } from "../../../src/features/agent/agent-api.js";

const context = { signal: new AbortController().signal, progress: () => undefined };
const codeOf = (work: Promise<unknown>) => work.then(() => "ok", (error: unknown) => (error instanceof AgentToolError ? error.code : String(error)));

/** A box as the canvas holds it (only what getRectBounds and the tools read). */
const rect = (id: string, classId: string, left: number, top: number, width: number, height: number) => ({
  type: "rect", annotationId: id, labelClass: classId, setCoords: () => undefined, getBoundingRect: () => ({ left, top, width, height })
});

function tools(options: { automation?: Partial<AutomationAgentApi>; inference?: Partial<InferenceAgentApi>; allow?: boolean; edits?: string[] }) {
  const state = { session: { workflow: "detection", imageFolderHandle: {}, currentImage: { width: 200, height: 100 }, currentImageFile: { name: "a.png" }, imageFiles: [{ name: "a.png" }, { name: "b.png" }] } };
  const canvasController = { raw: { getObjects: () => [rect("t", "2", 10, 20, 30, 40)] } };
  return createAgentAutoTools({
    state: state as never,
    canvasController: canvasController as never,
    automation: () => options.automation as AutomationAgentApi,
    inference: () => options.inference as InferenceAgentApi,
    file: () => ({ getFile: async () => new File([], "m.onnx") }),
    confirm: async () => options.allow ?? true,
    afterEdit: () => options.edits?.push("edit")
  });
}

describe("agent automation and inference tools", () => {
  it("previews by default, applies on request, and maps panel errors", async () => {
    const calls: unknown[] = [];
    const edits: string[] = [];
    const set = tools({
      edits,
      automation: {
        runPreset: async (name, options) => {
          calls.push([name, options.apply]);
          if (name === "missing") throw new Error("No automation preset named \"missing\".");
          return { preset: name, applied: options.apply };
        }
      }
    });
    await set.run_template_matching.run({ preset: "grid" }, context);
    await set.run_template_matching.run({ preset: "grid", apply: true }, context);
    expect(calls).toEqual([["grid", false], ["grid", true]]);
    expect(edits).toEqual(["edit"]);
    expect(await codeOf(set.run_template_matching.run({ preset: "missing" }, context))).toBe("not_found");
    expect(await codeOf(set.run_template_matching.run({}, context))).toBe("invalid_args");
  });

  it("asks the person before inference on every image and checks thresholds", async () => {
    const runs: unknown[] = [];
    const inference: Partial<InferenceAgentApi> = {
      status: () => ({ model: "m.onnx", ready: true, busy: false, backend: "wasm", settings: { confidence: 0.25, iou: 0.45, maxDetections: 300, outputFormat: "auto", inputSize: 640 } }),
      run: async (options) => { runs.push(options); return { imageCount: options.allImages ? 2 : 1, detectionCount: 3, folderName: "inference-m" }; }
    };
    expect(await codeOf(tools({ inference, allow: false }).run_inference.run({ allImages: true }, context))).toBe("declined");
    expect(runs).toEqual([]);
    expect(await tools({ inference }).run_inference.run({ allImages: true, confidence: 0.5 }, context)).toMatchObject({ imageCount: 2 });
    expect(await codeOf(tools({ inference }).run_inference.run({ confidence: 2 }, context))).toBe("invalid_args");
    const noModel = { ...inference, status: () => ({ ...inference.status!(), model: null }) };
    expect(await codeOf(tools({ inference: noModel }).run_inference.run({}, context))).toBe("failed");
    expect(await codeOf(tools({ inference: { loadModel: async () => { throw new Error("The Inference panel is busy."); } } }).load_model.run({ entry: { path: "C:/m.onnx", name: "m.onnx", directory: false } }, context))).toBe("busy");
  });

  it("finds similar objects from a box or a region, and pages the candidates", async () => {
    const searches: unknown[] = [];
    const candidates = Array.from({ length: 120 }, (_, index) => ({ score: 0.9, x0: index, y0: 0, x1: index + 30, y1: 40 }));
    const set = tools({ automation: { findSimilar: async (search) => { searches.push(search); return { applied: false, candidates, overlappingExisting: 1 }; } } });
    const result = await set.find_similar.run({ annotationId: "t" }, context) as { found: number; candidates: unknown[]; truncated: boolean };
    expect(searches[0]).toEqual({ roi: { x: 10, y: 20, width: 30, height: 40 }, classId: "2", minimumScore: 0.8, maximumDetections: 2000, skipOverlapping: true, apply: false });
    expect([result.found, result.candidates.length, result.truncated]).toEqual([120, 100, true]);
    await set.find_similar.run({ region: { x0: 0, y0: 0, x1: 20, y1: 20 }, classId: 5, minScore: 0.6 }, context);
    expect(searches[1]).toMatchObject({ roi: { x: 0, y: 0, width: 20, height: 20 }, classId: "5", minimumScore: 0.6 });
    expect(await codeOf(set.find_similar.run({ region: { x0: 0, y0: 0, x1: 20, y1: 20 } }, context))).toBe("invalid_args");
    expect(await codeOf(set.find_similar.run({ annotationId: "nope" }, context))).toBe("not_found");
    expect(await codeOf(set.find_similar.run({ region: { x0: 0, y0: 0, x1: 2, y1: 20 }, classId: 1 }, context))).toBe("invalid_args");
    expect(await codeOf(set.find_similar.run({ annotationId: "t", region: { x0: 0, y0: 0, x1: 20, y1: 20 } }, context))).toBe("invalid_args");
  });

  it("applies a layout at a point or where it was saved, and saves layouts", async () => {
    const calls: unknown[] = [];
    const edits: string[] = [];
    const set = tools({
      edits,
      automation: {
        applyLayout: (name, options) => {
          calls.push([name, options]);
          if (name === "missing") throw new Error('No layout named "missing".');
          return { layout: name, anchor: options.anchor ?? { x: 1, y: 2 }, annotationIds: ["n1"], discardedOutOfBounds: 0 };
        },
        saveLayout: async (name, options) => {
          calls.push([name, options]);
          if (name === "dup") throw new Error('A layout named "dup" already exists');
          return { layout: name, boxCount: 1, sourceAnchor: { x: 0, y: 0 }, overwritten: false };
        }
      }
    });
    await set.apply_layout.run({ layout: "grid" }, context);
    await set.apply_layout.run({ layout: "grid", x: 5, y: 6, replaceExisting: true }, context);
    expect(calls).toEqual([["grid", { anchor: undefined, replaceExisting: false }], ["grid", { anchor: { x: 5, y: 6 }, replaceExisting: true }]]);
    expect(edits).toEqual(["edit", "edit"]);
    expect(await codeOf(set.apply_layout.run({ layout: "grid", x: 5 }, context))).toBe("invalid_args");
    expect(await codeOf(set.apply_layout.run({ layout: "missing" }, context))).toBe("not_found");
    await set.save_layout.run({ name: "row", annotationIds: ["t"] }, context);
    expect(calls.at(-1)).toEqual(["row", { boxes: ["t"], overwrite: false }]);
    expect(await codeOf(set.save_layout.run({ name: "dup", scope: "all" }, context))).toBe("invalid_args");
  });
});
