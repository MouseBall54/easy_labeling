import { describe, expect, it, vi } from "vitest";
import { FakeDocument } from "../ui/test-dom.js";

import { createInitialAppState } from "../../../src/app/state.js";
import { markCurrentDocumentDirty } from "../../../src/app/document-status.js";
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
  const operations: Array<{
    options: { title: string; detail?: string };
    controller: AbortController;
    update: ReturnType<typeof vi.fn>;
    finish: ReturnType<typeof vi.fn>;
    cancel(): void;
  }> = [];
  return {
    operations,
    uiManager: {
      beginOperation: vi.fn((options: { title: string; detail?: string }) => {
        const controller = new AbortController();
        const operation = {
          options,
          controller,
          update: vi.fn(),
          finish: vi.fn(),
          cancel(): void {
            controller.abort();
          }
        };
        operations.push(operation);
        return {
          signal: controller.signal,
          update: operation.update,
          finish: operation.finish,
          cancel: () => operation.cancel()
        };
      }),
      showLoading: vi.fn(),
      hideLoading: vi.fn(),
      notify: vi.fn(),
      updateCurrentImageName: vi.fn(),
      updateZoomDisplay: vi.fn(),
      renderImageList: vi.fn(),
      updateLabelList: vi.fn(),
      renderClassFileSelect: vi.fn(),
      promptForClassFileName: vi.fn(async () => "classes.yaml"),
      showClassFileContentModal: vi.fn(),
      updateLabelFolderButton: vi.fn(),
      elements: {
        classFileEditorBody,
        classFileSelect: { value: "" },
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
  Reflect.set(globalThis, "document", new FakeDocument());
  return run().finally(() => {
    if (previousDocument === undefined) {
      Reflect.deleteProperty(globalThis, "document");
      return;
    }
    Reflect.set(globalThis, "document", previousDocument);
  });
}

describe("bootstrap/file-system-adapter", () => {
  for (const action of ["save", "edit"] as const) it(`does not start an outdated review after ${action} while saving review settings`, async () => {
    const folder = new MockDirectoryHandle("labels").withFile(new MockFileHandle("first.txt", ""));
    const state = createInitialAppState();
    state.session.labelFolderHandle = folder as never;
    state.session.imageFiles = [new MockFileHandle("first.jpg", "")] as never;
    state.session.currentImageFile = state.session.imageFiles[0]!;
    let release: () => void = () => {};
    const gate = new Promise<void>(resolve => { release = resolve; });
    const getDirectory = folder.getDirectoryHandle.bind(folder);
    const reading = vi.spyOn(folder, "getDirectoryHandle").mockImplementationOnce(async (...args) => { await gate; return getDirectory(...args); });
    const fileSystem = createFileSystemAdapter({ state, windowRef: createWindowRef(folder) as never, tiffRef: null });
    const settings = { ...state.session.reviewState.settings, minimumBoxSizePx: 123 };
    const updating = fileSystem.updateReviewSettings(settings);
    await vi.waitFor(() => expect(reading).toHaveBeenCalledOnce());
    const saving = action === "save" ? fileSystem.saveLabels() : Promise.resolve(markCurrentDocumentDirty(state));
    release();
    await Promise.all([updating, saving]);
    expect(state.session.reviewFindings.size).toBe(0);
    expect(state.session.reviewState.settings).toEqual(settings);
    const record = await (await (await getDirectory(".easy-labeling")).getFileHandle("review-state.json")).getFile();
    expect(JSON.parse(await record.text()).settings).toEqual(settings);
  });
  for (const cancelWith of ["stop", "save", "edit", "workflow"] as const) it(`discards pending worker results after ${cancelWith} and keeps current labels usable`, async () => {
    const posted = vi.fn();
    const terminated = vi.fn();
    let worker: TestWorker;
    class TestWorker {
      onmessage: ((event: { data: unknown }) => void) | null = null;
      onerror: ((event: { message: string }) => void) | null = null;
      constructor() { worker = this; }
      postMessage = posted;
      terminate = terminated;
    }
    vi.stubGlobal("Worker", TestWorker);
    try {
      const first = new MockFileHandle("first.txt", "");
      const folder = new MockDirectoryHandle("labels").withFile(first).withFile(new MockFileHandle("second.txt", ""));
      const state = createInitialAppState();
      state.session.labelFolderHandle = folder as never;
      state.session.imageFiles = [new MockFileHandle("first.jpg", ""), new MockFileHandle("second.jpg", "")] as never;
      state.session.currentImageFile = state.session.imageFiles[0]!;
      state.session.currentImage = { width: 200, height: 100 } as HTMLImageElement;
      state.session.reviewFindings.set("first.jpg", { issues: [], highestSeverity: null });
      const events = new EventTarget();
      const fileSystem = createFileSystemAdapter({ state, windowRef: { ...createWindowRef(folder), addEventListener: events.addEventListener.bind(events), removeEventListener: events.removeEventListener.bind(events) } as never, tiffRef: null });
      const deps = createConnectedDeps();
      deps.canvasController.raw.getLabelsAsYolo.mockReturnValue("");
      fileSystem.connect(deps as never);
      const scan = fileSystem.refreshReviewFindings();
      await vi.waitFor(() => expect(posted).toHaveBeenCalledOnce());
      const deliverLate = worker!.onmessage!;
      if (cancelWith === "stop") deps.operations[0]!.cancel();
      else if (cancelWith === "save") await fileSystem.saveLabels();
      else events.dispatchEvent(new Event(`easy-labeling:${cancelWith === "edit" ? "document-status-change" : "workflow-change"}`));
      await scan;
      const current = state.session.reviewFindings;
      deliverLate({ data: { id: 0, result: { issues: [{ type: "missing-class" }], highestSeverity: "warning" } } });
      expect(state.session.reviewFindings).toBe(current);
      expect(state.session.reviewFindings.has("second.jpg")).toBe(false);
      expect(terminated).toHaveBeenCalled();
      expect(deps.operations[0]!.finish).toHaveBeenCalledOnce();
      await expect((await first.getFile()).text()).resolves.toBe("");
    } finally { vi.unstubAllGlobals(); }
  });

  it("reports a worker failure without publishing a partial full review", async () => {
    const posted = vi.fn();
    const terminated = vi.fn();
    let fail: (event: { message: string }) => void;
    class TestWorker {
      onmessage = null;
      set onerror(value: (event: { message: string }) => void) { fail = value; }
      postMessage = posted;
      terminate = terminated;
    }
    vi.stubGlobal("Worker", TestWorker);
    try {
      const folder = new MockDirectoryHandle("labels").withFile(new MockFileHandle("first.txt", ""));
      const state = createInitialAppState();
      state.session.labelFolderHandle = folder as never;
      state.session.imageFiles = [new MockFileHandle("first.jpg", "")] as never;
      const previous = state.session.reviewFindings;
      const fileSystem = createFileSystemAdapter({ state, windowRef: createWindowRef(folder) as never, tiffRef: null });
      const deps = createConnectedDeps();
      fileSystem.connect(deps as never);
      const failed = expect(fileSystem.refreshReviewFindings()).rejects.toThrow("Worker unavailable");
      await vi.waitFor(() => expect(posted).toHaveBeenCalledOnce());
      fail!({ message: "Worker unavailable" });
      await failed;
      expect(state.session.reviewFindings).toBe(previous);
      expect(terminated).toHaveBeenCalledOnce();
      expect(deps.operations[0]!.finish).toHaveBeenCalledOnce();
    } finally { vi.unstubAllGlobals(); }
  });
  it("reuses review image dimensions only while file metadata is unchanged", async () => {
    let width = 100;
    let modified = 1;
    let size = 10;
    const decode = vi.fn();
    class TestImage {
      width = 0;
      height = 100;
      naturalWidth = 0;
      naturalHeight = 100;
      src = "";
      async decode() { decode(); this.width = this.naturalWidth = width; }
    }
    vi.stubGlobal("Image", TestImage);
    try {
      const image = new MockFileHandle("image.png", "");
      vi.spyOn(image, "getFile").mockImplementation(async () => ({ name: image.name, size, lastModified: modified, text: async () => "" }));
      const label = new MockFileHandle("image.txt", "0 0.5 0.5 0.01 0.1");
      const folder = new MockDirectoryHandle("label").withFile(label);
      const state = createInitialAppState();
      state.session.labelFolderHandle = folder as never;
      state.session.imageFiles = [image as never];
      const fileSystem = createFileSystemAdapter({ state, windowRef: createWindowRef(folder) as never, tiffRef: null });
      await fileSystem.refreshReviewFindings();
      await fileSystem.refreshReviewFindings();
      expect(decode).toHaveBeenCalledTimes(1);
      width = 200;
      modified += 1;
      await fileSystem.refreshReviewFindings();
      expect(decode).toHaveBeenCalledTimes(2);
      size += 1;
      await fileSystem.refreshReviewFindings();
      expect(decode).toHaveBeenCalledTimes(3);
      await (await label.createWritable()).write("");
      await fileSystem.refreshReviewFindings();
      expect(decode).toHaveBeenCalledTimes(3);
      expect(state.session.reviewFindings.get(image.name)?.issues[0]?.type).toBe("empty-label");
    } finally { vi.unstubAllGlobals(); }
  });
  it("rejects cleanup when a queued label-folder switch changed the confirmed target", async () => {
    const state = createInitialAppState();
    const confirmed = new MockDirectoryHandle("confirmed");
    const active = new MockDirectoryHandle("active");
    state.session.labelFolderHandle = active as never;
    const fileSystem = createFileSystemAdapter({ state, windowRef: createWindowRef(active) as never, tiffRef: null });
    await expect(fileSystem.removeOutOfBoundsLabels(confirmed as never)).rejects.toThrow("active label folder changed");
    expect(state.session.labelFolderHandle).toBe(active);
  });

  it("reports backup recovery instead of claiming restoration when cancellation rollback fails", async () => {
    const original = "0 1.1 0.5 0.2 0.2\n";
    const first = new MockFileHandle("first.txt", original);
    const second = new MockFileHandle("second.txt", original);
    const folder = new MockDirectoryHandle("labels").withFile(first).withFile(second);
    const state = createInitialAppState();
    state.session.labelFolderHandle = folder as never;
    state.session.imageFiles = [new MockFileHandle("first.jpg", ""), new MockFileHandle("second.jpg", "")] as never;
    const fileSystem = createFileSystemAdapter({ state, windowRef: createWindowRef(folder) as never, tiffRef: null });
    const deps = createConnectedDeps();
    fileSystem.connect(deps as never);
    const createFirst = first.createWritable.bind(first);
    vi.spyOn(first, "createWritable").mockImplementationOnce(createFirst).mockRejectedValueOnce(new Error("Restore failed"));
    const createSecond = second.createWritable.bind(second);
    vi.spyOn(second, "createWritable").mockImplementationOnce(async () => { deps.operations[0]!.cancel(); return createSecond(); });
    await expect(fileSystem.removeOutOfBoundsLabels(folder as never)).rejects.toThrow("Originals are in labels/.easy-labeling/outside-boxes-");
    const metadata = await folder.getDirectoryHandle(".easy-labeling");
    const backups = [];
    for await (const entry of metadata.values()) backups.push(entry);
    const backup = backups[0] as DirectoryHandleLike;
    expect(await (await (await backup.getFileHandle("first.txt")).getFile()).text()).toBe(original);
    expect(await (await (await backup.getFileHandle("second.txt")).getFile()).text()).toBe(original);
    expect(deps.uiManager.notify).not.toHaveBeenCalledWith("Cleanup stopped; original label files restored.");
  });

  for (const failure of ["write", "cancel", "backup"]) it(`preserves all original labels when explicit cleanup fails during ${failure}`, async () => {
    const original = "0 0.5 0.5 0.2 0.2\n1 1.1 0.5 0.2 0.2\n";
    const first = new MockFileHandle("first.txt", original);
    const second = new MockFileHandle("second.txt", original);
    const folder = new MockDirectoryHandle("labels").withFile(first).withFile(second);
    const state = createInitialAppState();
    state.session.labelFolderHandle = folder as never;
    state.session.labelFolders = [folder] as never;
    state.session.imageFiles = [new MockFileHandle("first.jpg", ""), new MockFileHandle("second.jpg", "")] as never;
    const fileSystem = createFileSystemAdapter({ state, windowRef: createWindowRef(folder) as never, tiffRef: null });
    const deps = createConnectedDeps();
    fileSystem.connect(deps as never);
    if (failure === "write") vi.spyOn(second, "createWritable").mockRejectedValueOnce(new Error("Write failed"));
    if (failure === "backup") vi.spyOn(folder, "getDirectoryHandle").mockRejectedValueOnce(new Error("Backup failed"));
    if (failure === "cancel") {
      const createWritable = second.createWritable.bind(second);
      vi.spyOn(second, "createWritable").mockImplementationOnce(async () => {
        deps.operations[0]!.cancel();
        return createWritable();
      });
      await fileSystem.removeOutOfBoundsLabels(folder as never);
    } else {
      await expect(fileSystem.removeOutOfBoundsLabels(folder as never)).rejects.toThrow(`${failure === "write" ? "Write" : "Backup"} failed`);
    }
    expect(await (await first.getFile()).text()).toBe(original);
    expect(await (await second.getFile()).text()).toBe(original);
    expect(state.session.labelFolderHandle).toBe(folder);
    expect(deps.operations[0]!.finish).toHaveBeenCalledOnce();
  });

  it("keeps the active folder when saving edited labels before switching fails", async () => {
    const currentLabel = new MockFileHandle("image.txt", "0 0.5 0.5 1 1");
    vi.spyOn(currentLabel, "createWritable").mockRejectedValue(new Error("Disk is read-only"));
    const source = new MockDirectoryHandle("source").withFile(currentLabel);
    const target = new MockDirectoryHandle("comparison");
    const state = createInitialAppState();
    state.session.labelFolderHandle = source as never;
    state.session.labelFolders = [source, target] as never;
    state.session.currentImageFile = new MockFileHandle("image.png", new Uint8Array([1])) as never;
    markCurrentDocumentDirty(state);
    const fileSystem = createFileSystemAdapter({ state, windowRef: createWindowRef(target) as never, tiffRef: null });
    const deps = createConnectedDeps();
    fileSystem.connect(deps as never);
    await expect(fileSystem.switchLabelFolder(1)).rejects.toThrow("Disk is read-only");
    expect(state.session.labelFolderHandle).toBe(source);
    expect(state.session.labelFolders).toEqual([source, target]);
    expect(deps.canvasController.raw.clear).not.toHaveBeenCalled();
    expect(await (await currentLabel.getFile()).text()).toBe("0 0.5 0.5 1 1");
  });

  it("cancels inference without activating partial results or changing the original label source", async () => {
    class TestImage {
      width = 32;
      height = 32;
      naturalWidth = 32;
      naturalHeight = 32;
      src = "";
      async decode() {}
    }
    vi.stubGlobal("Image", TestImage);
    vi.stubGlobal("HTMLImageElement", TestImage);
    try {
      const label = new MockDirectoryHandle("label");
      const image = new MockFileHandle("image.png", new Uint8Array([1]));
      const dataset = new MockDirectoryHandle("dataset").withFile(image).withDirectory(label);
      const state = createInitialAppState();
      state.session.imageFolderHandle = dataset as never;
      state.session.labelFolderHandle = label as never;
      state.session.labelFolders = [label as never];
      state.session.imageFiles = [image as never];
      state.session.currentImageFile = image as never;
      state.session.currentImage = new TestImage() as never;
      const fileSystem = createFileSystemAdapter({ state, windowRef: createWindowRef(dataset) as never, tiffRef: null });
      const deps = createConnectedDeps();
      fileSystem.connect(deps as never);
      let finish!: () => void;
      const inference = vi.fn(async () => {
        await new Promise<void>((resolve) => { finish = resolve; });
        return [];
      });
      const running = fileSystem.runDetectionInference({ allImages: true, modelName: "test.onnx", infer: inference });
      await vi.waitFor(() => expect(inference).toHaveBeenCalledTimes(1));
      deps.operations[0].cancel();
      finish();
      expect(await running).toBeNull();
      expect(state.session.labelFolderHandle).toBe(label);
      expect(state.session.labelFolders).toEqual([label]);
      expect(deps.operations[0].finish).toHaveBeenCalledTimes(1);
      expect(deps.uiManager.notify).toHaveBeenCalledWith(expect.stringContaining("Partial results remain"));
      const entries = [];
      for await (const entry of dataset.values()) entries.push(entry.name);
      expect(entries).toContain("inference-test");
    } finally { vi.unstubAllGlobals(); }
  });

  it("stops a pending sample load and restores the previous session", async () => {
    const oldFolder = new MockDirectoryHandle("old-dataset");
    const sampleFolder = new MockDirectoryHandle("sample-dataset");
    let resolveSample!: (folder: MockDirectoryHandle) => void;
    const samplePromise = new Promise<MockDirectoryHandle>((resolve) => {
      resolveSample = resolve;
    });
    const state = createInitialAppState();
    state.session.imageFolderHandle = oldFolder as never;
    const windowRef = {
      ...createWindowRef(sampleFolder),
      getEasyLabelingSampleDirectory: vi.fn(() => samplePromise)
    };
    const fileSystem = createFileSystemAdapter({
      state,
      windowRef: windowRef as unknown as Parameters<typeof createFileSystemAdapter>[0]["windowRef"],
      tiffRef: null
    });
    const deps = createConnectedDeps();
    fileSystem.connect(deps as never);

    const loading = fileSystem.loadSampleTestData();
    await vi.waitFor(() => expect(deps.operations).toHaveLength(1));
    deps.operations[0]?.cancel();
    resolveSample(sampleFolder);
    await loading;

    expect(state.session.imageFolderHandle).toBe(oldFolder);
    expect(deps.operations[0]?.finish).toHaveBeenCalledTimes(1);
    expect(deps.uiManager.notify).toHaveBeenCalledWith("Loading sample workspace stopped.");
  });

  it("loads the bundled sample directory without invoking the native folder picker", async () => {
    await withDocumentMock(async () => {
      const previousHtmlImageElement = Reflect.get(globalThis, "HTMLImageElement");
      Reflect.set(globalThis, "HTMLImageElement", class HTMLImageElement {});
      try {
        const labelFolder = new MockDirectoryHandle("label")
          .withFile(new MockFileHandle("classes.yaml", "0: Light / White\n1: Dark / Gray"));
        const sampleFolder = new MockDirectoryHandle("Easy Labeling Sample Test")
          .withDirectory(labelFolder)
          .withDirectory(new MockDirectoryHandle("mask"))
          .withDirectory(new MockDirectoryHandle(".easy-labeling").withFile(new MockFileHandle("automation-library.json", "{}")));
        const state = createInitialAppState();
        const windowRef = {
          ...createWindowRef(sampleFolder),
          getEasyLabelingSampleDirectory: vi.fn(async () => sampleFolder)
        };
        const fileSystem = createFileSystemAdapter({
          state,
          windowRef: windowRef as unknown as Parameters<typeof createFileSystemAdapter>[0]["windowRef"],
          tiffRef: null
        });
        const deps = createConnectedDeps();
        fileSystem.connect(deps as never);
        const progress = vi.fn();

        await fileSystem.loadSampleTestData(progress);

        expect(windowRef.getEasyLabelingSampleDirectory).toHaveBeenCalledTimes(1);
        expect(windowRef.showDirectoryPicker).not.toHaveBeenCalled();
        expect(state.session.imageFolderHandle).toBe(sampleFolder);
        expect(state.session.labelFolderHandle).toBe(labelFolder);
        expect(state.session.classNames).toEqual(new Map([["0", "Light / White"], ["1", "Dark / Gray"]]));
        expect(progress.mock.calls).toEqual(expect.arrayContaining([
          ["dataset", "ready", "Easy Labeling Sample Test"],
          ["labels", "loading", "Checking the label workspace"],
          ["labels", "ready", "Connected the label folder"],
          ["images", "warning", "No supported images found"],
          ["classes", "ready", "1 class file ready"]
        ]));
        expect(deps.uiManager.notify).toHaveBeenCalledWith(expect.stringContaining("Sample test data loaded"), 5000);
      } finally {
        if (previousHtmlImageElement === undefined) {
          Reflect.deleteProperty(globalThis, "HTMLImageElement");
        } else {
          Reflect.set(globalThis, "HTMLImageElement", previousHtmlImageElement);
        }
      }
    });
  });

  it("selectClassInfoFolder loads class files and selects first YAML for viewer", async () => {
    await withDocumentMock(async () => {
      const classFolder = new MockDirectoryHandle("classes")
        .withFile(new MockFileHandle("classes.yaml", "0: person\n1: car"))
        .withFile(new MockFileHandle("ignore.txt", "noop"));
      const state = createInitialAppState();
      const windowRef = createWindowRef(classFolder);
      const fileSystem = createFileSystemAdapter({
        state,
        windowRef: windowRef as unknown as Parameters<typeof createFileSystemAdapter>[0]["windowRef"],
        tiffRef: null
      });
      const deps = createConnectedDeps();
      fileSystem.connect(deps as never);

      await fileSystem.selectClassInfoFolder();
      await fileSystem.showClassFileContent();

      expect(state.session.classFiles.map((file) => file.name)).toEqual(["classes.yaml"]);
      expect(state.session.selectedClassFile?.name).toBe("classes.yaml");
      expect(windowRef.showDirectoryPicker).toHaveBeenCalledWith({ id: "class-info", mode: "readwrite" });
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

  it("queues class colors without losing names and keeps saved colors on write failure", async () => {
    const file = new MockFileHandle("classes.yaml", "0: person\n1: car");
    const state = createInitialAppState();
    const fileSystem = createFileSystemAdapter({
      state,
      windowRef: createWindowRef(new MockDirectoryHandle("classes")) as never,
      tiffRef: null
    });
    const deps = createConnectedDeps();
    fileSystem.connect(deps as never);
    await fileSystem.loadClassNamesFromFile(file);
    await Promise.all([fileSystem.setClassColor("0", "#112233"), fileSystem.setClassColor("1", "#abcdef")]);
    expect(state.session.classColors).toEqual(new Map([["0", "#112233"], ["1", "#abcdef"]]));
    expect(state.session.classNames).toEqual(new Map([["0", "person"], ["1", "car"]]));
    const saved = await (await file.getFile()).text();
    vi.spyOn(file, "createWritable").mockRejectedValueOnce(new Error("Write denied"));
    await expect(fileSystem.setClassColor("0", "#ffffff")).rejects.toThrow("Write denied");
    expect(await (await file.getFile()).text()).toBe(saved);
    expect(state.session.classColors.get("0")).toBe("#112233");
    expect(deps.uiManager.updateLabelList).toHaveBeenCalled();
  });

  it("loads class files from the default Class Info profile before dataset-local files", async () => {
    const profileFolder = new MockDirectoryHandle("Class Info")
      .withFile(new MockFileHandle("profile.yaml", "0: profile class"));
    const labelFolder = new MockDirectoryHandle("label")
      .withFile(new MockFileHandle("dataset.yaml", "0: dataset class"));
    const state = createInitialAppState();
    state.session.labelFolderHandle = labelFolder as never;
    const windowRef = {
      ...createWindowRef(labelFolder),
      getEasyLabelingProfileDirectory: vi.fn(async () => profileFolder)
    };
    const fileSystem = createFileSystemAdapter({
      state,
      windowRef: windowRef as unknown as Parameters<typeof createFileSystemAdapter>[0]["windowRef"],
      tiffRef: null
    });
    fileSystem.connect(createConnectedDeps() as never);

    await fileSystem.loadDefaultClassInfo();

    expect(windowRef.getEasyLabelingProfileDirectory).toHaveBeenCalledWith("class-info");
    expect(state.session.classInfoFolderHandle).toBe(profileFolder);
    expect(state.session.classFiles.map((file) => file.name)).toEqual(["profile.yaml"]);
    expect(state.session.classNames).toEqual(new Map([["0", "profile class"]]));
  });

  it("creates a default class file and opens the table editor from the create option", async () => {
    await withDocumentMock(async () => {
      const profileFolder = new MockDirectoryHandle("Class Info");
      const state = createInitialAppState();
      const windowRef = {
        ...createWindowRef(profileFolder),
        getEasyLabelingProfileDirectory: vi.fn(async () => profileFolder)
      };
      const fileSystem = createFileSystemAdapter({
        state,
        windowRef: windowRef as unknown as Parameters<typeof createFileSystemAdapter>[0]["windowRef"],
        tiffRef: null
      });
      const deps = createConnectedDeps();
      deps.uiManager.elements.classFileSelect.value = "__CREATE_NEW__";
      fileSystem.connect(deps as never);

      await fileSystem.showClassFileContent();

      expect(state.session.selectedClassFile?.name).toBe("classes.yaml");
      expect(state.session.classFiles.map((file) => file.name)).toEqual(["classes.yaml"]);
      expect(deps.uiManager.showClassFileContentModal).toHaveBeenCalledTimes(1);
      expect(deps.uiManager.elements.classFileEditorBody.querySelectorAll("tr").length).toBeGreaterThan(0);
    });
  });

  it("uses a custom class file name and leaves state unchanged when creation is cancelled", async () => {
    const profileFolder = new MockDirectoryHandle("Class Info");
    const state = createInitialAppState();
    const windowRef = {
      ...createWindowRef(profileFolder),
      getEasyLabelingProfileDirectory: vi.fn(async () => profileFolder)
    };
    const fileSystem = createFileSystemAdapter({
      state,
      windowRef: windowRef as unknown as Parameters<typeof createFileSystemAdapter>[0]["windowRef"],
      tiffRef: null
    });
    const deps = createConnectedDeps();
    fileSystem.connect(deps as never);

    deps.uiManager.promptForClassFileName.mockResolvedValueOnce("custom-labels.yml");
    await expect(fileSystem.createNewClassFile()).resolves.toBe(true);
    expect(state.session.selectedClassFile?.name).toBe("custom-labels.yml");

    const beforeNames = state.session.classFiles.map((file) => file.name);
    deps.uiManager.promptForClassFileName.mockResolvedValueOnce(null as never);
    await expect(fileSystem.createNewClassFile()).resolves.toBe(false);
    expect(state.session.classFiles.map((file) => file.name)).toEqual(beforeNames);
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
    await expect(fileSystem.saveLabels(true)).rejects.toThrow("Load an image before saving a Segmentation mask.");
    expect(await savedHandle.getFile().then((file) => file.text())).toBe("0 0.5 0.5 1 1");
    expect(deps.canvasController.raw.getLabelsAsYolo).toHaveBeenCalledTimes(1);
    expect(deps.uiManager.renderImageList).toHaveBeenCalledTimes(1);
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
