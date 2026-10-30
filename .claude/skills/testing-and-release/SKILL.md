---
name: testing-and-release
description: >
  Use when running or writing tests, checking types, building, or packaging
  easy_labeling: npm scripts, vitest unit tests, playwright e2e tests (and
  the window.__easyLabelingTestApi test hooks they drive through), the
  benchmark script, or desktop packaging (Tauri NSIS installers, update
  feeds). Also use before considering any src/ change done. Not for
  feature-specific test content — see the matching workflow skill for what
  a given area's tests actually assert.
---

# Testing & release

## Commands

```bash
npm install                    # install deps
npm run build                  # tsc compile src/ -> dist/ (required before serving/e2e)
npm run dev                    # build + watch + vite dev server at :4173
npm start                      # build once, then vite serve at :4173
npm run typecheck              # tsc --noEmit against tsconfig.json (includes tests/)
npm test                       # = npm run test:unit
npm run test:unit              # vitest run, tests/unit/**/*.test.ts
npm run test:e2e               # build + playwright test (chromium project only)
npm run tauri:dev              # build + stage + debug desktop exe -> target/debug/ (desktop e2e specs drive it)
npm run tauri:dist:win         # NSIS installer -> target/release/bundle/nsis/
npm run tauri:dist:yoloe:win   # YOLOE-26 variant installer
npm run release:tauri          # signed installers + GitHub release with the update feeds
npm run benchmark:template-matching  # headless perf benchmark for automation matching
```

Single test file:
```bash
npx vitest run tests/unit/features/segmentation/workflow.test.ts
npx playwright test tests/e2e/segmentation-draw.spec.ts --project=chromium
```

**Before considering any `src/` change done**, run `npm run test:unit` and
`npm run typecheck`. `GITHUB_PAGES_GUIDELINES.md` requires both plus
`npm run build` before any Pages deploy.

## Unit tests (`tests/unit/`, vitest)

Mirrors `src/` structure: `app/`, `bootstrap/`, `domain/`,
`features/<name>/`, `platform/`, `ui/`. Config is `vitest.config.ts`
(include: `tests/unit/**/*.test.ts` only — `tests/e2e/` and
`tests/performance/` are separate concerns). Notable non-obvious ones:

- `tests/unit/legacy.characterization.test.ts` — pins behavior from
  `src/legacy/characterization.ts`, a pre-refactor carryover; don't remove
  coverage here without checking what it's actually protecting.
- `tests/unit/main.import-smoke.test.ts` — just import-smoke-tests
  `src/main.ts` (catches wiring/import breakage cheaply without a browser).
- `tests/unit/app/create-app.import.test.ts` — tests the `createApp`
  composition root wiring itself.
- `tests/unit/performance/detection-bulk-performance.test.ts` — perf
  regression guard for bulk box operations (relevant if you touch
  `history.ts`/`clipboard.ts` batching).

## E2E tests (`tests/e2e/`, Playwright)

`playwright.config.ts`: single chromium project, `workers: 1`, spins up its
own vite dev server on `:4173` (`reuseExistingServer: true`). Because it
serves from `dist/`, **`npm run build` must be current** before running
e2e — `npm run test:e2e` does this automatically, but `npx playwright test`
directly does not.

Specs drive the app through `window.__easyLabelingTestApi`, defined at the
bottom of `src/main.ts` — a purpose-built test surface (rect
counts/geometries, selection IDs, segmentation summary, EdgeSAM/SR status,
canvas layer/object counts, undo/redo capability, etc.) rather than deep DOM
querying. When adding e2e coverage for new state, prefer extending this API
over scraping the DOM. Spec files map roughly 1:1 to feature areas:
`detection-bulk-operation.spec.ts`, `segmentation-draw.spec.ts`,
`segmentation-preprocessing-panel.spec.ts`, `automation-workflow.spec.ts`,
`super-resolution-runtime.spec.ts`, `class-file-profile.spec.ts`,
`layout-management.spec.ts`, `review-queue.spec.ts`,
`mobile-unsupported.spec.ts`, `unsupported-env.spec.ts`, etc.

Desktop specs (`tauri-desktop`, `tauri-image-switch`, `desktop-performance`,
`class-remap`, `label-sources`, `label-fast-load`, `label-load-performance`,
`outside-boxes`, `layout-outside-boxes`, `inference-desktop`) launch
`target/debug/Easy Labeling.exe` through `tests/e2e/fixtures/tauri-app.ts`
(`openDesktop`/`launchDesktop`: WebView2 CDP port, temporary profile, e2e
seams for the folder picker, library file dialogs and profile root) and skip
when it is missing. The exe serves the `dist/` it was built with, so run
`npm run tauri:dev` after frontend changes, not just `npm run build`.

Before trusting e2e results, read the "E2E pitfalls" in `AGENTS.md`:
stale Vite servers on :4173 after a rebuild break `bootstrap-smoke`, a
handful of specs fail on main already (listed there), and the full suite
must run sequentially with nothing else rebuilding `dist/`. Use the
`verify` skill for per-change checks and `e2e-full` for the whole suite.
Screenshots go to `test-results/`; `ux-stage2` writes tracked
`docs/ux-improvements/` images only with `UPDATE_DOC_SCREENSHOTS=1`.

## Versioning

`package.json` is bumped with `npm version <x.y.z> --no-git-tag-version`
for every shipped change. `src-tauri/tauri.yoloe.conf.json` `version`
must sit one minor above with the same patch (2.7.0 -> 2.8.0);
`tests/unit/release/version-pairing.test.ts` fails otherwise. The standard
installer reads package.json's version (`src-tauri/tauri.conf.json`).

## Template-matching benchmark

`scripts/benchmark-template-matching.mjs` drives the app headlessly via
Playwright, mocking File System Access, to time real matching runs
(accurate vs. fast/pyramid mode). Use it when tuning matching performance
parameters in `src/features/automation/template-matching-service.ts` or the
worker — see automation-template-matching skill.

## Build

- `npm run build` = `tsc -p tsconfig.build.json` — plain `tsc` compile,
  **no bundler**, one output JS file per input TS file in `dist/`.
  `tsconfig.build.json` extends `tsconfig.json`, sets `outDir: dist`,
  `rootDir: src`, excludes `tests/`.
- `prebuild`/`predev`/`prestart`/`preserve` npm hooks all run
  `scripts/copy-offline-assets.mjs` first (populates `vendor/` from
  `node_modules`) — if `vendor/` looks stale or missing after a dependency
  bump, rerun `npm run copy:offline-assets` directly rather than debugging
  the app.
- `npm run typecheck` uses the base `tsconfig.json` (includes `tests/**` and
  `playwright.config.ts`), separate from the build config, so a test-only
  type error fails `typecheck` but not `build`.

## Desktop installers (Tauri)

`src-tauri/tauri.conf.json`: NSIS target, per-user install, the WebView2
offline installer bundled (`webviewInstallMode: offlineInstaller`, so it
installs without internet), and the updater feed. `beforeBuildCommand` runs
`npm run build` and `scripts/stage-tauri-frontend.mjs`, which copies
`index.html`, `privacy*.html`, `assets/`, `css/`, `dist/`, `vendor/`,
`workers/`, `resources/` into `src-tauri/frontend/` (all 6 super-resolution
models ship; see ai-preprocessing skill). The sample dataset and the YOLOE
models ship as separate bundle resources (`sample/`, `yoloe26/`).
`src-tauri/tauri.yoloe.conf.json` overrides name, identifier, version, feed
and adds the models. `scripts/release-tauri.mjs` builds both, signs the
updater artifacts (`TAURI_SIGNING_PRIVATE_KEY`) and publishes the GitHub
release. YOLOE installer checks: `scripts/verify-yoloe-onnx*.mjs`,
`verify-yoloe-presets.mjs`, `probe-yoloe-onnx.mjs` (default exe
`target/release/Easy Labeling YOLOE-26.exe`; they import the TS launcher, so
Node >= 22.18).

## Gotcha checklist

- Playwright e2e against stale `dist/` is a common false-negative source —
  rebuild first.
- Don't scrape the DOM in new e2e specs when `__easyLabelingTestApi` can be
  extended instead; it's the established pattern.
- `typecheck` and `build` use different tsconfigs — a change can pass one
  and fail the other.
