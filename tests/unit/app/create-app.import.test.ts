import { describe, expect, it } from "vitest";

type GlobalTrapName =
  | "window"
  | "document"
  | "navigator"
  | "bootstrap"
  | "fabric"
  | "Tiff"
  | "localStorage";

function installGlobalTrap(name: GlobalTrapName): () => void {
  const scope = globalThis as Record<string, unknown>;
  const descriptor = Object.getOwnPropertyDescriptor(scope, name);

  if (descriptor && !descriptor.configurable) {
    return () => undefined;
  }

  Object.defineProperty(scope, name, {
    configurable: true,
    get(): never {
      throw new Error(`unexpected global access on import: ${name}`);
    }
  });

  return () => {
    if (descriptor) {
      Object.defineProperty(scope, name, descriptor);
      return;
    }

    delete scope[name];
  };
}

describe("createApp import", () => {
  it("imports without touching browser globals", async () => {
    const globalsToTrap: GlobalTrapName[] = [
      "window",
      "document",
      "navigator",
      "bootstrap",
      "fabric",
      "Tiff",
      "localStorage"
    ];
    const cleanups = globalsToTrap.map((name) => installGlobalTrap(name));

    try {
      const module = await import("../../../src/app/createApp.js");
      expect(typeof module.createApp).toBe("function");
    } finally {
      cleanups.reverse().forEach((cleanup) => cleanup());
    }
  });

  it("defaults fresh app state to detection workflow", async () => {
    const module = await import("../../../src/app/state.js");
    expect(module.createInitialAppState().session.workflow).toBe("detection");
  });

});
