import { describe, expect, it } from "vitest";

import {
  getSubdirectoryHandle,
  isNotFoundError,
  listFileHandles,
  readFileArrayBuffer,
  readFileText,
  readTextFileByName,
  writeTextFileByName
} from "../../../src/platform/file-system-access.js";
import type {
  DirectoryEntryLike,
  DirectoryHandleLike,
  FileHandleLike,
  FileTextLike,
  WritableFileLike
} from "../../../src/types/files.js";

class NotFoundError extends Error {
  override name = "NotFoundError";
}

class MockWritable implements WritableFileLike {
  public writes: string[] = [];
  public closed = false;

  async write(data: string): Promise<void> {
    this.writes.push(data);
  }

  async close(): Promise<void> {
    this.closed = true;
  }
}

class MockFileHandle implements FileHandleLike {
  public readonly kind = "file" as const;
  public readonly writable = new MockWritable();

  constructor(public readonly name: string, private readonly content: string, private readonly buffer?: ArrayBuffer) {}

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
    return this.writable;
  }
}

class MockDirectoryHandle implements DirectoryHandleLike {
  public readonly kind = "directory" as const;
  private readonly files = new Map<string, MockFileHandle>();
  private readonly directories = new Map<string, MockDirectoryHandle>();
  private readonly iterables: Array<DirectoryEntryLike | FileHandleLike | DirectoryHandleLike>;

  constructor(public readonly name: string, iterables: Array<DirectoryEntryLike | FileHandleLike | DirectoryHandleLike> = []) {
    this.iterables = iterables;
  }

  withFile(file: MockFileHandle): this {
    this.files.set(file.name, file);
    this.iterables.push(file);
    return this;
  }

  withDirectory(directory: MockDirectoryHandle): this {
    this.directories.set(directory.name, directory);
    this.iterables.push(directory);
    return this;
  }

  async *values(): AsyncIterable<DirectoryEntryLike | FileHandleLike | DirectoryHandleLike> {
    for (const entry of this.iterables) {
      yield entry;
    }
  }

  async getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<DirectoryHandleLike> {
    const existing = this.directories.get(name);
    if (existing) {
      return existing;
    }
    if (options?.create) {
      const created = new MockDirectoryHandle(name);
      this.directories.set(name, created);
      return created;
    }
    throw new NotFoundError(name);
  }

  async getFileHandle(name: string, options?: { create?: boolean }): Promise<FileHandleLike> {
    const existing = this.files.get(name);
    if (existing) {
      return existing;
    }
    if (options?.create) {
      const created = new MockFileHandle(name, "");
      this.files.set(name, created);
      return created;
    }
    throw new NotFoundError(name);
  }
}

describe("platform/file-system-access", () => {
  it("reads existing subdirectory and supports create flow when missing", async () => {
    const root = new MockDirectoryHandle("images");
    const existingLabel = new MockDirectoryHandle("label");
    root.withDirectory(existingLabel);

    const found = await getSubdirectoryHandle(root, "label");
    const created = await getSubdirectoryHandle(root, "new-label", { create: true });

    expect(found).toBe(existingLabel);
    expect(created.name).toBe("new-label");
  });

  it("lists only entries that are file handles", async () => {
    const imageFile = new MockFileHandle("1.jpg", "");
    const root = new MockDirectoryHandle("images", [
      imageFile,
      { kind: "file", name: "not-a-handle.txt" },
      { kind: "directory", name: "nested" }
    ]);

    const files = await listFileHandles(root);

    expect(files).toEqual([imageFile]);
  });

  it("reads text and binary file payloads", async () => {
    const buffer = new Uint8Array([1, 2, 3]).buffer;
    const fileHandle = new MockFileHandle("image.tiff", "ignored", buffer);

    await expect(readFileText(fileHandle)).resolves.toBe("ignored");
    await expect(readFileArrayBuffer(fileHandle)).resolves.toBe(buffer);
  });

  it("throws if binary path is requested without arrayBuffer support", async () => {
    const fileHandle = new MockFileHandle("image.tiff", "no-binary");

    await expect(readFileArrayBuffer(fileHandle)).rejects.toThrow("arrayBuffer() is unavailable");
  });

  it("reads and writes named text files through directory handles", async () => {
    const labels = new MockDirectoryHandle("label");
    labels.withFile(new MockFileHandle("1.txt", "0 0.5 0.5 1 1"));

    await expect(readTextFileByName(labels, "1.txt")).resolves.toBe("0 0.5 0.5 1 1");
    await writeTextFileByName(labels, "2.txt", "1 0.1 0.1 0.2 0.2");

    const written = await labels.getFileHandle("2.txt");
    expect((written as MockFileHandle).writable.writes).toEqual(["1 0.1 0.1 0.2 0.2"]);
    expect((written as MockFileHandle).writable.closed).toBe(true);
  });

  it("detects NotFoundError by legacy name field", () => {
    expect(isNotFoundError(new NotFoundError("missing"))).toBe(true);
    expect(isNotFoundError(new Error("other"))).toBe(false);
    expect(isNotFoundError({ name: "NotFoundError" })).toBe(true);
  });
});
