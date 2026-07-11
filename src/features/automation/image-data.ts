import type { PixelRect } from "./types.js";

function createCanvas(documentRef: Document, width: number, height: number): HTMLCanvasElement {
  const canvas = documentRef.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function requireContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    throw new Error("Canvas 2D context is unavailable");
  }
  return context;
}

export function imageElementToImageData(image: HTMLImageElement, documentRef: Document = document): ImageData {
  const canvas = createCanvas(documentRef, image.naturalWidth || image.width, image.naturalHeight || image.height);
  const context = requireContext(canvas);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return context.getImageData(0, 0, canvas.width, canvas.height);
}

export function cropImageElementToPngDataUrl(
  image: HTMLImageElement,
  roi: PixelRect,
  documentRef: Document = document
): string {
  const canvas = createCanvas(documentRef, Math.round(roi.width), Math.round(roi.height));
  const context = requireContext(canvas);
  context.drawImage(image, roi.x, roi.y, roi.width, roi.height, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}

export async function pngDataUrlToImageData(dataUrl: string, documentRef: Document = document): Promise<ImageData> {
  const image = new Image();
  image.src = dataUrl;
  if (typeof image.decode === "function") {
    await image.decode();
  } else {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Unable to decode template PNG"));
    });
  }
  return imageElementToImageData(image, documentRef);
}
