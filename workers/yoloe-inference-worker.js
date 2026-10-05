import * as ort from "../vendor/onnxruntime/ort.all.min.mjs";
import { getLetterbox, rgbaToTensor } from "../dist/features/inference/yolo.js";
import { decodeYoloePredictions, yoloeSemanticMask } from "../dist/features/inference/yoloe-onnx.js";

ort.env.wasm.wasmPaths = new URL("../vendor/onnxruntime/", self.location.href).toString();
ort.env.wasm.numThreads = 1;
ort.env.wasm.proxy = false;
ort.env.webgpu.powerPreference = "high-performance";
let encoder, detector, modelFiles, modelName, profile, classIds, embeddingData;
let backend = "cpu", fallbackReason = null, queue = Promise.resolve();
let gpuDescription = null;

async function gpuAvailable() {
  const adapter = self.navigator.gpu && await self.navigator.gpu.requestAdapter({ powerPreference: "high-performance" });
  const info = adapter?.info;
  gpuDescription = info?.description || info?.vendor || "WebGPU";
  return Boolean(adapter && !adapter.isFallbackAdapter && !info?.isFallbackAdapter && !/swiftshader|llvmpipe|software/i.test(gpuDescription));
}

async function sessions(provider) {
  for (const session of [encoder, detector]) {
    try { await session?.release(); } catch { /* A lost GPU may also fail during release; continue with CPU. */ }
  }
  encoder = detector = null;
  const options = (name) => ({ executionProviders: provider === "webgpu" ? [{ name: "webgpu", preferredLayout: "NCHW" }] : ["wasm"],
    externalData: Object.entries(modelFiles).filter(([file]) => file.startsWith(`${name}-`) && file.endsWith(".data"))
      .map(([path, data]) => ({ path, data: new Uint8Array(data) })) });
  encoder = await ort.InferenceSession.create(modelFiles["encoder.onnx"], options("encoder"));
  detector = await ort.InferenceSession.create(modelFiles["detector.onnx"], options("detector"));
  backend = provider;
}

async function run(session, inputs) {
  let outputs;
  try {
    outputs = await session.run(inputs);
    const values = {};
    for (const [name, tensor] of Object.entries(outputs)) values[name] = { data: Float32Array.from(await tensor.getData()), dims: tensor.dims };
    return values;
  } finally { if (outputs) Object.values(outputs).forEach((tensor) => tensor.dispose()); }
}

async function gpuFallback(action) {
  try { return await action(); }
  catch (error) {
    if (backend !== "webgpu") throw error;
    fallbackReason = `GPU execution failed: ${error.message}`;
    await sessions("cpu");
    if (profile) { profile.backend = "cpu"; profile.gpu = null; }
    return action();
  }
}

async function imageInput(encoded, size) {
  const image = await createImageBitmap(await (await fetch(encoded)).blob());
  const input = { width: size, height: size, channels: 3, layout: "nchw" };
  const letterbox = getLetterbox(image.width, image.height, input);
  const canvas = new OffscreenCanvas(size, size), context = canvas.getContext("2d", { willReadFrequently: true });
  context.fillStyle = "rgb(114,114,114)"; context.fillRect(0, 0, size, size);
  context.drawImage(image, letterbox.left, letterbox.top, letterbox.resizedWidth, letterbox.resizedHeight);
  image.close();
  const tensor = new ort.Tensor("float32", rgbaToTensor(context.getImageData(0, 0, size, size).data, input), [1, 3, size, size]);
  return { tensor, letterbox };
}

function masksForReference(examples, letterbox, size, ids) {
  const side = size / 8, data = new Float32Array(ids.length * side * side);
  const outlined = examples.some((example) => example.mask || example.polygon);
  for (const [index, id] of ids.entries()) {
    const samples = examples.filter((example) => example.classId === id);
    if (!outlined) {
      for (const example of samples) {
        const [x1, y1, x2, y2] = example.box;
        for (let y = 0; y < side; y++) for (let x = 0; x < side; x++) {
          if (x >= (x1 * letterbox.scale + letterbox.left) / 8 && x < (x2 * letterbox.scale + letterbox.left) / 8
            && y >= (y1 * letterbox.scale + letterbox.top) / 8 && y < (y2 * letterbox.scale + letterbox.top) / 8) data[index * side * side + y * side + x] = 1;
        }
      }
    } else {
      const original = new OffscreenCanvas(letterbox.width, letterbox.height), context = original.getContext("2d");
      context.fillStyle = "white";
      for (const example of samples) {
        if (example.mask) {
          const { width, height, runs } = example.mask, pixels = new Uint8ClampedArray(width * height * 4);
          let p = 0;
          for (let i = 0; i < runs.length; i += 2) for (let n = 0; n < runs[i + 1]; n++, p++) {
            if (runs[i]) { pixels[p * 4] = pixels[p * 4 + 1] = pixels[p * 4 + 2] = 255; pixels[p * 4 + 3] = 255; }
          }
          const crop = new OffscreenCanvas(width, height);
          crop.getContext("2d").putImageData(new ImageData(pixels, width, height), 0, 0);
          context.drawImage(crop, example.box[0], example.box[1]);
        } else if (example.polygon) {
          context.beginPath(); example.polygon.forEach(([x, y], i) => i ? context.lineTo(x, y) : context.moveTo(x, y)); context.closePath(); context.fill();
        } else { const [x1, y1, x2, y2] = example.box; context.fillRect(x1, y1, x2 - x1, y2 - y1); }
      }
      const canvas = new OffscreenCanvas(size, size), resized = canvas.getContext("2d", { willReadFrequently: true });
      resized.imageSmoothingEnabled = false;
      resized.drawImage(original, letterbox.left, letterbox.top, letterbox.resizedWidth, letterbox.resizedHeight);
      const pixels = resized.getImageData(0, 0, size, size).data;
      for (let y = 0; y < side; y++) for (let x = 0; x < side; x++) data[index * side * side + y * side + x] = pixels[((y * 8) * size + x * 8) * 4 + 3] >= 128 ? 1 : 0;
    }
    if (!data.subarray(index * side * side, (index + 1) * side * side).some((value) => value)) throw new Error("Sample is too small at this resolution. Enlarge it or use 1024.");
  }
  return new ort.Tensor("float32", data, [1, ids.length, side, side]);
}

function maskRuns(mask) {
  const runs = [];
  for (const value of mask) {
    if (runs.length && runs[runs.length - 2] === value) runs[runs.length - 1]++;
    else runs.push(value, 1);
  }
  return runs;
}

async function handle(request) {
  if (request.operation === "status") {
    const gpu = await gpuAvailable();
    return { version: 5, cuda: gpu, backend: gpu ? "webgpu" : "cpu", gpu: gpu ? gpuDescription : null,
      models: [..."nsml"].map((size) => `yoloe-26${size}-seg`), busy: false, engine: "onnx" };
  }
  if (request.operation === "prepare") {
    profile = null;
    if (request.workflow === "segmentation" && request.references.some((reference) => reference.examples.some(({ classId }) => !Number.isInteger(classId) || classId < 1 || classId > 65535))) {
      throw new Error("Segmentation class IDs must be 1–65535; 0 is reserved for background.");
    }
    if (request.model !== modelName || !encoder || !detector) {
      modelFiles = request.files; modelName = request.model; fallbackReason = null;
      try { if (!await gpuAvailable()) throw new Error("WebGPU unavailable"); await sessions("webgpu"); }
      catch (error) { fallbackReason = error.message; await sessions("cpu"); }
    }
    const references = request.references;
    const embeddings = []; classIds = []; const classes = {};
    for (const reference of references) {
      const { tensor, letterbox } = await imageInput(reference.image, request.imgsz);
      const ids = [...new Set(reference.examples.map((example) => example.classId))].sort((a, b) => a - b);
      const masks = masksForReference(reference.examples, letterbox, request.imgsz, ids);
      try {
        const value = await gpuFallback(() => run(encoder, { images: tensor, masks }));
        embeddings.push(value.embeddings.data); classIds.push(...ids);
        for (const example of reference.examples) classes[example.classId] = example.name;
      } finally { tensor.dispose(); masks.dispose(); }
    }
    embeddingData = new Float32Array(classIds.length * 512);
    let offset = 0; for (const embedding of embeddings) { embeddingData.set(embedding, offset); offset += embedding.length; }
    const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(references))));
    profile = { id: crypto.randomUUID(), model: request.model, workflow: request.workflow, classes, classIds,
      exampleCount: references.reduce((count, reference) => count + reference.examples.length, 0), referenceCount: references.length,
      referenceSha256: [...hash].map((byte) => byte.toString(16).padStart(2, "0")).join(""), imgsz: request.imgsz,
      backend, gpu: backend === "webgpu" ? gpuDescription : null, engine: "onnx", fallbackReason };
    return profile;
  }
  if (!profile || profile.id !== request.profileId) throw new Error("Samples changed. Find again to prepare them.");
  const { tensor, letterbox } = await imageInput(request.image, profile.imgsz);
  const embeddings = new ort.Tensor("float32", embeddingData, [1, classIds.length, 512]);
  try {
    const { predictions, prototypes } = await gpuFallback(() => run(detector, { images: tensor, embeddings }));
    const selected = decodeYoloePredictions(predictions.data, predictions.dims, classIds, letterbox, request.confidence, request.iou);
    const mask = profile.workflow === "segmentation" ? yoloeSemanticMask(predictions.data, predictions.dims, prototypes.data,
      prototypes.dims, selected, classIds.length, letterbox.width, letterbox.height) : null;
    return { detections: selected.map(({ anchor, ...detection }) => detection), backend, fallbackReason,
      mask: mask ? { width: letterbox.width, height: letterbox.height, runs: maskRuns(mask) } : null };
  } finally { tensor.dispose(); embeddings.dispose(); }
}

self.onmessage = ({ data }) => {
  queue = queue.then(async () => {
    try { self.postMessage({ id: data.id, result: await handle(data) }); }
    catch (error) { self.postMessage({ id: data.id, error: error.message }); }
  });
};
