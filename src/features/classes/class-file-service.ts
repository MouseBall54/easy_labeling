import {
  NEW_CLASS_FILE_SEED_CONTENT,
  hasCaseInsensitiveNameCollision,
  normalizeNewClassFileName,
  parseClassContent,
  parseClassContentForEditor,
  validateAndSerializeClassRows,
  type ClassFileRow,
  type ClassFileSaveResult
} from "../../domain/class-files.js";
import type { DirectoryHandleLike, FileHandleLike } from "../../types/files.js";

export interface ReadClassNamesResult {
  classNames: Map<string, string>;
}

export interface SaveClassRowsResult {
  saved: boolean;
  validation: ClassFileSaveResult;
}

export interface CreateClassFileResult {
  created: boolean;
  fileName: string;
  fileHandle: FileHandleLike | null;
}

export async function readClassNamesFromFileHandle(fileHandle: FileHandleLike): Promise<ReadClassNamesResult> {
  const file = await fileHandle.getFile();
  const content = await file.text();
  return { classNames: parseClassContent(content) };
}

export async function readClassFileRowsForEditor(fileHandle: FileHandleLike): Promise<ClassFileRow[]> {
  const file = await fileHandle.getFile();
  const content = await file.text();
  return parseClassContentForEditor(content);
}

export async function validateAndSaveClassRowsToFileHandle(
  fileHandle: FileHandleLike,
  rows: ClassFileRow[]
): Promise<SaveClassRowsResult> {
  const validation = validateAndSerializeClassRows(rows);
  if (!validation.isValid) {
    return { saved: false, validation };
  }

  const writable = await fileHandle.createWritable();
  await writable.write(validation.newContent);
  await writable.close();

  return { saved: true, validation };
}

export async function createNewClassFile(
  folderHandle: DirectoryHandleLike,
  inputName: string
): Promise<CreateClassFileResult> {
  const fileName = normalizeNewClassFileName(inputName);
  const existingNames: string[] = [];

  for await (const entry of folderHandle.values()) {
    existingNames.push(entry.name);
  }

  if (hasCaseInsensitiveNameCollision(existingNames, fileName)) {
    return {
      created: false,
      fileName,
      fileHandle: null
    };
  }

  const fileHandle = await folderHandle.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(NEW_CLASS_FILE_SEED_CONTENT);
  await writable.close();

  return {
    created: true,
    fileName,
    fileHandle
  };
}
