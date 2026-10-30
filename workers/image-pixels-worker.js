// Reads an ImageBitmap's RGBA off the UI thread, and whether every pixel is opaque (src/features/images/off-thread-pixels.ts).
self.onmessage = ({ data }) => {
  const { id, bitmap } = data;
  try {
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(bitmap, 0, 0);
    bitmap.close();
    const rgba = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const alpha = new Uint32Array(rgba.buffer, 0, rgba.length >> 2);
    let opaque = true;
    for (let index = 0; index < alpha.length && opaque; index += 1) opaque = alpha[index] >= 0xff000000;
    self.postMessage({ id, rgba, opaque }, [rgba.buffer]);
  } catch (error) {
    self.postMessage({ id, error: String(error?.message ?? error) });
  }
};
