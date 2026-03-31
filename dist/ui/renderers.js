import { UNLABELED_FILTER_KEY } from "./filter-state.js";
export const CREATE_NEW_CLASS_FILE_VALUE = "__CREATE_NEW__";
export function renderWorkflowPanels(input) {
    const showDetectionPanel = input.activeWorkflow === "detection" || (input.activeWorkflow === "review" && input.reviewTargetWorkflow === "detection");
    const showSegmentationPanel = input.activeWorkflow === "segmentation" || (input.activeWorkflow === "review" && input.reviewTargetWorkflow === "segmentation");
    input.detectionPanelElement.style.display = showDetectionPanel ? "" : "none";
    input.detectionPanelElement.dataset.workflowActive = String(showDetectionPanel);
    input.segmentationPanelElement.style.display = showSegmentationPanel ? "" : "none";
    input.segmentationPanelElement.dataset.workflowActive = String(showSegmentationPanel);
    input.reviewPanelElement.style.display = input.activeWorkflow === "review" ? "" : "none";
    input.reviewPanelElement.dataset.workflowActive = String(input.activeWorkflow === "review");
}
export function showLoadingOverlay(loadingOverlayElement) {
    loadingOverlayElement.classList.add("show");
}
export function hideLoadingOverlay(loadingOverlayElement) {
    loadingOverlayElement.classList.remove("show");
}
function compareFileNames(a, b) {
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
}
function getDefaultWorkflowStatus() {
    return {
        detection: {
            hasAnnotation: false,
            reviewStatus: "untouched"
        },
        segmentation: {
            hasAnnotation: false,
            reviewStatus: "untouched"
        }
    };
}
function deriveReviewBadge(status, targetWorkflow) {
    const reviewStatus = status[targetWorkflow].reviewStatus;
    if (reviewStatus === "needs-fix") {
        return {
            iconClassName: "bi bi-exclamation-triangle-fill text-warning",
            isPositive: true,
            statusKey: `review-${targetWorkflow}-needs-fix`,
            label: `${targetWorkflow} review needs fix`
        };
    }
    if (reviewStatus === "approved") {
        return {
            iconClassName: "bi bi-check-circle-fill text-success",
            isPositive: true,
            statusKey: `review-${targetWorkflow}-approved`,
            label: `${targetWorkflow} review approved`
        };
    }
    return {
        iconClassName: "bi bi-x-circle-fill text-muted",
        isPositive: false,
        statusKey: `review-${targetWorkflow}-untouched`,
        label: `${targetWorkflow} review untouched`
    };
}
function deriveWorkflowBadge(status, workflow, reviewTargetWorkflow = "detection") {
    if (workflow === "review") {
        return deriveReviewBadge(status, reviewTargetWorkflow);
    }
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
export function renderImageList(input) {
    const normalizedSearchTerm = input.searchTerm.toLowerCase();
    const filteredFiles = [...input.imageFiles]
        .sort(compareFileNames)
        .filter((file) => {
        const badge = deriveWorkflowBadge(input.imageWorkflowStatus.get(file.name) ?? getDefaultWorkflowStatus(), input.activeWorkflow, input.reviewTargetWorkflow);
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
        const badge = deriveWorkflowBadge(input.imageWorkflowStatus.get(file.name) ?? getDefaultWorkflowStatus(), input.activeWorkflow, input.reviewTargetWorkflow);
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
export function renderClassFileSelect(classFileSelectElement, classFiles, selectedClassFileName) {
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
export function renderSelectByClassDropdown(dropdownElement, rects, getDisplayNameForClass) {
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
export function renderLabelFilters(input) {
    input.labelFiltersElement.innerHTML = "";
    const classCounts = input.rects.reduce((acc, rect) => {
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
    if (totalCount > 0) {
        const allButton = document.createElement("button");
        allButton.className = `btn btn-sm me-1 mb-1 ${input.isAllActive ? "btn-primary" : "btn-outline-primary"}`;
        allButton.type = "button";
        allButton.textContent = "All";
        allButton.dataset.ui = "filter-all";
        allButton.dataset.testid = "filter-all";
        input.labelFiltersElement.appendChild(allButton);
    }
    for (const labelClass of uniqueClasses) {
        const button = document.createElement("button");
        const normalizedFilterKey = labelClass === UNLABELED_FILTER_KEY ? UNLABELED_FILTER_KEY : labelClass;
        const isActive = input.activeFilterKeys?.has(normalizedFilterKey) ?? false;
        button.className = `btn btn-sm me-1 mb-1 ${isActive ? "btn-secondary active" : "btn-outline-secondary"}`;
        button.type = "button";
        button.textContent = `${input.getDisplayNameForClass(labelClass)} (${classCounts[labelClass] ?? 0})`;
        button.dataset.labelClass = labelClass;
        button.dataset.filterKey = normalizedFilterKey;
        button.dataset.ui = "filter-class";
        button.dataset.testid = normalizedFilterKey === UNLABELED_FILTER_KEY
            ? "filter-class-unlabeled"
            : `filter-class-${labelClass}`;
        input.labelFiltersElement.appendChild(button);
    }
}
export function bindLabelFilterEvents(input) {
    input.labelFiltersElement.querySelectorAll('[data-ui="filter-class"]').forEach((button) => {
        button.addEventListener("click", () => {
            input.onSelectClass(button.dataset.filterKey ?? button.dataset.labelClass ?? "");
        });
    });
    input.labelFiltersElement.querySelectorAll('[data-ui="filter-all"]').forEach((button) => {
        button.addEventListener("click", () => {
            input.onSelectAll();
        });
    });
}
export function renderPreviewList(input) {
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
        }
        else if (endIndex === input.imageFiles.length - 1) {
            startIndex = Math.max(0, input.imageFiles.length - numPreviews);
        }
    }
    const filesToPreview = input.imageFiles.slice(startIndex, endIndex + 1);
    for (const file of filesToPreview) {
        const badge = deriveWorkflowBadge(input.imageWorkflowStatus.get(file.name) ?? getDefaultWorkflowStatus(), input.activeWorkflow, input.reviewTargetWorkflow);
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
