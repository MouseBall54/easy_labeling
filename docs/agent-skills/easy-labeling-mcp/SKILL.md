---
name: easy-labeling-mcp
description: >
  Use when driving the Easy Labeling desktop app through its easy-labeling MCP tools: labeling Detection boxes,
  labeling Segmentation masks, scoring labels or masks against reference folders, or running changes over a folder.
---

# Driving Easy Labeling over MCP

The tools act on the app window the person has open; they watch every change. Coordinates are image pixels
`{x0, y0, x1, y1}` (pixel edges, x0 < x1) unless a result says "normalized". Start every session with `app_state`.

Written for Easy Labeling 3.6.0 (the Segmentation tools need 3.5.0 or later). `app_state` reports `appVersion` and
`mcpVersion`; if it carries `versionWarning`, or a tool this skill names is missing, tell the person the app and its
MCP server come from different releases before working around it.

## Habits that hold for every branch

- **Numbers first, captures second.** Read counts, scores and lists (`get_boxes`, `get_regions`, `analyze_*`,
  `compare_*`); capture only the items the numbers flag. Put all flagged boxes in one `capture_view`
  `annotationIds` sheet (up to 36 numbered cells) instead of one call per box: about one or two captures per image.
- **Do not capture to confirm an edit.** The edit result, `get_boxes` and `analyze_boxes` already show what changed.
  A repeated capture whose pixels did not change answers `unchanged: true` without the image; reuse the earlier one.
- **Preview, then apply.** Tools that can be wrong (`find_similar`, `run_refine`, `run_reclass`, `segment_ai`,
  `boxes_to_masks`, `clean_masks`, folder runs) preview by default or take `dryRun`. Apply the accepted result with its
  `resultId` (and `accept: [indexes]`), or rerun with `apply: true` and thresholds.
- **One call, one undo step.** Batch work into one call (many boxes, shapes, prompts); `undo` reverts one call.
- **Pages.** Long lists take `offset`/`limit` and always return totals; `limit: 0` returns counts only.
- **Fresh ids.** `annotationId`s are reassigned whenever an image loads: read them again after `go_to_image` or
  `open_folder`. Mask regions have no ids at all: name a region by its `seed` (a pixel inside it) and read seeds again
  after any mask edit.
- **Measure.** When the person has reference labels or masks (a checked folder inside the image folder),
  `compare_labels` / `compare_masks` is the score: measure, change one thing, measure again, keep what scores higher.
- **Folder writes** (`refine_folder`, `reclass_folder`, `remap_classes`, folder `clean_masks`, `run_inference` on
  every image) ask the person and back up files; dry-run them on `sample: 20` first and report the summary.
- `busy`: the person is typing or a dialog is open; wait and retry. `app_not_running`: ask the person to start the app.

## Detection (boxes)

1. `set_workflow` "detection" if `app_state` says otherwise; `get_classes` for class ids.
2. Add boxes: `find_similar` from one good box (or `run_template_matching`, `apply_layout`); preview, then apply.
   `hitLimit: true` means more matches passed than `maxMatches` (default 2000) kept: raise it and run again.
3. `analyze_boxes`: size outliers, off-row/column, `overlap` (similar-size boxes overlapping: likely duplicates),
   `missing` spots with centre and size per size group.
4. Fill missing spots: `add_boxes` at each spot's centre and size → `run_refine` on the new ids → `delete_boxes` the
   ones Refine leaves with confidence under 0.3 (no edge there).
5. Edges: `run_refine` with `dryRun` → `review_queue` → one `annotationIds` sheet of the flagged boxes → apply → `approve`.
6. Check `list_images {"storage":true,"images":["<filename>"]}` for output paths, disk state and collisions.
   Call `save`, check `success` and `writtenPaths`, then `set_review_status` after review.

If `get_classes` shows no suitable definitions, use `create_class_file` with the agreed filename and class IDs
and names. The app selects the newly created file.

## Segmentation (masks)

1. `set_workflow` "segmentation". `get_regions` lists regions (area, box, centre, seed); `analyze_masks` lists specks,
   holes, necked regions, boundaries off edges and missing spots.
2. Pick the branch:
   - **Regions already exist** (a rough mask): `clean_masks` with `snapPx: 3` moves every boundary onto the image's
     intensity step; add `removeSpecks` / `fillHoles` as `analyze_masks` suggests. Fast (seconds) and the most
     accurate measured option.
   - **Boxes exist, mask is empty**: `boxes_to_masks` with `snapPx: 3` (one AI region per box, clipped to it), then
     `analyze_masks` and `clean_masks` (`fillHoles` for the small holes snapping leaves inside textured objects).
   - **Neither**: `segment_ai` with a **box** around each object (points are ambiguous on dense repeated structures:
     a point on one bar can return the whole column), `snapPx: 3`.
3. Judge AI results by `score`, `pixels` against the expected size, and `edgeFit` (boundary gradient over its
   surroundings: about 1 = no edge, 2+ = a clear edge). `edgeFit` misses regions that are too large, and soft-edged
   TEM particles score 1.1-1.3, so lower `minEdgeFit` there.
4. Fix single regions with `edit_regions` (delete or relabel by seed, or a class's regions by `maxArea`) and
   `paint_mask` (rect, circle, polygon, line shapes; `erase`; `backgroundOnly`).
5. Check storage and call `save`. The reply gives written paths, class pixel counts and connected region counts;
   use the same `list_images` request to verify them on disk. For a folder: `go_to_image` → the steps above → `save` per image, then `analyze_masks` / `clean_masks`
   with `scope: "folder"` over the saved masks.

## Pitfalls

- Mask class 0 is background: paint with class 1 or above; `boxes_to_masks` needs `classId` for class-0 boxes.
- AI Select costs about 0.15 s per prompt (encoding about 6 s on an image's first call): send prompts in one call.
- Images named alike with different extensions (`a.jpg`, `a.png`) share one label file and one mask file: tell the
  person before editing either. The app does not open avif or webp images.

Measured numbers behind these recipes: [MEASUREMENTS.md](MEASUREMENTS.md).
