export const SEGMENTATION_EXTERNAL_FORMATS = [
  "auto",
  "yolo-segmentation",
  "coco-segmentation",
  "png-semantic-mask",
  "labelme"
] as const;

export type SegmentationExternalFormat = typeof SEGMENTATION_EXTERNAL_FORMATS[number];

export interface SegmentationFormatDetectionInput {
  fileNames: readonly string[];
  directoryNames?: readonly string[];
  jsonTextByFileName?: ReadonlyMap<string, string>;
}

export interface SegmentationFormatDetectionResult {
  format: Exclude<SegmentationExternalFormat, "auto"> | null;
  confidence: "certain" | "ambiguous" | "unknown";
  reason: string;
}

function normalizedNames(values: readonly string[] | undefined): Set<string> {
  return new Set((values ?? []).map((value) => value.trim().toLowerCase()));
}

function includesJsonShape(jsonText: string | undefined, keys: readonly string[]): boolean {
  if (!jsonText) {
    return false;
  }
  try {
    const parsed = JSON.parse(jsonText) as Record<string, unknown>;
    return keys.every((key) => Object.prototype.hasOwnProperty.call(parsed, key));
  } catch {
    return false;
  }
}

export function detectSegmentationFormat(input: SegmentationFormatDetectionInput): SegmentationFormatDetectionResult {
  const files = normalizedNames(input.fileNames);
  const directories = normalizedNames(input.directoryNames);
  const jsonEntries = [...(input.jsonTextByFileName ?? new Map()).entries()];
  const hasLabelMe = jsonEntries.some(([, text]) => includesJsonShape(text, ["shapes", "imagePath"]));
  const hasCoco = jsonEntries.some(([, text]) => includesJsonShape(text, ["images", "annotations", "categories"]));
  const hasYolo = files.has("data.yaml") && (directories.has("labels") || [...files].some((name) => name.endsWith(".txt")));
  const hasPngMask = directories.has("mask") || directories.has("masks") || [...files].some((name) => /(?:^|[_-])mask\.png$/i.test(name));
  const candidates = [
    hasYolo ? "yolo-segmentation" : null,
    hasCoco ? "coco-segmentation" : null,
    hasLabelMe ? "labelme" : null,
    hasPngMask ? "png-semantic-mask" : null
  ].filter((format): format is Exclude<SegmentationExternalFormat, "auto"> => format !== null);

  if (candidates.length === 1) {
    return { format: candidates[0]!, confidence: "certain", reason: "Dataset structure matches one supported segmentation format." };
  }
  if (candidates.length > 1) {
    return { format: null, confidence: "ambiguous", reason: "Multiple supported segmentation formats were detected. Choose the source format." };
  }
  return { format: null, confidence: "unknown", reason: "No supported segmentation format could be identified safely." };
}

export function isFormatSupportedForAnnotationType(
  format: SegmentationExternalFormat,
  annotationType: "semantic" | "instance"
): boolean {
  if (format === "auto") {
    return true;
  }
  if (annotationType === "semantic") {
    return format === "png-semantic-mask";
  }
  return format === "yolo-segmentation" || format === "coco-segmentation" || format === "labelme";
}
