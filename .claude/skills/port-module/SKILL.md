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
- Pure logic, no UI/Tauri dependencies (file I/O is fine, see `review_folder.rs`). Errors as a small enum with Display or `Result<_, String>` at the command layer; no `unwrap` outside tests and the parity CLI.
- Where the TS code relies on JS semantics, use `el_core::js` (`parse_float`, `trim`/`is_whitespace`, `number_to_string`, NaN-propagating `min`/`max`) and `js_round` in `gray.rs`; never the Rust equivalents.
- Write it plainly first (`rust-perf`), optimise only what the bench shows. Keep the plain version as a test oracle for any pruned/clever one (see `duplicate_pairs_all` in `review.rs`).
- Golden test `golden_<module>` in `crates/el-bench/tests/golden.rs`; state tolerances next to the constant (exact equality whenever the output is text or bytes). Break the code on purpose once and see the golden fail.
- For text inputs, add a `compute-cli` op and a randomized differential case in `tests/unit/native/compute-parity.test.ts`.

## 5. Boundary
- A thin command file in `src-tauri/src/<feature>.rs`, registered in `main.rs`, following `rust-ts-bridge`.
- Work over ~100 ms: `spawn_blocking` + `jobs::Job` (progress via `advance`, stop on `cancelled()`, return `jobs::CANCELLED`).
- Megabytes: `shared_buffer.rs` (`upload_body` in, `shared_buffer::post` out) with the raw path kept.
- Files the page already has handles for: pass native paths (`pathOf`), let Rust read them, instead of shipping bytes.

## 6. Switch-over
- The TS implementation stays: the web (GitHub Pages) and Electron builds have no Rust.
- Add the feature name to `NativeFeature` in `src/platform/native-bridge.ts` and call through `getNativeBridge("<feature>")` only (`sendBytes`, `receiveBytes`, `runJob`, `pathOf`).
- Fall back to the TS path on null and on any native error (a Rust bug must degrade to the old speed, not break the feature). Partial fallbacks are fine: return null per item the native side cannot decide (as `review_folder` does for images whose size needs a decode).
- Keep synchronous TS APIs synchronous when nothing native is pending (see `prepareSegmentationProcessedImage` returning null).

## 6a. Desktop e2e
- In `tests/e2e/tauri-desktop.spec.ts`, run the feature natively, then with `window.easyLabelingNativeOff = ["<feature>"]` in the same app, and compare the full results (see `reviewBothWays`). Include the awkward inputs from the golden set, a fallback case, and SEM-sized data with timings for BENCH.md.

## 7. Verify and record
- `/verify` (Rust steps included), then `/perf-baseline` for the after numbers.
- Have the `rust-perf-reviewer` agent review the port; fix "high" findings.
- Update the module's row in `docs/migration/AUDIT.md`.

Report: changed files, equivalence result, before/after numbers, remaining TODOs.
