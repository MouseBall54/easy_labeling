import { defineConfig } from "vite";

export default defineConfig({
  // tsc owns dist; Vite must watch these served modules instead of ignoring its default output directory.
  build: { emptyOutDir: false },
  // src-tauri holds the Rust build (target/, many GB) and a staged copy of the frontend.
  server: { watch: { ignored: ["**/output/**", "**/test-results/**", "**/src-tauri/**"] } }
});
