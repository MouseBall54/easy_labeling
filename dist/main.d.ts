/**
 * Easy Labeling TypeScript Main Entry Point
 *
 * Phase 8 Complete: Application Integration & Testing
 * All modules integrated with complete dependency injection system
 */
/**
 * Main Application Class - Phase 8 Complete Integration
 *
 * This class provides complete dependency injection and module coordination
 * for the TypeScript version of Easy Labeling.
 */
declare class App {
    private appState;
    private fileSystemService;
    private uiManager;
    private canvasController;
    private eventManager;
    private initialized;
    constructor();
    /**
     * Initialize all application components with dependency injection
     */
    private initialize;
    /**
     * Setup cross-component references for circular dependencies
     */
    private setupCrossReferences;
    /**
     * Setup application-level event listeners
     */
    private setupApplicationEvents;
    /**
     * Perform comprehensive functionality testing
     */
    private performFunctionalityTests;
    /**
     * Test component initialization
     */
    private testComponentInitialization;
    /**
     * Test event system integration
     */
    private testEventSystemIntegration;
    /**
     * Test UI functionality
     */
    private testUIFunctionality;
    /**
     * Test canvas functionality
     */
    private testCanvasFunctionality;
    /**
     * Test file system integration
     */
    private testFileSystemIntegration;
    /**
     * Test keyboard shortcuts
     */
    private testKeyboardShortcuts;
    /**
     * Get application state for debugging
     */
    getApplicationState(): {
        initialized: boolean;
        appState: Record<string, any>;
        canvas: {
            hasCanvas: boolean;
            mode: import("./types").Mode;
        };
        ui: {
            hasUIManager: boolean;
        };
        events: {
            hasEventManager: boolean;
        };
        fileSystem: {
            hasFileSystemService: boolean;
        };
    };
    /**
     * Cleanup application resources
     */
    destroy(): void;
}
export { App };
export { AppState, createAppState, createAppStateWithConfig } from './models';
export { FileSystemService, createFileSystemService, YoloParser } from './services';
export { CanvasController } from './controllers/CanvasController';
export { EventManager } from './controllers/EventManager';
export { UIManager } from './ui/UIManager';
export { parseYolo, exportYolo, validateYoloString } from './utils';
//# sourceMappingURL=main.d.ts.map