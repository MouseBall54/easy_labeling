// Tauri counterpart of electron/preload.cjs: the same window globals, backed by Rust commands in
// src-tauri/src/main.rs. The desktop app injects the compiled dist/platform/tauri-desktop.js as an
// initialization script (before page scripts) and defines __EASY_LABELING_IS_YOLOE__ around it.
// It must stay a classic script: no imports, everything inside the IIFE.

declare const __EASY_LABELING_IS_YOLOE__: boolean;

interface TauriInternals {
  invoke<T>(command: string, args?: Record<string, unknown> | Uint8Array, options?: { headers?: Record<string, string> }): Promise<T>;
}

interface NativeEntry {
  path: string;
  name: string;
  directory?: boolean;
}

type WritablePayload = string | Blob | ArrayBuffer | ArrayBufferView;

(() => {
  const internals = (): TauriInternals => Reflect.get(window, "__TAURI_INTERNALS__") as TauriInternals;

  function createDomException(name: string, message: string): Error {
    const error = new Error(message);
    error.name = name;
    return error;
  }

  // Rust errors arrive as "<DOMException name>: <message>".
  async function call<T>(command: string, args?: Record<string, unknown> | Uint8Array, options?: { headers?: Record<string, string> }): Promise<T> {
    try {
      return await internals().invoke<T>(command, args, options);
    } catch (error) {
      const text = String((error as Error | undefined)?.message ?? error);
      const match = /^(\w+Error): ([\s\S]*)$/.exec(text);
      throw match ? createDomException(match[1], match[2]) : new Error(text);
    }
  }

  async function toBytes(content: WritablePayload): Promise<Uint8Array> {
    if (typeof content === "string") return new TextEncoder().encode(content);
    if (content instanceof Blob) return new Uint8Array(await content.arrayBuffer());
    if (content instanceof ArrayBuffer) return new Uint8Array(content);
    if (ArrayBuffer.isView(content)) return new Uint8Array(content.buffer, content.byteOffset, content.byteLength);
    throw new TypeError("Unsupported write() payload");
  }

  function inferMimeType(name: string): string {
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

  // Native paths behind the handles this script creates, so Rust can read the same files directly.
  const filePaths = new WeakMap<object, string>();
  const directoryPaths = new WeakMap<object, string>();

  function createFileHandle({ path, name }: NativeEntry) {
    const handle = {
      kind: "file" as const,
      name,
      async getFile(): Promise<File> {
        const [data, lastModified] = await Promise.all([
          call<ArrayBuffer>("fs_read", { path }),
          call<number>("fs_mtime", { path })
        ]);
        return new File([data], name, { type: inferMimeType(name), lastModified });
      },
      async createWritable() {
        const chunks: Uint8Array[] = [];
        return {
          async write(content: WritablePayload): Promise<void> {
            chunks.push(await toBytes(content));
          },
          async close(): Promise<void> {
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
    filePaths.set(handle, path);
    return handle;
  }


  function createDirectoryHandle({ path, name }: NativeEntry): FileSystemDirectoryHandle {
    const handle = {
      kind: "directory" as const,
      name,
      async isSameEntry(other: object): Promise<boolean> {
        const otherPath = directoryPaths.get(other);
        return Boolean(otherPath && await call<boolean>("fs_same_entry", { left: path, right: otherPath }));
      },
      async *values() {
        for (const entry of await call<NativeEntry[]>("fs_read_dir", { path })) {
          yield entry.directory ? createDirectoryHandle(entry) : createFileHandle(entry);
        }
      },
      async getDirectoryHandle(entryName: string, options?: { create?: boolean }) {
        return createDirectoryHandle(await call<NativeEntry>("fs_child", { base: path, name: entryName, directory: true, create: Boolean(options?.create) }));
      },
      async getFileHandle(entryName: string, options?: { create?: boolean }) {
        return createFileHandle(await call<NativeEntry>("fs_child", { base: path, name: entryName, directory: false, create: Boolean(options?.create) }));
      }
    };
    directoryPaths.set(handle, path);
    // Implements the subset of FileSystemDirectoryHandle the app uses (see src/types/files.ts).
    return handle as unknown as FileSystemDirectoryHandle;
  }

  // Large uploads go through WebView2 shared memory (see src-tauri/src/shared_buffer.rs): raw invoke
  // bodies cross WebView2 at ~17 MB/s. Rust posts the buffer; it can arrive before or after open resolves.
  // Ids are unique across both directions (one Rust counter).
  interface SharedBufferEvent { additionalData?: { easyLabelingUpload?: number; easyLabelingDownload?: number }; getBuffer(): ArrayBuffer }
  const webview = (window as unknown as { chrome?: { webview?: { addEventListener(type: string, listener: (event: SharedBufferEvent) => void): void; releaseBuffer?(buffer: ArrayBuffer): void } } }).chrome?.webview;
  const arrived = new Map<number, ArrayBuffer>();
  const waiting = new Map<number, (buffer: ArrayBuffer) => void>();
  webview?.addEventListener("sharedbufferreceived", (event) => {
    const id = event.additionalData?.easyLabelingUpload ?? event.additionalData?.easyLabelingDownload;
    if (typeof id !== "number") return;
    const buffer = event.getBuffer();
    const resolve = waiting.get(id);
    waiting.delete(id);
    if (resolve) resolve(buffer);
    else arrived.set(id, buffer);
  });
  // A buffer that never arrives must not hang its caller: give up so it falls back to a raw transfer.
  const bufferFor = async (id: number): Promise<ArrayBuffer> => {
    const ready = arrived.get(id);
    arrived.delete(id);
    if (ready) return ready;
    return new Promise<ArrayBuffer>((resolve, reject) => {
      const timer = setTimeout(() => {
        waiting.delete(id);
        reject(new Error("Shared buffer did not arrive"));
      }, 10_000);
      waiting.set(id, (buffer) => {
        clearTimeout(timer);
        resolve(buffer);
      });
    });
  };
  /** Copies `bytes` into a new shared buffer and returns its id for a command's `x-shared-buffer` header. */
  async function upload(bytes: Uint8Array): Promise<number> {
    if (!webview) throw new Error("Shared buffers need WebView2");
    const id = await call<number>("shared_buffer_open", { size: bytes.byteLength });
    const buffer = await bufferFor(id);
    new Uint8Array(buffer).set(bytes);
    webview.releaseBuffer?.(buffer);
    return id;
  }
  /** Runs a command that answers with a shared-buffer id and hands its bytes to `use`, then releases them. */
  async function download<T>(command: string, args: Record<string, unknown>, use: (bytes: Uint8Array) => T): Promise<T> {
    if (!webview) throw new Error("Shared buffers need WebView2");
    const buffer = await bufferFor(await call<number>(command, args));
    try {
      return use(new Uint8Array(buffer));
    } finally {
      webview.releaseBuffer?.(buffer);
    }
  }

  const pathOf = (handle: unknown): string | null =>
    handle !== null && typeof handle === "object" ? filePaths.get(handle) ?? directoryPaths.get(handle) ?? null : null;

  window.easyLabelingNative = Object.freeze(webview ? { invoke: call, upload, download, pathOf } : { invoke: call, pathOf });

  window.easyLabelingDesktop = Object.freeze({
    readYoloeModel: __EASY_LABELING_IS_YOLOE__
      ? async (file: string) => new Uint8Array(await call<ArrayBuffer>("read_yoloe_model", { file }))
      : undefined,
    getGpuName: (vendor: string, device: string) => call<string | null>("get_gpu_name", { vendor: String(vendor), device: String(device ?? "") }),
    setHasUnsavedChanges(hasUnsavedChanges: boolean) {
      void call("set_document_dirty", { dirty: Boolean(hasUnsavedChanges) });
    }
  });

  window.showDirectoryPicker = async (options?: DirectoryPickerOptions) => {
    const selected = await call<NativeEntry | null>("pick_directory", { id: options?.id ?? null });
    if (!selected) throw createDomException("AbortError", "The user aborted a request.");
    return createDirectoryHandle(selected);
  };

  window.openEasyLabelingLibraryFile = (kind, startIn) => call<EasyLabelingLibraryFile | null>("open_library_file", { kind, folder: (startIn && directoryPaths.get(startIn)) ?? null });
  window.listEasyLabelingLibraryFiles = (kind) => call<EasyLabelingLibraryFile[]>("list_library_files", { kind });
  window.saveEasyLabelingLibraryFile = (options) => call<{ filePath: string } | null>("save_library_file", { options });
  window.getEasyLabelingProfileDirectory = async (kind) => createDirectoryHandle(await call<NativeEntry>("profile_directory", { kind }));

  window.getEasyLabelingSampleDirectory = async (signal?: AbortSignal) => {
    const samplePromise = call<NativeEntry>("sample_directory");
    if (!signal) return createDirectoryHandle(await samplePromise);
    if (signal.aborted) throw signal.reason ?? createDomException("AbortError", "The operation was stopped.");
    let rejectOnAbort: () => void = () => undefined;
    const abortPromise = new Promise<never>((_resolve, reject) => {
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
