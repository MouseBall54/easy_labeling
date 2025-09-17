/**
 * FileSystem Service Type Definitions
 * 
 * Types for file I/O operations, YOLO format handling, and File System Access API integration.
 */

import { FileSystemDirectoryHandle, FileSystemFileHandle } from './index';
import { ImageFile, ClassFile, ClassDefinition } from './app-state';

// ===================================================================
// File Operations
// ===================================================================

export interface FileOperationResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface FileLoadResult {
  content: string;
  file: File;
  lastModified: Date;
  size: number;
}

// ===================================================================
// YOLO Format Types
// ===================================================================

export interface YoloLabel {
  classId: number;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
}

export interface YoloParseResult {
  labels: YoloLabel[];
  errors: string[];
  warnings: string[];
}

export interface YoloExportOptions {
  precision?: number;
  includeComments?: boolean;
  validateBounds?: boolean;
}

// ===================================================================
// Class File Types
// ===================================================================

export interface ClassFileContent {
  classes: ClassDefinition[];
  metadata?: {
    version?: string;
    created?: Date;
    modified?: Date;
    description?: string;
  };
}

export interface ClassFileValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  duplicateIds: number[];
  emptyNames: string[];
}

// ===================================================================
// Folder Operations
// ===================================================================

export interface FolderScanResult {
  imageFiles: ImageFile[];
  labelFiles: string[];
  classFiles: ClassFile[];
  totalFiles: number;
  errors: string[];
}

export interface LabelStatus {
  fileName: string;
  hasLabels: boolean;
  labelCount: number;
  lastModified?: Date;
}

// ===================================================================
// Image Processing
// ===================================================================

export interface ImageLoadOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'png' | 'jpeg' | 'webp';
}

export interface ImageInfo {
  name: string;
  width: number;
  height: number;
  size: number;
  format: string;
  lastModified: Date;
}

export interface TiffProcessingOptions {
  page?: number;
  convertToCanvas?: boolean;
  backgroundColor?: string;
}

// ===================================================================
// Cache Management
// ===================================================================

export interface CacheEntry<T> {
  data: T;
  timestamp: Date;
  size: number;
  hits: number;
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  memoryUsage: number;
}

// ===================================================================
// File System Service Interface
// ===================================================================

export interface IFileSystemService {
  // Folder Operations
  selectImageFolder(): Promise<FileOperationResult<FileSystemDirectoryHandle>>;
  selectLabelFolder(): Promise<FileOperationResult<FileSystemDirectoryHandle>>;
  selectClassInfoFolder(): Promise<FileOperationResult<FileSystemDirectoryHandle>>;
  
  // File Listing
  listImageFiles(folderHandle: FileSystemDirectoryHandle): Promise<FileOperationResult<ImageFile[]>>;
  listClassFiles(folderHandle: FileSystemDirectoryHandle): Promise<FileOperationResult<ClassFile[]>>;
  scanFolder(folderHandle: FileSystemDirectoryHandle): Promise<FileOperationResult<FolderScanResult>>;
  
  // Image Operations
  loadImage(fileHandle: FileSystemFileHandle, options?: ImageLoadOptions): Promise<FileOperationResult<HTMLImageElement>>;
  loadTiffImage(fileHandle: FileSystemFileHandle, options?: TiffProcessingOptions): Promise<FileOperationResult<HTMLImageElement>>;
  getImageInfo(fileHandle: FileSystemFileHandle): Promise<FileOperationResult<ImageInfo>>;
  
  // Label Operations
  loadLabels(fileName: string, folderHandle: FileSystemDirectoryHandle): Promise<FileOperationResult<YoloLabel[]>>;
  saveLabels(fileName: string, labels: YoloLabel[], folderHandle: FileSystemDirectoryHandle): Promise<FileOperationResult>;
  checkLabelStatus(fileName: string, folderHandle: FileSystemDirectoryHandle): Promise<FileOperationResult<LabelStatus>>;
  
  // Class File Operations
  loadClassFile(fileHandle: FileSystemFileHandle): Promise<FileOperationResult<ClassFileContent>>;
  saveClassFile(fileHandle: FileSystemFileHandle, content: ClassFileContent): Promise<FileOperationResult>;
  createClassFile(folderHandle: FileSystemDirectoryHandle, fileName: string, initialContent?: ClassFileContent): Promise<FileOperationResult<FileSystemFileHandle>>;
  validateClassFile(content: string): ClassFileValidation;
  
  // YOLO Format Processing
  parseYoloString(yoloData: string): YoloParseResult;
  labelsToYoloString(labels: YoloLabel[], options?: YoloExportOptions): string;
  validateYoloLabel(label: YoloLabel): boolean;
  
  // Cache Management
  clearImageCache(): void;
  getCacheStats(): CacheStats;
  optimizeCache(): void;
}

// ===================================================================
// Configuration
// ===================================================================

export interface FileSystemConfig {
  // Image settings
  supportedImageFormats: string[];
  maxImageSize: number;
  thumbnailSize: { width: number; height: number };
  
  // Cache settings
  maxCacheSize: number;
  cacheTimeout: number;
  
  // YOLO settings
  yoloValidation: {
    strictBounds: boolean;
    allowZeroSize: boolean;
    precision: number;
  };
  
  // Performance settings
  batchSize: number;
  concurrentLoads: number;
  preloadAdjacent: boolean;
}

// ===================================================================
// Events
// ===================================================================

export interface FileSystemEvent {
  type: string;
  data?: any;
  timestamp: Date;
}

export type FileSystemEventHandler = (event: FileSystemEvent) => void;

// ===================================================================
// Error Types
// ===================================================================

export class FileSystemError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'FileSystemError';
  }
}

export class YoloFormatError extends Error {
  constructor(
    message: string,
    public line?: number,
    public data?: string
  ) {
    super(message);
    this.name = 'YoloFormatError';
  }
}

export class ImageLoadError extends Error {
  constructor(
    message: string,
    public fileName?: string,
    public cause?: Error
  ) {
    super(message);
    this.name = 'ImageLoadError';
  }
}

// ===================================================================
// Utility Types
// ===================================================================

export type FileFormat = 'jpg' | 'jpeg' | 'png' | 'gif' | 'tif' | 'tiff' | 'webp';
export type LabelFormat = 'yolo' | 'coco' | 'pascal' | 'custom';
export type ClassFileFormat = 'yaml' | 'yml' | 'json' | 'txt';

export interface FileTypeInfo {
  extension: string;
  mimeType: string;
  category: 'image' | 'label' | 'class' | 'other';
  supported: boolean;
}

// ===================================================================
// Factory Types
// ===================================================================

export interface FileSystemServiceFactory {
  create(config?: Partial<FileSystemConfig>): IFileSystemService;
  createWithCache(cacheSize: number): IFileSystemService;
}