import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { expect, it, vi } from "vitest";
import { resolveModelInput, getLetterbox, rgbaToTensor, decodeYoloOutput } from "../../../../src/features/inference/yolo.js";

const source = readFileSync(new URL("../../../../workers/yolo-inference-worker.js", import.meta.url), "utf8").replace(/^import .*;\r?\n/gm, "");

function worker(mode: "gpu" | "no-gpu" | "init-failure" | "run-failure" | "download-failure" | "cpu-failure", channels: 1 | 3 = 1) {
  const predictions = new Float32Array(40);
  [0, 8, 16, 24].forEach((index) => { predictions[index] = 16; });
  predictions[32] = 0.9;
  const sessions: Array<{ backend: string; run: ReturnType<typeof vi.fn>; release: ReturnType<typeof vi.fn> }> = [];
  const outputDispose = vi.fn();
  const create = vi.fn(async (_model, options) => {
    const backend = typeof options.executionProviders[0] === "string" ? options.executionProviders[0] : options.executionProviders[0].name;
    if (backend === "webgpu" && mode === "init-failure") throw new Error("GPU initialization unavailable");
    const session = {
      backend,
      inputNames: ["images"], outputNames: ["output"],
      inputMetadata: [{ isTensor: true, shape: [1, channels, 32, 32], type: "float32" }],
      release: vi.fn(async () => {
        if (mode === "run-failure" && backend === "webgpu") throw new Error("GPU device lost");
      }),
      run: vi.fn(async () => {
        if (backend === "webgpu" && mode === "run-failure") throw new Error("GPU device lost");
        if (mode === "cpu-failure") throw new Error("CPU inference failed");
        return { output: { dims: [1, 5, 8], dispose: outputDispose, getData: async () => {
          if (backend === "webgpu" && mode === "download-failure") throw new Error("GPU download failed");
          return predictions;
        } } };
      })
    };
    sessions.push(session);
    return session;
  });
  const tensorDispose = vi.fn();
  const self = {
    location: { href: "http://localhost/workers/yolo-inference-worker.js" },
    navigator: { gpu: mode === "no-gpu" || mode === "cpu-failure" ? undefined : {} },
    onmessage: (_event: unknown) => {},
    postMessage: (_message: unknown) => {}
  };
  runInNewContext(source, {
    self, URL, Error, Float32Array, Uint8ClampedArray,
    resolveModelInput, getLetterbox, rgbaToTensor, decodeYoloOutput,
    ort: { env: { wasm: {}, webgpu: {} }, InferenceSession: { create }, Tensor: class { dispose = tensorDispose; } },
    ImageData: class {},
    OffscreenCanvas: class {
      constructor(public width: number, public height: number) {}
      getContext() {
        return { putImageData() {}, fillRect() {}, drawImage() {}, getImageData: () => ({ data: new Uint8ClampedArray(this.width * this.height * 4) }) };
      }
    }
  });
  const send = (request: Record<string, unknown>): Promise<any> => new Promise((resolve) => {
    self.postMessage = resolve;
    self.onmessage({ data: { id: 1, ...request } });
  });
  const model = new ArrayBuffer(1);
  return {
    create, sessions, outputDispose, tensorDispose,
    load: () => send({ operation: "LOAD", model, size: 32 }),
    infer: () => send({ operation: "INFER", width: 32, height: 32, rgba: new Uint8ClampedArray(32 * 32 * 4).buffer, options: { confidence: 0.25, iou: 0.45, format: "auto" } })
  };
}

it.each([1, 3] as const)("uses GPU for a supported %ich model", async (channels) => {
  const runtime = worker("gpu", channels);
  expect(await runtime.load()).toMatchObject({ result: { channels }, status: { backend: "webgpu", fallbackReason: null } });
  expect((await runtime.infer()).result).toHaveLength(1);
  expect(runtime.sessions.map((session) => session.backend)).toEqual(["webgpu"]);
  expect(runtime.outputDispose).toHaveBeenCalledTimes(1);
  expect(runtime.tensorDispose).toHaveBeenCalledTimes(1);
});

it.each(["no-gpu", "init-failure"] as const)("loads on CPU when %s", async (mode) => {
  const runtime = worker(mode);
  expect(await runtime.load()).toMatchObject({ status: { backend: "wasm", fallbackReason: expect.stringContaining("GPU initialization failed") } });
  expect((await runtime.infer()).result).toHaveLength(1);
  expect(runtime.sessions.map((session) => session.backend)).toEqual(["wasm"]);
});

it.each(["run-failure", "download-failure"] as const)("retries the same image on CPU after GPU %s and keeps using CPU", async (mode) => {
  const runtime = worker(mode);
  await runtime.load();
  const result = await runtime.infer();
  expect(result.status).toMatchObject({ backend: "wasm", fallbackReason: expect.stringContaining("GPU execution failed") });
  expect(result.result).toHaveLength(1);
  expect(runtime.sessions.map((session) => session.backend)).toEqual(["webgpu", "wasm"]);
  expect(runtime.sessions[0].release).toHaveBeenCalledOnce();
  expect(runtime.create.mock.calls[1][0]).toBe(runtime.create.mock.calls[0][0]);
  expect(runtime.sessions[1].run.mock.calls[0][0].images).toBe(runtime.sessions[0].run.mock.calls[0][0].images);
  expect((await runtime.infer()).result).toHaveLength(1);
  expect(runtime.create).toHaveBeenCalledTimes(2);
  expect(runtime.tensorDispose).toHaveBeenCalledTimes(2);
});

it("reports a CPU failure without retrying indefinitely", async () => {
  const runtime = worker("cpu-failure");
  await runtime.load();
  expect(await runtime.infer()).toMatchObject({ error: "CPU inference failed", status: { backend: "wasm" } });
  expect(runtime.create).toHaveBeenCalledOnce();
});
