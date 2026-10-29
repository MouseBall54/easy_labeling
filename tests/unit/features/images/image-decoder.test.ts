import { afterEach, describe, expect, it, vi } from "vitest";

import { createImageDecoder } from "../../../../src/features/images/image-decoder.js";
import type { FileHandleLike } from "../../../../src/types/files.js";

class FakeImage {
  src = "";
  async decode(): Promise<void> {}
}

function createFileHandle(name: string, arrayBuffer: ArrayBuffer): FileHandleLike {
  return {
    name,
    async getFile() {
      return {
        name,
        async arrayBuffer() {
          return arrayBuffer;
        }
      } as unknown as File;
    }
  } as unknown as FileHandleLike;
}

describe("createImageDecoder", () => {
  const originalImage = globalThis.Image;

  afterEach(() => {
    globalThis.Image = originalImage;
  });

  it("initializes the TIFF heap once and decodes via toBlob, not toDataURL", async () => {
    globalThis.Image = FakeImage as unknown as typeof Image;

    const toBlob = vi.fn((callback: (blob: Blob | null) => void) => {
      callback({ size: 4 } as unknown as Blob);
    });
    const toCanvas = vi.fn(() => ({ toBlob }));
    const initialize = vi.fn();
    function TiffRef(this: { toCanvas: typeof toCanvas }) {
      this.toCanvas = toCanvas;
    }
    TiffRef.initialize = initialize;

    const createObjectURL = vi.fn(() => "blob:fake-url");
    const revokeObjectURL = vi.fn();

    const decode = createImageDecoder({
      tiffRef: TiffRef,
      urlRuntime: { createObjectURL, revokeObjectURL }
    });

    const buffer = new ArrayBuffer(8);
    await decode(createFileHandle("scan.tif", buffer));
    await decode(createFileHandle("scan2.tiff", buffer));

    expect(initialize).toHaveBeenCalledTimes(1);
    expect(initialize).toHaveBeenCalledWith({ TOTAL_MEMORY: 256 * 1024 * 1024 });
    expect(toBlob).toHaveBeenCalledTimes(2);
    expect(createObjectURL).toHaveBeenCalledTimes(2);
    expect(revokeObjectURL).toHaveBeenCalledTimes(2);
  });

  it("falls back to a plain object URL for non-TIFF files", async () => {
    globalThis.Image = FakeImage as unknown as typeof Image;

    const createObjectURL = vi.fn(() => "blob:fake-url");
    const revokeObjectURL = vi.fn();
    const decode = createImageDecoder({
      tiffRef: null,
      urlRuntime: { createObjectURL, revokeObjectURL }
    });

    const image = await decode(createFileHandle("photo.png", new ArrayBuffer(4)));

    expect(image).toBeInstanceOf(FakeImage);
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledTimes(1);
  });
  it("shows natively decoded TIFFs without tiff.js, and uses tiff.js for files Rust leaves to it", async () => {
    globalThis.Image = FakeImage as unknown as typeof Image;
    const handle = createFileHandle("scan.tif", new ArrayBuffer(8));
    const other = createFileHandle("rgb.tif", new ArrayBuffer(8));
    const invoke = vi.fn(async () => {
      throw new Error("Not a natively decoded TIFF");
    });
    const download = vi.fn(async (_command: string, args: { path: string }, use: (bytes: Uint8Array) => unknown) => {
      if (args.path === "C:/data/rgb.tif") throw new Error("Not a natively decoded TIFF");
      return use(new Uint8Array([66, 77]));
    });
    const pathOf = (value: unknown) => (value === handle ? "C:/data/scan.tif" : value === other ? "C:/data/rgb.tif" : null);
    vi.stubGlobal("window", { easyLabelingNative: { invoke, download, pathOf } });
    const toCanvas = vi.fn(() => ({ toBlob: (callback: (blob: Blob | null) => void) => callback({ size: 4 } as unknown as Blob) }));
    function TiffRef(this: { toCanvas: typeof toCanvas }) {
      this.toCanvas = toCanvas;
    }
    const blobs: Blob[] = [];
    const decode = createImageDecoder({
      tiffRef: TiffRef,
      urlRuntime: { createObjectURL: vi.fn((blob: Blob) => { blobs.push(blob); return "blob:url"; }), revokeObjectURL: vi.fn() }
    });
    try {
      await decode(handle);
      expect(toCanvas).not.toHaveBeenCalled();
      expect(blobs[0]?.type).toBe("image/bmp");
      expect(download).toHaveBeenCalledWith("tiff_bmp_shared", { path: "C:/data/scan.tif" }, expect.any(Function));

      await decode(other);
      expect(toCanvas).toHaveBeenCalledTimes(1);
      expect(invoke).not.toHaveBeenCalled(); // no raw retry for a file outside the native scope
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
