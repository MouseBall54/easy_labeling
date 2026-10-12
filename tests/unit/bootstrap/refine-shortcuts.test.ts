import { describe, expect, it } from "vitest";

import { resolveRefineShortcut } from "../../../src/bootstrap/refine-controller.js";

const key = (code: string, modifiers: Partial<Record<"ctrlKey" | "metaKey" | "altKey" | "shiftKey", boolean>> = {}) =>
  ({ code, ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, ...modifiers });

describe("bootstrap/refine-controller shortcuts", () => {
  it("maps the refine keys by physical code (works with the Korean IME)", () => {
    expect(resolveRefineShortcut(key("KeyR"))).toBe("toggle");
    expect(resolveRefineShortcut(key("KeyE"))).toBe("refineSelected");
    expect(resolveRefineShortcut(key("KeyE", { shiftKey: true }))).toBe("refineAll");
    expect(resolveRefineShortcut(key("KeyN"))).toBe("nextReview");
    expect(resolveRefineShortcut(key("KeyN", { shiftKey: true }))).toBe("previousReview");
    expect(resolveRefineShortcut(key("KeyF"))).toBe("approve");
  });

  it("never claims an existing app or browser shortcut", () => {
    const taken = [
      key("KeyA"), key("KeyD"), key("KeyQ"), key("KeyB"), key("Digit1"), key("Delete"), key("Escape"), key("Enter"),
      key("KeyR", { altKey: true, shiftKey: true }), key("KeyR", { ctrlKey: true }), key("KeyR", { shiftKey: true }),
      key("KeyE", { ctrlKey: true }), key("KeyF", { ctrlKey: true }), key("KeyN", { ctrlKey: true }), key("KeyF", { shiftKey: true }),
      key("KeyE", { metaKey: true }), key("KeyN", { altKey: true })
    ];
    for (const event of taken) expect(resolveRefineShortcut(event)).toBeNull();
  });
});
