import type { CanvasController as AppCanvasController, CanvasControllerDeps } from "../app/contracts.js";
import type { AppState } from "../app/state.js";
import { markCurrentDocumentDirty } from "../app/document-status.js";
import {
  createCanvasControllerForWorkflow,
  createCanvasShell,
  type CanvasController as FeatureCanvasController,
  type CanvasControllerState
} from "../features/canvas/canvas-controller.js";
import type { FabricRuntimeLike } from "../features/canvas/fabric-types.js";
import type { WorkflowType } from "../types/labels.js";
import type { SegmentationDocumentSnapshot } from "../features/segmentation/types.js";
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

  get labelDisplayMode() {
    return this.appState.view.labelDisplayMode ?? "auto";
  }

  set labelDisplayMode(value) {
    this.appState.view.labelDisplayMode = value;
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
  loadImageSession(input: {
    image: HTMLImageElement;
    detectionYolo: string;
    segmentationSnapshot: SegmentationDocumentSnapshot | null;
  }): void;
}

export function createCanvasControllerAdapter(input: {
  state: AppState;
  fabricRef: FabricRuntimeLike;
  documentRef: Document;
  windowRef: Pick<Window, "prompt"> & Partial<Pick<Window, "dispatchEvent">>;
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

  const liveState = new LiveCanvasControllerState(input.state);
  const controllerDeps = {
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
    promptForLabelClass: async (defaultValue: string) => {
      if (uiManager) {
        return uiManager.promptForLabelClass(defaultValue);
      }
      return fallbackPrompt(defaultValue);
    },
    updateLabelList: () => {
      void connectedDeps;
    },
    updateZoomDisplay: () => {
      getActiveController().renderAll();
      uiManager?.updateZoomDisplay(getActiveController().canvas.getZoom());
    },
    getDisplayNameForClass: (labelClass: string | undefined) => {
      return uiManager?.getDisplayNameForClass(labelClass) ?? String(labelClass ?? "");
    },
    notify: (message: string, duration?: number) => {
      uiManager?.notify(message, duration);
    },
    onDocumentMutation: () => {
      markCurrentDocumentDirty(input.state);
      input.windowRef.dispatchEvent?.(new Event("easy-labeling:document-status-change"));
    }
  } satisfies Parameters<typeof createCanvasControllerForWorkflow>[2];

  const sharedShell = createCanvasShell(liveState, controllerDeps);
  const workflowControllers: Record<WorkflowType, FeatureCanvasController> = {
    detection: createCanvasControllerForWorkflow("detection", liveState, controllerDeps, sharedShell),
    segmentation: createCanvasControllerForWorkflow("segmentation", liveState, controllerDeps, sharedShell)
  };
  workflowControllers.detection.setWorkflowActive?.(input.state.session.workflow === "detection");
  workflowControllers.segmentation.setWorkflowActive?.(input.state.session.workflow === "segmentation");

  const getActiveController = (): FeatureCanvasController => {
    return workflowControllers[input.state.session.workflow] ?? workflowControllers.detection;
  };

  return {
    get raw() {
      return getActiveController();
    },

    connect(deps: CanvasControllerDeps): void {
      connectedDeps = deps;
      uiManager = deps.uiManager as RuntimeUiManager;
    },

    setMode(mode): void {
      getActiveController().setMode(mode);
    },

    setWorkflow(workflow): void {
      if (workflow === input.state.session.workflow) {
        return;
      }
      getActiveController().setWorkflowActive?.(false);
      input.state.session.workflow = workflow;
      getActiveController().setWorkflowActive?.(true);
      getActiveController().setMode(input.state.view.currentMode);
    },

    loadImageSession({ image, detectionYolo, segmentationSnapshot }): void {
      workflowControllers.detection.clearHistory();
      workflowControllers.segmentation.clear();
      workflowControllers.segmentation.setBackgroundImage(image);
      if (detectionYolo.trim()) {
        workflowControllers.detection.addLabelsFromYolo(detectionYolo);
      }
      workflowControllers.segmentation.loadSegmentationDocumentSnapshot?.(segmentationSnapshot);
      workflowControllers.detection.setWorkflowActive?.(input.state.session.workflow === "detection");
      workflowControllers.segmentation.setWorkflowActive?.(input.state.session.workflow === "segmentation");
      getActiveController().resetZoom();
    }
  };
}
