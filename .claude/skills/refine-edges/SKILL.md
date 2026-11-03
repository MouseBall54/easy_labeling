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
| domain | `src/domain/refine/settings.ts` | `RefineSettingsDocument`: default + per-class patches, presets, image source, processing snapshot, `activePreset`, `reclass` rules; `refinePresetLabel` |
| domain | `src/domain/refine/reclass.ts` | Reclass rules and judgment: `ReclassRule`, `normalizeReclassRules`, `centreCrop`, `measureReclass`, `ruleApplies`, `judgeReclass`, `evaluateReclass`, `describeReclassRule` |
| feature | `src/features/refine/refine-service.ts` | Worker client: uploads the image once (`createImageBitmap`), `refine()` and `crop()` |
| worker | `workers/refine-worker.js` | Keeps the gray image (and a processed copy cached per preprocessing key); runs `refineBoxes`, serves crops |
| bootstrap | `refine-controller.ts` | Pane, runs, preview/review overlay, history hooks, shortcuts (`resolveRefineShortcut`) |
| bootstrap | `refine-lab.ts` | Refine Lab modal; loaded with `import()` on first open |
| bootstrap | `refine-marks.ts` | Canvas marks: `layoutMarks` (pins, weak-side carets, tags) and `drawMarks`; size and colour constants |
| bootstrap | `reclass-editor.ts` | The single reclass rule inside the Lab editor (writes `draft.reclass`) |
| bootstrap | `refine-editor.ts` | Settings editor mounted inside the Lab (classes, image, presets, edges, edge rule, surroundings, advanced) |
| tests | `tests/unit/domain/refine.test.ts`, `tests/unit/domain/reclass.test.ts`, `tests/unit/bootstrap/refine-shortcuts.test.ts`, `tests/unit/bootstrap/refine-marks.test.ts`, `tests/e2e/refine-edges.spec.ts` | |

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
- `partMode` (needs extensions): `together` searches every scanned run as one set of segments (one averaged profile); `strongest` searches each run (before, box, after) on its own and keeps the run with the highest strength, the unclamped contrast-to-noise ratio (confidence saturates at 1, so it cannot rank parts). Diagnostics then carry `parts` and `chosenPart`; the Lab draws one curve per part with a legend and colours each part's band.
- `nearWeight` (default on): candidates of max gradient and the band criteria are weighted by a Gaussian (35% of the window) around the current edge; off, the strongest candidate anywhere in range wins. `thr` always takes the nearest crossing. `edgeWeight`/`gradientAt` are shared by `findEdge` and the diagnostics.
- Axis pairs (`pairTB`/`pairLR`: off, grow, shrink; `pairTBPick`/`pairLRPick`: strongest, nearest): opposite sides are picked together. `sideCandidates` pools every segment's `findEdgeCandidates` (local maxima of findEdge's score, the first one equal to findEdge), clusters them within `max(2, gradStep)` samples and keeps up to 5 per side. `pickAxisPair` groups pairs by the net height/width change (0 counts for either), uses the preferred kind or falls back to the other, then the clearest (weaker side's strength) or least-moving pair; pairs under MIN_SIZE are dropped and a side without candidates stays. Only the first pass uses the preferred kind; later passes keep the nearest pair. A pair with one side `off` is ignored. Diagnostics carry `pair` (candidates, chosen, pool, fallback); the Lab ticks the candidates and explains the pick.
- Diagnostics explain the pick: `segments` (each segment's span, edge, confidence, kept), `firstPass` (combined edge before iterations), `weight`, and `score` (the maximised weighted gradient, centred at i + `scoreShift`). The Lab draws them: gold ticks/lines for kept segment edges, grey for dropped, a triangle for the first pass, the filled score with its peak, the dotted weight, and a readout sentence (criterion, segments found/kept, combine rule, first pass and final shift).
- Confidence: SNR per chunk, x0.3 when the edge sits on the search limit; `weakSides` below `reviewBelow`, row/column outliers (`peerTolerance`) and an area change beyond `areaGrowLimit` / `areaShrinkLimit` (fractions, 0 = off; `areaChange`, `areaFlagged` on the result) flag the box. Area flags draw a red frame with a `±N% area` tag on the canvas overlay.

## Settings and presets (settings.ts)

`resolveRefineParams(doc, classId)` merges the default with the class patch (classes store only changed keys; presets applied to classes pin every key). `updateRefineSettings` / `resetRefineSettings` take `"default"` or class ids; reset keys look like `crit`, `sides.T`, `sideRules.T.rangeOut`, `sideRules.T`, `sideRules`. `parseRefineSettings` must keep reading older files (legacy `R`/`K`, boolean sides, missing image fields). Saved to `<image folder>/.easy-labeling/refine-settings.json` with a 400 ms debounce.

- `mode` (`"edge"` | `"reclass"`, older files read as edge) is shared by the pane and the Lab and picks which half of the document the UI shows. Each mode has its own image and presets.
- `imageSource` original/processed is the edge image. `processing` is `{ name, config }` (opaque preprocessing config) or `null` to follow the Preprocess panel live. `reclassImageSource` / `reclassProcessing` are the reclass image (older files copy the edge image).
- Edge presets (`presets`) store params plus `imageSource`/`processing`; applying restores them. Presets saved before image fields existed leave the current image settings alone. A `reclass` array older versions saved in an edge preset is dropped on read.
- Reclass presets (`reclassPresets`, `ReclassPreset`: rules + image) use `saveReclassPreset` / `applyReclassPreset` / `importReclassPresets` (file kind `easy-labeling-reclass-presets`; the edge importer rejects it). Desktop profile folder: `Reclass Presets` (library kind `reclass`).
- `activePreset` (pane "Run with"): refine, preview and auto-on-draw use that preset for every class without changing class settings (`runConfig()` in the controller). `activeReclassPreset` (pane "Reclass with") does the same for Find candidates (`reclassConfig()`).

## UI

- Toolbar button `#taskRefineBtn` (shortcut `R`) toggles the right inspector to the Refine pane: Mode (`#refineModeToggle`), Settings (Open Refine Lab + summary), then by mode (`data-refine-mode` sections) either Run with (class settings or one edge preset) + Apply (Selected, All boxes, Refine class, keep hand-edited toggle), or Reclass with (`#refineReclassPresetSelect`: Lab rules or one reclass preset) + Find candidates + Reclass selected / all; Review (prev/next/Approve, "Show review marks" switch) is shared. Shortcuts are in tooltips only and `E`/`Shift+E` refine in either mode.
- Global shortcuts (Detection, outside inputs/modals, via `event.code`): `R` pane, `E` selected, `Shift+E` all, `N`/`Shift+N` review, `F` approve. Adding keys means updating `resolveRefineShortcut` and its collision test.
- Refine Lab editor order: Mode, Presets (of that mode), Classes, Image (of that mode), then Edges / Edge rule / Surroundings / Advanced or Rule (`data-mode-only` sections). In Reclass mode the class chips edit the rule's `fromClasses` and the "classes" case source follows them (`editor.caseClasses()`); the view hides the side tabs and profile plot, cases are cropped from the reclass image too (`reclassImg`), refinement runs only for shrink rules, and the footer button becomes "Save & find candidates". `presetEdits` tracks the loaded / Run-with preset per mode.
- Edge mode zoom view also draws what Surroundings read (`surroundings()` / `drawSurroundings()` in `refine-lab.ts`, geometry mirrored from `measureContext`): the background ring (amber band from the widest outward search + 1 to + `contextRing`), the box core (dotted inner 50%) with their medians, and neighbour boxes (grey dashed, "ignored" when `avoidNeighbors` is off). The readout explains each Surroundings setting (`surroundingsText`); keep both in step with `measureContext` / `neighbourLimit`.
- Refine Lab works on a draft copy; nothing is saved until "Save settings" / "Save & refine these boxes". It opens on the Default (case clicks do not switch the edited class); a class chip edits that class on top of the Default, storing only the changed keys. Cases are crops served by the worker from the same pixels refinement reads; clicking a search band opens that side's edge rule; the profile shows mean brightness and its change over the side's `gradStep` (oriented inside -> outside).
- Canvas overlay (`#refineOverlayCanvas`) is positioned onto `#canvas` each render; preview draws the would-be box and per-side deltas. Boxes to look at (Refine flags and reclass candidates) get `refine-marks.ts` marks instead of thicker outlines: a 12 px pin on the top-right corner (yellow `!`, red `!` for an area flag, magenta target class), carets outside weak sides (skipped under 24 px), and tags only when they fit under the box or the box is selected. Every other box and its label fade to opacity 0.3 (display only; snapshots and YOLO ignore it). The overlay writes `data-pins` / `data-tags` for tests.

## Reclass

- One rule (`settings.reclass` holds at most one, or the Reclass-with preset's; `normalizeReclassRules` keeps only the first of older multi-rule files, older files without rules read as `[]`; `reclassRuleOf` gives the editor a default that is off). The evaluator still takes a list. A box matches when the rule applies to its class (`fromClasses`, empty = all), would change it (`toClass`), and passes its checks combined with AND or OR: centre-crop mean, share of bright pixels, refined-area shrink. The centre crop has its own width and height shares (`cropX`, `cropY`; an older single `crop` sets both).
- Shrink compares the refined area (computed, never applied, with `runConfig()`) against the box as loaded from the label file. The controller records loaded bounds per annotation id from `rect.originalYolo` the first time it sees a box, and from history `before` snapshots (taken before any edit, Refine's own included). Classes with Refine off never pass the shrink check.
- Find candidates crops the union of the checked boxes once through `RefineService.crop` from the reclass image (same path on web and desktop) and judges in TS. The first call on an image also uploads it to the refine worker (seconds on a 6 MP image); later ones take tens of ms for 700 boxes.
- The N / Shift+N / F queue and the canvas marks follow the mode: Refine flags in Edge mode, candidates in Reclass mode. F dismisses a candidate (remembered by box signature until the box changes or the image switches); Reclass selected / all use `updateBoxClasses` (one undo step). Hand edits of geometry or class clear a candidate.
- The Lab judges each case from its crop with the same rules (`loadedBox` gives the shrink base), draws the centre crop dashed, bright pixels when that check is on, a pin on matches, and `reclass N of M match` in the status line.

## Undo and edits

`updateBoxGeometries` applies a batch as one history entry. The controller subscribes to history (`subscribeHistory`) to mark hand-edited boxes (skipped by class/all runs when the toggle is on) and to auto-refine a single newly drawn box when `autoOnDraw` is on (a second undo step). Read box bounds after `rect.setCoords()`: bounds lag right after a draw.

## Checks

`npx vitest run tests/unit/domain/refine.test.ts tests/unit/bootstrap/refine-shortcuts.test.ts` and `npx playwright test tests/e2e/refine-edges.spec.ts --project=chromium` (19 tests, about 4 minutes; the 700-box reclass test checks that a warm Find stays under 1 s). The e2e builds a synthetic SEM-like dataset in memory through a mocked directory handle (`openSemDataset`).
