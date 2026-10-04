import * as ort from "../vendor/onnxruntime/ort.all.min.mjs";
import { resolveModelInput, getLetterbox, rgbaToTensor, decodeYoloOutput } from "../dist/features/inference/yolo.js";

let session = null;
let input = null;
let model = null;
let backend = null;
let fallbackReason = null;
let queue = Promise.resolve();
ort.env.wasm.wasmPaths = new URL("../vendor/onnxruntime/", self.location.href).toString();
ort.env.wasm.numThreads = 1;
ort.env.wasm.proxy = false;
ort.env.webgpu.powerPreference = "high-performance";

async function runTensor(tensor) {
  let outputs;
  try {
    outputs = await session.run({ [session.inputNames[0]]: tensor });
    const output = outputs[session.outputNames[0]];
    return { values: await output.getData(), dims: output.dims };
  } finally {
    if (outputs) Object.values(outputs).forEach((output) => output.dispose());
  }
}

async function handle(request) {
  if (request.operation === "LOAD") {
    let next;
    let nextBackend = "webgpu";
    let nextFallbackReason = null;
    try {
      if (!self.navigator?.gpu) throw new Error("WebGPU is unavailable in this environment.");
      next = await ort.InferenceSession.create(request.model, { executionProviders: [{ name: "webgpu", preferredLayout: "NCHW" }] });
    } catch (error) {
      nextBackend = "wasm";
      nextFallbackReason = `GPU initialization failed: ${error instanceof Error ? error.message : String(error)}`;
      next = await ort.InferenceSession.create(request.model, { executionProviders: ["wasm"] });
    }
    try {
      if (next.inputNames.length !== 1 || next.outputNames.length !== 1) throw new Error("Use a Detection model with one image input and one prediction output.");
      const metadata = next.inputMetadata[0];
      if (!metadata.isTensor) throw new Error("The model input must be an image tensor.");
      const nextInput = resolveModelInput(metadata.shape, metadata.type, request.size);
      await session?.release();
      session = next;
      input = nextInput;
      model = request.model;
      backend = nextBackend;
      fallbackReason = nextFallbackReason;
    } catch (error) {
      await next.release();
      throw error;
    }
    return input;
  }
  if (!session || !input) throw new Error("Load a YOLO ONNX model first.");
  const { width, height } = request;
  const rgba = new Uint8ClampedArray(request.rgba);
  if (rgba.length !== width * height * 4) throw new Error("Invalid source image raster.");
  const letterbox = getLetterbox(width, height, input);
  const source = new OffscreenCanvas(width, height);
  source.getContext("2d").putImageData(new ImageData(rgba, width, height), 0, 0);
  const canvas = new OffscreenCanvas(input.width, input.height);
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.fillStyle = "rgb(114,114,114)";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(source, letterbox.left, letterbox.top, letterbox.resizedWidth, letterbox.resizedHeight);
  const values = rgbaToTensor(context.getImageData(0, 0, canvas.width, canvas.height).data, input);
  const dims = input.layout === "nchw" ? [1, input.channels, input.height, input.width] : [1, input.height, input.width, input.channels];
  const tensor = new ort.Tensor("float32", values, dims);
  try {
    let prediction;
    try {
      prediction = await runTensor(tensor);
    } catch (error) {
      if (backend !== "webgpu") throw error;
      try { await session.release(); } catch { /* A lost GPU device may also fail to release. */ }
      session = null;
      backend = "wasm";
      fallbackReason = `GPU execution failed: ${error instanceof Error ? error.message : String(error)}`;
      session = await ort.InferenceSession.create(model, { executionProviders: ["wasm"] });
      prediction = await runTensor(tensor);
    }
    return decodeYoloOutput(prediction.values, prediction.dims, letterbox, request.options);
  } finally {
    tensor.dispose();
  }
}

self.onmessage = ({ data: request }) => {
  queue = queue.then(async () => {
    try {
      const result = await handle(request);
      self.postMessage({ id: request.id, result, status: { backend, fallbackReason } });
    } catch (error) {
      self.postMessage({ id: request.id, error: error instanceof Error ? error.message : String(error), status: { backend, fallbackReason } });
    }
  });
};
