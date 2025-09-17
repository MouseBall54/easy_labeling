/**
 * Easy Labeling TypeScript Type Definitions
 * 
 * This file serves as the main entry point for all type definitions used
 * throughout the Easy Labeling application.
 */

// Export all types from individual modules
export * from './app-state';
export * from './canvas';
export * from './file-system';
export * from './ui';

// Export filesystem types explicitly to avoid conflicts
export type {
  IFileSystemService,
  FileOperationResult,
  FileLoadResult,
  YoloLabel,
  YoloParseResult,
  YoloExportOptions,
  ClassFileContent,
  ClassFileValidation,
  FolderScanResult,
  LabelStatus,
  ImageInfo,
  ImageLoadOptions,
  TiffProcessingOptions,
  CacheEntry,
  CacheStats,
  FileSystemError,
  ImageLoadError,
  YoloFormatError,
  FileFormat,
  LabelFormat,
  ClassFileFormat,
  FileTypeInfo,
  FileSystemServiceFactory
} from './filesystem';

// Base/Common Types
export type Mode = 'edit' | 'draw';
export type LabelSortOrder = 'asc' | 'desc';
export type FileType = 'image' | 'label' | 'class';

// Geometric types
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

// Utility types for better type safety
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Event handler types
export type EventHandler<T = Event> = (event: T) => void;
export type VoidCallback = () => void;
export type AsyncCallback = () => Promise<void>;

// File System Access API types (for better browser compatibility)
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

// Additional File System API interfaces
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

// Error types
export interface AppError extends Error {
  code: string;
  details?: Record<string, any>;
}

// Generic response types
export interface OperationResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

// Configuration types
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