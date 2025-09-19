/**
 * Event Manager Implementation
 *
 * Handles keyboard shortcuts, mouse events, context menus, and user interactions
 * for the Easy Labeling application.
 *
 * @version 1.0.0
 * @author Easy Labeling TypeScript Migration
 */

import { Point } from '../types';
import { IAppState } from '../types/app-state';
import { ICanvasController, BoundingBox } from '../types/canvas';
import { IFileSystemService } from '../types/filesystem';
import {
  EventManagerConfig,
  KeyboardShortcut,
  MouseEventType,
  ContextMenuEvent,
  EventManagerEvent,
  EventManagerEventHandler,
  IEventManager
} from '../types/ui';

// ===================================================================
// Event Manager Implementation
// ===================================================================

export class EventManager implements IEventManager {
  // Dependencies
  private appState: IAppState;
  private canvasController: ICanvasController;
  private fileSystemService: IFileSystemService;

  // Event handlers and state
  private eventListeners = new Map<string, EventManagerEventHandler[]>();
  private keyboardHandlers = new Map<string, KeyboardShortcut>();
  private contextMenuTarget: any = null;
  private isDragging = false;
  private lastMousePosition: Point = { x: 0, y: 0 };

  // Configuration
  private config: EventManagerConfig = {
    enableKeyboardShortcuts: true,
    enableContextMenu: true,
    enableDragAndDrop: true,
    doubleClickDelay: 300,
    longPressDelay: 500,
    dragThreshold: 5
  };

  // Keyboard shortcuts
  private shortcuts: KeyboardShortcut[] = [
    // File operations
    { key: 'KeyS', ctrlKey: true, description: 'Save labels', action: 'save' },
    { key: 'KeyO', ctrlKey: true, description: 'Open folder', action: 'open-folder' },

    // Mode switching
    { key: 'KeyD', description: 'Switch to draw mode', action: 'mode-draw' },
    { key: 'KeyE', description: 'Switch to edit mode', action: 'mode-edit' },
    { key: 'Tab', description: 'Toggle mode', action: 'mode-toggle' },

    // Canvas operations
    { key: 'Delete', description: 'Delete selected', action: 'delete-selected' },
    { key: 'Backspace', description: 'Delete selected', action: 'delete-selected' },
    { key: 'Escape', description: 'Cancel/Deselect', action: 'cancel' },
    { key: 'KeyA', ctrlKey: true, description: 'Select all', action: 'select-all' },

    // Zoom and view
    { key: 'Equal', ctrlKey: true, description: 'Zoom in', action: 'zoom-in' },
    { key: 'Minus', ctrlKey: true, description: 'Zoom out', action: 'zoom-out' },
    { key: 'Digit0', ctrlKey: true, description: 'Reset zoom', action: 'zoom-reset' },
    { key: 'KeyF', description: 'Zoom to fit', action: 'zoom-fit' },

    // Navigation
    { key: 'ArrowLeft', description: 'Previous image', action: 'prev-image' },
    { key: 'ArrowRight', description: 'Next image', action: 'next-image' },
    { key: 'Home', description: 'First image', action: 'first-image' },
    { key: 'End', description: 'Last image', action: 'last-image' },

    // Labels and classes
    { key: 'KeyL', description: 'Toggle labels visibility', action: 'toggle-labels' },
    { key: 'KeyC', description: 'Toggle crosshair', action: 'toggle-crosshair' },
    { key: 'KeyH', description: 'Toggle help', action: 'toggle-help' },

    // Copy/Paste
    { key: 'KeyC', ctrlKey: true, description: 'Copy selected', action: 'copy' },
    { key: 'KeyV', ctrlKey: true, description: 'Paste', action: 'paste' },
    { key: 'KeyX', ctrlKey: true, description: 'Cut selected', action: 'cut' },

    // Undo/Redo (for future implementation)
    { key: 'KeyZ', ctrlKey: true, description: 'Undo', action: 'undo' },
    { key: 'KeyY', ctrlKey: true, description: 'Redo', action: 'redo' },
    { key: 'KeyZ', ctrlKey: true, shiftKey: true, description: 'Redo', action: 'redo' }
  ];

  constructor(
    appState: IAppState,
    canvasController: ICanvasController,
    fileSystemService: IFileSystemService,
    config?: Partial<EventManagerConfig>
  ) {
    this.appState = appState;
    this.canvasController = canvasController;
    this.fileSystemService = fileSystemService;

    if (config) {
      this.config = { ...this.config, ...config };
    }

    this.initializeEventHandlers();
  }

  // ===================================================================
  // Initialization
  // ===================================================================

  private initializeEventHandlers(): void {
    if (this.config.enableKeyboardShortcuts) {
      this.setupKeyboardEvents();
    }

    if (this.config.enableContextMenu) {
      this.setupContextMenuEvents();
    }

    if (this.config.enableDragAndDrop) {
      this.setupDragAndDropEvents();
    }

    this.setupMouseEvents();
    this.setupCanvasEvents();
  }

  // ===================================================================
  // Keyboard Event Handling
  // ===================================================================

  private setupKeyboardEvents(): void {
    // Build keyboard shortcuts map
    this.shortcuts.forEach(shortcut => {
      const key = this.getShortcutKey(shortcut);
      this.keyboardHandlers.set(key, shortcut);
    });

    // Global keyboard event listener
    document.addEventListener('keydown', this.handleKeyDown.bind(this), true);
    document.addEventListener('keyup', this.handleKeyUp.bind(this), true);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    // Ignore events from input elements (unless global shortcuts)
    if (this.isInputElement(event.target as Element) && !this.isGlobalShortcut(event)) {
      return;
    }

    const key = this.getEventKey(event);
    const shortcut = this.keyboardHandlers.get(key);

    if (shortcut) {
      event.preventDefault();
      event.stopPropagation();
      this.executeShortcut(shortcut, event);
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    // Handle any key up specific logic here
    if (event.key === 'Escape') {
      this.handleEscapeKey();
    }
  }

  private executeShortcut(shortcut: KeyboardShortcut, event: KeyboardEvent): void {
    switch (shortcut.action) {
      // File operations
      case 'save':
        this.handleSaveLabels();
        break;
      case 'open-folder':
        this.handleOpenFolder();
        break;

      // Mode switching
      case 'mode-draw':
        this.appState.setMode('draw');
        break;
      case 'mode-edit':
        this.appState.setMode('edit');
        break;
      case 'mode-toggle':
        this.appState.toggleMode();
        break;

      // Canvas operations
      case 'delete-selected':
        this.handleDeleteSelected();
        break;
      case 'cancel':
        this.handleCancel();
        break;
      case 'select-all':
        this.handleSelectAll();
        break;

      // Zoom and view
      case 'zoom-in':
        this.canvasController.zoomIn();
        break;
      case 'zoom-out':
        this.canvasController.zoomOut();
        break;
      case 'zoom-reset':
        this.canvasController.resetZoom();
        break;
      case 'zoom-fit':
        this.canvasController.zoomToFit();
        break;

      // Navigation
      case 'prev-image':
        this.handlePreviousImage();
        break;
      case 'next-image':
        this.handleNextImage();
        break;
      case 'first-image':
        this.handleFirstImage();
        break;
      case 'last-image':
        this.handleLastImage();
        break;

      // Labels and UI
      case 'toggle-labels':
        this.appState.setShowLabels(!this.appState.showLabelsOnCanvas);
        this.canvasController.updateLabels();
        break;
      case 'toggle-crosshair':
        this.appState.toggleCrosshair();
        break;

      // Copy/Paste
      case 'copy':
        this.handleCopy();
        break;
      case 'paste':
        this.handlePaste();
        break;
      case 'cut':
        this.handleCut();
        break;

      // Future features
      case 'undo':
      case 'redo':
        // TODO: Implement undo/redo system
        console.log(`${shortcut.action} not yet implemented`);
        break;

      default:
        console.warn(`Unknown shortcut action: ${shortcut.action}`);
    }

    this.dispatchEvent({
      type: 'shortcut:executed',
      data: { shortcut, originalEvent: event }
    });
  }

  // ===================================================================
  // Mouse Event Handling
  // ===================================================================

  private setupMouseEvents(): void {
    // Global mouse tracking
    document.addEventListener('mousemove', this.handleGlobalMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleGlobalMouseUp.bind(this));
  }

  private setupCanvasEvents(): void {
    // Canvas-specific mouse events are handled by CanvasController
    // We listen to canvas events and coordinate with other systems

    this.canvasController.addEventListener('mouse:down', (event) => {
      this.lastMousePosition = event.pointer || { x: 0, y: 0 };
      this.appState.lastMousePosition = this.lastMousePosition;
    });

    this.canvasController.addEventListener('mouse:move', (event) => {
      this.lastMousePosition = event.pointer || { x: 0, y: 0 };
      this.appState.lastMousePosition = this.lastMousePosition;
      this.updateMouseCoordinatesDisplay();
    });

    this.canvasController.addEventListener('selection:created', () => {
      this.dispatchEvent({
        type: 'selection:changed',
        data: { hasSelection: true }
      });
    });

    this.canvasController.addEventListener('selection:cleared', () => {
      this.dispatchEvent({
        type: 'selection:changed',
        data: { hasSelection: false }
      });
    });
  }

  private handleGlobalMouseMove(event: MouseEvent): void {
    if (this.isDragging) {
      // Handle drag operations
      this.handleDragMove(event);
    }
  }

  private handleGlobalMouseUp(event: MouseEvent): void {
    if (this.isDragging) {
      this.handleDragEnd(event);
    }
  }

  // ===================================================================
  // Context Menu Handling
  // ===================================================================

  private setupContextMenuEvents(): void {
    // Prevent default context menu and show custom one
    document.addEventListener('contextmenu', this.handleContextMenu.bind(this));
  }

  private handleContextMenu(event: MouseEvent): void {
    event.preventDefault();

    const target = event.target as Element;
    const canvasElement = this.canvasController.canvas.getElement();

    if (target === canvasElement || canvasElement.contains(target)) {
      this.showCanvasContextMenu(event);
    } else {
      this.showGenericContextMenu(event);
    }
  }

  private showCanvasContextMenu(event: MouseEvent): void {
    const pointer = this.canvasController.canvas.getPointer(event);
    const selectedBoxes = this.canvasController.getSelectedBoundingBoxes();

    const contextEvent: ContextMenuEvent = {
      type: 'canvas',
      position: { x: event.clientX, y: event.clientY },
      canvasPosition: pointer,
      target: null,
      hasSelection: selectedBoxes.length > 0,
      selectedObjects: selectedBoxes
    };

    this.showContextMenu(contextEvent);
  }

  private showGenericContextMenu(event: MouseEvent): void {
    const contextEvent: ContextMenuEvent = {
      type: 'generic',
      position: { x: event.clientX, y: event.clientY },
      target: event.target,
      hasSelection: false,
      selectedObjects: []
    };

    this.showContextMenu(contextEvent);
  }

  private showContextMenu(contextEvent: ContextMenuEvent): void {
    this.contextMenuTarget = contextEvent;

    // Create context menu based on type and selection
    const menuItems = this.buildContextMenuItems(contextEvent);

    // Show context menu (this would integrate with UI framework)
    this.dispatchEvent({
      type: 'context-menu:show',
      data: { context: contextEvent, menuItems }
    });
  }

  private buildContextMenuItems(context: ContextMenuEvent): any[] {
    const items: any[] = [];

    if (context.type === 'canvas') {
      if (context.hasSelection) {
        items.push(
          { label: 'Delete Selected', action: 'delete-selected', shortcut: 'Del' },
          { label: 'Copy', action: 'copy', shortcut: 'Ctrl+C' },
          { label: 'Cut', action: 'cut', shortcut: 'Ctrl+X' },
          { type: 'separator' }
        );
      }

      items.push(
        { label: 'Paste', action: 'paste', shortcut: 'Ctrl+V', disabled: !this.appState.getClipboard() },
        { type: 'separator' },
        { label: 'Select All', action: 'select-all', shortcut: 'Ctrl+A' },
        { label: 'Deselect All', action: 'deselect-all', shortcut: 'Esc' },
        { type: 'separator' },
        { label: 'Zoom to Fit', action: 'zoom-fit', shortcut: 'F' },
        { label: 'Reset Zoom', action: 'zoom-reset', shortcut: 'Ctrl+0' }
      );
    }

    return items;
  }

  // ===================================================================
  // Drag and Drop Handling
  // ===================================================================

  private setupDragAndDropEvents(): void {
    // File drag and drop for loading images
    document.addEventListener('dragover', this.handleDragOver.bind(this));
    document.addEventListener('drop', this.handleDrop.bind(this));
    document.addEventListener('dragenter', this.handleDragEnter.bind(this));
    document.addEventListener('dragleave', this.handleDragLeave.bind(this));
  }

  private handleDragOver(event: DragEvent): void {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'copy';
  }

  private handleDragEnter(event: DragEvent): void {
    event.preventDefault();
    // Add visual feedback for drag operation
    document.body.classList.add('drag-active');
  }

  private handleDragLeave(event: DragEvent): void {
    if (!event.relatedTarget) {
      document.body.classList.remove('drag-active');
    }
  }

  private handleDrop(event: DragEvent): void {
    event.preventDefault();
    document.body.classList.remove('drag-active');

    const files = Array.from(event.dataTransfer?.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length > 0) {
      this.handleImageFileDrop(imageFiles[0]!);
    }
  }

  private handleImageFileDrop(file: File): void {
    const img = new Image();
    img.onload = () => {
      this.canvasController.loadImage(img);
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  }

  private handleDragMove(event: MouseEvent): void {
    // Handle object dragging within canvas
    // This is mostly handled by Fabric.js, but we can add custom logic here
  }

  private handleDragEnd(event: MouseEvent): void {
    this.isDragging = false;
  }

  // ===================================================================
  // Action Handlers
  // ===================================================================

  private async handleSaveLabels(): Promise<void> {
    if (!this.appState.currentImageFile || !this.appState.labelFolderHandle) {
      return;
    }

    try {
      const boundingBoxes = this.canvasController.getAllBoundingBoxes();
      const yoloLabels = boundingBoxes.map(bbox =>
        this.canvasController.boundingBoxToYOLO(bbox, {
          width: this.appState.currentImage?.width || 1,
          height: this.appState.currentImage?.height || 1
        })
      );

      await this.fileSystemService.saveLabels(
        this.appState.currentImageFile.name,
        yoloLabels,
        this.appState.labelFolderHandle
      );

      this.dispatchEvent({
        type: 'labels:saved',
        data: { fileName: this.appState.currentImageFile.name, count: yoloLabels.length }
      });
    } catch (error) {
      console.error('Failed to save labels:', error);
    }
  }

  private handleOpenFolder(): void {
    // Trigger folder selection UI
    this.dispatchEvent({
      type: 'folder:select-requested',
      data: { type: 'image' }
    });
  }

  private handleDeleteSelected(): void {
    const deletedBoxes = this.canvasController.deleteSelected();
    if (deletedBoxes.length > 0) {
      this.dispatchEvent({
        type: 'objects:deleted',
        data: { count: deletedBoxes.length, objects: deletedBoxes }
      });

      // Auto-save if enabled
      if (this.appState.isAutoSaveEnabled) {
        this.handleSaveLabels();
      }
    }
  }

  private handleCancel(): void {
    this.canvasController.deselectAll();
    this.canvasController.cancelDrawing();

    if (this.contextMenuTarget) {
      this.hideContextMenu();
    }
  }

  private handleSelectAll(): void {
    // Select all bounding boxes on canvas
    const allBoxes = this.canvasController.getAllBoundingBoxes();
    allBoxes.forEach(bbox => {
      this.canvasController.selectBoundingBox(bbox.id);
    });
  }

  private handlePreviousImage(): void {
    if (this.appState.imageFiles.length === 0) return;

    const currentIndex = this.appState.imageFiles.findIndex(
      file => file.name === this.appState.currentImageFile?.name
    );

    if (currentIndex > 0) {
      const prevImage = this.appState.imageFiles[currentIndex - 1]!;
      this.loadImageFile(prevImage);
    }
  }

  private handleNextImage(): void {
    if (this.appState.imageFiles.length === 0) return;

    const currentIndex = this.appState.imageFiles.findIndex(
      file => file.name === this.appState.currentImageFile?.name
    );

    if (currentIndex < this.appState.imageFiles.length - 1) {
      const nextImage = this.appState.imageFiles[currentIndex + 1]!;
      this.loadImageFile(nextImage);
    }
  }

  private handleFirstImage(): void {
    if (this.appState.imageFiles.length > 0) {
      this.loadImageFile(this.appState.imageFiles[0]!);
    }
  }

  private handleLastImage(): void {
    if (this.appState.imageFiles.length > 0) {
      const lastImage = this.appState.imageFiles[this.appState.imageFiles.length - 1]!;
      this.loadImageFile(lastImage);
    }
  }

  private handleCopy(): void {
    const selectedBoxes = this.canvasController.getSelectedBoundingBoxes();
    if (selectedBoxes.length > 0) {
      this.appState.setClipboard({
        type: 'bounding-boxes',
        data: selectedBoxes,
        timestamp: new Date()
      });

      this.dispatchEvent({
        type: 'clipboard:copy',
        data: { count: selectedBoxes.length }
      });
    }
  }

  private handlePaste(): void {
    const clipboard = this.appState.getClipboard();
    if (clipboard && clipboard.type === 'bounding-boxes') {
      const boxes = clipboard.data as BoundingBox[];

      boxes.forEach((bbox, index) => {
        // Offset pasted boxes slightly
        const newBbox: BoundingBox = {
          ...bbox,
          id: `pasted_${Date.now()}_${index}`,
          x: bbox.x + 10,
          y: bbox.y + 10,
          isSelected: false
        };

        this.canvasController.addBoundingBox(newBbox);
      });

      this.dispatchEvent({
        type: 'clipboard:paste',
        data: { count: boxes.length }
      });

      // Auto-save if enabled
      if (this.appState.isAutoSaveEnabled) {
        this.handleSaveLabels();
      }
    }
  }

  private handleCut(): void {
    this.handleCopy();
    this.handleDeleteSelected();
  }

  private handleEscapeKey(): void {
    // Cancel any active operations
    this.handleCancel();
  }

  // ===================================================================
  // Utility Methods
  // ===================================================================

  private async loadImageFile(imageFile: any): Promise<void> {
    try {
      if (this.appState.imageFolderHandle) {
        const result = await this.fileSystemService.loadImage(imageFile.handle);
        if (result.success && result.data) {
          this.appState.setCurrentImage(imageFile);
          this.canvasController.loadImage(result.data);

          // Load existing labels
          if (this.appState.labelFolderHandle) {
            await this.loadLabelsForCurrentImage();
          }
        }
      }
    } catch (error) {
      console.error('Failed to load image:', error);
    }
  }

  private async loadLabelsForCurrentImage(): Promise<void> {
    if (!this.appState.currentImageFile || !this.appState.labelFolderHandle) return;

    try {
      const result = await this.fileSystemService.loadLabels(
        this.appState.currentImageFile.name,
        this.appState.labelFolderHandle
      );

      if (result.success && result.data) {
        // Clear existing labels
        this.canvasController.getAllBoundingBoxes().forEach(bbox => {
          this.canvasController.removeBoundingBox(bbox.id);
        });

        // Add loaded labels
        result.data.forEach(yoloLabel => {
          const bbox = this.canvasController.yoloToBoundingBox(yoloLabel, {
            width: this.appState.currentImage?.width || 1,
            height: this.appState.currentImage?.height || 1
          });
          this.canvasController.addBoundingBox(bbox);
        });
      }
    } catch (error) {
      console.error('Failed to load labels:', error);
    }
  }

  private updateMouseCoordinatesDisplay(): void {
    // Update mouse coordinates in UI
    this.dispatchEvent({
      type: 'mouse:coordinates-updated',
      data: {
        canvas: this.lastMousePosition,
        image: this.canvasController.canvasToImage(this.lastMousePosition)
      }
    });
  }

  private hideContextMenu(): void {
    this.contextMenuTarget = null;
    this.dispatchEvent({
      type: 'context-menu:hide'
    });
  }

  private getShortcutKey(shortcut: KeyboardShortcut): string {
    let key = shortcut.key;
    if (shortcut.ctrlKey) key = 'Ctrl+' + key;
    if (shortcut.shiftKey) key = 'Shift+' + key;
    if (shortcut.altKey) key = 'Alt+' + key;
    return key;
  }

  private getEventKey(event: KeyboardEvent): string {
    let key = event.code;
    if (event.ctrlKey || event.metaKey) key = 'Ctrl+' + key;
    if (event.shiftKey) key = 'Shift+' + key;
    if (event.altKey) key = 'Alt+' + key;
    return key;
  }

  private isInputElement(element: Element): boolean {
    const tagName = element.tagName.toLowerCase();
    return ['input', 'textarea', 'select', 'option'].includes(tagName) ||
           element.hasAttribute('contenteditable');
  }

  private isGlobalShortcut(event: KeyboardEvent): boolean {
    // These shortcuts work even when input elements are focused
    const globalShortcuts = ['KeyS', 'KeyO', 'KeyZ', 'KeyY'];
    return (event.ctrlKey || event.metaKey) && globalShortcuts.includes(event.code);
  }

  // ===================================================================
  // Event System
  // ===================================================================

  public addEventListener(type: string, handler: EventManagerEventHandler): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, []);
    }
    this.eventListeners.get(type)!.push(handler);
  }

  public removeEventListener(type: string, handler: EventManagerEventHandler): void {
    const handlers = this.eventListeners.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private dispatchEvent(event: EventManagerEvent): void {
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
  // Public Interface
  // ===================================================================

  public getShortcuts(): KeyboardShortcut[] {
    return [...this.shortcuts];
  }

  public setConfig(config: Partial<EventManagerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public getConfig(): EventManagerConfig {
    return { ...this.config };
  }

  public destroy(): void {
    // Remove all event listeners
    document.removeEventListener('keydown', this.handleKeyDown.bind(this), true);
    document.removeEventListener('keyup', this.handleKeyUp.bind(this), true);
    document.removeEventListener('contextmenu', this.handleContextMenu.bind(this));
    document.removeEventListener('dragover', this.handleDragOver.bind(this));
    document.removeEventListener('drop', this.handleDrop.bind(this));
    document.removeEventListener('dragenter', this.handleDragEnter.bind(this));
    document.removeEventListener('dragleave', this.handleDragLeave.bind(this));
    document.removeEventListener('mousemove', this.handleGlobalMouseMove.bind(this));
    document.removeEventListener('mouseup', this.handleGlobalMouseUp.bind(this));

    // Clear internal state
    this.eventListeners.clear();
    this.keyboardHandlers.clear();
    this.contextMenuTarget = null;
  }
}

// ===================================================================
// Factory Function
// ===================================================================

export function createEventManager(
  appState: IAppState,
  canvasController: ICanvasController,
  fileSystemService: IFileSystemService,
  config?: Partial<EventManagerConfig>
): EventManager {
  return new EventManager(appState, canvasController, fileSystemService, config);
}

// ===================================================================
// Exports
// ===================================================================

export default EventManager;
export type { IEventManager, EventManagerConfig, KeyboardShortcut };