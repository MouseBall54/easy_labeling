import type {
  AppState,
  ImageDocumentStatus,
  WorkflowDocumentStatus
} from "./state.js";
import type { WorkflowType } from "../types/labels.js";

function createWorkflowDocumentStatus(): WorkflowDocumentStatus {
  return {
    phase: "clean",
    revision: 0,
    savedRevision: 0,
    lastSavedAt: null,
    errorMessage: null,
    wasAutoSaved: false
  };
}

export function createImageDocumentStatus(): ImageDocumentStatus {
  return {
    detection: createWorkflowDocumentStatus(),
    segmentation: createWorkflowDocumentStatus()
  };
}

export function ensureDocumentStatus(
  state: AppState,
  imageName: string,
  workflow: WorkflowType
): WorkflowDocumentStatus {
  const statusByImage = state.session.documentStatusByImage ??= new Map();
  let imageStatus = statusByImage.get(imageName);
  if (!imageStatus) {
    imageStatus = createImageDocumentStatus();
    statusByImage.set(imageName, imageStatus);
  }
  return imageStatus[workflow];
}

export function getCurrentDocumentStatus(state: AppState): WorkflowDocumentStatus | null {
  const imageName = state.session.currentImageFile?.name;
  if (!imageName) {
    return null;
  }
  return ensureDocumentStatus(state, imageName, state.session.workflow);
}

export function markCurrentDocumentDirty(state: AppState): WorkflowDocumentStatus | null {
  const status = getCurrentDocumentStatus(state);
  if (!status) {
    return null;
  }
  status.revision += 1;
  status.phase = "dirty";
  status.errorMessage = null;
  status.wasAutoSaved = false;
  return status;
}

export function markDocumentSaving(
  state: AppState,
  imageName: string,
  workflow: WorkflowType,
  wasAutoSaved: boolean
): WorkflowDocumentStatus {
  const status = ensureDocumentStatus(state, imageName, workflow);
  status.phase = "saving";
  status.errorMessage = null;
  status.wasAutoSaved = wasAutoSaved;
  return status;
}

export function markDocumentSaved(
  state: AppState,
  imageName: string,
  workflow: WorkflowType,
  options: { wasAutoSaved: boolean; savedAt?: string }
): WorkflowDocumentStatus {
  const status = ensureDocumentStatus(state, imageName, workflow);
  status.savedRevision = status.revision;
  status.phase = "saved";
  status.lastSavedAt = options.savedAt ?? new Date().toISOString();
  status.errorMessage = null;
  status.wasAutoSaved = options.wasAutoSaved;
  return status;
}

export function markDocumentSaveError(
  state: AppState,
  imageName: string,
  workflow: WorkflowType,
  error: unknown
): WorkflowDocumentStatus {
  const status = ensureDocumentStatus(state, imageName, workflow);
  status.phase = "error";
  status.errorMessage = error instanceof Error ? error.message : String(error);
  return status;
}

export function markImageDocumentsClean(state: AppState, imageName: string): ImageDocumentStatus {
  const status = createImageDocumentStatus();
  (state.session.documentStatusByImage ??= new Map()).set(imageName, status);
  return status;
}

export function hasDirtyDocuments(state: AppState): boolean {
  return [...(state.session.documentStatusByImage?.values() ?? [])].some((imageStatus) => {
    return imageStatus.detection.phase === "dirty" || imageStatus.segmentation.phase === "dirty";
  });
}
