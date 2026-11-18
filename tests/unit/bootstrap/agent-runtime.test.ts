import { describe, expect, it } from "vitest";
import { withBoxReveal, withStaleIds } from "../../../src/bootstrap/agent-runtime.js";
import { AgentToolError, type AgentTool } from "../../../src/features/agent/agent-api.js";
import type { FabricRectLike } from "../../../src/features/canvas/fabric-types.js";

const rect = (id: string, visible = true) => ({ type: "rect", annotationId: id, visible, _labelText: { visible } }) as unknown as FabricRectLike;
const context = { signal: new AbortController().signal, progress: () => undefined };

describe("Live view for Detection boxes", () => {
  it("hides the boxes a tool added and shows them again in order, leaving hidden ones hidden", async () => {
    const rects = [rect("old")];
    const frames: string[][] = [];
    const tools: Record<string, AgentTool> = {
      add: { changesApp: true, run: async () => { rects.push(rect("a"), rect("b", false), rect("c")); return { added: 3 }; } },
      read: { changesApp: false, run: async () => "state" }
    };
    const wrapped = withBoxReveal(tools, {
      enabled: () => true,
      rects: () => rects,
      render: () => frames.push(rects.filter((entry) => entry.visible !== false).map((entry) => entry.annotationId!)),
      frame: async () => undefined
    });
    expect(await wrapped.add!.run({}, context)).toEqual({ added: 3 });
    // All new boxes vanish first, then come back one by one (b stays hidden as it was).
    expect(frames[0]).toEqual(["old"]);
    expect(frames).toContainEqual(["old", "a"]);
    expect(frames.at(-1)).toEqual(["old", "a", "c"]);
    expect(rects.map((entry) => [entry.visible, entry._labelText!.visible])).toEqual([[true, true], [true, true], [false, false], [true, true]]);
    expect(wrapped.read).toBe(tools.read);
  });

  it("does nothing when Live view is off", async () => {
    const rects: FabricRectLike[] = [];
    let renders = 0;
    const wrapped = withBoxReveal({ add: { changesApp: true, run: async () => { rects.push(rect("a")); return 1; } } }, {
      enabled: () => false, rects: () => rects, render: () => { renders += 1; }, frame: async () => undefined
    });
    expect(await wrapped.add!.run({}, context)).toBe(1);
    expect(renders).toBe(0);
  });
});

describe("stale annotationIds", () => {
  it("answers stale_id for ids seen on an earlier image load, and keeps not_found for ids never seen", async () => {
    let image = "a.png";
    let rects = [rect("a1"), rect("a2")];
    const notFound = async (args: Record<string, unknown>) => {
      const ids = (args.annotationIds as string[] | undefined) ?? (args.where as { annotationIds?: string[] } | undefined)?.annotationIds ?? [];
      const present = new Set(rects.map((entry) => entry.annotationId));
      const missing = ids.filter((id) => !present.has(id));
      if (missing.length) throw new AgentToolError("not_found", `No box with annotationId ${missing.join(", ")} on the current image.`);
      return { ok: true };
    };
    const tools = withStaleIds({ get: { changesApp: false, run: async () => rects.length }, del: { changesApp: true, run: notFound } }, {
      rects: () => rects, image: () => image
    });
    await tools.get!.run({}, context);
    // The image changes: a1 is gone, b1 is new.
    image = "b.png";
    rects = [rect("b1")];
    await expect(tools.del!.run({ annotationIds: ["b1"] }, context)).resolves.toEqual({ ok: true });
    await expect(tools.del!.run({ annotationIds: ["a1"] }, context)).rejects.toMatchObject({ code: "stale_id", message: expect.stringContaining("belonged to a.png") });
    await expect(tools.del!.run({ where: { annotationIds: ["a2"] } }, context)).rejects.toMatchObject({ code: "stale_id" });
    await expect(tools.del!.run({ annotationIds: ["never"] }, context)).rejects.toMatchObject({ code: "not_found" });
    // The same image loaded again: its old ids are stale too.
    rects = [rect("b9")];
    await expect(tools.del!.run({ annotationIds: ["b1"] }, context)).rejects.toMatchObject({ code: "stale_id", message: expect.stringContaining("b.png before it was loaded again") });
  });
});
