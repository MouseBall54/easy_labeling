import { describe, expect, it, vi } from "vitest";

import { createInitialAppState } from "../../../src/app/state.js";
import { createFileSystemAdapter } from "../../../src/bootstrap/file-system-adapter.js";
import type { DirectoryEntryLike, DirectoryHandleLike, FileHandleLike, FileTextLike, WritableFileLike } from "../../../src/types/files.js";

class MockWritable implements WritableFileLike {
  constructor(private readonly onWrite: (data: string) => void) {}

  async write(data: string): Promise<void> {
    this.onWrite(data);
  }

  async close(): Promise<void> {
    return;
  }
}

class MockFileHandle implements FileHandleLike {
  readonly kind = "file" as const;

  constructor(public readonly name: string, private content: string) {}

  async getFile(): Promise<FileTextLike> {
    return {
      name: this.name,
      text: async () => this.content
    };
  }

  async createWritable(): Promise<WritableFileLike> {
    return new MockWritable((data) => {
      this.content = data;
    });
  }
}

class MockDirectoryHandle implements DirectoryHandleLike {
  readonly kind = "directory" as const;
  private readonly entries: Array<DirectoryEntryLike | FileHandleLike | DirectoryHandleLike> = [];

  constructor(public readonly name: string) {}

  withFile(file: MockFileHandle): this {
    this.entries.push(file);
    return this;
  }

  async *values(): AsyncIterable<DirectoryEntryLike | FileHandleLike | DirectoryHandleLike> {
    for (const entry of this.entries) {
      yield entry;
    }
  }

  async getDirectoryHandle(): Promise<DirectoryHandleLike> {
    throw new Error("Not implemented");
  }

  async getFileHandle(name: string): Promise<FileHandleLike> {
    const found = this.entries.find((entry): entry is FileHandleLike => {
      return entry.kind === "file" && entry.name === name && "getFile" in entry;
    });
    if (found) {
      return found;
    }
    throw new Error(`File not found: ${name}`);
  }
}

function createWindowRef(folder: MockDirectoryHandle) {
  return {
    showDirectoryPicker: vi.fn(async () => folder),
    clearTimeout,
    confirm: vi.fn(() => true),
    URL: {
      createObjectURL: vi.fn(() => "blob:test"),
      revokeObjectURL: vi.fn()
    },
    dispatchEvent: vi.fn()
  };
}

function createConnectedDeps() {
  const rows: Array<{ innerHTML: string }> = [];
  const classFileEditorBody = {
    innerHTML: "",
    appendChild: (row: { innerHTML: string }) => {
      rows.push(row);
    },
    querySelectorAll: (selector: string) => {
      if (selector !== "tr") {
        return [];
      }
      return rows;
    }
  };
  return {
    uiManager: {
      showLoading: vi.fn(),
      hideLoading: vi.fn(),
      notify: vi.fn(),
      updateCurrentImageName: vi.fn(),
      updateZoomDisplay: vi.fn(),
      renderImageList: vi.fn(),
      renderPreviewList: vi.fn(),
      updateLabelList: vi.fn(),
      renderClassFileSelect: vi.fn(),
      showClassFileContentModal: vi.fn(),
      updateLabelFolderButton: vi.fn(),
      elements: {
        classFileEditorBody,
        selectLabelFolderBtn: { removeAttribute: vi.fn() }
      }
    },
    canvasController: {
      raw: {
        clearHistory: vi.fn(),
        clear: vi.fn(),
        setBackgroundImage: vi.fn(),
        addLabelsFromYolo: vi.fn(),
        resetZoom: vi.fn(),
        canvas: { getZoom: vi.fn(() => 1) }
      }
    }
  };
}

function withDocumentMock<T>(run: () => Promise<T>): Promise<T> {
  const previousDocument = Reflect.get(globalThis, "document");
  Reflect.set(globalThis, "document", {
    createElement: () => ({ innerHTML: "" })
  });
  return run().finally(() => {
    if (previousDocument === undefined) {
      Reflect.deleteProperty(globalThis, "document");
      return;
    }
    Reflect.set(globalThis, "document", previousDocument);
  });
}

describe("bootstrap/file-system-adapter", () => {
  it("selectClassInfoFolder loads class files and selects first YAML for viewer", async () => {
    await withDocumentMock(async () => {
    const classFolder = new MockDirectoryHandle("classes")
      .withFile(new MockFileHandle("classes.yaml", "0: person\n1: car"))
      .withFile(new MockFileHandle("ignore.txt", "noop"));
    const state = createInitialAppState();
    const fileSystem = createFileSystemAdapter({
      state,
      windowRef: createWindowRef(classFolder) as unknown as Parameters<typeof createFileSystemAdapter>[0]["windowRef"],
      tiffRef: null
    });
    const deps = createConnectedDeps();
    fileSystem.connect(deps as never);

    await fileSystem.selectClassInfoFolder();
    await fileSystem.showClassFileContent();

    expect(state.session.classFiles.map((file) => file.name)).toEqual(["classes.yaml"]);
    expect(state.session.selectedClassFile?.name).toBe("classes.yaml");
    expect(deps.uiManager.renderClassFileSelect).toHaveBeenCalled();
    expect(deps.uiManager.showClassFileContentModal).toHaveBeenCalledTimes(1);
    expect(deps.uiManager.elements.classFileEditorBody.querySelectorAll("tr").length).toBe(2);
    });
  });

  it("showClassFileContent notifies when no class file is available", async () => {
    const emptyFolder = new MockDirectoryHandle("empty");
    const state = createInitialAppState();
    const fileSystem = createFileSystemAdapter({
      state,
      windowRef: createWindowRef(emptyFolder) as unknown as Parameters<typeof createFileSystemAdapter>[0]["windowRef"],
      tiffRef: null
    });
    const deps = createConnectedDeps();
    fileSystem.connect(deps as never);

    await fileSystem.showClassFileContent();

    expect(deps.uiManager.notify).toHaveBeenCalledWith("Please select a class file first.");
    expect(deps.uiManager.showClassFileContentModal).not.toHaveBeenCalled();
  });
});
