import { describe, expect, it, vi } from "vitest";
import { createEdgeSamService } from "../../../../src/features/edgesam/service.js";

class FakeWorker {
  onmessage: ((event: { data: Record<string, unknown> }) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  readonly messages: Array<Record<string, unknown>> = [];

  postMessage(message: Record<string, unknown>): void {
    this.messages.push(message);
    const operation = message.operation;
    const id = message.id as number;
    if (operation === "INIT_MODEL") {
      this.onmessage?.({ data: { id, ok: true, status: { phase: "idle", backend: "wasm", encoderRuns: 0 } } });
    }
    if (operation === "ENCODE_IMAGE") {
      this.onmessage?.({ data: { id, ok: true, status: { phase: "ready", backend: "wasm", encoderRuns: 1 } } });
    }
    if (operation === "DECODE") {
      this.onmessage?.({ data: { id, ok: true, result: { width: 2, height: 2, mask: new Uint8Array([1, 0, 0, 1]), score: 0.9 } } });
    }
  }

  terminate = vi.fn();
}

describe("EdgeSAM service", () => {
  it("encodes an image once and uses the cached embedding for later prompts", async () => {
    const worker = new FakeWorker();
    const service = createEdgeSamService(() => worker as never);
    const image = { cacheKey: "image-a", width: 2, height: 2, rgba: new Uint8ClampedArray(16) };

    await service.prepareImage(image);
    await service.prepareImage(image);
    await service.decode({ points: [{ x: 1, y: 1, label: "positive" }], box: null });
    await service.decode({ points: [{ x: 1, y: 1, label: "negative" }], box: null });

    expect(worker.messages.map((message) => message.operation)).toEqual(["INIT_MODEL", "ENCODE_IMAGE", "DECODE", "DECODE"]);
    expect(service.getStatus().encoderRuns).toBe(1);
  });

  it("encodes a new image after the cache key changes", async () => {
    const worker = new FakeWorker();
    const service = createEdgeSamService(() => worker as never);

    await service.prepareImage({ cacheKey: "image-a", width: 2, height: 2, rgba: new Uint8ClampedArray(16) });
    await service.prepareImage({ cacheKey: "image-b", width: 2, height: 2, rgba: new Uint8ClampedArray(16) });

    expect(worker.messages.filter((message) => message.operation === "ENCODE_IMAGE")).toHaveLength(2);
  });

  it("shares an in-flight encoding request for the same image", async () => {
    const worker = new FakeWorker();
    const service = createEdgeSamService(() => worker as never);
    const image = { cacheKey: "image-a", width: 2, height: 2, rgba: new Uint8ClampedArray(16) };

    await Promise.all([service.prepareImage(image), service.prepareImage(image)]);

    expect(worker.messages.filter((message) => message.operation === "ENCODE_IMAGE")).toHaveLength(1);
    expect(service.getStatus().encoderRuns).toBe(1);
  });
});
