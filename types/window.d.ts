interface Window {
    showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
}

interface FileSystemDirectoryHandle {
    values(): AsyncIterable<FileSystemFileHandle | FileSystemDirectoryHandle>;
}
