/**
 * AppState Type Definitions
 *
 * Types related to the main application state management.
 */
import { Point, Mode, LabelSortOrder, FileSystemDirectoryHandle, FileSystemFileHandle } from './index';
export interface ImageFile {
    name: string;
    handle: FileSystemFileHandle;
    path: string;
    extension: string;
    size?: number;
    lastModified?: Date;
}
export interface ClassFile {
    name: string;
    handle: FileSystemFileHandle;
    content: ClassDefinition[];
    isSelected: boolean;
}
export interface ClassDefinition {
    id: number;
    name: string;
    description?: string;
    color?: string;
}
export interface ClipboardData {
    type: 'label' | 'labels';
    data: any;
    timestamp: Date;
}
export type LoadToken = number;
export interface AppStateConfig {
    imageFolderHandle: FileSystemDirectoryHandle | null;
    labelFolderHandle: FileSystemDirectoryHandle | null;
    classInfoFolderHandle: FileSystemDirectoryHandle | null;
    imageFiles: ImageFile[];
    classFiles: ClassFile[];
    selectedClassFile: ClassFile | null;
    imageLabelStatus: Map<string, boolean>;
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
    classNames: Map<string, string>;
    previewImageCache: Map<string, string>;
    contextTarget: any;
    collapsedLabelGroups: Set<string>;
}
export interface AppStateEvent {
    type: string;
    data?: any;
    timestamp: Date;
}
export type AppStateEventHandler = (event: AppStateEvent) => void;
export interface AppStateMethods {
    reset(): void;
    setImageFolder(handle: FileSystemDirectoryHandle): void;
    setLabelFolder(handle: FileSystemDirectoryHandle): void;
    setClassInfoFolder(handle: FileSystemDirectoryHandle): void;
    setCurrentImage(imageFile: ImageFile | null): void;
    getImageLabelStatus(fileName: string): boolean;
    setImageLabelStatus(fileName: string, hasLabels: boolean): void;
    setMode(mode: Mode): void;
    toggleMode(): void;
    selectClassFile(classFile: ClassFile | null): void;
    addClassDefinition(classDef: ClassDefinition): void;
    removeClassDefinition(classId: number): void;
    setAutoSave(enabled: boolean): void;
    setShowLabels(show: boolean): void;
    setLabelFontSize(size: number): void;
    setLabelSortOrder(order: LabelSortOrder): void;
    togglePreviewBar(): void;
    toggleCrosshair(): void;
    setContextTarget(target: any): void;
    cachePreviewImage(fileName: string, objectURL: string): void;
    getCachedPreviewImage(fileName: string): string | undefined;
    clearPreviewCache(): void;
    setClipboard(data: ClipboardData): void;
    getClipboard(): ClipboardData | null;
    clearClipboard(): void;
}
export interface IAppState extends AppStateConfig, AppStateMethods {
    addEventListener(type: string, handler: AppStateEventHandler): void;
    removeEventListener(type: string, handler: AppStateEventHandler): void;
    dispatchEvent(event: AppStateEvent): void;
}
export interface AppStateFactory {
    create(): IAppState;
    createWithConfig(config: Partial<AppStateConfig>): IAppState;
}
export interface AppStateValidation {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}
export interface SerializableAppState {
    currentMode: Mode;
    isAutoSaveEnabled: boolean;
    showLabelsOnCanvas: boolean;
    labelFontSize: number;
    labelSortOrder: LabelSortOrder;
    isPreviewBarHidden: boolean;
    isCrosshairVisible: boolean;
}
export interface AppStateMigration {
    fromVersion: string;
    toVersion: string;
    migrate(oldState: any): AppStateConfig;
}
export type AppStateVersion = '1.0.0' | '1.1.0' | '2.0.0';
//# sourceMappingURL=app-state.d.ts.map