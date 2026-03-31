export function compareNamedFilesByImageName(a, b) {
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
}
export function imageFileNameToBaseName(imageFileName) {
    return imageFileName.replace(/\.[^/.]+$/, "");
}
export function imageFileNameToLabelFileName(imageFileName) {
    if (!imageFileName.includes(".")) {
        return imageFileName;
    }
    return `${imageFileNameToBaseName(imageFileName)}.txt`;
}
export function isSupportedImageFileName(fileName) {
    return /\.(jpg|jpeg|png|gif|tif|tiff)$/i.test(fileName);
}
export function isImageLabeledByLabelFileExistence(imageFileName, labelFileNames) {
    const labelFileName = imageFileNameToLabelFileName(imageFileName);
    return labelFileNames.has(labelFileName);
}
