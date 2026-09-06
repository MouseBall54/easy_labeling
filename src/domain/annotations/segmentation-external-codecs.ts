import type { CanvasPoint } from "../../types/labels.js";
import type { SegmentationAnnotation } from "./segmentation-model.js";
import { decodeCocoUncompressedRle, encodeCocoUncompressedRle, rasterizePolygon } from "./segmentation-raster.js";

interface CocoCategory {
  id: number;
  name?: string;
}

interface CocoAnnotation {
  id?: number | string;
  image_id: number | string;
  category_id: number;
  segmentation?: number[][] | { counts: number[]; size: [number, number] };
}

interface CocoDocument {
  images?: Array<{ id: number | string; file_name?: string }>;
  categories?: CocoCategory[];
  annotations?: CocoAnnotation[];
}

export interface DecodedCocoSegmentation {
  annotations: SegmentationAnnotation[];
  classNames: Map<string, string>;
}

function clonePolygon(points: readonly number[]): CanvasPoint[] | null {
  if (points.length < 6 || points.length % 2 !== 0 || points.some((value) => !Number.isFinite(value))) {
    return null;
  }
  const polygon: CanvasPoint[] = [];
  for (let index = 0; index < points.length; index += 2) {
    polygon.push({ x: points[index]!, y: points[index + 1]! });
  }
  return polygon;
}

export function decodeCocoSegmentation(input: {
  text: string;
  imageId: number | string;
  imageFileName?: string;
  width: number;
  height: number;
}): DecodedCocoSegmentation {
  const document = JSON.parse(input.text) as CocoDocument;
  const selectedImageId = document.images?.find((image) => image.file_name === input.imageFileName)?.id ?? input.imageId;
  const classNames = new Map((document.categories ?? []).map((category) => [String(category.id), category.name ?? String(category.id)]));
  const annotations = (document.annotations ?? []).reduce<SegmentationAnnotation[]>((result, annotation, index) => {
    if (String(annotation.image_id) !== String(selectedImageId) || !annotation.segmentation) {
      return result;
    }
    const annotationId = String(annotation.id ?? `coco-${index + 1}`);
    if (Array.isArray(annotation.segmentation)) {
      annotation.segmentation.forEach((points, polygonIndex) => {
        const polygon = clonePolygon(points);
        if (!polygon) {
          return;
        }
        result.push({
          annotationId: `${annotationId}-${polygonIndex + 1}`,
          classId: String(annotation.category_id),
          instanceId: annotationId,
          mask: rasterizePolygon(input.width, input.height, polygon),
          polygon,
          attributes: {}
        });
      });
      return result;
    }
    const { counts, size } = annotation.segmentation;
    if (size[0] !== input.height || size[1] !== input.width || !Array.isArray(counts)) {
      return result;
    }
    result.push({
      annotationId,
      classId: String(annotation.category_id),
      instanceId: annotationId,
      mask: decodeCocoUncompressedRle(input.width, input.height, counts),
      polygon: null,
      attributes: {}
    });
    return result;
  }, []);
  return { annotations, classNames };
}

export function encodeCocoSegmentation(input: {
  imageId: number | string;
  fileName: string;
  width: number;
  height: number;
  annotations: readonly SegmentationAnnotation[];
  classNames?: ReadonlyMap<string, string>;
}): string {
  const categoryIds = [...new Set(input.annotations.map((annotation) => annotation.classId))];
  const categories = categoryIds.map((classId) => ({
    id: Number(classId),
    name: input.classNames?.get(classId) ?? classId
  }));
  if (categories.some((category) => !Number.isInteger(category.id) || category.id < 0)) {
    throw new Error("COCO export needs non-negative integer class IDs");
  }
  const annotations = input.annotations.map((annotation, index) => ({
    id: index + 1,
    image_id: input.imageId,
    category_id: Number(annotation.classId),
    iscrowd: 0,
    segmentation: annotation.polygon
      ? [annotation.polygon.flatMap((point) => [point.x, point.y])]
      : {
        size: [input.height, input.width],
        counts: encodeCocoUncompressedRle(input.width, input.height, annotation.mask)
      }
  }));
  return JSON.stringify({
    images: [{ id: input.imageId, file_name: input.fileName, width: input.width, height: input.height }],
    categories,
    annotations
  }, null, 2);
}

interface LabelMeShape {
  label: string;
  shape_type?: string;
  points: number[][];
  group_id?: number | string | null;
}

interface LabelMeDocument {
  imagePath?: string;
  imageWidth?: number;
  imageHeight?: number;
  shapes?: LabelMeShape[];
}

export function decodeLabelMeSegmentation(input: { text: string; width: number; height: number }): SegmentationAnnotation[] {
  const document = JSON.parse(input.text) as LabelMeDocument;
  return (document.shapes ?? []).reduce<SegmentationAnnotation[]>((result, shape, index) => {
    if (shape.shape_type && shape.shape_type !== "polygon") {
      return result;
    }
    const polygon = clonePolygon(shape.points.flat());
    if (!polygon || shape.label.trim().length === 0) {
      return result;
    }
    const annotationId = `labelme-${index + 1}`;
    result.push({
      annotationId,
      classId: shape.label,
      instanceId: shape.group_id === null || shape.group_id === undefined ? annotationId : String(shape.group_id),
      mask: rasterizePolygon(input.width, input.height, polygon),
      polygon,
      attributes: {}
    });
    return result;
  }, []);
}

export function encodeLabelMeSegmentation(input: {
  imagePath: string;
  width: number;
  height: number;
  annotations: readonly SegmentationAnnotation[];
}): string {
  const shapes = input.annotations.map((annotation) => {
    if (!annotation.polygon || annotation.polygon.length < 3) {
      throw new Error(`LabelMe export needs a polygon for ${annotation.annotationId}`);
    }
    return {
      label: annotation.classId,
      points: annotation.polygon.map((point) => [point.x, point.y]),
      group_id: annotation.instanceId,
      shape_type: "polygon",
      flags: {}
    };
  });
  return JSON.stringify({ version: "5.0.1", flags: {}, shapes, imagePath: input.imagePath, imageData: null, imageHeight: input.height, imageWidth: input.width }, null, 2);
}
