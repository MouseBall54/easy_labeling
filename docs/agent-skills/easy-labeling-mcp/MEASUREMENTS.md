# Measurements behind the easy-labeling-mcp recipes

Reference sets built from the app's bundled SEM samples (`sample_metal_pattern`, `sample_metal_cross_section`) with
`scripts/bench/make-reference-dataset.mjs` (boxes) and `scripts/bench/make-mask-reference-dataset.mjs` (masks), seed 1,
on one Windows PC with WebGPU. The reference folders were used only for scoring.

## Boxes (1203 boxes; damaged: edges ±3 px, 5% dropped, 3% wrong class, 2% duplicates)

| Run | F1 | Precision | Recall | Missed | Extra |
|---|---|---|---|---|---|
| Damaged | 0.868 | 0.881 | 0.856 | 145 | 111 |
| Refine on the folder only | 0.930 | 0.944 | 0.917 | 71 | 37 |
| + relabel wrong class, delete duplicates | 0.961 | 0.982 | 0.941 | 71 | 21 |
| + add boxes at `analyze_boxes` missing spots, Refine them, delete confidence < 0.3 | **0.976** | 0.982 | 0.970 | 36 | 21 |
| Ceiling: Refine on the reference itself | 0.986 | 0.986 | 0.986 | 17 | 17 |

Refine confidence split the added boxes cleanly: every wrong one scored 0.05 or less, every right one 0.39 or more.

## Masks (1205 regions; damaged: each region grown or shrunk up to 3 px, 5% deleted, 3% wrong class, blobs)

| Run | Mean IoU | Boundary F1 (2 px) | Missed | Tool time |
|---|---|---|---|---|
| Damaged | 0.757 | 0.776 | 119 | |
| Re-draw every region with `segment_ai` box prompts, no snap | 0.757 | 0.711 | 69 | ~3 min |
| Same with `snapPx: 3` | 0.816 | 0.864 | 69 | ~3 min |
| `boxes_to_masks` `snapPx: 3` from an empty mask | 0.818 | 0.877 | 0 | ~3.3 min |
| Relabel + `clean_masks` `removeSpecks` + `snapPx: 3`, no AI | **0.870** | **0.928** | 87 | 9 s |

EdgeSAM decodes at 256 x 256, so its boundaries sit about 1.5 px outside fine structures; snapping fixes most of it.
After `boxes_to_masks`, touching neighbours can merge into one region (about 200 fewer regions than boxes); the neck
check in `analyze_masks` does not catch broad contacts.

## A real mixed folder (no reference)

- TEM particles: `find_similar` from one particle found 43 of about 140 (fixed-size template). `boxes_to_masks` on 44
  boxes took 15 s and fit each particle; snapping left about 1000 tiny holes, which `fillHoles` closed.
- SEM bars: 4 of 5 single-point prompts returned a whole column of bars, with `edgeFit` 1.5-1.7.
