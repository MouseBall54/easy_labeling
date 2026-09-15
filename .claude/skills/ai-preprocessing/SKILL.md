---
name: ai-preprocessing
description: >
  Use when working on easy_labeling's AI-assisted preprocessing: EdgeSAM
  interactive segmentation (click/box prompt -> mask) or super-resolution
  image upscaling/enhancement (ROI-based, used to label small objects more
  precisely). Covers src/features/edgesam/*.ts,
  src/features/super-resolution/*.ts, workers/edgesam-worker.js,
  workers/super-resolution-worker.js, and the ONNX model files under
  resources/models/. Not for the superpixel/smart tools inside segmentation
  itself (see segmentation-workflow) or OpenCV template matching (see
  automation-template-matching).
---

# AI preprocessing (EdgeSAM + super-resolution)

Both features run ONNX models in a dedicated Web Worker, off the main
thread, using the same request/response `postMessage` pattern:
`{id, operation}` in, matched response out. Both support WebGPU with a WASM
fallback.

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

## Super-resolution (ROI upscale/enhance before labeling)

- `src/features/super-resolution/service.ts: createSuperResolutionService()`
  uses the same worker request pattern
  (`workers/super-resolution-worker.js`, operations
  `UPSCALE` / `CLEAR` / `DISPOSE`), plus `subscribeStatus(listener)`
  pub/sub and an in-memory result **cache** keyed by `cacheKey` — repeat
  calls on the same ROI return instantly with `cacheHit: true`.
- `model-registry.ts` — 6 modes across 2 families:
  - `cfsr-x2` / `cfsr-x4` — general upscale, `outputScale` 2 or 4
  - `tk-r-em-{hrsem,hrtem,lrsem,lrtem}` — microscopy-specific SEM/TEM
    denoise/enhance, `outputScale` **1** (same-size quality enhancement,
    not upscaling — don't expect larger output dimensions from these)
- Backend selection lives in the worker
  (`super-resolution-worker.js:4-9,117-156`): each model has a
  `backendPolicy` (`webgpu-preferred` or `wasm-quality-safe`). The worker
  tries WebGPU first unless the policy or a URL param forces WASM, and
  **automatically falls back to a WASM session on WebGPU failure**
  (`fallbackOccurred`/`fallbackReason` surfaced in status). This fallback
  path is what a recent commit ("enable stable tk_r_em WebGPU inference")
  stabilized — if you touch backend selection, re-test both the WebGPU and
  forced-WASM paths.
- `types.ts` — `SuperResolutionImageInput` takes `tileSize`/`overlap` for
  tiled inference on large ROIs; status includes
  `completedUnits/totalUnits/progressPercent` (tile progress) and
  `phase: idle | loading-model | preparing | upscaling | merging | ready |
  error`.
- "ROI" / "working width/height" / preview mode (as seen in the
  `window.__easyLabelingTestApi` test hooks in `src/main.ts`) are
  **canvas-controller-level concepts**, not part of this service: the
  segmentation canvas workflow selects a region, calls this service to
  upscale just that region, and shows a preview at the enhanced resolution.
  See `features/segmentation/workflow.ts` and `working-image.ts` for that
  wiring (segmentation-workflow skill).
- Model files: `resources/models/sr/{cfsr_x2,cfsr_x4}.onnx` (~1.3MB each),
  `sfr_{hrsem,hrtem,lrsem,lrtem}.onnx` (~28MB each). Check
  `resources/models/THIRD_PARTY_MODELS.md` for licensing notes before
  redistributing or swapping models.

## Gotcha checklist

- All 6 SR models (`cfsr_x2`, `cfsr_x4`, `sfr_{hrsem,hrtem,lrsem,lrtem}`)
  are bundled into the Electron asar — none are excluded. An earlier
  package.json rule excluded a since-deleted extraneous file
  (`sfr_hrstem.onnx`, a mis-provided duplicate of `sfr_hrtem.onnx` — see
  `docs/SR_PREPROCESS_IMPLEMENTATION_PLAN.md`); that dead rule has been
  removed. Don't reintroduce a `resources/models/sr/*` exclusion without
  checking `THIRD_PARTY_MODELS.md` and that plan doc first — all four
  `tk_r_em` models are required at runtime.
- EdgeSAM's `decode()` throws if `prepareImage()` hasn't run for the
  current image yet — don't call it speculatively.
- Both workers require their vendored/ONNX runtime assets present; ONNX
  Runtime Web itself is an npm dependency (`onnxruntime-web`, imported
  normally), unlike fabric/bootstrap/opencv which are vendored as CDN-style
  globals (see root CLAUDE.md).
