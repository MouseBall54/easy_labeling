import * as ort from "../vendor/onnxruntime/ort.all.min.mjs";

const MODELS = {
  "cfsr-x2": { family: "cfsr", scale: 2, backendPolicy: "webgpu-preferred", url: new URL("../resources/models/sr/cfsr_x2.onnx", self.location.href).toString() },
  "cfsr-x4": { family: "cfsr", scale: 4, backendPolicy: "webgpu-preferred", url: new URL("../resources/models/sr/cfsr_x4.onnx", self.location.href).toString() },
  "tk-r-em-hrsem": { family: "tk-r-em", scale: 1, backendPolicy: "wasm-quality-safe", url: new URL("../resources/models/sr/sfr_hrsem.onnx", self.location.href).toString() },
  "tk-r-em-hrtem": { family: "tk-r-em", scale: 1, backendPolicy: "wasm-quality-safe", url: new URL("../resources/models/sr/sfr_hrtem.onnx", self.location.href).toString() },
  "tk-r-em-lrsem": { family: "tk-r-em", scale: 1, backendPolicy: "wasm-quality-safe", url: new URL("../resources/models/sr/sfr_lrsem.onnx", self.location.href).toString() },
  "tk-r-em-lrtem": { family: "tk-r-em", scale: 1, backendPolicy: "wasm-quality-safe", url: new URL("../resources/models/sr/sfr_lrtem.onnx", self.location.href).toString() }
};
const DEFAULT_TILE_SIZE = 256;
const DEFAULT_OVERLAP = 16;
const REQUESTED_BACKEND = new URL(self.location.href).searchParams.get("backend");

const sessions = new Map();
let backend = null;
let runs = 0;
let workerQueue = Promise.resolve();

function post(id, payload, transfer = []) {
  self.postMessage({ id, ...payload }, transfer);
}

function status(phase, details = {}) {
  return { phase, backend, runs, ...details };
}

function describeError(error) {
  return error instanceof Error ? error.message : String(error);
}

function getModel(mode) {
  const model = MODELS[mode];
  if (!model) throw new Error(`Unsupported enhancement model: ${mode}`);
  return model;
}

function loadArrayBuffer(url, mode) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";
    request.onload = () => request.status === 0 || (request.status >= 200 && request.status < 300)
      ? resolve(request.response)
      : reject(new Error(`Unable to load local ${mode} model (${request.status})`));
    request.onerror = () => reject(new Error(`Unable to load local ${mode} model`));
    request.send();
  });
}

async function ensureSession(mode, id, imageCacheKey, startedAt) {
  const existing = sessions.get(mode);
  if (existing) {
    backend = existing.backend;
    post(id, { ok: true, status: status("preparing", {
      mode,
      imageCacheKey,
      startedAt,
      elapsedMs: Date.now() - startedAt,
      fallbackOccurred: existing.fallbackOccurred,
      fallbackReason: existing.fallbackReason,
      message: existing.backend === "webgpu" ? "Using GPU / WebGPU" : "Using CPU / WASM"
    }) });
    return existing;
  }
  const modelSpec = getModel(mode);
  backend = null;
  post(id, { ok: true, status: status("loading-model", {
    backend: null,
    mode,
    imageCacheKey,
    startedAt,
    elapsedMs: Date.now() - startedAt,
    message: "Loading AI model"
  }) });
  ort.env.wasm.wasmPaths = new URL("../vendor/onnxruntime/", self.location.href).toString();
  const model = await loadArrayBuffer(modelSpec.url, mode);
  let session;
  let sessionBackend;
  let fallbackOccurred = false;
  let fallbackReason = null;
  const forceWebGpu = REQUESTED_BACKEND === "webgpu";
  const preferWasm = REQUESTED_BACKEND === "wasm" || (!forceWebGpu && modelSpec.backendPolicy === "wasm-quality-safe");
  if (preferWasm) {
    post(id, { ok: true, status: status("loading-model", {
      backend: null,
      mode,
      imageCacheKey,
      startedAt,
      elapsedMs: Date.now() - startedAt,
      message: modelSpec.backendPolicy === "wasm-quality-safe" && REQUESTED_BACKEND !== "wasm"
        ? "Starting CPU / WASM session (quality-safe model policy)"
        : "Starting CPU / WASM session"
    }) });
    session = await ort.InferenceSession.create(model, { executionProviders: ["wasm"] });
    sessionBackend = "wasm";
  } else {
    try {
      post(id, { ok: true, status: status("loading-model", {
        backend: null,
        mode,
        imageCacheKey,
        startedAt,
        elapsedMs: Date.now() - startedAt,
        message: "Starting GPU / WebGPU session"
      }) });
      session = await ort.InferenceSession.create(model, {
        executionProviders: [{ name: "webgpu", preferredLayout: "NCHW" }]
      });
      sessionBackend = "webgpu";
    } catch (error) {
      fallbackOccurred = true;
      fallbackReason = `WebGPU initialization failed: ${describeError(error)}`;
      session = await ort.InferenceSession.create(model, { executionProviders: ["wasm"] });
      sessionBackend = "wasm";
    }
  }
  const entry = { session, backend: sessionBackend, model, fallbackOccurred, fallbackReason };
  sessions.set(mode, entry);
  backend = sessionBackend;
  post(id, { ok: true, status: status("preparing", {
    mode,
    imageCacheKey,
    startedAt,
    elapsedMs: Date.now() - startedAt,
    fallbackOccurred,
    fallbackReason,
    message: fallbackOccurred
      ? "WebGPU unavailable; continuing on CPU / WASM"
      : sessionBackend === "webgpu"
        ? "Using GPU / WebGPU"
        : modelSpec.backendPolicy === "wasm-quality-safe" && REQUESTED_BACKEND !== "wasm"
          ? "Using CPU / WASM (quality-safe model policy)"
          : "Using CPU / WASM"
  }) });
  return entry;
}

function normalizeTileSize(value) {
  return Number.isInteger(value) && value >= 32 ? value : DEFAULT_TILE_SIZE;
}

function normalizeOverlap(value, tileSize) {
  return Number.isInteger(value) && value >= 0 && value < tileSize / 2 ? value : DEFAULT_OVERLAP;
}

function rgbaToNchw(rgba, width, height) {
  const plane = width * height;
  const values = new Float32Array(plane * 3);
  for (let pixel = 0; pixel < plane; pixel += 1) {
    const offset = pixel * 4;
    values[pixel] = (rgba[offset] ?? 0) / 255;
    values[plane + pixel] = (rgba[offset + 1] ?? 0) / 255;
    values[plane * 2 + pixel] = (rgba[offset + 2] ?? 0) / 255;
  }
  return values;
}

function nchwToRgba(values, width, height) {
  const plane = width * height;
  const rgba = new Uint8ClampedArray(plane * 4);
  for (let pixel = 0; pixel < plane; pixel += 1) {
    rgba[pixel * 4] = Math.round(Math.max(0, Math.min(1, values[pixel] ?? 0)) * 255);
    rgba[pixel * 4 + 1] = Math.round(Math.max(0, Math.min(1, values[plane + pixel] ?? 0)) * 255);
    rgba[pixel * 4 + 2] = Math.round(Math.max(0, Math.min(1, values[plane * 2 + pixel] ?? 0)) * 255);
    rgba[pixel * 4 + 3] = 255;
  }
  return rgba;
}

function rgbaToEvenNhwcGray(rgba, width, height) {
  const paddedWidth = width + (width % 2);
  const paddedHeight = height + (height % 2);
  const values = new Float32Array(paddedWidth * paddedHeight);
  let sum = 0;
  for (let pixel = 0; pixel < width * height; pixel += 1) {
    const offset = pixel * 4;
    const gray = ((rgba[offset] ?? 0) * 0.2126 + (rgba[offset + 1] ?? 0) * 0.7152 + (rgba[offset + 2] ?? 0) * 0.0722) / 255;
    values[Math.floor(pixel / width) * paddedWidth + (pixel % width)] = gray;
    sum += gray;
  }
  const mean = sum / (width * height);
  if (paddedWidth !== width) {
    for (let y = 0; y < height; y += 1) values[y * paddedWidth + width] = mean;
  }
  if (paddedHeight !== height) {
    values.fill(mean, height * paddedWidth);
  }
  return { values, width: paddedWidth, height: paddedHeight };
}

function nhwcGrayToRgba(values, tensorWidth, width, height) {
  const rgba = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixel = y * width + x;
      const gray = Math.round(Math.max(0, Math.min(1, values[y * tensorWidth + x] ?? 0)) * 255);
      rgba[pixel * 4] = gray;
      rgba[pixel * 4 + 1] = gray;
      rgba[pixel * 4 + 2] = gray;
      rgba[pixel * 4 + 3] = 255;
    }
  }
  return rgba;
}

function cropRgba(source, sourceWidth, left, top, width, height) {
  const result = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    const start = ((top + y) * sourceWidth + left) * 4;
    result.set(source.subarray(start, start + width * 4), y * width * 4);
  }
  return result;
}

function getPatchStarts(length, patchSize) {
  if (patchSize >= length) return [0];
  const stride = Math.max(1, Math.floor(patchSize / 2));
  const last = length - patchSize;
  const starts = [];
  for (let start = 0; start < last; start += stride) starts.push(start);
  if (starts.at(-1) !== last) starts.push(last);
  return starts;
}

function createButterworthWeights(length, cutoff = 0.33, order = 4) {
  const weights = new Float32Array(length);
  const denominator = cutoff * length;
  const center = Math.floor(length / 2);
  for (let index = 0; index < length; index += 1) {
    weights[index] = 1 / (1 + Math.pow((index - center) / denominator, 2 * order));
  }
  return weights;
}

async function restoreTkImage(sessionEntry, model, rgba, width, height, requestedTileSize, onUnitComplete, runContext) {
  const patchWidth = Math.min(width, Math.max(128, requestedTileSize));
  const patchHeight = Math.min(height, Math.max(128, requestedTileSize));
  if (patchWidth === width && patchHeight === height) {
    const result = await upscaleTile(sessionEntry, model, rgba, width, height, runContext);
    onUnitComplete();
    return result;
  }
  const startsX = getPatchStarts(width, patchWidth);
  const startsY = getPatchStarts(height, patchHeight);
  const weightsX = createButterworthWeights(patchWidth);
  const weightsY = createButterworthWeights(patchHeight);
  const accumulated = new Float32Array(width * height);
  const weightMap = new Float32Array(width * height);
  for (const top of startsY) {
    for (const left of startsX) {
      const tile = await upscaleTile(
        sessionEntry,
        model,
        cropRgba(rgba, width, left, top, patchWidth, patchHeight),
        patchWidth,
        patchHeight,
        runContext
      );
      onUnitComplete();
      for (let y = 0; y < patchHeight; y += 1) {
        for (let x = 0; x < patchWidth; x += 1) {
          const target = (top + y) * width + left + x;
          const weight = weightsY[y] * weightsX[x];
          accumulated[target] += (tile[(y * patchWidth + x) * 4] ?? 0) * weight;
          weightMap[target] += weight;
        }
      }
    }
  }
  const output = new Uint8ClampedArray(width * height * 4);
  for (let pixel = 0; pixel < width * height; pixel += 1) {
    const gray = weightMap[pixel] > 0 ? Math.round(accumulated[pixel] / weightMap[pixel]) : 0;
    output[pixel * 4] = gray;
    output[pixel * 4 + 1] = gray;
    output[pixel * 4 + 2] = gray;
    output[pixel * 4 + 3] = 255;
  }
  return output;
}

async function runTile(session, model, rgba, width, height) {
  const inputName = session.inputNames[0];
  const tkInput = model.family === "tk-r-em" ? rgbaToEvenNhwcGray(rgba, width, height) : null;
  const inputTensor = tkInput
    ? new ort.Tensor("float32", tkInput.values, [1, tkInput.height, tkInput.width, 1])
    : new ort.Tensor("float32", rgbaToNchw(rgba, width, height), [1, 3, height, width]);
  const output = await session.run({ [inputName]: inputTensor });
  const outputName = session.outputNames[0];
  const tensor = output[outputName];
  const values = await tensor.getData();
  const outputHeight = tensor.dims.at(-2);
  const outputWidth = tensor.dims.at(-1);
  if (model.family === "tk-r-em") {
    if (tensor.dims.length !== 4 || tensor.dims.at(-1) !== 1 || tensor.dims[1] !== tkInput.height || tensor.dims[2] !== tkInput.width) {
      throw new Error("tk_r_em output shape does not match its padded NHWC input");
    }
    return nhwcGrayToRgba(values, tkInput.width, width, height);
  }
  if (outputWidth !== width * model.scale || outputHeight !== height * model.scale) {
    throw new Error(`CFSR output shape does not match [1,3,H*${model.scale},W*${model.scale}]`);
  }
  return nchwToRgba(values, outputWidth, outputHeight);
}

async function upscaleTile(sessionEntry, model, rgba, width, height, runContext) {
  try {
    return await runTile(sessionEntry.session, model, rgba, width, height);
  } catch (error) {
    if (sessionEntry.backend !== "webgpu") throw error;
    try {
      await sessionEntry.session.release?.();
    } catch {
      // Continue with a new CPU session even if the lost GPU session cannot release cleanly.
    }
    sessionEntry.session = await ort.InferenceSession.create(sessionEntry.model, { executionProviders: ["wasm"] });
    sessionEntry.backend = "wasm";
    sessionEntry.fallbackOccurred = true;
    sessionEntry.fallbackReason = `WebGPU inference failed: ${describeError(error)}`;
    backend = "wasm";
    post(runContext.id, { ok: true, status: status("upscaling", {
      mode: runContext.mode,
      imageCacheKey: runContext.imageCacheKey,
      startedAt: runContext.startedAt,
      elapsedMs: Date.now() - runContext.startedAt,
      completedUnits: runContext.completedUnits,
      totalUnits: runContext.totalUnits,
      progressPercent: Math.round((runContext.completedUnits / runContext.totalUnits) * 100),
      fallbackOccurred: true,
      fallbackReason: sessionEntry.fallbackReason,
      message: "WebGPU execution failed; continuing on CPU / WASM"
    }) });
    return await runTile(sessionEntry.session, model, rgba, width, height);
  }
}

async function upscale(image, id, startedAt) {
  if (!image || image.width < 1 || image.height < 1) throw new Error("CFSR image dimensions are invalid");
  const rgba = new Uint8ClampedArray(image.rgba);
  if (rgba.length !== image.width * image.height * 4) throw new Error("CFSR RGBA dimensions are invalid");
  const model = getModel(image.mode);
  const tileSize = normalizeTileSize(image.tileSize);
  const totalUnits = model.family === "tk-r-em"
    ? getPatchStarts(image.width, Math.min(image.width, Math.max(128, tileSize))).length
      * getPatchStarts(image.height, Math.min(image.height, Math.max(128, tileSize))).length
    : Math.ceil(image.width / tileSize) * Math.ceil(image.height / tileSize);
  const runContext = { id, mode: image.mode, imageCacheKey: image.cacheKey, startedAt, completedUnits: 0, totalUnits };
  const sessionEntry = await ensureSession(image.mode, id, image.cacheKey, startedAt);
  const reportUnitComplete = () => {
    runContext.completedUnits += 1;
    post(id, { ok: true, status: status("upscaling", {
      mode: image.mode,
      imageCacheKey: image.cacheKey,
      startedAt,
      elapsedMs: Date.now() - startedAt,
      completedUnits: runContext.completedUnits,
      totalUnits,
      progressPercent: Math.round((runContext.completedUnits / totalUnits) * 100),
      fallbackOccurred: sessionEntry.fallbackOccurred,
      fallbackReason: sessionEntry.fallbackReason,
      message: `Processing tile ${runContext.completedUnits} of ${totalUnits}`
    }) });
  };
  post(id, { ok: true, status: status("upscaling", {
    mode: image.mode,
    imageCacheKey: image.cacheKey,
    startedAt,
    elapsedMs: Date.now() - startedAt,
    completedUnits: 0,
    totalUnits,
    progressPercent: 0,
    fallbackOccurred: sessionEntry.fallbackOccurred,
    fallbackReason: sessionEntry.fallbackReason,
    message: `Processing 0 of ${totalUnits} tiles`
  }) });
  if (model.family === "tk-r-em") {
    const output = await restoreTkImage(sessionEntry, model, rgba, image.width, image.height, tileSize, reportUnitComplete, runContext);
    post(id, { ok: true, status: status("merging", {
      mode: image.mode,
      imageCacheKey: image.cacheKey,
      startedAt,
      elapsedMs: Date.now() - startedAt,
      completedUnits: totalUnits,
      totalUnits,
      progressPercent: 100,
      fallbackOccurred: sessionEntry.fallbackOccurred,
      fallbackReason: sessionEntry.fallbackReason,
      message: "Merging enhanced tiles"
    }) });
    runs += 1;
    return { mode: image.mode, width: image.width, height: image.height, rgba: output, cacheKey: image.cacheKey };
  }
  const overlap = normalizeOverlap(image.overlap, tileSize);
  const outputWidth = image.width * model.scale;
  const outputHeight = image.height * model.scale;
  const output = new Uint8ClampedArray(outputWidth * outputHeight * 4);
  for (let top = 0; top < image.height; top += tileSize) {
    for (let left = 0; left < image.width; left += tileSize) {
      const coreWidth = Math.min(tileSize, image.width - left);
      const coreHeight = Math.min(tileSize, image.height - top);
      const tileLeft = Math.max(0, left - overlap);
      const tileTop = Math.max(0, top - overlap);
      const tileRight = Math.min(image.width, left + coreWidth + overlap);
      const tileBottom = Math.min(image.height, top + coreHeight + overlap);
      const tileWidth = tileRight - tileLeft;
      const tileHeight = tileBottom - tileTop;
      const tile = await upscaleTile(sessionEntry, model, cropRgba(rgba, image.width, tileLeft, tileTop, tileWidth, tileHeight), tileWidth, tileHeight, runContext);
      const cropLeft = (left - tileLeft) * model.scale;
      const cropTop = (top - tileTop) * model.scale;
      const copyWidth = coreWidth * model.scale;
      const copyHeight = coreHeight * model.scale;
      for (let y = 0; y < copyHeight; y += 1) {
        const sourceStart = ((cropTop + y) * (tileWidth * model.scale) + cropLeft) * 4;
        const targetStart = ((top * model.scale + y) * outputWidth + left * model.scale) * 4;
        output.set(tile.subarray(sourceStart, sourceStart + copyWidth * 4), targetStart);
      }
      reportUnitComplete();
    }
  }
  post(id, { ok: true, status: status("merging", {
    mode: image.mode,
    imageCacheKey: image.cacheKey,
    startedAt,
    elapsedMs: Date.now() - startedAt,
    completedUnits: totalUnits,
    totalUnits,
    progressPercent: 100,
    fallbackOccurred: sessionEntry.fallbackOccurred,
    fallbackReason: sessionEntry.fallbackReason,
    message: "Merging enhanced tiles"
  }) });
  runs += 1;
  return { mode: image.mode, width: outputWidth, height: outputHeight, rgba: output, cacheKey: image.cacheKey };
}

async function handle(request) {
  if (request.operation === "UPSCALE") {
    const startedAt = Date.now();
    post(request.id, { ok: true, status: status("preparing", {
      backend: null,
      mode: request.image.mode,
      imageCacheKey: request.image.cacheKey,
      startedAt,
      elapsedMs: 0,
      completedUnits: 0,
      totalUnits: null,
      progressPercent: null,
      fallbackOccurred: false,
      fallbackReason: null,
      message: "Preparing image"
    }) });
    const result = await upscale(request.image, request.id, startedAt);
    const entry = sessions.get(request.image.mode);
    post(request.id, { ok: true, status: status("ready", {
      mode: request.image.mode,
      imageCacheKey: result.cacheKey,
      startedAt,
      elapsedMs: Date.now() - startedAt,
      progressPercent: 100,
      fallbackOccurred: entry?.fallbackOccurred ?? false,
      fallbackReason: entry?.fallbackReason ?? null,
      message: "AI enhancement complete"
    }), result: { ...result, rgba: result.rgba.buffer } }, [result.rgba.buffer]);
    return;
  }
  if (request.operation === "CLEAR") {
    post(request.id, { ok: true, status: status("idle", { imageCacheKey: null, message: null }) });
    return;
  }
  if (request.operation === "DISPOSE") {
    await Promise.all([...sessions.values()].map((entry) => entry.session.release?.()));
    sessions.clear();
    return;
  }
  throw new Error(`Unsupported Super Resolution operation: ${request.operation}`);
}

self.onmessage = (event) => {
  workerQueue = workerQueue.then(() => handle(event.data)).catch((error) => {
    const message = error instanceof Error ? error.message : "Super Resolution worker failed";
    post(event.data.id, { ok: false, error: message, status: status("error", {
      mode: event.data.image?.mode ?? null,
      imageCacheKey: event.data.image?.cacheKey ?? null,
      message
    }) });
  });
};
