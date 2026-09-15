---
name: easy-labeling-overview
description: >
  Use first when orienting in the easy_labeling repo: what the app is, basic
  usage and keyboard shortcuts, the composition-root architecture
  (createApp wiring the four bootstrap adapters), and where to go deeper.
  Also use for cross-cutting changes that touch both Detection and
  Segmentation, or app-wide concerns like mode/workflow switching, dark
  mode, or panel layout. For workflow-specific or feature-specific work,
  jump straight to detection-workflow, segmentation-workflow,
  automation-template-matching, ai-preprocessing, app-shell-and-file-io, or
  testing-and-release instead.
---

# Easy Labeling — overview

Easy Labeling is a local-first, browser-based image annotation tool with two
workflows sharing one canvas and one `AppState`:

- **Detection** — YOLO bounding boxes -> see the **detection-workflow** skill
- **Segmentation** — brush-based masks -> see the **segmentation-workflow** skill

No backend: it reads/writes an image folder directly via the File System
Access API (see **app-shell-and-file-io**). It also ships as a Windows
desktop app via Electron. Default docs/UI language is Korean
(`README.md`, `README.ko.md`).

## Related skills (pick the deeper one for the actual task)

| Skill | Covers |
|---|---|
| `detection-workflow` | YOLO boxes: draw/edit/delete, class assign, copy-paste, align/distribute, undo/redo, `.txt` format, review checks |
| `segmentation-workflow` | Brush/erase/polygon/superpixel/smart/ai-select tools, mask overlay, `.png`+`.seg.json` format, COCO/LabelMe/YOLO-seg import-export |
| `automation-template-matching` | Template capture, OpenCV matching (accurate/fast), NMS candidates, box layouts, batch labeling across many images |
| `ai-preprocessing` | EdgeSAM click/box-prompt segmentation, super-resolution ROI upscale/enhance, ONNX worker plumbing |
| `app-shell-and-file-io` | Folder open/save flow, label folder creation, class `.yaml` files, sample dataset, Electron shell |
| `testing-and-release` | Build/typecheck/test/e2e commands, test structure, Electron packaging |

## Composition root (app-wide architecture)

Entry point `src/main.ts` boots on `DOMContentLoaded` and calls `createApp()`
(`src/app/createApp.ts`), which builds four collaborators from
`src/bootstrap/*-adapter.ts` and wires them via a `connect(deps)` handshake
(each one needs references to the others, so none can be constructed
fully-formed):

- `canvasController` (`canvas-controller-adapter.ts`) — Fabric.js canvas,
  drawing/selection/history (dispatches to detection-canvas-workflow.ts or
  segmentation/workflow.ts depending on active tab)
- `uiManager` (`ui-manager-adapter.ts`) — DOM panels, modals, toolbars
- `fileSystem` (`file-system-adapter.ts`) — File System Access reads/writes,
  autosave
- `eventManager` (`event-manager-adapter.ts`) — keyboard/mouse event binding,
  depends on all three above

These four `bootstrap/*.ts` files are the actual glue code and are large
(10s of KB each — grep for exported functions rather than reading top to
bottom). `src/app/` only holds the shared `AppState` (`state.ts`) and the
wiring contracts (`contracts.ts`). Read `createApp.ts` + `contracts.ts`
before touching app-wide behavior (mode switching, workflow switching, save
flow) — the adapters implement those interfaces, not the other way around.

Browser support is gated before any of this runs: `runLegacyUnsupportedGate`
(`src/bootstrap/runtime.ts`) blocks mobile user agents, and `createApp`
refuses to build the app if `showDirectoryPicker` is unavailable
(`evaluateBrowserSupport`, `src/platform/browser-support.ts`).

Third-party libs (`fabric`, `bootstrap`, `tiff.js`, `opencv.js`) are **not**
npm-imported into app code — they're copied into `vendor/` by
`scripts/copy-offline-assets.mjs` and loaded by `index.html` as plain
`<script>` tags, read off `window` via
`src/bootstrap/runtime.ts#resolveCdnRuntimeGlobals`. If you add a new
vendored library, wire it through that script + `vendor/` + a `<script>`
tag, not `npm install` + `import`.

## Basic usage (from README.md)

- Open a local image folder; no upload, everything reads/writes on disk via
  the browser.
- Switch workflow via the top tabs (`Detection` / `Segmentation`); the app
  always starts in Detection mode on load, even if the browser tries to
  restore a previously-checked radio button (`src/main.ts` forces it on
  `DOMContentLoaded` and again on the first `requestAnimationFrame`).
- Autosave, or manual save with `Ctrl+S`.
- Common shortcuts: prev/next image `A`/`D`; mode toggle (Draw/Edit)
  `Ctrl+Q`; undo/redo `Ctrl+Z` / `Ctrl+Y` or `Ctrl+Shift+Z`; zoom = mouse
  wheel; pan = `Alt+Drag` or `Ctrl+Drag`; deselect = `Esc`.
- Workflow-specific shortcuts (class change, copy/paste, align/distribute,
  arrow-key nudge, etc.) are documented in `detection-workflow` and
  `segmentation-workflow`.

## Cross-cutting gotchas

- Detection and Segmentation share one canvas shell and one `AppState`;
  switching tabs calls `setWorkflowActive(active)` which hides/shows
  objects rather than destroying/recreating them.
- Class definition files (`.yaml`/`.yml`) are shared by both workflows and
  are **not actually YAML** — simple `id: name` lines (see
  `src/domain/class-files.ts`).
- The site is served from a GitHub Pages subpath, so all asset references
  must stay relative — see `GITHUB_PAGES_GUIDELINES.md`.
