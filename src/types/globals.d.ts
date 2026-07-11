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
