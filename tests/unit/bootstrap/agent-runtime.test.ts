import { describe, expect, it } from "vitest";
import { withBoxReveal } from "../../../src/bootstrap/agent-runtime.js";
import type { AgentTool } from "../../../src/features/agent/agent-api.js";
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
