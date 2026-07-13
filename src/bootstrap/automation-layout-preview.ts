import type { AppState } from "../app/state.js";
import type { BoxLayout } from "../features/automation/types.js";
import type { UiDomElements } from "../ui/dom-elements.js";
import type { RuntimeCanvasController } from "./canvas-controller-adapter.js";

export interface AutomationLayoutPreview {
  bind(): void;
  clearGhost(): void;
  renderGhost(): void;
  renderLibraryPreview(): void;
}

function intersects(
  left: { x: number; y: number; width: number; height: number },
  right: { x: number; y: number; width: number; height: number }
): boolean {
  return left.x < right.x + right.width &&
    left.x + left.width > right.x &&
    left.y < right.y + right.height &&
    left.y + left.height > right.y;
}

type RectBounds = { x: number; y: number; width: number; height: number };

function createRectSpatialIndex(initialRects: readonly RectBounds[] = []): {
  add(rect: RectBounds): void;
  intersectsAny(rect: RectBounds): boolean;
} {
  const cellSize = 128;
  const cells = new Map<string, RectBounds[]>();
  const cellKeys = (rect: RectBounds): string[] => {
    const left = Math.floor(rect.x / cellSize);
    const top = Math.floor(rect.y / cellSize);
    const right = Math.floor((rect.x + Math.max(0, rect.width)) / cellSize);
    const bottom = Math.floor((rect.y + Math.max(0, rect.height)) / cellSize);
    const keys: string[] = [];
    for (let row = top; row <= bottom; row += 1) {
      for (let column = left; column <= right; column += 1) {
        keys.push(`${column}:${row}`);
      }
    }
    return keys;
  };
  const add = (rect: RectBounds): void => {
    cellKeys(rect).forEach((key) => {
      const bucket = cells.get(key) ?? [];
      bucket.push(rect);
      cells.set(key, bucket);
    });
  };
  initialRects.forEach(add);
  return {
    add,
    intersectsAny(rect): boolean {
      const visited = new Set<RectBounds>();
      for (const key of cellKeys(rect)) {
        for (const candidate of cells.get(key) ?? []) {
          if (!visited.has(candidate)) {
            visited.add(candidate);
            if (intersects(rect, candidate)) {
              return true;
            }
          }
        }
      }
      return false;
    }
  };
}

export function createAutomationLayoutPreview(input: {
  state: AppState;
  elements: UiDomElements;
  canvasController: RuntimeCanvasController;
  getSelectedLayout(): BoxLayout | null;
  getSelectedSetupLayout(): BoxLayout | null;
  getGhostVisible(): boolean;
}): AutomationLayoutPreview {
  return {
    bind(): void {
      input.elements.layoutPreviewZoomInput.addEventListener("input", () => {
        input.elements.previewBoxLayoutBtn.click();
      });
      input.elements.layoutPreviewCanvas.addEventListener("wheel", (event) => {
        if (!event.ctrlKey) {
          return;
        }
        event.preventDefault();
        const current = Number.parseInt(input.elements.layoutPreviewZoomInput.value, 10) || 100;
        const factor = event.deltaY < 0 ? 1.1 : 1 / 1.1;
        input.elements.layoutPreviewZoomInput.value = String(Math.max(1, Math.min(400, Math.round(current * factor))));
        input.elements.previewBoxLayoutBtn.click();
      }, { passive: false });
    },

    clearGhost(): void {
      const canvas = input.elements.layoutGhostCanvas;
      canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
      input.elements.layoutPlacementNotice.dataset.state = "idle";
    },

    renderGhost(): void {
      const layout = input.getSelectedLayout();
      const image = input.state.session.currentImage;
      const canvas = input.elements.layoutGhostCanvas;
      const context = canvas.getContext("2d");
      if (!context) {
        return;
      }
      const fabricCanvas = input.canvasController.raw.canvas;
      const width = Math.max(1, Math.round(fabricCanvas.getWidth()));
      const height = Math.max(1, Math.round(fabricCanvas.getHeight()));
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.clearRect(0, 0, width, height);

      if (!input.getGhostVisible() || !layout || !image || input.state.session.workflow !== "detection") {
        input.elements.layoutPlacementNotice.textContent = layout
          ? "Layout preview hidden. Select the layout again to show it."
          : "Choose a layout to preview its placement.";
        input.elements.layoutPlacementNotice.dataset.state = "idle";
        return;
      }

      const placed = layout.boxes.map((box) => ({
        ...box,
        x: layout.sourceAnchor.x + box.relativeX,
        y: layout.sourceAnchor.y + box.relativeY
      }));
      const existing = input.canvasController.raw.getObjects("rect").filter((object) => object.visible !== false).map((object) => {
        const bounds = object.getBoundingRect(true);
        return { x: bounds.left, y: bounds.top, width: bounds.width, height: bounds.height };
      });
      const outsideIndices = new Set<number>();
      const existingCollisionIndices = new Set<number>();
      const internalCollisionIndices = new Set<number>();
      const existingIndex = createRectSpatialIndex(existing);
      const placedIndex = createRectSpatialIndex();
      placed.forEach((box, index) => {
        if (box.x < 0 || box.y < 0 || box.x + box.width > image.width || box.y + box.height > image.height) {
          outsideIndices.add(index);
        }
        if (existingIndex.intersectsAny(box)) {
          existingCollisionIndices.add(index);
        }
        if (placedIndex.intersectsAny(box)) {
          internalCollisionIndices.add(index);
        }
        placedIndex.add(box);
      });
      const viewport = fabricCanvas.viewportTransform;

      context.save();
      context.setLineDash([7, 5]);
      context.lineWidth = 2;
      context.font = "600 11px system-ui, sans-serif";
      placed.forEach((box, index) => {
        const isWarning = outsideIndices.has(index)
          || existingCollisionIndices.has(index)
          || internalCollisionIndices.has(index);
        const screenX = viewport[0] * box.x + viewport[2] * box.y + viewport[4];
        const screenY = viewport[1] * box.x + viewport[3] * box.y + viewport[5];
        const screenWidth = Math.abs(viewport[0] * box.width);
        const screenHeight = Math.abs(viewport[3] * box.height);
        context.strokeStyle = isWarning ? "#dc3545" : "#0d6efd";
        context.fillStyle = isWarning ? "rgba(220, 53, 69, 0.12)" : "rgba(13, 110, 253, 0.10)";
        context.fillRect(screenX, screenY, screenWidth, screenHeight);
        context.strokeRect(screenX, screenY, screenWidth, screenHeight);
        context.fillStyle = isWarning ? "#dc3545" : "#0d6efd";
        context.fillText(box.classId, Math.max(2, screenX + 4), Math.max(12, screenY + 13));
      });
      context.restore();

      const warnings = [
        outsideIndices.size > 0 ? `${outsideIndices.size} outside image` : null,
        existingCollisionIndices.size > 0 ? `${existingCollisionIndices.size} overlap existing` : null,
        internalCollisionIndices.size > 0 ? `${internalCollisionIndices.size} overlap layout` : null
      ].filter(Boolean);
      input.elements.layoutPlacementNotice.dataset.state = warnings.length > 0 ? "warning" : "ready";
      input.elements.layoutPlacementNotice.textContent = warnings.length > 0
        ? `${layout.boxes.length} box ghost preview · ${warnings.join(" · ")}`
        : `${layout.boxes.length} box ghost preview · all boxes fit inside the image`;
    },

    renderLibraryPreview(): void {
      const canvas = input.elements.layoutPreviewCanvas;
      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Layout preview canvas is unavailable");
      }
      const layout = input.getSelectedSetupLayout();
      const image = input.state.session.currentImage;
      const zoomPercent = Math.max(1, Math.min(400, Number.parseInt(input.elements.layoutPreviewZoomInput.value, 10) || 100));
      input.elements.layoutPreviewZoomInput.value = String(zoomPercent);
      input.elements.layoutPreviewZoomValue.textContent = `${zoomPercent}%`;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "#20252a";
      context.fillRect(0, 0, canvas.width, canvas.height);
      if (!layout) {
        input.elements.layoutDetails.textContent = "Choose a layout to inspect its geometry.";
        return;
      }

      const minX = Math.min(...layout.boxes.map((box) => box.relativeX));
      const minY = Math.min(...layout.boxes.map((box) => box.relativeY));
      const maxX = Math.max(...layout.boxes.map((box) => box.relativeX + box.width));
      const maxY = Math.max(...layout.boxes.map((box) => box.relativeY + box.height));
      const classCounts = new Map<string, number>();
      layout.boxes.forEach((box) => classCounts.set(box.classId, (classCounts.get(box.classId) ?? 0) + 1));
      const classes = [...classCounts.entries()].map(([classId, count]) => `${classId} (${count})`).join(", ");
      input.elements.layoutDetails.textContent = `${layout.name} | ${layout.boxes.length} boxes | Classes: ${classes} | Anchor ${Math.round(layout.sourceAnchor.x)}, ${Math.round(layout.sourceAnchor.y)} | Size ${Math.round(maxX - minX)} x ${Math.round(maxY - minY)} | Source ${layout.sourceImageSize.width} x ${layout.sourceImageSize.height}`;

      const sourceWidth = image?.naturalWidth || image?.width || layout.sourceImageSize.width;
      const sourceHeight = image?.naturalHeight || image?.height || layout.sourceImageSize.height;
      const placedBoxes = layout.boxes.map((box) => ({
        ...box,
        x: layout.sourceAnchor.x + box.relativeX,
        y: layout.sourceAnchor.y + box.relativeY
      }));
      const contentMinX = Math.min(0, ...placedBoxes.map((box) => box.x));
      const contentMinY = Math.min(0, ...placedBoxes.map((box) => box.y));
      const contentMaxX = Math.max(sourceWidth, ...placedBoxes.map((box) => box.x + box.width));
      const contentMaxY = Math.max(sourceHeight, ...placedBoxes.map((box) => box.y + box.height));
      const contentWidth = Math.max(1, contentMaxX - contentMinX);
      const contentHeight = Math.max(1, contentMaxY - contentMinY);
      const fitScale = Math.min((canvas.width - 40) / contentWidth, (canvas.height - 40) / contentHeight);
      const scale = fitScale * (zoomPercent / 100);
      const offsetX = canvas.width / 2 - ((contentMinX + contentMaxX) / 2) * scale;
      const offsetY = canvas.height / 2 - ((contentMinY + contentMaxY) / 2) * scale;
      const drawWidth = sourceWidth * scale;
      const drawHeight = sourceHeight * scale;
      if (image) {
        context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
      } else {
        context.fillStyle = "#e9ecef";
        context.fillRect(offsetX, offsetY, drawWidth, drawHeight);
      }
      context.lineWidth = 2;
      context.font = "12px sans-serif";
      placedBoxes.forEach((box) => {
        const x = offsetX + box.x * scale;
        const y = offsetY + box.y * scale;
        const width = box.width * scale;
        const height = box.height * scale;
        context.fillStyle = "rgba(13, 110, 253, 0.2)";
        context.strokeStyle = "#0d6efd";
        context.fillRect(x, y, width, height);
        context.strokeRect(x, y, width, height);
        context.fillStyle = "#ffffff";
        context.fillText(box.classId, x + 4, y + 14);
      });
    }
  };
}
