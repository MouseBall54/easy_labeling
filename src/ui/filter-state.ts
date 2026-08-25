export const UNLABELED_FILTER_KEY = "__unlabeled__";

export type FilterResetScope = "image-navigation" | "session-replacement";

export interface VisibilitySummary {
  visibleCount: number;
  totalCount: number;
}

export interface ClassVisibilityDerivation {
  visibleClassKeys: string[];
  hiddenClassKeys: string[];
}

export function normalizeFilterClassKey(labelClass: string | null | undefined): string {
  const trimmed = labelClass?.trim() ?? "";
  return trimmed === "" ? UNLABELED_FILTER_KEY : trimmed;
}

export function toggleHiddenLabelClass(
  hiddenLabelClasses: ReadonlySet<string>,
  labelClass: string | null | undefined
): Set<string> {
  const next = new Set(hiddenLabelClasses);
  const filterKey = normalizeFilterClassKey(labelClass);
  if (next.has(filterKey)) {
    next.delete(filterKey);
  } else {
    next.add(filterKey);
  }
  return next;
}

export function resetHiddenLabelClasses(): Set<string> {
  return new Set<string>();
}

export function toggleAllLabelClasses(
  classKeys: Iterable<string | null | undefined>,
  hiddenLabelClasses: ReadonlySet<string>
): Set<string> {
  const currentKeys = new Set([...classKeys].map(normalizeFilterClassKey));
  const shouldHideAll = [...currentKeys].every((key) => !hiddenLabelClasses.has(key));
  const next = new Set(hiddenLabelClasses);

  currentKeys.forEach((key) => {
    if (shouldHideAll) {
      next.add(key);
    } else {
      next.delete(key);
    }
  });
  return next;
}

export function deriveClassVisibility(
  classKeys: Iterable<string | null | undefined>,
  hiddenLabelClasses: ReadonlySet<string>
): ClassVisibilityDerivation {
  const uniqueKeys = new Set<string>();
  for (const classKey of classKeys) {
    uniqueKeys.add(normalizeFilterClassKey(classKey));
  }

  const visibleClassKeys: string[] = [];
  const hiddenClassKeys: string[] = [];
  for (const key of uniqueKeys) {
    if (hiddenLabelClasses.has(key)) {
      hiddenClassKeys.push(key);
    } else {
      visibleClassKeys.push(key);
    }
  }

  return {
    visibleClassKeys,
    hiddenClassKeys
  };
}

export function deriveVisibilitySummary(
  labelClasses: Iterable<string | null | undefined>,
  hiddenLabelClasses: ReadonlySet<string>
): VisibilitySummary {
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

export function deriveSelectedClassAfterVisibilityChange(input: {
  selectedClassKey: string | null;
  hiddenLabelClasses: ReadonlySet<string>;
  clearSelectionWhenFilteredHidden: boolean;
}): string | null {
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

export function deriveHiddenLabelClassesForResetScope(input: {
  scope: FilterResetScope;
  hiddenLabelClasses: ReadonlySet<string>;
  persistFilterStateAcrossImageNavigation: boolean;
  resetFilterStateOnSessionReplacement: boolean;
}): Set<string> {
  if (input.scope === "image-navigation") {
    return input.persistFilterStateAcrossImageNavigation
      ? new Set(input.hiddenLabelClasses)
      : new Set<string>();
  }

  return input.resetFilterStateOnSessionReplacement
    ? new Set<string>()
    : new Set(input.hiddenLabelClasses);
}
