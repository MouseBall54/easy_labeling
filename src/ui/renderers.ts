import type { ImageWorkflowStatus } from "../domain/annotations/contracts.js";
import type { WorkflowType } from "../types/labels.js";
import type { FileHandle } from "../types/files.js";
import { UNLABELED_FILTER_KEY } from "./filter-state.js";
import { getColorForClass } from "../features/canvas/colors.js";

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
  onImageClick?: (file: FileHandle) => void;
}

export interface PreviewListRenderInput {
  bottomPanelElement: HTMLElement;
  previewListElement: HTMLElement;
  previewListWrapperElement: HTMLElement;
  imageFiles: FileHandle[];
  imageWorkflowStatus: Map<string, ImageWorkflowStatus>;
  activeWorkflow: WorkflowType;
  currentImageFile: FileHandle | null;
  isPreviewBarHidden: boolean;
  onPreviewClick?: (file: FileHandle) => void;
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

function getDefaultWorkflowStatus(): ImageWorkflowStatus {
  return {
    detection: {
      hasAnnotation: false
    },
    segmentation: {
      hasAnnotation: false
    }
  };
}
function deriveWorkflowBadge(status: ImageWorkflowStatus, workflow: WorkflowType): WorkflowBadgeDescriptor {
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
  const filteredFiles = [...input.imageFiles]
    .sort(compareFileNames)
    .filter((file) => {
      const badge = deriveWorkflowBadge(input.imageWorkflowStatus.get(file.name) ?? getDefaultWorkflowStatus(), input.activeWorkflow);
      if (!input.showLabeled && badge.isPositive) {
        return false;
      }
      if (!input.showUnlabeled && !badge.isPositive) {
        return false;
      }

      return file.name.toLowerCase().includes(normalizedSearchTerm);
    });

  input.imageListElement.innerHTML = "";
  const fragment = document.createDocumentFragment();

  for (const file of filteredFiles) {
    const badge = deriveWorkflowBadge(input.imageWorkflowStatus.get(file.name) ?? getDefaultWorkflowStatus(), input.activeWorkflow);
    const icon = `<i class="${badge.iconClassName} me-2" data-ui="image-status-badge" data-status="${badge.statusKey}" aria-label="${badge.label}"></i>`;
    const item = document.createElement("a");
    item.href = "#";
    item.className = "list-group-item list-group-item-action d-flex align-items-center image-list-item";
    item.dataset.ui = "image-list-item";
    item.dataset.fileName = file.name;
    item.dataset.testid = `image-list-item-${file.name}`;
    item.dataset.status = badge.statusKey;
    item.innerHTML = `${icon}<span>${file.name}</span>`;

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
    button.innerHTML = `<span class="label-color-swatch" style="background-color:${getColorForClass(labelClass)}" aria-hidden="true"></span><span class="class-name"></span><span class="class-count">${classCounts[labelClass] ?? 0}</span><i class="bi ${isActive ? "bi-eye" : "bi-eye-slash"} class-visibility-icon" aria-hidden="true"></i>`;
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
    input.labelFiltersElement.appendChild(button);
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

export function renderPreviewList(input: PreviewListRenderInput): FileHandle[] {
  if (input.isPreviewBarHidden) {
    return [];
  }

  if (!input.currentImageFile) {
    input.bottomPanelElement.style.display = "none";
    return [];
  }

  input.bottomPanelElement.style.display = "flex";
  input.previewListElement.innerHTML = "";

  const containerWidth = input.previewListWrapperElement.offsetWidth;
  const itemWidth = 90 + 10;
  const minPreviews = 10;
  const numPreviews = Math.max(minPreviews, Math.floor(containerWidth / itemWidth));
  const halfPreviews = Math.floor(numPreviews / 2);

  const currentIndex = input.imageFiles.findIndex((file) => file.name === input.currentImageFile?.name);
  let startIndex = Math.max(0, currentIndex - halfPreviews);
  let endIndex = Math.min(input.imageFiles.length - 1, currentIndex + halfPreviews);

  if (endIndex - startIndex + 1 < numPreviews) {
    if (startIndex === 0) {
      endIndex = Math.min(input.imageFiles.length - 1, numPreviews - 1);
    } else if (endIndex === input.imageFiles.length - 1) {
      startIndex = Math.max(0, input.imageFiles.length - numPreviews);
    }
  }

  const filesToPreview = input.imageFiles.slice(startIndex, endIndex + 1);

  for (const file of filesToPreview) {
    const badge = deriveWorkflowBadge(input.imageWorkflowStatus.get(file.name) ?? getDefaultWorkflowStatus(), input.activeWorkflow);
    const item = document.createElement("div");
    item.className = "preview-item preview-list-item";
    item.dataset.ui = "preview-list-item";
    item.dataset.fileName = file.name;
    item.dataset.status = badge.statusKey;
    if (file.name === input.currentImageFile.name) {
      item.classList.add("active");
    }

    const image = document.createElement("img");
    image.alt = file.name;
    item.appendChild(image);

    const badgeElement = document.createElement("span");
    badgeElement.className = "preview-status-badge position-absolute top-0 end-0 m-1";
    badgeElement.dataset.ui = "preview-status-badge";
    badgeElement.dataset.status = badge.statusKey;
    badgeElement.innerHTML = `<i class="${badge.iconClassName}" aria-label="${badge.label}"></i>`;
    item.appendChild(badgeElement);

    input.previewListElement.appendChild(item);

    if (input.onPreviewClick) {
      item.addEventListener("click", () => {
        input.onPreviewClick?.(file);
      });
    }
  }

  return filesToPreview;
}
