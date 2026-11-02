---
name: ai-preprocessing
description: >
  Use when working on easy_labeling's AI-assisted segmentation: EdgeSAM
  interactive segmentation (click/box prompt -> mask, the AI Select tool).
  Covers src/features/edgesam/*.ts, workers/edgesam-worker.js, and the ONNX
  model files under resources/models/edgesam/. Not for the superpixel/smart tools inside segmentation
  itself (see segmentation-workflow) or OpenCV template matching (see
  automation-template-matching).
---

# AI preprocessing (EdgeSAM)

EdgeSAM runs its ONNX models in a dedicated Web Worker, off the main thread,
with a request/response `postMessage` pattern: `{id, operation}` in,
matched response out. It supports WebGPU with a WASM fallback.

The ROI super-resolution (CFSR) enhancement that used to live here was
removed in v2.30.0 (code, worker, models and the Preprocess panel's AI
view/pipeline); don't look for `features/super-resolution`.

## EdgeSAM (interactive click/box-prompt segmentation)

SAM-family encoder/decoder pair, used by the segmentation "ai-select" tool
(see segmentation-workflow skill for how the ROI constraint and overlay
around it work).

- `src/features/edgesam/service.ts: createEdgeSamService()` spawns
  `workers/edgesam-worker.js` as a module Worker. API:
  - `prepareImage(input)` — encodes the image once per `cacheKey`
    (memoized, so switching back to an already-encoded image is free)
  - `decode(input)` — needs a prepared image; **throws** if called before
    `prepareImage`
  - `clear()`, `dispose()`, `getStatus()`
- Worker operations (`edgesam-worker.js:175-198`): `INIT_MODEL`,
  `ENCODE_IMAGE`, `DECODE`, `CLEAR`, `DISPOSE`.
- `src/features/edgesam/preprocess.ts` — pure math, no DOM:
  - `getEdgeSamResize` — fits the image to a 1024px long side
  - `toEdgeSamPrompt` — converts points+box into SAM coordinate/label
    arrays (max 5 prompts; box corners get labels 2/3)
  - `preprocessEdgeSamImage` — RGBA -> normalized CHW Float32 tensor
    (ImageNet mean/std)
  - `restoreEdgeSamMask` — upsamples 256x256 decoder logits to full
    resolution via bilinear interpolation + threshold
- `src/features/edgesam/types.ts` — `EdgeSamStatus.phase`:
  `idle | loading | encoding | ready | error`; `backend: "webgpu" | "wasm"`.
- Model files: `resources/models/edgesam/{encoder,decoder}.onnx`
  (~22MB / ~16MB).

## Gotcha checklist

- EdgeSAM's `decode()` throws if `prepareImage()` hasn't run for the
  current image yet — don't call it speculatively.
- The worker requires its vendored/ONNX runtime assets present; ONNX
  Runtime Web itself is an npm dependency (`onnxruntime-web`, imported
  normally), unlike fabric/bootstrap/opencv which are vendored as CDN-style
  globals (see root CLAUDE.md).
