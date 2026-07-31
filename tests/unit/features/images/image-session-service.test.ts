import { describe, expect, it, vi } from "vitest";

import { resolveAnnotationAssetPaths } from "../../../../src/domain/annotations/paths.js";
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

function toArrayBuffer(value: ArrayBuffer | Uint8Array): ArrayBuffer {
  if (value instanceof ArrayBuffer) {
    return value.slice(0);
  }
  return value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength) as ArrayBuffer;
}

class MockWritable implements WritableFileLike {
  constructor(private readonly onWrite: (data: string | ArrayBuffer) => void) {}

  async write(data: string | ArrayBuffer): Promise<void> {
    this.onWrite(data);
  }

  async close(): Promise<void> {
    return;
  }
}

class MockFileHandle implements FileHandleLike {
  public readonly kind = "file" as const;
  private content: string | ArrayBuffer | Uint8Array;
  private readonly buffer: ArrayBuffer | undefined;

  constructor(name: string, content: string | ArrayBuffer | Uint8Array = "", buffer?: ArrayBuffer) {
    this.name = name;
    this.content = content;
    this.buffer = buffer;
  }

  public readonly name: string;

  async getFile(): Promise<FileTextLike> {
    const buffer = this.buffer
      ?? (this.content instanceof ArrayBuffer || this.content instanceof Uint8Array
        ? toArrayBuffer(this.content)
        : undefined);
    if (buffer) {
      const arrayBuffer = async (): Promise<ArrayBuffer> => buffer;
      return {
        name: this.name,
        text: async () => typeof this.content === "string" ? this.content : "",
        arrayBuffer
      };
    }

    return {
      name: this.name,
      text: async () => typeof this.content === "string" ? this.content : ""
    };
  }

  async createWritable(): Promise<WritableFileLike> {
    return new MockWritable((data) => {
      this.content = data;
    });
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
    imageWorkflowStatus: new Map(),
    currentImageFile: null,
    currentImage: null,
    currentLoadToken: 0,
    isAutoSaveEnabled: false,
    workflow: "detection",
    classFiles: [new MockFileHandle("old.yaml")],
    classNames: new Map<string, string>([["0", "old"]]),
    saveTimeout: null
  };
}

describe("features/images/image-session-service", () => {
  it("loads image folder and initializes detection/segmentation annotation status", async () => {
    const labelDir = new MockDirectoryHandle("label")
      .withFile(new MockFileHandle("1.txt", "0 0.5 0.5 0.1 0.1\n2 0.25 0.25 0.2 0.2\n"))
      .withFile(new MockFileHandle("2.txt", "\n"));
    const maskDir = new MockDirectoryHandle("mask").withFile(new MockFileHandle("2.png", new Uint8Array([1, 2, 3])));
    const imageDir = new MockDirectoryHandle("images")
      .withDirectory(labelDir)
      .withDirectory(maskDir)
      .withFile(new MockFileHandle("1.jpg"))
      .withFile(new MockFileHandle("2.jpg"));

    const state = createState();
    const decodeImage = vi.fn(async ({ fileHandle }: DecodeImageInput) => `decoded:${fileHandle.name}`);

    const service = createImageSessionService(state, {
      decodeImage,
      readCurrentLabelsAsYolo: () => "",
      readCurrentSegmentationSnapshot: () => null,
      applyLoadedYolo: vi.fn(),
      applyLoadedSegmentationSnapshot: vi.fn(),
      clearPendingSaveTimeout: vi.fn()
    });

    await service.selectImageFolder(imageDir);

    expect(state.imageFiles.map((file) => file.name)).toEqual(["1.jpg", "2.jpg"]);
    expect(state.imageWorkflowStatus.get("1.jpg")?.detection.hasAnnotation).toBe(true);
    expect(state.imageWorkflowStatus.get("1.jpg")?.detection.boxCount).toBe(2);
    expect(state.imageWorkflowStatus.get("1.jpg")?.segmentation.hasAnnotation).toBe(false);
    expect(state.imageWorkflowStatus.get("2.jpg")?.detection.hasAnnotation).toBe(false);
    expect(state.imageWorkflowStatus.get("2.jpg")?.detection.boxCount).toBe(0);
    expect(state.imageWorkflowStatus.get("2.jpg")?.segmentation.hasAnnotation).toBe(true);
    expect(decodeImage).toHaveBeenCalled();
  });

  it("loads detection labels when workflow is detection", async () => {
    const labelDir = new MockDirectoryHandle("label").withFile(new MockFileHandle("1.txt", "1 0.5 0.5 0.1 0.1"));
    const imageDir = new MockDirectoryHandle("images")
      .withDirectory(labelDir)
      .withFile(new MockFileHandle("1.jpg"));

    const state = createState();
    const applyLoadedYolo = vi.fn();

    const service = createImageSessionService(state, {
      decodeImage: vi.fn(async () => "decoded"),
      readCurrentLabelsAsYolo: () => "",
      readCurrentSegmentationSnapshot: () => null,
      applyLoadedYolo,
      applyLoadedSegmentationSnapshot: vi.fn(),
      clearPendingSaveTimeout: vi.fn()
    });

    await service.selectImageFolder(imageDir);
    expect(applyLoadedYolo).toHaveBeenCalledWith("1 0.5 0.5 0.1 0.1");
  });

  it("saves detection labels as YOLO txt when workflow is detection", async () => {
    const labelDir = new MockDirectoryHandle("label");
    const imageDir = new MockDirectoryHandle("images")
      .withDirectory(labelDir)
      .withFile(new MockFileHandle("1.jpg"));

    const state = createState();
    let currentYolo = "0 0.5 0.5 0.2 0.2";
    const removeCurrentLabelsOutsideImageBounds = vi.fn(() => 1);
    const service = createImageSessionService(state, {
      decodeImage: vi.fn(async () => "decoded"),
      removeCurrentLabelsOutsideImageBounds,
      readCurrentLabelsAsYolo: () => currentYolo,
      readCurrentSegmentationSnapshot: () => null,
      applyLoadedYolo: vi.fn(),
      applyLoadedSegmentationSnapshot: vi.fn(),
      clearPendingSaveTimeout: vi.fn()
    });

    await service.selectImageFolder(imageDir);
    state.workflow = "detection";

    const result = await service.saveLabels(false);
    const detectionPath = resolveAnnotationAssetPaths("detection", "1").primaryFilePath;
    const fileName = detectionPath.split("/").pop() ?? "1.txt";
    const saved = await (await labelDir.getFileHandle(fileName)).getFile();

    expect(result.saved).toBe(true);
    expect(state.imageWorkflowStatus.get("1.jpg")?.detection.boxCount).toBe(1);
    expect(result.primaryFilePath).toBe(detectionPath);
    expect(await saved.text()).toBe("0 0.5 0.5 0.2 0.2");
    expect(state.imageWorkflowStatus.get("1.jpg")?.detection.hasAnnotation).toBe(true);
    expect(removeCurrentLabelsOutsideImageBounds).toHaveBeenCalledOnce();
    expect(result.removedOutOfBoundsCount).toBe(1);

    currentYolo = "";
    await service.saveLabels(false);
    expect(state.imageWorkflowStatus.get("1.jpg")?.detection.hasAnnotation).toBe(false);
    expect(state.imageWorkflowStatus.get("1.jpg")?.detection.boxCount).toBe(0);
  });
});
