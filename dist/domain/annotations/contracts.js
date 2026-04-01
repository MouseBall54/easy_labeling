export const ANNOTATION_WORKFLOWS = ["detection", "segmentation"];
export function createEmptyImageWorkflowStatus() {
    return {
        detection: {
            hasAnnotation: false
        },
        segmentation: {
            hasAnnotation: false
        }
    };
}
