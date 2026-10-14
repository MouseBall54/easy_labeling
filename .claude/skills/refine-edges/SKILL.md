---
name: refine-edges
description: >
  Use when working on easy_labeling's Refine feature that snaps Detection box edges to image
  boundaries: the edge algorithm (criteria, polarity, per-side rules, scan span, background ring,
  neighbour avoidance, row/column flags), refine settings and presets (refine-settings.json,
  processing snapshots, Run-with preset), the Refine Lab modal (cases, zoom, edge profile and
  change plots), the apply-only Refine pane, the refine worker, canvas preview/review overlay,
  and the R/E/Shift+E/N/Shift+N/F shortcuts. Covers src/domain/refine/*, src/features/refine/*,
  src/bootstrap/refine-*.ts and workers/refine-worker.js. For the preprocessing filters behind the
  Processed image see image-preprocessing.
---

# Refine (edge snapping for Detection boxes)

## Files

| Layer | File | Role |
|---|---|---|
| domain | `src/domain/refine/edge-refine.ts` | Pure algorithm: `refineBoxes`, `refineBox`, `describeRefineSide`, `normalizeRefineParams`, `sideParams`, `toGray` (8-bit luma) |
| domain | `src/domain/refine/settings.ts` | `RefineSettingsDocument`: default + per-class patches, presets, image source, processing snapshot, `activePreset`; `refinePresetLabel` |
| feature | `src/features/refine/refine-service.ts` | Worker client: uploads the image once (`createImageBitmap`), `refine()` and `crop()` |
| worker | `workers/refine-worker.js` | Keeps the gray image (and a processed copy cached per preprocessing key); runs `refineBoxes`, serves crops |
| bootstrap | `refine-controller.ts` | Pane, runs, preview/review overlay, history hooks, shortcuts (`resolveRefineShortcut`) |
| bootstrap | `refine-lab.ts` | Refine Lab modal; loaded with `import()` on first open |
| bootstrap | `refine-editor.ts` | Settings editor mounted inside the Lab (classes, image, presets, edges, edge rule, surroundings, advanced) |
| tests | `tests/unit/domain/refine.test.ts`, `tests/unit/bootstrap/refine-shortcuts.test.ts`, `tests/e2e/refine-edges.spec.ts` | |

## Algorithm (edge-refine.ts)

Max gradient compares `P(i + after) - P(i - before)` over `gradStep` samples (default 2 = central difference; odd steps shift the centre by half a sample).

Per side: build a perpendicular profile window (`sideWindow`) of `rangeIn` inside + `rangeOut` outside around the current edge, average it along the side in `segments` chunks, smooth (Gaussian `sigma`), find the edge per chunk (`findEdge`), then combine chunks (`comb`: outermost quantile or median) after dropping chunks under half the best chunk confidence. Iterates `iterations` times.

- Criteria: `grad` (max gradient, signed by polarity), `flank` (bright band outer 50%), `peak` (band centre), `thr` (50% level between inside/outside medians).
- Coordinates: profile index i samples pixel `base + i`, whose centre is `base + i + 0.5` (a half-pixel bias was fixed here once; keep it).
- Context (`contextRing` > 0): medians of the box core and of a ring beyond the widest outward range give inside/outside levels and the detected polarity. `polarity` can force `brightInside` / `darkInside`.
- `avoidNeighbors`: outward search stops halfway to a facing neighbour box. `rangeIn` may run through the box centre up to `MIN_SIZE` short of the opposite side.
- Bounds: every numeric parameter is clamped to `REFINE_PARAM_LIMITS` (the editor inputs use the same table). Iterations stop early once a pass leaves the box unchanged. Every bound at once costs about 0.5 s per box (Gaussian smoothing of long profiles per segment); single extremes stay fast.
- Refine Lab crops each case with `neededMargin()` (widest outward search + background ring + extensions) so it holds every pixel refinement reads; the readout names the search range in use and what cut it short (box limit, neighbour, image edge). The zoom view is not clipped to the image: the full requested outward range is drawn dashed past where the search stops, over a hatched outside-the-image area.
- Per-side rules: `sides[side]` holds off / inherit / a criterion; `sideRules[side]` overrides `REFINE_SIDE_RULE_KEYS` (polarity, comb, ranges, sigma, segments, inset, `scanSpan`, `extendStart`, `extendEnd`). Always read side values through `sideParams(params, side)`.
- `scanSpan`: `box` (inset span), `boxOutside`, or `outside` (only the extensions past the box ends; falls back to the box if nothing is left).
- Confidence: SNR per chunk, x0.3 when the edge sits on the search limit; `weakSides` below `reviewBelow`, row/column outliers (`peerTolerance`) and an area change beyond `areaGrowLimit` / `areaShrinkLimit` (fractions, 0 = off; `areaChange`, `areaFlagged` on the result) flag the box. Area flags draw a red frame with a `±N% area` tag on the canvas overlay.

## Settings and presets (settings.ts)

`resolveRefineParams(doc, classId)` merges the default with the class patch (classes store only changed keys; presets applied to classes pin every key). `updateRefineSettings` / `resetRefineSettings` take `"default"` or class ids; reset keys look like `crit`, `sides.T`, `sideRules.T.rangeOut`, `sideRules.T`, `sideRules`. `parseRefineSettings` must keep reading older files (legacy `R`/`K`, boolean sides, missing image fields). Saved to `<image folder>/.easy-labeling/refine-settings.json` with a 400 ms debounce.

- `imageSource` original/processed is global. `processing` is `{ name, config }` (opaque preprocessing config) or `null` to follow the Preprocess panel live.
- Presets store params plus `imageSource`/`processing`; applying restores them. Presets saved before image fields existed leave the current image settings alone.
- `activePreset` (pane "Run with"): refine, preview and auto-on-draw use that preset for every class without changing class settings (`runConfig()` in the controller).

## UI

- Toolbar button `#taskRefineBtn` (shortcut `R`) toggles the right inspector to the Refine pane: Settings (Open Refine Lab + summary), Run with (dropdown: class settings or one preset, with the chosen rule summarised below), Apply (Selected, All boxes, Refine class, keep hand-edited toggle), Review (prev/next/Approve). Shortcuts are in tooltips only.
- Global shortcuts (Detection, outside inputs/modals, via `event.code`): `R` pane, `E` selected, `Shift+E` all, `N`/`Shift+N` review, `F` approve. Adding keys means updating `resolveRefineShortcut` and its collision test.
- Refine Lab works on a draft copy; nothing is saved until "Save settings" / "Save & refine these boxes". It opens on the Default (case clicks do not switch the edited class); a class chip edits that class on top of the Default, storing only the changed keys. Cases are crops served by the worker from the same pixels refinement reads; clicking a search band opens that side's edge rule; the profile shows mean brightness and its change over the side's `gradStep` (oriented inside -> outside).
- Canvas overlay (`#refineOverlayCanvas`) is positioned onto `#canvas` each render; preview draws the would-be box and per-side deltas.

## Undo and edits

`updateBoxGeometries` applies a batch as one history entry. The controller subscribes to history (`subscribeHistory`) to mark hand-edited boxes (skipped by class/all runs when the toggle is on) and to auto-refine a single newly drawn box when `autoOnDraw` is on (a second undo step). Read box bounds after `rect.setCoords()`: bounds lag right after a draw.

## Checks

`npx vitest run tests/unit/domain/refine.test.ts tests/unit/bootstrap/refine-shortcuts.test.ts` and `npx playwright test tests/e2e/refine-edges.spec.ts --project=chromium` (6 tests, about 2.5 minutes). The e2e builds a synthetic SEM-like dataset in memory through a mocked directory handle (`openSemDataset`).
