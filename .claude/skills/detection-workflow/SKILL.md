---
name: detection-workflow
description: >
  Use when working on the Detection (YOLO bounding box) workflow in
  easy_labeling: drawing/editing/deleting boxes, class assignment, copy-paste,
  align/distribute tools, arrow-key nudging, undo/redo, the YOLO .txt save
  format, or the box review/quality checks. Covers
  src/features/canvas/detection-canvas-workflow.ts, arrange.ts, clipboard.ts,
  history.ts, annotation-label-renderer.ts, colors.ts, src/domain/yolo,
  src/domain/annotations/detection.ts and paths.ts, and
  src/features/review/quality.ts. Not for Segmentation (see
  segmentation-workflow) or template-matching batch box generation (see
  automation-template-matching).
---

# Detection workflow (YOLO bounding boxes)

## Where the logic actually lives

`src/features/canvas/canvas-controller.ts` is **only a dispatcher**:
`createCanvasControllerForWorkflow(workflow, ...)` picks between
`createDetectionCanvasWorkflow` and `createSegmentationCanvasWorkflow`
(`src/features/segmentation/workflow.ts`), both sharing one `CanvasShell`.

**All real detection behavior lives in
`src/features/canvas/detection-canvas-workflow.ts`** (~1700 lines): drawing,
editing, undo/redo wiring, copy/paste, align/layout, YOLO import/export. Edit
that file, not `canvas-controller.ts`.

## Data model

A detection box is a Fabric.js `Rect` with custom fields:
- `annotationId` — UUID (see `features/canvas/fabric-types.ts`)
- `labelClass` — string class ID (validated by `src/domain/class-id.ts`,
  must be `0` or a positive integer, as a string)
- `originalYolo` — preserves the exact YOLO float string from the source
  file; **set to `null` on essentially any mutation** (move, resize, align,
  distribute, class change). It only survives if the box is untouched since
  import, so re-saving an unedited box doesn't perturb its precision.
- `layoutInstanceId` / `layoutBoxId` — present only when the box was created
  via an automation layout apply (shared with the `automation` feature, see
  automation-template-matching skill); lets a whole layout group be
  translated together via `translateLayoutInstance`.

Detection and Segmentation share one `AppState` and one canvas shell.
Switching tabs calls `setWorkflowActive(active)`, which hides/shows rects and
their labels — it does not destroy/recreate them.

## Capability -> implementation map

| Capability | Function | Binding |
|---|---|---|
| Draw box | `startDrawing/continueDrawing/finishDrawing` (prompts class via `promptForLabelClass`; requires a label folder selected) | drag on canvas |
| Change class | `editLabel`/`editMultipleLabels`/`setSelectedLabelClass` | `Ctrl+B`, double-click (event-manager-adapter.ts:2558-2599), numeric key (:878) |
| Copy/paste | `controller.copy/paste` (`clipboard.ts`) | `Ctrl+C`/`Ctrl+V` (:2540/2548) |
| Align | `alignSelectionLeft/Right/Top/Bottom` (`arrange.ts: planEdgeAlignment`) | `Alt+Shift+L/R/T/D` (:2482-2507) |
| Distribute | `distributeSelectionHorizontally/Vertically` (`arrange.ts: planEqualEdgeGapDistribution`, needs ≥3 boxes) | `Alt+Shift+H/V` |
| Nudge | `translateSelectedBoxes` | Arrow keys (1px), `Shift+Arrow` (10px), edit mode only (:2608+) |
| Select all / by class | `selectAllLabels` (`Ctrl+A`, :2455), `selectLabelsByClass` | |
| Delete | `deleteSelection` | `Delete`/`Backspace` (:251/258/913) |
| Undo/redo | `controller.undo()/redo()` | `Ctrl+Z`, `Ctrl+Y`/`Ctrl+Shift+Z` |
| Bulk apply (not manual UI) | `applyDetectionBoxes`, `applyBoxLayoutInBatches` (chunked, `AbortSignal`, progress callback) | used by automation feature |

## Undo/redo model

Not a command pattern — `history.ts` does **full rect-snapshot diffing**:
`createRectSnapshotsByAnnotationId` snapshots every rect's
left/top/bounds/scale/labelClass/layoutInstanceId/originalYolo, and a new
history entry is only pushed if `areRectSnapshotsEqual` (JSON.stringify
compare) says something changed. `withReplayMuted` prevents undo/redo replay
from re-pushing history. This is O(n) per gesture, fine interactively but
too slow for large batch inserts — that's why `applyBoxLayoutInBatches`
exists as a separate chunked/abortable path for automation-generated boxes.

## Copy/paste perf notes

`clipboard.ts` clones the active Fabric object(s) preserving `labelClass` and
`originalYolo`. Paste re-centers on the last mouse position, batches adds in
chunks of `max(25, chunkSize ?? 100)` yielding via `requestAnimationFrame`,
and skips wrapping pasted objects in an `ActiveSelection` above 250 objects
for performance.

## Label rendering

`annotation-label-renderer.ts: layoutAnnotationLabels()` is a pure,
independently-testable function doing spatial-grid collision-avoidance label
placement (full/compact/hidden text depending on zoom/density/viewport).
Class colors come from `colors.ts: getColorForClass` — `classNumber % 30`
palette; non-numeric/negative class IDs render black.

## YOLO save format

- `src/domain/yolo/yolo.ts`: `parseYoloRows(text, imgW, imgH)` and
  `serializeRectsToYolo(rects, imgW, imgH)` — classic normalized
  `class cx cy w h`, written with 15 decimal places.
- `src/domain/annotations/detection.ts: createDetectionAnnotationCodec()`
  wraps this as the generic `AnnotationCodec` (`decode`/`encode`/
  `resolvePaths`) interface shared with segmentation's codec.
- `src/domain/annotations/paths.ts: resolveAnnotationAssetPaths("detection",
  imageBaseName)` → `label/<name>.txt` (no sidecar files, unlike
  segmentation's mask+json pair).

## Class files

Despite the `.yaml`/`.yml` extension convention, the format is **not real
YAML** — it's simple line-based `id: name` with `#` comments, parsed and
validated (including reserved-Windows-filename checks) by
`src/domain/class-files.ts`.

## Review / quality checks

`src/features/review/quality.ts: inspectDetectionLabels()` flags:
`empty-label`, `out-of-bounds`, `small-box` (< `settings.minimumBoxSizePx`),
`duplicate-box` (IoU ≥ `duplicateIouThreshold`, same class only),
`missing-class` (a required class absent from the image). Defaults live in
`src/features/review/review-state.ts: DEFAULT_REVIEW_SETTINGS`
(minBoxSizePx=4, duplicateIou=0.9); per-image review status
(`needs-review`/`reviewed`) is persisted in a schema-versioned JSON doc.

## Gotcha checklist

- Don't confuse `canvas-controller.ts` (dispatcher) with
  `detection-canvas-workflow.ts` (the actual implementation).
- Editing a box clears `originalYolo` — expected, not a bug.
- `layoutInstanceId`/`layoutBoxId` are cross-feature state shared with
  automation; don't remove them thinking they're detection-only cruft.
