import type { WorkflowType } from "../../types/labels.js";
import type { CanvasController, CanvasControllerDeps, CanvasControllerState, CanvasShell } from "./canvas-controller-types.js";
import { createCanvasShell } from "./canvas-shell.js";
import { createDetectionCanvasWorkflow } from "./detection-canvas-workflow.js";
import { createSegmentationCanvasWorkflow } from "../segmentation/workflow.js";

export type { CanvasController, CanvasControllerDeps, CanvasControllerState } from "./canvas-controller-types.js";
export { createCanvasShell } from "./canvas-shell.js";

export const DETECTION_CANVAS_WORKFLOW: WorkflowType = "detection";

export function createCanvasControllerForWorkflow(
  workflow: WorkflowType,
  state: CanvasControllerState,
  deps: CanvasControllerDeps,
  sharedShell?: CanvasShell
): CanvasController {
  const shell = sharedShell ?? createCanvasShell(state, deps);
  switch (workflow) {
    case DETECTION_CANVAS_WORKFLOW:
      return createDetectionCanvasWorkflow(state, deps, shell);
    case "segmentation":
      return createSegmentationCanvasWorkflow(state, deps, shell);
    default:
      return createDetectionCanvasWorkflow(state, deps, shell);
  }
}

export function createCanvasController(state: CanvasControllerState, deps: CanvasControllerDeps): CanvasController {
  return createCanvasControllerForWorkflow(DETECTION_CANVAS_WORKFLOW, state, deps);
}
