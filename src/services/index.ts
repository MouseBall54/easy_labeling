/**
 * Services Module Index
 * 
 * Central export point for all service classes used throughout the Easy Labeling application.
 * This module provides clean API access to business logic and external service integrations.
 */

// Export FileSystemService
export { 
  FileSystemService, 
  createFileSystemService, 
  createFileSystemServiceWithCache,
  type IFileSystemService,
  type FileSystemConfig
} from './FileSystemService';

// Re-export YoloParser from utils for convenience
export { YoloParser, parseYolo, exportYolo } from '../utils/yolo-parser';

// Re-export types for convenience
export type {
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
  FileSystemEvent,
  FileSystemEventHandler,
  FileSystemError,
  ImageLoadError,
  YoloFormatError,
  FileFormat,
  LabelFormat,
  ClassFileFormat,
  FileTypeInfo,
  FileSystemServiceFactory
} from '../types/filesystem';