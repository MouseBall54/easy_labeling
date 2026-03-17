export type DirectoryHandle = FileSystemDirectoryHandle;

export type FileHandle = FileSystemFileHandle;

export interface NamedFileEntry {
  name: string;
}

export interface FileTextLike {
  readonly name: string;
  text(): Promise<string>;
  arrayBuffer?(): Promise<ArrayBuffer>;
}

export interface WritableFileLike {
  write(data: string): Promise<void>;
  close(): Promise<void>;
}

export interface FileHandleLike {
  readonly kind: "file";
  readonly name: string;
  getFile(): Promise<FileTextLike>;
  createWritable(): Promise<WritableFileLike>;
}

export interface DirectoryEntryLike {
  readonly kind: "file" | "directory";
  readonly name: string;
}

export interface DirectoryHandleLike {
  readonly kind: "directory";
  readonly name: string;
  values(): AsyncIterable<DirectoryEntryLike | FileHandleLike | DirectoryHandleLike>;
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<DirectoryHandleLike>;
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileHandleLike>;
}
