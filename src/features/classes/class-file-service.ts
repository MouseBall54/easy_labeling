import {
  NEW_CLASS_FILE_SEED_CONTENT,
  hasCaseInsensitiveNameCollision,
  normalizeNewClassFileName,
  parseClassContent,
  parseClassContentForEditor,
  parseClassColors,
  validateAndSerializeClassRows,
  type ClassFileRow,
  type ClassFileSaveResult
} from "../../domain/class-files.js";
import { isFileHandleLike } from "../../platform/file-system-access.js";
import type { DirectoryHandleLike, FileHandleLike } from "../../types/files.js";

// A class file's path inside the class folder ("SEM/classes.yaml"): subfolders group class files, and two files
// with the same name in different folders stay apart. Handles carry no path, so it is kept here per handle.
const classFilePaths = new WeakMap<object, string>();

/** The path of a class file inside its class folder; its name when it was not listed from one. */
export function classFilePath(file: { name: string }): string {
  return classFilePaths.get(file) ?? file.name;
}

/** The .yaml/.yml files of `folder` and its subfolders (any depth; folders starting with "." skipped), by path. */
export async function listClassFiles(folder: DirectoryHandleLike, prefix = ""): Promise<FileHandleLike[]> {
  const found: FileHandleLike[] = [];
  for await (const entry of folder.values()) {
    if (isFileHandleLike(entry)) {
      if (/\.ya?ml$/i.test(entry.name)) {
        classFilePaths.set(entry, prefix + entry.name);
        found.push(entry);
      }
    } else if (entry.kind === "directory" && !entry.name.startsWith(".") && "values" in entry) {
      found.push(...await listClassFiles(entry, `${prefix}${entry.name}/`));
    }
  }
  return found;
}

/** The folder holding a class file (by its path) and its own name. */
export async function locateClassFile(folder: DirectoryHandleLike, path: string): Promise<{ parent: DirectoryHandleLike; name: string }> {
  const parts = path.split("/");
  let parent = folder;
  for (const part of parts.slice(0, -1)) parent = await parent.getDirectoryHandle(part);
  return { parent, name: parts[parts.length - 1]! };
}

export interface ReadClassNamesResult {
  classNames: Map<string, string>;
  classColors: Map<string, string>;
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
  return { classNames: parseClassContent(content), classColors: parseClassColors(content) };
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

/** `pathPrefix` is the folder's path inside the class folder ("SEM/"), when it is a subfolder. */
export async function createNewClassFile(
  folderHandle: DirectoryHandleLike,
  inputName: string,
  pathPrefix = "",
  content = NEW_CLASS_FILE_SEED_CONTENT
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
  await writable.write(content);
  await writable.close();
  if (pathPrefix) classFilePaths.set(fileHandle, pathPrefix + fileName);

  return {
    created: true,
    fileName,
    fileHandle
  };
}
