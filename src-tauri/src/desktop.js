// Tauri counterpart of electron/preload.cjs: the same window globals, backed by Rust commands.
// Injected before page scripts; __IS_YOLOE__ is replaced by the Rust side.
(() => {
  const invoke = (command, args, options) => window.__TAURI_INTERNALS__.invoke(command, args, options);

  function createDomException(name, message) {
    const error = new Error(message);
    error.name = name;
    return error;
  }

  // Rust errors arrive as "<DOMException name>: <message>".
  async function call(command, args, options) {
    try {
      return await invoke(command, args, options);
    } catch (error) {
      const text = String(error?.message ?? error);
      const match = /^(\w+Error): ([\s\S]*)$/.exec(text);
      throw match ? createDomException(match[1], match[2]) : new Error(text);
    }
  }

  async function toBytes(content) {
    if (typeof content === "string") return new TextEncoder().encode(content);
    if (typeof Blob !== "undefined" && content instanceof Blob) return new Uint8Array(await content.arrayBuffer());
    if (content instanceof ArrayBuffer) return new Uint8Array(content);
    if (ArrayBuffer.isView(content)) return new Uint8Array(content.buffer, content.byteOffset, content.byteLength);
    throw new TypeError("Unsupported write() payload");
  }

  function inferMimeType(name) {
    switch (name.slice(name.lastIndexOf(".")).toLowerCase()) {
      case ".jpg": case ".jpeg": return "image/jpeg";
      case ".png": return "image/png";
      case ".gif": return "image/gif";
      case ".bmp": return "image/bmp";
      case ".webp": return "image/webp";
      case ".tif": case ".tiff": return "image/tiff";
      case ".txt": return "text/plain";
      case ".json": return "application/json";
      case ".yaml": case ".yml": return "application/yaml";
      default: return "application/octet-stream";
    }
  }

  function createFileHandle({ path, name }) {
    return {
      kind: "file",
      name,
      async getFile() {
        const [data, lastModified] = await Promise.all([
          call("fs_read", { path }),
          call("fs_mtime", { path })
        ]);
        return new File([data], name, { type: inferMimeType(name), lastModified });
      },
      async createWritable() {
        const chunks = [];
        return {
          async write(content) {
            chunks.push(await toBytes(content));
          },
          async close() {
            const output = new Uint8Array(chunks.reduce((total, chunk) => total + chunk.byteLength, 0));
            let offset = 0;
            for (const chunk of chunks) {
              output.set(chunk, offset);
              offset += chunk.byteLength;
            }
            await call("fs_write", output, { headers: { "x-path": encodeURIComponent(path) } });
          }
        };
      }
    };
  }

  const directoryPaths = new WeakMap();

  function createDirectoryHandle({ path, name }) {
    const handle = {
      kind: "directory",
      name,
      async isSameEntry(other) {
        const otherPath = directoryPaths.get(other);
        return Boolean(otherPath && await call("fs_same_entry", { left: path, right: otherPath }));
      },
      async *values() {
        for (const entry of await call("fs_read_dir", { path })) {
          yield entry.directory ? createDirectoryHandle(entry) : createFileHandle(entry);
        }
      },
      async getDirectoryHandle(entryName, options) {
        return createDirectoryHandle(await call("fs_child", { base: path, name: entryName, directory: true, create: Boolean(options?.create) }));
      },
      async getFileHandle(entryName, options) {
        return createFileHandle(await call("fs_child", { base: path, name: entryName, directory: false, create: Boolean(options?.create) }));
      }
    };
    directoryPaths.set(handle, path);
    return handle;
  }

  const isYoloe = __IS_YOLOE__;
  window.easyLabelingDesktop = Object.freeze({
    readYoloeModel: isYoloe ? async (file) => new Uint8Array(await call("read_yoloe_model", { file })) : undefined,
    getGpuName: (vendor, device) => call("get_gpu_name", { vendor: String(vendor), device: String(device ?? "") }),
    setHasUnsavedChanges(hasUnsavedChanges) {
      void call("set_document_dirty", { dirty: Boolean(hasUnsavedChanges) });
    }
  });

  window.showDirectoryPicker = async function showDirectoryPicker(options) {
    const selected = await call("pick_directory", { id: options?.id ?? null });
    if (!selected) throw createDomException("AbortError", "The user aborted a request.");
    return createDirectoryHandle(selected);
  };

  window.openEasyLabelingLibraryFile = (kind) => call("open_library_file", { kind });
  window.listEasyLabelingLibraryFiles = (kind) => call("list_library_files", { kind });
  window.saveEasyLabelingLibraryFile = (options) => call("save_library_file", { options });
  window.getEasyLabelingProfileDirectory = async (kind) => createDirectoryHandle(await call("profile_directory", { kind }));

  window.getEasyLabelingSampleDirectory = async function getEasyLabelingSampleDirectory(signal) {
    const samplePromise = call("sample_directory");
    if (!signal) return createDirectoryHandle(await samplePromise);
    if (signal.aborted) throw signal.reason ?? createDomException("AbortError", "The operation was stopped.");
    let rejectOnAbort;
    const abortPromise = new Promise((_resolve, reject) => {
      rejectOnAbort = () => reject(signal.reason ?? createDomException("AbortError", "The operation was stopped."));
      signal.addEventListener("abort", rejectOnAbort, { once: true });
    });
    try {
      return createDirectoryHandle(await Promise.race([samplePromise, abortPromise]));
    } finally {
      signal.removeEventListener("abort", rejectOnAbort);
    }
  };

  // Electron shows no page context menu; keep WebView2's only where text editing needs it.
  window.addEventListener("contextmenu", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement && (target.isContentEditable || target.closest("input, textarea")))) {
      event.preventDefault();
    }
  });
})();
