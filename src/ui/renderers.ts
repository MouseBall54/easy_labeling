import type { ImageWorkflowStatus } from "../domain/annotations/contracts.js";
import type { WorkflowType } from "../types/labels.js";
import type { FileHandle } from "../types/files.js";
import { UNLABELED_FILTER_KEY } from "./filter-state.js";
import { getColorForClass } from "../features/canvas/colors.js";
import type { ClassFileRow } from "../domain/class-files.js";
import type { ReviewFinding, ReviewStateDocument } from "../features/review/types.js";
import { isThumbnailableFileName, THUMBNAIL_SIZE_PX } from "./image-thumbnails.js";

export const CREATE_NEW_CLASS_FILE_VALUE = "__CREATE_NEW__";

export interface ImageListRenderInput {
  imageListElement: HTMLElement;
  imageFiles: FileHandle[];
  imageWorkflowStatus: Map<string, ImageWorkflowStatus>;
  activeWorkflow: WorkflowType;
  currentImageFile: FileHandle | null;
  searchTerm: string;
  showLabeled: boolean;
  showUnlabeled: boolean;
  reviewFilter?: "all" | "needs-review" | "reviewed" | "has-issues";
  reviewState?: ReviewStateDocument;
  reviewFindings?: Map<string, ReviewFinding>;
  onImageClick?: (file: FileHandle) => void;
}

export interface LabelRectLike {
  labelClass: string;
}


export interface WorkflowPanelRenderInput {
  detectionPanelElement: HTMLElement;
  segmentationPanelElement: HTMLElement;
  activeWorkflow: WorkflowType;
}

export function renderWorkflowPanels(input: WorkflowPanelRenderInput): void {
  const showDetectionPanel = input.activeWorkflow === "detection";
  const showSegmentationPanel = input.activeWorkflow === "segmentation";
  input.detectionPanelElement.style.display = showDetectionPanel ? "" : "none";
  input.detectionPanelElement.dataset.workflowActive = String(showDetectionPanel);
  input.segmentationPanelElement.style.display = showSegmentationPanel ? "" : "none";
  input.segmentationPanelElement.dataset.workflowActive = String(showSegmentationPanel);
}

export interface LabelFilterRenderInput {
  labelFiltersElement: HTMLElement;
  rects: LabelRectLike[];
  getDisplayNameForClass: (labelClass: string) => string;
  activeFilterKeys?: ReadonlySet<string>;
  isAllActive?: boolean;
  canEditColors?: boolean;
}

export function createClassColorInput(documentRef: Document, classId: string, displayName: string): HTMLInputElement {
  const input = documentRef.createElement("input");
  input.type = "color";
  input.className = "form-control form-control-color class-color-input";
  input.value = getColorForClass(classId);
  input.dataset.ui = "class-color";
  input.dataset.classId = classId;
  input.title = `Change color for ${displayName}`;
  input.setAttribute("aria-label", input.title);
  return input;
}

export function createClassFileEditorRow(documentRef: Document, row: ClassFileRow): HTMLTableRowElement {
  const tr = documentRef.createElement("tr");
  for (const field of ["id", "name"] as const) {
    const cell = documentRef.createElement("td");
    const input = documentRef.createElement("input");
    input.className = `form-control class-${field}-input`;
    input.value = row[field];
    input.setAttribute("aria-label", field === "id" ? "Class ID" : "Class name");
    cell.appendChild(input);
    tr.appendChild(cell);
  }
  const colorCell = documentRef.createElement("td");
  const color = createClassColorInput(documentRef, row.id, row.name || "new class");
  color.dataset.ui = "class-file-color";
  if (row.color) {
    color.value = row.color;
    color.dataset.edited = "true";
  }
  colorCell.appendChild(color);
  tr.appendChild(colorCell);
  const actions = documentRef.createElement("td");
  actions.innerHTML = '<button type="button" class="btn btn-sm btn-danger delete-class-row-btn">Delete</button>';
  tr.appendChild(actions);
  return tr;
}

export interface LabelFilterBindingInput {
  labelFiltersElement: HTMLElement;
  onSelectAll: () => void;
  onSelectClass: (labelClass: string) => void;
}

interface WorkflowBadgeDescriptor {
  iconClassName: string;
  isPositive: boolean;
  statusKey: string;
  label: string;
}

export function showLoadingOverlay(loadingOverlayElement: HTMLElement): void {
  loadingOverlayElement.classList.add("show");
}

export function hideLoadingOverlay(loadingOverlayElement: HTMLElement): void {
  loadingOverlayElement.classList.remove("show");
}

function compareFileNames(a: FileHandle, b: FileHandle): number {
  return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
}

function deriveWorkflowBadge(status: ImageWorkflowStatus | undefined, workflow: WorkflowType): WorkflowBadgeDescriptor {
  if (!status) return { iconClassName: "bi bi-clock text-muted", isPositive: false, statusKey: `${workflow}-pending`, label: "Labels not checked yet" };
  const workflowStatus = workflow === "segmentation" ? status.segmentation : status.detection;
  if (workflowStatus.hasAnnotation) {
    return {
      iconClassName: "bi bi-check-circle-fill text-success",
      isPositive: true,
      statusKey: `${workflow}-present`,
      label: `${workflow} annotation present`
    };
  }

  return {
    iconClassName: "bi bi-x-circle-fill text-muted",
    isPositive: false,
    statusKey: `${workflow}-missing`,
    label: `${workflow} annotation missing`
  };
}

export function renderImageList(input: ImageListRenderInput): FileHandle[] {
  const normalizedSearchTerm = input.searchTerm.toLowerCase();
  const reviewFilter = input.activeWorkflow === "detection" ? input.reviewFilter ?? "all" : "all";
  const reviewImages = input.reviewState?.images ?? {};
  const reviewFindings = input.reviewFindings ?? new Map<string, ReviewFinding>();
  const filteredFiles = [...input.imageFiles]
    .sort(compareFileNames)
    .filter((file) => {
      const status = input.imageWorkflowStatus.get(file.name);
      const badge = deriveWorkflowBadge(status, input.activeWorkflow);
      if (status && !input.showLabeled && badge.isPositive) {
        return false;
      }
      if ((!input.showLabeled && !input.showUnlabeled) || (status && !input.showUnlabeled && !badge.isPositive)) {
        return false;
      }
      const reviewStatus = reviewImages[file.name]?.status ?? "needs-review";
      const finding = reviewFindings.get(file.name);
      if (reviewFilter === "needs-review" && reviewStatus !== "needs-review") {
        return false;
      }
      if (reviewFilter === "reviewed" && reviewStatus !== "reviewed") {
        return false;
      }
      if (reviewFilter === "has-issues" && finding && !finding.issues.length) {
        return false;
      }

      return file.name.toLowerCase().includes(normalizedSearchTerm);
    });

  input.imageListElement.innerHTML = "";
  const fragment = document.createDocumentFragment();

  for (const file of filteredFiles) {
    const badge = deriveWorkflowBadge(input.imageWorkflowStatus.get(file.name), input.activeWorkflow);
    const item = document.createElement("a");
    item.href = "#";
    item.className = "list-group-item list-group-item-action d-flex align-items-center image-list-item";
    item.dataset.ui = "image-list-item";
    item.dataset.fileName = file.name;
    item.dataset.testid = `image-list-item-${file.name}`;
    item.dataset.status = badge.statusKey;
    const finding = input.activeWorkflow === "detection" ? reviewFindings.get(file.name) : undefined;
    const reviewStatus = input.activeWorkflow === "detection" ? reviewImages[file.name]?.status ?? "needs-review" : "none";
    item.dataset.reviewStatus = reviewStatus;
    item.dataset.reviewSeverity = finding?.highestSeverity ?? (input.activeWorkflow === "detection" && !finding ? "pending" : "none");

    if (isThumbnailableFileName(file.name)) {
      const thumb = document.createElement("canvas");
      thumb.className = "image-list-item-thumb";
      thumb.width = THUMBNAIL_SIZE_PX;
      thumb.height = THUMBNAIL_SIZE_PX;
      thumb.dataset.thumbFile = file.name;
      thumb.dataset.thumbState = "pending";
      item.appendChild(thumb);
    } else {
      const placeholder = document.createElement("i");
      placeholder.className = "bi bi-file-earmark-image image-list-item-thumb image-list-item-thumb-placeholder";
      placeholder.setAttribute("aria-hidden", "true");
      item.appendChild(placeholder);
    }

    const statusIcon = document.createElement("i");
    statusIcon.className = `${badge.iconClassName} me-2`;
    statusIcon.dataset.ui = "image-status-badge";
    statusIcon.dataset.status = badge.statusKey;
    statusIcon.setAttribute("aria-label", badge.label);
    item.appendChild(statusIcon);

    const name = document.createElement("span");
    name.className = "image-list-item-name";
    name.textContent = file.name;

    item.appendChild(name);
    if (input.activeWorkflow === "detection") {
      const boxCount = input.imageWorkflowStatus.get(file.name)?.detection.boxCount;
      const count = document.createElement("span");
      count.className = "badge rounded-pill image-box-count";
      count.dataset.ui = "image-box-count";
      count.setAttribute("aria-label", boxCount === undefined ? "Labels not checked yet" : `${boxCount} detection boxes`);
      count.title = boxCount === undefined ? "Labels not checked yet" : `${boxCount} detection boxes`;
      count.textContent = boxCount === undefined ? "…" : String(boxCount);
      item.appendChild(count);
    }

    if (input.activeWorkflow === "detection" && finding?.issues.length) {
      const reviewBadge = document.createElement("span");
      reviewBadge.className = `badge rounded-pill ms-1 ${finding.highestSeverity === "error" ? "text-bg-danger" : "text-bg-warning"}`;
      reviewBadge.dataset.ui = "review-issue-count";
      reviewBadge.setAttribute("aria-label", `${finding.issues.length} review issues`);
      reviewBadge.title = `${finding.issues.length} review issues`;
      reviewBadge.textContent = String(finding.issues.length);
      item.appendChild(reviewBadge);
    }

    if (input.currentImageFile && file.name === input.currentImageFile.name) {
      item.classList.add("active");
    }

    if (input.onImageClick) {
      item.addEventListener("click", (event) => {
        event.preventDefault();
        input.onImageClick?.(file);
      });
    }

    fragment.appendChild(item);
  }

  input.imageListElement.appendChild(fragment);
  return filteredFiles;
}

export function renderClassFileSelect(
  classFileSelectElement: HTMLSelectElement,
  classFiles: FileHandle[],
  selectedClassFileName: string | null
): void {
  classFileSelectElement.innerHTML = "";

  const createNewOption = document.createElement("option");
  createNewOption.value = CREATE_NEW_CLASS_FILE_VALUE;
  createNewOption.textContent = "＋ Create new class file...";
  classFileSelectElement.appendChild(createNewOption);

  const separator = document.createElement("option");
  separator.disabled = true;
  separator.textContent = "──────────";
  classFileSelectElement.appendChild(separator);

  for (const file of [...classFiles].sort(compareFileNames)) {
    const option = document.createElement("option");
    option.value = file.name;
    option.textContent = file.name;
    classFileSelectElement.appendChild(option);
  }

  if (selectedClassFileName) {
    classFileSelectElement.value = selectedClassFileName;
    return;
  }

  classFileSelectElement.selectedIndex = -1;
}

export function renderSelectByClassDropdown(
  dropdownElement: HTMLSelectElement,
  rects: LabelRectLike[],
  getDisplayNameForClass: (labelClass: string) => string
): void {
  dropdownElement.innerHTML = '<option selected value="">Select by class...</option>';

  const uniqueClasses = [...new Set(rects.map((rect) => rect.labelClass))].sort((a, b) => {
    return Number.parseInt(a, 10) - Number.parseInt(b, 10);
  });

  for (const labelClass of uniqueClasses) {
    const option = document.createElement("option");
    option.value = labelClass;
    option.textContent = getDisplayNameForClass(labelClass);
    dropdownElement.appendChild(option);
  }
}

export function renderLabelFilters(input: LabelFilterRenderInput): void {
  input.labelFiltersElement.innerHTML = "";

  const classCounts = input.rects.reduce<Record<string, number>>((acc, rect) => {
    acc[rect.labelClass] = (acc[rect.labelClass] ?? 0) + 1;
    return acc;
  }, {});
  const totalCount = input.rects.length;
  const uniqueClasses = [...new Set(input.rects.map((rect) => rect.labelClass))].sort((a, b) => {
    return Number.parseInt(a, 10) - Number.parseInt(b, 10);
  });

  if (totalCount > 0) {
    const allButton = document.createElement("button");
    allButton.className = `class-filter-row ${input.isAllActive ? "active btn-primary" : ""}`.trim();
    allButton.type = "button";
    allButton.setAttribute("aria-pressed", String(input.isAllActive));
    allButton.innerHTML = `<i class="bi bi-grid-fill" aria-hidden="true"></i><span class="class-name">All classes</span><span class="class-count">${totalCount}</span><i class="bi ${input.isAllActive ? "bi-eye" : "bi-eye-slash"} class-visibility-icon" aria-hidden="true"></i>`;
    allButton.dataset.ui = "filter-all";
    allButton.dataset.testid = "filter-all";
    input.labelFiltersElement.appendChild(allButton);
  }

  for (const labelClass of uniqueClasses) {
    const button = document.createElement("button");
    const normalizedFilterKey = labelClass === UNLABELED_FILTER_KEY ? UNLABELED_FILTER_KEY : labelClass;
    const isActive = input.activeFilterKeys?.has(normalizedFilterKey) ?? false;
    button.className = `class-filter-row ${isActive ? "active btn-primary" : ""}`.trim();
    button.type = "button";
    button.setAttribute("aria-pressed", String(isActive));
    button.innerHTML = `<span class="class-name"></span><span class="class-count">${classCounts[labelClass] ?? 0}</span><i class="bi ${isActive ? "bi-eye" : "bi-eye-slash"} class-visibility-icon" aria-hidden="true"></i>`;
    const className = button.querySelector<HTMLElement>(".class-name");
    if (className) {
      className.textContent = input.getDisplayNameForClass(labelClass);
      className.title = className.textContent;
    }
    button.dataset.labelClass = labelClass;
    button.dataset.filterKey = normalizedFilterKey;
    button.dataset.ui = "filter-class";
    button.dataset.testid = normalizedFilterKey === UNLABELED_FILTER_KEY
      ? "filter-class-unlabeled"
      : `filter-class-${labelClass}`;
    const row = document.createElement("div");
    row.className = "class-filter-entry";
    const color = createClassColorInput(document, labelClass, input.getDisplayNameForClass(labelClass));
    color.disabled = !input.canEditColors || !/^\d+$/.test(labelClass);
    row.appendChild(color);
    row.appendChild(button);
    input.labelFiltersElement.appendChild(row);
  }
}

export function bindLabelFilterEvents(input: LabelFilterBindingInput): void {
  input.labelFiltersElement.querySelectorAll<HTMLButtonElement>('[data-ui="filter-class"]').forEach((button) => {
    button.addEventListener("click", () => {
      input.onSelectClass(button.dataset.filterKey ?? button.dataset.labelClass ?? "");
    });
  });

  input.labelFiltersElement.querySelectorAll<HTMLButtonElement>('[data-ui="filter-all"]').forEach((button) => {
    button.addEventListener("click", () => {
      input.onSelectAll();
    });
  });
}
