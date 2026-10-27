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
    /** Desktop (Tauri) only: calls a Rust command; raw byte bodies pass headers alongside. */
    easyLabelingNative?: {
      invoke<T>(command: string, args?: Record<string, unknown> | Uint8Array, options?: { headers?: Record<string, string> }): Promise<T>;
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
