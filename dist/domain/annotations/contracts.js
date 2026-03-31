export const ANNOTATION_WORKFLOWS = ["detection", "segmentation"];
export const REVIEW_STATUS_VALUES = ["untouched", "approved", "needs-fix"];
export function createEmptyImageWorkflowStatus() {
    return {
        detection: {
            hasAnnotation: false,
            reviewStatus: "untouched"
        },
        segmentation: {
            hasAnnotation: false,
            reviewStatus: "untouched"
        }
    };
}
