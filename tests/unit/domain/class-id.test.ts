import { describe, expect, it } from "vitest";

import { parseNonNegativeClassId } from "../../../src/domain/class-id.js";

describe("parseNonNegativeClassId", () => {
  it.each([
    ["0", "0"],
    ["12", "12"],
    [" 007 ", "7"]
  ])("accepts non-negative whole numbers: %s", (input, expected) => {
    expect(parseNonNegativeClassId(input)).toBe(expected);
  });

  it.each(["", "-1", "1.5", "+2", "2e3", "class-1"])("rejects invalid input: %s", (input) => {
    expect(() => parseNonNegativeClassId(input)).toThrow(/Class ID/);
  });

  it("rejects values above the safe integer range", () => {
    expect(() => parseNonNegativeClassId("9007199254740992")).toThrow("Class ID is too large.");
  });
});
