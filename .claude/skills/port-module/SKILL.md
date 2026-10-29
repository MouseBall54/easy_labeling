---
name: port-module
description: Port one TS module of easy_labeling to the Rust core (crates/el-core) with golden equivalence tests, a before/after benchmark, and a Tauri-only call path. Use when the user runs /port-module or asks to move a TS algorithm to Rust.
argument-hint: "[TS file or directory]"
disable-model-invocation: true
---

Port target: $ARGUMENTS

Finish each step before starting the next. Read `docs/migration/AUDIT.md` and `DECISIONS.md` first.

## 1. Understand
- Read the module and every caller (grep). List the public API: inputs, outputs, side effects, errors.
- Hidden behaviour to pin down: rounding (`Math.round` is half-up toward +inf; see `js_round` in el-core), sort stability, NaN/empty input, out-of-image boxes, f32 vs f64 (Float32Array stores round to f32), encodings (UTF-8, BOM, CRLF).
- If el-core already has the logic (`gray.rs`, `preprocess.rs`, `refine.rs`), reuse it.

## 2. Golden data first
- Add a writer for the module to `scripts/migration/gen-golden.mjs` (it imports the built `dist/` code) and generate `crates/el-bench/fixtures/<module>/`. Cover the usual case, 500+ objects, empty input, and border cases. Keep committed fixtures small (hundreds of KB). SEM-sized bench inputs go to `fixtures/generated/` (git-ignored).
- The TS output is the answer. If Rust differs, fix Rust. If the TS code looks wrong, do not change it: record it in `DECISIONS.md` and ask the user.

## 3. Baseline
- Measure the TS path with `/perf-baseline` before writing Rust.

## 4. Rust implementation (`crates/el-core/src/<module>.rs`)
- Pure functions, no UI/Tauri dependencies. Errors as `thiserror` types or `Result<_, String>` at the command layer; no `unwrap` outside tests and the parity CLI.
- Write it plainly first (`rust-perf`), optimise only what the bench shows.
- Golden test `golden_<module>` in `crates/el-bench/tests/golden.rs`; state float tolerances next to the constant.
- Where the existing parity test covers the algorithm, extend `tests/unit/native/compute-parity.test.ts` and the `compute-cli` ops too.

## 5. Boundary
- Expose through a Tauri command in `src-tauri/src/` following `rust-ts-bridge` (raw bytes, state resident in Rust, batched calls).

## 6. Switch-over
- The TS implementation stays: the web (GitHub Pages) and Electron builds have no Rust. Pick the native path only when `window.easyLabelingNative` exists (see how `src/features/refine/refine-service.ts` picks `createNativeRefineWorker`). For new ports, also fall back to the TS path when a native call fails, so a Rust bug degrades to the old speed instead of a broken feature.

## 7. Verify and record
- `/verify` (Rust steps included), then `/perf-baseline` for the after numbers.
- Have the `rust-perf-reviewer` agent review the port; fix "high" findings.
- Update the module's row in `docs/migration/AUDIT.md`.

Report: changed files, equivalence result, before/after numbers, remaining TODOs.
