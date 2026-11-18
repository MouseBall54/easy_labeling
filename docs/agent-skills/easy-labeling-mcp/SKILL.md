---
name: easy-labeling-mcp
description: >
  Use when driving the Easy Labeling desktop app through its easy-labeling MCP tools: labeling Detection boxes,
  labeling Segmentation masks, scoring labels or masks against reference folders, or running changes over a folder.
---

# Driving Easy Labeling over MCP

The tools act on the app window the person has open; they watch every change. Coordinates are image pixels
`{x0, y0, x1, y1}` (pixel edges, x0 < x1) unless a result says "normalized". Start every session with `app_state`.

Written for Easy Labeling 3.15.0 (the Segmentation tools need 3.5.0 or later). `app_state` reports `appVersion` and
`mcpVersion`; if it carries `versionWarning`, or a tool this skill names is missing, tell the person the app and its
MCP server come from different releases before working around it.

## Habits that hold for every branch

- **Capture when a decision needs pixels.** Read counts, scores and lists for review. Put flagged boxes in one
  `capture_view` `annotationIds` sheet (up to 36 cells). For new visual labels without known positions, capture the
  viewport or a region, including when the image has no boxes.
- **Do not capture to confirm an edit.** The edit result, `get_boxes` and `analyze_boxes` already show what changed.
  `unchanged: true` means the app omitted a duplicate PNG. Reuse an earlier PNG with the same `captureId` and the current mapping.
  If that PNG is unavailable and you still need the pixels, repeat the request once with `force: true`. If the client
  cannot show the PNG or the object is unclear, proceed with confirmed positions and leave uncertain positions pending.
- **Convert PNG coordinates before editing.** Use the returned PNG dimensions and its pixel edges. For a viewport or
  crop, use `imageFromCapture`: `imageX = pngX * scaleX + offsetX`, and likewise for Y. For a sheet tile, subtract
  `cell.x`/`cell.y` and use that tile's `imageFromCell.scale` and offsets. Box tools accept original image edges from
  0 through image width/height. `read_labels` gives normalized edges: multiply X by image width and Y by image height.
- **Preview, then apply.** Tools that can be wrong (`find_similar`, `run_refine`, `run_reclass`, `segment_ai`,
  `boxes_to_masks`, `clean_masks`, folder runs) preview by default or take `dryRun`. Apply the accepted result with its
  `resultId` (and `accept: [indexes]`), or rerun with `apply: true` and thresholds.
- **One call, one undo step.** Batch work into one call (many boxes, shapes, prompts); `undo` reverts one call.
- **Conditions over id lists.** `get_boxes`, `select_boxes`, `delete_boxes` and `update_boxes` take `where` (class
  ids, width/height/area ranges, `inside`/`outside`/`overlaps` a region). `update_boxes` with `where` + `change`
  shifts, resizes or relabels every matching box: `{"where":{"classIds":["2"],"maxArea":30}}` beats listing ids.
- **Pages.** Long lists take `offset`/`limit` and always return totals; `limit: 0` returns counts only.
- **Fresh ids.** `annotationId`s are reassigned whenever an image loads: read them again after `go_to_image` or
  `open_folder` (an old id answers `stale_id`). Mask regions have no ids at all: name a region by its `seed` (a pixel inside it) and read seeds again
  after any mask edit.
- **Measure.** When the person has reference labels or masks (a checked folder inside the image folder),
  `compare_labels` / `compare_masks` is the score: measure, change one thing, measure again, keep what scores higher.
- **Folder writes** (`refine_folder`, `reclass_folder`, `remap_classes`, `clean_out_of_bounds`, `run_template_matching_folder`,
  `copy_boxes`, folder `clean_masks`, `run_inference` on
  every image) ask the person and back up files; dry-run them on `sample: 20` first and report the summary.
- `busy`: the person is typing or a dialog is open; wait and retry. `app_not_running`: ask the person to start the app.

## Detection (boxes)

1. `set_workflow` "detection" if `app_state` says otherwise; `get_classes` for class ids.
2. Add boxes: `find_similar` from one good box (or `run_template_matching`, `apply_layout`); preview, then apply.
   `hitLimit: true` means more matches passed than `maxMatches` (default 2000) kept: raise it and run again.
   Pick `minScore` from numbers: preview once with `minScore: 0.5` and read `scores.largestGap` (the drop between true
   matches and background, with `suggestedMinScore`); pass `expected` for `coverage`. `blur: 0` or a smaller kernel
   separates fine, close objects; `searchRegion` limits the search; `templateImage` takes the template from another image.
3. `analyze_boxes`: size outliers, off-row/column, `overlap` (similar-size boxes overlapping: likely duplicates),
   `missing` spots with centre and size per size group. Off-row boxes of a regular grid: `arrange_boxes`
   `alignRowCenters` / `alignColumnCenters` (or `alignRowSetColumnCenters` for staggered rows) on that class, then
   `analyze_boxes` again.
4. Fill missing spots: `add_boxes` at each spot's centre and size → `run_refine` on the new ids → `delete_boxes` the
   ones Refine leaves with confidence under 0.3 (no edge there).
5. Edges: `run_refine` with `dryRun` → `capture_view {"refineResultId": <its resultId>}` (each moved box with its
   refined edge dashed in cyan, flagged first) → apply → `review_queue` → `approve`. `layers: {"boxes": false}` shows
   the bare image when an outline hides the edge.
   For a flagged box or a low-confidence side, `refine_profile` shows why: two candidates of similar strength mean a
   neighbouring edge competes (fix the box by hand or tighten it first), a lone weak one means no clear edge there.
6. Check `list_images {"storage":true,"images":["<filename>"]}` for output paths, disk state and collisions.
   Call `save`, check `success` and `writtenPaths`, then `set_review_status` after review.

### Building a reusable template preset

1. On a representative image, place and check the boxes (`find_similar` / `add_boxes` → `run_refine` → `analyze_boxes`),
   then `save_layout` them.
2. `save_template_preset` with `outputMode: "layout"`, the template as a box or region of a distinctive part (an edge,
   a mark, a place where different shapes meet), and the layout. `anchorOffset` is computed when both come from the
   same image. For one box per match use `outputMode: "boxes"` with `boxes.classId`.
3. `run_template_matching` (preview) on the same image: the layout must land where it was saved, `layoutBoxesOutside`
   0. `distinctiveness.margin` under about 0.1 means the template also fits elsewhere (repeated patterns): save a more
   distinctive region with `overwrite: true`.
4. Dry-run it over a sample (`run_template_matching_folder {"preset": ..., "sample": 20}`): read matched / noMatch,
   the score spread and the problem images first, look at the weakest ones, then write it with the resultId.
   Images holding one layout at the same place need no matching: `copy_boxes` from the checked image.

With a trained YOLO model loaded (`load_model`), `detect_boxes` offers its detections on the current image as
candidates (nothing written): map model classes with `classMap`, read `scores.largestGap`, apply with `resultId` /
`accept` or `minConfidence`, then `run_refine` the added ids as with any new box.

If `get_classes` shows no suitable definitions, use `create_class_file` with the agreed filename and class IDs
and names. The app selects the newly created file.

Layouts, template presets and class files you save land in the `Agent` subfolder of the person's preset library
(`fileName` starts with `Agent/`). You may overwrite only those (`agentOwned: true` in `list_templates`); a name the
person uses elsewhere is refused, so pick another name rather than asking to overwrite theirs.

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
