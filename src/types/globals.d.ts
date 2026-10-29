declare global {
  const fabric: unknown;
  const Tiff: unknown;
  const bootstrap: {
    Modal: new (element: Element, options?: Record<string, unknown>) => {
      hide(): void;
      show(): void;
      dispose?(): void;
    };
  };

  interface Window {
    fabric: typeof fabric;
    Tiff: typeof Tiff;
    bootstrap: typeof bootstrap;
    showDirectoryPicker?: (options?: DirectoryPickerOptions) => Promise<FileSystemDirectoryHandle>;
    getEasyLabelingSampleDirectory?: () => Promise<FileSystemDirectoryHandle>;
    /** Desktop only: the dialog starts in `startIn/.easy-labeling` (or `startIn`), else the profile folder. */
    openEasyLabelingLibraryFile?: (kind: EasyLabelingLibraryFileKind, startIn?: FileSystemDirectoryHandle | null) => Promise<EasyLabelingLibraryFile | null>;
    listEasyLabelingLibraryFiles?: (kind: EasyLabelingLibraryFileKind) => Promise<EasyLabelingLibraryFile[]>;
    getEasyLabelingProfileDirectory?: (kind: EasyLabelingProfileDirectoryKind) => Promise<FileSystemDirectoryHandle>;
    saveEasyLabelingLibraryFile?: (options: EasyLabelingLibraryFileSaveOptions) => Promise<{ filePath: string } | null>;
    easyLabelingDesktop?: {
      readYoloeModel?: (file: string) => Promise<Uint8Array>;
      getGpuName?: (vendor: string, device: string) => Promise<string | null>;
      setHasUnsavedChanges(hasUnsavedChanges: boolean): void;
    };
    /** Features to keep on their TS path even in the desktop app (see src/platform/native-bridge.ts). */
    easyLabelingNativeOff?: string[];
    /** Desktop (Tauri) only: calls a Rust command; raw byte bodies pass headers alongside. */
    easyLabelingNative?: {
      invoke<T>(command: string, args?: Record<string, unknown> | Uint8Array, options?: { headers?: Record<string, string> }): Promise<T>;
      /** Copies bytes into WebView2 shared memory; pass the id as a command's `x-shared-buffer` header. */
      upload?(bytes: Uint8Array): Promise<number>;
      /** Runs a command answering with a shared-buffer id; `use` reads the bytes before they are released. */
      download?<T>(command: string, args: Record<string, unknown>, use: (bytes: Uint8Array) => T): Promise<T>;
      /** The native path of a file or directory handle from the desktop file system, else null. */
      pathOf?(handle: unknown): string | null;
    };
  }

  type EasyLabelingLibraryFileKind = "preset" | "layout" | "yoloe" | "refine";
  type EasyLabelingProfileDirectoryKind = EasyLabelingLibraryFileKind | "class-info";

  interface EasyLabelingLibraryFile {
    filePath: string;
    name: string;
    contents: string;
  }

  interface EasyLabelingLibraryFileSaveOptions {
    kind: EasyLabelingLibraryFileKind;
    suggestedName: string;
    contents: string;
    saveAs?: boolean;
    filePath?: string;
  }

  interface DirectoryPickerOptions {
    id?: string;
    mode?: "read" | "readwrite";
    startIn?: FileSystemHandle | WellKnownDirectory;
  }

  type WellKnownDirectory =
    | "desktop"
    | "documents"
    | "downloads"
    | "music"
    | "pictures"
    | "videos";
}

export {};
