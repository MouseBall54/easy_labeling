/**
 * AppState Model - Main Application State Management
 *
 * Centralized state management for the Easy Labeling application.
 * Handles all application state including files, UI settings, cache, and current workspace.
 *
 * @version 1.0.0
 * @author Easy Labeling TypeScript Migration
 */
import { Mode, LabelSortOrder, Point, FileSystemDirectoryHandle } from '../types';
import { IAppState, AppStateConfig, AppStateMethods, AppStateEvent, AppStateEventHandler, ImageFile, ClassFile, ClassDefinition, ClipboardData, LoadToken, AppStateValidation, SerializableAppState } from '../types/app-state';
/**
 * AppState Class
 *
 * Implements the complete application state management with type safety.
 * Provides methods for managing files, UI state, cache, and user interactions.
 */
export declare class AppState implements IAppState {
    imageFolderHandle: FileSystemDirectoryHandle | null;
    labelFolderHandle: FileSystemDirectoryHandle | null;
    classInfoFolderHandle: FileSystemDirectoryHandle | null;
    imageFiles: ImageFile[];
    classFiles: ClassFile[];
    selectedClassFile: ClassFile | null;
    imageLabelStatus: Map<string, boolean>;
    classNames: Map<string, string>;
    previewImageCache: Map<string, string>;
    collapsedLabelGroups: Set<string>;
    currentImageFile: ImageFile | null;
    currentImage: HTMLImageElement | null;
    currentMode: Mode;
    currentLoadToken: LoadToken;
    isAutoSaveEnabled: boolean;
    showLabelsOnCanvas: boolean;
    labelFontSize: number;
    labelSortOrder: LabelSortOrder;
    isPreviewBarHidden: boolean;
    isCrosshairVisible: boolean;
    saveTimeout: NodeJS.Timeout | null;
    _clipboard: ClipboardData | null;
    lastMousePosition: Point;
    contextTarget: any;
    private eventListeners;
    /**
     * Constructor - Initialize AppState with default values
     */
    constructor();
    /**
     * Reset all state to initial values
     */
    reset(): void;
    /**
     * Set the image folder handle
     */
    setImageFolder(handle: FileSystemDirectoryHandle): void;
    /**
     * Set the label folder handle
     */
    setLabelFolder(handle: FileSystemDirectoryHandle): void;
    /**
     * Set the class info folder handle
     */
    setClassInfoFolder(handle: FileSystemDirectoryHandle): void;
    /**
     * Set the current working image
     */
    setCurrentImage(imageFile: ImageFile | null): void;
    /**
     * Get label status for an image
     */
    getImageLabelStatus(fileName: string): boolean;
    /**
     * Set label status for an image
     */
    setImageLabelStatus(fileName: string, hasLabels: boolean): void;
    /**
     * Set the current drawing/editing mode
     */
    setMode(mode: Mode): void;
    /**
     * Toggle between draw and edit modes
     */
    toggleMode(): void;
    /**
     * Select a class file for use
     */
    selectClassFile(classFile: ClassFile | null): void;
    /**
     * Add a class definition
     */
    addClassDefinition(classDef: ClassDefinition): void;
    /**
     * Remove a class definition
     */
    removeClassDefinition(classId: number): void;
    /**
     * Toggle auto-save functionality
     */
    setAutoSave(enabled: boolean): void;
    /**
     * Toggle label visibility on canvas
     */
    setShowLabels(show: boolean): void;
    /**
     * Set label font size
     */
    setLabelFontSize(size: number): void;
    /**
     * Set label sort order
     */
    setLabelSortOrder(order: LabelSortOrder): void;
    /**
     * Toggle preview bar visibility
     */
    togglePreviewBar(): void;
    /**
     * Toggle crosshair visibility
     */
    toggleCrosshair(): void;
    /**
     * Set context menu target
     */
    setContextTarget(target: any): void;
    /**
     * Cache a preview image ObjectURL
     */
    cachePreviewImage(fileName: string, objectURL: string): void;
    /**
     * Get cached preview image ObjectURL
     */
    getCachedPreviewImage(fileName: string): string | undefined;
    /**
     * Clear all preview cache
     */
    clearPreviewCache(): void;
    /**
     * Set clipboard data
     */
    setClipboard(data: ClipboardData): void;
    /**
     * Get clipboard data
     */
    getClipboard(): ClipboardData | null;
    /**
     * Clear clipboard
     */
    clearClipboard(): void;
    /**
     * Add event listener
     */
    addEventListener(type: string, handler: AppStateEventHandler): void;
    /**
     * Remove event listener
     */
    removeEventListener(type: string, handler: AppStateEventHandler): void;
    /**
     * Dispatch event to all listeners
     */
    dispatchEvent(event: AppStateEvent): void;
    /**
     * Validate current state
     */
    validate(): AppStateValidation;
    /**
     * Get serializable state (for persistence)
     */
    getSerializableState(): SerializableAppState;
    /**
     * Restore from serializable state
     */
    restoreFromSerializableState(state: SerializableAppState): void;
    /**
     * Get debug information
     */
    getDebugInfo(): Record<string, any>;
}
/**
 * Create a new AppState instance
 */
export declare function createAppState(): AppState;
/**
 * Create AppState with initial configuration
 */
export declare function createAppStateWithConfig(config: Partial<AppStateConfig>): AppState;
export default AppState;
export type { IAppState, AppStateConfig, AppStateMethods };
//# sourceMappingURL=AppState.d.ts.map