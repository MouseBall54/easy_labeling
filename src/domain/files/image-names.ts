export interface NamedFileLike {
  name: string;
}

export function compareNamedFilesByImageName(a: NamedFileLike, b: NamedFileLike): number {
  return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
}

export function imageFileNameToLabelFileName(imageFileName: string): string {
  return imageFileName.replace(/\.[^/.]+$/, ".txt");
}

export function isSupportedImageFileName(fileName: string): boolean {
  return /\.(jpg|jpeg|png|gif|tif|tiff)$/i.test(fileName);
}

export function isImageLabeledByLabelFileExistence(
  imageFileName: string,
  labelFileNames: ReadonlySet<string>
): boolean {
  const labelFileName = imageFileNameToLabelFileName(imageFileName);
  return labelFileNames.has(labelFileName);
}
