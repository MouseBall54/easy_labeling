export const UNLABELED_FILTER_KEY = "__unlabeled__";
export function normalizeFilterClassKey(labelClass) {
    const trimmed = labelClass?.trim() ?? "";
    return trimmed === "" ? UNLABELED_FILTER_KEY : trimmed;
}
export function toggleHiddenLabelClass(hiddenLabelClasses, labelClass) {
    const next = new Set(hiddenLabelClasses);
    const filterKey = normalizeFilterClassKey(labelClass);
    if (next.has(filterKey)) {
        next.delete(filterKey);
    }
    else {
        next.add(filterKey);
    }
    return next;
}
export function resetHiddenLabelClasses() {
    return new Set();
}
export function deriveClassVisibility(classKeys, hiddenLabelClasses) {
    const uniqueKeys = new Set();
    for (const classKey of classKeys) {
        uniqueKeys.add(normalizeFilterClassKey(classKey));
    }
    const visibleClassKeys = [];
    const hiddenClassKeys = [];
    for (const key of uniqueKeys) {
        if (hiddenLabelClasses.has(key)) {
            hiddenClassKeys.push(key);
        }
        else {
            visibleClassKeys.push(key);
        }
    }
    return {
        visibleClassKeys,
        hiddenClassKeys
    };
}
export function deriveVisibilitySummary(labelClasses, hiddenLabelClasses) {
    let totalCount = 0;
    let visibleCount = 0;
    for (const labelClass of labelClasses) {
        totalCount += 1;
        const key = normalizeFilterClassKey(labelClass);
        if (!hiddenLabelClasses.has(key)) {
            visibleCount += 1;
        }
    }
    return {
        visibleCount,
        totalCount
    };
}
export function deriveSelectedClassAfterVisibilityChange(input) {
    if (!input.selectedClassKey) {
        return null;
    }
    if (!input.clearSelectionWhenFilteredHidden) {
        return input.selectedClassKey;
    }
    const normalizedSelection = normalizeFilterClassKey(input.selectedClassKey);
    if (input.hiddenLabelClasses.has(normalizedSelection)) {
        return null;
    }
    return input.selectedClassKey;
}
export function deriveHiddenLabelClassesForResetScope(input) {
    if (input.scope === "image-navigation") {
        return input.persistFilterStateAcrossImageNavigation
            ? new Set(input.hiddenLabelClasses)
            : new Set();
    }
    return input.resetFilterStateOnSessionReplacement
        ? new Set()
        : new Set(input.hiddenLabelClasses);
}
