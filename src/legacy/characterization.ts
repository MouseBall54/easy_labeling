import {
  compareNamedFilesByImageName,
  imageFileNameToLabelFileName,
  isImageLabeledByLabelFileExistence,
  isSupportedImageFileName
} from "../domain/files/image-names.js";
import {
  parseYoloRows,
  serializeRectsToYolo,
  type ParsedYoloRow,
  type YoloRectLike
} from "../domain/yolo/yolo.js";
import {
  hasCaseInsensitiveNameCollision,
  normalizeNewClassFileName,
  parseClassContent,
  parseClassContentForEditor,
  validateAndSerializeClassRows,
  type ClassFileRow,
  type ClassFileSaveResult
} from "../domain/class-files.js";

export interface LegacyRectLike extends YoloRectLike {
  labelClass?: string;
  setCoords(): void;
  getCenterPoint(): { x: number; y: number };
  getScaledWidth(): number;
  getScaledHeight(): number;
}

export type LegacyClassEditorRow = ClassFileRow;

export type LegacyClassSaveResult = ClassFileSaveResult;

export type LegacyParsedYoloRow = ParsedYoloRow;

export function legacyNumericNameCompare(a: { name: string }, b: { name: string }): number {
  return compareNamedFilesByImageName(a, b);
}

export function legacyImageNameToLabelName(imageName: string): string {
  return imageFileNameToLabelFileName(imageName);
}

export function legacyIsSupportedImageFileName(fileName: string): boolean {
  return isSupportedImageFileName(fileName);
}

export function legacyGetLabelsAsYolo(rects: LegacyRectLike[], imgWidth: number, imgHeight: number): string {
  return serializeRectsToYolo(rects, imgWidth, imgHeight);
}

export function legacyParseYoloRows(yoloData: string, imgWidth: number, imgHeight: number): LegacyParsedYoloRow[] {
  return parseYoloRows(yoloData, imgWidth, imgHeight);
}

export function legacyParseClassContent(content: string): Map<string, string> {
  return parseClassContent(content);
}

export function legacyParseClassContentForEditor(content: string): LegacyClassEditorRow[] {
  return parseClassContentForEditor(content);
}

export function legacyValidateAndSerializeClassRows(rows: LegacyClassEditorRow[]): LegacyClassSaveResult {
  return validateAndSerializeClassRows(rows);
}

export function legacyNormalizeNewClassFileName(inputName: string): string {
  return normalizeNewClassFileName(inputName);
}

export function legacyHasCaseInsensitiveNameCollision(
  existingNames: string[],
  targetName: string
): boolean {
  return hasCaseInsensitiveNameCollision(existingNames, targetName);
}

export function legacyImageLabeledByExistence(imageName: string, labelFileNames: Set<string>): boolean {
  return isImageLabeledByLabelFileExistence(imageName, labelFileNames);
}

export function legacyImageLabeledAfterSave(yoloString: string): boolean {
  return yoloString.trim().length > 0;
}
