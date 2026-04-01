import { describe, expect, it } from "vitest";

import {
  legacyImageLabeledAfterSave,
  legacyImageLabeledByExistence
} from "../../src/legacy/characterization.js";

describe("legacy characterization", () => {

  it("captures current labeled-status mismatch between list existence and save content", () => {
    const byListing = legacyImageLabeledByExistence("sample.jpg", new Set(["sample.txt"]));
    const bySaveFlow = legacyImageLabeledAfterSave("   \n");

    expect(byListing).toBe(true);
    expect(bySaveFlow).toBe(false);
  });
});
