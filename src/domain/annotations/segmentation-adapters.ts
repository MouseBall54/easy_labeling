import { createSegmentationAnnotationCodec } from "./segmentation-codec.js";
import { decodeCocoSegmentation, decodeLabelMeSegmentation, encodeCocoSegmentation, encodeLabelMeSegmentation } from "./segmentation-external-codecs.js";
import { createInstanceAnnotationModel, createSemanticAnnotationModel, createSemanticSnapshotFromAnnotationModel, type InternalSegmentationAnnotationModel } from "./segmentation-model.js";
import type { SegmentationExternalFormat } from "./segmentation-format.js";
import { decodeYoloSegmentation, encodeYoloSegmentation } from "./yolo-segmentation.js";

export type ImportableSegmentationFormat = Exclude<SegmentationExternalFormat, "auto">;

export function importSegmentationAnnotations(input: {
  format: ImportableSegmentationFormat;
  imageId: string | number;
  imagePath: string;
  width: number;
  height: number;
  text?: string;
  pngBytes?: ArrayBuffer | Uint8Array;
  metadataText?: string | null;
  classIdByName?: ReadonlyMap<string, string>;
}): InternalSegmentationAnnotationModel {
  if (input.format === "png-semantic-mask") {
    if (!input.pngBytes) throw new Error("PNG mask import needs image bytes");
    const document = createSegmentationAnnotationCodec().decode({
      imageBaseName: String(input.imageId),
      pngBytes: input.pngBytes,
      metadataText: input.metadataText ?? null
    });
    return document.data.model;
  }
  if (!input.text) throw new Error(`${input.format} import needs text`);
  if (input.format === "yolo-segmentation") {
    return createInstanceAnnotationModel({
      imageId: String(input.imageId), imagePath: input.imagePath, width: input.width, height: input.height,
      annotations: decodeYoloSegmentation({ text: input.text, width: input.width, height: input.height })
    });
  }
  if (input.format === "coco-segmentation") {
    return createInstanceAnnotationModel({
      imageId: String(input.imageId), imagePath: input.imagePath, width: input.width, height: input.height,
      annotations: decodeCocoSegmentation({ text: input.text, imageId: input.imageId, imageFileName: input.imagePath.split("/").pop(), width: input.width, height: input.height }).annotations
    });
  }
  const annotations = decodeLabelMeSegmentation({ text: input.text, width: input.width, height: input.height }).map((annotation) => ({
    ...annotation,
    classId: input.classIdByName?.get(annotation.classId) ?? annotation.classId
  }));
  return createInstanceAnnotationModel({
    imageId: String(input.imageId), imagePath: input.imagePath, width: input.width, height: input.height,
    annotations
  });
}

export function exportSegmentationAnnotations(input: {
  format: ImportableSegmentationFormat;
  model: InternalSegmentationAnnotationModel;
  fileName: string;
}): { text?: string; pngAssets?: ReturnType<ReturnType<typeof createSegmentationAnnotationCodec>["encode"]> } {
  if (input.format === "png-semantic-mask") {
    const snapshot = createSemanticSnapshotFromAnnotationModel(input.model);
    return { pngAssets: createSegmentationAnnotationCodec().encode({ imageBaseName: input.model.imageId, snapshot }) };
  }
  if (input.model.annotationType !== "instance") {
    throw new Error(`${input.format} export needs an instance annotation model`);
  }
  if (input.format === "yolo-segmentation") {
    return { text: encodeYoloSegmentation({ width: input.model.width, height: input.model.height, annotations: input.model.annotations }) };
  }
  if (input.format === "coco-segmentation") {
    return { text: encodeCocoSegmentation({ imageId: input.model.imageId, fileName: input.fileName, width: input.model.width, height: input.model.height, annotations: input.model.annotations }) };
  }
  return { text: encodeLabelMeSegmentation({ imagePath: input.fileName, width: input.model.width, height: input.model.height, annotations: input.model.annotations }) };
}

export function createSemanticModelFromSnapshot(input: {
  imageId: string;
  imagePath: string;
  snapshot: Parameters<typeof createSemanticAnnotationModel>[0]["snapshot"];
}): InternalSegmentationAnnotationModel {
  return createSemanticAnnotationModel(input);
}
