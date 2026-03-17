export function compareNamedFilesByImageName(a, b) {
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
}
export function imageFileNameToLabelFileName(imageFileName) {
    return imageFileName.replace(/\.[^/.]+$/, ".txt");
}
export function isSupportedImageFileName(fileName) {
    return /\.(jpg|jpeg|png|gif|tif|tiff)$/i.test(fileName);
}
export function isImageLabeledByLabelFileExistence(imageFileName, labelFileNames) {
    const labelFileName = imageFileNameToLabelFileName(imageFileName);
    return labelFileNames.has(labelFileName);
}
