# UI/UX improvement work

- Before continuing UI/UX work, read `docs/UI_UX_PROGRESS_KO.md` and the linked audit.
- Follow the next unfinished stage; preserve Detection/Segmentation, light/dark themes, source labels, and existing preset formats.
- Record each audit ID's status, verification, and remaining work in the progress document. Mark an item complete only after its acceptance checks pass.
- Keep changes and commits grouped by verified stage. Keep build outputs, app profiles, and copied datasets out of commits.
- Build before starting a verification server. Restart Vite after rebuilding compiled `dist` files; its cached modules can serve an older build. Verify the served code before accepting results.
- Update progress links in README when their location changes.
