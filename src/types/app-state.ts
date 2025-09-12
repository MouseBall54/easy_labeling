/**
 * AppState Type Definitions
 * 
 * Types related to the main application state management.
 */

import { 
  Point, 
  Mode, 
  LabelSortOrder, 
  FileSystemDirectoryHandle, 
  FileSystemFileHandle 
} from './index';

// Image file representation
export interface ImageFile {
  name: string;
  handle: FileSystemFileHandle;
  path: string;
  extension: string;
  size?: number;
  lastModified?: Date;
}

// Class file representation
export interface ClassFile {
  name: string;
  handle: FileSystemFileHandle;
  content: ClassDefinition[];
  isSelected: boolean;
}

// Class definition structure
export interface ClassDefinition {
  id: number;
  name: string;
  description?: string;
  color?: string;
}

// Clipboard data structure
export interface ClipboardData {
  type: 'label' | 'labels';
  data: any;
  timestamp: Date;
}

// Load token for preventing race conditions
export type LoadToken = number;

// Main AppState configuration interface
export interface AppStateConfig {
  // Folder handles
  imageFolderHandle: FileSystemDirectoryHandle | null;
  labelFolderHandle: FileSystemDirectoryHandle | null;
  classInfoFolderHandle: FileSystemDirectoryHandle | null;
  
  // File arrays
  imageFiles: ImageFile[];
  classFiles: ClassFile[];
  selectedClassFile: ClassFile | null;
  
  // Status tracking
  imageLabelStatus: Map<string, boolean>; // fileName -> hasLabels
  
  // Current state
  currentImageFile: ImageFile | null;
  currentImage: HTMLImageElement | null;
  currentMode: Mode;
  currentLoadToken: LoadToken;
  
  // UI settings
  isAutoSaveEnabled: boolean;
  showLabelsOnCanvas: boolean;
  labelFontSize: number;
  labelSortOrder: LabelSortOrder;
  isPreviewBarHidden: boolean;
  isCrosshairVisible: boolean;
  
  // Internal state
  saveTimeout: NodeJS.Timeout | null;
  _clipboard: ClipboardData | null;
  lastMousePosition: Point;
  
  // Data maps
  classNames: Map<string, string>; // classId -> className
  previewImageCache: Map<string, string>; // fileName -> objectURL
  
  // UI state
  contextTarget: any; // Target element for context menu
  collapsedLabelGroups: Set<string>; // Set of collapsed group IDs
}

// AppState events
export interface AppStateEvent {
  type: string;
  data?: any;
  timestamp: Date;
}

export type AppStateEventHandler = (event: AppStateEvent) => void;

// AppState methods interface (for future implementation)
export interface AppStateMethods {
  // State management
  reset(): void;
  
  // File operations
  setImageFolder(handle: FileSystemDirectoryHandle): void;
  setLabelFolder(handle: FileSystemDirectoryHandle): void;
  setClassInfoFolder(handle: FileSystemDirectoryHandle): void;
  
  // Image operations
  setCurrentImage(imageFile: ImageFile | null): void;
  getImageLabelStatus(fileName: string): boolean;
  setImageLabelStatus(fileName: string, hasLabels: boolean): void;
  
  // Mode operations
  setMode(mode: Mode): void;
  toggleMode(): void;
  
  // Class operations
  selectClassFile(classFile: ClassFile | null): void;
  addClassDefinition(classDef: ClassDefinition): void;
  removeClassDefinition(classId: number): void;
  
  // Settings
  setAutoSave(enabled: boolean): void;
  setShowLabels(show: boolean): void;
  setLabelFontSize(size: number): void;
  setLabelSortOrder(order: LabelSortOrder): void;
  
  // UI state
  togglePreviewBar(): void;
  toggleCrosshair(): void;
  setContextTarget(target: any): void;
  
  // Cache operations
  cachePreviewImage(fileName: string, objectURL: string): void;
  getCachedPreviewImage(fileName: string): string | undefined;
  clearPreviewCache(): void;
  
  // Clipboard operations
  setClipboard(data: ClipboardData): void;
  getClipboard(): ClipboardData | null;
  clearClipboard(): void;
}

// Combined interface for the AppState class
export interface IAppState extends AppStateConfig, AppStateMethods {
  // Event system
  addEventListener(type: string, handler: AppStateEventHandler): void;
  removeEventListener(type: string, handler: AppStateEventHandler): void;
  dispatchEvent(event: AppStateEvent): void;
}

// Factory function return type
export interface AppStateFactory {
  create(): IAppState;
  createWithConfig(config: Partial<AppStateConfig>): IAppState;
}

// Validation types
export interface AppStateValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Serialization types (for persistence)
export interface SerializableAppState {
  currentMode: Mode;
  isAutoSaveEnabled: boolean;
  showLabelsOnCanvas: boolean;
  labelFontSize: number;
  labelSortOrder: LabelSortOrder;
  isPreviewBarHidden: boolean;
  isCrosshairVisible: boolean;
  // Note: File handles cannot be serialized
}

// Migration types (for future versions)
export interface AppStateMigration {
  fromVersion: string;
  toVersion: string;
  migrate(oldState: any): AppStateConfig;
}

export type AppStateVersion = '1.0.0' | '1.1.0' | '2.0.0';