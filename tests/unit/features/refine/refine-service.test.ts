import { afterEach, describe, expect, it, vi } from "vitest";
import { rememberNativeTiffPath } from "../../../../src/features/images/native-tiff.js";
import { createRefineService } from "../../../../src/features/refine/refine-service.js";

type Message = Record<string, unknown> & { id: number; type: string };

/** workers/refine-worker.js: decodes bitmaps to gray for the native refine, or refines itself (web). */
class FakeWorker {
  static messages: Message[] = [];
  onmessage: ((event: { data: unknown }) => void) | null = null;
  onerror = null;
  postMessage(message: Message): void {
    FakeWorker.messages.push(message);
    const result = message.type === "gray" ? { gray: new Uint8Array(2), width: 2, height: 1 } : message.type === "refine" ? [] : null;
    queueMicrotask(() => this.onmessage?.({ data: { id: message.id, result } }));
  }
  terminate(): void {}
}

function install(options: { failTiff?: boolean; off?: string[] } = {}) {
  FakeWorker.messages = [];
  const invoke = vi.fn(async (command: string, _args?: unknown) => {
    if (command === "refine_load_tiff" && options.failTiff) throw new Error("D:/data/a.tif: not found");
    return command === "refine_run" ? [] : undefined;
  });
  const createImageBitmap = vi.fn(async () => ({ close() {} }));
  vi.stubGlobal("Worker", FakeWorker);
  vi.stubGlobal("createImageBitmap", createImageBitmap);
  vi.stubGlobal("window", { easyLabelingNative: { invoke }, easyLabelingNativeOff: options.off ?? [] });
  return { invoke, createImageBitmap, commands: () => invoke.mock.calls.map(([command]) => command) };
}

function nativeTiffImage(): HTMLImageElement {
  const image = { naturalWidth: 2, naturalHeight: 1 } as HTMLImageElement;
  rememberNativeTiffPath(image, "D:/data/a.tif");
  return image;
}

const refine = (image: HTMLImageElement) => createRefineService().refine(image, [], {}, [], { kind: "original" });

describe("refine service image loading", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("loads a natively decoded TIFF in Rust without a bitmap or upload", async () => {
    const { invoke, createImageBitmap, commands } = install();
    await refine(nativeTiffImage());
    expect(commands()).toEqual(["refine_load_tiff", "refine_run"]);
    expect(invoke.mock.calls[0]?.[1]).toEqual({ key: expect.any(String), path: "D:/data/a.tif" });
    expect(createImageBitmap).not.toHaveBeenCalled();
  });

  it("falls back to the bitmap upload when Rust cannot load the TIFF", async () => {
    const { createImageBitmap, commands } = install({ failTiff: true });
    await refine(nativeTiffImage());
    expect(commands()).toEqual(["refine_load_tiff", "refine_load_image", "refine_run"]);
    expect(createImageBitmap).toHaveBeenCalledTimes(1);
  });

  it("hands the TS worker a bitmap when the native refine is off", async () => {
    const { invoke, createImageBitmap } = install({ off: ["refine"] });
    await refine(nativeTiffImage());
    expect(createImageBitmap).toHaveBeenCalledTimes(1);
    expect(FakeWorker.messages.map(({ type }) => type)).toEqual(["image", "refine"]);
    expect(FakeWorker.messages[0]).not.toHaveProperty("tiffPath");
    expect(invoke).not.toHaveBeenCalled();
  });
});
