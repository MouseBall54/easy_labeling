import { afterEach, describe, expect, it, vi } from "vitest";
import { createNativeViewPreprocessor, grayBytesToRgba } from "../../../../src/features/segmentation/native-preprocessing.js";
import { normalizeSegmentationPreprocessingConfig } from "../../../../src/features/segmentation/preprocessing.js";

type Invoke = (command: string, args?: unknown, options?: { headers?: Record<string, string> }) => Promise<unknown>;

/** A fake Tauri bridge holding one resident image, like src-tauri/src/native.rs. */
function installBridge(failUploads = 0) {
  let resident: string | null = null;
  let uploadsToFail = failUploads;
  const invoke = vi.fn<Invoke>(async (command, args, options) => {
    if (command === "preprocess_view_load") {
      if (uploadsToFail > 0) {
        uploadsToFail -= 1;
        throw new Error("upload failed");
      }
      resident = decodeURIComponent(options?.headers?.["x-key"] ?? "");
      return undefined;
    }
    if (command === "preprocess_view_load_tiff") {
      resident = (args as { key: string }).key;
      return undefined;
    }
    if (command === "preprocess_view_run") {
      const { key } = args as { key: string };
      if (key !== resident) throw new Error("View image is not loaded");
      return new Uint8Array([10, 20]).buffer;
    }
    throw new Error(`unexpected ${command}`);
  });
  vi.stubGlobal("window", { easyLabelingNative: { invoke } });
  return { invoke, evict: () => { resident = null; } };
}

const input = { width: 2, height: 1, rgba: new Uint8ClampedArray([1, 2, 3, 200, 4, 5, 6, 255]) };
const grayConfig = normalizeSegmentationPreprocessingConfig({ mode: "original", median: true });
const commands = (invoke: ReturnType<typeof installBridge>["invoke"]) => invoke.mock.calls.map(([command]) => command);

describe("native Processed view", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("writes gray bytes into RGB and keeps the source alpha", () => {
    expect([...grayBytesToRgba(new Uint8Array([7, 9]), input.rgba)]).toEqual([7, 7, 7, 200, 9, 9, 9, 255]);
  });

  it("writes opaque pixels when there is no source RGBA", () => {
    expect([...grayBytesToRgba(new Uint8Array([7, 9]))]).toEqual([7, 7, 7, 255, 9, 9, 9, 255]);
  });

  it("is unavailable outside the desktop app", () => {
    vi.stubGlobal("window", {});
    expect(createNativeViewPreprocessor()).toBeNull();
  });

  it("uploads an image once and then sends only the config", async () => {
    const { invoke } = installBridge();
    const preprocessor = createNativeViewPreprocessor()!;
    expect([...(await preprocessor.preprocess("img-a", input, grayConfig))!]).toEqual([10, 20]);
    await preprocessor.preprocess("img-a", input, normalizeSegmentationPreprocessingConfig({ mode: "edge" }));
    expect(commands(invoke)).toEqual(["preprocess_view_load", "preprocess_view_run", "preprocess_view_run"]);
  });

  it("uploads again when Rust holds another image", async () => {
    const { invoke, evict } = installBridge();
    const preprocessor = createNativeViewPreprocessor()!;
    await preprocessor.preprocess("img-a", input, grayConfig);
    evict();
    await preprocessor.preprocess("img-a", input, grayConfig);
    expect(commands(invoke)).toEqual(["preprocess_view_load", "preprocess_view_run", "preprocess_view_run", "preprocess_view_load", "preprocess_view_run"]);
  });

  it("reads a native TIFF from Rust's resident decode instead of uploading pixels", async () => {
    const { invoke } = installBridge();
    const preprocessor = createNativeViewPreprocessor()!;
    const tiff = { width: 2, height: 1, tiffPath: "D:/data/a.tif" };
    expect([...(await preprocessor.preprocess("img-t", tiff, grayConfig))!]).toEqual([10, 20]);
    await preprocessor.preprocess("img-t", tiff, normalizeSegmentationPreprocessingConfig({ mode: "edge" }));
    expect(commands(invoke)).toEqual(["preprocess_view_load_tiff", "preprocess_view_run", "preprocess_view_run"]);
    expect(invoke.mock.calls[0]?.[1]).toEqual({ key: "img-t", path: "D:/data/a.tif" });
  });

  it("does not reuse a failed upload", async () => {
    const { invoke } = installBridge(1);
    const preprocessor = createNativeViewPreprocessor()!;
    await expect(preprocessor.preprocess("img-a", input, grayConfig)).rejects.toThrow("upload failed");
    await preprocessor.preprocess("img-a", input, grayConfig);
    expect(commands(invoke)).toEqual(["preprocess_view_load", "preprocess_view_load", "preprocess_view_run"]);
  });

  it("moves pixels through shared buffers when the runtime offers them", async () => {
    const invoke = vi.fn<Invoke>(async () => undefined);
    const upload = vi.fn(async () => 7);
    const download = vi.fn(async (_command: string, _args: unknown, use: (bytes: Uint8Array) => unknown) => use(new Uint8Array([30, 40])));
    vi.stubGlobal("window", { easyLabelingNative: { invoke, upload, download } });
    const result = await createNativeViewPreprocessor()!.preprocess("img-a", input, grayConfig);
    expect([...result!]).toEqual([30, 40]);
    expect(upload).toHaveBeenCalledTimes(1);
    expect(invoke).toHaveBeenCalledWith("preprocess_view_load", new Uint8Array(0), { headers: expect.objectContaining({ "x-shared-buffer": "7" }) });
    expect(download.mock.calls[0]?.[0]).toBe("preprocess_view_run_shared");
  });

  it("falls back to raw transfers when shared buffers fail", async () => {
    const { invoke } = installBridge();
    const native = Reflect.get(globalThis, "window").easyLabelingNative as Record<string, unknown>;
    native.upload = vi.fn(async () => { throw new Error("no ICoreWebView2_17"); });
    native.download = vi.fn(async () => { throw new Error("no ICoreWebView2_17"); });
    const result = await createNativeViewPreprocessor()!.preprocess("img-a", input, grayConfig);
    expect([...result!]).toEqual([10, 20]);
    expect(commands(invoke)).toEqual(["preprocess_view_load", "preprocess_view_run"]);
  });

  it("leaves colour-keeping configs to the TS path", async () => {
    const { invoke } = installBridge();
    const preprocessor = createNativeViewPreprocessor()!;
    expect(await preprocessor.preprocess("img-a", input, normalizeSegmentationPreprocessingConfig({ mode: "original", contrast: 1.4 }))).toBeNull();
    expect(invoke).not.toHaveBeenCalled();
  });
});
