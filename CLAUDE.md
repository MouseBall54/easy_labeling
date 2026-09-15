# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Easy Labeling is a local-first, browser-based image annotation tool (Detection = YOLO bounding boxes, Segmentation = brush-based masks). No backend: it reads/writes an image folder directly via the File System Access API. It also ships as a Windows desktop app via Electron. Default docs/UI language is Korean.

## Commands

```bash
npm install                    # install deps
npm run build                  # tsc compile src/ -> dist/ (required before serving/e2e)
npm run dev                    # build + watch + vite dev server at :4173
npm start                      # build once, then vite serve at :4173
npm run typecheck              # tsc --noEmit against tsconfig.json (includes tests/)
npm test                       # = npm run test:unit (vitest run)
npm run test:unit              # vitest run, tests/unit/**/*.test.ts
npm run test:e2e               # build + playwright test (chromium project only)
npm run electron:dev           # build + launch Electron shell
npm run electron:pack          # build + electron-builder win/x64 unpacked dir
npm run electron:dist:win      # build + electron-builder NSIS installer -> release/
```

Single test file:
```bash
npx vitest run tests/unit/features/segmentation/workflow.test.ts
npx playwright test tests/e2e/segmentation-draw.spec.ts --project=chromium
```

Playwright e2e starts its own vite server on :4173 (`reuseExistingServer: true`), so `npm run build` must be current before running it. E2E specs drive the app through `window.__easyLabelingTestApi` (defined at the bottom of `src/main.ts`) rather than deep DOM inspection.

Before considering any change to `src/` done, run `npm run test:unit` and `npm run typecheck`; `GITHUB_PAGES_GUIDELINES.md` requires both plus `npm run build` to pass before any Pages deploy.

## Architecture

### No app bundler — third-party libs are CDN-style globals, not imports

`src/**/*.ts` is compiled straight to `dist/` via plain `tsc` (`tsconfig.build.json`), one JS file per TS file — there is no webpack/rollup/esbuild bundling step for app code. `fabric`, `tiff.js`, and `bootstrap` are copied into `vendor/` by `scripts/copy-offline-assets.mjs` (from `node_modules`, run as a `pre*` hook before build/dev/serve) and loaded by `index.html` as plain `<script>` tags, attaching `window.fabric` / `window.Tiff` / `window.bootstrap`. App code never `import`s them; it reads them off `window` through `src/bootstrap/runtime.ts#resolveCdnRuntimeGlobals`, which throws if a global is missing. If you add a new vendored library, wire it through `copy-offline-assets.mjs` + `vendor/` + a `<script>` tag, not `npm install` + `import`.

### Composition root: four adapters wired through `connect()`

Entry point `src/main.ts` boots on `DOMContentLoaded` and calls `createApp()` (`src/app/createApp.ts`), which builds four collaborators from `src/bootstrap/*-adapter.ts` and wires them via a `connect(deps)` handshake (each needs references to the others, so none can be constructed fully-formed):

- `canvasController` (`canvas-controller-adapter.ts`) — Fabric.js canvas, drawing/selection/history
- `uiManager` (`ui-manager-adapter.ts`) — DOM panels, modals, toolbars
- `fileSystem` (`file-system-adapter.ts`) — File System Access API reads/writes, autosave
- `eventManager` (`event-manager-adapter.ts`) — keyboard/mouse event binding, depends on all three above

These four `bootstrap/*.ts` files are large (10s of KB each) and are the actual glue code; `src/app/` only holds the shared `AppState` (`state.ts`) and the wiring contracts (`contracts.ts`). Before touching app-wide behavior (mode switching, workflow switching, save flow), read `createApp.ts` and `contracts.ts` first — the adapters implement those interfaces, not the other way around.

Browser support is gated before any of this runs: `runLegacyUnsupportedGate` in `runtime.ts` blocks mobile user agents, and `createApp` refuses to build the app if `showDirectoryPicker` is unavailable (`evaluateBrowserSupport`, `src/platform/browser-support.ts`).

### Layering: domain -> features -> bootstrap/ui -> app

- `src/domain/` — pure data/format logic with no DOM/browser deps: YOLO box math (`domain/yolo`), annotation ID/path handling, and the segmentation mask/codec formats (`domain/annotations/segmentation-*.ts` — mask <-> PNG <-> `.seg.json` <-> YOLO-seg conversions). This is the most heavily unit-tested layer.
- `src/features/` — one folder per capability, each mixing domain calls with browser/canvas state: `canvas` (Fabric wrappers, arrange/align, clipboard, undo history), `segmentation` (tools, overlay rendering, presets), `automation` (template-matching batch labeling), `edgesam` / `super-resolution` (ONNX Runtime Web inference, see `workers/*-worker.js` — these run off the main thread), `classes` (YAML class-file I/O), `images`, `review`.
- `src/bootstrap/` and `src/ui/` — the four adapters plus DOM helpers (`dom-elements.ts`, `modals.ts`, `renderers.ts`, `theme.ts`) that turn feature logic into actual page behavior.
- `src/legacy/characterization.ts` — pinned characterization tests for behavior carried over from a pre-refactor version; don't casually "clean up" code it covers without checking `tests/unit/legacy.characterization.test.ts`.

### Two workflows share one canvas, one state

Detection and Segmentation are tabs, not separate apps — `AppState` (`src/app/state.ts`) and the canvas controller hold both YOLO boxes and segmentation mask/overlay state simultaneously, switched by `workflow: "detection" | "segmentation"`. `src/main.ts` forces Detection mode on load (including on `requestAnimationFrame`, because browsers can restore a previously-checked workflow radio button after scripts run).

### On-disk annotation format (per image folder)

- Detection: `label/<image>.txt` (YOLO format)
- Segmentation: `mask/<image>.png` (raster) + `mask/<image>.seg.json` (region metadata)
- Class definitions: a `.yaml`/`.yml` file, loaded/edited via `features/classes/class-file-service.ts`

### Electron shell

`electron/main.cjs` + `preload.cjs` load the same built `dist/` + `index.html` as the web build (no separate Electron-only app code) and polyfill `showDirectoryPicker` for desktop. `electron/window-close-controller.cjs` handles close/autosave-on-quit and has its own unit test.

### Path discipline for GitHub Pages

The site is served from a subpath (`/easy_labeling/`) on GitHub Pages, so all asset references in `index.html` must stay relative (`dist/main.js`, `vendor/...`, `css/...`) — never root-absolute (`/dist/...`). See `GITHUB_PAGES_GUIDELINES.md` for the full deploy checklist.
