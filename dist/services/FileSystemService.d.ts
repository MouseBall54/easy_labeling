/**
 * FileSystem Service Implementation
 *
 * Handles all file I/O operations for the Easy Labeling application.
 * Provides abstraction over File System Access API and YOLO format processing.
 *
 * @version 1.0.0
 * @author Easy Labeling TypeScript Migration
 */
import { IFileSystemService, FileOperationResult, YoloLabel, YoloParseResult, YoloExportOptions, ClassFileContent, ClassFileValidation, FolderScanResult, LabelStatus, ImageInfo, ImageLoadOptions, TiffProcessingOptions, CacheStats, FileSystemConfig, FileSystemEventHandler } from '../types/filesystem';
import { FileSystemDirectoryHandle, FileSystemFileHandle } from '../types';
import { ImageFile, ClassFile } from '../types/app-state';
export declare class FileSystemService implements IFileSystemService {
    private config;
    private imageCache;
    private eventListeners;
    private static readonly DEFAULT_CONFIG;
    constructor(config?: Partial<FileSystemConfig>);
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
    addEventListener(type: string, handler: FileSystemEventHandler): void;
    removeEventListener(type: string, handler: FileSystemEventHandler): void;
    private dispatchEvent;
    private getFileExtension;
    private getLabelFileName;
    private createImageFromFile;
    private cacheImage;
    private isCacheValid;
    private getTotalCacheSize;
}
/**
 * Create a new FileSystemService instance
 */
export declare function createFileSystemService(config?: Partial<FileSystemConfig>): FileSystemService;
/**
 * Create FileSystemService with custom cache size
 */
export declare function createFileSystemServiceWithCache(cacheSize: number): FileSystemService;
export default FileSystemService;
export type { IFileSystemService, FileSystemConfig };
//# sourceMappingURL=FileSystemService.d.ts.map