import type { PixelRect, TemplateMatchCandidate, TemplateMatchResult, TemplatePreprocessingSettings } from "./types.js";

export interface TemplateWorkspace {
  bind(): void;
  setImage(image: HTMLImageElement, roi?: PixelRect | null): void;
  setMatchResult(result: TemplateMatchResult | null): void;
  setMatchResults(results: readonly TemplateMatchCandidate[]): void;
  getRoi(): PixelRect | null;
  setStoredTemplateImage(image: HTMLImageElement | null): void;
  renderPreviews(settings: TemplatePreprocessingSettings): void;
}

function requireContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas 2D context is unavailable");
  }
  return context;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

function normalizeRect(startX: number, startY: number, endX: number, endY: number): PixelRect {
  return {
    x: Math.min(startX, endX),
    y: Math.min(startY, endY),
    width: Math.abs(endX - startX),
    height: Math.abs(endY - startY)
  };
}

function drawContainedImage(
  context: CanvasRenderingContext2D,
  image: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  destinationWidth: number,
  destinationHeight: number
): void {
  context.clearRect(0, 0, destinationWidth, destinationHeight);
  const scale = Math.min(destinationWidth / sourceWidth, destinationHeight / sourceHeight);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  context.drawImage(image, (destinationWidth - width) / 2, (destinationHeight - height) / 2, width, height);
}

export function createTemplateWorkspace(input: {
  canvas: HTMLCanvasElement;
  zoomInput: HTMLInputElement;
  zoomValue: HTMLElement;
  originalPreviewCanvas: HTMLCanvasElement;
  processedPreviewCanvas: HTMLCanvasElement;
  onRoiChanged?(roi: PixelRect): void;
}): TemplateWorkspace {
  let image: HTMLImageElement | null = null;
  let storedTemplateImage: HTMLImageElement | null = null;
  let roi: PixelRect | null = null;
  let matchResults: TemplateMatchCandidate[] = [];
  let dragStart: { x: number; y: number } | null = null;
  let draftEnd: { x: number; y: number } | null = null;

  const imageWidth = (): number => image?.naturalWidth || image?.width || 0;
  const imageHeight = (): number => image?.naturalHeight || image?.height || 0;
  const zoom = (): number => Number.parseInt(input.zoomInput.value, 10) / 100;

  const eventToImagePoint = (event: PointerEvent): { x: number; y: number } => {
    const bounds = input.canvas.getBoundingClientRect();
    const canvasX = (event.clientX - bounds.left) * (input.canvas.width / bounds.width);
    const canvasY = (event.clientY - bounds.top) * (input.canvas.height / bounds.height);
    return {
      x: clamp(canvasX / zoom(), 0, imageWidth()),
      y: clamp(canvasY / zoom(), 0, imageHeight())
    };
  };

  const render = (): void => {
    const context = requireContext(input.canvas);
    const currentZoom = zoom();
    input.zoomValue.textContent = `${Math.round(currentZoom * 100)}%`;
    if (!image) {
      context.clearRect(0, 0, input.canvas.width, input.canvas.height);
      return;
    }

    input.canvas.width = Math.max(1, Math.round(imageWidth() * currentZoom));
    input.canvas.height = Math.max(1, Math.round(imageHeight() * currentZoom));
    context.drawImage(image, 0, 0, input.canvas.width, input.canvas.height);
    context.save();
    context.scale(currentZoom, currentZoom);

    const selection = dragStart && draftEnd
      ? normalizeRect(dragStart.x, dragStart.y, draftEnd.x, draftEnd.y)
      : roi;
    if (selection) {
      context.fillStyle = "rgba(220, 53, 69, 0.15)";
      context.strokeStyle = "#dc3545";
      context.lineWidth = 2 / currentZoom;
      context.setLineDash([8 / currentZoom, 4 / currentZoom]);
      context.fillRect(selection.x, selection.y, selection.width, selection.height);
      context.strokeRect(selection.x, selection.y, selection.width, selection.height);
    }
    if (matchResults.length > 0) {
      context.strokeStyle = "#20c997";
      context.lineWidth = 3 / currentZoom;
      context.setLineDash([]);
      context.fillStyle = "rgba(32, 201, 151, 0.16)";
      context.font = `${Math.max(10, 12 / currentZoom)}px sans-serif`;
      matchResults.forEach((match, index) => {
        context.fillRect(match.x, match.y, match.width, match.height);
        context.strokeRect(match.x, match.y, match.width, match.height);
        context.fillStyle = "#ffffff";
        context.fillText(`${index + 1} ${(match.score * 100).toFixed(1)}%`, match.x + 4 / currentZoom, match.y + 14 / currentZoom);
        context.fillStyle = "rgba(32, 201, 151, 0.16)";
      });
    }
    context.restore();
  };

  const drawRoiPreview = (canvas: HTMLCanvasElement, filter: string): void => {
    const context = requireContext(canvas);
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (storedTemplateImage) {
      context.save();
      context.filter = filter;
      drawContainedImage(
        context,
        storedTemplateImage,
        storedTemplateImage.naturalWidth || storedTemplateImage.width,
        storedTemplateImage.naturalHeight || storedTemplateImage.height,
        canvas.width,
        canvas.height
      );
      context.restore();
      return;
    }
    if (!image || !roi) {
      return;
    }
    const scale = Math.min(canvas.width / roi.width, canvas.height / roi.height);
    const width = roi.width * scale;
    const height = roi.height * scale;
    context.save();
    context.filter = filter;
    context.drawImage(
      image,
      roi.x,
      roi.y,
      roi.width,
      roi.height,
      (canvas.width - width) / 2,
      (canvas.height - height) / 2,
      width,
      height
    );
    context.restore();
  };

  return {
    bind(): void {
      input.zoomInput.addEventListener("input", render);
      input.canvas.addEventListener("pointerdown", (event) => {
        if (!image) {
          return;
        }
        input.canvas.setPointerCapture(event.pointerId);
        dragStart = eventToImagePoint(event);
        draftEnd = dragStart;
        matchResults = [];
        render();
      });
      input.canvas.addEventListener("pointermove", (event) => {
        if (!dragStart) {
          return;
        }
        draftEnd = eventToImagePoint(event);
        render();
      });
      input.canvas.addEventListener("pointerup", (event) => {
        if (!dragStart) {
          return;
        }
        draftEnd = eventToImagePoint(event);
        const next = normalizeRect(dragStart.x, dragStart.y, draftEnd.x, draftEnd.y);
        dragStart = null;
        draftEnd = null;
        if (next.width >= 2 && next.height >= 2) {
          roi = {
            x: Math.round(next.x),
            y: Math.round(next.y),
            width: Math.round(next.width),
            height: Math.round(next.height)
          };
          storedTemplateImage = null;
          input.onRoiChanged?.(roi);
        }
        render();
      });
    },

    setImage(nextImage, nextRoi = null): void {
      image = nextImage;
      roi = nextRoi;
      matchResults = [];
      storedTemplateImage = null;
      render();
    },

    setMatchResult(result): void {
      matchResults = result ? (result.matches.length > 0 ? [...result.matches] : [{
        score: result.score,
        x: result.x,
        y: result.y,
        width: result.width,
        height: result.height
      }]) : [];
      render();
    },

    setMatchResults(results): void {
      matchResults = results.map((result) => ({ ...result }));
      render();
    },

    getRoi(): PixelRect | null {
      return roi ? { ...roi } : null;
    },

    setStoredTemplateImage(nextImage): void {
      storedTemplateImage = nextImage;
    },

    renderPreviews(settings): void {
      drawRoiPreview(input.originalPreviewCanvas, "none");
      const filters = [
        settings.grayscale ? "grayscale(1)" : "",
        settings.gaussianBlurEnabled && settings.blurKernelSize > 1
          ? `blur(${Math.max(0.5, settings.blurKernelSize / 6)}px)`
          : ""
      ].filter(Boolean).join(" ");
      drawRoiPreview(input.processedPreviewCanvas, filters || "none");
    }
  };
}
