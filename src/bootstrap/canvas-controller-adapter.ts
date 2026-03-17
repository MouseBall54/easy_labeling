import type { CanvasController as AppCanvasController, CanvasControllerDeps } from "../app/contracts.js";
import type { AppState } from "../app/state.js";
import {
  createCanvasController,
  type CanvasController as FeatureCanvasController,
  type CanvasControllerState
} from "../features/canvas/canvas-controller.js";
import type { FabricRuntimeLike } from "../features/canvas/fabric-types.js";
import type { RuntimeUiManager } from "./ui-manager-adapter.js";

class LiveCanvasControllerState implements CanvasControllerState {
  constructor(private readonly appState: AppState) {}

  get currentMode() {
    return this.appState.view.currentMode;
  }

  set currentMode(value) {
    this.appState.view.currentMode = value;
  }

  get currentImage() {
    return this.appState.session.currentImage;
  }

  set currentImage(value) {
    this.appState.session.currentImage = value;
  }

  get labelFolderHandle() {
    return this.appState.session.labelFolderHandle;
  }

  set labelFolderHandle(value) {
    this.appState.session.labelFolderHandle = value;
  }

  get showLabelsOnCanvas() {
    return this.appState.view.showLabelsOnCanvas;
  }

  set showLabelsOnCanvas(value) {
    this.appState.view.showLabelsOnCanvas = value;
  }

  get labelFontSize() {
    return this.appState.view.labelFontSize;
  }

  set labelFontSize(value) {
    this.appState.view.labelFontSize = value;
  }

  get isCrosshairVisible() {
    return this.appState.view.isCrosshairVisible;
  }

  set isCrosshairVisible(value) {
    this.appState.view.isCrosshairVisible = value;
  }

  get lastMousePosition() {
    return this.appState.view.lastMousePosition;
  }

  set lastMousePosition(value) {
    this.appState.view.lastMousePosition = value;
  }

  get labelSortOrder() {
    return this.appState.view.labelSortOrder;
  }

  set labelSortOrder(value) {
    this.appState.view.labelSortOrder = value;
  }
}

export interface RuntimeCanvasController extends AppCanvasController {
  raw: FeatureCanvasController;
}

export function createCanvasControllerAdapter(input: {
  state: AppState;
  fabricRef: FabricRuntimeLike;
  documentRef: Document;
  windowRef: Pick<Window, "prompt">;
}): RuntimeCanvasController {
  let uiManager: RuntimeUiManager | null = null;
  let connectedDeps: CanvasControllerDeps | null = null;

  const fallbackPrompt = async (defaultValue: string): Promise<string> => {
    const value = input.windowRef.prompt("Enter label class:", defaultValue);
    if (value === null) {
      throw new Error("Label prompt cancelled");
    }
    return value;
  };

  const featureController = createCanvasController(new LiveCanvasControllerState(input.state), {
    fabric: input.fabricRef,
    getCanvasContainerSize: () => {
      const canvasContainer = input.documentRef.querySelector<HTMLElement>(".canvas-container");
      if (!canvasContainer) {
        return { width: 800, height: 600 };
      }
      return {
        width: canvasContainer.clientWidth,
        height: canvasContainer.clientHeight
      };
    },
    promptForLabelClass: async (defaultValue) => {
      if (uiManager) {
        return uiManager.promptForLabelClass(defaultValue);
      }
      return fallbackPrompt(defaultValue);
    },
    updateLabelList: () => {
      void connectedDeps;
    },
    updateZoomDisplay: () => {
      uiManager?.updateZoomDisplay(featureController.canvas.getZoom());
    },
    getDisplayNameForClass: (labelClass) => {
      return uiManager?.getDisplayNameForClass(labelClass) ?? String(labelClass ?? "");
    },
    notify: (message, duration) => {
      uiManager?.notify(message, duration);
    }
  });

  return {
    raw: featureController,

    connect(deps: CanvasControllerDeps): void {
      connectedDeps = deps;
      uiManager = deps.uiManager as RuntimeUiManager;
    },

    setMode(mode): void {
      featureController.setMode(mode);
    }
  };
}
