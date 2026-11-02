---
name: rust-perf
description: Rust performance patterns for easy_labeling's image and labeling code (crates/el-core, src-tauri). Use when writing or optimising Rust there.
user-invocable: false
---

# Rust performance patterns

Correct first, then measure (`perf-baseline`), then optimise only the measured hot spot. No `unsafe` or SIMD without a measured reason and a comment.

## Build profile (root `Cargo.toml`)
- Keep **thin LTO** (`lto = "thin"`, `opt-level = 3`): fat LTO with one codegen unit needed >1.2 GB per rustc and ~25 min per installer (DECISIONS D-000d).
- Debug desktop builds optimise dependencies and el-core (`profile.dev.package`), because the e2e specs time the debug exe.
- `target-cpu=native` only for local benches, never for shipped builds.

## Pixels
- SEM/TEM data is 8-bit gray: keep `u8`/`f32` single channel, do not inflate to RGBA.
- Match the TS arithmetic exactly where the output is compared: same f32/f64 mix, `js_round` for `Math.round`, same clamp order (see `gray.rs`).
- Row loops: iterate `chunks_exact`/`par_chunks_mut` instead of indexing; rayon over rows or boxes, not per pixel.
- Image decoding (TIFF): the `tiff` crate, decode straight to gray `u8`.

## Boxes
- Refine and review are independent per box/image: `par_iter`, share params by reference.
- Review pairs are O(n^2) today; any pruning must keep exact parity on dense overlaps (see docs/LABEL_LOADING_FAST_PATH_KO.md).

## Allocation
- Reuse buffers in hot loops (`for_each_init`, `Vec::with_capacity` + `clear`); avoid `clone`/`to_vec`/`format!` per item.

## Profiling
- Windows: `samply record cargo bench ...` or the VS profiler. Note findings in `docs/migration/BENCH.md`.
