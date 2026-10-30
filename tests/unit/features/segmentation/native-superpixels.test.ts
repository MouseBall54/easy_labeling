import { afterEach, describe, expect, it, vi } from "vitest";
import { computeSuperpixelsNatively, unpackSuperpixels } from "../../../../src/features/segmentation/native-superpixels.js";
import { createSlicoSuperpixels, type SuperpixelResult } from "../../../../src/features/segmentation/superpixels.js";

/** The layout of Superpixels::pack (crates/el-core/src/superpixels.rs), written from a TS result. */
function pack(result: SuperpixelResult): Uint8Array {
  const count = result.regions.length;
  const neighborTotal = result.regions.reduce((total, region) => total + region.neighbors.length, 0);
  const pixels = result.labels.length;
  const buffer = new ArrayBuffer(16 + count * 16 + pixels * 4 + count * 4 + (count + 1) * 4 + neighborTotal * 4 + pixels);
  new Uint32Array(buffer, 0, 4).set([count, result.regionSize, neighborTotal, 0]);
  let offset = 16;
  const put = <T extends { set(values: ArrayLike<number>): void }>(make: (at: number) => T, values: ArrayLike<number>, bytesPer: number) => {
    make(offset).set(values);
    offset += values.length * bytesPer;
  };
  put((at) => new Float64Array(buffer, at, count), result.regions.map((region) => region.meanIntensity), 8);
  put((at) => new Float64Array(buffer, at, count), result.regions.map((region) => region.meanEdgeStrength), 8);
  put((at) => new Int32Array(buffer, at, pixels), result.labels, 4);
  put((at) => new Uint32Array(buffer, at, count), result.regions.map((region) => region.pixelCount), 4);
  const offsets = [0];
  result.regions.forEach((region) => offsets.push(offsets.at(-1)! + region.neighbors.length));
  put((at) => new Uint32Array(buffer, at, count + 1), offsets, 4);
  put((at) => new Uint32Array(buffer, at, neighborTotal), result.regions.flatMap((region) => region.neighbors), 4);
  put((at) => new Uint8Array(buffer, at, pixels), result.boundaries, 1);
  return new Uint8Array(buffer);
}

function image(width: number, height: number) {
  const rgba = new Uint8ClampedArray(width * height * 4);
  for (let index = 0; index < width * height; index += 1) {
    const value = (index % width) * 7 + Math.floor(index / width) * 3 + (index % 11 === 0 ? 90 : 0);
    rgba.set([value, value, value, 255], index * 4);
  }
  return { width, height, rgba };
}

describe("native superpixels", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("reads the packed Rust result back into the TS result shape", () => {
    const input = image(23, 17);
    const expected = createSlicoSuperpixels(input, 5);
    const actual = unpackSuperpixels(pack(expected), input.width, input.height);
    expect([...actual.labels]).toEqual([...expected.labels]);
    expect([...actual.boundaries]).toEqual([...expected.boundaries]);
    expect(actual.regions).toEqual(expected.regions);
    expect(actual.regionSize).toBe(expected.regionSize);
  });

  it("uploads gray bytes with the normalized size and settings, then takes the result by run id", async () => {
    const input = image(23, 17);
    const packed = pack(createSlicoSuperpixels(input, 5));
    const invoke = vi.fn(async (command: string, _args?: unknown, _options?: { headers: Record<string, string> }) => (command === "superpixels_run" ? 7 : packed.slice().buffer));
    vi.stubGlobal("window", { easyLabelingNative: { invoke } });
    const result = await computeSuperpixelsNatively({ gray: new Uint8Array(23 * 17) }, 23, 17, 5.4, { blur: "high" });
    expect(result.regions.length).toBeGreaterThan(0);
    const [command, , options] = invoke.mock.calls[0]!;
    expect(command).toBe("superpixels_run");
    expect(options?.headers).toMatchObject({ "x-width": "23", "x-height": "17", "x-region-size": "5", "x-format": "gray" });
    expect(JSON.parse(decodeURIComponent(options!.headers["x-settings"]!))).toEqual({ blur: "high", contrast: "medium", edgeSensitivity: "medium" });
    expect(invoke.mock.calls[1]).toEqual(["superpixels_take", { id: 7 }]);
  });

  it("reads a native TIFF in Rust by path", async () => {
    const packed = pack(createSlicoSuperpixels(image(23, 17), 8));
    const invoke = vi.fn(async (command: string, _args?: unknown) => (command === "superpixels_run_tiff" ? 3 : packed.slice().buffer));
    vi.stubGlobal("window", { easyLabelingNative: { invoke } });
    await computeSuperpixelsNatively({ tiffPath: "D:/data/a.tif" }, 23, 17, 8, {});
    expect(invoke.mock.calls[0]).toEqual(["superpixels_run_tiff", { path: "D:/data/a.tif", regionSize: 8, settings: { blur: "medium", contrast: "medium", edgeSensitivity: "medium" } }]);
  });

  it("is unavailable without the desktop bridge or with the feature switched off", async () => {
    vi.stubGlobal("window", {});
    await expect(computeSuperpixelsNatively({ gray: new Uint8Array(4) }, 2, 2, 2, {})).rejects.toThrow("unavailable");
    vi.stubGlobal("window", { easyLabelingNative: { invoke: vi.fn() }, easyLabelingNativeOff: ["superpixels"] });
    await expect(computeSuperpixelsNatively({ gray: new Uint8Array(4) }, 2, 2, 2, {})).rejects.toThrow("unavailable");
  });
});
