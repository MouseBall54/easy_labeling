---
name: app-shell-and-file-io
description: >
  Use when working on easy_labeling's local folder-based file I/O: opening
  an image folder, resolving/creating the label folder, loading/saving
  detection or segmentation labels, class file (.yaml) management, the
  bundled sample dataset, or the desktop (Tauri) shell (folder picker
  polyfill, unsaved-changes-on-close guard). Covers
  src/features/images/image-session-service.ts,
  src/features/classes/class-file-service.ts,
  src/platform/file-system-access.ts, src/domain/files/image-names.ts,
  src/features/sample/sample-test-directory.ts, src/platform/tauri-desktop.ts
  and src-tauri/src/main.rs. Not for
  the four bootstrap adapters' UI wiring in general (see the
  easy-labeling-overview skill's composition-root section) or annotation
  file formats themselves (see detection-workflow / segmentation-workflow).
---

# App shell & file I/O

## File System Access layer

`src/platform/file-system-access.ts` is a thin wrapper over the browser File
System Access API: `listFileHandles`, `readTextFileByName`/
`writeTextFileByName`, `readBinaryFileByName`/`writeBinaryFileByName`,
`getSubdirectoryHandle`, `isNotFoundError` (checks
`error.name === "NotFoundError"`, used everywhere for "this optional file
might not exist" handling).

`src/domain/files/image-names.ts`: `isSupportedImageFileName`
(jpg/jpeg/png/gif/tif/tiff), `imageFileNameToLabelFileName` (swaps
extension for `.txt`), `compareNamedFilesByImageName` (natural/numeric sort
— this is why the image list orders `img2` before `img10`).

## The real core: `image-session-service.ts`

`src/features/images/image-session-service.ts: createImageSessionService(state, deps)`
is where the folder-based workflow actually lives:

- **`selectImageFolder` -> `resolveLabelFolder`** — looks for a `label/`
  subfolder. If missing, asks `deps.shouldCreateMissingLabelFolder()`; if
  confirmed, creates `label/` **and seeds it with a default `classes.yaml`**
  (classes 0-4, via `class-file-service.ts:33-35`).
- **`listImageFiles`** — sorts images naturally and auto-loads the first
  image.
- **`loadImageAndLabels`** — if autosave is on, saves the *previous* image
  first, then decodes the new one via `deps.decodeImage`. Uses an
  incrementing `currentLoadToken` to abandon stale in-flight loads if the
  user navigates away quickly (race-condition guard) — if you add new async
  work to image loading, check this token pattern rather than assuming the
  load you started is still the current one by the time it resolves.
- **`loadLabels`** — reads `label/<base>.txt` for detection. For
  segmentation, when `segmentationSourceFormat === "auto"`, it auto-detects
  the on-disk format via `inspectSegmentationSource`
  (`domain/annotations/segmentation-format.ts`, which scans
  filenames/dirs/JSON content) and only loads if detection confidence is
  `"certain"` — otherwise the image is treated as unlabeled. Four supported
  segmentation source formats:
  - `png-semantic-mask` (default) — `mask/<base>.png` + `.seg.json`
  - `yolo-segmentation` — `segmentation/yolo/labels/` or `labels/`
  - `coco-segmentation` — `segmentation/coco/` or root `annotations.json`
  - `labelme` — `segmentation/labelme/` or root `<base>.json`
- **`saveLabels(isAuto)`** — detection writes trimmed YOLO text to
  `label/<base>.txt` (an empty file if there are no boxes), and **removes
  out-of-bounds boxes before saving** via
  `deps.removeCurrentLabelsOutsideImageBounds`. Segmentation writes via
  `segmentation-codec.ts` to `mask/` (creating the directory if needed),
  and additionally exports to the configured `segmentationExportFormat` if
  it isn't `png-semantic-mask`/`auto`.

## Class files

`src/features/classes/class-file-service.ts` is a thin wrapper over
`src/domain/class-files.ts`: read/parse for display vs. editor rows,
validate+save, and create-new-class-file with collision-checked naming and
seed content. (Format details — it's not real YAML — live in the
detection-workflow skill, since classes are shared across both workflows.)

## Bundled sample dataset

`src/features/sample/sample-test-directory.ts:
createBundledSampleDirectory()` fetches `assets/sample/manifest.json` plus
the listed files over HTTP and builds an **in-memory** `DirectoryHandleLike`
(`MemoryFileHandle`/`MemoryDirectoryHandle`, implementing the same interface
as real FS handles). This is how "load sample data" works identically to a
real folder pick, without needing File System Access permission — useful to
know if you need to test the app without granting folder access. The desktop
app has a real-folder version (`getEasyLabelingSampleDirectory`, which copies
the bundled `sample/` resource into the app data folder).

## Desktop shell (Tauri)

`src-tauri/src/main.rs` + `src/platform/tauri-desktop.ts` (injected as an
initialization script before page scripts; it must stay a classic script):

- `tauri-desktop.ts` polyfills `window.showDirectoryPicker` and File System
  Access handles (`createFileHandle`/`createDirectoryHandle`) over Rust
  commands (`fs_read_dir`, `fs_read`, `fs_write`, `fs_child`, `fs_mtime`,
  `pick_directory`, `sample_directory`, `open/save/list_library_file`,
  `profile_directory`). `fs_child` rejects any name that is not a plain
  relative path (path traversal) — don't bypass it when adding new file
  operations.
- Dirty-state / close guard: the renderer calls
  `window.easyLabelingDesktop.setHasUnsavedChanges(bool)` -> `set_document_dirty`;
  `on_window_event` blocks `CloseRequested` while dirty and `confirm_close`
  asks "Discard and close" / "Cancel".
- Dialogs use `rfd` directly. tauri-plugin-dialog is deliberately absent: its
  page script replaces `window.confirm` with an async function (always truthy),
  which skipped every confirmation in the app.
- E2E seams (env vars, set by `tests/e2e/fixtures/tauri-app.ts`):
  `EASY_LABELING_TEST_PICK_DIRECTORIES` (folder picker answers, the last one
  repeats), `EASY_LABELING_TEST_PICK_FILE` (library open/save dialogs),
  `EASY_LABELING_TEST_PROFILE_ROOT` (profile libraries instead of Documents).

## Vendored assets

`scripts/copy-offline-assets.mjs` copies `bootstrap` CSS/JS, `bootstrap-icons`
CSS, `fabric` (+ source maps), `tiff.js`, and `opencv.js`
(`@techstark/opencv-js`) from `node_modules` into `vendor/`, where
`index.html` loads them as plain `<script>` tags rather than ES module
imports (see root CLAUDE.md's "CDN-style globals" section). This script runs
as a `pre*` npm hook before build/dev/serve, so a missing `vendor/` file
after a fresh clone almost always means `npm install` hasn't run yet rather
than a real bug.

## Gotcha checklist

- Opening a folder without a `label/` subdirectory triggers folder+file
  creation as a side effect of the *first* load — don't assume
  `selectImageFolder` is read-only.
- Segmentation auto-format-detection only trusts `"certain"` confidence;
  ambiguous folders are treated as unlabeled rather than guessed at.
- `currentLoadToken` exists specifically to handle rapid image navigation —
  respect it in any new async loading code.
- The desktop shell's `fs_child` path-traversal guard is a security boundary,
  not incidental validation — never work around it.
