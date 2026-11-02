---
name: perf-baseline
description: Measure easy_labeling's TS and Rust implementations on the same scenario and inputs and append the numbers to docs/migration/BENCH.md. Use before porting a module (baseline), after porting, or when asked how much faster something got.
argument-hint: "[scenario, e.g. refine-500 | preprocess-view | review-folder | load-tiff]"
---

Scenario: $ARGUMENTS

## Rules
- No speed claim without a measurement. Take the TS baseline **before** porting.
- Same inputs on both sides: `crates/el-bench/fixtures/` (generate SEM-sized inputs with `node scripts/migration/gen-golden.mjs --bench`; they land in the git-ignored `fixtures/generated/`).
- Never time debug builds: Rust `--release` (criterion does this), TS from the built `dist/` (`npm run build`).
- Note machine load: other heavy processes skew timings (check Task Manager / `Get-Counter`), and do not run benches while e2e or builds run.

## How
- **Rust functions:** criterion benches in `crates/el-bench/benches/<scenario>.rs`, `cargo bench -p el-bench --bench <scenario>`.
- **TS functions:** `scripts/bench/<scenario>.mjs` importing `dist/` modules with the same inputs. Warm up, then 30+ runs, report median and p95.
- **In the app:** Playwright + the Tauri exe (`tests/e2e/desktop-performance.spec.ts` shows the pattern). Record the IPC-inclusive time separately from pure Rust time.
- **Memory:** peak RSS when it matters (`Get-Process` PeakWorkingSet64 on Windows).

## Record (append to `docs/migration/BENCH.md`, never delete rows)
| Date | Scenario | Input | Implementation | Median | p95 | peak RSS | Commit | Notes |

Finish with the ratio against the previous implementation (e.g. 4.2x) and one line on what the user will notice (e.g. "Processed view switch freezes 520 ms -> 110 ms").
