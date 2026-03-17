import type { FileHandle } from "../types/files.js";

export const CREATE_NEW_CLASS_FILE_VALUE = "__CREATE_NEW__";

export interface ImageListRenderInput {
  imageListElement: HTMLElement;
  imageFiles: FileHandle[];
  imageLabelStatus: Map<string, boolean>;
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
  currentImageFile: FileHandle | null;
  isPreviewBarHidden: boolean;
  onPreviewClick?: (file: FileHandle) => void;
}

export interface LabelRectLike {
  labelClass: string;
}

export interface LabelFilterRenderInput {
  labelFiltersElement: HTMLElement;
  rects: LabelRectLike[];
  getDisplayNameForClass: (labelClass: string) => string;
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

export function renderImageList(input: ImageListRenderInput): FileHandle[] {
  const normalizedSearchTerm = input.searchTerm.toLowerCase();
  const filteredFiles = [...input.imageFiles]
    .sort(compareFileNames)
    .filter((file) => {
      const isLabeled = input.imageLabelStatus.get(file.name) ?? false;
      if (!input.showLabeled && isLabeled) {
        return false;
      }
      if (!input.showUnlabeled && !isLabeled) {
        return false;
      }

      return file.name.toLowerCase().includes(normalizedSearchTerm);
    });

  input.imageListElement.innerHTML = "";
  const fragment = document.createDocumentFragment();

  for (const file of filteredFiles) {
    const isLabeled = input.imageLabelStatus.get(file.name) ?? false;
    const icon = isLabeled
      ? '<i class="bi bi-check-circle-fill text-success me-2"></i>'
      : '<i class="bi bi-x-circle-fill text-muted me-2"></i>';
    const item = document.createElement("a");
    item.href = "#";
    item.className = "list-group-item list-group-item-action d-flex align-items-center";
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

  const totalElement = document.createElement("span");
  totalElement.className = "badge bg-dark me-2 mb-1 align-items-center d-inline-flex";
  totalElement.textContent = `Total: ${totalCount}`;
  input.labelFiltersElement.appendChild(totalElement);

  if (uniqueClasses.length > 1) {
    const allButton = document.createElement("button");
    allButton.className = "btn btn-sm btn-primary me-1 mb-1";
    allButton.textContent = "All";
    input.labelFiltersElement.appendChild(allButton);
  }

  for (const labelClass of uniqueClasses) {
    const button = document.createElement("button");
    button.className = "btn btn-sm btn-outline-secondary me-1 mb-1 active";
    button.textContent = `${input.getDisplayNameForClass(labelClass)} (${classCounts[labelClass] ?? 0})`;
    button.dataset.labelClass = labelClass;
    input.labelFiltersElement.appendChild(button);
  }
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
    const item = document.createElement("div");
    item.className = "preview-item";
    item.dataset.fileName = file.name;
    if (file.name === input.currentImageFile.name) {
      item.classList.add("active");
    }

    const image = document.createElement("img");
    image.alt = file.name;
    item.appendChild(image);
    input.previewListElement.appendChild(item);

    if (input.onPreviewClick) {
      item.addEventListener("click", () => {
        input.onPreviewClick?.(file);
      });
    }
  }

  return filesToPreview;
}
