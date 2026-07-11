import { describe, expect, it } from "vitest";

import {
  ensureDocumentStatus,
  getCurrentDocumentStatus,
  hasDirtyDocuments,
  markCurrentDocumentDirty,
  markDocumentSaveError,
  markDocumentSaved,
  markDocumentSaving,
  markImageDocumentsClean
} from "../../../src/app/document-status.js";
import { createInitialAppState } from "../../../src/app/state.js";

function fileHandle(name: string): FileSystemFileHandle {
  return { kind: "file", name } as FileSystemFileHandle;
}

describe("app/document-status", () => {
  it("tracks independent image and workflow revisions", () => {
    const state = createInitialAppState();
    state.session.currentImageFile = fileHandle("one.jpg");

    expect(getCurrentDocumentStatus(state)?.phase).toBe("clean");
    markCurrentDocumentDirty(state);
    expect(ensureDocumentStatus(state, "one.jpg", "detection")).toMatchObject({
      phase: "dirty",
      revision: 1,
      savedRevision: 0
    });
    expect(ensureDocumentStatus(state, "one.jpg", "segmentation").phase).toBe("clean");
    expect(hasDirtyDocuments(state)).toBe(true);
  });

  it("moves through saving, saved, and error states without losing the saved revision", () => {
    const state = createInitialAppState();
    state.session.currentImageFile = fileHandle("one.jpg");
    markCurrentDocumentDirty(state);

    expect(markDocumentSaving(state, "one.jpg", "detection", true).phase).toBe("saving");
    expect(markDocumentSaved(state, "one.jpg", "detection", {
      wasAutoSaved: true,
      savedAt: "2026-07-11T00:00:00.000Z"
    })).toMatchObject({
      phase: "saved",
      revision: 1,
      savedRevision: 1,
      wasAutoSaved: true,
      lastSavedAt: "2026-07-11T00:00:00.000Z"
    });

    markCurrentDocumentDirty(state);
    expect(markDocumentSaveError(state, "one.jpg", "detection", new Error("disk full"))).toMatchObject({
      phase: "error",
      revision: 2,
      savedRevision: 1,
      errorMessage: "disk full"
    });
  });

  it("resets both workflow statuses when a new image session is loaded", () => {
    const state = createInitialAppState();
    ensureDocumentStatus(state, "one.jpg", "detection").phase = "dirty";
    ensureDocumentStatus(state, "one.jpg", "segmentation").phase = "error";

    const status = markImageDocumentsClean(state, "one.jpg");
    expect(status.detection.phase).toBe("clean");
    expect(status.segmentation.phase).toBe("clean");
    expect(hasDirtyDocuments(state)).toBe(false);
  });
});
