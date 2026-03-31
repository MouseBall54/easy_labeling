import { describe, expect, it, vi } from "vitest";

import { createEmptyReviewDocument, createReviewDocumentCodec } from "../../../../src/domain/annotations/review.js";
import { resolveAnnotationAssetPaths, resolveReviewDocumentPath } from "../../../../src/domain/annotations/paths.js";
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
  public writes: Array<string | ArrayBuffer | Uint8Array> = [];
  public closed = false;

  constructor(private readonly onWrite: (data: string | ArrayBuffer) => void) {}

  async write(data: string | ArrayBuffer): Promise<void> {
    this.writes.push(data);
    this.onWrite(data);
  }

  async close(): Promise<void> {
    this.closed = true;
  }
}

class MockFileHandle implements FileHandleLike {
  public readonly kind = "file" as const;
  private content: string | ArrayBuffer | Uint8Array;
  private readonly buffer: ArrayBuffer | undefined;
  public writable: MockWritable;

  constructor(name: string, content: string | ArrayBuffer | Uint8Array = "", buffer?: ArrayBuffer) {
    this.name = name;
    this.content = content;
    this.buffer = buffer;
    this.writable = new MockWritable((data) => {
      this.content = data;
    });
  }

  public readonly name: string;

  setContent(content: string | ArrayBuffer | Uint8Array): void {
    this.content = content;
  }

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
    imageWorkflowStatus: new Map(),
    currentImageFile: null,
    currentImage: null,
    currentLoadToken: 0,
    isAutoSaveEnabled: false,
    workflow: "detection",
    reviewTargetWorkflow: "detection",
    reviewDocuments: {
      detection: createEmptyReviewDocument("detection"),
      segmentation: createEmptyReviewDocument("segmentation")
    },
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
      readCurrentSegmentationSnapshot: () => null,
      applyLoadedYolo: vi.fn(),
      applyLoadedSegmentationSnapshot: vi.fn(),
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
      readCurrentSegmentationSnapshot: () => null,
      applyLoadedYolo: vi.fn(),
      applyLoadedSegmentationSnapshot: vi.fn(),
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
      readCurrentSegmentationSnapshot: () => null,
      applyLoadedYolo: vi.fn(),
      applyLoadedSegmentationSnapshot: vi.fn(),
      clearPendingSaveTimeout: vi.fn(),
      revokePreviewUrl: vi.fn()
    });

    await service.listImageFiles();

    expect(state.imageFiles.map((file) => file.name)).toEqual(["image1.jpg", "image2.jpg", "image10.jpg"]);
    expect(state.imageWorkflowStatus.get("image1.jpg")).toMatchObject({ detection: { hasAnnotation: false } });
    expect(state.imageWorkflowStatus.get("image2.jpg")).toMatchObject({ detection: { hasAnnotation: true } });
    expect(state.imageWorkflowStatus.get("image10.jpg")).toMatchObject({ detection: { hasAnnotation: true } });
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
      readCurrentSegmentationSnapshot: () => null,
      applyLoadedYolo: vi.fn(),
      applyLoadedSegmentationSnapshot: vi.fn(),
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
      readCurrentSegmentationSnapshot: () => null,
      applyLoadedYolo: vi.fn((yoloData: string) => {
        loadOrder.push(`labels:${yoloData}`);
      }),
      applyLoadedSegmentationSnapshot: vi.fn(),
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
      readCurrentSegmentationSnapshot: () => null,
      applyLoadedYolo,
      applyLoadedSegmentationSnapshot: vi.fn(),
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
      readCurrentSegmentationSnapshot: () => null,
      applyLoadedYolo: vi.fn(),
      applyLoadedSegmentationSnapshot: vi.fn(),
      clearPendingSaveTimeout: vi.fn(),
      revokePreviewUrl: vi.fn()
    });

    await service.listImageFiles();
    expect(state.imageWorkflowStatus.get("1.jpg")).toMatchObject({ detection: { hasAnnotation: true } });

    state.currentImageFile = image;
    await service.saveLabels();
    expect(state.imageWorkflowStatus.get("1.jpg")).toMatchObject({ detection: { hasAnnotation: false } });

    await service.listImageFiles();
    expect(state.imageWorkflowStatus.get("1.jpg")).toMatchObject({ detection: { hasAnnotation: true } });
  });

  it("resolves deterministic workflow-specific annotation and review paths", () => {
    expect(resolveAnnotationAssetPaths("detection", "scene-a")).toEqual({
      primaryFilePath: "label/scene-a.txt",
      sidecarFilePaths: []
    });
    expect(resolveAnnotationAssetPaths("segmentation", "scene-a")).toEqual({
      primaryFilePath: "mask/scene-a.png",
      sidecarFilePaths: ["mask/scene-a.seg.json"]
    });
    expect(resolveReviewDocumentPath("detection", "scene-a")).toBe("review/detection/scene-a.review.json");
    expect(resolveReviewDocumentPath("segmentation", "scene-a")).toBe("review/segmentation/scene-a.review.json");
  });

  it("round-trips workflow-specific review documents with the locked status model", () => {
    const codec = createReviewDocumentCodec("segmentation");
    const encoded = codec.encode({
      workflow: "segmentation",
      format: "review-json-v1",
      status: "needs-fix",
      note: "erase spillover",
      issueFlags: {
        maskLeak: true,
        bboxOnly: false
      }
    });

    expect(codec.resolvePath("scene-a")).toBe("review/segmentation/scene-a.review.json");

    const decoded = codec.decode(encoded);
    expect(decoded).toEqual({
      workflow: "segmentation",
      format: "review-json-v1",
      status: "needs-fix",
      note: "erase spillover",
      issueFlags: {
        maskLeak: true,
        bboxOnly: false
      }
    });

    expect(codec.decode("{}")).toEqual({
      workflow: "segmentation",
      format: "review-json-v1",
      status: "untouched",
      note: "",
      issueFlags: {}
    });
  });


  it("tracks detection, segmentation, and review status independently per image", async () => {
    const labelDir = new MockDirectoryHandle("label")
      .withFile(new MockFileHandle("1.txt", "0 0.5 0.5 1 1"));
    const maskDir = new MockDirectoryHandle("mask")
      .withFile(new MockFileHandle("1.png", "mask-bytes"))
      .withFile(new MockFileHandle("2.seg.json", "{\"brush\":1}"));
    const reviewDetectionDir = new MockDirectoryHandle("detection")
      .withFile(new MockFileHandle("1.review.json", '{"status":"approved","note":"ok","issueFlags":{}}'));
    const reviewSegmentationDir = new MockDirectoryHandle("segmentation")
      .withFile(new MockFileHandle("2.review.json", '{"status":"needs-fix","note":"repair","issueFlags":{"maskLeak":true}}'));
    const reviewDir = new MockDirectoryHandle("review")
      .withDirectory(reviewDetectionDir)
      .withDirectory(reviewSegmentationDir);
    const imageDir = new MockDirectoryHandle("images")
      .withDirectory(labelDir)
      .withDirectory(maskDir)
      .withDirectory(reviewDir)
      .withFile(new MockFileHandle("1.jpg"))
      .withFile(new MockFileHandle("2.jpg"));
    const state = createState();
    state.imageFolderHandle = imageDir;
    state.labelFolderHandle = labelDir;
    state.imageFiles = [new MockFileHandle("1.jpg"), new MockFileHandle("2.jpg")];

    const service = createImageSessionService(state, {
      decodeImage: vi.fn(async () => "decoded"),
      readCurrentLabelsAsYolo: () => "",
      readCurrentSegmentationSnapshot: () => null,
      applyLoadedYolo: vi.fn(),
      applyLoadedSegmentationSnapshot: vi.fn(),
      clearPendingSaveTimeout: vi.fn(),
      revokePreviewUrl: vi.fn()
    });

    await service.refreshImageWorkflowStatus();

    expect(state.imageWorkflowStatus.get("1.jpg")).toEqual({
      detection: {
        hasAnnotation: true,
        reviewStatus: "approved"
      },
      segmentation: {
        hasAnnotation: true,
        reviewStatus: "untouched"
      }
    });
    expect(state.imageWorkflowStatus.get("2.jpg")).toEqual({
      detection: {
        hasAnnotation: false,
        reviewStatus: "untouched"
      },
      segmentation: {
        hasAnnotation: false,
        reviewStatus: "needs-fix"
      }
    });
  });

  it("writes only detection txt when detection workflow is active and skips writes in other workflows", async () => {
    const labelDir = new MockDirectoryHandle("label");
    const image = new MockFileHandle("1.jpg");
    const state = createState();
    state.currentImageFile = image;
    state.labelFolderHandle = labelDir;

    const service = createImageSessionService(state, {
      decodeImage: vi.fn(async () => "decoded"),
      readCurrentLabelsAsYolo: () => "0 0.5 0.5 1 1\n",
      readCurrentSegmentationSnapshot: () => null,
      applyLoadedYolo: vi.fn(),
      applyLoadedSegmentationSnapshot: vi.fn(),
      clearPendingSaveTimeout: vi.fn(),
      revokePreviewUrl: vi.fn()
    });

    state.workflow = "detection";
    await service.saveLabels();
    const savedHandle = await labelDir.getFileHandle("1.txt");
    expect((savedHandle as MockFileHandle).writable.writes).toEqual(["0 0.5 0.5 1 1"]);

    state.workflow = "segmentation";
    await service.saveLabels();
    expect((savedHandle as MockFileHandle).writable.writes).toEqual(["0 0.5 0.5 1 1"]);

    state.workflow = "review";
    await service.saveLabels();
    expect((savedHandle as MockFileHandle).writable.writes).toEqual(["0 0.5 0.5 1 1"]);
  });


  it("writes segmentation png and metadata when segmentation workflow is active", async () => {
    const imageDir = new MockDirectoryHandle("images");
    const image = new MockFileHandle("1.jpg");
    const state = createState();
    state.currentImageFile = image;
    state.imageFolderHandle = imageDir;
    state.workflow = "segmentation";

    const snapshot = {
      width: 2,
      height: 2,
      mask: new Uint16Array([0, 7, 7, 0]),
      activeClassId: "7",
      activeTool: "brush" as const,
      overlayVisible: true,
      overlayOpacity: 0.4,
      hiddenClassIds: new Set<string>(["3"]),
      brushRadius: 5
    };

    const service = createImageSessionService(state, {
      decodeImage: vi.fn(async () => "decoded"),
      readCurrentLabelsAsYolo: () => "",
      readCurrentSegmentationSnapshot: () => snapshot,
      applyLoadedYolo: vi.fn(),
      applyLoadedSegmentationSnapshot: vi.fn(),
      clearPendingSaveTimeout: vi.fn(),
      revokePreviewUrl: vi.fn()
    });

    const result = await service.saveLabels();
    const maskDir = await imageDir.getDirectoryHandle("mask") as MockDirectoryHandle;
    const pngHandle = await maskDir.getFileHandle("1.png") as MockFileHandle;
    const metaHandle = await maskDir.getFileHandle("1.seg.json") as MockFileHandle;
    const metaText = await metaHandle.getFile().then((file) => file.text());

    expect(result).toMatchObject({
      saved: true,
      primaryFilePath: "mask/1.png",
      hasLabels: true
    });
    expect(pngHandle.writable.writes[0]).toBeInstanceOf(ArrayBuffer);
    expect(JSON.parse(metaText)).toMatchObject({
      activeClassId: "7",
      overlayOpacity: 0.4,
      hiddenClassIds: ["3"]
    });
    expect(state.imageWorkflowStatus.get("1.jpg")?.segmentation.hasAnnotation).toBe(true);
  });

  it("loads segmentation from png and safely degrades when metadata is missing", async () => {
    const { createSegmentationAnnotationCodec } = await import("../../../../src/domain/annotations/segmentation-codec.js");
    const codec = createSegmentationAnnotationCodec();
    const encoded = codec.encode({
      imageBaseName: "scene-a",
      snapshot: {
        width: 2,
        height: 2,
        mask: new Uint16Array([0, 9, 0, 9]),
        activeClassId: "9",
        activeTool: "erase",
        overlayVisible: false,
        overlayOpacity: 0.25,
        hiddenClassIds: new Set<string>(["4"]),
        brushRadius: 3
      }
    });

    const maskDir = new MockDirectoryHandle("mask")
      .withFile(new MockFileHandle("scene-a.png", encoded[0]?.content as Uint8Array));
    const imageDir = new MockDirectoryHandle("images")
      .withDirectory(maskDir)
      .withFile(new MockFileHandle("scene-a.png"));
    const state = createState();
    state.imageFolderHandle = imageDir;
    state.workflow = "segmentation";

    const applyLoadedSegmentationSnapshot = vi.fn();
    const service = createImageSessionService(state, {
      decodeImage: vi.fn(async ({ fileHandle }) => `decoded:${fileHandle.name}`),
      readCurrentLabelsAsYolo: () => "",
      readCurrentSegmentationSnapshot: () => null,
      applyLoadedYolo: vi.fn(),
      applyLoadedSegmentationSnapshot,
      clearPendingSaveTimeout: vi.fn(),
      revokePreviewUrl: vi.fn()
    });

    await service.loadImageAndLabels(new MockFileHandle("scene-a.png"));

    expect(applyLoadedSegmentationSnapshot).toHaveBeenCalledWith(expect.objectContaining({
      activeClassId: "1",
      overlayVisible: true,
      overlayOpacity: 0.6,
      brushRadius: 6
    }));
    const snapshot = applyLoadedSegmentationSnapshot.mock.calls[0]?.[0];
    expect(snapshot?.mask).toEqual(new Uint16Array([0, 9, 0, 9]));
  });


  it("loads review documents separately for detection and segmentation and saves the targeted review workflow only", async () => {
    const reviewDetectionDir = new MockDirectoryHandle("detection")
      .withFile(new MockFileHandle("scene-a.review.json", JSON.stringify({
        workflow: "detection",
        format: "review-json-v1",
        status: "approved",
        note: "bbox ok",
        issueFlags: { geometry: false }
      })));
    const reviewSegmentationDir = new MockDirectoryHandle("segmentation")
      .withFile(new MockFileHandle("scene-a.review.json", JSON.stringify({
        workflow: "segmentation",
        format: "review-json-v1",
        status: "needs-fix",
        note: "mask spill",
        issueFlags: { coverage: true }
      })));
    const reviewDir = new MockDirectoryHandle("review")
      .withDirectory(reviewDetectionDir)
      .withDirectory(reviewSegmentationDir);
    const imageDir = new MockDirectoryHandle("images")
      .withDirectory(reviewDir)
      .withFile(new MockFileHandle("scene-a.png"));
    const state = createState();
    state.imageFolderHandle = imageDir;
    state.currentImageFile = new MockFileHandle("scene-a.png");
    state.workflow = "review";

    const service = createImageSessionService(state, {
      decodeImage: vi.fn(async () => "decoded"),
      readCurrentLabelsAsYolo: () => "",
      readCurrentSegmentationSnapshot: () => null,
      applyLoadedYolo: vi.fn(),
      applyLoadedSegmentationSnapshot: vi.fn(),
      clearPendingSaveTimeout: vi.fn(),
      revokePreviewUrl: vi.fn()
    });

    await service.loadLabels("scene-a.png", 0);

    expect(state.reviewDocuments.detection).toMatchObject({ status: "approved", note: "bbox ok" });
    expect(state.reviewDocuments.segmentation).toMatchObject({ status: "needs-fix", note: "mask spill" });

    state.reviewTargetWorkflow = "segmentation";
    state.reviewDocuments.segmentation = {
      workflow: "segmentation",
      format: "review-json-v1",
      status: "approved",
      note: "fixed",
      issueFlags: { coverage: false, edges: false }
    };

    const result = await service.saveLabels();
    const savedText = await reviewSegmentationDir.getFileHandle("scene-a.review.json").then((file) => file.getFile()).then((file) => file.text());

    expect(result).toMatchObject({
      saved: true,
      primaryFilePath: "review/segmentation/scene-a.review.json",
      hasLabels: true
    });
    expect(JSON.parse(savedText)).toMatchObject({
      workflow: "segmentation",
      status: "approved",
      note: "fixed"
    });
    expect(state.imageWorkflowStatus.get("scene-a.png")?.segmentation.reviewStatus).toBe("approved");
    expect(state.imageWorkflowStatus.get("scene-a.png")?.detection.reviewStatus).toBe("untouched");
  });


  it("saves detection review target by writing both yolo labels and the detection review sidecar", async () => {
    const labelDir = new MockDirectoryHandle("label");
    const reviewDetectionDir = new MockDirectoryHandle("detection");
    const reviewDir = new MockDirectoryHandle("review").withDirectory(reviewDetectionDir);
    const imageDir = new MockDirectoryHandle("images").withDirectory(reviewDir);
    const state = createState();
    state.currentImageFile = new MockFileHandle("scene-a.png");
    state.labelFolderHandle = labelDir;
    state.imageFolderHandle = imageDir;
    state.workflow = "review";
    state.reviewTargetWorkflow = "detection";
    state.reviewDocuments.detection = {
      workflow: "detection",
      format: "review-json-v1",
      status: "approved",
      note: "looks good",
      issueFlags: { geometry: false }
    };

    const service = createImageSessionService(state, {
      decodeImage: vi.fn(async () => "decoded"),
      readCurrentLabelsAsYolo: () => "2 0.5 0.5 0.2 0.2\n",
      readCurrentSegmentationSnapshot: () => null,
      applyLoadedYolo: vi.fn(),
      applyLoadedSegmentationSnapshot: vi.fn(),
      clearPendingSaveTimeout: vi.fn(),
      revokePreviewUrl: vi.fn()
    });

    const result = await service.saveLabels();

    const labelText = await labelDir.getFileHandle("scene-a.txt").then((file) => file.getFile()).then((file) => file.text());
    expect(result.saved).toBe(true);
    expect(labelText).toBe("2 0.5 0.5 0.2 0.2");
  });


  it("loads and saves segmentation review target while keeping segmentation persistence separate from detection review", async () => {
    const { createSegmentationAnnotationCodec } = await import("../../../../src/domain/annotations/segmentation-codec.js");
    const codec = createSegmentationAnnotationCodec();
    const assets = codec.encode({
      imageBaseName: "scene-b",
      snapshot: {
        width: 2,
        height: 2,
        mask: new Uint16Array([0, 4, 0, 4]),
        activeClassId: "4",
        activeTool: "brush",
        overlayVisible: true,
        overlayOpacity: 0.5,
        hiddenClassIds: new Set<string>(["7"]),
        brushRadius: 6
      }
    });
    const maskDir = new MockDirectoryHandle("mask")
      .withFile(new MockFileHandle("scene-b.png", assets[0]?.content as ArrayBuffer))
      .withFile(new MockFileHandle("scene-b.seg.json", assets[1]?.content as string));
    const reviewDetectionDir = new MockDirectoryHandle("detection");
    const reviewSegmentationDir = new MockDirectoryHandle("segmentation")
      .withFile(new MockFileHandle("scene-b.review.json", JSON.stringify({
        workflow: "segmentation",
        format: "review-json-v1",
        status: "needs-fix",
        note: "clean edges",
        issueFlags: { coverage: true }
      })));
    const reviewDir = new MockDirectoryHandle("review")
      .withDirectory(reviewDetectionDir)
      .withDirectory(reviewSegmentationDir);
    const imageDir = new MockDirectoryHandle("images")
      .withDirectory(maskDir)
      .withDirectory(reviewDir)
      .withFile(new MockFileHandle("scene-b.png"));
    const state = createState();
    state.imageFolderHandle = imageDir;
    state.currentImageFile = new MockFileHandle("scene-b.png");
    state.workflow = "review";
    state.reviewTargetWorkflow = "segmentation";

    const applyLoadedSegmentationSnapshot = vi.fn();
    const service = createImageSessionService(state, {
      decodeImage: vi.fn(async () => "decoded"),
      readCurrentLabelsAsYolo: () => "",
      readCurrentSegmentationSnapshot: () => ({
        width: 2,
        height: 2,
        mask: new Uint16Array([4, 4, 0, 0]),
        activeClassId: "4",
        activeTool: "erase",
        overlayVisible: false,
        overlayOpacity: 0.2,
        hiddenClassIds: new Set<string>(),
        brushRadius: 3
      }),
      applyLoadedYolo: vi.fn(),
      applyLoadedSegmentationSnapshot,
      clearPendingSaveTimeout: vi.fn(),
      revokePreviewUrl: vi.fn()
    });

    await service.loadLabels("scene-b.png", 0);
    expect(applyLoadedSegmentationSnapshot).toHaveBeenCalledWith(expect.objectContaining({ activeClassId: "4" }));
    expect(state.reviewDocuments.segmentation).toMatchObject({ status: "needs-fix", note: "clean edges" });

    state.reviewDocuments.segmentation = {
      workflow: "segmentation",
      format: "review-json-v1",
      status: "approved",
      note: "done",
      issueFlags: { coverage: false }
    };

    const result = await service.saveLabels();
    const reviewText = await reviewSegmentationDir.getFileHandle("scene-b.review.json").then((file) => file.getFile()).then((file) => file.text());
    const savedPng = await maskDir.getFileHandle("scene-b.png").then((file) => file.getFile()).then((file) => file.arrayBuffer?.());

    expect(result.saved).toBe(true);
    expect(savedPng).toBeInstanceOf(ArrayBuffer);
    expect(JSON.parse(reviewText)).toMatchObject({ status: "approved", note: "done" });
    expect(state.imageWorkflowStatus.get("scene-b.png")?.segmentation.reviewStatus).toBe("approved");
    expect(state.imageWorkflowStatus.get("scene-b.png")?.detection.reviewStatus).toBe("untouched");
  });


  it("does not mark segmentation as annotated when the saved mask is empty", async () => {
    const imageDir = new MockDirectoryHandle("images");
    const state = createState();
    state.currentImageFile = new MockFileHandle("empty.png");
    state.imageFolderHandle = imageDir;
    state.workflow = "segmentation";

    const result = await createImageSessionService(state, {
      decodeImage: vi.fn(async () => "decoded"),
      readCurrentLabelsAsYolo: () => "",
      readCurrentSegmentationSnapshot: () => ({
        width: 2,
        height: 2,
        mask: new Uint16Array([0, 0, 0, 0]),
        activeClassId: "1",
        activeTool: "brush",
        overlayVisible: true,
        overlayOpacity: 0.6,
        hiddenClassIds: new Set<string>(),
        brushRadius: 6
      }),
      applyLoadedYolo: vi.fn(),
      applyLoadedSegmentationSnapshot: vi.fn(),
      clearPendingSaveTimeout: vi.fn(),
      revokePreviewUrl: vi.fn()
    }).saveLabels();

    expect(result).toMatchObject({
      saved: true,
      primaryFilePath: "mask/empty.png",
      hasLabels: false
    });
    expect(state.imageWorkflowStatus.get("empty.png")?.segmentation.hasAnnotation).toBe(false);
  });


  it("does not treat segmentation metadata sidecars alone as annotated masks", async () => {
    const maskDir = new MockDirectoryHandle("mask")
      .withFile(new MockFileHandle("scene-a.seg.json", JSON.stringify({ activeClassId: "2" })));
    const imageDir = new MockDirectoryHandle("images")
      .withDirectory(maskDir)
      .withFile(new MockFileHandle("scene-a.png"));
    const state = createState();
    state.imageFolderHandle = imageDir;
    state.imageFiles = [new MockFileHandle("scene-a.png")];

    const service = createImageSessionService(state, {
      decodeImage: vi.fn(async () => "decoded"),
      readCurrentLabelsAsYolo: () => "",
      readCurrentSegmentationSnapshot: () => null,
      applyLoadedYolo: vi.fn(),
      applyLoadedSegmentationSnapshot: vi.fn(),
      clearPendingSaveTimeout: vi.fn(),
      revokePreviewUrl: vi.fn()
    });

    await service.refreshImageWorkflowStatus();

    expect(state.imageWorkflowStatus.get("scene-a.png")?.segmentation.hasAnnotation).toBe(false);
  });

  it("degrades malformed review json to an empty review document instead of aborting image load", async () => {
    const reviewDetectionDir = new MockDirectoryHandle("detection")
      .withFile(new MockFileHandle("scene-a.review.json", '{not valid json'));
    const reviewDir = new MockDirectoryHandle("review")
      .withDirectory(reviewDetectionDir)
      .withDirectory(new MockDirectoryHandle("segmentation"));
    const imageDir = new MockDirectoryHandle("images")
      .withDirectory(reviewDir)
      .withFile(new MockFileHandle("scene-a.png"));
    const state = createState();
    state.imageFolderHandle = imageDir;
    state.currentImageFile = new MockFileHandle("scene-a.png");
    state.workflow = "review";
    state.reviewTargetWorkflow = "detection";

    const service = createImageSessionService(state, {
      decodeImage: vi.fn(async () => "decoded"),
      readCurrentLabelsAsYolo: () => "",
      readCurrentSegmentationSnapshot: () => null,
      applyLoadedYolo: vi.fn(),
      applyLoadedSegmentationSnapshot: vi.fn(),
      clearPendingSaveTimeout: vi.fn(),
      revokePreviewUrl: vi.fn()
    });

    await expect(service.loadLabels("scene-a.png", 0)).resolves.toBeUndefined();
    expect(state.reviewDocuments.detection).toEqual({
      workflow: "detection",
      format: "review-json-v1",
      status: "untouched",
      note: "",
      issueFlags: {}
    });
  });

});
