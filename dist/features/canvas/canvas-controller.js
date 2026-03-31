import { createCanvasShell } from "./canvas-shell.js";
import { createDetectionCanvasWorkflow } from "./detection-canvas-workflow.js";
import { createSegmentationCanvasWorkflow } from "../segmentation/workflow.js";
export { createCanvasShell } from "./canvas-shell.js";
export const DETECTION_CANVAS_WORKFLOW = "detection";
export function createCanvasControllerForWorkflow(workflow, state, deps, sharedShell) {
    const shell = sharedShell ?? createCanvasShell(state, deps);
    switch (workflow) {
        case DETECTION_CANVAS_WORKFLOW:
            return createDetectionCanvasWorkflow(state, deps, shell);
        case "segmentation":
            return createSegmentationCanvasWorkflow(state, deps, shell);
        case "review":
        default:
            return createDetectionCanvasWorkflow(state, deps, shell);
    }
}
export function createCanvasController(state, deps) {
    return createCanvasControllerForWorkflow(DETECTION_CANVAS_WORKFLOW, state, deps);
}
