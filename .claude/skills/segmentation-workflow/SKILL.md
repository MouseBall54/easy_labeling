---
name: segmentation-workflow
description: >
  Use when working on the Segmentation (brush/eraser mask) workflow in
  easy_labeling: brush/erase/polygon/superpixel/smart/ai-select tools, the
  mask overlay, region selection and move/relabel, segmentation presets, the
  mask.png + .seg.json save format, or format import/export (COCO, LabelMe,
  YOLO-seg). Covers src/features/segmentation/*.ts and
  src/domain/annotations/segmentation-*.ts. Not for Detection boxes (see
  detection-workflow) or EdgeSAM/super-resolution AI models themselves (see
  ai-preprocessing).
---

# Segmentation workflow (brush-based masks)

## Where the logic lives

`src/features/segmentation/workflow.ts: createSegmentationCanvasWorkflow()`
(~2500 lines) is the big orchestrator implementing the same `CanvasController`
interface as detection. It owns the `SegmentationDocument`, several Fabric
overlay layers (mask/selection/smart-preview/superpixel), the stroke/polygon/
smart-grow/AI-select gesture state machines, and all super-resolution/
preprocessing image-source plumbing. Detection-only controller methods
(`captureBoxLayout`, `applyDetectionBoxes`, etc.) **throw** when called here
— detection and segmentation implement one shared interface but are
mutually exclusive under the hood.

## Data model

- `document.ts: createSegmentationDocument()` — the core mutable model: one
  flat `Uint16Array` mask over the image (`0` = background, `N` = classId).
  Its own undo/redo stack stores full before/after mask snapshots (no
  diffing) — large images make undo memory-heavy per step.
- `types.ts`: `SegmentationTool = "brush" | "erase" | "polygon" |
  "superpixel" | "smart" | "ai-select"`; `SegmentationDocumentSnapshot`
  (width/height/mask/activeClassId/activeTool/overlay state/brushRadius);
  `SegmentationRegionSelection` (classId/pixelCount/pixelIndices/bounds/
  seedPoint).
- Region ops on `document.ts`: `getConnectedRegionAtPoint` (flood-fill),
  `moveRegion` (clears+repaints pixel indices with a clamped delta),
  `relabelConnectedRegionAtPoint`.
- `ensureDocument()` calls `resetDocumentForCurrentImage()` — wiping all
  tool state **including undo history** — whenever the mask dimensions don't
  match the current image. Switching images always resets segmentation edit
  state.

## Tool implementations (`tools.ts`)

Pixel-level mutators: `applyBrushStroke`, `applyEraseStroke`,
`applyPolygonFill`, `applyClosedRegionAutoFillFromStroke` (auto-fills a
closed brush loop when `autoFillClosedRegionEnabled`).

## Overlay rendering (`overlay.ts`)

Three Fabric overlay-layer factories:
- `createSegmentationMaskOverlayLayer` — dirty-rect incremental `.sync()`
- `createSegmentationSelectionOverlayLayer` — used for both region-selection
  and smart/AI preview, variant-colored
- `createSegmentationSuperpixelOverlayLayer` — boundary visualization

## Superpixel / smart tools (`superpixels.ts`)

`createSlicoSuperpixels` — a SLIC-O superpixel implementation producing
region/boundary/neighbor-graph output. `growSuperpixelRegion` does
similarity + edge-stop region growing for the "smart" tool.

## AI-assisted selection (`ai-region-constraint.ts`)

An optional ROI rectangle clips AI-Select (EdgeSAM) output. It can be drawn
manually or derived from an existing detection box via
`createAiSelectConstraintFromDetectionBox` — a rare point of Detection ->
Segmentation data flow.

## Working image / preprocessing (multi-source model)

Three **independent** image-source settings can each point at a different
processed/SR version of the same image simultaneously:
`viewSource` (what's displayed), `edgeSamInputSource`, `superpixelInputSource`
— each one of `original | original-processed | sr-roi | sr-roi-processed`.
This is easy to get confused about ("what pixels is the AI actually seeing"),
so check which source setting is active before debugging AI-select or
superpixel oddities.

- `working-image.ts` — pure coordinate-space conversion between "original"
  image space and a "working image" space (used when a super-resolution ROI
  crop has a different resolution than the original), via
  `WorkingImageDescriptor.originalRoi` + scale factors.
- `preprocessing.ts` — `SegmentationPreprocessMode = "original" | "edge" |
  "edge-blend"`; `preprocessSegmentationImage()` applies edge-highlight
  filters before display/AI input.

## Presets (`preset-service.ts` / `preset-codec.ts`)

`SegmentationToolPreset` persists superpixel settings + smart-select
similarity/edge-stop + boundary visibility — **not** class definitions — to
`.easy-labeling/segmentation-tool-presets.json` inside the working folder.
`preset-codec.ts` does JSON parse/validate/serialize, schema version 1.

## UI wiring

In `src/bootstrap/event-manager-adapter.ts`: `Ctrl+B` and double-click both
route through `triggerSegmentationRelabel`/`triggerSegmentationRelabelAtPoint`
(~line 543-597), calling
`canvasController.raw.relabelSegmentationRegionAtPoint`/
`relabelSelectedSegmentationRegion`. Format import/export settings persist to
`localStorage` under `easy-labeling:segmentation-format-settings` (~122-133).
The brush cursor preview element `#segmentationBrushCursorPreview` only shows
in segmentation + draw + brush-tool state (~265-273).

## On-disk format (`src/domain/annotations/`)

- **Native**: `mask/<image>.png` + `mask/<image>.seg.json`.
  `segmentation-codec.ts`: `encodeSegmentationMaskPng`/
  `decodeSegmentationMaskPng` pack the `Uint16Array` classId mask into PNG
  channels (with a legacy-RGBA fallback decode path). Driven by
  `createSegmentationAnnotationCodec()`.
- `segmentation-model.ts` distinguishes **semantic** (flat mask — what the
  editor actually works on) vs **instance** (per-object
  `SegmentationAnnotation` list) models, with conversions both ways. Instance
  mode exists for import/export interop only; editing is always
  semantic/flat-mask.
- Interop formats beyond the native one: COCO (`segmentation-external-
  codecs.ts`, RLE via `segmentation-raster.ts`, polygon tracing
  `traceMaskOuterContour`), LabelMe JSON, and YOLO-segmentation polygon text
  (`yolo-segmentation.ts`). `segmentation-format.ts` auto-detects format
  (`detectSegmentationFormat`) and gates which formats are valid per
  annotation type (`isFormatSupportedForAnnotationType`).
  `segmentation-adapters.ts` is the glue:
  `importSegmentationAnnotations`/`exportSegmentationAnnotations`.

## Gotcha checklist

- Mask undo/redo snapshots the **entire** mask array per edit — no diffing,
  unlike detection's snapshot-with-equality-check approach.
- Three independent source-mode settings can diverge; always check which one
  a bug report is actually about.
- Switching the current image silently resets segmentation edit state
  (including undo history) if mask dimensions don't match.
- Class file `.yaml` is shared with detection — see detection-workflow skill
  (it's not real YAML, it's `id: name` lines).
