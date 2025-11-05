/**
 * UI Manager Module
 *
 * Manages all DOM manipulation, UI updates, and user interface interactions.
 * Handles Bootstrap modals, panel management, list rendering, and theme management.
 */

import { IAppState } from '../types/app-state';
import { ICanvasController } from '../types/canvas';
import { IFileSystem } from '../types/file-system';
import {
  DOMElements,
  BootstrapModal,
  PanelConfig,
  SplitterConfig,
  FilterButton,
  LabelGroup,
  ContextMenuConfig,
  UIState,
  ThemeConfig,
  LoadingState,
  SearchOptions,
  FilterOptions,
  UIEvent,
  UIEventType,
  UIEventHandler,
  UIMethods,
  IUIManager,
  ImageListItem,
  LabelListItem,
  PreviewItem
} from '../types/ui';
import { Mode, Point } from '../types/index';
import { showSuccessToast, showErrorToast } from '../utils';
import { BoundingBox } from '../types/canvas';

/**
 * Bootstrap Modal wrapper for type safety
 */
class BootstrapModalWrapper implements BootstrapModal {
  private modal: any;

  constructor(element: HTMLElement) {
    // Bootstrap 5 Modal
    this.modal = new (window as any).bootstrap.Modal(element);
  }

  show(): void {
    this.modal.show();
  }

  hide(): void {
    this.modal.hide();
  }

  toggle(): void {
    this.modal.toggle();
  }

  dispose(): void {
    this.modal.dispose();
  }
}

/**
 * UIManager implementation
 * Manages all user interface interactions and DOM manipulation
 */
export class UIManager implements IUIManager {
  private eventHandlers: Map<UIEventType, Set<UIEventHandler>> = new Map();
  private _elements!: DOMElements;
  private panelConfigs: Map<string, PanelConfig> = new Map();
  private splitterConfigs: SplitterConfig[] = [];
  private currentTheme: ThemeConfig;
  private loadingState: LoadingState;
  private filterButtons: FilterButton[] = [];
  private labelGroups: LabelGroup[] = [];
  private imageListItems: ImageListItem[] = [];
  private labelListItems: LabelListItem[] = [];
  private previewItems: PreviewItem[] = [];

  constructor(
    private _state: IAppState,
    private _canvasController: ICanvasController,
    private _fileSystem: IFileSystem
  ) {
    this.currentTheme = this.getDefaultTheme();
    this.loadingState = {
      isLoading: false,
      message: '',
      progress: 0
    };

    this.initializeElements();
    this.setupEventListeners();
    this.setupSplitters();
    this.initializePanelConfigs();
  }

  // ===================================================================
  // Getters
  // ===================================================================

  get elements(): DOMElements {
    return this._elements;
  }

  get state(): IAppState {
    return this._state;
  }

  get canvasController(): ICanvasController {
    return this._canvasController;
  }

  get fileSystem(): IFileSystem {
    return this._fileSystem;
  }

  // ===================================================================
  // Element Initialization
  // ===================================================================

  private initializeElements(): void {
    this._elements = {
      // Folder selection buttons
      selectImageFolderBtn: this.getElementById('select-image-folder-btn') as HTMLButtonElement,
      selectLabelFolderBtn: this.getElementById('select-label-folder-btn') as HTMLButtonElement,
      loadClassInfoFolderBtn: this.getElementById('load-class-info-folder-btn') as HTMLButtonElement,

      // Class file elements
      classFileSelect: this.getElementById('class-file-select') as HTMLSelectElement,
      viewClassFileBtn: this.getElementById('view-class-file-btn') as HTMLButtonElement,
      classFileViewerModal: new BootstrapModalWrapper(this.getElementById('classFileViewerModal')),
      classFileEditorBody: this.getElementById('class-file-editor-body') as HTMLElement,
      addClassRowBtn: this.getElementById('add-class-row-btn') as HTMLButtonElement,
      saveClassFileBtn: this.getElementById('save-class-file-btn') as HTMLButtonElement,
      downloadClassesBtn: this.getElementById('download-classes-btn') as HTMLButtonElement,

      // Image list elements
      imageList: this.getElementById('image-list') as HTMLElement,
      imageSearchInput: this.getElementById('image-search-input') as HTMLInputElement,
      showLabeledCheckbox: this.getElementById('show-labeled-checkbox') as HTMLInputElement,
      showUnlabeledCheckbox: this.getElementById('show-unlabeled-checkbox') as HTMLInputElement,

      // Save/load buttons
      saveLabelsBtn: this.getElementById('save-labels-btn') as HTMLButtonElement,
      autoSaveToggle: this.getElementById('auto-save-toggle') as HTMLInputElement,

      // Canvas display options
      showLabelsOnCanvasToggle: this.getElementById('show-labels-on-canvas-toggle') as HTMLInputElement,
      labelFontSizeSlider: this.getElementById('label-font-size-slider') as HTMLInputElement,
      labelFontSizeValue: this.getElementById('label-font-size-value') as HTMLElement,
      crosshairToggle: this.getElementById('crosshair-toggle') as HTMLInputElement,

      // Mode buttons
      drawModeBtn: this.getElementById('draw-mode-btn') as HTMLButtonElement,
      editModeBtn: this.getElementById('edit-mode-btn') as HTMLButtonElement,

      // Label list elements
      labelList: this.getElementById('label-list') as HTMLElement,
      labelFilters: this.getElementById('label-filters') as HTMLElement,
      selectByClassDropdown: this.getElementById('select-by-class-dropdown') as HTMLSelectElement,
      selectByClassBtn: this.getElementById('select-by-class-btn') as HTMLButtonElement,
      sortLabelsAscBtn: this.getElementById('sort-labels-asc-btn') as HTMLButtonElement,
      sortLabelsDescBtn: this.getElementById('sort-labels-desc-btn') as HTMLButtonElement,

      // Zoom controls
      zoomInBtn: this.getElementById('zoom-in-btn') as HTMLButtonElement,
      zoomOutBtn: this.getElementById('zoom-out-btn') as HTMLButtonElement,
      resetZoomBtn: this.getElementById('reset-zoom-btn') as HTMLButtonElement,
      zoomInput: this.getElementById('zoom-input') as HTMLInputElement,

      // Canvas elements
      canvasContainer: this.getElementById('canvas-container') as HTMLElement,
      mouseCoordsDisplay: this.getElementById('mouse-coords-display') as HTMLElement,
      coordXInput: this.getElementById('coord-x-input') as HTMLInputElement,
      coordYInput: this.getElementById('coord-y-input') as HTMLInputElement,
      goToCoordsBtn: this.getElementById('go-to-coords-btn') as HTMLButtonElement,

      // Navigation
      currentImageNameSpan: this.getElementById('current-image-name') as HTMLElement,
      prevImageBtn: this.getElementById('prev-image-btn') as HTMLButtonElement,
      nextImageBtn: this.getElementById('next-image-btn') as HTMLButtonElement,

      // Panel elements
      leftPanel: this.getElementById('left-panel') as HTMLElement,
      rightPanel: this.getElementById('right-panel') as HTMLElement,
      leftSplitter: this.getElementById('left-splitter') as HTMLElement,
      rightSplitter: this.getElementById('right-splitter') as HTMLElement,
      collapseLeftPanelBtn: this.getElementById('collapse-left-panel-btn') as HTMLButtonElement,
      expandLeftPanelBtn: this.getElementById('expand-left-panel-btn') as HTMLButtonElement,
      collapseRightPanelBtn: this.getElementById('collapse-right-panel-btn') as HTMLButtonElement,
      expandRightPanelBtn: this.getElementById('expand-right-panel-btn') as HTMLButtonElement,

      // Preview bar elements
      previewBar: this.getElementById('preview-bar') as HTMLElement,
      previewBarHeader: this.getElementById('preview-bar-header') as HTMLElement,
      togglePreviewBtn: this.getElementById('toggle-preview-btn') as HTMLButtonElement,
      previewPrevBtn: this.getElementById('preview-prev-btn') as HTMLButtonElement,
      previewNextBtn: this.getElementById('preview-next-btn') as HTMLButtonElement,
      previewListWrapper: this.getElementById('preview-list-wrapper') as HTMLElement,
      previewList: this.getElementById('preview-list') as HTMLElement,
      bottomPanel: this.getElementById('bottom-panel') as HTMLElement,
      bottomSplitter: this.getElementById('bottom-splitter') as HTMLElement,

      // Theme toggle
      darkModeToggle: this.getElementById('dark-mode-toggle') as HTMLInputElement,

      // Label class modal
      labelClassModal: new BootstrapModalWrapper(this.getElementById('labelClassModal')),
      labelClassInput: this.getElementById('label-class-input') as HTMLInputElement,
      classSelectionContainer: this.getElementById('class-selection-container') as HTMLElement,
      saveLabelClassBtn: this.getElementById('save-label-class-btn') as HTMLButtonElement,

      // Context menu
      contextMenu: this.getElementById('context-menu') as HTMLElement,
      ctxEditLabel: this.getElementById('ctx-edit-label') as HTMLElement,
      ctxDeleteLabel: this.getElementById('ctx-delete-label') as HTMLElement,

      // Loading overlay
      loadingOverlay: this.getElementById('loading-overlay') as HTMLElement
    };
  }

  private getElementById(id: string): HTMLElement {
    // Centralized ID aliases to map semantic kebab-case IDs to legacy DOM IDs
    const legacyIdMap: Record<string, string> = {
      // Folder selection
      'select-image-folder-btn': 'selectImageFolderBtn',
      'select-label-folder-btn': 'selectLabelFolderBtn',
      'load-class-info-folder-btn': 'loadClassInfoFolderBtn',

      // Class file elements
      'view-class-file-btn': 'viewClassFileBtn',
      'class-file-editor-body': 'classFileEditorBody',
      'add-class-row-btn': 'addClassRowBtn',
      'save-class-file-btn': 'saveClassFileBtn',
      'download-classes-btn': 'downloadClassesBtn',
      'class-file-select': 'class-file-select',

      // Image list / filters
      'image-search-input': 'imageSearchInput',
      'show-labeled-checkbox': 'showLabeled',
      'show-unlabeled-checkbox': 'showUnlabeled',
      'image-list': 'image-list',
      'label-list': 'label-list',

      // Save/load
      'save-labels-btn': 'saveLabelsBtn',
      'auto-save-toggle': 'autoSaveToggle',

      // Canvas display options
      'show-labels-on-canvas-toggle': 'showLabelsOnCanvasToggle',
      'label-font-size-slider': 'label-font-size',
      'label-font-size-value': 'label-font-size-value',
      'crosshair-toggle': 'crosshairToggle',

      // Modes
      'draw-mode-btn': 'drawMode',
      'edit-mode-btn': 'editMode',

      // Label filters & selects
      'label-filters': 'label-filters',
      'select-by-class-dropdown': 'select-by-class-dropdown',
      'select-by-class-btn': 'select-by-class-btn',
      'sort-labels-asc-btn': 'sortLabelsAscBtn',
      'sort-labels-desc-btn': 'sortLabelsDescBtn',

      // Zoom controls
      'zoom-in-btn': 'zoomInBtn',
      'zoom-out-btn': 'zoomOutBtn',
      'reset-zoom-btn': 'resetZoomBtn',
      'zoom-input': 'zoom-input',

      // Coords
      'mouse-coords-display': 'info-display',
      'coord-x-input': 'coordX',
      'coord-y-input': 'coordY',
      'go-to-coords-btn': 'goToCoordsBtn',

      // Navigation
      'current-image-name': 'current-image-name',
      'prev-image-btn': 'prevImageBtn',
      'next-image-btn': 'nextImageBtn',

      // Panels & splitters
      'left-panel': 'left-panel',
      'right-panel': 'right-panel',
      'left-splitter': 'left-splitter',
      'right-splitter': 'right-splitter',
      'collapse-left-panel-btn': 'collapse-left-panel-btn',
      'expand-left-panel-btn': 'expand-left-panel-btn',
      'collapse-right-panel-btn': 'collapse-right-panel-btn',
      'expand-right-panel-btn': 'expand-right-panel-btn',

      // Preview bar
      'preview-bar': 'preview-bar',
      'preview-bar-header': 'preview-bar-header',
      'toggle-preview-btn': 'toggle-preview-btn',
      'preview-prev-btn': 'preview-prev-btn',
      'preview-next-btn': 'preview-next-btn',
      'preview-list-wrapper': 'preview-list-wrapper',
      'preview-list': 'preview-list',
      'bottom-panel': 'bottom-panel',
      'bottom-splitter': 'bottom-splitter',

      // Theme
      'dark-mode-toggle': 'darkModeToggle',

      // Label class modal
      'label-class-input': 'labelClassInput',
      'save-label-class-btn': 'saveLabelClassBtn',
      'class-selection-container': 'class-selection-container',

      // Context menu
      'context-menu': 'context-menu',
      'ctx-edit-label': 'ctx-edit-label',
      'ctx-delete-label': 'ctx-delete-label',

      // Canvas & overlays
      'canvas-container': 'canvas-container',
      'loading-overlay': 'loading-overlay',
      'toast-container': 'toast-container'
    };

    let element = document.getElementById(id);
    if (!element) {
      const legacyId = legacyIdMap[id];
      if (legacyId) {
        element = document.getElementById(legacyId);
      }
    }

    if (!element) {
      throw new Error(`Element with ID '${id}' not found`);
    }
    return element as HTMLElement;
  }

  // ===================================================================
  // Event System
  // ===================================================================

  addEventListener(type: UIEventType, handler: UIEventHandler): void {
    if (!this.eventHandlers.has(type)) {
      this.eventHandlers.set(type, new Set());
    }
    this.eventHandlers.get(type)!.add(handler);
  }

  removeEventListener(type: UIEventType, handler: UIEventHandler): void {
    const handlers = this.eventHandlers.get(type);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  private dispatchUIEvent<T = any>(type: UIEventType, data?: T, target?: HTMLElement): void {
    const event: UIEvent<T> = {
      type,
      data,
      target,
      timestamp: new Date()
    };

    const handlers = this.eventHandlers.get(type);
    if (handlers) {
      handlers.forEach(handler => handler(event));
    }
  }

  // ===================================================================
  // Panel Management
  // ===================================================================

  private initializePanelConfigs(): void {
    this.panelConfigs.set('left', {
      panel: this.elements.leftPanel,
      splitter: this.elements.leftSplitter,
      expandBtn: this.elements.expandLeftPanelBtn,
      isCollapsing: false
    });

    this.panelConfigs.set('right', {
      panel: this.elements.rightPanel,
      splitter: this.elements.rightSplitter,
      expandBtn: this.elements.expandRightPanelBtn,
      isCollapsing: false
    });
  }

  togglePanel(config: PanelConfig): void {
    if (config.isCollapsing) return;

    config.isCollapsing = true;
    const isCollapsed = config.panel.style.display === 'none';

    if (isCollapsed) {
      // Expand panel
      config.panel.style.display = 'block';
      config.expandBtn.style.display = 'none';
      config.splitter.style.display = 'block';
    } else {
      // Collapse panel
      config.panel.style.display = 'none';
      config.expandBtn.style.display = 'block';
      config.splitter.style.display = 'none';
    }

    // Reset flag after animation
    setTimeout(() => {
      config.isCollapsing = false;
    }, 300);

    this.dispatchUIEvent('panel:toggled', { panelId: config.panel.id, collapsed: !isCollapsed });
  }

  setupSplitters(): void {
    this.splitterConfigs = [
      {
        splitter: this.elements.leftSplitter,
        panel: this.elements.leftPanel,
        direction: 'left',
        minWidth: 200,
        maxWidth: 500
      },
      {
        splitter: this.elements.rightSplitter,
        panel: this.elements.rightPanel,
        direction: 'right',
        minWidth: 200,
        maxWidth: 500
      }
    ];

    this.splitterConfigs.forEach(config => {
      this.setupSplitter(config);
    });
  }

  private setupSplitter(config: SplitterConfig): void {
    let isDragging = false;
    let startX = 0;
    let startWidth = 0;

    config.splitter.addEventListener('mousedown', (e: MouseEvent) => {
      isDragging = true;
      startX = e.clientX;
      startWidth = parseInt(window.getComputedStyle(config.panel).width, 10);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      e.preventDefault();
    });

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = config.direction === 'left' ? e.clientX - startX : startX - e.clientX;
      const newWidth = Math.min(Math.max(startWidth + deltaX, config.minWidth), config.maxWidth);
      config.panel.style.width = `${newWidth}px`;
    };

    const handleMouseUp = () => {
      isDragging = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }

  resizePanels(): void {
    // Resize panels based on window size
    const windowWidth = window.innerWidth;
    const leftPanel = this.elements.leftPanel;
    const rightPanel = this.elements.rightPanel;

    if (windowWidth < 768) {
      // Mobile view - hide panels
      leftPanel.style.display = 'none';
      rightPanel.style.display = 'none';
    } else {
      // Desktop view - show panels
      leftPanel.style.display = 'block';
      rightPanel.style.display = 'block';
    }
  }

  // ===================================================================
  // Loading State Management
  // ===================================================================

  showLoadingIndicator(): void {
    this.loadingState.isLoading = true;
    this.elements.loadingOverlay.style.display = 'flex';
    this.dispatchUIEvent('loading:show');
  }

  hideLoadingIndicator(): void {
    this.loadingState.isLoading = false;
    this.elements.loadingOverlay.style.display = 'none';
    this.dispatchUIEvent('loading:hide');
  }

  updateLoadingProgress(progress: number, message?: string): void {
    this.loadingState.progress = progress;
    if (message) {
      this.loadingState.message = message;
    }

    // Update loading UI
    const progressBar = this.elements.loadingOverlay.querySelector('.progress-bar') as HTMLElement;
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }

    const messageElement = this.elements.loadingOverlay.querySelector('.loading-message') as HTMLElement;
    if (messageElement && message) {
      messageElement.textContent = message;
    }

    this.dispatchUIEvent('loading:progress', { progress, message });
  }

  // ===================================================================
  // Theme Management
  // ===================================================================

  getCurrentTheme(): ThemeConfig {
    return this.currentTheme;
  }

  private getDefaultTheme(): ThemeConfig {
    return {
      name: 'light',
      primaryColor: '#007bff',
      backgroundColor: '#ffffff',
      textColor: '#333333',
      borderColor: '#dee2e6'
    };
  }

  private getDarkTheme(): ThemeConfig {
    return {
      name: 'dark',
      primaryColor: '#0d6efd',
      backgroundColor: '#1a1a1a',
      textColor: '#ffffff',
      borderColor: '#444444'
    };
  }

  applyTheme(theme: ThemeConfig): void {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-bs-theme', theme.name);

    // Apply custom CSS variables
    const root = document.documentElement;
    root.style.setProperty('--primary-color', theme.primaryColor);
    root.style.setProperty('--background-color', theme.backgroundColor);
    root.style.setProperty('--text-color', theme.textColor);
    root.style.setProperty('--border-color', theme.borderColor);

    this.dispatchUIEvent('theme:changed', theme);
  }

  toggleDarkMode(): void {
    const isDark = this.currentTheme.name === 'dark';
    const newTheme = isDark ? this.getDefaultTheme() : this.getDarkTheme();
    this.applyTheme(newTheme);

    // Update toggle state
    this.elements.darkModeToggle.checked = !isDark;
  }

  // ===================================================================
  // List Rendering
  // ===================================================================

  renderImageList(): void {
    const imageList = this.elements.imageList;
    imageList.innerHTML = '';

    this.imageListItems = this._state.imageFiles.map(imageFile => {
      const listItem = document.createElement('div');
      listItem.className = 'image-list-item';
      listItem.dataset.fileName = imageFile.name;

      const isLabeled = this._state.getImageLabelStatus(imageFile.name);
      const isSelected = this._state.currentImageFile?.name === imageFile.name;

      listItem.innerHTML = `
        <div class="image-item-content">
          <span class="image-name">${imageFile.name}</span>
          <span class="image-status ${isLabeled ? 'labeled' : 'unlabeled'}">
            ${isLabeled ? '●' : '○'}
          </span>
        </div>
      `;

      if (isSelected) {
        listItem.classList.add('selected');
      }

      listItem.addEventListener('click', () => {
        this.selectImage(imageFile);
      });

      imageList.appendChild(listItem);

      return {
        file: imageFile,
        isLabeled,
        isSelected,
        element: listItem
      };
    });

    this.dispatchUIEvent('image:list-rendered', { count: this.imageListItems.length });
  }

  private async selectImage(imageFile: any): Promise<void> {
    this._state.setCurrentImage(imageFile);
    this.dispatchUIEvent('image:selected', { imageFile });

    // Update selected highlight and current image name
    try {
      this.imageListItems.forEach(item => {
        item.element.classList.toggle('selected', item.file.name === imageFile.name);
      });
    } catch {}
    if (this._elements?.currentImageNameSpan) {
      this._elements.currentImageNameSpan.textContent = imageFile?.name || '';
    }

    try {
      // Load image from file system and display on canvas
      const imgResult = await (this._fileSystem as any).loadImage?.(imageFile.handle);
      if (imgResult?.success && imgResult.data) {
        const imgEl = imgResult.data as HTMLImageElement;
        // Keep current image element in state for size reference when saving
        try { (this._state as any).currentImage = imgEl; } catch {}
        this._canvasController.loadImage(imgEl);

        // Load labels if label folder selected
        const labelFolder = (this._state as any).labelFolderHandle;
        if (labelFolder) {
          const lblResult = await (this._fileSystem as any).loadLabels?.(imageFile.name, labelFolder);
          if (lblResult?.success && Array.isArray(lblResult.data)) {
            // Clear existing labels
            this._canvasController.getAllBoundingBoxes().forEach(b => this._canvasController.removeBoundingBox(b.id));
            const width = (imgEl as any).naturalWidth || imgEl.width || 1;
            const height = (imgEl as any).naturalHeight || imgEl.height || 1;
            lblResult.data.forEach((y: any) => {
              const bbox = this._canvasController.yoloToBoundingBox(y, { width, height });
              this._canvasController.addBoundingBox(bbox);
            });
          }
        }
      }
    } catch (e) {
      console.error('Failed to load selected image', e);
    }
  }

  updateLabelList(): void {
    const labelList = this.elements.labelList;
    labelList.innerHTML = '';

    // Get current bounding boxes from canvas
    const boundingBoxes = this._canvasController.getAllBoundingBoxes();

    this.labelListItems = boundingBoxes.map(bbox => {
      const listItem = document.createElement('div');
      listItem.className = 'label-list-item';
      listItem.dataset.labelId = bbox.id;

      const className = this.getDisplayNameForClass(bbox.classId.toString());

      listItem.innerHTML = `
        <div class="label-item-content">
          <span class="label-class">${className}</span>
          <span class="label-coords">(${Math.round(bbox.x)}, ${Math.round(bbox.y)})</span>
        </div>
      `;

      listItem.addEventListener('click', () => {
        this.selectLabel(bbox.id);
      });

      labelList.appendChild(listItem);

      return {
        id: bbox.id,
        classId: bbox.classId,
        className,
        boundingBox: bbox,
        isSelected: false,
        element: listItem
      };
    });

    this.dispatchUIEvent('label:list-rendered', { count: this.labelListItems.length });
  }

  private selectLabel(labelId: string): void {
    this._canvasController.selectBoundingBox(labelId);
    this.dispatchUIEvent('label:selected', { labelId });
  }

  // ===================================================================
  // Filter Management
  // ===================================================================

  updateLabelFilters(rects: BoundingBox[]): void {
    const filtersContainer = this.elements.labelFilters;
    filtersContainer.innerHTML = '';

    // Group by class
    const classGroups = new Map<number, BoundingBox[]>();
    rects.forEach(rect => {
      if (!classGroups.has(rect.classId)) {
        classGroups.set(rect.classId, []);
      }
      classGroups.get(rect.classId)!.push(rect);
    });

    this.filterButtons = Array.from(classGroups.entries()).map(([classId, classRects]) => {
      const button = document.createElement('button');
      button.className = 'btn btn-outline-primary btn-sm filter-btn';
      button.dataset.classId = classId.toString();

      const className = this.getDisplayNameForClass(classId.toString());
      button.textContent = `${className} (${classRects.length})`;

      button.addEventListener('click', () => {
        this.toggleFilter(classId.toString());
      });

      filtersContainer.appendChild(button);

      return {
        element: button,
        labelClass: classId.toString(),
        count: classRects.length,
        isActive: true
      };
    });

    this.dispatchUIEvent('filter:updated', { filterCount: this.filterButtons.length });
  }

  private toggleFilter(labelClass: string): void {
    const filterButton = this.filterButtons.find(btn => btn.labelClass === labelClass);
    if (filterButton) {
      filterButton.isActive = !filterButton.isActive;
      filterButton.element.classList.toggle('active', filterButton.isActive);
      this.dispatchUIEvent('filter:changed', { labelClass, active: filterButton.isActive });
    }
  }

  updateSelectByClassDropdown(rects: BoundingBox[]): void {
    const dropdown = this.elements.selectByClassDropdown;
    dropdown.innerHTML = '<option value="">Select class...</option>';

    const uniqueClasses = new Set(rects.map(rect => rect.classId));
    uniqueClasses.forEach(classId => {
      const option = document.createElement('option');
      option.value = classId.toString();
      option.textContent = this.getDisplayNameForClass(classId.toString());
      dropdown.appendChild(option);
    });
  }

  // ===================================================================
  // Status Updates
  // ===================================================================

  updateLabelFolderButton(selected: boolean, folderName?: string): void {
    const button = this.elements.selectLabelFolderBtn;
    if (selected && folderName) {
      button.textContent = `📁 ${folderName}`;
      button.classList.add('btn-success');
      button.classList.remove('btn-outline-primary');
    } else {
      button.textContent = 'Select Label Folder';
      button.classList.remove('btn-success');
      button.classList.add('btn-outline-primary');
    }
  }

  updateModeButtons(mode: Mode): void {
    const drawBtn = this.elements.drawModeBtn;
    const editBtn = this.elements.editModeBtn;

    drawBtn.classList.toggle('active', mode === 'draw');
    editBtn.classList.toggle('active', mode === 'edit');

    this.dispatchUIEvent('mode:changed', { mode });
  }

  updateZoomDisplay(): void {
    const zoom = this._canvasController.getZoom();
    this.elements.zoomInput.value = Math.round(zoom * 100).toString();
  }

  updateMouseCoords(x: number, y: number): void {
    this.elements.mouseCoordsDisplay.textContent = `(${Math.round(x)}, ${Math.round(y)})`;
  }

  updateCurrentImageDisplay(imageName: string): void {
    this.elements.currentImageNameSpan.textContent = imageName;
  }

  // ===================================================================
  // Context Menu
  // ===================================================================

  showContextMenu(config: ContextMenuConfig): void {
    const contextMenu = this.elements.contextMenu;
    contextMenu.style.display = 'block';
    contextMenu.style.left = `${config.x}px`;
    contextMenu.style.top = `${config.y}px`;

    this.dispatchUIEvent('context-menu:show', config);
  }

  hideContextMenu(): void {
    this.elements.contextMenu.style.display = 'none';
    this.dispatchUIEvent('context-menu:hide');
  }

  // ===================================================================
  // Modal Management
  // ===================================================================

  showClassEditor(): void {
    this.elements.classFileViewerModal.show();
  }

  hideClassEditor(): void {
    this.elements.classFileViewerModal.hide();
  }

  // ===================================================================
  // Utility Methods
  // ===================================================================

  getDisplayNameForClass(labelClass: string): string {
    return this._state.classNames.get(labelClass) || `Class ${labelClass}`;
  }

  getDOMElements(): DOMElements {
    return this.elements;
  }

  // ===================================================================
  // State Getters
  // ===================================================================

  getUIState(): UIState {
    return {
      isImageListVisible: this.elements.imageList.style.display !== 'none',
      isLabelListVisible: this.elements.labelList.style.display !== 'none',
      isPreviewBarVisible: this.elements.previewBar.style.display !== 'none',
      isLeftPanelCollapsed: this.elements.leftPanel.style.display === 'none',
      isRightPanelCollapsed: this.elements.rightPanel.style.display === 'none',
      activeFilters: new Set(this.filterButtons.filter(btn => btn.isActive).map(btn => btn.labelClass)),
      selectedLabels: new Set() // TODO: implement selection tracking
    };
  }

  getSearchOptions(): SearchOptions {
    return {
      searchTerm: this.elements.imageSearchInput.value,
      showLabeled: this.elements.showLabeledCheckbox.checked,
      showUnlabeled: this.elements.showUnlabeledCheckbox.checked,
      sortOrder: 'name', // TODO: implement dynamic sorting
      sortDirection: 'asc'
    };
  }

  getFilterOptions(): FilterOptions {
    return {
      activeClasses: new Set(this.filterButtons.filter(btn => btn.isActive).map(btn => btn.labelClass)),
      showAll: this.filterButtons.length === 0,
      hideEmpty: false // TODO: implement hide empty option
    };
  }

  // ===================================================================
  // Event Listener Setup
  // ===================================================================

  private setupEventListeners(): void {
    // Sync UI when mode changes programmatically (e.g., right-click toggle)
    try {
      (this._state as any).addEventListener('mode:changed', (evt: any) => {
        const current = evt?.data?.current;
        this.syncModeUI(current);
      });
      // Initialize once
      this.syncModeUI((this._state as any).currentMode);
    } catch {}
    // Update coord inputs with image pointer position
    try {
      (this._canvasController as any).addEventListener('mouse:move', (evt: any) => {
        const img = evt?.data?.image;
        if (img && Number.isFinite(img.x) && Number.isFinite(img.y)) {
          this.elements.coordXInput.value = String(Math.round(img.x));
          this.elements.coordYInput.value = String(Math.round(img.y));
        }
      });
    } catch {}
    // Folder selection
    this.elements.selectImageFolderBtn.addEventListener('click', async () => {
      try {
        const result = await (this._fileSystem as any).selectImageFolder?.();
        if (result?.success && result.data) {
          this._state.setImageFolder(result.data);

          // Auto-detect or create label folder inside the selected image folder
          try {
            const imageFolderHandle = result.data as any;
            let labelHandle: any | null = null;
            // Try common names first: 'labels', then 'label'
            try { labelHandle = await imageFolderHandle.getDirectoryHandle('labels'); } catch {}
            if (!labelHandle) { try { labelHandle = await imageFolderHandle.getDirectoryHandle('label'); } catch {} }

            if (!labelHandle) {
              const create = window.confirm('No label folder found inside the selected image folder.\nCreate a new "labels" folder?');
              if (create) {
                try {
                  if (typeof imageFolderHandle.requestPermission === 'function') {
                    const perm = await imageFolderHandle.requestPermission({ mode: 'readwrite' });
                    if (perm !== 'granted') {
                      await imageFolderHandle.requestPermission({ mode: 'readwrite' });
                    }
                  }
                  labelHandle = await imageFolderHandle.getDirectoryHandle('labels', { create: true });
                } catch (err) {
                  console.error('Failed to create labels folder', err);
                  showErrorToast('Permission blocked. Use "Load Label Folder" to pick a folder.');
                }
              }
            }

            if (labelHandle) {
              this._state.setLabelFolder(labelHandle);
              this.updateLabelFolderButton(true, labelHandle.name);
              showSuccessToast(`Label folder ready: ${labelHandle.name}`);
            }
          } catch (e) {
            console.warn('Label folder detection/creation skipped:', e);
          }

          // List images after label folder handling
          const listRes = await (this._fileSystem as any).listImageFiles?.(result.data);
          if (listRes?.success && Array.isArray(listRes.data)) {
            (this._state as any).imageFiles = listRes.data;
            this.renderImageList();
          }
        }
      } catch (e) {
        console.error('Failed to select image folder', e);
      }
    });

    this.elements.selectLabelFolderBtn.addEventListener('click', async () => {
      try {
        const result = await (this._fileSystem as any).selectLabelFolder?.();
        if (result?.success && result.data) {
          this._state.setLabelFolder(result.data);
          this.updateLabelFolderButton(true, result.data.name);
        }
      } catch (e) {
        console.error('Failed to select label folder', e);
      }
    });

    this.elements.loadClassInfoFolderBtn.addEventListener('click', async () => {
      try {
        const result = await (this._fileSystem as any).selectClassInfoFolder?.();
        if (result?.success && result.data) {
          this._state.setClassInfoFolder(result.data);
        }
      } catch (e) {
        console.error('Failed to select class info folder', e);
      }
    });

    // Zoom controls
    this.elements.zoomInBtn.addEventListener('click', () => this._canvasController.zoomIn());
    this.elements.zoomOutBtn.addEventListener('click', () => this._canvasController.zoomOut());
    this.elements.resetZoomBtn.addEventListener('click', () => this._canvasController.resetZoom());

    // Mode switching
    this.elements.drawModeBtn.addEventListener('click', () => this._state.setMode('draw'));
    this.elements.editModeBtn.addEventListener('click', () => this._state.setMode('edit'));

    // Canvas display options
    this.elements.showLabelsOnCanvasToggle.addEventListener('change', () => {
      this._state.setShowLabels(this.elements.showLabelsOnCanvasToggle.checked);
      this._canvasController.updateLabels();
    });
    this.elements.labelFontSizeSlider.addEventListener('input', () => {
      const val = Number(this.elements.labelFontSizeSlider.value);
      this.elements.labelFontSizeValue.textContent = String(val);
      this._state.setLabelFontSize(val);
      this._canvasController.setLabelFont(val);
    });
    this.elements.autoSaveToggle.addEventListener('change', () => {
      this._state.setAutoSave(this.elements.autoSaveToggle.checked);
    });
    this.elements.crosshairToggle.addEventListener('change', () => {
      this._state.toggleCrosshair();
    });

    // Window resize handler
    window.addEventListener('resize', () => {
      this.resizePanels();
    });

    // Panel collapse/expand buttons
    this.elements.collapseLeftPanelBtn.addEventListener('click', () => {
      const config = this.panelConfigs.get('left')!;
      this.togglePanel(config);
    });

    this.elements.collapseRightPanelBtn.addEventListener('click', () => {
      const config = this.panelConfigs.get('right')!;
      this.togglePanel(config);
    });

    this.elements.expandLeftPanelBtn.addEventListener('click', () => {
      const config = this.panelConfigs.get('left')!;
      this.togglePanel(config);
    });

    this.elements.expandRightPanelBtn.addEventListener('click', () => {
      const config = this.panelConfigs.get('right')!;
      this.togglePanel(config);
    });

    // Theme toggle
    this.elements.darkModeToggle.addEventListener('change', () => {
      this.toggleDarkMode();
    });

    // Save labels
    this.elements.saveLabelsBtn.addEventListener('click', async () => {
      try {
        if (!this._state.currentImageFile || !(this._state as any).labelFolderHandle) {
          showErrorToast('Select image and label folders first');
          return;
        }
        const boundingBoxes = this._canvasController.getAllBoundingBoxes();
        const yoloLabels = boundingBoxes.map(bbox =>
          this._canvasController.boundingBoxToYOLO(bbox, {
            width: (this._state as any).currentImage?.width || 1,
            height: (this._state as any).currentImage?.height || 1
          })
        );

        const result = await (this._fileSystem as any).saveLabels?.(
          this._state.currentImageFile.name,
          yoloLabels,
          (this._state as any).labelFolderHandle
        );
        if (result?.success) {
          showSuccessToast('Labels saved successfully');
        } else {
          showErrorToast(result?.error || 'Failed to save labels');
        }
      } catch (e: any) {
        console.error('Save labels failed', e);
        showErrorToast('Failed to save labels');
      }
    });

    // Go to coordinates
    this.elements.goToCoordsBtn.addEventListener('click', () => {
      const x = Number(this.elements.coordXInput.value);
      const y = Number(this.elements.coordYInput.value);
      if (Number.isFinite(x) && Number.isFinite(y)) {
        this._canvasController.goToImageCoordinates(x, y);
      }
    });

    // Zoom input (percent)
    this.elements.zoomInput.addEventListener('change', () => {
      const pct = Number(this.elements.zoomInput.value);
      if (Number.isFinite(pct) && pct > 0) {
        this._canvasController.setZoomPercent(pct);
      }
    });

    // Hide context menu on document click
    document.addEventListener('click', (e) => {
      if (!this.elements.contextMenu.contains(e.target as Node)) {
        this.hideContextMenu();
      }
    });
  }

  // Keep mode buttons in sync with AppState
  private syncModeUI(currentMode: 'draw' | 'edit'): void {
    try {
      const drawInput = document.getElementById('drawMode') as HTMLInputElement | null;
      const editInput = document.getElementById('editMode') as HTMLInputElement | null;
      const drawLabel = document.querySelector('label[for="drawMode"]') as HTMLElement | null;
      const editLabel = document.querySelector('label[for="editMode"]') as HTMLElement | null;

      const isDraw = currentMode === 'draw';
      if (drawInput) drawInput.checked = isDraw;
      if (editInput) editInput.checked = !isDraw;
      if (drawLabel) drawLabel.classList.toggle('active', isDraw);
      if (editLabel) editLabel.classList.toggle('active', !isDraw);
    } catch {}
  }

  // ===================================================================
  // Validation
  // ===================================================================

  validateUIState(): any {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if essential elements exist
    if (!this.elements.canvasContainer) {
      errors.push('Canvas container not found');
    }

    if (!this.elements.imageList) {
      errors.push('Image list container not found');
    }

    if (!this.elements.labelList) {
      errors.push('Label list container not found');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  validateFormData(formData: FormData): any {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Implement form validation logic as needed

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // ===================================================================
  // Additional Methods (for future expansion)
  // ===================================================================

  addEditDeleteListeners(rects: BoundingBox[]): void {
    // Implementation for adding edit/delete event listeners to bounding box elements
    rects.forEach(rect => {
      // Add event listeners for edit/delete operations
      // This would typically be handled by the CanvasController
    });
  }
}
