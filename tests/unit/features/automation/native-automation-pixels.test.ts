import { afterEach, describe, expect, it, vi } from "vitest";
import { nativeAutomationPixels } from "../../../../src/features/automation/native-automation-pixels.js";
import { rememberNativeTiffPath } from "../../../../src/features/images/native-tiff.js";
import { normalizeSegmentationPreprocessingConfig } from "../../../../src/features/segmentation/preprocessing.js";

function installBridge(options: { failRun?: boolean } = {}) {
  const invoke = vi.fn(async (command: string, _args?: unknown) => {
    if (command === "tiff_gray") return new Uint8Array([5, 6]).buffer;
    if (command === "preprocess_view_run") {
      if (options.failRun) throw new Error("preprocess failed");
      return new Uint8Array([10, 20]).buffer;
    }
    return undefined;
  });
  vi.stubGlobal("window", { easyLabelingNative: { invoke } });
  return { invoke, commands: () => invoke.mock.calls.map(([command]) => command) };
}

function tiffImage(): HTMLImageElement {
  const image = { naturalWidth: 2, naturalHeight: 1 } as HTMLImageElement;
  rememberNativeTiffPath(image, "D:/data/a.tif");
  return image;
}

/** A document whose canvas reads back `rgba` for any drawn image. */
function documentReading(rgba: number[]): Document {
  return {
    createElement: () => ({ width: 0, height: 0, getContext: () => ({ drawImage: vi.fn(), getImageData: () => ({ data: new Uint8ClampedArray(rgba) }) }) })
  } as unknown as Document;
}

const grayConfig = normalizeSegmentationPreprocessingConfig({ mode: "original", median: true });

describe("native automation pixels", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("reads a native TIFF's Original input from Rust instead of the canvas", async () => {
    const { invoke, commands } = installBridge();
    expect(await nativeAutomationPixels(tiffImage(), null, documentReading([]))).toEqual({ gray: new Uint8Array([5, 6]), width: 2, height: 1 });
    expect(commands()).toEqual(["tiff_gray"]);
    expect(invoke.mock.calls[0]?.[1]).toEqual({ path: "D:/data/a.tif" });
  });

  it("leaves the Original input of other images to the TS path", async () => {
    const { invoke } = installBridge();
    expect(await nativeAutomationPixels({ naturalWidth: 2, naturalHeight: 1 } as HTMLImageElement, null, documentReading([]))).toBeNull();
    expect(invoke).not.toHaveBeenCalled();
  });

  it("preprocesses a native TIFF in Rust from its resident pixels", async () => {
    const { commands } = installBridge();
    expect(await nativeAutomationPixels(tiffImage(), grayConfig, documentReading([]))).toEqual({ gray: new Uint8Array([10, 20]), width: 2, height: 1 });
    expect(commands()).toEqual(["preprocess_view_load_tiff", "preprocess_view_run"]);
  });

  it("uploads other images' pixels and keeps their alpha for the RGBA", async () => {
    const { commands } = installBridge();
    const result = await nativeAutomationPixels({ naturalWidth: 2, naturalHeight: 1 } as HTMLImageElement, grayConfig, documentReading([1, 2, 3, 100, 4, 5, 6, 255]));
    expect(result?.gray).toEqual(new Uint8Array([10, 20]));
    expect([...result!.sourceRgba!]).toEqual([1, 2, 3, 100, 4, 5, 6, 255]);
    expect(commands()).toEqual(["preprocess_view_load", "preprocess_view_run"]);
  });

  it("returns null for colour-keeping configs, with the native preprocessing off, and on errors", async () => {
    installBridge();
    const colour = normalizeSegmentationPreprocessingConfig({ mode: "original", contrast: 1.4 });
    expect(await nativeAutomationPixels(tiffImage(), colour, documentReading([]))).toBeNull();
    Reflect.set(Reflect.get(globalThis, "window"), "easyLabelingNativeOff", ["preprocessing"]);
    expect(await nativeAutomationPixels(tiffImage(), grayConfig, documentReading([]))).toBeNull();
    vi.unstubAllGlobals();
    installBridge({ failRun: true });
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    expect(await nativeAutomationPixels(tiffImage(), grayConfig, documentReading([]))).toBeNull();
  });
});
