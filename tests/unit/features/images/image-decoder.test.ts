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
});
