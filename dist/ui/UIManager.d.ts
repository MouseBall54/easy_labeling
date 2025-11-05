/**
 * UI Manager Module
 *
 * Manages all DOM manipulation, UI updates, and user interface interactions.
 * Handles Bootstrap modals, panel management, list rendering, and theme management.
 */
import { IAppState } from '../types/app-state';
import { ICanvasController } from '../types/canvas';
import { IFileSystem } from '../types/file-system';
import { DOMElements, PanelConfig, ContextMenuConfig, UIState, ThemeConfig, SearchOptions, FilterOptions, UIEventType, UIEventHandler, IUIManager } from '../types/ui';
import { Mode } from '../types/index';
import { BoundingBox } from '../types/canvas';
/**
 * UIManager implementation
 * Manages all user interface interactions and DOM manipulation
 */
export declare class UIManager implements IUIManager {
    private _state;
    private _canvasController;
    private _fileSystem;
    private eventHandlers;
    private _elements;
    private panelConfigs;
    private splitterConfigs;
    private currentTheme;
    private loadingState;
    private filterButtons;
    private labelGroups;
    private imageListItems;
    private labelListItems;
    private previewItems;
    constructor(_state: IAppState, _canvasController: ICanvasController, _fileSystem: IFileSystem);
    get elements(): DOMElements;
    get state(): IAppState;
    get canvasController(): ICanvasController;
    get fileSystem(): IFileSystem;
    private initializeElements;
    private getElementById;
    addEventListener(type: UIEventType, handler: UIEventHandler): void;
    removeEventListener(type: UIEventType, handler: UIEventHandler): void;
    private dispatchUIEvent;
    private initializePanelConfigs;
    togglePanel(config: PanelConfig): void;
    setupSplitters(): void;
    private setupSplitter;
    resizePanels(): void;
    showLoadingIndicator(): void;
    hideLoadingIndicator(): void;
    updateLoadingProgress(progress: number, message?: string): void;
    getCurrentTheme(): ThemeConfig;
    private getDefaultTheme;
    private getDarkTheme;
    applyTheme(theme: ThemeConfig): void;
    toggleDarkMode(): void;
    renderImageList(): void;
    private selectImage;
    updateLabelList(): void;
    private selectLabel;
    updateLabelFilters(rects: BoundingBox[]): void;
    private toggleFilter;
    updateSelectByClassDropdown(rects: BoundingBox[]): void;
    updateLabelFolderButton(selected: boolean, folderName?: string): void;
    updateModeButtons(mode: Mode): void;
    updateZoomDisplay(): void;
    updateMouseCoords(x: number, y: number): void;
    updateCurrentImageDisplay(imageName: string): void;
    showContextMenu(config: ContextMenuConfig): void;
    hideContextMenu(): void;
    showClassEditor(): void;
    hideClassEditor(): void;
    getDisplayNameForClass(labelClass: string): string;
    getDOMElements(): DOMElements;
    getUIState(): UIState;
    getSearchOptions(): SearchOptions;
    getFilterOptions(): FilterOptions;
    private setupEventListeners;
    private syncModeUI;
    validateUIState(): any;
    validateFormData(formData: FormData): any;
    addEditDeleteListeners(rects: BoundingBox[]): void;
}
//# sourceMappingURL=UIManager.d.ts.map