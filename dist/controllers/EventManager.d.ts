/**
 * Event Manager Implementation
 *
 * Handles keyboard shortcuts, mouse events, context menus, and user interactions
 * for the Easy Labeling application.
 *
 * @version 1.0.0
 * @author Easy Labeling TypeScript Migration
 */
import { IAppState } from '../types/app-state';
import { ICanvasController } from '../types/canvas';
import { IFileSystemService } from '../types/filesystem';
import { EventManagerConfig, KeyboardShortcut, EventManagerEventHandler, IEventManager } from '../types/ui';
export declare class EventManager implements IEventManager {
    private appState;
    private canvasController;
    private fileSystemService;
    private eventListeners;
    private keyboardHandlers;
    private contextMenuTarget;
    private isDragging;
    private lastMousePosition;
    private config;
    private shortcuts;
    constructor(appState: IAppState, canvasController: ICanvasController, fileSystemService: IFileSystemService, config?: Partial<EventManagerConfig>);
    private initializeEventHandlers;
    private setupKeyboardEvents;
    private handleKeyDown;
    private handleKeyUp;
    private executeShortcut;
    private setupMouseEvents;
    private setupCanvasEvents;
    private handleGlobalMouseMove;
    private handleGlobalMouseUp;
    private setupContextMenuEvents;
    private handleContextMenu;
    private showCanvasContextMenu;
    private showGenericContextMenu;
    private showContextMenu;
    private buildContextMenuItems;
    private setupDragAndDropEvents;
    private handleDragOver;
    private handleDragEnter;
    private handleDragLeave;
    private handleDrop;
    private handleImageFileDrop;
    private handleDragMove;
    private handleDragEnd;
    private handleSaveLabels;
    private handleOpenFolder;
    private handleDeleteSelected;
    private handleCancel;
    private handleSelectAll;
    private handlePreviousImage;
    private handleNextImage;
    private handleFirstImage;
    private handleLastImage;
    private handleCopy;
    private handlePaste;
    private handleCut;
    private handleEscapeKey;
    private loadImageFile;
    private loadLabelsForCurrentImage;
    private updateMouseCoordinatesDisplay;
    private hideContextMenu;
    private getShortcutKey;
    private getEventKey;
    private isInputElement;
    private isGlobalShortcut;
    addEventListener(type: string, handler: EventManagerEventHandler): void;
    removeEventListener(type: string, handler: EventManagerEventHandler): void;
    private dispatchEvent;
    getShortcuts(): KeyboardShortcut[];
    setConfig(config: Partial<EventManagerConfig>): void;
    getConfig(): EventManagerConfig;
    destroy(): void;
}
export declare function createEventManager(appState: IAppState, canvasController: ICanvasController, fileSystemService: IFileSystemService, config?: Partial<EventManagerConfig>): EventManager;
export default EventManager;
export type { IEventManager, EventManagerConfig, KeyboardShortcut };
//# sourceMappingURL=EventManager.d.ts.map