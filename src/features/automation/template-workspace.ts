import type { PixelPoint, PixelRect, TemplateMatchCandidate, TemplateMatchResult, TemplatePreprocessingSettings } from "./types.js";

export interface TemplateWorkspaceMatch {
  candidate: TemplateMatchCandidate;
  selected: boolean;
  classId: string | null;
}

export interface TemplateMatchContextRequest {
  matchIndex: number | null;
  clientX: number;
  clientY: number;
}

export interface TemplateWorkspaceLayoutPreview {
  matchPoint: PixelPoint;
  anchor: PixelPoint;
  boxes: Array<PixelRect & { classId: string }>;
}

export type TemplateWorkspaceInteractionMode = "template-roi" | "select-results";

export interface TemplateWorkspace {
  bind(): void;
  fitToView(): void;
  setInteractionMode(mode: TemplateWorkspaceInteractionMode): void;
  getInteractionMode(): TemplateWorkspaceInteractionMode;
  setImage(image: HTMLImageElement, roi?: PixelRect | null): void;
  setMatchResult(result: TemplateMatchResult | null): void;
  setMatchResults(results: readonly TemplateWorkspaceMatch[]): void;
  setLayoutPreview(preview: TemplateWorkspaceLayoutPreview | null): void;
  setLayoutPreviewOpacity(opacity: number): void;
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
  scroller: HTMLElement;
  stage: HTMLElement;
  zoomInput: HTMLInputElement;
  zoomValue: HTMLElement;
  originalPreviewCanvas: HTMLCanvasElement;
  processedPreviewCanvas: HTMLCanvasElement;
  onRoiChanged?(roi: PixelRect): void;
  onMatchClicked?(index: number): void;
  onMatchContextRequested?(request: TemplateMatchContextRequest): void;
}): TemplateWorkspace {
  let image: HTMLImageElement | null = null;
  let storedTemplateImage: HTMLImageElement | null = null;
  let roi: PixelRect | null = null;
  let matchResults: TemplateWorkspaceMatch[] = [];
  let layoutPreview: TemplateWorkspaceLayoutPreview | null = null;
  let layoutPreviewOpacity = 0.1;
  let interactionMode: TemplateWorkspaceInteractionMode = "template-roi";
  let stagePaddingX = 0;
  let stagePaddingY = 0;
  let dragStart: { x: number; y: number } | null = null;
  let draftEnd: { x: number; y: number } | null = null;
  let panStart: {
    pointerId: number;
    clientX: number;
    clientY: number;
    scrollLeft: number;
    scrollTop: number;
    matchIndex: number;
    moved: boolean;
  } | null = null;

  const imageWidth = (): number => image?.naturalWidth || image?.width || 0;
  const imageHeight = (): number => image?.naturalHeight || image?.height || 0;
  const zoomPercent = (): number => clamp(Number.parseInt(input.zoomInput.value, 10) || 100, 1, 400);
  const zoom = (): number => zoomPercent() / 100;

  const eventToImagePoint = (event: Pick<PointerEvent, "clientX" | "clientY">): { x: number; y: number } => {
    const bounds = input.canvas.getBoundingClientRect();
    const canvasX = (event.clientX - bounds.left) * (input.canvas.width / bounds.width);
    const canvasY = (event.clientY - bounds.top) * (input.canvas.height / bounds.height);
    return {
      x: clamp(canvasX / zoom(), 0, imageWidth()),
      y: clamp(canvasY / zoom(), 0, imageHeight())
    };
  };

  const findMatchIndexAt = (point: { x: number; y: number }): number => {
    for (let index = matchResults.length - 1; index >= 0; index -= 1) {
      const candidate = matchResults[index]?.candidate;
      if (candidate
        && point.x >= candidate.x
        && point.x <= candidate.x + candidate.width
        && point.y >= candidate.y
        && point.y <= candidate.y + candidate.height) {
        return index;
      }
    }
    return -1;
  };

  const syncInteractionMode = (): void => {
    input.canvas.dataset.interactionMode = interactionMode;
    input.canvas.setAttribute(
      "aria-label",
      interactionMode === "template-roi"
        ? "Draw template ROI on reference image"
        : "Select template match results"
    );
  };

  const syncRoiState = (): void => {
    input.canvas.dataset.roiReady = String(roi !== null);
  };

  const viewportSize = (): { width: number; height: number } => {
    const bounds = input.scroller.getBoundingClientRect();
    return {
      width: Math.max(0, input.scroller.clientWidth || Math.round(bounds.width)),
      height: Math.max(0, input.scroller.clientHeight || Math.round(bounds.height))
    };
  };

  const syncStage = (): void => {
    const viewport = viewportSize();
    stagePaddingX = viewport.width;
    stagePaddingY = viewport.height;
    input.stage.style.width = `${input.canvas.width + stagePaddingX * 2}px`;
    input.stage.style.height = `${input.canvas.height + stagePaddingY * 2}px`;
    input.canvas.style.left = `${stagePaddingX}px`;
    input.canvas.style.top = `${stagePaddingY}px`;
  };

  const centerImage = (): void => {
    const viewport = viewportSize();
    if (viewport.width <= 0 || viewport.height <= 0) {
      return;
    }
    input.scroller.scrollLeft = stagePaddingX + input.canvas.width / 2 - viewport.width / 2;
    input.scroller.scrollTop = stagePaddingY + input.canvas.height / 2 - viewport.height / 2;
  };

  const render = (): void => {
    const context = requireContext(input.canvas);
    const currentZoom = zoom();
    input.zoomValue.textContent = `${Math.round(currentZoom * 100)}%`;
    input.canvas.dataset.layoutPreview = String(layoutPreview !== null);
    input.canvas.dataset.layoutPreviewOpacity = layoutPreviewOpacity.toFixed(2);
    if (!image) {
      context.clearRect(0, 0, input.canvas.width, input.canvas.height);
      syncStage();
      return;
    }

    const nextCanvasWidth = Math.max(1, Math.round(imageWidth() * currentZoom));
    const nextCanvasHeight = Math.max(1, Math.round(imageHeight() * currentZoom));
    if (input.canvas.width !== nextCanvasWidth) {
      input.canvas.width = nextCanvasWidth;
    }
    if (input.canvas.height !== nextCanvasHeight) {
      input.canvas.height = nextCanvasHeight;
    }
    syncStage();
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
    if (layoutPreview) {
      context.lineWidth = 2 / currentZoom;
      context.setLineDash([7 / currentZoom, 4 / currentZoom]);
      context.font = `${Math.max(9, 11 / currentZoom)}px sans-serif`;
      layoutPreview.boxes.forEach((box) => {
        context.fillStyle = `rgba(13, 110, 253, ${layoutPreviewOpacity})`;
        context.strokeStyle = `rgba(13, 110, 253, ${clamp(layoutPreviewOpacity + 0.45, 0.35, 0.9)})`;
        context.fillRect(box.x, box.y, box.width, box.height);
        context.strokeRect(box.x, box.y, box.width, box.height);
        context.fillStyle = `rgba(13, 110, 253, ${clamp(layoutPreviewOpacity + 0.65, 0.55, 0.95)})`;
        context.fillText(`C${box.classId}`, box.x + 3 / currentZoom, box.y + 12 / currentZoom);
      });

      const markerSize = 8 / currentZoom;
      context.setLineDash([]);
      context.fillStyle = "rgba(255, 193, 7, 0.95)";
      context.fillRect(
        layoutPreview.matchPoint.x - markerSize / 2,
        layoutPreview.matchPoint.y - markerSize / 2,
        markerSize,
        markerSize
      );
      context.fillStyle = "rgba(13, 110, 253, 0.95)";
      context.fillRect(
        layoutPreview.anchor.x - markerSize / 2,
        layoutPreview.anchor.y - markerSize / 2,
        markerSize,
        markerSize
      );
    }
    if (matchResults.length > 0) {
      context.lineWidth = 3 / currentZoom;
      context.setLineDash([]);
      context.font = `${Math.max(10, 12 / currentZoom)}px sans-serif`;
      matchResults.forEach((item, index) => {
        const match = item.candidate;
        const accent = item.selected ? "#0d6efd" : "#20c997";
        context.strokeStyle = accent;
        context.fillStyle = item.selected ? "rgba(13, 110, 253, 0.20)" : "rgba(32, 201, 151, 0.12)";
        context.fillRect(match.x, match.y, match.width, match.height);
        context.strokeRect(match.x, match.y, match.width, match.height);
        const label = `${index + 1} ${(match.score * 100).toFixed(1)}%${item.classId ? ` C${item.classId}` : ""}`;
        const labelHeight = 17 / currentZoom;
        const labelWidth = Math.min(match.width, context.measureText(label).width + 8 / currentZoom);
        context.fillStyle = accent;
        context.fillRect(match.x, match.y, labelWidth, labelHeight);
        context.fillStyle = "#ffffff";
        context.fillText(label, match.x + 4 / currentZoom, match.y + 13 / currentZoom);
      });
    }
    context.restore();
  };

  const setZoomAt = (percent: number, clientX: number, clientY: number): void => {
    const imagePoint = eventToImagePoint({ clientX, clientY });
    const scrollerBounds = input.scroller.getBoundingClientRect();
    const viewportX = clientX - scrollerBounds.left;
    const viewportY = clientY - scrollerBounds.top;
    input.zoomInput.value = String(clamp(Math.round(percent), 1, 400));
    render();
    input.scroller.scrollLeft = stagePaddingX + imagePoint.x * zoom() - viewportX;
    input.scroller.scrollTop = stagePaddingY + imagePoint.y * zoom() - viewportY;
  };

  const fitWorkspaceToView = (): void => {
    if (!image) {
      return;
    }
    const viewport = viewportSize();
    if (viewport.width <= 0 || viewport.height <= 0) {
      return;
    }
    const inset = 16;
    const availableWidth = Math.max(1, viewport.width - inset * 2);
    const availableHeight = Math.max(1, viewport.height - inset * 2);
    const fittedPercent = Math.floor(Math.min(
      availableWidth / imageWidth(),
      availableHeight / imageHeight()
    ) * 100);
    input.zoomInput.value = String(clamp(fittedPercent, 1, 400));
    render();
    centerImage();
  };

  const beginPan = (event: PointerEvent, matchIndex: number): void => {
    event.preventDefault();
    input.canvas.setPointerCapture(event.pointerId);
    panStart = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      scrollLeft: input.scroller.scrollLeft,
      scrollTop: input.scroller.scrollTop,
      matchIndex,
      moved: false
    };
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

  syncInteractionMode();

  return {
    bind(): void {
      input.zoomInput.addEventListener("input", render);
      input.scroller.addEventListener("wheel", (event) => {
        if (!event.ctrlKey || !image) {
          return;
        }
        event.preventDefault();
        const factor = event.deltaY < 0 ? 1.1 : 1 / 1.1;
        setZoomAt(zoomPercent() * factor, event.clientX, event.clientY);
      }, { passive: false });
      input.canvas.addEventListener("pointerdown", (event) => {
        if (!image) {
          return;
        }
        const point = eventToImagePoint(event);
        if (event.button === 1) {
          beginPan(event, -1);
          return;
        }
        if (interactionMode === "select-results") {
          if (event.button !== 0) {
            return;
          }
          beginPan(event, findMatchIndexAt(point));
          return;
        }
        if (event.button !== 0) {
          return;
        }
        input.canvas.setPointerCapture(event.pointerId);
        dragStart = point;
        draftEnd = dragStart;
        matchResults = [];
        layoutPreview = null;
        render();
      });
      input.canvas.addEventListener("pointermove", (event) => {
        if (panStart?.pointerId === event.pointerId) {
          const deltaX = event.clientX - panStart.clientX;
          const deltaY = event.clientY - panStart.clientY;
          if (!panStart.moved && Math.hypot(deltaX, deltaY) >= 4) {
            panStart.moved = true;
            input.canvas.dataset.panning = "true";
          }
          if (panStart.moved) {
            event.preventDefault();
            input.scroller.scrollLeft = panStart.scrollLeft - deltaX;
            input.scroller.scrollTop = panStart.scrollTop - deltaY;
          }
          return;
        }
        if (!dragStart) {
          return;
        }
        draftEnd = eventToImagePoint(event);
        render();
      });
      input.canvas.addEventListener("pointerup", (event) => {
        if (panStart?.pointerId === event.pointerId) {
          const completedPan = panStart;
          panStart = null;
          delete input.canvas.dataset.panning;
          if (!completedPan.moved && completedPan.matchIndex >= 0) {
            input.onMatchClicked?.(completedPan.matchIndex);
          }
          return;
        }
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
          syncRoiState();
          input.onRoiChanged?.(roi);
        }
        render();
      });
      input.canvas.addEventListener("pointercancel", () => {
        panStart = null;
        delete input.canvas.dataset.panning;
      });
      input.canvas.addEventListener("contextmenu", (event) => {
        if (!image || interactionMode !== "select-results") {
          return;
        }
        event.preventDefault();
        const matchIndex = findMatchIndexAt(eventToImagePoint(event));
        input.onMatchContextRequested?.({
          matchIndex: matchIndex >= 0 ? matchIndex : null,
          clientX: event.clientX,
          clientY: event.clientY
        });
      });
    },

    fitToView(): void {
      fitWorkspaceToView();
    },

    setInteractionMode(mode): void {
      if (interactionMode === mode) {
        syncInteractionMode();
        return;
      }
      interactionMode = mode;
      dragStart = null;
      draftEnd = null;
      panStart = null;
      delete input.canvas.dataset.panning;
      syncInteractionMode();
      render();
    },

    getInteractionMode(): TemplateWorkspaceInteractionMode {
      return interactionMode;
    },

    setImage(nextImage, nextRoi = null): void {
      image = nextImage;
      roi = nextRoi;
      matchResults = [];
      layoutPreview = null;
      storedTemplateImage = null;
      syncRoiState();
      render();
      centerImage();
    },

    setMatchResult(result): void {
      const candidates = result ? (result.matches.length > 0 ? [...result.matches] : [{
        score: result.score,
        x: result.x,
        y: result.y,
        width: result.width,
        height: result.height
      }]) : [];
      matchResults = candidates.map((candidate) => ({ candidate, selected: true, classId: null }));
      render();
    },

    setMatchResults(results): void {
      matchResults = results.map((result) => ({
        candidate: { ...result.candidate },
        selected: result.selected,
        classId: result.classId
      }));
      render();
    },

    setLayoutPreview(nextPreview): void {
      layoutPreview = nextPreview ? {
        matchPoint: { ...nextPreview.matchPoint },
        anchor: { ...nextPreview.anchor },
        boxes: nextPreview.boxes.map((box) => ({ ...box }))
      } : null;
      render();
    },

    setLayoutPreviewOpacity(opacity): void {
      layoutPreviewOpacity = clamp(opacity, 0, 1);
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
