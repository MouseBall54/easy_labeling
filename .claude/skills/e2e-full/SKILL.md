---
name: e2e-full
description: >
  Use when the user types /e2e-full or asks to run the whole easy_labeling Playwright suite (before
  a release, a merge to main, or after a broad change): kills stale Vite servers, builds, runs
  every chromium spec sequentially (about an hour), and separates real regressions from known
  baseline failures by rerunning failures against a worktree of the base commit.
---

# /e2e-full

The suite is timing-sensitive. While it runs: do not rebuild `dist/`, do not run other browser tests, do not start heavy work. Run it in the background and keep doing read-only work.

## 1. Clean start

```powershell
Get-NetTCPConnection -LocalPort 4173 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

```bash
git status --porcelain     # note what is already dirty
npm run build
```

## 2. Run

```bash
npx playwright test --project=chromium --reporter=list > test-results/e2e-full.log 2>&1
```

Run with `run_in_background` (timeout 2 h). `workers: 1` is set in `playwright.config.ts`; do not raise it.

## 3. Triage

Read the summary at the end of the log. For each failure:

1. Listed under "Known failures" in `AGENTS.md`? Baseline; note it and move on.
2. Otherwise rerun the spec alone: `npx playwright test tests/e2e/<spec> --project=chromium`. Passes alone means flaky under load; note it.
3. Still failing: compare with the base commit (usually `main`, or the commit before the change):

```bash
git worktree add ../easy_labeling-baseline <base-commit>
cmd //c mklink /J "..\\easy_labeling-baseline\\node_modules" "node_modules"
cd ../easy_labeling-baseline && npx tsc -p tsconfig.build.json && node scripts/copy-offline-assets.mjs
node ./node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4176 --strictPort   # background
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4176 npx playwright test tests/e2e/<spec> --project=chromium
```

Fails on the base too: pre-existing, not this change. Passes on the base: a regression; fix it. Afterwards stop the :4176 server and remove the worktree (`git worktree remove ../easy_labeling-baseline`; remove the junction first so the shared `node_modules` is not deleted: `cmd //c rmdir "..\\easy_labeling-baseline\\node_modules"`).

A new consistently failing baseline spec belongs in the "Known failures" list in `AGENTS.md`, with the commit it was observed on.

## 4. Leftovers

`git status --porcelain` and compare with step 1. Revert tracked files the run changed (screenshots in `docs/`, fixtures).

## Report

Passed / failed / skipped counts, then each failure classified as known baseline, flaky (passes alone), pre-existing (fails on base) or regression, with the error line.
