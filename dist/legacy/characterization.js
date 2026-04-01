import { compareNamedFilesByImageName, imageFileNameToLabelFileName, isImageLabeledByLabelFileExistence, isSupportedImageFileName } from "../domain/files/image-names.js";
import { parseYoloRows, serializeRectsToYolo } from "../domain/yolo/yolo.js";
import { hasCaseInsensitiveNameCollision, normalizeNewClassFileName, parseClassContent, parseClassContentForEditor, validateAndSerializeClassRows } from "../domain/class-files.js";
export function legacyNumericNameCompare(a, b) {
    return compareNamedFilesByImageName(a, b);
}
export function legacyImageNameToLabelName(imageName) {
    return imageFileNameToLabelFileName(imageName);
}
export function legacyIsSupportedImageFileName(fileName) {
    return isSupportedImageFileName(fileName);
}
export function legacyGetLabelsAsYolo(rects, imgWidth, imgHeight) {
    return serializeRectsToYolo(rects, imgWidth, imgHeight);
}
export function legacyParseYoloRows(yoloData, imgWidth, imgHeight) {
    return parseYoloRows(yoloData, imgWidth, imgHeight);
}
export function legacyParseClassContent(content) {
    return parseClassContent(content);
}
export function legacyParseClassContentForEditor(content) {
    return parseClassContentForEditor(content);
}
export function legacyValidateAndSerializeClassRows(rows) {
    return validateAndSerializeClassRows(rows);
}
export function legacyNormalizeNewClassFileName(inputName) {
    return normalizeNewClassFileName(inputName);
}
export function legacyHasCaseInsensitiveNameCollision(existingNames, targetName) {
    return hasCaseInsensitiveNameCollision(existingNames, targetName);
}
export function legacyImageLabeledByExistence(imageName, labelFileNames) {
    return isImageLabeledByLabelFileExistence(imageName, labelFileNames);
}
export function legacyImageLabeledAfterSave(yoloString) {
    return yoloString.trim().length > 0;
}
