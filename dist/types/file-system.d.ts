/**
 * File System Type Definitions
 *
 * Types related to file I/O, YOLO format processing, and File System Access API.
 */
import { FileSystemDirectoryHandle, FileSystemFileHandle, OperationResult } from './index';
import { ImageFile, ClassFile, ClassDefinition } from './app-state';
import { YOLOLabel, BoundingBox } from './canvas';
export type SupportedImageFormat = 'jpg' | 'jpeg' | 'png' | 'bmp' | 'tiff' | 'tif' | 'webp';
export type SupportedLabelFormat = 'txt' | 'yolo';
export type SupportedClassFormat = 'yaml' | 'yml' | 'names';
export interface FilePatterns {
    images: RegExp;
    labels: RegExp;
    classes: RegExp;
}
export interface FileMetadata {
    name: string;
    extension: string;
    size: number;
    lastModified: Date;
    path: string;
    mimeType?: string;
}
export interface ImageMetadata extends FileMetadata {
    width: number;
    height: number;
    aspectRatio: number;
    colorSpace?: 'rgb' | 'grayscale' | 'cmyk';
    hasAlpha: boolean;
    dpi?: number;
}
export interface LabelFileContent {
    fileName: string;
    labels: YOLOLabel[];
    isEmpty: boolean;
    isValid: boolean;
    errors: string[];
}
export interface YAMLClassFile {
    version?: string;
    names: string[] | {
        [key: number]: string;
    };
    colors?: {
        [key: number]: string;
    };
    descriptions?: {
        [key: number]: string;
    };
    metadata?: {
        created: string;
        modified: string;
        author?: string;
        version?: string;
    };
}
export interface NamesFileContent {
    names: string[];
    lineCount: number;
}
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
export interface FolderSelectionResult extends OperationResult<FileSystemDirectoryHandle> {
    folderName: string;
    fileCount: number;
    hasPermission: boolean;
}
export interface SaveLabelsOptions {
    format: SupportedLabelFormat;
    createMissing: boolean;
    overwrite: boolean;
    backup: boolean;
}
export interface SaveLabelsResult extends OperationResult {
    savedFiles: string[];
    skippedFiles: string[];
    errors: Array<{
        fileName: string;
        error: string;
    }>;
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
    errors: Array<{
        fileName: string;
        error: string;
    }>;
}
export interface FileSystemPermissions {
    read: boolean;
    write: boolean;
    canRequestPermission: boolean;
}
export interface FileValidation {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
}
export interface FileSystemMethods {
    selectImageFolder(): Promise<FolderSelectionResult>;
    selectLabelFolder(): Promise<FolderSelectionResult>;
    selectClassInfoFolder(): Promise<FolderSelectionResult>;
    listImageFiles(folderHandle: FileSystemDirectoryHandle): Promise<ImageFile[]>;
    listLabelFiles(folderHandle: FileSystemDirectoryHandle): Promise<string[]>;
    listClassFiles(folderHandle: FileSystemDirectoryHandle): Promise<ClassFile[]>;
    loadImage(imageFile: ImageFile): Promise<HTMLImageElement>;
    getImageMetadata(imageFile: ImageFile): Promise<ImageMetadata>;
    createImagePreview(imageFile: ImageFile, maxSize: number): Promise<string>;
    loadLabels(imageFileName: string): Promise<YOLOLabel[]>;
    saveLabels(imageFileName: string, labels: YOLOLabel[]): Promise<FileWriteResult>;
    deleteLabels(imageFileName: string): Promise<boolean>;
    hasLabels(imageFileName: string): Promise<boolean>;
    loadAllLabels(options?: LoadLabelsOptions): Promise<LoadLabelsResult>;
    saveAllLabels(labelMap: Map<string, YOLOLabel[]>, options?: SaveLabelsOptions): Promise<SaveLabelsResult>;
    loadClassFile(classFile: ClassFile): Promise<ClassDefinition[]>;
    saveClassFile(fileName: string, classes: ClassDefinition[]): Promise<FileWriteResult>;
    parseYAMLClassFile(content: string): ClassDefinition[];
    parseNamesFile(content: string): ClassDefinition[];
    convertBoundingBoxesToYOLO(boundingBoxes: BoundingBox[], imageSize: {
        width: number;
        height: number;
    }): YOLOLabel[];
    convertYOLOToBoundingBoxes(yoloLabels: YOLOLabel[], imageSize: {
        width: number;
        height: number;
    }): BoundingBox[];
    validateImageFile(file: File): FileValidation;
    validateLabelFile(content: string): FileValidation;
    validateClassFile(content: string): FileValidation;
    getFileExtension(fileName: string): string;
    getBaseName(fileName: string): string;
    generateLabelFileName(imageFileName: string): string;
    checkFileSystemSupport(): boolean;
    checkPermissions(handle: FileSystemDirectoryHandle): Promise<FileSystemPermissions>;
    requestPermissions(handle: FileSystemDirectoryHandle): Promise<FileSystemPermissions>;
}
export interface IFileSystem extends FileSystemMethods {
    readonly supportedFormats: {
        images: SupportedImageFormat[];
        labels: SupportedLabelFormat[];
        classes: SupportedClassFormat[];
    };
    readonly patterns: FilePatterns;
    isReady(): boolean;
    hasImageFolder(): boolean;
    hasLabelFolder(): boolean;
    hasClassInfoFolder(): boolean;
}
export type FileSystemEventType = 'folder:selected' | 'file:loaded' | 'file:saved' | 'file:deleted' | 'labels:loaded' | 'labels:saved' | 'class:loaded' | 'error';
export interface FileSystemEvent<T = any> {
    type: FileSystemEventType;
    data?: T;
    error?: Error;
    timestamp: Date;
}
export type FileSystemEventHandler<T = any> = (event: FileSystemEvent<T>) => void;
export interface FileSystemFactory {
    create(): IFileSystem;
    createWithDefaults(): IFileSystem;
}
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
export interface FileSystemStats {
    totalImages: number;
    totalLabels: number;
    totalClasses: number;
    labeledImages: number;
    unlabeledImages: number;
    averageLabelsPerImage: number;
    storageUsed: number;
}
export interface ExportOptions {
    format: 'yolo' | 'coco' | 'voc' | 'csv';
    includeImages: boolean;
    compression: boolean;
    splitRatio?: {
        train: number;
        val: number;
        test: number;
    };
}
export interface ImportOptions {
    format: 'yolo' | 'coco' | 'voc' | 'csv';
    validateFormat: boolean;
    createMissing: boolean;
    overwrite: boolean;
}
export interface FileSystemMigration {
    fromVersion: string;
    toVersion: string;
    migrate(config: any): Promise<FileSystemConfig>;
}
//# sourceMappingURL=file-system.d.ts.map