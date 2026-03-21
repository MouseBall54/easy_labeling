import { describe, expect, it } from "vitest";

import {
  deriveClassVisibility,
  deriveHiddenLabelClassesForResetScope,
  deriveSelectedClassAfterVisibilityChange,
  deriveVisibilitySummary,
  normalizeFilterClassKey,
  resetHiddenLabelClasses,
  toggleHiddenLabelClass,
  UNLABELED_FILTER_KEY
} from "../../../src/ui/filter-state.js";

describe("ui/filter-state", () => {
  it("normalizes unlabeled classes to a stable key", () => {
    expect(normalizeFilterClassKey(undefined)).toBe(UNLABELED_FILTER_KEY);
    expect(normalizeFilterClassKey(null)).toBe(UNLABELED_FILTER_KEY);
    expect(normalizeFilterClassKey("")).toBe(UNLABELED_FILTER_KEY);
    expect(normalizeFilterClassKey("   ")).toBe(UNLABELED_FILTER_KEY);
    expect(normalizeFilterClassKey(" 7 ")).toBe("7");
  });

  it("toggles hidden classes independently via hidden-set semantics", () => {
    const hideOne = toggleHiddenLabelClass(new Set<string>(), "1");
    expect([...hideOne]).toEqual(["1"]);

    const hideTwo = toggleHiddenLabelClass(hideOne, "2");
    expect([...hideTwo].sort()).toEqual(["1", "2"]);

    const showOneAgain = toggleHiddenLabelClass(hideTwo, "1");
    expect([...showOneAgain]).toEqual(["2"]);
  });

  it("resets hidden classes for All semantics", () => {
    const hidden = new Set<string>(["1", "2", UNLABELED_FILTER_KEY]);

    const reset = resetHiddenLabelClasses();

    expect([...reset]).toEqual([]);
    expect([...hidden].sort()).toEqual(["1", "2", UNLABELED_FILTER_KEY].sort());
  });

  it("derives visible and total summary counts from hidden classes", () => {
    const labelClasses = ["1", "1", "2", "", null, "2"];
    const hidden = new Set<string>(["2", UNLABELED_FILTER_KEY]);

    expect(deriveClassVisibility(labelClasses, hidden)).toEqual({
      visibleClassKeys: ["1"],
      hiddenClassKeys: ["2", UNLABELED_FILTER_KEY]
    });
    expect(deriveVisibilitySummary(labelClasses, hidden)).toEqual({
      visibleCount: 2,
      totalCount: 6
    });
  });

  it("represents selected-hidden clearing policy in pure derivation", () => {
    const hidden = new Set<string>(["2", UNLABELED_FILTER_KEY]);

    expect(
      deriveSelectedClassAfterVisibilityChange({
        selectedClassKey: "2",
        hiddenLabelClasses: hidden,
        clearSelectionWhenFilteredHidden: true
      })
    ).toBeNull();
    expect(
      deriveSelectedClassAfterVisibilityChange({
        selectedClassKey: "2",
        hiddenLabelClasses: hidden,
        clearSelectionWhenFilteredHidden: false
      })
    ).toBe("2");
    expect(
      deriveSelectedClassAfterVisibilityChange({
        selectedClassKey: "1",
        hiddenLabelClasses: hidden,
        clearSelectionWhenFilteredHidden: true
      })
    ).toBe("1");
  });

  it("applies image-navigation persistence and session-replacement reset rules", () => {
    const hidden = new Set<string>(["1", UNLABELED_FILTER_KEY]);

    expect(
      [...deriveHiddenLabelClassesForResetScope({
        scope: "image-navigation",
        hiddenLabelClasses: hidden,
        persistFilterStateAcrossImageNavigation: true,
        resetFilterStateOnSessionReplacement: true
      })].sort()
    ).toEqual(["1", UNLABELED_FILTER_KEY].sort());

    expect(
      [...deriveHiddenLabelClassesForResetScope({
        scope: "image-navigation",
        hiddenLabelClasses: hidden,
        persistFilterStateAcrossImageNavigation: false,
        resetFilterStateOnSessionReplacement: true
      })]
    ).toEqual([]);

    expect(
      [...deriveHiddenLabelClassesForResetScope({
        scope: "session-replacement",
        hiddenLabelClasses: hidden,
        persistFilterStateAcrossImageNavigation: true,
        resetFilterStateOnSessionReplacement: true
      })]
    ).toEqual([]);

    expect(
      [...deriveHiddenLabelClassesForResetScope({
        scope: "session-replacement",
        hiddenLabelClasses: hidden,
        persistFilterStateAcrossImageNavigation: true,
        resetFilterStateOnSessionReplacement: false
      })].sort()
    ).toEqual(["1", UNLABELED_FILTER_KEY].sort());
  });
});
