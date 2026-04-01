import { createInitialAppState } from "./state.js";
import { evaluateBrowserSupport } from "../platform/browser-support.js";
export function createApp(input) {
    const snapshot = input.runtime.getBrowserRuntimeSnapshot();
    const support = (input.evaluateSupport ?? evaluateBrowserSupport)(snapshot);
    if (!support.supported) {
        return {
            ok: false,
            reason: support.reason ?? "missing-show-directory-picker"
        };
    }
    const state = (input.createState ?? createInitialAppState)();
    const canvasController = input.factories.createCanvasController({ state });
    const uiManager = input.factories.createUIManager({ state });
    const fileSystem = input.factories.createFileSystem({ state });
    uiManager.connect({ canvasController, fileSystem });
    fileSystem.connect({ uiManager, canvasController });
    canvasController.connect({ uiManager, fileSystem });
    const eventManager = input.factories.createEventManager({
        state,
        uiManager,
        fileSystem,
        canvasController
    });
    return {
        ok: true,
        app: {
            state,
            canvasController,
            uiManager,
            fileSystem,
            eventManager,
            init() {
                eventManager.bindEventListeners();
            }
        }
    };
}
