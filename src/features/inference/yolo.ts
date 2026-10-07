export interface ModelInput {
  layout: "nchw" | "nhwc";
  channels: 1 | 3;
  width: number;
  height: number;
  dynamic: boolean;
}

export type OutputFormat = "auto" | "v8" | "v5" | "nms";
export interface Detection {
  classId: number;
  confidence: number;
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export function resolveModelInput(shape: readonly (number | string)[], type: string, size = 640): ModelInput {
  if (type !== "float32" || shape.length !== 4 || (typeof shape[0] === "number" && shape[0] > 1)) {
    throw new Error("Use a float32 Detection ONNX model with one image input and batch size 1.");
  }
  const first = shape[1] === 1 || shape[1] === 3;
  const last = shape[3] === 1 || shape[3] === 3;
  if (first === last) throw new Error("Cannot identify the model's 1ch/3ch input layout. Export with a fixed channel dimension.");
  if (!Number.isInteger(size) || size < 32 || size > 4096) throw new Error("Dynamic input size must be between 32 and 4096.");
  const height = shape[first ? 2 : 1];
  const width = shape[first ? 3 : 2];
  return {
    layout: first ? "nchw" : "nhwc",
    channels: shape[first ? 1 : 3] as 1 | 3,
    width: typeof width === "number" && width > 0 ? width : size,
    height: typeof height === "number" && height > 0 ? height : size,
    dynamic: typeof width !== "number" || width <= 0 || typeof height !== "number" || height <= 0
  };
}

export function getLetterbox(width: number, height: number, input: ModelInput) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) throw new Error("Invalid image dimensions.");
  const scale = Math.min(input.width / width, input.height / height);
  const resizedWidth = Math.max(1, Math.round(width * scale));
  const resizedHeight = Math.max(1, Math.round(height * scale));
  return {
    left: Math.max(0, Math.round((input.width - resizedWidth) / 2 - 0.1)),
    top: Math.max(0, Math.round((input.height - resizedHeight) / 2 - 0.1)),
    resizedWidth, resizedHeight, scale, width, height
  };
}

export function rgbaToTensor(rgba: Uint8ClampedArray, input: ModelInput): Float32Array {
  const plane = input.width * input.height;
  if (rgba.length !== plane * 4) throw new Error("Image raster does not match the model input.");
  const values = new Float32Array(plane * input.channels);
  for (let pixel = 0; pixel < plane; pixel += 1) {
    const offset = pixel * 4;
    for (let channel = 0; channel < input.channels; channel += 1) {
      const value = input.channels === 1
        ? rgba[offset] * 0.299 + rgba[offset + 1] * 0.587 + rgba[offset + 2] * 0.114
        : rgba[offset + channel];
      values[input.layout === "nchw" ? channel * plane + pixel : pixel * input.channels + channel] = value / 255;
    }
  }
  return values;
}

export function intersectionOverUnion(a: Detection, b: Detection): number {
  const intersection = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left))
    * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  const area = (a.right - a.left) * (a.bottom - a.top) + (b.right - b.left) * (b.bottom - b.top) - intersection;
  return area > 0 ? intersection / area : 0;
}

export function decodeYoloOutput(
  data: ArrayLike<number>, dims: readonly number[],
  letterbox: ReturnType<typeof getLetterbox>,
  options: { confidence: number; iou: number; format: OutputFormat; maxDet?: number }
): Detection[] {
  if (![options.confidence, options.iou].every((value) => Number.isFinite(value) && value >= 0 && value <= 1)) {
    throw new Error("Confidence and IoU must be between 0 and 1.");
  }
  const maxDet = options.maxDet ?? 300;
  if (!Number.isInteger(maxDet) || maxDet < 1 || maxDet > 30000) {
    throw new Error("Max detections must be a whole number between 1 and 30,000.");
  }
  const shape = dims.length === 3 && dims[0] === 1 ? dims.slice(1) : dims;
  if (shape.length !== 2 || !shape.every((value) => Number.isInteger(value) && value >= 0) || data.length !== shape[0] * shape[1]) {
    throw new Error(`Unsupported Detection output [${dims.join(", ")}]. Export a single YOLO prediction tensor.`);
  }
  let format = options.format;
  if (format === "auto") {
    if (shape[1] === 6) {
      throw new Error("Six-column output is ambiguous. Select NMS / end-to-end or YOLOv5 in Output format.");
    }
    format = shape[1] === 0 || shape[0] < shape[1] ? "v8" : "v5";
  }
  const transposed = format === "v8";
  const attributes = shape[transposed ? 0 : 1];
  const count = shape[transposed ? 1 : 0];
  const scoreOffset = format === "v5" ? 5 : 4;
  if ((format === "nms" && attributes !== 6) || (format !== "nms" && attributes <= scoreOffset)) {
    throw new Error(`Output [${dims.join(", ")}] does not match ${format}. Check Output format.`);
  }
  const valueAt = (row: number, column: number): number => data[transposed ? column * count + row : row * attributes + column];
  const candidates: Detection[] = [];
  for (let row = 0; row < count; row += 1) {
    let classId = 0;
    let confidence = -Infinity;
    if (format === "nms") {
      confidence = valueAt(row, 4);
      classId = valueAt(row, 5);
    } else {
      for (let column = scoreOffset; column < attributes; column += 1) {
        const score = valueAt(row, column) * (format === "v5" ? valueAt(row, 4) : 1);
        if (score > confidence) { confidence = score; classId = column - scoreOffset; }
      }
    }
    if (!Number.isFinite(confidence) || confidence < options.confidence || confidence > 1 || !Number.isInteger(classId) || classId < 0) continue;
    const [x, y, w, h] = [0, 1, 2, 3].map((column) => valueAt(row, column));
    const clampX = (value: number): number => Math.max(0, Math.min(letterbox.width, (value - letterbox.left) / letterbox.scale));
    const clampY = (value: number): number => Math.max(0, Math.min(letterbox.height, (value - letterbox.top) / letterbox.scale));
    const box = {
      classId, confidence,
      left: clampX(format === "nms" ? x : x - w / 2),
      top: clampY(format === "nms" ? y : y - h / 2),
      right: clampX(format === "nms" ? w : x + w / 2),
      bottom: clampY(format === "nms" ? h : y + h / 2)
    };
    if ([box.left, box.top, box.right, box.bottom].every(Number.isFinite) && box.right > box.left && box.bottom > box.top) candidates.push(box);
  }
  candidates.sort((a, b) => b.confidence - a.confidence);
  const selected: Detection[] = [];
  // ponytail: cap NMS candidates at 30,000; use indexed NMS if large maxDet values become slow.
  for (const box of candidates.slice(0, 30000)) {
    if (format === "nms" || !selected.some((other) => other.classId === box.classId && intersectionOverUnion(box, other) > options.iou)) selected.push(box);
    if (selected.length === maxDet) break;
  }
  return selected;
}

export function detectionsToYolo(boxes: Detection[], width: number, height: number): string {
  return boxes.map((box) => [
    box.classId,
    ((box.left + box.right) / 2 / width).toFixed(8),
    ((box.top + box.bottom) / 2 / height).toFixed(8),
    ((box.right - box.left) / width).toFixed(8),
    ((box.bottom - box.top) / height).toFixed(8)
  ].join(" ")).join("\n");
}
