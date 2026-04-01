import { describe, expect, it } from "vitest";

describe("main import smoke", () => {
  it("imports src/main.ts without browser side effects", async () => {
    const module = await import("../../src/main.js");

    expect(module.createBootstrapProbe()).toBe("scaffold-ready");
    expect(typeof module.getCdnRuntimeGlobals).toBe("function");
  });
});
