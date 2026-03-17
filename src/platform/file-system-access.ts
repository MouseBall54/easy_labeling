import type {
  DirectoryEntryLike,
  DirectoryHandleLike,
  FileHandleLike,
  FileTextLike,
  WritableFileLike
} from "../types/files.js";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasName(value: unknown): value is { name: string } {
  return isObject(value) && typeof value.name === "string";
}

function hasGetFile(value: unknown): value is { getFile(): Promise<FileTextLike> } {
  return isObject(value) && typeof value.getFile === "function";
}

function hasCreateWritable(value: unknown): value is { createWritable(): Promise<WritableFileLike> } {
  return isObject(value) && typeof value.createWritable === "function";
}

export function isNotFoundError(error: unknown): boolean {
  return hasName(error) && error.name === "NotFoundError";
}

export function isFileHandleLike(entry: DirectoryEntryLike | FileHandleLike | DirectoryHandleLike): entry is FileHandleLike {
  return entry.kind === "file" && hasGetFile(entry) && hasCreateWritable(entry);
}

export async function getSubdirectoryHandle(
  directoryHandle: DirectoryHandleLike,
  name: string,
  options?: { create?: boolean }
): Promise<DirectoryHandleLike> {
  return directoryHandle.getDirectoryHandle(name, options);
}

export async function listFileHandles(directoryHandle: DirectoryHandleLike): Promise<FileHandleLike[]> {
  const fileHandles: FileHandleLike[] = [];
  for await (const entry of directoryHandle.values()) {
    if (isFileHandleLike(entry)) {
      fileHandles.push(entry);
    }
  }
  return fileHandles;
}

export async function readFileText(fileHandle: FileHandleLike): Promise<string> {
  const file = await fileHandle.getFile();
  return file.text();
}

export async function readFileArrayBuffer(fileHandle: FileHandleLike): Promise<ArrayBuffer> {
  const file = await fileHandle.getFile();
  if (typeof file.arrayBuffer !== "function") {
    throw new TypeError(`arrayBuffer() is unavailable for file: ${file.name}`);
  }
  return file.arrayBuffer();
}

export async function readTextFileByName(directoryHandle: DirectoryHandleLike, fileName: string): Promise<string> {
  const fileHandle = await directoryHandle.getFileHandle(fileName);
  return readFileText(fileHandle);
}

export async function writeTextFileByName(
  directoryHandle: DirectoryHandleLike,
  fileName: string,
  content: string
): Promise<void> {
  const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
}
