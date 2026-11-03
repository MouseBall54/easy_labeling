import type { RefineRect, RefineSide } from "../domain/refine/edge-refine.js";

/**
 * Canvas marks for boxes to review (Refine) and reclass candidates. They sit beside the box instead of
 * thickening its outline, so they stay readable on images with hundreds of small boxes: a fixed-size pin on the
 * top-right corner, carets outside weak sides, and a tag only when it fits under the box or the box has focus.
 */
export const PIN_DIAMETER = 12;
export const DIM_OPACITY = 0.3;
export const CARET_MIN_SIZE = 24;
export const REVIEW_COLOR = "#f0ad4e";
export const AREA_COLOR = "#dc3545";
export const RECLASS_COLOR = "#e64980";

const CARET_GAP = 4;
const CARET_SIZE = 7;
const TAG_HEIGHT = 15;
const TAG_PADDING = 4;

export interface MarkTarget {
  id: string;
  /** Box in screen pixels. */
  screen: RefineRect;
  /** areaChange is set only when the area change is flagged. */
  review?: { weakSides: readonly RefineSide[]; areaChange: number | null };
  reclass?: { toClass: string; label: string };
  /** Selected, or the box the review navigation is on. */
  focused: boolean;
}

export interface MarkLayout {
  pins: { x: number; y: number; color: string; text: string }[];
  carets: { side: RefineSide; x: number; y: number }[];
  tags: { x: number; y: number; color: string; text: string }[];
}

export const areaText = (change: number): string => `${change >= 0 ? "+" : "−"}${Math.abs(change * 100).toFixed(0)}% area`;

export function layoutMarks(target: MarkTarget, measure: (text: string) => number): MarkLayout {
  const { x0, y0, x1, y1 } = target.screen;
  const layout: MarkLayout = { pins: [], carets: [], tags: [] };
  const review = target.review;
  const area = review?.areaChange ?? null;
  const reviewColor = area !== null ? AREA_COLOR : REVIEW_COLOR;
  if (target.reclass) layout.pins.push({ x: review ? x1 - PIN_DIAMETER - 2 : x1, y: y0, color: RECLASS_COLOR, text: target.reclass.toClass });
  if (review) layout.pins.push({ x: x1, y: y0, color: reviewColor, text: "!" });

  if (review && Math.min(x1 - x0, y1 - y0) >= CARET_MIN_SIZE) {
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;
    for (const side of review.weakSides) {
      if (side === "L") layout.carets.push({ side, x: x0 - CARET_GAP, y: cy });
      if (side === "R") layout.carets.push({ side, x: x1 + CARET_GAP, y: cy });
      if (side === "T") layout.carets.push({ side, x: cx, y: y0 - CARET_GAP });
      if (side === "B") layout.carets.push({ side, x: cx, y: y1 + CARET_GAP });
    }
  }

  const texts: { text: string; color: string }[] = [];
  if (target.reclass) texts.push({ text: target.reclass.label, color: RECLASS_COLOR });
  if (area !== null) texts.push({ text: areaText(area), color: AREA_COLOR });
  let y = y1 + CARET_GAP + (review?.weakSides.includes("B") ? CARET_SIZE + 2 : 2);
  for (const { text, color } of texts) {
    if (!target.focused && x1 - x0 < measure(text) + 2 * TAG_PADDING) continue;
    layout.tags.push({ x: x0, y, color, text });
    y += TAG_HEIGHT + 2;
  }
  return layout;
}

export function drawMarks(context: CanvasRenderingContext2D, layout: MarkLayout): void {
  context.save();
  context.lineJoin = "round";
  for (const caret of layout.carets) {
    // A small triangle outside the side, pointing at it.
    const s = CARET_SIZE;
    const tip = { L: [s, 0], R: [-s, 0], T: [0, s], B: [0, -s] }[caret.side];
    const along = caret.side === "L" || caret.side === "R" ? [0, s * 0.8] : [s * 0.8, 0];
    const bx = caret.x - tip[0];
    const by = caret.y - tip[1];
    context.beginPath();
    context.moveTo(caret.x, caret.y);
    context.lineTo(bx + along[0], by + along[1]);
    context.lineTo(bx - along[0], by - along[1]);
    context.closePath();
    context.fillStyle = REVIEW_COLOR;
    context.strokeStyle = "rgba(0, 0, 0, 0.6)";
    context.lineWidth = 1;
    context.fill();
    context.stroke();
  }
  context.font = "700 9px system-ui, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  for (const pin of layout.pins) {
    context.beginPath();
    context.arc(pin.x, pin.y, PIN_DIAMETER / 2, 0, Math.PI * 2);
    context.fillStyle = pin.color;
    context.fill();
    context.lineWidth = 1.5;
    context.strokeStyle = "#ffffff";
    context.stroke();
    context.fillStyle = "#ffffff";
    context.fillText(pin.text, pin.x, pin.y + 0.5);
  }
  context.font = "600 11px system-ui, sans-serif";
  context.textAlign = "left";
  for (const tag of layout.tags) {
    const width = context.measureText(tag.text).width + 2 * TAG_PADDING;
    context.fillStyle = tag.color;
    context.beginPath();
    context.roundRect(tag.x, tag.y, width, TAG_HEIGHT, 3);
    context.fill();
    context.fillStyle = "#ffffff";
    context.fillText(tag.text, tag.x + TAG_PADDING, tag.y + TAG_HEIGHT / 2 + 0.5);
  }
  context.restore();
}
