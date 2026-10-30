---
name: verify
description: >
  Use before calling a code change in easy_labeling done, or when the user types /verify: picks
  and runs the checks that match the changed files (typecheck, unit tests, build, the e2e specs for
  the touched area, light/dark screenshots for UI work) and checks the version bump. For the whole
  e2e suite use e2e-full instead.
---

# /verify

Run from the repo root. Stop at the first failing step, fix, and rerun that step.

## 1. What changed

```bash
git status --porcelain --untracked-files=all
git diff --stat HEAD
```

Docs-only, skill or harness changes (`*.md`, `.claude/`, `.github/`): steps 2 and 3 only if a test or tsconfig-covered file changed; skip the rest.

## 2. Static checks and unit tests

```bash
npm run typecheck
npm run test:unit
```

`main.import-smoke` timing out at 5 s while other work runs is load, not a bug: rerun it alone (`npx vitest run tests/unit/main.import-smoke.test.ts`). If it fails alone, something heavy got imported eagerly; make it `import()` on first use.

## 3. Build

```bash
npm run build
```

Required before any e2e run: Playwright serves `dist/`.

## 3a. Rust (when `Cargo.*`, `rustfmt.toml`, `crates/`, `src-tauri/`, or a ported TS algorithm changed)

Ported TS algorithms: `preprocessing.ts`, `gray-filters.ts`, `domain/refine/` (see the `rust.yml` path list).

```bash
cargo fmt --all -- --check
cargo clippy --workspace --all-targets -- -D warnings   # needs src-tauri/frontend staged once (npm run tauri:dev does it)
cargo test -p el-core -p el-bench                       # golden_* tests: Rust vs TS fixtures
cargo build --release -p el-core && npx vitest run tests/unit/native/compute-parity.test.ts
node scripts/migration/gen-golden.mjs && git diff --stat -- crates/el-bench/fixtures   # must be empty unless the TS algorithm changed on purpose
```

Never pass a golden test by widening a tolerance or regenerating fixtures to match Rust. A tauri command or `src/platform/tauri-desktop.ts` change also needs `npm run tauri:dev` and `npx playwright test tests/e2e/tauri-desktop.spec.ts --project=chromium`.

## 4. Area e2e

First make sure no stale Vite server holds :4173 from before the build (it serves `/dist/main.js?t=...` and breaks `bootstrap-smoke`). On Windows:

```powershell
Get-NetTCPConnection -LocalPort 4173 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

Then run the specs for the touched area with `npx playwright test <spec> --project=chromium`:

| Changed | Specs |
|---|---|
| `domain/refine`, `features/refine`, `bootstrap/refine-*`, `workers/refine-worker.js` | `refine-edges` |
| `preprocessing.ts`, `gray-filters.ts`, `preprocessing-presets.ts`, preprocess panel | `segmentation-preprocessing-panel`, `refine-edges` (-g "preprocess\|presets") |
| segmentation tools, masks, overlay | `segmentation-draw`, `segmentation-preprocessing-panel`, `workflow-switching` |
| detection canvas, boxes, clipboard, arrange | `detection-bulk-operation`, `alignment-history`, `detection-clipboard`, `outside-boxes` |
| file system, autosave, label loading | `folder-switch-autosave`, `label-sources`, `label-folder-resolution`, `label-fast-load` |
| automation | `automation-workflow`, `automation-view` |
| YOLO/YOLOE inference | `inference`, `yoloe`, `yoloe-usability` |
| modals, layout, theme, toolbar | `modal-drag`, `ui-consistency`, `ux-stage1`, `ux-stage2` |
| `main.ts`, `createApp.ts`, `index.html`, `runtime.ts` | `bootstrap-smoke`, `unsupported-env`, `mobile-unsupported` |

Not sure what a file reaches? `grep -rl "<module name>" tests/e2e`. Desktop specs (`label-sources`, `label-fast-load`, `outside-boxes`, `class-remap`, ...) drive the debug exe: rebuild it with `npm run tauri:dev` first, or they test the old `dist/` (or skip when it is missing).

Failures listed under "Known failures" in `AGENTS.md` are baseline, not regressions. Anything else: rerun that spec alone once; if it still fails, check it against the base commit (see e2e-full) before blaming the change.

## 5. UI changes

Take screenshots of the changed UI in light and dark themes (theme toggle or `data-theme` on `<html>`), save them under `test-results/` and look at them. Never write to `docs/` unless the user asked to refresh doc screenshots (`UPDATE_DOC_SCREENSHOTS=1`).

## 6. Version and leftovers

- Shipped files changed (`src/`, `workers/`, `css/`, `index.html`, `crates/el-core/`, `src-tauri/`): `package.json` must be bumped and `src-tauri/tauri.yoloe.conf.json` paired (`tests/unit/release/version-pairing.test.ts` checks the pairing; the Stop hook reminds about the bump).
- `git status` again: e2e runs must not leave tracked changes (docs PNGs, fixtures). Revert anything the run produced.

## Report

List each step with pass/fail and the exact command. Name skipped steps and why. Quote failure output; do not summarise a failure as a pass.
