/**
 * AppState Model - Main Application State Management
 * 
 * Centralized state management for the Easy Labeling application.
 * Handles all application state including files, UI settings, cache, and current workspace.
 * 
 * @version 1.0.0
 * @author Easy Labeling TypeScript Migration
 */

import { 
  Mode, 
  LabelSortOrder, 
  Point,
  FileSystemDirectoryHandle, 
  FileSystemFileHandle
} from '../types';

import {
  IAppState,
  AppStateConfig,
  AppStateMethods,
  AppStateEvent,
  AppStateEventHandler,
  ImageFile,
  ClassFile,
  ClassDefinition,
  ClipboardData,
  LoadToken,
  AppStateValidation,
  SerializableAppState
} from '../types/app-state';

/**
 * AppState Class
 * 
 * Implements the complete application state management with type safety.
 * Provides methods for managing files, UI state, cache, and user interactions.
 */
export class AppState implements IAppState {
  // ===================================================================
  // File Handles (File System Access API)
  // ===================================================================
  
  public imageFolderHandle: FileSystemDirectoryHandle | null = null;
  public labelFolderHandle: FileSystemDirectoryHandle | null = null;
  public classInfoFolderHandle: FileSystemDirectoryHandle | null = null;

  // ===================================================================
  // File Data Arrays
  // ===================================================================
  
  public imageFiles: ImageFile[] = [];
  public classFiles: ClassFile[] = [];
  public selectedClassFile: ClassFile | null = null;

  // ===================================================================
  // Status Tracking Maps
  // ===================================================================
  
  public imageLabelStatus = new Map<string, boolean>(); // fileName -> hasLabels
  public classNames = new Map<string, string>(); // classId -> className
  public previewImageCache = new Map<string, string>(); // fileName -> objectURL
  public collapsedLabelGroups = new Set<string>(); // collapsed group IDs

  // ===================================================================
  // Current Working State
  // ===================================================================
  
  public currentImageFile: ImageFile | null = null;
  public currentImage: HTMLImageElement | null = null;
  public currentMode: Mode = 'edit';
  public currentLoadToken: LoadToken = 0;

  // ===================================================================
  // UI Settings & Preferences
  // ===================================================================
  
  public isAutoSaveEnabled: boolean = false;
  public showLabelsOnCanvas: boolean = true;
  public labelFontSize: number = 14;
  public labelSortOrder: LabelSortOrder = 'asc';
  public isPreviewBarHidden: boolean = false;
  public isCrosshairVisible: boolean = false;

  // ===================================================================
  // Internal State & Temporary Data
  // ===================================================================
  
  public saveTimeout: NodeJS.Timeout | null = null;
  public _clipboard: ClipboardData | null = null;
  public lastMousePosition: Point = { x: 0, y: 0 };
  public contextTarget: any = null;

  // ===================================================================
  // Event System
  // ===================================================================
  
  private eventListeners = new Map<string, AppStateEventHandler[]>();

  /**
   * Constructor - Initialize AppState with default values
   */
  constructor() {
    // All properties are already initialized above
    this.dispatchEvent({
      type: 'state:initialized',
      timestamp: new Date()
    });
  }

  // ===================================================================
  // State Management Methods
  // ===================================================================

  /**
   * Reset all state to initial values
   */
  public reset(): void {
    // Clear file handles
    this.imageFolderHandle = null;
    this.labelFolderHandle = null;
    this.classInfoFolderHandle = null;

    // Clear file arrays
    this.imageFiles = [];
    this.classFiles = [];
    this.selectedClassFile = null;

    // Clear maps and sets
    this.imageLabelStatus.clear();
    this.classNames.clear();
    this.collapsedLabelGroups.clear();
    this.clearPreviewCache();

    // Reset current state
    this.currentImageFile = null;
    this.currentImage = null;
    this.currentMode = 'edit';
    this.currentLoadToken = 0;

    // Reset UI settings to defaults
    this.isAutoSaveEnabled = false;
    this.showLabelsOnCanvas = true;
    this.labelFontSize = 14;
    this.labelSortOrder = 'asc';
    this.isPreviewBarHidden = false;
    this.isCrosshairVisible = false;

    // Clear internal state
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
    this._clipboard = null;
    this.lastMousePosition = { x: 0, y: 0 };
    this.contextTarget = null;

    this.dispatchEvent({
      type: 'state:reset',
      timestamp: new Date()
    });
  }

  // ===================================================================
  // File Operations
  // ===================================================================

  /**
   * Set the image folder handle
   */
  public setImageFolder(handle: FileSystemDirectoryHandle): void {
    this.imageFolderHandle = handle;
    this.dispatchEvent({
      type: 'folder:image-set',
      data: { name: handle.name },
      timestamp: new Date()
    });
  }

  /**
   * Set the label folder handle
   */
  public setLabelFolder(handle: FileSystemDirectoryHandle): void {
    this.labelFolderHandle = handle;
    this.dispatchEvent({
      type: 'folder:label-set',
      data: { name: handle.name },
      timestamp: new Date()
    });
  }

  /**
   * Set the class info folder handle
   */
  public setClassInfoFolder(handle: FileSystemDirectoryHandle): void {
    this.classInfoFolderHandle = handle;
    this.dispatchEvent({
      type: 'folder:class-info-set',
      data: { name: handle.name },
      timestamp: new Date()
    });
  }

  // ===================================================================
  // Image Operations
  // ===================================================================

  /**
   * Set the current working image
   */
  public setCurrentImage(imageFile: ImageFile | null): void {
    const previousImage = this.currentImageFile;
    this.currentImageFile = imageFile;
    
    // Increment load token to prevent race conditions
    this.currentLoadToken += 1;

    this.dispatchEvent({
      type: 'image:current-changed',
      data: { 
        previous: previousImage?.name || null,
        current: imageFile?.name || null,
        loadToken: this.currentLoadToken
      },
      timestamp: new Date()
    });
  }

  /**
   * Get label status for an image
   */
  public getImageLabelStatus(fileName: string): boolean {
    return this.imageLabelStatus.get(fileName) || false;
  }

  /**
   * Set label status for an image
   */
  public setImageLabelStatus(fileName: string, hasLabels: boolean): void {
    this.imageLabelStatus.set(fileName, hasLabels);
    this.dispatchEvent({
      type: 'image:label-status-changed',
      data: { fileName, hasLabels },
      timestamp: new Date()
    });
  }

  // ===================================================================
  // Mode Operations
  // ===================================================================

  /**
   * Set the current drawing/editing mode
   */
  public setMode(mode: Mode): void {
    const previousMode = this.currentMode;
    this.currentMode = mode;
    this.dispatchEvent({
      type: 'mode:changed',
      data: { previous: previousMode, current: mode },
      timestamp: new Date()
    });
  }

  /**
   * Toggle between draw and edit modes
   */
  public toggleMode(): void {
    const newMode: Mode = this.currentMode === 'edit' ? 'draw' : 'edit';
    this.setMode(newMode);
  }

  // ===================================================================
  // Class Operations
  // ===================================================================

  /**
   * Select a class file for use
   */
  public selectClassFile(classFile: ClassFile | null): void {
    this.selectedClassFile = classFile;
    this.dispatchEvent({
      type: 'class:file-selected',
      data: { fileName: classFile?.name || null },
      timestamp: new Date()
    });
  }

  /**
   * Add a class definition
   */
  public addClassDefinition(classDef: ClassDefinition): void {
    this.classNames.set(classDef.id.toString(), classDef.name);
    this.dispatchEvent({
      type: 'class:definition-added',
      data: classDef,
      timestamp: new Date()
    });
  }

  /**
   * Remove a class definition
   */
  public removeClassDefinition(classId: number): void {
    this.classNames.delete(classId.toString());
    this.dispatchEvent({
      type: 'class:definition-removed',
      data: { classId },
      timestamp: new Date()
    });
  }

  // ===================================================================
  // Settings Operations
  // ===================================================================

  /**
   * Toggle auto-save functionality
   */
  public setAutoSave(enabled: boolean): void {
    this.isAutoSaveEnabled = enabled;
    this.dispatchEvent({
      type: 'settings:auto-save-changed',
      data: { enabled },
      timestamp: new Date()
    });
  }

  /**
   * Toggle label visibility on canvas
   */
  public setShowLabels(show: boolean): void {
    this.showLabelsOnCanvas = show;
    this.dispatchEvent({
      type: 'settings:show-labels-changed',
      data: { show },
      timestamp: new Date()
    });
  }

  /**
   * Set label font size
   */
  public setLabelFontSize(size: number): void {
    if (size >= 8 && size <= 48) {
      this.labelFontSize = size;
      this.dispatchEvent({
        type: 'settings:font-size-changed',
        data: { size },
        timestamp: new Date()
      });
    }
  }

  /**
   * Set label sort order
   */
  public setLabelSortOrder(order: LabelSortOrder): void {
    this.labelSortOrder = order;
    this.dispatchEvent({
      type: 'settings:sort-order-changed',
      data: { order },
      timestamp: new Date()
    });
  }

  // ===================================================================
  // UI State Operations
  // ===================================================================

  /**
   * Toggle preview bar visibility
   */
  public togglePreviewBar(): void {
    this.isPreviewBarHidden = !this.isPreviewBarHidden;
    this.dispatchEvent({
      type: 'ui:preview-bar-toggled',
      data: { hidden: this.isPreviewBarHidden },
      timestamp: new Date()
    });
  }

  /**
   * Toggle crosshair visibility
   */
  public toggleCrosshair(): void {
    this.isCrosshairVisible = !this.isCrosshairVisible;
    this.dispatchEvent({
      type: 'ui:crosshair-toggled',
      data: { visible: this.isCrosshairVisible },
      timestamp: new Date()
    });
  }

  /**
   * Set context menu target
   */
  public setContextTarget(target: any): void {
    this.contextTarget = target;
    this.dispatchEvent({
      type: 'ui:context-target-set',
      data: { target },
      timestamp: new Date()
    });
  }

  // ===================================================================
  // Cache Operations
  // ===================================================================

  /**
   * Cache a preview image ObjectURL
   */
  public cachePreviewImage(fileName: string, objectURL: string): void {
    this.previewImageCache.set(fileName, objectURL);
    this.dispatchEvent({
      type: 'cache:preview-cached',
      data: { fileName },
      timestamp: new Date()
    });
  }

  /**
   * Get cached preview image ObjectURL
   */
  public getCachedPreviewImage(fileName: string): string | undefined {
    return this.previewImageCache.get(fileName);
  }

  /**
   * Clear all preview cache
   */
  public clearPreviewCache(): void {
    // Revoke all ObjectURLs to prevent memory leaks
    for (const objectURL of this.previewImageCache.values()) {
      URL.revokeObjectURL(objectURL);
    }
    this.previewImageCache.clear();
    this.dispatchEvent({
      type: 'cache:preview-cleared',
      timestamp: new Date()
    });
  }

  // ===================================================================
  // Clipboard Operations
  // ===================================================================

  /**
   * Set clipboard data
   */
  public setClipboard(data: ClipboardData): void {
    this._clipboard = data;
    this.dispatchEvent({
      type: 'clipboard:data-set',
      data: { type: data.type },
      timestamp: new Date()
    });
  }

  /**
   * Get clipboard data
   */
  public getClipboard(): ClipboardData | null {
    return this._clipboard;
  }

  /**
   * Clear clipboard
   */
  public clearClipboard(): void {
    this._clipboard = null;
    this.dispatchEvent({
      type: 'clipboard:cleared',
      timestamp: new Date()
    });
  }

  // ===================================================================
  // Event System Implementation
  // ===================================================================

  /**
   * Add event listener
   */
  public addEventListener(type: string, handler: AppStateEventHandler): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, []);
    }
    this.eventListeners.get(type)!.push(handler);
  }

  /**
   * Remove event listener
   */
  public removeEventListener(type: string, handler: AppStateEventHandler): void {
    const handlers = this.eventListeners.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Dispatch event to all listeners
   */
  public dispatchEvent(event: AppStateEvent): void {
    const handlers = this.eventListeners.get(event.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`Error in event handler for ${event.type}:`, error);
        }
      });
    }
  }

  // ===================================================================
  // Utility Methods
  // ===================================================================

  /**
   * Validate current state
   */
  public validate(): AppStateValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for required folders
    if (!this.imageFolderHandle) {
      warnings.push('No image folder selected');
    }

    if (!this.labelFolderHandle) {
      warnings.push('No label folder selected');
    }

    // Check font size range
    if (this.labelFontSize < 8 || this.labelFontSize > 48) {
      errors.push('Label font size must be between 8 and 48');
    }

    // Check for memory leaks in cache
    if (this.previewImageCache.size > 100) {
      warnings.push('Preview cache is large, consider clearing');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get serializable state (for persistence)
   */
  public getSerializableState(): SerializableAppState {
    return {
      currentMode: this.currentMode,
      isAutoSaveEnabled: this.isAutoSaveEnabled,
      showLabelsOnCanvas: this.showLabelsOnCanvas,
      labelFontSize: this.labelFontSize,
      labelSortOrder: this.labelSortOrder,
      isPreviewBarHidden: this.isPreviewBarHidden,
      isCrosshairVisible: this.isCrosshairVisible
    };
  }

  /**
   * Restore from serializable state
   */
  public restoreFromSerializableState(state: SerializableAppState): void {
    this.currentMode = state.currentMode;
    this.isAutoSaveEnabled = state.isAutoSaveEnabled;
    this.showLabelsOnCanvas = state.showLabelsOnCanvas;
    this.labelFontSize = state.labelFontSize;
    this.labelSortOrder = state.labelSortOrder;
    this.isPreviewBarHidden = state.isPreviewBarHidden;
    this.isCrosshairVisible = state.isCrosshairVisible;

    this.dispatchEvent({
      type: 'state:restored',
      data: state,
      timestamp: new Date()
    });
  }

  /**
   * Get debug information
   */
  public getDebugInfo(): Record<string, any> {
    return {
      imageFilesCount: this.imageFiles.length,
      classFilesCount: this.classFiles.length,
      imageLabelStatusCount: this.imageLabelStatus.size,
      classNamesCount: this.classNames.size,
      previewCacheSize: this.previewImageCache.size,
      collapsedGroupsCount: this.collapsedLabelGroups.size,
      currentLoadToken: this.currentLoadToken,
      hasImageFolder: !!this.imageFolderHandle,
      hasLabelFolder: !!this.labelFolderHandle,
      hasClassInfoFolder: !!this.classInfoFolderHandle,
      currentImageName: this.currentImageFile?.name || null,
      selectedClassFileName: this.selectedClassFile?.name || null,
      eventListenerTypes: Array.from(this.eventListeners.keys())
    };
  }
}

// ===================================================================
// Factory Function
// ===================================================================

/**
 * Create a new AppState instance
 */
export function createAppState(): AppState {
  return new AppState();
}

/**
 * Create AppState with initial configuration
 */
export function createAppStateWithConfig(config: Partial<AppStateConfig>): AppState {
  const appState = new AppState();
  
  // Apply configuration
  Object.keys(config).forEach(key => {
    if (key in appState) {
      (appState as any)[key] = (config as any)[key];
    }
  });

  return appState;
}

// ===================================================================
// Exports
// ===================================================================

export default AppState;
export type { IAppState, AppStateConfig, AppStateMethods };