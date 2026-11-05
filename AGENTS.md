# AGENTS.md

Shared rules for every coding agent in this repo (Codex reads this file; Claude Code imports it from `CLAUDE.md`). Keep tool-specific notes in the tool's own file.

## What this is

Easy Labeling is a local-first, browser-based image annotation tool: **Detection** (YOLO boxes) and **Segmentation** (brush masks) share one canvas and one `AppState`. There is no backend; it reads and writes an image folder through the File System Access API, and ships as a Windows desktop app through Tauri (`src-tauri/`, a Rust shell around WebView2). Primary data is 8-bit grayscale SEM/TEM micrographs. User-facing docs (`docs/`, `README*`) are Korean; UI strings and agent-facing files are English.

## Commands

```bash
npm install                 # Node >= 22.12 (package.json engines)
npm run build               # tsc src/ -> dist/ (no bundler); runs copy-offline-assets first
npm run typecheck           # tsc --noEmit on tsconfig.json (includes tests/)
npm run test:unit           # vitest, tests/unit/**/*.test.ts
npm run test:e2e            # build + playwright (chromium)
npm start                   # build + vite on :4173
npm run tauri:dev           # desktop exe (debug, no installer, fresh dist/ inside) -> target/debug/; desktop e2e specs drive it
npm run tauri:dist:win      # NSIS installer (bundles the WebView2 offline installer) -> target/release/bundle/nsis/ (needs Rust)
npm run release:tauri       # signed installer + GitHub release with the update feed (latest.json)
```

Single tests: `npx vitest run <file>`, `npx playwright test <spec> --project=chromium`.

## Architecture

- **No app bundler.** `src/**/*.ts` compiles one-to-one into `dist/`. `fabric`, `tiff.js`, `bootstrap` and `opencv.js` are copied into `vendor/` by `scripts/copy-offline-assets.mjs` and loaded as `<script>` globals, read through `src/bootstrap/runtime.ts#resolveCdnRuntimeGlobals`. Add a vendored library through that script + `vendor/` + a `<script>` tag, never `npm install` + `import`.
- **Composition root.** `src/main.ts` -> `createApp()` (`src/app/createApp.ts`) builds four adapters in `src/bootstrap/` (`canvas-controller`, `ui-manager`, `file-system`, `event-manager`) and wires them through `connect(deps)`. Read `createApp.ts` and `contracts.ts` before changing app-wide behaviour. The adapters are large; grep, do not read top to bottom.
- **Layering:** `src/domain/` (pure, DOM-free, most tested) -> `src/features/` (one folder per capability) -> `src/bootstrap/` + `src/ui/` (DOM glue). Domain code must not import from features; pass opaque data across instead (see `RefineProcessing` in `domain/refine/settings.ts`).
- **Workers** live in `workers/*.js` as module workers that import compiled modules from `../dist/...`. Anything a worker imports must stay DOM-free. Module workers cannot `importScripts` (OpenCV.js loads only in the classic template-matching worker).
- **Feature map:** Detection canvas `features/canvas/`; Segmentation `features/segmentation/`; image preprocessing `features/segmentation/preprocessing.ts` + `gray-filters.ts` (used by the canvas Processed view, Refine, EdgeSAM, superpixels and automation); edge refinement `domain/refine/` + `features/refine/` + `bootstrap/refine-*.ts` + `workers/refine-worker.js`; template matching `features/automation/`; EdgeSAM / YOLO(E) inference under `features/` with ONNX workers.
- **On-disk formats** (per image folder): `label/<image>.txt` (YOLO), `mask/<image>.png` + `.seg.json`, class files `.yaml` (simple `id: name` lines). Tool settings live in `<image folder>/.easy-labeling/`: `refine-settings.json`, `preprocessing-presets.json`, `automation-library.json`, `segmentation-tool-presets.json`, `review-state.json`. Changing any of these formats needs a parser that still reads the old shape.
- **Desktop app (Tauri)** (`src-tauri/`) loads the same `dist/` + `index.html` in WebView2, polyfills `showDirectoryPicker`, guards closing with unsaved changes, and exposes profile libraries (`Documents/Easy Labeling/`: `Template Presets`, `Layouts`, `Refine Presets`, `Reclass Presets`, `Preprocessing Presets`, `Segmentation Presets`, `Class Info`) shared across datasets. Every preset kind saves there, one file per preset, without a dialog (`src/features/presets/profile-presets.ts`); the dataset's `.easy-labeling` preset files are only read there (the web build still saves into them). `src/platform/tauri-desktop.ts` defines those window globals over Rust commands in `src-tauri/src/main.rs` (it must stay a classic script with no imports). File and message dialogs use `rfd` directly, not tauri-plugin-dialog, whose page script would replace the synchronous `window.confirm`/`alert` the app relies on. `scripts/stage-tauri-frontend.mjs` stages the served files into `src-tauri/frontend/`, which ships as a bundle resource that WebView2 serves from disk at `https://app.localhost` (Tauri's own asset protocol runs on the window thread and stalled IPC while large vendor files loaded). Refine runs natively there: `crates/el-core` ports `gray-filters.ts`, `preprocessGray` and `edge-refine.ts`, reached through `src/features/refine/native-refine-worker.ts`; keep the ports in step with the TS code (`tests/unit/native/compute-parity.test.ts` compares them once `cargo build --release -p el-core` has built the CLI). Refine's folder run (Edge) is a Rust batch too (`crates/el-core/src/refine_folder.rs` via `src/features/refine/native-refine-folder.ts`): Rust reads the label files, decodes 8-bit gray TIFFs and 8-bit gray or RGB PNGs Chromium draws unchanged (no colour management, alpha, palette or eXIf), and refines four images at a time on plain threads; JPEGs and other images go through the TS path one by one, and the page still writes the rows (`yoloRow`). Batch label edits (folder runs, outside-box cleanup, class remap) back up and write in one Rust call (`label_files_commit`, `crates/el-core/src/label_commit.rs`), which puts files back itself on a failure or stop. The Processed view is computed there too (`src/features/segmentation/native-preprocessing.ts`, prepared asynchronously before the synchronous view/config calls), as are the folder Review and label counts (`review_folder`, `label_row_counts`) and 8-bit gray TIFF decoding (`src/features/images/native-tiff.ts`; other TIFFs stay on tiff.js). The last natively decoded TIFF stays in Rust, so the Processed view, refine and automation load it by path (`nativeTiffPathOf`) instead of extracting and uploading its pixels. Opaque Processed views come back as gray bytes shown through a gray BMP `<img>` (`src/features/images/gray-image.ts`, decoded off the UI thread; their RGBA is built only when EdgeSAM or superpixels ask); transparent ones stay on a canvas. Automation's Processed input (and a native TIFF's Original input) is prepared through `src/features/automation/native-automation-pixels.ts`. Superpixels (SLICO) run in Rust too (`src/features/segmentation/native-superpixels.ts`, computed before the synchronous `recalculateSegmentationSuperpixels`), EdgeSAM and superpixel Processed inputs are prepared natively, opaque originals are read in a worker (`src/features/images/off-thread-pixels.ts`), and the next image is decoded ahead (two TIFFs stay resident). Megabyte transfers use WebView2 shared buffers (`src-tauri/src/shared_buffer.rs`; raw invoke bodies run at ~17 MB/s) with the raw path as fallback. Template matching and ONNX stay on OpenCV.js / onnxruntime-web: native versions measured slower through WebView2 IPC.
- **GitHub Pages** serves from `/easy_labeling/`: asset paths in `index.html` stay relative (`dist/main.js`, never `/dist/...`). See `GITHUB_PAGES_GUIDELINES.md`.

## Rust core (incremental migration)

- Cargo workspace at the repo root: `crates/el-core` (pure Rust, no UI/Tauri dependencies; `compute-cli` is its parity-test binary), `crates/el-bench` (golden tests + criterion benches), `src-tauri` (the shell, the only crate that talks to the frontend). Build output is the root `target/`.
- Plan, decisions and numbers: `docs/migration/AUDIT.md`, `DECISIONS.md`, `BENCH.md`. Native code runs only in the desktop app; the web build keeps the TS implementations, so a port never deletes the TS code and both must agree.
- The TS implementation is the reference. Golden fixtures come from it (`npm run build && node scripts/migration/gen-golden.mjs`) into `crates/el-bench/fixtures/`; `cargo test -p el-bench` checks Rust against them. Never widen a tolerance or regenerate fixtures to make Rust pass.
- No speed claims without a `docs/migration/BENCH.md` row measured on the same inputs (Rust `--release`, TS from `dist/`).
- Checks: `cargo fmt --all -- --check`, `cargo clippy --workspace --all-targets -- -D warnings`, `cargo test -p el-core -p el-bench`; CI runs them in `.github/workflows/rust.yml`. `rustfmt.toml` keeps the long-line style of the existing ports.
- `unwrap`/`expect` only in tests and `compute-cli`; `unsafe` needs a reason comment and review. Pixels never cross the Tauri boundary as JSON or base64.
- Adding a native feature (the `port-module` skill has the full steps):
  - el-core module for the logic. Reuse `js.rs` wherever the TS code leans on JS semantics (`parseFloat`, trim, number formatting, NaN in `Math.min/max`).
  - A thin command file in `src-tauri/src/`, registered in `main.rs`. Long work goes through `jobs.rs` (progress, cancel); megabytes go through `shared_buffer.rs`.
  - TS goes only through `getNativeBridge("<feature>")` (`src/platform/native-bridge.ts`; add the feature name there) and falls back to the TS path on null or error.
  - Prove it three ways:
    - a golden fixture from the TS code;
    - a `compute-cli` differential test with random inputs when inputs are text;
    - a `tests/e2e/tauri-desktop.spec.ts` test comparing the native and TS results in the same app, switching the feature off with `window.easyLabelingNativeOff = ["<feature>"]`. Setting `window.easyLabelingNativeTrace = []` records the command names the page sends.

## Versioning

Every change that ships to users bumps `package.json` (patch = fix, minor = backward-compatible feature, major = breaking) with `npm version <x.y.z> --no-git-tag-version` so `package-lock.json` follows. The installer reads package.json's version (`src-tauri/tauri.conf.json`); `tests/unit/release/version-pairing.test.ts` checks that and package-lock.json. Refactors and test-only changes do not bump.

## Branches: main and track/yoloe26

- `main` is Easy Labeling without YOLOE-26. Every shared change (canvas, Refine, Rust core, file I/O, UI) is made on `main`, never only on the YOLOE branch.
- `track/yoloe26` is the YOLOE-26 app: `main` plus the YOLOE models, code, popup and `src-tauri/tauri.yoloe.conf.json`. It follows `main` by merging it (`git merge main`), never the other way. Its own AGENTS.md section has the YOLOE release steps.
- The commit that removed YOLOE from `main` (v3.0.0) is recorded on `track/yoloe26` with `git merge -s ours`, so later merges of `main` bring shared changes without deleting YOLOE. Do not revert or cherry-pick that removal there.
- Both apps poll the repo's "latest" release: Easy Labeling reads `latest.json`, the YOLOE-26 app `latest-yoloe.json`. `npm run release:tauri` (main only) copies the current `latest-yoloe.json` into each new release; YOLOE releases are not marked latest and replace only `latest-yoloe.json` on the latest release. Never delete `latest-yoloe.json` from the latest release.

## Verification

Before calling a `src/`, `workers/`, `index.html` or `css/` change done:

1. `npm run typecheck`, `npm run test:unit`, `npm run build` must pass (CI runs the same on every PR; Pages deploy requires them).
2. Run the e2e specs for the area you touched against a fresh build (`npx playwright test tests/e2e/<spec> --project=chromium`). Desktop specs (`tauri-*`, `desktop-performance`, `class-remap`, `label-sources`, `label-fast-load`, `label-load-performance`, `outside-boxes`, `layout-outside-boxes`, `inference-desktop`) drive `target/debug/Easy Labeling.exe` and skip without it: run `npm run tauri:dev` first, which also packs a fresh `dist/` into it. UI changes also get a screenshot check in light and dark themes.
3. Full e2e (89 tests, about an hour) runs sequentially. While it runs, do not rebuild `dist/` and do not start other browser tests: both skew the timing-sensitive specs.

E2E pitfalls that look like regressions but are not:

- A Vite server on :4173 that outlived a `dist` rebuild serves `/dist/main.js?t=...`, so `bootstrap-smoke` fails on its script-tag check. Stop stale servers before trusting results; Playwright reuses an existing one.
- Known failures on main (b14a33d2, this Windows machine; on `rust-migration` since v2.30.2): `segmentation-draw` when the machine is busy (31-33 s against a 30 s timeout). Since 98cb8d3b (v2.35.0): `label-fast-load`, 60-image case, fails at `measure("switch-after-review")` (no label file read before the labels show after the background review); it fails alone too, on main and on v2.37.0. The others on this list had causes: `folder-switch-autosave` was a real bug (saves grew loaded boxes by their 2 px stroke, fixed in v2.30.1); `detection-clipboard` 601 boxes and `layout-apply` 4000/5000 ran thousands of separate `expect` calls (one comparison now) and layout apply rendered synchronously on every panel sync; `image-list-interactions` needed box counts, which the background review now fills in. Before adding a spec here, read what it asserts; compare any other failure against a baseline checkout before blaming the change.
- Startup: the standby no longer waits for the matching engine (OpenCV.js starts in its worker once the workspace is idle; template matching waits or retries on use), and the EdgeSAM worker starts on the first AI Select. Specs that time out at startup on a busy machine were mostly waiting for that engine; if one still does, rerun it when the machine is quiet.
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
