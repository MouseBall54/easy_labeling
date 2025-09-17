/**
 * FileSystem Service Implementation
 * 
 * Handles all file I/O operations for the Easy Labeling application.
 * Provides abstraction over File System Access API and YOLO format processing.
 * 
 * @version 1.0.0
 * @author Easy Labeling TypeScript Migration
 */

import { 
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
  FileSystemConfig,
  FileSystemEvent,
  FileSystemEventHandler,
  FileSystemError,
  ImageLoadError,
  FileFormat,
  ClassFileFormat
} from '../types/filesystem';

import { 
  FileSystemDirectoryHandle, 
  FileSystemFileHandle 
} from '../types';

import { 
  ImageFile, 
  ClassFile, 
  ClassDefinition 
} from '../types/app-state';

import { YoloParser } from '../utils/yolo-parser';

// ===================================================================
// FileSystem Service Implementation
// ===================================================================

export class FileSystemService implements IFileSystemService {
  private config: FileSystemConfig;
  private imageCache = new Map<string, CacheEntry<HTMLImageElement>>();
  private eventListeners = new Map<string, FileSystemEventHandler[]>();
  
  // Default configuration
  private static readonly DEFAULT_CONFIG: FileSystemConfig = {
    supportedImageFormats: ['jpg', 'jpeg', 'png', 'gif', 'tif', 'tiff', 'webp'],
    maxImageSize: 50 * 1024 * 1024, // 50MB
    thumbnailSize: { width: 150, height: 150 },
    maxCacheSize: 100 * 1024 * 1024, // 100MB
    cacheTimeout: 30 * 60 * 1000, // 30 minutes
    yoloValidation: {
      strictBounds: true,
      allowZeroSize: false,
      precision: 6
    },
    batchSize: 10,
    concurrentLoads: 3,
    preloadAdjacent: true
  };

  constructor(config?: Partial<FileSystemConfig>) {
    this.config = { ...FileSystemService.DEFAULT_CONFIG, ...config };
  }

  // ===================================================================
  // Folder Operations
  // ===================================================================

  public async selectImageFolder(): Promise<FileOperationResult<FileSystemDirectoryHandle>> {
    try {
      const folderHandle = await (window as any).showDirectoryPicker();
      
      this.dispatchEvent({
        type: 'folder:image-selected',
        data: { name: folderHandle.name },
        timestamp: new Date()
      });

      return {
        success: true,
        data: folderHandle,
        message: `Image folder selected: ${folderHandle.name}`
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return { success: false, message: 'Selection cancelled' };
      }
      
      return {
        success: false,
        error: `Failed to select image folder: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  public async selectLabelFolder(): Promise<FileOperationResult<FileSystemDirectoryHandle>> {
    try {
      const folderHandle = await (window as any).showDirectoryPicker();
      
      this.dispatchEvent({
        type: 'folder:label-selected',
        data: { name: folderHandle.name },
        timestamp: new Date()
      });

      return {
        success: true,
        data: folderHandle,
        message: `Label folder selected: ${folderHandle.name}`
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return { success: false, message: 'Selection cancelled' };
      }
      
      return {
        success: false,
        error: `Failed to select label folder: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  public async selectClassInfoFolder(): Promise<FileOperationResult<FileSystemDirectoryHandle>> {
    try {
      const folderHandle = await (window as any).showDirectoryPicker();
      
      this.dispatchEvent({
        type: 'folder:class-info-selected',
        data: { name: folderHandle.name },
        timestamp: new Date()
      });

      return {
        success: true,
        data: folderHandle,
        message: `Class info folder selected: ${folderHandle.name}`
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return { success: false, message: 'Selection cancelled' };
      }
      
      return {
        success: false,
        error: `Failed to select class info folder: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // ===================================================================
  // File Listing Operations
  // ===================================================================

  public async listImageFiles(folderHandle: FileSystemDirectoryHandle): Promise<FileOperationResult<ImageFile[]>> {
    try {
      const imageFiles: ImageFile[] = [];
      const supportedFormats = this.config.supportedImageFormats.map(f => f.toLowerCase());

      for await (const entry of (folderHandle as any).values()) {
        if (entry.kind === 'file') {
          const extension = this.getFileExtension(entry.name).toLowerCase();
          if (supportedFormats.includes(extension)) {
            const imageFile: ImageFile = {
              name: entry.name,
              handle: entry,
              path: entry.name, // Note: Full path not available in File System Access API
              extension,
              size: undefined, // Will be loaded when needed
              lastModified: undefined // Will be loaded when needed
            };
            imageFiles.push(imageFile);
          }
        }
      }

      // Sort files naturally (handles numbers correctly)
      imageFiles.sort((a, b) => 
        a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
      );

      this.dispatchEvent({
        type: 'files:images-listed',
        data: { count: imageFiles.length, folder: folderHandle.name },
        timestamp: new Date()
      });

      return {
        success: true,
        data: imageFiles,
        message: `Found ${imageFiles.length} image files`
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to list image files: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  public async listClassFiles(folderHandle: FileSystemDirectoryHandle): Promise<FileOperationResult<ClassFile[]>> {
    try {
      const classFiles: ClassFile[] = [];
      const supportedFormats = ['yaml', 'yml'];

      for await (const entry of (folderHandle as any).values()) {
        if (entry.kind === 'file') {
          const extension = this.getFileExtension(entry.name).toLowerCase();
          if (supportedFormats.includes(extension)) {
            // Load class file content
            const contentResult = await this.loadClassFile(entry);
            
            const classFile: ClassFile = {
              name: entry.name,
              handle: entry,
              content: contentResult.success ? contentResult.data!.classes : [],
              isSelected: false
            };
            classFiles.push(classFile);
          }
        }
      }

      this.dispatchEvent({
        type: 'files:classes-listed',
        data: { count: classFiles.length, folder: folderHandle.name },
        timestamp: new Date()
      });

      return {
        success: true,
        data: classFiles,
        message: `Found ${classFiles.length} class files`
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to list class files: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  public async scanFolder(folderHandle: FileSystemDirectoryHandle): Promise<FileOperationResult<FolderScanResult>> {
    try {
      const result: FolderScanResult = {
        imageFiles: [],
        labelFiles: [],
        classFiles: [],
        totalFiles: 0,
        errors: []
      };

      for await (const entry of (folderHandle as any).values()) {
        if (entry.kind === 'file') {
          result.totalFiles++;
          const extension = this.getFileExtension(entry.name).toLowerCase();

          if (this.config.supportedImageFormats.includes(extension)) {
            const imageFile: ImageFile = {
              name: entry.name,
              handle: entry,
              path: entry.name,
              extension
            };
            result.imageFiles.push(imageFile);
          } else if (extension === 'txt') {
            result.labelFiles.push(entry.name);
          } else if (['yaml', 'yml'].includes(extension)) {
            try {
              const contentResult = await this.loadClassFile(entry);
              if (contentResult.success) {
                const classFile: ClassFile = {
                  name: entry.name,
                  handle: entry,
                  content: contentResult.data!.classes,
                  isSelected: false
                };
                result.classFiles.push(classFile);
              }
            } catch (error) {
              result.errors.push(`Failed to load class file ${entry.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }
        }
      }

      return {
        success: true,
        data: result,
        message: `Scanned ${result.totalFiles} files`
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to scan folder: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // ===================================================================
  // Image Operations
  // ===================================================================

  public async loadImage(fileHandle: FileSystemFileHandle, options?: ImageLoadOptions): Promise<FileOperationResult<HTMLImageElement>> {
    try {
      // Check cache first
      const cacheKey = `${fileHandle.name}`;
      const cached = this.imageCache.get(cacheKey);
      
      if (cached && this.isCacheValid(cached)) {
        cached.hits++;
        return {
          success: true,
          data: cached.data,
          message: 'Loaded from cache'
        };
      }

      const file = await fileHandle.getFile();
      
      // Check file size
      if (file.size > this.config.maxImageSize) {
        throw new ImageLoadError(`Image too large: ${file.size} bytes (max: ${this.config.maxImageSize})`);
      }

      const img = await this.createImageFromFile(file, options);
      
      // Cache the image
      this.cacheImage(cacheKey, img, file.size);

      this.dispatchEvent({
        type: 'image:loaded',
        data: { fileName: file.name, size: file.size },
        timestamp: new Date()
      });

      return {
        success: true,
        data: img,
        message: `Image loaded: ${file.name}`
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to load image: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  public async loadTiffImage(fileHandle: FileSystemFileHandle, options?: TiffProcessingOptions): Promise<FileOperationResult<HTMLImageElement>> {
    try {
      const file = await fileHandle.getFile();
      
      // Use dynamic import for TIFF.js (loaded from CDN)
      if (typeof (window as any).Tiff === 'undefined') {
        throw new ImageLoadError('TIFF.js library not loaded');
      }

      const arrayBuffer = await file.arrayBuffer();
      const tiff = new (window as any).Tiff({ buffer: arrayBuffer });
      const canvas = tiff.toCanvas();
      
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new ImageLoadError('Failed to convert TIFF canvas to image'));
        img.src = canvas.toDataURL();
      });

      this.dispatchEvent({
        type: 'image:tiff-loaded',
        data: { fileName: file.name, size: file.size },
        timestamp: new Date()
      });

      return {
        success: true,
        data: img,
        message: `TIFF image loaded: ${file.name}`
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to load TIFF image: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  public async getImageInfo(fileHandle: FileSystemFileHandle): Promise<FileOperationResult<ImageInfo>> {
    try {
      const file = await fileHandle.getFile();
      const img = await this.createImageFromFile(file);

      const info: ImageInfo = {
        name: file.name,
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: file.size,
        format: this.getFileExtension(file.name),
        lastModified: new Date(file.lastModified)
      };

      return {
        success: true,
        data: info,
        message: `Image info retrieved: ${file.name}`
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get image info: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // ===================================================================
  // Label Operations
  // ===================================================================

  public async loadLabels(fileName: string, folderHandle: FileSystemDirectoryHandle): Promise<FileOperationResult<YoloLabel[]>> {
    try {
      const labelFileName = this.getLabelFileName(fileName);
      const labelFileHandle = await folderHandle.getFileHandle(labelFileName);
      const file = await labelFileHandle.getFile();
      const yoloData = await file.text();

      if (!yoloData.trim()) {
        return {
          success: true,
          data: [],
          message: 'No labels found'
        };
      }

      const parseResult = YoloParser.parseYoloString(yoloData);
      
      if (parseResult.errors.length > 0) {
        return {
          success: false,
          error: `YOLO parsing errors: ${parseResult.errors.join(', ')}`
        };
      }

      this.dispatchEvent({
        type: 'labels:loaded',
        data: { fileName, labelCount: parseResult.labels.length },
        timestamp: new Date()
      });

      return {
        success: true,
        data: parseResult.labels,
        message: `Loaded ${parseResult.labels.length} labels`
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'NotFoundError') {
        return {
          success: true,
          data: [],
          message: 'No label file found'
        };
      }
      
      return {
        success: false,
        error: `Failed to load labels: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  public async saveLabels(fileName: string, labels: YoloLabel[], folderHandle: FileSystemDirectoryHandle): Promise<FileOperationResult> {
    try {
      const labelFileName = this.getLabelFileName(fileName);
      const yoloString = YoloParser.labelsToYoloString(labels, {
        precision: this.config.yoloValidation.precision,
        validateBounds: this.config.yoloValidation.strictBounds
      });

      const fileHandle = await folderHandle.getFileHandle(labelFileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(yoloString.trim());
      await writable.close();

      this.dispatchEvent({
        type: 'labels:saved',
        data: { fileName, labelCount: labels.length },
        timestamp: new Date()
      });

      return {
        success: true,
        message: `Labels saved to ${labelFileName}`
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to save labels: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  public async checkLabelStatus(fileName: string, folderHandle: FileSystemDirectoryHandle): Promise<FileOperationResult<LabelStatus>> {
    try {
      const labelFileName = this.getLabelFileName(fileName);
      
      try {
        const labelFileHandle = await folderHandle.getFileHandle(labelFileName);
        const file = await labelFileHandle.getFile();
        const content = await file.text();
        const parseResult = YoloParser.parseYoloString(content);

        const status: LabelStatus = {
          fileName,
          hasLabels: parseResult.labels.length > 0,
          labelCount: parseResult.labels.length,
          lastModified: new Date(file.lastModified)
        };

        return {
          success: true,
          data: status,
          message: `Label status checked: ${fileName}`
        };
      } catch (error) {
        if (error instanceof Error && error.name === 'NotFoundError') {
          const status: LabelStatus = {
            fileName,
            hasLabels: false,
            labelCount: 0
          };

          return {
            success: true,
            data: status,
            message: 'No label file found'
          };
        }
        throw error;
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to check label status: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // ===================================================================
  // Class File Operations
  // ===================================================================

  public async loadClassFile(fileHandle: FileSystemFileHandle): Promise<FileOperationResult<ClassFileContent>> {
    try {
      const file = await fileHandle.getFile();
      const content = await file.text();
      
      const validation = this.validateClassFile(content);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Invalid class file: ${validation.errors.join(', ')}`
        };
      }

      const classes: ClassDefinition[] = [];
      const lines = content.split('\n');
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('#') || trimmedLine === '') return;

        const parts = trimmedLine.split(':');
        if (parts.length >= 2) {
          const id = parseInt(parts[0]!.trim(), 10);
          const name = parts.slice(1).join(':').trim();
          
          if (!isNaN(id) && name) {
            classes.push({
              id,
              name,
              description: undefined,
              color: undefined
            });
          }
        }
      });

      const classFileContent: ClassFileContent = {
        classes,
        metadata: {
          created: new Date(file.lastModified),
          modified: new Date(file.lastModified)
        }
      };

      this.dispatchEvent({
        type: 'classes:loaded',
        data: { fileName: file.name, classCount: classes.length },
        timestamp: new Date()
      });

      return {
        success: true,
        data: classFileContent,
        message: `Loaded ${classes.length} classes from ${file.name}`
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to load class file: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  public async saveClassFile(fileHandle: FileSystemFileHandle, content: ClassFileContent): Promise<FileOperationResult> {
    try {
      // Sort classes by ID
      const sortedClasses = [...content.classes].sort((a, b) => a.id - b.id);
      
      const lines = sortedClasses.map(cls => `${cls.id}: ${cls.name}`);
      const fileContent = lines.join('\n');

      const writable = await fileHandle.createWritable();
      await writable.write(fileContent);
      await writable.close();

      this.dispatchEvent({
        type: 'classes:saved',
        data: { fileName: fileHandle.name, classCount: content.classes.length },
        timestamp: new Date()
      });

      return {
        success: true,
        message: `Saved ${content.classes.length} classes to ${fileHandle.name}`
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to save class file: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  public async createClassFile(folderHandle: FileSystemDirectoryHandle, fileName: string, initialContent?: ClassFileContent): Promise<FileOperationResult<FileSystemFileHandle>> {
    try {
      // Ensure .yaml extension
      const finalFileName = fileName.endsWith('.yaml') || fileName.endsWith('.yml') 
        ? fileName 
        : `${fileName}.yaml`;

      // Check if file already exists
      try {
        await folderHandle.getFileHandle(finalFileName);
        return {
          success: false,
          error: `File "${finalFileName}" already exists`
        };
      } catch (error) {
        // File doesn't exist, which is what we want
      }

      const defaultContent: ClassFileContent = initialContent || {
        classes: [
          { id: 0, name: 'class1' },
          { id: 1, name: 'class2' }
        ],
        metadata: {
          created: new Date(),
          description: 'Auto-generated class file'
        }
      };

      const fileHandle = await folderHandle.getFileHandle(finalFileName, { create: true });
      await this.saveClassFile(fileHandle, defaultContent);

      this.dispatchEvent({
        type: 'classes:file-created',
        data: { fileName: finalFileName, classCount: defaultContent.classes.length },
        timestamp: new Date()
      });

      return {
        success: true,
        data: fileHandle,
        message: `Created class file: ${finalFileName}`
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create class file: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  public validateClassFile(content: string): ClassFileValidation {
    const result: ClassFileValidation = {
      isValid: true,
      errors: [],
      warnings: [],
      duplicateIds: [],
      emptyNames: []
    };

    const lines = content.split('\n');
    const seenIds = new Set<number>();
    
    lines.forEach((line, lineIndex) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('#') || trimmedLine === '') return;

      const parts = trimmedLine.split(':');
      if (parts.length < 2) {
        result.errors.push(`Line ${lineIndex + 1}: Invalid format. Expected "id: name"`);
        result.isValid = false;
        return;
      }

      const idStr = parts[0]!.trim();
      const name = parts.slice(1).join(':').trim();
      
      const id = parseInt(idStr, 10);
      if (isNaN(id) || String(id) !== idStr) {
        result.errors.push(`Line ${lineIndex + 1}: Invalid ID "${idStr}". Must be an integer`);
        result.isValid = false;
      } else if (seenIds.has(id)) {
        result.duplicateIds.push(id);
        result.errors.push(`Line ${lineIndex + 1}: Duplicate ID "${id}"`);
        result.isValid = false;
      } else {
        seenIds.add(id);
      }

      if (!name) {
        result.emptyNames.push(idStr);
        result.errors.push(`Line ${lineIndex + 1}: Empty class name for ID "${idStr}"`);
        result.isValid = false;
      }
    });

    return result;
  }

  // ===================================================================
  // YOLO Format Processing
  // ===================================================================

  public parseYoloString(yoloData: string): YoloParseResult {
    return YoloParser.parseYoloString(yoloData);
  }

  public labelsToYoloString(labels: YoloLabel[], options?: YoloExportOptions): string {
    return YoloParser.labelsToYoloString(labels, options);
  }

  public validateYoloLabel(label: YoloLabel): boolean {
    return YoloParser.validateYoloLabel(label);
  }

  // ===================================================================
  // Cache Management
  // ===================================================================

  public clearImageCache(): void {
    // Revoke all blob URLs to prevent memory leaks
    this.imageCache.forEach(entry => {
      if (entry.data.src.startsWith('blob:')) {
        URL.revokeObjectURL(entry.data.src);
      }
    });
    
    this.imageCache.clear();
    
    this.dispatchEvent({
      type: 'cache:cleared',
      timestamp: new Date()
    });
  }

  public getCacheStats(): CacheStats {
    let totalSize = 0;
    let totalHits = 0;
    let totalAccesses = 0;

    this.imageCache.forEach(entry => {
      totalSize += entry.size;
      totalHits += entry.hits;
      totalAccesses += entry.hits + 1; // +1 for initial load
    });

    return {
      totalEntries: this.imageCache.size,
      totalSize,
      hitRate: totalAccesses > 0 ? totalHits / totalAccesses : 0,
      memoryUsage: totalSize / (1024 * 1024) // MB
    };
  }

  public optimizeCache(): void {
    // Remove expired entries
    const now = new Date();
    const expiredKeys: string[] = [];

    this.imageCache.forEach((entry, key) => {
      if (now.getTime() - entry.timestamp.getTime() > this.config.cacheTimeout) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => {
      const entry = this.imageCache.get(key);
      if (entry && entry.data.src.startsWith('blob:')) {
        URL.revokeObjectURL(entry.data.src);
      }
      this.imageCache.delete(key);
    });

    // If still over limit, remove least recently used
    if (this.getTotalCacheSize() > this.config.maxCacheSize) {
      const entries = Array.from(this.imageCache.entries()).sort((a, b) => 
        a[1].timestamp.getTime() - b[1].timestamp.getTime()
      );

      while (this.getTotalCacheSize() > this.config.maxCacheSize && entries.length > 0) {
        const [key, entry] = entries.shift()!;
        if (entry.data.src.startsWith('blob:')) {
          URL.revokeObjectURL(entry.data.src);
        }
        this.imageCache.delete(key);
      }
    }

    this.dispatchEvent({
      type: 'cache:optimized',
      data: { removedExpired: expiredKeys.length },
      timestamp: new Date()
    });
  }

  // ===================================================================
  // Event System
  // ===================================================================

  public addEventListener(type: string, handler: FileSystemEventHandler): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, []);
    }
    this.eventListeners.get(type)!.push(handler);
  }

  public removeEventListener(type: string, handler: FileSystemEventHandler): void {
    const handlers = this.eventListeners.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers!.splice(index, 1);
      }
    }
  }

  private dispatchEvent(event: FileSystemEvent): void {
    const handlers = this.eventListeners.get(event.type);
    if (handlers) {
      handlers!.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`Error in FileSystem event handler for ${event.type}:`, error);
        }
      });
    }
  }

  // ===================================================================
  // Private Utility Methods
  // ===================================================================

  private getFileExtension(fileName: string): string {
    const lastDot = fileName.lastIndexOf('.');
    return lastDot > 0 ? fileName.substring(lastDot + 1) : '';
  }

  private getLabelFileName(imageFileName: string): string {
    return imageFileName.replace(/\.[^/.]+$/, '.txt');
  }

  private async createImageFromFile(file: File, options?: ImageLoadOptions): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new ImageLoadError(`Failed to load image: ${file.name}`, file.name));
      };
      
      img.src = url;
    });
  }

  private cacheImage(key: string, img: HTMLImageElement, size: number): void {
    // Optimize cache before adding new entry
    if (this.getTotalCacheSize() + size > this.config.maxCacheSize) {
      this.optimizeCache();
    }

    const entry: CacheEntry<HTMLImageElement> = {
      data: img,
      timestamp: new Date(),
      size,
      hits: 0
    };

    this.imageCache.set(key, entry);
  }

  private isCacheValid(entry: CacheEntry<HTMLImageElement>): boolean {
    const now = new Date();
    return now.getTime() - entry.timestamp.getTime() < this.config.cacheTimeout;
  }

  private getTotalCacheSize(): number {
    let total = 0;
    this.imageCache.forEach(entry => {
      total += entry.size;
    });
    return total;
  }
}

// ===================================================================
// Factory Functions
// ===================================================================

/**
 * Create a new FileSystemService instance
 */
export function createFileSystemService(config?: Partial<FileSystemConfig>): FileSystemService {
  return new FileSystemService(config);
}

/**
 * Create FileSystemService with custom cache size
 */
export function createFileSystemServiceWithCache(cacheSize: number): FileSystemService {
  return new FileSystemService({ maxCacheSize: cacheSize });
}

// ===================================================================
// Exports
// ===================================================================

export default FileSystemService;
export type { IFileSystemService, FileSystemConfig };