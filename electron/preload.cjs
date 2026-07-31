const fs = require("node:fs/promises");
const path = require("node:path");
const { ipcRenderer } = require("electron");

const PICK_DIRECTORY_CHANNEL = "easy-labeling:pick-directory";
const SAMPLE_DIRECTORY_CHANNEL = "easy-labeling:get-sample-directory";
const OPEN_LIBRARY_FILE_CHANNEL = "easy-labeling:open-library-file";
const SAVE_LIBRARY_FILE_CHANNEL = "easy-labeling:save-library-file";
const LIST_LIBRARY_FILES_CHANNEL = "easy-labeling:list-library-files";
const DOCUMENT_DIRTY_CHANNEL = "easy-labeling:set-document-dirty";

window.easyLabelingDesktop = Object.freeze({
  setHasUnsavedChanges(hasUnsavedChanges) {
    ipcRenderer.send(DOCUMENT_DIRTY_CHANNEL, Boolean(hasUnsavedChanges));
  }
});

function createDomException(name, message) {
  const error = new Error(message);
  error.name = name;
  return error;
}

async function toBuffer(content) {
  if (typeof content === "string") {
    return Buffer.from(content);
  }
  if (typeof Blob !== "undefined" && content instanceof Blob) {
    const blobBuffer = await content.arrayBuffer();
    return Buffer.from(blobBuffer);
  }
  if (content instanceof ArrayBuffer) {
    return Buffer.from(new Uint8Array(content));
  }
  if (ArrayBuffer.isView(content)) {
    return Buffer.from(content.buffer, content.byteOffset, content.byteLength);
  }
  throw new TypeError("Unsupported write() payload");
}

function inferMimeType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  switch (extension) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    case ".bmp":
      return "image/bmp";
    case ".webp":
      return "image/webp";
    case ".tif":
    case ".tiff":
      return "image/tiff";
    case ".txt":
      return "text/plain";
    case ".json":
      return "application/json";
    case ".yaml":
    case ".yml":
      return "application/yaml";
    default:
      return "application/octet-stream";
  }
}

function resolveSafeChild(basePath, entryName) {
  const targetPath = path.resolve(basePath, entryName);
  const normalizedBase = `${path.resolve(basePath)}${path.sep}`;
  if (targetPath !== path.resolve(basePath) && !targetPath.startsWith(normalizedBase)) {
    throw createDomException("SecurityError", "Path traversal is not allowed.");
  }
  return targetPath;
}

function createFileHandle(filePath) {
  return {
    kind: "file",
    name: path.basename(filePath),
    async getFile() {
      const [data, stat] = await Promise.all([
        fs.readFile(filePath),
        fs.stat(filePath)
      ]);
      const type = inferMimeType(filePath);

      if (typeof File === "function") {
        return new File([data], path.basename(filePath), {
          type,
          lastModified: stat.mtimeMs
        });
      }

      if (typeof Blob === "function") {
        const blob = new Blob([data], { type });
        Object.defineProperty(blob, "name", { value: path.basename(filePath) });
        Object.defineProperty(blob, "lastModified", { value: stat.mtimeMs });
        return blob;
      }

      return {
        name: path.basename(filePath),
        async text() {
          return data.toString("utf8");
        },
        async arrayBuffer() {
          return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
        }
      };
    },
    async createWritable() {
      const chunks = [];
      return {
        async write(content) {
          chunks.push(await toBuffer(content));
        },
        async close() {
          const output = chunks.length > 0 ? Buffer.concat(chunks) : Buffer.alloc(0);
          await fs.mkdir(path.dirname(filePath), { recursive: true });
          await fs.writeFile(filePath, output);
        }
      };
    }
  };
}

function createDirectoryHandle(directoryPath) {
  return {
    kind: "directory",
    name: path.basename(directoryPath),
    async *values() {
      const entries = await fs.readdir(directoryPath, { withFileTypes: true });
      for (const entry of entries) {
        const targetPath = path.join(directoryPath, entry.name);
        if (entry.isDirectory()) {
          yield createDirectoryHandle(targetPath);
          continue;
        }
        if (entry.isFile()) {
          yield createFileHandle(targetPath);
        }
      }
    },
    async getDirectoryHandle(entryName, options) {
      const targetPath = resolveSafeChild(directoryPath, entryName);
      try {
        const stat = await fs.stat(targetPath);
        if (!stat.isDirectory()) {
          throw createDomException("TypeMismatchError", `Expected directory: ${entryName}`);
        }
        return createDirectoryHandle(targetPath);
      } catch (error) {
        if (error && error.code === "ENOENT") {
          if (!options?.create) {
            throw createDomException("NotFoundError", `Directory not found: ${entryName}`);
          }
          await fs.mkdir(targetPath, { recursive: true });
          return createDirectoryHandle(targetPath);
        }
        throw error;
      }
    },
    async getFileHandle(entryName, options) {
      const targetPath = resolveSafeChild(directoryPath, entryName);
      try {
        const stat = await fs.stat(targetPath);
        if (!stat.isFile()) {
          throw createDomException("TypeMismatchError", `Expected file: ${entryName}`);
        }
        return createFileHandle(targetPath);
      } catch (error) {
        if (error && error.code === "ENOENT") {
          if (!options?.create) {
            throw createDomException("NotFoundError", `File not found: ${entryName}`);
          }
          await fs.mkdir(path.dirname(targetPath), { recursive: true });
          await fs.writeFile(targetPath, Buffer.alloc(0));
          return createFileHandle(targetPath);
        }
        throw error;
      }
    }
  };
}

window.showDirectoryPicker = async function showDirectoryPicker(options) {
  const selectedPath = await ipcRenderer.invoke(PICK_DIRECTORY_CHANNEL, {
    id: options?.id
  });
  if (!selectedPath) {
    throw createDomException("AbortError", "The user aborted a request.");
  }
  return createDirectoryHandle(selectedPath);
};

window.openEasyLabelingLibraryFile = function openEasyLabelingLibraryFile(kind) {
  return ipcRenderer.invoke(OPEN_LIBRARY_FILE_CHANNEL, kind);
};

window.listEasyLabelingLibraryFiles = function listEasyLabelingLibraryFiles(kind) {
  return ipcRenderer.invoke(LIST_LIBRARY_FILES_CHANNEL, kind);
};

window.saveEasyLabelingLibraryFile = function saveEasyLabelingLibraryFile(options) {
  return ipcRenderer.invoke(SAVE_LIBRARY_FILE_CHANNEL, options);
};

window.getEasyLabelingSampleDirectory = async function getEasyLabelingSampleDirectory(signal) {
  const samplePathPromise = ipcRenderer.invoke(SAMPLE_DIRECTORY_CHANNEL);
  if (!signal) {
    return createDirectoryHandle(await samplePathPromise);
  }
  if (signal.aborted) {
    throw signal.reason ?? createDomException("AbortError", "The operation was stopped.");
  }
  let rejectOnAbort;
  const abortPromise = new Promise((_resolve, reject) => {
    rejectOnAbort = () => reject(signal.reason ?? createDomException("AbortError", "The operation was stopped."));
    signal.addEventListener("abort", rejectOnAbort, { once: true });
  });
  try {
    const samplePath = await Promise.race([samplePathPromise, abortPromise]);
    return createDirectoryHandle(samplePath);
  } finally {
    signal.removeEventListener("abort", rejectOnAbort);
  }
};
