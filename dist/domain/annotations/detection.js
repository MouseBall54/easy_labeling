import { parseYoloRows, serializeRectsToYolo } from "../yolo/yolo.js";
import { resolveAnnotationAssetPaths } from "./paths.js";
export function createDetectionAnnotationCodec() {
    return {
        workflow: "detection",
        resolvePaths(imageBaseName) {
            return resolveAnnotationAssetPaths("detection", imageBaseName);
        },
        decode(input) {
            return {
                workflow: "detection",
                format: "yolo-txt-v1",
                paths: resolveAnnotationAssetPaths("detection", input.imageBaseName),
                data: {
                    yoloText: input.yoloText,
                    rows: parseYoloRows(input.yoloText, input.imageWidth, input.imageHeight)
                }
            };
        },
        encode(input) {
            return [{
                    path: resolveAnnotationAssetPaths("detection", input.imageBaseName).primaryFilePath,
                    content: serializeRectsToYolo(input.rects, input.imageWidth, input.imageHeight)
                }];
        }
    };
}
