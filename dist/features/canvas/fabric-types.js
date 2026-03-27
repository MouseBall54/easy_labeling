let fallbackAnnotationIdCounter = 0;
export function createAnnotationId() {
    if (typeof globalThis.crypto?.randomUUID === "function") {
        return globalThis.crypto.randomUUID();
    }
    fallbackAnnotationIdCounter += 1;
    return `annotation-${fallbackAnnotationIdCounter}`;
}
export function ensureAnnotationId(rect) {
    const existing = rect.annotationId;
    if (typeof existing === "string" && existing.trim().length > 0) {
        return existing;
    }
    const annotationId = createAnnotationId();
    rect.annotationId = annotationId;
    return annotationId;
}
export function assignFreshAnnotationId(rect) {
    const annotationId = createAnnotationId();
    rect.annotationId = annotationId;
    return annotationId;
}
export function isRectObject(object) {
    return object.type === "rect";
}
export function isActiveSelectionObject(object) {
    return object.type === "activeSelection";
}
