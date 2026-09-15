---
name: automation-template-matching
description: >
  Use when working on easy_labeling's "automation" feature: template
  capture, OpenCV template matching (accurate/fast pyramid mode), match
  candidate scoring/NMS, box layouts ("layout 적용" — a saved constellation
  of boxes anchored to a match), automation presets, or batch-applying
  labels across many images. Covers src/features/automation/*.ts, the
  workers/template-matching-worker.js OpenCV worker, and
  src/bootstrap/automation-*.ts UI glue. Not for manual box editing (see
  detection-workflow) or AI segmentation models (see ai-preprocessing).
---

# Automation: template matching + layout batch labeling

## Pipeline

1. **Template capture** — `template-workspace.ts`: user draws an ROI
   (`PixelRect`) on a reference image (`interactionMode: "template-roi" |
   "edit-roi" | "select-results"`). `image-data.ts#cropImageElementToPngDataUrl`
   crops the ROI to a PNG data URL, stored as a `TemplateAsset`
   (`types.ts:47-58`: `roi`, `pngDataUrl`, `preprocessing`,
   `sourceImageSize`). All coordinates here are **pixel space of the full
   source image**, not canvas/viewport-relative —
   `template-workspace.ts#eventToImagePoint` converts pointer events before
   anything touches the domain layer.

2. **Preprocessing** — `TemplatePreprocessingSettings` (`types.ts:37-45`):
   grayscale, Gaussian blur (kernel/sigma), Gaussian noise injection
   (sigma/seed). Validated by `preset-codec.ts#validatePreprocessingSettings`
   (kernel must be an odd integer 1-99).

3. **Matching** — `template-matching-service.ts` runs the match in a **Web
   Worker** (`workers/template-matching-worker.js`), which loads OpenCV.js
   from `vendor/opencv/opencv.js` (part of the CDN-globals-in-vendor/
   pattern — see root CLAUDE.md). Algorithm: `cv.matchTemplate(...,
   cv.TM_CCOEFF_NORMED)`. Two modes (`TemplateMatchingMode`, `types.ts:62`):
   - `"accurate"` — direct full-resolution `matchTemplate`.
   - `"fast"` — coarse-to-fine pyramid: downscale 0.5x, coarse match, then
     refine within a small ROI around the coarse peak
     (`worker.js:199-297`, `matchFastBest`/`matchFastMultiple`). ~4x+
     faster per `scripts/benchmark-template-matching.mjs` (drives the app
     headlessly via Playwright, mocking File System Access, to time real
     matching runs — use it when tuning matching performance).
   - Search can be scoped to `TemplateMatchingSettings.searchRoi` (must be
     ≥ template size, checked in `template-matching-service.ts:66-77`).
   - The service dedupes template transfer to the worker via a content hash
     (`getTemplateKey`, ~`:130-138`) so repeated matches with the same
     template skip re-sending pixel data.

4. **Candidates** — `matching-candidates.ts`:
   `extractLocalMaxima` finds local maxima in the score map above
   `minimumScore`; `suppressOverlappingCandidates` does NMS by IoU
   (`strictNonOverlap` = zero-overlap-only, else `nmsIouThreshold`), capped
   at `maximumDetections`; `applyCandidatePadding` expands boxes by
   paddingX/Y.

5. **Output mode** (`AutomationOutputMode`, `types.ts:61`), decided in
   `batch-labels.ts#createAutomationDetectionBoxes`:
   - `"multiple-detection-boxes"` — every matched candidate becomes its own
     box of one class (`MultipleDetectionSettings`, `types.ts:70-77`).
   - `"layout-best-match"` (the "레이아웃 적용" mode) — only the single best
     match's position anchors a **BoxLayout**: a saved constellation of
     boxes captured once relative to an anchor point (`types.ts:17-35`).
     `layout.ts#calculateLayoutAnchor` = `match.(x,y) +
     preset.relationOffset + preset.manualOffset`;
     `layout.ts#placeBoxLayout` translates every `BoxLayoutItem.relativeX/Y`
     by that anchor, then `filterPixelRectsInsideImageBounds` drops any box
     that falls outside the image bounds.
     **Layout boxes store relative offsets from a `sourceAnchor`** (min x/y
     of the originally captured boxes, `layout.ts#createBoxLayout:76-79`),
     never absolute positions — always re-anchor via `placeBoxLayout`, never
     reuse `BoxLayoutItem` coordinates directly.
     If `match.score < preset.matching.minimumScore`, this mode **silently
     returns zero boxes** rather than throwing (`batch-labels.ts:43-45`) —
     the batch summary shows it as processed-but-empty, not failed.

6. **Batch run** — `batch.ts#runSequentialBatch` is a generic,
   file-system-agnostic sequential loop with injected `deps` (get filename,
   check-already-labeled, `processFile`, cancellation, progress callback),
   orchestrated per-image from `src/bootstrap/automation-batch-controller.ts`.
   Per-file outcomes: `success | failed | skipped`.
   `existingLabelsPolicy: "skip" | "append" | "replace"` (`types.ts:60`) —
   the skip check lives in `runSequentialBatch` itself (`batch.ts:88`).

7. **Labels written** — `batch-labels.ts#serializeAutomationBoxes` converts
   generated boxes to YOLO text via `domain/yolo/yolo.ts#serializeRectsToYolo`
   (same codec detection-workflow uses); `mergeDetectionLabels` handles
   append vs. replace against existing `.txt` content.

## Core types (`src/features/automation/types.ts`)

- `TemplateAsset` (47-58), `BoxLayout`/`BoxLayoutItem` (17-35),
  `AutomationPreset` (79-93 — ties `templateId` + `layoutId` + `matching` +
  `multipleDetection` + offsets + policy together), `AutomationLibraryDocument`
  (95-100: `{ layouts[], templates[], presets[] }`),
  `TemplateMatchResult`/`TemplateMatchCandidate` (108-125).

## Persistence (`automation-library-service.ts`)

Library lives at `<imageFolder>/.easy-labeling/automation-library.json`,
loaded/saved via `platform/file-system-access.ts`. Also supports portable
single-preset files (`createPresetFileDocument`/`mergePresetFileDocument` —
one preset + its referenced template/layout) and a "profile" concept:
`loadAutomationProfileFiles` merges external layout/preset JSON files, and
`createDatasetAutomationLibrary` diffs a runtime library against a profile
baseline to persist only what changed.

Schema versioning: `AUTOMATION_SCHEMA_VERSION = 2`, with `migrateVersionOne`
in `preset-codec.ts:118-147` upgrading old presets (adds `outputMode`,
`multipleDetection` defaults, `matching.mode`).

## UI glue (bootstrap layer — read the feature files above first)

`src/bootstrap/automation-controller.ts` is 93KB of **UI wiring only** — the
actual algorithms all live in the smaller `features/automation/*.ts` files
above. `automation-batch-controller.ts` orchestrates a batch run from the UI
side, `automation-layout-preview.ts` renders the layout preview,
`automation-preset-form.ts` handles the preset editing form.

## Gotcha checklist

- Don't read `automation-controller.ts` first looking for the matching
  algorithm — it's not there.
- Layout box coordinates are always relative to a `sourceAnchor`; re-derive
  absolute positions via `placeBoxLayout`, don't hand-translate.
- A "successful" layout-best-match batch run can still produce zero boxes
  per image if the match score is below threshold — check the batch summary
  counts, not just for thrown errors.
- The worker requires `vendor/opencv/opencv.js` to be present (vendored, not
  npm-imported — see root CLAUDE.md's CDN-globals section).
- `layoutInstanceId`/`layoutBoxId` fields on applied boxes are read by the
  detection canvas controller too (see detection-workflow skill) so a whole
  applied layout can be dragged as one group.
