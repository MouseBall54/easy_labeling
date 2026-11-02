# Refine Axis Pair (Top/Bottom, Left/Right) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let Refine pick opposite edges (T+B, L+R) as a pair, preferring the combination that grows or shrinks the box along that axis, chosen by edge strength or nearness.

**Architecture:** Pure algorithm in `src/domain/refine/edge-refine.ts` gains per-side candidate lists and a pair picker used by `refineBox`; the Rust port in `crates/el-core/src/refine.rs` mirrors it and is held to it by golden fixtures. Settings gain four flat keys; the Refine Lab edits them and explains the pick.

**Tech Stack:** TypeScript (no bundler), vitest, Playwright; Rust (el-core, el-bench, compute-cli).

**Spec:** `docs/superpowers/specs/2026-10-31-refine-axis-pair-design.md`

## Global Constraints

- Pair off (the default) must give results identical to today: every existing golden fixture and unit test passes unchanged. Never widen a tolerance or regenerate existing fixtures to pass.
- TS is the reference; Rust must match it (`cargo test -p el-bench`, `tests/unit/native/compute-parity.test.ts`).
- Old `refine-settings.json` files and presets without the new keys read as pair off.
- Net span change decides the group: `(newHigh - newLow) - (oldHigh - oldLow)`; 0 belongs to whichever group is preferred.
- Empty preferred group → pick from the other group.
- First pass: preferred group + chosen pick rule. Later passes: nearest pair, no group preference.
- UI strings in English; shortcuts unchanged.
- Version: minor bump (`npm version 2.31.0 --no-git-tag-version`, `src-tauri/tauri.yoloe.conf.json` → `2.32.0`).
- Commit only when the user asks (repo rule); keep `easylabeling-rust-kit/` out of commits.

## Review Focus

1. Settings or presets saved before this feature (no pair keys) → pair off, results unchanged. (Task 1 test, Task 3 golden `default`)
2. Pair on but one side of the axis is `off` → that axis behaves exactly as pair off. (Task 2 test)
3. Every combination would make the axis shorter than `MIN_SIZE` → the axis keeps its current edges, both sides confidence 0, box flagged. (Task 2 test)
4. Neither side finds a candidate (flat image) → box unchanged and flagged weak, no throw. (Task 2 test)
5. Box touching the image border with pair grow + extreme ranges → result stays inside the image. (Task 2: extend the existing extremes test)

---

### Task 1: Pair settings keys

**Files:**
- Modify: `src/domain/refine/edge-refine.ts` (types, `RefineParams`, `DEFAULT_REFINE_PARAMS`, `normalizeRefineParams`)
- Modify: `src/domain/refine/settings.ts` only if `parseRefineSettings`/presets need it (they go through `normalizeRefineParams`; verify)
- Test: `tests/unit/domain/refine.test.ts`

**Interfaces:**
- Produces:
  - `export type RefinePairMode = "off" | "grow" | "shrink";`
  - `export type RefinePairPick = "strongest" | "nearest";`
  - `RefineParams` fields `pairTB: RefinePairMode; pairTBPick: RefinePairPick; pairLR: RefinePairMode; pairLRPick: RefinePairPick` (defaults `"off"`, `"strongest"`, `"off"`, `"strongest"`).
  - Not in `REFINE_SIDE_RULE_KEYS` (axis-level, not per side).

Also in scope (user approved the full plan, 2026-10-31): candidate ticks on the Lab profile (chosen solid, others thin), a pane-summary suffix (` · T+B grow`, ` · L+R shrink (near)`), and BENCH rows for refine-500/1000 with both pairs on (TS and Rust, existing inputs).

- [ ] **Step 1: Write the failing test** `it("reads pair settings, defaulting to off for older files and presets")`:
  - `normalizeRefineParams({})` has `pairTB: "off", pairTBPick: "strongest", pairLR: "off", pairLRPick: "strongest"`.
  - `normalizeRefineParams({ pairTB: "grow", pairLRPick: "nearest", pairLR: "bogus" })` → `pairTB "grow"`, `pairLRPick "nearest"`, `pairLR "off"`.
  - `parseRefineSettings` of a document without the keys → `resolveRefineParams(doc, "default").pairTB === "off"`; a class patch `{ pairTB: "shrink" }` resolves to `"shrink"` for that class and `"off"` for the default.
  - A preset saved with `pairLR: "grow"` and applied restores it (`saveRefinePreset` → `applyRefinePreset`).
- [ ] **Step 2: Run** `npx vitest run tests/unit/domain/refine.test.ts -t "pair settings"` — expected FAIL (properties undefined).
- [ ] **Step 3: Implement** the types, defaults and normalization (accept only the listed literals, fall back to the default).
- [ ] **Step 4: Run** `npx vitest run tests/unit/domain/refine.test.ts` and `npm run typecheck` — expected PASS (all existing refine tests too).

### Task 2: Candidates and pair pick (TS algorithm)

**Files:**
- Modify: `src/domain/refine/edge-refine.ts`
- Test: `tests/unit/domain/refine.test.ts`

**Interfaces:**
- Consumes: Task 1 types and fields.
- Produces:
  - `interface EdgeCandidate { pos: number; conf: number; strength: number }` (profile coordinates; `findEdge` already returns this shape).
  - `function findEdgeCandidates(raw, P, crit, out, c, sign, context, step, near, max: number): EdgeCandidate[]`, ranked best first. `findEdge` becomes `findEdgeCandidates(..., 1)[0] ?? null` and must return exactly what it returns today.
  - `interface SideCandidate { value: number; conf: number; strength: number }` (image coordinates, like `searchRange`'s result).
  - `function sideCandidates(img, w: SideWindow, crit, p: RefineParams, sign, context): SideCandidate[]`, strongest first, at most `PAIR_CANDIDATES = 5`.
  - `export function pickAxisPair(low: readonly SideCandidate[], high: readonly SideCandidate[], current: readonly [number, number], prefer: "grow" | "shrink" | null, pick: RefinePairPick): { low: SideCandidate | null; high: SideCandidate | null; group: "grow" | "shrink" | null; fallback: boolean }` — `low` is L/T (x0/y0), `high` is R/B (x1/y1).

Candidate rules (decisions the tests do not fully pin):
- Per segment, up to 5 candidates: `grad` local maxima of the weighted gradient; `peak`/`flank` each local brightness maximum, positioned as today; `thr` every 50%-level crossing with the right sign. Rank `grad`/`peak`/`flank` by weighted score, `thr` by distance to `c`.
- A candidate's `strength = snr * score / bestScore` (`thr`: `snr`), then the existing ×0.3 search-limit penalty; `conf = clamp((strength - 3) / 12, 0, 1)` with the same penalty. The top candidate therefore equals today's `findEdge`.
- `sideCandidates`: pool all segments' candidates over the whole window (also when `partMode` is `strongest`), sort by position, cluster neighbours within `max(2, gradStep)` samples. Per cluster: position by the side's `comb` rule over member positions, `conf`/`strength` = median of members × (segments represented / segments). Drop clusters under half the best cluster's `conf`, keep the 5 strongest.
- `pickAxisPair`: candidates include "no move" only if found as a candidate. Missing side (empty list) → that side `null`; the other side alone is chosen by `pick` (no group test). Combinations with `high - low < MIN_SIZE` are dropped; if none remain both are `null`. Group by net span change (0 in the preferred group); `prefer === null` → all combinations in one group. `strongest`: max of `min(low.strength, high.strength)`, tie → nearest; `nearest`: min of `|Δlow| + |Δhigh|`, tie → strongest; still tied → first generated (low index, then high index).
- `refineBox`: for an axis whose pair mode is not `off` and whose two sides are both not `off`, replace the two `refineSide` calls with `sideCandidates` for each side + `pickAxisPair(..., iteration === 0 ? mode : null, iteration === 0 ? pick : "nearest")`. A `null` side keeps its edge with confidence 0. All other behaviour (clamping, `MIN_SIZE` break, convergence, flags) stays as is.

- [ ] **Step 1: Write the failing tests** (synthetic images via `paint` or hand-filled `gray` like the nearWeight test):
  - `it("classifies a pair by its net span change")`: `pickAxisPair([{value: 7, ...}], [{value: 45, ...}], [10, 50], "grow", "strongest")` with only that combination → `group: "shrink", fallback: true` (top +3 out, bottom −5 in = −2).
  - `it("prefers the requested group, then the pick rule")`: vertical profile with two edges above (y=6 strong, y=9 weak) and two below (y=48 weak, y=55 strong), box 10..50: `pairTB "grow"` + `strongest` → y0≈6, y1≈55; `pairTB "shrink"` + `nearest` → the nearest shrinking pair; assert exact expected edges within 0.5 px.
  - `it("falls back to the other group when the preferred one is empty")`: only shrinking combinations exist; `pairTB "grow"` returns the shrink pick and `describeRefineSide(...).pair.fallback === true` (diagnostics come in Task 4; here assert the box).
  - `it("refines a paired axis by nearness after the first pass")`: `iterations: 3`, `pairTB "grow"`; result equals the `iterations: 1` result within 0.5 px (no ratchet outward).
  - `it("ignores the pair when a side of the axis is off")`: `sides: { T: "off" }`, `pairTB "grow"` → identical result to `pairTB "off"`.
  - `it("keeps the axis when every pair is too small or nothing is found")`: flat image and a pair whose combos are all `< MIN_SIZE` → box edges unchanged on that axis, `sideConf.T === 0 && sideConf.B === 0`, `flagged === true`.
  - Extend `it("keeps a valid box inside the image for every extreme parameter on every side")` with `pairTB: "grow", pairLR: "grow"` and `pairTB: "shrink", pairLRPick: "nearest"` variants.
- [ ] **Step 2: Run** `npx vitest run tests/unit/domain/refine.test.ts` — expected FAIL on the new tests only.
- [ ] **Step 3: Implement** the interfaces above.
- [ ] **Step 4: Run** `npx vitest run tests/unit/domain/refine.test.ts` — expected PASS, all old tests included. Then `npm run build && node scripts/migration/gen-golden.mjs && git diff --stat -- crates/el-bench/fixtures` — expected: no change (pair off is identical).

### Task 3: Rust port and parity

**Files:**
- Modify: `crates/el-core/src/refine.rs`
- Modify: `scripts/migration/gen-golden.mjs` (refine `variants`)
- Modify: `tests/unit/native/compute-parity.test.ts` (`paramVariants`)
- Generated: `crates/el-bench/fixtures/refine/*` (new cases only)

**Interfaces:**
- Consumes: Task 2 behaviour (TS is the reference).
- Produces: `RefineParams` fields `pair_tb`, `pair_tb_pick`, `pair_lr`, `pair_lr_pick: String` with `#[serde(rename = "pairTB")]` etc. (camelCase would give `pairTb`) and `#[serde(default = ...)]` returning `"off"` / `"strongest"`; Rust functions `find_edge_candidates`, `side_candidates`, `pick_axis_pair` mirroring Task 2 (`find_edge` = first candidate).

- [ ] **Step 1: Add golden variants** to `gen-golden.mjs` and the same objects to `paramVariants`:
  - `"pair-grow": { pairTB: "grow", pairLR: "grow" }`
  - `"pair-shrink-near": { pairTB: "shrink", pairTBPick: "nearest", pairLR: "shrink", pairLRPick: "nearest" }`
  - `"pair-mixed": { pairTB: "grow", pairLR: "shrink", pairLRPick: "nearest", iterations: 3 }`
  - `"pair-side-off": { pairTB: "grow", sides: { T: "off" } }`
  - `"pair-strongest-parts": { pairLR: "grow", scanSpan: "boxOutside", extendStart: 8, extendEnd: 12, partMode: "strongest", crit: "thr" }`
- [ ] **Step 2: Regenerate** `npm run build && node scripts/migration/gen-golden.mjs`; `git diff --stat -- crates/el-bench/fixtures` shows only the new cases.
- [ ] **Step 3: Run** `cargo test -p el-bench golden_refine` — expected FAIL on the pair cases.
- [ ] **Step 4: Implement** the Rust port (reuse `js.rs` helpers where TS relies on JS semantics).
- [ ] **Step 5: Run** `cargo fmt --all -- --check`, `cargo clippy --workspace --all-targets -- -D warnings`, `cargo test -p el-core -p el-bench`, `cargo build --release -p el-core && npx vitest run tests/unit/native/compute-parity.test.ts` — expected all PASS.

### Task 4: Refine Lab fields and readout

**Files:**
- Modify: `src/domain/refine/edge-refine.ts` (`RefineSideDiagnostics`, `describeRefineSide`)
- Modify: `src/bootstrap/refine-editor.ts` (`FIELDS`)
- Modify: `src/bootstrap/refine-lab.ts` (readout sentence)
- Test: `tests/unit/domain/refine.test.ts`, `tests/e2e/refine-edges.spec.ts`

**Interfaces:**
- Consumes: Task 2 `sideCandidates`, `pickAxisPair`.
- Produces: `RefineSideDiagnostics.pair?: { axis: "TB" | "LR"; prefer: "grow" | "shrink"; pick: RefinePairPick; group: "grow" | "shrink" | null; fallback: boolean; candidates: number[]; chosen: number | null; spanChange: number }` — set by `describeRefineSide` when the side's axis pair applies (first-pass pick on the given box); `candidates` are this side's candidate positions in image coordinates.

- [ ] **Step 1: Failing unit test** in the Task 2 fallback test: `describeRefineSide(img, box, "T", params).pair` has `axis "TB"`, `fallback true`, `group "shrink"`, `chosen` equal to the refined `y0` within 0.5, `candidates.length >= 2`; with `pairTB "off"` `pair` is `undefined`.
- [ ] **Step 2: Implement** the diagnostics.
- [ ] **Step 3: Editor fields** in group `"rule"`, not `perSide`, after `nearWeight`:
  - `pairTB` "Top + bottom as a pair", options `[["off","Off"],["grow","Prefer growing"],["shrink","Prefer shrinking"]]`
  - `pairTBPick` "Top + bottom pick", options `[["strongest","Clearest edges"],["nearest","Nearest to the box"]]`, disabled while `pairTB` is `off`
  - `pairLR` / `pairLRPick` the same for "Left + right".
  - Title for the pair selects: "Searches several edges on both sides and judges the pair by the change in box height (width): growing or shrinking. Falls back to the other kind when none is found. Later iterations keep the nearest pair."
- [ ] **Step 4: Lab readout** — when the active side's diagnostics carry `pair`, add the sentence `Top + bottom pair: prefer growing, clearest of N growing pairs (+4 px)`; on fallback `no growing pair, used the clearest shrinking one`.
- [ ] **Step 5: e2e** — in `refine-edges.spec.ts`, a test that opens the Lab on the synthetic SEM dataset, sets "Top + bottom as a pair" to "Prefer growing", saves and refines, and asserts through `window.__easyLabelingTestApi` that the box height did not shrink and the Lab readout contains "Top + bottom pair".
- [ ] **Step 6: Run** `npm run typecheck`, `npm run test:unit`, `npm run build`, `npx playwright test tests/e2e/refine-edges.spec.ts --project=chromium` — expected PASS. Screenshot the Lab Edges section with the new selects in light and dark themes into `test-results/` and check them.

### Task 5: Desktop check, docs and version

**Files:**
- Modify: `.claude/skills/refine-edges/SKILL.md`, `package.json`, `package-lock.json`, `src-tauri/tauri.yoloe.conf.json`

- [ ] **Step 1:** `npm run tauri:dev`, then add a pair-on case to the native/TS refine comparison in `tests/e2e/tauri-desktop.spec.ts` (same boxes, `easyLabelingNativeOff = ["refine"]` vs native, results equal within the existing refine tolerance). Run `npx playwright test tests/e2e/tauri-desktop.spec.ts --project=chromium` — PASS.
- [ ] **Step 2:** Add the pair option to the refine-edges skill's Algorithm and Settings sections (keys, candidate rule, first-pass/later-pass rule).
- [ ] **Step 3:** `npm version 2.31.0 --no-git-tag-version`; set `src-tauri/tauri.yoloe.conf.json` version `2.32.0`; `npx vitest run tests/unit/release/version-pairing.test.ts` — PASS.
- [ ] **Step 4:** Final `/verify` (Rust section included) and `git status` clean of test artifacts.
