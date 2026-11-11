import { describe, expect, it } from "vitest";
import { checkBox, checkClassId } from "../../../src/bootstrap/agent-tools-edit.js";
import { AgentToolError } from "../../../src/features/agent/agent-api.js";

const size = { width: 100, height: 50 };

describe("agent edit input checks", () => {
  it("accepts boxes inside the image, edges included", () => {
    expect(checkBox({ x0: 0, y0: 0, x1: 100, y1: 50 }, size, "b")).toEqual({ x0: 0, y0: 0, x1: 100, y1: 50 });
    expect(checkBox({ x0: 10.5, y0: 2, x1: 11, y1: 2.25 }, size, "b")).toEqual({ x0: 10.5, y0: 2, x1: 11, y1: 2.25 });
  });

  it("rejects empty, flipped, outside and non-numeric boxes as invalid_args", () => {
    const cases = [
      { x0: 5, y0: 5, x1: 5, y1: 9 },
      { x0: 9, y0: 5, x1: 5, y1: 9 },
      { x0: -0.1, y0: 0, x1: 5, y1: 5 },
      { x0: 0, y0: 0, x1: 100.01, y1: 5 },
      { x0: 0, y0: 0, x1: 5, y1: 51 },
      { x0: Number.NaN, y0: 0, x1: 5, y1: 5 },
      { x0: "1", y0: 0, x1: 5, y1: 5 }
    ];
    for (const box of cases) {
      expect(() => checkBox(box as never, size, "boxes[0]")).toThrow(AgentToolError);
    }
    expect(() => checkBox({ x0: 0, y0: 0, x1: 101, y1: 5 }, size, "boxes[3]")).toThrow("boxes[3]: lies outside the image (0..100 x 0..50).");
  });

  it("reads class ids like the class field: whole numbers, as text or numbers", () => {
    expect(checkClassId("3", "b")).toBe("3");
    expect(checkClassId(7, "b")).toBe("7");
    expect(checkClassId(" 12 ", "b")).toBe("12");
    for (const bad of ["-1", "1.5", "", null, "a"]) {
      expect(() => checkClassId(bad, "updates[0]")).toThrow(AgentToolError);
    }
  });
});
