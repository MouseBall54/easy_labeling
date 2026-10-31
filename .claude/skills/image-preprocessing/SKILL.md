---
name: image-preprocessing
description: >
  Use when working on easy_labeling's Image Preprocessing pipeline (the "Processed" image): the
  Preprocess panel controls, the SEM/TEM grayscale filters (median, destripe, background
  flattening, anisotropic diffusion, CLAHE, auto levels, contrast/gamma, edge/edge-blend),
  preprocessing presets, cache keys, and every consumer of processed pixels (canvas Processed view,
  Refine, EdgeSAM, superpixels, automation). Covers src/features/segmentation/preprocessing.ts,
  gray-filters.ts, preprocessing-presets.ts and the preprocess handlers in
  event-manager-adapter.ts. Not for super-resolution or EdgeSAM models (ai-preprocessing).
---

# Image preprocessing

## Pipeline (`preprocessing.ts#preprocessGray`)

Fixed order, each step off by default:

1. 3x3 median (`median`)
2. destripe rows/columns (`destripe`): line medians follow the trend of neighbouring lines
3. background flattening (`flattenSigma` px): subtracts a block-averaged, odd-reflected Gaussian background
4. anisotropic diffusion (`diffusionIterations`, `diffusionKappa`)
5. CLAHE (`claheClip`, `claheTiles`)
6. auto levels (`levelsClip` %)
7. contrast / gamma tone curve
8. mode: `original`, `edge` (normalised Sobel of a blurred copy), `edge-blend` (`edgeWeight`)

Clean-up runs before denoise, denoise before CLAHE (so it does not amplify noise), tone last, edges after tone.

## Rules

- Filters live in `gray-filters.ts`: pure, DOM-free, O(pixels). The refine worker imports `preprocessGray` from `dist/`, so keep them DOM-free.
- Filters must not move edges (Refine reads processed pixels). `tests/unit/features/segmentation/gray-filters.test.ts` checks the edge column through the full pipeline; extend it for new filters. Morphology that changes widths (top-hat, erode/dilate) is deliberately absent.
- The Sobel output is normalised by the whole-image maximum, so processed pixels can only be computed on the full frame, never per crop (the refine worker caches the processed frame per config key).
- `getSegmentationPreprocessingKey` keeps the original key while tone and filters are neutral, so existing EdgeSAM and preprocessing caches stay valid. Config changes are detected by comparing keys (`workflow.ts#setSegmentationPreprocessingConfig`).
- `Original` mode keeps colour when only tone is active; any grey-only filter makes the output grayscale.
- `normalizeSegmentationPreprocessingConfig` clamps every field; add new fields there with a neutral default.

## Performance (4096 x 4096)

Median 0.44 s, destripe 0.11 s, flatten (sigma 100) 0.32 s, CLAHE 0.46 s, auto levels 0.08 s, diffusion about 0.24 s per iteration, Edge Blend 0.72 s. The canvas Processed view computes synchronously on the main thread (`ensureProcessedImage`) and caches per key; moving it to a worker is the known next step if large images with many diffusion iterations become common (see the `ponytail:` note in `gray-filters.ts`).

## Panel and presets

- Controls are table-driven in `event-manager-adapter.ts` (`preprocessRanges`: slider id, config key, scale, label). `setPreprocessPanel(config, presetName)` writes a whole config into the controls and applies it; Reset and presets use it. Hand edits switch the preset select back to Custom.
- Presets: `preprocessing-presets.ts`, one file each in the profile folder `Preprocessing Presets` on the desktop app (`loadPreprocessingPresetLibrary`, `features/presets/profile-presets.ts`), else `<image folder>/.easy-labeling/preprocessing-presets.json` (`upsertPreprocessingPreset`, `parsePreprocessingPresets`). The Refine Lab lists them to pin Refine's processing snapshot.
- Settings are not persisted across app restarts (only presets are).

## Checks

`npx vitest run tests/unit/features/segmentation/` and the e2e specs `segmentation-preprocessing-panel.spec.ts` and `refine-edges.spec.ts` (the "preprocess:" and "presets:" tests drive the panel through `segmentationPreprocess*` element ids).
