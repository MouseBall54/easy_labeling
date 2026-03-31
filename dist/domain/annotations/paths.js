export const ANNOTATION_PATH_CONVENTIONS = {
    detection: {
        primaryDir: "label",
        primaryExtension: ".txt",
        sidecarSuffixes: []
    },
    segmentation: {
        primaryDir: "mask",
        primaryExtension: ".png",
        sidecarSuffixes: [".seg.json"]
    }
};
function normalizeImageBaseName(imageBaseName) {
    const normalized = imageBaseName.trim();
    if (normalized.length === 0) {
        throw new Error("imageBaseName must not be empty");
    }
    return normalized;
}
export function resolveAnnotationAssetPaths(workflow, imageBaseName) {
    const normalized = normalizeImageBaseName(imageBaseName);
    const convention = ANNOTATION_PATH_CONVENTIONS[workflow];
    return {
        primaryFilePath: `${convention.primaryDir}/${normalized}${convention.primaryExtension}`,
        sidecarFilePaths: convention.sidecarSuffixes.map((suffix) => `${convention.primaryDir}/${normalized}${suffix}`)
    };
}
export function resolveReviewDocumentPath(workflow, imageBaseName) {
    const normalized = normalizeImageBaseName(imageBaseName);
    return `review/${workflow}/${normalized}.review.json`;
}
