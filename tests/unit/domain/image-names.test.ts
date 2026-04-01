import { describe, expect, it } from "vitest";

import {
  compareNamedFilesByImageName,
  imageFileNameToLabelFileName,
  isImageLabeledByLabelFileExistence,
  isSupportedImageFileName
} from "../../../src/domain/files/image-names.js";

describe("domain/files/image-names", () => {
  it("sorts names with locale numeric compare semantics", () => {
    const names = [
      { name: "image10.JPG" },
      { name: "image2.jpg" },
      { name: "Image1.jpg" },
      { name: "image02.jpg" }
    ];

    names.sort(compareNamedFilesByImageName);

    expect(names.map((item) => item.name)).toEqual([
      "Image1.jpg",
      "image2.jpg",
      "image02.jpg",
      "image10.JPG"
    ]);
  });

  it("maps image names to txt labels by replacing only the final extension", () => {
    expect(imageFileNameToLabelFileName("alpha.jpg")).toBe("alpha.txt");
    expect(imageFileNameToLabelFileName("archive.v1.final.PNG")).toBe("archive.v1.final.txt");
    expect(imageFileNameToLabelFileName("noext")).toBe("noext");
  });

  it("matches the legacy supported-image extension regex behavior", () => {
    expect(isSupportedImageFileName("photo.jpg")).toBe(true);
    expect(isSupportedImageFileName("photo.JPEG")).toBe(true);
    expect(isSupportedImageFileName("photo.tif")).toBe(true);
    expect(isSupportedImageFileName("photo.tiff")).toBe(true);

    expect(isSupportedImageFileName("photo.bmp")).toBe(false);
    expect(isSupportedImageFileName("photo.jpg.backup")).toBe(false);
    expect(isSupportedImageFileName("photojpg")).toBe(false);
  });

  it("marks labeled status by label-file existence", () => {
    const labelNames = new Set(["sample.txt", "other.txt"]);
    expect(isImageLabeledByLabelFileExistence("sample.jpg", labelNames)).toBe(true);
    expect(isImageLabeledByLabelFileExistence("missing.jpg", labelNames)).toBe(false);
  });
});
