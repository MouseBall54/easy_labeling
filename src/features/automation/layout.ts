import {
  LAYOUT_SCHEMA_VERSION,
  type AutomationPreset,
  type BoxLayout,
  type PixelPoint,
  type PixelSize,
  type PlacedLayoutBox,
  type TemplateMatchResult
} from "./types.js";

export interface LayoutCaptureBox {
  id?: string;
  classId: string;
  left: number;
  top: number;
  width: number;
  height: number;
  order?: number;
}

export interface CreateBoxLayoutInput {
  id?: string;
  name: string;
  sourceImageName: string;
  sourceImageSize: PixelSize;
  boxes: readonly LayoutCaptureBox[];
  now?: string;
}

function createId(prefix: string): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function requireFinite(value: number, field: string): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${field} must be a finite number`);
  }
}

function requirePositive(value: number, field: string): void {
  requireFinite(value, field);
  if (value <= 0) {
    throw new Error(`${field} must be greater than zero`);
  }
}

function validateSize(size: PixelSize, field: string): void {
  requirePositive(size.width, `${field}.width`);
  requirePositive(size.height, `${field}.height`);
}

export function createBoxLayout(input: CreateBoxLayoutInput): BoxLayout {
  const name = input.name.trim();
  if (!name) {
    throw new Error("Layout name is required");
  }
  if (input.boxes.length === 0) {
    throw new Error("At least one box is required to create a layout");
  }
  validateSize(input.sourceImageSize, "sourceImageSize");

  input.boxes.forEach((box, index) => {
    requireFinite(box.left, `boxes[${index}].left`);
    requireFinite(box.top, `boxes[${index}].top`);
    requirePositive(box.width, `boxes[${index}].width`);
    requirePositive(box.height, `boxes[${index}].height`);
    if (!box.classId.trim()) {
      throw new Error(`boxes[${index}].classId is required`);
    }
  });

  const sourceAnchor = {
    x: Math.min(...input.boxes.map((box) => box.left)),
    y: Math.min(...input.boxes.map((box) => box.top))
  };
  const now = input.now ?? new Date().toISOString();

  return {
    schemaVersion: LAYOUT_SCHEMA_VERSION,
    id: input.id ?? createId("layout"),
    name,
    sourceImageName: input.sourceImageName,
    sourceImageSize: { ...input.sourceImageSize },
    sourceAnchor,
    createdAt: now,
    updatedAt: now,
    boxes: input.boxes
      .map((box, index) => ({
        id: box.id ?? createId("layout-box"),
        classId: box.classId.trim(),
        relativeX: box.left - sourceAnchor.x,
        relativeY: box.top - sourceAnchor.y,
        width: box.width,
        height: box.height,
        order: box.order ?? index
      }))
      .sort((left, right) => left.order - right.order)
  };
}

export function calculateLayoutAnchor(match: TemplateMatchResult, preset: AutomationPreset): PixelPoint {
  return {
    x: match.x + preset.relationOffset.x + preset.manualOffset.x,
    y: match.y + preset.relationOffset.y + preset.manualOffset.y
  };
}

export function placeBoxLayout(layout: BoxLayout, anchor: PixelPoint, imageSize: PixelSize): PlacedLayoutBox[] {
  validateBoxLayout(layout);
  validateSize(imageSize, "imageSize");
  requireFinite(anchor.x, "anchor.x");
  requireFinite(anchor.y, "anchor.y");

  const boxes = layout.boxes.map((box) => ({
    layoutBoxId: box.id,
    classId: box.classId,
    x: anchor.x + box.relativeX,
    y: anchor.y + box.relativeY,
    width: box.width,
    height: box.height,
    order: box.order
  }));

  const invalid = boxes.find((box) => (
    box.x < 0 || box.y < 0 || box.x + box.width > imageSize.width || box.y + box.height > imageSize.height
  ));
  if (invalid) {
    throw new Error(`Layout box ${invalid.layoutBoxId} falls outside the image bounds`);
  }
  return boxes;
}

export function validateBoxLayout(layout: BoxLayout): void {
  if (layout.schemaVersion !== LAYOUT_SCHEMA_VERSION) {
    throw new Error(`Unsupported layout schema version: ${String(layout.schemaVersion)}`);
  }
  if (!layout.id.trim() || !layout.name.trim()) {
    throw new Error("Layout id and name are required");
  }
  validateSize(layout.sourceImageSize, "sourceImageSize");
  if (layout.boxes.length === 0) {
    throw new Error("Layout must contain at least one box");
  }
  layout.boxes.forEach((box, index) => {
    if (!box.id.trim() || !box.classId.trim()) {
      throw new Error(`Layout box ${index} requires id and classId`);
    }
    requireFinite(box.relativeX, `boxes[${index}].relativeX`);
    requireFinite(box.relativeY, `boxes[${index}].relativeY`);
    requirePositive(box.width, `boxes[${index}].width`);
    requirePositive(box.height, `boxes[${index}].height`);
  });
}
