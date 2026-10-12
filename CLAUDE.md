# CLAUDE.md

@AGENTS.md

The shared project rules above come from `AGENTS.md` (also read by Codex). Edit shared rules there; keep this file for Claude Code specifics.

## Project skills (`.claude/skills/`)

| Skill | Use for |
|---|---|
| `easy-labeling-overview` | Orientation, composition root, app-wide shortcuts, cross-workflow changes |
| `detection-workflow` | YOLO boxes: draw/edit, classes, clipboard, arrange, undo, review checks |
| `segmentation-workflow` | Mask tools, overlay, mask formats, segmentation presets |
| `refine-edges` | Refine edge snapping: algorithm, settings and presets, Refine Lab, pane, worker |
| `image-preprocessing` | Preprocess panel pipeline, SEM/TEM filters, preprocessing presets, consumers |
| `automation-template-matching` | Template matching, layouts, batch labeling |
| `ai-preprocessing` | EdgeSAM, super-resolution ONNX models |
| `app-shell-and-file-io` | Folder I/O, class files, sample dataset, Electron shell |
| `testing-and-release` | Test structure, e2e API, build and packaging details |
| `/verify` | Pick and run the checks a change needs, and read the results correctly |
| `/e2e-full` | Full sequential e2e run with baseline comparison |

## Hooks (`.claude/settings.json`)

- `PreToolUse` on file edits: `.claude/hooks/guard-generated.mjs` denies edits under `dist/`, `vendor/`, `node_modules/`, `release/`, `test-results/`, `output/`. Change the source instead (for scratch files use the session scratchpad).
- `Stop`: `.claude/hooks/version-reminder.mjs` blocks once when shipped files changed but `package.json` kept its version. Bump per AGENTS.md "Versioning", or state why this change ships no new version.

## Working on this Windows checkout

- Long multi-line edits through Bash heredocs can break on quoting; write the script with the Write tool (into the scratchpad) and run it, or use Edit.
- Check `git status` after e2e runs: specs and builds can leave artifacts, and stale Vite servers can linger on :4173.
- Commit only when asked. End commit messages with the attribution trailer the session provides.
