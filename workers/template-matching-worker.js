let cvPromise = null;
let cvInitializationMs = 0;
let cachedTemplateSource = null;
let cachedTemplate = null;
let workerQueue = Promise.resolve();

function now() {
  return self.performance?.now() ?? Date.now();
}

function loadCv() {
  if (!cvPromise) {
    const startedAt = now();
    cvPromise = (async () => {
      const url = new URL("../vendor/opencv/opencv.js", self.location.href).toString();
      self.importScripts(url);
      if (!self.cv) {
        throw new Error("OpenCV failed to initialize");
      }
      const cv = await self.cv;
      cvInitializationMs = now() - startedAt;
      return cv;
    })();
  }
  return cvPromise;
}

function createSeededRandom(seed) {
  let state = seed | 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

function addGaussianNoise(mat, sigma, seed) {
  if (sigma <= 0) {
    return;
  }
  const random = createSeededRandom(seed);
  for (let index = 0; index < mat.data.length; index += 1) {
    const first = Math.max(random(), Number.EPSILON);
    const second = random();
    const standardNormal = Math.sqrt(-2 * Math.log(first)) * Math.cos(2 * Math.PI * second);
    mat.data[index] = Math.max(0, Math.min(255, Math.round(mat.data[index] + standardNormal * sigma)));
  }
}

function preprocessMat(cv, source, settings) {
  let current = new cv.Mat();
  cv.cvtColor(source, current, settings.grayscale ? cv.COLOR_RGBA2GRAY : cv.COLOR_RGBA2RGB);

  if (settings.gaussianBlurEnabled && settings.blurKernelSize > 1) {
    const blurred = new cv.Mat();
    cv.GaussianBlur(
      current,
      blurred,
      new cv.Size(settings.blurKernelSize, settings.blurKernelSize),
      settings.blurSigma,
      settings.blurSigma,
      cv.BORDER_DEFAULT
    );
    current.delete();
    current = blurred;
  }

  if (settings.gaussianNoiseEnabled) {
    addGaussianNoise(current, settings.gaussianNoiseSigma, settings.gaussianNoiseSeed);
  }
  return current;
}

function deleteCachedTemplate() {
  cachedTemplate?.mat.delete();
  cachedTemplate = null;
}

function deleteCachedTemplateSource() {
  deleteCachedTemplate();
  cachedTemplateSource?.mat.delete();
  cachedTemplateSource = null;
}

function ensureTemplateSource(cv, request) {
  if (cachedTemplateSource?.key === request.templateKey) {
    return cachedTemplateSource;
  }
  if (!request.template) {
    throw new Error("Template cache miss requires template image data");
  }
  deleteCachedTemplateSource();
  const mat = cv.matFromImageData({
    width: request.template.width,
    height: request.template.height,
    data: new Uint8ClampedArray(request.template.data)
  });
  cachedTemplateSource = {
    key: request.templateKey,
    mat,
    width: request.template.width,
    height: request.template.height
  };
  return cachedTemplateSource;
}

function ensureProcessedTemplate(cv, request, timings) {
  const source = ensureTemplateSource(cv, request);
  if (cachedTemplate?.key === request.preprocessingKey) {
    return { ...cachedTemplate, cacheHit: true };
  }
  deleteCachedTemplate();
  const startedAt = now();
  const mat = preprocessMat(cv, source.mat, request.preprocessing);
  timings.templatePreprocessingMs = now() - startedAt;
  cachedTemplate = { key: request.preprocessingKey, mat };
  return { ...cachedTemplate, cacheHit: false };
}

function extractLocalMaxima(result, minimumScore, boxWidth, boxHeight, offsetX, offsetY) {
  const candidates = [];
  const width = result.cols;
  const height = result.rows;
  const scores = result.data32F;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      const score = scores[index];
      if (!Number.isFinite(score) || score < minimumScore) {
        continue;
      }
      let localMaximum = true;
      for (let neighborY = Math.max(0, y - 1); neighborY <= Math.min(height - 1, y + 1) && localMaximum; neighborY += 1) {
        for (let neighborX = Math.max(0, x - 1); neighborX <= Math.min(width - 1, x + 1); neighborX += 1) {
          const neighborIndex = neighborY * width + neighborX;
          if (neighborIndex === index) {
            continue;
          }
          const neighborScore = scores[neighborIndex];
          if (neighborScore > score || (neighborScore === score && neighborIndex < index)) {
            localMaximum = false;
            break;
          }
        }
      }
      if (localMaximum) {
        candidates.push({ score, x: x + offsetX, y: y + offsetY, width: boxWidth, height: boxHeight });
      }
    }
  }
  return candidates.sort((left, right) => right.score - left.score || left.y - right.y || left.x - right.x);
}

function intersectionArea(left, right) {
  const width = Math.max(0, Math.min(left.x + left.width, right.x + right.width) - Math.max(left.x, right.x));
  const height = Math.max(0, Math.min(left.y + left.height, right.y + right.height) - Math.max(left.y, right.y));
  return width * height;
}

function iou(left, right) {
  const intersection = intersectionArea(left, right);
  const union = left.width * left.height + right.width * right.height - intersection;
  return union > 0 ? intersection / union : 0;
}

function padAndSuppress(candidates, settings, targetWidth, targetHeight) {
  const padded = candidates.map((candidate) => ({
    ...candidate,
    x: candidate.x - settings.paddingX,
    y: candidate.y - settings.paddingY,
    width: candidate.width + settings.paddingX * 2,
    height: candidate.height + settings.paddingY * 2
  })).filter((candidate) => candidate.x >= 0
    && candidate.y >= 0
    && candidate.x + candidate.width <= targetWidth
    && candidate.y + candidate.height <= targetHeight);
  const selected = [];
  for (const candidate of padded) {
    const overlaps = selected.some((accepted) => settings.strictNonOverlap
      ? intersectionArea(candidate, accepted) > 0
      : iou(candidate, accepted) > settings.nmsIouThreshold);
    if (!overlaps) {
      selected.push(candidate);
      if (selected.length >= settings.maximumDetections) {
        break;
      }
    }
  }
  return selected;
}

function matchAccurate(cv, target, template) {
  const result = new cv.Mat();
  cv.matchTemplate(target, template, result, cv.TM_CCOEFF_NORMED);
  return result;
}

function matchFastBest(cv, target, template) {
  if (target.cols < template.cols + 4 || target.rows < template.rows + 4 || template.cols < 8 || template.rows < 8) {
    const result = matchAccurate(cv, target, template);
    const extrema = cv.minMaxLoc(result);
    result.delete();
    return extrema;
  }
  const scale = 0.5;
  const coarseTarget = new cv.Mat();
  const coarseTemplate = new cv.Mat();
  const coarseResult = new cv.Mat();
  try {
    cv.resize(target, coarseTarget, new cv.Size(Math.max(1, Math.round(target.cols * scale)), Math.max(1, Math.round(target.rows * scale))), 0, 0, cv.INTER_AREA);
    cv.resize(template, coarseTemplate, new cv.Size(Math.max(2, Math.round(template.cols * scale)), Math.max(2, Math.round(template.rows * scale))), 0, 0, cv.INTER_AREA);
    cv.matchTemplate(coarseTarget, coarseTemplate, coarseResult, cv.TM_CCOEFF_NORMED);
    const coarse = cv.minMaxLoc(coarseResult);
    const estimatedX = Math.round(coarse.maxLoc.x / scale);
    const estimatedY = Math.round(coarse.maxLoc.y / scale);
    const margin = 6;
    const startX = Math.max(0, estimatedX - margin);
    const startY = Math.max(0, estimatedY - margin);
    const endX = Math.min(target.cols, estimatedX + template.cols + margin);
    const endY = Math.min(target.rows, estimatedY + template.rows + margin);
    const refineSource = target.roi(new cv.Rect(startX, startY, endX - startX, endY - startY));
    const refineResult = new cv.Mat();
    try {
      cv.matchTemplate(refineSource, template, refineResult, cv.TM_CCOEFF_NORMED);
      const refined = cv.minMaxLoc(refineResult);
      return {
        ...refined,
        maxLoc: { x: refined.maxLoc.x + startX, y: refined.maxLoc.y + startY }
      };
    } finally {
      refineResult.delete();
      refineSource.delete();
    }
  } finally {
    coarseResult.delete();
    coarseTemplate.delete();
    coarseTarget.delete();
  }
}

function matchFastMultiple(cv, target, template, minimumScore, searchOffset, maximumCandidates) {
  if (template.cols < 8 || template.rows < 8) {
    const result = matchAccurate(cv, target, template);
    try {
      return extractLocalMaxima(result, minimumScore, template.cols, template.rows, searchOffset.x, searchOffset.y);
    } finally {
      result.delete();
    }
  }
  const scale = 0.5;
  const coarseTarget = new cv.Mat();
  const coarseTemplate = new cv.Mat();
  const coarseResult = new cv.Mat();
  const refined = [];
  try {
    cv.resize(target, coarseTarget, new cv.Size(Math.max(1, Math.round(target.cols * scale)), Math.max(1, Math.round(target.rows * scale))), 0, 0, cv.INTER_AREA);
    cv.resize(template, coarseTemplate, new cv.Size(Math.max(2, Math.round(template.cols * scale)), Math.max(2, Math.round(template.rows * scale))), 0, 0, cv.INTER_AREA);
    cv.matchTemplate(coarseTarget, coarseTemplate, coarseResult, cv.TM_CCOEFF_NORMED);
    const coarseCandidates = extractLocalMaxima(
      coarseResult,
      Math.max(-1, minimumScore - 0.12),
      coarseTemplate.cols,
      coarseTemplate.rows,
      0,
      0
    ).slice(0, maximumCandidates);
    for (const candidate of coarseCandidates) {
      const estimatedX = Math.round(candidate.x / scale);
      const estimatedY = Math.round(candidate.y / scale);
      const margin = 6;
      const startX = Math.max(0, estimatedX - margin);
      const startY = Math.max(0, estimatedY - margin);
      const endX = Math.min(target.cols, estimatedX + template.cols + margin);
      const endY = Math.min(target.rows, estimatedY + template.rows + margin);
      if (endX - startX < template.cols || endY - startY < template.rows) {
        continue;
      }
      const refineSource = target.roi(new cv.Rect(startX, startY, endX - startX, endY - startY));
      const refineResult = new cv.Mat();
      try {
        cv.matchTemplate(refineSource, template, refineResult, cv.TM_CCOEFF_NORMED);
        const match = cv.minMaxLoc(refineResult);
        if (match.maxVal >= minimumScore) {
          refined.push({
            score: match.maxVal,
            x: match.maxLoc.x + startX + searchOffset.x,
            y: match.maxLoc.y + startY + searchOffset.y,
            width: template.cols,
            height: template.rows
          });
        }
      } finally {
        refineResult.delete();
        refineSource.delete();
      }
    }
    const byCoordinate = new Map();
    refined.forEach((candidate) => {
      const key = `${candidate.x}:${candidate.y}`;
      const existing = byCoordinate.get(key);
      if (!existing || candidate.score > existing.score) {
        byCoordinate.set(key, candidate);
      }
    });
    return [...byCoordinate.values()].sort((left, right) => right.score - left.score || left.y - right.y || left.x - right.x);
  } finally {
    coarseResult.delete();
    coarseTemplate.delete();
    coarseTarget.delete();
  }
}

async function runMatch(request) {
  const workerStartedAt = now();
  const cv = await loadCv();
  const timings = {
    engineInitializationMs: cvInitializationMs,
    transferPreparationMs: request.transferPreparationMs ?? 0,
    targetPreprocessingMs: 0,
    templatePreprocessingMs: 0,
    matchingMs: 0,
    candidateExtractionMs: 0,
    workerTotalMs: 0,
    roundTripMs: 0
  };
  const mats = [];
  try {
    const targetSource = cv.matFromImageData({
      width: request.target.width,
      height: request.target.height,
      data: new Uint8ClampedArray(request.target.data)
    });
    mats.push(targetSource);
    const searchOffset = { x: request.matching.searchRoi?.x ?? 0, y: request.matching.searchRoi?.y ?? 0 };
    const targetRoi = request.matching.searchRoi
      ? targetSource.roi(new cv.Rect(
        request.matching.searchRoi.x,
        request.matching.searchRoi.y,
        request.matching.searchRoi.width,
        request.matching.searchRoi.height
      ))
      : targetSource;
    if (targetRoi !== targetSource) {
      mats.push(targetRoi);
    }
    const targetPreprocessStartedAt = now();
    const target = preprocessMat(cv, targetRoi, request.preprocessing);
    timings.targetPreprocessingMs = now() - targetPreprocessStartedAt;
    mats.push(target);
    const templateEntry = ensureProcessedTemplate(cv, request, timings);
    const template = templateEntry.mat;

    const matchingStartedAt = now();
    let best;
    let matches;
    if (request.outputMode === "multiple-detection-boxes") {
      const settings = request.multipleDetection;
      if (!settings) {
        throw new Error("Multiple detection settings are required");
      }
      let candidates;
      if (request.matching.mode === "fast") {
        candidates = matchFastMultiple(
          cv,
          target,
          template,
          request.matching.minimumScore,
          searchOffset,
          Math.min(2000, Math.max(settings.maximumDetections * 8, 64))
        );
        timings.matchingMs = now() - matchingStartedAt;
      } else {
        const result = matchAccurate(cv, target, template);
        timings.matchingMs = now() - matchingStartedAt;
        const candidateStartedAt = now();
        candidates = extractLocalMaxima(
          result,
          request.matching.minimumScore,
          cachedTemplateSource.width,
          cachedTemplateSource.height,
          searchOffset.x,
          searchOffset.y
        );
        timings.candidateExtractionMs = now() - candidateStartedAt;
        result.delete();
      }
      const candidateStartedAt = now();
      matches = padAndSuppress(candidates, settings, request.target.width, request.target.height);
      timings.candidateExtractionMs += now() - candidateStartedAt;
      const bestCandidate = candidates[0];
      best = bestCandidate ?? { score: -1, x: 0, y: 0, width: cachedTemplateSource.width, height: cachedTemplateSource.height };
    } else {
      const extrema = request.matching.mode === "fast"
        ? matchFastBest(cv, target, template)
        : (() => {
          const result = matchAccurate(cv, target, template);
          try {
            return cv.minMaxLoc(result);
          } finally {
            result.delete();
          }
        })();
      timings.matchingMs = now() - matchingStartedAt;
      best = {
        score: extrema.maxVal,
        x: extrema.maxLoc.x + searchOffset.x,
        y: extrema.maxLoc.y + searchOffset.y,
        width: cachedTemplateSource.width,
        height: cachedTemplateSource.height
      };
      matches = [best];
    }

    timings.workerTotalMs = now() - workerStartedAt;
    self.postMessage({
      id: request.id,
      ok: true,
      result: {
        score: best.score,
        x: best.x,
        y: best.y,
        width: best.width,
        height: best.height,
        matches,
        timings,
        templateCacheHit: templateEntry.cacheHit
      }
    });
  } catch (error) {
    self.postMessage({
      id: request.id,
      ok: false,
      error: error instanceof Error ? error.message : "OpenCV template matching failed"
    });
  } finally {
    [...new Set(mats)].reverse().forEach((mat) => mat.delete());
  }
}

async function handleRequest(request) {
  if (request.operation === "warmup") {
    await loadCv();
    self.postMessage({
      id: request.id,
      ok: true,
      warmup: { engineInitializationMs: cvInitializationMs }
    });
    return;
  }
  await runMatch(request);
}

self.onmessage = (event) => {
  workerQueue = workerQueue.then(() => handleRequest(event.data)).catch((error) => {
    self.postMessage({
      id: event.data.id,
      ok: false,
      error: error instanceof Error ? error.message : "Template matching worker failed"
    });
  });
};
