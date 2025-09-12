/**
 * UI Type Definitions
 * 
 * Types related to user interface management, DOM elements, and UI interactions.
 */

import { Mode, LabelSortOrder, Point } from './index';
import { ICanvasController, BoundingBox } from './canvas';
import { IFileSystem } from './file-system';
import { AppStateConfig } from './app-state';

// Bootstrap Modal interface
export interface BootstrapModal {
  show(): void;
  hide(): void;
  toggle(): void;
  dispose(): void;
}

// DOM elements interface
export interface DOMElements {
  // Folder selection buttons
  selectImageFolderBtn: HTMLButtonElement;
  selectLabelFolderBtn: HTMLButtonElement;
  loadClassInfoFolderBtn: HTMLButtonElement;
  
  // Class file elements
  classFileSelect: HTMLSelectElement;
  viewClassFileBtn: HTMLButtonElement;
  classFileViewerModal: BootstrapModal;
  classFileEditorBody: HTMLElement;
  addClassRowBtn: HTMLButtonElement;
  saveClassFileBtn: HTMLButtonElement;
  downloadClassesBtn: HTMLButtonElement;
  
  // Image list elements
  imageList: HTMLElement;
  imageSearchInput: HTMLInputElement;
  showLabeledCheckbox: HTMLInputElement;
  showUnlabeledCheckbox: HTMLInputElement;
  
  // Save/load buttons
  saveLabelsBtn: HTMLButtonElement;
  autoSaveToggle: HTMLInputElement;
  
  // Canvas display options
  showLabelsOnCanvasToggle: HTMLInputElement;
  labelFontSizeSlider: HTMLInputElement;
  labelFontSizeValue: HTMLElement;
  crosshairToggle: HTMLInputElement;
  
  // Mode buttons
  drawModeBtn: HTMLButtonElement;
  editModeBtn: HTMLButtonElement;
  
  // Label list elements
  labelList: HTMLElement;
  labelFilters: HTMLElement;
  selectByClassDropdown: HTMLSelectElement;
  selectByClassBtn: HTMLButtonElement;
  sortLabelsAscBtn: HTMLButtonElement;
  sortLabelsDescBtn: HTMLButtonElement;
  
  // Zoom controls
  zoomInBtn: HTMLButtonElement;
  zoomOutBtn: HTMLButtonElement;
  resetZoomBtn: HTMLButtonElement;
  zoomInput: HTMLInputElement;
  
  // Canvas elements
  canvasContainer: HTMLElement;
  mouseCoordsDisplay: HTMLElement;
  coordXInput: HTMLInputElement;
  coordYInput: HTMLInputElement;
  goToCoordsBtn: HTMLButtonElement;
  
  // Navigation
  currentImageNameSpan: HTMLElement;
  prevImageBtn: HTMLButtonElement;
  nextImageBtn: HTMLButtonElement;
  
  // Panel elements
  leftPanel: HTMLElement;
  rightPanel: HTMLElement;
  leftSplitter: HTMLElement;
  rightSplitter: HTMLElement;
  collapseLeftPanelBtn: HTMLButtonElement;
  expandLeftPanelBtn: HTMLButtonElement;
  collapseRightPanelBtn: HTMLButtonElement;
  expandRightPanelBtn: HTMLButtonElement;
  
  // Preview bar elements
  previewBar: HTMLElement;
  previewBarHeader: HTMLElement;
  togglePreviewBtn: HTMLButtonElement;
  previewPrevBtn: HTMLButtonElement;
  previewNextBtn: HTMLButtonElement;
  previewListWrapper: HTMLElement;
  previewList: HTMLElement;
  bottomPanel: HTMLElement;
  bottomSplitter: HTMLElement;
  
  // Theme toggle
  darkModeToggle: HTMLInputElement;
  
  // Label class modal
  labelClassModal: BootstrapModal;
  labelClassInput: HTMLInputElement;
  classSelectionContainer: HTMLElement;
  saveLabelClassBtn: HTMLButtonElement;
  
  // Context menu
  contextMenu: HTMLElement;
  ctxEditLabel: HTMLElement;
  ctxDeleteLabel: HTMLElement;
  
  // Loading indicator
  loadingOverlay: HTMLElement;
}

// Panel configuration
export interface PanelConfig {
  panel: HTMLElement;
  splitter: HTMLElement;
  expandBtn: HTMLButtonElement;
  isCollapsing: boolean;
}

// Splitter configuration
export interface SplitterConfig {
  splitter: HTMLElement;
  panel: HTMLElement;
  direction: 'left' | 'right';
  minWidth: number;
  maxWidth: number;
}

// Filter button data
export interface FilterButton {
  element: HTMLButtonElement;
  labelClass: string;
  count: number;
  isActive: boolean;
}

// Label group data
export interface LabelGroup {
  classId: number;
  className: string;
  count: number;
  color: string;
  rects: BoundingBox[];
  isCollapsed: boolean;
}

// Context menu configuration
export interface ContextMenuConfig {
  x: number;
  y: number;
  target: BoundingBox | null;
  options: ContextMenuOption[];
}

export interface ContextMenuOption {
  label: string;
  action: () => void;
  icon?: string;
  disabled?: boolean;
}

// UI state for components
export interface UIState {
  isImageListVisible: boolean;
  isLabelListVisible: boolean;
  isPreviewBarVisible: boolean;
  isLeftPanelCollapsed: boolean;
  isRightPanelCollapsed: boolean;
  activeFilters: Set<string>;
  selectedLabels: Set<string>;
}

// Theme configuration
export interface ThemeConfig {
  name: 'light' | 'dark';
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
}

// Loading state
export interface LoadingState {
  isLoading: boolean;
  message: string;
  progress?: number;
}

// Search and filter options
export interface SearchOptions {
  searchTerm: string;
  showLabeled: boolean;
  showUnlabeled: boolean;
  sortOrder: 'name' | 'date' | 'size';
  sortDirection: 'asc' | 'desc';
}

export interface FilterOptions {
  activeClasses: Set<string>;
  showAll: boolean;
  hideEmpty: boolean;
}

// UI events
export type UIEventType = 
  | 'image:selected'
  | 'label:created'
  | 'label:edited'
  | 'label:deleted'
  | 'filter:changed'
  | 'search:changed'
  | 'mode:changed'
  | 'theme:changed'
  | 'panel:toggled'
  | 'zoom:changed';

export interface UIEvent<T = any> {
  type: UIEventType;
  data?: T;
  target?: HTMLElement;
  timestamp: Date;
}

export type UIEventHandler<T = any> = (event: UIEvent<T>) => void;

// UI validation
export interface UIValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  element?: HTMLElement;
}

// UI methods interface
export interface UIMethods {
  // Element management
  getDOMElements(): DOMElements;
  
  // Display methods
  showLoadingIndicator(): void;
  hideLoadingIndicator(): void;
  updateLoadingProgress(progress: number, message?: string): void;
  
  // Panel management
  togglePanel(config: PanelConfig): void;
  setupSplitters(): void;
  resizePanels(): void;
  
  // List updates
  renderImageList(): void;
  updateLabelList(): void;
  updateLabelFilters(rects: BoundingBox[]): void;
  updateSelectByClassDropdown(rects: BoundingBox[]): void;
  
  // Button states
  updateLabelFolderButton(selected: boolean, folderName?: string): void;
  updateModeButtons(mode: Mode): void;
  updateZoomDisplay(): void;
  
  // Coordinate display
  updateMouseCoords(x: number, y: number): void;
  updateCurrentImageDisplay(imageName: string): void;
  
  // Theme management
  applyTheme(theme: ThemeConfig): void;
  toggleDarkMode(): void;
  
  // Class management
  getDisplayNameForClass(labelClass: string): string;
  showClassEditor(): void;
  hideClassEditor(): void;
  
  // Context menu
  showContextMenu(config: ContextMenuConfig): void;
  hideContextMenu(): void;
  
  // Event listeners
  addEditDeleteListeners(rects: BoundingBox[]): void;
  addEventListener(type: UIEventType, handler: UIEventHandler): void;
  removeEventListener(type: UIEventType, handler: UIEventHandler): void;
  
  // Validation
  validateUIState(): UIValidation;
  validateFormData(formData: FormData): UIValidation;
}

// UI controller interface
export interface IUIManager extends UIMethods {
  // Dependencies
  readonly state: AppStateConfig;
  readonly canvasController: ICanvasController;
  readonly fileSystem: IFileSystem;
  readonly elements: DOMElements;
  
  // State
  getCurrentTheme(): ThemeConfig;
  getUIState(): UIState;
  getSearchOptions(): SearchOptions;
  getFilterOptions(): FilterOptions;
}

// UI factory
export interface UIFactory {
  create(
    state: AppStateConfig, 
    canvasController: ICanvasController, 
    fileSystem: IFileSystem
  ): IUIManager;
}

// Component-specific interfaces
export interface ImageListItem {
  file: { name: string; path: string };
  isLabeled: boolean;
  isSelected: boolean;
  element: HTMLElement;
}

export interface LabelListItem {
  id: string;
  classId: number;
  className: string;
  boundingBox: BoundingBox;
  isSelected: boolean;
  element: HTMLElement;
}

export interface PreviewItem {
  fileName: string;
  imageURL: string;
  thumbnail: HTMLElement;
  isSelected: boolean;
}

// Keyboard shortcuts
export interface KeyboardShortcut {
  key: string;
  modifiers?: ('ctrl' | 'alt' | 'shift')[];
  action: () => void;
  description: string;
  category: 'navigation' | 'editing' | 'view' | 'file';
}

// Accessibility support
export interface AccessibilityConfig {
  enableHighContrast: boolean;
  enableScreenReader: boolean;
  enableKeyboardNavigation: boolean;
  focusIndicatorStyle: 'default' | 'high-contrast';
  announceChanges: boolean;
}

// Responsive breakpoints
export interface ResponsiveBreakpoints {
  xs: number; // < 576px
  sm: number; // >= 576px
  md: number; // >= 768px
  lg: number; // >= 992px
  xl: number; // >= 1200px
  xxl: number; // >= 1400px
}

// UI configuration
export interface UIConfig {
  theme: ThemeConfig;
  accessibility: AccessibilityConfig;
  responsive: ResponsiveBreakpoints;
  animations: {
    enabled: boolean;
    duration: number;
    easing: string;
  };
  panels: {
    defaultLeftWidth: number;
    defaultRightWidth: number;
    minPanelWidth: number;
    maxPanelWidth: number;
  };
}