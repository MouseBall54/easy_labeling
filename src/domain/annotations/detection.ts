import { parseYoloRows, serializeRectsToYolo, type ParsedYoloRow, type YoloRectLike } from "../yolo/yolo.js";
import type { AnnotationCodec, AnnotationDocument } from "./contracts.js";
import { resolveAnnotationAssetPaths } from "./paths.js";

export interface DetectionAnnotationData {
  yoloText: string;
  rows: ParsedYoloRow[];
}

export interface DetectionAnnotationDocument extends AnnotationDocument<DetectionAnnotationData> {
  workflow: "detection";
  format: "yolo-txt-v1";
}

export interface DetectionAnnotationReadInput {
  imageBaseName: string;
  yoloText: string;
  imageWidth: number;
  imageHeight: number;
}

export interface DetectionAnnotationWriteInput {
  imageBaseName: string;
  rects: YoloRectLike[];
  imageWidth: number;
  imageHeight: number;
}

export function createDetectionAnnotationCodec(): AnnotationCodec<
  DetectionAnnotationReadInput,
  DetectionAnnotationWriteInput,
  DetectionAnnotationDocument
> {
  return {
    workflow: "detection",

    resolvePaths(imageBaseName: string) {
      return resolveAnnotationAssetPaths("detection", imageBaseName);
    },

    decode(input: DetectionAnnotationReadInput): DetectionAnnotationDocument {
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

    encode(input: DetectionAnnotationWriteInput) {
      return [{
        path: resolveAnnotationAssetPaths("detection", input.imageBaseName).primaryFilePath,
        content: serializeRectsToYolo(input.rects, input.imageWidth, input.imageHeight)
      }];
    }
  };
}
