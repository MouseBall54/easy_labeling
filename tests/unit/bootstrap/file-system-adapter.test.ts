import { describe, expect, it, vi } from "vitest";

import { createInitialAppState } from "../../../src/app/state.js";
import { createFileSystemAdapter } from "../../../src/bootstrap/file-system-adapter.js";
import type { DirectoryEntryLike, DirectoryHandleLike, FileHandleLike, FileTextLike, WritableFileLike } from "../../../src/types/files.js";

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
  readonly kind = "file" as const;

  constructor(public readonly name: string, private content: string | ArrayBuffer | Uint8Array) {}

  async getFile(): Promise<FileTextLike> {
    const arrayBuffer = this.content instanceof ArrayBuffer || this.content instanceof Uint8Array
      ? toArrayBuffer(this.content)
      : undefined;
    return {
      name: this.name,
      text: async () => typeof this.content === "string" ? this.content : "",
      arrayBuffer: arrayBuffer ? async () => arrayBuffer : undefined
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
  private readonly dirMap = new Map<string, MockDirectoryHandle>();

  constructor(public readonly name: string) {}

  withFile(file: MockFileHandle): this {
    this.entries.push(file);
    return this;
  }

  withDirectory(directory: MockDirectoryHandle): this {
    this.dirMap.set(directory.name, directory);
    this.entries.push(directory);
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
    throw new Error(`Directory not found: ${name}`);
  }

  async getFileHandle(name: string, options?: { create?: boolean }): Promise<FileHandleLike> {
    const found = this.entries.find((entry): entry is FileHandleLike => {
      return entry.kind === "file" && entry.name === name && "getFile" in entry;
    });
    if (found) {
      return found;
    }
    if (options?.create) {
      const created = new MockFileHandle(name, "");
      this.entries.push(created);
      return created;
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
        getLabelsAsYolo: vi.fn(() => "0 0.5 0.5 1 1\n"),
        getSegmentationDocumentSnapshot: vi.fn<() => unknown>(() => null),
        loadSegmentationDocumentSnapshot: vi.fn(),
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

  it("saves only the active workflow and skips detection txt writes in segmentation mode", async () => {
    const labelFolder = new MockDirectoryHandle("label");
    const state = createInitialAppState();
    state.session.currentImageFile = new MockFileHandle("1.jpg", "") as never;
    state.session.labelFolderHandle = labelFolder as never;

    const fileSystem = createFileSystemAdapter({
      state,
      windowRef: createWindowRef(labelFolder) as unknown as Parameters<typeof createFileSystemAdapter>[0]["windowRef"],
      tiffRef: null
    });
    const deps = createConnectedDeps();
    fileSystem.connect(deps as never);

    state.session.workflow = "detection";
    await fileSystem.saveLabels(false);
    const savedHandle = await labelFolder.getFileHandle("1.txt");
    expect(await savedHandle.getFile().then((file) => file.text())).toBe("0 0.5 0.5 1 1");
    expect(deps.canvasController.raw.getLabelsAsYolo).toHaveBeenCalledTimes(1);

    state.session.workflow = "segmentation";
    await fileSystem.saveLabels(true);
    expect(await savedHandle.getFile().then((file) => file.text())).toBe("0 0.5 0.5 1 1");
    expect(deps.canvasController.raw.getLabelsAsYolo).toHaveBeenCalledTimes(1);
    expect(deps.uiManager.renderImageList).toHaveBeenCalledTimes(2);
    expect(deps.uiManager.renderPreviewList).toHaveBeenCalledTimes(2);
  });

  it("writes only a segmentation mask png instead of detection txt when segmentation workflow is active", async () => {
    const imageFolder = new MockDirectoryHandle("images");
    const state = createInitialAppState();
    state.session.currentImageFile = new MockFileHandle("1.jpg", "") as never;
    state.session.imageFolderHandle = imageFolder as never;
    state.session.workflow = "segmentation";

    const fileSystem = createFileSystemAdapter({
      state,
      windowRef: createWindowRef(imageFolder) as unknown as Parameters<typeof createFileSystemAdapter>[0]["windowRef"],
      tiffRef: null
    });
    const deps = createConnectedDeps();
    (deps.canvasController.raw as Record<string, unknown>).getSegmentationDocumentSnapshot = vi.fn(() => ({
      width: 2,
      height: 2,
      mask: new Uint16Array([0, 5, 5, 0]),
      activeClassId: "5",
      activeTool: "brush",
      overlayVisible: true,
      overlayOpacity: 0.5,
      hiddenClassIds: new Set<string>(),
      brushRadius: 4
    }));
    fileSystem.connect(deps as never);

    await fileSystem.saveLabels(false);

    const maskDir = await imageFolder.getDirectoryHandle("mask", { create: false }) as MockDirectoryHandle;
    const pngHandle = await maskDir.getFileHandle("1.png") as MockFileHandle;
    expect(await pngHandle.getFile().then((file) => file.arrayBuffer?.())).toBeInstanceOf(ArrayBuffer);
    await expect(maskDir.getFileHandle("1.seg.json")).rejects.toThrow("File not found");
    expect(deps.canvasController.raw.getLabelsAsYolo).not.toHaveBeenCalled();
  });


  it("autosaves through the active segmentation workflow before switching folders even without a label folder", async () => {
    await withDocumentMock(async () => {
      const previousHtmlImageElement = Reflect.get(globalThis, "HTMLImageElement");
      Reflect.set(globalThis, "HTMLImageElement", class HTMLImageElement {});
      try {
        const oldImageFolder = new MockDirectoryHandle("images-a");
        const newImageFolder = new MockDirectoryHandle("images-b");
        newImageFolder.withDirectory(new MockDirectoryHandle("label"));
        newImageFolder.withDirectory(new MockDirectoryHandle("mask"));
        const state = createInitialAppState();
        state.view.isAutoSaveEnabled = true;
        state.session.workflow = "segmentation";
        state.session.currentImageFile = new MockFileHandle("current.png", "") as never;
        state.session.imageFolderHandle = oldImageFolder as never;
        state.session.labelFolderHandle = null;

        const windowRef = {
          ...createWindowRef(newImageFolder),
          showDirectoryPicker: vi.fn(async () => newImageFolder)
        };
        const fileSystem = createFileSystemAdapter({
          state,
          windowRef: windowRef as unknown as Parameters<typeof createFileSystemAdapter>[0]["windowRef"],
          tiffRef: null
        });
        const deps = createConnectedDeps();
        deps.canvasController.raw.getSegmentationDocumentSnapshot = vi.fn(() => ({
          width: 2,
          height: 2,
          mask: new Uint16Array([0, 1, 0, 0]),
          activeClassId: "1",
          activeTool: "brush",
          overlayVisible: true,
          overlayOpacity: 0.6,
          hiddenClassIds: new Set<string>(),
          brushRadius: 6
        }));
        fileSystem.connect(deps as never);

        await fileSystem.selectImageFolder();

        expect(deps.canvasController.raw.getSegmentationDocumentSnapshot).toHaveBeenCalled();
        const savedMaskDir = await oldImageFolder.getDirectoryHandle("mask") as MockDirectoryHandle;
        const savedPng = await savedMaskDir.getFileHandle("current.png");
        expect(await savedPng.getFile().then((file) => file.arrayBuffer?.())).toBeInstanceOf(ArrayBuffer);
      } finally {
        if (previousHtmlImageElement === undefined) {
          Reflect.deleteProperty(globalThis, "HTMLImageElement");
        } else {
          Reflect.set(globalThis, "HTMLImageElement", previousHtmlImageElement);
        }
      }
    });
  });

});
