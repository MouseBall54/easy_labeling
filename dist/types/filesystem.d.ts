/**
 * FileSystem Service Type Definitions
 *
 * Types for file I/O operations, YOLO format handling, and File System Access API integration.
 */
import { FileSystemDirectoryHandle, FileSystemFileHandle } from './index';
import { ImageFile, ClassFile, ClassDefinition } from './app-state';
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
export interface IFileSystemService {
    selectImageFolder(): Promise<FileOperationResult<FileSystemDirectoryHandle>>;
    selectLabelFolder(): Promise<FileOperationResult<FileSystemDirectoryHandle>>;
    selectClassInfoFolder(): Promise<FileOperationResult<FileSystemDirectoryHandle>>;
    listImageFiles(folderHandle: FileSystemDirectoryHandle): Promise<FileOperationResult<ImageFile[]>>;
    listClassFiles(folderHandle: FileSystemDirectoryHandle): Promise<FileOperationResult<ClassFile[]>>;
    scanFolder(folderHandle: FileSystemDirectoryHandle): Promise<FileOperationResult<FolderScanResult>>;
    loadImage(fileHandle: FileSystemFileHandle, options?: ImageLoadOptions): Promise<FileOperationResult<HTMLImageElement>>;
    loadTiffImage(fileHandle: FileSystemFileHandle, options?: TiffProcessingOptions): Promise<FileOperationResult<HTMLImageElement>>;
    getImageInfo(fileHandle: FileSystemFileHandle): Promise<FileOperationResult<ImageInfo>>;
    loadLabels(fileName: string, folderHandle: FileSystemDirectoryHandle): Promise<FileOperationResult<YoloLabel[]>>;
    saveLabels(fileName: string, labels: YoloLabel[], folderHandle: FileSystemDirectoryHandle): Promise<FileOperationResult>;
    checkLabelStatus(fileName: string, folderHandle: FileSystemDirectoryHandle): Promise<FileOperationResult<LabelStatus>>;
    loadClassFile(fileHandle: FileSystemFileHandle): Promise<FileOperationResult<ClassFileContent>>;
    saveClassFile(fileHandle: FileSystemFileHandle, content: ClassFileContent): Promise<FileOperationResult>;
    createClassFile(folderHandle: FileSystemDirectoryHandle, fileName: string, initialContent?: ClassFileContent): Promise<FileOperationResult<FileSystemFileHandle>>;
    validateClassFile(content: string): ClassFileValidation;
    parseYoloString(yoloData: string): YoloParseResult;
    labelsToYoloString(labels: YoloLabel[], options?: YoloExportOptions): string;
    validateYoloLabel(label: YoloLabel): boolean;
    clearImageCache(): void;
    getCacheStats(): CacheStats;
    optimizeCache(): void;
}
export interface FileSystemConfig {
    supportedImageFormats: string[];
    maxImageSize: number;
    thumbnailSize: {
        width: number;
        height: number;
    };
    maxCacheSize: number;
    cacheTimeout: number;
    yoloValidation: {
        strictBounds: boolean;
        allowZeroSize: boolean;
        precision: number;
    };
    batchSize: number;
    concurrentLoads: number;
    preloadAdjacent: boolean;
}
export interface FileSystemEvent {
    type: string;
    data?: any;
    timestamp: Date;
}
export type FileSystemEventHandler = (event: FileSystemEvent) => void;
export declare class FileSystemError extends Error {
    code: string;
    details?: any | undefined;
    constructor(message: string, code: string, details?: any | undefined);
}
export declare class YoloFormatError extends Error {
    line?: number | undefined;
    data?: string | undefined;
    constructor(message: string, line?: number | undefined, data?: string | undefined);
}
export declare class ImageLoadError extends Error {
    fileName?: string | undefined;
    cause?: Error | undefined;
    constructor(message: string, fileName?: string | undefined, cause?: Error | undefined);
}
export type FileFormat = 'jpg' | 'jpeg' | 'png' | 'gif' | 'tif' | 'tiff' | 'webp';
export type LabelFormat = 'yolo' | 'coco' | 'pascal' | 'custom';
export type ClassFileFormat = 'yaml' | 'yml' | 'json' | 'txt';
export interface FileTypeInfo {
    extension: string;
    mimeType: string;
    category: 'image' | 'label' | 'class' | 'other';
    supported: boolean;
}
export interface FileSystemServiceFactory {
    create(config?: Partial<FileSystemConfig>): IFileSystemService;
    createWithCache(cacheSize: number): IFileSystemService;
}
//# sourceMappingURL=filesystem.d.ts.map