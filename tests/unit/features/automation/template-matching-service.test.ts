import { describe, expect, it } from "vitest";

import { createTemplateMatchingService, requireAcceptedMatch } from "../../../../src/features/automation/template-matching-service.js";

const timings = {
  engineInitializationMs: 0,
  transferPreparationMs: 0,
  targetPreprocessingMs: 0,
  templatePreprocessingMs: 0,
  matchingMs: 0,
  candidateExtractionMs: 0,
  workerTotalMs: 0,
  roundTripMs: 0
};

describe("template matching service", () => {
  it("rejects scores below the configured threshold", () => {
    expect(() => requireAcceptedMatch({
      score: 0.71,
      x: 1,
      y: 2,
      width: 5,
      height: 5,
      matches: [],
      timings,
      templateCacheHit: false
    }, 0.8)).toThrow(/below the minimum/);
  });

  it("returns worker coordinates and validates search ROI before dispatch", async () => {
    const worker = {
      onmessage: null as ((event: MessageEvent<{ id: number; ok: boolean; result: { score: number; x: number; y: number; width: number; height: number } }>) => void) | null,
      onerror: null,
      postMessage(message: unknown): void {
        const request = message as { id: number };
        queueMicrotask(() => this.onmessage?.({ data: {
          id: request.id,
          ok: true,
          result: {
            score: 0.93,
            x: 12,
            y: 15,
            width: 2,
            height: 2,
            matches: [{ score: 0.93, x: 12, y: 15, width: 2, height: 2 }],
            timings,
            templateCacheHit: false
          }
        } } as MessageEvent));
      },
      terminate(): void {
        return;
      }
    };
    const service = createTemplateMatchingService(() => worker as never);
    const target = { width: 10, height: 10, data: new Uint8ClampedArray(10 * 10 * 4) } as ImageData;
    const template = { width: 2, height: 2, data: new Uint8ClampedArray(2 * 2 * 4) } as ImageData;
    const preprocessing = {
      grayscale: true,
      gaussianBlurEnabled: true,
      blurKernelSize: 21,
      blurSigma: 0,
      gaussianNoiseEnabled: false,
      gaussianNoiseSigma: 0,
      gaussianNoiseSeed: 1
    };

    await expect(service.match({
      target,
      template,
      preprocessing,
      matching: { minimumScore: 0.95, searchRoi: null, mode: "accurate" }
    })).resolves.toMatchObject({ score: 0.93, x: 12, y: 15 });

    await expect(service.match({
      target,
      template,
      preprocessing,
      matching: { minimumScore: 0.8, searchRoi: { x: 9, y: 9, width: 2, height: 2 }, mode: "accurate" }
    })).rejects.toThrow(/outside the target image/);
  });

  it("warms the worker and reuses template pixels while invalidating processed settings", async () => {
    const messages: Array<Record<string, unknown>> = [];
    const worker = {
      onmessage: null as ((event: MessageEvent) => void) | null,
      onerror: null,
      postMessage(message: unknown): void {
        const request = message as Record<string, unknown> & { id: number; operation: string };
        messages.push(request);
        queueMicrotask(() => {
          if (request.operation === "warmup") {
            this.onmessage?.({ data: { id: request.id, ok: true, warmup: { engineInitializationMs: 42 } } } as MessageEvent);
            return;
          }
          const templateWasSent = Boolean(request.template);
          const preprocessingKey = String(request.preprocessingKey);
          this.onmessage?.({ data: {
            id: request.id,
            ok: true,
            result: {
              score: 0.95,
              x: 4,
              y: 5,
              width: 2,
              height: 2,
              matches: [{ score: 0.95, x: 4, y: 5, width: 2, height: 2 }],
              timings,
              templateCacheHit: !templateWasSent && preprocessingKey.endsWith(":1:1:21:0:0:0:1")
            }
          } } as MessageEvent);
        });
      },
      terminate(): void {
        return;
      }
    };
    const service = createTemplateMatchingService(() => worker as never);
    const createTarget = () => ({ width: 8, height: 8, data: new Uint8ClampedArray(8 * 8 * 4) } as ImageData);
    const template = ({ width: 2, height: 2, data: new Uint8ClampedArray(2 * 2 * 4).fill(17) } as ImageData);
    const preprocessing = {
      grayscale: true,
      gaussianBlurEnabled: true,
      blurKernelSize: 21,
      blurSigma: 0,
      gaussianNoiseEnabled: false,
      gaussianNoiseSigma: 0,
      gaussianNoiseSeed: 1
    };
    const matching = { minimumScore: 0.8, searchRoi: null, mode: "accurate" as const };

    const firstWarmUp = service.warmUp();
    const repeatedWarmUp = service.warmUp();
    expect(repeatedWarmUp).toBe(firstWarmUp);
    await expect(firstWarmUp).resolves.toEqual({ engineInitializationMs: 42 });
    await service.match({ target: createTarget(), template, preprocessing, matching });
    const reused = await service.match({ target: createTarget(), template, preprocessing, matching });
    const changed = await service.match({
      target: createTarget(),
      template,
      preprocessing: { ...preprocessing, blurKernelSize: 11 },
      matching
    });

    expect(messages).toHaveLength(4);
    expect(messages[1]).toHaveProperty("template");
    expect(messages[2].template).toBeNull();
    expect(messages[3].template).toBeNull();
    expect(reused.templateCacheHit).toBe(true);
    expect(changed.templateCacheHit).toBe(false);
  });

  it("cancels an active match by replacing the worker and remains reusable", async () => {
    const workers = [0, 1].map((index) => ({
      onmessage: null as ((event: MessageEvent) => void) | null,
      onerror: null,
      terminated: false,
      postMessage(message: unknown): void {
        if (index === 0) {
          return;
        }
        const request = message as { id: number };
        queueMicrotask(() => this.onmessage?.({ data: {
          id: request.id,
          ok: true,
          result: {
            score: 0.91,
            x: 3,
            y: 4,
            width: 2,
            height: 2,
            matches: [{ score: 0.91, x: 3, y: 4, width: 2, height: 2 }],
            timings,
            templateCacheHit: false
          }
        } } as MessageEvent));
      },
      terminate(): void {
        this.terminated = true;
      }
    }));
    let workerIndex = 0;
    const service = createTemplateMatchingService(() => workers[workerIndex++] as never);
    const target = { width: 8, height: 8, data: new Uint8ClampedArray(8 * 8 * 4) } as ImageData;
    const template = { width: 2, height: 2, data: new Uint8ClampedArray(2 * 2 * 4) } as ImageData;
    const preprocessing = {
      grayscale: true,
      gaussianBlurEnabled: true,
      blurKernelSize: 13,
      blurSigma: 0,
      gaussianNoiseEnabled: false,
      gaussianNoiseSigma: 0,
      gaussianNoiseSeed: 1
    };
    const matching = { minimumScore: 0.8, searchRoi: null, mode: "accurate" as const };

    const cancelledMatch = service.match({ target, template, preprocessing, matching });
    service.cancelPending();

    await expect(cancelledMatch).rejects.toMatchObject({ name: "AbortError" });
    expect(workers[0]?.terminated).toBe(true);
    await expect(service.match({
      target: { ...target, data: new Uint8ClampedArray(target.data) } as ImageData,
      template,
      preprocessing,
      matching
    })).resolves.toMatchObject({ score: 0.91, x: 3, y: 4 });
  });
});
