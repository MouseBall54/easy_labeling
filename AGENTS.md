# AGENTS.md

Shared rules for every coding agent in this repo (Codex reads this file; Claude Code imports it from `CLAUDE.md`). Keep tool-specific notes in the tool's own file.

## What this is

Easy Labeling is a local-first, browser-based image annotation tool: **Detection** (YOLO boxes) and **Segmentation** (brush masks) share one canvas and one `AppState`. There is no backend; it reads and writes an image folder through the File System Access API, and ships as a Windows desktop app through Electron. Primary data is 8-bit grayscale SEM/TEM micrographs. User-facing docs (`docs/`, `README*`) are Korean; UI strings and agent-facing files are English.

## Commands

```bash
npm install                 # Node >= 22.12 (package.json engines)
npm run build               # tsc src/ -> dist/ (no bundler); runs copy-offline-assets first
npm run typecheck           # tsc --noEmit on tsconfig.json (includes tests/)
npm run test:unit           # vitest, tests/unit/**/*.test.ts
npm run test:e2e            # build + playwright (chromium)
npm start                   # build + vite on :4173
npm run electron:dist:win   # NSIS installer -> release/
npm run electron:dist:yoloe:win   # YOLOE-26 variant installer (electron-builder.yoloe.cjs)
npm run tauri:dev           # Rust/Tauri desktop exe (debug, no installer) -> target/debug/
npm run tauri:dist:win      # Tauri NSIS installer -> target/release/bundle/nsis/ (needs Rust)
npm run tauri:dist:yoloe:win   # Tauri YOLOE-26 variant (src-tauri/tauri.yoloe.conf.json)
npm run release:tauri         # signed Tauri installers + GitHub release with the update feeds (latest.json, latest-yoloe.json)
```

Single tests: `npx vitest run <file>`, `npx playwright test <spec> --project=chromium`.

## Architecture

- **No app bundler.** `src/**/*.ts` compiles one-to-one into `dist/`. `fabric`, `tiff.js`, `bootstrap` and `opencv.js` are copied into `vendor/` by `scripts/copy-offline-assets.mjs` and loaded as `<script>` globals, read through `src/bootstrap/runtime.ts#resolveCdnRuntimeGlobals`. Add a vendored library through that script + `vendor/` + a `<script>` tag, never `npm install` + `import`.
- **Composition root.** `src/main.ts` -> `createApp()` (`src/app/createApp.ts`) builds four adapters in `src/bootstrap/` (`canvas-controller`, `ui-manager`, `file-system`, `event-manager`) and wires them through `connect(deps)`. Read `createApp.ts` and `contracts.ts` before changing app-wide behaviour. The adapters are large; grep, do not read top to bottom.
- **Layering:** `src/domain/` (pure, DOM-free, most tested) -> `src/features/` (one folder per capability) -> `src/bootstrap/` + `src/ui/` (DOM glue). Domain code must not import from features; pass opaque data across instead (see `RefineProcessing` in `domain/refine/settings.ts`).
- **Workers** live in `workers/*.js` as module workers that import compiled modules from `../dist/...`. Anything a worker imports must stay DOM-free. Module workers cannot `importScripts` (OpenCV.js loads only in the classic template-matching worker).
- **Feature map:** Detection canvas `features/canvas/`; Segmentation `features/segmentation/`; image preprocessing `features/segmentation/preprocessing.ts` + `gray-filters.ts` (used by the canvas Processed view, Refine, EdgeSAM, superpixels and automation); edge refinement `domain/refine/` + `features/refine/` + `bootstrap/refine-*.ts` + `workers/refine-worker.js`; template matching `features/automation/`; EdgeSAM / super-resolution / YOLO(E) inference under `features/` with ONNX workers.
- **On-disk formats** (per image folder): `label/<image>.txt` (YOLO), `mask/<image>.png` + `.seg.json`, class files `.yaml` (simple `id: name` lines). Tool settings live in `<image folder>/.easy-labeling/`: `refine-settings.json`, `preprocessing-presets.json`, `automation-library.json`, `segmentation-tool-presets.json`, `review-state.json`. Changing any of these formats needs a parser that still reads the old shape.
- **Electron** (`electron/*.cjs`) loads the same `dist/` + `index.html`, polyfills `showDirectoryPicker`, and exposes profile libraries (`Template Presets`, `Layouts`, `YOLOE Presets`, `Refine Presets`, `Class Info`) shared across datasets.
- **Tauri** (`src-tauri/`) is the Rust desktop shell with the same contract: `src/platform/tauri-desktop.ts` is the preload counterpart (window globals over Rust commands in `src-tauri/src/main.rs`; it must stay a classic script with no imports), `scripts/stage-tauri-frontend.mjs` stages the served files into `src-tauri/frontend/`, which ships as a bundle resource that WebView2 serves from disk at `https://app.localhost` (Tauri's own asset protocol runs on the window thread and stalled IPC while large vendor files loaded). Refine runs natively there: `crates/el-core` ports `gray-filters.ts`, `preprocessGray` and `edge-refine.ts`, reached through `src/features/refine/native-refine-worker.ts`; keep the ports in step with the TS code (`tests/unit/native/compute-parity.test.ts` compares them once `cargo build --release -p el-core` has built the CLI). Template matching and ONNX stay on OpenCV.js / onnxruntime-web: native versions measured slower through WebView2 IPC.
- **GitHub Pages** serves from `/easy_labeling/`: asset paths in `index.html` stay relative (`dist/main.js`, never `/dist/...`). See `GITHUB_PAGES_GUIDELINES.md`.

## Rust core (incremental migration)

- Cargo workspace at the repo root: `crates/el-core` (pure Rust, no UI/Tauri dependencies; `compute-cli` is its parity-test binary), `crates/el-bench` (golden tests + criterion benches), `src-tauri` (the shell, the only crate that talks to the frontend). Build output is the root `target/`.
- Plan, decisions and numbers: `docs/migration/AUDIT.md`, `DECISIONS.md`, `BENCH.md`. Native code runs only in the Tauri app; the web and Electron builds keep the TS implementations, so a port never deletes the TS code and both must agree.
- The TS implementation is the reference. Golden fixtures come from it (`npm run build && node scripts/migration/gen-golden.mjs`) into `crates/el-bench/fixtures/`; `cargo test -p el-bench` checks Rust against them. Never widen a tolerance or regenerate fixtures to make Rust pass.
- No speed claims without a `docs/migration/BENCH.md` row measured on the same inputs (Rust `--release`, TS from `dist/`).
- Checks: `cargo fmt --all -- --check`, `cargo clippy --workspace --all-targets -- -D warnings`, `cargo test -p el-core -p el-bench`; CI runs them in `.github/workflows/rust.yml`. `rustfmt.toml` keeps the long-line style of the existing ports.
- `unwrap`/`expect` only in tests and `compute-cli`; `unsafe` needs a reason comment and review. Pixels never cross the Tauri boundary as JSON or base64.

## Versioning

Every change that ships to users bumps `package.json` (patch = fix, minor = backward-compatible feature, major = breaking) with `npm version <x.y.z> --no-git-tag-version` so `package-lock.json` follows. In the same change, move `electron-builder.yoloe.cjs` `extraMetadata.version` and `src-tauri/tauri.yoloe.conf.json` `version` to **one minor above package.json with the same patch** (2.7.0 -> 2.8.0, 2.5.1 -> 2.6.1). `tests/unit/release/version-pairing.test.ts` enforces both; the standard installer takes its exe version from package.json through `scripts/after-pack.mjs`. Refactors and test-only changes do not bump.

## Verification

Before calling a `src/`, `workers/`, `index.html` or `css/` change done:

1. `npm run typecheck`, `npm run test:unit`, `npm run build` must pass (CI runs the same on every PR; Pages deploy requires them).
2. Run the e2e specs for the area you touched against a fresh build (`npx playwright test tests/e2e/<spec> --project=chromium`). UI changes also get a screenshot check in light and dark themes.
3. Full e2e (89 tests, about an hour) runs sequentially. While it runs, do not rebuild `dist/` and do not start other browser tests: both skew the timing-sensitive specs.

E2E pitfalls that look like regressions but are not:

- A Vite server on :4173 that outlived a `dist` rebuild serves `/dist/main.js?t=...`, so `bootstrap-smoke` fails on its script-tag check. Stop stale servers before trusting results; Playwright reuses an existing one.
- Known failures on main (b14a33d2, this Windows machine): `detection-clipboard` 601 boxes, `folder-switch-autosave`, `image-list-interactions`, `layout-apply` 4000/5000 (180 s timeout), and `segmentation-draw` (31-33 s against a 30 s timeout). Compare any other failure against a baseline checkout before blaming the change.
- `main.import-smoke` (unit) runs close to its 5 s limit; it times out when the machine is busy. Keep heavy modules lazy (`import()` on first use), as the Refine Lab does.

## Conventions

- Never hand-edit generated output: `dist/`, `vendor/`, `node_modules/`, `release/`, `test-results/`, `output/`.
- Keyboard shortcuts: check every existing binding in `event-manager-adapter.ts` before adding one, match on `event.code` (works with the Korean IME), and add a collision test like `tests/unit/bootstrap/refine-shortcuts.test.ts`. Show shortcuts in `title` tooltips, not inside buttons.
- Prefer extending `window.__easyLabelingTestApi` (bottom of `src/main.ts`) over DOM scraping in e2e specs.
- E2E screenshots go to `test-results/`; specs write to tracked `docs/` only when `UPDATE_DOC_SCREENSHOTS=1`.
- Image filters must keep edge positions (Refine reads processed images); cover new filters with an edge-position test like `tests/unit/features/segmentation/gray-filters.test.ts`. Keep neutral settings producing the old preprocessing cache key.
- The working tree uses CRLF on Windows (`.gitattributes: * text=auto`); scripts that rewrite files must preserve the existing line endings.
- Commit by verified unit of work. Keep build outputs, app profiles, copied datasets and local screenshots out of commits.

## UI/UX improvement stages

- Before continuing UI/UX work, read `docs/UI_UX_PROGRESS_KO.md` and the linked audit, and follow the next unfinished stage. Preserve Detection/Segmentation, light/dark themes, source labels and existing preset formats.
- Record each audit ID's status, verification and remaining work in the progress document; mark an item complete only after its acceptance checks pass. Update README progress links when their location changes.
