import * as ort from "../vendor/onnxruntime/ort.all.min.mjs";
let encoderSession = null;
let decoderSession = null;
let backend = null;
let cachedEmbedding = null;
let cachedImage = null;
let encoderRuns = 0;
let workerQueue = Promise.resolve();

const INPUT_SIZE = 1024;
const MASK_SIZE = 256;
const MODEL_URLS = {
  encoder: new URL("../resources/models/edgesam/encoder.onnx", self.location.href).toString(),
  decoder: new URL("../resources/models/edgesam/decoder.onnx", self.location.href).toString()
};

function post(id, payload, transfer = []) {
  self.postMessage({ id, ...payload }, transfer);
}

function status(phase, message = null) {
  return {
    phase,
    backend,
    imageCacheKey: cachedImage?.cacheKey ?? null,
    encoderRuns,
    message
  };
}

function loadArrayBuffer(url) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";
    request.onload = () => request.status === 0 || (request.status >= 200 && request.status < 300)
      ? resolve(request.response)
      : reject(new Error(`Unable to load model (${request.status})`));
    request.onerror = () => reject(new Error("Unable to load local EdgeSAM model"));
    request.send();
  });
}

async function createSessions() {
  if (encoderSession && decoderSession) return;
  ort.env.wasm.wasmPaths = new URL("../vendor/onnxruntime/", self.location.href).toString();
  const [encoderModel, decoderModel] = await Promise.all([loadArrayBuffer(MODEL_URLS.encoder), loadArrayBuffer(MODEL_URLS.decoder)]);
  try {
    encoderSession = await ort.InferenceSession.create(encoderModel, { executionProviders: ["webgpu"] });
    decoderSession = await ort.InferenceSession.create(decoderModel, { executionProviders: ["webgpu"] });
    backend = "webgpu";
  } catch (webGpuError) {
    encoderSession?.release?.();
    decoderSession?.release?.();
    encoderSession = await ort.InferenceSession.create(encoderModel, { executionProviders: ["wasm"] });
    decoderSession = await ort.InferenceSession.create(decoderModel, { executionProviders: ["wasm"] });
    backend = "wasm";
  }
}

function resize(width, height) {
  const scale = INPUT_SIZE / Math.max(width, height);
  return { scale, width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

function preprocess(image) {
  const layout = resize(image.width, image.height);
  const plane = INPUT_SIZE * INPUT_SIZE;
  const pixels = new Uint8ClampedArray(image.rgba);
  const values = new Float32Array(plane * 3);
  const mean = [123.675, 116.28, 103.53];
  const std = [58.395, 57.12, 57.375];
  for (let y = 0; y < layout.height; y += 1) {
    const sourceY = Math.min(image.height - 1, Math.floor(y / layout.scale));
    for (let x = 0; x < layout.width; x += 1) {
      const sourceX = Math.min(image.width - 1, Math.floor(x / layout.scale));
      const source = (sourceY * image.width + sourceX) * 4;
      const target = y * INPUT_SIZE + x;
      for (let channel = 0; channel < 3; channel += 1) {
        values[channel * plane + target] = (pixels[source + channel] - mean[channel]) / std[channel];
      }
    }
  }
  return { values, layout };
}

function findName(names, expected) {
  return names.find((name) => name.toLowerCase().includes(expected)) ?? null;
}

function promptTensors(prompt, layout) {
  const maximumPoints = 5;
  const values = [...(prompt.points ?? [])].map((point) => ({
    x: point.x, y: point.y, label: point.label === "positive" ? 1 : 0
  }));
  if (prompt.box) {
    values.push({ y: prompt.box.top, x: prompt.box.left, label: 2 });
    values.push({ y: prompt.box.bottom, x: prompt.box.right, label: 3 });
  }
  const selected = values.slice(-maximumPoints);
  const coords = new Float32Array(maximumPoints * 2);
  const labels = new Float32Array(maximumPoints).fill(-1);
  selected.forEach((point, index) => {
    // The shipped ONNX decoder follows SAM's (x, y) point-coordinate order.
    coords[index * 2] = Math.max(0, Math.min(INPUT_SIZE - 1, point.x * layout.scale));
    coords[index * 2 + 1] = Math.max(0, Math.min(INPUT_SIZE - 1, point.y * layout.scale));
    labels[index] = point.label;
  });
  return { coords, labels };
}

function sample(logits, x, y) {
  const boundedX = Math.max(0, Math.min(MASK_SIZE - 1, x));
  const boundedY = Math.max(0, Math.min(MASK_SIZE - 1, y));
  const x0 = Math.floor(boundedX);
  const y0 = Math.floor(boundedY);
  const x1 = Math.min(MASK_SIZE - 1, x0 + 1);
  const y1 = Math.min(MASK_SIZE - 1, y0 + 1);
  const dx = boundedX - x0;
  const dy = boundedY - y0;
  const top = logits[y0 * MASK_SIZE + x0] * (1 - dx) + logits[y0 * MASK_SIZE + x1] * dx;
  const bottom = logits[y1 * MASK_SIZE + x0] * (1 - dx) + logits[y1 * MASK_SIZE + x1] * dx;
  return top * (1 - dy) + bottom * dy;
}

function restoreMask(logits, image, layout) {
  const mask = new Uint8Array(image.width * image.height);
  for (let y = 0; y < image.height; y += 1) {
    const resizedY = (y + 0.5) * layout.height / image.height - 0.5;
    const lowY = (resizedY + 0.5) * MASK_SIZE / INPUT_SIZE - 0.5;
    for (let x = 0; x < image.width; x += 1) {
      const resizedX = (x + 0.5) * layout.width / image.width - 0.5;
      const lowX = (resizedX + 0.5) * MASK_SIZE / INPUT_SIZE - 0.5;
      mask[y * image.width + x] = sample(logits, lowX, lowY) > 0 ? 1 : 0;
    }
  }
  return mask;
}

async function encode(image) {
  const prepared = preprocess(image);
  const inputName = encoderSession.inputNames[0];
  const output = await encoderSession.run({ [inputName]: new ort.Tensor("float32", prepared.values, [1, 3, INPUT_SIZE, INPUT_SIZE]) });
  cachedEmbedding = output[encoderSession.outputNames[0]];
  cachedImage = { cacheKey: image.cacheKey, width: image.width, height: image.height, layout: prepared.layout };
  encoderRuns += 1;
}

async function decode(prompt) {
  if (!cachedEmbedding || !cachedImage) throw new Error("EdgeSAM needs an encoded image");
  const inputNames = decoderSession.inputNames;
  const embeddingName = findName(inputNames, "embedding") ?? inputNames[0];
  const coordsName = findName(inputNames, "coord") ?? inputNames[1];
  const labelsName = findName(inputNames, "label") ?? inputNames[2];
  const values = promptTensors(prompt, cachedImage.layout);
  const outputs = await decoderSession.run({
    [embeddingName]: cachedEmbedding,
    [coordsName]: new ort.Tensor("float32", values.coords, [1, 5, 2]),
    [labelsName]: new ort.Tensor("float32", values.labels, [1, 5])
  });
  const maskName = findName(decoderSession.outputNames, "mask") ?? decoderSession.outputNames.at(-1);
  const scoreName = findName(decoderSession.outputNames, "score") ?? decoderSession.outputNames[0];
  const masks = await outputs[maskName].getData();
  const scores = await outputs[scoreName].getData();
  let bestIndex = 0;
  for (let index = 1; index < scores.length; index += 1) {
    if (scores[index] > scores[bestIndex]) bestIndex = index;
  }
  const logits = new Float32Array(masks.buffer, masks.byteOffset + bestIndex * MASK_SIZE * MASK_SIZE * Float32Array.BYTES_PER_ELEMENT, MASK_SIZE * MASK_SIZE);
  const mask = restoreMask(logits, cachedImage, cachedImage.layout);
  return { width: cachedImage.width, height: cachedImage.height, mask, score: scores[bestIndex] ?? 0 };
}

async function handle(request) {
  if (request.operation === "INIT_MODEL") {
    await createSessions();
    post(request.id, { ok: true, status: status("idle") });
    return;
  }
  if (request.operation === "ENCODE_IMAGE") {
    await createSessions();
    await encode(request.image);
    post(request.id, { ok: true, status: status("ready") });
    return;
  }
  if (request.operation === "DECODE") {
    const result = await decode(request.prompt);
    post(request.id, { ok: true, status: status("ready"), result }, [result.mask.buffer]);
    return;
  }
  if (request.operation === "CLEAR") {
    cachedEmbedding?.dispose?.();
    cachedEmbedding = null;
    cachedImage = null;
    post(request.id, { ok: true, status: status("idle") });
    return;
  }
  if (request.operation === "DISPOSE") {
    cachedEmbedding?.dispose?.();
    cachedEmbedding = null;
    await encoderSession?.release?.();
    await decoderSession?.release?.();
    encoderSession = null;
    decoderSession = null;
    return;
  }
  throw new Error(`Unsupported EdgeSAM operation: ${request.operation}`);
}

self.onmessage = (event) => {
  workerQueue = workerQueue.then(() => handle(event.data)).catch((error) => {
    post(event.data.id, { ok: false, error: error instanceof Error ? error.message : "EdgeSAM worker failed", status: status("error", error instanceof Error ? error.message : "EdgeSAM worker failed") });
  });
};
