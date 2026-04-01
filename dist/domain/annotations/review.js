import { REVIEW_STATUS_VALUES } from "./contracts.js";
import { resolveReviewDocumentPath } from "./paths.js";
function isRecord(value) {
    return typeof value === "object" && value !== null;
}
function isReviewStatus(value) {
    return REVIEW_STATUS_VALUES.some((status) => status === value);
}
export const REVIEW_ISSUE_DEFINITIONS = {
    detection: [
        { key: "geometry", label: "Geometry / placement issue" },
        { key: "classification", label: "Classification issue" },
        { key: "missing-annotation", label: "Missing annotation issue" }
    ],
    segmentation: [
        { key: "coverage", label: "Coverage / completeness issue" },
        { key: "boundary", label: "Boundary / edge quality issue" },
        { key: "stray-mask", label: "Stray mask / spill issue" }
    ]
};
export function getReviewIssueDefinitions(workflow) {
    return REVIEW_ISSUE_DEFINITIONS[workflow];
}
function normalizeIssueFlags(value) {
    if (!isRecord(value)) {
        return {};
    }
    return Object.fromEntries(Object.entries(value).filter((entry) => typeof entry[1] === "boolean"));
}
export function createReviewDocumentCodec(workflow) {
    return {
        workflow,
        resolvePath(imageBaseName) {
            return resolveReviewDocumentPath(workflow, imageBaseName);
        },
        decode(input) {
            let parsed = {};
            try {
                parsed = JSON.parse(input);
            }
            catch {
                parsed = {};
            }
            const candidate = isRecord(parsed) ? parsed : {};
            return {
                workflow,
                format: "review-json-v1",
                status: isReviewStatus(candidate.status) ? candidate.status : "untouched",
                note: typeof candidate.note === "string" ? candidate.note : "",
                issueFlags: normalizeIssueFlags(candidate.issueFlags)
            };
        },
        encode(document) {
            return JSON.stringify({
                workflow,
                format: "review-json-v1",
                status: document.status,
                note: document.note,
                issueFlags: document.issueFlags
            }, null, 2);
        }
    };
}
export function createEmptyReviewDocument(workflow) {
    return {
        workflow,
        format: "review-json-v1",
        status: "untouched",
        note: "",
        issueFlags: {}
    };
}
