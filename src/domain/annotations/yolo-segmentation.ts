import type { SegmentationAnnotation } from "./segmentation-model.js";
import { rasterizePolygon } from "./segmentation-raster.js";

export function decodeYoloSegmentation(input: { text: string; width: number; height: number }): SegmentationAnnotation[] {
  return input.text.split(/\r?\n/).reduce<SegmentationAnnotation[]>((annotations, line, rowIndex) => {
    const values = line.trim().split(/\s+/).map(Number);
    if (values.length < 7 || values.some((value) => !Number.isFinite(value))) return annotations;
    const [classId, ...coordinates] = values;
    if (classId === undefined || !Number.isInteger(classId) || classId < 0 || coordinates.length % 2 !== 0) return annotations;
    const polygon = [] as Array<{ x: number; y: number }>;
    for (let index = 0; index < coordinates.length; index += 2) {
      polygon.push({ x: (coordinates[index] ?? 0) * input.width, y: (coordinates[index + 1] ?? 0) * input.height });
    }
    annotations.push({
      annotationId: `yolo-${rowIndex + 1}`,
      classId: String(classId),
      instanceId: `yolo-${rowIndex + 1}`,
      mask: rasterizePolygon(input.width, input.height, polygon),
      polygon,
      attributes: {}
    });
    return annotations;
  }, []);
}

export function encodeYoloSegmentation(input: { width: number; height: number; annotations: readonly SegmentationAnnotation[] }): string {
  return input.annotations.map((annotation) => {
    if (!annotation.polygon || annotation.polygon.length < 3) throw new Error(`YOLO export needs a polygon for ${annotation.annotationId}`);
    const coordinates = annotation.polygon.flatMap((point) => [point.x / input.width, point.y / input.height]);
    return [annotation.classId, ...coordinates.map((value) => value.toFixed(6))].join(" ");
  }).join("\n");
}
