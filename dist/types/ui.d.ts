/**
 * UI Type Definitions
 *
 * Types related to user interface management, DOM elements, and UI interactions.
 */
import { Mode, Point } from './index';
import { ICanvasController, BoundingBox } from './canvas';
import { IFileSystem } from './file-system';
import { AppStateConfig } from './app-state';
export interface BootstrapModal {
    show(): void;
    hide(): void;
    toggle(): void;
    dispose(): void;
}
export interface DOMElements {
    selectImageFolderBtn: HTMLButtonElement;
    selectLabelFolderBtn: HTMLButtonElement;
    loadClassInfoFolderBtn: HTMLButtonElement;
    classFileSelect: HTMLSelectElement;
    viewClassFileBtn: HTMLButtonElement;
    classFileViewerModal: BootstrapModal;
    classFileEditorBody: HTMLElement;
    addClassRowBtn: HTMLButtonElement;
    saveClassFileBtn: HTMLButtonElement;
    downloadClassesBtn: HTMLButtonElement;
    imageList: HTMLElement;
    imageSearchInput: HTMLInputElement;
    showLabeledCheckbox: HTMLInputElement;
    showUnlabeledCheckbox: HTMLInputElement;
    saveLabelsBtn: HTMLButtonElement;
    autoSaveToggle: HTMLInputElement;
    showLabelsOnCanvasToggle: HTMLInputElement;
    labelFontSizeSlider: HTMLInputElement;
    labelFontSizeValue: HTMLElement;
    crosshairToggle: HTMLInputElement;
    drawModeBtn: HTMLButtonElement;
    editModeBtn: HTMLButtonElement;
    labelList: HTMLElement;
    labelFilters: HTMLElement;
    selectByClassDropdown: HTMLSelectElement;
    selectByClassBtn: HTMLButtonElement;
    sortLabelsAscBtn: HTMLButtonElement;
    sortLabelsDescBtn: HTMLButtonElement;
    zoomInBtn: HTMLButtonElement;
    zoomOutBtn: HTMLButtonElement;
    resetZoomBtn: HTMLButtonElement;
    zoomInput: HTMLInputElement;
    canvasContainer: HTMLElement;
    mouseCoordsDisplay: HTMLElement;
    coordXInput: HTMLInputElement;
    coordYInput: HTMLInputElement;
    goToCoordsBtn: HTMLButtonElement;
    currentImageNameSpan: HTMLElement;
    prevImageBtn: HTMLButtonElement;
    nextImageBtn: HTMLButtonElement;
    leftPanel: HTMLElement;
    rightPanel: HTMLElement;
    leftSplitter: HTMLElement;
    rightSplitter: HTMLElement;
    collapseLeftPanelBtn: HTMLButtonElement;
    expandLeftPanelBtn: HTMLButtonElement;
    collapseRightPanelBtn: HTMLButtonElement;
    expandRightPanelBtn: HTMLButtonElement;
    previewBar: HTMLElement;
    previewBarHeader: HTMLElement;
    togglePreviewBtn: HTMLButtonElement;
    previewPrevBtn: HTMLButtonElement;
    previewNextBtn: HTMLButtonElement;
    previewListWrapper: HTMLElement;
    previewList: HTMLElement;
    bottomPanel: HTMLElement;
    bottomSplitter: HTMLElement;
    darkModeToggle: HTMLInputElement;
    labelClassModal: BootstrapModal;
    labelClassInput: HTMLInputElement;
    classSelectionContainer: HTMLElement;
    saveLabelClassBtn: HTMLButtonElement;
    contextMenu: HTMLElement;
    ctxEditLabel: HTMLElement;
    ctxDeleteLabel: HTMLElement;
    loadingOverlay: HTMLElement;
}
export interface PanelConfig {
    panel: HTMLElement;
    splitter: HTMLElement;
    expandBtn: HTMLButtonElement;
    isCollapsing: boolean;
}
export interface SplitterConfig {
    splitter: HTMLElement;
    panel: HTMLElement;
    direction: 'left' | 'right';
    minWidth: number;
    maxWidth: number;
}
export interface FilterButton {
    element: HTMLButtonElement;
    labelClass: string;
    count: number;
    isActive: boolean;
}
export interface LabelGroup {
    classId: number;
    className: string;
    count: number;
    color: string;
    rects: BoundingBox[];
    isCollapsed: boolean;
}
export interface ContextMenuConfig {
    position: Point;
    context?: any;
    options?: ContextMenuOption[];
}
export interface ContextMenuOption {
    label: string;
    action: () => void;
    icon?: string;
    disabled?: boolean;
}
export interface UIState {
    isImageListVisible: boolean;
    isLabelListVisible: boolean;
    isPreviewBarVisible: boolean;
    isLeftPanelCollapsed: boolean;
    isRightPanelCollapsed: boolean;
    activeFilters: Set<string>;
    selectedLabels: Set<string>;
}
export interface ThemeConfig {
    name: 'light' | 'dark';
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
    borderColor: string;
}
export interface LoadingState {
    isLoading: boolean;
    message: string;
    progress?: number;
}
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
export type UIEventType = 'image:selected' | 'image:list-rendered' | 'label:created' | 'label:edited' | 'label:deleted' | 'label:selected' | 'label:list-rendered' | 'filter:changed' | 'filter:updated' | 'search:changed' | 'mode:changed' | 'theme:changed' | 'panel:toggled' | 'zoom:changed' | 'loading:show' | 'loading:hide' | 'loading:progress' | 'context-menu:show' | 'context-menu:hide';
export interface UIEvent<T = any> {
    type: UIEventType;
    data?: T;
    target?: HTMLElement;
    timestamp: Date;
}
export type UIEventHandler<T = any> = (event: UIEvent<T>) => void;
export interface KeyboardShortcut {
    key: string;
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    metaKey?: boolean;
    description: string;
    action: string;
    category?: string;
    preventDefault?: boolean;
    enabled?: boolean;
}
export type MouseEventType = 'click' | 'dblclick' | 'mousedown' | 'mouseup' | 'mousemove' | 'mouseenter' | 'mouseleave' | 'wheel' | 'contextmenu';
export interface ContextMenuEvent {
    type: 'canvas' | 'ui' | 'generic';
    position: Point;
    canvasPosition?: Point;
    target: any;
    hasSelection: boolean;
    selectedObjects: any[];
}
export interface EventManagerEvent {
    type: string;
    data?: any;
    timestamp?: Date;
}
export type EventManagerEventHandler = (event: EventManagerEvent) => void;
export interface EventManagerConfig {
    enableKeyboardShortcuts: boolean;
    enableContextMenu: boolean;
    enableDragAndDrop: boolean;
    doubleClickDelay: number;
    longPressDelay: number;
    dragThreshold: number;
}
export interface IEventManager {
    addEventListener(type: string, handler: EventManagerEventHandler): void;
    removeEventListener(type: string, handler: EventManagerEventHandler): void;
    getShortcuts(): KeyboardShortcut[];
    setConfig(config: Partial<EventManagerConfig>): void;
    getConfig(): EventManagerConfig;
    destroy(): void;
}
export interface UIValidation {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    element?: HTMLElement;
}
export interface UIMethods {
    getDOMElements(): DOMElements;
    showLoadingIndicator(): void;
    hideLoadingIndicator(): void;
    updateLoadingProgress(progress: number, message?: string): void;
    togglePanel(config: PanelConfig): void;
    setupSplitters(): void;
    resizePanels(): void;
    renderImageList(): void;
    updateLabelList(): void;
    updateLabelFilters(rects: BoundingBox[]): void;
    updateSelectByClassDropdown(rects: BoundingBox[]): void;
    updateLabelFolderButton(selected: boolean, folderName?: string): void;
    updateModeButtons(mode: Mode): void;
    updateZoomDisplay(): void;
    updateMouseCoords(x: number, y: number): void;
    updateCurrentImageDisplay(imageName: string): void;
    applyTheme(theme: ThemeConfig): void;
    toggleDarkMode(): void;
    getDisplayNameForClass(labelClass: string): string;
    showClassEditor(): void;
    hideClassEditor(): void;
    showContextMenuAt(position: Point, context?: any): void;
    hideContextMenu(): void;
    addEditDeleteListeners(rects: BoundingBox[]): void;
    addEventListener(type: UIEventType, handler: UIEventHandler): void;
    removeEventListener(type: UIEventType, handler: UIEventHandler): void;
    validateUIState(): UIValidation;
    validateFormData(formData: FormData): UIValidation;
}
export interface IUIManager extends UIMethods {
    readonly state: AppStateConfig;
    readonly canvasController: ICanvasController;
    readonly fileSystem: IFileSystem;
    readonly elements: DOMElements;
    getCurrentTheme(): ThemeConfig;
    getUIState(): UIState;
    getSearchOptions(): SearchOptions;
    getFilterOptions(): FilterOptions;
}
export interface UIFactory {
    create(state: AppStateConfig, canvasController: ICanvasController, fileSystem: IFileSystem): IUIManager;
}
export interface ImageListItem {
    file: {
        name: string;
        path: string;
    };
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
export interface AccessibilityConfig {
    enableHighContrast: boolean;
    enableScreenReader: boolean;
    enableKeyboardNavigation: boolean;
    focusIndicatorStyle: 'default' | 'high-contrast';
    announceChanges: boolean;
}
export interface ResponsiveBreakpoints {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
}
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
//# sourceMappingURL=ui.d.ts.map