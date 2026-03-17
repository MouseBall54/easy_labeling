import { describe, expect, it } from "vitest";

import {
  createNewClassFile,
  readClassFileRowsForEditor,
  readClassNamesFromFileHandle,
  validateAndSaveClassRowsToFileHandle
} from "../../../../src/features/classes/class-file-service.js";
import type { DirectoryEntryLike, DirectoryHandleLike, FileHandleLike, WritableFileLike } from "../../../../src/types/files.js";

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
  public writable = new MockWritable();

  constructor(public readonly name: string, private content: string) {}

  async getFile(): Promise<{ name: string; text(): Promise<string> }> {
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
  private readonly fileHandles = new Map<string, MockFileHandle>();

  constructor(public readonly name: string, private readonly entries: DirectoryEntryLike[]) {}

  async *values(): AsyncIterable<DirectoryEntryLike> {
    for (const entry of this.entries) {
      yield entry;
    }
  }

  async getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<DirectoryHandleLike> {
    void options;
    throw new Error(`Missing directory handle: ${name}`);
  }

  async getFileHandle(name: string, options?: { create?: boolean }): Promise<FileHandleLike> {
    if (options?.create) {
      const fileHandle = new MockFileHandle(name, "");
      this.fileHandles.set(name, fileHandle);
      return fileHandle;
    }

    const handle = this.fileHandles.get(name);
    if (!handle) {
      throw new Error(`Missing file handle: ${name}`);
    }
    return handle;
  }

  getCreatedFile(name: string): MockFileHandle | undefined {
    return this.fileHandles.get(name);
  }
}

describe("features/classes/class-file-service", () => {
  it("reads class names from file handle via legacy parse quirks", async () => {
    const fileHandle = new MockFileHandle(
      "classes.yaml",
      ["# comment", "", "0: person", "1: road:lane:solid", "bad", "2:"].join("\n")
    );

    const result = await readClassNamesFromFileHandle(fileHandle);
    expect([...result.classNames.entries()]).toEqual([
      ["0", "person"],
      ["1", "road:lane:solid"]
    ]);
  });

  it("reads editor rows sorted numerically", async () => {
    const fileHandle = new MockFileHandle("classes.yaml", ["10: ten", "2: two", "1: one"].join("\n"));

    const rows = await readClassFileRowsForEditor(fileHandle);
    expect(rows).toEqual([
      { id: "1", name: "one" },
      { id: "2", name: "two" },
      { id: "10", name: "ten" }
    ]);
  });

  it("validates rows and skips write when invalid", async () => {
    const fileHandle = new MockFileHandle("classes.yaml", "");

    const result = await validateAndSaveClassRowsToFileHandle(fileHandle, [
      { id: "1", name: "one" },
      { id: "01", name: "invalid" }
    ]);

    expect(result.saved).toBe(false);
    expect(result.validation.isValid).toBe(false);
    expect(fileHandle.writable.writes).toEqual([]);
    expect(fileHandle.writable.closed).toBe(false);
  });

  it("validates and saves canonical serialized content", async () => {
    const fileHandle = new MockFileHandle("classes.yaml", "");

    const result = await validateAndSaveClassRowsToFileHandle(fileHandle, [
      { id: "10", name: "ten" },
      { id: "2", name: "two" },
      { id: "1", name: "one" }
    ]);

    expect(result.saved).toBe(true);
    expect(result.validation.newContent).toBe("1: one\n2: two\n10: ten");
    expect(fileHandle.writable.writes).toEqual(["1: one\n2: two\n10: ten"]);
    expect(fileHandle.writable.closed).toBe(true);
  });

  it("creates a new class file with normalized name and seed content", async () => {
    const folderHandle = new MockDirectoryHandle("classes", [{ kind: "file", name: "other.yaml" }]);

    const result = await createNewClassFile(folderHandle, "custom-classes");
    const created = folderHandle.getCreatedFile("custom-classes.yaml");

    expect(result).toEqual({
      created: true,
      fileName: "custom-classes.yaml",
      fileHandle: created
    });
    expect(created?.writable.writes).toEqual(["# YAML Class file. Format: id: name\n0: class1\n1: class2"]);
    expect(created?.writable.closed).toBe(true);
  });

  it("rejects case-insensitive name collisions before file creation", async () => {
    const folderHandle = new MockDirectoryHandle("classes", [
      { kind: "directory", name: "My-Classes.YAML" },
      { kind: "file", name: "other.yaml" }
    ]);

    const result = await createNewClassFile(folderHandle, "my-classes");

    expect(result).toEqual({
      created: false,
      fileName: "my-classes.yaml",
      fileHandle: null
    });
    expect(folderHandle.getCreatedFile("my-classes.yaml")).toBeUndefined();
  });
});
