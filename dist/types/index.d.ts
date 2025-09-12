/**
 * Easy Labeling TypeScript Type Definitions
 *
 * This file serves as the main entry point for all type definitions used
 * throughout the Easy Labeling application.
 */
export * from './app-state';
export * from './canvas';
export * from './file-system';
export * from './ui';
export type Mode = 'edit' | 'draw';
export type LabelSortOrder = 'asc' | 'desc';
export type FileType = 'image' | 'label' | 'class';
export interface Point {
    x: number;
    y: number;
}
export interface Size {
    width: number;
    height: number;
}
export interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type EventHandler<T = Event> = (event: T) => void;
export type VoidCallback = () => void;
export type AsyncCallback = () => Promise<void>;
export interface FileSystemDirectoryHandle {
    kind: 'directory';
    name: string;
    entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
    getDirectoryHandle(name: string, options?: FileSystemGetDirectoryOptions): Promise<FileSystemDirectoryHandle>;
    getFileHandle(name: string, options?: FileSystemGetFileOptions): Promise<FileSystemFileHandle>;
    queryPermission(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;
    requestPermission(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;
    removeEntry(name: string, options?: FileSystemRemoveOptions): Promise<void>;
    resolve(possibleDescendant: FileSystemHandle): Promise<string[] | null>;
}
export interface FileSystemFileHandle {
    kind: 'file';
    name: string;
    getFile(): Promise<File>;
    createWritable(options?: FileSystemCreateWritableOptions): Promise<FileSystemWritableFileStream>;
    queryPermission(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;
    requestPermission(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;
}
export interface FileSystemHandle {
    kind: 'file' | 'directory';
    name: string;
}
export interface FileSystemGetFileOptions {
    create?: boolean;
}
export interface FileSystemGetDirectoryOptions {
    create?: boolean;
}
export interface FileSystemCreateWritableOptions {
    keepExistingData?: boolean;
}
export interface FileSystemRemoveOptions {
    recursive?: boolean;
}
export interface FileSystemHandlePermissionDescriptor {
    mode?: 'read' | 'readwrite';
}
export interface FileSystemWritableFileStream extends WritableStream {
    write(data: FileSystemWriteChunkType): Promise<void>;
    seek(position: number): Promise<void>;
    truncate(size: number): Promise<void>;
}
export type FileSystemWriteChunkType = BufferSource | Blob | string | WriteParams;
export interface WriteParams {
    type: 'write' | 'seek' | 'truncate';
    data?: BufferSource | Blob | string;
    position?: number;
    size?: number;
}
export interface AppError extends Error {
    code: string;
    details?: Record<string, any>;
}
export interface OperationResult<T = void> {
    success: boolean;
    data?: T;
    error?: string;
    timestamp: Date;
}
export interface AppConfig {
    version: string;
    buildDate: string;
    environment: 'development' | 'production';
    features: {
        autoSave: boolean;
        debugMode: boolean;
        performance: boolean;
    };
}
//# sourceMappingURL=index.d.ts.map