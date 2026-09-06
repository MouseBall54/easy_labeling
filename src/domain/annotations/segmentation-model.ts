import type { CanvasPoint } from "../../types/labels.js";
import type { SegmentationDocumentSnapshot } from "../../features/segmentation/types.js";
import { traceMaskOuterContour } from "./segmentation-raster.js";

export type SegmentationAnnotationType = "semantic" | "instance";

export interface SegmentationAnnotation {
  annotationId: string;
  classId: string;
  instanceId: string | null;
  mask: Uint8Array;
  polygon: CanvasPoint[] | null;
  attributes: Record<string, string | number | boolean>;
}

export interface InternalSegmentationAnnotationModel {
  imageId: string;
  imagePath: string;
  width: number;
  height: number;
  annotationType: SegmentationAnnotationType;
  annotations: SegmentationAnnotation[];
}

function createBinaryMask(source: Uint16Array, classId: number): Uint8Array {
  const mask = new Uint8Array(source.length);
  source.forEach((value, index) => {
    mask[index] = value === classId ? 1 : 0;
  });
  return mask;
}

function assertModelDimensions(width: number, height: number, maskLength: number): void {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || maskLength !== width * height) {
    throw new Error("segmentation annotation mask dimensions are invalid");
  }
}

export function createSemanticAnnotationModel(input: {
  imageId: string;
  imagePath: string;
  snapshot: Pick<SegmentationDocumentSnapshot, "width" | "height" | "mask">;
}): InternalSegmentationAnnotationModel {
  const { width, height, mask } = input.snapshot;
  assertModelDimensions(width, height, mask.length);
  const classIds = [...new Set(mask)].filter((classId) => classId > 0).sort((left, right) => left - right);
  return {
    imageId: input.imageId,
    imagePath: input.imagePath,
    width,
    height,
    annotationType: "semantic",
    annotations: classIds.map((classId) => ({
      annotationId: `semantic-${classId}`,
      classId: String(classId),
      instanceId: null,
      mask: createBinaryMask(mask, classId),
      polygon: null,
      attributes: {}
    }))
  };
}

export function createInstanceAnnotationModel(input: {
  imageId: string;
  imagePath: string;
  width: number;
  height: number;
  annotations: readonly SegmentationAnnotation[];
}): InternalSegmentationAnnotationModel {
  input.annotations.forEach((annotation) => assertModelDimensions(input.width, input.height, annotation.mask.length));
  return {
    imageId: input.imageId,
    imagePath: input.imagePath,
    width: input.width,
    height: input.height,
    annotationType: "instance",
    annotations: input.annotations.map((annotation) => ({
      ...annotation,
      instanceId: annotation.instanceId ?? annotation.annotationId,
      mask: new Uint8Array(annotation.mask),
      polygon: annotation.polygon ? annotation.polygon.map((point) => ({ ...point })) : null,
      attributes: { ...annotation.attributes }
    }))
  };
}

export function createInstanceAnnotationModelFromSnapshot(input: {
  imageId: string;
  imagePath: string;
  snapshot: Pick<SegmentationDocumentSnapshot, "width" | "height" | "mask">;
}): InternalSegmentationAnnotationModel {
  const { width, height, mask } = input.snapshot;
  assertModelDimensions(width, height, mask.length);
  const visited = new Uint8Array(mask.length);
  const annotations: SegmentationAnnotation[] = [];
  for (let start = 0; start < mask.length; start += 1) {
    const classId = mask[start]!;
    if (classId === 0 || visited[start] !== 0) continue;
    const component = new Uint8Array(mask.length);
    const queue = [start];
    visited[start] = 1;
    component[start] = 1;
    for (let cursor = 0; cursor < queue.length; cursor += 1) {
      const index = queue[cursor]!;
      const x = index % width;
      const y = Math.floor(index / width);
      for (const neighbor of [index - 1, index + 1, index - width, index + width]) {
        if (neighbor < 0 || neighbor >= mask.length || (neighbor === index - 1 && x === 0) || (neighbor === index + 1 && x === width - 1)) continue;
        if (visited[neighbor] !== 0 || mask[neighbor] !== classId) continue;
        visited[neighbor] = 1;
        component[neighbor] = 1;
        queue.push(neighbor);
      }
    }
    const annotationId = `instance-${annotations.length + 1}`;
    annotations.push({ annotationId, instanceId: annotationId, classId: String(classId), mask: component, polygon: traceMaskOuterContour(width, height, component), attributes: {} });
  }
  return createInstanceAnnotationModel({ imageId: input.imageId, imagePath: input.imagePath, width, height, annotations });
}

export function createSemanticSnapshotFromAnnotationModel(input: InternalSegmentationAnnotationModel): SegmentationDocumentSnapshot {
  if (input.annotationType !== "semantic") {
    throw new Error("A semantic mask snapshot cannot represent instance annotations without flattening them");
  }
  const mask = new Uint16Array(input.width * input.height);
  input.annotations.forEach((annotation) => {
    assertModelDimensions(input.width, input.height, annotation.mask.length);
    const classId = Number.parseInt(annotation.classId, 10);
    if (!Number.isInteger(classId) || classId < 1 || classId > 65535) {
      throw new Error(`Semantic PNG needs a class ID between 1 and 65535: ${annotation.classId}`);
    }
    annotation.mask.forEach((value, index) => {
      if (value !== 0) mask[index] = classId;
    });
  });
  return {
    width: input.width,
    height: input.height,
    mask,
    activeClassId: "1",
    activeTool: "brush",
    overlayVisible: true,
    overlayOpacity: 0.6,
    hiddenClassIds: new Set(),
    brushRadius: 6
  };
}

export function createEditableSnapshotFromAnnotationModel(input: InternalSegmentationAnnotationModel): SegmentationDocumentSnapshot {
  if (input.annotationType === "semantic") return createSemanticSnapshotFromAnnotationModel(input);
  const mask = new Uint16Array(input.width * input.height);
  input.annotations.forEach((annotation) => {
    const classId = Number.parseInt(annotation.classId, 10);
    if (!Number.isInteger(classId) || classId < 1 || classId > 65535) {
      throw new Error(`Imported instance class must be a numeric ID between 1 and 65535: ${annotation.classId}`);
    }
    annotation.mask.forEach((value, index) => { if (value !== 0) mask[index] = classId; });
  });
  return { width: input.width, height: input.height, mask, activeClassId: "1", activeTool: "brush", overlayVisible: true, overlayOpacity: 0.6, hiddenClassIds: new Set(), brushRadius: 6 };
}
