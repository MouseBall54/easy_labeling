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
    openEasyLabelingLibraryFile?: (kind: EasyLabelingLibraryFileKind) => Promise<EasyLabelingLibraryFile | null>;
    listEasyLabelingLibraryFiles?: (kind: EasyLabelingLibraryFileKind) => Promise<EasyLabelingLibraryFile[]>;
    saveEasyLabelingLibraryFile?: (options: EasyLabelingLibraryFileSaveOptions) => Promise<{ filePath: string } | null>;
    easyLabelingDesktop?: {
      setHasUnsavedChanges(hasUnsavedChanges: boolean): void;
    };
  }

  type EasyLabelingLibraryFileKind = "preset" | "layout";

  interface EasyLabelingLibraryFile {
    filePath: string;
    name: string;
    contents: string;
  }

  interface EasyLabelingLibraryFileSaveOptions {
    kind: EasyLabelingLibraryFileKind;
    suggestedName: string;
    contents: string;
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
