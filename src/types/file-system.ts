/**
 * File System Type Definitions
 * 
 * Types related to file I/O, YOLO format processing, and File System Access API.
 */

import { 
  FileSystemDirectoryHandle, 
  FileSystemFileHandle, 
  OperationResult 
} from './index';
import { ImageFile, ClassFile, ClassDefinition } from './app-state';
import { YOLOLabel, BoundingBox } from './canvas';

// File format types
export type SupportedImageFormat = 'jpg' | 'jpeg' | 'png' | 'bmp' | 'tiff' | 'tif' | 'webp';
export type SupportedLabelFormat = 'txt' | 'yolo';
export type SupportedClassFormat = 'yaml' | 'yml' | 'names';

// File extension patterns
export interface FilePatterns {
  images: RegExp;
  labels: RegExp;
  classes: RegExp;
}

// File metadata
export interface FileMetadata {
  name: string;
  extension: string;
  size: number;
  lastModified: Date;
  path: string;
  mimeType?: string;
}

// Image metadata
export interface ImageMetadata extends FileMetadata {
  width: number;
  height: number;
  aspectRatio: number;
  colorSpace?: 'rgb' | 'grayscale' | 'cmyk';
  hasAlpha: boolean;
  dpi?: number;
}

// Label file content
export interface LabelFileContent {
  fileName: string;
  labels: YOLOLabel[];
  isEmpty: boolean;
  isValid: boolean;
  errors: string[];
}

// YAML class file structure
export interface YAMLClassFile {
  version?: string;
  names: string[] | { [key: number]: string };
  colors?: { [key: number]: string };
  descriptions?: { [key: number]: string };
  metadata?: {
    created: string;
    modified: string;
    author?: string;
    version?: string;
  };
}

// Names file structure (simple list)
export interface NamesFileContent {
  names: string[];
  lineCount: number;
}

// File operation results
export interface FileReadResult<T = any> extends OperationResult<T> {
  fileHandle: FileSystemFileHandle;
  metadata: FileMetadata;
  content?: T;
}

export interface FileWriteResult extends OperationResult {
  fileHandle: FileSystemFileHandle;
  bytesWritten: number;
}

export interface DirectoryReadResult extends OperationResult {
  directoryHandle: FileSystemDirectoryHandle;
  files: FileSystemFileHandle[];
  directories: FileSystemDirectoryHandle[];
  totalCount: number;
}

// Folder selection results
export interface FolderSelectionResult extends OperationResult<FileSystemDirectoryHandle> {
  folderName: string;
  fileCount: number;
  hasPermission: boolean;
}

// Label saving/loading operations
export interface SaveLabelsOptions {
  format: SupportedLabelFormat;
  createMissing: boolean;
  overwrite: boolean;
  backup: boolean;
}

export interface SaveLabelsResult extends OperationResult {
  savedFiles: string[];
  skippedFiles: string[];
  errors: Array<{ fileName: string; error: string }>;
}

export interface LoadLabelsOptions {
  validateFormat: boolean;
  createMissing: boolean;
  ignoreErrors: boolean;
}

export interface LoadLabelsResult extends OperationResult {
  loadedLabels: Map<string, YOLOLabel[]>;
  totalFiles: number;
  loadedFiles: number;
  errors: Array<{ fileName: string; error: string }>;
}

// File system permissions
export interface FileSystemPermissions {
  read: boolean;
  write: boolean;
  canRequestPermission: boolean;
}

// File validation
export interface FileValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// File system methods interface
export interface FileSystemMethods {
  // Folder operations
  selectImageFolder(): Promise<FolderSelectionResult>;
  selectLabelFolder(): Promise<FolderSelectionResult>;
  selectClassInfoFolder(): Promise<FolderSelectionResult>;
  
  // File listing
  listImageFiles(folderHandle: FileSystemDirectoryHandle): Promise<ImageFile[]>;
  listLabelFiles(folderHandle: FileSystemDirectoryHandle): Promise<string[]>;
  listClassFiles(folderHandle: FileSystemDirectoryHandle): Promise<ClassFile[]>;
  
  // Image operations
  loadImage(imageFile: ImageFile): Promise<HTMLImageElement>;
  getImageMetadata(imageFile: ImageFile): Promise<ImageMetadata>;
  createImagePreview(imageFile: ImageFile, maxSize: number): Promise<string>;
  
  // Label operations
  loadLabels(imageFileName: string): Promise<YOLOLabel[]>;
  saveLabels(imageFileName: string, labels: YOLOLabel[]): Promise<FileWriteResult>;
  deleteLabels(imageFileName: string): Promise<boolean>;
  hasLabels(imageFileName: string): Promise<boolean>;
  
  // Batch operations
  loadAllLabels(options?: LoadLabelsOptions): Promise<LoadLabelsResult>;
  saveAllLabels(labelMap: Map<string, YOLOLabel[]>, options?: SaveLabelsOptions): Promise<SaveLabelsResult>;
  
  // Class file operations
  loadClassFile(classFile: ClassFile): Promise<ClassDefinition[]>;
  saveClassFile(fileName: string, classes: ClassDefinition[]): Promise<FileWriteResult>;
  parseYAMLClassFile(content: string): ClassDefinition[];
  parseNamesFile(content: string): ClassDefinition[];
  
  // File conversion
  convertBoundingBoxesToYOLO(boundingBoxes: BoundingBox[], imageSize: { width: number; height: number }): YOLOLabel[];
  convertYOLOToBoundingBoxes(yoloLabels: YOLOLabel[], imageSize: { width: number; height: number }): BoundingBox[];
  
  // Validation
  validateImageFile(file: File): FileValidation;
  validateLabelFile(content: string): FileValidation;
  validateClassFile(content: string): FileValidation;
  
  // Utility
  getFileExtension(fileName: string): string;
  getBaseName(fileName: string): string;
  generateLabelFileName(imageFileName: string): string;
  checkFileSystemSupport(): boolean;
  
  // Permissions
  checkPermissions(handle: FileSystemDirectoryHandle): Promise<FileSystemPermissions>;
  requestPermissions(handle: FileSystemDirectoryHandle): Promise<FileSystemPermissions>;
}

// File system controller interface
export interface IFileSystem extends FileSystemMethods {
  // Configuration
  readonly supportedFormats: {
    images: SupportedImageFormat[];
    labels: SupportedLabelFormat[];
    classes: SupportedClassFormat[];
  };
  
  readonly patterns: FilePatterns;
  
  // State
  isReady(): boolean;
  hasImageFolder(): boolean;
  hasLabelFolder(): boolean;
  hasClassInfoFolder(): boolean;
}

// File system events
export type FileSystemEventType = 
  | 'folder:selected'
  | 'file:loaded'
  | 'file:saved'
  | 'file:deleted'
  | 'labels:loaded'
  | 'labels:saved'
  | 'class:loaded'
  | 'error';

export interface FileSystemEvent<T = any> {
  type: FileSystemEventType;
  data?: T;
  error?: Error;
  timestamp: Date;
}

export type FileSystemEventHandler<T = any> = (event: FileSystemEvent<T>) => void;

// File system factory
export interface FileSystemFactory {
  create(): IFileSystem;
  createWithDefaults(): IFileSystem;
}

// File system configuration
export interface FileSystemConfig {
  autoSave: boolean;
  createMissingFolders: boolean;
  validateFiles: boolean;
  maxFileSize: number;
  supportedFormats: {
    images: SupportedImageFormat[];
    labels: SupportedLabelFormat[];
    classes: SupportedClassFormat[];
  };
}

// Batch processing
export interface BatchProcessingOptions {
  maxConcurrent: number;
  progressCallback?: (progress: BatchProgress) => void;
  errorHandling: 'stop' | 'continue' | 'ask';
}

export interface BatchProgress {
  total: number;
  completed: number;
  failed: number;
  current: string;
  percentage: number;
}

// File system statistics
export interface FileSystemStats {
  totalImages: number;
  totalLabels: number;
  totalClasses: number;
  labeledImages: number;
  unlabeledImages: number;
  averageLabelsPerImage: number;
  storageUsed: number;
}

// Export/Import operations
export interface ExportOptions {
  format: 'yolo' | 'coco' | 'voc' | 'csv';
  includeImages: boolean;
  compression: boolean;
  splitRatio?: { train: number; val: number; test: number };
}

export interface ImportOptions {
  format: 'yolo' | 'coco' | 'voc' | 'csv';
  validateFormat: boolean;
  createMissing: boolean;
  overwrite: boolean;
}

// File system migrations
export interface FileSystemMigration {
  fromVersion: string;
  toVersion: string;
  migrate(config: any): Promise<FileSystemConfig>;
}