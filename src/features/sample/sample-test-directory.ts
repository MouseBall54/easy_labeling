import type {
  DirectoryEntryLike,
  DirectoryHandleLike,
  FileHandleLike,
  FileTextLike,
  WritableFileContent,
  WritableFileLike
} from "../../types/files.js";

interface SampleManifest {
  name: string;
  files: string[];
}

function createDomException(name: string, message: string): Error {
  if (typeof DOMException === "function") {
    return new DOMException(message, name);
  }
  const error = new Error(message);
  error.name = name;
  return error;
}

function normalizeRelativePath(path: string): string[] {
  const segments = path.replaceAll("\\", "/").split("/").filter(Boolean);
  if (segments.length === 0 || segments.some((segment) => segment === "." || segment === "..")) {
    throw new Error(`Invalid bundled sample path: ${path}`);
  }
  return segments;
}

function inferMimeType(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "json":
      return "application/json";
    case "yaml":
    case "yml":
      return "application/yaml";
    case "txt":
      return "text/plain";
    default:
      return "application/octet-stream";
  }
}

function toBytes(content: WritableFileContent): Uint8Array {
  if (typeof content === "string") {
    return new TextEncoder().encode(content);
  }
  return new Uint8Array(content.slice(0));
}

function concatBytes(chunks: readonly Uint8Array[]): Uint8Array {
  const output = new Uint8Array(chunks.reduce((total, chunk) => total + chunk.byteLength, 0));
  let offset = 0;
  chunks.forEach((chunk) => {
    output.set(chunk, offset);
    offset += chunk.byteLength;
  });
  return output;
}

class MemoryFileHandle implements FileHandleLike {
  readonly kind = "file" as const;
  private bytes: Uint8Array;

  constructor(readonly name: string, bytes: Uint8Array) {
    this.bytes = new Uint8Array(bytes);
  }

  async getFile(): Promise<FileTextLike> {
    const bytes = new Uint8Array(this.bytes);
    if (typeof File === "function") {
      return new File([bytes.buffer], this.name, { type: inferMimeType(this.name) });
    }
    return {
      name: this.name,
      text: async () => new TextDecoder().decode(bytes),
      arrayBuffer: async () => bytes.buffer.slice(0)
    };
  }

  async createWritable(): Promise<WritableFileLike> {
    const chunks: Uint8Array[] = [];
    return {
      write: async (content) => {
        chunks.push(toBytes(content));
      },
      close: async () => {
        this.bytes = concatBytes(chunks);
      }
    };
  }
}

class MemoryDirectoryHandle implements DirectoryHandleLike {
  readonly kind = "directory" as const;
  private readonly entries = new Map<string, MemoryFileHandle | MemoryDirectoryHandle>();

  constructor(readonly name: string) {}

  async *values(): AsyncIterable<DirectoryEntryLike | FileHandleLike | DirectoryHandleLike> {
    for (const entry of this.entries.values()) {
      yield entry;
    }
  }

  async getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<MemoryDirectoryHandle> {
    const existing = this.entries.get(name);
    if (existing instanceof MemoryDirectoryHandle) {
      return existing;
    }
    if (existing) {
      throw createDomException("TypeMismatchError", `Expected directory: ${name}`);
    }
    if (!options?.create) {
      throw createDomException("NotFoundError", `Directory not found: ${name}`);
    }
    const created = new MemoryDirectoryHandle(name);
    this.entries.set(name, created);
    return created;
  }

  async getFileHandle(name: string, options?: { create?: boolean }): Promise<MemoryFileHandle> {
    const existing = this.entries.get(name);
    if (existing instanceof MemoryFileHandle) {
      return existing;
    }
    if (existing) {
      throw createDomException("TypeMismatchError", `Expected file: ${name}`);
    }
    if (!options?.create) {
      throw createDomException("NotFoundError", `File not found: ${name}`);
    }
    const created = new MemoryFileHandle(name, new Uint8Array());
    this.entries.set(name, created);
    return created;
  }

  setEntry(name: string, entry: MemoryFileHandle | MemoryDirectoryHandle): void {
    this.entries.set(name, entry);
  }
}

async function addFile(root: MemoryDirectoryHandle, relativePath: string, bytes: Uint8Array): Promise<void> {
  const segments = normalizeRelativePath(relativePath);
  const fileName = segments.pop();
  if (!fileName) {
    throw new Error(`Bundled sample file name is missing: ${relativePath}`);
  }
  let directory = root;
  for (const segment of segments) {
    directory = await directory.getDirectoryHandle(segment, { create: true });
  }
  directory.setEntry(fileName, new MemoryFileHandle(fileName, bytes));
}

export async function createBundledSampleDirectory(input?: {
  baseUrl?: URL;
  fetchRef?: typeof fetch;
}): Promise<DirectoryHandleLike> {
  const fetchRef = input?.fetchRef ?? globalThis.fetch;
  if (typeof fetchRef !== "function") {
    throw new Error("Bundled sample loader requires fetch support");
  }
  const baseUrl = input?.baseUrl ?? new URL("assets/sample/", document.baseURI);
  const manifestResponse = await fetchRef(new URL("manifest.json", baseUrl));
  if (!manifestResponse.ok) {
    throw new Error(`Unable to load bundled sample manifest (${manifestResponse.status})`);
  }
  const manifest = await manifestResponse.json() as SampleManifest;
  if (!manifest.name?.trim() || !Array.isArray(manifest.files) || manifest.files.length === 0) {
    throw new Error("Bundled sample manifest is invalid");
  }

  const root = new MemoryDirectoryHandle(manifest.name.trim());
  for (const relativePath of manifest.files) {
    const response = await fetchRef(new URL(relativePath, baseUrl));
    if (!response.ok) {
      throw new Error(`Unable to load bundled sample file: ${relativePath} (${response.status})`);
    }
    await addFile(root, relativePath, new Uint8Array(await response.arrayBuffer()));
  }
  return root;
}
