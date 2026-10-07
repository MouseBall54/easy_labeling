export interface YoloRectLike {
  labelClass?: string;
  setCoords(): void;
  getCenterPoint(): { x: number; y: number };
  getScaledWidth(): number;
  getScaledHeight(): number;
}

export interface ParsedYoloRow {
  labelClass: string;
  x_center: string | undefined;
  y_center: string | undefined;
  width: string | undefined;
  height: string | undefined;
  rectLeft: number;
  rectTop: number;
  rectWidth: number;
  rectHeight: number;
}

function parseLegacyYoloFloat(value: string | undefined): number {
  return parseFloat(String(value));
}

export function parseYoloRows(yoloData: string, imgWidth: number, imgHeight: number): ParsedYoloRow[] {
  const lines = yoloData.split("\n").filter((line) => line.trim() !== "");
  const rows: ParsedYoloRow[] = [];

  lines.forEach((line) => {
    const [labelClass, x_center, y_center, width, height] = line.split(" ").map((val) => val.trim());
    if (labelClass === undefined) {
      return;
    }

    const rectWidth = parseLegacyYoloFloat(width) * imgWidth;
    const rectHeight = parseLegacyYoloFloat(height) * imgHeight;
    const rectLeft = parseLegacyYoloFloat(x_center) * imgWidth - rectWidth / 2;
    const rectTop = parseLegacyYoloFloat(y_center) * imgHeight - rectHeight / 2;

    rows.push({
      labelClass,
      x_center,
      y_center,
      width,
      height,
      rectLeft,
      rectTop,
      rectWidth,
      rectHeight
    });
  });

  return rows;
}

export function serializeRectsToYolo(rects: YoloRectLike[], imgWidth: number, imgHeight: number): string {
  let yoloString = "";

  rects.forEach((rect) => {
    const labelClass = rect.labelClass || "0";
    rect.setCoords();
    const center = rect.getCenterPoint();
    const width = rect.getScaledWidth();
    const height = rect.getScaledHeight();
    const xCenter = center.x / imgWidth;
    const yCenter = center.y / imgHeight;
    const normWidth = width / imgWidth;
    const normHeight = height / imgHeight;

    yoloString += `${labelClass} ${xCenter.toFixed(15)} ${yCenter.toFixed(15)} ${normWidth.toFixed(15)} ${normHeight.toFixed(15)}\n`;
  });

  return yoloString;
}

export function removeOutOfBoundsYoloRows(yoloData: string): { text: string; removedCount: number } {
  let removedCount = 0;
  const text = yoloData.split(/\r?\n/).filter((line) => {
    const fields = line.trim().split(/\s+/);
    if (fields.length !== 5) return true;
    const [x, y, width, height] = fields.slice(1).map(Number) as [number, number, number, number];
    if (![x, y, width, height].every(Number.isFinite) || width <= 0 || height <= 0) return true;
    // Allow rounding at the image edge from the 15-decimal YOLO serializer.
    const outside = x - width / 2 < -1e-12 || y - height / 2 < -1e-12
      || x + width / 2 > 1 + 1e-12 || y + height / 2 > 1 + 1e-12;
    if (outside) removedCount++;
    return !outside;
  }).join("\n");
  return { text: removedCount ? (text.trim() ? text : "") : yoloData, removedCount };
}
