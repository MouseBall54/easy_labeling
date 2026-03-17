import { describe, expect, it, vi } from "vitest";

import {
  createImageSessionService,
  type DecodeImageInput,
  type ImageSessionServiceState
} from "../../../../src/features/images/image-session-service.js";
import type {
  DirectoryEntryLike,
  DirectoryHandleLike,
  FileHandleLike,
  FileTextLike,
  WritableFileLike
} from "../../../../src/types/files.js";

class NotFoundError extends Error {
  override name = "NotFoundError";
}

class MockWritable implements WritableFileLike {
  public writes: string[] = [];
  public closed = false;

  constructor(private readonly onWrite: (data: string) => void) {}

  async write(data: string): Promise<void> {
    this.writes.push(data);
    this.onWrite(data);
  }

  async close(): Promise<void> {
    this.closed = true;
  }
}

class MockFileHandle implements FileHandleLike {
  public readonly kind = "file" as const;
  private content: string;
  private readonly buffer: ArrayBuffer | undefined;
  public writable: MockWritable;

  constructor(name: string, content = "", buffer?: ArrayBuffer) {
    this.name = name;
    this.content = content;
    this.buffer = buffer;
    this.writable = new MockWritable((data) => {
      this.content = data;
    });
  }

  public readonly name: string;

  setContent(content: string): void {
    this.content = content;
  }

  async getFile(): Promise<FileTextLike> {
    const buffer = this.buffer;
    if (buffer) {
      const arrayBuffer = async (): Promise<ArrayBuffer> => buffer;
      return {
        name: this.name,
        text: async () => this.content,
        arrayBuffer
      };
    }

    return {
      name: this.name,
      text: async () => this.content
    };
  }

  async createWritable(): Promise<WritableFileLike> {
    this.writable = new MockWritable((data) => {
      this.content = data;
    });
    return this.writable;
  }
}

class MockDirectoryHandle implements DirectoryHandleLike {
  public readonly kind = "directory" as const;
  private readonly entries: Array<DirectoryEntryLike | FileHandleLike | DirectoryHandleLike> = [];
  private readonly fileMap = new Map<string, MockFileHandle>();
  private readonly dirMap = new Map<string, MockDirectoryHandle>();

  constructor(public readonly name: string) {}

  withFile(fileHandle: MockFileHandle): this {
    this.fileMap.set(fileHandle.name, fileHandle);
    this.entries.push(fileHandle);
    return this;
  }

  withDirectory(directoryHandle: MockDirectoryHandle): this {
    this.dirMap.set(directoryHandle.name, directoryHandle);
    this.entries.push(directoryHandle);
    return this;
  }

  async *values(): AsyncIterable<DirectoryEntryLike | FileHandleLike | DirectoryHandleLike> {
    for (const entry of this.entries) {
      yield entry;
    }
  }

  async getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<DirectoryHandleLike> {
    const found = this.dirMap.get(name);
    if (found) {
      return found;
    }
    if (options?.create) {
      const created = new MockDirectoryHandle(name);
      this.dirMap.set(name, created);
      this.entries.push(created);
      return created;
    }
    throw new NotFoundError(name);
  }

  async getFileHandle(name: string, options?: { create?: boolean }): Promise<FileHandleLike> {
    const found = this.fileMap.get(name);
    if (found) {
      return found;
    }
    if (options?.create) {
      const created = new MockFileHandle(name, "");
      this.fileMap.set(name, created);
      this.entries.push(created);
      return created;
    }
    throw new NotFoundError(name);
  }
}

function createState(): ImageSessionServiceState {
  return {
    imageFolderHandle: null,
    labelFolderHandle: null,
    imageFiles: [],
    imageLabelStatus: new Map<string, boolean>(),
    currentImageFile: null,
    currentImage: null,
    currentLoadToken: 0,
    isAutoSaveEnabled: false,
    classFiles: [new MockFileHandle("old.yaml")],
    classNames: new Map<string, string>([["0", "old"]]),
    previewImageCache: new Map<string, string>([
      ["a", "blob:old-preview"],
      ["b", "https://example.com/existing.png"]
    ]),
    saveTimeout: null
  };
}

describe("features/images/image-session-service", () => {
  it("auto-loads lowercase label subfolder and clears session caches on image folder selection", async () => {
    const labelDir = new MockDirectoryHandle("label");
    const imageDir = new MockDirectoryHandle("images")
      .withDirectory(labelDir)
      .withFile(new MockFileHandle("2.jpg"))
      .withFile(new MockFileHandle("1.jpg"));
    const state = createState();
    const revoked: string[] = [];
    const decodeImage = vi.fn(async ({ fileHandle }: DecodeImageInput) => `decoded:${fileHandle.name}`);

    const service = createImageSessionService(state, {
      decodeImage,
      readCurrentLabelsAsYolo: () => "",
      applyLoadedYolo: vi.fn(),
      clearPendingSaveTimeout: vi.fn(),
      revokePreviewUrl: (url) => {
        revoked.push(url);
      }
    });

    const result = await service.selectImageFolder(imageDir);

    expect(result.labelFolderStatus).toBe("auto");
    expect(state.labelFolderHandle).toBe(labelDir);
    expect(state.classFiles).toEqual([]);
    expect([...state.classNames.entries()]).toEqual([]);
    expect(revoked).toEqual(["blob:old-preview"]);
    expect(state.previewImageCache.size).toBe(0);
    expect(state.imageFiles.map((file) => file.name)).toEqual(["1.jpg", "2.jpg"]);
    expect(state.currentImageFile?.name).toBe("1.jpg");
    expect(decodeImage).toHaveBeenCalledTimes(1);
  });

  it("creates missing lowercase label subfolder when creation callback allows it", async () => {
    const imageDir = new MockDirectoryHandle("images").withFile(new MockFileHandle("1.jpg"));
    const state = createState();
    const service = createImageSessionService(state, {
      decodeImage: vi.fn(async () => "decoded"),
      readCurrentLabelsAsYolo: () => "",
      applyLoadedYolo: vi.fn(),
      clearPendingSaveTimeout: vi.fn(),
      revokePreviewUrl: vi.fn(),
      shouldCreateMissingLabelFolder: () => true
    });

    const result = await service.selectImageFolder(imageDir);

    expect(result.labelFolderStatus).toBe("created");
    expect(result.labelFolderHandle?.name).toBe("label");
    expect(state.labelFolderHandle?.name).toBe("label");
  });

  it("precomputes label-file existence and numeric image ordering during listing", async () => {
    const labelDir = new MockDirectoryHandle("label")
      .withFile(new MockFileHandle("image2.txt"))
      .withFile(new MockFileHandle("image10.txt"));
    const imageDir = new MockDirectoryHandle("images")
      .withFile(new MockFileHandle("image10.jpg"))
      .withFile(new MockFileHandle("image2.jpg"))
      .withFile(new MockFileHandle("image1.jpg"))
      .withFile(new MockFileHandle("notes.txt"));
    const state = createState();
    state.imageFolderHandle = imageDir;
    state.labelFolderHandle = labelDir;

    const service = createImageSessionService(state, {
      decodeImage: vi.fn(async ({ fileHandle }: DecodeImageInput) => `decoded:${fileHandle.name}`),
      readCurrentLabelsAsYolo: () => "",
      applyLoadedYolo: vi.fn(),
      clearPendingSaveTimeout: vi.fn(),
      revokePreviewUrl: vi.fn()
    });

    await service.listImageFiles();

    expect(state.imageFiles.map((file) => file.name)).toEqual(["image1.jpg", "image2.jpg", "image10.jpg"]);
    expect(state.imageLabelStatus.get("image1.jpg")).toBe(false);
    expect(state.imageLabelStatus.get("image2.jpg")).toBe(true);
    expect(state.imageLabelStatus.get("image10.jpg")).toBe(true);
    expect(state.currentImageFile?.name).toBe("image1.jpg");
  });

  it("runs autosave before navigating to a new image load", async () => {
    const labelDir = new MockDirectoryHandle("label");
    const oldImage = new MockFileHandle("1.jpg");
    const newImage = new MockFileHandle("2.jpg");
    const state = createState();
    state.isAutoSaveEnabled = true;
    state.currentImageFile = oldImage;
    state.labelFolderHandle = labelDir;
    const order: string[] = [];

    const service = createImageSessionService(state, {
      decodeImage: vi.fn(async () => {
        order.push("decode");
        return "decoded:2.jpg";
      }),
      readCurrentLabelsAsYolo: () => {
        order.push("autosave-read");
        return "  0 0.5 0.5 1 1\n";
      },
      applyLoadedYolo: vi.fn(),
      clearPendingSaveTimeout: vi.fn(),
      revokePreviewUrl: vi.fn()
    });

    await service.loadImageAndLabels(newImage);

    const savedHandle = await labelDir.getFileHandle("1.txt");
    expect((savedHandle as MockFileHandle).writable.writes).toEqual(["0 0.5 0.5 1 1"]);
    expect(order[0]).toBe("autosave-read");
    expect(order[1]).toBe("decode");
  });

  it("keeps latest load token result and prevents stale overlapping loads from committing", async () => {
    const imageA = new MockFileHandle("1.jpg");
    const imageB = new MockFileHandle("2.jpg");
    const state = createState();
    const loadOrder: string[] = [];
    let resolveFirst: (value: unknown) => void = () => {
      throw new Error("missing first resolver");
    };
    let hasFirstResolver = false;

    const service = createImageSessionService(state, {
      decodeImage: vi.fn(({ fileHandle }: DecodeImageInput) => {
        if (fileHandle.name === "1.jpg") {
          return new Promise((resolve) => {
            resolveFirst = resolve;
            hasFirstResolver = true;
          });
        }
        loadOrder.push("decode-2");
        return Promise.resolve("decoded:2.jpg");
      }),
      readCurrentLabelsAsYolo: () => "",
      applyLoadedYolo: vi.fn((yoloData: string) => {
        loadOrder.push(`labels:${yoloData}`);
      }),
      clearPendingSaveTimeout: vi.fn(),
      revokePreviewUrl: vi.fn()
    });

    const firstLoad = service.loadImageAndLabels(imageA);
    const secondLoad = service.loadImageAndLabels(imageB);
    await secondLoad;
    if (hasFirstResolver) {
      resolveFirst("decoded:1.jpg");
    }
    await firstLoad;

    expect(state.currentImageFile?.name).toBe("2.jpg");
    expect(state.currentImage).toBe("decoded:2.jpg");
    expect(loadOrder).toEqual(["decode-2"]);
  });

  it("treats NotFoundError during label load as empty-state instead of fatal", async () => {
    const labelDir = new MockDirectoryHandle("label");
    const state = createState();
    state.labelFolderHandle = labelDir;
    state.currentLoadToken = 3;
    const applyLoadedYolo = vi.fn();

    const service = createImageSessionService(state, {
      decodeImage: vi.fn(async () => "decoded"),
      readCurrentLabelsAsYolo: () => "",
      applyLoadedYolo,
      clearPendingSaveTimeout: vi.fn(),
      revokePreviewUrl: vi.fn()
    });

    await expect(service.loadLabels("1.jpg", 3)).resolves.toBeUndefined();
    expect(applyLoadedYolo).not.toHaveBeenCalled();
  });

  it("preserves mismatch: listing uses existence while save updates in-memory by trimmed content", async () => {
    const labelDir = new MockDirectoryHandle("label").withFile(new MockFileHandle("1.txt", "0 0.1 0.1 0.2 0.2"));
    const image = new MockFileHandle("1.jpg");
    const imageDir = new MockDirectoryHandle("images").withFile(image);
    const state = createState();
    state.imageFolderHandle = imageDir;
    state.labelFolderHandle = labelDir;

    const service = createImageSessionService(state, {
      decodeImage: vi.fn(async () => "decoded"),
      readCurrentLabelsAsYolo: () => " \n ",
      applyLoadedYolo: vi.fn(),
      clearPendingSaveTimeout: vi.fn(),
      revokePreviewUrl: vi.fn()
    });

    await service.listImageFiles();
    expect(state.imageLabelStatus.get("1.jpg")).toBe(true);

    state.currentImageFile = image;
    await service.saveLabels();
    expect(state.imageLabelStatus.get("1.jpg")).toBe(false);

    await service.listImageFiles();
    expect(state.imageLabelStatus.get("1.jpg")).toBe(true);
  });
});
